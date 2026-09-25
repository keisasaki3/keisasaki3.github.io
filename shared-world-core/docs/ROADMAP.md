# Shared World Roadmap

更新日: 2026-09-26

## 将来構想

### なつめポータル

「人生クエスト」と「午後三時、夏の果。」、および今後追加する関連アプリを包含する総合サービスを **「なつめポータル」** とする。

位置づけ:

- 「夏梅出版」は屋号・制作主体として独立して扱う。
- 「なつめポータル」は夏梅出版が運営するオンライン総合サービス / 共通入口。
- 人生をITでハック・ゲーミフィケーションする個人向けツール群、オンライン空間、作品を包含する。
- 実用ツールであると同時に、個人用のデジタル空間・作品としても扱う。

技術名:

- repository slug / ルートフォルダ / 技術上の識別名: `natsume-portal`

### 人生クエスト / 午後三時、夏の果。 のrepo統合

将来的に「人生クエスト」と「午後三時、夏の果。」のGitHub repositoryを `natsume-portal` に統合する。

方針:

- repository / project は統合する。
- アプリケーションそのものは分離したまま維持する。
- 共通Auth / DB / player profile / race / presenceなどはshared package / shared backendとして共用する。
- 各アプリ固有のUI・状態・ゲームロジックは独立させる。
- monorepo構成を第一候補とする。

想定構成例:

```text
natsume-portal/
├─ apps/
│  ├─ life-quest/
│  └─ summer-end/
├─ packages/
│  └─ shared/
├─ supabase/
└─ docs/
```

## 将来のリファクタリング

repo統合と並行または統合後に、以下を段階的に整理する。

- 共通Auth / Supabase client初期化の共通化
- player profile / race / presence型・処理の共通化
- 環境変数・接続設定の整理
- ディレクトリ構成と命名規則の統一
- 各アプリ固有コードとshared codeの境界整理
- 一時的な移行コード・互換処理の撤去
- デプロイ設定とドキュメントの整理

大規模な一括書き換えは避け、動作を保ちながら段階的にリファクタリングする。
