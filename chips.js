/* LC-2030 chip interiors: a lithography-style die view per chip, each with its own minigame.
   All visuals are procedural and original. */
(function(){
'use strict';
const LW=800,LH=500;
const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

const CHIP={
 home:      {u:'U1',name:'Microcontroller',   sec:'Home',                    c:'#ffcf4d',tag:'MCU',  macros:['CPU CORE','SRAM 32K','FLASH 256K','PLL']},
 research:  {u:'U2',name:'Voltage Regulator', sec:'Research Projects',       c:'#5b8cff',tag:'VREG', macros:['ERROR AMP','BANDGAP','PASS FET']},
 experience:{u:'U3',name:'EEPROM',            sec:'Experience & Leadership', c:'#d77bff',tag:'MEM',  macros:['CELL ARRAY','CHARGE PUMP','ROW DEC']},
 skills:    {u:'U4',name:'FPGA',              sec:'Skills',                  c:'#3fdc9c',tag:'FPGA', macros:['CLB ARRAY','BRAM','DSP','IO BANK']},
 timeline:  {u:'U5',name:'Crystal Oscillator',sec:'Interactive Timeline',    c:'#ff6b6f',tag:'XTAL', macros:['PIERCE OSC','DIVIDER']},
 play:      {u:'U6',name:'LED Matrix',        sec:'Off the Clock',           c:'#f08a3c',tag:'LED',  macros:['ROW DRIVER','COL SINK','PWM']},
 contact:   {u:'U7',name:'RF Module',         sec:'Contact',                 c:'#6ee7ff',tag:'RF',   macros:['LNA','MIXER','BASEBAND','PA']},
 resume:    {u:'U8',name:'USB-C Port',        sec:'Resume',                  c:'#ecebf5',tag:'USB',  macros:['PHY','PD CTRL','ESD']}
};

/* ---------------- styles + DOM ---------------- */
const css=`
#lcDie{position:fixed;inset:0;z-index:18;background:#05060b;color:#ecebf5;font-family:"Figtree",system-ui,sans-serif;overflow:hidden}
#lcDie[hidden]{display:none!important}
#lcDie .die-bg{position:absolute;inset:0;width:100%;height:100%;display:block}
#lcDie .die-ui{position:absolute;inset:0;display:flex;flex-direction:column;padding:calc(12px + env(safe-area-inset-top,0px)) 16px calc(12px + env(safe-area-inset-bottom,0px))}
.die-top{display:flex;align-items:flex-start;gap:12px;flex-wrap:wrap}
.die-id{background:rgba(5,6,11,.82);border:1px solid var(--dc);padding:8px 14px 10px;border-radius:4px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.die-id .part{font:500 .64rem "JetBrains Mono",monospace;letter-spacing:.14em;color:var(--dc);text-transform:uppercase}
.die-id h2{margin:2px 0 0;font:800 1.2rem/1.1 "Unbounded","Arial Black",sans-serif;letter-spacing:-.02em}
.die-id .sec{font:500 .72rem "JetBrains Mono",monospace;color:#9aa0b8}
.die-btns{margin-left:auto;display:flex;gap:6px;flex-wrap:wrap}
.db{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 12px;border:1px solid #2b3050;background:rgba(5,6,11,.82);border-radius:4px;font:500 .78rem "JetBrains Mono",monospace;white-space:nowrap;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.db:hover{border-color:var(--dc);color:var(--dc)}.db:focus-visible{outline:2px solid #ffcf4d}
.db.pri{background:#ecebf5;color:#05060b;border-color:#ecebf5;font:700 .78rem "Unbounded",sans-serif}
.db.pri:hover{background:var(--dc);border-color:var(--dc);color:#05060b}
.die-core{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:0;gap:8px;padding-top:10px}
.core-frame{position:relative;width:min(100%,calc((100vh - 190px) * 1.6),1100px);aspect-ratio:16/10;border:1.5px solid var(--dc);background:rgba(5,6,11,.9);box-shadow:0 0 0 6px rgba(5,6,11,.6),0 0 60px color-mix(in srgb,var(--dc) 25%,transparent)}
.core-frame canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}
.core-frame .cn{position:absolute;width:16px;height:16px;border:2px solid var(--dc)}
.cn.tl{left:-9px;top:-9px;border-right:0;border-bottom:0}.cn.tr{right:-9px;top:-9px;border-left:0;border-bottom:0}.cn.bl{left:-9px;bottom:-9px;border-right:0;border-top:0}.cn.br{right:-9px;bottom:-9px;border-left:0;border-top:0}
.core-lab{position:absolute;top:-22px;left:0;font:500 .62rem "JetBrains Mono",monospace;letter-spacing:.12em;color:var(--dc);text-transform:uppercase}
.core-coord{font:500 .66rem "JetBrains Mono",monospace;color:#6c6e8a;letter-spacing:.06em;font-variant-numeric:tabular-nums}
.g-ovl{position:absolute;inset:0;display:grid;place-items:center;padding:14px;background:radial-gradient(ellipse at center,rgba(5,6,11,.82),rgba(5,6,11,.95));overflow:auto}
.g-ovl[hidden]{display:none!important}
.g-card{max-width:520px;text-align:center}
.g-tag{font:500 .64rem "JetBrains Mono",monospace;letter-spacing:.16em;color:var(--dc);text-transform:uppercase}
.g-card h3{margin:6px 0 8px;font:800 clamp(1.3rem,3vw,2rem)/1.05 "Unbounded","Arial Black",sans-serif;letter-spacing:-.02em}
.g-card p{margin:0 auto 10px;color:#c9c8da;max-width:46ch;font-size:.95rem;line-height:1.5}
.g-keys{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:0 0 14px;padding:0;list-style:none}
.g-keys li{font:500 .7rem "JetBrains Mono",monospace;color:#9aa0b8;border:1px solid #2b3050;padding:3px 8px;border-radius:3px}
.g-res{margin:0 0 14px}
.g-res b{display:block;font:800 clamp(1.4rem,3.4vw,2.2rem) "Unbounded",sans-serif;color:var(--dc)}
.g-res span{font:500 .78rem "JetBrains Mono",monospace;color:#9aa0b8}
.g-btns{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.g-best{margin-top:10px;font:500 .68rem "JetBrains Mono",monospace;color:#6c6e8a}
.die-flash{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at center,#efe8ff,#9670ff 60%,#3b1f8a);opacity:0;mix-blend-mode:screen}
#lcDie.entering .die-flash{animation:dflash .7s ease-out}
@keyframes dflash{0%{opacity:.95}100%{opacity:0}}
#lcDie.entering .die-ui{animation:dui .8s cubic-bezier(.2,.8,.2,1) .15s both}
@keyframes dui{from{opacity:0;transform:scale(1.04)}}
#lcDie.leaving{animation:dleave .35s ease-in forwards}
@keyframes dleave{to{opacity:0;transform:scale(1.06)}}
@media (max-width:640px){.die-id h2{font-size:1rem}.db .t{display:none}.core-frame{width:100%}.g-card p{font-size:.85rem}}
@media (prefers-reduced-motion: reduce){#lcDie.entering .die-flash,#lcDie.entering .die-ui,#lcDie.leaving{animation:none}}
`;
const stl=document.createElement('style');stl.textContent=css;document.head.appendChild(stl);

const root=document.createElement('section');root.id='lcDie';root.hidden=true;root.setAttribute('role','dialog');root.setAttribute('aria-label','Inside the chip');
root.innerHTML=`<canvas class="die-bg" aria-hidden="true"></canvas><div class="die-ui">
 <div class="die-top"><div class="die-id"><div class="part" id="dPart"></div><h2 id="dName"></h2><div class="sec" id="dSec"></div></div>
  <div class="die-btns"><button class="db" type="button" data-a="read">Read section</button><button class="db" type="button" data-a="cards"><span class="t">Cards </span><span id="dCards">0/150</span></button><button class="db" type="button" data-a="exit">Exit chip <span class="t">⎋</span></button></div></div>
 <div class="die-core"><div class="core-frame" id="dFrame"><span class="core-lab" id="dLab"></span><span class="cn tl"></span><span class="cn tr"></span><span class="cn bl"></span><span class="cn br"></span>
   <canvas id="dGame" aria-label="Minigame"></canvas>
   <div class="g-ovl" id="dOvl"><div class="g-card"><div class="g-tag" id="gTag">Minigame</div><h3 id="gTitle"></h3><p id="gHow"></p><ul class="g-keys" id="gKeys"></ul><div class="g-res" id="gRes" hidden></div>
     <div class="g-btns" id="gBtns"></div><div class="g-best" id="gBest"></div></div></div></div>
  <div class="core-coord" id="dCoord">x 0.000 mm · y 0.000 mm · M1</div></div>
</div><div class="die-flash"></div>`;
document.body.appendChild(root);
const $=s=>root.querySelector(s);
const bg=$('.die-bg'),bgx=bg.getContext('2d'),gcv=$('#dGame');let gx=gcv.getContext('2d');

/* ---------------- die background ---------------- */
function rng(seed){let a=0;for(const ch of seed)a=(a*31+ch.charCodeAt(0))|0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let bgCache=null,reveal=0,revealing=false;
function drawDie(id){
  const c=CHIP[id],R=rng(id),dpr=Math.min(devicePixelRatio||1,2),W=innerWidth,H=innerHeight;
  const off=document.createElement('canvas');off.width=W*dpr;off.height=H*dpr;const g=off.getContext('2d');g.scale(dpr,dpr);
  g.fillStyle='#06070e';g.fillRect(0,0,W,H);
  const tint=g.createRadialGradient(W/2,H/2,10,W/2,H/2,Math.max(W,H)*.7);tint.addColorStop(0,c.c+'22');tint.addColorStop(1,'#06070e00');g.fillStyle=tint;g.fillRect(0,0,W,H);
  const m=16,ring=34;
  // bond wires leaving pads
  g.strokeStyle='rgba(224,168,74,.28)';g.lineWidth=1.2;
  const pads=[];for(let x=ring+20;x<W-ring-20;x+=30){pads.push([x,ring,0,-1]);pads.push([x,H-ring,0,1])}for(let y=ring+20;y<H-ring-20;y+=30){pads.push([ring,y,-1,0]);pads.push([W-ring,y,1,0])}
  pads.forEach(([x,y,dx,dy])=>{g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+dx*40+dy*10,y+dy*40+dx*10,x+dx*80,y+dy*80);g.stroke()});
  // seal ring
  g.strokeStyle='rgba(224,168,74,.55)';g.lineWidth=2;g.strokeRect(m,m,W-2*m,H-2*m);g.strokeStyle='rgba(224,168,74,.25)';g.lineWidth=1;g.strokeRect(m+5,m+5,W-2*m-10,H-2*m-10);
  pads.forEach(([x,y])=>{g.fillStyle='rgba(224,168,74,.75)';g.fillRect(x-6,y-6,12,12);g.fillStyle='rgba(6,7,14,.8)';g.fillRect(x-3,y-3,6,6)});
  // core: standard cell rows
  const cx0=ring+30,cy0=ring+30,cx1=W-ring-30,cy1=H-ring-30;
  const macros=[];const nm=c.macros.length;
  for(let i=0;i<nm;i++){const w=60+R()*Math.min(220,W*.18),h=50+R()*Math.min(160,H*.2);let x,y,tries=0;
    do{x=cx0+R()*(cx1-cx0-w);y=cy0+R()*(cy1-cy0-h);tries++}while(tries<40&&macros.some(b=>x<b.x+b.w+20&&x+w+20>b.x&&y<b.y+b.h+20&&y+h+20>b.y));macros.push({x,y,w,h,l:c.macros[i]})}
  const inMacro=(x,y)=>macros.some(b=>x>b.x-4&&x<b.x+b.w+4&&y>b.y-4&&y<b.y+b.h+4);
  for(let y=cy0;y<cy1;y+=18){let x=cx0;while(x<cx1){const w=6+R()*34;if(!inMacro(x+w/2,y+7)){
      g.fillStyle=`rgba(63,220,156,${.07+R()*.09})`;g.fillRect(x,y+2,w-1.5,12);g.strokeStyle='rgba(255,107,111,.28)';g.lineWidth=1;
      for(let k=x+3;k<x+w-3;k+=4+R()*5){g.beginPath();g.moveTo(k,y);g.lineTo(k,y+16);g.stroke()}}x+=w}
    g.fillStyle='rgba(91,140,255,.16)';g.fillRect(cx0,y,cx1-cx0,1.5);g.fillRect(cx0,y+15,cx1-cx0,1.5)}
  g.strokeStyle='rgba(215,123,255,.12)';g.lineWidth=1.5;for(let x=cx0;x<cx1;x+=6+R()*26){if(R()<.5)continue;const y0=cy0+R()*(cy1-cy0)*.6,len=40+R()*220;g.beginPath();g.moveTo(x,y0);g.lineTo(x,Math.min(cy1,y0+len));g.stroke()}
  g.fillStyle='rgba(224,168,74,.10)';for(let y=cy0+60;y<cy1;y+=130)g.fillRect(cx0,y,cx1-cx0,6);for(let x=cx0+80;x<cx1;x+=200)g.fillRect(x,cy0,6,cy1-cy0);
  macros.forEach(b=>{g.fillStyle='rgba(6,7,14,.85)';g.fillRect(b.x,b.y,b.w,b.h);g.strokeStyle=c.c+'88';g.lineWidth=1.2;g.strokeRect(b.x,b.y,b.w,b.h);
    g.save();g.beginPath();g.rect(b.x,b.y,b.w,b.h);g.clip();g.strokeStyle=c.c+'22';for(let k=-b.h;k<b.w;k+=7){g.beginPath();g.moveTo(b.x+k,b.y);g.lineTo(b.x+k+b.h,b.y+b.h);g.stroke()}g.restore();
    g.font='500 10px "JetBrains Mono",monospace';g.fillStyle=c.c+'cc';g.fillText(b.l,b.x+6,b.y+14)});
  // alignment marks
  const mark=(x,y)=>{g.strokeStyle='rgba(255,207,77,.75)';g.lineWidth=1.5;g.beginPath();g.moveTo(x-14,y);g.lineTo(x+14,y);g.moveTo(x,y-14);g.lineTo(x,y+14);g.stroke();g.strokeRect(x-7,y-7,14,14);
    for(let i=0;i<5;i++){g.beginPath();g.moveTo(x+20+i*4,y-4);g.lineTo(x+20+i*4,y+(i===2?6:3));g.stroke()}};
  mark(m+30,m+30);mark(W-m-60,H-m-30);
  g.font='600 11px "JetBrains Mono",monospace';g.fillStyle='rgba(236,235,245,.55)';g.textAlign='right';g.fillText(`LC-2030 · ${c.u} · ${c.tag} · REV A · L.CHIANG 2026`,W-m-14,H-m-12);g.textAlign='left';
  return off;
}
function paintBg(){if(!bgCache)return;const dpr=Math.min(devicePixelRatio||1,2);bg.width=innerWidth*dpr;bg.height=innerHeight*dpr;const W=bg.width,H=bg.height;
  bgx.clearRect(0,0,W,H);const y=reveal*H;bgx.drawImage(bgCache,0,0,W,y,0,0,W,y);
  if(reveal<1){const gr=bgx.createLinearGradient(0,y-60*dpr,0,y);gr.addColorStop(0,'rgba(110,231,255,0)');gr.addColorStop(1,'rgba(110,231,255,.55)');bgx.fillStyle=gr;bgx.fillRect(0,y-60*dpr,W,60*dpr);bgx.fillStyle='#fff';bgx.fillRect(0,y-2*dpr,W,3*dpr)}}

/* ---------------- shared drawing helpers ---------------- */
const F={mono:'"JetBrains Mono",ui-monospace,monospace',disp:'"Unbounded","Arial Black",sans-serif',body:'"Figtree",system-ui,sans-serif'};
function T(g,s,x,y,o){o=o||{};g.font=`${o.w||500} ${o.s||14}px ${o.f||F.mono}`;g.fillStyle=o.c||'#ecebf5';g.textAlign=o.a||'left';g.textBaseline=o.b||'alphabetic';g.fillText(s,x,y);g.textAlign='left';g.textBaseline='alphabetic'}
function gridBg(g,col){g.fillStyle='#070911';g.fillRect(0,0,LW,LH);g.strokeStyle='rgba(255,255,255,.035)';g.lineWidth=1;for(let x=0;x<=LW;x+=20){g.beginPath();g.moveTo(x,0);g.lineTo(x,LH);g.stroke()}for(let y=0;y<=LH;y+=20){g.beginPath();g.moveTo(0,y);g.lineTo(LW,y);g.stroke()}}
function rr(g,x,y,w,h,r){g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,r);else g.rect(x,y,w,h)}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

/* ================= GAMES ================= */
const GAMES={};

/* ---------- U1 MCU: Pipeline ---------- */
GAMES.home={title:'Pipeline',how:'Instructions stream toward the clock edge. Hit each one as it crosses the line to push it through Fetch, Decode and Execute. Miss and the pipeline stalls.',
 keys:['F / D / E keys','or tap a lane'],make(api){
  const lanes=[{k:'f',n:'FETCH',y:150},{k:'d',n:'DECODE',y:250},{k:'e',n:'EXECUTE',y:350}],HIT=170,SPD=330,BEAT=.5;
  const OPS=['LDR R1','ADD R2','STR R1','MOV R0','SUB R3','CMP R2','BNE L1','AND R4','LSL R1','ORR R0'];
  const notes=[];let t=-1.2,i=0;for(let b=0;b<30;b++){const lane=(b*7+((b*b)%5))%3;notes.push({lane,time:b*BEAT+(b>18&&b%2?BEAT/2:0),op:OPS[(b*3)%OPS.length],st:0});}
  const total=notes.length;let hits=0,perf=0,combo=0,best=0,fx=[],stall=0,stage=['','',''];
  function judge(l){const cand=notes.filter(n=>n.lane===l&&n.st===0).sort((a,b)=>Math.abs(a.time-t)-Math.abs(b.time-t))[0];
    if(!cand||Math.abs(cand.time-t)>.18){combo=0;stall=.35;api.sfx('bad');return}
    const d=Math.abs(cand.time-t);cand.st=1;hits++;combo++;best=Math.max(best,combo);if(d<.07)perf++;stage=[cand.op,stage[0],stage[1]];
    fx.push({l,txt:d<.07?'PERFECT':'GOOD',t:0});api.sfx('ok')}
  return{update(dt){t+=dt;stall=Math.max(0,stall-dt);notes.forEach(n=>{if(n.st===0&&t-n.time>.2){n.st=2;combo=0;stall=.35}});fx.forEach(f=>f.t+=dt);fx=fx.filter(f=>f.t<.6);
      api.hud(`HIT ${hits}/${total}`,`COMBO ${combo}`);
      if(t>notes[notes.length-1].time+.8){const acc=hits/total;api.end(acc>=.7,acc>=.7?'Pipeline clean':'Pipeline stalled',`${Math.round(acc*100)}% hit · ${perf} perfect · best combo ${best}`,Math.round(acc*100),'%')}},
    draw(g){gridBg(g);
      // clock
      g.strokeStyle='rgba(255,207,77,.55)';g.lineWidth=2;g.beginPath();for(let x=0;x<=LW;x+=2){const ph=((x-HIT)/SPD+t)/BEAT;const v=((ph%1)+1)%1<.5?60:80;x?g.lineTo(x,v):g.moveTo(x,v)}g.stroke();T(g,'CLK',12,52,{s:11,c:'#ffcf4d'});
      lanes.forEach((L,li)=>{g.fillStyle='rgba(255,255,255,.03)';g.fillRect(0,L.y-32,LW,64);g.strokeStyle='rgba(255,255,255,.08)';g.beginPath();g.moveTo(0,L.y);g.lineTo(LW,L.y);g.stroke();
        T(g,L.k.toUpperCase(),26,L.y+8,{s:22,w:800,f:F.disp,c:api.color});T(g,L.n,60,L.y+5,{s:10,c:'#9aa0b8'})});
      g.strokeStyle=stall>0?'#ff6b6f':'#ecebf5';g.lineWidth=3;g.beginPath();g.moveTo(HIT,105);g.lineTo(HIT,395);g.stroke();
      notes.forEach(n=>{if(n.st)return;const x=HIT+(n.time-t)*SPD;if(x<-80||x>LW+80)return;const y=lanes[n.lane].y;
        g.fillStyle='#14172a';rr(g,x-44,y-18,88,36,4);g.fill();g.strokeStyle=api.color;g.lineWidth=2;rr(g,x-44,y-18,88,36,4);g.stroke();
        for(let k=0;k<5;k++){g.fillStyle='#c9ced8';g.fillRect(x-36+k*17,y-23,6,5);g.fillRect(x-36+k*17,y+18,6,5)}T(g,n.op,x,y+5,{s:13,a:'center',w:700})});
      fx.forEach(f=>{const y=lanes[f.l].y-34-f.t*40;g.globalAlpha=1-f.t/.6;T(g,f.txt,HIT,y,{s:14,w:800,a:'center',c:f.txt==='PERFECT'?'#3fdc9c':'#ffcf4d'});g.globalAlpha=1});
      if(stall>0){g.globalAlpha=stall/.35;T(g,'STALL',LW/2,450,{s:26,w:800,f:F.disp,a:'center',c:'#ff6b6f'});g.globalAlpha=1}
      // stage boxes
      ['IF','ID','EX'].forEach((s,k)=>{const x=560+k*76;g.strokeStyle='rgba(255,255,255,.2)';g.strokeRect(x,430,70,44);T(g,s,x+6,444,{s:10,c:'#9aa0b8'});T(g,stage[k]||'—',x+35,464,{s:12,a:'center',w:700,c:stage[k]?api.color:'#4b4f70'})});
      if(t<0)T(g,'READY',LW/2,LH/2+90,{s:20,w:800,f:F.disp,a:'center',c:'#ecebf5'});},
    key(k,down){if(!down)return;const l=lanes.findIndex(L=>L.k===k.toLowerCase());if(l>=0)judge(l)},
    down(x,y){const l=lanes.findIndex(L=>Math.abs(y-L.y)<50);if(l>=0)judge(l)}}}};

/* ---------- U2 VREG: Hold the Rail ---------- */
GAMES.research={title:'Hold the Rail',how:'The output has to stay at 3.30 V. The load jumps around and the thermoelectric input surges in pulses. Adjust the duty cycle to keep the trace inside the green band.',
 keys:['Mouse up/down','or ↑ ↓ keys','30 seconds'],make(api){
  let t=0,v=3.3,d=.6,L=.6,Lt=2,vin=5,teg=0,inBand=0,hist=[],up=0,dn=0,tegFlash=0;const DUR=30;
  return{update(dt){t+=dt;if(up)d+=dt*.7;if(dn)d-=dt*.7;d=clamp(d,0,1);
      Lt-=dt;if(Lt<=0){L=.2+Math.random()*1.4;Lt=1.4+Math.random()*1.8}
      if(Math.random()<dt*.35){teg=1.3;tegFlash=.5}teg*=Math.pow(.25,dt);tegFlash=Math.max(0,tegFlash-dt);
      vin=5+.35*Math.sin(t*.8)+teg;const target=vin*d*1.25-L*.9;v+=(target-v)*dt*3.2;
      const ok=Math.abs(v-3.3)<.1;if(ok)inBand+=dt;hist.push(v);if(hist.length>360)hist.shift();
      api.hud(`IN BAND ${Math.round(inBand/Math.max(t,.01)*100)}%`,`${Math.max(0,DUR-t).toFixed(1)} s`);
      if(t>=DUR){const p=Math.round(inBand/DUR*100);api.end(p>=60,p>=60?'Rail held':'Rail drifted',`${p}% of the time inside 3.30 V ± 0.10`,p,'%')}},
    draw(g){gridBg(g);const X0=40,X1=600,Y=v=>420-(v-1.5)*110;
      g.fillStyle='rgba(63,220,156,.12)';g.fillRect(X0,Y(3.4),X1-X0,Y(3.2)-Y(3.4));g.strokeStyle='rgba(63,220,156,.6)';g.setLineDash([6,6]);g.beginPath();g.moveTo(X0,Y(3.3));g.lineTo(X1,Y(3.3));g.stroke();g.setLineDash([]);
      [2,2.5,3,3.5,4,4.5].forEach(k=>{T(g,k.toFixed(1),X0-6,Y(k)+4,{s:10,a:'right',c:'#6c6e8a'})});
      g.strokeStyle=Math.abs(v-3.3)<.1?'#3fdc9c':'#ff6b6f';g.lineWidth=2.5;g.shadowColor=g.strokeStyle;g.shadowBlur=10;g.beginPath();
      hist.forEach((h,i)=>{const x=X1-(hist.length-1-i)*((X1-X0)/360);const y=clamp(Y(h),30,470);i?g.lineTo(x,y):g.moveTo(x,y)});g.stroke();g.shadowBlur=0;
      T(g,v.toFixed(2)+' V',X0+10,60,{s:40,w:800,f:F.disp,c:Math.abs(v-3.3)<.1?'#3fdc9c':'#ff6b6f'});T(g,'V_OUT · target 3.30 V',X0+10,80,{s:11,c:'#9aa0b8'});
      // side meters
      const bar=(x,label,val,max,col)=>{g.strokeStyle='rgba(255,255,255,.2)';g.strokeRect(x,90,34,320);const h=clamp(val/max,0,1)*316;g.fillStyle=col;g.fillRect(x+2,408-h,30,h);T(g,label,x+17,430,{s:10,a:'center',c:'#9aa0b8'});T(g,val.toFixed(2),x+17,446,{s:11,a:'center',w:700})};
      bar(630,'V_IN',vin,7,tegFlash>0?'#ffcf4d':'#5b8cff');bar(680,'LOAD',L,2,'#ff6b6f');bar(730,'DUTY',d,1,api.color);
      g.fillStyle='#ecebf5';g.fillRect(726,408-d*316-3,42,6);
      if(tegFlash>0){g.globalAlpha=tegFlash*2;T(g,'TEG PULSE',615,80,{s:11,w:700,c:'#ffcf4d'});g.globalAlpha=1}},
    key(k,down){if(k==='ArrowUp'||k==='w')up=down;if(k==='ArrowDown'||k==='s')dn=down},
    move(x,y,pressed){if(pressed||api.pointerFine)d=clamp(1-(y-90)/320,0,1)},down(x,y){d=clamp(1-(y-90)/320,0,1)}}}};

/* ---------- U3 EEPROM: Bit Flip ---------- */
GAMES.experience={title:'Bit Flip',how:'Sixteen memory cells, eight stored roles. Flip two cells at a time and find every matching pair to read the whole memory back.',
 keys:['Click cells','or arrows + Enter'],make(api){
  const roles=api.roles();const deck=[];roles.forEach((r,i)=>{deck.push(i,i)});for(let i=deck.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[deck[i],deck[j]]=[deck[j],deck[i]]}
  const cells=deck.map((r,i)=>({r,i,open:false,done:false,f:0}));let sel=[],lock=0,moves=0,t=0,cur=0,last='',matched=0;
  const CW=118,CH=78,GX=(LW-4*CW-3*12)/2,GY=40;
  const pos=i=>[GX+(i%4)*(CW+12),GY+(i/4|0)*(CH+12)];
  function flip(i){const c=cells[i];if(lock>0||c.open||c.done||sel.length>=2)return;c.open=true;sel.push(c);api.sfx('tick');
    if(sel.length===2){moves++;if(sel[0].r===sel[1].r){sel.forEach(s=>{s.done=true});matched++;last=roles[sel[0].r];sel=[];api.sfx('ok');
        if(matched===roles.length)setTimeout(()=>api.end(true,'Memory verified',`All ${roles.length} roles read back in ${moves} flips · ${t.toFixed(1)} s`,moves,' flips',true),500)}
      else{lock=.75;api.sfx('bad')}}}
  return{update(dt){t+=dt;cells.forEach(c=>{c.f+=((c.open||c.done?1:0)-c.f)*Math.min(1,dt*10)});if(lock>0){lock-=dt;if(lock<=0){sel.forEach(s=>s.open=false);sel=[]}}
      api.hud(`PAIRS ${matched}/${roles.length}`,`FLIPS ${moves}`)},
    draw(g){gridBg(g);cells.forEach((c,i)=>{const [x,y]=pos(i),sx=Math.abs(Math.cos(c.f*Math.PI)),showFace=c.f>.5;
        g.save();g.translate(x+CW/2,y+CH/2);g.scale(Math.max(.04,sx),1);
        g.fillStyle=showFace?(c.done?'rgba(215,123,255,.22)':'#1b1f38'):'#10132a';rr(g,-CW/2,-CH/2,CW,CH,4);g.fill();
        g.strokeStyle=i===cur&&api.kb()?'#ffcf4d':c.done?api.color:'rgba(255,255,255,.18)';g.lineWidth=i===cur&&api.kb()?2.5:1.2;rr(g,-CW/2,-CH/2,CW,CH,4);g.stroke();
        if(showFace){const r=roles[c.r];T(g,r.k,0,-4,{s:r.k.length>9?13:15,w:800,f:F.disp,a:'center',c:c.done?'#ecebf5':api.color});T(g,r.d,0,18,{s:9,a:'center',c:'#9aa0b8'})}
        else{T(g,'0x'+i.toString(16).toUpperCase().padStart(2,'0'),0,6,{s:16,w:700,a:'center',c:'#4b4f70'});for(let k=0;k<6;k++){g.fillStyle='rgba(215,123,255,.18)';g.fillRect(-CW/2+10+k*17,CH/2-14,10,6)}}
        g.restore()});
      if(last){T(g,'READ ▸ '+last.full,LW/2,LH-28,{s:13,a:'center',c:'#ecebf5',w:600})}},
    key(k,down){if(!down)return;if(k==='ArrowRight')cur=(cur+1)%16;else if(k==='ArrowLeft')cur=(cur+15)%16;else if(k==='ArrowDown')cur=(cur+4)%16;else if(k==='ArrowUp')cur=(cur+12)%16;else if(k==='Enter'||k===' ')flip(cur)},
    down(x,y){for(let i=0;i<16;i++){const [cx,cy]=pos(i);if(x>cx&&x<cx+CW&&y>cy&&y<cy+CH){cur=i;flip(i);return}}}}}};

/* ---------- U4 FPGA: Route the Logic ---------- */
GAMES.skills={title:'Route the Logic',how:'Each logic block can be configured as AND, OR, XOR, NAND or NOR. Set the blocks so the output column matches the target truth table. Three levels.',
 keys:['Click a block to cycle','or 1–3 then Space'],make(api){
  const GATES=['AND','OR','XOR','NAND','NOR'];const fn={AND:(a,b)=>a&b,OR:(a,b)=>a|b,XOR:(a,b)=>a^b,NAND:(a,b)=>1-(a&b),NOR:(a,b)=>1-(a|b)};
  const LV=[{ins:['A','B'],slots:1,eval:(s,v)=>fn[s[0]](v.A,v.B)},
    {ins:['A','B','C'],slots:2,eval:(s,v)=>fn[s[1]](fn[s[0]](v.A,v.B),v.C)},
    {ins:['A','B','C'],slots:3,eval:(s,v)=>fn[s[2]](fn[s[0]](v.A,v.B),fn[s[1]](v.B,v.C))}];
  let lv=0,slots,target,rows,t=0,sel=0,solvedT=0,anim=0,sw=0;
  function setup(){const L=LV[lv];rows=[];const n=L.ins.length;for(let m=0;m<(1<<n);m++){const v={};L.ins.forEach((k,i)=>v[k]=(m>>(n-1-i))&1);rows.push(v)}
    let tg;do{tg=Array.from({length:L.slots},()=>GATES[Math.random()*5|0]);target=rows.map(v=>L.eval(tg,v));slots=Array(L.slots).fill('AND')}while(rows.every((v,i)=>L.eval(slots,v)===target[i])||new Set(target).size<2);sel=0;solvedT=0}
  setup();
  const cur=()=>rows.map(v=>LV[lv].eval(slots,v));const solved=()=>cur().every((x,i)=>x===target[i]);
  const blocks=()=>{const n=LV[lv].slots;if(n===1)return[[220,210]];if(n===2)return[[180,150],[360,250]];return[[170,130],[170,300],[360,215]]};
  function cyc(i){if(solvedT)return;slots[i]=GATES[(GATES.indexOf(slots[i])+1)%5];api.sfx('tick');if(solved()){solvedT=1.1;api.sfx('ok')}}
  return{update(dt){t+=dt;anim+=dt;if(anim>.9){anim=0;sw=(sw+1)%rows.length}
      if(solvedT){solvedT-=dt;if(solvedT<=0){if(lv===2){api.end(true,'Bitstream loaded',`All 3 levels routed in ${t.toFixed(1)} s`,Math.round(t*10)/10,' s',true);solvedT=0;return}lv++;setup()}}
      api.hud(`LEVEL ${lv+1}/3`,`${t.toFixed(1)} s`)},
    draw(g){gridBg(g);const L=LV[lv],B=blocks(),row=rows[sw],vals={};L.ins.forEach(k=>vals[k]=row[k]);
      const iy=k=>({A:140,B:230,C:320})[k];
      L.ins.forEach(k=>{const on=vals[k];g.fillStyle=on?api.color:'#2b3050';g.fillRect(40,iy(k)-14,28,28);T(g,k,54,iy(k)+5,{s:14,w:800,a:'center',c:on?'#05060b':'#9aa0b8'})});
      const wire=(pts,on)=>{g.strokeStyle=on?api.color:'rgba(255,255,255,.18)';g.lineWidth=on?3:2;g.shadowColor=api.color;g.shadowBlur=on?8:0;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();g.shadowBlur=0};
      const out=[];
      if(L.slots===1){const o=fn[slots[0]](vals.A,vals.B);wire([[68,140],[140,140],[140,195],[220,195]],vals.A);wire([[68,230],[140,230],[140,225],[220,225]],vals.B);out[0]=o;wire([[320,210],[420,210]],o)}
      else if(L.slots===2){const o1=fn[slots[0]](vals.A,vals.B),o2=fn[slots[1]](o1,vals.C);wire([[68,140],[140,140],[180,140]],vals.A);wire([[68,230],[120,230],[120,165],[180,165]],vals.B);
        wire([[280,150],[320,150],[320,240],[360,240]],o1);wire([[68,320],[320,320],[320,265],[360,265]],vals.C);out[0]=o1;out[1]=o2;wire([[460,250],[520,250]],o2)}
      else{const o1=fn[slots[0]](vals.A,vals.B),o2=fn[slots[1]](vals.B,vals.C),o3=fn[slots[2]](o1,o2);wire([[68,140],[170,140]],vals.A);wire([[68,230],[120,230],[120,160],[170,160]],vals.B);
        wire([[120,230],[120,310],[170,310]],vals.B);wire([[68,320],[100,320],[100,330],[170,330]],vals.C);wire([[270,140],[320,140],[320,205],[360,205]],o1);wire([[270,315],[320,315],[320,235],[360,235]],o2);out[0]=o1;out[1]=o2;out[2]=o3;wire([[460,215],[520,215]],o3)}
      B.forEach(([x,y],i)=>{g.fillStyle='rgba(63,220,156,.08)';g.fillRect(x,y-36,100,72);g.strokeStyle=i===sel&&api.kb()?'#ffcf4d':api.color;g.lineWidth=2;g.strokeRect(x,y-36,100,72);
        T(g,'CLB '+(i+1),x+6,y-22,{s:9,c:'#9aa0b8'});T(g,slots[i],x+50,y+8,{s:20,w:800,f:F.disp,a:'center'});g.fillStyle=out[i]?api.color:'#2b3050';g.fillRect(x+86,y+22,8,8)});
      const ox=L.slots===1?420:520,oy=L.slots===1?210:L.slots===2?250:215,yo=out[L.slots-1];g.fillStyle=yo?api.color:'#2b3050';g.fillRect(ox,oy-14,28,28);T(g,'Y',ox+14,oy+5,{s:14,w:800,a:'center',c:yo?'#05060b':'#9aa0b8'});
      // truth table
      const tx=575,ty=40,c=cur();T(g,'TRUTH TABLE',tx,ty,{s:10,c:'#9aa0b8'});const n=L.ins.length;
      T(g,L.ins.join(' ')+'   Y  GOAL',tx,ty+22,{s:12,c:'#6c6e8a',w:700});
      rows.forEach((v,i)=>{const y=ty+44+i*(L.slots===1?34:26),ok=c[i]===target[i];if(i===sw){g.fillStyle='rgba(255,255,255,.06)';g.fillRect(tx-6,y-15,212,22)}
        T(g,L.ins.map(k=>v[k]).join(' ')+'   '+c[i]+'   '+target[i],tx,y,{s:13,w:700,c:ok?'#3fdc9c':'#ff6b6f'});T(g,ok?'✓':'✗',tx+190,y,{s:13,c:ok?'#3fdc9c':'#ff6b6f'})});
      if(solvedT>0){g.globalAlpha=Math.min(1,solvedT*2);T(g,lv===2?'BITSTREAM OK':'LEVEL '+(lv+1)+' ROUTED',300,450,{s:24,w:800,f:F.disp,a:'center',c:'#3fdc9c'});g.globalAlpha=1}},
    key(k,down){if(!down)return;if(/^[1-3]$/.test(k)&&+k<=LV[lv].slots)sel=+k-1;else if(k===' '||k==='Enter')cyc(sel);else if(k==='ArrowRight'||k==='Tab')sel=(sel+1)%LV[lv].slots},
    down(x,y){blocks().forEach(([bx,by],i)=>{if(x>bx&&x<bx+100&&y>by-36&&y<by+36){sel=i;cyc(i)}})}}}};

/* ---------- U5 XTAL: Resonance ---------- */
GAMES.timeline={title:'Resonance',how:'Tune your oscillator to the crystal. When the frequencies match, the figure on the right settles into a steady ellipse. Hold the lock to step through the timeline.',
 keys:['Mouse left/right','or ← → (Shift = fine)','4 locks'],make(api){
  const stops=api.stops();let t=0,f=1.2,fc=0,lockT=0,locks=0,lv=0,lf=0,shift=0,phase=0,kl=0,kr=0;const NEED=4,TL=60;
  const nf=()=>{fc=1.8+Math.random()*3;if(Math.abs(fc-f)<.8)fc=clamp(f+1.2,1.6,5)};nf();
  return{update(dt){t+=dt;if(kl)f-=dt*(shift?.15:.8);if(kr)f+=dt*(shift?.15:.8);f=clamp(f,1,6);phase+=dt;
      const close=Math.abs(f-fc)<.05;if(close){lockT+=dt;if(lockT>1.2){locks++;lockT=0;lf=1.2;api.sfx('ok');if(locks>=NEED){api.end(true,'Phase locked',`${NEED} locks in ${t.toFixed(1)} s`,Math.round(t*10)/10,' s',true);return}nf()}}else lockT=Math.max(0,lockT-dt*2);
      lf=Math.max(0,lf-dt);api.hud(`LOCKS ${locks}/${NEED}`,`${Math.max(0,TL-t).toFixed(0)} s`);
      if(t>=TL)api.end(false,'Lost lock',`${locks}/${NEED} locks before time ran out`,null)},
    draw(g){gridBg(g);
      // waveforms
      const wave=(fr,col,y0,ph)=>{g.strokeStyle=col;g.lineWidth=2.4;g.beginPath();for(let x=30;x<=440;x+=2){const tt=(x-30)/410*2;const y=y0-Math.sin(6.283*fr*(tt+phase*.25)+ph)*42;x===30?g.moveTo(x,y):g.lineTo(x,y)}g.stroke()};
      T(g,'CRYSTAL',30,60,{s:10,c:api.color});wave(fc,api.color,120,0);T(g,'YOUR OSC',30,200,{s:10,c:'#6ee7ff'});wave(f,'#6ee7ff',260,.6);
      T(g,`f_xtal hidden   f_osc ${(f*7.3728).toFixed(3)} kHz`,30,340,{s:12,c:'#9aa0b8'});
      // lissajous
      const cx=610,cy=190,R=130;g.strokeStyle='rgba(255,255,255,.15)';g.strokeRect(cx-R,cy-R,2*R,2*R);g.beginPath();g.moveTo(cx-R,cy);g.lineTo(cx+R,cy);g.moveTo(cx,cy-R);g.lineTo(cx,cy+R);g.stroke();
      const close=Math.abs(f-fc)<.05;g.strokeStyle=close?'#3fdc9c':'rgba(110,231,255,.8)';g.lineWidth=1.8;g.shadowColor=g.strokeStyle;g.shadowBlur=close?14:4;g.beginPath();
      for(let k=0;k<=600;k++){const tt=k/600*2+phase*.5;const x=cx+Math.sin(6.283*fc*tt)*R*.9,y=cy+Math.sin(6.283*f*tt+.9)*R*.9;k?g.lineTo(x,y):g.moveTo(x,y)}g.stroke();g.shadowBlur=0;
      g.fillStyle='#2b3050';g.fillRect(cx-R,cy+R+14,2*R,8);g.fillStyle='#3fdc9c';g.fillRect(cx-R,cy+R+14,2*R*clamp(lockT/1.2,0,1),8);T(g,'LOCK',cx-R,cy+R+38,{s:10,c:'#9aa0b8'});
      // tuning bar
      g.fillStyle='rgba(255,255,255,.06)';g.fillRect(30,365,410,10);g.fillStyle='#6ee7ff';g.fillRect(30+(f-1)/5*410-3,358,6,24);
      // timeline stops revealed
      const shown=Math.min(stops.length,locks*2);T(g,'TIMELINE',30,412,{s:10,c:'#9aa0b8'});
      for(let i=0;i<stops.length;i++){const x=30+i*96,on=i<shown;g.fillStyle=on?api.color:'#2b3050';g.fillRect(x,422,10,10);
        if(on){T(g,stops[i].d,x+14,431,{s:10,w:700,c:api.color});T(g,stops[i].t.length>14?stops[i].t.slice(0,13)+'…':stops[i].t,x,452,{s:10,c:'#c9c8da'})}}
      if(lf>0){g.globalAlpha=lf;T(g,'LOCKED',cx,cy+6,{s:26,w:800,f:F.disp,a:'center',c:'#3fdc9c'});g.globalAlpha=1}},
    key(k,down,e){shift=e&&e.shiftKey;if(k==='ArrowLeft'||k==='a')kl=down;if(k==='ArrowRight'||k==='d')kr=down},
    move(x,y,pressed){if(pressed||api.pointerFine){if(x<460)f=clamp(1+(x-30)/410*5,1,6)}},down(x){if(x<460)f=clamp(1+(x-30)/410*5,1,6)}}}};

/* ---------- U6 LED: Pixel Free Throw ---------- */
GAMES.play={title:'Pixel Free Throw',how:'Ten free throws on the LED matrix. The power meter climbs and falls on the left column. Release when it’s in the bright zone. The zone shrinks as your streak grows.',
 keys:['Space or click to shoot','10 shots'],extra:'binder',make(api){
  const C=20,R=12,S=LW/C,meterMax=R-2;let t=0,shot=0,made=0,streak=0,phase=0,ball=null,res='',resT=0,trail=[];const ZONE=()=>streak>=3?[7,7]:[6,7];
  const rim={c:16,r:4},board={c:18};
  function shoot(){if(ball||shot>=10)return;const lvl=Math.round(Math.abs(Math.sin(phase))*meterMax);shot++;const [z0,z1]=ZONE();
    const kind=lvl>=z0&&lvl<=z1?(lvl===7?'swish':'bank'):lvl>z1?'long':'short';const ok=kind==='swish'||kind==='bank';
    const target=kind==='swish'?[rim.c+.5,rim.r]:kind==='bank'?[board.c-.2,rim.r-1.6]:kind==='long'?[board.c+.4,rim.r-2.2]:[rim.c-3,rim.r+1];
    ball={x:2,y:9,t:0,dur:1.05,tx:target[0],ty:target[1],ok,kind,stage:0};api.sfx('tick')}
  return{update(dt){t+=dt;if(!ball)phase+=dt*(2.1+streak*.25);resT=Math.max(0,resT-dt);
      if(ball){ball.t+=dt;const p=Math.min(1,ball.t/ball.dur);ball.x=2+(ball.tx-2)*p;ball.y=9+(ball.ty-9)*p-Math.sin(p*Math.PI)*7.5;trail.push([Math.round(ball.x),Math.round(ball.y),1]);
        if(p>=1&&ball.stage===0){ball.stage=1;ball.t=0;ball.dur=.45;const sx=ball.x,sy=ball.y;ball.from=[sx,sy];
          if(ball.ok){ball.tx=rim.c+.5;ball.ty=R-2;made++;streak++;res=ball.kind==='swish'?'SWISH':'BANK';api.sfx('ok')}else{ball.tx=ball.kind==='long'?board.c+1:rim.c-5;ball.ty=R-1;streak=0;res='MISS';api.sfx('bad')}resT=1}
        else if(ball.stage===1){const q=Math.min(1,ball.t/ball.dur);ball.x=ball.from[0]+(ball.tx-ball.from[0])*q;ball.y=ball.from[1]+(ball.ty-ball.from[1])*q;if(q>=1){ball=null;
          if(shot>=10)setTimeout(()=>api.end(made>=6,made>=6?'Nothing but net':'Off the rim',`${made}/10 free throws`,made,'/10'),500)}}}
      trail.forEach(p=>p[2]-=dt*2.5);trail=trail.filter(p=>p[2]>0);api.hud(`MADE ${made}/${shot}`,`STREAK ${streak}`)},
    draw(g){g.fillStyle='#060608';g.fillRect(0,0,LW,LH);const lit={};const set=(c,r,col,a)=>{if(c<0||r<0||c>=C||r>=R)return;lit[c+','+r]=[col,a==null?1:a]};
      for(let r=1;r<=4;r++)set(board.c,r,'#c9ced8',.85);for(let c=rim.c;c<=rim.c+2;c++)set(c,rim.r,'#ff6b6f');set(rim.c,rim.r+1,'#9aa0b8',.5);set(rim.c+2,rim.r+1,'#9aa0b8',.5);set(rim.c+1,rim.r+2,'#9aa0b8',.4);
      for(let c=0;c<C;c++)set(c,R-1,'#3a2a1a',.6);
      const lvl=Math.round(Math.abs(Math.sin(phase))*meterMax),[z0,z1]=ZONE();for(let k=0;k<=meterMax;k++){const r=R-2-k,inZ=k>=z0&&k<=z1;set(0,r,inZ?'#3fdc9c':'#f08a3c',k<=lvl?1:inZ?.28:.12)}
      set(2,10,'#ecebf5',.9);set(2,11,'#ecebf5',.6);
      trail.forEach(([c,r,a])=>set(c,r,'#f08a3c',a*.6));if(ball)set(Math.round(ball.x),Math.round(ball.y),'#ffb347');else if(shot<10)set(2,9,'#ffb347');
      for(let r=0;r<R;r++)for(let c=0;c<C;c++){const L=lit[c+','+r],x=c*S+S/2,y=r*S+S/2+(LH-R*S)/2;
        g.fillStyle='#120d0a';g.beginPath();g.arc(x,y,S*.36,0,6.283);g.fill();if(L){g.globalAlpha=L[1];g.fillStyle=L[0];g.shadowColor=L[0];g.shadowBlur=14;g.beginPath();g.arc(x,y,S*.34,0,6.283);g.fill();g.shadowBlur=0;g.globalAlpha=1}}
      if(resT>0){g.globalAlpha=Math.min(1,resT*2);T(g,res,LW/2,60,{s:34,w:800,f:F.disp,a:'center',c:res==='MISS'?'#9aa0b8':'#ffcf4d'});g.globalAlpha=1}},
    key(k,down){if(down&&(k===' '||k==='Enter'))shoot()},down(){shoot()}}}};

/* ---------- U7 RF: Signal Lock ---------- */
GAMES.contact={title:'Signal Lock',how:'Somewhere in the 2.4 GHz band a packet is waiting. Watch the waterfall for its trace, tune the dial onto it and hold the lock until it decodes. Three packets.',
 keys:['Drag or scroll the dial','or ← → (Shift = fine)'],make(api){
  const pk=api.contacts();let t=0,f=2412,ft=0,hold=0,got=0,dec='',decT=0,water=[],kl=0,kr=0,shift=0,drag=null;const LO=2400,HI=2483.5,NEED=pk.length,TL=60;
  const nt=()=>{do{ft=LO+6+Math.random()*(HI-LO-12)}while(Math.abs(ft-f)<12)};nt();
  const str=()=>Math.exp(-Math.pow((f-ft)/1.6,2));
  return{update(dt){t+=dt;if(kl)f-=dt*(shift?3:22);if(kr)f+=dt*(shift?3:22);f=clamp(f,LO,HI);
      const row=new Float32Array(160);for(let i=0;i<160;i++){const fr=LO+(i/159)*(HI-LO);row[i]=Math.random()*.35+Math.exp(-Math.pow((fr-ft)/1.2,2))*(.55+Math.random()*.25)}water.unshift(row);if(water.length>70)water.pop();
      const s=str();if(s>.85){hold+=dt;if(hold>1.4){hold=0;dec=pk[got];decT=0;got++;api.sfx('ok');if(got>=NEED){setTimeout(()=>api.end(true,'Link established',`${NEED} packets decoded in ${t.toFixed(1)} s`,Math.round(t*10)/10,' s',true),900)}else nt()}}else hold=Math.max(0,hold-dt*1.5);
      decT+=dt;api.hud(`PACKETS ${got}/${NEED}`,`${Math.max(0,TL-t).toFixed(0)} s`);if(t>=TL&&got<NEED)api.end(false,'Signal lost',`${got}/${NEED} packets decoded`,null)},
    draw(g){g.fillStyle='#04060c';g.fillRect(0,0,LW,LH);const X0=40,X1=760,WY=30,WH=210;
      water.forEach((row,j)=>{for(let i=0;i<160;i++){const v=row[i];g.fillStyle=`hsla(${190-v*170},90%,${10+v*55}%,1)`;g.fillRect(X0+i*(X1-X0)/160,WY+j*3,(X1-X0)/160+.5,3)}});
      g.strokeStyle='rgba(255,255,255,.2)';g.strokeRect(X0,WY,X1-X0,WH);const fx=X0+(f-LO)/(HI-LO)*(X1-X0);g.strokeStyle='#ffcf4d';g.lineWidth=2;g.beginPath();g.moveTo(fx,WY);g.lineTo(fx,WY+WH);g.stroke();
      [2402,2412,2422,2432,2442,2452,2462,2472].forEach((c,k)=>{const x=X0+(c-LO)/(HI-LO)*(X1-X0);T(g,'CH'+(k*1+1),x,WY+WH+14,{s:9,a:'center',c:'#6c6e8a'})});
      // dial
      const cx=220,cy=430,R=120;g.strokeStyle='rgba(255,255,255,.2)';g.lineWidth=2;g.beginPath();g.arc(cx,cy,R,Math.PI,0);g.stroke();
      for(let k=0;k<=20;k++){const a=Math.PI+k/20*Math.PI;g.beginPath();g.moveTo(cx+Math.cos(a)*(R-8),cy+Math.sin(a)*(R-8));g.lineTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R);g.stroke()}
      const a=Math.PI+(f-LO)/(HI-LO)*Math.PI;g.strokeStyle='#ffcf4d';g.lineWidth=3;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(a)*(R-14),cy+Math.sin(a)*(R-14));g.stroke();
      T(g,f.toFixed(1)+' MHz',cx,cy-30,{s:22,w:800,f:F.disp,a:'center'});
      // strength
      const s=str();for(let k=0;k<10;k++){g.fillStyle=k/10<s?(s>.85?'#3fdc9c':api.color):'#1a1d33';g.fillRect(380+k*18,400-k*6,12,30+k*6)}T(g,'RSSI',380,446,{s:10,c:'#9aa0b8'});
      g.fillStyle='#1a1d33';g.fillRect(380,456,178,6);g.fillStyle='#3fdc9c';g.fillRect(380,456,178*clamp(hold/1.4,0,1),6);
      // decoded
      T(g,'DECODED',590,290,{s:10,c:'#9aa0b8'});for(let i=0;i<got;i++){const p=pk[i],txt=p.v;let show=txt;if(i===got-1&&decT<1){const n=Math.floor(decT*txt.length);show=txt.slice(0,n)+txt.slice(n).replace(/./g,()=>'#$%&01'[Math.random()*6|0])}
        T(g,p.k,590,318+i*44,{s:10,c:api.color});T(g,show,590,336+i*44,{s:13,w:700})}},
    key(k,down,e){shift=e&&e.shiftKey;if(k==='ArrowLeft'||k==='a')kl=down;if(k==='ArrowRight'||k==='d')kr=down},
    down(x,y){drag={x,f}},move(x,y,pressed){if(drag&&pressed)f=clamp(drag.f+(x-drag.x)*.12,LO,HI)},up(){drag=null},wheel(dy){f=clamp(f+dy*.02,LO,HI)}}}};

/* ---------- U8 USB-C: Packet Catch ---------- */
GAMES.resume={title:'Packet Catch',how:'The resume is coming down the USB-C lanes. Catch the data packets, dodge the noise bursts, and fill the transfer to 100%. The resume link stays open the whole time if you just want the PDF.',
 keys:['← → or A / D','or move the mouse'],make(api){
  const LANES=['D+','D−','TX','RX'],lx=i=>160+i*160;let t=0,pos=1.5,tgt=1.5,prog=0,items=[],spawn=0,hits=0,bad=0,flash=0,kl=0,kr=0;const TL=40;
  return{update(dt){t+=dt;if(kl)tgt-=dt*6;if(kr)tgt+=dt*6;tgt=clamp(tgt,0,3);pos+=(tgt-pos)*Math.min(1,dt*14);
      spawn-=dt;const sp=180+t*4;if(spawn<=0){spawn=.42-Math.min(.2,t*.006);items.push({l:Math.random()*4|0,y:-30,bad:Math.random()<.24+t*.004,hex:'0x'+(Math.random()*256|0).toString(16).toUpperCase().padStart(2,'0')})}
      const cx=lx(0)+pos*160;items.forEach(it=>{it.y+=sp*dt;if(!it.done&&it.y>410&&it.y<450&&Math.abs(lx(it.l)-cx)<60){it.done=1;if(it.bad){prog=Math.max(0,prog-.06);bad++;flash=.3;api.sfx('bad')}else{prog=Math.min(1,prog+.045);hits++;api.sfx('tick')}}});
      items=items.filter(it=>it.y<LH+30&&!it.done);flash=Math.max(0,flash-dt);
      api.hud(`TRANSFER ${Math.round(prog*100)}%`,`${Math.max(0,TL-t).toFixed(0)} s`);
      if(prog>=1)api.end(true,'resume.pdf received',`Transferred in ${t.toFixed(1)} s · ${hits} packets · ${bad} errors`,Math.round(t*10)/10,' s',true);else if(t>=TL)api.end(false,'Transfer timed out',`Reached ${Math.round(prog*100)}%. The PDF is still one click away.`,null)},
    draw(g){gridBg(g);LANES.forEach((n,i)=>{const x=lx(i);g.strokeStyle='rgba(255,255,255,.1)';g.setLineDash([4,8]);g.beginPath();g.moveTo(x,0);g.lineTo(x,LH);g.stroke();g.setLineDash([]);T(g,n,x,24,{s:12,w:700,a:'center',c:'#9aa0b8'})});
      items.forEach(it=>{const x=lx(it.l);if(it.bad){g.strokeStyle='#ff6b6f';g.lineWidth=2.5;g.beginPath();for(let k=0;k<=8;k++){const xx=x-40+k*10,yy=it.y+(k%2?-10:10);k?g.lineTo(xx,yy):g.moveTo(xx,yy)}g.stroke();T(g,'EMI',x,it.y-16,{s:10,a:'center',c:'#ff6b6f',w:700})}
        else{g.fillStyle='rgba(110,231,255,.15)';g.fillRect(x-38,it.y-14,76,28);g.strokeStyle='#6ee7ff';g.lineWidth=1.5;g.strokeRect(x-38,it.y-14,76,28);T(g,it.hex,x,it.y+5,{s:13,w:700,a:'center',c:'#6ee7ff'})}});
      const cx=lx(0)+pos*160;g.fillStyle='#c9ced8';rr(g,cx-56,430,112,22,11);g.fill();g.fillStyle='#05060b';rr(g,cx-40,436,80,10,5);g.fill();
      g.fillStyle='#1a1d33';g.fillRect(40,476,720,10);g.fillStyle=prog>=1?'#3fdc9c':'#6ee7ff';g.fillRect(40,476,720*prog,10);T(g,'resume.pdf',40,470,{s:10,c:'#9aa0b8'});
      if(flash>0){g.fillStyle=`rgba(255,107,111,${flash})`;g.fillRect(0,0,LW,LH)}},
    key(k,down){if(k==='ArrowLeft'||k==='a')kl=down;if(k==='ArrowRight'||k==='d')kr=down},
    move(x){tgt=clamp((x-lx(0))/160,0,3)},down(x){tgt=clamp((x-lx(0))/160,0,3)}}}};

/* ================= runtime ================= */
let cur=null,hooks=null,G=null,state='idle',raf=null,last=0,kbUsed=false,pressed=false,ended=false;
const pointerFine=matchMedia('(pointer: fine)').matches;
function bestKey(id){return 'lc-best-'+id}
function sizeGame(){const r=gcv.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);gcv.width=Math.round(r.width*d);gcv.height=Math.round(r.height*d);gx.setTransform(gcv.width/LW,0,0,gcv.height/LH,0,0)}
function cardsCount(){const n=window.LCCards?LCCards.owned():0,tot=window.LCCards?LCCards.total:24;$('#dCards').textContent=`${n}/${tot}`}
if(window.LCCards)LCCards.onChange(()=>{cardsCount();if(!root.hidden&&state!=='play'&&cur)intro(lastRes)});
let AC=null;function sfx(kind){try{if(store.get('lc-mute')==='1')return;AC=AC||new (window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();
  const m={ok:[880,1320,.12,'triangle'],bad:[180,90,.16,'square'],tick:[1200,900,.04,'triangle']}[kind]||[600,600,.05,'sine'];o.type=m[3];o.frequency.setValueAtTime(m[0],AC.currentTime);o.frequency.exponentialRampToValueAtTime(m[1],AC.currentTime+m[2]);
  g.gain.setValueAtTime(.05,AC.currentTime);g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+m[2]);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+m[2]+.02)}catch(e){}}

let lastRes=null;
function intro(res){lastRes=res||null;
  const def=GAMES[cur],c=CHIP[cur];$('#gTag').textContent=res?(res.win?'Chip verified':'Run complete'):`${c.u} · minigame`;$('#gTitle').textContent=res?res.head:def.title;
  $('#gHow').textContent=res?'':def.how;$('#gHow').hidden=!!res;
  $('#gKeys').innerHTML=res?'':def.keys.map(k=>`<li>${k}</li>`).join('');
  const R=$('#gRes');if(res){R.hidden=false;R.innerHTML=`<b>${res.win?'PASS':'FAIL'}</b><span>${res.detail}</span>`}else R.hidden=true;
  const B=$('#gBtns');B.innerHTML='';
  const btn=(label,cls,fn)=>{const b=document.createElement('button');b.type='button';b.className='db'+(cls?' '+cls:'');b.innerHTML=label;b.addEventListener('click',fn);B.appendChild(b);return b};
  let first;
  const np=window.LCCards?LCCards.pending():0;if(np)first=btn(np>1?`Open pack (${np}) →`:'Open your pack →','pri',e=>{e.currentTarget.remove();LCCards.setOnClose(()=>{if(!root.hidden&&state!=='play')intro(lastRes)});LCCards.openNext()});
  const play=btn(res?'Play again':'Play','pri',start);if(np)play.className='db';
  first=first||play;
  if(cur==='resume')btn('Open resume (PDF) ↗','',()=>window.open('assets/resume.pdf','_blank','noopener'));
  if(def.extra==='binder'&&window.LCCards)btn('Open binder','',()=>LCCards.binder());
  btn('Read section instead','',()=>hooks&&hooks.read(cur));
  const best=store.get(bestKey(cur));$('#gBest').textContent=(best?`Best: ${best} · `:'')+(cur==='play'?'I collect trading cards, so this board has a set of its own: 150 LC-2030 Die Cards (and a couple nobody has seen). Each win earns one pack.':'Each win earns one pack of LC-2030 Die Cards.');
  $('#dOvl').hidden=false;setTimeout(()=>first.focus({preventScroll:true}),50);
  drawIdle();
}
function drawIdle(){sizeGame();gridBg(gx);const c=CHIP[cur];T(gx,c.tag,LW/2,LH/2+20,{s:120,w:800,f:F.disp,a:'center',c:c.c+'14'})}
function start(){
  const def=GAMES[cur];ended=false;kbUsed=false;
  const api={color:CHIP[cur].c,pointerFine,kb:()=>kbUsed,sfx,
    hud:(l,r)=>{$('#dLab').textContent=`${CHIP[cur].u} · ${def.title} · ${l} · ${r}`},
    end:(win,head,detail,score,unit,lowerBetter)=>{if(ended)return;ended=true;state='done';
      if(win&&window.LCCards){const c=CHIP[cur];LCCards.grant(cur,`${c.u} · ${c.tag}`,c.c)}
      if(win&&score!=null){const k=bestKey(cur),prev=store.get(k);const pv=prev?parseFloat(prev):null;if(pv==null||(lowerBetter?score<pv:score>pv))store.set(k,score+(unit||''))}
      setTimeout(()=>intro({win,head,detail}),250)},
    roles:()=>hooks.roles(),stops:()=>hooks.stops(),contacts:()=>hooks.contacts()};
  G=def.make(api);state='play';$('#dOvl').hidden=true;sizeGame();last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);
}
function loop(now){if(state!=='play')return;const dt=Math.min(.05,(now-last)/1000);last=now;if(!document.hidden&&!(window.LCCards&&LCCards.isOpen())){G.update(dt);if(state==='play'||ended)G.draw(gx,now/1000)}raf=requestAnimationFrame(loop)}
function toLogical(e){const r=gcv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*LW,(e.clientY-r.top)/r.height*LH]}
gcv.addEventListener('pointerdown',e=>{if(state!=='play'||!G.down)return;pressed=true;gcv.setPointerCapture(e.pointerId);const [x,y]=toLogical(e);G.down(x,y);e.preventDefault()});
gcv.addEventListener('pointermove',e=>{const [x,y]=toLogical(e);$('#dCoord').textContent=`x ${(x/LW*2.4).toFixed(3)} mm · y ${(y/LH*1.5).toFixed(3)} mm · ${['M1','M2','POLY','DIFF'][(x/200|0)%4]}`;if(state==='play'&&G.move)G.move(x,y,pressed)});
gcv.addEventListener('pointerup',e=>{pressed=false;if(state==='play'&&G.up){const [x,y]=toLogical(e);G.up(x,y)}});
gcv.addEventListener('wheel',e=>{if(state==='play'&&G.wheel){G.wheel(e.deltaY);e.preventDefault()}},{passive:false});
const GAMEKEYS=new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Enter','Tab']);
function onKey(e,down){
  if(root.hidden)return;if(window.LCCards&&LCCards.isOpen())return;if(hooks&&hooks.panelOpen&&hooks.panelOpen())return;
  if(down&&e.key==='Escape'){e.preventDefault();e.stopPropagation();if(state==='play'){state='idle';cancelAnimationFrame(raf);intro()}else exit();return}
  if(state!=='play')return;if(/INPUT|TEXTAREA/.test((document.activeElement||{}).tagName||''))return;
  const k=e.key.length===1?e.key.toLowerCase():e.key;if(GAMEKEYS.has(e.key)||/^[a-z0-9]$/.test(k)){if(GAMEKEYS.has(e.key))e.preventDefault();e.stopPropagation();kbUsed=kbUsed||/^Arrow|Enter/.test(e.key);G.key&&G.key(k,down,e)}
}
addEventListener('keydown',e=>onKey(e,true),true);addEventListener('keyup',e=>onKey(e,false),true);
root.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a;if(a==='exit')exit();else if(a==='read')hooks&&hooks.read(cur);else if(a==='cards'&&window.LCCards)LCCards.binder()});
addEventListener('resize',()=>{if(root.hidden)return;bgCache=drawDie(cur);reveal=1;paintBg();if(state!=='play')drawIdle();else sizeGame()});

function open(id,h){
  cur=id;hooks=h;const c=CHIP[id];root.style.setProperty('--dc',c.c);
  $('#dPart').textContent=`LC-2030 · ${c.u} · ${c.tag}`;$('#dName').textContent=c.name;$('#dSec').textContent=c.sec;$('#dLab').textContent=`${c.u} · core region`;
  cardsCount();root.hidden=false;root.classList.remove('leaving');root.classList.add('entering');setTimeout(()=>root.classList.remove('entering'),1000);
  bgCache=drawDie(id);reveal=reduce()?1:0;paintBg();
  if(!reduce()){const t0=performance.now();(function f(n){reveal=Math.min(1,(n-t0)/900);paintBg();if(reveal<1)requestAnimationFrame(f)})(t0)}
  state='idle';intro();
}
function exit(){if(root.hidden)return;state='idle';cancelAnimationFrame(raf);root.classList.add('leaving');setTimeout(()=>{root.hidden=true;root.classList.remove('leaving');hooks&&hooks.exit&&hooks.exit()},reduce()?0:330)}
window.LCChips={open,exit,isOpen:()=>!root.hidden,CHIP,GAMES};
})();
