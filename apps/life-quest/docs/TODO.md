# 人生クエスト — TODO

更新日: 2026-09-26

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
- [ ] デイリー画面を現行Web版へ再接続

## 検証

- [x] DB件数確認: races 3 / subjects 29 / math fields 20 / math topics 275
- [x] Security Advisor警告0
- [x] MASTERデータをRLSで本人のみに制限
- [x] Renderで新ログイン版がlive
- [x] Google OAuth実ログイン確認
- [x] Google初回ログイン後の profile / race / Presence DB反映確認
- [ ] 別ブラウザで同一MASTER状態を確認
- [ ] 旧localStorageデータ移行を実ブラウザで確認
- [ ] 種族・Presence・名前の別ブラウザ / 別アプリ同期確認

## デプロイ

- [x] 新ログイン版をRenderへ公開しlive確認
- [ ] 人生クエスト専用GitHub repo作成可能になったら `apps/life-quest/` を移動
- [ ] Renderの接続先を専用repoへ変更
- [x] 既存公開URLを継続

## 運用ルール

仕様変更時は以下を同じ作業内で行う。

1. Gitドキュメント更新
2. 実装
3. 検証
4. commit
5. 公開版確認
