import json,re,shutil,os
W="/tmp/claude-0/-home-user/dd8d89dc-c5b4-5e31-b2ab-1af8fdd2f758/scratchpad/"
info=json.load(open("info.json")); wd=json.load(open("wd.json")); xc=json.load(open("xc.json"))
choice=json.load(open("choice.json")) if os.path.exists("choice.json") else {}
extra=json.load(open("extra.json")) if os.path.exists("extra.json") else {}
src=open('/mnt/project-files/mekuri-battle/birds.js',encoding='utf8').read()
rows=re.findall(r'^\["([^"]+)",(\d),"[^"]*","([^"]+)"',src,re.M)
def lic_short(l):
    m=re.match(r"Creative Commons Attribution-?(NonCommercial)?-?(ShareAlike|NoDerivs)? ([\d.]+)",l)
    if not m: return l
    return "CC BY"+("-NC" if m.group(1) else "")+({"ShareAlike":"-SA","NoDerivs":"-ND"}.get(m.group(2),""))+" "+m.group(3)
os.makedirs(W+"site/b",exist_ok=True)
media={}; missing=[]
for ja,lv,sci in rows:
    slug=sci.lower().replace(" ","-"); m={}
    cands=[f for f in wd[sci]["imgs"]+extra.get(sci,[]) if f in info]
    f=choice.get(sci) or (cands[0] if cands else None)
    if f=="NONE": f=None
    if f:
        d=info[f]; shutil.copy(d["local"],W+f"site/b/{slug}.jpg")
        m["img"]=[f"b/{slug}.jpg",d["artist"] or "不明",d["lic"] or "不明",d["page"]]
    else: missing.append(ja)
    x=xc.get(sci)
    if x and os.path.exists(f"clips/{slug}.mp3"):
        p=x["pick"]; shutil.copy(f"clips/{slug}.mp3",W+f"site/b/{slug}.mp3")
        loc=p["cnt"] if p["cnt"]!="Japan" else "日本"
        m["snd"]=[f"b/{slug}.mp3",p["rec"],lic_short(p["lic"]),"XC"+p["id"] if False else p["id"],loc]
    media[sci]=m
s=open(W+"site/src.html",encoding="utf8").read()
hm=json.load(open(W+"w/hmedia.json")) if os.path.exists(W+"w/hmedia.json") else {}
s=s.replace("const HMEDIA = {/*HMEDIA*/};","const HMEDIA = "+json.dumps(hm,ensure_ascii=False,separators=(",",":")).replace("],\"","],\n\"")+";")
dm=json.load(open(W+"hk/dmedia.json")) if os.path.exists(W+"hk/dmedia.json") else {}
import glob as _g, os as _o
_cdir="/mnt/project-files/mekuri-battle/concepts/"
_o.makedirs(W+"site/data",exist_ok=True)
_subj=re.findall(r'\{id:"(\w)",f:"(\w+)",name:"[^"]*"(,en:1)?(?:,k:1)?\}',s[s.index("const SUBJ=["):s.index("];",s.index("const SUBJ=["))])
_cman={}; _didx={}; _tps={}
def _wd(name,arr):
    open(W+"site/data/"+name+".json","w").write(json.dumps(arr,ensure_ascii=False,separators=(",",":")))
_VIS=json.load(open(_cdir+"visual.json")) if _o.path.exists(_cdir+"visual.json") else {}
for _id,_f,_en in _subj:
    if not _o.path.exists(_cdir+_f+".json"): continue
    _a=json.load(open(_cdir+_f+".json"))
    _ap=_cdir+"alias/"+_f+".json"   # 入力で答えるときの別解（読みがな・別名）
    if _o.path.exists(_ap):
        _al=json.load(open(_ap))
        for _c in _a:
            if _al.get(_c["t"]): _c["a"]=_al[_c["t"]]
    _vis=set(_VIS.get(_f,[]))   # 見た目で覚える札（画像で出題できる）
    for _c in _a:
        if _c["t"] in _vis: _c["v"]=1
    _wd(_f,_a); _cman[_f]=len(_a)
    for _c in _a: _didx.setdefault(_c["t"],[_f,1 if _en else 0])
    for _c in _a:
        if _c.get("tp"): _tps[_c["tp"]]=_tps.get(_c["tp"],0)+1
for _name,_src,_l in (("dx-history","dict-history.json",0),("dx-en","dict-en.json",1)):
    if not _o.path.exists(_cdir+_src): continue
    _a=json.load(open(_cdir+_src))
    for _e in _a:
        if _l: _e["l"]=1
        _didx.setdefault(_e["t"],[_name,_l])
    _wd(_name,_a)
s=s.replace("const CMAN = {/*CMAN*/};","const CMAN = "+json.dumps(_cman,ensure_ascii=False,separators=(",",":"))+";")
s=s.replace("const DIDX = {/*DIDX*/};","const DIDX = "+json.dumps(_didx,ensure_ascii=False,separators=(",",":"))+";")
_wd("topics",_tps)  # 人生クエストが習得度の分母に使う（トピック→札の枚数）
print("subjects",len(_cman),"dict index",len(_didx))
_ci="/mnt/project-files/mekuri-battle/concepts/img/"
_cim=json.load(open(_ci+"index.json")) if _o.path.exists(_ci+"index.json") else {}
_o.makedirs(W+"site/ci",exist_ok=True); _nci=0
for _sf,_m in _cim.items():
    for _t,_v in list(_m.items()):
        _fn=_o.path.basename(_v[0])
        if _o.path.exists(_ci+_fn): shutil.copy(_ci+_fn,W+"site/ci/"+_fn); _v[0]="ci/"+_fn; _nci+=1
        else: del _m[_t]
s=s.replace("const CIMG = {/*CIMG*/};","const CIMG = "+json.dumps(_cim,ensure_ascii=False,separators=(",",":"))+";")
print("cimg",_nci)
print("concepts",_cman)
s=s.replace("const DMEDIA = {/*DMEDIA*/};","const DMEDIA = "+json.dumps(dm,ensure_ascii=False,separators=(",",":")).replace('},"','},\n"')+";")
_b2p="/mnt/project-files/mekuri-battle/b2/b2media.json"
_b2=json.load(open(_b2p)) if os.path.exists(_b2p) else {}
for _sci,_v in _b2.items():
    for _k in ("img2","snd2"):
        if _k in _v:
            _fn=os.path.basename(_v[_k][0]); _src="/mnt/project-files/mekuri-battle/b2/"+_fn
            if os.path.exists(_src): shutil.copy(_src,W+"site/b/"+_fn)
            else: del _v[_k]
s=s.replace("const B2MEDIA = {/*B2MEDIA*/};","const B2MEDIA = "+json.dumps(_b2,ensure_ascii=False,separators=(",",":"))+";")
print("b2",sum("img2" in v for v in _b2.values()),sum("snd2" in v for v in _b2.values()))
s=s.replace("const MEDIA = {/*MEDIA*/};","const MEDIA = "+json.dumps(media,ensure_ascii=False,separators=(",",":")).replace('},"','},\n"')+";")
open(W+"site/index.html","w",encoding="utf8").write(s)
print("missing photos:",missing,"sounds:",sum(1 for v in media.values() if "snd" in v))
# 音で出題する札の音源（concepts/snd/index.json → CSND と site/cs/）
_sd="/mnt/project-files/mekuri-battle/concepts/snd/"
_snd=json.load(open(_sd+"index.json")) if os.path.exists(_sd+"index.json") else {}
os.makedirs(W+"site/cs",exist_ok=True)
for _sf,_m in _snd.items():
    for _t,_v in list(_m.items()):
        _fn=os.path.basename(_v[0])
        if os.path.exists(_sd+_fn): shutil.copy(_sd+_fn,W+"site/cs/"+_fn)
        else: del _m[_t]
_h=open(W+"site/index.html",encoding="utf8").read().replace("const CSND = {/*CSND*/};","const CSND = "+json.dumps(_snd,ensure_ascii=False,separators=(",",":"))+";")
open(W+"site/index.html","w",encoding="utf8").write(_h)
print("csnd",sum(len(m) for m in _snd.values()))
