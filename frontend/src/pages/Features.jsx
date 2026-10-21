import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Lock, Key, CheckCircle2, ChevronRight, ChevronDown, Fingerprint, Database, Sparkles } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import SettingsDropdown from '@/components/SettingsDropdown';

const SpotlightCard = ({ children, className = "" }) => {
  const divRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current || isFocused) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-3xl border border-white/10 bg-black/50 overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
};

export default function Features() {
  const navigate = useNavigate();
  const { account, connectWallet, disconnectWallet, isAdmin, isIssuer, networkId, loading, error } = useWeb3();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacityHero = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white/20 overflow-hidden">
      
      {/* HEADER (Exact copy from Home.jsx forced into dark mode) */}
      <div className="fixed top-0 left-0 w-full pt-[24px] flex justify-center px-[24px] lg:px-[32px] z-[100] pointer-events-none">
        <div className="w-full max-w-[1560px] flex items-center justify-between pointer-events-auto relative">
          {/* Left: Logo */}
          <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity h-[56px] -ml-2 lg:-ml-6" onClick={() => navigate('/')}>
            <img 
              src="/tokcred_logo-removebg-preview.png" 
              alt="TokCred" 
              className="h-[90px] lg:h-[120px] max-w-none object-contain relative transition-all duration-300" 
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </div>

          {/* Center: Solid White Pill Nav */}
          <div className={`hidden md:flex absolute left-1/2 -translate-x-1/2 items-center h-[56px] px-[32px] rounded-full text-[15px] font-[400] gap-[24px] tracking-[-0.01em] shadow-[0_8px_24px_rgba(0,0,0,0.02)] transition-colors duration-300 bg-[#241C40] text-white`}>
            <span className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => navigate('/')}>Home</span>
            <span className="cursor-pointer hover:opacity-70 transition-opacity text-[#AB9FF2] font-semibold" onClick={() => navigate('/features')}>Features</span>
            <span className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => navigate('/developers')}>Developers</span>
            <span className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => navigate('/support')}>Support</span>

            {Boolean(account && (isAdmin || isIssuer)) && (
              <span className="cursor-pointer hover:opacity-70 transition-opacity font-semibold text-[#AB9FF2]" onClick={() => navigate('/dashboard')}>Admin</span>
            )}
            {Boolean(account && !isAdmin && !isIssuer) && (
              <span className="cursor-pointer hover:opacity-70 transition-opacity font-semibold text-[#AB9FF2]" onClick={() => navigate('/student-dashboard')}>Student</span>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-[16px]">

          <div>
            <SettingsDropdown 
              account={account}
              isAdmin={isAdmin}
              isIssuer={isIssuer}
              networkId={networkId}
              connectWallet={connectWallet}
              disconnectWallet={disconnectWallet}
              loading={loading}
              error={error}
              buttonClassName={`w-[56px] h-[56px] rounded-full flex items-center justify-center hover:opacity-80 transition-colors duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.02)] bg-[#241C40] text-white`}
              iconSize={22}
            />
          </div>

          <button 
            onClick={account ? disconnectWallet : connectWallet} 
            title={account ? `Connected: ${account} (Click to disconnect)` : 'Connect Wallet'}
            className={`h-[56px] px-[28px] text-[16px] font-[400] rounded-full flex items-center gap-2.5 transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_8px_24px_rgba(176,150,250,0.2)] bg-[#EAE4FF] text-[#101014] hover:bg-white`}
          >
            {account ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Connected</span>
              </>
            ) : (
              <span>Connect Wallet</span>
            )}
          </button>

          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        HERO SECTION - Minimalist Vercel/Linear Style
        ========================================================================
      */}
      <section ref={heroRef} className="relative min-h-[90vh] flex flex-col items-center justify-center pt-40 pb-20 px-6">
        
        {/* Background Grid & Gradient */}
        <motion.div 
          style={{ y: yBg, opacity: opacityHero }}
          className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 blur-[120px] rounded-full" />
        </motion.div>

        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left: Text Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-start text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
            >
              <Sparkles size={14} className="text-gray-400" />
              <span className="text-[12px] font-medium tracking-wide text-gray-300">Introducing TokCred Core</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="text-[48px] sm:text-[64px] md:text-[80px] font-bold tracking-tight mb-8 leading-[1.05]"
            >
              Trust, engineered for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                the modern web.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-[18px] md:text-[20px] text-gray-400 max-w-xl mb-12 font-light leading-relaxed"
            >
              Cryptographic verification that happens in milliseconds. No phone calls, no background check delays. Just mathematical certainty.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button 
                onClick={() => document.getElementById('features-grid').scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-3 rounded-full bg-white text-black text-[15px] font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                Explore Features
              </button>
              <button 
                onClick={() => navigate('/public-verify')}
                className="px-6 py-3 rounded-full bg-white/5 text-white border border-white/10 text-[15px] font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
              >
                Try the Demo
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            </motion.div>
          </div>

          {/* Right: Certificate UI Graphic */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, rotateY: 10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="w-full lg:w-1/2 perspective-[1000px]"
          >
            <div className="w-full max-w-[600px] mx-auto bg-white rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 transform -rotate-2 hover:rotate-0 transition-transform duration-700">
              
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <div className="text-[#898993] text-[10px] md:text-[11px] font-mono font-semibold tracking-[0.15em] mb-2 uppercase">
                    Decentralized Credential Registry
                  </div>
                  <div className="text-[#0D1226] text-[24px] md:text-[28px] font-bold tracking-tight leading-none">
                    ACCREDITED ACADEMIC DEGREE
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#E8FBF2] rounded-full border border-[#BDECDC]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div>
                  <span className="text-[#10B981] text-[9px] md:text-[10px] font-mono font-bold tracking-widest uppercase">
                    Cryptographically Sealed
                  </span>
                </div>
              </div>

              <div className="w-full h-px bg-[#F1F1F5] mb-8"></div>

              {/* Data Grid */}
              <div className="grid grid-cols-3 gap-6 mb-12">
                <div>
                  <div className="text-[#A1A1AA] text-[9px] md:text-[10px] font-mono font-semibold tracking-widest uppercase mb-1.5">Candidate</div>
                  <div className="text-[#0D1226] text-[18px] md:text-[22px] font-bold tracking-tight">Verified Holder</div>
                  <div className="text-[#A1A1AA] text-[11px] font-mono mt-1">SBT Soulbound Token</div>
                </div>
                <div>
                  <div className="text-[#A1A1AA] text-[9px] md:text-[10px] font-mono font-semibold tracking-widest uppercase mb-1.5">Conferral Date</div>
                  <div className="text-[#0D1226] text-[18px] md:text-[22px] font-bold tracking-tight">On-Chain Verified</div>
                  <div className="text-[#A1A1AA] text-[11px] font-mono mt-1">Immutable Timestamp</div>
                </div>
                <div>
                  <div className="text-[#A1A1AA] text-[9px] md:text-[10px] font-mono font-semibold tracking-widest uppercase mb-1.5">Ledger Record</div>
                  <div className="text-[#0D1226] text-[18px] md:text-[22px] font-mono font-bold tracking-tight">ERC-5484</div>
                  <div className="text-[#10B981] text-[11px] font-mono mt-1">Smart Contract Anchored</div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-[#F3EEFE]"></div>
                    <div className="absolute w-12 h-12 rounded-full bg-[#3B2885] flex items-center justify-center shadow-lg shadow-[#3B2885]/30">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  </div>
                  <div>
                    <div className="text-[#A1A1AA] text-[9px] md:text-[10px] font-mono font-semibold tracking-widest uppercase mb-1">Official Degree Authority</div>
                    <div className="text-[#0D1226] text-[14px] md:text-[15px] font-bold">Authorized University Registrar</div>
                    <div className="text-[#A1A1AA] text-[11px] font-mono mt-0.5">ECDSA Digital Signature</div>
                  </div>
                </div>

                <div className="bg-[#F8F5FF] px-4 py-3 rounded-lg border border-[#EDE4FF] text-right">
                  <div className="text-[#898993] text-[10px] font-mono mb-1">Protocol Guarantee</div>
                  <div className="text-[#3B2885] text-[12px] font-mono font-semibold">SHA-256 Merkle Proven</div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </section>

      {/* 
        ========================================================================
        BENTO GRID SECTION - Spotlight Cards
        ========================================================================
      */}
      <section id="features-grid" className="py-24 md:py-32 relative z-10 px-6">
        <div className="max-w-6xl mx-auto">
          
          <div className="mb-16">
            <h2 className="text-[32px] md:text-[40px] font-semibold tracking-tight mb-4">Powerful primitives.</h2>
            <p className="text-[18px] text-gray-400">Everything you need to build trustless credentialing systems.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            
            {/* Main Feature: ECDSA */}
            <SpotlightCard className="md:col-span-2 md:row-span-2 p-10 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6 border border-white/10">
                  <Shield className="text-white" size={24} />
                </div>
                <h3 className="text-[28px] font-medium tracking-tight mb-3">ECDSA Signatures</h3>
                <p className="text-gray-400 text-[16px] leading-relaxed max-w-md">
                  Every credential is cryptographically signed. If a single byte of metadata is altered, the verification fails instantly.
                </p>
              </div>
              
              <div className="bg-black/80 border border-white/10 rounded-xl p-5 font-mono text-[13px] text-gray-400 relative overflow-hidden mt-8">
                <div className="flex justify-between items-center text-[11px] text-gray-500 mb-3 border-b border-white/10 pb-2">
                  <span>verify.ts</span>
                  <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Secure</span>
                </div>
                <div className="space-y-1.5">
                  <div><span className="text-pink-400">const</span> <span className="text-blue-300">hash</span> = keccak256(payload);</div>
                  <div><span className="text-pink-400">const</span> <span className="text-blue-300">isValid</span> = ecdsa.verify(hash, sig);</div>
                  <div className="text-emerald-400 mt-2">// Returns true in 12ms</div>
                </div>
              </div>
            </SpotlightCard>

            {/* Feature: Decentralized */}
            <SpotlightCard className="p-8 flex flex-col justify-between">
              <div>
                <Database className="text-gray-400 mb-4" size={24} />
                <h3 className="text-[20px] font-medium tracking-tight mb-2">IPFS Storage</h3>
                <p className="text-gray-400 text-[14px] leading-relaxed">
                  Decentralized infrastructure guarantees 100% uptime and tamper-proofing.
                </p>
              </div>
              <div className="h-24 w-full border border-white/10 rounded-lg bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50 mix-blend-overlay"></div>
            </SpotlightCard>

            {/* Feature: Privacy */}
            <SpotlightCard className="p-8 flex flex-col justify-between">
              <div>
                <Fingerprint className="text-gray-400 mb-4" size={24} />
                <h3 className="text-[20px] font-medium tracking-tight mb-2">Self-Sovereign</h3>
                <p className="text-gray-400 text-[14px] leading-relaxed">
                  Students own their data. No more paying universities to release transcripts.
                </p>
              </div>
            </SpotlightCard>

            {/* Feature: Speed */}
            <SpotlightCard className="md:col-span-3 p-10 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <Zap className="text-gray-400 mb-6" size={28} />
                <h3 className="text-[32px] font-medium tracking-tight mb-4">Instant Velocity.</h3>
                <p className="text-gray-400 text-[16px] leading-relaxed max-w-xl">
                  Background checks used to take weeks. With TokCred, employers can cryptographically verify degrees in milliseconds, eliminating friction in the hiring pipeline.
                </p>
              </div>
              <div className="w-full md:w-[300px] aspect-square rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center relative overflow-hidden">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="w-48 h-48 border border-dashed border-white/20 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle2 size={40} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                </div>
              </div>
            </SpotlightCard>

          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        FINAL CTA SECTION
        ========================================================================
      */}
      <section className="py-32 px-6 relative border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-[40px] md:text-[56px] font-semibold tracking-tight mb-6">
            Ready to deploy trust?
          </h2>
          <p className="text-[18px] text-gray-400 mb-10 max-w-xl mx-auto">
            Experience the verification platform firsthand. Drop a credential in the sandbox to see the magic.
          </p>
          <button 
            onClick={() => navigate('/public-verify')}
            className="px-8 py-4 rounded-full bg-white text-black text-[15px] font-medium hover:scale-105 transition-transform flex items-center justify-center gap-2 mx-auto"
          >
            <Key size={18} />
            Start Verification
          </button>
        </div>
      </section>

    </div>
  );
}
