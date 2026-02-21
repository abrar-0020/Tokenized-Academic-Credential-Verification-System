import { useWeb3 } from '../context/Web3Context';

const Navbar = () => {
  const { account, isIssuer, isAdmin, connectWallet, disconnectWallet, loading } = useWeb3();

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg sm:text-xl">🎓</span>
            </div>
            <div>
              <h1 className="text-sm sm:text-xl font-bold text-gray-800">
                Academic Credentials
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-500">Blockchain Verification</p>
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
          <div className="flex items-center space-x-1 sm:space-x-4">
            {account ? (
              <div className="flex items-center space-x-1 sm:space-x-3">
                {/* Role Badges */}
                <div className="hidden sm:flex space-x-2">
                  {isAdmin && (
                    <span className="badge badge-danger text-xs">
                      Admin
                    </span>
                  )}
                  {isIssuer && (
                    <span className="badge badge-info text-xs">
                      Issuer
                    </span>
                  )}
                </div>

                {/* Account Address */}
                <div className="bg-gray-100 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg">
                  <span className="text-xs sm:text-sm font-mono text-gray-700">
                    {formatAddress(account)}
                  </span>
                </div>

                {/* Disconnect Button */}
                <button
                  onClick={disconnectWallet}
                  className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium px-1 sm:px-0"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="btn-primary text-xs sm:text-base px-3 sm:px-4 py-1.5 sm:py-2"
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3 flex flex-wrap gap-3 sm:gap-4">
          <a href="/" className="text-gray-700 hover:text-primary-600 text-xs sm:text-sm font-medium">
            Home
          </a>
          {isIssuer && (
            <a href="/issue" className="text-gray-700 hover:text-primary-600 text-xs sm:text-sm font-medium">
              Issue
            </a>
          )}
          {account && (
            <a href="/dashboard" className="text-gray-700 hover:text-primary-600 text-xs sm:text-sm font-medium">
              Dashboard
            </a>
          )}
          <a href="/verify" className="text-gray-700 hover:text-primary-600 text-xs sm:text-sm font-medium">
            Verify
          </a>
          {/* Mobile Role Badges */}
          {account && (
            <div className="flex gap-2">
              {isAdmin && (
                <span className="badge badge-danger text-xs">
                  Admin
                </span>
              )}
              {isIssuer && (
                <span className="badge badge-info text-xs">
                  Issuer
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
