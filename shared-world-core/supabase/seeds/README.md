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

前提関係とimportanceの精密化は後続migrationで追加する。現在の275トピックseedではimportanceを暫定値2としている。
