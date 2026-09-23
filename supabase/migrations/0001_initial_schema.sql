-- SabKhooneh initial database schema.
-- Apply with the Supabase CLI or paste into the Supabase SQL editor.

create table if not exists public.rooms (
  room_id text primary key,
  room_number text,
  room_name text not null,
  invited_emails text[] not null default '{}',
  garbage_days integer not null default 2 check (garbage_days > 0),
  vacuum_days integer not null default 7 check (vacuum_days > 0),
  current_turn_email text,
  created_at timestamptz not null default now()
);

create table if not exists public.users (
  email text primary key check (email = lower(email)),
  name text not null,
  username text,
  role text not null default 'Citizen' check (role in ('Mayor', 'Citizen')),
  room_id text not null references public.rooms(room_id) on delete cascade,
  points integer not null default 100 check (points >= 0),
  completed_count integer not null default 0 check (completed_count >= 0),
  transfer_count integer not null default 0 check (transfer_count >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.whitelists (
  email text not null check (email = lower(email)),
  room_id text not null references public.rooms(room_id) on delete cascade,
  name text,
  created_at timestamptz not null default now(),
  primary key (email, room_id)
);

create table if not exists public.announcements (
  id text primary key,
  room_id text not null references public.rooms(room_id) on delete cascade,
  text text not null check (length(trim(text)) > 0),
  author text not null,
  date text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.cartable_requests (
  id text primary key,
  room_id text not null references public.rooms(room_id) on delete cascade,
  name text not null,
  email text not null check (email = lower(email)),
  type text not null check (type in ('travel', 'extra_task')),
  details text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  date text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.chores_history (
  id text primary key,
  room_id text not null references public.rooms(room_id) on delete cascade,
  name text not null,
  email text not null check (email = lower(email)),
  action text not null,
  type text not null check (type in ('chore', 'travel', 'extra_task', 'system', 'points')),
  date text not null,
  created_at timestamptz not null default now()
);

create index if not exists users_room_id_idx on public.users(room_id);
create index if not exists announcements_room_created_idx on public.announcements(room_id, created_at desc);
create index if not exists requests_room_created_idx on public.cartable_requests(room_id, created_at desc);
create index if not exists history_room_created_idx on public.chores_history(room_id, created_at desc);

-- RLS is deliberately enabled without permissive fallback policies. Apply the
-- follow-up authenticated policies described in docs/SUPABASE_SETUP.md before
-- connecting a public deployment. Until then, the public anon key cannot read
-- or mutate these tables.
alter table public.rooms enable row level security;
alter table public.users enable row level security;
alter table public.whitelists enable row level security;
alter table public.announcements enable row level security;
alter table public.cartable_requests enable row level security;
alter table public.chores_history enable row level security;
