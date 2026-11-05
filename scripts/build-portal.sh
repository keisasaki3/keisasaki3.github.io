#!/bin/sh
# なつめポータル（Render の静的サイト natsume-portal）に出すファイルを dist/ にまとめる（2026-11-04 Keita決定）。
# 入口は / （apps/portal/index.html、2026-11-05 Keita依頼の仮ランディング）。並びは /life-quest/ /anki-taisen/ /history-novel/ /shared/。アプリ側は相対パス（../anki-taisen/ や ../../shared/）で互いを参照する。
set -e
rm -rf dist
mkdir -p dist
cp -r apps/life-quest dist/life-quest
cp -r apps/anki-taisen dist/anki-taisen
rm -rf dist/anki-taisen/src
cp -r apps/history-novel dist/history-novel
rm -rf dist/history-novel/src dist/history-novel/faces dist/history-novel/faces-src
cp -r shared dist/shared
cp apps/portal/index.html dist/index.html
