import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  /** Optional minimum display duration in milliseconds (defaults to 1800ms) */
  minDuration?: number;
  /** Optional callback fired when splash exit animation completes */
  onComplete?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  minDuration = 1800,
  onComplete,
}) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('INITIALIZING WORKSPACE...');
  const [isLeaving, setIsLeaving] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const stages = [
      'INITIALIZING WORKSPACE...',
      'LOADING INDEXEDDB VAULT...',
      'SYNCHRONIZING RECENT INVOICES...',
      'LAUNCHING DASHBOARD...',
    ];

    const stepTime = minDuration / 25;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + Math.floor(Math.random() * 9) + 4, 100);
        const idx = Math.min(Math.floor((next / 100) * stages.length), stages.length - 1);
        setStatusText(stages[idx]);

        if (next >= 100) {
          clearInterval(interval);
          // Stage 1 of exit: Trigger cinematic leaving animation
          setTimeout(() => {
            setIsLeaving(true);
            // Stage 2 of exit: Unmount component after leaving transition (800ms)
            setTimeout(() => {
              setIsHidden(true);
              if (onComplete) onComplete();
            }, 800);
          }, 200);
        }
        return next;
      });
    }, stepTime);

    return () => clearInterval(interval);
  }, [minDuration, onComplete]);

  if (isHidden) return null;

  // SVG circumference dashoffset for r=75 -> 2 * PI * 75 ≈ 471.24
  const circumference = 471.24;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden transition-all duration-800 cubic-bezier(0.16, 1, 0.3, 1) ${
        isLeaving
          ? 'opacity-0 scale-110 backdrop-blur-xl pointer-events-none'
          : 'opacity-100 scale-100 backdrop-blur-none'
      }`}
      style={{ background: 'var(--color-surface, #fcfbf9)' }}
      aria-label="Loading app"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Blueprint Grid Lines Backdrop */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
          isLeaving ? 'opacity-0' : 'opacity-30'
        }`}
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(214, 207, 191, 0.35) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(214, 207, 191, 0.35) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
        }}
      />

      {/* Financial Sine Wave Overlay */}
      <div
        className={`absolute inset-0 pointer-events-none z-2 flex items-center justify-center transition-all duration-700 ${
          isLeaving ? 'opacity-0 scale-125' : 'opacity-25 scale-100'
        }`}
      >
        <svg className="w-full h-[220px]" viewBox="0 0 1200 220" preserveAspectRatio="none">
          <path
            d="M 0 110 Q 300 20, 600 110 T 1200 110"
            fill="none"
            stroke="var(--color-accent, #20807b)"
            strokeWidth="3.5"
            className="animate-[p3DrawWave_4s_cubic-bezier(0.4,0,0.2,1)_infinite]"
            style={{
              strokeDasharray: 1200,
              strokeDashoffset: 0,
            }}
          />
        </svg>
      </div>

      {/* Explosive Gold/Teal Radial Aura on Leaving */}
      <div
        className={`absolute w-[500px] h-[500px] rounded-full pointer-events-none transition-all duration-800 ease-out ${
          isLeaving
            ? 'scale-[2.5] opacity-0 bg-radial from-accent/40 via-gold/30 to-transparent'
            : 'scale-90 opacity-40 bg-radial from-accent/20 via-transparent to-transparent'
        }`}
      />

      {/* Content Center Container */}
      <div
        className={`relative z-10 flex flex-col items-center text-center px-4 transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${
          isLeaving ? 'scale-125 opacity-0 -translate-y-4' : 'scale-100 opacity-100 translate-y-0'
        }`}
      >
        {/* Circular Logo Wrapper & Edge Progress Ring */}
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 mb-8 flex items-center justify-center">
          {/* Edge Circular SVG Progress Ring */}
          <svg
            className={`absolute inset-0 w-full h-full -rotate-90 overflow-visible transition-transform duration-700 ${
              isLeaving ? 'scale-125 rotate-45' : 'scale-100'
            }`}
            viewBox="0 0 160 160"
          >
            <defs>
              <linearGradient id="splash-edge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--color-accent, #20807b)" />
                <stop offset="60%" stopColor="var(--color-primary, #1c385c)" />
                <stop offset="100%" stopColor="var(--color-warning, #b88628)" />
              </linearGradient>
            </defs>

            {/* Background Track Circle */}
            <circle
              cx="80"
              cy="80"
              r="75"
              fill="none"
              stroke="rgba(214, 207, 191, 0.45)"
              strokeWidth="4"
            />

            {/* Animated Edge Progress Ring Circle */}
            <circle
              cx="80"
              cy="80"
              r="75"
              fill="none"
              stroke="url(#splash-edge-gradient)"
              strokeWidth="5"
              strokeLinecap="round"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
                transition: 'stroke-dashoffset 0.15s ease-out',
                filter: 'drop-shadow(0 0 8px rgba(32, 128, 123, 0.5))',
              }}
            />
          </svg>

          {/* Pure Circle Logo Card */}
          <div
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-white to-surface border border-border flex items-center justify-center shadow-xl shadow-primary/10 transition-all duration-700 ${
              isLeaving ? 'scale-115 shadow-accent/40 ring-4 ring-accent/30' : 'scale-100'
            }`}
          >
            <img
              src="/icons/icon-512x512.png"
              alt="Ledgerly Logo"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md animate-pulse"
            />
          </div>
        </div>

        {/* Brand Title & Subtitle */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-widest text-text-primary mb-1.5 font-sans">
          LEDGERLY
        </h1>
        <p className="text-xs sm:text-sm font-bold tracking-[0.2em] text-accent uppercase mb-8">
          Realtime Cashflow Engine
        </p>

        {/* Realtime Status & Progress Ticker */}
        <div
          className={`font-mono text-xs sm:text-sm font-semibold text-text-secondary bg-background border border-border px-5 py-2 rounded-full shadow-sm transition-all duration-500 ${
            isLeaving ? 'scale-90 opacity-0 translate-y-2' : 'scale-100 opacity-100 translate-y-0'
          }`}
        >
          {statusText} {progress}%
        </div>
      </div>
    </div>
  );
};
