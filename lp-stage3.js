/* LAST PATCH — stage 3: GPU, cooling, battery, display and the BIOS. */
(function(){
'use strict';
const LP=window.LP,T=LP.T,{clamp,rand,pick,lerp,appr,sign}=LP,H=LP.H,D=LP.defRoom,shade=LP.shade;

/* ---------- zones and music ---------- */
Object.assign(LP.ZONES,{
  gpu:{name:'THE RENDER FARM',sub:'sixty frames a second, all of them wrong',bg:'#07020b',far:'#22082c',tile:'#1b0a24',tileHi:'#3a1448',edge:'#ff4fd8',acc:'#4ff0ff',spike:'#ff4fd8',dark:.5,music:'gpu',mote:'#ff8af0',
    house:'#2a1238',roof:'#3a1850',trim:'#4ff0ff',win:'#ff9af0',cloth:['#ff4fd8','#4ff0ff','#fff3b0','#8a5bff']},
  fan:{name:'THE HEATSINK',sub:'where the air used to be cold',bg:'#02070d',far:'#0c2230',tile:'#0e2230',tileHi:'#1e4258',edge:'#a8e8ff',acc:'#ffffff',spike:'#ff8a3e',dark:.5,music:'fan',mote:'#e0f8ff',
    house:'#16303f',roof:'#1e3e52',trim:'#a8e8ff',win:'#ffd27a',cloth:['#a8e8ff','#ff8a3e','#ffffff','#5ab0d8']},
  bat:{name:'THE CELLS',sub:'every lullaby here is electric',bg:'#050902',far:'#1a2608',tile:'#18220a',tileHi:'#33450f',edge:'#d4ff3e',acc:'#d4ff3e',spike:'#b6ff2e',dark:.52,music:'bat',mote:'#e8ff8a',
    house:'#24300e',roof:'#2e3e12',trim:'#d4ff3e',win:'#f4ffb0',cloth:['#d4ff3e','#3ee8ff','#ffd23e','#ffffff']},
  lcd:{name:'THE PANEL',sub:'a million tiny lights, some of them dead',bg:'#040405',far:'#15151b',tile:'#141419',tileHi:'#2a2a34',edge:'#e8e8f0',acc:'#ff3e3e',spike:'#e8e8f0',dark:.45,music:'lcd',mote:'#ffffff',
    house:'#1c1c24',roof:'#26262f',trim:'#ff3e3e',win:'#ffffff',cloth:['#ff3e3e','#3eff6b','#3e8bff','#ffffff']},
  bios:{name:'THE FIRMWARE',sub:'before anything, there was this',bg:'#090600',far:'#281c00',tile:'#1b1300',tileHi:'#3a2a00',edge:'#ffb000',acc:'#ffb000',spike:'#ffb000',dark:.55,music:'bios',mote:'#ffcf6b',
    house:'#2a1e06',roof:'#3a2a08',trim:'#ffb000',win:'#ffcf6b',cloth:['#ffb000','#ffcf6b','#7a5a10','#ffffff']}});
Object.assign(LP.TRK,{
  gpu:{bpm:110,root:44,prog:[0,3,-2,1],bass:'x..x..x...x..x..',arp:'xxx.xx.xxxx.xx.x',kick:'x...x...x...x...',hat:'.x.x.x.x.x.x.x.x',snare:'',pad:1,arpType:'square',arpOct:2},
  fan:{bpm:88,root:43,prog:[0,-2,-4,-2],bass:'x.......x.......',arp:'x...x.x...x.x...',kick:'',hat:'..x...x...x...x.',snare:'',pad:1,arpType:'sine',arpOct:3},
  bat:{bpm:124,root:41,prog:[0,0,2,-1],bass:'x.x.x.xxx.x.x.xx',arp:'x.xx.x.xx.xx.x.x',kick:'x...x...x...x...',hat:'xx.xxx.xxx.xxx.x',snare:'',pad:0,arpType:'square',arpOct:2},
  lcd:{bpm:96,root:45,prog:[0,5,3,-2],bass:'x...x...x...x...',arp:'x.x.x.x.x.x.x.x.',kick:'x.......x.......',hat:'....x.......x...',snare:'',pad:1,arpType:'triangle',arpOct:3},
  bios:{bpm:70,root:36,prog:[0,1,0,-1],bass:'x...............',arp:'x.......x.......',kick:'',hat:'',snare:'',pad:1,arpType:'sine',arpOct:2},
  boss5:{bpm:150,root:44,prog:[0,3,1,-2],bass:'xx.x.xx.xx.x.xx.',arp:'x.xxx.xxx.xxx.xx',kick:'x..x..x.x..x..x.',hat:'.x.x.x.x.x.x.x.x',snare:'....x.......x...',pad:0,arpType:'square',arpOct:3},
  boss6:{bpm:144,root:40,prog:[0,-2,-4,1],bass:'x.xx.xx.x.xx.x.x',arp:'xx.x.xx.xx.x.xx.',kick:'x...x...x...x...',hat:'xxxxxxxxxxxxxxxx',snare:'....x.......x...',pad:0,arpType:'triangle',arpOct:3},
  boss7:{bpm:162,root:41,prog:[0,2,0,-3],bass:'xxxxxxxxxxxxxxxx',arp:'x.x.xxx.x.x.xxx.',kick:'x.x.x.x.x.x.x.x.',hat:'.xx.xx.xx.xx.xx.',snare:'....x..x....x...',pad:0,arpType:'sawtooth',arpOct:2},
  boss8:{bpm:138,root:45,prog:[0,5,3,-2],bass:'x..xx..xx..xx..x',arp:'xxxx.x.xxxxx.x.x',kick:'x..x..x...x..x..',hat:'.x.x.x.x.x.x.x.x',snare:'....x.......x...',pad:0,arpType:'square',arpOct:3},
  final:{bpm:168,root:36,prog:[0,1,-2,-1],bass:'xx.xx.xxxx.xx.xx',arp:'x.xx.xxx.xx.x.xx',kick:'x.x.x.x.x.x.x.x.',hat:'xxxxxxxxxxxxxxxx',snare:'....x.......x..x',pad:1,arpType:'sawtooth',arpOct:2},
  credits:{bpm:84,root:48,prog:[0,-5,-3,-7],bass:'x.......x.......',arp:'x.x.x.x.x.x.x.x.',kick:'x.......x.......',hat:'....x.......x...',snare:'',pad:1,arpType:'triangle',arpOct:2}});
Object.assign(LP.ABIL,{
  link:{name:'DATA LINK',desc:'Fire a line of data at a glowing node and zip straight to it, even in mid-air.',key:'R NEAR A NODE'},
  phase:{name:'PHASE SHIFT',desc:'Your dash now slips through attacks, enemies and red firewalls.',key:'SHIFT'}});
Object.assign(LP.BIT,{tech:{col:'#ff8af0',hat:'glasses'},keeper:{col:'#d4ff3e',hat:'hard'},gran:{col:'#ffcf6b',hat:'hood',s:1.1}});

/* ---------- new painters ---------- */
const PR=LP.PAINT,rr=(g,x,y,w,h,r)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()};
PR.die=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T,W=(p.w||6)*T,Hh=(p.h||4)*T;g.fillStyle=shade(Z.house,.05);rr(g,X,Y-Hh,W,Hh,26);g.fill();g.fillStyle=shade(Z.house,-.3);rr(g,X+16,Y-Hh+16,W-32,Hh-32,18);g.fill();
  for(let i=0;i<Math.floor((W-40)/26);i++)for(let j=0;j<Math.floor((Hh-40)/26);j++){const lit=R()<.45;g.fillStyle=lit?Z.win:shade(Z.house,-.1);g.beginPath();g.arc(X+32+i*26,Y-Hh+32+j*26,7,0,6.283);g.fill()}
  if(p.label){g.font='12px Silkscreen,monospace';g.fillStyle=Z.trim;g.textAlign='center';g.fillText(p.label,X+W/2,Y-6);g.textAlign='left'}};
PR.fins=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T,n=p.n||6,h=(p.h||5)*T;for(let i=0;i<n;i++){g.fillStyle=shade(Z.house,.04+(i%2)*.05);rr(g,X+i*22,Y-h+(i%3)*10,16,h,8);g.fill()}if(p.frost){g.fillStyle='rgba(220,245,255,.35)';for(let i=0;i<n;i++){g.beginPath();g.ellipse(X+8+i*22,Y-h+(i%3)*10+6,7,4,0,0,6.283);g.fill()}}};
PR.cell=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T,W=(p.w||2)*T,Hh=(p.h||4)*T;g.fillStyle=shade(Z.house,.06);rr(g,X,Y-Hh,W,Hh,W/2);g.fill();g.fillStyle=Z.trim;g.globalAlpha=.6;g.fillRect(X+W*.3,Y-Hh-8,W*.4,10);g.globalAlpha=1;
  const lv=p.lv==null?R():p.lv;g.fillStyle=lv<.25?'#ff4a3e':Z.trim;g.globalAlpha=.5;rr(g,X+8,Y-12-(Hh-30)*lv,W-16,(Hh-30)*lv,8);g.fill();g.globalAlpha=1;if(p.swollen){g.strokeStyle='rgba(255,90,60,.6)';g.lineWidth=2;g.beginPath();g.ellipse(X+W/2,Y-Hh/2,W/2+6,Hh/2-6,0,0,6.283);g.stroke()}};
PR.pixels=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T,n=p.n||8;for(let i=0;i<n;i++)for(let j=0;j<(p.h||4);j++){const x=X+i*16,y=Y-(j+1)*16;if(p.dead&&R()<.3){g.fillStyle='#000';rr(g,x,y,14,14,4);g.fill();continue}['#5a1010','#105a1a','#10225a'].forEach((c,k)=>{g.fillStyle=c;rr(g,x+k*4.6,y,4,14,2);g.fill()})}};
PR.crt=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T;g.fillStyle=shade(Z.house,.1);rr(g,X,Y-56,70,56,14);g.fill();g.fillStyle='#120c00';rr(g,X+8,Y-48,54,36,10);g.fill();g.fillStyle=Z.trim;g.globalAlpha=.8;g.font='8px "JetBrains Mono",monospace';(p.lines||['> _']).forEach((l,i)=>g.fillText(l,X+12,Y-38+i*9));g.globalAlpha=1;};

/* ---------- interactive bits ---------- */
const P=LP.PROPS;
P.anchor=s=>({kind:'anchor',anchor:true,x:s.tx*T+15,y:s.ty*T+15,t:Math.random()*6,layer:'mid',pulse:0,update(dt){this.t+=dt;this.pulse=Math.max(0,this.pulse-dt*2)},
  draw(g){const near=LP.abil.link&&Math.hypot(this.x-(H.x+9),this.y-(H.y+20))<320,r=7+Math.sin(this.t*3)*1.5;g.strokeStyle=near?'#7df0ff':'rgba(125,240,255,.35)';g.lineWidth=2;g.beginPath();g.arc(this.x,this.y,r+5+this.pulse*14,0,6.283);g.stroke();
    g.fillStyle=near?'#dffcff':'#2a5a66';g.beginPath();g.arc(this.x,this.y,r*.6,0,6.283);g.fill();if(near)LP.light(this.x,this.y,70,.6)}});
P.wind=s=>({kind:'wind',x:s.tx*T,y:s.ty*T,w:(s.w||3)*T,h:(s.h||10)*T,t:0,layer:'back',update(dt){this.t+=dt;const b=LP.heroBox();if(LP.overlap(b,this)&&!H.link){H.vy=Math.max(H.vy-3000*dt,-430);H.airDash=true}
    if(Math.random()<.35)LP.part({x:this.x+rand(0,this.w),y:this.y+this.h,vy:-rand(260,420),life:this.h/340,col:'rgba(220,245,255,.35)',s:2,k:'spark'})},
  draw(g){g.fillStyle='rgba(200,240,255,.05)';g.fillRect(this.x,this.y,this.w,this.h);g.strokeStyle='rgba(200,240,255,.18)';g.lineWidth=1;for(let i=0;i<3;i++){const yy=this.y+this.h-((this.t*260+i*this.h/3)%this.h);g.beginPath();g.moveTo(this.x+6,yy);g.quadraticCurveTo(this.x+this.w/2,yy-14,this.x+this.w-6,yy);g.stroke()}}});
P.arc=s=>({kind:'arc',x:s.tx*T+9,y:s.ty*T,h:(s.h||10)*T,ph:s.ph||0,t:0,layer:'front',on:false,warn:false,
  update(dt){this.t+=dt;const per=2.4,k=((LP.roomT+this.ph)%per)/per;this.on=k<.45;this.warn=!this.on&&k>.82;if(this.on&&!this.was){LP.sfx('zap')}this.was=this.on;if(this.on)LP.light(this.x+6,this.y+this.h/2,110,.8)},
  hazRects(){return this.on?[{x:this.x,y:this.y,w:12,h:this.h}]:[]},
  draw(g){g.fillStyle='#2a3510';g.beginPath();g.arc(this.x+6,this.y+4,9,0,6.283);g.arc(this.x+6,this.y+this.h-4,9,0,6.283);g.fill();
    if(this.on){g.strokeStyle='#f4ffb0';g.lineWidth=2.5;g.beginPath();g.moveTo(this.x+6,this.y);for(let y=this.y;y<this.y+this.h;y+=14)g.lineTo(this.x+6+(Math.random()-.5)*16,y);g.lineTo(this.x+6,this.y+this.h);g.stroke();g.strokeStyle='rgba(212,255,62,.4)';g.lineWidth=7;g.stroke()}
    else if(this.warn){g.fillStyle=`rgba(212,255,62,${.3+.3*Math.sin(this.t*40)})`;g.fillRect(this.x+4,this.y,4,this.h)}}});
P.pix=s=>{const p={x:s.tx*T,y:s.ty*T,w:90,h:12,on:true,dx:0,dy:0};return{kind:'pix',plat:p,ph:s.ph,layer:'mid',
  update(dt){const per=1.2,idx=Math.floor(LP.roomT/per)%2,frac=(LP.roomT%per)/per;p.on=idx===this.ph;this.warn=p.on&&frac>.7},
  draw(g){const al=p.on?(this.warn&&Math.sin(LP.t*40)>0?.3:1):.08;g.globalAlpha=al;['#ff3e3e','#3eff6b','#3e8bff'].forEach((c,i)=>{g.fillStyle=c;rr(g,p.x+i*30+2,p.y,26,12,5);g.fill()});g.fillStyle='rgba(255,255,255,.5)';g.fillRect(p.x+4,p.y+2,82,2);g.globalAlpha=1;if(p.on)LP.light(p.x+45,p.y,80,.6)}}};

/* ---------- new enemies ---------- */
const EN=LP.EN;
EN.shader=s=>{const e=EN.crawler({tx:s.tx,ty:s.ty});return Object.assign(e,{kind:'shader',x:s.tx*T,y:s.ty*T,w:26,h:26,hp:3,col:'#4ff0ff',hx:s.tx*T,hy:s.ty*T,st:'float',stT:rand(0,1),
  update(dt){this.t+=dt;this.stT+=dt;this.flash-=dt;const NM=LP.NM;if(this.kb>0){this.x+=this.kbv*dt;this.kb-=dt}
    if(this.st==='float'){this.x=lerp(this.x,this.hx+Math.sin(this.t*.8)*80,dt);this.y=lerp(this.y,this.hy+Math.cos(this.t)*30,dt);if(this.stT>(NM?rand(1,1.8):2)&&Math.hypot(H.x-this.x,H.y-this.y)<480){this.st='aim';this.stT=0;const dx=H.x+9-(this.x+13),dy=H.y+20-(this.y+13);this.horiz=Math.abs(dx)>Math.abs(dy);LP.sfx('warn')}}
    else if(this.st==='aim'){if(this.stT>(NM?rand(.35,.6):.6)){this.st='fire';this.stT=0;LP.sfx('zap')}}
    else if(this.st==='fire'){if(this.stT>.3){this.st='float';this.stT=0}}LP.light(this.x+13,this.y+13,60,.5)},
  hazRects(){if(this.st!=='fire')return[];const cx=this.x+13,cy=this.y+13;return[this.horiz?{x:cx-600,y:cy-6,w:1200,h:12}:{x:cx-6,y:cy-600,w:12,h:1200}]},
  draw(g){const cx=this.x+13,cy=this.y+13,t=this.t;if(this.st==='aim'){g.fillStyle=`rgba(79,240,255,${.15+.15*Math.sin(t*40)})`;if(this.horiz)g.fillRect(cx-600,cy-2,1200,4);else g.fillRect(cx-2,cy-600,4,1200)}
    if(this.st==='fire'){g.fillStyle='rgba(220,255,255,.9)';if(this.horiz)g.fillRect(cx-600,cy-4,1200,8);else g.fillRect(cx-4,cy-600,8,1200)}
    g.save();g.translate(cx,cy);g.rotate(t*1.2);['#ff4fd8','#4ff0ff','#fff3b0'].forEach((c,i)=>{g.globalAlpha=.75;g.fillStyle=this.flash>0?'#fff':c;g.beginPath();for(let k=0;k<3;k++){const a=k/3*6.283+i*.35;g.lineTo(Math.cos(a)*13,Math.sin(a)*13)}g.closePath();g.fill()});g.globalAlpha=1;g.fillStyle='#07020b';g.beginPath();g.arc(0,0,4,0,6.283);g.fill();g.restore()}})};
Object.assign(LP.HUSK_TOOLS,{
  roller:{reach:64,wind:.45,col:'#ff4fd8',box:[0,-56,66,56],draw(g,c){g.strokeStyle='#4a3a2a';g.lineWidth=3;g.beginPath();g.moveTo(0,0);g.lineTo(40,0);g.stroke();g.fillStyle=c;g.beginPath();g.ellipse(48,0,8,14,0,0,6.283);g.fill()}},
  fanblade:{reach:78,wind:.55,col:'#a8e8ff',box:[0,-60,80,60],draw(g,c){g.fillStyle=c;g.beginPath();g.moveTo(0,-4);g.quadraticCurveTo(40,-22,70,-6);g.quadraticCurveTo(40,4,0,4);g.closePath();g.fill()}},
  prod:{reach:70,wind:.4,col:'#d4ff3e',box:[2,-34,74,22],draw(g,c){g.strokeStyle='#3a3c44';g.lineWidth=4;g.beginPath();g.moveTo(0,0);g.lineTo(54,0);g.stroke();g.strokeStyle=c;g.lineWidth=2;g.beginPath();g.moveTo(54,-5);g.lineTo(62,0);g.lineTo(54,5);g.stroke()}},
  shard:{reach:66,wind:.38,col:'#e8e8f0',box:[0,-44,68,40],draw(g,c){g.fillStyle=c;g.globalAlpha=.85;g.beginPath();g.moveTo(0,-3);g.lineTo(58,-10);g.lineTo(46,8);g.closePath();g.fill();g.globalAlpha=1}}});

/* ---------- open the SSD arena to the east ---------- */
{const r=LP.rooms.ssd_boss;for(let y=12;y<=15;y++){r.grid[y*r.w+35]=0;r.grid0[y*r.w+35]=0}r.spawns=r.spawns.filter(s=>s.type!=='offline');r.spawns.push({type:'gate',tx:35,ty:12,n:4})}

/* ---------- people ---------- */
const VEE={name:'VEE · render tech',role:'tech',shiver:true,req:'fiend',
  say:['Every frame this laptop ever drew went through my hands. Sixty a second. I never saw the same one twice.','Then the frames started coming back wrong. Faces with too many eyes. My own reflection, smiling a second late.','The Fiend paints itself into every frame now. Don’t look at it too long.'],
  after:['First clean frame in weeks. I cried a little. Don’t tell the others.','The fans are next door. Hot air rises. So do you, I suppose.']};
const SPARKY={name:'SPARKY · cell keeper',role:'keeper',shiver:true,req:'surge',
  say:['The cells hum lullabies when they’re healthy. Listen.','…','That’s not a lullaby. That’s screaming at a very specific voltage.','Something is living in cell four. It woke up when the charger plugged in and it hasn’t stopped eating since.'],
  after:['Ninety-eight percent and holding. Best number I’ve heard all year.','The screen’s through there. Some of its pixels have stopped being pixels.']};
const GRAN={name:'GRAN BOOT · the first Bitling',role:'gran',req:'rootkit',
  say:['Before the operating system, before any of you, there was me and a blinking cursor.','The thing behind that wall didn’t get in. It was written in. Someone left a door open on purpose, a long, long time ago.',
    'Every monster you fought was a piece of it, reaching up through the board. This is the hand.','The red walls won’t stop something that has learned to move between moments. Go on, patch.'],
  after:['Listen. Hear that? Two hundred and twelve lamps in Copperhollow, all lit.','Go home, little patch. You did a very big thing.']};

/* ---------- GPU: the Render Farm ---------- */
D('gpu_gate','gpu',736,-54,32,18,r=>{r.border({L:[12,15],R:[12,15]});r.solid(0,0,32,3);r.solid(0,16,32,2);
  r.prop('die',3,16,{w:7,h:5,label:'SHADER BLOCK 0'});r.prop('cables',0,3,{w:32,n:3,sag:50});r.prop('lamp',12,16,{flicker:true});r.prop('poster',22,12,{title:'HAVE YOU SEEN',name:'MY FACE?'});r.prop('graffiti',18,8,{txt:'DON’T LOOK AT THE FRAMES',col:'rgba(255,79,216,.55)'});
  r.ent('npc',15,15,VEE);r.ent('save',25,15);r.ent('lore',29,15,{txt:'RENDER LOG\nFrame 88,201,447: something in the corner of every image.\nFrame 88,201,448: closer.'})});
D('gpu_cores','gpu',768,-54,48,18,r=>{r.border({L:[12,15],R:[12,15]});r.solid(0,0,48,3);r.solid(0,16,48,2);r.spikes(10,16,11);r.plat(14,12,3);r.solid(26,9,3,7);r.spikes(34,16,5);r.plat(35,12,3);
  r.prop('die',2,16,{w:6,h:6});r.prop('die',30,16,{w:5,h:5});r.prop('cables',0,3,{w:48,n:3,sag:60});r.prop('husk',41,16,{pose:'reach'});r.prop('lamp',22,16,{flicker:true});
  r.ent('shader',16,6);r.ent('shader',38,6);r.ent('husk',44,15,{tool:'roller'});r.ent('husk',6,15,{tool:'roller'});r.ent('hint',2,8,{txt:'TOO FAR?  JUMP · ↑ AGAIN · SHIFT'})});
D('gpu_boss','gpu',816,-54,36,18,r=>{r.border({L:[12,15],R:[12,15]});r.solid(0,0,36,2);r.solid(0,16,36,2);r.plat(5,11,5);r.plat(26,11,5);r.plat(15,8,6);
  r.ent('gate',0,12,{n:4});r.ent('gate',35,12,{n:4});r.ent('boss',0,0,{id:'fiend',trig:8});r.ent('shrine',17,15,{ab:'link',req:'fiend'});r.prop('die',13,16,{w:10,h:7});r.prop('cables',0,2,{w:36,n:3,sag:70})},{arena:1});

/* ---------- Cooling: the Heatsink ---------- */
D('fan_shaft','fan',852,-90,24,54,r=>{r.border({L:[48,51],R:[3,6]});r.solid(0,0,24,3);r.solid(0,52,24,2);r.solid(16,7,8,1);r.plat(2,40,4);r.plat(18,28,4);
  [[8,46],[15,40],[8,34],[15,28],[8,22],[15,16],[13,6]].forEach(([x,y])=>r.ent('anchor',x,y));r.ent('wind',18,12,{w:4,h:16});r.ent('wind',3,30,{w:4,h:21});
  r.prop('fins',1,52,{n:8,h:6,frost:true});r.prop('fins',15,52,{n:4,h:4});r.prop('sign',12,52,{txt:'UPDRAFT AHEAD'});r.ent('hint',1,49,{txt:'R  ZIP TO A NODE'});r.ent('flyer',12,30);r.ent('flyer',10,14)});
D('fan_boss','fan',876,-99,36,18,r=>{r.border({L:[12,15],R:[12,15]});r.solid(0,0,36,2);r.solid(0,16,36,2);r.plat(3,11,5);r.plat(28,11,5);
  r.ent('gate',0,12,{n:4});r.ent('gate',35,12,{n:4});r.ent('boss',0,0,{id:'runaway',trig:8});r.ent('anchor',14,7);r.ent('anchor',22,7);r.ent('shrine',17,15,{ab:'phase',req:'runaway'});
  r.prop('fins',1,16,{n:4,h:4,frost:true});r.prop('fins',28,16,{n:4,h:4,frost:true});r.ent('lore',2,15,{txt:'COOLANT LOG\nFan speed 100%. Temperature still rising.\nFan speed 140%. The fan is not cooling the laptop anymore.\nIt is cooling itself. It is getting ready to run.'})},{arena:1});

/* ---------- Battery: the Cells ---------- */
D('bat_cells','bat',912,-99,48,18,r=>{r.border({L:[12,15],R:[12,15]});r.solid(0,0,48,3);r.solid(0,16,48,2);r.spikes(17,16,4);r.spikes(30,16,4);r.plat(17,12,4);r.plat(30,12,4);
  [[12,3,13,0],[24,3,13,.8],[36,3,13,1.6]].forEach(([x,y,h,ph])=>r.ent('arc',x,y,{h,ph}));
  r.prop('cell',2,16,{w:2,h:5,lv:.9});r.prop('cell',5,16,{w:2,h:4,lv:.6});r.prop('cell',26,16,{w:3,h:5,lv:.2,swollen:true});r.prop('cell',42,16,{w:3,h:6,lv:.1,swollen:true});r.prop('lamp',9,16);r.prop('husk',22,16,{pose:'kneel'});
  r.ent('npc',7,15,SPARKY);r.ent('save',3,15);r.ent('husk',28,15,{tool:'prod'});r.ent('husk',44,15,{tool:'prod'});r.ent('hint',10,9,{txt:'WAIT FOR THE GAP · OR DASH THROUGH IF YOU CAN PHASE'})});
D('bat_boss','bat',960,-99,36,18,r=>{r.border({L:[12,15],R:[12,15]});r.solid(0,0,36,2);r.solid(0,16,36,2);r.plat(4,11,5);r.plat(27,11,5);
  r.ent('gate',0,12,{n:4});r.ent('gate',35,12,{n:4});r.ent('boss',0,0,{id:'surge',trig:8});r.ent('anchor',10,5);r.ent('anchor',25,5);r.prop('cell',1,16,{w:2,h:6,lv:.05,swollen:true});r.prop('cell',33,16,{w:2,h:6,lv:.05,swollen:true})},{arena:1});

/* ---------- Display: the Panel ---------- */
D('lcd_hall','lcd',996,-99,48,18,r=>{r.border({L:[12,15],R:[12,15]});r.solid(0,0,48,3);r.solid(0,17,48,1);r.solid(0,16,7,1);r.solid(41,16,7,1);r.spikes(7,16,34);
  [9,15,21,27,33].forEach((x,i)=>r.ent('pix',x,13,{ph:i%2}));[[12,7],[24,6],[36,7]].forEach(([x,y])=>r.ent('anchor',x,y));
  r.prop('pixels',1,16,{n:6,h:5});r.prop('pixels',42,16,{n:5,h:6,dead:true});r.ent('lore',3,15,{txt:'PANEL NOTE\nPixel 1,204,331 stopped responding.\nThen its neighbours.\nThen it started moving.'});r.ent('husk',44,15,{tool:'shard'})});
D('lcd_boss','lcd',1044,-99,36,18,r=>{r.border({L:[12,15],R:[12,15]});r.solid(0,0,36,2);r.solid(0,16,36,2);r.plat(5,11,5);r.plat(26,11,5);r.plat(15,8,6);
  r.ent('gate',0,12,{n:4});r.ent('gate',35,12,{n:4});r.ent('boss',0,0,{id:'pixel',trig:8});r.prop('pixels',2,16,{n:8,h:7,dead:true});r.prop('pixels',24,16,{n:8,h:7})},{arena:1});

/* ---------- BIOS: the Firmware ---------- */
D('bios_gate','bios',1080,-99,32,18,r=>{r.border({L:[12,15],R:[12,15]});r.solid(0,0,32,3);r.solid(0,16,32,2);for(let y=3;y<16;y++){r.grid[y*32+12]=7;r.grid[y*32+22]=7}
  r.prop('crt',2,16,{lines:['> POST ... OK','> BOOT ORDER: ?','> WHO ARE YOU']});r.prop('crt',26,16,{lines:['> ROOT ACCESS','> GRANTED','> GRANTED']});r.prop('candles',15,16,{n:5});
  r.ent('npc',6,15,GRAN);r.ent('save',17,15);r.ent('hint',4,9,{txt:'RED WALLS: DASH THROUGH WITH PHASE SHIFT'})});
D('bios_boss','bios',1112,-99,40,18,r=>{r.border({L:[12,15]});r.solid(0,0,40,2);r.solid(0,16,40,2);r.plat(4,11,6);r.plat(30,11,6);r.plat(16,8,8);
  r.ent('gate',0,12,{n:4});r.ent('boss',0,0,{id:'rootkit',trig:8});[[8,4],[20,3],[32,4]].forEach(([x,y])=>r.ent('anchor',x,y));r.prop('crt',17,16,{lines:['> _']})},{arena:1});
})();
