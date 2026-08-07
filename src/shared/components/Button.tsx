import React from 'react';
import { cn } from '@/shared/utils/cn';
import { motion } from 'framer-motion';
import { buttonHoverTap, buttonDangerTap, buttonSecondaryHover } from '@/shared/config/animations';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    // Note: removing native active:scale since framer-motion handles it
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: 'bg-primary text-primary-foreground hover:opacity-90 focus-visible:ring-primary',
      secondary: 'bg-secondary text-text-primary hover:opacity-90 focus-visible:ring-secondary',
      danger: 'bg-danger text-danger-foreground hover:opacity-90 focus-visible:ring-danger',
      ghost: 'hover:bg-muted hover:text-text-primary text-text-muted',
    };

    const sizes = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-11 px-8',
    };

    const hoverTapProps = 
      variant === 'danger' ? buttonDangerTap : 
      variant === 'secondary' || variant === 'ghost' ? buttonSecondaryHover : 
      buttonHoverTap;

    return (
      <motion.button
        ref={ref as any}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        whileHover={hoverTapProps.hover}
        whileTap={hoverTapProps.tap}
        {...(props as any)}
      >
        {isLoading ? (
          <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
