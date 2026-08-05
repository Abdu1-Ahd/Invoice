import React from 'react';
import { useAuthStore } from './store/auth.store';
import { Typography } from '@/shared/components/Typography';
import { Button } from '@/shared/components/Button';
import { Navigate } from 'react-router-dom';
import { PageSkeleton } from '@/shared/components/PageSkeleton';

export const AuthPage: React.FC = () => {
  const { signInWithGoogle, isAuthenticated, isInitializing } = useAuthStore();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <PageSkeleton loading={true} className="w-full max-w-md">
          <div className="bg-surface p-8 rounded-2xl border border-border-subtle shadow-sm text-center space-y-6">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-muted rounded-full mb-4" />
              <div className="h-8 w-48 bg-muted rounded mb-2" />
              <div className="h-4 w-64 bg-muted/60 rounded" />
            </div>
            <div className="pt-4">
              <div className="h-12 w-full bg-muted rounded-lg" />
            </div>
            <div className="h-3 w-56 bg-muted/40 rounded mx-auto mt-4" />
          </div>
        </PageSkeleton>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-border-subtle shadow-sm text-center space-y-6">
        <div className="flex flex-col items-center">
          <img src="/assets/icon.png" alt="Ledgerly Logo" className="h-16 w-16 object-contain mb-4" />
          <Typography variant="h1" className="mb-2">Welcome to Ledgerly</Typography>
          <Typography variant="body" className="text-muted-foreground">Sign in to sync your financial platform data across devices.</Typography>
        </div>

        <div className="pt-4">
          <Button variant="primary" size="lg" className="w-full text-lg" onClick={signInWithGoogle}>
            Sign in with Google
          </Button>
        </div>
        
        <Typography variant="caption" className="text-muted-foreground mt-4 block">
          Your offline data will automatically be synced to the cloud.
        </Typography>
      </div>
    </div>
  );
};
