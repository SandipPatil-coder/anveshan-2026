import { Link } from "react-router-dom";
import { FEST_NAME, FEST_YEAR, ROUTES } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-seam bg-white/50 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 font-mono text-[10px] uppercase tracking-[0.25em] text-inkdim sm:flex-row">
        <div>
          © {FEST_NAME} {FEST_YEAR} · 日本祭 — Japan-themed techfest
        </div>
        <div className="flex gap-4">
          <Link to={ROUTES.events} className="hover:text-plasma">EVENTS</Link>
          <Link to={ROUTES.schedule} className="hover:text-plasma">SCHEDULE</Link>
          <Link to={ROUTES.contact} className="hover:text-plasma">CONTACT</Link>
        </div>
      </div>
    </footer>
  );
}
