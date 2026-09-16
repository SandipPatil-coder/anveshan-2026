// Tiny WebAudio SFX — soft koto-pluck tones, mutable, persisted. No audio files.

const KEY = "anveshan-sound";

export function soundEnabled(): boolean {
  return localStorage.getItem(KEY) !== "off";
}

export function setSoundEnabled(on: boolean) {
  localStorage.setItem(KEY, on ? "on" : "off");
}

function tone(freq: number, dur: number, type: OscillatorType, delay = 0, gain = 0.04) {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, ctx.currentTime + delay);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + dur + 0.02);
    setTimeout(() => ctx.close(), (delay + dur) * 1000 + 150);
  } catch {
    /* audio unavailable — stay silent */
  }
}

export const sfx = {
  blip: () => tone(880, 0.06, "triangle", 0, 0.022),
  confirm: () => {
    tone(659.25, 0.09, "sine", 0, 0.035);
    tone(987.77, 0.14, "sine", 0.08, 0.03);
  },
  success: () => {
    tone(523.25, 0.12, "sine", 0, 0.035);
    tone(659.25, 0.12, "sine", 0.1, 0.035);
    tone(783.99, 0.22, "sine", 0.2, 0.035);
  },
  error: () => tone(150, 0.22, "sawtooth", 0, 0.04),
  swipeOk: () => {
    tone(587.33, 0.07, "triangle", 0, 0.03);
    tone(1174.66, 0.11, "triangle", 0.07, 0.026);
  },
  swipeBad: () => tone(160, 0.28, "sawtooth", 0, 0.04),
};
