import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import SettingsDropdown from './SettingsDropdown';
import { ChevronDown, ArrowRight } from 'lucide-react';
import Footer from './Footer';

const PremiumPageLayout = ({ title, subtitle, badge, children }) => {
  const navigate = useNavigate();
  const { account, connectWallet, disconnectWallet, isAdmin, isIssuer, networkId, loading, error } = useWeb3();

  // Scroll effect for navbar glassmorphism
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-['Inter'] flex flex-col selection:bg-[#7053AD]/30 selection:text-white relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#513582]/20 blur-[150px] pointer-events-none rounded-full"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#7053AD]/10 blur-[150px] pointer-events-none rounded-full"></div>
      
      {/* HEADER */}
      <div className={`fixed top-0 w-full pt-[24px] pb-[16px] flex justify-center px-6 lg:px-16 z-[100] transition-all duration-300 ${scrolled ? 'bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl pt-[16px]' : ''}`}>
        <div className="w-full max-w-[1312px] flex items-center justify-between relative">
          
          {/* Left: Logo */}
          <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity h-[48px] -ml-2 lg:-ml-6" onClick={() => navigate('/')}>
            <img 
              src="/tokcred_logo-removebg-preview.png" 
              alt="TokCred" 
              className="h-[70px] lg:h-[90px] max-w-none object-contain relative transition-all duration-300 brightness-0 invert" 
            />
          </div>

          {/* Center: Solid Pill Nav (Dark version) */}
          <div className="hidden xl:flex absolute left-1/2 -translate-x-1/2 items-center h-[48px] px-[28px] rounded-full text-[14px] font-[500] gap-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-colors duration-300 bg-[#1A1A24]/80 backdrop-blur-md border border-white/10 text-white/80">
            <span className="cursor-pointer hover:text-white transition-colors" onClick={() => navigate('/')}>Home</span>
            <span className="cursor-pointer hover:text-white transition-colors" onClick={() => navigate('/features')}>Features</span>
            <span className="cursor-pointer hover:text-white transition-colors" onClick={() => navigate('/developers')}>Developers</span>
            <span className="cursor-pointer hover:text-white transition-colors" onClick={() => navigate('/support')}>Support</span>

            {Boolean(account && (isAdmin || isIssuer)) && (
              <>
                <span className="cursor-pointer hover:text-white transition-colors" onClick={() => navigate('/dashboard')}>Dashboard</span>
                <span className="cursor-pointer hover:text-white transition-colors" onClick={() => navigate('/issue')}>Issue</span>
                <span className="cursor-pointer hover:text-white transition-colors" onClick={() => navigate('/history')}>History</span>
              </>
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
              buttonClassName="w-[48px] h-[48px] rounded-full flex items-center justify-center hover:bg-white/10 transition-colors duration-300 bg-[#1A1A24]/80 backdrop-blur-md border border-white/10 text-white"
              iconSize={20}
            />

            {!account && (
              <button onClick={connectWallet} className="h-[48px] px-[24px] text-[14px] font-[500] rounded-full flex items-center transition-all duration-300 hover:scale-105 active:scale-95 bg-white text-[#0A0A0A] hover:bg-white/90">
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="w-full max-w-[1312px] mx-auto px-6 lg:px-16 pt-[160px] pb-[80px] relative z-10 flex flex-col items-center text-center">
        {badge && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-[#818CF8] shadow-[0_0_8px_rgba(129,140,248,0.6)]"></div>
            <span className="text-[12px] font-medium text-[#A9B1D6] tracking-wide uppercase">{badge}</span>
          </div>
        )}
        
        <h1 className="text-[48px] md:text-[64px] lg:text-[80px] font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50 leading-[1.1] max-w-[900px] mb-6">
          {title}
        </h1>
        
        <p className="text-[18px] md:text-[20px] text-[#9CA3AF] max-w-[600px] leading-[1.6]">
          {subtitle}
        </p>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-[1312px] mx-auto px-6 lg:px-16 pb-[120px] relative z-10">
        {children}
      </div>

      <Footer />
    </div>
  );
};

export default PremiumPageLayout;
