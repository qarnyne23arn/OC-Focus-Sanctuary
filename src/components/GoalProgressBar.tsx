import React from 'react';
import { Target, Trophy } from 'lucide-react';

interface GoalProgressBarProps {
  currentMinutes: number;
  goalMinutes: number;
  remainingSeconds: number;
  totalSeconds: number;
  isFocusMode: boolean;
  isLight?: boolean;
  onOpenGoals?: () => void;
  activeGoalsCount?: number;
}

export const GoalProgressBar: React.FC<GoalProgressBarProps> = ({
  currentMinutes,
  goalMinutes,
  remainingSeconds,
  totalSeconds,
  isFocusMode,
  isLight = false,
  onOpenGoals,
  activeGoalsCount,
}) => {
  const goalPercentage = Math.min(100, Math.round((currentMinutes / Math.max(1, goalMinutes)) * 100));
  const sessionElapsed = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  return (
    <div className={`w-full mt-4 p-3 rounded-2xl border ${
      isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#071328]/90 border-sky-500/15 text-slate-200'
    }`}>
      {/* Daily Goal Header */}
      <div className="flex items-center justify-between text-xs mb-1.5">
        <button
          type="button"
          onClick={onOpenGoals}
          className={`flex items-center gap-1.5 font-bold transition cursor-pointer text-left ${
            onOpenGoals ? 'hover:underline' : ''
          } ${isLight ? 'text-slate-900 hover:text-cyan-700' : 'text-sky-200 hover:text-white'}`}
          title="Click to view Goals & Milestones Tracker"
        >
          <Target className={`w-3.5 h-3.5 ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`} />
          <span>Daily Focus Goal</span>
          {activeGoalsCount !== undefined && activeGoalsCount > 0 && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-semibold flex items-center gap-1 shrink-0 ${
              isLight ? 'bg-cyan-100 text-cyan-800' : 'bg-cyan-500/20 text-cyan-300'
            }`}>
              <Target className="w-3 h-3 text-cyan-400" />
              <span>{activeGoalsCount}</span>
              <span className="hidden sm:inline">target{activeGoalsCount > 1 ? 's' : ''}</span>
            </span>
          )}
        </button>
        <span className={`font-bold ${isLight ? 'text-cyan-800' : 'text-cyan-300'}`}>
          {currentMinutes} / {goalMinutes} min <span className={`font-normal ${isLight ? 'text-slate-500' : 'text-sky-300/60'}`}>({goalPercentage}%)</span>
        </span>
      </div>

      {/* Goal Progress Bar with Milestones */}
      <div className={`relative w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-[#0d2244]'}`}>
        <div
          className="h-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
          style={{ width: `${goalPercentage}%` }}
        />
        {/* Milestone markers at 25%, 50%, 75% */}
        <div className={`absolute top-0 bottom-0 left-1/4 w-[1px] pointer-events-none ${isLight ? 'bg-white/80' : 'bg-slate-900/60'}`} />
        <div className={`absolute top-0 bottom-0 left-2/4 w-[1px] pointer-events-none ${isLight ? 'bg-white/80' : 'bg-slate-900/60'}`} />
        <div className={`absolute top-0 bottom-0 left-3/4 w-[1px] pointer-events-none ${isLight ? 'bg-white/80' : 'bg-slate-900/60'}`} />
      </div>

      {/* Milestone Label Badges */}
      <div className={`flex justify-between text-[10px] mt-1 ${isLight ? 'text-slate-500 font-medium' : 'text-slate-500'}`}>
        <span>0m</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span className={`flex items-center gap-0.5 font-bold ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
          <Trophy className="w-2.5 h-2.5" /> 100%
        </span>
      </div>

      {/* Active Session Mini Progress if running */}
      {isFocusMode && totalSeconds > 0 && (
        <div className={`mt-2 pt-2 border-t flex items-center justify-between text-[11px] ${
          isLight ? 'border-slate-200 text-slate-600' : 'border-sky-500/10 text-sky-300/70'
        }`}>
          <span>Active Session Elapsed</span>
          <span className={`font-mono font-bold ${isLight ? 'text-cyan-800' : 'text-cyan-300'}`}>{Math.round(sessionElapsed)}%</span>
        </div>
      )}
    </div>
  );
};
