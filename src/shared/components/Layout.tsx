import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Users, FileText, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useSyncWorker } from '@/features/sync/useSyncWorker';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { cn } from '@/shared/utils/cn';

export const Layout: React.FC = () => {
  const { signOut } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  useSyncWorker();

  return (
    <div className="flex h-screen w-full bg-muted overflow-hidden">
      {/* Desktop Sidebar with Sliding Animation */}
      <aside
        className={cn(
          'hidden flex-col border-r border-border bg-surface transition-all duration-300 ease-in-out relative md:flex z-20',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Sidebar Header & Border-Centered Toggle Button */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4 relative">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="text-xl">🧾</span>
            {!isCollapsed && <span className="text-lg font-bold text-text-primary truncate">Invoice App</span>}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-text-muted hover:text-text-primary hover:bg-muted transition-colors shadow-md focus:outline-none z-30"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 p-3">
          <NavItem to="/" icon={<Home className="w-5 h-5 flex-shrink-0" />} label="Dashboard" isCollapsed={isCollapsed} active={location.pathname === '/'} />
          <NavItem to="/invoices" icon={<FileText className="w-5 h-5 flex-shrink-0" />} label="Invoices" isCollapsed={isCollapsed} active={location.pathname.startsWith('/invoices')} />
          <NavItem to="/customers" icon={<Users className="w-5 h-5 flex-shrink-0" />} label="Customers" isCollapsed={isCollapsed} active={location.pathname.startsWith('/customers')} />
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-border space-y-2">
          <NavItem to="/settings" icon={<Settings className="w-5 h-5 flex-shrink-0" />} label="Settings" isCollapsed={isCollapsed} active={location.pathname === '/settings'} />
          
          <button
            onClick={signOut}
            className={cn(
              'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-danger/10 hover:text-danger',
              isCollapsed && 'justify-center px-0'
            )}
            title={isCollapsed ? 'Sign Out' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>

          {!isCollapsed && (
            <div className="pt-2">
              <SyncStatusIndicator />
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area with Bottom Padding for Mobile Nav */}
      <main className="flex-1 overflow-y-auto bg-muted pb-28 md:pb-10">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 z-50 flex w-full border-t border-border bg-surface md:hidden shadow-lg">
        <MobileNavItem to="/" icon={<Home className="w-5 h-5" />} label="Home" active={location.pathname === '/'} />
        <MobileNavItem to="/invoices" icon={<FileText className="w-5 h-5" />} label="Invoices" active={location.pathname.startsWith('/invoices')} />
        <MobileNavItem to="/customers" icon={<Users className="w-5 h-5" />} label="Customers" active={location.pathname.startsWith('/customers')} />
        <MobileNavItem to="/settings" icon={<Settings className="w-5 h-5" />} label="Settings" active={location.pathname === '/settings'} />
      </nav>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isCollapsed, active }) => (
  <Link
    to={to}
    title={isCollapsed ? label : undefined}
    className={cn(
      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200',
      active
        ? 'bg-primary text-primary-foreground shadow-sm'
        : 'text-text-secondary hover:bg-surface hover:text-text-primary',
      isCollapsed && 'justify-center px-0'
    )}
  >
    {icon}
    {!isCollapsed && <span className="truncate">{label}</span>}
  </Link>
);

const MobileNavItem = ({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active: boolean }) => (
  <Link
    to={to}
    className={cn(
      'flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors',
      active ? 'text-primary font-bold' : 'text-text-muted hover:text-text-primary'
    )}
  >
    {icon}
    <span>{label}</span>
  </Link>
);
