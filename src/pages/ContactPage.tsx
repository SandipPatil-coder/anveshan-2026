import { Mail, Phone, MapPin, Instagram, Linkedin } from "lucide-react";
import Panel, { PanelHeader } from "@/components/ui/Panel";

const CHANNELS = [
  { icon: Mail, label: "EMAIL", value: "techfest@pccoepune.org", href: "mailto:techfest@pccoepune.org" },
  { icon: Phone, label: "PHONE", value: "+91 XXXXX XXXXX", href: "tel:+91XXXXXXXXXX" },
  { icon: MapPin, label: "BASE", value: "PCCOE Pune, Campus Main Gate", href: undefined },
  { icon: Instagram, label: "INSTAGRAM", value: "@anveshan.fest", href: "https://instagram.com" },
  { icon: Linkedin, label: "LINKEDIN", value: "ANVESHAN Fest", href: "https://linkedin.com" },
];

const FAQ = [
  { q: "WHO CAN REGISTER?", a: "Any student. College students (verified by email domain) register free; external students pay a small fee per event." },
  { q: "HOW DO I JOIN A TEAM?", a: "Open the event, press ACCEPT MISSION, and add crew members in the registration wizard. You are the crew leader by default." },
  { q: "WHERE IS MY PASS?", a: "After confirmation, your QR pass lives in the CREW DECK (dashboard). Show it at the gate for check-in." },
  { q: "CAN I REGISTER FOR MULTIPLE EVENTS?", a: "Yes — one active registration per event, as many events as you can survive." },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:pt-14">
      <header className="text-center">
        <div className="font-mono text-[10px] tracking-[0.45em] text-inkdim">COMMS TERMINAL</div>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-[0.15em] text-ink">
          CONTACT <span className="text-plasma text-glow">MISSION CONTROL</span>
        </h1>
      </header>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {CHANNELS.map((c) => {
          const Icon = c.icon;
          const body = (
            <>
              <Icon className="h-5 w-5 text-plasma" />
              <div>
                <div className="font-mono text-[9px] tracking-[0.3em] text-inkdim">{c.label}</div>
                <div className="mt-0.5 text-sm text-ink">{c.value}</div>
              </div>
            </>
          );
          return c.href ? (
            <a key={c.label} href={c.href} target="_blank" rel="noreferrer" className="block">
              <Panel className="flex items-center gap-4 p-4 transition-all hover:border-plasma/50 hover:shadow-glow">{body}</Panel>
            </a>
          ) : (
            <Panel key={c.label} className="flex items-center gap-4 p-4">{body}</Panel>
          );
        })}
      </div>

      <Panel className="mt-8">
        <PanelHeader>FREQUENT SIGNALS // FAQ</PanelHeader>
        <div className="divide-y divide-seam">
          {FAQ.map((f) => (
            <details key={f.q} className="group p-4">
              <summary className="cursor-pointer list-none font-display text-sm font-bold tracking-[0.15em] text-ink transition-colors group-open:text-plasma">
                ▸ {f.q}
              </summary>
              <p className="mt-2 pl-4 text-sm text-inkdim">{f.a}</p>
            </details>
          ))}
        </div>
      </Panel>
    </div>
  );
}
