// Tiny WebAudio SFX engine — no audio files needed, mutable, persisted (spec §53)

const KEY = "nexorium-sound";

export function soundEnabled(): boolean {
  return localStorage.getItem(KEY) !== "off";
}

export function setSoundEnabled(on: boolean) {
  localStorage.setItem(KEY, on ? "on" : "off");
  if (on) startMusic();
  else stopMusic();
}

function tone(freq: number, dur: number, type: OscillatorType, delay = 0, gain = 0.05) {
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
  blip: () => tone(660, 0.07, "square", 0, 0.03),
  confirm: () => {
    tone(520, 0.09, "square");
    tone(780, 0.12, "square", 0.09);
  },
  success: () => {
    tone(523, 0.1, "square");
    tone(659, 0.1, "square", 0.1);
    tone(784, 0.18, "square", 0.2);
  },
  error: () => tone(160, 0.25, "sawtooth", 0, 0.06),
  swipeOk: () => {
    tone(440, 0.06, "triangle");
    tone(880, 0.1, "triangle", 0.07);
  },
  swipeBad: () => tone(180, 0.3, "sawtooth", 0, 0.06),
};

/* -------------------------------------------------------------------- */
/* Ambient station loop — an ORIGINAL slow space pad (bass pulse +      */
/* sparse pentatonic bells). Composed from scratch; no game music used. */
/* -------------------------------------------------------------------- */

let musicCtx: AudioContext | null = null;
let musicTimer: number | null = null;
let musicStep = 0;

const BASS_BAR = [110, 110, 87.31, 98]; // A2 · A2 · F2 · G2
const ARP = [440, 523.25, 659.25, 783.99, 659.25, 523.25, 440, 349.23]; // A minor pentatonic bells

function musicVoice(freq: number, dur: number, type: OscillatorType, gain: number) {
  if (!musicCtx) return;
  try {
    const osc = musicCtx.createOscillator();
    const g = musicCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t = musicCtx.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.09);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(musicCtx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  } catch {
    /* audio unavailable — stay silent */
  }
}

function musicTick() {
  if (!soundEnabled()) {
    stopMusic();
    return;
  }
  const bar = Math.floor(musicStep / 8) % BASS_BAR.length;
  if (musicStep % 8 === 0) musicVoice(BASS_BAR[bar], 2.6, "sine", 0.05);
  if (musicStep % 8 === 4) musicVoice(BASS_BAR[bar] * 1.5, 1.8, "sine", 0.028);
  if (musicStep % 2 === 1) musicVoice(ARP[Math.floor(musicStep / 2) % ARP.length], 1.1, "triangle", 0.015);
  musicStep++;
}

/** Start the ambient loop — call from a user gesture (autoplay policy) */
export function startMusic() {
  if (musicTimer !== null || !soundEnabled()) return;
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    musicCtx = musicCtx ?? new Ctx();
    if (musicCtx.state === "suspended") void musicCtx.resume();
    musicTimer = window.setInterval(musicTick, 1500);
    musicTick();
  } catch {
    /* audio unavailable — stay silent */
  }
}

export function stopMusic() {
  if (musicTimer !== null) {
    clearInterval(musicTimer);
    musicTimer = null;
  }
  if (musicCtx) {
    void musicCtx.close().catch(() => undefined);
    musicCtx = null;
  }
}
