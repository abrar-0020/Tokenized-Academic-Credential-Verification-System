import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useSearchParams } from 'react-router-dom';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import ObsidianShell from '../components/ObsidianShell';
import { copyToClipboard, formatDate } from '../utils/helpers';
import { ipfsToHttp, verifyCredential as verifyCredentialAction } from '../logic';

const VerifyCredential = () => {
  const { contract } = useWeb3();
  const [searchParams] = useSearchParams();
  
  const [tokenId, setTokenId] = useState('');
  const [credential, setCredential] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const urlTokenId = searchParams.get('tokenId');
    if (urlTokenId && contract && !loading && !credential) {
      setTokenId(urlTokenId);
      void handleVerify(null, urlTokenId);
    }
  }, [searchParams, contract]);

  const handleVerify = async (e, autoTokenId = null) => {
    if (e) e.preventDefault();
    
    const idToVerify = autoTokenId || tokenId;
    
    if (!contract) {
      setError('Please connect your wallet first');
      return;
    }

    if (!idToVerify || isNaN(idToVerify) || parseInt(idToVerify) < 0) {
      setError('Please enter a valid token ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setCredential(null);
      setMetadata(null);

      const result = await verifyCredentialAction(contract, idToVerify);
      setCredential(result.credential);
      setMetadata(result.metadata);
    } catch (err) {
      if (err.message.includes('Credential does not exist')) {
        setError('Credential not found. Please check the token ID.');
      } else {
        setError(err.message || 'Failed to verify credential');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(`${window.location.origin}/verify?tokenId=${tokenId}`);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <ObsidianShell title="Verify Credential" subtitle="Public Validation">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
        <section className="lg:col-span-7 flex flex-col gap-10">
          <header>
            <h2 className="text-4xl lg:text-5xl font-headline font-medium tracking-tight text-[#c6c6c7] mb-4 leading-tight">
              Verify Academic <br />
              <span className="text-[#8197ff] italic">Authenticity</span>
            </h2>
            <p className="text-[#acabaa] max-w-md leading-relaxed">
              Enter a credential token ID to retrieve a permanent on-chain record from the Scholar Ledger.
            </p>
          </header>

          <form onSubmit={handleVerify} className="flex flex-col gap-6">
            <div className="group relative">
              <label className="block text-[10px] uppercase tracking-widest text-[#5e6570] font-bold mb-2 ml-1">Credential Token ID</label>
              <div className="flex items-center bg-[#131313] border-b border-[#484848]/30 focus-within:border-[#8197ff] transition-all duration-500 pb-2 px-1 group">
                <span className="material-symbols-outlined text-[#767575] mr-3">fingerprint</span>
                <input
                  className="bg-transparent border-none focus:ring-0 text-2xl font-headline tracking-tight text-[#c6c6c7] w-full py-2 placeholder:text-[#767575]"
                  placeholder="Ex: SCH-882-991-LX"
                  type="text"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                />
              </div>
              <div className="absolute bottom-0 left-0 h-[2px] bg-[#8197ff] w-0 group-focus-within:w-full transition-all duration-700"></div>
            </div>

            <button
              type="submit"
              disabled={loading || !contract}
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
                  <div className="flex items-start justify-between mb-10">
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 ${
                          credential.revoked ? 'bg-[#7f2737]/20 text-[#ec7c8a]' : 'bg-[#8197ff]/10 text-[#8197ff]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: '"FILL" 1' }}>verified</span>
                        {credential.revoked ? 'Revoked Record' : 'Verified Record'}
                      </span>
                      <h3 className="text-2xl font-headline font-bold text-[#c6c6c7] tracking-tight">#{credential.tokenId.toString()}</h3>
                    </div>
                    <button type="button" onClick={handleCopy} className="w-12 h-12 bg-[#252626] rounded-lg flex items-center justify-center border border-[#484848]/20 text-[#8197ff]">
                      <span className="material-symbols-outlined">{copied ? 'check' : 'share'}</span>
                    </button>
                  </div>

                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[#acabaa] font-bold mb-1">Recipient</p>
                        <p className="text-[#c6c6c7] font-medium text-sm">{metadata?.studentName || 'Unknown Student'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[#acabaa] font-bold mb-1">Type</p>
                        <p className="text-[#c6c6c7] font-medium text-sm">{metadata?.degree || 'Credential'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[#acabaa] font-bold mb-1">Institution</p>
                        <p className="text-[#c6c6c7] font-medium text-sm">{metadata?.institution || 'Unknown Institution'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[#acabaa] font-bold mb-1">Issue Date</p>
                        <p className="text-[#c6c6c7] font-medium text-sm">{formatDate(credential.issueTimestamp)}</p>
                      </div>
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
