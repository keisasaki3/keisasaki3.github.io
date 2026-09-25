-- Shared World Core seed data
-- 2026-09-26

begin;

insert into public.races (
  race_id, name_ja, name_en, sprite_key, visual_scale, move_speed, sort_order, active
) values
  ('teddy', 'テディぐま', 'Teddy Bear', 'teddy', 1.00, 168, 10, true),
  ('ancient-robot', 'いにしえロボット', 'Ancient Robot', 'ancient-robot', 1.00, 176, 20, true),
  ('rabbit-jk', 'うさぎjk', 'Rabbit JK', 'rabbit-jk', 1.00, 168, 30, true)
on conflict (race_id) do update set
  name_ja = excluded.name_ja,
  name_en = excluded.name_en,
  sprite_key = excluded.sprite_key,
  visual_scale = excluded.visual_scale,
  move_speed = excluded.move_speed,
  sort_order = excluded.sort_order,
  active = excluded.active;

insert into public.quest_subjects (
  subject_id, name_ja, name_en, icon, sort_order, active
) values
  ('math', '数学', 'Math', '🔢', 10, true),
  ('physics', '物理学', 'Physics', '⚛️', 20, true),
  ('astronomy', '天文学', 'Astronomy', '🔭', 30, true),
  ('earth-science', '地球科学', 'Earth Science', '🌍', 40, true),
  ('chemistry', '化学', 'Chemistry', '🧪', 50, true),
  ('biology', '生物学', 'Biology', '🧬', 60, true),
  ('computer-science', '計算機科学', 'Computer Science', '💻', 70, true),
  ('architecture', '建築学', 'Architecture', '🏛️', 80, true),
  ('design', 'デザイン学', 'Design', '🎨', 90, true),
  ('agriculture', '農学', 'Agricultural Science', '🌾', 100, true),
  ('medicine', '医学', 'Medicine', '🩺', 110, true),
  ('dentistry', '歯学', 'Dentistry', '🦷', 120, true),
  ('pharmacy', '薬学', 'Pharmacy', '💊', 130, true),
  ('political-science', '政治学', 'Political Science', '🗳️', 140, true),
  ('military-defense', '軍事学・防衛学', 'Military & Defense Studies', '🛡️', 150, true),
  ('law', '法学', 'Law', '⚖️', 160, true),
  ('economics', '経済学', 'Economics', '📈', 170, true),
  ('business-administration', '経営学', 'Business Administration', '💼', 180, true),
  ('sociology', '社会学', 'Sociology', '👥', 190, true),
  ('education', '教育学', 'Education', '🎓', 200, true),
  ('philosophy', '哲学', 'Philosophy', '💭', 210, true),
  ('religious-studies', '宗教学', 'Religious Studies', '🕯️', 220, true),
  ('psychology', '心理学', 'Psychology', '🧠', 230, true),
  ('linguistics-languages', '言語学・語学', 'Linguistics & Languages', '💬', 240, true),
  ('anthropology-archaeology', '人類学・考古学', 'Anthropology & Archaeology', '🏺', 250, true),
  ('history', '歴史学', 'History', '📜', 260, true),
  ('geography', '地理学', 'Geography', '🗺️', 270, true),
  ('literature', '文学', 'Literature', '📖', 280, true),
  ('art', '芸術', 'Art', '🖼️', 290, true)
on conflict (subject_id) do update set
  name_ja = excluded.name_ja,
  name_en = excluded.name_en,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  active = excluded.active;

commit;
