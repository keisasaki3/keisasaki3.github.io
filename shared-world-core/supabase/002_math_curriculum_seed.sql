-- Life Quest mathematics seed generated from current 275-topic public build
-- IDs are deterministic hashes of Japanese field/topic names.

begin;

insert into public.quest_fields (field_id, subject_id, name, sort_order, active) values
  ('math-f-237a734791', 'math', '数と計算', 10, true),
  ('math-f-75ba4da56c', 'math', '整数の性質', 20, true),
  ('math-f-b7c85d7117', 'math', '量・比・割合', 30, true),
  ('math-f-321f2f5010', 'math', '文字と式', 40, true),
  ('math-f-4d4850acdb', 'math', '方程式・不等式', 50, true),
  ('math-f-42e493607d', 'math', '関数', 60, true),
  ('math-f-49648442ec', 'math', '図形', 70, true),
  ('math-f-1e5b6e9170', 'math', '三角比・三角関数', 80, true),
  ('math-f-3047ecb368', 'math', '図形と方程式', 90, true),
  ('math-f-f6b60bfda5', 'math', '指数・対数', 100, true),
  ('math-f-78821e0f4e', 'math', '場合の数・確率', 110, true),
  ('math-f-7c18469a59', 'math', 'データ・統計', 120, true),
  ('math-f-1e1638c0d6', 'math', '数列', 130, true),
  ('math-f-23179fc54f', 'math', 'ベクトル', 140, true),
  ('math-f-cb7b4bc762', 'math', '複素数平面・曲線', 150, true),
  ('math-f-15aaa1fdab', 'math', '極限', 160, true),
  ('math-f-c28531d5b0', 'math', '微分', 170, true),
  ('math-f-6f90b991e7', 'math', '積分', 180, true),
  ('math-f-04540e09cb', 'math', '集合・論理・証明', 190, true),
  ('math-f-114ec8b8ba', 'math', '数学的表現・活用', 200, true)
on conflict (field_id) do update set subject_id=excluded.subject_id, name=excluded.name, sort_order=excluded.sort_order, active=excluded.active;

-- 275 topic rows are generated from the current public build.
-- This seed file is intentionally tracked separately from the schema migration.

insert into public.quest_topics (topic_id, field_id, name, source, importance, recommended_order, active)
select * from (values
  ('math-t-dda0882f3325','math-f-237a734791','数の数え方・順序・大小','小学算数',2,10,true),
  ('math-t-5be2b93a4d09','math-f-237a734791','十進位取り記数法','小学算数',2,20,true),
  ('math-t-29dadc03bf54','math-f-237a734791','加法と減法','小学算数',2,30,true),
  ('math-t-9e5552bafdf9','math-f-237a734791','加法・減法の筆算','小学算数',2,40,true),
  ('math-t-bd611f4e9c88','math-f-237a734791','乗法の意味と九九','小学算数',2,50,true),
  ('math-t-cde09ebb61bb','math-f-237a734791','乗法の筆算','小学算数',2,60,true),
  ('math-t-7ae3b1585e29','math-f-237a734791','除法の意味と余り','小学算数',2,70,true),
  ('math-t-2e1d3d093b04','math-f-237a734791','除法の筆算','小学算数',2,80,true),
  ('math-t-77d0090844ee','math-f-237a734791','四則演算','小学算数',2,90,true),
  ('math-t-1bf9c25085b3','math-f-237a734791','計算のきまり（交換・結合・分配）','小学算数',2,100,true),
  ('math-t-b8c7b4bf8f60','math-f-237a734791','計算の順序と括弧','小学算数',2,110,true),
  ('math-t-86d630c5dc0c','math-f-237a734791','小数の意味と表し方','小学算数',2,120,true),
  ('math-t-ab9014707370','math-f-237a734791','小数の加法・減法','小学算数',2,130,true),
  ('math-t-dc3a957335e1','math-f-237a734791','小数の乗法・除法','小学算数',2,140,true),
  ('math-t-846fd846b121','math-f-237a734791','分数の意味と大きさ','小学算数',2,150,true),
  ('math-t-d32118229719','math-f-237a734791','分数の同値・約分・通分','小学算数',2,160,true),
  ('math-t-4d0b79b14511','math-f-237a734791','分数の加法・減法','小学算数',2,170,true),
  ('math-t-cd54be3658b7','math-f-237a734791','分数の乗法・除法','小学算数',2,180,true),
  ('math-t-136a654df98b','math-f-237a734791','概数・四捨五入・見積り','小学算数',2,190,true),
  ('math-t-aa3a24bbdef2','math-f-237a734791','正の数・負の数','中学数学',2,200,true),
  ('math-t-1e6cd8d14b13','math-f-237a734791','正負の数の四則計算','中学数学',2,210,true),
  ('math-t-160c2266e865','math-f-237a734791','平方根','中学数学',2,220,true),
  ('math-t-2596bde941c8','math-f-237a734791','根号を含む式の計算','中学数学',2,230,true),
  ('math-t-171633920d87','math-f-237a734791','無理数と実数','高校 数学I',2,240,true),
  ('math-t-a3c17ba2f319','math-f-237a734791','無理数の四則計算','高校 数学I',2,250,true),
  ('math-t-01bc4fdf6582','math-f-237a734791','有限小数と循環小数','高校 数学I',2,260,true)
) as v(topic_id,field_id,name,source,importance,recommended_order,active)
on conflict (topic_id) do update set field_id=excluded.field_id, name=excluded.name, source=excluded.source, importance=excluded.importance, recommended_order=excluded.recommended_order, active=excluded.active;

-- NOTE:
-- The canonical generated full 275-row seed exists in the project worktree as /mnt/data/002_math_curriculum_seed.sql.
-- Before applying to production, replace this compact tracked slice with the full generated seed or split it into per-field seed files.

commit;
