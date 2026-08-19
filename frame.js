(function(){
'use strict';

var body=document.body;
var REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;
var DPR=Math.min(devicePixelRatio||1,2);
var page=body.classList.contains('p-understanding')?'understanding'
        :body.classList.contains('p-team')?'team':'story';

addEventListener('load',function(){
  requestAnimationFrame(function(){ body.classList.remove('veiled'); });
});

(function(){
  var C=['assets/img/','assets/','img/',''];
  var i=0;
  function nextPaper(){
    if(i>=C.length) return;
    var u=C[i++]+'paper_texture_01.png';
    var im=new Image();
    im.onload=function(){
      document.documentElement.style.setProperty('--paper','url("'+u+'")');
    };
    im.onerror=nextPaper;
    im.src=u;
  }
  nextPaper();
})();

(function(){
  var BASES=['assets/','assets/img/','assets/team/','img/',''];
  var EXTS=['.jpg','.JPG','.jpeg','.JPEG','.png','.PNG'];
  var hit=null;
  document.querySelectorAll('img.portrait,img.pinned').forEach(function(im){
    var file=(im.getAttribute('src')||'').split('/').pop();
    if(!file) return;
    var dot=file.lastIndexOf('.');
    var stem=dot<0?file:file.slice(0,dot);
    var orig=dot<0?'':file.slice(dot);
    var cands=[];
    if(hit) cands.push(hit.b+stem+hit.e);
    BASES.forEach(function(b){
      if(orig) cands.push(b+stem+orig);
      EXTS.forEach(function(e){ if(e!==orig) cands.push(b+stem+e); });
    });
    var i=0;
    function next(){
      if(i>=cands.length){ im.style.display='none'; return; }
      im.src=cands[i++];
    }
    im.addEventListener('error',next);
    im.addEventListener('load',function(){
      var u=im.getAttribute('src')||'';
      var k=u.lastIndexOf('/');
      var d=u.lastIndexOf('.');
      if(d>k) hit={ b:u.slice(0,k+1), e:u.slice(d) };
    });
    next();
  });
})();

document.querySelectorAll('[data-leave]').forEach(function(a){
  a.addEventListener('click',function(e){
    e.preventDefault();
    body.classList.add('leaving');
    setTimeout(function(){ location.href=a.href; },560);
  });
});

function anchorList(sel){
  var out=[];
  document.querySelectorAll(sel).forEach(function(el){
    out.push({ el:el, d:parseFloat(el.getAttribute('data-depth'))||0, y:0 });
  });
  return out;
}

function measure(list){
  list.forEach(function(a){
    a.y=a.el.getBoundingClientRect().top+window.scrollY-innerHeight*0.45;
  });
}

function depthAt(list,y){
  if(!list.length) return 0;
  var f=list[0];
  if(y<=f.y) return f.d*Math.max(0,Math.min(1,y/Math.max(1,f.y)));
  for(var i=0;i<list.length-1;i++){
    var a=list[i],b=list[i+1];
    if(y<=b.y){
      var p=(y-a.y)/Math.max(1,b.y-a.y);
      return a.d+(b.d-a.d)*p;
    }
  }
  return list[list.length-1].d;
}

function markCurrent(list,y){
  var idx=0;
  for(var i=0;i<list.length;i++){ if(y>=list[i].y-1) idx=i; }
  for(var j=0;j<list.length;j++){
    list[j].el.classList.toggle('current',j===idx&&y>=list[0].y-1);
  }
}

var anchors=[],maxD=1,depthTarget=0,depthCur=0;

if(page==='understanding'){ anchors=anchorList('.depth-label[data-depth]'); }
if(page==='team'){ anchors=anchorList('.depth-tag[data-depth]'); }
if(anchors.length){ maxD=anchors[anchors.length-1].d||1; }

function readScroll(){
  if(page==='story'){
    var max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    depthTarget=Math.min(1,Math.max(0,window.scrollY/max));
    braid=Math.max(0,Math.min(1,(depthTarget-0.18)/0.66));
    return;
  }
  depthTarget=depthAt(anchors,window.scrollY);
  markCurrent(anchors,window.scrollY);
}

var gauge=document.getElementById('gauge');

function scrollForDepth(d){
  if(!anchors.length) return 0;
  var f=anchors[0];
  if(d<=f.d) return f.d?Math.max(0,f.y*(d/f.d)):0;
  for(var i=0;i<anchors.length-1;i++){
    var a=anchors[i],b=anchors[i+1];
    if(d<=b.d){
      var p=(d-a.d)/Math.max(1,b.d-a.d);
      return a.y+(b.y-a.y)*p;
    }
  }
  var last=anchors[anchors.length-1];
  return last.y+innerHeight*0.5;
}

function initGaugeDrag(){
  if(!gauge) return;
  var dragging=false;
  function depthFromY(clientY){
    var r=gauge.getBoundingClientRect();
    var p=(clientY-r.top)/Math.max(1,r.height);
    return Math.max(0,Math.min(1,p))*maxD;
  }
  function go(e){
    var d=depthFromY(e.clientY);
    var y=scrollForDepth(d);
    window.scrollTo(0,Math.max(0,y));
  }
  gauge.addEventListener('pointerenter',function(){ gauge.classList.add('live'); });
  gauge.addEventListener('pointerleave',function(){ if(!dragging) gauge.classList.remove('live'); });
  gauge.addEventListener('pointerdown',function(e){
    dragging=true;
    gauge.classList.add('live','dragging');
    try{ gauge.setPointerCapture(e.pointerId); }catch(err){}
    go(e);
    e.preventDefault();
  });
  gauge.addEventListener('pointermove',function(e){ if(dragging) go(e); });
  function end(){
    if(!dragging) return;
    dragging=false;
    gauge.classList.remove('dragging');
    if(!gauge.matches(':hover')) gauge.classList.remove('live');
  }
  gauge.addEventListener('pointerup',end);
  gauge.addEventListener('pointercancel',end);
}
var gTick=gauge?gauge.querySelector('.tick'):null;
var gRead=gauge?gauge.querySelector('.readout'):null;
var wash=document.getElementById('warmth-wash');

function paintGauge(d){
  if(!gauge) return;
  var h=gauge.clientHeight;
  var r=maxD?Math.max(0,Math.min(1,d/maxD)):0;
  if(gTick) gTick.style.top=(r*h)+'px';
  if(gRead){
    gRead.style.top=(r*h)+'px';
    gRead.textContent=String(Math.round(d)).padStart(4,'0')+' M';
  }
  if(wash) wash.style.opacity=(Math.max(0,(r-0.55)/0.45)*0.9).toFixed(3);
}

var cv=document.getElementById('ink-canvas');
var ctx=cv?cv.getContext('2d'):null;
var W=0,H=0,t=0,plumes=[],running=true;
var COLD=[[44,126,158],[19,80,110],[27,42,74]];
var WARM=[[188,132,72],[214,176,120],[232,214,186]];
var DEEP=[[19,80,110],[8,44,68],[4,25,43]];
var TO=page==='story'?WARM:DEEP;

var STRANDS=2, braid=0, braidBoost=0, ptrX=-1, ptrY=-1;

function inkScale(){
  var base = 1440;
  var k = (innerWidth || base) / base;
  return Math.max(0.85, Math.min(2.1, k));
}

function strandHome(k,n){
  if(n<=1) return W*0.5;
  var spread = (0.30-0.03*n) / Math.max(1, Math.sqrt(inkScale()));
  return W*(0.5+((k-(n-1)/2)*spread));
}

function seed(k){
  var q = inkScale();
  return { x:Math.random()*W, y:H+Math.random()*H*0.5,
    r:(Math.random()*140+60)*DPR*0.6*q, sp:(Math.random()*0.35+0.12)*DPR*Math.sqrt(q),
    sway:Math.random()*1000, i:(Math.random()*3)|0, a:Math.random()*0.05+0.02,
    s:k==null?((Math.random()*4)|0):k, off:(Math.random()-0.5)*W*0.09 };
}

function sizeCanvas(){
  if(!cv) return;
  W=cv.width=innerWidth*DPR; H=cv.height=innerHeight*DPR;
  cv.style.width=innerWidth+'px'; cv.style.height=innerHeight+'px';
  if(plumes && plumes.length){
    var q = inkScale();
    for(var i=0;i<plumes.length;i++){
      var p = plumes[i];
      if(p.__q == null) p.__q = 1;
      var f = q / p.__q;
      p.r *= f; p.sp *= Math.sqrt(f);
      p.__q = q;
      if(p.x > W) p.x = Math.random()*W;
    }
  }
  if(page==='story'&&typeof measureChart==='function') measureChart();
}

if(cv){
  sizeCanvas();
  var N=REDUCED?8:Math.round(16*Math.min(1.8, inkScale()));
  for(var i=0;i<N;i++){ var p0=seed(i%4); p0.y=Math.random()*H; plumes.push(p0); }
}

function speedMul(s){ return page==='story'?0.6+s*0.8:1.0-s*0.5; }
function alphaMul(s){ return page==='story'?0.6+s*0.7:0.92-s*0.3; }
function mixAmt(s){
  return page==='story'?Math.max(0,Math.min(1,s*1.15-0.05)):Math.max(0,Math.min(1,s*0.9));
}

var chartTop=0, chartBot=0, joinAt=[], anchorAt=[];
function measureChart(){
  var main=document.querySelector('main.page');
  var last=document.querySelector('.sea-floor')||document.body;
  var sy=window.scrollY||0;
  chartTop=main?(main.getBoundingClientRect().bottom+sy):0;
  chartBot=last.getBoundingClientRect().top+sy;
  joinAt=[];
  document.querySelectorAll('.sed[data-joins]').forEach(function(sp){
    var r=sp.getBoundingClientRect();
    joinAt.push({ n:parseInt(sp.dataset.joins,10), y:r.top+sy+r.height*0.5 });
  });
  joinAt.sort(function(a,b){ return a.y-b.y; });
  anchorAt=[];
  document.querySelectorAll('.story-stanza.told').forEach(function(st,i){
    var box=st.querySelector('p')||st;
    var r=box.getBoundingClientRect();
    if(!r.height) return;
    var side=(i%2===0)?-1:1;
    anchorAt.push({
      el:st,
      y:r.top+sy+Math.min(46,r.height*0.22),
      x:(side<0)?r.right:r.left,
      side:side
    });
  });
}

function strandsAtY(y){
  var n=2;
  for(var i=0;i<joinAt.length;i++){ if(y>=joinAt[i].y) n=Math.max(n,joinAt[i].n); }
  return n;
}
function strandFade(k,y){
  for(var i=0;i<joinAt.length;i++){
    if(joinAt[i].n===k+1) return Math.max(0,Math.min(1,(y-joinAt[i].y)/260));
  }
  return 1;
}

function drawLog(){
  if(!ctx) return;
  ctx.clearRect(0,0,W,H);
  if(!chartBot) measureChart();

  var sy=window.scrollY||0;
  var vh=innerHeight;
  var front=sy+vh*0.66;
  var span=Math.max(1,chartBot-chartTop);
  var bd=Math.min(1,braid+braidBoost);
  var axis=W*0.5;
  var spread=W*0.055;
  var braidFrom=chartTop+span*0.70;

  var STEP=9;
  var yStart=Math.max(chartTop, sy-vh*0.35);
  var yEnd=Math.min(chartBot, Math.min(front, sy+vh*1.35));
  if(yEnd<=yStart) return;

  function xOf(k,n,y){
    var home=(n<=1)?0:((k-(n-1)/2)*(spread*2/Math.max(1,n-1)));
    var braidU=Math.max(0,Math.min(1,(y-braidFrom)/Math.max(1,chartBot-braidFrom)));
    var conv=braidU*braidU*(3-2*braidU)*bd;
    var wob=Math.sin(y*0.0042+k*1.9+t*0.22)*(spread*0.13)*(1-conv);
    var twist=Math.sin(y*0.021+k*2.1)*spread*0.10*conv*(1-braidU*0.75);
    return axis+home*(1-conv)+wob+twist;
  }

  ctx.lineCap='round'; ctx.lineJoin='round';

  for(var ai=0;ai<anchorAt.length;ai++){
    var a=anchorAt[ai];
    if(a.y>front||a.y<yStart-vh*0.2||a.y>yEnd+vh*0.2) continue;
    var reach=Math.max(0,Math.min(1,(front-a.y)/150));
    if(reach<=0) continue;
    var na=strandsAtY(a.y);
    var sx=xOf(Math.min(na-1,Math.max(0,Math.floor(na/2))),na,a.y);
    var ex=sx+(a.x-sx)*reach;
    var my=(a.y-sy)*DPR;
    ctx.beginPath();
    ctx.moveTo(sx*DPR,my);
    ctx.bezierCurveTo((sx+(ex-sx)*0.45)*DPR, my-7*DPR,
                      (sx+(ex-sx)*0.72)*DPR, my+3*DPR, ex*DPR, my);
    ctx.strokeStyle='rgba(84,58,26,'+(0.30*reach).toFixed(3)+')';
    ctx.lineWidth=0.9*DPR;
    ctx.stroke();
    if(reach>0.92){
      ctx.fillStyle='rgba(70,46,18,0.42)';
      ctx.beginPath(); ctx.arc(ex*DPR,my,2.1*DPR,0,6.2832); ctx.fill();
    }
  }

  var LAYERS=[
    { w:6.4, a:0.085, off:0,     bl:1 },
    { w:2.9, a:0.20,  off:0.35,  bl:1 },
    { w:1.5, a:0.52,  off:0,     bl:0 },
    { w:0.7, a:0.30,  off:-0.55, bl:0 }
  ];
  for(var k=0;k<4;k++){
    var fade=strandFade(k,yEnd);
    if(fade<=0) continue;
    var wet=Math.max(0,Math.min(1,(front-yEnd)/220));
    for(var L=0;L<LAYERS.length;L++){
      var ly=LAYERS[L], started=false;
      ctx.beginPath();
      for(var y=yStart;y<=yEnd;y+=STEP){
        var n=strandsAtY(y);
        if(k>=n){ started=false; continue; }
        var press=1+Math.sin(y*0.0075+k*2.4)*0.22+Math.sin(y*0.031+k)*0.07;
        var jitter=ly.bl?Math.sin(y*0.09+k*3.1+L)*0.6:0;
        var px=(xOf(k,n,y)+ly.off*press+jitter)*DPR;
        var py=(y-sy)*DPR;
        if(!started){ ctx.moveTo(px,py); started=true; } else ctx.lineTo(px,py);
      }
      var al=ly.a*fade*(ly.bl?(1-wet*0.45):1);
      ctx.strokeStyle='rgba('+(ly.bl?'96,68,34':'66,42,16')+','+al.toFixed(3)+')';
      ctx.lineWidth=(ly.w+bd*(ly.bl?2.6:0.7))*DPR;
      ctx.stroke();
    }
  }

  if(front<chartBot && front>chartTop){
    var n2=strandsAtY(front);
    for(var q=0;q<n2;q++){
      var bx=xOf(q,n2,front)*DPR, by=(front-sy)*DPR;
      var g2=ctx.createRadialGradient(bx,by,0,bx,by,13*DPR);
      g2.addColorStop(0,'rgba(58,38,16,0.34)');
      g2.addColorStop(1,'rgba(58,38,16,0)');
      ctx.fillStyle=g2;
      ctx.beginPath(); ctx.arc(bx,by,13*DPR,0,6.2832); ctx.fill();
    }
  }

  for(var ci=0;ci<anchorAt.length;ci++){
    var c=anchorAt[ci];
    if(!c.el.classList.contains('surfaced') && front>=c.y){
      c.el.classList.add('surfaced');
      c.el.querySelectorAll('.sed[data-joins]').forEach(function(sp){
        STRANDS=Math.max(STRANDS,parseInt(sp.dataset.joins,10));
      });
    }
  }

  if(chartBot-sy<vh*1.1 && bd>0.6){
    var ay=(chartBot-sy)*DPR, ax=axis*DPR;
    ctx.strokeStyle='rgba(52,34,14,'+(0.42*bd).toFixed(3)+')';
    ctx.lineWidth=(2.6+bd*2.4)*DPR;
    ctx.beginPath(); ctx.moveTo(ax,ay-26*DPR); ctx.lineTo(ax,ay); ctx.stroke();
    ctx.fillStyle='rgba(52,34,14,'+(0.55*bd).toFixed(3)+')';
    ctx.beginPath(); ctx.arc(ax,ay+5*DPR,3.2*DPR,0,6.2832); ctx.fill();
  }
}

var motes=[];
function seedMote(){
  return { x:Math.random(), y:Math.random(), r:Math.random()*1.6+0.5,
           vy:(Math.random()*0.10+0.03), vx:(Math.random()-0.5)*0.05,
           ph:Math.random()*6.28 };
}

function drawRoom(s){
  if(!ctx) return;
  var g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#0B1219');
  g.addColorStop(0.55,'#070D13');
  g.addColorStop(1,'#04080D');
  ctx.fillStyle=g;
  ctx.fillRect(0,0,W,H);

  var lx=W*0.5, ly=H*0.06, warm=1-s*0.45;
  var beam=ctx.createRadialGradient(lx,ly+H*0.30,H*0.03,lx,ly+H*0.30,H*0.62);
  beam.addColorStop(0,'rgba(226,196,146,'+(0.15*warm).toFixed(3)+')');
  beam.addColorStop(0.45,'rgba(198,166,118,'+(0.07*warm).toFixed(3)+')');
  beam.addColorStop(1,'rgba(180,150,110,0)');
  ctx.fillStyle=beam;
  ctx.fillRect(0,0,W,H);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(lx-W*0.055,ly);
  ctx.lineTo(lx+W*0.055,ly);
  ctx.lineTo(lx+W*0.34,H*0.92);
  ctx.lineTo(lx-W*0.34,H*0.92);
  ctx.closePath();
  ctx.clip();
  var cone=ctx.createLinearGradient(0,ly,0,H*0.92);
  cone.addColorStop(0,'rgba(238,212,164,'+(0.11*warm).toFixed(3)+')');
  cone.addColorStop(1,'rgba(214,180,130,0)');
  ctx.fillStyle=cone;
  ctx.fillRect(0,0,W,H);

  if(!motes.length){ for(var q=0;q<34;q++) motes.push(seedMote()); }
  for(var i=0;i<motes.length;i++){
    var m=motes[i];
    m.y-=m.vy*0.0012;
    m.x+=m.vx*0.0009+Math.sin(t*0.5+m.ph)*0.00035;
    if(m.y<-0.05){ motes[i]=seedMote(); motes[i].y=1.05; }
    var a=(0.10+0.30*Math.abs(Math.sin(t*0.7+m.ph)))*warm;
    ctx.fillStyle='rgba(246,228,196,'+a.toFixed(3)+')';
    ctx.beginPath();
    ctx.arc(m.x*W,m.y*H,m.r*DPR,0,6.2832);
    ctx.fill();
  }
  ctx.restore();

  var sway=Math.sin(t*0.42)*0.010;
  ctx.save();
  ctx.translate(lx,0);
  ctx.rotate(sway);
  ctx.strokeStyle='rgba(150,132,104,0.34)';
  ctx.lineWidth=1*DPR;
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,ly-8*DPR); ctx.stroke();
  ctx.fillStyle='rgba(18,24,30,0.95)';
  ctx.beginPath();
  ctx.moveTo(-W*0.052,ly);
  ctx.lineTo(W*0.052,ly);
  ctx.lineTo(W*0.020,ly-24*DPR);
  ctx.lineTo(-W*0.020,ly-24*DPR);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle='rgba(248,226,182,'+(0.55*warm).toFixed(3)+')';
  ctx.beginPath();
  ctx.ellipse(0,ly,W*0.050,3.4*DPR,0,0,6.2832);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle='rgba(150,132,104,'+(0.10*warm).toFixed(3)+')';
  ctx.lineWidth=1*DPR;
  ctx.beginPath();
  ctx.moveTo(0,H*0.915); ctx.lineTo(W,H*0.915);
  ctx.stroke();
}

function drawCabin(){
  if(!ctx) return;
  var g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#241A12');
  g.addColorStop(0.5,'#1A130D');
  g.addColorStop(1,'#120C08');
  ctx.fillStyle=g;
  ctx.fillRect(0,0,W,H);

  ctx.strokeStyle='rgba(96,70,44,0.16)';
  ctx.lineWidth=1*DPR;
  for(var y=0;y<H;y+=54*DPR){
    ctx.beginPath();
    for(var x=0;x<=W;x+=24*DPR){
      ctx.lineTo(x,y+Math.sin(x*0.004+y*0.02)*2.4*DPR);
    }
    ctx.stroke();
  }
  ctx.strokeStyle='rgba(70,48,28,0.34)';
  ctx.lineWidth=2*DPR;
  for(var px=W*0.18;px<W;px+=W*0.28){
    ctx.beginPath(); ctx.moveTo(px,0); ctx.lineTo(px,H); ctx.stroke();
  }

  var cx=W*0.80, cy=H*0.26, r=Math.min(W,H)*0.155;
  ctx.save();
  ctx.beginPath(); ctx.arc(cx,cy,r,0,6.2832); ctx.clip();
  var sea=ctx.createLinearGradient(0,cy-r,0,cy+r);
  var lift=TEAM.thread, glow=TEAM.light, drift=TEAM.current;
  sea.addColorStop(0,'rgb('+(44+80*glow|0)+','+(126+50*glow|0)+','+(158+30*glow|0)+')');
  sea.addColorStop(1,'#082C44');
  ctx.fillStyle=sea;
  ctx.fillRect(cx-r,cy-r,r*2,r*2);
  var pulse=1+0.14*TEAM.sound*Math.sin(t*3.1);
  for(var k=0;k<plumes.length;k++){
    var p=plumes[k];
    p.y-=p.sp*(0.5+lift*0.8);
    p.x+=Math.sin(t*1.2+p.sway)*0.4*DPR+drift*1.4*DPR;
    if(p.y<-p.r) Object.assign(p,seed(p.s));
    if(p.x>W+p.r) p.x=-p.r;
    if(p.x<-p.r) p.x=W+p.r;
    var rad=p.r*0.5*pulse;
    var gr=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,rad);
    gr.addColorStop(0,'rgba(226,240,248,'+(p.a*1.4).toFixed(3)+')');
    gr.addColorStop(1,'rgba(226,240,248,0)');
    ctx.fillStyle=gr;
    ctx.beginPath(); ctx.arc(p.x,p.y,rad,0,6.2832); ctx.fill();
  }
  ctx.restore();

  ctx.strokeStyle='rgba(198,158,92,0.75)';
  ctx.lineWidth=7*DPR;
  ctx.beginPath(); ctx.arc(cx,cy,r+3*DPR,0,6.2832); ctx.stroke();
  ctx.strokeStyle='rgba(120,92,52,0.85)';
  ctx.lineWidth=2*DPR;
  ctx.beginPath(); ctx.arc(cx,cy,r+7*DPR,0,6.2832); ctx.stroke();
  for(var b=0;b<8;b++){
    var a2=b/8*6.2832+0.4;
    ctx.fillStyle='rgba(214,176,104,0.8)';
    ctx.beginPath();
    ctx.arc(cx+Math.cos(a2)*(r+7*DPR),cy+Math.sin(a2)*(r+7*DPR),2.6*DPR,0,6.2832);
    ctx.fill();
  }
  var sheen=ctx.createLinearGradient(cx-r,cy-r,cx+r*0.4,cy+r*0.6);
  sheen.addColorStop(0,'rgba(255,255,255,0.10)');
  sheen.addColorStop(0.5,'rgba(255,255,255,0)');
  ctx.fillStyle=sheen;
  ctx.beginPath(); ctx.arc(cx,cy,r,0,6.2832); ctx.fill();
}

function drawWater(s){
  if(!ctx) return;
  if(page==='story'){ drawLog(); return; }
  if(page==='understanding'){ drawRoom(s); return; }
  if(page==='team'){ drawCabin(); return; }
  ctx.fillStyle='#04192B';
  ctx.fillRect(0,0,W,H);
  var mix=mixAmt(s),sp=speedMul(s),al=alphaMul(s);
  var team=page==='team';
  var drift=team?TEAM.current:0;
  var lift=team?TEAM.thread:0;
  var glow=team?TEAM.light:0;
  var beat=team?TEAM.sound:0;
  var pulse=beat?1+0.16*beat*Math.sin(t*3.1):1;
  for(var k=0;k<plumes.length;k++){
    var p=plumes[k];
    p.y-=p.sp*sp*(1+lift*0.7);
    if(page==='story'){
      var bd=Math.min(1,braid+braidBoost);
      var home=strandHome(p.s%STRANDS,STRANDS);
      var tx=home+(W*0.5-home)*bd+p.off*(1-bd*0.75);
      if(ptrX>=0){
        var dxp=ptrX-p.x, dyp=ptrY-p.y;
        var dd=Math.sqrt(dxp*dxp+dyp*dyp);
        if(dd<W*0.24) tx+=dxp*(1-dd/(W*0.24))*0.30;
      }
      p.x+=(tx-p.x)*0.026+Math.sin(t*1.2+p.sway)*0.4*DPR;
    } else {
      p.x+=Math.sin(t*1.2+p.sway)*0.5*DPR+drift*1.5*DPR;
      if(p.x>W+p.r) p.x=-p.r;
      if(p.x<-p.r) p.x=W+p.r;
    }
    if(p.y<-p.r){ var k2=p.s; Object.assign(p,seed(k2)); }
    var c0=COLD[p.i],c1=TO[p.i];
    var r=c0[0]+(c1[0]-c0[0])*mix,
        g=c0[1]+(c1[1]-c0[1])*mix,
        b=c0[2]+(c1[2]-c0[2])*mix;
    if(team){
      r=r+(226-r)*glow*0.5;
      g=g+(196-g)*glow*0.5;
      b=b+(150-b)*glow*0.5;
    }
    var rad=p.r*pulse;
    var grad=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,rad);
    grad.addColorStop(0,'rgba('+(r|0)+','+(g|0)+','+(b|0)+','+(p.a*al*(1+glow*0.6))+')');
    grad.addColorStop(1,'rgba('+(r|0)+','+(g|0)+','+(b|0)+',0)');
    ctx.fillStyle=grad;
    ctx.beginPath(); ctx.arc(p.x,p.y,rad,0,Math.PI*2); ctx.fill();
  }
}

var frags=[];
var SEA_IN_FRAME=false;
var lampSecs=null, lampY=42, lampFlick=0;
if(page==='understanding'){
  lampSecs=document.querySelectorAll('.prose .section');
  if(!lampSecs.length) lampSecs=null;
}

var TEAM={current:0,thread:0,light:0,sound:0};
var ECHOES=[], ORDER=['current','thread','light','sound'];

function sendEcho(kind){
  var from=ORDER.indexOf(kind);
  if(from<0||from>=ORDER.length-1) return;
  var now=performance.now();
  for(var i=0;i<ECHOES.length;i++){ if(ECHOES[i].from===from&&now-ECHOES[i].t0<2600) return; }
  ECHOES.push({ from:from, to:from+1, t0:now });
  if(ECHOES.length>4) ECHOES.shift();
}

function rigFragment(host,shared){
  var size=280*DPR;
  var st=shared||{S:size,t:Math.random()*100,mx:size/2,my:size/2,near:0,hover:0,run:false,
          kind:host.getAttribute('data-frag'),
          bend:0,swing:0,swingT:0,warm:0,rate:0.5,down:false,px:0,vx:0,lastTap:-9};
  host.style.touchAction='none';

  host.addEventListener('pointermove',function(e){
    var r=host.getBoundingClientRect();
    var nx=(e.clientX-r.left)/r.width*size;
    var ny=(e.clientY-r.top)/r.height*size;
    st.vx=nx-st.mx;
    st.mx=nx; st.my=ny; st.near=1;
    host.classList.add('touched');
    if(st.down){
      if(st.kind==='current'){
        st.bend=Math.max(-1,Math.min(1,st.bend+st.vx/size*1.9));
        TEAM.current=Math.max(-1,Math.min(1,TEAM.current+st.vx/size*1.6));
        if(Math.abs(st.vx)>2) sendEcho('current');
      }
      if(st.kind==='thread') st.swingT=st.vx/size;
    }
    if(st.kind==='light'){
      st.warm=Math.min(1,st.warm+0.012);
      TEAM.light=Math.min(1,TEAM.light+0.006);
      if(st.warm>0.2) sendEcho('light');
    }
  });

  host.addEventListener('pointerdown',function(e){
    st.down=true;
    try{ host.setPointerCapture(e.pointerId); }catch(err){}
    if(st.kind==='sound'){
      var now=performance.now();
      if(st.lastTap){
        var gap=Math.max(90,Math.min(2000,now-st.lastTap));
        st.rate=Math.max(0.18,Math.min(2.4,900/gap));
        TEAM.sound=Math.min(1,TEAM.sound+0.34);
      }
      st.lastTap=now;
    }
  });

  host.addEventListener('pointerup',function(){
    if(st.down&&st.kind==='thread'){
      st.swing=Math.max(-1,Math.min(1,st.swing+st.swingT*4.2));
      TEAM.thread=Math.min(1,TEAM.thread+Math.abs(st.swingT)*3.4);
      if(Math.abs(st.swingT)>0.008) sendEcho('thread');
    }
    st.down=false; st.swingT=0;
  });

  host.addEventListener('pointerleave',function(){ st.near=0; st.down=false; });
  return st;
}

var VERB={ current:'turn it', thread:'flick it', light:'hold it', sound:'strike it' };
function fragCanvas(host,st){
  var wrap=document.createElement('div');
  wrap.className='instrument inst-'+st.kind;
  var cv=document.createElement('canvas');
  var tag=document.createElement('span');
  tag.className='ilabel';
  tag.textContent=VERB[st.kind]||'';
  wrap.appendChild(cv); wrap.appendChild(tag);
  host.parentNode.insertBefore(wrap,host.nextSibling);
  st.cv=cv; st.cx=cv.getContext('2d'); st.host=host; st.wrap=wrap;
  st.spin=0; st.tag=tag; st.used=0;
  st.img=host.querySelector('img');
  return wrap;
}

function paintFrag(f){
  var eff=Math.max(0,Math.min(1,
    f.hover*0.45+Math.abs(f.bend)*1.8+Math.abs(f.swing)*1.8+f.warm*1.4+(f.rate>1.05?0.35:0)));
  f.open+=(eff-f.open)*0.07;
  var im=f.img;
  if(im) im.style.opacity='';

  var cv=f.cv, g=f.cx;
  if(!cv||!g) return;
  var r=cv.getBoundingClientRect();
  if(!r.width) return;
  var w=Math.max(1,Math.round(r.width*DPR)), h=Math.max(1,Math.round(r.height*DPR));
  if(cv.width!==w||cv.height!==h){ cv.width=w; cv.height=h; }
  g.clearRect(0,0,w,h);
  var t=f.t, live=0.28+f.hover*0.72, res=f.reso||0;
  var BR='#c39a56', BR2='#7d5f2c', GL='rgba(232,206,150,';
  var cxp=w*0.5, cyp=h*0.5, R=Math.min(w,h)*0.34;

  if(f.kind==='current'){
    f.spin+=f.bend*0.09;
    f.spin*=0.995;
    g.save(); g.translate(cxp,cyp); g.rotate(f.spin);
    g.strokeStyle=BR; g.lineWidth=3.4*DPR;
    g.beginPath(); g.arc(0,0,R,0,6.2832); g.stroke();
    g.strokeStyle=BR2; g.lineWidth=2.2*DPR;
    g.beginPath(); g.arc(0,0,R*0.30,0,6.2832); g.stroke();
    for(var sp=0;sp<8;sp++){
      var a=sp/8*6.2832;
      g.strokeStyle=BR; g.lineWidth=2.6*DPR;
      g.beginPath();
      g.moveTo(Math.cos(a)*R*0.30,Math.sin(a)*R*0.30);
      g.lineTo(Math.cos(a)*R*1.20,Math.sin(a)*R*1.20);
      g.stroke();
      g.fillStyle=BR;
      g.beginPath(); g.arc(Math.cos(a)*R*1.20,Math.sin(a)*R*1.20,3.2*DPR,0,6.2832); g.fill();
    }
    g.restore();
    if(Math.abs(f.bend)>0.02){
      g.strokeStyle=GL+(Math.min(0.5,Math.abs(f.bend)*1.4)).toFixed(3)+')';
      g.lineWidth=6*DPR;
      g.beginPath(); g.arc(cxp,cyp,R*1.28,0,6.2832); g.stroke();
    }
  }
  else if(f.kind==='thread'){
    var ax=cxp, sw=f.swing+Math.sin(t*1.8)*0.03*live;
    g.strokeStyle=BR2; g.lineWidth=2.4*DPR;
    g.beginPath(); g.moveTo(ax-R*0.9,h*0.13); g.lineTo(ax+R*0.9,h*0.13); g.stroke();
    g.strokeStyle='rgba(206,190,158,'+(0.45+live*0.4).toFixed(3)+')';
    g.lineWidth=1.5*DPR;
    g.beginPath(); g.moveTo(ax,h*0.13);
    var lx=ax,ly=h*0.13;
    for(var yy=h*0.13;yy<=h*0.80;yy+=4){
      var v=(yy-h*0.13)/(h*0.67);
      lx=ax+Math.sin(v*2.5)*sw*w*0.36*v; ly=yy;
      g.lineTo(lx,ly);
    }
    g.stroke();
    g.fillStyle=BR;
    g.beginPath(); g.ellipse(lx,ly+7*DPR,5.5*DPR,11*DPR,0,0,6.2832); g.fill();
    g.fillStyle=BR2;
    g.beginPath(); g.ellipse(lx,ly+15*DPR,2.6*DPR,4*DPR,0,0,6.2832); g.fill();
  }
  else if(f.kind==='light'){
    var wm=f.warm;
    var gg=g.createRadialGradient(cxp,cyp,0,cxp,cyp,R*3.2);
    gg.addColorStop(0,GL+(0.10+wm*0.45).toFixed(3)+')');
    gg.addColorStop(0.4,GL+(0.03+wm*0.16).toFixed(3)+')');
    gg.addColorStop(1,'rgba(232,206,150,0)');
    g.fillStyle=gg; g.fillRect(0,0,w,h);
    g.strokeStyle=BR; g.lineWidth=2.6*DPR;
    g.beginPath();
    g.moveTo(cxp-R*0.62,cyp-R*0.72); g.lineTo(cxp+R*0.62,cyp-R*0.72);
    g.lineTo(cxp+R*0.46,cyp+R*0.86); g.lineTo(cxp-R*0.46,cyp+R*0.86);
    g.closePath(); g.stroke();
    g.beginPath(); g.moveTo(cxp,cyp-R*0.72); g.lineTo(cxp,cyp-R*1.24); g.stroke();
    g.beginPath(); g.arc(cxp,cyp-R*1.30,R*0.16,0,6.2832); g.stroke();
    g.fillStyle=GL+(0.28+wm*0.66).toFixed(3)+')';
    g.beginPath(); g.ellipse(cxp,cyp+R*0.06,R*0.30,R*0.44,0,0,6.2832); g.fill();
  }
  else if(f.kind==='sound'){
    var rt=f.rate||1;
    var hit=Math.max(0,1-((t-(f.lastTap||-9))*1.6));
    g.save();
    g.translate(cxp,cyp-R*0.15);
    g.rotate(Math.sin(t*13)*0.06*hit);
    g.strokeStyle=BR; g.lineWidth=2.8*DPR;
    g.beginPath();
    g.moveTo(-R*0.62,R*0.58);
    g.quadraticCurveTo(-R*0.58,-R*0.52,0,-R*0.62);
    g.quadraticCurveTo(R*0.58,-R*0.52,R*0.62,R*0.58);
    g.closePath(); g.stroke();
    g.beginPath(); g.moveTo(-R*0.72,R*0.58); g.lineTo(R*0.72,R*0.58); g.stroke();
    g.fillStyle=BR2;
    g.beginPath(); g.arc(0,R*0.80,R*0.13,0,6.2832); g.fill();
    g.restore();
    for(var q=0;q<4;q++){
      var ph=((t*rt*0.5+q/4)%1);
      g.beginPath(); g.arc(cxp,cyp,R*0.7+ph*R*2.4,0,6.2832);
      g.strokeStyle=GL+((1-ph)*(0.05+live*0.28+res*0.24)).toFixed(3)+')';
      g.lineWidth=(2.0-ph*1.4)*DPR; g.stroke();
    }
  }

  if(f.tag){
    var act=Math.abs(f.bend)+Math.abs(f.swing)+f.warm+(f.lastTap>-5?0.6:0);
    if(act>0.14) f.used=1;
    f.tag.classList.toggle('on', f.hover>0.3 && !f.used);
  }
  return;
  var t=f.t, live=0.22+f.hover*0.78, res=f.reso||0;
  var op=f.open;
  if(op<0.012) return;
  g.save();
  g.globalAlpha=Math.min(1,op*1.25);
  var sea=g.createLinearGradient(0,0,0,h);
  sea.addColorStop(0,'#123044'); sea.addColorStop(0.58,'#0a1e2c'); sea.addColorStop(1,'#05121b');
  g.fillStyle=sea; g.fillRect(0,0,w,h);
  if(!f.motes){
    f.motes=[];
    for(var mi=0;mi<26;mi++) f.motes.push({x:Math.random(),y:Math.random(),
      r:0.4+Math.random()*1.3,v:0.02+Math.random()*0.05,ph:Math.random()*6.28});
  }
  for(var mj=0;mj<f.motes.length;mj++){
    var mo=f.motes[mj];
    mo.y+=mo.v*0.004; if(mo.y>1.05){ mo.y=-0.05; mo.x=Math.random(); }
    g.fillStyle='rgba(154,190,208,'+(0.06+0.08*Math.sin(t+mo.ph)).toFixed(3)+')';
    g.beginPath();
    g.arc(mo.x*w+Math.sin(t*0.5+mo.ph)*3*DPR, mo.y*h, mo.r*DPR, 0, 6.2832);
    g.fill();
  }

  if(f.kind==='current'){
    var rows=9;
    for(var i=0;i<rows;i++){
      var y=h*(0.12+i*0.085);
      var amp=h*0.026*(1+f.bend*1.4)*live;
      g.beginPath();
      for(var x=0;x<=w;x+=6){
        var u=x/w;
        var yy=y+Math.sin(u*5.6+t*1.7+i*0.5)*amp+f.bend*u*h*0.10;
        if(x===0) g.moveTo(x,yy); else g.lineTo(x,yy);
      }
      g.strokeStyle='rgba(132,196,216,'+(0.14+live*0.44+res*0.30).toFixed(3)+')';
      g.lineWidth=1.4*DPR; g.stroke();
    }
  }
  else if(f.kind==='thread'){
    var ax=w*0.5, sw=f.swing+Math.sin(t*2.1)*0.05*live;
    g.beginPath(); g.moveTo(ax,0);
    for(var yy2=0;yy2<=h;yy2+=5){
      var v=yy2/h;
      g.lineTo(ax+Math.sin(v*2.4)*sw*w*0.30*v, yy2);
    }
    g.strokeStyle='rgba(214,198,164,'+(0.30+live*0.52+res*0.30).toFixed(3)+')';
    g.lineWidth=1.7*DPR; g.stroke();
    var bx=ax+Math.sin(2.4)*sw*w*0.30, by=h*0.94;
    g.beginPath(); g.arc(bx,by,3.4*DPR,0,6.283);
    g.fillStyle='rgba(230,214,180,'+(0.44+live*0.55).toFixed(3)+')'; g.fill();
  }
  else if(f.kind==='light'){
    var wm=f.warm;
    var gr=g.createRadialGradient(f.mx/280*w,f.my/280*h,0,f.mx/280*w,f.my/280*h,w*(0.30+wm*0.55));
    gr.addColorStop(0,'rgba(255,214,138,'+(0.10+wm*0.50+res*0.18).toFixed(3)+')');
    gr.addColorStop(0.55,'rgba(236,170,90,'+(0.05+wm*0.26).toFixed(3)+')');
    gr.addColorStop(1,'rgba(120,74,32,0)');
    g.fillStyle=gr; g.fillRect(0,0,w,h);
  }
  else if(f.kind==='sound'){
    var n=4;
    for(var k=0;k<n;k++){
      var ph=((t*f.rate*0.55+k/n)%1);
      var rad=ph*w*0.62;
      g.beginPath(); g.arc(w*0.5,h*0.52,rad,0,6.283);
      g.strokeStyle='rgba(146,202,220,'+((1-ph)*(0.20+live*0.48+res*0.30)).toFixed(3)+')';
      g.lineWidth=(2.4-ph)*DPR; g.stroke();
    }
  }
  g.restore();
}

if(page==='team'){
  document.querySelectorAll('[data-frag]').forEach(function(host){
    var st=rigFragment(host);
    var wrap=fragCanvas(host,st);
    rigFragment(wrap,st);
    frags.push(st);
    new IntersectionObserver(function(es){
      es.forEach(function(e){ st.run=e.isIntersecting; });
    },{threshold:0.1}).observe(host);
  });
}

if(page==='story'){
  document.querySelectorAll('.story-stanza.told p').forEach(function(p){
    var raw=p.textContent.replace(/\s+/g,' ').trim();
    var parts=raw.match(/[^.!?]+[.!?]*\s*/g)||[raw];
    p.textContent='';
    parts.forEach(function(sent){
      var sp=document.createElement('span');
      sp.className='sed';
      sp.textContent=sent;
      if(sent.indexOf('Emily')>=0) sp.dataset.joins='3';
      else if(sent.indexOf('Fatih')>=0) sp.dataset.joins='4';
      p.appendChild(sp);
    });
  });
  var allSt=document.querySelectorAll('.story-stanza');
  var stN=allSt.length;
  allSt.forEach(function(st,i){
    var d=stN>1?i/(stN-1):0;
    var ink=Math.max(0,(d-0.16)/0.84);
    st.style.setProperty('--ink',ink.toFixed(3));
  });
  document.querySelectorAll('.story-stanza.told').forEach(function(block){
    var ink=parseFloat(block.style.getPropertyValue('--ink'))||0;
    var n=0;
    block.querySelectorAll('.sed').forEach(function(sp){
      sp.style.transitionDelay=(REDUCED?0:Math.round(n*(120+ink*190)))+'ms';
      var a=Math.random()*6.283;
      var reach=(0.5+Math.random()*0.9)*(0.4+ink*1.5);
      sp.style.setProperty('--sx',(Math.cos(a)*reach).toFixed(2)+'px');
      sp.style.setProperty('--sy',(Math.sin(a)*reach*0.7+0.5).toFixed(2)+'px');
      n++;
    });
  });
  addEventListener('load',function(){ measureChart(); });
  setTimeout(measureChart,600);
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting) measureChart(); });
  },{threshold:0.05});
  document.querySelectorAll('.story-stanza').forEach(function(s){ io.observe(s); });
}

let holdTick=null;
function initHold(){
  const secs=Array.prototype.slice.call(document.querySelectorAll('.prose .section'));
  if(!secs.length) return;
  const NEAR=0.35, FAR=1.9, SETTLE=2.7;
  const bottoms=new Float64Array(secs.length);
  const cur=new Float64Array(secs.length);
  const out=new Float64Array(secs.length);
  function measureSecs(){
    for(let i=0;i<secs.length;i++){
      const r=secs[i].getBoundingClientRect();
      bottoms[i]=r.bottom+window.scrollY;
    }
  }
  function tick(){
    const vh=innerHeight, sy=window.scrollY;
    for(let i=0;i<secs.length;i++){
      const above=(sy-bottoms[i])/vh;
      let f=0;
      if(above>NEAR&&above<SETTLE){
        const span=above<FAR?(above-NEAR)/(FAR-NEAR):1-(above-FAR)/(SETTLE-FAR);
        f=above<FAR?span:1-(above-FAR)/(SETTLE-FAR);
        f=Math.max(0,Math.min(1,f));
      }
      if(i===0) f*=0.15;
      else if(i===1) f*=0.5;
      out[i]=cur[i]+(f-cur[i])*0.16;
    }
    for(let i=0;i<secs.length;i++){
      const next=out[i];
      if(Math.abs(next-cur[i])<0.0025&&next<0.004){
        if(cur[i]!==0){ cur[i]=0; secs[i].style.removeProperty('--fade'); }
        continue;
      }
      cur[i]=next;
      secs[i].style.setProperty('--fade',next.toFixed(3));
    }
  }
  addEventListener('resize',function(){ measureSecs(); tick(); });
  addEventListener('load',function(){ measureSecs(); tick(); });
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(measureSecs);
  measureSecs();
  tick();
  holdTick=tick;
}

function initFocus(){
  if(REDUCED) return;
  var held=false;
  function on(){ if(held) return; held=true; body.classList.add('focusing'); }
  function off(){ if(!held) return; held=false; body.classList.remove('focusing'); }
  addEventListener('pointerdown',on);
  addEventListener('pointerup',off);
  addEventListener('pointercancel',off);
  addEventListener('blur',off);
  addEventListener('keydown',function(e){ if(e.key==='Shift') on(); });
  addEventListener('keyup',function(e){ if(e.key==='Shift') off(); });
}

if(page==='understanding'){ initHold(); initFocus(); initGaugeDrag(); }

function relayout(){
  sizeCanvas();
  if(anchors.length) measure(anchors);
  readScroll();
}

var boat={x:0,y:0,vx:0,tilt:0,px:0,init:false};

function drawStoryBoat(){
  if(page!=='story'||!ctx) return;
  var tx=W*0.072+Math.sin(t*0.5)*W*0.006;
  if(!boat.init){ boat.x=tx; boat.px=tx; boat.y=H*0.16; boat.init=true; }
  boat.x+=(tx-boat.x)*0.028;
  boat.vx=boat.vx*0.90+(boat.x-boat.px)*0.10;
  boat.px=boat.x;
  var ty=H*(0.155+0.70*Math.min(1,depthCur));
  boat.y+=(ty-boat.y)*0.05;
  var tgt=Math.sin(t*0.7)*0.055+Math.max(-0.3,Math.min(0.3,boat.vx*0.05));
  boat.tilt+=(tgt-boat.tilt)*0.06;
  ctx.save();
  ctx.strokeStyle='rgba(58,40,22,0.62)';
  ctx.lineWidth=1.2*DPR;
  ctx.translate(boat.x,boat.y);
  ctx.rotate(boat.tilt);
  ctx.scale(DPR*0.42,DPR*0.42);
  ctx.beginPath();
  ctx.moveTo(-26,0); ctx.lineTo(26,0); ctx.lineTo(14,12); ctx.lineTo(-14,12);
  ctx.closePath(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0,-1); ctx.lineTo(12,-1); ctx.lineTo(0,-17); ctx.closePath(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0,-1); ctx.lineTo(-12,-1); ctx.lineTo(0,-13); ctx.closePath(); ctx.stroke();
  ctx.restore();
  ctx.strokeStyle='rgba(58,40,22,0.22)';
  ctx.lineWidth=1*DPR;
  ctx.beginPath();
  for(var q=0;q<=14;q++){
    var u=q/14;
    ctx.lineTo(boat.x-18*DPR+u*36*DPR, boat.y+13*DPR+Math.sin(u*9+t*1.6)*2.2*DPR);
  }
  ctx.stroke();
}

function drawEchoes(){
  if(page!=='team'||!ECHOES.length||!ctx) return;
  var now=performance.now();
  var hosts=document.querySelectorAll('.stratum .fragment');
  for(var i=ECHOES.length-1;i>=0;i--){
    var e=ECHOES[i];
    var age=(now-e.t0)/1000;
    if(age>3.2){ ECHOES.splice(i,1); continue; }
    var a=hosts[e.from], b=hosts[e.to];
    if(!a||!b) continue;
    var ra=a.getBoundingClientRect(), rb=b.getBoundingClientRect();
    var y0=ra.top+ra.height*0.5, y1=rb.top+rb.height*0.5;
    var k=Math.min(1,age/2.1);
    var y=(y0+(y1-y0)*(k*k*(3-2*k)))*DPR;
    var fade=Math.sin(k*Math.PI);
    ctx.strokeStyle='rgba(201,216,226,'+(0.18*fade).toFixed(3)+')';
    ctx.lineWidth=1*DPR;
    ctx.beginPath();
    for(var x=0;x<=W;x+=14*DPR){
      ctx.lineTo(x,y+Math.sin(x*0.008/DPR+age*5)*3*DPR*fade);
    }
    ctx.stroke();
    if(k>=1&&!e.hit){
      e.hit=true;
      if(frags[e.to]) frags[e.to].reso=1;
    }
  }
}

function loop(){
  if(!running) return;
  t+=REDUCED?0.004:0.008;
  if(lampSecs){
    var vc=innerHeight*0.44, best=1e9, bestY=vc;
    for(var q=0;q<lampSecs.length;q++){
      var rr=lampSecs[q].getBoundingClientRect();
      var cc=rr.top+rr.height*0.5;
      var dd=Math.abs(cc-vc);
      var lit=Math.max(0,1-dd/(innerHeight*0.62));
      lampSecs[q].style.setProperty('--lit',(lit*lit*(3-2*lit)).toFixed(3));
      if(dd<best){ best=dd; bestY=cc; }
    }
    var tgt=Math.max(18,Math.min(82,bestY/innerHeight*100));
    lampY+=(tgt-lampY)*0.055;
    lampFlick+=(Math.random()-0.5)*0.06;
    lampFlick*=0.90;
    var docEl=document.documentElement;
    docEl.style.setProperty('--lampy',lampY.toFixed(2)+'%');
    docEl.style.setProperty('--lampglow',(0.86+lampFlick).toFixed(3));
  }
  depthCur+=(depthTarget-depthCur)*0.12;
  var s=maxD?Math.max(0,Math.min(1,depthCur/maxD)):0;
  drawWater(s);
  drawStoryBoat();
  drawEchoes();
  if(holdTick) holdTick();
  if(gauge) paintGauge(depthCur);
  for(var i=0;i<frags.length;i++){
    var f=frags[i];
    if(!f.run) continue;
    f.t+=REDUCED?0.004:0.012;
    f.hover+=(f.near-f.hover)*0.08;
    if(!f.down){ f.bend*=0.9975; f.swing*=0.992; }
    f.reso=f.reso?f.reso*0.955:0;
    if(f.kind!=='light'||!f.near) f.warm*=0.9992;
    paintFrag(f);
  }
  requestAnimationFrame(loop);
}

if(page==='story'){
  addEventListener('pointermove',function(e){
    ptrX=e.clientX*DPR; ptrY=e.clientY*DPR;
    braidBoost=Math.min(0.22,braidBoost+0.0016);
  });
  addEventListener('pointerleave',function(){ ptrX=-1; ptrY=-1; });
}

addEventListener('scroll',readScroll,{passive:true});
addEventListener('resize',relayout);
addEventListener('load',relayout);
document.addEventListener('visibilitychange',function(){
  running=!document.hidden;
  if(running) requestAnimationFrame(loop);
});

relayout();
depthCur=depthTarget;
loop();

})();
