import { IPFS_GATEWAY } from '../config/contract';

/**
 * Convert IPFS URI to HTTP gateway URL
 */
export const ipfsToHttp = (uri) => {
  if (!uri) return '';
  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', IPFS_GATEWAY);
  }
  return uri;
};

/**
 * Fetch metadata from IPFS
 */
export const fetchMetadata = async (uri) => {
  try {
    // For local testing, check localStorage first
    if (uri.startsWith('ipfs://')) {
      const hash = uri.replace('ipfs://', '');
      const storageKey = `ipfs_metadata_${hash}`;
      const localData = localStorage.getItem(storageKey);
      
      if (localData) {
        console.log('Metadata loaded from localStorage:', storageKey);
        return JSON.parse(localData);
      }
    }
    
    // Try to fetch from IPFS gateway
    const url = ipfsToHttp(uri);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch metadata from IPFS');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching metadata:', error);
    // Return default metadata structure if fetch fails
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
 * Format Ethereum address
 */
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Format timestamp to readable date
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format timestamp to readable date and time
 */
export const formatDateTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

/**
 * Validate Ethereum address
 */
export const isValidAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Wait for transaction confirmation
 */
export const waitForTransaction = async (tx) => {
  try {
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
};
