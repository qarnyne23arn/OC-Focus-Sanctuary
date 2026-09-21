import React, { useState } from 'react';
import { TimerMode } from '../types';
import { Edit3, Check, X, Clock, Plus, Minus, Maximize2, Minimize2, Sparkles } from 'lucide-react';

interface CircularTimerProps {
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  mode: TimerMode;
  onToggle: () => void;
  onSetCustomDuration: (minutes: number) => void;
  size?: number;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onEnterZenMode?: () => void;
  isLight?: boolean;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({
  remainingSeconds,
  totalSeconds,
  isRunning,
  mode,
  onToggle,
  onSetCustomDuration,
  size = 310,
  isExpanded = false,
  onToggleExpand,
  onEnterZenMode,
  isLight = false,
}) => {
  const [isEditingTime, setIsEditingTime] = useState(false);
  const currentMinutes = Math.floor(remainingSeconds / 60);
  const [inputMinutes, setInputMinutes] = useState(currentMinutes || 45);

  const center = size / 2;
  
  // Format minutes and seconds
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Progress fraction (0 to 1)
  const fraction = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;
  const displayFraction = remainingSeconds === totalSeconds 
    ? (minutes / 60) // e.g. 45 / 60 = 0.75
    : Math.max(0.02, fraction);

  // Outer ticks: 60 tick marks
  const tickCount = 60;
  const outerTickRadius = center - 12;
  const majorTickLength = 10;
  const minorTickLength = 5;

  const ticks = Array.from({ length: tickCount }).map((_, i) => {
    const angleDeg = (i * 360) / tickCount - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    const isMajor = i % 5 === 0;
    const length = isMajor ? majorTickLength : minorTickLength;

    const x1 = center + (outerTickRadius - length) * Math.cos(angleRad);
    const y1 = center + (outerTickRadius - length) * Math.sin(angleRad);
    const x2 = center + outerTickRadius * Math.cos(angleRad);
    const y2 = center + outerTickRadius * Math.sin(angleRad);

    return {
      id: i,
      x1,
      y1,
      x2,
      y2,
      isMajor,
    };
  });

  // Circular progress ring
  const progressRadius = center - 38;
  const circumference = 2 * Math.PI * progressRadius;
  const strokeDashoffset = circumference * (1 - displayFraction);

  // Inner ring with hours (12, 3, 6, 9) and dots for others
  const innerRingRadius = center - 62;
  const numberPositions = [
    { label: '12', hour: 0, isNumber: true },
    { label: '•', hour: 1, isNumber: false },
    { label: '•', hour: 2, isNumber: false },
    { label: '3', hour: 3, isNumber: true },
    { label: '•', hour: 4, isNumber: false },
    { label: '•', hour: 5, isNumber: false },
    { label: '6', hour: 6, isNumber: true },
    { label: '•', hour: 7, isNumber: false },
    { label: '•', hour: 8, isNumber: false },
    { label: '9', hour: 9, isNumber: true },
    { label: '•', hour: 10, isNumber: false },
    { label: '•', hour: 11, isNumber: false },
  ];

  const markerElements = numberPositions.map((pos) => {
    const angleDeg = (pos.hour * 360) / 12 - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = center + innerRingRadius * Math.cos(angleRad);
    const y = center + innerRingRadius * Math.sin(angleRad);
    return { ...pos, x, y };
  });

  const getThemeColors = () => {
    if (mode === 'short_break') {
      return {
        strokeGradientStart: '#059669',
        strokeGradientEnd: '#34d399',
        textColor: isLight ? 'text-emerald-800' : 'text-emerald-300',
      };
    }
    if (mode === 'long_break') {
      return {
        strokeGradientStart: '#7c3aed',
        strokeGradientEnd: '#c084fc',
        textColor: isLight ? 'text-purple-800' : 'text-purple-300',
      };
    }
    return {
      strokeGradientStart: '#0077ff',
      strokeGradientEnd: '#38bdf8',
      textColor: isLight ? 'text-cyan-800' : 'text-sky-300',
    };
  };

  const colors = getThemeColors();

  const handleSaveCustomTime = () => {
    const validMinutes = Math.min(180, Math.max(1, inputMinutes));
    onSetCustomDuration(validMinutes);
    setIsEditingTime(false);
  };

  const presets = [15, 25, 30, 45, 50, 60, 90];

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <div 
        id="circular-timer-container" 
        className="relative group"
      >
        {/* SVG Circular Dial Matching image */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible"
        >
          <defs>
            {/* Vibrant Cyan-Blue Gradient for Progress Ring */}
            <linearGradient id="timerArcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.strokeGradientStart} />
              <stop offset="60%" stopColor="#00c8ff" />
              <stop offset="100%" stopColor={colors.strokeGradientEnd} />
            </linearGradient>

            {/* Glowing filter */}
            <filter id="timerGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Subtle inner dial face gradient */}
            <radialGradient id="timerFaceGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={isLight ? "#f8fafc" : "#071224"} />
              <stop offset="85%" stopColor={isLight ? "#f1f5f9" : "#091730"} />
              <stop offset="100%" stopColor={isLight ? "#e2e8f0" : "#050e1e"} />
            </radialGradient>
          </defs>

          {/* 1. Outer Tick Marks (60 ticks) */}
          <g id="dial-ticks">
            {ticks.map((t) => (
              <line
                key={t.id}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke={t.isMajor ? (isLight ? '#0284c7' : '#38bdf8') : (isLight ? '#94a3b8' : '#1e3a5f')}
                strokeWidth={t.isMajor ? 2 : 1.2}
                strokeLinecap="round"
                opacity={t.isMajor ? 0.95 : (isLight ? 0.75 : 0.45)}
              />
            ))}
          </g>

          {/* 2. Track Background for Progress Arc */}
          <circle
            cx={center}
            cy={center}
            r={progressRadius}
            fill="none"
            stroke={isLight ? "#cbd5e1" : "#0b2244"}
            strokeWidth="10"
            opacity={isLight ? "0.8" : "0.6"}
          />

          {/* 3. Glowing Progress Arc (Cyan/Electric Blue) */}
          <circle
            cx={center}
            cy={center}
            r={progressRadius}
            fill="none"
            stroke="url(#timerArcGradient)"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#timerGlow)"
            transform={`rotate(-90 ${center} ${center})`}
            className="transition-all duration-300 ease-out"
          />

          {/* 4. Inner Dial Circle Face with Subtle Rim */}
          <circle
            cx={center}
            cy={center}
            r={innerRingRadius + 14}
            fill="url(#timerFaceGradient)"
            stroke={isLight ? "#cbd5e1" : "#163259"}
            strokeWidth="1.5"
            className="cursor-pointer"
            onClick={onToggle}
          />

          {/* 5. Inner Concentric Ring with Markers */}
          <circle
            cx={center}
            cy={center}
            r={innerRingRadius}
            fill="none"
            stroke={isLight ? "#94a3b8" : "#1d3f6d"}
            strokeWidth="1"
            strokeDasharray="2 4"
            opacity={isLight ? "0.8" : "0.6"}
            className="pointer-events-none"
          />

          {/* 6. Numbers: 12, 3, 6, 9 and Hour Dots */}
          <g id="dial-hour-markers" className="pointer-events-none">
            {markerElements.map((m, idx) => {
              if (m.isNumber) {
                return (
                  <text
                    key={idx}
                    x={m.x}
                    y={m.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={isLight ? '#334155' : '#94a3b8'}
                    fontSize="13"
                    fontWeight="700"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                    className="select-none"
                  >
                    {m.label}
                  </text>
                );
              }
              return (
                <circle
                  key={idx}
                  cx={m.x}
                  cy={m.y}
                  r="1.75"
                  fill={isLight ? '#64748b' : '#64748b'}
                  opacity={isLight ? '0.9' : '0.8'}
                />
              );
            })}
          </g>
        </svg>

        {/* 7. Center Display: Countdown Or Inline Custom Time Editor */}
        {!isEditingTime ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Clickable Time Display: Clicking opens custom duration setter or click to play/pause */}
            <div className="flex items-center gap-1 group/time">
              <button
                type="button"
                id="timer-digital-display"
                onClick={onToggle}
                className={`text-5xl sm:text-6xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans'] cursor-pointer transition ${
                  isLight
                    ? 'text-slate-900 hover:text-cyan-700'
                    : 'text-white hover:text-cyan-200 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]'
                }`}
                title={isRunning ? "Click to Pause" : "Click to Start"}
              >
                {timeDisplay}
              </button>
            </div>

            {/* Mode Pill + Quick Edit Button */}
            <div className="mt-1 flex items-center gap-1.5">
              <div 
                onClick={onToggle}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide flex items-center gap-1.5 shadow-sm cursor-pointer transition ${
                  isLight
                    ? 'bg-slate-100 border border-slate-300 text-slate-800 hover:border-cyan-500'
                    : 'bg-slate-900/70 border border-slate-700/50 hover:border-sky-500/50'
                }`}
              >
                <span 
                  className={`w-1.5 h-1.5 rounded-full ${
                    isRunning ? 'bg-sky-500 animate-pulse' : 'bg-slate-400'
                  }`} 
                />
                <span className={`font-semibold ${colors.textColor}`}>
                  {isRunning ? (mode === 'focus' ? 'In Progress' : 'On Break') : 'Paused (Click to Start)'}
                </span>
              </div>

              {/* Set Timer Time by Yourself button */}
              {!isRunning && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setInputMinutes(Math.floor(totalSeconds / 60));
                    setIsEditingTime(true);
                  }}
                  className={`p-1 rounded-full border transition cursor-pointer ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                      : 'bg-sky-500/10 hover:bg-sky-500/25 border-sky-500/30 text-sky-300 hover:text-white'
                  }`}
                  title="Set Timer Duration (Customize Minutes)"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Inline Custom Time Setter Popover (Inside the dial face!) */
          <div 
            className={`absolute inset-0 flex flex-col items-center justify-center p-4 rounded-full border backdrop-blur-md z-20 ${
              isLight
                ? 'bg-white/95 border-cyan-500/40 text-slate-800 shadow-2xl'
                : 'bg-[#071329]/95 border-cyan-500/40 text-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`text-[11px] font-semibold flex items-center gap-1 mb-1 ${
              isLight ? 'text-cyan-800' : 'text-cyan-300'
            }`}>
              <Clock className="w-3 h-3" /> Set Focus Time
            </div>

            {/* Stepper Input */}
            <div className="flex items-center gap-2 my-1">
              <button
                type="button"
                onClick={() => setInputMinutes((m) => Math.max(1, m - 5))}
                className={`p-1 rounded-lg cursor-pointer transition ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
                title="-5 minutes"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center">
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={inputMinutes}
                  onChange={(e) => setInputMinutes(Number(e.target.value))}
                  className={`w-16 text-center text-3xl font-extrabold bg-transparent border-b focus:outline-none font-mono ${
                    isLight
                      ? 'text-slate-900 border-cyan-500'
                      : 'text-white border-cyan-400'
                  }`}
                  autoFocus
                />
                <span className={`text-xs ml-1 ${isLight ? 'text-slate-600' : 'text-sky-300'}`}>min</span>
              </div>

              <button
                type="button"
                onClick={() => setInputMinutes((m) => Math.min(180, m + 5))}
                className={`p-1 rounded-lg cursor-pointer transition ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
                title="+5 minutes"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-4 gap-1 my-1.5 max-w-[200px]">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setInputMinutes(preset)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                    inputMinutes === preset
                      ? 'bg-cyan-500 text-white font-bold'
                      : isLight
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {preset}m
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={handleSaveCustomTime}
                className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow cursor-pointer transition"
              >
                <Check className="w-3 h-3 stroke-[2.5]" /> Apply
              </button>
              <button
                type="button"
                onClick={() => setIsEditingTime(false)}
                className={`px-2.5 py-1 rounded-lg text-xs cursor-pointer transition ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Time Selector Bar below dial (accessible on desktop) */}
      {!isRunning && !isEditingTime && (
        <div className={`mt-1 flex items-center gap-1 text-[11px] ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
          <span className={`text-[10px] font-bold ${isLight ? 'text-cyan-700' : 'text-sky-400/80'}`}>Quick Set:</span>
          {[25, 45, 60].map((m) => {
            const isSelected = Math.floor(totalSeconds / 60) === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => onSetCustomDuration(m)}
                className={`px-2 py-0.5 rounded-full text-[10px] transition cursor-pointer ${
                  isSelected
                    ? isLight
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : isLight
                      ? 'bg-slate-200/90 hover:bg-slate-300 text-slate-700 font-semibold'
                      : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {m}m
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setInputMinutes(Math.floor(totalSeconds / 60));
              setIsEditingTime(true);
            }}
            className={`text-[10px] cursor-pointer ml-1 font-semibold hover:underline ${
              isLight ? 'text-cyan-700' : 'text-cyan-400'
            }`}
          >
            Custom...
          </button>
        </div>
      )}

      {/* Expand / Restore & Zen Mode action controls */}
      <div className="mt-2.5 flex items-center gap-2">
        {onToggleExpand && (
          <button
            type="button"
            onClick={onToggleExpand}
            className={`px-2.5 py-1 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                : 'bg-[#081836] hover:bg-[#0c2452] border-sky-500/20 hover:border-cyan-400/50 text-cyan-300'
            }`}
            title={isExpanded ? "Restore clock to normal size" : "Expand clock to enlarged view"}
          >
            {isExpanded ? (
              <>
                <Minimize2 className={`w-3.5 h-3.5 ${isLight ? 'text-slate-700' : 'text-cyan-400'}`} />
                <span>Restore Size</span>
              </>
            ) : (
              <>
                <Maximize2 className={`w-3.5 h-3.5 ${isLight ? 'text-slate-700' : 'text-cyan-400'}`} />
                <span>Expand Clock</span>
              </>
            )}
          </button>
        )}

        {onEnterZenMode && (
          <button
            type="button"
            onClick={onEnterZenMode}
            className={`px-2.5 py-1 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm ${
              isLight
                ? 'bg-cyan-50 hover:bg-cyan-100 border-cyan-300 text-cyan-800'
                : 'bg-gradient-to-r from-sky-900/60 to-cyan-900/60 hover:from-sky-800 hover:to-cyan-800 border-cyan-500/30 text-cyan-200'
            }`}
            title="Open Ambient Fullscreen Zen Sanctuary"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-cyan-600' : 'text-cyan-300'}`} />
            <span>Zen Sanctuary</span>
          </button>
        )}
      </div>
    </div>
  );
};
