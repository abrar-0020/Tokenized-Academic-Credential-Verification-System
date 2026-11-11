import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import SettingsDropdown from '../components/SettingsDropdown';
import WalletConnectButton from '../components/WalletConnectButton';
import { 
  ArrowRight, 
  ScanLine, 
  CheckCircle,
  ExternalLink,
  Lock,
  RefreshCw,
  Menu,
  X
} from 'lucide-react';
import { isValidAddress } from '../utils/helpers';
import {
  issueCredential as issueCredentialAction,
  generateUniqueCredentialId,
  generateNextHybridCredentialId
} from '../logic';

const IssueCredential = () => {
  const navigate = useNavigate();
  const { account, contract, isIssuer, isAdmin, networkId, connectWallet, disconnectWallet, loading: web3Loading, error: web3Error } = useWeb3();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const credentialIdManuallyEdited = useRef(false);
  const [formData, setFormData] = useState(() => ({
    studentName: '',
    enrollmentNumber: '',
    studentAddress: '',
    credentialId: generateUniqueCredentialId(),
    degree: '',
    branch: '',
    grade: '',
    completionDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    institution: '',
    description: ''
  }));

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [draftSavedTime, setDraftSavedTime] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [issuedTokenId, setIssuedTokenId] = useState(null);
  const [payloadDigest, setPayloadDigest] = useState(null);
  const [consentAccepted, setConsentAccepted] = useState(false);

  useEffect(() => {
    let active = true;
    if (contract && !credentialIdManuallyEdited.current && !issuedTokenId) {
      void generateNextHybridCredentialId(contract).then((nextId) => {
        if (active && !credentialIdManuallyEdited.current) {
          setFormData((prev) => ({ ...prev, credentialId: nextId }));
        }
      });
    }
    return () => {
      active = false;
    };
  }, [contract, issuedTokenId]);

  const handleChange = (e) => {
    if (e.target.name === 'credentialId') {
      credentialIdManuallyEdited.current = true;
    }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegenerateId = async () => {
    credentialIdManuallyEdited.current = false;
    const nextId = await generateNextHybridCredentialId(contract);
    setFormData((prev) => ({
      ...prev,
      credentialId: nextId,
    }));
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

    if (!account || (!isIssuer && !isAdmin)) {
      setError('Please connect an authorized issuer wallet first.');
      return;
    }

    if (!isValidAddress(formData.studentAddress)) {
      setError('Please enter a valid student Ethereum wallet address (0x...) to bind this Soulbound token.');
      return;
    }

    if (!formData.studentName.trim() || !formData.enrollmentNumber.trim()) {
      setError('Please enter both the student legal name and enrollment / registration number.');
      return;
    }

    if (!formData.credentialId.trim() || !formData.institution.trim() || !formData.degree.trim()) {
      setError('Please complete all required fields (Credential ID, Institution, Degree).');
      return;
    }

    if (!consentAccepted) {
      setError('Please confirm the student privacy & consent notice before issuing this credential.');
      return;
    }

    try {
      setLoading(true);

      const result = await issueCredentialAction({
        contract,
        studentAddress: formData.studentAddress,
        formData: {
          credentialId: formData.credentialId.trim(),
          studentName: formData.studentName.trim(),
          enrollmentNumber: formData.enrollmentNumber.trim(),
          institution: formData.institution.trim(),
          degree: formData.degree.trim(),
          branch: formData.branch.trim(),
          fieldOfStudy: formData.branch.trim() || formData.description.trim() || '',
          grade: formData.grade.trim(),
          issueDate: formData.completionDate.trim(),
          description: formData.description.trim()
        }
      });

      const tokenId = result?.tokenId !== undefined ? result.tokenId : null;
      setIssuedTokenId(tokenId);
      const hash = result?.tx?.hash || result?.receipt?.hash || result?.txHash || null;
      if (hash) {
        setTxHash(hash);
      }
      if (result?.metadata?.encryptedData?.payloadHash) {
        setPayloadDigest(result.metadata.encryptedData.payloadHash);
      }
      setSuccess(`Credential #${tokenId} (${result?.credentialId || formData.credentialId}) encrypted and issued on-chain!`);
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

  const shortStudentWallet = isValidAddress(formData.studentAddress)
    ? `${formData.studentAddress.slice(0, 6)}...${formData.studentAddress.slice(-4)}`
    : '0x••••...••••';

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
            <span className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => navigate('/dashboard')}>Dashboard</span>
            <span className="cursor-pointer hover:opacity-70 transition-opacity font-semibold text-[#513582]" onClick={() => navigate('/issue')}>Issue</span>
            <span className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => navigate('/history')}>History</span>
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
                className="text-left px-4 py-3 rounded-2xl bg-[#513582]/10 text-[#513582] text-[15px] font-semibold flex items-center justify-between"
              >
                <span>Issue Credential</span>
                <span>●</span>
              </button>
              <button 
                onClick={() => { navigate('/history'); setMobileMenuOpen(false); }} 
                className="text-left px-4 py-3 rounded-2xl hover:bg-black/5 text-[15px] text-[#292333]"
              >
                History
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
      <main className="max-w-[1440px] w-full mx-auto px-6 md:px-16 py-6 md:py-8 flex flex-col gap-6 flex-grow">
        
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
            Bind an academic achievement to the student’s Soulbound wallet with AES-256-GCM confidential IPFS storage.
          </p>
        </div>

        {/* Issuance Progress Workflow bar */}
        <div className="w-full flex items-center gap-7 py-4 border-y border-[rgba(125,101,154,0.14)]">
          <span className="font-['IBM_Plex_Mono'] text-[12px] text-[#7053AD] font-medium">
            01 Compose &amp; Bind Identity
          </span>
          <span className="font-['IBM_Plex_Mono'] text-[12px] text-[#756F80]">
            02 Encrypt Sensitive Payload
          </span>
          <span className="font-['IBM_Plex_Mono'] text-[12px] text-[#756F80]">
            03 Sign &amp; Mint Soulbound Token
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
              
              {/* SECTION 1: Student Identity & Wallet Binding */}
              <div className="flex flex-col gap-5">
                <span className="font-['IBM_Plex_Mono'] text-[12px] text-[#7053AD] tracking-wider uppercase">
                  01 / STUDENT IDENTITY &amp; WALLET BINDING
                </span>
                
                <h3 className="font-['Cormorant_Garamond'] text-[24px] text-[#292333] leading-tight">
                  Student Identity
                </h3>

                {/* Field: Full Legal Name */}
                <div className="flex flex-col gap-2">
                  <label className="font-['Inter'] font-semibold text-[13px] text-[#292333]">
                    Full Legal Name *
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

                {/* Field: Enrollment / Registration Number */}
                <div className="flex flex-col gap-2">
                  <label className="font-['Inter'] font-semibold text-[13px] text-[#292333]">
                    Enrollment / Registration Number *
                  </label>
                  <div className="w-full px-4 py-3 bg-white/30 border border-white/70 rounded-[10px] focus-within:border-[#7053AD] transition-colors">
                    <input
                      type="text"
                      name="enrollmentNumber"
                      value={formData.enrollmentNumber}
                      onChange={handleChange}
                      placeholder="e.g. ENR-2026-CS-0412"
                      className="w-full bg-transparent font-['IBM_Plex_Mono'] text-[13px] text-[#292333] outline-none placeholder-[#756F80]/60"
                    />
                  </div>
                </div>

                {/* Field: Student Wallet Address */}
                <div className="flex flex-col gap-2">
                  <label className="font-['Inter'] font-semibold text-[13px] text-[#292333]">
                    Student Soulbound Wallet Address *
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
                  The Soulbound token is minted directly to this wallet and cannot be transferred. Both this wallet address and enrollment number bind identity beyond a name string.
                </p>
              </div>

              <div className="w-full h-[1px] bg-[rgba(125,101,154,0.14)]" />

              {/* SECTION 2: Academic Record */}
              <div className="flex flex-col gap-5">
                <span className="font-['IBM_Plex_Mono'] text-[12px] text-[#7053AD] tracking-wider uppercase">
                  02 / ACADEMIC RECORD &amp; CERTIFICATE IDENTIFIER
                </span>

                <h3 className="font-['Cormorant_Garamond'] text-[24px] text-[#292333] leading-tight">
                  Academic Record
                </h3>

                {/* Field: Unique Credential ID */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="font-['Inter'] font-semibold text-[13px] text-[#292333]">
                      Unique Credential ID *
                    </label>
                    <button
                      type="button"
                      onClick={handleRegenerateId}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#513582] hover:underline"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Regenerate</span>
                    </button>
                  </div>
                  <div className="w-full px-4 py-3 bg-white/30 border border-white/70 rounded-[10px] focus-within:border-[#7053AD] transition-colors">
                    <input
                      type="text"
                      name="credentialId"
                      value={formData.credentialId}
                      onChange={handleChange}
                      placeholder="TC-2026-A7C91E04"
                      className="w-full bg-transparent font-['IBM_Plex_Mono'] text-[13px] text-[#292333] outline-none placeholder-[#756F80]/60"
                    />
                  </div>
                </div>

                {/* Field: Degree/Certification */}
                <div className="flex flex-col gap-2">
                  <label className="font-['Inter'] font-semibold text-[13px] text-[#292333]">
                    Degree/Certification *
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
                    Branch / Field of Study
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
                    Institution *
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

              {/* Privacy & Consent Notice */}
              <div className="p-4 sm:p-5 rounded-[14px] bg-white/45 border border-[#7053AD]/25 flex flex-col gap-3.5 text-[12px] text-[#513582] shadow-xs">
                <div className="flex items-start gap-2.5">
                  <Lock className="w-4 h-4 shrink-0 mt-0.5 text-[#513582]" />
                  <span className="leading-relaxed">
                    <strong>Privacy &amp; Encryption Policy:</strong> Student name, enrollment number, degree, grade, field of study, and institution are encrypted via <strong>AES-256-GCM</strong> server-side before pinning to IPFS through <code className="font-['IBM_Plex_Mono'] text-[11px] bg-[#513582]/10 px-1.5 py-0.5 rounded-[4px]">/api/pinata</code>. Plaintext PII is never written to IPFS or bundled in browser code.
                  </span>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer select-none pt-3 border-t border-[#7053AD]/15 text-[#292333]">
                  <input
                    type="checkbox"
                    checked={consentAccepted}
                    onChange={(e) => setConsentAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#513582] rounded-[4px] cursor-pointer shrink-0"
                  />
                  <span className="leading-relaxed">
                    I confirm institutional authorization and student consent to mint this non-transferable Soulbound credential to the holder&apos;s wallet. I understand the on-chain token record and encrypted IPFS pointer are permanent and cannot be deleted later.
                  </span>
                </label>
              </div>

              {/* Draft & Issue Actions Section */}
              <div className="flex flex-col gap-3.5">
                <p className="font-['Inter'] text-[13px] leading-[1.6] text-[#756F80]">
                  Review the certificate preview on the right before signing. Issuing encrypts sensitive metadata, pins it to IPFS, and mints the Soulbound NFT on-chain.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="h-[52px] bg-white/40 hover:bg-white/60 border border-white/75 rounded-[12px] font-['Inter'] font-semibold text-[14px] text-[#292333] transition-all cursor-pointer"
                  >
                    Save Draft
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="h-[52px] bg-gradient-to-r from-[#513582] to-[#110B1C] border border-[#1A1A1A] text-white rounded-[12px] font-['Inter'] font-semibold text-[15px] flex items-center justify-center gap-2.5 shadow-[0px_12px_24px_rgba(68,50,84,0.18)] hover:shadow-[0px_16px_32px_rgba(68,50,84,0.25)] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span>{loading ? 'Encrypting & Signing...' : 'Sign & Issue Credential'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {draftSavedTime && (
                  <span className="font-['Inter'] text-[10px] text-[#756F80]">
                    Draft saved · {draftSavedTime}
                  </span>
                )}
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
                <span>{issuedTokenId ? `Issued #${issuedTokenId}` : 'Draft'}</span>
              </div>
            </div>

            {/* Certificate Presentation Card */}
            <div className="relative flex flex-col items-center w-full max-w-[644px]">
              <div 
                className="relative flex flex-col items-center justify-center w-full h-[360px] sm:h-[450px] md:h-[517px] rounded-[20px] sm:rounded-[28px] isolate overflow-hidden"
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
                <div className="w-full flex items-center justify-center -mt-4">
                  <div className="transform scale-[0.52] xs:scale-[0.62] sm:scale-[0.8] md:scale-100 origin-center transition-transform duration-200">
                    <div className="relative w-[520px] h-[390px]">
                  
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

                    <p className="font-['Inter'] text-[7px] tracking-[1.5px] text-[#756F80] mb-1.5 uppercase">
                      Knowledge • Integrity • Possibility
                    </p>

                    {/* Engraved Rule */}
                    <div className="w-full h-[1px] bg-[#E8DBC0] mb-1.5" />

                    <p className="font-['Inter'] text-[8px] tracking-[1.7px] text-[#7053AD] uppercase mb-1 font-medium">
                      Degree Certificate
                    </p>

                    {/* Award Title */}
                    <h1 className="font-['Cormorant_Garamond'] font-medium text-[26px] sm:text-[29px] leading-[1.1] text-[#292333] text-center max-w-[460px] mx-auto text-balance mb-0.5">
                      {degreeMainTitle || 'Degree Program'}
                    </h1>

                    <p className="font-['Cormorant_Garamond'] text-[16px] sm:text-[18px] text-[#5B5565] text-center max-w-[440px] mx-auto text-balance mb-1">
                      in {fieldOfStudy || 'Specialization / Branch'}
                    </p>

                    <p className="font-['Cormorant_Garamond'] text-[11px] text-[#756F80] text-center mb-0.5">
                      is hereby conferred upon
                    </p>

                    {/* Graduate Name */}
                    <h2 className="font-['Cormorant_Garamond'] font-semibold text-[30px] sm:text-[34px] leading-[1.08] text-[#513582] text-center max-w-[460px] mx-auto text-balance mb-1">
                      {formData.studentName || 'Candidate Full Name'}
                    </h2>

                    {/* Identity Binding Pill (Enrollment No + Soulbound Wallet) */}
                    <div className="inline-flex items-center gap-2 px-3 py-0.5 mb-1.5 rounded-full bg-[#F5F0E6]/75 border border-[#E8DBC0] font-['IBM_Plex_Mono'] text-[8px] text-[#292333]">
                      <span>Reg. No: <strong>{formData.enrollmentNumber || 'ENR-2026-••••'}</strong></span>
                      <span>·</span>
                      <span>Holder: <strong>{shortStudentWallet}</strong></span>
                    </div>

                    {/* Award Distinction */}
                    <p className="font-['Cormorant_Garamond'] text-[14px] sm:text-[16px] text-[#5B5565] mb-1.5 text-center leading-normal">
                      with a Cumulative Grade of{' '}
                      <span className="font-['Inter'] font-semibold text-[13px] sm:text-[15px] text-[#292333] ml-0.5 tracking-tight inline-block align-baseline">
                        {formData.grade || 'First Class'}
                      </span>
                    </p>

                    {/* Academic Attestation */}
                    <div className="flex justify-between items-end w-full mt-auto pt-1.5 border-t border-[#E8DBC0]/40">
                      
                      {/* QR Code Verification */}
                      <div className="flex items-center gap-2 w-32">
                        <div className="p-1 bg-white border border-[#E8DBC0] rounded-[5px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] shrink-0">
                          <QRCodeSVG 
                            value={issuedTokenId ? `${window.location.origin}/public-verify?tokenId=${issuedTokenId}` : `${window.location.origin}/public-verify?draft=true`} 
                            size={38} 
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
                            {issuedTokenId ? `Token #${issuedTokenId}` : 'Unissued'}
                          </span>
                        </div>
                      </div>

                      {/* University Gold Seal */}
                      <div className="relative flex items-center justify-center w-[50px] h-[50px] shrink-0">
                        <div className="absolute inset-0 bg-[#E8DBC0] border border-[#A68C57] rounded-full shadow-xs"></div>
                        <div className="absolute inset-[3px] border border-[#A68C57]/70 rounded-full flex flex-col items-center justify-center">
                          <div className="scale-[0.45] text-[#513582]"><Icons.Landmark /></div>
                          <span className="font-['Cormorant_Garamond'] font-semibold text-[8.5px] text-[#513582] leading-none">SEAL</span>
                        </div>
                      </div>

                      {/* Registrar Attestation */}
                      <div className="flex flex-col items-end gap-0.5 w-28">
                        <span className="font-['Cormorant_Garamond'] italic text-[17px] text-[#513582] leading-none">
                          {issuedTokenId ? (account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Authorized Registrar') : 'Unsigned'}
                        </span>
                        <div className="w-full h-[1px] bg-[#E8DBC0]" />
                        <span className="font-['Inter'] text-[7px] text-[#756F80] uppercase">
                          {issuedTokenId ? 'Authorized Signatory' : 'DRAFT · NOT ISSUED'}
                        </span>
                      </div>
                    </div>

                    {/* Credential Provenance */}
                    <div className="flex justify-between items-center w-full mt-1 pt-1 border-t border-[#E8DBC0]/30">
                      <span className="font-['IBM_Plex_Mono'] text-[8px] text-[#756F80]">
                        {formData.credentialId || 'TC-DRAFT-PREVIEW'}
                      </span>
                      <span className="font-['Inter'] text-[8px] tracking-[0.5px] text-[#7053AD] uppercase font-medium">
                        {issuedTokenId ? 'Digitally Issued • Soulbound' : 'AES-256-GCM Draft'}
                      </span>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Presentation Caption */}
            <div className="absolute bottom-[14px] sm:bottom-[18px] flex items-center gap-1.5 px-3 py-1.5 bg-white/80 border border-white/70 rounded-full z-30 shadow-xs backdrop-blur-md max-w-[90%]">
              <div className="text-[#7053AD] shrink-0">
                <Icons.Eye />
              </div>
              <span className="font-['Inter'] text-[10px] sm:text-[11px] text-[#292333] truncate">
                {issuedTokenId ? 'Official Soulbound record · AES-256-GCM encrypted on IPFS' : 'Preview only · not signed or issued'}
              </span>
            </div>
          </div>
        </div>

            <p className="font-['Inter'] text-[13px] leading-[1.6] text-[#756F80]">
              Credential ID <span className="font-['IBM_Plex_Mono'] text-[#513582]">{formData.credentialId}</span> · Bound to Soulbound Wallet <span className="font-['IBM_Plex_Mono']">{shortStudentWallet}</span>.
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
                Cryptographic Verification &amp; Privacy
              </h3>

              <p className="font-['Inter'] text-[13px] leading-[1.6] text-[#756F80]">
                The preview is an unsigned draft. Issuance encrypts confidential attributes via AES-256-GCM before uploading to IPFS and mints a non-transferable ERC-721 token owned exclusively by the student wallet.
              </p>

              {/* Inset Box */}
              <div 
                className="w-full rounded-[10px] p-4 flex flex-col gap-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.22)',
                  border: '1px solid rgba(255, 255, 255, 0.72)',
                  boxShadow: '0px 12px 30px rgba(81, 65, 109, 0.047), inset 0px 1px 2px rgba(255, 255, 255, 0.4)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-['Inter'] font-semibold text-[12px] text-[#7053AD]">
                    {issuedTokenId ? 'Encrypted & Anchored · Confirmed' : 'Draft payload · unsigned'}
                  </span>
                </div>

                <div className="font-['IBM_Plex_Mono'] text-[11px] leading-[1.5] text-[#756F80] break-all">
                  <span>{payloadDigest ? `Keccak-256 · ${payloadDigest.slice(0, 14)}...${payloadDigest.slice(-8)}` : 'Keccak-256 · Computed on encryption'}</span><br/>
                  <span>IPFS Storage: AES-256-GCM Ciphertext Only (Zero Plaintext PII)</span>
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
                  <span className="text-[#756F80]">Soulbound Binding</span>
                  <span className="text-[#292333] font-medium">{shortStudentWallet}</span>
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
