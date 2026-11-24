-- Life Quest preset: 教養 東京地理（SUPER暗記大戦の東京地理と対応。2026-11-24 Keita依頼）
-- 形式は 012_kyoyo_presets_3.sql と同じ（科目＝ジャンル、分野＝札のグループ、トピック＝分野と同じid）。再実行可能。
-- 本番への適用は Keita の了承後。
begin;
insert into public.quest_subjects (subject_id, name_ja, name_en, icon, sort_order, active, preset_group) values
  ('kyo-tokyo', '東京地理', 'Tokyo geography', '🗼', 490, true, '教養')
on conflict (subject_id) do update set name_ja = excluded.name_ja, name_en = excluded.name_en, icon = excluded.icon, sort_order = excluded.sort_order, active = excluded.active, preset_group = excluded.preset_group;
insert into public.quest_fields (field_id, subject_id, name, name_en, sort_order, active) values
  ('kyo-tokyo-01', 'kyo-tokyo', '23区', '23 wards', 10, true),
  ('kyo-tokyo-02', 'kyo-tokyo', '多摩と島', 'Tama & islands', 20, true),
  ('kyo-tokyo-03', 'kyo-tokyo', '鉄道と駅', 'Railways & stations', 30, true),
  ('kyo-tokyo-04', 'kyo-tokyo', '川と水辺', 'Rivers & waterside', 40, true),
  ('kyo-tokyo-05', 'kyo-tokyo', '地形と坂', 'Terrain & slopes', 50, true),
  ('kyo-tokyo-06', 'kyo-tokyo', '地名の由来', 'Place-name origins', 60, true),
  ('kyo-tokyo-07', 'kyo-tokyo', '名所', 'Landmarks', 70, true),
  ('kyo-tokyo-08', 'kyo-tokyo', '江戸から東京へ', 'From Edo to Tokyo', 80, true)
on conflict (field_id) do update set subject_id = excluded.subject_id, name = excluded.name, name_en = excluded.name_en, sort_order = excluded.sort_order, active = excluded.active;
insert into public.quest_topics (topic_id, field_id, name, name_en, source, importance, recommended_order, active, input_type, unit) values
  ('kyo-tokyo-01', 'kyo-tokyo-01', '23区', '23 wards', 'SUPER暗記大戦 東京地理', 2, 10, true, 'check', null),
  ('kyo-tokyo-02', 'kyo-tokyo-02', '多摩と島', 'Tama & islands', 'SUPER暗記大戦 東京地理', 2, 10, true, 'check', null),
  ('kyo-tokyo-03', 'kyo-tokyo-03', '鉄道と駅', 'Railways & stations', 'SUPER暗記大戦 東京地理', 2, 10, true, 'check', null),
  ('kyo-tokyo-04', 'kyo-tokyo-04', '川と水辺', 'Rivers & waterside', 'SUPER暗記大戦 東京地理', 2, 10, true, 'check', null),
  ('kyo-tokyo-05', 'kyo-tokyo-05', '地形と坂', 'Terrain & slopes', 'SUPER暗記大戦 東京地理', 2, 10, true, 'check', null),
  ('kyo-tokyo-06', 'kyo-tokyo-06', '地名の由来', 'Place-name origins', 'SUPER暗記大戦 東京地理', 2, 10, true, 'check', null),
  ('kyo-tokyo-07', 'kyo-tokyo-07', '名所', 'Landmarks', 'SUPER暗記大戦 東京地理', 2, 10, true, 'check', null),
  ('kyo-tokyo-08', 'kyo-tokyo-08', '江戸から東京へ', 'From Edo to Tokyo', 'SUPER暗記大戦 東京地理', 2, 10, true, 'check', null)
on conflict (topic_id) do update set field_id = excluded.field_id, name = excluded.name, name_en = excluded.name_en, source = excluded.source, importance = excluded.importance, recommended_order = excluded.recommended_order, active = excluded.active, input_type = excluded.input_type, unit = excluded.unit;
commit;
