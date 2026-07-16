import React from 'react';
import { Typography } from '@/shared/components/Typography';

export const DashboardPage: React.FC = () => {
  return (
    <div className="p-8 space-y-6">
      <Typography variant="h1">Dashboard</Typography>
      <div className="p-6 bg-surface rounded-xl shadow-sm border border-border-subtle">
        <Typography variant="body" className="text-muted-foreground">
          Welcome to your new workspace. Create an invoice to see your metrics come alive.
        </Typography>
      </div>
    </div>
  );
};
