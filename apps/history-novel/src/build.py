# SUPER歴史ノベルのビルド。使い方: python3 build.py
# 共通部分（見た目 hn.css・動き engine2.js → hn-engine.js）は全章で1つのファイルを共有し、ブラウザのキャッシュを効かせる。
# 章ごとのページは tpl.html に、その章の設定・地図・辞典・台本・資料を差し込んで作る。
# 章を足すときは CHAPTERS に1行足し、src/<章>/ に cfg.js・G.js・S.js・pic.js・地図パスを置く（手順と合格条件は ../CHAPTER_GUIDE.md）
import os, hashlib
D = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(D, '..')
r = lambda *f: open(os.path.join(D, *f), encoding='utf-8').read()
CHAPTERS = [
    # (出力ファイル, 章のフォルダ（src からの相対。'' は src そのもの）, 地図パスのファイル)
    ('index.html', '', 'japan_path.txt'),        # 日本史 鎌倉編「武士の天下へ（平安～鎌倉）」
    ('daikokai.html', 'w1', 'world_path.txt'),   # 世界史 大航海時代「世界がつながる（大航海時代）」
]
ver = {}
for src, out, key in [('hn.css', 'hn.css', 'V_CSS'), ('engine2.js', 'hn-engine.js', 'V_ENG')]:
    body = r(src)
    open(os.path.join(OUT, out), 'w', encoding='utf-8').write(body)
    ver[key] = hashlib.sha1(body.encode()).hexdigest()[:8]  # 中身が変わったときだけ読み直させる
    print(out, len(body))
for out, sub, mp in CHAPTERS:
    t = r('tpl.html')
    for k, f in [('MAP', mp), ('CFG', 'cfg.js'), ('G', 'G.js'), ('PIC', 'pic.js'), ('S', 'S.js')]:
        t = t.replace('%%' + k + '%%', r(sub, f))
    for k, v in ver.items():
        t = t.replace('%%' + k + '%%', v)
    assert '%%' not in t, out
    open(os.path.join(OUT, out), 'w', encoding='utf-8').write(t)
    print(out, len(t))
