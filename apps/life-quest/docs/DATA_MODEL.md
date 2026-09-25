# 人生クエスト — データモデル

更新日: 2026-09-26

## 原則

人生クエスト固有DBは、共通アカウントDB `/shared-world-core/` の `auth.users` / `profiles` を親として利用する。

科目★、プレイヤーLv、肩書は派生値であり、独立した保存値にしない。

## テーブル

### quest_subjects

学問マスタ。

- subject_id: text PK
- name_ja: text
- name_en: text
- icon: text
- sort_order: integer
- active: boolean

### quest_fields

学問配下の分野。

- field_id: text PK
- subject_id: text FK -> quest_subjects.subject_id
- name: text
- sort_order: integer
- active: boolean

### quest_topics

MASTER単位。

- topic_id: text PK
- field_id: text FK -> quest_fields.field_id
- name: text
- source: text nullable
- importance: smallint
- recommended_order: integer
- active: boolean

importanceはNEXT計算用。★の重みには使用しない。

### quest_topic_prerequisites

トピックの多対多の前提関係。

- topic_id: text FK -> quest_topics.topic_id
- prerequisite_topic_id: text FK -> quest_topics.topic_id
- PK(topic_id, prerequisite_topic_id)

### quest_topic_mastery

個人のMASTER履歴。

- user_id: uuid FK -> profiles.user_id
- topic_id: text FK -> quest_topics.topic_id
- mastered_at: timestamptz
- PK(user_id, topic_id)

チェック解除時は該当行をDELETEする。

## 派生値

### 科目★

対象科目に所属する `quest_topic_mastery` の件数。

### プレイヤーLv

その利用者の `quest_topic_mastery` 全件数。

### MASTER!

対象 `(user_id, topic_id)` 行が存在する場合のみ表示する。

### NEXT

以下の優先順で未MASTERトピックを選ぶ。

1. 前提トピックをすべてMASTER済み
2. importanceが高い
3. recommended_orderが早い

前提を満たす未MASTERトピックが存在しない場合のfallbackは仕様側で定義する。

## 移行

現行Web版はlocalStorage `lifeQuestMathV06Public` にMASTER状態を保持している。

Supabase移行時には、初回ログイン後にローカルMASTERを `quest_topic_mastery` へ一度だけ移行できる仕組みを検討する。移行完了フラグは将来追加してよい。

## 権限

- 学問 / 分野 / トピック / 前提: クライアントはread-only
- MASTER: 各ユーザーは自分の行だけSELECT / INSERT / DELETE
- 他人のMASTER状況は初期仕様では非公開

具体的RLSは `/shared-world-core/supabase/migrations/001_initial_schema.sql` を正本とする。
