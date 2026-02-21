import { useWeb3 } from '../context/Web3Context';

const Home = () => {
  const { account, connectWallet } = useWeb3();

  return (
    <div style={{ position: 'relative', overflowX: 'hidden', width: '100%' }}>

      {/* Hero Section */}
      <section style={{ overflowX: 'hidden' }} className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-10 sm:py-14">
        <div className="px-4 sm:px-6 max-w-2xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">
            Tokenized Academic Credentials
          </h1>
          <p className="text-sm sm:text-base mb-5 text-primary-100">
            Secure, verifiable, and permanent academic credentials on the blockchain
          </p>
          {!account ? (
            <button
              onClick={connectWallet}
              className="bg-white text-primary-600 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-100 transition"
            >
              Connect Wallet
            </button>
          ) : (
            <a
              href="/dashboard"
              className="bg-white text-primary-600 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-100 transition inline-block"
            >
              Go to Dashboard
            </a>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section style={{ overflowX: 'hidden' }} className="bg-white py-8 sm:py-10">
        <div className="px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6">How It Works</h2>
          <div className="flex flex-col gap-5 sm:gap-6 max-w-lg mx-auto md:max-w-4xl md:flex-row">
            <div className="text-center flex-1">
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl"></span>
              </div>
              <h3 className="text-base font-bold mb-1">Institution Issues</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Authorized institutions issue non-transferable digital credentials as Soulbound NFTs to students.
              </p>
            </div>
            <div className="text-center flex-1">
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl"></span>
              </div>
              <h3 className="text-base font-bold mb-1">Student Owns</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Students permanently own their credentials. Credentials cannot be transferred, ensuring authenticity.
              </p>
            </div>
            <div className="text-center flex-1">
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl"></span>
              </div>
              <h3 className="text-base font-bold mb-1">Anyone Verifies</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Employers and third parties can instantly verify credentials on-chain without intermediaries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section style={{ overflowX: 'hidden' }} className="bg-gray-50 py-8 sm:py-10">
        <div className="px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6">Why Blockchain?</h2>
          <div className="flex flex-col gap-3 max-w-lg mx-auto md:max-w-3xl md:flex-row md:flex-wrap">
            <div className="card flex-1" style={{ minWidth: 0 }}>
              <h3 className="text-sm font-bold mb-1 flex items-center">
                <span className="text-green-600 mr-2 flex-shrink-0"></span>
                Immutable and Secure
              </h3>
              <p className="text-xs text-gray-600">
                Once issued, credentials cannot be altered or forged. Blockchain ensures permanent records.
              </p>
            </div>
            <div className="card flex-1" style={{ minWidth: 0 }}>
              <h3 className="text-sm font-bold mb-1 flex items-center">
                <span className="text-blue-600 mr-2 flex-shrink-0"></span>
                Instant Verification
              </h3>
              <p className="text-xs text-gray-600">
                Verify credentials in seconds. No waiting, no paperwork, no middlemen.
              </p>
            </div>
            <div className="card flex-1" style={{ minWidth: 0 }}>
              <h3 className="text-sm font-bold mb-1 flex items-center">
                <span className="text-purple-600 mr-2 flex-shrink-0"></span>
                Global Accessibility
              </h3>
              <p className="text-xs text-gray-600">
                Access your credentials from anywhere in the world. Truly portable.
              </p>
            </div>
            <div className="card flex-1" style={{ minWidth: 0 }}>
              <h3 className="text-sm font-bold mb-1 flex items-center">
                <span className="text-orange-600 mr-2 flex-shrink-0"></span>
                Soulbound Tokens
              </h3>
              <p className="text-xs text-gray-600">
                Non-transferable credentials tied to your identity. Cannot be sold or transferred.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!account && (
        <section style={{ overflowX: 'hidden' }} className="bg-primary-600 text-white py-8 sm:py-10 text-center">
          <div className="px-4">
            <h2 className="text-xl sm:text-2xl font-bold mb-3">Ready to Get Started?</h2>
            <p className="text-sm mb-5 text-primary-100">
              Connect your wallet and explore the future of academic credentials
            </p>
            <button
              onClick={connectWallet}
              className="bg-white text-primary-600 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-100 transition"
            >
              Connect Wallet
            </button>
          </div>
        </section>
      )}

    </div>
  );
};

export default Home;
