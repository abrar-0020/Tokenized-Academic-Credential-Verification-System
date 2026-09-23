const Footer = () => {
  return (
    <footer className="w-full bg-[#0e0e0e] border-t border-[#1f2020] text-[#acabaa] py-12 md:py-16 mt-auto font-body relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#1f2020] border border-[#8197ff]/20 flex items-center justify-center">
                <span className="text-[#8197ff] font-headline font-bold text-lg leading-none">SL</span>
              </div>
              <span className="font-headline font-bold text-[#c6c6c7] text-lg tracking-tight">The Scholar Ledger</span>
            </div>
            <p className="text-sm leading-relaxed">
              Decentralized infrastructure for academic credential issuance and verification using Soulbound NFTs.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <span className="text-xs font-mono text-emerald-500 uppercase tracking-wider">Sepolia Network Active</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-headline text-[#e7e5e4] font-bold tracking-wider uppercase text-sm mb-5">Platform</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="/" className="hover:text-[#8197ff] transition-colors">Home</a></li>
              <li><a href="/public-verify" className="hover:text-[#8197ff] transition-colors">Public Verification</a></li>
              <li><a href="/dashboard" className="hover:text-[#8197ff] transition-colors">Dashboard</a></li>
              <li><a href="/issue" className="hover:text-[#8197ff] transition-colors">Issue Credential</a></li>
              <li><a href="/history" className="hover:text-[#8197ff] transition-colors">Transaction History</a></li>
            </ul>
          </div>

          {/* Technology */}
          <div>
            <h3 className="font-headline text-[#e7e5e4] font-bold tracking-wider uppercase text-sm mb-5">Technology</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8197ff] text-[16px]">link</span>
                <a href="https://sepolia.etherscan.io/address/0xE8cb94E530Ee82c0EEbDB2FB092Bd32eDDD1dab1" target="_blank" rel="noreferrer" className="hover:text-[#8197ff] transition-colors truncate max-w-[200px]">Contract on Etherscan</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8197ff] text-[16px]">storage</span>
                <span>IPFS Decentralized Storage</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8197ff] text-[16px]">token</span>
                <span>ERC-721 Soulbound Standard</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8197ff] text-[16px]">lock</span>
                <span>Immutable Proofs</span>
              </li>
            </ul>
          </div>

          {/* Contact & Partnerships */}
          <div>
            <h3 className="font-headline text-[#e7e5e4] font-bold tracking-wider uppercase text-sm mb-5">Contact & Support</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#8197ff] text-[16px] mt-0.5">code</span>
                <div className="flex flex-col">
                  <a href="https://github.com/abrar-0020/Tokenized-Academic-Credential-Verification-System" target="_blank" rel="noreferrer" className="hover:text-[#8197ff] transition-colors">GitHub Repository</a>
                  <span className="text-xs text-[#acabaa]/70 mt-1">Open source contracts & dApp</span>
                </div>
              </li>
              <li className="flex items-start gap-2 pt-2">
                <span className="material-symbols-outlined text-[#8197ff] text-[16px] mt-0.5">mail</span>
                <div className="flex flex-col">
                  <a href="mailto:space.pikkle@gmail.com" className="hover:text-[#8197ff] transition-colors font-medium text-[#e7e5e4]">space.pikkle@gmail.com</a>
                  <span className="text-xs text-[#acabaa]/70 mt-1">For institutional inquiries</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-[#1f2020] flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} The Scholar Ledger. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-[#8197ff] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#8197ff] transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
