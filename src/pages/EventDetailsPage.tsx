import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Panel from "@/components/ui/Panel";
import Tabs from "@/components/ui/Tabs";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { ConsoleLoader } from "@/components/ui/Loading";
import { fetchEventBySlug, fetchRounds } from "@/services/data";
import { fmtDate, fmtDateRange, fmtMoney, regWindowLabel } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { ROUTES } from "@/lib/constants";
import type { FestEvent, EventRound } from "@/types";

export default function EventDetailsPage() {
  const { slug = "" } = useParams();
  const [event, setEvent] = useState<FestEvent | null>(null);
  const [rounds, setRounds] = useState<EventRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [myReg, setMyReg] = useState<{ registration_number: string; status: string } | null>(null);
  const [tab, setTab] = useState("briefing");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchEventBySlug(slug)
      .then(async (ev) => {
        if (!alive) return;
        setEvent(ev);
        if (ev) setRounds(await fetchRounds(ev.id));
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [slug]);

  const { user } = useAuth();
  useEffect(() => {
    if (!user || !event) return;
    // Detect an existing registration for this event (duplicate protection UX)
    supabase
      .from("registrations")
      .select("registration_number, status")
      .eq("user_id", user.id)
      .eq("event_id", event.id)
      .in("status", ["draft", "pending", "confirmed"])
      .maybeSingle()
      .then(({ data }) => setMyReg((data as { registration_number: string; status: string } | null) ?? null));
  }, [user?.id, event?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-16">
        <ConsoleLoader label="RETRIEVING DOSSIER" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="font-display text-3xl font-bold tracking-[0.2em] text-alert">SIGNAL LOST</div>
        <p className="mt-2 font-mono text-xs text-inkdim">The requested mission could not be found.</p>
        <Button to={ROUTES.events} className="mt-6">BACK TO EVENTS</Button>
      </div>
    );
  }

  const win = regWindowLabel(event);
  const teamLabel = event.team_based ? `${event.min_team_size}–${event.max_team_size} TEAM` : "SOLO ENTRY";

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:pt-12">
      <Link
        to={ROUTES.events}
        className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.25em] text-inkdim transition-colors hover:text-plasma"
      >
        <ArrowLeft size={14} /> BACK TO EVENTS
      </Link>

      {/* Dossier header */}
      <Panel scanlines className="mt-5 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] tracking-[0.35em] text-inkdim">{event.category ?? "EVENT"}</div>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-[0.15em] text-ink sm:text-4xl">
              {event.name}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-inkdim">{event.short_description}</p>
          </div>
          <Badge tone={win.tone === "open" ? "open" : win.tone === "soon" ? "pending" : "closed"}>{win.label}</Badge>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 font-mono text-[11px] tracking-[0.12em] text-inkdim sm:grid-cols-4">
          <Panel className="p-3">
            <div className="text-[9px] tracking-[0.3em] text-plasma">DATE</div>
            <div className="mt-1 text-ink">{fmtDateRange(event.event_date_start, event.event_date_end)}</div>
          </Panel>
          <Panel className="p-3">
            <div className="text-[9px] tracking-[0.3em] text-plasma">TEAM</div>
            <div className="mt-1 text-ink">{teamLabel}</div>
          </Panel>
          <Panel className="p-3">
            <div className="text-[9px] tracking-[0.3em] text-plasma">PRIZE</div>
            <div className="mt-1 text-accent-warm">{fmtMoney(event.prize_pool)}</div>
          </Panel>
          <Panel className="p-3">
            <div className="text-[9px] tracking-[0.3em] text-plasma">VENUE</div>
            <div className="mt-1 text-ink">{event.venue ?? "TBA"}</div>
          </Panel>
        </div>
      </Panel>

      {/* Dossier tabs — briefing + phases in one console panel */}
      <Panel className="mt-5">
        <Tabs
          tabs={[
            { id: "briefing", label: "Briefing" },
            ...(rounds.length > 0 ? [{ id: "phases", label: "Phases" }] : []),
          ]}
          active={tab}
          onChange={setTab}
        />
        {tab === "briefing" && (
          <p className="whitespace-pre-line p-6 text-sm leading-relaxed text-inkdim">{event.description}</p>
        )}
        {tab === "phases" && (
          <div className="divide-y divide-seam">
            {rounds.map((r) => (
              <div key={r.id} className="flex gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-plasma/40 font-mono text-sm text-plasma clip-tag">
                  {r.round_number}
                </div>
                <div>
                  <div className="font-display text-sm font-bold tracking-[0.2em] text-ink">{r.name}</div>
                  {r.description && <p className="mt-1 text-sm text-inkdim">{r.description}</p>}
                  <div className="mt-2 flex flex-wrap gap-4 font-mono text-[10px] tracking-[0.15em] text-inkdim">
                    {r.location && <span>LOC: {r.location}</span>}
                    {r.date && <span>{fmtDate(r.date)}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* CTA */}
      <div className="mt-8 text-center">
        {myReg ? (
          <Panel className="inline-block p-5">
            <div className="font-mono text-[10px] tracking-[0.3em] text-signet">✓ ALREADY REGISTERED</div>
            <div className="mt-2 font-mono text-sm tracking-[0.2em] text-ink">{myReg.registration_number}</div>
            <Button to={ROUTES.dashboard} variant="ghost" size="sm" className="mt-3">
              VIEW PASS ON MY PASSES
            </Button>
          </Panel>
        ) : win.tone === "open" ? (
          <Button to={ROUTES.register(event.slug)} size="lg" className="w-full sm:w-auto">
            REGISTER →
          </Button>
        ) : (
          <Panel className="inline-block p-5">
            <div className="font-mono text-[10px] tracking-[0.3em] text-alert">
              {win.tone === "soon" ? "REGISTRATION OPENS SOON" : "REGISTRATION CLOSED"}
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
