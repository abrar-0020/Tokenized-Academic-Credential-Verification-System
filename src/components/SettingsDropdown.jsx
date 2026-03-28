import { useState } from 'react';
import { Settings, LogOut } from 'lucide-react';
import { formatAddress } from '../utils/helpers';

const SettingsDropdown = ({ account, isAdmin, isIssuer, networkId, connectWallet, disconnectWallet, loading }) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="p-2 rounded-lg hover:bg-[#1f2020] transition-colors text-[#e7e5e4] hover:text-[#8197ff]"
      >
        <Settings className="w-5 h-5" />
      </button>
      
      {showSettings && (
        <div className="absolute right-0 mt-2 w-80 bg-[#131313] border border-[#484848]/30 rounded-lg shadow-lg z-50">
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {/* Wallet Info - only show if connected */}
            {account && (
              <div className="border-b border-[#484848]/20 pb-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#8197ff] font-bold mb-2">Wallet Connected</p>
                <div className="px-3 py-2 rounded bg-[#0e0e0e] border border-[#484848]/20 text-[#c6c6c7] text-xs font-mono break-all">
                  {formatAddress(account)}
                </div>
              </div>
            )}
            
            {/* Network Info - always show */}
            <div className="border-b border-[#484848]/20 pb-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#8197ff] font-bold mb-2">Network</p>
              <p className="text-[#c6c6c7] text-xs">
                {networkId === 11155111 ? 'Sepolia Testnet' : `Network ID: ${networkId}`}
              </p>
            </div>
            
            {/* Role Info - only show if connected */}
            {account && (
              <div className="border-b border-[#484848]/20 pb-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#8197ff] font-bold mb-2">Role</p>
                <div className="space-y-1">
                  {isAdmin && <span className="inline-block px-2 py-1 text-xs bg-[#8197ff]/10 text-[#8197ff] rounded border border-[#8197ff]/20">Admin</span>}
                  {isIssuer && <span className="inline-block px-2 py-1 text-xs bg-[#8197ff]/10 text-[#8197ff] rounded border border-[#8197ff]/20 ml-1">Issuer</span>}
                  {!isAdmin && !isIssuer && <span className="inline-block px-2 py-1 text-xs bg-[#484848]/20 text-[#c6c6c7] rounded border border-[#484848]/30">Viewer</span>}
                </div>
              </div>
            )}
            
            {/* Disconnect Button - only show if connected */}
            {account && (
              <button
                onClick={() => {
                  disconnectWallet();
                  setShowSettings(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-[#ec7c8a] hover:bg-[#1f2020] transition-colors justify-center"
              >
                <LogOut className="w-4 h-4" />
                Disconnect Wallet
              </button>
            )}
            
            {/* Connect Button - only show if not connected */}
            {!account && (
              <button
                onClick={() => {
                  connectWallet();
                  setShowSettings(false);
                }}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#8197ff] to-[#002ca3] text-[#001661] px-3 py-2 rounded font-semibold text-xs tracking-widest uppercase hover:opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsDropdown;
