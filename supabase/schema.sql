-- ============================================================
-- ANVESHAN 2026 — TechFest Platform Schema
-- Paste this whole file into Supabase SQL Editor and Run.
-- Safe to re-run: it is idempotent (skips what exists).
-- ============================================================

-- 1) Profile auto-creation on signup -------------------------
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  college text,
  year text,
  avatar_url text,
  role text not null default 'participant'
    check (role in ('participant', 'coordinator', 'admin', 'super_admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop trigger if exists on_auth_user_created on auth.users;
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) College domains (fee category detection) -----------------
create table if not exists public.college_domains (
  domain text primary key,
  college_name text not null,
  created_at timestamptz not null default now()
);

alter table public.college_domains enable row level security;

insert into public.college_domains (domain, college_name)
values ('pccoepune.org', 'PCCOE Pune')
on conflict (domain) do nothing;

-- 3) Events ---------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  short_description text,
  description text,
  category text,
  poster_url text,
  rulebook_url text,
  venue text,
  prize_pool numeric default 0,
  event_date_start timestamptz,
  event_date_end timestamptz,
  team_based boolean not null default false,
  min_team_size integer not null default 1,
  max_team_size integer not null default 1,
  registration_fee_internal numeric not null default 0,
  registration_fee_external numeric not null default 0,
  max_teams integer not null default 100,
  registration_open boolean not null default true,
  registration_start timestamptz not null default now(),
  registration_end timestamptz not null default now() + interval '90 days',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.events enable row level security;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists events_touch on public.events;
create trigger events_touch before update on public.events
  for each row execute function public.touch_updated_at();

-- 4) Event rounds ----------------------------------------------
create table if not exists public.event_rounds (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  round_number integer not null,
  name text not null,
  description text,
  date timestamptz,
  duration_minutes integer,
  location text,
  rules text
);

alter table public.event_rounds enable row level security;

-- 5) Teams ------------------------------------------------------
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  team_name text not null,
  leader_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('draft', 'pending', 'confirmed', 'cancelled', 'disqualified')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.teams enable row level security;

create or replace function public.teams_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists teams_touch on public.teams;
create trigger teams_touch before update on public.teams
  for each row execute function public.teams_touch_updated_at();

-- 6) Team members ------------------------------------------------
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text,
  phone text,
  college text,
  student_id text,
  role text not null default 'member' check (role in ('leader', 'member')),
  verification_status text not null default 'not_required'
    check (verification_status in ('not_required', 'pending', 'verified', 'rejected')),
  joined_at timestamptz not null default now()
);

alter table public.team_members enable row level security;

-- 7) Registrations ------------------------------------------------
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  registration_number text unique not null,
  event_id uuid not null references public.events(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  participant_type text not null check (participant_type in ('college', 'external')),
  status text not null default 'pending'
    check (status in ('draft', 'pending', 'confirmed', 'cancelled', 'rejected', 'disqualified')),
  payment_status text not null default 'not_required'
    check (payment_status in ('not_required', 'pending', 'paid', 'failed', 'refunded')),
  amount numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.registrations enable row level security;

-- One active registration per user per event (spec §45)
create unique index if not exists registrations_one_active_per_user_event
  on public.registrations (user_id, event_id)
  where status in ('draft', 'pending', 'confirmed');

create or replace function public.registrations_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists registrations_touch on public.registrations;
create trigger registrations_touch before update on public.registrations
  for each row execute function public.registrations_touch_updated_at();

-- 8) Payments -----------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  provider text not null default 'mock_terminal',
  order_id text not null,
  payment_id text,
  amount numeric not null,
  currency text not null default 'INR',
  status text not null default 'created'
    check (status in ('created', 'paid', 'failed', 'refunded')),
  signature_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payments enable row level security;

-- 9) Check-ins ----------------------------------------------------
create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid unique not null references public.registrations(id) on delete cascade,
  checked_in_by uuid references auth.users(id) on delete set null,
  checked_in_at timestamptz not null default now(),
  location text
);

alter table public.check_ins enable row level security;

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- profiles: read/update own only
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

-- college_domains: public read
drop policy if exists "college_domains_public_read" on public.college_domains;
create policy "college_domains_public_read" on public.college_domains
  for select using (true);

-- events: public read; admin write
drop policy if exists "events_public_read" on public.events;
create policy "events_public_read" on public.events
  for select using (true);
drop policy if exists "events_admin_write" on public.events;
create policy "events_admin_write" on public.events
  for all using (public.is_admin()) with check (public.is_admin());

-- rounds: public read; admin write
drop policy if exists "rounds_public_read" on public.event_rounds;
create policy "rounds_public_read" on public.event_rounds
  for select using (true);
drop policy if exists "rounds_admin_write" on public.event_rounds;
create policy "rounds_admin_write" on public.event_rounds
  for all using (public.is_admin()) with check (public.is_admin());

-- teams: leader/member + admin visibility
drop policy if exists "teams_select_member" on public.teams;
create policy "teams_select_member" on public.teams
  for select using (
    auth.uid() = leader_id
    or exists (select 1 from public.team_members tm where tm.team_id = id and tm.user_id = auth.uid())
    or public.is_admin()
  );
drop policy if exists "teams_insert_leader" on public.teams;
create policy "teams_insert_leader" on public.teams
  for insert with check (auth.uid() = leader_id);
drop policy if exists "teams_update_leader" on public.teams;
create policy "teams_update_leader" on public.teams
  for update using (auth.uid() = leader_id) with check (auth.uid() = leader_id);

-- team_members: visible to own team; admin full
drop policy if exists "team_members_select_own_team" on public.team_members;
create policy "team_members_select_own_team" on public.team_members
  for select using (
    exists (select 1 from public.teams t where t.id = team_id and (t.leader_id = auth.uid() or public.is_admin()))
    or user_id = auth.uid()
  );
drop policy if exists "team_members_insert_leader" on public.team_members;
create policy "team_members_insert_leader" on public.team_members
  for insert with check (
    exists (select 1 from public.teams t where t.id = team_id and t.leader_id = auth.uid())
  );

-- registrations: own only; admin full
drop policy if exists "registrations_select_own" on public.registrations;
create policy "registrations_select_own" on public.registrations
  for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "registrations_admin_write" on public.registrations;
create policy "registrations_admin_write" on public.registrations
  for update using (public.is_admin()) with check (public.is_admin());
-- NOTE: no insert policy on purpose — inserts go through the RPC below only.

-- payments: own via registration; admin full
drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own" on public.payments
  for select using (
    exists (select 1 from public.registrations r where r.id = registration_id and (r.user_id = auth.uid() or public.is_admin()))
  );
drop policy if exists "payments_admin_write" on public.payments;
create policy "payments_admin_write" on public.payments
  for update using (public.is_admin()) with check (public.is_admin());

-- check_ins: admin only
drop policy if exists "checkins_admin_all" on public.check_ins;
create policy "checkins_admin_all" on public.check_ins
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- ADMIN HELPER
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'super_admin')
  );
$$;

-- ============================================================
-- RPC: REGISTRATION ENGINE (server-side business logic)
-- ============================================================
create or replace function public.register_for_event(
  p_event_id uuid,
  p_team_name text,
  p_team_size integer,
  p_member_names text[],
  p_member_emails text[],
  p_member_phones text[],
  p_member_colleges text[]
)
returns json
language plpgsql
security definer set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_user_email text;
  v_event public.events%rowtype;
  v_domain text;
  v_is_college boolean := false;
  v_participant_type text;
  v_fee numeric;
  v_team uuid := null;
  v_registration uuid;
  v_reg_number text;
  v_event_code text;
  v_random text;
  v_capacity integer;
  v_i integer;
begin
  if v_user is null then
    return json_build_object('ok', false, 'code', 'AUTH', 'message', 'You must be signed in to register.');
  end if;

  if p_team_size < 1 or p_team_size > 4 then
    return json_build_object('ok', false, 'code', 'TEAM_SIZE', 'message', 'Team size must be between 1 and 4.');
  end if;

  select * into v_event from public.events where id = p_event_id;
  if not found then
    return json_build_object('ok', false, 'code', 'EVENT', 'message', 'This event does not exist.');
  end if;

  -- Registration window + open flag
  if not v_event.registration_open or now() < v_event.registration_start or now() > v_event.registration_end then
    return json_build_object('ok', false, 'code', 'CLOSED', 'message', 'This registration window has closed.');
  end if;

  -- Duplicate protection (one active registration per user/event)
  if exists (
    select 1 from public.registrations
    where user_id = v_user and event_id = p_event_id and status in ('draft', 'pending', 'confirmed')
  ) then
    return json_build_object('ok', false, 'code', 'DUPLICATE', 'message', 'Your team is already registered for this event.');
  end if;

  -- Capacity check
  select count(*) into v_capacity
  from public.registrations
  where event_id = p_event_id and status in ('pending', 'confirmed');
  if v_capacity >= v_event.max_teams then
    return json_build_object('ok', false, 'code', 'FULL', 'message', 'This event is full.');
  end if;

  -- Team size rules from event config
  if v_event.team_based and (p_team_size < v_event.min_team_size or p_team_size > v_event.max_team_size) then
    return json_build_object('ok', false, 'code', 'TEAM_SIZE', 'message', 'Team size must be between '
      || v_event.min_team_size || ' and ' || v_event.max_team_size || ' for this event.');
  end if;
  if not v_event.team_based and p_team_size <> 1 then
    return json_build_object('ok', false, 'code', 'TEAM_SIZE', 'message', 'This is an individual event.');
  end if;

  -- Email domain -> participant category + fee (server-side, per spec §59)
  select email into v_user_email from auth.users where id = v_user;
  v_domain := lower(split_part(coalesce(v_user_email, ''), '@', 2));
  if exists (select 1 from public.college_domains where domain = v_domain) then
    v_is_college := true;
  end if;
  v_participant_type := case when v_is_college then 'college' else 'external' end;
  v_fee := case when v_is_college then v_event.registration_fee_internal else v_event.registration_fee_external end;

  -- Generate unique registration number REG-26-XXX-XXXX
  v_event_code := upper(left(regexp_replace(v_event.slug, '[^a-zA-Z]', '', 'g'), 3));
  if coalesce(v_event_code, '') = '' then
    v_event_code := 'EVT';
  end if;
  v_reg_number := '';
  v_random := '';
  while v_reg_number = '' loop
    v_random := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
    v_reg_number := 'REG-26-' || v_event_code || '-' || v_random;
    begin
      -- probe uniqueness with an insert later; here just check
      if exists (select 1 from public.registrations where registration_number = v_reg_number) then
        v_reg_number := '';
      end if;
    exception when others then
      v_reg_number := '';
    end;
  end loop;

  insert into public.registrations (registration_number, event_id, user_id, participant_type, status, payment_status, amount)
  values (v_reg_number, p_event_id, v_user,
          v_participant_type,
          case when v_fee > 0 then 'pending' else 'confirmed' end,
          case when v_fee > 0 then 'pending' else 'not_required' end,
          v_fee)
  returning id into v_registration;

  -- Team + members (leader is row 1)
  if p_team_size > 1 then
    insert into public.teams (event_id, team_name, leader_id, status)
    values (p_event_id, p_team_name, v_user, 'pending')
    returning id into v_team;

    update public.registrations set team_id = v_team where id = v_registration;

    for v_i in 1..p_team_size loop
      insert into public.team_members (team_id, user_id, name, email, phone, college, role)
      values (
        v_team,
        case when v_i = 1 then v_user else null end,
        p_member_names[v_i],
        p_member_emails[v_i],
        p_member_phones[v_i],
        p_member_colleges[v_i],
        case when v_i = 1 then 'leader' else 'member' end
      );
    end loop;
  end if;

  return json_build_object(
    'ok', true,
    'registrationId', v_registration,
    'registrationNumber', v_reg_number,
    'participantType', v_participant_type,
    'fee', v_fee,
    'status', case when v_fee > 0 then 'pending' else 'confirmed' end,
    'paymentStatus', case when v_fee > 0 then 'pending' else 'not_required' end
  );
end;
$$;

-- Mock payment capture: flips registration + payment to paid (test mode only)
create or replace function public.mock_capture_payment(
  p_registration_id uuid,
  p_order_id text
)
returns json
language plpgsql
security definer set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_reg public.registrations%rowtype;
  v_payment uuid;
begin
  if v_user is null then
    return json_build_object('ok', false, 'code', 'AUTH', 'message', 'Sign in required.');
  end if;

  select * into v_reg from public.registrations where id = p_registration_id;
  if not found or v_reg.user_id <> v_user then
    return json_build_object('ok', false, 'code', 'NOT_FOUND', 'message', 'Registration not found.');
  end if;
  if v_reg.payment_status = 'paid' then
    return json_build_object('ok', true, 'alreadyPaid', true);
  end if;

  insert into public.payments (registration_id, provider, order_id, payment_id, amount, currency, status, signature_verified)
  values (p_registration_id, 'mock_terminal', p_order_id, 'MOCK-' || upper(substr(md5(random()::text), 1, 10)),
          v_reg.amount, 'INR', 'paid', true)
  returning id into v_payment;

  update public.registrations
  set status = 'confirmed', payment_status = 'paid'
  where id = p_registration_id;

  return json_build_object('ok', true, 'paymentId', v_payment);
end;
$$;

-- Check-in helper (admin console)
create or replace function public.checkin_by_registration_number(
  p_registration_number text
)
returns json
language plpgsql
security definer set search_path = public
as $$
declare
  v_reg record;
  v_already timestamptz;
begin
  if not public.is_admin() then
    return json_build_object('ok', false, 'code', 'FORBIDDEN', 'message', 'Admin access required.');
  end if;

  select r.id, r.registration_number, r.status, p.full_name, e.name as event_name, t.team_name
  into v_reg
  from public.registrations r
  join public.profiles p on p.id = r.user_id
  join public.events e on e.id = r.event_id
  left join public.teams t on t.id = r.team_id
  where upper(r.registration_number) = upper(p_registration_number);

  if not found then
    return json_build_object('ok', false, 'code', 'INVALID', 'message', 'INVALID PASS');
  end if;

  select checked_in_at into v_already from public.check_ins where registration_id = v_reg.id;
  if v_already is not null then
    return json_build_object('ok', false, 'code', 'ALREADY_CHECKED_IN',
      'message', 'ALREADY CHECKED IN',
      'at', v_already,
      'name', v_reg.full_name, 'event', v_reg.event_name, 'team', v_reg.team_name);
  end if;

  if v_reg.status <> 'confirmed' then
    return json_build_object('ok', false, 'code', 'NOT_CONFIRMED',
      'message', 'Registration is not confirmed.', 'name', v_reg.full_name,
      'event', v_reg.event_name, 'team', v_reg.team_name);
  end if;

  insert into public.check_ins (registration_id, checked_in_by, location)
  values (v_reg.id, auth.uid(), 'main-gate');

  return json_build_object('ok', true,
    'name', v_reg.full_name, 'event', v_reg.event_name, 'team', v_reg.team_name);
end;
$$;

grant execute on function public.register_for_event(uuid, text, integer, text[], text[], text[], text[]) to anon, authenticated;
grant execute on function public.mock_capture_payment(uuid, text) to authenticated;
grant execute on function public.checkin_by_registration_number(text) to authenticated;

-- ============================================================
-- SEED: 5 sample events + rounds (edit or delete in Table Editor)
-- ============================================================
insert into public.events (slug, name, short_description, description, category, venue, prize_pool,
  event_date_start, event_date_end, team_based, min_team_size, max_team_size,
  registration_fee_internal, registration_fee_external, max_teams, registration_open)
values
  ('ml-mania', 'ML MANIA', 'Machine learning arena — build, train, survive the leaderboard.',
   'A two-day machine learning gauntlet. Day one: data wrangling and model building on a surprise dataset. Day two: head-to-head leaderboard battles judged on accuracy, creativity and the dreaded live viva. Bring your own laptop; GPUs not guaranteed, glory is.',
   'AI / ML', 'Innovation Lab, Block C', 10000,
   now() + interval '30 days', now() + interval '32 days',
   true, 3, 4, 0, 1, 100, true),
  ('logic-lamp', 'LOGIC LAMP', 'Competitive programming marathon for the algorithmically blessed.',
   'Individual competitive coding marathon. Three problem sets of escalating cruelty, an online judge that never sleeps, and one lamp that stays lit for whoever solves the impossible bonus problem first.',
   'Coding', 'Computer Lab 4', 5000,
   now() + interval '30 days', now() + interval '30 days',
   false, 1, 1, 0, 1, 60, true),
  ('spike-showdown', 'SPIKE SHOWDOWN', 'Esports tournament — brace for impact.',
   'The fest''s biggest LAN arena. 5v5 tactical shooter bracket on day one, battle royale squad chaos on day two. Registrations are squad-based; substitutes allowed until bracket lock.',
   'Gaming / Esports', 'Auditorium LAN Hall', 8000,
   now() + interval '31 days', now() + interval '32 days',
   true, 4, 4, 0, 1, 100, true),
  ('chakava', 'CHAKAVA', 'Cultural team performance — roar the stage awake.',
   'Team stage performance event. Eight minutes, any theme, one stage, zero mercy from the judges. Props allowed, pyrotechnics negotiable (ask first).',
   'Cultural', 'Open Air Stage', 7000,
   now() + interval '32 days', now() + interval '32 days',
   true, 2, 4, 0, 1, 80, true),
  ('sambhashini', 'SAMBHASHINI', 'Language & debate arena — words as weapons.',
   'Debate and elocution arena. Round one: prepared speech. Round two: extempore on surprise prompts. Round three: the crossfire, where rebuttals fly faster than the timer.',
   'Cultural', 'Seminar Hall A', 4000,
   now() + interval '31 days', now() + interval '31 days',
   false, 1, 1, 0, 1, 50, true)
on conflict (slug) do nothing;

-- Sample rounds for ML Mania (data-driven event details demo)
insert into public.event_rounds (event_id, round_number, name, description, location)
select e.id, r.round_number, r.name, r.description, r.location
from public.events e,
  (values
    (0, 'QUALIFIER', 'Online aptitude + ML basics quiz. Top 32 teams advance.', 'Online'),
    (1, 'MODEL SIEGE', 'Build the best model on a surprise dataset in 3 hours.', 'Innovation Lab'),
    (2, 'FINAL SHOWDOWN', 'Live leaderboard battle + viva with judges.', 'Innovation Lab')
  ) as r(round_number, name, description, location)
where e.slug = 'ml-mania'
  and not exists (select 1 from public.event_rounds er where er.event_id = e.id);
