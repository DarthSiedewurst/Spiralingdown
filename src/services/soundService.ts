// src/services/soundService.ts
// Kurze WebAudio-Sounds für Aktionen (Wurf, Landung, Sieg) —
// ohne Assets, läuft über die eingebaute WebAudio-API.

let ctx: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
  return ctx;
}

function tone(
  freq: number,
  startOffset: number,
  duration: number,
  volume = 0.15,
  type: OscillatorType = "sine",
) {
  const c = audioContext();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, c.currentTime + startOffset);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + startOffset + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(c.currentTime + startOffset);
  osc.stop(c.currentTime + startOffset + duration);
}

function noiseBurst(
  startOffset: number,
  duration: number,
  centerFreq: number,
  volume: number,
  q: number,
) {
  const c = audioContext();
  if (!c) return;
  const length = Math.max(1, Math.floor(c.sampleRate * duration));
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;

  const src = c.createBufferSource();
  src.buffer = buffer;

  const bandpass = c.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = centerFreq;
  bandpass.Q.value = q;

  const gain = c.createGain();
  const t0 = c.currentTime + startOffset;
  gain.gain.setValueAtTime(volume, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  src.connect(bandpass).connect(gain).connect(c.destination);
  src.start(t0);
  src.stop(t0 + duration);
}

export function soundRoll() {
  // "clack-clack-clack" — tumbling, random timing, random pitch, bandpassed noise
  let t = 0.02;
  const clackCount = 5 + Math.floor(Math.random() * 3);
  for (let i = 0; i < clackCount; i++) {
    t += 0.06 + Math.random() * 0.1;
    const freq = 900 + Math.random() * 1500;
    const dur = 0.04 + Math.random() * 0.05;
    const vol = 0.09 + Math.random() * 0.06;
    noiseBurst(t, dur, freq, vol, 8 + Math.random() * 8);
  }
  // "thump" — lander-Töne mit tiefer Frequenz + Sub-Bass
  t = t + 0.15 + Math.random() * 0.1;
  noiseBurst(t, 0.15, 350, 0.22, 1.4);
  tone(110, t, 0.2, 0.25, "sine");
}

export function soundLanding() {
  tone(440, 0, 0.1, 0.18, "sine");
}

export function soundVictory() {
  tone(523, 0, 0.15, 0.2, "square");
  tone(659, 0.18, 0.15, 0.2, "square");
  tone(784, 0.36, 0.2, 0.22, "square");
  tone(1046, 0.6, 0.35, 0.22, "square");
}
