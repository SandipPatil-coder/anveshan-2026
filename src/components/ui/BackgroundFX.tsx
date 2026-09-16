import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Petal {
  x: number;
  y: number;
  size: number;
  sway: number;
  swayPhase: number;
  fall: number;
  spin: number;
  spinPhase: number;
  hue: number;
  alpha: number;
}

interface Firefly {
  x: number;
  y: number;
  r: number;
  phase: number;
  pulse: number;
  drift: number;
}

/** Sakura-pink petal, randomized across pinks with the occasional pale wisteria */
function spawnPetal(startY: number, height: number): Petal {
  return {
    x: Math.random(),
    y: startY / Math.max(1, height),
    size: 5 + Math.random() * 6,
    sway: 18 + Math.random() * 30,
    swayPhase: Math.random() * Math.PI * 2,
    fall: 14 + Math.random() * 22,
    spin: 0.6 + Math.random() * 1.4,
    spinPhase: Math.random() * Math.PI * 2,
    hue: Math.random() < 0.72 ? 338 + Math.random() * 14 : 300 + Math.random() * 10,
    alpha: 0.5 + Math.random() * 0.4,
  };
}

/**
 * Night-matsuri backdrop: deep indigo sky (紺), drifting sakura petals and a
 * few warm fireflies — quiet, festive, phone-friendly. Keeps the scroll
 * parallax and reduced-motion respect of the old starfield.
 */
export default function BackgroundFX() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let petals: Petal[] = [];
    let flies: Firefly[] = [];
    let scrollY = window.scrollY;
    let time = 0;

    const onScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(16, Math.min(50, Math.floor((width * height) / 26000)));
      petals = Array.from({ length: count }, (_, i) => spawnPetal((i / count) * height, height));
      flies = Array.from({ length: Math.max(4, Math.floor(width / 280)) }, () => ({
        x: Math.random(),
        y: 0.25 + Math.random() * 0.7,
        r: 1.2 + Math.random() * 1.6,
        phase: Math.random() * Math.PI * 2,
        pulse: 0.9 + Math.random() * 1.6,
        drift: Math.random() * Math.PI * 2,
      }));
    };
    resize();
    window.addEventListener("resize", resize);

    const drawPetal = (p: Petal, px: number, py: number) => {
      const s = p.size;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(Math.sin(time * p.spin + p.spinPhase) * 0.9);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = `hsl(${p.hue} 85% 82%)`;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(s * 0.9, -s * 0.2, 0, s);
      ctx.quadraticCurveTo(-s * 0.9, -s * 0.2, 0, -s);
      ctx.fill();
      ctx.globalAlpha = p.alpha * 0.5;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.35, s * 0.22, s * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      time += dt;

      ctx.fillStyle = "#0d0d1a";
      ctx.fillRect(0, 0, width, height);

      // Fireflies — warm flickers wandering over the grounds
      for (const f of flies) {
        const fx = (f.x + Math.sin(time * 0.23 + f.drift) * 0.02) * width;
        const fy = (f.y + Math.cos(time * 0.17 + f.drift) * 0.02) * height - ((scrollY * 0.05) % height);
        const glow = 0.35 + 0.65 * Math.max(0, Math.sin(time * f.pulse + f.phase));
        ctx.fillStyle = "#ffd166";
        ctx.globalAlpha = glow * 0.9;
        ctx.beginPath();
        ctx.arc(fx, fy, f.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = glow * 0.25;
        ctx.beginPath();
        ctx.arc(fx, fy, f.r * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sakura petals — slow fall with sway, gentle parallax on scroll
      for (const p of petals) {
        const px = p.x * width + Math.sin(time * 0.7 + p.swayPhase) * p.sway;
        const raw = (p.y * height + time * p.fall - scrollY * 0.12) % (height + 40);
        const py = raw < -20 ? raw + height + 40 : raw;
        drawPetal(p, px, py);
      }
      ctx.globalAlpha = 1;

      if (!reduced) raf = requestAnimationFrame(frame);
    };
    ctx.fillStyle = "#0d0d1a";
    ctx.fillRect(0, 0, width, height);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-0 h-full w-full" />;
}
