import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import ObsidianShell from '../components/ObsidianShell';
import { formatDate } from '../utils/helpers';
import { verifyCredentialPublic, ipfsToHttp } from '../logic';

const PUBLIC_RPC =
  import.meta.env.VITE_PUBLIC_RPC_URL ||
  'https://ethereum-sepolia-rpc.publicnode.com';

const PublicVerify = () => {
  const [tokenId, setTokenId] = useState('');
  const [credential, setCredential] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const verifyTokenId = async (id) => {
    if (id === '' || id === null || id === undefined || isNaN(id) || parseInt(id, 10) < 0) {
      setError('Please enter a valid token ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setCredential(null);
      setMetadata(null);

      const result = await verifyCredentialPublic(id, PUBLIC_RPC);
      setCredential(result.credential);
      setMetadata(result.metadata);
      setShareUrl(`${window.location.origin}/public-verify?tokenId=${id}`);
    } catch (err) {
      if (err.message?.includes('Credential does not exist') || err.reason?.includes('does not exist')) {
        setError('Credential not found. Please check the token ID.');
      } else {
        setError(err.reason || err.message || 'Failed to verify credential');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tid = params.get('tokenId');
    setShareUrl(window.location.href);
    if (tid) {
      setTokenId(tid);
      void verifyTokenId(tid);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    void verifyTokenId(tokenId);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <ObsidianShell>
      <div className="max-w-4xl mx-auto relative z-10">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10L90 90M90 10L10 90' stroke='%231f2020' stroke-width='0.5' fill='none'/%3E%3C/svg%3E\")",
          }}
        ></div>

        <div className="mb-16">
          <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-[#e7e5e4] mb-4">Public Verification</h1>
          <p className="text-[#acabaa] max-w-xl text-lg leading-relaxed">
            Verify academic authenticity directly against the blockchain without a connected wallet. Access the permanent ledger of truth.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#131313] rounded-xl p-8 mb-12 shadow-2xl shadow-black/40 border border-[#484848]/20">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#acabaa]">fingerprint</span>
              <input
                className="w-full bg-[#1f2020] border-none border-b-2 border-transparent focus:border-[#8197ff] focus:ring-4 focus:ring-[#8197ff]/10 text-[#e7e5e4] py-4 pl-12 pr-4 rounded-lg font-mono text-sm placeholder:text-[#acabaa]/60 transition-all"
                placeholder="Enter Token ID or Credential Hash..."
                type="text"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-tr from-[#8197ff] to-[#002ca3] text-[#001661] px-8 py-4 rounded-lg font-headline font-bold tracking-tight hover:shadow-[0_0_30px_rgba(129,151,255,0.3)] active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Verifying...' : 'Verify Credential'}</span>
              <span className="material-symbols-outlined">security</span>
            </button>
          </div>
        </form>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        {loading && <Loading message="Reading from blockchain..." />}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-[#1f2020] rounded-xl p-8 min-h-[360px] flex flex-col justify-between border border-[#484848]/10 relative overflow-hidden group">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#8197ff]/5 rounded-full blur-3xl group-hover:bg-[#8197ff]/10 transition-colors"></div>

              {!credential ? (
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="h-10 w-48 bg-[#252626] rounded animate-pulse"></div>
                    <div className="flex items-center gap-2 bg-[#e5ebf8]/10 px-4 py-2 rounded-full border border-[#8197ff]/20">
                      <span className="w-2 h-2 rounded-full bg-[#8197ff] shadow-[0_0_8px_#8197ff]"></span>
                      <span className="text-[10px] font-bold tracking-widest uppercase text-[#8197ff]">Awaiting Input</span>
                    </div>
                  </div>
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <div className="h-4 w-24 bg-[#252626] rounded opacity-50"></div>
                      <div className="h-8 w-64 bg-[#252626] rounded"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <div className="h-4 w-20 bg-[#252626] rounded opacity-50"></div>
                        <div className="h-6 w-32 bg-[#252626] rounded"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 w-20 bg-[#252626] rounded opacity-50"></div>
                        <div className="h-6 w-32 bg-[#252626] rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative z-10 space-y-8">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#acabaa] font-bold mb-2">Credential</p>
                      <h3 className="text-2xl font-headline font-bold text-[#e7e5e4]">#{credential.tokenId.toString()}</h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${credential.revoked ? 'bg-[#7f2737]/30 text-[#ec7c8a]' : 'bg-[#e5ebf8]/10 text-[#8197ff]'}`}>
                      {credential.revoked ? 'Revoked' : 'Verified'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#acabaa] font-bold mb-1">Recipient</p>
                      <p className="text-[#e7e5e4] text-sm font-medium">{metadata?.studentName || 'Unknown Student'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#acabaa] font-bold mb-1">Credential Type</p>
                      <p className="text-[#e7e5e4] text-sm font-medium">{metadata?.degree || 'Academic Credential'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#acabaa] font-bold mb-1">Institution</p>
                      <p className="text-[#e7e5e4] text-sm font-medium">{metadata?.institution || 'Unknown Institution'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#acabaa] font-bold mb-1">Issue Date</p>
                      <p className="text-[#e7e5e4] text-sm font-medium">{formatDate(credential.issueTimestamp)}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#acabaa] font-bold mb-2">Metadata URI</p>
                    <a href={ipfsToHttp(credential.metadataURI)} target="_blank" rel="noreferrer" className="text-[#8197ff] text-xs font-mono break-all hover:underline">
                      {credential.metadataURI}
                    </a>
                  </div>
                </div>
              )}

              <div className="mt-8 flex items-center gap-4 opacity-20 filter grayscale">
                <img
                  alt="official seal"
                  className="w-16 h-16 rounded-full"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNBgyAzBhy2dYYlp6dQhv3gOp9CguXySWs37b9fN5531zwgWFIhmpkNWo9UwWMi5-mDzSXjBaDIglswphKR97XSuf7_DYwHDPooyJsDKXA-bmTAmMK3ndNkNLWUBXNOtvWcY7W4SGHba4MmaSMeCv7jzp4osD0WhTZ5BMPOWSMShynYaOgoU9im5dbwpSGoZf6DQiXrn8bVzxGS7N2-Wk0oQwzgVKXHM6GHgLBSX6MJQW-c-z8jFuyF9B4FSawRk0d6-Z3YCugvddQ"
                />
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-[#acabaa] rounded"></div>
                  <div className="h-3 w-56 bg-[#acabaa] rounded opacity-50"></div>
                </div>
              </div>
            </div>

            {credential && (
              <div className="bg-[#111111] rounded-xl p-8 border border-[#1F1F1F] shadow-xl">
                <h3 className="text-[#e7e5e4] font-headline font-bold text-lg mb-6">Share this Credential</h3>
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <div className="bg-white p-3 rounded-lg flex-shrink-0">
                    <QRCodeSVG value={shareUrl || window.location.href} size={128} level="H" />
                  </div>
                  <div className="flex-1 w-full space-y-4">
                    <p className="text-[#acabaa] text-sm leading-relaxed">
                      Anyone can scan this QR code to instantly verify this credential without a wallet connection.
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        className="flex-1 bg-[#1f2020] border border-[#1F1F1F] rounded-lg px-4 py-2.5 text-sm text-[#e7e5e4] font-mono focus:ring-2 focus:ring-[#8197ff]/20 focus:border-[#8197ff] outline-none truncate"
                        readOnly
                        type="text"
                        value={shareUrl || `${window.location.origin}/public-verify`}
                      />
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="px-5 py-2.5 bg-[#252626] hover:bg-[#191a1a] rounded-lg text-sm font-bold text-[#e7e5e4] transition-colors border border-[#484848]/10"
                      >
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {credential && (
              <div className="bg-[#111111] rounded-xl p-8 border border-[#1F1F1F] shadow-xl">
                <h3 className="text-[#e7e5e4] font-headline font-bold text-lg mb-6">Blockchain Details</h3>
                <div className="space-y-5">
                  <div className="flex justify-between items-center py-1 border-b border-[#1F1F1F]/50">
                    <span className="text-sm font-medium text-[#acabaa]">Token ID:</span>
                    <span className="text-sm font-bold text-[#e7e5e4] font-mono">#{credential.tokenId.toString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#1F1F1F]/50">
                    <span className="text-sm font-medium text-[#acabaa]">Student Address:</span>
                    <span className="text-sm font-mono text-[#e7e5e4] truncate ml-8">{credential.student}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#1F1F1F]/50">
                    <span className="text-sm font-medium text-[#acabaa]">Issue Date:</span>
                    <span className="text-sm font-bold text-[#e7e5e4]">{formatDate(credential.issueTimestamp)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#1F1F1F]/50">
                    <span className="text-sm font-medium text-[#acabaa]">Status:</span>
                    <span
                      className={`px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full border ${
                        credential.revoked
                          ? 'bg-[#7f2737]/20 text-[#ec7c8a] border-[#ec7c8a]/20'
                          : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      }`}
                    >
                      {credential.revoked ? 'Revoked' : 'Valid'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm font-medium text-[#acabaa]">Metadata URI:</span>
                    <a
                      className="text-sm font-mono text-[#8197ff] hover:underline truncate ml-8"
                      href={ipfsToHttp(credential.metadataURI)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {credential.metadataURI}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-[#131313] p-6 rounded-xl border border-[#484848]/10">
              <h3 className="font-headline font-bold text-sm uppercase tracking-wider text-[#8197ff] mb-4">How it works</h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <span className="text-[#8197ff] font-mono text-xs">01</span>
                  <p className="text-xs text-[#acabaa] leading-relaxed">Cryptographic hash is matched against the decentralized ledger.</p>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#8197ff] font-mono text-xs">02</span>
                  <p className="text-xs text-[#acabaa] leading-relaxed">Institution signature is verified for authenticity and non-revocation.</p>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#8197ff] font-mono text-xs">03</span>
                  <p className="text-xs text-[#acabaa] leading-relaxed">Proof of achievement is rendered as a tamper-proof digital record.</p>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-xl border border-[#484848]/10 bg-[#000000]">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-[#8197ff]">verified</span>
                <span className="font-headline font-bold text-sm text-[#e7e5e4]">Official Protocol</span>
              </div>
              <p className="text-[11px] text-[#acabaa] leading-relaxed">
                Scholar Ledger uses the Archivist Protocol to ensure academic records remain accessible even if the issuing institution is offline.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ObsidianShell>
  );
};

export default PublicVerify;
