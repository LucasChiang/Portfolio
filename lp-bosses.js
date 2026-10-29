/* LAST PATCH — bosses and their cutscenes. */
(function(){
'use strict';
const LP=window.LP,T=LP.T,VW=LP.VW,VH=LP.VH,{clamp,rand,pick,lerp,appr,sign}=LP,H=LP.H;
const FLOOR=480;
const hx=()=>H.x+H.w/2,hy=()=>H.y+H.h/2;

/* ---------- shared ---------- */
function haz(o){return Object.assign({t:0,life:1,on:true,upd(){},draw(){}},o)}
function ik(hx0,hy0,fx,fy,L1,L2){let dx=fx-hx0,dy=fy-hy0,d=Math.hypot(dx,dy);d=Math.min(d,L1+L2-1);const a=Math.atan2(dy,dx),c=Math.acos(clamp((L1*L1+d*d-L2*L2)/(2*L1*d),-1,1));
  const k1={x:hx0+Math.cos(a-c)*L1,y:hy0+Math.sin(a-c)*L1},k2={x:hx0+Math.cos(a+c)*L1,y:hy0+Math.sin(a+c)*L1};return k1.y<k2.y?k1:k2}

/* =====================================================================
   ROT WEAVER — Motherboard. A wire-legged mass that eats copper.
   ===================================================================== */
function weaver(){const NM=LP.NM,max=NM?84:66,CEIL=60;
  const b={id:'weaver',name:'ROT WEAVER',hp:max,max,x:690,y:112,vy:0,face:-1,state:'ceiling',st:0,sub:0,eye:0,mouth:0,laughT:0,phase:1,flash:0,haz:[],t:0,next:1.2,last:'',dripT:2,dead:false,shadowX:0,cnt:0,targets:[]};
  const homes=[-175,-125,-78,-32,32,78,125,175];
  b.legs=homes.map(h=>({h,fx:690+h*.8,fy:CEIL,sx:0,sy:0,tx:0,ty:0,st:-1,lift:null}));
  const tell=n=>NM?n*rand(.55,1.05):n;
  b.hitboxes=()=>b.form2?(['emerge','dying'].includes(b.q.st)?[]:[{x:b.q.hx-24,y:b.q.hy-24,w:48,h:48}]):b.hide||b.hatchK>0||b.state==='dying'||b.state==='ceiling'||b.state==='drop'?[]:[{x:b.x-46,y:b.y-46,w:92,h:92}];
  b.contact=()=>[];  // touching the body is safe; only attacks hurt
  b.hurt=(d,dir)=>{if(!b.hitboxes().length)return false;if(b.form2){b.hp-=d;b.flash=.1;LP.sfx('hit');LP.burst(b.q.hx,b.q.hy,10,'#e4e2c6',300);if(b.hp<=0){b.hp=0;b.q.st='dying';b.q.t=0;b.q.fly=false;b.haz.length=0;LP.stopMusic();LP.stop(.25)}return true}b.hp-=d;b.flash=.1;b.x+=dir*5;LP.sfx('hit');LP.burst(b.x-dir*30,b.y,10,'#7dff9a',300);
    if(b.hp<=0){b.hp=0;b.state='dying';b.st=0;b.haz.length=0;LP.stopMusic();LP.stop(.25)}else if(b.phase===1&&b.hp<=max/2&&b.state!=='leap'){b.phase=2;b.state='enrage';b.st=0}return true};
  function choose(){const opts=['slam','wires','leap','spray'].filter(a=>a!==b.last);const a=pick(opts);b.last=a;b.state=a;b.st=0;b.sub=0;b.cnt=0}
  function walk(dt,tx,sp){b.x=appr(b.x,clamp(tx,150,810),sp*dt);b.y=lerp(b.y,350+Math.sin(b.t*2.2)*8,1-Math.exp(-6*dt))}
  function wire(dir){const sp=NM?rand(250,470):340;b.haz.push(haz({k:'wire',x:b.x,y:FLOOR-16,w:46,h:16,life:4,dir,sp,upd(dt){this.x+=this.dir*this.sp*dt;if(this.x<20||this.x>940)this.life=0;if(Math.random()<.5)LP.part({x:this.x+23,y:FLOOR-4,vx:rand(-40,40),vy:-rand(20,90),life:.3,col:'#c45bff',s:2})},
    draw(g){g.strokeStyle='#c45bff';g.lineWidth=4;g.shadowColor='#c45bff';g.shadowBlur=12;g.beginPath();for(let i=0;i<=46;i+=3){const yy=FLOOR-8+Math.sin(i*.4+this.t*30)*6;i?g.lineTo(this.x+i,yy):g.moveTo(this.x,yy)}g.stroke();g.shadowBlur=0;g.fillStyle='#f0d0ff';g.beginPath();g.arc(this.x+(this.dir>0?46:0),FLOOR-8,5,0,6.283);g.fill();LP.light(this.x+23,FLOOR-10,80,.6)}}))}
  function shock(x,dir){b.haz.push(haz({k:'shock',x:x-20,y:FLOOR-24,w:40,h:24,life:3,dir,upd(dt){this.x+=this.dir*430*dt;if(this.x<10||this.x>950)this.life=0},
    draw(g){const gr=g.createLinearGradient(0,FLOOR-30,0,FLOOR);gr.addColorStop(0,'rgba(125,255,154,0)');gr.addColorStop(1,'rgba(125,255,154,.9)');g.fillStyle=gr;g.beginPath();g.moveTo(this.x,FLOOR);g.quadraticCurveTo(this.x+20,FLOOR-48,this.x+40,FLOOR);g.fill()}}))}
  function glob(vx,vy){b.haz.push(haz({k:'glob',x:b.x-8,y:b.y+20,w:16,h:16,vx,vy,life:4,upd(dt){this.vy+=1300*dt;this.x+=this.vx*dt;this.y+=this.vy*dt;if(this.y+16>=FLOOR){this.life=0;LP.burst(this.x+8,FLOOR,8,'#7dff9a',160);puddle(this.x+8)}},
    draw(g){g.fillStyle='#7dff9a';g.shadowColor='#7dff9a';g.shadowBlur=12;g.beginPath();g.arc(this.x+8,this.y+8,8,0,6.283);g.fill();g.shadowBlur=0}}))}
  function puddle(x){b.haz.push(haz({k:'puddle',x:x-26,y:FLOOR-8,w:52,h:8,life:NM?3:2.2,draw(g){const a=Math.min(1,(this.life-this.t)/.4);g.globalAlpha=a;g.fillStyle='#3fbf6a';g.beginPath();g.ellipse(this.x+26,FLOOR-2,26,5,0,0,6.283);g.fill();g.fillStyle='#b9ffcc';g.fillRect(this.x+10+Math.sin(this.t*9)*6,FLOOR-6,3,3);g.globalAlpha=1}}))}
  function drip(x){b.haz.push(haz({k:'drip',x:x-7,y:CEIL,w:14,h:14,life:3,form:.55,vy:0,on:false,upd(dt){if(this.t<this.form){return}this.on=true;this.vy+=1800*dt;this.y+=this.vy*dt;if(this.y+14>=FLOOR){this.life=0;LP.burst(this.x+7,FLOOR,10,'#c45bff',200)}},
    draw(g){if(this.t<this.form){const k=this.t/this.form;g.fillStyle='rgba(196,91,255,.35)';g.fillRect(this.x+6,CEIL,2,FLOOR-CEIL);g.fillStyle='#c45bff';g.beginPath();g.ellipse(this.x+7,CEIL+4,4+k*4,3+k*7,0,0,6.283);g.fill()}else{g.fillStyle='#e0b0ff';g.beginPath();g.ellipse(this.x+7,this.y+7,6,9,0,0,6.283);g.fill()}}}))}
  b.update=dt=>{if(b.form2){p2update(dt);return}b.t+=dt;b.st+=dt;b.flash-=dt;b.laughT-=dt;const P2=b.phase===2,spd=P2?1.25:1;
    b.eye=appr(b.eye,b.state==='ceiling'&&!b.woke?0:1,dt*4);
    let mouthT=b.laughT>0?.5+.5*Math.sin(b.t*33):0;
    switch(b.state){
      case 'ceiling':b.y=112+Math.sin(b.t*1.3)*3;mouthT=b.woke?0:.3+.3*Math.sin(b.t*14);if(!b.woke&&Math.random()<.25){LP.part({x:b.x+rand(-20,20),y:CEIL+10,vx:rand(-80,80),vy:rand(30,120),g:600,life:.5,col:pick(['#d9a441','#ffd27a']),s:2.5});if(Math.random()<.2)LP.sfx('chew')}break;
      case 'drop':b.vy+=2600*dt;b.y+=b.vy*dt;if(b.y>=350){b.y=350;b.vy=0;b.state='pose';b.landed=true;LP.shake(22);LP.sfx('thud');LP.burst(b.x,FLOOR,30,'#9aa6c2',400,{g:900})}break;
      case 'pose':b.y=lerp(b.y,350+Math.sin(b.t*2)*6,.1);break;
      case 'idle':walk(dt,hx()+(b.x<hx()?-170:170),120*spd);b.next-=dt;if(b.next<=0)choose();break;
      case 'enrage':b.y=lerp(b.y,320,.1);if(b.st>.2&&!b.roared){b.roared=true;b.haz.length=0;LP.shots=LP.shots.filter(s=>s.mine);LP.runCS((function*(){H.ctrl=false;LP.sfx('roar');LP.cam.focus={x:b.x,y:b.y,s:5};yield .35;LP.mwahaha(b,.9,false,{x:b.x,y:b.y});yield 2.5;LP.cam.focus={x:b.x,y:b.y,s:3};
          for(let s=0;s<1.2;s+=LP.DT){b.hatchK=s/1.2;if(Math.random()<.4){LP.shake(5);LP.sfx('chew')}yield LP.DT}b.hatch();yield .45;LP.cam.focus=null;LP.titleCard('ROT WEAVER','HATCHED',1.8);
          for(let s=0;s<1.3;s+=LP.DT){b.q.u-=520*LP.DT;yield LP.DT}b.q.st='idle';b.q.wait=.4;LP.music('frenzy')})())}if(b.roared&&!LP.cs&&b.st>1){b.roared=false;b.state='idle';b.next=.4}break;
      case 'slam':{if(b.sub===0){walk(dt,hx(),300*spd);if(b.st>.6){b.sub=1;b.st=0;b.dur=tell(.62)/spd;const s=pick([-1,1]);b.targets=[hx(),hx()+s*95];b.feint=NM&&Math.random()<.25;LP.sfx('warn')}}
        else if(b.sub===1){if(b.st>b.dur){if(b.feint){b.state='leap';b.st=0;b.sub=0;break}b.sub=2;b.st=0;LP.shake(16);LP.sfx('thud');b.targets.forEach(x=>{b.haz.push(haz({k:'col',x:x-22,y:b.y,w:44,h:FLOOR-b.y,life:.18}));LP.burst(x,FLOOR,14,'#c45bff',320,{g:800})})}}
        else if(b.sub===2&&b.st>.45/spd){b.cnt++;if(P2&&b.cnt<2){b.sub=1;b.st=0;b.dur=tell(.42)/spd;b.targets=[hx(),hx()+pick([-1,1])*95];b.feint=false;LP.sfx('warn')}else{b.state='idle';b.next=NM?rand(.25,.7):P2?.45:.7}}break}
      case 'wires':{b.y=lerp(b.y,350,.1);mouthT=Math.min(1,b.st/.35);if(b.sub===0&&b.st>tell(.4)/spd){b.sub=1;b.st=0;wire(-1);wire(1);LP.sfx('zap')}
        else if(b.sub===1&&b.st>(NM?rand(.4,.9):.7)){if(P2&&b.cnt===0){b.cnt=1;b.st=0;wire(-1);wire(1);LP.sfx('zap')}else{b.state='idle';b.next=NM?rand(.25,.7):P2?.45:.7}}break}
      case 'leap':{if(b.sub===0){b.y=lerp(b.y,365,.15);if(b.st>tell(.45)/spd){b.sub=1;b.vy=-1500;LP.sfx('whoosh')}}
        else if(b.sub===1){b.vy+=900*dt;b.y+=b.vy*dt;if(b.y<-230){b.sub=2;b.st=0;b.state='leap';b.hide=true;b.shadowX=b.x;b.hdur=NM?rand(.5,1.2):.9}}
        else if(b.sub===2){b.shadowX=appr(b.shadowX,hx(),520*dt);if(b.st>b.hdur){b.sub=3;b.x=b.shadowX;b.y=-200;b.vy=1900}}
        else if(b.sub===3){b.y+=b.vy*dt;if(b.y>=350){b.y=350;b.hide=false;b.sub=4;b.st=0;LP.shake(26);LP.sfx('boom');shock(b.x,-1);shock(b.x,1);LP.burst(b.x,FLOOR,40,'#7dff9a',500,{g:900});LP.part({x:b.x,y:FLOOR,k:'ring',col:'#7dff9a',s:10,grow:500,life:.4})}}
        else if(b.sub===4&&b.st>.6/spd){if(NM&&Math.random()<.4){b.state='spray';b.st=0;b.sub=0}else{b.state='idle';b.next=NM?rand(.25,.7):P2?.45:.7}}
        for(const l of b.legs)if(b.hide){l.fx=b.x+l.h*.6;l.fy=b.y+60}break}
      case 'spray':{b.y=lerp(b.y,300,.1);mouthT=Math.min(1,b.st/.3);if(b.sub===0&&b.st>tell(.42)/spd){b.sub=1;const n=NM?5+(Math.random()*5|0):P2?7:5;const dx=hx()-b.x;
          for(let i=0;i<n;i++){const ft=rand(.7,1.05),tx=dx+(i-(n-1)/2)*(NM?rand(40,90):60),y0=b.y+20;glob(tx/ft,(FLOOR-16-y0-.5*1300*ft*ft)/ft)}LP.sfx('shoot')}
        else if(b.sub===1&&b.st>.9){b.state='idle';b.next=NM?rand(.25,.7):P2?.45:.7}break}
      case 'dying':{b.y+=Math.sin(b.t*60)*1.5;if(Math.random()<.4){const a=rand(0,6.283);LP.part({x:b.x+Math.cos(a)*30,y:b.y+Math.sin(a)*30,vx:Math.cos(a)*300,vy:Math.sin(a)*300,life:.4,col:pick(['#7dff9a','#fff','#c45bff']),s:3,k:'spark'})}
        if(b.st>2.4&&!b.dead){b.dead=true;LP.shake(30);LP.sfx('boom');LP.burst(b.x,b.y,80,'#7dff9a',700,{g:400});LP.burst(b.x,b.y,40,'#c45bff',500);LP.part({x:b.x,y:b.y,k:'ring',col:'#fff',s:20,grow:900,life:.6,w:6});LP.flash={c:'rgba(255,255,255,',t:.5,m:.8};LP.bossDefeated(b)}break}}
    b.mouth=appr(b.mouth,mouthT,dt*8);
    // drips
    if((P2||NM)&&['idle','slam','wires','spray','leap'].includes(b.state)){b.dripT-=dt*(P2?1:.5);if(b.dripT<=0){b.dripT=NM?rand(.5,1):1;drip(Math.random()<.4?hx():rand(60,900))}}
    // legs
    if(!b.hide){let stepping=b.legs.filter(l=>l.st>=0).length;const ceil=b.state==='ceiling'||(b.state==='drop'&&b.y<200);
      b.legs.forEach((l,i)=>{let tx=b.x+l.h*(ceil?.8:1),ty=ceil?CEIL:FLOOR;
        if(b.state==='slam'&&b.sub>=1&&(i===3||i===4)){const tgt=b.targets[i-3]||b.x;if(b.sub===1){l.fx=lerp(l.fx,tgt,.2);l.fy=lerp(l.fy,b.y-130,.2);return}else{l.fx=tgt;l.fy=FLOOR;return}}
        if(b.state==='dying'){l.fx+=Math.sin(b.t*30+i)*3;return}
        if(b.state==='drop'){l.fx=lerp(l.fx,tx,.08);l.fy=lerp(l.fy,b.y+120,.1);return}
        if(l.st>=0){l.st+=dt/.13;const k=Math.min(1,l.st);l.fx=lerp(l.sx,l.tx,k);l.fy=lerp(l.sy,l.ty,k)-Math.sin(k*Math.PI)*(ceil?-20:34);if(l.st>=1){l.st=-1;if(!ceil&&Math.random()<.5)LP.part({x:l.fx,y:FLOOR,vx:rand(-60,60),vy:-40,life:.3,col:'rgba(200,210,230,.6)',s:3})}}
        else if(Math.hypot(l.fx-tx,l.fy-ty)>(ceil?40:62)&&stepping<3){l.st=0;l.sx=l.fx;l.sy=l.fy;l.tx=tx+(tx-l.fx)*.25;l.ty=ty;stepping++}})}
    // hazards
    for(const z of b.haz){z.t+=dt;z.upd(dt)}b.haz=b.haz.filter(z=>z.t<z.life);
    if(!b.hide&&Math.random()<.18)LP.part({x:b.x+rand(-50,50),y:b.y+rand(-30,40),vx:rand(-20,20),vy:rand(-50,-10),life:1.4,col:'rgba(160,190,100,.45)',s:rand(2,4),drag:.5});
    LP.light(b.x,b.y,170,.45)};
  b.draw=g=>{if(b.form2){p2draw(g);return}const t=b.t;
    // warnings
    if(b.state==='slam'&&b.sub===1)for(const x of b.targets){const a=.25+.25*Math.sin(t*40);g.fillStyle=`rgba(255,62,107,${a})`;g.fillRect(x-22,b.y,44,FLOOR-b.y);g.fillStyle='#ff3e6b';g.fillRect(x-22,FLOOR-3,44,3)}
    if(b.hide&&b.sub===2){g.fillStyle='rgba(0,0,0,.45)';g.beginPath();g.ellipse(b.shadowX,FLOOR-2,70,10,0,0,6.283);g.fill();g.strokeStyle=`rgba(255,62,107,${.5+.5*Math.sin(t*30)})`;g.lineWidth=2;g.beginPath();g.ellipse(b.shadowX,FLOOR-2,80,12,0,0,6.283);g.stroke()}
    for(const z of b.haz)z.draw(g);
    if(b.hide)return;
    const hk=b.hatchK||0,sh=b.state==='dying'||hk>0?Math.random()*(6+hk*10)-(3+hk*5):0,bx=b.x+sh,by=b.y,br=1+Math.sin(t*2.6)*.035+hk*.22,sd0=b.state==='ceiling'?-1:1;
    // it looms out of its own darkness
    {const dg=g.createRadialGradient(bx,by,30,bx,by,280);dg.addColorStop(0,'rgba(0,0,0,.6)');dg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=dg;g.fillRect(bx-280,by-280,560,560)}
    // legs: tapered, curved, knotted joints, hooked claws
    const seg=(x0,y0,x1,y1,w0,w1,bend)=>{const mx=(x0+x1)/2+(y1-y0)*bend,my=(y0+y1)/2-(x1-x0)*bend,P=u=>[(1-u)*(1-u)*x0+2*(1-u)*u*mx+u*u*x1,(1-u)*(1-u)*y0+2*(1-u)*u*my+u*u*y1];
      [['#070605',1],['#262b1d',.6],['rgba(150,175,105,.3)',.16]].forEach(([c,mul])=>{g.strokeStyle=c;g.lineCap='round';for(let s=0;s<4;s++){const a=P(s/4),e=P((s+1)/4);g.lineWidth=(w0+(w1-w0)*(s+.5)/4)*mul;g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(e[0],e[1]);g.stroke()}});return P};
    b.legs.forEach((l,i)=>{const hipx=bx+l.h*.24,hipy=by+4,k=ik(hipx,hipy,l.fx,l.fy,125,165),sd=l.h<0?-1:1;
      const P=seg(hipx,hipy,k.x,k.y,15,9,.12*sd);seg(k.x,k.y,l.fx,l.fy,9,2.5,-.07*sd);
      g.fillStyle='#070605';for(let s=1;s<4;s++){const q=P(s/4);g.beginPath();g.moveTo(q[0]-3,q[1]);g.lineTo(q[0]+sd*2,q[1]-10*sd0);g.lineTo(q[0]+3,q[1]);g.fill()}
      const jg=g.createRadialGradient(k.x-2,k.y-3,1,k.x,k.y,9);jg.addColorStop(0,'#6b7a4c');jg.addColorStop(1,'#0e0f0a');g.fillStyle=jg;g.beginPath();g.arc(k.x,k.y,8,0,6.283);g.fill();
      g.strokeStyle='#070605';g.lineWidth=3;g.beginPath();g.moveTo(l.fx,l.fy-7*sd0);g.quadraticCurveTo(l.fx+sd*12,l.fy-2*sd0,l.fx+sd*5,l.fy+3*sd0);g.stroke()});
    g.save();g.translate(bx,by);if(b.state==='ceiling')g.scale(1,-1);g.scale(br,1/br);
    // egg sac hanging under it
    {const yy=46+Math.sin(t*2.6)*3,sg=g.createRadialGradient(-6,yy-6,3,0,yy,34);sg.addColorStop(0,'rgba(200,210,120,.4)');sg.addColorStop(1,'rgba(40,45,20,.1)');g.fillStyle=sg;g.beginPath();g.ellipse(0,yy,30,24,0,0,6.283);g.fill();
      g.fillStyle='rgba(40,40,10,.6)';for(let i=0;i<5;i++){g.beginPath();g.arc(-14+i*7,yy-4+Math.sin(i*3+t)*6,3,0,6.283);g.fill()}}
    // lumpy body
    const R=a=>60+6*Math.sin(3*a+t*2)+4*Math.sin(5*a-t*1.7)+3*Math.sin(9*a+t*3)+(b.flash>0?5:0);
    g.beginPath();for(let i=0;i<=56;i++){const a=i/56*6.283,r=R(a);i?g.lineTo(Math.cos(a)*r,Math.sin(a)*r):g.moveTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();
    const bg=g.createRadialGradient(-16,-24,6,0,0,66);bg.addColorStop(0,b.flash>0?'#ffffff':'#4f5c39');bg.addColorStop(.5,'#22281a');bg.addColorStop(1,'#080906');g.fillStyle=bg;g.fill();
    g.save();g.clip();const rl=g.createLinearGradient(0,6,0,66);rl.addColorStop(0,'rgba(150,255,120,0)');rl.addColorStop(1,'rgba(150,255,120,.2)');g.fillStyle=rl;g.fillRect(-70,0,140,70);
    g.strokeStyle='rgba(110,14,20,.7)';g.lineWidth=1.8;for(let i=0;i<8;i++){const a=i*.8+.2;g.beginPath();g.moveTo(Math.cos(a)*64,Math.sin(a)*64);g.quadraticCurveTo(Math.cos(a+.4)*44,Math.sin(a+.4)*44,Math.cos(a+.12)*26,Math.sin(a+.12)*26);g.stroke();g.lineWidth=1;g.beginPath();g.moveTo(Math.cos(a+.2)*50,Math.sin(a+.2)*50);g.lineTo(Math.cos(a+.45)*56,Math.sin(a+.45)*56);g.stroke();g.lineWidth=1.8}
    g.restore();
    // pustules that swell and settle
    for(let i=0;i<8;i++){const a=i*.8+1.2,r=48+Math.sin(i*7)*7,px=Math.cos(a)*r,py=Math.sin(a)*r,s=5+Math.sin(t*3+i*1.7)*1.8+(i%3)*2.2,pg=g.createRadialGradient(px-s*.35,py-s*.35,.5,px,py,s);pg.addColorStop(0,'#ede39a');pg.addColorStop(.45,'#8f8a2c');pg.addColorStop(1,'#1e1d08');g.fillStyle=pg;g.beginPath();g.arc(px,py,s,0,6.283);g.fill()}
    // cluster of small eyes
    const ex=clamp((hx()-bx)/30,-8,8),ey0=clamp((hy()-by)/40,-5,5)*sd0,eo=b.eye;
    [[-36,-32,6],[32,-36,5],[-20,-48,4],[44,-16,4.5],[-48,-10,4],[14,-50,3.5]].forEach(([x,y,r],i)=>{const o=Math.min(eo,Math.sin(t*1.3+i*2.1)>.95?0:1);g.fillStyle='#160202';g.beginPath();g.arc(x,y,r+1.8,0,6.283);g.fill();if(o<.1)return;
      const eg=g.createRadialGradient(x-r*.3,y-r*.3,0,x,y,r);eg.addColorStop(0,'#ff6448');eg.addColorStop(1,'#4a0404');g.fillStyle=eg;g.beginPath();g.ellipse(x+ex*.2,y+ey0*.2,r,r*o,0,0,6.283);g.fill();g.fillStyle='rgba(255,230,220,.75)';g.fillRect(x-r*.45,y-r*.5,1.6,1.6)});
    // the great eye: yellowed, bloodshot, slit
    const MY=-14,dil=b.laughT>0?1.3:1;g.fillStyle='#0c0202';g.beginPath();g.ellipse(0,MY,28,Math.max(2,20*eo),0,0,6.283);g.fill();
    if(eo>.15){g.save();g.beginPath();g.ellipse(0,MY,25,18*eo,0,0,6.283);g.clip();const sc=g.createRadialGradient(0,MY,3,0,MY,27);sc.addColorStop(0,'#eee3bd');sc.addColorStop(.65,'#c2ae7c');sc.addColorStop(1,'#6a2a1e');g.fillStyle=sc;g.fillRect(-28,MY-22,56,44);
      g.strokeStyle='rgba(165,15,15,.75)';g.lineWidth=1;for(let i=0;i<12;i++){const a=i*.53;g.beginPath();g.moveTo(Math.cos(a)*26,MY+Math.sin(a)*19);g.quadraticCurveTo(Math.cos(a+.3)*17,MY+Math.sin(a+.3)*13,Math.cos(a-.1)*12,MY+Math.sin(a-.1)*9);g.stroke()}
      const ix=ex,iy=MY+ey0*eo,ig=g.createRadialGradient(ix,iy,1,ix,iy,12*dil);ig.addColorStop(0,'#ff4a1e');ig.addColorStop(.55,'#8a0d10');ig.addColorStop(1,'#220303');g.fillStyle=ig;g.beginPath();g.arc(ix,iy,12*dil,0,6.283);g.fill();
      g.fillStyle='#030000';g.beginPath();g.ellipse(ix,iy,2.2*dil,10.5*eo,0,0,6.283);g.fill();g.fillStyle='rgba(255,240,220,.85)';g.beginPath();g.arc(ix-4,iy-5,2,0,6.283);g.fill();g.restore()}
    g.strokeStyle='#080906';g.lineWidth=5;g.beginPath();g.ellipse(0,MY,28,Math.max(2,20*eo),0,0,6.283);g.stroke();
    // the maw: ragged, needle teeth, strings of drool
    const m=b.mouth,MW=36,top=16,bot=24+m*54;g.fillStyle='#070101';g.beginPath();g.moveTo(-MW,top);g.bezierCurveTo(-MW*.6,bot+8,MW*.6,bot+8,MW,top);g.bezierCurveTo(MW*.5,top-5,-MW*.5,top-5,-MW,top);g.fill();
    if(m>.05){const cy=(top+bot)/2,ig=g.createRadialGradient(0,cy+6,2,0,cy,MW);ig.addColorStop(0,`rgba(160,12,16,${.85*m})`);ig.addColorStop(1,'rgba(20,0,0,0)');g.fillStyle=ig;g.beginPath();g.ellipse(0,cy,MW*.82,(bot-top)/2,0,0,6.283);g.fill();
      g.fillStyle=`rgba(190,255,120,${.22*m})`;g.beginPath();g.ellipse(0,cy+8,9*m,6*m,0,0,6.283);g.fill();
      g.fillStyle='#4a0a0c';g.beginPath();g.ellipse(Math.sin(t*9)*6,bot-8*m,12*m,6*m,0,0,6.283);g.fill()}
    const TL=[6,10,7,13,8,11,5,9,7,14,8,10,6];g.fillStyle='#d4c9a8';TL.forEach((L2,i)=>{const x=-MW+5+i*(MW*2-10)/(TL.length-1),yt=top-1+Math.abs(x)/MW*3;g.beginPath();g.moveTo(x-2,yt);g.lineTo(x+Math.sin(i*2)*2,yt+L2+m*5);g.lineTo(x+2,yt);g.fill();
      const yb=bot+2-Math.abs(x)/MW*(bot-top)*.8;g.beginPath();g.moveTo(x-2,yb);g.lineTo(x+Math.cos(i*2)*2,yb-L2*.8-m*4);g.lineTo(x+2,yb);g.fill()});
    if(m>.15){g.strokeStyle='rgba(175,205,95,.5)';g.lineWidth=1.2;for(let i=0;i<4;i++){const x=-18+i*12,L3=(bot-top)*(.55+.35*Math.sin(t*2.3+i));g.beginPath();g.moveTo(x,top+3);g.quadraticCurveTo(x+4,top+L3*.5,x,top+L3);g.stroke();g.fillStyle='rgba(175,205,95,.75)';g.beginPath();g.arc(x,top+L3,1.8,0,6.283);g.fill()}}
    if(hk>0){g.strokeStyle=`rgba(230,255,200,${hk})`;g.lineWidth=2+hk*3;for(let i=0;i<6;i++){const a=i*1.05+.3;g.beginPath();g.moveTo(Math.cos(a)*20,Math.sin(a)*20);g.lineTo(Math.cos(a+.15)*45,Math.sin(a+.15)*45);g.lineTo(Math.cos(a-.1)*(60*hk+10),Math.sin(a-.1)*(60*hk+10));g.stroke()}}
    if(b.state==='dying'){for(let i=0;i<7;i++){const a=i*.9+t;g.strokeStyle=`rgba(230,255,200,${.4+.4*Math.sin(t*20+i)})`;g.lineWidth=3;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a)*(60+b.st*90),Math.sin(a)*(60+b.st*90));g.stroke()}}
    g.restore()};
  /* ---------- phase 2: the egg sac splits and something fast climbs out ---------- */
  const PL=[[30,480,930,480],[930,480,930,60],[930,60,30,60],[30,60,30,480]],PER=2640;
  function perim(u){u=((u%PER)+PER)%PER;let acc=0;for(const [x0,y0,x1,y1] of PL){const L=Math.hypot(x1-x0,y1-y0);if(u<=acc+L){const k=(u-acc)/L;return{x:x0+(x1-x0)*k,y:y0+(y1-y0)*k,nx:x0===x1?(x0<480?1:-1):0,ny:y0===y1?(y0>300?-1:1):0}}acc+=L}return{x:30,y:480,nx:0,ny:-1}}
  function nearestU(x,y){let best=0,bd=1e9;for(let u=0;u<PER;u+=15){const p=perim(u),d=Math.hypot(p.x-x,p.y-y);if(d<bd){bd=d;best=u}}return best}
  const Q=b.q={u:0,hx:0,hy:0,trail:[],st:'emerge',t:0,sub:0,fly:false,wait:0,last:''};
  function head(){const p=perim(Q.u);return{x:p.x+p.nx*16,y:p.y+p.ny*16,nx:p.nx,ny:p.ny}}
  function crawlTo(dt,tu,sp){let d=((tu-Q.u)%PER+PER)%PER;if(d>PER/2)d-=PER;Q.u+=Math.min(Math.abs(d),sp*dt)*Math.sign(d);return Math.abs(d)<6}
  function p2choose(){const o=['pounce','web','brood','sweep','pounce','sweep'].filter(a=>a!==Q.last);const a=pick(o);Q.last=a;Q.st=a;Q.t=0;Q.sub=0;Q.n=0}
  function p2done(){Q.st='idle';Q.t=0;Q.wait=LP.NM?rand(.12,.4):.35}
  b.hatch=()=>{b.form2=true;b.haz.length=0;Q.u=nearestU(b.x,480);const h0=head();Q.hx=h0.x;Q.hy=h0.y;Q.trail=Array.from({length:90},()=>({x:h0.x,y:h0.y}));b.shell={x:b.x,y:b.y};b.hp=Math.min(b.hp,Math.ceil(max/2));
    LP.flash={c:'rgba(220,255,190,',t:.4,m:.85};LP.shake(26);LP.sfx('boom');LP.sfx('roar');LP.burst(b.x,b.y,70,'#c8d0a0',650,{g:700});LP.burst(b.x,b.y,40,'#7dff9a',500);
    for(let i=0;i<22;i++)LP.part({x:b.x+rand(-30,30),y:b.y+rand(-30,30),vx:rand(-420,420),vy:rand(-600,-100),g:1100,life:rand(.8,1.6),k:'shard',s:rand(4,9),col:pick(['#22281a','#4f5c39','#d4c9a8']),vr:rand(-12,12)})};
  function webGlob(tx){const x0=Q.hx,y0=Q.hy,ft=rand(.55,.75);b.haz.push(haz({k:'webglob',slow:true,x:x0-9,y:y0-9,w:18,h:18,vx:(tx-x0)/ft,vy:(472-y0-.5*1300*ft*ft)/ft,life:3,
    upd(dt){this.vy+=1300*dt;this.x+=this.vx*dt;this.y+=this.vy*dt;if(this.y+18>=480){this.life=0;b.haz.push(haz({k:'web',slow:true,x:this.x-30,y:466,w:78,h:14,life:LP.NM?5:4,draw(g){const a=Math.min(1,(this.life-this.t)/.5);g.globalAlpha=a*.8;g.strokeStyle='#e8eadc';g.lineWidth=1;for(let i=0;i<7;i++){g.beginPath();g.moveTo(this.x+i*12,480);g.quadraticCurveTo(this.x+i*12+6,466,this.x+i*12+12,480);g.stroke()}g.globalAlpha=1}}))}},
    draw(g){g.fillStyle='rgba(235,238,220,.85)';g.beginPath();g.arc(this.x+9,this.y+9,8,0,6.283);g.fill();g.strokeStyle='rgba(235,238,220,.5)';g.beginPath();g.moveTo(this.x+9,this.y+9);g.lineTo(this.x+9-this.vx*.04,this.y+9-this.vy*.04);g.stroke()}}))}
  function p2update(dt){const NM=LP.NM,sp=NM?800:660;Q.t+=dt;b.t+=dt;b.flash-=dt;b.laughT-=dt;
    if(!Q.fly){const hp=head();Q.hx=hp.x;Q.hy=hp.y;Q.nx=hp.nx;Q.ny=hp.ny}
    Q.trail.unshift({x:Q.hx,y:Q.hy});Q.trail.length=Math.min(Q.trail.length,90);
    switch(Q.st){
      case 'emerge':break;
      case 'idle':{const side=(hx()<480?1:-1)*260;crawlTo(dt,nearestU(clamp(hx()+side,60,900),480),sp*.7);Q.wait-=dt;if(Q.wait<=0)p2choose();break}
      case 'pounce':{if(Q.sub===0){const done=crawlTo(dt,nearestU(clamp(hx()+rand(-40,40),60,900),60),sp*1.2);if(done||Q.t>.9){Q.sub=1;Q.t=0;Q.tx=hx();Q.ty=hy();Q.td=NM?rand(.18,.45):.38;LP.sfx('warn')}}
        else if(Q.sub===1){if(Q.t>Q.td){Q.sub=2;Q.t=0;Q.fly=true;const dx=Q.tx-Q.hx,dy=Q.ty-Q.hy,d=Math.hypot(dx,dy)||1;Q.vx=dx/d*1200;Q.vy=dy/d*1200;LP.sfx('dash')}}
        else if(Q.sub===2){Q.hx+=Q.vx*dt;Q.hy+=Q.vy*dt;b.haz.push(haz({k:'bite',x:Q.hx-24,y:Q.hy-24,w:48,h:48,life:.02}));
          if(Q.hx<34||Q.hx>926||Q.hy>464||Q.hy<64){Q.fly=false;Q.u=nearestU(clamp(Q.hx,30,930),clamp(Q.hy,60,480));const hp=head();Q.hx=hp.x;Q.hy=hp.y;Q.sub=3;Q.t=0;LP.shake(16);LP.sfx('thud');LP.burst(Q.hx,Q.hy,24,'#c8d0a0',380,{g:700});if(Q.hy>400){shock(Q.hx,-1);shock(Q.hx,1)}}}
        else if(Q.sub===3&&Q.t>(NM?.45:.7)){Q.n++;if(Q.n<(NM?3:2)){Q.sub=0;Q.t=0}else p2done()}break}
      case 'web':{if(Q.sub===0){const done=crawlTo(dt,nearestU(clamp(hx(),60,900),60),sp*1.2);if(done||Q.t>.8){Q.sub=1;Q.t=0}}
        else if(Q.sub===1&&Q.t>(NM?.2:.32)){Q.sub=2;Q.t=0;[-110,0,110].forEach(o=>webGlob(clamp(hx()+o+(NM?rand(-40,40):0),50,910)));LP.sfx('shoot')}
        else if(Q.sub===2&&Q.t>.5){Q.n++;if(Q.n<2){Q.sub=1;Q.t=0}else p2done()}break}
      case 'brood':{if(Q.sub===0){const done=crawlTo(dt,nearestU(clamp(hx()+pick([-160,160]),80,880),60),sp);if(done||Q.t>.8){Q.sub=1;Q.t=0;LP.sfx('chew')}}
        else if(Q.sub===1&&Q.t>.45){Q.sub=2;const cnt=LP.ents.filter(e=>e.kind==='hatchling'&&!e.dead).length;for(let i=0;i<Math.min(3,6-cnt);i++){const e=LP.spawn({type:'hatchling',tx:Math.floor(clamp(Q.hx+(i-1)*36,60,900)/T),ty:3});if(e){e.y=Q.hy+10;LP.ents.push(e)}}LP.burst(Q.hx,Q.hy+10,16,'#c8d0a0',220,{g:600})}
        else if(Q.sub===2&&Q.t>.9)p2done();break}
      case 'sweep':{if(Q.sub===0){Q.dir=hx()<480?-1:1;const done=crawlTo(dt,nearestU(Q.dir<0?900:60,480),sp*1.3);if(done||Q.t>1.4){Q.sub=1;Q.t=0;LP.sfx('warn')}}
        else if(Q.sub===1){if(Math.random()<.5)LP.part({x:Q.hx,y:478,vx:rand(-60,60),vy:-rand(40,120),life:.3,col:'#c8d0a0',s:2});if(Q.t>(NM?rand(.2,.45):.42)){Q.sub=2;Q.t=0;LP.sfx('dash')}}
        else if(Q.sub===2){const done=crawlTo(dt,nearestU(Q.dir<0?60:900,480),NM?1050:930);const tail=Q.trail[Math.min(Q.trail.length-1,26)];b.haz.push(haz({k:'sweep',x:Math.min(Q.hx,tail.x)-20,y:450,w:Math.abs(Q.hx-tail.x)+40,h:30,life:.02}));if(done){Q.sub=3;Q.t=0;LP.shake(6)}}
        else if(Q.sub===3&&Q.t>.55)p2done();break}
      case 'dying':{Q.hx+=Math.sin(b.t*50)*2;if(Math.random()<.5)LP.part({x:Q.hx+rand(-20,20),y:Q.hy+rand(-20,20),vx:rand(-250,250),vy:rand(-300,-50),g:500,life:.5,col:pick(['#c8d0a0','#fff','#7dff9a']),k:'spark',s:3});
        if(Q.t>2.2&&!b.dead){b.dead=true;b.x=Q.hx;b.y=Q.hy;LP.shake(30);LP.sfx('boom');LP.burst(Q.hx,Q.hy,90,'#c8d0a0',700,{g:400});LP.part({x:Q.hx,y:Q.hy,k:'ring',col:'#fff',s:20,grow:900,life:.6,w:6});LP.flash={c:'rgba(255,255,255,',t:.5,m:.8};LP.bossDefeated(b)}break}}
    for(const z of b.haz){z.t+=dt;z.upd(dt)}b.haz=b.haz.filter(z=>z.t<z.life);LP.light(Q.hx,Q.hy,160,.55)}
  function p2draw(g){const t=b.t;
    if(b.shell){const s=b.shell;g.save();g.translate(s.x,Math.min(452,s.y+60));g.fillStyle='#0d0f09';g.beginPath();g.ellipse(0,0,74,26,0,0,6.283);g.fill();const sg=g.createRadialGradient(-10,-12,4,0,0,70);sg.addColorStop(0,'#2e3622');sg.addColorStop(1,'#0a0b07');g.fillStyle=sg;g.beginPath();g.moveTo(-66,6);g.quadraticCurveTo(-60,-46,-18,-40);g.lineTo(-6,-58);g.lineTo(6,-34);g.lineTo(22,-52);g.quadraticCurveTo(64,-36,66,6);g.closePath();g.fill();
      g.strokeStyle='#070605';g.lineWidth=5;for(let i=0;i<6;i++){const a=(i<3?Math.PI:0)+(i%3-1)*.35;g.beginPath();g.moveTo(Math.cos(a)*50,0);g.quadraticCurveTo(Math.cos(a)*80,-20,Math.cos(a)*96,18);g.stroke()}g.restore()}
    for(const z of b.haz)z.draw(g);
    if(Q.st==='pounce'&&Q.sub===1){g.strokeStyle=`rgba(255,62,107,${.5+.4*Math.sin(t*40)})`;g.lineWidth=2;g.setLineDash([10,8]);g.beginPath();g.moveTo(Q.hx,Q.hy);g.lineTo(Q.tx,Q.ty);g.stroke();g.setLineDash([])}
    if(Q.st==='sweep'&&Q.sub===1){g.fillStyle=`rgba(255,62,107,${.2+.2*Math.sin(t*40)})`;g.fillRect(30,450,900,30)}
    // body: plated segments trailing the head
    const segs=[];for(let i=1;i<=10;i++){const p=Q.trail[Math.min(Q.trail.length-1,i*(Q.fly?2:3))];segs.push(p)}
    for(let i=segs.length-1;i>=0;i--){const p=segs[i],q=i?segs[i-1]:{x:Q.hx,y:Q.hy},a=Math.atan2(q.y-p.y,q.x-p.x),r=15-i*.85;g.save();g.translate(p.x,p.y);g.rotate(a);
      g.strokeStyle='#0c0d08';g.lineWidth=2;for(const s2 of[-1,1]){const ph=t*22+i*1.3*s2;g.beginPath();g.moveTo(0,s2*r*.6);g.quadraticCurveTo(-4,s2*(r+8),-8+Math.sin(ph)*4,s2*(r+12));g.stroke()}
      const sg=g.createRadialGradient(-2,-r*.4,1,0,0,r);sg.addColorStop(0,b.flash>0?'#fff':'#d4d2b4');sg.addColorStop(.7,'#7a7a5e');sg.addColorStop(1,'#1e1f16');g.fillStyle=sg;g.beginPath();g.ellipse(0,0,r*1.1,r,0,0,6.283);g.fill();
      g.strokeStyle='rgba(110,14,20,.6)';g.lineWidth=1;g.beginPath();g.moveTo(-r*.6,-r*.5);g.quadraticCurveTo(0,-r*.2,r*.6,-r*.5);g.stroke();
      if(i===segs.length-1){g.fillStyle='#0c0d08';g.beginPath();g.moveTo(-r,0);g.quadraticCurveTo(-r-18,-10,-r-26,4);g.quadraticCurveTo(-r-14,2,-r,4);g.fill()}g.restore()}
    // head
    const p1=Q.trail[Math.min(4,Q.trail.length-1)],ha=Q.fly?Math.atan2(Q.vy,Q.vx):Math.atan2(Q.hy-p1.y,Q.hx-p1.x)||0;g.save();g.translate(Q.hx,Q.hy);g.rotate(ha);
    const tell=(Q.st==='pounce'&&Q.sub===1)||(Q.st==='sweep'&&Q.sub===1),mo=.4+.4*Math.sin(t*18);
    g.fillStyle='#0c0d08';for(const s2 of[-1,1]){g.beginPath();g.moveTo(14,s2*6);g.quadraticCurveTo(30,s2*(10+mo*8),34,s2*(2+mo*4));g.quadraticCurveTo(24,s2*4,14,s2*2);g.fill()}
    const hg=g.createRadialGradient(-4,-6,2,0,0,22);hg.addColorStop(0,b.flash>0?'#fff':'#e4e2c6');hg.addColorStop(.6,'#8a8a6a');hg.addColorStop(1,'#1e1f16');g.fillStyle=hg;g.beginPath();g.ellipse(0,0,22,18,0,0,6.283);g.fill();
    [[8,-8,4],[13,-2,3],[8,6,3.5],[2,-12,2.5]].forEach(([x,y,r])=>{g.fillStyle='#160202';g.beginPath();g.arc(x,y,r+1.4,0,6.283);g.fill();g.fillStyle=tell&&Math.sin(t*40)>0?'#fff':'#ff3b2e';g.beginPath();g.arc(x,y,r,0,6.283);g.fill()});
    g.restore()}
  return b}

/* =====================================================================
   THREAD RIPPER — CPU. A body of live threads that forks itself.
   ===================================================================== */
function ripper(){const NM=LP.NM,max=NM?92:76,W=36*T;
  const b={id:'ripper',name:'THREAD RIPPER',hp:max,max,x:W/2,y:FLOOR,vx:0,face:-1,state:'form',st:0,sub:0,form:0,eye:0,arm:0,alpha:1,phase:1,flash:0,haz:[],copies:[],after:[],t:0,next:1,last:'',cnt:0,vis:true,pose:'stand',dead:false};
  const tell=n=>NM?n*rand(.6,1.15):n;
  b.solid=()=>b.vis&&!['form','dying','blink','gone'].includes(b.state);
  b.hitboxes=()=>{if(b.form2)return ['form','dying'].includes(b.l.st)?[]:[{x:b.l.x-26,y:b.l.y-26,w:52,h:52}];const L=[];if(b.solid())L.push({x:b.x-22,y:b.y-128,w:44,h:128,real:true});for(const c of b.copies)if(c.alive&&!c.real)L.push({x:c.x-22,y:c.y-128,w:44,h:128,copy:c});return L};
  b.contact=()=>{const L=[];for(const c of b.copies)if(c.alive&&c.ph==='dive')L.push({x:c.x-14,y:c.y-118,w:28,h:116});return L};
  b.hurt=(d,dir,box)=>{if(b.form2){if(!b.hitboxes().length)return false;b.hp-=d;b.flash=.1;LP.sfx('hit');LP.burst(b.l.x,b.l.y,10,'#ffd27a',300);if(b.hp<=0){b.hp=0;b.l.st='dying';b.l.t=0;b.haz.length=0;LP.stopMusic();LP.stop(.25);LP.shots=LP.shots.filter(s=>s.mine)}return true}
    if(box&&box.copy){const c=box.copy;c.alive=false;LP.sfx('glitch');LP.burst(c.x,c.y-40,20,'#ffb35b',300);return true}
    if(!b.solid())return false;b.hp-=d;b.flash=.1;LP.sfx('hit');LP.burst(b.x,b.y-40,10,'#ffd27a',300);
    if(b.hp<=0){b.hp=0;b.state='dying';b.st=0;b.copies=[];b.haz.length=0;LP.stopMusic();LP.stop(.25);LP.shots=LP.shots.filter(s=>s.mine)}else if(b.phase===1&&b.hp<=max/2){b.phase=2;b.copies=[];b.haz.length=0;LP.shots=LP.shots.filter(s=>s.mine);b.state='unravel';b.st=0;
      LP.runCS((function*(){H.ctrl=false;LP.cam.focus={x:b.x,y:b.y-70,s:4};b.vis=true;b.pose='stagger';LP.sfx('roar');for(let s=0;s<1.3;s+=LP.DT){b.unr=s/1.3;if(Math.random()<.7){const a=rand(0,6.283);LP.part({x:b.x+rand(-20,20),y:b.y-rand(20,120),vx:Math.cos(a)*300,vy:Math.sin(a)*300,life:.4,col:'#ffb35b',k:'spark',s:2.5})}if(Math.random()<.3)LP.shake(5);yield LP.DT}
        b.unspool();LP.bigGlitch('free()',1.1);yield .8;LP.titleCard('THREAD RIPPER','UNSPOOLED',1.8);yield 1.4;LP.cam.focus=null;b.l.st='hover';b.l.wait=.3;b.l.tx=W/2;b.l.ty=280;LP.music('frenzy')})())}return true};
  function choose(){const o=['rip','fork','clock','switch'].filter(a=>a!==b.last);const a=pick(o);b.last=a;b.state=a;b.st=0;b.sub=0;b.cnt=0}
  function idleNext(){b.state='idle';b.st=0;b.next=NM?rand(.2,.65):b.phase===2?.4:.6;b.pose='stand'}
  function after(){b.after.push({x:b.x,y:b.y,face:b.face,pose:b.pose,t:0})}
  b.update=dt=>{if(b.form2){p2update(dt);return}b.t+=dt;b.st+=dt;b.flash-=dt;const P2=b.phase===2,spd=P2?1.2:1;
    for(const a of b.after)a.t+=dt;b.after=b.after.filter(a=>a.t<.3);
    switch(b.state){
      case 'form':case 'unravel':break;
      case 'idle':{const want=hx()+(b.x<hx()?-210:210);b.vx=appr(b.vx,clamp(want-b.x,-1,1)*(Math.abs(want-b.x)>20?150:0),800*dt);b.x=clamp(b.x+b.vx*dt,50,W-50);b.face=sign(hx()-b.x);b.next-=dt;if(b.next<=0)choose();break}
      case 'rip':{if(b.sub===0){b.vis=b.st<.18;if(b.st>.3){const side=NM?pick([-1,1]):(hx()<W/2?1:-1);b.x=side>0?W-60:60;b.face=-side;b.vis=true;b.sub=1;b.st=0;b.high=Math.random()<.5;b.pose=b.high?'high':'low';b.dur=tell(.58)/spd;LP.sfx('warn');LP.burst(b.x,b.y-40,16,'#ffb35b',200)}}
        else if(b.sub===1){if(b.st>b.dur){b.sub=2;b.st=0;b.stut=NM&&Math.random()<.3?rand(.2,.4):0;LP.sfx('dash')}}
        else if(b.sub===2){if(b.stut&&b.st>b.stut&&b.st<b.stut+.22){}else{b.x+=b.face*1180*dt;after()}
          const band=b.high?{y:FLOOR-64,h:28}:{y:FLOOR-26,h:26};b.haz=b.haz.filter(z=>z.k!=='rip');b.haz.push(haz({k:'rip',x:b.x-50,y:band.y,w:100,h:band.h,life:.05}));
          if(b.x<60||b.x>W-60){b.x=clamp(b.x,60,W-60);b.sub=3;b.st=0;LP.shake(8);LP.burst(b.x,FLOOR-20,20,'#ffd27a',300)}}
        else if(b.sub===3&&b.st>.3){b.cnt++;if(P2&&b.cnt<2){b.sub=1;b.st=0;b.face*=-1;b.high=!b.high;b.pose=b.high?'high':'low';b.dur=tell(.36);LP.sfx('warn')}else idleNext()}break}
      case 'fork':{if(b.sub===0){b.y=lerp(b.y,250,.12);b.x=lerp(b.x,W/2,.1);if(b.st>.5){b.sub=1;b.st=0;const n=P2?4:3,xs=[];for(let i=0;i<n;i++)xs.push(150+i*(W-300)/(n-1));const ri=Math.random()*n|0;
            b.copies=xs.map((x,i)=>({x:W/2,y:250,ox:x,real:i===ri,alive:true,ph:'wait',tx:0,ty:0,t:0}));b.order=b.copies.map((c,i)=>i).sort(()=>Math.random()-.5);b.vis=false;LP.sfx('glitch');LP.bigGlitch('fork()',.9)}}
        else if(b.sub===1){const k=Math.min(1,b.st/.4);b.copies.forEach(c=>{c.x=lerp(W/2,c.ox,LP.ease.out(k))});if(b.st>.55){b.sub=2;b.st=0;b.di=0}}
        else if(b.sub===2){const gap=NM?rand(.3,.55):.5/spd;for(let n=0;n<b.order.length;n++){const c=b.copies[b.order[n]];if(n===b.di&&c.ph==='wait'&&b.st>0){c.ph='tell';c.t=0;c.td=tell(.45)/spd;c.tx=hx();c.ty=FLOOR;LP.sfx('warn')}}
          for(const c of b.copies){c.t+=dt;if(c.ph==='tell'&&c.t>c.td){c.ph='dive';const dx=c.tx-c.x,dy=c.ty-c.y,d=Math.hypot(dx,dy);c.vx=dx/d*1050;c.vy=dy/d*1050;LP.sfx('dash')}
            if(c.ph==='dive'){c.x+=c.vx*dt;c.y+=c.vy*dt;if(Math.random()<.35)b.after.push({x:c.x,y:c.y,face:sign(c.vx),pose:'dive',t:0});if(c.y>=FLOOR){c.y=FLOOR;c.ph='done';LP.shake(9);LP.burst(c.x,FLOOR,16,'#ffb35b',300,{g:800});b.haz.push(haz({k:'land',x:c.x-45,y:FLOOR-30,w:90,h:30,life:.12}));
              if(!c.real&&c.alive){c.alive=false;LP.burst(c.x,c.y-40,24,'#ffb35b',260)}if(c.real){b.x=c.x;b.y=FLOOR;b.vis=true}b.di++;b.st=-gap}}}
          if(b.copies.every(c=>c.ph==='done')){b.sub=3;b.st=0;b.copies=[];b.vis=true;b.pose='stagger'}}
        else if(b.sub===3&&b.st>.8){idleNext()}break}
      case 'clock':{if(b.sub===0){b.vis=b.st<.15;if(b.st>.35){b.x=W/2;b.y=200;b.vis=true;b.sub=1;b.st=0;b.ang=rand(0,6.283);b.dir=pick([-1,1]);b.emit=0;b.pose='spin';LP.sfx('zap')}}
        else if(b.sub===1){const dur=P2?3.2:2.6,arms=P2?3:2;b.ang+=b.dir*(NM?rand(1.1,2.3):1.6)*dt;if(P2&&b.st>dur/2&&!b.rev){b.rev=true;b.dir*=-1}if(NM&&Math.random()<dt*.6)b.dir*=-1;
          b.emit-=dt;if(b.emit<=0){b.emit=.085;for(let i=0;i<arms;i++){const a=b.ang+i*6.283/arms,sp=NM?rand(200,280):230;LP.shots.push({x:b.x,y:b.y-80,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:6,col:'#ffb35b',life:5,brk:false})}if(Math.random()<.3)LP.sfx('bullet')}
          if(b.st>dur){b.sub=2;b.st=0;b.rev=false;b.vy=0}}
        else if(b.sub===2){b.vy+=2400*dt;b.y+=b.vy*dt;if(b.y>=FLOOR){b.y=FLOOR;LP.shake(8);LP.sfx('thud');idleNext()}}break}
      case 'switch':{if(b.sub===0){b.vis=b.st<.12;if(b.st===dt||b.st<dt*1.5){LP.sfx('glitch');LP.burst(b.x,b.y-40,20,'#ffb35b',260)}if(b.st>(b.wait||(b.wait=NM?rand(.25,.7):.45))){b.wait=0;const front=NM&&Math.random()<.35,s=front?H.face:-H.face;b.x=clamp(hx()+s*85,50,W-50);b.y=FLOOR;b.face=sign(hx()-b.x);b.vis=true;b.sub=1;b.st=0;b.pose='high';LP.sfx('warn');LP.burst(b.x,b.y-40,16,'#fff',200)}}
        else if(b.sub===1&&b.st>tell(.3)/spd){b.sub=2;b.st=0;LP.sfx('slash');b.haz.push(haz({k:'cut',x:b.x+(b.face>0?-10:-90),y:FLOOR-86,w:100,h:86,life:.14}))}
        else if(b.sub===2&&b.st>.4){b.cnt++;if(P2&&b.cnt<2){b.sub=0;b.st=0}else idleNext()}break}
      case 'dying':{if(Math.random()<.5)LP.part({x:b.x+rand(-14,14),y:b.y-rand(0,80),vx:rand(-200,200),vy:rand(-300,-50),g:300,life:.6,col:pick(['#ffb35b','#fff','#ff5b3e']),k:'spark',s:3});
        if(b.st>2.3&&!b.dead){b.dead=true;b.vis=false;LP.shake(30);LP.sfx('boom');LP.burst(b.x,b.y-40,90,'#ffb35b',750,{g:400});LP.part({x:b.x,y:b.y-40,k:'ring',col:'#fff',s:20,grow:900,life:.6,w:6});LP.flash={c:'rgba(255,240,220,',t:.5,m:.8};LP.bossDefeated(b)}break}}
    b.arm=appr(b.arm,b.state==='form'?b.armTarget||0:1,dt*3);
    for(const z of b.haz){z.t+=dt;z.upd(dt)}b.haz=b.haz.filter(z=>z.t<z.life);if(b.vis)LP.light(b.x,b.y-70,260,.95);for(const c of b.copies)if(c.alive)LP.light(c.x,c.y-70,140,.6)};
  function ghost(g,x,y,face,al,pose){const S=1.6,cr=pose==='low'?16:0,lean=pose==='low'?.35:pose==='dive'?.9:.12,ty=-70+cr;g.save();g.translate(x,y);g.scale(face*S,S);g.globalAlpha=al;g.strokeStyle='#ff7a2e';g.lineWidth=5;g.lineCap='round';
    g.beginPath();g.moveTo(-6,0);g.lineTo(0,-34+cr);g.lineTo(6,0);g.stroke();g.rotate(lean);g.beginPath();g.moveTo(0,-34+cr);g.lineTo(-2,ty);g.stroke();g.fillStyle='#ff7a2e';g.beginPath();g.ellipse(3,ty-10,9,13,.25,0,6.283);g.fill();g.restore()}
  function body(g,x,y,face,al,pose,glow,form){const t=b.t,S=1.6;g.save();g.translate(x,y);g.scale(face*S,S);g.globalAlpha=al;
    const crouch=pose==='low'?16:pose==='stagger'?10:0,lean=(pose==='low'?.35:pose==='dive'?.9:.12)+Math.sin(t*19)*.015,ty=-70+crouch,sy=-34+crouch,beat=1+.18*Math.max(0,Math.sin(t*7.5));
    // smoke and ember glow
    {const au=g.createRadialGradient(0,ty+16,2,0,ty+16,62);au.addColorStop(0,`rgba(255,110,30,${glow?.6:.42})`);au.addColorStop(.45,'rgba(150,30,0,.22)');au.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=au;g.fillRect(-62,ty-46,124,124)}
    // ragged cloak of burnt threads
    g.lineCap='round';for(let i=0;i<8;i++){const sx0=(i-3.5)*2.2,ex=-38-i*5+Math.sin(t*5+i)*12,ey=ty+86+Math.sin(t*2+i)*8;g.strokeStyle='#0b0504';g.lineWidth=2.6-i*.18;g.beginPath();g.moveTo(sx0,ty+8);
      g.bezierCurveTo(-16-i*4+Math.sin(t*4+i)*6,ty+28,-28-i*5+Math.sin(t*3+i*1.7)*10,ty+58,ex,ey);g.stroke();g.fillStyle=`rgba(255,${100+i*12},30,.7)`;g.fillRect(ex-1,ey-1,2,2)}
    // long digitigrade legs
    [[-1,0],[1,1]].forEach(([s,k])=>{const hx0=s*4,hy0=sy+4,kx=s*4-7,ky=sy+18-crouch*.3,ax=s*4+3,ay=-8,fx=s*4-6+k*2;g.strokeStyle='#0a0504';g.lineWidth=4.5;g.beginPath();g.moveTo(hx0,hy0);g.lineTo(kx,ky);g.lineTo(ax,ay);g.lineTo(fx,0);g.stroke();g.strokeStyle='rgba(255,110,30,.55)';g.lineWidth=.8;g.beginPath();g.moveTo(kx,ky);g.lineTo(ax,ay);g.stroke()});
    g.rotate(lean);
    // a hunched spine of sinew
    for(let i=0;i<9;i++){const off=(i-4)*2.4,w=Math.sin(t*6+i*1.3)*4*(form<1?(1-form)*4+1:1);g.strokeStyle=i%2?'#140806':'#0a0403';g.lineWidth=3;g.beginPath();g.moveTo(off*.8,sy);g.bezierCurveTo(off+w,sy-12,off-w-4,ty+14,off*.6-3,ty+2);g.stroke()}
    g.strokeStyle='rgba(255,120,40,.75)';g.lineWidth=.9;for(let i=0;i<5;i++){const yy=sy-6-i*6,xx=Math.sin(i*2.3+t)*4;g.beginPath();g.moveTo(xx-3,yy);g.lineTo(xx,yy-3);g.lineTo(xx+3,yy-1);g.stroke()}
    g.shadowBlur=0;
    // ember heart beating through the ribs
    {const hy0=ty+18,r=6*beat,hg=g.createRadialGradient(0,hy0,0,0,hy0,r*2.4);hg.addColorStop(0,b.flash>0?'#fff':'#ffe6a8');hg.addColorStop(.3,'#ff7a1e');hg.addColorStop(1,'rgba(255,60,0,0)');g.fillStyle=hg;g.beginPath();g.arc(0,hy0,r*2.4,0,6.283);g.fill();
      g.strokeStyle='#0a0403';g.lineWidth=1.6;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(-9,hy0+i*4);g.quadraticCurveTo(0,hy0+i*4-3,9,hy0+i*4);g.stroke()}}
    // elongated skull, hanging jaw, hollow sockets
    g.save();g.translate(3,ty-10);g.rotate(.25+Math.sin(t*13)*.03);
    g.fillStyle='rgba(255,105,30,.55)';g.beginPath();g.ellipse(0,-2,10.6,14.6,0,0,6.283);g.fill();g.fillStyle='#120807';g.beginPath();g.ellipse(0,-2,9,13,0,0,6.283);g.fill();g.strokeStyle='rgba(255,120,40,.5)';g.lineWidth=.8;g.beginPath();g.moveTo(-3,-14);g.lineTo(0,-8);g.lineTo(-2,-3);g.stroke();
    g.fillStyle='#0d0605';g.beginPath();g.ellipse(2,12+(glow?3:1),6,4,0,0,6.283);g.fill();g.fillStyle='#cdbb98';for(let i=0;i<4;i++){g.fillRect(-2+i*2.4,8,1.2,2.6+(i%2))}
    g.fillStyle='#000';g.beginPath();g.ellipse(-2,-2,3.4,4.4,-.2,0,6.283);g.ellipse(5,-1,2.8,3.8,.2,0,6.283);g.fill();
    g.shadowColor='#ffb35b';g.shadowBlur=glow?18:9;g.fillStyle=b.flash>0?'#fff':glow?'#fff3d0':'#ffc46b';const po=b.eye;g.beginPath();g.arc(-2,-1.5,1.3*po,0,6.283);g.arc(5,-.5,1.1*po,0,6.283);g.fill();g.shadowBlur=0;g.restore();
    // long arms ending in curved scythe claws
    const ar=b.arm,armA=pose==='high'?-.3:pose==='low'?.55:pose==='spin'?t*14:pose==='dive'?-.8:.9-ar*.4;
    [[-1,armA+.15],[1,armA]].forEach(([s2,a])=>{g.save();g.translate(s2*4,ty+14);g.rotate(a+(s2<0?.5:0));g.strokeStyle='#0a0403';g.lineWidth=3;g.beginPath();g.moveTo(0,0);g.lineTo(10*ar+3,2);g.lineTo(20*ar+4,0);g.stroke();
      const L=56*ar,hx1=20*ar+4;g.fillStyle='#160a07';g.beginPath();g.moveTo(hx1,-3);g.quadraticCurveTo(hx1+L*.55,-14*ar,hx1+L,6*ar);g.quadraticCurveTo(hx1+L*.5,-4*ar,hx1,3);g.closePath();g.fill();
      g.shadowColor='#ff7a1e';g.shadowBlur=10;g.strokeStyle='#ffb35b';g.lineWidth=1.3;g.beginPath();g.moveTo(hx1,-3);g.quadraticCurveTo(hx1+L*.55,-14*ar,hx1+L,6*ar);g.stroke();g.shadowBlur=0;g.restore()});
    g.restore()}
  b.draw=g=>{if(b.form2){p2draw(g);return}const t=b.t;
    if(b.state==='rip'&&b.sub===1){const yb=b.high?FLOOR-50:FLOOR-12,a=.4+.4*Math.sin(t*40);g.fillStyle=b.high?`rgba(255,220,90,${a})`:`rgba(255,62,107,${a})`;g.fillRect(0,yb-2,W,4);g.font='12px Silkscreen,monospace';g.fillStyle=g.fillStyle;g.textAlign='center';g.fillText(b.high?'↓ DUCK':'↑ JUMP',W/2,yb-12);g.textAlign='left'}
    for(const z of b.haz)if(z.k==='land'||z.k==='cut'){g.fillStyle='rgba(255,210,122,.5)';g.fillRect(z.x,z.y,z.w,z.h)}
    for(const a of b.after)ghost(g,a.x,a.y,a.face,(1-a.t/.3)*.4,a.pose);
    for(const c of b.copies){if(!c.alive)continue;const al=c.real?1:(NM?.92:.55);if(c.real||NM===false||true){if(c.real){g.fillStyle='rgba(0,0,0,.5)';g.beginPath();g.ellipse(c.x,FLOOR-2,20,5,0,0,6.283);g.fill()}}
      if(c.ph==='tell'){g.strokeStyle=`rgba(255,62,107,${.4+.4*Math.sin(t*40)})`;g.lineWidth=2;g.setLineDash([8,8]);g.beginPath();g.moveTo(c.x,c.y-40);g.lineTo(c.tx,c.ty);g.stroke();g.setLineDash([])}
      body(g,c.x,c.y,sign(hx()-c.x),al,c.ph==='dive'?'dive':'stand',c.ph==='tell',1)}
    if(b.state==='form'){const f=b.form;if(f<.5){const k=f/.5;g.strokeStyle='#fff3d0';g.lineWidth=3;g.shadowColor='#ffb35b';g.shadowBlur=20;g.beginPath();g.moveTo(b.x,60);g.lineTo(b.x,60+(FLOOR-60)*k);g.stroke();g.shadowBlur=0}
      if(f>.3){body(g,b.x,b.y,b.face,Math.min(1,(f-.3)/.5),'stand',f>.9,f)}return}
    if(b.vis&&b.state!=='dying')body(g,b.x+(b.unr?Math.random()*b.unr*8-b.unr*4:0),b.y,b.face,1-(b.unr||0)*.4,b.pose,b.state==='switch'&&b.sub===1,1-(b.unr||0)*.95);
    if(b.state==='dying'&&!b.dead){const k=b.st/2.3;g.save();g.globalAlpha=1-k*.3;body(g,b.x+Math.random()*4-2,b.y,b.face,1,'stagger',true,1-k*.9);g.restore()}};
  /* ---------- phase 2: it unspools into a spinning loom of blades ---------- */
  const L2=b.l={x:W/2,y:250,st:'form',t:0,sub:0,rot:0,R:62,blades:8,orbitR:0,lines:[],tx:W/2,ty:250,vx:0,vy:0,last:''};
  function segDist(px,py,x0,y0,x1,y1){const dx=x1-x0,dy=y1-y0,l=dx*dx+dy*dy||1;let k=((px-x0)*dx+(py-y0)*dy)/l;k=clamp(k,0,1);return Math.hypot(px-(x0+dx*k),py-(y0+dy*k))}
  function lineHaz(x0,y0,x1,y1,tell){const z=haz({k:'line',x0,y0,x1,y1,x:Math.min(x0,x1),w:Math.abs(x1-x0),life:tell+.2,tell,on:false,
    upd(){this.on=this.t>this.tell&&this.t<this.tell+.18;if(this.t>this.tell&&!this.snd){this.snd=1;LP.sfx('zap');LP.shake(5)}},
    hit(hb){return segDist(hb.x+hb.w/2,hb.y+hb.h/2,this.x0,this.y0,this.x1,this.y1)<16},
    draw(g){const live=this.t>this.tell;g.strokeStyle=live?'#fff3d0':`rgba(255,120,40,${.25+.25*Math.sin(this.t*40)})`;g.lineWidth=live?6:1.5;if(live){g.shadowColor='#ff7a1e';g.shadowBlur=16}g.beginPath();g.moveTo(this.x0,this.y0);g.lineTo(this.x1,this.y1);g.stroke();g.shadowBlur=0}});b.haz.push(z)}
  function p2choose(){const o=['grid','ricochet','rain','orbit','grid'].filter(a=>a!==L2.last);const a=pick(o);L2.last=a;L2.st=a;L2.t=0;L2.sub=0;L2.n=0}
  function p2done(){L2.st='hover';L2.t=0;L2.wait=LP.NM?rand(.15,.4):.4;L2.tx=clamp(hx()+pick([-260,260]),120,W-120);L2.ty=rand(260,360)}
  b.unspool=()=>{b.form2=true;b.vis=false;b.copies=[];b.haz.length=0;L2.x=b.x;L2.y=b.y-70;L2.st='form';L2.t=0;LP.flash={c:'rgba(255,200,140,',t:.4,m:.8};LP.shake(24);LP.sfx('boom');
    for(let i=0;i<60;i++){const a=rand(0,6.283);LP.part({x:L2.x,y:L2.y,vx:Math.cos(a)*rand(200,700),vy:Math.sin(a)*rand(200,700),life:rand(.4,.9),col:pick(['#ffb35b','#fff3d0','#ff6a1e']),k:'spark',s:3,drag:1})}};
  function p2update(dt){const NM=LP.NM;b.t+=dt;b.flash-=dt;L2.t+=dt;L2.rot+=dt*(L2.st==='ricochet'&&L2.sub===1?16:5);
    switch(L2.st){
      case 'form':L2.R=lerp(L2.R,62,.08);L2.y=lerp(L2.y,240,.05);break;
      case 'hover':L2.x=lerp(L2.x,L2.tx,1-Math.exp(-4*dt));L2.y=lerp(L2.y,L2.ty+Math.sin(b.t*3)*10,1-Math.exp(-4*dt));L2.wait-=dt;if(L2.wait<=0)p2choose();break;
      case 'grid':{L2.y=lerp(L2.y,180,.06);if(L2.t>(L2.n===0?.25:NM?rand(.35,.6):.55)){L2.t=0;L2.n++;const tl=NM?rand(.3,.55):.55,X=hx(),Y=hy();
          const opts=[()=>lineHaz(0,Y,W,Y,tl),()=>lineHaz(X,60,X,480,tl),()=>lineHaz(X-300,Y-300,X+300,Y+300,tl),()=>lineHaz(X+300,Y-300,X-300,Y+300,tl),()=>lineHaz(0,Y-60,W,Y-60,tl),()=>lineHaz(X+90,60,X+90,480,tl),()=>lineHaz(X-90,60,X-90,480,tl)];
          const k=2+(Math.random()*2|0);const pickd=opts.sort(()=>Math.random()-.5).slice(0,k);pickd.forEach(f=>f());LP.sfx('warn');if(L2.n>=(NM?4:3))p2done()}break}
      case 'ricochet':{if(L2.sub===0){L2.y=lerp(L2.y,300,.08);if(L2.t>(NM?rand(.25,.45):.45)){L2.sub=1;L2.t=0;L2.bn=0;const dx=hx()-L2.x,dy=hy()-L2.y,d=Math.hypot(dx,dy)||1;L2.vx=dx/d*(NM?1150:1000);L2.vy=dy/d*(NM?1150:1000);LP.sfx('dash')}}
        else if(L2.sub===1){L2.x+=L2.vx*dt;L2.y+=L2.vy*dt;const R=L2.R+10;if(L2.x<30+R||L2.x>W-30-R){L2.vx*=-1;L2.x=clamp(L2.x,30+R,W-30-R);L2.bn++;LP.shake(8);LP.sfx('thud')}if(L2.y<60+R||L2.y>480-R){L2.vy*=-1;L2.y=clamp(L2.y,60+R,480-R);L2.bn++;LP.shake(8);LP.sfx('thud')}
          b.haz.push(haz({k:'ring',x:L2.x-R,y:L2.y-R,w:R*2,h:R*2,life:.02,hit(hb){return Math.hypot(hb.x+hb.w/2-L2.x,hb.y+hb.h/2-L2.y)<R}}));if(L2.bn>=(NM?5:4)){L2.sub=2;L2.t=0}}
        else if(L2.sub===2){L2.y=lerp(L2.y,380,.1);if(L2.t>.7)p2done()}break}
      case 'rain':{L2.y=lerp(L2.y,110,.08);L2.x=lerp(L2.x,W/2,.05);if(L2.t>.4&&L2.t<2.9){L2.emit=(L2.emit||0)-dt;L2.gap=L2.gap==null?hx():appr(L2.gap,clamp(W/2+Math.sin(L2.t*1.7)*380,100,W-100),260*dt);
          if(L2.emit<=0){L2.emit=NM?.05:.07;let x=rand(40,W-40);if(Math.abs(x-L2.gap)<90)x+=x<L2.gap?-120:120;LP.shots.push({x,y:70,vx:0,vy:NM?rand(480,620):520,r:5,col:'#ffb35b',life:2,brk:false})}
          if(Math.random()<.4)LP.part({x:L2.gap,y:470,vy:-40,life:.3,col:'rgba(120,255,160,.6)',s:3})}
        if(L2.t>3.2){L2.gap=null;p2done()}break}
      case 'orbit':{L2.y=lerp(L2.y,280,.06);L2.x=lerp(L2.x,W/2,.05);const k=L2.t;if(k<1.4)L2.orbitR=lerp(0,430,LP.ease.out(k/1.4));else if(k<2.6)L2.orbitR=lerp(430,0,LP.ease.inOut((k-1.4)/1.2));else{L2.orbitR=0;p2done();break}
        L2.orot=(L2.orot||0)+dt*(NM?2.6:2.1);for(let i=0;i<8;i++){const a=L2.orot+i/8*6.283,r=L2.R+L2.orbitR,x=L2.x+Math.cos(a)*r,y=L2.y+Math.sin(a)*r;b.haz.push(haz({k:'blade',x:x-14,y:y-14,w:28,h:28,life:.02}))}
        if(NM)for(let i=0;i<5;i++){const a=-L2.orot*1.3+i/5*6.283,r=L2.R+L2.orbitR*.6,x=L2.x+Math.cos(a)*r,y=L2.y+Math.sin(a)*r;b.haz.push(haz({k:'blade',x:x-14,y:y-14,w:28,h:28,life:.02}))}break}
      case 'dying':{L2.R=lerp(L2.R,10,.02);if(Math.random()<.6)LP.part({x:L2.x+rand(-30,30),y:L2.y+rand(-30,30),vx:rand(-300,300),vy:rand(-300,100),g:300,life:.6,col:pick(['#ffb35b','#fff','#ff5b3e']),k:'spark',s:3});
        if(L2.t>2.3&&!b.dead){b.dead=true;b.x=L2.x;b.y=L2.y+40;LP.shake(30);LP.sfx('boom');LP.burst(L2.x,L2.y,90,'#ffb35b',750,{g:400});LP.part({x:L2.x,y:L2.y,k:'ring',col:'#fff',s:20,grow:900,life:.6,w:6});LP.flash={c:'rgba(255,240,220,',t:.5,m:.8};LP.bossDefeated(b)}break}}
    for(const z of b.haz){z.t+=dt;z.upd(dt)}b.haz=b.haz.filter(z=>z.t<z.life);LP.light(L2.x,L2.y,280,.95)}
  function p2draw(g){const t=b.t;for(const z of b.haz)if(z.k==='line')z.draw(g);
    if(L2.st==='ricochet'&&L2.sub===0){g.strokeStyle=`rgba(255,62,107,${.5+.4*Math.sin(t*40)})`;g.lineWidth=2;g.setLineDash([10,8]);g.beginPath();g.moveTo(L2.x,L2.y);g.lineTo(hx(),hy());g.stroke();g.setLineDash([])}
    const x=L2.x,y=L2.y,R=L2.R;
    {const au=g.createRadialGradient(x,y,4,x,y,R+60);au.addColorStop(0,'rgba(255,120,40,.45)');au.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=au;g.fillRect(x-R-60,y-R-60,(R+60)*2,(R+60)*2)}
    // the loom: threads strung from the heart to every blade
    const blades=[];const n=8;for(let i=0;i<n;i++){const a=L2.rot+i/n*6.283,r=R+(L2.st==='orbit'?L2.orbitR:0)+(L2.st==='orbit'?0:Math.sin(t*6+i)*4);blades.push([x+Math.cos(a)*r,y+Math.sin(a)*r,a])}
    if(L2.st==='orbit'){const a0=L2.orot||0;blades.length=0;for(let i=0;i<8;i++){const a=a0+i/8*6.283,r=R+L2.orbitR;blades.push([x+Math.cos(a)*r,y+Math.sin(a)*r,a])}if(LP.NM)for(let i=0;i<5;i++){const a=-a0*1.3+i/5*6.283,r=R+L2.orbitR*.6;blades.push([x+Math.cos(a)*r,y+Math.sin(a)*r,a])}}
    g.strokeStyle='rgba(255,140,60,.45)';g.lineWidth=1;for(const [bx,by] of blades){g.beginPath();g.moveTo(x,y);g.quadraticCurveTo((x+bx)/2+Math.sin(t*9+bx)*8,(y+by)/2,bx,by);g.stroke()}
    g.strokeStyle='#120806';g.lineWidth=4;g.beginPath();g.arc(x,y,R,0,6.283);g.stroke();g.strokeStyle='rgba(255,120,40,.6)';g.lineWidth=1;g.stroke();
    for(const [bx,by,a] of blades){g.save();g.translate(bx,by);g.rotate(a+Math.PI/2);g.fillStyle='#160a07';g.beginPath();g.moveTo(-4,6);g.quadraticCurveTo(-2,-18,16,-26);g.quadraticCurveTo(4,-12,4,6);g.closePath();g.fill();g.strokeStyle='#ffb35b';g.lineWidth=1.4;g.beginPath();g.moveTo(-4,6);g.quadraticCurveTo(-2,-18,16,-26);g.stroke();g.restore()}
    // the heart, now naked
    const beat=1+.2*Math.max(0,Math.sin(t*10)),hr=20*beat,hg=g.createRadialGradient(x,y,0,x,y,hr*1.6);hg.addColorStop(0,b.flash>0?'#fff':'#fff1c8');hg.addColorStop(.35,'#ff8a2e');hg.addColorStop(1,'rgba(255,60,0,0)');g.fillStyle=hg;g.beginPath();g.arc(x,y,hr*1.6,0,6.283);g.fill();
    g.fillStyle='#120806';g.beginPath();g.ellipse(x,y,9,12,0,0,6.283);g.fill();g.fillStyle='#fff3d0';g.beginPath();g.arc(x-3,y-2,1.6,0,6.283);g.arc(x+3,y-2,1.6,0,6.283);g.fill()}
  return b}

LP.BOSSES={weaver,ripper};

/* ---------- intros ---------- */
function* weaverIntro(b,full){const gates=LP.ents.filter(e=>e.kind==='gate'),gate={close(){gates.forEach(x=>x.close())}};H.ctrl=false;H.vx=0;yield .25;gate&&gate.close();yield .6;
  if(full){LP.cam.focus={x:b.x-80,y:190,s:2.2};yield 2.2;b.woke=true;LP.sfx('warn');yield 1}
  else{b.woke=true;yield .3}
  b.state='drop';LP.sfx('whoosh');yield()=>b.landed;LP.cam.focus={x:480,y:290,s:3};yield .5;
  LP.titleCard('ROT WEAVER','THE FIRST INFECTION',full?2.4:1.5);yield full?2.3:1.4;
  LP.cam.focus={x:b.x,y:b.y,s:5};yield .3;LP.mwahaha(b,1,full,{x:b.x,y:b.y});yield full?3.5:2.5;
  LP.cam.focus=null;b.state='idle';b.next=.8;H.ctrl=true;LP.music('boss')}
function* ripperIntro(b,full){const gates=LP.ents.filter(e=>e.kind==='gate'),gate={close(){gates.forEach(x=>x.close())}};H.ctrl=false;H.vx=0;yield .25;gate&&gate.close();yield .5;
  b.x=36*T/2+120;b.face=-1;b.eye=0;b.armTarget=0;
  if(full){LP.music('quiet');LP.darkOverride=.72;LP.console(['> scheduler.status ............ UNRESPONSIVE','> thread 0x1F ................. ROGUE','> kill -9 0x1F','> ERROR: process refuses to die'],42);yield 4.2}
  LP.cam.focus={x:b.x,y:300,s:2.4};const ft=full?2.2:.9;for(let s=0;s<ft;s+=LP.DT){b.form=s/ft;if(Math.random()<.6){const a=rand(0,6.283),r=rand(60,160);LP.part({x:b.x+Math.cos(a)*r,y:b.y-40+Math.sin(a)*r,vx:-Math.cos(a)*r*2.2,vy:-Math.sin(a)*r*2.2,life:.45,col:pick(['#ffb35b','#fff3d0']),s:2.5,k:'spark'})}yield LP.DT}
  b.form=1;b.eye=1;LP.sfx('zap');LP.flash={c:'rgba(255,200,140,',t:.25,m:.5};b.armTarget=1;yield .7;
  if(full){LP.bigGlitch('fork()',1.5);const xs=[150,420,720,930];b.copies=xs.map(x=>({x:b.x,y:FLOOR,ox:x,real:false,alive:true,ph:'show',t:0}));for(let s=0;s<.5;s+=LP.DT){b.copies.forEach(c=>c.x=lerp(b.x,c.ox,LP.ease.out(s/.5)));yield LP.DT}
    LP.shake(12);yield .5;for(let s=0;s<.25;s+=LP.DT){b.copies.forEach(c=>c.x=lerp(c.ox,b.x,LP.ease.inOut(s/.25)));yield LP.DT}b.copies=[];LP.flash={c:'rgba(255,255,255,',t:.3,m:.7};LP.shake(16);LP.sfx('boom');yield .6}
  LP.darkOverride=null;LP.titleCard('THREAD RIPPER','IT SPLITS THE CORE',full?2.4:1.5);yield full?2.3:1.4;
  LP.cam.focus=null;b.state='idle';b.next=.7;H.ctrl=true;LP.music('boss2')}
LP.INTROS={weaver:weaverIntro,ripper:ripperIntro};
})();
