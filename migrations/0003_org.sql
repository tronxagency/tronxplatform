-- Organization structure, employee records, announcements.

create table if not exists departments (
  id text primary key,
  org_id text not null references organizations(id) on delete cascade,
  name text not null,
  description text not null default '',
  head_id text references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists departments_org_idx on departments (org_id);

alter table teams add column if not exists department_id text references departments(id) on delete set null;

alter table profiles add column if not exists employee_code text;
alter table profiles add column if not exists phone text;
alter table profiles add column if not exists gender text;
alter table profiles add column if not exists dob date;
alter table profiles add column if not exists emergency_contact text;
alter table profiles add column if not exists employment_type text not null default 'full_time';
alter table profiles add column if not exists location text;
alter table profiles add column if not exists work_email text;
alter table profiles add column if not exists username text;
alter table profiles add column if not exists bio text not null default '';
alter table profiles add column if not exists skills text not null default '';
alter table profiles add column if not exists notes text not null default '';
alter table profiles add column if not exists manager_id text references profiles(id) on delete set null;
alter table profiles add column if not exists team_lead_id text references profiles(id) on delete set null;
alter table profiles add column if not exists department_id text references departments(id) on delete set null;
alter table profiles add column if not exists team_id text references teams(id) on delete set null;
alter table profiles add column if not exists joining_date date;
alter table profiles add column if not exists invited_by text references profiles(id) on delete set null;

create unique index if not exists profiles_org_code_uidx on profiles (org_id, employee_code) where employee_code is not null;

alter table channels add column if not exists department_id text references departments(id) on delete cascade;

create table if not exists announcements (
  id text primary key,
  org_id text not null references organizations(id) on delete cascade,
  author_id text references profiles(id) on delete set null,
  title text not null,
  body text not null default '',
  scope text not null default 'company',
  department_id text references departments(id) on delete cascade,
  team_id text references teams(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists announcements_org_idx on announcements (org_id, created_at desc);

alter table organizations add column if not exists timezone text not null default 'UTC';
