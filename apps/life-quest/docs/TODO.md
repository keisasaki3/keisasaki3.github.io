# 人生クエスト — TODO

更新日: 2026-09-26

## Git正本化

- [x] GitHub配下に現行SPECを作成
- [x] データモデル文書を作成
- [x] カリキュラム方針を作成
- [x] GitをSource of Truthとする運用を明文化
- [ ] 旧Library資料は今後参照専用とし、新規更新を停止

## 共通バックエンド

- [x] 共通DB設計を `/shared-world-core/` に定義
- [ ] Supabaseプロジェクト作成
- [ ] `001_initial_schema.sql` をSupabaseへ適用
- [ ] Google OAuth設定
- [ ] メール/パスワード認証設定
- [ ] races / 29学問 seed投入

## 人生クエスト実装

- [ ] Supabase Authクライアント導入
- [ ] 初回ログインUI
- [ ] 初回種族選択UI
- [ ] `profiles.display_name` と名前変更UIを接続
- [ ] `quest_subjects` / `quest_fields` / `quest_topics` をDB読込へ移行
- [ ] localStorage MASTERを `quest_topic_mastery` へ移行
- [ ] MASTER ON/OFFをDB INSERT/DELETEへ変更
- [ ] 科目★ / Lv / NEXTをDBデータから算出
- [ ] 共通Presence表示対応

## データ移行

- [ ] 現行数学トピックを安定ID付きSQL/seedへ変換
- [ ] 29学問の仮トピックをDBへ移すか廃止時期を決定
- [ ] localStorageからSupabaseへの一回限りの移行方法を決定

## デプロイ

- [ ] 人生クエスト専用GitHub repo作成可能になったら `apps/life-quest/` を移動
- [ ] Renderの接続先を専用repoへ変更
- [ ] 公開URLを維持できる場合は既存URLを継続

## 運用ルール

仕様変更時は以下を同じ作業内で行う。

1. Gitドキュメント更新
2. 実装
3. 検証
4. commit
5. 公開版確認
