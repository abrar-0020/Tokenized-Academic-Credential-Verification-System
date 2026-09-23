import { IPFS_GATEWAY } from '@/config/contract';
import { CredentialMetadata } from '@/config/contract';

export function ipfsToHttp(uri: string): string {
  if (!uri) return '';
  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', IPFS_GATEWAY);
  }
  return uri;
}

const FALLBACK_METADATA: CredentialMetadata = {
  name: 'Academic Credential',
  description: 'Credential data unavailable',
  institution: 'Unknown Institution',
  studentName: 'N/A',
  degree: 'N/A',
  grade: 'N/A',
  issueDate: 'N/A',
};

export async function fetchMetadata(uri: string): Promise<CredentialMetadata> {
  if (!uri) return FALLBACK_METADATA;

  // Check session cache
  const cacheKey = `ipfs_${uri}`;
  if (memoryCache[cacheKey]) return memoryCache[cacheKey];

  const fetchWithTimeout = async (url: string, ms: number = 10000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  };

  try {
    const url = ipfsToHttp(uri);
    const response = await fetchWithTimeout(url);
    if (response.ok) {
      const data: CredentialMetadata = await response.json();
      memoryCache[cacheKey] = data;
      return data;
    }
  } catch {
    // Try alternative gateway
    if (uri.startsWith('ipfs://')) {
      try {
        const hash = uri.replace('ipfs://', '');
        const altUrl = `https://ipfs.io/ipfs/${hash}`;
        const response = await fetchWithTimeout(altUrl);
        if (response.ok) {
          const data: CredentialMetadata = await response.json();
          memoryCache[cacheKey] = data;
          return data;
        }
      } catch {
        // both failed
      }
    }
  }

  return FALLBACK_METADATA;
}

const memoryCache: Record<string, CredentialMetadata> = {};

export async function uploadToIPFS(metadata: object): Promise<string> {
  try {
    // Server-side proxy first (avoids CORS and keeps secrets safe)
    const resp = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/pinata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metadata),
    });
    if (resp.ok) {
      const data = await resp.json();
      return `ipfs://${data.IpfsHash}`;
    }
  } catch {
    // proxy unavailable
  }

  // Fallback: client-side direct Pinata upload
  const key = process.env.EXPO_PUBLIC_PINATA_API_KEY;
  const secret = process.env.EXPO_PUBLIC_PINATA_SECRET_KEY;
  if (key && secret) {
    const resp = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: key,
        pinata_secret_api_key: secret,
      },
      body: JSON.stringify({ pinataContent: metadata }),
    });
    if (resp.ok) {
      const data = await resp.json();
      return `ipfs://${data.IpfsHash}`;
    }
  }

  throw new Error('Failed to upload metadata to IPFS. Configure EXPO_PUBLIC_API_URL or Pinata credentials.');
}
