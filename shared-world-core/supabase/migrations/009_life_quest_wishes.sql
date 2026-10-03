-- Life Quest: 学びたい（次に学びたいことのリスト）。2026-10-03 Keita依頼。
-- モチベは★1〜3。リソースは複数行の自由入力（URLはアプリ側で自動リンク）。「学んだ」で learned = true。完了日は持たない。
--
-- 新しい表の追加だけ。既存の表・データ・夏の果ては変わらない。

begin;

create table public.quest_wishes (
  wish_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  title text not null check (length(btrim(title)) between 1 and 100),
  motivation smallint not null default 2 check (motivation between 1 and 3),
  resources text check (resources is null or length(resources) <= 2000),
  learned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index quest_wishes_user_idx on public.quest_wishes(user_id);

create trigger set_quest_wishes_updated_at before update on public.quest_wishes
for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.quest_wishes to authenticated;
grant all on public.quest_wishes to service_role;

alter table public.quest_wishes enable row level security;

create policy quest_wishes_own on public.quest_wishes for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

commit;
