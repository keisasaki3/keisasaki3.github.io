# 人生クエスト

自分が何を理解しているか、次に何を学ぶかを可視化し、現実世界での学習を楽しくする個人向け学習ステータスシステム。

## Source of Truth

2026-09-26以降、人生クエストの正式仕様はこのGitHub配下を正本とする。

- 現行仕様: `docs/SPEC.md`
- 最新アイデアメモ（未確定）: `docs/IDEAS.md`
- データ設計: `docs/DATA_MODEL.md`
- カリキュラム方針: `docs/CURRICULUM.md`
- 作業項目: `docs/TODO.md`
- 共通認証・DB: `/shared-world-core/`

旧ChatGPT Libraryの `life-quest-spec.md` は履歴資料として扱い、今後の仕様判断ではGitHub版を優先する。

`docs/IDEAS.md` は検討中の方向性であり、確定仕様ではない。`SPEC.md` と衝突する内容を実装へ反映する場合は、ユーザーと採用方針を確認したうえで関連ドキュメントも更新する。

## Claude handoff

Claudeへ開発を引き継ぐ場合は、このREADMEを入口にして以下を確認する。

1. `docs/SPEC.md`
2. `docs/IDEAS.md`
3. `docs/DATA_MODEL.md`
4. `docs/CURRICULUM.md`
5. `docs/TODO.md`
6. `apps/life-quest/` の現行ソース一式
7. `/shared-world-core/` のREADME・設計文書・migration
8. 必要に応じて `keisasaki3/life-quest-newspaper-data`

最初の作業では、コードを書き換える前に現行実装とドキュメントの整合性を把握する。ただし「状況把握だけ」で作業を終了せず、その後にユーザーが指定した実装・設計作業まで完遂する。

## Current deployment

- Public URL: https://life-quest-keita.onrender.com
- Current source: `apps/life-quest/index.html`

## Project rule

仕様変更は、実装だけを変更して終わらせず、対応するGitドキュメントも同じ作業内で更新する。
