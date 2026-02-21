import { useWeb3 } from '../context/Web3Context';

const Home = () => {
  const { account, connectWallet, isMetaMaskInstalled } = useWeb3();

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-10 sm:py-16 md:py-20 w-full max-w-[100vw] overflow-x-hidden">
        <div className="w-full max-w-[100vw] px-3 sm:px-4 overflow-x-hidden">
          <div className="max-w-3xl mx-auto text-center overflow-x-hidden">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 break-words px-2">
              Tokenized Academic Credentials
            </h1>
            <p className="text-sm sm:text-base mb-6 sm:mb-8 text-primary-100 break-words px-2">
              Secure, verifiable, and permanent academic credentials on the blockchain
            </p>
            {!account ? (
              <button
                onClick={connectWallet}
                className="bg-white text-primary-600 px-3 sm:px-4 py-2.5 rounded-lg font-semibold text-sm sm:text-base hover:bg-gray-100 transition max-w-[85vw] mx-auto block"
              >
                <span className="hidden sm:inline">{isMetaMaskInstalled() ? 'Connect Wallet to Get Started' : 'Install MetaMask'}</span>
                <span className="sm:hidden">{isMetaMaskInstalled() ? 'Connect Wallet' : 'Install MetaMask'}</span>
              </button>
            ) : (
              <a
                href="/dashboard"
                className="bg-white text-primary-600 px-3 sm:px-4 py-2.5 rounded-lg font-semibold text-sm sm:text-base hover:bg-gray-100 transition inline-block max-w-[85vw] mx-auto"
              >
                Go to Dashboard
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-8 sm:py-12 bg-white w-full max-w-[100vw] overflow-x-hidden">
        <div className="w-full max-w-[100vw] px-3 sm:px-4 overflow-x-hidden">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 sm:mb-8 px-2">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto overflow-x-hidden px-2">
            {/* Feature 1 */}
            <div className="text-center overflow-x-hidden min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 flex-shrink-0">
                <span className="text-2xl sm:text-3xl">🏛️</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-2 break-words px-2">Institution Issues</h3>
              <p className="text-xs sm:text-sm text-gray-600 break-words px-3">
                Authorized institutions issue non-transferable digital credentials 
                as Soulbound NFTs to students' wallets.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center overflow-x-hidden min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 flex-shrink-0">
                <span className="text-2xl sm:text-3xl">👨‍🎓</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-2 break-words px-2">Student Owns</h3>
              <p className="text-xs sm:text-sm text-gray-600 break-words px-3">
                Students permanently own their credentials. Credentials cannot 
                be transferred, ensuring authenticity.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center overflow-x-hidden min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 flex-shrink-0">
                <span className="text-2xl sm:text-3xl">✓</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-2 break-words px-2">Anyone Verifies</h3>
              <p className="text-xs sm:text-sm text-gray-600 break-words px-3">
                Employers and third parties can instantly verify credentials 
                on-chain without intermediaries.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-8 sm:py-12 bg-gray-50 w-full max-w-[100vw] overflow-x-hidden">
        <div className="w-full max-w-[100vw] px-3 sm:px-4 overflow-x-hidden">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 sm:mb-8 px-2">Why Blockchain?</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto overflow-x-hidden px-2">
            <div className="card overflow-x-hidden min-w-0 p-3 sm:p-4">
              <h3 className="text-sm sm:text-base font-bold mb-2 flex items-center break-words">
                <span className="text-green-600 mr-2 text-lg flex-shrink-0">🔒</span>
                <span className="break-words">Immutable & Secure</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 break-words">
                Once issued, credentials cannot be altered or forged. 
                Blockchain ensures permanent and tamper-proof records.
              </p>
            </div>

            <div className="card overflow-x-hidden min-w-0 p-3 sm:p-4">
              <h3 className="text-sm sm:text-base font-bold mb-2 flex items-center break-words">
                <span className="text-blue-600 mr-2 text-lg flex-shrink-0">⚡</span>
                <span className="break-words">Instant Verification</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 break-words">
                Verify credentials in seconds without contacting institutions. 
                No waiting, no paperwork, no middlemen.
              </p>
            </div>

            <div className="card overflow-x-hidden min-w-0 p-3 sm:p-4">
              <h3 className="text-sm sm:text-base font-bold mb-2 flex items-center break-words">
                <span className="text-purple-600 mr-2 text-lg flex-shrink-0">🌐</span>
                <span className="break-words">Global Accessibility</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 break-words">
                Access your credentials from anywhere in the world. 
                Truly portable and universally verifiable.
              </p>
            </div>

            <div className="card overflow-x-hidden min-w-0 p-3 sm:p-4">
              <h3 className="text-sm sm:text-base font-bold mb-2 flex items-center break-words">
                <span className="text-orange-600 mr-2 text-lg flex-shrink-0">💎</span>
                <span className="break-words">Soulbound Tokens</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 break-words">
                Non-transferable credentials tied to your identity. 
                Cannot be sold, traded, or transferred.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-8 sm:py-12 bg-primary-600 text-white w-full max-w-[100vw] overflow-x-hidden">
        <div className="w-full max-w-[100vw] px-3 sm:px-4 text-center overflow-x-hidden">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 break-words px-2">Ready to Get Started?</h2>
          <p className="text-sm sm:text-base mb-6 sm:mb-8 text-primary-100 break-words px-2">
            Connect your wallet and explore the future of academic credentials
          </p>
          {!account && (
            <button
              onClick={connectWallet}
              className="bg-white text-primary-600 px-3 sm:px-4 py-2.5 rounded-lg font-semibold text-sm sm:text-base hover:bg-gray-100 transition max-w-[85vw] mx-auto block"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
