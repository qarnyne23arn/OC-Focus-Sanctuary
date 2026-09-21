import React from 'react';
import { AlertOctagon, RotateCcw, X, ShieldAlert } from 'lucide-react';

interface SystemResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
  isLight?: boolean;
}

export const SystemResetModal: React.FC<SystemResetModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset,
  isLight = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className={`relative w-full max-w-md border border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-4 ${
        isLight ? 'bg-white text-slate-800' : 'bg-[#0b101d] text-slate-200'
      }`}>
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-xl transition cursor-pointer ${
            isLight ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-inner ${
          isLight ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          <AlertOctagon className="w-6 h-6" />
        </div>

        <div>
          <h3 className={`text-xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            System Reset
          </h3>
          <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Are you sure you want to perform a complete system reset? This action will:
          </p>
        </div>

        <ul className={`text-xs space-y-1.5 list-disc list-inside p-3 rounded-2xl border ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#060a14] border-slate-800 text-slate-300'
        }`}>
          <li>Reset timer to 45:00 study standard</li>
          <li>Clear task checklist and active task</li>
          <li>Clear local study session cache & reflections</li>
          <li>Reset anti-cheat records & distraction blocker</li>
        </ul>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 py-2.5 rounded-xl border font-semibold text-xs cursor-pointer transition ${
              isLight
                ? 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
                : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmReset();
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30 cursor-pointer transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Confirm Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
