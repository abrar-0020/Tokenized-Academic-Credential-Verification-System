import { useWeb3 } from '../context/Web3Context';

const Home = () => {
  const { account, connectWallet, isMetaMaskInstalled } = useWeb3();

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-10 sm:py-16 md:py-20 w-full">
        <div className="container mx-auto px-4 sm:px-6 max-w-full">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Tokenized Academic Credentials
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 text-primary-100 px-2">
              Secure, verifiable, and permanent academic credentials on the blockchain
            </p>
            {!account ? (
              <button
                onClick={connectWallet}
                className="bg-white text-primary-600 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base md:text-lg hover:bg-gray-100 transition"
              >
                {isMetaMaskInstalled() ? 'Connect Wallet to Get Started' : 'Install MetaMask'}
              </button>
            ) : (
              <a
                href="/dashboard"
                className="bg-white text-primary-600 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base md:text-lg hover:bg-gray-100 transition inline-block"
              >
                Go to Dashboard
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-8 sm:py-12 md:py-16 bg-white w-full">
        <div className="container mx-auto px-4 sm:px-6 max-w-full">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-3xl sm:text-4xl">🏛️</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Institution Issues</h3>
              <p className="text-gray-600">
                Authorized institutions issue non-transferable digital credentials 
                as Soulbound NFTs to students' wallets.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-3xl sm:text-4xl">👨‍🎓</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Student Owns</h3>
              <p className="text-gray-600">
                Students permanently own their credentials. Credentials cannot 
                be transferred, ensuring authenticity.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-3xl sm:text-4xl">✓</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Anyone Verifies</h3>
              <p className="text-gray-600">
                Employers and third parties can instantly verify credentials 
                on-chain without intermediaries.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-8 sm:py-12 md:py-16 bg-gray-50 w-full">
        <div className="container mx-auto px-4 sm:px-6 max-w-full">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Why Blockchain?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <div className="card">
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 flex items-center">
                <span className="text-green-600 mr-2 sm:mr-3 text-xl sm:text-2xl">🔒</span>
                Immutable & Secure
              </h3>
              <p className="text-gray-600">
                Once issued, credentials cannot be altered or forged. 
                Blockchain ensures permanent and tamper-proof records.
              </p>
            </div>

            <div className="card">
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 flex items-center">
                <span className="text-blue-600 mr-2 sm:mr-3 text-xl sm:text-2xl">⚡</span>
                Instant Verification
              </h3>
              <p className="text-gray-600">
                Verify credentials in seconds without contacting institutions. 
                No waiting, no paperwork, no middlemen.
              </p>
            </div>

            <div className="card">
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 flex items-center">
                <span className="text-purple-600 mr-2 sm:mr-3 text-xl sm:text-2xl">🌐</span>
                Global Accessibility
              </h3>
              <p className="text-gray-600">
                Access your credentials from anywhere in the world. 
                Truly portable and universally verifiable.
              </p>
            </div>

            <div className="card">
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 flex items-center">
                <span className="text-orange-600 mr-2 sm:mr-3 text-xl sm:text-2xl">💎</span>
                Soulbound Tokens
              </h3>
              <p className="text-gray-600">
                Non-transferable credentials tied to your identity. 
                Cannot be sold, traded, or transferred.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-8 sm:py-12 md:py-16 bg-primary-600 text-white w-full">
        <div className="container mx-auto px-4 sm:px-6 text-center max-w-full">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Ready to Get Started?</h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-primary-100 px-2">
            Connect your wallet and explore the future of academic credentials
          </p>
          {!account && (
            <button
              onClick={connectWallet}
              className="bg-white text-primary-600 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base md:text-lg hover:bg-gray-100 transition"
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
