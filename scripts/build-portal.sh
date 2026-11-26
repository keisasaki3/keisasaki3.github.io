#!/bin/sh
# なつめポータル（Render の静的サイト natsume-portal）に出すファイルを dist/ にまとめる（2026-11-04 Keita決定）。
# 入口は / （apps/portal/index.html、2026-11-05 Keita依頼の仮ランディング）。並びは /life-quest/ /history-novel/ /yosho-novel/ /oshigoto-town/ /eigo-escape/ /ui-mock/ /shared/。アプリ側は相対パス（../../shared/ など）で互いを参照する。
# SUPER暗記大戦（/anki-taisen/）は 2026-11-26 にクイズペディア（keisasaki3/quizpedia）へ移ったので、ここからは外した（Keita「まぎらわしいから旧環境の暗記大戦停止してリンクも全部けして」）。
set -e
rm -rf dist
mkdir -p dist
cp -r apps/life-quest dist/life-quest
cp -r apps/history-novel dist/history-novel
rm -rf dist/history-novel/src dist/history-novel/faces dist/history-novel/faces-src
cp -r apps/yosho-novel dist/yosho-novel
rm -rf dist/yosho-novel/src
cp -r apps/oshigoto-town dist/oshigoto-town
cp -r apps/eigo-escape dist/eigo-escape
cp -r apps/ui-mock dist/ui-mock
cp -r shared dist/shared
cp apps/portal/index.html dist/index.html
# 説明書き（README.md など）は開発用のメモなのでサイトに載せない。ファイルはリポジトリに残す。
# 環境音のクレジット（CC BY）が参照する出典の一覧は snd/SOURCES.txt（.md ではないので公開のまま）。
find dist -name '*.md' -delete
