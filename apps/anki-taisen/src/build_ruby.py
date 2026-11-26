# src/ruby.tsv（難読語のふりがな）から data/ruby.json を作る。2026-11-24（README §2.0.6）
# 使い方: python3 apps/anki-taisen/src/build_ruby.py
# 値は読み（文字列）か、送りがな入りの語なら [["漢字","よみ"],"かな",...] の区切り
import re,json,sys,os
A=os.path.dirname(os.path.abspath(__file__))+"/../"
KAN=r'[一-鿿々ヶケ]'

def build():
    out={}; bad=[]
    for ln,l in enumerate(open(A+"src/ruby.tsv",encoding="utf8"),1):
        l=l.rstrip("\n")
        if not l.strip() or l.startswith("#"): continue
        if l.count("\t")!=1: bad.append((ln,l,"語<TAB>読み の形にする")); continue
        k,r=l.split("\t")
        if not re.fullmatch(r'[ぁ-ゟー]+',r): bad.append((ln,l,"読みはひらがなで")); continue
        if not re.search(KAN,k): bad.append((ln,l,"漢字のない語")); continue
        if k in out: bad.append((ln,l,"重複")); continue
        runs=re.findall(KAN+'+|[^一-鿿々ヶケ]+',k)
        if len(runs)==1: out[k]=r; continue
        # かなの部分を読みの中で順に探して漢字部分の読みを決める
        m=re.fullmatch("".join("(.+?)" if re.match(KAN,x) else re.escape(x) for x in runs),r)
        if not m: bad.append((ln,l,"かなが読みと合わない")); continue
        seg=[]; gi=1
        for x in runs:
            if re.match(KAN,x): seg.append([x,m.group(gi)]); gi+=1
            else: seg.append(x)
        out[k]=seg
    return out,bad

if __name__=="__main__":
    out,bad=build()
    for b in bad: print("NG",*b)
    if bad: sys.exit(1)
    json.dump(out,open(A+"data/ruby.json","w",encoding="utf8"),ensure_ascii=False,separators=(",",":"))
    print("ruby",len(out))
