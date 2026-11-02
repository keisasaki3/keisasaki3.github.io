# 激突！暗記大戦（anki-taisen）

なつめポータルのアプリのひとつ。友人や家族とオンラインで、歴史の年号や関東の鳥（写真・鳴き声）を当て合う対戦ゲーム（2026-11-02 Keita依頼）。

- 公開URL: https://keisasaki3.github.io/apps/anki-taisen/ （`?room=あいことば` で部屋を分けられる。省略時は `main`）
- 構成: ビルド無しの単一HTML（`index.html`）＋地図データ `map.js`＋鳥の写真・鳴き声 `b/`。
- 対戦の同期: Supabase `shared-world-core` の Realtime presence だけを使う（チャンネル名 `anki-taisen:<room>`）。DBの表は作らない・読まない。publishable key は公開してよい値。
- ルール（Keita指定）: 1問10秒、全員が答えたら答え合わせ、正解は全員1点で早押しの優劣なし。最後の3問は得点2倍、歴史は±3年で0.5点。
- 素材: 写真は Wikimedia Commons、鳴き声は xeno-canto。撮影者・録音者・ライセンスを答え合わせに表示している（鳴き声はCC BY-NC系なので非営利で使う）。AI生成の写真・音声は使わない。
- 元の開発は claude.ai の Artifact（https://claude.ai/artifact/PWihQRKdReNW4YjamVfDeZ）。`index.html` はその本文に `<head>`（Supabaseの読み込みと設定）を足したもの。
