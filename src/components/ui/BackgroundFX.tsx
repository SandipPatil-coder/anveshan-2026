import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Star {
  x: number;
  y: number;
  size: number;
  phase: number;
  speed: number;
}

/**
 * Deep-space backdrop: pure black void + white twinkling stars with a slow
 * parallax drift, Among Us lobby style.
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
    let stars: Star[] = [];
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
      const count = Math.max(70, Math.min(240, Math.floor((width * height) / 7000)));
      stars = Array.from({ length: count }, () => ({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() < 0.85 ? 0.8 + Math.random() * 1.1 : 1.8 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
        speed: 2 + Math.random() * 8,
      }));
    };
    resize();
    window.addEventListener("resize", resize);

    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      time += dt;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      for (const s of stars) {
        const px = s.x * width;
        const py = (s.y * height - scrollY * 0.12 - time * s.speed) % height;
        const y = py < 0 ? py + height : py;
        const twinkle = reduced ? 1 : 0.55 + 0.45 * Math.sin(time * 1.8 + s.phase);
        ctx.globalAlpha = twinkle;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(px, y, s.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (!reduced) raf = requestAnimationFrame(frame);
    };
    ctx.fillStyle = "#000000";
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
