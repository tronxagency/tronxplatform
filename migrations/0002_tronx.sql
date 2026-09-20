create table if not exists organizations (
  id text primary key,
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id text primary key,
  org_id text not null references organizations(id) on delete cascade,
  user_id text,
  email text,
  display_name text not null,
  title text not null default 'Member',
  role text not null default 'employee',
  status text not null default 'active',
  avatar_key text not null default 'slate',
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists profiles_user_id_uidx on profiles (user_id) where user_id is not null;
create index if not exists profiles_org_idx on profiles (org_id);

create table if not exists teams (
  id text primary key,
  org_id text not null references organizations(id) on delete cascade,
  name text not null,
  description text not null default '',
  lead_id text references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists teams_org_idx on teams (org_id);

create table if not exists team_members (
  team_id text not null references teams(id) on delete cascade,
  profile_id text not null references profiles(id) on delete cascade,
  primary key (team_id, profile_id)
);

create table if not exists projects (
  id text primary key,
  org_id text not null references organizations(id) on delete cascade,
  name text not null,
  description text not null default '',
  owner_id text references profiles(id) on delete set null,
  team_id text references teams(id) on delete set null,
  status text not null default 'active',
  priority text not null default 'medium',
  start_date date,
  due_date date,
  color_key text not null default 'mist',
  created_at timestamptz not null default now()
);
create index if not exists projects_org_idx on projects (org_id);

create table if not exists project_members (
  project_id text not null references projects(id) on delete cascade,
  profile_id text not null references profiles(id) on delete cascade,
  primary key (project_id, profile_id)
);

create table if not exists milestones (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  title text not null,
  due_date date,
  status text not null default 'open'
);

create table if not exists tasks (
  id text primary key,
  org_id text not null references organizations(id) on delete cascade,
  project_id text references projects(id) on delete set null,
  parent_id text references tasks(id) on delete cascade,
  title text not null,
  description text not null default '',
  creator_id text references profiles(id) on delete set null,
  assignee_id text references profiles(id) on delete set null,
  team_id text references teams(id) on delete set null,
  status text not null default 'todo',
  priority text not null default 'medium',
  start_date date,
  due_date date,
  estimated_minutes integer not null default 0,
  actual_minutes integer not null default 0,
  blocked boolean not null default false,
  blocked_reason text not null default '',
  tags text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tasks_org_idx on tasks (org_id);
create index if not exists tasks_project_idx on tasks (project_id);
create index if not exists tasks_assignee_idx on tasks (assignee_id);
create index if not exists tasks_status_idx on tasks (org_id, status);

create table if not exists task_dependencies (
  task_id text not null references tasks(id) on delete cascade,
  depends_on_id text not null references tasks(id) on delete cascade,
  primary key (task_id, depends_on_id)
);

create table if not exists checklist_items (
  id text primary key,
  task_id text not null references tasks(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  position integer not null default 0
);

create table if not exists comments (
  id text primary key,
  org_id text not null references organizations(id) on delete cascade,
  task_id text not null references tasks(id) on delete cascade,
  author_id text references profiles(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists comments_task_idx on comments (task_id);

create table if not exists channels (
  id text primary key,
  org_id text not null references organizations(id) on delete cascade,
  type text not null,
  name text not null,
  project_id text references projects(id) on delete cascade,
  team_id text references teams(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists channels_org_idx on channels (org_id);

create table if not exists channel_members (
  channel_id text not null references channels(id) on delete cascade,
  profile_id text not null references profiles(id) on delete cascade,
  last_read_at timestamptz,
  primary key (channel_id, profile_id)
);

create table if not exists messages (
  id text primary key,
  channel_id text not null references channels(id) on delete cascade,
  author_id text references profiles(id) on delete set null,
  body text not null,
  parent_id text references messages(id) on delete cascade,
  created_at timestamptz not null default now(),
  edited_at timestamptz
);
create index if not exists messages_channel_idx on messages (channel_id, created_at);

create table if not exists message_reactions (
  message_id text not null references messages(id) on delete cascade,
  profile_id text not null references profiles(id) on delete cascade,
  emoji text not null,
  primary key (message_id, profile_id, emoji)
);

create table if not exists attachments (
  id text primary key,
  org_id text not null references organizations(id) on delete cascade,
  name text not null,
  mime text not null default 'application/octet-stream',
  size_bytes integer not null default 0,
  project_id text references projects(id) on delete set null,
  task_id text references tasks(id) on delete set null,
  message_id text references messages(id) on delete set null,
  uploaded_by text references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id text primary key,
  org_id text not null references organizations(id) on delete cascade,
  profile_id text not null references profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null default '',
  href text not null default '',
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_profile_idx on notifications (profile_id, created_at desc);

create table if not exists time_entries (
  id text primary key,
  org_id text not null references organizations(id) on delete cascade,
  profile_id text not null references profiles(id) on delete cascade,
  task_id text references tasks(id) on delete set null,
  started_at timestamptz not null,
  ended_at timestamptz,
  minutes integer not null default 0,
  note text not null default ''
);
create index if not exists time_entries_profile_idx on time_entries (profile_id, started_at desc);

create table if not exists calendar_events (
  id text primary key,
  org_id text not null references organizations(id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  type text not null default 'meeting',
  project_id text references projects(id) on delete set null,
  created_by text references profiles(id) on delete set null
);

create table if not exists activity_logs (
  id text primary key,
  org_id text not null references organizations(id) on delete cascade,
  actor_id text references profiles(id) on delete set null,
  entity_type text not null,
  entity_id text not null,
  action text not null,
  summary text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists activity_logs_org_idx on activity_logs (org_id, created_at desc);

create table if not exists audit_logs (
  id text primary key,
  org_id text not null references organizations(id) on delete cascade,
  actor_id text references profiles(id) on delete set null,
  action text not null,
  target_type text not null default '',
  target_id text not null default '',
  summary text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_org_idx on audit_logs (org_id, created_at desc);

create table if not exists user_preferences (
  profile_id text primary key references profiles(id) on delete cascade,
  sidebar_collapsed boolean not null default false,
  density text not null default 'comfortable'
);
