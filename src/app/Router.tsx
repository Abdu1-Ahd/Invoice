import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/shared/components/Layout';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { PageSkeleton } from '@/shared/components/PageSkeleton';

const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const CustomersPage = lazy(() => import('@/features/customers/CustomersPage').then(m => ({ default: m.CustomersPage })));
const InvoicesPage = lazy(() => import('@/features/invoices/InvoicesPage').then(m => ({ default: m.InvoicesPage })));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const AuthPage = lazy(() => import('@/features/auth/AuthPage').then(m => ({ default: m.AuthPage })));

const PageLoader = () => (
  <div className="w-full p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
    <PageSkeleton loading={true}>
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="h-24 bg-surface rounded-xl border border-border" />
          <div className="h-24 bg-surface rounded-xl border border-border" />
          <div className="h-24 bg-surface rounded-xl border border-border" />
          <div className="h-24 bg-surface rounded-xl border border-border" />
        </div>
        <div className="h-64 bg-surface rounded-xl border border-border" />
      </div>
    </PageSkeleton>
  </div>
);

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isInitializing } = useAuthStore();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <PageSkeleton loading={true} className="w-full max-w-4xl">
          <div className="h-96 bg-surface rounded-2xl border border-border p-8 shadow-sm w-full" />
        </PageSkeleton>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/auth" />;
};

export const Router: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
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
