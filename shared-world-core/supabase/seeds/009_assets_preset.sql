-- Life Quest preset: 資産（総資産を手入力で記録する）
-- 2026-09-27 Keita依頼。銀行口座との連動はしない（手入力）。
-- migration 005・006 の後に投入する。入力型トピックなので★・Lvには数えない。再実行可能（on conflict）。

begin;

insert into public.quest_subjects (subject_id, name_ja, name_en, icon, sort_order, active, preset_group) values
  ('assets', '資産', 'Assets', '💰', 320, true, null)
on conflict (subject_id) do update set name_ja = excluded.name_ja, name_en = excluded.name_en, icon = excluded.icon, sort_order = excluded.sort_order, active = excluded.active, preset_group = excluded.preset_group;

insert into public.quest_fields (field_id, subject_id, name, name_en, sort_order, active) values
  ('assets-total', 'assets', '総資産', 'Total Assets', 10, true)
on conflict (field_id) do update set subject_id = excluded.subject_id, name = excluded.name, name_en = excluded.name_en, sort_order = excluded.sort_order, active = excluded.active;

insert into public.quest_topics (topic_id, field_id, name, name_en, source, importance, recommended_order, active, input_type, unit) values
  ('assets-total', 'assets-total', '総資産', 'Total assets', null, 2, 10, true, 'number', '万円')
on conflict (topic_id) do update set field_id = excluded.field_id, name = excluded.name, name_en = excluded.name_en, source = excluded.source, importance = excluded.importance, recommended_order = excluded.recommended_order, active = excluded.active, input_type = excluded.input_type, unit = excluded.unit;

commit;
