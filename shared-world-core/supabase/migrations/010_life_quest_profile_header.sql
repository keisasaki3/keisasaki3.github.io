-- Life Quest: ステータス画面のプレイヤー窓（サムネ・ジョブ名）。2026-10-03 Keita依頼。
-- ジョブ名は自由入力12文字。サムネは本人だけが読み書きできる非公開バケットに
-- "{user_id}/avatar" の1ファイルで置く（端末で128pxに縮小してから上げる）。
-- avatar_updated_at はサムネの有無と更新の目印。
--
-- 人生クエスト専用の列とバケットの追加だけ。profiles・既存データ・夏の果ては変わらない。

begin;

alter table public.quest_user_settings
  add column job_name text check (job_name is null or length(job_name) <= 12),
  add column avatar_updated_at timestamptz;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('life-quest-avatars', 'life-quest-avatars', false, 262144, array['image/webp', 'image/png', 'image/jpeg']);

create policy life_quest_avatars_own on storage.objects for all to authenticated
using (bucket_id = 'life-quest-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'life-quest-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

commit;
