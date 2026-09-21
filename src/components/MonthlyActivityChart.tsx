import React, { useState } from 'react';
import { StudySession } from '../types';
import { TrendingUp } from 'lucide-react';

interface MonthlyActivityChartProps {
  sessions: StudySession[];
  isLight?: boolean;
}

export const MonthlyActivityChart: React.FC<MonthlyActivityChartProps> = ({
  sessions,
  isLight = false,
}) => {
  // Get current year and month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDateNum = Math.min(now.getDate(), daysInMonth);

  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  // Compute daily minutes for each day of the current month (1 to daysInMonth)
  const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    
    const matched = sessions.filter((s) => {
      const sDate = s.date || (s.timestamp ? s.timestamp.slice(0, 10) : '');
      return sDate === dateStr;
    });

    const minutes = matched.reduce((acc, curr) => acc + (curr.actualMinutes || curr.durationMinutes || 0), 0);
    return {
      day: dayNum,
      dateStr,
      minutes,
      count: matched.length,
    };
  });

  const totalMonthlyMinutes = dailyData.reduce((acc, curr) => acc + curr.minutes, 0);
  const activeDaysCount = dailyData.filter((d) => d.minutes > 0).length;
  const peakDay = dailyData.reduce((max, d) => (d.minutes > max.minutes ? d : max), dailyData[0] || { day: 1, minutes: 0 });

  const maxMinutes = Math.max(120, peakDay.minutes + 30);

  // SVG dimensions for smooth line chart
  const width = 720;
  const height = 220;
  const paddingX = 40;
  const bottomY = height - 30;
  const topY = 20;

  const points = dailyData.map((d, index) => {
    const divisor = Math.max(1, dailyData.length - 1);
    const x = paddingX + (index / divisor) * (width - 2 * paddingX);
    const ratio = Math.max(0.04, d.minutes / maxMinutes);
    const y = bottomY - ratio * (bottomY - topY);
    return { ...d, x, y };
  });

  // Build smooth cubic bezier curve for line chart
  const buildSmoothPath = () => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const curvePath = buildSmoothPath();
  const areaPath = points.length > 0 ? `${curvePath} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z` : '';

  const activeDay = hoveredDay !== null ? hoveredDay : todayDateNum;
  const activePoint = points.find((p) => p.day === activeDay) || points[todayDateNum - 1] || points[0] || { day: 1, minutes: 0, count: 0 };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonthName = monthNames[month];

  return (
    <div className="w-full mt-2 relative select-none space-y-3" id="monthly-activity-chart">
      {/* Top Banner with Summary Stats */}
      <div className={`p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 shadow-sm ${
        isLight
          ? 'bg-slate-50 border-slate-200'
          : 'bg-gradient-to-r from-[#08152e] via-[#0b1d3d] to-[#08152e] border-cyan-500/25'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-400/30">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {currentMonthName} Overview
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                isLight ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' : 'bg-cyan-500/20 text-cyan-300'
              }`}>
                {Math.floor(totalMonthlyMinutes / 60)}h {totalMonthlyMinutes % 60}m Total
              </span>
            </div>
            <p className={`text-[11px] font-medium mt-0.5 ${isLight ? 'text-slate-600' : 'text-sky-200/80'}`}>
              Active on {activeDaysCount} of {daysInMonth} days · Peak: Day {peakDay.day} ({peakDay.minutes}m)
            </p>
          </div>
        </div>

        <div className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border ${
          isLight ? 'bg-white border-slate-300 text-cyan-800' : 'bg-cyan-950/60 border-cyan-500/30 text-cyan-300'
        }`}>
          {activePoint ? `${currentMonthName} ${activePoint.day}: ${activePoint.minutes} min` : ''}
        </div>
      </div>

      {/* Main SVG Line Chart Container */}
      <div className={`relative w-full rounded-2xl border p-3 shadow-inner overflow-x-auto ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-gradient-to-b from-[#071329]/95 to-[#030917]/95 border-sky-500/25'
      }`}>
        <div className="min-w-[700px]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className="w-full h-[220px]"
          >
            <defs>
              <linearGradient id="monthlyAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00d2ff" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#0072ff" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#030c1f" stopOpacity="0.0" />
              </linearGradient>
              <filter id="monthlyLineGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Horizontal Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const yLine = bottomY - ratio * (bottomY - topY);
              const labelVal = Math.round(maxMinutes * ratio);
              return (
                <g key={idx}>
                  <text
                    x={paddingX - 8}
                    y={yLine + 4}
                    textAnchor="end"
                    fill={isLight ? '#64748b' : '#38bdf8'}
                    fontSize="9"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                    opacity="0.8"
                  >
                    {labelVal}m
                  </text>
                  <line
                    x1={paddingX}
                    y1={yLine}
                    x2={width - paddingX}
                    y2={yLine}
                    stroke={isLight ? '#cbd5e1' : '#122c52'}
                    strokeWidth="0.8"
                    strokeDasharray="3 3"
                    opacity="0.5"
                  />
                </g>
              );
            })}

            {/* Area under curve */}
            {areaPath && <path d={areaPath} fill="url(#monthlyAreaGrad)" />}

            {/* Glowing line chart path */}
            {curvePath && (
              <path
                d={curvePath}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3"
                strokeLinecap="round"
                filter="url(#monthlyLineGlow)"
              />
            )}

            {/* Interactive Data Points */}
            {points.map((p) => {
              const isSelected = p.day === activeDay;
              return (
                <g
                  key={p.day}
                  className="cursor-pointer transition-all"
                  onClick={() => setHoveredDay(p.day)}
                  onMouseEnter={() => setHoveredDay(p.day)}
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="12"
                    fill="transparent"
                  />
                  {isSelected && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="8"
                      fill="#00e5ff"
                      opacity="0.3"
                    />
                  )}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isSelected ? "5" : "3.5"}
                    fill={isSelected ? "#ffffff" : "#38bdf8"}
                    stroke="#03142e"
                    strokeWidth="2"
                  />
                </g>
              );
            })}

            {/* X-Axis Baseline */}
            <line
              x1={paddingX}
              y1={bottomY}
              x2={width - paddingX}
              y2={bottomY}
              stroke={isLight ? '#cbd5e1' : '#1d3d6e'}
              strokeWidth="1.2"
            />

            {/* X-Axis Date Numbers */}
            {points.map((p) => {
              const isSelected = p.day === activeDay;
              if (daysInMonth > 20 && p.day % 2 !== 0 && p.day !== 1 && p.day !== daysInMonth) return null;
              return (
                <text
                  key={`day-label-${p.day}`}
                  x={p.x}
                  y={bottomY + 16}
                  textAnchor="middle"
                  fill={isSelected ? (isLight ? '#0f172a' : '#ffffff') : (isLight ? '#475569' : '#64748b')}
                  fontSize="10"
                  fontWeight={isSelected ? '800' : '600'}
                  fontFamily="Plus Jakarta Sans, sans-serif"
                >
                  {p.day}
                </text>
              );
            })}
          </svg>
        </div>

        <div className={`flex items-center justify-between text-[11px] px-2 pt-2 border-t mt-2 ${
          isLight ? 'text-slate-600 border-slate-200' : 'text-slate-400 border-sky-500/10'
        }`}>
          <span className="font-medium">
            Hover or click any data point to inspect exact daily minutes.
          </span>
          <span className={`font-mono text-[10px] ${isLight ? 'text-cyan-700 font-semibold' : 'text-cyan-400'}`}>
            {currentMonthName} Daily Trend →
          </span>
        </div>
      </div>
    </div>
  );
};
