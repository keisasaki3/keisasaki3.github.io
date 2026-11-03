-- 激突！暗記大戦の札ごとの学習記録。人生クエストのトピックの「習得度」をここから計算する。2026-11-03 Keita依頼。
-- 1行 = 1人 × 1枚の札。正解は1日1回まで数え（correct_days）、定着度 stage は 0〜3（前回から日を空けて正解で+1、不正解で-1）。
-- トピックの習得度は「そのトピックの札の定着度の合計 ÷ (3 × 札の枚数)」で、札の枚数は暗記大戦の data/topics.json から読む（保存値にしない）。
-- しばらく正解していない札の定着度の目減りは、アプリ側で last_correct_on から計算する（保存値は変えない）。
--
-- 新しい表の追加だけ。既存の表・データ・夏の果ては変わらない。

begin;

create table public.quest_card_progress (
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  card_key text not null check (length(card_key) between 1 and 200),
  topic_id text references public.quest_topics(topic_id),
  correct_days integer not null default 0 check (correct_days >= 0),
  stage smallint not null default 0 check (stage between 0 and 3),
  last_correct_on date,
  last_wrong_on date,
  last_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, card_key)
);

create index quest_card_progress_user_topic_idx on public.quest_card_progress(user_id, topic_id);
create index quest_card_progress_topic_idx on public.quest_card_progress(topic_id);

create trigger set_quest_card_progress_updated_at before update on public.quest_card_progress
for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.quest_card_progress to authenticated;
grant all on public.quest_card_progress to service_role;

alter table public.quest_card_progress enable row level security;

create policy quest_card_progress_own on public.quest_card_progress for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

commit;

-- 暗記大戦の「資料がおかしい」報告。ログインしていなくても送れる（書き込みだけ。読むのは管理側 service_role だけ）。2026-11-03 Keita依頼。
begin;

create table public.quest_card_reports (
  report_id bigint generated always as identity primary key,
  card_key text not null check (length(card_key) between 1 and 200),
  comment text not null check (length(btrim(comment)) between 1 and 300),
  app text not null default 'anki-taisen' check (length(app) <= 40),
  user_id uuid default auth.uid() references public.profiles(user_id) on delete set null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create index quest_card_reports_open_idx on public.quest_card_reports(resolved, created_at);
create index quest_card_reports_user_idx on public.quest_card_reports(user_id);

grant insert on public.quest_card_reports to anon, authenticated;
grant all on public.quest_card_reports to service_role;

alter table public.quest_card_reports enable row level security;

create policy quest_card_reports_insert on public.quest_card_reports for insert to anon, authenticated
with check (resolved = false and (user_id is null or user_id = (select auth.uid())));

commit;
