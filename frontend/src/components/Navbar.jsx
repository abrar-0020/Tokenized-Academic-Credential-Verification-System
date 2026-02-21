import { useWeb3 } from '../context/Web3Context';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { account, isIssuer, isAdmin, connectWallet, disconnectWallet, loading } = useWeb3();
  const { isDark, toggleTheme } = useTheme();

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <nav style={{ overflowX: 'hidden', position: 'relative' }} className="bg-white border-b border-slate-200 w-full sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6" style={{ overflowX: 'hidden' }}>
        {/* Main Row */}
        <div className="flex justify-between items-center h-14 sm:h-16 gap-2" style={{ overflowX: 'hidden' }}>
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0 no-underline">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 sm:w-5 sm:h-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3L2 8l10 5 10-5-10-5z" fill="white"/>
                <path d="M2 8v6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M6 10.5v4c0 1.657 2.686 3 6 3s6-1.343 6-3v-4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="hidden sm:block">
              <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">TokCred</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <a href="/" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
              Home
            </a>
            {account && (
              <a href="/dashboard" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                Dashboard
              </a>
            )}
            {isIssuer && (
              <a href="/issue" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                Issue
              </a>
            )}
            <a href="/verify" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
              Verify
            </a>
            <a href="/public-verify" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
              Public Verify
            </a>
          </div>

          {/* Wallet Section */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-primary-600 hover:border-primary-300 transition-all bg-white text-base"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            {account ? (
              <div className="flex items-center gap-2">
                {/* Role Badges - Desktop only */}
                <div className="hidden sm:flex items-center gap-1.5">
                  {isAdmin && <span className="badge badge-danger">Admin</span>}
                  {isIssuer && <span className="badge badge-info">Issuer</span>}
                </div>
                {/* Address Chip */}
                <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                  <span className="text-xs font-mono text-slate-700 font-medium">{formatAddress(account)}</span>
                </div>
                {/* Disconnect - Desktop */}
                <button
                  onClick={disconnectWallet}
                  className="hidden md:block text-xs font-semibold text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-xl transition-all bg-white"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="btn-primary text-sm px-4 py-2"
                style={{ minHeight: '36px' }}
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden pb-2.5 flex flex-col gap-1.5" style={{ overflowX: 'hidden', width: '100%' }}>
          {/* Nav links */}
          <div className="flex items-center gap-4">
            <a href="/" className="text-xs font-medium text-slate-600 hover:text-primary-600 whitespace-nowrap">Home</a>
            {account && (
              <a href="/dashboard" className="text-xs font-medium text-slate-600 hover:text-primary-600 whitespace-nowrap">Dashboard</a>
            )}
            {isIssuer && (
              <a href="/issue" className="text-xs font-medium text-slate-600 hover:text-primary-600 whitespace-nowrap">Issue</a>
            )}
            <a href="/verify" className="text-xs font-medium text-slate-600 hover:text-primary-600 whitespace-nowrap">Verify</a>
            <a href="/public-verify" className="text-xs font-medium text-slate-600 hover:text-primary-600 whitespace-nowrap">Public</a>
            <button onClick={toggleTheme} className="text-base leading-none" title="Toggle theme">{isDark ? '☀️' : '🌙'}</button>
          </div>

          {/* Wallet row */}
          {account && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-lg">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0"></div>
                <span className="text-xs font-mono text-slate-600">{formatAddress(account)}</span>
              </div>
              {isAdmin && <span className="badge badge-danger">Admin</span>}
              {isIssuer && <span className="badge badge-info">Issuer</span>}
              <button
                onClick={disconnectWallet}
                className="text-xs font-semibold text-red-600 whitespace-nowrap"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
