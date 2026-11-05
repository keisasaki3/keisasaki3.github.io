# なつめポータルの入口（仮）

`natsume-portal.onrender.com/` に出す仮のランディング（2026-11-05 Keita依頼）。各アプリへのリンクだけ。`scripts/build-portal.sh` が `dist/index.html` にコピーする。
- 検索に載らないよう noindex。
- ログインの戻り（`?code=` や `#access_token`）がルートに来たときは人生クエストへ渡す（以前のルート→/life-quest/ 転送の代わり）。
- アプリを足したらここにリンクを足す。
