# 地形の陰影画像を作る（Mapzen Terrain Tiles の標高から計算）。出力は作業フォルダ /tmp/claude-0/wk/terrain-*.jpg → ../../terrain-w-*.jpg にコピーし、cfg.js の terr を更新する
import terrain_dem as dem, json, math
T=[ # 名前, 西,北,東,南, 1度あたりの画素, タイルのズーム, この半径より寄ったら出す（0=常に）
 ('w0',-180,75,180,-58,10,4,0),
 ('iberia',-20,45,5,20,30,6,2500),('meso',-106,28,-60,6,30,6,2500),('andes',-84,0,-60,-24,30,6,2500),
 ('patagonia',-78,-44,-60,-56,30,6,2500),('cape',10,-24,35,-38,30,6,2500),('india',68,24,82,6,30,6,2500),
 ('seasia',95,22,132,-8,30,6,2500),('china',105,40,125,20,30,6,2500),('kyushu',124,36,134,26,30,6,2500),
 ('lisbon',-11,40,-5,35.5,90,8,600),('tenoch',-100.5,20.5,-95.5,18.5,90,8,600),('cajamarca',-81,-5,-77,-9,90,8,600),
 ('strait',-76,-51.5,-66,-55,60,7,600),('tane',129.5,32.2,132.5,29.8,90,8,600),
]
out=[]
for n,w,nn,e,s,ppd,z,show in T:
    ex=12*math.sqrt(30/ppd) if ppd<30 else (12.0 if ppd==30 else 8.5)
    sh=dem.save(n,w,nn,e,s,ppd,z,exag=ex,q=70)
    print(n,sh,flush=True)
    out.append({'n':n,'b':[w,nn,e,s],'z':show})
json.dump(out,open('terr.json','w'))
