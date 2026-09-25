-- Prototype topics for non-math subjects carried over from the current Life Quest UI.
-- These are provisional and can be superseded by later curriculum revisions.
begin;

with data as (
  select * from jsonb_to_recordset('[{"subject_id":"physics","topics":["速さ・距離・時間","力と運動","エネルギー保存"]},{"subject_id":"astronomy","topics":["太陽系","恒星の一生","宇宙の膨張"]},{"subject_id":"earth-science","topics":["地球の構造","プレートと地震","大気と海洋の循環"]},{"subject_id":"chemistry","topics":["原子・分子","化学反応式","モルと量的計算"]},{"subject_id":"biology","topics":["細胞の構造","遺伝の仕組み","進化と自然選択"]},{"subject_id":"computer-science","topics":["二進数","条件分岐・繰り返し","データ構造とアルゴリズム"]},{"subject_id":"architecture","topics":["建物の構造の種類","荷重と耐震","空間・構造・環境を合わせた設計"]},{"subject_id":"design","topics":["配色・文字・配置","情報の優先順位","目的に沿った制作と改善"]},{"subject_id":"agriculture","topics":["植物の生育条件","土壌と肥料","栽培管理と病害虫"]},{"subject_id":"medicine","topics":["人体の主要な臓器","臓器の働き","病気が起こる仕組み"]},{"subject_id":"dentistry","topics":["歯と歯周組織","むし歯・歯周病","予防と治療の基本"]},{"subject_id":"pharmacy","topics":["薬の作用と副作用","吸収・分布・代謝・排泄","薬の相互作用"]},{"subject_id":"political-science","topics":["三権分立","選挙と政党","政治体制の比較"]},{"subject_id":"military-defense","topics":["戦略と戦術","兵站の役割","抑止と安全保障"]},{"subject_id":"law","topics":["法律の体系","権利・義務・契約","具体例への法の適用"]},{"subject_id":"economics","topics":["需要と供給","GDP・物価・失業","金融政策と財政政策"]},{"subject_id":"business-administration","topics":["企業の仕組み","戦略・組織・マーケティング","企業事例の分析"]},{"subject_id":"sociology","topics":["規範と役割","集団・制度・格差","社会調査の基本"]},{"subject_id":"education","topics":["学習と発達","教え方と評価","授業の設計"]},{"subject_id":"philosophy","topics":["代表的な哲学的問い","主要な立場の違い","論証の組み立てと批判"]},{"subject_id":"religious-studies","topics":["主要宗教の概要","教義・儀礼・歴史","宗教の比較と社会との関係"]},{"subject_id":"psychology","topics":["記憶・学習・感情","認知・発達・社会心理","実験と研究結果の読み方"]},{"subject_id":"linguistics-languages","topics":["品詞と文の構造","音声・文法・意味","言語間の共通点と違い"]},{"subject_id":"anthropology-archaeology","topics":["文化と遺物","フィールドワークと発掘","資料から暮らしを読み解く"]},{"subject_id":"history","topics":["大まかな時代区分","主要事件の背景とつながり","史料の比較と批判"]},{"subject_id":"geography","topics":["地形と気候","人口・産業・都市","地域の特徴と成立要因"]},{"subject_id":"literature","topics":["ジャンルと表現技法","文学史と代表作品","作品の解釈と批評"]},{"subject_id":"art","topics":["主なジャンルと技法","芸術史と代表作品","作品の形式・背景の分析"]}]'::jsonb)
    as x(subject_id text, topics jsonb)
)
insert into public.quest_fields(field_id,subject_id,name,sort_order,active)
select subject_id || '-prototype', subject_id, '基礎', 10, true from data
on conflict(field_id) do update set
  subject_id=excluded.subject_id,
  name=excluded.name,
  sort_order=excluded.sort_order,
  active=excluded.active;

with data as (
  select * from jsonb_to_recordset('[{"subject_id":"physics","topics":["速さ・距離・時間","力と運動","エネルギー保存"]},{"subject_id":"astronomy","topics":["太陽系","恒星の一生","宇宙の膨張"]},{"subject_id":"earth-science","topics":["地球の構造","プレートと地震","大気と海洋の循環"]},{"subject_id":"chemistry","topics":["原子・分子","化学反応式","モルと量的計算"]},{"subject_id":"biology","topics":["細胞の構造","遺伝の仕組み","進化と自然選択"]},{"subject_id":"computer-science","topics":["二進数","条件分岐・繰り返し","データ構造とアルゴリズム"]},{"subject_id":"architecture","topics":["建物の構造の種類","荷重と耐震","空間・構造・環境を合わせた設計"]},{"subject_id":"design","topics":["配色・文字・配置","情報の優先順位","目的に沿った制作と改善"]},{"subject_id":"agriculture","topics":["植物の生育条件","土壌と肥料","栽培管理と病害虫"]},{"subject_id":"medicine","topics":["人体の主要な臓器","臓器の働き","病気が起こる仕組み"]},{"subject_id":"dentistry","topics":["歯と歯周組織","むし歯・歯周病","予防と治療の基本"]},{"subject_id":"pharmacy","topics":["薬の作用と副作用","吸収・分布・代謝・排泄","薬の相互作用"]},{"subject_id":"political-science","topics":["三権分立","選挙と政党","政治体制の比較"]},{"subject_id":"military-defense","topics":["戦略と戦術","兵站の役割","抑止と安全保障"]},{"subject_id":"law","topics":["法律の体系","権利・義務・契約","具体例への法の適用"]},{"subject_id":"economics","topics":["需要と供給","GDP・物価・失業","金融政策と財政政策"]},{"subject_id":"business-administration","topics":["企業の仕組み","戦略・組織・マーケティング","企業事例の分析"]},{"subject_id":"sociology","topics":["規範と役割","集団・制度・格差","社会調査の基本"]},{"subject_id":"education","topics":["学習と発達","教え方と評価","授業の設計"]},{"subject_id":"philosophy","topics":["代表的な哲学的問い","主要な立場の違い","論証の組み立てと批判"]},{"subject_id":"religious-studies","topics":["主要宗教の概要","教義・儀礼・歴史","宗教の比較と社会との関係"]},{"subject_id":"psychology","topics":["記憶・学習・感情","認知・発達・社会心理","実験と研究結果の読み方"]},{"subject_id":"linguistics-languages","topics":["品詞と文の構造","音声・文法・意味","言語間の共通点と違い"]},{"subject_id":"anthropology-archaeology","topics":["文化と遺物","フィールドワークと発掘","資料から暮らしを読み解く"]},{"subject_id":"history","topics":["大まかな時代区分","主要事件の背景とつながり","史料の比較と批判"]},{"subject_id":"geography","topics":["地形と気候","人口・産業・都市","地域の特徴と成立要因"]},{"subject_id":"literature","topics":["ジャンルと表現技法","文学史と代表作品","作品の解釈と批評"]},{"subject_id":"art","topics":["主なジャンルと技法","芸術史と代表作品","作品の形式・背景の分析"]}]'::jsonb)
    as x(subject_id text, topics jsonb)
), expanded as (
  select subject_id, topic, ord
  from data
  cross join lateral jsonb_array_elements_text(topics) with ordinality as t(topic,ord)
)
insert into public.quest_topics(topic_id,field_id,name,source,importance,recommended_order,active)
select
  subject_id || '-prototype-' || lpad(ord::text,3,'0'),
  subject_id || '-prototype',
  topic,
  '仮トピック',
  2,
  ord*10,
  true
from expanded
on conflict(topic_id) do update set
  field_id=excluded.field_id,
  name=excluded.name,
  source=excluded.source,
  importance=excluded.importance,
  recommended_order=excluded.recommended_order,
  active=excluded.active;

commit;
