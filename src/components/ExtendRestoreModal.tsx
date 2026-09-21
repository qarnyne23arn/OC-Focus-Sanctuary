import React from 'react';
import { PlusCircle, RotateCcw, Clock, History, Check } from 'lucide-react';
import { SessionSnapshot } from '../types';

interface ExtendRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtend: (extraMinutes: number) => void;
  onRestore: () => void;
  hasSavedSnapshot: boolean;
  lastSnapshot: SessionSnapshot | null;
  remainingSeconds: number;
  isLight?: boolean;
}

export const ExtendRestoreModal: React.FC<ExtendRestoreModalProps> = ({
  isOpen,
  onClose,
  onExtend,
  onRestore,
  hasSavedSnapshot,
  lastSnapshot,
  remainingSeconds,
  isLight = false,
}) => {
  if (!isOpen) return null;

  const currentMins = Math.floor(remainingSeconds / 60);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className={`relative w-full max-w-md p-6 rounded-3xl border shadow-2xl ${
        isLight
          ? 'bg-white border-slate-200 text-slate-800'
          : 'bg-[#08152c] border-sky-500/25 text-slate-200'
      }`}>
        <div className={`flex items-center justify-between pb-3 border-b ${
          isLight ? 'border-slate-200' : 'border-sky-500/15'
        }`}>
          <div className={`flex items-center gap-2 font-bold text-base ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            <History className={`w-5 h-5 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
            Workflow Modes: Extend & Restore
          </div>
          <button
            onClick={onClose}
            className={`text-xs px-2 py-1 rounded-lg cursor-pointer transition ${
              isLight
                ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            ✕
          </button>
        </div>

        {/* 1. Extend Mode (Flow state booster) */}
        <div className={`mt-4 p-4 rounded-2xl border ${
          isLight
            ? 'bg-slate-50 border-slate-200'
            : 'bg-[#061022] border-sky-500/20'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm font-semibold flex items-center gap-1.5 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              <PlusCircle className={`w-4 h-4 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
              Extend Mode (Flow State)
            </span>
            <span className={`text-xs font-mono font-bold ${
              isLight ? 'text-cyan-800' : 'text-cyan-300'
            }`}>
              Current: {currentMins}m left
            </span>
          </div>
          <p className={`text-xs mb-3 ${isLight ? 'text-slate-600' : 'text-sky-200/60'}`}>
            In the zone? Extend your active study session seamlessly without interrupting stats or breaking concentration.
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => { onExtend(5); onClose(); }}
              className={`py-2.5 px-3 rounded-xl border font-bold text-xs transition cursor-pointer text-center ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30 text-sky-300 hover:text-white'
              }`}
            >
              +5 Minutes
            </button>
            <button
              type="button"
              onClick={() => { onExtend(10); onClose(); }}
              className={`py-2.5 px-3 rounded-xl border font-bold text-xs transition cursor-pointer text-center ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-sky-500/15 hover:bg-sky-500/25 border-sky-500/40 text-cyan-300 hover:text-white'
              }`}
            >
              +10 Minutes
            </button>
            <button
              type="button"
              onClick={() => { onExtend(15); onClose(); }}
              className={`py-2.5 px-3 rounded-xl border font-bold text-xs transition cursor-pointer text-center ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/50 text-cyan-200 hover:text-white'
              }`}
            >
              +15 Minutes
            </button>
          </div>
        </div>

        {/* 2. Restore Mode (Undo accidental reset / recover session) */}
        <div className={`mt-4 p-4 rounded-2xl border ${
          isLight
            ? 'bg-slate-50 border-slate-200'
            : 'bg-[#061022] border-sky-500/20'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm font-semibold flex items-center gap-1.5 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              <RotateCcw className={`w-4 h-4 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`} />
              Restore Mode (Session Recovery)
            </span>
            {hasSavedSnapshot && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isLight
                  ? 'text-emerald-800 bg-emerald-100 border-emerald-300'
                  : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              }`}>
                Snapshot Ready
              </span>
            )}
          </div>
          <p className={`text-xs mb-3 ${isLight ? 'text-slate-600' : 'text-sky-200/60'}`}>
            Accidentally hit reset or interrupted your timer? Restore your exact remaining minutes and elapsed focus time.
          </p>

          {lastSnapshot ? (
            <div className={`p-2.5 rounded-xl border mb-3 text-xs flex items-center justify-between ${
              isLight
                ? 'bg-white border-slate-200 text-slate-800'
                : 'bg-[#091730] border-sky-500/10 text-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${isLight ? 'text-cyan-700' : 'text-sky-400'}`} />
                <span className="font-medium">
                  Saved {Math.floor(lastSnapshot.remainingSeconds / 60)}m {lastSnapshot.remainingSeconds % 60}s
                </span>
              </div>
              <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {new Date(lastSnapshot.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ) : (
            <div className={`text-xs italic mb-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              No recent interrupted session snapshot found. Snapshots are auto-created when sessions pause or pause unexpectedly.
            </div>
          )}

          <button
            type="button"
            disabled={!hasSavedSnapshot}
            onClick={() => { onRestore(); onClose(); }}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              hasSavedSnapshot
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                : isLight
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restore Interrupted Session
          </button>
        </div>

        <div className="mt-4 text-right">
          <button
            type="button"
            onClick={onClose}
            className={`text-xs px-4 py-2 rounded-xl cursor-pointer transition ${
              isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-sky-300/80 hover:text-white hover:bg-slate-800'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
