# 人生クエスト — TODO

更新日: 2026-09-27

## Git正本化

- [x] GitHub配下に現行SPECを作成
- [x] データモデル文書を作成
- [x] カリキュラム方針を作成
- [x] GitをSource of Truthとする運用を明文化
- [x] 旧Library資料は参照専用とし、新規更新を停止

## 共通バックエンド

- [x] 共通DB設計を `/shared-world-core/` に定義
- [x] Supabase `shared-world-core` プロジェクト作成
- [x] 初期スキーマをSupabaseへ適用
- [x] RLS・権限・Security Advisor確認
- [x] races / 29学問 seed投入
- [x] 数学20分野・275トピック投入
- [x] 数学以外28学問の現行3仮トピックを移行用に投入
- [x] メール/パスワード認証を利用するクライアント実装
- [x] Auth Site URL / Redirect URLを公開URLへ設定
- [x] Google Cloud OAuth Client作成
- [x] Supabase Google Provider設定

## 人生クエスト実装

- [x] Supabase Authクライアント導入
- [x] ログイン / 新規登録UI
- [x] 初回種族選択UI
- [x] `profiles.display_name` と名前変更UIを接続
- [x] `quest_subjects` / `quest_fields` / `quest_topics` をDB読込へ移行
- [x] 旧localStorage MASTERの一回限りの移行処理を実装
- [x] MASTER ON/OFFをDB INSERT/DELETEへ変更
- [x] 科目★ / Lv / NEXTをDBデータから算出
- [x] 表示ステータスを `player_presence` へ接続
- [x] 種族を `profiles.race_id` へ接続
- [x] 全チェックリセットをDB削除へ変更
- [x] GoogleログインUIを有効化
- [x] 29学問アイコンを画像スプライトへ置換（その後撤去し、2026-09-27に絵文字へ戻した）
- [x] 分野単位の折りたたみUIを実装
- [x] 旧デイリータブを `NEWSPAPER` へ置換し、外部JSON表示へ接続

## ステータス化（IDEAS §3・§4、2026-09-27 Keita決定）

- [x] migration 005（ステータス一覧・自作分野/トピック・入力型・記録履歴）を作成し、ローカルPostgreSQLで既存データ不変を確認
- [x] ステータス一覧・追加・編集・入力型・初回プリセット選択を実装
- [x] migration 005 を本番Supabaseへ適用（2026-09-27、Supabaseコネクタ経由）
- [x] 本番で既存MASTER・profiles・presence・夏の果て位置が適用前と一致することを確認
- [x] 英語（テスト得点区切り）・筋力プリセットのたたき台を投入（seed 006）
- [ ] 英語・筋力プリセットの区切りをKeitaが使ってみて調整
- [x] 29学問の見直しを本番に反映（seed 007: 大きすぎるトピック172件を540件に分割、数学に大学一般教養117件、名前変更14件、言語学に絞り込み）
- [ ] 英語以外の語学を、言語ごとのステータス（プリセット）として作る（どの言語から作るかはKeitaと決める）

## 仕様と実装の差分（未対応）

- [x] NEXTに `importance` を反映（SPEC §3 / DATA_MODEL「NEXT」）
- [x] 科目アイコンを絵文字へ戻す（IDEAS §7、2026-09-27決定）
- [x] プリセットのアイコンを16x16ドット絵SVGにする（IDEAS §7、2026-09-27決定）
- [x] 設定に「全データをリセット」を追加し、リセットは両方とも確認を2回出す（SPEC §10、2026-09-27 Keita依頼）
- [x] デザイン刷新: 案2C＋L2レイアウト、6色テーマ（既定ドラキュラ）（IDEAS §5、SPEC §16、2026-09-27決定）
- [x] 新デザインを公開版の実機（スマホ）で確認（2026-09-27 Keita確認、問題なし）

## 検証

- [x] DB件数確認: races 3 / subjects 29 / math fields 20 / math topics 275
- [x] Security Advisor警告0
- [x] MASTERデータをRLSで本人のみに制限
- [x] Renderで新ログイン版がlive
- [x] Google OAuth実ログイン確認
- [x] Google初回ログイン後の profile / race / Presence DB反映確認
- [x] 別ブラウザで同一MASTER状態を確認（2026-09-27 Keita実機確認）
- [x] 旧localStorageデータ移行を実ブラウザで確認（2026-09-27 Keita実機確認）
- [x] 種族・Presence・名前の別ブラウザ / 別アプリ同期確認（2026-09-27 Keita実機確認）

## デプロイ

- [x] 新ログイン版をRenderへ公開しlive確認
- [ ] （保留 2026-09-27 Keita判断）人生クエスト専用GitHub repoへ `apps/life-quest/` を移動
- [ ] （保留）Renderの接続先を専用repoへ変更
- [x] 既存公開URLを継続

## NEWSPAPER

- [x] 日刊NEWSPAPERの生成をClaudeへ移行（2026-09-27。Claudeのroutineが毎朝5:20 JSTに `life-quest-newspaper-data` の `GENERATE.md` どおり生成し、`scripts/validate_issue.py` で検証してからmainへマージ）
- [x] ChatGPT側の毎朝の生成を止める（2026-09-27 Keita対応）
- [x] NEWS記事に英語見出し `headline_en` を追加（2026-09-27のClaude版から出している。アプリ側は対応済みで、無い日は日本語見出しを表示）
- [x] NEWS記事を life-quest-newspaper-data の `STYLE.md` の基準で書く（ひとこと見出し＋事実とAIの解説で2〜3文＋出典、英日両方。2026-09-27 Keita決定。2026-09-27のClaude版から出している。アプリ側は対応済み）

## 運用ルール

仕様変更時は以下を同じ作業内で行う。

1. Gitドキュメント更新
2. 実装
3. 検証
4. commit
5. 公開版確認
