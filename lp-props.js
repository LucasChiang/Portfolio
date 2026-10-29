/* LAST PATCH — set dressing: the towns, homes, signs and survivors of the Board. */
(function(){
'use strict';
const LP=window.LP,T=LP.T,{clamp,rand,pick,lerp,appr}=LP,H=LP.H,I=LP.I,shade=LP.shade;

/* zone building palettes */
Object.assign(LP.ZONES.mb,{house:'#25382a',roof:'#354a2d',trim:'#d9a441',win:'#ffc56b',cloth:['#c45bff','#d9a441','#7dff9a','#ff6b6b']});
Object.assign(LP.ZONES.cpu,{house:'#3a1c10',roof:'#4c2414',trim:'#ff8a3e',win:'#ffb35b',cloth:['#ff8a3e','#ffd27a','#ff3e6b','#9aa6c2']});

const rr=(g,x,y,w,h,r)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()};
const txt=(g,s,x,y,size,col,align)=>{g.font=`${size}px Silkscreen, "JetBrains Mono", monospace`;g.fillStyle=col;g.textAlign=align||'center';g.fillText(s,x,y);g.textAlign='left'};
let GL=null;const glow=(x,y,r,i,fl)=>{GL&&GL.push({x,y,r,i:i||.8,fl:fl||0,ph:Math.random()*9})};
function rot(g,x,y,w,R,Z){g.fillStyle='rgba(120,40,150,.35)';for(let i=0;i<5;i++){g.beginPath();g.ellipse(x+R()*w,y-R()*14,8+R()*18,5+R()*8,0,0,6.283);g.fill()}
  g.strokeStyle='rgba(196,91,255,.45)';g.lineWidth=2;for(let i=0;i<4;i++){let px=x+R()*w,py=y;g.beginPath();g.moveTo(px,py);for(let k=0;k<4;k++){px+=(R()-.5)*20;py-=10+R()*14;g.lineTo(px,py)}g.stroke()}}

const PR={};LP.PAINT=PR;
PR.house=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T,W=(p.w||4)*T,Hh=(p.h||3)*T;
  g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(X+W/2,Y,W/2+10,6,0,0,6.283);g.fill();
  g.fillStyle=Z.house;rr(g,X,Y-Hh,W,Hh,12);g.fill();g.strokeStyle=shade(Z.house,-.3);g.lineWidth=1;for(let yy=Y-Hh+14;yy<Y-4;yy+=13){g.beginPath();g.moveTo(X+6,yy);g.lineTo(X+W-6,yy);g.stroke()}
  g.fillStyle=Z.roof;g.beginPath();g.ellipse(X+W/2,Y-Hh+4,W/2+10,Math.min(60,Hh*.45),0,Math.PI,0);g.fill();g.strokeStyle=Z.trim;g.globalAlpha=.6;g.lineWidth=2;g.beginPath();g.ellipse(X+W/2,Y-Hh+4,W/2+10,Math.min(60,Hh*.45),0,Math.PI,0);g.stroke();g.globalAlpha=1;
  // chimney pipe with a rounded cap
  const cx=X+W*.72;g.fillStyle=shade(Z.roof,-.2);rr(g,cx,Y-Hh-Math.min(60,Hh*.45)*.75-18,12,30,5);g.fill();
  // round windows
  const n=Math.max(1,Math.floor(W/58));for(let i=0;i<n;i++){const wx=X+W*(i+.5)/n+(n===1?-W*.2:0),wy=Y-Hh*.62,lit=p.lit!=null?p.lit[i]:R()<.35,brk=p.broken&&i===0;
    g.fillStyle=shade(Z.house,-.45);g.beginPath();g.arc(wx,wy,11,0,6.283);g.fill();g.fillStyle=lit?Z.win:'#06080a';g.beginPath();g.arc(wx,wy,8.5,0,6.283);g.fill();
    if(lit){glow(wx,wy,70,.55,.15);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(wx-4,wy-5,3,3)}
    g.strokeStyle=shade(Z.house,-.45);g.lineWidth=1.5;g.beginPath();g.moveTo(wx-8.5,wy);g.lineTo(wx+8.5,wy);g.moveTo(wx,wy-8.5);g.lineTo(wx,wy+8.5);g.stroke();
    if(brk){g.strokeStyle='rgba(200,210,230,.6)';g.beginPath();g.moveTo(wx-6,wy-6);g.lineTo(wx+2,wy+1);g.lineTo(wx-2,wy+7);g.stroke()}}
  // arched door
  const dx=X+(n===1?W*.66:W/2)-12;g.fillStyle=shade(Z.house,-.5);g.beginPath();g.moveTo(dx,Y);g.lineTo(dx,Y-30);g.arc(dx+12,Y-30,12,Math.PI,0);g.lineTo(dx+24,Y);g.fill();
  if(p.ajar){g.fillStyle='#020304';g.beginPath();g.moveTo(dx+6,Y);g.lineTo(dx+6,Y-32);g.arc(dx+12,Y-32,6,Math.PI,0);g.lineTo(dx+18,Y);g.fill()}else{g.fillStyle=Z.trim;g.fillRect(dx+17,Y-17,3,3)}
  if(p.sign){const sw=Math.max(60,p.sign.length*8+16);g.fillStyle=shade(Z.roof,.1);rr(g,X+W/2-sw/2,Y-Hh+10,sw,18,4);g.fill();txt(g,p.sign,X+W/2,Y-Hh+23,10,Z.trim)}
  if(p.broken){g.fillStyle='#020304';g.beginPath();g.ellipse(X+W*.3,Y-Hh+6,W*.16,16,.3,0,6.283);g.fill();for(let i=0;i<6;i++){g.fillStyle=shade(Z.roof,-.1);g.fillRect(X+R()*W,Y-6-R()*6,6+R()*10,5)}}
  if(p.rot)rot(g,X,Y,W,R,Z)};
PR.tower=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T,W=(p.w||5)*T,Hh=(p.h||9)*T;g.fillStyle=shade(Z.house,-.1);rr(g,X,Y-Hh,W,Hh,18);g.fill();
  g.fillStyle=Z.roof;g.beginPath();g.ellipse(X+W/2,Y-Hh+2,W/2,28,0,Math.PI,0);g.fill();g.fillStyle=Z.trim;g.fillRect(X+W/2-1,Y-Hh-44,2,18);g.beginPath();g.arc(X+W/2,Y-Hh-46,3,0,6.283);g.fill();glow(X+W/2,Y-Hh-46,40,.6,.6);
  for(let r=0;r<Math.floor(Hh/42)-1;r++)for(let c=0;c<Math.floor(W/36);c++){const wx=X+22+c*36,wy=Y-Hh+40+r*42,lit=R()<(p.litChance||.22);g.fillStyle=lit?Z.win:'#05070c';rr(g,wx-9,wy-11,18,22,9);g.fill();if(lit)glow(wx,wy,50,.45,.1)}
  if(p.sign){g.fillStyle=shade(Z.roof,.15);rr(g,X+10,Y-38,W-20,20,6);g.fill();txt(g,p.sign,X+W/2,Y-24,11,Z.trim)}if(p.rot)rot(g,X,Y,W,R,Z)};
PR.stall=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T,W=(p.w||3)*T;g.fillStyle=shade(Z.house,.05);g.fillRect(X+4,Y-34,W-8,34);g.fillStyle=shade(Z.house,-.3);g.fillRect(X,Y-38,W,6);
  g.fillStyle='#3a2a1a';g.fillRect(X+6,Y-90,4,52);g.fillRect(X+W-10,Y-90,4,52);
  const st=Math.ceil(W/16);for(let i=0;i<st;i++){g.fillStyle=Z.cloth[i%2?0:1];g.beginPath();g.moveTo(X-6+i*16,Y-96);g.lineTo(X+10+i*16,Y-96);g.lineTo(X+10+i*16,Y-80);g.arc(X+2+i*16,Y-80,8,0,Math.PI);g.closePath();g.fill()}
  for(let i=0;i<Math.floor(W/14);i++){g.fillStyle=pick(Z.cloth);g.beginPath();g.arc(X+10+i*14,Y-42,5,0,6.283);g.fill()}if(p.txt)txt(g,p.txt,X+W/2,Y-102,10,Z.trim);if(p.knocked){g.fillStyle='rgba(0,0,0,.4)';g.fillRect(X,Y-38,W,38)}};
PR.lamp=(g,p,Z,R)=>{const X=p.x*T+15,Y=p.y*T,h=p.h||80;g.strokeStyle='#14171c';g.lineWidth=4;g.beginPath();g.moveTo(X,Y);g.lineTo(X,Y-h);g.quadraticCurveTo(X,Y-h-14,X+14,Y-h-14);g.stroke();
  const lx=X+14,ly=Y-h-6;g.fillStyle='#14171c';g.beginPath();g.ellipse(lx,ly-6,9,5,0,Math.PI,0);g.fill();if(p.off){g.fillStyle='#1c2028';g.beginPath();g.arc(lx,ly,6,0,6.283);g.fill();g.strokeStyle='rgba(200,210,230,.5)';g.lineWidth=1;g.beginPath();g.moveTo(lx-3,ly-2);g.lineTo(lx+2,ly+3);g.stroke()}
  else{g.fillStyle=Z.win;g.beginPath();g.arc(lx,ly,6,0,6.283);g.fill();glow(lx,ly,p.r||150,.85,p.flicker?.9:.08)}};
PR.sign=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T,s=p.txt,w=Math.max(70,s.length*9+20);g.strokeStyle='#14171c';g.lineWidth=2;if(p.hang){g.beginPath();g.moveTo(X+10,Y-40);g.lineTo(X+14,Y-14);g.moveTo(X+w-10,Y-40);g.lineTo(X+w-14,Y-14);g.stroke()}
  else{g.lineWidth=4;g.beginPath();g.moveTo(X+w/2,Y);g.lineTo(X+w/2,Y-34);g.stroke()}
  g.save();g.translate(X+w/2,Y-(p.hang?2:40));g.rotate(p.tilt||0);g.fillStyle=shade(Z.roof,.12);rr(g,-w/2,-16,w,24,6);g.fill();g.strokeStyle=Z.trim;g.globalAlpha=.5;g.lineWidth=1;rr(g,-w/2+2,-14,w-4,20,5);g.stroke();g.globalAlpha=1;txt(g,s,0,1,11,Z.trim);
  if(p.cross){g.strokeStyle='#ff3e6b';g.lineWidth=2;g.beginPath();g.moveTo(p.cross[0],-6);g.lineTo(p.cross[1],2);g.stroke();txt(g,p.add||'',p.cross[1]+12,-10,10,'#ff6b8b')}g.restore()};
PR.bunting=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T,W=(p.w||6)*T;g.strokeStyle='#14171c';g.lineWidth=1.5;g.beginPath();g.moveTo(X,Y);g.quadraticCurveTo(X+W/2,Y+40,X+W,Y);g.stroke();
  const n=Math.floor(W/22);for(let i=1;i<n;i++){const u=i/n,x=X+W*u,y=Y+80*u*(1-u)*.5*2*.5*2*.5;const yy=Y+40*2*u*(1-u);if(p.torn&&R()<.3)continue;g.fillStyle=Z.cloth[i%Z.cloth.length];g.beginPath();g.moveTo(x-7,yy);g.lineTo(x+7,yy);g.lineTo(x+7,yy+10);g.arc(x,yy+10,7,0,Math.PI);g.closePath();g.fill()}};
PR.crates=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T;const n=p.n||3;for(let i=0;i<n;i++){const s=26+R()*8,x=X+i*24+(i>2?-60:0),y=Y-(i>2?s+26:0);g.fillStyle=shade('#3a2a1a',R()*.1);rr(g,x,y-s,s,s,4);g.fill();g.strokeStyle='#1a120a';g.lineWidth=2;g.beginPath();g.moveTo(x+3,y-s+3);g.lineTo(x+s-3,y-3);g.stroke();
    if(p.label&&i===0)txt(g,p.label,x+s/2,y-s/2+3,7,Z.trim)}};
PR.barrels=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T;for(let i=0;i<(p.n||2);i++){const x=X+i*26;g.fillStyle=pick(['#2a3550','#3a2a50','#2a4a3a']);rr(g,x,Y-34,22,34,10);g.fill();g.fillStyle='rgba(255,255,255,.12)';g.fillRect(x+4,Y-30,3,26);g.fillStyle=Z.trim;g.fillRect(x,Y-26,22,2);g.fillRect(x,Y-10,22,2)}};
PR.husk=(g,p,Z,R)=>{const X=p.x*T+15,Y=p.y*T,s=p.s||1;g.save();g.translate(X,Y);g.scale(p.flip?-s:s,s);
  g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(0,0,16,4,0,0,6.283);g.fill();
  const sg=g.createLinearGradient(0,-40,0,0);sg.addColorStop(0,'#8c8f96');sg.addColorStop(1,'#4a4c52');g.fillStyle=sg;
  if(p.pose==='kneel'){g.beginPath();g.ellipse(0,-12,14,12,0,0,6.283);g.fill();g.beginPath();g.arc(4,-28,10,0,6.283);g.fill()}
  else{g.beginPath();g.ellipse(0,-16,13,16,0,0,6.283);g.fill();g.beginPath();g.arc(1,-38,11,0,6.283);g.fill();g.strokeStyle='#6a6d74';g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(8,-22);g.lineTo(p.pose==='hug'?2:20,p.pose==='hug'?-14:-44);g.stroke();
    if(p.pose==='hug'){g.fillStyle='#7a7d84';g.beginPath();g.arc(-9,-10,7,0,6.283);g.fill();g.beginPath();g.arc(-9,-20,5.5,0,6.283);g.fill()}}
  g.fillStyle='#2a2c32';const hy=p.pose==='kneel'?-29:-39;g.beginPath();g.ellipse(-2,hy,2.4,3.2,0,0,6.283);g.ellipse(5,hy,2.4,3.2,0,0,6.283);g.fill();
  g.strokeStyle='rgba(196,91,255,.75)';g.lineWidth=1.3;g.beginPath();g.moveTo(-10,-2);g.lineTo(-4,-14);g.lineTo(-7,-24);g.moveTo(9,-4);g.lineTo(5,-18);g.stroke();
  g.strokeStyle='rgba(20,20,24,.6)';g.lineWidth=1;g.beginPath();g.moveTo(-4,-46);g.lineTo(0,-40);g.lineTo(-3,-34);g.stroke();g.restore()};
PR.poster=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T;g.save();g.translate(X+20,Y-30);g.rotate(p.tilt||(R()-.5)*.12);g.fillStyle='#d8cfb8';g.fillRect(-20,-26,40,52);g.fillStyle='rgba(0,0,0,.08)';g.fillRect(-20,14,40,12);
  txt(g,p.title||'MISSING',0,-16,8,'#3a1a1a');g.strokeStyle='#3a3530';g.lineWidth=1.5;g.beginPath();g.arc(0,0,9,0,6.283);g.stroke();g.fillStyle='#3a3530';g.fillRect(-4,-3,2,3);g.fillRect(2,-3,2,3);g.beginPath();g.arc(0,3,3,0,Math.PI);g.stroke();
  txt(g,p.name||'',0,20,7,'#3a3530');g.fillStyle='#a33';g.fillRect(-2,-29,4,4);g.restore()};
PR.graffiti=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T;g.save();g.translate(X,Y);g.rotate(p.tilt||-.04);g.font=`${p.size||16}px "Permanent Marker", Silkscreen, monospace`;g.fillStyle=p.col||'rgba(255,107,139,.7)';g.fillText(p.txt,0,0);g.restore()};
PR.tram=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T,W=(p.w||5)*T;g.save();g.translate(X+W/2,Y-26);g.rotate(p.tilt||.12);g.fillStyle='#24384a';rr(g,-W/2,-30,W,58,26);g.fill();g.fillStyle='#d9a441';g.fillRect(-W/2+10,-4,W-20,5);
  for(let i=0;i<Math.floor((W-40)/30);i++){g.fillStyle=R()<.3?'#1a1006':'#0a1018';rr(g,-W/2+22+i*30,-22,22,16,8);g.fill()}txt(g,p.txt||'ROUTE 7',0,20,10,'#d9a441');
  g.fillStyle='#0a0c10';g.beginPath();g.arc(-W/2+30,30,10,0,6.283);g.arc(W/2-30,30,10,0,6.283);g.fill();g.restore();g.fillStyle='rgba(0,0,0,.4)';g.fillRect(X,Y-4,W,4)};
PR.cables=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T,W=(p.w||6)*T;for(let i=0;i<(p.n||3);i++){g.strokeStyle=pick(['#14171c','#1f2630','#2a1a24']);g.lineWidth=2+R()*2;const sag=20+R()*(p.sag||60);g.beginPath();g.moveTo(X+R()*20,Y);g.quadraticCurveTo(X+W/2,Y+sag*2,X+W-R()*20,Y);g.stroke()}};
PR.growth=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T,W=(p.w||3)*T;rot(g,X,Y,W,R,Z);g.fillStyle='rgba(196,91,255,.5)';for(let i=0;i<6;i++){g.beginPath();g.arc(X+R()*W,Y-R()*20,2+R()*3,0,6.283);g.fill()}glow(X+W/2,Y-10,60,.35,.4)};
PR.shelf=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T,W=(p.w||3)*T,Hh=(p.h||4)*T;g.fillStyle=shade(Z.house,-.15);rr(g,X,Y-Hh,W,Hh,6);g.fill();
  for(let r=0;r<Math.floor(Hh/34);r++){const sy=Y-Hh+8+r*34;g.fillStyle=shade(Z.house,-.4);g.fillRect(X+4,sy+28,W-8,3);let x=X+6;while(x<X+W-12){const w=5+R()*7,h=14+R()*12;if(R()<.12&&p.gaps){x+=w;continue}g.fillStyle=pick(['#3a4a6a','#5a3a3a','#3a5a4a','#6a5a3a','#4a3a5a']);g.fillRect(x,sy+28-h,w,h);x+=w+1}}};
PR.clock=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T,r=p.r||70;g.fillStyle=shade(Z.house,.05);g.beginPath();g.arc(X,Y,r+10,0,6.283);g.fill();g.fillStyle='#e8d8b8';g.globalAlpha=.75;g.beginPath();g.arc(X,Y,r,0,6.283);g.fill();g.globalAlpha=1;
  g.strokeStyle='#2a1a10';for(let i=0;i<12;i++){const a=i/12*6.283;g.lineWidth=i%3?2:4;g.beginPath();g.moveTo(X+Math.cos(a)*r*.82,Y+Math.sin(a)*r*.82);g.lineTo(X+Math.cos(a)*r*.95,Y+Math.sin(a)*r*.95);g.stroke()}
  g.lineWidth=4;g.beginPath();g.moveTo(X,Y);g.lineTo(X+r*.5*Math.cos(-1.2),Y+r*.5*Math.sin(-1.2));g.moveTo(X,Y);g.lineTo(X+r*.75*Math.cos(.6),Y+r*.75*Math.sin(.6));g.stroke();if(p.crack){g.strokeStyle='rgba(20,10,5,.8)';g.lineWidth=2;g.beginPath();g.moveTo(X-r*.6,Y-r*.5);g.lineTo(X-r*.1,Y-r*.1);g.lineTo(X-r*.3,Y+r*.4);g.stroke()}glow(X,Y,r*1.4,.35,.05)};
PR.machine=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T,W=(p.w||6)*T,Hh=(p.h||5)*T;g.fillStyle=shade(Z.house,.08);rr(g,X,Y-Hh,W,Hh,24);g.fill();g.fillStyle=shade(Z.house,-.25);rr(g,X+14,Y-Hh+14,W-28,Hh*.45,14);g.fill();
  for(let i=0;i<Math.floor(W/50);i++){const cx=X+30+i*50,cy=Y-Hh*.3;g.fillStyle='#e8d8b8';g.beginPath();g.arc(cx,cy,12,0,6.283);g.fill();g.strokeStyle='#2a1a10';g.lineWidth=2;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(R()*6)*9,cy+Math.sin(R()*6)*9);g.stroke()}
  for(let i=0;i<8;i++){const lit=R()<.4;g.fillStyle=lit?Z.win:'#140a06';g.beginPath();g.arc(X+24+i*((W-48)/7),Y-Hh+Hh*.45+28,4,0,6.283);g.fill();if(lit)glow(X+24+i*((W-48)/7),Y-Hh+Hh*.45+28,30,.5,.6)}
  if(p.label)txt(g,p.label,X+W/2,Y-Hh+Hh*.25+6,14,Z.trim);if(p.rot)rot(g,X,Y,W,R,Z)};
PR.pipe=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T,L=(p.w||6)*T;g.fillStyle=shade(Z.house,.1);if(p.v){rr(g,X,Y,18,L,9);g.fill();g.fillStyle=Z.trim;g.globalAlpha=.4;for(let i=20;i<L;i+=60)g.fillRect(X-2,Y+i,22,5);g.globalAlpha=1}else{rr(g,X,Y,L,18,9);g.fill();g.fillStyle=Z.trim;g.globalAlpha=.4;for(let i=20;i<L;i+=60)g.fillRect(X+i,Y-2,5,22);g.globalAlpha=1}};
PR.table=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T;g.fillStyle=shade(Z.house,.15);rr(g,X,Y-28,70,7,3);g.fill();g.fillRect(X+6,Y-22,4,22);g.fillRect(X+60,Y-22,4,22);g.fillStyle='#d8d0c0';for(let i=0;i<3;i++){rr(g,X+10+i*20,Y-38,10,10,3);g.fill()}if(p.tipped){g.fillStyle='rgba(0,0,0,.4)';g.fillRect(X+40,Y-4,30,4)}};
PR.lockers=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T;for(let i=0;i<(p.n||4);i++){g.fillStyle=shade(Z.house,.12+(i%2)*.04);rr(g,X+i*24,Y-70,22,70,4);g.fill();g.fillStyle='#0a0604';for(let k=0;k<3;k++)g.fillRect(X+i*24+6,Y-62+k*4,10,2);if(R()<.3){g.fillStyle='#020202';g.fillRect(X+i*24+2,Y-68,18,66)}}};
PR.cocoon=(g,p,Z,R)=>{const X=p.x*T+15,Y=p.y*T,L=p.l||80;g.strokeStyle='rgba(200,210,190,.35)';g.lineWidth=1;g.beginPath();g.moveTo(X,Y);g.lineTo(X,Y+L-30);g.stroke();
  const cg=g.createRadialGradient(X-6,Y+L-16,3,X,Y+L,30);cg.addColorStop(0,'#c8c6a8');cg.addColorStop(1,'#3a3a2a');g.fillStyle=cg;g.beginPath();g.ellipse(X,Y+L,16,28,0,0,6.283);g.fill();
  g.strokeStyle='rgba(60,60,40,.6)';for(let i=0;i<5;i++){g.beginPath();g.moveTo(X-14,Y+L-18+i*9);g.quadraticCurveTo(X,Y+L-12+i*9,X+14,Y+L-18+i*9);g.stroke()}g.fillStyle='rgba(40,40,46,.6)';g.beginPath();g.arc(X+2,Y+L-6,5,0,6.283);g.fill()};
PR.web=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T,r=p.r||80,dx=p.flip?-1:1;g.strokeStyle='rgba(210,220,200,.18)';g.lineWidth=1;for(let i=0;i<6;i++){const a=i/5*Math.PI/2;g.beginPath();g.moveTo(X,Y);g.lineTo(X+dx*Math.cos(a)*r,Y+Math.sin(a)*r);g.stroke()}
  for(let k=1;k<5;k++){g.beginPath();for(let i=0;i<6;i++){const a=i/5*Math.PI/2,rr2=r*k/5;const x=X+dx*Math.cos(a)*rr2,y=Y+Math.sin(a)*rr2;i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}};
PR.arch=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T,W=(p.w||6)*T,Hh=(p.h||5)*T;g.fillStyle=shade(Z.house,.1);g.fillRect(X,Y-Hh,22,Hh);g.fillRect(X+W-22,Y-Hh,22,Hh);g.beginPath();g.ellipse(X+W/2,Y-Hh,W/2,40,0,Math.PI,0);g.lineTo(X+W-22,Y-Hh);g.ellipse(X+W/2,Y-Hh,W/2-22,24,0,0,Math.PI,true);g.closePath();g.fill();
  if(p.txt){g.fillStyle=shade(Z.roof,.15);rr(g,X+W/2-p.txt.length*5-14,Y-Hh-22,p.txt.length*10+28,20,6);g.fill();txt(g,p.txt,X+W/2,Y-Hh-8,11,Z.trim)}glow(X+11,Y-Hh+20,60,.5,.3);glow(X+W-11,Y-Hh+20,60,.5,.3)};
PR.candles=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T;for(let i=0;i<(p.n||4);i++){const x=X+i*9+R()*4,h=8+R()*10;g.fillStyle='#e8e0c8';g.fillRect(x,Y-h,5,h);g.fillStyle='#ffc56b';g.beginPath();g.ellipse(x+2.5,Y-h-4,2.2,4,0,0,6.283);g.fill();glow(x+2.5,Y-h-4,45,.6,.9)}
  if(p.photo){g.fillStyle='#d8cfb8';g.fillRect(X+12,Y-34,18,22);g.fillStyle='#3a3530';g.beginPath();g.arc(X+21,Y-25,5,0,6.283);g.fill()}};
PR.port=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T,W=(p.w||6)*T;g.fillStyle='#0a0c10';rr(g,X,Y,W,40,10);g.fill();g.fillStyle='#8a94a8';for(let i=0;i<4;i++)g.fillRect(X+16+i*(W-32)/3-6,Y+8,12,14);
  const gr=g.createLinearGradient(0,Y+40,0,Y+300);gr.addColorStop(0,'rgba(160,240,255,.25)');gr.addColorStop(1,'rgba(160,240,255,0)');g.fillStyle=gr;g.beginPath();g.moveTo(X+10,Y+40);g.lineTo(X+W-10,Y+40);g.lineTo(X+W+60,Y+320);g.lineTo(X-60,Y+320);g.closePath();g.fill();glow(X+W/2,Y+60,200,.6,.1)};
PR.rails=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T,W=(p.w||8)*T;g.fillStyle='#3a2a1a';for(let x=X;x<X+W;x+=22)g.fillRect(x,Y-6,12,6);g.fillStyle='#8a94a8';g.fillRect(X,Y-9,W,3);if(p.bent){g.strokeStyle='#8a94a8';g.lineWidth=3;g.beginPath();g.moveTo(X+W,Y-8);g.quadraticCurveTo(X+W+30,Y+10,X+W+20,Y+50);g.stroke()}};
PR.dimm=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T,W=(p.w||2)*T,Hh=(p.h||8)*T;g.fillStyle=shade(Z.house,.06);rr(g,X,Y-Hh,W,Hh,8);g.fill();for(let i=0;i<Math.floor(Hh/40);i++){g.fillStyle='#0a0c14';rr(g,X+8,Y-Hh+10+i*40,W-16,28,6);g.fill();if(R()<.3){g.fillStyle=Z.win;g.globalAlpha=.5;rr(g,X+12,Y-Hh+14+i*40,W-24,20,4);g.fill();g.globalAlpha=1;glow(X+W/2,Y-Hh+24+i*40,40,.35,.2)}}
  g.fillStyle=Z.trim;g.globalAlpha=.6;for(let i=0;i<Math.floor(W/8);i++)g.fillRect(X+4+i*8,Y-8,4,8);g.globalAlpha=1};
PR.platter=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T,r=p.r||60;for(let i=0;i<(p.n||4);i++){const y=Y-i*14;const pg=g.createLinearGradient(X-r,0,X+r,0);pg.addColorStop(0,'#5a6070');pg.addColorStop(.5,'#c8ccd8');pg.addColorStop(1,'#4a5060');g.fillStyle=pg;g.beginPath();g.ellipse(X,y,r,12,0,0,6.283);g.fill();g.fillStyle='#1a1d24';g.beginPath();g.ellipse(X,y,8,2.5,0,0,6.283);g.fill()}};
PR.bed=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T;g.fillStyle=shade(Z.house,.12);rr(g,X,Y-18,80,14,5);g.fill();g.fillStyle='#c8c0b0';rr(g,X+4,Y-26,26,10,5);g.fill();g.fillStyle=pick(Z.cloth);rr(g,X+28,Y-24,50,8,4);g.fill();g.fillStyle=shade(Z.house,-.2);g.fillRect(X+2,Y-6,4,6);g.fillRect(X+74,Y-6,4,6)};
PR.banner=(g,p,Z,R)=>{const X=p.x*T,Y=p.y*T,W=(p.w||3)*T,Hh=(p.h||3)*T;g.fillStyle=p.col||Z.cloth[0];g.beginPath();g.moveTo(X,Y);g.lineTo(X+W,Y);g.lineTo(X+W,Y+Hh);g.lineTo(X+W/2,Y+Hh-18);g.lineTo(X,Y+Hh);g.closePath();g.globalAlpha=.75;g.fill();g.globalAlpha=1;if(p.txt){g.save();g.translate(X+W/2,Y+Hh/2);g.rotate(-Math.PI/2);txt(g,p.txt,0,4,12,'rgba(0,0,0,.6)');g.restore()}if(p.torn){g.fillStyle='#000';g.beginPath();g.arc(X+W*.7,Y+Hh*.4,8,0,6.283);g.fill()}};

LP.paintProps=(g,r,R)=>{GL=r.glows=[];const Z=LP.ZONES[r.zone];for(const p of r.props||[]){const f=PR[p.k];if(f){g.save();try{f(g,p,Z,R)}catch(e){console.warn(e)}g.restore()}}GL=null};

/* ---------- living things in the background ---------- */
const P=LP.PROPS;
const BIT={elder:{col:'#8fb3d9',hat:'cap'},worker:{col:'#ffb35b',hat:'hard'},clerk:{col:'#b8f0ff',hat:'glasses'},kid:{col:'#ffd27a',hat:'bow',s:.75},archivist:{col:'#c9b896',hat:'hood'},scared:{col:'#9aa6c2'}};
function bitling(g,x,y,o,t,look,blink,shiver){const s=o.s||1,B=BIT[o.role]||BIT.scared;g.save();g.translate(x+(shiver?Math.sin(t*60)*.8:0),y);g.scale(s,s);
  g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(0,0,12,3,0,0,6.283);g.fill();
  g.fillStyle='#1a1d24';g.fillRect(-7,-6,4,6);g.fillRect(3,-6,4,6);
  const bob=Math.sin(t*2.2)*1.2,bg=g.createRadialGradient(-4,-20+bob,2,0,-15+bob,16);bg.addColorStop(0,shade(B.col,.25));bg.addColorStop(1,shade(B.col,-.35));g.fillStyle=bg;g.beginPath();g.ellipse(0,-15+bob,12,13,0,0,6.283);g.fill();
  g.fillStyle='#f4f0e6';const ey=-18+bob,ex=look*2;[[-4.5,ey],[4.5,ey]].forEach(([a,b])=>{g.beginPath();g.ellipse(a+ex,b,3.6,blink?.6:4.4,0,0,6.283);g.fill()});
  if(!blink){g.fillStyle='#0a0c12';[[-4.5,ey],[4.5,ey]].forEach(([a,b])=>{g.beginPath();g.arc(a+ex*1.6,b+.8,2,0,6.283);g.fill()})}
  g.strokeStyle='#1a1d24';g.lineWidth=1.4;g.beginPath();g.moveTo(0,-27+bob);g.lineTo(2,-34+bob);g.stroke();g.fillStyle=Math.sin(t*3)>0?'#7dff9a':'#2a5a3a';g.beginPath();g.arc(2,-35+bob,2,0,6.283);g.fill();
  if(B.hat==='cap'){g.fillStyle='#3a4a6a';g.beginPath();g.ellipse(0,-26+bob,10,4,0,Math.PI,0);g.fill();g.fillRect(-2,-27+bob,12,2)}
  if(B.hat==='hard'){g.fillStyle='#ffd23e';g.beginPath();g.ellipse(0,-25+bob,11,6,0,Math.PI,0);g.fill();g.fillRect(-12,-25+bob,24,2)}
  if(B.hat==='glasses'){g.strokeStyle='#1a1d24';g.lineWidth=1;g.beginPath();g.arc(-4.5,ey,4.6,0,6.283);g.moveTo(9,ey);g.arc(4.5,ey,4.6,0,6.283);g.stroke()}
  if(B.hat==='bow'){g.fillStyle='#ff6b8b';g.beginPath();g.moveTo(4,-27+bob);g.lineTo(10,-31+bob);g.lineTo(10,-24+bob);g.closePath();g.moveTo(4,-27+bob);g.lineTo(-2,-31+bob);g.lineTo(-2,-24+bob);g.fill()}
  if(B.hat==='hood'){g.fillStyle='#4a3a2a';g.beginPath();g.ellipse(0,-20+bob,14,15,0,Math.PI*1.05,Math.PI*1.95);g.fill()}
  g.restore()}
LP.bitling=bitling;
P.npc=s=>({kind:'npc',x:s.tx*T+15,y:(s.ty+1)*T,t:Math.random()*9,o:s,i:0,layer:'back',blinkT:2,
  lines(){const d=this.o.req&&LP.save.boss[this.o.req]&&this.o.after?this.o.after:this.o.say;return d},
  update(dt){this.t+=dt;this.blinkT-=dt;if(this.blinkT<-.12)this.blinkT=rand(1.5,4);this.near=Math.abs(H.x+9-this.x)<40&&Math.abs(H.y+H.h-this.y)<20;
    if(this.near&&I.hit.down&&H.ground&&!LP.cs&&!H.dead){const L=this.lines(),k=this.o.req&&LP.save.boss[this.o.req]?'a':'s';this.i=this.k===k?this.i:0;this.k=k;LP.showLore(this.o.name+'\n'+L[Math.min(this.i,L.length-1)]);this.i=(this.i+1)%L.length;LP.sfx('blip')}},
  draw(g){const scared=!(this.o.req&&LP.save.boss[this.o.req]);bitling(g,this.x,this.y,this.o,this.t,Math.sign(H.x-this.x),this.blinkT<0,scared&&this.o.shiver);LP.light(this.x,this.y-20,90,.5);
    if(this.near&&!LP.cs){g.font='12px Silkscreen,monospace';g.textAlign='center';g.fillStyle='#ffe6b0';g.fillText('↓ TALK',this.x,this.y-48);g.textAlign='left'}}});
P.steam=s=>({kind:'steam',x:s.tx*T+15,y:(s.ty+1)*T,t:0,layer:'back',update(dt){this.t+=dt;if(Math.random()<.35)LP.part({x:this.x+rand(-4,4),y:this.y-4,vx:rand(-10,10),vy:-rand(40,90),life:rand(.8,1.4),col:'rgba(220,210,200,.18)',s:rand(6,12),drag:.3})},draw(){}});
P.spark=s=>({kind:'spark',x:s.tx*T+15,y:s.ty*T,t:rand(0,3),layer:'back',update(dt){this.t-=dt;if(this.t<=0){this.t=rand(.6,2.4);LP.sfx&&Math.random()<.3&&LP.sfx('zap');for(let i=0;i<8;i++)LP.part({x:this.x,y:this.y,vx:rand(-120,120),vy:rand(-80,60),g:700,life:.4,col:pick(['#fff3b0','#7df0ff']),s:2,k:'spark'});LP.light(this.x,this.y,80,1)}},draw(){}});
P.dripfx=s=>({kind:'dripfx',x:s.tx*T+15,y:s.ty*T,t:rand(0,2),layer:'back',update(dt){this.t-=dt;if(this.t<=0){this.t=rand(1,2.6);LP.part({x:this.x,y:this.y,vy:60,g:900,life:.9,col:'rgba(127,216,255,.7)',s:3})}},draw(){}});
})();
