import React, { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/shared/components/Layout';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { PageSkeleton } from '@/shared/components/PageSkeleton';
import { SplashScreen } from '@/shared/components/SplashScreen';
import { Typography } from '@/shared/components/Typography';

const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const CustomersPage = lazy(() => import('@/features/customers/CustomersPage').then(m => ({ default: m.CustomersPage })));
const InvoicesPage = lazy(() => import('@/features/invoices/InvoicesPage').then(m => ({ default: m.InvoicesPage })));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const AuthPage = lazy(() => import('@/features/auth/AuthPage').then(m => ({ default: m.AuthPage })));

const PageLoader = () => (
  <div className="w-full p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
    <PageSkeleton loading={true}>
      <div className="space-y-6">
        <Typography variant="h1">Loading Page</Typography>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-surface p-4 sm:p-5 rounded-xl border border-border shadow-sm flex items-center gap-3.5">
              <div className="p-3 rounded-full bg-muted flex-shrink-0 w-11 h-11" />
              <div className="space-y-1 flex-1 min-w-0">
                <Typography variant="caption" className="text-text-muted uppercase font-bold tracking-wider text-xs block">Loading</Typography>
                <Typography variant="h2" className="text-lg font-bold text-text-primary block">Rs. 00,000</Typography>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-surface rounded-xl border border-border p-6 space-y-4 min-h-[300px]">
          <Typography variant="h3">Loading Content</Typography>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex justify-between items-center border-b border-border pb-3 last:border-0 last:pb-0 gap-2">
              <div>
                <Typography variant="body" className="font-medium text-text-primary">INV-0000{i}</Typography>
                <Typography variant="caption" className="text-text-muted block">Loading Customer Name</Typography>
              </div>
              <div className="text-right">
                <Typography variant="body" className="font-bold text-text-primary">$0,000.00</Typography>
                <Typography variant="caption" className="text-text-muted block">Draft</Typography>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageSkeleton>
  </div>
);

const SplashOverlay = () => {
  const { isAuthenticated, isInitializing, setSplashFinished } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);
  const [targetProgress, setTargetProgress] = useState(0);
  const [statusText, setStatusText] = useState('INITIALIZING WORKSPACE...');

  React.useEffect(() => {
    let isMounted = true;

    const runInit = async () => {
      if (isInitializing) {
        setTargetProgress(30);
        setStatusText('VERIFYING AUTHENTICATION...');
        return;
      }

      if (!isAuthenticated) {
        setTargetProgress(100);
        setStatusText('LAUNCHING APP...');
        return;
      }

      // Authenticated User Flow
      setTargetProgress(60);
      setStatusText('LOADING INDEXEDDB VAULT...');

      try {
        const { getDB } = await import('@/core/storage/db');
        await getDB();
        
        if (!isMounted) return;
        setTargetProgress(85);
        setStatusText('SYNCHRONIZING WORKSPACE...');

        // Brief yield for other sync processes
        await new Promise(res => setTimeout(res, 100));

        if (!isMounted) return;
        setTargetProgress(100);
        setStatusText('LAUNCHING DASHBOARD...');
      } catch (e) {
        console.error("Init error", e);
        if (isMounted) {
          setTargetProgress(100);
          setStatusText('LAUNCHING DASHBOARD...');
        }
      }
    };

    runInit();

    return () => { isMounted = false; };
  }, [isInitializing, isAuthenticated]);

  React.useEffect(() => {
    if (isAuthenticated) {
      setShowSplash(true);
      setSplashFinished(false);
      // It will reset progress because isInitializing is false, but we need target progress to be accurate
    }
  }, [isAuthenticated, setSplashFinished]);

  if (!showSplash) {
    return null;
  }

  return (
    <SplashScreen 
      targetProgress={targetProgress}
      statusText={statusText}
      onExitStart={() => {
        setSplashFinished(true);
      }}
      onComplete={() => {
        setShowSplash(false);
      }} 
    />
  );
};

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isInitializing } = useAuthStore();

  if (!isInitializing && !isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{!isInitializing && isAuthenticated && children}</>;
};

export const Router: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SplashOverlay />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
};
