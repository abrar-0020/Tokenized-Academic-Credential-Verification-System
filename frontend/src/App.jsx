import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <ThemeProvider>
    <Web3Provider>
      <Router>
        <div className="flex flex-col min-h-screen w-full" style={{ overflowX: 'hidden', position: 'relative' }}>
          <Navbar />
          <main className="flex-grow w-full overflow-x-hidden">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/issue" element={<IssueCredential />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/verify" element={<VerifyCredential />} />
              <Route path="/public-verify" element={<PublicVerify />} />
            </Routes>
          </main>
          <Footer />
          <ConnectionDebug />
        </div>
      </Router>
    </Web3Provider>
    </ThemeProvider>
  );
}

export default App;
