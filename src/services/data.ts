import { supabase } from "@/lib/supabaseClient";
import type { FestEvent, EventRound, RegistrationStatus, PaymentStatus } from "@/types";

export async function fetchEvents(): Promise<FestEvent[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date_start", { ascending: true });
  if (error) throw new Error("Could not load events. Is the schema installed?");
  return (data ?? []) as FestEvent[];
}

export async function fetchEventBySlug(slug: string): Promise<FestEvent | null> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error("Could not load this event.");
  return (data as FestEvent) ?? null;
}

export async function fetchRounds(eventId: string): Promise<EventRound[]> {
  const { data } = await supabase
    .from("event_rounds")
    .select("*")
    .eq("event_id", eventId)
    .order("round_number", { ascending: true });
  return (data ?? []) as EventRound[];
}

export interface MyRegistration {
  id: string;
  registration_number: string;
  event_id: string;
  team_id: string | null;
  user_id: string;
  participant_type: "college" | "external";
  status: RegistrationStatus;
  payment_status: PaymentStatus;
  amount: number;
  created_at: string;
  updated_at: string;
  events: FestEvent | null;
  teams: {
    id: string;
    team_name: string;
    team_members: {
      id: string;
      name: string;
      email: string | null;
      phone: string | null;
      college: string | null;
      role: string;
    }[];
  } | null;
}

/** Dashboard payload: registrations joined with event + team + members (RLS-scoped) */
export async function fetchMyRegistrations(userId: string): Promise<MyRegistration[]> {
  const { data, error } = await supabase
    .from("registrations")
    .select(
      `id, registration_number, event_id, team_id, user_id, participant_type,
       status, payment_status, amount, created_at, updated_at,
       events ( * ),
       teams ( id, team_name, team_members ( id, name, email, phone, college, role ) )`
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error("Could not load your missions.");
  return (data ?? []) as unknown as MyRegistration[];
}

export async function fetchRegistrationById(id: string): Promise<MyRegistration | null> {
  const { data, error } = await supabase
    .from("registrations")
    .select(
      `id, registration_number, event_id, team_id, user_id, participant_type,
       status, payment_status, amount, created_at, updated_at,
       events ( * ),
       teams ( id, team_name, team_members ( id, name, email, phone, college, role ) )`
    )
    .eq("id", id)
    .maybeSingle();
  if (error) return null;
  return (data as unknown as MyRegistration) ?? null;
}
