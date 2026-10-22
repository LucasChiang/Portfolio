/* LAST PATCH — engine: input, audio, particles, rooms, collision, lighting, hero. */
(function(){
'use strict';
const LP=window.LP={};
const T=30,VW=960,VH=540;
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,rand=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.random()*a.length|0],sign=v=>v<0?-1:1;
const appr=(v,t,d)=>v<t?Math.min(v+d,t):Math.max(v-d,t);
Object.assign(LP,{T,VW,VH,clamp,lerp,rand,pick,sign,appr,DT:1/60,t:0});
LP.ease={out:t=>1-Math.pow(1-t,3),inOut:t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,back:t=>{const c=1.70158;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)}};
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
LP.store=store;

/* ================= input ================= */
const KEYMAP={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'jump',KeyW:'jump',ArrowDown:'down',KeyS:'down',Space:'attack',KeyE:'shoot',ShiftLeft:'dash',ShiftRight:'dash',KeyQ:'heal',KeyM:'map',Tab:'map',KeyP:'pause',Escape:'pause',Enter:'confirm'};
const I={held:{},hit:{},rel:{}};LP.I=I;LP.captureKeys=true;
addEventListener('keydown',e=>{const a=KEYMAP[e.code];if(!a)return;if(LP.captureKeys)e.preventDefault();if(!e.repeat)I.hit[a]=true;I.held[a]=true;LP.lastKey=e.code});
addEventListener('keyup',e=>{const a=KEYMAP[e.code];if(!a)return;I.held[a]=false;I.rel[a]=true});
addEventListener('blur',()=>{for(const k in I.held)I.held[k]=false});
LP.endStep=()=>{I.hit={};I.rel={}};

/* ================= audio ================= */
let AC=null,master=null,sfxBus=null,musBus=null,echo=null,noiseBuf=null;
LP.muted=store.get('lc-mute')==='1';
function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=LP.muted?0:1;master.connect(AC.destination);
  sfxBus=AC.createGain();sfxBus.gain.value=.5;sfxBus.connect(master);musBus=AC.createGain();musBus.gain.value=.2;musBus.connect(master);
  echo=AC.createDelay(1);echo.delayTime.value=.24;const fb=AC.createGain();fb.gain.value=.38;const ef=AC.createBiquadFilter();ef.type='lowpass';ef.frequency.value=1800;echo.connect(ef);ef.connect(fb);fb.connect(echo);ef.connect(sfxBus);
  noiseBuf=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}catch(e){return null}}
  if(AC.state==='suspended')AC.resume();return AC}
LP.ac=ac;
LP.setMute=m=>{LP.muted=m;store.set('lc-mute',m?'1':'0');if(master)master.gain.value=m?0:1};
function tone(f0,f1,dur,type,vol,delay,bus){const a=ac();if(!a)return;const t=a.currentTime+(delay||0);const o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(bus||sfxBus);o.start(t);o.stop(t+dur+.03)}
function noise(dur,freq,q,vol,delay,type,bus){const a=ac();if(!a)return;const t=a.currentTime+(delay||0);const s=a.createBufferSource();s.buffer=noiseBuf;const f=a.createBiquadFilter();f.type=type||'bandpass';f.frequency.value=freq;f.Q.value=q||1;
  const g=a.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(bus||sfxBus);s.start(t,Math.random()*.5);s.stop(t+dur+.03)}
LP.tone=tone;LP.noise=noise;
const SFX={
  jump:()=>tone(260,520,.1,'triangle',.08),dj:()=>{tone(400,900,.12,'triangle',.07);noise(.1,3000,1,.05)},land:()=>noise(.06,500,1,.08,0,'lowpass'),
  slash:()=>{noise(.09,4200,.8,.09);tone(900,300,.07,'sawtooth',.025)},hit:()=>{tone(220,90,.1,'square',.08);noise(.08,1800,1,.1)},kill:()=>{tone(520,60,.25,'sawtooth',.07);noise(.25,900,.7,.12)},
  hurt:()=>{tone(300,70,.35,'sawtooth',.12);noise(.25,600,.6,.14)},dash:()=>{noise(.18,1500,.5,.12,0,'highpass');tone(180,700,.14,'sawtooth',.03)},
  shoot:()=>{tone(1400,300,.16,'square',.05);noise(.12,5000,1,.05)},heal:()=>[523,659,784,1047].forEach((f,i)=>tone(f,f,.25,'triangle',.06,i*.07)),
  save:()=>[392,523,659,784].forEach((f,i)=>tone(f,f*1.001,.5,'sine',.07,i*.12)),door:()=>{tone(90,40,.6,'square',.12);noise(.5,300,.8,.2,0,'lowpass')},
  boom:()=>{tone(120,30,.7,'sine',.25);noise(.7,400,.5,.25,0,'lowpass')},pogo:()=>tone(500,1000,.08,'square',.05),tick:()=>tone(1800,1700,.03,'square',.025),
  spike:()=>{noise(.2,2500,1,.12);tone(200,80,.2,'square',.06)},ui:()=>tone(700,900,.05,'triangle',.05),uiok:()=>{tone(600,600,.06,'triangle',.06);tone(900,900,.08,'triangle',.06,.06)},
  zap:()=>{tone(1200,200,.2,'sawtooth',.05);noise(.15,6000,2,.05)},warn:()=>tone(880,880,.12,'square',.04),bullet:()=>tone(700,500,.05,'square',.02),
  ability:()=>{[262,330,392,523,659,784,1047].forEach((f,i)=>tone(f,f,.7,'triangle',.06,i*.09));noise(1.2,6000,.5,.05,0,'highpass')},
  death:()=>{tone(400,40,1.2,'sawtooth',.12);noise(1,800,.4,.2,0,'lowpass')},chew:()=>noise(.07,700,2,.05),glitch:()=>{for(let i=0;i<4;i++)tone(rand(200,2000),rand(100,3000),.04,'square',.03,i*.03)},
  thud:()=>{tone(80,35,.4,'sine',.3);noise(.3,250,.6,.2,0,'lowpass')},whoosh:()=>noise(.35,900,.4,.12,0,'bandpass'),type:()=>tone(1200+rand(0,300),1200,.02,'square',.015),
  roar:()=>{tone(70,45,1.4,'sawtooth',.18);tone(105,60,1.4,'sawtooth',.1);noise(1.3,500,.5,.18,0,'lowpass')},blip:()=>tone(1500,1500,.04,'sine',.04)
};
LP.sfx=k=>{try{SFX[k]&&SFX[k]()}catch(e){}};
/* the laugh: formant-filtered sawtooth "HA"s through an echo */
LP.laugh=(n,p,vol)=>{const a=ac();if(!a)return;n=n||8;p=p||92;vol=vol||.55;const t0=a.currentTime+.03;
  for(let i=0;i<n;i++){const first=i===0,t=t0+(first?0:.34+(i-1)*.19),d=first?.36:.16,f=p*(first?1:1.12-i*.022);
    const o=a.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(f*(first?.7:1.15),t);o.frequency.linearRampToValueAtTime(f,t+(first?.12:.04));o.frequency.linearRampToValueAtTime(f*.82,t+d);
    const o2=a.createOscillator();o2.type='square';o2.frequency.setValueAtTime(f/2,t);o2.frequency.linearRampToValueAtTime(f*.41,t+d);
    const mix=a.createGain();o.connect(mix);const g2=a.createGain();g2.gain.value=.35;o2.connect(g2);g2.connect(mix);
    const env=a.createGain();env.gain.setValueAtTime(0,t);env.gain.linearRampToValueAtTime(vol,t+(first?.1:.018));env.gain.setValueAtTime(vol,t+d*.55);env.gain.exponentialRampToValueAtTime(.0001,t+d);
    (first?[[300,5,1.4],[700,6,1.2],[1100,7,.6]]:[[750,6,1.6],[1200,7,1],[2600,9,.4]]).forEach(([fr,q,gn])=>{const bp=a.createBiquadFilter();bp.type='bandpass';bp.frequency.value=fr;bp.Q.value=q;const gg=a.createGain();gg.gain.value=gn*2.2;mix.connect(bp);bp.connect(gg);gg.connect(env)});
    env.connect(sfxBus);env.connect(echo);o.start(t);o2.start(t);o.stop(t+d+.05);o2.stop(t+d+.05);
    noise(d*.7,first?600:1500,1.2,vol*.12,t-a.currentTime)}};

/* music: tiny step sequencer */
const TRK={
  title:{bpm:76,root:45,prog:[0,-4,3,-2],bass:'x.......x..x....',arp:'x.x.x.x.x.x.x.x.',kick:'',hat:'',snare:'',pad:1,arpType:'triangle',arpOct:2},
  mb:{bpm:92,root:43,prog:[0,0,-4,-2],bass:'x..x..x.x..x..x.',arp:'x..x.x..x..x.x..',kick:'x.......x.......',hat:'....x.......x...',snare:'',pad:1,arpType:'triangle',arpOct:2},
  cpu:{bpm:118,root:40,prog:[0,1,-2,0],bass:'x.x.x.x.x.x.x.xx',arp:'xxx.xxx.xxx.x.x.',kick:'x...x...x...x...',hat:'..x...x...x...x.',snare:'',pad:0,arpType:'square',arpOct:2},
  boss:{bpm:148,root:38,prog:[0,0,1,-1],bass:'x.xx.xx.x.xx.x.x',arp:'x.x.xx.xx.x.xx.x',kick:'x..x..x.x..x..x.',hat:'.x.x.x.x.x.x.x.x',snare:'....x.......x...',pad:0,arpType:'sawtooth',arpOct:2},
  boss2:{bpm:162,root:40,prog:[0,3,1,-2],bass:'xx.xx.x.xx.xx.x.',arp:'xxxx.x.xxxxx.x.x',kick:'x.x...x.x.x...x.',hat:'xxxxxxxxxxxxxxxx',snare:'....x..x....x...',pad:0,arpType:'square',arpOct:3},
  quiet:{bpm:60,root:45,prog:[0],bass:'',arp:'',kick:'',hat:'',snare:'',pad:1,arpType:'sine',arpOct:2}
};
const mtof=m=>440*Math.pow(2,(m-69)/12);
let cur=null,step=0,nextT=0,timer=null,pending=null;
LP.music=name=>{if(!TRK[name]){LP.stopMusic();return}if(cur&&cur.name===name&&!pending)return;pending=name;if(!timer){const a=ac();if(!a)return;nextT=a.currentTime+.05;step=0;cur={name,...TRK[name]};pending=null;timer=setInterval(sched,25)}};
LP.stopMusic=()=>{if(timer)clearInterval(timer);timer=null;cur=null;pending=null};
function sched(){const a=AC;if(!a||!cur)return;while(nextT<a.currentTime+.12){if(pending&&step%16===0){cur={name:pending,...TRK[pending]};pending=null;step=0}playStep(cur,step,nextT);nextT+=60/cur.bpm/4;step=(step+1)%64}}
function playStep(c,s,t){const bar=(s>>4)%c.prog.length,i=s%16,root=c.root+c.prog[bar],d=a=>Math.max(0,t-AC.currentTime+a);
  if(c.bass[i]==='x'){const o=AC.createOscillator(),f=AC.createBiquadFilter(),g=AC.createGain();o.type='sawtooth';o.frequency.value=mtof(root);f.type='lowpass';f.frequency.setValueAtTime(900,t);f.frequency.exponentialRampToValueAtTime(160,t+.18);g.gain.setValueAtTime(.5,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);o.connect(f);f.connect(g);g.connect(musBus);o.start(t);o.stop(t+.25)}
  if(c.arp[i]==='x'){const ch=[0,3,7,10,12,15][(s*5+bar)%6];tone(mtof(root+12*c.arpOct+ch),mtof(root+12*c.arpOct+ch),.14,c.arpType,.12,d(0),musBus)}
  if(c.kick[i]==='x'){const o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(40,t+.12);g.gain.setValueAtTime(.9,t);g.gain.exponentialRampToValueAtTime(.001,t+.16);o.connect(g);g.connect(musBus);o.start(t);o.stop(t+.18)}
  if(c.hat[i]==='x')noise(.04,8000,1,.12,d(0),'highpass',musBus);
  if(c.snare[i]==='x'){noise(.14,1900,.7,.45,d(0),'bandpass',musBus);tone(220,140,.08,'triangle',.25,d(0),musBus)}
  if(c.pad&&i===0){[0,7,15].forEach(n=>{const o=AC.createOscillator(),o2=AC.createOscillator(),f=AC.createBiquadFilter(),g=AC.createGain();o.type=o2.type='sawtooth';o.frequency.value=mtof(root+12+n);o2.frequency.value=mtof(root+12+n)*1.006;f.type='lowpass';f.frequency.value=700;
    const L=60/c.bpm*4;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.06,t+L*.4);g.gain.linearRampToValueAtTime(0,t+L);o.connect(f);o2.connect(f);f.connect(g);g.connect(musBus);o.start(t);o2.start(t);o.stop(t+L+.05);o2.stop(t+L+.05)})}}

/* ================= particles / overlays / lights ================= */
LP.parts=[];LP.overlays=[];LP.lights=[];
LP.part=o=>{const p=Object.assign({x:0,y:0,vx:0,vy:0,g:0,life:.5,t:0,s:3,col:'#fff',k:'dot',drag:0,rot:0,vr:0},o);LP.parts.push(p);return p};
LP.burst=(x,y,n,col,spd,o)=>{for(let i=0;i<n;i++){const a=rand(0,6.283),v=rand(spd*.25,spd);LP.part(Object.assign({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rand(.25,.7),s:rand(2,4.5),col,g:500,drag:1.6},o||{}))}};
LP.text=(x,y,txt,col,o)=>LP.part(Object.assign({x,y,vy:-60,life:.9,k:'text',txt,col,s:14},o||{}));
function updParts(dt){const P=LP.parts;for(let i=P.length-1;i>=0;i--){const p=P[i];p.t+=dt;if(p.t>=p.life){P[i]=P[P.length-1];P.pop();continue}p.vy+=p.g*dt;if(p.drag){const k=Math.max(0,1-p.drag*dt);p.vx*=k;p.vy*=k}p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt}}
function drawParts(g,front){for(const p of LP.parts){if(!!p.front!==front)continue;const k=1-p.t/p.life;g.globalAlpha=Math.min(1,k*1.5)*(p.a||1);
  switch(p.k){
    case 'dot':g.fillStyle=p.col;g.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s);break;
    case 'spark':g.strokeStyle=p.col;g.lineWidth=p.s*.6;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x-p.vx*.04,p.y-p.vy*.04);g.stroke();break;
    case 'ring':g.strokeStyle=p.col;g.lineWidth=p.w||3;g.beginPath();g.arc(p.x,p.y,p.s+(p.grow||200)*p.t,0,6.283);g.stroke();break;
    case 'shard':g.save();g.translate(p.x,p.y);g.rotate(p.rot);g.fillStyle=p.col;g.beginPath();g.moveTo(-p.s,-p.s*.6);g.lineTo(p.s,0);g.lineTo(-p.s*.4,p.s*.7);g.closePath();g.fill();g.restore();break;
    case 'glow':{const r=p.s*(1+p.t/p.life);const gr=g.createRadialGradient(p.x,p.y,0,p.x,p.y,r);gr.addColorStop(0,p.col);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(p.x-r,p.y-r,r*2,r*2);break}
    case 'text':g.font=`700 ${p.s}px "Silkscreen",monospace`;g.textAlign='center';g.fillStyle=p.col;g.fillText(p.txt,p.x,p.y);g.textAlign='left';break;
    case 'img':p.draw(g,p,k);break}}g.globalAlpha=1}
LP.light=(x,y,r,i,col)=>LP.lights.push({x,y,r,i:i==null?1:i,col});

/* ================= camera ================= */
const cam=LP.cam={x:0,y:0,shake:0,focus:null,zoom:1,lookY:0};
LP.shake=v=>{cam.shake=Math.max(cam.shake,v)};
LP.hitstop=0;LP.stop=s=>{LP.hitstop=Math.max(LP.hitstop,s)};
function camUpdate(dt,snap){const r=LP.room;if(!r)return;let tx,ty;
  if(cam.focus){tx=cam.focus.x-VW/2;ty=cam.focus.y-VH/2}
  else{const h=H;tx=h.x+h.w/2-VW/2+h.face*70;ty=h.y+h.h/2-VH/2-30+(h.vy>500?80:0)+cam.lookY}
  const mw=r.w*T,mh=r.h*T;tx=mw<=VW?(mw-VW)/2:clamp(tx,0,mw-VW);ty=mh<=VH?(mh-VH)/2:clamp(ty,0,mh-VH);
  if(snap){cam.x=tx;cam.y=ty}else{const k=1-Math.exp(-(cam.focus?(cam.focus.s||3):6)*dt);cam.x+=(tx-cam.x)*k;cam.y+=(ty-cam.y)*k}
  cam.shake=Math.max(0,cam.shake-dt*28)}
LP.camUpdate=camUpdate;

/* ================= zones ================= */
LP.ZONES={
  mb:{name:'THE MOTHERBOARD',sub:'copper country',bg:'#020c07',far:'#0a2516',tile:'#0a2416',tileHi:'#123b24',edge:'#d9a441',acc:'#7dff9a',spike:'#c45bff',dark:.52,music:'mb',mote:'#7dff9a'},
  cpu:{name:'THE CORE',sub:'every instruction burns',bg:'#100302',far:'#2a0b05',tile:'#260b05',tileHi:'#47170a',edge:'#ff8a3e',acc:'#ffb35b',spike:'#ff3e6b',dark:.46,music:'cpu',mote:'#ffb35b'}
};
const patCache={};
function farPattern(z){if(patCache[z])return patCache[z];const Z=LP.ZONES[z],c=document.createElement('canvas');c.width=c.height=480;const g=c.getContext('2d');let s=z.length*977+3;const R=()=>{s=(s*16807)%2147483647;return s/2147483647};
  g.fillStyle=Z.bg;g.fillRect(0,0,480,480);g.lineCap='round';
  if(z==='mb'){g.strokeStyle=Z.far;g.lineWidth=4;for(let i=0;i<26;i++){let x=R()*480,y=R()*480;g.beginPath();g.moveTo(x,y);for(let k=0;k<4;k++){const d=40+R()*90;const dir=R()*4|0;if(dir===0)x+=d;else if(dir===1)y+=d;else{x+=d*.7;y+=d*.7*(dir===2?1:-1)}g.lineTo(x,y)}g.stroke();g.fillStyle=Z.far;g.beginPath();g.arc(x,y,6,0,6.283);g.fill()}
    g.fillStyle='rgba(125,255,154,.05)';for(let i=0;i<60;i++){g.beginPath();g.arc(R()*480,R()*480,2,0,6.283);g.fill()}}
  else{g.strokeStyle=Z.far;g.lineWidth=1.5;for(let i=0;i<=480;i+=40){g.beginPath();g.moveTo(i,0);g.lineTo(i,480);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(480,i);g.stroke()}
    for(let i=0;i<14;i++){const x=(R()*12|0)*40,y=(R()*12|0)*40;g.fillStyle='rgba(255,138,62,.10)';g.fillRect(x+3,y+3,34,34);g.fillStyle='rgba(255,180,90,.25)';g.fillRect(x+16,y+16,8,8)}}
  return patCache[z]=g.createPattern(c,'repeat')}

/* ================= rooms ================= */
LP.rooms={};LP.room=null;LP.ents=[];LP.plats=[];LP.shots=[];
// tiles: 0 empty, 1 solid, 2 one-way, 3 spike, 4 sealed barrier, 5 gate (closed)
LP.defRoom=(id,zone,wx,wy,w,h,build,meta)=>{const r={id,zone,wx,wy,w,h,grid:new Uint8Array(w*h),spawns:[],meta:meta||{}};
  const set=(x,y,v)=>{if(x>=0&&y>=0&&x<w&&y<h)r.grid[y*w+x]=v};
  const api={
    border(open){open=open||{};const inR=(side,i)=>{const o=open[side];if(!o)return false;const L=Array.isArray(o[0])?o:[o];return L.some(([a,b])=>i>=a&&i<=b)};
      for(let x=0;x<w;x++){if(!inR('T',x))set(x,0,1);if(!inR('B',x))set(x,h-1,1)}for(let y=0;y<h;y++){if(!inR('L',y))set(0,y,1);if(!inR('R',y))set(w-1,y,1)}},
    solid(x,y,ww,hh){for(let i=0;i<ww;i++)for(let j=0;j<hh;j++)set(x+i,y+j,1)},clear(x,y,ww,hh){for(let i=0;i<ww;i++)for(let j=0;j<hh;j++)set(x+i,y+j,0)},
    plat(x,y,n){for(let i=0;i<n;i++)set(x+i,y,2)},spikes(x,y,n){for(let i=0;i<n;i++)set(x+i,y,3)},barrier(x,y,ww,hh){for(let i=0;i<ww;i++)for(let j=0;j<hh;j++)set(x+i,y+j,4)},
    ent(type,x,y,o){r.spawns.push(Object.assign({type,tx:x,ty:y},o||{}))}};
  build(api);LP.rooms[id]=r;return r};
const tileAt=(tx,ty)=>{const r=LP.room;tx=clamp(tx,0,r.w-1);ty=clamp(ty,0,r.h-1);return r.grid[ty*r.w+tx]};
LP.tile=tileAt;LP.setTile=(tx,ty,v)=>{const r=LP.room;if(tx>=0&&ty>=0&&tx<r.w&&ty<r.h)r.grid[ty*r.w+tx]=v};
const isSolid=t=>t===1||t===4||t===5;LP.isSolid=isSolid;
LP.solidAt=(px,py)=>isSolid(tileAt(Math.floor(px/T),Math.floor(py/T)));
LP.roomAtWorld=(wx,wy)=>{for(const id in LP.rooms){const r=LP.rooms[id];if(wx>=r.wx&&wy>=r.wy&&wx<r.wx+r.w&&wy<r.wy+r.h)return r}return null};

/* body movement vs tiles (+ one-way + platforms) */
LP.moveBody=(o,dt,opt)=>{opt=opt||{};o.hitWall=0;o.hitCeil=false;const wasGround=o.ground;o.ground=false;o.groundOneWay=false;o.onPlat=null;
  // x
  let dx=o.vx*dt;o.x+=dx;
  if(dx>0){const tx=Math.floor((o.x+o.w-.01)/T);for(let ty=Math.floor(o.y/T);ty<=Math.floor((o.y+o.h-.01)/T);ty++)if(isSolid(tileAt(tx,ty))){o.x=tx*T-o.w;o.vx=0;o.hitWall=1;break}}
  else if(dx<0){const tx=Math.floor(o.x/T);for(let ty=Math.floor(o.y/T);ty<=Math.floor((o.y+o.h-.01)/T);ty++)if(isSolid(tileAt(tx,ty))){o.x=(tx+1)*T;o.vx=0;o.hitWall=-1;break}}
  // y
  const prevB=o.y+o.h;let dy=o.vy*dt;o.y+=dy;
  if(dy>=0){const ty=Math.floor((o.y+o.h-.01)/T),tx0=Math.floor((o.x+1)/T),tx1=Math.floor((o.x+o.w-1)/T);
    for(let tx=tx0;tx<=tx1;tx++){const t=tileAt(tx,ty);if(isSolid(t)||(t===2&&!o.drop&&opt.oneway!==false&&prevB<=ty*T+1)){o.y=ty*T-o.h;o.vy=0;o.ground=true;if(t===2)o.groundOneWay=true;break}}
    if(!o.ground&&opt.plats!==false){for(const p of LP.plats){if(!p.on)continue;if(o.x+o.w>p.x+1&&o.x<p.x+p.w-1&&prevB<=p.y+2&&o.y+o.h>=p.y){o.y=p.y-o.h;o.vy=0;o.ground=true;o.groundOneWay=true;o.onPlat=p;break}}}}
  else{const ty=Math.floor(o.y/T),tx0=Math.floor((o.x+1)/T),tx1=Math.floor((o.x+o.w-1)/T);for(let tx=tx0;tx<=tx1;tx++)if(isSolid(tileAt(tx,ty))){o.y=(ty+1)*T;o.vy=0;o.hitCeil=true;break}}
  o.justLanded=o.ground&&!wasGround;return o};
LP.overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
LP.boxHitsSpike=(x,y,w,h)=>{for(let tx=Math.floor(x/T);tx<=Math.floor((x+w-.01)/T);tx++)for(let ty=Math.floor(y/T);ty<=Math.floor((y+h-.01)/T);ty++)if(tileAt(tx,ty)===3){const sy=ty*T+T*.4;if(y+h>sy)return true}return false};

/* pre-render room tiles */
LP.buildRoomCanvas=r=>{const Z=LP.ZONES[r.zone],c=document.createElement('canvas');c.width=r.w*T;c.height=r.h*T;const g=c.getContext('2d');let s=r.wx*131+r.wy*71+7;const R=()=>{s=(s*16807)%2147483647;return s/2147483647};
  const at=(x,y)=>{if(x<0||y<0||x>=r.w||y>=r.h)return 1;return r.grid[y*r.w+x]};const S=(x,y)=>{const t=at(x,y);return t===1};
  for(let y=0;y<r.h;y++)for(let x=0;x<r.w;x++){const t=r.grid[y*r.w+x],px=x*T,py=y*T;
    if(t===1){const open=!S(x,y-1),deep=S(x,y-1)&&S(x-1,y)&&S(x+1,y)&&S(x,y+1);
      g.fillStyle=deep?shade(Z.tile,-.35):Z.tile;g.fillRect(px,py,T,T);
      if(!deep){g.fillStyle=Z.tileHi;if(open)g.fillRect(px,py,T,6);if(!S(x-1,y))g.fillRect(px,py,3,T);if(!S(x+1,y))g.fillRect(px+T-3,py,3,T);if(!S(x,y+1)){g.fillStyle=shade(Z.tile,-.2);g.fillRect(px,py+T-4,T,4)}}
      if(open){g.fillStyle=Z.edge;g.fillRect(px,py,T,2);if(R()<.35){g.fillRect(px+R()*20+3,py+2,2,6)}}
      if(!deep&&R()<.3){g.strokeStyle=shade(Z.edge,-.55);g.lineWidth=2;g.beginPath();const yy=py+10+R()*12;g.moveTo(px,yy);g.lineTo(px+T,yy);g.stroke()}
      if(R()<.12){g.fillStyle=shade(Z.edge,-.4);g.beginPath();g.arc(px+8+R()*14,py+10+R()*12,2.6,0,6.283);g.fill();g.fillStyle='#000';g.beginPath();g.arc(px+8+R()*14,py+10+R()*12,0,0,6.283);g.fill()}
      if(deep&&R()<.06){g.fillStyle=shade(Z.tile,.06);g.fillRect(px+7,py+7,T-14,T-14);g.fillStyle=shade(Z.edge,-.7);for(let k=0;k<3;k++)g.fillRect(px+9+k*5,py+4,2,3)}}
    else if(t===2){g.fillStyle=shade(Z.edge,-.25);g.fillRect(px,py,T,5);g.fillStyle=Z.edge;g.fillRect(px,py,T,2);g.fillStyle=shade(Z.tile,.1);g.fillRect(px+3,py+5,3,7);g.fillRect(px+T-6,py+5,3,7)}
    else if(t===3){g.fillStyle=Z.spike;const below=S(x,y+1),above=S(x,y-1);for(let k=0;k<3;k++){const sx=px+k*10;g.beginPath();if(below||!above){g.moveTo(sx,py+T);g.lineTo(sx+5,py+T*.35+R()*4);g.lineTo(sx+10,py+T)}else{g.moveTo(sx,py);g.lineTo(sx+5,py+T*.65);g.lineTo(sx+10,py)}g.fill()}
      g.fillStyle='rgba(255,255,255,.35)';g.fillRect(px+4,py+T*.55,2,2);g.fillRect(px+19,py+T*.6,2,2)}}
  r.canvas=c;
  const runs=[];for(let y=1;y<r.h;y++){let x0=-1;for(let x=0;x<=r.w;x++){const ok=x<r.w&&S(x,y)&&!S(x,y-1)&&at(x,y-1)!==3;if(ok&&x0<0)x0=x;if(!ok&&x0>=0){if(x-x0>=4)runs.push({x:x0*T,y:y*T,len:(x-x0)*T});x0=-1}}}
  r.pulses=runs.map(u=>({u,p:R()*u.len,sp:60+R()*90,d:R()<.5?1:-1}));
  // mid-ground decorations (parallax .6)
  const deco=[];const n=Math.ceil(r.w/9);for(let i=0;i<n;i++)deco.push({x:i*9*T*.75+R()*120,h:120+R()*260,w:40+R()*60,k:R()});r.deco=deco};
function shade(hex,amt){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=amt<0?0:255,p=Math.abs(amt);r=Math.round((f-r)*p+r);g=Math.round((f-g)*p+g);b=Math.round((f-b)*p+b);return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}
LP.shade=shade;

/* ================= hero ================= */
const H=LP.H={x:0,y:0,w:18,h:40,vx:0,vy:0,face:1,hearts:3,charge:0,inv:0};
const PHY={run:270,acc:3200,air:2300,grav:2200,fall:900,jump:730,dj:640,coyote:.1,buf:.12,dash:820,dashT:.17,dashCD:.45,wslide:150,wjx:340,wjy:700,pogo:640};
LP.PHY=PHY;
LP.heroReset=(x,y)=>{Object.assign(H,{x,y,vx:0,vy:0,ground:false,coyote:0,jbuf:0,dashT:0,dashCD:0,airDash:true,canDJ:true,wall:0,atkT:0,atkCD:0,atkDir:'f',kb:0,heal:0,crouch:false,
  dead:false,ctrl:true,drop:0,shotCD:0,run:0,sq:1,land:0,after:[],lastSafe:{x,y},safeT:0,hazT:0,deadT:0,inv:0,wallT:0,stun:0});
  H.scarf=[];for(let i=0;i<9;i++)H.scarf.push({x:x+9,y:y+8,px:x+9,py:y+8})};
LP.heroReset(100,100);
LP.abil={};
const hb=()=>({x:H.x,y:H.y+(H.crouch?14:0),w:H.w,h:H.crouch?26:H.h});LP.heroBox=hb;

LP.hurtHero=(fromX,dmg)=>{if(H.dead||H.inv>0||LP.godMode)return false;H.hearts-=dmg||1;H.inv=1.3;H.kb=.2;H.dashT=0;H.heal=0;const d=H.x+H.w/2<fromX?-1:1;H.vx=d*330;H.vy=-430;LP.stop(.16);LP.shake(14);LP.sfx('hurt');LP.flash={c:'rgba(255,40,70,',t:.35,m:.35};
  LP.burst(H.x+9,H.y+20,18,'#ff4f6b',380);LP.onHurt&&LP.onHurt();if(H.hearts<=0)LP.killHero();return true};
LP.hazardHero=()=>{if(H.dead||H.hazT>0)return;const hurt=LP.hurtHero(H.x+H.w/2,1);if(H.dead)return;LP.sfx('spike');H.hazT=.5;H.ctrl=false;H.vx=0;H.vy=0;LP.fade={t:0,d:.5}};
LP.killHero=()=>{H.hearts=0;H.dead=true;H.deadT=0;H.ctrl=false;LP.sfx('death');LP.stop(.3);LP.shake(18);
  for(let i=0;i<40;i++)LP.part({x:H.x+9+rand(-8,8),y:H.y+20+rand(-18,18),vx:rand(-320,320),vy:rand(-520,-80),g:900,life:rand(.8,1.6),k:'shard',s:rand(3,7),col:pick(['#e8ecf5','#3ee8ff','#26335c']),vr:rand(-12,12),drag:.5})};

function heroUpdate(dt){const h=H,ab=LP.abil;
  if(h.dead){h.deadT+=dt;return}
  if(h.frozen){scarfStep(dt);return}
  h.inv=Math.max(0,h.inv-dt);h.atkCD-=dt;h.dashCD-=dt;h.shotCD-=dt;h.drop=Math.max(0,h.drop-dt);h.land=Math.max(0,h.land-dt);
  if(h.hazT>0){h.hazT-=dt;if(h.hazT<=.25&&!h._hzMoved){h._hzMoved=true;h.x=h.lastSafe.x;h.y=h.lastSafe.y;h.vx=h.vy=0;LP.camUpdate(0,true)}if(h.hazT<=0){h._hzMoved=false;h.ctrl=true}scarfStep(dt);return}
  const ctrl=h.ctrl&&!LP.cs,hi=ctrl?I.held:{},ht=ctrl?I.hit:{};
  if(h.onPlat){h.x+=h.onPlat.dx;h.y+=h.onPlat.dy}
  const move=(hi.right?1:0)-(hi.left?1:0);
  // heal (Patch)
  if(hi.heal&&h.ground&&h.charge>=33&&h.hearts<LP.maxHearts&&h.dashT<=0&&!h.kb){h.heal+=dt;h.vx=appr(h.vx,0,4000*dt);
    if(Math.random()<.6){const a=rand(0,6.283);LP.part({x:h.x+9+Math.cos(a)*50,y:h.y+22+Math.sin(a)*50,vx:-Math.cos(a)*120,vy:-Math.sin(a)*120,life:.4,col:'#7dffd8',s:3})}
    if(h.heal>=.8){h.heal=0;h.charge-=33;h.hearts++;LP.sfx('heal');LP.burst(h.x+9,h.y+20,24,'#7dffd8',260,{g:-100});LP.part({x:h.x+9,y:h.y+20,k:'ring',col:'#7dffd8',s:10,grow:220,life:.4})}
    h.vy=Math.min(h.vy+PHY.grav*dt,PHY.fall);LP.moveBody(h,dt);scarfStep(dt);return}else h.heal=0;
  h.kb=Math.max(0,h.kb-dt);
  h.crouch=!!(hi.down&&h.ground&&!move&&h.dashT<=0&&h.atkT<=0);
  // wall contact (Trace Grip)
  h.wall=0;if(ab.grip&&!h.ground&&h.dashT<=0){const probe=(dir)=>{const x=dir>0?h.x+h.w+1:h.x-1;return LP.solidAt(x,h.y+8)&&LP.solidAt(x,h.y+h.h-6)};
    if(move>0&&probe(1))h.wall=1;else if(move<0&&probe(-1))h.wall=-1}
  if(h.dashT>0){h.dashT-=dt;h.vx=h.face*PHY.dash;h.vy=0;if(Math.random()<.9)h.after.push({x:h.x,y:h.y,face:h.face,t:0,c:h.crouch});if(h.dashT<=0)h.vx=h.face*PHY.run*.7}
  else{
    if(!h.kb){const target=h.crouch?0:move*PHY.run;h.vx=appr(h.vx,target,(h.ground?PHY.acc:PHY.air)*dt)}
    if(move&&!h.kb&&h.atkT<=0)h.face=move;
    let gr=PHY.grav;if(h.vy<0&&!hi.jump&&!h.pogoT)gr*=2.3;else if(Math.abs(h.vy)<120&&hi.jump)gr*=.6;
    h.vy=Math.min(h.vy+gr*dt,PHY.fall);
    if(h.wall&&h.vy>0){h.vy=Math.min(h.vy,PHY.wslide);h.airDash=true;h.canDJ=true;h.face=-h.wall;if(Math.random()<.3)LP.part({x:h.wall>0?h.x+h.w:h.x,y:h.y+h.h-6,vx:-h.wall*30,vy:-30,life:.3,col:'#9fb3d9',s:2})}}
  h.pogoT=Math.max(0,(h.pogoT||0)-dt);
  // jumping
  if(ht.jump)h.jbuf=PHY.buf;else h.jbuf-=dt;
  h.coyote=h.ground?PHY.coyote:h.coyote-dt;
  if(h.jbuf>0&&h.dashT<=0){
    if(hi.down&&h.ground&&h.groundOneWay){h.drop=.22;h.jbuf=0;h.y+=2;h.ground=false}
    else if(h.coyote>0){h.vy=-PHY.jump;h.coyote=0;h.jbuf=0;h.ground=false;h.sq=1.25;LP.sfx('jump');dust(4)}
    else if(h.wall&&ab.grip){h.vy=-PHY.wjy;h.vx=-h.wall*PHY.wjx;h.kb=.13;h.face=-h.wall;h.jbuf=0;LP.sfx('jump');h.sq=1.2;for(let i=0;i<6;i++)LP.part({x:h.wall>0?h.x+h.w:h.x,y:h.y+20,vx:-h.wall*rand(60,200),vy:rand(-120,60),life:.35,col:'#c9d6f0',s:3})}
    else if(ab.dj&&h.canDJ){h.vy=-PHY.dj;h.canDJ=false;h.jbuf=0;LP.sfx('dj');h.sq=1.2;for(let i=0;i<10;i++){const a=i/10*6.283;LP.part({x:h.x+9,y:h.y+h.h,vx:Math.cos(a)*160,vy:Math.sin(a)*60+40,life:.35,col:'#7df0ff',s:3})}}}
  // dash
  if(ht.dash&&ab.dash&&h.dashCD<=0&&(h.ground||h.airDash)&&!h.kb){if(move)h.face=move;h.dashT=PHY.dashT;h.dashCD=PHY.dashCD;if(!h.ground)h.airDash=false;h.atkT=0;LP.sfx('dash');LP.shake(3);
    for(let i=0;i<8;i++)LP.part({x:h.x+9,y:h.y+rand(5,38),vx:-h.face*rand(100,300),vy:rand(-20,20),life:.3,col:'#7df0ff',s:2,k:'spark'})}
  // attack
  if(ht.attack&&h.atkCD<=0&&h.dashT<=0){h.atkDir=hi.down&&!h.ground?'d':(hi.jump&&!h.ground)||(hi.jump&&h.vy<0)?'u':'f';h.atkT=.22;h.atkCD=.32;h.atkHit=new Set();h.atkId=(h.atkId||0)+1;LP.sfx('slash')}
  // shoot (Packet Shot)
  if(ht.shoot&&ab.shot&&h.shotCD<=0){if(h.charge>=22){h.charge-=22;h.shotCD=.35;LP.sfx('shoot');h.vx-=h.face*120;
      LP.shots.push({x:h.x+9+h.face*14,y:h.y+(h.crouch?24:18),vx:h.face*760,vy:0,r:9,mine:true,dmg:2.5,life:1.4,col:'#3ee8ff',k:'packet',hit:new Set()})}
    else{LP.text(h.x+9,h.y-8,'LOW CHARGE','#7a8bb5',{s:10,life:.6})}}
  h.atkT=Math.max(0,h.atkT-dt);
  // move
  const wasAir=!h.ground,fallV=h.vy;
  const box=hb();const yOff=box.y-h.y,hh=box.h;const body={x:h.x,y:h.y+yOff,w:h.w,h:hh,vx:h.vx,vy:h.vy,drop:h.drop>0,ground:h.ground};
  LP.moveBody(body,dt);h.x=body.x;h.y=body.y-yOff;h.vx=body.vx;h.vy=body.vy;h.ground=body.ground;h.groundOneWay=body.groundOneWay;h.onPlat=body.onPlat;
  if(h.dashT>0&&body.hitWall)h.dashT=0;
  if(h.ground){h.airDash=true;h.canDJ=true;if(wasAir&&fallV>200){h.sq=.72;h.land=.12;LP.sfx('land');dust(fallV>700?10:5);if(fallV>780)LP.shake(3)}}
  h.sq=lerp(h.sq,1,1-Math.exp(-14*dt));
  h.run=h.ground&&Math.abs(h.vx)>20?h.run+dt*Math.abs(h.vx)/22:0;
  // safe spot
  if(h.ground&&!h.onPlat&&!h.groundOneWay){const fx=Math.floor((h.x+h.w/2)/T),fy=Math.floor((h.y+h.h+2)/T);let ok=true;for(let k=-1;k<=1;k++){if(tileAt(fx+k,fy-1)===3||tileAt(fx+k,fy)===3||!isSolid(tileAt(fx+k,fy)))ok=false}
    if(ok){h.safeT+=dt;if(h.safeT>.15)h.lastSafe={x:h.x,y:h.y}}else h.safeT=0}else h.safeT=0;
  // spikes
  const b2=hb();if(LP.boxHitsSpike(b2.x+3,b2.y+4,b2.w-6,b2.h-4)){if(h.atkT>0&&h.atkDir==='d'&&h.vy>0){pogo();}else LP.hazardHero()}
  for(const a of h.after)a.t+=dt;h.after=h.after.filter(a=>a.t<.22);
  scarfStep(dt)}
function pogo(){H.vy=-PHY.pogo;H.pogoT=.2;H.airDash=true;H.canDJ=true;H.atkT=Math.min(H.atkT,.06);LP.sfx('pogo');LP.burst(H.x+9,H.y+H.h+10,8,'#fff',200)}
LP.pogo=pogo;
LP.heroUpdate=heroUpdate;
function dust(n){for(let i=0;i<n;i++)LP.part({x:H.x+9+rand(-8,8),y:H.y+H.h-2,vx:rand(-90,90),vy:rand(-80,-10),life:rand(.25,.5),col:'rgba(200,210,230,.7)',s:rand(2,4),drag:3})}
LP.dust=dust;
function scarfStep(dt){const h=H,S=h.scarf;const ax=h.x+h.w/2-h.face*6,ay=h.y+(h.crouch?20:7);S[0].x=ax;S[0].y=ay;
  for(let i=1;i<S.length;i++){const p=S[i];const vx=(p.x-p.px)*.9,vy=(p.y-p.py)*.9;p.px=p.x;p.py=p.y;p.x+=vx-h.face*10*dt*(h.ground&&Math.abs(h.vx)<10?.3:1);p.y+=vy+260*dt*dt*60*.05+Math.sin(LP.t*6+i)*.15}
  for(let k=0;k<3;k++)for(let i=1;i<S.length;i++){const a=S[i-1],b=S[i];const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,L=4.6;const f=(d-L)/d;b.x-=dx*f;b.y-=dy*f}}

/* attack hitboxes */
LP.atkBox=()=>{const h=H;if(h.atkT<=.06)return null;const cx=h.x+h.w/2,cy=h.y+(h.crouch?28:20);
  if(h.atkDir==='u')return{x:cx-32,y:h.y-52,w:64,h:62};if(h.atkDir==='d')return{x:cx-28,y:h.y+h.h-8,w:56,h:56};
  return{x:h.face>0?cx:cx-62,y:cy-26,w:62,h:52}};

/* ================= hero drawing ================= */
function heroDraw(g){const h=H;if(h.dead)return;
  for(const a of h.after){g.globalAlpha=(1-a.t/.22)*.45;g.fillStyle='#3ee8ff';g.beginPath();if(g.roundRect)g.roundRect(a.x,a.y+(a.c?14:0)+4,h.w,(a.c?26:h.h)-4,8);else g.rect(a.x,a.y+4,h.w,h.h-4);g.fill()}g.globalAlpha=1;
  if(h.inv>0&&Math.floor(h.inv*14)%2===0&&!h.hazT)g.globalAlpha=.35;
  // scarf (world space)
  const S=h.scarf;g.lineCap='round';for(let i=1;i<S.length;i++){g.strokeStyle=i<3?'#2a3a6a':i<6?'#2bb8d0':'#3ee8ff';g.lineWidth=5-i*.45;g.beginPath();g.moveTo(S[i-1].x,S[i-1].y);g.lineTo(S[i].x,S[i].y);g.stroke()}
  if(LP.abil.dash||1){const tip=S[S.length-1];g.fillStyle='#bff8ff';g.beginPath();g.arc(tip.x,tip.y,1.8,0,6.283);g.fill()}
  const fx=h.x+h.w/2,fy=h.y+h.h;g.save();g.translate(fx,fy);const sx=h.dashT>0?1.25:1/Math.sqrt(h.sq),sy=h.dashT>0?.85:h.sq;g.scale(h.face*sx,sy);
  const cr=h.crouch?12:0,air=!h.ground,rc=h.run,bob=h.ground&&Math.abs(h.vx)>20?Math.abs(Math.sin(rc))*2.5:0,lean=h.dashT>0?.35:clamp(h.vx/900,-.15,.2);
  // legs
  g.strokeStyle='#18213d';g.lineWidth=5;g.lineCap='round';
  const legs=air?[[-4,-4,-2,-9],[5,-1,3,-8]]:h.crouch?[[-6,0,-3,-6],[6,0,3,-6]]:[[Math.sin(rc)*7,-Math.max(0,Math.cos(rc))*5,-2,-14],[Math.sin(rc+Math.PI)*7,-Math.max(0,Math.cos(rc+Math.PI))*5,3,-14]];
  if(h.wall)legs[0]=[6,-8,0,-14];
  legs.forEach(([x,y,hx,hy])=>{g.beginPath();g.moveTo(hx,hy-bob+cr*.6);g.lineTo(x,y);g.stroke()});
  g.rotate(lean);
  // coat/body
  const by=-30+cr-bob;g.fillStyle='#24325e';g.beginPath();if(g.roundRect)g.roundRect(-8,by,16,19,5);else g.rect(-8,by,16,19);g.fill();
  g.fillStyle='#1a2547';g.beginPath();g.moveTo(-8,by+12);g.lineTo(-11-(air?3:0)-Math.abs(h.vx)/90,by+21);g.lineTo(-2,by+19);g.closePath();g.fill();
  g.fillStyle='#3ee8ff';g.fillRect(-1,by+6,2,2);g.fillStyle='#d9a441';g.fillRect(-8,by+13,16,2);
  // blade on back / arm
  if(h.atkT<=0){g.strokeStyle='#8ea3c9';g.lineWidth=2;g.beginPath();g.moveTo(-7,by+2);g.lineTo(-13,by-10);g.stroke();g.fillStyle='#d9a441';g.fillRect(-9,by-1,4,3)}
  g.strokeStyle='#24325e';g.lineWidth=4;g.beginPath();g.moveTo(3,by+5);if(h.atkT>0){const u=h.atkDir==='u',d=h.atkDir==='d';g.lineTo(u?4:d?5:12,u?by-10:d?by+20:by+6)}else if(h.heal>0)g.lineTo(9,by-3);else g.lineTo(5+Math.sin(rc+Math.PI)*3,by+13);g.stroke();
  // helmet
  const hy=by-9;g.fillStyle='#e9edf6';g.beginPath();g.arc(0,hy,10.5,0,6.283);g.fill();g.fillStyle='#c4ccdd';g.beginPath();g.arc(-2,hy+2,9,Math.PI*.6,Math.PI*1.4);g.fill();
  g.fillStyle='#0b1020';g.beginPath();if(g.roundRect)g.roundRect(-1,hy-4,11,7,3);else g.rect(-1,hy-4,11,7);g.fill();
  g.shadowColor='#3ee8ff';g.shadowBlur=10;g.fillStyle=h.inv>0?'#ff6b8b':'#3ee8ff';g.fillRect(2,hy-2,7,2.5);g.shadowBlur=0;
  g.strokeStyle='#9aa6c2';g.lineWidth=1.5;g.beginPath();g.moveTo(-4,hy-9);g.lineTo(-7,hy-16);g.stroke();g.fillStyle=Math.sin(LP.t*5)>0?'#46f08f':'#1b5a33';g.beginPath();g.arc(-7,hy-16,2,0,6.283);g.fill();
  g.restore();g.globalAlpha=1;
  // slash arc
  if(h.atkT>0){const k=1-h.atkT/.22,cx=h.x+h.w/2,cy=h.y+(h.crouch?28:20);g.save();g.translate(cx,cy);
    const rot=h.atkDir==='u'?-Math.PI/2:h.atkDir==='d'?Math.PI/2:(h.face>0?0:Math.PI);g.rotate(rot);if(h.atkDir==='f'&&h.face<0)g.scale(1,-1);
    const a0=-1.3+k*.5,a1=a0+2.2*Math.min(1,k*2.2),al=k<.7?1:1-(k-.7)/.3;g.globalAlpha=al;
    const gr=g.createLinearGradient(0,-40,0,40);gr.addColorStop(0,'rgba(62,232,255,0)');gr.addColorStop(.5,'#eaffff');gr.addColorStop(1,'rgba(62,232,255,.2)');
    g.fillStyle=gr;g.beginPath();g.arc(10,0,48,a0,a1);g.arc(2,0,32,a1,a0,true);g.closePath();g.fill();
    g.strokeStyle='#ffffff';g.lineWidth=2;g.beginPath();g.arc(10,0,48,a0,a1);g.stroke();g.restore();g.globalAlpha=1}
  if(h.heal>0){const k=h.heal/.8;g.strokeStyle=`rgba(125,255,216,${.3+k*.6})`;g.lineWidth=2;g.beginPath();g.arc(h.x+9,h.y+20,40-k*28,0,6.283);g.stroke()}}
LP.heroDraw=heroDraw;

/* ================= shared render ================= */
const lc=document.createElement('canvas');lc.width=VW;lc.height=VH;const lg=lc.getContext('2d');
const vig=document.createElement('canvas');vig.width=VW;vig.height=VH;{const g=vig.getContext('2d');const gr=g.createRadialGradient(VW/2,VH/2,VH*.35,VW/2,VH/2,VW*.7);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.75)');g.fillStyle=gr;g.fillRect(0,0,VW,VH)}
const motes=Array.from({length:50},()=>({x:Math.random()*VW,y:Math.random()*VH,z:.3+Math.random()*.9,p:Math.random()*6}));
LP.renderWorld=(g,drawActors)=>{const r=LP.room,Z=LP.ZONES[r.zone];LP.lights.length=0;
  const sx=(Math.random()-.5)*cam.shake,sy=(Math.random()-.5)*cam.shake,cx=Math.round(cam.x+sx),cy=Math.round(cam.y+sy);
  g.fillStyle=Z.bg;g.fillRect(0,0,VW,VH);
  g.save();g.translate(-((cam.x*.25)%480),-((cam.y*.25)%480));g.fillStyle=farPattern(r.zone);g.fillRect(0,0,VW+480,VH+480);g.restore();
  // mid deco
  g.save();g.translate(-cam.x*.55,-cam.y*.55+60);for(const d of r.deco){const base=r.h*T*.55+120;if(r.zone==='mb'){g.fillStyle=shade(Z.far,.04);g.fillRect(d.x,base-d.h,d.w,d.h);g.fillStyle=shade(Z.far,.12);g.beginPath();g.ellipse(d.x+d.w/2,base-d.h,d.w/2,8,0,0,6.283);g.fill();
      g.fillStyle='rgba(217,164,65,.08)';g.fillRect(d.x+4,base-d.h+16,d.w-8,4)}
    else{g.fillStyle=shade(Z.far,.02);for(let k=0;k<5;k++)g.fillRect(d.x+k*(d.w/5),base-d.h-(k%2)*20,d.w/5-4,d.h+(k%2)*20);g.fillStyle='rgba(255,120,40,.07)';g.fillRect(d.x,base-d.h-30,d.w,6)}}g.restore();
  g.save();g.translate(-cx,-cy);
  drawActors(g,'back');g.drawImage(r.canvas,0,0);
  if(r.pulses){g.fillStyle=Z.acc;for(const q of r.pulses){q.p=(q.p+q.sp*q.d*LP.DT+q.u.len)%q.u.len;const x=q.u.x+q.p,y=q.u.y;if(x<cx-40||x>cx+VW+40||y<cy-40||y>cy+VH+40)continue;g.globalAlpha=.9;g.fillRect(x-1,y-1,3,3);g.globalAlpha=.35;g.fillRect(x-q.d*10-4,y-.5,10,2);LP.light(x,y,46,.55)}g.globalAlpha=1}drawActors(g,'mid');drawParts(g,false);drawActors(g,'front');drawParts(g,true);
  g.restore();
  // lighting
  const dark=LP.darkOverride!=null?LP.darkOverride:Z.dark;if(dark>0){lg.globalCompositeOperation='source-over';lg.clearRect(0,0,VW,VH);lg.fillStyle=`rgba(0,0,0,${dark})`;lg.fillRect(0,0,VW,VH);lg.globalCompositeOperation='destination-out';
    const L=[{x:H.x+9,y:H.y+18,r:260,i:1},...LP.lights];for(const l of L){const x=l.x-cx,y=l.y-cy;if(x<-l.r||y<-l.r||x>VW+l.r||y>VH+l.r)continue;const gr=lg.createRadialGradient(x,y,0,x,y,l.r);gr.addColorStop(0,`rgba(0,0,0,${l.i})`);gr.addColorStop(1,'rgba(0,0,0,0)');lg.fillStyle=gr;lg.fillRect(x-l.r,y-l.r,l.r*2,l.r*2)}
    g.drawImage(lc,0,0)}
  // motes
  for(const m of motes){m.y-=m.z*12*LP.DT;m.x+=Math.sin(LP.t+m.p)*.2;if(m.y<-5)m.y=VH+5;const x=((m.x-cam.x*m.z*.3)%VW+VW)%VW,y=((m.y-cam.y*m.z*.3)%VH+VH)%VH;g.globalAlpha=.25+.35*Math.abs(Math.sin(LP.t*1.5+m.p));g.fillStyle=Z.mote;g.fillRect(x,y,m.z*2.4,m.z*2.4)}g.globalAlpha=1;
  g.drawImage(vig,0,0)};
LP.updParts=updParts;
})();
