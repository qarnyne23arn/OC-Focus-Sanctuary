import React, { useState } from 'react';
import { StudySession } from '../types';
import { getTodayDateString } from '../utils/storage';
import { Flame } from 'lucide-react';

interface ProductivityChartProps {
  sessions: StudySession[];
  activeDateFilter: 'Today' | 'Yesterday' | 'This Week';
  onAddQuickSession?: (minutes: number, hour: number) => void;
  isLight?: boolean;
}

export const ProductivityChart: React.FC<ProductivityChartProps> = ({
  sessions,
  activeDateFilter,
  onAddQuickSession,
  isLight = false,
}) => {
  const [selectedHour, setSelectedHour] = useState<number>(new Date().getHours());
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const [timeSpanMode, setTimeSpanMode] = useState<'24h' | 'core' | 'full'>('24h');

  const todayStr = getTodayDateString();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  const filteredSessions = sessions.filter((s) => {
    if (activeDateFilter === 'Today') {
      return s.date === todayStr;
    }
    if (activeDateFilter === 'Yesterday') {
      return s.date === yesterdayStr;
    }
    if (activeDateFilter === 'This Week') {
      const now = Date.now();
      const sTime = new Date(s.timestamp).getTime();
      return (now - sTime) <= 7 * 24 * 60 * 60 * 1000;
    }
    return true;
  });

  const hours = timeSpanMode === '24h'
    ? Array.from({ length: 24 }, (_, i) => i)
    : timeSpanMode === 'core' 
      ? [11, 12, 13, 14, 15, 16] 
      : [8, 10, 12, 14, 16, 18, 20, 22];

  const chartData = hours.map((hr) => {
    const matched = filteredSessions.filter((s) => s.hour === hr);
    const minutes = matched.reduce((acc, curr) => acc + curr.actualMinutes, 0);
    const subjects = Array.from(new Set(matched.map((s) => s.subject)));

    return {
      hour: hr,
      label: `${hr}:00`,
      endLabel: `${hr + 1}:00`,
      minutes,
      count: matched.length,
      subjects: subjects.length > 0 ? subjects : ['Deep Study'],
      sessionsList: matched,
    };
  });

  const peakItem = chartData.reduce((max, d) => (d.minutes > max.minutes ? d : max), chartData[0] || { hour: 14, minutes: 0 });
  const maxMinutes = Math.max(60, peakItem.minutes + 15);

  const activeHourToDisplay = hoveredHour !== null ? hoveredHour : selectedHour;
  const activeItem = chartData.find((d) => d.hour === activeHourToDisplay) || chartData[0] || { hour: 0, minutes: 0, count: 0, subjects: ['Deep Study'] };

  const totalStudyMinutes = filteredSessions.reduce((acc, curr) => acc + curr.actualMinutes, 0);

  return (
    <div className="w-full mt-2 relative select-none space-y-3" id="productivity-trend-chart">
      {/* Top Banner with Peak Hour & Total */}
      <div className={`p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 shadow-sm ${
        isLight
          ? 'bg-slate-50 border-slate-200'
          : 'bg-gradient-to-r from-[#08152e] via-[#0b1d3d] to-[#08152e] border-cyan-500/25'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-400/30">
            <Flame className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Peak Hour: {peakItem.hour}:00
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                isLight ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' : 'bg-cyan-500/20 text-cyan-300'
              }`}>
                {peakItem.minutes}m Flow
              </span>
            </div>
            <p className={`text-[11px] font-medium mt-0.5 ${isLight ? 'text-slate-600' : 'text-sky-200/80'}`}>
              Total: {Math.floor(totalStudyMinutes / 60)}h {totalStudyMinutes % 60}m across {filteredSessions.length} sessions ({activeDateFilter})
            </p>
          </div>
        </div>

        {/* Span toggle */}
        <div className={`flex items-center gap-1 p-0.5 rounded-xl border text-[10px] ${
          isLight ? 'bg-slate-200/80 border-slate-300' : 'bg-slate-900/80 border-slate-700/60'
        }`}>
          {(['24h', 'core', 'full'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setTimeSpanMode(mode)}
              className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition uppercase ${
                timeSpanMode === mode
                  ? 'bg-cyan-500 text-slate-950 shadow font-extrabold'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode === '24h' ? '24 Hours' : mode === 'core' ? 'Core (11-16)' : 'Full Day'}
            </button>
          ))}
        </div>
      </div>

      {/* Header Info Tooltip with live reactive values */}
      <div className={`flex items-center justify-between px-2 text-[11px] ${
        isLight ? 'text-slate-800' : 'text-sky-200/90'
      }`}>
        <span className="flex items-center gap-1.5 font-semibold">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
          <span>Hourly Productivity Bar Chart (Scrollable)</span>
        </span>
        <div className="flex items-center gap-2">
          <span className={`font-extrabold font-mono text-xs px-2.5 py-0.5 rounded-lg border ${
            isLight
              ? 'text-cyan-900 bg-cyan-100 border-cyan-300'
              : 'text-cyan-300 bg-cyan-950/60 border-cyan-500/30'
          }`}>
            {activeItem.hour}:00–{activeItem.hour + 1}:00 · {activeItem.minutes} min ({activeItem.count} sessions)
          </span>
        </div>
      </div>

      {/* Main Larger Scrollable Bar Chart Container with Non-overlapping Fixed Y-Axis */}
      <div className={`relative w-full rounded-2xl border p-3 shadow-inner overflow-hidden flex ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-gradient-to-b from-[#071329]/95 to-[#030917]/95 border-sky-500/25'
      }`}>
        {/* Fixed Y-Axis Left Column (Never overlaps with bars) */}
        <div className="w-12 shrink-0 flex flex-col justify-between py-8 pr-2 border-r border-sky-500/15 select-none">
          {[1, 0.75, 0.5, 0.25, 0].map((ratio, idx) => {
            const labelVal = Math.round(maxMinutes * ratio);
            return (
              <div key={idx} className="text-right">
                <span className="text-[10px] font-mono text-cyan-400/80 font-bold">
                  {labelVal}m
                </span>
              </div>
            );
          })}
        </div>

        {/* Scrollable Bars Area */}
        <div className="flex-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-cyan-500/30 relative">
          <div className="min-w-[850px] flex items-end gap-3 h-[260px] pt-8 px-4 relative">
            {/* Horizontal Gridlines spanning across bars */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between py-8 px-4">
              {[1, 0.75, 0.5, 0.25, 0].map((ratio, idx) => (
                <div key={idx} className="w-full flex items-center border-b border-dashed border-sky-500/15 pb-1" />
              ))}
            </div>

            {/* Bars */}
            {chartData.map((d) => {
              const isSelected = d.hour === activeHourToDisplay;
              const ratio = Math.max(0.04, d.minutes / maxMinutes);
              const barHeightPct = Math.min(100, Math.max(8, ratio * 100));

              return (
                <div
                  key={d.hour}
                  onClick={() => setSelectedHour(d.hour)}
                  onMouseEnter={() => setHoveredHour(d.hour)}
                  onMouseLeave={() => setHoveredHour(null)}
                  className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer z-20"
                >
                  {/* Tooltip on hover/tap */}
                  <div className={`absolute -top-7 px-2 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap transition-all shadow-md ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 scale-105 opacity-100'
                      : 'bg-slate-900 text-cyan-300 border border-cyan-500/30 opacity-0 group-hover:opacity-100'
                  }`}>
                    {d.hour}:00–{d.hour + 1}:00 · {d.minutes}m
                  </div>

                  {/* Minute value above bar */}
                  <span className={`text-[10px] font-mono font-bold mb-1.5 transition ${
                    isSelected ? 'text-cyan-300 font-black' : (isLight ? 'text-slate-600' : 'text-slate-400')
                  }`}>
                    {d.minutes > 0 ? `${d.minutes}m` : ''}
                  </span>

                  {/* Vertical Bar */}
                  <div
                    className={`w-full max-w-[36px] transition-all duration-300 relative ${
                      isSelected
                        ? 'bg-gradient-to-t from-cyan-600 via-cyan-400 to-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.7)] ring-2 ring-white/80'
                        : d.minutes > 0
                          ? 'bg-gradient-to-t from-cyan-900 via-cyan-600 to-cyan-400 opacity-90 hover:opacity-100'
                          : isLight ? 'bg-slate-200/80 hover:bg-slate-300' : 'bg-[#0e2246] hover:bg-[#163466]'
                    }`}
                    style={{ height: `${barHeightPct}%` }}
                  />

                  {/* Hour Label below bar */}
                  <span className={`mt-2 text-[11px] font-mono transition ${
                    isSelected
                      ? 'text-cyan-300 font-black underline underline-offset-4'
                      : isLight ? 'text-slate-700 font-semibold' : 'text-slate-300 font-medium'
                  }`}>
                    {String(d.hour).padStart(2, '0')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scroll hint footer */}
      <div className={`flex items-center justify-between text-[11px] px-2 pt-1 border-t ${
        isLight ? 'text-slate-600 border-slate-200' : 'text-slate-400 border-sky-500/10'
      }`}>
        <span className="truncate max-w-[280px] font-medium">
          Subjects: {activeItem.subjects.join(', ')}
        </span>
      </div>
    </div>
  );
};
