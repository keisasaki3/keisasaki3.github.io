# 開発ガイド（Claude / GPT 共通）

このリポジトリを触るAI（Claude、GPTなど）と人は、最初にこのファイルを読む。会話履歴が無くても、GitHub上の文書だけで安全に作業を続けられるようにするためのもの（2026-10-04 Keita依頼）。

対象: 人生クエスト（`apps/life-quest/`）と、夏の果てと共通のバックエンド（`shared-world-core/`）。夏の果ては `keisasaki3/summer-end-3pm`、NEWSPAPERのデータは `keisasaki3/life-quest-newspaper-data`（それぞれの `AGENTS.md` を読む）。

## 1. 読む順

1. この `AGENTS.md`
2. `apps/life-quest/README.md` → `docs/SPEC.md`（正本）→ `docs/TODO.md`（作業項目と「実装」待ちの依頼）
3. 必要に応じて `docs/IDEAS.md`（未決）、`docs/DATA_MODEL.md`、`docs/CURRICULUM.md`
4. DBに触れるときは `shared-world-core/README.md`、`docs/DATABASE.md`、`supabase/migrations/`、`supabase/seeds/README.md`

## 2. 優先順位

Keitaの最新指示 ＞ `IDEAS.md` で採用が明示された内容 ＞ `SPEC.md` 等 ＞ 現行実装 ＞ 過去仕様（旧ChatGPT Libraryの資料など）。

- `IDEAS.md` の未決事項を勝手に確定しない。「保留」と書かれたものは作らない。
- 過去にあった案・実装を、あったという理由だけで復活させない。

## 3. 作業ルール

- **「実装」と言われるまで作らない**（2026-09-28〜、プロジェクト全体）。修正・追加の依頼は `docs/TODO.md` に「未実装・「実装」待ち」として書いて止める。Keitaが「実装」「全部やれ」「最後まで実装」と言ったら、溜まった分をまとめて作る。
- 指定外の機能・表示・文言・データ構造を変えない。勝手な説明文・装飾・名称変更・大規模リファクタ・機能削除・ライブラリ追加はしない。改善案は実装前に提案する。
- 個人用アプリ。Keita本人が満足して使えることが最優先で、サービス化を先回りしない。
- 仕様を変えたら同じPRで主に `SPEC.md` を更新する（他の文書は内容に支障が出るときだけ。版番号・更新日・更新履歴を毎回触らない。2026-09-27 トークン節約）。SPECの決定事項には「（日付 Keita依頼/決定）」を添える慣習。
- 完了した `TODO.md` の項目は `[x]` にする。
- 返答は日本語で簡潔に。Keitaはスマホで読むことが多い。

## 4. 構成（人生クエスト）

- ビルド無しの素のJS＋Supabase JS（CDN、`index.html` で版を固定）。読み込み順は `index.html` の `<script>` の順: `i18n.js` → `app.js` → `subject-ui.js` → `routine-ui.js` → `wish-ui.js` → `newspaper-service.js` → `newspaper-ui.js`。
- 起動時に `app.js` から後ろのファイルの関数を DOMContentLoaded より前に呼ばない（2026-10-02、Loading... で止まる不具合の原因だった）。
- 画面の文言を足すときは `i18n.js` に日本語と英語の両方を足し、`tr()` で出す。プリセットの分野・トピックを足す・分ける・改名するときは英語名 `name_en` も入れる。
- 端末ごとの設定は `localStorage`（キーは SPEC §10・§16・§17）。DBに保存しない。
- `app.js` の Supabase の publishable key は公開してよい値。service role key はこのリポジトリに絶対に入れない。
- `sw.js` はネット優先なので、普段の変更でキャッシュ名を上げる必要はない。
- リポジトリ直下の `index.html` は別サイトへのリダイレクト（人生クエストとは無関係。触らない）。`shares/` も無関係。

## 5. DB（Supabase `shared-world-core`）

- 人生クエストと夏の果てで同じプロジェクトを使う。`profiles`・`races`・`player_presence` などを変えるときは両アプリへの影響を確かめる（夏の果て側は `npm run build` が共通バックエンドの静的検査も走らせる）。
- **本番DBへのSQL（migration・seed・データ修正）は毎回Keitaの了承を得てから実行する。** 了承前に作るのはファイルまで。
- スキーマ変更は `shared-world-core/supabase/migrations/NNN_name.sql`（連番）に書き、既存データの移行まで設計する。MASTER・プロフィール・表示名・種族・状態を壊さない。
- 一度公開した `subject_id` / `field_id` / `topic_id` は変えない・再利用しない。不要になったプリセットの分野・トピックは削除せず `active = false` にする（MASTERを残すため）。
- `quest_subjects.sort_order` は変えない（旧データ移行が学問の並び順に依存）。
- 本番の29学問のカリキュラム（約4,600トピック）はGitのseedに全部は入っていない（`supabase/seeds/README.md`）。カリキュラムを触るときは本番DBを読んでから作業する。DBを読めない環境なら、作業前にKeitaにその旨を伝える。

## 6. 検証（PR前に1回）

自動テストは無い。変更に応じて次を行い、「たぶん動く」で終えない（検証は1回でよい。2026-09-27）。

- JSの構文: `for f in apps/life-quest/*.js; do node --check "$f"; done`
- 参照切れ: 足した・消した関数名、CSSクラス、`i18n.js` のキーを `grep` で確かめる。
- 画面: `python3 -m http.server -d apps/life-quest 8000` で開き、コンソールにエラーが無いこと。UIの変更はスマホ幅（390px前後）でも見る。ログイン後の画面はSupabaseをモックしたPlaywrightで確かめた実績がある。本番のデータを書き換える操作はしない。
- migration: 可能ならローカルPostgreSQLで既存データが変わらないことを確かめる（migration 005 の前例）。本番適用後は件数・既存MASTERが変わっていないことを確かめる。
- `shared-world-core` を変えたら夏の果て側でも `npm run build`。

## 7. PRとマージ

- 作業ブランチ → PR → 検証が通ったら自分でマージする（merge commit。Keita指示 2026-09-27）。
- 他の作業中のPRと同じファイルを触るときは、後からマージする側が合わせる。
- **本番サイトの表示確認はKeitaがやる。** マージ後に本番を見に行かず、「本番で見てほしいところ」を一言伝える。
- 公開: `main` にマージするとRenderが自動で公開する（https://natsume-lq.onrender.com。旧URL life-quest-keita.onrender.com は使わない）。Render・Google Cloud・Supabaseの管理画面の設定はリポジトリ外で、Keitaが管理する。

## 8. NEWSPAPER

- アプリは `life-quest-newspaper-data` の公開JSONを表示するだけで、生成しない（SPEC §14）。
- 生成は毎朝5:20 JSTにClaudeのroutineが `GENERATE.md` どおりに行う。人や別のAIが同じ日の号を並行して発行しない。
- 紙面JSONの形を変えるときは、アプリ（`newspaper-ui.js`）、`validate_issue.py`、`GENERATE.md`（必要なら `STYLE.md`）を揃えて変える。項目が無い号でもアプリが表示できるようにしておく。

## 9. 秘密情報

APIキー・service role key・トークンをコミット・文書・PRに書かない。公開してよいのは Supabase の URL と publishable key、Google OAuth のクライアントIDだけ。
