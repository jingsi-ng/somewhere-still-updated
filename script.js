(function(){
  var missing = [];
  if (typeof THREE === 'undefined') missing.push('three.min.js');
  if (!missing.length) return;
  var load = function(src, next){
    var t = document.createElement('script');
    t.src = src; t.onload = next; t.onerror = next;
    if (src.indexOf('http') === 0) t.crossOrigin = 'anonymous';
    document.head.appendChild(t);
  };
  if (missing.indexOf('three.min.js') > -1)
    load('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
})();

(function(){
var BASE = window.SITE_AUDIO_BASE || 'assets/audio/';
var EXT = ['.mp3', '.wav', '.m4a', '.ogg'];

var MAP = {
  surface_amb:       'atmo 1 ss (base layer).mp3',
  descent_amb:       'atmo 2 ss (base layer).mp3',
  floor_arrival:     'oceanfloor.mp3',
  house_base:        'margaret entering the house.mp3',
  entry_plunge:      'margaret entry transition.mp3',
  plunge_melody:     'entry plunge w_ melody.mp3',
  plunge_nomel:      'entry plunge no melody.mp3',
  plunge_rise:       'entry plunge w_ melody2.mp3',
  mirror_lit:        'mirror lit up sound.mp3',
  redshoe_5:         'Elin where_s the red ballet shoe5.mp3',
  end_laststage:     'the stage will never be hers....m4a',
  end_thankyou:      'thank_you_Margaret-1.m4a',
  w1s1_flicker:      'ambulance crying.mp3',
  w1s2_ballet:       'theme margaret or megan 1 ss.mp3',
  w1s2_wedding:      'wedding music1.mp3',
  w1s3_monitor:      'vital signs beep gradual change.mp3',
  w1s4_mama:         '(Elin) Old Margaret Mama.mp3',
  w1s5_applause:     'applause for kitchen.mp3',
  w1s5_mothervoice:  'Margaret’s mum_ we should try again -3.m4a',
  w1s6_crying:       'margaret crying.mp3',
  w1s9_chime:        'petal wipe.mp3',
  w2f2_dollgirl:     'girl with doll ambient.mp3',
  w2s2_sorry:        'Wave 2 scene 2 doctor line.m4a',
  w2s3_ringbreak:    'the ring breaks.mp3',
  w2s4_boom2:        'car crash (red doll).mp3',
  w3s1_funeralbed:   'funeral song (just on its own).mp3',
  w3s2_vowloop:      'Younger Margaret_ yes I do -3.m4a',
  w3s2_vowpeter:     'Wave 2 scene 2 yes, I do(Peter).m4a',
  w3s5_pretty:       'Mama Am I Pretty Now (Real Kid).mp3',
  w4s6_vow:          'pastor.m4a'
};

var LOOPING = {
  surface_amb: 1, descent_amb: 1, floor_arrival: 1, house_base: 1,
  w3s2_vowloop: 1
};

var GAIN = {};

var ctx = null, master = null, lowpass = null, comp = null;
var busSfx = null, busAmb = null;
var unlocked = false;
var buf = {}, job = {}, failed = {};
var live = [];
var ambNow = null, ambHandle = null;
var pending = [];

function candidates(key) {
  var out = [];
  if (MAP[key]) out.push(MAP[key]);
  for (var i = 0; i < EXT.length; i++) out.push(key + EXT[i]);
  return out;
}

function loadKey(key) {
  if (buf[key]) return Promise.resolve(buf[key]);
  if (job[key]) return job[key];
  if (!ctx) return Promise.resolve(null);
  var names = candidates(key), i = 0;
  function next() {
    if (i >= names.length) {
      failed[key] = true;
      return null;
    }
    var name = names[i++];
    return new Promise(function (res) {
      var el = new Audio();
      el.preload = 'auto';
      var settled = false;
      var ok = function () {
        if (settled) return; settled = true;
        buf[key] = el;

        res(el);
      };
      var no = function () {
        if (settled) return; settled = true;
        res(next());
      };
      el.addEventListener('canplaythrough', ok, { once: true });
      el.addEventListener('loadedmetadata', ok, { once: true });
      el.addEventListener('error', no, { once: true });
      el.src = BASE + encodeURIComponent(name);
      setTimeout(no, 8000);
    });
  }
  job[key] = Promise.resolve().then(next);
  return job[key];
}

function ensureCtx() {
  if (ctx) return true;
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  try { ctx = new AC(); } catch (e) { return false; }

  master = ctx.createGain();
  master.gain.value = 0.9;

  lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 20000;
  lowpass.Q.value = 0.7;

  comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -12;
  comp.knee.value = 6;
  comp.ratio.value = 4;
  comp.attack.value = 0.004;
  comp.release.value = 0.18;

  busSfx = ctx.createGain(); busSfx.gain.value = 1;
  busAmb = ctx.createGain(); busAmb.gain.value = 1;

  busSfx.connect(master);
  busAmb.connect(master);
  master.connect(comp);
  comp.connect(lowpass);
  lowpass.connect(ctx.destination);
  return true;
}

function flushPending() {
  var q = pending; pending = [];
  for (var i = 0; i < q.length; i++) q[i]();
}

function unlock() {
  if (!ensureCtx()) return;
  if (ctx.state === 'suspended') ctx.resume();
  if (!unlocked) { unlocked = true; flushPending(); }
}

function ramp(param, to, secs, when) {
  var T = when == null ? ctx.currentTime : when;
  try {
    param.cancelScheduledValues(T);
    param.setValueAtTime(param.value, T);
    if (secs > 0) param.linearRampToValueAtTime(to, T + secs);
    else param.setValueAtTime(to, T);
  } catch (e) { param.value = to; }
}

function start(key, opts, bus) {
  opts = opts || {};
  var el = buf[key];
  if (!el) return null;
  var node = el;
  if (!el.__free) { node = el.cloneNode(); node.src = el.currentSrc || el.src; }
  el.__free = false;
  node.loop = opts.loop != null ? !!opts.loop : !!LOOPING[key];
  if (opts.rate) { try { node.playbackRate = opts.rate; } catch (e) {} }
  var g = ctx.createGain();
  var vol = (opts.gain != null ? opts.gain : 1) * (GAIN[key] != null ? GAIN[key] : 1);
  var fi = (opts.fadeIn || 0) / 1000;
  var T = ctx.currentTime;
  if (fi > 0) { g.gain.setValueAtTime(0.0001, T); ramp(g.gain, vol, fi); }
  else g.gain.setValueAtTime(vol, T);
  var srcNode = null;
  try {
    srcNode = node.__tap || ctx.createMediaElementSource(node);
    node.__tap = srcNode;
    srcNode.connect(g);
    g.connect(bus);
  } catch (e) {
    node.volume = Math.max(0, Math.min(1, vol));
  }
  try { node.currentTime = 0; } catch (e) {}
  var go = function () { node.play().catch(function () {}); };
  if (opts.delay) setTimeout(go, opts.delay); else go();
  var h = { key: key, el: node, gain: g, loop: node.loop };
  live.push(h);
  node.addEventListener('ended', function () {
    var i = live.indexOf(h);
    if (i >= 0) live.splice(i, 1);
    if (node === el) el.__free = true;
  }, { once: true });
  return h;
}

function stopHandle(h, fadeMs) {
  if (!h) return;
  var f = (fadeMs == null ? 300 : fadeMs) / 1000;
  var T = ctx.currentTime;
  if (h.gain) ramp(h.gain.gain, 0.0001, f);
  setTimeout(function () {
    try { h.el.pause(); h.el.__free = true; } catch (e) {}
  }, f * 1000 + 60);
  var i = live.indexOf(h);
  if (i >= 0) live.splice(i, 1);
}

var SFX = {
  unlock: unlock,

  preload: function (keys) {
    if (!ensureCtx()) return Promise.resolve([]);
    return Promise.all((keys || []).map(loadKey));
  },

  play: function (key, opts) {
    if (!key) return null;
    if (!ensureCtx()) return null;
    if (!unlocked) {
      pending.push(function () { SFX.play(key, opts); });
      return null;
    }
    if (buf[key]) return start(key, opts, busSfx);
    if (failed[key]) return null;
    loadKey(key).then(function (b) {
      if (b) start(key, opts, busSfx);
    });
    return null;
  },

  stop: function (key, fadeMs) {
    for (var i = live.length - 1; i >= 0; i--) {
      if (live[i].key === key) stopHandle(live[i], fadeMs);
    }
  },

  cutAll: function (fadeMs) {
    if (!ctx) return;
    for (var i = live.length - 1; i >= 0; i--) stopHandle(live[i], fadeMs == null ? 160 : fadeMs);
    ambNow = null; ambHandle = null;
  },

  setDepth: function (d) {
    if (!ctx || !lowpass) return;
    var x = Math.max(0, Math.min(1, d || 0));
    ramp(lowpass.frequency, 20000 - x * 19400, 0.25);
    ramp(master.gain, 0.9 - x * 0.45, 0.25);
  },

  volume: function (v) {
    if (!ctx) return;
    ramp(master.gain, Math.max(0, Math.min(1, v)), 0.2);
  },

  report: function () {
    var keys = Object.keys(MAP);
    return {
      base: BASE,
      context: ctx ? ctx.state : 'none',
      unlocked: unlocked,
      loaded: keys.filter(function (k) { return !!buf[k]; }),
      missing: keys.filter(function (k) { return failed[k]; }),
      untried: keys.filter(function (k) { return !buf[k] && !failed[k]; }),
      playing: live.map(function (h) { return h.key; })
    };
  }
};

var Ambience = {
  to: function (key, opts) {
    opts = opts || {};
    if (!ensureCtx()) return;
    if (!unlocked) { pending.push(function () { Ambience.to(key, opts); }); return; }
    if (ambNow === key && ambHandle) return;
    var prev = ambHandle;
    ambNow = key; ambHandle = null;
    loadKey(key).then(function (b) {
      if (ambNow !== key) return;
      if (prev) stopHandle(prev, opts.fadeOut == null ? 900 : opts.fadeOut);
      if (!b) return;
      ambHandle = start(key, {
        loop: true,
        gain: opts.gain != null ? opts.gain : 0.7,
        fadeIn: opts.fadeIn == null ? 2000 : opts.fadeIn
      }, busAmb);
    });
  },

  silence: function (fadeMs) {
    ambNow = null;
    if (ambHandle) { stopHandle(ambHandle, fadeMs == null ? 700 : fadeMs); ambHandle = null; }
  },

  current: function () { return ambNow; }
};

window.SFX = SFX;
window.Ambience = Ambience;

['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
  window.addEventListener(ev, unlock, { once: false, passive: true });
});

})();

(function(){
  const cv=document.getElementById('g0canvas');
  if(!cv) return;
  const ctx=cv.getContext('2d');
  let W,H,bubbles=[],t=0,running=true;
  function resize(){ W=cv.width=innerWidth*Math.min(devicePixelRatio,2); H=cv.height=innerHeight*Math.min(devicePixelRatio,2);
    cv.style.width=innerWidth+'px'; cv.style.height=innerHeight+'px'; }
  resize(); addEventListener('resize',resize);
  function makeBubble(){ return { x:Math.random()*W, y:H+Math.random()*H*0.4,
    r:(Math.random()*3+1)*Math.min(devicePixelRatio,2), sp:(Math.random()*0.6+0.3)*Math.min(devicePixelRatio,2),
    sway:Math.random()*1000, a:Math.random()*0.4+0.1 }; }
  for(let i=0;i<60;i++){ const b=makeBubble(); b.y=Math.random()*H; bubbles.push(b); }
  function draw(){
    if(!running) return;
    t+=0.01;
    ctx.clearRect(0,0,W,H);

    for(let i=0;i<4;i++){
      const cx=W*(0.2+0.2*i)+Math.sin(t*0.5+i)*W*0.06;
      const cy=H*0.12+Math.sin(t*0.7+i*1.3)*H*0.04;
      const rad=Math.min(W,H)*(0.16+0.04*Math.sin(t+i));
      const g=ctx.createRadialGradient(cx,cy,0,cx,cy,rad);
      g.addColorStop(0,'rgba(174,218,234,'+(0.06+0.03*Math.sin(t*1.3+i))+')');
      g.addColorStop(1,'rgba(174,218,234,0)');
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    }

    const sg=ctx.createLinearGradient(0,0,0,H);
    sg.addColorStop(0,'rgba(150,200,220,0.10)');
    sg.addColorStop(0.4,'rgba(120,170,200,0.02)');
    sg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=sg; ctx.fillRect(0,0,W,H);

    for(const b of bubbles){
      b.y-=b.sp; b.x+=Math.sin(t*1.5+b.sway)*0.4;
      if(b.y<-10){ Object.assign(b,makeBubble()); }
      ctx.beginPath();
      const bg=ctx.createRadialGradient(b.x-b.r*0.3,b.y-b.r*0.3,0,b.x,b.y,b.r);
      bg.addColorStop(0,'rgba(220,240,248,'+(b.a+0.25)+')');
      bg.addColorStop(0.7,'rgba(174,218,234,'+(b.a*0.5)+')');
      bg.addColorStop(1,'rgba(174,218,234,0)');
      ctx.fillStyle=bg; ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();

  window.__stopGateCanvas=function(){ running=false; };
})();

const COL = {

  margaret:new THREE.Color('#C9D3DA'), margaretCore:new THREE.Color('#B23A2E'),
  megan:   new THREE.Color('#8A8493'), meganCore:   new THREE.Color('#1B2A4A'),
  thomas:  new THREE.Color('#D98324'), thomasCore:  new THREE.Color('#FFFFFF'),

  seaNear: new THREE.Color('#2C7E9E'),
  seaMid:  new THREE.Color('#13506E'),
  seaDeep: new THREE.Color('#082C44'),
  abyss:   new THREE.Color('#04192B')
};

const renderer = new THREE.WebGLRenderer({canvas:document.getElementById('c'),antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(COL.seaMid.getHex(),0.02);

const camera = new THREE.PerspectiveCamera(68,innerWidth/innerHeight,0.1,300);
const camGroup = new THREE.Group();
const camTilt  = new THREE.Group();
camGroup.add(camTilt);
camTilt.add(camera);
scene.add(camGroup);
camera.position.set(0,0,0);
camera.lookAt(0,0,-1);

scene.add(new THREE.AmbientLight(0x2a5a74,0.9));
const key = new THREE.PointLight(0xBfE2F0,1.6,180);
key.position.set(10,30,-40);
scene.add(key);
const fill= new THREE.PointLight(0x2C7E9E,1.2,180);
fill.position.set(-20,-10,-80); scene.add(fill);

const TRAVEL=420, SINK=70;

const P=2600;
const pgeo=new THREE.BufferGeometry();
const ppos=new Float32Array(P*3),pcol=new Float32Array(P*3),psz=new Float32Array(P);
const palette=[COL.margaret,COL.megan,COL.thomas,new THREE.Color('#7FB4C8'),new THREE.Color('#3E6B86')];
for(let i=0;i<P;i++){
  ppos[i*3]=(Math.random()-0.5)*120;
  ppos[i*3+1]=(Math.random()-0.5)*120-10;
  ppos[i*3+2]=-Math.random()*(TRAVEL+80);
  const c=palette[(Math.random()*palette.length)|0];
  pcol[i*3]=c.r;
  pcol[i*3+1]=c.g;
  pcol[i*3+2]=c.b;
  psz[i]=Math.random()*2.4+0.5;
}
pgeo.setAttribute('position',new THREE.BufferAttribute(ppos,3));
pgeo.setAttribute('color',new THREE.BufferAttribute(pcol,3));
pgeo.setAttribute('aSize',new THREE.BufferAttribute(psz,1));
const pMat=new THREE.ShaderMaterial({
  transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  uniforms:{uTime:{value:0},uPixelRatio:{value:Math.min(devicePixelRatio,2)},uFlash:{value:0}},
  vertexShader:`attribute float aSize; attribute vec3 color; varying vec3 vC; varying float vF;
    uniform float uTime; uniform float uPixelRatio; uniform float uFlash;
    void main(){ vC=color; vec3 p=position;
      p.x+=cos(uTime*0.2+p.z*0.05)*0.7; p.y+=sin(uTime*0.25+p.x*0.08)*0.6;
      vec4 mv=modelViewMatrix*vec4(p,1.0); vF=clamp(1.0/(1.0+abs(mv.z)*0.03),0.0,1.0);
      gl_PointSize=aSize*uPixelRatio*(150.0/-mv.z)*(1.0+uFlash*1.4); gl_Position=projectionMatrix*mv; }`,
  fragmentShader:`varying vec3 vC; varying float vF; uniform float uFlash;
    void main(){
      vec2 q=abs(gl_PointCoord-vec2(0.5));
      float d=q.x+q.y;
      if(d>0.5)discard;
      vec3 col=mix(vC, vec3(1.0), uFlash*0.6);
      gl_FragColor=vec4(col, smoothstep(0.5,0.0,d)*vF*(0.85+uFlash*0.7)); }`
});
scene.add(new THREE.Points(pgeo,pMat));

const backdropMat=new THREE.ShaderMaterial({
  side:THREE.BackSide,depthWrite:false,
  uniforms:{uTop:{value:COL.seaNear},uMid:{value:COL.seaMid},uBot:{value:COL.abyss}},
  vertexShader:`varying vec3 vP; void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`precision highp float; varying vec3 vP; uniform vec3 uTop,uMid,uBot;
    void main(){ float h=normalize(vP).y*0.5+0.5;
      vec3 col = h>0.5 ? mix(uMid,uTop,(h-0.5)*2.0) : mix(uBot,uMid,h*2.0);
      gl_FragColor=vec4(col,1.0); }`
});
const backdrop=new THREE.Mesh(new THREE.SphereGeometry(160,32,32),backdropMat);
camGroup.add(backdrop);

function makeRipple(colObj,coreObj,x,y,z,size,major,mode,name){
  const g=new THREE.PlaneGeometry(size,size,1,1);
  const m=new THREE.ShaderMaterial({
    transparent:true,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending,
    uniforms:{uTime:{value:0},uColor:{value:colObj},uCore:{value:coreObj},
      uSeed:{value:Math.random()*10},uMajor:{value:major?1:0},uHi:{value:0},uMode:{value:mode}},
    vertexShader:`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`
      precision highp float;
      varying vec2 vUv; uniform float uTime,uSeed,uMajor,uHi,uMode;
      uniform vec3 uColor,uCore;
      void main(){
        vec2 p=(vUv-0.5)*2.0; float ang=atan(p.y,p.x);
        float wob=0.045*sin(ang*5.0+uTime*0.6+uSeed)+0.03*sin(ang*9.0-uTime*0.4);
        float r=length(p)*(1.0+wob);
        if(r>1.0) discard;
        float freq=mix(12.0,22.0,uMajor);
        float waves=sin(r*freq - uTime*2.2 + uSeed*3.0);
        float rings=smoothstep(0.55,1.0,waves)*smoothstep(1.0,0.15,r);
        float core=smoothstep(0.18,0.0,r);
        float coreGlow=smoothstep(0.5,0.0,r);
        float halo=pow(smoothstep(1.0,0.0,r),1.6)*uMajor;
        float restless = (uMode>1.5)? 0.12*sin(uTime*7.0+uSeed) : 0.0;
        float pulse=0.62+0.16*sin(uTime*1.1+uSeed)+restless;

        vec3 col=uColor;
        float nearC=smoothstep(0.45,0.0,r);
        if(uMode<0.5){
          col=mix(uColor,uCore, nearC*(0.62+uHi*0.38));
          col=mix(col,vec3(1.0),core*0.4);
        } else if(uMode<1.5){
          col=mix(uColor,uCore, nearC*(0.55+uHi*0.45));
        } else {
          col=mix(uColor,vec3(1.0), smoothstep(0.32,0.0,r)*(0.5+uHi*0.5));
        }

        float baseA=mix(0.42,0.78,uMajor);
        float glow=(rings*0.7+coreGlow*0.7+halo*0.6)*pulse + core*0.8;
        float a=glow*baseA;
        a += uHi*(rings*0.4+coreGlow*0.6+halo*0.5);
        gl_FragColor=vec4(col, clamp(a,0.0,1.1));
      }`
  });
  const mesh=new THREE.Mesh(g,m);
  mesh.position.set(x,y,z);
  mesh.userData={major,name,mode};
  scene.add(mesh);
  return {mat:m,mesh,major,name};
}

const ripples=[
  makeRipple(COL.megan,   COL.meganCore,    4.8,-4.1,-118,44,true,1,'megan'),
  makeRipple(COL.thomas,  COL.thomasCore,  -9.4,-8.0,-232,86,true,2,'thomas'),
  makeRipple(COL.margaret,COL.margaretCore,9.8,-11.8,-340,126,true,0,'margaret')
];
const minorPal=[[COL.margaret,COL.margaretCore,0],[COL.megan,COL.meganCore,1],[COL.thomas,COL.thomasCore,2],[new THREE.Color('#7FB4C8'),new THREE.Color('#7FB4C8'),0]];
for(let i=0;i<26;i++){
  const pick=minorPal[(Math.random()*minorPal.length)|0];
  ripples.push(makeRipple(pick[0],pick[1],(Math.random()-0.5)*90,(Math.random()-0.5)*60-5,-20-Math.random()*(TRAVEL-10),4+Math.random()*9,false,pick[2],null));
}

let scrollN=0,targetScroll=0;
let flash=0;
let preDive=1;
let diveVel=0;
let diveOffset=0;
function readScroll(){const max=document.body.scrollHeight-innerHeight;targetScroll=max>0?scrollY/max:0;}
addEventListener('scroll',readScroll,{passive:true});
readScroll();
let mx=0,my=0,tmx=0,tmy=0;
const pointer=new THREE.Vector2(-2,-2);
addEventListener('mousemove',e=>{tmx=(e.clientX/innerWidth-0.5);tmy=(e.clientY/innerHeight-0.5);
  pointer.x=(e.clientX/innerWidth)*2-1;
  pointer.y=-(e.clientY/innerHeight)*2+1;});

const raycaster=new THREE.Raycaster(); let hovered=null;
const majorMeshes=ripples.filter(r=>r.major).map(r=>r.mesh);
const storyData={
  margaret:{thread:'Thread 03 · Family',name:'Margaret',col:'#C9D3DA',object:'a pair of ballet shoes, never worn again',quote:'&ldquo;She danced once, for a room that loved her.<br>Help her find the last steps.&rdquo;',poem:'&middot; the pale held to the edge of tearing'},
  megan:{thread:'Thread 01 · Friendship',name:'Megan',col:'#8A8493',object:'an unfinished canvas, the words still unsaid',quote:'&ldquo;There was a letter she never sent.<br>Hold it still, before the water takes it.&rdquo;',poem:'&middot; the silence that sank, and stayed'},
  thomas:{thread:'Thread 02 · Love',name:'Thomas',col:'#D98324',object:'an open music score, one bar left blank',quote:'&ldquo;The song was almost whole.<br>Help him remember how it ends.&rdquo;',poem:'&middot; one bar of light, left burning'}
};
const whiteoutEl=document.getElementById('whiteout');
let transitioned=false;
function enterStory(name){
  if(transitioned) return;
  if(!storyData[name]) return;
  transitioned = true;
  if(window.SFX && SFX.cutAll) SFX.cutAll(600);
  if(window.Ambience && Ambience.silence) Ambience.silence(700);
  document.documentElement.classList.add('frozen');
  try{ sessionStorage.setItem('ss_audio_ok','1'); }catch(e){}
  Veil.drop(name + '.html', 900);
}
window.__backToSea=function(){
  const overlay=document.getElementById('landing-overlay');
  ['c','caustics','flashlayer','g0canvas'].forEach(id=>{ const el=document.getElementById(id); if(el) el.style.display=''; });
  document.documentElement.classList.remove('frozen');
  if(overlay){ overlay.style.display=''; overlay.style.transition='opacity 1.2s ease'; overlay.style.opacity='0';
    requestAnimationFrame(()=>{ overlay.style.opacity='1'; }); }
  transitioned=false;
};

let hasEntered=false;
const DESCEND_GATE=0.14;
let descended=false;
function gateOpen(){ return hasEntered && descended; }
addEventListener('click',()=>{
  if(!gateOpen()) return;
  if(hovered){ enterStory(hovered.userData.name); }
});

const floorgateEl=document.getElementById('floorgate');
const navlayerEl=document.getElementById('navlayer');
const ropeLampEl=document.getElementById('ropelamp');
const riseTopEl=document.getElementById('risetop');
if(riseTopEl) riseTopEl.addEventListener('click',()=>{
  try { window.scrollTo({ top:0, behavior:'smooth' }); }
  catch(e){ window.scrollTo(0,0); }
});
function ssThreadDone(k){ try{ return sessionStorage.getItem(k+'_complete')==='true'; }catch(e){ return false; } }
function ssAllDone(){ return ssThreadDone('margaret') && ssThreadDone('megan') && ssThreadDone('thomas'); }
let navOpenTimer=null, navCloseTimer=null, navFadeTimer=null;
function openNav(skipSurfaceFlash){
  if(navCloseTimer){ clearTimeout(navCloseTimer); navCloseTimer=null; }
  if(navFadeTimer){ clearTimeout(navFadeTimer); navFadeTimer=null; }
  if(navOpenTimer){ clearTimeout(navOpenTimer); navOpenTimer=null; }
  if(!skipSurfaceFlash) whiteoutEl.style.opacity='1';
  if(ropeLampEl) ropeLampEl.classList.remove('on');
  navOpenTimer=setTimeout(()=>{
    navOpenTimer=null;
    navlayerEl.classList.add('show');
    navlayerEl.classList.add('visible');
    initNav();
    navFadeTimer=setTimeout(()=>{ navFadeTimer=null; whiteoutEl.style.opacity='0'; }, 260);
  }, skipSurfaceFlash ? 60 : 700);
}
document.getElementById('floorMap').addEventListener('click',()=>goNav());
function goNav(){
  if (window.SFX && SFX.cutAll) SFX.cutAll(1400);
  if (window.SFX) SFX.play('plunge_rise');
  openNav();
}
function pullLamp(){
  if(!ropeLampEl || ropeLampEl.classList.contains('pulled')) return;
  ropeLampEl.classList.add('pulled');
  setTimeout(()=>{ if(ropeLampEl) ropeLampEl.classList.remove('pulled'); goNav(); }, 420);
}
if(ropeLampEl){ ropeLampEl.addEventListener('click',pullLamp);
  ropeLampEl.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); pullLamp(); } }); }
document.getElementById('navback').addEventListener('click',(e)=>{
  e.preventDefault();
  if(!audioReady){
    startAudio();
    if(window.SFX && SFX.unlock) SFX.unlock();
    if(window.Ambience) Ambience.to('floor_arrival',{ fadeIn:3200 });
  }
  if(navOpenTimer){ clearTimeout(navOpenTimer); navOpenTimer=null; }
  if(navFadeTimer){ clearTimeout(navFadeTimer); navFadeTimer=null; }
  if(navCloseTimer) clearTimeout(navCloseTimer);
  navlayerEl.classList.remove('visible');
  navCloseTimer=setTimeout(()=>{
    navCloseTimer=null;
    navlayerEl.classList.remove('show');
    stopNav();
    try { window.scrollTo(0, 0); } catch(err){ scrollTo(0,0); }
    readScroll();
    if(ropeLampEl) ropeLampEl.classList.add('on');
  },1100);
});

let audioReady=false;
function startAudio(){
  if(window.SFX && SFX.unlock) SFX.unlock();
  audioReady=true;
}
function updateAudioByDepth(depth01){
  if(window.SFX && SFX.setDepth) SFX.setDepth(depth01);
}

window.addEventListener('pointerdown', function surfaceBreath(){
  if (window.SFX) SFX.unlock();
  if (window.Ambience) Ambience.to('surface_amb', { fadeIn: 2600 });
}, { once:true });

const gate0=document.getElementById('gate0');
const heroEl=document.getElementById('hero');
const causticsEl=document.getElementById('caustics');
document.getElementById('gate0').addEventListener('click',(e)=>{
  e.stopPropagation();
  if (gate0.classList.contains('g0-waiting')) return;

  requestPermissionsOnce();

  try{ sessionStorage.setItem('ss_audio_ok','1'); }catch(e){}
  try{ startAudio(); }catch(err){ window.SS_BOOT_ERR = 'startAudio: ' + err.message; }
  try{
    if (window.SFX){
      SFX.unlock();
      SFX.play('plunge_nomel');
      if (window.Ambience) Ambience.to('descent_amb', { fadeIn: 2200, fadeOut: 900 });
    }
  }catch(err){ window.SS_BOOT_ERR = 'audio start: ' + err.message; }
  gate0.classList.add('dissolving');
  setTimeout(()=>{ if(window.__stopGateCanvas) window.__stopGateCanvas(); },1300);
  diveVel = -1.5;
  diveOffset = 0;
  setTimeout(()=>{ gate0.classList.add('hide'); },1100);
  setTimeout(()=>{ heroEl.classList.add('revealed'); causticsEl.style.opacity='0.55'; },2600);
  setTimeout(()=>{ const r=document.getElementById('ropelamp'); if(r) r.classList.add('on'); },5200);
  setTimeout(()=>{ hasEntered=true; if(window.Grammar) Grammar.cursorOn(); },2800);
});

const L={1:document.getElementById('l1'),2:document.getElementById('l2'),3:document.getElementById('l3')};
const nameMap=new Map([['margaret',L[1]],['megan',L[2]],['thomas',L[3]]]);
function band(s,a,b){ if(s<a||s>b)return 0; const t=(s-a)/(b-a); return Math.sin(t*Math.PI); }
let __floorReached = false;
function updateText(s){
  if(s>0.012) heroEl.classList.add('dissolve'); else heroEl.classList.remove('dissolve');

  if(!descended && s>DESCEND_GATE){
    descended=true;
    document.documentElement.classList.add('ss-descended');
  } else if(descended && s<DESCEND_GATE*0.55){
    descended=false;
    document.documentElement.classList.remove('ss-descended');
  }

  const ropeK = Math.max(0, Math.min(1, s));
  document.documentElement.style.setProperty('--rope', ropeK.toFixed(3));
  if(ropeLampEl) ropeLampEl.dataset.deep = ropeK > 0.14 ? '1' : '0';
  if(riseTopEl) riseTopEl.classList.toggle('on', ropeK > 0.16);

  const finished = ssAllDone();
  floorgateEl.classList.toggle('earned', finished);
  document.body.classList.toggle('all-held', finished);
  if(finished ? s>0.84 : s>0.88) floorgateEl.classList.add('show');
  else floorgateEl.classList.remove('show');

  if(!__floorReached && s>0.90){
    __floorReached = true;
    if (window.Ambience) Ambience.to('floor_arrival', { fadeIn: 3200 });
  }
}

const depthEl=document.getElementById('depth');
const clock=new THREE.Clock();

function animate(){
  requestAnimationFrame(animate);
  const t=clock.getElapsedTime();
  scrollN+=(targetScroll-scrollN)*0.06;

  diveOffset += diveVel;
  diveVel *= 0.88;
  diveOffset *= 0.96;
  if(Math.abs(diveVel)<0.001) diveVel=0;

  camGroup.position.z=-scrollN*TRAVEL + diveOffset*14;
  camGroup.position.y=-scrollN*SINK + diveOffset*8;
  camera.fov=68+scrollN*14; camera.updateProjectionMatrix();

  mx+=(tmx-mx)*0.04; my+=(tmy-my)*0.04;
  camTilt.rotation.y=-mx*0.4; camTilt.rotation.x=-my*0.3;

  flash += (0-flash)*0.04;
  if(hasEntered) preDive += (0-preDive)*0.05;

  const f=scene.fog;
  if(scrollN<0.5) f.color.lerpColors(COL.seaNear,COL.seaMid,scrollN/0.5);
  else f.color.lerpColors(COL.seaMid,COL.abyss,(scrollN-0.5)/0.5);

  f.density=0.014+scrollN*0.02 + preDive*0.05 - flash*0.04;
  causticsEl.style.opacity=(0.55*Math.max(0,1-scrollN/0.16)).toFixed(3);

  pMat.uniforms.uTime.value=t;
  pMat.uniforms.uFlash.value=flash;
  backdropMat.uniforms.uTop.value=f.color;
  ripples.forEach(r=>r.mat.uniforms.uTime.value=t);

  raycaster.setFromCamera(pointer,camera);
  const hits=raycaster.intersectObjects(majorMeshes);
  const newHover=(gateOpen()&&hits.length)?hits[0].object:null;
  if(newHover!==hovered){ hovered=newHover; document.body.style.cursor=hovered?'pointer':'default';
    if(window.Grammar) Grammar.mode(hovered?'live':'idle'); }

  const hoverName=hovered?hovered.userData.name:null;
  nameMap.forEach((el,nm)=>{
    const tgt=(nm===hoverName)?1:0;
    const cur=parseFloat(el.style.opacity)||0;
    el.style.opacity=(cur+(tgt-cur)*0.15).toFixed(3);
  });
  const camZ=camGroup.position.z;
  ripples.forEach(r=>{
    if(!r.major)return;
    const tgt=(r.mesh===hovered)?1:0; const cur=r.mat.uniforms.uHi.value;
    r.mat.uniforms.uHi.value=cur+(tgt-cur)*0.12;
    const dz=Math.abs(r.mesh.position.z-camZ); const near=Math.max(0,1-dz/120);
    const rb=(gateOpen()&&window.Grammar)?Grammar.breath(r.mesh.position.z*0.013):0;
    const sc=(1+near*0.22)*(1+0.04*Math.sin(t*1.3+r.mesh.position.z))*(1+(1-r.mat.uniforms.uHi.value)*near*rb*0.055);
    r.mesh.scale.set(sc,sc,sc);
  });

  depthEl.textContent='DEPTH '+(scrollN*4400).toFixed(1).padStart(6,'0')+' m';
  updateText(scrollN);
  updateAudioByDepth(scrollN);

  renderer.setRenderTarget(null);
  renderer.render(scene,camera);
}
animate();

addEventListener('resize',()=>{
  renderer.setSize(innerWidth,innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix();
  pMat.uniforms.uPixelRatio.value=Math.min(devicePixelRatio,2);
  readScroll();
});

(function(){
  const navCanvas=document.getElementById('navcanvas');
  if(!navCanvas) return;
  const nctx=navCanvas.getContext('2d');
  const DPRn=Math.min(devicePixelRatio||1,2);
  let U=DPRn*2.4;
  let nW,nH,navRunning=false,navRAF=null,nt=0;
  let nmx=-9999,nmy=-9999;
  let closeT=0;
  let hoverLamp=null,hoverChild=null,threadsOpen=false;
  let rising=null,sinkingTo=null;
  let surfRings=[],nextRingT=4,farBoatX=-0.4;


  function threadDone(k){ try{ return sessionStorage.getItem(k+'_complete')==='true'; }catch(e){ return false; } }
  function doneCount(){ return (threadDone('margaret')?1:0)+(threadDone('megan')?1:0)+(threadDone('thomas')?1:0); }

  function navGetDiscovered(k){ try{return sessionStorage.getItem('ss_discovered_'+k)==='1';}catch(e){return false;} }
  function navSetDiscovered(k){ try{sessionStorage.setItem('ss_discovered_'+k,'1');}catch(e){} }

  const SS_UNLOCKED = { 
    margaret:true, megan:true, thomas:true, understanding:true, ourstory:true, team:true, fog:true, threads:true  
  };
  const SS_STILL_LOCKED = false;
  function ssLocked(key){ return !SS_UNLOCKED[key]; }
  function ssComingSoon(label){
    return;
    let el = document.getElementById('ss-soon');
    if (!el){
      el = document.createElement('div');
      el.id = 'ss-soon';
      el.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);'
        + 'z-index:99998;padding:22px 30px;border:1px solid rgba(201,211,218,.32);'
        + 'background:rgba(6,14,22,.92);color:#e8eef2;border-radius:3px;'
        + "font-family:Lora,Georgia,serif;font-style:italic;font-size:15px;letter-spacing:.03em;"
        + 'text-align:center;opacity:0;transition:opacity .6s ease;pointer-events:none;';
      document.body.appendChild(el);
    }
    el.innerHTML = label + '<br><span style="font-size:12px;font-style:normal;opacity:.62;'
      + 'letter-spacing:.18em;text-transform:uppercase">coming soon</span>';
    el.style.opacity = '1';
    clearTimeout(ssComingSoon._t);
    ssComingSoon._t = setTimeout(()=>{ el.style.opacity = '0'; }, 2200);
  }


const LAMPS=[
    {key:'understanding',text:'Understanding',  href:'understanding.html', bx:0.16, depth:0.44, col:'201,211,218'},
    {key:'ourstory',     text:'Our Story',      href:'our-story.html',     bx:0.34, depth:0.58, col:'214,196,158'},
    {key:'team',         text:'The Team',       href:'team.html',          bx:0.66, depth:0.42, col:'207,227,236', knots:4},
    {key:'fog',          text:'Inside the Fog', href:'fog.html',           bx:0.84, depth:0.56, col:'126,168,168', ink:true},
    {key:'threads',      text:'The Whole of It',                               bx:0.50, depth:0.72, col:'234,210,178', threads:true}
  ];
  LAMPS.forEach(l=>{ l.glow=0; l.lx=0; l.ly=0; });
  const CHILDREN=[
    {storyKey:'megan',    text:'Megan',    col:'138,132,147', core:'27,42,74',   o:-0.14, glow:0},
    {storyKey:'thomas',   text:'Thomas',   col:'217,131,36',  core:'255,255,255',o:0,     glow:0},
    {storyKey:'margaret', text:'Margaret', col:'201,211,218', core:'178,58,46',  o:0.14,  glow:0}
  ];

  let nsnow=[];
  function nseed(){ return {x:Math.random(),y:Math.random(),r:Math.random()*1.6+0.5,
    sp:Math.random()*0.0016+0.0008, sway:Math.random()*9, a:Math.random()*0.3+0.1}; }

  function nresize(){
    nW=navCanvas.width=innerWidth*DPRn; nH=navCanvas.height=innerHeight*DPRn;
    navCanvas.style.width=innerWidth+'px'; navCanvas.style.height=innerHeight+'px';
    U=DPRn*Math.max(1.9,Math.min(3.0,innerHeight/380));
  }

  function surfY(x){
    return nH*0.13 + Math.sin(x*0.004/DPRn+nt*0.7)*6*DPRn + Math.sin(x*0.009/DPRn-nt*0.45)*4*DPRn;
  }

  function drawBoat(x,y,sc,tilt){
    nctx.save(); nctx.translate(x,y); nctx.rotate(tilt); nctx.scale(sc,sc);
    nctx.fillStyle='rgba(6,16,26,0.92)';
    nctx.beginPath();
    nctx.moveTo(-26,0); nctx.lineTo(26,0); nctx.lineTo(14,12); nctx.lineTo(-14,12);
    nctx.closePath(); nctx.fill();
    nctx.beginPath();
    nctx.moveTo(0,-1); nctx.lineTo(12,-1); nctx.lineTo(0,-17);
    nctx.closePath(); nctx.fill();
    nctx.beginPath();
    nctx.moveTo(0,-1); nctx.lineTo(-12,-1); nctx.lineTo(0,-13);
    nctx.closePath(); nctx.fill();
    nctx.strokeStyle='rgba(234,242,246,0.4)'; nctx.lineWidth=1.6;
    nctx.beginPath(); nctx.moveTo(-26,0); nctx.lineTo(26,0); nctx.stroke();
    nctx.restore();
  }

  function fuzzyGlow(x,y,r,col,a){
    for(let k=0;k<3;k++){
      const jx=Math.sin(nt*0.9+k*2.1+x*0.01)*2.5*DPRn,
            jy=Math.cos(nt*0.7+k*1.7+y*0.01)*2.5*DPRn;
      const g=nctx.createRadialGradient(x+jx,y+jy,0,x+jx,y+jy,r*(0.7+k*0.25));
      g.addColorStop(0,`rgba(${col},${a})`);
      g.addColorStop(1,`rgba(${col},0)`);
      nctx.fillStyle=g;
      nctx.beginPath(); nctx.arc(x+jx,y+jy,r*(0.7+k*0.25),0,Math.PI*2); nctx.fill();
    }
  }

  function drawLamp(l,i,yOff){
    const bx=l.bx*nW;
    const by=surfY(bx)+yOff;
    const slope=(surfY(bx+8)-surfY(bx-8))/16;
    const lx=bx+Math.sin(nt*0.3+i*1.7)*7*U;
    const ly=l.depth*nH+Math.sin(nt*0.5+i)*4*U+yOff;
    l.lx=lx; l.ly=ly;
    nctx.strokeStyle=`rgba(207,227,236,${0.16+l.glow*0.18})`;
    nctx.lineWidth=0.7*U;
    nctx.beginPath(); nctx.moveTo(bx,by+5*U);
    nctx.quadraticCurveTo(bx+(lx-bx)*0.3, (by+ly)/2+10*U, lx, ly-9*U);
    nctx.stroke();
    if(l.knots){ for(let k=1;k<=4;k++){
      const p=0.55+k*0.09;
      const kx=bx+(lx-bx)*p, ky=by+(ly-by)*p;
      nctx.fillStyle=`rgba(228,239,244,${0.5+l.glow*0.4})`;
      nctx.beginPath(); nctx.arc(kx,ky,1.5*U,0,Math.PI*2); nctx.fill();
    }}
    const disc=navGetDiscovered(l.key)?1:0;
    let base=0.10+disc*0.10;
    if(l.key==='understanding'){
      const dn=doneCount();
      base+=Math.min(3,dn)*0.055;
      if(dn>=3) base+=0.06;
    }
    if(l.ink){
      const g=nctx.createRadialGradient(lx,ly,0,lx,ly,42*U*(1+l.glow*0.4));
      g.addColorStop(0,'rgba(2,8,14,0.55)'); g.addColorStop(1,'rgba(2,8,14,0)');
      nctx.fillStyle=g; nctx.beginPath(); nctx.arc(lx,ly,42*U*(1+l.glow*0.4),0,Math.PI*2); nctx.fill();
      nctx.strokeStyle=`rgba(${l.col},${0.5+l.glow*0.4+disc*0.15})`;
      nctx.lineWidth=1.1*U;
      nctx.save(); nctx.translate(lx,ly); nctx.scale(U/DPRn,U/DPRn);
      nctx.beginPath();
      nctx.moveTo(-4*DPRn,-14*DPRn); nctx.lineTo(4*DPRn,-14*DPRn);
      nctx.lineTo(4*DPRn,-8*DPRn);   nctx.lineTo(7*DPRn,-2*DPRn);
      nctx.lineTo(7*DPRn,12*DPRn);   nctx.lineTo(-7*DPRn,12*DPRn);
      nctx.lineTo(-7*DPRn,-2*DPRn);  nctx.lineTo(-4*DPRn,-8*DPRn);
      nctx.closePath(); nctx.stroke();
      nctx.fillStyle=`rgba(2,8,14,${0.7+l.glow*0.2})`;
      nctx.fillRect(-6*DPRn,2*DPRn,12*DPRn,9*DPRn);
      nctx.restore();
    }else{
      const lb=window.Grammar?Grammar.breath(i*0.19):0.5;
      const lbA=(1-l.glow)*lb*0.09;
      fuzzyGlow(lx,ly,(30+l.glow*18+lb*4)*U,l.col,base+l.glow*0.16+lbA);
      nctx.fillStyle=`rgba(${l.col},${0.65+l.glow*0.3+lbA*1.4})`;
      nctx.beginPath(); nctx.arc(lx,ly,3.4*U*(1+l.glow*0.25+lb*0.10),0,Math.PI*2); nctx.fill();
    }
    if(disc && !l.ink){
      nctx.strokeStyle=`rgba(${l.col},0.28)`; nctx.lineWidth=0.8*U;
      nctx.beginPath(); nctx.arc(lx,ly,8*U+Math.sin(nt*1.2+i)*1.4*U,0,Math.PI*2); nctx.stroke();
    }

    if(l.glow>0.02){
      nctx.fillStyle=`rgba(234,242,246,${l.glow*0.9})`;
      nctx.font=`italic ${10.5*U}px Lora, serif`;
      nctx.textAlign=lx>nW*0.5?'right':'left';
      nctx.fillText(l.text, lx+(lx>nW*0.5?-1:1)*15*U, ly+3.5*U);
      if(l.threads){
        nctx.fillStyle=`rgba(234,210,178,${l.glow*0.5})`;
        nctx.font=`${4.6*U}px "Space Mono", monospace`;
        nctx.fillText('T H E   T H R E E ,   B E L O W', lx+(lx>nW*0.5?-1:1)*15*U, ly+13*U);
      }
    }

    drawBoat(bx,by,U*1.15*(1+l.glow*0.08),Math.atan(slope)+Math.sin(nt*0.8+i)*0.04*(1+l.glow));
    const flick=0.7+0.3*Math.sin(nt*5.2+i*3.1)*Math.sin(nt*1.7+i);
    fuzzyGlow(bx,by-6*U,7*U,'236,200,150',0.10*flick+l.glow*0.06);
    nctx.fillStyle=`rgba(240,208,158,${0.7*flick})`;
    nctx.beginPath(); nctx.arc(bx,by-6*U,1.3*U,0,Math.PI*2); nctx.fill();
    for(let k2=0;k2<4;k2++){
      const wy=by+(9+k2*6)*U;
      const ww=(7-k2*1.2)*U*(0.6+0.4*Math.sin(nt*2.4+k2*2+i));
      const wa=(0.10-k2*0.02)*flick;
      if(wa<=0) continue;
      nctx.fillStyle=`rgba(236,200,150,${wa})`;
      nctx.fillRect(bx-ww/2+Math.sin(nt+k2+i)*2*U, wy, ww, 1.3*U);
    }
  }

  let threadsExt=0;
  function drawChildren(yOff){
    const th=LAMPS[4];
    const target=threadsOpen?1:Math.max(th.glow-0.45,0)*0.5;
    threadsExt+=(target-threadsExt)*0.055;
    const ext=threadsExt;
    if(ext<=0.02){ CHILDREN.forEach(c=>{c.glow=0;c.cx=null;}); return; }
    const e=ext*ext*(3-2*ext);
    CHILDREN.forEach((c,i)=>{
      const drop=(40+i*4)*U*e;
      const cx=th.lx+c.o*nW*0.85*e+Math.sin(nt*0.5+i*2.1)*2.5*U*e;
      const cy=th.ly+drop+Math.sin(nt*0.7+i)*2*U+yOff*0;
      c.cx=cx; c.cy=cy;
      const a=e*(0.5+c.glow*0.5);
      nctx.strokeStyle=`rgba(234,210,178,${0.20*e+c.glow*0.15})`;
      nctx.lineWidth=0.55*U;
      nctx.beginPath(); nctx.moveTo(th.lx,th.ly+3*U);
      nctx.quadraticCurveTo(th.lx+(cx-th.lx)*0.35,(th.ly+cy)/2+5*U,cx,cy-6*U);
      nctx.stroke();
      const cb=window.Grammar?Grammar.breath(i*0.31+0.5):0.5;
      fuzzyGlow(cx,cy,(13+c.glow*9+cb*3)*U,c.col,a*(0.35+(1-c.glow)*cb*0.16));
      if(c.storyKey==='megan'){
        nctx.fillStyle=`rgba(${c.core},${0.75*a})`;
        nctx.beginPath(); nctx.arc(cx,cy,2.6*U,0,Math.PI*2); nctx.fill();
      }else{
        nctx.fillStyle=`rgba(${c.core},${0.85*a})`;
        nctx.beginPath(); nctx.arc(cx,cy,2.2*U*(1+c.glow*0.3),0,Math.PI*2); nctx.fill();
      }
      if(c.glow>0.05){
        nctx.fillStyle=`rgba(234,242,246,${c.glow*0.9*e})`;
        nctx.font=`italic ${8.5*U}px Lora, serif`;
        nctx.textAlign='center';
        nctx.fillText(c.text,cx,cy+15*U);
      }
    });
  }

function navDraw(){
    if(!navRunning) return;
    nt+=0.016;
    nctx.clearRect(0,0,nW,nH);

    let yOff=0, bright=0;
    if(rising){
      const p=Math.min((nt-rising.t0)/1.7,1);
      const e=p*p*(3-2*p);
      yOff=e*nH*0.55; bright=e;
      if(p>=1 && !rising.done){ rising.done=true;
        if(rising.lamp.href && !ssLocked(rising.lamp.key)) window.location.href=rising.lamp.href;
      }
    }
    if(sinkingTo){
      const p=Math.min((nt-sinkingTo.t0)/1.1,1);
      yOff=-p*p*nH*0.4; bright=0;
      if(p>=1 && !sinkingTo.done){ sinkingTo.done=true;
        navlayerEl.classList.remove('visible');
        setTimeout(()=>{ navlayerEl.classList.remove('show'); window.stopNav();
          if(sinkingTo.storyKey && !ssLocked(sinkingTo.storyKey)){
            Veil.drop('still.html#'+sinkingTo.storyKey, 700);
          }
          sinkingTo=null;
        },900);
      }
    }

    const sTop=surfY(nW/2)+yOff;
    const sky=nctx.createLinearGradient(0,yOff,0,sTop+nH*0.25);
    sky.addColorStop(0,'rgba(214,236,244,0.95)');
    sky.addColorStop(0.4,'rgba(150,200,220,0.5)');
    sky.addColorStop(1,'rgba(150,200,220,0)');
    nctx.fillStyle=sky; nctx.fillRect(0,yOff-nH*0.2,nW,sTop+nH*0.45);
    nctx.strokeStyle='rgba(234,242,246,0.8)';
    nctx.lineWidth=1.1*U;
    nctx.beginPath();
    for(let x=0;x<=nW;x+=8){ const y=surfY(x)+yOff; x===0?nctx.moveTo(x,y):nctx.lineTo(x,y); }
    nctx.stroke();

    const moonX=nW*0.635, moonY=surfY(moonX)+yOff-nH*0.085;
    for(let k=0;k<3;k++){
      const g=nctx.createRadialGradient(moonX,moonY,0,moonX,moonY,(15+k*9)*U);
      g.addColorStop(0,`rgba(240,230,206,${0.16-k*0.04})`);
      g.addColorStop(1,'rgba(240,230,206,0)');
      nctx.fillStyle=g;
      nctx.beginPath(); nctx.arc(moonX,moonY,(15+k*9)*U,0,Math.PI*2); nctx.fill();
    }
    nctx.fillStyle='rgba(244,236,214,0.5)';
    nctx.beginPath(); nctx.arc(moonX,moonY,5.5*U,0,Math.PI*2); nctx.fill();
    for(let k=0;k<9;k++){
      const py2=surfY(moonX)+yOff+(6+k*9)*U;
      const w2=(16-k*1.3)*U*(0.6+0.4*Math.sin(nt*1.6+k*1.9));
      const a2=(0.11-k*0.010)*(0.55+0.45*Math.sin(nt*2.1+k*1.3));
      if(a2<=0||w2<=0) continue;
      nctx.fillStyle=`rgba(240,230,206,${a2})`;
      nctx.fillRect(moonX-w2/2+Math.sin(nt*0.8+k)*3*U, py2, w2, 1.6*U);
    }

    if(nt>nextRingT){ nextRingT=nt+5+Math.random()*6;
      surfRings.push({x:Math.random()*0.8+0.1, t0:nt}); }
    surfRings=surfRings.filter(r=>nt-r.t0<2.4);
    for(const r of surfRings){
      const age=nt-r.t0, rx=r.x*nW, ry=surfY(rx)+yOff;
      const rr=age*26*U, ra=0.30*(1-age/2.4);
      nctx.strokeStyle=`rgba(234,242,246,${ra})`;
      nctx.lineWidth=0.8*U;
      nctx.beginPath(); nctx.ellipse(rx,ry,rr,rr*0.24,0,0,Math.PI*2); nctx.stroke();
    }

    farBoatX+=0.00016;
    if(farBoatX>1.15){ farBoatX=-0.15-Math.random()*0.6; }
    if(farBoatX>-0.1 && farBoatX<1.1){
      const fx=farBoatX*nW, fy=surfY(fx)+yOff;
      nctx.globalAlpha=0.4;
      drawBoat(fx,fy,U*0.42,Math.sin(nt*0.5)*0.03);
      nctx.globalAlpha=1;
    }

    for(let i=0;i<3;i++){
      const x0=nW*(0.22+0.28*i)+Math.sin(nt*0.2+i*2)*30*DPRn;
      nctx.save();
      nctx.translate(x0,surfY(x0)+yOff);
      nctx.rotate(0.12+Math.sin(nt*0.15+i)*0.03);
      const g=nctx.createLinearGradient(0,0,0,nH*0.7);
      g.addColorStop(0,`rgba(190,225,240,${0.10+0.03*Math.sin(nt*0.4+i)})`);
      g.addColorStop(1,'rgba(190,225,240,0)');
      nctx.fillStyle=g;
      nctx.beginPath();
      nctx.moveTo(-24*DPRn,0); nctx.lineTo(24*DPRn,0);
      nctx.lineTo(120*DPRn,nH*0.7); nctx.lineTo(-60*DPRn,nH*0.7);
      nctx.closePath(); nctx.fill();
      nctx.restore();
    }

    const fall=0.0009+(rising?0.006:0);
    for(const p of nsnow){
      p.y+=p.sp+fall;
      if(p.y>1.02){ p.y=-0.02; p.x=Math.random(); }
      const px=(p.x+Math.sin(nt*0.4+p.sway)*0.006)*nW, py=p.y*nH;
      nctx.fillStyle=`rgba(191,216,228,${p.a})`;
      nctx.beginPath();
      nctx.moveTo(px,py-p.r*DPRn); nctx.lineTo(px+p.r*DPRn,py);
      nctx.lineTo(px,py+p.r*DPRn); nctx.lineTo(px-p.r*DPRn,py);
      nctx.closePath(); nctx.fill();
    }

    LAMPS.forEach((l,i)=>{
      const tgt=(hoverLamp===l)?1:0;
      l.glow+=(tgt-l.glow)*0.08;
      drawLamp(l,i,yOff);
    });
    drawChildren(yOff);
    CHILDREN.forEach(c=>{ const tgt=(hoverChild===c)?1:0; c.glow+=(tgt-c.glow)*0.1; });

    if(bright>0){
      nctx.fillStyle=`rgba(234,242,246,${bright*0.95})`;
      nctx.fillRect(0,0,nW,nH);
    }
    navRAF=requestAnimationFrame(navDraw);
  }

  function pick(cx,cy){
    hoverLamp=null; hoverChild=null;
    for(const l of LAMPS){
      if(Math.hypot(cx-l.lx,cy-l.ly)<34*U){ hoverLamp=l; break; }
    }
    if(threadsExt>0.92){
      for(const c of CHILDREN){
        if(c.cx!=null && Math.hypot(cx-c.cx,cy-c.cy)<24*U*threadsExt){ hoverChild=c; hoverLamp=null; break; }
      }
    }
    const hot=!!(hoverLamp||hoverChild);
    navCanvas.style.cursor=hot?'pointer':'default';
    if(window.Grammar) Grammar.mode(hot?'live':'idle');
  }
  let hadHover=false;
  function navHandleMove(e){
    nmx=e.clientX*DPRn; nmy=e.clientY*DPRn; pick(nmx,nmy);
    if((hoverLamp||hoverChild)&&!hadHover){ hadHover=true; }
    if(!hoverLamp&&!hoverChild) hadHover=false;
  }
  function navHandleLeave(){ hoverLamp=null; hoverChild=null; }
  function navHandleClick(){
    if(rising||sinkingTo) return;
    if(hoverChild){
      if(ssLocked(hoverChild.storyKey)){ ssComingSoon(hoverChild.text); return; }
      navSetDiscovered('threads');
      sinkingTo={t0:nt,storyKey:hoverChild.storyKey};
      return;
    }
    if(!hoverLamp) return;
    if(hoverLamp.threads){ threadsOpen=!threadsOpen; return; }
    if(ssLocked(hoverLamp.key)){ ssComingSoon(hoverLamp.text); return; }
    navSetDiscovered(hoverLamp.key);
    rising={t0:nt,lamp:hoverLamp};
  }
  function navHandleTouch(e){ if(e.touches[0]){ navHandleMove(e.touches[0]); e.preventDefault(); } }
  function navHandleTouchTap(e){ if(e.touches[0]){ navHandleMove(e.touches[0]); } }
  function navHandleTouchEnd(){ navHandleClick(); }
  function navHandleA11yClick(e){
    e.preventDefault();
    const key=e.currentTarget.dataset.key;
    const l=LAMPS.find(x=>x.key===key);
    if(!l) return;
    if(l.threads){ threadsOpen=!threadsOpen; hoverLamp=l; return; }
    hoverLamp=l; hoverChild=null;
    navHandleClick();
  }
  function navHandleFocus(e){
    const key=e.target.dataset.key;
    const l=LAMPS.find(x=>x.key===key);
    if(l){ hoverLamp=l; if(l.threads) threadsOpen=true; }
  }

  window.initNav=function(){
    nresize(); if(!window.initNav._resizeBound){ window.initNav._resizeBound=true; addEventListener('resize',nresize); }
    if(!nsnow.length) for(let i=0;i<110;i++){ const p=nseed(); nsnow.push(p); }
    navRunning=true; nt=0; rising=null; sinkingTo=null; threadsOpen=false; threadsExt=0;
    surfRings=[]; nextRingT=4; farBoatX=-0.4; hoverLamp=null; hoverChild=null;
    LAMPS.forEach(l=>{ l.glow=0; });
    CHILDREN.forEach(c=>{ c.glow=0; });
    navCanvas.addEventListener('mousemove',navHandleMove);
    navCanvas.addEventListener('mouseleave',navHandleLeave);
    navCanvas.addEventListener('click',navHandleClick);
    navCanvas.addEventListener('touchmove',navHandleTouch,{passive:false});
    navCanvas.addEventListener('touchend',navHandleTouchEnd);
    navCanvas.addEventListener('touchstart',navHandleTouchTap,{passive:false});
    document.querySelectorAll('.nav-a11y-link').forEach(a=>{
      a.addEventListener('focus',navHandleFocus);
      a.addEventListener('click',navHandleA11yClick);
    });
    navDraw();
  };

  window.stopNav=function(){
    navRunning=false;
    if(navRAF){ cancelAnimationFrame(navRAF); navRAF=null; }
    navCanvas.removeEventListener('mousemove',navHandleMove);
    navCanvas.removeEventListener('mouseleave',navHandleLeave);
    navCanvas.removeEventListener('click',navHandleClick);
    navCanvas.removeEventListener('touchmove',navHandleTouch);
    navCanvas.removeEventListener('touchend',navHandleTouchEnd);
    navCanvas.removeEventListener('touchstart',navHandleTouchTap);
    document.querySelectorAll('.nav-a11y-link').forEach(a=>{
      a.removeEventListener('focus',navHandleFocus);
      a.removeEventListener('click',navHandleA11yClick);
    });
  };
})();

function ssMicBadge(msg){
  if (location.search.indexOf('debug') < 0) return;
  let el = document.getElementById('ss-mic-badge');
  if (!el){
    el = document.createElement('div');
    el.id = 'ss-mic-badge';
    el.style.cssText = 'position:fixed;left:12px;top:12px;z-index:2147483647;'
      + 'padding:8px 14px;border-radius:4px;background:rgba(8,12,20,.9);'
      + 'color:#EAF2F6;font:13px/1.4 system-ui;letter-spacing:.04em;'
      + 'pointer-events:none;max-width:60vw';
    document.body.appendChild(el);
  }
  el.textContent = msg;
}

function requestPermissionsOnce(){
  ssMicBadge('checking...');
  if (window.__ssPermAsked) return;
  window.__ssPermAsked = true;

  window.SS_MIC_ENABLED = false;
  window.SS_CAMERA_ENABLED = null;

  if (location.search.indexOf('nocam') >= 0) window.SS_CAMERA_REFUSED = true;

  if (!window.isSecureContext){
    window.SS_MIC = 'not a secure context: ' + location.protocol + '//' + location.host;
    ssMicBadge(window.SS_MIC);
    return;
  }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    window.SS_MIC_ERROR = 'unsupported';
    window.SS_MIC = 'getUserMedia unavailable';
    ssMicBadge(window.SS_MIC);
    return;
  }

  window.SS_MIC_STATE = 'unknown';
  const readState = ()=>{
    if (!navigator.permissions || !navigator.permissions.query) return Promise.resolve('unknown');
    try{
      return navigator.permissions.query({ name:'microphone' })
        .then(p => { window.SS_MIC_STATE = p.state; return p.state; })
        .catch(()=> 'unknown');
    }catch(e){ return Promise.resolve('unknown'); }
  };

  window.SS_MIC = 'requesting';
  ssMicBadge('asking for the microphone...');
  const t0 = Date.now();
  navigator.mediaDevices.getUserMedia({ audio:true })
    .then(stream => {
      window.somewhereStillMicStream = stream;
      window.SS_MIC_ENABLED = true;
      window.SS_MIC_ERROR = null;
      window.SS_MIC = 'granted';
      ssMicBadge('microphone: on');
      try { sessionStorage.setItem('ss_mic_ok', '1'); } catch(e){}
    })
    .catch(e => {
      const name = (e && e.name) || 'unknown';
      const fast = (Date.now() - t0) < 400;
      window.SS_MIC_ERROR = name;
      readState().then(state => {
        let why;
        if (name === 'NotFoundError') why = 'no microphone found on this machine';
        else if (state === 'denied') why = 'this site is blocked in the browser';
        else if (fast) why = 'the browser itself has no mic access (check macOS System Settings, Privacy, Microphone)';
        else why = name;
        window.SS_MIC = 'denied: ' + name + ' | permission state: ' + state + ' | ' + why;
        ssMicBadge('mic blocked: ' + why);
      });
    });
}

(function(){
  const H = location.hash;
  const at = /^#at=(megan|thomas|margaret)$/.exec(H);
  if(at){
    const DEPTH = { megan:118, thomas:232, margaret:340 };
    const g0=document.getElementById('gate0');
    if(g0){ g0.classList.add('dissolving'); g0.classList.add('hide'); }
    if(window.__stopGateCanvas) window.__stopGateCanvas();
    hasEntered=true;
    descended=true;
    document.documentElement.classList.add('ss-descended');
    const frac = Math.min(0.97, DEPTH[at[1]] / TRAVEL);
    const land=()=>{
      const max=document.body.scrollHeight-innerHeight;
      window.scrollTo(0, Math.max(0, max*frac));
      readScroll();
      scrollN=targetScroll;
    };
    land();
    requestAnimationFrame(land);
    const r0=document.getElementById('ropelamp');
    if(r0) r0.classList.add('on');
    setTimeout(land, 220);
    try{ history.replaceState(null,'','index.html'); }catch(e){}
    return;
  }
  if(H !== '#/sea' && H !== '#nav') return;
  const g0=document.getElementById('gate0');
  if(g0){ g0.classList.add('dissolving'); g0.classList.add('hide'); }
  if(window.__stopGateCanvas) window.__stopGateCanvas();
  hasEntered=true;
  __floorReached=true;
  const jump=()=>{
    window.scrollTo(0, Math.max(0, document.body.scrollHeight - innerHeight));
    readScroll();
    scrollN=targetScroll;
  };
  jump();
  requestAnimationFrame(jump);
  const r=document.getElementById('ropelamp');
  if(r) r.classList.add('on');
  setTimeout(()=>{ jump(); openNav(true); }, 200);
})();

(function(){
  if (!window.Veil) return;
  Veil.silentResume();
  const go = ()=> setTimeout(()=>Veil.lift(), 40);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else go();
})();
