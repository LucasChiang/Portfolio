/* Silicon Siege — game data + simulation (no DOM). Used by td.html and by the balance bot. */
(function(root){
'use strict';
const TILE=40,COLS=24,ROWS=15,W=COLS*TILE,H=ROWS*TILE,DT=1/60;

/* ---------- map ---------- */
const PATHS=[
  [[-1,2],[5,2],[5,7],[2,7],[2,12],[10,12],[10,4],[15,4],[15,10],[20,10],[20,3],[24,3]],
  [[17,15],[17,13],[23,13],[23,3],[24,3]]
].map(p=>p.map(([x,y])=>[x*TILE+TILE/2,y*TILE+TILE/2]));
function buildPath(pts){const seg=[];let L=0;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]);seg.push({a,b,l,s:L});L+=l}return{pts,seg,len:L}}
const PATH=PATHS.map(buildPath);
function posAt(p,d){const P=PATH[p];if(d<=0)return P.pts[0];for(const s of P.seg){if(d<=s.s+s.l){const f=(d-s.s)/s.l;return[s.a[0]+(s.b[0]-s.a[0])*f,s.a[1]+(s.b[1]-s.a[1])*f]}}return P.pts[P.pts.length-1]}
const pathTiles=new Set();
PATHS.forEach(pts=>{for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/8);for(let k=0;k<=n;k++){const x=a[0]+(b[0]-a[0])*k/n,y=a[1]+(b[1]-a[1])*k/n;pathTiles.add(Math.floor(x/TILE)+','+Math.floor(y/TILE))}}});
const CORE=[23,3];
function buildable(tx,ty){return tx>=0&&ty>=0&&tx<COLS&&ty<ROWS&&!pathTiles.has(tx+','+ty)&&!(tx===CORE[0]&&ty===CORE[1])&&!(tx>=22&&ty>=2&&ty<=4)}

/* ---------- towers: 13 families × 8 marks = 104 types ---------- */
const MARKS=['','Twin','Heavy','Overclocked','Hyper','Quantum','Singularity','Omega'];
const MARK_WAVE=[1,3,7,11,16,21,27,33];
const ROMAN=['I','II','III','IV','V','VI','VII','VIII'];
const FAM=[
 {k:'gun',    n:'Autogun',       col:'#ffc23e',type:'kinetic', r:2.6,rate:4,   dmg:6,  air:1,cost:60, beh:'bullet', d:'Fast kinetic rounds. Cheap and reliable.',
  sp:[['Tracer Rounds','Sees stealth enemies.',t=>{t.detect=1}],['AP Rounds','Ignores half of armor.',t=>{t.pierceArmor=.5}],['Ricochet','Each round bounces to a second enemy.',t=>{t.bounce=1}],['Overdrive','Doubles fire rate.',t=>{t.rate*=2}]]},
 {k:'rail',   n:'Railgun',       col:'#e8f0ff',type:'kinetic', r:4.5,rate:.6,  dmg:55, air:0,cost:140,beh:'rail',   d:'Hypersonic slug that pierces every enemy in a line.',
  sp:[['Capacitor Bank','+50% damage to armored targets.',t=>{t.vsArmor=1.5}],['Coil Focus','+1.5 range.',t=>{t.r+=1.5}],['Hypervelocity','Ignores armor and hits air.',t=>{t.pierceArmor=1;t.air=1}],['Overload','Every 4th shot deals 5×.',t=>{t.everyN=4;t.everyMult=5}]]},
 {k:'laser',  n:'Beam Laser',    col:'#ff4fb3',type:'energy',  r:3,  rate:20,  dmg:.9, air:1,cost:110,beh:'beam',   d:'Continuous beam that heats up the longer it holds a target.',
  sp:[['Focus Lens','Heats up twice as fast.',t=>{t.rampRate=2}],['Prism','Splits into a second beam.',t=>{t.beams=2}],['Thermal Burn','Leaves targets burning.',t=>{t.burn=(t.burn||0)+t.dmg*6}],['Solar Lance','3× vs shields and sees stealth.',t=>{t.vsShield=3;t.detect=1}]]},
 {k:'pulse',  n:'Pulse Laser',   col:'#ff7ad9',type:'energy',  r:3.2,rate:1.5, dmg:20, air:1,cost:90, beh:'pulse',  d:'Fires a burst that hits several targets at once.',
  sp:[['Split Emitter','+1 target.',t=>{t.targets+=1}],['Wide Array','+1 target.',t=>{t.targets+=1}],['Shield Breaker','3× damage to shields.',t=>{t.vsShield=3}],['Strobe','Stuns targets briefly.',t=>{t.stun=.25}]]},
 {k:'tesla',  n:'Tesla Coil',    col:'#9fd6ff',type:'electric',r:2.4,rate:1,   dmg:22, air:1,cost:120,beh:'chain',  d:'Arcs lightning that jumps between enemies.',
  sp:[['Extra Arc','+1 chain jump.',t=>{t.chain+=1}],['Branching','+1 chain jump.',t=>{t.chain+=1}],['Overcharge','Arcs stun briefly.',t=>{t.stun=.3}],['Storm','+3 jumps and +50% damage.',t=>{t.chain+=3;t.dmg*=1.5}]]},
 {k:'missile',n:'Missile Pod',   col:'#ff8a3e',type:'explosive',r:4, rate:.8,  dmg:30, air:1,cost:150,beh:'missile',d:'Homing missiles with a small blast.',
  sp:[['Bigger Warhead','+50% blast radius.',t=>{t.splash*=1.5}],['Cluster','Fires 3 missiles.',t=>{t.salvo=3}],['Seeker','+1.5 range.',t=>{t.r+=1.5}],['Tactical Nuke','Every 6th missile is a nuke.',t=>{t.everyN=6;t.everyMult=6;t.nuke=1}]]},
 {k:'mortar', n:'Mortar',        col:'#c9a26b',type:'explosive',r:5, rate:.45, dmg:45, air:0,cost:130,beh:'mortar', d:'Long-range lobbed shells. Ground targets only.',
  sp:[['Wide Shells','+50% blast radius.',t=>{t.splash*=1.5}],['Napalm','Shells leave targets burning.',t=>{t.burn=(t.burn||0)+t.dmg*.6}],['Shell Shock','Blasts stun.',t=>{t.stun=.4}],['Barrage','Fires 3 shells at once.',t=>{t.salvo=3}]]},
 {k:'flame',  n:'Flamethrower',  col:'#ff5b3e',type:'thermal', r:1.9,rate:8,   dmg:2,  air:0,cost:100,beh:'flame',  d:'Short-range cone that sets everything alight.',
  sp:[['Hotter Fuel','+100% burn.',t=>{t.burn*=2}],['Long Nozzle','+0.6 range.',t=>{t.r+=.6}],['Blue Flame','Ignores armor.',t=>{t.pierceArmor=1}],['Inferno','Wider cone and burn spreads.',t=>{t.cone=1.3;t.burn*=1.5}]]},
 {k:'cryo',   n:'Cryo Projector',col:'#7fe8ff',type:'cryo',    r:2.5,rate:1.2, dmg:4,  air:1,cost:90, beh:'cryo',   d:'Chills enemies to slow them down.',
  sp:[['Deeper Chill','+15% slow.',t=>{t.slow+=.15}],['Shatter','Chilled enemies take +30% damage.',t=>{t.vuln=.3}],['Deep Freeze','Every 4th shot freezes solid.',t=>{t.everyN=4;t.freeze=1}],['Absolute Zero','Slows everything in range.',t=>{t.aura=1}]]},
 {k:'plasma', n:'Plasma Cannon', col:'#46f08f',type:'energy',  r:3.4,rate:.7,  dmg:50, air:0,cost:200,beh:'plasma', d:'Heavy energy bolts with a wide splash.',
  sp:[['Wider Bolt','+50% splash.',t=>{t.splash*=1.5}],['Ionize','Strips shields and hits air.',t=>{t.vsShield=2.5;t.air=1}],['Overheat','+60% damage.',t=>{t.dmg*=1.6}],['Supernova','Every 4th bolt is massive.',t=>{t.everyN=4;t.everyMult=4;t.nuke=1}]]},
 {k:'emp',    n:'EMP Array',     col:'#a98bff',type:'electric',r:2.2,rate:.35, dmg:15, air:1,cost:170,beh:'emp',    d:'Pulses that stun everything nearby and strip shields.',
  sp:[['Shield Shred','Strips 3× more shield.',t=>{t.strip*=3}],['Longer Stun','+0.4s stun.',t=>{t.stun+=.4}],['Blackout','Reveals stealth for all towers.',t=>{t.reveal=1;t.detect=1}],['Cascade','Doubles pulse rate.',t=>{t.rate*=2}]]},
 {k:'sniper', n:'Sniper Array',  col:'#f0f0f0',type:'kinetic', r:7,  rate:.45, dmg:90, air:1,cost:160,beh:'sniper', d:'Very long range with critical hits. Sees stealth.',
  sp:[['Steady Aim','+15% crit chance.',t=>{t.crit+=.15}],['Hollow Point','Crits deal 5× instead of 3×.',t=>{t.critMult=5}],['Spotter','Reveals stealth for nearby towers.',t=>{t.reveal=1}],['Execute','Instantly removes non-boss enemies under 15% HP.',t=>{t.execute=.15}]]},
 {k:'grav',   n:'Gravity Well',  col:'#d6c3ff',type:'void',    r:2.6,rate:.5,  dmg:25, air:1,cost:220,beh:'grav',   d:'Warps space: slows, drags and crushes. Ignores armor and shields.',
  sp:[['Denser Core','+20% slow.',t=>{t.slow+=.2}],['Event Horizon','Drags enemies backward.',t=>{t.pull=.6}],['Spaghettify','2× damage to bosses.',t=>{t.vsBoss=2}],['Collapse','+1 range and +100% damage.',t=>{t.r+=1;t.dmg*=2}]]}
];
const FBY=Object.fromEntries(FAM.map(f=>[f.k,f]));
const TYPES=[];FAM.forEach(f=>{for(let m=0;m<8;m++)TYPES.push({id:f.k+m,f:f.k,m,name:(MARKS[m]?MARKS[m]+' ':'')+f.n,mk:'Mk '+ROMAN[m],cost:Math.round(f.cost*Math.pow(1.85,m)/5)*5,unlock:MARK_WAVE[m]})});
const TBY=Object.fromEntries(TYPES.map(t=>[t.id,t]));
const BRANCH=['Power','Tempo','Special'];
const TEMPO=[['Quick Cycle','+20% fire rate.',t=>{t.rate*=1.2}],['Extended Optics','+0.5 range.',t=>{t.r+=.5}],['Overclock','+25% fire rate.',t=>{t.rate*=1.25}],['Phase Array','+0.8 range, +20% fire rate.',t=>{t.r+=.8;t.rate*=1.2}]];
const POWER=[['Hardened Core','+35% damage.',t=>{t.dmg*=1.35}],['Dense Payload','+35% damage.',t=>{t.dmg*=1.35}],['Resonance','+40% damage.',t=>{t.dmg*=1.4}],['Peak Output','+60% damage.',t=>{t.dmg*=1.6}]];
const NODE_COST=[.55,1,1.7,2.9];
function node(type,b,i){const f=FBY[TBY[type].f];const L=b===0?POWER:b===1?TEMPO:f.sp;return{name:L[i][0],desc:L[i][1],apply:L[i][2],cost:Math.round(TBY[type].cost*NODE_COST[i]/5)*5}}
function computeStats(tw){const T=TBY[tw.type],f=FBY[T.f],m=T.m;
  const s={r:f.r+.15*m,rate:f.rate*(1+.08*m),dmg:f.dmg*Math.pow(1.72,m),air:f.air||(m>=4&&(f.k==='plasma'||f.k==='mortar'))?1:0,detect:m>=5?1:0,type:f.type,
    splash:{missile:.9,mortar:1.3,cryo:.7,plasma:1}[f.k]||0,chain:f.k==='tesla'?3+(m>>1):0,targets:f.k==='pulse'?3+(m>>2):1,burn:f.k==='flame'?6*Math.pow(1.72,m):0,
    slow:f.k==='cryo'?.35:f.k==='grav'?.25:0,stun:f.k==='emp'?.4:0,strip:f.k==='emp'?30*Math.pow(1.72,m):0,crit:f.k==='sniper'?.25:0,critMult:3,pierceArmor:0,
    vsShield:1,vsArmor:1,vsBoss:1,salvo:1,everyN:0,everyMult:1,cone:.55,beams:1,rampRate:1,bounce:0,vuln:0,execute:0,reveal:0,pull:0,aura:0,freeze:0,nuke:0};
  [POWER,TEMPO,f.sp].forEach((L,b)=>{for(let i=0;i<(tw.sk[b]||0);i++)L[i][2](s)});return s}

/* ---------- enemies ---------- */
const EN={
 bit:      {n:'Bit',hp:18,spd:2.3,rw:3,col:'#46f08f',sz:7},
 byte:     {n:'Byte',hp:42,spd:1.55,rw:5,col:'#3ee8ff',sz:9},
 packet:   {n:'Packet',hp:85,spd:1.15,armor:.35,rw:8,col:'#a98bff',sz:11},
 swarm:    {n:'Swarm',hp:9,spd:2.7,rw:1,col:'#ffc23e',sz:5},
 drone:    {n:'Drone',hp:38,spd:1.9,air:1,rw:7,col:'#ff4fb3',sz:9},
 worm:     {n:'Worm',hp:60,spd:1.35,split:'bit',rw:7,col:'#8bff6a',sz:10},
 trojan:   {n:'Trojan',hp:58,spd:1.6,stealth:1,rw:9,col:'#b8bcd8',sz:9},
 firewall: {n:'Firewall',hp:70,shield:90,spd:1.2,rw:11,col:'#ff8a3e',sz:11},
 patch:    {n:'Patch',hp:75,spd:1.3,heal:.05,rw:10,col:'#f0f0ff',sz:10},
 mainframe:{n:'Mainframe',hp:650,armor:.5,spd:.6,rw:40,col:'#5b8cff',sz:17,leak:3},
 spike:    {n:'Spike',hp:34,spd:3.5,rw:6,col:'#ff5b6b',sz:7},
 kernel:   {n:'Kernel Panic',hp:4600,armor:.3,spd:.5,rw:450,col:'#ff5b6b',sz:24,leak:10,boss:1,spawn:['bit',3,3.5]},
 bluescreen:{n:'Blue Screen',hp:14000,shield:8000,spd:.45,rw:1000,col:'#3b6cff',sz:26,leak:10,boss:1,spawn:['drone',2,4]},
 zeroday:  {n:'Zero-Day',hp:52000,armor:.45,stealth:1,spd:.5,rw:2000,col:'#d0d0e0',sz:26,leak:12,boss:1,spawn:['trojan',2,3.5]},
 lastbug:  {n:'The Last Bug',hp:220000,shield:75000,armor:.4,heal:.003,spd:.36,rw:0,col:'#ffc23e',sz:32,leak:99,boss:1,spawn:['spike',4,3]}
};
const WAVES=40;
function hpScale(w){return Math.pow(1.118,Math.min(w,30)-1)*Math.pow(1.095,Math.max(0,w-30))}
function waveSpec(w){const g=[];const add=(t,n,iv,delay)=>{if(n>0)g.push({t,n,iv,delay:delay||0})};
  const base=Math.round(6+w*1.4);
  add(w<4?'bit':'byte',base,Math.max(.3,.85-w*.013));
  if(w>=2)add('bit',Math.round(w*1.1),.36,3);
  if(w>=4)add('packet',Math.round(w/2),1.05,5);
  if(w>=5&&w%3===2)add('swarm',10+w,.12,7);
  if(w>=6)add('drone',Math.round((w-4)/1.4),.85,4);
  if(w>=7&&w%2)add('worm',Math.round(w/3),.95,6);
  if(w>=9)add('trojan',Math.round((w-6)/1.8),.85,8);
  if(w>=12)add('firewall',Math.round((w-9)/1.8),.95,3);
  if(w>=14)add('patch',Math.round((w-12)/4)+1,2,6);
  if(w>=16&&w%2===0)add('mainframe',Math.round((w-12)/4),2.6,9);
  if(w>=18)add('spike',Math.round(w/1.8),.38,10);
  if(w===10)add('kernel',1,1,12);if(w===20)add('bluescreen',1,1,12);if(w===30)add('zeroday',1,1,12);
  if(w===40){add('lastbug',1,1,14);add('mainframe',3,4,24)}
  g.forEach((x,i)=>{x.path=w>=21&&i%3===1?1:0});return g}

/* ---------- simulation ---------- */
function newGame(){return{t:0,wave:0,credits:300,lives:30,maxLives:30,towers:[],en:[],proj:[],fx:[],spawns:[],nextIn:20,state:'build',won:false,lost:false,kills:0,uid:1,speed:1,events:[]}}
function canBuild(G,type,tx,ty){const T=TBY[type];return T&&buildable(tx,ty)&&!G.towers.some(t=>t.tx===tx&&t.ty===ty)&&G.wave+1>=T.unlock&&G.credits>=T.cost}
function build(G,type,tx,ty){if(!canBuild(G,type,tx,ty))return null;const T=TBY[type];G.credits-=T.cost;const tw={id:G.uid++,type,tx,ty,x:tx*TILE+TILE/2,y:ty*TILE+TILE/2,sk:[0,0,0],spent:T.cost,cd:0,ang:-Math.PI/2,shots:0,beamT:null,ramp:1,mode:0,kills:0};tw.s=computeStats(tw);G.towers.push(tw);G.events.push({e:'build',tw});return tw}
function upgrade(G,tw,b){const i=tw.sk[b];if(i>=4)return false;const nd=node(tw.type,b,i);if(G.credits<nd.cost)return false;G.credits-=nd.cost;tw.spent+=nd.cost;tw.sk[b]++;tw.s=computeStats(tw);G.events.push({e:'upgrade',tw,b});return true}
function sell(G,tw){G.credits+=Math.round(tw.spent*.7);G.towers=G.towers.filter(t=>t!==tw);G.events.push({e:'sell',tw})}
function startWave(G){if(G.wave>=WAVES||G.spawns.length)return false;const early=G.state==='build'&&G.wave>0?Math.round(G.nextIn*2):0;G.wave++;G.credits+=Math.round(35+G.wave*11)+early;
  waveSpec(G.wave).forEach(s=>G.spawns.push({t:s.t,n:s.n,iv:s.iv,cd:s.delay,path:s.path}));G.state='wave';G.events.push({e:'wave',w:G.wave});return true}
function spawn(G,t,path,d){const E=EN[t],sc=E.boss?1:hpScale(G.wave);const e={id:G.uid++,t,path,d:d||0,hp:E.hp*sc,max:E.hp*sc,shield:(E.shield||0)*(E.boss?1:sc),maxShield:(E.shield||0)*(E.boss?1:sc),armor:E.armor||0,spd:E.spd*TILE,air:!!E.air,stealth:!!E.stealth,boss:!!E.boss,
  slow:0,slowT:0,stunT:0,burn:0,burnT:0,vuln:0,vulnT:0,rev:0,x:0,y:0,spT:E.spawn?E.spawn[2]:0,dead:false,hitT:0};const p=posAt(path,e.d);e.x=p[0];e.y=p[1];G.en.push(e);return e}
function visible(e,tw,G){return !e.stealth||tw.s.detect||e.rev>0}
function inRange(tw,e,r){const dx=e.x-tw.x,dy=e.y-tw.y;return dx*dx+dy*dy<=r*r}
function pickTarget(G,tw,r,excl){let best=null,bv=-Infinity;const R=r*TILE;for(const e of G.en){if(e.dead||(e.air&&!tw.s.air)||!visible(e,tw,G)||!inRange(tw,e,R)||(excl&&excl.has(e)))continue;
  const v=tw.mode===1?e.hp+e.shield:tw.mode===2?-e.d:e.d+(PATH[e.path].len-PATH[0].len);if(v>bv){bv=v;best=e}}return best}
function damage(G,e,amt,type,tw,o){if(e.dead||amt<=0)return;o=o||{};let a=amt*(1+(e.vulnT>0?e.vuln:0))*(e.boss&&tw?tw.s.vsBoss:1);
  if(tw&&tw.s.everyMultActive)a*=tw.s.everyMultActive;
  if(type!=='void'&&e.shield>0){const vs=(tw?tw.s.vsShield:1)*(type==='energy'?2:type==='electric'?1.5:.6);const sd=a*vs;if(sd<=e.shield){e.shield-=sd;e.hitT=.08;return}a=(sd-e.shield)/vs;e.shield=0}
  if(type!=='void'&&e.armor>0){const pierce=tw?tw.s.pierceArmor:0;let arm=e.armor*(1-pierce);if(type==='energy')arm*=.5;if(type==='thermal'||type==='cryo')arm*=.5;a*=(1-arm);if(tw&&tw.s.vsArmor>1)a*=tw.s.vsArmor}
  e.hp-=a;e.hitT=.08;if(tw&&tw.s.execute&&!e.boss&&e.hp>0&&e.hp<e.max*tw.s.execute)e.hp=0;
  if(e.hp<=0)kill(G,e,tw)}
function kill(G,e,tw){if(e.dead)return;e.dead=true;const E=EN[e.t];G.credits+=Math.round(E.rw*(1+.07*G.wave));G.kills++;if(tw)tw.kills++;G.fx.push({k:'pop',x:e.x,y:e.y,col:E.col,t:0,sz:E.sz});
  if(E.split)for(let i=0;i<2;i++){const c=spawn(G,E.split,e.path,Math.max(0,e.d-6-i*10));c.hp*=.6;c.max*=.6}
  if(e.boss){G.events.push({e:'boss',t:e.t,w:G.wave});G.fx.push({k:'boom',x:e.x,y:e.y,r:3*TILE,t:0,col:E.col})}}
function status(e,tw){const s=tw.s;if(s.slow>0){e.slow=Math.max(e.slow,Math.min(.8,s.slow)*(e.boss?.5:1));e.slowT=1.5}if(s.stun>0){e.stunT=Math.max(e.stunT,s.stun*(e.boss?.2:1))}
  if(s.burn>0){e.burn=Math.max(e.burn,s.burn);e.burnT=2}if(s.vuln>0&&s.slow>0){e.vuln=s.vuln;e.vulnT=1.6}}
function splash(G,x,y,r,amt,type,tw,groundOnly,stat){const R=r*TILE;for(const e of G.en){if(e.dead||(groundOnly&&e.air))continue;const dx=e.x-x,dy=e.y-y;if(dx*dx+dy*dy<=R*R){damage(G,e,amt,type,tw);if(stat)status(e,tw)}}}
function fire(G,tw){const s=tw.s,f=TBY[tw.type].f;let tg=pickTarget(G,tw,s.r);
  if(f==='emp'||f==='grav'){if(!G.en.some(e=>!e.dead&&inRange(tw,e,s.r*TILE)&&(!e.air||s.air)))return false}else if(!tg)return false;
  tw.shots++;s.everyMultActive=s.everyN&&tw.shots%s.everyN===0?s.everyMult:0;const big=!!s.everyMultActive;
  if(tg)tw.ang=Math.atan2(tg.y-tw.y,tg.x-tw.x);
  switch(f){
   case 'gun':G.proj.push({k:'bullet',x:tw.x,y:tw.y,tg,spd:14*TILE,dmg:s.dmg,type:s.type,tw,bounce:s.bounce});break;
   case 'rail':{const ang=tw.ang,L=s.r*TILE,x2=tw.x+Math.cos(ang)*L,y2=tw.y+Math.sin(ang)*L;for(const e of G.en){if(e.dead||(e.air&&!s.air))continue;const t=((e.x-tw.x)*Math.cos(ang)+(e.y-tw.y)*Math.sin(ang));if(t<0||t>L)continue;const px=tw.x+Math.cos(ang)*t,py=tw.y+Math.sin(ang)*t;if(Math.hypot(e.x-px,e.y-py)<.45*TILE)damage(G,e,s.dmg,s.type,tw)}
     G.fx.push({k:'rail',x:tw.x,y:tw.y,x2,y2,t:0,big});break}
   case 'pulse':{const hit=new Set();let n=s.targets;let c=tg;while(c&&n-->0){hit.add(c);damage(G,c,s.dmg,s.type,tw);if(s.stun)status(c,tw);G.fx.push({k:'zap',x:tw.x,y:tw.y,x2:c.x,y2:c.y,t:0,col:'#ff7ad9'});c=pickTarget(G,tw,s.r,hit)}break}
   case 'chain':{const hit=new Set();let c=tg,px=tw.x,py=tw.y,d=s.dmg;for(let i=0;i<=s.chain&&c;i++){hit.add(c);damage(G,c,d,s.type,tw);if(s.stun)status(c,tw);G.fx.push({k:'arc',x:px,y:py,x2:c.x,y2:c.y,t:0});px=c.x;py=c.y;d*=.85;
       let nb=null,nd=1.8*TILE;for(const e of G.en){if(e.dead||hit.has(e)||(e.air&&!s.air)||!visible(e,tw,G))continue;const dd=Math.hypot(e.x-px,e.y-py);if(dd<nd){nd=dd;nb=e}}c=nb}break}
   case 'missile':for(let i=0;i<s.salvo;i++)G.proj.push({k:'missile',x:tw.x,y:tw.y,tg,spd:7*TILE,dmg:s.dmg*(s.salvo>1?.6:1),type:s.type,tw,splash:s.splash*(big&&s.nuke?2.5:1),big,ang:tw.ang+(i-1)*.5,life:4});break;
   case 'mortar':for(let i=0;i<s.salvo;i++){const lead=tg.spd*(1-tg.slow)*1.1,p=posAt(tg.path,tg.d+lead+(i-1)*18);G.proj.push({k:'shell',x:tw.x,y:tw.y,sx:tw.x,sy:tw.y,tx:p[0],ty:p[1],t:0,dur:1.1,dmg:s.dmg,type:s.type,tw,splash:s.splash})}break;
   case 'flame':{const R=s.r*TILE;for(const e of G.en){if(e.dead||e.air||!visible(e,tw,G))continue;const dx=e.x-tw.x,dy=e.y-tw.y,d=Math.hypot(dx,dy);if(d>R)continue;let da=Math.atan2(dy,dx)-tw.ang;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;if(Math.abs(da)<s.cone){damage(G,e,s.dmg,s.type,tw);status(e,tw)}}
     G.fx.push({k:'flame',x:tw.x,y:tw.y,ang:tw.ang,r:R,cone:s.cone,t:0});break}
   case 'cryo':G.proj.push({k:'ice',x:tw.x,y:tw.y,tg,spd:9*TILE,dmg:s.dmg,type:s.type,tw,splash:s.splash,freeze:big&&s.freeze});
     if(s.aura){for(const e of G.en)if(!e.dead&&inRange(tw,e,s.r*TILE)&&(!e.air||s.air))status(e,tw)}break;
   case 'plasma':G.proj.push({k:'plasma',x:tw.x,y:tw.y,tg,spd:5.5*TILE,dmg:s.dmg,type:s.type,tw,splash:s.splash*(big&&s.nuke?2:1),big});break;
   case 'emp':{const R=s.r*TILE;for(const e of G.en){if(e.dead||(e.air&&!s.air)||!inRange(tw,e,R))continue;damage(G,e,s.dmg,s.type,tw);e.shield=Math.max(0,e.shield-s.strip);status(e,tw)}G.fx.push({k:'ring',x:tw.x,y:tw.y,r:R,t:0,col:'#a98bff'});break}
   case 'sniper':{let d=s.dmg;const cr=Math.random()<s.crit;if(cr)d*=s.critMult;damage(G,tg,d,s.type,tw);G.fx.push({k:'snipe',x:tw.x,y:tw.y,x2:tg.x,y2:tg.y,t:0,crit:cr});break}
   case 'grav':{const R=s.r*TILE;for(const e of G.en){if(e.dead||(e.air&&!s.air)||!inRange(tw,e,R))continue;damage(G,e,s.dmg,'void',tw);status(e,tw);if(s.pull&&!e.boss)e.d=Math.max(0,e.d-s.pull*TILE)}G.fx.push({k:'grav',x:tw.x,y:tw.y,r:R,t:0});break}
  }
  s.everyMultActive=0;return true}
function step(G){if(G.won||G.lost)return;const dt=DT;G.t+=dt;
  // reveal
  for(const e of G.en)e.rev=Math.max(0,e.rev-dt);
  for(const tw of G.towers)if(tw.s.reveal){const R=(tw.s.r+(TBY[tw.type].f==='sniper'?0:1))*TILE;for(const e of G.en)if(e.stealth&&inRange(tw,e,R))e.rev=.3}
  // spawns
  for(const s of G.spawns){s.cd-=dt;if(s.cd<=0&&s.n>0){spawn(G,s.t,s.path);s.n--;s.cd=s.iv}}
  G.spawns=G.spawns.filter(s=>s.n>0);
  // enemies
  for(const e of G.en){if(e.dead)continue;const E=EN[e.t];e.hitT=Math.max(0,e.hitT-dt);
    if(e.burnT>0){e.burnT-=dt;damage(G,e,e.burn*dt,'thermal',null);if(e.dead)continue}
    if(E.heal){e.hp=Math.min(e.max,e.hp+e.max*E.heal*dt);if(e.t==='patch')for(const o of G.en)if(!o.dead&&o!==e&&Math.hypot(o.x-e.x,o.y-e.y)<1.5*TILE)o.hp=Math.min(o.max,o.hp+o.max*.03*dt)}
    if(E.spawn){e.spT-=dt;if(e.spT<=0){e.spT=E.spawn[2];for(let i=0;i<E.spawn[1];i++)spawn(G,E.spawn[0],e.path,Math.max(0,e.d-10-i*12))}}
    e.slowT-=dt;if(e.slowT<=0)e.slow=0;e.vulnT-=dt;
    if(e.stunT>0){e.stunT-=dt}else{e.d+=e.spd*(1-e.slow)*dt}
    const p=posAt(e.path,e.d);e.x=p[0];e.y=p[1];
    if(e.d>=PATH[e.path].len){e.dead=true;G.lives-=E.leak||1;G.fx.push({k:'leak',x:e.x,y:e.y,t:0});G.events.push({e:'leak'});if(G.lives<=0){G.lives=0;G.lost=true;G.state='lost';G.events.push({e:'lost'});return}}}
  // towers
  for(const tw of G.towers){const s=tw.s,f=TBY[tw.type].f;
    if(f==='laser'){const tgts=[];const ex=new Set();for(let i=0;i<s.beams;i++){const t=pickTarget(G,tw,s.r,ex);if(t){tgts.push(t);ex.add(t)}}
      if(!tgts.length){tw.ramp=1;tw.beam=null;continue}if(tw.beamT!==tgts[0])tw.ramp=1;tw.beamT=tgts[0];tw.ramp=Math.min(3.5,tw.ramp+dt*.8*s.rampRate);tw.ang=Math.atan2(tgts[0].y-tw.y,tgts[0].x-tw.x);
      tw.beam=tgts.map(t=>[t.x,t.y]);for(const t of tgts){damage(G,t,s.dmg*s.rate*tw.ramp*dt,s.type,tw);if(s.burn)status(t,tw)}continue}
    tw.cd-=dt;if(tw.cd<=0){if(fire(G,tw))tw.cd=1/s.rate;else tw.cd=.05}}
  // projectiles
  for(const p of G.proj){if(p.k==='shell'){p.t+=dt;if(p.t>=p.dur){p.done=1;splash(G,p.tx,p.ty,p.splash,p.dmg,p.type,p.tw,true,true);G.fx.push({k:'boom',x:p.tx,y:p.ty,r:p.splash*TILE,t:0,col:'#ffb35b'})}continue}
    let tg=p.tg;if(!tg||tg.dead){if(p.k==='missile'){tg=p.tg=pickTarget(G,p.tw,p.tw.s.r+2)}if(!tg||tg.dead){if(p.k!=='missile'){p.done=1;continue}}}
    if(p.k==='missile'){p.life-=dt;if(p.life<=0){p.done=1;continue}if(tg){const want=Math.atan2(tg.y-p.y,tg.x-p.x);let da=want-p.ang;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;p.ang+=Math.max(-6*dt,Math.min(6*dt,da))}p.x+=Math.cos(p.ang)*p.spd*dt;p.y+=Math.sin(p.ang)*p.spd*dt;
      if(tg&&Math.hypot(tg.x-p.x,tg.y-p.y)<12){p.done=1;const m=p.big&&p.tw.s.nuke?p.tw.s.everyMult:1;splash(G,p.x,p.y,p.splash,p.dmg*m,p.type,p.tw,false,false);G.fx.push({k:'boom',x:p.x,y:p.y,r:p.splash*TILE,t:0,col:p.big?'#fff3b0':'#ff8a3e'})}continue}
    const dx=tg.x-p.x,dy=tg.y-p.y,d=Math.hypot(dx,dy),st=p.spd*dt;if(d<=st+6){p.done=1;
      if(p.k==='bullet'){damage(G,tg,p.dmg,p.type,p.tw);if(p.bounce>0){const nb=pickTarget(G,p.tw,p.tw.s.r,new Set([tg]));if(nb)G.proj.push({k:'bullet',x:tg.x,y:tg.y,tg:nb,spd:p.spd,dmg:p.dmg*.8,type:p.type,tw:p.tw,bounce:p.bounce-1})}}
      else if(p.k==='ice'){splash(G,tg.x,tg.y,p.splash,p.dmg,p.type,p.tw,false,true);if(p.freeze){tg.stunT=Math.max(tg.stunT,tg.boss?.25:1)}G.fx.push({k:'frost',x:tg.x,y:tg.y,r:p.splash*TILE,t:0})}
      else if(p.k==='plasma'){const m=p.big&&p.tw.s.nuke?p.tw.s.everyMult:1;splash(G,tg.x,tg.y,p.splash,p.dmg*m,p.type,p.tw,!p.tw.s.air,false);G.fx.push({k:'boom',x:tg.x,y:tg.y,r:p.splash*TILE,t:0,col:p.big?'#eafff0':'#46f08f'})}}
    else{p.x+=dx/d*st;p.y+=dy/d*st}}
  G.proj=G.proj.filter(p=>!p.done);G.en=G.en.filter(e=>!e.dead);
  G.fx.forEach(f=>f.t+=dt);G.fx=G.fx.filter(f=>f.t<(f.k==='pop'?.4:f.k==='boom'?.5:f.k==='grav'?.6:.25));
  // wave flow
  if(G.state==='wave'&&!G.spawns.length){if(G.wave>=WAVES){if(!G.en.length){G.won=true;G.state='won';G.events.push({e:'won'})}}else{G.state='build';G.nextIn=12}}
  else if(G.state==='build'&&G.wave>0){G.nextIn-=dt;if(G.nextIn<=0)startWave(G)}
}
const API={TILE,COLS,ROWS,W,H,DT,PATHS,PATH,posAt,buildable,pathTiles,CORE,FAM,FBY,TYPES,TBY,MARKS,ROMAN,MARK_WAVE,BRANCH,node,computeStats,EN,WAVES,waveSpec,hpScale,newGame,canBuild,build,upgrade,sell,startWave,step,pickTarget};
if(typeof module!=='undefined')module.exports=API;else root.TD=API;
})(this);
