import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, PUBLIC_RPC_URL } from '@/config/contract';

/** Read-only provider — no wallet required */
export function getPublicProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(PUBLIC_RPC_URL);
}

/** Read-only contract — for public verification */
export function getPublicContract(): ethers.Contract {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, getPublicProvider());
}

/** Signed contract — requires a signer from WalletContext */
export function getSignedContract(signer: ethers.Signer): ethers.Contract {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}
