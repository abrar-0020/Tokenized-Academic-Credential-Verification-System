import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import { SkeletonDemo } from '@/components/ui/demo';

const obsidianRoutes = ['/', '/dashboard', '/issue', '/verify', '/public-verify', '/history', '/privacy', '/terms'];

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
      <ConnectionDebug />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
    <Web3Provider>
      <Router>
        <AppLayout />
      </Router>
    </Web3Provider>
    </ThemeProvider>
  );
}
export default App;
