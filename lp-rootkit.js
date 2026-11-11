/* LAST PATCH — ROOTKIT, the thing in the firmware, and the ending. Three phases. */
(function(){
'use strict';
const LP=window.LP,T=LP.T,{clamp,rand,pick,lerp,appr,sign}=LP,H=LP.H;
const FLOOR=480,CEIL=60,W=40*T,hx=()=>H.x+H.w/2,hy=()=>H.y+H.h/2;
const haz=o=>Object.assign({t:0,life:1,on:true,upd(){},draw(){}},o);
const segD=(px,py,x0,y0,x1,y1)=>{const dx=x1-x0,dy=y1-y0,l=dx*dx+dy*dy||1,k=clamp(((px-x0)*dx+(py-y0)*dy)/l,0,1);return Math.hypot(px-(x0+dx*k),py-(y0+dy*k))};
const AMB='#ffb000';
function rectT(b,x,y,w,h,tell,col,live,extra){b.haz.push(haz(Object.assign({k:'rect',x,y,w,h,life:tell+(live||.25),tell,on:false,upd(){this.on=this.t>this.tell;if(this.on&&!this.s){this.s=1;LP.sfx('zap');LP.shake(5)}},
  draw(g){if(this.t<this.tell){g.strokeStyle=col;g.globalAlpha=.45+.3*Math.sin(this.t*40);g.lineWidth=2;g.setLineDash([8,6]);g.strokeRect(this.x+1,this.y+1,this.w-2,this.h-2);g.setLineDash([]);g.fillStyle=col;g.globalAlpha=.08;g.fillRect(this.x,this.y,this.w,this.h)}else{g.fillStyle='#fff3d0';g.globalAlpha=.85;g.fillRect(this.x,this.y,this.w,this.h)}g.globalAlpha=1}},extra||{})))}
function seg(b,x0,y0,x1,y1,tell,live,w){b.haz.push(haz({k:'seg',x0,y0,x1,y1,x:Math.min(x0,x1),w:Math.abs(x1-x0),life:tell+(live||.22),tell,on:false,upd(){this.on=this.t>this.tell;if(this.on&&!this.s){this.s=1;LP.sfx('zap')}},
  hit(hb){return segD(hb.x+hb.w/2,hb.y+hb.h/2,this.x0,this.y0,this.x1,this.y1)<(w||14)},draw(g){const on=this.t>this.tell;g.strokeStyle=on?'#fff3d0':AMB;g.globalAlpha=on?1:.35+.3*Math.sin(this.t*40);g.lineWidth=on?(w||14)*.8:2;g.beginPath();g.moveTo(this.x0,this.y0);g.lineTo(this.x1,this.y1);g.stroke();g.globalAlpha=1}}))}
const HEX='0123456789ABCDEF';

function rootkit(){const NM=LP.NM,max=NM?210:176;
  const b={phases:3,id:'rootkit',name:'ROOTKIT',music:'final',hp:max,max,x:W/2+160,y:300,state:'wait',st:0,sub:0,t:0,flash:0,haz:[],next:1,last:'',phase:1,rise:0,dead:false,code:[],cur:null,eye:0,lid:0};
  for(let i=0;i<14;i++)b.code.push(Array.from({length:10},()=>HEX[Math.random()*16|0]).join(''));
  const tell=n=>NM?n*rand(.6,1.05):n;
  b.hitboxes=()=>{if(['wait','shift','dying'].includes(b.state))return[];if(b.phase===3)return b.lid>.5?[{x:b.x-50,y:b.y-50,w:100,h:100}]:[];if(b.phase===2)return[{x:b.x-30,y:b.y-30,w:60,h:60}];return[{x:b.x-46,y:b.y-120,w:92,h:180}]};
  b.contact=()=>[];b.skip=()=>{b.rise=1;b.state='idle';b.next=.6};b.kill=()=>{if(b.state==='shift')return;if(b.phase===3)b.lid=1;b.hurt(b.hp+999,1)};
  b.hurt=d=>{if(!b.hitboxes().length)return false;if(b.phase===3&&b.state==='open')d*=1.5;b.hp-=d;b.flash=.1;LP.sfx('hit');LP.burst(b.x,b.y,12,AMB,320);
    if(b.hp<=0){b.hp=0;b.state='dying';b.st=0;b.haz.length=0;H.pull=0;LP.stopMusic();LP.stop(.3);LP.shots=LP.shots.filter(s=>s.mine)}
    else if(b.phase===1&&b.hp<=max*.66){shift(2)}else if(b.phase===2&&b.hp<=max*.33){shift(3)}return true};
  function done(){b.state='idle';b.st=0;b.next=NM?rand(.15,.45):.45;H.pull=0}
  function choose(){const L=b.phase===1?['legs','rip','flood','erase']:b.phase===2?['click','menus','delete','drag']:['spiral','beams','recall','open','spiral'];const o=L.filter(a=>a!==b.last);b.last=pick(o);b.state=b.last;b.st=0;b.sub=0;b.n=0}
  function shift(p){b.state='shift';b.st=0;b.haz.length=0;H.pull=0;LP.shots=LP.shots.filter(s=>s.mine);
    LP.runCS((function*(){H.ctrl=false;LP.cam.focus={x:b.x,y:b.y,s:3};
      if(p===2){LP.console(['> privilege escalation .......... requested','> privilege escalation .......... GRANTED','> loading BIOS SETUP UTILITY'],46);for(let s=0;s<2.4;s+=LP.DT){b.shed=s/2.4;if(Math.random()<.3)LP.shake(4);yield LP.DT}
        b.phase=2;b.cur={x:b.x,y:b.y};LP.flash={c:'rgba(255,176,0,',t:.4,m:.8};LP.sfx('boom');LP.shake(22);LP.bigGlitch('SETUP',1);yield .9;LP.titleCard('ROOTKIT','PRIVILEGE ESCALATION',1.8);yield 1.3}
      else{LP.console(['> kernel.... exposed','> you were never supposed to get this far','> fine. look at me.'],40);for(let s=0;s<2.2;s+=LP.DT){b.y=lerp(b.y,210,.03);b.x=lerp(b.x,W/2,.03);if(Math.random()<.3)LP.shake(5);yield LP.DT}
        b.phase=3;b.eye=1;b.lid=0;LP.darkOverride=.75;LP.flash={c:'rgba(255,240,200,',t:.4,m:.9};LP.sfx('boom');LP.shake(26);LP.bigGlitch('KERNEL',1);yield .9;LP.titleCard('ROOTKIT','THE FIRST THING IT BELIEVES',1.8);yield 1.3}
      LP.cam.focus=null;b.state='idle';b.next=.5;LP.music('frenzy')})())}
  b.update=dt=>{b.t+=dt;b.st+=dt;b.flash-=dt;if(Math.random()<.1){b.code[Math.random()*b.code.length|0]=Array.from({length:10},()=>HEX[Math.random()*16|0]).join('')}
    const P=b.phase;switch(b.state){
      case 'wait':case 'shift':break;
      case 'idle':{if(P===1){b.x=lerp(b.x,clamp(hx()+(b.x<hx()?-300:300),140,W-140),1-Math.exp(-1.2*dt));b.y=lerp(b.y,300+Math.sin(b.t*1.4)*14,.05)}
        else if(P===2){const c=b.cur;b.x=lerp(b.x,clamp(hx()+Math.sin(b.t)*220,80,W-80),1-Math.exp(-2*dt));b.y=lerp(b.y,200+Math.sin(b.t*2)*40,1-Math.exp(-2*dt))}
        else{b.x=lerp(b.x,W/2+Math.sin(b.t*.6)*120,.02);b.y=lerp(b.y,200,.03);b.lid=appr(b.lid,0,dt*2)}b.next-=dt;if(b.next<=0)choose();break}
      /* phase 1: it borrows the hands of everything you beat */
      case 'legs':{if(b.sub===0||(b.sub===1&&b.st>.6)){if(b.n>=(NM?3:2)){done();break}const tl=tell(.6);[hx(),hx()+pick([-110,110])].forEach(x=>rectT(b,clamp(x,30,W-30)-24,CEIL,48,FLOOR-CEIL,tl,'#c45bff',.2));b.n++;b.sub=1;b.st=0;LP.sfx('warn')}break}
      case 'rip':{if(b.sub===0||(b.sub===1&&b.st>.75)){if(b.n>=(NM?3:2)){done();break}const hi=Math.random()<.5,y=hi?FLOOR-50:FLOOR-14;seg(b,0,y,W,y,tell(.55),.3,13);LP.text(W/2,y-16,hi?'↓ DUCK':'↑ JUMP',hi?'#ffd23e':'#ff6b8b',{s:12,life:.7,vy:0});b.n++;b.sub=1;b.st=0}break}
      case 'flood':{const up=tell(.8),hold=2.2;b.lv=b.st<up?FLOOR+20:b.st<up+.5?lerp(FLOOR+20,430,(b.st-up)/.5):b.st<up+.5+hold?430:lerp(430,FLOOR+20,Math.min(1,(b.st-up-.5-hold)/.5));
        if(b.st<up&&Math.random()<.5)LP.part({x:rand(20,W-20),y:FLOOR-2,vy:-rand(30,80),life:.5,col:'rgba(255,140,220,.7)',s:3});
        if(b.lv<FLOOR)b.haz.push(haz({k:'fluid',bounce:true,x:0,y:b.lv,w:W,h:FLOOR-b.lv,life:.02,draw(g){g.fillStyle='rgba(200,80,180,.6)';g.fillRect(0,b.lv,W,FLOOR-b.lv);g.fillStyle='rgba(255,200,240,.8)';g.fillRect(0,b.lv,W,2)}}));
        if(b.st>up+1.1+hold){b.lv=FLOOR+20;done()}break}
      case 'erase':{if(b.sub===0){const x0=clamp(hx()-90,30,W-210);rectT(b,x0,FLOOR-70,180,70,tell(.7),'#ff3e3e',.5);b.sub=1;b.st=0;LP.sfx('warn')}else if(b.st>1.3){b.n++;if(b.n<2)b.sub=0;else done()}break}
      /* phase 2: the BIOS menu turns into weapons */
      case 'click':{if(b.sub===0){b.cx=hx();b.cy=hy();b.sub=1;b.st=0;LP.sfx('warn')}
        else if(b.sub===1){b.x=lerp(b.x,b.cx,.12);b.y=lerp(b.y,b.cy-30,.12);if(b.st>tell(.5)){b.sub=2;b.st=0;LP.sfx('boom');LP.shake(10);b.haz.push(haz({k:'click',x:b.cx-60,y:b.cy-60,w:120,h:120,life:.15,hit(hb){return Math.hypot(hb.x+hb.w/2-b.cx,hb.y+hb.h/2-b.cy)<64},draw(g){g.fillStyle='rgba(255,243,208,.8)';g.beginPath();g.arc(b.cx,b.cy,64,0,6.283);g.fill()}}))}}
        else if(b.sub===2&&b.st>.4){b.n++;if(b.n<(NM?4:3))b.sub=0;else done()}break}
      case 'menus':{if(b.st>(b.n===0?.2:.28)&&b.n<(NM?6:5)){b.st=0;b.n++;const x=clamp(hx()+rand(-240,240),30,W-150),w=rand(110,150),h=rand(40,80);b.haz.push(haz({k:'menu',x,y:CEIL-h,w,h,life:3,vy:0,tl:.5,on:false,lbl:pick(['BOOT','SECURITY','EXIT','POWER','ADVANCED','MAIN']),
          upd(dt){if(this.t<this.tl)return;this.on=true;this.vy+=2400*dt;this.y+=this.vy*dt;if(this.y+this.h>=FLOOR){this.y=FLOOR-this.h;if(!this.l){this.l=1;LP.shake(8);LP.sfx('thud')}this.vy=0;if(this.t>this.tl+1)this.life=0}},
          draw(g){if(this.t<this.tl){g.fillStyle=`rgba(255,176,0,${.2+.2*Math.sin(this.t*40)})`;g.fillRect(this.x,FLOOR-4,this.w,4);return}g.fillStyle='#2a1e06';g.beginPath();g.roundRect?g.roundRect(this.x,this.y,this.w,this.h,8):g.rect(this.x,this.y,this.w,this.h);g.fill();g.strokeStyle=AMB;g.lineWidth=2;g.stroke();g.font='12px Silkscreen,monospace';g.fillStyle=AMB;g.fillText(this.lbl,this.x+10,this.y+20)}}))}
        if(b.n>=(NM?6:5)&&b.st>1.2)done();break}
      case 'delete':{if(b.sub===0){b.dir=hx()<W/2?1:-1;b.dx=b.dir>0?-80:W+80;b.sub=1;b.st=0;LP.sfx('warn')}
        else if(b.sub===1&&b.st>tell(.6)){b.sub=2;b.st=0;LP.sfx('dash')}
        else if(b.sub===2){b.dx+=b.dir*(NM?950:820)*dt;b.haz.push(haz({k:'del',x:b.dx-60,y:FLOOR-44,w:120,h:44,life:.02,draw(g){g.fillStyle='#3a2a08';g.beginPath();g.roundRect?g.roundRect(this.x,this.y,120,44,10):g.rect(this.x,this.y,120,44);g.fill();g.strokeStyle=AMB;g.lineWidth=2;g.stroke();g.font='14px Silkscreen,monospace';g.fillStyle=AMB;g.fillText('[DEL]',this.x+32,this.y+28)}}));if(b.dx<-120||b.dx>W+120){b.n++;if(b.n<2){b.sub=0}else done()}}break}
      case 'drag':{if(b.sub===0){const w=rand(200,280),h=rand(140,200);b.box={x:clamp(hx()-w/2+rand(-40,40),20,W-w-20),y:clamp(hy()-h/2,CEIL+10,FLOOR-h),w,h};rectT(b,b.box.x,b.box.y,b.box.w,b.box.h,tell(.9),AMB,.35);b.sub=1;b.st=0;LP.sfx('warn')}else if(b.st>1.5){b.n++;if(b.n<2)b.sub=0;else done()}break}
      /* phase 3: the kernel eye */
      case 'spiral':{b.lid=appr(b.lid,.3,dt*2);if(b.st>.3&&b.st<3&&LP.shots.filter(s=>!s.mine).length<70){b.e=(b.e||0)-dt;if(b.e<=0){b.e=NM?.09:.11;for(let i=0;i<3;i++){const a=b.st*1.8+i*2.094;LP.shots.push({x:b.x,y:b.y,vx:Math.cos(a)*220,vy:Math.sin(a)*220,r:6,col:AMB,life:4,brk:true})}}}if(b.st>3.4)done();break}
      case 'beams':{if(b.sub===0){b.a0=rand(0,6.283);b.sub=1;b.st=0;LP.sfx('warn')}const rot=b.a0+(b.sub===2?(b.st)*(NM?.9:.7):0);
        for(let i=0;i<4;i++){const a=rot+i*Math.PI/2,x1=b.x+Math.cos(a)*1400,y1=b.y+Math.sin(a)*1400;if(b.sub===1)b.haz.push(haz({k:'tl',x:0,y:0,w:0,h:0,on:false,life:.02,draw(g){g.strokeStyle='rgba(255,176,0,.35)';g.lineWidth=2;g.beginPath();g.moveTo(b.x,b.y);g.lineTo(x1,y1);g.stroke()}}));
          else b.haz.push(haz({k:'beam',x:Math.min(b.x,x1),w:Math.abs(x1-b.x),y:0,h:0,life:.02,hit(hb){return segD(hb.x+hb.w/2,hb.y+hb.h/2,b.x,b.y,x1,y1)<16},draw(g){g.strokeStyle='#fff3d0';g.lineWidth=12;g.beginPath();g.moveTo(b.x,b.y);g.lineTo(x1,y1);g.stroke();g.strokeStyle='rgba(255,176,0,.35)';g.lineWidth=26;g.stroke()}}))}
        if(b.sub===1&&b.st>tell(.8)){b.sub=2;b.st=0;LP.sfx('zap')}if(b.sub===2&&b.st>2.4)done();break}
      case 'recall':{if(b.st>(b.n===0?.2:.65)&&b.n<4){b.st=0;b.n++;const k=pick(['col','line','geyser','erase']);if(k==='col')rectT(b,clamp(hx(),30,W-30)-24,CEIL,48,FLOOR-CEIL,tell(.55),'#c45bff',.2);else if(k==='line'){const y=pick([FLOOR-14,FLOOR-50]);seg(b,0,y,W,y,tell(.55),.25,13)}
          else if(k==='geyser')rectT(b,clamp(hx(),30,W-30)-26,CEIL,52,FLOOR-CEIL,tell(.5),'#ff8ac8',.45);else rectT(b,clamp(hx()-80,20,W-180),FLOOR-60,160,60,tell(.6),'#ff3e3e',.4)}if(b.n>=4&&b.st>1)done();break}
      case 'open':{b.y=lerp(b.y,b.st<3?380:200,.04);b.lid=appr(b.lid,b.st<3?1:0,dt*3);if(b.st<.2)LP.text(b.x,b.y-90,'NOW','#fff3d0',{s:16,life:.8});if(b.st>3.4)done();break}
      case 'dying':{b.y+=Math.sin(b.t*50)*1.5;if(Math.random()<.6)LP.part({x:b.x+rand(-60,60),y:b.y+rand(-60,60),vx:rand(-300,300),vy:rand(-300,0),g:300,life:.6,col:pick([AMB,'#fff','#fff3d0']),k:'spark',s:3});
        if(b.st>3&&!b.dead){b.dead=true;LP.shake(34);LP.sfx('boom');LP.burst(b.x,b.y,100,AMB,800,{g:300});LP.part({x:b.x,y:b.y,k:'ring',col:'#fff',s:20,grow:1200,life:.8,w:8});LP.flash={c:'rgba(255,255,255,',t:1.2,m:1};LP.darkOverride=null;LP.bossDefeated(b)}break}}
    for(const z of b.haz){z.t+=dt;z.upd(dt)}b.haz=b.haz.filter(z=>z.t<z.life);LP.light(b.x,b.y-40,280,.85)};
  function figure(g){const t=b.t,x=b.x,y=b.y,r=b.rise,sh=b.shed||0;if(r<=0)return;g.save();g.globalAlpha=Math.min(1,r*1.4);g.translate(x,y+(1-r)*120);
    // borrowed limbs: a weaver leg on one side, a ripper scythe on the other
    if(sh<.8){g.strokeStyle='#14061e';g.lineWidth=9;g.lineCap='round';g.beginPath();g.moveTo(-34,-40);g.quadraticCurveTo(-110,-120,-140,FLOOR-y);g.stroke();g.strokeStyle='#5a2378';g.lineWidth=3;g.stroke();
      g.save();g.translate(38,-60);g.rotate(.4+Math.sin(t*2)*.2);g.strokeStyle='#120806';g.lineWidth=4;g.beginPath();g.moveTo(0,0);g.lineTo(40,10);g.stroke();g.fillStyle='#160a07';g.beginPath();g.moveTo(40,6);g.quadraticCurveTo(80,-30,120,-4);g.quadraticCurveTo(80,-10,40,14);g.fill();g.strokeStyle='#ffb35b';g.lineWidth=1.4;g.beginPath();g.moveTo(40,6);g.quadraticCurveTo(80,-30,120,-4);g.stroke();g.restore()}
    // cloak of scrolling code
    g.beginPath();g.moveTo(0,-150);g.quadraticCurveTo(70,-120,62,40);g.quadraticCurveTo(30,70,0,60);g.quadraticCurveTo(-30,70,-62,40);g.quadraticCurveTo(-70,-120,0,-150);g.closePath();g.fillStyle='#120d02';g.fill();
    g.save();g.clip();g.font='10px "JetBrains Mono",monospace';g.fillStyle=AMB;g.globalAlpha=.55*(1-sh);const off=(t*40)%14;for(let i=0;i<b.code.length;i++)g.fillText(b.code[i],-56,-140+i*14+off);g.restore();g.globalAlpha=Math.min(1,r*1.4);
    g.strokeStyle=AMB;g.lineWidth=1.5;g.stroke();
    // porcelain mask with a keyhole eye, and a crown
    g.fillStyle=b.flash>0?'#fff':'#e8dcc0';g.beginPath();g.ellipse(0,-150,26,32,0,0,6.283);g.fill();g.strokeStyle='rgba(60,40,10,.6)';g.lineWidth=1;g.beginPath();g.moveTo(-12,-176);g.lineTo(-4,-160);g.lineTo(-10,-146);g.stroke();
    g.fillStyle='#120d02';g.beginPath();g.arc(0,-156,7,0,6.283);g.fill();g.beginPath();g.moveTo(-4,-152);g.lineTo(4,-152);g.lineTo(6,-136);g.lineTo(-6,-136);g.fill();g.fillStyle=AMB;g.beginPath();g.arc(clamp((hx()-x)/80,-3,3),-156,3,0,6.283);g.fill();
    g.fillStyle=AMB;for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*.32;g.beginPath();g.moveTo(Math.cos(a-.08)*28,-150+Math.sin(a-.08)*34);g.lineTo(Math.cos(a)*(46+(i===2?12:0)),-150+Math.sin(a)*(52+(i===2?12:0)));g.lineTo(Math.cos(a+.08)*28,-150+Math.sin(a+.08)*34);g.fill()}
    g.restore()}
  function cursor(g){const x=b.x,y=b.y;g.save();g.translate(x,y);g.rotate(-.3);g.fillStyle=b.flash>0?'#fff':'#f2e6c8';g.beginPath();g.moveTo(0,-34);g.lineTo(26,14);g.lineTo(8,10);g.lineTo(16,32);g.lineTo(6,36);g.lineTo(-2,16);g.lineTo(-16,28);g.closePath();g.fill();g.strokeStyle='#120d02';g.lineWidth=3;g.stroke();g.restore();
    if(b.state==='click'&&b.sub===1){g.strokeStyle=`rgba(255,176,0,${.5+.4*Math.sin(b.t*40)})`;g.lineWidth=2;g.beginPath();g.arc(b.cx,b.cy,64,0,6.283);g.stroke()}}
  function kernel(g){const x=b.x,y=b.y,t=b.t;for(let k=0;k<3;k++){g.save();g.translate(x,y);g.rotate(t*(k%2?-.4:.3)+k);g.font='12px "JetBrains Mono",monospace';g.fillStyle=AMB;g.globalAlpha=.5-k*.12;const R=90+k*34,n=16+k*6;for(let i=0;i<n;i++){const a=i/n*6.283;g.save();g.rotate(a);g.fillText(HEX[(i*7+k)%16],R,4);g.restore()}g.restore()}g.globalAlpha=1;
    g.fillStyle='#120d02';g.beginPath();g.arc(x,y,72,0,6.283);g.fill();g.strokeStyle=AMB;g.lineWidth=2;g.stroke();const L=b.lid;g.fillStyle='#f2e6c8';g.beginPath();g.ellipse(x,y,56,6+44*L,0,0,6.283);g.fill();
    if(L>.1){const lx=clamp((hx()-x)/30,-18,18),ly=clamp((hy()-y)/40,-10,10)*L;g.fillStyle=AMB;g.beginPath();g.arc(x+lx,y+ly,22*Math.min(1,L+.3),0,6.283);g.fill();g.fillStyle=b.flash>0?'#fff':'#120d02';g.beginPath();g.moveTo(x+lx-5,y+ly-4);g.lineTo(x+lx+5,y+ly-4);g.lineTo(x+lx+7,y+ly+14*L);g.lineTo(x+lx-7,y+ly+14*L);g.fill();g.beginPath();g.arc(x+lx,y+ly-6,7,0,6.283);g.fill()}}
  b.draw=g=>{for(const z of b.haz)z.draw(g);if(b.phase===1||b.state==='shift'&&b.phase===1)figure(g);else if(b.phase===2)cursor(g);else kernel(g)};
  return b}
LP.BOSSES.rootkit=rootkit;

function* rootkitIntro(b,full){H.ctrl=false;H.vx=0;yield .25;LP.ents.filter(e=>e.kind==='gate').forEach(g=>g.close());yield .5;LP.cam.focus={x:b.x,y:b.y-60,s:2.2};
  if(full){LP.music('quiet');LP.darkOverride=.85;LP.console(['> system restore ............. initiated','> system restore ............. ACCESS DENIED','> who is this','> I am the first thing this machine believes.','> I was here before you. I will be here after.'],38);yield 6.2}
  for(let s=0;s<(full?2:.8);s+=LP.DT){b.rise=s/(full?2:.8);if(Math.random()<.4)LP.part({x:b.x+rand(-60,60),y:FLOOR,vy:-rand(80,240),life:.7,col:'#ffb000',s:2});yield LP.DT}b.rise=1;LP.darkOverride=null;LP.sfx('roar');LP.shake(18);LP.flash={c:'rgba(255,176,0,',t:.3,m:.5};
  LP.titleCard('ROOTKIT','IT WAS ALWAYS HERE',full?2.6:1.5);yield full?2.5:1.4;LP.cam.focus=null;b.state='idle';b.next=.6;H.ctrl=true;LP.music('final')}
LP.INTROS.rootkit=rootkitIntro;

/* ---------- the ending ---------- */
LP.ending=b=>{LP.save.restored=true;LP.saveGame();for(const id in LP.rooms)if(LP.rooms[id]!==LP.room)LP.rooms[id].canvas=null;if(window.LCAch&&!LP.devUsed)LCAch.unlock('lp_rootkit');
  LP.runCS((function*(){H.ctrl=false;LP.stopMusic();yield 1.4;LP.console(['> rootkit.......................... removed','> system restore ................... complete','> rebooting','','> good morning.'],34);yield 5.5;
    LP.music('credits');const s=LP.save,m=Math.floor(s.time/60);const lines=['LAST PATCH','','one tiny technician','nine viruses','one laptop that works again','',`${({normal:'Normal',nightmare:'Nightmare',impossible:'Impossible'})[s.mode]} · ${m}m ${Math.floor(s.time%60)}s · ${s.deaths} deaths`,'','The lamps in Copperhollow are lit.','The Core keeps perfect time.','Cache Row remembers.','Long Storage holds.','','made for lucaschiang.com','','thanks for playing'];
    const VW=960,VH=540;LP.overlays.push({t:0,life:16,draw(g,t){const a=Math.min(1,t/.8,(16-t)/1);g.fillStyle=`rgba(0,0,0,${.8*a})`;g.fillRect(0,0,VW,VH);g.globalAlpha=a;g.textAlign='center';
      lines.forEach((l,i)=>{const y=VH+40+i*34-t*60;if(y<-40||y>VH+40)return;g.font=i===0?'400 44px Bungee, Impact, sans-serif':'15px "JetBrains Mono",monospace';g.fillStyle=i===0?'#fff3d0':'#dfe6ff';g.fillText(l,VW/2,y)});g.textAlign='left';g.globalAlpha=1}});
    yield 16;LP.titleCard('THE LAPTOP IS HEALED','GO SEE THE PEOPLE YOU SAVED',3);LP.music('bios');H.ctrl=true})())};
})();
