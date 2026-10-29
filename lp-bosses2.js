/* LAST PATCH — stage 2 bosses: Memory Leak (RAM) and Bad Sector (SSD). */
(function(){
'use strict';
const LP=window.LP,T=LP.T,{clamp,rand,pick,lerp,appr,sign}=LP,H=LP.H;
const FLOOR=480,W=36*T,hx=()=>H.x+H.w/2,hy=()=>H.y+H.h/2;
const haz=o=>Object.assign({t:0,life:1,on:true,upd(){},draw(){}},o);
const ICONS=['photo','heart','note','letter','face','star'];
function memIcon(g,k,x,y,s,a){g.save();g.translate(x,y);g.rotate(a);g.scale(s,s);g.globalAlpha*=.85;
  if(k==='photo'){g.fillStyle='#e8f6ff';g.fillRect(-7,-5,14,10);g.fillStyle='#3a6a9a';g.fillRect(-5,-3,10,6);g.fillStyle='#ffe2a8';g.beginPath();g.arc(-1,-1,1.6,0,6.283);g.fill()}
  else if(k==='heart'){g.fillStyle='#ff8ac8';g.beginPath();g.moveTo(0,4);g.bezierCurveTo(-8,-2,-4,-8,0,-3);g.bezierCurveTo(4,-8,8,-2,0,4);g.fill()}
  else if(k==='note'){g.fillStyle='#b8f0ff';g.fillRect(-1,-6,2,9);g.beginPath();g.ellipse(-3,3,3,2,0,0,6.283);g.fill()}
  else if(k==='letter'){g.fillStyle='#f4f0e6';g.fillRect(-7,-4,14,9);g.strokeStyle='#8a94a8';g.lineWidth=1;g.beginPath();g.moveTo(-7,-4);g.lineTo(0,1);g.lineTo(7,-4);g.stroke()}
  else if(k==='face'){g.fillStyle='#ffd27a';g.beginPath();g.arc(0,0,5,0,6.283);g.fill();g.fillStyle='#1a1d24';g.fillRect(-2.5,-1.5,1.4,1.4);g.fillRect(1.2,-1.5,1.4,1.4)}
  else{g.fillStyle='#fff3b0';g.beginPath();for(let i=0;i<10;i++){const a=i/10*6.283,r=i%2?2:5;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.fill()}g.restore()}

/* =====================================================================
   MEMORY LEAK — RAM. A bloated sac of everything Cache Row forgot.
   ===================================================================== */
function leak(){const NM=LP.NM,max=NM?96:80;
  const b={id:'leak',name:'MEMORY LEAK',music:'boss3',hp:max,max,x:W/2+160,y:396,face:-1,state:'sleep',st:0,sub:0,t:0,phase:1,flash:0,haz:[],next:1,last:'',level:FLOOR+20,mouth:0,wake:0,dead:false,
    mems:Array.from({length:22},()=>({k:pick(ICONS),a:rand(0,6.283),r:rand(10,62),s:rand(.8,1.5),sp:rand(.3,1.1),rot:rand(0,6)}))};
  const tell=n=>NM?n*rand(.6,1.1):n;
  const S={x:W/2,y:440,st:'hide',t:0,sub:0,trail:[],vx:0,vy:0,last:''};b.s=S;
  b.hitboxes=()=>{if(b.form2)return S.up&&S.st!=='dying'?[{x:S.x-28,y:S.y-28,w:56,h:56}]:[];return['sleep','wake','hatch','dying'].includes(b.state)?[]:[{x:b.x-78,y:b.y-80,w:156,h:150}]};
  b.contact=()=>[];
  b.hurt=(d,dir)=>{if(!b.hitboxes().length)return false;b.hp-=d;b.flash=.1;LP.sfx('hit');const hx0=b.form2?S.x:b.x,hy0=b.form2?S.y:b.y;LP.burst(hx0,hy0,10,'#ff8ac8',300);
    if(b.hp<=0){b.hp=0;if(b.form2){S.st='dying';S.t=0}else{b.state='dying';b.st=0}b.haz.length=0;LP.stopMusic();LP.stop(.25)}
    else if(!b.form2&&b.phase===1&&b.hp<=max/2){b.phase=2;b.state='hatch';b.st=0;b.haz=b.haz.filter(z=>z.k==='fluid');hatchCS()}return true};
  b.skip=()=>{b.state='idle';b.wake=1;b.next=.8};
  b.kill=()=>{if(b.form2){S.up=true;S.st='idle'}b.hurt(b.hp+999,1)};
  function done(){b.state='idle';b.st=0;b.next=NM?rand(.25,.6):.6}
  function choose(){const o=['flood','spit','lash','inhale','flood'].filter(a=>a!==b.last);b.last=pick(o);b.state=b.last;b.st=0;b.sub=0}
  function fluidHaz(){let z=b.haz.find(z=>z.k==='fluid');if(!z){z=haz({k:'fluid',bounce:true,x:0,w:W,y:FLOOR,h:0,life:1e9,on:false,upd(){this.y=b.level;this.h=Math.max(0,FLOOR-b.level);this.on=b.level<FLOOR-6},
      draw(g){if(b.level>=FLOOR)return;const y=b.level,t=b.t;const gr=g.createLinearGradient(0,y,0,FLOOR);gr.addColorStop(0,'rgba(255,120,210,.55)');gr.addColorStop(1,'rgba(90,30,120,.8)');g.fillStyle=gr;g.beginPath();g.moveTo(0,FLOOR);for(let x=0;x<=W;x+=24)g.lineTo(x,y+Math.sin(x*.03+t*3)*3);g.lineTo(W,FLOOR);g.fill();
        g.strokeStyle='rgba(255,200,240,.8)';g.lineWidth=2;g.beginPath();for(let x=0;x<=W;x+=24)x?g.lineTo(x,y+Math.sin(x*.03+t*3)*3):g.moveTo(x,y);g.stroke();LP.light(hx(),y,200,.25)}});b.haz.push(z)}return z}
  function blob(tx){const x0=b.x-60*sign(b.x-hx()),y0=b.y-30,ft=rand(.6,.85);b.haz.push(haz({k:'blob',x:x0,y:y0,w:18,h:18,vx:(tx-x0)/ft,vy:(FLOOR-18-y0-.5*1300*ft*ft)/ft,life:3,
    upd(dt){this.vy+=1300*dt;this.x+=this.vx*dt;this.y+=this.vy*dt;if(this.y+18>=FLOOR){this.life=0;LP.burst(this.x+9,FLOOR,10,'#ff8ac8',200);if(LP.ents.filter(e=>e.kind==='leaklet'&&!e.dead).length<4){const e=LP.spawn({type:'leaklet',tx:Math.floor((this.x+9)/T),ty:15});if(e)LP.ents.push(e)}}},
    draw(g){g.fillStyle='rgba(255,140,220,.9)';g.beginPath();g.arc(this.x+9,this.y+9,9,0,6.283);g.fill()}}))}
  function hatchCS(){LP.shots=LP.shots.filter(s=>s.mine);LP.runCS((function*(){H.ctrl=false;LP.cam.focus={x:b.x,y:b.y,s:3};LP.sfx('roar');
    for(let s=0;s<1.6;s+=LP.DT){b.swell=s/1.6;b.level=lerp(FLOOR+20,442,s/1.6);if(Math.random()<.5)LP.shake(4);if(Math.random()<.4)LP.sfx('chew');yield LP.DT}
    b.form2=true;b.burst={x:b.x,y:b.y,t:0};LP.flash={c:'rgba(255,190,240,',t:.45,m:.85};LP.shake(26);LP.sfx('boom');LP.burst(b.x,b.y,80,'#ff8ac8',700,{g:700});
    for(const m of b.mems)LP.part({x:b.x+Math.cos(m.a)*m.r,y:b.y+Math.sin(m.a)*m.r,vx:rand(-500,500),vy:rand(-700,-200),g:900,life:rand(1,1.8),k:'img',draw:(g,p)=>memIcon(g,m.k,p.x,p.y,1.4,p.t*4)});
    S.x=b.x;S.y=b.y;S.up=true;S.st='intro';S.trail=Array.from({length:60},()=>({x:b.x,y:b.y}));yield .6;LP.titleCard('THE LEAK','UNBOUND',1.8);
    for(let s=0;s<1;s+=LP.DT){S.y=lerp(b.y,560,s);S.x+=200*LP.DT;yield LP.DT}S.up=false;S.st='idle';S.wait=.4;LP.cam.focus=null;LP.music('frenzy')})())}
  /* serpent (phase 2) */
  function sDone(){S.st='idle';S.t=0;S.wait=NM?rand(.15,.45):.45}
  function sChoose(){const o=['breach','geyser','snatch','beam','breach'].filter(a=>a!==S.last);S.last=pick(o);S.st=S.last;S.t=0;S.sub=0;S.n=0}
  function ripple(x){b.haz.push(haz({k:'ripple',x:x-40,y:b.level-6,w:80,h:12,on:false,life:.6,draw(g){g.strokeStyle=`rgba(255,220,250,${.6-this.t})`;g.lineWidth=2;for(let i=0;i<3;i++){g.beginPath();g.ellipse(this.x+40,b.level,10+i*14+this.t*40,3+i,0,0,6.283);g.stroke()}}}))}
  function sUpdate(dt){S.t+=dt;const lvl=b.level;
    switch(S.st){
      case 'idle':S.up=false;S.x=appr(S.x,hx(),300*dt);S.y=lvl+60;S.wait-=dt;if(S.wait<=0)sChoose();break;
      case 'breach':{if(S.sub===0){S.up=false;S.x0=clamp(hx()+pick([-1,1])*rand(260,380),80,W-80);S.x1=clamp(2*hx()-S.x0,60,W-60);S.sub=1;S.t=0;S.td=NM?rand(.35,.6):.6;LP.sfx('warn');ripple(S.x0)}
        else if(S.sub===1){if(S.t>S.td){S.sub=2;S.t=0;LP.sfx('whoosh');LP.burst(S.x0,lvl,24,'#ff8ac8',380,{g:900})}}
        else if(S.sub===2){const dur=NM?.8:.95,k=Math.min(1,S.t/dur);S.up=true;S.x=lerp(S.x0,S.x1,k);S.y=lvl-Math.sin(k*Math.PI)*300;
          if(k>=1){S.up=false;LP.burst(S.x,lvl,24,'#ff8ac8',380,{g:900});S.n++;if(S.n<(NM?3:2)){S.sub=0}else sDone()}}break}
      case 'geyser':{S.up=false;if(S.sub===0){S.sub=1;S.t=0;S.gx=[hx()];S.i=0}
        if(S.t>(S.i===0?.1:NM?rand(.25,.4):.4)&&S.i<(NM?4:3)){S.t=0;const x=clamp(hx()+(S.i?rand(-120,120):0),40,W-40);S.i++;const tl=NM?rand(.35,.55):.55;LP.sfx('warn');
          b.haz.push(haz({k:'geyser',x:x-26,y:120,w:52,h:lvl-120,life:tl+.55,tl,on:false,upd(){this.on=this.t>this.tl;this.y=b.level-(this.on?Math.min(1,(this.t-this.tl)/.1)*(b.level-120):0);this.h=b.level-this.y;if(this.on&&!this.s){this.s=1;LP.sfx('whoosh');LP.shake(6)}},
            draw(g){if(!this.on){g.fillStyle=`rgba(255,200,240,${.3+.3*Math.sin(this.t*40)})`;for(let i=0;i<4;i++){g.beginPath();g.arc(this.x+10+i*11,b.level-4-Math.random()*8,3,0,6.283);g.fill()}return}
              const gr=g.createLinearGradient(this.x,0,this.x+52,0);gr.addColorStop(0,'rgba(255,140,220,.3)');gr.addColorStop(.5,'rgba(255,230,250,.9)');gr.addColorStop(1,'rgba(255,140,220,.3)');g.fillStyle=gr;g.fillRect(this.x,this.y,52,this.h)}}))}
        if(S.i>=(NM?4:3)&&S.t>.9)sDone();break}
      case 'snatch':{if(S.sub===0){S.x=clamp(hx()+rand(-30,30),40,W-40);S.sub=1;S.t=0;ripple(S.x);LP.sfx('warn')}
        else if(S.sub===1){if(S.t>(NM?rand(.3,.5):.48)){S.sub=2;S.t=0;LP.sfx('dash')}}
        else if(S.sub===2){S.up=true;const k=Math.min(1,S.t/.18);S.y=lvl-k*(lvl-(hy()-10));b.haz.push(haz({k:'bite',x:S.x-26,y:S.y-26,w:52,h:lvl-S.y+26,life:.02}));if(S.t>.45){S.sub=3;S.t=0}}
        else if(S.sub===3){S.y=lerp(S.y,lvl+40,.15);if(S.t>.4){S.n++;if(S.n<2){S.sub=0}else sDone()}}break}
      case 'beam':{if(S.sub===0){S.x=hx()<W/2?W-90:90;S.sub=1;S.t=0;ripple(S.x)}
        else if(S.sub===1){S.up=true;S.y=lerp(S.y,lvl-150,.1);if(S.t>.4){S.sub=2;S.t=0;S.by=clamp(hy()+(H.crouch?-10:0),200,lvl-30);LP.sfx('warn')}}
        else if(S.sub===2){if(S.t>(NM?rand(.4,.6):.6)){S.sub=3;S.t=0;LP.sfx('zap');LP.shake(10)}}
        else if(S.sub===3){b.haz.push(haz({k:'beam',x:0,y:S.by-12,w:W,h:24,life:.02}));if(S.t>.45){S.sub=4;S.t=0}}
        else if(S.sub===4){S.y=lerp(S.y,lvl+60,.12);if(S.t>.5)sDone()}break}
      case 'dying':{S.up=true;S.y=lerp(S.y,260,.04);S.x+=Math.sin(b.t*40)*2;if(Math.random()<.5)LP.part({x:S.x+rand(-20,20),y:S.y+rand(-20,20),vx:rand(-300,300),vy:rand(-300,0),g:500,life:.6,col:pick(['#ff8ac8','#fff','#b8f0ff']),k:'spark',s:3});
        b.level=lerp(b.level,FLOOR+20,.01);if(S.t>2.3&&!b.dead){b.dead=true;b.level=FLOOR+20;b.x=S.x;b.y=S.y;LP.shake(30);LP.sfx('boom');LP.burst(S.x,S.y,90,'#ff8ac8',750,{g:400});LP.part({x:S.x,y:S.y,k:'ring',col:'#fff',s:20,grow:900,life:.6,w:6});LP.flash={c:'rgba(255,230,250,',t:.5,m:.8};LP.bossDefeated(b)}break}}
    if(S.up)b.haz.push(haz({k:'sbody',x:S.x-22,y:S.y-22,w:44,h:44,life:.02}));
    S.trail.unshift({x:S.x,y:S.y});S.trail.length=Math.min(S.trail.length,60);if(S.up)LP.light(S.x,S.y,180,.8)}
  b.update=dt=>{b.t+=dt;b.st+=dt;b.flash-=dt;fluidHaz();for(const m of b.mems)m.a+=m.sp*dt*(b.swell?3:1);
    if(b.form2){sUpdate(dt)}else switch(b.state){
      case 'sleep':case 'wake':break;
      case 'idle':b.x=appr(b.x,clamp(hx()+(b.x<hx()?-280:280),140,W-140),70*dt);b.face=sign(hx()-b.x)||b.face;b.next-=dt;if(b.next<=0)choose();break;
      case 'flood':{const up=tell(.9),hold=NM?rand(2.2,2.8):2.2;if(b.st<up){if(Math.random()<.5)LP.part({x:rand(20,W-20),y:FLOOR-2,vy:-rand(30,80),life:.5,col:'rgba(255,200,240,.7)',s:3});if(b.st<dt*1.5)LP.sfx('warn')}
        else if(b.st<up+.6)b.level=lerp(FLOOR+20,430,(b.st-up)/.6);else if(b.st<up+.6+hold)b.level=430+Math.sin(b.t*2)*4;else if(b.st<up+1.2+hold)b.level=lerp(430,FLOOR+20,(b.st-up-.6-hold)/.6);else{b.level=FLOOR+20;done()}break}
      case 'spit':{if(b.sub===0&&b.st>tell(.45)){b.sub=1;b.st=0;[-90,0,90].forEach(o=>blob(clamp(hx()+o,40,W-40)));LP.sfx('shoot')}else if(b.sub===1&&b.st>.7)done();break}
      case 'lash':{if(b.sub===0){b.ly=FLOOR-26;if(b.st>tell(.55)){b.sub=1;b.st=0;LP.sfx('dash')}}
        else if(b.sub===1){const L=Math.min(1,b.st/.15)*W,x0=b.x+b.face*60;b.haz.push(haz({k:'tongue',x:b.face>0?x0:x0-L,y:b.ly-12,w:L,h:24,life:.02}));if(b.st>.4){b.sub=2;b.st=0}}
        else if(b.sub===2&&b.st>.35)done();break}
      case 'inhale':{const dur=NM?rand(1.4,2):1.6;H.pull=(b.x-hx()>0?1:-1)*(NM?300:240);b.mouth=1;if(Math.random()<.8){const a=rand(-.8,.8)+(b.face>0?0:Math.PI);LP.part({x:b.x+Math.cos(a)*300,y:b.y+Math.sin(a)*120,vx:-Math.cos(a)*500,vy:-Math.sin(a)*200,life:.5,col:'rgba(255,220,250,.6)',s:2,k:'spark'})}
        b.haz.push(haz({k:'maw',x:b.x+b.face*40-50,y:b.y-50,w:100,h:110,life:.02}));if(b.st>dur){H.pull=0;b.mouth=0;done()}break}
      case 'dying':{b.y+=Math.sin(b.t*60);if(Math.random()<.5)LP.part({x:b.x+rand(-60,60),y:b.y+rand(-60,60),vx:rand(-200,200),vy:rand(-300,0),g:400,life:.6,col:'#ff8ac8',k:'spark',s:3});if(b.st>2.2&&!b.dead){b.dead=true;LP.shake(30);LP.sfx('boom');LP.burst(b.x,b.y,90,'#ff8ac8',700);LP.flash={c:'rgba(255,255,255,',t:.5,m:.8};LP.bossDefeated(b)}break}}
    if(b.state!=='inhale')H.pull=0;
    for(const z of b.haz){z.t+=dt;z.upd(dt)}b.haz=b.haz.filter(z=>z.t<z.life);if(!b.form2)LP.light(b.x,b.y,240,.7)};
  b.draw=g=>{const t=b.t;
    for(const z of b.haz)if(z.k!=='fluid')z.draw(g);
    if(b.state==='lash'&&b.sub===0){g.fillStyle=`rgba(255,62,107,${.25+.25*Math.sin(t*40)})`;g.fillRect(0,b.ly-3,W,6)}
    if(b.form2&&S.st==='beam'&&S.sub===2){g.fillStyle=`rgba(255,62,107,${.3+.3*Math.sin(t*40)})`;g.fillRect(0,S.by-3,W,6)}
    if(b.form2&&S.st==='beam'&&S.sub===3){g.fillStyle='rgba(255,230,250,.9)';g.fillRect(0,S.by-8,W,16);g.fillStyle='rgba(255,140,220,.35)';g.fillRect(0,S.by-16,W,32)}
    if(!b.form2){const sw=b.swell||0,sx=b.x+(sw?Math.random()*sw*8-sw*4:0),sy=b.y,R=82*(1+sw*.18)*(b.state==='inhale'?1.08:1),wob=a=>R+5*Math.sin(3*a+t*2)+3*Math.sin(7*a-t*3);
      g.save();g.translate(sx,sy);const dg=g.createRadialGradient(0,0,20,0,0,R*2.4);dg.addColorStop(0,'rgba(0,0,0,.5)');dg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=dg;g.fillRect(-R*2.4,-R*2.4,R*4.8,R*4.8);
      // tendrils
      g.strokeStyle='rgba(120,40,110,.8)';g.lineWidth=4;g.lineCap='round';for(let i=0;i<6;i++){const a=Math.PI*.15+i*.14*Math.PI;g.beginPath();g.moveTo(Math.cos(a)*R*.8,Math.sin(a)*R*.8);g.quadraticCurveTo(Math.cos(a)*R*1.1,Math.sin(a)*R+20,Math.cos(a)*R*.9+Math.sin(t*2+i)*10,FLOOR-sy);g.stroke()}
      g.beginPath();for(let i=0;i<=48;i++){const a=i/48*6.283,r=wob(a);i?g.lineTo(Math.cos(a)*r,Math.sin(a)*r*.92):g.moveTo(Math.cos(a)*r,Math.sin(a)*r*.92)}g.closePath();
      const bg=g.createRadialGradient(-20,-30,8,0,0,R);bg.addColorStop(0,b.flash>0?'rgba(255,255,255,.9)':'rgba(255,190,235,.55)');bg.addColorStop(.6,'rgba(150,60,150,.45)');bg.addColorStop(1,'rgba(40,10,50,.85)');g.fillStyle=bg;g.fill();
      g.save();g.clip();for(const m of b.mems){const x=Math.cos(m.a)*m.r,y=Math.sin(m.a)*m.r*.85;memIcon(g,m.k,x,y,m.s,m.rot+t*.5)}
      for(let i=0;i<9;i++){const a=i*.7+t*.3,x=Math.cos(a)*45,y=Math.sin(a*1.3)*35;g.fillStyle='rgba(10,0,10,.8)';g.beginPath();g.arc(x,y,3,0,6.283);g.fill();g.fillStyle='rgba(255,255,255,.7)';g.fillRect(x-1,y-1.5,1.2,1.2)}g.restore();
      g.strokeStyle='rgba(255,220,250,.55)';g.lineWidth=2;g.stroke();g.fillStyle='rgba(255,255,255,.3)';g.beginPath();g.ellipse(-R*.35,-R*.5,R*.22,R*.1,-.5,0,6.283);g.fill();
      // lamprey mouth
      const mo=b.state==='inhale'?1:b.state==='lash'?.8:b.wake*(.25+.1*Math.sin(t*3)),mx=b.face*R*.7,mr=24+mo*14;g.fillStyle='#1a0414';g.beginPath();g.arc(mx,6,mr,0,6.283);g.fill();
      g.fillStyle='#d4c9a8';for(let ring=0;ring<2;ring++)for(let i=0;i<14;i++){const a=i/14*6.283+ring*.22+t*(ring?-.5:.5),r1=mr-ring*9,r2=r1-6-mo*3;g.beginPath();g.moveTo(mx+Math.cos(a-.12)*r1,6+Math.sin(a-.12)*r1);g.lineTo(mx+Math.cos(a)*r2,6+Math.sin(a)*r2);g.lineTo(mx+Math.cos(a+.12)*r1,6+Math.sin(a+.12)*r1);g.fill()}
      g.fillStyle=`rgba(255,120,200,${.5*mo})`;g.beginPath();g.arc(mx,6,8*mo,0,6.283);g.fill();
      if(b.state==='lash'&&b.sub===1){g.fillStyle='#c84a8a';g.fillRect(b.face>0?mx:mx-W,b.ly-sy-8,W,16)}
      if(b.state==='dying'){for(let i=0;i<7;i++){const a=i*.9+t;g.strokeStyle=`rgba(255,230,250,${.4+.4*Math.sin(t*20+i)})`;g.lineWidth=3;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a)*(80+b.st*90),Math.sin(a)*(80+b.st*90));g.stroke()}}
      g.restore()}
    else{// torn sac left behind
      const bs=b.burst;if(bs){g.fillStyle='rgba(60,20,60,.85)';g.beginPath();g.moveTo(bs.x-80,FLOOR);g.quadraticCurveTo(bs.x-70,bs.y+30,bs.x-30,bs.y+40);g.lineTo(bs.x-10,bs.y+20);g.lineTo(bs.x+20,bs.y+44);g.quadraticCurveTo(bs.x+70,bs.y+30,bs.x+82,FLOOR);g.fill()}
      // serpent
      const segs=[];for(let i=1;i<=12;i++){const p=S.trail[Math.min(S.trail.length-1,i*2)];segs.push(p)}
      for(let i=segs.length-1;i>=0;i--){const p=segs[i];if(p.y>b.level+20)continue;const r=20-i*1.2;const sg=g.createRadialGradient(p.x-r*.3,p.y-r*.3,1,p.x,p.y,r);sg.addColorStop(0,'rgba(255,220,250,.9)');sg.addColorStop(.6,'rgba(200,90,190,.7)');sg.addColorStop(1,'rgba(60,20,70,.85)');g.fillStyle=sg;g.beginPath();g.arc(p.x,p.y,r,0,6.283);g.fill();
        if(i%2===0)memIcon(g,b.mems[i%b.mems.length].k,p.x,p.y,.8,t*2+i)}
      if(S.y<b.level+24){const p1=S.trail[Math.min(3,S.trail.length-1)],a=Math.atan2(S.y-p1.y,S.x-p1.x)||-Math.PI/2;g.save();g.translate(S.x,S.y);g.rotate(a);
        const hg=g.createRadialGradient(-6,-8,2,0,0,30);hg.addColorStop(0,b.flash>0?'#fff':'rgba(255,225,250,.95)');hg.addColorStop(1,'rgba(110,40,120,.9)');g.fillStyle=hg;g.beginPath();g.ellipse(0,0,30,24,0,0,6.283);g.fill();
        const op=(S.st==='beam'&&S.sub>=2)||S.st==='snatch'?1:.5;g.fillStyle='#1a0414';g.beginPath();g.arc(20,0,13+op*5,0,6.283);g.fill();g.fillStyle='#d4c9a8';for(let i=0;i<12;i++){const aa=i/12*6.283+t;g.beginPath();g.moveTo(20+Math.cos(aa-.15)*(13+op*5),Math.sin(aa-.15)*(13+op*5));g.lineTo(20+Math.cos(aa)*(6+op*2),Math.sin(aa)*(6+op*2));g.lineTo(20+Math.cos(aa+.15)*(13+op*5),Math.sin(aa+.15)*(13+op*5));g.fill()}g.restore()}}
    const f=b.haz.find(z=>z.k==='fluid');f&&f.draw(g)};
  return b}

/* =====================================================================
   BAD SECTOR — SSD. A boulder of dead blocks. What it touches was never there.
   ===================================================================== */
function sector(){const NM=LP.NM,max=NM?104:86;
  const b={id:'sector',name:'BAD SECTOR',music:'boss4',hp:max,max,x:W/2+120,y:FLOOR-92,vx:0,vy:0,face:-1,state:'curled',st:0,sub:0,t:0,phase:1,flash:0,haz:[],next:1,last:'',eye:0,unfold:0,ball:0,ang:0,dead:false,holes:[]};
  const tell=n=>NM?n*rand(.6,1.1):n;
  const C={x:W/2,y:250,st:'idle',t:0,sub:0,shards:6,rot:0,R:34,last:''};b.c=C;
  b.hitboxes=()=>{if(b.form2)return C.st==='dying'||C.st==='intro'||C.blink?[]:[{x:C.x-24,y:C.y-24,w:48,h:48}];return['curled','rise','hatch','dying'].includes(b.state)?[]:[{x:b.x-80,y:b.y-84,w:160,h:170}]};
  b.contact=()=>[];
  b.skip=()=>{b.state='idle';b.unfold=1;b.eye=1;b.next=.8};
  b.kill=()=>{if(b.form2){C.blink=false;C.st='idle'}else if(b.state==='hatch')return;b.hurt(b.hp+999,1)};
  b.hurt=(d,dir)=>{if(!b.hitboxes().length)return false;b.hp-=d;b.flash=.1;LP.sfx('hit');LP.burst(b.form2?C.x:b.x,b.form2?C.y:b.y,10,'#ff3e3e',300);
    if(b.hp<=0){b.hp=0;if(b.form2){C.st='dying';C.t=0}else{b.state='dying';b.st=0}b.haz.length=0;LP.stopMusic();LP.stop(.25);LP.shots=LP.shots.filter(s=>s.mine)}
    else if(!b.form2&&b.phase===1&&b.hp<=max/2){b.phase=2;b.state='hatch';b.st=0;b.haz.length=0;hatchCS()}return true};
  function done(){b.state='idle';b.st=0;b.next=NM?rand(.25,.6):.6;b.ball=0}
  function choose(){const o=['stomp','roll','hurl','scan','stomp'].filter(a=>a!==b.last);b.last=pick(o);b.state=b.last;b.st=0;b.sub=0;b.n=0}
  // erase part of the floor; it comes back later
  function erase(x0,x1,dur){const r=LP.room,ty=16;for(let tx=Math.max(1,Math.floor(x0/T));tx<=Math.min(34,Math.floor(x1/T));tx++){if(r.grid[ty*r.w+tx]===1){r.grid[ty*r.w+tx]=0;b.holes.push({tx,t:dur});for(let i=0;i<4;i++)LP.part({x:tx*T+rand(0,30),y:FLOOR+rand(0,20),vx:rand(-60,60),vy:rand(-160,-40),life:.6,col:pick(['#ff3e3e','#2b3342','#9aa6c2']),s:3})}}LP.buildRoomCanvas(r)}
  function restoreHoles(dt,all){const r=LP.room;let ch=false;for(const h of b.holes){h.t-=dt;if(all||h.t<=0){r.grid[16*r.w+h.tx]=1;ch=true;for(let i=0;i<3;i++)LP.part({x:h.tx*T+rand(0,30),y:FLOOR+4,vy:-rand(20,60),life:.4,col:'#9aa6c2',s:2})}}if(ch){b.holes=b.holes.filter(h=>!(all||h.t<=0));LP.buildRoomCanvas(r)}}
  b.restoreFloor=()=>{const r=LP.room;for(let tx=1;tx<35;tx++)r.grid[16*r.w+tx]=r.grid0[16*r.w+tx];b.holes=[];LP.buildRoomCanvas(r)};
  function boulder(tx){const x0=b.x,y0=b.y-60,ft=rand(.7,.95);b.haz.push(haz({k:'boulder',x:x0-16,y:y0-16,w:32,h:32,vx:(tx-x0)/ft,vy:(FLOOR-32-y0-.5*1300*ft*ft)/ft,life:3,ang:0,
    upd(dt){this.vy+=1300*dt;this.x+=this.vx*dt;this.y+=this.vy*dt;this.ang+=dt*6;if(this.y+32>=FLOOR){this.life=0;LP.shake(6);LP.sfx('thud');LP.burst(this.x+16,FLOOR,14,'#9aa6c2',300,{g:900});for(let i=0;i<4;i++){const a=-Math.PI*(.15+i*.23);LP.shots.push({x:this.x+16,y:FLOOR-12,vx:Math.cos(a)*300,vy:Math.sin(a)*300,r:6,col:'#c8ccd8',life:1.2,brk:true})}}},
    draw(g){g.save();g.translate(this.x+16,this.y+16);g.rotate(this.ang);const gr=g.createRadialGradient(-5,-5,2,0,0,17);gr.addColorStop(0,'#9aa0ae');gr.addColorStop(1,'#1e2129');g.fillStyle=gr;g.beginPath();g.arc(0,0,16,0,6.283);g.fill();g.strokeStyle='rgba(255,62,62,.8)';g.lineWidth=1.5;g.beginPath();g.moveTo(-8,-4);g.lineTo(0,2);g.lineTo(6,-6);g.stroke();g.restore()}}))}
  function hatchCS(){LP.runCS((function*(){H.ctrl=false;LP.cam.focus={x:b.x,y:b.y,s:3};LP.sfx('roar');for(let s=0;s<1.4;s+=LP.DT){b.crack=s/1.4;if(Math.random()<.5)LP.shake(5);yield LP.DT}
    b.form2=true;b.shell={x:b.x,y:b.y};LP.flash={c:'rgba(255,200,200,',t:.45,m:.85};LP.shake(28);LP.sfx('boom');
    for(let i=0;i<26;i++)LP.part({x:b.x+rand(-60,60),y:b.y+rand(-60,60),vx:rand(-600,600),vy:rand(-800,-150),g:1100,life:rand(1,1.8),k:'shard',s:rand(6,14),col:pick(['#2b3342','#5a6070','#191e28']),vr:rand(-10,10)});
    C.x=b.x;C.y=b.y-20;C.st='intro';yield .4;erase(30,W-30,999);const r=LP.room;[[1,6],[15,20],[29,34]].forEach(([a,c])=>{for(let tx=a;tx<=c;tx++)r.grid[16*r.w+tx]=1});b.holes=b.holes.filter(h=>h.tx<1||(h.tx>6&&h.tx<15)||(h.tx>20&&h.tx<29)||h.tx>34);LP.buildRoomCanvas(r);
    LP.bigGlitch('0x7A3F',1);yield .9;LP.titleCard('THE CORRUPTED INDEX','IT WAS NEVER A BOULDER',1.8);for(let s=0;s<1.2;s+=LP.DT){C.y=lerp(C.y,240,.05);yield LP.DT}LP.cam.focus=null;C.st='idle';C.wait=.4;LP.music('frenzy')})())}
  /* core (phase 2) */
  function cDone(){C.st='idle';C.t=0;C.wait=NM?rand(.12,.35):.35}
  function cChoose(){const o=['blink','grid','shards','dive','blink'].filter(a=>a!==C.last);C.last=pick(o);C.st=C.last;C.t=0;C.sub=0;C.n=0}
  function rectHaz(x,y,w,h,tl){b.haz.push(haz({k:'erase',x,y,w,h,tl,life:tl+.2,on:false,upd(){this.on=this.t>this.tl;if(this.on&&!this.s){this.s=1;LP.sfx('zap');LP.shake(4)}},
    draw(g){if(!this.on){g.strokeStyle=`rgba(255,62,62,${.4+.3*Math.sin(this.t*40)})`;g.lineWidth=2;g.strokeRect(this.x+1,this.y+1,this.w-2,this.h-2);g.fillStyle='rgba(255,62,62,.08)';g.fillRect(this.x,this.y,this.w,this.h)}else{g.fillStyle='rgba(255,230,230,.85)';g.fillRect(this.x,this.y,this.w,this.h)}}}))}
  function cUpdate(dt){C.t+=dt;C.rot+=dt*(C.st==='shards'?7:2.5);
    switch(C.st){
      case 'intro':break;
      case 'idle':C.x=lerp(C.x,clamp(hx()+Math.sin(b.t)*200,80,W-80),1-Math.exp(-2*dt));C.y=lerp(C.y,230+Math.sin(b.t*2)*30,1-Math.exp(-3*dt));C.wait-=dt;if(C.wait<=0)cChoose();break;
      case 'blink':{if(C.sub===0){C.blink=true;if(C.t>.15){const a=rand(0,6.283),d=rand(200,280);C.x=clamp(hx()+Math.cos(a)*d,60,W-60);C.y=clamp(hy()+Math.sin(a)*d*.6-80,90,420);C.blink=false;C.sub=1;C.t=0;C.td=NM?rand(.2,.4):.38;LP.sfx('glitch');LP.burst(C.x,C.y,14,'#ff3e3e',200)}}
        else if(C.sub===1&&C.t>C.td){const a=Math.atan2(hy()-C.y,hx()-C.x);LP.shots.push({x:C.x,y:C.y,vx:Math.cos(a)*620,vy:Math.sin(a)*620,r:7,col:'#ff3e3e',life:2,brk:false});LP.sfx('shoot');C.n++;C.sub=0;C.t=0;if(C.n>=(NM?5:4))cDone()}break}
      case 'grid':{if(C.t>(C.n===0?.2:NM?rand(.35,.55):.6)&&C.n<3){C.t=0;C.n++;const tl=NM?rand(.4,.6):.6;const cols=[],X=Math.floor(hx()/T);
          if(C.n%2){for(let k=-1;k<=1;k++)cols.push(X+k*3+(Math.random()*2|0))
            cols.forEach(cx=>rectHaz(cx*T,60,T*1.5,420,tl))}else{rectHaz(0,Math.floor(hy()/T)*T-15,W,45,tl);rectHaz(0,Math.floor(hy()/T)*T-135,W,45,tl)}LP.sfx('warn')}
        if(C.n>=3&&C.t>.9)cDone();break}
      case 'shards':{C.x=lerp(C.x,W/2,.05);C.y=lerp(C.y,250,.05);if(C.t>1.1&&!C.fired){C.fired=true;const n=NM?20:16;for(let i=0;i<n;i++){const a=i/n*6.283+C.rot;LP.shots.push({x:C.x+Math.cos(a)*40,y:C.y+Math.sin(a)*40,vx:Math.cos(a)*300,vy:Math.sin(a)*300,r:6,col:'#c8ccd8',life:3,brk:true})}LP.sfx('zap');LP.shake(8)}
        if(C.t>1.8){C.fired=false;C.n++;C.t=0;if(C.n>=(NM?3:2))cDone()}break}
      case 'dive':{if(C.sub===0){C.tx=hx();C.ty=hy();C.sub=1;C.t=0;LP.sfx('warn')}else if(C.sub===1){if(C.t>(NM?rand(.25,.45):.45)){C.sub=2;C.t=0;const dx=C.tx-C.x,dy=C.ty-C.y,d=Math.hypot(dx,dy)||1;C.vx=dx/d*1100;C.vy=dy/d*1100;LP.sfx('dash')}}
        else if(C.sub===2){C.x+=C.vx*dt;C.y+=C.vy*dt;b.haz.push(haz({k:'core',x:C.x-26,y:C.y-26,w:52,h:52,life:.02}));if(Math.random()<.8)LP.part({x:C.x,y:C.y,life:.3,col:'#ff3e3e',s:4});if(C.t>.6||C.x<40||C.x>W-40||C.y<70||C.y>470){C.x=clamp(C.x,40,W-40);C.y=clamp(C.y,70,440);C.n++;if(C.n<(NM?3:2)){C.sub=0}else{C.sub=3;C.t=0}}}
        else if(C.sub===3&&C.t>.5)cDone();break}
      case 'dying':{C.R=lerp(C.R,6,.02);C.x+=Math.sin(b.t*50)*2;if(Math.random()<.6)LP.part({x:C.x+rand(-20,20),y:C.y+rand(-20,20),vx:rand(-300,300),vy:rand(-300,100),g:300,life:.6,col:pick(['#ff3e3e','#fff','#9aa6c2']),k:'spark',s:3});
        if(C.t>2.3&&!b.dead){b.dead=true;b.x=C.x;b.y=C.y;b.restoreFloor();LP.shake(30);LP.sfx('boom');LP.burst(C.x,C.y,90,'#ff3e3e',750,{g:400});LP.part({x:C.x,y:C.y,k:'ring',col:'#fff',s:20,grow:900,life:.6,w:6});LP.flash={c:'rgba(255,235,235,',t:.5,m:.8};LP.bossDefeated(b)}break}}
    LP.light(C.x,C.y,220,.9)}
  b.update=dt=>{b.t+=dt;b.st+=dt;b.flash-=dt;restoreHoles(dt,false);
    if(b.form2){cUpdate(dt)}else switch(b.state){
      case 'curled':case 'rise':break;
      case 'idle':{b.x=appr(b.x,clamp(hx()+(b.x<hx()?-240:240),120,W-120),90*dt);b.face=sign(hx()-b.x)||b.face;b.y=FLOOR-92+Math.abs(Math.sin(b.t*4))*-4;b.next-=dt;if(b.next<=0)choose();break}
      case 'stomp':{if(b.sub===0){b.y=lerp(b.y,FLOOR-80,.2);if(b.st>tell(.4)){b.sub=1;b.st=0;b.sx=b.x;b.tx=clamp(hx(),110,W-110);LP.sfx('whoosh')}}
        else if(b.sub===1){const k=Math.min(1,b.st/.7);b.x=lerp(b.sx,b.tx,k);b.y=FLOOR-92-Math.sin(k*Math.PI)*260;if(k>=1){b.sub=2;b.st=0;b.y=FLOOR-92;LP.shake(24);LP.sfx('boom');LP.burst(b.x,FLOOR,40,'#9aa6c2',500,{g:900});
            erase(b.x-100,b.x+100,NM?4:3);[-1,1].forEach(d=>b.haz.push(haz({k:'shock',x:b.x-20,y:FLOOR-26,w:40,h:26,life:3,d,upd(dt){this.x+=this.d*460*dt;if(this.x<20||this.x>W-20)this.life=0},draw(g){g.fillStyle='rgba(255,62,62,.75)';g.beginPath();g.moveTo(this.x,FLOOR);g.quadraticCurveTo(this.x+20,FLOOR-50,this.x+40,FLOOR);g.fill()}})))}}
        else if(b.sub===2&&b.st>.6){b.n++;if(b.n<(b.phase===2||NM?2:1)){b.sub=0;b.st=0}else done()}break}
      case 'roll':{if(b.sub===0){b.ball=Math.min(1,b.st/.4);if(b.st>tell(.55)){b.sub=1;b.st=0;b.vx=sign(hx()-b.x)*(NM?820:720);b.bn=0;LP.sfx('dash')}}
        else if(b.sub===1){b.x+=b.vx*dt;b.ang+=b.vx*dt/70;if(b.x<100||b.x>W-100){b.vx*=-1;b.x=clamp(b.x,100,W-100);b.bn++;LP.shake(14);LP.sfx('thud')}b.y=FLOOR-72;b.haz.push(haz({k:'ball',x:b.x-68,y:FLOOR-140,w:136,h:140,life:.02,hit(hb){return Math.hypot(hb.x+hb.w/2-b.x,hb.y+hb.h/2-(FLOOR-72))<74}}));if(b.bn>=(NM?3:2)){b.sub=2;b.st=0}}
        else if(b.sub===2){b.ball=Math.max(0,1-b.st/.4);b.y=lerp(b.y,FLOOR-92,.2);if(b.st>.6)done()}break}
      case 'hurl':{if(b.sub===0&&b.st>tell(.45)){b.sub=1;b.st=0;[-110,0,110].forEach(o=>boulder(clamp(hx()+o,40,W-40)));LP.sfx('shoot')}else if(b.sub===1&&b.st>.9)done();break}
      case 'scan':{if(b.sub===0){b.eye=1.4;b.sd=hx()<b.x?-1:1;b.scx=b.x+b.sd*-200;if(b.st>tell(.5)){b.sub=1;b.st=0;b.scx=b.sd>0?40:W-40;LP.sfx('zap')}}
        else if(b.sub===1){b.scx+=b.sd*(NM?700:600)*dt;b.haz.push(haz({k:'scanline',x:b.scx-30,y:FLOOR-40,w:60,h:40,life:.02}));if(b.scx<20||b.scx>W-20){b.sub=2;b.st=0}}
        else if(b.sub===2&&b.st>.4){b.eye=1;done()}break}
      case 'dying':{b.y+=Math.sin(b.t*60)*1.5;if(Math.random()<.5)LP.part({x:b.x+rand(-70,70),y:b.y+rand(-70,70),vx:rand(-200,200),vy:rand(-300,0),g:400,life:.6,col:'#ff3e3e',k:'spark',s:3});if(b.st>2.2&&!b.dead){b.dead=true;b.restoreFloor();LP.shake(30);LP.sfx('boom');LP.burst(b.x,b.y,90,'#9aa6c2',700);LP.flash={c:'rgba(255,255,255,',t:.5,m:.8};LP.bossDefeated(b)}break}}
    for(const z of b.haz){z.t+=dt;z.upd(dt)}b.haz=b.haz.filter(z=>z.t<z.life);if(!b.form2)LP.light(b.x,b.y-20,260,.7)};
  b.draw=g=>{const t=b.t;for(const z of b.haz)z.draw(g);
    if(b.state==='scan'&&b.sub===1){g.strokeStyle='rgba(255,62,62,.8)';g.lineWidth=3;g.beginPath();g.moveTo(b.x+b.face*20,b.y-20);g.lineTo(b.scx,FLOOR-10);g.stroke();g.fillStyle='rgba(255,62,62,.35)';g.fillRect(b.scx-30,FLOOR-40,60,40)}
    if(b.state==='stomp'&&b.sub===1){g.fillStyle=`rgba(255,62,62,${.25+.2*Math.sin(t*40)})`;g.fillRect(b.tx-100,FLOOR-4,200,4)}
    if(b.form2){const s=b.shell;if(s){g.fillStyle='#14171e';g.beginPath();g.ellipse(s.x,FLOOR-10,96,24,0,0,6.283);g.fill();g.fillStyle='#1e232d';for(let i=0;i<5;i++){g.beginPath();g.ellipse(s.x-60+i*30,FLOOR-24-(i%2)*10,22,14,i,0,6.283);g.fill()}}
      if(C.blink)return;const x=C.x,y=C.y,R=C.R;const au=g.createRadialGradient(x,y,4,x,y,R*3);au.addColorStop(0,'rgba(255,62,62,.45)');au.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=au;g.fillRect(x-R*3,y-R*3,R*6,R*6);
      if(C.st==='dive'&&C.sub===1){g.strokeStyle=`rgba(255,62,62,${.5+.4*Math.sin(t*40)})`;g.lineWidth=2;g.setLineDash([10,8]);g.beginPath();g.moveTo(x,y);g.lineTo(C.tx,C.ty);g.stroke();g.setLineDash([])}
      if(C.st==='blink'&&C.sub===1){g.strokeStyle='rgba(255,62,62,.6)';g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(hx(),hy());g.stroke()}
      for(let i=0;i<6;i++){const a=C.rot+i/6*6.283,r=R+20+(C.st==='shards'?Math.min(1,C.t/1.1)*30:0),sx=x+Math.cos(a)*r,sy=y+Math.sin(a)*r;g.save();g.translate(sx,sy);g.rotate(a);g.fillStyle='#2b3342';g.beginPath();g.ellipse(0,0,11,7,0,0,6.283);g.fill();g.strokeStyle='rgba(255,62,62,.7)';g.lineWidth=1;g.beginPath();g.moveTo(-6,-2);g.lineTo(2,1);g.lineTo(6,-3);g.stroke();g.restore()}
      const cg=g.createRadialGradient(x-6,y-6,2,x,y,R*.7);cg.addColorStop(0,b.flash>0?'#fff':'#e8ecf5');cg.addColorStop(.6,'#5a6070');cg.addColorStop(1,'#14171e');g.fillStyle=cg;g.beginPath();g.arc(x,y,R*.7,0,6.283);g.fill();
      g.fillStyle='#0a0000';g.beginPath();g.ellipse(x,y,R*.5,R*.16,0,0,6.283);g.fill();g.shadowColor='#ff3e3e';g.shadowBlur=12;g.fillStyle='#ff3e3e';g.beginPath();g.ellipse(x+clamp((hx()-x)/40,-6,6),y,R*.16,R*.12,0,0,6.283);g.fill();g.shadowBlur=0;return}
    // the boulder body
    const ck=b.crack||0,bx=b.x+(ck?Math.random()*ck*10-ck*5:0)+(b.state==='dying'?Math.random()*6-3:0),by=b.y,u=b.unfold;g.save();g.translate(bx,by);
    {const dg=g.createRadialGradient(0,20,30,0,20,260);dg.addColorStop(0,'rgba(0,0,0,.55)');dg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=dg;g.fillRect(-260,-240,520,520)}
    if(b.ball>0)g.rotate(b.ang*b.ball);
    // stubby round arms and fists
    if(b.ball<.5&&u>.3)[-1,1].forEach(s=>{const sw=b.state==='idle'?Math.sin(t*4+s)*8:b.state==='hurl'&&b.sub===0?-30:0;g.fillStyle='#232934';g.beginPath();g.ellipse(s*(84+u*6),20+sw,22,30,s*.3,0,6.283);g.fill();
      const fg=g.createRadialGradient(s*92-4,56+sw-6,2,s*92,56+sw,26);fg.addColorStop(0,'#6a7080');fg.addColorStop(1,'#14171e');g.fillStyle=fg;g.beginPath();g.arc(s*92,56+sw,26,0,6.283);g.fill()});
    // body of fused platters
    const R=92-b.ball*20;const bg=g.createRadialGradient(-26,-34,10,0,0,R);bg.addColorStop(0,b.flash>0?'#fff':'#6a7080');bg.addColorStop(.55,'#2b3342');bg.addColorStop(1,'#0c0e13');g.fillStyle=bg;g.beginPath();g.ellipse(0,0,R,R*.95,0,0,6.283);g.fill();
    g.strokeStyle='rgba(200,206,220,.18)';g.lineWidth=2;for(let i=1;i<5;i++){g.beginPath();g.ellipse(0,10,R*i/5,R*i/5*.4,0,Math.PI*1.05,Math.PI*1.95);g.stroke()}
    g.strokeStyle=`rgba(255,62,62,${.6+.3*Math.sin(t*3)+ck*.4})`;g.lineWidth=2+ck*3;g.shadowColor='#ff3e3e';g.shadowBlur=8+ck*14;g.beginPath();g.moveTo(-60,-40);g.lineTo(-30,-10);g.lineTo(-44,30);g.moveTo(-30,-10);g.lineTo(10,-24);g.lineTo(46,8);g.lineTo(30,50);g.moveTo(10,-24);g.lineTo(20,-70);g.stroke();
    if(ck>0){g.beginPath();g.moveTo(-80,0);g.lineTo(-40,-60);g.moveTo(70,-30);g.lineTo(40,60);g.moveTo(0,80);g.lineTo(-20,20);g.stroke()}g.shadowBlur=0;
    // the crack-eye
    if(b.ball<.6){const eo=Math.min(b.eye,1)*u,ey=-30;g.fillStyle='#050000';g.beginPath();g.ellipse(b.face*10,ey,40,Math.max(2,14*eo),0,0,6.283);g.fill();if(eo>.1){g.shadowColor='#ff3e3e';g.shadowBlur=20;g.fillStyle='#ff3e3e';g.beginPath();g.ellipse(b.face*10+clamp((hx()-bx)/30,-14,14),ey,10*(b.eye>1?1.4:1),8*eo,0,0,6.283);g.fill();g.fillStyle='#fff0f0';g.beginPath();g.arc(b.face*10+clamp((hx()-bx)/30,-14,14),ey,2.5,0,6.283);g.fill();g.shadowBlur=0}}
    if(b.state==='dying'){for(let i=0;i<7;i++){const a=i*.9+t;g.strokeStyle=`rgba(255,220,220,${.4+.4*Math.sin(t*20+i)})`;g.lineWidth=3;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a)*(90+b.st*90),Math.sin(a)*(90+b.st*90));g.stroke()}}
    g.restore()};
  return b}

Object.assign(LP.BOSSES,{leak,sector});

/* ---------- intros ---------- */
function closeGates(){LP.ents.filter(e=>e.kind==='gate').forEach(g=>g.close())}
function* leakIntro(b,full){H.ctrl=false;H.vx=0;yield .25;closeGates();yield .5;b.wake=0;
  if(full){LP.music('quiet');LP.cam.focus={x:b.x,y:b.y-40,s:2};LP.darkOverride=.7;
    // the memories of Cache Row drift up out of the floor and into it
    for(let s=0;s<3.4;s+=LP.DT){if(Math.random()<.18){const x=rand(80,W-80);LP.part({x,y:FLOOR,vx:(b.x-x)*.35,vy:-60,life:2.4,k:'img',draw:(g,p,k)=>{g.globalAlpha=k*.6;LP.bitling(g,p.x,p.y,{role:pick(['elder','worker','clerk','kid'])},p.t*3,0,false,false);g.globalAlpha=1}})}if(Math.random()<.3)b.mems[Math.random()*b.mems.length|0].r=rand(10,62);yield LP.DT}
    LP.darkOverride=null}
  LP.cam.focus={x:b.x,y:b.y,s:3};for(let s=0;s<(full?1.4:.6);s+=LP.DT){b.wake=Math.min(1,s/(full?1.2:.5));b.face=-1;yield LP.DT}LP.sfx('roar');LP.shake(12);b.state='wake';yield .4;
  LP.titleCard('MEMORY LEAK','IT NEVER LETS GO',full?2.4:1.5);yield full?2.3:1.4;LP.cam.focus=null;b.state='idle';b.next=.6;H.ctrl=true;LP.music('boss3')}
function* sectorIntro(b,full){H.ctrl=false;H.vx=0;yield .25;closeGates();yield .5;b.unfold=0;b.eye=0;
  if(full){LP.music('quiet');for(let i=0;i<4;i++){LP.darkOverride=.6+i*.08;LP.sfx('thud');LP.shake(6);yield .55}
    LP.cam.focus={x:W/2,y:300,s:2};for(let i=34;i>=10;i-=2){const r=LP.room;r.grid[16*r.w+i]=0;r.grid[16*r.w+i-1]=0;LP.buildRoomCanvas(r);LP.sfx('glitch');for(let k=0;k<6;k++)LP.part({x:i*T,y:FLOOR,vx:rand(-60,60),vy:-rand(60,200),life:.6,col:'#ff3e3e',s:3});yield .07}
    yield .4;b.restoreFloor();LP.sfx('zap');yield .5}
  LP.cam.focus={x:b.x,y:b.y,s:3};for(let s=0;s<(full?1.6:.7);s+=LP.DT){b.unfold=Math.min(1,s/(full?1.4:.6));if(Math.random()<.3)LP.shake(4);yield LP.DT}
  b.eye=1;LP.sfx('roar');LP.shake(16);LP.flash={c:'rgba(255,62,62,',t:.25,m:.4};if(full){LP.bigGlitch('SECTOR UNREADABLE',1.3);yield 1.2}LP.darkOverride=null;
  LP.titleCard('BAD SECTOR','WHAT IT TOUCHES WAS NEVER THERE',full?2.4:1.5);yield full?2.3:1.4;LP.cam.focus=null;b.state='idle';b.next=.6;H.ctrl=true;LP.music('boss4')}
Object.assign(LP.INTROS,{leak:leakIntro,sector:sectorIntro});
})();
