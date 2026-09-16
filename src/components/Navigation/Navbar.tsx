import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, LogOut, Volume2, VolumeX } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/services/auth";
import { FEST_NAME, FEST_YEAR, ROUTES } from "@/lib/constants";
import Button from "@/components/ui/Button";
import { soundEnabled, setSoundEnabled, sfx } from "@/lib/sfx";

const NAV = [
  { to: ROUTES.events, label: "EVENTS" },
  { to: ROUTES.schedule, label: "SCHEDULE" },
  { to: ROUTES.about, label: "ABOUT" },
  { to: ROUTES.contact, label: "CONTACT" },
];

/** Tiny torii glyph, drawn with strokes so it inherits currentColor */
function ToriiMark() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      <path d="M4 6c2.7-1 13.3-1 16 0" />
      <path d="M5.5 10h13" />
      <path d="M7.5 9v10M16.5 9v10" />
      <path d="M12 8v2" />
    </svg>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sound, setSound] = useState(soundEnabled());
  const { user, profile, isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dashLabel = user ? profile?.full_name?.split(" ")[0]?.toUpperCase() || "DASHBOARD" : "LOGIN";

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    setSoundEnabled(next);
    if (next) sfx.blip();
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all ${
        scrolled ? "border-b border-seam bg-void/85 shadow-sm backdrop-blur-lg" : "border-b border-transparent"
      }`}
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to={ROUTES.home} className="group flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-plasma text-white shadow-sm transition-transform group-hover:scale-105">
            <ToriiMark />
          </span>
          <span className="font-display text-lg font-extrabold tracking-wide text-ink">
            {FEST_NAME}
            <span className="ml-1.5 text-plasma">{FEST_YEAR}</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.22em] transition-colors ${
                  isActive ? "text-plasma" : "text-inkdim hover:text-ink"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to={ROUTES.admin}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.22em] transition-colors ${
                  isActive ? "text-accent-warm" : "text-accent-warm/70 hover:text-accent-warm"
                }`
              }
            >
              ADMIN
            </NavLink>
          )}
          <button
            onClick={toggleSound}
            aria-label={sound ? "Mute sounds" : "Enable sounds"}
            className="ml-2 rounded-full border border-seam p-2 text-inkdim transition-colors hover:text-plasma"
          >
            {sound ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
          <Button to={user ? ROUTES.dashboard : ROUTES.login} size="sm" className="ml-2">
            {dashLabel}
          </Button>
        </div>

        {/* Mobile hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleSound}
            aria-label={sound ? "Mute sounds" : "Enable sounds"}
            className="rounded-full border border-seam p-2 text-inkdim"
          >
            {sound ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
          <button
            className="grid h-10 w-10 place-items-center rounded-full border border-seam bg-white/70 text-ink"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-b border-seam bg-void/95 backdrop-blur-lg md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 pb-6 pt-2">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 font-display text-sm font-bold tracking-wide ${
                      isActive ? "bg-plasma/10 text-plasma" : "text-inkdim"
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
              {isAdmin && (
                <NavLink to={ROUTES.admin} className="rounded-xl px-4 py-3 font-display text-sm font-bold tracking-wide text-accent-warm">
                  ADMIN
                </NavLink>
              )}
              <div className="mt-3 flex gap-2">
                {user ? (
                  <>
                    <Button to={ROUTES.dashboard} size="md" className="flex-1">
                      {dashLabel}
                    </Button>
                    <Button variant="ghost" size="md" onClick={() => signOut()}>
                      <LogOut size={14} />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button to={ROUTES.login} size="md" className="flex-1">
                      LOGIN
                    </Button>
                    <Button to={ROUTES.signup} variant="warm" size="md" className="flex-1">
                      SIGN UP
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
