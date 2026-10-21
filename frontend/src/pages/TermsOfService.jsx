import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import SettingsDropdown from '../components/SettingsDropdown';
import { Scale, Shield, AlertTriangle, ArrowRight, ExternalLink, Mail, Copy, Check, ShieldCheck } from 'lucide-react';

const TermsOfService = () => {
  const navigate = useNavigate();
  const { account, connectWallet, disconnectWallet, isAdmin, isIssuer, networkId, loading: web3Loading } = useWeb3();
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('founder@deoxys.in');
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      setCopiedEmail(false);
    }
  };

  const glassCardStyle = {
    background: 'rgba(255, 255, 255, 0.28)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    boxShadow: '0 8px 32px rgba(81, 65, 109, 0.05), inset 0 1px 2px rgba(255, 255, 255, 0.8)'
  };

  const innerGlassStyle = {
    background: 'rgba(255, 255, 255, 0.38)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.85)',
    boxShadow: '0 4px 20px rgba(81, 65, 109, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.9)'
  };

  const sections = [
    {
      id: 'acceptance',
      number: '01',
      title: 'Acceptance of Terms & Binding Agreement',
      content: (
        <>
          <p className="mb-4">
            By connecting a cryptographic wallet (such as MetaMask or WalletConnect), accessing the web portal, or interacting with TokCred smart contracts on Ethereum Sepolia or any decentralized layer, you explicitly agree to be bound by these <strong className="text-[#292333]">Terms of Service</strong>.
          </p>
          <p className="mb-4">
            If you represent an academic university, registrar, or collegiate entity, you represent and warrant that you possess the lawful authority to bind that institution to these terms. If you do not agree to these terms, you must discontinue platform use immediately.
          </p>
        </>
      )
    },
    {
      id: 'non-custodial',
      number: '02',
      title: 'Non-Custodial Architecture & Key Responsibility',
      content: (
        <>
          <p className="mb-4">
            TokCred is a non-custodial decentralized platform. We do not maintain, manage, or have access to your private cryptographic keys, seed phrases, or wallet accounts.
          </p>
          <div 
            className="p-5 rounded-[18px] flex items-start gap-3.5 my-3"
            style={innerGlassStyle}
          >
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[13.5px] text-[#5B5565] leading-relaxed">
              <strong className="text-[#292333]">Irreversible Wallet Loss:</strong> You are solely and exclusively responsible for securing your wallet credentials. If you lose access to your private key or transfer rights to an inaccessible address, TokCred has no technical capability to retrieve, reassign, or recover your digital credential.
            </div>
          </div>
        </>
      )
    },
    {
      id: 'soulbound-tokens',
      number: '03',
      title: 'Soulbound Tokens (ERC-721 Non-Transferability)',
      content: (
        <>
          <p className="mb-4">
            All academic credentials minted through TokCred enforce strict non-transferability (Soulbound) constraints directly inside the smart contract code.
          </p>
          <ul className="space-y-3 mb-4">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7053AD] mt-2 shrink-0" />
              <div>
                <strong className="text-[#292333]">Zero Financial or Speculative Value:</strong> Credentials do not constitute financial instruments, securities, equities, or tradeable investments.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7053AD] mt-2 shrink-0" />
              <div>
                <strong className="text-[#292333]">No Secondary Trading:</strong> Standard ERC-721 transfer functions (<code className="font-['IBM_Plex_Mono'] text-[12px] bg-white/70 px-1.5 py-0.5 rounded text-[#513582] border border-white/80">transferFrom</code> and <code className="font-['IBM_Plex_Mono'] text-[12px] bg-white/70 px-1.5 py-0.5 rounded text-[#513582] border border-white/80">safeTransferFrom</code>) revert automatically if initiated by any unauthorized party.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7053AD] mt-2 shrink-0" />
              <div>
                <strong className="text-[#292333]">Single-Identity Attestation:</strong> Credentials serve exclusively as permanent, tamper-resistant attestation of individual academic attainment.
              </div>
            </li>
          </ul>
        </>
      )
    },
    {
      id: 'institution-authority',
      number: '04',
      title: 'Institutional Rights & Revocation Mechanics',
      content: (
        <>
          <p className="mb-4">
            The veracity and integrity of any credential issued on TokCred are the sole legal responsibility of the issuing educational institution.
          </p>
          <p className="mb-4">
            Issuing institutions hold the cryptographic right to execute the on-chain <code className="font-['IBM_Plex_Mono'] text-[12px] bg-white/70 px-1.5 py-0.5 rounded text-[#513582] border border-white/80">revokeCredential(uint256 tokenId)</code> method if:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div 
              className="p-4 rounded-[16px]"
              style={innerGlassStyle}
            >
              <span className="font-['IBM_Plex_Mono'] text-[11px] font-semibold text-[#7053AD]">REASON 01</span>
              <p className="text-[13.5px] font-semibold text-[#292333] mt-1">Academic Misconduct</p>
              <p className="text-[12px] text-[#756F80] mt-0.5">Degree annulment or fraud.</p>
            </div>
            <div 
              className="p-4 rounded-[16px]"
              style={innerGlassStyle}
            >
              <span className="font-['IBM_Plex_Mono'] text-[11px] font-semibold text-[#7053AD]">REASON 02</span>
              <p className="text-[13.5px] font-semibold text-[#292333] mt-1">Typographical Error</p>
              <p className="text-[12px] text-[#756F80] mt-0.5">Administrative metadata correction.</p>
            </div>
            <div 
              className="p-4 rounded-[16px]"
              style={innerGlassStyle}
            >
              <span className="font-['IBM_Plex_Mono'] text-[11px] font-semibold text-[#7053AD]">REASON 03</span>
              <p className="text-[13.5px] font-semibold text-[#292333] mt-1">Erroneous Recipient</p>
              <p className="text-[12px] text-[#756F80] mt-0.5">Accidental dispatch to wrong wallet.</p>
            </div>
          </div>
          <p className="text-[13.5px] text-[#5B5565]">
            Revocation is publicly transparent on the blockchain, marking the credential as revoked across all verification portals.
          </p>
        </>
      )
    },
    {
      id: 'prohibited-conduct',
      number: '05',
      title: 'Prohibited Conduct & Anti-Forgery Protection',
      content: (
        <>
          <p className="mb-3">Users and institutions agree NOT to engage in any of the following activities:</p>
          <ul className="space-y-2.5 mb-4">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
              <span>Forging, misrepresenting, or uploading fraudulent academic transcripts or unauthorized institutional signatures.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
              <span>Attempting to exploit, frontrun, or re-enter smart contracts to bypass role-based access control (RBAC).</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
              <span>Impersonating an accredited academic registrar or claiming institutional credentials without administrative authorization.</span>
            </li>
          </ul>
        </>
      )
    },
    {
      id: 'network-mechanics',
      number: '06',
      title: 'Blockchain Mechanics, Gas Fees & Outages',
      content: (
        <>
          <p className="mb-4">
            All write transactions (such as credential minting, role assignment, and revocation) require execution on the Ethereum network and consume gas fees payable in native cryptocurrency (e.g. Sepolia ETH).
          </p>
          <p className="mb-4">
            TokCred is not responsible for Ethereum network congestion, gas fee volatility, block reorganization forks, or temporary public RPC connectivity failures beyond our immediate infrastructure control.
          </p>
        </>
      )
    },
    {
      id: 'liability',
      number: '07',
      title: 'Limitation of Liability & Warranty Disclaimer',
      content: (
        <>
          <p className="mb-4">
            THE TOKCRED PROTOCOL IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED UNDER APPLICABLE LAW, TOKCRED, ITS DEVELOPERS, AND ITS CONTRIBUTORS SHALL NOT BE LIABLE FOR ANY INDIRECT, CONSEQUENTIAL, EXEMPLARY, OR SPECIAL DAMAGES ARISING OUT OF PROTOCOL USE, REPUTATIONAL MATTERS, OR REGULATORY CHANGES.
          </p>
        </>
      )
    },
    {
      id: 'contact',
      number: '08',
      title: 'Institutional Inquiries & Legal Counsel',
      content: (
        <>
          <p className="mb-4">
            For legal inquiries, partnership contracts, or university institutional onboarding, please contact:
          </p>
          <div 
            className="p-6 rounded-[20px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={innerGlassStyle}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-white/60 border border-white/80 flex items-center justify-center text-[#7053AD] shrink-0 shadow-xs">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="font-['Inter'] font-semibold text-[14.5px] text-[#292333]">Protocol Legal & Partnerships</p>
                <p className="font-['IBM_Plex_Mono'] text-[13.5px] text-[#7053AD]">founder@deoxys.in</p>
              </div>
            </div>
            <button
              onClick={handleCopyEmail}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-medium text-[#292333] hover:scale-105 active:scale-95 transition-all shadow-xs"
              style={{
                background: 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.9)'
              }}
            >
              {copiedEmail ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#756F80]" />}
              <span>{copiedEmail ? 'Copied' : 'Copy Email'}</span>
            </button>
          </div>
        </>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#CDCDCD] font-['Inter'] flex flex-col selection:bg-[#7053AD]/20 relative overflow-hidden">
      
      {/* Background ambient lighting for frosted diffraction */}
      <div className="absolute top-[5%] left-[8%] w-[550px] h-[550px] bg-white/60 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[35%] right-[5%] w-[500px] h-[500px] bg-[#E8DBC0]/45 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[20%] w-[600px] h-[600px] bg-white/40 rounded-full blur-[140px] pointer-events-none" />

      {/* Floating Pill Header matching PublicVerify */}
      <div className="w-full pt-[24px] pb-[16px] flex justify-center px-6 lg:px-16 z-50">
        <div className="w-full max-w-[1312px] flex items-center justify-between relative">
          
          {/* Left: Brand mark */}
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity"
          >
            <div className="flex items-center justify-center w-9 h-9 bg-[#513582] rounded-[9px] shadow-sm">
              <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.5 3L2 7.5L10.5 12L19 7.5L10.5 3Z" stroke="#FFFEFA" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12.5L10.5 17L19 12.5" stroke="#FFFEFA" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-['Cormorant_Garamond'] font-semibold text-[22px] tracking-[-0.5px] text-[#292333]">
              TokCred
            </span>
          </div>

          {/* Center: Navigation Pill */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center h-[52px] px-[28px] bg-white/70 border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,1)] backdrop-blur-xl rounded-full text-[14px] font-[500] text-[#5B5565] gap-[28px]">
            <span className="cursor-pointer hover:text-[#292333] transition-colors" onClick={() => navigate('/')}>Home</span>
            <span className="cursor-pointer hover:text-[#292333] transition-colors" onClick={() => navigate('/features')}>Features</span>
            
            {Boolean(account && (isAdmin || isIssuer)) && (
              <span className="cursor-pointer font-semibold text-[#513582] hover:opacity-80 transition-opacity" onClick={() => navigate('/dashboard')}>Admin</span>
            )}
            {Boolean(account && !isAdmin && !isIssuer) && (
              <span className="cursor-pointer font-semibold text-[#513582] hover:opacity-80 transition-opacity" onClick={() => navigate('/student-dashboard')}>Student</span>
            )}

            {Boolean(account && (isAdmin || isIssuer)) && (
              <>
                <span className="cursor-pointer hover:text-[#292333] transition-colors" onClick={() => navigate('/issue')}>Issue</span>
                <span className="cursor-pointer hover:text-[#292333] transition-colors" onClick={() => navigate('/history')}>History</span>
              </>
            )}

            <span className="cursor-pointer hover:text-[#292333] transition-colors" onClick={() => navigate('/public-verify')}>Public Verify</span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <SettingsDropdown />
            <button 
              onClick={account ? disconnectWallet : connectWallet} 
              title={account ? `Connected: ${account} (Click to disconnect)` : 'Connect Wallet'}
              className="h-[52px] px-[22px] text-[14px] font-[500] rounded-full flex items-center gap-2.5 transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_8px_24px_rgba(176,150,250,0.2)] bg-[#2D264B] text-white hover:bg-[#3C315B]"
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

      {/* Main Legal Content Container */}
      <main className="flex-1 flex flex-col items-center pt-[32px] pb-[72px] px-6 sm:px-12 max-w-[1080px] mx-auto w-full relative z-10">
        
        {/* Hero Header */}
        <div className="flex flex-col items-center text-center max-w-[760px] mx-auto mb-12">
          
          {/* Pill Badge with Frosted Glass */}
          <div 
            className="flex items-center gap-2 px-[16px] py-[9px] rounded-full w-fit mb-4"
            style={{
              background: 'rgba(255, 255, 255, 0.45)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.85)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02), inset 0 1px 1px rgba(255,255,255,1)'
            }}
          >
            <Scale className="w-4 h-4 text-[#7053AD]" />
            <span className="font-['Inter'] font-semibold text-[13px] tracking-normal text-[#7053AD] uppercase">
              Terms & Protocol Conditions
            </span>
          </div>

          <h1 className="font-['Cormorant_Garamond'] font-medium text-[48px] sm:text-[64px] leading-[1.05] tracking-[-1.5px] text-[#292333] mb-4 text-balance">
            Terms of Service &<br/>User Agreement
          </h1>

          <p className="font-['Inter'] text-[15.5px] leading-[165%] text-[#5B5565] max-w-[580px] mb-4">
            The legal and operational terms governing interaction with TokCred non-custodial smart contracts and verification endpoints.
          </p>

          <div 
            className="flex items-center gap-2 text-[12px] font-['IBM_Plex_Mono'] text-[#7053AD] px-4 py-1.5 rounded-full"
            style={{
              background: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.85)'
            }}
          >
            <span>Protocol v2.0</span>
            <span>•</span>
            <span>Effective: October 2026</span>
          </div>
        </div>

        {/* Legal Sections Stack - All containers with frosted glass */}
        <div className="flex flex-col gap-6 w-full">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="rounded-[26px] p-7 sm:p-9 transition-all duration-300 hover:scale-[1.005]"
              style={glassCardStyle}
            >
              <div className="flex items-center gap-3 mb-4">
                <span 
                  className="font-['IBM_Plex_Mono'] text-[13px] font-bold text-[#7053AD] px-3 py-1 rounded-[10px]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.55)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.9)'
                  }}
                >
                  {section.number}
                </span>
                <h2 className="font-['Cormorant_Garamond'] font-semibold text-[26px] sm:text-[30px] leading-tight text-[#292333]">
                  {section.title}
                </h2>
              </div>

              <div className="font-['Inter'] text-[14.5px] text-[#5B5565] leading-[175%] pt-1">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        {/* Cross-Link Callout with Frosted Glass Container */}
        <div 
          className="w-full mt-10 p-7 rounded-[26px] flex flex-col sm:flex-row items-center justify-between gap-5"
          style={{
            background: 'rgba(255, 255, 255, 0.32)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.85)',
            boxShadow: '0 12px 32px rgba(81, 65, 109, 0.06), inset 0 1px 2px rgba(255, 255, 255, 0.85)'
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-[#513582] flex items-center justify-center text-white shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[15.5px] text-[#292333]">Looking for our Privacy Policy?</h3>
              <p className="text-[13px] text-[#756F80]">Understand cryptographic IPFS metadata storage, zero-knowledge proofs, and on-chain immutability.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/privacy')}
            className="flex items-center gap-2 px-6 py-3 bg-[#2D264B] text-white hover:bg-[#3C315B] rounded-full text-[13.5px] font-medium transition-all shadow-md shrink-0 hover:scale-105 active:scale-95"
          >
            <span>Privacy Policy</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </main>
    </div>
  );
};

export default TermsOfService;
