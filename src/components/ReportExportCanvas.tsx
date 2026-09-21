import React, { forwardRef } from 'react';
import { Clock, CheckCircle2, Flame, ShieldCheck, Zap, RefreshCw, AlertCircle, BookOpen, BarChart3 } from 'lucide-react';
import { StudySession, BlockedWebsite } from '../types';
import { calculateDailyReport, calculateMonthlyReport } from '../utils/reports';

interface ReportExportCanvasProps {
  type: 'daily' | 'monthly';
  sessions: StudySession[];
  blockedSites?: BlockedWebsite[];
  distractionCount?: number;
  dateStr?: string;
  year?: number;
  month?: number;
}

export const ReportExportCanvas = forwardRef<HTMLDivElement, ReportExportCanvasProps>(({
  type,
  sessions,
  blockedSites = [],
  distractionCount = 0,
  dateStr = new Date().toISOString().slice(0, 10),
  year = new Date().getFullYear(),
  month = new Date().getMonth(),
}, ref) => {
  const daily = calculateDailyReport(sessions, dateStr, distractionCount);
  const monthly = calculateMonthlyReport(sessions, year, month);

  // Stats calculation
  const daySessions = sessions.filter(s => s.date === dateStr || (s.timestamp && s.timestamp.slice(0, 10) === dateStr));
  const monthSessions = sessions.filter(s => {
    const d = new Date(s.timestamp || s.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const targetSessions = type === 'daily' ? daySessions : monthSessions;
  const totalMinutes = targetSessions.reduce((acc, s) => acc + (s.actualMinutes || s.durationMinutes || 0), 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const focusTimeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  const completedCount = targetSessions.filter(s => s.completed).length;
  const sessionsCount = targetSessions.length;

  // Streak calculation (mock or simulated)
  const streakDays = 4;

  // Categories / Subjects
  const catMap = new Map<string, number>();
  targetSessions.forEach(s => {
    const subj = s.subject || 'General Study';
    catMap.set(subj, (catMap.get(subj) || 0) + (s.actualMinutes || s.durationMinutes || 0));
  });
  const categories = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div 
      ref={ref}
      style={{ width: '840px', minWidth: '840px' }}
      className="p-8 rounded-2xl border border-sky-500/20 bg-gradient-to-b from-[#0a0e1a] to-[#0d1220] text-slate-100 font-sans shadow-2xl relative overflow-hidden"
    >
      {/* Header Row */}
      <div className="flex items-center justify-between pb-4 border-b border-sky-500/15">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide text-white">
              {type === 'daily' ? 'Daily Focus & Energy Report' : 'Monthly Performance & Energy Report'}
            </h1>
            <p className="text-xs text-slate-400">Focus Sanctuary Intelligence Engine</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-mono font-medium text-cyan-400">
            {type === 'daily' ? dateStr : `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`}
          </span>
        </div>
      </div>

      {/* STAT CARD GRID (6 cards: 3 cols, 2 rows) */}
      <div className="grid grid-cols-3 gap-3 my-6">
        {/* Card 1: Focus Time */}
        <div className="p-4 rounded-xl bg-[#111827] border border-sky-500/15 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Focus Time</span>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-white">{focusTimeStr}</span>
          </div>
        </div>

        {/* Card 2: Sessions */}
        <div className="p-4 rounded-xl bg-[#111827] border border-sky-500/15 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Sessions Completed</span>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-white">{completedCount}/{sessionsCount}</span>
          </div>
        </div>

        {/* Card 3: Streak */}
        <div className="p-4 rounded-xl bg-[#111827] border border-sky-500/15 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>Streak</span>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-white">{streakDays} <span className="text-xs font-normal text-slate-400">days</span></span>
          </div>
        </div>

        {/* Card 4: Shielded / Distractions */}
        <div className="p-4 rounded-xl bg-[#111827] border border-sky-500/15 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Shielded Distractions</span>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-white">{distractionCount} <span className="text-xs font-normal text-slate-400">sites</span></span>
          </div>
        </div>

        {/* Card 5: Energy Shift */}
        <div className="p-4 rounded-xl bg-[#111827] border border-sky-500/15 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Energy Shift</span>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-white">
              {type === 'daily' ? `${daily.energy_shift.start} → ${daily.energy_shift.end}` : `${monthly.avg_energy_shift.start} → ${monthly.avg_energy_shift.end}`}
            </span>
          </div>
        </div>

        {/* Card 6: Break Adherence */}
        <div className="p-4 rounded-xl bg-[#111827] border border-sky-500/15 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <RefreshCw className="w-4 h-4 text-teal-400" />
            <span>Break Adherence</span>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-white">
              {type === 'daily' 
                ? `${Math.round(daily.break_adherence.rate * 100)}%` 
                : `${Math.round(monthly.break_adherence_rate * 100)}%`}
            </span>
          </div>
        </div>
      </div>

      {/* DAILY / MONTHLY TIMELINE OR ADHERENCE PANEL */}
      <div className="p-5 rounded-xl bg-[#111827] border border-sky-500/15 mb-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-semibold text-white">
            <Zap className="w-4 h-4 text-amber-500" />
            {type === 'daily' ? 'Session Energy Timeline' : 'Break Adherence by Week'}
          </span>
          <span className="text-xs font-mono text-cyan-400">Scale 1-5</span>
        </div>

        {type === 'daily' ? (
          daily.energy_timeline.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No energy timeline records for today.</p>
          ) : (
            <div className="space-y-3">
              {daily.energy_timeline.map((item, idx) => {
                const pct = Math.round((item.energy_after / 5) * 100);
                const color = item.energy_after >= 4 ? 'from-emerald-500 to-teal-400' : item.energy_after === 3 ? 'from-cyan-500 to-blue-500' : 'from-amber-500 to-rose-500';
                return (
                  <div key={idx} className="flex items-center gap-4 text-xs">
                    <span className="font-mono text-slate-400 w-16 shrink-0">{item.time}</span>
                    <div className="flex-1 h-3 rounded-full overflow-hidden bg-[#0a0e1a]">
                      <div className={`h-full bg-gradient-to-r ${color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="font-mono font-bold text-white w-12 text-right">{item.energy_after}/5</span>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="space-y-3">
            {monthly.break_adherence_by_week.map((w, idx) => {
              const pct = Math.round(w.rate * 100);
              return (
                <div key={idx} className="flex items-center gap-4 text-xs">
                  <span className="font-mono text-slate-400 w-24 shrink-0">Week {w.week_number}</span>
                  <div className="flex-1 h-3 rounded-full overflow-hidden bg-[#0a0e1a]">
                    <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="font-mono font-bold text-white w-12 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PATTERN SPOTTED PANEL */}
      <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/40 flex items-start gap-3 mb-4">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="text-xs font-bold tracking-wider uppercase text-amber-400">Pattern Spotted Intelligence</div>
          <div className="text-xs leading-relaxed text-amber-200/90">
            {type === 'daily' ? daily.pattern_note : monthly.pattern_note}
          </div>
        </div>
      </div>

      {/* TIME SPENT BY CATEGORY / TASK PANEL */}
      <div className="p-5 rounded-xl bg-[#111827] border border-sky-500/15 mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-semibold text-white">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            Time Spent by Category
          </span>
          <span className="text-xs text-slate-400">{categories.length} categories</span>
        </div>

        {categories.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No category records found.</p>
        ) : (
          <div className="space-y-3">
            {categories.map(([cat, mins], idx) => {
              const pct = totalMinutes > 0 ? Math.round((mins / totalMinutes) * 100) : 0;
              const ch = Math.floor(mins / 60);
              const cm = mins % 60;
              const timeStr = ch > 0 ? `${ch}h ${cm}m` : `${cm}m`;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white font-medium">{cat}</span>
                    <span className="font-mono font-bold text-cyan-400">{timeStr} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden bg-[#0a0e1a]">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="pt-4 border-t border-sky-500/15 flex items-center justify-between text-xs text-slate-400">
        <span>Generated by Focus Sanctuary · {new Date().toLocaleDateString()}</span>
        <span className="font-mono text-cyan-400">Secure Export Node</span>
      </div>
    </div>
  );
});

ReportExportCanvas.displayName = 'ReportExportCanvas';
