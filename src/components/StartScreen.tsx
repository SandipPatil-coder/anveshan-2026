import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Nova from "@/components/Nova";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { FEST_NAME, FEST_YEAR } from "@/lib/constants";
import { sfx } from "@/lib/sfx";

const DRIFTERS = [
  { color: "#f15bb5", x: 8, y: 12, s: 46, d: 26, r: -14 },
  { color: "#ffb703", x: 78, y: 8, s: 58, d: 31, r: 10 },
  { color: "#8ac926", x: 88, y: 30, s: 44, d: 24, r: 6 },
  { color: "#ef476f", x: 14, y: 68, s: 52, d: 34, r: -8 },
  { color: "#9b5de5", x: 84, y: 74, s: 60, d: 29, r: 16 },
  { color: "#e0fbfc", x: 6, y: 40, s: 40, d: 27, r: -18 },
  { color: "#f15bb5", x: 70, y: 86, s: 42, d: 33, r: 12 },
  { color: "#4cc9f0", x: 30, y: 88, s: 38, d: 28, r: -6 },
];

/** Lobby start screen: black space, floating crew, PRESS START */
export default function StartScreen({ onStart }: { onStart: () => void }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        sfx.confirm();
        onStart();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onStart]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] overflow-hidden bg-black"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
    >
      {/* Version chip (top-left, like a game title screen) */}
      <div className="absolute left-4 top-3 z-10 font-mono text-[10px] tracking-[0.3em] text-white/35">
        V 1.0 — {FEST_NAME.toUpperCase()} STATION
      </div>

      {/* White stars */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 12% 22%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 32% 8%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 56% 16%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 76% 28%, #fff 50%, transparent 51%), radial-gradient(2px 2px at 90% 12%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 20% 48%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 44% 38%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 68% 52%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 86% 44%, #fff 50%, transparent 51%), radial-gradient(1.5px 1.5px at 8% 82%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 38% 72%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 60% 86%, #fff 50%, transparent 51%), radial-gradient(2px 2px at 92% 78%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 50% 60%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 26% 92%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 74% 66%, #fff 50%, transparent 51%)",
        }}
      />

      {/* Drifting crew */}
      {DRIFTERS.map((d, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: `${d.x}%`, top: `${d.y}%`, rotate: `${d.r}deg` }}
          animate={reduced ? undefined : { y: [0, -22, 0], rotate: [d.r, d.r + 8, d.r] }}
          transition={{ repeat: Infinity, duration: d.d / 8, ease: "easeInOut", delay: i * 0.4 }}
        >
          <Nova color={d.color} size={d.s} />
        </motion.div>
      ))}

      {/* Title */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center">
        <h1
          className="font-display text-6xl font-extrabold tracking-[0.08em] text-white sm:text-8xl"
          style={{ textShadow: "0 0 24px rgba(255,255,255,0.35), 0 6px 0 rgba(0,0,0,0.6)" }}
        >
          {FEST_NAME}
        </h1>
        <div className="mt-1 font-display text-2xl font-extrabold tracking-[0.6em] text-white/80 sm:text-3xl">
          {FEST_YEAR}
        </div>
        <p className="mt-4 font-display text-xs font-bold uppercase tracking-[0.35em] text-white/60">
          THE CREW IS WAITING.
        </p>

        <motion.button
          onClick={() => {
            sfx.confirm();
            onStart();
          }}
          animate={reduced ? undefined : { scale: [1, 1.07, 1] }}
          transition={{ repeat: Infinity, duration: 1.1 }}
          className="btn-3d mt-12 rounded-full bg-white px-14 py-4 font-display text-xl font-extrabold tracking-[0.3em] text-black"
        >
          ENTER SHIP
        </motion.button>
        <div className="mt-3 font-display text-[11px] font-bold tracking-[0.3em] text-white/50">
          OR PRESS ENTER
        </div>
      </div>
    </motion.div>
  );
}

/** Replaces the old BootSplash with the lobby screen */
export function StartGate({ children }: { children: React.ReactNode }) {
  const [entered, setEntered] = useState(() => sessionStorage.getItem("nexorium-entered") === "1");
  return (
    <>
      <AnimatePresence>{!entered && <StartScreen onStart={() => {
        sessionStorage.setItem("nexorium-entered", "1");
        setEntered(true);
      }} />}</AnimatePresence>
      {children}
    </>
  );
}
