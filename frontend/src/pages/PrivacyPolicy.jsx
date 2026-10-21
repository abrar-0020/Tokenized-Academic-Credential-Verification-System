import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import SettingsDropdown from '../components/SettingsDropdown';
import { ShieldCheck, Lock, Database, ArrowRight, ExternalLink, Mail, Copy, Check, FileText } from 'lucide-react';

const PrivacyPolicy = () => {
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
      id: 'introduction',
      number: '01',
      title: 'Decentralized Architecture & Introduction',
      content: (
        <>
          <p className="mb-4">
            Welcome to <strong className="text-[#292333]">TokCred</strong> (operated across decentralized infrastructure protocols). We are fundamentally committed to protecting student and institutional privacy while ensuring transparent cryptographic integrity.
          </p>
          <p className="mb-4">
            Unlike legacy centralized credential databases that store sensitive personal data on vulnerable private servers, TokCred operates as a <strong className="text-[#513582]">non-custodial, open-verification protocol</strong>. This Privacy Policy details the technical boundaries of what is stored on-chain, what is pinned to IPFS, and what stays strictly on your local machine.
          </p>
          <div 
            className="p-5 rounded-[16px] flex items-start gap-3.5 mt-4"
            style={innerGlassStyle}
          >
            <Lock className="w-5 h-5 text-[#7053AD] shrink-0 mt-0.5" />
            <div className="text-[13.5px] text-[#5B5565] leading-relaxed">
              <strong className="text-[#292333]">Key Takeaway:</strong> TokCred does not collect passwords, social security numbers, government IDs, or private banking details. Verification operates entirely via cryptographic public keys.
            </div>
          </div>
        </>
      )
    },
    {
      id: 'immutability',
      number: '02',
      title: 'Blockchain Immutability & Public Ledger Data',
      content: (
        <>
          <p className="mb-4">
            TokCred interacts directly with the Ethereum Sepolia blockchain network and the InterPlanetary File System (IPFS). By minting, holding, or publicly verifying an academic credential on this platform, you acknowledge and agree that:
          </p>
          <ul className="space-y-3 mb-4">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7053AD] mt-2 shrink-0" />
              <div>
                <strong className="text-[#292333]">Public Ledger Visibility:</strong> Smart contract interactions—including wallet addresses, transaction hashes, block timestamps, and minted Token IDs—are permanently recorded on the public Ethereum ledger.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7053AD] mt-2 shrink-0" />
              <div>
                <strong className="text-[#292333]">Decentralized IPFS Pinning:</strong> Credential metadata (student name, degree title, major, graduation grade, and issuing authority) is cryptographically hashed and pinned to IPFS. This metadata is globally accessible via content identifier (CID) hashes.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7053AD] mt-2 shrink-0" />
              <div>
                <strong className="text-[#292333]">Non-Alterable Nature:</strong> Due to the immutable architecture of decentralized blockchains, data once written into confirmed blocks cannot be modified, overwritten, or erased by any centralized party.
              </div>
            </li>
          </ul>
        </>
      )
    },
    {
      id: 'data-collection',
      number: '03',
      title: 'Information We Process',
      content: (
        <>
          <p className="mb-4">We categorize processed information into three distinct functional tiers:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div 
              className="p-5 rounded-[18px] flex flex-col gap-2"
              style={innerGlassStyle}
            >
              <span className="font-['IBM_Plex_Mono'] text-[11px] font-semibold text-[#7053AD] uppercase">Tier 1 · On-Chain</span>
              <h4 className="font-semibold text-[15px] text-[#292333]">Public Wallet Addresses</h4>
              <p className="text-[12.5px] text-[#5B5565] leading-relaxed">
                Ethereum 0x addresses for issuers and recipients used to bind Soulbound NFT credentials.
              </p>
            </div>
            <div 
              className="p-5 rounded-[18px] flex flex-col gap-2"
              style={innerGlassStyle}
            >
              <span className="font-['IBM_Plex_Mono'] text-[11px] font-semibold text-[#7053AD] uppercase">Tier 2 · IPFS</span>
              <h4 className="font-semibold text-[15px] text-[#292333]">Academic Metadata</h4>
              <p className="text-[12.5px] text-[#5B5565] leading-relaxed">
                Institutional name, degree conferred, field of study, cumulative grade, and issuance date.
              </p>
            </div>
            <div 
              className="p-5 rounded-[18px] flex flex-col gap-2"
              style={innerGlassStyle}
            >
              <span className="font-['IBM_Plex_Mono'] text-[11px] font-semibold text-[#7053AD] uppercase">Tier 3 · Local Cache</span>
              <h4 className="font-semibold text-[15px] text-[#292333]">Browser Storage</h4>
              <p className="text-[12.5px] text-[#5B5565] leading-relaxed">
                Transient local form drafts (localStorage) kept strictly in your local browser sandbox.
              </p>
            </div>
          </div>
          <p className="text-[13.5px] text-[#756F80] italic">
            TokCred does NOT employ behavioral advertising trackers, data brokers, or third-party marketing cookies.
          </p>
        </>
      )
    },
    {
      id: 'soulbound',
      number: '04',
      title: 'Soulbound Privacy & Non-Transferability',
      content: (
        <>
          <p className="mb-4">
            All credentials issued through the TokCred protocol implement strictly non-transferable (Soulbound) smart contract rules.
          </p>
          <p className="mb-4">
            This architectural constraint prevents fraudulent secondary market trading, unauthorized impersonation, or academic credential swapping. The credential remains cryptographically bound to the recipient's wallet address unless officially revoked by the authenticated issuing university registrar.
          </p>
        </>
      )
    },
    {
      id: 'rpc-nodes',
      number: '05',
      title: 'Third-Party Node Providers & IPFS Gateways',
      content: (
        <>
          <p className="mb-4">
            When you interact with the TokCred web interface or verify a credential publicly without an Ethereum wallet, the application communicates with trusted remote procedure call (RPC) nodes and IPFS gateways:
          </p>
          <ul className="space-y-2.5 mb-4">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7053AD] mt-2 shrink-0" />
              <span><strong className="text-[#292333]">Public Ethereum RPCs:</strong> Nodes such as PublicNode provide read-only contract state queries.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7053AD] mt-2 shrink-0" />
              <span><strong className="text-[#292333]">Pinata IPFS Gateway:</strong> Used for immutable metadata pinning and public content retrieval.</span>
            </li>
          </ul>
          <p className="text-[13.5px] text-[#756F80]">
            These providers may log transient network IP addresses in accordance with standard infrastructure logging practices, but cannot associate your real-world identity with arbitrary contract queries.
          </p>
        </>
      )
    },
    {
      id: 'revocation',
      number: '06',
      title: 'Revocation Records & Audit Trails',
      content: (
        <>
          <p className="mb-4">
            Academic institutions retain the cryptographic authority to revoke an academic credential on-chain in cases of administrative correction, academic malpractice, or disciplinary resolution.
          </p>
          <p className="mb-4">
            When a credential is revoked, the smart contract emits a permanent <code className="font-['IBM_Plex_Mono'] text-[12.5px] bg-white/70 px-2 py-0.5 rounded text-[#513582] border border-white/80">CredentialRevoked</code> event. The verification interface will display a clear revocation alert while preserving the cryptographic audit trail for historical verification integrity.
          </p>
        </>
      )
    },
    {
      id: 'contact',
      number: '07',
      title: 'Institutional Inquiries & Protocol Contact',
      content: (
        <>
          <p className="mb-4">
            If your academic institution, regulatory body, or legal counsel has questions regarding decentralized data handling, privacy compliance, or smart contract audits, please reach out to our core team:
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
                <p className="font-['Inter'] font-semibold text-[14.5px] text-[#292333]">Institutional Privacy Office</p>
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
            <ShieldCheck className="w-4 h-4 text-[#7053AD]" />
            <span className="font-['Inter'] font-semibold text-[13px] tracking-normal text-[#7053AD] uppercase">
              Legal & Compliance Protocol
            </span>
          </div>

          <h1 className="font-['Cormorant_Garamond'] font-medium text-[48px] sm:text-[64px] leading-[1.05] tracking-[-1.5px] text-[#292333] mb-4 text-balance">
            Privacy Policy &<br/>Data Integrity
          </h1>

          <p className="font-['Inter'] text-[15.5px] leading-[165%] text-[#5B5565] max-w-[580px] mb-4">
            How decentralized public ledgers, content-addressed IPFS pinning, and non-transferable Soulbound standards protect academic authenticity.
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
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[15.5px] text-[#292333]">Looking for our User Agreement?</h3>
              <p className="text-[13px] text-[#756F80]">Review institutional rights, non-custodial wallet terms, and platform usage boundaries.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/terms')}
            className="flex items-center gap-2 px-6 py-3 bg-[#2D264B] text-white hover:bg-[#3C315B] rounded-full text-[13.5px] font-medium transition-all shadow-md shrink-0 hover:scale-105 active:scale-95"
          >
            <span>Terms of Service</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </main>
    </div>
  );
};

export default PrivacyPolicy;
