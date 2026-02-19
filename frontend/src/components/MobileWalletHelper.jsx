import { useState, useEffect } from 'react';

const MobileWalletHelper = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isMetaMaskBrowser, setIsMetaMaskBrowser] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showHelper, setShowHelper] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(checkMobile);

    // Detect iOS
    const checkIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsIOS(checkIOS);

    // Detect MetaMask mobile browser
    const isMetaMask = typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
    setIsMetaMaskBrowser(isMetaMask);

    // Show helper if mobile but not in MetaMask browser and not connected
    if (checkMobile && !isMetaMask) {
      // Only show on certain pages, not too intrusive
      const timer = setTimeout(() => setShowHelper(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!showHelper) {
    return null;
  }

  const currentUrl = window.location.href;
  const isLocalhost = currentUrl.includes('localhost') || currentUrl.includes('192.168') || currentUrl.includes('127.0.0.1');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setShowHelper(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Mobile Wallet Connection
          </h2>
          <p className="text-gray-600">
            {isIOS ? 'iOS' : 'Android'} detected
          </p>
        </div>

        {isLocalhost && isIOS ? (
          // iOS + Localhost warning
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  iOS + Local Testing Not Recommended
                </h3>
                <p className="mt-2 text-sm text-yellow-700">
                  iOS doesn't work well with local IPs. Please deploy your app first, then access via Safari.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-sm font-semibold text-blue-900 mb-2">
            📱 How Mobile Connection Works (2024+)
          </p>
          <p className="text-sm text-blue-800">
            MetaMask removed the in-app browser. Instead, use ANY browser (Safari, Chrome) - it works via deep links!
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <p className="font-semibold text-gray-900">Install MetaMask App</p>
              <p className="text-sm text-gray-600">
                Download from {isIOS ? 'App Store' : 'Play Store'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <p className="font-semibold text-gray-900">Setup Wallet & Add Sepolia Network</p>
              <p className="text-sm text-gray-600">
                Create wallet in MetaMask app, then add Sepolia testnet (Chain ID: 11155111)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                Open This Site in {isIOS ? 'Safari' : 'Chrome/Any Browser'}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Visit this site in your regular browser (not in MetaMask - there's no browser in MetaMask anymore)
              </p>
              {!isLocalhost && (
                <div className="mt-2 bg-gray-100 p-2 rounded text-xs font-mono break-all">
                  {currentUrl}
                </div>
              )}
              {isLocalhost && (
                <div className="mt-2 bg-red-50 p-2 rounded text-xs text-red-700">
                  ⚠️ Deploy first for mobile access. Local URLs don't work well on mobile.
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <p className="font-semibold text-gray-900">Click "Connect Wallet"</p>
              <p className="text-sm text-gray-600">
                MetaMask app opens automatically → Approve connection → Return to browser → Connected! ✅
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all text-center"
          >
            Download MetaMask
          </a>
          
          <button
            onClick={() => setShowHelper(false)}
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-all text-center"
          >
            Got it, let me connect!
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-2">
            💡 <strong>Key Point:</strong> No "Browser" in MetaMask app - use Safari/Chrome instead!
          </p>
          <p className="text-xs text-gray-400 text-center">
            Full guide: MOBILE_COMPLETE_GUIDE.md
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileWalletHelper;
