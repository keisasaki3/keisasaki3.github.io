import json, os, re
from PIL import Image
SP = '/tmp/claude-0/-home-user/af30580b-6d17-5f86-a327-48ef97a5e3f9/scratchpad/'
info = json.load(open(SP + 'info2.json')); sel = json.load(open(SP + 'sel.json'))
CAP = {
 'd_heiji': ('平治物語絵巻「三条殿夜討巻」', '平治の乱で、御所が夜討ちにあう場面。13世紀（ボストン美術館）'),
 'd_nokyo': ('平家納経', '1164年、清盛が一門の繁栄を願って厳島神社に納めたお経。豪華な装飾が平氏の富を物語る'),
 'd_sosen': ('北宋銭', '日宋貿易で大量に持ちこまれ、日本でもお金として使われた'),
 'p_hiru': ('蛭ヶ小島（静岡県伊豆の国市）', '頼朝が流されていた地と伝わる'),
 'p_tsuru': ('鶴岡八幡宮（鎌倉）', '頼朝が鎌倉の中心に据えた神社。1219年、実朝はここで暗殺された'),
 'p_yui': ('由比ヶ浜（鎌倉）', '三方を山、一方を海に囲まれた鎌倉は、守りやすい土地だった'),
 'p_fuji': ('富士川と富士山', '1180年、平氏の大軍と頼朝方が向き合った川'),
 'p_hiyo': ('鵯越の逆落とし（歌川広重）', '一ノ谷の戦いで、義経が崖を駆け下りたという伝説の場面。江戸時代の浮世絵'),
 'p_yashima': ('屋島（香川県高松市）', '平氏が拠点を置いた台地。当時は海に浮かぶ島だった'),
 'p_yashima2': ('屋島から見た高松の町', ''),
 'p_dan': ('安徳天皇縁起絵図「壇ノ浦合戦」', '壇ノ浦で平氏が滅ぶ場面。幼い安徳天皇もこの海に沈んだ（赤間神宮）'),
 'p_dan2': ('壇ノ浦古戦場址と関門橋', '本州と九州の間、潮の流れが速い海峡'),
 'p_oki': ('隠岐神社（島根県隠岐郡）', '承久の乱のあと流された後鳥羽上皇は、この島で生涯を終えた'),
 'd_shikimoku': ('御成敗式目', '17世紀の写本（東洋文庫）'),
}
def cr(t):
    i = info[t]; a = re.sub(r'(Unknown author)+', '作者不詳', i['artist'] or '').strip() or '作者不詳'
    lic = i['lic'] or ''
    lic = 'パブリックドメイン' if lic.lower().startswith('public domain') else lic
    return f"{a}／{lic}／Wikimedia Commons「{t[5:]}」"
os.makedirs(SP + 'pub/pic', exist_ok=True)
PIC = {}
for k, t in sel.items():
    raw = SP + 'raw/' + k + '.jpg'
    if not os.path.exists(raw): continue
    if k in CAP:
        im = Image.open(raw); im.thumbnail((960, 960)); im.save(SP + 'pub/pic/' + k + '.jpg', quality=78, optimize=True)
        PIC[k] = {'cap': CAP[k][0], 'd': CAP[k][1], 'cr': cr(t)}
    elif os.path.exists(SP + 'pub/ch/' + k + '.jpg'):
        PIC['ch_' + k] = {'cap': k, 'cr': cr(t)}
open(SP + 'pic.js', 'w').write('const PIC=' + json.dumps(PIC, ensure_ascii=False) + ';\n')
print(sorted(PIC))
