import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";
import { FEST_NAME, FEST_YEAR, FEST_TAGLINE, ROUTES } from "@/lib/constants";
import { fetchEvents } from "@/services/data";
import { fmtDateRange, fmtMoney, regWindowLabel } from "@/lib/format";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import { ConsoleLoader } from "@/components/ui/Loading";
import type { FestEvent } from "@/types";

/** Flat vermilion sun with a slow breathing scale */
function RisingSun({ className = "" }: { className?: string }) {
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none rounded-full ${className}`}
      style={{
        background: "radial-gradient(circle at 38% 34%, #d9524c, #c73e3a 58%, #a92f2b)",
        boxShadow: "0 30px 80px rgba(199, 62, 58, 0.22)",
      }}
      animate={{ scale: [1, 1.025, 1] }}
      transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
    />
  );
}

/** Seigaiha wave band — overlapping arcs, faint on paper */
function Seigaiha({ opacity = 1 }: { opacity?: number }) {
  const unit = 46;
  const rows = [0, 1, 2];
  const cols = Array.from({ length: 30 }, (_, i) => i);
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden"
      style={{ height: 2 * unit * 0.86, opacity }}
    >
      <svg width="100%" height="100%" preserveAspectRatio="none">
        {rows.map((r) =>
          cols.map((c) => {
            const x = c * unit + (r % 2 ? unit / 2 : 0);
            const y = r * unit * 0.86;
            const tone = (r + c) % 2 === 0 ? "rgba(199,62,58,0.15)" : "rgba(35,32,40,0.09)";
            return <circle key={`${r}-${c}`} cx={x} cy={y} r={unit / 2} fill="none" stroke={tone} strokeWidth="2" />;
          })
        )}
      </svg>
    </div>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[11px] font-medium uppercase tracking-[0.35em] text-plasma">{children}</p>;
}

/** Compact event card for the home grid */
function MiniEventCard({ ev }: { ev: FestEvent }) {
  const win = regWindowLabel(ev);
  return (
    <Link to={ROUTES.event(ev.slug ?? "")} className="group block h-full">
      <Panel className="h-full p-5 transition-shadow duration-200 group-hover:shadow-glow">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-bold leading-snug text-ink transition-colors group-hover:text-plasma">
            {ev.name}
          </h3>
          <Badge tone={win.tone === "soon" ? "pending" : win.tone}>{win.label}</Badge>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-inkdim">
          <span className="flex items-center gap-1">
            <CalendarDays size={11} /> {fmtDateRange(ev.event_date_start ?? null, ev.event_date_end ?? null)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={11} /> {ev.venue ?? "TBA"}
          </span>
          <span className="flex items-center gap-1">
            <Users size={11} /> {ev.team_based ? `TEAM ${ev.min_team_size}–${ev.max_team_size}` : "SOLO"}
          </span>
          <span className="font-semibold text-accent-warm">{fmtMoney(ev.registration_fee_internal)}</span>
        </div>
      </Panel>
    </Link>
  );
}

const STEPS = [
  { k: "選", title: "Choose", body: "Pick your events — tech, design, and fun, each with clear team sizes and fees." },
  { k: "記", title: "Register", body: "Add your team in one form. A college email unlocks free entry to internal events." },
  { k: "入", title: "Enter", body: "Pay the fee if there is one, grab your QR pass, and show it at the venue gate." },
];

export default function HomePage() {
  const [events, setEvents] = useState<FestEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = `${FEST_NAME} ${FEST_YEAR} · ${FEST_TAGLINE}`;
  }, []);

  useEffect(() => {
    let alive = true;
    fetchEvents()
      .then((e) => alive && setEvents(e))
      .catch(() => undefined)
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const open = useMemo(() => events.filter((e) => regWindowLabel(e).tone === "open"), [events]);
  const featured = open.slice(0, 3);

  return (
    <div>
      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden">
        <RisingSun className="absolute right-[-10%] top-[4%] aspect-square w-[52%] min-w-[240px] max-w-[440px] md:right-[4%] md:top-[10%]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-28 pt-16 sm:pt-24">
          <Kicker>
            {FEST_NAME} {FEST_YEAR} · 日本祭
          </Kicker>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold leading-[1.15] text-ink sm:text-6xl">
            A Japan-themed <span className="text-plasma">techfest</span> of code, design, and craft.
          </h1>
          <p className="mt-5 max-w-xl text-base font-medium leading-relaxed text-inkdim sm:text-lg">
            {FEST_TAGLINE}. Browse the events, form your team, register in minutes — and carry one QR pass to every venue.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to={ROUTES.events} size="lg">
              BROWSE EVENTS <ArrowRight size={16} />
            </Button>
            <Button to={ROUTES.signup} variant="ghost" size="lg">
              CREATE AN ACCOUNT
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-inkdim">
            <span className="clip-tag border border-seam bg-white/70 px-3 py-1.5">{events.length || "—"} EVENTS</span>
            <span className="clip-tag border border-seam bg-white/70 px-3 py-1.5">{open.length || "—"} REGISTRATIONS OPEN</span>
            <span className="clip-tag border border-seam bg-white/70 px-3 py-1.5">PCCOE PUNE</span>
          </div>
        </div>
        <Seigaiha />
      </section>

      {/* ======================= FEATURED EVENTS ======================= */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Kicker>注目イベント</Kicker>
            <h2 className="mt-1 font-display text-3xl font-extrabold text-ink">Featured Events</h2>
          </div>
          <Button to={ROUTES.events} variant="ghost" size="sm">
            ALL EVENTS <ArrowRight size={14} />
          </Button>
        </div>

        {loading ? (
          <ConsoleLoader label="LOADING EVENTS" />
        ) : featured.length === 0 ? (
          <Panel className="mt-8 p-10 text-center">
            <p className="font-display text-lg font-bold text-ink">Registrations open soon</p>
            <p className="mt-1 text-sm font-medium text-inkdim">Check the full event list for dates and details.</p>
            <Button to={ROUTES.events} className="mt-5">
              SEE ALL EVENTS
            </Button>
          </Panel>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((ev) => (
              <MiniEventCard key={ev.id} ev={ev} />
            ))}
          </div>
        )}
      </section>

      {/* ======================== HOW IT WORKS ======================== */}
      <section className="border-y border-seam bg-white/50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="text-center">
            <Kicker>参加方法 — HOW IT WORKS</Kicker>
            <h2 className="mt-1 font-display text-3xl font-extrabold text-ink">Three steps to your pass</h2>
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.k} className="text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-plasma/70 bg-white font-display text-xl font-extrabold text-plasma shadow-sm">
                  {s.k}
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-ink">{s.title}</h3>
                <p className="mx-auto mt-1.5 max-w-xs text-sm font-medium leading-relaxed text-inkdim">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ CTA ============================ */}
      <section className="relative overflow-hidden">
        <RisingSun className="absolute left-1/2 top-8 h-16 w-16 -translate-x-1/2" />
        <div className="mx-auto max-w-3xl px-4 pb-24 pt-40 text-center">
          <h2 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">Ready to join the fest?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm font-medium text-inkdim">
            Create a free account and register for your first event in under a minute.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button to={ROUTES.signup} size="lg">
              SIGN UP FREE
            </Button>
            <Button to={ROUTES.events} variant="ghost" size="lg">
              EXPLORE EVENTS
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
