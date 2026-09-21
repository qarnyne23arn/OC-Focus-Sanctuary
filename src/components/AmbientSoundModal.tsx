import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, VolumeX, Play, Square, Headphones, CloudRain, Trees, Coffee, Sparkles } from 'lucide-react';

interface AmbientSoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLight?: boolean;
}

type SoundType = 'rain' | 'forest' | 'cafe' | 'space';

export const AmbientSoundModal: React.FC<AmbientSoundModalProps> = ({
  isOpen,
  onClose,
  isLight = false,
}) => {
  const [activeSound, setActiveSound] = useState<SoundType | null>(null);
  const [volume, setVolume] = useState<number>(0.5);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);
  const intervalRef = useRef<any>(null);

  const stopAudio = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    nodesRef.current.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as any).stop === 'function') {
          (node as any).stop();
        }
        node.disconnect();
      } catch (e) {
        // ignore
      }
    });
    nodesRef.current = [];
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
    setActiveSound(null);
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  if (!isOpen) return null;

  const startSound = (type: SoundType) => {
    stopAudio();

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.value = volume;
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      if (type === 'rain') {
        // Create Pink Noise for Rain
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          output[i] *= 0.11;
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1200;

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start();
        nodesRef.current.push(whiteNoise, filter);
      } else if (type === 'forest') {
        // Brown noise wind + periodic bird chirps
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        }

        const brownNoise = ctx.createBufferSource();
        brownNoise.buffer = noiseBuffer;
        brownNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 600;

        brownNoise.connect(filter);
        filter.connect(masterGain);
        brownNoise.start();
        nodesRef.current.push(brownNoise, filter);

        // Bird chirps interval
        const triggerBird = () => {
          if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
          const osc = ctx.createOscillator();
          const chirpGain = ctx.createGain();
          const now = ctx.currentTime;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(3200 + Math.random() * 1200, now);
          osc.frequency.exponentialRampToValueAtTime(4500 + Math.random() * 1500, now + 0.1);
          osc.frequency.exponentialRampToValueAtTime(3500, now + 0.2);

          chirpGain.gain.setValueAtTime(0.001, now);
          chirpGain.gain.linearRampToValueAtTime(0.04 * volume, now + 0.05);
          chirpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

          osc.connect(chirpGain);
          chirpGain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.25);
        };

        intervalRef.current = setInterval(() => {
          if (Math.random() > 0.4) {
            triggerBird();
          }
        }, 2500);

      } else if (type === 'cafe') {
        // Warm brown noise murmur simulator
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.04 * white) / 1.04;
          lastOut = output[i];
          output[i] *= 2.5;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 500;
        filter.Q.value = 1.2;

        noise.connect(filter);
        filter.connect(masterGain);
        noise.start();
        nodesRef.current.push(noise, filter);

      } else if (type === 'space') {
        // Cosmic space drone (harmonic sine waves)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();
        const droneGain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc3.type = 'sine';

        osc1.frequency.value = 108; // A2
        osc2.frequency.value = 162; // E3
        osc3.frequency.value = 216; // A3

        droneGain.gain.value = 0.15;

        osc1.connect(droneGain);
        osc2.connect(droneGain);
        osc3.connect(droneGain);
        droneGain.connect(masterGain);

        osc1.start();
        osc2.start();
        osc3.start();

        nodesRef.current.push(osc1, osc2, osc3, droneGain);
      }

      setActiveSound(type);
      setIsPlaying(true);
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(newVal, audioCtxRef.current.currentTime);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-6 ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#111827] border-white/10 text-white'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <Headphones className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold font-['Plus_Jakarta_Sans']">Ambient Soundscapes</h2>
              <p className="text-xs text-slate-400">Immersive procedural focus audio</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sound Selection Grid */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => startSound('rain')}
            className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col gap-2 ${
              activeSound === 'rain'
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                : isLight ? 'bg-slate-50 border-slate-200 hover:border-cyan-400' : 'bg-slate-900/60 border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <CloudRain className="w-5 h-5 text-cyan-400" />
              {activeSound === 'rain' && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
            </div>
            <div>
              <div className="font-bold text-sm">Gentle Rain</div>
              <div className="text-[11px] text-slate-400">Soft rainfall & droplets</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => startSound('forest')}
            className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col gap-2 ${
              activeSound === 'forest'
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                : isLight ? 'bg-slate-50 border-slate-200 hover:border-cyan-400' : 'bg-slate-900/60 border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <Trees className="w-5 h-5 text-emerald-400" />
              {activeSound === 'forest' && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
            </div>
            <div>
              <div className="font-bold text-sm">Forest Canopy</div>
              <div className="text-[11px] text-slate-400">Breeze & birds</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => startSound('cafe')}
            className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col gap-2 ${
              activeSound === 'cafe'
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                : isLight ? 'bg-slate-50 border-slate-200 hover:border-cyan-400' : 'bg-slate-900/60 border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <Coffee className="w-5 h-5 text-amber-400" />
              {activeSound === 'cafe' && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
            </div>
            <div>
              <div className="font-bold text-sm">Cozy Café</div>
              <div className="text-[11px] text-slate-400">Warm ambient murmur</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => startSound('space')}
            className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col gap-2 ${
              activeSound === 'space'
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                : isLight ? 'bg-slate-50 border-slate-200 hover:border-cyan-400' : 'bg-slate-900/60 border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <Sparkles className="w-5 h-5 text-purple-400" />
              {activeSound === 'space' && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
            </div>
            <div>
              <div className="font-bold text-sm">Deep Space Drone</div>
              <div className="text-[11px] text-slate-400">Harmonic ambience</div>
            </div>
          </button>
        </div>

        {/* Volume & Stop Controls */}
        <div className="space-y-4 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Volume</span>
            <span className="text-xs font-mono text-cyan-400">{Math.round(volume * 100)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleVolumeChange(volume === 0 ? 0.5 : 0)}
              className="text-slate-400 hover:text-white transition cursor-pointer"
            >
              {volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {isPlaying && (
            <button
              type="button"
              onClick={stopAudio}
              className="w-full py-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-xs hover:bg-rose-500/30 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop Soundscape</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
