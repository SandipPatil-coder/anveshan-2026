import Panel, { PanelHeader } from "@/components/ui/Panel";
import Button from "@/components/ui/Button";
import { FEST_NAME, FEST_YEAR, FEST_TAGLINE, ROUTES } from "@/lib/constants";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:pt-14">
      <header className="text-center">
        <div className="font-mono text-[10px] tracking-[0.45em] text-inkdim">DOSSIER // ORIGIN</div>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-[0.15em] text-ink">
          WHAT IS <span className="text-plasma text-glow">{FEST_NAME}</span>
        </h1>
      </header>

      <Panel className="mt-8 p-6 sm:p-8">
        <PanelHeader>TRANSMISSION</PanelHeader>
        <div className="space-y-4 pt-5 text-sm leading-relaxed text-inkdim">
          <p>
            {FEST_NAME} {FEST_YEAR} is the annual technical festival of our campus — a two-day grid of
            coding arenas, machine-learning battles, esports brackets and cultural showdowns.
          </p>
          <p>
            This isn't a normal fest website. You just plugged into the <span className="text-plasma">Event Command
            Center</span>: every event is a mission, every registration is a pact, and your pass is a
            QR code that gets you through the gate.
          </p>
          <p>
            {FEST_TAGLINE}. Pick a mission, assemble your crew, and accept the call.
          </p>
        </div>
      </Panel>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { k: "MISSIONS", v: "05", d: "Event categories across tech, esports and culture" },
          { k: "PRIZE POOL", v: "₹34K", d: "Total pool across all events" },
          { k: "DAYS", v: "02", d: "One weekend, full grid" },
        ].map((s) => (
          <Panel key={s.k} className="p-5 text-center">
            <div className="font-display text-3xl font-bold text-plasma text-glow">{s.v}</div>
            <div className="mt-1 font-mono text-[10px] tracking-[0.3em] text-ink">{s.k}</div>
            <p className="mt-2 font-mono text-[10px] leading-relaxed text-inkdim">{s.d}</p>
          </Panel>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Button to={ROUTES.events} size="lg">VIEW MISSIONS →</Button>
      </div>
    </div>
  );
}
