import { useLocation, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import HorizontalDock from '@/components/ui/horizontal-dock';
import SettingsDropdown from '@/components/SettingsDropdown';
import { Home, LayoutDashboard, FileText, CheckCircle, Eye, Clock } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/issue', label: 'Issue Credential', icon: 'verified_user' },
  { to: '/verify', label: 'Verify Credentials', icon: 'verified' },
  { to: '/public-verify', label: 'Public Verify', icon: 'public' },
  { to: '/history', label: 'History', icon: 'history' },
];

const iconMap = {
  home: Home,
  dashboard: LayoutDashboard,
  verified_user: FileText,
  verified: CheckCircle,
  public: Eye,
  history: Clock,
};

const ObsidianShell = ({ title, subtitle, children }) => {
  const { account, isAdmin, isIssuer, networkId, connectWallet, disconnectWallet, loading } = useWeb3();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  
  const visibleNavItems = navItems.filter((item) => {
    if (item.to === '/dashboard') return Boolean(account);
    if (item.to === '/issue') return Boolean(account && isAdmin);
    if (item.to === '/history') return Boolean(account && (isAdmin || isIssuer));
    return true;
  });

  // Create dock items with proper icons for top navigation
  const dockItems = visibleNavItems.map((item) => ({
    icon: iconMap[item.icon],
    label: item.label,
    onClick: () => {
      navigate(item.to);
    }
  }));

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-[#e7e5e4] font-body">
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
            {pathname === '/verify' && (
              <span className="hidden md:inline text-[10px] uppercase tracking-[0.2em] text-[#8197ff] font-bold">Verify Mode</span>
            )}
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4 md:px-8 min-h-screen bg-[#0e0e0e]">
        {(title || subtitle) && (
          <section className="max-w-7xl mx-auto mb-10">
            {subtitle && <p className="text-[#8197ff] font-headline font-semibold text-sm tracking-[0.3em] uppercase mb-3">{subtitle}</p>}
            {title && <h2 className="text-4xl md:text-5xl font-headline font-bold text-[#c6c6c7] tracking-tight">{title}</h2>}
          </section>
        )}
        {children}
      </main>
    </div>
  );
};

export default ObsidianShell;