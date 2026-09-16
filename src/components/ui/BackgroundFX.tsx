import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Petal {
  x: number;
  y: number;
  size: number;
  sway: number;
  phase: number;
  fall: number;
  spin: number;
  alpha: number;
  hue: number;
}

function spawnPetal(height: number): Petal {
  return {
    x: Math.random(),
    y: Math.random() * height,
    size: 4 + Math.random() * 5,
    sway: 14 + Math.random() * 26,
    phase: Math.random() * Math.PI * 2,
    fall: 10 + Math.random() * 16,
    spin: 0.4 + Math.random() * 0.9,
    alpha: 0.28 + Math.random() * 0.24,
    hue: 338 + Math.random() * 14,
  };
}

/**
 * Editorial backdrop: soft sakura petals drifting over the washi paper.
 * Very low-contrast so text always wins; fully static under reduced motion.
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
    let time = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(10, Math.min(28, Math.floor((width * height) / 46000)));
      petals = Array.from({ length: count }, () => spawnPetal(height));
    };
    resize();
    window.addEventListener("resize", resize);

    const drawPetal = (p: Petal, px: number, py: number) => {
      const s = p.size;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(Math.sin(time * p.spin + p.phase) * 0.8);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = `hsl(${p.hue} 72% 82%)`;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.9, -s * 0.45, s * 0.7, s * 0.6, 0, s);
      ctx.bezierCurveTo(-s * 0.7, s * 0.6, -s * 0.9, -s * 0.45, 0, -s);
      ctx.fill();
      ctx.restore();
    };

    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      time += dt;

      ctx.clearRect(0, 0, width, height);
      for (const p of petals) {
        p.y += p.fall * dt;
        if (p.y > height + 24) {
          p.y = -24;
          p.x = Math.random();
        }
        const px = p.x * width + Math.sin(time * 0.6 + p.phase) * p.sway;
        drawPetal(p, px, p.y);
      }
      ctx.globalAlpha = 1;

      if (!reduced) raf = requestAnimationFrame(frame);
    };
    ctx.clearRect(0, 0, width, height);
    // Static scatter when motion is reduced
    if (reduced) {
      for (const p of petals) drawPetal(p, p.x * width, p.y);
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-70" />;
}
