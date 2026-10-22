/* LC achievements: shared registry, storage and pop-up toasts. Include on any page. */
(function(){
'use strict';
if(window.LCAch)return;
const LIST=[
 {id:'connect4',  t:'Connect for Four', d:'Play Four in a Row four times in a row.'},
 {id:'arcade',    t:'Insert Coin',      d:'Play your first game in the LC Arcade.'},
 {id:'firstpack', t:'Fresh Pull',       d:'Tear open your first pack of Die Cards.'},
 {id:'secret',    t:'Off the Books',    d:'Pull one of the secret cards.'},
 {id:'lightspeed',t:'Lightspeed',       d:'Warp across the board from the terminal.'},
 {id:'decap',     t:'Decapper',         d:'Go inside all eight chips on the board.'},
 {id:'td10',      t:'Kernel Patched',   d:'Defeat the first boss in Silicon Siege.'},
 {id:'tdwin',     t:'Tape-Out',         d:'Survive all 40 waves of Silicon Siege.'},
 {id:'lp_weaver', t:'Exterminator',     d:'Defeat the Rot Weaver in Last Patch.'},
 {id:'lp_ripper', t:'Thread Safe',      d:'Defeat the Thread Ripper in Last Patch.'},
 {id:'golden',    t:'Look How Far You’ve Come', d:'Open the locked door at the back of the binder.'}
];
const BY=Object.fromEntries(LIST.map(a=>[a.id,a]));
let got={};try{got=JSON.parse(localStorage.getItem('lc-ach')||'{}')||{}}catch(e){}
const save=()=>{try{localStorage.setItem('lc-ach',JSON.stringify(got))}catch(e){}};
const subs=[];

/* pixel trophy */
const PIX=["................","..YYYYYYYYYYYY..","YYYLLYYYYYYYYDYY","Y.YLLYYYYYYYYD.Y","Y.YLYYYYYYYYYD.Y",".YYLYYYYYYYYYDY.","..YYYYYYYYYYYD..","...YYYYYYYYYD...","....DYYYYYYD....","......YYYD......","......YYD.......",".....YYYYD......","....BBBBBBBB....","....BLLBBBBB....","...BBBBBBBBBB...","................"];
function trophy(size,locked){const c=document.createElement('canvas');c.width=16;c.height=16;c.style.width=c.style.height=size+'px';c.style.imageRendering='pixelated';c.setAttribute('aria-hidden','true');
  const g=c.getContext('2d'),P=locked?{Y:'#5a5870',L:'#77758e',D:'#46445a',B:'#3a384c'}:{Y:'#ffc23e',L:'#fff3b0',D:'#b37a12',B:'#6b4a1e'};
  PIX.forEach((row,y)=>[...row].forEach((ch,x)=>{if(P[ch]){g.fillStyle=P[ch];g.fillRect(x,y,1,1)}}));return c}

/* toast */
const css=`#lcToasts{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none;max-width:calc(100vw - 32px)}
.lcToast{display:flex;align-items:center;gap:14px;width:340px;max-width:100%;padding:12px 16px 12px 12px;border-radius:6px;background:linear-gradient(180deg,#232a3d,#141826);
 border:1px solid #3a4560;box-shadow:0 10px 30px rgba(0,0,0,.55),0 0 0 1px rgba(255,194,62,.15) inset;color:#eef0ff;font-family:"Figtree",system-ui,sans-serif;
 transform:translateY(130%);opacity:0;transition:transform .45s cubic-bezier(.2,.9,.3,1.15),opacity .3s;pointer-events:auto}
.lcToast.in{transform:none;opacity:1}
.lcToast .ic{flex:none;width:56px;height:56px;display:grid;place-items:center;background:radial-gradient(circle,#3a3220,#1a1712);border:1px solid #5a4a24;border-radius:4px;box-shadow:0 0 18px rgba(255,194,62,.35)}
.lcToast .k{font:600 .66rem "JetBrains Mono",ui-monospace,monospace;letter-spacing:.12em;color:#ffc23e;text-transform:uppercase}
.lcToast b{display:block;font:700 1rem/1.25 "Figtree",system-ui,sans-serif;margin-top:2px}
.lcToast span{display:block;font-size:.82rem;color:#aab0c8;margin-top:2px}
@media (prefers-reduced-motion: reduce){.lcToast{transition:opacity .2s}}`;
function ensure(){if(document.getElementById('lcToasts'))return document.getElementById('lcToasts');const s=document.createElement('style');s.textContent=css;document.head.appendChild(s);
  const b=document.createElement('div');b.id='lcToasts';b.setAttribute('role','status');b.setAttribute('aria-live','polite');document.body.appendChild(b);return b}
let AC=null;function chime(){try{if(localStorage.getItem('lc-mute')==='1')return;AC=AC||new (window.AudioContext||window.webkitAudioContext)();const n=AC.currentTime;
  [[659,0],[988,.09],[1319,.18]].forEach(([f,d])=>{const o=AC.createOscillator(),g=AC.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(0,n+d);g.gain.linearRampToValueAtTime(.06,n+d+.02);g.gain.exponentialRampToValueAtTime(.0001,n+d+.45);o.connect(g);g.connect(AC.destination);o.start(n+d);o.stop(n+d+.5)})}catch(e){}}
function toast(a){const box=ensure();const el=document.createElement('div');el.className='lcToast';const ic=document.createElement('div');ic.className='ic';ic.appendChild(trophy(40,false));
  const tx=document.createElement('div');tx.innerHTML=`<div class="k">Achievement unlocked</div><b></b><span></span>`;tx.querySelector('b').textContent=a.t;tx.querySelector('span').textContent=a.d;
  el.appendChild(ic);el.appendChild(tx);box.appendChild(el);requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('in')));chime();
  setTimeout(()=>{el.classList.remove('in');setTimeout(()=>el.remove(),500)},5200)}
function unlock(id){const a=BY[id];if(!a||got[id])return false;got[id]=Date.now();save();const go=()=>toast(a);document.body?go():addEventListener('DOMContentLoaded',go);subs.forEach(f=>{try{f(id)}catch(e){}});return true}
window.LCAch={LIST,has:id=>!!got[id],when:id=>got[id]||null,unlock,count:()=>LIST.filter(a=>got[a.id]).length,total:LIST.length,trophy,onUnlock:f=>subs.push(f)};
})();
