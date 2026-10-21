import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import SettingsDropdown from '@/components/SettingsDropdown';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent, useMotionTemplate } from 'framer-motion';
import { Search, ShieldCheck, Download, BookOpen, ChevronDown, Lock, ArrowRight, Globe, Zap, Users, Smartphone, Menu, X } from 'lucide-react';
import { useRef, useCallback, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import QRCodeStyling from 'qr-code-styling';


const phantomEase = [0.16, 1, 0.3, 1];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: phantomEase } }
};

// 3D Tilt + hover-play video card
const TiltCard = ({ src }) => {
  const cardRef = useRef(null);
  const videoRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const { left, top, width, height } = card.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;   // -0.5 to 0.5
    const y = (e.clientY - top) / height - 0.5;   // -0.5 to 0.5
    const rotateX = (-y * 14).toFixed(2);          // tilt up/down
    const rotateY = (x * 14).toFixed(2);           // tilt left/right
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03,1.03,1.03)`;
  }, []);

  const handleMouseEnter = useCallback(() => {
    videoRef.current?.play();
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (card) card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, []);

  return (
    <div
      ref={cardRef}
      className="w-[85vw] sm:w-[400px] lg:w-[460px] h-[530px] lg:h-[640px] flex-none rounded-[24px] lg:rounded-[32px] overflow-hidden shadow-[0_15px_45px_rgba(52,40,90,0.18)] relative cursor-pointer"
      style={{ transition: 'transform 0.1s ease-out', transformStyle: 'preserve-3d', willChange: 'transform' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={src}
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      />
    </div>
  );
};

const Home = () => {
  const { account, connectWallet, disconnectWallet, isAdmin, isIssuer, networkId, loading, error } = useWeb3();
  const navigate = useNavigate();
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);
  const [isNavDark, setIsNavDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const darkSectionRef = useRef(null);

  // Scroll animations for Credentials Headline
  const headlineRef = useRef(null);
  const { scrollYProgress: headlineScroll } = useScroll({
    target: headlineRef,
    offset: ["start end", "center center"]
  });
  const headlineY = useTransform(headlineScroll, [0, 1], ["-50vh", "0vh"]);

  // SINGLE NORMALIZED SCROLL PROGRESS FOR ENTIRE TRANSITION (0 to 1)
  const cardsRef = useRef(null);
  const { scrollYProgress: cardTransitionProgress } = useScroll({
    target: cardsRef,
    offset: ["start end", "end start"]
  });

  // Stage 3: Text Reveal (Progress 0.80 -> 1.0)
  // We use a CSS clipping mask to ensure the text is 100% invisible until the mask opens.
  // The mask opens from the top down as the cards scroll up.
  const clipPercent = useTransform(
    cardTransitionProgress, 
    [0.80, 1], 
    [100, 0]
  );
  const textClipPath = useMotionTemplate`inset(${clipPercent}% 0 0 0)`;

  // Stage 2: Background Switch (Progress 0.70)
  const [isPurpleBg, setIsPurpleBg] = useState(false);
  const dynamicBgRef = useRef(null); // Keeps reference for the wrapper layout

  useMotionValueEvent(cardTransitionProgress, "change", (latest) => {
    if (latest >= 0.70 && !isPurpleBg) {
      setIsPurpleBg(true);
    } else if (latest < 0.70 && isPurpleBg) {
      setIsPurpleBg(false);
    }
  });

  // Security Cards scroll-triggered background transition (purple → CTA lavender)
  const securityCardsRef = useRef(null);
  const { scrollYProgress: securityScroll } = useScroll({
    target: securityCardsRef,
    offset: ["start end", "end start"]
  });
  const [isCtaBg, setIsCtaBg] = useState(false);
  useMotionValueEvent(securityScroll, "change", (latest) => {
    if (latest >= 0.55 && !isCtaBg) setIsCtaBg(true);
    else if (latest < 0.55 && isCtaBg) setIsCtaBg(false);
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsNavDark(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: "-100px 0px -40% 0px" }
    );
    if (darkSectionRef.current) {
      observer.observe(darkSectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const PHANTOM_FONT = '"Phantom", "Plus Jakarta Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const qrBtnRef = useRef(null);
  const qrCardRef = useRef(null);
  const qrCodeContainerRef = useRef(null);

  const [qrCode] = useState(new QRCodeStyling({
    width: 210,
    height: 210,
    margin: 0,
    type: "svg",
    data: "https://github.com/abrar-0020/Tokenized-Academic-Credential-Verification-System/releases", // Actual URL
    image: "/mascot.png",
    dotsOptions: {
      color: "#3C315B",
      type: "dots"
    },
    cornersSquareOptions: {
      color: "#3C315B",
      type: "extra-rounded"
    },
    cornersDotOptions: {
      color: "#3C315B",
      type: "dot"
    },
    backgroundOptions: {
      color: "transparent",
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 8,
      imageSize: 0.3
    }
  }));

  useEffect(() => {
    if (isQRModalOpen && qrCodeContainerRef.current) {
      qrCodeContainerRef.current.innerHTML = '';
      qrCode.append(qrCodeContainerRef.current);
    }
  }, [isQRModalOpen, qrCode]);


  // Close QR dropdown on outside click
  useEffect(() => {
    if (!isQRModalOpen) return;
    const handleClick = (e) => {
      if (qrBtnRef.current && !qrBtnRef.current.contains(e.target)) {
        setIsQRModalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isQRModalOpen]);

  // Animations removed for native scroll

  return (
    <>
    <div className="w-full overflow-x-hidden flex flex-col items-center selection:bg-[#AB9FF2] selection:text-white" style={{ fontFamily: PHANTOM_FONT }}>
      
      {/* HEADER (Fixed so it comes with you when scrolled) */}
      <div className="fixed top-0 left-0 w-full pt-[24px] flex justify-center px-[24px] lg:px-[32px] z-[100] pointer-events-none">
        <div className="w-full max-w-[1560px] flex items-center justify-between pointer-events-auto relative">
          {/* Left: Logo */}
          <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity h-[56px] -ml-2 lg:-ml-6" onClick={() => navigate('/')}>
            <img 
              src="/tokcred_logo-removebg-preview.png" 
              alt="TokCred" 
              className="h-[90px] lg:h-[120px] max-w-none object-contain relative transition-all duration-300" 
              style={{ filter: isNavDark ? 'brightness(0) invert(1)' : 'none' }}
            />
          </div>

          {/* Center: Solid White Pill Nav */}
          <div className={`hidden md:flex absolute left-1/2 -translate-x-1/2 items-center h-[56px] px-[32px] rounded-full text-[15px] font-[400] gap-[24px] tracking-[-0.01em] shadow-[0_8px_24px_rgba(0,0,0,0.02)] transition-colors duration-300 pointer-events-auto ${isNavDark ? 'bg-[#241C40] text-white' : 'bg-white text-[#101014]'}`}>
            <span className="cursor-pointer hover:opacity-70 transition-opacity select-none font-semibold" onClick={() => navigate('/')}>Home</span>
            <span className="cursor-pointer hover:opacity-70 transition-opacity select-none" onClick={() => navigate('/features')}>Features</span>
            <span className="cursor-pointer hover:opacity-70 transition-opacity select-none" onClick={() => navigate('/developers')}>Developers</span>
            <span className="cursor-pointer hover:opacity-70 transition-opacity select-none" onClick={() => navigate('/support')}>Support</span>

            {Boolean(account && (isAdmin || isIssuer)) && (
              <span className="cursor-pointer hover:opacity-70 transition-opacity select-none font-semibold text-[#7053AD]" onClick={() => navigate('/dashboard')}>Admin</span>
            )}
            {Boolean(account && !isAdmin && !isIssuer) && (
              <span className="cursor-pointer hover:opacity-70 transition-opacity select-none font-semibold text-[#7053AD]" onClick={() => navigate('/student-dashboard')}>Student</span>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-[8px] sm:gap-[16px]">
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
                buttonClassName={`w-[44px] h-[44px] sm:w-[56px] sm:h-[56px] rounded-full flex items-center justify-center hover:opacity-80 transition-colors duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.02)] ${isNavDark ? 'bg-[#241C40] text-white' : 'bg-white text-[#101014]'}`}
                iconSize={20}
              />
            </div>

            <button 
              onClick={account ? disconnectWallet : connectWallet} 
              title={account ? `Connected: ${account} (Click to disconnect)` : 'Connect Wallet'}
              className={`h-[44px] px-[16px] sm:h-[56px] sm:px-[28px] text-[13px] sm:text-[16px] font-[400] rounded-full flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_8px_24px_rgba(176,150,250,0.2)] ${isNavDark ? 'bg-[#EAE4FF] text-[#101014] hover:bg-white' : 'bg-[#2D264B] text-white hover:bg-[#3C315B]'}`}
            >
              {account ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Connected</span>
                </>
              ) : (
                <span>Connect</span>
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`w-[44px] h-[44px] rounded-full flex md:hidden items-center justify-center transition-colors duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.02)] ${isNavDark ? 'bg-[#241C40] text-white' : 'bg-white text-[#101014]'}`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="absolute top-[68px] left-0 right-0 p-4 bg-[#101014]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex flex-col gap-2 text-white z-50 md:hidden animate-in fade-in slide-in-from-top-3 duration-200">
              <button 
                onClick={() => { navigate('/'); setMobileMenuOpen(false); }} 
                className="text-left px-4 py-3 rounded-2xl hover:bg-white/10 text-[15px] font-semibold flex items-center justify-between"
              >
                <span>Home</span>
                <span className="text-white/40">●</span>
              </button>
              <button 
                onClick={() => { navigate('/features'); setMobileMenuOpen(false); }} 
                className="text-left px-4 py-3 rounded-2xl hover:bg-white/10 text-[15px] text-white/80"
              >
                Features
              </button>
              <button 
                onClick={() => { navigate('/developers'); setMobileMenuOpen(false); }} 
                className="text-left px-4 py-3 rounded-2xl hover:bg-white/10 text-[15px] text-white/80"
              >
                Developers
              </button>
              <button 
                onClick={() => { navigate('/support'); setMobileMenuOpen(false); }} 
                className="text-left px-4 py-3 rounded-2xl hover:bg-white/10 text-[15px] text-white/80"
              >
                Support
              </button>
              <button 
                onClick={() => { navigate('/public-verify'); setMobileMenuOpen(false); }} 
                className="text-left px-4 py-3 rounded-2xl bg-[#EAE4FF]/10 text-[#C4B9F5] text-[15px] font-medium flex items-center justify-between"
              >
                <span>Public Verifier</span>
                <span>↗</span>
              </button>
              {Boolean(account && (isAdmin || isIssuer)) && (
                <button 
                  onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }} 
                  className="text-left px-4 py-3 rounded-2xl bg-[#7053AD]/30 text-[#EAE4FF] text-[15px] font-semibold flex items-center justify-between"
                >
                  <span>Admin Dashboard</span>
                  <span>→</span>
                </button>
              )}
              {Boolean(account && !isAdmin && !isIssuer) && (
                <button 
                  onClick={() => { navigate('/student-dashboard'); setMobileMenuOpen(false); }} 
                  className="text-left px-4 py-3 rounded-2xl bg-[#7053AD]/30 text-[#EAE4FF] text-[15px] font-semibold flex items-center justify-between"
                >
                  <span>Student Dashboard</span>
                  <span>→</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* NORMAL HERO SECTION (Massive rounded box that scrolls away naturally) */}
      <div className="w-full flex justify-center pt-[120px] pb-[32px] pl-[24px] pr-[28px] lg:pl-[48px] lg:pr-[60px] relative z-20 bg-[#F4F3FF]">
        <div className="w-full max-w-[1440px] min-h-[750px] lg:min-h-[820px] py-[120px] bg-[#101014] rounded-[24px] lg:rounded-[32px] relative overflow-hidden flex flex-col items-center justify-center text-center shadow-[0_25px_80px_rgba(22,16,40,0.25)]">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0">
            <source src="/hero-background.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/30 z-0 pointer-events-none" />

          {/* Text Container: -mt to push it slightly up from true center */}
          <div className="relative z-10 flex flex-col items-center -mt-[64px]">
            <h2 className="text-[18px] text-white/90 font-[600] tracking-wide mb-[24px]">
              Where the world verifies
            </h2>
            <h1 className="text-[clamp(40px,6vw,81px)] font-[600] text-white tracking-[-0.02em] leading-[1.25] mb-[48px] max-w-[1000px]">
              Your home for verifying<br />credentials, records,<br />and more
            </h1>
            <button 
              onClick={() => navigate('/public-verify')}
              className="inline-flex items-center justify-center gap-[14px] px-[40px] h-[72px] bg-[#E4DDFD] hover:bg-[#D5C9FC] text-[#101014] text-[20px] font-[500] rounded-full transition-all duration-300 hover:scale-105 active:scale-[0.96]"
            >
              <Smartphone size={28} strokeWidth={2.5} />
              Verify TokCred
            </button>
          </div>
        </div>
      </div>

      {/* CREDENTIALS HEADLINE — Full screen section */}
      <div ref={headlineRef} className="w-full min-h-[60vh] bg-[#F4F3FF] flex flex-col items-center justify-center text-center px-4 relative z-10 pt-[180px] pb-[80px]">
        <motion.div style={{ y: headlineY }} className="flex flex-col items-center w-full">
          <h2 className="text-[clamp(48px,7.5vw,100px)] font-[500] text-[#2D264B] tracking-[-0.02em] leading-[1.1] max-w-[1000px] text-balance">
            Credentials<br/>you can trust.
          </h2>
          <p className="text-[18px] md:text-[22px] text-[#6B658A] mt-8 max-w-[650px] mx-auto text-balance font-[400] leading-[1.6]">
            One continuous scroll: your credential moves from issued document to cryptographic proof to instant verification.
          </p>
          <button className="mt-10 px-8 py-3.5 bg-[#E4DDFD] hover:bg-[#D5C9FC] text-[#554A82] font-[500] text-[15px] rounded-full transition-transform hover:scale-105 active:scale-95">
            See how it works ↗
          </button>
        </motion.div>
      </div>

      {/* DYNAMIC BACKGROUND WRAPPER (Cards + Security Reveal) */}
      <div 
        ref={dynamicBgRef}
        className={`w-full flex flex-col transition-colors duration-500 ease-in-out ${isPurpleBg ? 'bg-[#322A5A]' : 'bg-[#F4F3FF]'}`}
      >
        {/* CARDS SECTION — Background inherits from dynamic wrapper */}
        <div ref={cardsRef} className="w-full pt-[60px] pb-0 flex flex-col items-center relative z-20">
          <div className="w-full max-w-[1440px] pl-0 pr-[24px] lg:pl-0 lg:pr-[48px] overflow-x-auto hide-scrollbar pb-0 h-[530px] lg:h-[640px]">
            <div className="flex gap-[24px] lg:gap-[32px] w-max relative">
              {/* Small label decoration */}
              <div className="absolute left-[24px] top-[-30px] font-bold text-[12px] bg-white px-4 py-2.5 rounded-full shadow-[0_6px_20px_rgba(55,35,100,0.06)] hidden lg:block z-10">
                ✦ Verification
              </div>
              <TiltCard src="/card1.mp4" />
              <TiltCard src="/card2.mp4" />
              <TiltCard src="/card3.mp4" />
            </div>
          </div>
        </div>

        {/* SECTION 4: Security (Text reveal) */}
        <div 
          ref={darkSectionRef} 
          className="w-full relative z-10 flex flex-col"
        >
          {/* CONTROLLED BY YOU HEADLINE — exactly 100vh, no bleed-through */}
          <div className="w-full h-screen flex flex-col items-center justify-center text-center px-4 relative z-10 pt-[100px]">
            <div className="overflow-hidden w-full flex flex-col items-center">
              <motion.div style={{ clipPath: textClipPath }} className="flex flex-col items-center w-full max-w-[1000px] mx-auto">
              <div className="flex flex-col items-center justify-center text-[clamp(64px,5.8vw,112px)] font-[500] text-[#F4F3FF] tracking-[-0.045em] leading-[1.0] mb-[60px] w-full text-center">
                <div>Controlled by you,</div>
                <div className="flex items-center justify-center gap-[0.18em]">
                  <span>secured</span>
                  <img src="/mascot2.gif" alt="TokCred Mascot" className="w-[120px] h-auto object-contain translate-y-[-0.04em]" />
                  <span>by us</span>
                </div>
              </div>
              <button className="px-10 py-5 bg-[#EAE4FF] hover:bg-white text-[#322A5A] font-semibold text-[20px] rounded-full transition-transform hover:scale-105 active:scale-95 flex items-center gap-3">
                See more ↗
              </button>
              </motion.div>
            </div>

            {/* "Your security" pill badge — bottom-left corner */}
            <div className="absolute bottom-2 left-[16px] lg:left-[40px] flex items-center gap-4 bg-[#2D2550] hover:bg-[#3a3168] transition-colors duration-200 px-8 py-5 rounded-full cursor-pointer">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#C4B9F5]">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
              <span className="text-[#E8E0FF] font-[500] text-[22px] tracking-[-0.01em]">Your security</span>
            </div>
          </div>
        </div>
      </div>
      {/* SECURITY CARDS GRID — outside the dynamic bg wrapper, enters viewport after purple stage */}
      <div ref={securityCardsRef} className={`w-full transition-colors duration-700 ease-in-out ${isCtaBg ? 'bg-[#B3A4F8]' : 'bg-[#322A5A]'}`}>
        <section className="w-full max-w-[1440px] mx-auto px-6 pt-16 pb-32 relative z-20">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              <motion.div variants={fadeUpVariant} className="bg-white rounded-[40px] p-10 md:p-16 h-[500px] flex flex-col justify-between shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-gray-100 hover:-translate-y-2 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                <Lock size={64} className="text-[#101014]" />
                <h3 className="text-[36px] font-bold text-[#101014] leading-[1.1] max-w-sm text-balance">Self-custodial means you control your data. We never have access.</h3>
              </motion.div>
              <motion.div variants={fadeUpVariant} className="bg-[#2D264B] rounded-[40px] p-10 md:p-16 h-[500px] flex flex-col justify-between text-white shadow-xl border border-gray-800 hover:-translate-y-2 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                <ShieldCheck size={64} className="text-white" />
                <h3 className="text-[36px] font-bold leading-[1.1] max-w-sm text-balance">Scam detection flags malicious issuers instantly.</h3>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </div>
      {/* SECTION 5: CTA */}
      <section className="w-full bg-[#B3A4F8] min-h-screen text-center flex flex-col items-center pt-[28vh] px-6 pb-[160px]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: phantomEase }}
            className="w-full max-w-[1200px] flex flex-col items-center mx-auto"
          >
            <p className="text-[18px] sm:text-[20px] text-[#4A3D7A] font-medium mb-[36px] text-center leading-[1.35]">
              Built on cryptographic trust.<br/>Secure, verifiable, and entirely yours.
            </p>
            <div className="font-[500] text-[#2D264B] leading-[0.96] tracking-[-0.055em] mb-[72px] text-center w-full" style={{ fontSize: 'clamp(72px, 6.2vw, 112px)' }}>
              <div>Get started.</div>
              <div className="flex items-center justify-center gap-[0.4em] flex-nowrap whitespace-nowrap mt-[0.3em]">
                <span>Download</span>
                <img src="/mascot2.gif" alt="TokCred" className="h-[0.85em] w-auto object-contain translate-y-[-0.02em]" />
                <span>TokCred.</span>
              </div>
            </div>
            <div className="flex flex-col items-center" ref={qrBtnRef}>
              <button 
                onClick={() => {
                  const next = !isQRModalOpen;
                  setIsQRModalOpen(next);
                  if (next) {
                    setTimeout(() => {
                      qrCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 50);
                  }
                }}
                className="inline-flex items-center justify-center gap-[12px] h-[84px] px-[32px] border-none outline-none bg-white text-[#2D264B] text-[20px] font-medium rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] active:scale-[0.98] shadow-none hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
              >
                <Smartphone size={26} strokeWidth={1.5} /> Download TokCred
              </button>

              {isQRModalOpen && (
                <div
                  ref={qrCardRef}
                  className="mt-6 bg-white rounded-[25px] pt-[2px] px-[2px] pb-[25px] shadow-[0_20px_60px_rgba(45,38,75,0.15)] flex flex-col items-center w-[200px]"
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  <div style={{ backgroundColor: 'white', padding: '0px', borderRadius: '16px', marginBottom: '12px' }}>
                    <div ref={qrCodeContainerRef} />
                  </div>
                  <p className="text-[#3C315B] text-[15px] font-[500] text-center leading-[1.4] tracking-tight m-0">
                    Scan the QR to<br/>download the app to<br/>your phone
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </section>

    </div>
    </>
  );
};

export default Home;
