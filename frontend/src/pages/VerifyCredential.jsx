import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useSearchParams } from 'react-router-dom';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import ObsidianShell from '../components/ObsidianShell';
import { copyToClipboard, formatDate } from '../utils/helpers';
import {
  ipfsToHttp,
  verifyCredential as verifyCredentialAction,
  decryptCredentialPayload
} from '../logic';

const VerifyCredential = () => {
  const { contract, account, signer } = useWeb3();
  const [searchParams] = useSearchParams();
  
  const [tokenId, setTokenId] = useState('');
  const [credential, setCredential] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [decryptedData, setDecryptedData] = useState(null);
  const [decrypting, setDecrypting] = useState(false);
  const [decryptionError, setDecryptionError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const isEncryptedRecord = Boolean(metadata?.isEncrypted && metadata?.encryptedData?.ciphertext);
  const isLockedEncrypted = Boolean(credential && isEncryptedRecord && !decryptedData);
  const effectiveMeta = isEncryptedRecord ? decryptedData : (metadata?.unavailable ? null : metadata);

  useEffect(() => {
    const urlTokenId = searchParams.get('tokenId');
    if (urlTokenId !== null && String(urlTokenId).trim() !== '' && contract && !loading && !credential) {
      setTokenId(urlTokenId);
      void handleVerify(null, urlTokenId);
    }
  }, [searchParams, contract]);

  const handleVerify = async (e, autoTokenId = null) => {
    if (e) e.preventDefault();
    
    const rawId = autoTokenId !== null ? autoTokenId : tokenId;
    const trimmed = String(rawId ?? '').trim();

    if (trimmed === '') {
      setError('Please enter a token ID');
      return;
    }

    if (!/^\d+$/.test(trimmed)) {
      setError('Please enter a valid numeric token ID');
      return;
    }

    if (!contract) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setCredential(null);
      setMetadata(null);
      setDecryptedData(null);
      setDecryptionError(null);

      const result = await verifyCredentialAction(contract, trimmed);
      setCredential(result.credential);
      setMetadata(result.metadata);
    } catch (err) {
      const msg = err?.reason || err?.message || '';
      if (msg.includes('Credential does not exist') || msg.includes('ERC721NonexistentToken')) {
        setError('Credential not found. Please check the token ID.');
      } else {
        setError(msg || 'Failed to verify credential');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    if (!isEncryptedRecord || !metadata?.encryptedData || !account || !signer) return;
    try {
      setDecrypting(true);
      setDecryptionError(null);
      const { decryptedData: unlocked } = await decryptCredentialPayload({
        encryptedPayload: metadata.encryptedData,
        credentialId: metadata.credentialId || `TC-TOKEN-${credential?.tokenId?.toString()}`,
        tokenId: credential?.tokenId?.toString(),
        studentAddress: credential?.student || metadata?.holder,
        account,
        signer,
      });
      setDecryptedData(unlocked);
    } catch (err) {
      setDecryptionError(err?.message || 'Decryption denied by authorization check.');
    } finally {
      setDecrypting(false);
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(`${window.location.origin}/verify?tokenId=${tokenId}`);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const holderWallet =
    effectiveMeta?.holderWallet ||
    credential?.holderWallet ||
    credential?.student ||
    '';

  const resolvedCredentialId =
    effectiveMeta?.credentialId ||
    metadata?.credentialId ||
    (credential?.tokenId !== undefined ? `TC-TOKEN-${credential.tokenId.toString()}` : 'N/A');

  return (
    <ObsidianShell title="Verify Credential" subtitle="On-Chain Validation">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
        <section className="lg:col-span-7 flex flex-col gap-10">
          <header>
            <h2 className="text-4xl lg:text-5xl font-headline font-medium tracking-tight text-[#c6c6c7] mb-4 leading-tight">
              Verify Academic <br />
              <span className="text-[#8197ff] italic">Authenticity</span>
            </h2>
            <p className="text-[#acabaa] max-w-md leading-relaxed">
              Enter a credential token ID to confirm Soulbound wallet ownership and decrypt confidential fields if authorized.
            </p>
          </header>

          <form onSubmit={handleVerify} className="flex flex-col gap-6">
            <div className="group relative">
              <label className="block text-[10px] uppercase tracking-widest text-[#5e6570] font-bold mb-2 ml-1">Credential Token ID</label>
              <div className="flex items-center bg-[#131313] border-b border-[#484848]/30 focus-within:border-[#8197ff] transition-all duration-500 pb-2 px-1 group">
                <span className="material-symbols-outlined text-[#767575] mr-3">fingerprint</span>
                <input
                  className="bg-transparent border-none focus:ring-0 text-2xl font-headline tracking-tight text-[#c6c6c7] w-full py-2 placeholder:text-[#767575]"
                  placeholder="Ex: 0 or 1"
                  type="text"
                  value={tokenId}
                  onChange={(e) => {
                    setTokenId(e.target.value);
                    if (error) setError(null);
                  }}
                />
              </div>
              <div className="absolute bottom-0 left-0 h-[2px] bg-[#8197ff] w-0 group-focus-within:w-full transition-all duration-700"></div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full lg:w-fit px-12 py-5 bg-gradient-to-r from-[#8197ff] to-[#002ca3] text-[#001661] font-bold text-sm tracking-widest uppercase rounded-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-60"
            >
              {loading ? 'Verifying...' : 'Initiate Verification'}
            </button>
          </form>

          {!contract && <Alert type="warning" message="Connect your wallet to run verification." />}
          {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
          {loading && <Loading message="Verifying credential on blockchain..." />}
        </section>

        <section className="lg:col-span-5 relative">
          <div className="sticky top-32">
            <div className="bg-[#1f2020] rounded-xl p-8 border border-[#484848]/20 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#8197ff]/5 rounded-full blur-3xl"></div>

              {!credential ? (
                <div className="text-center py-10 text-[#acabaa]">
                  <span className="material-symbols-outlined text-5xl mb-4 block text-[#767575]">qr_code_2</span>
                  Enter a token ID and initiate verification.
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 ${
                          credential.revoked ? 'bg-[#7f2737]/20 text-[#ec7c8a]' : 'bg-[#8197ff]/10 text-[#8197ff]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: '"FILL" 1' }}>verified</span>
                        {credential.revoked ? 'Revoked Record' : 'Verified Soulbound Record'}
                      </span>
                      <h3 className="text-2xl font-headline font-bold text-[#c6c6c7] tracking-tight">
                        Token #{credential.tokenId.toString()} · {resolvedCredentialId}
                      </h3>
                    </div>
                    <button type="button" onClick={handleCopy} className="w-12 h-12 bg-[#252626] rounded-lg flex items-center justify-center border border-[#484848]/20 text-[#8197ff]">
                      <span className="material-symbols-outlined">{copied ? 'check' : 'share'}</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#acabaa] font-bold mb-1">
                        Soulbound Holder Wallet {credential.ownerMatchesStudent ? '(Verified Owner)' : ''}
                      </p>
                      <p className="text-[#8197ff] font-mono text-xs break-all">{holderWallet}</p>
                    </div>

                    {isLockedEncrypted ? (
                      <div className="p-4 rounded-lg bg-[#141518] border border-[#484848]/30 space-y-3">
                        <p className="text-xs text-[#acabaa] leading-relaxed">
                          Holder name, enrollment number, degree, grade, field, and institution are AES-256-GCM encrypted on IPFS. Only the bound student wallet or an authorized issuer can decrypt them.
                        </p>
                        {decryptionError && <p className="text-xs text-[#ec7c8a]">{decryptionError}</p>}
                        <button
                          type="button"
                          onClick={handleUnlock}
                          disabled={decrypting || !account}
                          className="w-full py-2.5 px-4 bg-[#8197ff] text-[#001661] text-xs font-bold uppercase tracking-wider rounded hover:brightness-110 transition disabled:opacity-50"
                        >
                          {decrypting ? 'Decrypting...' : 'Unlock with Connected Wallet'}
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-[#acabaa] font-bold mb-1">Recipient</p>
                            <p className="text-[#c6c6c7] font-medium text-sm">{effectiveMeta?.studentName || 'Unknown Student'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-[#acabaa] font-bold mb-1">Enrollment / Reg. No.</p>
                            <p className="text-[#c6c6c7] font-mono text-xs">{effectiveMeta?.enrollmentNumber || 'Legacy Record'}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-[#acabaa] font-bold mb-1">Degree</p>
                            <p className="text-[#c6c6c7] font-medium text-sm">{effectiveMeta?.degree || 'Credential'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-[#acabaa] font-bold mb-1">Branch / Field</p>
                            <p className="text-[#c6c6c7] font-medium text-sm">{effectiveMeta?.branch || effectiveMeta?.fieldOfStudy || 'Academic Program'}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-[#acabaa] font-bold mb-1">Institution</p>
                            <p className="text-[#c6c6c7] font-medium text-sm">{effectiveMeta?.institution || 'Unknown Institution'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-[#acabaa] font-bold mb-1">Grade</p>
                            <p className="text-[#c6c6c7] font-medium text-sm">{effectiveMeta?.grade || 'Not Provided'}</p>
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#acabaa] font-bold mb-1">Issue Date</p>
                      <p className="text-[#c6c6c7] font-medium text-sm">{formatDate(credential.issueTimestamp)}</p>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-[#484848]/20">
                    <a
                      href={ipfsToHttp(credential.metadataURI)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#8197ff] text-xs font-mono break-all hover:underline"
                    >
                      {credential.metadataURI}
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </ObsidianShell>
  );
};

export default VerifyCredential;
