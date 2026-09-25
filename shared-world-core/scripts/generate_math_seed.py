#!/usr/bin/env python3
"""Generate Life Quest math seed SQL from the current public app data.

Run from repository root:
    python shared-world-core/scripts/generate_math_seed.py

Output:
    shared-world-core/supabase/seeds/002_math_curriculum.sql
"""

from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "apps" / "life-quest" / "index.html"
OUTPUT = ROOT / "shared-world-core" / "supabase" / "seeds" / "002_math_curriculum.sql"

FIELD_SLUGS = {
    "数と計算": "number-calculation",
    "整数の性質": "integer-properties",
    "量・比・割合": "quantity-ratio-percent",
    "文字と式": "algebraic-expressions",
    "方程式・不等式": "equations-inequalities",
    "関数": "functions",
    "図形": "geometry",
    "三角比・三角関数": "trigonometry",
    "図形と方程式": "analytic-geometry",
    "指数・対数": "exponential-logarithm",
    "場合の数・確率": "counting-probability",
    "データ・統計": "data-statistics",
    "数列": "sequences",
    "ベクトル": "vectors",
    "複素数平面・曲線": "complex-plane-curves",
    "極限": "limits",
    "微分": "differentiation",
    "積分": "integration",
    "集合・論理・証明": "sets-logic-proofs",
    "数学的表現・活用": "mathematical-expression-applications",
}


def sql_quote(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def load_math() -> list[list[str]]:
    source = SOURCE.read_text(encoding="utf-8")
    match = re.search(r"const MATH=(\[.*?\]);const KEY=", source, re.S)
    if not match:
        raise RuntimeError("Could not find const MATH in Life Quest index.html")
    data = json.loads(match.group(1))
    if not isinstance(data, list):
        raise RuntimeError("MATH is not an array")
    for row in data:
        if not isinstance(row, list) or len(row) != 3:
            raise RuntimeError(f"Invalid MATH row: {row!r}")
    return data


def generate(data: list[list[str]]) -> str:
    fields: list[str] = []
    for field, _, _ in data:
        if field not in fields:
            fields.append(field)

    unknown = set(fields) - set(FIELD_SLUGS)
    if unknown:
        raise RuntimeError(f"Missing field slugs: {sorted(unknown)}")

    lines = [
        "-- Life Quest math curriculum seed",
        "-- Generated from apps/life-quest/index.html",
        f"-- {len(fields)} fields / {len(data)} topics",
        "",
        "begin;",
        "",
        "insert into public.quest_fields (field_id, subject_id, name, sort_order, active) values",
    ]

    field_values = []
    for index, field in enumerate(fields, 1):
        field_id = f"math-{FIELD_SLUGS[field]}"
        field_values.append(
            f"  ({sql_quote(field_id)}, 'math', {sql_quote(field)}, {index * 10}, true)"
        )
    lines.append(",\n".join(field_values))
    lines.extend(
        [
            "on conflict (field_id) do update set",
            "  subject_id = excluded.subject_id,",
            "  name = excluded.name,",
            "  sort_order = excluded.sort_order,",
            "  active = excluded.active;",
            "",
            "insert into public.quest_topics (topic_id, field_id, name, source, importance, recommended_order, active) values",
        ]
    )

    counts: dict[str, int] = defaultdict(int)
    topic_values = []
    for field, name, source in data:
        counts[field] += 1
        sequence = counts[field]
        field_id = f"math-{FIELD_SLUGS[field]}"
        # IDs are assigned once and must remain bound to the same topic even if display order changes later.
        topic_id = f"{field_id}-{sequence:03d}"
        topic_values.append(
            "  ("
            + ", ".join(
                [
                    sql_quote(topic_id),
                    sql_quote(field_id),
                    sql_quote(name),
                    sql_quote(source),
                    "2",
                    str(sequence * 10),
                    "true",
                ]
            )
            + ")"
        )

    lines.append(",\n".join(topic_values))
    lines.extend(
        [
            "on conflict (topic_id) do update set",
            "  field_id = excluded.field_id,",
            "  name = excluded.name,",
            "  source = excluded.source,",
            "  importance = excluded.importance,",
            "  recommended_order = excluded.recommended_order,",
            "  active = excluded.active;",
            "",
            "commit;",
            "",
        ]
    )
    return "\n".join(lines)


def main() -> None:
    data = load_math()
    sql = generate(data)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(sql, encoding="utf-8")
    print(f"Generated {OUTPUT.relative_to(ROOT)}: {len(data)} topics")


if __name__ == "__main__":
    main()
