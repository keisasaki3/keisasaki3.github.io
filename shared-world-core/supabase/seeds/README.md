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

注意: 本番の29学問（数学以外）のトピックは、このフォルダのseedではなく本番DBで直接整備されたもの（2026-09-27時点で約4,100件）。`003_other_subject_prototypes.sql` は古い仮トピックで、本番の中身とは一致しない。`007` は本番のトピックIDを前提にしている。

前提関係とimportanceの精密化は後続migrationで追加する。現在の275トピックseedではimportanceを暫定値2としている。
