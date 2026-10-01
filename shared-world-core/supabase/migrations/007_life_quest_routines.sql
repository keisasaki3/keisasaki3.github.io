-- Life Quest: 日課。登録した日課を毎日チェックし、一日の結果をGoogleカレンダーへ写す。
-- 2026-10-02 Keita依頼。全部チェック型（目標などは名前に自分で書く）。日付はJST 0時切替。★・Lvとはつなげない。
--
-- 新しい表の追加だけ。既存の表・データ・夏の果ては変わらない。

begin;

-- 日課。weekdays は曜日ビット（日=1, 月=2, 火=4, 水=8, 木=16, 金=32, 土=64。127 = 毎日）。
-- 消してもチェック履歴が残るよう、削除ではなく archived_at を入れる。
create table public.quest_routines (
  routine_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 80),
  weekdays smallint not null default 127 check (weekdays between 1 and 127),
  sort_order integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quest_routines_id_user_unique unique (routine_id, user_id)
);

-- その日にやった日課（行がある = やった）。day はJSTの日付。
create table public.quest_routine_checks (
  routine_id uuid not null,
  user_id uuid not null,
  day date not null,
  checked_at timestamptz not null default now(),
  primary key (routine_id, day),
  foreign key (routine_id, user_id) references public.quest_routines(routine_id, user_id) on delete cascade
);

-- 日課の個人設定。calendar_id = 記録先のGoogleカレンダー（アプリが作った専用カレンダー）。
create table public.quest_routine_settings (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  calendar_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index quest_routines_user_order_idx on public.quest_routines(user_id, sort_order);
create index quest_routine_checks_user_day_idx on public.quest_routine_checks(user_id, day);

create trigger set_quest_routines_updated_at before update on public.quest_routines
for each row execute function public.set_updated_at();
create trigger set_quest_routine_settings_updated_at before update on public.quest_routine_settings
for each row execute function public.set_updated_at();

-- =========================================================
-- Grants / RLS: すべて本人の行のみ
-- =========================================================

grant select, insert, update, delete on
  public.quest_routines, public.quest_routine_checks, public.quest_routine_settings
to authenticated;

grant all on
  public.quest_routines, public.quest_routine_checks, public.quest_routine_settings
to service_role;

alter table public.quest_routines enable row level security;
alter table public.quest_routine_checks enable row level security;
alter table public.quest_routine_settings enable row level security;

create policy quest_routines_own on public.quest_routines for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy quest_routine_checks_own on public.quest_routine_checks for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy quest_routine_settings_own on public.quest_routine_settings for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

commit;
