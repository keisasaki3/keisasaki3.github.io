-- Life Quest: JUST DO IT!（旧 学びたい、quest_wishes）を優先度の中でドラッグで並べ替えられるようにする。2026-11-01 Keita依頼。
-- sort_order 列を足し、既存の行は今の表示順（優先度ごと・作った順）で10刻みに振る。
-- 列の追加と既存行への値の設定だけ。他の表・夏の果ては変わらない。

begin;

alter table public.quest_wishes add column sort_order integer;

update public.quest_wishes w
set sort_order = o.rn * 10
from (
  select wish_id, row_number() over (partition by user_id, motivation order by created_at, wish_id) as rn
  from public.quest_wishes
) o
where w.wish_id = o.wish_id;

commit;
