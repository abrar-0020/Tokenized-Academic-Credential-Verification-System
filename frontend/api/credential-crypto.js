// Serverless AES-256-GCM Metadata Encryption & Decryption Service
// Ensures zero PII or plain academic claims (name, enrollment ID, degree, grade, field, institution)
// are stored in public IPFS JSON payloads. Keys stay strictly server-side.

import crypto from 'crypto';
import { ethers } from 'ethers';

const MASTER_KEY_RAW =
  process.env.CREDENTIAL_MASTER_KEY ||
  process.env.ENCRYPTION_SECRET ||
  process.env.PRIVATE_KEY ||
  'tokcred-aes256-gcm-master-key-security-seed-2026';

const MASTER_KEY = crypto.createHash('sha256').update(MASTER_KEY_RAW).digest();

const DEFAULT_RPC_URL =
  process.env.SEPOLIA_RPC_URL ||
  process.env.VITE_PUBLIC_RPC_URL ||
  'https://ethereum-sepolia-rpc.publicnode.com';

const DEFAULT_CONTRACT_ADDRESS =
  process.env.CONTRACT_ADDRESS ||
  process.env.VITE_CONTRACT_ADDRESS ||
  '0xE8cb94E530Ee82c0EEbDB2FB092Bd32eDDD1dab1';

const CONTRACT_AUTH_ABI = [
  'function ownerOf(uint256 tokenId) public view returns (address)',
  'function hasRole(bytes32 role, address account) public view returns (bool)',
  'function ISSUER_ROLE() public view returns (bytes32)',
  'function DEFAULT_ADMIN_ROLE() public view returns (bytes32)',
];

// Anti-replay nonce store persisted on globalThis across warm serverless / Vite middleware reloads
const usedNonces = globalThis.__tokcredUsedNonces || (globalThis.__tokcredUsedNonces = new Map());

function cleanupExpiredNonces() {
  const now = Date.now();
  const maxRetention = 10 * 60 * 1000;
  for (const [nonce, ts] of usedNonces.entries()) {
    if (now - ts > maxRetention) {
      usedNonces.delete(nonce);
    }
  }
}

export function canonicalizeObject(obj) {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map((item) => canonicalizeObject(item)).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  return '{' + keys.map((k) => `${JSON.stringify(k)}:${canonicalizeObject(obj[k])}`).join(',') + '}';
}

/**
 * Derive credential-specific 256-bit AES key bound to Credential ID + Holder Wallet
 */
export function deriveCredentialKey(credentialId, studentAddress) {
  const context = `TOKCRED_AES_256_GCM:${String(credentialId || '').trim().toLowerCase()}:${String(studentAddress || '').trim().toLowerCase()}`;
  return crypto.createHmac('sha256', MASTER_KEY).update(context).digest();
}

/**
 * Encrypt sensitive credential payload using AES-256-GCM (12-byte IV, 16-byte AEAD tag)
 */
export function encryptSensitiveData({ sensitiveData, credentialId, studentAddress, payloadHash }) {
  const key = deriveCredentialKey(credentialId, studentAddress);
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = canonicalizeObject(sensitiveData);
  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');

  const tag = cipher.getAuthTag().toString('hex');

  return {
    algorithm: 'AES-256-GCM',
    version: '2',
    iv: iv.toString('hex'),
    tag,
    ciphertext,
    payloadHash: payloadHash || ethers.keccak256(ethers.toUtf8Bytes(plaintext)),
    keyFingerprint: crypto.createHash('sha256').update(key).digest('hex').substring(0, 16),
  };
}

/**
 * Build a privacy-preserving public IPFS v2 envelope containing zero plaintext PII/academic claims.
 */
export function buildPublicEncryptedEnvelope({ sensitiveData, credentialId, studentAddress }) {
  if (!credentialId || typeof credentialId !== 'string' || !credentialId.trim()) {
    throw new Error('Unique credentialId is required');
  }
  if (!studentAddress || !ethers.isAddress(studentAddress)) {
    throw new Error('Valid holder wallet address (studentAddress) is required');
  }

  const normalizedHolder = ethers.getAddress(studentAddress);
  const cleanCredentialId = credentialId.trim();

  const confidentialPayload = {
    schema: 'tokcred-credential-v2',
    credentialId: cleanCredentialId,
    holderWallet: normalizedHolder,
    studentName: String(sensitiveData?.studentName || '').trim(),
    enrollmentNumber: String(sensitiveData?.enrollmentNumber || '').trim(),
    institution: String(sensitiveData?.institution || '').trim(),
    degree: String(sensitiveData?.degree || '').trim(),
    branch: String(sensitiveData?.branch || sensitiveData?.fieldOfStudy || '').trim(),
    fieldOfStudy: String(sensitiveData?.fieldOfStudy || sensitiveData?.branch || '').trim(),
    grade: String(sensitiveData?.grade || '').trim(),
    issueDate: String(sensitiveData?.issueDate || '').trim(),
    description: String(sensitiveData?.description || '').trim(),
  };

  if (!confidentialPayload.studentName) {
    throw new Error('Student legal name is required');
  }
  if (!confidentialPayload.enrollmentNumber) {
    throw new Error('Student enrollment/registration number is required');
  }
  if (!confidentialPayload.degree || !confidentialPayload.institution) {
    throw new Error('Degree and issuing institution are required');
  }

  const canonicalPlaintext = canonicalizeObject(confidentialPayload);
  const payloadHash = ethers.keccak256(ethers.toUtf8Bytes(canonicalPlaintext));

  const encrypted = encryptSensitiveData({
    sensitiveData: confidentialPayload,
    credentialId: cleanCredentialId,
    studentAddress: normalizedHolder,
    payloadHash,
  });

  // Public IPFS metadata must NEVER expose name, enrollmentNumber, degree, grade, field, or institution
  return {
    schema: 'tokcred-credential-v2',
    name: 'TokCred Confidential Academic Credential',
    description:
      'Privacy-preserving Soulbound academic credential. Holder identity, institutional record, degree, field, and grade are encrypted via AES-256-GCM.',
    credentialId: cleanCredentialId,
    holder: normalizedHolder,
    tokenStandard: 'ERC-721-Soulbound',
    isEncrypted: true,
    encryptionStandard: 'AES-256-GCM',
    encryptedData: encrypted,
    attributes: [
      { trait_type: 'Schema', value: 'tokcred-credential-v2' },
      { trait_type: 'Token Standard', value: 'ERC-721 Soulbound' },
      { trait_type: 'Confidentiality', value: 'AES-256-GCM Encrypted' },
      { trait_type: 'Credential ID', value: cleanCredentialId },
    ],
  };
}

/**
 * Decrypt and verify wallet/ID binding & payload integrity
 */
export function decryptSensitiveData({ encryptedPayload, credentialId, studentAddress }) {
  const { iv, tag, ciphertext, payloadHash } = encryptedPayload || {};
  if (!iv || !tag || !ciphertext) {
    throw new Error('Invalid encrypted payload structure: missing iv, tag, or ciphertext');
  }

  const normalizedStudent = ethers.getAddress(studentAddress);
  const key = deriveCredentialKey(credentialId, normalizedStudent);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(tag, 'hex'));

  let decryptedText = decipher.update(ciphertext, 'hex', 'utf8');
  decryptedText += decipher.final('utf8');

  const parsed = JSON.parse(decryptedText);

  if (parsed.holderWallet && parsed.holderWallet.toLowerCase() !== normalizedStudent.toLowerCase()) {
    throw new Error('Credential holder wallet binding mismatch');
  }
  if (parsed.credentialId && credentialId && parsed.credentialId !== credentialId) {
    throw new Error('Credential ID binding mismatch');
  }
  if (payloadHash) {
    const computedHash = ethers.keccak256(ethers.toUtf8Bytes(canonicalizeObject(parsed)));
    if (computedHash.toLowerCase() !== payloadHash.toLowerCase()) {
      throw new Error('Decrypted payload hash verification failed');
    }
  }

  return parsed;
}

/**
 * Verify on-chain role (ISSUER_ROLE / DEFAULT_ADMIN_ROLE) or token ownership when RPC is reachable.
 */
async function checkOnChainRoleOrOwner({ signerAddress, tokenId, rpcUrl, contractAddress }) {
  const targetRpc = rpcUrl || DEFAULT_RPC_URL;
  const targetContract = contractAddress || DEFAULT_CONTRACT_ADDRESS;
  if (!targetRpc || !targetContract || !ethers.isAddress(targetContract)) {
    return { checked: false, isIssuerOrAdmin: false, owner: null };
  }

  try {
    const provider = new ethers.JsonRpcProvider(targetRpc);
    const contract = new ethers.Contract(targetContract, CONTRACT_AUTH_ABI, provider);

    const [issuerRole, adminRole] = await Promise.all([
      contract.ISSUER_ROLE(),
      contract.DEFAULT_ADMIN_ROLE(),
    ]);

    const [hasIssuer, hasAdmin, tokenOwner] = await Promise.all([
      contract.hasRole(issuerRole, signerAddress),
      contract.hasRole(adminRole, signerAddress),
      tokenId !== undefined && tokenId !== null && tokenId !== ''
        ? contract.ownerOf(tokenId).catch(() => null)
        : Promise.resolve(null),
    ]);

    return {
      checked: true,
      isIssuerOrAdmin: Boolean(hasIssuer || hasAdmin),
      owner: tokenOwner,
    };
  } catch {
    return { checked: false, isIssuerOrAdmin: false, owner: null };
  }
}

/**
 * Verify Web3 EIP-191 signature with anti-replay nonce & timestamp window.
 */
export async function verifySignatureRequest({
  account,
  signature,
  message,
  timestamp,
  nonce,
  skipNonceRecord = false,
}) {
  if (!signature || !message) {
    return { valid: false, reason: 'Missing cryptographic signature or message' };
  }

  if (!nonce || typeof nonce !== 'string' || nonce.length < 8) {
    return { valid: false, reason: 'Missing or invalid cryptographic nonce for replay protection' };
  }

  cleanupExpiredNonces();
  if (usedNonces.has(nonce)) {
    return { valid: false, reason: 'Replay attack detected: Nonce has already been consumed' };
  }

  if (!message.includes(nonce)) {
    return { valid: false, reason: 'Signed message does not bind the declared nonce' };
  }

  if (!timestamp) {
    return { valid: false, reason: 'Missing timestamp' };
  }
  const now = Date.now();
  const requestTime = Number(timestamp);
  if (Number.isNaN(requestTime)) {
    return { valid: false, reason: 'Invalid timestamp format' };
  }
  if (now - requestTime > 5 * 60 * 1000) {
    return { valid: false, reason: 'Authorization signature expired (>5 minutes). Please sign again.' };
  }
  if (requestTime - now > 60 * 1000) {
    return { valid: false, reason: 'Timestamp from the future is not permitted.' };
  }

  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (account && ethers.isAddress(account)) {
      if (recoveredAddress.toLowerCase() !== account.toLowerCase()) {
        return {
          valid: false,
          reason: `Recovered signer ${recoveredAddress} does not match declared account ${account}`,
        };
      }
    }

    if (!skipNonceRecord) {
      usedNonces.set(nonce, now);
    }
    return { valid: true, recoveredAddress };
  } catch (err) {
    return { valid: false, reason: `Invalid signature: ${err.message}` };
  }
}

/**
 * Verify single-credential decryption authorization (Holder wallet or On-Chain Issuer/Admin)
 */
export async function verifyWalletAuthorization({
  studentAddress,
  account,
  signature,
  message,
  timestamp,
  nonce,
  tokenId,
  rpcUrl,
  contractAddress,
  onChainAuthChecker,
}) {
  const sigCheck = await verifySignatureRequest({
    account,
    signature,
    message,
    timestamp,
    nonce,
    skipNonceRecord: true,
  });

  if (!sigCheck.valid) {
    return { authorized: false, reason: sigCheck.reason };
  }

  const recoveredAddress = sigCheck.recoveredAddress;
  const normalizedRecovered = recoveredAddress.toLowerCase();
  const normalizedStudent = studentAddress && ethers.isAddress(studentAddress)
    ? studentAddress.toLowerCase()
    : '';

  const checker = onChainAuthChecker || checkOnChainRoleOrOwner;
  const isDeclaredStudent = Boolean(normalizedStudent && normalizedRecovered === normalizedStudent);

  if (isDeclaredStudent) {
    if (tokenId !== undefined && tokenId !== null && tokenId !== '') {
      const chainState = await checker({ signerAddress: recoveredAddress, tokenId, rpcUrl, contractAddress });
      if (chainState.checked && chainState.owner && chainState.owner.toLowerCase() !== normalizedStudent) {
        return {
          authorized: false,
          reason: `On-chain Soulbound owner ${chainState.owner} does not match student ${studentAddress}`,
        };
      }
    }
    usedNonces.set(nonce, Date.now());
    return { authorized: true, recoveredAddress, role: 'holder' };
  }

  const chainState = await checker({ signerAddress: recoveredAddress, tokenId, rpcUrl, contractAddress });
  if (chainState.checked && chainState.isIssuerOrAdmin) {
    usedNonces.set(nonce, Date.now());
    return { authorized: true, recoveredAddress, role: 'issuer' };
  }

  return {
    authorized: false,
    reason: `Signer ${recoveredAddress} is neither the Soulbound credential holder (${studentAddress}) nor an authorized on-chain issuer`,
  };
}

/**
 * Serverless / Express / Vite handler
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action } = req.query || {};

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};

    if (action === 'encrypt') {
      const { sensitiveData, credentialId, studentAddress } = body;
      if (!sensitiveData || !studentAddress || !credentialId) {
        return res.status(400).json({ error: 'Missing sensitiveData, credentialId, or studentAddress' });
      }

      const envelope = buildPublicEncryptedEnvelope({ sensitiveData, credentialId, studentAddress });
      const canonicalEnvelope = canonicalizeObject(envelope);
      const integrityHash = ethers.keccak256(ethers.toUtf8Bytes(canonicalEnvelope));

      return res.status(200).json({
        success: true,
        encryptedMetadata: envelope,
        integrityHash,
      });
    }

    if (action === 'decrypt') {
      const {
        encryptedPayload,
        credentialId,
        studentAddress,
        tokenId,
        account,
        signature,
        message,
        timestamp,
        nonce,
        rpcUrl,
        contractAddress,
      } = body;

      if (!encryptedPayload || !studentAddress || !credentialId) {
        return res.status(400).json({ error: 'Missing encryptedPayload, credentialId, or studentAddress' });
      }

      const auth = await verifyWalletAuthorization({
        studentAddress,
        account,
        signature,
        message,
        timestamp,
        nonce,
        tokenId,
        rpcUrl,
        contractAddress,
      });

      if (!auth.authorized) {
        return res.status(403).json({ error: 'Unauthorized decryption request', details: auth.reason });
      }

      const decrypted = decryptSensitiveData({ encryptedPayload, credentialId, studentAddress });
      return res.status(200).json({
        success: true,
        authorizedSigner: auth.recoveredAddress,
        role: auth.role,
        decryptedData: decrypted,
      });
    }

    if (action === 'decrypt-batch') {
      const { items, account, signature, message, timestamp, nonce, rpcUrl, contractAddress } = body;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Missing items array for batch decryption' });
      }
      if (items.length > 100) {
        return res.status(400).json({ error: 'Batch decryption limited to 100 credentials per request' });
      }

      const sigCheck = await verifySignatureRequest({
        account,
        signature,
        message,
        timestamp,
        nonce,
        skipNonceRecord: true,
      });

      if (!sigCheck.valid) {
        return res.status(403).json({ error: 'Unauthorized batch decryption request', details: sigCheck.reason });
      }

      const recoveredAddress = sigCheck.recoveredAddress;
      const chainState = await checkOnChainRoleOrOwner({
        signerAddress: recoveredAddress,
        rpcUrl,
        contractAddress,
      });

      const isGlobalIssuer = Boolean(chainState.checked && chainState.isIssuerOrAdmin);
      const decryptedItems = {};
      let authorizedCount = 0;

      for (const item of items) {
        const { tokenId, credentialId, studentAddress, encryptedPayload } = item || {};
        if (!encryptedPayload || !credentialId || !studentAddress) continue;

        const isHolder = recoveredAddress.toLowerCase() === studentAddress.toLowerCase();
        if (!isHolder && !isGlobalIssuer) {
          continue;
        }

        try {
          const decrypted = decryptSensitiveData({ encryptedPayload, credentialId, studentAddress });
          decryptedItems[String(tokenId ?? credentialId)] = decrypted;
          authorizedCount++;
        } catch {
          // Skip items that fail AEAD/binding checks
        }
      }

      if (authorizedCount === 0 && !isGlobalIssuer) {
        return res.status(403).json({
          error: 'Unauthorized batch decryption request',
          details: `Signer ${recoveredAddress} is not authorized to decrypt any of the requested credentials`,
        });
      }

      usedNonces.set(nonce, Date.now());
      return res.status(200).json({
        success: true,
        authorizedSigner: recoveredAddress,
        decryptedItems,
      });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (err) {
    console.error('Crypto service error:', err);
    return res.status(500).json({ error: 'Cryptographic operation failed', details: err.message });
  }
}
