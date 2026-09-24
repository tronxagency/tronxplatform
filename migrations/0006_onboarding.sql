-- Executive onboarding: first-week desk for founders and executive assistants.

create table if not exists executive_onboardings (
  id text primary key,
  org_id text not null references organizations(id) on delete cascade,
  profile_id text not null references profiles(id) on delete cascade,
  role text not null,
  owner_id text references profiles(id) on delete set null,
  status text not null default 'open',
  started_at timestamptz not null default now(),
  due_at date,
  completed_at timestamptz,
  kickoff_meeting_id text references meetings(id) on delete set null,
  notes text not null default '',
  created_by text references profiles(id) on delete set null
);
create index if not exists exec_onboard_org_idx on executive_onboardings (org_id, status, started_at desc);
create index if not exists exec_onboard_profile_idx on executive_onboardings (org_id, profile_id, status);

create table if not exists onboarding_steps (
  id text primary key,
  onboarding_id text not null references executive_onboardings(id) on delete cascade,
  key text not null,
  title text not null,
  description text not null default '',
  category text not null default 'setup',
  owner_kind text not null default 'desk',
  due_offset_days int not null default 0,
  position int not null default 0,
  done boolean not null default false,
  done_at timestamptz,
  done_by text references profiles(id) on delete set null,
  href text,
  unique (onboarding_id, key)
);
create index if not exists onboarding_steps_board_idx on onboarding_steps (onboarding_id, position);
