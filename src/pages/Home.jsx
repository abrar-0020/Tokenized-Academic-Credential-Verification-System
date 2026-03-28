import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { PortfolioPage } from '@/components/ui/starfall-portfolio-landing';
import HorizontalDock from '@/components/ui/horizontal-dock';
import SettingsDropdown from '@/components/SettingsDropdown';
import { Home as HomeIcon, LayoutDashboard, FileText, CheckCircle, Eye, Clock } from 'lucide-react';

const Home = () => {
  const { account, connectWallet, disconnectWallet, isAdmin, isIssuer, networkId, loading } = useWeb3();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', label: 'Home', icon: 'home' },
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/issue', label: 'Issue Credential', icon: 'verified_user' },
    { to: '/verify', label: 'Verify Credentials', icon: 'verified' },
    { to: '/public-verify', label: 'Public Verify', icon: 'public' },
    { to: '/history', label: 'History', icon: 'history' },
  ];

  const iconMap = {
    home: HomeIcon,
    dashboard: LayoutDashboard,
    verified_user: FileText,
    verified: CheckCircle,
    public: Eye,
    history: Clock,
  };

  const visibleNavItems = navItems.filter((item) => {
    if (item.to === '/dashboard') return Boolean(account);
    if (item.to === '/issue') return Boolean(account && isAdmin);
    if (item.to === '/history') return Boolean(account && (isAdmin || isIssuer));
    return true;
  });

  const dockItems = visibleNavItems.map((item) => ({
    icon: iconMap[item.icon],
    label: item.label,
    onClick: () => navigate(item.to),
  }));

  const homeData = {
    logo: {
      initials: 'SL',
      name: 'Scholar Ledger',
    },
    navLinks: [
      { label: 'About', href: '#about' },
      { label: 'Features', href: '#projects' },
      { label: 'Network', href: '#skills' },
    ],
    resume: {
      label: account ? 'Wallet Connected' : 'Connect Wallet',
      onClick: () => {
        if (!account) connectWallet();
      },
    },
    hero: {
      titleLine1: 'Tokenized Academic',
      titleLine2Gradient: 'Credentials',
      subtitle:
        'A decentralized infrastructure for institutions to issue credentials and for anyone to verify authenticity instantly.',
    },
    ctaButtons: {
      primary: {
        label: 'Public Verify',
        onClick: () => navigate('/public-verify'),
      },
      secondary: {
        label: 'Dashboard',
        onClick: () => navigate('/dashboard'),
      },
    },
    stats: [
      { value: 'Immutable', label: 'Ledger-backed Proofs' },
      { value: 'Role-Aware', label: 'Admin and Issuer Controls' },
      { value: 'Global', label: 'Open Public Verification' },
    ],
  };

  return (
    <div className="w-full min-h-screen bg-[#0e0e0e]">
      {/* Header with Navigation */}
      <header className="fixed top-0 right-0 left-0 z-30 bg-[#0e0e0e]/85 backdrop-blur-md border-b border-[#1f2020]/30">
        <div className="flex justify-between items-center px-8 py-4 w-full">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold tracking-tighter text-[#c6c6c7] font-headline">The Scholar Ledger</h2>
          </div>

          <div className="flex items-center gap-4">
            <HorizontalDock items={dockItems} className="flex-1 justify-center" />
            <SettingsDropdown 
              account={account}
              isAdmin={isAdmin}
              isIssuer={isIssuer}
              networkId={networkId}
              connectWallet={connectWallet}
              disconnectWallet={disconnectWallet}
              loading={loading}
            />
          </div>
        </div>
      </header>

      {/* Full-width Hero */}
      <div className="relative w-full pt-20">
        <PortfolioPage
          {...homeData}
          showAnimatedBackground
          hideInternalNav
        />
      </div>
    </div>
  );
};

export default Home;
