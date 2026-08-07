import React from 'react';
import { cn } from '@/shared/utils/cn';
import { useStatusPrototype } from '@/shared/utils/statusBadge';
import { motion } from 'framer-motion';
import { badgePop } from '@/shared/config/animations';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const { prototype } = useStatusPrototype();
  const styleClass = prototype.styles[status] || 'bg-muted text-text-muted';

  return (
    <motion.span
      variants={badgePop}
      initial="hidden"
      animate="visible"
      className={cn(
        'inline-flex items-center justify-center text-center px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider leading-none shrink-0 select-none',
        styleClass,
        status === 'OVERDUE' && 'animate-pulse shadow-sm', // Overdue pulse aura
        className
      )}
    >
      {status}
    </motion.span>
  );
};
