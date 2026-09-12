interface NovaProps {
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
 * NOVA — the station crewmate. Bean-shaped body with a thick outline, big
 * rounded visor, side backpack and two stubby legs — hand-drawn SVG, no game
 * assets copied. The walk cycle swings each leg around its own hip with a
 * slow ease-in-out alternate gait, synced with the bob keyframe.
 */
export default function Nova({ color = "#4cc9f0", size = 64, walking = false, className = "", flip = false }: NovaProps) {
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
      {/* Backpack (rides on the back, behind the body) */}
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
      {/* Visor — big, rounded, slightly poking past the body */}
      <rect x="23" y="15" width="30" height="16" rx="8" fill="#9fd8e8" stroke={outline} strokeWidth="2.5" />
      <rect x="25" y="17.5" width="26" height="11" rx="5.5" fill="#c9ecf7" opacity="0.55" />
      <ellipse cx="31" cy="21" rx="4.5" ry="2.4" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}

export const NOVA_COLORS: { name: string; value: string }[] = [
  { name: "Cyan", value: "#4cc9f0" },
  { name: "Magenta", value: "#f15bb5" },
  { name: "Amber", value: "#ffb703" },
  { name: "Lime", value: "#8ac926" },
  { name: "Coral", value: "#ff5d6c" },
  { name: "Violet", value: "#9b5de5" },
  { name: "Crimson", value: "#e5383b" },
  { name: "Arctic", value: "#e0fbfc" },
  { name: "Tangerine", value: "#ff924c" },
  { name: "Mint", value: "#7be0c3" },
  { name: "Ocean", value: "#3d6ef7" },
  { name: "Slate", value: "#8d99ae" },
];
