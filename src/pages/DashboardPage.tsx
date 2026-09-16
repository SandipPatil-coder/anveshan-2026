import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QrCode, Users, LogOut, Radar } from "lucide-react";
import Panel from "@/components/ui/Panel";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { ConsoleLoader } from "@/components/ui/Loading";
import QRPass from "@/components/QRPass";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/services/auth";
import { fetchMyRegistrations, type MyRegistration } from "@/services/data";
import { fmtDateRange, fmtMoney } from "@/lib/format";

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const [regs, setRegs] = useState<MyRegistration[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(true);
  const [passReg, setPassReg] = useState<MyRegistration | null>(null);

  useEffect(() => {
    if (!user) {
      setLoadingRegs(false);
      return;
    }
    fetchMyRegistrations(user.id)
      .then(setRegs)
      .catch(() => setRegs([]))
      .finally(() => setLoadingRegs(false));
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return <ConsoleLoader label="FETCHING YOUR PASSES" />;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Panel className="p-8">
          <div className="font-display text-xl font-bold tracking-[0.25em] text-ink">PASSES LOCKED</div>
          <p className="mt-2 font-mono text-[11px] tracking-[0.15em] text-inkdim">Log in to view your events.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button to="/login">LOGIN</Button>
            <Button to="/signup" variant="ghost">SIGN UP</Button>
          </div>
        </Panel>
      </div>
    );
  }

  const confirmedCount = regs.filter((r) => r.status === "confirmed").length;
  const pendingCount = regs.filter((r) => r.status === "pending").length;

  return (
    <div className="mx-auto max-w-4xl px-4 pb-20 pt-10 sm:pt-14">
      {/* Player profile header (spec §23) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="grid h-14 w-14 place-items-center rounded-full bg-plasma font-display text-xl font-extrabold text-white shadow-sm"
            aria-hidden
          >
            {(profile?.full_name ?? "F").trim().charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-[0.35em] text-inkdim">GUEST</div>
            <div className="font-display text-xl font-bold tracking-[0.2em] text-ink">{profile?.full_name ?? "FEST GOER"}</div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => signOut()}>
          <LogOut size={13} /> LOGOUT
        </Button>
      </div>

      {/* GUEST ID — real stats only: registrations from Supabase, identity from auth */}
      <Panel scanlines className="mt-6 p-5">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <div>
            <div className="font-mono text-[9px] tracking-[0.3em] text-inkdim">EVENTS</div>
            <div className="mt-0.5 font-display text-3xl font-extrabold text-plasma text-glow">{confirmedCount}</div>
            <div className="font-mono text-[9px] tracking-[0.25em] text-inkdim">CONFIRMED</div>
          </div>
          <div>
            <div className="font-mono text-[9px] tracking-[0.3em] text-inkdim">IN PROGRESS</div>
            <div className="mt-0.5 font-display text-3xl font-extrabold text-accent-warm">{pendingCount}</div>
            <div className="font-mono text-[9px] tracking-[0.25em] text-inkdim">AWAITING PAYMENT</div>
          </div>
          <div className="min-w-0">
            <div className="font-mono text-[9px] tracking-[0.3em] text-inkdim">GUEST ID</div>
            <div className="mt-0.5 truncate font-mono text-sm text-ink">{user.email}</div>
            {profile?.college && (
              <div className="mt-0.5 font-mono text-[10px] text-inkdim">{profile.college}</div>
            )}
          </div>
        </div>
      </Panel>

      <div className="mt-2 flex items-center gap-3">
        <h1 className="font-display text-2xl font-bold tracking-[0.2em] text-ink">
          REGISTERED <span className="text-plasma text-glow">EVENTS</span>
        </h1>
        <Badge tone="neutral">{regs.length} PASS{regs.length === 1 ? "" : "ES"}</Badge>
      </div>

      {loadingRegs && <ConsoleLoader label="RETRIEVING PASSES" />}

      {!loadingRegs && regs.length === 0 && (
        <Panel className="mt-8 p-10 text-center">
          <Radar className="mx-auto h-8 w-8 text-inkdim" />
          <div className="mt-3 font-display text-lg font-bold tracking-[0.2em] text-ink">NO PASSES YET</div>
          <p className="mt-1 text-[11px] font-medium text-inkdim">No registrations yet — browse the events and grab your first pass.</p>
          <Button to="/events" className="mt-5">BROWSE EVENTS</Button>
        </Panel>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {regs.map((reg) => (
          <Panel key={reg.id} scanlines className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-display text-lg font-bold tracking-[0.15em] text-ink">
                  {reg.events?.name ?? "EVENT"}
                </div>
                {reg.teams && <div className="mt-0.5 font-mono text-[10px] tracking-[0.25em] text-plasma">{reg.teams.team_name}</div>}
              </div>
              <Badge tone={reg.status === "confirmed" ? "open" : reg.status === "pending" ? "pending" : "closed"}>
                {reg.status === "confirmed" ? "✓ CONFIRMED" : reg.status === "pending" ? "AWAITING PAYMENT" : reg.status.toUpperCase()}
              </Badge>
            </div>

            <div className="mt-3 font-mono text-[11px] tracking-[0.15em] text-inkdim">
              <div>PASS: <span className="text-ink">{reg.registration_number}</span></div>
              <div className="mt-1">
                {fmtDateRange(reg.events?.event_date_start ?? null, reg.events?.event_date_end ?? null)} ·{" "}
                {reg.events?.venue ?? "TBA"} · {fmtMoney(reg.amount)}
              </div>
            </div>

            {reg.teams && (reg.teams.team_members?.length ?? 0) > 0 && (
              <div className="mt-3 border-t border-seam pt-3">
                <div className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.3em] text-inkdim">
                  <Users size={11} /> TEAM
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {reg.teams.team_members.map((m) => (
                    <span key={m.id} className="clip-tag border border-seam bg-void/60 px-2 py-0.5 font-mono text-[10px] text-inkdim">
                      {m.role === "leader" ? "★ " : ""}{m.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={() => setPassReg(reg)}>
                <QrCode size={13} /> PASS
              </Button>
              {reg.events?.slug && (
                <Button size="sm" variant="ghost" to={`/events/${reg.events.slug}`}>
                  EVENT
                </Button>
              )}
            </div>
          </Panel>
        ))}
      </div>

      {/* Pass modal */}
      <AnimatePresence>
        {passReg && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPassReg(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <QRPass reg={passReg} />
              <div className="mt-3 text-center">
                <Button variant="ghost" size="sm" onClick={() => setPassReg(null)}>CLOSE</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
