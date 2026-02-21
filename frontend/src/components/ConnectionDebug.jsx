import { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';

const ConnectionDebug = () => {
  // Disabled - not showing connection errors popup
  return null;
  
  /* Original code commented out
  const { error } = useWeb3();
  const [showDebug, setShowDebug] = useState(false);

  if (!error) return null;

  const debugInfo = {
    hasEthereum: typeof window.ethereum !== 'undefined',
    isMetaMask: window.ethereum?.isMetaMask || false,
    hasProviders: window.ethereum?.providers ? window.ethereum.providers.length : 0,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <div className="fixed bottom-20 right-6 max-w-sm z-40">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Connection Failed
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>

            {isMobile && (
              <div className="mt-4">
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                  <p className="font-semibold text-blue-800 mb-2">📱 Mobile Solution:</p>
                  <ol className="list-decimal list-inside space-y-1 text-blue-700">
                    <li><strong>Install MetaMask app</strong> from Play Store/App Store</li>
                    <li><strong>Setup wallet</strong> and add Sepolia network</li>
                    <li><strong>Return to this page</strong> in Chrome/Safari</li>
                    <li><strong>Click "Connect Wallet"</strong> button</li>
                    <li>MetaMask app opens → Approve → Connected! ✅</li>
                  </ol>
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold underline">
                      Download MetaMask App →
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="text-sm font-medium text-red-800 hover:text-red-900 underline"
              >
                Reload Page
              </button>
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                {showDebug ? 'Hide' : 'Show'} Debug Info
              </button>
            </div>

            {showDebug && (
              <div className="mt-3 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-40">
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  */
};

export default ConnectionDebug;
