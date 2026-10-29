/* LAST PATCH — stage 2 (RAM + SSD), the story dressing for every room, new enemies. */
(function(){
'use strict';
const LP=window.LP,T=LP.T,{clamp,rand,pick,lerp,appr,sign}=LP,H=LP.H,D=LP.defRoom;

/* ---------- zones, music, abilities ---------- */
Object.assign(LP.ZONES,{
  ram:{name:'THE RAM',sub:'cache row, where nobody remembers',bg:'#03050d',far:'#0e1830',tile:'#0f1830',tileHi:'#1c2d56',edge:'#7fd8ff',acc:'#b8f0ff',spike:'#ff5bd1',dark:.5,music:'ram',mote:'#9fe0ff',
    house:'#18223e',roof:'#222e58',trim:'#7fd8ff',win:'#b8f0ff',cloth:['#7fd8ff','#ff5bd1','#b8f0ff','#c45bff']},
  ssd:{name:'LONG STORAGE',sub:'the solid state archive',bg:'#040508',far:'#141922',tile:'#191e28',tileHi:'#2b3342',edge:'#9aa6c2',acc:'#ffe2a8',spike:'#ff3e3e',dark:.56,music:'ssd',mote:'#c8d0e0',
    house:'#20242e',roof:'#2c313d',trim:'#c9b896',win:'#ffe2a8',cloth:['#c9b896','#9aa6c2','#ff3e3e','#6a7a9a']}});
Object.assign(LP.TRK,{
  ram:{bpm:100,root:47,prog:[0,-3,-5,-2],bass:'x.......x.......',arp:'x.xxx.x.x.xxx.x.',kick:'x.......x.......',hat:'..x...x...x...x.',snare:'',pad:1,arpType:'triangle',arpOct:2},
  ssd:{bpm:80,root:38,prog:[0,1,0,-2],bass:'x...x...x...x...',arp:'x...x.x.....x...',kick:'x.......x..x....',hat:'....x.......x...',snare:'',pad:1,arpType:'square',arpOct:2},
  boss3:{bpm:140,root:42,prog:[0,-2,3,1],bass:'x.x.xx.xx.x.xx.x',arp:'xx.xx.xx.xx.x.xx',kick:'x..x..x...x..x..',hat:'.x.x.x.x.x.x.x.x',snare:'....x.......x...',pad:0,arpType:'triangle',arpOct:3},
  boss4:{bpm:156,root:36,prog:[0,1,-1,0],bass:'xx.x.xx.xx.x.xx.',arp:'x.x.x.xxx.x.x.xx',kick:'x.x.x.x.x.x.x.x.',hat:'xxxxxxxxxxxxxxxx',snare:'....x.......x..x',pad:0,arpType:'sawtooth',arpOct:2},
  frenzy:{bpm:176,root:40,prog:[0,1,0,3],bass:'xxxxxxxxxxxxxxxx',arp:'x.xxx.xxx.xxx.xx',kick:'x.x.x.x.x.x.x.x.',hat:'xxxxxxxxxxxxxxxx',snare:'..x...x...x...xx',pad:0,arpType:'sawtooth',arpOct:3}});
Object.assign(LP.ABIL,{
  dj:{name:'BOOTSTRAP JUMP',desc:'Kick off the air itself. Press ↑ again in mid-air for a second jump.',key:'↑ IN THE AIR'},
  slam:{name:'HARD RESET',desc:'Drop like a dead drive. In mid-air hold ↓ and press SHIFT to slam down, shattering cracked floors and stunning anything you land near.',key:'↓ + SHIFT IN THE AIR'}});

/* ---------- people of the Board ---------- */
const WATT={name:'OLD WATT · lamplighter of Copperhollow',role:'elder',shiver:true,req:'weaver',
  say:['You’re the patch? You’re smaller than I pictured. Then again, so am I.',
    'This was Copperhollow. Two hundred and twelve of us. Market every boot, and the Route 7 bus came through twice a cycle with fresh packets.',
    'Then something came up through the vents and started eating the copper. The lamps went first. Then the bus line. Then the folks who couldn’t run fast enough.',
    'Those grey shapes by the road? Those were my neighbours. The rot gets inside you and you just… stop. Tessa was holding her boy when it got her.',
    'It nests to the west, past the memorial. I light a lamp every night so it knows somebody’s still here.'],
  after:['The chewing stopped. First quiet night in a long time.','I lit a lamp for every one of them. Took me all night. Worth it.','Go on, patch. The Core’s east of here. Tick will want to see you.']};
const TICK={name:'FOREMAN TICK · night shift, the Core',role:'worker',shiver:true,req:'ripper',
  say:['Stop right there — oh. You’re not one of them. Sorry. Nerves.','We ran the Core. Four billion beats a second and my crew never missed one. Not once in nine years.',
    'Then the scheduler stopped answering, and a thread started… wearing it. Walking around in it.','My whole shift went in to fix it. I’m the only one who walked back out. I don’t know why it let me.'],
  after:['The beat’s steady again. I can feel it in my teeth.','I’m changing the board to one day without a missed beat. Then two. Then we’ll see.','Past the scheduler there’s a lift up to Cache Row. Nobody’s heard from them in days.']};
const NELL={name:'NELL · librarian, Cache Row',role:'clerk',req:'leak',
  say:['Welcome to Cache Row. Everything here is temporary. That’s always been the point: we remember fast, and we forget at shutdown, and that was fine.',
    'But something is leaking. People forget each other while they’re still awake. My sister walked past me this morning like I was a wall.',
    'It’s past the old reading rooms. It drinks what we remember and it is never, ever full.','If you see a little one with a bow, she’s looking for her mother. Her mother is looking for her too. Neither can remember the other’s face.'],
  after:['I remembered her name the second you won. Bree. My sister’s name is Bree.','Everyone is outside. Nobody knows why. I think we just wanted to look at each other.']};
const PIP={name:'PIP',role:'kid',shiver:true,req:'leak',
  say:['Are you a grown-up? I lost my mom.','I can’t… I can’t remember what she looks like. Is that bad?','She sings when she fixes things. I remember the song. I don’t remember her.'],
  after:['Mom found me! She was singing the song and I just KNEW.','She says you’re a hero. You’re really small for a hero.','The scary drive place is through there. Grown-ups don’t go there. Be careful, okay?']};
const OAK={name:'ARCHIVIST OAK · Long Storage',role:'archivist',req:'sector',
  say:['Long Storage. We keep everything down here, forever. Every photo. Every unsent letter. Every save file of every game anyone ever quit.',
    'Something woke up in the bad blocks. Wherever it steps, things aren’t destroyed. They’re just… not there. Not even a gap where they were.',
    'If it reaches the index, this whole laptop forgets it ever existed.','There’s a cracked floor here I’ve never been brave enough to open. Something under it hums.'],
  after:['The index held. I am marking this day in permanent ink. We only have permanent ink.','You hit the floor hard enough to reset a drive, I hear. Try the cracked tiles by the shelves.']};

/* ---------- dress the stage 1 rooms ---------- */
const R=LP.rooms;
const dress=(id,fn)=>{const r=R[id];const api={prop:(k,x,y,o)=>r.props.push(Object.assign({k,x,y},o||{})),ent:(t,x,y,o)=>r.spawns.push(Object.assign({type:t,tx:x,ty:y},o||{}))};fn(api)};
dress('mb_drop',d=>{d.prop('port',7,2,{w:6});d.prop('cables',0,2,{w:32,n:2,sag:40});d.prop('crates',23,16,{n:3,label:'PKTS'});d.prop('barrels',28,16,{n:2});d.prop('lamp',11,16,{off:true});d.prop('lamp',21,16,{flicker:true});
  d.prop('sign',17,16,{txt:'COPPERHOLLOW →'});d.prop('poster',2,12,{title:'CURFEW',name:'AFTER SHUTDOWN'});d.ent('spark',27,2)});
dress('mb_hall',d=>{d.prop('cables',0,3,{w:64,n:3,sag:50});d.prop('house',1,16,{w:5,h:4,sign:'WATT & SONS',lit:[1,0]});d.prop('house',7,16,{w:4,h:3,broken:true,rot:true,ajar:true});d.prop('stall',12,16,{w:3,txt:'FRESH PACKETS',knocked:true});
  d.prop('bunting',1,9,{w:15,torn:true});d.prop('lamp',16,16);d.prop('lamp',26,16,{flicker:true});d.prop('growth',18,16,{w:2});d.prop('growth',25,16,{w:2});d.prop('husk',29,16,{pose:'reach'});d.prop('husk',31,16,{pose:'hug',flip:true});
  d.prop('graffiti',27,8,{txt:'IT HEARS YOU CHEW'});d.prop('tram',38,16,{w:5,tilt:-.12});d.prop('lamp',39,16,{off:true});d.prop('growth',45,16,{w:2});d.prop('growth',51,16,{w:2});d.prop('poster',46,12,{name:'TESSA'});
  d.prop('crates',52,16,{n:4,label:'OIL'});d.prop('sign',59,16,{txt:'POP. 212',cross:[10,40],add:'?'});d.prop('lamp',55,16);
  d.ent('npc',54,15,WATT)});
dress('mb_junction',d=>{d.prop('pipe',3,3,{v:1,w:12});d.prop('pipe',28,3,{v:1,w:12});d.prop('sign',21,16,{txt:'BUS LINE ↓ CLOSED'});d.prop('lamp',8,16,{flicker:true});d.prop('cables',0,19,{w:32,n:2,sag:30});d.prop('rails',1,34,{w:9,bent:true});
  d.prop('husk',10,34,{pose:'kneel'});d.prop('growth',2,34,{w:3});d.prop('lamp',25,34);d.ent('spark',16,19)});
dress('mb_lower',d=>{d.prop('barrels',2,16,{n:3});d.prop('bed',17,16);d.prop('table',21,16);d.prop('candles',11,16,{n:3});d.prop('crates',25,16,{n:3,label:'SALT'});d.prop('shelf',28,16,{w:3,h:3,gaps:true});
  d.prop('poster',8,12,{name:'BEN & ISA'});d.prop('graffiti',3,8,{txt:'STAY QUIET. IT LISTENS.'})});
dress('mb_ante',d=>{d.prop('web',1,3,{r:130});d.prop('crates',1,16,{n:3});d.prop('husk',4,16,{pose:'reach'});d.prop('husk',7,16,{pose:'kneel',flip:true});d.prop('candles',13,16,{n:5,photo:true});
  d.prop('poster',13,11,{name:'TESSA'});d.prop('poster',15,12,{name:'LOU'});d.prop('poster',17,11,{name:'MARGO'});d.prop('candles',23,16,{n:3});d.prop('husk',26,16,{pose:'hug'});d.prop('husk',29,16,{pose:'reach',flip:true});
  d.prop('graffiti',3,7,{txt:'WEST WING · DO NOT ENTER',col:'rgba(255,200,120,.6)'})});
dress('mb_boss',d=>{d.prop('web',1,2,{r:150});d.prop('web',31,2,{r:150,flip:true});[[3,90],[9,70],[22,100],[28,60]].forEach(([x,l])=>d.prop('cocoon',x,2,{l}));d.prop('husk',6,16,{pose:'kneel'});d.prop('growth',12,16,{w:3});d.prop('growth',20,16,{w:3});d.prop('cables',0,2,{w:32,n:2,sag:80})});
dress('mb_gap',d=>{d.prop('rails',1,16,{w:17,bent:true});d.prop('rails',27,16,{w:20});d.prop('sign',14,16,{txt:'BRIDGE OUT'});d.prop('lamp',30,16,{off:true});d.prop('lamp',40,16,{flicker:true});d.prop('cables',0,3,{w:48,n:2,sag:60})});
dress('cpu_gate',d=>{d.prop('lockers',2,16,{n:4});d.prop('poster',7,12,{title:'SAFETY',name:'MIND THE CLOCK'});d.prop('sign',10,16,{txt:'DAYS WITHOUT A MISSED BEAT: 0'});d.prop('arch',22,16,{w:7,h:5,txt:'THE CORE · THREADS ONLY'});
  d.ent('steam',20,15);d.ent('steam',5,15);d.ent('npc',14,15,TICK)});
dress('cpu_clock',d=>{d.prop('clock',24,7,{r:95,crack:true});d.prop('pipe',0,4,{w:48});d.prop('lamp',2,16);d.prop('lamp',45,16,{flicker:true});d.ent('steam',3,15);d.ent('steam',44,15)});
dress('cpu_cache',d=>{d.prop('shelf',3,34,{w:4,h:4});d.prop('shelf',24,34,{w:4,h:5,gaps:true});d.prop('crates',14,34,{n:3,label:'L2'});d.prop('lamp',9,34);d.prop('graffiti',12,26,{txt:'HOT DATA ↑',col:'rgba(255,180,90,.6)'});d.prop('pipe',29,4,{v:1,w:28})});
dress('cpu_pipe',d=>{d.prop('pipe',0,3,{w:64});d.prop('sign',1,16,{txt:'LINE 3'});d.prop('cables',0,3,{w:64,n:3,sag:50});d.ent('steam',2,15);d.ent('steam',60,15);d.ent('spark',33,3)});
dress('cpu_ante',d=>{d.prop('table',11,16,{tipped:true});d.prop('lockers',22,16,{n:3});d.prop('poster',4,12,{title:'MEMO',name:'NO OVERTIME'});d.prop('husk',14,16,{pose:'kneel'});d.prop('graffiti',24,8,{txt:'IT WEARS THE SCHEDULER',col:'rgba(255,140,80,.6)'});d.prop('lamp',28,16,{flicker:true})});
dress('cpu_boss',d=>{d.prop('machine',11,16,{w:13,h:6,label:'SCHEDULER',rot:true});d.prop('clock',4,5,{r:60,crack:true});d.prop('cables',0,2,{w:36,n:3,sag:70})});

/* ---------- RAM: Cache Row ---------- */
D('ram_shaft','ram',420,-45,20,36,r=>{r.border({L:[30,33],R:[3,6]});r.solid(0,0,20,3);r.solid(0,34,20,2);r.solid(6,8,2,22);r.solid(13,7,2,24);r.solid(15,7,5,1);
  r.ent('hint',1,28,{txt:'HOLD → INTO A WALL · ↑ TO KICK OFF'});r.ent('flyer',10,22);r.ent('wisp',10,12);
  r.prop('sign',2,34,{txt:'LIFT OUT OF ORDER'});r.prop('cables',8,3,{w:5,n:2,sag:10});r.prop('lamp',16,34,{flicker:true});r.prop('growth',8,34,{w:3})});
D('ram_town','ram',440,-54,64,18,r=>{r.border({L:[12,15],R:[12,15]});r.solid(0,0,64,3);r.solid(0,16,64,2);r.spikes(28,16,4);r.plat(14,11,5);r.plat(40,11,6);
  r.prop('tower',1,16,{w:5,h:9,sign:'BLOCK A'});r.prop('tower',7,16,{w:4,h:11,rot:true});r.prop('tower',19,16,{w:5,h:8,sign:'CACHE ROW'});r.prop('stall',25,16,{w:3,txt:'NOODLES · CLOSED',knocked:true});
  r.prop('tower',33,16,{w:5,h:10,litChance:.4});r.prop('tower',46,16,{w:4,h:9,rot:true});r.prop('tower',52,16,{w:6,h:8,sign:'BLOCK F'});r.prop('bunting',8,7,{w:12});r.prop('bunting',40,7,{w:14,torn:true});
  r.prop('lamp',13,16);r.prop('lamp',32,16,{flicker:true});r.prop('lamp',44,16);r.prop('poster',27,12,{title:'MISSING',name:'??? (I FORGET)'});r.prop('graffiti',46,6,{txt:'WHO AM I',col:'rgba(127,216,255,.6)'});
  r.prop('growth',27,16,{w:1});r.prop('growth',32,16,{w:1});
  r.ent('dripfx',10,3);r.ent('dripfx',30,3);r.ent('dripfx',50,3);r.ent('npc',23,15,NELL);r.ent('save',38,15);r.ent('wisp',18,8);r.ent('wisp',44,6);r.ent('leaklet',11,15);r.ent('leaklet',55,15)});
D('ram_flood','ram',504,-54,48,18,r=>{r.border({L:[12,15],R:[12,15]});r.solid(0,0,48,3);r.solid(0,17,48,1);r.solid(0,16,6,1);r.solid(42,16,6,1);r.spikes(6,16,36);
  r.plat(7,13,4);r.plat(13,11,4);r.plat(19,13,4);r.plat(25,10,4);r.plat(31,12,4);r.plat(37,13,4);
  r.prop('shelf',2,16,{w:3,h:5});r.prop('shelf',43,16,{w:4,h:5,gaps:true});r.prop('sign',8,9,{txt:'READING ROOM · QUIET',hang:true});r.prop('husk',3,10,{pose:'kneel',s:.9});
  r.ent('lore',44,15,{txt:'READING ROOM LOG\nThe pool rose overnight. It is warm and it hums and if you look into it you see things you used to know.\nDo not look into it.'});
  r.ent('wisp',16,6);r.ent('wisp',34,6);r.ent('dripfx',15,3);r.ent('dripfx',27,3);r.ent('dripfx',39,3)});
D('ram_ante','ram',552,-54,32,18,r=>{r.border({L:[12,15],R:[12,15]});r.solid(0,0,32,3);r.solid(0,16,32,2);
  r.prop('bed',2,16);r.prop('candles',6,16,{n:3});r.prop('poster',13,12,{title:'FOUND',name:'LITTLE GIRL · BOW'});r.prop('tower',22,16,{w:4,h:7,rot:true});r.prop('lamp',26,16,{flicker:true});
  r.ent('npc',10,15,PIP);r.ent('save',18,15);r.ent('lore',29,15,{txt:'GARBAGE COLLECTOR’S NOTE\nIt isn’t eating memory. It’s keeping it. All of it. It has never let a single thing go.\nThat isn’t hunger. That’s a leak.'})});
D('ram_boss','ram',584,-54,36,18,r=>{r.border({L:[12,15],R:[12,15]});r.solid(0,0,36,2);r.solid(0,16,36,2);r.plat(3,12,6);r.plat(15,10,6);r.plat(27,12,6);r.plat(10,13,3);r.plat(23,13,3);
  r.ent('gate',0,12,{n:4});r.ent('gate',35,12,{n:4});r.ent('boss',0,0,{id:'leak',trig:8});r.ent('shrine',17,15,{ab:'dj',req:'leak'});
  r.prop('tower',2,16,{w:4,h:6,rot:true});r.prop('tower',29,16,{w:5,h:6,rot:true});r.prop('cables',0,2,{w:36,n:2,sag:60})},{arena:1});

/* ---------- SSD: Long Storage ---------- */
D('ssd_hall','ssd',620,-54,48,18,r=>{r.border({L:[12,15],R:[12,15]});r.solid(0,0,48,3);r.solid(0,16,48,2);r.solid(14,10,4,6);r.spikes(24,16,9);r.solid(36,9,4,7);
  r.prop('shelf',2,16,{w:4,h:6});r.prop('shelf',7,16,{w:3,h:6,gaps:true});r.prop('platter',21,16,{r:50,n:4});r.prop('sign',19,9,{txt:'SECTOR 7G',hang:true});r.prop('shelf',41,16,{w:5,h:6});
  r.prop('sign',28,7,{txt:'DO NOT DEFRAGMENT',hang:true});r.prop('husk',33,16,{pose:'reach',flip:true});r.prop('lamp',11,16,{flicker:true});r.prop('lamp',44,16);
  r.ent('hint',4,8,{txt:'TOO HIGH?  ↑ AGAIN IN THE AIR'});r.ent('roller',8,15);r.ent('scanner',29,6);r.ent('roller',43,15)});
D('ssd_vault','ssd',668,-54,32,18,r=>{r.border({L:[12,15],R:[12,15]});r.solid(0,0,32,3);r.solid(0,16,32,2);r.crack(14,16,4,2);
  r.prop('shelf',2,16,{w:4,h:6});r.prop('shelf',22,16,{w:4,h:6,gaps:true});r.prop('platter',28,16,{r:40,n:5});r.prop('graffiti',13,13,{txt:'IT HUMS DOWN THERE',col:'rgba(255,226,168,.4)',size:12});
  r.ent('npc',9,15,OAK);r.ent('save',20,15);r.prop('lamp',6,16);r.prop('lamp',26,16,{flicker:true})});
D('ssd_secret','ssd',678,-36,12,10,r=>{r.border({T:[4,7]});r.solid(0,9,12,1);r.plat(1,6,3);r.plat(5,3,3);r.plat(8,6,3);
  r.prop('candles',1,9,{n:4});r.prop('shelf',9,9,{w:2,h:3});
  r.ent('lore',6,8,{txt:'FILE 0000 · RECOVERED\nThe first infection came in at 3:12 a.m. as an attachment called invoice_FINAL_final2.exe.\nSomeone opened it. They were tired. It wasn’t their fault.\nEverything that is eating this laptop was born from one tired click.'})});
D('ssd_boss','ssd',700,-54,36,18,r=>{r.border({L:[12,15]});r.solid(0,0,36,2);r.solid(0,16,36,1);r.spikes(1,17,34);r.barrier(35,12,1,4);r.plat(5,11,5);r.plat(26,11,5);r.plat(15,8,6);
  r.ent('gate',0,12,{n:4});r.ent('boss',0,0,{id:'sector',trig:8});r.ent('shrine',17,15,{ab:'slam',req:'sector'});r.ent('offline',33,13);
  r.prop('platter',5,16,{r:60,n:3});r.prop('platter',31,16,{r:60,n:3});r.prop('cables',0,2,{w:36,n:3,sag:70})},{arena:1});

/* ---------- new enemies ---------- */
const EN=LP.EN;
const mk=o=>{const e=EN.crawler({tx:0,ty:0});Object.assign(e,o);return e};
const near=(e,r)=>Math.hypot(H.x+9-(e.x+e.w/2),H.y+20-(e.y+e.h/2))<r;
EN.wisp=s=>mk({kind:'wisp',x:s.tx*T,y:s.ty*T,w:24,h:24,hp:2,col:'#9fe0ff',hx:s.tx*T,hy:s.ty*T,vis:1,ph:0,cd:rand(1,3),
  update(dt){this.t+=dt;const NM=LP.NM;this.cd-=dt;
    if(this.cd<=0){if(this.ph===0){this.ph=1;this.cd=NM?rand(.6,1.4):1.4}else if(this.ph===1){this.ph=2;this.cd=.5;if(NM&&Math.random()<.5){this.x=H.x+rand(-160,160);this.y=H.y-rand(60,140)}}
      else{this.ph=0;this.cd=NM?rand(.8,1.6):1.8;const cx=this.x+12,cy=this.y+12,a=Math.atan2(H.y+20-cy,H.x+9-cx);LP.shots.push({x:cx,y:cy,vx:Math.cos(a)*190,vy:Math.sin(a)*190,r:7,col:'#9fe0ff',life:3.5,brk:true});LP.sfx('bullet')}}
    this.vis=appr(this.vis,this.ph===1?.08:1,dt*3);const tx=this.hx+Math.sin(this.t*.7)*60,ty=this.hy+Math.cos(this.t*1.1)*30;this.x+=(tx-this.x)*dt*.8+(this.kb>0?this.kbv*dt:0);this.y+=(ty-this.y)*dt*.8;this.kb-=dt;this.flash-=dt;if(this.vis>.5)LP.light(this.x+12,this.y+12,70,.5)},
  hurt(d,dir){if(this.vis<.4)return false;return EN.crawler({tx:0,ty:0}).hurt.call(this,d,dir)},
  draw(g){const cx=this.x+12,cy=this.y+12,t=this.t;g.globalAlpha=this.vis;const gr=g.createRadialGradient(cx,cy,2,cx,cy,22);gr.addColorStop(0,this.flash>0?'#fff':'rgba(200,240,255,.9)');gr.addColorStop(.5,'rgba(127,216,255,.35)');gr.addColorStop(1,'rgba(127,216,255,0)');g.fillStyle=gr;g.beginPath();g.arc(cx,cy,22,0,6.283);g.fill();
    g.fillStyle='rgba(160,220,255,.5)';g.beginPath();g.moveTo(cx-10,cy);for(let i=0;i<=6;i++)g.lineTo(cx-10+i*20/6,cy+14+Math.sin(t*8+i)*5);g.lineTo(cx+10,cy);g.fill();
    g.fillStyle='#03050d';g.beginPath();g.ellipse(cx-4,cy-2,2.6,4,0,0,6.283);g.ellipse(cx+4,cy-2,2.6,4,0,0,6.283);g.fill();g.globalAlpha=1}});
EN.leaklet=s=>mk({kind:'leaklet',x:s.tx*T+3,y:(s.ty+1)*T-18,w:22,h:18,hp:2,col:'#ff5bd1',wait:rand(.4,1.2),sq:0,
  update(dt){this.t+=dt;this.vy+=2000*dt;if(this.ground){this.vx=this.kb>0?this.kbv:appr(this.vx,0,1500*dt);this.wait-=dt;if(this.wait<=0&&near(this,380)){this.wait=LP.NM?rand(.2,.9):.9;this.vx=Math.sign(H.x-this.x)*(LP.NM?rand(120,260):170);this.vy=-rand(300,480)}}
    this.kb-=dt;LP.moveBody(this,dt);this.flash-=dt},
  draw(g){const x=this.x+11,y=this.y+18,s=this.ground?1:1.15;g.save();g.translate(x,y);g.scale(1/s,s);const gr=g.createRadialGradient(-3,-10,1,0,-7,14);gr.addColorStop(0,this.flash>0?'#fff':'rgba(255,200,240,.95)');gr.addColorStop(1,'rgba(150,30,120,.9)');g.fillStyle=gr;
    g.beginPath();g.moveTo(-11,0);g.quadraticCurveTo(-12,-16,0,-17);g.quadraticCurveTo(12,-16,11,0);g.closePath();g.fill();g.fillStyle='#1a0414';g.beginPath();g.arc(-4,-8,2.2,0,6.283);g.arc(4,-8,2.2,0,6.283);g.fill();g.restore()}});
EN.roller=s=>mk({kind:'roller',x:s.tx*T+3,y:(s.ty+1)*T-26,w:26,h:26,hp:4,col:'#c9b896',dir:pick([-1,1]),roll:0,heavy:true,ang:0,
  update(dt){this.t+=dt;this.vy+=2000*dt;const NM=LP.NM;if(this.roll>0){this.roll-=dt;this.vx=this.dir*(NM?rand(300,380):320)}else{this.vx=this.kb>0?this.kbv:this.dir*40;if(near(this,300)&&Math.abs(H.y+H.h-(this.y+this.h))<40&&Math.random()<dt*(NM?2.4:1.2)){this.dir=Math.sign(H.x-this.x)||1;this.roll=NM?rand(.4,1):.8;LP.sfx('whoosh')}}
    this.kb-=dt;LP.moveBody(this,dt);if(this.hitWall){this.dir*=-1;if(this.roll>0){LP.shake(4);this.roll=0}}this.ang+=this.vx*dt/13;this.flash-=dt},
  draw(g){const cx=this.x+13,cy=this.y+13;g.save();g.translate(cx,cy);g.rotate(this.ang);const gr=g.createRadialGradient(-4,-5,1,0,0,14);gr.addColorStop(0,this.flash>0?'#fff':'#8a8f9c');gr.addColorStop(1,'#1e2129');g.fillStyle=gr;g.beginPath();g.arc(0,0,13,0,6.283);g.fill();
    g.strokeStyle='rgba(255,62,62,.8)';g.lineWidth=1.5;g.beginPath();g.moveTo(-8,-6);g.lineTo(-1,0);g.lineTo(-5,8);g.moveTo(-1,0);g.lineTo(9,-3);g.stroke();g.restore();g.fillStyle=this.roll>0?'#ff3e3e':'#ffb0a0';g.beginPath();g.arc(cx+this.dir*5,cy-2,2.5,0,6.283);g.fill()}});
EN.scanner=s=>mk({kind:'scanner',x:s.tx*T,y:s.ty*T,w:30,h:16,hp:3,col:'#ffe2a8',hx:s.tx*T,beam:0,tell:0,cd:rand(1,2),
  update(dt){this.t+=dt;const NM=LP.NM;this.x=appr(this.x,clamp(H.x-6,this.hx-260,this.hx+260),(this.tell>0||this.beam>0?0:(NM?140:90))*dt)+(this.kb>0?this.kbv*dt:0);this.kb-=dt;this.y=this.y0=(this.y0||this.y)+Math.sin(this.t*2)*.3;
    if(this.beam>0){this.beam-=dt}else if(this.tell>0){this.tell-=dt;if(this.tell<=0){this.beam=.45;LP.sfx('zap')}}else{this.cd-=dt;if(this.cd<=0&&near(this,420)){this.tell=NM?rand(.3,.6):.6;this.cd=NM?rand(.8,1.8):2;LP.sfx('warn')}}this.flash-=dt;LP.light(this.x+15,this.y+8,70,.5)},
  hazRects(){return this.beam>0?[{x:this.x+6,y:this.y+16,w:18,h:600}]:[]},
  draw(g){const x=this.x,y=this.y;if(this.tell>0){g.fillStyle=`rgba(255,226,168,${.15+.15*Math.sin(this.t*40)})`;g.fillRect(x+12,y+16,6,600)}if(this.beam>0){g.fillStyle='rgba(255,240,200,.85)';g.fillRect(x+8,y+16,14,600);g.fillStyle='rgba(255,226,168,.3)';g.fillRect(x+2,y+16,26,600);LP.light(x+15,y+80,120,.8)}
    const gr=g.createLinearGradient(x,0,x+30,0);gr.addColorStop(0,'#5a6070');gr.addColorStop(.5,this.flash>0?'#fff':'#d8dce8');gr.addColorStop(1,'#4a5060');g.fillStyle=gr;g.beginPath();g.ellipse(x+15,y+8,15,7,0,0,6.283);g.fill();g.fillStyle=this.tell>0?'#fff':'#ff3e3e';g.beginPath();g.arc(x+15,y+11,3,0,6.283);g.fill()}});
EN.hatchling=s=>{const e=EN.crawler(s);Object.assign(e,{kind:'hatchling',hp:1,w:16,h:12,col:'#b8c890'});e.y=(s.ty+1)*T-12;const up=e.update;e.update=function(dt){this.lunge=this.lunge||0;if(!this.lunge&&Math.random()<dt*1.5&&Math.abs(H.x-this.x)<200){this.dir=Math.sign(H.x-this.x)||1;this.tell=.12}up.call(this,dt)};
  e.draw=function(g){const x=this.x+8,y=this.y+12,t=this.t;g.save();g.translate(x,y);g.scale(this.dir,1);g.strokeStyle='#0c0d08';g.lineWidth=1.5;for(let i=0;i<3;i++){const ph=t*20+i*2;g.beginPath();g.moveTo(-4+i*4,-5);g.lineTo(-6+i*4+Math.sin(ph)*2,0);g.stroke()}
    g.fillStyle=this.flash>0?'#fff':'#c8d0a0';g.beginPath();g.ellipse(0,-6,8,5.5,0,0,6.283);g.fill();g.fillStyle='#ff3e4e';g.beginPath();g.arc(5,-7,1.4,0,6.283);g.fill();g.restore()};return e};

/* ---------- Hard Reset impact ---------- */
LP.onSlam=(x,y)=>{for(const e of LP.ents)if(e.enemy&&!e.dead&&Math.hypot(e.x+e.w/2-x,e.y+e.h/2-y)<100){e.hurt(2,Math.sign(e.x-x)||1);e.stun=.8}
  if(LP.boss)for(const b of LP.boss.hitboxes()){if(LP.overlap({x:x-70,y:y-60,w:140,h:70},b)){LP.boss.hurt(2,1,b);break}}};
})();
/* ---------- the Husked: townsfolk the rot got into, still carrying their tools ---------- */
(function(){const LP=window.LP,T=LP.T,H=LP.H,EN=LP.EN,{rand,pick,clamp,appr,sign}=LP;
const TOOLS={hook:{reach:72,wind:.5,col:'#9aa6c2',box:[0,-62,74,58]},wrench:{reach:56,wind:.45,col:'#c8ccd8',box:[0,-44,58,44]},opener:{reach:86,wind:.4,col:'#e8ecf5',box:[4,-30,88,16]},key:{reach:74,wind:.6,col:'#d9b45a',box:[0,-66,78,66]}};
EN.husk=s=>{const tool=s.tool||'hook',TL=TOOLS[tool];const base=EN.crawler({tx:s.tx,ty:s.ty});return Object.assign(base,{kind:'husk',tool,x:s.tx*T+4,y:(s.ty+1)*T-38,w:22,h:38,hp:5,col:'#9aa0ae',dir:-1,st:'walk',stT:0,cd:rand(.3,1),ang:0,
  update(dt){this.t+=dt;this.stT+=dt;this.cd-=dt;this.vy+=2000*dt;const NM=LP.NM,dx=H.x+9-(this.x+11),dy=H.y+H.h-(this.y+this.h),dist=Math.abs(dx);this.flash-=dt;
    switch(this.st){
      case 'walk':{this.dir=Math.sign(dx)||this.dir;const inR=dist<TL.reach&&Math.abs(dy)<70;this.vx=this.kb>0?this.kbv:inR?0:dist<400?this.dir*(NM?78:52):Math.sin(this.t)*10;
        this.ang=appr(this.ang,.5,dt*4);if(inR&&this.cd<=0){this.st='wind';this.stT=0;this.wd=NM?rand(.22,.6):TL.wind;this.fake=NM&&Math.random()<.22;LP.sfx('warn')}break}
      case 'wind':this.vx=0;this.ang=appr(this.ang,-2.3,dt*9);if(this.stT>this.wd){if(this.fake){this.st='walk';this.cd=.25;this.fake=false}else{this.st='strike';this.stT=0;LP.sfx('heavy');this.vx=this.dir*120}}break;
      case 'strike':this.ang=appr(this.ang,1.6,dt*30);this.vx*=.85;if(this.stT>.16){this.st='recover';this.stT=0;this.again=NM&&Math.random()<.3}break;
      case 'recover':this.vx=0;this.ang=appr(this.ang,.6,dt*4);if(this.stT>(NM?.35:.6)){if(this.again){this.again=false;this.st='wind';this.stT=0;this.wd=rand(.2,.35);LP.sfx('warn')}else{this.st='walk';this.cd=NM?rand(.2,.7):.8}}break}
    this.kb-=dt;LP.moveBody(this,dt);if(this.ground&&this.st==='walk'){const fx=this.dir>0?this.x+this.w+2:this.x-2,t=LP.tile(Math.floor(fx/T),Math.floor((this.y+this.h+4)/T));if(!(LP.isSolid(t)||t===2))this.vx=0}
    LP.light(this.x+11,this.y+8,60,.35)},
  hazRects(){if(this.st!=='strike'||this.stagger>0)return[];const b=TL.box,cx=this.x+11,fy=this.y+this.h;return[{x:this.dir>0?cx+b[0]:cx-b[0]-b[2],y:fy+b[1],w:b[2],h:b[3]}]},
  draw(g){const x=this.x+11,y=this.y+this.h,t=this.t,st=this.stagger>0;g.save();g.translate(x+(st?Math.sin(t*40)*1.5:0),y);g.scale(this.dir,1);
    g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(0,0,14,4,0,0,6.283);g.fill();
    const wk=this.st==='walk'?Math.sin(t*8)*3:0;g.strokeStyle='#3a3c44';g.lineWidth=4;g.lineCap='round';g.beginPath();g.moveTo(-4,-12);g.lineTo(-5+wk,0);g.moveTo(4,-12);g.lineTo(5-wk,0);g.stroke();
    const bg=g.createRadialGradient(-4,-26,2,0,-20,18);bg.addColorStop(0,this.flash>0?'#fff':'#8c8f96');bg.addColorStop(1,'#3a3c44');g.fillStyle=bg;g.beginPath();g.ellipse(1,-21,12,13,.15,0,6.283);g.fill();g.beginPath();g.arc(5,-35,9,0,6.283);g.fill();
    g.strokeStyle='rgba(196,91,255,.85)';g.lineWidth=1.3;g.beginPath();g.moveTo(-8,-12);g.lineTo(-3,-22);g.lineTo(-6,-30);g.moveTo(6,-14);g.lineTo(3,-26);g.stroke();
    const tell=this.st==='wind';g.shadowColor='#c45bff';g.shadowBlur=tell?12:6;g.fillStyle=tell&&Math.sin(t*40)>0?'#fff':'#e070ff';g.beginPath();g.ellipse(8,-36,2,2.6,0,0,6.283);g.ellipse(3,-36,1.8,2.4,0,0,6.283);g.fill();g.shadowBlur=0;
    // the tool
    g.save();g.translate(6,-24);g.rotate(this.ang);const c=TL.col;g.strokeStyle='#4a3a2a';g.lineWidth=3;
    if(this.tool==='hook'){g.beginPath();g.moveTo(0,0);g.lineTo(52,0);g.stroke();g.strokeStyle=c;g.lineWidth=3;g.beginPath();g.arc(56,8,9,-Math.PI/2,Math.PI*.8);g.stroke();g.fillStyle='#ffc56b';g.beginPath();g.arc(60,18,4,0,6.283);g.fill()}
    else if(this.tool==='wrench'){g.strokeStyle=c;g.lineWidth=5;g.beginPath();g.moveTo(0,0);g.lineTo(34,0);g.stroke();g.fillStyle=c;g.beginPath();g.arc(40,0,9,0,6.283);g.fill();g.fillStyle='#1a1d24';g.beginPath();g.arc(44,-2,4,0,6.283);g.fill()}
    else if(this.tool==='opener'){g.fillStyle=c;g.beginPath();g.moveTo(0,-3);g.lineTo(66,0);g.lineTo(0,3);g.closePath();g.fill();g.fillStyle='#7fd8ff';g.beginPath();g.arc(0,0,4,0,6.283);g.fill()}
    else{g.strokeStyle=c;g.lineWidth=5;g.beginPath();g.moveTo(14,0);g.lineTo(58,0);g.stroke();g.lineWidth=4;g.beginPath();g.arc(7,0,8,0,6.283);g.stroke();g.fillStyle=c;g.fillRect(48,0,5,12);g.fillRect(56,0,4,8)}
    if(tell){g.fillStyle=`rgba(255,255,255,${.5+.5*Math.sin(t*40)})`;g.beginPath();g.arc(TL.reach*.7,0,3,0,6.283);g.fill()}g.restore();
    if(this.st==='strike'){g.globalAlpha=.6;g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.arc(6,-24,TL.reach*.85,-1.6,1.2);g.stroke();g.globalAlpha=1}
    g.restore();if(st){for(let i=0;i<3;i++){const a=t*6+i*2.1;g.fillStyle='#ffd36b';g.beginPath();g.arc(x+Math.cos(a)*12,this.y-8+Math.sin(a)*4,2.4,0,6.283);g.fill()}}}})};
const add=(id,list)=>{const r=LP.rooms[id];list.forEach(([t,x,y,o])=>r.spawns.push(Object.assign({type:t,tx:x,ty:y},o||{})))};
add('mb_hall',[['husk',43,15,{tool:'hook'}],['hint',36,7,{txt:'F  PARRY AS IT SWINGS  →  CRIT'}]]);add('mb_lower',[['husk',28,15,{tool:'hook'}]]);add('mb_gap',[['husk',36,15,{tool:'hook'}]]);
add('cpu_ante',[['husk',22,15,{tool:'wrench'}]]);add('cpu_cache',[['husk',20,33,{tool:'wrench'}]]);add('cpu_clock',[['husk',45,15,{tool:'wrench'}]]);
add('ram_town',[['husk',48,15,{tool:'opener'}],['husk',8,15,{tool:'opener'}]]);add('ram_flood',[['husk',44,15,{tool:'opener'}]]);
add('ssd_hall',[['husk',44,15,{tool:'key'}],['husk',10,15,{tool:'key'}]]);
})();
