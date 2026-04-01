import { useEffect, useMemo, useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import ObsidianShell from '../components/ObsidianShell';
import { formatDate, ipfsToHttp } from '../utils/helpers';
import { loadAllCredentials, loadStudentCredentials, revokeCredential } from '../logic';

const Dashboard = () => {
  const { account, contract, isIssuer } = useWeb3();
  const [credentials, setCredentials] = useState([]);
  const [allCredentials, setAllCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [viewMode, setViewMode] = useState('owned');
  const [showAllActivity, setShowAllActivity] = useState(false);

  useEffect(() => {
    if (account && contract) {
      void hydrate();
    } else {
      setLoading(false);
    }
  }, [account, contract, isIssuer]);

  const hydrate = async () => {
    try {
      setLoading(true);
      setError(null);
      const owned = await loadStudentCredentials(contract, account);
      setCredentials(owned);
      if (isIssuer) {
        const all = await loadAllCredentials(contract);
        setAllCredentials(all);
      }
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (tokenId) => {
    if (!window.confirm(`Revoke credential #${tokenId.toString()}?`)) return;
    try {
      setError(null);
      await revokeCredential(contract, tokenId);
      setSuccess(`Credential #${tokenId.toString()} revoked successfully.`);
      await hydrate();
    } catch (err) {
      setError(err.message || 'Failed to revoke credential.');
    }
  };

  const displayCredentials = viewMode === 'owned' ? credentials : allCredentials;
  const recentRows = useMemo(() => {
    return showAllActivity ? displayCredentials : displayCredentials.slice(0, 4);
  }, [displayCredentials, showAllActivity]);
  const validCount = displayCredentials.filter((c) => !c.revoked).length;

  const initialsFor = (name) => (name || 'Unknown Scholar').slice(0, 2).toUpperCase();

  const fallbackImageFor = (name) => {
    const initials = initialsFor(name);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="#252626"/><text x="50%" y="53%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#8197ff">${initials}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  const imageFor = (row) => {
    const raw = row.metadata?.image;
    if (!raw) return fallbackImageFor(row.metadata?.studentName);
    return raw.startsWith('ipfs://') ? ipfsToHttp(raw) : raw;
  };

  return (
    <ObsidianShell title="Protocol Overview" subtitle="Real-Time Ledger Metrics">
      <div className="max-w-7xl mx-auto">
        {!account && <Alert type="warning" message="Please connect your wallet to view dashboard data." />}
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

        {isIssuer && (
          <div className="mb-6 flex gap-2 bg-[#131313] p-1 rounded-lg w-fit border border-[#484848]/20">
            <button
              type="button"
              onClick={() => setViewMode('owned')}
              className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'owned' ? 'bg-[#1f2020] text-[#8197ff]' : 'text-[#acabaa] hover:text-[#e7e5e4]'
              }`}
            >
              Owned ({credentials.length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'all' ? 'bg-[#1f2020] text-[#8197ff]' : 'text-[#acabaa] hover:text-[#e7e5e4]'
              }`}
            >
              Issued ({allCredentials.length})
            </button>
          </div>
        )}

        {loading ? <Loading message="Loading dashboard..." /> : null}

        {!loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-[#131313] p-8 rounded-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-7xl">school</span>
                </div>
                <p className="text-[#acabaa] text-sm font-medium uppercase tracking-widest mb-4">Total Credentials Issued</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-headline font-bold text-[#c6c6c7]">{displayCredentials.length}</span>
                </div>
              </div>

              <div className="bg-[#131313] p-8 rounded-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-7xl">person_check</span>
                </div>
                <p className="text-[#acabaa] text-sm font-medium uppercase tracking-widest mb-4">Verified Holders</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-headline font-bold text-[#c6c6c7]">{validCount}</span>
                </div>
              </div>

              <div className="bg-[#131313] p-8 rounded-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-7xl">token</span>
                </div>
                <p className="text-[#acabaa] text-sm font-medium uppercase tracking-widest mb-4">Issuance Revenue</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-headline font-bold text-[#c6c6c7]">{(displayCredentials.length * 0.0033).toFixed(2)} ETH</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <section className="lg:col-span-8">
                <div className="bg-[#131313] rounded-lg p-6 overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="font-headline text-xl font-bold text-[#c6c6c7]">Recent Verifications</h2>
                    {displayCredentials.length > 4 && (
                      <button
                        className="text-[#8197ff] text-sm font-medium hover:underline"
                        type="button"
                        onClick={() => setShowAllActivity((prev) => !prev)}
                      >
                        {showAllActivity ? 'Show Less' : 'View All Activity'}
                      </button>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="text-xs uppercase tracking-tighter text-[#acabaa]">
                        <tr>
                          <th className="pb-4 font-semibold">Scholar / Entity</th>
                          <th className="pb-4 font-semibold">Credential Type</th>
                          <th className="pb-4 font-semibold">Issue Date</th>
                          <th className="pb-4 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {recentRows.map((row) => (
                          <tr key={row.tokenId.toString()} className="group hover:bg-[#1f2020] transition-colors">
                            <td className="py-5 pr-4 border-t border-[#484848]/10">
                              <div className="flex items-center gap-3">
                                <img
                                  src={imageFor(row)}
                                  alt={`${row.metadata?.studentName || 'Scholar'} credential`}
                                  className="w-8 h-8 rounded-full object-cover border border-[#484848]/30"
                                  loading="lazy"
                                  onError={(event) => {
                                    event.currentTarget.onerror = null;
                                    event.currentTarget.src = fallbackImageFor(row.metadata?.studentName);
                                  }}
                                />
                                <div>
                                  <p className="font-semibold text-[#c6c6c7]">{row.metadata?.studentName || 'Unknown Scholar'}</p>
                                  <p className="text-xs text-[#acabaa]">{row.metadata?.institution || 'Unknown Institution'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-4 border-t border-[#484848]/10 text-[#acabaa]">{row.metadata?.degree || 'Academic Credential'}</td>
                            <td className="py-5 px-4 border-t border-[#484848]/10 text-[#acabaa]">{formatDate(row.issueTimestamp)}</td>
                            <td className="py-5 pl-4 border-t border-[#484848]/10">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                  row.revoked
                                    ? 'bg-[#7f2737]/20 text-[#ec7c8a]'
                                    : 'bg-[#8197ff]/10 text-[#8197ff] shadow-[0_0_12px_rgba(129,151,255,0.2)]'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${row.revoked ? 'bg-[#ec7c8a]' : 'bg-[#8197ff]'}`}></span>
                                {row.revoked ? 'Revoked' : 'Success'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              <aside className="lg:col-span-4 space-y-6">
                <div className="bg-[#131313] rounded-lg p-6">
                  <h3 className="font-headline text-lg font-bold text-[#c6c6c7] mb-6">Network Health</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#acabaa]">Current Ledger Mode</span>
                      <span className="text-[#8197ff] font-semibold">Online</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#252626] rounded-full overflow-hidden">
                      <div className="h-full w-[99%] bg-[#8197ff]"></div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#acabaa]">Verified Ratio</span>
                      <span className="text-[#c6c6c7] font-semibold">
                        {displayCredentials.length ? `${Math.round((validCount / displayCredentials.length) * 100)}%` : '0%'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1f2020] rounded-lg p-6 border border-[#484848]/20 relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="font-headline text-lg font-bold text-[#c6c6c7] mb-2">New Issuance</h3>
                    <p className="text-sm text-[#acabaa] mb-6">Initialize a new cryptographic academic record for a verified institution.</p>
                    <a
                      href="/issue"
                      className="w-full bg-[#2c2c2c] text-[#c6c6c7] font-bold py-3 rounded-md hover:bg-[#252626] transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">add_circle</span>
                      Start Issuance
                    </a>
                  </div>
                </div>

                {isIssuer && recentRows.some((row) => !row.revoked) && (
                  <div className="bg-[#131313] rounded-lg p-4 border border-[#484848]/20">
                    <p className="text-xs text-[#acabaa] uppercase tracking-widest mb-3">Quick Revoke</p>
                    <div className="flex flex-wrap gap-2">
                      {recentRows.filter((row) => !row.revoked).map((row) => (
                        <button
                          key={row.tokenId.toString()}
                          type="button"
                          onClick={() => handleRevoke(row.tokenId)}
                          className="px-3 py-1.5 rounded bg-[#7f2737]/20 border border-[#7f2737]/40 text-[#ec7c8a] text-xs font-bold"
                        >
                          Revoke #{row.tokenId.toString()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </>
        )}
      </div>
    </ObsidianShell>
  );
};

export default Dashboard;
