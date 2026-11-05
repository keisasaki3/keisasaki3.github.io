# tpl.html に地図・辞典・資料・台本・エンジンを差し込んで ../index.html を作る。使い方: python3 build.py
import os
D = os.path.dirname(os.path.abspath(__file__))
r = lambda f: open(os.path.join(D, f), encoding='utf-8').read()
t = r('tpl.html')
for k, f in [('MAP', 'japan_path.txt'), ('G', 'G.js'), ('PIC', 'pic.js'), ('S', 'S.js'), ('ENGINE', 'engine2.js')]:
    t = t.replace('%%' + k + '%%', r(f))
open(os.path.join(D, '..', 'index.html'), 'w', encoding='utf-8').write(t)
print(len(t))
