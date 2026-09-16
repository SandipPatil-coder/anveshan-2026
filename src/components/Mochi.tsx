interface MochiProps {
  color?: string;
  size?: number;
  walking?: boolean;
  className?: string;
  flip?: boolean;
}

function shade(hex: string, amt: number): string {
  const n = hex.replace("#", "");
  const num = parseInt(n, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * MOCHI (餅) — the festival mascot. A plump dango-mochi bean with big kawaii
 * eyes, blush marks, an omamori charm on its back and two stubby legs —
 * hand-drawn SVG, no game assets copied. The walk cycle swings each leg around
 * its own hip with a slow ease-in-out alternate gait, synced with the bob
 * keyframe (keyframe names kept from the previous mascot for stability).
 */
export default function Mochi({ color = "#4cc9f0", size = 64, walking = false, className = "", flip = false }: MochiProps) {
  const dark = shade(color, -60); // limbs + shading
  const outline = shade(color, -85); // thick cartoon outline
  const light = shade(color, 45); // top highlight

  const legStyle = (anim: string): React.CSSProperties =>
    walking
      ? {
          transformBox: "fill-box",
          transformOrigin: "50% 0%",
          animation: `${anim} 0.42s ease-in-out infinite alternate`,
        }
      : { transformBox: "fill-box", transformOrigin: "50% 0%" };

  return (
    <svg
      viewBox="0 0 64 72"
      width={size}
      height={(size * 72) / 64}
      className={className}
      style={{ transform: flip ? "scaleX(-1)" : undefined, overflow: "visible" }}
      aria-hidden
    >
      {/* Omamori charm (rides on the back, behind the body) */}
      <rect x="3" y="17" width="14" height="29" rx="6.5" fill={dark} stroke={outline} strokeWidth="2" />
      {/* Legs — smooth lazy gait, each rotating around its own hip */}
      <rect x="17" y="49" width="12" height="18" rx="5.5" fill={color} stroke={outline} strokeWidth="2.5" style={legStyle("novaStepA")} />
      <rect x="35" y="49" width="12" height="18" rx="5.5" fill={color} stroke={outline} strokeWidth="2.5" style={legStyle("novaStepB")} />
      {/* Body — bean silhouette with a dome top and rounded bottom */}
      <path
        d="M14 33 C14 15 21 7 32 7 C43 7 50 15 50 33 L50 44 C50 51 46 54 40 54 L24 54 C18 54 14 51 14 44 Z"
        fill={color}
        stroke={outline}
        strokeWidth="2.5"
      />
      {/* Top highlight */}
      <path d="M18 22 C19 13 24 10 32 10 C40 10 45 13 46 22 C40 18 24 18 18 22 Z" fill={light} opacity="0.45" />
      {/* Kawaii face — two oval eyes with sparkle + blush */}
      <ellipse cx="27" cy="26" rx="2.6" ry="4.2" fill={outline} />
      <ellipse cx="37" cy="26" rx="2.6" ry="4.2" fill={outline} />
      <circle cx="27.9" cy="24.6" r="0.9" fill="#ffffff" opacity="0.9" />
      <circle cx="37.9" cy="24.6" r="0.9" fill="#ffffff" opacity="0.9" />
      <ellipse cx="21.5" cy="30" rx="3" ry="1.7" fill="#ff8fab" opacity="0.55" />
      <ellipse cx="42.5" cy="30" rx="3" ry="1.7" fill="#ff8fab" opacity="0.55" />
    </svg>
  );
}

/** Palette uses the same hex values as before, so returning users keep their color */
export const MOCHI_COLORS: { name: string; value: string }[] = [
  { name: "Sakura", value: "#ff8fab" },
  { name: "Yamabuki", value: "#ffb703" },
  { name: "Wakaba", value: "#8ac926" },
  { name: "Mikan", value: "#ff924c" },
  { name: "Sumire", value: "#9b5de5" },
  { name: "Fuji", value: "#f15bb5" },
  { name: "Shu", value: "#e5383b" },
  { name: "Yuki", value: "#e0fbfc" },
  { name: "Mizu", value: "#4cc9f0" },
  { name: "Matcha", value: "#7be0c3" },
  { name: "Ai", value: "#3d6ef7" },
  { name: "Sumi", value: "#8d99ae" },
];
