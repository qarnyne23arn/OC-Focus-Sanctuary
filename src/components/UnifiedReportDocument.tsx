import React, { forwardRef } from 'react';
import { StudySession, BlockedWebsite, DistractionLogItem } from '../types';
import { calculateDailyReport, calculateMonthlyReport } from '../utils/reports';

interface UnifiedReportDocumentProps {
  sessions: StudySession[];
  blockedSites?: BlockedWebsite[];
  distractionCount?: number;
  distractionLog?: DistractionLogItem[];
  dateStr?: string;
  year?: number;
  month?: number;
  goalMinutes?: number;
}

export const UnifiedReportDocument = forwardRef<HTMLDivElement, UnifiedReportDocumentProps>(({
  sessions,
  blockedSites = [],
  distractionCount = 0,
  distractionLog = [],
  dateStr = new Date().toISOString().slice(0, 10),
  year = new Date().getFullYear(),
  month = new Date().getMonth(),
  goalMinutes = 240, // 4 hours target
}, ref) => {
  const daily = calculateDailyReport(sessions, dateStr, blockedSites, goalMinutes, distractionLog);
  const monthly = calculateMonthlyReport(sessions, year, month, blockedSites);

  const dailyHours = (daily.focusedMinutes / 60).toFixed(1);
  const targetHours = (goalMinutes / 60).toFixed(1);

  // Helper for SVG Pie Chart Arc calculation
  const renderPieChart = (categories: [string, number][], totalMins: number) => {
    if (totalMins === 0 || categories.length === 0) {
      return (
        <svg width="110" height="110" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r="45" fill="#1a1d24" stroke="#2a2e39" strokeWidth="6" />
          <text x="55" y="59" textAnchor="middle" fill="#9ca3af" fontSize="10" fontFamily="sans-serif">No data</text>
        </svg>
      );
    }

    if (categories.length === 1) {
      return (
        <svg width="110" height="110" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r="45" fill="#4a8fd6" stroke="#0f1115" strokeWidth="3" />
          <text x="55" y="59" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="sans-serif">100%</text>
        </svg>
      );
    }

    let cumulativeAngle = 0;
    const colors = ['#4a8fd6', '#6b9b37', '#d99a3d', '#d96b6b', '#a8c97f'];

    return (
      <svg width="110" height="110" viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)' }}>
        {categories.map(([name, mins], idx) => {
          const percentage = mins / totalMins;
          const angle = percentage * 360;
          const x1 = 55 + 45 * Math.cos((Math.PI * cumulativeAngle) / 180);
          const y1 = 55 + 45 * Math.sin((Math.PI * cumulativeAngle) / 180);
          
          cumulativeAngle += angle;
          const x2 = 55 + 45 * Math.cos((Math.PI * cumulativeAngle) / 180);
          const y2 = 55 + 45 * Math.sin((Math.PI * cumulativeAngle) / 180);

          const largeArcFlag = angle > 180 ? 1 : 0;
          const pathData = `M 55 55 L ${x1} ${y1} A 45 45 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

          return (
            <path
              key={name}
              d={pathData}
              fill={colors[idx % colors.length]}
              stroke="#0f1115"
              strokeWidth="2.5"
            />
          );
        })}
      </svg>
    );
  };

  // Monthly polyline points calculation
  const maxMonthlyMin = Math.max(1, ...monthly.dailyTrend.map(d => d.mins));
  const monthlyPolylinePoints = monthly.dailyTrend.map((d, i) => {
    const x = (i / Math.max(1, monthly.dailyTrend.length - 1)) * 640 + 20;
    const y = 80 - (d.mins / maxMonthlyMin) * 60;
    return `${x},${Math.max(15, y)}`;
  }).join(' ');

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #report-container, #report-container * {
            visibility: visible;
          }
          #report-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background-color: #0f1115 !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            background: #0f1115;
            margin: 0.5in;
          }
        }
      `}</style>
      <div
        ref={ref}
        id="report-container"
        style={{ width: '760px', backgroundColor: '#0f1115', color: '#ffffff', padding: '32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column', gap: '32px', userSelect: 'none', fontFamily: 'sans-serif' }}
      >
        {/* ================= DAILY REPORT SECTION ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', color: '#6b9b37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#ffffff', letterSpacing: '-0.025em' }}>Today's match report</h2>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Daily performance & focus telemetry</p>
              </div>
            </div>
            <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 500, color: '#4a8fd6', backgroundColor: '#1a1d24', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              {dateStr}
            </span>
          </div>

          {/* Scoreboard Row (6 cards in 3x2 grid) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }}>
            {/* Card 1: Focused time */}
            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>Focused time</span>
              <div style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'monospace', color: '#ffffff' }}>{dailyHours}h</div>
              <span style={{ fontSize: '10px', color: daily.focusedMinutes >= goalMinutes ? '#6b9b37' : '#d96b6b' }}>
                {daily.focusedMinutes >= goalMinutes ? 'Goal achieved' : `Target: ${targetHours}h`}
              </span>
            </div>

            {/* Card 2: Sessions won */}
            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>Sessions won</span>
              <div style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'monospace', color: '#ffffff' }}>{daily.sessionsWon}/{daily.sessionsTotal}</div>
              <span style={{ fontSize: '10px', color: '#6b9b37' }}>{Math.round(daily.successRate * 100)}% completion</span>
            </div>

            {/* Card 3: Best streak */}
            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>Best streak</span>
              <div style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'monospace', color: '#ffffff' }}>{daily.bestStreakMinutes}m</div>
              <span style={{ fontSize: '10px', color: '#a8c97f' }}>Unbroken focus</span>
            </div>

            {/* Card 4: Shielded */}
            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>Shielded sites</span>
              <div style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'monospace', color: '#ffffff' }}>{daily.shieldedCount} active</div>
              <span style={{ fontSize: '10px', color: '#4a8fd6' }}>Distractions blocked</span>
            </div>

            {/* Card 5: Energy shift */}
            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>Energy shift</span>
              <div style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'monospace', color: '#a8c97f' }}>
                {daily.energy_shift.start} → {daily.energy_shift.end}
              </div>
              <span style={{ fontSize: '10px', color: '#9ca3af' }}>Scale 1–5 average</span>
            </div>

            {/* Card 6: Break adherence */}
            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>Break adherence</span>
              <div style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'monospace', color: '#ffffff' }}>
                {daily.break_adherence.taken}/{daily.break_adherence.scheduled}
              </div>
              <span style={{ fontSize: '10px', color: '#d99a3d' }}>{Math.round(daily.break_adherence.rate * 100)}% rating</span>
            </div>
          </div>

          {/* Focused minutes by hour */}
          <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af' }}>
              <span>Focused minutes by hour (6am – 12pm & 6pm – 12am)</span>
              <span style={{ color: '#ffffff', fontFamily: 'monospace' }}>Intensity graded</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '96px', paddingTop: '16px', paddingLeft: '8px', paddingRight: '8px' }}>
              {(() => {
                const maxHourMins = Math.max(1, ...daily.hourlyBars.map(b => b.mins), 60);
                return daily.hourlyBars.map((item, idx) => {
                  const heightPct = Math.max(item.mins > 0 ? 15 : 4, Math.min(100, (item.mins / maxHourMins) * 100));
                  const color = item.mins >= 45 ? '#6b9b37' : item.mins >= 15 ? '#a8c97f' : (item.mins > 0 ? '#3b82f6' : '#2a2e39');
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1, margin: '0 4px' }}>
                      <div
                        style={{ width: '100%', borderTopLeftRadius: '4px', borderTopRightRadius: '4px', height: `${heightPct}%`, backgroundColor: color, minHeight: '4px' }}
                        title={`${item.hour}: ${item.mins} mins`}
                      />
                      <span style={{ fontSize: '9px', color: '#9ca3af', fontFamily: 'monospace' }}>{item.hour}</span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Session energy timeline */}
          <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af' }}>
              <span>Session energy timeline</span>
              <span style={{ color: '#ffffff', fontFamily: 'monospace' }}>Chronological progression</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '8px', paddingTop: '8px' }}>
              {daily.timeline.length === 0 ? (
                <div style={{ gridColumn: 'span 6', fontSize: '12px', color: '#9ca3af', fontStyle: 'italic', padding: '8px 0' }}>No session blocks recorded today.</div>
              ) : (
                daily.timeline.map((s, idx) => {
                  const hasEnergy = s.energy !== null && s.energy !== undefined;
                  const bg = !hasEnergy ? '#2a2e39' : s.energy >= 4 ? '#6b9b37' : s.energy === 3 ? '#d99a3d' : '#d96b6b';
                  return (
                    <div key={idx} style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#0f1115', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ height: '12px', borderRadius: '4px', backgroundColor: bg }} />
                      <span style={{ fontSize: '9px', fontFamily: 'monospace', color: '#9ca3af', display: 'block' }}>{s.time}</span>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#ffffff', display: 'block' }}>
                        {hasEnergy ? `${s.energy}/5` : 'Not Rated'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Time by task & MVP vs Missed */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
            <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>Time by task/category</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {daily.categories.length === 0 ? (
                    <span style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>No categories logged</span>
                  ) : (
                    daily.categories.map(([cat, mins], idx) => {
                      const colors = ['#4a8fd6', '#6b9b37', '#d99a3d', '#d96b6b', '#a8c97f'];
                      return (
                        <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '9999px', backgroundColor: colors[idx % colors.length], display: 'inline-block' }} />
                          <span style={{ color: '#ffffff', fontWeight: 500 }}>{cat}</span>
                          <span style={{ color: '#9ca3af', fontFamily: 'monospace', marginLeft: 'auto' }}>{mins}m</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              <div style={{ paddingLeft: '12px' }}>
                {renderPieChart(daily.categories, daily.focusedMinutes)}
              </div>
            </div>

            <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '12px', color: '#6b9b37', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>MVP Session</span>
                {daily.mvpSession ? (
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff' }}>
                    {daily.mvpSession.subject} <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#9ca3af', fontWeight: 'normal' }}>({daily.mvpSession.duration}m)</span>
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>No completed MVP session yet</div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '12px', color: '#d96b6b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Most Fragile Session</span>
                {daily.missedSession ? (
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff' }}>
                    {daily.missedSession.subject} <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#9ca3af', fontWeight: 'normal' }}>({daily.missedSession.duration}m)</span>
                    <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 'normal', margin: '2px 0 0 0' }}>{daily.missedSession.reason}</p>
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>Zero interrupted or fragile sessions</div>
                )}
              </div>
            </div>
          </div>

          {/* Distraction log */}
          <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af' }}>
              <span>Distraction & intercepted site log</span>
              <span style={{ color: '#ffffff', fontFamily: 'monospace' }}>Real-time shield logs</span>
            </div>
            {daily.distractionLog.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic', padding: '8px 0' }}>No distractions logged today. Shield is clean!</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {daily.distractionLog.map((log, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#0f1115', border: '1px solid rgba(255,255,255,0.05)', fontSize: '12px' }}>
                    <span style={{ fontFamily: 'monospace', color: '#ffffff', fontWeight: 500 }}>{log.domain}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#9ca3af' }}>
                      <span>{log.visits} visits</span>
                      <span style={{ fontFamily: 'monospace', color: '#d96b6b' }}>{log.totalSec}s intercepted</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pattern note */}
          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ padding: '4px 10px', borderRadius: '8px', backgroundColor: 'rgba(107, 155, 55, 0.2)', color: '#6b9b37', fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace' }}>
              Pattern
            </span>
            <p style={{ fontSize: '12px', color: '#d1d5db', fontWeight: 500, margin: 0 }}>{daily.pattern_note}</p>
          </div>
        </div>

        {/* ================= MONTHLY SEASON REVIEW SECTION ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', color: '#4a8fd6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#ffffff', letterSpacing: '-0.025em' }}>Season review & telemetry</h2>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Monthly aggregate performance & trends</p>
              </div>
            </div>
            <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 500, color: '#ffffff', backgroundColor: '#1a1d24', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              {monthly.totalMinutes}m Total Output
            </span>
          </div>

          {/* Monthly Scoreboard */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px' }}>
            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>Monthly total</span>
              <div style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'monospace', color: '#ffffff' }}>{(monthly.totalMinutes / 60).toFixed(1)}h</div>
              <span style={{ fontSize: '10px', color: '#6b9b37' }}>+{monthly.percentChange}% vs prior</span>
            </div>
            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>Daily average</span>
              <div style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'monospace', color: '#ffffff' }}>{monthly.avgDailyMinutes}m</div>
              <span style={{ fontSize: '10px', color: '#4a8fd6' }}>Across {monthly.activeDaysCount} active days</span>
            </div>
            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>Peak day</span>
              <div style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'monospace', color: '#ffffff' }}>{monthly.peakDay.mins}m</div>
              <span style={{ fontSize: '10px', color: '#a8c97f' }}>Day {monthly.peakDay.day} of month</span>
            </div>
            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>Break rate</span>
              <div style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'monospace', color: '#ffffff' }}>{Math.round(monthly.break_adherence_rate * 100)}%</div>
              <span style={{ fontSize: '10px', color: '#d99a3d' }}>Monthly adherence</span>
            </div>
          </div>

          {/* Monthly Daily Trend Sparkline */}
          <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af' }}>
              <span>Monthly daily output trend</span>
              <span style={{ color: '#ffffff', fontFamily: 'monospace' }}>20-day cadence</span>
            </div>
            <div style={{ height: '96px', width: '100%', position: 'relative', paddingTop: '8px' }}>
              <svg style={{ width: '100%', height: '100%', overflow: 'visible' }} viewBox="0 0 680 90">
                <polyline
                  fill="none"
                  stroke="#6b9b37"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={monthlyPolylinePoints}
                />
              </svg>
            </div>
          </div>

          {/* Weekly Adherence & Top Distractions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
            <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>Weekly break adherence rate</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {monthly.break_adherence_by_week.map(w => (
                  <div key={w.week_number} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#ffffff' }}>Week {w.week_number}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '128px', height: '8px', borderRadius: '9999px', backgroundColor: '#0f1115', overflow: 'hidden' }}>
                        <div style={{ height: '100%', backgroundColor: '#6b9b37', width: `${w.rate * 100}%` }} />
                      </div>
                      <span style={{ fontFamily: 'monospace', color: '#9ca3af', width: '32px', textAlign: 'right' }}>{Math.round(w.rate * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>Configured shield & distractions</span>
              {monthly.topDistractions.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic', padding: '16px 0' }}>No blocked sites configured.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {monthly.topDistractions.map(d => (
                    <div key={d.rank} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '8px', backgroundColor: '#0f1115', border: '1px solid rgba(255,255,255,0.05)', fontSize: '12px' }}>
                      <span style={{ fontFamily: 'monospace', color: '#ffffff' }}>#{d.rank} {d.domain}</span>
                      <span style={{ fontSize: '10px', color: '#9ca3af', fontFamily: 'monospace' }}>Active shield</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Season Summary & Next Move */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '10px', color: '#6b9b37', textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '0.05em' }}>Player of the Month</span>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff' }}>{monthly.playerOfTheMonth.title}</div>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{monthly.playerOfTheMonth.subtitle}</p>
            </div>
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '10px', color: '#4a8fd6', textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '0.05em' }}>Next Month's Move</span>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff' }}>{monthly.nextMonthsMove.title}</div>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{monthly.nextMonthsMove.subtitle}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

UnifiedReportDocument.displayName = 'UnifiedReportDocument';
