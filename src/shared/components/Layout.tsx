import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Home, Users, FileText, Settings, PieChart, LogOut } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useSyncWorker } from '@/features/sync/useSyncWorker';
import { SyncStatusIndicator } from './SyncStatusIndicator';

export const Layout: React.FC = () => {
  const { signOut } = useAuthStore();
  useSyncWorker();

  return (
    <div className="flex h-screen w-full bg-muted">
      {/* Sidebar for Desktop */}
      <aside className="hidden w-64 flex-col border-r border-border-subtle bg-surface md:flex">
        <div className="flex h-14 items-center border-b border-border-subtle px-4">
          <span className="text-lg font-bold">Invoice App</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <NavItem to="/" icon={<Home className="w-5 h-5" />} label="Dashboard" />
          <NavItem to="/customers" icon={<Users className="w-5 h-5" />} label="Customers" />
          <NavItem to="/invoices" icon={<FileText className="w-5 h-5" />} label="Invoices" />
          <NavItem to="/reports" icon={<PieChart className="w-5 h-5" />} label="Reports" />
        </nav>
        <div className="p-4 border-t border-border-subtle">
          <NavItem to="/settings" icon={<Settings className="w-5 h-5" />} label="Settings" />
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger mt-2"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
          
          <div className="mt-6">
            <SyncStatusIndicator />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-muted">
        <Outlet />
      </main>

      {/* Mobile Tab Bar */}
      <nav className="fixed bottom-0 z-50 flex w-full border-t border-border-subtle bg-surface md:hidden">
        <MobileNavItem to="/" icon={<Home className="w-5 h-5" />} label="Home" />
        <MobileNavItem to="/invoices" icon={<FileText className="w-5 h-5" />} label="Invoices" />
        <MobileNavItem to="/customers" icon={<Users className="w-5 h-5" />} label="Customers" />
        <MobileNavItem to="/settings" icon={<Settings className="w-5 h-5" />} label="Settings" />
      </nav>
    </div>
  );
};

const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <Link
    to={to}
    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
  >
    {icon}
    {label}
  </Link>
);

const MobileNavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <Link
    to={to}
    className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium text-muted-foreground hover:text-foreground"
  >
    {icon}
    <span>{label}</span>
  </Link>
);
