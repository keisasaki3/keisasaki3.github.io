# Shared World Roadmap

更新日: 2026-09-26

## 将来構想

### 人生クエスト / 午後三時、夏の果。 のrepo統合

将来的に「人生クエスト」と「午後三時、夏の果。」のGitHub repositoryを1つに統合する。

方針:

- repository / project は統合する。
- アプリケーションそのものは分離したまま維持する。
- 共通Auth / DB / player profile / race / presenceなどはshared package / shared backendとして共用する。
- 各アプリ固有のUI・状態・ゲームロジックは独立させる。
- monorepo構成を第一候補とする。

想定構成例:

```text
natsume-online/
├─ apps/
│  ├─ life-quest/
│  └─ summer-end/
├─ packages/
│  └─ shared/
├─ supabase/
└─ docs/
```

統合プロジェクト名（仮）:

- 日本語: 夏梅出版Online
- repository slug / 技術名: `natsume-online`

命名方針:

- 表向きのプロジェクト名は「夏梅出版Online」。
- GitHub repository、ルートフォルダ、技術上の識別名は `natsume-online` を使用する。
