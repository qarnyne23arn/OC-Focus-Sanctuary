import React, { useEffect, useState, useCallback } from 'react';

interface SystemInitiateSplashProps {
  onComplete: () => void;
  durationMs?: number;
}

export const SystemInitiateSplash: React.FC<SystemInitiateSplashProps> = ({
  onComplete,
  durationMs = 1100,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSkip = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 250);
  }, [isExiting, onComplete]);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);

      if (elapsed >= durationMs) {
        clearInterval(interval);
        setIsExiting(true);
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    }, 16);

    const onKeyDown = () => {
      handleSkip();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [durationMs, onComplete, handleSkip]);

  return (
    <div
      id="system-initiate-splash"
      onClick={handleSkip}
      className={`fixed inset-0 z-[100] bg-[#02050e] flex flex-col items-center justify-center p-6 select-none cursor-pointer transition-opacity duration-300 ease-out ${
        isExiting ? 'opacity-0 pointer-events-none scale-102 transition-all' : 'opacity-100 scale-100'
      }`}
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] sm:w-[700px] sm:h-[700px] bg-gradient-to-tr from-cyan-600/20 via-sky-500/10 to-transparent rounded-full blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      {/* Main Initiation Centerpiece */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full animate-in fade-in zoom-in-95 duration-500">
        {/* Golden Sand Clock Logo Container */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 bg-cyan-500/25 rounded-3xl blur-2xl animate-pulse" />
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-black border border-cyan-500/60 p-1.5 sm:p-2 shadow-[0_0_50px_rgba(6,182,212,0.45)] flex items-center justify-center overflow-hidden">
            <img
              src="/sandclock.svg"
              alt="OC Sand Clock Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-2xl filter drop-shadow-[0_0_20px_rgba(6,182,212,0.9)]"
            />
          </div>
        </div>

        {/* Brand Title */}
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-[0.2em] font-['Plus_Jakarta_Sans'] mb-1.5 flex items-center justify-center">
          <span className="bg-gradient-to-r from-sky-100 via-cyan-300 to-sky-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(6,182,212,0.5)]">
            OC
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase text-cyan-300/80 mb-7 font-mono">
          Focus Sanctuary
        </p>

        {/* Initiation Progress Meter */}
        <div className="w-52 sm:w-64 h-1.5 bg-slate-900/90 rounded-full border border-cyan-500/30 overflow-hidden relative shadow-[0_0_15px_rgba(0,0,0,0.8)]">
          <div
            className="h-full bg-gradient-to-r from-sky-600 via-cyan-400 to-sky-300 transition-all duration-75 ease-out shadow-[0_0_12px_rgba(6,182,212,0.9)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status label */}
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-[11px] font-mono text-slate-400 tracking-wider">
            {progress < 100 ? 'INITIATING SYSTEM...' : 'ENTERING SANCTUARY...'}
          </span>
        </div>
      </div>

      {/* Subtle skip prompt */}
      <div className="absolute bottom-6 text-[10px] text-slate-600 tracking-widest uppercase font-mono">
        Click or press any key to enter
      </div>
    </div>
  );
};
