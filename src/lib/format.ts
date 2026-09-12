// Formatting helpers

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "TBA";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "TBA";
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function fmtDateRange(start: string | null | undefined, end: string | null | undefined): string {
  if (!start) return "TBA";
  const s = new Date(start);
  if (Number.isNaN(s.getTime())) return "TBA";
  const sTxt = `${s.getDate()} ${MONTHS[s.getMonth()]}`;
  if (!end) return sTxt;
  const e = new Date(end);
  if (Number.isNaN(e.getTime())) return sTxt;
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  const eTxt = sameMonth ? `${e.getDate()}` : `${e.getDate()} ${MONTHS[e.getMonth()]}`;
  return `${sTxt} – ${eTxt}`;
}

export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fmtMoney(amount: number | null | undefined): string {
  const n = Number(amount ?? 0);
  if (n <= 0) return "FREE";
  return `₹${n.toLocaleString("en-IN")}`;
}

export function timeUntil(iso: string | null | undefined): "upcoming" | "open" | "closed" {
  if (!iso) return "open";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "open";
  return Date.now() < t ? "upcoming" : "closed";
}

/** Registration lifecycle label for badges (spec §8/62) */
export function regWindowLabel(ev: {
  registration_open: boolean;
  registration_start: string;
  registration_end: string;
}): { label: string; tone: "open" | "soon" | "closed" } {
  const now = Date.now();
  const start = new Date(ev.registration_start).getTime();
  const end = new Date(ev.registration_end).getTime();
  if (!ev.registration_open || now > end) return { label: "REGISTRATION CLOSED", tone: "closed" };
  if (now < start) return { label: "OPENS SOON", tone: "soon" };
  return { label: "REGISTRATION OPEN", tone: "open" };
}
