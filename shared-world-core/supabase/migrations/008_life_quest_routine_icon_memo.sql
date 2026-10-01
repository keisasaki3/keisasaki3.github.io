-- Life Quest: 日課にアイコンと一言メモ。2026-10-02 Keita依頼。
-- アイコンはアプリ側の決まった一覧（routine-ui.js の ROUTINE_ICONS）のキー。色はアイコンごとに固定で、保存しない。
-- 列の追加だけ。既存の日課はアイコン 'other'（🌱）・メモなしになる。

begin;

alter table public.quest_routines
  add column icon text not null default 'other' check (icon ~ '^[a-z]{1,20}$'),
  add column memo text check (memo is null or length(btrim(memo)) between 1 and 80);

commit;
