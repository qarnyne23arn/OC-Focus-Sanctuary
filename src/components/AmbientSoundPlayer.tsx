import React, { useState, useEffect, useRef } from 'react';
import { 
  Headphones, 
  Volume2, 
  VolumeX, 
  Upload, 
  Link, 
  Music, 
  Sparkles, 
  CloudRain, 
  Radio, 
  Play, 
  AlertCircle
} from 'lucide-react';
import { AmbientSoundMode } from '../types';
import { 
  playBinauralBeats, 
  playBrownNoise, 
  playRainSound, 
  playCustomAudio, 
  stopAmbientSound, 
  setAmbientVolume 
} from '../utils/ambientAudio';
import { SoundwaveVisualizer } from './SoundwaveVisualizer';

interface AmbientSoundPlayerProps {
  isTimerRunning: boolean;
  compact?: boolean;
  isLight?: boolean;
}

interface CustomSlotData {
  sourceType: 'file' | 'url';
  url: string;
  fileName: string;
  blobUrl: string;
}

export const AmbientSoundPlayer: React.FC<AmbientSoundPlayerProps> = ({ 
  isTimerRunning,
  compact = false,
  isLight = false,
}) => {
  const [mode, setMode] = useState<AmbientSoundMode>('none');
  const [volume, setVolume] = useState<number>(0.5);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeCustomSlot, setActiveCustomSlot] = useState<1 | 2 | 3 | 4>(1);

  const [customSlots, setCustomSlots] = useState<Record<1 | 2 | 3 | 4, CustomSlotData>>({
    1: { sourceType: 'url', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3', fileName: '', blobUrl: '' },
    2: { sourceType: 'url', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=lofi-chill-105156.mp3', fileName: '', blobUrl: '' },
    3: { sourceType: 'url', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-piano-101157.mp3', fileName: '', blobUrl: '' },
    4: { sourceType: 'url', url: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db324b172a.mp3?filename=lofi-beat-110924.mp3', fileName: '', blobUrl: '' },
  });

  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Apply sound changes
  useEffect(() => {
    if (mode === 'none') {
      stopAmbientSound();
      return;
    }

    const effectiveVolume = isMuted ? 0 : volume;

    try {
      setErrorMessage('');
      if (mode === 'alpha') {
        playBinauralBeats(200, 10, effectiveVolume);
      } else if (mode === 'theta') {
        playBinauralBeats(150, 6, effectiveVolume);
      } else if (mode === 'brown_noise') {
        playBrownNoise(effectiveVolume);
      } else if (mode === 'rain') {
        playRainSound(effectiveVolume);
      } else if (mode === 'custom_1' || mode === 'custom_2' || mode === 'custom_3' || mode === 'custom_4' || mode === 'custom_file' || mode === 'custom_url') {
        const slotNum = mode === 'custom_1' ? 1 : mode === 'custom_2' ? 2 : mode === 'custom_3' ? 3 : mode === 'custom_4' ? 4 : activeCustomSlot;
        const slot = customSlots[slotNum as 1 | 2 | 3 | 4];
        const activeSrc = slot.blobUrl || slot.url;
        if (activeSrc) {
          playCustomAudio(activeSrc, effectiveVolume);
        }
      }
    } catch {
      setErrorMessage('Audio playback could not be started. Click anywhere to enable browser audio.');
    }
  }, [mode, isMuted, customSlots, activeCustomSlot]);

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (isMuted) setIsMuted(false);
    setAmbientVolume(newVol);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const currentSlotData = customSlots[activeCustomSlot];
    if (currentSlotData.blobUrl) {
      URL.revokeObjectURL(currentSlotData.blobUrl);
    }

    const objUrl = URL.createObjectURL(file);
    setCustomSlots(prev => ({
      ...prev,
      [activeCustomSlot]: {
        ...prev[activeCustomSlot],
        sourceType: 'file',
        blobUrl: objUrl,
        fileName: file.name
      }
    }));
    setMode(`custom_${activeCustomSlot}` as AmbientSoundMode);
  };

  const handleUrlChange = (newUrl: string) => {
    setCustomSlots(prev => ({
      ...prev,
      [activeCustomSlot]: {
        ...prev[activeCustomSlot],
        url: newUrl
      }
    }));
  };

  const handlePlaySlot = (slotNum: 1 | 2 | 3 | 4, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveCustomSlot(slotNum);
    const modeKey = `custom_${slotNum}` as AmbientSoundMode;
    setMode(modeKey);
    const slot = customSlots[slotNum];
    const src = slot.blobUrl || slot.url;
    if (src) {
      playCustomAudio(src, isMuted ? 0 : volume);
    }
  };

  const isAudioActive = mode !== 'none' && !isMuted;
  const currentSlotData = customSlots[activeCustomSlot];

  return (
    <div className={`w-full space-y-3.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
      {/* Live Audio Visualizer Banner */}
      <div className={`p-3.5 rounded-2xl border flex items-center justify-between shadow-inner ${
        isLight
          ? 'bg-slate-50 border-slate-200'
          : 'bg-gradient-to-r from-[#061022] via-[#091836] to-[#061022] border-cyan-500/25'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              isAudioActive
                ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                : isLight
                  ? 'bg-slate-200 text-slate-600'
                  : 'bg-slate-800 text-slate-400'
            }`}>
              <Headphones className="w-4 h-4" />
            </div>
            {isAudioActive && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            )}
          </div>
          <div>
            <div className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <span>Ambient Sound Engine</span>
              {isAudioActive ? (
                <span className={`text-[10px] px-2 py-0.2 rounded-full font-mono font-medium ${
                  isLight ? 'bg-cyan-100 text-cyan-800 border border-cyan-300' : 'bg-cyan-500/20 text-cyan-300'
                }`}>
                  {mode.startsWith('custom_') ? `CUSTOM MUSIC ${mode.replace('custom_', '')}` : mode.replace('_', ' ').toUpperCase()}
                </span>
              ) : (
                <span className={`text-[10px] px-2 py-0.2 rounded-full ${
                  isLight ? 'bg-slate-200 text-slate-600' : 'bg-slate-800 text-slate-400'
                }`}>
                  MUTED / OFF
                </span>
              )}
            </div>
            <div className={`text-[10px] font-mono ${isLight ? 'text-slate-600' : 'text-sky-200/60'}`}>
              {isAudioActive ? 'Live frequency synthesis / custom stream active' : 'Select a frequency or custom music slot below'}
            </div>
          </div>
        </div>

        <SoundwaveVisualizer
          isPlaying={isAudioActive}
          mode={mode}
          volume={isMuted ? 0 : volume}
          barCount={compact ? 9 : 15}
          size={compact ? 'sm' : 'md'}
        />
      </div>

      {/* Sound selector grid (9 slots: 5 built-in + 4 custom music slots) */}
      <div className={`grid ${compact ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'} gap-2`}>
        {[
          { id: 'none', label: 'Off', icon: Headphones, desc: 'Silence' },
          { id: 'alpha', label: 'Alpha (10 Hz)', icon: Sparkles, desc: 'Flow State Binaural' },
          { id: 'theta', label: 'Theta (6 Hz)', icon: Radio, desc: 'Memory & Retention' },
          { id: 'brown_noise', label: 'Brown Noise', icon: Music, desc: 'Deep Study Rumble' },
          { id: 'rain', label: 'Gentle Rain', icon: CloudRain, desc: 'Calm Rainfall' },
          { id: 'custom_1', label: 'Custom Music 1', icon: Upload, desc: 'Slot 1 Stream/File' },
          { id: 'custom_2', label: 'Custom Music 2', icon: Upload, desc: 'Slot 2 Stream/File' },
          { id: 'custom_3', label: 'Custom Music 3', icon: Upload, desc: 'Slot 3 Stream/File' },
          { id: 'custom_4', label: 'Custom Music 4', icon: Upload, desc: 'Slot 4 Stream/File' },
        ].map((item) => {
          const isSelected = mode === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id.startsWith('custom_')) {
                  const sNum = parseInt(item.id.replace('custom_', '')) as 1 | 2 | 3 | 4;
                  setActiveCustomSlot(sNum);
                  setMode(item.id as AmbientSoundMode);
                } else {
                  setMode(item.id as AmbientSoundMode);
                }
              }}
              className={`p-2.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? isLight
                    ? 'bg-cyan-500 border-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-cyan-500/20 border-cyan-400 text-white shadow-md'
                  : isLight
                    ? 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                    : 'bg-[#061022] border-sky-500/15 hover:border-sky-500/35 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Icon className={`w-3.5 h-3.5 ${
                  isSelected
                    ? (isLight ? 'text-slate-950' : 'text-cyan-300')
                    : (isLight ? 'text-slate-600' : 'text-slate-400')
                }`} />
                {isSelected && mode !== 'none' && (
                  <span className={`w-1.5 h-1.5 rounded-full animate-ping ${isLight ? 'bg-slate-950' : 'bg-cyan-400'}`} />
                )}
              </div>
              <div>
                <div className={`font-bold text-xs leading-tight ${
                  isSelected && isLight ? 'text-slate-950' : (isLight ? 'text-slate-900' : 'text-white')
                }`}>
                  {item.label}
                </div>
                {!compact && (
                  <div className={`text-[10px] mt-0.5 ${
                    isSelected && isLight ? 'text-slate-900/80' : (isLight ? 'text-slate-600' : 'text-sky-200/60')
                  }`}>
                    {item.desc}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Volume Bar & Mute */}
      <div className={`p-3 rounded-2xl border flex items-center gap-3 ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#061022] border-sky-500/15'
      }`}>
        <button
          type="button"
          onClick={() => setIsMuted(!isMuted)}
          className={`p-1.5 rounded-xl cursor-pointer transition ${
            isLight ? 'hover:bg-slate-200 text-cyan-700' : 'hover:bg-slate-800 text-cyan-400'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4 h-4 text-rose-500" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>

        <div className="flex-1 flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-cyan-500 ${
              isLight ? 'bg-slate-200' : 'bg-slate-800'
            }`}
          />
          <span className={`text-[11px] font-mono w-9 text-right font-bold ${
            isLight ? 'text-cyan-800' : 'text-cyan-300'
          }`}>
            {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
          </span>
        </div>
      </div>

      {/* Custom Music Slots Manager */}
      <div className={`p-3.5 rounded-2xl border space-y-3 ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#061022] border-sky-500/15'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Music className={`w-3.5 h-3.5 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
            Custom Music Slots (4 Available)
          </span>

          {/* Slot Tabs */}
          <div className={`flex items-center gap-1 p-0.5 rounded-lg text-[10px] ${
            isLight ? 'bg-slate-200' : 'bg-slate-800'
          }`}>
            {([1, 2, 3, 4] as const).map((sNum) => (
              <button
                key={sNum}
                type="button"
                onClick={() => setActiveCustomSlot(sNum)}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer transition ${
                  activeCustomSlot === sNum
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                Slot {sNum}
              </button>
            ))}
          </div>
        </div>

        {/* Source Type Selector for Active Slot */}
        <div className="flex items-center justify-between pt-1">
          <span className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Configuring <strong className={isLight ? 'text-slate-900' : 'text-cyan-300'}>Slot {activeCustomSlot}</strong>
          </span>
          <div className={`flex items-center gap-1 p-0.5 rounded-lg text-[10px] ${
            isLight ? 'bg-slate-200' : 'bg-slate-800'
          }`}>
            <button
              type="button"
              onClick={() => setCustomSlots(prev => ({
                ...prev,
                [activeCustomSlot]: { ...prev[activeCustomSlot], sourceType: 'url' }
              }))}
              className={`px-2 py-0.5 rounded font-bold cursor-pointer transition ${
                currentSlotData.sourceType === 'url'
                  ? 'bg-cyan-500 text-slate-950'
                  : isLight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              Stream URL
            </button>
            <button
              type="button"
              onClick={() => setCustomSlots(prev => ({
                ...prev,
                [activeCustomSlot]: { ...prev[activeCustomSlot], sourceType: 'file' }
              }))}
              className={`px-2 py-0.5 rounded font-bold cursor-pointer transition ${
                currentSlotData.sourceType === 'file'
                  ? 'bg-cyan-500 text-slate-950'
                  : isLight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              Upload MP3
            </button>
          </div>
        </div>

        {currentSlotData.sourceType === 'file' ? (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition ${
                isLight
                  ? 'border-slate-300 bg-white hover:border-cyan-500 text-slate-900'
                  : 'border-sky-500/20 hover:border-cyan-400/50 bg-[#040c1a]/50 text-white'
              }`}
            >
              <Upload className={`w-5 h-5 mx-auto mb-1 ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`} />
              <div className={`text-xs font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {currentSlotData.fileName ? currentSlotData.fileName : `Click to select audio file for Slot ${activeCustomSlot}`}
              </div>
              <div className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Supports MP3, WAV, AAC, OGG
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => handlePlaySlot(activeCustomSlot, e)} className="flex gap-2">
            <div className="relative flex-1">
              <Link className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={currentSlotData.url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com/stream.mp3 or Lo-Fi stream"
                className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:border-cyan-400 ${
                  isLight
                    ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400'
                    : 'bg-[#030914] border border-sky-500/20 text-white placeholder-slate-500'
                }`}
              />
            </div>
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-sm"
            >
              <Play className="w-3 h-3 fill-slate-950" />
              Play Slot {activeCustomSlot}
            </button>
          </form>
        )}

        {errorMessage && (
          <div className="flex items-center gap-1.5 text-[11px] text-rose-500 bg-rose-50 p-2 rounded-lg border border-rose-200 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};
