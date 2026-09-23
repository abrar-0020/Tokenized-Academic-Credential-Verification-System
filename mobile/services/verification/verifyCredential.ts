import { getPublicContract } from '@/services/blockchain/provider';
import { fetchMetadata } from '@/services/ipfs/metadata';
import { CredentialData, CredentialMetadata } from '@/config/contract';

export type VerificationResult = {
  credential: CredentialData;
  metadata: CredentialMetadata | null;
};

/**
 * Verify a credential by token ID using a public read-only RPC.
 * NO wallet required. NO AppKit. NO authentication.
 * This is the same as verifyCredentialPublic in the web app's logic.js.
 */
export async function verifyCredential(tokenId: string | number): Promise<VerificationResult> {
  const contract = getPublicContract();
  const data = await contract.verifyCredential(parseInt(String(tokenId)));

  const credential: CredentialData = {
    tokenId: data.tokenId,
    student: data.student,
    metadataURI: data.metadataURI,
    issueTimestamp: data.issueTimestamp,
    revoked: data.revoked,
  };

  let metadata: CredentialMetadata | null = null;
  try {
    metadata = await fetchMetadata(credential.metadataURI);
  } catch {
    metadata = null;
  }

  return { credential, metadata };
}
