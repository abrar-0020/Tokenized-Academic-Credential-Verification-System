import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import CredentialCard from '../components/CredentialCard';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import { fetchMetadata } from '../utils/helpers';

const Dashboard = () => {
  const { account, contract, isIssuer } = useWeb3();
  
  const [credentials, setCredentials] = useState([]);
  const [allCredentials, setAllCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [viewMode, setViewMode] = useState('owned'); // 'owned' or 'all'

  useEffect(() => {
    if (account && contract) {
      loadCredentials();
    }
  }, [account, contract]);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get student's owned credentials
      const tokenIds = await contract.getStudentCredentials(account);
      console.log('Owned Token IDs:', tokenIds);

      // Fetch details for owned credentials
      const credentialsData = await Promise.all(
        tokenIds.map(async (tokenId) => {
          try {
            const details = await contract.getCredentialDetails(tokenId);
            let metadata = null;

            try {
              metadata = await fetchMetadata(details.metadataURI);
            } catch (metaError) {
              console.error('Error fetching metadata:', metaError);
            }

            return {
              tokenId: details.tokenId,
              student: details.student,
              metadataURI: details.metadataURI,
              issueTimestamp: details.issueTimestamp,
              revoked: details.revoked,
              metadata,
            };
          } catch (err) {
            console.error(`Error loading credential ${tokenId}:`, err);
            return null;
          }
        })
      );

      setCredentials(credentialsData.filter(Boolean));

      // If issuer, also load all issued credentials
      if (isIssuer) {
        await loadAllCredentials();
      }
    } catch (err) {
      console.error('Error loading credentials:', err);
      setError('Failed to load credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadAllCredentials = async () => {
    try {
      // Get total number of credentials issued
      const totalCredentials = await contract.getTotalCredentials();
      console.log('Total credentials issued:', totalCredentials.toString());

      if (totalCredentials === 0n) {
        setAllCredentials([]);
        return;
      }

      // Fetch all credentials
      const allCreds = [];
      for (let i = 0; i < Number(totalCredentials); i++) {
        try {
          const details = await contract.getCredentialDetails(i);
          let metadata = null;

          try {
            metadata = await fetchMetadata(details.metadataURI);
          } catch (metaError) {
            console.error('Error fetching metadata:', metaError);
          }

          allCreds.push({
            tokenId: details.tokenId,
            student: details.student,
            metadataURI: details.metadataURI,
            issueTimestamp: details.issueTimestamp,
            revoked: details.revoked,
            metadata,
          });
        } catch (err) {
          console.error(`Error loading credential ${i}:`, err);
        }
      }

      setAllCredentials(allCreds);
    } catch (err) {
      console.error('Error loading all credentials:', err);
    }
  };

  const handleRevoke = async (tokenId) => {
    if (!window.confirm('Are you sure you want to revoke this credential?')) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);

      const tx = await contract.revokeCredential(tokenId);
      await tx.wait();

      setSuccess('Credential revoked successfully');
      await loadCredentials(); // Reload credentials
    } catch (err) {
      console.error('Error revoking credential:', err);
      setError(err.message || 'Failed to revoke credential');
    }
  };

  if (!account) {
    return (
      <div className="w-full overflow-x-hidden px-3 sm:px-4 md:px-6 py-12">
        <Alert type="warning" message="Please connect your wallet to view your credentials" />
      </div>
    );
  }

  const displayCredentials = viewMode === 'owned' ? credentials : allCredentials;
  const showEmptyState = viewMode === 'owned' 
    ? credentials.length === 0 
    : allCredentials.length === 0;

  return (
    <div className="w-full overflow-x-hidden px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          {isIssuer && viewMode === 'all' ? 'All Issued Credentials' : 'My Credentials'}
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          {isIssuer && viewMode === 'all' 
            ? 'View and manage all credentials issued by your institution'
            : 'View and manage your academic credentials'
          }
        </p>
      </div>

      {/* View Toggle for Issuers */}
      {isIssuer && (
        <div className="mb-6 flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setViewMode('owned')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition text-sm sm:text-base ${
              viewMode === 'owned'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            My Credentials ({credentials.length})
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition text-sm sm:text-base ${
              viewMode === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Issued ({allCredentials.length})
          </button>
        </div>
      )}

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      {loading ? (
        <Loading message="Loading credentials..." />
      ) : showEmptyState ? (
        <div className="card text-center py-12 sm:py-16">
          <div className="text-5xl sm:text-6xl mb-4">📜</div>
          <h3 className="text-lg sm:text-xl font-bold mb-2">No Credentials Found</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6 px-4">
            {viewMode === 'all'
              ? 'No credentials have been issued yet. Go to the Issue Credential page to create one.'
              : 'You don\'t have any credentials yet. Contact your institution to get verified credentials.'
            }
          </p>
          {isIssuer && viewMode === 'owned' && (
            <a href="/issue" className="btn-primary inline-block text-sm sm:text-base">
              Issue First Credential
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {displayCredentials.map((credential) => (
            <CredentialCard
              key={credential.tokenId.toString()}
              credential={credential}
              metadata={credential.metadata}
              onRevoke={isIssuer ? handleRevoke : null}
              showActions={isIssuer}
            />
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {!loading && displayCredentials.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
          <div className="card text-center">
            <div className="text-2xl sm:text-3xl font-bold text-primary-600 mb-2">
              {displayCredentials.length}
            </div>
            <div className="text-sm sm:text-base text-gray-600">
              {viewMode === 'all' ? 'Total Issued' : 'Total Credentials'}
            </div>
          </div>
          <div className="card text-center">
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
              {displayCredentials.filter((c) => !c.revoked).length}
            </div>
            <div className="text-sm sm:text-base text-gray-600">Valid</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">
              {displayCredentials.filter((c) => c.revoked).length}
            </div>
            <div className="text-sm sm:text-base text-gray-600">Revoked</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
