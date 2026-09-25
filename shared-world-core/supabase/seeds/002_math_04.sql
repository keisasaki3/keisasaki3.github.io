-- Life Quest math seed chunk 4/4
-- 5 fields / 51 topics

begin;

insert into public.quest_fields (field_id, subject_id, name, sort_order, active) values
  ('math-limits', 'math', '極限', 160, true),
  ('math-differentiation', 'math', '微分', 170, true),
  ('math-integration', 'math', '積分', 180, true),
  ('math-sets-logic-proofs', 'math', '集合・論理・証明', 190, true),
  ('math-mathematical-expression-applications', 'math', '数学的表現・活用', 200, true)
on conflict (field_id) do update set
  subject_id = excluded.subject_id,
  name = excluded.name,
  sort_order = excluded.sort_order,
  active = excluded.active;

insert into public.quest_topics (topic_id, field_id, name, source, importance, recommended_order, active) values
  ('math-limits-001', 'math-limits', '数列の極限', '高校 数学III', 2, 10, true),
  ('math-limits-002', 'math-limits', '無限等比数列・無限等比級数', '高校 数学III', 2, 20, true),
  ('math-limits-003', 'math-limits', '関数の極限', '高校 数学III', 2, 30, true),
  ('math-limits-004', 'math-limits', '無限大での関数の振る舞い', '高校 数学III', 2, 40, true),
  ('math-limits-005', 'math-limits', '関数の連続性', '高校 数学III', 2, 50, true),
  ('math-differentiation-001', 'math-differentiation', '平均変化率', '高校 数学II', 2, 10, true),
  ('math-differentiation-002', 'math-differentiation', '微分係数と接線', '高校 数学II', 2, 20, true),
  ('math-differentiation-003', 'math-differentiation', '導関数', '高校 数学II', 2, 30, true),
  ('math-differentiation-004', 'math-differentiation', '多項式関数の微分', '高校 数学II', 2, 40, true),
  ('math-differentiation-005', 'math-differentiation', '導関数と増減', '高校 数学II', 2, 50, true),
  ('math-differentiation-006', 'math-differentiation', '極大・極小', '高校 数学II', 2, 60, true),
  ('math-differentiation-007', 'math-differentiation', '微分によるグラフの考察', '高校 数学II', 2, 70, true),
  ('math-differentiation-008', 'math-differentiation', '積・商の微分', '高校 数学III', 2, 80, true),
  ('math-differentiation-009', 'math-differentiation', '合成関数の微分', '高校 数学III', 2, 90, true),
  ('math-differentiation-010', 'math-differentiation', '逆関数の微分', '高校 数学III', 2, 100, true),
  ('math-differentiation-011', 'math-differentiation', '三角関数の微分', '高校 数学III', 2, 110, true),
  ('math-differentiation-012', 'math-differentiation', '指数関数・対数関数の微分', '高校 数学III', 2, 120, true),
  ('math-differentiation-013', 'math-differentiation', '高次導関数', '高校 数学III', 2, 130, true),
  ('math-differentiation-014', 'math-differentiation', '第二次導関数と凹凸・変曲点', '高校 数学III', 2, 140, true),
  ('math-differentiation-015', 'math-differentiation', '微分と速度・加速度', '高校 数学III', 2, 150, true),
  ('math-differentiation-016', 'math-differentiation', '微分の応用と最大・最小', '高校 数学III', 2, 160, true),
  ('math-integration-001', 'math-integration', '不定積分', '高校 数学II', 2, 10, true),
  ('math-integration-002', 'math-integration', '定積分', '高校 数学II', 2, 20, true),
  ('math-integration-003', 'math-integration', '微分と積分の関係', '高校 数学II', 2, 30, true),
  ('math-integration-004', 'math-integration', '定積分と面積', '高校 数学II', 2, 40, true),
  ('math-integration-005', 'math-integration', '置換積分法', '高校 数学III', 2, 50, true),
  ('math-integration-006', 'math-integration', '部分積分法', '高校 数学III', 2, 60, true),
  ('math-integration-007', 'math-integration', '三角関数の積分', '高校 数学III', 2, 70, true),
  ('math-integration-008', 'math-integration', '指数関数・対数関数の積分', '高校 数学III', 2, 80, true),
  ('math-integration-009', 'math-integration', '分数関数・無理関数の積分', '高校 数学III', 2, 90, true),
  ('math-integration-010', 'math-integration', '曲線で囲まれた面積', '高校 数学III', 2, 100, true),
  ('math-integration-011', 'math-integration', '回転体などの体積', '高校 数学III', 2, 110, true),
  ('math-integration-012', 'math-integration', '積分と道のり', '高校 数学III', 2, 120, true),
  ('math-integration-013', 'math-integration', '曲線の長さ', '高校 数学III', 2, 130, true),
  ('math-sets-logic-proofs-001', 'math-sets-logic-proofs', '集合と要素', '高校 数学I', 2, 10, true),
  ('math-sets-logic-proofs-002', 'math-sets-logic-proofs', '部分集合', '高校 数学I', 2, 20, true),
  ('math-sets-logic-proofs-003', 'math-sets-logic-proofs', '集合の和・共通部分・補集合', '高校 数学I', 2, 30, true),
  ('math-sets-logic-proofs-004', 'math-sets-logic-proofs', '命題と真偽', '高校 数学I', 2, 40, true),
  ('math-sets-logic-proofs-005', 'math-sets-logic-proofs', '必要条件・十分条件', '高校 数学I', 2, 50, true),
  ('math-sets-logic-proofs-006', 'math-sets-logic-proofs', '逆・裏・対偶', '高校 数学I', 2, 60, true),
  ('math-sets-logic-proofs-007', 'math-sets-logic-proofs', '反例', '高校 数学I', 2, 70, true),
  ('math-sets-logic-proofs-008', 'math-sets-logic-proofs', '対偶を用いた証明・背理法', '高校 数学I', 2, 80, true),
  ('math-mathematical-expression-applications-001', 'math-mathematical-expression-applications', '数学と人間の活動', '高校 数学A・B・C', 2, 10, true),
  ('math-mathematical-expression-applications-002', 'math-mathematical-expression-applications', '数学を用いた社会生活の問題解決', '高校 数学A・B・C', 2, 20, true),
  ('math-mathematical-expression-applications-003', 'math-mathematical-expression-applications', '数学的モデル化', '高校 数学A・B・C', 2, 30, true),
  ('math-mathematical-expression-applications-004', 'math-mathematical-expression-applications', '図・表・グラフの選択と表現', '高校 数学A・B・C', 2, 40, true),
  ('math-mathematical-expression-applications-005', 'math-mathematical-expression-applications', '離散グラフとネットワーク', '高校 数学A・B・C', 2, 50, true),
  ('math-mathematical-expression-applications-006', 'math-mathematical-expression-applications', '行列という表現', '高校 数学A・B・C', 2, 60, true),
  ('math-mathematical-expression-applications-007', 'math-mathematical-expression-applications', '行列の基本演算', '高校 数学A・B・C', 2, 70, true),
  ('math-mathematical-expression-applications-008', 'math-mathematical-expression-applications', '行列による変換の表現', '高校 数学A・B・C', 2, 80, true),
  ('math-mathematical-expression-applications-009', 'math-mathematical-expression-applications', 'コンピュータを用いた数学的探究', '高校 数学A・B・C', 2, 90, true)
on conflict (topic_id) do update set
  field_id = excluded.field_id,
  name = excluded.name,
  source = excluded.source,
  importance = excluded.importance,
  recommended_order = excluded.recommended_order,
  active = excluded.active;

commit;
