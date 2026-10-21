import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { Web3Provider } from './context/Web3Context';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import ConnectionDebug from './components/ConnectionDebug';
import Home from './pages/Home';
import IssueCredential from './pages/IssueCredential';
import Dashboard from './pages/Dashboard';
import VerifyCredential from './pages/VerifyCredential';
import PublicVerify from './pages/PublicVerify';
import History from './pages/History';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Features from './pages/Features';
import Developers from './pages/Developers';
import Support from './pages/Support';
import StudentDashboard from './pages/StudentDashboard';

const IntroLoader = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0f172a] flex items-center justify-center overflow-hidden">
      <video 
        className="absolute w-full h-full object-cover"
        autoPlay 
        muted 
        playsInline 
        onEnded={onComplete}
        onError={onComplete}
      >
        <source src="/loading-animation.mp4" type="video/mp4" />
      </video>
    </div>
  );
};

const obsidianRoutes = ['/', '/dashboard', '/student-dashboard', '/issue', '/verify', '/public-verify', '/history', '/privacy', '/terms', '/features'];

const AppLayout = () => {
  const location = useLocation();
  const currentPath = location.pathname.endsWith('/') && location.pathname !== '/' ? location.pathname.slice(0, -1) : location.pathname;
  const isCustomNavRoute = ['/', '/dashboard', '/student-dashboard', '/issue', '/features', '/public-verify', '/developers', '/support', '/history', '/privacy', '/terms'].includes(currentPath);

  return (
    <div className="flex flex-col min-h-screen w-full relative">
      {!isCustomNavRoute && <Navbar />}
      <main className="flex-grow w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/issue" element={<IssueCredential />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/verify" element={<VerifyCredential />} />
          <Route path="/public-verify" element={<PublicVerify />} />
          <Route path="/history" element={<History />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/features" element={<Features />} />
          <Route path="/developers" element={<Developers />} />
          <Route path="/support" element={<Support />} />
        </Routes>
      </main>
      <Footer />

      <ConnectionDebug />
    </div>
  );
};

function App() {
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/') return false;
    return !sessionStorage.getItem('introPlayed');
  });

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  const handleIntroComplete = () => {
    sessionStorage.setItem('introPlayed', 'true');
    setShowIntro(false);
  };

  return (
    <ThemeProvider>
    <Web3Provider>
      {showIntro ? (
        <IntroLoader onComplete={handleIntroComplete} />
      ) : (
        <Router>
          <AppLayout />
        </Router>
      )}
    </Web3Provider>
    </ThemeProvider>
  );
}

export default App;
