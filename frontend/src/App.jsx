import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Web3Provider } from './context/Web3Context';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import GetAppButton from './components/GetAppButton';
import ConnectionDebug from './components/ConnectionDebug';
import Home from './pages/Home';
import IssueCredential from './pages/IssueCredential';
import Dashboard from './pages/Dashboard';
import VerifyCredential from './pages/VerifyCredential';
import PublicVerify from './pages/PublicVerify';
import History from './pages/History';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import { SkeletonDemo } from '@/components/ui/demo';

const obsidianRoutes = ['/', '/dashboard', '/issue', '/verify', '/public-verify', '/history', '/privacy', '/terms'];

const SplashLoader = ({ onFinished }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Play the full animation cycle (3.2s), then start fade out
    const fadeTimer = setTimeout(() => setFadeOut(true), 4000);
    // After fade completes (0.5s transition), signal done
    const doneTimer = setTimeout(() => onFinished(), 4500);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinished]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
        transition: 'opacity 0.5s ease-out',
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? 'none' : 'all',
      }}
    >
      <div className="loader">
        <div className="box box0"><div><div></div></div></div>
        <div className="box box1"><div><div></div></div></div>
        <div className="box box2"><div><div></div></div></div>
        <div className="box box3"><div><div></div></div></div>
        <div className="box box4"><div><div></div></div></div>
        <div className="box box5"><div><div></div></div></div>
        <div className="box box6"><div><div></div></div></div>
        <div className="box box7"><div><div></div></div></div>
        <div className="ground"><div></div></div>
      </div>
    </div>
  );
};

const AppLayout = () => {
  const location = useLocation();
  const isObsidianRoute = obsidianRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen w-full" style={{ overflowX: 'hidden', position: 'relative' }}>
      {!isObsidianRoute && <Navbar />}
      <main className="flex-grow w-full overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/issue" element={<IssueCredential />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/verify" element={<VerifyCredential />} />
          <Route path="/public-verify" element={<PublicVerify />} />
          <Route path="/history" element={<History />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/skeleton" element={<SkeletonDemo />} />
        </Routes>
      </main>
      <Footer />
      <GetAppButton />
      <ConnectionDebug />
    </div>
  );
};

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <ThemeProvider>
    <Web3Provider>
      {loading && <SplashLoader onFinished={() => setLoading(false)} />}
      <Router>
        <AppLayout />
      </Router>
    </Web3Provider>
    </ThemeProvider>
  );
}
export default App;
