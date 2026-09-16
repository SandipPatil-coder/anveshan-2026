import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Panel from "@/components/ui/Panel";
import { fmtDate } from "@/lib/format";
import type { MyRegistration } from "@/services/data";

/** QR pass card for a confirmed registration (spec §22) */
export default function QRPass({ reg }: { reg: MyRegistration }) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(reg.registration_number, {
      width: 320,
      margin: 1,
      color: { dark: "#232028", light: "#ffffff" },
      errorCorrectionLevel: "M",
    }).then(setDataUrl);
  }, [reg.registration_number]);

  const ev = reg.events;

  return (
    <Panel scanlines className="mx-auto w-full max-w-sm p-6 text-center">
      <div className="font-mono text-[10px] tracking-[0.4em] text-plasma">ENTRY PASS · 参加証</div>
      <div className="mt-4 border border-plasma/40 bg-void p-3 inline-block">
        {dataUrl ? (
          <img src={dataUrl} alt={`QR code for pass ${reg.registration_number}`} className="h-44 w-44" />
        ) : (
          <div className="flex h-44 w-44 items-center justify-center font-mono text-[10px] text-inkdim">
            GENERATING…
          </div>
        )}
      </div>
      <div className="mt-4 font-mono text-lg tracking-[0.2em] text-ink">{reg.registration_number}</div>
      <div className="mt-3 border-t border-seam pt-3 text-sm">
        <div className="font-display font-bold tracking-[0.2em] text-plasma">{ev?.name ?? "EVENT"}</div>
        {reg.teams && <div className="mt-1 font-mono text-xs text-inkdim">TEAM: {reg.teams.team_name}</div>}
        <div className="mt-1 font-mono text-xs text-inkdim">{fmtDate(ev?.event_date_start ?? null)}</div>
        <div className="mt-2 font-mono text-[10px] tracking-[0.25em] text-signet">
          {reg.payment_status === "paid" ? "PAID — CONFIRMED" : "CONFIRMED"}
        </div>
      </div>
    </Panel>
  );
}
