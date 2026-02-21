import { useWeb3 } from '../context/Web3Context';

const Navbar = () => {
  const { account, isIssuer, isAdmin, connectWallet, disconnectWallet, loading } = useWeb3();

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <nav className="bg-white shadow-lg w-full overflow-x-hidden">
      <div className="container mx-auto px-3 sm:px-4 max-w-full">
        <div className="flex justify-between items-center py-3 sm:py-4 gap-2">
          {/* Logo */}
          <div className="flex items-center space-x-2 min-w-0 flex-shrink">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg sm:text-xl">🎓</span>
            </div>
            <div className="min-w-0 flex-shrink">
              <h1 className="text-sm sm:text-xl font-bold text-gray-800 truncate">
                Academic Credentials
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-500 truncate">Blockchain Verification</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="/" className="text-gray-700 hover:text-primary-600 font-medium transition">
              Home
            </a>
            {isIssuer && (
              <a href="/issue" className="text-gray-700 hover:text-primary-600 font-medium transition">
                Issue Credential
              </a>
            )}
            {account && (
              <a href="/dashboard" className="text-gray-700 hover:text-primary-600 font-medium transition">
                Dashboard
              </a>
            )}
            <a href="/verify" className="text-gray-700 hover:text-primary-600 font-medium transition">
              Verify
            </a>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {account ? (
              <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                {/* Role Badges */}
                <div className="hidden sm:flex space-x-2 flex-shrink-0">
                  {isAdmin && (
                    <span className="badge badge-danger text-xs whitespace-nowrap">
                      Admin
                    </span>
                  )}
                  {isIssuer && (
                    <span className="badge badge-info text-xs whitespace-nowrap">
                      Issuer
                    </span>
                  )}
                </div>

                {/* Account Address */}
                <div className="bg-gray-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg max-w-[100px] sm:max-w-none overflow-hidden">
                  <span className="text-xs sm:text-sm font-mono text-gray-700 truncate block">
                    {formatAddress(account)}
                  </span>
                </div>

                {/* Disconnect Button */}
                <button
                  onClick={disconnectWallet}
                  className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium px-1 sm:px-2 whitespace-nowrap flex-shrink-0"
                >
                  <span className="hidden sm:inline">Disconnect</span>
                  <span className="sm:hidden">✕</span>
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="btn-primary text-xs sm:text-base px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap"
              >
                {loading ? 'Connecting...' : 'Connect'}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3 flex flex-wrap gap-2 overflow-x-hidden w-full items-center">
          <a href="/" className="text-gray-700 hover:text-primary-600 text-xs font-medium whitespace-nowrap">
            Home
          </a>
          {isIssuer && (
            <a href="/issue" className="text-gray-700 hover:text-primary-600 text-xs font-medium whitespace-nowrap">
              Issue
            </a>
          )}
          {account && (
            <a href="/dashboard" className="text-gray-700 hover:text-primary-600 text-xs font-medium whitespace-nowrap">
              Dashboard
            </a>
          )}
          <a href="/verify" className="text-gray-700 hover:text-primary-600 text-xs font-medium whitespace-nowrap">
            Verify
          </a>
          
          {/* Mobile Role Badges & Disconnect */}
          {account && (
            <>
              {isAdmin && (
                <span className="badge badge-danger text-xs whitespace-nowrap">
                  Admin
                </span>
              )}
              {isIssuer && (
                <span className="badge badge-info text-xs whitespace-nowrap">
                  Issuer
                </span>
              )}
              {/* Disconnect Button - Mobile only */}
              <button
                onClick={disconnectWallet}
                className="text-xs text-white bg-red-600 hover:bg-red-700 font-medium px-3 py-1 rounded whitespace-nowrap"
              >
                Disconnect
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
