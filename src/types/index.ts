// Shared domain types mirroring the Supabase schema

export type Role = "participant" | "coordinator" | "admin" | "super_admin";
export type ParticipantType = "college" | "external";
export type RegistrationStatus =
  | "draft"
  | "pending"
  | "confirmed"
  | "cancelled"
  | "rejected"
  | "disqualified";
export type PaymentStatus =
  | "not_required"
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  college: string | null;
  year: string | null;
  avatar_url: string | null;
  role: Role;
  created_at: string;
}

export interface FestEvent {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  category: string | null;
  poster_url: string | null;
  rulebook_url: string | null;
  venue: string | null;
  prize_pool: number | null;
  event_date_start: string | null;
  event_date_end: string | null;
  team_based: boolean;
  min_team_size: number;
  max_team_size: number;
  registration_fee_internal: number;
  registration_fee_external: number;
  max_teams: number;
  registration_open: boolean;
  registration_start: string;
  registration_end: string;
  created_at: string;
  updated_at: string;
}

export interface EventRound {
  id: string;
  event_id: string;
  round_number: number;
  name: string;
  description: string | null;
  date: string | null;
  duration_minutes: number | null;
  location: string | null;
  rules: string | null;
}

export interface TeamMemberRow {
  id: string;
  team_id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  college: string | null;
  student_id: string | null;
  role: "leader" | "member";
  verification_status: string;
  joined_at: string;
}

export interface Team {
  id: string;
  event_id: string;
  team_name: string;
  leader_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  team_members?: TeamMemberRow[];
}

export interface Registration {
  id: string;
  registration_number: string;
  event_id: string;
  team_id: string | null;
  user_id: string;
  participant_type: ParticipantType;
  status: RegistrationStatus;
  payment_status: PaymentStatus;
  amount: number;
  created_at: string;
  updated_at: string;
  events?: FestEvent | null;
  teams?: Team | null;
}

export interface RegisterResult {
  ok: boolean;
  code?: string;
  message?: string;
  registrationId?: string;
  registrationNumber?: string;
  participantType?: ParticipantType;
  fee?: number;
  status?: string;
  paymentStatus?: string;
}

export interface PaymentResult {
  ok: boolean;
  code?: string;
  message?: string;
  alreadyPaid?: boolean;
  paymentId?: string;
}

export interface CheckinResult {
  ok: boolean;
  code?: string;
  message?: string;
  at?: string;
  name?: string;
  event?: string;
  team?: string | null;
}

export interface AdminOverview {
  events: FestEvent[];
  totalRegistrations: number;
  confirmed: number;
  pending: number;
  uniqueParticipants: number;
  revenue: number;
  checkedIn: number;
  perEvent: { event: FestEvent; count: number; capacity: number }[];
  recent: (Registration & { events?: FestEvent | null })[];
}
