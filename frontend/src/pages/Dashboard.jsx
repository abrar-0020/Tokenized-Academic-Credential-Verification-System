import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import SettingsDropdown from '../components/SettingsDropdown';
import { 
  ArrowRight, 
  ArrowUpRight, 
  ShieldCheck, 
  Activity, 
  ScanLine, 
  XCircle, 
  CheckCircle,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { loadAllCredentials, loadStudentCredentials, revokeCredential } from '../logic';

const Dashboard = () => {
  const navigate = useNavigate();
  const { account, contract, isAdmin, isIssuer, networkId, connectWallet, disconnectWallet, loading: web3Loading, error: web3Error } = useWeb3();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [credentials, setCredentials] = useState([]);
  const [allCredentials, setAllCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [viewMode, setViewMode] = useState('issued');
  const [quickRevokeId, setQuickRevokeId] = useState('');
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    if (account && !isAdmin && !isIssuer && !web3Loading) {
      navigate('/student-dashboard');
      return;
    }
    if (account && contract) {
      void hydrate();
    } else {
      setLoading(false);
    }
  }, [account, contract, isAdmin, isIssuer, web3Loading]);

  const hydrate = async () => {
    try {
      setLoading(true);
      setError(null);
      const owned = await loadStudentCredentials(contract, account);
      setCredentials(owned || []);
      if (isIssuer) {
        const all = await loadAllCredentials(contract);
        setAllCredentials(all || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data from network.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (tokenId) => {
    if (!tokenId && tokenId !== 0) return;
    if (!window.confirm(`Are you sure you want to revoke credential #${tokenId}? This action is irreversible on-chain.`)) return;
    try {
      setRevoking(true);
      setError(null);
      await revokeCredential(contract, tokenId);
      setSuccess(`Credential #${tokenId} has been revoked on-chain.`);
      setQuickRevokeId('');
      await hydrate();
    } catch (err) {
      setError(err.message || 'Failed to revoke credential.');
    } finally {
      setRevoking(false);
    }
  };

  // Metrics calculation from live on-chain credentials
  const totalIssuedCount = allCredentials.length;
  const validCount = allCredentials.filter((c) => !c.revoked).length;
  const revokedCount = allCredentials.filter((c) => c.revoked).length;
  const activeCount = totalIssuedCount - revokedCount;
  const revenueCalculated = (totalIssuedCount * 5).toLocaleString();

  // Most recent credential for certificate preview
  const latestCredential = allCredentials.length > 0 ? allCredentials[allCredentials.length - 1] : null;

  const displayStudentName = latestCredential?.metadata?.studentName || "Candidate Full Name";
  const displayDegree = latestCredential?.metadata?.degree || "Degree Program";
  const displayField = latestCredential?.metadata?.branch || latestCredential?.metadata?.fieldOfStudy || latestCredential?.metadata?.field || "Specialization / Branch";
  const displayInstitution = latestCredential?.metadata?.institution || (account ? `Institution (${account.slice(0, 6)}...${account.slice(-4)})` : "Institution Name");
  const displayTokenId = latestCredential?.tokenId !== undefined ? `TC-RU-2026-${String(latestCredential.tokenId).padStart(5, '0')}` : "TC-TOKEN-RECORD";
  const displayDate = latestCredential?.metadata?.issueDate || (latestCredential?.issueTimestamp ? new Date(Number(latestCredential.issueTimestamp) * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : "Pending Issuance");

  // SVG Icons
  const Icons = {
    BrandMark: () => (
      <div className="flex items-center justify-center w-9 h-9 bg-[#513582] rounded-[9px] shadow-sm flex-shrink-0">
        <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.5 3L2 7.5L10.5 12L19 7.5L10.5 3Z" stroke="#FFFEFA" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12.5L10.5 17L19 12.5" stroke="#FFFEFA" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    ),
    Landmark: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 21H21" stroke="#513582" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 3L2 8H22L12 3Z" stroke="#513582" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 11V17" stroke="#513582" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 11V17" stroke="#513582" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 11V17" stroke="#513582" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 11V17" stroke="#513582" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Eye: () => (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.08337 6.5C1.08337 6.5 2.70837 3.25 6.50004 3.25C10.2917 3.25 11.9167 6.5 11.9167 6.5C11.9167 6.5 10.2917 9.75 6.50004 9.75C2.70837 9.75 1.08337 6.5 1.08337 6.5Z" stroke="#7053AD" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6.5 7.58333C7.09831 7.58333 7.58333 7.09831 7.58333 6.5C7.58333 5.90169 7.09831 5.41667 6.5 5.41667C5.90169 5.41667 5.41667 5.90169 5.41667 6.5C5.41667 7.09831 5.90169 7.58333 6.5 7.58333Z" stroke="#7053AD" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  };

  const recentList = allCredentials.slice(-4).reverse().map((c) => ({
    id: `TC-RU-2026-${String(c.tokenId).padStart(5, '0')}`,
    name: c.metadata?.studentName || `Scholar #${c.tokenId}`,
    time: c.issueTimestamp ? new Date(Number(c.issueTimestamp) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC' : 'Recorded',
    status: c.revoked ? 'Revoked' : 'Verified',
    statusType: c.revoked ? 'revoked' : 'verified'
  }));

  return (
    <div className="min-h-screen bg-[#CDCDCD] text-[#292333] font-['Inter'] flex flex-col selection:bg-[#7053AD]/20 selection:text-[#513582]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');
      `}</style>

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
            <span className="cursor-pointer hover:opacity-70 transition-opacity font-semibold text-[#513582]" onClick={() => navigate('/dashboard')}>Dashboard</span>
            {Boolean(account && (isAdmin || isIssuer)) && (
              <>
                <span className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => navigate('/issue')}>Issue</span>
                <span className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => navigate('/history')}>History</span>
              </>
            )}
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

            <button 
              onClick={account ? disconnectWallet : connectWallet} 
              title={account ? `Connected: ${account} (Click to disconnect)` : 'Connect Wallet'}
              className="h-[44px] px-[16px] sm:h-[56px] sm:px-[24px] text-[13px] sm:text-[15px] font-[500] rounded-full flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_8px_24px_rgba(176,150,250,0.2)] bg-[#2D264B] text-white hover:bg-[#3C315B]"
            >
              {account ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="hidden xs:inline">Connected</span>
                  <span className="xs:hidden">✓</span>
                </>
              ) : (
                <span>Connect</span>
              )}
            </button>

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
                className="text-left px-4 py-3 rounded-2xl bg-[#513582]/10 text-[#513582] text-[15px] font-semibold flex items-center justify-between"
              >
                <span>Dashboard</span>
                <span>●</span>
              </button>
              {Boolean(account && (isAdmin || isIssuer)) && (
                <>
                  <button 
                    onClick={() => { navigate('/issue'); setMobileMenuOpen(false); }} 
                    className="text-left px-4 py-3 rounded-2xl hover:bg-black/5 text-[15px] text-[#292333]"
                  >
                    Issue Credential
                  </button>
                  <button 
                    onClick={() => { navigate('/history'); setMobileMenuOpen(false); }} 
                    className="text-left px-4 py-3 rounded-2xl hover:bg-black/5 text-[15px] text-[#292333]"
                  >
                    History
                  </button>
                </>
              )}
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
      <main className="max-w-[1440px] w-full mx-auto px-6 md:px-16 py-8 md:py-10 flex flex-col gap-8 flex-grow">
        
        {/* Alerts if any */}
        {error && (
          <div className="w-full bg-[#98514C]/10 border border-[#98514C]/30 text-[#98514C] px-5 py-3 rounded-2xl text-xs flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold underline ml-4">Dismiss</button>
          </div>
        )}
        {success && (
          <div className="w-full bg-[#326956]/10 border border-[#326956]/30 text-[#326956] px-5 py-3 rounded-2xl text-xs flex justify-between items-center">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="font-bold underline ml-4">Dismiss</button>
          </div>
        )}

        {/* Institution Context Line */}
        <div className="w-full flex justify-between items-center text-[#292333]">
          {/* Identity */}
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#7053AD]">
              <path d="M3 21H21M3 10H21M5 10V21M9 10V21M15 10V21M19 10V21M12 3L21 10H3L12 3Z" stroke="#7053AD" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-['Inter'] text-[13px] text-[#292333] font-normal tracking-[-0.01em]">
              {displayInstitution}
            </span>
          </div>

          {/* Workspace access timestamp */}
          <div className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-wider text-[#756F80]">
            REGISTRAR WORKSPACE · {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
          </div>
        </div>

        {/* ── TOP SECTION: PROTOCOL OVERVIEW & LATEST CREDENTIAL ──────── */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* LEFT: Institutional Overview (cols-5) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Section marker & Headline */}
            <div className="flex flex-col gap-3">
              <span className="font-['IBM_Plex_Mono'] text-[12px] uppercase tracking-wider text-[#7053AD]">
                INSTITUTIONAL / OVERVIEW
              </span>
              
              <h1 className="font-['Cormorant_Garamond'] font-medium text-[54px] sm:text-[64px] leading-[1.02] text-[#292333] tracking-[-1.5px]">
                Protocol Overview
              </h1>

              <p className="font-['Inter'] font-normal text-[13px] leading-[1.6] text-[#756F80]">
                An enduring record of achievement. Oversee your institution's credentials, holders and trust on the network.
              </p>
            </div>

            {/* Credential Ownership Toggle Tabs */}
            <div className="inline-flex items-center p-1 bg-white/20 border border-white/70 rounded-full w-fit">
              <button
                onClick={() => setViewMode('owned')}
                className={`px-5 py-2 rounded-full font-['Inter'] text-[12px] transition-all ${
                  viewMode === 'owned'
                    ? 'bg-white/50 text-[#7053AD] font-semibold shadow-sm'
                    : 'text-[#756F80] hover:text-[#292333]'
                }`}
              >
                Owned
              </button>
              <button
                onClick={() => setViewMode('issued')}
                className={`px-5 py-2 rounded-full font-['Inter'] text-[12px] transition-all ${
                  viewMode === 'issued'
                    ? 'bg-white/50 text-[#7053AD] font-semibold shadow-sm'
                    : 'text-[#756F80] hover:text-[#292333]'
                }`}
              >
                Issued · {totalIssuedCount.toLocaleString()}
              </button>
            </div>

            {/* Protocol Metrics Glass Panel */}
            <div 
              className="w-full rounded-[28px] p-7 flex flex-col gap-4"
              style={{
                background: 'rgba(255, 255, 255, 0.32)',
                border: '1px solid rgba(255, 255, 255, 0.72)',
                boxShadow: '0px 12px 30px rgba(81, 65, 109, 0.047), inset 0px 1px 2px rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              
              {/* Metric 1: Total Credentials Issued */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1.5">
                  <span className="font-['Inter'] text-[12px] text-[#292333]">
                    Total Credentials Issued
                  </span>
                  <span className="font-['Inter'] text-[10px] text-[#756F80]">
                    {totalIssuedCount === 0 ? '0 this month' : `+${totalIssuedCount} total`}
                  </span>
                </div>
                <div className="font-['Cormorant_Garamond'] font-medium text-[42px] sm:text-[46px] leading-none text-[#292333] tracking-[-1px]">
                  {totalIssuedCount.toLocaleString()}
                </div>
              </div>

              <div className="w-full h-[1px] bg-[rgba(125,101,154,0.14)]" />

              {/* Metric 2: Verified Holders */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1.5">
                  <span className="font-['Inter'] text-[12px] text-[#292333]">
                    Verified Holders
                  </span>
                  <span className="font-['Inter'] text-[10px] text-[#756F80]">
                    {totalIssuedCount === 0 ? '0% of issued credentials' : `${((validCount / totalIssuedCount) * 100).toFixed(1)}% of issued credentials`}
                  </span>
                </div>
                <div className="font-['Cormorant_Garamond'] font-medium text-[42px] sm:text-[46px] leading-none text-[#292333] tracking-[-1px]">
                  {validCount.toLocaleString()}
                </div>
              </div>

              <div className="w-full h-[1px] bg-[rgba(125,101,154,0.14)]" />

              {/* Metric 3: Issuance Revenue */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1.5">
                  <span className="font-['Inter'] text-[12px] text-[#292333]">
                    Issuance Revenue
                  </span>
                  <span className="font-['Inter'] text-[10px] text-[#756F80]">
                    USDC · 5 per credential
                  </span>
                </div>
                <div className="font-['Cormorant_Garamond'] font-medium text-[42px] sm:text-[46px] leading-none text-[#292333] tracking-[-1px]">
                  {revenueCalculated}
                </div>
              </div>

            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => navigate('/issue')}
              className="w-full h-[50px] bg-[#513582] hover:bg-[#432a6e] text-white rounded-[10px] font-['Inter'] font-semibold text-[14px] flex items-center justify-center gap-2.5 shadow-[0px_16px_28px_rgba(68,50,84,0.13)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>New Issuance</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* RIGHT: Latest Credential Presentation (cols-7) - IDENTICAL TO PUBLIC VERIFY */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Header row */}
            <div className="flex justify-between items-center">
              <span className="font-['IBM_Plex_Mono'] text-[12px] uppercase tracking-wider text-[#7053AD]">
                LATEST ISSUANCE / CLASS OF 2026
              </span>
              <button 
                onClick={() => navigate('/public-verify')} 
                className="text-[#7053AD] hover:opacity-80 transition-opacity flex items-center gap-1 font-['Inter'] text-[12px]"
                title="View in public verifier"
              >
                <span>Verify</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* Credential Presentation Glass Card */}
            <div className="relative flex flex-col items-center w-full max-w-[706px]">
              <div 
                className="relative flex flex-col items-center justify-center w-full h-[360px] sm:h-[450px] md:h-[520px] lg:h-[552px] rounded-[20px] sm:rounded-[28px] isolate overflow-hidden"
                style={{
                  background: 'rgba(198, 198, 200, 0.22)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.72)',
                  boxShadow: '0px 12px 30px rgba(81, 65, 109, 0.047), inset 0px 1px 2px rgba(255, 255, 255, 0.4)'
                }}
              >
                {/* Ambient glow */}
                <div className="absolute -top-32 -right-20 w-[400px] h-[400px] bg-white/20 rounded-full blur-2xl pointer-events-none" />

                {/* Responsive Scaled Container for the paper stack */}
                <div className="w-full flex items-center justify-center -mt-6 sm:-mt-8">
                  <div className="transform scale-[0.46] xs:scale-[0.54] sm:scale-[0.72] md:scale-[0.88] lg:scale-100 origin-center transition-transform duration-200">
                    <div className="relative w-[608px] h-[452px]">
                  
                  {/* Layer 1 (Bottom paper, shifted right and rotated right) */}
                  <div className="absolute inset-0 bg-[#E8E2D2] shadow-[0px_16px_28px_rgba(68,50,84,0.1)] rounded-[3px] rotate-[4deg] translate-x-[20px] -translate-y-[6px] z-10 pointer-events-none"></div>

                  {/* Layer 2 (Middle paper, shifted right and rotated right) */}
                  <div className="absolute inset-0 bg-[#F5F0E6] shadow-[0px_16px_28px_rgba(68,50,84,0.1)] rounded-[3px] rotate-[2deg] translate-x-[10px] -translate-y-[3px] z-10 pointer-events-none"></div>

                  {/* Layer 3 (Top Credential artifact) */}
                  <div className="absolute inset-0 flex flex-col items-center px-7 py-4 bg-[#FFFEFA] border border-[#E8DBC0]/50 shadow-[0px_24px_48px_rgba(68,50,84,0.15)] rounded-[3px] z-20 overflow-hidden">
                    
                    {/* Issuer identity */}
                    <div className="flex items-center gap-2 mb-1">
                      <Icons.Landmark />
                      <h2 className="font-['Cormorant_Garamond'] font-semibold text-[22px] leading-[26px] text-[#513582]">
                        {displayInstitution}
                      </h2>
                    </div>
                    <p className="font-['Inter'] font-normal text-[8.5px] tracking-[1.8px] text-[#756F80] mb-2 uppercase">
                      Knowledge • Integrity • Possibility
                    </p>

                    {/* Engraved rule */}
                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#E8DBC0] to-transparent mb-2"></div>

                    <p className="font-['Inter'] font-normal text-[8.5px] tracking-[2px] text-[#7053AD] uppercase mb-1.5">
                      Degree Certificate
                    </p>

                    {/* Award title */}
                    <h1 className="font-['Cormorant_Garamond'] font-medium text-[32px] sm:text-[35px] leading-[1.12] text-[#292333] mb-0.5 text-center max-w-[520px] mx-auto text-balance">
                      {displayDegree}
                    </h1>
                    
                    <p className="font-['Cormorant_Garamond'] font-normal text-[19px] sm:text-[21px] text-[#5B5565] mb-1 text-center max-w-[500px] mx-auto text-balance">
                      in {displayField}
                    </p>

                    <p className="font-['Cormorant_Garamond'] text-[13.5px] text-[#756F80] mb-0.5 text-center">
                      is hereby conferred upon
                    </p>

                    {/* Graduate name */}
                    <h2 className="font-['Cormorant_Garamond'] font-semibold text-[38px] sm:text-[42px] leading-[1] text-[#513582] mb-0.5 text-center max-w-[520px] mx-auto text-balance">
                      {displayStudentName}
                    </h2>

                    {/* Award distinction */}
                    <p className="font-['Cormorant_Garamond'] text-[17px] sm:text-[19px] text-[#5B5565] mb-2 text-center leading-normal">
                      with a Cumulative Grade of{' '}
                      <span className="font-['Inter'] font-semibold text-[16px] sm:text-[18px] text-[#292333] ml-0.5 tracking-tight inline-block align-baseline">
                        {latestCredential?.metadata?.grade || '3.92 / 4.00 · First Class'}
                      </span>
                    </p>

                    {/* Academic attestation */}
                    <div className="flex justify-between items-end w-full mt-auto mb-1">
                      {/* QR Code Verification */}
                      <div className="flex items-center gap-2 w-36">
                        <div className="p-1 bg-white border border-[#E8DBC0] rounded-[5px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] shrink-0">
                          <QRCodeSVG 
                            value={latestCredential?.tokenId !== undefined ? `${window.location.origin}/public-verify?tokenId=${latestCredential.tokenId}` : `${window.location.origin}/public-verify`} 
                            size={44} 
                            level="H"
                            fgColor="#292333"
                            bgColor="#FFFFFF"
                          />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-['Inter'] font-semibold text-[7.5px] tracking-[0.4px] text-[#513582] uppercase leading-tight">
                            Scan to Verify
                          </span>
                          <span className="font-['Inter'] text-[7px] text-[#756F80] leading-tight mt-0.5">
                            TokCred Network
                          </span>
                          <span className="font-['IBM_Plex_Mono'] text-[6.5px] text-[#8C6D34] leading-tight mt-0.5">
                            {latestCredential?.tokenId !== undefined ? `ID: #${latestCredential.tokenId}` : 'On-Chain Proof'}
                          </span>
                        </div>
                      </div>

                      {/* University seal */}
                      <div className="relative flex items-center justify-center w-[58px] h-[58px] shrink-0">
                        {/* Outer embossed edge */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#E2C889] via-[#D5B571] to-[#AC8C4A] rounded-full shadow-[0_3px_10px_rgba(0,0,0,0.12),inset_0_2px_4px_rgba(255,255,255,0.6),inset_0_-2px_4px_rgba(0,0,0,0.2)]"></div>
                        {/* Inner ring */}
                        <div className="absolute inset-[2.5px] border-[1px] border-[#8C6D34]/30 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] bg-gradient-to-br from-[#D8B975] to-[#C09B52]"></div>
                        {/* Innermost texture */}
                        <div className="absolute inset-[5px] border-[0.5px] border-[#FFE9A6]/40 rounded-full bg-gradient-to-br from-[#E8CF94] to-[#C9A963] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)]"></div>
                        <div className="flex flex-col items-center gap-[1px] z-10 mt-0.5 drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                          <div className="scale-[0.5] text-[#513582]"><Icons.Landmark /></div>
                          <span className="font-['Cormorant_Garamond'] font-bold text-[8.5px] text-[#513582] tracking-wide">SEAL</span>
                        </div>
                      </div>

                      {/* Registrar */}
                      <div className="flex flex-col items-end gap-[2px] w-32">
                        <span className="font-['Cormorant_Garamond'] italic text-[21px] text-[#513582] leading-[1]">
                          {latestCredential?.issuer ? `${latestCredential.issuer.slice(0, 6)}...${latestCredential.issuer.slice(-4)}` : (account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Academic Registrar')}
                        </span>
                        <div className="w-full h-[1px] bg-gradient-to-l from-transparent via-[#E8DBC0] to-transparent"></div>
                        <span className="font-['Inter'] text-[7.5px] text-[#756F80] uppercase">Authorized Signatory</span>
                      </div>
                    </div>

                    {/* Credential provenance */}
                    <div className="flex justify-between items-center w-full pt-1.5 border-t border-[#E8DBC0]/40">
                      <span className="font-['IBM_Plex_Mono'] text-[8.5px] text-[#9C95A5]">
                        {displayTokenId}
                      </span>
                      <span className="font-['Inter'] text-[8.5px] tracking-[0.5px] text-[#7053AD] uppercase font-medium">
                        Digitally Issued • TokCred
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Presentation caption */}
              <div className="absolute bottom-[14px] sm:bottom-[24px] flex items-center gap-2 px-3 sm:px-[18px] py-1.5 sm:py-[10px] bg-white/95 border border-white rounded-full z-30 shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-md max-w-[90%]">
                <div className="text-[#7053AD] shrink-0">
                  <Icons.Eye />
                </div>
                <span className="font-['Inter'] text-[10px] sm:text-[12px] text-[#292333] font-medium tracking-[0.2px] truncate">
                  Latest issuance · official academic record
                </span>
              </div>
            </div>
          </div>

            {/* Institutional assurance tag */}
            <div className="w-full flex items-center gap-2 text-[#756F80] text-[13px] pt-1">
              <ShieldCheck className="w-[18px] h-[18px] text-[#7053AD] flex-shrink-0" />
              <span>
                Signed by {displayInstitution}. Preserved for the graduate. Independently verifiable, wherever they go.
              </span>
            </div>
          </div>
        </div>

        {/* ── BOTTOM SECTION: REGISTRY ACTIVITY & OPERATIONS ──────────── */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Recent Verifications (cols-8) */}
          <div className="lg:col-span-8 flex flex-col">
            <div 
              className="w-full rounded-[28px] p-7 flex flex-col gap-5"
              style={{
                background: 'rgba(255, 255, 255, 0.32)',
                border: '1px solid rgba(255, 255, 255, 0.72)',
                boxShadow: '0px 12px 30px rgba(81, 65, 109, 0.047), inset 0px 1px 2px rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              
              {/* Header */}
              <div className="flex justify-between items-baseline">
                <h3 className="font-['Cormorant_Garamond'] text-[24px] text-[#292333]">
                  Recent Verifications
                </h3>
                <span 
                  onClick={() => navigate('/history')}
                  className="font-['Inter'] text-[11px] text-[#7053AD] hover:underline cursor-pointer flex items-center gap-1"
                >
                  View all
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <p className="font-['Inter'] text-[13px] text-[#756F80]">
                {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · Latest checks and records awaiting verification
              </p>

              {/* Entries List */}
              <div className="flex flex-col">
                {recentList.length === 0 ? (
                  <div className="py-8 text-center text-[13px] text-[#756F80]">
                    No credentials recorded yet. Credentials issued on-chain will appear here.
                  </div>
                ) : (
                  recentList.map((item, idx) => (
                  <div key={idx} className="flex flex-col">
                    <div className="w-full h-[1px] bg-[rgba(125,101,154,0.14)] my-3" />
                    
                    <div className="flex items-center justify-between py-1">
                      {/* Left: Holder name & metadata */}
                      <div className="flex flex-col gap-1">
                        <span className="font-['Inter'] font-medium text-[13px] text-[#292333]">
                          {item.name}
                        </span>
                        <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#756F80]">
                          {item.id} · {item.time}
                        </span>
                      </div>

                      {/* Right: Status badge */}
                      <div>
                        {item.statusType === 'verified' && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(233,243,238,0.7)] text-[#326956] rounded-full text-[12px] font-['Inter'] font-semibold shadow-xs">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verified</span>
                          </div>
                        )}
                        {item.statusType === 'issued' && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(238,232,248,0.65)] text-[#7053AD] rounded-full text-[12px] font-['Inter'] font-semibold shadow-xs">
                            <ScanLine className="w-3.5 h-3.5" />
                            <span>Issued</span>
                          </div>
                        )}
                        {item.statusType === 'revoked' && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(249,236,232,0.7)] text-[#98514C] rounded-full text-[12px] font-['Inter'] font-semibold shadow-xs">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Revoked</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )))}
              </div>

            </div>
          </div>

          {/* Protocol Operations & Quick Revoke (cols-4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div 
              className="w-full rounded-[28px] p-7 flex flex-col gap-5"
              style={{
                background: 'rgba(255, 255, 255, 0.32)',
                border: '1px solid rgba(255, 255, 255, 0.72)',
                boxShadow: '0px 12px 30px rgba(81, 65, 109, 0.047), inset 0px 1px 2px rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              
              {/* Network Health */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#7053AD]" />
                  <h3 className="font-['Cormorant_Garamond'] text-[24px] text-[#292333]">
                    Network Health
                  </h3>
                </div>

                <div className="flex items-center gap-2 font-['Inter'] text-[12px] text-[#326956]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#326956] animate-pulse" />
                  <span>All systems operational</span>
                </div>

                <p className="font-['IBM_Plex_Mono'] text-[12px] text-[#756F80] leading-[1.4] pt-1">
                  99.98% uptime · 12 / 12 nodes synced<br/>
                  Latest block 19,284,106 · 12:08 UTC
                </p>
              </div>

              <div className="w-full h-[1px] bg-[rgba(125,101,154,0.14)]" />

              {/* Quick Revocation Tool */}
              <div className="flex flex-col gap-3">
                <h3 className="font-['Cormorant_Garamond'] text-[24px] text-[#292333]">
                  Quick Revoke
                </h3>
                
                <p className="font-['Inter'] text-[13px] leading-[1.6] text-[#756F80]">
                  Review a credential before revoking. This action is permanent and recorded on-chain.
                </p>

                <div className="flex flex-col gap-2 mt-1">
                  <label className="font-['Inter'] font-semibold text-[13px] text-[#292333]">
                    Credential ID
                  </label>
                  
                  <div className="w-full flex items-center px-4 py-3 bg-white/30 border border-white/70 rounded-[10px] focus-within:border-[#7053AD] transition-colors">
                    <input
                      type="text"
                      placeholder="e.g. 0 or TC-RU-2026-08416"
                      value={quickRevokeId}
                      onChange={(e) => setQuickRevokeId(e.target.value)}
                      className="w-full bg-transparent font-['IBM_Plex_Mono'] text-[13px] text-[#292333] placeholder-[#756F80]/60 outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    const cleanId = quickRevokeId.replace(/[^0-9]/g, '');
                    if (cleanId === '') {
                      alert('Please provide a valid numeric credential token ID.');
                      return;
                    }
                    void handleRevoke(cleanId);
                  }}
                  disabled={revoking || !quickRevokeId}
                  className="w-full h-[50px] mt-1 bg-white/30 hover:bg-white/50 border border-white/70 rounded-[10px] font-['Inter'] font-semibold text-[14px] text-[#292333] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {revoking ? 'Processing On-Chain...' : 'Review revocation'}
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Footer Sub-scope note */}
        <div className="w-full flex justify-between items-center text-[#756F80] text-[11px] pt-4 border-t border-black/5 mt-auto">
          <span>Institution-owned records · {revokedCount} revoked · {validCount.toLocaleString()} active</span>
          <span 
            onClick={() => navigate('/public-verify')}
            className="text-[#7053AD] hover:underline cursor-pointer flex items-center gap-1"
          >
            Open public verification
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>

      </main>

    </div>
  );
};

export default Dashboard;
