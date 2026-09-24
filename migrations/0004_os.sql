-- Meetings, invitations, project roles, user appearance.

create table if not exists meetings (
  id text primary key,
  org_id text not null references organizations(id) on delete cascade,
  title text not null,
  description text not null default '',
  organizer_id text references profiles(id) on delete set null,
  scope text not null default 'direct',
  department_id text references departments(id) on delete set null,
  team_id text references teams(id) on delete set null,
  project_id text references projects(id) on delete set null,
  task_id text references tasks(id) on delete set null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  meet_url text,
  meet_provider text not null default 'google_meet',
  status text not null default 'scheduled',
  created_at timestamptz not null default now()
);
create index if not exists meetings_org_idx on meetings (org_id, starts_at desc);
create index if not exists meetings_org_status_idx on meetings (org_id, status);

create table if not exists meeting_participants (
  meeting_id text not null references meetings(id) on delete cascade,
  profile_id text not null references profiles(id) on delete cascade,
  role text not null default 'attendee',
  rsvp text not null default 'invited',
  primary key (meeting_id, profile_id)
);
create index if not exists meeting_participants_profile_idx on meeting_participants (profile_id);

create table if not exists invitations (
  id text primary key,
  org_id text not null references organizations(id) on delete cascade,
  profile_id text not null references profiles(id) on delete cascade,
  email text not null,
  token text not null unique,
  invited_by text references profiles(id) on delete set null,
  accepted_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists invitations_token_idx on invitations (token);

alter table project_members add column if not exists role text not null default 'member';

alter table user_preferences add column if not exists theme text not null default 'dark';
alter table user_preferences add column if not exists accent text not null default 'teal';
alter table user_preferences add column if not exists appearance_json text not null default '{}';

alter table calendar_events add column if not exists meeting_id text references meetings(id) on delete set null;
