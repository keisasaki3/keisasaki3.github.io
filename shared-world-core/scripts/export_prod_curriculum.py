#!/usr/bin/env python3
"""本番Supabaseのプリセット（quest_subjects / quest_fields / quest_topics）を
shared-world-core/curriculum/prod_curriculum.csv に書き出す。

読むだけ（公開read可能なテーブルをpublishable keyで取得）。DBは変更しない。
本番のカリキュラムを変えたら、このスクリプトを実行してCSVを更新する。

  python3 shared-world-core/scripts/export_prod_curriculum.py
"""
import csv, json, os, re, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "curriculum", "prod_curriculum.csv")
APP_JS = os.path.join(ROOT, "..", "apps", "life-quest", "app.js")

src = open(APP_JS, encoding="utf-8").read()
URL = re.search(r"SUPABASE_URL\s*=\s*'([^']+)'", src).group(1)
KEY = re.search(r"SUPABASE_PUBLISHABLE_KEY\s*=\s*'([^']+)'", src).group(1)


def fetch(table, order):
    rows, start = [], 0
    while True:
        req = urllib.request.Request(
            f"{URL}/rest/v1/{table}?select=*&order={order}",
            headers={"apikey": KEY, "Authorization": f"Bearer {KEY}",
                     "Range-Unit": "items", "Range": f"{start}-{start + 999}"})
        with urllib.request.urlopen(req, timeout=60) as r:
            page = json.load(r)
        rows += page
        if len(page) < 1000:
            return rows
        start += 1000


subjects = {s["subject_id"]: s for s in fetch("quest_subjects", "sort_order,subject_id")}
fields = {f["field_id"]: f for f in fetch("quest_fields", "sort_order,field_id")}
topics = fetch("quest_topics", "field_id,recommended_order,topic_id")

cols = ["subject_id", "subject_ja", "subject_en", "preset_group", "subject_active",
        "field_id", "field_ja", "field_en", "field_sort", "field_active",
        "topic_id", "topic_ja", "topic_en", "source", "importance",
        "recommended_order", "input_type", "unit", "topic_active"]
n = 0
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8", newline="") as fh:
    w = csv.writer(fh, lineterminator="\n")
    w.writerow(cols)
    for t in sorted(topics, key=lambda t: (
            subjects[fields[t["field_id"]]["subject_id"]]["sort_order"],
            fields[t["field_id"]]["sort_order"], fields[t["field_id"]]["field_id"],
            t["recommended_order"], t["topic_id"])):
        f = fields[t["field_id"]]
        s = subjects[f["subject_id"]]
        w.writerow([s["subject_id"], s["name_ja"], s.get("name_en"), s.get("preset_group"), s["active"],
                    f["field_id"], f["name"], f.get("name_en"), f["sort_order"], f["active"],
                    t["topic_id"], t["name"], t.get("name_en"), t.get("source"), t["importance"],
                    t["recommended_order"], t.get("input_type"), t.get("unit"), t["active"]])
        n += 1
print(f"{n} topics -> {OUT}")
