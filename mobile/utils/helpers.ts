export function formatDate(timestamp: bigint | number | undefined): string {
  if (!timestamp) return 'N/A';
  const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
  if (!ts || ts === 0) return 'N/A';
  // Solidity timestamps are in seconds
  const date = new Date(ts * 1000);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function shortenHash(hash: string, chars = 4): string {
  if (!hash) return '';
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}
