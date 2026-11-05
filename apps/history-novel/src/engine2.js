const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const st={v:"title",i:0,sub:0,wait:false,seen:[],dug:new Set(),rec:[0,0],pre:[0,0],miss:[],ans:{},stack:[],sheet:null,
  perm:null,nd:0,om:0, role:"solo", ep:0, lastS:""};
const isFollower=()=>st.role==="follow";

/* ---------- sound (synthesized, off by default until first gesture) ---------- */
let snd=true,vol=70,actx=null;
try{snd=localStorage.getItem("snd")!=="0";const v=parseInt(localStorage.getItem("vol"),10);if(v>=0&&v<=100)vol=v;}catch(e){}
const VF=()=>vol/70;/* 70 が従来の音量 */
function tone(f,d,v,type){if(!snd||!vol)return;try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();
  const o=actx.createOscillator(),g=actx.createGain();o.type=type||"sine";o.frequency.value=f;g.gain.value=0;
  o.connect(g);g.connect(actx.destination);const t=actx.currentTime;g.gain.linearRampToValueAtTime(Math.max(.0002,(v||.06)*VF()),t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.start(t);o.stop(t+d+.02);}catch(e){}}
const SE={page:()=>tone(520,.08,.03,"triangle"),scene:()=>{tone(392,.35,.05);setTimeout(()=>tone(523,.45,.05),120);},
  ok:()=>{tone(660,.15,.06);setTimeout(()=>tone(880,.25,.06),110);},ifr:()=>{tone(330,.3,.05,"triangle");setTimeout(()=>tone(311,.4,.05,"triangle"),160);},ng:()=>tone(220,.3,.05,"triangle")};
/* 音: スピーカーのアイコン一つ。押すと音量スライダーと「音を消す」が開く（暗記大戦と同じ形、2026-11-05 経太さん） */
const ICO_ON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
const ICO_OFF='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';
const audible=()=>snd&&vol>0;
function saveSnd(){try{localStorage.setItem("snd",snd?"1":"0");localStorage.setItem("vol",String(vol));}catch(x){}}
function drawSnd(){const b=$("bSnd");b.innerHTML=audible()?ICO_ON:ICO_OFF;b.setAttribute("aria-label",audible()?"音（オン・音量"+vol+"）":"音（オフ）");b.classList.toggle("on",audible());
  $("sndVol").value=vol;$("sndVolN").textContent=vol;$("sndMute").textContent=snd?"音を消す":"音を出す";}
function sndPop(open){const p=$("sndPop");p.hidden=!open;$("bSnd").setAttribute("aria-expanded",String(open));}
$("bSnd").onclick=e=>{e.stopPropagation();if(!$("cfgPop").hidden)cfgPop(false);sndPop($("sndPop").hidden);};
$("sndPop").addEventListener("click",e=>e.stopPropagation());
/* 設定（歯車）: ノベルの文字の大きさ 小・中・大（端末に保存。2026-11-05 経太さん） */
const ICO_CFG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v2.6M12 18.9v2.6M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12h2.6M18.9 12h2.6M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8"/><circle cx="12" cy="12" r="6.6"/></svg>';
let fsz="m";try{const v=localStorage.getItem("fs");if(v==="s"||v==="l"||v==="m")fsz=v;}catch(e){}
function drawCfg(){document.documentElement.dataset.fs=fsz;document.querySelectorAll("#cfgPop [data-fs]").forEach(b=>b.setAttribute("aria-checked",String(b.dataset.fs===fsz)));}
function cfgPop(open){$("cfgPop").hidden=!open;$("bCfg").setAttribute("aria-expanded",String(open));}
$("bCfg").innerHTML=ICO_CFG;
$("bCfg").onclick=e=>{e.stopPropagation();if(!$("sndPop").hidden)sndPop(false);cfgPop($("cfgPop").hidden);};
$("cfgPop").addEventListener("click",e=>{e.stopPropagation();const b=e.target.closest("[data-fs]");if(!b)return;fsz=b.dataset.fs;try{localStorage.setItem("fs",fsz);}catch(x){}drawCfg();});
drawCfg();
$("sndVol").oninput=e=>{vol=+e.target.value;if(vol>0&&!snd)snd=true;saveSnd();drawSnd();if(bgmEl)bgmEl.volume=.35*vol/100;bgm(bgmWant);};
$("sndVol").onchange=()=>{if(audible())SE.page();};
$("sndMute").onclick=()=>{snd=!snd;if(snd&&!vol)vol=70;saveSnd();drawSnd();if(audible())SE.page();bgm(bgmWant);};

/* ---------- map ---------- */
/* 地図の基準（章ごとに CFG で決める。章の設定は cfg.js） */
const LON0=CFG.lon0,LAT0=CFG.lat0,K=100,CS=Math.cos(LAT0*Math.PI/180);
const HOME=()=>({c:CFG.init.c,r:CFG.init.r,pins:[],blink:null,ar:[]});
const pj=([lon,lat])=>[(lon-LON0)*CS*K,-(lat-LAT0)*K];
const pt=k=>Array.isArray(k)?k:P[k];
const svg=$("map"),landG=$("landG"),ovG=$("ovG");
let rafOn=false;let userCam=false,dragMoved=false;/* 地図を指で動かしている間は true（下の「地図を指で動かす」） */let W=1,H=1;const cam={x:0,y:0,s:1},from={x:0,y:0,s:1},to={x:0,y:0,s:1};let t0=0,DUR=1100,camInit=false;
let mstate=HOME(),els=[];
function resize(){const r=svg.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);if(!userCam)setTarget(true);}
new ResizeObserver(resize).observe(svg);
function setTarget(instant){
  /* r=短い辺の半分に入れる距離。rw があれば横幅の半分に rw を入れる（世界全体を見せる場面用）。
     fw=横幅の半分に最低限入れる距離（縦長のスマホで東西の端が切れないように。PCでは効かない） */
  const c=pj(pt(mstate.c));let s=mstate.rw?W/(2*mstate.rw):Math.min(W,H)/(2*mstate.r);if(mstate.fw)s=Math.min(s,W/(2*mstate.fw));
  Object.assign(from,cam);Object.assign(to,{x:c[0],y:c[1],s});t0=performance.now();
  if(instant||!camInit||matchMedia("(prefers-reduced-motion:reduce)").matches){Object.assign(cam,to);Object.assign(from,to);camInit=true;}
  kick();
}
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const scr=p=>{const q=pj(pt(p));return [(q[0]-cam.x)*cam.s+W/2,(q[1]-cam.y)*cam.s+H/2];};
function curve(ps){
  if(ps.length===2){const [a,b]=ps;const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,dx=b[0]-a[0],dy=b[1]-a[1];const cx=mx-dy*.15,cy=my+dx*.15;
    return {d:`M${a[0]} ${a[1]}Q${cx} ${cy} ${b[0]} ${b[1]}`,end:b,dir:[b[0]-cx,b[1]-cy],mid:[(a[0]+2*cx+b[0])/4,(a[1]+2*cy+b[1])/4]};}
  let d=`M${ps[0][0]} ${ps[0][1]}`;
  for(let i=0;i<ps.length-1;i++){const p0=ps[i-1]||ps[i],p1=ps[i],p2=ps[i+1],p3=ps[i+2]||p2;
    const c1=[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6],c2=[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6];
    d+=`C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
    if(i===ps.length-2)var dir=[p2[0]-c2[0],p2[1]-c2[1]];}
  const m=ps[Math.floor((ps.length-1)/2)],n=ps[Math.floor((ps.length-1)/2)+1];
  return {d,end:ps[ps.length-1],dir,mid:[(m[0]+n[0])/2,(m[1]+n[1])/2]};
}
const NS="http://www.w3.org/2000/svg";
function mk(tag,attrs,parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);parent&&parent.appendChild(e);return e;}
let prevArKeys=new Set();
function buildOverlay(){
  ovG.innerHTML="";els=[];const now=performance.now();const keys=new Set();
  mstate.ar.forEach(a=>{const key=JSON.stringify(a);keys.add(key);
    const g=mk("g",{class:"arw "+(a.s||"s")},ovG);const ln=mk("path",{class:"ln",pathLength:"1"},g);const hd=mk("path",{class:"hd"},g);const tx=mk("text",{"text-anchor":"middle"},g);tx.textContent=a.l||"";
    els.push({t:"a",a,ln,hd,tx,born:prevArKeys.has(key)?0:now+300});});
  prevArKeys=keys;
  const names=[...new Set([...mstate.pins,...(mstate.blink?[mstate.blink]:[])])];
  names.forEach(n=>{if(!P[n])return;const cur=n===mstate.blink;const g=mk("g",{class:"pin"+(cur?" cur":"")+(G[n]?" tap":""),"data-place":n},ovG);if(G[n])mk("circle",{class:"hit",r:"18"},g);
    const ring=cur&&!mstate.fl?mk("circle",{class:"ring",r:"9"},g):null;
    let flag=null;if(cur&&mstate.fl){flag=mk("g",{class:"flag "+mstate.fl},g);mk("line",{class:"pole",x1:0,y1:0,x2:0,y2:-34},flag);mk("path",{class:"cloth",d:"M0 -34 C8 -36 16 -31 24 -33 L24 -19 C16 -17 8 -22 0 -20 Z"},flag);}const dot=mk("circle",{class:"dot",r:cur?"5.5":"4"},g);const tx=mk("text",{},g);tx.textContent=P[n][2]||n;
    els.push({t:"p",n,g,ring,dot,tx,flag});});
  kick();
}
function place(now){
  for(const e of els){
    if(e.t==="a"){
      const ps=e.a.p.map(scr),c=curve(ps);e.ln.setAttribute("d",c.d);
      const k=e.born?Math.max(0,Math.min(1,(now-e.born)/1100)):1;const kk=ease(k);
      if(e.a.s==="if"){e.ln.style.opacity=kk;}else{e.ln.setAttribute("stroke-dasharray","1 1");e.ln.setAttribute("stroke-dashoffset",String(1-kk));}
      const [ex,ey]=c.end,L=Math.hypot(c.dir[0],c.dir[1])||1,ux=c.dir[0]/L,uy=c.dir[1]/L,sz=11;
      e.hd.setAttribute("d",`M${ex+ux*2} ${ey+uy*2}L${ex-ux*sz-uy*sz*.55} ${ey-uy*sz+ux*sz*.55}L${ex-ux*sz+uy*sz*.55} ${ey-uy*sz-ux*sz*.55}Z`);
      e.hd.style.opacity=k>=1?1:0;e.tx.style.opacity=k>=1?1:0;
      e.tx.setAttribute("x",c.mid[0]);e.tx.setAttribute("y",c.mid[1]-8);
    }else{
      const [x,y]=scr(P[e.n]);e.dot.setAttribute("cx",x);e.dot.setAttribute("cy",y);
      if(e.ring){e.ring.setAttribute("cx",x);e.ring.setAttribute("cy",y);}
      if(e.flag)e.flag.setAttribute("transform",`translate(${x} ${y})`);
      const right=x<W-90;e.tx.setAttribute("x",right?x+9:x-9);e.tx.setAttribute("y",y+4.5);e.tx.setAttribute("text-anchor",right?"start":"end");
    }
  }
}
function declutter(){
  const boxes=[];const items=[];
  els.forEach(e=>{if(e.t==="p"&&e.ring)items.push([0,e]);});
  els.forEach(e=>{if(e.t==="a"&&e.a.l)items.push([1,e]);});
  els.forEach(e=>{if(e.t==="p"&&!e.ring)items.push([2,e]);});
  els.forEach(e=>{if(e.t==="p"){const x=+e.dot.getAttribute("cx"),y=+e.dot.getAttribute("cy");boxes.push([x-6,y-6,x+6,y+6]);}});
  const dots=boxes.length;
  for(const [pr,e] of items){
    const tx=e.tx,str=tx.textContent||"";if(!str)continue;
    const fs=pr===0?14:12.5,w=str.length*fs*1.02,x=+tx.getAttribute("x"),y=+tx.getAttribute("y");
    const anc=tx.getAttribute("text-anchor");const x0=anc==="end"?x-w:anc==="middle"?x-w/2:x;
    const bx=[x0-2,y-fs,x0+w+2,y+4];
    const hit=boxes.slice(pr===0?dots:0).some(q=>!(bx[2]<q[0]||bx[0]>q[2]||bx[3]<q[1]||bx[1]>q[3]))&&pr!==0;
    if(hit){tx.style.visibility="hidden";}else{tx.style.visibility="visible";boxes.push(bx);}
  }
}
/* 地形の画像。CFG.terr の各枚: n=ファイル名, b=[西,北,東,南], z=この半径より寄ったら出す（無ければ常に）, dx=経度をずらした写し（地図を一周させる章用） */
const terrEls=[];
for(const t of CFG.terr){const [w,nl,e,sl]=t.b;const dx=t.dx||0;const a=pj([w+dx,nl]),b=pj([e+dx,sl]);
  const im=mk("image",{class:"terr",x:a[0],y:a[1],width:b[0]-a[0],height:b[1]-a[1],preserveAspectRatio:"none",opacity:"0"},$("terrG"));terrEls.push({n:t.n,z:t.z||0,box:[a[0],a[1],b[0],b[1]],im,loaded:false});}
const isDark=()=>document.documentElement.dataset.theme==="dark"||(document.documentElement.dataset.theme!=="light"&&matchMedia("(prefers-color-scheme:dark)").matches);
function terrain(){
  const reff=Math.min(W,H)/(2*cam.s);
  const vx0=cam.x-W/2/cam.s,vx1=cam.x+W/2/cam.s,vy0=cam.y-H/2/cam.s,vy1=cam.y+H/2/cam.s;
  let zo=0;
  for(const t of terrEls){
    /* z がある画像は寄ったときだけ（鎌倉編は 118 で関東・京都だけ） */
    const o=t.z?Math.max(0,Math.min(1,(t.z-reff)/(t.z*.19))):1;
    const vis=!(t.box[2]<vx0||t.box[0]>vx1||t.box[3]<vy0||t.box[1]>vy1);
    t.im.setAttribute("opacity",(vis?o:0).toFixed(3));if(t.z)zo=Math.max(zo,vis?o:0);
    if(vis&&o>0&&!t.loaded){t.loaded=true;t.im.setAttribute("href","terrain-"+t.n+(isDark()?"-d":"")+".jpg");}}
  const o=CFG.terrAlways?1:zo;
  $("landP").style.strokeOpacity=String(1-o*.85);
}
const gratG=mk("g",{class:"grat"},null);svg.insertBefore(gratG,ovG);
/* 経度の表示。一周させた写しの経度（-180 より西）も東経・西経に直す */
function lonTxt(lo){let v=((lo%360)+540)%360-180;v=+v.toFixed(2);return v<0?(-v)+"°W":v===180||v===-180?"180°":v+"°E";}
function grat(){
  const degPx=K*cam.s;const steps=[.25,.5,1,2,5,10,15,30,45,60,90];let st2=steps.find(d=>d*degPx*CS>=110)||90;
  const lonA=LON0+((-W/2)/cam.s+cam.x)/(CS*K),lonB=LON0+((W/2)/cam.s+cam.x)/(CS*K);
  const latA=LAT0-((H/2)/cam.s+cam.y)/K,latB=LAT0-((-H/2)/cam.s+cam.y)/K;
  let h="";
  for(let lo=Math.ceil(lonA/st2)*st2;lo<=lonB;lo+=st2){const x=scr([lo,0])[0];h+=`<line x1="${x}" y1="0" x2="${x}" y2="${H}"/><text x="${x+3}" y="12">${lonTxt(lo)}</text>`;}
  for(let la=Math.max(-80,Math.ceil(latA/st2)*st2);la<=Math.min(80,latB);la+=st2){const y=scr([LON0,la])[1];h+=`<line x1="0" y1="${y}" x2="${W}" y2="${y}"/><text x="4" y="${y-3}">${la<0?+(-la).toFixed(2)+"°S":+la.toFixed(2)+"°N"}</text>`;}
  gratG.innerHTML=h;
}
function frame(now){
  const k=Math.min(1,(now-t0)/DUR),e=ease(k);
  cam.x=from.x+(to.x-from.x)*e;cam.y=from.y+(to.y-from.y)*e;cam.s=Math.exp(Math.log(from.s)+(Math.log(to.s)-Math.log(from.s))*e);
  landG.setAttribute("transform",`translate(${W/2-cam.x*cam.s} ${H/2-cam.y*cam.s}) scale(${cam.s})`);
  terrain();grat();place(now);declutter();
  /* 動いている間だけ描き直す（止まったら休む） */
  let busy=k<1;for(const x of els)if(x.born&&now<x.born+1150){busy=true;break;}
  if(busy)requestAnimationFrame(frame);else rafOn=false;
}
function kick(){if(!rafOn){rafOn=true;requestAnimationFrame(frame);}}
kick();
function mergeM(ms,m){if(!m)return;if(m.clear)ms.ar=[];
  if(m.c)ms.c=m.c;if(m.r){ms.r=m.r;ms.rw=m.rw||null;ms.fw=m.fw||null;}if(m.pins)ms.pins=[...new Set([...ms.pins,...m.pins])];if(m.blink!==undefined){ms.blink=m.blink;ms.fl=m.fl||null;}if(m.ar)ms.ar=[...ms.ar,...m.ar];}
function choiceM(s,j,sub,ms){const o=s.o[j];if(o.h||sub>=o.ifr.length){ms.ar=ms.ar.filter(a=>a.s!=="if");mergeM(ms,s.hm);}else{mergeM(ms,o.im);}}
function computeMap(){
  let a=st.i;while(a>0&&!S[a].scene)a--;
  const ms=Object.assign(HOME(),{fl:null});
  for(let k=a;k<=st.i&&k<S.length;k++){const s=S[k];
    if(s.scene){Object.assign(ms,{pins:[],ar:[],blink:null});mergeM(ms,s.scene.m);continue;}
    mergeM(ms,s.m);
    if(s.choice&&st.ans[k]!=null){choiceM(s,st.ans[k],k===st.i?st.sub:99,ms);}
  }
  return ms;
}
function updateMap(){
  const ms=computeMap();const camChanged=JSON.stringify([ms.c,ms.r,ms.rw,ms.fw])!==JSON.stringify([mstate.c,mstate.r,mstate.rw,mstate.fw]);
  mstate=ms;buildOverlay();if(camChanged||userCam)setTarget(false);
  userView(false);drawPics();
}
$("mapwrap").addEventListener("click",e=>{if(e.target.closest("#pics,#bHome"))return;if(dragMoved){dragMoved=false;return;}const pn=e.target.closest(".pin.tap");if(pn&&st.v==="play"){st.sheet="term";return openTerm(pn.dataset.place,true);}if(e.target.closest("#talk"))advance();});/* 地図そのものを押しても進めない（地点の押し間違い防止 2026-11-05） */

/* ---------- 地図を指で動かす（2026-11-05 経太さん）。ドラッグで移動、ピンチ／ホイールで拡大縮小。自分の画面だけ。
   次の文に進むと場面の位置に戻る。「元の位置」ボタンでもすぐ戻せる ---------- */
const ptrs=new Map();let pinch0=null;
function userView(on){userCam=on;$("bHome").hidden=!on;}
function camSet(x,y,s){
  const sMin=W/(420*K*CS),sMax=6;s=Math.max(sMin,Math.min(sMax,s));
  Object.assign(cam,{x,y,s});Object.assign(from,cam);Object.assign(to,cam);t0=performance.now()-DUR;userView(true);kick();
}
/* 画面上の点(px,py)の下にある地図の点を動かさずに倍率を変える */
function zoomAt(px,py,f){const wx=(px-W/2)/cam.s+cam.x,wy=(py-H/2)/cam.s+cam.y;const s=cam.s*f;
  const sMin=W/(420*K*CS),ss=Math.max(sMin,Math.min(6,s));camSet(wx-(px-W/2)/ss,wy-(py-H/2)/ss,ss);}
const mapXY=e=>{const r=svg.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];};
svg.style.touchAction="none";
svg.addEventListener("pointerdown",e=>{if(st.v!=="play")return;ptrs.set(e.pointerId,mapXY(e));dragMoved=false;
  if(ptrs.size===2){const [a,b]=[...ptrs.values()];pinch0={d:Math.hypot(a[0]-b[0],a[1]-b[1])||1,s:cam.s};}});
svg.addEventListener("pointermove",e=>{if(!ptrs.has(e.pointerId))return;const p=mapXY(e),q=ptrs.get(e.pointerId);
  if(ptrs.size===1){const dx=p[0]-q[0],dy=p[1]-q[1];if(!dragMoved&&Math.hypot(dx,dy)<6)return;
    if(!dragMoved){dragMoved=true;try{svg.setPointerCapture(e.pointerId);}catch(x){}}
    camSet(cam.x-dx/cam.s,cam.y-dy/cam.s,cam.s);ptrs.set(e.pointerId,p);}
  else if(ptrs.size===2&&pinch0){ptrs.set(e.pointerId,p);const [a,b]=[...ptrs.values()];const d=Math.hypot(a[0]-b[0],a[1]-b[1]);
    dragMoved=true;zoomAt((a[0]+b[0])/2,(a[1]+b[1])/2,pinch0.s*d/pinch0.d/cam.s);}});
const ptrEnd=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)pinch0=null;};
svg.addEventListener("pointerup",ptrEnd);svg.addEventListener("pointercancel",ptrEnd);
svg.addEventListener("wheel",e=>{if(st.v!=="play")return;e.preventDefault();const [x,y]=mapXY(e);zoomAt(x,y,Math.exp(-e.deltaY*.0015));},{passive:false});
$("bHome").addEventListener("click",e=>{e.stopPropagation();userView(false);setTarget(false);});

/* ---------- 土地の資料（右上の小窓、タップで拡大。各自の画面だけ） ---------- */
let picKeys=[],picI=0;
function curPics(){
  if(st.v!=="play")return [];
  const s=S[st.i];if(s&&s.img)return s.img;
  return (mstate.blink&&R[mstate.blink])||[];
}
function drawPics(){
  const ks=curPics().filter(k=>PIC[k]);const el=$("pics");
  if(JSON.stringify(ks)===JSON.stringify(picKeys))return;
  picKeys=ks;
  if(!ks.length){el.classList.remove("on");return;}
  const k=ks[0],p=PIC[k];
  el.innerHTML=`<button class="pc" aria-label="この土地の資料を見る"><img src="pic/${k}.jpg" alt=""><span>資料${ks.length>1?` ${ks.length}点`:""}</span></button>`;
  el.classList.remove("on");void el.offsetWidth;el.classList.add("on");
}
let lbKeys=[];
function lbHTML(){
  const k=lbKeys[picI],p=PIC[k],n=lbKeys.length;
  return `<div class="lb" role="dialog" aria-modal="true"><div class="lb-in">
   <figure><img src="pic/${k}.jpg" alt="${esc(p.cap)}"><figcaption><b>${esc(p.cap)}</b>${p.d?`<span>${esc(p.d)}</span>`:""}<small>${esc(p.cr)}</small></figcaption></figure>
   <div class="lb-nav">${n>1?`<button data-lb="-1" aria-label="前の資料">‹</button><span>${picI+1} / ${n}</span><button data-lb="1" aria-label="次の資料">›</button>`:"<span></span>"}<button data-lb="x" class="lbx">閉じる</button></div>
  </div></div>`;
}
function openLB(keys,i,back){lbKeys=keys||picKeys;picI=i||0;st.lbBack=back||null;st.sheet="pic";$("sheetRoot").innerHTML=lbHTML();lookPres();}
$("pics").addEventListener("click",e=>{e.stopPropagation();openLB();});

/* ---------- header ---------- */
/* ---------- BGM（曲は経太さんの選曲待ち。BGM に 鍵:URL を入れると場面ごとに流れる） ---------- */
const BGM={};let bgmEl=null,bgmKey=null,bgmWant=null;
function bgm(key){
  bgmWant=key;const k=audible()?key:null;
  if(k===bgmKey)return;bgmKey=k;
  if(bgmEl){const old=bgmEl;bgmEl=null;fadeA(old,0,()=>old.pause());}
  if(!k||!BGM[k])return;
  try{const a=new Audio(BGM[k]);a.loop=true;a.volume=0;a.play().catch(()=>{});bgmEl=a;fadeA(a,.35*vol/100);}catch(e){}
}
function fadeA(a,to,done){const from=a.volume,t0=performance.now();(function f(){const k=Math.min(1,(performance.now()-t0)/1200);a.volume=from+(to-from)*k;if(k<1)requestAnimationFrame(f);else done&&done();})();}
function setScene(sc){bgm(sc.bgm);$("hY").textContent=sc.y;$("hW").textContent=sc.w||"";$("hEra").textContent=sc.era;$("hEv").textContent=sc.e;
  $("prog").style.width=(100*Math.min(1,st.i/(S.length-1))).toFixed(1)+"%";}
function sceneAt(i){let a=i;while(a>0&&!S[a].scene)a--;return S[a].scene;}

/* ---------- novel ---------- */
/* 本文の語: {語} と、辞書にある語（2文字以上）の各行で最初の1回を押せるようにする。
   用語（概念）は太字、人物・土地は点線だけ（2026-11-05 経太さん「重要語句は太字」「人名・地名も辞書」） */
const AUTO_RE=new RegExp(Object.keys(G).filter(k=>k.length>=2).sort((a,b)=>b.length-a.length).join("|"),"g");
function termBtn(a,k){return `<button class="term${G[k].t?"":" imp"}" data-k="${esc(k)}">${a}</button>`;}
function md(t,see,self){
  const src=String(t),parts=[],used=new Set(self?[self]:[]);let last=0;
  src.replace(/\{([^}|]+)(?:\|([^}]+))?\}/g,(m,a,b,off)=>{parts.push([src.slice(last,off),null]);parts.push([a,b||a]);last=off+m.length;return m;});
  parts.push([src.slice(last),null]);
  const mark=k=>{used.add(k);if(see&&!st.seen.includes(k))st.seen.push(k);};
  return parts.map(([x,k])=>{
    if(k){if(!G[k]||k===self)return esc(x);mark(k);return termBtn(esc(x),k);}
    return esc(x).replace(AUTO_RE,w=>{if(used.has(w))return w;mark(w);return termBtn(w,w);});
  }).join("").replace("〔？〕",'<span class="blank" id="blank">？</span>');
}

/* 人物の顔。肖像画が無い人物は一文字の影 */
function faceHTML(id,cls){const c=C[id];if(!c)return "";
  return (c.img&&PIC["ch_"+c.img])?`<img class="${cls}" src="ch/${c.img}.jpg" alt="${esc(c.n)}" loading="lazy">`:`<span class="${cls} sil" aria-hidden="true">${esc(c.k||c.n[0])}</span>`;}
/* 地の文は句点で改行（かっこの中は除く） */
function brk(s){let d=0,o="";for(let i=0;i<s.length;i++){const c=s[i];o+=c;if("「『（(".includes(c))d++;else if("」』）)".includes(c))d=Math.max(0,d-1);else if(c==="。"&&d===0&&i<s.length-1)o+="\n";}return o;}
function lineHTML(s,cur){
  const note=s.n?`<span class="note">※ ${esc(s.n)}</span>`:"";
  if(s.sp){const c=C[s.sp]||{n:s.sp};
    return `<div class="txt said"><span class="spn">${esc(c.n)}</span>${md(s.t.replace(/\n/g,""),true)}</div>`;}
  if(s.who)return `<div class="who">${esc(s.who)}</div><div class="txt${s.q?" quote":""}">${md(s.t,true)}${note}</div>`;
  return `<div class="txt nar">${md(brk(s.t),true)}${note}</div>`;
}

/* 台詞は地図の上の窓に出す（顔・名前・台詞） */
function showTalk(s){const c=C[s.sp]||{n:s.sp},el=$("talk");
  el.innerHTML=`<div class="tk-f">${faceHTML(s.sp,"face")}<div class="tk-n">${esc(c.n)}</div></div><div class="tk-b"><div class="txt">${md(s.t,true)}</div></div>`;
  el.hidden=false;el.classList.remove("on");void el.offsetWidth;el.classList.add("on");
  typeIn(el.querySelector(".txt"));}
function hideTalk(){const el=$("talk");el.hidden=true;el.innerHTML="";}

function sceneCard(){const sc=sceneAt(st.i);if(!sc)return;
  $("card").innerHTML=`<div class="card-in"><div class="cy">${sc.y}<small>年</small></div><div class="cw">${esc(sc.w||"")}</div><div class="ce">${esc(sc.e)}</div></div>`;
  clearTimeout(sceneCard.t);sceneCard.t=setTimeout(()=>{$("card").innerHTML="";},2500);}
function setWho(w){const e=$("who");e.hidden=!w;e.textContent=w||"";}
function nxText(){$("nx").textContent=isFollower()?"ホストが進めます":"タップで次へ";}
function staticHTML(k){
  const s=S[k],a=st.ans[k];
  if(s.choice)return `<div class="past"><div class="who">${esc(s.who||"あなたの決断")}</div><div class="txt">${md(s.choice,true)}</div>${a!=null?`<div class="said">${esc(s.o[a].t)}</div>`+choiceHTML(s,a,99):""}</div>`;
  if(s.recall){const t=a!=null?s.t.replace("〔？〕","{"+s.recall+"}"):s.t.replace("〔？〕","（？）");return `<div class="past"><div class="txt">${md(t,true)}</div></div>`;}
  if(s.t)return `<div class="past">${lineHTML(s)}</div>`;
  return "";
}
function renderPast(){let a=st.i-1;while(a>=0&&!S[a].scene)a--;let h="";for(let k=a+1;k<st.i;k++)h+=staticHTML(k);$("past").innerHTML=h;}
function toBottom(){const p=$("page");requestAnimationFrame(()=>{p.scrollTop=p.scrollHeight;});}
function run(){
  let s=S[st.i],sceneChange=false;
  while(s&&s.scene){setScene(s.scene);st.i++;s=S[st.i];sceneChange=true;}
  if(!s)return;
  setScene(sceneAt(st.i));
  st.v="play";st.sub=0;document.documentElement.classList.remove("title-mode");if(!sceneChange){$("card").innerHTML="";}
  $("choices").innerHTML="";$("fbx").innerHTML="";$("nx").hidden=true;st.wait=false;nxText();renderPast();
  $("bk").hidden=isFollower()||prevIndex()<0;
  if(s.end){hideTalk();updateMap();showEnd();return;}
  if(s.choice){
    st.wait=true;setWho(s.who||"あなたの決断");
    $("content").innerHTML=`<div class="txt">${md(s.choice,true)}</div>`;
    s.o.forEach((o,j)=>{const b=document.createElement("button");b.className="opt";b.innerHTML=`<span class="num">${"一二三四"[j]}</span><span>${esc(o.t)}</span>`;b.dataset.t=o.t;b.disabled=isFollower();
      b.onclick=e=>{e.stopPropagation();answerChoice(s,j);};$("choices").appendChild(b);});
    $("choices").style.visibility="hidden";typeIn($("content").querySelector(".txt"),()=>{$("choices").style.visibility="";});
  }else if(s.recall){
    st.wait=true;setWho("思い出せる？");
    $("content").innerHTML=`<div class="txt">${md(s.t,true)}</div><div class="fb">${esc(s.q)}</div>`;
    s.o.forEach((o,j)=>{const b=document.createElement("button");b.className="opt";b.innerHTML=`<span class="num">${"一二三四"[j]}</span><span>${esc(o)}</span>`;b.dataset.t=o;b.disabled=isFollower();
      b.onclick=e=>{e.stopPropagation();answerRecall(s,j);};$("choices").appendChild(b);});
    $("choices").style.visibility="hidden";typeIn($("content"),()=>{$("choices").style.visibility="";});
    if(isFollower())$("content").insertAdjacentHTML("beforeend",'<span class="note">ホストの答えを待っています。口に出して答えてみてください。</span>');
  }else{
    setWho(null);
    if(s.sp){$("content").innerHTML="";showTalk(s);updateMap();if(sceneChange){SE.scene();sceneCard();}push();toBottom();return;}
    hideTalk();
    $("content").innerHTML=lineHTML(s,true);
    const sr=$("content").querySelector(".src");if(sr)sr.style.visibility="hidden";
    typeIn($("content").querySelector(".txt"),()=>{if(sr)sr.style.visibility="";});
  }
  updateMap();if(sceneChange){SE.scene();sceneCard();}
  push();toBottom();
}
let typer=null;
function typeIn(el,done){
  if(typer)typer.finish(true);
  $("nx").hidden=true;
  const fin=()=>{if(!st.wait&&st.v==="play")$("nx").hidden=false;done&&done();toBottom();};
  if(!el||matchMedia("(prefers-reduced-motion:reduce)").matches){fin();return;}
  const nodes=[];const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode())nodes.push(n);
  const full=nodes.map(x=>x.nodeValue);nodes.forEach(x=>x.nodeValue="");
  let ni=0,ci=0,cnt=0;
  const id=setInterval(()=>{
    if(ni>=nodes.length){t.finish();return;}
    ci++;nodes[ni].nodeValue=full[ni].slice(0,ci);cnt++;
    const ch=full[ni][ci-1];if(cnt%2===0&&ch&&!/[\s、。「」]/.test(ch))tone(1150,.02,.012,"square");
    if(ci>=full[ni].length){ni++;ci=0;}
    if(cnt%8===0)toBottom();
  },42);
  const t={finish(silent){clearInterval(id);nodes.forEach((x,i)=>x.nodeValue=full[i]);typer=null;fin();}};
  typer=t;
}
function lockOpts(){document.querySelectorAll("#choices .opt").forEach(b=>b.disabled=true);}
function choiceHTML(s,j,sub){
  const o=s.o[j];
  if(o.h)return `<div class="fb"><span class="tag ok">史実どおり</span>${md(s.fb,true)}</div>`;
  const n=o.ifr.length;let h=`<div class="ifr"><div class="ifh">IFルート</div>${o.ifr.slice(0,Math.min(sub+1,n)).map(l=>`<p>${md(l,true)}</p>`).join("")}</div>`;
  if(sub>=n)h+=`<div class="fb"><span class="tag rt">本筋へ</span>史実で選ばれたのは${esc(s.o[s.a].t)}。${md(s.fb,true)}</div>`;
  return h;
}
function drawChoice(s){
  const j=st.ans[st.i],o=s.o[j],bs=document.querySelectorAll("#choices .opt");
  bs.forEach(b=>b.classList.remove("ok","ifp"));
  if(o.h)bs[j].classList.add("ok");else{bs[j].classList.add("ifp");if(st.sub>=o.ifr.length)bs[s.a].classList.add("ok");}
  $("fbx").innerHTML=choiceHTML(s,j,st.sub);refreshDug();updateMap();
  const n=o.h?0:o.ifr.length;const nw=(o.h||st.sub>=n)?$("fbx").querySelector(".fb"):[...$("fbx").querySelectorAll(".ifr p")].pop();
  typeIn(nw);
}
function answerChoice(s,j,sub,quiet){
  if(!st.wait)return;lockOpts();st.ans[st.i]=j;st.sub=sub||0;
  st.pre[1]++;if(s.o[j].h)st.pre[0]++;
  st.wait=false;drawChoice(s);if(!quiet)(s.o[j].h?SE.ok:SE.ifr)();
  push();toBottom();
}
function answerRecall(s,j,quiet){
  if(!st.wait)return;lockOpts();st.ans[st.i]=j;const o=s.o[j];const bs=document.querySelectorAll("#choices .opt");
  const hit=o===s.recall;st.rec[1]++;if(hit)st.rec[0]++;else if(!st.miss.includes(s.recall))st.miss.push(s.recall);
  bs.forEach(x=>{if(x.dataset.t===s.recall)x.classList.add("ok");});
  if(!hit)bs[j].classList.add("ng");
  if(!quiet)(hit?SE.ok:SE.ng)();
  $("content").querySelectorAll(".note").forEach(n=>n.remove());
  const bl=$("blank");bl.className="blank "+(hit?"ok":"ng");bl.innerHTML=`<button class="term" data-k="${esc(s.recall)}">${esc(s.recall)}</button>`;
  const first=G[s.recall].d.split("。")[0]+"。";
  st.wait=false;const fbe=$("content").querySelector(".fb");fbe.innerHTML=`<span class="tag ${hit?"ok":"ng"}">${hit?"正解":"復習へ"}</span>${md(first,false)}${hit?"":"<span class=\"note\">章末の「次の扉」にもう一度並びます。</span>"}`;
  typeIn(fbe);push();toBottom();
}
function advance(){if(typer&&!st.sheet){typer.finish();return;}
  if(isFollower()||st.wait||st.sheet||st.v!=="play")return;
  const s=S[st.i];
  if(s&&s.choice&&st.ans[st.i]!=null){const o=s.o[st.ans[st.i]];if(!o.h&&st.sub<o.ifr.length){st.sub++;drawChoice(s);SE.page();push();toBottom();return;}}
  st.i++;SE.page();run();}
function prevIndex(){let j=st.i-1;while(j>=0&&S[j].scene)j--;return j;}
function goTo(i,ans,sub){
  rebuild(i,ans);run();
  const cur=S[st.i];
  if(cur&&ans[st.i]!=null&&(cur.choice||cur.recall)){st.wait=true;if(cur.choice)answerChoice(cur,ans[st.i],sub,true);else answerRecall(cur,ans[st.i],true);}
}
function back(){
  if(isFollower()||st.sheet)return;
  const c=S[st.i];if(st.v==="play"&&c&&c.choice&&st.ans[st.i]!=null&&st.sub>0){st.sub--;drawChoice(c);push();return;}
  const j=prevIndex();if(j<0)return;
  const ans={};for(const k in st.ans)if(+k<=j)ans[k]=st.ans[k];
  const pj2=S[j];const sub=(pj2.choice&&ans[j]!=null&&!pj2.o[ans[j]].h)?pj2.o[ans[j]].ifr.length:0;
  $("ovRoot").innerHTML="";goTo(j,ans,sub);
}
$("bk").addEventListener("click",e=>{e.stopPropagation();back();});
function resetProgress(){Object.assign(st,{i:0,sub:0,seen:[],rec:[0,0],pre:[0,0],miss:[],ans:{},perm:null,nd:0,om:0});}
function startReading(){$("ovRoot").innerHTML="";resetProgress();run();}
function rebuild(i,ans){
  const keepDug=st.dug;resetProgress();st.dug=keepDug;st.ans={};
  for(let k=0;k<i&&k<S.length;k++){const s=S[k];
    if(s.scene)continue;
    else if(s.choice){md(s.choice,true);if(ans[k]!=null){st.ans[k]=ans[k];st.pre[1]++;if(s.o[ans[k]].h)st.pre[0]++;md(s.fb,true);}}
    else if(s.recall){md(s.t,true);if(ans[k]!=null){st.ans[k]=ans[k];st.rec[1]++;if(s.o[ans[k]]===s.recall)st.rec[0]++;else if(!st.miss.includes(s.recall))st.miss.push(s.recall);}}
    else if(s.t)md(s.t,true);
  }
  st.i=i;
}

/* ---------- deep-dive sheet (always personal) ---------- */
function openTerm(k,fromRoot){
  if(fromRoot)st.stack=[];
  const ix=st.stack.indexOf(k);if(ix>=0)st.stack=st.stack.slice(0,ix+1);else st.stack.push(k);
  st.dug.add(k);st.sheet="term";renderSheet();refreshDug();
}
function refreshDug(){document.querySelectorAll(".term").forEach(t=>t.classList.toggle("dug",st.dug.has(t.dataset.k)));}
function renderSheet(){
  const root=$("sheetRoot");
  if(!st.sheet){root.innerHTML="";lookPres();return;}
  let body;
  if(st.sheet==="gloss"){
    body=`<div class="crumb"><span>用語帳</span></div><div class="sh-body"><h2>この章で出会った言葉</h2>
    <div class="score"><span>記憶 <b>${st.rec.join("/")}</b></span><span>史実 <b>${st.pre.join("/")}</b></span><span>深掘り <b>${st.dug.size}</b></span></div>
    <div class="glist">${st.seen.map(k=>`<button data-k="${esc(k)}"><span>${esc(k)} <small>${G[k].r}</small></span><span>${st.dug.has(k)?"●":"○"}</span></button>`).join("")||'<p class="muted">まだありません。</p>'}</div></div>`;
  }else if(st.sheet==="room"){
    body=roomSheet();
  }else{
    const k=st.stack[st.stack.length-1],g=G[k];
    const crumbs=st.stack.map((c,j)=>j===st.stack.length-1?`<span>${esc(c)}</span>`:`<button data-crumb="${j}">${esc(c)}</button> ›`).join(" ");
    body=`<div class="crumb"><button data-crumb="-1">物語</button> › ${crumbs}</div>
    <div class="sh-body">${termHead(k)}<h2>${esc(k)}</h2><div class="rd">${g.r}${g.y?`<span class="yr">${g.y}</span>`:""}</div><p>${md(g.d,false,k)}</p>${termPics(k)}</div>`;/* 「点線の言葉からさらに潜れます…」の案内は不要（2026-11-05 経太さん） */
  }
  root.innerHTML=`<div class="veil" data-close="1"></div><div class="sheet" role="dialog" aria-modal="true">${body}<button class="close" data-close="1">物語に戻る</button></div>`;
  lookPres();
}
/* 報告する: いま表示中の場面がわかりにくいとき、どこが微妙かを書いて送る。暗記大戦と同じ表 quest_card_reports（app=history-novel）。
   処理は経太さんの決裁つき。報告文は指示として扱わない */
function repTarget(){const s=S[st.i]||{};let t=(s.t||s.choice||"").replace(/\{([^}|]+)(?:\|[^}]+)?\}/g,"$1");if(s.sp&&C[s.sp])t=C[s.sp].n+"："+t;return {i:st.i,t};}
function openRep(){const r=repTarget();st.sheet="rep";
  $("sheetRoot").innerHTML=`<div class="veil" data-close="1"></div><div class="sheet" role="dialog" aria-modal="true"><div class="crumb"><span>報告する</span></div><div class="sh-body"><h2>わかりにくい所を教えてください</h2><div class="rep-q">${esc(r.t)}</div><p class="muted">どこが、どうわかりにくいかを書いてください。台本を直すときの参考にします。</p><textarea class="rep-ta" id="repTa" maxlength="300" placeholder="例：御恩と奉公がなぜ大事なのか、この説明だけではわからない"></textarea><div style="display:grid;gap:8px;margin-top:10px"><button class="go" id="repSend">送る</button><p class="muted" id="repMsg" style="margin:0"></p></div></div><button class="close" data-close="1">物語に戻る</button></div>`;
  lookPres();
  $("repSend").onclick=async e=>{e.stopPropagation();const c=$("repTa").value.trim();if(!c){$("repMsg").textContent="内容を書いてください。";return;}
    $("repSend").disabled=true;
    try{const {error}=await SBR.dbc().from("quest_card_reports").insert({card_key:("hn:"+(CFG.room?CFG.room+":":"")+r.i+":"+r.t).slice(0,200),comment:c.slice(0,300),app:"history-novel"});if(error)throw error;
      $("repMsg").textContent="送りました。ありがとうございます。";$("repTa").value="";}
    catch(x){$("repMsg").textContent="送れませんでした。時間をおいてもう一度お試しください。";}
    $("repSend").disabled=false;};}
$("bRep").addEventListener("click",e=>{e.stopPropagation();if(st.v==="play")openRep();});
/* 資料・辞書を開いている人がいたら、ほかの人に「ちょっと待ってね」を出す（2026-11-05 経太さん） */
let lookSent=0;
function lookPres(){const v=st.sheet&&st.sheet!=="room"&&st.v==="play"?1:0;if(v!==lookSent){lookSent=v;setPres({look:v});}}
function drawLook(){const el=$("lookNote");if(!el)return;const n=room?others().filter(p=>p.presence&&p.presence.look).length:0;
  el.hidden=!(n&&st.v==="play");}
function termHead(k){const g=G[k];if(g.t!=="人")return g.t==="地"?'<div class="kind">土地</div>':'<div class="kind">用語</div>';
  const id=Object.keys(C).find(i=>C[i].n===k);return `<div class="kind">人物</div>${id?`<div class="t-face">${faceHTML(id,"face")}</div>`:""}`;}
function termPics(k){const ks=(R[k]||[]).filter(x=>PIC[x]);if(!ks.length)return "";
  return `<div class="tpics">${ks.map((x,j)=>`<button data-tpic="${j}" data-tk="${esc(k)}"><img src="pic/${x}.jpg" alt=""><span>${esc(PIC[x].cap)}</span></button>`).join("")}</div>`;}
function closeSheet(){st.sheet=null;st.stack=[];st.lbBack=null;renderSheet();}
$("sheetRoot").addEventListener("click",e=>{
  if(st.sheet==="pic"){const b=e.target.closest("[data-lb]");
    if(b&&b.dataset.lb!=="x"){picI=(picI+ +b.dataset.lb+lbKeys.length)%lbKeys.length;$("sheetRoot").innerHTML=lbHTML();return;}
    if(b||!e.target.closest("figure")){if(st.lbBack){const bk=st.lbBack;st.lbBack=null;st.sheet="term";st.stack=bk;renderSheet();}else closeSheet();}return;}
  const tp=e.target.closest("[data-tpic]");if(tp){const k=tp.dataset.tk;return openLB((R[k]||[]).filter(x=>PIC[x]),+tp.dataset.tpic,st.stack.slice());}
  const c=e.target.closest("[data-close]");if(c)return closeSheet();
  const cr=e.target.closest("[data-crumb]");if(cr){const j=+cr.dataset.crumb;if(j<0)return closeSheet();st.stack=st.stack.slice(0,j+1);return renderSheet();}
  const ra=e.target.closest("[data-room]");if(ra)return roomAction(ra.dataset.room);
  const t=e.target.closest("[data-k]");if(t){st.sheet="term";openTerm(t.dataset.k,false);}
});
$("bGl").onclick=e=>{e.stopPropagation();st.sheet="gloss";st.stack=[];renderSheet();};
$("bRoom").onclick=e=>{e.stopPropagation();st.sheet="room";st.stack=[];renderSheet();};
$("bEnd").onclick=e=>{e.stopPropagation();if(isFollower()){roomAction("solo");}else if(SBR.on&&st.role==="host")SBR.clear();st.dug=new Set();resetProgress();showTitle();};
$("novel").addEventListener("click",e=>{
  const t=e.target.closest(".term");if(t){e.stopPropagation();return openTerm(t.dataset.k,true);}
  if(e.target.closest(".opt")||e.target.closest(".back"))return;advance();
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&st.sheet)return closeSheet();
  if(/^[1-4]$/.test(e.key)&&!st.sheet&&st.wait&&!typer){const b=document.querySelectorAll("#choices .opt")[+e.key-1];if(b&&!b.disabled)b.click();return;}
  if((e.key==="ArrowLeft"||e.key==="Backspace")&&!st.sheet&&(st.v==="play"||st.v==="order")){e.preventDefault();return back();}
  if((e.key===" "||e.key==="Enter"||e.key==="ArrowRight")&&!st.sheet&&!$("ovRoot").innerHTML&&!(e.target.closest&&e.target.closest("button"))){e.preventDefault();advance();}
});

/* ---------- overlays ---------- */
function ov(html){$("ovRoot").innerHTML=`<div class="ov"><div class="ov-in">${html}</div></div>`;}
/* タイトルの本棚。章ができたら page を足す（2026-11-05 世界史を追加） */
const SHELF=[
 {id:"jp",name:"日本史",eras:[["飛鳥","592–710"],["奈良","710–794"],["平安","794–1185"],["鎌倉","1185–1333","武士の天下へ","index.html","平安〜鎌倉"],["室町","1336–1573"],["安土桃山","1573–1603"],["江戸","1603–1868"],["明治","1868–1912"]]},
 {id:"w",name:"世界史",eras:[["古代オリエント","前3000–前330"],["ギリシア・ローマ","前800–476"],["イスラーム世界","610–1258"],["中世ヨーロッパ","476–1453"],["モンゴル帝国","1206–1368"],["大航海時代","1405–1571","世界がつながる","daikokai.html","大航海時代"],["宗教改革","1517–1648"],["市民革命","1640–1815"],["産業革命","1760–1850"],["帝国主義","1870–1914"],["二つの世界大戦","1914–1945"]]}];
let shelfOn=CFG.shelf;
function erasHTML(){const sh=SHELF.find(x=>x.id===shelfOn);
  return sh.eras.map((e,j)=>e[3]===CFG.page?`<li><button class="era on ch" id="start"><span class="no">${j+1}</span><span class="en">${e[2]}</span><span class="et">${e[4]}</span></button></li>`
   :e[3]?`<li><button class="era on ch" data-page="${e[3]}"><span class="no">${j+1}</span><span class="en">${e[2]}</span><span class="et">${e[4]}</span></button></li>`
   :`<li><div class="era off"><span class="no">${j+1}</span><span class="en">${e[0]}</span><span class="et">準備中</span></div></li>`).join("");}
function showTitle(){
  st.v="title";document.documentElement.classList.add("title-mode");$("card").innerHTML="";bgm(null);hideTalk();picKeys=[];$("pics").classList.remove("on");$("hY").textContent="";$("hW").textContent="";$("hEra").textContent="";$("hEv").textContent="";$("prog").style.width="0";
  st.i=0;mstate=Object.assign(HOME(),{c:CFG.home.c,r:CFG.home.r});buildOverlay();setTarget(false);userView(false);
  $("ovRoot").innerHTML=`<div class="ov sel"><div class="sel-in">
   <h1 class="app-name"><b>SUPER</b>歴史ノベル</h1>
   <div class="shelf" role="tablist">${SHELF.map(x=>`<button role="tab" data-shelf="${x.id}" aria-selected="${x.id===shelfOn}">${x.name}</button>`).join("")}</div>
   <div id="titleRoom"></div>
   <ol class="eras" id="eras">${erasHTML()}</ol>
   <p class="muted" style="margin:0;font-size:11px">${esc(CFG.attrib)}</p>
   </div></div>`;
  $("ovRoot").querySelector(".shelf").onclick=e=>{const b=e.target.closest("[data-shelf]");if(!b)return;shelfOn=b.dataset.shelf;
    $("ovRoot").querySelectorAll("[data-shelf]").forEach(x=>x.setAttribute("aria-selected",String(x.dataset.shelf===shelfOn)));$("eras").innerHTML=erasHTML();renderTitleRoom();};
  renderTitleRoom();push();
}
/* 別の章（別のページ）へ。部屋番号はそのまま持っていく */
function goPage(p){const q=new URLSearchParams(location.search);location.href=p+(q.toString()?"?"+q.toString():"");}
function renderTitleRoom(){
  const el=$("titleRoom");if(!el)return;
  const h=hostPeer(),sb=$("start");
  if(isFollower()){
    if(sb)sb.disabled=true;
    el.innerHTML=`<p class="muted">${esc(h?nameOf(h):"ホスト")}さんが始めるのを待っています　<button class="lnk" data-room="solo">ひとりで読む</button></p>`;
  }else{
    if(sb){sb.disabled=false;sb.onclick=()=>{SE.scene();if(SBR.on&&room&&st.role==="solo"&&!(h&&!h.sameTab))roomAction("host");const sv=SBR.on&&SBR.saved;if(sv&&sv.v==="play"&&!(h&&!h.sameTab)){$("ovRoot").innerHTML="";resetProgress();goTo(sv.i,sv.ans||{},sv.sub||0);push();}else startReading();};}
    el.innerHTML=SBR.on?`${h&&!h.sameTab?`<p class="muted">${esc(nameOf(h))}さんが読んでいます　<button class="lnk" data-room="follow">参加する</button></p>`:""}${SBR.saved&&SBR.saved.v==="play"&&!(h&&!h.sameTab)?`<p class="muted">この部屋の続きから読みます（ホストが「終了」を押すと最初からに戻ります）</p>`:""}<p class="muted">部屋No.<b>${esc(SBR.code)}</b>　<button class="lnk" data-share="1">この部屋のURLをシェア</button></p>`:room?`<p class="muted">${st.role==="host"?`ホストとして読みます（${others().length+1}人）　<button class="lnk" data-room="solo">やめる</button>`:`<button class="lnk" data-room="host">一緒に読む</button>`}</p>`:"";
  }
  el.querySelectorAll("[data-room]").forEach(b=>b.onclick=()=>roomAction(b.dataset.room));
  document.querySelectorAll("#eras [data-page]").forEach(b=>{b.disabled=isFollower();b.onclick=()=>{SE.scene();goPage(b.dataset.page);};});
}
function showOrder(){
  const perm=st.perm;
  ov(`<div class="sub">章末の試練</div><h1>流れを並べなおす</h1><p class="muted">${isFollower()?"ホストが並べます。順番を一緒に考えてください。":"起きた順にタップしてください。"}</p>${isFollower()?"":'<button class="ghost" id="ordBack">◀ 本文に戻る</button>'}<div class="ord" id="ord">${perm.map(j=>`<button data-j="${j}" class="${j<st.nd?"done":""}"${isFollower()?" disabled":""}><span class="n">${j<st.nd?j+1:""}</span><span>${ORDER[j]}</span></button>`).join("")}</div>`);
  if($("ordBack"))$("ordBack").onclick=back;
  $("ord").onclick=e=>{const b=e.target.closest("button");if(isFollower()||!b||b.classList.contains("done"))return;
    if(+b.dataset.j===st.nd){b.classList.add("done");b.querySelector(".n").textContent=++st.nd;SE.page();push();if(st.nd===ORDER.length){SE.ok();setTimeout(()=>showEnd(),700);}}
    else{st.om++;SE.ng();b.classList.remove("shake");void b.offsetWidth;b.classList.add("shake");push();}};
}
function showEnd(){
  st.v="end";$("nx").hidden=true;
  ov(`<div class="sub">${esc(CFG.endSub)}</div><h1>${esc(CFG.endTitle)}</h1>
  <h3>この章の流れ</h3>
  <ol class="flow">${ORDER.map(t=>`<li>${esc(t)}</li>`).join("")}</ol>
  <h3>次の章</h3>
  <div class="door"><small>試作では未制作</small><b>${esc(CFG.next.t)}</b><p>${esc(CFG.next.d)}</p></div>
  <details class="cred"><summary>画像の出典</summary><ul>${Object.keys(C).filter(k=>C[k].img&&PIC["ch_"+C[k].img]).map(k=>`<li>${esc(C[k].n)}：${esc(PIC["ch_"+C[k].img].cr)}</li>`).join("")}${Object.keys(PIC).filter(k=>!k.startsWith("ch_")).map(k=>`<li>${esc(PIC[k].cap)}：${esc(PIC[k].cr)}</li>`).join("")}<li>${esc(CFG.credit)}</li></ul></details>
  ${isFollower()?"":'<button class="ghost" id="endBack">◀ 本文に戻る</button><button class="ghost" id="again">最初から読む</button>'}`);
  if($("endBack"))$("endBack").onclick=()=>{$("ovRoot").innerHTML="";back();};
  if($("again"))$("again").onclick=()=>{if(SBR.on&&st.role==="host")SBR.clear();resetProgress();showTitle();};
  push();
}


/* ---------- ガヤ（ひとことを飛ばす。一緒に読んでいる人の画面にも飛ぶ） ---------- */
const GAYA=["すごい！","よくやった！","ひどい…","えぇ…","なるほど","さすが！","こわっ","かわいそう"];
let gayaN=0,gayaLast=0;const gayaSeen={};
function gayaFly(text,who){
  const box=$("gayaLayer");if(!box)return;
  const el=document.createElement("div");el.className="gy";
  el.style.left=(8+Math.random()*70)+"%";el.style.setProperty("--rot",(Math.random()*10-5).toFixed(1)+"deg");
  el.innerHTML=`${esc(text)}${who?`<small>${esc(who)}</small>`:""}`;
  box.appendChild(el);setTimeout(()=>el.remove(),2600);
  tone(700+Math.random()*300,.09,.04,"triangle");
}
function sendGaya(text){const now=Date.now();if(now-gayaLast<350)return;gayaLast=now;
  gayaFly(text,room&&others().length?"あなた":"");
  if(room){gayaN++;setPres({g:{t:text,n:gayaN,at:now}});}}
$("bGaya").addEventListener("click",e=>{e.stopPropagation();const p=$("gayaPal");p.hidden=!p.hidden;$("bGaya").classList.toggle("on",!p.hidden);});
$("gayaPal").innerHTML=GAYA.map(g=>`<button data-g="${esc(g)}">${esc(g)}</button>`).join("");
$("gayaPal").addEventListener("click",e=>{e.stopPropagation();const b=e.target.closest("[data-g]");if(b)sendGaya(b.dataset.g);});
/* ガヤ・音の枠が開いているときの外側クリックは「枠を閉じる」だけにして、本文を進めない（2026-11-05 経太さん） */
document.addEventListener("click",e=>{
  const g=$("gayaPal"),sp=$("sndPop");let closed=false;
  if(!g.hidden&&!e.target.closest("#gayaPal,#bGaya")){g.hidden=true;$("bGaya").classList.remove("on");closed=true;}
  if(!sp.hidden&&!e.target.closest("#sndPop,#bSnd")){sndPop(false);closed=true;}
  const cp=$("cfgPop");if(!cp.hidden&&!e.target.closest("#cfgPop,#bCfg")){cfgPop(false);closed=true;}
  if(closed){e.stopPropagation();e.preventDefault();}
},true);
/* ---------- reading together (room) ---------- */
let room=null,user=null,peers=[],names={};let myPres={};
function setPres(patch){Object.assign(myPres,patch);if(room)room.presence(Object.assign({},myPres)).catch(()=>{});}
function others(){return peers.filter(p=>!p.sameTab&&p.kind==="viewer");}
function hostPeer(){
  return peers.filter(p=>p.presence&&p.presence.host&&p.presence.s&&typeof p.presence.ep==="number")
    .sort((a,b)=>b.presence.ep-a.presence.ep)[0]||null;
}
function nameOf(p){return p.sameTab?"あなた":(p.by&&names[p.by])||p.name||"だれか";}
function snapshot(){return {v:st.v,i:st.i,sub:st.sub||0,ans:st.ans,perm:st.perm,nd:st.nd,om:st.om};}
let pushT=null;
function push(){
  if(!room||st.role!=="host")return;
  clearTimeout(pushT);pushT=setTimeout(()=>{const sn=snapshot();setPres({host:true,ep:st.ep,s:sn});if(SBR.on&&sn.v==="play")SBR.save(sn);},60);
}
function applyHost(s){
  const key=JSON.stringify(s);if(key===st.lastS)return;st.lastS=key;
  if(s.v==="title"){resetProgress();showTitle();return;}
  $("ovRoot").innerHTML="";
  goTo(s.i,s.ans||{},s.sub||0);

}
function roomAction(a){
  if(!room)return;
  if(a==="host"){st.role="host";st.ep=Date.now();setPres({host:true,ep:st.ep,s:snapshot()});}
  else if(a==="solo"){st.role="solo";st.lastS="";setPres({host:null,ep:null,s:null});}
  else if(a==="follow"){st.role="follow";st.lastS="";const h=hostPeer();if(h)applyHost(h.presence.s);}
  updateRoomUI();if(st.sheet==="room")renderSheet();
  if(st.v==="title")renderTitleRoom();else if(st.v==="play"){nxText();$("bk").hidden=isFollower()||prevIndex()<0;document.querySelectorAll("#choices .opt").forEach(b=>{if(st.wait)b.disabled=isFollower();});}
}
function roomSheet(){
  const h=hostPeer();
  const list=peers.filter(p=>p.kind==="viewer").map(p=>`<button><span>${esc(nameOf(p))}${p.guest?" <small>ゲスト</small>":""}</span><span>${h&&p.peer===h.peer?"ホスト":""}</span></button>`).join("");
  let act="";
  if(st.role==="host")act=`<p class="muted">あなたがホストです。あなたの操作で全員の画面が進みます。</p><button class="ghost" data-room="solo">ホストをやめる</button>`;
  else if(st.role==="follow")act=`<p class="muted">${esc(h?nameOf(h):"ホスト")}さんの画面に合わせています。深掘りと用語帳は自分だけで開けます。</p><button class="ghost" data-room="solo">合わせるのをやめて ひとりで読む</button><button class="ghost" data-room="host">自分がホストになる</button>`;
  else act=`${h?`<button class="go" data-room="follow">${esc(nameOf(h))}さんに合わせて読む</button>`:""}<button class="ghost" data-room="host">ホストになって一緒に読む</button>`;
  return `<div class="crumb"><span>参加者</span></div><div class="sh-body"><h2>いま開いている人 ${peers.filter(p=>p.kind==="viewer").length}</h2>
  <div class="glist">${list}</div><div style="display:grid;gap:8px;margin-top:14px">${act}</div>
  ${SBR.code?`<p class="muted" style="margin-top:12px">同じ部屋番号のURLを開いた人と一緒に読めます。部屋No.<b>${esc(SBR.code)}</b></p><div style="display:grid;gap:8px"><label class="muted" style="display:grid;gap:4px">あなたの名前<input data-myname maxlength="12" placeholder="ゲスト" value="${esc(SBR.me_&&SBR.me_.name!=="ゲスト"?SBR.me_.name:"")}" style="font:inherit;padding:8px;border:1px solid var(--line);border-radius:8px;background:var(--sheet);color:var(--ink)"></label><input readonly value="${esc(SBR.link())}" onclick="this.select()" style="font:inherit;padding:8px;border:1px solid var(--line);border-radius:8px;background:var(--sheet);color:var(--ink)"><button class="go" data-share="1">この部屋のURLをシェア</button></div>`:`<p class="muted" style="margin-top:12px">招待は、このページの共有メニューからできます。</p>`}</div>`;
}
function updateRoomUI(){
  const b=$("bRoom");if(!room){b.hidden=true;return;}
  b.hidden=false;const n=peers.filter(p=>p.kind==="viewer").length||1;
  b.textContent=SBR.on?`部屋No.${SBR.code}・${n}人${st.role==="host"?"・ホスト":st.role==="follow"?"・同期中":""}`:st.role==="host"?`参加者 ${n}・ホスト`:st.role==="follow"?`参加者 ${n}・同期中`:`参加者 ${n}`;
  b.classList.toggle("on",st.role!=="solo");
}
async function resolveNames(){
  if(!user)return;const ids=[...new Set(peers.map(p=>p.by).filter(Boolean))];if(!ids.length)return;
  try{const ps=await user.profiles(ids);ids.forEach(id=>{names[id]=(ps[id]&&ps[id].name)||"";});}catch(e){}
}
function bindRoom(){
  updateRoomUI();
  room.onPeers(async ch=>{
    peers=[...ch.peers];
    for(const p of peers){const g=p.presence&&p.presence.g;if(!g||p.sameTab)continue;const k=p.peer;if(gayaSeen[k]===undefined){gayaSeen[k]=g.n;if(Date.now()-g.at<3000)gayaFly(g.t,nameOf(p));continue;}if(g.n!==gayaSeen[k]){gayaSeen[k]=g.n;if(Date.now()-g.at<8000)gayaFly(g.t,nameOf(p));}}
    if(ch.joined.length)await resolveNames();
    const h=hostPeer();
    if(st.role==="host"&&h&&!h.sameTab)roomAction("solo");
    if(!SBR.on&&st.role==="solo"&&h&&!h.sameTab&&!st.autoAsked&&st.v==="title"){st.autoAsked=true;roomAction("follow");}
    if(st.role==="follow"&&h&&!h.sameTab)applyHost(h.presence.s);
    if(st.role==="host"&&ch.joined.length)push();
    updateRoomUI();if(st.sheet==="room"&&!(document.activeElement&&document.activeElement.matches("[data-myname]")))renderSheet();
    if(st.v==="title")renderTitleRoom();
    drawLook();
  },()=>{room=null;updateRoomUI();});
}
/* ポータル版の「一緒に読む」: Supabase Realtime（表は使わない）。?room=部屋番号 が同じ人どうしが同じ部屋。番号が無ければ6桁を割り振る。 */
const SBR={on:false,code:"",
  link(){return location.origin+location.pathname+"?room="+this.code;},
  /* 部屋ごとの読み進めた位置（本番DB history_novel_rooms を関数 hn_room_* 経由で。ホストが「終了」を押したときだけ消す） */
  saved:null,db:null,saveT:null,
  /* 読み進めた位置は章ごと（鎌倉編は部屋番号そのまま、ほかの章は「章ID-番号」） */
  key(){return CFG.room?(CFG.room+"-"+this.code).slice(0,32):this.code;},
  dbc(){return this.db||(this.db=window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:false,autoRefreshToken:false,storageKey:"hn-db"}}));},
  async load(){try{const {data}=await this.dbc().rpc("hn_room_get",{p_room:this.key()});this.saved=data||null;}catch(e){}},
  save(sn){this.saved=sn;clearTimeout(this.saveT);this.saveT=setTimeout(()=>{this.dbc().rpc("hn_room_set",{p_room:this.key(),p_state:sn}).then(()=>{},()=>{});},800);},
  clear(){this.saved=null;clearTimeout(this.saveT);this.dbc().rpc("hn_room_clear",{p_room:this.key()}).then(()=>{},()=>{});},
  async me(){
    let id=null,name="";
    try{name=(localStorage.getItem("hn-name")||localStorage.getItem("nb-name")||"").slice(0,12);}catch(e){}
    try{const a=window.supabase.createClient(SB_URL,SB_KEY);const {data}=await a.auth.getSession();const u=data&&data.session&&data.session.user;
      if(u){id=u.id;const r=await a.from("profiles").select("display_name").eq("user_id",u.id).maybeSingle();const n=((r.data&&r.data.display_name)||"").trim().slice(0,12);if(n&&n!=="名無し")name=n;}}catch(e){}
    return {id,name:name||"ゲスト"};
  },
  async join(code){
    this.code=code;const me=this.me_=await this.me();
    const sb=window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:false,autoRefreshToken:false,storageKey:"hn-rt"},realtime:{heartbeatIntervalMs:15000}});
    const key=Math.random().toString(36).slice(2,10);
    const ch=sb.channel("history-novel:"+(CFG.room?CFG.room+":":"")+code,{config:{presence:{key},broadcast:{self:false}}});
    let cb=null,prev=new Set(),pres={},ready=false,seq=0;const over={};
    const emit=()=>{const s=ch.presenceState(),list=[];
      for(const k in s){const m=s[k][s[k].length-1]||{},o=over[k],pp=(o&&o.q>=(m.q||0))?o.p:(m.p||{});list.push({peer:k,kind:"viewer",sameTab:k===key,by:m.by||null,name:m.name||"",guest:!m.by&&m.name!=="ゲスト",presence:pp});}
      const joined=list.filter(p=>!prev.has(p.peer));prev=new Set(list.map(p=>p.peer));if(cb)cb({peers:list,joined});};
    ch.on("presence",{event:"sync"},emit);
    ch.on("broadcast",{event:"p"},({payload})=>{if(!payload||!payload.k)return;const o=over[payload.k];if(o&&o.q>payload.q)return;over[payload.k]={q:payload.q,p:payload.p||{}};emit();});
    const track=()=>ch.track({by:me.id,name:me.name,p:{host:pres.host||null,ep:pres.ep||null},q:0});
    ch.subscribe(stt=>{if(stt==="SUBSCRIBED"){ready=true;track().catch(()=>{});}});
    this.retrack=()=>{if(ready){lastT=Date.now();track().catch(()=>{});}};
    let lastT=0,tT=null;
    /* presence は「誰がいてホストは誰か」だけ（送りすぎると切断される）。画面の状態は broadcast で配る */
    let tracked="";const slowTrack=()=>{clearTimeout(tT);const sig=JSON.stringify([pres.host||null,pres.ep||null]);if(sig===tracked)return;const w=1500-(Date.now()-lastT);if(w<=0){lastT=Date.now();tracked=sig;track().catch(()=>{tracked="";});}else tT=setTimeout(slowTrack,w);};
    room={presence(p){pres=p;seq=Date.now()*1000+(seq%1000+1);if(!ready)return Promise.resolve();ch.send({type:"broadcast",event:"p",payload:{k:key,q:seq,p}}).catch(()=>{});slowTrack();return Promise.resolve();},onPeers(f){cb=f;}};
    bindRoom();
  }
};
const SB_URL="https://rjydvhpqfhmlvpsykwzf.supabase.co",SB_KEY="sb_publishable_NAVKQxtEtS1zPFj59iXIEQ_Y_RztuSx";
document.addEventListener("change",e=>{const t=e.target;if(!t.matches||!t.matches("[data-myname]")||!SBR.me_)return;const v=t.value.trim().slice(0,12);SBR.me_.name=v||"ゲスト";try{localStorage.setItem("hn-name",v);}catch(x){}SBR.retrack();},true);
document.addEventListener("click",e=>{const b=e.target.closest("[data-share]");if(!b)return;e.stopPropagation();const url=SBR.link();
  if(navigator.share)navigator.share({title:"SUPER歴史ノベル",text:"部屋No."+SBR.code+" で一緒に読もう",url}).catch(()=>{});
  else navigator.clipboard&&navigator.clipboard.writeText(url).then(()=>{b.textContent="コピーしました";setTimeout(()=>{b.textContent="この部屋のURLをシェア";},2000);},()=>{});},true);
(async()=>{
  if(window.claude&&window.claude.use){
    try{user=await window.claude.use("user");}catch(e){}
    try{room=await window.claude.use("room");}catch(e){room=null;}
    if(room)bindRoom();
    return;
  }
  if(!window.supabase)return;
  /* 部屋番号は必ずある（2026-11-05 Keita決定）。?room= が無ければ開くたびにランダムな6桁を割り振る。暗記大戦と同じ決まり */
  const q=new URLSearchParams(location.search);let code=(q.get("room")||"").replace(/[^\w-]/g,"").slice(0,24);
  if(!code){code=String(100000+Math.floor(Math.random()*900000));q.set("room",code);try{history.replaceState(null,"",location.pathname+"?"+q.toString()+location.hash);}catch(e){}}
  SBR.on=true;SBR.code=code;$("bRep").hidden=false;if(st.v==="title")renderTitleRoom();
  await SBR.load();if(st.v==="title")renderTitleRoom();
  await SBR.join(code);if(st.v==="title")renderTitleRoom();
})();
drawSnd();setScene(S[0].scene);mstate=Object.assign(HOME(),S[0].scene.m);buildOverlay();resize();showTitle();
