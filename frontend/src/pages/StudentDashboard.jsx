import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import SettingsDropdown from '../components/SettingsDropdown';
import { 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Download, 
  Search, 
  Share2, 
  FileText, 
  Sparkles, 
  ShieldCheck,
  Building,
  Calendar,
  Layers,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';
import { loadStudentCredentials } from '../logic';
import { formatDate, ipfsToHttp } from '../utils/helpers';
import { CONTRACT_ADDRESS } from '../config/contract';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { account, contract, isAdmin, isIssuer, networkId, connectWallet, disconnectWallet, loading: web3Loading, error: web3Error } = useWeb3();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (account && contract) {
      void fetchStudentData();
    } else {
      setLoading(false);
    }
  }, [account, contract]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);
      const owned = await loadStudentCredentials(contract, account);
      const list = owned || [];
      setCredentials(list);
      if (list.length > 0) {
        setSelectedCredential(list[0]);
      }
    } catch (err) {
      console.error('Failed to load student credentials:', err);
      setError('Unable to load on-chain credentials for this wallet.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeCredentials = credentials.filter(c => !c.revoked);
  const activeCred = selectedCredential || (credentials.length > 0 ? credentials[0] : null);

  const meta = activeCred?.metadata || {};
  const displayStudentName = meta.studentName || (account ? `Scholar (${account.slice(0, 6)}...${account.slice(-4)})` : 'Candidate Scholar');
  const displayDegree = meta.degree || 'Academic Credential';
  const displayField = meta.branch || meta.fieldOfStudy || meta.field || 'Specialization / Program';
  const displayInstitution = meta.institution || 'Issuing University';
  const displayGrade = meta.grade || 'Honors';
  const displayTokenId = activeCred?.tokenId !== undefined ? `TC-RU-2026-${String(activeCred.tokenId).padStart(5, '0')}` : 'TC-TOKEN-RECORD';
  const displayDate = meta.issueDate || (activeCred?.issueTimestamp ? formatDate(activeCred.issueTimestamp) : 'Certified');

  return (
    <div className="min-h-screen bg-[#CDCDCD] text-[#292333] font-['Inter'] flex flex-col selection:bg-[#7053AD]/20 selection:text-[#513582]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');
      `}</style>

      {/* ── TOP NAVIGATION (Student Role - strictly NO Issue, NO History) ────────── */}
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

          {/* Center: Solid White Pill Nav - Strictly Student links */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center h-[56px] px-[36px] rounded-full text-[15px] font-[400] gap-[32px] tracking-[-0.01em] shadow-[0_8px_24px_rgba(0,0,0,0.02)] transition-colors duration-300 bg-white text-[#101014]">
            <span className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => navigate('/')}>Home</span>
            <span className="cursor-pointer hover:opacity-70 transition-opacity font-semibold text-[#513582]" onClick={() => navigate('/student-dashboard')}>Student Dashboard</span>
            <span className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => navigate('/public-verify')}>Public Verify</span>
            
            {/* If Admin is connected, allow them an explicit switch back to institutional admin */}
            {Boolean(account && (isAdmin || isIssuer)) && (
              <span className="cursor-pointer hover:opacity-70 transition-opacity text-[#7053AD] font-medium" onClick={() => navigate('/dashboard')}>Admin Switch</span>
            )}
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
                  <span>Connected</span>
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
                onClick={() => { navigate('/student-dashboard'); setMobileMenuOpen(false); }} 
                className="text-left px-4 py-3 rounded-2xl bg-[#513582]/10 text-[#513582] text-[15px] font-semibold flex items-center justify-between"
              >
                <span>Student Dashboard</span>
                <span>●</span>
              </button>
              <button 
                onClick={() => { navigate('/public-verify'); setMobileMenuOpen(false); }} 
                className="text-left px-4 py-3 rounded-2xl hover:bg-black/5 text-[15px] text-[#7053AD] font-medium flex items-center justify-between"
              >
                <span>Public Verify</span>
                <span>↗</span>
              </button>
              {Boolean(account && (isAdmin || isIssuer)) && (
                <button 
                  onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }} 
                  className="text-left px-4 py-3 rounded-2xl bg-[#7053AD]/10 text-[#7053AD] text-[15px] font-semibold flex items-center justify-between"
                >
                  <span>Admin Dashboard</span>
                  <span>→</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── STUDENT WORKSPACE CONTAINER ────────────────────────── */}
      <main className="max-w-[1440px] w-full mx-auto px-6 md:px-16 py-8 md:py-10 flex flex-col gap-8 flex-grow">
        
        {/* Alerts if any */}
        {error && (
          <div className="w-full bg-[#98514C]/10 border border-[#98514C]/30 text-[#98514C] px-5 py-3 rounded-2xl text-xs flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold underline ml-4">Dismiss</button>
          </div>
        )}

        {/* Scholar Context Line */}
        <div className="w-full flex justify-between items-center text-[#292333]">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#7053AD]" />
            <span className="font-['Inter'] text-[13px] text-[#292333] font-normal tracking-[-0.01em]">
              Student Portfolio & Credentials · Ethereum Sepolia
            </span>
          </div>

          <div className="flex items-center gap-2 text-[12px] font-['IBM_Plex_Mono'] text-[#756F80]">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Wallet not connected'}</span>
          </div>
        </div>

        {/* ── TOP HERO ROW: METRICS & CERTIFICATE PREVIEW ─────────────── */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Student Overview & Held Credentials */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Section marker & Headline */}
            <div className="flex flex-col gap-3">
              <span className="font-['IBM_Plex_Mono'] text-[12px] uppercase tracking-wider text-[#7053AD]">
                STUDENT PORTFOLIO / CREDENTIALS
              </span>
              
              <h1 className="font-['Cormorant_Garamond'] font-medium text-[54px] sm:text-[64px] leading-[1.02] text-[#292333] tracking-[-1.5px]">
                My Credentials
              </h1>

              <p className="font-['Inter'] font-normal text-[13px] leading-[1.6] text-[#756F80]">
                Cryptographically signed, tamper-proof academic awards minted directly to your personal Ethereum wallet address.
              </p>
            </div>

            {/* Metrics Glass Panel */}
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
              {/* Metric 1 */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1.5">
                  <span className="font-['Inter'] text-[12px] text-[#292333]">
                    Credentials Owned
                  </span>
                  <span className="font-['Inter'] text-[10px] text-[#756F80]">
                    Verified on Sepolia Network
                  </span>
                </div>
                <div className="font-['Cormorant_Garamond'] font-medium text-[42px] sm:text-[46px] leading-none text-[#292333] tracking-[-1px]">
                  {credentials.length}
                </div>
              </div>

              <div className="w-full h-[1px] bg-[rgba(125,101,154,0.14)]" />

              {/* Metric 2 */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1.5">
                  <span className="font-['Inter'] text-[12px] text-[#292333]">
                    Active & Valid
                  </span>
                  <span className="font-['Inter'] text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Signature Intact
                  </span>
                </div>
                <div className="font-['Cormorant_Garamond'] font-medium text-[42px] sm:text-[46px] leading-none text-[#513582] tracking-[-1px]">
                  {activeCredentials.length}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/public-verify')}
                className="flex-1 h-[48px] px-4 rounded-xl bg-white/40 hover:bg-white/60 border border-white/70 backdrop-blur-md text-[13px] font-['Inter'] font-medium text-[#292333] flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <Search className="w-4 h-4 text-[#7053AD]" />
                <span>Verify a Credential</span>
              </button>

              {activeCred && (
                <button
                  type="button"
                  onClick={() => navigate(`/public-verify?tokenId=${activeCred.tokenId}`)}
                  className="flex-1 h-[48px] px-4 rounded-xl bg-[#513582] hover:bg-[#41276b] text-white text-[13px] font-['Inter'] font-medium flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <span>Public Proof</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Assurance footer */}
            <div className="w-full flex items-center gap-2 text-[#756F80] text-[13px] pt-1">
              <ShieldCheck className="w-[18px] h-[18px] text-[#7053AD] flex-shrink-0" />
              <span>
                Soulbound on-chain verification. Permanently belongs to your wallet, independently verifiable worldwide.
              </span>
            </div>

          </div>

          {/* Right Column: Credential Artifact Showcase (IDENTICAL TO DASHBOARD & PUBLIC VERIFY) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Header row */}
            <div className="flex justify-between items-center">
              <span className="font-['IBM_Plex_Mono'] text-[12px] uppercase tracking-wider text-[#7053AD]">
                ACADEMIC CREDENTIAL / DEGREE RECORD
              </span>
              <button 
                onClick={() => navigate(activeCred?.tokenId !== undefined ? `/public-verify?tokenId=${activeCred.tokenId}` : '/public-verify')} 
                className="text-[#7053AD] hover:opacity-80 transition-opacity flex items-center gap-1 font-['Inter'] text-[12px] cursor-pointer"
                title="View in public verifier"
              >
                <span>Verify</span>
                <ExternalLink className="w-4 h-4" />
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
                      <div className="w-[18px] h-[18px] text-[#513582] flex items-center justify-center">
                        <Building className="w-[18px] h-[18px]" />
                      </div>
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
                        {displayGrade}
                      </span>
                    </p>

                    {/* Academic attestation */}
                    <div className="flex justify-between items-end w-full mt-auto mb-1">
                      {/* QR Code Verification */}
                      <div className="flex items-center gap-2 w-36">
                        <div className="p-1 bg-white border border-[#E8DBC0] rounded-[5px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] shrink-0">
                          <QRCodeSVG 
                            value={activeCred?.tokenId !== undefined ? `${window.location.origin}/public-verify?tokenId=${activeCred.tokenId}` : `${window.location.origin}/public-verify`} 
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
                            {activeCred?.tokenId !== undefined ? `ID: #${activeCred.tokenId}` : 'On-Chain Proof'}
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
                          <span className="font-['Cormorant_Garamond'] font-bold text-[8.5px] text-[#513582] tracking-wide">SEAL</span>
                        </div>
                      </div>

                      {/* Registrar */}
                      <div className="flex flex-col items-end gap-[2px] w-32">
                        <span className="font-['Cormorant_Garamond'] italic text-[21px] text-[#513582] leading-[1]">
                          {activeCred?.issuer ? `${activeCred.issuer.slice(0, 6)}...${activeCred.issuer.slice(-4)}` : 'Academic Registrar'}
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
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-['Inter'] text-[10px] sm:text-[12px] text-[#292333] font-medium tracking-[0.2px] truncate">
                {activeCred?.tokenId !== undefined ? `Token #${activeCred.tokenId} · Official Academic Record` : 'Official Academic Record · On-Chain Proof'}
              </span>
            </div>
          </div>
        </div>

          </div>
        </div>

        {/* ── BOTTOM SECTION: CREDENTIALS VAULT LIST ─────────────── */}
        {credentials.length > 0 && (
          <div className="w-full flex flex-col gap-4 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#7053AD]" />
                <h3 className="font-['Cormorant_Garamond'] text-[28px] font-semibold text-[#292333]">
                  All Academic Credentials ({credentials.length})
                </h3>
              </div>
              <span className="text-[12px] font-['Inter'] text-[#756F80]">
                Click any credential to preview its certificate
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {credentials.map((cred) => {
                const cMeta = cred.metadata || {};
                const isSelected = selectedCredential?.tokenId === cred.tokenId;
                return (
                  <div
                    key={cred.tokenId}
                    onClick={() => setSelectedCredential(cred)}
                    className={`p-6 rounded-[20px] transition-all cursor-pointer flex flex-col justify-between gap-4 backdrop-blur-md ${
                      isSelected
                        ? 'bg-white/60 border-2 border-[#513582] shadow-md'
                        : 'bg-white/30 hover:bg-white/45 border border-white/70 shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-['IBM_Plex_Mono'] text-[12px] font-semibold text-[#513582] bg-[#7053AD]/10 px-2.5 py-0.5 rounded-full">
                          Token #{cred.tokenId}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-['Inter'] font-medium text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Verified
                        </span>
                      </div>

                      <h4 className="font-['Cormorant_Garamond'] text-[24px] font-semibold leading-tight text-[#292333] mt-1">
                        {cMeta.degree || 'Academic Degree'}
                      </h4>

                      <p className="font-['Inter'] text-[13px] text-[#5B5565]">
                        in {cMeta.branch || cMeta.fieldOfStudy || cMeta.field || 'Field of Study'}
                      </p>

                      <p className="font-['Inter'] text-[12px] text-[#756F80]">
                        {cMeta.institution || 'Issuing Institution'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E4DFE9]/60 flex items-center justify-between">
                      <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#756F80]">
                        Grade: <strong className="text-[#292333]">{cMeta.grade || 'N/A'}</strong>
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/public-verify?tokenId=${cred.tokenId}`);
                        }}
                        className="text-[12px] font-['Inter'] font-medium text-[#7053AD] hover:text-[#513582] flex items-center gap-1"
                      >
                        <span>Verify</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default StudentDashboard;
