// Web Audio Synthesizer for Ambient Background Audio & Binaural Beats
// Supports Alpha (10Hz), Theta (6Hz), Brown Noise, Rain, and Custom Audio (Files & URLs)

let audioCtx: AudioContext | null = null;
let activeNodes: {
  oscillators?: OscillatorNode[];
  noiseSource?: AudioBufferSourceNode;
  gainNode?: GainNode;
  filterNode?: BiquadFilterNode;
  mergerNode?: ChannelMergerNode;
} | null = null;

let customAudioElement: HTMLAudioElement | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function stopAmbientSound() {
  if (activeNodes) {
    try {
      if (activeNodes.oscillators) {
        activeNodes.oscillators.forEach((osc) => {
          osc.stop();
          osc.disconnect();
        });
      }
      if (activeNodes.noiseSource) {
        activeNodes.noiseSource.stop();
        activeNodes.noiseSource.disconnect();
      }
      if (activeNodes.gainNode) {
        activeNodes.gainNode.disconnect();
      }
    } catch {
      // Ignore errors when stopping already stopped nodes
    }
    activeNodes = null;
  }

  if (customAudioElement) {
    try {
      customAudioElement.pause();
    } catch {
      // Ignore
    }
  }
}

// 1. Binaural Beats Generator (Alpha 10Hz, Theta 6Hz)
export function playBinauralBeats(baseFreq: number, beatFreq: number, volume = 0.3) {
  stopAmbientSound();
  const ctx = getAudioContext();

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume * 0.4, ctx.currentTime);

  // Left channel oscillator (e.g. 200 Hz)
  const oscLeft = ctx.createOscillator();
  oscLeft.type = 'sine';
  oscLeft.frequency.setValueAtTime(baseFreq, ctx.currentTime);

  // Right channel oscillator (e.g. 210 Hz => 10Hz beat)
  const oscRight = ctx.createOscillator();
  oscRight.type = 'sine';
  oscRight.frequency.setValueAtTime(baseFreq + beatFreq, ctx.currentTime);

  // Create stereo merger
  const merger = ctx.createChannelMerger(2);
  oscLeft.connect(merger, 0, 0); // left
  oscRight.connect(merger, 0, 1); // right

  merger.connect(gain);
  gain.connect(ctx.destination);

  oscLeft.start();
  oscRight.start();

  activeNodes = {
    oscillators: [oscLeft, oscRight],
    gainNode: gain,
    mergerNode: merger,
  };
}

// 2. Brown Noise Generator
export function playBrownNoise(volume = 0.3) {
  stopAmbientSound();
  const ctx = getAudioContext();

  const bufferSize = ctx.sampleRate * 2;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  let lastOut = 0.0;

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    output[i] = (lastOut + 0.02 * white) / 1.02;
    lastOut = output[i];
    output[i] *= 3.5; // Gain compensation
  }

  const whiteNoise = ctx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  whiteNoise.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(450, ctx.currentTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume * 0.45, ctx.currentTime);

  whiteNoise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  whiteNoise.start();

  activeNodes = {
    noiseSource: whiteNoise,
    filterNode: filter,
    gainNode: gain,
  };
}

// 3. Gentle Rainfall Generator
export function playRainSound(volume = 0.3) {
  stopAmbientSound();
  const ctx = getAudioContext();

  const bufferSize = ctx.sampleRate * 2;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const whiteNoise = ctx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  whiteNoise.loop = true;

  // Bandpass filter for rain-like hiss
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1200, ctx.currentTime);
  filter.Q.setValueAtTime(0.8, ctx.currentTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume * 0.25, ctx.currentTime);

  whiteNoise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  whiteNoise.start();

  activeNodes = {
    noiseSource: whiteNoise,
    filterNode: filter,
    gainNode: gain,
  };
}

// 4. Custom Music (Inserted by user via File or URL)
export function playCustomAudio(src: string, volume = 0.5): HTMLAudioElement {
  stopAmbientSound();

  if (!customAudioElement) {
    customAudioElement = new Audio();
    customAudioElement.loop = true;
  }

  customAudioElement.src = src;
  customAudioElement.volume = Math.min(1, Math.max(0, volume));
  customAudioElement.play().catch(() => {
    // Autoplay restrictions or invalid source
  });

  return customAudioElement;
}

export function setAmbientVolume(volume: number) {
  const clamped = Math.min(1, Math.max(0, volume));
  if (activeNodes?.gainNode && audioCtx) {
    activeNodes.gainNode.gain.setValueAtTime(clamped * 0.4, audioCtx.currentTime);
  }
  if (customAudioElement) {
    customAudioElement.volume = clamped;
  }
}
