import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, IPFS_GATEWAY } from './config/contract';

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
 * Fetch metadata from IPFS with localStorage fallback used by local testing.
 */
export const fetchMetadata = async (uri) => {
  try {
    if (uri.startsWith('ipfs://')) {
      const hash = uri.replace('ipfs://', '');
      const storageKey = `ipfs_metadata_${hash}`;
      const localData = localStorage.getItem(storageKey);

      if (localData) {
        return JSON.parse(localData);
      }
    }

    const url = ipfsToHttp(uri);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch metadata from IPFS');
    }

    return await response.json();
  } catch (error) {
    return {
      name: 'Academic Credential',
      description: 'Credential data unavailable',
      institution: 'Unknown Institution',
      studentName: 'N/A',
      degree: 'N/A',
      grade: 'N/A',
      issueDate: 'N/A',
    };
  }
};

/**
 * Create metadata payload matching the existing issue flow.
 */
export const buildCredentialMetadata = (formData) => {
  return {
    name: `${formData.degree} - ${formData.studentName}`,
    description: formData.description || `Academic credential issued by ${formData.institution}`,
    institution: formData.institution,
    studentName: formData.studentName,
    degree: formData.degree,
    grade: formData.grade,
    issueDate: formData.issueDate,
    image: '',
    attributes: [
      { trait_type: 'Institution', value: formData.institution },
      { trait_type: 'Degree', value: formData.degree },
      { trait_type: 'Grade', value: formData.grade },
      { trait_type: 'Issue Date', value: formData.issueDate },
    ],
  };
};

/**
 * Upload metadata to Pinata when credentials are provided.
 * Falls back to localStorage simulation used for local testing.
 */
export const uploadToIPFS = async (metadata, pinataKey, pinataSecret) => {
  if (pinataKey && pinataSecret) {
    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: pinataKey,
          pinata_secret_api_key: pinataSecret,
        },
        body: JSON.stringify({
          pinataContent: metadata,
          pinataMetadata: {
            name: `credential-${metadata.studentName}-${Date.now()}`,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Pinata upload failed');
      }

      const data = await response.json();
      return `ipfs://${data.IpfsHash}`;
    } catch (error) {
      throw new Error('Failed to upload metadata to IPFS. Check your Pinata credentials.');
    }
  }

  const metadataString = JSON.stringify(metadata);
  const hash = `Qm${btoa(metadataString).substring(0, 44).replace(/[^a-zA-Z0-9]/g, 'x')}`;
  const ipfsUri = `ipfs://${hash}`;

  try {
    const storageKey = `ipfs_metadata_${hash}`;
    localStorage.setItem(storageKey, metadataString);
  } catch {
    // Keep behavior non-fatal when storage is unavailable.
  }

  return ipfsUri;
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
 * Normalize credential tuple returned by smart contract calls.
 */
export const mapCredentialData = (data) => {
  return {
    tokenId: data.tokenId,
    student: data.student,
    metadataURI: data.metadataURI,
    issueTimestamp: data.issueTimestamp,
    revoked: data.revoked,
  };
};

/**
 * Issue a credential and return metadata URI, tx, receipt, and token ID.
 */
export const issueCredential = async ({
  contract,
  studentAddress,
  formData,
  pinataKey,
  pinataSecret,
}) => {
  const metadata = buildCredentialMetadata(formData);
  const metadataURI = await uploadToIPFS(metadata, pinataKey, pinataSecret);
  const tx = await contract.issueCredential(studentAddress, metadataURI);
  const receipt = await tx.wait();
  const tokenId = getIssuedTokenIdFromReceipt(receipt, contract);

  return {
    metadata,
    metadataURI,
    tx,
    receipt,
    tokenId,
  };
};

/**
 * Verify credential by token ID on connected wallet contract instance.
 */
export const verifyCredential = async (contract, tokenId) => {
  const credentialData = await contract.verifyCredential(parseInt(tokenId));
  let metadata = null;

  try {
    metadata = await fetchMetadata(credentialData.metadataURI);
  } catch {
    metadata = null;
  }

  return {
    credential: mapCredentialData(credentialData),
    metadata,
  };
};

/**
 * Build a read-only public contract instance for verification without wallet.
 */
export const getPublicContract = (rpcUrl) => {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};

/**
 * Public verification path using JSON-RPC provider.
 */
export const verifyCredentialPublic = async (tokenId, rpcUrl) => {
  const contract = getPublicContract(rpcUrl);
  const data = await contract.verifyCredential(parseInt(tokenId));

  let metadata = null;
  try {
    metadata = await fetchMetadata(data.metadataURI);
  } catch {
    metadata = null;
  }

  return {
    credential: mapCredentialData(data),
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
        const details = await contract.getCredentialDetails(tokenId);
        let metadata = null;

        try {
          metadata = await fetchMetadata(details.metadataURI);
        } catch {
          metadata = null;
        }

        return {
          ...mapCredentialData(details),
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
  for (let i = 0; i < Number(totalCredentials); i++) {
    try {
      const details = await contract.getCredentialDetails(i);
      let metadata = null;

      try {
        metadata = await fetchMetadata(details.metadataURI);
      } catch {
        metadata = null;
      }

      allCreds.push({
        ...mapCredentialData(details),
        metadata,
      });
    } catch {
      // Continue with next token to preserve existing resilient behavior.
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