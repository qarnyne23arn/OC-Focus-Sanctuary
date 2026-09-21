import React, { useEffect } from 'react';
import { Trophy, Award, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MilestoneAlert } from '../types';

interface NotificationToastProps {
  alerts: MilestoneAlert[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ alerts, onDismiss }) => {
  useEffect(() => {
    if (alerts.length > 0) {
      const latest = alerts[alerts.length - 1];
      if (latest.type === 'goal_completed' || latest.type === 'session_finished') {
        // Trigger celebratory confetti burst!
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#00c8ff', '#0072ff', '#38bdf8', '#34d399', '#ffffff'],
          });
        } catch {
          // Ignore
        }
      }
    }
  }, [alerts]);

  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="pointer-events-auto p-4 rounded-2xl bg-[#08152c]/95 border border-cyan-500/40 shadow-[0_10px_30px_rgba(0,180,255,0.3)] backdrop-blur-md flex items-start gap-3 text-slate-100 animate-in slide-in-from-bottom-3 duration-300"
        >
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
            {alert.type === 'goal_completed' ? (
              <Trophy className="w-5 h-5 text-cyan-400" />
            ) : alert.type === 'session_finished' ? (
              <Award className="w-5 h-5 text-emerald-400" />
            ) : (
              <Sparkles className="w-5 h-5 text-cyan-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
              {alert.title}
            </h4>
            <p className="text-[11px] text-sky-200/80 mt-0.5 leading-relaxed">
              {alert.message}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onDismiss(alert.id)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
