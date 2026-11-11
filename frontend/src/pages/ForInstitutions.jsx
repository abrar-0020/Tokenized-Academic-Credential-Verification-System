import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import SettingsDropdown from '../components/SettingsDropdown';
import WalletConnectButton from '../components/WalletConnectButton';
import { CONTRACT_ADDRESS } from '../config/contract';
import { formatAddress } from '../utils/helpers';
import {
  ShieldCheck,
  FileText,
  Clock,
  LayoutDashboard,
  Wallet,
  ArrowRight,
  AlertTriangle,
  ExternalLink,
  Menu,
  X,
  Search,
  GraduationCap,
  Lock,
  CheckCircle2
} from 'lucide-react';

const ROUTE_LABELS = {
  '/dashboard': 'Registrar Dashboard',
  '/issue': 'Credential Issuance',
  '/history': 'Verification Registry & History',
};

const ForInstitutions = ({ requestedPath = null }) => {
  const navigate = useNavigate();
  const {
    account,
    isAdmin,
    isIssuer,
    isAuthorizedIssuer,
    networkId,
    connectWallet,
    switchWallet,
    disconnectWallet,
    loading: web3Loading,
    error: web3Error
  } = useWeb3();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const normalizedPath = requestedPath?.endsWith('/') && requestedPath !== '/'
    ? requestedPath.slice(0, -1)
    : requestedPath;
  const requestedLabel = normalizedPath ? ROUTE_LABELS[normalizedPath] : null;
  const isWrongWallet = Boolean(account && !isAuthorizedIssuer);

  return (
    <div className="min-h-screen bg-[#CDCDCD] text-[#292333] font-['Inter'] flex flex-col selection:bg-[#7053AD]/20 selection:text-[#513582]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');
      `}</style>

      {/* ── TOP NAVIGATION (Standard TokCred Floating Pill Navbar) ────────────────── */}
      <div className="w-full pt-[16px] sm:pt-[24px] flex justify-center px-4 sm:px-6 lg:px-16 z-[100] mb-4 shrink-0">
        <div className="w-full max-w-[1312px] flex items-center justify-between relative">
          {/* Left: Logo */}
          <div
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity h-[48px] sm:h-[56px] -ml-2 sm:-ml-6"
            onClick={() => navigate('/')}
          >
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
            <span className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => navigate('/features')}>Features</span>
            {isAuthorizedIssuer ? (
              <span className="cursor-pointer hover:opacity-70 transition-opacity font-semibold text-[#513582]" onClick={() => navigate('/dashboard')}>Dashboard</span>
            ) : (
              <span className="cursor-pointer hover:opacity-70 transition-opacity font-semibold text-[#513582]" onClick={() => navigate('/institutions')}>For Institutions</span>
            )}
            {isWrongWallet && (
              <span className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => navigate('/student-dashboard')}>Student</span>
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

            <WalletConnectButton
              disconnectedLabel="Connect Wallet"
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
                onClick={() => { navigate('/features'); setMobileMenuOpen(false); }}
                className="text-left px-4 py-3 rounded-2xl hover:bg-black/5 text-[15px]"
              >
                Features
              </button>
              <button
                onClick={() => { navigate('/institutions'); setMobileMenuOpen(false); }}
                className="text-left px-4 py-3 rounded-2xl bg-[#513582]/10 text-[#513582] text-[15px] font-semibold flex items-center justify-between"
              >
                <span>For Institutions</span>
                <span>●</span>
              </button>
              {isWrongWallet && (
                <button
                  onClick={() => { navigate('/student-dashboard'); setMobileMenuOpen(false); }}
                  className="text-left px-4 py-3 rounded-2xl hover:bg-black/5 text-[15px] text-[#292333]"
                >
                  Student Dashboard
                </button>
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

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────────────── */}
      <main className="max-w-[1440px] w-full mx-auto px-6 md:px-16 py-8 md:py-12 flex flex-col gap-8 flex-grow justify-center">
        {/* Contextual Gate Notice Banner */}
        {requestedLabel && !isAuthorizedIssuer && (
          <div
            className="w-full rounded-2xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs"
            style={{
              background: isWrongWallet ? 'rgba(152, 81, 76, 0.10)' : 'rgba(81, 53, 130, 0.08)',
              border: isWrongWallet ? '1px solid rgba(152, 81, 76, 0.28)' : '1px solid rgba(81, 53, 130, 0.22)',
              color: isWrongWallet ? '#7D3B37' : '#3C2763'
            }}
          >
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 shrink-0" />
              <span>
                <strong>{requestedLabel}</strong> requires a connected institutional wallet with on-chain{' '}
                <code className="font-['IBM_Plex_Mono'] bg-white/60 px-1.5 py-0.5 rounded">ISSUER_ROLE</code> authorization.
              </span>
            </div>
            <span className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-wider opacity-75">
              Sepolia Access Control
            </span>
          </div>
        )}

        {web3Error && (
          <div className="w-full bg-[#98514C]/10 border border-[#98514C]/30 text-[#98514C] px-5 py-3.5 rounded-2xl text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{web3Error}</span>
          </div>
        )}

        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* LEFT COLUMN: Overview & Wallet Auth CTA */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <span className="font-['IBM_Plex_Mono'] text-[12px] uppercase tracking-wider text-[#7053AD]">
                FOR INSTITUTIONS · ISSUER PORTAL
              </span>

              <h1 className="font-['Cormorant_Garamond'] font-medium text-[50px] sm:text-[64px] leading-[1.02] text-[#292333] tracking-[-1.5px]">
                {isWrongWallet
                  ? 'Authorized issuer wallet required.'
                  : isAuthorizedIssuer
                    ? 'Institutional access verified.'
                    : 'For institutions.'}
              </h1>

              <p className="font-['Inter'] font-normal text-[14px] leading-[1.65] text-[#5B5565] max-w-[540px]">
                {isWrongWallet ? (
                  <>
                    Wallet <code className="font-['IBM_Plex_Mono'] text-[12px] bg-white/60 px-1.5 py-0.5 rounded text-[#513582]">{formatAddress(account)}</code> is connected,
                    but does not hold <code className="font-['IBM_Plex_Mono'] text-[12px] bg-white/60 px-1.5 py-0.5 rounded text-[#513582]">ISSUER_ROLE</code> or admin rights on the TokCred contract.
                    Switch to your registrar wallet to open the issuer workspace, or view your personal student credentials.
                  </>
                ) : isAuthorizedIssuer ? (
                  <>
                    Your connected wallet (<code className="font-['IBM_Plex_Mono'] text-[12px] bg-white/60 px-1.5 py-0.5 rounded text-[#513582]">{formatAddress(account)}</code>) is authorized on-chain.
                    Select a workspace tool below to manage, issue, or audit credentials.
                  </>
                ) : (
                  <>
                    TokCred enables universities and accredited registrars to issue tamper-proof, non-transferable Soulbound academic credentials on Ethereum Sepolia with IPFS metadata pinning.
                    Connect an authorized institutional wallet to access the Registrar Dashboard, Issuance Desk, and Verification Registry.
                  </>
                )}
              </p>
            </div>

            {/* Action Buttons */}
            {!account && (
              <div className="space-y-3 pt-1">
                <div className="flex flex-wrap items-start gap-3">
                  <WalletConnectButton
                    disconnectedLabel="Connect Issuer Wallet"
                    showStatusDot={false}
                    inlineNotice={true}
                    popoverAlign="left"
                    className="h-[52px] px-7 rounded-full bg-[#2D264B] hover:bg-[#3C315B] text-white text-[14px] font-medium shadow-[0_12px_28px_rgba(45,38,75,0.2)] hover:scale-[1.02] active:scale-[0.98]"
                    missingClassName="inline-flex items-center justify-center gap-2 h-[52px] px-6 rounded-full bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-[14px] font-semibold shadow-sm transition-colors"
                  />

                  <button
                    type="button"
                    onClick={() => navigate('/public-verify')}
                    className="h-[52px] px-6 rounded-full bg-white/55 hover:bg-white/80 border border-white/80 text-[#292333] text-[14px] font-medium flex items-center gap-2 transition-all backdrop-blur-md"
                  >
                    <Search className="w-4 h-4 text-[#7053AD]" />
                    <span>Public Verify</span>
                  </button>
                </div>
                <p className="text-[13px] text-[#5B5565] font-medium">
                  Public verification needs no wallet — issuing credentials requires MetaMask.
                </p>
              </div>
            )}

            {isWrongWallet && (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={switchWallet || disconnectWallet}
                  disabled={web3Loading}
                  className="h-[52px] px-7 rounded-full bg-[#2D264B] hover:bg-[#3C315B] text-white text-[14px] font-medium flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_12px_28px_rgba(45,38,75,0.2)] disabled:opacity-60"
                >
                  <Wallet className="w-4 h-4" />
                  <span>{web3Loading ? 'Switching Wallet...' : 'Switch to Issuer Wallet'}</span>
                </button>

                <button
                  onClick={() => navigate('/student-dashboard')}
                  className="h-[52px] px-6 rounded-full bg-white/60 hover:bg-white/85 border border-white/80 text-[#513582] text-[14px] font-semibold flex items-center gap-2 transition-all backdrop-blur-md"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Open Student Dashboard</span>
                </button>
              </div>
            )}

            {isAuthorizedIssuer && (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="h-[50px] px-6 rounded-full bg-[#2D264B] hover:bg-[#3C315B] text-white text-[14px] font-medium flex items-center gap-2 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Open Dashboard</span>
                </button>
                <button
                  onClick={() => navigate('/issue')}
                  className="h-[50px] px-6 rounded-full bg-[#513582] hover:bg-[#41276b] text-white text-[14px] font-medium flex items-center gap-2 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>Issue Credential</span>
                </button>
                <button
                  onClick={() => navigate('/history')}
                  className="h-[50px] px-6 rounded-full bg-white/60 hover:bg-white/85 border border-white/80 text-[#292333] text-[14px] font-medium flex items-center gap-2 transition-all"
                >
                  <Clock className="w-4 h-4 text-[#7053AD]" />
                  <span>History</span>
                </button>
              </div>
            )}

            {/* Onboarding & Support Callout */}
            <div
              className="w-full rounded-[22px] p-5 flex flex-col gap-3 mt-2"
              style={{
                background: 'rgba(255, 255, 255, 0.28)',
                border: '1px solid rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-wider text-[#513582] font-semibold">
                  Institutional Onboarding &amp; Role Setup
                </span>
                <ShieldCheck className="w-4 h-4 text-[#7053AD]" />
              </div>
              <p className="text-[12.5px] leading-[1.6] text-[#5B5565]">
                Access is enforced directly on-chain via OpenZeppelin <code className="font-['IBM_Plex_Mono'] text-[11px] bg-white/60 px-1 py-0.5 rounded">AccessControl</code> on Sepolia contract{' '}
                <code className="font-['IBM_Plex_Mono'] text-[11px] bg-white/60 px-1 py-0.5 rounded">{formatAddress(CONTRACT_ADDRESS)}</code>.
                An administrator holding <code className="font-['IBM_Plex_Mono'] text-[11px] bg-white/60 px-1 py-0.5 rounded">DEFAULT_ADMIN_ROLE</code> grants{' '}
                <code className="font-['IBM_Plex_Mono'] text-[11px] bg-white/60 px-1 py-0.5 rounded">ISSUER_ROLE</code> to approved university wallets.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1 text-[12px] font-medium">
                <button
                  type="button"
                  onClick={() => navigate('/developers')}
                  className="text-[#513582] hover:underline flex items-center gap-1"
                >
                  <span>Developer Integration Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/support')}
                  className="text-[#7053AD] hover:underline flex items-center gap-1"
                >
                  <span>Institution FAQ &amp; Support</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Institutional Workspace Capabilities Panel */}
          <div className="lg:col-span-6">
            <div
              className="w-full rounded-[28px] p-7 sm:p-8 flex flex-col gap-5"
              style={{
                background: 'rgba(255, 255, 255, 0.36)',
                border: '1px solid rgba(255, 255, 255, 0.78)',
                boxShadow: '0px 16px 36px rgba(81, 65, 109, 0.06), inset 0px 1px 2px rgba(255, 255, 255, 0.45)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
              }}
            >
              <div className="flex items-center justify-between border-b border-[rgba(125,101,154,0.16)] pb-4">
                <div>
                  <span className="font-['IBM_Plex_Mono'] text-[10px] uppercase tracking-wider text-[#7053AD] block mb-1">
                    RESTRICTED ISSUER SUITE
                  </span>
                  <h2 className="font-['Cormorant_Garamond'] text-[28px] font-semibold text-[#292333] leading-tight">
                    What Authorized Institutions Get
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-['IBM_Plex_Mono'] bg-[#513582]/10 text-[#513582] border border-[#513582]/20">
                  {isAuthorizedIssuer ? 'Unlocked' : 'Wallet Gated'}
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  {
                    icon: LayoutDashboard,
                    route: '/dashboard',
                    title: 'Registrar Dashboard',
                    desc: 'Monitor total issued credentials, active vs. revoked counts, institutional metrics, and quick credential revocation.'
                  },
                  {
                    icon: FileText,
                    route: '/issue',
                    title: 'Soulbound Credential Issuance',
                    desc: 'Draft degree certificates, pin credential JSON to IPFS, mint non-transferable ERC-721 tokens to student wallets, and export printable QR PDFs.'
                  },
                  {
                    icon: Clock,
                    route: '/history',
                    title: 'Verification Registry & Audit History',
                    desc: 'Search and filter every on-chain credential record, inspect IPFS hashes and transaction details, revoke compromised records, and export CSV reports.'
                  }
                ].map((item) => {
                  const Icon = item.icon;
                  const isRequested = normalizedPath === item.route;
                  return (
                    <div
                      key={item.route}
                      className={`p-4 rounded-2xl transition-all flex items-start gap-4 ${
                        isRequested
                          ? 'bg-white/70 border border-[#7053AD]/40 shadow-sm'
                          : 'bg-white/40 border border-white/70'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-[12px] bg-[#513582]/10 border border-[#513582]/15 flex items-center justify-center shrink-0 text-[#513582]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-[14px] text-[#292333]">{item.title}</h3>
                          <code className="font-['IBM_Plex_Mono'] text-[10px] text-[#7053AD] bg-white/70 px-2 py-0.5 rounded-full border border-white/80">
                            {item.route}
                          </code>
                        </div>
                        <p className="text-[12.5px] leading-[1.55] text-[#5B5565]">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick note for students and employers */}
              <div className="pt-3 border-t border-[rgba(125,101,154,0.16)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px] text-[#5B5565]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Employers &amp; verifiers can validate degrees without a wallet.</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/public-verify')}
                  className="font-semibold text-[#513582] hover:underline whitespace-nowrap text-left"
                >
                  Open Public Verifier →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForInstitutions;
