import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, IPFS_GATEWAY, CONTRACT_CONFIG_ERROR } from './config/contract';

const PUBLIC_FALLBACK_RPC =
  import.meta.env.VITE_PUBLIC_RPC_URL ||
  'https://ethereum-sepolia-rpc.publicnode.com';

const SENSITIVE_PLAINTEXT_FIELDS = [
  'studentName',
  'enrollmentNumber',
  'degree',
  'grade',
  'branch',
  'fieldOfStudy',
  'field',
  'institution',
];

/**
 * Convert IPFS URI to HTTP gateway URL.
 */
export const ipfsToHttp = (uri) => {
  if (!uri) return '';
  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', IPFS_GATEWAY);
  }
  return uri;
};

/**
 * Canonical JSON serialization for deterministic hashing
 */
export const canonicalizeJson = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map((item) => canonicalizeJson(item)).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  return '{' + keys.map((k) => `${JSON.stringify(k)}:${canonicalizeJson(obj[k])}`).join(',') + '}';
};

export const calculateMetadataHash = (obj) => {
  return ethers.keccak256(ethers.toUtf8Bytes(canonicalizeJson(obj)));
};

const randomHexToken = (byteLength = 4) => {
  if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
    throw new Error('Web Crypto API is required for cryptographic randomness.');
  }
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
};

/**
 * Generate a unique, collision-resistant Credential ID (e.g. TC-2026-A7C91E04)
 */
export const generateUniqueCredentialId = () => {
  const year = new Date().getFullYear();
  return `TC-${year}-${randomHexToken(4)}`;
};

/**
 * Fetch metadata from IPFS with fallbacks (localStorage, sessionStorage, public gateways).
 */
export const fetchMetadata = async (uri) => {
  try {
    if (!uri) {
      throw new Error('Missing metadata URI');
    }

    if (uri.startsWith('ipfs://')) {
      const hash = uri.replace('ipfs://', '');
      const storageKey = `ipfs_metadata_${hash}`;

      try {
        const localData = localStorage.getItem(storageKey);
        if (localData) {
          return JSON.parse(localData);
        }
      } catch {
        // Ignore storage restrictions
      }

      try {
        const sessionData = sessionStorage.getItem(storageKey);
        if (sessionData) {
          return JSON.parse(sessionData);
        }
      } catch {
        // Ignore storage restrictions
      }
    }

    const url = ipfsToHttp(uri);
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (response.ok) {
        const data = await response.json();

        if (uri.startsWith('ipfs://')) {
          const hash = uri.replace('ipfs://', '');
          try {
            sessionStorage.setItem(`ipfs_metadata_${hash}`, JSON.stringify(data));
          } catch {
            // Ignore storage errors
          }
        }
        return data;
      }
    } catch (primaryError) {
      console.warn('Primary IPFS gateway failed, trying alternative...', primaryError);

      if (uri.startsWith('ipfs://')) {
        const hash = uri.replace('ipfs://', '');
        const altUrl = `https://ipfs.io/ipfs/${hash}`;

        try {
          const response = await fetch(altUrl, { signal: AbortSignal.timeout(10000) });
          if (response.ok) {
            const data = await response.json();
            try {
              sessionStorage.setItem(`ipfs_metadata_${hash}`, JSON.stringify(data));
            } catch {
              // Ignore storage errors
            }
            return data;
          }
        } catch {
          console.warn('Alternative IPFS gateway also failed');
        }
      }
    }

    throw new Error('Failed to fetch metadata from IPFS');
  } catch (error) {
    console.warn('Metadata fetch failed:', error);
    return {
      unavailable: true,
      description: 'Credential metadata unavailable from IPFS gateways',
    };
  }
};

/**
 * Assert that a metadata envelope contains zero plaintext academic/PII fields before pinning to public IPFS.
 */
export const assertNoPlaintextLeak = (envelope) => {
  if (!envelope || !envelope.isEncrypted || !envelope.encryptedData?.ciphertext) {
    throw new Error('Privacy guard blocked upload: metadata must be AES-256-GCM encrypted before IPFS storage.');
  }

  for (const field of SENSITIVE_PLAINTEXT_FIELDS) {
    const val = envelope[field];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      throw new Error(`Privacy guard blocked upload: plaintext field "${field}" cannot be uploaded to public IPFS.`);
    }
  }
};

/**
 * Encrypt sensitive credential fields server-side via AES-256-GCM before IPFS storage.
 * Never falls back to uploading plaintext metadata.
 */
export const encryptCredentialMetadata = async ({ formData, studentAddress, credentialId }) => {
  if (!studentAddress || !ethers.isAddress(studentAddress)) {
    throw new Error('Valid student wallet address is required to bind credential ownership.');
  }

  const normalizedHolder = ethers.getAddress(studentAddress);
  const cleanCredentialId = String(credentialId || formData.credentialId || generateUniqueCredentialId()).trim();
  const branchValue = String(formData.branch || formData.fieldOfStudy || '').trim();

  const sensitiveData = {
    credentialId: cleanCredentialId,
    holderWallet: normalizedHolder,
    studentName: String(formData.studentName || '').trim(),
    enrollmentNumber: String(formData.enrollmentNumber || '').trim(),
    institution: String(formData.institution || '').trim(),
    degree: String(formData.degree || '').trim(),
    branch: branchValue,
    fieldOfStudy: branchValue,
    grade: String(formData.grade || '').trim(),
    issueDate: String(formData.issueDate || formData.completionDate || '').trim(),
    description: String(formData.description || '').trim(),
  };

  if (!sensitiveData.studentName || !sensitiveData.enrollmentNumber) {
    throw new Error('Student legal name and enrollment/registration number are required.');
  }
  if (!sensitiveData.degree || !sensitiveData.institution) {
    throw new Error('Degree and issuing institution are required.');
  }

  const response = await fetch('/api/credential-crypto?action=encrypt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sensitiveData,
      credentialId: cleanCredentialId,
      studentAddress: normalizedHolder,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.encryptedMetadata) {
    throw new Error(
      payload?.details ||
      payload?.error ||
      `Encryption service failed (HTTP ${response.status}). Plaintext IPFS fallback is disabled.`
    );
  }

  assertNoPlaintextLeak(payload.encryptedMetadata);

  return {
    encryptedEnvelope: payload.encryptedMetadata,
    decryptedMetadata: sensitiveData,
    credentialId: cleanCredentialId,
    integrityHash: payload.integrityHash,
  };
};

/**
 * Request wallet-authorized decryption for a single credential (Holder or Authorized Issuer).
 */
export const decryptCredentialPayload = async ({
  encryptedPayload,
  credentialId,
  tokenId,
  studentAddress,
  account,
  signer,
  rpcUrl = PUBLIC_FALLBACK_RPC,
}) => {
  if (!signer || !account) {
    throw new Error('Connect an authorized holder or issuer wallet to unlock encrypted details.');
  }

  const timestamp = Date.now();
  const nonce =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `tokcred-${randomHexToken(8)}-${timestamp}`;

  const message =
    `TokCred Confidential Credential Decryption Request\n` +
    `Credential ID: ${credentialId}\n` +
    `Token ID: ${tokenId !== undefined && tokenId !== null ? String(tokenId) : 'N/A'}\n` +
    `Holder Wallet: ${studentAddress}\n` +
    `Requester Wallet: ${account}\n` +
    `Nonce: ${nonce}\n` +
    `Timestamp: ${timestamp}`;

  const signature = await signer.signMessage(message);

  const response = await fetch('/api/credential-crypto?action=decrypt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      encryptedPayload,
      credentialId,
      tokenId: tokenId !== undefined && tokenId !== null ? String(tokenId) : undefined,
      studentAddress,
      account,
      signature,
      message,
      timestamp,
      nonce,
      rpcUrl,
      contractAddress: CONTRACT_ADDRESS,
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result?.decryptedData) {
    throw new Error(result?.details || result?.error || 'Decryption authorization failed.');
  }

  return {
    decryptedData: result.decryptedData,
    role: result.role,
    authorizedSigner: result.authorizedSigner,
  };
};

/**
 * Request wallet-authorized batch decryption (single MetaMask signature for StudentDashboard / Issuer History).
 */
export const decryptCredentialsBatch = async ({
  items,
  account,
  signer,
  rpcUrl = PUBLIC_FALLBACK_RPC,
}) => {
  if (!signer || !account) {
    throw new Error('Connect an authorized holder or issuer wallet first.');
  }
  if (!Array.isArray(items) || items.length === 0) {
    return {};
  }

  const timestamp = Date.now();
  const nonce =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `tokcred-batch-${randomHexToken(8)}-${timestamp}`;

  const message =
    `TokCred Confidential Portfolio Decryption Request\n` +
    `Record Count: ${items.length}\n` +
    `Requester Wallet: ${account}\n` +
    `Contract: ${CONTRACT_ADDRESS}\n` +
    `Nonce: ${nonce}\n` +
    `Timestamp: ${timestamp}`;

  const signature = await signer.signMessage(message);

  const response = await fetch('/api/credential-crypto?action=decrypt-batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items,
      account,
      signature,
      message,
      timestamp,
      nonce,
      rpcUrl,
      contractAddress: CONTRACT_ADDRESS,
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result?.details || result?.error || 'Batch decryption failed.');
  }

  return result.decryptedItems || {};
};

/**
 * Upload strictly encrypted metadata envelope to IPFS exclusively via the server-side /api/pinata proxy.
 * Never exposes Pinata API keys to browser JavaScript.
 */
export const uploadToIPFS = async (metadata) => {
  assertNoPlaintextLeak(metadata);

  const proxyResp = await fetch('/api/pinata', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metadata),
  });

  const data = await proxyResp.json().catch(() => ({}));
  if (!proxyResp.ok || !data?.IpfsHash) {
    throw new Error(
      data?.details ||
      data?.error ||
      `IPFS upload failed via /api/pinata (HTTP ${proxyResp.status}). Verify server Pinata credentials.`
    );
  }

  return `ipfs://${data.IpfsHash}`;
};

/**
 * Parse CredentialIssued event from transaction receipt.
 */
export const getIssuedTokenIdFromReceipt = (receipt, contract) => {
  const event = receipt.logs.find((log) => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed.name === 'CredentialIssued';
    } catch {
      return false;
    }
  });

  if (!event) {
    return null;
  }

  const parsedEvent = contract.interface.parseLog(event);
  return parsedEvent.args.tokenId.toString();
};

/**
 * Normalize credential tuple returned by smart contract calls alongside Soulbound owner check.
 */
export const mapCredentialData = (data, ownerAddress = null) => {
  const studentAddr = data.student;
  const resolvedOwner = ownerAddress || studentAddr;
  return {
    tokenId: data.tokenId,
    student: studentAddr,
    holderWallet: resolvedOwner,
    ownerMatchesStudent: Boolean(
      resolvedOwner &&
      studentAddr &&
      resolvedOwner.toLowerCase() === studentAddr.toLowerCase()
    ),
    soulbound: true,
    metadataURI: data.metadataURI,
    issueTimestamp: data.issueTimestamp,
    revoked: data.revoked,
  };
};

/**
 * Issue a credential: encrypts sensitive metadata -> pins encrypted envelope to IPFS -> mints Soulbound NFT on-chain.
 */
export const issueCredential = async ({
  contract,
  studentAddress,
  formData,
}) => {
  const { encryptedEnvelope, decryptedMetadata, credentialId } = await encryptCredentialMetadata({
    formData,
    studentAddress,
    credentialId: formData.credentialId,
  });

  const metadataURI = await uploadToIPFS(encryptedEnvelope);
  const normalizedStudent = ethers.getAddress(studentAddress);
  const tx = await contract.issueCredential(normalizedStudent, metadataURI);
  const receipt = await tx.wait();
  const tokenId = getIssuedTokenIdFromReceipt(receipt, contract);

  return {
    metadata: encryptedEnvelope,
    decryptedMetadata,
    credentialId,
    metadataURI,
    tx,
    receipt,
    tokenId,
  };
};

/**
 * Verify credential by token ID on connected wallet contract instance, including Soulbound ownerOf check.
 */
export const verifyCredential = async (contract, tokenId) => {
  const parsedId = BigInt(tokenId);
  const [credentialData, ownerAddress] = await Promise.all([
    contract.verifyCredential(parsedId),
    contract.ownerOf(parsedId).catch(() => null),
  ]);

  let metadata = null;
  try {
    metadata = await fetchMetadata(credentialData.metadataURI);
  } catch {
    metadata = { unavailable: true, description: 'Credential metadata unavailable' };
  }

  return {
    credential: mapCredentialData(credentialData, ownerAddress),
    metadata,
  };
};

/**
 * Build a read-only public contract instance for verification without wallet.
 */
export const getPublicContract = (rpcUrl) => {
  if (CONTRACT_CONFIG_ERROR) {
    throw new Error(CONTRACT_CONFIG_ERROR);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};

/**
 * Public verification path using JSON-RPC provider (includes on-chain ownerOf verification).
 */
export const verifyCredentialPublic = async (tokenId, rpcUrl) => {
  const contract = getPublicContract(rpcUrl);
  const parsedId = BigInt(tokenId);

  const [data, ownerAddress] = await Promise.all([
    contract.verifyCredential(parsedId),
    contract.ownerOf(parsedId).catch(() => null),
  ]);

  let metadata = null;
  try {
    metadata = await fetchMetadata(data.metadataURI);
  } catch {
    metadata = { unavailable: true, description: 'Credential metadata unavailable' };
  }

  return {
    credential: mapCredentialData(data, ownerAddress),
    metadata,
  };
};

/**
 * Load all credentials owned by a student account.
 */
export const loadStudentCredentials = async (contract, account) => {
  const tokenIds = await contract.getStudentCredentials(account);

  const credentials = await Promise.all(
    tokenIds.map(async (tokenId) => {
      try {
        const [details, ownerAddress] = await Promise.all([
          contract.getCredentialDetails(tokenId),
          contract.ownerOf(tokenId).catch(() => account),
        ]);

        let metadata = null;
        try {
          metadata = await fetchMetadata(details.metadataURI);
        } catch {
          metadata = { unavailable: true, description: 'Credential metadata unavailable' };
        }

        return {
          ...mapCredentialData(details, ownerAddress),
          metadata,
        };
      } catch {
        return null;
      }
    })
  );

  return credentials.filter(Boolean);
};

/**
 * Load all issued credentials by iterating [0, getTotalCredentials()).
 */
export const loadAllCredentials = async (contract) => {
  const totalCredentials = await contract.getTotalCredentials();

  if (totalCredentials === 0n) {
    return [];
  }

  const allCreds = [];
  const seenIds = new Set();

  for (let i = 0; i < Number(totalCredentials); i++) {
    try {
      const [details, ownerAddress] = await Promise.all([
        contract.getCredentialDetails(i),
        contract.ownerOf(i).catch(() => null),
      ]);
      const tid =
        details.tokenId !== undefined && details.tokenId !== null
          ? details.tokenId.toString()
          : String(i);

      if (seenIds.has(tid)) {
        continue;
      }
      seenIds.add(tid);

      let metadata = null;
      try {
        metadata = await fetchMetadata(details.metadataURI);
      } catch {
        metadata = { unavailable: true, description: 'Credential metadata unavailable' };
      }

      allCreds.push({
        ...mapCredentialData(details, ownerAddress),
        tokenId: tid,
        metadata,
      });
    } catch {
      // Continue cleanly on missing tokens
    }
  }

  return allCreds;
};

/**
 * Revoke a credential and return transaction receipt.
 */
export const revokeCredential = async (contract, tokenId) => {
  const tx = await contract.revokeCredential(tokenId);
  return tx.wait();
};
