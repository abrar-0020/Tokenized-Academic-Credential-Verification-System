const Footer = () => {
  return (
    <footer style={{ overflowX: 'hidden', position: 'relative' }} className="bg-slate-900 text-white py-10 sm:py-12 mt-auto w-full">
      <div className="w-full px-5 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🎓</span>
              </div>
              <span className="font-bold text-white">TokCred</span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Secure blockchain-based academic credential verification system using
              non-transferable NFTs (Soulbound tokens).
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="text-slate-400 hover:text-white transition-colors">Home</a></li>
              <li><a href="/verify" className="text-slate-400 hover:text-white transition-colors">Verify Credential</a></li>
              <li><a href="/dashboard" className="text-slate-400 hover:text-white transition-colors">Dashboard</a></li>
            </ul>
          </div>

          {/* Technology */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Technology</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li className="flex items-center gap-2"><span className="text-emerald-500">&#10003;</span> Ethereum Blockchain</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500">&#10003;</span> ERC-721 Standard</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500">&#10003;</span> IPFS Storage</li>
              <li className="flex items-center gap-2"><span className="text-emerald-500">&#10003;</span> Smart Contracts</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} TokCred. Built with Solidity & React.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
