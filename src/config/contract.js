export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
export const NETWORK_ID = parseInt(import.meta.env.VITE_NETWORK_ID || '31337');
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
