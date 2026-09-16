import { ROUTES } from "@/lib/constants";

/** World-space rectangle (the festival grounds live on a 1640×1040 canvas) */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Room flavors drive the prop art: task rooms (cafeteria→torii, board→ema,
 * console→scroll, bunks→omamori, comms→tōrō, reactor→chōchin) plus decorative
 * grounds rooms. Flavor names are kept for prop-art dispatch.
 */
export type RoomFlavor =
  | "cafeteria"
  | "board"
  | "console"
  | "bunks"
  | "comms"
  | "reactor"
  | "engine"
  | "security"
  | "medbay"
  | "o2"
  | "admin"
  | "shields"
  | "electrical";

/** The interactive festival prop inside a room — bridges the game to the site */
export interface RoomTask {
  id: string;
  label: string;
  sub: string;
  to: string;
  /** Prop position (world units, anchor = bottom-center of the prop art) */
  x: number;
  y: number;
  /** Where MOCHI stands to use it */
  targetX: number;
  targetY: number;
}

export interface RoomDef {
  id: string;
  name: string;
  rect: Rect;
  /** Floor tint (matsuri-style: every room has its own color) */
  floor: string;
  flavor: RoomFlavor;
  task: RoomTask | null;
}

export const WORLD_W = 1640;
export const WORLD_H = 1040;
/** Player collision radius */
export const PLAYER_R = 12;
export const WALK_SPEED = 230;
/** Distance (world units) at which a task's USE prompt lights up */
export const PROXIMITY = 120;

export const SPAWN = { x: 980, y: 400 };

/* ------------------------------------------------------------------ */
/* Matsuri grounds — topography of the old station, festival-hearted: */
/* main shrine + zen garden on the left, torii gate top-center,       */
/* stage at the right end, tea stalls and lantern alley along the     */
/* bottom.                                                            */
/* ------------------------------------------------------------------ */

export const ROOMS: RoomDef[] = [
  // ---- Task rooms ----
  {
    id: "cafeteria",
    name: "Torii Gate",
    rect: { x: 830, y: 110, w: 300, h: 330 },
    floor: "#c9b8a0",
    flavor: "cafeteria",
    task: { id: "register", label: "FESTIVAL REGISTRATION", sub: "Join an event", to: ROUTES.events, x: 980, y: 280, targetX: 980, targetY: 355 },
  },
  {
    id: "weapons",
    name: "Shrine",
    rect: { x: 1210, y: 140, w: 150, h: 140 },
    floor: "#c7a997",
    flavor: "board",
    task: { id: "missions", label: "EMA EVENT BOARD", sub: "All events", to: ROUTES.events, x: 1285, y: 215, targetX: 1285, targetY: 252 },
  },
  {
    id: "navigation",
    name: "Stage",
    rect: { x: 1420, y: 380, w: 130, h: 160 },
    floor: "#c2a98f",
    flavor: "console",
    task: { id: "timeline", label: "SCHEDULE SCROLL", sub: "Fest schedule", to: ROUTES.schedule, x: 1485, y: 455, targetX: 1485, targetY: 495 },
  },
  {
    id: "storage",
    name: "Dojo",
    rect: { x: 770, y: 480, w: 210, h: 330 },
    floor: "#c0a488",
    flavor: "bunks",
    task: { id: "crew", label: "OMAMORI PASSES", sub: "Your passes", to: ROUTES.dashboard, x: 875, y: 600, targetX: 875, targetY: 690 },
  },
  {
    id: "comms",
    name: "Tea House",
    rect: { x: 1030, y: 720, w: 170, h: 130 },
    floor: "#b7a98e",
    flavor: "comms",
    task: { id: "comms", label: "TEA HOUSE", sub: "Contact us", to: ROUTES.contact, x: 1115, y: 795, targetX: 1115, targetY: 805 },
  },
  {
    id: "reactor",
    name: "Main Shrine",
    rect: { x: 230, y: 390, w: 160, h: 220 },
    floor: "#b09cab",
    flavor: "reactor",
    task: { id: "about", label: "ABOUT THE FEST", sub: "The story", to: ROUTES.about, x: 310, y: 485, targetX: 310, targetY: 555 },
  },
  // ---- Decorative grounds (walk through them, festival-style) ----
  { id: "o2", name: "Koi Pond", rect: { x: 1150, y: 360, w: 110, h: 110 }, floor: "#8fb59d", flavor: "o2", task: null },
  { id: "shields", name: "Hanabi Lawn", rect: { x: 1240, y: 600, w: 150, h: 150 }, floor: "#b58f9d", flavor: "shields", task: null },
  { id: "admin", name: "Tea Stall", rect: { x: 1000, y: 500, w: 170, h: 140 }, floor: "#b59f86", flavor: "admin", task: null },
  { id: "electrical", name: "Lantern Alley", rect: { x: 560, y: 580, w: 170, h: 220 }, floor: "#b5a97f", flavor: "electrical", task: null },
  { id: "medbay", name: "Ramen Stall", rect: { x: 660, y: 300, w: 160, h: 170 }, floor: "#a3b588", flavor: "medbay", task: null },
  { id: "security", name: "Archery Range", rect: { x: 530, y: 400, w: 100, h: 180 }, floor: "#9db58f", flavor: "security", task: null },
  { id: "upperEngine", name: "Bamboo Grove", rect: { x: 400, y: 240, w: 150, h: 150 }, floor: "#93b58f", flavor: "engine", task: null },
  { id: "lowerEngine", name: "Zen Garden", rect: { x: 400, y: 630, w: 150, h: 150 }, floor: "#adb59d", flavor: "engine", task: null },
];

/** Dark connecting lanes — the lantern-lit paths between grounds */
export const CORRIDORS: Rect[] = [
  // Right wing
  { x: 1070, y: 170, w: 200, h: 90 }, // cafeteria ↔ weapons
  { x: 1220, y: 220, w: 80, h: 200 }, // weapons ↓ o2 junction
  { x: 1200, y: 388, w: 280, h: 74 }, // o2 ↔ navigation
  { x: 1450, y: 480, w: 90, h: 180 }, // navigation ↓
  { x: 1330, y: 580, w: 220, h: 90 }, // ↓ ↔ shields
  { x: 1260, y: 690, w: 90, h: 120 }, // shields ↓
  { x: 1150, y: 730, w: 200, h: 90 }, // ↓ ↔ comms
  // Center
  { x: 1020, y: 380, w: 90, h: 180 }, // cafeteria ↓ admin
  { x: 1110, y: 580, w: 190, h: 80 }, // admin ↔ shields
  { x: 920, y: 530, w: 140, h: 80 }, // storage ↔ admin
  { x: 860, y: 380, w: 90, h: 160 }, // cafeteria ↓ storage (main spine)
  { x: 920, y: 730, w: 170, h: 80 }, // comms ↔ storage
  // Left wing
  { x: 760, y: 330, w: 130, h: 80 }, // medbay ↔ cafeteria
  { x: 510, y: 308, w: 210, h: 74 }, // upper engine ↔ medbay (upper hall)
  { x: 430, y: 350, w: 90, h: 160 }, // upper engine ↓ security hall
  { x: 330, y: 440, w: 260, h: 80 }, // reactor ↔ security
  { x: 260, y: 550, w: 90, h: 140 }, // reactor ↓
  { x: 260, y: 650, w: 200, h: 90 }, // ↓ ↔ lower engine
  { x: 490, y: 650, w: 130, h: 80 }, // lower engine ↔ electrical
  { x: 670, y: 640, w: 160, h: 80 }, // electrical ↔ storage
];

const WALK: Rect[] = [...ROOMS.map((r) => r.rect), ...CORRIDORS];

/** Walk rects shrunk by the player radius — the space the character's center may occupy */
const SHRUNK: Rect[] = WALK.map((r) => ({
  x: r.x + PLAYER_R,
  y: r.y + PLAYER_R,
  w: r.w - PLAYER_R * 2,
  h: r.h - PLAYER_R * 2,
}));

export function canWalk(x: number, y: number): boolean {
  for (const s of SHRUNK) {
    if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) return true;
  }
  return false;
}

function clampIntoShrunk(index: number, x: number, y: number): { x: number; y: number } {
  const s = SHRUNK[index];
  return {
    x: Math.min(Math.max(x, s.x), s.x + s.w),
    y: Math.min(Math.max(y, s.y), s.y + s.h),
  };
}

/** Index of the walk rect containing the point (shrink=PLAYER_R → strictly walkable) */
function rectIndexAt(x: number, y: number, shrink = PLAYER_R): number {
  for (let i = 0; i < WALK.length; i++) {
    const r = WALK[i];
    if (x >= r.x + shrink && x <= r.x + r.w - shrink && y >= r.y + shrink && y <= r.y + r.h - shrink) return i;
  }
  return -1;
}

/* ------------------------------------------------------------------ */
/* Pathfinding — rects are graph nodes where their walkable areas join */
/* ------------------------------------------------------------------ */

interface Passage {
  a: number;
  b: number;
  x: number;
  y: number;
}

const PASSAGES: Passage[] = [];
for (let i = 0; i < WALK.length; i++) {
  for (let j = i + 1; j < WALK.length; j++) {
    const A = WALK[i];
    const B = WALK[j];
    const x0 = Math.max(A.x, B.x) + PLAYER_R;
    const x1 = Math.min(A.x + A.w, B.x + B.w) - PLAYER_R;
    const y0 = Math.max(A.y, B.y) + PLAYER_R;
    const y1 = Math.min(A.y + A.h, B.y + B.h) - PLAYER_R;
    // The overlap must fit the player for the rooms to be truly connected
    if (x1 > x0 && y1 > y0) PASSAGES.push({ a: i, b: j, x: (x0 + x1) / 2, y: (y0 + y1) / 2 });
  }
}

const ADJ: number[][] = WALK.map(() => []);
for (const p of PASSAGES) {
  ADJ[p.a].push(p.b);
  ADJ[p.b].push(p.a);
}

export interface Waypoint {
  x: number;
  y: number;
}

/**
 * Legal walking route between two world points: BFS over the rect graph with
 * waypoint hops through each doorway, ending on the (clamped) tap point.
 * Returns null when the tap is off the grounds.
 */
export function computePath(from: Waypoint, to: Waypoint): Waypoint[] | null {
  const goal = rectIndexAt(to.x, to.y, 0);
  if (goal === -1) return null;
  const dest = clampIntoShrunk(goal, to.x, to.y);

  const start = rectIndexAt(from.x, from.y);
  if (start === -1 || start === goal) return [dest];

  const prev = new Map<number, { node: number; wp: Waypoint }>();
  const seen = new Set<number>([start]);
  let queue = [start];
  let found = false;
  while (queue.length && !found) {
    const next: number[] = [];
    for (const cur of queue) {
      for (const nb of ADJ[cur]) {
        if (seen.has(nb)) continue;
        seen.add(nb);
        const p = PASSAGES.find((q) => (q.a === cur && q.b === nb) || (q.b === cur && q.a === nb))!;
        prev.set(nb, { node: cur, wp: { x: p.x, y: p.y } });
        if (nb === goal) {
          found = true;
          break;
        }
        next.push(nb);
      }
      if (found) break;
    }
    queue = next;
  }
  if (!found) return [dest]; // graceful fallback: collision still blocks walls

  const wps: Waypoint[] = [dest];
  let node = goal;
  while (node !== start) {
    const step = prev.get(node)!;
    wps.unshift(step.wp);
    node = step.node;
  }
  return wps;
}

/** Scale for the full-grounds map overlay so it fills the screen (esp. desktop) */
export function fitMapScale(vw: number, vh: number): number {
  return Math.min((vw * 0.94) / WORLD_W, (vh * 0.82) / WORLD_H);
}

/**
 * Live-map camera scale. Desktop shows the world 1:1; narrow screens zoom out
 * so the visible slice of the grounds is always >= 900 world-px wide — the
 * whole room span becomes visible on phones instead of a pixel sliver.
 */
export function fitViewScale(vw: number, vh: number): number {
  if (vw >= 900) return 1;
  const widthFit = vw / 900; // want ~900 world-px across the screen
  const heightFit = vh / (WORLD_H + 160); // never show too much space beyond the ship
  return Math.min(1, Math.max(widthFit, heightFit));
}

/* ------------------------------------------------------------------ */
/* Wall openings — a doorway is cut ONLY where a hallway passes       */
/* squarely through a wall (perpendicular, mouth clear of corners);   */
/* corner clips keep their solid walls, like the reference map.       */
/* ------------------------------------------------------------------ */

export interface WallGap {
  x: number;
  y: number;
  w: number;
  h: number;
}

const GAPS: WallGap[] = [];
for (const room of ROOMS) {
  const r = room.rect;
  for (const c of CORRIDORS) {
    const x0 = Math.max(r.x, c.x);
    const x1 = Math.min(r.x + r.w, c.x + c.w);
    const y0 = Math.max(r.y, c.y);
    const y1 = Math.min(r.y + r.h, c.y + c.h);
    if (x1 - x0 < 40 || y1 - y0 < 40) continue;
    const straddles = (edge: number, lo: number, hi: number) => lo < edge && edge < hi;

    // The doorway wall is the room edge the corridor actually crosses
    let wall: "top" | "bottom" | "left" | "right" | null = null;
    if (straddles(r.y + r.h, c.y, c.y + c.h)) wall = "bottom";
    else if (straddles(r.y, c.y, c.y + c.h)) wall = "top";
    else if (straddles(r.x + r.w, c.x, c.x + c.w)) wall = "right";
    else if (straddles(r.x, c.x, c.x + c.w)) wall = "left";
    if (!wall) continue;

    if (wall === "bottom" || wall === "top") {
      const m0 = x0 - r.x; // clearance from the wall's left corner
      const m1 = r.x + r.w - x1; // clearance from the right corner
      const perp = wall === "bottom" ? y1 - c.y : c.y + c.h - y0; // reach past the wall band
      const out = wall === "bottom" ? c.y + c.h - (r.y + r.h) : r.y - c.y; // hallway depth outside
      if (m0 < 8 || m1 < 8 || perp < 17 || out < 12) continue;
      GAPS.push({ x: x0 + 6, y: wall === "bottom" ? r.y + r.h - 18 : r.y - 3, w: x1 - x0 - 12, h: 21 });
    } else {
      const m0 = y0 - r.y;
      const m1 = r.y + r.h - y1;
      const perp = wall === "right" ? x1 - c.x : c.x + c.w - x0;
      const out = wall === "right" ? c.x + c.w - (r.x + r.w) : r.x - c.x;
      if (m0 < 8 || m1 < 8 || perp < 17 || out < 12) continue;
      GAPS.push({ x: wall === "right" ? r.x + r.w - 18 : r.x - 3, y: y0 + 6, w: 21, h: y1 - y0 - 12 });
    }
  }
}
export const WALL_GAPS: WallGap[] = GAPS;

/** Name of the room this point is in (null while in a corridor) — drives the room toast */
export function areaIdAt(x: number, y: number): string | null {
  for (const r of ROOMS) {
    const q = r.rect;
    if (x >= q.x && x <= q.x + q.w && y >= q.y && y <= q.y + q.h) return r.name;
  }
  return null;
}
