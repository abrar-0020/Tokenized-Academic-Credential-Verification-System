import { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import { isValidAddress } from '../utils/helpers';

const IssueCredential = () => {
  const { account, contract, isIssuer } = useWeb3();

  const [formData, setFormData] = useState({
    studentAddress: '',
    studentName: '',
    institution: '',
    degree: '',
    grade: '',
    issueDate: new Date().toISOString().split('T')[0],
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const uploadToIPFS = async (metadata) => {
    console.log('Uploading metadata:', metadata);
    
    // Check if Pinata API credentials are configured
    const pinataKey = import.meta.env.VITE_PINATA_API_KEY;
    const pinataSecret = import.meta.env.VITE_PINATA_API_SECRET;
    
    // If Pinata credentials exist, upload to real IPFS
    if (pinataKey && pinataSecret) {
      try {
        const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': pinataKey,
            'pinata_secret_api_key': pinataSecret,
          },
          body: JSON.stringify({
            pinataContent: metadata,
            pinataMetadata: {
              name: `credential-${metadata.studentName}-${Date.now()}`,
            },
          }),
        });
        
        if (!response.ok) {
          throw new Error('Pinata upload failed');
        }
        
        const data = await response.json();
        const ipfsUri = `ipfs://${data.IpfsHash}`;
        console.log('Uploaded to Pinata:', ipfsUri);
        return ipfsUri;
      } catch (error) {
        console.error('Error uploading to Pinata:', error);
        throw new Error('Failed to upload metadata to IPFS. Check your Pinata credentials.');
      }
    }
    
    // For local testing without Pinata, store metadata in localStorage
    console.log('Using localStorage simulation (Pinata credentials not configured)');
    const metadataString = JSON.stringify(metadata);
    const hash = `Qm${btoa(metadataString).substring(0, 44).replace(/[^a-zA-Z0-9]/g, 'x')}`;
    const ipfsUri = `ipfs://${hash}`;
    
    // Store metadata in localStorage for local testing
    try {
      const storageKey = `ipfs_metadata_${hash}`;
      localStorage.setItem(storageKey, metadataString);
      console.log('Metadata stored locally:', storageKey);
    } catch (error) {
      console.error('Error storing metadata:', error);
    }
    
    return ipfsUri;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!isValidAddress(formData.studentAddress)) {
      setError('Invalid student wallet address');
      return;
    }

    if (!formData.studentName || !formData.institution || !formData.degree) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      // Create metadata
      const metadata = {
        name: `${formData.degree} - ${formData.studentName}`,
        description: formData.description || `Academic credential issued by ${formData.institution}`,
        institution: formData.institution,
        studentName: formData.studentName,
        degree: formData.degree,
        grade: formData.grade,
        issueDate: formData.issueDate,
        image: '',
        attributes: [
          { trait_type: 'Institution', value: formData.institution },
          { trait_type: 'Degree', value: formData.degree },
          { trait_type: 'Grade', value: formData.grade },
          { trait_type: 'Issue Date', value: formData.issueDate },
        ],
      };

      // Upload metadata to IPFS
      const metadataURI = await uploadToIPFS(metadata);

      // Issue credential on blockchain
      const tx = await contract.issueCredential(formData.studentAddress, metadataURI);
      console.log('Transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      // Get token ID from event
      const event = receipt.logs.find((log) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed.name === 'CredentialIssued';
        } catch {
          return false;
        }
      });

      let tokenId = 'Unknown';
      if (event) {
        const parsedEvent = contract.interface.parseLog(event);
        tokenId = parsedEvent.args.tokenId.toString();
      }

      setSuccess(`Credential successfully issued! Token ID: ${tokenId}`);
      
      // Reset form
      setFormData({
        studentAddress: '',
        studentName: '',
        institution: '',
        degree: '',
        grade: '',
        issueDate: new Date().toISOString().split('T')[0],
        description: '',
      });

    } catch (err) {
      console.error('Error issuing credential:', err);
      setError(err.message || 'Failed to issue credential');
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="w-screen max-w-full overflow-x-hidden px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
        <Alert type="warning" message="Please connect your wallet to continue" />
      </div>
    );
  }

  if (!isIssuer) {
    return (
      <div className="w-screen max-w-full overflow-x-hidden px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
        <Alert
          type="error"
          message="Access Denied: You don't have permission to issue credentials. Only authorized issuers can access this page."
        />
      </div>
    );
  }

  return (
    <div className="w-screen max-w-full overflow-x-hidden px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Issue Academic Credential</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
          Create a new verifiable credential for a student
        </p>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

        <form onSubmit={handleSubmit} className="card space-y-4 sm:space-y-6">
          {/* Student Address */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Student Wallet Address *
            </label>
            <input
              type="text"
              name="studentAddress"
              value={formData.studentAddress}
              onChange={handleChange}
              placeholder="0x..."
              className="input-field font-mono text-xs sm:text-sm"
              required
            />
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
              The Ethereum address where the credential will be issued
            </p>
          </div>

          {/* Student Name */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Student Name *
            </label>
            <input
              type="text"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              placeholder="John Doe"
              className="input-field text-sm sm:text-base"
              required
            />
          </div>

          {/* Institution */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Institution *
            </label>
            <input
              type="text"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              placeholder="Massachusetts Institute of Technology"
              className="input-field text-sm sm:text-base"
              required
            />
          </div>

          {/* Degree */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Degree / Certificate *
            </label>
            <input
              type="text"
              name="degree"
              value={formData.degree}
              onChange={handleChange}
              placeholder="Bachelor of Science in Computer Science"
              className="input-field text-sm sm:text-base"
              required
            />
          </div>

          {/* Grade */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Grade / GPA
            </label>
            <input
              type="text"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              placeholder="A (3.9/4.0 GPA)"
              className="input-field text-sm sm:text-base"
            />
          </div>

          {/* Issue Date */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Issue Date *
            </label>
            <input
              type="date"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleChange}
              className="input-field text-sm sm:text-base"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Additional details about the credential..."
              rows="3"
              className="input-field text-sm sm:text-base"
            />
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 text-sm sm:text-base"
            >
              {loading ? 'Issuing Credential...' : 'Issue Credential'}
            </button>
            <button
              type="button"
              onClick={() => setFormData({
                studentAddress: '',
                studentName: '',
                institution: '',
                degree: '',
                grade: '',
                issueDate: new Date().toISOString().split('T')[0],
                description: '',
              })}
              className="btn-secondary text-sm sm:text-base"
            >
              Clear
            </button>
          </div>
        </form>

        {loading && (
          <div className="mt-6 sm:mt-8">
            <Loading message="Processing transaction... Please wait and do not close this page." />
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueCredential;
