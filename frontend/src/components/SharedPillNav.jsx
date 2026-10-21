import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import SettingsDropdown from './SettingsDropdown';

const SharedPillNav = ({ variant = 'dark' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { account, connectWallet, disconnectWallet, isAdmin, isIssuer, networkId, loading, error } = useWeb3();

  // Scroll effect for navbar background
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLight = variant === 'light';
  
  return (
    <div className={`fixed top-0 w-full pt-[24px] pb-[16px] flex justify-center px-6 lg:px-16 z-[100] transition-all duration-300 ${scrolled ? (isLight ? 'bg-white/80 backdrop-blur-xl border-b border-black/5 shadow-sm pt-[16px]' : 'bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl pt-[16px]') : ''}`}>
      <div className="w-full max-w-[1312px] flex items-center justify-between relative">
        
        {/* Left: Logo */}
        <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity h-[48px] -ml-2 lg:-ml-6" onClick={() => navigate('/')}>
          <img 
            src="/tokcred_logo-removebg-preview.png" 
            alt="TokCred" 
            className={`h-[70px] lg:h-[90px] max-w-none object-contain relative transition-all duration-300 ${isLight ? '' : 'brightness-0 invert'}`}
          />
        </div>

        {/* Center: Solid Pill Nav */}
        <div className={`hidden md:flex absolute left-1/2 -translate-x-1/2 items-center h-[48px] px-[28px] rounded-full text-[14px] font-[500] gap-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-colors duration-300 ${isLight ? 'bg-white border border-slate-200 text-slate-700' : 'bg-[#1A1A24]/80 backdrop-blur-md border border-white/10 text-white/80'}`}>
          <span className={`cursor-pointer transition-colors ${location.pathname === '/' ? (isLight ? 'text-black font-semibold' : 'text-white font-semibold') : (isLight ? 'hover:text-black' : 'hover:text-white')}`} onClick={() => navigate('/')}>Home</span>
          <span className={`cursor-pointer transition-colors ${location.pathname === '/features' ? (isLight ? 'text-black font-semibold' : 'text-white font-semibold') : (isLight ? 'hover:text-black' : 'hover:text-white')}`} onClick={() => navigate('/features')}>Features</span>
          <span className={`cursor-pointer transition-colors ${location.pathname === '/developers' ? (isLight ? 'text-black font-semibold' : 'text-white font-semibold') : (isLight ? 'hover:text-black' : 'hover:text-white')}`} onClick={() => navigate('/developers')}>Developers</span>
          <span className={`cursor-pointer transition-colors ${location.pathname === '/support' ? (isLight ? 'text-black font-semibold' : 'text-white font-semibold') : (isLight ? 'hover:text-black' : 'hover:text-white')}`} onClick={() => navigate('/support')}>Support</span>

          {Boolean(account && (isAdmin || isIssuer)) && (
            <span className={`cursor-pointer transition-colors font-semibold ${isLight ? 'text-[#7053AD] hover:opacity-80' : 'text-[#AB9FF2] hover:opacity-80'}`} onClick={() => navigate('/dashboard')}>Admin</span>
          )}
          {Boolean(account && !isAdmin && !isIssuer) && (
            <span className={`cursor-pointer transition-colors font-semibold ${isLight ? 'text-[#7053AD] hover:opacity-80' : 'text-[#AB9FF2] hover:opacity-80'}`} onClick={() => navigate('/student-dashboard')}>Student</span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-[12px]">
          <SettingsDropdown 
            account={account}
            isAdmin={isAdmin}
            isIssuer={isIssuer}
            networkId={networkId}
            connectWallet={connectWallet}
            disconnectWallet={disconnectWallet}
            loading={loading}
            error={error}
            buttonClassName={`w-[48px] h-[48px] rounded-full flex items-center justify-center transition-colors duration-300 ${isLight ? 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm' : 'hover:bg-white/10 bg-[#1A1A24]/80 backdrop-blur-md border border-white/10 text-white'}`}
            iconSize={20}
          />

          <button 
            onClick={account ? disconnectWallet : connectWallet} 
            title={account ? `Connected: ${account} (Click to disconnect)` : 'Connect Wallet'}
            className={`h-[48px] px-[20px] text-[14px] font-[500] rounded-full flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
              isLight 
                ? (account ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-md' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md')
                : (account ? 'bg-white text-[#0A0A0A] hover:bg-white/90 shadow-md' : 'bg-white text-[#0A0A0A] hover:bg-white/90')
            }`}
          >
            {account ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Connected</span>
              </>
            ) : (
              <span>Connect Wallet</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharedPillNav;
