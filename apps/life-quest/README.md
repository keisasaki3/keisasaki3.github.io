# 人生クエスト

自分が何を理解しているか、次に何を学ぶかを可視化し、現実世界での学習を楽しくする個人向け学習ステータスシステム。

## Source of Truth

2026-09-26以降、人生クエストの正式仕様はこのGitHub配下を正本とする。

- 現行仕様: `docs/SPEC.md`
- データ設計: `docs/DATA_MODEL.md`
- カリキュラム方針: `docs/CURRICULUM.md`
- 作業項目: `docs/TODO.md`
- 共通認証・DB: `/shared-world-core/`

旧ChatGPT Libraryの `life-quest-spec.md` は履歴資料として扱い、今後の仕様判断ではGitHub版を優先する。

## Current deployment

- Public URL: https://life-quest-keita.onrender.com
- Current source: `apps/life-quest/index.html`

## Project rule

仕様変更は、実装だけを変更して終わらせず、対応するGitドキュメントも同じ作業内で更新する。
