#!/usr/bin/env python3
"""SUPER暗記大戦 札の関門（雑な札を公開させない機械チェック）

使い方:  python3 apps/anki-taisen/tools/check_cards.py [--all]
  - 引っかかった札が1枚でもあれば終了コード1（GitHub Actions でマージを止める）。
  - どうしても問題ない札は tools/check_allow.json に「規則:科目:答え」と理由を書いて通す。
    理由のない例外は認めない（空文字はエラー）。
  - --all を付けると例外リストも無視して全部表示する。
  - --choices 科目 [科目…] で、各札の4択の誤答候補（上位3つと点数）を一覧にする。札を作ったら必ず読む。

調べること（2026-11-18 経太さんに叱られた点を仕組みにしたもの）
  leak      問題文に答え（別解・かっこ書き・2文字以上の固有部分を含む）が入っている
  pair      答えが「AとB」「A・B（漢字どうし）」のような2つ組
  reverse   問題と答えの向きが逆（問題文が短すぎる／答えが説明文になっている）
  term      答えが用語になっていない（長すぎる・句点・「〜こと」など）
  hint      問題文の中に答えと同じ名字・同じ頭の部分（例: 志ん朝の札に「志ん生」）
  vague     同じ科目に同じ問題文が2枚（答えが1つに決まらない）
  dup       同じ科目に同じ答えが2枚
  choice    選択式で正解が誤答に混じる・誤答が重複・3つない
  weak      4択で迷う余地がない（同じまとまり・同じ字種・同じ語尾の誤答候補が3つそろわない。札に dw で誤答3つを手で書くか、候補の札を足す）
  field     必須の欄（t・d・x）が空
  img       資料画像: ファイルがない・同じ画像を別の札で使い回し・索引にない札
"""
import json, os, re, sys, glob, unicodedata, hashlib

HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.dirname(HERE)
DATA = os.path.join(APP, "data")
ALLOW_PATH = os.path.join(HERE, "check_allow.json")

# 問題形式の科目（答えが式・仕訳・英文）。leak/hint/term/reverse は当てはまらない
PROBLEM = {"math", "boki3", "wabun"}
# 札ではない辞書・索引
SKIP = {"dx-en", "dx-history", "topics"}
# 英語の言葉の科目（答えが英語、問題文が日本語）
ENGLISH = {"envocab", "enbiz", "enphrase"}

KANJI = r"一-鿿々"
KATA = r"゠-ヿ"


def norm(s):
    s = unicodedata.normalize("NFKC", s or "")
    s = re.sub(r"[（(][^）)]*[）)]", "", s)       # かっこ書きは外す
    s = re.sub(r"[\s「」『』〈〉《》・、。,.!?！？:：;；\-‐ー〜~]", "", s)
    return s.lower()


def paren_parts(s):
    s = unicodedata.normalize("NFKC", s or "")
    return [p for p in re.findall(r"[（(]([^）)]*)[）)]", s) if p]


def leak_parts(t):
    """答えのうち、問題文に入っていたら答えがばれる部分"""
    n = norm(t)
    parts = set()
    if len(n) >= 2:
        parts.add(n)
    for p in paren_parts(t):
        pn = norm(p)
        if len(pn) >= 2:
            parts.add(pn)
    # 中黒・スペース区切りの人名（例: フランシスコ・ザビエル）は各部分も（3文字以上）
    for seg in re.split(r"[・\s=＝]", unicodedata.normalize("NFKC", t)):
        sn = norm(seg)
        if len(sn) >= 3:
            parts.add(sn)
    return parts


def hint_parts(t):
    """答えの頭2文字（漢字・かなの固有部分）。名字・亭号などが問題文に出ていないか"""
    n = norm(t)
    out = set()
    if len(n) >= 3 and re.match(rf"^[{KANJI}]", n):
        out.add(n[:2])          # 志ん朝→「志ん」、徳川家康→「徳川」
    m = re.match(rf"^([{KATA}]{{3,}})", n)
    if m and len(n) > len(m.group(1)):
        out.add(m.group(1))     # カタカナ＋漢字の語の頭
    return out


GENERIC_HEAD = set("""日本 世界 国際 社会 経済 政治 文化 時代 自然 科学 一般 基本 主要 代表 中央 地方 国民 国家 人間 生活 天然 自由
大日 小説 新古 東洋 西洋 中国 朝鮮 欧州 近代 現代 古代 中世 第一 第二 第三 大乗 上座 浄土 宗教 神道 仏教 天皇 平成 令和 昭和 大正 明治
共同 公共 公的 民間 個人 有効 無効 相対 絶対 正の 負の 一次 二次 不動 動産 金融 財政 貿易 産業 市場 価格 所得 消費 生産 労働 資本 資産 負債
""".split())


SUFFIXES = ["主義","理論","の法則","法則","効果","バイアス","仮説","説","法","率","権","制度","制","条約","問題","教","宗","派","寺","神社","宮","人","者","家","学","論","性","化","型","式","体","物","素","酸","星","雲","座","画","像","祭","語","曲","山","島","川"]
def name_kind(t):
    t = re.sub(r"[（(][^）)]*[）)]", "", t)
    if re.fullmatch(r"[\u30a0-\u30ff・ー＝=\s]+", t): return "kata"
    if re.fullmatch(r"[A-Za-z0-9\s\-/.&'’]+", t): return "latin"
    if re.search(r"[\u4e00-\u9fff]", t) and not re.search(r"[\u30a0-\u30ff]", t): return "kanji"
    return "mix"
def suffix_of(t):
    t = re.sub(r"[（(][^）)]*[）)]", "", t)
    return next((x for x in SUFFIXES if t.endswith(x) and len(t) > len(x)), "")
def d_score(c, x):
    """src.html の distractorScore と同じ（乱数を除く）"""
    sc = 0
    if x.get("g") and x.get("g") == c.get("g"): sc += 3
    if x["t"] in (c.get("r") or []): sc += 2
    if c["t"] in (x.get("r") or []): sc += 1
    if name_kind(x["t"]) == name_kind(c["t"]): sc += 2
    sf = suffix_of(c["t"])
    if sf and suffix_of(x["t"]) == sf: sc += 2
    a, b = len(c["t"]), len(x["t"])
    if abs(a - b) <= max(1, a * 0.3): sc += 1
    if x["t"] in (c.get("a") or []): sc -= 99
    if len(x["t"]) >= 2 and x["t"] in c.get("d", ""): sc -= 99
    return sc
WEAK_MIN = 4   # 3番目の誤答がこの点に届かなければ「迷う余地がない」（同じまとまり3＋長さ1、同じ字種2＋同じ語尾2 など）
# 点数は字面しか見ない。人物の札に物の名前が並ぶような意味のずれは --choices で一覧を出して人が読む

def load_allow():
    if not os.path.exists(ALLOW_PATH):
        return {}
    a = json.load(open(ALLOW_PATH, encoding="utf8"))
    bad = [k for k, v in a.items() if not str(v).strip()]
    if bad:
        print("check_allow.json に理由のない例外があります:", bad)
        sys.exit(1)
    return a


def check_cards():
    errs = []
    def err(rule, f, t, msg):
        errs.append((rule, f, t, msg))

    global HEADS
    HEADS = {}
    for path in glob.glob(os.path.join(DATA, "*.json")):
        f = os.path.basename(path)[:-5]
        if f in SKIP or f in PROBLEM or f in ENGLISH:
            continue
        for c in json.load(open(path, encoding="utf8")):
            for h in hint_parts(c.get("t", "")):
                HEADS.setdefault(h, set()).add(norm(c.get("t", "")))
    for path in sorted(glob.glob(os.path.join(DATA, "*.json"))):
        f = os.path.basename(path)[:-5]
        if f in SKIP:
            continue
        cards = json.load(open(path, encoding="utf8"))
        if not isinstance(cards, list):
            continue
        seen_t, seen_d = {}, {}
        for c in cards:
            t, d, x = c.get("t", ""), c.get("d", ""), c.get("x", "")
            for k in ("t", "d", "x"):
                if not str(c.get(k, "")).strip():
                    err("field", f, t, f"欄 {k} が空")
            nt, nd = norm(t), norm(d)
            key_t, key_d = nt, nd
            if f in PROBLEM:   # 問題形式は答えが同じでも問題が違えばよい
                key_d = re.sub(r"\s", "", d)
                key_t = key_d + "|" + re.sub(r"\s", "", t)
            if key_t in seen_t:
                err("dup", f, t, "同じ答えの札が2枚")
            seen_t[key_t] = 1
            if key_d in seen_d:
                err("vague", f, t, f"問題文が「{seen_d[key_d]}」の札と同じ（答えが1つに決まらない）")
            seen_d[key_d] = t

            for wk in ("w", "dw"):  # 選択式の誤答（w）・4択の誤答の手書き（dw）
                if wk not in c:
                    continue
                w = c.get(wk) or []
                if len(w) != 3:
                    err("choice", f, t, f"誤答が {len(w)} 個（3個にする）")
                sq = lambda v: re.sub(r"\s", "", unicodedata.normalize("NFKC", v))
                if sq(t) in [sq(v) for v in w] or any(sq(a) in [sq(v) for v in w] for a in c.get("a") or []):
                    err("choice", f, t, "正解（別解を含む）が誤答に混じっている")
                if len({sq(v) for v in w}) != len(w):
                    err("choice", f, t, "誤答が重複")

            if f in PROBLEM:
                continue

            # weak: 4択の誤答候補（w・dw が手書きされていればそれを使うので調べない）
            if not c.get("w") and not c.get("dw") and f not in ENGLISH:
                sc = sorted((d_score(c, x) for x in cards if x is not c and x["t"] != c["t"]), reverse=True)
                if len(sc) < 3 or sc[2] < WEAK_MIN:
                    err("weak", f, t, f"4択で迷う余地がない（誤答候補の3番目が {sc[2] if len(sc) > 2 else '-'} 点）")

            # leak: 問題文に答え
            for p in sorted([nt] if f in ENGLISH else leak_parts(t)):
                if p and p in nd:
                    err("leak", f, t, f"問題文に答え「{p}」が入っている")
                    break
            for a in c.get("a") or []:
                na = norm(a)
                if len(na) >= 2 and na in nd and na != nt:
                    err("leak", f, t, f"問題文に別解「{a}」が入っている")
                    break

            if f in ENGLISH:
                continue

            # pair: 2つ組の答え
            tt = unicodedata.normalize("NFKC", re.sub(r"[（(][^）)]*[）)]", "", t))
            if re.search(rf"[{KANJI}{KATA}]{{2,}}と[{KANJI}{KATA}]{{2,}}$", tt) or \
               re.search(rf"[{KANJI}]・[{KANJI}]", tt) or "、" in tt:
                err("pair", f, t, "答えが2つ組（1枚に1つの答えにする）")

            # term: 用語になっていない答え
            if len(nt) > 18 or "。" in t or re.search(r"(こと|である|すること|ている)$", tt):
                err("term", f, t, "答えが用語になっていない（長い・文になっている）")

            # reverse: 向きが逆
            if f == "jpn":
                pass   # 日本語の言葉は「意味→言葉」の出題なので問題文が短くてよい
            elif len(nd) < 6:
                err("reverse", f, t, f"問題文が短すぎる「{d}」（問題と答えが逆では？）")
            elif len(nt) > len(nd):
                err("reverse", f, t, "答えが問題文より長い（問題と答えが逆では？）")

            # hint: 答えと頭が同じ別の札の答え（例: 志ん朝の札に「志ん生」）が問題文に出ている
            hit = None
            for h in sorted(hint_parts(t)):
                if h in GENERIC_HEAD:
                    continue
                for t2 in sorted(HEADS.get(h, ())):
                    if t2 not in norm(t) and len(t2) >= 3 and t2 in nd:
                        hit = t2
                        break
                if hit:
                    break
            if hit:
                err("hint", f, t, f"問題文に答えと頭が同じ「{hit}」が出ている（ヒントが強すぎ）")
    return errs


def check_images():
    errs = []
    html = open(os.path.join(APP, "index.html"), encoding="utf8").read()
    m = re.search(r"const CIMG = (\{.*?\});\n", html, re.S)
    if not m:
        return [("img", "-", "-", "index.html に CIMG が見つからない")]
    cimg = json.loads(m.group(1))
    for f, entries in cimg.items():
        path = os.path.join(DATA, f + ".json")
        keys = set()
        if os.path.exists(path):
            for c in json.load(open(path, encoding="utf8")):
                keys.add(c.get("t"))
                if c.get("k"):
                    keys.add(c["k"])
        used = {}
        for key, v in entries.items():
            src = v[0] if isinstance(v, list) else v
            fn = os.path.join(APP, src) if not src.startswith("http") else None
            if fn and not os.path.exists(fn):
                errs.append(("img", f, key, f"画像ファイルがない {src}"))
            if keys and key not in keys:
                errs.append(("img", f, key, "資料画像の索引にあるが、その札がない"))
            # 中身が同じ画像（別名で保存した同じ写真も含む）の使い回し
            h = (v[3] if isinstance(v, list) and len(v) > 3 and v[3] else None) or \
                (hashlib.md5(open(fn, "rb").read()).hexdigest() if fn and os.path.exists(fn) else src)
            if h in used:
                errs.append(("img", f, key, f"同じ画像を「{used[h]}」の札と使い回し"))
            else:
                used[h] = key
    return errs


def show_choices(genres):
    for g in genres:
        cs = json.load(open(os.path.join(DATA, g + ".json")))
        for c in cs:
            if c.get("w") or c.get("dw"):
                print(f"手 {g} / lv{c.get('lv')} {c['t']} | " + " / ".join(c.get("w") or c["dw"]))
                continue
            sc = sorted(((d_score(c, x), x["t"]) for x in cs if x is not c and x["t"] != c["t"]), reverse=True)[:3]
            mark = "弱" if len(sc) < 3 or sc[2][0] < WEAK_MIN else "  "
            print(f"{mark} {g} / lv{c.get('lv')} {c['t']} | " + " / ".join(f"{t}({s})" for s, t in sc))


def main():
    if "--choices" in sys.argv:
        show_choices(sys.argv[sys.argv.index("--choices") + 1:])
        return
    show_all = "--all" in sys.argv
    allow = {} if show_all else load_allow()
    errs = check_cards() + check_images()
    out, used = [], set()
    for rule, f, t, msg in errs:
        key = f"{rule}:{f}:{t}"
        if key in allow:
            used.add(key)
            continue
        out.append(f"[{rule}] {f} / {t}: {msg}")
    stale = sorted(set(allow) - used)
    if not show_all and stale:
        for k in stale:
            out.append(f"[allow] {k}: 例外リストにあるが、もう引っかからない（消す）")
    for line in out:
        print(line)
    print(f"札の関門: {len(out)} 件")
    sys.exit(1 if out else 0)


if __name__ == "__main__":
    main()
