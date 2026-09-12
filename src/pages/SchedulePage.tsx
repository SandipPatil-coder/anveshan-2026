import { motion } from "framer-motion";
import Panel from "@/components/ui/Panel";
import { FEST_NAME, FEST_YEAR } from "@/lib/constants";

const DAYS = [
  {
    day: "DAY 01",
    date: "TBA",
    items: [
      { time: "09:00", title: "CHECK-IN OPENS", desc: "Scan your pass at the main gate" },
      { time: "10:00", title: "OPENING CEREMONY", desc: "Main auditorium" },
      { time: "11:00", title: "ML MANIA — QUALIFIER", desc: "Online round" },
      { time: "14:00", title: "LOGIC LAMP", desc: "Computer Lab 4" },
      { time: "18:00", title: "SPIKE SHOWDOWN — DAY 1", desc: "LAN hall" },
    ],
  },
  {
    day: "DAY 02",
    date: "TBA",
    items: [
      { time: "09:30", title: "SAMBHASHINI", desc: "Seminar Hall A" },
      { time: "11:00", title: "ML MANIA — FINALS", desc: "Innovation Lab" },
      { time: "14:00", title: "CHAKAVA", desc: "Open air stage" },
      { time: "17:00", title: "SPIKE SHOWDOWN — GRAND FINAL", desc: "LAN hall" },
      { time: "19:00", title: "AWARDS + CLOSING", desc: "Prize distribution" },
    ],
  },
];

export default function SchedulePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:pt-14">
      <header className="text-center">
        <div className="font-mono text-[10px] tracking-[0.45em] text-inkdim">FEST TIMELINE</div>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-[0.15em] text-ink">
          {FEST_NAME} <span className="text-plasma text-glow">{FEST_YEAR}</span>
        </h1>
        <p className="mt-2 font-mono text-[11px] tracking-[0.2em] text-inkdim">OFFICIAL SCHEDULE — TIMES MAY SHIFT, GLORY WON'T</p>
      </header>

      <div className="mt-10 space-y-10">
        {DAYS.map((d) => (
          <div key={d.day}>
            <div className="flex items-center gap-3">
              <span className="clip-tag border border-plasma/50 bg-plasma/10 px-3 py-1.5 font-mono text-xs tracking-[0.3em] text-plasma">
                {d.day}
              </span>
              <span className="font-mono text-[10px] tracking-[0.25em] text-inkdim">{d.date}</span>
              <span className="h-px flex-1 bg-seam" />
            </div>
            <div className="relative mt-4 space-y-3 pl-6">
              <span className="absolute bottom-2 left-[7px] top-2 w-px bg-seam" aria-hidden />
              {d.items.map((it, i) => (
                <motion.div
                  key={it.title}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.35, delay: 0.04 * i }}
                  className="relative"
                >
                  <span className="absolute -left-6 top-4 h-[9px] w-[9px] rounded-full border border-plasma/60 bg-void" aria-hidden />
                  <Panel className="flex items-center gap-4 p-4 transition-colors hover:border-plasma/40">
                    <span className="font-mono text-sm text-plasma">{it.time}</span>
                    <span className="h-8 w-px bg-seam" />
                    <div>
                      <div className="font-display text-sm font-bold tracking-[0.15em] text-ink">{it.title}</div>
                      <div className="font-mono text-[10px] tracking-[0.15em] text-inkdim">{it.desc}</div>
                    </div>
                  </Panel>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-10 text-center font-mono text-[10px] tracking-[0.25em] text-inkdim">
        FULL TIMETABLE LOCKS ONE WEEK BEFORE THE FEST
      </p>
    </div>
  );
}
