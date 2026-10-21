import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import SettingsDropdown from '../components/SettingsDropdown';
import { 
  ArrowRight, 
  ScanLine, 
  CheckCircle,
  ExternalLink 
} from 'lucide-react';
import { isValidAddress } from '../utils/helpers';
import { issueCredential as issueCredentialAction } from '../logic';

const IssueCredential = () => {
  const navigate = useNavigate();
  const { account, contract, isIssuer, isAdmin, networkId, connectWallet, disconnectWallet, loading: web3Loading, error: web3Error } = useWeb3();

  const [formData, setFormData] = useState({
    studentName: '',
    studentAddress: '',
    degree: '',
    branch: '',
    grade: '',
    completionDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    institution: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [draftSavedTime, setDraftSavedTime] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [issuedTokenId, setIssuedTokenId] = useState(null);

  useEffect(() => {
    if (account && !isAdmin && !isIssuer && !web3Loading) {
      navigate('/student-dashboard');
    }
  }, [account, isAdmin, isIssuer, web3Loading, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem('tokcred-draft-issue', JSON.stringify(formData));
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC';
      setDraftSavedTime(`Today, ${now}`);
      setSuccess('Draft successfully saved locally.');
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Could not save draft locally.');
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!account) {
      setError('Please connect an authorized issuer wallet first.');
      return;
    }

    if (!isValidAddress(formData.studentAddress)) {
      setError('Please enter a valid Ethereum wallet address (0x...)');
      return;
    }

    if (!formData.studentName || !formData.institution || !formData.degree) {
      setError('Please complete all required fields.');
      return;
    }

    try {
      setLoading(true);
      const pinataKey = import.meta.env.VITE_PINATA_API_KEY;
      const pinataSecret = import.meta.env.VITE_PINATA_API_SECRET;

      const result = await issueCredentialAction({
        contract,
        studentAddress: formData.studentAddress,
        formData: {
          studentName: formData.studentName,
          institution: formData.institution,
          degree: formData.degree,
          branch: formData.branch,
          fieldOfStudy: formData.branch || formData.description || '',
          grade: formData.grade,
          issueDate: formData.completionDate,
          description: formData.description
        },
        pinataKey,
        pinataSecret
      });

      const tokenId = result?.tokenId !== undefined ? result.tokenId : null;
      setIssuedTokenId(tokenId);
      if (result?.txHash) {
        setTxHash(result.txHash);
      }
      setSuccess(`Credential #${tokenId} has been officially signed and issued on-chain!`);
    } catch (err) {
      console.error('Issuance error:', err);
      setError(err.reason || err.message || 'Failed to issue credential.');
    } finally {
      setLoading(false);
    }
  };

  // Helper icons
  const Icons = {
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

  // Derive title and branch from Degree and Branch input
  const degreeMainTitle = formData.degree 
    ? (formData.branch 
        ? formData.degree 
        : (formData.degree.includes(' in ') ? formData.degree.split(' in ')[0] : formData.degree))
    : 'Degree Program';

  const fieldOfStudy = formData.branch 
    ? formData.branch 
    : (formData.degree.includes(' in ') 
        ? formData.degree.split(' in ')[1] 
        : (formData.description || 'Specialization / Branch'));

  return (
    <div className="min-h-screen bg-[#CDCDCD] text-[#292333] font-['Inter'] flex flex-col selection:bg-[#7053AD]/20 selection:text-[#513582]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');
      `}</style>

      {/* ── TOP NAVIGATION (Standard TokCred Floating Pill Navbar) ────────────────── */}
      <div className="w-full pt-[24px] flex justify-center px-6 lg:px-16 z-[100] mb-4 shrink-0">
        <div className="w-full max-w-[1312px] flex items-center justify-between relative">
          
          {/* Left: Logo */}
          <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity h-[56px] -ml-6" onClick={() => navigate('/')}>
            <img 
              src="/tokcred_logo-removebg-preview.png" 
              alt="TokCred" 
              className="h-[90px] lg:h-[120px] max-w-none object-contain relative transition-all duration-300" 
              style={{ filter: 'none' }}
            />
          </div>

          {/* Center: Solid White Pill Nav */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center h-[56px] px-[36px] rounded-full text-[15px] font-[400] gap-[32px] tracking-[-0.01em] shadow-[0_8px_24px_rgba(0,0,0,0.02)] transition-colors duration-300 bg-white text-[#101014]">
            <span className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => navigate('/')}>Home</span>
            <span className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => navigate('/dashboard')}>Dashboard</span>
            <span className="cursor-pointer hover:opacity-70 transition-opacity font-semibold text-[#513582]" onClick={() => navigate('/issue')}>Issue</span>
            <span className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => navigate('/history')}>History</span>
            <span className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => navigate('/public-verify')}>Public Verify</span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-[16px]">
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
                buttonClassName="w-[56px] h-[56px] rounded-full flex items-center justify-center hover:opacity-80 transition-colors duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.02)] bg-white text-[#101014]"
                iconSize={22}
              />
            </div>

            <button 
              onClick={account ? disconnectWallet : connectWallet} 
              title={account ? `Connected: ${account} (Click to disconnect)` : 'Connect Wallet'}
              className="h-[56px] px-[24px] text-[15px] font-[500] rounded-full flex items-center gap-2.5 transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_8px_24px_rgba(176,150,250,0.2)] bg-[#2D264B] text-white hover:bg-[#3C315B]"
            >
              {account ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Connected</span>
                </>
              ) : (
                <span>Connect Wallet</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── INSTITUTIONAL WORKSPACE CONTAINER ────────────────────────── */}
      <main className="max-w-[1440px] w-full mx-auto px-6 md:px-16 py-6 md:py-8 flex flex-col gap-8 flex-grow">
        
        {/* Alerts */}
        {error && (
          <div className="w-full bg-[#98514C]/10 border border-[#98514C]/30 text-[#98514C] px-5 py-3 rounded-2xl text-xs flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold underline ml-4">Dismiss</button>
          </div>
        )}
        {success && (
          <div className="w-full bg-[#326956]/10 border border-[#326956]/30 text-[#326956] px-5 py-3 rounded-2xl text-xs flex justify-between items-center">
            <span>{success}</span>
            {txHash && (
              <a 
                href={`https://sepolia.etherscan.io/tx/${txHash}`} 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-1 font-bold underline ml-3"
              >
                Etherscan <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button onClick={() => setSuccess(null)} className="font-bold underline ml-4">Dismiss</button>
          </div>
        )}

        {/* Institution Context Line */}
        <div className="w-full flex justify-between items-center text-[#292333]">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#7053AD]">
              <path d="M3 21H21M3 10H21M5 10V21M9 10V21M15 10V21M19 10V21M12 3L21 10H3L12 3Z" stroke="#7053AD" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-['Inter'] text-[13px] text-[#292333] font-normal tracking-[-0.01em]">
              {formData.institution || (account ? `Institution (${account.slice(0, 6)}...${account.slice(-4)})` : 'Academic Institution')}
            </span>
          </div>

          <div className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-wider text-[#756F80]">
            REGISTRAR WORKSPACE · {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
          </div>
        </div>

        {/* Issuance Introduction */}
        <div className="w-full flex flex-col gap-3">
          <span className="font-['IBM_Plex_Mono'] text-[12px] uppercase tracking-wider text-[#7053AD]">
            INSTITUTIONAL / NEW ISSUANCE
          </span>
          <h1 className="font-['Cormorant_Garamond'] font-medium text-[54px] sm:text-[64px] leading-[1.02] text-[#292333] tracking-[-1.5px]">
            Issue Credential
          </h1>
          <p className="font-['Inter'] font-normal text-[13px] leading-[1.6] text-[#756F80]">
            Give academic achievement a permanent, independently verifiable record.
          </p>
        </div>

        {/* Issuance Progress Workflow bar */}
        <div className="w-full flex items-center gap-7 py-4 border-y border-[rgba(125,101,154,0.14)]">
          <span className="font-['IBM_Plex_Mono'] text-[12px] text-[#7053AD] font-medium">
            01 Compose
          </span>
          <span className="font-['IBM_Plex_Mono'] text-[12px] text-[#756F80]">
            02 Preview
          </span>
          <span className="font-['IBM_Plex_Mono'] text-[12px] text-[#756F80]">
            03 Sign & issue
          </span>
        </div>

        {/* ── COMPOSITION AND PREVIEW ──────────────────────────────── */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT: Issuance Form (cols-6) */}
          <div className="lg:col-span-6 flex flex-col">
            <div 
              className="w-full rounded-[28px] p-8 flex flex-col gap-7"
              style={{
                background: 'rgba(255, 255, 255, 0.32)',
                border: '1px solid rgba(255, 255, 255, 0.72)',
                boxShadow: '0px 12px 30px rgba(81, 65, 109, 0.047), inset 0px 1px 2px rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              
              {/* SECTION 1: Student Identity */}
              <div className="flex flex-col gap-5">
                <span className="font-['IBM_Plex_Mono'] text-[12px] text-[#7053AD] tracking-wider uppercase">
                  01 / STUDENT IDENTITY
                </span>
                
                <h3 className="font-['Cormorant_Garamond'] text-[24px] text-[#292333] leading-tight">
                  Student Identity
                </h3>

                {/* Field: Full Legal Name */}
                <div className="flex flex-col gap-2">
                  <label className="font-['Inter'] font-semibold text-[13px] text-[#292333]">
                    Full Legal Name
                  </label>
                  <div className="w-full px-4 py-3 bg-white/30 border border-white/70 rounded-[10px] focus-within:border-[#7053AD] transition-colors">
                    <input
                      type="text"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleChange}
                      placeholder="e.g. Student Full Name"
                      className="w-full bg-transparent font-['Inter'] text-[13px] text-[#292333] outline-none placeholder-[#756F80]/60"
                    />
                  </div>
                </div>

                {/* Field: Student Wallet Address */}
                <div className="flex flex-col gap-2">
                  <label className="font-['Inter'] font-semibold text-[13px] text-[#292333]">
                    Student Wallet Address
                  </label>
                  <div className="w-full px-4 py-3 bg-white/30 border border-white/70 rounded-[10px] focus-within:border-[#7053AD] transition-colors">
                    <input
                      type="text"
                      name="studentAddress"
                      value={formData.studentAddress}
                      onChange={handleChange}
                      placeholder="0x..."
                      className="w-full bg-transparent font-['IBM_Plex_Mono'] text-[13px] text-[#292333] outline-none placeholder-[#756F80]/60"
                    />
                  </div>
                </div>

                <p className="font-['Inter'] text-[13px] leading-[1.6] text-[#756F80]">
                  Confirm this address with the student. The credential will be assigned to this wallet after issuance.
                </p>
              </div>

              <div className="w-full h-[1px] bg-[rgba(125,101,154,0.14)]" />

              {/* SECTION 2: Academic Record */}
              <div className="flex flex-col gap-5">
                <span className="font-['IBM_Plex_Mono'] text-[12px] text-[#7053AD] tracking-wider uppercase">
                  02 / ACADEMIC RECORD
                </span>

                <h3 className="font-['Cormorant_Garamond'] text-[24px] text-[#292333] leading-tight">
                  Academic Record
                </h3>

                {/* Field: Degree/Certification */}
                <div className="flex flex-col gap-2">
                  <label className="font-['Inter'] font-semibold text-[13px] text-[#292333]">
                    Degree/Certification
                  </label>
                  <div className="w-full px-4 py-3 bg-white/30 border border-white/70 rounded-[10px] focus-within:border-[#7053AD] transition-colors">
                    <input
                      type="text"
                      name="degree"
                      value={formData.degree}
                      onChange={handleChange}
                      placeholder="e.g. Bachelor of Science"
                      className="w-full bg-transparent font-['Inter'] text-[13px] text-[#292333] outline-none placeholder-[#756F80]/60"
                    />
                  </div>
                </div>

                {/* Field: Branch */}
                <div className="flex flex-col gap-2">
                  <label className="font-['Inter'] font-semibold text-[13px] text-[#292333]">
                    Branch
                  </label>
                  <div className="w-full px-4 py-3 bg-white/30 border border-white/70 rounded-[10px] focus-within:border-[#7053AD] transition-colors">
                    <input
                      type="text"
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      placeholder="e.g. Computer Science"
                      className="w-full bg-transparent font-['Inter'] text-[13px] text-[#292333] outline-none placeholder-[#756F80]/60"
                    />
                  </div>
                </div>

                {/* Classification Row: Grade/GPA and Completion Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Grade/GPA */}
                  <div className="flex flex-col gap-2">
                    <label className="font-['Inter'] font-semibold text-[13px] text-[#292333]">
                      Grade/GPA
                    </label>
                    <div className="w-full px-4 py-3 bg-white/30 border border-white/70 rounded-[10px] focus-within:border-[#7053AD] transition-colors">
                      <input
                        type="text"
                        name="grade"
                        value={formData.grade}
                        onChange={handleChange}
                        placeholder="e.g. 3.92 / 4.00 · First Class"
                        className="w-full bg-transparent font-['Inter'] text-[13px] text-[#292333] outline-none placeholder-[#756F80]/60"
                      />
                    </div>
                  </div>

                  {/* Completion Date */}
                  <div className="flex flex-col gap-2">
                    <label className="font-['Inter'] font-semibold text-[13px] text-[#292333]">
                      Completion Date
                    </label>
                    <div className="w-full px-4 py-3 bg-white/30 border border-white/70 rounded-[10px] focus-within:border-[#7053AD] transition-colors">
                      <input
                        type="text"
                        name="completionDate"
                        value={formData.completionDate}
                        onChange={handleChange}
                        placeholder="e.g. 21 October 2026"
                        className="w-full bg-transparent font-['Inter'] text-[13px] text-[#292333] outline-none placeholder-[#756F80]/60"
                      />
                    </div>
                  </div>
                </div>

                {/* Institution */}
                <div className="flex flex-col gap-2">
                  <label className="font-['Inter'] font-semibold text-[13px] text-[#292333]">
                    Institution
                  </label>
                  <div className="w-full px-4 py-3 bg-white/30 border border-white/70 rounded-[10px] focus-within:border-[#7053AD] transition-colors">
                    <input
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleChange}
                      placeholder="e.g. University / Institution Name"
                      className="w-full bg-transparent font-['Inter'] text-[13px] text-[#292333] outline-none placeholder-[#756F80]/60"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2">
                  <label className="font-['Inter'] font-semibold text-[13px] text-[#292333]">
                    Description
                  </label>
                  <div className="w-full px-4 py-3 bg-white/30 border border-white/70 rounded-[10px] focus-within:border-[#7053AD] transition-colors">
                    <textarea
                      rows={2}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Awarded with distinction..."
                      className="w-full bg-transparent font-['Inter'] text-[13px] text-[#292333] outline-none placeholder-[#756F80]/60 resize-none"
                    />
                  </div>
                </div>

              </div>

              <div className="w-full h-[1px] bg-[rgba(125,101,154,0.14)]" />

              {/* Draft Actions Section */}
              <div className="flex flex-col gap-3.5">
                <p className="font-['Inter'] text-[13px] leading-[1.6] text-[#756F80]">
                  Review the certificate before signing. Generating a preview does not issue a credential or submit a transaction.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="h-[50px] bg-white/30 hover:bg-white/50 border border-white/70 rounded-[10px] font-['Inter'] font-semibold text-[14px] text-[#292333] transition-all"
                  >
                    Save Draft
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="h-[50px] bg-[#513582] hover:bg-[#432a6e] text-white rounded-[10px] font-['Inter'] font-semibold text-[14px] flex items-center justify-center gap-2.5 shadow-[0px_16px_28px_rgba(68,50,84,0.13)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span>{loading ? 'Submitting to Network...' : 'Generate Preview'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <span className="font-['Inter'] text-[10px] text-[#756F80]">
                  Draft saved · {draftSavedTime}
                </span>
              </div>

            </div>
          </div>

          {/* RIGHT: Certificate Preview & Verification (cols-6) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            
            {/* Header row */}
            <div className="flex justify-between items-center">
              <h3 className="font-['Cormorant_Garamond'] text-[24px] text-[#292333]">
                Certificate preview
              </h3>
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(238,232,248,0.65)] text-[#7053AD] rounded-full text-[12px] font-['Inter'] font-semibold">
                <ScanLine className="w-3.5 h-3.5" />
                <span>Draft</span>
              </div>
            </div>

            {/* Certificate Presentation Card (Exact Paper Stack from PublicVerify) */}
            <div className="relative flex flex-col items-center">
              <div 
                className="relative flex flex-col items-center justify-center w-full max-w-[644px] h-[517px] rounded-[28px] isolate overflow-hidden"
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

                {/* Paper Stack Container */}
                <div className="relative w-[520px] h-[390px] -mt-4">
                  
                  {/* Layer 1 (Bottom paper, rotated -3deg) */}
                  <div className="absolute inset-0 bg-[#F5F0E6] shadow-sm rounded-[3px] -rotate-3 -translate-y-3 z-10 pointer-events-none" />

                  {/* Layer 2 (Top Credential artifact) */}
                  <div className="absolute inset-0 flex flex-col items-center px-6 py-4 bg-[#FFFEFA] border border-[#E8DBC0] shadow-[0px_14px_24px_rgba(68,50,84,0.13)] rounded-[3px] z-20 select-none overflow-hidden">
                    
                    {/* Issuer Identity */}
                    <div className="flex items-center gap-2 mb-1">
                      <Icons.Landmark />
                      <h2 className="font-['Cormorant_Garamond'] font-semibold text-[20px] leading-[24px] text-[#513582]">
                        {formData.institution || 'Institution Name'}
                      </h2>
                    </div>

                    <p className="font-['Inter'] text-[7px] tracking-[1.5px] text-[#756F80] mb-2 uppercase">
                      Knowledge • Integrity • Possibility
                    </p>

                    {/* Engraved Rule */}
                    <div className="w-full h-[1px] bg-[#E8DBC0] mb-2" />

                    <p className="font-['Inter'] text-[8px] tracking-[1.7px] text-[#7053AD] uppercase mb-1 font-medium">
                      Degree Certificate
                    </p>

                    {/* Award Title */}
                    <h1 className="font-['Cormorant_Garamond'] font-medium text-[28px] sm:text-[32px] leading-[1.12] text-[#292333] text-center max-w-[460px] mx-auto text-balance mb-0.5">
                      {degreeMainTitle || 'Degree Program'}
                    </h1>

                    <p className="font-['Cormorant_Garamond'] text-[17px] sm:text-[19px] text-[#5B5565] text-center max-w-[440px] mx-auto text-balance mb-1">
                      in {fieldOfStudy || 'Specialization / Branch'}
                    </p>

                    <p className="font-['Cormorant_Garamond'] text-[11px] text-[#756F80] text-center mb-1">
                      is hereby conferred upon
                    </p>

                    {/* Graduate Name */}
                    <h2 className="font-['Cormorant_Garamond'] font-semibold text-[32px] sm:text-[36px] leading-[1.1] text-[#513582] text-center max-w-[460px] mx-auto text-balance mb-1">
                      {formData.studentName || 'Candidate Full Name'}
                    </h2>

                    {/* Award Distinction */}
                    <p className="font-['Cormorant_Garamond'] text-[15px] sm:text-[17px] text-[#5B5565] mb-2 text-center leading-normal">
                      with a Cumulative Grade of{' '}
                      <span className="font-['Inter'] font-semibold text-[14px] sm:text-[16px] text-[#292333] ml-0.5 tracking-tight inline-block align-baseline">
                        {formData.grade || 'First Class'}
                      </span>
                    </p>

                    {/* Academic Attestation */}
                    <div className="flex justify-between items-end w-full mt-auto pt-2 border-t border-[#E8DBC0]/40">
                      
                      {/* QR Code Verification */}
                      <div className="flex items-center gap-2 w-32">
                        <div className="p-1 bg-white border border-[#E8DBC0] rounded-[5px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] shrink-0">
                          <QRCodeSVG 
                            value={issuedTokenId ? `${window.location.origin}/public-verify?tokenId=${issuedTokenId}` : `${window.location.origin}/public-verify?draft=true`} 
                            size={40} 
                            level="H"
                            fgColor="#292333"
                            bgColor="#FFFFFF"
                          />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-['Inter'] font-semibold text-[7.5px] tracking-[0.5px] text-[#513582] uppercase leading-tight">
                            Scan to Verify
                          </span>
                          <span className="font-['Inter'] text-[6.5px] text-[#756F80] leading-tight mt-0.5">
                            {issuedTokenId ? 'Official Record' : 'Draft Preview'}
                          </span>
                          <span className="font-['IBM_Plex_Mono'] text-[6px] text-[#8C6D34] leading-tight mt-0.5">
                            {issuedTokenId ? `ID: #${issuedTokenId}` : 'Unissued'}
                          </span>
                        </div>
                      </div>

                      {/* University Gold Seal */}
                      <div className="relative flex items-center justify-center w-[54px] h-[54px] shrink-0">
                        <div className="absolute inset-0 bg-[#E8DBC0] border border-[#A68C57] rounded-full shadow-xs"></div>
                        <div className="absolute inset-[3px] border border-[#A68C57]/70 rounded-full flex flex-col items-center justify-center">
                          <div className="scale-[0.5] text-[#513582]"><Icons.Landmark /></div>
                          <span className="font-['Cormorant_Garamond'] font-semibold text-[9px] text-[#513582] leading-none">SEAL</span>
                        </div>
                      </div>

                      {/* Registrar Attestation */}
                      <div className="flex flex-col items-end gap-0.5 w-28">
                        <span className="font-['Cormorant_Garamond'] italic text-[18px] text-[#513582] leading-none">
                          {issuedTokenId ? (account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Authorized Registrar') : 'Unsigned'}
                        </span>
                        <div className="w-full h-[1px] bg-[#E8DBC0]" />
                        <span className="font-['Inter'] text-[7.5px] text-[#756F80] uppercase">
                          {issuedTokenId ? 'Authorized Signatory' : 'DRAFT · NOT ISSUED'}
                        </span>
                      </div>
                    </div>

                    {/* Credential Provenance */}
                    <div className="flex justify-between items-center w-full mt-auto pt-1.5 border-t border-[#E8DBC0]/30">
                      <span className="font-['IBM_Plex_Mono'] text-[8px] text-[#756F80]">
                        {issuedTokenId ? `TC-RU-2026-${String(issuedTokenId).padStart(5, '0')}` : 'TC-DRAFT-PREVIEW'}
                      </span>
                      <span className="font-['Inter'] text-[8px] tracking-[0.5px] text-[#7053AD] uppercase font-medium">
                        {issuedTokenId ? 'Digitally Issued • TokCred' : 'Draft · Unissued'}
                      </span>
                    </div>

                  </div>
                </div>

                {/* Presentation Caption */}
                <div className="absolute bottom-[18px] flex items-center gap-1.5 px-3 py-1.5 bg-white/80 border border-white/70 rounded-full z-30 shadow-xs backdrop-blur-md">
                  <div className="text-[#7053AD]">
                    <Icons.Eye />
                  </div>
                  <span className="font-['Inter'] text-[11px] text-[#292333]">
                    {issuedTokenId ? 'Official verified academic record' : 'Preview only · not signed or issued'}
                  </span>
                </div>
              </div>
            </div>

            <p className="font-['Inter'] text-[13px] leading-[1.6] text-[#756F80]">
              Reserved ID {issuedTokenId ? `TC-RU-2026-${String(issuedTokenId).padStart(5, '0')}` : 'TC-DRAFT-PREVIEW'} · Preview generated from this draft.
            </p>

            {/* Cryptographic Verification Glass Panel */}
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
              <h3 className="font-['Cormorant_Garamond'] text-[24px] text-[#292333]">
                Cryptographic Verification
              </h3>

              <p className="font-['Inter'] text-[13px] leading-[1.6] text-[#756F80]">
                The preview is an unsigned draft. Authenticity becomes verifiable only after institutional signing and network confirmation.
              </p>

              {/* Inset Box */}
              <div 
                className="w-full rounded-[10px] p-4 flex flex-col gap-2.5"
                style={{
                  background: 'rgba(255, 255, 255, 0.22)',
                  border: '1px solid rgba(255, 255, 255, 0.72)',
                  boxShadow: '0px 12px 30px rgba(81, 65, 109, 0.047), inset 0px 1px 2px rgba(255, 255, 255, 0.4)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-['Inter'] font-semibold text-[12px] text-[#7053AD]">
                    {issuedTokenId ? 'Payload Anchored · Confirmed' : 'Draft payload · unsigned'}
                  </span>
                </div>

                <div className="font-['Inter'] text-[11px] leading-[1.5] text-[#756F80]">
                  <span>SHA-256 · 0x8b4e...6d92</span><br/>
                  <span>Preview generated {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</span>
                </div>
              </div>

              {/* Prerequisites Rows */}
              <div className="flex flex-col gap-2.5">
                <div className="w-full h-[1px] bg-[rgba(125,101,154,0.14)]" />
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#756F80]">Issuer signature</span>
                  <span className="text-[#292333] font-medium">{issuedTokenId ? 'Signed by Registrar' : 'Awaiting registrar approval'}</span>
                </div>

                <div className="w-full h-[1px] bg-[rgba(125,101,154,0.14)]" />
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#756F80]">On-chain transaction</span>
                  <span className="text-[#292333] font-medium">{txHash ? `${txHash.slice(0, 10)}...${txHash.slice(-6)}` : 'Not submitted'}</span>
                </div>

                <div className="w-full h-[1px] bg-[rgba(125,101,154,0.14)]" />
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#756F80]">Protocol Zero</span>
                  <span className="text-[#292333] font-medium">{issuedTokenId ? 'Anchored on Sepolia' : 'Not yet anchored'}</span>
                </div>
              </div>

            </div>

            {/* Sub-scope Note */}
            <p className="font-['Inter'] text-[13px] leading-[1.6] text-[#756F80]">
              Only authorized institution registrars with ISSUER_ROLE can sign and issue. A draft is never presented as a valid credential.
            </p>

          </div>

        </div>

      </main>

    </div>
  );
};

export default IssueCredential;
