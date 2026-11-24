// 公開版の全ジャンルを開いて、最初の札の「問題」と「答え合わせ（資料画像つき）」のスクショを残す
// 使い方: node apps/anki-taisen/tools/shoot_all.js [URL] [出力フォルダ]
//   選択肢はふりがな（rt）を除いた文字で正解を探す（2026-11-24）
//   既定: https://natsume-portal.onrender.com/anki-taisen/  → ./shots-YYYYMMDD/
//   AIは使わない。撮ったスクショを人が一覧で見る（index.html を開く）
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
(async()=>{
const URL=process.argv[2]||'https://natsume-portal.onrender.com/anki-taisen/';
const OUT=process.argv[3]||'shots-'+new Date().toISOString().slice(0,10).replace(/-/g,'');
fs.mkdirSync(OUT,{recursive:true});
const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});
await p.goto(URL,{waitUntil:'networkidle'});await p.waitForTimeout(800);
const subs=await p.evaluate(()=>SUBJ.map(s=>({id:s.id,name:s.name})));
const rows=[];let bad=0;
for(const s of subs){
  try{
    // 科目は保存済みの選択（nb-genre）として渡す。タブの階層が変わってもクリック不要で動く
    await p.evaluate(id=>localStorage.setItem('nb-genre',id),s.id);await p.reload({waitUntil:'networkidle'});await p.waitForTimeout(500);
    const g=await p.evaluate(()=>S.genre);if(g!==s.id)throw new Error('科目を選べない '+g);
    await p.getByRole('button',{name:/ひとりで遊ぶ|対戦をはじめる/}).first().click({timeout:4000});await p.waitForTimeout(1000);
    const q=path.join(OUT,s.id+'-q.png');await p.screenshot({path:q});
    const n=await p.evaluate(()=>S.deck[S.qi].name);
    const inp=p.locator('input:visible').first();
    if(await inp.count()){await inp.fill(n,{timeout:2000}).catch(()=>{});await p.getByRole('button',{name:'決定'}).click({timeout:2000}).catch(()=>{});}
    else await p.evaluate(n=>{const tx=x=>{const c=x.cloneNode(true);c.querySelectorAll('rt').forEach(r=>r.remove());return c.textContent.replace(/\s+/g,' ').trim();};const x=[...document.querySelectorAll('button')].find(x=>tx(x)===n);x&&x.click()},n);
    await p.waitForTimeout(900);
    const imgs=await p.evaluate(()=>[...document.querySelectorAll('figure.docimg img')].map(i=>i.complete&&i.naturalWidth>0));
    if(imgs.includes(false))bad++;
    const a=path.join(OUT,s.id+'-a.png');await p.screenshot({path:a,fullPage:true});
    rows.push({s,q:path.basename(q),a:path.basename(a),imgs});console.log(s.name,'OK',imgs);
  }catch(e){rows.push({s,err:String(e).slice(0,120)});bad++;console.log(s.name,'NG',String(e).slice(0,80));}
}
fs.writeFileSync(path.join(OUT,'index.html'),'<meta charset=utf-8><body style="font:13px sans-serif">'+rows.map(r=>`<div style="display:inline-block;margin:6px;vertical-align:top;width:400px"><b>${r.s.name}</b> ${r.err?'<span style=color:red>'+r.err+'</span>':''}${r.imgs&&r.imgs.includes(false)?' <span style=color:red>画像が読めない</span>':''}<br>${r.q?`<img src="${r.q}" width=190> <img src="${r.a}" width=190>`:''}</div>`).join(''));
await b.close();console.log('出力:',OUT+'/index.html','問題あり:',bad);process.exit(bad?1:0);
})();
