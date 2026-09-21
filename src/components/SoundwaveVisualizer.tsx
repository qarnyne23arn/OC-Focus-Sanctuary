import React, { useEffect, useState } from 'react';
import { AmbientSoundMode } from '../types';

interface SoundwaveVisualizerProps {
  isPlaying: boolean;
  mode: AmbientSoundMode;
  volume?: number;
  barCount?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SoundwaveVisualizer: React.FC<SoundwaveVisualizerProps> = ({
  isPlaying,
  mode,
  volume = 0.5,
  barCount = 13,
  className = '',
  size = 'md',
}) => {
  const [barHeights, setBarHeights] = useState<number[]>(() =>
    Array.from({ length: barCount }, () => 15)
  );

  useEffect(() => {
    if (!isPlaying || mode === 'none') {
      setBarHeights(Array.from({ length: barCount }, () => 12));
      return;
    }

    let animationFrameId: number;
    let step = 0;

    const updateBars = () => {
      step += 0.08;
      const effectiveVol = Math.max(0.2, Math.min(1, volume));

      // Calculate dynamic bar heights based on sound mode
      const newHeights = Array.from({ length: barCount }, (_, i) => {
        let h = 15;
        if (mode === 'alpha') {
          // 10 Hz Alpha: smooth undulating harmonic wave
          const wave = Math.sin(step * 1.5 + i * 0.45) * 0.5 + 0.5;
          h = 20 + wave * 65 * effectiveVol;
        } else if (mode === 'theta') {
          // 6 Hz Theta: slow, meditative pulsing wave
          const wave = Math.sin(step * 0.8 + i * 0.3) * 0.5 + 0.5;
          h = 18 + wave * 55 * effectiveVol;
        } else if (mode === 'rain') {
          // Rain: organic flutter
          const jitter = (Math.sin(step * 3 + i * 2.1) + Math.cos(step * 1.7 - i)) * 0.25 + 0.5;
          h = 15 + jitter * 70 * effectiveVol;
        } else if (mode === 'brown_noise') {
          // Brown noise: heavy bass rumble, taller on left (low freqs)
          const decay = 1 - (i / barCount) * 0.5;
          const rumble = Math.sin(step * 2 + i * 0.7) * 0.3 + 0.7;
          h = 15 + rumble * decay * 75 * effectiveVol;
        } else {
          // Custom audio / Lo-Fi
          const musicBeat = Math.sin(step * 2.4 + i * 0.8) * Math.cos(step * 1.2 + i * 0.3);
          const normalized = Math.abs(musicBeat);
          h = 22 + normalized * 75 * effectiveVol;
        }

        return Math.min(95, Math.max(12, Math.round(h)));
      });

      setBarHeights(newHeights);
      animationFrameId = requestAnimationFrame(updateBars);
    };

    animationFrameId = requestAnimationFrame(updateBars);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, mode, volume, barCount]);

  const heightClasses = {
    sm: 'h-5 gap-1',
    md: 'h-8 gap-1.5',
    lg: 'h-12 gap-2',
  }[size];

  const barWidthClasses = {
    sm: 'w-1 rounded-sm',
    md: 'w-1.5 rounded-full',
    lg: 'w-2 rounded-full',
  }[size];

  return (
    <div className={`flex items-center justify-center ${heightClasses} ${className}`} aria-label="Audio Visualizer">
      {barHeights.map((heightPercent, index) => {
        // Compute vibrant cyan to blue gradient with soft glow
        const isActive = isPlaying && mode !== 'none';
        return (
          <span
            key={index}
            className={`${barWidthClasses} transition-all duration-75 origin-bottom ${
              isActive
                ? 'bg-gradient-to-t from-sky-500 via-cyan-400 to-teal-300 shadow-[0_0_8px_rgba(56,189,248,0.6)]'
                : 'bg-slate-700/60'
            }`}
            style={{
              height: `${heightPercent}%`,
              transitionDuration: isActive ? '90ms' : '300ms',
            }}
          />
        );
      })}
    </div>
  );
};
