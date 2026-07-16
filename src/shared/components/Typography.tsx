import React from 'react';
import { cn } from '@/shared/utils/cn';

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  as?: React.ElementType;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  as,
  className,
  children,
  ...props
}) => {
  const Component = as || (
    variant === 'h1' ? 'h1' :
    variant === 'h2' ? 'h2' :
    variant === 'h3' ? 'h3' :
    variant === 'caption' ? 'span' : 'p'
  );

  const variants = {
    h1: 'text-3xl font-bold tracking-tight text-foreground',
    h2: 'text-2xl font-semibold tracking-tight text-foreground',
    h3: 'text-xl font-semibold tracking-tight text-foreground',
    body: 'text-base text-foreground leading-relaxed',
    caption: 'text-sm text-muted-foreground',
  };

  return (
    <Component className={cn(variants[variant], className)} {...props}>
      {children}
    </Component>
  );
};
