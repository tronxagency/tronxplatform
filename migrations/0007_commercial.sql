-- Leads pipeline and company P&L.

create table if not exists leads (
  id text primary key,
  org_id text not null references organizations(id) on delete cascade,
  name text not null,
  company text not null default '',
  email text,
  phone text,
  title text not null default '',
  source text not null default 'inbound',
  stage text not null default 'new',
  temperature text not null default 'warm',
  value_inr integer not null default 0,
  score integer not null default 20,
  owner_id text references profiles(id) on delete set null,
  next_follow_up date,
  last_contact_at timestamptz,
  city text,
  website text,
  industry text,
  notes text not null default '',
  lost_reason text,
  converted_project_id text references projects(id) on delete set null,
  created_by text references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists leads_org_stage_idx on leads (org_id, stage);
create index if not exists leads_org_follow_idx on leads (org_id, next_follow_up);
create index if not exists leads_org_owner_idx on leads (org_id, owner_id);

create table if not exists lead_activities (
  id text primary key,
  org_id text not null references organizations(id) on delete cascade,
  lead_id text not null references leads(id) on delete cascade,
  actor_id text references profiles(id) on delete set null,
  kind text not null default 'note',
  body text not null default '',
  next_follow_up date,
  created_at timestamptz not null default now()
);
create index if not exists lead_activities_lead_idx on lead_activities (lead_id, created_at desc);

create table if not exists finance_entries (
  id text primary key,
  org_id text not null references organizations(id) on delete cascade,
  kind text not null,
  category text not null,
  amount_inr integer not null,
  entry_date date not null,
  title text not null,
  notes text not null default '',
  vendor text,
  lead_id text references leads(id) on delete set null,
  project_id text references projects(id) on delete set null,
  status text not null default 'posted',
  created_by text references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists finance_org_date_idx on finance_entries (org_id, entry_date desc);
create index if not exists finance_org_kind_idx on finance_entries (org_id, kind, status);
