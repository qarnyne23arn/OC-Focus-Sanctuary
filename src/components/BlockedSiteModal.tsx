import React from 'react';
import { ShieldAlert, ArrowLeft, Heart, Flame, Sparkles } from 'lucide-react';

interface BlockedSiteModalProps {
  isOpen: boolean;
  domain: string;
  remainingSeconds: number;
  onClose: () => void;
  onEmergencyBypass: () => void;
  isLight?: boolean;
}

export const BlockedSiteModal: React.FC<BlockedSiteModalProps> = ({
  isOpen,
  domain,
  remainingSeconds,
  onClose,
  onEmergencyBypass,
  isLight = false,
}) => {
  if (!isOpen) return null;

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full max-w-md p-6 rounded-3xl border text-center shadow-2xl ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#08152c] border-cyan-500/30 text-slate-100 shadow-[0_0_50px_rgba(0,180,255,0.25)]'
      }`}>
        {/* Glow halo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-cyan-500/20 blur-xl pointer-events-none" />

        {/* Shield Icon */}
        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl border flex items-center justify-center shadow-lg ${
          isLight
            ? 'bg-cyan-50 border-cyan-300 text-cyan-700'
            : 'bg-gradient-to-b from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-cyan-400'
        }`}>
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Title */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold mb-2 ${
          isLight
            ? 'bg-rose-50 border-rose-200 text-rose-700'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <Flame className="w-3.5 h-3.5 text-rose-500" />
          STUDENT SHIELD INTERCEPTION
        </div>

        <h3 className={`text-xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Access to <span className={`font-mono ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>{domain || 'distracting site'}</span> Blocked
        </h3>

        <p className={`text-xs mt-2 max-w-xs mx-auto leading-relaxed ${isLight ? 'text-slate-600' : 'text-sky-200/70'}`}>
          Your focus session is active. You are building momentum toward your academic goals!
        </p>

        {/* Focus Timer Status */}
        <div className={`my-5 p-4 rounded-2xl border ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#050e1f] border-sky-500/20'
        }`}>
          <div className={`text-[11px] uppercase tracking-wider font-semibold ${
            isLight ? 'text-slate-500' : 'text-sky-300/70'
          }`}>
            Time Remaining In Flow
          </div>
          <div className={`text-4xl font-extrabold font-mono mt-1 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            {timeStr}
          </div>
          <div className={`flex items-center justify-center gap-1 text-[11px] mt-1 ${
            isLight ? 'text-cyan-800 font-medium' : 'text-cyan-300'
          }`}>
            <Sparkles className="w-3 h-3" />
            Protecting your attention span
          </div>
        </div>

        {/* Deep breath mindfulness prompt */}
        <div className={`p-3 rounded-xl border text-xs mb-6 flex items-center justify-center gap-2 ${
          isLight ? 'bg-cyan-50/70 border-cyan-200 text-slate-700' : 'bg-cyan-950/30 border-cyan-500/15 text-sky-200'
        }`}>
          <Heart className="w-4 h-4 text-pink-500 animate-pulse" />
          <span>Take a deep breath and stay with your study material.</span>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Study Session
          </button>

          <button
            type="button"
            onClick={onEmergencyBypass}
            className={`w-full py-2 px-3 rounded-xl text-xs font-medium transition cursor-pointer ${
              isLight
                ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                : 'bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            Emergency 60-Second Bypass (Logged)
          </button>
        </div>
      </div>
    </div>
  );
};
