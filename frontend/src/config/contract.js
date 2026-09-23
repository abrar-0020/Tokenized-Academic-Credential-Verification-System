const rawContractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const rawNetworkId = parseInt(import.meta.env.VITE_NETWORK_ID || '31337', 10);

const normalizeContractAddress = (value) => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const isValidEvmAddress = (value) => /^0x[a-fA-F0-9]{40}$/.test(value || '');

export const NETWORK_ID = Number.isInteger(rawNetworkId) ? rawNetworkId : 31337;

const DEFAULT_CONTRACT_ADDRESSES = {
  31337: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  11155111: '0xE8cb94E530Ee82c0EEbDB2FB092Bd32eDDD1dab1',
};

const fallbackContractAddress = DEFAULT_CONTRACT_ADDRESSES[NETWORK_ID] || null;

export const CONTRACT_ADDRESS = normalizeContractAddress(rawContractAddress) || fallbackContractAddress;
export const IS_CONTRACT_ADDRESS_VALID = isValidEvmAddress(CONTRACT_ADDRESS);
export const CONTRACT_CONFIG_ERROR = !CONTRACT_ADDRESS
  ? `Missing VITE_CONTRACT_ADDRESS and no fallback configured for network ${NETWORK_ID}. Set it in frontend/.env.`
  : !IS_CONTRACT_ADDRESS_VALID
    ? `Invalid VITE_CONTRACT_ADDRESS: ${CONTRACT_ADDRESS}`
    : null;
export const NETWORK_NAME = import.meta.env.VITE_NETWORK_NAME || 'localhost';
export const IPFS_GATEWAY = import.meta.env.VITE_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

export const NETWORKS = {
  31337: {
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
  },
  11155111: {
    name: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/',
  },
};

// Contract ABI - Essential functions only
export const CONTRACT_ABI = [
  "function issueCredential(address student, string memory metadataURI) public returns (uint256)",
  "function revokeCredential(uint256 tokenId) public",
  "function verifyCredential(uint256 tokenId) public view returns (tuple(uint256 tokenId, address student, string metadataURI, uint256 issueTimestamp, bool revoked))",
  "function getStudentCredentials(address student) public view returns (uint256[])",
  "function getCredentialDetails(uint256 tokenId) public view returns (tuple(uint256 tokenId, address student, string metadataURI, uint256 issueTimestamp, bool revoked))",
  "function isCredentialValid(uint256 tokenId) public view returns (bool)",
  "function getTotalCredentials() public view returns (uint256)",
  "function hasRole(bytes32 role, address account) public view returns (bool)",
  "function grantRole(bytes32 role, address account) public",
  "function ISSUER_ROLE() public view returns (bytes32)",
  "function DEFAULT_ADMIN_ROLE() public view returns (bytes32)",
  "event CredentialIssued(uint256 indexed tokenId, address indexed student, string metadataURI, uint256 timestamp)",
  "event CredentialRevoked(uint256 indexed tokenId, address indexed revokedBy, uint256 timestamp)"
];
