import React, { useState } from 'react';
import { StudySession } from '../types';
import { Flame, Trophy, Calendar, CheckCircle2, TrendingUp, BookOpen } from 'lucide-react';

interface HabitHeatmapProps {
  sessions: StudySession[];
  isLight: boolean;
}

export const HabitHeatmap: React.FC<HabitHeatmapProps> = ({ sessions, isLight }) => {
  const formatDateString = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(() => formatDateString(new Date()));
  const [timeRange, setTimeRange] = useState<30 | 90>(30);

  const statsMap = React.useMemo(() => {
    const map = new Map<string, { minutes: number; count: number; sessions: StudySession[] }>();
    sessions.forEach((s) => {
      const d = s.date || s.timestamp.slice(0, 10);
      const current = map.get(d) || { minutes: 0, count: 0, sessions: [] };
      const mins = s.actualMinutes || s.durationMinutes || 25;
      map.set(d, {
        minutes: current.minutes + (s.completed ? mins : Math.round(mins * 0.5)),
        count: current.count + 1,
        sessions: [...current.sessions, s],
      });
    });
    return map;
  }, [sessions]);

  const daysList = React.useMemo(() => {
    const list: Array<{ dateString: string; dateObj: Date; dayNumber: number; minutes: number; count: number; sessions: StudySession[] }> = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = timeRange - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const ds = formatDateString(d);
      const entry = statsMap.get(ds) || { minutes: 0, count: 0, sessions: [] };
      list.push({
        dateString: ds,
        dateObj: d,
        dayNumber: d.getDate(),
        minutes: entry.minutes,
        count: entry.count,
        sessions: entry.sessions,
      });
    }
    return list;
  }, [timeRange, statsMap]);

  const activeSelectedData = React.useMemo(() => {
    const ds = selectedDate || formatDateString(new Date());
    const entry = statsMap.get(ds);
    return {
      date: ds,
      minutes: entry?.minutes || 0,
      count: entry?.count || 0,
      sessions: entry?.sessions || [],
    };
  }, [selectedDate, statsMap]);

  const { currentStreak, longestStreak, totalStudyDays, totalHours } = React.useMemo(() => {
    let curr = 0;
    let longest = 0;
    let totalMins = 0;
    let daysWithStudy = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = formatDateString(today);
    const todayEntry = statsMap.get(todayStr);

    let isCountingCurrent = true;
    if (!todayEntry || todayEntry.minutes === 0) {
      const yest = new Date(today);
      yest.setDate(yest.getDate() - 1);
      const yestStr = formatDateString(yest);
      const yestEntry = statsMap.get(yestStr);
      if (!yestEntry || yestEntry.minutes === 0) {
        curr = 0;
        isCountingCurrent = false;
      }
    }

    if (isCountingCurrent) {
      let d = new Date(today);
      const todayDs = formatDateString(d);
      if (!statsMap.get(todayDs) || statsMap.get(todayDs)?.minutes === 0) {
        d.setDate(d.getDate() - 1);
      }
      while (true) {
        const ds = formatDateString(d);
        const entry = statsMap.get(ds);
        if (entry && entry.minutes > 0) {
          curr++;
          d.setDate(d.getDate() - 1);
        } else {
          break;
        }
      }
    }

    const allDates = Array.from(statsMap.keys()).sort();
    if (allDates.length > 0) {
      let tempStreak = 0;
      let prevDate: Date | null = null;

      allDates.forEach((ds) => {
        const entry = statsMap.get(ds);
        if (entry && entry.minutes > 0) {
          totalMins += entry.minutes;
          daysWithStudy++;

          const currentDate = new Date(String(ds));
          if (prevDate) {
            const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
              tempStreak++;
            } else {
              tempStreak = 1;
            }
          } else {
            tempStreak = 1;
          }
          prevDate = currentDate;
          if (tempStreak > longest) longest = tempStreak;
        }
      });
    }

    if (curr > longest) longest = curr;

    return {
      currentStreak: curr,
      longestStreak: longest,
      totalStudyDays: daysWithStudy,
      totalHours: (totalMins / 60).toFixed(1),
    };
  }, [statsMap]);

  const getCellColor = (minutes: number) => {
    if (minutes === 0) {
      return isLight 
        ? 'bg-slate-200 border-slate-300 text-slate-600 hover:bg-slate-300' 
        : 'bg-[#102244] border-sky-500/25 text-slate-400 hover:bg-[#152e5a]';
    }
    if (minutes < 30) {
      return isLight 
        ? 'bg-cyan-200 border-cyan-400 text-slate-900 font-bold' 
        : 'bg-cyan-950 border-cyan-500 text-cyan-200 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]';
    }
    if (minutes < 120) {
      return isLight 
        ? 'bg-cyan-400 border-cyan-600 text-slate-950 font-extrabold' 
        : 'bg-cyan-700 border-cyan-400 text-white font-extrabold shadow-[0_0_10px_rgba(6,182,212,0.5)]';
    }
    if (minutes < 240) {
      // 2 hours to 4 hours: Brightest Cyan / Accent color
      return isLight 
        ? 'bg-cyan-600 border-cyan-800 text-white font-black' 
        : 'bg-cyan-400 border-cyan-200 text-slate-950 font-black shadow-[0_0_14px_rgba(6,182,212,0.9)]';
    }
    if (minutes < 360) {
      // 4 hours to 6 hours: Yellow
      return isLight 
        ? 'bg-amber-400 border-amber-600 text-slate-950 font-black' 
        : 'bg-amber-400 border-amber-200 text-slate-950 font-black shadow-[0_0_14px_rgba(251,191,36,0.9)]';
    }
    // 6 hours+: Red
    return isLight 
      ? 'bg-red-600 border-red-700 text-white font-black' 
      : 'bg-red-500 border-red-300 text-white font-black shadow-[0_0_16px_rgba(239,68,68,0.9)]';
  };

  const weeks = React.useMemo(() => {
    const w: Array<typeof daysList> = [];
    let currentWeek: typeof daysList = [];
    daysList.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === daysList.length - 1) {
        w.push(currentWeek);
        currentWeek = [];
      }
    });
    return w;
  }, [daysList]);

  return (
    <div className="w-full space-y-4 font-sans select-none" id="habit-heatmap-container">
      {/* Header controls & stats */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Focus Consistency Heatmap
            </h3>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Track daily habits and deep work intensity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex rounded-xl p-1 border ${
            isLight ? 'bg-slate-200 border-slate-300' : 'bg-[#0a1b38] border-cyan-500/30'
          }`}>
            <button
              type="button"
              onClick={() => setTimeRange(30)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                timeRange === 30
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : isLight ? 'text-slate-700 hover:text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              30 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeRange(90)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                timeRange === 90
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : isLight ? 'text-slate-700 hover:text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              90 Days
            </button>
          </div>
        </div>
      </div>

      {/* Streak cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`p-3.5 rounded-2xl border ${
          isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#091a38] border-cyan-500/25'
        }`}>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
            <Flame className="w-4 h-4" />
            Current Streak
          </div>
          <div className="text-2xl font-black font-mono mt-1">
            {currentStreak} <span className="text-xs font-normal text-slate-400">days</span>
          </div>
        </div>

        <div className={`p-3.5 rounded-2xl border ${
          isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#091a38] border-cyan-500/25'
        }`}>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-400">
            <Trophy className="w-4 h-4" />
            Longest Streak
          </div>
          <div className="text-2xl font-black font-mono mt-1">
            {longestStreak} <span className="text-xs font-normal text-slate-400">days</span>
          </div>
        </div>

        <div className={`p-3.5 rounded-2xl border ${
          isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#091a38] border-cyan-500/25'
        }`}>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            Active Days
          </div>
          <div className="text-2xl font-black font-mono mt-1">
            {totalStudyDays} <span className="text-xs font-normal text-slate-400">total</span>
          </div>
        </div>

        <div className={`p-3.5 rounded-2xl border ${
          isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#091a38] border-cyan-500/25'
        }`}>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-400">
            <TrendingUp className="w-4 h-4" />
            Focus Volume
          </div>
          <div className="text-2xl font-black font-mono mt-1">
            {totalHours} <span className="text-xs font-normal text-slate-400">hrs</span>
          </div>
        </div>
      </div>

      <div className={`p-5 rounded-2xl border overflow-x-auto ${
        isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#081730] border-cyan-500/25'
      }`}>
        <div className="min-w-[550px]">
          {/* Legend */}
          <div className="flex items-center gap-2 justify-end pb-3 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 mr-1">Activity Level:</span>
            <span className="text-[10px] text-slate-400">0m</span>
            <div className={`w-5 h-5 rounded-md border ${isLight ? 'bg-slate-200 border-slate-300' : 'bg-[#102244] border-sky-500/25'}`} title="0m" />
            <div className={`w-5 h-5 rounded-md border ${isLight ? 'bg-cyan-200 border-cyan-400' : 'bg-cyan-950 border-cyan-500'}`} title="<30m" />
            <div className={`w-5 h-5 rounded-md border ${isLight ? 'bg-cyan-400 border-cyan-600' : 'bg-cyan-700 border-cyan-400'}`} title="30m-2h" />
            <div className={`w-5 h-5 rounded-md border ${isLight ? 'bg-cyan-600 border-cyan-800' : 'bg-cyan-400 border-cyan-200'}`} title="2h-4h" />
            <div className={`w-5 h-5 rounded-md border ${isLight ? 'bg-amber-400 border-amber-600' : 'bg-amber-400 border-amber-200'}`} title="4h-6h" />
            <div className={`w-5 h-5 rounded-md border ${isLight ? 'bg-red-600 border-red-700' : 'bg-red-500 border-red-300'}`} title="6h+" />
            <span className="text-[10px] text-slate-400 ml-1">6h+ (Red)</span>
          </div>

          <div className="flex gap-2 justify-center py-3">
            {weeks.map((week, wIndex) => (
              <div key={wIndex} className="flex flex-col gap-2">
                {week.map((day) => {
                  const isSelected = selectedDate === day.dateString;
                  return (
                    <button
                      key={day.dateString}
                      type="button"
                      onClick={() => setSelectedDate(day.dateString)}
                      title={`${day.dateString}: ${day.minutes} mins (${day.count} sessions)`}
                      className={`w-9 h-9 rounded-full border flex items-center justify-center text-xs font-mono transition-all cursor-pointer hover:scale-110 hover:z-10 ${getCellColor(day.minutes)} ${
                        isSelected ? 'ring-4 ring-cyan-400 scale-110 z-20 font-black' : ''
                      }`}
                    >
                      {day.dayNumber}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className={`mt-5 p-4 rounded-2xl border space-y-3 ${
            isLight ? 'bg-white border-slate-300' : 'bg-[#061022] border-cyan-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Activities for Date: <span className="text-cyan-400 font-mono font-black">{activeSelectedData.date}</span>
                </span>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold font-mono ${
                isLight ? 'bg-cyan-100 text-cyan-800' : 'bg-cyan-500/20 text-cyan-300'
              }`}>
                {activeSelectedData.minutes} mins total ({activeSelectedData.count} sessions)
              </span>
            </div>

            {activeSelectedData.sessions.length === 0 ? (
              <div className={`text-center py-6 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[#091833] border-cyan-500/15 text-slate-400'
              }`}>
                <p className="text-xs font-medium">No recorded focus sessions on this date.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                {activeSelectedData.sessions.map((s, idx) => {
                  const sessionTime = s.timestamp ? new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : `Hour: ${s.hour}:00`;
                  const modeLabel = s.mode === 'focus' ? 'Deep Focus' : s.mode === 'short_break' ? 'Short Break' : 'Long Break';
                  const focusMins = s.actualMinutes || s.durationMinutes;
                  return (
                    <div
                      key={s.id || idx}
                      className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition ${
                        isLight ? 'bg-white border-slate-300 shadow-sm' : 'bg-[#091833] border-cyan-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 font-bold">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold truncate text-sm">{s.subject || 'Focus Study'}</div>
                          <div className={`text-[11px] flex items-center gap-2 mt-0.5 ${isLight ? 'text-slate-600 font-semibold' : 'text-slate-300'}`}>
                            <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-semibold uppercase text-[9px] border border-cyan-500/20">
                              {modeLabel}
                            </span>
                            <span>• Recorded at <strong className="font-mono text-cyan-300">{sessionTime}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <div className="text-right font-mono">
                          <div className="font-bold text-sm text-cyan-400">{focusMins} mins focus</div>
                          <div className={`text-[10px] font-bold ${s.completed ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {s.completed ? '✓ Completed' : '⚡ Partial'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
