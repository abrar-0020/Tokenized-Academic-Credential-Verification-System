import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './context/Web3Context';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import InstallPWA from './components/InstallPWA';
import MobileWalletHelper from './components/MobileWalletHelper';
import ConnectionDebug from './components/ConnectionDebug';
import Home from './pages/Home';
import IssueCredential from './pages/IssueCredential';
import Dashboard from './pages/Dashboard';
import VerifyCredential from './pages/VerifyCredential';

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/issue" element={<IssueCredential />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/verify" element={<VerifyCredential />} />
            </Routes>
          </main>
          <Footer />
          <InstallPWA />
          <MobileWalletHelper />
          <ConnectionDebug />
        </div>
      </Router>
    </Web3Provider>
  );
}

export default App;
