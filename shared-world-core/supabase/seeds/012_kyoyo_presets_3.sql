-- Life Quest preset: 教養 追加2科目（SUPER暗記大戦の落語・お笑いと対応。2026-11-18 Keita依頼）
-- 形式は 011_kyoyo_presets_2.sql と同じ（科目＝ジャンル、分野＝札のグループ、トピック＝分野と同じid）。再実行可能。
begin;
insert into public.quest_subjects (subject_id, name_ja, name_en, icon, sort_order, active, preset_group) values
  ('kyo-rakugo', '落語', 'Rakugo', '🎭', 470, true, '教養'),
  ('kyo-owarai', 'お笑い', 'Comedy', '🎤', 480, true, '教養')
on conflict (subject_id) do update set name_ja = excluded.name_ja, name_en = excluded.name_en, icon = excluded.icon, sort_order = excluded.sort_order, active = excluded.active, preset_group = excluded.preset_group;
insert into public.quest_fields (field_id, subject_id, name, name_en, sort_order, active) values
  ('kyo-rakugo-01', 'kyo-rakugo', '寄席としくみ', 'Yose & system', 10, true),
  ('kyo-rakugo-02', 'kyo-rakugo', '演目', 'Repertoire', 20, true),
  ('kyo-rakugo-03', 'kyo-rakugo', '噺家', 'Performers', 30, true),
  ('kyo-rakugo-04', 'kyo-rakugo', '用語と型', 'Terms & forms', 40, true),
  ('kyo-owarai-01', 'kyo-owarai', '芸の形', 'Forms', 10, true),
  ('kyo-owarai-02', 'kyo-owarai', '笑いの技法', 'Techniques', 20, true),
  ('kyo-owarai-03', 'kyo-owarai', '賞レース', 'Contests', 30, true),
  ('kyo-owarai-04', 'kyo-owarai', '芸人と番組', 'Comedians & shows', 40, true)
on conflict (field_id) do update set subject_id = excluded.subject_id, name = excluded.name, name_en = excluded.name_en, sort_order = excluded.sort_order, active = excluded.active;
insert into public.quest_topics (topic_id, field_id, name, name_en, source, importance, recommended_order, active, input_type, unit) values
  ('kyo-rakugo-01', 'kyo-rakugo-01', '寄席としくみ', 'Yose & system', 'SUPER暗記大戦 落語', 2, 10, true, 'check', null),
  ('kyo-rakugo-02', 'kyo-rakugo-02', '演目', 'Repertoire', 'SUPER暗記大戦 落語', 2, 10, true, 'check', null),
  ('kyo-rakugo-03', 'kyo-rakugo-03', '噺家', 'Performers', 'SUPER暗記大戦 落語', 2, 10, true, 'check', null),
  ('kyo-rakugo-04', 'kyo-rakugo-04', '用語と型', 'Terms & forms', 'SUPER暗記大戦 落語', 2, 10, true, 'check', null),
  ('kyo-owarai-01', 'kyo-owarai-01', '芸の形', 'Forms', 'SUPER暗記大戦 お笑い', 2, 10, true, 'check', null),
  ('kyo-owarai-02', 'kyo-owarai-02', '笑いの技法', 'Techniques', 'SUPER暗記大戦 お笑い', 2, 10, true, 'check', null),
  ('kyo-owarai-03', 'kyo-owarai-03', '賞レース', 'Contests', 'SUPER暗記大戦 お笑い', 2, 10, true, 'check', null),
  ('kyo-owarai-04', 'kyo-owarai-04', '芸人と番組', 'Comedians & shows', 'SUPER暗記大戦 お笑い', 2, 10, true, 'check', null)
on conflict (topic_id) do update set field_id = excluded.field_id, name = excluded.name, name_en = excluded.name_en, source = excluded.source, importance = excluded.importance, recommended_order = excluded.recommended_order, active = excluded.active, input_type = excluded.input_type, unit = excluded.unit;
commit;
