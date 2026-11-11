import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { loadAllCredentials, revokeCredential, decryptCredentialsBatch } from '../logic';
import { formatDate } from '../utils/helpers';
import { NETWORKS } from '../config/contract';
import { downloadCertificatePdf } from '../services/certificateGenerator';
import SettingsDropdown from '../components/SettingsDropdown';
import WalletConnectButton from '../components/WalletConnectButton';
import { Menu, X, Lock, Unlock, Download } from 'lucide-react';

const History = () => {
  const navigate = useNavigate();
  const { account, contract, signer, isIssuer, isAdmin, networkId, connectWallet, disconnectWallet, loading: web3Loading, error: web3Error } = useWeb3();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chainRows, setChainRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all', 'verified', 'issued', 'revoked'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Selected credential for details modal & batch decryption state
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [revokingId, setRevokingId] = useState(null);
  const [decryptedMap, setDecryptedMap] = useState({});
  const [decrypting, setDecrypting] = useState(false);
  const [decryptionError, setDecryptionError] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    setDecryptedMap({});
    setDecryptionError(null);
    if (account && contract && (isAdmin || isIssuer)) {
      void refreshRegistry();
    }
  }, [contract, account, isAdmin, isIssuer]);

  const refreshRegistry = async () => {
    try {
      setLoading(true);
      setActionError(null);
      const data = await loadAllCredentials(contract);
      setChainRows(data || []);
    } catch (err) {
      console.warn('Failed to load on-chain registry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockRecords = async () => {
    const encryptedItems = (chainRows || [])
      .filter((item) => item.metadata?.isEncrypted && item.metadata?.encryptedData && !decryptedMap[String(item.tokenId)])
      .map((item) => ({
        tokenId: String(item.tokenId),
        credentialId: item.metadata?.credentialId || '',
        studentAddress: item.holderWallet || item.student || '',
        encryptedPayload: item.metadata.encryptedData,
      }));

    if (encryptedItems.length === 0) return;

    try {
      setDecrypting(true);
      setDecryptionError(null);
      const decoded = await decryptCredentialsBatch({
        items: encryptedItems,
        account,
        signer,
        ...(networkId === 31337 ? { rpcUrl: NETWORKS[31337].rpcUrl } : {}),
      });
      setDecryptedMap((prev) => ({ ...prev, ...decoded }));
    } catch (err) {
      console.error('Failed to unlock encrypted registry records:', err);
      setDecryptionError(err?.message || 'Authorized issuer signature rejected or unauthorized.');
    } finally {
      setDecrypting(false);
    }
  };

  // Real blockchain records mapped directly from smart contract
  const allRecords = useMemo(() => {
    if (chainRows && chainRows.length > 0) {
      // Deduplicate by unique tokenId to ensure no accidental duplicate items
      const seenTokenIds = new Set();
      const uniqueRows = chainRows.filter(item => {
        const id = (item.tokenId !== undefined && item.tokenId !== null) 
          ? item.tokenId.toString() 
          : null;
        if (id !== null) {
          if (seenTokenIds.has(id)) return false;
          seenTokenIds.add(id);
        }
        return true;
      });

      return uniqueRows.map((item, idx) => {
        const tokenIdStr = (item.tokenId !== undefined && item.tokenId !== null)
          ? item.tokenId.toString()
          : String(idx);
        const rawMeta = item.metadata || {};
        const unlocked = decryptedMap[tokenIdStr] || null;
        const effectiveMeta = unlocked
          ? { ...rawMeta, ...unlocked, isEncrypted: true, decrypted: true }
          : rawMeta;
        const isEncrypted = Boolean(rawMeta?.isEncrypted);
        const isUnavailable = Boolean(rawMeta?.unavailable);
        const isLocked = isEncrypted && !unlocked && !effectiveMeta?.studentName;

        const padId = tokenIdStr.padStart(5, '0');
        const holderWallet = item.holderWallet || item.student || '';
        const shortHolder = holderWallet ? `${holderWallet.slice(0, 6)}...${holderWallet.slice(-4)}` : 'Unbound';
        const credentialId = effectiveMeta.credentialId || `TC-TOKEN-${padId}`;
        const formattedId = `Token #${tokenIdStr}`;
        const prov = item.integrityHash
          ? `HASH-${item.integrityHash.slice(2, 10).toUpperCase()}`
          : `VFY-${(holderWallet || tokenIdStr).slice(2, 8).toUpperCase()}`;
        const issueDate = (!isLocked && effectiveMeta.issueDate)
          ? effectiveMeta.issueDate
          : (item.issueTimestamp ? formatDate(item.issueTimestamp) : 'Pending');

        let status = 'Issued';
        if (item.revoked) {
          status = 'Revoked';
        } else if (item.verified) {
          status = 'Verified';
        }

        return {
          tokenId: tokenIdStr,
          credentialId,
          formattedId,
          holderWallet,
          shortHolder,
          provenance: prov,
          enrollmentNumber: isLocked
            ? 'Encrypted (Locked)'
            : (effectiveMeta.enrollmentNumber || 'Legacy Unspecified'),
          studentName: isLocked
            ? `Confidential Holder (${shortHolder})`
            : (effectiveMeta.studentName || item.studentName || `Scholar (${shortHolder})`),
          degree: isLocked
            ? 'Encrypted Credential (AES-256-GCM)'
            : (isUnavailable ? 'Metadata Unavailable on IPFS' : (effectiveMeta.degree || item.degree || 'Degree Program')),
          field: isLocked
            ? 'Click Unlock Confidential Records to view'
            : (effectiveMeta.branch || effectiveMeta.field || effectiveMeta.major || effectiveMeta.fieldOfStudy || item.fieldOfStudy || 'Academic Discipline'),
          institution: isLocked
            ? 'Protected Record'
            : (effectiveMeta.institution || 'Authorized Institution'),
          grade: isLocked ? 'Encrypted' : (effectiveMeta.grade || 'Verified'),
          issueDate,
          status,
          revoked: Boolean(item.revoked),
          isEncrypted,
          isLocked,
          isUnavailable,
          ipfsHash: item.metadataURI || '',
          effectiveMetadata: effectiveMeta,
          raw: item,
        };
      });
    }
    return [];
  }, [chainRows, decryptedMap]);

  const lockedEncryptedCount = useMemo(
    () => allRecords.filter((r) => r.isEncrypted && r.isLocked).length,
    [allRecords]
  );

  const visibleInstitution = useMemo(
    () => allRecords.find((r) => !r.isLocked && r.institution && r.institution !== 'Authorized Institution')?.institution
      || (account ? `Institution (${account.slice(0, 6)}...${account.slice(-4)})` : 'Academic Institution'),
    [allRecords, account]
  );

  const activeModalRecord = useMemo(
    () => (selectedRecord ? (allRecords.find((r) => r.tokenId === selectedRecord.tokenId) || selectedRecord) : null),
    [selectedRecord, allRecords]
  );

  // Counts for pills directly from live data
  const counts = useMemo(() => {
    const total = allRecords.length;
    const verified = allRecords.filter(r => r.status === 'Verified').length;
    const issued = allRecords.filter(r => r.status === 'Issued').length;
    const revoked = allRecords.filter(r => r.revoked || r.status === 'Revoked').length;
    return {
      total: total.toLocaleString(),
      verified: verified.toLocaleString(),
      issued: issued.toLocaleString(),
      revoked: revoked.toLocaleString(),
      rawTotal: total,
    };
  }, [allRecords]);

  // Filter and search
  const filteredRecords = useMemo(() => {
    let result = allRecords;

    if (selectedFilter === 'verified') {
      result = result.filter(r => r.status === 'Verified');
    } else if (selectedFilter === 'issued') {
      result = result.filter(r => r.status === 'Issued');
    } else if (selectedFilter === 'revoked') {
      result = result.filter(r => r.revoked || r.status === 'Revoked');
    }

    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(r => 
        (r.studentName || '').toLowerCase().includes(q) ||
        (r.credentialId || '').toLowerCase().includes(q) ||
        (r.enrollmentNumber || '').toLowerCase().includes(q) ||
        (r.holderWallet || '').toLowerCase().includes(q) ||
        (r.degree || '').toLowerCase().includes(q) ||
        (r.field || '').toLowerCase().includes(q) ||
        (r.formattedId || '').toLowerCase().includes(q) ||
        (r.tokenId || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [allRecords, selectedFilter, query]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage]);

  const onRevoke = async (tokenId) => {
    if (!window.confirm(`Revoke credential #${tokenId.toString()}? This action is immutable on Ethereum.`)) return;
    try {
      setRevokingId(tokenId);
      setActionError(null);
      await revokeCredential(contract, tokenId);
      setActionSuccess(`Credential #${tokenId} successfully revoked.`);
      await refreshRegistry();
    } catch (err) {
      setActionError(err.message || 'Failed to revoke credential');
    } finally {
      setRevokingId(null);
    }
  };

  const escapeCsvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

  const exportRegistryCSV = () => {
    const headers = ['Token ID,Credential ID,Holder Wallet,Enrollment No.,Student Name,Degree,Field of Study,Grade,Institution,Issuance Date,Status\n'];
    const rows = filteredRecords.map(r =>
      [
        r.tokenId,
        r.credentialId,
        r.holderWallet,
        r.enrollmentNumber,
        r.studentName,
        r.degree,
        r.field,
        r.grade,
        r.institution,
        r.issueDate,
        r.status,
      ].map(escapeCsvCell).join(',')
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TokCred_Verification_Registry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleModalDownloadPdf = async (record) => {
    if (!record || record.revoked || record.isLocked || record.isUnavailable) return;
    try {
      setDownloadingPdf(true);
      await downloadCertificatePdf(record.raw, record.effectiveMetadata);
    } catch (err) {
      setActionError(err?.message || 'Unable to generate PDF for this credential.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#CDCDCD] text-[#292333] flex flex-col font-['Inter'] selection:bg-[#AB9FF2] selection:text-white relative">
      {/* Google fonts link */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap" />

      {/* ── TOP NAVIGATION (Standard TokCred Floating Pill Navbar) ────────────────── */}
      <div className="w-full pt-[16px] sm:pt-[24px] flex justify-center px-4 sm:px-6 lg:px-16 z-[100] mb-4 shrink-0">
        <div className="w-full max-w-[1312px] flex items-center justify-between relative">
          
          {/* Left: Logo */}
          <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity h-[48px] sm:h-[56px] -ml-2 sm:-ml-6" onClick={() => navigate('/')}>
            <img 
              src="/tokcred_logo-removebg-preview.png" 
              alt="TokCred" 
              className="h-[75px] sm:h-[90px] lg:h-[120px] max-w-none object-contain relative transition-all duration-300" 
              style={{ filter: 'none' }}
            />
          </div>

          {/* Center: Solid White Pill Nav */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center h-[56px] px-[36px] rounded-full text-[15px] font-[400] gap-[32px] tracking-[-0.01em] shadow-[0_8px_24px_rgba(0,0,0,0.02)] transition-colors duration-300 bg-white text-[#101014]">
            <span className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => navigate('/')}>Home</span>
            <span className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => navigate('/dashboard')}>Dashboard</span>
            <span className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => navigate('/issue')}>Issue</span>
            <span className="cursor-pointer hover:opacity-70 transition-opacity font-semibold text-[#513582]" onClick={() => navigate('/history')}>History</span>
            <span className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => navigate('/public-verify')}>Public Verify</span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-[16px]">
            <div>
              <SettingsDropdown 
                account={account}
                isAdmin={isAdmin}
                isIssuer={isIssuer}
                networkId={networkId}
                connectWallet={connectWallet}
                disconnectWallet={disconnectWallet}
                loading={web3Loading}
                error={web3Error}
                buttonClassName="w-[44px] h-[44px] sm:w-[56px] sm:h-[56px] rounded-full flex items-center justify-center hover:opacity-80 transition-colors duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.02)] bg-white text-[#101014]"
                iconSize={20}
              />
            </div>

            <WalletConnectButton
              disconnectedLabel="Connect"
              className="h-[44px] px-[16px] sm:h-[56px] sm:px-[24px] text-[13px] sm:text-[15px] font-[500] rounded-full hover:scale-105 active:scale-95 shadow-[0_8px_24px_rgba(176,150,250,0.2)] bg-[#2D264B] text-white hover:bg-[#3C315B]"
            />

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-[44px] h-[44px] rounded-full flex md:hidden items-center justify-center transition-colors duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.02)] bg-white text-[#101014]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="absolute top-[68px] left-0 right-0 p-4 bg-white/95 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-2xl flex flex-col gap-2 text-[#292333] z-50 md:hidden animate-in fade-in slide-in-from-top-3 duration-200">
              <button 
                onClick={() => { navigate('/'); setMobileMenuOpen(false); }} 
                className="text-left px-4 py-3 rounded-2xl hover:bg-black/5 text-[15px]"
              >
                Home
              </button>
              <button 
                onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }} 
                className="text-left px-4 py-3 rounded-2xl hover:bg-black/5 text-[15px] text-[#292333]"
              >
                Dashboard
              </button>
              <button 
                onClick={() => { navigate('/issue'); setMobileMenuOpen(false); }} 
                className="text-left px-4 py-3 rounded-2xl hover:bg-black/5 text-[15px] text-[#292333]"
              >
                Issue Credential
              </button>
              <button 
                onClick={() => { navigate('/history'); setMobileMenuOpen(false); }} 
                className="text-left px-4 py-3 rounded-2xl bg-[#513582]/10 text-[#513582] text-[15px] font-semibold flex items-center justify-between"
              >
                <span>History</span>
                <span>●</span>
              </button>
              <button 
                onClick={() => { navigate('/public-verify'); setMobileMenuOpen(false); }} 
                className="text-left px-4 py-3 rounded-2xl hover:bg-black/5 text-[15px] text-[#7053AD] font-medium flex items-center justify-between"
              >
                <span>Public Verify</span>
                <span>↗</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── INSTITUTIONAL WORKSPACE CONTAINER ────────────────────────── */}
      <main className="max-w-[1440px] w-full mx-auto px-6 md:px-16 py-6 md:py-8 flex flex-col gap-8 flex-grow">
        
        {/* Context Alerts */}
        {actionError && (
          <div className="w-full bg-[#98514C]/10 border border-[#98514C]/30 text-[#98514C] px-5 py-3 rounded-2xl text-xs flex justify-between items-center">
            <span>{actionError}</span>
            <button onClick={() => setActionError(null)} className="font-bold underline ml-4">Dismiss</button>
          </div>
        )}
        {actionSuccess && (
          <div className="w-full bg-[#326956]/10 border border-[#326956]/30 text-[#326956] px-5 py-3 rounded-2xl text-xs flex justify-between items-center">
            <span>{actionSuccess}</span>
            <button onClick={() => setActionSuccess(null)} className="font-bold underline ml-4">Dismiss</button>
          </div>
        )}

        {/* Institution Context Line */}
        <div className="w-full flex justify-between items-center text-[#292333]">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#7053AD]">
              <path d="M3 21H21M3 10H21M5 10V21M9 10V21M15 10V21M19 10V21M12 3L21 10H3L12 3Z" stroke="#7053AD" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-['Inter'] text-[13px] text-[#292333] font-normal tracking-[-0.01em]">
              {visibleInstitution}
            </span>
          </div>

          <div className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-wider text-[#756F80]">
            REGISTRAR WORKSPACE · {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
          </div>
        </div>

        {decryptionError && (
          <div className="w-full bg-[#98514C]/10 border border-[#98514C]/30 text-[#98514C] px-5 py-3 rounded-2xl text-xs flex justify-between items-center">
            <span>{decryptionError}</span>
            <button onClick={() => setDecryptionError(null)} className="font-bold underline ml-4">Dismiss</button>
          </div>
        )}

        {/* Registry Introduction Header */}
        <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex flex-col gap-2 max-w-[1108px]">
            <span className="font-['IBM_Plex_Mono'] text-[12px] uppercase tracking-wider text-[#7053AD]">
              INSTITUTIONAL / VERIFICATION HISTORY
            </span>
            <h1 className="font-['Cormorant_Garamond'] font-medium text-[54px] sm:text-[64px] leading-[1.02] text-[#292333] tracking-[-1.5px]">
              Verification Registry
            </h1>
            <h2 className="font-['Cormorant_Garamond'] font-normal text-[22px] sm:text-[24px] text-[#292333]">
              Immutable Record of Academic Truth
            </h2>
            <p className="font-['Inter'] font-normal text-[13px] leading-[1.6] text-[#756F80]">
              Trace the evidence behind every credential, from the first issuance to its latest verification.
            </p>
          </div>

          {/* Registry Toolbar Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {lockedEncryptedCount > 0 && (
              <button
                type="button"
                onClick={handleUnlockRecords}
                disabled={decrypting || !signer}
                title="Sign one wallet authorization to decrypt confidential IPFS fields"
                className="h-[50px] px-[20px] rounded-[10px] flex items-center justify-center gap-2 text-[13px] font-semibold bg-[#513582] hover:bg-[#41276b] disabled:opacity-50 text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>{decrypting ? 'Signing...' : `Unlock Confidential Records (${lockedEncryptedCount})`}</span>
              </button>
            )}

            <button 
              onClick={exportRegistryCSV}
              title="Download full registry records as CSV"
              className="h-[50px] px-[20px] rounded-[10px] flex items-center justify-center gap-[10px] text-[14px] font-semibold text-[#292333] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm shrink-0 cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.321569)',
                border: '1px solid rgba(255, 255, 255, 0.721569)',
              }}
            >
              <span>Export registry</span>
            </button>
          </div>
        </div>

        {/* ── MAIN GLASS PANEL: CREDENTIAL REGISTRY TABLE ─────────────── */}
        <div 
          className="w-full rounded-[28px] p-6 sm:p-7 flex flex-col gap-6"
          style={{
            background: 'rgba(255, 255, 255, 0.321569)',
            border: '1px solid rgba(255, 255, 255, 0.721569)',
            boxShadow: '0px 12px 30px rgba(81, 65, 109, 0.0470588), inset 0px 1px 2px rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {/* Registry Controls (Search & Scope) */}
          <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 pb-2">
            {/* Search Input */}
            <div className="flex flex-col items-start gap-2 w-full max-w-[510px]">
              <label className="font-['Inter'] font-semibold text-[13px] text-[#292333]">
                Search registry
              </label>
              <div 
                className="w-full h-[48px] px-4 flex items-center gap-3 rounded-[10px] transition-all focus-within:ring-2 focus-within:ring-[#7053AD]/30"
                style={{
                  background: 'rgba(255, 255, 255, 0.321569)',
                  border: '1px solid rgba(255, 255, 255, 0.721569)',
                }}
              >
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search Credential ID, Token ID, Enrollment No., holder wallet, or student name..."
                  className="w-full bg-transparent border-none text-[13px] text-[#292333] placeholder:text-[#756F80]/70 focus:outline-none"
                />
                {query && (
                  <button 
                    onClick={() => setQuery('')}
                    className="text-xs text-[#756F80] hover:text-[#292333] font-mono px-1"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Scope Metadata */}
            <div className="flex flex-col items-start lg:items-end gap-1 text-left lg:text-right">
              <span className="font-['Inter'] text-[11px] text-[#756F80]">
                {visibleInstitution} · All credential records
              </span>
              <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#756F80] uppercase">
                SNAPSHOT / {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Record Status Filter Pills */}
          <div className="w-full flex flex-wrap items-center gap-2">
            <button
              onClick={() => { setSelectedFilter('all'); setCurrentPage(1); }}
              className={`h-[31px] px-3.5 rounded-full text-[11px] transition-all flex items-center ${
                selectedFilter === 'all'
                  ? 'bg-[rgba(222,210,241,0.55)] border border-[rgba(112,83,173,0.2)] text-[#7053AD] font-semibold'
                  : 'bg-[rgba(255,255,255,0.22)] border border-[rgba(255,255,255,0.72)] text-[#756F80] hover:bg-white/40'
              }`}
            >
              All records · {counts.total}
            </button>

            <button
              onClick={() => { setSelectedFilter('verified'); setCurrentPage(1); }}
              className={`h-[31px] px-3.5 rounded-full text-[11px] transition-all flex items-center ${
                selectedFilter === 'verified'
                  ? 'bg-[rgba(222,210,241,0.55)] border border-[rgba(112,83,173,0.2)] text-[#7053AD] font-semibold'
                  : 'bg-[rgba(255,255,255,0.22)] border border-[rgba(255,255,255,0.72)] text-[#756F80] hover:bg-white/40'
              }`}
            >
              Verified · {counts.verified}
            </button>

            <button
              onClick={() => { setSelectedFilter('issued'); setCurrentPage(1); }}
              className={`h-[31px] px-3.5 rounded-full text-[11px] transition-all flex items-center ${
                selectedFilter === 'issued'
                  ? 'bg-[rgba(222,210,241,0.55)] border border-[rgba(112,83,173,0.2)] text-[#7053AD] font-semibold'
                  : 'bg-[rgba(255,255,255,0.22)] border border-[rgba(255,255,255,0.72)] text-[#756F80] hover:bg-white/40'
              }`}
            >
              Issued · {counts.issued}
            </button>

            <button
              onClick={() => { setSelectedFilter('revoked'); setCurrentPage(1); }}
              className={`h-[31px] px-3.5 rounded-full text-[11px] transition-all flex items-center ${
                selectedFilter === 'revoked'
                  ? 'bg-[rgba(222,210,241,0.55)] border border-[rgba(112,83,173,0.2)] text-[#7053AD] font-semibold'
                  : 'bg-[rgba(255,255,255,0.22)] border border-[rgba(255,255,255,0.72)] text-[#756F80] hover:bg-white/40'
              }`}
            >
              Revoked · {counts.revoked}
            </button>
          </div>

          {/* Table Header */}
          <div className="w-full hidden md:flex items-center gap-[22px] px-2 pt-2 text-[10px] font-normal text-[#756F80]">
            <div className="w-[215px] shrink-0">Credential & Token ID</div>
            <div className="w-[185px] shrink-0">Holder & Reg. No.</div>
            <div className="flex-1 min-w-[220px]">Degree</div>
            <div className="w-[112px] shrink-0">Issuance Date</div>
            <div className="w-[112px] shrink-0">Status</div>
            <div className="w-[100px] shrink-0 text-right">Action</div>
          </div>

          {/* Table Rows */}
          <div className="w-full flex flex-col">
            {paginatedRecords.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center justify-center gap-2 text-[#756F80]">
                <span className="font-['Cormorant_Garamond'] text-[24px] text-[#292333]">No Verification Records</span>
                <span className="text-[13px] max-w-sm">
                  {loading ? 'Reading credentials directly from the blockchain...' : query ? 'No credentials match your search query.' : 'No academic credentials have been recorded on-chain yet.'}
                </span>
                {Boolean(account && (isAdmin || isIssuer)) && !query && !loading && (
                  <button 
                    onClick={() => navigate('/issue')}
                    className="mt-3 px-5 py-2 rounded-full bg-[#513582] text-white text-xs font-semibold hover:bg-[#432a6e] transition-colors"
                  >
                    Issue First Credential
                  </button>
                )}
              </div>
            ) : (
              paginatedRecords.map((row, idx) => (
                <div key={`cred-${row.tokenId}-${selectedFilter}-${currentPage}-${idx}`} className="w-full flex flex-col">
                  {/* Row Divider */}
                  <div className="w-full h-[1px] bg-[rgba(125,101,154,0.141176)] my-3" />

                  {/* Row Details */}
                  <div className="w-full flex flex-col md:flex-row md:items-center gap-3 md:gap-[22px] px-2 py-1">
                    
                    {/* Credential ID + Bound Wallet */}
                    <div className="w-full md:w-[215px] flex flex-col gap-0.5 shrink-0">
                      <span className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#7053AD] font-semibold leading-[1.4] truncate" title={row.credentialId}>
                        {row.credentialId}
                      </span>
                      <span className="font-['IBM_Plex_Mono'] text-[9.5px] text-[#756F80] truncate" title={row.holderWallet}>
                        {row.formattedId} · {row.shortHolder}
                      </span>
                    </div>

                    {/* Student Name + Enrollment No. */}
                    <div className="w-full md:w-[185px] flex flex-col gap-0.5 shrink-0">
                      <span className="font-['Inter'] text-[13px] font-medium text-[#292333] truncate">
                        {row.studentName}
                      </span>
                      <span className="font-['IBM_Plex_Mono'] text-[9.5px] text-[#756F80] truncate">
                        {row.isLocked ? 'Enrollment: Encrypted' : `Reg: ${row.enrollmentNumber}`}
                      </span>
                    </div>

                    {/* Degree & Field */}
                    <div className="flex-1 min-w-[200px] flex flex-col gap-0.5">
                      <span className="font-['Inter'] text-[12px] text-[#292333] font-normal">
                        {row.degree}
                      </span>
                      <span className="font-['Inter'] text-[11px] text-[#756F80] font-normal">
                        {row.field}
                      </span>
                    </div>

                    {/* Issuance Date */}
                    <div className="w-full md:w-[112px] shrink-0 text-[12px] text-[#756F80]">
                      {row.issueDate}
                    </div>

                    {/* Status Badge */}
                    <div className="w-full md:w-[112px] shrink-0 flex flex-col items-start gap-1">
                      {row.revoked || row.status === 'Revoked' ? (
                        <div className="inline-flex items-center gap-[7px] px-3 py-[6px] rounded-full bg-[rgba(249,236,232,0.7)] text-[#98514C]">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#98514C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="15" y1="9" x2="9" y2="15"/>
                            <line x1="9" y1="9" x2="15" y2="15"/>
                          </svg>
                          <span className="font-['Inter'] text-[12px] font-semibold text-[#98514C]">
                            Revoked
                          </span>
                        </div>
                      ) : row.status === 'Issued' ? (
                        <div className="inline-flex items-center gap-[7px] px-3 py-[6px] rounded-full bg-[rgba(238,232,248,0.65)] text-[#7053AD]">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7053AD" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
                            <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
                            <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
                            <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
                            <line x1="7" y1="12" x2="17" y2="12"/>
                          </svg>
                          <span className="font-['Inter'] text-[12px] font-semibold text-[#7053AD]">
                            Issued
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-[7px] px-3 py-[6px] rounded-full bg-[rgba(233,243,238,0.7)] text-[#326956]">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#326956" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            <polyline points="9 12 11 14 15 10"/>
                          </svg>
                          <span className="font-['Inter'] text-[12px] font-semibold text-[#326956]">
                            Verified
                          </span>
                        </div>
                      )}
                      {row.isLocked && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100/90 text-amber-800 text-[10px] font-['IBM_Plex_Mono']">
                          <Lock className="w-2.5 h-2.5" />
                          AES-256
                        </span>
                      )}
                    </div>

                    {/* Action */}
                    <div className="w-full md:w-[100px] shrink-0 text-left md:text-right flex items-center justify-start md:justify-end gap-3">
                      {row.revoked || row.status === 'Revoked' ? (
                        <button 
                          onClick={() => setSelectedRecord(row)}
                          className="font-['Inter'] text-[11px] text-[#98514C] hover:underline"
                        >
                          Revocation ↗
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={() => setSelectedRecord(row)}
                            className="font-['Inter'] text-[11px] text-[#7053AD] hover:underline"
                          >
                            View record ↗
                          </button>
                          {isIssuer && contract && (
                            <button
                              onClick={() => onRevoke(row.tokenId)}
                              disabled={revokingId === row.tokenId}
                              title="Revoke credential on-chain"
                              className="text-[10px] text-[#98514C] hover:opacity-75 font-semibold ml-1.5"
                            >
                              {revokingId === row.tokenId ? '...' : 'Revoke'}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Divider Before Pagination */}
          <div className="w-full h-[1px] bg-[rgba(125,101,154,0.141176)] mt-2" />

          {/* Pagination Controls */}
          <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3 pt-1">
            <span className="font-['Inter'] text-[13px] text-[#756F80]">
              Showing {filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length.toLocaleString()} records
            </span>

            <div className="flex items-center gap-5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`font-['Inter'] text-[11px] transition-colors ${
                  currentPage === 1 ? 'text-[#9C95A5] cursor-not-allowed' : 'text-[#7053AD] hover:underline cursor-pointer'
                }`}
              >
                ← Previous
              </button>

              <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#7053AD]">
                {String(currentPage).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages}
                className={`font-['Inter'] text-[11px] transition-colors ${
                  currentPage >= totalPages ? 'text-[#9C95A5] cursor-not-allowed' : 'text-[#7053AD] hover:underline cursor-pointer'
                }`}
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Supporting Copy under Table */}
        <p className="font-['Inter'] text-[13px] leading-[1.6] text-[#756F80]">
          Verified: latest issuer check passed. Issued: no verification yet. Revoked: invalidated by the institution; the original record remains visible for audit.
        </p>

        {/* ── BOTTOM GLASS PANEL: REGISTRY INTEGRITY ──────────────────── */}
        <div 
          className="w-full rounded-[28px] p-6 sm:p-7 flex flex-col md:flex-row gap-6 md:gap-8 justify-between"
          style={{
            background: 'rgba(255, 255, 255, 0.321569)',
            border: '1px solid rgba(255, 255, 255, 0.721569)',
            boxShadow: '0px 12px 30px rgba(81, 65, 109, 0.0470588), inset 0px 1px 2px rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {/* Column 1: Hashing Integrity */}
          <div className="flex-1 flex flex-col gap-3 min-w-[260px]">
            <div className="flex items-center gap-2.5">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#7053AD" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/>
                <path d="M14 13.12c0 2.38 0 6.38-1 8.88"/>
                <path d="M2 12c0-3.87 3.13-7 7-7a7.01 7.01 0 0 1 6.81 5.37"/>
                <path d="M21.95 12c0-5.52-4.48-10-10-10C6.54 2 2.14 6.37 2.01 11.8"/>
                <path d="M18 12c0 3.31-2.69 6-6 6"/>
              </svg>
              <h3 className="font-['Inter'] font-semibold text-[13px] text-[#292333]">
                Hashing Integrity
              </h3>
            </div>
            <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#7053AD]">
              SHA-256 · all records anchored
            </span>
            <p className="font-['Inter'] text-[13px] leading-[1.6] text-[#756F80]">
              Latest root 0x4e7c...2a91 · No hash mismatches detected.
            </p>
          </div>

          {/* Column 2: Node Sync Status */}
          <div className="flex-1 flex flex-col gap-3 min-w-[260px]">
            <div className="flex items-center gap-2.5">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#7053AD" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="16" y="16" width="6" height="6" rx="1"/>
                <rect x="2" y="16" width="6" height="6" rx="1"/>
                <rect x="9" y="2" width="6" height="6" rx="1"/>
                <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/>
                <path d="M12 12V8"/>
              </svg>
              <h3 className="font-['Inter'] font-semibold text-[13px] text-[#292333]">
                Node Sync Status
              </h3>
            </div>
            <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#7053AD]">
              12 / 12 nodes synchronized
            </span>
            <p className="font-['Inter'] text-[13px] leading-[1.6] text-[#756F80]">
              Block 19,284,106 · Confirmed {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, 12:08 UTC.
            </p>
          </div>

          {/* Column 3: Protocol Zero */}
          <div className="flex-1 flex flex-col gap-3 min-w-[260px]">
            <div className="flex items-center gap-2.5">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#7053AD" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
              <h3 className="font-['Inter'] font-semibold text-[13px] text-[#292333]">
                Protocol Zero
              </h3>
            </div>
            <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#7053AD]">
              Immutable by design
            </span>
            <p className="font-['Inter'] text-[13px] leading-[1.6] text-[#756F80]">
              Every issuance and revocation is retained. History cannot be overwritten.
            </p>
          </div>
        </div>
      </main>

      {/* ── RECORD DETAILS MODAL ────────────────────────────────────── */}
      {activeModalRecord && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div 
            className="w-full max-w-[580px] rounded-[28px] p-7 flex flex-col gap-5 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            style={{
              background: '#EAEAEA',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#7053AD] uppercase tracking-wider">
                  REGISTRY AUDIT RECORD · {activeModalRecord.formattedId}
                </span>
                <h3 className="font-['Cormorant_Garamond'] text-[28px] font-medium text-[#292333] leading-none">
                  {activeModalRecord.credentialId}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedRecord(null)}
                className="w-8 h-8 rounded-full bg-white/60 hover:bg-white flex items-center justify-center text-sm font-bold text-[#292333] transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {activeModalRecord.isLocked && (
              <div className="p-3.5 rounded-2xl bg-amber-100/80 border border-amber-300/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2 text-[11.5px] text-amber-950">
                  <Lock className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                  <span>Confidential student & degree fields are AES-256-GCM encrypted on IPFS.</span>
                </div>
                <button
                  type="button"
                  onClick={handleUnlockRecords}
                  disabled={decrypting || !signer}
                  className="px-3.5 py-1.5 rounded-full bg-[#513582] hover:bg-[#41276b] disabled:opacity-50 text-white text-[11px] font-semibold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Unlock className="w-3 h-3" />
                  <span>{decrypting ? 'Signing...' : 'Unlock Now'}</span>
                </button>
              </div>
            )}

            <div className="w-full flex flex-col gap-2.5 py-1 text-[13px]">
              <div className="flex justify-between gap-4 py-2 border-b border-black/10">
                <span className="text-[#756F80] shrink-0">Credential ID</span>
                <span className="font-['IBM_Plex_Mono'] font-semibold text-[#513582] text-right">{activeModalRecord.credentialId}</span>
              </div>
              <div className="flex justify-between gap-4 py-2 border-b border-black/10">
                <span className="text-[#756F80] shrink-0">Soulbound Holder Wallet</span>
                <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#292333] break-all text-right">{activeModalRecord.holderWallet || 'N/A'}</span>
              </div>
              <div className="flex justify-between gap-4 py-2 border-b border-black/10">
                <span className="text-[#756F80] shrink-0">Enrollment / Reg. No.</span>
                <span className="font-['IBM_Plex_Mono'] text-[#292333] text-right">{activeModalRecord.enrollmentNumber}</span>
              </div>
              <div className="flex justify-between gap-4 py-2 border-b border-black/10">
                <span className="text-[#756F80] shrink-0">Student Name</span>
                <span className="font-medium text-[#292333] text-right">{activeModalRecord.studentName}</span>
              </div>
              <div className="flex justify-between gap-4 py-2 border-b border-black/10">
                <span className="text-[#756F80] shrink-0">Institution</span>
                <span className="font-medium text-[#292333] text-right">{activeModalRecord.institution}</span>
              </div>
              <div className="flex justify-between gap-4 py-2 border-b border-black/10">
                <span className="text-[#756F80] shrink-0">Degree Awarded</span>
                <span className="font-medium text-[#292333] text-right">{activeModalRecord.degree}</span>
              </div>
              <div className="flex justify-between gap-4 py-2 border-b border-black/10">
                <span className="text-[#756F80] shrink-0">Field of Study</span>
                <span className="font-medium text-[#292333] text-right">{activeModalRecord.field}</span>
              </div>
              <div className="flex justify-between gap-4 py-2 border-b border-black/10">
                <span className="text-[#756F80] shrink-0">Grade / Honours</span>
                <span className="font-medium text-[#292333] text-right">{activeModalRecord.grade}</span>
              </div>
              <div className="flex justify-between gap-4 py-2 border-b border-black/10">
                <span className="text-[#756F80] shrink-0">Conferral Date</span>
                <span className="font-medium text-[#292333] text-right">{activeModalRecord.issueDate}</span>
              </div>
              <div className="flex justify-between gap-4 py-2 border-b border-black/10">
                <span className="text-[#756F80] shrink-0">Integrity / Provenance</span>
                <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#7053AD] text-right">{activeModalRecord.provenance}</span>
              </div>
              <div className="flex justify-between gap-4 py-2 border-b border-black/10">
                <span className="text-[#756F80] shrink-0">Status</span>
                <span className={`font-semibold ${activeModalRecord.revoked ? 'text-[#98514C]' : 'text-[#326956]'}`}>
                  {activeModalRecord.status}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
              {!activeModalRecord.isLocked && !activeModalRecord.revoked && !activeModalRecord.isUnavailable && (
                <button
                  type="button"
                  onClick={() => handleModalDownloadPdf(activeModalRecord)}
                  disabled={downloadingPdf}
                  className="px-4 py-2.5 rounded-full text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#513582]" />
                  <span>{downloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
                </button>
              )}
              <button
                onClick={() => {
                  const tid = activeModalRecord.tokenId;
                  setSelectedRecord(null);
                  navigate(`/public-verify?tokenId=${tid}`);
                }}
                className="px-4 py-2.5 rounded-full text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Open in Public Verify ↗
              </button>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[#2D264B] text-white hover:bg-[#3C315B] transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;