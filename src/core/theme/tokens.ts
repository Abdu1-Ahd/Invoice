/**
 * Centralized Design System Tokens
 * 
 * This file defines the semantic colors and layout variables used throughout the application.
 * DO NOT hardcode colors (e.g. text-gray-900) in components. 
 * Instead, use semantic tokens (e.g. text-primary, bg-surface).
 * 
 * These tokens map directly to Tailwind CSS variables defined in index.css.
 */

export const themeTokens = {
  colors: {
    // Backgrounds
    background: 'var(--color-background)',
    surface: 'var(--color-surface)',
    card: 'var(--color-card)',

    // Brand / Primary
    primary: 'var(--color-primary)',
    'primary-foreground': 'var(--color-primary-foreground)',
    
    // UI Elements
    border: 'var(--color-border)',
    input: 'var(--color-input)',
    ring: 'var(--color-ring)',

    // Typography
    text: {
      primary: 'var(--color-text-primary)',
      secondary: 'var(--color-text-secondary)',
      muted: 'var(--color-text-muted)',
    },

    // Semantic States
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',
    info: 'var(--color-info)',
  },
  
  borderRadius: {
    lg: 'var(--radius)',
    md: 'calc(var(--radius) - 2px)',
    sm: 'calc(var(--radius) - 4px)',
  }
};
