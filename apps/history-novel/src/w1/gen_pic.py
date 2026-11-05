# 資料画像の説明と出典から pic.js を作る。sel.json=鍵→ウィキメディア・コモンズのファイル名、commons_info.json=作者とライセンス（API で取得済み）
import json, os, re
D = os.path.dirname(os.path.abspath(__file__))
sel = json.load(open(os.path.join(D, 'sel.json'), encoding='utf-8'))
info = json.load(open(os.path.join(D, 'commons_info.json'), encoding='utf-8'))
CAP = {
 'd_giraffe': ('沈度「瑞応麒麟図」', '1414年、ベンガルの使節が明の永楽帝に献上したキリンを描いた絵。キリンはもとはアフリカ東岸から運ばれた。中国では伝説の聖獣「麒麟」とみなされた'),
 'p_belem': ('ベレンの塔（リスボン）', '16世紀はじめ、テージョ川の入り口を守るために建てられた塔。インドへ向かう船はこの前を通って出ていった'),
 'd_caravel': ('ピンタ号の複製船', 'コロンブスの第1回航海に加わったカラベル船。三角帆と四角い帆を組み合わせている（スペイン・パロスの復元船）'),
 'p_cape': ('喜望峰の近く（ケープ半島）', 'アフリカ大陸の南西の端。ディアスはこのあたりで嵐にあい、気づかないうちにアフリカの南端を回っていた'),
 'd_landing': ('ジョン・ヴァンダーリン「コロンブスの上陸」', '1847年に描かれた想像の絵。アメリカ合衆国議会議事堂に飾られている'),
 'd_calicut': ('ブラウンとホーヘンベルフ「カリカット」', '1572年に出版された都市図集の一枚。港には多くの船が並んでいる'),
 'd_cantino': ('カンティーノ図（1502年）', 'ポルトガルの最新の航海の成果を描いた世界地図。大西洋を南北に走る線がトルデシリャス条約の境界線。左側にブラジルの海岸も見える'),
 'p_strait': ('マゼラン海峡（人工衛星写真）', '南アメリカ大陸の南の端。入り組んだ水路が大西洋と太平洋を結んでいる'),
 'd_tenochtitlan': ('テノチティトランの復元図', '湖の島の上に広がる都を、研究をもとにコンピューターで描いた現代の想像図'),
 'p_cusco': ('クスコのアルマス広場', 'インカの都の中心だった広場。インカの建物を壊し、その石の上にスペイン人が大聖堂を建てた'),
 'p_cajamarca': ('身代金の部屋（カハマルカ）', 'アタワルパが、手の届く高さまで黄金で満たすと約束したと伝わる部屋'),
 'd_potosi': ('ポトシの町とセロ・リコ', '奥の赤い山が、銀を掘りつくすほど掘られた「豊かな山」'),
 'p_potosi': ('セロ・リコ（ボリビア・ポトシ）', '標高約4800メートル。16世紀から掘られ続け、山の中は坑道だらけになっている'),
 'p_malacca': ('ア・ファモサ（マラッカ）', '1511年にマラッカを攻め取ったポルトガルが築いた要塞の門。いまはこの門だけが残る'),
 'd_victoria': ('ビクトリア号の複製船', '世界一周を果たしたビクトリア号を、当時の記録をもとに復元した船'),
 'd_smallpox': ('『フィレンツェ絵文書』の天然痘', '16世紀、スペイン人の修道士サアグンがアステカの人々から聞き取ってまとめた記録。天然痘に苦しむ人々が描かれている'),
}
def cr(t):
    i = info.get('File:' + t.replace('_', ' '))
    if not i: return 'Wikimedia Commons「' + t.replace('_', ' ') + '」'
    a = re.sub(r'(Unknown author|Unknown artist|Anonymous|anonymous)+', '作者不詳', (i['artist'] or '').strip())
    a = re.sub(r'\s+', ' ', a).strip(' ,') or '作者不詳'
    a = a.split('Note:')[0].split('See [')[0].strip()
    if 'unknown' in a.lower(): a = '作者不詳'
    lic = i['lic'] or ''
    lic = 'パブリックドメイン' if lic.lower().startswith('public domain') else lic
    return f"{a}／{lic}／Wikimedia Commons「{t.replace('_', ' ')}」"
PIC = {}
for k, t in sel.items():
    if k in CAP: PIC[k] = {'cap': CAP[k][0], 'd': CAP[k][1], 'cr': cr(t)}
    else: PIC['ch_' + k] = {'cap': k, 'cr': cr(t)}
open(os.path.join(D, 'pic.js'), 'w', encoding='utf-8').write('const PIC=' + json.dumps(PIC, ensure_ascii=False) + ';\n')
print(len(PIC))
for k, v in PIC.items(): print(k, v['cr'][:90])
