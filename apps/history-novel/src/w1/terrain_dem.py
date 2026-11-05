# 標高タイル（Mapzen Terrain Tiles, terrarium 形式）を取ってきて、正距円筒の陰影画像（明るい画面用・暗い画面用）を作る
import numpy as np, math, os, io, urllib.request, concurrent.futures as cf
from PIL import Image
CACHE='/tmp/claude-0/w/tiles'; os.makedirs(CACHE,exist_ok=True)
def tile(z,x,y):
    f=f'{CACHE}/{z}_{x}_{y}.png'
    if not os.path.exists(f):
        for t in range(4):
            try:
                d=urllib.request.urlopen(f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',timeout=30).read();open(f,'wb').write(d);break
            except Exception as e: err=e
    a=np.asarray(Image.open(f).convert('RGB')).astype(np.float32)
    return a[...,0]*256+a[...,1]+a[...,2]/256-32768
def mx(lon,z): return (lon+180)/360*256*2**z
def my(lat,z):
    lat=np.clip(lat,-85,85);r=np.radians(lat);return (1-np.log(np.tan(r)+1/np.cos(r))/math.pi)/2*256*2**z
def dem(w,n,e,s,ppd,z):
    W=round((e-w)*ppd);H=round((n-s)*ppd)
    lons=w+(np.arange(W)+.5)/ppd; lats=n-(np.arange(H)+.5)/ppd
    X=mx(((lons+180)%360)-180,z); Y=my(lats,z)
    tx=sorted(set((X//256).astype(int)));ty=sorted(set((Y//256).astype(int)))
    need=[(x,y) for x in tx for y in ty]
    with cf.ThreadPoolExecutor(16) as ex: arrs=dict(zip(need,ex.map(lambda t:tile(z,*t),need)))
    out=np.zeros((H,W),np.float32)
    xi=X.astype(int);yi=Y.astype(int)
    for j in range(H):
        ty_=yi[j]//256;ry=yi[j]%256
        for (x,y),a in arrs.items():
            if y!=ty_:continue
            m=(xi//256)==x
            out[j,m]=a[ry,xi[m]%256]
    return out
def shade(el,ppd,lat0,exag=1.0):
    mpp_y=111320/ppd; mpp_x=mpp_y*math.cos(math.radians(lat0))
    gy,gx=np.gradient(el*exag); dzdx=gx/mpp_x; dzdy=-gy/mpp_y
    az=math.radians(315);alt=math.radians(45)
    slope=np.arctan(np.hypot(dzdx,dzdy)); aspect=np.arctan2(dzdy,-dzdx)
    hs=np.sin(alt)*np.cos(slope)+np.cos(alt)*np.sin(slope)*np.cos(az-math.pi/2-aspect)
    return np.clip(hs/np.sin(alt),0,1.3)
def save(name,w,n,e,s,ppd,z,exag=1.0,q=72):
    el=dem(w,n,e,s,ppd,z); hs=shade(el,ppd,(n+s)/2,exag)
    light=np.clip(255*np.minimum(hs,1)**1.15,0,255)
    light=np.where(el<=0,255,light).astype(np.uint8)
    Image.fromarray(light,'L').save(f'/tmp/claude-0/wk/terrain-{name}.jpg',quality=q,optimize=True)
    v=np.clip(hs,0,1.3)
    d=np.stack([np.clip(b*(0.55+0.45*v)+ (v>1)*(v-1)*90,0,255) for b in (38,42,48)],-1)
    d=np.where((el<=0)[...,None],np.array([38,42,48]),d).astype(np.uint8)
    Image.fromarray(d,'RGB').save(f'/tmp/claude-0/wk/terrain-{name}-d.jpg',quality=q,optimize=True)
    return light.shape
