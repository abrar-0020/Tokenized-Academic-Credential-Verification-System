import { useState, useRef, useEffect } from 'react';
import { Settings, LogOut, Copy, Check, Shield, Globe, Wallet } from 'lucide-react';
import { formatAddress } from '../utils/helpers';

const SettingsDropdown = ({ account, isAdmin, isIssuer, networkId, connectWallet, disconnectWallet, loading, error, buttonClassName, iconSize }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);

  const networkLabel =
    networkId == null ? 'Not connected' : networkId === 11155111 ? 'Sepolia Testnet' : `Network ID: ${networkId}`;

  // Close dropdown on click outside
  useEffect(() => {
    if (!showSettings) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettings]);

  const handleCopy = () => {
    if (!account) return;
    navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const GLASS_STYLE = {
    background: 'rgba(255, 255, 255, 0.72)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.85)',
    boxShadow: '0px 20px 50px rgba(45, 38, 75, 0.16), inset 0px 1px 2px rgba(255, 255, 255, 0.6)'
  };

  const INSET_GLASS = {
    background: 'rgba(255, 255, 255, 0.38)',
    border: '1px solid rgba(255, 255, 255, 0.75)',
    boxShadow: 'inset 0px 1px 2px rgba(255, 255, 255, 0.45)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)'
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowSettings(!showSettings)}
        className={buttonClassName || "w-[44px] h-[44px] sm:w-[56px] sm:h-[56px] rounded-full flex items-center justify-center hover:opacity-80 transition-colors duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.02)] bg-white text-[#101014]"}
        aria-label="Settings and wallet options"
      >
        <Settings size={iconSize || 20} />
      </button>
      
      {showSettings && (
        <div 
          className="absolute right-0 sm:left-1/2 sm:-translate-x-1/2 mt-3 w-[320px] rounded-[24px] p-5 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
          style={GLASS_STYLE}
        >
          {/* Subtle ambient glass glow */}
          <div className="absolute -top-16 -right-16 w-[180px] h-[180px] bg-white/40 rounded-full blur-xl pointer-events-none" />

          {/* Header Title */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[rgba(125,101,154,0.18)] relative z-10">
            <div className="flex items-center gap-2 text-[#2D264B]">
              <Wallet className="w-4 h-4 text-[#7053AD]" />
              <span className="font-['Inter'] font-semibold text-[13px] tracking-tight">Session & Wallet</span>
            </div>
            {account && (
              <span 
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium text-emerald-800"
                style={{
                  background: 'rgba(209, 250, 229, 0.55)',
                  border: '1px solid rgba(167, 243, 208, 0.8)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active
              </span>
            )}
          </div>

          <div className="space-y-3.5 relative z-10">
            {error && (
              <div 
                className="rounded-[12px] px-3 py-2 text-xs text-red-700"
                style={{
                  background: 'rgba(254, 226, 226, 0.65)',
                  border: '1px solid rgba(254, 202, 202, 0.9)'
                }}
              >
                {error}
              </div>
            )}

            {/* Wallet Info - only show if connected */}
            {account && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#7053AD] font-['IBM_Plex_Mono'] font-semibold">
                  Wallet Address
                </span>
                <div 
                  className="px-3.5 py-2.5 rounded-[14px] text-[#2D264B] text-xs font-mono font-medium flex items-center justify-between group transition-all"
                  style={INSET_GLASS}
                >
                  <span className="truncate pr-2">{formatAddress(account)}</span>
                  <button 
                    onClick={handleCopy}
                    className="p-1 rounded-md hover:bg-white/60 text-[#7053AD] hover:text-[#513582] transition-colors"
                    title={copied ? "Copied!" : "Copy address"}
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}
            
            {/* Network Info - always show */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.14em] text-[#7053AD] font-['IBM_Plex_Mono'] font-semibold">
                Network
              </span>
              <div 
                className="px-3.5 py-2 rounded-[12px] flex items-center gap-2 text-xs text-[#292333] font-medium"
                style={INSET_GLASS}
              >
                <Globe className="w-3.5 h-3.5 text-[#7053AD]" />
                <span>{networkLabel}</span>
              </div>
            </div>
            
            {/* Role Info - only show if connected */}
            {account && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#7053AD] font-['IBM_Plex_Mono'] font-semibold">
                  Permissions / Role
                </span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {isAdmin && (
                    <span 
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full text-[#513582]"
                      style={{
                        background: 'rgba(112, 83, 173, 0.16)',
                        border: '1px solid rgba(112, 83, 173, 0.32)',
                        backdropFilter: 'blur(8px)'
                      }}
                    >
                      <Shield className="w-3 h-3 text-[#7053AD]" />
                      Admin
                    </span>
                  )}
                  {isIssuer && (
                    <span 
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full text-[#7053AD]"
                      style={{
                        background: 'rgba(112, 83, 173, 0.16)',
                        border: '1px solid rgba(112, 83, 173, 0.32)',
                        backdropFilter: 'blur(8px)'
                      }}
                    >
                      <Shield className="w-3 h-3 text-[#7053AD]" />
                      Issuer
                    </span>
                  )}
                  {!isAdmin && !isIssuer && (
                    <span 
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full text-[#513582]"
                      style={{
                        background: 'rgba(112, 83, 173, 0.12)',
                        border: '1px solid rgba(112, 83, 173, 0.25)',
                        backdropFilter: 'blur(8px)'
                      }}
                    >
                      Student
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <div className="pt-1.5">
              {/* Disconnect Button - only show if connected */}
              {account && (
                <button
                  onClick={() => {
                    disconnectWallet();
                    setShowSettings(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-[14px] text-xs font-semibold text-red-600 transition-all duration-200 hover:brightness-95 active:scale-[0.98] cursor-pointer"
                  style={{
                    background: 'rgba(254, 226, 226, 0.55)',
                    border: '1px solid rgba(254, 202, 202, 0.85)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    boxShadow: '0px 4px 12px rgba(239, 68, 68, 0.06)'
                  }}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect Wallet</span>
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
                  className="w-full bg-[#2D264B] hover:bg-[#3C315B] text-white py-2.5 px-3 rounded-[14px] font-semibold text-xs transition-all duration-200 disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  {loading ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsDropdown;
