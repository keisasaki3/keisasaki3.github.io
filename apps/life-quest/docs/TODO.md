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
- [x] 資産プリセット（総資産を万円で手入力）を作る（seed 009、2026-09-27 Keita依頼）
- [x] 資産をステータス一覧・画面で「1,000,000 YEN」表記にする（2026-09-27 Keita依頼）
- [x] ステータスを長押しドラッグで並べ替えられるようにし、プリセットの初期順を 資産 → 筋力 → 英語 → 29学問 にする（2026-09-27 Keita依頼）
- [x] 不具合修正: プリセット選択の「はじめる」を保存中にもう一度押すと同じプリセットを二重に追加し、一意制約エラー（quest_user_statuses_user_preset_unique）が出ていた。新規分を1回の insert にまとめ、処理中はボタンを無効にした（2026-09-27 Keita報告）
- [x] 29学問の見直しを本番に反映（seed 007: 大きすぎるトピック172件を540件に分割、数学に大学一般教養117件、名前変更14件、言語学に絞り込み）
- [ ] 英語以外の語学を、言語ごとのステータス（プリセット）として作る（どの言語から作るかはKeitaと決める）

## 仕様と実装の差分（未対応）

- [x] NEXTに `importance` を反映（SPEC §3 / DATA_MODEL「NEXT」）
- [x] 科目アイコンを絵文字へ戻す（IDEAS §7、2026-09-27決定）
- [x] プリセットのアイコンを16x16ドット絵SVGにする（IDEAS §7、2026-09-27決定）
- [x] 設定に「全データをリセット」を追加し、リセットは両方とも確認を2回出す（SPEC §10、2026-09-27 Keita依頼）
- [x] 言語設定（日本語 / English）で画面の文言を切り替え、NEWSPAPERのメイン言語も選べるようにする（SPEC §10・§14、2026-09-27 Keita依頼）
- [x] 分野・トピックを日英併記にし、言語設定で主副を入れ替える（SPEC §7、migration 006、seed 008、2026-09-27 Keita依頼）
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

## PWA化（2026-10-02 実装）

- [x] manifest とアプリアイコン（apple-touch-icon 180 / 192 / 512 / maskable、スライム勇者）を追加し、ホーム画面から全画面起動できるようにする（2026-10-02）
- [x] 最小の Service Worker を追加する（Webのまま PWA 化、ストア配布はしない）

## 起動時に Loading... のまま止まる（2026-10-02 調査・実装）

原因: 起動時の通信にタイムアウトがなく、1本でも応答が返らないと失敗にも再読み込みにもならず待ち続ける。サーバー側（Supabase 24時間ログ: エラー0件・最大1.3秒、Render静的サイト: スリープなし）は正常。

- [x] Supabase クライアントの fetch に 15秒程度のタイムアウトを付け、止まったら既存のエラー画面（再読み込みボタン）に出す
- [x] sw.js のネット優先に 3秒程度のタイムアウトを付け、遅いときはキャッシュを返す
- [ ] （任意）supabase.js を unpkg ではなく自前配信にし、外部CDNの遅延で起動しないのを防ぐ

## 運用ルール

仕様変更時は以下を同じ作業内で行う。

1. Gitドキュメント更新
2. 実装
3. 検証
4. commit
5. 公開版確認

## 日課チェックの達成演出（2026-10-03 Keita依頼、A〜Cは実装済み）

現状: チェックすると再描画で ✓ と色が付くだけ（アニメ・音なし）。ライブラリは使わず CSS / Web Audio だけで作る。

- [x] A. チェック時に ✓ がポンと弾み、アイコンが跳ねて小さな星（ドット）が散る（推奨）
- [x] B. 📚連続日数が +1 されて数字が光る（推奨）
- [x] C. その日の日課を全部終えたら「本日のクエスト達成！」の帯と紙吹雪を一度だけ出す（推奨）
- [ ] D. 8bit風の効果音（音声ファイルなし、Web Audio）とスマホの振動（iPhoneは振動非対応）。採用するなら設定にON/OFFを付ける（任意）

## 電子ペーパーテーマのステータスアイコン（2026-10-03 Keita依頼）

現状: `theme.css` の `[data-theme="e-paper"] .pixicon` に `grayscale` フィルタがかかり、ドット絵アイコンが白黒になっている。

- [x] 電子ペーパーテーマでもステータスのアイコンを色付き（元の色）で表示する（2026-10-03 実装、フィルタを削除）

## 全テーマでステータスアイコンのモノクロ加工をやめる（2026-10-03 Keita依頼、「実装」まで保留）

現状: `theme.css` の `[data-theme="gameboya"|"gameboya-pocket"|"gameboya-light"|"virtual-boya"|"wonderswan"|"tamagoppi"] .pixicon` に液晶の階調フィルタ（`#lq-lcd-*`、定義は `index.html`）がかかり、アイコンが単色寄りになっている。電子ペーパーは対応済み。

- [ ] 上の6テーマの `.pixicon` フィルタを削除し、全テーマで元の色のアイコンにする。使われなくなった `#lq-lcd-*` フィルタ定義も `index.html` から消す。

## ステータス一覧の行レイアウト（2026-10-03 Keita依頼、2026-10-03 実装）

現状: 行は `01` などの項目番号（`.gutter`）＋1行目「アイコン・名前・英語名・★」＋2行目「NEXT ○○」。英語名の `.en`（`theme.css`）が `flex:1` で行の残り幅を全部取るため、★が右端へ押し出され、筋力のように名前が短いと名前と★が大きく離れる。

- [x] 項目番号（`.gutter`）を表示しない（左の余白も詰める）
- [x] NEXT表示をやめ、2行目に英語名を出す（1行目は「アイコン・名前・★」だけになり、★が名前のすぐ右に付く）。COMPLETE表示もなくす

## プレイヤー窓の新ヘッダー（2026-10-03 Keita決定、2026-10-03 実装、内容は IDEAS §10）

- [x] 「左にサムネ、右にニックネームとLv、その下にジョブ名、その下に肩書」の配置にする
- [x] サムネを自分でアップできるようにする（Supabase Storage のバケットと本人のみのRLSを migration で作る、端末で128px程度に縮小、未設定はスライム勇者）。migration 010
- [x] 設定にジョブ名（自由入力、12文字）を追加し、`quest_user_settings` に保存する（migrationで列追加）
- [x] 肩書を IDEAS §10 の12段階にする（日英とも i18n.js へ）

## NEWSPAPER の DAILY QUIZ / DAILY CULTURE を一時非表示（2026-10-03 Keita依頼、実装済み）

- [x] 紙面から DAILY QUIZ / DAILY CULTURE の表示を外す（関数・CSSは残す。戻すときは `renderNewspaper` に2行を戻す）
- [x] 毎朝の生成も停止（`life-quest-newspaper-data` の `GENERATE.md` に停止中と再開手順を残し、`validate_issue.py` は項目がある号だけ検証）。アプリは両項目が無い号も表示できる

## NEWSPAPER の MARKETS（マーケット君）を見やすく（2026-10-03 Keita依頼、実装済み）

- [x] A. 前日比を上昇＝緑・下落＝赤・0＝灰で色分け（海外式）
- [x] B. 前日比に ▲ / ▼ / ± を付ける
- [x] C. 前日比の小数を揃える（% は2桁、bp は1桁）
- [x] D. 値の小数を種類ごとに揃える（Keita「推奨でいい」に含めて実装）
- [x] E. MARKET MOVES の見出しにも `move` を色と記号つきで出す
- [x] F. 値幅 `change` を前日比%の下に出す（生成側 `fetch_markets.py` も対応。2026-10-03 Keita「全部やれ」）
