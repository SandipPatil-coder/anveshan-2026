import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Users, Trophy, SearchX, CalendarDays } from "lucide-react";
import Panel from "@/components/ui/Panel";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { ConsoleLoader, ErrorState } from "@/components/ui/Loading";
import { fetchEvents } from "@/services/data";
import { ROUTES } from "@/lib/constants";
import { fmtDateRange, fmtMoney, regWindowLabel } from "@/lib/format";
import { sfx } from "@/lib/sfx";
import type { FestEvent } from "@/types";

type TaskFilter = "all" | "open" | "soon" | "closed";

const FILTERS: { id: TaskFilter; label: string }[] = [
  { id: "all", label: "ALL TASKS" },
  { id: "open", label: "OPEN" },
  { id: "soon", label: "UPCOMING" },
  { id: "closed", label: "CLOSED" },
];

export default function EventsPage() {
  const [events, setEvents] = useState<FestEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchEvents()
      .then(setEvents)
      .catch(() => setError("Could not reach mission database. Check the schema is installed."))
      .finally(() => setLoading(false));
  }, [retry]);

  const filtered = events.filter((ev) => {
    if (filter === "all") return true;
    return regWindowLabel(ev).tone === filter;
  });

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:pt-14">
      <header className="text-center">
        <div className="font-mono text-[10px] tracking-[0.45em] text-inkdim">MISSION SELECTOR</div>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-[0.15em] text-ink sm:text-5xl">
          TASK <span className="text-plasma text-glow">BOARD</span>
        </h1>
        <p className="mt-3 font-mono text-[11px] tracking-[0.2em] text-inkdim">
          PICK A TASK — INSPECT IT — ACCEPT IT
        </p>
      </header>

      {loading && <ConsoleLoader label="SCANNING TASK BOARD" />}

      {error && (
        <div className="mt-8">
          <ErrorState message={error}>
            <Button variant="ghost" size="sm" className="mt-4" onClick={() => setRetry((n) => n + 1)}>
              ↻ RETRY UPLINK
            </Button>
          </ErrorState>
        </div>
      )}

      {/* Status filters — driven by each event's real registration window */}
      {!loading && !error && events.length > 0 && (
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {FILTERS.map((f) => {
            const n =
              f.id === "all"
                ? events.length
                : events.filter((ev) => regWindowLabel(ev).tone === f.id).length;
            return (
              <button
                key={f.id}
                onClick={() => {
                  setFilter(f.id);
                  sfx.blip();
                }}
                className={`rounded-full border-2 px-4 py-1.5 font-display text-[10px] font-extrabold tracking-[0.2em] transition-colors ${
                  filter === f.id
                    ? "border-plasma bg-plasma/15 text-plasma"
                    : "border-seam text-inkdim hover:border-plasma/40 hover:text-ink"
                }`}
              >
                {f.label} · {n}
              </button>
            );
          })}
        </div>
      )}

      {/* Vertical mission map (mobile-first per spec §51) */}
      {!loading && !error && (
        <div className="relative mt-10">
          <div className="absolute bottom-0 left-[19px] top-2 w-px bg-gradient-to-b from-plasma/50 via-seam to-transparent sm:left-[23px]" aria-hidden />
          <div className="space-y-6">
            {filtered.map((ev, i) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: 0.05 * i }}
                className="relative pl-12 sm:pl-16"
              >
                {/* Node on the mission line */}
                <span
                  className={`absolute left-[11px] top-6 flex h-[17px] w-[17px] items-center justify-center rounded-full border sm:left-[15px] ${
                    regWindowLabel(ev).tone === "open" ? "border-plasma bg-plasma/20 shadow-glow" : "border-seam bg-hull"
                  }`}
                  aria-hidden
                >
                  <i className={`h-1.5 w-1.5 rounded-full ${regWindowLabel(ev).tone === "open" ? "bg-plasma" : "bg-inkdim"}`} />
                </span>
                <EventCard event={ev} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="clip-panel mt-10 border border-seam bg-hull p-10 text-center">
          <SearchX className="mx-auto h-8 w-8 text-inkdim" />
          <div className="mt-3 font-display text-lg font-bold tracking-[0.2em] text-ink">NO TASKS ON THE BOARD</div>
          <p className="mt-1 font-mono text-[11px] text-inkdim">The ship is quiet… check again later.</p>
          <Button to="/" variant="ghost" className="mt-5">RETURN TO SHIP</Button>
        </div>
      )}

      {!loading && !error && events.length > 0 && filtered.length === 0 && (
        <div className="clip-panel mt-10 border border-seam bg-hull p-10 text-center">
          <SearchX className="mx-auto h-8 w-8 text-inkdim" />
          <div className="mt-3 font-display text-lg font-bold tracking-[0.2em] text-ink">NOTHING IN THIS CHANNEL</div>
          <p className="mt-1 font-mono text-[11px] text-inkdim">No tasks match this filter right now.</p>
          <Button variant="ghost" size="sm" className="mt-5" onClick={() => setFilter("all")}>SHOW ALL TASKS</Button>
        </div>
      )}
    </div>
  );
}

function EventCard({ event: ev }: { event: FestEvent }) {
  const win = regWindowLabel(ev);
  const teamLabel = ev.team_based ? `CREW OF ${ev.min_team_size}–${ev.max_team_size}` : "SOLO MISSION";
  const statusLabel =
    win.tone === "open" ? "TASK AVAILABLE" : win.tone === "soon" ? "UPCOMING" : "COMPLETED";
  return (
    <Panel className="group p-5 transition-all duration-200 hover:border-plasma/50 hover:shadow-glow">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-mono text-[9px] tracking-[0.3em] text-plasma">
            {statusLabel}
            {ev.category ? ` · ${ev.category.toUpperCase()}` : ""}
          </div>
          <h2 className="mt-1 font-display text-xl font-bold tracking-[0.15em] text-ink">{ev.name}</h2>
        </div>
        <Badge tone={win.tone === "open" ? "open" : win.tone === "soon" ? "pending" : "closed"}>{win.label}</Badge>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-inkdim">{ev.short_description}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-[10px] tracking-[0.15em] text-inkdim sm:grid-cols-4">
        <span className="flex items-center gap-1.5"><CalendarDays size={12} className="text-plasma" /> {fmtDateRange(ev.event_date_start, ev.event_date_end)}</span>
        <span className="flex items-center gap-1.5"><Users size={12} className="text-plasma" /> {teamLabel}</span>
        <span className="flex items-center gap-1.5"><Trophy size={12} className="text-accent-warm" /> {fmtMoney(ev.prize_pool)}</span>
        <span className="flex items-center gap-1.5"><MapPin size={12} className="text-plasma" /> {ev.venue ?? "TBA"}</span>
      </div>
      <div className="mt-4 flex justify-end">
        <Button to={ROUTES.event(ev.slug)} size="sm" disabled={win.tone !== "open"}>
          {win.tone === "open" ? "VIEW TASK →" : "VIEW TASK"}
        </Button>
      </div>
    </Panel>
  );
}
