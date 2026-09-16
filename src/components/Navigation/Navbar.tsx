import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, LogOut, Volume2, VolumeX } from "lucide-react";
import Mochi from "@/components/Mochi";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/services/auth";
import { FEST_NAME, FEST_YEAR, ROUTES } from "@/lib/constants";
import Button from "@/components/ui/Button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { soundEnabled, setSoundEnabled, sfx } from "@/lib/sfx";

const NAV = [
  { to: ROUTES.events, label: "EVENTS" },
  { to: ROUTES.schedule, label: "SCHEDULE" },
  { to: ROUTES.about, label: "ABOUT" },
  { to: ROUTES.contact, label: "CONTACT" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sound, setSound] = useState(soundEnabled());
  const { user, profile, isAdmin } = useAuth();
  const location = useLocation();
  const reduced = useReducedMotion();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const charColor = localStorage.getItem("nexorium-color") ?? "#4cc9f0";
  const dashLabel = user ? profile?.full_name?.split(" ")[0]?.toUpperCase() || "GUEST" : "LOGIN";

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    setSoundEnabled(next);
    if (next) sfx.blip();
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all ${
        scrolled ? "border-b-4 border-[#2b3a63] bg-void/90 backdrop-blur-xl" : "border-b-4 border-transparent"
      }`}
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to={ROUTES.home} className="group flex items-center gap-2.5">
          <span className="transition-transform group-hover:-translate-y-0.5">
            <Mochi color={charColor} size={34} />
          </span>
          <span className="font-display text-lg font-extrabold tracking-wider text-ink">
            {FEST_NAME}
            <span className="ml-1 text-plasma">{FEST_YEAR}</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 font-display text-xs font-extrabold tracking-widest transition-colors ${
                  isActive ? "bg-plasma/15 text-plasma" : "text-inkdim hover:text-ink"
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
                `rounded-full px-4 py-2 font-display text-xs font-extrabold tracking-widest transition-colors ${
                  isActive ? "bg-accent-warm/15 text-accent-warm" : "text-accent-warm/80 hover:text-accent-warm"
                }`
              }
            >
              ADMIN
            </NavLink>
          )}
          <button
            onClick={toggleSound}
            aria-label={sound ? "Mute sounds" : "Enable sounds"}
            className="ml-2 rounded-full border-2 border-[#aebbdd]/70 p-2 text-inkdim hover:text-plasma"
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
            className="rounded-full border-2 border-[#aebbdd]/70 p-2 text-inkdim"
          >
            {sound ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-hullraised text-plasma btn-3d-sm"
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
            initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-b-4 border-[#2b3a63] bg-void/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 pb-6 pt-2">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) =>
                    `rounded-2xl px-4 py-3 font-display text-sm font-extrabold tracking-widest ${
                      isActive ? "bg-plasma/15 text-plasma" : "text-inkdim"
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
              {isAdmin && (
                <NavLink to={ROUTES.admin} className="rounded-2xl px-4 py-3 font-display text-sm font-extrabold tracking-widest text-accent-warm">
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
