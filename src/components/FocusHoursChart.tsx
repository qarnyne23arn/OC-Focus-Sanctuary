import React, { useState } from 'react';
import { StudySession } from '../types';

interface FocusHoursChartProps {
  sessions: StudySession[];
  isLight?: boolean;
}

export const FocusHoursChart: React.FC<FocusHoursChartProps> = ({
  sessions,
  isLight = false,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Get current year and month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthShortNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthShort = monthShortNames[month];

  // Compute daily hours for each day of the month
  const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dayStrFormatted = `${currentMonthShort} ${String(dayNum).padStart(2, '0')}`;

    const matched = sessions.filter((s) => {
      const sDate = s.date || (s.timestamp ? s.timestamp.slice(0, 10) : '');
      return sDate === dateStr;
    });

    const totalMinutes = matched.reduce((acc, curr) => acc + (curr.actualMinutes || curr.durationMinutes || 0), 0);
    const rawHours = totalMinutes / 60;
    const hours = totalMinutes > 0 && rawHours < 0.05 ? Number(rawHours.toFixed(2)) : Number(rawHours.toFixed(1));

    return {
      day: dayNum,
      date: dayStrFormatted,
      hours,
      totalMinutes,
    };
  });

  // Compute stat card values dynamically
  const totalHoursNum = dailyData.reduce((acc, curr) => acc + curr.hours, 0);
  const totalThisMonth = totalHoursNum >= 10 ? totalHoursNum.toFixed(1) : totalHoursNum.toFixed(2);

  // Daily average (averaged over days up to today or daysInMonth)
  const daysElapsed = Math.min(daysInMonth, now.getDate());
  const dailyAverageNum = daysElapsed > 0 ? totalHoursNum / daysElapsed : 0;
  const dailyAverage = dailyAverageNum >= 10 ? dailyAverageNum.toFixed(1) : dailyAverageNum.toFixed(2);

  // Best day
  const bestDayObj = dailyData.reduce((max, d) => (d.hours > max.hours ? d : max), dailyData[0] || { hours: 0 });
  const bestDay = bestDayObj.hours >= 10 ? bestDayObj.hours.toFixed(1) : bestDayObj.hours.toFixed(2);

  // Flexible Y-axis maximum & step calculation (using integer hour parameters like 1h, 2h, 3h...)
  const maxDataHours = Math.max(...dailyData.map((d) => d.hours), 1); // at least 1h
  // Determine clean step size and max limit dynamically
  let topLimit = Math.ceil(maxDataHours * 1.25);
  if (topLimit < 4) topLimit = 4; // minimum 4h scale for neat grid
  const stepCount = 4;
  const stepSize = Math.max(1, Math.ceil(topLimit / stepCount));
  const maxHoursVal = stepSize * stepCount;

  // SVG dimensions
  const width = 760;
  const height = 260;
  const paddingX = 45;
  const bottomY = height - 35;
  const topY = 25;

  const points = dailyData.map((d, index) => {
    const divisor = Math.max(1, dailyData.length - 1);
    const x = paddingX + (index / divisor) * (width - 2 * paddingX);
    const ratio = Math.max(0.02, d.hours / maxHoursVal);
    const y = bottomY - ratio * (bottomY - topY);
    return { ...d, x, y };
  });

  // Find index of highest value data point
  const peakIndex = points.reduce((maxIdx, p, idx, arr) => (p.hours > arr[maxIdx].hours ? idx : maxIdx), 0);

  // Build smooth cubic bezier curve
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

  const activeIndex = hoveredIndex !== null ? hoveredIndex : peakIndex;
  const activePoint = points[activeIndex] || points[0];

  return (
    <div className="w-full mt-2 font-sans select-none space-y-4" id="focus-hours-dashboard">
      {/* 1. Stat Cards Row (~12px gap) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total this month */}
        <div 
          className="p-4 rounded-lg flex flex-col justify-between transition"
          style={{ 
            backgroundColor: isLight ? '#f4f4f2' : '#111827',
            border: isLight ? '1px solid #e1e0d9' : '1px solid #1f2937'
          }}
        >
          <span 
            className="text-[13px] font-medium"
            style={{ color: isLight ? '#6b6a66' : '#9ca3af' }}
          >
            Total this month
          </span>
          <div 
            className="text-[24px] font-medium mt-1 tracking-tight"
            style={{ color: isLight ? '#111110' : '#f9fafb' }}
          >
            {totalThisMonth}h
          </div>
        </div>

        {/* Daily average */}
        <div 
          className="p-4 rounded-lg flex flex-col justify-between transition"
          style={{ 
            backgroundColor: isLight ? '#f4f4f2' : '#111827',
            border: isLight ? '1px solid #e1e0d9' : '1px solid #1f2937'
          }}
        >
          <span 
            className="text-[13px] font-medium"
            style={{ color: isLight ? '#6b6a66' : '#9ca3af' }}
          >
            Daily average
          </span>
          <div 
            className="text-[24px] font-medium mt-1 tracking-tight"
            style={{ color: isLight ? '#111110' : '#f9fafb' }}
          >
            {dailyAverage}h
          </div>
        </div>

        {/* Best day */}
        <div 
          className="p-4 rounded-lg flex flex-col justify-between transition"
          style={{ 
            backgroundColor: isLight ? '#f4f4f2' : '#111827',
            border: isLight ? '1px solid #e1e0d9' : '1px solid #1f2937'
          }}
        >
          <span 
            className="text-[13px] font-medium"
            style={{ color: isLight ? '#6b6a66' : '#9ca3af' }}
          >
            Best day
          </span>
          <div 
            className="text-[24px] font-medium mt-1 tracking-tight"
            style={{ color: isLight ? '#111110' : '#f9fafb' }}
          >
            {bestDay}h
          </div>
        </div>
      </div>

      {/* 2. Line Chart Section */}
      <div 
        className="p-4 rounded-lg relative overflow-x-auto transition"
        style={{ 
          backgroundColor: isLight ? '#f4f4f2' : '#111827',
          border: isLight ? '1px solid #e1e0d9' : '1px solid #1f2937'
        }}
      >
        <div className="min-w-[650px] relative">
          {/* Tooltip on hover */}
          {hoveredIndex !== null && activePoint && (
            <div 
              className="absolute z-30 px-3 py-1.5 rounded text-xs font-medium shadow-xl pointer-events-none transition-all"
              style={{
                backgroundColor: '#0b0b0b',
                color: '#ffffff',
                left: `${Math.max(30, Math.min(width - 80, activePoint.x))}px`,
                top: `${Math.max(10, activePoint.y - 45)}px`,
                transform: 'translateX(-50%)',
              }}
            >
              {activePoint.date} · {activePoint.hours}h focused ({activePoint.totalMinutes}m)
            </div>
          )}

          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className="w-full h-[240px] overflow-visible"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <defs>
              <linearGradient id="focusChartAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#378ADD" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#378ADD" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal gridlines with integer hour parameters (e.g. 1h, 2h, 3h...) */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const yLine = bottomY - ratio * (bottomY - topY);
              const labelVal = Math.round(maxHoursVal * ratio);
              return (
                <g key={idx}>
                  <text
                    x={paddingX - 10}
                    y={yLine + 4}
                    textAnchor="end"
                    fill={isLight ? '#6b6a66' : '#9ca3af'}
                    fontSize="11"
                    fontFamily="sans-serif"
                  >
                    {labelVal}h
                  </text>
                  <line
                    x1={paddingX}
                    y1={yLine}
                    x2={width - paddingX}
                    y2={yLine}
                    stroke={isLight ? '#e1e0d9' : '#374151'}
                    strokeWidth="1"
                  />
                </g>
              );
            })}

            {/* Area fill under the line */}
            {areaPath && <path d={areaPath} fill="url(#focusChartAreaGradient)" />}

            {/* Smoothly curved line */}
            {curvePath && (
              <path
                d={curvePath}
                fill="none"
                stroke="#378ADD"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Hover Crosshair line */}
            {hoveredIndex !== null && activePoint && (
              <line
                x1={activePoint.x}
                y1={topY}
                x2={activePoint.x}
                y2={bottomY}
                stroke="#378ADD"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.6"
              />
            )}

            {/* Data points */}
            {points.map((p, idx) => {
              const isPeak = idx === peakIndex;
              const isHovered = idx === hoveredIndex;
              const showPoint = isPeak || isHovered || p.hours > 0;

              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="14"
                    fill="transparent"
                  />

                  {showPoint && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? "7" : "6"}
                      fill="#378ADD"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  )}
                </g>
              );
            })}

            {/* X-Axis Dates */}
            {points.map((p, idx) => {
              const total = points.length;
              const showLabel = idx === 0 || idx === total - 1 || (idx % 5 === 0 && total - 1 - idx >= 2);
              if (!showLabel) return null;

              return (
                <text
                  key={`x-label-${idx}`}
                  x={p.x}
                  y={bottomY + 20}
                  textAnchor="middle"
                  fill={isLight ? '#6b6a66' : '#9ca3af'}
                  fontSize="11"
                  fontFamily="sans-serif"
                >
                  {p.date}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
