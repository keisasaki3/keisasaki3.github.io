-- Shared World Core
-- Initial schema for Life Quest + 午後三時、夏の果。
-- 2026-09-26

begin;

-- =========================================================
-- Shared master / profile
-- =========================================================

create table public.races (
  race_id text primary key,
  name_ja text not null,
  name_en text not null,
  sprite_key text not null unique,
  visual_scale numeric(5,2) not null default 1.00 check (visual_scale > 0),
  move_speed integer not null check (move_speed > 0),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name varchar(20) not null default '名無し',
  race_id text references public.races(race_id) on update cascade on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_nonblank check (length(btrim(display_name)) between 1 and 20)
);

create table public.player_presence (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  status text not null default 'afk',
  status_changed_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint player_presence_status_check check (status in ('studying', 'reading', 'busy', 'afk'))
);

-- =========================================================
-- 午後三時、夏の果。
-- Durable state only. Realtime movement remains authoritative in WS server.
-- =========================================================

create table public.summer_end_player_state (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  map_id text,
  x double precision,
  y double precision,
  direction text,
  updated_at timestamptz not null default now(),
  constraint summer_end_direction_check check (
    direction is null or direction in ('up', 'down', 'left', 'right')
  ),
  constraint summer_end_position_pair_check check (
    (x is null and y is null) or (x is not null and y is not null)
  )
);

-- =========================================================
-- Life Quest curriculum
-- =========================================================

create table public.quest_subjects (
  subject_id text primary key,
  name_ja text not null,
  name_en text not null,
  icon text not null default '',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quest_fields (
  field_id text primary key,
  subject_id text not null references public.quest_subjects(subject_id) on update cascade on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quest_topics (
  topic_id text primary key,
  field_id text not null references public.quest_fields(field_id) on update cascade on delete cascade,
  name text not null,
  source text,
  importance smallint not null default 2 check (importance between 1 and 3),
  recommended_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quest_topic_prerequisites (
  topic_id text not null references public.quest_topics(topic_id) on update cascade on delete cascade,
  prerequisite_topic_id text not null references public.quest_topics(topic_id) on update cascade on delete cascade,
  created_at timestamptz not null default now(),
  primary key (topic_id, prerequisite_topic_id),
  constraint topic_not_own_prerequisite check (topic_id <> prerequisite_topic_id)
);

create table public.quest_topic_mastery (
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  topic_id text not null references public.quest_topics(topic_id) on update cascade on delete cascade,
  mastered_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

-- =========================================================
-- Indexes
-- =========================================================

create index quest_fields_subject_order_idx
  on public.quest_fields(subject_id, sort_order);

create index quest_topics_field_order_idx
  on public.quest_topics(field_id, recommended_order);

create index quest_topic_prerequisites_prereq_idx
  on public.quest_topic_prerequisites(prerequisite_topic_id);

create index quest_topic_mastery_user_idx
  on public.quest_topic_mastery(user_id);

create index summer_end_player_state_map_idx
  on public.summer_end_player_state(map_id)
  where map_id is not null;

-- =========================================================
-- updated_at helper
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_races_updated_at
before update on public.races
for each row execute function public.set_updated_at();

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_player_presence_updated_at
before update on public.player_presence
for each row execute function public.set_updated_at();

create trigger set_summer_end_player_state_updated_at
before update on public.summer_end_player_state
for each row execute function public.set_updated_at();

create trigger set_quest_subjects_updated_at
before update on public.quest_subjects
for each row execute function public.set_updated_at();

create trigger set_quest_fields_updated_at
before update on public.quest_fields
for each row execute function public.set_updated_at();

create trigger set_quest_topics_updated_at
before update on public.quest_topics
for each row execute function public.set_updated_at();

-- =========================================================
-- Create public profile after Auth signup
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate_name text;
begin
  candidate_name := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
    '名無し'
  );

  insert into public.profiles (user_id, display_name)
  values (new.id, left(candidate_name, 20))
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =========================================================
-- Grants
-- =========================================================

grant usage on schema public to anon, authenticated;

grant select on public.races to anon, authenticated;
grant select on public.quest_subjects to anon, authenticated;
grant select on public.quest_fields to anon, authenticated;
grant select on public.quest_topics to anon, authenticated;
grant select on public.quest_topic_prerequisites to anon, authenticated;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.player_presence to authenticated;
grant select, insert, update, delete on public.summer_end_player_state to authenticated;
grant select, insert, update, delete on public.quest_topic_mastery to authenticated;

grant all on public.races to service_role;
grant all on public.profiles to service_role;
grant all on public.player_presence to service_role;
grant all on public.summer_end_player_state to service_role;
grant all on public.quest_subjects to service_role;
grant all on public.quest_fields to service_role;
grant all on public.quest_topics to service_role;
grant all on public.quest_topic_prerequisites to service_role;
grant all on public.quest_topic_mastery to service_role;

-- =========================================================
-- RLS
-- =========================================================

alter table public.races enable row level security;
alter table public.profiles enable row level security;
alter table public.player_presence enable row level security;
alter table public.summer_end_player_state enable row level security;
alter table public.quest_subjects enable row level security;
alter table public.quest_fields enable row level security;
alter table public.quest_topics enable row level security;
alter table public.quest_topic_prerequisites enable row level security;
alter table public.quest_topic_mastery enable row level security;

-- Public/static masters
create policy races_read_active
on public.races for select
to anon, authenticated
using (active = true);

create policy quest_subjects_read_active
on public.quest_subjects for select
to anon, authenticated
using (active = true);

create policy quest_fields_read_active
on public.quest_fields for select
to anon, authenticated
using (active = true);

create policy quest_topics_read_active
on public.quest_topics for select
to anon, authenticated
using (active = true);

create policy quest_topic_prerequisites_read
on public.quest_topic_prerequisites for select
to anon, authenticated
using (true);

-- Shared profile: authenticated players may see display identity/race.
create policy profiles_read_authenticated
on public.profiles for select
to authenticated
using (true);

create policy profiles_insert_own
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy profiles_update_own
on public.profiles for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- Presence is intentionally visible to authenticated players.
create policy player_presence_read_authenticated
on public.player_presence for select
to authenticated
using (true);

create policy player_presence_insert_own
on public.player_presence for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy player_presence_update_own
on public.player_presence for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy player_presence_delete_own
on public.player_presence for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Durable Summer End location is private from other clients.
-- The authoritative game server can use service_role.
create policy summer_end_state_read_own
on public.summer_end_player_state for select
to authenticated
using ((select auth.uid()) = user_id);

create policy summer_end_state_insert_own
on public.summer_end_player_state for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy summer_end_state_update_own
on public.summer_end_player_state for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy summer_end_state_delete_own
on public.summer_end_player_state for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Life Quest mastery is private to the owning player.
create policy quest_mastery_read_own
on public.quest_topic_mastery for select
to authenticated
using ((select auth.uid()) = user_id);

create policy quest_mastery_insert_own
on public.quest_topic_mastery for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy quest_mastery_update_own
on public.quest_topic_mastery for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy quest_mastery_delete_own
on public.quest_topic_mastery for delete
to authenticated
using ((select auth.uid()) = user_id);

commit;
