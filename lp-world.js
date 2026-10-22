/* LAST PATCH — world: rooms, props, enemies, overlays. */
(function(){
'use strict';
const LP=window.LP,T=LP.T,VW=LP.VW,VH=LP.VH,{clamp,rand,pick,lerp,appr,sign}=LP,H=LP.H,I=LP.I;

/* ================= rooms ================= */
const D=LP.defRoom;
const LORE={
  drop:'MAINTENANCE LOG 001\nThe laptop won’t boot past the logo. Something is chewing through the copper.\nIf you are reading this, you are the patch.',
  ante:'The traces past this point are black and soft.\nWhatever did this is big, and it is hungry.\nRest first.',
  gap:'The capacitor banks can dump their whole charge at once.\nA technician carrying one could cross anything.',
  core:'THE CORE.\nFour billion instructions a second, and every one of them is screaming.',
  cpuante:'The scheduler stopped answering an hour ago.\nThreads are running that nobody started.',
  cache:'L2 CACHE\nHot data lives up here. So do the things that feed on it.'
};
D('mb_drop','mb',0,0,32,18,r=>{r.border({R:[12,15]});r.solid(0,0,32,2);r.solid(0,16,32,2);r.plat(7,11,5);r.plat(16,8,5);r.solid(14,14,3,2);
  r.ent('lore',4,15,{txt:LORE.drop});r.ent('hint',9,9,{txt:'← →  MOVE      ↑  JUMP'});r.ent('hint',24,11,{txt:'↓  READ  ·  HOLD ↑ TO JUMP HIGHER'})});
D('mb_hall','mb',32,0,64,18,r=>{r.border({L:[12,15],R:[12,15]});r.solid(0,0,64,3);r.solid(0,16,64,2);r.spikes(20,16,5);r.spikes(47,16,4);r.plat(27,12,4);r.solid(34,13,4,3);r.plat(43,11,5);
  r.ent('hint',6,9,{txt:'SPACE  ATTACK      ↓ + SPACE IN THE AIR TO STRIKE DOWN'});r.ent('crawler',12,15);r.ent('crawler',30,15);r.ent('crawler',35,12);r.ent('flyer',50,8);r.ent('save',57,15);r.ent('hint',57,10,{txt:'↓  REST'})});
D('mb_junction','mb',96,0,32,36,r=>{r.border({L:[[12,15],[30,33]],R:[12,15]});r.solid(0,0,32,3);r.solid(0,16,12,2);r.solid(20,16,12,2);r.solid(0,34,32,2);
  r.plat(22,31,5);r.plat(14,28,5);r.plat(6,25,5);r.plat(14,22,5);r.plat(13,19,6);r.ent('flyer',16,26);r.ent('crawler',26,33);r.ent('crawler',5,15);r.ent('hint',16,12,{txt:'HOLD Q  TO PATCH (HEAL)  ·  COSTS CHARGE'})});
D('mb_lower','mb',64,18,32,18,r=>{r.border({L:[12,15],R:[12,15]});r.solid(0,0,32,3);r.solid(0,16,32,2);r.spikes(14,16,3);r.plat(6,11,5);r.plat(20,10,5);
  r.ent('hopper',9,15);r.ent('hopper',24,15);r.ent('turret',16,3,{dir:'down'})});
D('mb_ante','mb',32,18,32,18,r=>{r.border({L:[12,15],R:[12,15]});r.solid(0,0,32,3);r.solid(0,16,32,2);r.ent('save',20,15);r.ent('lore',10,15,{txt:LORE.ante})});
D('mb_boss','mb',0,18,32,18,r=>{r.border({R:[12,15]});r.solid(0,0,32,2);r.solid(0,16,32,2);r.plat(4,11,5);r.plat(23,11,5);
  r.ent('gate',31,12,{n:4});r.ent('boss',0,0,{id:'weaver',trig:26});r.ent('shrine',15,15,{ab:'dash',req:'weaver'})},{arena:1});
D('mb_gap','mb',128,0,48,18,r=>{r.border({L:[12,15],R:[12,15]});r.solid(0,0,48,3);r.solid(0,16,48,2);r.spikes(18,16,9);
  r.ent('lore',11,15,{txt:LORE.gap});r.ent('flyer',31,7);r.ent('turret',40,3,{dir:'down'})});
D('cpu_gate','cpu',176,0,32,18,r=>{r.border({L:[12,15],R:[12,15]});r.solid(0,0,32,3);r.solid(0,16,32,2);r.ent('save',17,15);r.ent('lore',8,15,{txt:LORE.core})});
D('cpu_clock','cpu',208,0,48,18,r=>{r.border({L:[12,15],R:[12,15]});r.solid(0,0,48,3);r.solid(0,17,48,1);r.solid(0,16,6,1);r.solid(42,16,6,1);r.spikes(6,16,36);
  [8,13,18,23,28,33,38].forEach((x,i)=>r.ent('clock',x,13,{ph:i%2}));r.ent('flyer',24,7);r.ent('ticker',44,15);r.ent('hint',1,10,{txt:'CLOCK PLATFORMS  ·  THEY SWITCH ON THE BEAT'})});
D('cpu_cache','cpu',256,-18,32,36,r=>{r.border({L:[30,33],R:[3,6]});r.solid(0,0,32,3);r.solid(0,34,32,2);r.solid(22,7,10,1);
  r.plat(19,31,5);r.plat(11,28,5);r.plat(19,25,5);r.plat(11,22,5);r.plat(19,19,5);r.plat(11,16,5);r.plat(19,13,5);r.plat(17,10,5);
  r.solid(1,22,1,1);r.ent('shrine',1,21,{ab:'shot'});r.ent('flyer',25,16);r.ent('flyer',6,10);r.ent('ticker',6,33);r.ent('ticker',27,33);r.ent('turret',30,25,{dir:'left'});r.ent('lore',4,33,{txt:LORE.cache})});
D('cpu_pipe','cpu',288,-27,64,18,r=>{r.border({L:[12,15],R:[12,15]});r.solid(0,0,64,3);r.solid(0,17,64,1);r.solid(0,16,7,1);r.solid(57,16,7,1);r.spikes(7,16,50);r.solid(30,13,4,4);
  r.ent('mover',9,13,{range:5,ph:0});r.ent('mover',18,12,{range:6,ph:2});r.ent('mover',36,12,{range:6,ph:1});r.ent('mover',46,13,{range:6,ph:3});
  r.ent('turret',20,3,{dir:'down'});r.ent('turret',44,3,{dir:'down'});r.ent('flyer',32,8)});
D('cpu_ante','cpu',352,-27,32,18,r=>{r.border({L:[12,15],R:[12,15]});r.solid(0,0,32,3);r.solid(0,16,32,2);r.ent('save',18,15);r.ent('lore',8,15,{txt:LORE.cpuante})});
D('cpu_boss','cpu',384,-27,36,18,r=>{r.border({L:[12,15],R:[12,15]});r.solid(0,0,36,2);r.solid(0,16,36,2);r.barrier(35,12,1,4);r.plat(6,11,5);r.plat(25,11,5);
  r.ent('gate',0,12,{n:4});r.ent('boss',0,0,{id:'ripper',trig:8});r.ent('shrine',17,15,{ab:'grip',req:'ripper'});r.ent('offline',33,13)},{arena:1});
LP.START={room:'mb_drop',x:9*T,y:3*T};

LP.ABIL={
  dash:{name:'CAPACITOR DASH',desc:'Dump your stored charge all at once and dash, on the ground or in mid-air.',key:'SHIFT'},
  shot:{name:'PACKET SHOT',desc:'Fire a bolt of compressed data. Each shot costs charge, which you earn by landing hits.',key:'E'},
  grip:{name:'TRACE GRIP',desc:'Cling to walls and slide down them. Press ↑ while sliding to kick off and climb.',key:'↑ ON A WALL'}
};

/* ================= enemies ================= */
const EN={};LP.EN=EN;
function enemy(o){return Object.assign({enemy:true,vx:0,vy:0,flash:0,kb:0,dead:false,t:Math.random()*5,dmg:1,charge:11,
  hurt(d,dir){this.hp-=d;this.flash=.12;this.kb=.12;this.kbv=dir*(this.heavy?120:260);LP.sfx('hit');LP.burst(this.x+this.w/2,this.y+this.h/2,8,this.col,280);if(this.hp<=0)this.die();return true},
  die(){this.dead=true;LP.sfx('kill');LP.stop(.05);LP.shake(5);const cx=this.x+this.w/2,cy=this.y+this.h/2;LP.burst(cx,cy,22,this.col,420);
    for(let i=0;i<8;i++)LP.part({x:cx,y:cy,vx:rand(-260,260),vy:rand(-380,-60),g:900,life:rand(.5,1),k:'shard',s:rand(3,6),col:pick([this.col,'#1a0f22','#ffffff']),vr:rand(-10,10)});
    LP.part({x:cx,y:cy,k:'ring',col:this.col,s:6,grow:260,life:.3})},
  box(){return this}},o)}
const near=(e,r)=>Math.hypot(H.x+9-(e.x+e.w/2),H.y+20-(e.y+e.h/2))<r;
const NMf=()=>LP.NM;

EN.crawler=s=>enemy({kind:'crawler',x:s.tx*T+3,y:(s.ty+1)*T-18,w:24,h:18,hp:3,col:'#c45bff',dir:pick([-1,1]),pause:0,lunge:0,tell:0,
  update(dt){this.t+=dt;const NM=NMf();let sp=NM?88:60;
    if(NM){this.pause-=dt;if(this.pause<=0&&Math.random()<dt*.5)this.pause=rand(.2,.8);if(Math.random()<dt*.45)this.dir*=-1;
      if(this.tell>0){this.tell-=dt;sp=0;if(this.tell<=0)this.lunge=.35}else if(this.lunge>0){this.lunge-=dt;sp=320}
      else if(Math.abs(H.y+H.h-(this.y+this.h))<30&&near(this,170)&&Math.random()<dt*1.4){this.dir=sign(H.x-this.x);this.tell=rand(.08,.25)}
      if(this.pause>0&&this.lunge<=0)sp=0}
    this.vx=this.kb>0?this.kbv:this.dir*sp;this.kb-=dt;this.vy+=2000*dt;
    LP.moveBody(this,dt);if(this.hitWall)this.dir*=-1;
    if(this.ground&&this.kb<=0){const fx=this.dir>0?this.x+this.w+2:this.x-2,t=LP.tile(Math.floor(fx/T),Math.floor((this.y+this.h+4)/T));if(!(LP.isSolid(t)||t===2)){this.dir*=-1;this.lunge=0}}
    this.flash-=dt},
  draw(g){const x=this.x+this.w/2,y=this.y+this.h,t=this.t;g.save();g.translate(x,y);g.scale(this.dir,1);
    g.strokeStyle='#2a1238';g.lineWidth=2;for(let i=0;i<3;i++){const ph=t*14+i*2;g.beginPath();g.moveTo(-6+i*6,-6);g.lineTo(-9+i*6+Math.sin(ph)*3,-1+Math.max(0,Math.cos(ph))*-2);g.stroke()}
    g.fillStyle=this.flash>0?'#fff':this.tell>0?'#ff5b8b':'#3a1650';g.beginPath();g.ellipse(0,-10,13,9,0,Math.PI,0);g.lineTo(13,-6);g.lineTo(-13,-6);g.fill();
    g.fillStyle='#c45bff';g.fillRect(-9,-15,3,3);g.fillRect(-2,-17,3,3);g.fillRect(5,-15,3,3);
    g.shadowColor='#ff3e6b';g.shadowBlur=8;g.fillStyle='#ff3e6b';g.fillRect(9,-11,4,3);g.shadowBlur=0;g.restore()}});

EN.flyer=s=>enemy({kind:'flyer',x:s.tx*T+3,y:s.ty*T+3,w:26,h:26,hp:2,col:'#7dff9a',hx:s.tx*T,hy:s.ty*T,dive:0,tell:0,cd:rand(1.5,3),
  update(dt){this.t+=dt;const NM=NMf(),cx=this.x+13,cy=this.y+13,dx=H.x+9-cx,dy=H.y+18-cy,d=Math.hypot(dx,dy)||1;
    if(this.kb>0){this.kb-=dt;this.vx=this.kbv;this.vy*=.9}
    else if(this.tell>0){this.tell-=dt;this.vx*=.85;this.vy*=.85;if(this.tell<=0){this.dive=.45;this.vx=dx/d*340;this.vy=dy/d*340}}
    else if(this.dive>0){this.dive-=dt}
    else if(d<330){const sp=NM?100:72;this.vx=appr(this.vx,dx/d*sp+Math.sin(this.t*3)*30,400*dt);this.vy=appr(this.vy,dy/d*sp+Math.cos(this.t*2.3)*40,400*dt);
      if(NM){if(Math.random()<dt*2){this.vx+=rand(-220,220);this.vy+=rand(-220,220)}this.cd-=dt;if(this.cd<=0&&d<260){this.cd=rand(1.4,3.2);this.tell=rand(.18,.4)}}}
    else{this.vx=appr(this.vx,(this.hx-this.x)*.6+Math.sin(this.t)*20,200*dt);this.vy=appr(this.vy,(this.hy-this.y)*.6+Math.cos(this.t*1.3)*20,200*dt)}
    LP.moveBody(this,dt,{oneway:false,plats:false});this.flash-=dt;LP.light(cx,cy,70,.5)},
  draw(g){const cx=this.x+13,cy=this.y+13,t=this.t;g.save();g.translate(cx,cy);g.rotate(t*1.5);g.strokeStyle=this.tell>0?'#ff5b8b':'#3fbf6a';g.lineWidth=2.5;
    for(let i=0;i<8;i++){const a=i/8*6.283;g.beginPath();g.moveTo(Math.cos(a)*9,Math.sin(a)*9);g.lineTo(Math.cos(a)*15,Math.sin(a)*15);g.stroke();g.fillStyle='#b9ffcc';g.beginPath();g.arc(Math.cos(a)*15,Math.sin(a)*15,2.2,0,6.283);g.fill()}
    g.fillStyle=this.flash>0?'#fff':'#1e5a35';g.beginPath();g.arc(0,0,10,0,6.283);g.fill();g.fillStyle='#7dff9a';g.beginPath();g.arc(-3,-2,3,0,6.283);g.arc(3,3,2,0,6.283);g.fill();g.restore()}});

EN.hopper=s=>enemy({kind:'hopper',x:s.tx*T+2,y:(s.ty+1)*T-24,w:26,h:24,hp:4,col:'#3ee8ff',wait:rand(.6,1.4),sq:0,fake:false,again:false,
  update(dt){this.t+=dt;const NM=NMf();this.vy+=2000*dt;
    if(this.ground){this.vx=this.kb>0?this.kbv:appr(this.vx,0,1200*dt);
      if(this.sq>0){this.sq-=dt;if(this.sq<=0){if(this.fake){this.fake=false;this.wait=rand(.15,.5)}else{const dx=H.x-this.x;this.vx=clamp(dx*1.3,-220,220)*(NM?rand(.6,1.4):1);this.vy=NM?-rand(420,760):-600;this.ground=false;this.again=NM&&Math.random()<.3}}}
      else{this.wait-=dt;if(this.wait<=0&&near(this,420)){if(this.again){this.again=false;this.sq=.08}else{this.sq=NM?rand(.12,.4):.35;this.fake=NM&&Math.random()<.25}this.wait=NM?rand(.3,1.5):1.3}}}
    this.kb-=dt;LP.moveBody(this,dt);this.flash-=dt},
  draw(g){const x=this.x+13,y=this.y+24,s=this.sq>0?.7:(!this.ground?1.15:1);g.save();g.translate(x,y);g.scale(1/s,s);
    const gl=Math.sin(this.t*20)>.6?3:0;g.fillStyle=this.flash>0?'#fff':'#0f3a48';g.fillRect(-13,-24,26,24);g.fillStyle='#3ee8ff';g.fillRect(-13+gl,-17,26,3);g.fillRect(-13-gl,-9,26,2);
    g.fillStyle='#fff';g.fillRect(-7,-20,5,5);g.fillRect(3,-20,5,5);g.fillStyle='#ff3e6b';g.fillRect(-5+sign(H.x-this.x)*1.5,-18,2,2);g.fillRect(5+sign(H.x-this.x)*1.5,-18,2,2);g.restore()}});

EN.turret=s=>{const dir=s.dir||'down';const e=enemy({kind:'turret',heavy:true,dir,w:26,h:26,hp:3,col:'#ff8a3e',cd:rand(1,2.4),tell:0,
  update(dt){this.t+=dt;const NM=NMf();this.flash-=dt;if(this.tell>0){this.tell-=dt;if(this.tell<=0)this.fire()}else{this.cd-=dt;if(this.cd<=0&&near(this,440)){this.tell=NM?rand(.2,.5):.45;this.cd=NM?rand(1,2.6):2.4;LP.sfx('warn')}}
    LP.light(this.x+13,this.y+13,60,.4)},
  fire(){const NM=NMf(),cx=this.x+13,cy=this.y+13,a=Math.atan2(H.y+20-cy,H.x+9-cx);const n=NM&&Math.random()<.5?3:1;for(let i=0;i<n;i++){const aa=a+(i-(n-1)/2)*.28,sp=NM?rand(180,300):210;LP.shots.push({x:cx,y:cy,vx:Math.cos(aa)*sp,vy:Math.sin(aa)*sp,r:7,col:'#ff8a3e',life:4,brk:true})}LP.sfx('bullet')},
  draw(g){const cx=this.x+13,cy=this.y+13,a=Math.atan2(H.y+20-cy,H.x+9-cx);g.save();g.translate(cx,cy);const base={down:-Math.PI/2,up:Math.PI/2,left:0,right:Math.PI}[this.dir];
    g.save();g.rotate(base);g.fillStyle='#3a1a0a';g.fillRect(-16,-12,6,24);g.restore();g.fillStyle=this.flash>0?'#fff':'#5a2a10';g.beginPath();g.arc(0,0,12,0,6.283);g.fill();
    g.fillStyle='#ffe0c0';g.beginPath();g.arc(0,0,7,0,6.283);g.fill();g.fillStyle=this.tell>0&&Math.sin(this.t*40)>0?'#fff':'#ff3e3e';g.beginPath();g.arc(Math.cos(a)*3,Math.sin(a)*3,3.5,0,6.283);g.fill();g.restore()}});
  const ox={down:0,up:0,left:4,right:-4}[dir],oy={down:-4,up:4,left:0,right:0}[dir];e.x=s.tx*T+2+ox;e.y=s.ty*T+2+oy;return e};

EN.ticker=s=>enemy({kind:'ticker',x:s.tx*T+3,y:(s.ty+1)*T-24,w:24,h:24,hp:4,col:'#ffb35b',dir:pick([-1,1]),charge:11,run:0,tell:0,lastBeat:-1,
  update(dt){this.t+=dt;const NM=NMf();this.vy+=2000*dt;const beat=Math.floor(LP.roomT/1.05);
    if(this.tell>0){this.tell-=dt;this.vx=0;if(this.tell<=0){this.run=.32;this.dir=sign(H.x-this.x)}}
    else if(this.run>0){this.run-=dt;this.vx=this.dir*360}
    else{this.vx=this.kb>0?this.kbv:this.dir*45;if(near(this,280)){if(!NM&&beat!==this.lastBeat){this.lastBeat=beat;this.tell=.22;LP.sfx('tick')}if(NM&&Math.random()<dt*1.2){this.tell=rand(.05,.35);if(Math.random()<.3)this.tell=-1}}}
    if(this.tell<0){this.tell=0;this.dir*=-1}
    this.kb-=dt;LP.moveBody(this,dt);if(this.hitWall)this.dir*=-1;if(this.ground&&this.run<=0){const fx=this.dir>0?this.x+this.w+2:this.x-2,t=LP.tile(Math.floor(fx/T),Math.floor((this.y+this.h+4)/T));if(!(LP.isSolid(t)||t===2))this.dir*=-1}
    this.flash-=dt},
  draw(g){const cx=this.x+12,cy=this.y+12;g.save();g.translate(cx,cy);g.rotate(this.x/12);g.fillStyle=this.flash>0?'#fff':this.tell>0?'#ff5b3e':'#4a2008';
    g.beginPath();for(let i=0;i<16;i++){const a=i/16*6.283,r=i%2?12:9;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.fill();g.restore();
    g.fillStyle='#ffe0b0';g.beginPath();g.arc(cx,cy,6,0,6.283);g.fill();g.strokeStyle='#4a2008';g.lineWidth=1.5;g.beginPath();g.moveTo(cx,cy);const a=LP.roomT*6;g.lineTo(cx+Math.cos(a)*5,cy+Math.sin(a)*5);g.stroke()}});

/* ================= props ================= */
const P={};LP.PROPS=P;
P.save=s=>({kind:'save',x:s.tx*T+15,y:(s.ty+1)*T,t:0,layer:'back',
  update(dt){this.t+=dt;this.near=Math.abs(H.x+9-this.x)<34&&Math.abs(H.y+H.h-this.y)<12;if(this.near&&I.hit.down&&H.ground&&!LP.cs&&!H.dead)LP.rest(this)},
  draw(g){const x=this.x,y=this.y,p=.6+.4*Math.sin(this.t*2.4);g.fillStyle='#10192e';g.fillRect(x-14,y-48,28,48);g.fillStyle='#1d2a4a';g.fillRect(x-17,y-6,34,6);
    g.fillStyle=`rgba(70,240,143,${.55+.35*p})`;g.fillRect(x-10,y-42,20,14);g.fillStyle='#0a1a12';for(let i=0;i<3;i++)g.fillRect(x-7,y-39+i*4,(i===1?10:14)*((Math.sin(this.t*3+i)+1.4)/2.4),2);
    g.strokeStyle=`rgba(70,240,143,${.25*p})`;g.lineWidth=2;g.beginPath();g.ellipse(x,y,26+p*6,5,0,0,6.283);g.stroke();LP.light(x,y-30,150,.9);
    if(this.near&&!LP.cs){g.font='12px Silkscreen,monospace';g.textAlign='center';g.fillStyle='#bfffd8';g.fillText('↓ REST',x,y-60);g.textAlign='left'}}});
P.lore=s=>({kind:'lore',x:s.tx*T+15,y:(s.ty+1)*T,txt:s.txt,t:0,layer:'back',
  update(dt){this.t+=dt;this.near=Math.abs(H.x+9-this.x)<30&&Math.abs(H.y+H.h-this.y)<14;if(this.near&&I.hit.down&&H.ground&&!LP.cs)LP.showLore(this.txt)},
  draw(g){const x=this.x,y=this.y;g.fillStyle='#1a2236';g.beginPath();g.moveTo(x-12,y);g.lineTo(x-10,y-34);g.lineTo(x+10,y-34);g.lineTo(x+12,y);g.fill();g.fillStyle=`rgba(125,200,255,${.35+.2*Math.sin(this.t*3)})`;g.fillRect(x-7,y-30,14,2);g.fillRect(x-7,y-25,10,2);g.fillRect(x-7,y-20,12,2);
    LP.light(x,y-20,70,.5);if(this.near&&!LP.cs){g.font='12px Silkscreen,monospace';g.textAlign='center';g.fillStyle='#cfe3ff';g.fillText('↓ READ',x,y-46);g.textAlign='left'}}});
P.hint=s=>({kind:'hint',x:s.tx*T,y:s.ty*T,txt:s.txt,layer:'back',update(){},draw(g){g.font='13px Silkscreen,monospace';g.fillStyle='rgba(200,215,240,.42)';g.fillText(this.txt,this.x,this.y)}});
P.offline=s=>({kind:'offline',x:s.tx*T,y:s.ty*T,layer:'front',t:0,update(dt){this.t+=dt},draw(g){const x=this.x+30,y=this.y;g.save();for(let i=0;i<14;i++){g.fillStyle=`rgba(${Math.random()<.5?255:60},${Math.random()*80|0},${Math.random()<.5?120:255},${rand(.2,.7)})`;g.fillRect(x+rand(-2,4),y-30+rand(0,120),rand(4,26),rand(2,6))}
  g.font='11px Silkscreen,monospace';g.fillStyle='#ff6b8b';g.textAlign='right';g.fillText('SECTOR OFFLINE',x-6,y-20);g.fillStyle='rgba(255,107,139,.6)';g.fillText('next patch incoming',x-6,y-6);g.textAlign='left';g.restore()}});
P.shrine=s=>({kind:'shrine',x:s.tx*T+15,y:(s.ty+1)*T,ab:s.ab,req:s.req,t:0,layer:'back',
  live(){return !LP.abil[this.ab]&&(!this.req||LP.save.boss[this.req])},
  update(dt){this.t+=dt;if(!this.live())return;if(Math.abs(H.x+9-this.x)<26&&Math.abs(H.y+20-(this.y-30))<40&&!LP.cs&&!H.dead)LP.getAbility(this.ab,this)},
  draw(g){if(!this.live())return;const x=this.x,y=this.y,t=this.t;g.fillStyle='#141a2c';g.beginPath();g.moveTo(x-18,y);g.lineTo(x-12,y-16);g.lineTo(x+12,y-16);g.lineTo(x+18,y);g.fill();
    const gr=g.createLinearGradient(0,y-140,0,y);gr.addColorStop(0,'rgba(255,230,140,0)');gr.addColorStop(1,'rgba(255,230,140,.22)');g.fillStyle=gr;g.fillRect(x-14,y-140,28,124);
    const oy=y-38+Math.sin(t*2.2)*4;g.save();g.shadowColor='#ffd36b';g.shadowBlur=24;g.fillStyle='#fff3c4';g.beginPath();g.arc(x,oy,9,0,6.283);g.fill();g.restore();
    g.strokeStyle='rgba(255,211,107,.7)';g.lineWidth=1.5;for(let i=0;i<3;i++){g.beginPath();g.ellipse(x,oy,16+i*5,6+i*2,t*(1+i*.4),0,6.283);g.stroke()}
    if(Math.random()<.3)LP.part({x:x+rand(-12,12),y:y-10,vy:-rand(30,80),life:1,col:'#ffd36b',s:2});LP.light(x,oy,160,1)}});
P.gate=s=>({kind:'gate',tx:s.tx,ty:s.ty,n:s.n,closed:false,k:0,layer:'front',
  close(){if(this.closed)return;this.closed=true;for(let i=0;i<this.n;i++)LP.setTile(this.tx,this.ty+i,5);LP.sfx('door');LP.shake(12);for(let i=0;i<14;i++)LP.part({x:this.tx*T+15,y:(this.ty+this.n)*T,vx:rand(-200,200),vy:rand(-200,-40),g:800,life:.6,col:'#9aa6c2',s:3})},
  open(){if(!this.closed)return;this.closed=false;for(let i=0;i<this.n;i++)LP.setTile(this.tx,this.ty+i,0);LP.sfx('door')},
  update(dt){this.k=appr(this.k,this.closed?1:0,dt*6)},
  draw(g){if(this.k<=0)return;const x=this.tx*T,y0=this.ty*T,h=this.n*T*this.k;g.fillStyle='#0d1222';g.fillRect(x+3,y0,T-6,h);g.fillStyle='#ff3e6b';for(let i=0;i<h;i+=14)g.fillRect(x+6,y0+i,T-12,3);g.fillStyle='#3a4560';g.fillRect(x,y0+h-6,T,6)}});
P.clock=s=>{const p={x:s.tx*T,y:s.ty*T,w:90,h:12,on:true,dx:0,dy:0};return{kind:'clock',plat:p,ph:s.ph,layer:'mid',
  update(dt){const idx=Math.floor(LP.roomT/1.05)%2,frac=(LP.roomT%1.05)/1.05;p.on=idx===this.ph;this.warn=p.on&&frac>.72;if(Math.floor(LP.roomT/1.05)!==this.lb){this.lb=Math.floor(LP.roomT/1.05);if(this.ph===0)LP.sfx('tick')}},
  draw(g){const al=p.on?(this.warn&&Math.sin(LP.t*40)>0?.35:1):.12;g.globalAlpha=al;g.fillStyle='#ff8a3e';g.fillRect(p.x,p.y,p.w,4);g.fillStyle='#5a220c';g.fillRect(p.x,p.y+4,p.w,8);g.fillStyle='#ffd27a';for(let i=0;i<6;i++)g.fillRect(p.x+6+i*14,p.y+6,6,3);g.globalAlpha=1;if(p.on)LP.light(p.x+45,p.y,90,.5)}}};
P.mover=s=>{const p={x:s.tx*T,y:s.ty*T,w:90,h:12,on:true,dx:0,dy:0};const x0=p.x,R=s.range*T,per=R*2/65;return{kind:'mover',plat:p,layer:'mid',
  update(dt){const k=.5-.5*Math.cos((LP.roomT/per)*6.283+(s.ph||0));const nx=x0+R*k;p.dx=nx-p.x;p.x=nx},
  draw(g){g.fillStyle='#ffb35b';g.fillRect(p.x,p.y,p.w,3);g.fillStyle='#3a1608';g.fillRect(p.x,p.y+3,p.w,9);g.fillStyle='#ff8a3e';g.fillRect(p.x+p.w/2-6,p.y+12,12,4);LP.light(p.x+45,p.y+16,60,.4)}}};
P.boss=s=>({kind:'bossTrig',id:s.id,trig:s.trig,layer:'back',update(){if(LP.boss||LP.save.boss[this.id]||LP.cs||H.dead)return;const tx=(H.x+9)/T;if((this.id==='weaver'&&tx<this.trig)||(this.id==='ripper'&&tx>this.trig))LP.startBoss(this.id)},draw(){}});

LP.spawn=s=>{const f=EN[s.type]||P[s.type];if(!f){console.warn('no spawner',s.type);return null}const e=f(s);e.type=s.type;if(e.plat)LP.plats.push(e.plat);return e};

/* ================= screen overlays ================= */
LP.titleCard=(name,sub,dur)=>{dur=dur||2.4;LP.overlays.push({t:0,life:dur,draw(g,t){const a=Math.min(1,t/.35,(dur-t)/.4);g.globalAlpha=a;g.textAlign='center';
  const w=Math.min(1,t/.6)*420;g.fillStyle='rgba(255,255,255,.8)';g.fillRect(VW/2-w/2,VH*.62,w,2);
  g.font='400 58px Bungee, Impact, sans-serif';g.fillStyle='#fff';g.shadowColor='rgba(0,0,0,.8)';g.shadowBlur=20;g.fillText(name,VW/2,VH*.6);g.shadowBlur=0;
  g.font='14px Silkscreen,monospace';g.fillStyle='rgba(230,235,255,.85)';g.fillText(sub.split('').join(' '),VW/2,VH*.62+30);g.textAlign='left';g.globalAlpha=1}})};
LP.banner=(name,sub)=>{LP.overlays.push({t:0,life:3.2,draw(g,t){const a=Math.min(1,t/.5,(3.2-t)/.6);g.globalAlpha=a;g.textAlign='center';g.font='400 34px Bungee, Impact, sans-serif';g.fillStyle='#fff';g.fillText(name,VW/2,118);
  g.font='12px Silkscreen,monospace';g.fillStyle='rgba(220,230,255,.8)';g.fillText(sub,VW/2,142);const w=Math.min(1,t/.8)*260;g.fillRect(VW/2-w/2,128,w,1);g.textAlign='left';g.globalAlpha=1}})};
/* the laugh, drawn huge */
LP.mwahaha=(boss,scale,big)=>{scale=scale||1;const n=big?9:6;LP.laugh(n,88,.6);const life=big?3:2.1;if(boss)boss.laughT=life-.3;
  LP.overlays.push({t:0,life,beat:0,update(dt){const b=Math.floor((this.t-.3)/.19);if(this.t>.3&&b!==this.beat){this.beat=b;LP.shake(9*scale)}},
    draw(g,t){const txt=big?'MWAHAHAHA':'MWAHAHA',fs=Math.round((big?104:72)*scale);g.font=`400 ${fs}px Bungee, Impact, sans-serif`;g.textBaseline='middle';
      const ws=[...txt].map(c=>g.measureText(c).width),tot=ws.reduce((a,b)=>a+b,0);let x=VW/2-tot/2;const y=VH*.38,fade=Math.min(1,(life-t)/.4);
      [...txt].forEach((c,i)=>{const lt=t-i*.06;if(lt<0){x+=ws[i];return}const s=lt<.3?LP.ease.back(lt/.3):1,bob=Math.sin(t*16.5-i*.9)*10*Math.min(1,t),rot=Math.sin(t*8+i)*.08;
        g.save();g.translate(x+ws[i]/2,y+bob);g.rotate(rot);g.scale(s,s);g.globalAlpha=fade;
        g.fillStyle='rgba(255,0,90,.75)';g.fillText(c,-ws[i]/2-5,2);g.fillStyle='rgba(0,255,210,.6)';g.fillText(c,-ws[i]/2+5,-2);
        g.lineWidth=8;g.strokeStyle='#08020c';g.strokeText(c,-ws[i]/2,0);const gr=g.createLinearGradient(0,-fs/2,0,fs/2);gr.addColorStop(0,'#f2ffe9');gr.addColorStop(.5,'#8cff9e');gr.addColorStop(1,'#b14bff');g.fillStyle=gr;g.fillText(c,-ws[i]/2,0);g.restore();x+=ws[i]});
      g.textBaseline='alphabetic';g.globalAlpha=1}})};
/* typed console lines */
LP.console=(lines,speed)=>{speed=speed||38;const total=lines.join('').length/speed+1.6;LP.overlays.push({t:0,life:total+.8,last:0,update(){const n=Math.floor(this.t*speed);if(n>this.last){this.last=n;if(n%2)LP.sfx('type')}},
  draw(g,t){let n=Math.floor(t*speed);const a=Math.min(1,(this.life-t)/.5);g.globalAlpha=a;g.font='15px "JetBrains Mono",monospace';
    lines.forEach((L,i)=>{if(n<=0)return;const s=L.slice(0,n);n-=L.length;g.fillStyle=/ERROR|UNRESP|ROGUE/.test(L)?'#ff6b6b':'#ffcf9a';g.fillText(s,60,110+i*24)});
    if(Math.floor(t*3)%2)g.fillRect(60,110+lines.length*24-14,9,16);g.globalAlpha=1}})};
LP.bigGlitch=(txt,life)=>{life=life||1.4;LP.sfx('glitch');LP.overlays.push({t:0,life,draw(g,t){const a=Math.min(1,(life-t)/.3);g.font='400 120px Bungee, Impact, sans-serif';g.textAlign='center';g.textBaseline='middle';
  for(let i=0;i<5;i++){g.save();g.beginPath();const y0=VH*.42-70+i*28;g.rect(0,y0,VW,28);g.clip();g.globalAlpha=a;g.fillStyle=i%2?'#ffb35b':'#fff';g.fillText(txt,VW/2+(Math.random()-.5)*30*(1-t/life),VH*.42);g.restore()}
  g.globalAlpha=a*.6;g.fillStyle='#ff3e6b';g.fillText(txt,VW/2-6,VH*.42);g.textAlign='left';g.textBaseline='alphabetic';g.globalAlpha=1}})};
})();
