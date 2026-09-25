# Shared Auth

更新日: 2026-09-26

## Provider

Supabase Authを共通認証基盤として使用する。

初期ログイン方式:

1. Google OAuth
2. Email + Password

Magic Link等は必要になった場合に追加する。

## Password

アプリ独自テーブルへパスワード、パスワードハッシュ、Google tokenを保存しない。

認証情報はSupabase Auth (`auth.users`) に任せる。

アプリDBは `auth.users.id` のUUIDのみを共通識別子として参照する。

## Profile creation

Authユーザー作成時にDB triggerで `public.profiles` を自動作成する。

初期値:

- display_name: Google metadataのname / full_nameがあれば使用。なければ「名無し」
- race_id: null

race_idがnullの場合、各アプリは共通オンボーディングとして種族選択を要求できる。

## Login sharing

人生クエストと夏の果は同じSupabase projectを利用するため、同じGoogle/メールアカウントは同じ `auth.users.id` を利用する。

初期段階では別オリジンの各アプリで一度ずつログインしてよい。

将来SSOを必要とする場合:

- 同一親ドメイン配下へ配置
- または専用auth domainを用意

を検討する。

## Authorization

DBアクセスはRLSを必須とする。

原則:

- 自分のMASTERは自分だけread/write
- 自分の永続位置は自分だけclient read/write
- profileの公開可能項目（display_name/race_id）は認証ユーザー同士でread可
- presenceは認証ユーザー同士でread可
- マスターデータはread-only
- Summer End serverはservice roleで必要データへアクセスする

## Service role

`SUPABASE_SERVICE_ROLE_KEY` はサーバーだけに置く。

ブラウザ、静的HTML、Vite client bundleへ絶対に埋め込まない。

クライアントにはanon/publishable keyのみを使用する。
