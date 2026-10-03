-- Life Quest: プレイヤー窓の新ヘッダー（サムネ・ジョブ名）。2026-10-03 Keita決定（IDEAS §10）。
-- quest_user_settings に列を2つ足し、サムネ画像用の Storage バケット（非公開、本人のフォルダのみ読み書き）を作る。
-- 既存の行・データ・夏の果ては変わらない（足す列はどちらも null 可）。

begin;

alter table public.quest_user_settings
  add column job_name text check (job_name is null or char_length(job_name) <= 12),
  add column avatar_updated_at timestamptz;

-- サムネは <user_id>/avatar.jpg に1枚だけ置く（端末で128pxに縮小したJPEG）
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('quest-avatars', 'quest-avatars', false, 262144, array['image/jpeg'])
on conflict (id) do nothing;

create policy quest_avatars_own_select on storage.objects for select to authenticated
using (bucket_id = 'quest-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy quest_avatars_own_insert on storage.objects for insert to authenticated
with check (bucket_id = 'quest-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy quest_avatars_own_update on storage.objects for update to authenticated
using (bucket_id = 'quest-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'quest-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy quest_avatars_own_delete on storage.objects for delete to authenticated
using (bucket_id = 'quest-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

commit;
