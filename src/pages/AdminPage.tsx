import { useEffect, useState } from "react";
import { ScanLine, ShieldAlert } from "lucide-react";
import Panel, { PanelHeader } from "@/components/ui/Panel";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Field from "@/components/ui/Field";
import { ConsoleLoader } from "@/components/ui/Loading";
import { useAuth } from "@/context/AuthContext";
import { fetchAdminOverview, fetchAdminRegistrations, fetchCheckinCount, checkinByRegistrationNumber } from "@/services/rpc";
import { fmtDateTime, fmtMoney } from "@/lib/format";
import type { AdminOverview } from "@/types";

interface AdminReg {
  id: string;
  registration_number: string;
  status: string;
  payment_status: string;
  amount: number;
  created_at: string;
  participant_type: string;
  profiles: { full_name: string | null; email: string | null } | null;
  events: { name: string; slug: string } | null;
  teams: { team_name: string } | null;
}

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [regs, setRegs] = useState<AdminReg[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [query, setQuery] = useState("");
  const [checkinCount, setCheckinCount] = useState(0);
  const [scanInput, setScanInput] = useState("");
  const [scanResult, setScanResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([fetchAdminOverview(), fetchAdminRegistrations(), fetchCheckinCount()])
      .then(([ov, rg, cc]) => {
        setOverview(ov);
        setRegs(rg);
        setCheckinCount(cc);
      })
      .finally(() => setLoadingData(false));
  }, [isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <ConsoleLoader label="VERIFYING CLEARANCE" />;

  if (!user || !isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Panel className="p-8">
          <ShieldAlert className="mx-auto h-8 w-8 text-alert" />
          <div className="mt-3 font-display text-lg font-bold tracking-[0.25em] text-ink">RESTRICTED WING</div>
          <p className="mt-2 font-mono text-[11px] leading-relaxed text-inkdim">
            Admin clearance required. Your account can be promoted with one SQL line in Supabase:
          </p>
          <code className="mt-3 block border border-seam bg-void p-2 font-mono text-[10px] text-plasma">
            update profiles set role='admin' where email='you@pccoepune.org';
          </code>
          <Button to="/" variant="ghost" size="sm" className="mt-5">RETURN TO COMMAND CENTER</Button>
        </Panel>
      </div>
    );
  }

  const filtered = regs.filter((r) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      r.registration_number.toLowerCase().includes(q) ||
      (r.profiles?.full_name ?? "").toLowerCase().includes(q) ||
      (r.profiles?.email ?? "").toLowerCase().includes(q) ||
      (r.events?.name ?? "").toLowerCase().includes(q) ||
      (r.teams?.team_name ?? "").toLowerCase().includes(q)
    );
  });

  const runCheckin = async () => {
    if (!scanInput.trim()) return;
    setScanning(true);
    setScanResult(null);
    const res = await checkinByRegistrationNumber(scanInput.trim());
    setScanResult({
      ok: res.ok,
      text: res.ok
        ? `✓ CHECKED IN — ${res.name} · ${res.event}${res.team ? ` · ${res.team}` : ""}`
        : res.code === "ALREADY_CHECKED_IN"
          ? `ALREADY CHECKED IN${res.at ? ` at ${fmtDateTime(res.at)}` : ""}`
          : res.message ?? "INVALID PASS",
    });
    setScanning(false);
    setScanInput("");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-10 sm:pt-14">
      <div className="text-center">
        <div className="font-mono text-[10px] tracking-[0.45em] text-accent-warm">RESTRICTED // CLEARANCE GRANTED</div>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-[0.2em] text-ink">
          EVENT <span className="text-accent-warm text-glow-warm">COMMAND CENTER</span>
        </h1>
      </div>

      {loadingData ? (
        <ConsoleLoader label="SYNCING FEST TELEMETRY" />
      ) : (
        <>
          {/* Stat tiles (spec §46) */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatTile label="EVENTS" value={overview?.events.length ?? 0} />
            <StatTile label="REGISTRATIONS" value={overview?.totalRegistrations ?? 0} />
            <StatTile label="CONFIRMED" value={overview?.confirmed ?? 0} tone="ok" />
            <StatTile label="PARTICIPANTS" value={overview?.uniqueParticipants ?? 0} />
            <StatTile label="REVENUE" value={fmtMoney(overview?.revenue ?? 0)} />
            <StatTile label="CHECKED IN" value={checkinCount} tone="warm" />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {/* Capacity per event */}
            <Panel>
              <PanelHeader>EVENT CAPACITY</PanelHeader>
              <div className="space-y-4 p-5">
                {(overview?.perEvent ?? []).map(({ event, count, capacity }) => (
                  <div key={event.id}>
                    <div className="flex justify-between font-mono text-[11px] tracking-[0.15em]">
                      <span className="text-ink">{event.name}</span>
                      <span className="text-inkdim">{count}/{capacity}</span>
                    </div>
                    <div className="mt-1.5 h-2 border border-seam bg-void">
                      <div
                        className="h-full bg-plasma/70 shadow-glow transition-all"
                        style={{ width: `${Math.min(100, (count / Math.max(capacity, 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Manual check-in console (spec §48) */}
            <Panel scanlines>
              <PanelHeader>PASS VALIDATOR</PanelHeader>
              <div className="p-5">
                <div className="flex items-center justify-center gap-3 border border-dashed border-plasma/40 bg-void/50 py-6">
                  <ScanLine className="h-6 w-6 text-plasma" />
                  <span className="font-mono text-[10px] tracking-[0.3em] text-inkdim">CAMERA SCANNER PHASE 2 — MANUAL ENTRY ACTIVE</span>
                </div>
                <div className="mt-4 flex items-end gap-2">
                  <div className="flex-1">
                    <Field
                      label="REGISTRATION NUMBER"
                      value={scanInput}
                      onChange={(e) => setScanInput(e.target.value.toUpperCase())}
                      placeholder="REG-26-XXX-XXXX"
                    />
                  </div>
                  <Button onClick={runCheckin} disabled={scanning || !scanInput.trim()}>
                    {scanning ? "…" : "CHECK IN"}
                  </Button>
                </div>
                {scanResult && (
                  <div
                    className={`clip-tag mt-4 border p-3 font-mono text-[11px] tracking-[0.15em] ${
                      scanResult.ok ? "border-signet/50 bg-signet/10 text-signet" : "border-alert/50 bg-alert/10 text-alert"
                    }`}
                  >
                    {scanResult.text}
                  </div>
                )}
              </div>
            </Panel>
          </div>

          {/* Registrations table */}
          <Panel className="mt-6">
            <PanelHeader>REGISTRATION LOG</PanelHeader>
            <div className="p-4">
              <div className="w-full sm:max-w-xs">
                <Field label="SEARCH" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name / email / pass / team" />
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left font-mono text-[11px]">
                  <thead>
                    <tr className="border-b border-seam text-inkdim">
                      <th className="py-2 pr-3 tracking-[0.2em]">PASS</th>
                      <th className="py-2 pr-3 tracking-[0.2em]">GUEST</th>
                      <th className="py-2 pr-3 tracking-[0.2em]">EVENT</th>
                      <th className="py-2 pr-3 tracking-[0.2em]">TEAM</th>
                      <th className="py-2 pr-3 tracking-[0.2em]">TYPE</th>
                      <th className="py-2 pr-3 tracking-[0.2em]">FEE</th>
                      <th className="py-2 pr-3 tracking-[0.2em]">STATUS</th>
                      <th className="py-2 tracking-[0.2em]">DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.id} className="border-b border-seam/40 text-inkdim transition-colors hover:bg-plasma/5">
                        <td className="py-2 pr-3 text-ink">{r.registration_number}</td>
                        <td className="py-2 pr-3">{r.profiles?.full_name ?? "—"}</td>
                        <td className="py-2 pr-3">{r.events?.name ?? "—"}</td>
                        <td className="py-2 pr-3">{r.teams?.team_name ?? "—"}</td>
                        <td className="py-2 pr-3">{r.participant_type === "college" ? "COLLEGE" : "EXTERNAL"}</td>
                        <td className="py-2 pr-3">{fmtMoney(r.amount)}</td>
                        <td className="py-2 pr-3">
                          <Badge tone={r.status === "confirmed" ? "open" : r.status === "pending" ? "pending" : "closed"}>
                            {r.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-2">{fmtDateTime(r.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="py-8 text-center font-mono text-[11px] tracking-[0.2em] text-inkdim">NO RECORDS MATCH</div>
                )}
              </div>
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}

function StatTile({ label, value, tone }: { label: string; value: number | string; tone?: "ok" | "warm" }) {
  return (
    <Panel className="p-4 text-center">
      <div className="font-mono text-[9px] tracking-[0.3em] text-inkdim">{label}</div>
      <div
        className={`mt-1 font-display text-2xl font-bold ${
          tone === "ok" ? "text-signet" : tone === "warm" ? "text-accent-warm" : "text-plasma text-glow"
        }`}
      >
        {value}
      </div>
    </Panel>
  );
}
