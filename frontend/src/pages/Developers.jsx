import React, { useState } from 'react';
import SharedPillNav from '../components/SharedPillNav';
import { Copy, Check, ExternalLink, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';

/* ─────────────────────────────────────────────────────
   DEVELOPER — Practical Technical Portal
   Layout: sidebar navigation + main content area.
   All code examples reflect the actual deployed contract
   (src/config/contract.js + src/logic.js).
   No fabricated SDK — uses ethers.js directly.
───────────────────────────────────────────────────── */

const CONTRACT_ADDRESS_SEPOLIA = '0xE8cb94E530Ee82c0EEbDB2FB092Bd32eDDD1dab1';
const NETWORK = 'Sepolia (chainId 11155111)';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'prerequisites', label: 'Prerequisites' },
  { id: 'verify', label: 'Verify a credential' },
  { id: 'issue', label: 'Issue a credential' },
  { id: 'revoke', label: 'Revoke a credential' },
  { id: 'abi', label: 'Contract ABI reference' },
  { id: 'networks', label: 'Networks & addresses' },
];

const VERIFY_CODE = `import { ethers } from 'ethers';

const CONTRACT_ADDRESS = '${CONTRACT_ADDRESS_SEPOLIA}';

// Minimal ABI — only the functions needed for verification
const ABI = [
  "function verifyCredential(uint256 tokenId) public view returns (tuple(uint256 tokenId, address student, string metadataURI, uint256 issueTimestamp, bool revoked))",
  "function isCredentialValid(uint256 tokenId) public view returns (bool)",
];

async function verifyCredential(tokenId) {
  // Read-only — no wallet needed
  const provider = new ethers.JsonRpcProvider(
    'https://sepolia.infura.io/v3/YOUR_INFURA_KEY'
  );

  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

  const [isValid, credential] = await Promise.all([
    contract.isCredentialValid(tokenId),
    contract.verifyCredential(tokenId),
  ]);

  return {
    isValid,
    tokenId:       credential.tokenId.toString(),
    student:       credential.student,       // wallet address
    metadataURI:   credential.metadataURI,  // ipfs://...
    issuedAt:      new Date(Number(credential.issueTimestamp) * 1000),
    revoked:       credential.revoked,
  };
}`;

const ISSUE_CODE = `// Requires ISSUER_ROLE on the deployed contract.
// The connected wallet must be an authorized issuer.
const ABI_ISSUE = [
  "function issueCredential(address student, string memory metadataURI) public returns (uint256)",
  "function ISSUER_ROLE() public view returns (bytes32)",
  "function hasRole(bytes32 role, address account) public view returns (bool)",
];

async function issueCredential(studentAddress, ipfsMetadataURI) {
  // Requires a signer (wallet connection)
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer   = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI_ISSUE, signer);

  // Confirm the signer has issuer rights before attempting
  const issuerRole    = await contract.ISSUER_ROLE();
  const signerAddress = await signer.getAddress();
  const hasRole       = await contract.hasRole(issuerRole, signerAddress);

  if (!hasRole) {
    throw new Error('Connected wallet does not have ISSUER_ROLE');
  }

  const tx = await contract.issueCredential(studentAddress, ipfsMetadataURI);
  const receipt = await tx.wait();

  // The tokenId is emitted in the CredentialIssued event
  const event = receipt.logs
    .map(log => { try { return contract.interface.parseLog(log); } catch { return null; } })
    .find(e => e?.name === 'CredentialIssued');

  return { transactionHash: receipt.hash, tokenId: event?.args.tokenId.toString() };
}`;

const ABI_ROWS = [
  { fn: 'verifyCredential(uint256)', returns: 'CredentialData tuple', note: 'Public read — no wallet' },
  { fn: 'isCredentialValid(uint256)', returns: 'bool', note: 'Public read — no wallet' },
  { fn: 'getStudentCredentials(address)', returns: 'uint256[]', note: 'Public read — no wallet' },
  { fn: 'issueCredential(address, string)', returns: 'uint256 tokenId', note: 'Requires ISSUER_ROLE' },
  { fn: 'revokeCredential(uint256)', returns: 'void', note: 'Requires ISSUER_ROLE' },
  { fn: 'grantRole(bytes32, address)', returns: 'void', note: 'Requires DEFAULT_ADMIN_ROLE' },
  { fn: 'getTotalCredentials()', returns: 'uint256', note: 'Public read — no wallet' },
];

function CodeBlock({ code, label }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-[#2D2A3E] mb-6">
      <div className="flex items-center justify-between px-4 py-3 bg-[#1A1728] border-b border-[#2D2A3E]">
        <span className="font-mono text-[12px] text-[#9B93B4]">{label}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200"
          style={{
            color: copied ? '#34D978' : '#9B93B4',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre
        className="p-5 overflow-x-auto text-[13px] leading-[1.75] text-[#C8C2DC] bg-[#0F0E1A]"
        style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace" }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

const Developers = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedABI, setExpandedABI] = useState(false);

  return (
    <div
      className="min-h-screen bg-[#0F0E1A] text-[#C8C2DC]"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <SharedPillNav variant="dark" />

      <div className="max-w-[1200px] mx-auto px-6 lg:px-0 pt-[96px] flex">

        {/* ── Sidebar ──────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-[220px] flex-none pt-12 pr-8 sticky top-[96px] h-[calc(100vh-96px)] overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#6B6480] mb-4 px-2">
            On this page
          </p>
          <nav className="flex flex-col gap-0.5">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveSection(s.id);
                  document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="text-left px-3 py-2 rounded-lg text-[13px] transition-all duration-150"
                style={{
                  color: activeSection === s.id ? '#AB9FF2' : '#6B6480',
                  background: activeSection === s.id ? 'rgba(171,159,242,0.08)' : 'transparent',
                  fontWeight: activeSection === s.id ? 600 : 400,
                }}
              >
                {s.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pb-8 px-2">
            <a
              href="https://github.com/abrar-0020/Tokenized-Academic-Credential-Verification-System"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-[13px] text-[#6B6480] hover:text-[#AB9FF2] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> GitHub repo
            </a>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-0 lg:px-12 lg:border-l border-[#2D2A3E] pt-12 pb-32">

          {/* Overview */}
          <section id="overview" className="mb-16 scroll-mt-24">
            <p className="text-[11px] font-bold tracking-[3px] uppercase text-[#AB9FF2] mb-4">Developer docs</p>
            <h1 className="text-[36px] md:text-[44px] font-bold text-white leading-[1.1] mb-5">
              TokCred Integration Guide
            </h1>
            <p className="text-[16px] text-[#9B93B4] leading-[1.7] max-w-[640px] mb-8">
              TokCred is a smart contract deployed on Ethereum. This guide shows how to interact with it directly using <strong className="text-[#C8C2DC]">ethers.js v6</strong>. There is no proprietary SDK — all integrations use standard Web3 libraries against the deployed contract ABI.
            </p>
            <div className="flex items-start gap-3 p-4 bg-amber-500/8 border border-amber-500/20 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-none mt-0.5" />
              <p className="text-[13px] text-[#9B93B4] leading-[1.6]">
                The contract is deployed on <strong className="text-white">Sepolia testnet</strong> for development. Production mainnet deployment is not yet available.
              </p>
            </div>
          </section>

          {/* Prerequisites */}
          <section id="prerequisites" className="mb-16 scroll-mt-24">
            <h2 className="text-[22px] font-bold text-white mb-4 pb-3 border-b border-[#2D2A3E]">Prerequisites</h2>
            <ul className="flex flex-col gap-3 mb-6">
              {[
                'Node.js 18 or later',
                'ethers.js v6 — npm install ethers',
                'A Sepolia RPC endpoint (Infura, Alchemy, or public)',
                'A browser wallet (MetaMask) for write operations',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-[14px] text-[#9B93B4]">
                  <ChevronRight className="w-4 h-4 text-[#AB9FF2] flex-none" />
                  {item}
                </li>
              ))}
            </ul>
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-lg w-fit"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'monospace' }}
            >
              <span className="text-[#AB9FF2] text-[13px]">$</span>
              <span className="text-[#C8C2DC] text-[13px]">npm install ethers</span>
            </div>
          </section>

          {/* Verify */}
          <section id="verify" className="mb-16 scroll-mt-24">
            <h2 className="text-[22px] font-bold text-white mb-2 pb-3 border-b border-[#2D2A3E]">Verify a credential</h2>
            <p className="text-[14px] text-[#9B93B4] leading-[1.7] mb-6">
              Verification is a read-only operation. No wallet connection is required. The result is returned directly from the blockchain.
            </p>
            <CodeBlock code={VERIFY_CODE} label="verify-credential.js" />
            <div className="bg-[#1A1728] rounded-xl p-5 border border-[#2D2A3E]">
              <p className="text-[12px] font-bold uppercase tracking-widest text-[#6B6480] mb-3">Return shape</p>
              {[
                ['isValid', 'boolean', 'false if revoked or not found'],
                ['tokenId', 'string', 'The credential token ID'],
                ['student', 'string', 'Student wallet address'],
                ['metadataURI', 'string', 'IPFS URI of credential metadata'],
                ['issuedAt', 'Date', 'JavaScript Date object'],
                ['revoked', 'boolean', 'true if issuer has revoked it'],
              ].map(([field, type, note], i) => (
                <div key={i} className="grid grid-cols-[120px_80px_1fr] gap-4 py-2 border-b border-[#2D2A3E] last:border-0 text-[13px]">
                  <span className="font-mono text-[#AB9FF2]">{field}</span>
                  <span className="text-[#6B6480]">{type}</span>
                  <span className="text-[#9B93B4]">{note}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Issue */}
          <section id="issue" className="mb-16 scroll-mt-24">
            <h2 className="text-[22px] font-bold text-white mb-2 pb-3 border-b border-[#2D2A3E]">Issue a credential</h2>
            <p className="text-[14px] text-[#9B93B4] leading-[1.7] mb-6">
              Requires the connected wallet to hold <code className="text-[#AB9FF2]">ISSUER_ROLE</code> on the contract. Role assignment is managed by the contract owner (DEFAULT_ADMIN_ROLE).
            </p>
            <CodeBlock code={ISSUE_CODE} label="issue-credential.js" />
          </section>

          {/* Revoke */}
          <section id="revoke" className="mb-16 scroll-mt-24">
            <h2 className="text-[22px] font-bold text-white mb-2 pb-3 border-b border-[#2D2A3E]">Revoke a credential</h2>
            <p className="text-[14px] text-[#9B93B4] leading-[1.7] mb-4">
              Only the original issuing wallet (with ISSUER_ROLE) may revoke. Revocation sets <code className="text-[#AB9FF2]">revoked = true</code> on the credential. The token remains on-chain but <code className="text-[#AB9FF2]">isCredentialValid</code> returns <code className="text-[#AB9FF2]">false</code>.
            </p>
            <CodeBlock
              label="revoke-credential.js"
              code={`const ABI_REVOKE = [
  "function revokeCredential(uint256 tokenId) public",
];

async function revokeCredential(tokenId) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer   = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI_REVOKE, signer);

  const tx = await contract.revokeCredential(tokenId);
  await tx.wait();
  return tx.hash;
}`}
            />
          </section>

          {/* ABI reference */}
          <section id="abi" className="mb-16 scroll-mt-24">
            <h2 className="text-[22px] font-bold text-white mb-2 pb-3 border-b border-[#2D2A3E]">Contract ABI reference</h2>
            <div className="overflow-x-auto rounded-xl border border-[#2D2A3E]">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-[#1A1728] border-b border-[#2D2A3E]">
                    {['Function signature', 'Returns', 'Access'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-[#6B6480]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-[#0F0E1A] divide-y divide-[#2D2A3E]">
                  {ABI_ROWS.map((row, i) => (
                    <tr key={i} className="hover:bg-[#1A1728] transition-colors">
                      <td className="px-5 py-3 font-mono text-[#AB9FF2]">{row.fn}</td>
                      <td className="px-5 py-3 font-mono text-[#9B93B4]">{row.returns}</td>
                      <td className="px-5 py-3 text-[#6B6480]">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Networks */}
          <section id="networks" className="scroll-mt-24">
            <h2 className="text-[22px] font-bold text-white mb-2 pb-3 border-b border-[#2D2A3E]">Networks & addresses</h2>
            <div className="flex flex-col gap-3">
              {[
                { network: 'Sepolia testnet', chainId: '11155111', address: CONTRACT_ADDRESS_SEPOLIA, status: 'Active' },
                { network: 'Localhost (Hardhat)', chainId: '31337', address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', status: 'Dev only' },
              ].map((row, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#1A1728] rounded-xl border border-[#2D2A3E] gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[14px] font-semibold text-white">{row.network}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#AB9FF2]/10 text-[#AB9FF2] font-semibold">{row.status}</span>
                    </div>
                    <span className="font-mono text-[12px] text-[#9B93B4]">Chain {row.chainId}</span>
                  </div>
                  <code className="font-mono text-[12px] text-[#AB9FF2] break-all">{row.address}</code>
                </div>
              ))}
            </div>
          </section>

        </main>
      </div>
    </div>
  );
};

export default Developers;
