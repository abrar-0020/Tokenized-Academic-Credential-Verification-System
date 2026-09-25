import { CredentialData } from '@/config/contract';
import { getPublicContract, getSignedContract } from './provider';
import { ethers } from 'ethers';

function mapCredential(data: any): CredentialData {
  return {
    tokenId: data.tokenId,
    student: data.student,
    metadataURI: data.metadataURI,
    issueTimestamp: data.issueTimestamp,
    revoked: data.revoked,
  };
}

/** Load all credential token IDs owned by a student address */
export async function getStudentCredentialIds(studentAddress: string): Promise<bigint[]> {
  const contract = getPublicContract();
  return contract.getStudentCredentials(studentAddress);
}

/** Get full details for a single credential by token ID */
export async function getCredentialDetails(tokenId: string | number | bigint): Promise<CredentialData> {
  const contract = getPublicContract();
  const data = await contract.getCredentialDetails(BigInt(tokenId));
  return mapCredential(data);
}

/** Issue a new credential (signed — requires issuer wallet) */
export async function issueCredentialTx(
  signer: ethers.Signer,
  studentAddress: string,
  metadataURI: string
): Promise<{ tx: ethers.TransactionResponse; tokenId: string }> {
  const contract = getSignedContract(signer);
  const tx: ethers.TransactionResponse = await contract.issueCredential(studentAddress, metadataURI);
  const receipt = await tx.wait();

  // Parse CredentialIssued event for token ID
  let tokenId = '0';
  if (receipt?.logs) {
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed?.name === 'CredentialIssued') {
          tokenId = parsed.args.tokenId.toString();
          break;
        }
      } catch {
        // not this log
      }
    }
  }
  return { tx, tokenId };
}

/** Check issuer and admin roles */
export async function checkRoles(
  signer: ethers.Signer,
  address: string
): Promise<{ isIssuer: boolean; isAdmin: boolean }> {
  const contract = getSignedContract(signer);
  try {
    const [issuerRole, adminRole] = await Promise.all([
      contract.ISSUER_ROLE(),
      contract.DEFAULT_ADMIN_ROLE(),
    ]);
    const [isIssuer, isAdmin] = await Promise.all([
      contract.hasRole(issuerRole, address),
      contract.hasRole(adminRole, address),
    ]);
    return { isIssuer, isAdmin };
  } catch {
    return { isIssuer: false, isAdmin: false };
  }
}

/** Revoke a credential (signed — requires issuer or admin wallet) */
export async function revokeCredentialTx(
  signer: import('ethers').Signer,
  tokenId: string | number | bigint
): Promise<import('ethers').TransactionResponse> {
  const contract = getSignedContract(signer);
  const tx = await contract.revokeCredential(BigInt(tokenId));
  await tx.wait();
  return tx;
}
