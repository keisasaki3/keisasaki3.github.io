-- SUPER暗記大戦の設定をアカウントに保存する。まずは「ランダムの範囲」（ランダム・NONSTOP に入れるトピックのチェック）。2026-11-24 Keita依頼「連携してたらアカウント保存にしよう」。
-- 1行 = 1人。random_scope は初期値との差だけを持つ JSON（{"ジャンル|出題範囲|トピック": 1 か 0}）。
--
-- 新しい表の追加だけ。既存の表・データ・夏の果ては変わらない。

begin;

create table public.anki_settings (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  random_scope jsonb not null default '{}'::jsonb check (jsonb_typeof(random_scope) = 'object' and pg_column_size(random_scope) < 65536),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.anki_settings to authenticated;
grant all on public.anki_settings to service_role;

alter table public.anki_settings enable row level security;

create policy anki_settings_own on public.anki_settings for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

commit;
