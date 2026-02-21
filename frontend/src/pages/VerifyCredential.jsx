import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useSearchParams } from 'react-router-dom';
import CredentialCard from '../components/CredentialCard';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import { fetchMetadata, copyToClipboard, ipfsToHttp } from '../utils/helpers';

const VerifyCredential = () => {
  const { contract } = useWeb3();
  const [searchParams] = useSearchParams();
  
  const [tokenId, setTokenId] = useState('');
  const [credential, setCredential] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Auto-fill and auto-verify tokenId from URL parameter
  useEffect(() => {
    const urlTokenId = searchParams.get('tokenId');
    if (urlTokenId && contract && !loading && !credential) {
      setTokenId(urlTokenId);
      // Trigger verification automatically
      const autoVerify = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const credentialData = await contract.verifyCredential(parseInt(urlTokenId));
          
          let metadataData = null;
          try {
            metadataData = await fetchMetadata(credentialData.metadataURI);
          } catch (metaError) {
            console.error('Error fetching metadata:', metaError);
          }

          setCredential({
            tokenId: credentialData.tokenId,
            student: credentialData.student,
            metadataURI: credentialData.metadataURI,
            issueTimestamp: credentialData.issueTimestamp,
            revoked: credentialData.revoked,
          });
          setMetadata(metadataData);
        } catch (err) {
          console.error('Verification error:', err);
          setError(err.reason || err.message || 'Failed to verify credential');
        } finally {
          setLoading(false);
        }
      };
      
      autoVerify();
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

      // Verify credential on blockchain
      const credentialData = await contract.verifyCredential(parseInt(idToVerify));
      console.log('Credential data:', credentialData);

      // Fetch metadata from IPFS
      let metadataData = null;
      try {
        metadataData = await fetchMetadata(credentialData.metadataURI);
      } catch (metaError) {
        console.error('Error fetching metadata:', metaError);
      }

      setCredential({
        tokenId: credentialData.tokenId,
        student: credentialData.student,
        metadataURI: credentialData.metadataURI,
        issueTimestamp: credentialData.issueTimestamp,
        revoked: credentialData.revoked,
      });

      setMetadata(metadataData);
    } catch (err) {
      console.error('Error verifying credential:', err);
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
    const success = await copyToClipboard(window.location.href + '?tokenId=' + tokenId);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full overflow-x-hidden px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Verify Credential</h1>
        <p className="text-xs sm:text-sm text-gray-600 mb-6 sm:mb-8">
          Enter a token ID to verify the authenticity of an academic credential
        </p>

        {/* Verification Form */}
        <form onSubmit={handleVerify} className="card mb-6 sm:mb-8">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Token ID
          </label>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="number"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="Enter token ID (e.g., 0, 1, 2...)"
              className="input-field flex-1 text-sm sm:text-base"
              min="0"
              step="1"
            />
            <button
              type="submit"
              disabled={loading || !contract}
              className="btn-primary px-4 sm:px-6 md:px-8 text-sm sm:text-base whitespace-nowrap max-w-full"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
          {!contract && (
            <p className="text-xs sm:text-sm text-orange-600 mt-2">
              Connect your wallet to verify credentials
            </p>
          )}
        </form>

        {/* Error Alert */}
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {/* Loading State */}
        {loading && <Loading message="Verifying credential on blockchain..." />}

        {/* Verification Result */}
        {credential && (
          <div>
            {/* Verification Status */}
            <div className={`card mb-4 sm:mb-6 ${credential.revoked ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2">
                    {credential.revoked ? '⚠️ Credential Revoked' : '✓ Credential Valid'}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    {credential.revoked
                      ? 'This credential has been revoked and is no longer valid.'
                      : 'This credential is authentic and has been verified on the blockchain.'}
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className="btn-secondary text-xs sm:text-sm whitespace-nowrap max-w-full"
                  title="Copy verification link"
                >
                  {copied ? '✓ Copied' : '📋 Share'}
                </button>
              </div>
            </div>

            {/* Credential Details */}
            <CredentialCard credential={credential} metadata={metadata} />

            {/* Blockchain Details */}
            <div className="card mt-4 sm:mt-6">
              <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Blockchain Details</h3>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                  <span className="text-gray-600">Token ID:</span>
                  <span className="font-mono font-medium">#{credential.tokenId.toString()}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                  <span className="text-gray-600">Student Address:</span>
                  <span className="font-mono font-medium text-xs sm:text-sm break-all">
                    {credential.student.substring(0, 10)}...{credential.student.substring(credential.student.length - 8)}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                  <span className="text-gray-600">Status:</span>
                  {credential.revoked ? (
                    <span className="badge badge-danger text-xs">Revoked</span>
                  ) : (
                    <span className="badge badge-success text-xs">Valid</span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0">
                  <span className="text-gray-600">Metadata URI:</span>
                  <a
                    href={ipfsToHttp(credential.metadataURI)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 font-mono text-xs break-all sm:max-w-xs sm:text-right"
                  >
                    {credential.metadataURI.substring(0, 30)}...
                  </a>
                </div>
              </div>
            </div>

            {/* What This Means */}
            <div className="card mt-4 sm:mt-6 bg-blue-50 border border-blue-200">
              <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-blue-900">
                What does this mean?
              </h3>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>This credential has been permanently recorded on the Ethereum blockchain</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>It cannot be altered, forged, or tampered with</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>The credential is non-transferable (Soulbound) and tied to the student's wallet</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Anyone can verify its authenticity using this token ID</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Help Section */}
        {!credential && !loading && (
          <div className="card bg-gray-50">
            <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3">How to Verify</h3>
            <ol className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-700">
              <li className="flex items-start">
                <span className="font-bold mr-2 text-primary-600 flex-shrink-0">1.</span>
                <span>Obtain the token ID from the credential holder or institution</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2 text-primary-600 flex-shrink-0">2.</span>
                <span>Enter the token ID in the form above</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2 text-primary-600 flex-shrink-0">3.</span>
                <span>Click "Verify" to check the credential on the blockchain</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2 text-primary-600 flex-shrink-0">4.</span>
                <span>Review the credential details and verification status</span>
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyCredential;
