import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Users, FileText, Settings, LogOut, ChevronLeft } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useSyncWorker } from '@/features/sync/useSyncWorker';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { cn } from '@/shared/utils/cn';
import { motion } from 'framer-motion';
import { activeNavIndicatorTransition } from '@/shared/config/animations';

export const Layout: React.FC = () => {
  const { signOut } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  useSyncWorker();

  return (
    <div className="flex h-screen h-[100dvh] w-full bg-muted overflow-hidden safe-top-padding md:pt-0">
      {/* Desktop Sidebar with Sliding Animation */}
      <aside
        className={cn(
          'hidden flex-col border-r border-border bg-surface transition-all duration-300 ease-in-out relative md:flex z-20',
          isCollapsed ? 'w-20' : 'w-52'
        )}
      >
        {/* Sidebar Header & Border-Centered Toggle Button */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4 relative">
          <div className="flex items-center gap-3 overflow-hidden">
            <img src="/assets/icon.png" alt="Ledgerly" className="h-8 w-8 object-contain flex-shrink-0" />
            {!isCollapsed && <span className="text-lg font-bold text-text-primary truncate tracking-tight">Ledgerly</span>}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-text-muted hover:text-text-primary hover:bg-muted transition-colors shadow-md focus:outline-none z-30"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="flex items-center justify-center">
              <ChevronLeft className="h-4 w-4" />
            </motion.div>
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
      <main className="flex-1 overflow-y-auto bg-muted flex flex-col pb-32 safe-bottom-content md:pb-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 z-50 flex w-full border-t border-border bg-surface md:hidden shadow-lg safe-bottom-nav">
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
      'relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 group',
      active
        ? 'text-primary-foreground'
        : 'text-text-secondary hover:text-text-primary',
      isCollapsed && 'justify-center px-0'
    )}
  >
    {active && (
      <motion.div
        layoutId="activeSidebarNav"
        className="absolute inset-0 bg-primary shadow-sm rounded-md"
        transition={activeNavIndicatorTransition}
        style={{ zIndex: 0 }}
      />
    )}
    {!active && (
      <div className="absolute inset-0 bg-surface opacity-0 group-hover:opacity-100 rounded-md transition-opacity duration-200" style={{ zIndex: 0 }} />
    )}
    <motion.div 
      className="relative z-10 flex items-center gap-3 w-full"
      whileHover={{ x: isCollapsed ? 0 : 4 }}
      transition={{ duration: 0.2 }}
      style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
    >
      {icon}
      {!isCollapsed && <span className="truncate">{label}</span>}
    </motion.div>
  </Link>
);

const MobileNavItem = ({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active: boolean }) => (
  <Link
    to={to}
    className={cn(
      'relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors',
      active ? 'text-primary font-bold' : 'text-text-muted hover:text-text-primary'
    )}
  >
    {active && (
      <motion.div
        layoutId="activeMobileNav"
        className="absolute top-0 w-8 h-1 rounded-b-full bg-primary"
        transition={activeNavIndicatorTransition}
      />
    )}
    <motion.div animate={active ? { y: -2, scale: 1.1 } : { y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
      {icon}
    </motion.div>
    <span>{label}</span>
  </Link>
);
