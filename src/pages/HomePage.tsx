import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Map as MapIcon, X, Zap } from "lucide-react";
import Mochi from "@/components/Mochi";
import { sfx } from "@/lib/sfx";
import { useAuth } from "@/context/AuthContext";
import { FEST_NAME, FEST_YEAR, ROUTES } from "@/lib/constants";
import { fetchEvents } from "@/services/data";
import { fetchMyRegistrations } from "@/services/data";
import { regWindowLabel } from "@/lib/format";
import {
  CORRIDORS,
  PROXIMITY,
  ROOMS,
  SPAWN,
  WALK_SPEED,
  WORLD_H,
  WORLD_W,
  WALL_GAPS,
  areaIdAt,
  canWalk,
  computePath,
  fitMapScale,
  fitViewScale,
  type Rect,
  type RoomDef,
  type RoomTask,
} from "@/lib/stationMap";
import type { FestEvent } from "@/types";

const KEYMAP: Record<string, [number, number]> = {
  arrowleft: [-1, 0], a: [-1, 0],
  arrowright: [1, 0], d: [1, 0],
  arrowup: [0, -1], w: [0, -1],
  arrowdown: [0, 1], s: [0, 1],
};

/** Character anchor: MOCHI at size 56 ≈ 63px tall + shadow */
const CHAR_AX = 28;
const CHAR_AY = 74;

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/** Camera scale for this screen — desktop 1:1, phones zoomed out (see fitViewScale) */
const viewScale = () => fitViewScale(window.innerWidth, window.innerHeight);

/** Rooms that carry an interactive task prop */
const TASK_ROOMS: (RoomDef & { task: RoomTask })[] = ROOMS.filter(
  (r): r is RoomDef & { task: RoomTask } => r.task !== null
);

/** Unscaled PropArt root widths — props target ~60% of the room's short side */
const PROP_W: Record<RoomDef["flavor"], number> = {
  cafeteria: 210,
  board: 176,
  console: 176,
  bunks: 186,
  comms: 170,
  reactor: 130,
  engine: 0,
  security: 0,
  medbay: 0,
  o2: 0,
  admin: 0,
  shields: 0,
  electrical: 0,
};

/** Props shrink with their room, so small rooms aren't swallowed by furniture */
function propScaleFor(room: RoomDef): number {
  const artW = PROP_W[room.flavor] || 176;
  const m = Math.min(room.rect.w, room.rect.h);
  return Math.min(0.8, Math.max(0.42, (0.6 * m) / artW));
}

/** Unscaled PropArt root heights — keeps the USE badge hugging the shrunken art */
const PROP_H: Record<RoomDef["flavor"], number> = {
  cafeteria: 128,
  board: 138,
  console: 132,
  bunks: 126,
  comms: 130,
  reactor: 136,
  engine: 0,
  security: 0,
  medbay: 0,
  o2: 0,
  admin: 0,
  shields: 0,
  electrical: 0,
};

/* ============================ Grounds art ============================ */

/** Matsuri room: dark wood wall + per-room tinted diamond-checker ground */
function RoomShell({ room }: { room: RoomDef }) {
  const rect = room.rect;
  return (
    <div className="absolute" style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h, zIndex: 2 }}>
      <div
        className="absolute inset-0 rounded-[22px] bg-[#241d2c]"
        style={{ boxShadow: "inset 0 0 0 6px #3d3249, inset 0 10px 0 6px rgba(190,60,90,0.55), 0 14px 34px rgba(0,0,0,0.5)" }}
      />
      <div className="absolute inset-[15px] overflow-hidden rounded-[12px]" style={{ background: room.floor }}>
        <div
          className="absolute -inset-[30%]"
          style={{
            background: "repeating-conic-gradient(rgba(255,255,255,0.12) 0% 25%, rgba(0,0,0,0.10) 0% 50%)",
            backgroundSize: "56px 56px",
            transform: "rotate(45deg)",
          }}
        />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.15), transparent 55%)" }} />
      </div>
      <div
        className="absolute left-1/2 top-[22px] -translate-x-1/2 whitespace-nowrap font-display text-[13px] font-extrabold uppercase tracking-[0.3em] text-white/90"
        style={{ textShadow: "0 2px 0 rgba(0,0,0,0.5)" }}
      >
        {room.name}
      </div>
    </div>
  );
}

function CorridorShell({ rect }: { rect: Rect }) {
  return (
    <div className="absolute" style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h, zIndex: 1 }}>
      <div
        className="absolute inset-0 rounded-[10px] bg-[#241d2c]"
        style={{ boxShadow: "inset 0 0 0 5px #3d3249, inset 0 7px 0 5px rgba(190,60,90,0.4)" }}
      />
      <div className="absolute inset-[11px] overflow-hidden rounded-[6px] bg-[#5c5468]">
        <div
          className="absolute -inset-[30%]"
          style={{
            background: "repeating-conic-gradient(rgba(255,255,255,0.10) 0% 25%, rgba(0,0,0,0.08) 0% 50%)",
            backgroundSize: "56px 56px",
            transform: "rotate(45deg)",
          }}
        />
      </div>
    </div>
  );
}

/** The night-earth plate the grounds sit on, with warm lantern glows to the west */
function GroundPlate() {
  const plate = (x: number, y: number, w: number, h: number, r: number) => (
    <div
      className="absolute rounded-[inherit] bg-[#191423]"
      style={{
        left: x, top: y, width: w, height: h, borderRadius: r,
        boxShadow: "inset 0 0 0 10px #0f0c17, inset 0 18px 0 10px rgba(255,255,255,0.03), 0 30px 80px rgba(0,0,0,0.8)",
      }}
    />
  );
  return (
    <div className="absolute" style={{ left: 0, top: 0, width: WORLD_W, height: WORLD_H, zIndex: 0 }}>
      {plate(110, 300, 230, 470, 110)}
      {plate(220, 70, 1360, 910, 190)}
      {plate(1500, 350, 130, 350, 90)}
      {/* Warm lantern glows along the west edge (bamboo grove / zen garden) */}
      {[
        { x: 28, y: 350, w: 120, h: 130 },
        { x: 6, y: 490, w: 150, h: 150 },
        { x: 28, y: 630, w: 120, h: 130 },
      ].map((f, i) => (
        <div
          key={i}
          className="absolute rounded-[50%]"
          style={{
            left: f.x, top: f.y, width: f.w, height: f.h,
            background: "radial-gradient(ellipse at 80% 50%, rgba(255,209,102,0.9), rgba(255,143,90,0.4) 55%, transparent 75%)",
            filter: "blur(6px)",
          }}
        />
      ))}
    </div>
  );
}

/** Non-interactive round table (fills the torii plaza like the reference image) */
function DecoTable({ x, y }: { x: number; y: number }) {
  return (
    <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: x, top: y, zIndex: Math.round(y) }}>
      <div
        className="h-[52px] w-[88px] rounded-[50%] border-[5px] border-[#8f2f38] bg-[#c94a52]"
        style={{ boxShadow: "0 8px 0 rgba(0,0,0,0.25), inset 0 5px 0 rgba(255,255,255,0.22)" }}
      />
      <div className="mx-auto -mt-1.5 h-3 w-[80%] rounded-[50%] bg-black/25 blur-[2px]" />
    </div>
  );
}

/* ============================ Task props ============================ */

function PropArt({ flavor, color }: { flavor: RoomDef["flavor"]; color: string }) {
  switch (flavor) {
    case "cafeteria": // Vermilion torii gate — center of the grounds
      return (
        <div className="relative" style={{ width: 210, height: 128 }}>
          <div className="absolute inset-x-0 top-[112px] h-3 rounded-full bg-black/30 blur-[2px]" />
          <div className="absolute left-1/2 top-2 h-[108px] w-[168px] -translate-x-1/2">
            <div className="absolute -top-1.5 left-1/2 h-[13px] w-[184px] -translate-x-1/2 rounded-[4px] bg-[#2b1d1d] shadow-[0_4px_0_rgba(0,0,0,0.25)]" />
            <div className="absolute left-1/2 top-[13px] h-[9px] w-[168px] -translate-x-1/2 rounded-[3px] bg-[#d93838] shadow-[0_3px_0_rgba(0,0,0,0.22)]" />
            <div className="absolute left-0 top-[22px] h-[74px] w-[13px] rounded-t-[3px] bg-[#e04545] shadow-[inset_-3px_0_0_rgba(0,0,0,0.15)]" />
            <div className="absolute right-0 top-[22px] h-[74px] w-[13px] rounded-t-[3px] bg-[#e04545] shadow-[inset_-3px_0_0_rgba(0,0,0,0.15)]" />
            <div className="absolute left-1/2 top-[30px] h-[9px] w-[132px] -translate-x-1/2 bg-[#d93838]" />
          </div>
          <div className="absolute inset-x-0 top-[100px] text-center font-display font-extrabold tracking-[0.28em] text-white">
            参上
          </div>
        </div>
      );
    case "board": // Ema board — wooden plaques hung in rows
      return (
        <div className="relative" style={{ width: 176, height: 138 }}>
          <div
            className="absolute inset-x-1 top-0 h-[100px] rounded-xl border-4 border-[#7a5a34] bg-[#f3e6cf] p-2"
            style={{ boxShadow: "0 7px 0 rgba(0,0,0,0.3)" }}
          >
            <div className="flex h-full items-end justify-around px-1">
              {["#f3d9b1", "#e8c9a0", "#f3d9b1", "#e8c9a0", "#f3d9b1", "#e8c9a0"].map((c, i) => (
                <div key={i} className="relative">
                  <div className="mx-auto h-2 w-1 bg-[#8a6b45]" />
                  <div className="h-7 w-6 rounded-b-[6px] rounded-t-[3px]" style={{ background: c }} />
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-2 left-9 h-9 w-2.5 rounded-sm bg-[#7a5a34]" />
          <div className="absolute bottom-2 right-9 h-9 w-2.5 rounded-sm bg-[#7a5a34]" />
          <div className="absolute inset-x-0 bottom-0 text-center font-display font-extrabold tracking-[0.28em] text-white">
            EMA
          </div>
        </div>
      );
    case "console": // Hanging paper schedule scroll
      return (
        <div className="relative" style={{ width: 176, height: 132 }}>
          <div className="absolute left-1/2 top-0 h-4 w-1.5 -translate-x-1/2 bg-[#3d3249]" />
          <div className="absolute left-1/2 top-0 h-4 w-8 -translate-x-1/2 rounded-t-full bg-[#3d3249]" />
          <div
            className="absolute inset-x-0 top-3 h-[92px] rounded-md border-4 border-[#8a6b45] bg-[#f7efdc] p-2.5"
            style={{ boxShadow: "0 0 18px rgba(255,171,94,0.25), 0 7px 0 rgba(0,0,0,0.3)" }}
          >
            <div className="flex h-full flex-col justify-center gap-1.5">
              {[92, 70, 82, 55].map((w, i) => (
                <div key={i} className="h-2 rounded-full" style={{ width: `${w}%`, background: ["#e04545", "#ffab5e", "#8ac926", "#ff8fab"][i], opacity: 0.85 }} />
              ))}
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 text-center font-display font-extrabold tracking-[0.28em] text-white">
            SCHEDULE
          </div>
        </div>
      );
    case "bunks": // Omamori charm rack
      return (
        <div className="relative" style={{ width: 186, height: 126 }}>
          <div
            className="absolute right-0 top-0 h-[92px] w-11 rounded-md border-4 border-[#8a6b45] bg-[#c9a86a]"
            style={{ boxShadow: "0 6px 0 rgba(0,0,0,0.3), inset 0 4px 0 rgba(255,255,255,0.25)" }}
          >
            <div className="mx-auto mt-2.5 h-1.5 w-6 rounded-full bg-[#3d2f1f]/60" />
            <div className="mx-auto mt-2 h-1.5 w-6 rounded-full bg-[#3d2f1f]/60" />
          </div>
          {[0, 1].map((b) => (
            <div
              key={b}
              className="absolute left-0 flex items-start gap-1.5"
              style={{ top: b * 44, width: 118, height: 40 }}
            >
              {["#e04545", "#ffab5e", "#3ddc84", color].map((c, i) => (
                <div key={i} className="relative">
                  <div className="mx-auto h-2 w-[3px] bg-[#3d2f1f]/70" />
                  <div
                    className="flex h-8 w-7 items-center justify-center rounded-b-[9px] rounded-t-[3px] border-2 border-[#3d2f1f]/40"
                    style={{ background: c, boxShadow: "0 4px 0 rgba(0,0,0,0.2)" }}
                  >
                    <span className="text-[7px] font-black text-white/90">守</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div className="absolute inset-x-0 bottom-0 text-center font-display font-extrabold tracking-[0.28em] text-white">
            OMAMORI
          </div>
        </div>
      );
    case "comms": // Stone tōrō lantern
      return (
        <div className="relative" style={{ width: 170, height: 130 }}>
          <div className="absolute left-1/2 top-0 h-6 w-1.5 -translate-x-1/2 bg-[#3d3249]" />
          <div className="absolute left-1/2 top-0 h-6 w-6 -translate-x-1/2 rounded-full border-4 border-[#fdf6ec] bg-[#ffab5e]/30" />
          <div
            className="absolute inset-x-0 top-5 h-[90px] rounded-md border-4 border-[#6b6577] bg-[#4a4655] p-2.5"
            style={{ boxShadow: "0 0 18px rgba(255,171,94,0.25), 0 7px 0 rgba(0,0,0,0.3)" }}
          >
            <div className="flex h-full items-center justify-center gap-1.5">
              {[34, 24, 14].map((s) => (
                <div key={s} className="rounded-full border-2 border-[#ffd166]/80 bg-[#ffd166]/25" style={{ width: s, height: s }} />
              ))}
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 text-center font-display font-extrabold tracking-[0.28em] text-white">
            TEA HOUSE
          </div>
        </div>
      );
    case "reactor": // Giant glowing chōchin lantern
      return (
        <div className="relative flex flex-col items-center" style={{ width: 130, height: 136 }}>
          <div
            className="flex h-[104px] w-[104px] items-center justify-center rounded-[50%] border-8 border-[#8f2f38] bg-[#ffab5e]"
            style={{ boxShadow: "0 0 34px rgba(255,171,94,0.6), 0 8px 0 rgba(0,0,0,0.3)" }}
          >
            <span className="animate-pulse font-display text-2xl font-black text-[#8f2f38]">祭</span>
          </div>
          <div className="mt-1 font-display font-extrabold tracking-[0.28em] text-white">MAIN SHRINE</div>
        </div>
      );
    default:
      return null;
  }
}

/* ============================ Page ============================ */

export default function HomePage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [events, setEvents] = useState<FestEvent[]>([]);
  const [regsCount, setRegsCount] = useState(0);
  const [near, setNear] = useState<(typeof TASK_ROOMS)[number] | null>(null);
  const [moving, setMoving] = useState(false);
  const [facing, setFacing] = useState<"left" | "right">("right");
  const [mapOpen, setMapOpen] = useState(false);
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [roomToast, setRoomToast] = useState<{ name: string; key: number } | null>(null);

  const posRef = useRef({ x: SPAWN.x, y: SPAWN.y });
  const velRef = useRef({ x: 0, y: 0 });
  const keysRef = useRef(new Set<string>());
  const pathRef = useRef<{ x: number; y: number }[] | null>(null);
  const autoUseRef = useRef<string | null>(null);
  const camRef = useRef({ x: 0, y: 0, init: false });

  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const charRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const lastAreaRef = useRef<string | null>(null);
  const stickRef = useRef({ active: false, dx: 0, dy: 0 });
  const [stickOn, setStickOn] = useState(false);
  const [stickKnob, setStickKnob] = useState({ x: 0, y: 0 });
  const nearIdRef = useRef<string | null>(null);
  const movingRef = useRef(false);
  const facingRef = useRef<"left" | "right">("right");
  const mapOpenRef = useRef(false);
  mapOpenRef.current = mapOpen;

  const charColor = localStorage.getItem("nexorium-color") ?? "#4cc9f0";
  const displayName = profile?.full_name?.split(" ")[0]?.toUpperCase() || null;

  useEffect(() => {
    let alive = true;
    fetchEvents()
      .then((e) => alive && setEvents(e))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  /** Logged-in: how many events this guest registered (real count for the Dojo room) */
  useEffect(() => {
    if (!user) {
      setRegsCount(0);
      return;
    }
    let alive = true;
    fetchMyRegistrations(user.id)
      .then((r) => alive && setRegsCount(r.length))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!roomToast) return;
    const t = setTimeout(() => setRoomToast(null), 1600);
    return () => clearTimeout(t);
  }, [roomToast]);

  const openCount = events.filter((e) => regWindowLabel(e).tone === "open").length;

  /** Real per-room mission counts for the map overlay ( caf→all, weapons→open, nav→all, storage→user's passes→reg count etc.) */
  const roomCounts = useMemo(() => {
    const open = events.filter((e) => regWindowLabel(e).tone === "open");
    return {
      register: events.length,
      missions: open.length,
      timeline: events.length,
      crew: regsCount,
      comms: events.length ? 1 : 0,
      about: events.length ? 1 : 0,
    } as Record<string, number>;
  }, [events, regsCount]);

  /** Use a task: celebrate, remember it, navigate to the real feature */
  const useTask = useCallback(
    (room: (typeof TASK_ROOMS)[number]) => {
      sfx.confirm();
      setVisited((prev) => new Set(prev).add(room.task.id));
      navigate(room.task.to);
    },
    [navigate]
  );
  const useTaskRef = useRef(useTask);
  useTaskRef.current = useTask;

  /** Walk legally to a task, then auto-use on arrival (one tap from anywhere) */
  const goTask = useCallback((room: (typeof TASK_ROOMS)[number], autoUse = true) => {
    const path = computePath(posRef.current, { x: room.task.targetX, y: room.task.targetY });
    if (!path) return;
    pathRef.current = path;
    autoUseRef.current = autoUse ? room.task.id : null;
    sfx.blip();
  }, []);

  /* ------------------------- Main game loop ------------------------- */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let nearAcc = 0;

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const p = posRef.current;
      const vp = viewportRef.current;

      // ---- Input: keys + virtual joystick override any tap path ----
      let kx = 0;
      let ky = 0;
      if (!mapOpenRef.current) {
        for (const k of keysRef.current) {
          const v = KEYMAP[k];
          if (v) {
            kx += v[0];
            ky += v[1];
          }
        }
        const stick = stickRef.current;
        if (stick.active) {
          kx += stick.dx;
          ky += stick.dy;
        }
      }
      let tvx = 0;
      let tvy = 0;
      if (kx !== 0 || ky !== 0) {
        pathRef.current = null;
        const len = Math.hypot(kx, ky) || 1;
        tvx = (kx / len) * WALK_SPEED;
        tvy = (ky / len) * WALK_SPEED;
      } else if (pathRef.current && pathRef.current.length) {
        // ---- Steer through pathfinding waypoints ----
        const wp = pathRef.current[0];
        const dx = wp.x - p.x;
        const dy = wp.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 14) {
          pathRef.current.shift();
        } else {
          const ease = pathRef.current.length === 1 ? clamp(dist / 70, 0.45, 1) : 1;
          tvx = (dx / dist) * WALK_SPEED * ease;
          tvy = (dy / dist) * WALK_SPEED * ease;
        }
      }

      // ---- Buttery velocity smoothing (frame-rate independent) ----
      const blend = 1 - Math.exp(-12 * dt);
      velRef.current.x += (tvx - velRef.current.x) * blend;
      velRef.current.y += (tvy - velRef.current.y) * blend;
      const vx = velRef.current.x;
      const vy = velRef.current.y;

      // ---- Integrate with wall sliding (sub-stepped, axis separated) ----
      const stepLen = 8;
      const dist = Math.hypot(vx, vy) * dt;
      const steps = Math.max(1, Math.ceil(dist / stepLen));
      for (let i = 0; i < steps; i++) {
        const nx = p.x + (vx * dt) / steps;
        if (canWalk(nx, p.y)) p.x = nx;
        else velRef.current.x = 0;
        const ny = p.y + (vy * dt) / steps;
        if (canWalk(p.x, ny)) p.y = ny;
        else velRef.current.y = 0;
      }

      // ---- Facing + moving state ----
      const isMoving = Math.abs(velRef.current.x) > 4 || Math.abs(velRef.current.y) > 4;
      if (Math.abs(velRef.current.x) > 20) {
        const nf = velRef.current.x < 0 ? "left" : "right";
        if (nf !== facingRef.current) {
          facingRef.current = nf;
          setFacing(nf);
        }
      }
      if (isMoving !== movingRef.current) {
        movingRef.current = isMoving;
        setMoving(isMoving);
      }

      // ---- Paint character (transform only — no re-render) ----
      if (charRef.current) {
        charRef.current.style.transform = `translate3d(${p.x - CHAR_AX}px, ${p.y - CHAR_AY}px, 0)`;
        charRef.current.style.zIndex = String(Math.round(p.y));
      }

      // ---- Camera: smooth follow, clamped to the ship (scale-aware) ----
      if (vp) {
        const vw = vp.clientWidth;
        const vh = vp.clientHeight;
        const scale = viewScale();
        // Visible world size = screen / scale
        const worldW = vw / scale;
        const worldH = vh / scale;
        const tx = worldW >= WORLD_W ? (WORLD_W - worldW) / 2 : clamp(p.x - worldW / 2, 0, Math.max(0, WORLD_W - worldW));
        const ty = worldH >= WORLD_H ? (WORLD_H - worldH) / 2 : clamp(p.y - worldH / 2, 0, Math.max(0, WORLD_H - worldH));
        if (!camRef.current.init) {
          camRef.current = { x: tx, y: ty, init: true };
        } else {
          const cb = 1 - Math.exp(-8 * dt);
          camRef.current.x += (tx - camRef.current.x) * cb;
          camRef.current.y += (ty - camRef.current.y) * cb;
        }
        if (worldRef.current) {
          worldRef.current.style.transform = `scale(${scale}) translate3d(${-camRef.current.x}px, ${-camRef.current.y}px, 0)`;
        }
        if (dotRef.current) {
          dotRef.current.style.left = `${p.x}px`;
          dotRef.current.style.top = `${p.y}px`;
        }
      }

      // ---- Proximity + auto-use (throttled) ----
      nearAcc += dt;
      if (nearAcc > 0.1) {
        nearAcc = 0;

        // Room-entry toast (game-style area label)
        const area = areaIdAt(p.x, p.y);
        if (area !== lastAreaRef.current) {
          lastAreaRef.current = area;
          if (area) setRoomToast({ name: area, key: Math.round(now) });
        }

        let best: (typeof TASK_ROOMS)[number] | null = null;
        let bestD = Infinity;
        for (const r of TASK_ROOMS) {
          const d = Math.hypot(r.task.targetX - p.x, r.task.targetY - p.y);
          if (d < bestD) {
            bestD = d;
            best = r;
          }
        }
        const hit = bestD <= PROXIMITY ? best : null;
        const id = hit?.task.id ?? null;
        if (id !== nearIdRef.current) {
          nearIdRef.current = id;
          setNear(hit);
        }
        if (hit && autoUseRef.current && autoUseRef.current === hit.task.id) {
          autoUseRef.current = null;
          pathRef.current = null;
          useTaskRef.current(hit);
        }
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ------------------------- Keyboard ------------------------- */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (KEYMAP[k]) {
        e.preventDefault();
        keysRef.current.add(k);
      } else if (k === "escape" && mapOpenRef.current) {
        setMapOpen(false);
      } else if (k === "m") {
        setMapOpen((v) => !v);
      } else if ((k === "e" || k === "enter") && nearIdRef.current) {
        const room = TASK_ROOMS.find((r) => r.task.id === nearIdRef.current);
        if (room) useTaskRef.current(room);
      }
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    const blur = () => keysRef.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  /** Tap the floor: pathfind to the tapped world point (scale-aware) */
  const tapWalk = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const vp = viewportRef.current;
    if (!vp) return;
    const rect = vp.getBoundingClientRect();
    const scale = viewScale();
    const wx = (e.clientX - rect.left) / scale + camRef.current.x;
    const wy = (e.clientY - rect.top) / scale + camRef.current.y;
    const path = computePath(posRef.current, { x: wx, y: wy });
    if (path) {
      pathRef.current = path;
      autoUseRef.current = null;
      sfx.blip();
    }
  }, []);

  /* ------------------- Virtual joystick (touch devices) ------------------- */
  const stickBaseRef = useRef<HTMLDivElement>(null);
  const stickPointer = useRef<number | null>(null);

  useEffect(() => {
    // Show the stick only where hover is unavailable (phones/tablets)
    const mq = window.matchMedia("(hover: none), (pointer: coarse)");
    // ?forcetouch — preview the phone HUD (stick + thumb MAP button) on desktop
    const force = new URLSearchParams(window.location.search).has("forcetouch");
    const apply = () => setStickOn(force || mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  const STICK_R = 52; // knob travel radius in screen px

  const stickDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    stickPointer.current = e.pointerId;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    stickRef.current = { active: true, dx: 0, dy: 0 };
    setStickKnob({ x: 0, y: 0 });
  };
  const stickMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (stickPointer.current !== e.pointerId) return;
    const base = stickBaseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const len = Math.hypot(dx, dy);
    const max = STICK_R;
    if (len > max) {
      dx = (dx / len) * max;
      dy = (dy / len) * max;
    }
    setStickKnob({ x: dx, y: dy });
    const dead = 10;
    const mag = Math.max(0, len - dead) / (max - dead);
    const norm = Math.hypot(dx, dy) || 1;
    stickRef.current = {
      active: len > dead,
      dx: (dx / norm) * mag,
      dy: (dy / norm) * mag,
    };
  };
  const stickUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (stickPointer.current !== e.pointerId) return;
    stickPointer.current = null;
    stickRef.current = { active: false, dx: 0, dy: 0 };
    setStickKnob({ x: 0, y: 0 });
  };

  const mapScale = useMemo(() => (mapOpen ? fitMapScale(window.innerWidth, window.innerHeight) : 1), [mapOpen]);
  /** Font size inside the scaled overlay that renders as ~N px on screen */
  const fs = (px: number) => `${px / mapScale}px`;

  return (
    <div
      ref={viewportRef}
      onClick={tapWalk}
      className="game-viewport relative w-full select-none overflow-hidden touch-none"
      role="application"
      aria-label={`${FEST_NAME} matsuri map — walk with WASD, the stick, or tap, press E to use`}
    >
      {/* ======================= THE GROUNDS (world space) ======================= */}
      <div ref={worldRef} className="absolute left-0 top-0 origin-top-left will-change-transform" style={{ width: WORLD_W, height: WORLD_H }}>
        <GroundPlate />
        {CORRIDORS.map((c, i) => (
          <CorridorShell key={i} rect={c} />
        ))}
        {ROOMS.map((r) => (
          <RoomShell key={r.id} room={r} />
        ))}

        {/* Wall openings — corridors connect through gaps in the room walls */}
        {WALL_GAPS.map((g, i) => (
          <div
            key={`gap-${i}`}
            className="absolute overflow-hidden"
            aria-hidden
            style={{
              left: g.x,
              top: g.y,
              width: g.w,
              height: g.h,
              zIndex: 3,
              borderRadius: 6,
              backgroundColor: "#8a949e",
              backgroundImage: "repeating-conic-gradient(rgba(255,255,255,0.12) 0% 25%, rgba(0,0,0,0.10) 0% 50%)",
              backgroundSize: "56px 56px",
              boxShadow:
                g.w > g.h
                  ? "inset 4px 0 0 #3a4048, inset -4px 0 0 #3a4048"
                  : "inset 0 4px 0 #3a4048, inset 0 -4px 0 #3a4048",
            }}
          />
        ))}

        {/* Torii plaza decoration — corner tables like the reference */}
        <DecoTable x={892} y={182} />
        <DecoTable x={1072} y={182} />
        <DecoTable x={892} y={392} />
        <DecoTable x={1072} y={392} />

        {/* Task props */}
        {TASK_ROOMS.map((r) => {
          const isNear = near?.task.id === r.task.id;
          return (
            <button
              key={r.id}
              onClick={(e) => {
                e.stopPropagation();
                // Already close? Use it. Otherwise walk over and auto-use.
                if (isNear) useTask(r);
                else goTask(r);
              }}
              className="group absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-105 focus:outline-none"
              style={{ left: r.task.x, top: r.task.y, zIndex: Math.round(r.task.y) }}
              aria-label={`${r.task.label} — ${r.task.sub}`}
            >
              <div style={{ transform: `scale(${propScaleFor(r)})`, fontSize: 11 / propScaleFor(r) }}>
                <PropArt flavor={r.flavor} color={charColor} />
              </div>
              {isNear && (
                <motion.span
                  initial={{ scale: 0, y: -6, x: "-50%" }}
                  animate={{ scale: 1, y: 0, x: "-50%" }}
                  className="btn-3d-sm absolute left-1/2 rounded-full bg-[#3ddc84] px-4 py-1 font-display text-sm font-extrabold tracking-[0.2em] text-[#08110b]"
                  style={{ top: (PROP_H[r.flavor] * (1 - propScaleFor(r))) / 2 - 34 }}
                >
                  USE
                </motion.span>
              )}
            </button>
          );
        })}

        {/* MOCHI — painted at 60fps via transform */}
        <div ref={charRef} className="pointer-events-none absolute left-0 top-0" style={{ zIndex: Math.round(SPAWN.y) }}>
          <div className="flex flex-col items-center">
            <div className={moving ? "nova-bob" : ""}>
              <Mochi color={charColor} size={56} walking={moving} flip={facing === "left"} />
            </div>
            <div className="-mt-1.5 h-2.5 w-11 rounded-[50%] bg-black/30 blur-[1.5px]" />
          </div>
        </div>
      </div>

      {/* ======================= HUD ======================= */}

      {/* Title chip */}
      <div className="safe-top pointer-events-none absolute left-1/2 top-3 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/70 px-3 text-center sm:px-5">
        <div className="font-display text-xs font-extrabold tracking-[0.2em] text-white sm:text-sm">
          {FEST_NAME} <span className="text-white/60">{FEST_YEAR}</span>
          <span className="ml-2 hidden text-[11px] text-white/60 sm:ml-3 sm:inline">
            <i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#3ddc84]" />
            {events.length || "--"} EVENTS · {openCount || "--"} OPEN
          </span>
        </div>
      </div>

      {/* Room-entry toast */}
      {roomToast && (
        <motion.div
          key={roomToast.key}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-none absolute left-1/2 top-16 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/75 px-5 py-1.5 font-display text-[11px] font-extrabold uppercase tracking-[0.3em] text-white/90"
        >
          — {roomToast.name} —
        </motion.div>
      )}

      {/* TASKS checklist (desktop) */}
      <div className="absolute left-3 top-3 z-20 hidden w-60 rounded-2xl border-4 border-[#2b3a63] bg-black/70 p-3 sm:block" onClick={(e) => e.stopPropagation()}>
        <div className="font-display text-[11px] font-extrabold tracking-[0.25em] text-white/60">✦ TASKS</div>
        <ul className="mt-1.5 space-y-1">
          {TASK_ROOMS.map((r) => {
            const done = visited.has(r.task.id);
            return (
              <li key={r.task.id}>
                <button onClick={() => goTask(r)} className="flex w-full items-center gap-2 rounded-lg px-1 py-0.5 text-left hover:bg-white/10">
                  <span
                    className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 text-[8px] font-black ${
                      done ? "border-[#3ddc84] bg-[#3ddc84] text-[#08110b]" : "border-white/40 text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <span className="font-display text-[11px] font-extrabold tracking-wider text-white/85">{r.task.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* MAP button — desktop keeps it top-right; phones get a thumb button by the stick instead */}
      {!stickOn && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMapOpen(true);
            sfx.blip();
          }}
          className="btn-3d absolute right-3 top-3 z-20 rounded-full bg-[#3ddc84] px-6 py-2.5 font-display text-sm font-extrabold tracking-[0.2em] text-[#08110b] transition-transform active:translate-y-0.5"
        >
          MAP
        </button>
      )}

      {/* Quick actions — context USE stacks on top, then register/sign-in */}
      <div className="safe-bottom absolute bottom-4 right-3 z-20 flex flex-col items-stretch gap-2" onClick={(e) => e.stopPropagation()}>
        {near && (
          <motion.button
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => useTask(near)}
            className="btn-3d flex flex-col items-center whitespace-nowrap rounded-2xl bg-[#3ddc84] px-7 py-2 font-display font-extrabold text-[#08110b]"
          >
            <span className="flex items-center gap-1.5 text-base tracking-widest">
              <Zap size={16} strokeWidth={3} /> USE
            </span>
            <span className="text-[9px] tracking-[0.25em] opacity-80">{near.task.label}</span>
          </motion.button>
        )}
        {user ? (
          <button
            onClick={() => {
              sfx.confirm();
              navigate(ROUTES.dashboard);
            }}
            className="btn-3d-sm whitespace-nowrap rounded-full bg-[#39729c] px-5 py-2 font-display text-xs font-extrabold tracking-widest text-white"
          >
            MY PASSES
          </button>
        ) : (
          <>
            <button
              onClick={() => {
                sfx.confirm();
                navigate(ROUTES.signup);
              }}
              className="btn-3d-sm whitespace-nowrap rounded-full bg-[#3ddc84] px-5 py-2 font-display text-xs font-extrabold tracking-widest text-[#08110b]"
            >
              REGISTER FREE
            </button>
            <button
              onClick={() => {
                sfx.blip();
                navigate(ROUTES.login);
              }}
              className="btn-3d-sm whitespace-nowrap rounded-full border-2 border-white/30 bg-black/70 px-5 py-2 font-display text-xs font-extrabold tracking-widest text-white"
            >
              SIGN IN
            </button>
          </>
        )}
      </div>

      {/* Touch controls — stick + MAP thumb button, both within one thumb's reach */}
      {stickOn && (
        <div
          className="absolute left-5 z-30 flex items-end gap-3"
          style={{ bottom: "max(1.5rem, env(safe-area-inset-bottom, 0px))" }}
        >
          <div
            ref={stickBaseRef}
            onPointerDown={stickDown}
            onPointerMove={stickMove}
            onPointerUp={stickUp}
            onPointerCancel={stickUp}
            className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white/25 bg-black/40 backdrop-blur-sm"
            style={{ touchAction: "none" }}
            role="application"
            aria-label="Movement stick"
          >
            <div
              className="pointer-events-none flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/60 bg-white/25"
              style={{ transform: `translate(${stickKnob.x}px, ${stickKnob.y}px)`, transition: stickPointer.current === null ? "transform 0.15s" : "none" }}
            >
              <div className="h-2 w-2 rounded-full bg-white/80" />
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMapOpen(true);
              sfx.blip();
            }}
            className="btn-3d flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-full border-2 border-[#08110b]/40 bg-[#3ddc84] text-[#08110b] transition-transform active:translate-y-0.5"
            style={{ touchAction: "manipulation" }}
            aria-label="Open matsuri map"
          >
            <MapIcon size={20} strokeWidth={3} />
            <span className="font-display text-[8px] font-black tracking-[0.2em]">MAP</span>
          </button>
        </div>
      )}

      {/* Hint pill */}
      {!near && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/75 px-4 py-1.5 font-display text-[10px] font-extrabold tracking-[0.2em] text-white/70">
          {stickOn ? "DRAG STICK · TAP TO MOVE · USE + MAP ON THUMBS" : "WASD / ARROWS WALK · TAP TO MOVE · E USE · M MAP"}
        </div>
      )}

      {/* ======================= FULL-GROUNDS MAP OVERLAY ======================= */}
      {mapOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black"
          onClick={() => setMapOpen(false)}
        >
          <div className="pointer-events-none absolute left-1/2 top-5 -translate-x-1/2 text-center">
            <div className="font-display text-xl font-extrabold tracking-[0.3em] text-white">
              {FEST_NAME} · MATSURI MAP
            </div>
            <div className="mt-1 font-display text-[10px] font-bold tracking-[0.3em] text-white/50">
              {user
                ? `GUEST ${displayName ?? "UNKNOWN"} · ${regsCount} EVENT${regsCount === 1 ? "" : "S"} REGISTERED`
                : "TAP A ROOM — MOCHI WALKS THERE AND USES IT"}
            </div>
          </div>
          <button
            onClick={() => setMapOpen(false)}
            className="absolute right-4 top-4 rounded-full border-2 border-white/30 p-2 text-white/80 hover:text-white"
            aria-label="Close map"
          >
            <X size={18} />
          </button>

          <div
            className="relative"
            style={{ width: WORLD_W * mapScale, height: WORLD_H * mapScale }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute left-0 top-0 origin-top-left" style={{ width: WORLD_W, height: WORLD_H, transform: `scale(${mapScale})` }}>
              {CORRIDORS.map((c, i) => (
                <div key={i} className="absolute rounded-[10px] bg-[#3d3249]" style={{ left: c.x, top: c.y, width: c.w, height: c.h }} />
              ))}
              {ROOMS.map((r) => {
                const count = r.task ? roomCounts[r.task.id] ?? 0 : 0;
                const label = (
                  <>
                    <span className="whitespace-nowrap font-display font-extrabold uppercase text-white" style={{ fontSize: fs(r.task ? 14 : 11), textShadow: "0 2px 0 rgba(0,0,0,0.45)" }}>
                      {r.name}
                    </span>
                    {Boolean(r.task) && (
                      <span className="whitespace-nowrap font-display font-bold text-white/80" style={{ fontSize: fs(10) }}>
                        {r.task!.label}
                      </span>
                    )}
                    {Boolean(r.task) && count > 0 && (
                      <span
                        className="mt-[0.15em] whitespace-nowrap rounded-full bg-black/45 px-[0.6em] font-display font-black text-[#3ddc84]"
                        style={{ fontSize: fs(9) }}
                      >
                        {count} {count === 1 ? "EVENT" : "EVENTS"}
                      </span>
                    )}
                  </>
                );
                const base =
                  "group absolute flex flex-col items-center justify-center rounded-[16px] border-4 text-center px-1 transition-all duration-150";
                if (!r.task) {
                  return (
                    <div
                      key={r.id}
                      className={`${base} border-[#5a6272]/60 opacity-80`}
                      style={{ left: r.rect.x, top: r.rect.y, width: r.rect.w, height: r.rect.h, background: r.floor }}
                    >
                      {label}
                    </div>
                  );
                }
                const room = r as RoomDef & { task: RoomTask };
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      goTask(room);
                      setMapOpen(false);
                    }}
                    className={`${base} border-[#b0556b]/80 hover:z-10 hover:scale-[1.03] hover:border-[#ffab5e] hover:shadow-[0_0_24px_rgba(255,171,94,0.35)] focus-visible:border-[#ffab5e] focus-visible:outline-none`}
                    style={{ left: r.rect.x, top: r.rect.y, width: r.rect.w, height: r.rect.h, background: r.floor }}
                  >
                    {label}
                    {visited.has(room.task.id) && (
                      <span className="font-display font-black text-[#3ddc84]" style={{ fontSize: fs(10) }}>
                        ✓ DONE
                      </span>
                    )}
                  </button>
                );
              })}
              {/* Live player dot */}
              <div
                ref={dotRef}
                className="absolute rounded-full border-[3px] border-white"
                style={{ width: 26, height: 26, marginLeft: -13, marginTop: -13, background: charColor, boxShadow: "0 0 12px rgba(255,255,255,0.6)" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
