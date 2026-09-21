import React from 'react';

interface SandClockLogoProps {
  className?: string;
  size?: number | string;
  showGlow?: boolean;
}

export const SandClockLogo: React.FC<SandClockLogoProps> = ({
  className = '',
  size = '100%',
  showGlow = false,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {showGlow && (
        <div className="absolute inset-0 bg-cyan-500/30 rounded-full blur-xl animate-pulse pointer-events-none" />
      )}
      <img
        src="/sandclock.svg"
        alt="OC Sand Clock Logo"
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(6,182,212,0.7)]"
      />
    </div>
  );
};
