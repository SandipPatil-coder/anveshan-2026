# ANVESHAN 2026 — Interactive TechFest Platform

A game-like **Space-Station Command Center** for the college tech fest, inspired by the *playful*
side of game UIs (walkable maps, task minigames, chunky buttons) with an original identity — no
copied game assets.

- **Full walkable ship** (Skeld-style): NOVA spawns in the **Cafeteria** and explores the whole
  vessel — hold WASD/arrows, click/tap the floor (auto-pathfinding through corridors), or open the
  **MAP** overlay and tap a room to auto-walk there. Rooms light a **USE** prompt when close.
- **Rooms are the site**: Cafeteria → *emergency registration*, Weapons → *mission board*
  (events), Navigation → *timeline* (schedule), Storage → *crew deck* (your passes), Comms →
  *contact*, Reactor → *about the fest*. O2, Shields, Admin, Electrical, MedBay, Security and
  both Engines are explorable rooms along the way.
- **Registration as tasks**: swipe-your-ID minigame → assemble crew → dossier → upload-bar payment
  → NOVA walks in for the MISSION ACCEPTED celebration. A crewmate-style task list tracks progress.
- **Character creation**: pick NOVA's color at signup — it becomes your avatar site-wide.
- Sound effects (WebAudio, mutable) + reduced-motion support.
- Server-side registration logic (Postgres RPCs): fee detection, capacity, duplicate protection
- College students register **free** (auto-detected by email domain); externals pay ₹1 in test mode
- Fully data-driven: edit events in the Supabase Table Editor, the site updates instantly

---

## 🚀 Setup (10 minutes)

### 1. Run the database schema
1. Open https://supabase.com/dashboard → your project (`cneqnmnzgpijgbqssytc`)
2. Left sidebar → **SQL Editor** → **New query**
3. Open `supabase/schema.sql` from this repo, copy **all** of it, paste, click **Run**
4. You should see "Success. No rows returned"

### 2. Allow instant signups (testing)
**Authentication → Sign In / Providers → Email → turn OFF "Confirm email"** → Save.
(Turn it back ON before the real event.)

### 3. Run the app
```bash
npm install
npm run dev
```
Open http://localhost:5173 — your keys are already wired in `.env.local`.

### 4. Make yourself admin
Sign up on the site (use your college email), then in Supabase SQL Editor run:
```sql
update profiles set role = 'admin' where email = 'you@pccoepune.org';
```
Refresh the site — ADMIN appears in the navbar and `/admin` unlocks.

---

## 🔑 Credentials & security
- `.env.local` holds the Supabase URL + **anon public** key (safe for browsers; RLS protects data)
- Never put the `service_role` key in frontend code
- Fee category is computed **server-side** from the logged-in email domain (`college_domains` table)

## 🗺️ The ship map
The homepage is the ship (top-down, camera follows NOVA):

```
   ENGINE•••                    CAFETERIA ✚ emergency registration
  ( thrusters )   MedBay ─ Security     Weapons ─ O2 ─ Navigation
   ENGINE•••          └──────────┘      │         │        │
        └── Reactor ──┘           Storage ──── Admin ── Shields
                                       │                     │
                                  Electrical             Comms
```
Walk with **WASD / arrows**, tap the floor to auto-walk (BFS pathfinding through the corridors),
or press **M** / the **MAP** button and tap a room — NOVA walks over and the task prompt appears.
Layout data (rooms, corridors, floor colors, task positions) lives in `src/lib/stationMap.ts`.

## 🧭 Map of the site
| Route | What it is |
|---|---|
| `/` | The ship: walk, explore rooms, USE tasks |
| `/events` | Mission selector (all events from Supabase) |
| `/events/:slug` | Event dossier: briefing, rounds, fee, ACCEPT MISSION |
| `/register/:slug` | Registration terminal → wizard → payment → MISSION ACCEPTED + QR |
| `/dashboard` | Crew deck: missions, teams, QR pass |
| `/admin` | Command center: stats, capacity, registration log, pass check-in |
| `/schedule` `/about` `/contact` | Fest info |

## ✏️ Customize
- Fest name/year/tagline: `src/lib/constants.ts` (first 3 lines)
- Real event names/dates/fees: Supabase **Table Editor** → `events`
- More college domains: Table Editor → `college_domains` (insert a row = instant free-entry domain)
- Colors/tokens: `src/index.css` `:root` variables

## 🧪 Test both fee paths
1. Sign up with a `@pccoepune.org` email → register → **FREE**, instantly confirmed, QR pass
2. Sign up with any Gmail → register → **EXTERNAL ₹1** → mock payment terminal → confirmed
   (all payments are test-mode until Razorpay is wired in a later phase)

## ⏭️ Deferred (architecture ready)
Razorpay gateway, member OTP verification, document uploads, camera QR scanner, results,
certificates, announcements, email notifications.
