-- Life Quest preset: 教養 追加3科目（SUPER暗記大戦のファッション・インテリア・カラーコーディネーターと対応。2026-11-24 Keita承認）
-- 形式は 012_kyoyo_presets_3.sql と同じ（科目＝ジャンル、分野＝札のトピック g、トピック＝分野と同じid）。再実行可能。
begin;
insert into public.quest_subjects (subject_id, name_ja, name_en, icon, sort_order, active, preset_group) values
  ('kyo-fashion', 'ファッション', 'Fashion', '👗', 500, true, '教養'),
  ('kyo-interior', 'インテリア', 'Interior design', '🛋️', 510, true, '教養'),
  ('kyo-color', 'カラーコーディネーター', 'Color coordination', '🎨', 520, true, '教養')
on conflict (subject_id) do update set name_ja = excluded.name_ja, name_en = excluded.name_en, icon = excluded.icon, sort_order = excluded.sort_order, active = excluded.active, preset_group = excluded.preset_group;
insert into public.quest_fields (field_id, subject_id, name, name_en, sort_order, active) values
  ('kyo-fashion-01', 'kyo-fashion', '服のアイテム', 'Garments', 10, true),
  ('kyo-fashion-02', 'kyo-fashion', '柄', 'Patterns', 20, true),
  ('kyo-fashion-03', 'kyo-fashion', '素材', 'Materials', 30, true),
  ('kyo-fashion-04', 'kyo-fashion', 'スーツと礼装', 'Suits & formalwear', 40, true),
  ('kyo-fashion-05', 'kyo-fashion', '紳士靴', 'Men''s shoes', 50, true),
  ('kyo-fashion-06', 'kyo-fashion', '着こなしとドレスコード', 'Styling & dress codes', 60, true),
  ('kyo-fashion-07', 'kyo-fashion', 'デザイナー', 'Designers', 70, true),
  ('kyo-fashion-08', 'kyo-fashion', '業界のしくみ', 'The fashion business', 80, true),
  ('kyo-interior-01', 'kyo-interior', '様式', 'Styles', 10, true),
  ('kyo-interior-02', 'kyo-interior', '名作家具と照明', 'Design classics', 20, true),
  ('kyo-interior-03', 'kyo-interior', '照明', 'Lighting', 30, true),
  ('kyo-interior-04', 'kyo-interior', '窓まわり', 'Window treatments', 40, true),
  ('kyo-interior-05', 'kyo-interior', '素材と仕上げ', 'Materials & finishes', 50, true),
  ('kyo-interior-06', 'kyo-interior', '間取りと配置', 'Layout & planning', 60, true),
  ('kyo-interior-07', 'kyo-interior', '和の住まい', 'Japanese rooms', 70, true),
  ('kyo-color-01', 'kyo-color', '光と目', 'Light & the eye', 10, true),
  ('kyo-color-02', 'kyo-color', '色の三属性', 'Three attributes of color', 20, true),
  ('kyo-color-03', 'kyo-color', '混色と色の表し方', 'Color mixing & systems', 30, true),
  ('kyo-color-04', 'kyo-color', '色の見え方', 'Color perception', 40, true),
  ('kyo-color-05', 'kyo-color', '色の心理', 'Color psychology', 50, true),
  ('kyo-color-06', 'kyo-color', '配色', 'Color schemes', 60, true),
  ('kyo-color-07', 'kyo-color', '日本の伝統色', 'Traditional Japanese colors', 70, true),
  ('kyo-color-08', 'kyo-color', '西洋の色名', 'Western color names', 80, true),
  ('kyo-color-09', 'kyo-color', '色と社会', 'Color in society', 90, true)
on conflict (field_id) do update set subject_id = excluded.subject_id, name = excluded.name, name_en = excluded.name_en, sort_order = excluded.sort_order, active = excluded.active;
insert into public.quest_topics (topic_id, field_id, name, name_en, source, importance, recommended_order, active, input_type, unit) values
  ('kyo-fashion-01', 'kyo-fashion-01', '服のアイテム', 'Garments', 'SUPER暗記大戦 ファッション', 2, 10, true, 'check', null),
  ('kyo-fashion-02', 'kyo-fashion-02', '柄', 'Patterns', 'SUPER暗記大戦 ファッション', 2, 10, true, 'check', null),
  ('kyo-fashion-03', 'kyo-fashion-03', '素材', 'Materials', 'SUPER暗記大戦 ファッション', 2, 10, true, 'check', null),
  ('kyo-fashion-04', 'kyo-fashion-04', 'スーツと礼装', 'Suits & formalwear', 'SUPER暗記大戦 ファッション', 2, 10, true, 'check', null),
  ('kyo-fashion-05', 'kyo-fashion-05', '紳士靴', 'Men''s shoes', 'SUPER暗記大戦 ファッション', 2, 10, true, 'check', null),
  ('kyo-fashion-06', 'kyo-fashion-06', '着こなしとドレスコード', 'Styling & dress codes', 'SUPER暗記大戦 ファッション', 2, 10, true, 'check', null),
  ('kyo-fashion-07', 'kyo-fashion-07', 'デザイナー', 'Designers', 'SUPER暗記大戦 ファッション', 2, 10, true, 'check', null),
  ('kyo-fashion-08', 'kyo-fashion-08', '業界のしくみ', 'The fashion business', 'SUPER暗記大戦 ファッション', 2, 10, true, 'check', null),
  ('kyo-interior-01', 'kyo-interior-01', '様式', 'Styles', 'SUPER暗記大戦 インテリア', 2, 10, true, 'check', null),
  ('kyo-interior-02', 'kyo-interior-02', '名作家具と照明', 'Design classics', 'SUPER暗記大戦 インテリア', 2, 10, true, 'check', null),
  ('kyo-interior-03', 'kyo-interior-03', '照明', 'Lighting', 'SUPER暗記大戦 インテリア', 2, 10, true, 'check', null),
  ('kyo-interior-04', 'kyo-interior-04', '窓まわり', 'Window treatments', 'SUPER暗記大戦 インテリア', 2, 10, true, 'check', null),
  ('kyo-interior-05', 'kyo-interior-05', '素材と仕上げ', 'Materials & finishes', 'SUPER暗記大戦 インテリア', 2, 10, true, 'check', null),
  ('kyo-interior-06', 'kyo-interior-06', '間取りと配置', 'Layout & planning', 'SUPER暗記大戦 インテリア', 2, 10, true, 'check', null),
  ('kyo-interior-07', 'kyo-interior-07', '和の住まい', 'Japanese rooms', 'SUPER暗記大戦 インテリア', 2, 10, true, 'check', null),
  ('kyo-color-01', 'kyo-color-01', '光と目', 'Light & the eye', 'SUPER暗記大戦 カラーコーディネーター', 2, 10, true, 'check', null),
  ('kyo-color-02', 'kyo-color-02', '色の三属性', 'Three attributes of color', 'SUPER暗記大戦 カラーコーディネーター', 2, 10, true, 'check', null),
  ('kyo-color-03', 'kyo-color-03', '混色と色の表し方', 'Color mixing & systems', 'SUPER暗記大戦 カラーコーディネーター', 2, 10, true, 'check', null),
  ('kyo-color-04', 'kyo-color-04', '色の見え方', 'Color perception', 'SUPER暗記大戦 カラーコーディネーター', 2, 10, true, 'check', null),
  ('kyo-color-05', 'kyo-color-05', '色の心理', 'Color psychology', 'SUPER暗記大戦 カラーコーディネーター', 2, 10, true, 'check', null),
  ('kyo-color-06', 'kyo-color-06', '配色', 'Color schemes', 'SUPER暗記大戦 カラーコーディネーター', 2, 10, true, 'check', null),
  ('kyo-color-07', 'kyo-color-07', '日本の伝統色', 'Traditional Japanese colors', 'SUPER暗記大戦 カラーコーディネーター', 2, 10, true, 'check', null),
  ('kyo-color-08', 'kyo-color-08', '西洋の色名', 'Western color names', 'SUPER暗記大戦 カラーコーディネーター', 2, 10, true, 'check', null),
  ('kyo-color-09', 'kyo-color-09', '色と社会', 'Color in society', 'SUPER暗記大戦 カラーコーディネーター', 2, 10, true, 'check', null)
on conflict (topic_id) do update set field_id = excluded.field_id, name = excluded.name, name_en = excluded.name_en, source = excluded.source, importance = excluded.importance, recommended_order = excluded.recommended_order, active = excluded.active, input_type = excluded.input_type, unit = excluded.unit;
commit;
