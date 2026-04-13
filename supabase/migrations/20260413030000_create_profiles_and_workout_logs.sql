create extension if not exists pgcrypto;

create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  primary_sport text not null check (primary_sport in ('cycling', 'bjj', 'swimming', 'surfing')),
  secondary_sports text[] not null default '{}',
  experience_level text not null check (experience_level in ('foundation', 'intermediate', 'competitive')),
  training_days integer not null check (training_days in (2, 3, 4)),
  goal_focus text not null check (goal_focus in ('strength_to_weight', 'endurance', 'durability', 'mobility')),
  bodyweight_kg numeric(5,2) not null check (bodyweight_kg > 0),
  bjj_weight_class text,
  injury_notes text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.workout_logs (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null,
  sport text not null check (sport in ('cycling', 'bjj', 'swimming', 'surfing')),
  completed_at timestamptz not null,
  readiness jsonb not null,
  metrics jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists workout_logs_user_id_idx
  on public.workout_logs (user_id);

create index if not exists workout_logs_user_completed_idx
  on public.workout_logs (user_id, completed_at desc);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute procedure public.set_current_timestamp_updated_at();

drop trigger if exists set_workout_logs_updated_at on public.workout_logs;
create trigger set_workout_logs_updated_at
before update on public.workout_logs
for each row
execute procedure public.set_current_timestamp_updated_at();

alter table public.profiles enable row level security;
alter table public.workout_logs enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "workout_logs_select_own" on public.workout_logs;
create policy "workout_logs_select_own"
on public.workout_logs
for select
using (auth.uid() = user_id);

drop policy if exists "workout_logs_insert_own" on public.workout_logs;
create policy "workout_logs_insert_own"
on public.workout_logs
for insert
with check (auth.uid() = user_id);

drop policy if exists "workout_logs_update_own" on public.workout_logs;
create policy "workout_logs_update_own"
on public.workout_logs
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
