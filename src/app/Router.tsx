import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/shared/components/Layout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';

import { CustomersPage } from '@/features/customers/CustomersPage';
import { InvoicesPage } from '@/features/invoices/InvoicesPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { ReportsPage } from '@/features/reports/ReportsPage';
import { AuthPage } from '@/features/auth/AuthPage';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Typography } from '@/shared/components/Typography';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isInitializing } = useAuthStore();

  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Typography variant="body" className="animate-pulse">Loading application...</Typography></div>;
  }

  return isAuthenticated ? children : <Navigate to="/auth" />;
};

export const Router: React.FC = () => {
  return (
    <BrowserRouter>
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
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
