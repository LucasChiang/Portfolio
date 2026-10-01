/* LC-2030 Die Cards — an original collectible card set for lucaschiang.com.
   All names, frames, art and stats are original. Cards are drawn procedurally. */
(function(){
'use strict';

/* ---------------- data ---------------- */
const RAR={
  C:{name:'Common',      col:'#9aa0b8',w:60},
  U:{name:'Uncommon',    col:'#5b8cff',w:28},
  H:{name:'Holo',        col:'#d77bff',w:10},
  W:{name:'Wafer-Scale', col:'#ffcf4d',w:2}
};
const CARDS=[
 {id:'res',   n:'Resistor',               r:'C',t:'Component · Passive',     a:'res',   s:[['Value','220 Ω'],['Tolerance','±1%'],['Power','¼ W']],                       x:'Says no to current. Politely, and in four colored bands.'},
 {id:'cap',   n:'Capacitor',              r:'C',t:'Component · Passive',     a:'cap',   s:[['Value','100 µF'],['Rating','16 V'],['ESR','0.08 Ω']],                     x:'Stores charge for later, like a battery with commitment issues.'},
 {id:'ind',   n:'Inductor',               r:'C',t:'Component · Passive',     a:'ind',   s:[['Value','10 µH'],['Current','2 A'],['DCR','25 mΩ']],                        x:'Hates change. Especially change in current.'},
 {id:'diode', n:'Diode',                  r:'C',t:'Component · Semiconductor',a:'diode',s:[['Forward','0.7 V'],['Reverse','100 V'],['Current','1 A']],                  x:'One-way street. No U-turns.'},
 {id:'led',   n:'LED',                    r:'C',t:'Component · Optoelectronic',a:'led', s:[['Forward','2.1 V'],['Current','20 mA'],['Wavelength','620 nm']],             x:'Turns electrons into photons and attention.'},
 {id:'ant',   n:'Antenna',                r:'C',t:'Component · RF',          a:'ant',   s:[['Band','2.4 GHz'],['Gain','2 dBi'],['Type','PCB meander']],                  x:'A trace that learned to talk to the air.'},
 {id:'probe', n:'Four-Point Probe',       r:'C',t:'Lab Technique',           a:'probe', s:[['Probes','4'],['Measures','Sheet resistance'],['Used on','10 CMO films']],   x:'Two needles push current, two listen. Contact resistance never gets a vote.'},
 {id:'npn',   n:'NPN Transistor',         r:'C',t:'Component · Semiconductor',a:'npn',  s:[['Gain β','100'],['V_CE max','40 V'],['I_C max','200 mA']],                 x:'A small current at the base, a big decision at the collector.'},
 {id:'opamp', n:'Op-Amp',                 r:'U',t:'Component · Analog IC',   a:'opamp', s:[['Open-loop gain','100 dB'],['GBW','1 MHz'],['Supply','±15 V']],             x:'Does whatever the feedback network tells it to. Very coachable.'},
 {id:'mos',   n:'MOSFET',                 r:'U',t:'Component · Power',       a:'mos',   s:[['R_DS(on)','12 mΩ'],['V_DS','30 V'],['Gate','Logic-level']],               x:'A switch with no moving parts and a very thin oxide.'},
 {id:'xtal',  n:'Crystal',                r:'U',t:'Component · Timing',      a:'xtal',  s:[['Frequency','32.768 kHz'],['Stability','±20 ppm'],['Load','12.5 pF']],     x:'Quartz that keeps perfect time, 2¹⁵ ticks per second.'},
 {id:'vreg',  n:'Voltage Regulator',      r:'U',t:'Component · Power IC',    a:'vreg',  s:[['In','5.0 V'],['Out','3.3 V'],['Dropout','250 mV']],                      x:'Takes whatever the rail throws at it and hands back a calm 3.3 V.'},
 {id:'eeprom',n:'EEPROM',                 r:'U',t:'Component · Memory IC',   a:'eeprom',s:[['Size','256 Kbit'],['Endurance','1M writes'],['Retention','200 yrs']],      x:'Remembers everything, even with the power off.'},
 {id:'timer', n:'Timer IC',               r:'U',t:'Component · Mixed-Signal',a:'timer', s:[['Pins','8'],['Modes','Astable · Mono'],['Supply','4.5–16 V']],             x:'Blinks, beeps and debounces. The utility player of the parts bin.'},
 {id:'pld',   n:'Pulsed Laser Deposition',r:'U',t:'Lab Technique',           a:'pld',   s:[['Target','CaMnO₃'],['Samples','10 films'],['Site','Towson Univ.']],       x:'Hit a target with a laser and catch the plume on a substrate.'},
 {id:'orbital',n:'Propulsion DAQ',        r:'U',t:'Project · Purdue Orbital',a:'rocket',s:[['Team','Propulsion'],['Focus','Data acquisition'],['Since','Sep 2026']],    x:'Every burn is a dataset waiting to be logged.'},
 {id:'stars', n:'STARS Chip Design',      r:'U',t:'Project · Purdue SoCET',  a:'stars', s:[['HDL','SystemVerilog'],['Focus','Digital logic'],['Since','Aug 2026']],      x:'Where the gates in these cards actually get designed.'},
 {id:'fpga',  n:'FPGA',                   r:'H',t:'Component · Programmable Logic',a:'fpga',s:[['Logic cells','25K'],['Block RAM','1.8 Mbit'],['Package','BGA-256']],x:'Hardware you can rewrite. Every skill, reconfigurable.'},
 {id:'mcu',   n:'Microcontroller',        r:'H',t:'Component · Processor',   a:'mcu',   s:[['Core','32-bit'],['Clock','48 MHz'],['Flash','256 KB']],                   x:'The home chip. Every trace on this board leads back here.'},
 {id:'teg',   n:'TEG Wearable Platform',  r:'H',t:'Project · UMBC Research', a:'teg',   s:[['Trials','10'],['TEG configs','4'],['Published','Oxford JSS, 2026']],      x:'Body heat in, electrocardiograph pulse out. Heat sinks made the difference.'},
 {id:'film',  n:'CaMnO₃ Thin Film',       r:'H',t:'Project · Towson Research',a:'film', s:[['Method','Pulsed laser dep.'],['Clean room','ISO 7'],['Fluorinated','5+ films']],x:'A perovskite only a few hundred atoms thick, mapped with XRD.'},
 {id:'robot', n:'Team 18996 Robot',       r:'H',t:'Project · FIRST Tech Challenge',a:'robot',s:[['Subsystems','30+'],['Prototypes','20+'],['Raised','$10,000+']],    x:'Six seasons of design meetings, wiring and intake iterations.'},
 {id:'exo',   n:'TOI 5868.01',            r:'W',t:'Project · GMU Exoplanet Validation',a:'exo',s:[['Images','100+'],['Tools','AstroImageJ · Python'],['Published','GMU MARS, 2024']],x:'A dip in starlight, followed up from the ground. Likely a real planet.'},
 {id:'wafer', n:'LC-2030 Wafer',          r:'W',t:'Special · Full Wafer',    a:'wafer', s:[['Diameter','300 mm'],['Dies','Every chip on this board'],['Rev','A']],      x:'The whole board, before it was diced. Only collectors see this one.'}
];
CARDS.forEach((c,i)=>{c.no=i+1});
const BY=Object.fromEntries(CARDS.map(c=>[c.id,c]));
const THEME={home:['mcu','eeprom','stars','timer'],research:['vreg','teg','film','pld','probe','exo'],experience:['eeprom','orbital','robot','stars'],
  skills:['fpga','opamp','mos','npn'],timeline:['xtal','timer','ind'],play:['led','res','diode','robot'],contact:['ant','cap','ind'],resume:['wafer','cap','res','mcu']};

/* ---------------- storage ---------------- */
let mem={};
function load(){try{const v=JSON.parse(localStorage.getItem('lc-cards')||'{}');if(v&&typeof v==='object')mem=v}catch(e){}}
function save(){try{localStorage.setItem('lc-cards',JSON.stringify(mem))}catch(e){}}
load();
const owned=()=>CARDS.filter(c=>mem[c.id]>0).length;
const listeners=[];function changed(){listeners.forEach(f=>{try{f(owned(),CARDS.length)}catch(e){}})}

/* ---------------- art ---------------- */
const artCache={};
function art(c){
  if(artCache[c.id])return artCache[c.id];
  const W=480,H=300,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
  const hue={C:'#2b3150',U:'#1b2f6b',H:'#3c1d5c',W:'#4a3608'}[c.r];
  const bg=g.createRadialGradient(W*.5,H*.45,10,W*.5,H*.5,W*.7);bg.addColorStop(0,hue);bg.addColorStop(1,'#07080f');g.fillStyle=bg;g.fillRect(0,0,W,H);
  g.strokeStyle='rgba(255,255,255,.05)';g.lineWidth=1;for(let x=0;x<W;x+=16){g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke()}for(let y=0;y<H;y+=16){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke()}
  const gold='#e0a84a',ink='#ecebf5',cy=H/2,cx=W/2;
  g.lineCap='round';g.lineJoin='round';
  const L=(pts,col,w)=>{g.strokeStyle=col||ink;g.lineWidth=w||5;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()};
  const lead=()=>{L([[40,cy],[150,cy]],gold,7);L([[330,cy],[440,cy]],gold,7)};
  const glow=(col)=>{g.shadowColor=col;g.shadowBlur=24};const noglow=()=>{g.shadowBlur=0};
  switch(c.a){
   case 'res':lead();g.fillStyle='#d9c08a';g.beginPath();g.roundRect(150,cy-34,180,68,30);g.fill();
     ['#d33','#d33','#7a4a1e','#c9a227'].forEach((col,i)=>{g.fillStyle=col;g.fillRect(185+i*(i===3?36:30),cy-34,16,68)});break;
   case 'cap':L([[40,cy],[205,cy]],gold,7);L([[275,cy],[440,cy]],gold,7);g.fillStyle=ink;g.fillRect(205,cy-70,14,140);g.strokeStyle=ink;g.lineWidth=14;g.beginPath();g.arc(330,cy,70,Math.PI*.78,Math.PI*1.22);g.stroke();
     g.font='700 34px monospace';g.fillStyle=gold;g.fillText('+',165,cy-50);break;
   case 'ind':L([[40,cy],[130,cy]],gold,7);L([[350,cy],[440,cy]],gold,7);g.strokeStyle=ink;g.lineWidth=7;for(let i=0;i<4;i++){g.beginPath();g.arc(157+i*55,cy,27,Math.PI,0);g.stroke()}break;
   case 'diode':lead();g.fillStyle=ink;g.beginPath();g.moveTo(170,cy-60);g.lineTo(170,cy+60);g.lineTo(290,cy);g.closePath();g.fill();g.fillRect(292,cy-60,14,120);L([[150,cy],[170,cy]],gold,7);L([[306,cy],[330,cy]],gold,7);break;
   case 'led':lead();glow('#ff6b6f');g.fillStyle='#ff6b6f';g.beginPath();g.moveTo(170,cy-55);g.lineTo(170,cy+55);g.lineTo(280,cy);g.closePath();g.fill();g.fillRect(282,cy-55,13,110);noglow();
     L([[150,cy],[170,cy]],gold,7);L([[295,cy],[330,cy]],gold,7);[[0,0],[34,22]].forEach(([dx,dy])=>{L([[255+dx,cy-70+dy],[300+dx,cy-110+dy]],'#ffcf4d',5);L([[300+dx,cy-110+dy],[284+dx,cy-106+dy]],'#ffcf4d',5);L([[300+dx,cy-110+dy],[296+dx,cy-94+dy]],'#ffcf4d',5)});break;
   case 'ant':g.strokeStyle=gold;g.lineWidth=9;g.beginPath();g.moveTo(60,H-50);g.lineTo(60,90);for(let i=0;i<7;i++){const x=60+i*50;g.lineTo(x+50,90);g.lineTo(x+50,i%2?90:200);g.lineTo(x+50,90)}g.stroke();
     g.beginPath();g.moveTo(60,H-50);for(let i=0;i<7;i++){g.lineTo(85+i*50,i%2?120:210);}g.stroke();
     g.strokeStyle='rgba(110,231,255,.7)';g.lineWidth=4;for(let r=1;r<4;r++){g.beginPath();g.arc(420,60,r*28,Math.PI*.6,Math.PI*1.1);g.stroke()}break;
   case 'probe':g.fillStyle='#2d3a5a';g.fillRect(40,cy+50,W-80,40);g.fillStyle='#4a6ab0';g.fillRect(40,cy+50,W-80,10);
     for(let i=0;i<4;i++){const x=120+i*80;g.fillStyle='#c9ced8';g.fillRect(x-6,40,12,cy+10-40);g.beginPath();g.moveTo(x-6,cy+10);g.lineTo(x+6,cy+10);g.lineTo(x,cy+50);g.fill();g.fillStyle=i===0||i===3?'#ff6b6f':'#3fdc9c';g.fillRect(x-14,40,28,24)}
     g.font='600 20px monospace';g.fillStyle=ink;g.fillText('I',100,30);g.fillText('V',196,30);g.fillText('V',276,30);g.fillText('I',356,30);break;
   case 'npn':g.strokeStyle=ink;g.lineWidth=6;g.beginPath();g.arc(cx,cy,92,0,6.283);g.stroke();g.fillStyle=ink;g.fillRect(cx-30,cy-52,12,104);L([[60,cy],[cx-30,cy]],gold,7);
     L([[cx-18,cy-24],[cx+50,cy-80],[cx+50,cy-130]],gold,7);L([[cx-18,cy+24],[cx+50,cy+80],[cx+50,cy+130]],gold,7);g.fillStyle=gold;g.beginPath();g.moveTo(cx+52,cy+82);g.lineTo(cx+22,cy+76);g.lineTo(cx+40,cy+54);g.fill();break;
   case 'opamp':g.strokeStyle=ink;g.lineWidth=7;g.beginPath();g.moveTo(150,40);g.lineTo(150,H-40);g.lineTo(340,cy);g.closePath();g.stroke();L([[40,95],[150,95]],gold,7);L([[40,H-95],[150,H-95]],gold,7);L([[340,cy],[440,cy]],gold,7);
     g.font='800 44px monospace';g.fillStyle=ink;g.fillText('−',168,110);g.fillText('+',168,H-78);break;
   case 'mos':g.fillStyle=ink;g.fillRect(190,70,12,160);[[90,120],[140,170],[190,220]].forEach(([a])=>{});for(let i=0;i<3;i++)g.fillRect(222,72+i*58,12,40);
     L([[60,200],[190,200]],gold,7);L([[234,92],[330,92],[330,40]],gold,7);L([[234,208],[330,208],[330,260]],gold,7);L([[234,150],[330,150],[330,208]],gold,7);
     g.fillStyle=gold;g.beginPath();g.moveTo(236,150);g.lineTo(266,136);g.lineTo(266,164);g.fill();break;
   case 'xtal':lead();g.fillStyle=ink;g.fillRect(170,cy-70,12,140);g.fillRect(298,cy-70,12,140);g.strokeStyle='#c9ced8';g.lineWidth=6;g.strokeRect(202,cy-48,76,96);L([[150,cy],[170,cy]],gold,7);L([[310,cy],[330,cy]],gold,7);
     g.strokeStyle='rgba(255,107,111,.8)';g.lineWidth=3;g.beginPath();for(let x=60;x<420;x+=2){const y=50+Math.sin(x/12)*14;x===60?g.moveTo(x,y):g.lineTo(x,y)}g.stroke();break;
   case 'vreg':g.fillStyle='#1d1f2b';g.fillRect(150,70,180,120);g.fillStyle='#c9ced8';g.fillRect(170,30,140,40);g.beginPath();g.arc(240,48,12,0,6.283);g.fillStyle='#07080f';g.fill();
     ['IN','GND','OUT'].forEach((t,i)=>{L([[190+i*50,190],[190+i*50,260]],gold,10);g.font='600 18px monospace';g.fillStyle=ink;g.textAlign='center';g.fillText(t,190+i*50,285)});
     g.font='800 30px monospace';g.fillStyle=ink;g.fillText('3V3',240,140);g.textAlign='left';break;
   case 'eeprom':for(let i=0;i<8;i++)for(let j=0;j<5;j++){const on=(i*7+j*3)%5<2;g.fillStyle=on?'#d77bff':'rgba(215,123,255,.18)';g.fillRect(80+i*42,50+j*42,32,32)}
     g.font='600 18px monospace';g.fillStyle=ink;g.fillText('0x00',30,74);g.fillText('0x20',30,242);break;
   case 'timer':g.fillStyle='#1d1f2b';g.fillRect(150,60,180,180);g.fillStyle='#07080f';g.beginPath();g.arc(240,60,18,0,Math.PI);g.fill();
     for(let i=0;i<4;i++){g.fillStyle='#c9ced8';g.fillRect(120,80+i*42,30,14);g.fillRect(330,80+i*42,30,14)}
     g.strokeStyle='#ffcf4d';g.lineWidth=4;g.beginPath();g.moveTo(170,200);[[200,200],[200,150],[240,150],[240,200],[280,200],[280,150],[310,150]].forEach(p=>g.lineTo(p[0],p[1]));g.stroke();break;
   case 'pld':g.fillStyle='#3a3f58';g.fillRect(70,190,120,60);g.fillStyle='#c9ced8';g.fillRect(300,60,140,24);
     glow('#3fdc9c');L([[0,40],[130,190]],'#3fdc9c',6);noglow();
     const pg=g.createRadialGradient(140,190,10,230,120,170);pg.addColorStop(0,'rgba(255,207,77,.95)');pg.addColorStop(1,'rgba(255,107,111,0)');g.fillStyle=pg;g.beginPath();g.ellipse(230,140,170,70,-.45,0,6.283);g.fill();break;
   case 'rocket':g.fillStyle=ink;g.beginPath();g.moveTo(130,50);g.quadraticCurveTo(160,90,160,180);g.lineTo(100,180);g.quadraticCurveTo(100,90,130,50);g.fill();
     g.fillStyle='#ff6b6f';g.beginPath();g.moveTo(100,150);g.lineTo(78,200);g.lineTo(100,190);g.fill();g.beginPath();g.moveTo(160,150);g.lineTo(182,200);g.lineTo(160,190);g.fill();
     glow('#ffcf4d');g.fillStyle='#ffcf4d';g.beginPath();g.moveTo(110,185);g.lineTo(130,250);g.lineTo(150,185);g.fill();noglow();
     g.strokeStyle='#3fdc9c';g.lineWidth=4;g.beginPath();for(let x=230;x<440;x+=4){const y=230-Math.min(170,Math.pow((x-230)/14,1.7));x===230?g.moveTo(x,y):g.lineTo(x,y)}g.stroke();g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=2;g.strokeRect(220,50,226,190);break;
   case 'stars':g.fillStyle='#14172a';g.fillRect(60,40,360,220);g.font='500 19px monospace';
     [['module','#d77bff'],['  always_ff @(posedge clk)','#5b8cff'],['    q <= d;','#ecebf5'],['  assign y = a ^ b;','#3fdc9c'],['endmodule','#d77bff']].forEach((l,i)=>{g.fillStyle=l[1];g.fillText(l[0],80,82+i*38)});break;
   case 'fpga':for(let i=0;i<6;i++)for(let j=0;j<4;j++){g.fillStyle='rgba(63,220,156,.2)';g.strokeStyle='#3fdc9c';g.lineWidth=2;g.fillRect(70+i*58,45+j*55,40,38);g.strokeRect(70+i*58,45+j*55,40,38)}
     g.strokeStyle='rgba(255,207,77,.7)';g.lineWidth=3;for(let i=0;i<7;i++){g.beginPath();g.moveTo(60+i*58+5,35);g.lineTo(60+i*58+5,H-30);g.stroke()}for(let j=0;j<5;j++){g.beginPath();g.moveTo(60,40+j*55);g.lineTo(W-60,40+j*55);g.stroke()}break;
   case 'mcu':g.fillStyle='#1d1f2b';g.fillRect(150,60,180,180);for(let i=0;i<9;i++){g.fillStyle='#c9ced8';g.fillRect(162+i*19,40,8,20);g.fillRect(162+i*19,240,8,20);g.fillRect(130,72+i*19,20,8);g.fillRect(330,72+i*19,20,8)}
     g.font='800 34px sans-serif';g.textAlign='center';g.fillStyle=ink;g.fillText('LC',240,160);g.font='500 14px monospace';g.fillStyle='rgba(236,235,245,.6)';g.fillText('2030 · MCU',240,184);g.textAlign='left';break;
   case 'teg':g.fillStyle='#e9e4da';g.fillRect(110,80,260,20);g.fillRect(110,200,260,20);for(let i=0;i<8;i++){g.fillStyle=i%2?'#5b8cff':'#ff6b6f';g.fillRect(122+i*31,100,18,100)}
     L([[110,60],[90,40]],'#ff6b6f',5);L([[150,60],[130,40]],'#ff6b6f',5);g.font='600 18px monospace';g.fillStyle='#ff6b6f';g.fillText('HOT · skin',390,96);g.fillStyle='#5b8cff';g.fillText('COLD · air',390,214);
     g.strokeStyle='#3fdc9c';g.lineWidth=4;g.beginPath();for(let x=110;x<370;x+=3){const k=(x-110)%86;const y=262-(k>40&&k<46?(k-40)*8:k>=46&&k<50?40-(k-46)*14:0);x===110?g.moveTo(x,y):g.lineTo(x,y)}g.stroke();break;
   case 'film':['#3a3f58','#6b56a8','#d77bff'].forEach((col,i)=>{g.fillStyle=col;g.fillRect(70,200-i*40,340,i?40:70)});
     for(let i=0;i<10;i++)for(let j=0;j<2;j++){g.fillStyle='#ffcf4d';g.beginPath();g.arc(88+i*34,132+j*20,5,0,6.283);g.fill()}
     g.strokeStyle='rgba(110,231,255,.8)';g.lineWidth=3;L([[40,40],[200,120]],'rgba(110,231,255,.8)',3);L([[280,120],[440,40]],'rgba(110,231,255,.8)',3);g.font='600 16px monospace';g.fillStyle=ink;g.fillText('XRD',210,40);break;
   case 'robot':g.fillStyle='#2d3350';g.fillRect(140,60,200,180);g.strokeStyle='#ff6b6f';g.lineWidth=4;g.strokeRect(140,60,200,180);
     [[118,70],[342,70],[118,180],[342,180]].forEach(([x,y])=>{g.fillStyle='#14152a';g.fillRect(x,y,22,52);g.fillStyle='#9aa0b8';for(let k=0;k<5;k++)g.fillRect(x+3,y+4+k*10,16,4)});
     g.fillStyle='#ffcf4d';g.fillRect(180,40,120,26);g.fillStyle='#5b8cff';g.fillRect(200,110,80,60);g.font='700 22px monospace';g.fillStyle=ink;g.textAlign='center';g.fillText('18996',240,215);g.textAlign='left';break;
   case 'exo':glow('#ffcf4d');g.fillStyle='#ffe9a8';g.beginPath();g.arc(110,90,46,0,6.283);g.fill();noglow();g.fillStyle='#07080f';g.beginPath();g.arc(128,98,13,0,6.283);g.fill();
     g.strokeStyle='rgba(255,255,255,.2)';g.lineWidth=1;g.beginPath();g.moveTo(190,60);g.lineTo(190,250);g.lineTo(450,250);g.stroke();
     for(let x=200;x<440;x+=7){const d=x>290&&x<350?(x<300?(x-290)/10:x>340?(350-x)/10:1)*36:0;g.fillStyle='#6ee7ff';g.beginPath();g.arc(x,110+d+(Math.sin(x*7.1)*5),3.4,0,6.283);g.fill()}
     g.font='600 15px monospace';g.fillStyle='rgba(236,235,245,.6)';g.fillText('flux',200,80);g.fillText('time →',380,272);break;
   case 'wafer':{const r=130;const wg=g.createRadialGradient(cx-40,cy-40,10,cx,cy,r);wg.addColorStop(0,'#c8d0ff');wg.addColorStop(.5,'#8a7ad8');wg.addColorStop(1,'#3b2f6e');
     g.fillStyle=wg;g.beginPath();g.arc(cx,cy,r,0,6.283);g.fill();g.save();g.beginPath();g.arc(cx,cy,r-6,0,6.283);g.clip();
     for(let x=cx-r;x<cx+r;x+=22)for(let y=cy-r;y<cy+r;y+=22){g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=1;g.strokeRect(x,y,20,20);if(Math.abs(x-cx+11)<12&&Math.abs(y-cy+11)<12){g.fillStyle='#ffcf4d';g.fillRect(x,y,20,20)}}g.restore();
     g.fillStyle='#07080f';g.fillRect(cx-16,cy+r-6,32,10);break;}
  }
  noglow();
  const url=cv.toDataURL('image/png');artCache[c.id]=url;return url;
}

/* ---------------- card back (SVG) ---------------- */
function backSVG(){
  const pins=[];for(let i=0;i<7;i++){const t=66+i*18;pins.push(`<rect x="${t-3}" y="96" width="6" height="14" rx="1"/><rect x="${t-3}" y="230" width="6" height="14" rx="1"/><rect x="40" y="${t+56}" width="14" height="6" rx="1"/><rect x="170" y="${t+56}" width="14" height="6" rx="1"/>`)}
  const traces=[];
  const dirs=[[0,-1],[0,1],[-1,0],[1,0]];
  for(let i=0;i<7;i++){const t=66+i*18;
    traces.push(`M${t} 96 V${70-((i*13)%30)} H${t+(i%2?14:-14)} V10`,`M${t} 244 V${270+((i*11)%30)} H${t+(i%2?-14:14)} V330`,
      `M40 ${t+59} H${22-((i*7)%10)} V${t+59+(i%2?12:-12)} H6`,`M184 ${t+59} H${202+((i*9)%10)} V${t+59+(i%2?-12:12)} H218`)}
  return `<svg viewBox="0 0 224 314" preserveAspectRatio="none" aria-hidden="true">
  <defs><pattern id="lcHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#0b0d18"/><rect width="1.4" height="6" fill="rgba(224,168,74,.12)"/></pattern>
  <linearGradient id="lcDie" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1c2140"/><stop offset=".55" stop-color="#121528"/><stop offset="1" stop-color="#2a1d45"/></linearGradient>
  <linearGradient id="lcSheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6ee7ff" stop-opacity=".0"/><stop offset=".5" stop-color="#6ee7ff" stop-opacity=".22"/><stop offset="1" stop-color="#d77bff" stop-opacity="0"/></linearGradient></defs>
  <rect width="224" height="314" fill="#07080f"/><rect x="6" y="6" width="212" height="302" rx="6" fill="url(#lcHatch)" stroke="#e0a84a" stroke-width="1.5"/>
  <g fill="none" stroke="#e0a84a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity=".85">${traces.map(d=>`<path d="${d}"/>`).join('')}</g>
  <g fill="#c9ced8">${pins.join('')}</g>
  <rect x="52" y="108" width="120" height="124" rx="4" fill="url(#lcDie)" stroke="#5b8cff" stroke-width="1.2"/>
  <g stroke="rgba(110,231,255,.25)" stroke-width=".8">${Array.from({length:9},(_,i)=>`<line x1="58" y1="${116+i*13}" x2="166" y2="${116+i*13}"/>`).join('')}</g>
  <rect x="62" y="118" width="100" height="104" rx="2" fill="none" stroke="#d77bff" stroke-opacity=".5" stroke-dasharray="3 3"/>
  <circle cx="64" cy="120" r="3" fill="#ecebf5" opacity=".8"/>
  <text x="112" y="182" text-anchor="middle" font-family="Unbounded, 'Arial Black', sans-serif" font-weight="800" font-size="46" fill="#ecebf5" letter-spacing="-2">LC</text>
  <text x="112" y="204" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="8" fill="#9aa0b8" letter-spacing="2">LC-2030 · DIE CARDS</text>
  <g fill="none" stroke="#ffcf4d" stroke-width="1.2" opacity=".8"><path d="M20 24 h12 M26 18 v12"/><path d="M192 290 h12 M198 284 v12"/></g>
  <rect x="6" y="6" width="212" height="302" rx="6" fill="url(#lcSheen)"/>
  </svg>`;
}
const BACK=backSVG();

/* ---------------- styles ---------------- */
const css=`
.dcard{--rc:#9aa0b8;position:relative;width:224px;aspect-ratio:224/314;perspective:1000px;flex:none;user-select:none;-webkit-user-select:none}
.dcard .flip{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .7s cubic-bezier(.3,.9,.3,1)}
.dcard.facedown .flip{transform:rotateY(180deg)}
.dcard .face,.dcard .back{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:10px;overflow:hidden}
.dcard .back{transform:rotateY(180deg);box-shadow:0 10px 30px rgba(0,0,0,.5)}
.dcard .back svg{width:100%;height:100%;display:block}
.dcard .face{background:#0c0e1a;border:2px solid var(--rc);box-shadow:0 10px 30px rgba(0,0,0,.5),inset 0 0 0 4px #0c0e1a,inset 0 0 0 5px color-mix(in srgb,var(--rc) 40%,transparent);display:flex;flex-direction:column;padding:10px 10px 8px;font-family:"Figtree",system-ui,sans-serif;color:#ecebf5}
.dc-top{display:flex;justify-content:space-between;align-items:baseline;gap:6px}
.dc-name{font:800 .82rem/1.15 "Unbounded","Arial Black",sans-serif;letter-spacing:-.01em}
.dc-no{font:500 .6rem "JetBrains Mono",monospace;color:#8e8fab;white-space:nowrap}
.dc-art{margin-top:7px;aspect-ratio:480/300;border:1px solid color-mix(in srgb,var(--rc) 70%,transparent);border-radius:3px;overflow:hidden;position:relative;background:#07080f}
.dc-art img{width:100%;height:100%;display:block}
.dc-art::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 60%,rgba(0,0,0,.35));pointer-events:none}
.dc-type{display:flex;justify-content:space-between;align-items:center;gap:6px;margin-top:6px;font:500 .56rem/1.2 "JetBrains Mono",monospace;letter-spacing:.05em;text-transform:uppercase;color:#9aa0b8}
.dc-rar{display:inline-flex;align-items:center;gap:4px;color:var(--rc);white-space:nowrap}
.dc-rar i{width:7px;height:7px;background:var(--rc);transform:rotate(45deg);box-shadow:0 0 6px var(--rc)}
.dc-specs{margin:7px 0 0;display:grid;gap:2px}
.dc-specs div{display:flex;justify-content:space-between;gap:8px;font:500 .62rem/1.45 "JetBrains Mono",monospace;border-bottom:1px dashed rgba(255,255,255,.08)}
.dc-specs dt{color:#8e8fab}.dc-specs dd{margin:0;text-align:right;color:#ecebf5}
.dc-text{margin:6px 0 0;font-size:.66rem;line-height:1.35;color:#c9c8da;font-style:italic;flex:1}
.dc-foot{display:flex;justify-content:space-between;font:500 .52rem "JetBrains Mono",monospace;letter-spacing:.08em;color:#6c6e8a;margin-top:4px}
.dcard .shine{position:absolute;inset:0;border-radius:10px;pointer-events:none;opacity:0;mix-blend-mode:color-dodge;transition:opacity .3s}
.dcard.r-H .shine,.dcard.r-W .shine{opacity:.55;background:
  radial-gradient(circle at var(--mx,50%) var(--my,30%),rgba(255,255,255,.55),transparent 38%),
  repeating-linear-gradient(115deg,rgba(255,0,128,.35) 0%,rgba(255,200,0,.35) 6%,rgba(0,255,170,.35) 12%,rgba(0,160,255,.35) 18%,rgba(190,0,255,.35) 24%);
  background-size:100% 100%,240% 240%;background-position:center,var(--bx,50%) var(--by,50%)}
.dcard.r-W .shine{opacity:.7;background:
  radial-gradient(circle at var(--mx,50%) var(--my,30%),rgba(255,240,200,.7),transparent 40%),
  repeating-radial-gradient(circle at 50% 120%,rgba(255,207,77,.35) 0 6px,rgba(215,123,255,.3) 6px 12px,rgba(110,231,255,.3) 12px 18px);background-size:100% 100%,200% 200%;background-position:center,var(--bx,50%) var(--by,50%)}
.dcard.r-W .face{background:linear-gradient(160deg,#1c1606,#0c0e1a 40%,#1a1030)}
.dcard .newb{position:absolute;top:-8px;right:-8px;z-index:3;font:800 .6rem "Unbounded",sans-serif;background:#3fdc9c;color:#04130c;padding:4px 7px;border-radius:3px;transform:rotate(8deg);box-shadow:0 4px 12px rgba(0,0,0,.4)}
.dcard.dup .newb{background:#9aa0b8}
.dcard{transition:transform .15s ease-out}
.dslot{width:224px;aspect-ratio:224/314;border:1.5px dashed #2c3050;border-radius:10px;display:grid;place-items:center;text-align:center;color:#4b4f70;font:500 .7rem "JetBrains Mono",monospace;flex:none}
.dslot b{display:block;font:800 1.4rem "Unbounded",sans-serif;color:#2c3050}

#lcCards{position:fixed;inset:0;z-index:60;background:rgba(5,6,11,.92);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;flex-direction:column;color:#ecebf5;font-family:"Figtree",system-ui,sans-serif}
#lcCards[hidden]{display:none!important}
.lcc-top{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:calc(14px + env(safe-area-inset-top,0px)) 18px 12px;border-bottom:1px solid #262a45}
.lcc-top h2{margin:0;font:800 1.15rem "Unbounded",sans-serif;letter-spacing:-.01em}
.lcc-top .sub{font:500 .72rem "JetBrains Mono",monospace;color:#8e8fab;letter-spacing:.06em}
.lcc-top .sp{flex:1}
.lcc-btn{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 14px;border:1px solid #262a45;border-radius:4px;font:500 .78rem "JetBrains Mono",monospace;white-space:nowrap}
.lcc-btn:hover{border-color:#ffcf4d;color:#ffcf4d}.lcc-btn:focus-visible{outline:2px solid #ffcf4d}
.lcc-btn.pri{background:#ecebf5;color:#05060b;border-color:#ecebf5;font:700 .78rem "Unbounded",sans-serif}
.lcc-btn.pri:hover{background:#ffcf4d;border-color:#ffcf4d;color:#14152a}
.lcc-body{flex:1;overflow:auto;padding:22px 18px 40px;min-height:0}
.lcc-grid{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;max-width:1240px;margin:0 auto}
.lcc-grid .dcard,.lcc-grid .dslot{width:clamp(140px,22vw,190px)}
.lcc-grid .dcard{cursor:pointer;transition:transform .2s}
.lcc-grid .dcard:hover{transform:translateY(-4px)}
.lcc-prog{height:6px;background:#1a1d33;border-radius:3px;overflow:hidden;width:160px}
.lcc-prog i{display:block;height:100%;background:linear-gradient(90deg,#5b8cff,#d77bff,#ffcf4d)}
.lcc-filter{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:0 auto 18px}
.lcc-filter button{all:unset;cursor:pointer;font:500 .72rem "JetBrains Mono",monospace;padding:5px 10px;border:1px solid #262a45;border-radius:20px;color:#8e8fab}
.lcc-filter button.on{color:#ecebf5;border-color:#ecebf5}
.lcc-filter button:focus-visible{outline:2px solid #ffcf4d}
.lcc-zoom{position:fixed;inset:0;z-index:2;display:grid;place-items:center;background:rgba(5,6,11,.8);padding:20px}
.lcc-zoom[hidden]{display:none!important}
.lcc-zoom .dcard{width:min(340px,80vw);font-size:1.5em}
.lcc-zoom .dcard .face{padding:16px 16px 12px}
.lcc-zoom .dc-name{font-size:1.25rem}.lcc-zoom .dc-type{font-size:.72rem}.lcc-zoom .dc-specs div{font-size:.86rem}.lcc-zoom .dc-text{font-size:.9rem}.lcc-zoom .dc-foot{font-size:.66rem}.lcc-zoom .dc-no{font-size:.75rem}
.lcc-zoom .hint{position:absolute;bottom:calc(20px + env(safe-area-inset-bottom,0px));left:0;right:0;text-align:center;font:500 .74rem "JetBrains Mono",monospace;color:#8e8fab}
/* pack */
.pack-stage{min-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;text-align:center}
.pack{position:relative;width:min(230px,60vw);aspect-ratio:224/330;cursor:pointer;border-radius:8px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.6),0 0 40px rgba(110,231,255,.15);
  background:linear-gradient(135deg,#2a2f55,#14172a 40%,#3a1d5c 70%,#1b2f6b);animation:packIdle 3s ease-in-out infinite}
@keyframes packIdle{50%{transform:translateY(-6px) rotate(-1deg)}}
.pack::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(115deg,rgba(255,255,255,.0) 0 10px,rgba(255,255,255,.08) 10px 12px)}
.pack::after{content:"";position:absolute;left:0;right:0;top:0;height:14%;background:repeating-linear-gradient(90deg,#c9ced8 0 6px,#8f95a6 6px 12px);clip-path:polygon(0 0,100% 0,100% 70%,96% 100%,92% 70%,88% 100%,84% 70%,80% 100%,76% 70%,72% 100%,68% 70%,64% 100%,60% 70%,56% 100%,52% 70%,48% 100%,44% 70%,40% 100%,36% 70%,32% 100%,28% 70%,24% 100%,20% 70%,16% 100%,12% 70%,8% 100%,4% 70%,0 100%)}
.pack .pl{position:absolute;inset:18% 10% 8%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px}
.pack .pl b{font:800 1.6rem/1 "Unbounded",sans-serif;letter-spacing:-.03em}
.pack .pl span{font:500 .62rem "JetBrains Mono",monospace;letter-spacing:.14em;color:#9aa0b8;text-transform:uppercase}
.pack .pl em{font:700 .7rem "JetBrains Mono",monospace;font-style:normal;color:#05060b;background:var(--pc,#ffcf4d);padding:3px 8px;border-radius:2px;letter-spacing:.06em}
.pack .chipmark{width:70px;height:70px;border:2px solid #e0a84a;border-radius:4px;display:grid;place-items:center;font:800 1.5rem "Unbounded",sans-serif;position:relative;background:#0b0d18}
.pack .chipmark::before{content:"";position:absolute;inset:-9px 10px;border-top:4px dotted #c9ced8;border-bottom:4px dotted #c9ced8}
.pack.tear{animation:packTear .6s cubic-bezier(.5,0,.7,.4) forwards}
@keyframes packTear{30%{transform:scale(1.06) rotate(2deg)}100%{transform:translateY(60px) scale(.8);opacity:0}}
.pack-hint{font:500 .78rem "JetBrains Mono",monospace;color:#8e8fab}
.reveal{display:flex;gap:18px;flex-wrap:wrap;justify-content:center;perspective:1200px}
.reveal .dcard{width:clamp(150px,24vw,224px);cursor:pointer;animation:deal .55s cubic-bezier(.2,.9,.3,1.2) both}
.reveal .dcard:nth-child(2){animation-delay:.12s}.reveal .dcard:nth-child(3){animation-delay:.24s}
@keyframes deal{from{transform:translateY(80px) rotate(-8deg) scale(.7);opacity:0}}
.reveal .dcard.r-H:not(.facedown),.reveal .dcard.r-W:not(.facedown){filter:drop-shadow(0 0 18px var(--rc))}

.pack::after{display:none}
.pack .strip{position:absolute;left:0;right:0;top:0;height:14%;z-index:2;background:repeating-linear-gradient(90deg,#c9ced8 0 6px,#8f95a6 6px 12px);clip-path:polygon(0 0,100% 0,100% 70%,96% 100%,92% 70%,88% 100%,84% 70%,80% 100%,76% 70%,72% 100%,68% 70%,64% 100%,60% 70%,56% 100%,52% 70%,48% 100%,44% 70%,40% 100%,36% 70%,32% 100%,28% 70%,24% 100%,20% 70%,16% 100%,12% 70%,8% 100%,4% 70%,0 100%)}
.strip.flying{animation:stripFly 1.1s cubic-bezier(.2,.6,.4,1) forwards;border-radius:2px}
@keyframes stripFly{to{transform:translate(220px,-260px) rotate(38deg);opacity:0}}
.pack .tearline{position:absolute;left:0;top:13.5%;height:3px;width:var(--tp,0%);z-index:3;background:#fff;box-shadow:0 0 10px #6ee7ff,0 0 24px #6ee7ff;border-radius:2px}
.pack{touch-action:none}
.pack.charging{animation:packShake .08s linear infinite}
.pack.charging .strip{filter:drop-shadow(0 0 6px #6ee7ff) brightness(1.3)}
.pack.charging::before{background:repeating-linear-gradient(115deg,rgba(255,255,255,0) 0 10px,rgba(110,231,255,.18) 10px 12px)}
@keyframes packShake{0%{transform:translate(0,0) rotate(0)}25%{transform:translate(-1.5px,1px) rotate(-.6deg)}50%{transform:translate(1.5px,-1px) rotate(.5deg)}75%{transform:translate(-1px,-1px) rotate(-.3deg)}}
.pack.ripped{animation:packDrop 1.4s cubic-bezier(.5,0,.8,.4) .9s forwards}
.pack.ripped .chipmark{box-shadow:0 0 30px #6ee7ff}
@keyframes packDrop{to{transform:translateY(120vh) rotate(12deg)}}
.lcc-fx{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;display:none}
.reveal .dcard.nodeal{animation:none}
.reveal .dcard.pending{visibility:hidden}
.reveal .dcard.printing{animation:expose .65s cubic-bezier(.4,0,.2,1) both}
.reveal .dcard.printing::before{content:"";position:absolute;inset:0;z-index:3;border-radius:10px;background:#fff;mix-blend-mode:overlay;animation:flashout .7s ease-out both;pointer-events:none}
@keyframes flashout{from{opacity:.9}to{opacity:0}}
.reveal .dcard.printing::after{content:"";position:absolute;left:-6%;right:-6%;height:6px;top:0;z-index:4;background:#fff;box-shadow:0 0 18px #6ee7ff,0 0 40px #6ee7ff;border-radius:3px;animation:scanbar .65s cubic-bezier(.4,0,.2,1) both}
@keyframes expose{from{clip-path:inset(0 0 100% 0)}to{clip-path:inset(0 0 0 0)}}
@keyframes scanbar{from{top:0;opacity:1}to{top:100%;opacity:0}}
.dcard.pop{animation:pop .6s cubic-bezier(.2,1.6,.4,1)}
@keyframes pop{30%{transform:scale(1.12)}}
@media (prefers-reduced-motion: reduce){.dcard .flip{transition:none}.pack,.reveal .dcard{animation:none}}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

/* ---------------- card DOM ---------------- */
const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
function cardEl(c,opts){
  opts=opts||{};const d=document.createElement('div');d.className=`dcard r-${c.r}`+(opts.facedown?' facedown':'');d.style.setProperty('--rc',RAR[c.r].col);d.dataset.id=c.id;
  d.innerHTML=`<div class="flip"><div class="face">
    <div class="dc-top"><span class="dc-name">${esc(c.n)}</span><span class="dc-no">${String(c.no).padStart(2,'0')}/${CARDS.length}</span></div>
    <div class="dc-art"><img alt="" src="${art(c)}"></div>
    <div class="dc-type"><span>${esc(c.t)}</span><span class="dc-rar"><i></i>${RAR[c.r].name}</span></div>
    <dl class="dc-specs">${c.s.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    <p class="dc-text">${esc(c.x)}</p>
    <div class="dc-foot"><span>LC-2030 DIE CARDS</span><span>REV A</span></div></div>
    <div class="back">${BACK}</div></div><div class="shine"></div>`;
  d.setAttribute('role','img');d.setAttribute('aria-label',`${c.n}, ${RAR[c.r].name} card. ${c.s.map(s=>s.join(' ')).join(', ')}. ${c.x}`);
  if(opts.tilt)tiltable(d);
  return d;
}
function tiltable(d){
  d.addEventListener('pointermove',e=>{const r=d.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    d.style.transform=`perspective(900px) rotateY(${(x-.5)*22}deg) rotateX(${(.5-y)*18}deg)`;
    d.style.setProperty('--mx',(x*100)+'%');d.style.setProperty('--my',(y*100)+'%');d.style.setProperty('--bx',(x*100)+'%');d.style.setProperty('--by',(y*100)+'%')});
  d.addEventListener('pointerleave',()=>{d.style.transform=''});
}

/* ---------------- packs ---------------- */
function rollRarity(){let r=Math.random()*100;for(const k of['W','H','U','C']){r-=RAR[k].w;if(r<0)return k}return 'C'}
function pick(list){const tw={C:1,U:.6,H:.25,W:.07};const items=list.map(id=>BY[id]).filter(Boolean);let tot=items.reduce((a,c)=>a+tw[c.r],0),r=Math.random()*tot;for(const c of items){r-=tw[c.r];if(r<0)return c}return items[0]}
function makePack(chip){const out=[];const themed=pick(THEME[chip]||THEME.home);
  for(let i=0;i<2;i++){const rr=rollRarity();const pool=CARDS.filter(c=>c.r===rr&&c.id!==themed.id&&!out.includes(c));out.push(pool[Math.random()*pool.length|0]||CARDS[0])}
  out.push(themed);return out.sort((a,b)=>'CUHW'.indexOf(a.r)-'CUHW'.indexOf(b.r))}

/* ---------------- overlay UI ---------------- */
let root,body,zoomEl,onClose=null;
function ensure(){
  if(root)return;
  root=document.createElement('section');root.id='lcCards';root.hidden=true;root.setAttribute('role','dialog');root.setAttribute('aria-label','Die Cards');
  root.innerHTML=`<div class="lcc-top"><div><h2 id="lccTitle">Die Cards</h2><div class="sub" id="lccSub"></div></div><span class="sp"></span>
    <div class="lcc-prog" title="Collection progress"><i id="lccProg"></i></div><span class="sub" id="lccCount"></span>
    <button class="lcc-btn" id="lccBinder" type="button">Binder</button><button class="lcc-btn" id="lccClose" type="button">Close ✕</button></div>
    <div class="lcc-body" id="lccBody"></div><div class="lcc-zoom" id="lccZoom" hidden></div>`;
  document.body.appendChild(root);body=root.querySelector('#lccBody');zoomEl=root.querySelector('#lccZoom');
  root.querySelector('#lccClose').addEventListener('click',close);
  root.querySelector('#lccBinder').addEventListener('click',()=>binder());
  zoomEl.addEventListener('click',e=>{if(e.target===zoomEl)zoomEl.hidden=true});
  document.addEventListener('keydown',e=>{if(root.hidden)return;if(e.key==='Escape'){e.stopPropagation();e.preventDefault();if(!zoomEl.hidden)zoomEl.hidden=true;else close()}},true);
}
function progress(){const o=owned(),n=CARDS.length;root.querySelector('#lccProg').style.width=(o/n*100)+'%';root.querySelector('#lccCount').textContent=`${o}/${n}`}
function show(){ensure();root.hidden=false;progress()}
function close(){if(!root)return;root.hidden=true;zoomEl.hidden=true;const f=onClose;onClose=null;if(f)f()}
function zoom(c){zoomEl.innerHTML='';const d=cardEl(c,{tilt:true});d.addEventListener('click',()=>d.classList.toggle('facedown'));zoomEl.appendChild(d);
  const h=document.createElement('div');h.className='hint';h.textContent='Click the card to flip it · Esc to close';zoomEl.appendChild(h);zoomEl.hidden=false}

let filter='all';
function binder(){
  show();root.querySelector('#lccTitle').textContent='Binder';root.querySelector('#lccSub').textContent='LC-2030 DIE CARDS · REV A';
  root.querySelector('#lccBinder').hidden=true;
  const F=[['all','All'],['C','Common'],['U','Uncommon'],['H','Holo'],['W','Wafer-Scale']];
  body.innerHTML=`<div class="lcc-filter">${F.map(([k,l])=>`<button type="button" data-f="${k}" class="${filter===k?'on':''}">${l}</button>`).join('')}</div><div class="lcc-grid" id="lccGrid"></div>`;
  body.querySelectorAll('[data-f]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.f;binder()}));
  const grid=body.querySelector('#lccGrid');
  CARDS.filter(c=>filter==='all'||c.r===filter).forEach(c=>{
    if(mem[c.id]>0){const d=cardEl(c,{tilt:true});if(mem[c.id]>1){const b=document.createElement('span');b.className='newb';b.style.background='#262a45';b.style.color='#ecebf5';b.textContent='×'+mem[c.id];d.appendChild(b)}
      d.tabIndex=0;d.addEventListener('click',()=>zoom(c));d.addEventListener('keydown',e=>{if(e.key==='Enter')zoom(c)});grid.appendChild(d)}
    else{const s=document.createElement('div');s.className='dslot';s.innerHTML=`<div><b>${String(c.no).padStart(2,'0')}</b>${RAR[c.r].name}<br>not yet pulled</div>`;grid.appendChild(s)}});
  if(!owned())grid.insertAdjacentHTML('beforebegin','<p style="text-align:center;color:#8e8fab;margin:0 0 16px">Your binder is empty. Win any chip’s minigame to earn a pack.</p>');
}
/* ---------------- sound (synthesized, opt-out) ---------------- */
let AC=null,muted=false;try{muted=localStorage.getItem('lc-mute')==='1'}catch(e){}
function ac(){if(muted)return null;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();return AC}catch(e){return null}}
function tone(f0,f1,dur,type,vol){const a=ac();if(!a)return;const o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f0,a.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),a.currentTime+dur);
  g.gain.setValueAtTime(0,a.currentTime);g.gain.linearRampToValueAtTime(vol||.08,a.currentTime+.01);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+dur);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+dur+.02)}
function noise(dur,freq,vol){const a=ac();if(!a)return;const n=a.sampleRate*dur|0,buf=a.createBuffer(1,n,a.sampleRate),d=buf.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2);
  const src=a.createBufferSource();src.buffer=buf;const f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=freq||2400;f.Q.value=.8;const g=a.createGain();g.gain.value=vol||.12;src.connect(f);f.connect(g);g.connect(a.destination);src.start()}
const SFX={hum:()=>tone(70,260,.5,'sawtooth',.03),rip:()=>{noise(.32,2600,.18);tone(900,120,.25,'square',.03)},zap:()=>tone(1200+Math.random()*1400,300,.06,'square',.018),
  route:()=>tone(300,900,.5,'triangle',.03),print:i=>tone(520*Math.pow(1.26,i),520*Math.pow(1.26,i),.18,'sine',.05),
  big:r=>{(r==='W'?[523,659,784,1047,1319]:[523,659,784]).forEach((f,i)=>setTimeout(()=>tone(f,f,.35,'triangle',.05),i*90))},flip:()=>tone(1400,700,.05,'triangle',.03)};

/* ---------------- pack opening ---------------- */
function openPack(chip,label,color){
  show();root.querySelector('#lccTitle').textContent='Pack earned';root.querySelector('#lccSub').textContent=(label||'')+' · 3 cards';root.querySelector('#lccBinder').hidden=false;
  const cards=makePack(chip);
  body.innerHTML=`<div class="pack-stage"><div class="pack" id="lccPack" role="button" tabindex="0" aria-label="Tear the pack open" style="--pc:${color||'#ffcf4d'}">
    <div class="strip"></div><div class="tearline"></div>
    <div class="pl"><span>LC-2030</span><div class="chipmark">LC</div><b>DIE<br>CARDS</b><span>Booster · 3 cards</span><em>${esc(label||'')}</em></div></div>
    <div class="pack-hint">Drag across the top to tear it open <span style="opacity:.6">(or click)</span></div>
    <button class="lcc-btn" id="lccMute" type="button" style="height:28px;font-size:.7rem">${muted?'Sound off':'Sound on'}</button></div>`;
  const pk=body.querySelector('#lccPack');let dragging=false,x0=0,moved=false,prog=0;
  body.querySelector('#lccMute').addEventListener('click',e=>{muted=!muted;try{localStorage.setItem('lc-mute',muted?'1':'0')}catch(_){}e.currentTarget.textContent=muted?'Sound off':'Sound on'});
  const setProg=p=>{prog=Math.max(prog,Math.min(1,p));pk.style.setProperty('--tp',(prog*100)+'%');pk.classList.toggle('charging',prog>.05);if(prog>.05&&!pk.dataset.h){pk.dataset.h=1;SFX.hum()}};
  pk.addEventListener('pointerdown',e=>{dragging=true;moved=false;x0=e.clientX;pk.setPointerCapture(e.pointerId)});
  pk.addEventListener('pointermove',e=>{if(!dragging)return;const r=pk.getBoundingClientRect();if(Math.abs(e.clientX-x0)>6)moved=true;if(moved)setProg((e.clientX-r.left)/r.width);if(prog>=.92)rip()});
  pk.addEventListener('pointerup',()=>{if(!dragging)return;dragging=false;if(!moved||prog>.45)rip()});
  pk.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();rip()}});pk.focus({preventScroll:true});
  function rip(){if(pk.dataset.t)return;pk.dataset.t=1;
    if(reduce()){deal(cards,null);return}
    const anim=()=>{let p=prog;const t0=performance.now();(function f(n){p=Math.min(1,prog+(n-t0)/380);pk.style.setProperty('--tp',(p*100)+'%');pk.classList.add('charging');if(p<1)requestAnimationFrame(f);else burst()})(t0)};
    if(!pk.dataset.h)SFX.hum();anim();
  }
  function burst(){SFX.rip();const r=pk.getBoundingClientRect();
    // fly the torn strip
    const st=pk.querySelector('.strip'),sr=st.getBoundingClientRect(),fly=st.cloneNode();fly.className='strip flying';
    Object.assign(fly.style,{position:'fixed',left:sr.left+'px',top:sr.top+'px',width:sr.width+'px',height:sr.height+'px',zIndex:5});root.appendChild(fly);st.style.visibility='hidden';
    setTimeout(()=>fly.remove(),1200);
    pk.classList.add('ripped');
    FX.run(cards,{x:r.left+r.width/2,y:r.top+r.height*.13,w:r.width},()=>deal(cards,true),pk);
  }
}
const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- FX: sparks, wires, beam, routing ---------------- */
const FX=(function(){
  let cv,g,raf=null,skip=null;
  const WIRE_COLS=['#e5484d','#2b2b36','#3b82f6','#f5c542','#34c77b','#e8e8ef','#f08a3c','#a66bff'];
  function canvas(){if(!cv){cv=document.createElement('canvas');cv.className='lcc-fx';root.appendChild(cv);g=cv.getContext('2d')}
    const d=Math.min(devicePixelRatio||1,2);cv.width=innerWidth*d;cv.height=innerHeight*d;g.setTransform(d,0,0,d,0,0);cv.style.display='block'}
  function run(cards,mouth,done,pk){
    canvas();const best=cards.reduce((m,c)=>'CUHW'.indexOf(c.r)>'CUHW'.indexOf(m)?c.r:m,'C');
    const beamCol=best==='W'?'255,207,77':best==='H'?'215,123,255':'110,231,255';
    const W=innerWidth,H=innerHeight,t0=performance.now();let last=t0,phase=0;
    const sparks=[],wires=[],shards=[],rings=[{t:0}];let shake=best==='W'?14:best==='H'?6:0;
    // wires
    const NW=Math.min(28,Math.max(16,W/50|0));
    for(let i=0;i<NW;i++){const ang=-Math.PI/2+(Math.random()-.5)*2.4,sp=900+Math.random()*900,N=14,seg=8+Math.random()*5,col=WIRE_COLS[i%WIRE_COLS.length];
      const pts=[];for(let k=0;k<N;k++){const f=k/(N-1),vx=Math.cos(ang)*sp*f,vy=Math.sin(ang)*sp*f;pts.push({x:mouth.x+(Math.random()-.5)*mouth.w*.6,y:mouth.y,ox:0,oy:0,vx,vy})}
      pts.forEach(p=>{p.ox=p.x-p.vx/60;p.oy=p.y-p.vy/60});
      wires.push({pts,seg,col,ph:Math.random()*6.28,fq:6+Math.random()*8,curl:(Math.random()<.5?-1:1)*(500+Math.random()*900),delay:Math.random()*.25,anchor:pts[0].x})}
    if(best==='W')for(let i=0;i<70;i++){const a=-Math.PI/2+(Math.random()-.5)*2.8,s=300+Math.random()*900;shards.push({x:mouth.x,y:mouth.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:Math.random()*6.28,vr:(Math.random()-.5)*12,s:4+Math.random()*6,l:1})}
    // routes to card slots (computed later)
    let routes=null;
    function spark(x,y,n,col,spd){for(let i=0;i<n;i++){const a=Math.random()*6.283,s=(spd||400)*(.3+Math.random());sparks.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-120,l:1,c:col||'255,220,140'})}}
    // charge arcs across crimp teeth already happened via CSS; initial burst
    spark(mouth.x,mouth.y,60,beamCol,700);
    const slots=()=>[...root.querySelectorAll('.reveal .dcard')].map(d=>{const r=d.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,top:r.top,el:d}});
    function makeRoutes(){const S=slots();routes=[];S.forEach((s,i)=>{for(let lane=-1;lane<=1;lane++){const off=lane*9,midY=mouth.y+(s.top-mouth.y)*.45+lane*9,sx=s.x+off;
        const pts=[[mouth.x+off,mouth.y],[mouth.x+off,midY-Math.min(40,Math.abs(sx-mouth.x))],[mouth.x+off+Math.sign(sx-mouth.x)*Math.min(40,Math.abs(sx-mouth.x)),midY],[sx-Math.sign(sx-mouth.x)*Math.min(40,Math.abs(sx-mouth.x)),midY],[sx,midY+Math.min(40,Math.abs(sx-mouth.x))],[sx,s.top]];
        let L=0;for(let k=1;k<pts.length;k++)L+=Math.hypot(pts[k][0]-pts[k-1][0],pts[k][1]-pts[k-1][1]);routes.push({pts,L,slot:i,d:i*.12+Math.abs(lane)*.05})}});SFX.route()}
    function along(r,len){let acc=0;for(let k=1;k<r.pts.length;k++){const a=r.pts[k-1],b=r.pts[k],sl=Math.hypot(b[0]-a[0],b[1]-a[1]);if(acc+sl>=len){const f=(len-acc)/sl;return[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,k]}acc+=sl}return[r.pts[r.pts.length-1][0],r.pts[r.pts.length-1][1],r.pts.length]}
    let printed=0,dealt=false,finished=false;
    function finish(){if(finished)return;finished=true;cancelAnimationFrame(raf);raf=null;cv.style.display='none';root.removeEventListener('pointerdown',skip,true);
      root.querySelectorAll('.reveal .dcard.pending').forEach(d=>{d.classList.remove('pending');d.classList.add('printed')});pk&&pk.remove();}
    skip=e=>{if(e&&e.target&&e.target.closest&&e.target.closest('.lcc-top'))return;if(!dealt){dealt=true;done()}finish();SFX.big(best)};
    setTimeout(()=>root.addEventListener('pointerdown',skip,true),250);
    function frame(now){
      const dt=Math.min(.033,(now-last)/1000),t=(now-t0)/1000;last=now;
      g.setTransform(1,0,0,1,0,0);const d=Math.min(devicePixelRatio||1,2);g.clearRect(0,0,cv.width,cv.height);
      const sh=shake*Math.max(0,1-t*1.6);g.setTransform(d,0,0,d,(Math.random()-.5)*sh*d,(Math.random()-.5)*sh*d);
      // beam
      const bA=Math.max(0,Math.min(1,t*6))*Math.max(0,1-(t-1.2)*1.4);
      if(bA>0){const bg=g.createLinearGradient(0,mouth.y,0,0);bg.addColorStop(0,`rgba(${beamCol},${.55*bA})`);bg.addColorStop(1,`rgba(${beamCol},0)`);g.fillStyle=bg;
        g.beginPath();g.moveTo(mouth.x-mouth.w*.42,mouth.y);g.lineTo(mouth.x+mouth.w*.42,mouth.y);g.lineTo(mouth.x+mouth.w*1.4,0);g.lineTo(mouth.x-mouth.w*1.4,0);g.closePath();g.fill();
        const fl=g.createRadialGradient(mouth.x,mouth.y,0,mouth.x,mouth.y,mouth.w*1.2);fl.addColorStop(0,`rgba(255,255,255,${.9*bA})`);fl.addColorStop(.3,`rgba(${beamCol},${.5*bA})`);fl.addColorStop(1,`rgba(${beamCol},0)`);g.fillStyle=fl;g.fillRect(mouth.x-mouth.w*1.3,mouth.y-mouth.w*1.3,mouth.w*2.6,mouth.w*2.6)}
      // shockwave
      rings.forEach(r=>{r.t+=dt;const rr=r.t*1400,a=Math.max(0,1-r.t*1.8);if(a>0){g.strokeStyle=`rgba(${beamCol},${a})`;g.lineWidth=6*a+1;g.beginPath();g.arc(mouth.x,mouth.y,rr,0,6.283);g.stroke()}});
      // wires (verlet)
      const wireA=Math.max(0,1-Math.max(0,t-1.5)*1.6);
      if(wireA>0){g.lineCap='round';g.lineJoin='round';
        wires.forEach(w=>{if(t<w.delay)return;const P=w.pts,tt=t-w.delay;
          for(let k=1;k<P.length;k++){const p=P[k],vx=(p.x-p.ox)*.985,vy=(p.y-p.oy)*.985;p.ox=p.x;p.oy=p.y;
            const curl=(k/P.length)*w.curl*Math.sin(tt*w.fq+w.ph+k*.5);const prev=P[k-1],dx=p.x-prev.x,dy=p.y-prev.y,l=Math.hypot(dx,dy)||1;
            p.x+=vx+(-dy/l)*curl*dt*dt;p.y+=vy+(dx/l)*curl*dt*dt+1500*dt*dt;
            if(p.y>H-10){p.y=H-10;p.oy=p.y+vy*.4}if(p.x<5||p.x>W-5){p.x=Math.max(5,Math.min(W-5,p.x));p.ox=p.x+vx*.5}}
          P[0].x=w.anchor;P[0].y=mouth.y;P[0].ox=P[0].x;P[0].oy=P[0].y;
          for(let it=0;it<5;it++)for(let k=1;k<P.length;k++){const a=P[k-1],b=P[k],dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1,diff=(l-w.seg)/l;
            if(k===1){b.x-=dx*diff;b.y-=dy*diff}else{a.x+=dx*diff*.5;a.y+=dy*diff*.5;b.x-=dx*diff*.5;b.y-=dy*diff*.5}}
          const path=()=>{g.beginPath();g.moveTo(P[0].x,P[0].y);for(let k=1;k<P.length-1;k++){const mx=(P[k].x+P[k+1].x)/2,my=(P[k].y+P[k+1].y)/2;g.quadraticCurveTo(P[k].x,P[k].y,mx,my)}g.lineTo(P[P.length-1].x,P[P.length-1].y)};
          g.globalAlpha=wireA;g.strokeStyle='rgba(0,0,0,.45)';g.lineWidth=9;path();g.stroke();
          g.strokeStyle=w.col;g.lineWidth=7;path();g.stroke();
          g.strokeStyle='rgba(255,255,255,.32)';g.lineWidth=2;g.save();g.translate(-1.4,-1.4);path();g.stroke();g.restore();
          const tip=P[P.length-1],pre=P[P.length-3];g.strokeStyle='#e0a84a';g.lineWidth=3.2;g.shadowColor='#ffcf4d';g.shadowBlur=10;g.beginPath();g.moveTo(pre.x+(tip.x-pre.x)*.4,pre.y+(tip.y-pre.y)*.4);g.lineTo(tip.x,tip.y);g.stroke();g.shadowBlur=0;g.globalAlpha=1;
          if(Math.random()<.06&&t<1.6){spark(tip.x,tip.y,5,'255,220,140',260);if(Math.random()<.4)SFX.zap()}});}
      // shards (wafer-scale)
      shards.forEach(s=>{s.vy+=900*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.r+=s.vr*dt;s.l-=dt*.45;if(s.l<=0)return;g.save();g.translate(s.x,s.y);g.rotate(s.r);g.globalAlpha=s.l;
        const hue=(s.r*60+now*.2)%360;g.fillStyle=`hsl(${hue},90%,70%)`;g.fillRect(-s.s/2,-s.s/2,s.s,s.s);g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=.6;g.strokeRect(-s.s/2,-s.s/2,s.s,s.s);g.restore()});g.globalAlpha=1;
      // sparks
      g.globalCompositeOperation='lighter';
      for(let i=sparks.length-1;i>=0;i--){const p=sparks[i];p.vy+=900*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt*1.8;if(p.l<=0){sparks.splice(i,1);continue}
        g.strokeStyle=`rgba(${p.c},${p.l})`;g.lineWidth=2;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x-p.vx*.03,p.y-p.vy*.03);g.stroke()}
      g.globalCompositeOperation='source-over';
      // deal + routing
      if(t>1.25&&!dealt){dealt=true;done();requestAnimationFrame(()=>{makeRoutes()})}
      if(routes){const rt=t-1.32;g.lineCap='round';
        routes.forEach(r=>{const p=Math.max(0,Math.min(1,(rt-r.d)/.8)),e=1-Math.pow(1-p,3),len=r.L*e;if(p<=0)return;
          g.strokeStyle='rgba(224,168,74,.9)';g.lineWidth=3;g.shadowColor='rgba(255,207,77,.9)';g.shadowBlur=8;g.beginPath();g.moveTo(r.pts[0][0],r.pts[0][1]);
          const [hx,hy,k]=along(r,len);for(let j=1;j<k;j++)g.lineTo(r.pts[j][0],r.pts[j][1]);g.lineTo(hx,hy);g.stroke();g.shadowBlur=0;
          if(p<1){g.fillStyle='#fff';g.shadowColor=`rgb(${beamCol})`;g.shadowBlur=16;g.beginPath();g.arc(hx,hy,3.5,0,6.283);g.fill();g.shadowBlur=0}
          else{const q=((now/600)+r.d)%1,[px,py]=along(r,r.L*q);g.fillStyle=`rgba(${beamCol},.9)`;g.beginPath();g.arc(px,py,2.6,0,6.283);g.fill()}});
        const S=root.querySelectorAll('.reveal .dcard');
        S.forEach((dEl,i)=>{const lanes=routes.filter(r=>r.slot===i);if(lanes.every(r=>rt-r.d>=.8)&&dEl.classList.contains('pending')){dEl.classList.remove('pending');dEl.classList.add('printing');SFX.print(i);printed++;
          const rr=dEl.getBoundingClientRect();spark(rr.left+rr.width/2,rr.top,26,beamCol,380);setTimeout(()=>{dEl.classList.remove('printing');dEl.classList.add('printed')},700)}});
        if(printed===S.length&&S.length&&rt>1.9){SFX.big(best);finish();return}}
      if(t>6){finish();return}
      raf=requestAnimationFrame(frame);
    }
    raf=requestAnimationFrame(frame);
  }
  return{run};
})();

function deal(cards,fx){
  body.innerHTML=`<div class="pack-stage"><div class="reveal" id="lccReveal"></div><div class="pack-hint" id="lccHint">Click each card to flip it</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"><button class="lcc-btn" id="lccAll" type="button">Flip all</button><button class="lcc-btn pri" id="lccDone" type="button" hidden>Add to binder →</button></div></div>`;
  const rv=body.querySelector('#lccReveal');let flipped=0;
  const isNew=cards.map(c=>!(mem[c.id]>0));
  cards.forEach((c,i)=>{const d=cardEl(c,{facedown:true,tilt:true});if(fx)d.classList.add('pending','nodeal');d.tabIndex=0;d.setAttribute('aria-label','Face-down card. Press to flip.');
    const flip=()=>{if(!d.classList.contains('facedown')||d.classList.contains('pending'))return;d.classList.remove('facedown');d.setAttribute('aria-label',`${c.n}, ${RAR[c.r].name}`);SFX.flip();
      if(c.r==='H'||c.r==='W'){d.classList.add('pop');SFX.big(c.r)}
      const b=document.createElement('span');b.className='newb'+(isNew[i]?'':' dup');b.textContent=isNew[i]?'NEW':'DUPE';d.appendChild(b);
      flipped++;if(flipped===cards.length)finish()};
    d.addEventListener('click',flip);d.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();flip()}});rv.appendChild(d)});
  body.querySelector('#lccAll').addEventListener('click',()=>rv.querySelectorAll('.dcard.facedown').forEach((d,i)=>setTimeout(()=>{d.classList.remove('pending');d.click()},i*220)));
  function finish(){cards.forEach(c=>{mem[c.id]=(mem[c.id]||0)+1});save();changed();progress();
    const nn=isNew.filter(Boolean).length;body.querySelector('#lccHint').textContent=nn?`${nn} new card${nn>1?'s':''} for your binder.`:'All duplicates this time.';
    body.querySelector('#lccAll').hidden=true;const done=body.querySelector('#lccDone');done.hidden=false;done.addEventListener('click',()=>binder());done.focus({preventScroll:true})}
}

window.LCCards={CARDS,owned,total:CARDS.length,openPack,binder,close,isOpen:()=>!!root&&!root.hidden,onChange:f=>listeners.push(f),
  setOnClose:f=>{onClose=f},cardEl};
})();
