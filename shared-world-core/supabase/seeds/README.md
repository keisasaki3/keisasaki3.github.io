# Curriculum seeds

現行Life Quest数学データはGit上に投入可能SQLとして固定した。

## Current math seed

- `002_math_01.sql` — 5 fields / 76 topics
- `002_math_02.sql` — 5 fields / 80 topics
- `002_math_03.sql` — 5 fields / 68 topics
- `002_math_04.sql` — 5 fields / 51 topics

合計:

- 20 fields
- 275 topics

元データは `apps/life-quest/index.html` の現行 `MATH` 配列。

再生成用スクリプト:

```bash
python shared-world-core/scripts/generate_math_seed.py
```

初回生成で割り当てた `topic_id` は、ユーザーMASTERデータが紐づく永続IDとして扱う。表示順変更・名称変更だけを理由にIDを変えない。

## Apply order

1. `../migrations/001_initial_schema.sql`
2. `../seed.sql` — races + 29 subjects
3. `002_math_01.sql`
4. `002_math_02.sql`
5. `002_math_03.sql`
6. `002_math_04.sql`
7. `003_other_subject_prototypes.sql`
8. `../migrations/002`〜`005`（005 は29学問に `preset_group` を設定し、既存アカウントへステータスを登録する）
9. `006_english_strength_presets.sql` — 英語・筋力の単独プリセット（005 の後）
10. `007_curriculum_review.sql` — 29学問の見直し（大きすぎるトピックの分割、数学の大学一般教養、名前変更、言語学への絞り込み）
11. `../migrations/006_field_topic_name_en.sql` → `008_field_topic_name_en.sql` — 分野・トピックの英語名（本番の有効な分野499・トピック4677件、2026-09-27時点）
12. `009_assets_preset.sql` — 資産の単独プリセット（総資産・万円の入力型、006 の後）

本番の現状の一覧は `../../curriculum/prod_curriculum.csv`（`../../scripts/export_prod_curriculum.py` で作る）。

注意: 本番の29学問（数学以外）のトピックは、このフォルダのseedではなく本番DBで直接整備されたもの（2026-09-27時点で約4,100件）。`003_other_subject_prototypes.sql` は古い仮トピックで、本番の中身とは一致しない。`007` は本番のトピックIDを前提にしている。

### Gitに無い本番の変更

- 2026-09-28: `player_presence.status` に `working`（作業中、夏の果てβ0.60）を追加。`../migrations/011_allow_working_presence_status.sql` に後から記録した。
- 2026-10-02: 中身のはっきりしない分野・トピックの整理（Keita了承のうえ本番SQLで直接実行。seedファイルは無い）。分野2つを `active = false`（地球科学 `earth-science-field-01`「地球を調べる」、地理学 `geography-field-22`「地域研究」）、その配下のトピックを近い分野へ移動、「〜とは何か」系などのトピック17件を `active = false`。正確な状態は本番DBを見る。

本番で直接SQLを実行したときは、同じ内容をこのフォルダかmigrationsに残す。

前提関係とimportanceの精密化は後続migrationで追加する。現在の275トピックseedではimportanceを暫定値2としている。
