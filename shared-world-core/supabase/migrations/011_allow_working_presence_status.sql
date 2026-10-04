-- Shared World Core
-- Add the working (作業中) presence status used by 午後三時、夏の果て β0.60.
-- 2026-09-28: applied to production directly with Keita's OK (not recorded in the
-- Supabase migration history). This file records it in Git; re-running is harmless.

begin;

alter table public.player_presence
  drop constraint if exists player_presence_status_check;

alter table public.player_presence
  add constraint player_presence_status_check
  check (status in ('online', 'studying', 'reading', 'busy', 'afk', 'working'));

commit;
