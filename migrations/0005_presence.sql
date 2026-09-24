-- Typing indicators for chat presence.

create table if not exists channel_typing (
  channel_id text not null references channels(id) on delete cascade,
  profile_id text not null references profiles(id) on delete cascade,
  updated_at timestamptz not null default now(),
  primary key (channel_id, profile_id)
);
create index if not exists channel_typing_updated_idx on channel_typing (channel_id, updated_at desc);
