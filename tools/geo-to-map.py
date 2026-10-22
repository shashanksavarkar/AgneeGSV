# one-off: converts assets/Maps geojson (UTM 43N) into map-pixel footprints/trees for src/modules/campus-geo.js
import json,numpy as np
th,s,tx,ty=0.01244833,0.925145,93.6386,430.9724  # fitted: map px -> UTM metres (ICP vs traced roads)
x0,y0=314106.5,2464763.26
c,sn=np.cos(-th),np.sin(-th)
def px(e,n):
    mx,my=e-x0-tx,n-y0-ty
    return (c*mx-sn*my)*s, -(sn*mx+c*my)*s
def inside(x,y,m=15): return -m<x<751+m and -m<y<430+m
B=[];T=[]
d=json.load(open('assets/Maps/buildings_3d_Buildings_Overture.geojson'))
for f in d['features']:
    g=f['geometry'];ps=g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
    for p in ps:
        r=[px(a,b) for a,b,*_ in p[0]][:-1]
        cx=sum(q[0] for q in r)/len(r);cy=sum(q[1] for q in r)/len(r)
        if not inside(cx,cy,0): continue
        area=abs(sum(r[i][0]*r[(i+1)%len(r)][1]-r[(i+1)%len(r)][0]*r[i][1] for i in range(len(r))))/2
        if area<14 or area>7000: continue
        B.append([f['properties'].get('height') or 6]+[round(v,1) for q in r for v in q])
d=json.load(open('assets/Maps/trees_Trees_TPX.geojson'))
for f in d['features']:
    x,y=px(*f['geometry']['coordinates'][:2])
    if inside(x,y,0): T.append([round(x,1),round(y,1),round(f['properties']['crown_diameter']*s,1)])
open('src/modules/campus-geo.js','w',encoding='utf-8').write('// Real footprints (Overture, [height, x,y, ...]) and tree tops ([x, y, crown]) in map pixels, generated from assets/Maps.\nconst GEO = '+json.dumps({'b':B,'t':T},separators=(',',':'))+';\n')
print(len(B),len(T))
