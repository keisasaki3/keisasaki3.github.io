-- Shared World Core
-- Add explicit online presence state.
-- 2026-09-26

begin;

alter table public.player_presence
  drop constraint if exists player_presence_status_check;

alter table public.player_presence
  alter column status set default 'online';

alter table public.player_presence
  add constraint player_presence_status_check
  check (status in ('online', 'studying', 'reading', 'busy', 'afk'));

commit;
