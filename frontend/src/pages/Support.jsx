import React, { useState } from 'react';
import SharedPillNav from '../components/SharedPillNav';
import { Search, ChevronDown, ChevronUp, ChevronRight, ExternalLink } from 'lucide-react';

/* ─────────────────────────────────────────────────────
   SUPPORT — Fast, Clear Help Center
   Layout: search-first, compact categories, FAQ accordion.
   No invented email addresses or response times.
   Contact info: links to GitHub issues only (verified).
───────────────────────────────────────────────────── */

const CATEGORIES = [
  {
    label: 'Getting started',
    articles: [
      'What is TokCred and how does it work?',
      'What wallet do I need to use TokCred?',
      'How do I connect MetaMask to this site?',
      'Does verification cost anything?',
    ],
  },
  {
    label: 'Verifying credentials',
    articles: [
      'How do I verify a credential?',
      'What does the verification result mean?',
      'Why does the credential show as invalid?',
      'I have a QR code — how do I use it?',
    ],
  },
  {
    label: 'For universities',
    articles: [
      'How does my institution get ISSUER_ROLE?',
      'What information is stored on-chain vs IPFS?',
      'Can a credential be revoked after issuance?',
      'What happens if a student loses their wallet?',
    ],
  },
  {
    label: 'Technical',
    articles: [
      'Which blockchain network is TokCred on?',
      'Where is the metadata stored?',
      'Can I integrate TokCred into our HR system?',
      'Where is the source code?',
    ],
  },
];

const FAQS = [
  {
    q: 'How do I verify a credential?',
    a: "Go to the Public Verifier page and enter the credential token ID or scan the QR code. Verification reads directly from the blockchain — no account or wallet is required. The result shows within two seconds.",
  },
  {
    q: 'What does "credential not found" mean?',
    a: "The token ID you entered does not exist on the contract. Double-check the ID from the credential holder. If you are sure the ID is correct, the credential may have been issued on a different network — TokCred is currently deployed on Sepolia testnet.",
  },
  {
    q: 'Can a credential be revoked?',
    a: "Yes. Issuing institutions retain the ability to revoke credentials. A revoked credential shows as invalid on the verifier. The revocation record is permanent and visible on-chain.",
  },
  {
    q: 'What happens if a student loses their private key?',
    a: "Soulbound Tokens are non-transferable by design — this protects their integrity. If access to the original wallet is lost, the student must contact their issuing institution to request a re-issuance to a new wallet address.",
  },
  {
    q: 'Does verification cost gas?',
    a: "No. Verification calls are read-only blockchain queries and do not require a transaction. They are completely free and do not require a connected wallet.",
  },
  {
    q: 'What is stored on the blockchain vs IPFS?',
    a: "The blockchain stores the credential ownership (which wallet address holds the credential), the issuing wallet, the IPFS metadata URI, the issuance timestamp, and the revocation status. Detailed credential information (degree name, field of study, etc.) is stored in IPFS metadata and referenced by the on-chain URI.",
  },
  {
    q: 'Is TokCred on mainnet?',
    a: "TokCred is currently deployed on Sepolia testnet. Mainnet deployment has not yet been announced. Credentials issued on Sepolia are for testing and development purposes.",
  },
  {
    q: 'Where can I report a bug or request a feature?',
    a: "Open an issue on the GitHub repository. See the link below.",
  },
];

const Support = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const filteredFaqs = searchQuery.trim()
    ? FAQS.filter(
        f =>
          f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : FAQS;

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
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search — try 'verify', 'revoke', 'wallet'…"
              className="w-full h-[52px] rounded-xl pl-12 pr-4 text-[15px] text-[#3C315B] placeholder:text-[#C4BDD8] outline-none transition-all duration-200"
              style={{
                background: '#F5F2FF',
                border: '1.5px solid #E2DFFE',
              }}
              onFocus={e => { e.target.style.borderColor = '#AB9FF2'; e.target.style.boxShadow = '0 0 0 3px rgba(171,159,242,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = '#E2DFFE'; e.target.style.boxShadow = 'none'; }}
            />
            {searchQuery && (
              <button
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
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-16 items-start">

          {/* ── Categories sidebar ──────────────────────────── */}
          <aside className="hidden lg:block">
            <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#9B93B4] mb-4">Categories</p>
            <nav className="flex flex-col gap-0.5">
              {CATEGORIES.map((cat, i) => (
                <div key={i} className="mb-4">
                  <p className="text-[12px] font-bold uppercase tracking-widest text-[#3C315B] mb-2 px-2">{cat.label}</p>
                  {cat.articles.map((article, j) => (
                    <a
                      key={j}
                      href="#"
                      className="group flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-[#6B6480] hover:text-[#7C3AED] hover:bg-[#F5F2FF] transition-all duration-150"
                    >
                      <ChevronRight className="w-3 h-3 flex-none opacity-0 group-hover:opacity-100 text-[#7C3AED] transition-opacity" />
                      {article}
                    </a>
                  ))}
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
                <span className="text-[13px] text-[#9B93B4]">{filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''}</span>
              )}
            </div>

            {filteredFaqs.length === 0 ? (
              <div className="text-center py-16 text-[#9B93B4]">
                <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="text-[15px] font-medium mb-1">No results found</p>
                <p className="text-[13px]">Try different keywords or browse the categories on the left.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredFaqs.map((faq, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border transition-all duration-200"
                    style={{ borderColor: openFaq === i ? '#AB9FF2' : '#E8E4F0' }}
                  >
                    <button
                      className="w-full flex items-center justify-between text-left px-6 py-5"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <span className="text-[15px] font-semibold text-[#1A1228] pr-4">{faq.q}</span>
                      {openFaq === i
                        ? <ChevronUp className="w-4 h-4 text-[#7C3AED] flex-none" />
                        : <ChevronDown className="w-4 h-4 text-[#C4BDD8] flex-none" />
                      }
                    </button>
                    {openFaq === i && (
                      <div className="px-6 pb-5 text-[14px] text-[#6B6480] leading-[1.75] border-t border-[#F0EDF8] pt-4">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* GitHub contact */}
            <div className="mt-10 p-6 bg-white rounded-xl border border-[#E8E4F0]">
              <h3 className="text-[15px] font-bold text-[#1A1228] mb-2">Didn't find what you were looking for?</h3>
              <p className="text-[13px] text-[#9B93B4] mb-4">
                Open an issue on the GitHub repository. Please include the credential ID or transaction hash if your question is about a specific credential.
              </p>
              <a
                href="https://github.com/abrar-0020/Tokenized-Academic-Credential-Verification-System/issues"
                target="_blank"
                rel="noreferrer"
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
