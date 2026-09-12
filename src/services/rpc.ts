import { supabase } from "@/lib/supabaseClient";
import type { RegisterResult, PaymentResult, CheckinResult, AdminOverview, FestEvent } from "@/types";

/** Server-side registration engine (spec §11, §59) */
export async function registerForEvent(params: {
  eventId: string;
  teamName: string;
  teamSize: number;
  memberNames: string[];
  memberEmails: string[];
  memberPhones: string[];
  memberColleges: string[];
}): Promise<RegisterResult> {
  const { data, error } = await supabase.rpc("register_for_event", {
    p_event_id: params.eventId,
    p_team_name: params.teamName,
    p_team_size: params.teamSize,
    p_member_names: params.memberNames,
    p_member_emails: params.memberEmails,
    p_member_phones: params.memberPhones,
    p_member_colleges: params.memberColleges,
  });
  if (error) {
    return { ok: false, code: "RPC", message: friendlyRpcError(error.message) };
  }
  return data as RegisterResult;
}

/** Test-mode payment capture for external participants */
export async function captureMockPayment(
  registrationId: string,
  orderId: string
): Promise<PaymentResult> {
  const { data, error } = await supabase.rpc("mock_capture_payment", {
    p_registration_id: registrationId,
    p_order_id: orderId,
  });
  if (error) return { ok: false, code: "RPC", message: friendlyRpcError(error.message) };
  return data as PaymentResult;
}

/** Admin manual check-in by registration number (duplicate-protected) */
export async function checkinByRegistrationNumber(regNumber: string): Promise<CheckinResult> {
  const { data, error } = await supabase.rpc("checkin_by_registration_number", {
    p_registration_number: regNumber,
  });
  if (error) return { ok: false, code: "RPC", message: friendlyRpcError(error.message) };
  return data as CheckinResult;
}

function friendlyRpcError(msg: string): string {
  if (msg.includes("duplicate key")) {
    return "Your team is already registered for this event.";
  }
  if (msg.includes("row-level security")) {
    return "You do not have permission for that action.";
  }
  return "Something went wrong. Please try again.";
}

/** Live command-center stats. Returns null when viewer is not admin. */
export async function fetchAdminOverview(): Promise<AdminOverview | null> {
  const [eventsRes, regsRes] = await Promise.all([
    supabase.from("events").select("*").order("event_date_start", { ascending: true }),
    supabase
      .from("registrations")
      .select("id, user_id, status, payment_status, amount, created_at, event_id, registration_number, events ( name, slug )")
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  if (eventsRes.error || regsRes.error) return null;

  const events = (eventsRes.data ?? []) as unknown as FestEvent[];
  const regs = (regsRes.data ?? []) as unknown as {
    id: string;
    user_id: string;
    status: string;
    payment_status: string;
    amount: number;
    created_at: string;
    event_id: string;
    registration_number: string;
    events: { name: string; slug: string }[] | null;
  }[];

  const confirmed = regs.filter((r) => r.status === "confirmed").length;
  const pending = regs.filter((r) => r.status === "pending").length;
  const revenue = regs
    .filter((r) => r.payment_status === "paid")
    .reduce((sum, r) => sum + Number(r.amount ?? 0), 0);

  const perEvent = events.map((ev) => ({
    event: ev,
    count: regs.filter((r) => r.event_id === ev.id && r.status !== "cancelled").length,
    capacity: ev.max_teams,
  }));

  return {
    events,
    totalRegistrations: regs.length,
    confirmed,
    pending,
    uniqueParticipants: new Set(regs.map((r) => r.user_id)).size,
    revenue,
    checkedIn: 0,
    checkedInCount: regs.length ? undefined : undefined,
    perEvent,
    recent: regs.slice(0, 12).map((r) => ({
      id: r.id,
      registration_number: r.registration_number,
      event_id: r.event_id,
      team_id: null,
      user_id: r.user_id,
      participant_type: "external",
      status: r.status as RegistrationStatusAlias,
      payment_status: "pending",
      amount: r.amount,
      created_at: r.created_at,
      updated_at: r.created_at,
      events: r.events,
    })),
  } as unknown as AdminOverview;
}
type RegistrationStatusAlias = import("@/types").RegistrationStatus;

/** Check-in counts need a separate lightweight call; admin page uses this for the stat tile. */
export async function fetchCheckinCount(): Promise<number> {
  const { count, error } = await supabase
    .from("check_ins")
    .select("id", { count: "exact", head: true });
  return error ? 0 : count ?? 0;
}

/** Registrations table with names, for the admin list (admin RLS read) */
export async function fetchAdminRegistrations(): Promise<
  {
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
  }[]
> {
  const { data, error } = await supabase
    .from("registrations")
    .select(
      `id, registration_number, status, payment_status, amount, created_at, participant_type,
       profiles ( full_name, email ),
       events ( name, slug ),
       teams ( team_name )`
    )
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return [];
  return (data ?? []) as unknown as Awaited<ReturnType<typeof fetchAdminRegistrations>>;
}

export type { FestEvent };
