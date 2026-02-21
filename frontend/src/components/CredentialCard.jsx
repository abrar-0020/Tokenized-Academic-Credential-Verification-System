import { formatDate, ipfsToHttp } from '../utils/helpers';

const CredentialCard = ({ credential, metadata, onRevoke, showActions = false }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 w-full overflow-hidden transition-shadow" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 w-full">
        {/* Credential Badge */}
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-sky-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-md">
            {metadata?.image ? (
              <img
                src={ipfsToHttp(metadata.image)}
                alt="Credential"
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <span className="text-white text-4xl">🎓</span>
            )}
          </div>
        </div>

        {/* Credential Details */}
        <div className="flex-grow min-w-0 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
            <div className="min-w-0 overflow-hidden">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 break-words">
                {metadata?.degree || metadata?.name || 'Academic Credential'}
              </h3>
              <p className="text-sm text-slate-500 break-words">{metadata?.institution || 'Institution Not Specified'}</p>
            </div>
            {credential.revoked ? (
              <span className="badge badge-danger text-xs sm:text-sm">Revoked</span>
            ) : (
              <span className="badge badge-success text-xs sm:text-sm">Valid</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-3">
            <div className="bg-slate-50 rounded-xl p-2.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Student</p>
              <p className="text-sm font-semibold text-slate-800 break-words mt-0.5">{metadata?.studentName || 'Not Specified'}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Grade</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{metadata?.grade || 'Not Specified'}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Issue Date</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                {metadata?.issueDate || formatDate(credential.issueTimestamp)}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Token ID</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">#{credential.tokenId.toString()}</p>
            </div>
          </div>

          {metadata?.description && (
            <div className="mt-3">
              <p className="text-xs text-slate-500 leading-relaxed">{metadata.description}</p>
            </div>
          )}

          {/* Actions */}
          {showActions && !credential.revoked && (
            <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 border-t border-slate-100">
              <a
                href={ipfsToHttp(credential.metadataURI)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700"
              >
                View Metadata ↗
              </a>
              {onRevoke && (
                <button
                  onClick={() => onRevoke(credential.tokenId)}
                  className="text-xs font-semibold text-red-500 hover:text-red-700"
                >
                  Revoke Credential
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
