const _sV1=new V(),_sV12=new V(425-W/2,16,83-H/2),_sV13=new V(476-W/2,14,86-H/2),_sV3=new V(605-W/2,24,148-H/2),_sV4=new V(648-W/2,62,98-H/2),_sV5=new V(516-W/2,16,105.5-H/2),_sV6=new V(511-W/2,46,158-H/2),_sV7=new V(496-W/2,44,277-H/2),_sV8=new V(331-W/2,44,189-H/2),_sV9=new V(435-W/2,24,201-H/2),_sV10=new V(240-W/2,58,270-H/2),_sV11=new V(577-W/2,19,46-H/2),_sV14=new V(256-W/2,22,189-H/2),_sV15=new V(293.8-W/2,12,51.5-H/2),_sV16=new V(453-W/2,12,118.5-H/2),_sV17=new V(394-W/2,18,198-H/2),_sV18=new V(388-W/2,10,146-H/2),_sV19=new V(285.4-W/2,16,314.4-H/2);
// landing

let perfSamples=0,perfElapsed=0,perfAdjusted=false;

const land=dm('land','<div class="in"><span class="pre">Gati Shakti Vishwavidyalaya presents</span><div class="logo"><img src="assets/logos/landing-logo.webp" alt="Agnee 2026"></div><div class="orn"><i></i>\u25C6<i></i></div><div class="tl">The Cultural Fest \u00B7 Campus in 3D</div><p>Step through the main gate and travel the campus \u2014 hostels, the academic core and the palace \u2014 all the way to the Oval Ground.</p><button class="go" id="goFest" type="button">Enter Agnee 2026</button><span class="sub">Begin the journey</span><button class="lk" id="goFree" type="button">or explore freely</button></div>');

hint.style.display='none';

// tour HUD

const tui=dm('tui','<div class="tpill"><i></i><span id="tpC">Arrival</span><em id="tpN"></em></div><div class="tseg">'+ST.map(()=>'<i></i>').join('')+'</div><div class="tbtns"><button id="tSkip" type="button">Skip to <img class="wmi" style="height:13px" alt="Agnee" src="'+WMURI+'"> \u203A</button><button id="tFree" type="button">Explore freely</button></div><div class="tcap" id="tcap"><small id="tcK"></small><b id="tcN"></b><span><em id="tcT"></em><u id="tcS" style="text-decoration:none"></u></span></div>');

const tq=s=>tui.querySelector(s),tpC=tq('#tpC'),tpN=tq('#tpN'),tcap=tq('#tcap'),tcK=tq('#tcK'),tcN=tq('#tcN'),tcT=tq('#tcT'),tcSub=tq('#tcS'),tseg=[...tui.querySelectorAll('.tseg i')];

// Enter the Fest CTA + fest panel

const enterBtn=dm('enterfest');enterBtn.type='button';enterBtn.textContent='Enter the Fest \u2192';

const festEl=dm('fest');festEl.setAttribute('role','dialog');festEl.setAttribute('aria-modal','true');festEl.setAttribute('aria-label',FEST.name+' \u2014 '+FEST.tag);

festEl.innerHTML='<div class="fhd"><b><img class="wmi" style="height:30px" alt="Agnee" src="'+WMURI+'"></b><div class="fnav"><button data-t="fa">About</button><button data-t="fe">Events</button><button data-t="fs">Stay tuned</button><button data-t="fp">Sponsors</button><button data-t="fv">Venue</button></div><button class="fx" type="button">\u2715 Close</button></div>'+

 '<div class="fscroll"><div class="fhero"><small>'+FEST.host+'</small><h2><img class="wmi" style="height:clamp(80px,22vw,190px)" alt="Agnee" src="'+WMURI+'"></h2><p>'+FEST.tag+' \u00B7 '+FEST.venue+'</p><span class="pillx">'+FEST.when+'</span></div>'+

 '<section class="fsec" id="fa"><h3>About</h3><p>'+FEST.about+'</p></section>'+

 '<section class="fsec" id="fe"><h3>Events</h3><p>The programme will be published here. These are the categories planned for the fest.</p><div class="fgrid">'+FEST.events.map(e=>'<div class="fc"><em>Details soon</em><b>'+e[0]+'</b><span>'+e[1]+'</span></div>').join('')+'</div></section>'+

 '<section class="fsec" id="fs"><h3>Stay tuned</h3><div class="fgrid">'+FEST.steps.map(e=>'<div class="fc big"><span>'+e[0]+'</span><b>'+e[1]+'</b></div>').join('')+'</div></section>'+

 '<section class="fsec" id="fp"><h3>Sponsors</h3><p>'+FEST.name+' 2026 \u2014 the cultural fest of '+FEST.host+' \u2014 is made possible by its sponsors. State Bank of India (Title Sponsor) and Union Bank of India (Powered By) lead our official festival partners.</p><div class="fgrid">'+SPON.tiers.map(t=>'<div class="fc"><em>'+t.t+'</em><b>'+sponTxt(t)+'</b></div>').join('')+'</div></section>'+

 '<section class="fsec" id="fv"><h3>Venue</h3><p>'+FEST.venue+', '+FEST.host+'. Fly back for another look, or retrace the whole campus journey.</p><div class="frow"><button class="fbtn" data-a="back" type="button">Back to the venue</button><button class="fbtn ghost" data-a="replay" type="button">Replay the journey</button><button class="fbtn ghost" data-a="free" type="button">Explore the campus</button></div></section></div>';

const fest={isOpen:false,

 open(){this.isOpen=true;festEl.classList.add('on');view.classList.add('festopen');enterBtn.classList.remove('on');setTimeout(()=>festEl.querySelector('.fx').focus({preventScroll:true}),50);},

 close(){if(!this.isOpen)return;this.isOpen=false;festEl.classList.remove('on');view.classList.remove('festopen');festEl.querySelector('.fscroll').scrollTop=0;}};

festEl.querySelector('.fx').onclick=()=>fest.close();

festEl.querySelectorAll('.fnav button').forEach(b=>b.onclick=()=>festEl.querySelector('#'+b.dataset.t).scrollIntoView({behavior:'smooth',block:'start'}));

festEl.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a;fest.close();if(a==='replay')TOUR.start();else if(a==='free'){toFree();}});

document.addEventListener('keydown',e=>{if(e.key==='Escape'&&fest.isOpen)fest.close();});



// ---- Stage screen: draws the fest information onto the big screen on the stage

const STAGE_PAGES=['About','Events','Stay tuned','Venue','Sponsors'];

const SCRN=(()=>{

 const S=2,Wd=1152,Ht=640,PAGES=STAGE_PAGES,GOLD='#e8c06a',GOLD2='#ffe6a8';

 SCR.width=Wd*S;SCR.height=Ht*S;const g=SCR.getContext('2d');

 const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));

 const rr=(x,y,w,h,r)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();};

 const wrap=(t,x,y,mw,lh)=>{let l='',n=0;for(const q of t.split(' ')){const tt=l?l+' '+q:q;if(g.measureText(tt).width>mw&&l){g.fillText(l,x,y+n*lh);l=q;n++;}else l=tt;}g.fillText(l,x,y+n*lh);return n+1;};

 const F=(w,sz,serif)=>w+' '+sz+'px '+(serif?'Georgia,"Times New Roman",serif':'"Helvetica Neue",Arial,sans-serif');

 const T=(s,x,y,font,col,al)=>{g.font=font;g.fillStyle=col;g.textAlign=al||'left';g.fillText(s,x,y);};

 const logo=()=>WMI.naturalWidth?WMI:null;

 const px=document.createElement('canvas');px.width=px.height=3;{const c=px.getContext('2d');c.fillStyle='rgba(0,0,0,.34)';c.fillRect(2,0,1,3);c.fillRect(0,2,3,1);}

 const pat=g.createPattern(px,'repeat');

 function goldLine(x,y,w,a){const gr=g.createLinearGradient(x,0,x+w,0);gr.addColorStop(0,'rgba(232,192,106,0)');gr.addColorStop(.5,'rgba(232,192,106,'+(a||.7)+')');gr.addColorStop(1,'rgba(232,192,106,0)');g.fillStyle=gr;g.fillRect(x,y,w,1);}

 function bg(t){g.setTransform(S,0,0,S,0,0);g.globalAlpha=1;g.textBaseline='alphabetic';

  let gr=g.createLinearGradient(0,0,0,Ht);gr.addColorStop(0,'#0a0514');gr.addColorStop(.55,'#1a0832');gr.addColorStop(1,'#35103a');g.fillStyle=gr;g.fillRect(0,0,Wd,Ht);

  [[.22,.3,420,'rgba(214,36,110,.42)',.21],[.78,.62,440,'rgba(255,140,50,.34)',.17],[.5,0,360,'rgba(110,70,210,.4)',.13]].forEach(([fx,fy,r,c,sp],i)=>{const x=Wd*(fx+.1*Math.sin(t*sp+i*2)),y=Ht*fy+30*Math.cos(t*sp*1.3+i),rg=g.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,c);rg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=rg;g.fillRect(0,0,Wd,Ht);});

  g.save();g.translate(Wd/2,-60);for(let i=0;i<22;i++){const a=Math.PI*(.08+i*.039)+Math.sin(t*.15)*.04;g.fillStyle='rgba(255,224,160,'+(.035+.02*Math.sin(t*.6+i))+')';g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a-.012)*900,Math.sin(a-.012)*900);g.lineTo(Math.cos(a+.012)*900,Math.sin(a+.012)*900);g.fill();}g.restore();

  for(let i=0;i<40;i++){const x=(i*97.3)%Wd+Math.sin(t*.5+i)*14,y=Ht-((t*(14+i%5*4)+i*53)%(Ht+30)),a=.18+.32*Math.abs(Math.sin(t*.8+i));g.fillStyle='rgba(255,214,130,'+a+')';g.beginPath();g.arc(x,y,.8+i%3*.6,0,6.3);g.fill();}

  g.fillStyle=pat;g.fillRect(0,0,Wd,Ht);

  const vg=g.createRadialGradient(Wd/2,Ht/2,Ht*.35,Wd/2,Ht/2,Wd*.7);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.5)');g.fillStyle=vg;g.fillRect(0,0,Wd,Ht);}

 function brackets(){g.strokeStyle='rgba(232,192,106,.55)';g.lineWidth=2;const m=18,l=26,y0=88,y1=Ht-66;[[m,y0,1,1],[Wd-m,y0,-1,1],[m,y1,1,-1],[Wd-m,y1,-1,-1]].forEach(([x,y,sx,sy])=>{g.beginPath();g.moveTo(x,y+sy*l);g.lineTo(x,y);g.lineTo(x+sx*l,y);g.stroke();});}

 function frame(p,t,pt){g.fillStyle='rgba(0,0,0,.4)';g.fillRect(0,0,Wd,74);g.fillRect(0,Ht-52,Wd,52);goldLine(0,74,Wd,.8);goldLine(0,Ht-52,Wd,.6);

  const w=logo();if(w){const h=48,ww=h*w.naturalWidth/w.naturalHeight;g.drawImage(w,34,13,ww,h);}else T('AGNEE',36,48,F(800,24),GOLD2);

  g.fillStyle='rgba(232,192,106,.5)';g.fillRect(190,26,1,24);T('THE CULTURAL FEST',206,43,F(600,13),'rgba(255,255,255,.75)');T('GATI SHAKTI VISHWAVIDYALAYA',206,59,F(500,10),'rgba(232,192,106,.8)');

  g.font=F(700,13);let x=Wd-34;for(let i=PAGES.length-1;i>=0;i--){const lb=PAGES[i].toUpperCase(),w2=g.measureText(lb).width;x-=w2;T(lb,x,44,F(700,13),i===p?GOLD2:'rgba(255,255,255,.4)');if(i===p){g.fillStyle=GOLD;g.fillRect(x,54,w2,2);}x-=30;}

  g.fillStyle='rgba(255,255,255,.08)';g.fillRect(0,Ht-55,Wd,3);g.fillStyle=GOLD;g.fillRect(0,Ht-55,Wd*cl(pt/7),3);

  const tk='   ◆  GATI SHAKTI VISHWAVIDYALAYA  ◆  OVAL GROUND  ◆  AGNEE 2026 · THE CULTURAL FEST  ◆  '+FEST.when.toUpperCase();g.font=F(700,16);const w3=g.measureText(tk).width,o=-(t*55)%w3;g.save();g.beginPath();g.rect(0,Ht-50,Wd,50);g.clip();g.fillStyle='rgba(255,230,168,.9)';g.textAlign='left';for(let xx=o;xx<Wd;xx+=w3)g.fillText(tk,xx,Ht-19);g.restore();brackets();}

 function card(x,y,w,h,al){const gr=g.createLinearGradient(x,y,x,y+h);gr.addColorStop(0,'rgba(255,255,255,'+(.15*al)+')');gr.addColorStop(1,'rgba(255,255,255,'+(.04*al)+')');g.fillStyle=gr;rr(x,y,w,h,20);g.fill();

  const bs=g.createLinearGradient(x,y,x+w,y+h);bs.addColorStop(0,'rgba(255,230,168,'+(.8*al)+')');bs.addColorStop(.5,'rgba(255,255,255,'+(.12*al)+')');bs.addColorStop(1,'rgba(232,192,106,'+(.5*al)+')');g.strokeStyle=bs;g.lineWidth=1.5;g.stroke();}

 function icon(i,cx,cy,s,col){g.save();g.translate(cx,cy);g.scale(s,s);g.strokeStyle=col;g.fillStyle=col;g.lineWidth=2.2/s*s;g.lineCap=g.lineJoin='round';g.beginPath();

  if(i===0){g.arc(-7,10,6,0,6.3);g.fill();g.beginPath();g.moveTo(-1,10);g.lineTo(-1,-14);g.quadraticCurveTo(10,-10,10,2);g.stroke();}

  else if(i===1){[[0,0,13],[12,-12,5],[-12,11,4]].forEach(([x,y,r])=>{g.beginPath();g.moveTo(x,y-r);g.quadraticCurveTo(x,y,x+r,y);g.quadraticCurveTo(x,y,x,y+r);g.quadraticCurveTo(x,y,x-r,y);g.quadraticCurveTo(x,y,x,y-r);g.fill();});}

  else if(i===2){g.arc(-6,-2,11,0,6.3);g.stroke();g.beginPath();g.arc(8,4,11,0,6.3);g.stroke();g.beginPath();g.arc(-6,3,5,.2,Math.PI-.2);g.stroke();g.beginPath();g.arc(8,9,5,Math.PI+.3,-.3);g.stroke();}

  else if(i===3){g.arc(0,0,14,0,6.3);g.stroke();[[-5,-5],[5,-6],[7,4]].forEach(([x,y])=>{g.beginPath();g.arc(x,y,2.4,0,6.3);g.fill();});}

  else if(i===4){g.moveTo(0,-9);g.quadraticCurveTo(-8,-14,-15,-10);g.lineTo(-15,10);g.quadraticCurveTo(-8,6,0,11);g.quadraticCurveTo(8,6,15,10);g.lineTo(15,-10);g.quadraticCurveTo(8,-14,0,-9);g.moveTo(0,-9);g.lineTo(0,11);g.stroke();}

  else{g.moveTo(0,-6);g.arc(0,-10,4,Math.PI/2,-Math.PI*.15,true);g.stroke();g.beginPath();g.moveTo(0,-6);g.lineTo(0,-2);g.lineTo(-16,10);g.lineTo(16,10);g.lineTo(0,-2);g.stroke();}

  g.restore();}

 function emblem(cx,cy,r,t,a){g.save();g.translate(cx,cy);g.globalAlpha=a;g.strokeStyle=GOLD;g.lineWidth=1.5;[1,.78].forEach(k=>{g.beginPath();g.moveTo(0,-r*k*1.25);g.lineTo(r*k,0);g.lineTo(0,r*k*1.25);g.lineTo(-r*k,0);g.closePath();g.stroke();});

  g.rotate(t*.05);for(let i=0;i<28;i++){const an=i*Math.PI/14;g.beginPath();g.moveTo(Math.cos(an)*r*.3,Math.sin(an)*r*.3);g.lineTo(Math.cos(an)*r*(i%2?.5:.62),Math.sin(an)*r*(i%2?.5:.62));g.stroke();}g.restore();g.globalAlpha=1;}

 function venueMap(x,y,w,h,t){const cx=x+w/2,cy=y+h/2;card(x,y,w,h,1);g.save();rr(x,y,w,h,20);g.clip();

  g.fillStyle='rgba(20,60,40,.55)';g.beginPath();g.ellipse(cx,cy,w*.44,h*.4,0,0,6.3);g.fill();g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=2;g.stroke();g.strokeStyle='rgba(200,130,80,.6)';g.lineWidth=7;g.beginPath();g.ellipse(cx,cy,w*.4,h*.35,0,0,6.3);g.stroke();

  const sx=cx-w*.43;g.fillStyle=GOLD;rr(sx-6,cy-26,22,52,4);g.fill();T('STAGE',sx+5,cy+44,F(800,10),GOLD2,'center');

  for(let i=0;i<46;i++){const a=(i*2.399)%6.28,rr2=Math.sqrt((i+1)/46),px2=sx+34+rr2*w*.2+Math.cos(a)*6,py2=cy+Math.sin(a*1.7)*rr2*h*.26;g.fillStyle='rgba(255,230,168,'+(.5+.4*Math.sin(t*3+i))+')';g.beginPath();g.arc(px2,py2,2,0,6.3);g.fill();}

  g.fillStyle='rgba(255,255,255,.7)';[-1,1].forEach(s=>g.fillRect(cx+w*.04,cy+s*h*.2-5,34,10));T('SEATING',cx+w*.04+17,cy-h*.2-10,F(700,9),'rgba(255,255,255,.7)','center');

  for(let i=0;i<6;i++){g.fillStyle=['#e8453c','#f2a93b','#3c9be8','#b04ad0','#4cc07a','#f0d84a'][i];g.fillRect(cx+w*.31,cy-h*.27+i*h*.108,9,h*.07);}T('STALLS',cx+w*.31+4,cy+h*.4+6,F(700,9),'rgba(255,255,255,.7)','center');

  g.fillStyle=GOLD2;g.fillRect(x+w-12,cy-12,5,24);T('GATE',x+w-24,cy+4,F(700,9),GOLD2,'right');g.restore();}

 function draw(p,pt,t){bg(t);

  if(p<0){const w=logo();if(w){const ww=Wd*.6,hh=ww*w.naturalHeight/w.naturalWidth;g.drawImage(w,(Wd-ww)/2,Ht/2-hh/2-34,ww,hh);}else T('AGNEE',Wd/2,Ht/2+60,F(900,230),'#fff','center');

   emblem(Wd/2,Ht/2-30,260,t,.12);goldLine(Wd/2-330,Ht/2+120,250,.8);goldLine(Wd/2+80,Ht/2+120,250,.8);T('THE CULTURAL FEST',Wd/2,Ht/2+160,F(600,30),GOLD2,'center');T('GATI SHAKTI VISHWAVIDYALAYA · OVAL GROUND',Wd/2,Ht/2+196,F(500,15),'rgba(255,255,255,.6)','center');SCRT.needsUpdate=true;return;}

  frame(p,t,pt);const A=i=>{const a=cl((pt-i*.1)/.55);return a*a*(3-2*a);};

  g.save();const a0=A(0);g.globalAlpha=a0;g.translate(0,(1-a0)*18);T(PAGES[p].toUpperCase(),60,120,F(700,16),GOLD);goldLine(60,128,90,.9);g.restore();

  if(p===0){emblem(900,330,230,t,.1);const a=A(0);g.save();g.globalAlpha=a;g.translate(0,(1-a)*22);const w=logo();if(w){const ww=500,hh=ww*w.naturalHeight/w.naturalWidth;g.drawImage(w,56,138,ww,hh);}else T(FEST.name,60,290,F(900,150),'#fff');

   T(FEST.tag+' · '+FEST.venue,60,352,F(400,26,1),'#fff');g.fillStyle='rgba(232,192,106,.15)';rr(60,372,330,40,20);g.fill();g.strokeStyle='rgba(232,192,106,.7)';g.lineWidth=1.2;g.stroke();T(FEST.when.toUpperCase(),225,398,F(800,16),GOLD2,'center');

   g.fillStyle='rgba(255,255,255,.88)';g.font=F(400,19);g.textAlign='left';wrap(FEST.about,60,448,540,28);g.restore();

   FEST.events.forEach((e,i)=>{const a=A(i+1),x=660+(i%2)*226,y=150+Math.floor(i/2)*126;g.save();g.globalAlpha=a;g.translate(0,(1-a)*14);card(x,y,210,110,1);icon(i,x+38,y+55,1.15,GOLD2);T(e[0].split(' ')[0].toUpperCase(),x+70,y+52,F(800,18),'#fff');T('DETAILS SOON',x+70,y+74,F(600,10),GOLD);g.restore();});}

  else if(p===1){const cw=330,ch=190,gx=24,x0=(Wd-3*cw-2*gx)/2;FEST.events.forEach((e,i)=>{const a=A(i),x=x0+(i%3)*(cw+gx),y=148+Math.floor(i/3)*(ch+20);g.save();g.globalAlpha=a;g.translate(0,(1-a)*18);card(x,y,cw,ch,1);

    T('0'+(i+1),x+cw-24,y+62,F(900,56),'rgba(255,255,255,.09)','right');icon(i,x+cw-52,y+34,1,GOLD);g.fillStyle='rgba(232,192,106,.16)';rr(x+22,y+20,104,22,11);g.fill();T('DETAILS SOON',x+74,y+35,F(700,11),GOLD2,'center');

    T(e[0],x+22,y+88,F(700,34,1),'#fff');g.fillStyle='rgba(255,255,255,.82)';g.font=F(400,18);g.textAlign='left';wrap(e[1],x+22,y+124,cw-44,25);g.restore();});}

  else if(p===2){const cw=330,ch=230,gx=24,x0=(Wd-3*cw-2*gx)/2;FEST.steps.forEach((e,i)=>{const a=A(i),x=x0+i*(cw+gx),y=170;g.save();g.globalAlpha=a;g.translate(0,(1-a)*18);card(x,y,cw,ch,1);

    g.fillStyle='rgba(232,192,106,.18)';g.beginPath();g.arc(x+50,y+54,26,0,6.3);g.fill();g.strokeStyle=GOLD;g.lineWidth=1.6;g.stroke();T(''+(i+1),x+50,y+63,F(700,26,1),GOLD2,'center');

    T(e[0].toUpperCase(),x+26,y+118,F(700,16),GOLD);g.fillStyle='#fff';g.font=F(700,36,1);g.textAlign='left';wrap(e[1],x+26,y+170,cw-52,42);g.restore();});

   const a=A(4);g.globalAlpha=a;g.fillStyle='rgba(255,255,255,.85)';g.font=F(400,22);g.textAlign='left';wrap('The full programme will appear on this screen as soon as it is announced.',x0,462,Wd-2*x0,32);g.globalAlpha=1;}

  else if(p===4){const sl=(x,y,w,h,lb,v,i)=>{g.save();g.globalAlpha=A(i);card(x,y,w,h,.9);g.setLineDash([6,5]);g.strokeStyle='rgba(232,192,106,.5)';g.lineWidth=1;rr(x+6,y+6,w-12,h-12,14);g.stroke();g.setLineDash([]);T(lb.toUpperCase(),x+w/2,y+h*.38,F(700,Math.min(14,h*.18)),GOLD,'center');T(v,x+w/2,y+h*.72,F(700,Math.min(24,h*.25),1),'#fff','center');g.restore();};

   T('AGNEE 2026 · the cultural fest of GSV, made possible by',230,121,F(400,17,1),'rgba(255,255,255,.8)');

   sl(60,150,504,130,'Title Sponsor',SPON.tiers[0].s[0],0);sl(588,150,504,130,'Powered By',SPON.tiers[1].s[0],1);

   T('ASSOCIATE SPONSORS',60,318,F(700,15),GOLD);SPON.tiers[2].s.forEach((v,i)=>sl(60+i*(244.5+18),330,244.5,90,'Associate',v,2+i*.3));

   T('PARTNERS',60,454,F(700,15),GOLD);SPON.tiers[3].s.forEach((v,i)=>sl(60+i*174,466,160,84,'Partner',v.replace(' Partner',''),4+i*.3));}

  else{const a=A(0);g.save();g.globalAlpha=a;g.translate(0,(1-a)*20);T(FEST.venue,60,230,F(700,86,1),'#fff');T(FEST.host,60,278,F(500,26),GOLD2);

   g.fillStyle='rgba(255,255,255,.88)';g.font=F(400,21);g.textAlign='left';wrap('An open-air stage at the west end of the Oval Ground, with the crowd area in front, seating on both sides and food and activity stalls along the east edge.',60,332,580,30);g.restore();

   g.save();g.globalAlpha=A(2);venueMap(700,130,392,300,t);g.restore();

   ['Main stage','Crowd arena','Seating','Food stalls'].forEach((l,i)=>{const x=60+i*262;g.save();g.globalAlpha=A(3+i*.3);g.fillStyle='rgba(232,192,106,.12)';rr(x,478,238,48,24);g.fill();g.strokeStyle='rgba(232,192,106,.6)';g.lineWidth=1.2;g.stroke();T(l,x+119,509,F(700,17),'#fff','center');g.restore();});}

  SCRT.needsUpdate=true;}

 return{draw,n:PAGES.length};})();

SCRN.draw(-1,1,0);



// ---- Pre-Agnee stalls: name boards, one-by-one navigation with details

const LW=(x,y,z)=>{OV.updateMatrixWorld(true);return OV.localToWorld(new V(x,y,z));};

const STALLS=[

 {n:'Street Eats',c:'#e8453c',z:-11,tag:'Food',d:'Chaat, momos, rolls and cold coffee from student-run counters. The pre-Agnee food crawl starts here.'},

 {n:'Game Zone',c:'#f2a93b',z:-6.6,tag:'Games',d:'Ring toss, balloon darts, tug-of-war and other carnival games with small prizes for the winners.'},

 {n:'Photo Booth',c:'#3c9be8',z:-2.2,tag:'Fun',d:'Props, backdrops and instant prints. Pose in front of the Agnee wall and take the picture home.'},

 {n:'Face Art & Tattoos',c:'#b04ad0',z:2.2,tag:'Art',d:'Face painting, glitter tattoos and a mehndi corner, so you arrive at the fest already dressed for it.'},

 {n:'Treasure Hunt',c:'#4cc07a',z:6.6,tag:'Quest',d:'Team up, solve clues hidden around the ground and be the first back at this stall to win.'},

 {n:'Open Mic & Karaoke',c:'#e6c52e',z:11,tag:'Music',d:'Grab the mic for a song, a poem or a minute of stand-up. No sign-up needed, just walk up.'}];

STALLS.forEach(S=>{const c=document.createElement('canvas');c.width=320;c.height=100;const g=c.getContext('2d');g.fillStyle=S.c;g.fillRect(0,0,320,100);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(0,70,320,30);g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.font='800 '+(S.n.length>14?28:34)+'px Arial,sans-serif';g.shadowColor='rgba(0,0,0,.4)';g.shadowBlur=4;g.fillText(S.n,160,44);g.font='700 18px Arial,sans-serif';g.fillText('PRE-AGNEE \u00B7 '+S.tag.toUpperCase(),160,85);

 const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;const m=new THREE.Mesh(new THREE.PlaneGeometry(2.9,.9),new THREE.MeshBasicMaterial({map:t}));m.position.set(25.08,3.8,S.z);m.rotation.y=-Math.PI/2;OV.add(m);});



// ---- Sponsor wall along the north edge of the ground: AGNEE 2026 is the focus, sponsors frame it

{const c=document.createElement('canvas');c.width=2048;c.height=683;const g=c.getContext('2d');

 const gr=g.createLinearGradient(0,0,2048,683);gr.addColorStop(0,'#1b0838');gr.addColorStop(.45,'#7a1670');gr.addColorStop(1,'#e0562f');g.fillStyle=gr;g.fillRect(0,0,2048,683);

 for(let i=0;i<22;i++){g.fillStyle='rgba(255,255,255,.05)';g.beginPath();g.arc((i*197)%2048,((i*131)%683),40+(i*23)%90,0,6.283);g.fill();}

 g.strokeStyle='#ffc233';g.lineWidth=8;g.strokeRect(10,10,2028,663);g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=2;g.strokeRect(24,24,2000,635);

 const rr=(x,y,w,h,r)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();};

 const slot=(x,y,w,h,lb,v,fs)=>{g.fillStyle='rgba(255,255,255,.12)';rr(x,y,w,h,18);g.fill();g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=3;g.setLineDash([12,8]);g.stroke();g.setLineDash([]);g.textAlign='center';g.fillStyle='#ffcf8a';g.font='700 '+Math.round(fs*.55)+'px Arial,sans-serif';g.fillText(lb.toUpperCase(),x+w/2,y+h*.3);g.fillStyle='#fff';g.font='800 '+fs+'px Arial,sans-serif';g.fillText(v,x+w/2,y+h*.7);};

 g.textAlign='center';g.fillStyle='#ffe3b0';g.font='700 28px Arial,sans-serif';g.fillText('GATI SHAKTI VISHWAVIDYALAYA PRESENTS',1024,78);

 const tg=g.createLinearGradient(0,110,0,260);tg.addColorStop(0,'#ffffff');tg.addColorStop(.6,'#ffe2a8');tg.addColorStop(1,'#ff9a5a');g.fillStyle=tg;g.font='900 215px Arial,sans-serif';g.shadowColor='rgba(0,0,0,.45)';g.shadowBlur=24;if(WMI.naturalWidth)g.drawImage(WMI,1024-290,70,580,189);else g.fillText('AGNEE',1024,262);g.shadowBlur=0;

 g.fillStyle='#ffc233';g.font='800 56px Arial,sans-serif';g.fillText((WMI.naturalWidth?'':'2026 · ')+'THE CULTURAL FEST OF GSV',1024,322);

 g.fillStyle='rgba(255,255,255,.16)';rr(704,338,640,40,20);g.fill();g.fillStyle='#fff';g.font='700 22px Arial,sans-serif';g.fillText('OVAL GROUND · DATES ANNOUNCING SOON',1024,366);
const sbiImg = new Image();
sbiImg.src = 'assets/sponsors/sbi.webp';
const ubiImg = new Image();
ubiImg.src = 'assets/sponsors/ubi.webp';
let sbiLoaded = false, ubiLoaded = false;
sbiImg.onload = () => { sbiLoaded = true; drawSponsors(); };
ubiImg.onload = () => { ubiLoaded = true; drawSponsors(); };

let wt = null; // sponsor wall texture, set once it exists
function drawSponsors() {
  g.clearRect(40, 50, 380, 280);
  g.clearRect(1640, 50, 380, 280);
  
  // Title Sponsor (SBI)
  g.fillStyle = 'rgba(255,255,255,0.06)';
  g.fillRect(44, 60, 360, 250);
  g.strokeStyle = 'rgba(216,182,106,0.5)';
  g.strokeRect(44, 60, 360, 250);
  g.fillStyle = '#d8b66a';
  g.font = '700 22px system-ui,sans-serif';
  g.fillText('Title Sponsor', 64, 94);
  if (sbiLoaded) {
    g.drawImage(sbiImg, 64, 115, 320, 140);
  } else {
    g.fillStyle = '#fff';
    g.font = '700 28px system-ui,sans-serif';
    g.fillText('State Bank of India', 64, 180);
  }

  // Powered By (UBI)
  g.fillStyle = 'rgba(255,255,255,0.06)';
  g.fillRect(1644, 60, 360, 250);
  g.strokeStyle = 'rgba(216,182,106,0.5)';
  g.strokeRect(1644, 60, 360, 250);
  g.fillStyle = '#d8b66a';
  g.font = '700 22px system-ui,sans-serif';
  g.fillText('Powered By', 1664, 94);
  if (ubiLoaded) {
    g.drawImage(ubiImg, 1664, 115, 320, 140);
  } else {
    g.fillStyle = '#fff';
    g.font = '700 28px system-ui,sans-serif';
    g.fillText('Union Bank of India', 1664, 180);
  }
  if (wt) wt.needsUpdate = true;
}
drawSponsors();

 g.textAlign='left';g.fillStyle='#ffcf8a';g.font='700 26px Arial,sans-serif';g.fillText('ASSOCIATE SPONSORS',44,414);

 for(let i=0;i<4;i++)slot(44+i*500,428,470,100,'Associate Sponsor','Announcing soon',30);

 g.textAlign='left';g.fillStyle='#ffcf8a';g.font='700 26px Arial,sans-serif';g.fillText('PARTNERS',44,566);

 SPON.tiers[3].s.forEach((v,i)=>slot(44+i*326,580,304,82,'Partner',v.replace(' Partner',''),28));

 const tx=wt=new THREE.CanvasTexture(c);tx.encoding=THREE.sRGBEncoding;tx.anisotropy=renderer.capabilities.getMaxAnisotropy();

 const wm=new THREE.Mesh(new THREE.BoxGeometry(24,8,.6),[dk,dk,dk,dk,new THREE.MeshBasicMaterial({map:tx}),dk]);wm.position.set(2,4.6,-21.5);wm.castShadow=true;OV.add(wm);

 [-10.5,14.5].forEach(x=>bx(.7,9.4,.9,0x2b2f3a,x,4.7,-21.6));

 bx(25,.4,.9,MB(0xffd9a0),2,8.85,-21.1);bx(25,.3,.5,0x2b2f3a,2,.15,-21.2);

 [-8,-2,4,10].forEach(x=>{const l=bx(.5,.4,.6,MB(0xfff3c4),x,9,-20.7);});}

const gcap=dm('gcap','<small>Entrance gate</small><b>Welcome to <img class="wmi" style="height:22px" alt="Agnee" src="'+WMURI+'"></b>');

const stl=dm('stl stS','<div class="sk"></div><div class="sn"></div><em class="st"></em><p class="sd"></p><div class="sm">Timings announcing soon</div><div class="srow"><button data-s="prev" type="button">\u2039 Prev</button><button data-s="next" class="pri" type="button">Next stall \u203A</button></div><div class="sdots">'+STALLS.map((_,i)=>'<i data-i="'+i+'"></i>').join('')+'</div><div class="srow"><button data-s="stage" type="button">Stage</button><button data-s="wall" type="button">Sponsors</button><button data-s="gate" type="button">Entrance</button><button data-s="free" type="button">Free roam</button></div>');

const GRD={i:0,t0:0,D:2,P0:new V(),T0:new V(),P1:new V(),P2:new V(),P3:new V(),tg:new V(),cp:new V(),lk:new V(),fov:44,fov0:44,arr:false,

 enter(i){if(mode==='stage')STG.sui0();mode='ground';setOn(bOval);this.go(i);},

 kind:'stall',

 begin(){this.P0.copy(camPos);this.T0.copy(camTgt);this.fov0=cam.fov;const d=this.P0.distanceTo(this.P3);this.D=clamp(1.3+d/55,1.8,4.4);this.t0=now;this.arr=false;},

 wall(){if(mode==='stage')STG.sui0();mode='ground';setOn(bOval);const asp=view.clientWidth/Math.max(1,view.clientHeight),tv=Math.tan(17*Math.PI/180),d=Math.max(5.6/tv,12.6/(asp*tv))+1.5;

  this.P3.copy(LW(2,4.4,-21.2+d));this.tg.copy(LW(2,3.7,-21.2));this.kind='wall';this.begin();},

 go(i){const n=STALLS.length;this.i=(i+n)%n;const S=STALLS[this.i];this.P3.copy(LW(16,3.7,S.z-4.5));this.tg.copy(LW(27,2.4,S.z));

  this.kind='stall';this.begin();

  stl.style.setProperty('--sc',S.c);stl.querySelector('.sk').textContent='Stall '+(this.i+1)+' of '+n;stl.querySelector('.sn').textContent=S.n;stl.querySelector('.st').textContent='Pre-Agnee \u00B7 '+S.tag;stl.querySelector('.sd').textContent=S.d;

  stl.querySelectorAll('.sdots i').forEach((e,k)=>e.classList.toggle('on',k===this.i));},

 step(){TOUR.direct=true;OV.userData.target=1;const u=clamp((now-this.t0)/this.D),e=ease5(u),up=Math.min(30,this.P0.distanceTo(this.P3)*.2);

  this.P1.set(lerp(this.P0.x,this.P3.x,.3),Math.max(this.P0.y,this.P3.y)+up,lerp(this.P0.z,this.P3.z,.3));this.P2.set(lerp(this.P0.x,this.P3.x,.7),this.P3.y+up*.5,lerp(this.P0.z,this.P3.z,.7));

  bez(this.cp,this.P0,this.P1,this.P2,this.P3,e);this.lk.copy(this.T0).lerp(this.tg,ease5(clamp(u/.9)));this.fov=lerp(this.fov0,44,e);

  if(u>=1){this.arr=true;this.cp.copy(this.P3);this.cp.z+=Math.sin(now*.5)*.35;this.cp.y+=Math.sin(now*.37)*.12;this.lk.copy(this.tg);}}};

stl.querySelector('[data-s=prev]').onclick=()=>GRD.go(GRD.i-1);

stl.querySelector('[data-s=next]').onclick=()=>GRD.go(GRD.i+1);

stl.querySelector('[data-s=stage]').onclick=()=>STG.enter(false);

stl.querySelector('[data-s=gate]').onclick=()=>STG.enter(true);

stl.querySelector('[data-s=free]').onclick=()=>enterOF();

stl.querySelector('[data-s=wall]').onclick=()=>GRD.wall();

const spw=dm('stl stW','<div class="sk">Sponsor wall</div><div class="sn"><img class="wmi" style="height:34px" alt="Agnee" src="'+WMURI+'"></div><em class="st">Cultural Fest of GSV</em><p class="sd">'+FEST.name+' 2026 is the cultural fest of '+FEST.host+', held at the '+FEST.venue+'. The sponsors below make it happen. State Bank of India (Title Sponsor) and Union Bank of India (Powered By) lead our official fest partners.</p>'+SPON.tiers.map(t=>'<div class="spt"><b>'+t.t+'</b><span>'+sponTxt(t)+'</span></div>').join('')+'<div class="srow"><button data-s="stalls" type="button">Stalls</button><button data-s="stage" type="button">Stage</button><button data-s="free" type="button">Free roam</button></div>');

spw.querySelector('[data-s=stalls]').onclick=()=>GRD.enter(0);spw.querySelector('[data-s=stage]').onclick=()=>STG.enter(false);spw.querySelector('[data-s=free]').onclick=()=>enterOF();

stl.querySelectorAll('.sdots i').forEach(e=>e.onclick=()=>GRD.go(+e.dataset.i));

document.addEventListener('keydown',e=>{if(mode!=='ground'||fest.isOpen)return;if(GRD.kind==='wall'){if(e.key==='Escape'){mode='oval';setOn(bOval);}return;}if(e.key==='ArrowRight')GRD.go(GRD.i+1);else if(e.key==='ArrowLeft')GRD.go(GRD.i-1);

 if(mode==='rajabaug'){if(e.key==='ArrowRight')RB_NAV.go(RB_NAV.i+1);else if(e.key==='ArrowLeft')RB_NAV.go(RB_NAV.i-1);else if(e.key==='Escape')RB_NAV.close();}else if(e.key==='Escape'){mode='oval';setOn(bOval);}});

// journey controller

const TOUR={active:false,i:-1,ph:'',t0:0,D:4,P0:new V(),T0:new V(),P1:new V(),P2:new V(),P3:new V(),tg:new V(),cp:new V(),lk:new V(),fov:41,direct:false,aE:0,w:.1,sgn:1,first:false,dwell:3.2,

 start(){fest.close();this.active=true;this.i=-1;view.classList.remove('landing');view.classList.add('tour','cg');hint.style.display='none';mode='tour';setOn(null);this.next();},

 next(){this.i++;const S=ST[this.i];if(!S||S.id==='oval'){this.finish();return;}this.begin();},

 begin(){const S=ST[this.i],P0=this.P0,P3=this.P3;this.ph='travel';this.t0=now;P0.copy(camPos);this.T0.copy(camTgt);this.first=this.i===0;this.dwell=S.dwell||3.2;

  if(S.path){P3.copy(gP.getPoint(0));this.tg.copy(gL.getPoint(0));}

  else{this.tg.copy(wp(S.x,S.y,14));const a=Math.atan2(P0.x-this.tg.x,P0.z-this.tg.z);this.sgn=(this.i%2)?1:-1;this.w=.1*this.sgn;this.aE=a+this.sgn*.55;P3.set(this.tg.x+Math.sin(this.aE)*S.R,S.Hc,this.tg.z+Math.cos(this.aE)*S.R);}

  const dist=P0.distanceTo(P3);this.D=this.first?5.4:clamp(3+dist/95,3.4,6);

  if(this.first){this.P1.set(lerp(P0.x,P3.x,.35),P0.y*.55,lerp(P0.z,P3.z,.35));this.P2.set(lerp(P0.x,P3.x,.8),P3.y+70,lerp(P0.z,P3.z,.8));}

  else{const yHi=Math.max(P0.y,P3.y,Math.min(120,40+dist*.2));this.P1.copy(AFarc(P0,P3,.3,yHi,1));this.P2.copy(AFarc(P0,P3,.72,Math.max(yHi*.8,P3.y+30),-.55));}

  tcap.classList.remove('on');tpC.textContent=S.chap;tpN.textContent=S.n?S.n+' / '+S.of:'';tseg.forEach((e,k)=>{e.className=k<this.i?'d':k===this.i?'c':'';});},

 showCap(){const S=ST[this.i];tcK.textContent=S.chap+(S.n?' \u00B7 '+S.n+' of '+S.of:'');tcN.textContent=S.name;tcT.textContent=S.tag;tcT.style.display=S.tag?'':'none';tcSub.textContent=S.sub;tcap.classList.add('on');},

 step(){const S=ST[this.i],el=now-this.t0;this.direct=true;

  if(this.ph==='travel'){const u=clamp(el/this.D),e=ease5(u);bez(this.cp,this.P0,this.P1,this.P2,this.P3,e);this.lk.copy(this.T0).lerp(this.tg,ease5(clamp(u/.9)));this.fov=36+12*Math.pow(Math.sin(Math.PI*u),1.2)+(this.first?8*(1-u):0);

   if(u>=1){this.ph=S.path?'path':'dwell';this.t0=now;this.showCap();}}

  else if(this.ph==='path'){const u=clamp(el/7),e=ease(u);gP.getPoint(e,this.cp);gL.getPoint(e,this.lk);this.fov=lerp(54,40,e);if(u>=1)this.next();}

  else{const a=this.aE+this.w*(el+(Math.exp(-1.5*el)-1)/1.5);this.cp.set(this.tg.x+Math.sin(a)*S.R,S.Hc+Math.sin(now*.7)*1.2,this.tg.z+Math.cos(a)*S.R);this.lk.copy(this.tg);this.fov+=(38-this.fov)*.04;if(el>=this.dwell)this.next();}},

 finish(){this.active=false;tcap.classList.remove('on');view.classList.remove('tour');mode='oval';setOn(bOval);},

 abort(){this.active=false;tcap.classList.remove('on');view.classList.remove('tour');if(mode!=='oval')view.classList.remove('cg');},

 ui(){if(this.active&&mode!=='tour'&&mode!=='oval')this.abort();

  enterBtn.classList.toggle('on',mode==='oval'&&AF.arrived&&now-AF.t0-AF.D>2.4&&!fest.isOpen);}};



// ---- Enter the Fest: zoom to the stage, show the fest information on the big screen

const STG={p0:0,pg:0,pt:0,hold:0,t0:0,D:3.8,arrived:false,fov:44,P0:new V(),T0:new V(),P1:new V(),P2:new V(),P3:new V(),tg:new V(),cp:new V(),lk:new V(),lastDraw:0,

 enter(gate){fest.close();const asp=view.clientWidth/Math.max(1,view.clientHeight),tv=Math.tan(17*Math.PI/180),d=Math.max(7.8/tv,11.4/(asp*tv))+1;

  OV.updateMatrixWorld(true);this.tg.copy(OV.localToWorld(new V(-33.2,5.7,0)));this.P3.copy(OV.localToWorld(new V(-33.2+d,5.5,0)));

  this.P0.copy(camPos);this.T0.copy(camTgt);const dist=this.P0.distanceTo(this.P3),yHi=Math.max(this.P0.y,this.P3.y,Math.min(130,40+dist*.2));

  this.P1.copy(AFarc(this.P0,this.P3,.3,yHi,1));this.P2.copy(AFarc(this.P0,this.P3,.72,Math.max(yHi*.7,this.P3.y+22),-.55));

  this.D=clamp(2.8+dist/110,3.4,5);this.cv=null;this.gate=!!gate;

  if(gate){const gO=LW(68,8.5,0),gI=LW(38,7.2,0),mid=LW(2,7.2,0),h=this.P0.clone().lerp(gO,.5);h.y=Math.max(gO.y+12,h.y);this.gC=LW(44.5,6.2,0);this.cv=new THREE.CatmullRomCurve3([this.P0.clone(),h,gO,gI,mid,this.P3.clone()],false,'centripetal');this.D=10;}

  this.t0=now;this.arrived=false;this.pg=0;this.pt=now;this.hold=0;this.fov=44;sui.classList.remove('rdy');mode='stage';setOn(bOval);},

 step(){const el=now-this.t0,u=clamp(el/this.D),e=ease5(u);TOUR.direct=true;OV.userData.target=1;

  if(this.cv){const tt=u*u*(3-2*u);this.cv.getPoint(tt,this.cp);this.lk.copy(this.T0).lerp(this.gC,ease5(clamp(u/.4)));if(u>.45)this.lk.copy(this.gC).lerp(this.tg,ease5(clamp((u-.45)/.45)));this.fov=lerp(46,34,tt);gcap.classList.toggle('on',u>.28&&u<.62);}

  else{bez(this.cp,this.P0,this.P1,this.P2,this.P3,e);this.lk.copy(this.T0).lerp(this.tg,ease5(clamp(u/.9)));this.fov=lerp(46,34,e);}

  if(u>=1){if(!this.arrived){this.arrived=true;this.pt=now;sui.classList.add('rdy');}this.cp.copy(this.P3);this.cp.x+=Math.sin(now*.4)*.25;this.cp.y+=Math.sin(now*.31)*.12;this.lk.copy(this.tg);

   if(now>this.hold&&now-this.pt>7)this.go((this.pg+1)%SCRN.n,false);}},

 go(i,manual){this.pg=i;this.pt=now;if(manual)this.hold=now+20;sui.querySelectorAll('[data-p]').forEach(b=>b.classList.toggle('on',+b.dataset.p===i));const copy=sui.querySelector('.stage-copy');if(copy){copy.querySelector('strong').textContent=STAGE_PAGES[i];copy.querySelector('span').textContent=['The Agnee 2026 cultural fest at Gati Shakti Vishwavidyalaya.','Events and programme details will be announced soon.','Stay tuned for the latest Agnee 2026 updates.','Explore the Oval Ground venue and festival spaces.','Official fest sponsors: State Bank of India & Union Bank of India.'][i];}sui.querySelector('.stage-dots').innerHTML=STAGE_PAGES.map((_,n)=>'<i class="'+(n===i?'on':'')+'"></i>').join('');},

 sui0(){sui.classList.remove('rdy');},

 leave(){sui.classList.remove('rdy');mode='oval';setOn(bOval);},

 occ:null,

 ui(){const on=mode==='stage';view.classList.toggle('stage',on);view.classList.toggle('ovfree',mode==='ovfree');view.classList.toggle('ground',mode==='ground');view.classList.toggle('wallv',mode==='ground'&&GRD.kind==='wall');if(!on)gcap.classList.remove('on');

  if(!this.occ){this.occ=[...SGP.hide,...beams,...agBeams,...haze,...SG.children.filter(m=>m.position.x>=3.4&&m.position.y>=8.5)];this.ov=false;}

  if(on!==this.ov){this.ov=on;this.occ.forEach(m=>m.visible=!on);}

  if(on&&this.arrived&&now-this.lastDraw>.04){this.lastDraw=now;SCRN.draw(this.pg,now-this.pt,now);this.drawn=true;}

  else if(!on&&this.drawn){this.drawn=false;SCRN.draw(-1,1,0);}}};

const ovui=dm('ovui','<button data-a="stage" type="button">\u2605 Go to the stage</button><button data-a="stalls" type="button">Stalls</button><button data-a="wall" type="button">Sponsors</button><button data-a="orbit" type="button">Auto tour</button>');

ovui.querySelector('[data-a=stage]').onclick=()=>STG.enter(false);

ovui.querySelector('[data-a=stalls]').onclick=()=>GRD.enter(0);

ovui.querySelector('[data-a=wall]').onclick=()=>GRD.wall();

ovui.querySelector('[data-a=orbit]').onclick=()=>{mode='oval';setOn(bOval);};

const sui=dm('stgui','<button class="sback" type="button">← Back to venue</button><button class="sfull" type="button">Full details</button><div class="stabs"><button data-p="0" type="button">About</button><button data-p="1" type="button">Events</button><button data-p="2" type="button">Stay tuned</button><button data-p="3" type="button">Venue</button><button data-p="4" type="button">Sponsors</button><button data-a="stalls" type="button">Stalls \u203A</button></div><div class="stage-copy" aria-live="polite"><strong></strong><span></span></div><div class="stage-dots" aria-hidden="true"></div>');

sui.querySelector('.sback').onclick=()=>STG.leave();

sui.querySelector('.sfull').onclick=()=>fest.open();

sui.querySelector('[data-a=stalls]').onclick=()=>GRD.enter(0);

sui.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>STG.go(+b.dataset.p,true));

let stageSwipeX=0;

canvas.addEventListener('pointerdown',e=>{if(mode==='stage')stageSwipeX=e.clientX;},{passive:true});

canvas.addEventListener('pointerup',e=>{if(mode!=='stage')return;const dx=e.clientX-stageSwipeX;if(Math.abs(dx)>42)STG.go((STG.pg+(dx<0?1:SCRN.n-1))%SCRN.n,true);},{passive:true});

{const t=document.getElementById('t10');if(t)t.innerHTML='<img class="wmi" style="height:15px" alt="Agnee" src="'+WMURI+'"> · The Cultural Fest — Oval Ground';const b=document.getElementById('bOval');if(b)b.innerHTML='★ <img class="wmi" style="height:15px" alt="Agnee" src="'+WMURI+'"> Fest';}

enterBtn.onclick=()=>STG.enter(true);

document.addEventListener('keydown',e=>{if(mode!=='stage'||fest.isOpen)return;if(e.key==='ArrowRight')STG.go((STG.pg+1)%SCRN.n,true);else if(e.key==='ArrowLeft')STG.go((STG.pg+SCRN.n-1)%SCRN.n,true);else if(e.key==='Escape')STG.leave();});

tq('#tSkip').onclick=()=>{if(TOUR.active)TOUR.finish();};

tq('#tFree').onclick=()=>{TOUR.abort();toFree();};

land.querySelector('#goFest').onclick=()=>TOUR.start();

land.querySelector('#goFree').onclick=()=>{view.classList.remove('landing');hint.style.display='';hint.style.opacity=1;setTimeout(()=>hint.style.opacity=0,6000);goFree();};



// ---- Rajabaug Pre-Agnee Stalls Counter Navigator

const RB_NAV = {

  i: 0,

  t0: 0,

  D: 2.2,

  P0: new V(),

  T0: new V(),

  P1: new V(),

  P2: new V(),

  P3: new V(),

  tg: new V(),

  cp: new V(),

  lk: new V(),

  fov: 42,

  fov0: 42,

  active: false,

  overview: false,



  stalls: [

    { num: 1, name: 'Ring Toss & Bulls-Eye', tag: 'Carnival Game', desc: 'Toss rings onto colored glass bottles to win official Agnee badges & prizes!', c: '#e86820', x: -16, z: -16.5, rot: 0 },

    { num: 2, name: 'Balloon Dart Blitz', tag: 'Action Game', desc: 'Pop 3 target balloons in a row with precision darts for Agnee vouchers!', c: '#1d55b8', x: -7, z: -16.5, rot: 0 },

    { num: 3, name: 'Can Knockout Alley', tag: 'Skill Game', desc: 'Knock down the silver tin can pyramid in a single clean baseball strike!', c: '#ce2626', x: 2, z: -16.5, rot: 0 },

    { num: 4, name: 'Agnee VR & Gaming Arcade', tag: 'Arcade Hub', desc: 'Challenge friends at 90s retro arcade gaming and VR experiences!', c: '#1f8a4e', x: 11, z: -16.5, rot: 0 },

    { num: 5, name: 'Fortune Wheel & Lucky Draw', tag: 'Prize Spin', desc: 'Spin the giant 12-segment carnival wheel for fest merch and concert passes!', c: '#7b2391', x: 20, z: -16.5, rot: 0 },

    { num: 6, name: 'Face Art & Glitter Tattoos', tag: 'Art Studio', desc: 'Vibrant tribal face paint, neon glowing decals, and metallic fest tattoos!', c: '#e86820', x: -16, z: 16.5, rot: Math.PI },

    { num: 7, name: 'Agnee Merch & Souvenirs', tag: 'Official Shop', desc: 'Exclusive Agnee 2026 hoodies, embroidered caps, lanyards, and sticker packs!', c: '#1d55b8', x: -7, z: 16.5, rot: Math.PI },

    { num: 8, name: 'Popcorn & Candy Floss', tag: 'Festival Treats', desc: 'Fresh hot buttered popcorn, twirled cotton candy, and chilled fruit slushies!', c: '#ce2626', x: 2, z: 16.5, rot: Math.PI },

    { num: 9, name: 'Chai & Street Munchies', tag: 'Campus Food', desc: 'Traditional cutting masala chai with steaming golden samosas and spicy bites!', c: '#1f8a4e', x: 11, z: 16.5, rot: Math.PI },

    { num: 10, name: 'Polaroid Memory Wall', tag: 'Photo Zone', desc: 'Capture instant retro Polaroid snapshots and pin your memory onto the wall!', c: '#7b2391', x: 20, z: 16.5, rot: Math.PI }

  ],



  enter(index = 0) {

    this.active = true;

    this.overview = false;

    mode = 'rajabaug';

    const bRaj = document.getElementById('bRaj');

    if (typeof setOn === 'function') setOn(bRaj);

    this.go(index);

  },



  showOverview() {

    this.overview = true;

    mode = 'rajabaug';

    this.P0.copy(camPos);

    this.T0.copy(camTgt);

    this.t0 = now;

    this.D = 2.4;

    // Overview bird's eye view looking down at Rajabaug from southeast

    this.P3.set(-109.5 + 34, 30, -26 + 34);

    this.tg.set(-109.5, 3, -26);

    this.fov = 44;

    this.updateUI();

  },



  go(index) {

    const n = this.stalls.length;

    this.i = (index + n) % n;

    this.overview = false;

    mode = 'rajabaug';

    const s = this.stalls[this.i];

    

    // World coordinates of this stall

    // Rajabaug center is RB_CX = 256 - W / 2 = -119.5, RB_CZ = 189 - H / 2 = -26

    const wx = -109.5 + s.x;

    const wz = -26 + s.z;



    this.P0.copy(camPos);

    this.T0.copy(camTgt);

    this.fov0 = cam.fov;

    this.t0 = now;



    // North stalls (1-5, z = -21): front faces South (+Z)

    // Eye stands in front of the counter (+4.8m) looking North into the stall

    // South stalls (6-10, z = 21): front faces North (-Z)

    // Eye stands in front of the counter (-4.8m) looking South into the stall

    const camDist = 5.8;

    const camH = 2.35;

    const tgtH = 1.45;

    if (s.rot === 0) {

      this.P3.set(wx, camH, wz + camDist);

      this.tg.set(wx, tgtH, wz + 0.4);

    } else {

      this.P3.set(wx, camH, wz - camDist);

      this.tg.set(wx, tgtH, wz - 0.4);

    }



    const d = this.P0.distanceTo(this.P3);

    this.D = clamp(1.4 + d / 45, 1.6, 3.8);

    this.fov = 40;

    this.updateUI();

  },



  step() {

    TOUR.direct = true;

    const u = clamp((now - this.t0) / this.D);

    const e = ease5(u);

    const up = Math.min(22, this.P0.distanceTo(this.P3) * 0.18);

    this.P1.set(lerp(this.P0.x, this.P3.x, 0.35), Math.max(this.P0.y, this.P3.y) + up, lerp(this.P0.z, this.P3.z, 0.35));

    this.P2.set(lerp(this.P0.x, this.P3.x, 0.72), this.P3.y + up * 0.4, lerp(this.P0.z, this.P3.z, 0.72));

    bez(this.cp, this.P0, this.P1, this.P2, this.P3, e);

    this.lk.copy(this.T0).lerp(this.tg, ease5(clamp(u / 0.9)));

    this.fov = lerp(this.fov0, this.overview ? 46 : 40, e);

    if (u >= 1) {

      this.cp.copy(this.P3);

      if (!this.overview) {

        this.cp.x += Math.sin(now * 0.4) * 0.12;

        this.cp.y += Math.sin(now * 0.35) * 0.06;

      }

      this.lk.copy(this.tg);

    }

  },



  close() {

    this.active = false;

    mode = 'explore';

    if (typeof toFree === 'function') toFree();

    this.hideUI();

  },



  updateUI() {

    const el = document.getElementById('rbNav');

    if (!el) return;

    el.hidden = false;

    const s = this.stalls[this.i];

    el.style.setProperty('--rb-col', s.c);



    const numSpan = document.getElementById('rbCurNum');

    if (numSpan) numSpan.textContent = this.overview ? 'OVERVIEW' : (this.i + 1);



    const titleEl = document.getElementById('rbStallTitle');

    if (titleEl) titleEl.textContent = this.overview ? 'Rajabaug Garden Overview' : ('Counter ' + s.num + ': ' + s.name);



    const tagEl = document.getElementById('rbStallTag');

    if (tagEl) tagEl.textContent = this.overview ? '10 Fun Stalls' : s.tag;



    const descEl = document.getElementById('rbStallDesc');

    if (descEl) descEl.textContent = this.overview ? 'Use Prev / Next or click any number below to walk up directly to each counter.' : s.desc;



    const priceEl = document.getElementById('rbStallPrice');

    if (priceEl) priceEl.textContent = this.overview ? '🎪 10 Festive Counters' : (s.price || '🎟️ Free Entry');



    const rewardEl = document.getElementById('rbStallReward');

    if (rewardEl) rewardEl.textContent = this.overview ? '★ Pre-Agnee Carnival' : (s.reward || '🏆 Fest Prizes');



    // Contextual action box

    const actionBox = document.getElementById('rbStallAction');

    if (actionBox) {

      if (this.overview) {

        actionBox.innerHTML = '<button type="button" class="rb-action-btn" onclick="window.RB_NAV?.go(0)">Explore Counter 1 →</button>';

      } else if (s.isMerch || s.num === 7) {

        // OFFICIAL MERCHANDISE SELLING ACTION & DIRECT LINK

        actionBox.innerHTML = `

          <div class="rb-merch-promo">

            <div class="rb-merch-pills">

              <span class="pill">🖤 Eclipse Black</span>

              <span class="pill">🔥 Inferno Red</span>

              <span class="pill">🤍 Ethereal White</span>

            </div>

            <div class="rb-merch-btns">

              <button type="button" class="rb-action-btn merch-btn" id="rbMerchScrollBtn">🛍️ Browse Merch Section (₹499)</button>

              <a class="rb-action-link" href="https://forms.gle/fzC46cAi2thMU7Er7" target="_blank" rel="noopener noreferrer">Order via Form ↗</a>

            </div>

          </div>

        `;

        document.getElementById('rbMerchScrollBtn')?.addEventListener('click', () => {

          document.getElementById('merch')?.scrollIntoView({ behavior: 'smooth' });

        });

      } else {

        // Other stalls helper info

        actionBox.innerHTML = `

          <div class="rb-stall-helper">

            <span class="rb-helper-timing">🕒 Pre-Agnee Day · 4:00 PM – 10:00 PM</span>

            <button type="button" class="rb-action-btn-ghost" onclick="window.RB_NAV?.go(6)">🛍️ Visit Merch Counter (#7) →</button>

          </div>

        `;

      }

    }



    // Update dots

    const dotsContainer = document.getElementById('rbDots');

    if (dotsContainer) {

      dotsContainer.querySelectorAll('button').forEach((b, k) => {

        b.classList.toggle('active', !this.overview && k === this.i);

      });

    }

  },



  hideUI() {

    const el = document.getElementById('rbNav');

    if (el) el.hidden = true;

  }

};

window.RB_NAV = RB_NAV;



function goIdle(){mode='idle';setOn(null);}



function frame(ms){

 if(window.AGNEE_RUNTIME.paused){window.AGNEE_RUNTIME.raf=0;return;}

 now=ms/1000;if(t0===null){t0=now;last=now;}

 const dt=Math.min(.05,now-last);last=now;const t=now-t0;
let bldsDone = false;
if(!perfAdjusted&&t>0){perfElapsed+=dt;perfSamples++;if(perfElapsed>=2){const fps=perfSamples/perfElapsed;if(fps<40){renderer.setPixelRatio(1);window.AGNEE_RUNTIME.lite=true;}else if(!isLowEndDevice){renderer.setPixelRatio(isMobileDevice ? Math.min(devicePixelRatio, 1.25) : Math.min(devicePixelRatio,1.5));}renderer.setSize(view.clientWidth,view.clientHeight,false);perfAdjusted=true;}}

 // rise
if(!bldsDone){if(RM||t>=3.6){blds.forEach(b=>{b.m.scale.y=1;});bldsDone=true;}else{blds.forEach(b=>{b.m.scale.y=Math.max(.001,back(clamp((t-b.d)/1.3)));});}}

 // pin drop + bob

 const drop=RM?1:clamp((t-1.8)/1);pin.position.y=28+lerp(160,0,back(drop)>1?1:drop*drop)+Math.sin(now*2.2)*2*drop;pin.visible=drop>0;

 // beacon

 [0,1].forEach(i=>{const k=((now*.5)+i*.5)%1;rings[i].scale.setScalar(4+k*30);rings[i].material.opacity=(1-k)*.8;});

 // camera targets

 let dp,dt2=T0.clone(),k=1-Math.exp(-dt*3);AF.fly=false;OV.userData.target=0;TOUR.direct=false;

 if(mode==='intro'){const u=ease(clamp(t/4.6));dp=oPos({theta:lerp(0,.3,u),phi:lerp(.03,.95,u),r:lerp(780,680,u)});k=1-Math.exp(-dt*8);if(t>4.8)goIdle();}

 else if(mode==='idle'){dp=oPos({theta:.3+now*.035,phi:.98,r:700});}

 else if(mode==='tour'){TOUR.step();dp=TOUR.cp;dt2=TOUR.lk;}

 else if(mode==='stage'){STG.step();dp=STG.cp;dt2=STG.lk;}

 else if(mode==='ground'){GRD.step();dp=GRD.cp;dt2=GRD.lk;}

 else if(mode==='rajabaug'){RB_NAV.step();dp=RB_NAV.cp;dt2=RB_NAV.lk;}

 else if(mode==='oval'){const el=now-AF.t0,u=clamp(el/AF.D),oR=q=>95+14*Math.sin(q*.31),oH=q=>62+9*Math.sin(q*.23),oT=new V(240-W/2-4,6,270-H/2+4),P3=orbAt(AF.a0,oR(AF.D),oH(AF.D));

  if(u<1){AF.fly=true;AF.u=u;const e=ease5(u),P0=AF.P0,dist=P0.distanceTo(P3),yHi=Math.max(P0.y,P3.y,Math.min(150,70+dist*.2)),

   P1=AFarc(P0,P3,.3,yHi,1),P2=AFarc(P0,P3,.72,Math.max(yHi*.75,P3.y+35),-.55),

   k1=1-e,b0=k1*k1*k1,b1=3*k1*k1*e,b2=3*k1*e*e,b3=e*e*e;

   dp=new V(P0.x*b0+P1.x*b1+P2.x*b2+P3.x*b3,P0.y*b0+P1.y*b1+P2.y*b2+P3.y*b3,P0.z*b0+P1.z*b1+P2.z*b2+P3.z*b3);

   dt2=AF.T0.clone().lerp(oT,ease5(clamp(u/.85)));if(u>.45)OV.userData.target=1;}

  else{if(!AF.arrived){AF.arrived=true;lbT.classList.remove('on');lbB.classList.remove('on');agTT.classList.add('on');setTimeout(()=>agTT.classList.remove('on'),3600);}

   dp=orbAt(AF.a0+(el-AF.D)*.14,oR(el),oH(el));dp.y+=Math.sin(now*.9)*.5;dt2=oT;OV.userData.target=1;AF.u=1;}}

 else if(mode==='focus'){const a=focA+Math.sin((now-modeT)*.2)*.03,d=FR*.85,h=(typeof focTilt!=='undefined'?focTilt*2.2:.45)*FR;dp=new V(FT.x+Math.sin(a)*d,h+FT.y,FT.z+Math.cos(a)*d);dt2=FT.clone();}

 else if(mode==='hostels'){const a=.55+Math.sin(now*.18)*.45;dp=new V(645-W/2+Math.sin(a)*120,58,108-H/2+Math.cos(a)*120);dt2=new V(645-W/2,14,108-H/2);}

 else{if(mode==='ovfree'){OV.userData.target=1;clampOV();}orb.r+=(orb.rt-orb.r)*(1-Math.exp(-dt*9));if(!ptrs.size){if(window.AGNEE_RUNTIME&&(Math.abs(window.AGNEE_RUNTIME.panVx||0)>0.05||Math.abs(window.AGNEE_RUNTIME.panVz||0)>0.05)){T0.x=clamp(T0.x+window.AGNEE_RUNTIME.panVx*dt,-W*.45,W*.45);T0.z=clamp(T0.z+window.AGNEE_RUNTIME.panVz*dt,-H*.45,H*.45);const dmP=Math.exp(-dt*6.5);window.AGNEE_RUNTIME.panVx*=dmP;window.AGNEE_RUNTIME.panVz*=dmP;clampOV();}orb.theta+=orb.vt*dt;orb.phi=clamp(orb.phi+orb.vp*dt,.03,pMax());const dm=Math.exp(-dt*2.8);orb.vt*=dm;orb.vp*=dm;}dp=oPos(orb);}

 if(mode!==pMode){const inO=m=>m==='oval'||m==='stage'||m==='ovfree'||m==='ground';if(mode==='oval'&&!inO(pMode))AFstart();else if(inO(pMode)&&!inO(mode))agLeave();pMode=mode;modeT=now;}if(mode!=='focus')hideInfo();

 const bs={intro:.12,explore:.26,hostels:.9,oval:.45,focus:.9}[mode]||.6,st=mode==='intro'?bs:lerp(1.5,bs,clamp((now-modeT)/2.2));

 if(AF.fly||TOUR.direct){camPos.copy(dp);camTgt.copy(dt2);camV.set(0,0,0);tgtV.set(0,0,0);}else{sd(camPos,camV,dp,st,dt);sd(camTgt,tgtV,dt2,st*.8,dt);}

 const fv=AF.fly?(RM?41:34+17*Math.pow(Math.sin(Math.PI*AF.u),1.4)-5*Math.pow(clamp((AF.u-.8)/.2),2)):(mode==='tour'?TOUR.fov:mode==='stage'?STG.fov:mode==='ground'?GRD.fov:mode==='rajabaug'?RB_NAV.fov:mode==='explore'?38:41);if(Math.abs(cam.fov-fv)>.02){cam.fov+=(fv-cam.fov)*(1-Math.exp(-dt*(AF.fly||mode==='tour'||mode==='stage'||mode==='ground'?5:2)));cam.updateProjectionMatrix();}cam.position.copy(camPos);cam.lookAt(camTgt);cinematic.camFx(dt);
_sV1.set(pin.position.x,pin.position.y+30,pin.position.z);place(t1,_sV1);if(typeof t12!=='undefined'&&t12)place(t12,_sV12);if(typeof t13!=='undefined'&&t13)place(t13,_sV13);if(typeof t15!=='undefined'&&t15)place(t15,_sV15);if(typeof t16!=='undefined'&&t16)place(t16,_sV16);if(typeof t17!=='undefined'&&t17)place(t17,_sV17);if(typeof t18!=='undefined'&&t18)place(t18,_sV18);if(typeof t19!=='undefined'&&t19)place(t19,_sV19);place(t3,_sV3);place(t4,_sV4);place(t5,_sV5);place(t6,_sV6);place(t7,_sV7);place(t8,_sV8);place(t9,_sV9);place(t10,_sV10);place(t11,_sV11);if(typeof t14!=='undefined'&&t14)place(t14,_sV14);window.declutterTags();

 festAnim(now);cinematic.update(dt);TOUR.ui();STG.ui();renderer.render(scene,cam);cinematic.post();

 const ld=document.getElementById('load');if(ld&&t>.2){ld.style.opacity=0;setTimeout(()=>ld.remove(),700);}

 window.AGNEE_RUNTIME.raf=requestAnimationFrame(frame);

}

document.addEventListener('visibilitychange',()=>{

 window.AGNEE_RUNTIME.paused=document.hidden;

 if(!document.hidden&&!window.AGNEE_RUNTIME.raf)window.AGNEE_RUNTIME.raf=requestAnimationFrame(frame);

});

window.addEventListener('orientationchange',()=>setTimeout(()=>window.dispatchEvent(new Event('resize')),120));

window.AGNEE_RUNTIME.raf=requestAnimationFrame(frame);

}

})();
