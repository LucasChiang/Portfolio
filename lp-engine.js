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
const KEYMAP={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'jump',KeyW:'jump',ArrowDown:'down',KeyS:'down',Space:'attack',KeyE:'shoot',ShiftLeft:'dash',ShiftRight:'dash',KeyQ:'heal',KeyF:'parry',KeyM:'map',Tab:'map',KeyP:'pause',Escape:'pause',Enter:'confirm'};
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
  parryup:()=>tone(1600,2200,.06,'triangle',.04),parry:()=>{tone(2400,1800,.35,'triangle',.12);tone(3600,3000,.25,'sine',.08,.02);noise(.2,7000,2,.1)},heavy:()=>{noise(.16,2600,.7,.14);tone(500,140,.14,'sawtooth',.05)},crit:()=>{tone(180,60,.4,'square',.12);noise(.3,1200,.6,.2);tone(2000,900,.2,'triangle',.08)},
  roar:()=>{tone(70,45,1.4,'sawtooth',.18);tone(105,60,1.4,'sawtooth',.1);noise(1.3,500,.5,.18,0,'lowpass')},blip:()=>tone(1500,1500,.04,'sine',.04)
};
LP.sfx=k=>{try{SFX[k]&&SFX[k]()}catch(e){}};
/* the laugh: formant-filtered sawtooth "HA"s through an echo */
/* the laugh: two detuned, distorted voices through vowel formants, a growl underneath, a long cavern echo */
let dist=null,cave=null;
function laughBus(a){if(dist)return;dist=a.createWaveShaper();const n=2048,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i/n*2-1;c[i]=Math.tanh(x*3.2)}dist.curve=c;dist.oversample='2x';
  cave=a.createDelay(1.5);cave.delayTime.value=.33;const fb=a.createGain();fb.gain.value=.5;const lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1100;cave.connect(lp);lp.connect(fb);fb.connect(cave);const wet=a.createGain();wet.gain.value=.7;lp.connect(wet);wet.connect(sfxBus);
  dist.connect(sfxBus);dist.connect(cave)}
LP.laugh=(n,p,vol)=>{const a=ac();if(!a)return;laughBus(a);n=n||8;p=p||64;vol=vol||.5;const t0=a.currentTime+.03;
  // dread swell under the first syllable
  {const o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.setValueAtTime(48,t0);o.frequency.exponentialRampToValueAtTime(34,t0+1.6);g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(.35,t0+.15);g.gain.exponentialRampToValueAtTime(.0001,t0+1.8);o.connect(g);g.connect(sfxBus);o.start(t0);o.stop(t0+1.9)}
  let t=t0;for(let i=0;i<n;i++){const first=i===0,last=i===n-1,d=first?.55:last?.75:.2,f=p*(first?1:(1.1-i*.03))*(1+(Math.random()-.5)*.04);
    const mix=a.createGain();
    [[1,.9,'sawtooth'],[.503,.7,'sawtooth'],[1.012,.5,'square']].forEach(([m,gv,ty])=>{const o=a.createOscillator();o.type=ty;o.frequency.setValueAtTime(f*m*(first?.55:1.12),t);o.frequency.linearRampToValueAtTime(f*m,t+(first?.22:.05));o.frequency.linearRampToValueAtTime(f*m*(last?.55:.8),t+d);
      const vib=a.createOscillator(),vg=a.createGain();vib.frequency.value=first||last?6:0.01;vg.gain.value=f*m*.03;vib.connect(vg);vg.connect(o.frequency);const g=a.createGain();g.gain.value=gv;o.connect(g);g.connect(mix);o.start(t);vib.start(t);o.stop(t+d+.05);vib.stop(t+d+.05)});
    const env=a.createGain();env.gain.setValueAtTime(0,t);env.gain.linearRampToValueAtTime(vol,t+(first?.14:.02));env.gain.setValueAtTime(vol,t+d*.5);env.gain.exponentialRampToValueAtTime(.0001,t+d);
    (first?[[280,5,1.6],[620,6,1.3],[1000,7,.5]]:[[680,5,1.8],[1080,6,1.1],[2400,8,.35]]).forEach(([fr,q,gn])=>{const bp=a.createBiquadFilter();bp.type='bandpass';bp.frequency.value=fr;bp.Q.value=q;const gg=a.createGain();gg.gain.value=gn*2.4;mix.connect(bp);bp.connect(gg);gg.connect(env)});
    env.connect(dist);
    // throat growl
    noise(d*.95,240,1.5,vol*.35,t-a.currentTime,'lowpass');noise(d*.6,first?500:1300,1.4,vol*.14,t-a.currentTime);
    t+=first?.62:.24+Math.random()*.03}};

/* music: tiny step sequencer */
const TRK={
  title:{bpm:76,root:45,prog:[0,-4,3,-2],bass:'x.......x..x....',arp:'x.x.x.x.x.x.x.x.',kick:'',hat:'',snare:'',pad:1,arpType:'triangle',arpOct:2},
  mb:{bpm:92,root:43,prog:[0,0,-4,-2],bass:'x..x..x.x..x..x.',arp:'x..x.x..x..x.x..',kick:'x.......x.......',hat:'....x.......x...',snare:'',pad:1,arpType:'triangle',arpOct:2},
  cpu:{bpm:118,root:40,prog:[0,1,-2,0],bass:'x.x.x.x.x.x.x.xx',arp:'xxx.xxx.xxx.x.x.',kick:'x...x...x...x...',hat:'..x...x...x...x.',snare:'',pad:0,arpType:'square',arpOct:2},
  boss:{bpm:148,root:38,prog:[0,0,1,-1],bass:'x.xx.xx.x.xx.x.x',arp:'x.x.xx.xx.x.xx.x',kick:'x..x..x.x..x..x.',hat:'.x.x.x.x.x.x.x.x',snare:'....x.......x...',pad:0,arpType:'sawtooth',arpOct:2},
  boss2:{bpm:162,root:40,prog:[0,3,1,-2],bass:'xx.xx.x.xx.xx.x.',arp:'xxxx.x.xxxxx.x.x',kick:'x.x...x.x.x...x.',hat:'xxxxxxxxxxxxxxxx',snare:'....x..x....x...',pad:0,arpType:'square',arpOct:3},
  quiet:{bpm:60,root:45,prog:[0],bass:'',arp:'',kick:'',hat:'',snare:'',pad:1,arpType:'sine',arpOct:2}
};
LP.TRK=TRK;
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
  g.strokeStyle=Z.far;g.lineWidth=4;for(let i=0;i<22;i++){let x=R()*480,y=R()*480;g.beginPath();g.moveTo(x,y);for(let k=0;k<3;k++){const cx=x+(R()-.5)*160,cy=y+(R()-.5)*160;x+=(R()-.5)*180;y+=(R()-.5)*180;g.quadraticCurveTo(cx,cy,x,y)}g.stroke();g.fillStyle=Z.far;g.beginPath();g.arc(x,y,6,0,6.283);g.fill()}
  for(let i=0;i<26;i++){const x=R()*480,y=R()*480,rr=6+R()*34;const gr=g.createRadialGradient(x,y,0,x,y,rr);gr.addColorStop(0,LP.shade(Z.far,.12));gr.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=.6;g.fillStyle=gr;g.beginPath();g.arc(x,y,rr,0,6.283);g.fill()}g.globalAlpha=1;
  return patCache[z]=g.createPattern(c,'repeat')}

/* ================= rooms ================= */
LP.rooms={};LP.room=null;LP.ents=[];LP.plats=[];LP.shots=[];
// tiles: 0 empty, 1 solid, 2 one-way, 3 spike, 4 sealed barrier, 5 gate (closed)
LP.defRoom=(id,zone,wx,wy,w,h,build,meta)=>{const r={id,zone,wx,wy,w,h,grid:new Uint8Array(w*h),spawns:[],props:[],meta:meta||{}};
  const set=(x,y,v)=>{if(x>=0&&y>=0&&x<w&&y<h)r.grid[y*w+x]=v};
  const api={
    border(open){open=open||{};const inR=(side,i)=>{const o=open[side];if(!o)return false;const L=Array.isArray(o[0])?o:[o];return L.some(([a,b])=>i>=a&&i<=b)};
      for(let x=0;x<w;x++){if(!inR('T',x))set(x,0,1);if(!inR('B',x))set(x,h-1,1)}for(let y=0;y<h;y++){if(!inR('L',y))set(0,y,1);if(!inR('R',y))set(w-1,y,1)}},
    solid(x,y,ww,hh){for(let i=0;i<ww;i++)for(let j=0;j<hh;j++)set(x+i,y+j,1)},clear(x,y,ww,hh){for(let i=0;i<ww;i++)for(let j=0;j<hh;j++)set(x+i,y+j,0)},
    plat(x,y,n){for(let i=0;i<n;i++)set(x+i,y,2)},spikes(x,y,n){for(let i=0;i<n;i++)set(x+i,y,3)},barrier(x,y,ww,hh){for(let i=0;i<ww;i++)for(let j=0;j<hh;j++)set(x+i,y+j,4)},
    ent(type,x,y,o){r.spawns.push(Object.assign({type,tx:x,ty:y},o||{}))},
    prop(k,x,y,o){r.props.push(Object.assign({k,x,y},o||{}))},crack(x,y,ww,hh){for(let i=0;i<ww;i++)for(let j=0;j<hh;j++)set(x+i,y+j,6)}};
  build(api);r.grid0=r.grid.slice();r.hasCrack=r.grid.includes(6);LP.rooms[id]=r;return r};
const tileAt=(tx,ty)=>{const r=LP.room;tx=clamp(tx,0,r.w-1);ty=clamp(ty,0,r.h-1);return r.grid[ty*r.w+tx]};
LP.tile=tileAt;LP.setTile=(tx,ty,v)=>{const r=LP.room;if(tx>=0&&ty>=0&&tx<r.w&&ty<r.h)r.grid[ty*r.w+tx]=v};
const isSolid=t=>t===1||t===4||t===5||t===6;LP.isSolid=isSolid;
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
LP.breakCracked=(tx,ty)=>{const r=LP.room,q=[[tx,ty]],seen=new Set();let n=0;while(q.length&&n<14){const [x,y]=q.shift(),k=x+','+y;if(seen.has(k)||x<0||y<0||x>=r.w||y>=r.h||r.grid[y*r.w+x]!==6)continue;seen.add(k);r.grid[y*r.w+x]=0;n++;
    if(LP.save){LP.save.broken=LP.save.broken||{};LP.save.broken[r.id+':'+x+','+y]=1}for(let i=0;i<6;i++)LP.part({x:x*T+15,y:y*T+15,vx:rand(-200,200),vy:rand(-260,-40),g:900,life:rand(.5,1),k:'shard',s:rand(3,6),col:LP.ZONES[r.zone].tileHi,vr:rand(-10,10)});q.push([x+1,y],[x-1,y],[x,y+1])}
  if(n){LP.sfx('boom');LP.shake(10);LP.buildRoomCanvas(r)}return n};
LP.overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
LP.boxHitsSpike=(x,y,w,h)=>{for(let tx=Math.floor(x/T);tx<=Math.floor((x+w-.01)/T);tx++)for(let ty=Math.floor(y/T);ty<=Math.floor((y+h-.01)/T);ty++)if(tileAt(tx,ty)===3){const sy=ty*T+T*.4;if(y+h>sy)return true}return false};

/* pre-render a room: organic terrain built from a smoothed field, so the 30px grid never shows */
LP.buildRoomCanvas=r=>{const Z=LP.ZONES[r.zone],RW=r.w*T,RH=r.h*T,c=document.createElement('canvas');c.width=RW;c.height=RH;const g=c.getContext('2d');let s=r.wx*131+r.wy*71+7;const R=()=>{s=(s*16807)%2147483647;return s/2147483647};
  const at=(x,y)=>{if(x<0||y<0||x>=r.w||y>=r.h){x=clamp(x,0,r.w-1);y=clamp(y,0,r.h-1)}return r.grid[y*r.w+x]};const S=(x,y)=>{const t=at(x,y);return t===1||t===6||t===4};
  if(LP.paintProps){let s2=r.wx*97+r.wy*31+5;LP.paintProps(g,r,()=>{s2=(s2*16807)%2147483647;return s2/2147483647})}
  // 1) sample the solid mask on a fine lattice and blur it into a soft field
  const C=5,cw=Math.ceil(RW/C)+1,ch=Math.ceil(RH/C)+1;let f=new Float32Array(cw*ch);
  for(let j=0;j<ch;j++)for(let i=0;i<cw;i++)f[j*cw+i]=S(Math.floor((i*C-.01)/T+.0001),Math.floor((j*C-.01)/T+.0001))?1:0;
  const blur=(src,k)=>{const tmp=new Float32Array(src.length),out=new Float32Array(src.length),n=2*k+1;
    for(let j=0;j<ch;j++){let acc=0;for(let i=-k;i<=k;i++)acc+=src[j*cw+clamp(i,0,cw-1)];for(let i=0;i<cw;i++){tmp[j*cw+i]=acc/n;acc+=src[j*cw+clamp(i+k+1,0,cw-1)]-src[j*cw+clamp(i-k,0,cw-1)]}}
    for(let i=0;i<cw;i++){let acc=0;for(let j=-k;j<=k;j++)acc+=tmp[clamp(j,0,ch-1)*cw+i];for(let j=0;j<ch;j++){out[j*cw+i]=acc/n;acc+=tmp[clamp(j+k+1,0,ch-1)*cw+i]-tmp[clamp(j-k,0,ch-1)*cw+i]}}return out};
  f=blur(blur(f,2),2);
  // a little noise along the edges so nothing is perfectly straight
  for(let j=0;j<ch;j++)for(let i=0;i<cw;i++){const v=f[j*cw+i];if(v>.15&&v<.85)f[j*cw+i]+=(Math.sin(i*.37+j*.11+r.wx)*.5+Math.sin(i*.13-j*.29+r.wy)*.5)*.09}
  // 2) marching squares → one filled path + the outline segments with their normals
  const P=new Path2D(),seg=[];const F=(i,j)=>f[j*cw+i],lerpE=(a,b)=>(0.5-a)/(b-a);
  for(let j=0;j<ch-1;j++){let run=-1;for(let i=0;i<cw-1;i++){const a=F(i,j),b=F(i+1,j),cc=F(i+1,j+1),d=F(i,j+1),k=(a>=.5?8:0)|(b>=.5?4:0)|(cc>=.5?2:0)|(d>=.5?1:0),x=i*C,y=j*C;
      if(k===15){if(run<0)run=x;continue}if(run>=0){P.rect(run,y,x-run+.5,C+.5);run=-1}if(k===0)continue;
      const T_=[x+C*lerpE(a,b),y],Rt=[x+C,y+C*lerpE(b,cc)],B=[x+C*lerpE(d,cc),y+C],L=[x,y+C*lerpE(a,d)],TL=[x,y],TR=[x+C,y],BR=[x+C,y+C],BL=[x,y+C];
      const poly={1:[L,B,BL],2:[B,Rt,BR],3:[L,Rt,BR,BL],4:[T_,TR,Rt],5:[L,T_,TR,Rt,B,BL],6:[T_,TR,BR,B],7:[L,T_,TR,BR,BL],8:[TL,T_,L],9:[TL,T_,B,BL],10:[TL,T_,Rt,BR,B,L],11:[TL,T_,Rt,BR,BL],12:[TL,TR,Rt,L],13:[TL,TR,Rt,B,BL],14:[TL,TR,BR,B,L]}[k];
      P.moveTo(poly[0][0],poly[0][1]);for(let q=1;q<poly.length;q++)P.lineTo(poly[q][0],poly[q][1]);P.closePath();
      const lines={1:[L,B],2:[B,Rt],3:[L,Rt],4:[T_,Rt],5:[L,T_,Rt,B],6:[T_,B],7:[L,T_],8:[T_,L],9:[T_,B],10:[T_,Rt,B,L],11:[T_,Rt],12:[L,Rt],13:[Rt,B],14:[B,L]}[k];
      for(let q=0;q<lines.length;q+=2){const p0=lines[q],p1=lines[q+1];const gx=(b+cc)-(a+d),gy=(d+cc)-(a+b),gl=Math.hypot(gx,gy)||1;seg.push({x0:p0[0],y0:p0[1],x1:p1[0],y1:p1[1],nx:-gx/gl,ny:-gy/gl})}}
    if(run>=0)P.rect(run,j*C,(cw-1)*C-run+.5,C+.5)}
  // 3) textured fill clipped to the shape
  g.save();g.clip(P);const bg=g.createLinearGradient(0,0,0,RH);bg.addColorStop(0,shade(Z.tile,-.15));bg.addColorStop(1,shade(Z.tile,-.4));g.fillStyle=bg;g.fillRect(0,0,RW,RH);
  for(let i=0;i<RW*RH/2600;i++){const x=R()*RW,y=R()*RH,rr=4+R()*18;g.fillStyle=R()<.5?shade(Z.tile,.06+R()*.08):shade(Z.tile,-.45);g.globalAlpha=.55;g.beginPath();g.ellipse(x,y,rr,rr*(.5+R()*.5),R()*3,0,6.283);g.fill()}g.globalAlpha=1;
  g.strokeStyle=shade(Z.edge,-.62);g.lineWidth=2;g.lineCap='round';for(let i=0;i<RW*RH/22000;i++){let x=R()*RW,y=R()*RH;g.beginPath();g.moveTo(x,y);for(let k=0;k<3;k++){const cx=x+(R()-.5)*80,cy=y+(R()-.5)*80;x+=(R()-.5)*110;y+=(R()-.5)*110;g.quadraticCurveTo(cx,cy,x,y)}g.stroke();g.fillStyle=shade(Z.edge,-.5);g.beginPath();g.arc(x,y,3,0,6.283);g.fill()}
  // lit rim just inside every edge, brighter on top surfaces
  g.lineCap='round';for(const q of seg){const top=q.ny<-.5;g.strokeStyle=top?Z.tileHi:shade(Z.tile,.05);g.globalAlpha=top?.9:.45;g.lineWidth=top?14:8;g.beginPath();g.moveTo(q.x0-q.nx*5,q.y0-q.ny*5);g.lineTo(q.x1-q.nx*5,q.y1-q.ny*5);g.stroke()}g.globalAlpha=1;
  g.restore();
  // edge line and glow along walkable tops
  g.lineCap='round';for(const q of seg){const top=q.ny<-.5;g.strokeStyle=top?Z.edge:shade(Z.tile,-.5);g.lineWidth=top?2.2:1.5;g.globalAlpha=top?.85:.7;g.beginPath();g.moveTo(q.x0,q.y0);g.lineTo(q.x1,q.y1);g.stroke()}g.globalAlpha=1;
  // 4) life on the surfaces: moss/lichen on tops, roots and drips under ceilings
  const tops=seg.filter(q=>q.ny<-.6),bots=seg.filter(q=>q.ny>.6);
  for(const q of tops){if(R()>.22)continue;const x=q.x0,y=q.y0;
    if(r.zone==='mb'){g.fillStyle=pick(['#3f7a3a','#5aa04a','#2e5a2a']);for(let k=0;k<3;k++){g.beginPath();g.ellipse(x+(R()-.5)*10,y+1,3+R()*4,2+R()*2.5,0,Math.PI,0);g.fill()}if(R()<.3){g.fillStyle='#b9ffcc';g.beginPath();g.arc(x,y-3,1.3,0,6.283);g.fill()}}
    else if(r.zone==='cpu'){g.fillStyle=R()<.5?'#2a0d06':'#4a1a08';g.beginPath();g.ellipse(x,y+1,4+R()*5,2,0,Math.PI,0);g.fill();if(R()<.25){g.fillStyle='#ff8a3e';g.beginPath();g.arc(x,y-1,1.4,0,6.283);g.fill()}}
    else if(r.zone==='ram'){if(R()<.5){g.fillStyle='rgba(184,240,255,.7)';g.beginPath();g.ellipse(x,y-3,2.4,5+R()*4,(R()-.5)*.6,0,6.283);g.fill()}else{g.fillStyle='#24345e';g.beginPath();g.ellipse(x,y+1,5,2.5,0,Math.PI,0);g.fill()}}
    else{g.fillStyle=R()<.5?'#3a4252':'#2a303c';g.beginPath();g.ellipse(x,y,3+R()*4,2+R()*2,0,Math.PI,0);g.fill()}}
  g.strokeStyle=r.zone==='mb'?'rgba(60,90,50,.8)':r.zone==='cpu'?'rgba(60,20,10,.8)':r.zone==='ram'?'rgba(127,216,255,.35)':'rgba(120,130,150,.35)';g.lineWidth=1.4;
  for(const q of bots){if(R()>.12)continue;const L=8+R()*30;g.beginPath();g.moveTo(q.x0,q.y0);g.quadraticCurveTo(q.x0+(R()-.5)*14,q.y0+L*.6,q.x0+(R()-.5)*8,q.y0+L);g.stroke()}
  // cracked tiles
  for(let y=0;y<r.h;y++)for(let x=0;x<r.w;x++)if(r.grid[y*r.w+x]===6){const px=x*T,py=y*T;g.strokeStyle='rgba(0,0,0,.75)';g.lineWidth=2;g.beginPath();g.moveTo(px+4,py+5);g.quadraticCurveTo(px+12,py+10,px+13,py+15);g.lineTo(px+8,py+25);g.moveTo(px+13,py+15);g.quadraticCurveTo(px+20,py+10,px+26,py+11);g.moveTo(px+18,py+20);g.lineTo(px+25,py+27);g.stroke()}
  // 5) one-way ledges as rounded slabs with roots, thorns as curved spines
  for(let y=0;y<r.h;y++){let x0=-1;for(let x=0;x<=r.w;x++){const on=x<r.w&&r.grid[y*r.w+x]===2;if(on&&x0<0)x0=x;if(!on&&x0>=0){const px=x0*T-2,w=(x-x0)*T+4,py=y*T;
      g.fillStyle=shade(Z.tile,.05);g.beginPath();g.moveTo(px+6,py);g.lineTo(px+w-6,py);g.quadraticCurveTo(px+w+2,py+1,px+w-4,py+8);g.quadraticCurveTo(px+w/2,py+15,px+4,py+8);g.quadraticCurveTo(px-2,py+1,px+6,py);g.fill();
      g.strokeStyle=Z.edge;g.lineWidth=2;g.lineCap='round';g.beginPath();g.moveTo(px+5,py+1);g.lineTo(px+w-5,py+1);g.stroke();
      g.strokeStyle=shade(Z.tile,-.3);g.lineWidth=1.3;for(let k=0;k<Math.ceil(w/26);k++){const rx=px+8+R()*(w-16),L=10+R()*22;g.beginPath();g.moveTo(rx,py+9);g.quadraticCurveTo(rx+(R()-.5)*12,py+9+L*.6,rx+(R()-.5)*6,py+9+L);g.stroke()}x0=-1}}}
  for(let y=0;y<r.h;y++)for(let x=0;x<r.w;x++)if(r.grid[y*r.w+x]===3){const px=x*T,py=y*T,down=S(x,y-1)&&!S(x,y+1);
    g.fillStyle=shade(Z.spike,-.55);g.beginPath();g.ellipse(px+15,down?py+2:py+T,17,7,0,0,6.283);g.fill();
    for(let k=0;k<4;k++){const bx=px+3+k*7+R()*3,h=12+R()*14,lean=(R()-.5)*8,dir=down?1:-1,by=down?py:py+T;const gr=g.createLinearGradient(0,by,0,by+dir*h);gr.addColorStop(0,shade(Z.spike,-.4));gr.addColorStop(1,shade(Z.spike,.35));g.fillStyle=gr;
      g.beginPath();g.moveTo(bx-3,by);g.quadraticCurveTo(bx-2+lean*.3,by+dir*h*.6,bx+lean,by+dir*h);g.quadraticCurveTo(bx+2+lean*.3,by+dir*h*.6,bx+3.5,by);g.closePath();g.fill()}}
  r.canvas=c;
  const runs=[];for(let y=1;y<r.h;y++){let x0=-1;for(let x=0;x<=r.w;x++){const ok=x<r.w&&S(x,y)&&!S(x,y-1)&&at(x,y-1)!==3&&at(x,y-1)!==2;if(ok&&x0<0)x0=x;if(!ok&&x0>=0){if(x-x0>=4)runs.push({x:x0*T+12,y:y*T,len:(x-x0)*T-24});x0=-1}}}
  r.pulses=runs.filter(u=>u.len>40).map(u=>({u,p:R()*u.len,sp:60+R()*90,d:R()<.5?1:-1}));
  // background silhouettes: rolling hills and rounded shapes, two depths
  const hills=[];for(let L=0;L<2;L++){const pts=[],amp=L?70:110,base=L?.62:.5,ph=R()*9;for(let x=-200;x<=RW*.8+VW;x+=40)pts.push([x,base*RH+amp*Math.sin(x*.004+ph)*.6+amp*.4*Math.sin(x*.011+ph*2)]);
    const blobs=[];for(let i=0;i<Math.ceil(RW/260)+3;i++)blobs.push({x:i*240+R()*120-120,w:40+R()*90,h:80+R()*200,k:R()});hills.push({pts,blobs})}r.deco=hills};

function shade(hex,amt){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=amt<0?0:255,p=Math.abs(amt);r=Math.round((f-r)*p+r);g=Math.round((f-g)*p+g);b=Math.round((f-b)*p+b);return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}
LP.shade=shade;

/* ================= hero ================= */
const H=LP.H={x:0,y:0,w:18,h:40,vx:0,vy:0,face:1,hearts:3,charge:0,inv:0};
const PHY={run:270,acc:3200,air:2300,grav:2200,fall:900,jump:730,dj:640,coyote:.1,buf:.12,dash:820,dashT:.17,dashCD:.45,wslide:150,wjx:340,wjy:700,pogo:640};
LP.PHY=PHY;
LP.heroReset=(x,y)=>{Object.assign(H,{x,y,vx:0,vy:0,ground:false,coyote:0,jbuf:0,dashT:0,dashCD:0,airDash:true,canDJ:true,wall:0,atkT:0,atkCD:0,atkDir:'f',kb:0,heal:0,crouch:false,
  dead:false,ctrl:true,drop:0,shotCD:0,slamT:0,combo:0,comboT:0,atkK:'r',atkDur:.22,atkDmg:1,diveT:0,parryT:0,parryCD:0,critT:0,slowT:0,pull:0,run:0,sq:1,land:0,after:[],lastSafe:{x,y},safeT:0,hazT:0,deadT:0,inv:0,wallT:0,stun:0});
  H.scarf=[];for(let i=0;i<9;i++)H.scarf.push({x:x+9,y:y+8,px:x+9,py:y+8})};
LP.heroReset(100,100);
LP.abil={};
const hb=()=>({x:H.x,y:H.y+(H.crouch?14:0),w:H.w,h:H.crouch?26:H.h});LP.heroBox=hb;

LP.hurtHero=(fromX,dmg,noParry)=>{if(H.dead)return false;if(H.parryT>0&&!noParry){LP.parried&&LP.parried(fromX);return false}if(H.inv>0||LP.godMode)return false;H.hearts-=dmg||1;H.inv=1.3;H.kb=.2;H.dashT=0;H.heal=0;const d=H.x+H.w/2<fromX?-1:1;H.vx=d*330;H.vy=-430;LP.stop(.16);LP.shake(14);LP.sfx('hurt');LP.flash={c:'rgba(255,40,70,',t:.35,m:.35};
  LP.burst(H.x+9,H.y+20,18,'#ff4f6b',380);LP.onHurt&&LP.onHurt();if(H.hearts<=0)LP.killHero();return true};
LP.hazardHero=()=>{if(H.dead||H.hazT>0)return;const hurt=LP.hurtHero(H.x+H.w/2,1,true);if(H.dead)return;LP.sfx('spike');H.hazT=.5;H.ctrl=false;H.vx=0;H.vy=0;LP.fade={t:0,d:.5}};
LP.killHero=()=>{H.hearts=0;H.dead=true;H.deadT=0;H.ctrl=false;LP.sfx('death');LP.stop(.3);LP.shake(18);
  for(let i=0;i<40;i++)LP.part({x:H.x+9+rand(-8,8),y:H.y+20+rand(-18,18),vx:rand(-320,320),vy:rand(-520,-80),g:900,life:rand(.8,1.6),k:'shard',s:rand(3,7),col:pick(['#e8ecf5','#3ee8ff','#26335c']),vr:rand(-12,12),drag:.5})};

function heroUpdate(dt){const h=H,ab=LP.abil;
  if(h.dead){h.deadT+=dt;return}
  if(!h.atkDur)h.atkDur=.22;
  if(h.frozen){scarfStep(dt);return}
  h.inv=Math.max(0,h.inv-dt);h.atkCD-=dt;h.dashCD-=dt;h.shotCD-=dt;h.drop=Math.max(0,h.drop-dt);h.land=Math.max(0,h.land-dt);
  if(h.hazT>0){h.hazT-=dt;if(h.hazT<=.25&&!h._hzMoved){h._hzMoved=true;h.x=h.lastSafe.x;h.y=h.lastSafe.y;{const fy=Math.floor((h.y+h.h+2)/T),ok=x=>isSolid(tileAt(Math.floor((x+9)/T),fy))&&!isSolid(tileAt(Math.floor((x+9)/T),fy-1));if(!ok(h.x)){for(let d=1;d<40;d++){if(ok(h.x+d*T)){h.x+=d*T;break}if(ok(h.x-d*T)){h.x-=d*T;break}}}}h.vx=h.vy=0;LP.camUpdate(0,true)}if(h.hazT<=0){h._hzMoved=false;h.ctrl=true}scarfStep(dt);return}
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
    h.slowT=Math.max(0,(h.slowT||0)-dt);if(!h.kb){const target=h.crouch?0:move*PHY.run*(h.slowT>0?.45:1);h.vx=appr(h.vx,target,(h.ground?PHY.acc:PHY.air)*dt)}
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
  // Hard Reset: slam down from mid-air
  if(ht.dash&&ab.slam&&hi.down&&!h.ground&&!h.slamT&&!h.kb){h.slamT=1;h.dashT=0;h.vx=0;h.vy=1350;h.inv=Math.max(h.inv,.15);LP.sfx('whoosh');ht.dash=false}
  if(h.slamT){h.vx=0;h.vy=1350;h.dashT=0;if(Math.random()<.8)h.after.push({x:h.x,y:h.y,face:h.face,t:0,c:false});
    const fy=Math.floor((h.y+h.h+h.vy*dt)/T);for(let tx=Math.floor((h.x+1)/T);tx<=Math.floor((h.x+h.w-1)/T);tx++)if(tileAt(tx,fy)===6)LP.breakCracked(tx,fy)}
  // dash
  if(ht.dash&&ab.dash&&h.dashCD<=0&&(h.ground||h.airDash)&&!h.kb){if(move)h.face=move;h.dashT=PHY.dashT;h.dashCD=PHY.dashCD;if(!h.ground)h.airDash=false;h.atkT=0;LP.sfx('dash');LP.shake(3);
    for(let i=0;i<8;i++)LP.part({x:h.x+9,y:h.y+rand(5,38),vx:-h.face*rand(100,300),vy:rand(-20,20),life:.3,col:'#7df0ff',s:2,k:'spark'})}
  // parry: a short window that turns a hit into an opening
  h.parryT=Math.max(0,h.parryT-dt);h.parryCD-=dt;h.critT=Math.max(0,h.critT-dt);
  if(ht.parry&&h.parryCD<=0&&!h.heal&&h.dashT<=0){h.parryT=.2;h.parryCD=.55;h.atkT=0;LP.sfx('parryup')}
  // attack: right slash → left slash → full slash → low slash → rising slash
  h.comboT-=dt;
  if(ht.attack&&h.atkCD<=0&&h.dashT<=0&&!h.diveT){h.atkHit=new Set();h.atkId=(h.atkId||0)+1;
    if(hi.down&&!h.ground){h.atkDir='d';h.atkK='d';h.atkDur=.22;h.atkT=.22;h.atkCD=.3;h.atkDmg=1;h.combo=0;LP.sfx('slash')}
    else if((hi.jump&&!h.ground)&&h.combo!==4){h.atkDir='u';h.atkK='u';h.atkDur=.22;h.atkT=.22;h.atkCD=.3;h.atkDmg=1;h.combo=0;LP.sfx('slash')}
    else{const step=h.comboT>0&&h.combo<5?h.combo+1:1;h.combo=step;const K=['r','l','full','low','rise'][step-1];h.atkK=K;h.atkDir=K==='rise'?'u':'f';
      const D={r:[.2,.2,1],l:[.2,.2,1],full:[.32,.36,2.5],low:[.2,.2,1],rise:[.26,.3,1.5]}[K];h.atkDur=D[0];h.atkT=D[0];h.atkCD=D[1];h.atkDmg=D[2];h.comboT=D[1]+.38;
      if(K==='full'){LP.sfx('heavy');if(!h.ground){h.diveT=1;h.vy=950;h.vx=h.face*90;h.atkT=.5;h.atkDur=.5}else{h.vx+=h.face*160;LP.shake(3)}}
      else if(K==='rise'){LP.sfx('slash');if(h.ground){h.vy=-460;h.ground=false}}
      else{LP.sfx('slash');if(h.ground)h.vx+=h.face*60}
      if(step===5)h.comboT=0}}
  if(h.diveT){h.vy=Math.max(h.vy,950);h.atkT=Math.max(h.atkT,.1);if(Math.random()<.8)h.after.push({x:h.x,y:h.y,face:h.face,t:0,c:false})}
  // shoot (Packet Shot)
  if(ht.shoot&&ab.shot&&h.shotCD<=0){if(h.charge>=22){h.charge-=22;h.shotCD=.35;LP.sfx('shoot');h.vx-=h.face*120;
      LP.shots.push({x:h.x+9+h.face*14,y:h.y+(h.crouch?24:18),vx:h.face*760,vy:0,r:9,mine:true,dmg:2.5,life:1.4,col:'#3ee8ff',k:'packet',hit:new Set()})}
    else{LP.text(h.x+9,h.y-8,'LOW CHARGE','#7a8bb5',{s:10,life:.6})}}
  h.atkT=Math.max(0,h.atkT-dt);
  // move
  const wasAir=!h.ground,fallV=h.vy;
  const box=hb();const yOff=box.y-h.y,hh=box.h;const pull=h.pull||0;const body={x:h.x,y:h.y+yOff,w:h.w,h:hh,vx:h.vx+pull,vy:h.vy,drop:h.drop>0,ground:h.ground};
  LP.moveBody(body,dt);h.x=body.x;h.y=body.y-yOff;h.vx=body.hitWall?0:body.vx-pull;h.vy=body.vy;h.ground=body.ground;h.groundOneWay=body.groundOneWay;h.onPlat=body.onPlat;
  if(h.dashT>0&&body.hitWall)h.dashT=0;
  if(h.ground&&h.diveT){h.diveT=0;h.atkT=0;LP.sfx('thud');LP.shake(9);LP.stop(.04);LP.burst(h.x+9,h.y+h.h,18,'#eaffff',360,{g:600});LP.part({x:h.x+9,y:h.y+h.h,k:'ring',col:'#eaffff',s:6,grow:300,life:.25,w:3});LP.onDive&&LP.onDive(h.x+9,h.y+h.h)}
  if(h.ground&&h.slamT){h.slamT=0;LP.sfx('boom');LP.shake(14);LP.stop(.06);LP.burst(h.x+9,h.y+h.h,26,'#7df0ff',420,{g:600});LP.part({x:h.x+9,y:h.y+h.h,k:'ring',col:'#7df0ff',s:8,grow:420,life:.3,w:4});LP.onSlam&&LP.onSlam(h.x+9,h.y+h.h)}
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
LP.atkBox=()=>{const h=H;if(h.atkT<=.06&&!h.diveT)return null;const cx=h.x+h.w/2,cy=h.y+(h.crouch?28:20),K=h.atkK,f=h.face;
  if(h.diveT)return{x:cx-40,y:h.y-10,w:80,h:h.h+46};
  if(K==='u')return{x:cx-32,y:h.y-52,w:64,h:62};if(K==='d')return{x:cx-28,y:h.y+h.h-8,w:56,h:56};
  if(K==='full')return{x:cx-80,y:cy-46,w:160,h:80};if(K==='low')return{x:f>0?cx-6:cx-72,y:h.y+h.h-30,w:78,h:34};if(K==='rise')return{x:f>0?cx-10:cx-48,y:h.y-56,w:58,h:90};
  return{x:f>0?cx:cx-62,y:cy-26,w:62,h:52}};

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
  g.strokeStyle='#24325e';g.lineWidth=4;g.beginPath();g.moveTo(3,by+5);if(h.parryT>0)g.lineTo(13,by);else if(h.atkT>0){const u=h.atkDir==='u',d=h.atkDir==='d'||h.diveT,lo=h.atkK==='low';g.lineTo(u?4:d?5:12,u?by-10:d?by+20:lo?by+16:by+6)}else if(h.heal>0)g.lineTo(9,by-3);else g.lineTo(5+Math.sin(rc+Math.PI)*3,by+13);g.stroke();
  // helmet
  const hy=by-9;g.fillStyle='#e9edf6';g.beginPath();g.arc(0,hy,10.5,0,6.283);g.fill();g.fillStyle='#c4ccdd';g.beginPath();g.arc(-2,hy+2,9,Math.PI*.6,Math.PI*1.4);g.fill();
  g.fillStyle='#0b1020';g.beginPath();if(g.roundRect)g.roundRect(-1,hy-4,11,7,3);else g.rect(-1,hy-4,11,7);g.fill();
  g.shadowColor='#3ee8ff';g.shadowBlur=10;g.fillStyle=h.inv>0?'#ff6b8b':'#3ee8ff';g.fillRect(2,hy-2,7,2.5);g.shadowBlur=0;
  g.strokeStyle='#9aa6c2';g.lineWidth=1.5;g.beginPath();g.moveTo(-4,hy-9);g.lineTo(-7,hy-16);g.stroke();g.fillStyle=Math.sin(LP.t*5)>0?'#46f08f':'#1b5a33';g.beginPath();g.arc(-7,hy-16,2,0,6.283);g.fill();
  g.restore();g.globalAlpha=1;
  // slash arc
  if(h.atkT>0||h.diveT){const K=h.atkK,k=h.diveT?.5:1-h.atkT/h.atkDur,cx=h.x+h.w/2,cy=h.y+(h.crouch?28:20),crit=h.critT>0;g.save();g.translate(cx,cy);
    const col=crit?'#fff3b0':'#eaffff',edge=crit?'rgba(255,200,80,':'rgba(62,232,255,';
    const arc=(R0,R1,a0,a1,al)=>{g.globalAlpha=al;const gr=g.createRadialGradient(0,0,R1*.6,0,0,R0);gr.addColorStop(0,edge+'0)');gr.addColorStop(.7,col);gr.addColorStop(1,edge+'.3)');g.fillStyle=gr;g.beginPath();g.arc(0,0,R0,a0,a1,a1<a0);g.arc(0,0,R1,a1,a0,a1>a0);g.closePath();g.fill();g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.arc(0,0,R0,a0,a1,a1<a0);g.stroke()};
    const al=k<.7?1:1-(k-.7)/.3,sp=Math.min(1,k*2.4);g.scale(h.face,1);
    if(h.diveT){g.globalAlpha=.85;const gr=g.createLinearGradient(0,-50,0,50);gr.addColorStop(0,edge+'0)');gr.addColorStop(1,col);g.fillStyle=gr;g.beginPath();g.moveTo(-30,-40);g.quadraticCurveTo(0,70,30,-40);g.quadraticCurveTo(0,30,-30,-40);g.fill()}
    else if(K==='u'){g.rotate(-Math.PI/2);arc(50,32,-1.1,-1.1+2.2*sp,al)}else if(K==='d'){g.rotate(Math.PI/2);arc(50,32,-1.1,-1.1+2.2*sp,al)}
    else if(K==='r')arc(50,32,-1.3,-1.3+2.4*sp,al);else if(K==='l')arc(50,32,1.3,1.3-2.4*sp,al);
    else if(K==='full'){arc(70,44,-2.6,-2.6+5.6*sp,al);g.globalAlpha=al*.5;g.strokeStyle=col;g.lineWidth=1;g.beginPath();g.arc(0,0,78,-2.6,-2.6+5.6*sp);g.stroke()}
    else if(K==='low'){g.translate(0,16);g.scale(1,.45);arc(64,40,.4,.4-2.2*sp,al)}else if(K==='rise'){g.rotate(-.5);arc(56,34,1.6,1.6-3*sp,al)}
    g.restore();g.globalAlpha=1}
  if(h.parryT>0){const k=1-h.parryT/.2,cx=h.x+h.w/2+h.face*12,cy=h.y+16;g.save();g.strokeStyle=`rgba(255,240,190,${1-k})`;g.lineWidth=3;g.beginPath();g.arc(cx,cy,14+k*16,-1.9,1.9);g.stroke();g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.moveTo(cx,cy-22);g.lineTo(cx,cy+18);g.stroke();g.restore()}
  if(h.critT>0){g.save();g.globalAlpha=.35+.25*Math.sin(LP.t*20);g.strokeStyle='#ffd36b';g.lineWidth=2;g.beginPath();g.arc(h.x+9,h.y+20,26,0,6.283);g.stroke();g.restore()}
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
  // background silhouettes
  r.deco.forEach((L,li)=>{const k=li?.55:.32;g.save();g.translate(-cam.x*k,-cam.y*k+(li?40:10));const col=shade(Z.far,li?.03:-.08);g.fillStyle=col;
    for(const b2 of L.blobs){g.beginPath();g.moveTo(b2.x,L.pts[0][1]+400);g.lineTo(b2.x,L.pts[0][1]-b2.h+b2.w/2);g.arc(b2.x+b2.w/2,L.pts[0][1]-b2.h+b2.w/2,b2.w/2,Math.PI,0);g.lineTo(b2.x+b2.w,L.pts[0][1]+400);g.fill();
      if(b2.k<.4){g.strokeStyle=shade(Z.far,.1);g.lineWidth=2;g.beginPath();g.ellipse(b2.x+b2.w/2,L.pts[0][1]-b2.h+b2.w/2,b2.w/2-4,6,0,0,6.283);g.stroke()}}
    g.beginPath();g.moveTo(L.pts[0][0],2000);for(const [x,y] of L.pts)g.lineTo(x,y);g.lineTo(L.pts[L.pts.length-1][0],2000);g.fill();g.restore()});
  g.save();g.translate(-cx,-cy);
  drawActors(g,'back');g.drawImage(r.canvas,0,0);
  if(r.pulses){g.fillStyle=Z.acc;for(const q of r.pulses){q.p=(q.p+q.sp*q.d*LP.DT+q.u.len)%q.u.len;const x=q.u.x+q.p,y=q.u.y;if(x<cx-40||x>cx+VW+40||y<cy-40||y>cy+VH+40)continue;g.globalAlpha=.9;g.fillRect(x-1,y-1,3,3);g.globalAlpha=.35;g.fillRect(x-q.d*10-4,y-.5,10,2);LP.light(x,y,46,.55)}g.globalAlpha=1}drawActors(g,'mid');drawParts(g,false);drawActors(g,'front');drawParts(g,true);
  g.restore();
  // lighting
  let dark=LP.darkOverride!=null?LP.darkOverride:Z.dark;if(LP.boss&&r.meta.arena&&LP.darkOverride==null)dark=Math.max(dark,.7)+(Math.random()<.04?.12:0);if(dark>0){lg.globalCompositeOperation='source-over';lg.clearRect(0,0,VW,VH);lg.fillStyle=`rgba(0,0,0,${dark})`;lg.fillRect(0,0,VW,VH);lg.globalCompositeOperation='destination-out';
    const L=[{x:H.x+9,y:H.y+18,r:260,i:1},...LP.lights];if(r.glows)for(const q of r.glows){const fl=q.fl?(1-q.fl*.5+q.fl*.5*Math.sin(LP.t*(5+q.ph)+q.ph)*(Math.random()<q.fl*.08?0:1)):1;L.push({x:q.x,y:q.y,r:q.r,i:q.i*fl})}for(const l of L){const x=l.x-cx,y=l.y-cy;if(x<-l.r||y<-l.r||x>VW+l.r||y>VH+l.r)continue;const gr=lg.createRadialGradient(x,y,0,x,y,l.r);gr.addColorStop(0,`rgba(0,0,0,${l.i})`);gr.addColorStop(1,'rgba(0,0,0,0)');lg.fillStyle=gr;lg.fillRect(x-l.r,y-l.r,l.r*2,l.r*2)}
    g.drawImage(lc,0,0)}
  // motes
  for(const m of motes){m.y-=m.z*12*LP.DT;m.x+=Math.sin(LP.t+m.p)*.2;if(m.y<-5)m.y=VH+5;const x=((m.x-cam.x*m.z*.3)%VW+VW)%VW,y=((m.y-cam.y*m.z*.3)%VH+VH)%VH;g.globalAlpha=.25+.35*Math.abs(Math.sin(LP.t*1.5+m.p));g.fillStyle=Z.mote;g.fillRect(x,y,m.z*2.4,m.z*2.4)}g.globalAlpha=1;
  g.drawImage(vig,0,0)};
LP.updParts=updParts;
})();
