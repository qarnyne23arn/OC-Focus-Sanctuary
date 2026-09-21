import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Maximize2, 
  Plus, 
  ChevronUp, 
  ChevronDown, 
  Clock, 
  X, 
  RotateCcw,
  GripHorizontal,
  ArrowRightToLine,
  ArrowLeftToLine,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { TimerMode } from '../types';

interface MiniFloatingTimerProps {
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  mode: TimerMode;
  activeTaskName: string;
  onToggleTimer: () => void;
  onExtend: (minutes: number) => void;
  onUndoExtend?: () => void;
  canUndoExtend?: boolean;
  onOpenZen: () => void;
  onHide: () => void;
  isLight?: boolean;
}

export const MiniFloatingTimer: React.FC<MiniFloatingTimerProps> = ({
  remainingSeconds,
  totalSeconds,
  isRunning,
  mode,
  activeTaskName,
  onToggleTimer,
  onExtend,
  onUndoExtend,
  canUndoExtend = false,
  onOpenZen,
  onHide,
  isLight = false,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isTuckedBeside, setIsTuckedBeside] = useState<boolean>(false);
  const [tuckedSide, setTuckedSide] = useState<'left' | 'right'>('right');
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{ pointerX: number; pointerY: number; posX: number; posY: number } | null>(null);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  // Handle window resizing: ensure dragged position stays bounded
  useEffect(() => {
    const handleResize = () => {
      if (!position || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const maxX = Math.max(10, window.innerWidth - rect.width - 10);
      const maxY = Math.max(10, window.innerHeight - rect.height - 10);
      setPosition((prev) => {
        if (!prev) return null;
        return {
          x: Math.min(Math.max(10, prev.x), maxX),
          y: Math.min(Math.max(10, prev.y), maxY),
        };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position]);

  // Pointer drag handling for both mouse and touch
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag with primary mouse button or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    
    // Prevent dragging if clicking directly on a button or interactive element
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) return;

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      posX: rect.left,
      posY: rect.top,
    };
    setIsDragging(true);

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (!dragStartRef.current || !containerRef.current) return;
      const deltaX = moveEvent.clientX - dragStartRef.current.pointerX;
      const deltaY = moveEvent.clientY - dragStartRef.current.pointerY;

      const rect = containerRef.current.getBoundingClientRect();
      const newX = dragStartRef.current.posX + deltaX;
      const newY = dragStartRef.current.posY + deltaY;

      const clampedX = Math.min(Math.max(8, newX), window.innerWidth - rect.width - 8);
      const clampedY = Math.min(Math.max(8, newY), window.innerHeight - rect.height - 8);

      setPosition({ x: clampedX, y: clampedY });
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      setIsDragging(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      // If dropped within 20px of screen edges, offer snap/tuck side
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.right >= window.innerWidth - 18) {
          setTuckedSide('right');
        } else if (rect.left <= 18) {
          setTuckedSide('left');
        }
      }
      dragStartRef.current = null;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  // Toggle tuck beside screen
  const handleTuckToSide = (side?: 'left' | 'right') => {
    if (side) {
      setTuckedSide(side);
    } else if (position) {
      const isCloserToLeft = position.x < window.innerWidth / 2;
      setTuckedSide(isCloserToLeft ? 'left' : 'right');
    } else {
      setTuckedSide('right');
    }
    setIsTuckedBeside(true);
  };

  const handleUntuck = () => {
    setIsTuckedBeside(false);
  };

  const handleResetPosition = () => {
    setPosition(null);
  };

  // If tucked beside the screen, display a sleek side-edge handle tab
  if (isTuckedBeside) {
    return (
      <div 
        className={`fixed z-40 top-1/2 -translate-y-1/2 select-none transition-all duration-300 ${
          tuckedSide === 'right' ? 'right-0' : 'left-0'
        }`}
      >
        <button
          type="button"
          onClick={handleUntuck}
          className={`flex items-center gap-2 px-3 py-2.5 border shadow-xl backdrop-blur-xl cursor-pointer group transition-transform ${
            isLight
              ? 'bg-[#edf5f7] text-slate-900 border-slate-300 hover:bg-[#dce9ed]'
              : 'bg-[#061022]/95 hover:bg-[#0b1b36] border text-white shadow-[0_10px_35px_rgba(0,0,0,0.85)]'
          } ${
            tuckedSide === 'right'
              ? 'rounded-l-2xl border-r-0 border-cyan-500/40 hover:-translate-x-1'
              : 'rounded-r-2xl border-l-0 border-cyan-500/40 hover:translate-x-1'
          }`}
          title="Click to restore floating timer dock"
        >
          {tuckedSide === 'right' && (
            <ChevronLeft className="w-4 h-4 text-cyan-500 group-hover:-translate-x-0.5 transition-transform" />
          )}

          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-cyan-400 animate-ping' : 'bg-slate-400'}`} />
            <span className={`font-mono font-extrabold text-xs tracking-wider ${
              isLight ? 'text-cyan-800' : 'text-cyan-300'
            }`}>
              {timeFormatted}
            </span>
          </div>

          {tuckedSide === 'left' && (
            <ChevronRight className="w-4 h-4 text-cyan-500 group-hover:translate-x-0.5 transition-transform" />
          )}
        </button>
      </div>
    );
  }

  return (
    <aside 
      ref={containerRef}
      aria-label="Floating Focus Dock"
      style={
        position
          ? {
              left: `${position.x}px`,
              top: `${position.y}px`,
              bottom: 'auto',
              right: 'auto',
              transform: 'none',
              touchAction: 'none',
            }
          : {
              touchAction: 'none',
            }
      }
      className={`fixed z-40 select-none animate-in slide-in-from-bottom-5 duration-300 ${
        position
          ? ''
          : 'bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0'
      }`}
    >
      {isMinimized ? (
        <div 
          onPointerDown={handlePointerDown}
          className={`flex items-center gap-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.4)] cursor-grab ${
            isDragging ? 'cursor-grabbing scale-105 ring-2 ring-cyan-400/50' : ''
          }`}
        >
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full border border-cyan-500/40 backdrop-blur-xl transition cursor-pointer group ${
              isLight
                ? 'bg-[#edf5f7] text-slate-900 border-slate-300 hover:border-cyan-500'
                : 'bg-[#061022]/95 text-white hover:border-cyan-400'
            }`}
            title="Expand Mini Floating Timer"
          >
            <div className="w-4 h-4 rounded-md overflow-hidden bg-black flex items-center justify-center shrink-0 border border-cyan-500/40">
              <img src="/sandclock.svg" alt="Sand clock" className="w-full h-full object-contain" />
            </div>
            <GripHorizontal className={`w-3.5 h-3.5 ${isLight ? 'text-slate-500 group-hover:text-cyan-800' : 'text-slate-500 group-hover:text-cyan-400'}`} />
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-cyan-500 animate-ping' : 'bg-slate-400'}`} />
            <span className={`font-mono font-extrabold text-xs tracking-wider ${
              isLight ? 'text-cyan-900' : 'text-cyan-300'
            }`}>
              {timeFormatted}
            </span>
            <ChevronUp className={`w-3.5 h-3.5 ${isLight ? 'text-slate-600 group-hover:text-slate-900' : 'text-slate-400 group-hover:text-white'}`} />
          </button>
          
          <button
            type="button"
            onClick={() => handleTuckToSide('right')}
            className={`p-2 rounded-full border border-cyan-500/30 transition cursor-pointer ${
              isLight
                ? 'bg-[#edf5f7] text-slate-700 border-slate-300 hover:text-cyan-800 hover:border-cyan-500'
                : 'bg-[#061022]/95 text-slate-400 hover:text-cyan-300 hover:border-cyan-400'
            }`}
            title="Tuck beside screen edge"
          >
            <ArrowRightToLine className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onHide}
            className={`p-2 rounded-full border border-cyan-500/30 transition cursor-pointer ${
              isLight
                ? 'bg-[#edf5f7] text-slate-700 border-slate-300 hover:text-rose-600 hover:border-rose-400'
                : 'bg-[#061022]/95 text-slate-400 hover:text-rose-300 hover:border-rose-500/40'
            }`}
            title="Hide Floating Timer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div 
          className={`w-[92vw] max-w-[340px] sm:w-84 rounded-2xl border p-3 backdrop-blur-2xl relative overflow-hidden space-y-2.5 transition-shadow ${
            isLight
              ? 'bg-[#edf5f7] border-slate-300 shadow-xl'
              : 'bg-[#061022]/95 border-cyan-500/30 shadow-[0_15px_40px_rgba(0,0,0,0.85)]'
          } ${
            isDragging ? 'ring-2 ring-cyan-400/60 shadow-[0_20px_50px_rgba(0,0,0,0.95)]' : ''
          }`}
        >
          {/* Subtle top progress bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
            <div 
              className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Drag Grip Handle Bar (Top Center) */}
          <div 
            onPointerDown={handlePointerDown}
            onDoubleClick={handleResetPosition}
            className="w-full flex items-center justify-between cursor-grab active:cursor-grabbing pt-0.5 pb-0.5 group"
            title="Click and drag to move anywhere. Double-click to reset position."
          >
            <div className="flex items-center gap-1.5 truncate">
              <div className="w-4 h-4 rounded-md overflow-hidden bg-black flex items-center justify-center shrink-0 border border-cyan-500/30">
                <img src="/sandclock.svg" alt="Sand clock" className="w-full h-full object-contain" />
              </div>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                mode === 'focus' 
                  ? 'bg-cyan-500/20 text-cyan-600 border border-cyan-500/30' 
                  : 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30'
              }`}>
                {mode === 'focus' ? 'Focus' : 'Break'}
              </span>
              <span className={`text-[11px] truncate max-w-[110px] ${
                isLight ? 'text-slate-800 font-semibold' : 'text-slate-300 font-medium'
              }`} title={activeTaskName || 'Enter Task'}>
                {activeTaskName || 'Enter Task'}
              </span>
            </div>

            {/* Drag indicator & Action Controls */}
            <div className="flex items-center gap-0.5 shrink-0">
              <div 
                className={`px-1.5 py-0.5 rounded transition ${
                  isLight ? 'text-slate-400 group-hover:text-cyan-700' : 'text-slate-500 group-hover:text-cyan-400'
                }`}
                title="Drag to reposition"
              >
                <GripHorizontal className="w-3.5 h-3.5" />
              </div>

              {position && (
                <button
                  type="button"
                  onClick={handleResetPosition}
                  className={`p-1 rounded-lg cursor-pointer transition ${
                    isLight ? 'hover:bg-[#dce9ed] text-slate-600 hover:text-cyan-800' : 'hover:bg-slate-800 text-slate-400 hover:text-cyan-300'
                  }`}
                  title="Reset to default position"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}

              <button
                type="button"
                onClick={() => handleTuckToSide()}
                className={`p-1 rounded-lg cursor-pointer transition ${
                  isLight ? 'hover:bg-[#dce9ed] text-slate-600 hover:text-cyan-800' : 'hover:bg-slate-800 text-slate-400 hover:text-cyan-300'
                }`}
                title="Tuck beside screen edge (hide to side)"
              >
                <ArrowRightToLine className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={onOpenZen}
                className={`p-1 rounded-lg cursor-pointer transition ${
                  isLight ? 'hover:bg-[#dce9ed] text-cyan-800 hover:text-cyan-950' : 'hover:bg-slate-800 text-cyan-300 hover:text-white'
                }`}
                title="Zen Sanctuary Fullscreen (F)"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className={`p-1 rounded-lg cursor-pointer transition ${
                  isLight ? 'hover:bg-[#dce9ed] text-slate-600 hover:text-slate-900' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Minimize to Pill"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={onHide}
                className={`p-1 rounded-lg cursor-pointer transition ${
                  isLight ? 'hover:bg-rose-100 text-slate-600 hover:text-rose-700' : 'hover:bg-rose-950/40 text-slate-400 hover:text-rose-300'
                }`}
                title="Hide Floating Dock (Undo Available)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Center row: Large digital timer + controls + Undo option */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center">
                <Clock className={`w-4 h-4 ${isRunning ? 'text-cyan-500 animate-pulse' : isLight ? 'text-slate-400' : 'text-slate-500'}`} />
              </div>
              <span className={`font-mono text-2xl font-black tracking-wider ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                {timeFormatted}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Undo +5m Extension Button if active */}
              {canUndoExtend && onUndoExtend && (
                <button
                  type="button"
                  onClick={onUndoExtend}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition flex items-center gap-1 animate-in fade-in zoom-in-95 duration-200 ${
                    isLight
                      ? 'bg-cyan-50 hover:bg-cyan-100 border border-cyan-300 text-cyan-800'
                      : 'bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300'
                  }`}
                  title="Undo +5m extension"
                >
                  <RotateCcw className={`w-3 h-3 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
                  <span>Undo</span>
                </button>
              )}

              {/* Add 5m Button */}
              <button
                type="button"
                onClick={() => onExtend(5)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition flex items-center gap-0.5 ${
                  isLight
                    ? 'bg-[#dce9ed] hover:bg-[#cfdfe4] text-cyan-900 border border-slate-300'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-cyan-300'
                }`}
                title="Add 5 minutes"
              >
                <Plus className="w-3 h-3" />
                <span>5m</span>
              </button>

              {/* Primary Play/Pause Toggle */}
              <button
                type="button"
                onClick={onToggleTimer}
                className="px-3 py-1 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 active:scale-95 text-slate-950 font-black text-xs cursor-pointer shadow-md flex items-center gap-1 transition"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-3 h-3 fill-slate-950" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-slate-950" />
                    <span>Start</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

