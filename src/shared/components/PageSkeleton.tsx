import React from 'react';
import { AutoSkeleton } from 'auto-skeleton-react';
import { cn } from '@/shared/utils/cn';

export interface PageSkeletonProps {
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  animation?: 'shimmer' | 'pulse' | 'none';
}

export const PageSkeleton: React.FC<PageSkeletonProps> = ({
  loading = false,
  children,
  className,
  animation = 'shimmer',
}) => {
  return (
    <div className={cn('w-full min-h-0 relative', className)}>
      <AutoSkeleton
        loading={loading}
        config={{
          animation,
        }}
      >
        {children}
      </AutoSkeleton>
    </div>
  );
};
