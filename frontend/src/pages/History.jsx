import { useEffect, useMemo, useState } from 'react';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import ObsidianShell from '../components/ObsidianShell';
import { useWeb3 } from '../context/Web3Context';
import { loadAllCredentials, revokeCredential } from '../logic';
import { formatDate } from '../utils/helpers';

const History = () => {
  const { account, contract, isIssuer } = useWeb3();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (contract && isIssuer) {
      void refresh();
    } else {
      setLoading(false);
    }
  }, [contract, isIssuer]);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await loadAllCredentials(contract);
      setRows(data);
    } catch (err) {
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const onRevoke = async (tokenId) => {
    if (!window.confirm(`Revoke credential #${tokenId.toString()}?`)) return;
    try {
      setError(null);
      await revokeCredential(contract, tokenId);
      await refresh();
    } catch (err) {
      setError(err.message || 'Failed to revoke credential');
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((item) => {
      const name = (item.metadata?.studentName || '').toLowerCase();
      const degree = (item.metadata?.degree || '').toLowerCase();
      const token = item.tokenId.toString().toLowerCase();
      return name.includes(q) || degree.includes(q) || token.includes(q);
    });
  }, [query, rows]);

  return (
    <ObsidianShell title="Verification Registry" subtitle="Historical Audit Trail">
      <div className="max-w-7xl mx-auto">
        {!account && <Alert type="warning" message="Please connect your wallet." />}
        {account && !isIssuer && <Alert type="error" message="Only issuer accounts can access history." />}
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        {loading && <Loading message="Loading immutable registry history..." />}

        <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="md:w-2/3">
            <h4 className="text-4xl md:text-5xl font-headline font-bold text-[#c6c6c7] leading-tight tracking-tight">
              Immutable Record of <br /> Academic Truth.
            </h4>
            <p className="text-[#acabaa] max-w-lg mt-6 text-sm leading-relaxed">
              A cryptographically secured ledger containing all verified credentials issued through the Scholar Node.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="hidden lg:flex items-center bg-[#131313] px-4 py-2 rounded-md border border-[#484848]/20">
              <span className="material-symbols-outlined text-[#acabaa] text-lg">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 text-sm text-[#e7e5e4] placeholder:text-[#767575] w-48 transition-all duration-300 focus:w-64"
                placeholder="Search archive..."
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <span className="text-[10px] text-[#767575] font-medium uppercase tracking-widest">
              Showing {filtered.length} of {rows.length} entries
            </span>
          </div>
        </div>

        {!loading && (
          <>
            <div className="bg-[#131313] rounded-xl overflow-hidden shadow-2xl shadow-black/40 border border-[#484848]/20">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1f2020] border-b border-[#484848]/10">
                      <th className="px-6 py-5 text-[11px] font-bold text-[#767575] uppercase tracking-[0.15em]">Token ID</th>
                      <th className="px-6 py-5 text-[11px] font-bold text-[#767575] uppercase tracking-[0.15em]">Student Name</th>
                      <th className="px-6 py-5 text-[11px] font-bold text-[#767575] uppercase tracking-[0.15em]">Degree</th>
                      <th className="px-6 py-5 text-[11px] font-bold text-[#767575] uppercase tracking-[0.15em]">Issuance Date</th>
                      <th className="px-6 py-5 text-[11px] font-bold text-[#767575] uppercase tracking-[0.15em]">Status</th>
                      <th className="px-6 py-5 text-[11px] font-bold text-[#767575] uppercase tracking-[0.15em] text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#484848]/10">
                    {filtered.map((row) => (
                      <tr key={row.tokenId.toString()} className="hover:bg-[#252626]/50 transition-colors group">
                        <td className="px-6 py-6 font-mono text-xs text-[#8197ff]">#{row.tokenId.toString()}</td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#252626] flex items-center justify-center text-xs font-bold text-[#c6c6c7]">
                              {(row.metadata?.studentName || 'U').slice(0, 2).toUpperCase()}
                            </div>
                            <span className={`font-medium text-sm ${row.revoked ? 'text-[#767575] line-through' : 'text-[#e7e5e4]'}`}>
                              {row.metadata?.studentName || 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td className={`px-6 py-6 text-sm ${row.revoked ? 'text-[#767575] italic' : 'text-[#acabaa]'}`}>
                          {row.metadata?.degree || 'Academic Credential'}
                        </td>
                        <td className="px-6 py-6 text-[#acabaa] text-sm">{formatDate(row.issueTimestamp)}</td>
                        <td className="px-6 py-6">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              row.revoked
                                ? 'bg-[#7f2737]/20 text-[#ec7c8a]'
                                : 'bg-[#8197ff]/10 text-[#8197ff] shadow-[0_0_12px_rgba(129,151,255,0.2)]'
                            }`}
                          >
                            <span className={`w-1 h-1 rounded-full mr-2 ${row.revoked ? 'bg-[#ec7c8a]' : 'bg-[#8197ff]'}`}></span>
                            {row.revoked ? 'Revoked' : 'Valid'}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-right">
                          {!row.revoked ? (
                            <button
                              type="button"
                              onClick={() => onRevoke(row.tokenId)}
                              className="text-[#ec7c8a] hover:text-[#ff97a3] transition-colors"
                            >
                              <span className="material-symbols-outlined text-lg">report</span>
                            </button>
                          ) : (
                            <span className="material-symbols-outlined text-lg text-[#767575]">history</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-[#131313] p-6 rounded-xl border border-[#484848]/10">
                <div className="w-10 h-10 rounded-lg bg-[#8197ff]/10 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[#8197ff]" style={{ fontVariationSettings: '"FILL" 1' }}>security</span>
                </div>
                <h5 className="text-[#c6c6c7] font-headline font-bold text-lg mb-2">Hashing Integrity</h5>
                <p className="text-[#acabaa] text-sm leading-relaxed">Each entry is mapped to a hash verified against the main ledger node on a fixed cycle.</p>
              </div>
              <div className="bg-[#131313] p-6 rounded-xl border border-[#484848]/10">
                <div className="w-10 h-10 rounded-lg bg-[#e5ebf8]/10 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[#5e6570]" style={{ fontVariationSettings: '"FILL" 1' }}>cloud_done</span>
                </div>
                <h5 className="text-[#c6c6c7] font-headline font-bold text-lg mb-2">Node Sync Status</h5>
                <p className="text-[#acabaa] text-sm leading-relaxed">Current archival synchronization remains above 99.9% across verification points.</p>
              </div>
              <div className="bg-[#131313] p-6 rounded-xl border border-[#484848]/10">
                <div className="w-10 h-10 rounded-lg bg-[#7f2737]/10 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[#ec7c8a]" style={{ fontVariationSettings: '"FILL" 1' }}>lock_reset</span>
                </div>
                <h5 className="text-[#c6c6c7] font-headline font-bold text-lg mb-2">Protocol Zero</h5>
                <p className="text-[#acabaa] text-sm leading-relaxed">Revocations are final and immediately reflected across all verification channels.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </ObsidianShell>
  );
};

export default History;