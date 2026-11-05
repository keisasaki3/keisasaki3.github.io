# 世界の海岸線（Natural Earth 50m land）を地図パスにする。経度-30より東の陸は経度-360の写しも足す（太平洋をまたぐ航路用）。南極は除く
import json, math, sys
LON0, LAT0, K = 0, 20, 100
CS = math.cos(math.radians(LAT0))
tol = float(sys.argv[1]) if len(sys.argv) > 1 else 0.04
g = json.load(open('/tmp/claude-0/w/land.geojson'))
def dp(pts, eps):
    if len(pts) < 3: return pts
    keep = [False]*len(pts); keep[0] = keep[-1] = True
    st = [(0, len(pts)-1)]
    while st:
        a, b = st.pop()
        ax, ay = pts[a]; bx, by = pts[b]; dx, dy = bx-ax, by-ay; L = math.hypot(dx, dy) or 1e-12
        md, mi = -1, -1
        for i in range(a+1, b):
            px, py = pts[i]
            d = abs(dy*(px-ax) - dx*(py-ay))/L if L > 1e-12 else math.hypot(px-ax, py-ay)
            if d > md: md, mi = d, i
        if md > eps:
            keep[mi] = True; st += [(a, mi), (mi, b)]
    return [p for p, k in zip(pts, keep) if k]
def area(r):
    return abs(sum(r[i][0]*r[i-1][1]-r[i-1][0]*r[i][1] for i in range(len(r))))/2
out = []; n = 0
for f in g['features']:
    geom = f['geometry']; polys = geom['coordinates'] if geom['type'] == 'MultiPolygon' else [geom['coordinates']]
    for poly in polys:
        for ring in poly:
            if max(p[1] for p in ring) < -58: continue
            if area(ring) < 0.03: continue
            r = dp([(p[0], p[1]) for p in ring], tol)
            if len(r) < 4: continue
            shifts = [0] + ([-360] if max(p[0] for p in r) > -30 else [])
            for s in shifts:
                pts = [(round((x+s-LON0)*CS*K), round(-(y-LAT0)*K)) for x, y in r]
                # 相対座標（l dx dy ...）で書いて軽くする
                pts2 = [pts[0]] + [p for i, p in enumerate(pts[1:], 1) if p != pts[i-1]]
                d = f'M{pts2[0][0]} {pts2[0][1]}l' + ' '.join(f'{b[0]-a[0]} {b[1]-a[1]}' for a, b in zip(pts2, pts2[1:])) + 'z'
                d = d.replace(' -', '-')
                out.append(d); n += len(pts)
p = ''.join(out)
open('/tmp/claude-0/wk/world_path.txt', 'w').write(p)
print(len(p), n)
