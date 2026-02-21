import { useWeb3 } from '../context/Web3Context';

const Home = () => {
  const { account, connectWallet, isMetaMaskInstalled } = useWeb3();

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-10 sm:py-16 md:py-20 w-full overflow-x-hidden">
        <div className="w-full px-4 sm:px-6 overflow-x-hidden">
          <div className="max-w-3xl mx-auto text-center overflow-x-hidden">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 break-words">
              Tokenized Academic Credentials
            </h1>
            <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 text-primary-100 break-words">
              Secure, verifiable, and permanent academic credentials on the blockchain
            </p>
            {!account ? (
              <button
                onClick={connectWallet}
                className="bg-white text-primary-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-gray-100 transition max-w-[90vw] mx-auto"
              >
                <span className="hidden sm:inline">{isMetaMaskInstalled() ? 'Connect Wallet to Get Started' : 'Install MetaMask'}</span>
                <span className="sm:hidden">{isMetaMaskInstalled() ? 'Connect Wallet' : 'Install MetaMask'}</span>
              </button>
            ) : (
              <a
                href="/dashboard"
                className="bg-white text-primary-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-gray-100 transition inline-block max-w-[90vw] mx-auto"
              >
                Go to Dashboard
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-8 sm:py-12 md:py-16 bg-white w-full overflow-x-hidden">
        <div className="w-full px-4 sm:px-6 overflow-x-hidden">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto overflow-x-hidden">
            {/* Feature 1 */}
            <div className="text-center overflow-x-hidden">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 flex-shrink-0">
                <span className="text-3xl sm:text-4xl">🏛️</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 break-words">Institution Issues</h3>
              <p className="text-sm sm:text-base text-gray-600 break-words px-2">
                Authorized institutions issue non-transferable digital credentials 
                as Soulbound NFTs to students' wallets.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center overflow-x-hidden">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 flex-shrink-0">
                <span className="text-3xl sm:text-4xl">👨‍🎓</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 break-words">Student Owns</h3>
              <p className="text-sm sm:text-base text-gray-600 break-words px-2">
                Students permanently own their credentials. Credentials cannot 
                be transferred, ensuring authenticity.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center overflow-x-hidden">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 flex-shrink-0">
                <span className="text-3xl sm:text-4xl">✓</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 break-words">Anyone Verifies</h3>
              <p className="text-sm sm:text-base text-gray-600 break-words px-2">
                Employers and third parties can instantly verify credentials 
                on-chain without intermediaries.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-8 sm:py-12 md:py-16 bg-gray-50 w-full overflow-x-hidden">
        <div className="w-full px-4 sm:px-6 overflow-x-hidden">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Why Blockchain?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto overflow-x-hidden">
            <div className="card overflow-x-hidden min-w-0">
              <h3 className="text-base sm:text-lg font-bold mb-2 flex items-center break-words">
                <span className="text-green-600 mr-2 text-xl flex-shrink-0">🔒</span>
                <span className="break-words">Immutable & Secure</span>
              </h3>
              <p className="text-sm sm:text-base text-gray-600 break-words">
                Once issued, credentials cannot be altered or forged. 
                Blockchain ensures permanent and tamper-proof records.
              </p>
            </div>

            <div className="card overflow-x-hidden min-w-0">
              <h3 className="text-base sm:text-lg font-bold mb-2 flex items-center break-words">
                <span className="text-blue-600 mr-2 text-xl flex-shrink-0">⚡</span>
                <span className="break-words">Instant Verification</span>
              </h3>
              <p className="text-sm sm:text-base text-gray-600 break-words">
                Verify credentials in seconds without contacting institutions. 
                No waiting, no paperwork, no middlemen.
              </p>
            </div>

            <div className="card overflow-x-hidden min-w-0">
              <h3 className="text-base sm:text-lg font-bold mb-2 flex items-center break-words">
                <span className="text-purple-600 mr-2 text-xl flex-shrink-0">🌐</span>
                <span className="break-words">Global Accessibility</span>
              </h3>
              <p className="text-sm sm:text-base text-gray-600 break-words">
                Access your credentials from anywhere in the world. 
                Truly portable and universally verifiable.
              </p>
            </div>

            <div className="card overflow-x-hidden min-w-0">
              <h3 className="text-base sm:text-lg font-bold mb-2 flex items-center break-words">
                <span className="text-orange-600 mr-2 text-xl flex-shrink-0">💎</span>
                <span className="break-words">Soulbound Tokens</span>
              </h3>
              <p className="text-sm sm:text-base text-gray-600 break-words">
                Non-transferable credentials tied to your identity. 
                Cannot be sold, traded, or transferred.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-8 sm:py-12 md:py-16 bg-primary-600 text-white w-full overflow-x-hidden">
        <div className="w-full px-4 sm:px-6 text-center overflow-x-hidden">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 break-words">Ready to Get Started?</h2>
          <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 text-primary-100 break-words">
            Connect your wallet and explore the future of academic credentials
          </p>
          {!account && (
            <button
              onClick={connectWallet}
              className="bg-white text-primary-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-gray-100 transition max-w-[90vw] mx-auto"
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
