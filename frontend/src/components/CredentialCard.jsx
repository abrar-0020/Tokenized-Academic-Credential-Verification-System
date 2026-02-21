import { formatDate, ipfsToHttp } from '../utils/helpers';

const CredentialCard = ({ credential, metadata, onRevoke, showActions = false }) => {
  return (
    <div className="card hover:shadow-xl transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        {/* Credential Badge */}
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            {metadata?.image ? (
              <img
                src={ipfsToHttp(metadata.image)}
                alt="Credential"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-white text-4xl sm:text-5xl">🎓</span>
            )}
          </div>
        </div>

        {/* Credential Details */}
        <div className="flex-grow">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                {metadata?.degree || metadata?.name || 'Academic Credential'}
              </h3>
              <p className="text-sm sm:text-base text-gray-600">{metadata?.institution || 'Institution Not Specified'}</p>
            </div>
            {credential.revoked ? (
              <span className="badge badge-danger text-xs sm:text-sm">Revoked</span>
            ) : (
              <span className="badge badge-success text-xs sm:text-sm">Valid</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Student</p>
              <p className="text-sm sm:text-base font-medium text-gray-800 break-words">{metadata?.studentName || 'Not Specified'}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Grade</p>
              <p className="text-sm sm:text-base font-medium text-gray-800">{metadata?.grade || 'Not Specified'}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Issue Date</p>
              <p className="text-sm sm:text-base font-medium text-gray-800">
                {metadata?.issueDate || formatDate(credential.issueTimestamp)}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Token ID</p>
              <p className="text-sm sm:text-base font-medium text-gray-800">#{credential.tokenId.toString()}</p>
            </div>
          </div>

          {metadata?.description && (
            <div className="mt-3 sm:mt-4">
              <p className="text-xs sm:text-sm text-gray-600">{metadata.description}</p>
            </div>
          )}

          {/* Actions */}
          {showActions && !credential.revoked && (
            <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <a
                href={ipfsToHttp(credential.metadataURI)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-medium text-center sm:text-left"
              >
                View Metadata
              </a>
              {onRevoke && (
                <button
                  onClick={() => onRevoke(credential.tokenId)}
                  className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Revoke
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CredentialCard;
