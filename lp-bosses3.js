/* LAST PATCH — stage 3 bosses: Render Fiend, Thermal Runaway, Surge, Dead Pixel. Cheap effects only: no blur, capped bullets. */
(function(){
'use strict';
const LP=window.LP,T=LP.T,{clamp,rand,pick,lerp,appr,sign}=LP,H=LP.H;
const FLOOR=480,CEIL=60,W=36*T,hx=()=>H.x+H.w/2,hy=()=>H.y+H.h/2;
const haz=o=>Object.assign({t:0,life:1,on:true,upd(){},draw(){}},o);
const segD=(px,py,x0,y0,x1,y1)=>{const dx=x1-x0,dy=y1-y0,l=dx*dx+dy*dy||1,k=clamp(((px-x0)*dx+(py-y0)*dy)/l,0,1);return Math.hypot(px-(x0+dx*k),py-(y0+dy*k))};
function seg(b,x0,y0,x1,y1,tell,col,live,w){b.haz.push(haz({k:'seg',x0,y0,x1,y1,x:Math.min(x0,x1),w:Math.abs(x1-x0),life:tell+(live||.22),tell,on:false,
  upd(){this.on=this.t>this.tell;if(this.on&&!this.s){this.s=1;LP.sfx('zap')}},hit(hb){return segD(hb.x+hb.w/2,hb.y+hb.h/2,this.x0,this.y0,this.x1,this.y1)<(w||14)},
  draw(g){const on=this.t>this.tell;g.strokeStyle=on?'#ffffff':col;g.globalAlpha=on?1:.35+.3*Math.sin(this.t*40);g.lineWidth=on?(w||14)*.7:2;g.beginPath();g.moveTo(this.x0,this.y0);g.lineTo(this.x1,this.y1);g.stroke();if(on){g.strokeStyle=col;g.lineWidth=(w||14)*1.3;g.globalAlpha=.35;g.stroke()}g.globalAlpha=1}}))}
function rectT(b,x,y,w,h,tell,col,live){b.haz.push(haz({k:'rect',x,y,w,h,life:tell+(live||.25),tell,on:false,upd(){this.on=this.t>this.tell;if(this.on&&!this.s){this.s=1;LP.sfx('zap');LP.shake(4)}},
  draw(g){if(this.t<this.tell){g.fillStyle=col;g.globalAlpha=.12+.12*Math.sin(this.t*40);g.fillRect(this.x,this.y,this.w,this.h);g.globalAlpha=.6;g.strokeStyle=col;g.lineWidth=2;g.strokeRect(this.x+1,this.y+1,this.w-2,this.h-2)}else{g.fillStyle='#fff';g.globalAlpha=.85;g.fillRect(this.x,this.y,this.w,this.h);g.fillStyle=col;g.globalAlpha=.4;g.fillRect(this.x-4,this.y-4,this.w+8,this.h+8)}g.globalAlpha=1}}))}
function die(b,x,y,col){b.dead=true;b.x=x;b.y=y;LP.shake(30);LP.sfx('boom');LP.burst(x,y,70,col,700,{g:400});LP.part({x,y,k:'ring',col:'#fff',s:20,grow:900,life:.6,w:6});LP.flash={c:'rgba(255,255,255,',t:.5,m:.8};LP.bossDefeated(b)}
function dyingFx(x,y,col){if(Math.random()<.5)LP.part({x:x+rand(-30,30),y:y+rand(-30,30),vx:rand(-300,300),vy:rand(-300,0),g:400,life:.5,col:pick([col,'#fff']),k:'spark',s:3})}
function closeGates(){LP.ents.filter(e=>e.kind==='gate').forEach(g=>g.close())}
const bullets=()=>LP.shots.filter(s=>!s.mine).length;

/* =====================================================================
   RENDER FIEND — GPU. A face that paints itself into every frame.
   ===================================================================== */
function fiend(){const NM=LP.NM,max=NM?112:92;
  const b={id:'fiend',name:'RENDER FIEND',music:'boss5',hp:max,max,x:W/2+150,y:230,tx:W/2,ty:230,state:'wait',st:0,sub:0,t:0,flash:0,haz:[],next:1,last:'',draw0:0,dead:false,mirror:null,orbs:null};
  const tell=n=>NM?n*rand(.6,1.05):n;
  b.hitboxes=()=>b.form2?(b.c.st==='dying'||b.c.st==='intro'?[]:[{x:b.x-24,y:b.y-24,w:48,h:48}]):['wait','hatch','dying'].includes(b.state)?[]:[{x:b.x-46,y:b.y-52,w:92,h:100}];
  b.contact=()=>[];b.skip=()=>{b.draw0=1;b.state='idle';b.next=.6};
  b.kill=()=>{if(b.state==='hatch'&&!b.form2)return;b.hurt(b.hp+999,1)};
  b.hurt=(d)=>{if(!b.hitboxes().length)return false;b.hp-=d;b.flash=.1;LP.sfx('hit');LP.burst(b.x,b.y,10,'#ff4fd8',300);
    if(b.hp<=0){b.hp=0;if(b.form2)b.c.st='dying',b.c.t=0;else{b.state='dying';b.st=0}b.haz.length=0;b.mirror=null;LP.stopMusic();LP.stop(.25);LP.shots=LP.shots.filter(s=>s.mine)}
    else if(!b.form2&&b.hp<=max/2&&b.state!=='hatch'){b.state='hatch';b.st=0;b.haz.length=0;b.mirror=null;hatch()}return true};
  function done(){b.state='idle';b.st=0;b.next=NM?rand(.2,.55):.55;b.tx=clamp(hx()+pick([-280,280]),140,W-140);b.ty=rand(170,260)}
  function choose(){const o=['raster','beams','mirror','tiles','raster'].filter(a=>a!==b.last);b.last=pick(o);b.state=b.last;b.st=0;b.sub=0;b.n=0}
  function hatch(){LP.runCS((function*(){H.ctrl=false;LP.cam.focus={x:b.x,y:b.y,s:3};LP.sfx('glitch');for(let s=0;s<1.4;s+=LP.DT){b.split=s/1.4;if(Math.random()<.3)LP.shake(5);yield LP.DT}
    b.form2=true;b.c={st:'intro',t:0,ang:0,R:90,orb:[{c:'#ff3e5b'},{c:'#3eff8a'},{c:'#3e8bff'}]};LP.flash={c:'rgba(255,255,255,',t:.4,m:.85};LP.shake(24);LP.sfx('boom');LP.burst(b.x,b.y,60,'#ff4fd8',600,{g:300});LP.burst(b.x,b.y,40,'#4ff0ff',500,{g:300});
    LP.bigGlitch('OVERCLOCK',1);yield .9;LP.titleCard('RENDER FIEND','RED · GREEN · BLUE',1.8);yield 1.2;LP.cam.focus=null;b.c.st='idle';b.c.wait=.4;LP.music('frenzy')})())}
  /* phase 2: three colour orbs around a naked white core */
  function orbPos(i){const C=b.c,o=C.orb[i];if(o.fx!=null)return o;const a=C.ang+i*2.094;return{x:b.x+Math.cos(a)*C.R,y:b.y+Math.sin(a)*C.R}}
  function c2(dt){const C=b.c;C.t+=dt;C.ang+=dt*(C.st==='spin'?5:1.6);
    switch(C.st){
      case 'intro':C.R=lerp(C.R,90,.05);break;
      case 'idle':b.x=lerp(b.x,clamp(hx()+Math.sin(b.t*.7)*300,120,W-120),1-Math.exp(-1.5*dt));b.y=lerp(b.y,220+Math.sin(b.t*1.3)*40,1-Math.exp(-2*dt));C.wait-=dt;if(C.wait<=0){const o=['prism','sweep','scatter','prism'].filter(a=>a!==C.last);C.last=pick(o);C.st=C.last;C.t=0;C.n=0;C.sub=0}break;
      case 'prism':{if(C.t>(C.n===0?.2:NM?rand(.5,.8):.85)&&C.n<3){C.t=0;C.n++;const cx=hx(),cy=hy()-10,R=rand(150,230),a0=rand(0,6.283),pts=[0,1,2].map(i=>[cx+Math.cos(a0+i*2.094)*R,cy+Math.sin(a0+i*2.094)*R*.7]);
          C.orb.forEach((o,i)=>{o.fx=pts[i][0];o.fy=pts[i][1]});const tl=NM?rand(.45,.65):.65;for(let i=0;i<3;i++){const p=pts[i],q=pts[(i+1)%3];seg(b,p[0],p[1],q[0],q[1],tl,C.orb[i].c,.25,14)}}
        if(C.n>=3&&C.t>1){C.orb.forEach(o=>{o.fx=null});C.st='idle';C.wait=NM?.3:.5}break}
      case 'sweep':{if(C.sub===0){C.side=hx()<b.x?-1:1;C.sub=1;C.t=0;LP.sfx('warn')}
        else if(C.sub===1){C.R=lerp(C.R,10,.15);if(C.t>(NM?rand(.5,.8):.8)){C.sub=2;C.t=0}}
        else if(C.sub===2){const k=Math.min(1,C.t/1.3),a=C.side>0?-Math.PI/2+k*Math.PI*.6:-Math.PI/2-k*Math.PI*.6,x1=b.x+Math.cos(a)*1300,y1=b.y+Math.sin(a)*1300;
          b.haz.push(haz({k:'beam',x0:b.x,y0:b.y,x1,y1,x:Math.min(b.x,x1),w:Math.abs(x1-b.x),life:.02,hit(hb){return segD(hb.x+hb.w/2,hb.y+hb.h/2,this.x0,this.y0,this.x1,this.y1)<22},draw(g){g.strokeStyle='#ffffff';g.lineWidth=18;g.beginPath();g.moveTo(this.x0,this.y0);g.lineTo(this.x1,this.y1);g.stroke();g.strokeStyle='rgba(255,79,216,.4)';g.lineWidth=34;g.stroke()}}));
          if(k>=1){C.sub=3;C.t=0}}else if(C.sub===3){C.R=lerp(C.R,90,.1);if(C.t>.6){C.st='idle';C.wait=.5}}break}
      case 'scatter':{if(C.t>(C.n===0?.3:NM?.4:.55)&&C.n<3){const o=C.orb[C.n];o.dash={t:0,sx:orbPos(C.n).x,sy:orbPos(C.n).y,tx:hx(),ty:hy()};C.t=0;C.n++;LP.sfx('dash')}
        C.orb.forEach(o=>{if(!o.dash)return;o.dash.t+=dt;const k=o.dash.t/.45;if(k<1){o.fx=lerp(o.dash.sx,o.dash.tx+(o.dash.tx-o.dash.sx)*.4,k);o.fy=lerp(o.dash.sy,o.dash.ty+(o.dash.ty-o.dash.sy)*.4,k);b.haz.push(haz({k:'orb',x:o.fx-18,y:o.fy-18,w:36,h:36,life:.02}))}else if(k<2){o.fx=lerp(o.fx,b.x,.1);o.fy=lerp(o.fy,b.y,.1)}else{o.dash=null;o.fx=null}});
        if(C.n>=3&&C.orb.every(o=>!o.dash)){C.st='idle';C.wait=.45}break}
      case 'dying':dyingFx(b.x,b.y,'#ff4fd8');C.R=lerp(C.R,0,.03);if(C.t>2.2&&!b.dead)die(b,b.x,b.y,'#ff4fd8');break}}
  b.update=dt=>{b.t+=dt;b.st+=dt;b.flash-=dt;
    if(b.form2)c2(dt);else switch(b.state){
      case 'wait':case 'hatch':break;
      case 'idle':b.x=lerp(b.x,b.tx,1-Math.exp(-2*dt));b.y=lerp(b.y,b.ty+Math.sin(b.t*1.7)*12,1-Math.exp(-2*dt));b.next-=dt;if(b.next<=0)choose();break;
      case 'raster':{if(b.sub===0){b.gap=clamp(hx()+rand(-200,200),90,W-90);b.sub=1;b.st=0;LP.sfx('warn')}
        else if(b.sub===1&&b.st>tell(.6)){b.sub=2;b.st=0;b.ry=CEIL}
        else if(b.sub===2){b.ry+=(NM?300:250)*dt;const gw=NM?120:140,y=b.ry;b.haz.push(haz({k:'scan',x:0,y,w:b.gap-gw/2,h:22,life:.02}),haz({k:'scan',x:b.gap+gw/2,y,w:W,h:22,life:.02}));
          if(b.ry>FLOOR){b.n++;if(b.n<(NM?3:2)){b.sub=0}else done()}}break}
      case 'beams':{if(b.sub===0||(b.sub===2&&b.st>.55)){if(b.n>=(NM?3:2)){done();break}const tl=tell(.6);[-90,0,90].forEach(o=>rectT(b,clamp(hx()+o,10,W-50)-18,CEIL,36,FLOOR-CEIL,tl,'#4ff0ff',.25));b.n++;b.sub=2;b.st=0;LP.sfx('warn')}break}
      case 'mirror':{if(b.sub===0){b.mirror={t:0,x:W-hx(),y:H.y};b.sub=1;b.st=0;LP.sfx('glitch');LP.text(W-hx(),H.y-20,'?','#ff4fd8',{s:18})}
        else{const m=b.mirror;if(m){m.t+=dt;m.x=W-hx();m.y=H.y;if(m.t>.4)b.haz.push(haz({k:'mirror',x:m.x-12,y:m.y,w:24,h:H.h,life:.02}));if(m.t>(NM?5:4.2)){b.mirror=null;done()}}}break}
      case 'tiles':{if(b.st>(b.n===0?.2:.22)&&b.n<(NM?9:7)){b.st=0;b.n++;const x=clamp(hx()+rand(-260,260),40,W-40);b.haz.push(haz({k:'tile',x:x-22,y:CEIL-50,w:44,h:44,life:3,vy:0,tl:.5,on:false,
          upd(dt){if(this.t<this.tl)return;this.on=true;this.vy+=2200*dt;this.y+=this.vy*dt;if(this.y+44>=FLOOR){this.life=0;LP.shake(4);LP.burst(this.x+22,FLOOR,10,'#ff4fd8',220,{g:900})}},
          draw(g){if(this.t<this.tl){g.fillStyle=`rgba(255,79,216,${.2+.2*Math.sin(this.t*40)})`;g.fillRect(this.x+4,FLOOR-4,36,4);return}g.fillStyle='#2a1238';g.beginPath();g.roundRect?g.roundRect(this.x,this.y,44,44,10):g.rect(this.x,this.y,44,44);g.fill();g.fillStyle='#ff4fd8';g.fillRect(this.x+6,this.y+6,14,14);g.fillStyle='#4ff0ff';g.fillRect(this.x+24,this.y+24,14,14)}}))}
        if(b.n>=(NM?9:7)&&b.st>1)done();break}
      case 'dying':dyingFx(b.x,b.y,'#ff4fd8');if(b.st>2.2&&!b.dead)die(b,b.x,b.y,'#ff4fd8');break}
    for(const z of b.haz){z.t+=dt;z.upd(dt)}b.haz=b.haz.filter(z=>z.t<z.life);LP.light(b.x,b.y,240,.8)};
  function mask(g,x,y,s,col,al,t){g.save();g.translate(x,y);g.scale(s,s);g.globalAlpha=al;g.fillStyle=col;g.beginPath();g.ellipse(0,0,42,52,0,0,6.283);g.fill();g.fillStyle='#07020b';
    const look=clamp((hx()-x)/60,-6,6);g.beginPath();g.ellipse(-16+look,-10,11,15,-.2,0,6.283);g.ellipse(16+look,-10,11,15,.2,0,6.283);g.fill();
    g.beginPath();g.moveTo(-28,18);g.quadraticCurveTo(0,40+Math.sin(t*3)*4,28,18);g.quadraticCurveTo(0,30,-28,18);g.fill();g.restore()}
  b.draw=g=>{const t=b.t;for(const z of b.haz)z.draw(g);
    if(b.state==='raster'&&b.sub>=1){const gw=NM?120:140;g.fillStyle='rgba(79,240,255,.12)';g.fillRect(b.gap-gw/2,CEIL,gw,FLOOR-CEIL);if(b.sub===2){g.fillStyle='rgba(255,255,255,.9)';g.fillRect(0,b.ry,b.gap-gw/2,22);g.fillRect(b.gap+gw/2,b.ry,W,22);g.fillStyle='rgba(255,79,216,.35)';g.fillRect(0,b.ry-8,W,4)}}
    if(b.mirror){const m=b.mirror;g.save();g.globalAlpha=Math.min(1,m.t*3);g.translate(m.x,m.y+H.h);g.scale(-H.face,1);g.fillStyle='#ff4fd8';g.beginPath();g.ellipse(0,-15,8,14,0,0,6.283);g.fill();g.fillStyle='#16020f';g.beginPath();g.arc(0,-34,10,0,6.283);g.fill();g.fillStyle='#ff4fd8';g.fillRect(2,-36,7,3);g.restore();LP.light(m.x,m.y+20,80,.6)}
    if(b.form2){const C=b.c;g.strokeStyle='rgba(255,255,255,.25)';g.lineWidth=1;for(let i=0;i<3;i++){const p=orbPos(i);g.beginPath();g.moveTo(b.x,b.y);g.lineTo(p.fx!=null?p.fx:p.x,p.fy!=null?p.fy:p.y);g.stroke()}
      for(let i=0;i<3;i++){const o=C.orb[i],p=orbPos(i),x=o.fx!=null?o.fx:p.x,y=o.fy!=null?o.fy:p.y;g.fillStyle=o.c;g.globalAlpha=.3;g.beginPath();g.arc(x,y,30,0,6.283);g.fill();g.globalAlpha=1;g.beginPath();g.arc(x,y,16,0,6.283);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(x-4,y-4,4,0,6.283);g.fill();LP.light(x,y,90,.6)}
      if(C.st==='sweep'&&C.sub===1){g.strokeStyle=`rgba(255,62,107,${.4+.3*Math.sin(t*40)})`;g.lineWidth=2;g.setLineDash([10,8]);g.beginPath();g.moveTo(b.x,b.y);g.lineTo(b.x+C.side*500,b.y-60);g.stroke();g.setLineDash([])}
      g.fillStyle=b.flash>0?'#ff4fd8':'#ffffff';g.beginPath();g.arc(b.x,b.y,20+Math.sin(t*12)*2,0,6.283);g.fill();g.fillStyle='#07020b';g.beginPath();g.ellipse(b.x+clamp((hx()-b.x)/80,-5,5),b.y,5,9,0,0,6.283);g.fill();return}
    if(b.state==='wait'&&b.draw0<1){const k=b.draw0;g.strokeStyle='#4ff0ff';g.globalAlpha=.8;g.lineWidth=1;for(let i=0;i<Math.floor(k*24);i++){const a=i/24*6.283;g.beginPath();g.moveTo(b.x,b.y);g.lineTo(b.x+Math.cos(a)*42,b.y+Math.sin(a)*52);g.stroke()}g.globalAlpha=1;if(k<.6)return}
    // light-arms
    g.lineCap='round';for(let i=0;i<4;i++){const s=i<2?-1:1,a=(i%2?.6:-.2)+Math.sin(t*2+i)*.25,L=110;const ex=b.x+s*Math.cos(a)*L,ey=b.y+Math.sin(a)*L+40;g.strokeStyle='rgba(255,79,216,.55)';g.lineWidth=5;g.beginPath();g.moveTo(b.x+s*30,b.y+20);g.quadraticCurveTo(b.x+s*80,b.y-30,ex,ey);g.stroke();
      g.strokeStyle='rgba(79,240,255,.7)';g.lineWidth=1.5;for(let f=0;f<3;f++){g.beginPath();g.moveTo(ex,ey);g.lineTo(ex+s*(10+f*4),ey+12+f*5);g.stroke()}}
    const sp=(b.split||0)*20,jit=Math.random()<.1?rand(-6,6):0;g.globalCompositeOperation='lighter';mask(g,b.x-4-sp+jit,b.y,1,'#ff2e5b',.55,t);mask(g,b.x+4+sp,b.y,1,'#2e8bff',.55,t);mask(g,b.x,b.y-2-sp*.5,1,'#2eff8a',.45,t);g.globalCompositeOperation='source-over';
    mask(g,b.x,b.y,.96,b.flash>0?'#ffffff':'#f2e6f0',.92,t);
    g.strokeStyle='rgba(7,2,11,.5)';g.lineWidth=1;g.beginPath();for(let i=0;i<6;i++){const a=i*1.05+.3;g.moveTo(b.x,b.y);g.lineTo(b.x+Math.cos(a)*40,b.y+Math.sin(a)*50)}g.stroke()};
  return b}

/* =====================================================================
   THERMAL RUNAWAY — the cooling fan stopped cooling and started hunting.
   ===================================================================== */
function runaway(){const NM=LP.NM,max=NM?118:96,HX=W/2,HY=230;
  const b={id:'runaway',name:'THERMAL RUNAWAY',music:'boss6',hp:max,max,x:HX,y:HY,state:'wait',st:0,sub:0,t:0,flash:0,haz:[],next:1,last:'',spin:0,heat:0,dead:false,blades:7};
  const tell=n=>NM?n*rand(.6,1.05):n;
  b.hitboxes=()=>b.form2?(b.m.st==='dying'||b.m.st==='intro'?[]:[{x:b.x-38,y:b.y-38,w:76,h:76}]):['wait','hatch','dying'].includes(b.state)?[]:[{x:b.x-52,y:b.y-52,w:104,h:104}];
  b.contact=()=>[];b.skip=()=>{b.spin=6;b.heat=1;b.state='idle';b.next=.6};b.kill=()=>{if(b.state!=='hatch'||b.form2)b.hurt(b.hp+999,1)};
  b.hurt=d=>{if(!b.hitboxes().length)return false;b.hp-=d;b.flash=.1;LP.sfx('hit');LP.burst(b.x,b.y,12,'#ff8a3e',320);
    if(b.hp<=0){b.hp=0;if(b.form2){b.m.st='dying';b.m.t=0}else{b.state='dying';b.st=0}b.haz.length=0;H.pull=0;LP.stopMusic();LP.stop(.25);LP.shots=LP.shots.filter(s=>s.mine)}
    else if(!b.form2&&b.hp<=max/2&&b.state!=='hatch'){b.state='hatch';b.st=0;b.haz.length=0;H.pull=0;melt()}return true};
  function done(){b.state='idle';b.st=0;b.next=NM?rand(.25,.6):.6;H.pull=0}
  function choose(){const o=['gust','blade','ring','lower','blade'].filter(a=>a!==b.last);b.last=pick(o);b.state=b.last;b.st=0;b.sub=0;b.n=0}
  function puddle(x){b.haz.push(haz({k:'fire',x:x-24,y:FLOOR-10,w:48,h:10,life:NM?2.6:2,draw(g){const a=Math.min(1,(this.life-this.t)/.4);g.globalAlpha=a;g.fillStyle='#ff5b1e';g.beginPath();g.ellipse(this.x+24,FLOOR-3,24,6,0,0,6.283);g.fill();g.fillStyle='#ffd27a';g.beginPath();g.ellipse(this.x+24+Math.sin(this.t*12)*6,FLOOR-8,5,8,0,0,6.283);g.fill();g.globalAlpha=1}}))}
  function melt(){LP.runCS((function*(){H.ctrl=false;LP.cam.focus={x:HX,y:HY,s:3};LP.sfx('roar');for(let s=0;s<1.5;s+=LP.DT){b.heat=1+s/1.5;b.spin=lerp(b.spin,0,.03);if(Math.random()<.4)LP.shake(5);yield LP.DT}
    b.form2=true;b.m={st:'intro',t:0,vx:0,vy:0};b.fallen=Array.from({length:7},(_,i)=>({x:HX+Math.cos(i*.9)*120,y:HY,vx:rand(-300,300),vy:rand(-400,-100),a:i*.9,va:rand(-6,6)}));
    LP.flash={c:'rgba(255,200,120,',t:.45,m:.85};LP.shake(28);LP.sfx('boom');LP.burst(HX,HY,70,'#ff8a3e',650,{g:500});LP.bigGlitch('MELTDOWN',1);yield .9;LP.titleCard('THERMAL RUNAWAY','MELTDOWN',1.8);yield 1.3;LP.cam.focus=null;b.m.st='idle';b.m.wait=.4;LP.music('frenzy')})())}
  function m2(dt){const M=b.m;M.t+=dt;
    if(b.fallen)for(const f of b.fallen){if(f.rest)continue;f.vy+=1600*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.a+=f.va*dt;if(f.y>FLOOR-10){f.y=FLOOR-10;f.rest=1;LP.shake(4);LP.sfx('thud')}}
    switch(M.st){
      case 'intro':b.y=lerp(b.y,300,.05);break;
      case 'idle':b.x=lerp(b.x,clamp(hx()+Math.sin(b.t)*250,90,W-90),1-Math.exp(-2*dt));b.y=lerp(b.y,280+Math.sin(b.t*3)*30,1-Math.exp(-3*dt));M.wait-=dt;if(M.wait<=0){const o=['bounce','erupt','flare','bounce'].filter(a=>a!==M.last);M.last=pick(o);M.st=M.last;M.t=0;M.n=0;M.sub=0}break;
      case 'bounce':{if(M.sub===0){if(M.t>(NM?.3:.45)){M.sub=1;M.t=0;const a=Math.atan2(hy()-b.y,hx()-b.x);M.vx=Math.cos(a)*(NM?800:700);M.vy=Math.sin(a)*(NM?800:700);LP.sfx('dash')}}
        else{b.x+=M.vx*dt;b.y+=M.vy*dt;if(b.x<70||b.x>W-70){M.vx*=-1;b.x=clamp(b.x,70,W-70);LP.shake(6)}if(b.y<100||b.y>FLOOR-40){M.vy*=-1;b.y=clamp(b.y,100,FLOOR-40);LP.shake(6);if(b.y>=FLOOR-41){puddle(b.x);LP.sfx('thud')}}
          b.haz.push(haz({k:'ball',x:b.x-34,y:b.y-34,w:68,h:68,life:.02}));if(Math.random()<.5)LP.part({x:b.x,y:b.y,vx:rand(-60,60),vy:rand(-60,60),life:.5,col:pick(['#ff8a3e','#ffd27a']),s:5});if(M.t>(NM?3.4:2.8)){M.st='idle';M.wait=.5}}break}
      case 'erupt':{if(M.sub===0){b.y=lerp(b.y,140,.1);if(M.t>.5){M.sub=1;M.t=0;M.k=0;M.dir=hx()<W/2?1:-1}}
        else if(M.t>(NM?.18:.24)&&M.k<7){M.t=0;const x=M.dir>0?60+M.k*150:W-60-M.k*150;M.k++;b.haz.push(haz({k:'pillar',x:x-28,y:CEIL,w:56,h:FLOOR-CEIL,life:.9,on:false,upd(){this.on=this.t>.45&&this.t<.85;if(this.t>.45&&!this.s){this.s=1;LP.sfx('whoosh');LP.shake(4)}},
            draw(g){if(this.t<.45){g.fillStyle=`rgba(255,138,62,${.3+.3*Math.sin(this.t*40)})`;g.fillRect(this.x+6,FLOOR-6,44,6)}else if(this.on){const k=Math.min(1,(this.t-.45)/.1);g.fillStyle='rgba(255,120,40,.85)';g.fillRect(this.x,FLOOR-(FLOOR-CEIL)*k,56,(FLOOR-CEIL)*k);g.fillStyle='rgba(255,240,180,.9)';g.fillRect(this.x+18,FLOOR-(FLOOR-CEIL)*k,20,(FLOOR-CEIL)*k)}}}))}
        else if(M.k>=7&&M.t>1){M.st='idle';M.wait=.5}break}
      case 'flare':{b.y=lerp(b.y,200,.08);if(M.t>(M.n===0?.5:.6)&&M.n<(NM?4:3)&&bullets()<60){M.t=0;M.n++;const n=12,o=rand(0,1);for(let i=0;i<n;i++){const a=(i+o)/n*6.283;LP.shots.push({x:b.x,y:b.y,vx:Math.cos(a)*230,vy:Math.sin(a)*230,r:8,col:'#ff8a3e',life:3,brk:true})}LP.sfx('shoot')}if(M.n>=(NM?4:3)&&M.t>.8){M.st='idle';M.wait=.4}break}
      case 'dying':dyingFx(b.x,b.y,'#ff8a3e');if(M.t>2.2&&!b.dead)die(b,b.x,b.y,'#ff8a3e');break}}
  b.update=dt=>{b.t+=dt;b.st+=dt;b.flash-=dt;b.spin+=0;b.rot=(b.rot||0)+dt*b.spin;
    if(b.form2)m2(dt);else switch(b.state){
      case 'wait':case 'hatch':break;
      case 'idle':b.y=lerp(b.y,HY,.05);b.spin=lerp(b.spin,6,.05);b.next-=dt;if(b.next<=0)choose();break;
      case 'gust':{const dir=b.gd||(b.gd=pick([-1,1]));b.spin=lerp(b.spin,16,.05);if(b.st<tell(.6)){if(b.st<dt*1.5)LP.sfx('warn')}else{H.pull=dir*(NM?330:280);if(Math.random()<.8)LP.part({x:dir>0?0:W,y:rand(CEIL,FLOOR),vx:dir*rand(500,800),life:1.6,col:'rgba(220,245,255,.4)',s:2,k:'spark'});
          const vx=dir>0?W-70:10;b.haz.push(haz({k:'vent',x:vx,y:FLOOR-80,w:60,h:80,life:.02,draw(g){g.fillStyle='rgba(255,120,40,.6)';g.fillRect(this.x,this.y,60,80);g.fillStyle='rgba(255,240,180,.7)';g.fillRect(this.x+20,this.y+10,20,70)}}));
          if(b.st>tell(.6)+(NM?3:2.4)){b.gd=0;done()}}break}
      case 'blade':{if(b.sub===0&&b.st>tell(.45)){b.sub=1;b.st=0;b.blades--;const sx=b.x,sy=b.y,tx=hx(),ty=hy();b.haz.push(haz({k:'blade',x:sx,y:sy,w:1,h:1,life:2.4,sx,sy,tx,ty,
            upd(){const k=this.t/2.4,u=k<.5?LP.ease.out(k*2):1-LP.ease.inOut((k-.5)*2),side=Math.sin(k*Math.PI)*140;this.cx=lerp(this.sx,this.tx,u)+side*(this.tx>this.sx?-.2:.2);this.cy=lerp(this.sy,this.ty,u)-side*.5;this.x=this.cx-36;this.y=this.cy-36;this.w=this.h=72},
            hit(hb){return Math.hypot(hb.x+hb.w/2-this.cx,hb.y+hb.h/2-this.cy)<38},draw(g){g.save();g.translate(this.cx,this.cy);g.rotate(this.t*14);g.fillStyle='#a8e8ff';g.beginPath();g.moveTo(0,-6);g.quadraticCurveTo(28,-26,40,-4);g.quadraticCurveTo(26,6,0,6);g.closePath();g.fill();g.rotate(Math.PI);g.fill();g.restore()}}));LP.sfx('whoosh')}
        else if(b.sub===1&&b.st>2.4){b.blades=Math.min(7,b.blades+1);b.n++;if(b.n<(NM?3:2)){b.sub=0;b.st=0}else done()}break}
      case 'ring':{if(b.st>(b.n===0?tell(.4):NM?.7:.9)&&b.n<(NM?3:2)){b.st=0;b.n++;const gapA=Math.atan2(hy()-HY,hx()-HX)+rand(-.6,.6);LP.sfx('whoosh');b.haz.push(haz({k:'ring',x:0,y:0,w:W,h:FLOOR,life:2.2,gap:gapA,
            upd(){this.r=60+this.t*360},hit(hb){const cx=hb.x+hb.w/2,cy=hb.y+hb.h/2,d=Math.hypot(cx-HX,cy-HY);if(Math.abs(d-this.r)>14)return false;let a=Math.atan2(cy-HY,cx-HX)-this.gap;while(a>Math.PI)a-=6.283;while(a<-Math.PI)a+=6.283;return Math.abs(a)>.42},
            draw(g){g.strokeStyle='rgba(255,138,62,.85)';g.lineWidth=12;g.beginPath();g.arc(HX,HY,this.r,this.gap+.42,this.gap-.42+6.283);g.stroke();g.strokeStyle='rgba(255,240,180,.8)';g.lineWidth=3;g.stroke()}}))}
        if(b.n>=(NM?3:2)&&b.st>2)done();break}
      case 'lower':{b.spin=lerp(b.spin,2,.05);b.y=lerp(b.y,b.st<2.8?370:HY,.06);if(b.st>.4&&b.st<2.6&&Math.random()<dt*(NM?5:3.5)){const x=rand(40,W-40);b.haz.push(haz({k:'icicle',x:x-6,y:CEIL,w:12,h:26,life:2,vy:0,tl:.4,on:false,upd(dt){if(this.t<this.tl)return;this.on=true;this.vy+=2000*dt;this.y+=this.vy*dt;if(this.y>FLOOR)this.life=0},
            draw(g){g.fillStyle=this.on?'#e0f8ff':'rgba(224,248,255,.4)';g.beginPath();g.moveTo(this.x,this.y);g.lineTo(this.x+12,this.y);g.lineTo(this.x+6,this.y+26);g.fill()}}))}if(b.st>3.2)done();break}
      case 'dying':dyingFx(b.x,b.y,'#ff8a3e');b.spin=lerp(b.spin,0,.02);if(b.st>2.2&&!b.dead)die(b,b.x,b.y,'#ff8a3e');break}
    for(const z of b.haz){z.t+=dt;z.upd(dt)}b.haz=b.haz.filter(z=>z.t<z.life);LP.light(b.x,b.y,240,.9)};
  b.draw=g=>{const t=b.t,ht=Math.min(2,b.heat);
    // the fan frame
    if(!b.form2){g.save();g.translate(HX,HY);g.strokeStyle='#16303f';g.lineWidth=14;g.beginPath();g.arc(0,0,240,0,6.283);g.stroke();g.strokeStyle='rgba(168,232,255,.25)';g.lineWidth=2;g.stroke();
      g.rotate(b.rot||0);for(let i=0;i<b.blades;i++){g.rotate(6.283/7);g.fillStyle=ht>1?`rgb(${Math.round(60+ht*80)},${Math.round(70)},${Math.round(60)})`:'#1e4258';g.beginPath();g.moveTo(0,-30);g.quadraticCurveTo(130,-110,210,-30);g.quadraticCurveTo(120,-10,0,30);g.closePath();g.fill();g.strokeStyle='rgba(168,232,255,.3)';g.lineWidth=2;g.stroke()}g.restore()}
    else if(b.fallen){for(const f of b.fallen){g.save();g.translate(f.x,f.y);g.rotate(f.a);g.fillStyle='#1e4258';g.beginPath();g.moveTo(-50,-6);g.quadraticCurveTo(0,-20,50,-4);g.quadraticCurveTo(0,6,-50,6);g.fill();g.restore()}}
    for(const z of b.haz)z.draw(g);
    if(b.state==='gust'&&b.st<.6){const d=b.gd||1;g.fillStyle='rgba(255,62,107,.25)';g.fillRect(d>0?W-70:10,FLOOR-80,60,80)}
    // the hub: a molten face
    const x=b.x,y=b.y,R=b.form2?40:50;const gr=g.createRadialGradient(x-10,y-10,4,x,y,R);gr.addColorStop(0,b.flash>0?'#fff':'#ffe6a8');gr.addColorStop(.5,'#ff7a1e');gr.addColorStop(1,'#5a1c06');g.fillStyle=gr;g.beginPath();g.arc(x,y,R,0,6.283);g.fill();
    g.strokeStyle='#2a0c04';g.lineWidth=3;g.beginPath();g.moveTo(x-30,y-20);g.lineTo(x-8,y-6);g.lineTo(x-18,y+20);g.moveTo(x+28,y-24);g.lineTo(x+10,y);g.stroke();
    const look=clamp((hx()-x)/50,-6,6);g.fillStyle='#fff8e0';g.beginPath();g.ellipse(x-14+look,y-6,7,9,0,0,6.283);g.ellipse(x+14+look,y-6,7,9,0,0,6.283);g.fill();g.fillStyle='#2a0c04';g.beginPath();g.ellipse(x+look*.4,y+18,14,5+Math.sin(t*6)*2,0,0,6.283);g.fill();
    if(b.form2){for(let i=0;i<5;i++){const a=t*4+i*1.26;g.fillStyle='rgba(255,138,62,.6)';g.beginPath();g.ellipse(x+Math.cos(a)*(R+6),y+Math.sin(a)*(R+6),8,4,a,0,6.283);g.fill()}}};
  return b}

/* =====================================================================
   SURGE — the battery. A swollen cell with lightning living inside.
   ===================================================================== */
function surge(){const NM=LP.NM,max=NM?118:98;
  const b={id:'surge',name:'SURGE',music:'boss7',hp:max,max,x:W/2+150,y:FLOOR,state:'wait',st:0,sub:0,t:0,flash:0,haz:[],next:1,last:'',charge:0,dead:false,swell:0};
  const tell=n=>NM?n*rand(.6,1.05):n;
  b.hitboxes=()=>b.form2?(b.w2.st==='dying'||b.w2.st==='intro'||b.w2.gone?[]:[{x:b.x-24,y:b.y-30,w:48,h:60}]):['wait','hatch','dying'].includes(b.state)?[]:[{x:b.x-60,y:b.y-200,w:120,h:200}];
  b.contact=()=>[];b.skip=()=>{b.charge=1;b.state='idle';b.next=.6};b.kill=()=>{if(b.state!=='hatch'||b.form2){if(b.form2)b.w2.gone=false;b.hurt(b.hp+999,1)}};
  b.hurt=d=>{if(!b.hitboxes().length)return false;b.hp-=d;b.flash=.1;LP.sfx('hit');LP.burst(b.x,b.form2?b.y:b.y-100,12,'#d4ff3e',320);
    if(b.hp<=0){b.hp=0;if(b.form2){b.w2.st='dying';b.w2.t=0}else{b.state='dying';b.st=0}b.haz.length=0;LP.stopMusic();LP.stop(.25);LP.shots=LP.shots.filter(s=>s.mine)}
    else if(!b.form2&&b.hp<=max/2&&b.state!=='hatch'){b.state='hatch';b.st=0;b.haz.length=0;burst()}return true};
  function done(){b.state='idle';b.st=0;b.next=NM?rand(.25,.6):.6}
  function choose(){const o=['arcs','grid','strike','acid','arcs'].filter(a=>a!==b.last);b.last=pick(o);b.state=b.last;b.st=0;b.sub=0;b.n=0}
  function bolt(g,x0,y0,x1,y1,w){g.strokeStyle='#f4ffb0';g.lineWidth=w;g.beginPath();g.moveTo(x0,y0);const n=8;for(let i=1;i<n;i++){const k=i/n;g.lineTo(lerp(x0,x1,k)+rand(-12,12),lerp(y0,y1,k)+rand(-12,12))}g.lineTo(x1,y1);g.stroke();g.strokeStyle='rgba(212,255,62,.35)';g.lineWidth=w*3;g.stroke()}
  function burst(){LP.runCS((function*(){H.ctrl=false;LP.cam.focus={x:b.x,y:b.y-100,s:3};LP.sfx('roar');for(let s=0;s<1.6;s+=LP.DT){b.swell=s/1.6;if(Math.random()<.4){LP.shake(5);LP.sfx('zap')}yield LP.DT}
    b.form2=true;b.shell={x:b.x};b.w2={st:'intro',t:0};b.y=FLOOR-140;LP.flash={c:'rgba(240,255,190,',t:.45,m:.9};LP.shake(28);LP.sfx('boom');LP.burst(b.x,FLOOR-100,70,'#d4ff3e',650,{g:600});
    LP.bigGlitch('340% CHARGE',1);yield .9;LP.titleCard('SURGE','OVERCHARGED',1.8);yield 1.3;LP.cam.focus=null;b.w2.st='idle';b.w2.wait=.4;LP.music('frenzy')})())}
  function w2(dt){const S=b.w2;S.t+=dt;
    switch(S.st){
      case 'intro':b.y=lerp(b.y,240,.05);break;
      case 'idle':b.x=lerp(b.x,clamp(hx()+Math.sin(b.t*1.3)*260,90,W-90),1-Math.exp(-3*dt));b.y=lerp(b.y,230+Math.sin(b.t*4)*30,1-Math.exp(-3*dt));S.wait-=dt;if(S.wait<=0){const o=['zigzag','balls','thunder','zigzag'].filter(a=>a!==S.last);S.last=pick(o);S.st=S.last;S.t=0;S.n=0;S.sub=0}break;
      case 'zigzag':{if(S.sub===0){const pts=[[b.x,b.y]];for(let i=0;i<4;i++){const p=pts[pts.length-1];pts.push([clamp(i%2?hx()+rand(-80,80):p[0]+rand(-380,380),60,W-60),clamp(i%2?hy():rand(120,420),90,460)])}S.pts=pts;S.sub=1;S.t=0;const tl=NM?rand(.45,.7):.7;for(let i=0;i<4;i++)seg(b,pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],tl+i*.08,'#d4ff3e',.2,14);LP.sfx('warn')}
        else if(S.sub===1&&S.t>(NM?.75:1)){const p=S.pts[S.pts.length-1];b.x=p[0];b.y=p[1];S.gone=false;S.sub=2;S.t=0;LP.burst(b.x,b.y,20,'#f4ffb0',300)}
        else if(S.sub===2&&S.t>.5){S.n++;if(S.n<(NM?3:2))S.sub=0;else{S.st='idle';S.wait=.4}}if(S.sub===1)S.gone=S.t>.4;break}
      case 'balls':{if(S.t>.3&&S.n<3){S.t=0;S.n++;const a=rand(0,6.283);b.haz.push(haz({k:'ball',x:b.x,y:b.y,w:28,h:28,cx:b.x,cy:b.y,life:NM?6:5,
          upd(dt){const dx=hx()-this.cx,dy=hy()-this.cy,d=Math.hypot(dx,dy)||1,sp=NM?150:120;this.cx+=dx/d*sp*dt;this.cy+=dy/d*sp*dt;this.x=this.cx-14;this.y=this.cy-14;const ab=LP.atkBox();if(ab&&LP.overlap(ab,this)){this.life=0;LP.burst(this.cx,this.cy,14,'#d4ff3e',260);LP.sfx('hit')}},
          draw(g){g.fillStyle='rgba(212,255,62,.35)';g.beginPath();g.arc(this.cx,this.cy,16,0,6.283);g.fill();g.fillStyle='#f4ffb0';g.beginPath();g.arc(this.cx,this.cy,8,0,6.283);g.fill();LP.light(this.cx,this.cy,60,.6)}}))}if(S.n>=3&&S.t>1.4){S.st='idle';S.wait=.6}break}
      case 'thunder':{if(S.sub===0){b.y=lerp(b.y,110,.1);b.x=lerp(b.x,hx(),.08);if(S.t>(NM?.5:.7)){S.sub=1;S.t=0}}
        else if(S.sub===1){b.y+=1600*dt;if(b.y>=FLOOR-30){b.y=FLOOR-30;S.sub=2;S.t=0;LP.shake(18);LP.sfx('boom');[-1,1].forEach(d=>b.haz.push(haz({k:'shock',x:b.x-20,y:FLOOR-28,w:40,h:28,life:3,d,upd(dt){this.x+=this.d*480*dt;if(this.x<0||this.x>W)this.life=0},draw(g){bolt(g,this.x,FLOOR,this.x+20,FLOOR-28,2)}})));
            for(let i=0;i<6;i++){const x=rand(40,W-40);b.haz.push(haz({k:'spark',x:x-8,y:CEIL,w:16,h:16,life:2,vy:0,tl:.3,on:false,upd(dt){if(this.t<this.tl)return;this.on=true;this.vy+=1800*dt;this.y+=this.vy*dt;if(this.y>FLOOR)this.life=0},draw(g){g.fillStyle=this.on?'#f4ffb0':'rgba(212,255,62,.3)';g.beginPath();g.arc(this.x+8,this.y+8,6,0,6.283);g.fill()}}))}}}
        else if(S.sub===2&&S.t>.7){S.st='idle';S.wait=.4}break}
      case 'dying':dyingFx(b.x,b.y,'#d4ff3e');if(S.t>2.2&&!b.dead)die(b,b.x,b.y,'#d4ff3e');break}}
  b.update=dt=>{b.t+=dt;b.st+=dt;b.flash-=dt;
    if(b.form2)w2(dt);else switch(b.state){
      case 'wait':case 'hatch':break;
      case 'idle':b.x=appr(b.x,clamp(hx()+(b.x<hx()?-260:260),120,W-120),80*dt);b.next-=dt;if(b.next<=0)choose();break;
      case 'arcs':{if(b.st>(b.n===0?.2:NM?.55:.7)&&b.n<(NM?4:3)){b.st=0;b.n++;const lanes=[FLOOR-16,FLOOR-56,FLOOR-110];const L=lanes.sort(()=>Math.random()-.5).slice(0,NM&&Math.random()<.4?2:1);const tl=tell(.6);L.forEach(y=>seg(b,0,y,W,y,tl,'#d4ff3e',.35,12))}
        if(b.n>=(NM?4:3)&&b.st>1)done();break}
      case 'grid':{if(b.sub===0){const n=7,safe=new Set([Math.floor(Math.random()*n),Math.floor(Math.random()*n)]);const tl=tell(.85);for(let i=0;i<n;i++)if(!safe.has(i))rectT(b,i*W/n+4,FLOOR-20,W/n-8,20,tl,'#d4ff3e',.6);b.sub=1;b.st=0;LP.sfx('warn')}else if(b.st>1.7){b.n++;if(b.n<(NM?3:2))b.sub=0;else done()}break}
      case 'strike':{if(b.st>(b.n===0?.2:NM?.35:.45)&&b.n<(NM?5:4)){b.st=0;b.n++;rectT(b,clamp(hx(),30,W-30)-22,CEIL,44,FLOOR-CEIL,tell(.55),'#d4ff3e',.2)}if(b.n>=(NM?5:4)&&b.st>.9)done();break}
      case 'acid':{if(b.sub===0&&b.st>tell(.45)){b.sub=1;b.st=0;[-120,0,120].forEach(o=>{const tx=clamp(hx()+o,30,W-30),x0=b.x,y0=b.y-180,ft=rand(.7,.9);b.haz.push(haz({k:'glob',x:x0,y:y0,w:16,h:16,vx:(tx-x0)/ft,vy:(FLOOR-16-y0-.5*1300*ft*ft)/ft,life:3,
          upd(dt){this.vy+=1300*dt;this.x+=this.vx*dt;this.y+=this.vy*dt;if(this.y+16>=FLOOR){this.life=0;LP.burst(this.x+8,FLOOR,8,'#b6ff2e',160);b.haz.push(haz({k:'pool',x:this.x-20,y:FLOOR-8,w:56,h:8,life:NM?2.6:2,draw(g){g.fillStyle='rgba(182,255,46,.7)';g.beginPath();g.ellipse(this.x+28,FLOOR-2,28,5,0,0,6.283);g.fill()}}))}},
          draw(g){g.fillStyle='#b6ff2e';g.beginPath();g.arc(this.x+8,this.y+8,8,0,6.283);g.fill()}}))});LP.sfx('shoot')}else if(b.sub===1&&b.st>.9)done();break}
      case 'dying':dyingFx(b.x,b.y-100,'#d4ff3e');if(b.st>2.2&&!b.dead)die(b,b.x,b.y-100,'#d4ff3e');break}
    for(const z of b.haz){z.t+=dt;z.upd(dt)}b.haz=b.haz.filter(z=>z.t<z.life);LP.light(b.x,b.form2?b.y:b.y-100,240,.8)};
  b.draw=g=>{const t=b.t;for(const z of b.haz)z.draw(g);
    if(b.form2){if(b.shell){const x=b.shell.x;g.fillStyle='#1a240a';g.beginPath();g.moveTo(x-64,FLOOR);g.quadraticCurveTo(x-60,FLOOR-80,x-30,FLOOR-70);g.lineTo(x-14,FLOOR-96);g.lineTo(x+8,FLOOR-64);g.lineTo(x+30,FLOOR-90);g.quadraticCurveTo(x+62,FLOOR-70,x+64,FLOOR);g.fill()}
      const S=b.w2;if(S.gone)return;const x=b.x,y=b.y;
      // the wraith: a body drawn from forks of lightning around a hot core
      for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*.5;bolt(g,x,y,x+Math.cos(a)*rand(36,56),y+Math.sin(a)*rand(36,56),1.5)}bolt(g,x,y,x-18,y+60,2);bolt(g,x,y,x+18,y+60,2);bolt(g,x,y,x-50,y+10,1.5);bolt(g,x,y,x+50,y+10,1.5);
      g.fillStyle=b.flash>0?'#fff':'#f4ffb0';g.beginPath();g.arc(x,y,13,0,6.283);g.fill();g.fillStyle='#050902';g.beginPath();g.ellipse(x+clamp((hx()-x)/60,-4,4),y,3,7,0,0,6.283);g.fill();return}
    // the swollen cell
    const sw=b.swell||0,x=b.x+(sw?rand(-1,1)*sw*6:0),cw=120*(1+sw*.25),ch=200*(1+sw*.1),y0=FLOOR-ch;
    g.fillStyle='#0c1204';g.fillRect(x-28,FLOOR-14,14,14);g.fillRect(x+14,FLOOR-14,14,14);
    g.fillStyle='#2a3510';g.beginPath();g.roundRect?g.roundRect(x-cw/2,y0,cw,ch-10,cw/2):g.rect(x-cw/2,y0,cw,ch-10);g.fill();
    const lv=.55+.1*Math.sin(t*2);g.save();g.beginPath();g.roundRect?g.roundRect(x-cw/2+10,y0+10,cw-20,ch-30,cw/2-10):g.rect(x-cw/2+10,y0+10,cw-20,ch-30);g.clip();g.fillStyle='rgba(182,255,46,.45)';g.fillRect(x-cw/2,y0+ch*(1-lv),cw,ch);
    if(Math.random()<.5)bolt(g,x+rand(-30,30),y0+20,x+rand(-30,30),FLOOR-30,1.5);g.restore();
    g.fillStyle='#4a5a20';g.fillRect(x-36,y0-16,20,20);g.fillRect(x+16,y0-16,20,20);g.fillStyle=b.flash>0?'#fff':'#d4ff3e';g.fillRect(x-30,y0-22,8,8);
    const eo=b.charge;g.fillStyle='#050902';g.beginPath();g.ellipse(x,y0+60,34,10*eo+2,0,0,6.283);g.fill();if(eo>.1){g.fillStyle='#f4ffb0';g.beginPath();g.ellipse(x+clamp((hx()-x)/40,-14,14),y0+60,8,7*eo,0,0,6.283);g.fill()}
    if(sw>0){g.strokeStyle=`rgba(244,255,176,${sw})`;g.lineWidth=2;for(let i=0;i<5;i++){g.beginPath();g.moveTo(x+rand(-40,40),y0+rand(20,ch-30));g.lineTo(x+rand(-60,60),y0+rand(20,ch-30));g.stroke()}}};
  return b}

/* =====================================================================
   DEAD PIXEL — the display. A hole where the light used to be.
   ===================================================================== */
function pixel(){const NM=LP.NM,max=NM?120:100;
  const b={id:'pixel',name:'DEAD PIXEL',music:'boss8',hp:max,max,x:W/2+150,y:240,R:0,state:'wait',st:0,sub:0,t:0,flash:0,haz:[],next:1,last:'',eye:0,dead:false,ghosts:[]};
  const tell=n=>NM?n*rand(.6,1.05):n;
  b.hitboxes=()=>['wait','hatch','dying','tele'].includes(b.state)||(b.form2&&b.state==='flip'&&b.sub===0)?[]:[{x:b.x-b.R*.8,y:b.y-b.R*.8,w:b.R*1.6,h:b.R*1.6}];
  b.contact=()=>[];b.skip=()=>{b.R=46;b.eye=1;b.state='idle';b.next=.6};b.kill=()=>{if(b.state!=='hatch'){b.state='idle';b.hurt(b.hp+999,1)}};
  b.hurt=d=>{if(!b.hitboxes().length)return false;b.hp-=d;b.flash=.1;LP.sfx('glitch');LP.burst(b.x,b.y,12,pick(['#ff3e3e','#3eff6b','#3e8bff']),320);
    if(b.hp<=0){b.hp=0;b.state='dying';b.st=0;b.haz.length=0;b.ghosts=[];LP.flipT=0;H.pull=0;LP.stopMusic();LP.stop(.25);LP.shots=LP.shots.filter(s=>s.mine)}
    else if(!b.form2&&b.hp<=max/2&&b.state!=='hatch'){b.state='hatch';b.st=0;b.haz.length=0;tear()}return true};
  function done(){b.state='idle';b.st=0;b.next=NM?rand(.2,.5):.5;H.pull=0}
  function choose(){const o=b.form2?['flip','tearlines','swallow','stare','tearlines']:['stare','burnin','deadzone','stuck','stare'];const L=o.filter(a=>a!==b.last);b.last=pick(L);b.state=b.last;b.st=0;b.sub=0;b.n=0}
  function teleport(x,y){LP.tearT=.25;LP.sfx('glitch');b.x=x;b.y=y;LP.burst(x,y,14,'#ffffff',260)}
  function tear(){LP.runCS((function*(){H.ctrl=false;LP.cam.focus={x:b.x,y:b.y,s:3};LP.sfx('roar');for(let s=0;s<1.4;s+=LP.DT){b.R=lerp(46,90,s/1.4);if(Math.random()<.3){LP.tearT=.15;LP.shake(5)}yield LP.DT}
    b.form2=true;LP.flash={c:'rgba(255,255,255,',t:.5,m:1};LP.shake(26);LP.sfx('boom');LP.flipT=1;yield .9;LP.flipT=0;LP.titleCard('DEAD PIXEL','SCREEN TEAR',1.8);yield 1.2;LP.cam.focus=null;b.state='idle';b.next=.4;LP.music('frenzy')})())}
  b.update=dt=>{b.t+=dt;b.st+=dt;b.flash-=dt;
    for(const gh of b.ghosts)gh.t+=dt;b.ghosts=b.ghosts.filter(gh=>gh.t<2.6);
    switch(b.state){
      case 'wait':case 'hatch':break;
      case 'idle':b.x=lerp(b.x,clamp(hx()+Math.sin(b.t*.9)*260,100,W-100),1-Math.exp(-1.5*dt));b.y=lerp(b.y,220+Math.sin(b.t*1.7)*40,1-Math.exp(-2*dt));b.next-=dt;if(b.next<=0)choose();break;
      case 'stare':{if(b.sub===0){teleport(clamp(hx()+pick([-1,1])*rand(220,320),80,W-80),rand(150,300));b.sub=1;b.st=0;b.lx=hx();b.ly=hy();LP.sfx('warn')}
        else if(b.sub===1&&b.st>tell(.55)){const a=Math.atan2(b.ly-b.y,b.lx-b.x);seg(b,b.x,b.y,b.x+Math.cos(a)*1400,b.y+Math.sin(a)*1400,0,'#ff3e3e',.3,18);b.sub=2;b.st=0;LP.shake(8)}
        else if(b.sub===2&&b.st>.5){b.n++;if(b.n<(NM?3:2))b.sub=0;else done()}break}
      case 'burnin':{if(b.sub===0){b.sx=b.x<W/2?100:W-100;b.ex=W-b.sx;b.sub=1;b.st=0;teleport(b.sx,rand(200,400))}
        else{const k=Math.min(1,b.st/1.6);b.x=lerp(b.sx,b.ex,k);b.y=300+Math.sin(k*9)*110;if(Math.random()<dt*14)b.ghosts.push({x:b.x,y:b.y,t:0});if(k>=1)done()}break}
      case 'deadzone':{if(b.sub===0){const n=5;for(let i=0;i<n;i++){const x=clamp(hx()+(i-2)*130+rand(-30,30),20,W-80);rectT(b,x,FLOOR-60,60,60,tell(.75),'#ffffff',2)}b.sub=1;b.st=0;LP.sfx('warn')}else if(b.st>3)done();break}
      case 'stuck':{if(b.sub===0){b.stk=[0,1,2,3].map(i=>({x:clamp(hx()+Math.cos(i*1.57)*240,40,W-40),y:clamp(hy()-100+Math.sin(i*1.57)*120,80,440),c:['#ff3e3e','#3eff6b','#3e8bff','#ffffff'][i],n:0,t:-i*.3}));b.sub=1;b.st=0}
        else{for(const s of b.stk){s.t+=dt;if(s.t>.6&&s.n<3&&bullets()<50){s.t=0;s.n++;const a=Math.atan2(hy()-s.y,hx()-s.x);LP.shots.push({x:s.x,y:s.y,vx:Math.cos(a)*300,vy:Math.sin(a)*300,r:6,col:s.c,life:3,brk:true});LP.sfx('bullet')}}if(b.stk.every(s=>s.n>=3)&&b.st>1){b.stk=null;done()}}break}
      case 'flip':{if(b.sub===0){LP.text(W/2,120,'⇆','#ffffff',{s:30,life:.8});LP.sfx('warn');if(b.st>.8){b.sub=1;b.st=0;LP.flipT=NM?4.5:4;LP.sfx('glitch')}}
        else{if(b.st>.35&&b.st<3.6&&bullets()<60&&Math.floor(b.st*8)!==b.lastE){b.lastE=Math.floor(b.st*8);for(let i=0;i<2;i++){const a=b.st*2.4+i*Math.PI;LP.shots.push({x:b.x,y:b.y,vx:Math.cos(a)*200,vy:Math.sin(a)*200,r:6,col:'#ffffff',life:4,brk:true})}}if(b.st>4.2)done()}break}
      case 'tearlines':{if(b.st>(b.n===0?.2:NM?.4:.5)&&b.n<(NM?5:4)){b.st=0;b.n++;const y=clamp(hy()+rand(-30,30),CEIL+20,FLOOR-20),gap=rand(80,W-80);rectT(b,0,y-12,gap-60,24,tell(.55),'#ffffff',.25);rectT(b,gap+60,y-12,W,24,tell(.55),'#ffffff',.25)}if(b.n>=(NM?5:4)&&b.st>1)done();break}
      case 'swallow':{H.pull=(b.x-hx()>0?1:-1)*(NM?240:200);if(Math.random()<dt*10){const x=rand(30,W-30);b.haz.push(haz({k:'drop',x:x-8,y:CEIL,w:16,h:16,life:2,vy:0,upd(dt){this.vy+=1500*dt;this.y+=this.vy*dt;if(this.y>FLOOR)this.life=0},draw(g){g.fillStyle=pick(['#ff3e3e','#3eff6b','#3e8bff']);g.fillRect(this.x,this.y,16,16)}}))}
        b.haz.push(haz({k:'maw',x:b.x-b.R,y:b.y-b.R,w:b.R*2,h:b.R*2,life:.02,hit(hb){return Math.hypot(hb.x+hb.w/2-b.x,hb.y+hb.h/2-b.y)<b.R}}));if(b.st>(NM?3.2:2.6)){H.pull=0;done()}break}
      case 'dying':dyingFx(b.x,b.y,'#ffffff');b.R=lerp(b.R,0,.02);if(b.st>2.2&&!b.dead)die(b,b.x,b.y,'#ffffff');break}
    for(const gh of b.ghosts)if(gh.t>.6&&gh.t<2.4)b.haz.push(haz({k:'ghost',x:gh.x-20,y:gh.y-20,w:40,h:40,life:.02}));
    for(const z of b.haz){z.t+=dt;z.upd(dt)}b.haz=b.haz.filter(z=>z.t<z.life)};
  b.draw=g=>{const t=b.t;for(const z of b.haz)z.draw(g);
    for(const gh of b.ghosts){const live=gh.t>.6;g.globalAlpha=live?Math.min(1,(2.6-gh.t)):.25;g.fillStyle=live?'#000':'#444';g.beginPath();g.arc(gh.x,gh.y,20,0,6.283);g.fill();g.strokeStyle=live?'rgba(255,62,62,.8)':'rgba(255,255,255,.3)';g.lineWidth=2;g.stroke()}g.globalAlpha=1;
    if(b.stk)for(const s of b.stk){g.fillStyle=s.c;g.fillRect(s.x-9,s.y-9,18,18);LP.light(s.x,s.y,60,.6)}
    if(b.state==='stare'&&b.sub===1){g.strokeStyle=`rgba(255,62,62,${.4+.3*Math.sin(t*40)})`;g.lineWidth=2;g.setLineDash([10,8]);g.beginPath();g.moveTo(b.x,b.y);g.lineTo(b.lx,b.ly);g.stroke();g.setLineDash([])}
    if(b.R<2)return;const x=b.x,y=b.y,R=b.R;
    // rim: the light around the hole bends into its colours
    g.globalCompositeOperation='lighter';[['#ff3e3e',-3],['#3eff6b',0],['#3e8bff',3]].forEach(([c,o])=>{g.strokeStyle=c;g.globalAlpha=.6;g.lineWidth=3;g.beginPath();g.arc(x+o,y,R+4+Math.sin(t*5)*2,0,6.283);g.stroke()});g.globalCompositeOperation='source-over';g.globalAlpha=1;
    g.fillStyle='#000';g.beginPath();g.arc(x,y,R,0,6.283);g.fill();
    if(b.form2){g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=1;for(let i=0;i<6;i++){g.beginPath();g.moveTo(x+Math.cos(i)*R,y+Math.sin(i)*R);g.lineTo(x+Math.cos(i)*(R+30+Math.sin(t*6+i)*10),y+Math.sin(i)*(R+30));g.stroke()}}
    const eo=b.eye,er=R*.45;if(eo>.05){g.fillStyle='#e8e8f0';g.beginPath();g.ellipse(x,y,er,er*.75*eo,0,0,6.283);g.fill();const lx=clamp((hx()-x)/40,-er*.4,er*.4),ly=clamp((hy()-y)/60,-er*.2,er*.2);
      ['#ff3e3e','#3eff6b','#3e8bff'].forEach((c,i)=>{g.fillStyle=c;g.beginPath();g.arc(x+lx+(i-1)*er*.18,y+ly,er*.32*eo,0,6.283);g.fill()});g.fillStyle=b.flash>0?'#fff':'#000';g.beginPath();g.arc(x+lx,y+ly,er*.16,0,6.283);g.fill()}};
  return b}

Object.assign(LP.BOSSES,{fiend,runaway,surge,pixel});

/* ---------- intros ---------- */
function* fiendIntro(b,full){H.ctrl=false;H.vx=0;yield .25;closeGates();yield .5;b.x=W/2+150;b.y=230;
  if(full){LP.music('quiet');LP.console(['> frame 88,201,449 ......... rendered','> frame 88,201,450 ......... rendered','> frame 88,201,451 ......... it’s looking at me'],40);yield 3.6}
  LP.cam.focus={x:b.x,y:b.y,s:3};const ft=full?1.8:.7;for(let s=0;s<ft;s+=LP.DT){b.draw0=s/ft;if(Math.random()<.2)LP.sfx('type');yield LP.DT}b.draw0=1;b.state='idle';b.next=99;LP.sfx('glitch');LP.flash={c:'rgba(255,79,216,',t:.25,m:.5};yield .4;
  LP.titleCard('RENDER FIEND','IT PAINTS ITSELF INTO EVERY FRAME',full?2.4:1.5);yield full?2.3:1.4;LP.cam.focus=null;b.next=.6;H.ctrl=true;LP.music('boss5')}
function* runawayIntro(b,full){H.ctrl=false;H.vx=0;yield .25;closeGates();yield .5;LP.cam.focus={x:W/2,y:230,s:2.5};
  if(full){LP.music('quiet');const temps=['42°C','67°C','97°C','131°C','???'];for(const tp of temps){LP.text(W/2,120,tp,'#ff8a3e',{s:22,life:.9,vy:-20});LP.sfx('tick');for(let s=0;s<.7;s+=LP.DT){b.spin=lerp(b.spin,8,.03);yield LP.DT}}}
  for(let s=0;s<(full?1:.5);s+=LP.DT){b.spin=lerp(b.spin,12,.08);b.heat=s;yield LP.DT}b.heat=1;LP.sfx('roar');LP.shake(14);
  LP.titleCard('THERMAL RUNAWAY','IT STOPPED COOLING AND STARTED HUNTING',full?2.4:1.5);yield full?2.3:1.4;LP.cam.focus=null;b.state='idle';b.next=.6;H.ctrl=true;LP.music('boss6')}
function* surgeIntro(b,full){H.ctrl=false;H.vx=0;yield .25;closeGates();yield .5;LP.cam.focus={x:b.x,y:b.y-110,s:2.5};
  if(full){LP.music('quiet');LP.darkOverride=.8;for(const p of ['3%','47%','100%','340%']){LP.text(b.x,b.y-260,'BATTERY '+p,'#d4ff3e',{s:18,life:.8,vy:-10});LP.sfx('zap');LP.flash={c:'rgba(212,255,62,',t:.12,m:.35};b.swell=.15;yield .75;b.swell=0}LP.darkOverride=null}
  for(let s=0;s<(full?.8:.4);s+=LP.DT){b.charge=s/(full?.8:.4);yield LP.DT}b.charge=1;LP.sfx('roar');LP.shake(14);
  LP.titleCard('SURGE','THE CHARGE THAT NEVER STOPS',full?2.4:1.5);yield full?2.3:1.4;LP.cam.focus=null;b.state='idle';b.next=.6;H.ctrl=true;LP.music('boss7')}
function* pixelIntro(b,full){H.ctrl=false;H.vx=0;yield .25;closeGates();yield .5;LP.cam.focus={x:b.x,y:b.y,s:2.5};
  if(full){LP.music('quiet');LP.darkOverride=0;LP.flash={c:'rgba(255,255,255,',t:1.2,m:.7};yield 1.2;LP.darkOverride=null}
  for(let s=0;s<(full?1.6:.6);s+=LP.DT){b.R=lerp(0,46,s/(full?1.6:.6));yield LP.DT}b.R=46;yield .3;for(let s=0;s<.5;s+=LP.DT){b.eye=s/.5;yield LP.DT}b.eye=1;LP.tearT=.3;LP.sfx('glitch');LP.shake(10);
  LP.titleCard('DEAD PIXEL','IT IS WHERE THE LIGHT USED TO BE',full?2.4:1.5);yield full?2.3:1.4;LP.cam.focus=null;b.state='idle';b.next=.6;H.ctrl=true;LP.music('boss8')}
Object.assign(LP.INTROS,{fiend:fiendIntro,runaway:runawayIntro,surge:surgeIntro,pixel:pixelIntro});
})();
