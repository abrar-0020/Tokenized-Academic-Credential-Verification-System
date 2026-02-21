import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { QRCodeSVG } from 'qrcode.react';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';
import { fetchMetadata, formatDate, ipfsToHttp } from '../utils/helpers';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import CredentialCard from '../components/CredentialCard';

// Public read-only Sepolia RPC — no wallet needed
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

  const verifyTokenId = useCallback(async (id) => {
    if (id === '' || id === null || id === undefined || isNaN(id) || parseInt(id) < 0) {
      setError('Please enter a valid token ID');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setCredential(null);
      setMetadata(null);

      const provider = new ethers.JsonRpcProvider(PUBLIC_RPC);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const data = await contract.verifyCredential(parseInt(id));

      let meta = null;
      try {
        meta = await fetchMetadata(data.metadataURI);
      } catch (_) {}

      setCredential({
        tokenId: data.tokenId,
        student: data.student,
        metadataURI: data.metadataURI,
        issueTimestamp: data.issueTimestamp,
        revoked: data.revoked,
      });
      setMetadata(meta);
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
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tid = params.get('tokenId');
    if (tid) {
      setTokenId(tid);
      verifyTokenId(tid);
    }
    setShareUrl(window.location.href);
  }, [verifyTokenId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    verifyTokenId(tokenId);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div style={{ position: 'relative', overflowX: 'hidden' }} className="w-full px-4 sm:px-6 py-8 sm:py-10">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-7">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            No wallet required
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            Public Credential Verifier
          </h1>
          <p className="text-sm text-slate-500">
            Instantly verify any academic credential on-chain — no MetaMask needed.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="card mb-6">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
            Token ID
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="number"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="Enter token ID (e.g. 0, 1, 2...)"
              className="input-field flex-1 text-sm"
              min="0"
              step="1"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-6 text-sm whitespace-nowrap"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </form>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        {loading && <Loading message="Reading from blockchain..." />}

        {credential && (
          <div>
            {/* Status Banner */}
            <div className={`card mb-5 ${credential.revoked ? 'border-l-4 border-red-400' : 'border-l-4 border-emerald-400'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    {credential.revoked ? '⚠️ Credential Revoked' : '✅ Credential Valid'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {credential.revoked
                      ? 'This credential has been revoked and is no longer valid.'
                      : 'This credential is authentic and verified on the Ethereum blockchain.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Credential Card */}
            <CredentialCard credential={credential} metadata={metadata} />

            {/* QR Code + Share */}
            <div className="card mt-5">
              <h3 className="text-base font-bold text-slate-800 mb-4">Share this Credential</h3>
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex-shrink-0">
                  <QRCodeSVG value={shareUrl} size={120} level="H" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 mb-2">
                    Anyone can scan this QR code to instantly verify this credential without a wallet.
                  </p>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={shareUrl}
                      className="input-field text-xs font-mono flex-1"
                      style={{ minHeight: '36px' }}
                    />
                    <button
                      onClick={handleCopy}
                      className="btn-secondary text-xs px-3 whitespace-nowrap"
                      style={{ minHeight: '36px' }}
                    >
                      {copied ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Blockchain Details */}
            <div className="card mt-4">
              <h3 className="text-base font-bold text-slate-800 mb-3">Blockchain Details</h3>
              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-slate-500 font-medium">Token ID:</span>
                  <span className="font-mono font-semibold">#{credential.tokenId.toString()}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-slate-500 font-medium">Student Address:</span>
                  <span className="font-mono text-xs break-all">{credential.student}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-slate-500 font-medium">Issue Date:</span>
                  <span className="font-semibold">{formatDate(credential.issueTimestamp)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-slate-500 font-medium">Status:</span>
                  {credential.revoked
                    ? <span className="badge badge-danger">Revoked</span>
                    : <span className="badge badge-success">Valid</span>}
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                  <span className="text-slate-500 font-medium">Metadata URI:</span>
                  <a
                    href={ipfsToHttp(credential.metadataURI)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 font-mono text-xs break-all hover:underline"
                  >
                    {credential.metadataURI.substring(0, 40)}...
                  </a>
                </div>
              </div>
            </div>

            {/* Info box */}
            <div className="card mt-4 bg-sky-50 border border-sky-200">
              <h3 className="text-sm font-bold text-sky-900 mb-2">What does this mean?</h3>
              <ul className="space-y-1.5 text-xs text-sky-800">
                {[
                  'Permanently recorded on the Ethereum blockchain',
                  'Cannot be altered, forged, or tampered with',
                  'Non-transferable — tied to the student\'s wallet address',
                  'Anyone can verify it using this token ID at any time',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-sky-500 flex-shrink-0 mt-0.5">&#10003;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Help when empty */}
        {!credential && !loading && !error && (
          <div className="card bg-slate-50 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 mb-3">How to use</h3>
            <ol className="space-y-2 text-xs sm:text-sm text-slate-600">
              {[
                'Obtain the token ID from the credential holder or issuing institution',
                'Enter the token ID in the form above',
                'Click "Verify" to instantly check on-chain — no wallet needed',
                'Share the verification link or QR code with anyone',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-bold text-primary-600 flex-shrink-0">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicVerify;
