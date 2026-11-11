import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SharedPillNav from '../components/SharedPillNav';
import { Search, ChevronDown, ChevronUp, ChevronRight, ExternalLink } from 'lucide-react';

/* ─────────────────────────────────────────────────────
   SUPPORT — Fast, Clear Help Center
   Layout: search-first, compact categories, FAQ accordion.
   Every sidebar question maps 1-to-1 to a full answer.
   Contact info: links to GitHub issues only (verified).
───────────────────────────────────────────────────── */

const GITHUB_REPO_URL = 'https://github.com/abrar-0020/Tokenized-Academic-Credential-Verification-System';

const FAQS = [
  {
    id: 'issuer-role',
    category: 'For universities',
    q: 'How does my institution get ISSUER_ROLE?',
    a: "To mint credentials, your institution's Ethereum wallet must hold ISSUER_ROLE on the AcademicCredential smart contract (0xE8cb94E530Ee82c0EEbDB2FB092Bd32eDDD1dab1 on Sepolia). An account with DEFAULT_ADMIN_ROLE grants that permission on-chain via grantRole(ISSUER_ROLE, institutionWallet). Open a GitHub issue with your official university wallet address to request Sepolia issuer onboarding.",
    link: { label: 'View Institutional Guide', to: '/institutions' },
  },
  {
    id: 'hr-integration',
    category: 'Technical',
    q: 'Can I integrate TokCred into our HR system?',
    a: 'Yes. Verification requires no wallet, no MetaMask extension, and no paid API key. Your HR system or ATS can link directly to /public-verify?tokenId=<id> (or look up a TC-... Credential ID), or call read-only contract methods — verifyCredential(tokenId), isCredentialValid(tokenId), and ownerOf(tokenId) — over any Sepolia JSON-RPC endpoint using ethers.js.',
    link: { label: 'Read Developer Docs', to: '/developers' },
  },
  {
    id: 'source-code',
    category: 'Technical',
    q: 'Where is the source code?',
    a: 'TokCred is open source on GitHub at abrar-0020/Tokenized-Academic-Credential-Verification-System. The repository contains the Solidity Soulbound ERC-721 contract (contracts/AcademicCredential.sol), Hardhat scripts (scripts/), the React frontend (frontend/src/), and the server-side encryption/IPFS endpoints (api/).',
    link: { label: 'Open GitHub Repository', href: GITHUB_REPO_URL },
  },
  {
    id: 'what-is-tokcred',
    category: 'Getting started',
    q: 'What is TokCred and how does it work?',
    a: "TokCred issues academic diplomas and certificates as non-transferable ERC-721 Soulbound Tokens (SBTs) on Ethereum Sepolia. Accredited universities encrypt sensitive student fields with AES-256-GCM before pinning metadata to IPFS and minting a token bound to the graduate's wallet. Employers verify authenticity instantaneously on-chain.",
    link: { label: 'Explore Features', to: '/features' },
  },
  {
    id: 'what-wallet',
    category: 'Getting started',
    q: 'What wallet do I need to use TokCred?',
    a: 'Public verification needs no wallet at all — anyone can inspect a credential using a Token ID, Credential ID, or QR code. Institutions minting/revoking credentials and graduates unlocking encrypted v2 details need MetaMask (browser extension on desktop or MetaMask Mobile in-app browser) connected to Sepolia.',
    link: { label: 'Download MetaMask', href: 'https://metamask.io/download/' },
  },
  {
    id: 'connect-metamask',
    category: 'Getting started',
    q: 'How do I connect MetaMask to this site?',
    a: 'Install the MetaMask browser extension, unlock your wallet, switch to the Sepolia test network, and click Connect Wallet in the top bar. If MetaMask is not installed in your browser, clicking Connect Wallet updates the button to "MetaMask not found — install MetaMask" with a direct installation link.',
  },
  {
    id: 'verification-cost',
    category: 'Getting started',
    q: 'Does verification cost anything?',
    a: 'No. Verification queries read-only blockchain state (verifyCredential, isCredentialValid, ownerOf) and metadata gateways. It costs zero gas, triggers no wallet signature, and works without an account.',
  },
  {
    id: 'how-to-verify',
    category: 'Verifying credentials',
    q: 'How do I verify a credential?',
    a: 'Open Public Verify (/public-verify) and enter either a numeric Token ID (such as 4) or a unique Credential ID (such as TC-TOKEN-2), or open a certificate QR link. The verifier queries Sepolia on-chain state live and reports validity immediately.',
    link: { label: 'Go to Public Verify', to: '/public-verify' },
  },
  {
    id: 'verification-result',
    category: 'Verifying credentials',
    q: 'What does the verification result mean?',
    a: 'A Valid result confirms three on-chain checks simultaneously: the token exists on AcademicCredential, it has not been revoked (isRevoked == false), and it remains Soulbound to the graduate wallet returned by ownerOf(tokenId). On v2 encrypted tokens, public fields verify authenticity while authorized holders or issuers can unlock full PII fields.',
  },
  {
    id: 'invalid-credential',
    category: 'Verifying credentials',
    q: 'Why does the credential show as invalid?',
    a: 'A credential appears Revoked if the issuing university called revokeCredential(tokenId) on-chain, or Not Found if the Token ID / TC-... Credential ID does not exist on Sepolia contract 0xE8cb94E530Ee82c0EEbDB2FB092Bd32eDDD1dab1.',
  },
  {
    id: 'qr-code',
    category: 'Verifying credentials',
    q: 'I have a QR code — how do I use it?',
    a: 'Scan the QR code printed on the TokCred PDF certificate using your phone camera or QR scanner app. It opens /public-verify?tokenId=<id> directly and automatically checks the credential on-chain with no wallet required.',
  },
  {
    id: 'onchain-vs-ipfs',
    category: 'For universities',
    q: 'What information is stored on-chain vs IPFS?',
    a: 'The Sepolia smart contract stores only Token ID, Soulbound student address, issuing institution address, issuance timestamp, revocation boolean, and ipfs:// metadata pointer — zero plaintext grades or student names on-chain. Full credential attributes live in JSON pinned to IPFS, encrypted with AES-256-GCM on v2 credentials.',
  },
  {
    id: 'revoke-credential',
    category: 'For universities',
    q: 'Can a credential be revoked after issuance?',
    a: 'Yes. The authorized issuing institution (or contract admin) can call revokeCredential(tokenId) on-chain. Revocation is permanent, transparent on Sepolia, and immediately updates Public Verify status to Revoked.',
  },
  {
    id: 'lost-wallet',
    category: 'For universities',
    q: 'What happens if a student loses their wallet?',
    a: 'Because TokCred credentials are non-transferable Soulbound Tokens, they cannot be moved between wallets. If a graduate loses access to their wallet, they should verify their identity with their university off-chain so the university can revoke the old token and mint a replacement to their new wallet.',
  },
  {
    id: 'which-network',
    category: 'Technical',
    q: 'Which blockchain network is TokCred on?',
    a: 'TokCred runs on Ethereum Sepolia testnet (chain ID 11155111) with AcademicCredential deployed at 0xE8cb94E530Ee82c0EEbDB2FB092Bd32eDDD1dab1.',
  },
  {
    id: 'metadata-storage',
    category: 'Technical',
    q: 'Where is the metadata stored?',
    a: 'Credential metadata JSON is pinned to IPFS via /api/pinata (Pinata). Before pinning, v2 credentials encrypt student PII server-side with AES-256-GCM via /api/credential-crypto so raw IPFS files do not expose plaintext student records.',
  },
];

const CATEGORY_ORDER = [
  'Getting started',
  'Verifying credentials',
  'For universities',
  'Technical',
];

const CATEGORIES = CATEGORY_ORDER.map((label) => ({
  label,
  articles: FAQS.filter((faq) => faq.category === label),
}));

const Support = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const filteredFaqs = searchQuery.trim()
    ? FAQS.filter(
        (f) =>
          f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : FAQS;

  const handleSelectArticle = (faqId) => {
    setSearchQuery('');
    setOpenFaq(faqId);
    window.requestAnimationFrame(() => {
      const target = document.getElementById(`faq-${faqId}`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SharedPillNav variant="light" />

      {/* ── Search header ──────────────────────────────────── */}
      <section className="bg-white border-b border-[#E8E4F0] pt-[148px] pb-14">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-16">
          <h1 className="text-[40px] md:text-[52px] font-bold text-[#1A1228] tracking-tight mb-2">
            How can we help?
          </h1>
          <p className="text-[16px] text-[#9B93B4] mb-8">
            Search the documentation or browse by category below.
          </p>

          {/* Search input */}
          <div className="relative max-w-[580px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C4BDD8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search — try 'ISSUER_ROLE', 'HR', 'verify', 'wallet'…"
              className="w-full h-[52px] rounded-[14px] pl-12 pr-4 text-[15px] text-[#3C315B] placeholder:text-[#C4BDD8] outline-none transition-all duration-200"
              style={{
                background: '#F5F2FF',
                border: '1.5px solid #E2DFFE',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#AB9FF2';
                e.target.style.boxShadow = '0 0 0 3px rgba(171,159,242,0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E2DFFE';
                e.target.style.boxShadow = 'none';
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B93B4] text-[12px] hover:text-[#7C3AED] transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-16 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[270px_1fr] gap-16 items-start">

          {/* ── Categories sidebar ──────────────────────────── */}
          <aside className="hidden lg:block sticky top-[110px]">
            <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#9B93B4] mb-4">Categories</p>
            <nav className="flex flex-col gap-0.5" aria-label="Support question categories">
              {CATEGORIES.map((cat) => (
                <div key={cat.label} className="mb-4">
                  <p className="text-[12px] font-bold uppercase tracking-widest text-[#3C315B] mb-2 px-2">{cat.label}</p>
                  {cat.articles.map((article) => {
                    const isActive = openFaq === article.id;
                    return (
                      <button
                        key={article.id}
                        type="button"
                        onClick={() => handleSelectArticle(article.id)}
                        className={`w-full text-left group flex items-start gap-2 px-3 py-2 rounded-[10px] text-[13px] transition-all duration-150 ${
                          isActive
                            ? 'text-[#7C3AED] bg-[#F5F2FF] font-semibold'
                            : 'text-[#6B6480] hover:text-[#7C3AED] hover:bg-[#F5F2FF]'
                        }`}
                      >
                        <ChevronRight
                          className={`w-3 h-3 mt-1 flex-none text-[#7C3AED] transition-opacity ${
                            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                        />
                        <span>{article.q}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>
          </aside>

          {/* ── FAQ / search results ────────────────────────── */}
          <main>
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="text-[17px] font-bold text-[#1A1228]">
                {searchQuery ? `Results for "${searchQuery}"` : 'Frequently asked questions'}
              </h2>
              {searchQuery && (
                <span className="text-[13px] text-[#9B93B4]">
                  {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {filteredFaqs.length === 0 ? (
              <div className="text-center py-16 text-[#9B93B4]">
                <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="text-[15px] font-medium mb-1">No results found</p>
                <p className="text-[13px]">Try different keywords or browse the categories on the left.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {filteredFaqs.map((faq) => {
                  const isOpen = openFaq === faq.id;
                  return (
                    <div
                      key={faq.id}
                      id={`faq-${faq.id}`}
                      className="bg-white rounded-[14px] border transition-all duration-200 scroll-mt-28"
                      style={{ borderColor: isOpen ? '#AB9FF2' : '#E8E4F0' }}
                    >
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        className="w-full flex items-center justify-between text-left px-6 py-5"
                        onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                      >
                        <span className="text-[15px] font-semibold text-[#1A1228] pr-4">{faq.q}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-[#7C3AED] flex-none" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#C4BDD8] flex-none" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-5 text-[14px] text-[#6B6480] leading-[1.75] border-t border-[#F0EDF8] pt-4">
                          <p>{faq.a}</p>
                          {faq.link && (
                            <div className="mt-3">
                              {faq.link.to ? (
                                <Link
                                  to={faq.link.to}
                                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#7C3AED] hover:underline"
                                >
                                  {faq.link.label}
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                              ) : (
                                <a
                                  href={faq.link.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#7C3AED] hover:underline"
                                >
                                  {faq.link.label}
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* GitHub contact */}
            <div className="mt-10 p-6 bg-white rounded-[14px] border border-[#E8E4F0]">
              <h3 className="text-[15px] font-bold text-[#1A1228] mb-2">Didn&apos;t find what you were looking for?</h3>
              <p className="text-[13px] text-[#9B93B4] mb-4">
                Open an issue on the GitHub repository. Please include the credential ID or transaction hash if your question is about a specific credential.
              </p>
              <a
                href={`${GITHUB_REPO_URL}/issues`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A1228] text-white text-[13px] font-semibold rounded-full hover:bg-[#2D1F4E] transition-colors"
              >
                Open a GitHub issue <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
};

export default Support;
