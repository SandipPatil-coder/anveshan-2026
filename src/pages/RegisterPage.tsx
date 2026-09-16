import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Lock, Zap } from "lucide-react";
import Panel, { PanelHeader } from "@/components/ui/Panel";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import Badge from "@/components/ui/Badge";
import Mochi from "@/components/Mochi";
import { useAuth } from "@/context/AuthContext";
import { fetchEventBySlug } from "@/services/data";
import { registerForEvent, captureMockPayment } from "@/services/rpc";
import { fmtMoney, regWindowLabel } from "@/lib/format";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { sfx } from "@/lib/sfx";
import { supabase } from "@/lib/supabaseClient";
import type { FestEvent, RegisterResult } from "@/types";

type Step = "terminal" | "swipe" | "team" | "review" | "payment" | "done";

interface MemberDraft {
  name: string;
  email: string;
  phone: string;
  college: string;
}

const EMPTY_MEMBER: MemberDraft = { name: "", email: "", phone: "", college: "" };

const TASK_LIST: { key: Step | "payment"; label: string }[] = [
  { key: "swipe", label: "Swipe entry pass" },
  { key: "team", label: "Assemble your team" },
  { key: "review", label: "Confirm details" },
  { key: "payment", label: "Pay fee" },
];

export default function RegisterPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const reduced = useReducedMotion();

  const [event, setEvent] = useState<FestEvent | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [step, setStep] = useState<Step>("terminal");
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [teamName, setTeamName] = useState("");
  const [teamSize, setTeamSize] = useState(1);
  const [members, setMembers] = useState<MemberDraft[]>([{ ...EMPTY_MEMBER }]);

  const [result, setResult] = useState<RegisterResult | null>(null);
  const [orderId, setOrderId] = useState<string>("");
  const [paying, setPaying] = useState(false);
  const [existing, setExisting] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoadingEvent(true);
    fetchEventBySlug(slug)
      .then((ev) => alive && setEvent(ev))
      .finally(() => alive && setLoadingEvent(false));
    return () => {
      alive = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!user || !event) return;
    supabase
      .from("registrations")
      .select("registration_number")
      .eq("user_id", user.id)
      .eq("event_id", event.id)
      .in("status", ["draft", "pending", "confirmed"])
      .maybeSingle()
      .then(({ data }) => setExisting((data as { registration_number: string } | null)?.registration_number ?? null));
  }, [user?.id, event?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (profile) {
      setMembers((prev) => {
        const next = [...prev];
        next[0] = {
          name: profile.full_name ?? "",
          email: profile.email ?? user?.email ?? "",
          phone: "",
          college: profile.college ?? "",
        };
        return next;
      });
    }
  }, [profile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const win = event ? regWindowLabel(event) : null;
  const isSolo = !event?.team_based;

  const leaderDomain = useMemo(() => user?.email?.split("@")[1]?.toLowerCase() ?? "", [user?.email]);
  const isCollege = leaderDomain === "pccoepune.org" || leaderDomain.endsWith(".pccoepune.org");
  const fee = event ? Number(isCollege ? event.registration_fee_internal : event.registration_fee_external) : 0;

  const activate = useCallback(() => {
    if (!event || !win || win.tone !== "open") return;
    setActivating(true);
    setError(null);
    sfx.confirm();
    window.setTimeout(() => {
      setActivating(false);
      setStep("swipe");
    }, reduced ? 150 : 800);
  }, [event, win, reduced]);

  useEffect(() => {
    if ((step === "swipe" || step === "team") && !user && !authLoading) {
      navigate(`/login?next=${encodeURIComponent(`/register/${slug}`)}`);
    }
  }, [step, user, authLoading, navigate, slug]);

  const validTeam = useMemo(() => {
    if (!event) return false;
    const sizeOk = isSolo ? teamSize === 1 : teamSize >= event.min_team_size && teamSize <= event.max_team_size;
    if (!teamName.trim() && !isSolo) return false;
    const filled = members.slice(0, teamSize).every((m) => m.name.trim().length > 1);
    return sizeOk && filled;
  }, [event, isSolo, teamSize, members, teamName]);

  const submitRegistration = useCallback(async () => {
    if (!event) return;
    setError(null);
    const names: string[] = [];
    const emails: string[] = [];
    const phones: string[] = [];
    const colleges: string[] = [];
    for (let i = 0; i < teamSize; i++) {
      const m = members[i] ?? EMPTY_MEMBER;
      names.push(m.name.trim());
      emails.push(m.email.trim());
      phones.push(m.phone.trim());
      colleges.push(m.college.trim());
    }
    const res = await registerForEvent({
      eventId: event.id,
      teamName: isSolo ? `${profile?.full_name ?? "Solo"} (Solo)` : teamName.trim(),
      teamSize,
      memberNames: names,
      memberEmails: emails,
      memberPhones: phones,
      memberColleges: colleges,
    });
    if (!res.ok) {
      setError(res.message ?? "Something went wrong. Please try again.");
      return;
    }
    setResult(res);
    setOrderId(`ORD-${Date.now().toString(36).toUpperCase()}`);
    setStep((res.fee ?? 0) > 0 ? "payment" : "done");
    sfx.confirm();
  }, [event, isSolo, members, profile?.full_name, teamName, teamSize]);

  const payNow = useCallback(async () => {
    if (!result?.registrationId || !orderId) return;
    setPaying(true);
    setError(null);
    // Upload-style progress bar, then server-side mock capture
    await new Promise((r) => setTimeout(r, 1900));
    const res = await captureMockPayment(result.registrationId, orderId);
    setPaying(false);
    if (!res.ok) {
      setError(res.message ?? "Payment could not be verified.");
      return;
    }
    setResult({ ...result, status: "confirmed", paymentStatus: "paid" });
    setStep("done");
    sfx.success();
  }, [result, orderId]);

  if (loadingEvent) {
    return (
      <div className="mx-auto flex max-w-2xl items-center justify-center gap-3 px-4 py-20 font-display text-sm font-bold text-inkdim">
        <Mochi size={40} walking /> OPENING THE GATES…
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="font-display text-3xl font-extrabold text-alert">STALL NOT FOUND</div>
        <Button to="/events" variant="ghost" className="mt-5">BACK TO EVENTS</Button>
      </div>
    );
  }

  const taskDone = (k: Step | "payment"): boolean => {
    const order: Step[] = ["terminal", "swipe", "team", "review", "payment", "done"];
    const at = order.indexOf(step);
    const target = order.indexOf(k as Step);
    return at > target || (k === "payment" && step === "done" && fee === 0) || step === "done";
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-8 sm:pt-12">
      <Link to={`/events/${event.slug}`} className="inline-flex items-center gap-2 font-display text-xs font-extrabold tracking-widest text-inkdim hover:text-plasma">
        <ArrowLeft size={14} /> BACK TO EVENT
      </Link>

      <div className="mt-4 text-center">
        <div className="font-display text-[11px] font-extrabold uppercase tracking-[0.4em] text-inkdim">REGISTRATION TENT</div>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-ink sm:text-4xl">{event.name}</h1>
      </div>

      {/* TASKS HUD — the guest task list */}
      <Panel className="mx-auto mt-5 max-w-md p-4">
        <div className="font-display text-xs font-extrabold uppercase tracking-[0.3em] text-accent-warm">✦ Festival Tasks</div>
        <ul className="mt-2 space-y-1">
          {TASK_LIST.filter((t) => !(t.key === "payment" && fee === 0)).map((t) => {
            const done = taskDone(t.key);
            const active =
              (t.key === "swipe" && step === "swipe") ||
              (t.key === "team" && step === "team") ||
              (t.key === "review" && step === "review") ||
              (t.key === "payment" && step === "payment");
            return (
              <li key={t.key} className={`flex items-center gap-2 font-display text-sm font-bold ${done ? "text-signet line-through" : active ? "text-ink" : "text-inkdim"}`}>
                <span className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${done ? "border-signet bg-signet/20" : "border-[#aebbdd]/70"}`}>
                  {done && <Check size={10} />}
                </span>
                {t.label}
                {active && <span className="animate-wiggle text-plasma">◄</span>}
              </li>
            );
          })}
        </ul>
      </Panel>

      {existing && step === "terminal" && (
        <Panel className="mt-6 p-5 text-center">
          <div className="font-display text-sm font-extrabold text-signet">✓ ALREADY REGISTERED</div>
          <div className="mt-2 font-mono text-sm text-ink">{existing}</div>
          <Button to="/dashboard" variant="ghost" size="sm" className="mt-3">VIEW YOUR PASSES</Button>
        </Panel>
      )}

      <div className="mt-6">
        {step === "terminal" && (
          <Panel className="relative overflow-hidden p-8 text-center">
            <div className="text-5xl">{event.team_based ? "👥" : "🍡"}</div>
            <div className="mt-4 font-display text-lg font-extrabold text-ink">
              {existing ? "ALREADY REGISTERED" : win!.tone === "open" ? "READY TO REGISTER" : win!.label}
            </div>
            <div className="mt-1 font-display text-xs font-bold text-inkdim">
              {isSolo ? "Solo entry" : `Team of ${event.min_team_size}–${event.max_team_size}`} ·{" "}
              {isCollege ? "College: FREE" : `External: ${fmtMoney(fee)}`}
            </div>
            <Button size="lg" className="mt-6" onClick={activate} disabled={win!.tone !== "open" || !!existing}>
              <Zap size={16} /> OPEN THE GATE
            </Button>
            <AnimatePresence>
              {activating && (
                <motion.div
                  className="pointer-events-none absolute inset-0 bg-plasma/15"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>
          </Panel>
        )}

        {step === "swipe" && user && (
          <Panel className="p-6">
            <PanelHeader>TASK — VERIFY GUEST PASS</PanelHeader>
            <SwipeTask onDone={() => { sfx.swipeOk(); setStep("team"); }} />
          </Panel>
        )}

        {step === "team" && user && (
          <Panel className="p-6">
            <PanelHeader>TASK — ASSEMBLE TEAM</PanelHeader>
            <div className="pt-5">
              <div className="rounded-blob border-2 border-[#aebbdd]/70 bg-void/60 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display text-[10px] font-extrabold uppercase tracking-[0.25em] text-inkdim">Participant type — auto-detected</div>
                    <div className="mt-1 font-display text-base font-extrabold text-ink">
                      {isCollege ? "COLLEGE PARTICIPANT" : "EXTERNAL PARTICIPANT"}
                    </div>
                    <div className="font-display text-[11px] font-bold text-inkdim">verified via {leaderDomain || "your email"}</div>
                  </div>
                  <Badge tone={isCollege ? "open" : "pending"}>{isCollege ? "FREE" : fmtMoney(fee)}</Badge>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {!isSolo && (
                  <Field label="TEAM NAME" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="e.g. CODE WARRIORS" />
                )}
                {!isSolo && (
                  <Field
                    label="TEAM SIZE"
                    type="number"
                    min={event.min_team_size}
                    max={event.max_team_size}
                    value={teamSize}
                    onChange={(e) => setTeamSize(Math.max(event.min_team_size, Math.min(event.max_team_size, Number(e.target.value) || event.min_team_size)))}
                    hint={`Allowed: ${event.min_team_size}–${event.max_team_size}`}
                  />
                )}
              </div>

              <div className="mt-5 space-y-4">
                {Array.from({ length: teamSize }).map((_, i) => {
                  const m = members[i] ?? EMPTY_MEMBER;
                  const update = (patch: Partial<MemberDraft>) => {
                    setMembers((prev) => {
                      const next = [...prev];
                      while (next.length <= i) next.push({ ...EMPTY_MEMBER });
                      next[i] = { ...next[i], ...patch };
                      return next;
                    });
                  };
                  return (
                    <div key={i} className="rounded-blob border-2 border-[#aebbdd]/70 bg-void/40 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="font-display text-xs font-extrabold tracking-widest text-plasma">
                          {i === 0 ? "★ TEAM LEADER — YOU" : `TEAM MEMBER ${i + 1}`}
                        </span>
                        {i === 0 && <Lock size={12} className="text-inkdim" />}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="NAME" value={m.name} onChange={(e) => update({ name: e.target.value })} disabled={i === 0} />
                        <Field label="EMAIL" type="email" value={m.email} onChange={(e) => update({ email: e.target.value })} disabled={i === 0} />
                        <Field label="PHONE" value={m.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="Optional" />
                        {!isCollege && (
                          <Field label="COLLEGE" value={m.college} onChange={(e) => update({ college: e.target.value })} placeholder="Optional" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {error && <p className="mt-4 font-display text-sm font-bold text-alert">{error}</p>}

              <div className="mt-6 flex justify-between">
                <Button variant="ghost" onClick={() => setStep("swipe")}>← BACK</Button>
                <Button onClick={() => setStep("review")} disabled={!validTeam}>
                  NEXT <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          </Panel>
        )}

        {step === "review" && (
          <Panel className="p-6">
            <PanelHeader>TASK — CONFIRM DETAILS</PanelHeader>
            <div className="pt-5">
              <div className="rounded-blob border-2 border-[#aebbdd]/70 bg-void/60 p-4 font-display text-sm font-bold">
                <Row k="EVENT" v={event.name} />
                {!isSolo && <Row k="TEAM" v={teamName.trim().toUpperCase()} />}
                <Row k="TEAM SIZE" v={String(teamSize)} />
                <Row k="TYPE" v={isCollege ? "COLLEGE (FREE)" : "EXTERNAL"} />
                <Row k="FEE" v={fmtMoney(fee)} accent />
              </div>
              <div className="mt-4 space-y-2">
                {members.slice(0, teamSize).map((m, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-[#aebbdd]/50 pb-2 font-display text-xs font-bold text-inkdim">
                    <span className="text-ink">{m.name || "—"}</span>
                    <span>{m.email}</span>
                  </div>
                ))}
              </div>
              {error && <p className="mt-4 font-display text-sm font-bold text-alert">{error}</p>}
              <div className="mt-6 flex justify-between">
                <Button variant="ghost" onClick={() => setStep("team")}>← EDIT</Button>
                <Button onClick={submitRegistration}>
                  <Zap size={14} /> {fee > 0 ? "PROCEED TO PAYMENT" : "CONFIRM REGISTRATION"}
                </Button>
              </div>
            </div>
          </Panel>
        )}

        {step === "payment" && (
          <Panel className="p-6">
            <PanelHeader>TASK — SETTLE THE FEE</PanelHeader>
            <div className="pt-5 text-center">
              <div className="font-display text-xs font-extrabold uppercase tracking-[0.3em] text-inkdim">Amount due</div>
              <div className="mt-1 font-display text-5xl font-extrabold text-accent-warm text-glow-warm">{fmtMoney(fee)}</div>
              <div className="mt-1 font-display text-[11px] font-bold text-inkdim">ORDER {orderId}</div>
              <UploadBar running={paying} onDoneLabel="PAYMENT RECEIVED ✓" />
              <p className="mx-auto mt-3 max-w-sm font-display text-[11px] font-bold leading-relaxed text-inkdim">
                TEST MODE — simulated gateway records your payment. Real Razorpay arrives later, verified server-side.
              </p>
              {error && <p className="mt-3 font-display text-sm font-bold text-alert">{error}</p>}
              <Button variant="warm" size="lg" className="mt-5" onClick={payNow} disabled={paying}>
                {paying ? "TRANSFERRING…" : `PAY ${fmtMoney(fee)}`}
              </Button>
            </div>
          </Panel>
        )}

        {step === "done" && result?.registrationNumber && (
          <DonePanel registrationNumber={result.registrationNumber} eventName={event.name} color={localStorage.getItem("nexorium-color") ?? "#4cc9f0"} />
        )}
      </div>
    </div>
  );
}

function Row({ k, v, accent = false }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-[#aebbdd]/40 py-1.5">
      <span className="tracking-widest text-inkdim">{k}</span>
      <span className={accent ? "text-accent-warm" : "text-ink"}>{v}</span>
    </div>
  );
}

/** The signature card-swipe mini-game */
function SwipeTask({ onDone }: { onDone: () => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "bad" | "good">("idle");
  const startRef = useRef<{ t: number; x: number } | null>(null);
  const doneRef = useRef(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!reduced) return;
    // Reduced motion: tap instead of swipe
    setStatus("idle");
  }, [reduced]);

  const max = () => (trackRef.current ? trackRef.current.offsetWidth - 92 : 300);

  const onPointerDown = (e: React.PointerEvent) => {
    if (doneRef.current) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    setStatus("idle");
    startRef.current = { t: performance.now(), x: e.clientX - x };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || doneRef.current) return;
    const nx = Math.max(0, Math.min(max(), e.clientX - (startRef.current?.x ?? 0)));
    setX(nx);
  };

  const onPointerUp = () => {
    if (!dragging || doneRef.current) return;
    setDragging(false);
    const dur = performance.now() - (startRef.current?.t ?? 0);
    const reached = x >= max() * 0.92;
    if (reached && dur >= 220 && dur <= 1400) {
      doneRef.current = true;
      setStatus("good");
      setTimeout(onDone, 650);
    } else if (reached) {
      setStatus("bad");
      sfx.swipeBad();
      setTimeout(() => {
        setX(0);
        setStatus("idle");
      }, 700);
    } else {
      setX(0);
      setStatus("idle");
    }
  };

  return (
    <div className="pt-5">
      <div className="text-center font-display text-sm font-bold text-inkdim">
        {status === "bad" ? (
          <span className="text-alert">BAD READ — TRY AGAIN</span>
        ) : status === "good" ? (
          <span className="text-signet">ID VERIFIED ✓</span>
        ) : (
          "SWIPE YOUR ID CARD — NOT TOO FAST, NOT TOO SLOW"
        )}
      </div>
      <div
        ref={trackRef}
        className="relative mt-4 h-20 overflow-hidden rounded-blob border-2 border-[#aebbdd]/70 bg-void"
        style={{ touchAction: "none" }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* slot shading */}
        <div className="absolute inset-y-0 left-0 w-full bg-[linear-gradient(90deg,transparent_85%,rgba(0,0,0,0.4))]" />
        <div
          onPointerDown={onPointerDown}
          style={{ transform: `translateX(${x}px)`, touchAction: "none" }}
          className={`absolute left-1 top-2.5 flex h-[60px] w-[88px] cursor-grab select-none flex-col justify-between rounded-lg border-2 p-1.5 active:cursor-grabbing ${
            status === "good" ? "border-signet bg-signet/20" : status === "bad" ? "border-alert bg-alert/20" : "border-plasma/60 bg-hullraised"
          }`}
        >
          <div className="h-2 w-8 rounded-sm bg-accent-warm/80" />
          <div className="space-y-1">
            <div className="h-1.5 w-full rounded-sm bg-inkdim/40" />
            <div className="h-1.5 w-3/4 rounded-sm bg-inkdim/40" />
          </div>
          <div className="font-display text-[8px] font-extrabold tracking-widest text-inkdim">GUEST PASS</div>
        </div>
      </div>
      <div className="mt-3 text-center font-display text-[11px] font-bold text-inkdim">
        Drag the card all the way through the reader
      </div>
    </div>
  );
}

/** Upload-style striped progress bar for payment */
function UploadBar({ running, onDoneLabel }: { running: boolean; onDoneLabel: string }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    if (!running) return;
    const iv = window.setInterval(() => {
      setPct((p) => {
        if (p >= 100) {
          window.clearInterval(iv);
          return 100;
        }
        return Math.min(100, p + 4 + Math.random() * 6);
      });
    }, 70);
    return () => window.clearInterval(iv);
  }, [running]);

  if (!running && pct === 0) return <div className="mt-6 h-8" />;
  return (
    <div className="mx-auto mt-6 max-w-sm">
      <div className="h-7 overflow-hidden rounded-full border-2 border-[#aebbdd]/70 bg-void">
        <div
          className={`h-full transition-all duration-100 ${pct >= 100 ? "bg-signet" : "bg-plasma task-stripes"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className={`mt-1 font-display text-xs font-extrabold ${pct >= 100 ? "text-signet" : "text-plasma"}`}>
        {pct >= 100 ? onDoneLabel : `UPLOADING… ${Math.floor(pct)}%`}
      </div>
    </div>
  );
}

/** Registration complete — MOCHI strolls in to celebrate */
function DonePanel({ registrationNumber, eventName, color }: { registrationNumber: string; eventName: string; color: string }) {
  const [qr, setQr] = useState("");
  const reduced = useReducedMotion();

  useEffect(() => {
    import("qrcode").then((m) =>
      m.toDataURL(registrationNumber, { width: 300, margin: 1, color: { dark: "#0b1020", light: "#f2f6ff" } }).then(setQr)
    );
  }, [registrationNumber]);

  return (
    <Panel className="overflow-hidden p-8 text-center">
      <div className="relative h-20">
        <motion.div
          className="absolute bottom-0"
          style={{ left: "50%", marginLeft: -30 }}
          initial={{ x: reduced ? 0 : "-45vw" }}
          animate={{ x: reduced ? 0 : 0 }}
          transition={{ duration: 2.4, ease: "easeInOut" }}
        >
          <Mochi color={color} size={60} walking />
        </motion.div>
      </div>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 16, delay: reduced ? 0 : 2.2 }}
        className="mx-auto mt-2 flex h-16 w-16 items-center justify-center rounded-full border-4 border-signet bg-signet/15"
      >
        <Check size={32} className="text-signet" />
      </motion.div>
      <div className="mt-4 font-display text-3xl font-extrabold tracking-wide text-signet">参上 — YOU'RE IN</div>
      <div className="mt-2 font-mono text-lg font-bold text-ink">{registrationNumber}</div>
      <div className="font-display text-xs font-bold text-inkdim">{eventName}</div>
      {qr && (
        <img src={qr} alt="Registration QR pass" className="mx-auto mt-4 rounded-blob border-4 border-plasma/50 bg-void p-2" width={170} height={170} />
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button to="/dashboard" size="md">OPEN MY PASSES</Button>
        <Button to="/events" variant="ghost" size="md">MORE EVENTS</Button>
      </div>
    </Panel>
  );
}
