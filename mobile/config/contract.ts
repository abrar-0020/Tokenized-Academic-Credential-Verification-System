// Contract configuration — copied and adapted from frontend/src/config/contract.js
// Uses process.env (Expo) instead of import.meta.env (Vite)

export const NETWORK_ID = parseInt(process.env.EXPO_PUBLIC_NETWORK_ID || '11155111', 10);

export const CONTRACT_ADDRESS =
  process.env.EXPO_PUBLIC_CONTRACT_ADDRESS ||
  '0xE8cb94E530Ee82c0EEbDB2FB092Bd32eDDD1dab1'; // Sepolia default

export const PUBLIC_RPC_URL =
  process.env.EXPO_PUBLIC_RPC_URL ||
  'https://ethereum-sepolia-rpc.publicnode.com';

export const IPFS_GATEWAY =
  process.env.EXPO_PUBLIC_IPFS_GATEWAY ||
  'https://gateway.pinata.cloud/ipfs/';

// Essential contract ABI — exact copy from the web app
export const CONTRACT_ABI = [
  'function issueCredential(address student, string memory metadataURI) public returns (uint256)',
  'function revokeCredential(uint256 tokenId) public',
  'function verifyCredential(uint256 tokenId) public view returns (tuple(uint256 tokenId, address student, string metadataURI, uint256 issueTimestamp, bool revoked))',
  'function getStudentCredentials(address student) public view returns (uint256[])',
  'function getCredentialDetails(uint256 tokenId) public view returns (tuple(uint256 tokenId, address student, string metadataURI, uint256 issueTimestamp, bool revoked))',
  'function isCredentialValid(uint256 tokenId) public view returns (bool)',
  'function getTotalCredentials() public view returns (uint256)',
  'function hasRole(bytes32 role, address account) public view returns (bool)',
  'function grantRole(bytes32 role, address account) public',
  'function ISSUER_ROLE() public view returns (bytes32)',
  'function DEFAULT_ADMIN_ROLE() public view returns (bytes32)',
  'event CredentialIssued(uint256 indexed tokenId, address indexed student, string metadataURI, uint256 timestamp)',
  'event CredentialRevoked(uint256 indexed tokenId, address indexed revokedBy, uint256 timestamp)',
];

export type CredentialData = {
  tokenId: bigint;
  student: string;
  metadataURI: string;
  issueTimestamp: bigint;
  revoked: boolean;
};

export type CredentialMetadata = {
  name?: string;
  description?: string;
  institution?: string;
  studentName?: string;
  degree?: string;
  grade?: string;
  issueDate?: string;
  image?: string;
};
