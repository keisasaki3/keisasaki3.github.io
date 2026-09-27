-- Shared World Core
-- Life Quest: ステータス（上位単位）をユーザーごとに持つ。
-- プリセット（quest_subjects）を追加して使うか、自分で作る。トピックはチェック型と入力型。
-- 2026-09-27
--
-- 既存データは消さない・書き換えない:
-- profiles / races / player_presence / summer_end_player_state / quest_topic_mastery は変更なし。
-- quest_subjects / quest_topics は列追加のみ（既存行は既定値でこれまでと同じ意味）。

begin;

-- =========================================================
-- プリセット側（共通カタログ）への列追加
-- =========================================================

-- プリセットのまとまり（例: '29学問'）。null = どのまとまりにも属さない単独プリセット。
alter table public.quest_subjects
  add column preset_group text;

update public.quest_subjects
set preset_group = '29学問'
where subject_id in (
  'math', 'physics', 'astronomy', 'earth-science', 'chemistry', 'biology',
  'computer-science', 'architecture', 'design', 'agriculture', 'medicine',
  'dentistry', 'pharmacy', 'political-science', 'military-defense', 'law',
  'economics', 'business-administration', 'sociology', 'education', 'philosophy',
  'religious-studies', 'psychology', 'linguistics-languages',
  'anthropology-archaeology', 'history', 'geography', 'literature', 'art'
);

-- トピックの種類。check = MASTERする（★1）、number = 数値を記録する（握力 kg など）。
alter table public.quest_topics
  add column input_type text not null default 'check',
  add column unit text,
  add constraint quest_topics_input_type_check check (input_type in ('check', 'number'));

-- =========================================================
-- ユーザーごとのデータ
-- =========================================================

-- 人生クエスト個人設定。profiles は夏の果てと共有なので列を足さない。
create table public.quest_user_settings (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  setup_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 自分のステータス一覧。preset_subject_id があればプリセット、なければ自作。
create table public.quest_user_statuses (
  status_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  preset_subject_id text references public.quest_subjects(subject_id) on update cascade on delete restrict,
  name_ja text,
  name_en text,
  icon text,
  sort_order integer not null default 0,
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quest_user_statuses_custom_has_name check (
    preset_subject_id is not null or length(btrim(coalesce(name_ja, ''))) between 1 and 40
  ),
  constraint quest_user_statuses_user_preset_unique unique (user_id, preset_subject_id),
  constraint quest_user_statuses_id_user_unique unique (status_id, user_id)
);

-- 自作の分野（自作ステータスにもプリセットのステータスにも追加できる）
create table public.quest_user_fields (
  field_id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  status_id uuid not null,
  name text not null check (length(btrim(name)) between 1 and 60),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (status_id, user_id) references public.quest_user_statuses(status_id, user_id) on delete cascade,
  constraint quest_user_fields_id_user_unique unique (field_id, user_id)
);

-- 自作のトピック。check型のMASTERは mastered_at（null = 未MASTER）。
create table public.quest_user_topics (
  topic_id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  field_id uuid not null,
  name text not null check (length(btrim(name)) between 1 and 120),
  input_type text not null default 'check' check (input_type in ('check', 'number')),
  unit text,
  sort_order integer not null default 0,
  mastered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (field_id, user_id) references public.quest_user_fields(field_id, user_id) on delete cascade,
  constraint quest_user_topics_id_user_unique unique (topic_id, user_id),
  constraint quest_user_topics_number_not_mastered check (input_type = 'check' or mastered_at is null)
);

-- 入力型トピックの記録履歴（プリセットのトピック / 自作トピックのどちらか一方）
create table public.quest_topic_values (
  value_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  topic_id text references public.quest_topics(topic_id) on update cascade on delete cascade,
  user_topic_id uuid,
  value numeric not null,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  foreign key (user_topic_id, user_id) references public.quest_user_topics(topic_id, user_id) on delete cascade,
  constraint quest_topic_values_one_target check (num_nonnulls(topic_id, user_topic_id) = 1)
);

create index quest_user_statuses_user_order_idx on public.quest_user_statuses(user_id, sort_order);
create index quest_user_statuses_preset_idx on public.quest_user_statuses(preset_subject_id) where preset_subject_id is not null;
create index quest_user_fields_status_idx on public.quest_user_fields(status_id, user_id);
create index quest_user_topics_field_idx on public.quest_user_topics(field_id, user_id);
create index quest_user_topics_user_idx on public.quest_user_topics(user_id);
create index quest_topic_values_user_idx on public.quest_topic_values(user_id, recorded_at desc);
create index quest_topic_values_topic_idx on public.quest_topic_values(topic_id) where topic_id is not null;
create index quest_topic_values_user_topic_idx on public.quest_topic_values(user_topic_id, user_id) where user_topic_id is not null;

create trigger set_quest_user_settings_updated_at before update on public.quest_user_settings
for each row execute function public.set_updated_at();
create trigger set_quest_user_statuses_updated_at before update on public.quest_user_statuses
for each row execute function public.set_updated_at();
create trigger set_quest_user_fields_updated_at before update on public.quest_user_fields
for each row execute function public.set_updated_at();
create trigger set_quest_user_topics_updated_at before update on public.quest_user_topics
for each row execute function public.set_updated_at();

-- =========================================================
-- Grants / RLS: すべて本人の行のみ
-- =========================================================

grant select, insert, update, delete on
  public.quest_user_settings, public.quest_user_statuses, public.quest_user_fields,
  public.quest_user_topics, public.quest_topic_values
to authenticated;

grant all on
  public.quest_user_settings, public.quest_user_statuses, public.quest_user_fields,
  public.quest_user_topics, public.quest_topic_values
to service_role;

alter table public.quest_user_settings enable row level security;
alter table public.quest_user_statuses enable row level security;
alter table public.quest_user_fields enable row level security;
alter table public.quest_user_topics enable row level security;
alter table public.quest_topic_values enable row level security;

create policy quest_user_settings_own on public.quest_user_settings for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy quest_user_statuses_own on public.quest_user_statuses for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy quest_user_fields_own on public.quest_user_fields for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy quest_user_topics_own on public.quest_user_topics for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy quest_topic_values_own on public.quest_topic_values for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- =========================================================
-- 既存アカウントの引き継ぎ（見た目を変えない）
-- 既存profiles全員に、現行の有効な学問をすべてプリセットのステータスとして登録し、
-- 初回セットアップ済みにする。quest_topic_mastery は topic_id のまま使うので移行不要。
-- =========================================================

insert into public.quest_user_statuses (user_id, preset_subject_id, sort_order)
select p.user_id, s.subject_id, s.sort_order
from public.profiles p
cross join public.quest_subjects s
where s.active = true
on conflict (user_id, preset_subject_id) do nothing;

insert into public.quest_user_settings (user_id, setup_completed_at)
select p.user_id, now()
from public.profiles p
on conflict (user_id) do nothing;

commit;
