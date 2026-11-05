-- SUPER歴史ノベル: 部屋ごとの読み進めた位置（2026-11-05 Keita決定「部屋ごとにステータス保存、ホストの終了でだけ最初から」）。
-- 表には直接触らせず、部屋番号を知っている人だけが関数経由で読み書きする（一覧は取れない）。ログイン不要。
begin;

create table public.history_novel_rooms (
  room text primary key check (room ~ '^[A-Za-z0-9_-]{1,32}$'),
  state jsonb not null check (pg_column_size(state) <= 4000),
  updated_at timestamptz not null default now()
);

revoke all on public.history_novel_rooms from anon, authenticated;
grant all on public.history_novel_rooms to service_role;
alter table public.history_novel_rooms enable row level security;

create or replace function public.hn_room_get(p_room text)
returns jsonb language sql stable security definer set search_path = public as $$
  select state from public.history_novel_rooms where room = p_room;
$$;

create or replace function public.hn_room_set(p_room text, p_state jsonb)
returns void language sql security definer set search_path = public as $$
  insert into public.history_novel_rooms(room, state, updated_at) values (p_room, p_state, now())
  on conflict (room) do update set state = excluded.state, updated_at = now();
$$;

create or replace function public.hn_room_clear(p_room text)
returns void language sql security definer set search_path = public as $$
  delete from public.history_novel_rooms where room = p_room;
$$;

revoke all on function public.hn_room_get(text), public.hn_room_set(text, jsonb), public.hn_room_clear(text) from public;
grant execute on function public.hn_room_get(text), public.hn_room_set(text, jsonb), public.hn_room_clear(text) to anon, authenticated;

commit;
