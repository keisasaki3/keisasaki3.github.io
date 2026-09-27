-- 分野・トピックの英語名（日英併記）。2026-09-27 Keita依頼。
-- 列の追加だけで既存データ・RLS・夏の果ては変わらない。英語名が無い行は日本語だけ表示する。
-- プリセットの英語名は seeds/008_field_topic_name_en.sql で入れる。

begin;

alter table public.quest_fields add column if not exists name_en text;
alter table public.quest_topics add column if not exists name_en text;

alter table public.quest_user_fields add column if not exists name_en text
  check (name_en is null or length(btrim(name_en)) between 1 and 60);
alter table public.quest_user_topics add column if not exists name_en text
  check (name_en is null or length(btrim(name_en)) between 1 and 120);

commit;
