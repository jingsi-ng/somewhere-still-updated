function hushLanding(){
  try{
    const A = window.Ambience;
    if (A){
      if (!A._ssTo) A._ssTo = A.to;
      if (A.silence) A.silence(600);
      A.to = function(){};
    }
    const S = window.SFX;
    if (S && S !== SFX && S.cutAll) S.cutAll(400);
  }catch(e){}
}

function restoreLanding(){
  try{
    const A = window.Ambience;
    if (A && A._ssTo){ A.to = A._ssTo; A._ssTo = null; }
  }catch(e){}
}

function margaretGatePaint(api){
  api.exitMs = 560;
  api.fadeMs = 1300;
  api.loadSay = 'She is still remembering.';
  var wipes = [];
  var cracks = [];
  var lastX = null, lastY = null;
  return function(a){
    var g = a.ctx, W = a.w(), H = a.h(), t = a.t(), d = a.dpr;
    g.setTransform(d, 0, 0, d, 0, 0);
    g.clearRect(0, 0, W, H);

    var cx = W / 2, cy = H / 2;
    var mw = Math.min(W * 0.42, 460), mh = Math.min(H * 0.66, 620);

    var glow = g.createRadialGradient(cx, cy, 0, cx, cy, mh * 0.9);
    glow.addColorStop(0, 'rgba(178,58,46,0.42)');
    glow.addColorStop(0.5, 'rgba(120,40,34,0.14)');
    glow.addColorStop(1, 'rgba(5,7,10,0)');
    g.fillStyle = glow;
    g.fillRect(0, 0, W, H);

    g.save();
    g.beginPath();
    g.ellipse(cx, cy, mw / 2, mh / 2, 0, 0, 6.283);
    g.clip();

    var sheen = g.createLinearGradient(cx - mw / 2, cy - mh / 2, cx + mw / 2, cy + mh / 2);
    sheen.addColorStop(0, 'rgba(34,42,52,0.96)');
    sheen.addColorStop(0.45 + Math.sin(t * 0.35) * 0.08, 'rgba(58,70,84,0.92)');
    sheen.addColorStop(1, 'rgba(26,32,40,0.98)');
    g.fillStyle = sheen;
    g.fillRect(cx - mw / 2, cy - mh / 2, mw, mh);

    if (a.mouse.on && !a.leaving()){
      var mx = a.mouse.x, my = a.mouse.y;
      if (lastX != null){
        var dd = Math.hypot(mx - lastX, my - lastY);
        var steps = Math.min(14, Math.max(1, Math.floor(dd / 6)));
        for (var s = 0; s < steps; s++){
          var k = s / steps;
          wipes.push({
            x: lastX + (mx - lastX) * k,
            y: lastY + (my - lastY) * k,
            r: 26 + Math.random() * 26,
            a: 1
          });
        }
      }
      lastX = mx; lastY = my;
      if (wipes.length > 260) wipes.splice(0, wipes.length - 260);
    }

    g.globalCompositeOperation = 'destination-out';
    for (var i = 0; i < wipes.length; i++){
      var p = wipes[i];
      p.a -= 0.0042;
      if (p.a <= 0) continue;
      var wg = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      wg.addColorStop(0, 'rgba(0,0,0,' + (p.a * 0.5).toFixed(3) + ')');
      wg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = wg;
      g.beginPath();
      g.arc(p.x, p.y, p.r, 0, 6.283);
      g.fill();
    }
    g.globalCompositeOperation = 'source-over';

    if (a.leaving()){
      if (!cracks.length){
        var px = a.mouse.on ? a.mouse.x : cx, py = a.mouse.on ? a.mouse.y : cy;
        for (var c = 0; c < 11; c++){
          cracks.push({
            x: px, y: py,
            ang: (c / 11) * 6.283 + Math.random() * 0.5,
            len: 0,
            max: mh * (0.5 + Math.random() * 0.7),
            wob: 0.5 + Math.random()
          });
        }
      }
      g.strokeStyle = 'rgba(178,58,46,0.85)';
      g.lineWidth = 1.4;
      for (var q = 0; q < cracks.length; q++){
        var k2 = cracks[q];
        k2.len += (k2.max - k2.len) * 0.09 + 5;
        g.beginPath();
        g.moveTo(k2.x, k2.y);
        var seg = 9, ox = k2.x, oy = k2.y;
        for (var j = 1; j <= seg; j++){
          var f = (j / seg) * k2.len;
          var ang2 = k2.ang + Math.sin(j * k2.wob) * 0.16;
          ox = k2.x + Math.cos(ang2) * f;
          oy = k2.y + Math.sin(ang2) * f;
          g.lineTo(ox, oy);
        }
        g.stroke();
      }
      var spill = Math.min(1, a.since * 2.2);
      if (spill > 0){
        var sx = cracks[0].x, sy = cracks[0].y;
        var sr = mh * 0.25 + spill * mh * 1.4;
        var sg = g.createRadialGradient(sx, sy, 0, sx, sy, sr);
        sg.addColorStop(0, 'rgba(178,58,46,' + (spill * 0.72).toFixed(3) + ')');
        sg.addColorStop(0.5, 'rgba(150,40,32,' + (spill * 0.34).toFixed(3) + ')');
        sg.addColorStop(1, 'rgba(120,30,24,0)');
        g.fillStyle = sg;
        g.beginPath();
        g.arc(sx, sy, sr, 0, 6.283);
        g.fill();
      }
    }
    g.restore();

    if (!a.leaving()){
      var pulse = 0.5 + Math.sin(t * 1.5) * 0.5;
      g.strokeStyle = 'rgba(178,58,46,' + (0.14 + pulse * 0.2).toFixed(3) + ')';
      g.lineWidth = 1;
      g.beginPath();
      g.ellipse(cx, cy, mw / 2 + 6 + pulse * 4, mh / 2 + 6 + pulse * 4, 0, 0, 6.283);
      g.stroke();
    }

    var rd = a.ready == null ? 1 : a.ready;
    if (rd < 1){
      var ly = H * 0.82, lw = Math.min(W * 0.36, 420), lx = W / 2 - lw / 2;
      g.strokeStyle = 'rgba(178,58,46,0.16)';
      g.lineWidth = 1;
      g.beginPath(); g.moveTo(lx, ly); g.lineTo(lx + lw, ly); g.stroke();
      g.strokeStyle = 'rgba(178,58,46,0.82)';
      g.lineWidth = 1.6;
      g.beginPath();
      for (var q = 0; q <= 48; q++){
        var u = q / 48;
        if (u > rd) break;
        var xx = lx + lw * u;
        var yy = ly + Math.sin(u * 26 + t * 2.2) * 2.4 * (1 - u * 0.4);
        if (q === 0) g.moveTo(xx, yy); else g.lineTo(xx, yy);
      }
      g.stroke();
    }
  };
}

window.SS_PRELOAD = (function(){
  var A = 'assets/audio/', I = 'assets/img/';
  var au = ['start Margaret - 1.1.m4a','Start voice -2.2.m4a'];
  var im = ['Margaret_w1_corridor_bg','Margaret_w1__corridor_mg','Margaret_w1__corridor_fg',
            'Margaret_w1_scene2_mirror1','Margaret_w1_scene2_mirror2','Margaret_w1_scene2_mirror3',
            'Margaret_mirrorN_whole_01','Margaret_mirrorN_whole_02','Margaret_mirrorN_whole_03',
            'Margaret_mirrorN_whole_04','Margaret_mirrorN_whole_05'];
  return au.map(function(f){ return A + encodeURIComponent(f); })
    .concat(im.map(function(f){ return I + f + '.webp'; }));
})();

window.__margaretEnter = function(){
  var run = function(){ __margaretRun(); };
  if (window.Veil && Veil.gate) Veil.gate(null, margaretGatePaint, run);
  else run();
};

function __margaretRun(){
  hushLanding();
  ['landing-overlay','c','caustics','flashlayer','g0canvas'].forEach(id=>{
    const el = document.getElementById(id); if (el) el.style.display = 'none';
  });
  if (window.Ambience) Ambience.to('house_base', { fadeOut: 2400, fadeIn: 3200 });
  SFX.stop('floor_arrival');
  SFX.stop('descent_amb');
  const R = margaretRecap();
  if (R){ startMargaretRecap(R); return; }
  if(typeof openLikeAFlower === 'function') openLikeAFlower();
};

function margaretRecap(){
  const h = (location.hash||'').replace(/^#\/?/,'');
  if (h === 'ending') return { ending:true, prior:5 };
  const m = h.match(/^w([1-5])$/);
  if (m) return { wave:parseInt(m[1],10), prior:parseInt(m[1],10)-1 };
  return null;
}

function startMargaretRecap(R){
  for (let i = 1; i <= R.prior; i++) shatteredWaves.add(i);
  window.shatterOrder = window.shatterOrder || [];
  for (let i = 1; i <= R.prior; i++){
    if (window.shatterOrder.indexOf(i) === -1) window.shatterOrder.push(i);
    const mEl = mirrors.find(m => m.dataset.wave === String(i));
    if (mEl){
      mEl.style.setProperty('--seep', (1 - (i - 1) * 0.1125).toFixed(3));
      setMirrorArt(mEl, 'shattered');
      mEl.classList.add('shattered-warm');
    }
  }
  attachResidues();
  applyLux();
  if (R.ending){
    if (typeof startEndingSequence === 'function') startEndingSequence();
    return;
  }
  const el = document.getElementById('m' + R.wave);
  enterWave(el, R.wave);
}

const IMG = {
  corridor_bg:      'Margaret_w1_corridor_bg.png',
  corridor_mg:      'Margaret_w1__corridor_mg.png',
  corridor_fg:      'Margaret_w1__corridor_fg.png',

  frag_shoe:             'Margaret_w1_scene2_shoe.png',
  frag_ring:             'Margaret_w1_Scene2_ring.png',
  frag_mirror:      'Margaret_w1__fragment_mirror.png',
  frag_doll:        'Margaret_w1__fragment_doll.png',
  frag_skidmark:    'Margaret_w1_fragment_skidmark.png',
  frag_ring2:            'Margaret_w1_Scene2_ring.png',
  frag_shoe2:            'Margaret_w1_scene2_shoe.png',

  flicker_hospital: 'Margaret_w1__flicker_hospital.png',
  flicker_academy:  'Margaret_w1_flicker_danceacademy.png',
  flicker_kitchen:  'Margaret_w1_flicker_kitchen.png',

  mirror_young:     'Margaret_w1_scene2_mirror1.png',
  mirror_daughter:  'Margaret_w1_scene2_mirror2.png',
  mirror_dancing:   'Margaret_w1_scene2_mirror3.png',
  obj_shoe:         'Margaret_w1_scene2_shoe.png',
  obj_ring:         'Margaret_w1_Scene2_ring.png',
  obj_hand:         'Margaret_w1_Scene2_hand.png',
  obj_trophy:       'Margaret_w1_Scene2_trophy.png',

  bar_ballet:       'Margaret_w1_scene3_balletbarre_2.png',
  bar_hospital:     'Margaret_w1_scene3_hospitalhandrail.png',
  hospital_bed:     'margaret_hospital_bed_01.png',
  peter_catch:      'Margaret_w1_scene3_peter_catch.png',

  face_peter:       'Margaret_w1_scene4_peter_2.png',
  face_mother:      'Margaret_w1_scene4_mother_2.png',

  kitchen_reveal:   'Margaret_w1_scene5_kitchenreveal.png',
  crying:           'Margaret_w1_scene6_crying.png',
  shoe_gift:        'Margaret_w1_scene7_shoegift.png',
  dancing_stage:    'Margaret_w1_scene8_dancingonstage.png',
  petal:            'Margaret_w1_scene9_petal.png',

  mirror1_whole:     'Margaret_mirrorN_whole_01.png',
  mirror1_shattered: 'Margaret_mirrorN__shattered_01.png',
  mirror2_whole:     'Margaret_mirrorN_whole_02.png',
  mirror2_shattered: 'Margaret_mirrorN__shattered_02.png',
  mirror3_whole:     'Margaret_mirrorN_whole_03.png',
  mirror3_shattered: 'Margaret_mirrorN__shattered_03.png',
  mirror4_whole:     'Margaret_mirrorN_whole_04.png',
  mirror4_shattered: 'Margaret_mirrorN__shattered_04.png',
  mirror5_whole:     'Margaret_mirrorN_whole_05.png',
  mirror5_shattered: 'Margaret_mirrorN__shattered_05.png',

  w2_peter_clear:       'Margaret_w1_scene4_peter_2.png',
  w2_peter_blur:        'Margaret_w2_peter_blur_01.png',
  w2_ring:              'Margaret_w1_Scene2_ring.png',
  w2_ring_whole:         'Margaret_w1_Scene2_ring.png',
  w2_frag_phonecall:    'Margaret_w2_frag_phonecall_01.png',
  w2_frag_ballet:        'Margaret_w2_frag_ballet_01.png',
  w2_frag_doll_girl:     'Margaret_w2_frag_doll_girl_01.png',
  w2_frag_hospitalbed:   'Margaret_w2_frag_hospitalbed_01.png',
  w2_frag_reddoll:       'Margaret_w4_reddoll_gift_01.png',
  w2_doorpush:          'Margaret_w2_scene1_doorpush_01.png',
  wedding_bg:          'margaret_wedding_bg_01.png',
  map_tree:            'Margaret_map_mid_01.png',
  wedding_margaret:    'margaret_wedding_margaret_01.png',
  wedding_peter:       'margaret_wedding_peter_01.png',

  w3_funeral:           'Margaret_w3_funeral_01_2.png',
  w3_dance:             'Margaret_w3_whitedress_dance_01_2.png',
  w3_scar:              'Margaret_w3_scar_closeup_01_2.png',
  w3_mortuary:          'Margaret_w3_mortuary_01.png',
  w3_xray:              'Margaret_w3_xray_01.png',
  w3_corridor_youngself: 'Margaret_w3_corridor_youngself_01.png',
  w3_bandaged:          'Margaret_w3_bandaged_daughter_01.png',
  w3_crib:              'Margaret_w3_infant_crib_01.png',

  w4_oversized_shoes:   'Margaret_w4_oversized_shoes_01.png',
  w4_teaching:          'Margaret_w4_teaching_01.png',
  w4_falling_echo:      'Margaret_w4_falling_echo_01.png',
  w4_reddoll:           'Margaret_w4_reddoll_gift_01.png',
  w4_podium:            'Margaret_w4_podium_ceremony_01.png',

  w5_letter:            'Margaret_w5_letter.png',
  w5_deathcert:         'Margaret_w5_deathcert.png',
  w5_airport_dress:     'Margaret_w5_airport_dress.png',
  w5_plane:             'Margaret_w5_plane_takeoff.png',
  w5_crash:             'margaret_w5_crash_01.png',
  w5_waving:            'Margaret_w5_daughter_waving.png',
  w5_peter_walking:     'Margaret_w5_peter_walking.png',
  w5_videocall:         'Margaret_w5_videocall.png',

};

const IMG_PATHS = ['assets/img/', 'assets/margaret/', 'assets/', 'assets/images/', 'img/', 'images/', ''];
let IMG_BASE_FOUND = null;
let LIGHT_FILES = null;
window.ASSET_LOG = { img: {}, audio: {} };

const IMG_LIGHT_EXT = ['.webp', '.jpg'];
function lightNames(nm){
  if (!/\.png$/i.test(nm)) return [];
  return IMG_LIGHT_EXT.map(e => nm.replace(/\.png$/i, e));
}

let IMG_DISCOVERING = false, IMG_DISCOVERED = false;
const IMG_WAITING = [];

function resolveImage(file, onOk, onFail){
  if (!IMG_DISCOVERED){
    if (IMG_DISCOVERING){ IMG_WAITING.push([file, onOk, onFail]); return; }
    IMG_DISCOVERING = true;
    const finish = ()=>{
      IMG_DISCOVERED = true; IMG_DISCOVERING = false;
      while (IMG_WAITING.length){
        const q = IMG_WAITING.shift();
        resolveImageDirect(q[0], q[1], q[2]);
      }
    };
    resolveImageDirect(file, src => { finish(); onOk(src); }, () => { finish(); onFail && onFail(); });
    return;
  }
  resolveImageDirect(file, onOk, onFail);
}

function resolveImageDirect(file, onOk, onFail){
  const names = Array.isArray(file) ? file : [file];
  const bases = IMG_BASE_FOUND
    ? [IMG_BASE_FOUND, ...IMG_PATHS.filter(b => b !== IMG_BASE_FOUND)]
    : IMG_PATHS;
  const cands = [];
  if (LIGHT_FILES !== false){
    const wBases = IMG_BASE_FOUND ? [IMG_BASE_FOUND] : bases;
    names.forEach(nm => {
      lightNames(nm).forEach(ln => { wBases.forEach(b => { cands.push([b, ln]); }); });
    });
  }
  const lightCount = cands.length;
  names.forEach(nm => { bases.forEach(b => { cands.push([b, nm]); }); });
  let i = 0;
  (function next(){
    if (i >= cands.length){ window.ASSET_LOG.img[names[0]] = 'FAIL'; onFail && onFail(); return; }
    const idx = i;
    const [b, nm] = cands[i++];
    const src = b + nm;
    const probe = new Image();
    probe.onload = () => {
      if (!IMG_BASE_FOUND) IMG_BASE_FOUND = b;
      if (/\.(webp|jpe?g)$/i.test(nm)) LIGHT_FILES = true;
      else if (lightCount && idx >= lightCount && LIGHT_FILES === null) LIGHT_FILES = false;
      window.ASSET_LOG.img[names[0]] = src;
      onOk(src);
    };
    probe.onerror = next;
    probe.src = src;
  })();
}

function setAsset(el, key){
  if (!el) return;
  el.dataset.asset = key;
  el.classList.remove('has-asset','art-cover','asset-missing','asset-nokey');
  el.style.backgroundImage = '';
  applyAssets(el.parentElement || document);
}

function applyAssets(root = document){
  root.querySelectorAll('[data-asset]:not(.has-asset)').forEach(el => {
    const file = IMG[el.dataset.asset];
    if (!file) { el.classList.add('asset-nokey'); return; }
    resolveImage(file, src => {
      el.style.backgroundImage    = `url("${src}")`;
      el.style.backgroundSize     = el.classList.contains('fit-contain') ? 'contain' : 'cover';
      el.style.backgroundPosition = 'center';
      el.style.backgroundRepeat   = 'no-repeat';
      el.classList.add('has-asset');
      if (!el.classList.contains('fit-contain')) el.classList.add('art-cover');
    }, () => el.classList.add('asset-missing'));
  });
}

function loadArt(key){
  const im = new Image();
  if (IMG[key]) resolveImage(IMG[key], src => { im.src = src; });
  return im;
}
applyAssets();
window.applyAssets = applyAssets;

const PRELOAD_CONCURRENCY = 4;
const Preload = {
  queue: [], seen: new Set(), running: 0,
  total: 0, done: 0, failed: 0,
  onProgress: null, started: false,

  waveOf(f){
    const n = Array.isArray(f) ? f[0] : f;
    if (/mirrorN/i.test(n)) return 0;
    const m = /_w(\d)/i.exec(n);
    return m ? Number(m[1]) : 6;
  },

  groups(){
    const g = {};
    Object.keys(IMG).forEach(k => {
      const w = Preload.waveOf(IMG[k]);
      (g[w] = g[w] || []).push(IMG[k]);
    });
    return g;
  },

  add(files, pri){
    files.forEach(f => {
      const key = Array.isArray(f) ? f[0] : f;
      if (Preload.seen.has(key)) return;
      Preload.seen.add(key);
      Preload.queue.push({ f: f, key: key, pri: pri });
      Preload.total++;
    });
    Preload.pump();
  },

  boost(wave){
    let moved = 0;
    Preload.queue.forEach(item => {
      if (Preload.waveOf(item.f) === wave && item.pri > 2){ item.pri = 2; moved++; }
    });
    if (moved) Preload.pump();
  },

  pump(){
    while (Preload.running < PRELOAD_CONCURRENCY && Preload.queue.length){
      Preload.queue.sort((a, b) => a.pri - b.pri);
      const item = Preload.queue.shift();
      Preload.running++;
      const finish = (ok)=>{
        Preload.running--;
        Preload.done++;
        if (!ok) Preload.failed++;
        if (Preload.onProgress) Preload.onProgress(Preload.done, Preload.total, Preload.failed);
        Preload.pump();
      };
      resolveImage(item.f, ()=> finish(true), ()=> finish(false));
    }
  },

  startEntry(){
    if (Preload.started) return;
    Preload.started = true;
    const g = Preload.groups();
    Preload.add(g[0] || [], 0);
    Preload.add(g[1] || [], 1);
  },

  startRest(){
    const g = Preload.groups();
    [2,3,4,5,6].forEach((w, i) => Preload.add(g[w] || [], 5 + i));
  }
};
window.Preload = Preload;

function gateLoadingIndicator(){
  const gate = document.getElementById('gate0');
  if (!gate) return;
  const inner = gate.querySelector('.g0-inner') || gate;
  let bar = document.getElementById('g0load');
  if (!bar){
    bar = document.createElement('div');
    bar.id = 'g0load';
    bar.innerHTML = '<i></i>';
    inner.appendChild(bar);
  }
  const fill = bar.querySelector('i');
  gate.classList.add('g0-waiting');

  let released = false;
  function release(){
    if (released) return;
    released = true;
    gate.classList.remove('g0-waiting');
    gate.classList.add('g0-ready');
    setTimeout(()=>{ if (bar && bar.parentElement) bar.parentElement.removeChild(bar); }, 1400);
  }

  Preload.startEntry();
  const critical = Preload.total;
  if (!critical){ release(); return; }
  Preload.onProgress = function(done){
    const p = Math.min(1, done / critical);
    fill.style.transform = 'scaleX(' + p.toFixed(3) + ')';
    if (done >= critical) release();
  };
  setTimeout(release, 6000);
}

if (document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', gateLoadingIndicator);
else gateLoadingIndicator();

window.IMG = IMG;

const AUDIO_BASE = window.MARGARET_SND_BASE || 'assets/audio/';

let _AC = null;
const _BUSES = {};
function filterBus(type, freq, q){
  const id = type + freq;
  if (_BUSES[id]) return _BUSES[id];
  try{
    _AC = _AC || new (window.AudioContext || window.webkitAudioContext)();
    const f = _AC.createBiquadFilter();
    f.type = type; f.frequency.value = freq; f.Q.value = q || 0.7;
    const g = _AC.createGain(); g.gain.value = 1.0;
    f.connect(g); g.connect(_AC.destination);
    _BUSES[id] = { ctx:_AC, node:f };
  }catch(e){ _BUSES[id] = null; }
  return _BUSES[id];
}
function lowpassBus(){ return filterBus('lowpass', 420, 0.7); }

function routeThrough(el, bus){
  if (!bus || el._routed) return;
  try{
    if (bus.ctx.state === 'suspended') bus.ctx.resume();
    bus.ctx.createMediaElementSource(el).connect(bus.node);
    el._routed = true;
  }catch(e){}
}

const AUDIO = {
  entry_line1:    { file:'start Margaret - 1.1.m4a',              vol:0.95, off:0.00 },
  entry_line2:    { file:'Start voice -2.2.m4a',              vol:0.90, off:0.00 },
  entry_plunge:   { file:'margaret entry transition.mp3',          vol:0.55, off:0.00 },
  plunge_nomel:   { file:'entry plunge no melody.mp3',            vol:0.70, off:0.00 },
  plunge_melody:  { file:'entry plunge w_ melody.mp3',            vol:0.62, off:0.00, loop:true },
  plunge_rise:    { file:'entry plunge w_ melody2.mp3',           vol:0.72, off:0.00 },
  w1s2_ballet:    { file:'theme margaret or megan 1 ss.mp3',      vol:0.55, off:0.00, loop:true },
  descent_amb:    { file:'atmo 2 ss (base layer).mp3',           vol:0.35, off:0.00, loop:true },
  surface_amb:    { file:'atmo 1 ss (base layer).mp3',           vol:0.22, off:0.00, loop:true },
  floor_arrival:  { file:'oceanfloor.mp3',                       vol:0.50, off:0.10, loop:true },
  w1s1_flicker:   { file:'ambulance crying.mp3',                 vol:0.55, off:0.40, loop:true },
  w1s2_wedding:   { file:'wedding music1.mp3',                   vol:1.00, off:0.00, loop:true },

  w1s3_monitor:   { file:'vital signs beep gradual change.mp3',  vol:0.30, off:0.30, dur:17 },

  w1s5_applause:  { file:'applause for kitchen.mp3',             vol:0.42, off:0.85 },
  w1s6_crying:    { file:'margaret crying.mp3',                  vol:0.45, off:0.90 },
  w1s6_notend:    { file:'Younger Margaret_ this is not the end -1.m4a', vol:0.95, off:0.00 },
  w1s8_music:     { file:'theme margaret or megan 1 ss.mp3',     vol:0.80, off:0.00, loop:true },
  w1s9_chime:     { file:'petal wipe.mp3',                       vol:0.60, off:0.65 },
  mirror_shatter: { file:'mirror break sound.mp3',       vol:0.80, off:0.00 },
  redshoe_1:      { file:'Elin where_s the red ballet shoe1.mp3',        vol:0.95, off:0.00 },
  redshoe_2:      { file:'Elin where_s the red ballet shoe2.mp3',        vol:0.95, off:0.00 },
  redshoe_3:      { file:'Elin where_s the red ballet shoe3.mp3',        vol:0.95, off:0.00 },
  redshoe_4:      { file:'Elin where_s the red ballet shoe4.mp3',        vol:0.95, off:0.00 },
  redshoe_5:      { file:'Elin where_s the red ballet shoe5.mp3',        vol:0.95, off:0.00 },

  house_base:     { file:'margaret entering the house.mp3',           vol:0.07, off:0.00, loop:true,
                    highpass:260 },

  w2s1_alarm:     { file:'short ambulance hospital door.mp3',   vol:0.85, off:0.00, loop:true },
  w2s2_wedding:   { file:'wedding music1.mp3',                   vol:0.62, off:0.00, loop:true },
  w2s2_beep:      { file:'vital signs beep gradual change.mp3',  vol:0.35, off:0.30, loop:true },
  w2s5_boom:      { file:'the ring breaks.mp3',                 vol:0.90, off:0.00, lowpass:true },
  w2s4_ambient:   { file:'atmo 2 ss (base layer).mp3',           vol:0.10, off:0.00, loop:true, highpass:260 },

  w2s4_babygirl:  { file:'Doctor 2_ thats a baby girl - 4.m4a',          vol:0.75, off:0.00 },
  w2s4_babycry:   { file:"that's a baby girl and crying.mp3",    vol:0.62, off:3.00 },
  w2s4_phonebaby: { file:'phone ringing and baby crying.mp3',    vol:0.58, off:0.00 },
  w2f2_dollgirl:  { file:'girl with doll ambient.mp3',           vol:0.65, off:0.00, loop:true },
  w2f3_phonebaby: { file:'phone ringing and baby crying.mp3',    vol:0.70, off:0.00, loop:true },
  w2f4_icu:       { file:"that's a baby girl and crying.mp3",    vol:0.72, off:0.00 },
  w2f5_doll:      { file:'(Elin) You Did It!.mp3', vol:0.85, off:0.00 },
  w1s5_mothervoice:{ file:'Margaret’s mum_ we should try again -3.m4a',        vol:0.60, off:0.00 },
  w2s4_reddoll:   { file:'(Elin) You Did It!.mp3', vol:0.85, off:0.00 },
  w2s4_boom2:     { file:'car crash (red doll).mp3',            vol:0.95, off:0.00, lowpass:true },

  w3s1_funeral:   { file:'(Elin) Counting funeral song and falling sound.mp3', vol:0.72, off:0.00 },
  w3s2_vowloop:   { file:'Younger Margaret_ yes I do -3.m4a',    vol:0.42, off:0.00, loop:true },
  w3s2_vowpeter:  { file:'Wave 2 scene 2 yes, I do(Peter).m4a',   vol:0.38, off:0.00, loop:true },

  w3s2_hers:      { file:'Younger Margaret_ yes I do -3.m4a',      vol:0.42, off:0.00, loop:true },
  w3s2_his:       { file:'Wave 2 scene 2 yes, I do(Peter).m4a',    vol:0.38, off:0.00, loop:true },
  w3s3_boomline:  { file:'(Elin) Mama scared and loud boom 10.28.08.mp3',   vol:1.00, off:0.00 },
  pretty_now:     { file:'Mama Am I Pretty Now (Real Kid).mp3',    vol:0.92, off:0.00 },
  w3s3_mama:      { file:'Mama (Real Kid).mp3',        vol:0.80, off:0.00 },
  w1s4_mama:      { file:'(Elin) Old Margaret Mama.mp3',  vol:0.92, off:0.00 },
  w3s3_boom:      { file:'(Elin) Mama scared and loud boom 10.28.08.mp3',            vol:0.95, off:0.00, lowpass:true },
  w3s5_ballet:    { file:'theme margaret or megan 1 ss.mp3',     vol:0.30, off:0.00, loop:true },

  w4s1_phone:     { file:'phone ringing unanswered.mp3',       vol:0.42, off:0.00, loop:true },
  w4s2_teaching:  { file:'Teaching & Falling (Real Kid).mp3',     vol:0.95, off:0.00 },
  w4s2_music:     { file:'theme margaret or megan 1 ss.mp3',      vol:0.40, off:0.00, loop:true },
  w4s2_ambulance: { file:'short ambulance hospital door.mp3',   vol:0.85, off:0.00 },
  w4s3_crash:     { file:'ambulance crying.mp3',                 vol:0.35, off:0.40, lowpass:true },
  w4s4_applause:  { file:'applause for kitchen.mp3',             vol:0.60, off:0.85 },

  w5s1_vow:       { file:'wedding music1.mp3',                   vol:0.70, off:0.00, loop:true, melodyOnly:true },
  w5s1_petal:     { file:'petal wipe.mp3',                       vol:0.50, off:0.65 },
  w5s3_funeral:   { file:'funeral song (just on its own).mp3',  vol:0.66, off:0.00, loop:true },
  w5s3_airport:   { file:'scene 2 the airport.mp3',              vol:0.70, off:0.00, loop:true },
  w3s3_xrayflip:  { file:'(Elin) Mama scared and loud boom 10.28.08.mp3',  vol:0.85, off:0.00 },
  w2s2_vowlong:   { file:'pastor.m4a', vol:1.00, off:0.00 },
  w4s5_crashdoll: { file:'car crash (red doll).mp3',              vol:0.80, off:0.00 },
  w4s6_congrats:  { file:'(Elin) congratulations.mp3',    vol:0.85, off:0.00 },
  w4s6_noway:     { file:'No Way Mama (Real Kid).mp3', vol:0.85, off:0.00 },
  w4s6_vow:       { file:'pastor.m4a',                             vol:0.95, off:15.40, dur:6.60 },
  w4s2_line:      { file:'Teaching & Falling (Real Kid).mp3',      vol:0.90, off:0.00 },
  w5s3_ambient:   { file:'atmo 2 ss (base layer).mp3',           vol:0.10, off:0.00, loop:true, highpass:260 },

  end_storm:      { file:'ambulance crying.mp3',                 vol:0.75, off:0.40 },
  end_lastdance:  { file:'margaret dance scene music.mp3',       vol:0.85, off:0.00 },
  mirror_lit:     { file:'mirror lit up sound.mp3',             vol:0.50, off:0.00, dur:2.20 },
  w1s1_call:      { file:'Mama (Real Kid).mp3',                    vol:0.92, off:0.00 },
  w1s2_congrats:  { file:'(Elin) congratulations.mp3',             vol:0.92, off:0.00 },
  w1s2_youdidit:  { file:'(Elin) You Did It!.mp3',                 vol:0.95, off:0.00 },
  w1s3_yesido:    { file:'Younger Margaret_ yes I do -3.m4a',      vol:0.95, off:0.00 },
  w1s3_bestdancer:{ file:'mama i will be the best dancar right？.m4a', vol:0.95, off:0.00 },
  w1s2_notme:     { file:'Margaret sound _ that’s not me ! -2.m4a', vol:0.95, off:0.00 },
  w1s8_mc:        { file:'MC_ Congratulation Margaret -3.m4a',   vol:0.92, off:0.00 },
  w2s3_ringbreak: { file:'the ring breaks.mp3',                  vol:0.95, off:0.00 },
  w3s3_snap:      { file:'the ring breaks.mp3',                  vol:0.92, off:0.00, dur:0.30 },
  w2s4_ringon:    { file:'mirror lit up sound.mp3',              vol:0.25, off:4.60, dur:1.20 },
  w3s1_funeralbed:{ file:'funeral song (just on its own).mp3',    vol:0.55, off:0.00, loop:true },
  w5s3_song:      { file:'funeral song (just on its own).mp3',    vol:0.60, off:0.00, loop:true },
  end_thankyou:   { file:'thank_you_Margaret-1.m4a',              vol:0.95, off:0.00 },
  w5s1_letter:    { file:'Elin where_s the red ballet shoe4.mp3',  vol:0.88, off:0.00 },
  w5s5_call:      { file:'Elin where_s the red ballet shoe5.mp3',  vol:0.92, off:0.00 },
  w5s3_stage:     { file:'the stage will never be hers....m4a',    vol:0.95, off:0.00 },
  w3s4_mama:      { file:'(Elin) Mama scared and loud boom 10.28.08.mp3', vol:0.95, off:0.00 },
  w4s3_line:      { file:'Teaching & Falling (Real Kid).mp3',      vol:0.90, off:7.30 },
  w5s5_videocall: { file:'start Margaret - 1.1.m4a',            vol:0.92, off:0.00 },
  w4s6_vow:       { file:'pastor.m4a',                            vol:0.95, off:15.40, dur:6.60 },
  end_laststage:  { file:'the stage will never be hers....m4a',   vol:0.95, off:0.00 },
  w2s2_sorry:     { file:'Wave 2 scene 2 doctor line.m4a', vol:0.90, off:0.00 },
};

const EAGER = {
  entry_line1: 1, entry_line2: 1, entry_plunge: 1,
  house_amb: 1, mirror_hum: 1
};
const SFX = (function(){
  const cache = new Map();
  let unlocked = false;

  function base(key){
    const d = AUDIO[key];
    if (!d) return null;
    if (cache.has(key)) return cache.get(key);

    const a = new Audio();
    a.preload = EAGER[key] ? 'auto' : 'none';
    a.crossOrigin = 'anonymous';
    a.src = AUDIO_BASE + encodeURIComponent(d.file);

    window.SS_AUDIO = window.SS_AUDIO || {};
    const rec = window.SS_AUDIO[key] = { file: d.file, src: a.src, state: 'loading' };

    a.addEventListener('loadedmetadata', ()=>{
      rec.state = 'ready';
      rec.seconds = a.duration;
      window.ASSET_LOG.audio[d.file] = a.src;
    }, { once:true });

    a.addEventListener('error', ()=>{
      const e = a.error;
      rec.state = 'ERROR ' + (e ? e.code : '?');
      window.ASSET_LOG.audio[d.file] = 'FAIL';
    }, { once:true });

    try { a.load(); } catch(e){}
    cache.set(key, a);
    return a;
  }
  function routeLowpass(el){ routeThrough(el, lowpassBus()); }

  const live = new Set();
  function warmAll(){
    Object.keys(EAGER).filter(k => AUDIO[k]).forEach(base);
  }
  function pull(a){
    if (!a || a.dataset.pulled === '1') return a;
    a.dataset.pulled = '1';
    try{ a.preload = 'auto'; a.load(); }catch(e){}
    return a;
  }

  return {
    unlock(){
      if (unlocked) return;
      unlocked = true;
      warmAll();
    },

    play(key, override = {}){
      if (!unlocked) return null;
      const d = AUDIO[key];
      if (!d) return null;
      const b = pull(base(key));
      if (!b) return null;
      const busy = !d.loop && !b.paused && b.currentTime > 0 && !b.ended;
      const a = busy ? b.cloneNode() : b;
      if (busy){
        a.src = b.currentSrc || b.src;
        live.add(a);
        a.addEventListener('ended', ()=> live.delete(a), { once:true });
      } else if (!d.loop){
        live.add(a);
        a.addEventListener('ended', ()=> live.delete(a), { once:true });
      }
      a.volume = window.Level ? Level.scale(override.vol ?? d.vol ?? 1, d.file || key) : (override.vol ?? d.vol ?? 1);
      a.loop = !!d.loop;
      const pan = override.pan ?? d.pan ?? window.SS_WAVE_PAN;
      if (pan != null && window.Pan){
        const src = String(d.file || '');
        const isVo = d.vo === true || /voice|line|\bvo\b|narrat|doctor|peter|daughter|mother/i.test(src);
        Pan.set(a, pan, isVo ? 'vo' : d.loop ? 'amb' : 'sfx');
      }
      const off = override.off ?? d.off ?? 0;
      try{ a.currentTime = off; }catch(e){}
      const dur = override.dur ?? d.dur;
      if (dur){
        const stopAt = off + dur;
        const watch = setInterval(()=>{
          if (a.paused){ clearInterval(watch); return; }
          if (a.currentTime >= stopAt){ clearInterval(watch); a.pause(); }
        }, 30);
      }
      if (d.lowpass)  routeLowpass(a);
      if (d.highpass) routeThrough(a, filterBus('highpass', d.highpass, 0.6));
      a.play().catch(()=>{});
      return a;
    },

    prime(key){
      if (!AUDIO[key]) return null;
      return pull(base(key));
    },

    src(key){
      const a = cache.get(key);
      return (a && a.src) ? a.src : null;
    },

    warm(key){
      return pull(base(key));
    },

    stop(key){
      const a = cache.get(key);
      if (a){ a.pause(); try{ a.currentTime = AUDIO[key].off || 0; }catch(e){} }
      const src = a && a.src;
      if (src) live.forEach(c => { if (c.src === src){ try{ c.pause(); }catch(e){} live.delete(c); } });
    },

    cutAll(){
      live.forEach(c => { try{ c.pause(); c.removeAttribute('src'); c.load(); }catch(e){} });
      live.clear();
      cache.forEach((a, k) => { try{ a.pause(); a.currentTime = AUDIO[k].off || 0; }catch(e){} });
    },

    liveCount(){ return live.size; },

    isPlaying(key){
      const a = cache.get(key);
      return !!(a && !a.paused && !a.ended);
    },

    fade(key, to = 0, ms = 800){
      const a = cache.get(key);
      if (!a) return;
      const from = a.volume, steps = ms / 50;
      let i = 0;
      const t = setInterval(()=>{
        i++;
        a.volume = Math.max(0, Math.min(1, from + (to - from) * (i / steps)));
        if (i >= steps){ clearInterval(t); if (to === 0) a.pause(); }
      }, 50);
    }
  };
})();
window.SFX = SFX;

window.addEventListener('pointerdown', ()=>{ SFX.unlock(); }, { once:true });

window.addEventListener('pointerdown', ()=>{
  setTimeout(()=>{
    const log = (window.ASSET_LOG && window.ASSET_LOG.audio) || {};
    const files = Object.keys(AUDIO).map(k => AUDIO[k].file);
    const uniq = [...new Set(files)];
    return;
  }, 5000);
}, { once:true });

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', assertStylesLoaded, { once:true });
else assertStylesLoaded();
window.addEventListener('pointerdown', function primeOnce(){
  window.removeEventListener('pointerdown', primeOnce);
  if (typeof primeMicStream === 'function') primeMicStream();
}, { once:true });

function audioURL(file){
  return AUDIO_BASE + encodeURIComponent(file);
}

const MargaretAmbience = (function(){
  let el = null, curKey = null, fadeTimer = null, breatheTimer = null;

  function clearTimers(){
    if (fadeTimer){ clearInterval(fadeTimer); fadeTimer = null; }
    if (breatheTimer){ clearInterval(breatheTimer); breatheTimer = null; }
  }

  function fadeTo(node, target, ms, after){
    if (!node) { if (after) after(); return; }
    const from = node.volume;
    const t0 = performance.now();
    if (fadeTimer) clearInterval(fadeTimer);
    fadeTimer = setInterval(()=>{
      const p = ms > 0 ? Math.min(1, (performance.now() - t0) / ms) : 1;
      try { node.volume = Math.max(0, Math.min(1, from + (target - from) * p)); } catch(e){}
      if (p >= 1){ clearInterval(fadeTimer); fadeTimer = null; if (after) after(); }
    }, 50);
  }

  function hardStop(){
    clearTimers();
    if (el){
      try { el.pause(); el.currentTime = 0; } catch(e){}
      el = null;
    }
  }

  return {
    key(){ return curKey; },

    to(key, opts){
      const o = opts || {};
      const fadeOut = o.fadeOut == null ? 2200 : o.fadeOut;
      const fadeIn  = o.fadeIn  == null ? 2600 : o.fadeIn;
      const delay   = o.delay   || 0;

      if (curKey === key && el && !el.paused) return;
      curKey = key;

      const old = el;
      el = null;
      clearTimers();
      if (old) fadeTo(old, 0, fadeOut, ()=>{
        try { old.pause(); old.currentTime = 0; } catch(e){}
      });

      if (!key) return;

      const d = AUDIO[key];
      if (!d) return;

      setTimeout(()=>{
        if (curKey !== key) return;
        const node = new Audio(audioURL(d.file));
        node.loop = true;
        node.preload = 'auto';
        node.volume = 0;
        if (d.off) {
          node.addEventListener('loadedmetadata', ()=>{
            try { node.currentTime = d.off; } catch(e){}
          }, { once:true });
        }
        el = node;
        window.SS_AMB = { key: key, file: d.file, state: 'starting' };

        const go = ()=>{
          if (curKey !== key || el !== node) return;
          window.SS_AMB.state = 'playing';
          fadeTo(node, d.vol, fadeIn);
          if (d.loop && d.breathe !== false){
            const t0 = performance.now();
            breatheTimer = setInterval(()=>{
              if (el !== node){ clearInterval(breatheTimer); return; }
              const w = 1 + Math.sin((performance.now() - t0) * 0.00007) * 0.22;
              try { node.volume = Math.max(0, Math.min(1, d.vol * w)); } catch(e){}
            }, 400);
          }
        };

        node.play().then(go).catch(err => {
          window.SS_AMB.state = 'blocked: ' + ((err && err.name) || '?');
          const retry = ()=>{
            if (curKey !== key || el !== node) return;
            node.play().then(go).catch(()=>{});
          };
          window.addEventListener('pointerdown', retry, { once:true });
          window.addEventListener('keydown', retry, { once:true });
        });
      }, delay);
    },

    silence(ms){ hardStop(); curKey = null; }
  };
})();
if (!window.Ambience) window.Ambience = MargaretAmbience;

let corrBg = null, corrMg = null, corrFg = null;
let corrPending = false;

function corridorParallax(clientX, clientY){
  if (!corrBg) {
    corrBg = $('corr-bg'); corrMg = $('corr-mg'); corrFg = $('corr-fg');
    if (!corrBg) return;
  }
  const mx = (clientX / window.innerWidth) * 2 - 1;
  const my = (typeof clientY === 'number' ? (clientY / window.innerHeight) * 2 - 1 : 0);

  if (corrPending) return;
  corrPending = true;
  requestAnimationFrame(()=>{
    corrPending = false;
    const L = currentLux();
    const vy = REDUCED_MOTION ? 0 : my;
    corrBg.style.transform = `translate(${(mx * parallaxCoef(0.18, L) * 140).toFixed(1)}px, ${(vy * parallaxCoef(0.18, L) * 34).toFixed(1)}px)`;
    corrMg.style.transform = `translate(${(mx * parallaxCoef(0.55, L) * 140).toFixed(1)}px, ${(vy * parallaxCoef(0.55, L) * 34).toFixed(1)}px)`;
    corrFg.style.transform = `translate(${(mx * parallaxCoef(1.00, L) * 140).toFixed(1)}px, ${(vy * parallaxCoef(1.00, L) * 34).toFixed(1)}px)`;
  });
}

function setMirrorArt(mirrorEl, state){
  const frame = mirrorEl.querySelector('.frame');
  if (!frame || !frame.dataset.mirror) return;
  const file = IMG[frame.dataset.mirror + '_' + state];
  if (!file) return;
  resolveImage(file, src => {
    frame.style.backgroundImage    = 'url("' + src + '")';
    frame.style.backgroundSize     = 'contain';
    frame.style.backgroundPosition = 'center';
    frame.style.backgroundRepeat   = 'no-repeat';
    frame.classList.add('has-asset');
  });
}

'use strict';
function $(id){ return document.getElementById(id); }

const __blurState = new WeakMap();
function setBlur(el, px, step){
  if (!el) return;
  const q = step || 0.5;
  const v = Math.round(Math.max(0, px) / q) * q;
  if (__blurState.get(el) === v) return;
  __blurState.set(el, v);
  el.style.filter = v > 0.01 ? 'blur(' + v + 'px)' : 'none';
}
function clearBlurState(el){ if (el) __blurState.delete(el); }

function rafThrottle(fn){
  let pending = false, lastEv = null;
  return function(e){
    lastEv = e;
    if (pending) return;
    pending = true;
    requestAnimationFrame(()=>{ pending = false; fn(lastEv); });
  };
}

const __filterState = new WeakMap();
function setFilter(el, str){
  if (!el) return;
  if (__filterState.get(el) === str) return;
  __filterState.set(el, str);
  el.style.filter = str;
}

const __xformState = new WeakMap();
function setTransform(el, str){
  if (!el) return;
  if (__xformState.get(el) === str) return;
  __xformState.set(el, str);
  el.style.transform = str;
}

const REDUCED_MOTION = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const RED_THREAD = '#B23A2E';
function redVitality(){ const w = window.SS_ACTIVE_WAVE; const V = [1, 1.0, 0.85, 0.60, 0.42, 0.28]; return (w >= 1 && w <= 5) ? V[w] : 1; }
if (typeof window.SS_MIC_ENABLED === 'undefined') window.SS_MIC_ENABLED = false;

let subTimer = null, subOwner = null;
function showSub(speaker, line, dur=3200, owner=null){
  const el = $('houseSubtitle');
  subOwner = owner || {};
  el.style.opacity = '0'; el.classList.remove('on');
  el.innerHTML = (speaker ? `<span class="who">${speaker}</span>` : '') + line;
  if (subTimer) clearTimeout(subTimer);
  requestAnimationFrame(()=>{ el.style.opacity = '1'; el.classList.add('on'); });
  const mine = subOwner;
  subTimer = setTimeout(()=>{
    if (subOwner !== mine) return;
    el.style.opacity = '0'; el.classList.remove('on'); subOwner = null;
  }, dur);
}
function hideSub(owner){
  if (owner && subOwner && subOwner !== owner) return;
  if (subTimer) clearTimeout(subTimer);
  const el = $('houseSubtitle'); el.style.opacity = '0'; el.classList.remove('on');
  subOwner = null;
}

const mirrorHouse = $('mirrorHouse');
const torch = $('torch');
mirrorHouse.style.opacity = '0';

const PASTOR = { askIn:15.40, askOut:39.40, shortOut:22.00, vowIn:6.85, vowOut:13.35, promptMs:8000 };

const CUE_TUNE = { w3s1_count:4.60, w4s2_dancer:7.45 };

const CUES = {
  entry_line1: [{ t:0.05, out:2.90, who:'Margaret', line:'&ldquo;Where is the red ballet shoe?&rdquo;', ms:2600 }],
  entry_line2: [{ t:0.05, who:'', line:'&ldquo;Perhaps she is looking for something else.&rdquo;', ms:5200 }],
  w2s2_vowlong: [
    { t:15.45, who:'Pastor', line:'&ldquo;Do you, Margaret, take Peter to be your lawfully wedded husband,&rdquo;', ms:6000 },
    { t:21.60, who:'Pastor', line:'&ldquo;to have and to hold, from this day forward,&rdquo;', ms:3300 },
    { t:24.90, who:'Pastor', line:'&ldquo;for better or for worse,&rdquo;', ms:2600 },
    { t:27.50, who:'Pastor', line:'&ldquo;for richer or for poorer,&rdquo;', ms:2700 },
    { t:30.20, who:'Pastor', line:'&ldquo;in sickness and in health,&rdquo;', ms:2900 },
    { t:33.40, who:'Pastor', line:'&ldquo;to love and to cherish,&rdquo;', ms:3000 },
    { t:36.60, out:PASTOR.askOut, who:'Pastor', line:'&ldquo;until death do you part?&rdquo;', ms:4400 },
    { t:PASTOR.vowIn + 0.05, out:PASTOR.vowOut, who:'Pastor', line:'&ldquo;By the power vested in me, I now pronounce you husband and wife.&rdquo;', ms:6400 }
  ],
  w5s5_videocall: [{ t:0.05, out:2.90, who:'Margaret', line:'&ldquo;Where is the red ballet shoe?&rdquo;', ms:2600 }],
  redshoe_1: [{ t:1.75, who:'Margaret', line:'&ldquo;Where is the red ballet shoe?&rdquo;', ms:2400 }],
  w1s6_notend: [
    { t:0.75, who:'Margaret', line:'&ldquo;Hey hubby,&rdquo;', ms:1300 },
    { t:2.65, who:'Margaret', line:'&ldquo;that&rsquo;s not the end.&rdquo;', ms:1700 }
  ],
  w3s2_vowloop:  [{ t:0.85, who:'Margaret', line:'&ldquo;Yes, I do.&rdquo;', ms:1800 }],
  w3s2_vowpeter: [{ t:2.25, who:'Peter',    line:'&ldquo;Yes, I do.&rdquo;', ms:1600 }],
  w1s1_call: [
    { t:0.10, who:'Daughter', line:'&ldquo;Mama&hellip;&rdquo;', ms:1200 },
    { t:1.50, who:'Daughter', line:'&ldquo;Mama.&rdquo;', ms:1500 }
  ],
  w1s2_congrats:  [{ t:0.35, who:'Announcer', line:'&ldquo;Congratulations.&rdquo;', ms:1700 }],
  w1s2_youdidit:  [{ t:0.20, who:'Mama', line:'&ldquo;Wow! You did it!&rdquo;', ms:2500 }],
  w1s3_yesido:    [{ t:0.85, who:'Margaret', line:'&ldquo;Yes, I do.&rdquo;', ms:1800 }],
  w1s3_bestdancer:[{ t:0.15, who:'Daughter', line:'&ldquo;Mama, I will be a good dancer, right?&rdquo;', ms:3400 }],
  w1s2_notme:  [{ t:1.00, who:'Margaret', line:'&ldquo;That&rsquo;s not me!&rdquo;', ms:1600 }],
  w1s5_mothervoice: [
    { t:0.70, who:'Mama', line:'&ldquo;It&rsquo;s ok honey,&rdquo;', ms:1200 },
    { t:1.90, who:'Mama', line:'&ldquo;we should try it again.&rdquo;', ms:1500 }
  ],
  w1s8_mc: [
    { t:0.55, who:'Announcer', line:'&ldquo;The Best Ballet Artist&rdquo;', ms:2300 },
    { t:3.20, who:'Announcer', line:'&ldquo;Congratulation Margaret Reilly&rdquo;', ms:2400 }
  ],
  w2s2_sorry: [
    { t:1.25, who:'Doctor', line:'&ldquo;I&rsquo;m very sorry,&rdquo;', ms:1200 },
    { t:2.55, who:'Doctor', line:'&ldquo;we tried everything.&rdquo;', ms:1600 }
  ],
  w2s4_babygirl: [{ t:0.95, who:'Margaret', line:'&ldquo;That&rsquo;s a baby girl.&rdquo;', ms:1500 }],
  end_thankyou: [{ t:1.25, who:'Margaret', line:'&ldquo;Thank you.&rdquo;', ms:1400 }],
  end_laststage: [
    { t:0.45, who:'', line:'&ldquo;The stage will never be hers again.&rdquo;', ms:2500 },
    { t:3.65, who:'', line:'&ldquo;Help her to dance one last time.&rdquo;', ms:1800 }
  ],
  w3s3_boom: [
    { t:0.30, who:'Daughter', line:'&ldquo;Mama.&rdquo;', ms:1900 },
    { t:2.60, who:'Daughter', line:'&ldquo;Mama.&rdquo;', ms:1900 },
    { t:5.05, who:'Daughter', line:'&ldquo;Mama!&rdquo;', ms:1100 }
  ],
  w1s4_mama: [
    { t:0.35, who:'Margaret', line:'&ldquo;Mama&hellip;&rdquo;', ms:2400 }
  ],
  w3s2_hers: [{ t:0.85, who:'Margaret', line:'&ldquo;Yes, I do.&rdquo;', ms:1800 }],
  w3s2_his:  [{ t:2.25, who:'Peter', line:'&ldquo;Yes, I do.&rdquo;', ms:1600 }],
  w3s3_boomline: [
    { t:0.30, who:'Daughter', line:'&ldquo;Mama.&rdquo;', ms:1900 },
    { t:2.60, who:'Daughter', line:'&ldquo;Mama.&rdquo;', ms:1900 },
    { t:5.05, who:'Daughter', line:'&ldquo;Mama!&rdquo;', ms:1100 }
  ],
  pretty_now: [
    { t:1.60, who:'Daughter', line:'&ldquo;Mama, am I pretty now?&rdquo;', ms:2100 },
    { t:3.85, who:'Daughter', line:'&ldquo;Mama&hellip; mama&hellip;&rdquo;', ms:1900 },
    { t:5.80, who:'Daughter', line:'&ldquo;Mama&hellip;&rdquo;', ms:1500 }
  ],
  w3s3_mama: [
    { t:0.10, who:'Daughter', line:'&ldquo;Mama&hellip;&rdquo;', ms:1200 },
    { t:1.50, who:'Daughter', line:'&ldquo;Mama.&rdquo;', ms:1500 }
  ],
  w3s4_mama: [
    { t:0.30, who:'Daughter', line:'&ldquo;Mama.&rdquo;', ms:1900 },
    { t:2.60, who:'Daughter', line:'&ldquo;Mama.&rdquo;', ms:1900 },
    { t:5.05, who:'Daughter', line:'&ldquo;Mama!&rdquo;', ms:1100 }
  ],
  w4s3_line: [{ t:0.10, out:3.80, who:'Daughter', line:'&ldquo;Mama, I will be a good dancer, right?&rdquo;', ms:3600 }],
  w4s6_vow:  [{ t:0.05, who:'Pastor', line:'&ldquo;Do you, Margaret, take Peter to be your lawfully wedded husband&hellip;&rdquo;', ms:5200 }],
  w4s2_line: [{ t:7.45, who:'Daughter', line:'&ldquo;Mama, I will be a good dancer, right?&rdquo;', ms:3550 }],
  w4s6_noway: [{ t:0.05, who:'Daughter', line:'&ldquo;No way. Mama, I don&rsquo;t want to be like that.&rdquo;', ms:3300 }],
  w4s6_congrats: [{ t:0.35, who:'Announcer', line:'&ldquo;Congratulation Maria.&rdquo;', ms:1700 }],
  w2f5_doll:    [{ t:0.20, who:'Margaret', line:'&ldquo;Wow! You did it!&rdquo;', ms:2500 }],
  w2s4_reddoll: [{ t:0.20, who:'Margaret', line:'&ldquo;Wow! You did it!&rdquo;', ms:2500 }],
  w3s1_funeral: [{ t:CUE_TUNE.w3s1_count, who:'Margaret', line:'&ldquo;One, two, three, four&hellip; seven, eight.&rdquo;', ms:3600 }],
  w4s2_teaching: [{ t:CUE_TUNE.w4s2_dancer, who:'Daughter', line:'&ldquo;Mama, I will be a good dancer, right?&rdquo;', ms:3550 }]
};
CUES.w3s3_xrayflip = CUES.w3s3_boom;
CUES.redshoe_2 = CUES.redshoe_1; CUES.redshoe_3 = CUES.redshoe_1;
CUES.redshoe_4 = CUES.redshoe_1; CUES.redshoe_5 = CUES.redshoe_1;

function bindCues(a, key, primeNow){
  const raw = CUES[key];
  if (!a || !raw) return a;
  const off = (AUDIO[key] && AUDIO[key].off) || 0;
  const cues = raw.slice().sort((x, y) => x.t - y.t);
  if (primeNow && cues.length){
    const f = cues[0];
    const next = cues[1];
    const span = f.out != null ? f.out - f.t : (next ? next.t - f.t : f.ms / 1000);
    f._live = a;
    showSub(f.who, f.line, Math.max(1200, span * 1000), a);
  }
  const on = ()=>{
    const t = a.currentTime - off;
    let shown = -1;
    for (let k = 0; k < cues.length; k++){ if (t >= cues[k].t) shown = k; else break; }
    if (shown < 0) return;
    const c = cues[shown];
    const next = cues[shown + 1];
    const until = c.out != null ? c.out
      : (next ? next.t : (isFinite(a.duration) && a.duration > 0 ? a.duration : c.t + c.ms / 1000));
    if (t >= until){
      if (!next){ hideSub(a); }
      return;
    }
    if (c._live !== a){ cues.forEach(q => { if (q !== c) q._live = null; }); c._live = a; showSub(c.who, c.line, Math.max(1200, (until - c.t) * 1000), a); }
  };
  const clear = ()=>{ cues.forEach(c => { c._live = null; }); hideSub(a); };
  a.addEventListener('timeupdate', on);
  a.addEventListener('ended', clear);
  a.addEventListener('pause', clear);
  addCleanup(()=>{
    a.removeEventListener('timeupdate', on);
    a.removeEventListener('ended', clear);
    a.removeEventListener('pause', clear);
    cues.forEach(c => { c._live = null; });
  });
  return a;
}

function subSync(el, cues){
  if (!el || !cues || !cues.length) return null;
  let i = 0;
  const on = ()=>{
    while (i < cues.length && el.currentTime >= cues[i].t){
      const c = cues[i++];
      
    }
  };
  el.addEventListener('timeupdate', on);
  addCleanup(()=> el.removeEventListener('timeupdate', on));
  return { reset(){ i = 0; } };
}

function returnToDeepSea(){
  restoreLanding();
  const s9 = $('w1s9'); if (s9) s9.style.display = 'none';
  if (typeof disarmWaveExit === 'function') disarmWaveExit();
  window.SS_ACTIVE_WAVE = null;
  returnToHouse._held = false;
  try{ SFX.cutAll(); }catch(e){}
  runWaveCleanups();
  if (typeof hideAllWaveScenes === 'function') hideAllWaveScenes();
  mirrorHouse.style.display = 'none';
  torch.style.display = 'none';
  houseActive = false;

  ['c','caustics','flashlayer'].forEach(id=>{ const el = document.getElementById(id); if (el) el.style.display = ''; });
  entryClicked = false;
  if (endingStarted && window.Ending){ Ending.offer('margaret'); return; }
  if (typeof window.__backToSea === 'function') window.__backToSea();
}
window.returnToDeepSea = returnToDeepSea;

function mountMirrorHouse(){
  try{ SFX.cutAll(); }catch(e){}
  if (window.Ambience) Ambience.to('house_base', { fadeIn: 1400 });
  mirrorHouse.style.display = 'block';
  mirrorHouse.style.opacity = '0';
  void mirrorHouse.offsetHeight;
  requestAnimationFrame(()=>{
    mirrorHouse.style.display = 'none';
  });
}
mountMirrorHouse();

const entryBtn = $('entryBtn');
let entryClicked = false;

if (entryBtn){
  entryBtn.addEventListener('click', () => {
    if (entryClicked) return;
    entryClicked = true;
    openLikeAFlower();
  });
}

function openLikeAFlower(){
  if (entryBtn){
    entryBtn.style.transition = 'opacity .4s ease';
    entryBtn.style.opacity = '0';
    entryBtn.style.pointerEvents = 'none';
  }

  entryVoDone = false;

  const speak = (key, fallbackMs, after)=>{
    const cue = (CUES[key] && CUES[key][0]) || null;
    const holdMs = (cue && cue.ms) ? cue.ms : fallbackMs;
    let done = false;
    const finish = ()=>{
      if (done) return; done = true;
      if (voiceoverTimer2){ clearTimeout(voiceoverTimer2); voiceoverTimer2 = null; }
      if (after) after();
    };

    if (cue) showSub(cue.who, cue.line, holdMs);

    let a = null;
    try { a = SFX.play(key); } catch(e){ a = null; }

    if (!a){
      window.SS_VO = window.SS_VO || {};
      window.SS_VO[key] = 'no element';
      voiceoverTimer2 = setTimeout(finish, holdMs);
      return;
    }

    window.SS_VO = window.SS_VO || {};
    window.SS_VO[key] = 'created';

    const kick = ()=>{
      const pr = a.play();
      if (pr && pr.catch) pr.catch(err => {
        window.SS_VO[key] = 'blocked: ' + ((err && err.name) || '?');
        const retry = ()=>{ try { a.play(); } catch(e){} };
        window.addEventListener('pointerdown', retry, { once:true });
        window.addEventListener('keydown', retry, { once:true });
      });
    };

    if (a.readyState >= 2) kick();
    else {
      a.addEventListener('canplay', kick, { once:true });
      a.addEventListener('loadeddata', kick, { once:true });
      try { a.load(); } catch(e){}
    }

    a.addEventListener('playing', ()=>{ window.SS_VO[key] = 'playing'; }, { once:true });
    a.addEventListener('ended', finish, { once:true });
    a.addEventListener('error', ()=>{
      window.SS_VO[key] = 'error ' + ((a.error && a.error.code) || '?');
      finish();
    }, { once:true });

    const arm = ()=>{
      const d = a.duration;
      const ms = (d && isFinite(d) && d > 0.4) ? Math.round(d * 1000) + 600 : holdMs;
      if (voiceoverTimer2) clearTimeout(voiceoverTimer2);
      voiceoverTimer2 = setTimeout(finish, ms);
    };
    if (a.readyState >= 1) arm();
    else {
      a.addEventListener('loadedmetadata', arm, { once:true });
      voiceoverTimer2 = setTimeout(finish, holdMs + 2000);
    }
  };

  const ENTRY_BEAT = 1000;
  const beginEntry = ()=>{
    entryBloomDone = false;
    try { SFX.play('entry_plunge'); } catch(e){}
    startEntryBloom();
    speak('entry_line1', 3200, ()=>{
      setTimeout(()=>{
        entryToBlack(()=> speak('entry_line2', 5200, ()=>{ entryVoDone = true; }));
      }, ENTRY_BEAT);
    });
    entryVoFloor = setTimeout(()=>{ entryVoDone = true; }, 22000);
  };

  const ready = SFX.prime ? SFX.prime('entry_line1') : null;
  if (!ready || ready.readyState >= 2) beginEntry();
  else {
    let launched = false;
    const launch = ()=>{ if (launched) return; launched = true; beginEntry(); };
    const onReady = ()=>{ if (ready.readyState >= 2) launch(); };
    ready.addEventListener('canplaythrough', launch, { once:true });
    ready.addEventListener('loadeddata', onReady);
    ready.addEventListener('canplay', onReady);
    const poll = setInterval(()=>{
      if (launched){ clearInterval(poll); return; }
      if (ready.readyState >= 2){ clearInterval(poll); launch(); }
    }, 250);
    setTimeout(()=>{ clearInterval(poll); launch(); }, 4500);
    try { ready.load(); } catch(e){}
  }
}

function entryToBlack(then, forced){
  if (!entryBloomDone && !forced){
    let waited = 0;
    const poll = setInterval(()=>{
      waited += 120;
      if (entryBloomDone){ clearInterval(poll); entryToBlack(then); return; }
      if (waited > 4000){ clearInterval(poll); entryBloomDone = true; entryToBlack(then, true); }
    }, 120);
    return;
  }
  let veil = $('entryVeil');
  if (!veil){
    veil = document.createElement('div');
    veil.id = 'entryVeil';
    veil.setAttribute('aria-hidden','true');
    document.body.appendChild(veil);
  }
  entryBlacked = true;
  requestAnimationFrame(()=>{ veil.classList.add('on'); then(); });
}

function entryClearBlack(){
  const veil = $('entryVeil');
  entryBlacked = false;
  if (!veil) return;
  veil.classList.remove('on');
  setTimeout(()=>{ try{ veil.remove(); }catch(e){} }, 1400);
}

function startEntryBloom(){
  const tc = $('transCanvas');
  tc.style.display = 'block';
  tc.width = window.innerWidth;
  tc.height = window.innerHeight;
  const ctx = tc.getContext('2d');
  const cx = window.innerWidth/2, cy = window.innerHeight/2;
  const diag = Math.hypot(window.innerWidth, window.innerHeight);

  const spreads = Array.from({length: 5}, (_, i) => ({
    a: (i/5)*Math.PI*2 + Math.random()*0.6,
    distMul: 0.42 + Math.random()*0.5,
    sizeMul: 0.8 + Math.random()*0.6,
    delay: Math.random()*0.25
  }));

  const BLOOM_MS = 3200;
  const REVEAL_AT = 5000;
  const REVEAL_CAP = 16000;
  const t0 = performance.now();
  let handedOff = false;

  function loop(){
    const elapsed = performance.now() - t0;
    const t = Math.min(1, elapsed / BLOOM_MS);
    if (t >= 1) entryBloomDone = true;
    const over = Math.max(0, Math.min(1, (elapsed - BLOOM_MS) / 8000));
    ctx.clearRect(0,0,tc.width,tc.height);
    ctx.globalCompositeOperation = 'lighter';

    spreads.forEach(s => {
      const lt = Math.max(0, Math.min(1, (t - s.delay) / (1 - s.delay)));
      if (lt <= 0) return;
      const open = 1 - Math.pow(1 - lt, 2.2) + over * 0.16;
      const dist = diag * (0.10 + 0.26 * s.distMul * open);
      const px = cx + Math.cos(s.a) * dist;
      const py = cy + Math.sin(s.a) * dist;
      const rad = diag * 0.34 * s.sizeMul * (0.4 + open*0.6);
      const g = ctx.createRadialGradient(px, py, 0, px, py, rad);
      const al = (0.17 + open*0.24).toFixed(3);
      g.addColorStop(0, 'rgba(178,58,46,' + al + ')');
      g.addColorStop(0.55, 'rgba(150,40,32,' + (al*0.62).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(120,30,24,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(px, py, rad, 0, Math.PI*2); ctx.fill();
    });

    ctx.globalCompositeOperation = 'source-over';

    if (t > 0.45){
      const p = Math.min(1, (t - 0.45) / 0.55);
      const spread = Math.min(1, p / 0.45);
      const settle = Math.max(0, (p - 0.45) / 0.55);
      const cxp = tc.width/2, cyp = tc.height/2;
      const maxR = Math.hypot(tc.width, tc.height) * 0.5;
      const R = maxR * (0.16 + 0.46*spread);
      const peak = (0.62 * spread) * (1 - settle*settle);
      if (peak > 0.004){
        const bg = ctx.createRadialGradient(cxp, cyp, 0, cxp, cyp, R);
        bg.addColorStop(0,   'rgba(178,58,46,' + peak.toFixed(3) + ')');
        bg.addColorStop(0.5, 'rgba(150,44,36,' + (peak*0.55).toFixed(3) + ')');
        bg.addColorStop(1,   'rgba(178,58,46,0)');
        ctx.fillStyle = bg;
        ctx.fillRect(0,0,tc.width,tc.height);
      }
      if (settle > 0){
        ctx.fillStyle = 'rgba(20,16,12,' + (settle*0.9).toFixed(3) + ')';
        ctx.fillRect(0,0,tc.width,tc.height);
      }
    }

    if (!handedOff && elapsed > REVEAL_AT && (entryVoDone || elapsed > REVEAL_CAP)){
      handedOff = true;
      if (entryVoFloor) clearTimeout(entryVoFloor);
      entryClearBlack();
      revealMirrorHouse();
      tc.style.transition = 'opacity 1.5s ease';
      requestAnimationFrame(()=>{ tc.style.opacity = '0'; });
      setTimeout(()=>{
        tc.style.display = 'none'; tc.style.opacity = ''; tc.style.transition = '';
        ctx.clearRect(0,0,tc.width,tc.height);
      }, 1600);
      return;
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

let houseActive = false;
let lastInteractionTime = 0;
let voiceoverTimer1 = null, voiceoverTimer2 = null;

let entryLineHold = false;
let waveOpenHold = 5600;
let entryVoDone = false, entryVoFloor = null, entryBlacked = false, entryBloomDone = false;
let redShoeVoiceTimer = null;

function revealMirrorHouse(){
  mirrorHouse.classList.remove('scene-push'); void mirrorHouse.offsetWidth;
  mirrorHouse.classList.add('scene-push');
  mirrorHouse.addEventListener('animationend', ()=> mirrorHouse.classList.remove('scene-push'), { once:true });
  const landing = $('landing');
  if (landing) landing.style.display = 'none';
  mirrorHouse.style.display = 'block';

  mirrorHouse.style.transition = 'opacity 1.6s ease-out';
  requestAnimationFrame(()=>{ mirrorHouse.style.opacity = '1'; });

  torch.style.display = 'block';
  houseActive = true;
  window.SS_WAVE_PAN = 0;
  { const hm2 = $('houseMarks'); if (hm2) hm2.classList.add('on'); }
  cueClear();
  { const ec2 = $('endingCue'); if (ec2) ec2.classList.remove('on');
    const eh2 = $('endingHint'); if (eh2){ eh2.textContent=''; eh2.classList.remove('on'); } }
  lastInteractionTime = performance.now();

  applyLux();
  bindTorch();
  bindMirrors();
  bindHouseDrag();
  discoverabilityLoop();

  const marks = $('houseMarks');
  if (marks) setTimeout(()=> marks.classList.add('on'), 1400);
  setTimeout(()=>{
    if (!houseActive) return;
    houseBrief();
  }, 1000);
  setTimeout(()=>{
    if (!houseActive) return;
    if (window.houseEdgeUrge) houseEdgeUrge(true);
    setTimeout(()=>{ if (window.houseEdgeUrge) houseEdgeUrge(false); }, 6000);
  }, 1800);
}

let houseDragMoved = false;

function bindHouseDrag(){
  if (bindHouseDrag._done) return;
  bindHouseDrag._done = true;
  const stage = $('houseStage');
  const min = () => Math.min(0, -(stage.offsetWidth - window.innerWidth));
  let x = min()/2, target = x, v = 0, dragging = false, px = 0, moved = 0;
  let lastT = performance.now(), pxT = lastT;
  stage.style.transform = 'translate3d(' + x + 'px,0,0)';
  stage.style.willChange = 'transform';
  const edgeL = $('houseEdgeL'), edgeR = $('houseEdgeR');
  let edgeTick = 0, edgeLOn = null, edgeROn = null;
  function setEdge(el, on, cache){
    if (!el || on === cache) return on;
    el.style.display = on ? 'block' : 'none';
    el.classList.toggle('breathe', on);
    return on;
  }
  function updateEdges(){
    const live = houseActive && mirrorHouse.style.display !== 'none';
    if (!live){
      edgeLOn = setEdge(edgeL, false, edgeLOn);
      edgeROn = setEdge(edgeR, false, edgeROn);
      return;
    }
    const lo = min();
    const canL = x < -12, canR = x > lo + 12;
    edgeLOn = setEdge(edgeL, canL, edgeLOn);
    edgeROn = setEdge(edgeR, canR, edgeROn);

    const centre = -x + window.innerWidth / 2;
    let unseenL = false, unseenR = false;
    mirrors.forEach(mm => {
      const wn = Number(mm.dataset.wave);
      if (shatteredWaves.has(wn)) return;
      const c = mm.offsetLeft + mm.offsetWidth / 2;
      if (c < centre - 80) unseenL = true;
      if (c > centre + 80) unseenR = true;
    });
    if (edgeL) edgeL.classList.toggle('urge', canL && unseenL);
    if (edgeR) edgeR.classList.toggle('urge', canR && unseenR);
  }
  const marksWrap = $('houseMarks');
  let markEls = [];
  if (marksWrap){
    marksWrap.innerHTML = '';
    markEls = mirrors.map((m, i) => {
      const b = document.createElement('i');
      b.className = 'house-mark';
      b.dataset.wave = m.dataset.wave;
      marksWrap.appendChild(b);
      return b;
    });
  }
  function updateMarks(px, lo){
    if (!markEls.length) return;
    const span = Math.abs(lo) || 1;
    const centre = -px + window.innerWidth / 2;
    let best = 0, bestD = Infinity;
    mirrors.forEach((m, i) => {
      const c = m.offsetLeft + m.offsetWidth / 2;
      const d = Math.abs(c - centre);
      if (d < bestD){ bestD = d; best = i; }
    });
    markEls.forEach((b, i) => {
      const wn = Number(b.dataset.wave);
      const spent = shatteredWaves.has(wn);
      if (b._spent !== spent){ b._spent = spent; b.classList.toggle('spent', spent); }
      const here = (i === best);
      if (b._here !== here){ b._here = here; b.classList.toggle('here', here); }
    });
  }
  window.houseMarksRefresh = ()=> updateMarks(x, min());

  window.houseEdgeUrge = function(on){
    [edgeL, edgeR].forEach(el => { if (el) el.classList.toggle('urge', !!on); });
  };
  window.houseEdgeVisible = function(){
    return { left: !!edgeLOn, right: !!edgeROn };
  };
  let lastX = null;
  function frame(now){
    requestAnimationFrame(frame);
    const t = now || performance.now();
    const dt = Math.min(50, t - lastT); lastT = t;
    if (!houseActive || mirrorHouse.style.display === 'none'){
      if (lastX !== null){ lastX = null; edgeLOn = setEdge(edgeL, false, edgeLOn); edgeROn = setEdge(edgeR, false, edgeROn); }
      return;
    }
    if ((++edgeTick & 7) === 0) updateEdges();
    const k = dt / 16.667;
    const lo = min(), hi = 0;
    if (!dragging){
      target += v * k;
      v *= Math.pow(0.945, k);
      if (Math.abs(v) < 0.04) v = 0;
      if (target > hi) target += (hi - target) * (1 - Math.pow(1 - 0.10, k));
      if (target < lo) target += (lo - target) * (1 - Math.pow(1 - 0.10, k));
    }
    x += (target - x) * (1 - Math.pow(1 - 0.16, k));
    if (lastX === null || Math.abs(x - lastX) > 0.03){
      lastX = x;
      stage.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
      updateMarks(x, lo);
    }
  }
  requestAnimationFrame(frame);
  mirrorHouse.addEventListener('pointerdown', e => {
    if (!houseActive) return;
    dragging = true; px = e.clientX; moved = 0; v = 0;
    pxT = performance.now();
    mirrorHouse.classList.add('grabbing');
  });
  window.addEventListener('pointermove', e => {
    if (!dragging) return;
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : null;
    const pts = (evs && evs.length) ? evs : [e];
    const now = performance.now();
    const lo = min(), hi = 0;
    let dxTotal = 0;
    pts.forEach(pt => {
      const dx = pt.clientX - px; px = pt.clientX; dxTotal += dx;
      let nt = target + dx;
      if (nt > hi) nt = hi + (nt - hi) * 0.42;
      if (nt < lo) nt = lo + (nt - lo) * 0.42;
      target = nt;
    });
    const dt = Math.max(8, now - pxT); pxT = now;
    const inst = dxTotal / dt * 16.667;
    v = v * 0.55 + inst * 0.45;
    moved += Math.abs(dxTotal);
    if (moved > 16) houseDragMoved = true;
  });
  window.addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = false;
    mirrorHouse.classList.remove('grabbing');
    v = Math.max(-46, Math.min(46, v));
    setTimeout(()=>{ houseDragMoved = false; }, 0);
  });
  window.addEventListener('keydown', e => {
    if (!houseActive || mirrorHouse.style.display === 'none') return;
    if (e.key === 'ArrowLeft'){ target = Math.min(0, target + 220); }
    else if (e.key === 'ArrowRight'){ target = Math.max(min(), target - 220); }
  });
}

const LUX_STEPS = [1.00, 0.82, 0.64, 0.46, 0.28, 0.12];

function currentLux(){
  return LUX_STEPS[Math.min(5, shatteredWaves.size)];
}

function applyLux(){
  const lux = currentLux();
  const shadow = Math.pow(lux, 2.4);
  const r = document.documentElement;
  r.style.setProperty('--lux', lux.toFixed(3));
  r.style.setProperty('--shadow', shadow.toFixed(3));

  r.style.setProperty('--torch-r', Math.round(150 * (0.42 + 0.58 * lux)) + 'px');
  r.style.setProperty('--torch-core', Math.round(55 * (0.35 + 0.65 * lux)) + 'px');
}

function parallaxCoef(base, lux){
  const FLAT = 0.55;
  return FLAT + (base - FLAT) * lux;
}

function bindTorch(){
  if (bindTorch._done) return;
  bindTorch._done = true;

  let tx = innerWidth/2, ty = innerHeight/2, cx = tx, cy = ty, rafOn = false;
  const vig = document.createElement('div');
  vig.id = 'housevignette';
  document.body.appendChild(vig);

  const motes = document.getElementById('housemotes');
  if (motes){
    const mctx = motes.getContext('2d');
    const mdpr = Math.min(2, window.devicePixelRatio || 1);
    let MW = 0, MH = 0;
    const motesResize = ()=>{ MW = innerWidth; MH = innerHeight; motes.width = MW*mdpr; motes.height = MH*mdpr; mctx.setTransform(mdpr,0,0,mdpr,0,0); };
    motesResize(); window.addEventListener('resize', motesResize);
    const MN = REDUCED_MOTION ? 0 : 40;
    const dust = [];
    for (let i=0;i<MN;i++) dust.push({ x:Math.random()*innerWidth, y:Math.random()*innerHeight,
      r:0.6+Math.random()*1.4, vx:(Math.random()-.5)*.12, vy:-.05-Math.random()*.12,
      a:0.05+Math.random()*0.16, ph:Math.random()*6.28, sp:0.004+Math.random()*0.01 });
    if (MN){
      const motesFrame = ()=>{
        if (houseActive){
          mctx.clearRect(0,0,MW,MH);
          const heavy = 1 + shatteredWaves.size * 0.55;
          const slow = 0.85 + shatteredWaves.size * 0.06;
          const grow = 1 + shatteredWaves.size * 0.06;
          for (const d of dust){
            d.x += d.vx; d.y += d.vy / slow; d.ph += d.sp;
            if (d.y < -10){ d.y = MH+10; d.x = Math.random()*MW; }
            if (d.x < -10) d.x = MW+10; else if (d.x > MW+10) d.x = -10;
            const tw = Math.min(0.6, d.a * (0.6 + 0.4*Math.sin(d.ph)) * heavy);
            mctx.beginPath(); mctx.arc(d.x, d.y, d.r * grow, 0, 6.283);
            mctx.fillStyle = 'rgba(226,208,176,'+tw.toFixed(3)+')'; mctx.fill();
          }
        } else { mctx.clearRect(0,0,MW,MH); }
        requestAnimationFrame(motesFrame);
      };
      requestAnimationFrame(motesFrame);
    }
  }
  let torchPrev = { c:0, m:0, r:0 }, torchVigPrev = '', proxTick = 0;
  function torchFrame(){
    if (!houseActive){ rafOn = false; vig.style.opacity = '0'; return; }
    cx += (tx - cx) * .34;
    cy += (ty - cy) * .34;
    const b = 1 + 0.03 * Math.sin(performance.now() / 4000 * Math.PI * 2);

    if ((++proxTick & 7) === 0) proximityCheck();

    const L = currentLux();
    const core = Math.round(55  * b * (0.35 + 0.65 * L));
    const rad  = Math.round(150 * b * (0.42 + 0.58 * L));
    const mid  = Math.round((core + rad) * 0.62);
    const qx = Math.round(cx), qy = Math.round(cy);
    const st = torch.style;
    st.setProperty('--tx', qx + 'px');
    st.setProperty('--ty', qy + 'px');
    if (core !== torchPrev.c){ torchPrev.c = core; st.setProperty('--tc', core + 'px'); }
    if (mid  !== torchPrev.m){ torchPrev.m = mid;  st.setProperty('--tm', mid  + 'px'); }
    if (rad  !== torchPrev.r){ torchPrev.r = rad;  st.setProperty('--tr', rad  + 'px'); }

    const vo = mirrors.some(m => m.classList.contains('near')) ? '.16' : '0';
    if (vo !== torchVigPrev){ torchVigPrev = vo; vig.style.opacity = vo; }
    requestAnimationFrame(torchFrame);
  }
  window.addEventListener('mousemove', e => {
    tx = e.clientX; ty = e.clientY;
    if (!rafOn && houseActive){ rafOn = true; requestAnimationFrame(torchFrame); }
    lastInteractionTime = performance.now();
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    corridorParallax(e.clientX, e.clientY);
  });
}

let lastMouseX = -9999, lastMouseY = -9999;
const PROXIMITY_RADIUS = 130;

function proximityCheck(){
  mirrors.forEach(m => {
    const r = m.getBoundingClientRect();
    const mx = r.left + r.width/2, my = r.top + r.height/2;
    const dist = Math.hypot(lastMouseX-mx, lastMouseY-my);
    const wasNear = m.classList.contains('near');
    const isNear = dist < PROXIMITY_RADIUS;
    m.classList.toggle('near', isNear);
    if (isNear && !wasNear){
      if (window.Preload) Preload.boost(Number(m.dataset.wave));
      if (!m.classList.contains('shattered-warm')) SFX.play('mirror_lit');
    }
  });
}

const mirrors = [...document.querySelectorAll('.mirror')];
mirrors.forEach((m,i)=>{ m.classList.add('ss-live','ss-phase-'+(i%4)); });

const shatteredWaves = new Set();

function bindMirrors(){
  refreshMirrorA11y();
  if (window.houseMarksRefresh) houseMarksRefresh();
  mirrors.forEach(m => {
    const wn = Number(m.dataset.wave);
    m.classList.toggle('spent-mirror', shatteredWaves.has(wn));
  });
  mirrors.forEach(m => {
    const wn0 = Number(m.dataset.wave);
    if (!shatteredWaves.has(wn0)) m.classList.add('lit');
    setMirrorArt(m, shatteredWaves.has(wn0) ? 'shattered' : 'whole');
    if (m.dataset.bound){ refreshMirrorA11y(); return; }
    m.dataset.bound = '1';
    m.addEventListener('click', () => {
      if (!houseActive) return;
      if (houseDragMoved) return;

      if (!m.classList.contains('lit')){
        revisitMirror(m, Number(m.dataset.wave));
        return;
      }
      const waveNum = Number(m.dataset.wave);
      enterWave(m, waveNum);
    });
  });
}

function warmWave(n){
  if (!SFX || !SFX.warm) return 0;
  const pre = 'w' + n;
  let hit = 0;
  Object.keys(AUDIO).forEach(k=>{
    if (k.indexOf(pre) !== 0) return;
    SFX.warm(k); hit++;
  });
  return hit;
}

function enterWave(mirrorEl, waveNum){
  houseActive = false;
  warmWave(waveNum);
  if (waveNum < 5) setTimeout(()=> warmWave(waveNum + 1), 9000);
  const hm = $('houseMarks'); if (hm) hm.classList.remove('on');
  cueClear();
  ['w1s2-hint','w1s3-hint','endingHint'].forEach(id=>{
    const h = $(id); if (h){ h.textContent = ''; h.classList.remove('on'); }
  });
  const ec = $('endingCue'); if (ec) ec.classList.remove('on');
  window.SS_ACTIVE_WAVE = waveNum;
  if (window.Pan) window.SS_WAVE_PAN = mirrorEl ? Pan.fromEl(mirrorEl) * 0.32 : 0;
  armWaveExit();
  const sceneEl = $('scene'); if (sceneEl) sceneEl.style.display = 'block';
  mirrorHouse.style.zIndex = '';

  if (typeof loadArt === 'function') loadArt('mirror' + waveNum + '_shattered');
  if (voiceoverTimer1) clearTimeout(voiceoverTimer1);
  if (voiceoverTimer2) clearTimeout(voiceoverTimer2);
  if (redShoeVoiceTimer) clearTimeout(redShoeVoiceTimer);
  hideSub();

  if (!enterWave._order) enterWave._order = {};
  if (!enterWave._order[waveNum]) enterWave._order[waveNum] = Object.keys(enterWave._order).length + 1;
  const shoeKey = 'redshoe_' + Math.min(enterWave._order[waveNum], 5);
  waveOpenHold = 6000;
  entryLineHold = true;

  const vo = bindCues(SFX.play(shoeKey), shoeKey);
  if (vo){
    const applyLen = ()=>{
      const d = vo.duration;
      if (d && isFinite(d) && d > 0.4){
        const ms = Math.round(d * 1000) + 600;
        waveOpenHold = ms + 150;
        
      }
    };
    if (vo.readyState >= 1) applyLen();
    else vo.addEventListener('loadedmetadata', applyLen, { once:true });
    vo.addEventListener('ended', ()=>{ entryLineHold = false; }, { once:true });
  }
  redShoeVoiceTimer = setTimeout(()=>{ entryLineHold = false; }, 12000);

  const rect = mirrorEl.querySelector('.frame').getBoundingClientRect();
  const cx = rect.left + rect.width/2;
  const cy = rect.top + rect.height/2;

  mirrorEl.classList.remove('lit');

  const tc = $('transCanvas');
  tc.style.display = 'block';
  tc.width = window.innerWidth;
  tc.height = window.innerHeight;
  const ctx = tc.getContext('2d');
  const diag = Math.hypot(window.innerWidth, window.innerHeight);

  const numCracks = 8;
  const cracks = Array.from({length:numCracks}, (_,i) => {
    const angle = (i/numCracks)*Math.PI*2 + Math.random()*.4;
    const segs = 5;
    const pts = [{x:cx,y:cy}];
    let x=cx, y=cy;
    const len = 50 + Math.random()*70;
    for (let s=0; s<segs; s++){
      const jx = (Math.random()-.5)*18;
      const jy = (Math.random()-.5)*18;
      x += Math.cos(angle)*(len/segs) + jx;
      y += Math.sin(angle)*(len/segs) + jy;
      pts.push({x,y});
    }
    return pts;
  });

  const CRACK_MS = 620;
  const FLASH_MS = 260;
  const FADE_MS  = 560;
  const t0 = performance.now();
  let phase = 'crack';
  let handedOff = false;

  function drawCracks(alpha){
    cracks.forEach(pts => {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      pts.forEach(pt => ctx.lineTo(pt.x, pt.y));
      ctx.strokeStyle = 'rgba(224,232,236,' + (0.95*alpha).toFixed(3) + ')';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.5*alpha).toFixed(3) + ')';
      ctx.lineWidth = 0.75;
      ctx.stroke();
    });
  }

  function loop(){
    const now = performance.now();
    ctx.clearRect(0,0,tc.width,tc.height);

    if (phase === 'crack'){
      const p = Math.min(1, (now-t0)/CRACK_MS);
      cracks.forEach(pts => {
        const visibleSegs = Math.ceil(p * (pts.length-1));
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i=1; i<=visibleSegs && i<pts.length; i++){ ctx.lineTo(pts[i].x, pts[i].y); }
        ctx.strokeStyle = 'rgba(224,232,236,0.95)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 0.75;
        ctx.stroke();
      });
      if (p >= 1){ phase = 'flash'; }
      requestAnimationFrame(loop);

    } else if (phase === 'flash'){
      const p = Math.min(1, (now-t0-CRACK_MS)/FLASH_MS);
      drawCracks(1 - p);
      const fa = Math.sin(Math.min(1,p*1.2) * Math.PI) * 0.85;
      ctx.fillStyle = 'rgba(255,255,255,' + fa.toFixed(3) + ')';
      ctx.fillRect(0,0,tc.width,tc.height);
      if (p >= 1){ phase = 'fade'; }
      requestAnimationFrame(loop);

    } else if (phase === 'fade'){
      const p = Math.min(1, (now-t0-CRACK_MS-FLASH_MS)/FADE_MS);
      ctx.fillStyle = 'rgba(3,4,4,' + p.toFixed(3) + ')';
      ctx.fillRect(0,0,tc.width,tc.height);

      if (p >= 1){
        ctx.fillStyle = 'rgba(3,4,4,1)';
        ctx.fillRect(0,0,tc.width,tc.height);
        if (!handedOff){
          handedOff = true;
          showWaveStage(waveNum);
          setTimeout(()=>{
            tc.style.display = 'none';
            ctx.clearRect(0,0,tc.width,tc.height);
          }, 240);
        }
        return;
      }
      requestAnimationFrame(loop);
    }
  }
  requestAnimationFrame(loop);
}

function showWaveStage(waveNum){

  if (window.Ambience) Ambience.silence(900);

  const landing = $('landing');
  if (landing) landing.style.display = 'none';
  mirrorHouse.style.display = 'none';
  torch.style.display = 'none';
  hideAllWaveScenes();
  if (!entryLineHold) hideSub();

  setTimeout(()=>{
    const el = Array.from(document.querySelectorAll('.wscene'))
      .find(x => getComputedStyle(x).display !== 'none');
    if (el){
      el.classList.remove('scene-push'); void el.offsetWidth;
      el.classList.add('scene-push');
      el.addEventListener('animationend', ()=> el.classList.remove('scene-push'), { once:true });
    }
  }, 80);

  const HOLD = Math.max(2400, waveOpenHold || 4200);
  const S = { 1:startWave1Scene1, 2:startWave2Scene1, 3:startWave3Scene1,
              4:startWave4Scene1, 5:startWave5Scene1 };
  if (S[waveNum]){
    later(HOLD, ()=> waveBrief(waveNum, ()=> S[waveNum](waveNum)));
    return;
  }
  showWaveStagePlaceholder(waveNum, `Wave ${waveNum} begins here. Full build is the next pass.`);
}

function showWaveStagePlaceholder(waveNum, text){
  const stage = $('waveStage');
  stage.style.display = 'flex';
  $('wavePlaceholder').textContent = text;
  const btn = $('waveReturnBtn');
  btn.onclick = () => showWaveEndChoice(waveNum);
}

const W1S2_RISE_WOBBLE_AFTER_MS = 1500;
const W1S2_BASE_BLUR_DOWN = 15;
const W1S2_BASE_BLUR_UP   = 3;
const W1S2_PROXIMITY_BLUR_MAX = 10;
const W1S2_PROXIMITY_RADIUS = 260;

const W1S2_RESOLVE_HOLD_MS = 5200;

function playScene2to3ransition(waveNum){
  const stage = $('w1s2');
  const t = $('w1s2to3');
  stage.style.display = 'none';
  t.classList.remove('lit');
  t.style.display = 'block';
  setTimeout(()=>{
    t.classList.add('lit');
    SFX.fade('w1s2_wedding', 0, 1100);
    setTimeout(()=>{
      t.style.display = 'none';
      try{ SFX.stop('w1s2_wedding'); }catch(e){}
      startWave1Scene3(waveNum);
    }, 1100);
  }, 1500);
}

function startWave1Scene2(waveNum, underlay){
  cueClear();
  if (!underlay) hideAllWaveScenes('w1s2');
  later(1600, ()=> cueBrief('move', 'Hold SPACE to rise onto her toes. Move over an object to look at it.', ()=>{}));
  SFX.play('w1s2_wedding');
  let balletOn = false;
  wSay('w1s2_notme', 2000);
  const stage = $('w1s2');
  const camera = $('w1s2-camera');
  const mirror = $('w1s2-mirror');
  const mirrorLayers = {
    young: $('w1s2-youngmargaret'),
    scar: $('w1s2-scarface'),
    dancing: $('w1s2-dancing'),
  };
  const objects = [...stage.querySelectorAll('.w1s2-object')];

  stage.className = 'memfade-in0';
  stage.style.display = 'block';
  void stage.offsetHeight;
  requestAnimationFrame(()=>{ stage.classList.add('memfade-in1'); });
  Object.values(mirrorLayers).forEach(l => l.className = 'w1s2-mirror-layer');
  mirror.classList.remove('resolving','wrong');

  objects.forEach(o => o.classList.remove('chosen'));
  $('w1s2-dwellRing').style.display = 'none';

  let holding = false;
  let holdStart = null;
  let wobbleTimer = null;
  let resolved = false;
  let mouseX = -9999, mouseY = -9999;
  let intro = true;

  const W1S2_INTRO_MS = 2800;
  hideSub();
  setTimeout(()=>{ intro = false; }, W1S2_INTRO_MS);

  let mCx = 0, mCy = 0;
  function measureMirror(){
    const r = mirror.getBoundingClientRect();
    mCx = r.left + r.width/2; mCy = r.top + r.height/2;
  }
  measureMirror();
  window.addEventListener('resize', measureMirror);
  addCleanup(()=> window.removeEventListener('resize', measureMirror));
  let mRemeasure = 0;

  function blurLoop(){
    if (!stage.parentElement || stage.style.display === 'none'){ clearBlurState(mirror); return; }
    if (++mRemeasure >= 30){ mRemeasure = 0; measureMirror(); }
    const base = stage.classList.contains('risen') ? W1S2_BASE_BLUR_UP : W1S2_BASE_BLUR_DOWN;
    const dist = Math.hypot(mouseX-mCx, mouseY-mCy);
    const proximity = Math.max(0, 1 - dist / W1S2_PROXIMITY_RADIUS);
    const blur = resolved ? 0 : base + proximity * W1S2_PROXIMITY_BLUR_MAX;
    setBlur(mirror, blur, 0.5);
    requestAnimationFrame(blurLoop);
  }
  blurLoop();

  function onMouseMove(e){
    mouseX = e.clientX; mouseY = e.clientY;
    if (!balletOn && !intro){
      balletOn = true;
      SFX.play('w1s2_ballet'); SFX.stop('w1s2_wedding');
      wSay('w1s2_congrats', 700);
    }
  }
  window.addEventListener('mousemove', onMouseMove);

  function startHold(){
    if (intro || holding || resolved) return;
    holding = true;
    holdStart = performance.now();
    stage.classList.remove('snapping');
    stage.classList.add('risen');
    wobbleTimer = setTimeout(()=>{ stage.classList.add('wobbling'); }, W1S2_RISE_WOBBLE_AFTER_MS);
  }
  function endHold(){
    if (!holding) return;
    holding = false;
    clearTimeout(wobbleTimer);
    stage.classList.remove('wobbling');
    if (!resolved){

      stage.classList.add('snapping');
      stage.classList.remove('risen');
      setTimeout(()=>{ stage.classList.remove('snapping'); }, 200);
    }
  }
  function onKeyDown(e){ if (e.code === 'Space'){ e.preventDefault(); startHold(); } }
  function onKeyUp(e){ if (e.code === 'Space'){ endHold(); } }
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  const W1S2_PREVIEW_MS = 1900;
  let previewing = false;

  function showPreview(which, objectKey){
    if (previewing || resolved) return;
    previewing = true;
    objects.forEach(o => o.classList.toggle('chosen', o.dataset.object === objectKey));
    $('w1s2-dwellRing').style.display = 'none';

    if (which === 'dancing'){
      mirrorLayers.dancing.classList.add('on', 'glimpse');
      
    } else if (which === 'shoe'){
      mirrorLayers.young.classList.add('on', 'glimpse', 'tone-shoe');
    } else if (which === 'ring'){
      mirrorLayers.young.classList.add('on', 'glimpse', 'tone-ring');
    } else {
      mirrorLayers.young.classList.add('on', 'glimpse');
      
    }

    setTimeout(()=>{
      mirrorLayers.young.classList.remove('on','glimpse','tone-ring','tone-shoe');
      mirrorLayers.dancing.classList.remove('on','glimpse','tone-ring');
      objects.forEach(o => o.classList.remove('chosen'));
      hideSub();
      previewing = false;
    }, W1S2_PREVIEW_MS);
  }

  function finalResolve(objectKey){
    if (resolved || previewing) return;
    resolved = true;
    SFX.stop('w1s2_ballet');
    if (objectKey === 'hand') wSay('w1s2_youdidit', 500);
    clearTimeout(wobbleTimer);
    stage.classList.remove('wobbling');
    objects.forEach(o => o.classList.toggle('chosen', o.dataset.object === objectKey));
    $('w1s2-dwellRing').style.display = 'none';

    mirror.classList.add('resolving');
    mirrorLayers.young.classList.add('on');
    mirrorLayers.scar.classList.add('on');
    mirror.classList.add('morph');
    

    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);

    setTimeout(()=>{
      hideSub();
      playScene2to3ransition(waveNum);
    }, W1S2_RESOLVE_HOLD_MS);
  }

  const dwellRing = $('w1s2-dwellRing');
  const dwellRingProgress = dwellRing.querySelector('.progress');
  const W1S2_OBJECT_DWELL_MS = 500;

  objects.forEach(o => {
    let dwellStart = null;
    let dwellTimer = null;
    let hovering = false;

    function tick(){
      if (!hovering || resolved || previewing || intro) return;
      const p = Math.min(1, (performance.now() - dwellStart) / W1S2_OBJECT_DWELL_MS);
      dwellRingProgress.setAttribute('stroke-dashoffset', (94.25 * (1 - p)).toFixed(2));
      if (p >= 1){
        const key = o.dataset.object;
        if (key === 'hand') finalResolve(key);
        else if (key === 'trophy') showPreview('dancing', key);
        else if (key === 'shoe') showPreview('shoe', key);
        else if (key === 'ring') showPreview('ring', key);
        else showPreview('young', key);
        return;
      }
      dwellTimer = requestAnimationFrame(tick);
    }

    o.addEventListener('mouseenter', (e) => {
      if (intro || resolved || previewing) return;
      hovering = true;
      dwellStart = performance.now();
      dwellRing.style.display = 'block';
      dwellRingProgress.setAttribute('stroke-dashoffset', '94.25');
      const r = o.getBoundingClientRect();
      dwellRing.style.left = (r.left + r.width/2) + 'px';
      dwellRing.style.top  = (r.top + r.height/2) + 'px';
      tick();
    });
    o.addEventListener('mouseleave', () => {
      hovering = false;
      if (dwellTimer) cancelAnimationFrame(dwellTimer);
      dwellRing.style.display = 'none';
    });
  });
}

const W1S3_FALL_TIMER_MS   = 12500;
const W1S3_LEAN_LERP       = 0.14;
const W1S3_LEAN_MAX_DEG    = 16;
const W1S3_WOBBLE_AMP_DEG  = 4;
const W1S3_GRIP_DECAY_MS   = 900;
const W1S3_FALL_TARGET_DEG = 76;
const W1S3_FALL_A_MS = 520;
const W1S3_FALL_B_MS = 240;
const W1S3_FALL_C_MS = 200;

function startWave1Scene3(waveNum, underlay){
  cueClear();
  if (!underlay) hideAllWaveScenes('w1s3');
  wSay('w1s3_yesido', 1400);
  wSay('w1s3_bestdancer', 5200);
  const stage = $('w1s3');
  const rig = $('w1s3-figure');
  const upper = $('w1s3-upper');
  const barre = $('w1s3-barre');
  let barPair = $('w1s3').querySelector('#w1s3-inset');
  if (!barPair){
    barPair = document.createElement('div');
    barPair.id = 'w1s3-inset';
    barPair.innerHTML =
      '<div class="w1s3-inset-art" data-asset="bar_ballet"></div>' +
      '<div class="w1s3-inset-art" data-asset="bar_hospital" style="opacity:0"></div>';
    $('w1s3').appendChild(barPair);
    applyAssets(barPair);
  }
  barPair.classList.remove('on');

  const handrail = $('w1s3-handrail');
  const catchFlash = $('w1s3-catchflash');
  SFX.play('w1s3_monitor');
  setTimeout(()=>{  }, 1400);
  setTimeout(()=>{  }, 5200);
  const gripDot = $('w1s3-grippoint');
  const armUpper = $('w1s3-armUpper');
  const armFore  = $('w1s3-armFore');
  const handEl   = $('w1s3-hand');
  const fingersEl= $('w1s3-fingers');

  stage.style.display = 'block';
  rig.style.transform = 'rotate(0deg)';
  upper.setAttribute('transform', 'rotate(0 52 83)');
  barre.classList.add('on');
  handrail.classList.remove('on');
  catchFlash.classList.remove('on');

  const F_FEET = {x:45, y:220}, F_HIP = {x:52, y:83}, F_SH = {x:46, y:45};
  const ARM_L1 = 28, ARM_L2 = 27;
  const ARM_STRETCH = 1.08;
  const RAIL_DY = -144;
  const GRIP_DX = -41;

  let lean = 0;
  let targetLeanX = 0;
  let gripTapAt = -99999;
  let fallen = false;
  let rafId = null;
  let mamaTimer = null;
  let upperSm = 0;
  let handX = null, handY = null, handOnRail = true;
  const startTime = performance.now();

  function layout(){

    const feetX = window.innerWidth / 2 + 18 + 45;
    const feetY = window.innerHeight * 0.86;
    const railY = feetY + RAIL_DY;
    const gripBaseX = feetX + GRIP_DX;
    return {
      feetX, feetY, railY, gripBaseX,
      railX0: Math.max(24, window.innerWidth * 0.06),
      railEndX: gripBaseX + 14,
      floorY: window.innerHeight * 0.87,
    };
  }
  function rot(px, py, deg){
    const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
    return { x: px * c - py * s, y: px * s + py * c };
  }

  function shoulderWorld(L, bodyDeg, upDeg){
    const a = rot(F_SH.x - F_HIP.x, F_SH.y - F_HIP.y, upDeg);
    const b = rot(F_HIP.x - F_FEET.x + a.x, F_HIP.y - F_FEET.y + a.y, bodyDeg);
    return { x: L.feetX + b.x, y: L.feetY + b.y };
  }
  function setLine(el, x1, y1, x2, y2){
    el.setAttribute('x1', x1); el.setAttribute('y1', y1);
    el.setAttribute('x2', x2); el.setAttribute('y2', y2);
  }
  function drawRail(L){
    setLine($('w1s3-railGlow'), L.railX0, L.railY, L.railEndX, L.railY);
    setLine($('w1s3-railLine'), L.railX0, L.railY, L.railEndX, L.railY);
    setLine($('w1s3-post1'), L.railX0 + 40, L.railY, L.railX0 + 40, L.floorY);
    setLine($('w1s3-post2'), L.gripBaseX - 34, L.railY, L.gripBaseX - 34, L.floorY);
    setLine($('w1s3-railCold'), L.railX0, L.railY, L.railEndX, L.railY);
    const b1 = $('w1s3-bracket1'), b2 = $('w1s3-bracket2');
    b1.setAttribute('x', L.railX0 + 37); b1.setAttribute('y', L.railY);
    b1.setAttribute('width', 6); b1.setAttribute('height', 16);
    b2.setAttribute('x', L.gripBaseX - 37); b2.setAttribute('y', L.railY);
    b2.setAttribute('width', 6); b2.setAttribute('height', 16);
  }

  function updateArm(L, bodyDeg, upDeg, grip, mode, modeP){
    const sh = shoulderWorld(L, bodyDeg, upDeg);
    if (handX === null){ handX = L.gripBaseX; handY = L.railY; }

    if (mode === 'balance'){

      const reach = (ARM_L1 + ARM_L2) * ARM_STRETCH;
      const dy = L.railY - sh.y;
      const rx = Math.sqrt(Math.max(64, reach * reach - dy * dy));
      const desired = Math.min(L.railEndX, Math.max(L.railX0 + 26, sh.x - rx));
      const slide = 0.30 - grip * 0.26;
      handX += (desired - handX) * slide;
      handX = Math.min(L.railEndX, Math.max(L.railX0 + 26, handX));
      handY = L.railY;
      handOnRail = true;
    } else if (mode === 'fallA'){

      handX += ((L.railEndX + 34) - handX) * (modeP * modeP * 0.5 + 0.08);
      handY = L.railY + 30 * modeP * modeP;
      handOnRail = handX < L.railEndX + 2;
    } else if (mode === 'fallB'){

      handX += (L.railEndX - handX) * 0.45;
      handY += (L.railY - handY) * 0.45;
      handOnRail = true;
    } else {
      const limp = rot(-16, 64, bodyDeg);
      const tx = sh.x + limp.x, ty = sh.y + limp.y;
      const k = Math.min(1, 0.10 + modeP * 0.3);
      handX += (tx - handX) * k;
      handY += (ty - handY) * k;
      handOnRail = false;
    }

    let dx = handX - sh.x, dy2 = handY - sh.y;
    let d = Math.max(1, Math.hypot(dx, dy2));

    const maxReach = (ARM_L1 + ARM_L2) * ARM_STRETCH;
    if (d > maxReach){
      const ux0 = dx / d, uy0 = dy2 / d;
      handX = sh.x + ux0 * maxReach;
      handY = sh.y + uy0 * maxReach;
      handOnRail = false;
      dx = handX - sh.x; dy2 = handY - sh.y; d = maxReach;
    }
    const stretch = Math.min(ARM_STRETCH, Math.max(1, d / (ARM_L1 + ARM_L2)));
    const l1 = ARM_L1 * stretch, l2 = ARM_L2 * stretch;
    const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    const ux = dx / d, uy = dy2 / d;
    let px = -uy, py = ux;
    if (py < 0){ px = -px; py = -py; }
    const ex = sh.x + ux * a + px * h, ey = sh.y + uy * a + py * h;

    armUpper.setAttribute('stroke-width', (7 + grip * 1.2).toFixed(2));
    armFore.setAttribute('stroke-width', (6 + grip * 1.0).toFixed(2));
    setLine(armUpper, sh.x, sh.y, ex, ey);
    setLine(armFore, ex, ey, handX, handY);
    handEl.setAttribute('cx', handX); handEl.setAttribute('cy', handY);
    handEl.setAttribute('r', (5 + grip * 1.5).toFixed(2));
    if (handOnRail){

      const x = handX, y = handY;
      fingersEl.setAttribute('d',
        'M ' + (x - 6) + ' ' + (y - 4) + ' q 3 4 1 9 ' +
        'M ' + (x - 1) + ' ' + (y - 5) + ' q 3 5 1 10 ' +
        'M ' + (x + 4) + ' ' + (y - 4) + ' q 3 4 1 9');
      fingersEl.setAttribute('opacity', (0.4 + grip * 0.5).toFixed(2));
    } else {
      fingersEl.setAttribute('opacity', '0');
    }
    gripDot.style.transform =
      'translate(' + (handX - 7.5) + 'px,' + (handY - 7.5) + 'px)';
  }

  function onMove(e){
    if (fallen) return;
    targetLeanX = Math.max(-1, Math.min(1, (e.clientX / window.innerWidth - 0.5) * 2));
  }

  function onKeyDown(e){
    if (e.code === 'Space' && !e.repeat){
      e.preventDefault();
      if (!armed) return;
      gripTapAt = performance.now();
      cueBeat();
    }
  }
  const onMoveT = rafThrottle(onMove);
  window.addEventListener('mousemove', onMoveT);
  window.addEventListener('keydown', onKeyDown);

  let fallTimer = null, armed = false, armedAt = 0;
  addCleanup(()=>{ waitRing(false); cueClear(); });
  const h3 = $('w1s3-hint'); if (h3) h3.classList.remove('on');
  later(900, ()=>{
    if (fallen) return;
    cueBriefLeft('press', 'Move the mouse to lean her. Press SPACE again and again to hold her up.', ()=>{
      if (fallen) return;
      armed = true; armedAt = performance.now();
      gripTapAt = performance.now();
      fallTimer = setTimeout(triggerFall, W1S3_FALL_TIMER_MS);
    });
  });

  function balanceLoop(){
    if (fallen) return;

    lean += (targetLeanX * W1S3_LEAN_MAX_DEG - lean) * W1S3_LEAN_LERP;

    const t = performance.now();
    const elapsedP = armed ? Math.min(1, (t - armedAt) / W1S3_FALL_TIMER_MS) : 0;

    const intensity = 0.6 + 1.6 * Math.pow(elapsedP, 2.2);
    const suppressionCap = 0.78 - 0.62 * elapsedP;

    const sinceTap = armed ? (t - gripTapAt) : 0;
    const gripStrength = Math.max(0, 1 - sinceTap / W1S3_GRIP_DECAY_MS);
    gripDot.style.opacity = (0.15 + gripStrength * 0.85).toFixed(2);
    cueProgress(elapsedP);
    cueUrgency(elapsedP);

    const baseAmp = W1S3_WOBBLE_AMP_DEG * intensity;
    const wobbleAmp = baseAmp * (1 - gripStrength * suppressionCap);
    const wobble = Math.sin(t * 0.0021) * wobbleAmp * 0.6 + Math.sin(t * 0.0035 + 1.3) * wobbleAmp * 0.4;

    const bodyDeg = lean + wobble;

    upperSm += (bodyDeg - upperSm) * 0.06;
    const upperDelta = Math.max(-6, Math.min(6, bodyDeg - upperSm)) - gripStrength * 1.2;

    rig.style.transform = 'rotate(' + bodyDeg.toFixed(2) + 'deg)';
    upper.setAttribute('transform', 'rotate(' + upperDelta.toFixed(2) + ' 52 83)');

    const L = layout();
    drawRail(L);
    updateArm(L, bodyDeg, upperDelta, gripStrength, 'balance', 0);

    rafId = requestAnimationFrame(balanceLoop);
  }
  balanceLoop();

  function triggerFall(){
    if (fallen) return;
    fallen = true;
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener('mousemove', onMoveT);
    window.removeEventListener('keydown', onKeyDown);
    if (mamaTimer) clearTimeout(mamaTimer);
    hideSub();

    barre.classList.remove('on');
    handrail.classList.add('on');
    stage.classList.add('revealed');

    if (barPair && barPair.children.length === 2){
      barPair.children[0].style.opacity = '1';
      barPair.children[1].style.opacity = '0';
      barPair.classList.add('on');
      setTimeout(()=>{ barPair.children[0].style.opacity = '0';
                       barPair.children[1].style.opacity = '1'; }, 480);
      setTimeout(()=> barPair.classList.remove('on'), 1750);
    }

    

    setTimeout(()=>{

      const targetDeg = W1S3_FALL_TARGET_DEG;
      const lerpStartDeg = lean;
      const upperStart = upperSm;
      const t0 = performance.now();

      function fallStep(){
        const elapsed = performance.now() - t0;
        let deg, mode, modeP;
        if (elapsed < W1S3_FALL_A_MS){

          const p = elapsed / W1S3_FALL_A_MS;
          deg = lerpStartDeg + (targetDeg * 0.55 - lerpStartDeg) * (p*p);
          mode = 'fallA'; modeP = p;
        } else if (elapsed < W1S3_FALL_A_MS + W1S3_FALL_B_MS){

          const p = (elapsed - W1S3_FALL_A_MS) / W1S3_FALL_B_MS;
          const from = targetDeg * 0.55, to = targetDeg * 0.62;
          deg = from + (to - from) * p;

          mode = 'fallB'; modeP = p;
        } else if (elapsed < W1S3_FALL_A_MS + W1S3_FALL_B_MS + W1S3_FALL_C_MS){

          const p = (elapsed - W1S3_FALL_A_MS - W1S3_FALL_B_MS) / W1S3_FALL_C_MS;
          const from = targetDeg * 0.62;
          deg = from + (targetDeg - from) * (p*p*(3-2*p));
          mode = 'fallC'; modeP = p;
        } else {
          deg = targetDeg;
          rig.style.transform = 'rotate(' + deg.toFixed(2) + 'deg)';
          const Lf = layout();
          updateArm(Lf, deg, 9, 0, 'fallC', 1);
          impact();
          return;
        }

        upperSm += (deg - upperSm) * 0.055;
        const upperDelta = Math.max(-9, Math.min(9, deg - upperSm));
        rig.style.transform = 'rotate(' + deg.toFixed(2) + 'deg)';
        upper.setAttribute('transform', 'rotate(' + upperDelta.toFixed(2) + ' 52 83)');
        const L = layout();
        drawRail(L);
        updateArm(L, deg, upperDelta, 0, mode, modeP);
        requestAnimationFrame(fallStep);
      }
      requestAnimationFrame(fallStep);
    }, 1400);
  }

  function impact(){
    const whiteflash = $('w1s3-whiteflash');
    const blackhold  = $('w1s3-blackhold');
    whiteflash.classList.add('flash');
    setTimeout(()=>{
      blackhold.classList.add('held');
      whiteflash.classList.remove('flash');
      SFX.stop('w1s3_monitor');

      stage.classList.add('shake-impact');
      setTimeout(()=>{ stage.classList.remove('shake-impact'); }, 600);

      const host = document.getElementById('margaret-scene') || document.body;
      let ov = document.getElementById('w1s3-catchimg');
      if (!ov){
        ov = document.createElement('div');
        ov.id = 'w1s3-catchimg';
        ov.innerHTML = '<img alt="">';
      }
      if (ov.parentElement !== host) host.appendChild(ov);
      const img = ov.querySelector('img');
      ov.classList.remove('show', 'sharp');

      img.onerror = function(){ ov.classList.add('asset-missing'); };
      resolveImage(IMG.peter_catch, src => { img.src = src; }, () => { ov.classList.add('asset-missing'); });

      requestAnimationFrame(()=>{ ov.classList.add('show'); });
      setTimeout(()=>{ ov.classList.add('sharp'); }, 500);
      setTimeout(()=>{ ov.classList.remove('sharp'); }, 3900);
      setTimeout(()=>{
        ov.classList.remove('show');
        stage.style.display = 'none';
        playScene3to4ransition(waveNum);
      }, 5000);
    }, 250);
  }
}

function playScene3to4ransition(waveNum){
  const blackhold = $('w1s3-blackhold');
  const t = $('w1s3to4');
  t.classList.remove('focusing');
  t.style.display = 'block';
  setTimeout(()=>{
    blackhold.classList.remove('held');
    t.classList.add('focusing');
    setTimeout(()=>{
      startWave1Scene4(waveNum);
      t.style.display = 'none';
    }, 1500);
  }, 400);
}

let w1s4Raf = null, w1s4Key = null, w1s4Gaze = null;

function startWave1Scene4(waveNum){
  cueClear();
  later(1400, ()=> cueBrief('type', 'Call her back. Type mama, five times.', ()=>{}));
  hideAllWaveScenes('w1s4');
  const s4 = $('w1s4');
  const peter = $('w1s4-peter'), mother = $('w1s4-mother');
  const wrap = $('w1s4-facewrap'), kitchen = $('w1s4-kitchen');
  const inputwrap = $('w1s4-inputwrap'), typed = $('w1s4-typed');
  let micCall = false, keysArmed4 = true, micHandle4 = null;
  const barfill = $('w1s4-barfill');

  s4.style.display = 'block';
  s4.classList.remove('fadeout'); s4.style.opacity = '1';
  wrap.classList.add('breathing');
  let w4gx = 0, w4gy = 0, w4tx = 0, w4ty = 0;
  function gazeStr(){
    w4gx += (w4tx - w4gx) * 0.06;
    w4gy += (w4ty - w4gy) * 0.06;
    return ' perspective(900px) rotateY(' + w4gx.toFixed(2) + 'deg) rotateX(' + (-w4gy).toFixed(2) + 'deg)';
  }
  w1s4Gaze = function(e){
    w4tx = (e.clientX / window.innerWidth - 0.5) * 5;
    w4ty = (e.clientY / window.innerHeight - 0.5) * 4;
    wrap.style.setProperty('--gx', w4tx.toFixed(2) + 'deg');
    wrap.style.setProperty('--gy', (-w4ty).toFixed(2) + 'deg');
  };
  window.addEventListener('mousemove', w1s4Gaze);
  peter.style.opacity = '1'; mother.style.opacity = '0';
  wrap.style.transition = 'none';
  clearBlurState(wrap); setBlur(wrap, 0, 0.5);
  setTransform(wrap, 'translate(-50%,-50%) scale(var(--bscale,1))');
  kitchen.style.transition = ''; kitchen.style.opacity = '0';
  inputwrap.classList.remove('on');
  typed.innerHTML = '<span id="w1s4-caret">_</span>';
  barfill.style.width = '100%';

  const ENV = [
    { hold:3000, fade:4000 },
    { hold:2000, fade:3000 },
    { hold:1000, fade:1500 },
    { hold:500,  fade:800  },
    { hold:120,  fade:400  },
  ];
  let MAX = ENV.length;
  let phase = 'HOLD';
  let t0 = performance.now();
  let count = 0, envStart = 0, buf = '', ended = false;

  function envClarity(now){
    const e = ENV[Math.min(count, MAX) - 1];
    if (!e) return 0;
    const dt = now - envStart;
    if (dt < e.hold) return 1;
    return Math.max(0, 1 - (dt - e.hold) / e.fade);
  }
  function callMama(){
    if (count >= MAX) return;
    count++; envStart = performance.now();
    try { SFX.play('w1s4_mama'); } catch(e){}
    cueBeat(); cueProgress(count / MAX);
  }

  w1s4Key = function(ev){
    if (phase !== 'CALL' || ended || !keysArmed4) return;
    const h4 = $('w1s4-hint'); if (h4) h4.classList.remove('on');
    const k = ev.key;
    if (k === 'Backspace'){ buf = buf.slice(0, -1); }
    else if (k.length === 1){ buf = (buf + k).toLowerCase().slice(-6); }
    else return;
    if (buf.endsWith('mama') || buf.endsWith('\u5988\u5988')){ buf = ''; callMama(); }
    if (buf){ typed.textContent = buf.split('').join('\u2009'); }
    else { typed.innerHTML = '<span id="w1s4-caret">_</span>'; }
    ev.preventDefault();
  };

  function frame(){
    const now = performance.now();
    if (phase === 'HOLD'){
      if (now - t0 > 1500){ phase = 'MORPH'; t0 = now; }
    } else if (phase === 'MORPH'){
      const p = Math.min(1, (now - t0) / 3000);
      peter.style.opacity = (1 - p).toFixed(3);
      mother.style.opacity = p.toFixed(3);
      const b = Math.sin(p * Math.PI) * 9;
      setBlur(wrap, b, 0.5);
      setTransform(wrap, 'translate(-50%,-50%)' + gazeStr() +
        ' skewX(' + (Math.sin(p * Math.PI) * 4).toFixed(1) + 'deg) scale(var(--bscale,1))');
      if (p >= 1){
        phase = 'CALL'; count = 1; envStart = now; buf = '';
        micHandle4 = tryMicListen(()=>{ if (phase === 'CALL' && !ended) callMama(); },
                                  { threshold:0.075, sustain:140, refractory:620 });
        micCall = !!micHandle4;
        MAX = micCall ? 2 : ENV.length;
        keysArmed4 = !micCall;
        if (micCall){
          later(7000, ()=>{
            if (ended || keysArmed4 || count > 1) return;
            keysArmed4 = true;
            const hr = $('w1s4-hint');
            if (hr){ hr.textContent = 'or type mama'; hr.classList.add('on'); hintCount('w1s4-hint', MAX); }
            if (inputwrap) inputwrap.classList.add('on');
          });
        }
        wrap.style.transform = 'translate(-50%,-50%)';
        if (keysArmed4) inputwrap.classList.add('on');
        const h4 = $('w1s4-hint');
        if (h4) h4.classList.remove('on');
        cueBrief(micCall ? 'speak' : 'type', micCall ? 'Call out to her. Say mama, twice.'
                                : 'Call her back. Type mama, five times.', ()=>{});
        cueProgress(0);
        window.addEventListener('keydown', w1s4Key);
      }
    } else if (phase === 'CALL'){
      const clarity = envClarity(now);
      const loss = 1 - clarity;
      const bq = Math.round(loss * 26 / 0.5) * 0.5;
      const sq = (1 - loss * 0.72).toFixed(2);
      const gq = (1 - loss * 0.34).toFixed(2);
      setFilter(wrap, 'blur(' + bq + 'px) saturate(' + sq + ') brightness(' + gq + ')');
      mother.style.opacity = (0.22 + clarity * 0.78).toFixed(2);
      peter.style.opacity = (loss * 0.45).toFixed(2);
      const dt = now * 0.001;
      const dx = (Math.sin(dt * 0.9) + Math.sin(dt * 2.3) * 0.4) * loss * 5;
      const dy = (Math.cos(dt * 0.7) + Math.sin(dt * 1.7) * 0.4) * loss * 4;
      setTransform(wrap, 'translate(-50%,-50%)' + gazeStr() + ' translate(' +
        dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) scale(var(--bscale,1))');
      barfill.style.width = (clarity * 100).toFixed(0) + '%';
      barfill.style.background = clarity < 0.3 ? 'rgba(178,58,46,.9)' : 'rgba(201,211,218,.5)';
      if (clarity <= 0){
        const e = ENV[Math.min(count, MAX) - 1];
        const idle = now - envStart - e.hold - e.fade;
        if (count >= MAX || idle > 7000){ endScene(); return; }
      }
    }
    if (!ended) w1s4Raf = requestAnimationFrame(frame);
  }

  function endScene(){
    ended = true; phase = 'END';
    if (micHandle4){ micHandle4.stop(); micHandle4 = null; }
    window.removeEventListener('keydown', w1s4Key);
    inputwrap.classList.remove('on');
    setFilter(wrap, 'blur(26px) saturate(.28) brightness(.66)');

    
    setTimeout(playScene4to5, 4200);
  }

  let w1s4Advanced = false;
  const w1s4Floor = setTimeout(()=>{ if (!w1s4Advanced) playScene4to5(); }, 26000);
  function playScene4to5(){
    if (w1s4Advanced) return;
    w1s4Advanced = true;
    clearTimeout(w1s4Floor);
    hideSub();
    startWave1Scene5(waveNum, true);
    wrap.style.transition = 'transform 3.2s cubic-bezier(.34,0,.16,1), filter 3.2s cubic-bezier(.4,0,.6,1), opacity 3.2s cubic-bezier(.5,0,.75,1)';
    setTransform(wrap, 'translate(-50%,-52%) scale(0.08)');
    setFilter(wrap, 'blur(20px) saturate(.2) brightness(.6)');
    wrap.style.opacity = '0';
    setTimeout(()=>{ stopWave1Scene4(); }, 3400);
  }

  frame();
}

function stopWave1Scene4(){
  if (w1s4Raf){ cancelAnimationFrame(w1s4Raf); w1s4Raf = null; }
  if (w1s4Key){ window.removeEventListener('keydown', w1s4Key); w1s4Key = null; }
  if (w1s4Gaze){ window.removeEventListener('mousemove', w1s4Gaze); w1s4Gaze = null; }
  const s4 = $('w1s4');
  s4.style.display = 'none'; s4.classList.remove('fadeout','breathing'); s4.style.opacity = '1';
  const wr = $('w1s4-facewrap');
  if (wr){
    wr.style.removeProperty('--gx'); wr.style.removeProperty('--gy');
    wr.style.transition = ''; wr.style.opacity = '';
    clearBlurState(wr); __filterState.delete(wr); __xformState.delete(wr);
    wr.style.filter = ''; wr.style.transform = '';
  }
}

let w1s5imers = [];
function w1s5(fn, ms){ const id = setTimeout(fn, ms); w1s5imers.push(id); return id; }

let w1s5ApplauseEl = null;
function playApplause(){ w1s5ApplauseEl = SFX.play('w1s5_applause'); }
function cutApplause(){ if (w1s5ApplauseEl){ w1s5ApplauseEl.pause(); w1s5ApplauseEl = null; } }

function playMamaVoice(){ return SFX.play('w1s5_mothervoice', { vol: 0.6 }); }

function startWave1Scene5(waveNum, pullBack){
  cueClear();
  later(1200, ()=> cueWatch(4800));
  hideAllWaveScenes('w1s5');
  const s5 = $('w1s5'), kitchen = $('w1s5-kitchen'), dancer = $('w1s5-dancer');
  dancer.style.display = kitchen.classList.contains('has-asset') ? 'none' : '';
  w1s5imers.forEach(clearTimeout); w1s5imers = []; cutApplause();
  s5.style.display = 'block'; s5.classList.remove('sink'); s5.style.opacity = '1';
  kitchen.style.filter = 'blur(0px)';
  dancer.classList.remove('on'); dancer.style.opacity = '0'; dancer.style.filter = 'blur(0px)';
  if (pullBack){
    kitchen.style.transition = 'none'; kitchen.style.opacity = '1';
    zPull(s5, null, 2400);
  } else {
    kitchen.style.transition = 'none'; kitchen.style.opacity = '1';
    s5.classList.remove('rackfocus'); void s5.offsetWidth; s5.classList.add('rackfocus');
  }
  w1s5(()=>{ dancer.classList.add('on'); }, 1100);

  w1s5(()=>{ document.body.classList.add('nocursor'); playApplause(); }, 1600);

  w1s5(()=>{
    cutApplause();
    const a = bindCues(playMamaVoice(), 'w1s5_mothervoice');
    w1s5(()=>{ document.body.classList.remove('nocursor'); }, 1400);
    const leave = ()=>{
      hideSub();
      kitchen.style.transition = 'opacity 2s ease, filter 2s ease'; kitchen.style.filter = 'blur(10px)';
      dancer.style.filter = 'blur(10px)';
      s5.classList.add('sink');
      w1s5(()=>{ startWave1Scene6(waveNum); }, 1700);
      w1s5(()=>{ stopWave1Scene5(); }, 3000);
    };
    const arm = ()=>{
      const d = a && a.duration;
      const ms = (d && isFinite(d) && d > 0.4) ? Math.round(d * 1000) : 3400;
      w1s5(leave, ms + 1000);
    };
    if (a && a.readyState >= 1) arm();
    else if (a){
      a.addEventListener('loadedmetadata', arm, { once:true });
      a.addEventListener('error', ()=> w1s5(leave, 600), { once:true });
      w1s5(leave, 12000);
    }
    else w1s5(leave, 4400);
  }, 10200);
}

function stopWave1Scene5(){
  w1s5imers.forEach(clearTimeout); w1s5imers = []; cutApplause();
  document.body.classList.remove('nocursor');
  const s5 = $('w1s5'); s5.style.display = 'none'; s5.classList.remove('sink'); zClear(s5);
}

let w1s6Timers = [];
function w1s6T(fn, ms){ const id = setTimeout(fn, ms); w1s6Timers.push(id); return id; }

function fadeEl(el, to, ms, andPause){
  if (!el) return;
  const from = el.volume, steps = Math.max(1, ms / 50);
  let i = 0;
  const t = setInterval(()=>{
    i++;
    el.volume = Math.max(0, Math.min(1, from + (to - from) * (i / steps)));
    if (i >= steps){ clearInterval(t); if (andPause){ try{ el.pause(); }catch(e){} } }
  }, 50);
}

let w1s6CryingEl = null;
function playCrying(){ w1s6CryingEl = SFX.play('w1s6_crying'); }
function stopCrying(){ if (w1s6CryingEl){ fadeEl(w1s6CryingEl, 0, 1400, true); w1s6CryingEl = null; } }

function zPull(el, done, ms){
  if (!el) return;
  el.style.transformOrigin = '50% 50%';
  el.style.transition = 'none';
  el.style.transform = 'scale(2.4)';
  el.style.filter = 'blur(6px)';
  void el.offsetWidth;
  requestAnimationFrame(()=>{
    el.style.transition = 'transform ' + (ms||2200) + 'ms cubic-bezier(.2,.7,.3,1), filter ' + (ms||2200) + 'ms ease, opacity ' + (ms||2200) + 'ms ease';
    el.style.transform = 'scale(1)';
    el.style.filter = 'blur(0)';
    el.style.opacity = '1';
  });
  if (done) setTimeout(done, ms||2200);
}
function zClear(el){
  if (!el) return;
  el.style.transition = '';
  el.style.transform = '';
  el.style.filter = '';
  el.style.opacity = '';
  el.style.transformOrigin = '';
}

function diveIn(el, fromX, fromY){
  el.style.display = 'block';
  el.classList.add('leaf');
  el.classList.remove('diving');
  el.style.setProperty('--ox', (fromX==null?50:fromX) + '%');
  el.style.setProperty('--oy', (fromY==null?54:fromY) + '%');
  const art = el.querySelector('.leaf-art');
  if (art){ art.style.transformOrigin = (fromX==null?50:fromX) + '% ' + (fromY==null?54:fromY) + '%'; }
  el.classList.remove('emerge'); void el.offsetWidth;
  requestAnimationFrame(()=> el.classList.add('emerge'));
}

function startWave1Scene6(waveNum){
  cueClear();
  later(1200, ()=> cueWatch(2500));
  wSay('w1s6_notend', 1800);
  hideAllWaveScenes('w1s6');
  const s6 = $('w1s6');
  w1s6Timers.forEach(clearTimeout); w1s6Timers = [];
  s6.classList.remove('warm');
  s6.style.display = 'block';
  const s6art = s6.querySelector('.leaf-art');
  if (s6art){ s6art.style.transition=''; s6art.style.transform=''; s6art.style.filter=''; s6art.style.opacity=''; }
  diveIn(s6, 50, 52);
  s6.style.transition = 'opacity 1.7s ease';
  s6.style.opacity = '0';
  requestAnimationFrame(()=>{ requestAnimationFrame(()=>{ s6.style.opacity = '1'; }); });

  w1s6T(()=>{ playCrying(); }, 1600);

  w1s6T(()=>{
    
  }, 11000);

  w1s6T(()=>{ hideSub(); s6.classList.add('warm'); stopCrying(); }, 17000);

  w1s6T(()=>{
    startWave1Scene7(waveNum, true);
    s6.style.transition = 'opacity 2.4s ease';
    s6.style.opacity = '0';
  }, 18500);
  w1s6T(()=> stopWave1Scene6(), 21200);
}

function stopWave1Scene6(){
  w1s6Timers.forEach(clearTimeout); w1s6Timers = [];
  stopCrying();
  const s6 = $('w1s6');
  s6.style.display = 'none'; s6.classList.remove('warm','emerge','diving','leaf');
  s6.style.transition = ''; s6.style.opacity = '';
  const a = s6.querySelector('.leaf-art');
  if (a){ a.style.transition=''; a.style.transform=''; a.style.filter=''; a.style.opacity=''; }
}

let w1s7Timers = [], w1s7Move = null;
function w1s7T(fn, ms){ const id = setTimeout(fn, ms); w1s7Timers.push(id); return id; }

let w1s7ShoeEl = null;
let petalWipeEl = null;
function playHeldHand(){
  stopCrying();
  w1s7ShoeEl = null;
  fadeEl(w1s7ShoeEl, 0.72, 1200);
}

function stopHeldHand(){
  if (w1s7ShoeEl){ fadeEl(w1s7ShoeEl, 0, 700);
    const el = w1s7ShoeEl; setTimeout(()=>{ try{ el.pause(); el.currentTime = 0; }catch(e){} }, 760);
    w1s7ShoeEl = null; }
}

function startWave1Scene7(waveNum, underlay){
  cueClear();
  later(1200, ()=> cueWatch(2500));
  if (!underlay) hideAllWaveScenes('w1s7');
  const s7 = $('w1s7'), illo = $('w1s7-illo');
  w1s7Timers.forEach(clearTimeout); w1s7Timers = [];
  s7.classList.remove('lit','rise');
  const s7art = s7.querySelector('.leaf-art'); if (s7art){ s7art.style.transition=''; s7art.style.transform=''; s7art.style.opacity=''; s7art.style.filter=''; }
  if (underlay){
    s7.classList.add('underlay');
    diveIn(s7, 50, 60);
    w1s7T(()=>{ s7.classList.remove('underlay'); }, 2400);
  } else {
    diveIn(s7, 50, 60);
  }

  playHeldHand();
  w1s7T(()=>{ s7.classList.add('lit'); }, 2200);
  w1s7T(()=>{ s7.classList.add('rise'); }, 6800);
  w1s7T(()=>{ whiteShoeMatchCut(waveNum); }, 9600);
}

function whiteShoeMatchCut(waveNum){
  const scene = $('margaret-scene');
  let bloom = $('w1s7-bloom');
  if (!bloom){ bloom = document.createElement('div'); bloom.id = 'w1s7-bloom'; scene.appendChild(bloom); }
  bloom.style.cssText = 'position:absolute;inset:0;z-index:48;pointer-events:none;'
    + 'background:radial-gradient(circle at 50.5% 59%, #ffffff 0%, #fffaf2 10%, rgba(255,248,238,0) 46%);'
    + 'transform-origin:50.5% 59%;transform:' + (REDUCED_MOTION ? 'none' : 'scale(.34)') + ';opacity:0;transition:none;';
  startWave1Scene8(waveNum);
  requestAnimationFrame(()=> requestAnimationFrame(()=>{
    bloom.style.transition = REDUCED_MOTION ? 'opacity .8s ease' : 'opacity 1.0s ease-out, transform 1.0s cubic-bezier(.5,0,.32,1)';
    bloom.style.opacity = '1';
    if (!REDUCED_MOTION) bloom.style.transform = 'scale(3.6)';
  }));
  setTimeout(()=> stopWave1Scene7(), 900);
  setTimeout(()=>{ bloom.style.transition = 'opacity 1.25s ease-in'; bloom.style.opacity = '0'; }, 1150);
}

function stopWave1Scene7(){
  w1s7Timers.forEach(clearTimeout); w1s7Timers = [];
  if (w1s7ShoeEl){ fadeEl(w1s7ShoeEl, 0, 1600, true); w1s7ShoeEl = null; }
  if (w1s7Move){ window.removeEventListener('mousemove', w1s7Move); w1s7Move = null; }
  const s7 = $('w1s7'); s7.style.display = 'none'; s7.classList.remove('lit','rise','emerge','diving');
  const illo = $('w1s7-illo'); if (illo) illo.style.transform = '';
}

let w1s8Timers = [], w1s8Move = null;
function w1s8T(fn, ms){ const id = setTimeout(fn, ms); w1s8Timers.push(id); return id; }


function startWave1Scene8(waveNum){
  cueClear();
  later(1200, ()=> cueWatch(4800));
  wSay('w1s8_mc', 2400);
  hideAllWaveScenes('w1s8');
  const s8 = $('w1s8');
  w1s8Timers.forEach(clearTimeout); w1s8Timers = [];
  s8.style.display = 'block'; s8.classList.remove('grown', 'petal', 'fadeout', 'lit'); s8.style.opacity = '1';
  s8.style.setProperty('--spot-x', '50%');
  s8.style.setProperty('--spot-y', '38%');

  requestAnimationFrame(()=>{ s8.classList.add('grown'); });

  let spotX = 50, spotY = 38, spotQueued = false;
  w1s8Move = function(e){
    spotX = e.clientX / window.innerWidth * 100;
    spotY = e.clientY / window.innerHeight * 100;
    if (spotQueued) return;
    spotQueued = true;
    requestAnimationFrame(()=>{
      spotQueued = false;
      s8.style.setProperty('--spot-x', spotX.toFixed(1) + '%');
      s8.style.setProperty('--spot-y', spotY.toFixed(1) + '%');
    });
  };
  window.addEventListener('mousemove', w1s8Move);
  w1s8T(()=>{ s8.classList.add('lit'); }, 300);

  w1s8T(()=>{ SFX.play('w1s2_wedding'); }, 1600);

  w1s8T(()=>{
    
  }, 9000);

  w1s8T(()=>{
    const s8 = $('w1s8');
    s8.style.transition = 'opacity 2.2s ease';
    s8.style.opacity = '0';
    startWave1Scene9(waveNum, true);
  }, 9600);
  w1s8T(()=>{ const s8=$('w1s8'); s8.style.transition=''; s8.style.display='none'; }, 12000);
}

function stopWave1Scene8(){
  w1s8Timers.forEach(clearTimeout); w1s8Timers = [];
  if (w1s8Move){ window.removeEventListener('mousemove', w1s8Move); w1s8Move = null; }
  const s8 = $('w1s8'); s8.style.display = 'none';
  s8.classList.remove('grown', 'petal', 'fadeout', 'lit'); s8.style.opacity = '1';
}

let w1s9Raf = null, w1s9Move = null, w1s9Resize = null, w1s9Timers = [];
function w1s9T(fn, ms){ const id = setTimeout(fn, ms); w1s9Timers.push(id); return id; }
function startWave1Scene9(waveNum, underlay){
  cueClear();
  later(1200, ()=> cueWatch(2500));
  if (!underlay) hideAllWaveScenes('w1s9');
  const s9 = $('w1s9'), canvas = $('w1s9-canvas'), cover = $('w1s9-cover');
  const dancer = $('w1s9-dancer'), spot = $('w1s9-spot');
  w1s9Timers.forEach(clearTimeout); w1s9Timers = [];
  stopHeldHand();
  s9.style.display = 'block';

  if (dancer){
    dancer.classList.remove('on', 'alive', 'fadeout');
    resolveImage(IMG.dancing_stage, src => { dancer.style.backgroundImage = 'url("' + src + '")'; });
  }
  if (spot) spot.classList.remove('on');
  if (cover) cover.style.display = 'none';

  if (underlay){
    s9.style.zIndex = '39';
    s9.style.transition = 'none';
    s9.style.opacity = '0';
    void s9.offsetWidth;
    requestAnimationFrame(()=>{ s9.style.transition = 'opacity 2.2s ease'; s9.style.opacity = '1'; });
    w1s9T(()=>{ s9.style.zIndex = ''; s9.style.transition = ''; }, 2400);
  } else {
    s9.style.opacity = '1';
  }

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  let W = 0, H = 0;
  function resize(){ W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  resize(); w1s9Resize = resize; window.addEventListener('resize', resize);

  const REDS = [RED_THREAD, '#9e3227', '#c24435', '#a52d24'];
  const MAX = REDUCED_MOTION ? 700 : 2000;
  const SPIN_CAP = REDUCED_MOTION ? 0.03 : 0.09;
  const petals = [];
  let count = 0, fallStart = 0, globalSpin = 0, mouseVel = 0;
  let phase = 'black', fillT = 0, coverRot = Math.random()*6.28;
  let fpsAvg = 16, lastFrameT = 0;

  w1s9Move = function(e){ mouseVel += (e.movementX || 0); };
  window.addEventListener('mousemove', w1s9Move);

  function spawn(){
    petals.push({ x: Math.random()*W, y: -20 - Math.random()*H*1.2, rot: Math.random()*6.28,
      spin: (Math.random()-0.5)*0.02, fall: 0.6 + Math.random()*1.4, size: 0.7 + Math.random()*0.95,
      sway: 0.4 + Math.random()*0.9, phase: Math.random()*6.28, alpha: 0.82 + Math.random()*0.18,
      color: REDS[(Math.random()*REDS.length)|0] });
    count++;
  }
  function drawPetal(s){
    ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.rot); ctx.scale(s.size, s.size);
    ctx.globalAlpha = s.alpha * redVitality();
    if (petalReady()){
      ctx.drawImage(PETAL_IMG, -13, -13, 26, 26*PETAL_IMG.naturalHeight/PETAL_IMG.naturalWidth);
    } else {
      ctx.fillStyle = s.color;
      ctx.beginPath(); ctx.moveTo(0, -11);
      ctx.bezierCurveTo(9, -6, 9, 7, 0, 13); ctx.bezierCurveTo(-9, 7, -9, -6, 0, -11);
      ctx.fill();
    }
    ctx.globalAlpha = 1; ctx.restore();
  }

  if (spot) spot.classList.add('on');
  if (dancer) dancer.classList.add('on');
  w1s9T(()=>{ phase = 'fall'; fallStart = performance.now();
    cueClear();
    later(900, ()=> cueBrief('move', 'Move your mouse to scatter the petals.', ()=>{}));
    SFX.fade('w1s2_wedding', 0, 900);
    setTimeout(()=>{ try{ SFX.stop('w1s2_wedding'); }catch(e){} }, 950);
    playApplause(); }, 400);

  function frame(){
    const now = performance.now();
    if (lastFrameT){ fpsAvg = fpsAvg*0.9 + (now-lastFrameT)*0.1; }
    lastFrameT = now;
    let dynMax = MAX;
    if (fpsAvg > 26) dynMax = Math.min(dynMax, 800);
    if (fpsAvg > 34) dynMax = Math.min(dynMax, 450);
    if (phase === 'fall'){
      const elapsed = now - fallStart;
      const ramp = Math.floor(Math.pow(elapsed / 8500, 1.4) * MAX);
      const target = Math.min(dynMax, ramp);
      while (count < target) spawn();
    }

    mouseVel *= 0.92;
    const spinTarget = Math.max(-SPIN_CAP, Math.min(SPIN_CAP, mouseVel * 0.0009));
    globalSpin += (spinTarget - globalSpin) * 0.1;

    ctx.clearRect(0, 0, W, H);
    for (const s of petals){
      s.rot += s.spin + globalSpin;
      s.y += s.fall;
      s.x += Math.sin(s.y * 0.01 + s.phase) * s.sway + globalSpin * 30 * s.size;
      if (s.y > H + 30){ s.y = -20; s.x = Math.random() * W; }
      drawPetal(s);
    }

    if (phase === 'fall' && (now - fallStart) >= 13000){
      phase = 'cover'; fillT = now;
      petalWipeEl = SFX.play('w1s9_chime');
      if (dancer) dancer.classList.add('fadeout');
    }

    if (phase === 'cover'){
      const p = Math.min(1, (now - fillT) / 3200);
      if (p > 0.32){
        ctx.fillStyle = 'rgba(178,58,46,' + (((p-0.32)/0.68)).toFixed(3) + ')';
        ctx.fillRect(0, 0, W, H);
      }
      const scale = 0.8 + Math.pow(p, 1.55) * (Math.hypot(W, H) / 15);
      ctx.save();
      ctx.translate(W*0.5, H*0.46); ctx.rotate(coverRot + p*0.5); ctx.scale(scale, scale);
      ctx.globalAlpha = 1;
      if (petalReady()){
        ctx.drawImage(PETAL_IMG, -13, -13, 26, 26*PETAL_IMG.naturalHeight/PETAL_IMG.naturalWidth);
      } else {
        ctx.fillStyle = RED_THREAD;
        ctx.beginPath(); ctx.moveTo(0, -11);
        ctx.bezierCurveTo(9, -6, 9, 7, 0, 13); ctx.bezierCurveTo(-9, 7, -9, -6, 0, -11);
        ctx.fill();
      }
      ctx.restore();
      if (p >= 1){ phase = 'done';
        if (petalWipeEl){ try{ petalWipeEl.pause(); petalWipeEl.currentTime = 0; }catch(e){} petalWipeEl = null; }
        cutApplause();
        cueClear();
        later(3000, ()=> showWaveEndChoice(waveNum)); }
    } else if (phase === 'done'){
      ctx.globalAlpha = redVitality();
      ctx.fillStyle = RED_THREAD;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }

    w1s9Raf = requestAnimationFrame(frame);
  }
  w1s9Raf = requestAnimationFrame(frame);
}

function stopWave1Scene9(){
  if (w1s9Raf){ cancelAnimationFrame(w1s9Raf); w1s9Raf = null; }
  if (w1s9Move){ window.removeEventListener('mousemove', w1s9Move); w1s9Move = null; }
  if (w1s9Resize){ window.removeEventListener('resize', w1s9Resize); w1s9Resize = null; }
  w1s9Timers.forEach(clearTimeout); w1s9Timers = [];
  const s9 = $('w1s9'); s9.style.display = 'none';
  const dancer = $('w1s9-dancer'), spot = $('w1s9-spot');
  if (dancer){ dancer.classList.remove('on', 'alive', 'fadeout'); }
  if (spot) spot.classList.remove('on');
}

const W1S1_EXT_NEAR          = 130;
const W1S1_OPEN_MS           = 380;
const W1S1_HOSPITAL_HOLD_MS  = 1500;
const W1S1_BED_HOLD_MS       = 3000;
const W1S1_FLICKER_MS        = 420;
const W1S1_ACADEMY_LINGER_MS = 900;
const W1S1_DWELL_MS          = 700;
const W1S1_DWELL_DECAY       = 0.45;
const W1S1_HOLD_AFTER        = 2200;

const W1S1_AP = { tl:[487,103], tr:[1131,63], br:[1131,789], bl:[487,752], img:[1456,840] };

let erRaf = null, erResize = null;

function startER(){
  const cv = $('w1s1-ercanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  let W = 0, H = 0;
  function resize(){
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W*dpr; cv.height = H*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  resize(); erResize = resize; window.addEventListener('resize', resize);
  const T0 = performance.now();
  function frame(){
    const t = (performance.now() - T0) / 1000;
    const cx = W*0.5;
    ctx.clearRect(0,0,W,H);
    const FLOOR = H*0.74;
    ctx.fillStyle = '#BFC8CF'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle = '#B4BDC5'; ctx.fillRect(0,FLOOR,W,H-FLOOR);
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0,FLOOR); ctx.lineTo(W,FLOOR); ctx.stroke();
    ctx.fillStyle = '#9A8E83';
    ctx.fillRect(0, FLOOR-H*0.13, W, H*0.055);
    ctx.strokeRect(0, FLOOR-H*0.13, W, H*0.055);

    const dw = W*0.13, dx = W*0.80, dy = FLOOR-H*0.40;
    ctx.fillStyle = '#9A8E83';
    ctx.fillRect(dx, dy, dw, FLOOR-dy); ctx.strokeRect(dx, dy, dw, FLOOR-dy);
    ctx.fillStyle = '#BFC8CF';
    ctx.fillRect(dx+dw*0.26, dy+H*0.05, dw*0.48, H*0.075);
    ctx.strokeRect(dx+dw*0.26, dy+H*0.05, dw*0.48, H*0.075);
    ctx.fillStyle = '#B9594F';
    ctx.fillRect(dx+dw*0.16, dy-H*0.045, dw*0.68, H*0.026);
    ctx.strokeRect(dx+dw*0.16, dy-H*0.045, dw*0.68, H*0.026);
    ctx.fillStyle = '#F7F2E7';
    ctx.beginPath();
    ctx.moveTo(W*0.30, H*0.09); ctx.lineTo(W*0.66, H*0.07);
    ctx.lineTo(W*0.70, H*0.115); ctx.lineTo(W*0.34, H*0.135); ctx.closePath();
    ctx.fill(); ctx.stroke();
    const px = W*0.30, ptop = FLOOR-H*0.52;
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
    ctx.fillStyle = '#BFC8CF';
    ctx.fillRect(px-2, ptop, 5, FLOOR-ptop); ctx.strokeRect(px-2, ptop, 5, FLOOR-ptop);
    ctx.beginPath(); ctx.moveTo(px-W*0.035, ptop); ctx.lineTo(px+W*0.035, ptop); ctx.stroke();
    ctx.fillStyle = '#F7F2E7';
    ctx.beginPath();
    ctx.moveTo(px+W*0.012, ptop+8); ctx.lineTo(px+W*0.042, ptop+8);
    ctx.lineTo(px+W*0.038, ptop+H*0.10); ctx.lineTo(px+W*0.016, ptop+H*0.10); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px+W*0.027, ptop+H*0.10); ctx.lineTo(px+W*0.027, ptop+H*0.20); ctx.stroke();
    ctx.fillStyle = 'rgba(154,142,131,.45)';
    ctx.fillRect(0, H*0.15, W*0.115, FLOOR-H*0.15);
    ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 1.6;
    ctx.strokeRect(0, H*0.15, W*0.115, FLOOR-H*0.15);
    for (let i = 1; i < 5; i++){
      ctx.beginPath(); ctx.moveTo(W*0.023*i, H*0.15);
      ctx.lineTo(W*0.023*i, FLOOR); ctx.stroke();
    }
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, H*0.15); ctx.lineTo(W*0.13, H*0.15); ctx.stroke();
    const breathe = 1 + Math.sin(t*0.7)*0.045;
    const pool = ctx.createRadialGradient(cx, H*0.02, 0, cx, H*0.02, H*1.05*breathe);
    pool.addColorStop(0, 'rgba(247,242,231,0.34)');
    pool.addColorStop(0.55, 'rgba(247,242,231,0.08)');
    pool.addColorStop(1, 'rgba(247,242,231,0)');
    ctx.fillStyle = pool;
    ctx.fillRect(0,0,W,H);
    const bedspr = bedSprite();
    if (bedspr){
      const push = 1 + Math.min(t/14, 1) * 0.12;
      const bw = Math.min(W*0.86, H*1.46) * push;
      const bh = bw * bedspr.naturalHeight / bedspr.naturalWidth;
      const bx = cx - bw/2, by = H*0.585 - bh/2;
      ctx.drawImage(bedspr, bx, by, bw, bh);
    }
    const vg = ctx.createRadialGradient(cx, H*0.52, H*0.30, cx, H*0.52, H*0.95);
    vg.addColorStop(0, 'rgba(10,14,18,0)');
    vg.addColorStop(1, 'rgba(10,14,18,0.42)');
    ctx.fillStyle = vg;
    ctx.fillRect(0,0,W,H);
    const mw = W*0.155, mh = mw*0.66;
    const mx0 = W*0.735, my0 = FLOOR - H*0.585;
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
    ctx.fillStyle = '#BFC8CF';
    ctx.fillRect(mx0+mw*0.44, my0+mh, mw*0.12, H*0.20);
    ctx.strokeRect(mx0+mw*0.44, my0+mh, mw*0.12, H*0.20);
    ctx.fillStyle = '#9A8E83';
    ctx.fillRect(mx0, my0, mw, mh);
    ctx.strokeRect(mx0, my0, mw, mh);
    const sx = mx0+mw*0.07, sy = my0+mh*0.10, sw = mw*0.86, sh2 = mh*0.66;
    ctx.fillStyle = '#1C2329';
    ctx.fillRect(sx, sy, sw, sh2);
    ctx.strokeRect(sx, sy, sw, sh2);
    ctx.save();
    ctx.beginPath(); ctx.rect(sx, sy, sw, sh2); ctx.clip();
    const my = sy + sh2*0.55;
    ctx.strokeStyle = 'rgba(178,224,208,0.92)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    const off = (t*0.32) % 1;
    for (let x = 0; x <= sw; x += 2){
      const ph = ((x/sw) + off) % 0.5;
      let y = my;
      const d = Math.min(ph, Math.abs(ph-0.5));
      if (d < 0.018) y = my - Math.sin((0.018-d)/0.018*Math.PI) * sh2*0.36;
      else if (d < 0.036) y = my + Math.sin((d-0.018)/0.018*Math.PI) * sh2*0.12;
      x === 0 ? ctx.moveTo(sx+x, y) : ctx.lineTo(sx+x, y);
    }
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = '#B9594F';
    ctx.beginPath(); ctx.arc(mx0+mw*0.14, my0+mh*0.86, mw*0.026, 0, 6.283); ctx.fill();
    ctx.fillStyle = 'rgba(247,242,231,.75)';
    ctx.fillRect(mx0+mw*0.62, my0+mh*0.83, mw*0.24, mh*0.05);
    if (((t*30)|0) % 2 === 0){
      ctx.globalAlpha = 0.028;
      for (let i=0;i<36;i++){
        ctx.fillStyle = Math.random()<.5 ? '#fff' : '#000';
        ctx.fillRect(Math.random()*W, Math.random()*H, 1.5, 1.5);
      }
      ctx.globalAlpha = 1;
    }
    erRaf = requestAnimationFrame(frame);
  }
  erRaf = requestAnimationFrame(frame);
}

function stopER(){
  if (erRaf){ cancelAnimationFrame(erRaf); erRaf = null; }
  if (erResize){ window.removeEventListener('resize', erResize); erResize = null; }
}

function wSay(key, delay){
  later(delay || 0, ()=>{
    const cues = CUES[key] || [];
    const a = bindCues(SFX.play(key), key);
    const paper = ()=> cues.forEach(c => later(Math.round(c.t * 1000), ()=> showSub(c.who, c.line, c.ms)));
    if (!a){ paper(); return; }
    let heard = false;
    a.addEventListener('playing', ()=>{ heard = true; }, { once:true });
    a.addEventListener('error', paper, { once:true });
    later(900, ()=>{ if (!heard) paper(); });
  });
}

function startWave1Scene1(waveNum){
  cueClear();
  hideAllWaveScenes('w1s1');
  const w1s1    = $('w1s1');
  w1s1.style.background = '#03101e';
  const frame   = $('w1s1-frame');
  const doorway = $('w1s1-doorway');
  const dark    = $('w1s1-dark');
  const pool    = $('w1s1-pool');
  const cold    = $('w1s1-coldflash');
  const ext     = $('w1s1-door');
  const extPush = $('w1s1-buildingPush');
  const extDoor = $('w1s1-doorFrame');
  const layers  = { hospital: $('w1s1-hospital'), academy: $('w1s1-academy'), kitchen: $('w1s1-kitchen') };
  const ring    = $('w1s1-dwellRing');
  const ringProgress = ring.querySelector('.progress');

  Object.values(layers).forEach(l => l.classList.remove('on','locked-in','locked-out'));
  $('w1s1-er').classList.remove('on');
  stopER();
  addCleanup(stopER);
  ring.style.display = 'none';
  ringProgress.setAttribute('stroke-dashoffset', '125.66');
  w1s1.classList.remove('memfade-out');
  frame.classList.remove('panic-entry');
  frame.style.transition = 'none';
  frame.style.transform = '';
  frame.style.filter = '';
  frame.style.cursor = 'default';
  dark.style.transition = 'none';
  dark.style.clipPath = '';
  pool.style.opacity = '';
  cold.classList.remove('catch');
  cold.style.transition = '';
  cold.style.opacity = '';
  doorway.classList.remove('near');
  doorway.style.display = 'block';
  ext.className = '';
  ext.style.display = 'block';
  ext.style.cursor = 'default';
  extPush.style.transition = 'none';
  extPush.style.transform = 'none';
  extPush.style.transformOrigin = '50% 88%';
  void extPush.offsetHeight;
  extDoor.classList.remove('near');
  SFX.stop('w1s1_flicker');
  $('w1s1-panic').classList.remove('on');
  w1s1.style.display = 'block';

  let opened = false, locked = false, isNear = false;

  let apBox = null, apCenter = null, apLocal = null;
  function layoutAperture(){
    const lw = frame.offsetWidth, lh = frame.offsetHeight;
    const r = frame.getBoundingClientRect();
    if (!lw || !lh || !r.width || !r.height) return;
    const iw = W1S1_AP.img[0], ih = W1S1_AP.img[1];
    const sL = Math.max(lw/iw, lh/ih);
    const oxL = (lw - iw*sL)/2, oyL = (lh - ih*sL)/2;
    const P = k => [oxL + W1S1_AP[k][0]*sL, oyL + W1S1_AP[k][1]*sL];
    const tl = P('tl'), tr = P('tr'), br = P('br'), bl = P('bl');
    const minX = Math.min(tl[0],bl[0]), maxX = Math.max(tr[0],br[0]);
    const minY = Math.min(tl[1],tr[1]), maxY = Math.max(bl[1],br[1]);
    doorway.style.left = minX + 'px';
    doorway.style.top = minY + 'px';
    doorway.style.width = (maxX-minX) + 'px';
    doorway.style.height = (maxY-minY) + 'px';
    const rel = p => (((p[0]-minX)/(maxX-minX))*100).toFixed(2)+'% '+(((p[1]-minY)/(maxY-minY))*100).toFixed(2)+'%';
    dark.dataset.shutPath = 'polygon('+rel(tl)+','+rel(tr)+','+rel(br)+','+rel(bl)+')';
    dark.dataset.openPath = 'polygon('+rel(tr)+','+rel(tr)+','+rel(br)+','+rel(br)+')';
    if (!opened) dark.style.clipPath = dark.dataset.shutPath;
    pool.style.left = ((maxX-minX)*0.5) + 'px';
    pool.style.top = ((maxY-minY)*0.985) + 'px';
    const sS = Math.max(r.width/iw, r.height/ih);
    const oxS = r.left + (r.width - iw*sS)/2, oyS = r.top + (r.height - ih*sS)/2;
    const xs = [W1S1_AP.tl[0], W1S1_AP.tr[0], W1S1_AP.br[0], W1S1_AP.bl[0]].map(v => oxS + v*sS);
    const ys = [W1S1_AP.tl[1], W1S1_AP.tr[1], W1S1_AP.br[1], W1S1_AP.bl[1]].map(v => oyS + v*sS);
    const sx0 = Math.min.apply(null, xs), sx1 = Math.max.apply(null, xs);
    const sy0 = Math.min.apply(null, ys), sy1 = Math.max.apply(null, ys);
    apBox = { x:sx0, y:sy0, w:sx1-sx0, h:sy1-sy0 };
    apCenter = [ (sx0+sx1)/2, (sy0+sy1)/2 ];
    apLocal = [ (minX+maxX)/2, (minY+maxY)/2 ];
  }
  layoutAperture();
  const onResize = () => layoutAperture();
  window.addEventListener('resize', onResize);

  function doorAnchor(){
    return [ window.innerWidth/2, window.innerHeight - 110 ];
  }
  function onApproach(e){
    if (opened) return;
    const a = doorAnchor();
    const d = Math.hypot(e.clientX - a[0], e.clientY - a[1]);
    const near = d < W1S1_EXT_NEAR;
    if (near !== isNear){
      isNear = near;
      extDoor.classList.toggle('near', near);
      ext.classList.toggle('anticipate', near);
      ext.style.cursor = near ? 'pointer' : 'default';
    }
  }
  window.addEventListener('mousemove', onApproach);

  function openSequence(){
    if (opened) return;
    opened = true;
    window.removeEventListener('mousemove', onApproach);
    ext.removeEventListener('click', onClick);
    ext.style.cursor = 'default';
    extDoor.classList.remove('near');
    ext.classList.remove('anticipate');
    ext.style.display = 'none';
    startReveal();
  }

  function startReveal(){
    pool.style.opacity = '0';
    dark.style.transition = 'none';
    dark.style.clipPath = dark.dataset.openPath;
    void dark.offsetHeight;

    setTimeout(()=>{
      SFX.play('w1s1_flicker');
      wSay('w1s1_call', W1S1_BED_HOLD_MS + 900);
      $('w1s1-panic').classList.add('on');
      $('w1s1-er').classList.add('on');
      startER();

      if (!REDUCED_MOTION && apBox){
        setTimeout(()=>{ apBox = { x:0, y:0, w:window.innerWidth, h:window.innerHeight }; }, 600);
      }
      
    }, 0);

    setTimeout(()=>{
      $('w1s1-er').classList.remove('on');
      setTimeout(stopER, 600);
      cueClear();
      flickerStep(); beginGazeSettle();
    }, W1S1_BED_HOLD_MS);
    setTimeout(()=>{
      $('w1s1-panic').classList.remove('on');
    }, W1S1_OPEN_MS + W1S1_HOSPITAL_HOLD_MS);
  }

  function onClick(){ if (isNear && !opened) openSequence(); }
  function onKey(e){
    if (e.key !== 'Enter' && e.key !== ' ') return;
    if (!opened){ e.preventDefault(); openSequence(); }
  }
  const invExt = invite(ext, w1s1, 'lean into the door', 900);
  later(900, ()=>{ if (!opened) cueBrief('move', 'Lean into the door.', ()=>{}); });
  const oldTip = w1s1.querySelector('#w1s1-tip');
  if (oldTip) oldTip.remove();
  const openWas = openSequence;
  openSequence = function(){ invExt.settle(); return openWas.apply(this, arguments); };
  ext.addEventListener('click', onClick);
  makeKeyActivatable(ext, 'Continue.');
  window.addEventListener('keydown', onKey);

  let flickerTimer = null, current = 'hospital', inAperture = false, keyHold = false;
  function setOn(key){
    current = key;
    Object.entries(layers).forEach(([k, el]) => el.classList.toggle('on', k === key));
  }
  const order = ['hospital','academy','kitchen'];
  let cyc = 0;
  function flickerStep(){
    if (locked) return;
    const key = order[cyc % 3];
    cyc++;
    setOn(key);
    let dur = REDUCED_MOTION ? 480 : W1S1_FLICKER_MS;
    if (key === 'academy' && (inAperture || keyHold)){
      dur = REDUCED_MOTION ? 900 : W1S1_ACADEMY_LINGER_MS;
    }
    flickerTimer = setTimeout(flickerStep, dur);
  }

  let dwell = 0, lastT = 0, settleRaf = null, mx = -9999, my = -9999, wasHolding = false;
  function onGaze(e){ mx = e.clientX; my = e.clientY; }
  function onKeyHold(e){
    if (e.key !== ' ') return;
    e.preventDefault();
    keyHold = (e.type === 'keydown');
  }
  function beginGazeSettle(){
    window.addEventListener('mousemove', onGaze);
    window.addEventListener('keydown', onKeyHold);
    window.addEventListener('keyup', onKeyHold);
    lastT = performance.now();
    let focusHinted = false;
    const focusHintT = later(2400, ()=>{ if (dwell < 0.12){ focusHinted = true; cueBrief('move', 'Rest your cursor on the doorway and wait.', ()=>{}); } });
    function tick(){
      if (locked){ settleRaf = null; return; }
      const now = performance.now();
      const dt = Math.min((now - lastT)/1000, 0.05);
      lastT = now;
      if (focusHinted && dwell > 0.12){ cueClear(); focusHinted = false; }
      inAperture = !!apBox && mx > apBox.x && mx < apBox.x + apBox.w && my > apBox.y && my < apBox.y + apBox.h;
      const userHolding = (inAperture || keyHold);
      const holding = userHolding && current === 'academy';
      if (wasHolding && !userHolding && dwell > 0.4){
        try { SFX.play('w2s4_boom2'); } catch(e){}
        dwell *= 0.35;
      }
      wasHolding = userHolding;
      if (holding) dwell = Math.min(1, dwell + dt/(W1S1_DWELL_MS/1000));
      else dwell = Math.max(0, dwell - dt*W1S1_DWELL_DECAY);
      if (dwell > 0.01 && (inAperture || keyHold)){
        ring.style.display = 'block';
        ring.style.left = (inAperture ? mx : (apCenter ? apCenter[0] : mx)) + 'px';
        ring.style.top = (inAperture ? my : (apCenter ? apCenter[1] : my)) + 'px';
        ringProgress.setAttribute('stroke-dashoffset', (125.66*(1-dwell)).toFixed(2));
      } else {
        ring.style.display = 'none';
      }
      if (dwell >= 1){ lockIn(); return; }
      settleRaf = requestAnimationFrame(tick);
    }
    settleRaf = requestAnimationFrame(tick);
  }

  function lockIn(){
    if (locked) return;
    locked = true;
    clearTimeout(flickerTimer);
    window.removeEventListener('mousemove', onGaze);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('keydown', onKeyHold);
    window.removeEventListener('keyup', onKeyHold);
    if (settleRaf){ cancelAnimationFrame(settleRaf); settleRaf = null; }
    ring.style.display = 'none';
    SFX.fade('w1s1_flicker', 0, 1600);
    setTimeout(()=>{ SFX.stop('w1s1_flicker'); }, 1700);

    layers.academy.classList.remove('on');
    layers.academy.classList.add('locked-in');
    layers.hospital.classList.remove('on');
    layers.hospital.classList.add('locked-out');
    layers.kitchen.classList.remove('on');
    layers.kitchen.classList.add('locked-out');

    cold.classList.remove('catch');
    cold.style.transition = 'opacity 1.2s ease';
    cold.style.opacity = '0';
    frame.style.transition = 'filter 1.4s ease';
    frame.style.filter = 'brightness(0.94) saturate(0.86) contrast(1.02) sepia(0.05)';

    setTimeout(()=>{
      hideSub();
      w1s1.classList.add('memfade-out');
      setTimeout(()=>{ startWave1Scene2(waveNum); }, 500);
      setTimeout(()=>{
        w1s1.style.display = 'none';
        w1s1.classList.remove('memfade-out');
        window.removeEventListener('resize', onResize);
        frame.style.filter = ''; frame.style.transition = ''; frame.style.transform = '';
      }, 1400);
    }, W1S1_HOLD_AFTER);
  }
}

const REVISIT_LINES = {
  1: '&ldquo;It&rsquo;s ok honey, we should try it again.&rdquo;',
  2: '&ldquo;Here you go, darling, you did it!&rdquo;',
  3: '&ldquo;Yes, I do.&rdquo;',
  4: '&ldquo;Mama, I will be a good dancer, right?&rdquo;',
  5: '&ldquo;Did you see the red ballet shoe?&rdquo;',
};
const revisitCount = {};

function revisitMirror(mirrorEl, waveNum){
  if (mirrorEl.classList.contains('revisiting')) return;
  const n = (revisitCount[waveNum] = (revisitCount[waveNum] || 0) + 1);
  if (n > 4) {
    mirrorEl.classList.add('spent');
    return;
  }
  const strength = Math.max(0, 1 - (n - 1) * 0.3);

  mirrorEl.classList.add('revisiting');
  mirrorEl.style.setProperty('--revisit', strength.toFixed(2));

  if (n <= 2 && REVISIT_LINES[waveNum]){
    setTimeout(()=> void 0, 700);
  }

  setTimeout(()=>{
    mirrorEl.classList.remove('revisiting');
    if (n >= 4) mirrorEl.classList.add('spent');
  }, 2800);
}

function showWaveEndChoice(waveNum){
  hideSub();
  Fatih.fadeActive(600);
  try{ SFX.cutAll ? SFX.cutAll() : null; }catch(e){}
  ['w1s2_wedding','w1s8_music','w1s5_applause','w1s9_chime','w1s6_crying','w1s7_heldhand','w2s2_wedding','w2s2_beep','w3s1_funeral','w4s1_phone','w5s3_funeral','w5s3_airport','descent_amb','floor_arrival','house_base']
    .forEach(k => { try{ SFX.fade(k, 0, 400); setTimeout(()=>{ try{ SFX.stop(k); }catch(e){} }, 450); }catch(e){} });
  if (window.Ambience) Ambience.silence(500);
  cueClear();
  runWaveCleanups();
  returnToHouse(waveNum);
  return;
}

function returnToHouse(waveNum, opts){
  const complete = !(opts && opts.complete === false);
  disarmWaveExit();
  window.SS_ACTIVE_WAVE = null;
  hideAllWaveScenes();

  const bb = $('breathbeat') || (function(){
    const d = document.createElement('div');
    d.id = 'breathbeat';
    document.body.appendChild(d);
    return d;
  })();
  if (!returnToHouse._held){
    returnToHouse._held = true;
    bb.classList.add('on');
    setTimeout(()=>{
      bb.classList.remove('on');
      returnToHouse(waveNum, opts);
    }, 420);
    return;
  }

  ['w1s9','waveStage','w1s1','w1s2','w1s2to3','w1s3','w1s3to4','w1s4','w1s5','w1s6','w1s7','w1s8'].forEach(id=>{
    const el = $(id); if (el){ el.style.display = 'none'; }
  });
  $('w1s3').classList.remove('revealed');
  if (typeof stopWave1Scene4 === 'function') stopWave1Scene4();
  if (typeof stopWave1Scene5 === 'function') stopWave1Scene5();
  if (typeof stopWave1Scene6 === 'function') stopWave1Scene6();
  if (typeof stopWave1Scene7 === 'function') stopWave1Scene7();
  if (typeof stopWave1Scene8 === 'function') stopWave1Scene8();
  if (typeof stopWave1Scene9 === 'function') stopWave1Scene9();
  runWaveCleanups();
  $('w1s3-whiteflash').classList.remove('flash');
  $('w1s3-blackhold').classList.remove('held');

  const mirrorEl = complete ? mirrors.find(m => m.dataset.wave === String(waveNum)) : null;
  if (complete){
    shatteredWaves.add(waveNum);
    later(1200, ()=>{
      mirrors.forEach(mm => {
        const wn = Number(mm.dataset.wave);
        if (!shatteredWaves.has(wn)) return;
        setMirrorArt(mm, 'shattered');
        mm.classList.add('shattered-warm');
      });
      applyLux();
    });
  }
  if (mirrorEl){
    if (!window.shatterOrder) window.shatterOrder = [];
    if (window.shatterOrder.indexOf(waveNum) === -1) window.shatterOrder.push(waveNum);
    const ord = window.shatterOrder.indexOf(waveNum);
    mirrorEl.style.setProperty('--seep', (1 - ord * 0.1125).toFixed(3));
    shatteredWaves.add(waveNum);
    setMirrorArt(mirrorEl, 'shattered');
    mirrorEl.classList.add('shattered-warm');
    attachResidues();
    applyLux();
  }

  document.body.classList.remove('nocursor');
  const bbEl = document.getElementById('breathbeat'); if (bbEl) bbEl.classList.remove('on');
  ['w1s3-whiteflash','w1s3-blackhold','w1s9-cover'].forEach(id=>{
    const el = document.getElementById(id);
    if (el){ el.className = el.className.replace(/\b(flash|held|on)\b/g,''); el.style.opacity=''; }
  });
  const sceneEl = $('scene'); if (sceneEl) sceneEl.style.display = 'none';
  const tcEl = $('transCanvas'); if (tcEl){ tcEl.style.display = 'none'; const tcx = tcEl.getContext && tcEl.getContext('2d'); if (tcx) tcx.clearRect(0,0,tcEl.width,tcEl.height); }
  if (window.Ambience) Ambience.to('house_base', { fadeIn: 3400, delay: 700 });
  let mBlk = document.getElementById('margaretBlackout');
  if (!mBlk){ mBlk = document.createElement('div'); mBlk.id = 'margaretBlackout'; document.body.appendChild(mBlk); }
  mBlk.style.cssText = 'position:fixed;inset:0;background:#000;z-index:90;opacity:1;transition:none;pointer-events:none';
  try { SFX.play('floor_arrival'); } catch(e){}
  setTimeout(()=>{ mBlk.style.transition = 'opacity 1.1s ease'; mBlk.style.opacity = '0'; }, 260);
  setTimeout(()=>{ try { SFX.stop('floor_arrival'); } catch(e){} if (mBlk && mBlk.parentNode) mBlk.remove(); }, 1600);
  mirrorHouse.style.display = 'block';
  mirrorHouse.style.transition = 'none';
  mirrorHouse.style.opacity = '0';
  requestAnimationFrame(()=>{
    mirrorHouse.style.transition = 'opacity 2.6s ease';
    mirrorHouse.style.opacity = '1';
  });
  mirrorHouse.style.zIndex = '';
  torch.style.display = 'block';
  houseActive = true;
  window.SS_WAVE_PAN = 0;
  { const hm2 = $('houseMarks'); if (hm2) hm2.classList.add('on'); }
  cueClear();
  { const ec2 = $('endingCue'); if (ec2) ec2.classList.remove('on');
    const eh2 = $('endingHint'); if (eh2){ eh2.textContent=''; eh2.classList.remove('on'); } }
  lastInteractionTime = performance.now();
  if (window.Preload) Preload.startRest();
  refreshMirrorA11y();
  discoverabilityLoop();

  if (shatteredWaves.size >= 5 && !endingStarted){
    houseActive = false;
    setTimeout(startEndingSequence, 1600);
  }
  returnToHouse._held = false;
}

function makeKeyActivatable(el, label){
  if (!el) return;
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
  if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
  if (label) el.setAttribute('aria-label', label);
  el.dataset.kb = '1';
}

function kbActivate(ev){
  if (ev.key !== 'Enter' && ev.key !== ' ' && ev.key !== 'Spacebar') return;
  const el = document.activeElement;
  if (!el || el.dataset.kb !== '1') return;
  if (el.getAttribute('aria-disabled') === 'true') return;
  ev.preventDefault();
  el.click();
}
window.addEventListener('keydown', kbActivate);

function bindAdvanceKey(fn){
  function onKey(ev){
    if (ev.key !== 'Enter' && ev.key !== ' ' && ev.key !== 'Spacebar') return;
    const a = document.activeElement;
    if (a && (a.dataset.kb === '1' || a.tagName === 'BUTTON' || a.tagName === 'A')) return;
    ev.preventDefault();
    fn();
  }
  window.addEventListener('keydown', onKey);
  addCleanup(()=> window.removeEventListener('keydown', onKey));
}

const MIRROR_NAMES = ['', 'first', 'second', 'third', 'fourth', 'fifth'];
function refreshMirrorA11y(){
  mirrors.forEach(m => {
    const wn = Number(m.dataset.wave);
    const seen = shatteredWaves.has(wn);
    makeKeyActivatable(m, 'The ' + (MIRROR_NAMES[wn] || wn) + ' mirror. ' +
      (seen ? 'This memory has been seen. Enter to look again.'
            : 'This memory has not been opened. Enter to enter it.'));
    m.setAttribute('aria-pressed', seen ? 'true' : 'false');
  });
}

const WAVE_EXIT_IDLE_MS = 5000;
let waveExitEl = null, waveExitVeil = null, waveExitTimer = 0;
let waveExitLastMove = 0, waveExitLeaving = false;

function buildWaveExit(){
  if (waveExitEl) return;
  const b = document.createElement('button');
  b.id = 'waveExit';
  b.type = 'button';
  b.setAttribute('aria-label', 'Leave this memory and return to the mirror house');
  b.innerHTML = '<i aria-hidden="true"></i><span>leave this memory</span>';
  b.addEventListener('click', abandonWave);
  document.body.appendChild(b);
  waveExitEl = b;

  const v = document.createElement('div');
  v.id = 'waveExitVeil';
  v.setAttribute('aria-hidden', 'true');
  document.body.appendChild(v);
  waveExitVeil = v;
}

function waveExitPoke(){
  waveExitLastMove = performance.now();
  if (waveExitEl) waveExitEl.classList.remove('on');
}

function waveExitTick(){
  if (!waveExitEl || waveExitLeaving) return;
  if (window.SS_ACTIVE_WAVE == null || endingStarted){
    waveExitEl.classList.remove('on');
    return;
  }
  const idle = performance.now() - waveExitLastMove;
  waveExitEl.classList.toggle('on', idle > WAVE_EXIT_IDLE_MS);
}

function waveExitKey(ev){
  if (ev.key !== 'Escape') return;
  if (window.SS_ACTIVE_WAVE == null || endingStarted) return;
  ev.preventDefault();
  abandonWave();
}

function armWaveExit(){
  buildWaveExit();
  waveExitLeaving = false;
  waveExitLastMove = performance.now();
  waveExitEl.classList.remove('on');
  waveExitEl.style.display = 'block';
  window.addEventListener('mousemove', waveExitPoke);
  window.addEventListener('keydown', waveExitKey);
  if (waveExitTimer) clearInterval(waveExitTimer);
  waveExitTimer = setInterval(waveExitTick, 400);
}

function disarmWaveExit(){
  window.removeEventListener('mousemove', waveExitPoke);
  window.removeEventListener('keydown', waveExitKey);
  if (waveExitTimer){ clearInterval(waveExitTimer); waveExitTimer = 0; }
  if (waveExitEl){ waveExitEl.classList.remove('on'); waveExitEl.style.display = 'none'; }
}

function abandonWave(){
  const wn = window.SS_ACTIVE_WAVE;
  if (wn == null || waveExitLeaving || endingStarted) return;
  waveExitLeaving = true;
  disarmWaveExit();
  try{ if (window.Fatih && Fatih.cutAll) Fatih.cutAll(); }catch(e){}
  try{ Object.keys(AUDIO).forEach(k => SFX.stop(k)); }catch(e){}
  hideSub();
  buildWaveExit();
  waveExitVeil.classList.add('on');
  setTimeout(()=>{
    runWaveCleanups();
    hideAllWaveScenes();
    returnToHouse(wn, { complete:false });
    setTimeout(()=>{
      waveExitVeil.classList.remove('on');
      waveExitLeaving = false;
    }, 120);
  }, 900);
}

function onScreen(el){
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) return false;
  return r.right > window.innerWidth * 0.06 && r.left < window.innerWidth * 0.94;
}

function discoverabilityLoop(){
  if (!houseActive) return;
  const idle = performance.now() - lastInteractionTime;
  const anyNear = mirrors.some(m => m.classList.contains('near'));
  if (idle > 12000 && !anyNear){
    const lit = mirrors.filter(m => m.classList.contains('lit'));
    const visible = lit.filter(onScreen);
    if (visible.length){
      if (window.houseEdgeUrge) houseEdgeUrge(false);
      const target = visible[Math.floor(Math.random()*visible.length)];
      target.classList.add('sweeping');
      setTimeout(()=>{ target.classList.remove('sweeping'); }, 1400);
    } else if (lit.length && window.houseEdgeUrge){
      houseEdgeUrge(true);
      setTimeout(()=>{ if (window.houseEdgeUrge) houseEdgeUrge(false); }, 5200);
    }
    lastInteractionTime = performance.now();
  }
  setTimeout(discoverabilityLoop, 1500);
}

const waveCleanups = [];
function addCleanup(fn){ waveCleanups.push(fn); }
function runWaveCleanups(){
  while (waveCleanups.length){ try{ waveCleanups.pop()(); }catch(e){} }
  document.querySelectorAll('.wscene').forEach(el => { el.style.display = 'none'; });

  for (let i = 1; i <= 9; i++){
    const el = document.getElementById('w1s' + i);
    if (el) el.style.display = 'none';
  }
  ['w1s2to3','w1s3to4','waveStage'].forEach(id => {
    const el = document.getElementById(id); if (el) el.style.display = 'none';
  });
  Object.keys(AUDIO).forEach(k => SFX.stop(k));

  hideSub();
}
const ALL_SCENE_IDS = (function(){
  const ids = [];
  for (let w = 1; w <= 5; w++) for (let i = 1; i <= 9; i++) ids.push('w' + w + 's' + i);
  return ids;
})();

function assertStylesLoaded(){
  const probe = document.querySelector('.wscene');
  if (!probe) return;
  const marker = getComputedStyle(document.documentElement).getPropertyValue('--margaret-red').trim();
  if (!marker){
    const w = document.createElement('div');
    w.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:99999;padding:14px 18px;'
      + 'background:#7a1d16;color:#fff;font:14px/1.5 system-ui,sans-serif;text-align:center;';
    w.textContent = 'margaret.css is missing from this folder. Copy it next to index.html and reload.';
    document.body.appendChild(w);
  }
}

function hideAllWaveScenes(except){
  const keep = Array.isArray(except) ? except : (except ? [except] : []);
  ALL_SCENE_IDS.forEach(id => {
    if (keep.indexOf(id) !== -1) return;
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  document.querySelectorAll('.wscene').forEach(el => {
    if (keep.indexOf(el.id) !== -1) return;
    el.style.display = 'none';
  });
}

const SCENE_KEY = /^(w\d+[sf]\d+)_/;
function cutForeignScenes(keep){
  const alive = keep.map(k => String(k));
  Object.keys(AUDIO).forEach(k => {
    const m = k.match(SCENE_KEY);
    if (m && alive.indexOf(m[1]) < 0) SFX.stop(k);
  });
}
function sceneShow(id, opts){
  const o = opts || {};
  cueLive = false;
  if (cueWatchTimer){ clearTimeout(cueWatchTimer); cueWatchTimer = null; }
  const prevCue = $('cuePanel');
  if (prevCue){
    prevCue.classList.remove('on','low-left','top-left','centred');
    prevCue.style.removeProperty('justify-content');
    prevCue.style.removeProperty('padding');
  }
  if (o.watchMs) cueScheduleWatch(o.watchMs);
  if (o.watchAt === 'left' && prevCue) prevCue.classList.add('low-left');
  const keep = o.with ? [id].concat(o.with) : [id];
  if (!o.keep) hideAllWaveScenes(o.with ? [id].concat(o.with) : id);
  cutForeignScenes(keep);
  const el = $(id);
  el.style.display = 'block';
  return el;
}
function later(ms, fn){ const t = setTimeout(fn, ms); addCleanup(()=>clearTimeout(t)); return t; }
function rafLoop(fn){
  let on = true, id;
  function loop(){ if (!on) return; fn(); id = requestAnimationFrame(loop); }
  id = requestAnimationFrame(loop);
  const stop = ()=>{ on = false; if (id) cancelAnimationFrame(id); };
  addCleanup(stop); return stop;
}
function rafFree(fn){
  let on = true, id;
  function loop(){ if (!on) return; fn(); id = requestAnimationFrame(loop); }
  id = requestAnimationFrame(loop);
  return ()=>{ on = false; if (id) cancelAnimationFrame(id); };
}

const EMBLEMS = {};
[1,2,3,4,5].forEach(w=>{

  const names = {1:'frag_shoe',2:'frag_ring',3:'frag_skidmark',4:'frag_doll',5:'frag_mirror'};
  EMBLEMS[w] = loadArt(names[w]);
});

const PETAL_IMG = loadArt('petal');
function petalReady(){ return PETAL_IMG.complete && PETAL_IMG.naturalWidth > 0; }

const BED_IMG = loadArt('hospital_bed');
function bedSprite(){
  if (!BED_IMG || !BED_IMG.complete || !BED_IMG.naturalWidth) return null;
  return BED_IMG;
}

(function(){
  let px = 0, py = 0, cx = 0, cy = 0;
  window.addEventListener('mousemove', e => {
    px = (e.clientX / innerWidth - .5) * 8;
    py = (e.clientY / innerHeight - .5) * 5;
  });
  (function parFrame(){
    cx += (px - cx) * .06; cy += (py - cy) * .06;
    document.documentElement.style.setProperty('--parx', cx.toFixed(2) + 'px');
    document.documentElement.style.setProperty('--pary', cy.toFixed(2) + 'px');
    requestAnimationFrame(parFrame);
  })();
})();

const FATIH_MAP = {
  'margaret_w2_alarm_01.wav':            'w2s1_alarm',
  'margaret_w2_wedding_music_01.wav':    'w2s2_wedding',
  'margaret_w2_weddingmarch_ghost_01.wav':'w2s2_wedding',
  'margaret_w2_beep_01.wav':             'w2s2_beep',
  'margaret_w2_boom_01.wav':             'w2s5_boom',
  'margaret_w2_boom_02.wav':             'w2s4_boom2',
  'margaret_w2_ambientloop_01.wav':      'w2s4_ambient',
  'margaret_w2_frag1_audio_01.wav':      'w2s4_babygirl',
  'margaret_w2_frag1_music_01.wav':      '',
  'margaret_w2_frag3_audio_01.wav':      'w2f3_phonebaby',
  'margaret_w2_yougodarling_01.wav':     'w2s4_reddoll',

  'margaret_w3_funeralmusic_01.wav':     'w3s1_funeral',
  'margaret_w3_vowloop_01.wav':          'w3s2_vowloop',
  'margaret_w3_vowloop_peter_01.wav':    'w3s2_vowpeter',
  'margaret_w2_babycry_01.wav':          'w2s4_babycry',
  'margaret_w2_phonebaby_01.wav':        'w2s4_phonebaby',
  'margaret_w1_ballet_music_01.wav':     'w1s2_ballet',
  'margaret_w3_snap_01.wav':             'w3s3_snap',
  'margaret_w5_videocall_01.wav':        'w5s5_videocall',
  'margaret_w4_vowfragment_01.wav':      'w4s6_vow',
  'margaret_w2_ringon_01.wav':           'w2s4_ringon',
  'margaret_w3_mama_01.wav':             'w3s3_mama',
  'margaret_w3_boom_02.wav':             'w3s3_boom',
  'margaret_w3_ballet_distant_01.wav':   'w3s5_ballet',

  'margaret_w4_phone_01.wav':            'w4s1_phone',
  'margaret_w4_teaching_music_01.wav':   'w4s2_music',
  'margaret_w4_ambulance_01.wav':        'w4s2_ambulance',
  'margaret_w4_crash_01.wav':            'w4s3_crash',
  'margaret_w4_applause_01.wav':         'w4s4_applause',

  'margaret_w5_vow_full_01.wav':         'w5s1_vow',
  'margaret_w5_chimes_reflect_01.wav':   'w5s1_petal',
  'margaret_w5_montage_mix_01.wav':      'w5s3_funeral',
  'margaret_w5_airport_01.wav':          'w5s3_airport',
  'margaret_w5_ambient_01.wav':          'w5s3_ambient',

  'margaret_w2_weddingmarch_01.wav':     'w2s2_wedding',
  'margaret_w2_frag2_audio_01.wav':      'w2f2_dollgirl',
  'margaret_w2_frag4_audio_01.wav':      'w2f4_icu',
  'w2s4_babygirl_vo':                    'w2s4_babygirl',
  'margaret_w2_frag5_audio_01.wav':      'w2f5_doll',
  'margaret_w3_falling_01.wav':          'w3s3_boom',
  'margaret_w3_xrayflip_01.wav':         'w3s3_xrayflip',
  'margaret_w2_vowlong_01.wav':          'w2s2_vowlong',
  'margaret_w4_crashdoll_01.wav':        'w4s5_crashdoll',
  'margaret_w4_congrats_01.wav':         'w4s6_congrats',
  'margaret_w4_noway_01.wav':            'w4s6_noway',
  'margaret_w2_chimes_01.wav':           'w2s2_wedding',
  'margaret_w2_ido_oldvoice_01.wav':     'w2s2_wedding',
  'margaret_w2_sorry_01.wav':            'w2s2_sorry',
  'margaret_w2_youdidit_01.wav':         'w2s4_reddoll',
  'margaret_w2_finalshatter_01.wav':     'mirror_shatter',
  'margaret_w2_babycry_01.wav':          'w2s4_babygirl',
  'margaret_w2_frag_phone_baby_01.wav':  'w2s4_babygirl',
  'margaret_w2_ringswell_01.wav':        'w2s5_boom',
  'margaret_w4_ballet_music_01.wav':     'w4s2_music',
  'margaret_w1_fall_01.wav':             'w3s3_boom',
  'margaret_w4_crash_clamour_01.wav':    'w4s3_crash',
  'margaret_w5_funeral_grief_01.wav':    'w5s3_funeral',
  'margaret_w5_airport_announce_01.wav': 'w5s3_airport',
  'margaret_ending_stage_01.wav':        'w4s4_applause',
  'margaret_w3_counting_01.wav':         'w3s1_funeral',
  'margaret_w4_ambulance_crying_01.wav': 'w4s2_ambulance',
  'margaret_w4_accident_distant_01.wav': 'w4s3_crash',
  'margaret_ending_redstorm_mix_01.wav': 'end_storm',
  'margaret_ending_lastdance_01.wav':    'end_lastdance',
};
const FatihLive = { active: new Set() };

const Fatih = {
  warm(name){
    const key = FATIH_MAP[name];
    if (key && SFX.warm) SFX.warm(key);
  },
  cue(name){
    const key = FATIH_MAP[name];
    if (!key) return null;
    if (FatihLive.pending && FatihLive.pending[key]){
      clearTimeout(FatihLive.pending[key]); delete FatihLive.pending[key];
    }
    const el = bindCues(SFX.play(key), key);
    if (AUDIO[key] && AUDIO[key].loop) FatihLive.active.add(key);

    if (name.indexOf('margaret_w2_sorry') === 0) SFX.stop('w2s2_wedding');
    return el;
  },
  stop(name){ const key = FATIH_MAP[name]; if (key){ SFX.stop(key); FatihLive.active.delete(key); } },
  fadeActive(ms){
    const d = ms || 900;
    FatihLive.pending = FatihLive.pending || {};
    FatihLive.active.forEach(k => {
      SFX.fade(k, 0, d);
      FatihLive.pending[k] = setTimeout(()=>{
        delete FatihLive.pending[k];
        try{ SFX.stop(k); }catch(e){}
      }, d + 60);
    });
    FatihLive.active.clear();
  },
  gain(track, v, ms){
    const key = FATIH_MAP[track] || track;
    if (AUDIO[key]) SFX.fade(key, v * (AUDIO[key].vol ?? 1), ms || 300);
  },
  cutAll(){
    FatihLive.active.forEach(k => SFX.stop(k));
    FatihLive.active.clear();
    Object.keys(AUDIO).forEach(k => SFX.stop(k));
  },
};

function primeMicStream(){
  const live = window.somewhereStillMicStream;
  if (live && live.getAudioTracks && live.getAudioTracks().some(t => t.readyState === 'live')){
    window.SS_MIC = 'ready';
    return;
  }
  if (window.__ssMicAsked) return;
  window.__ssMicAsked = true;
  if (!window.isSecureContext){
    window.SS_MIC = 'not a secure context (' + location.protocol + '//' + location.hostname + ')';
    return;
  }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    window.SS_MIC = 'mediaDevices unavailable';
    return;
  }
  window.SS_MIC = 'requesting';
  navigator.mediaDevices.getUserMedia({ audio:true })
    .then(st => { window.somewhereStillMicStream = st; window.SS_MIC = 'ready'; })
    .catch(e => { window.SS_MIC = 'denied: ' + ((e && e.name) || '?'); });
}

function tryMicListen(onTrigger, opts){
  const stream = window.somewhereStillMicStream || null;
  if (!stream){ primeMicStream(); return null; }
  const o = opts || {};
  const TH      = (o.threshold   != null) ? o.threshold   : 0.09;
  const REL     = TH * 0.5;
  const SUSTAIN = (o.sustain     != null) ? o.sustain     : 180;
  const REFRACT = (o.refractory  != null) ? o.refractory  : 700;
  const ONCE    = !!o.once;
  try{
    const AC = new (window.AudioContext || window.webkitAudioContext)();
    const srcNode = AC.createMediaStreamSource(stream);
    const an = AC.createAnalyser();
    an.fftSize = 512;
    an.smoothingTimeConstant = 0.4;
    srcNode.connect(an);
    const buf = new Uint8Array(an.fftSize);
    let overSince = 0, lastFire = -1e9, open = true, level = 0, id = 0, dead = false;
    function stop(){
      if (dead) return;
      dead = true;
      cancelAnimationFrame(id);
      try{ srcNode.disconnect(); }catch(e){}
      try{ AC.close(); }catch(e){}
    }
    function poll(t){
      if (dead) return;
      an.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++){ const d = (buf[i] - 128) / 128; sum += d * d; }
      const rms = Math.sqrt(sum / buf.length);
      level += (rms - level) * 0.35;
      if (open){
        if (level > TH){
          if (!overSince) overSince = t;
          if (t - overSince > SUSTAIN && t - lastFire > REFRACT){
            lastFire = t; overSince = 0; open = false;
            onTrigger('mic', level);
            if (ONCE){ stop(); return; }
          }
        } else overSince = 0;
      } else if (level < REL){
        open = true; overSince = 0;
      }
      id = requestAnimationFrame(poll);
    }
    id = requestAnimationFrame(poll);
    addCleanup(stop);
    return { stop:stop, fired:function(){ return lastFire > -1e8; }, level:function(){ return level; } };
  }catch(e){ return null; }
}

function makePetalField(canvas, opts){
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  let W = 0, H = 0;
  function resize(){ W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W*dpr; canvas.height = H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); }
  resize(); window.addEventListener('resize', resize);
  addCleanup(()=>window.removeEventListener('resize', resize));
  const REDS = [RED_THREAD,'#9e3227','#c24435','#a52d24'];
  const N = opts.count || (REDUCED_MOTION ? 50 : 110);
  const petals = [];
  const SIDES = !!opts.sides;
  const RISING = !!opts.rising;
  function sideX(side){
    return (side < 0 ? (0.02+Math.random()*0.22) : (0.76+Math.random()*0.22)) * (SIDES ? window.innerWidth : 1);
  }
  for (let i = 0; i < N; i++){
    const side = SIDES ? (Math.random()<.5 ? -1 : 1) : 0;
    petals.push({
      x: SIDES ? sideX(side) : Math.random()*window.innerWidth,
      y: RISING ? (0.55 + Math.random()*0.6)*window.innerHeight : Math.random()*window.innerHeight, side,
      drift: SIDES ? (side < 0 ? .25+Math.random()*.45 : -(.25+Math.random()*.45)) : 0,
      rot:Math.random()*6.283, spin:(Math.random()-.5)*.02,
      fall:.7+Math.random()*1.3, size:.6+Math.random()*.9,
      sway:.4+Math.random()*.9, phase:Math.random()*6.283,
      alpha:.7+Math.random()*.3, color:REDS[(Math.random()*REDS.length)|0] });
  }
  const st = { speed:1, visible:1 };
  rafLoop(()=>{
    if (canvas.offsetParent === null) return;
    ctx.clearRect(0,0,W,H);
    const shown = Math.max(1, Math.floor(petals.length * Math.min(1, Math.max(0, st.visible))));
    for (let pi = 0; pi < shown; pi++){
      const s = petals[pi];
      s.rot += s.spin*st.speed;
      s.y += (RISING ? -s.fall*0.9 : s.fall*1.1)*st.speed;
      s.x += (Math.sin(s.y*.01+s.phase)*s.sway + s.drift)*st.speed;
      if (RISING && s.y < -30){ s.y = H+20; s.x = Math.random()*W; }
      if (!RISING && s.y > H+30){ s.y = -20;
        s.x = s.side ? (s.side < 0 ? (0.02+Math.random()*0.22) : (0.76+Math.random()*0.22))*W : Math.random()*W; }
      ctx.save(); ctx.translate(s.x,s.y); ctx.rotate(s.rot); ctx.scale(s.size,s.size);
      ctx.globalAlpha = s.alpha*(opts.alpha||1)*redVitality();
      if (petalReady()){
        ctx.drawImage(PETAL_IMG, -13, -13, 26, 26*PETAL_IMG.naturalHeight/PETAL_IMG.naturalWidth);
      } else {
        ctx.fillStyle = s.color;
        ctx.beginPath(); ctx.moveTo(0,-11);
        ctx.bezierCurveTo(9,-6,9,7,0,13); ctx.bezierCurveTo(-9,7,-9,-6,0,-11);
        ctx.fill();
      }
      ctx.restore();
    }
  });
  return st;
}

function invite(el, sceneEl, text, delay){
  if (!el) return { settle(){} };
  if (getComputedStyle(el).position !== 'static') el.classList.add('no-reposition');
  el.classList.add('invite', 'invite-cursor');
  const lit = later(700, ()=>{
    const r = el.getBoundingClientRect();
    if (r.width > 340 || r.height > 340) return;
    el.classList.add('lit');
  });

  return {
    settle(){
      el.classList.remove('lit');
      el.classList.add('settled');
    }
  };
}

function startWave2Scene1(waveNum){
  const s = sceneShow('w2s1');
  const frame = $('w2s1-doorframe'), door = $('w2s1-push');
  if (frame) frame.style.display = 'none';

  let clicked = false;
  door.style.display = 'block'; door.classList.remove('impact', 'opening');
  door.style.transition = 'none'; door.style.opacity = '0'; door.style.filter = '';
  void door.offsetWidth;
  requestAnimationFrame(()=>{ door.style.transition = 'opacity 1.4s ease'; door.style.opacity = '1'; });
  Fatih.cue('margaret_w2_alarm_01.wav', 'ambulance alarm from the first frame, over the blood-stained dress');
  later(1800, ()=>{ if (!clicked) cueBrief('click', 'Click the door to push it open.', ()=>{}); });

  function onClick(){
    if (clicked) return;
    clicked = true;
    door.removeEventListener('click', onClick);
    door.style.transition = '';
    door.classList.add('opening');
    Fatih.warm('margaret_w2_vowlong_01.wav');
    Fatih.warm('margaret_w2_weddingmarch_01.wav');
    later(700, ()=> Fatih.fadeActive(500));
    later(1050, ()=> w2RedMatchCut(waveNum, s));
  }
  door.addEventListener('click', onClick);
  makeKeyActivatable(door, 'The door. Enter to push it open.');
  addCleanup(()=> door.removeEventListener('click', onClick));
}

function w2RedMatchCut(waveNum, s1){
  const scene = $('margaret-scene');
  let bloom = $('w2s1-bloom');
  if (!bloom){ bloom = document.createElement('div'); bloom.id = 'w2s1-bloom'; scene.appendChild(bloom); }
  bloom.style.cssText = 'position:absolute;inset:0;z-index:48;pointer-events:none;'
    + 'background:radial-gradient(circle at 50% 42%, rgba(178,58,46,.97) 0%, rgba(150,40,32,.55) 32%, rgba(120,30,24,0) 64%);'
    + 'transform-origin:50% 42%;transform:' + (REDUCED_MOTION ? 'none' : 'scale(.42)') + ';opacity:0;transition:none;';
  requestAnimationFrame(()=> requestAnimationFrame(()=>{
    bloom.style.transition = REDUCED_MOTION ? 'opacity .62s ease' : 'opacity .70s ease-out, transform .70s cubic-bezier(.5,0,.32,1)';
    bloom.style.opacity = '1';
    if (!REDUCED_MOTION) bloom.style.transform = 'scale(3.5)';
  }));
  setTimeout(()=>{
    if (s1) s1.style.display = 'none';
    startWave2Scene2(waveNum);
  }, 720);
  setTimeout(()=>{ bloom.style.transition = 'opacity 1.35s ease-in'; bloom.style.opacity = '0'; }, 1480);
}

function startWave2Scene2(waveNum){
  later(300, ()=> cueWatch(9200));
  const s = sceneShow('w2s2');
  s.className = 'wscene';
  s.classList.add('w2-dark');
  void s.offsetWidth;

  const altar   = $('w2s2-altar');
  const mgret   = $('w2s2-margaret');
  const peter   = $('w2s2-peter');
  const petalsC = $('w2s2-petals');
  const ido     = $('w2s2-ido');
  const hint    = $('w2s2-hint');

  peter.classList.remove('on');
  [mgret, peter].forEach(el => {
    if (!el) return;
    el.style.transition = 'none';
    el.style.transform = 'scale(.62) translateY(4%)';
  });
  ido.classList.remove('on');
  hint.style.transition = 'none';
  hint.style.opacity = '0';
  void hint.offsetWidth;
  hint.style.transition = 'opacity .8s ease';
  hint.innerHTML = 'press and hold i &middot; d &middot; o';
  later(1020, ()=> peter.classList.add('on'));
  peter.classList.add('clear');

  let answered = false, thrown = false, dollyStarted = false;

  const VOW_FULL = '&ldquo;Do you, Margaret, take Peter to be your lawfully wedded husband, to have and to hold, from this day forward, for better or for worse, for richer or for poorer, in sickness and in health, to love and to cherish, until death do you part?&rdquo;';

  Fatih.cue('margaret_w2_weddingmarch_01.wav', 'wedding music, upfront and clear');
  const vow = Fatih.cue('margaret_w2_vowlong_01.wav', 'the officiant, one file, seeked by the scene');

  later(700, ()=> s.classList.add('lit'));

  function beginDolly(){
    if (dollyStarted) return; dollyStarted = true;
    s.classList.add('dolly');
    [mgret, peter].forEach(el => {
      if (!el) return;
      el.style.transition = 'transform 9s cubic-bezier(.32,.02,.28,1)';
      el.style.transform = 'scale(1) translateY(0)';
    });
  }

  function throwPetals(){
    if (thrown) return; thrown = true;
    petalStorm();
  }

  function openVow(){
    if (answered || openVow._armed) return;
    openVow._armed = true;
    hint.classList.remove('on');
    later(80, ()=>{
      if (answered) return;
      showSub('Pastor', '&ldquo;until death do you part?&rdquo;', 2100);
    });
    later(2200, ()=>{
      if (answered) return;
      cueBrief('type', 'Press and hold I, then D, then O.', ()=>{});
    });
    later(2000, ()=>{
      if (answered) return;
      hideSub();
      s.classList.add('frozen-time');
      ido.classList.add('on');
      hint.style.opacity = '1';
      Resist.arm(0.55);
    });
  }

  const Resist = {
    on:false, load:0,
    arm(k){ this.on = true; this.k = k; this.load = 0; },
    release(){ this.on = false; this.load = 0; },
    push(active, dt){
      if (!this.on) return 0;
      const k = this.k || 0.55;
      this.load = active ? Math.min(1, this.load + dt / 900) : Math.max(0, this.load - dt / 620);
      return (1 - k) * (0.55 + 0.45 * Math.sin(performance.now() / 780)) * this.load;
    }
  };

  function petalStorm(){
    if (!petalsC || !petalReady()) return;
    const ctx = petalsC.getContext('2d');
    let W = 0, H = 0;
    function size(){
      const r = petalsC.getBoundingClientRect();
      W = petalsC.width  = Math.max(2, r.width);
      H = petalsC.height = Math.max(2, r.height);
    }
    size();
    const onResize = ()=> size();
    window.addEventListener('resize', onResize);
    let spin = 0, lastMX = null;
    function onMove(e){
      if (lastMX !== null) spin += (e.clientX - lastMX) * 0.0016;
      lastMX = e.clientX;
    }
    window.addEventListener('mousemove', onMove);
    addCleanup(()=>{
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMove);
    });

    const P = [], G = 0.032, MAX = REDUCED_MOTION ? 150 : 430;
    let frozen = false, emit = 0;
    function born(){
      P.push({
        x: Math.random() * W,
        y: -20 - Math.random() * H * 0.35,
        vx: (Math.random() - 0.5) * 0.9,
        vy: 0.5 + Math.random() * 1.1,
        a:  Math.random() * 6.28,
        va: (Math.random() - 0.5) * 0.035,
        r:  4 + Math.random() * 5,
        o:  0.55 + Math.random() * 0.4
      });
    }
    rafLoop(()=>{
      if (frozen) return;
      ctx.clearRect(0, 0, W, H);
      if (P.length < MAX){ const n = Math.min(4, MAX - P.length); for (let b = 0; b < n; b++) born(); }
      for (let i = P.length - 1; i >= 0; i--){
        const p = P[i];
        p.vy += G; p.vx *= 0.995;
        p.x += p.vx + Math.sin((p.y + p.a * 40) / 90) * 0.5;
        p.y += p.vy;
        p.a += p.va + spin;
        if (p.y > H + 40){ P.splice(i, 1); continue; }
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.a);
        ctx.globalAlpha = p.o;
        const pw = p.r * 3.4;
        ctx.drawImage(PETAL_IMG, -pw/2, -pw/2, pw, pw * PETAL_IMG.naturalHeight / PETAL_IMG.naturalWidth);
        ctx.restore();
      }
      spin *= 0.94;
    });
    petalStorm.freeze = ()=>{ frozen = true; };
  }

  const idoKeys = Array.from(ido.querySelectorAll('.w2key'));
  const idoFill = idoKeys.map(k => k.querySelector('.fill'));
  const idoDown = {};
  let ki = 0, idoRaf = 0, idoLast = 0;
  idoKeys.forEach(k => { k.classList.remove('done','armed'); });
  idoFill.forEach(f => { if (f) f.style.transform = 'scaleX(0)'; });
  const fill = idoKeys.map(()=> 0);

  function idoKd(e){ if (!answered && Resist.on){ stopPrompt(); idoDown[e.code] = true; } }
  function idoKu(e){ idoDown[e.code] = false; }
  function idoPd(){ if (!answered && Resist.on){ stopPrompt(); idoDown.POINTER = true; } }
  function idoPu(){ idoDown.POINTER = false; }
  window.addEventListener('keydown', idoKd);
  window.addEventListener('keyup', idoKu);
  window.addEventListener('pointerdown', idoPd);
  window.addEventListener('pointerup', idoPu);
  window.addEventListener('pointercancel', idoPu);
  addCleanup(()=>{
    window.removeEventListener('keydown', idoKd);
    window.removeEventListener('keyup', idoKu);
    window.removeEventListener('pointerdown', idoPd);
    window.removeEventListener('pointerup', idoPu);
    window.removeEventListener('pointercancel', idoPu);
    if (idoRaf) cancelAnimationFrame(idoRaf);
  });

  (function idoLoop(now){
    idoRaf = requestAnimationFrame(idoLoop);
    const dt = Math.min(48, now - (idoLast || now)); idoLast = now;
    if (answered || !Resist.on || ki >= idoKeys.length) return;
    const want = idoKeys[ki].dataset.key;
    const held = !!idoDown[want] || !!idoDown.POINTER;
    idoKeys[ki].classList.toggle('armed', held);
    const push = Resist.push(held, dt);
    fill[ki] = held ? Math.min(1, fill[ki] + dt / 2100 * (0.45 + push))
                    : Math.max(0, fill[ki] - dt / 1500);
    if (idoFill[ki]) idoFill[ki].style.transform = 'scaleX(' + fill[ki].toFixed(3) + ')';
    if (fill[ki] >= 1){
      idoKeys[ki].classList.add('done');
      idoKeys[ki].classList.remove('armed');
      ki++;
      if (ki >= idoKeys.length) onVow('hold');
    }
  })(performance.now());

  let fired = false, beat = 0, promptTimer = null;
  function seek(t){ try{ vow.currentTime = t; }catch(e){} }
  function stopPrompt(){ if (promptTimer){ clearTimeout(promptTimer); promptTimer = null; } }
  function armPrompt(){
    stopPrompt();
    promptTimer = setTimeout(()=>{
      if (answered) return;
      beat = 2; seek(PASTOR.askIn); vow.play();
    }, PASTOR.promptMs);
  }
  function armFallback(ms){
    later(ms, ()=>{ if (!fired){ fired = true; beginDolly(); } });
    later(ms + 11200, openVow);
  }

  if (vow && typeof vow.addEventListener === 'function'){
    let ready = false;
    beat = 1;
    seek(PASTOR.askIn);
    vow.addEventListener('playing', ()=>{ ready = true; fired = true; beginDolly(); });
    vow.addEventListener('timeupdate', ()=>{
      const t = vow.currentTime;
      if (beat === 3){
        if (t >= PASTOR.vowOut){ vow.pause(); sorryCut(); }
        return;
      }
      if (answered) return;
      if (beat === 1){
        if (t >= PASTOR.askOut){ vow.pause(); openVow(); armPrompt(); }
        return;
      }
      if (beat === 2 && t >= PASTOR.shortOut){ vow.pause(); armPrompt(); }
    });
    vow.addEventListener('error', ()=> armFallback(2400));
    later(2600, ()=>{ if (!ready) armFallback(0); });
  } else {
    armFallback(2400);
  }

  function onVow(via){
    if (answered) return; answered = true;
    stopPrompt();
    Resist.release();
    ido.classList.remove('on');
    hint.style.opacity = '0';
    throwPetals();
    bindCues(SFX.play('w3s2_vowloop'), 'w3s2_vowloop');
    later(300, ()=> SFX.play('w3s2_vowpeter'));
    later(1200, ()=>{
      if (vow && typeof vow.play === 'function'){
        beat = 3;
        seek(PASTOR.vowIn);
        vow.play();
        later(9000, ()=>{ if (beat === 3){ beat = 4; vow.pause(); sorryCut(); } });
      } else later(600, sorryCut);
    });
  }

  function sorryCut(){
    if (sorryCut._ran) return; sorryCut._ran = true;
    beat = 4;
    later(900, toScene3);
  }

  function toScene3(){
    if (toScene3._ran) return; toScene3._ran = true;
    if (petalStorm.freeze) petalStorm.freeze();
    Fatih.fadeActive(60);
    s.style.display = 'none';
    startWave2Scene3(waveNum);
  }

}
function startWave2Scene3(waveNum){
  later(1200, ()=> cueWatch(12800));
  SFX.play('w2s3_ringbreak');
  const s = sceneShow('w2s3', { watchMs: 9000 });
  Fatih.fadeActive(900);
  try{ SFX.stop('w2s2_vowlong'); }catch(e){}
  hideSub();
  const blur = $('w2s3-peter'), clear = $('w2s3-peterclear');
  if (blur){ blur.classList.remove('on','clear'); }
  if (clear) clear.classList.remove('on');
  void s.offsetWidth;

  Fatih.cue('silence', 'no music at all in this scene, only room tone as his face comes back');
  later(600, ()=>{ if (blur) blur.classList.add('on'); });
  later(1400, ()=>{
    const sorry = bindCues(SFX.play('w2s2_sorry'), 'w2s2_sorry');
    const reveal = ()=>{
      if (blur) blur.classList.add('clear');
      later(1600, ()=>{ if (clear) clear.classList.add('on'); });
    };
    const leave = ()=>{ s.style.display = 'none'; startWave2Scene4(waveNum); };
    if (sorry && typeof sorry.addEventListener === 'function'){
      sorry.addEventListener('ended', reveal, { once:true });
      later(5200, reveal);
      const arm = ()=>{
        const d = sorry.duration;
        const ms = (d && isFinite(d) && d > 0.4) ? Math.round(d * 1000) : 5200;
        later(ms + 4200, leave);
      };
      if (sorry.readyState >= 1) arm();
      else {
        sorry.addEventListener('loadedmetadata', arm, { once:true });
        sorry.addEventListener('error', ()=>{ reveal(); later(2400, leave); }, { once:true });
        later(14000, leave);
      }
    } else { later(2200, reveal); later(8000, leave); }
  });
}

function startWave2Scene4(waveNum){
  later(1400, ()=> cueBrief('move', 'Move the ring into the palm of her hand.', ()=>{}));
  const s = sceneShow('w2s4');
  Fatih.fadeActive(900);
  const beep = Fatih.cue('margaret_w2_beep_01.wav', 'the heart monitor is already going when the scene opens');
  if (beep) beep.volume = 0;
  if (!SFX.isPlaying('w2s2_beep')) SFX.play('w2s2_beep', { vol: 0 });
  SFX.fade('w2s2_beep', 0.35, 1800);
  s.classList.remove('done');
  const stage = $('w2s4-stage'), hand = $('w2s4-hand'), boxEl = $('w2s4-box'),
        ring = $('w2s4-ring'), warm = $('w2s4-warm'), hint = $('w2s4-hint');
  if (!stage || !ring || !hand) return;
  if (hint) hint.textContent = '';
  if (boxEl) boxEl.style.display = 'none';

  let rig = $('w2s4-rig');
  if (!rig){
    rig = document.createElement('div');
    rig.id = 'w2s4-rig';
    rig.innerHTML = '<i class="rig-key"></i><i class="rig-drift"></i><i class="rig-red"></i><i class="rig-floor"></i>';
    stage.insertBefore(rig, stage.firstChild);
  }
  rig.classList.remove('warmed');

  const TIP    = { x: 55.2, y: 17.0 };
  const SEAT   = { x: 52.3, y: 33.8 };
  const SEAT_SCALE = 0.42;
  const FOLLOW = 0.085;
  const RETURN = 0.055;
  const GRAB_R = 1.9;
  const SEAT_R = 0.62;
  const SEAT_HOLD = 420;

  ring.className = 'fit-contain';
  ring.style.opacity = '0';
  ring.style.transition = '';

  let done = false, raf = 0, lastT = 0, live = false;
  let dragging = false, pointer = null, keyPush = false;
  let rx = null, ry = null, nearMs = 0;

  function anchor(f){
    const h = hand.getBoundingClientRect(), b = stage.getBoundingClientRect();
    return { x: h.left - b.left + h.width * f.x / 100, y: h.top - b.top + h.height * f.y / 100 };
  }
  function toStage(e){
    const b = stage.getBoundingClientRect();
    return { x: e.clientX - b.left, y: e.clientY - b.top };
  }
  function seatProx(){
    const z = anchor(SEAT);
    const unit = Math.max(1, ring.offsetWidth);
    const d = Math.hypot(rx - z.x, ry - z.y) / unit;
    return Math.max(0, Math.min(1, 1 - d / 3.2));
  }
  function place(now){
    const prox = seatProx();
    const tremor = (0.35 + prox * 1.65) * (stage.clientHeight * 0.006);
    const ox = Math.sin(now / 430) * tremor + Math.sin(now / 137) * tremor * 0.35;
    const oy = Math.cos(now / 610) * tremor * 0.7;
    const sc = 1 - (1 - SEAT_SCALE) * prox;
    ring.style.transform = 'translate(' + (rx + ox - ring.offsetWidth / 2).toFixed(1) + 'px,'
      + (ry + oy - ring.offsetHeight / 2).toFixed(1) + 'px) scale(' + sc.toFixed(3) + ') rotate('
      + (ox * 1.4).toFixed(1) + 'deg)';
    if (warm){
      warm.style.setProperty('--wx', (100 * rx / Math.max(1, stage.clientWidth)).toFixed(1) + '%');
      warm.style.setProperty('--wy', (100 * ry / Math.max(1, stage.clientHeight)).toFixed(1) + '%');
      warm.style.opacity = (0.08 + prox * 0.66).toFixed(2);
    }
  }
  function tick(now){
    raf = requestAnimationFrame(tick);
    const dt = Math.min(48, now - (lastT || now)); lastT = now;
    if (rx === null){ const a = anchor(TIP); rx = a.x; ry = a.y; }
    if (!done){
      let tx, ty, k;
      if (dragging && pointer){ tx = pointer.x; ty = pointer.y; k = FOLLOW; }
      else if (keyPush){ const z = anchor(SEAT); tx = z.x; ty = z.y; k = FOLLOW * 0.55; }
      else { const a = anchor(TIP); tx = a.x; ty = a.y; k = RETURN; }
      const lag = 1 - Math.pow(1 - k, dt / 16.7);
      rx += (tx - rx) * lag;
      ry += (ty - ry) * lag;
      if (live){
        const z = anchor(SEAT);
        const unit = Math.max(1, ring.offsetWidth);
        const near = Math.hypot(rx - z.x, ry - z.y) / unit < SEAT_R;
        if (near && (dragging || keyPush)){
          nearMs += dt;
          if (nearMs >= SEAT_HOLD) seat();
        } else nearMs = 0;
      }
    }
    place(now);
  }
  raf = requestAnimationFrame(tick);

  function grab(e){
    if (done || !live) return;
    const q = toStage(e);
    const unit = Math.max(1, ring.offsetWidth);
    if (Math.hypot(q.x - rx, q.y - ry) / unit > GRAB_R) return;
    if (e && e.preventDefault) e.preventDefault();
    dragging = true; pointer = q;
    inv.settle();
    ring.classList.add('holding');
    s.classList.add('pressing');
  }
  function move(e){
    if (!dragging || done) return;
    pointer = toStage(e);
  }
  function release(){
    if (done) return;
    dragging = false; keyPush = false; pointer = null; nearMs = 0;
    ring.classList.remove('holding');
    s.classList.remove('pressing');
  }
  function keyDown(e){
    if (done || !live) return;
    if (e.key === ' ' || e.key === 'Enter'){
      e.preventDefault();
      if (keyPush) return;
      keyPush = true;
      inv.settle();
      ring.classList.add('holding');
      s.classList.add('pressing');
    }
  }
  function keyUp(e){ if (e.key === ' ' || e.key === 'Enter') release(); }

  stage.addEventListener('pointerdown', grab);
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  window.addEventListener('keydown', keyDown);
  window.addEventListener('keyup', keyUp);

  function seat(){
    if (done) return;
    done = true; dragging = false; keyPush = false; pointer = null;
    const z = anchor(SEAT); rx = z.x; ry = z.y;
    ring.classList.remove('holding');
    ring.classList.add('seated');
    s.classList.remove('pressing');
    s.classList.add('done');
    rig.classList.add('warmed');
    if (hint){ hint.textContent = ''; hint.classList.remove('on'); }
    Fatih.cue('margaret_w2_ringon_01.wav', 'the small sound of a ring going home');
    SFX.play('w2s4_ringon');
    SFX.fade('w2s2_beep', 0, 2400);
    later(2500, ()=>{ try{ SFX.stop('w2s2_beep'); }catch(e){} });
    later(3600, ()=>{ s.style.display = 'none'; startWave2Scene5(waveNum); });
  }

  const inv = invite(ring, s, 'take the ring to her palm', 2600);
  if (hint){
    cueBrief('move', 'Move the ring into the palm of her hand.', ()=>{});
    later(1200, ()=> hint.classList.add('on'));
    addCleanup(()=> hint.classList.remove('on'));
  }

  later(400, ()=>{ if (stage) stage.classList.add('on'); });
  later(1600, ()=>{
    ring.style.transition = 'opacity 1.4s var(--e-veil)';
    ring.style.opacity = '1';
    live = true;
  });

  addCleanup(()=>{
    cancelAnimationFrame(raf);
    stage.removeEventListener('pointerdown', grab);
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', release);
    window.removeEventListener('pointercancel', release);
    window.removeEventListener('keydown', keyDown);
    window.removeEventListener('keyup', keyUp);
  });
  later(30000, ()=>{ if (!done) seat(); });
}

function startWave2Scene5(waveNum){
  later(1200, ()=> cueWatch(8800));
  const s = sceneShow('w2s5');
  s.style.background = '';
  Fatih.fadeActive(800);
  const ring = $('w2s5-ring'), hint = $('w2s5-hint');
  const shards = Array.from(document.querySelectorAll('.w2shard'));
  if (ring){ ring.classList.remove('on','gone'); }
  shards.forEach(sh => { sh.classList.remove('flying','near','taken'); sh.style.transform = 'scale(1.35)'; });
  if (hint) hint.textContent = '';
  void s.offsetWidth;

  const glassBody = 'linear-gradient(128deg, rgba(236,242,245,.40) 0%, rgba(201,211,218,.20) 34%, '
    + 'rgba(122,140,152,.30) 58%, rgba(236,242,245,.46) 82%, rgba(160,176,186,.24) 100%)';
  const faceOf = sh => sh.querySelector('.w2shard-face') || sh;
  const paintShards = src => shards.forEach(sh => {
    const f = faceOf(sh);
    f.style.backgroundImage = 'url("' + src + '"), ' + glassBody;
    f.style.backgroundSize = 'contain, cover';
  });
  resolveImage(IMG.w2_ring, paintShards, ()=>{
    shards.forEach(sh => {
      const f = faceOf(sh);
      f.style.backgroundImage = glassBody;
      f.style.backgroundSize = 'cover';
    });
  });

  later(300, ()=>{ if (ring) ring.classList.add('on'); });
  Fatih.cue('margaret_w2_ringswell_01.wav', 'a rising tone as the ring swells, then the break');

  later(8200, ()=>{
    if (ring) ring.classList.add('gone');
    Fatih.cue('margaret_w2_boom_01.wav', 'the ring breaking, sharp and final');
    SFX.fade('w2s2_beep', 0, 900);
    later(950, ()=>{ try{ SFX.stop('w2s2_beep'); }catch(e){} });
    const spread = [[-62,-30],[56,-36],[64,28],[2,52],[-64,20]];
    shards.forEach((sh,i)=>{
      sh.classList.add('flying');
      const [dx,dy] = spread[i] || [0,0];
      sh.style.transform = 'translate(' + dx + '%,' + dy + '%) scale(.62) rotate(' + ((i-2)*7) + 'deg)';
    });
  });

  later(10000, ()=>{ startWave2Scene6(waveNum); });
}

function shatterElement(el, done){
  const host = el.parentElement || el;
  const art = el.querySelector('.artlayer');
  const bg = art ? getComputedStyle(art).backgroundImage : '';
  const layer = document.createElement('div');
  layer.className = 'shatterlayer';
  const N = 14;
  for (let i = 0; i < N; i++){
    const p = document.createElement('div');
    p.className = 'shatterpiece';
    const ax = (Math.random()*100).toFixed(1), ay = (Math.random()*100).toFixed(1);
    const bx = (Math.random()*100).toFixed(1), by = (Math.random()*100).toFixed(1);
    const cx = (Math.random()*100).toFixed(1), cy = (Math.random()*100).toFixed(1);
    const poly = 'polygon(' + ax + '% ' + ay + '%, ' + bx + '% ' + by + '%, ' + cx + '% ' + cy + '%)';
    p.style.clipPath = poly; p.style.webkitClipPath = poly;
    if (bg && bg !== 'none') p.style.backgroundImage = bg;
    layer.appendChild(p);
    const dx = (Math.random()-0.5)*220, dy = (Math.random()-0.5)*200 + 60;
    const rot = (Math.random()-0.5)*90;
    requestAnimationFrame(()=>{
      p.style.transition = 'transform 1.7s cubic-bezier(.25,.6,.35,1), opacity 1.7s ease';
      p.style.transform = 'translate(' + dx.toFixed(0) + '%,' + dy.toFixed(0) + '%) rotate(' + rot.toFixed(0) + 'deg) scale(.35)';
      p.style.opacity = '0';
    });
  }
  host.appendChild(layer);
  if (art) art.style.opacity = '0';
  setTimeout(()=>{ try{ layer.remove(); }catch(e){} if (typeof done === 'function') done(); }, 1750);
}

function startWave2Scene6(waveNum){
  const s6 = sceneShow('w2s6', { with: ['w2s5'] });
  s6.style.background = 'transparent';
  const shards = Array.from(document.querySelectorAll('.w2shard'));
  const s5 = $('w2s5');
  if (s5){ s5.style.display = 'block'; s5.style.background = ''; }
  const rw = $('w2s5-ring'); if (rw) rw.style.display = 'none';
  shards.forEach(sh => {
    sh.classList.add('flying');
    sh.classList.remove('taken');
    sh.style.opacity = '1';
    const f = sh.querySelector('.w2shard-face');
    if (f) f.style.pointerEvents = 'auto';
  });
  const hint = $('w2s6-hint') || $('w2s5-hint');
  const h5 = $('w2s5-hint');
  if (h5 && h5 !== hint){ h5.textContent = ''; h5.classList.remove('on'); }
  const taken = new Set();
  let open = null;

  function closeFrag(){
    if (!open) return;
    Fatih.fadeActive(600);
    const el = $('w2frag-' + open);
    if (el){
      el.classList.remove('on','solved');
      const tip = el.querySelector('.w2frag-tip');
      if (tip) tip.classList.remove('on','faded');
    }
    open = null;
    cueClear();
    setShardHint();
  }

  function setShardHint(){
    const left = shards.length - taken.size;
    if (left <= 0){ cueClear(); return; }
    cueBrief('click', left === 1
      ? 'One piece is still red. Click it.'
      : 'Click a piece to go inside it.', ()=>{});
  }

  const FRAG_WORDS = { 1:['watch', ''] };
  function openFrag(n){
    if (open || taken.has(n)) return;
    cueClear();
    const el = $('w2frag-' + n);
    if (!el || !FRAG_SCENES[n]) return;
    open = n;
    if (hint){ hint.textContent = ''; hint.classList.remove('on'); }
    el.classList.remove('solved');
    const art = el.querySelector('.artlayer');
    if (art){ art.style.transform = ''; art.style.filter = ''; art.style.opacity = ''; }
    el.classList.add('on');
    void el.offsetWidth;
    const fw = FRAG_WORDS[n];
    if (fw && fw[0] === 'watch') cueWatch(10600);
    else cueClear();
    let fragDone = false;
    const settleFrag = ()=>{
      if (fragDone) return; fragDone = true;
      cueClear();
      taken.add(n);
      const sh = shards.find(x => x.dataset.frag === String(n));
      if (sh) sh.classList.add('taken');
      if (n === 5 || taken.size >= 5){ finish(el); return; }
      later(1400, closeFrag);
    };
    FRAG_SCENES[n](el, settleFrag);
  }

  function finish(el){
    if (hint) hint.textContent = '';
    
    Fatih.cue('margaret_w2_youdidit_01.wav', 'Margaret: you did it, warm, the last thing before everything breaks');
    later(3400, ()=>{
      Fatih.cue('margaret_w2_finalshatter_01.wav', 'everything breaks at once');
      if (el) shatterElement(el, ()=>{
        el.classList.remove('on');
        shards.forEach((sh,i)=>{
          sh.classList.remove('taken');
          sh.style.transition = 'transform 1.6s cubic-bezier(.3,.6,.3,1), opacity 1.6s ease';
          sh.style.transform = 'translate(' + ((i-2)*130) + '%,' + ((i%2?1:-1)*140) + '%) scale(.14) rotate(' + ((i-2)*46) + 'deg)';
          sh.style.opacity = '0';
        });
        const fin = $('w2s6-final'); if (fin) fin.classList.add('on');
        later(2200, ()=> showWaveEndChoice(waveNum));
      });
    });
  }

  function onMove(e){
    if (open) return;
    shards.forEach(sh => {
      if (sh.classList.contains('taken')) return;
      const r = sh.getBoundingClientRect();
      const near = Math.hypot(e.clientX-(r.left+r.width/2), e.clientY-(r.top+r.height/2)) < 150;
      sh.classList.toggle('near', near);
    });
  }
  const onMoveT = rafThrottle(onMove);
  window.addEventListener('mousemove', onMoveT);
  addCleanup(()=> window.removeEventListener('mousemove', onMoveT));

  setShardHint();
  const invs = shards.map(sh => invite(sh, s6, 'touch a piece', 4200));
  shards.forEach((sh, i) => {
    const h = ()=>{
      if (sh.classList.contains('taken')) return;
      invs.forEach(v => v.settle());
      openFrag(Number(sh.dataset.frag));
    };
    sh.addEventListener('click', h);
    makeKeyActivatable(sh, 'A shard of the mirror. Enter to take it.');
    addCleanup(()=> sh.removeEventListener('click', h));
  });
}

function fragTip(el, text, kind){
  let h = el.querySelector('.w2frag-tip');
  if (!h){
    h = document.createElement('div');
    h.className = 'w2frag-tip';
    h.innerHTML = '<span class="tip-demo"><i class="ghost"></i><i class="trail"></i></span>'
      + '<span class="tip-text"></span><span class="tip-bar"><i></i></span>';
    el.appendChild(h);
  }
  const ghost = h.querySelector('.ghost'), trail = h.querySelector('.trail');
  h.demo = (now, beat)=>{
    if (!ghost) return;
    let x = 0, y = 0, s = 1, o = 0.9;
    const c = (now % 2000) / 2000;
    if (kind === 'sway'){ x = Math.sin(now / 620) * 30; }
    else if (kind === 'rise'){ const u = (now % 900) / 900; y = -30 * u; o = 0.95 - u * 0.85; s = 1 - u * 0.2; }
    else if (kind === 'lift'){ const on = beat > 0.5; s = on ? 1.5 : 0.85; o = on ? 1 : 0.28; }
    else if (kind === 'lean'){ const u = (now % 2400) / 2400; const r = 34 * (1 - u);
      x = Math.cos(u * 6.283 * 1.5) * r; y = Math.sin(u * 6.283 * 1.5) * r * 0.5; s = 1 - u * 0.3; }
    else if (kind === 'approach'){
      const u = (now % 3400) / 3400;
      const e = Math.min(1, u / 0.55);
      const ease = e < 0.5 ? 2*e*e : 1 - Math.pow(-2*e + 2, 2) / 2;
      x = 34 * (1 - ease); y = 20 * (1 - ease);
      s = 1 - ease * 0.18;
      o = u < 0.55 ? 0.9 : Math.max(0.25, 0.9 - (u - 0.55) / 0.45 * 0.65);
    }
    else if (kind === 'give'){ const u = (now % 2600) / 2600;
      x = 28 - 56 * u; s = 0.95 - u * 0.15; o = u < 0.12 ? u / 0.12 : (u > 0.86 ? (1 - u) / 0.14 : 1); }
    ghost.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + s.toFixed(2) + ')';
    ghost.style.opacity = o.toFixed(2);
    if (trail){
      trail.style.transform = 'translate(' + (x * 0.55).toFixed(1) + 'px,' + (y * 0.55).toFixed(1) + 'px)';
      trail.style.opacity = (o * 0.35).toFixed(2);
    }
  };
  h.className = 'w2frag-tip tip-' + kind;
  h.querySelector('.tip-text').textContent = text;
  const fill = h.querySelector('.tip-bar i');
  later(600, ()=> h.classList.add('on'));
  let lastP = 0, still = 0, taught = false, lastT = performance.now();
  return {
    say(t){ h.querySelector('.tip-text').textContent = t; taught = false; h.classList.remove('faded'); },
    set(p){
      p = Math.max(0, Math.min(1, p));
      if (fill) fill.style.transform = 'scaleX(' + p.toFixed(3) + ')';
      const now = performance.now(), dt = Math.min(120, now - lastT); lastT = now;
      if (p > lastP + 0.004){
        still = 0;
        if (!taught && p > 0.14){ taught = true; h.classList.add('faded'); }
      } else {
        still += dt;
        if (taught && still > 2200){ taught = false; h.classList.remove('faded'); }
      }
      lastP = p;
    },
    demo(now, beat){ h.demo(now, beat); },
    clear(){ h.classList.remove('on'); }
  };
}
function fragBox(el){
  const r = el.getBoundingClientRect();
  return { art: el.querySelector('.artlayer'), cx: r.left + r.width/2, cy: r.top + r.height/2, r };
}
function fragSecond(el, key, startVisible){
  if (!IMG[key]) return null;
  let s = el.querySelector('.frag-second');
  if (!s){
    s = document.createElement('div');
    s.className = 'artlayer frag-second';
    s.style.cssText = 'position:absolute;inset:0;background-repeat:no-repeat;'
      + 'background-position:center;background-size:contain;transition:opacity 1.2s var(--e-veil);';
    el.appendChild(s);
    resolveImage(IMG[key], src => { s.style.backgroundImage = 'url("' + src + '")'; });
  }
  s.style.opacity = startVisible ? '1' : '0';
  return s;
}

function fragWatch(el, done, o){
  const art = el.querySelector('.artlayer');
  const first = fragSecond(el, o.first, true);
  const music = Fatih.cue(o.cue, o.note);
  let ended = false;
  const stopAll = ()=>{
    try{ if (o.cry) SFX.stop(o.cry); }catch(e){}
  };
  addCleanup(stopAll);

  if (art){ art.style.transition = 'opacity 1.2s var(--e-veil)'; art.style.opacity = '1'; }
  if (first) first.style.transition = 'opacity 1.2s var(--e-veil), transform 1.2s cubic-bezier(.5,0,.75,1)';

  later(o.turn, ()=>{
    if (ended) return;
    if (o.line) bindCues(SFX.play(o.line), o.line);
    if (first){
      first.style.opacity = '0';
      first.style.transform = 'rotate(-13deg) translateY(70px)';
    }
  });

  later(o.turn + 1100, ()=>{ if (!ended && o.cry) SFX.play(o.cry); });

  later(o.turn + o.hold, ()=>{
    if (ended) return; ended = true;
    if (music) Fatih.fadeActive(900);
    stopAll();
    el.classList.add('solved');
    later(900, done);
  });
}

function fragLift(el, done, cue, note, endLine){
  const { art } = fragBox(el);
  const a = Fatih.cue(cue, note);
  const tip = fragTip(el, 'move your mouse upward, again and again', 'rise');
  const SPAN = 1.0;
  let p = 0, ended = false, lastT = performance.now(), py = null;
  function onMove(e){
    if (ended) return;
    if (py !== null){
      const up = py - e.clientY;
      if (up > 6) p = Math.min(1, p + up / 900);
    }
    py = e.clientY;
  }
  function onWheel(e){
    if (ended || e.deltaY >= 0) return;
    p = Math.min(1, p + Math.min(60, -e.deltaY) / 700);
  }
  window.addEventListener('mousemove', onMove);
  window.addEventListener('wheel', onWheel, { passive:true });
  addCleanup(()=>{
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('wheel', onWheel);
  });
  rafLoop(()=>{
    if (ended) return;
    const now = performance.now(), dt = Math.min(48, now - lastT); lastT = now;
    p = Math.max(0, p - dt / 2600);
    tip.set(p / SPAN); tip.demo(now, 0);
    if (art){
      art.style.transform = 'translateY(' + (-p * 26).toFixed(1) + 'px) scale(' + (1 + p * 0.09).toFixed(3) + ')';
      art.style.filter = 'blur(' + ((1 - p) * 6).toFixed(2) + 'px)';
      art.style.opacity = (0.45 + 0.55 * p).toFixed(3);
    }
    if (a) a.volume = 0.3 + 0.65 * p;
    if (p >= 1) close();
  });
  function close(){
    if (ended) return; ended = true;
    tip.clear();
    if (art){
      art.style.transition = 'transform 900ms ease, filter 900ms ease, opacity 900ms ease';
      art.style.transform = 'translateY(-26px) scale(1.09)';
      art.style.filter = 'none'; art.style.opacity = '1';
    }
    if (endLine) later(500, ()=> bindCues(SFX.play(endLine), endLine));
    el.classList.add('solved');
    later(3400, done);
  }
  later(20000, close);
}

function fragCatchRing(el, done, cue, note, endLine){
  const { art } = fragBox(el);
  const a = Fatih.cue(cue, note);
  const tip = fragTip(el, 'click while it is ringing', 'lift');
  const NEED = 3, PERIOD = 1500, RING = 620;
  const t0 = performance.now();
  let got = 0, ended = false, missT = 0;
  function ringing(now){ return ((now - t0) % PERIOD) < RING; }
  function onDown(){
    if (ended) return;
    const now = performance.now();
    if (ringing(now)){ got++; tip.set(got / NEED); if (got >= NEED) finish(); }
    else { missT = now; }
  }
  window.addEventListener('pointerdown', onDown);
  addCleanup(()=> window.removeEventListener('pointerdown', onDown));
  function finish(){
    if (ended) return; ended = true;
    tip.clear();
    if (art){ art.style.filter = 'none'; art.style.opacity = '1'; art.style.transform = 'none'; }
    if (endLine) later(400, ()=> bindCues(SFX.play(endLine), endLine));
    el.classList.add('solved');
    later(3400, done);
  }
  rafLoop(()=>{
    if (ended) return;
    const now = performance.now();
    const on = ringing(now);
    tip.demo(now, on ? 1 : 0);
    const miss = Math.max(0, 1 - (now - missT) / 500);
    if (art){
      const shake = on ? Math.sin(now / 60) * 3.2 : 0;
      art.style.transform = 'translateX(' + (shake - miss * 5).toFixed(2) + 'px) scale(' + (on ? 1.012 : 1) + ')';
      art.style.filter = 'blur(' + (4.4 - got * 1.4).toFixed(2) + 'px)';
      art.style.opacity = (0.46 + got * 0.18 + (on ? 0.1 : 0)).toFixed(3);
    }
    if (a) a.volume = 0.3 + 0.2 * got;
  });
  later(26000, finish);
}

function fragLeanIn(el, done, cue, note, secondKey){
  const { art, cx, cy, r } = fragBox(el);
  const a = Fatih.cue(cue, note);
  const second = fragSecond(el, secondKey, false);
  const tip = fragTip(el, 'move your cursor closer to her', 'lean');
  const reach = Math.max(150, Math.min(r.width, r.height) * 0.46);
  const SPAN = 3200;
  let p = 0, near = 0, ended = false, lastT = performance.now();
  function onMove(e){ near = 1 - Math.min(1, Math.hypot(e.clientX - cx, e.clientY - cy) / reach); }
  window.addEventListener('mousemove', onMove);
  addCleanup(()=> window.removeEventListener('mousemove', onMove));
  rafLoop(()=>{
    if (ended) return;
    const now = performance.now(), dt = Math.min(48, now - lastT); lastT = now;
    p = near > 0.45 ? Math.min(1, p + dt / SPAN) : Math.max(0, p - dt / (SPAN * 1.4));
    tip.set(p); tip.demo(now, 0);
    if (art){
      art.style.transform = 'scale(' + (1 + p * 0.16).toFixed(3) + ')';
      art.style.filter = 'blur(' + (p * 11).toFixed(2) + 'px)';
      art.style.opacity = (1 - p * 0.75).toFixed(3);
    }
    if (second) second.style.opacity = Math.max(0, (p - 0.4) / 0.6).toFixed(3);
    if (a) a.volume = 0.3 + 0.6 * p;
    if (p >= 1){ ended = true; tip.clear(); el.classList.add('solved'); later(2000, done); }
  });
  later(30000, ()=>{ if (!ended){ ended = true; tip.clear(); el.classList.add('solved'); done(); } });
}

function fragGently(el, done, cue, note){
  const { art } = fragBox(el);
  const a = Fatih.cue(cue, note);
  const tip = fragTip(el, 'move slowly, from the right to the left', 'give');
  const SPAN = 4200;
  let p = 0, speed = 0, ended = false, lastT = performance.now(), px = null, py = null, toward = 0;
  function onMove(e){
    if (px !== null){
      const dx = e.clientX - px;
      speed = Math.min(1, speed + Math.hypot(dx, e.clientY - py) / 26);
      if (dx < -0.5) toward = Math.min(1, toward + (-dx) / 60);
      else if (dx > 2) toward = Math.max(0, toward - dx / 420);
    }
    px = e.clientX; py = e.clientY;
  }
  window.addEventListener('mousemove', onMove);
  addCleanup(()=> window.removeEventListener('mousemove', onMove));
  rafLoop(()=>{
    if (ended) return;
    const now = performance.now(), dt = Math.min(48, now - lastT); lastT = now;
    speed = Math.max(0, speed - dt / 620);
    toward = Math.max(0, toward - dt / 5200);
    const calm = speed < 0.52 && toward > 0.03;
    p = calm ? Math.min(1, p + dt / SPAN) : Math.max(0, p - dt / 700);
    tip.set(p); tip.demo(now, 0);
    if (art){
      art.style.transform = 'scale(' + (0.96 + p * 0.06).toFixed(3) + ') translateX(' + (-p * 34 - speed * 5).toFixed(1) + 'px)';
      art.style.filter = 'blur(' + ((1 - p) * 4.5 + speed * 3).toFixed(2) + 'px)';
      art.style.opacity = (0.42 + 0.58 * p).toFixed(3);
    }
    if (a) a.volume = 0.3 + 0.65 * p;
    if (p >= 1){ ended = true; tip.say('she takes it'); later(1200, ()=> tip.clear()); el.classList.add('solved'); later(2400, done); }
  });
  later(24000, ()=>{ if (!ended){ ended = true; tip.clear(); el.classList.add('solved'); done(); } });
}

const FRAG_SCENES = {
  1: function(el, done){
    fragWatch(el, done, {
      cue:'margaret_w2_frag1_music_01.wav',
      note:'ballet music with her body in it, then the fall, then a child crying',
      first:'dancing_stage', turn:4200, hold:6400,
      line:'w1s5_mothervoice', cry:'w1s6_crying' });
  },
  2: function(el, done){
    fragLift(el, done, 'margaret_w2_frag2_audio_01.wav',
      'the mirror room, hushed, the girl with the doll in the distance', 'w1s2_congrats');
  },
  3: function(el, done){
    fragCatchRing(el, done, 'margaret_w2_frag3_audio_01.wav',
      'the telephone ringing, and then a baby crying', 'w1s6_notend');
  },
  4: function(el, done){
    fragLeanIn(el, done, 'w2s4_babygirl_vo',
      'no crying here, only the line itself', 'w3_crib');
  },
  5: function(el, done){
    fragGently(el, done, 'margaret_w2_frag5_audio_01.wav',
      'here you go darling, you did it');
  }
};

const MG = { skin:'#DCBEA4', skinSh:'#C4A388', hair:'#9B714E', hairDk:'#5C3D24',
  white:'#FEFDFD', whiteSh:'#E9E2D8', blue:'#7C98AF', blueSh:'#67839A', ink:'#000000' };
const MG_FL = 620, MG_ANKY = 588, MG_SHOE = 52;
const MG_WL = [33,20,11.5], MG_WA = [17,12.5,8.5], MG_WT = [58,38,52], MG_WF = [22,24,19], MG_WP = [20,14,15];
const MG_SK = 'M 0 -14 C -44 -10 -78 12 -80 30 C -42 52 42 52 80 30 C 78 12 44 -10 0 -14 Z';
const MG_SKT = 'M 0 -12 C -38 -8 -68 10 -70 26 C -36 46 36 46 70 26 C 68 10 38 -8 0 -12 Z';
const MG_D0 = {
  legL:[[186,346],[178,478],[184,592]], legR:[[214,346],[222,478],[216,592]],
  ftL:[[184,588],[178,606],[182,618]], ftR:[[216,588],[222,606],[218,618]],
  aL:[[176,222],[152,284],[182,332]],  aR:[[224,222],[248,280],[218,330]],
  tor:[[200,210],[197,300],[200,348]], hd:[200,154] };
const MG_D1 = {
  legL:[[186,344],[128,428],[196,462]], legR:[[212,344],[216,478],[208,590]],
  ftL:[[196,462],[204,472],[210,480]],
  aL:[[174,216],[148,156],[188,108]],  aR:[[226,216],[254,162],[214,104]],
  tor:[[201,206],[198,296],[200,344]], hd:[205,148] };

function mgSmooth(p){
  if (p.length < 3) return p.map(q=>q[0].toFixed(1)+' '+q[1].toFixed(1)).join(' L ');
  let d = p[0][0].toFixed(1)+' '+p[0][1].toFixed(1);
  for (let i=1;i<p.length-1;i++){
    const mx=(p[i][0]+p[i+1][0])/2, my=(p[i][1]+p[i+1][1])/2;
    d += ' Q '+p[i][0].toFixed(1)+' '+p[i][1].toFixed(1)+' '+mx.toFixed(1)+' '+my.toFixed(1);
  }
  return d+' L '+p[p.length-1][0].toFixed(1)+' '+p[p.length-1][1].toFixed(1);
}
function mgRibbon(pts, ws){
  const L=[],R=[];
  for (let i=0;i<pts.length;i++){
    const a=pts[Math.max(0,i-1)], b=pts[Math.min(pts.length-1,i+1)];
    let dx=b[0]-a[0], dy=b[1]-a[1];
    const m=Math.hypot(dx,dy)||1; dx/=m; dy/=m;
    const nx=-dy, ny=dx, w=ws[i]/2;
    L.push([pts[i][0]+nx*w,pts[i][1]+ny*w]); R.push([pts[i][0]-nx*w,pts[i][1]-ny*w]);
  }
  const tw=(ws[ws.length-1]/2).toFixed(1);
  return 'M '+mgSmooth(L)+' A '+tw+' '+tw+' 0 0 1 '+R[R.length-1][0].toFixed(1)+' '+R[R.length-1][1].toFixed(1)+
    ' L '+mgSmooth(R.slice().reverse())+' Z';
}
const mgLerp=(a,b,t)=>a+(b-a)*t;
const mgPts=(A,B,t)=>A.map((p,i)=>[mgLerp(p[0],B[i][0],t), mgLerp(p[1],B[i][1],t)]);
const mgEase=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
function mgAxis(tor){ return Math.atan2(tor[2][0]-tor[0][0], tor[2][1]-tor[0][1])*180/Math.PI*-1; }

function buildDancer(host, cloth){
  const NS='http://www.w3.org/2000/svg';
  host.innerHTML='';
  const svg=document.createElementNS(NS,'svg');
  svg.setAttribute('viewBox','0 0 400 700');
  svg.setAttribute('preserveAspectRatio','xMidYMax meet');
  svg.style.width='100%'; svg.style.height='100%';
  const g=document.createElementNS(NS,'g'); g.id='w3s3-tipfig';
  svg.appendChild(g); host.appendChild(svg);
  const ink=(f,w)=>{ const n=document.createElementNS(NS,'path');
    n.setAttribute('fill',f); n.setAttribute('stroke',MG.ink);
    n.setAttribute('stroke-width',w); n.setAttribute('stroke-linejoin','round');
    g.appendChild(n); return n; };
  const cl = cloth==='blue' ? MG.blue : MG.white;
  const clS = cloth==='blue' ? MG.blueSh : MG.whiteSh;
  const P={};
  P.aR=ink(MG.skinSh,2.3); P.legL=ink(MG.skinSh,2.3); P.ftL=ink(cl,2.3);
  P.legR=ink(MG.skin,2.5); P.ftR=ink(cl,2.5);
  P.sk=ink(cl,2.5);        P.tor=ink(cl,2.5);
  P.nk=ink(MG.skin,2.3);   P.bun=ink(MG.hair,2.3);
  P.hd=ink(MG.skin,2.5);   P.hair=ink(MG.hair,2.3);
  P.aL=ink(MG.skin,2.5);
  return { g, P };
}

function poseDancer(P, t){
  const e=mgEase(Math.max(0,Math.min(1,t)));
  const RISE=MG_ANKY+MG_SHOE-MG_FL;
  const ftRpt=[[208,MG_ANKY-2],[212,MG_ANKY+MG_SHOE*0.45],[214,MG_ANKY+MG_SHOE]];
  const legL=mgPts(MG_D0.legL,MG_D1.legL,e), legR=mgPts(MG_D0.legR,MG_D1.legR,e);
  const ftL=mgPts(MG_D0.ftL,MG_D1.ftL,e),   ftR=mgPts(MG_D0.ftR,ftRpt,e);
  const aL=mgPts(MG_D0.aL,MG_D1.aL,e),      aR=mgPts(MG_D0.aR,MG_D1.aR,e);
  const tor=mgPts(MG_D0.tor,MG_D1.tor,e);
  const hd=[mgLerp(MG_D0.hd[0],MG_D1.hd[0],e), mgLerp(MG_D0.hd[1],MG_D1.hd[1],e)];
  P.legL.setAttribute('d',mgRibbon(legL,MG_WL)); P.legR.setAttribute('d',mgRibbon(legR,MG_WL));
  P.ftL.setAttribute('d',mgRibbon(ftL,e<.5?MG_WF:MG_WP)); P.ftR.setAttribute('d',mgRibbon(ftR,e<.5?MG_WF:MG_WP));
  P.aL.setAttribute('d',mgRibbon(aL,MG_WA)); P.aR.setAttribute('d',mgRibbon(aR,MG_WA));
  P.tor.setAttribute('d',mgRibbon(tor,MG_WT));
  P.sk.setAttribute('d', e>=.5?MG_SKT:MG_SK);
  P.sk.setAttribute('transform','translate('+tor[2][0].toFixed(1)+','+tor[2][1].toFixed(1)+') rotate('+mgAxis(tor).toFixed(2)+')');
  P.nk.setAttribute('d',mgRibbon([[200,206],[hd[0],hd[1]+30]],[24,21]));
  const x=hd[0], y=hd[1];
  P.hd.setAttribute('d','M '+(x-25)+' '+y+' a 25 33 0 1 0 50 0 a 25 33 0 1 0 -50 0 Z');
  P.hair.setAttribute('d','M '+(x-25)+' '+(y-2)+' C '+(x-26)+' '+(y-30)+' '+(x-12)+' '+(y-40)+' '+x+' '+(y-40)
    +' C '+(x+12)+' '+(y-40)+' '+(x+26)+' '+(y-30)+' '+(x+25)+' '+(y-2)
    +' C '+(x+20)+' '+(y-20)+' '+(x+10)+' '+(y-26)+' '+x+' '+(y-26)
    +' C '+(x-10)+' '+(y-26)+' '+(x-20)+' '+(y-20)+' '+(x-25)+' '+(y-2)+' Z');
  P.bun.setAttribute('d','M '+(x-20)+' '+(y-48)+' a 20 16 0 1 0 40 0 a 20 16 0 1 0 -40 0 Z');
  return RISE*e;
}

function startWave3Scene1(waveNum){
  later(1200, ()=> cueWatch(12200));
  SFX.play('w3s1_funeralbed');
  const s = sceneShow('w3s1');
  s.style.transition = ''; s.style.opacity = '1';
  s.style.webkitMaskImage = ''; s.style.maskImage = ''; s.style.filter = '';
  Fatih.fadeActive(400);
  const bed = Fatih.cue('margaret_w3_funeralmusic_01.wav', 'funeral song, the falling impacts and the broken count, the full bed for the triple exposure');
  const funeral = $('w3s1-funeral'), dance = $('w3s1-dance'), scar = $('w3s1-scar');
  const all = [scar, funeral, dance];
  all.forEach(el => { if (el){ el.style.transition = 'opacity 2.6s ease, filter 2.6s ease, transform 2.6s ease';
    el.style.opacity = '.62'; el.style.filter = 'blur(3.5px)'; el.style.transform = 'scale(1.02)'; } });

  function focus(el, sub, speaker){
    all.forEach(o => { if (!o) return;
      const isIt = (o === el);
      o.style.opacity = isIt ? '1' : '.20';
      o.style.filter = isIt ? 'blur(0px)' : 'blur(9px)';
      o.style.transform = isIt ? 'scale(1)' : 'scale(1.05)';
    });
    if (sub) void 0;
  }

  const W3S1_COUNT_AT = 8.4;
  later(1200, ()=> focus(scar, '', ''));
  later(5000, ()=> focus(funeral, '', ''));
  later(8800, ()=> focus(dance, '', ''));
  if (bed) subSync(bed, [{ t: W3S1_COUNT_AT, line: '&ldquo;One, two, three, four&hellip; seven, eight.&rdquo;', ms: 3200 }]);
  else later(8800, ()=> void 0);
  later(13400, ()=>{
    all.forEach(el => { if (el){ el.style.transition = 'opacity 2.2s ease, filter 2.2s ease'; el.style.opacity = '0'; el.style.filter = 'blur(12px)'; } });
  });
  later(13400, ()=> w3CrossFade(s, all, ()=>{
    all.forEach(el => { if (el){ el.style.transition=''; el.style.opacity=''; el.style.filter=''; el.style.transform=''; } });
    s.style.display = 'none'; startWave3Scene2(waveNum);
  }));
}

function w3CrossFade(sceneEl, layers, done){
  let ran = false;
  let veil = $('w3Veil');
  if (!veil){
    veil = document.createElement('div');
    veil.id = 'w3Veil';
    veil.setAttribute('aria-hidden','true');
    sceneEl.parentNode.appendChild(veil);
  }
  const go = ()=>{ if (ran) return; ran = true;
    sceneEl.style.transition = ''; sceneEl.style.opacity = '';
    done();
    later(260, ()=>{ veil.classList.remove('on'); });
    later(1800, ()=>{ try{ veil.remove(); }catch(e){} });
  };
  layers.forEach(el => {
    if (!el) return;
    el.style.transition = 'opacity 1.6s var(--e-veil), transform 2.4s cubic-bezier(.4,0,.3,1)';
    el.style.transform = 'scale(1.05) translateY(-2.2%)';
  });
  requestAnimationFrame(()=> veil.classList.add('on'));
  later(1900, go);
}

function startWave3Scene2(waveNum){
  later(1400, ()=> cueBrief('move', 'Stay with him. Keep your cursor near.', ()=>{}));
  const s = sceneShow('w3s2');
  Fatih.fadeActive(900);
  s.style.transform = ''; s.style.clipPath = ''; s.style.webkitClipPath = '';
  s.style.transition = 'none'; s.style.opacity = '0';
  void s.offsetWidth;
  requestAnimationFrame(()=>{
    s.style.transition = 'opacity 1.3s var(--e-veil)';
    s.style.opacity = '1';
  });
  later(1500, ()=>{ s.style.transition = ''; s.style.opacity = ''; });
  const illo = $('w3s2-illo'), hint = $('w3s2-hint');
  if (!illo) return;
  illo.style.filter = '';
  illo.style.transform = '';
  illo.style.opacity = '1';

  wSay('w3s2_hers', 200);
  wSay('w3s2_his', 1800);

  const tip = fragTip(s, 'move your cursor closer to him', 'approach');
  const tipEl = s.querySelector('.w2frag-tip');
  if (tipEl) tipEl.classList.add('tip-corner');
  let saidStay = false;
  const r = s.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height * 0.44;
  const reach = Math.max(160, Math.min(r.width, r.height) * 0.44);
  const SPAN = 7000;
  let p = 0, near = 0, ended = false, lastT = performance.now();
  let aim = { x: 0.86, y: 0.5 };
  function onMove(e){
    const vx = e.clientX - cx, vy = e.clientY - cy;
    const d = Math.hypot(vx, vy);
    near = 1 - Math.min(1, d / reach);
    if (d > 12){ aim = { x: vx / d, y: vy / d }; }
  }
  window.addEventListener('mousemove', onMove);
  addCleanup(()=> window.removeEventListener('mousemove', onMove));

  rafLoop(()=>{
    if (ended || s.style.display === 'none') return;
    const now = performance.now(), dt = Math.min(48, now - lastT); lastT = now;
    p = near > 0.42 ? Math.min(1, p + dt / SPAN) : Math.max(0, p - dt / (SPAN * 1.6));
    if (!saidStay && near > 0.42){ saidStay = true; tip.say('stay with him'); }
    tip.set(p); tip.demo(now, 0, aim);
    illo.style.filter = 'blur(' + (0.4 + p * 13).toFixed(2) + 'px) saturate(' + (1 - p * 0.55).toFixed(2) + ')';
    illo.style.transform = 'scale(' + (1 + p * 0.13).toFixed(3) + ')';
    illo.style.opacity = (1 - p * 0.55).toFixed(3);
    if (p >= 1) finish();
  });

  function finish(){
    if (ended) return; ended = true;
    tip.clear();
    if (hint) hint.classList.remove('on');
    Fatih.fadeActive(700);
    if (illo){
      illo.style.transition = 'opacity 1.3s var(--e-veil), filter 1.3s var(--e-veil)';
      illo.style.opacity = '0';
      illo.style.filter = 'blur(14px)';
    }
    later(1500, ()=>{
      if (illo){ illo.style.transition = ''; illo.style.opacity = ''; illo.style.filter = ''; }
      s.style.display = 'none'; startWave3Scene3(waveNum);
    });
  }
  later(34000, finish);
}

function startWave3Scene3(waveNum){
  later(1200, ()=> cueWatch(2500));
  const s = sceneShow('w3s3', { watchMs: 9000 });
  Fatih.fadeActive(800);
  const xray = $('w3s3-xray'), wrap = $('w3s3-tiptoe');
  s.classList.remove('frozen-time','snapped');
  if (xray){
    xray.classList.remove('on');
    xray.style.opacity = '0';
    xray.style.left = '50%'; xray.style.right = 'auto';
    xray.style.top = '52%'; xray.style.bottom = 'auto';
    xray.style.width = 'min(34vw, 340px)';
    xray.style.height = 'min(74vh, 700px)';
    xray.style.transformOrigin = '50% 50%';
    xray.style.transform = 'translate(-50%,-50%) scale(1)';
    xray.style.transition = 'none';
  }
  if (!wrap) return;

  const built = buildDancer(wrap, 'white');
  const fig = built.g, P = built.P;

  const LEAD = 900, RISE = 2200, TOP = 1400, DOWN = 1100, GAP = 900;
  const CYCLE = RISE + TOP + DOWN + GAP;
  const T0 = performance.now();
  let shown = 0, ended = false;

  function flash(){
    if (!xray || ended) return;
    shown++;
    xray.style.transition = 'none';
    xray.style.opacity = '0';
    xray.style.transform = 'translate(-50%,-50%) scale(1.34)';
    void xray.offsetWidth;
    xray.style.transition = 'opacity .16s linear, transform .34s cubic-bezier(.15,.9,.3,1)';
    xray.style.opacity = '1';
    xray.style.transform = 'translate(-50%,-50%) scale(1)';
    Fatih.cue('margaret_w3_snap_01.wav', 'one dry crack, no reverb, then nothing');
    later(1500, ()=>{
      if (ended || !xray) return;
      xray.style.transition = 'opacity .7s var(--e-veil)';
      xray.style.opacity = '0';
    });
    if (shown >= 2) later(2100, close);
  }

  later(LEAD + RISE, flash);
  later(LEAD + CYCLE + RISE, flash);

  rafLoop(()=>{
    if (ended || s.style.display === 'none') return;
    const e = performance.now() - T0 - LEAD;
    if (e < 0) return;
    const k = Math.min(1, Math.floor(e / CYCLE));
    const c = e - k * CYCLE;
    let t;
    if (c < RISE) t = c / RISE;
    else if (c < RISE + TOP) t = 1;
    else if (c < RISE + TOP + DOWN) t = 1 - (c - RISE - TOP) / DOWN;
    else t = 0;
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const rise = poseDancer(P, ease);
    const strain = REDUCED_MOTION ? 0 : Math.sin(performance.now() / 108) * (0.4 + 3.2 * ease);
    fig.setAttribute('transform',
      'translate(' + strain.toFixed(2) + ',' + (-rise).toFixed(2) + ') ' +
      'rotate(' + (strain * 0.22).toFixed(2) + ' 200 620)');
  });

  function close(){
    if (ended) return; ended = true;
    Fatih.fadeActive(60);
    s.classList.add('frozen-time','snapped');
    if (xray){ xray.style.transition = 'opacity .18s linear'; xray.style.opacity = '1'; }
    later(1900, ()=>{
      s.classList.remove('frozen-time','snapped');
      if (xray){ xray.style.transition = 'none'; xray.style.opacity = '0'; }
      s.style.display = 'none';
      startWave3Scene4(waveNum);
    });
  }
  later(LEAD + CYCLE * 2 + 6000, close);
}

function startWave3Scene4(waveNum){
  later(1400, ()=> cueBrief('drag', 'Press on the picture and drag it downward.', ()=>{}));
  const s = sceneShow('w3s4');
  Fatih.fadeActive(800);
  const corridor = $('w3s4-corridor'), hint = $('w3s4-hint');
  let armed = false;
  if (corridor){ corridor.style.transition = 'none'; corridor.style.transform = 'rotateX(0deg)'; }
  if (hint) hint.textContent = '';
  void s.offsetWidth;

  let dragging = false, lastY = 0, pull = 0, done = false;
  const NEED = 340;
  Fatih.cue('margaret_w2_finalshatter_01.wav', 'the ring breaking, under the corridor flip');
  const open = ()=>{
    if (armed) return; armed = true;
    if (!done) cueBrief('drag', 'Press on the picture and drag it downward.', ()=>{});
  };
  later(900, ()=>{
    const a = bindCues(SFX.play('w3s4_mama'), 'w3s4_mama');
    if (a && typeof a.addEventListener === 'function'){
      a.addEventListener('ended', ()=> later(600, open), { once:true });
      a.addEventListener('error', ()=> later(600, open), { once:true });
      later(11000, open);
    } else later(2600, open);
  });

  function finish(){
    if (done) return; done = true;
    if (hint) hint.textContent = '';
    if (corridor){
      corridor.style.transition = 'transform 1.6s cubic-bezier(.4,.1,.3,1), opacity 1.6s ease';
      corridor.style.transform = 'rotateX(180deg)';
      corridor.style.opacity = '0';
    }
    later(1700, ()=>{ s.style.display = 'none'; startWave3Scene5(waveNum); });
  }

  function down(e){ if (!armed) return; dragging = true; lastY = e.clientY; }
  function up(){ dragging = false; }
  function move(e){
    if (!dragging || done || !armed) return;
    const dy = e.clientY - lastY; lastY = e.clientY;
    if (dy > 0) pull += dy;
    const deg = Math.min(180, (pull/NEED)*180);
    if (corridor) corridor.style.transform = 'rotateX(' + deg.toFixed(1) + 'deg)';
    if (pull >= NEED) finish();
  }
  window.addEventListener('mousedown', down);
  window.addEventListener('mouseup', up);
  window.addEventListener('mousemove', move);
  addCleanup(()=>{ window.removeEventListener('mousedown', down);
    window.removeEventListener('mouseup', up); window.removeEventListener('mousemove', move); });
  later(20000, finish);
}

function startWave3Scene5(waveNum){
  later(1200, ()=> cueWatch(8400));
  const s = sceneShow('w3s5', { watchMs: 9000 });
  Fatih.fadeActive(800);
  s.classList.remove('crossed');
  later(400, ()=> void 0);
  Fatih.cue('margaret_w3_ballet_distant_01.wav', 'ballet music only in this scene, nothing else underneath');
  later(5200, ()=> s.classList.add('crossed'));
  later(9600, ()=>{ s.style.display = 'none'; startWave3Scene6(waveNum); });
}

function startWave3Scene6(waveNum){
  later(1200, ()=> cueWatch(2950));
  const s = sceneShow('w3s6', { watchMs: 9000 });
  Fatih.fadeActive(800);
  const band = $('w3s6-band');
  if (band){
    band.style.transition = 'none'; band.style.transform = 'scale(1)';
    void band.offsetWidth;
    requestAnimationFrame(()=>{ band.style.transition = 'transform 7s ease'; band.style.transform = 'scale(1.16)'; });
  }
  const PRETTY = '&ldquo;Mama, am I pretty now? Mama, mama, mama&hellip;&rdquo;';
  addCleanup(()=>{ try{ SFX.stop('pretty_now'); }catch(e){} });
  later(400, ()=> bindCues(SFX.play('pretty_now'), 'pretty_now'));
  later(4150, ()=>{ if (band){ band.style.transition=''; band.style.transform=''; } s.style.display = 'none'; startWave3Scene7(waveNum); });
}

function w3Cloud(x, y, w, h, prof){
  const base = y + h;
  const total = prof.reduce((a, p) => a + p[0], 0);
  let px = x;
  let d = 'M ' + px.toFixed(1) + ' ' + base.toFixed(1);
  prof.forEach(p => {
    const seg = w * p[0] / total;
    const peak = base - h * p[1];
    const end  = base - h * p[2];
    d += ' C ' + (px + seg * 0.04).toFixed(1) + ' ' + (peak - h * 0.12).toFixed(1)
       + ' ' + (px + seg * 0.96).toFixed(1) + ' ' + (peak - h * 0.12).toFixed(1)
       + ' ' + (px + seg).toFixed(1) + ' ' + end.toFixed(1);
    px += seg;
  });
  d += ' L ' + px.toFixed(1) + ' ' + base.toFixed(1)
     + ' Q ' + (x + w * 0.52).toFixed(1) + ' ' + (base + h * 0.11).toFixed(1)
     + ' ' + x.toFixed(1) + ' ' + base.toFixed(1) + ' Z';
  return d;
}

const W3_CLOUD_PROF = [
  [[0.85,0.46,0.28],[1.25,0.98,0.46],[0.95,0.66,0.24],[0.75,0.34,0.00]],
  [[1.10,0.72,0.38],[0.80,0.44,0.30],[1.20,0.92,0.34],[0.70,0.30,0.00]],
  [[0.70,0.38,0.26],[1.05,0.86,0.52],[1.15,0.62,0.22],[0.80,0.42,0.00]],
  [[0.95,0.60,0.34],[1.30,0.90,0.30],[0.75,0.40,0.00]]
];

function w3CloudBand(x, y, w, h, i, ink){
  const prof = W3_CLOUD_PROF[i % W3_CLOUD_PROF.length];
  const body = w3Cloud(x, y, w, h, prof);
  const belly = w3Cloud(x + w * 0.10, y + h * 0.40, w * 0.78, h * 0.56, prof);
  return '<g opacity="' + (0.94 - i * 0.06).toFixed(2) + '">'
    + '<animateTransform attributeName="transform" type="translate" '
    + 'values="-26 0; 26 0; -26 0" dur="' + (68 + i * 17) + 's" repeatCount="indefinite"/>'
    + '<path d="' + body + '" fill="#FBFDFD" stroke="' + ink + '" stroke-width="1.8" '
    + 'stroke-linejoin="round" stroke-opacity="0.62"/>'
    + '<path d="' + belly + '" fill="#DCEDEC" opacity="0.58"/>'
    + '</g>';
}

function startWave3Scene7(waveNum){
  later(1200, ()=> cueWatch(10800));
  const s = sceneShow('w3s7', { watchMs: 9000, watchAt: 'left' });
  const plane = $('w3s7-plane'), sky = $('w3s7-sky');
  if (plane){
    plane.classList.remove('fly');
    if (!plane.dataset.matted){
      plane.dataset.matted = '1';
      resolveImage(IMG.w5_plane, src => {
        matteEdgeWhite(src, u => { plane.style.backgroundImage = 'url("' + u + '")'; }, ()=>{});
      }, ()=>{});
    }
  }

  if (sky){
    const INK = '#2E2A26', PAPER = '#F2EBD2', BAND = '#9AA0A7', SAGE = '#8B9184', LAMP = '#F0E6C6';
    const HZ = 620;

    const clouds = [[120,132,352,74],[556,86,404,62],[1000,176,336,66],[352,246,266,48],[760,300,300,52]]
      .map((c, i) => w3CloudBand(c[0], c[1], c[2], c[3], i, INK)).join('');

    const lamps = [];
    for (let i = 0; i < 8; i++){
      const x = 70 + i * 190;
      lamps.push('<g>'
        + '<rect x="' + x + '" y="586" width="6" height="132" fill="' + BAND
        + '" stroke="' + INK + '" stroke-width="1.4" stroke-opacity="0.6"/>'
        + '<path d="M ' + x + ' 590 q 0 -22 26 -22" fill="none" stroke="' + BAND
        + '" stroke-width="6" stroke-linecap="round"/>'
        + '<ellipse cx="' + (x + 28) + '" cy="572" rx="17" ry="11" fill="' + SAGE
        + '" stroke="' + INK + '" stroke-width="1.5" stroke-opacity="0.62"/>'
        + '<ellipse cx="' + (x + 28) + '" cy="576" rx="9" ry="5" fill="' + LAMP + '" opacity="0.7"/>'
        + '</g>');
    }

    sky.innerHTML =
      '<svg viewBox="0 0 1440 810" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">'
      + '<defs>'
      + '<linearGradient id="w3skyG" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0" stop-color="#A6E2E0"/><stop offset="0.52" stop-color="#BCE9E6"/>'
      + '<stop offset="0.84" stop-color="#DCEBDF"/><stop offset="1" stop-color="#F2EBD2"/>'
      + '</linearGradient>'
      + '<linearGradient id="w3hazeG" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0" stop-color="#F2EBD2" stop-opacity="0"/>'
      + '<stop offset="1" stop-color="#F2EBD2" stop-opacity="0.66"/>'
      + '</linearGradient>'
      + '<linearGradient id="w3roadG" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0" stop-color="#B9BEC4"/><stop offset="1" stop-color="#9AA0A7"/>'
      + '</linearGradient>'
      + '</defs>'
      + '<rect width="1440" height="810" fill="url(#w3skyG)"/>'
      + clouds
      + '<rect y="420" width="1440" height="200" fill="url(#w3hazeG)"/>'
      + '<line x1="0" y1="' + HZ + '" x2="1440" y2="' + HZ + '" stroke="' + INK
      + '" stroke-width="1.6" stroke-opacity="0.5"/>'
      + '<rect y="' + HZ + '" width="1440" height="98" fill="' + PAPER + '"/>'
      + lamps.join('')
      + '<rect y="718" width="1440" height="14" fill="' + BAND + '" opacity="0.9"/>'
      + '<line x1="0" y1="718" x2="1440" y2="718" stroke="' + INK + '" stroke-width="1.5" stroke-opacity="0.5"/>'
      + '<rect y="732" width="1440" height="78" fill="url(#w3roadG)"/>'
      + '<g opacity="0.75">' + [0,1,2,3,4,5,6].map(i =>
          '<rect x="' + (40 + i * 210) + '" y="768" width="118" height="7" rx="3.5" fill="' + LAMP
          + '"/>').join('') + '</g>'
      + '</svg>';
  }

  Fatih.cue('silence', 'no sound at all as the plane goes, the Wave ends in silence');
  later(600, ()=>{ if (plane) plane.classList.add('fly'); });

  later(12000, ()=> showWaveEndChoice(waveNum));
}

function startWave4Scene1(waveNum){
  const s = sceneShow('w4s1');
  Fatih.fadeActive(500);
  Fatih.cue('margaret_w4_phone_01.wav', 'phone ringing, continuous, unanswered, from the first frame');
  const spot = $('w4s1-mirrorspot'), hint = $('w4s1-hint');
  if (spot) spot.classList.remove('near');
  if (hint){ hint.textContent = ''; hint.classList.remove('on'); }
  later(2000, ()=>{ if (!advanced) cueBrief('click', 'Click the mirror when the phone rings.', ()=>{}); });

  let advanced = false;
  function onMove(e){
    if (!spot) return;
    const r = spot.getBoundingClientRect();
    const d = Math.hypot(e.clientX-(r.left+r.width/2), e.clientY-(r.top+r.height/2));
    spot.classList.toggle('near', d < 220);
  }
  function go(){ if (advanced) return; advanced = true;
    if (hint){ hint.textContent = ''; hint.classList.remove('on'); }
    Fatih.fadeActive(600);
    s.style.display = 'none'; startWave4Scene2(waveNum); }
  let armed = false;
  later(1200, ()=>{ armed = true; });
  function onClick(){ if (armed) go(); }
  bindAdvanceKey(()=>{ if (armed) go(); });
  const onMoveT = rafThrottle(onMove);
  window.addEventListener('mousemove', onMoveT);
  window.addEventListener('click', onClick);
  addCleanup(()=>{ window.removeEventListener('mousemove', onMoveT);
                   window.removeEventListener('click', onClick); });
  later(30000, go);
}

function startWave4Scene2(waveNum){
  later(1400, ()=> cueBrief('move', 'Follow the light with your cursor.', ()=>{}));
  const s = sceneShow('w4s2');
  Fatih.fadeActive(700);
  const cv = $('w4s2-path'), hint = $('w4s2-hint');
  if (hint) hint.textContent = '';
  const ctx = cv ? cv.getContext('2d') : null;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  function resize(){ if (!cv) return; cv.width = cv.clientWidth*dpr; cv.height = cv.clientHeight*dpr;
    if (ctx) ctx.setTransform(dpr,0,0,dpr,0,0); }
  resize(); window.addEventListener('resize', resize);
  addCleanup(()=> window.removeEventListener('resize', resize));

  Fatih.cue('margaret_w4_ballet_music_01.wav', 'the dance music while she teaches her daughter');
  later(1200, ()=>{ if (phrase < PHRASES) cueBrief('move', 'Follow the light. Keep her arm moving.', ()=>{}); });

  const PHRASES = 3;
  let phrase = 0, t = 0, held = 0, mx = -999, my = -999, done = false;

  function arcPoint(u, ph){
    const W = cv ? cv.clientWidth : window.innerWidth;
    const H = cv ? cv.clientHeight : window.innerHeight;
    const cx = W*0.5, cy = H*0.54, R = Math.min(W,H)*0.30;
    const a0 = [Math.PI*1.15, Math.PI*0.85, Math.PI*1.30][ph % 3];
    const a1 = [Math.PI*1.85, Math.PI*0.15, Math.PI*1.70][ph % 3];
    const a = a0 + (a1-a0)*u;
    return { x: cx + Math.cos(a)*R, y: cy + Math.sin(a)*R*0.72 };
  }

  function onMove(e){ mx = e.clientX; my = e.clientY; }
  const onMoveT = rafThrottle(onMove);
  window.addEventListener('mousemove', onMoveT);
  addCleanup(()=> window.removeEventListener('mousemove', onMoveT));

  rafLoop(()=>{
    if (!ctx || !cv || done) return;
    const W = cv.clientWidth, H = cv.clientHeight;
    ctx.clearRect(0,0,W,H);

    const lead = arcPoint(t, phrase);
    const rect = cv.getBoundingClientRect();
    const px = mx - rect.left, py = my - rect.top;
    const d = Math.hypot(px-lead.x, py-lead.y);
    const on = d < 110;
    held = on ? Math.min(1, held + 0.02) : Math.max(0, held - 0.03);
    if (on) t += 0.0042 + held*0.0024;

    ctx.save();
    ctx.strokeStyle = 'rgba(226,206,166,' + (0.10 + held*0.12).toFixed(3) + ')';
    ctx.lineWidth = 2; ctx.beginPath();
    for (let u=0; u<=1; u+=0.02){ const q = arcPoint(u, phrase); u ? ctx.lineTo(q.x,q.y) : ctx.moveTo(q.x,q.y); }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(238,224,196,' + (0.30 + held*0.45).toFixed(3) + ')';
    ctx.lineWidth = 3.4; ctx.beginPath();
    for (let u=0; u<=t; u+=0.02){ const q = arcPoint(u, phrase); u ? ctx.lineTo(q.x,q.y) : ctx.moveTo(q.x,q.y); }
    ctx.stroke();

    const g = ctx.createRadialGradient(lead.x, lead.y, 0, lead.x, lead.y, 46 + held*22);
    g.addColorStop(0, 'rgba(255,246,224,' + (0.42 + held*0.34).toFixed(3) + ')');
    g.addColorStop(1, 'rgba(255,246,224,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(lead.x, lead.y, 46 + held*22, 0, 6.283); ctx.fill();
    ctx.restore();

    if (t >= 1){
      phrase++; t = 0; held = 0;
      if (phrase === 1) void 0;
      if (phrase >= PHRASES){
        done = true;
        if (hint) hint.textContent = '';
        ctx.clearRect(0,0,W,H);
        later(1400, ()=>{ s.style.display = 'none'; startWave4Scene3(waveNum); });
      }
    }
  });
  later(75000, ()=>{ if (!done){ done = true; s.style.display = 'none'; startWave4Scene3(waveNum); } });
}

function startWave4Scene3(waveNum){
  later(1200, ()=> cueWatch(2500));
  const s = sceneShow('w4s3', { watchMs: 9000 });
  const illo = $('w4s3-falling');
  if (illo){ illo.style.transition = 'none'; illo.style.transform = 'rotate(0deg)'; void illo.offsetWidth; }
  wSay('w4s3_line', 1200);

  const T0 = performance.now(), TILT = 6200;
  rafLoop(()=>{
    if (!illo || s.style.display === 'none') return;
    const e = performance.now() - T0;
    if (e > TILT) return;
    const p = e/TILT;
    const wob = Math.sin(e/420) * (2 + p*9);
    const drop = p*p*26;
    illo.style.transform = 'rotate(' + wob.toFixed(2) + 'deg) translateY(' + drop.toFixed(1) + 'px)';
  });

  later(1500, ()=> void 0);
  later(TILT, ()=>{
    if (illo){ illo.style.transition = 'transform 900ms cubic-bezier(.5,0,.7,1), filter 900ms ease';
      illo.style.transform = 'rotate(-16deg) translateY(120px)'; illo.style.filter = 'blur(6px)'; }
  });
  later(TILT + 2400, ()=>{
    if (illo){ illo.style.transition = ''; illo.style.transform = ''; illo.style.filter = ''; }
    s.style.display = 'none'; startWave4Scene4(waveNum);
  });
}

function startWave4Scene4(waveNum){
  later(1200, ()=> cueWatch(7800));
  const s = sceneShow('w4s4', { watchMs: 9000 });
  Fatih.fadeActive(700);
  const cry = $('w4s4-crying');
  if (cry) cry.classList.remove('on');
  void s.offsetWidth;
  later(400, ()=>{ if (cry) cry.classList.add('on'); });
  const amb = Fatih.cue('margaret_w4_ambulance_01.wav', 'short ambulance and hospital door, this scene only, no crying');
  const go = ()=>{ if (go._ran) return; go._ran = true; s.style.display = 'none'; startWave4Scene5(waveNum); };
  if (amb && typeof amb.addEventListener === 'function'){
    amb.addEventListener('ended', ()=>{ Fatih.fadeActive(300); later(320, go); }, { once:true });
    later(9000, go);
  } else later(4200, go);
}

function startWave4Scene5(waveNum){
  later(1200, ()=> cueWatch(8300));
  const s = sceneShow('w4s5', { watchMs: 9000 });
  Fatih.fadeActive(600);
  const doll = $('w4s5-doll');
  if (doll) doll.classList.remove('on');
  void s.offsetWidth;
  later(400, ()=>{ if (doll) doll.classList.add('on'); });
  Fatih.cue('margaret_w4_crashdoll_01.wav', 'the car crash over the red doll, as delivered');
  const dollBed = SFX.play('w2f2_dollgirl');
  if (dollBed) dollBed.volume = 0.22;
  addCleanup(()=>{ try{ SFX.stop('w2f2_dollgirl'); }catch(e){} });
  later(8800, ()=> Fatih.fadeActive(700));
  later(9500, ()=>{ s.style.display = 'none'; startWave4Scene6(waveNum); });
}

function startWave4Scene6(waveNum){
  later(1200, ()=> cueWatch(28800));
  const s = sceneShow('w4s6', { watchMs: 9000 });
  Fatih.fadeActive(800);
  s.classList.remove('tumbling','blurring');
  void s.offsetWidth;

  Fatih.cue('silence', 'the room is silent before the refusal');
  const petalSt = makePetalField($('w4s6-petals'), { alpha:.85, rising:true, count: REDUCED_MOTION ? 160 : 460 });
  if (petalSt){ petalSt.speed = 0; petalSt.visible = 0; }
  let petalT = 0;
  rafLoop(()=>{
    if (!petalSt || !petalT) return;
    const p = Math.min(1, (performance.now() - petalT) / 9000);
    petalSt.speed = 0.5 + p * 1.6;
    petalSt.visible = 0.12 + p * 0.88;
  });

  const chain = (key, note, ms, next)=>{
    const a = bindCues(SFX.play(key), key);
    let ran = false;
    const go = ()=>{ if (ran) return; ran = true; next(); };
    if (a && typeof a.addEventListener === 'function'){
      a.addEventListener('ended', go, { once:true });
      later(ms, go);
    } else later(ms, go);
  };

  later(900, ()=>{
    chain('w4s6_noway', 'no way mama, I do not want to be like that', 4200, ()=>{
      later(700, ()=>{
        chain('w4s6_congrats', 'congratulation Maria, spoken cold', 3200, ()=>{
          Fatih.cue('margaret_w4_applause_01.wav', 'the hollow applause, only after the name is read');
          later(900, ()=>{ petalT = performance.now(); });
          later(2600, ()=> bindCues(SFX.play('w4s6_vow'), 'w4s6_vow'));
          later(9300, ()=>{
            s.classList.add('blurring');
          });
          later(10400, ()=>{ s.classList.remove('blurring'); s.classList.add('tumbling'); });
        });
      });
    });
  });
  later(30000, ()=>{
    if (petalSt) petalSt.speed = 0.25;
    s.classList.add('emptying');
  });
  later(29000, ()=>{ s.classList.remove('tumbling','emptying','blurring'); showWaveEndChoice(waveNum); });
}

function startWave5Scene1(waveNum){
  const s = sceneShow('w5s1');
  Fatih.fadeActive(600);
  const letter = $('w5s1-letter'), hint = $('w5s1-hint');
  letter.classList.remove('show','dismiss');
  if (hint){ hint.classList.remove('on'); hint.textContent = ''; }

  later(700,  ()=> letter.classList.add('show'));
  later(1800, ()=> showSub('', '<em>The letter from the dance academy had arrived.</em>', 4200));
  later(900,  ()=> cueWatch(5100));
  later(6000, ()=>{
    if (opened) return;
    if (hint){ hint.textContent = ''; hint.classList.remove('on'); }
    cueBrief('click', 'Click to open the letter.', ()=>{});
  });

  let opened = false;
  function open(){
    if (opened) return; opened = true;
    if (hint){ hint.textContent = ''; hint.classList.remove('on'); }
    cueClear();
    later(700, ()=> cueWatch(8000));
    hideSub();
    letter.classList.add('dismiss');
    later(1600, ()=>{ s.style.display = 'none'; startWave5Scene2(waveNum); });
  }
  let armed = false;
  later(1400, ()=>{ armed = true; });
  function onClick(){ if (armed) open(); }
  bindAdvanceKey(()=>{ if (armed) open(); });
  window.addEventListener('click', onClick);
  addCleanup(()=> window.removeEventListener('click', onClick));
}

function startWave5Scene2(waveNum){
  later(1200, ()=> cueWatch(7800));
  const s = sceneShow('w5s2', { watchMs: 9000 });
  const cert = $('w5s2-cert');
  if (cert) cert.classList.remove('show');
  void s.offsetWidth;
  later(400, ()=>{
    if (cert) cert.classList.add('show');
    Fatih.cue('margaret_w5_airport_announce_01.wav', 'the airport announcement, carried from the certificate onward');
  });
  later(9000, ()=>{ s.style.display = 'none'; startWave5Scene3(waveNum); });
}

function startWave5Scene3(waveNum){
  later(1200, ()=> cueWatch(12300));
  const s = sceneShow('w5s3', { watchMs: 9000 });
  const air = $('w5s3-airport');
  if (air) air.classList.remove('on');
  void s.offsetWidth;
  try{ SFX.stop('w5s3_song'); SFX.stop('w5s3_funeral'); }catch(e){}
  later(4200, ()=>{
    if (air) air.classList.add('on');
    if (!SFX.isPlaying('w5s3_airport'))
      Fatih.cue('margaret_w5_airport_announce_01.wav', 'airport announcement, tannoy reverb, over the blood-stained dress');
  });
  later(12700, ()=> Fatih.fadeActive(800));
  later(13500, ()=>{ s.style.display = 'none'; startWave5Scene4(waveNum); });
}

function matteEdgeWhite(src, ok, fail){
  const img = new Image();
  img.onerror = fail;
  img.onload = ()=>{
    try{
      const w = img.naturalWidth, h = img.naturalHeight;
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const x = c.getContext('2d');
      x.drawImage(img, 0, 0);
      const d = x.getImageData(0, 0, w, h), p = d.data;
      const corners = [0, (w - 1) * 4, (h - 1) * w * 4, ((h - 1) * w + w - 1) * 4];
      if (corners.some(o => p[o + 3] < 250)){ ok(src); return; }
      const seen = new Uint8Array(w * h);
      const q = new Int32Array(w * h);
      let head = 0, tail = 0;
      const pale = i => {
        const o = i * 4, r = p[o], g = p[o+1], b = p[o+2];
        const lo = Math.min(r, g, b), hi = Math.max(r, g, b);
        return lo > 232 && hi - lo < 14;
      };
      const push = i => { if (!seen[i] && pale(i)){ seen[i] = 1; q[tail++] = i; } };
      for (let X = 0; X < w; X++){ push(X); push((h - 1) * w + X); }
      for (let Y = 0; Y < h; Y++){ push(Y * w); push(Y * w + w - 1); }
      while (head < tail){
        const i = q[head++];
        const X = i % w, Y = (i / w) | 0;
        p[i * 4 + 3] = 0;
        if (X > 0) push(i - 1);
        if (X < w - 1) push(i + 1);
        if (Y > 0) push(i - w);
        if (Y < h - 1) push(i + w);
      }
      x.putImageData(d, 0, 0);
      ok(c.toDataURL('image/png'));
    } catch(e){ fail(); }
  };
  img.src = src;
}

function buildCrashStage(host){
  let root = host.querySelector('.w5crash');
  if (root) return root.__rig;
  root = document.createElement('div');
  root.className = 'w5crash';
  const im = document.createElement('img');
  im.alt = '';
  im.decoding = 'async';
  resolveImage(IMG.w5_crash, src => { im.src = src; });
  root.appendChild(im);
  host.appendChild(root);
  const rig = { root: root, img: im };
  root.__rig = rig;
  return rig;
}

const CHIT = 0.36, CPEAK = 0.415;

function renderCrash(rig, u, now){
  if (!rig || !rig.img) return 0;
  const im = rig.img;

  const approach = Math.min(1, u / CHIT);
  const impact = Math.max(0, Math.min(1, (u - CHIT) / (CPEAK - CHIT)));
  const after = Math.max(0, u - CPEAK);

  const scale = 1.06 - approach * 0.06 + impact * 0.05 - Math.min(0.03, after * 0.06);
  const shake = REDUCED_MOTION ? 0 : impact * (1 - impact) * 4 * 9 * Math.exp(-after * 14);
  const jx = shake ? Math.sin(now / 21) * shake : 0;
  const jy = shake ? Math.cos(now / 17) * shake * 0.55 : 0;

  im.style.transform = 'translate(' + jx.toFixed(2) + 'px,' + jy.toFixed(2) + 'px) scale(' + scale.toFixed(4) + ')';
  im.style.opacity = (0.34 + Math.min(1, u * 1.9) * 0.66).toFixed(3);
  im.style.filter = 'brightness(' + (0.72 + approach * 0.28 + impact * 0.22).toFixed(3) + ')';

  return impact > 0 ? impact * (1 - impact) * 4 : 0;
}

function buildPlaneStage(host){
  const NS='http://www.w3.org/2000/svg';
  let root = host.querySelector('svg.w5plane');
  if (root) return root.__rig;
  root = document.createElementNS(NS,'svg');
  root.setAttribute('class','w5plane');
  root.setAttribute('viewBox','0 0 1000 420');
  root.setAttribute('preserveAspectRatio','xMidYMid slice');
  root.style.cssText='position:absolute;inset:0;width:100%;height:100%;';
  const mk=(tag,attrs,parent)=>{ const n=document.createElementNS(NS,tag);
    for(const k in attrs) n.setAttribute(k,attrs[k]); (parent||root).appendChild(n); return n; };
  const g = mk('g',{});
  const art = mk('image',{x:300,y:168,width:330,height:132,
    preserveAspectRatio:'xMidYMid meet',opacity:0}, g);
  resolveImage(IMG.w5_plane, src => {
    const put = u => {
      art.setAttributeNS('http://www.w3.org/1999/xlink','href',u);
      art.setAttribute('href',u);
      art.setAttribute('opacity','1');
    };
    matteEdgeWhite(src, put, ()=> put(src));
  }, ()=>{
    mk('path',{d:'M 300 262 L 560 208 L 610 178 L 622 192 L 578 218 L 556 240 L 404 258 L 372 292 L 356 290 L 372 256 Z',
      fill:'#DDE3E7',stroke:'#000','stroke-width':2,'stroke-linejoin':'round'}, g);
    mk('path',{d:'M 470 232 L 522 176 L 538 182 L 506 236 Z',fill:'#C5CCD4',stroke:'#000','stroke-width':2}, g);
    mk('circle',{cx:388,cy:262,r:5,fill:'#A9C4DA',stroke:'#000','stroke-width':1.6}, g);
  });
  const rig = { root, g };
  root.__rig = rig;
  host.appendChild(root);
  return rig;
}
function renderPlane(rig, u, now){
  const t = Math.max(0, Math.min(1, u));
  const climb = Math.pow(t, 1.18);
  const depth = Math.pow(t, 0.62);
  const sc = 0.72 - depth * 0.58;
  const x = -290 + climb * 830;
  const y = 74 - Math.pow(climb, 0.82) * 250;
  const tilt = -7 - climb * 6;
  const drift = Math.sin(now / 2100) * (1 - depth) * 2.4;
  rig.g.setAttribute('transform',
    'translate(' + x.toFixed(1) + ',' + (y + drift).toFixed(1) + ') '
    + 'rotate(' + tilt.toFixed(1) + ' 465 234) '
    + 'translate(465,234) scale(' + sc.toFixed(4) + ') translate(-465,-234)');
  rig.g.setAttribute('opacity', (1 - depth * 0.42).toFixed(3));
}

function startWave5Scene4(waveNum){
  later(1200, ()=> cueWatch(4800));
  const s = sceneShow('w5s4', { watchMs: 9000 });
  Fatih.fadeActive(700);
  Fatih.cue('silence', 'no sound at all here, the plane and the crash alternate in silence');
  const plane = $('w5s4-plane'), flash = $('w5s4-flash');
  if (plane) plane.classList.remove('on');
  if (flash) flash.style.opacity = '0';

  const rig = buildCrashStage(s);
  const pRig = buildPlaneStage(s);
  pRig.root.style.opacity = '0';
  pRig.root.style.transition = 'opacity .07s linear';
  if (plane) plane.style.display = 'none';
  let pu = 0, pT0 = performance.now();
  rafLoop(()=>{
    if (s.style.display === 'none') return;
    const now = performance.now();
    if (pRig.root.style.opacity !== '0'){
      pu = Math.min(1, (now - pT0) / 9000);
      renderPlane(pRig, pu, now);
    }
  });
  rig.root.style.opacity = '0';
  rig.root.style.transition = 'opacity .07s linear';
  void s.offsetWidth;

  const BEATS = [
    { plane:true,  ms:2200, from:0,    to:0    },
    { plane:false, ms:1500, from:0,    to:0.33 },
    { plane:true,  ms:1700, from:0.33, to:0.33 },
    { plane:false, ms:1300, from:0.33, to:0.58 },
    { plane:true,  ms:1500, from:0.58, to:0.58 },
    { plane:false, ms:2100, from:0.58, to:1    }
  ];
  let bi = 0, running = true, beatT0 = performance.now(), u = 0;

  function enter(){
    const b = BEATS[bi];
    beatT0 = performance.now();
    u = b.from;
    if (b.plane){
      pRig.root.style.opacity = '1';
      rig.root.style.opacity = '0';
    } else {
      pRig.root.style.opacity = '0';
      rig.root.style.opacity = '1';
      if (flash && !REDUCED_MOTION && b.from > 0.30 && b.from < 0.40){
        flash.style.transition = 'none'; flash.style.opacity = '.92';
        requestAnimationFrame(()=>{ flash.style.transition = 'opacity .42s ease'; flash.style.opacity = '0'; });
      }
    }
  }
  enter();

  rafLoop(()=>{
    if (!running || s.style.display === 'none') return;
    const now = performance.now();
    const b = BEATS[bi];
    const k = Math.min(1, (now - beatT0) / b.ms);
    if (!b.plane){
      u = b.from + (b.to - b.from) * k;
      const fl = renderCrash(rig, u, now);
      if (flash && fl > 0.02 && !REDUCED_MOTION) flash.style.opacity = (fl * 0.5).toFixed(3);
    }
    if (k >= 1){
      bi++;
      if (bi >= BEATS.length){
        running = false;
        pRig.root.style.opacity = '0';
        rig.root.style.opacity = '0';
        later(1200, ()=>{ s.style.display = 'none'; startWave5Scene5(waveNum); });
        return;
      }
      enter();
    }
  });
  addCleanup(()=>{ running = false; });
}

function startWave5Scene5(waveNum){
  later(1200, ()=> cueWatch(38800));
  const s = sceneShow('w5s5', { watchMs: 9000 });
  Fatih.fadeActive(1200);
  const wav = $('w5s5-waving'), pet = $('w5s5-peter'), call = $('w5s5-call'), shut = $('w5s5-shut');
  [wav, pet, call].forEach(el => { if (el) el.classList.remove('on'); });
  if (shut) shut.classList.remove('on');
  void s.offsetWidth;

  later(400,  ()=>{
    if (wav) wav.classList.add('on');
    Fatih.cue('margaret_w2_weddingmarch_01.wav', 'wedding music as the daughter waves the plane away');
  });
  later(5600, ()=>{
    if (pet) pet.classList.add('on');
    if (wav) wav.classList.remove('on');
  });
  later(11000, ()=>{
    if (call) call.classList.add('on');
    if (pet) pet.classList.remove('on');
  });
  later(13400, ()=> bindCues(SFX.play('w5s5_videocall'), 'w5s5_videocall'));
  later(20600, ()=>{ hideSub(); Fatih.fadeActive(1400); if (shut) shut.classList.add('on'); });
  later(24000, ()=> showWaveEndChoice(waveNum));
}

function attachResidues(){
  mirrors.forEach(m => {
    const w = Number(m.dataset.wave);
    if (w < 2) return;
    if (!m.classList.contains('shattered-warm')) return;
    if (m.querySelector('.residue')) return;
    const d = document.createElement('div');
    d.className = 'residue r' + w;
    m.appendChild(d);

    const sv = document.createElement('div'); sv.className = 'silvering'; m.appendChild(sv);
    const ws = document.createElement('div'); ws.className = 'warmseep';  m.appendChild(ws);
  });
}

let endingStarted = false;

function loadP5(cb){
  if (window.p5){ cb(); return; }
  if (window.Libs){
    Libs.ensure('p5','assets/lib/p5.min.js','https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.min.js')
      .then(()=>{ try{ cb(); }catch(e){} });
    return;
  }
  if (loadP5._loading){ loadP5._q.push(cb); return; }
  loadP5._loading = true; loadP5._q = [cb];
  const sc = document.createElement('script');
  sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.min.js';
  sc.crossOrigin = 'anonymous';
  sc.onload = ()=> loadP5._q.forEach(f => { try{ f(); }catch(e){} });
  document.head.appendChild(sc);
}


function startEndingSequence(){
  hushLanding();
  mirrors.forEach(m => { if (m.classList.contains('shattered-warm')) setMirrorArt(m, 'shattered'); });
  if (endingStarted && startEndingSequence._ran) return;
  startEndingSequence._ran = true;
  endingStarted = true;
  try{ sessionStorage.setItem('margaret_complete','true'); }catch(e){}
  houseActive = false;
  hideSub();
  loadP5(()=>{});
  attachResidues();

  const order = [1,2,3,4,5].map(n => mirrors.find(m => m.dataset.wave === String(n)));
  const pts = order.map(m => {
    const r = m.getBoundingClientRect();
    return { x:r.left+r.width/2, y:r.top+r.height/2 };
  });
  torch.style.display = 'block';
  const t0 = performance.now(), SWEEP = 9000;
  const stopSweep = rafFree(()=>{
    const p = Math.min(1, (performance.now()-t0)/SWEEP);
    const seg = Math.min(pts.length-2, Math.floor(p*(pts.length-1)));
    const lp = p*(pts.length-1) - seg;
    const a = pts[seg], b = pts[seg+1];
    const x = a.x+(b.x-a.x)*lp, y = a.y+(b.y-a.y)*lp;

    torch.style.background = 'radial-gradient(circle at '+x+'px '+y+'px, rgba(224,200,160,0.0) 0px, rgba(224,200,160,0.05) 70px, rgba(2,8,14,.97) 190px)';
    order.forEach((m,i)=>{
      m.classList.toggle('near', Math.hypot(x-pts[i].x, y-pts[i].y) < 150);
    });
    if (p >= 1){ stopSweep(); setTimeout(startRedStorm, 900); }
  });
}

const RED_STORM_KEYS = ['frag_doll','frag_mirror','frag_ring2','frag_shoe2','frag_skidmark'];

function paintRedStormFrames(){
  return RED_STORM_KEYS
    .map(k => IMG[k])
    .filter(Boolean)
    .map(file => { const im = new Image(); resolveImage(file, src => { im.src = src; }, ()=>{}); return im; });
}

function startRedStorm(){
  const wrap = $('endingStorm'); wrap.style.display = 'block';
  const canvas = $('endingStorm-canvas'), ctx = canvas.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = window.innerWidth*dpr; canvas.height = window.innerHeight*dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const frames = paintRedStormFrames();

  Fatih.cue('margaret_w2_alarm_01.wav', 'the short ambulance under the red storm, no crying');
  setTimeout(()=> Fatih.fadeActive(1600), (REDUCED_MOTION ? 4600 : 7000) - 1700);

  const SIDES = [
    { x:0.50, y:0.16 }, { x:0.50, y:0.84 },
    { x:0.18, y:0.50 }, { x:0.82, y:0.50 },
    { x:0.32, y:0.28 }, { x:0.70, y:0.30 },
    { x:0.30, y:0.72 }, { x:0.72, y:0.70 },
  ];
  const shots = [];
  let nextAt = 0, si = 0, fi = 0;

  const T0 = performance.now();
  const TOTAL = REDUCED_MOTION ? 4600 : 7000;
  let saidLine = false, ended = false;

  const stop = rafFree(()=>{
    const now = performance.now(), e = now - T0;
    const W = window.innerWidth, H = window.innerHeight;
    const prog = Math.min(1, e/TOTAL);

    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = 'rgba(10,7,7,0.92)';
    ctx.fillRect(0,0,W,H);

    if (e >= nextAt && frames.length){
      const spot = SIDES[si % SIDES.length]; si++;
      const im = frames[fi % frames.length]; fi++;
      shots.push({ im, x:spot.x, y:spot.y, born:now,
        life: REDUCED_MOTION ? 900 : 520 + Math.random()*260,
        scale: 0.16 + Math.random()*0.08,
        rot: (Math.random()-0.5)*0.24 });
      nextAt = e + (REDUCED_MOTION ? 420 : 260 - 150*prog) + Math.random()*90;
    }

    for (let i = shots.length-1; i >= 0; i--){
      const sh = shots[i];
      const t = (now - sh.born)/sh.life;
      if (t >= 1){ shots.splice(i,1); continue; }
      const im = sh.im;
      if (!im || !im.naturalWidth) continue;
      const a = Math.sin(Math.PI * t);
      const base = Math.min(W, H) * sh.scale;
      const ratio = im.naturalWidth / im.naturalHeight;
      const w = ratio >= 1 ? base : base*ratio;
      const h = ratio >= 1 ? base/ratio : base;
      ctx.save();
      ctx.globalAlpha = a * 0.95;
      ctx.translate(sh.x*W, sh.y*H);
      ctx.rotate(sh.rot);
      ctx.drawImage(im, -w/2, -h/2, w, h);
      ctx.restore();
    }

    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = 'rgba(178,58,46,' + (0.30 + 0.28*prog).toFixed(3) + ')';
    ctx.fillRect(0,0,W,H);
    ctx.restore();

    if (!REDUCED_MOTION){
      const flick = 0.05 + 0.09*Math.abs(Math.sin(e*0.011));
      ctx.fillStyle = 'rgba(178,58,46,' + flick.toFixed(3) + ')';
      ctx.fillRect(0,0,W,H);
    }

    if (!saidLine && e > TOTAL-2000){
      saidLine = true;
      
    }
    if (!ended && e >= TOTAL){ ended = true; stop(); cutToWhite(); }
  });
}

const SHOE_ASKS = ['redshoe_1','redshoe_3','redshoe_5'];
const SHOE_AT = [900, 4200, 7500];
const SHOE_CLOSE = 10600;
function cutToWhite(){
  hideSub();
  $('endingStorm').style.display = 'none';

  const pic = $('endingStagePic');
  if (pic){
    setAsset(pic, 'shoe_gift');
    pic.style.display = 'block';
    void pic.offsetWidth;
    requestAnimationFrame(()=> pic.classList.add('on'));
    setTimeout(()=> Fatih.fadeActive(900), 200);
    SHOE_ASKS.forEach((key, i)=> setTimeout(()=>{
      const a = SFX.play(key);
      if (a) a.volume = 0.34;
    }, SHOE_AT[i]));
    setTimeout(()=> pic.classList.add('grow1'), SHOE_AT[1] - 700);
    setTimeout(()=> pic.classList.add('grow2'), SHOE_AT[2] - 700);
    setTimeout(()=> pic.classList.add('closing'), SHOE_CLOSE);
    setTimeout(()=>{
      pic.classList.remove('on','grow1','grow2','closing');
      pic.style.display = 'none';
      openStage();
    }, SHOE_CLOSE + 2200);
  } else {
    Fatih.fadeActive(900);
    setTimeout(openStage, 2200);
  }
}

function openStage(){
  $('endingWhite').style.display = 'none';
  const stage = $('endingStage');
  stage.style.display = 'block';
  requestAnimationFrame(()=> stage.classList.add('on'));
  if (cameraAllowed()) loadMediaPipeHands();

  let started = false;
  const begin = ()=>{
    if (started) return; started = true;
    loadP5(()=> setTimeout(()=>{ mountGraceDance(); inviteToDance(); }, 400));
  };
  later(1400, ()=>{
    const line = bindCues(SFX.play('end_laststage'), 'end_laststage');
    if (line && typeof line.addEventListener === 'function'){
      line.addEventListener('ended', ()=> setTimeout(begin, 900), { once:true });
      line.addEventListener('error', ()=> setTimeout(begin, 400), { once:true });
      const fit = ()=>{
        const d = line.duration;
        if (d && isFinite(d) && d > 0.4) later(Math.round(d * 1000) + 1200, begin);
      };
      if (line.readyState >= 1) fit();
      else line.addEventListener('loadedmetadata', fit, { once:true });
      later(11000, begin);
    } else later(2200, begin);
  });
}

const DANCE_LINES = {
  lead:   'she is dancing it from memory. move your hand and she will breathe with you.',
  follow: 'now she is following you. open your fingers and her arms will open.',
  drift:  'she is losing the thread. keep moving, stay with her.'
};

const DANCE_LINES_MOUSE = {
  lead:   'she is dancing it from memory. move the cursor and she will breathe with you.',
  follow: 'now she is following you. hold the mouse button and her arms will open.',
  drift:  'she is losing the thread. keep moving, stay with her.'
};

window.danceActLine = function(act){
  const G = GestureDrive;
  if (act === 'lead') cueClear();
  G._act = act === 'lead' ? 0 : (act === 'follow' ? 1 : 2);
  const set = (G.mouseDriven && !G.hands2) ? DANCE_LINES_MOUSE : DANCE_LINES;
  const text = set[act];
  if (!text) return;
  if (act === 'follow'){
    G._opened = false;
    endingLine(text);
  } else {
    endingLine(text, act === 'drift' ? 5200 : 6000);
  }
};

function danceOpened(){
  const G = GestureDrive;
  if (G._act !== 1 || G._opened) return;
  G._opened = true;
  endingLine('yes, like that', 2600);
}

const CUE_GLYPHS = {
  hold:
    '<svg viewBox="0 0 120 74" xmlns="http://www.w3.org/2000/svg">' +
    '<rect class="cue-cap" x="10" y="16" width="100" height="34" rx="8"/>' +
    '<text class="cue-caplabel" x="60" y="39" text-anchor="middle">space</text>' +
    '<path class="cue-arrow" d="M60 4 L60 12 M54 8 L60 13 L66 8"/></svg>',
  tap:
    '<svg viewBox="0 0 120 74" xmlns="http://www.w3.org/2000/svg">' +
    '<rect class="cue-cap" x="10" y="16" width="100" height="34" rx="8"/>' +
    '<text class="cue-caplabel" x="60" y="39" text-anchor="middle">space</text>' +
    '<path class="cue-arrow" d="M60 4 L60 12 M54 8 L60 13 L66 8"/>' +
    '<circle class="cue-beat" cx="26" cy="64" r="4"/>' +
    '<circle class="cue-beat b2" cx="46" cy="64" r="4"/>' +
    '<circle class="cue-beat b3" cx="66" cy="64" r="4"/>' +
    '<circle class="cue-beat b4" cx="86" cy="64" r="4"/></svg>',
  speak:
    '<svg viewBox="0 0 120 74" xmlns="http://www.w3.org/2000/svg">' +
    '<path class="cue-cap" d="M50 18 a10 10 0 0 1 20 0 L70 38 a10 10 0 0 1 -20 0 Z"/>' +
    '<path class="cue-arrow" d="M42 36 a18 18 0 0 0 36 0 M60 54 L60 62"/>' +
    '<circle class="cue-beat" cx="34" cy="28" r="3"/>' +
    '<circle class="cue-beat b2" cx="26" cy="28" r="3"/>' +
    '<circle class="cue-beat b3" cx="86" cy="28" r="3"/>' +
    '<circle class="cue-beat b4" cx="94" cy="28" r="3"/></svg>',
  drag:
    '<svg viewBox="0 0 120 74" xmlns="http://www.w3.org/2000/svg">' +
    '<path class="cue-cap" d="M46 12 L46 32 a10 10 0 0 0 20 0 L66 12 a10 10 0 0 0 -20 0 Z"/>' +
    '<path class="cue-arrow" d="M56 40 L56 62 M48 54 L56 63 L64 54"/></svg>',
  press:
    '<svg viewBox="0 0 120 74" xmlns="http://www.w3.org/2000/svg">' +
    '<path class="cue-arrow" d="M60 4 L60 14 M54 9 L60 15 L66 9"/>' +
    '<rect class="cue-cap" x="34" y="22" width="52" height="26" rx="7"/>' +
    '<circle class="cue-beat" cx="34" cy="63" r="4"/>' +
    '<circle class="cue-beat b2" cx="52" cy="63" r="4"/>' +
    '<circle class="cue-beat b3" cx="70" cy="63" r="4"/>' +
    '<circle class="cue-beat b4" cx="88" cy="63" r="4"/></svg>',
  type:
    '<svg viewBox="0 0 120 74" xmlns="http://www.w3.org/2000/svg">' +
    '<rect class="cue-cap" x="14" y="26" width="18" height="18" rx="4"/>' +
    '<rect class="cue-cap" x="38" y="26" width="18" height="18" rx="4"/>' +
    '<rect class="cue-cap" x="62" y="26" width="18" height="18" rx="4"/>' +
    '<rect class="cue-cap" x="86" y="26" width="18" height="18" rx="4"/>' +
    '<circle class="cue-beat" cx="23" cy="60" r="4"/>' +
    '<circle class="cue-beat b2" cx="47" cy="60" r="4"/>' +
    '<circle class="cue-beat b3" cx="71" cy="60" r="4"/>' +
    '<circle class="cue-beat b4" cx="95" cy="60" r="4"/></svg>',
  click:
    '<svg viewBox="0 0 120 74" xmlns="http://www.w3.org/2000/svg">' +
    '<path class="cue-arrow" d="M52 10 L52 20 M38 24 L45 31 M66 24 L59 31"/>' +
    '<path class="cue-cap" d="M46 34 L46 56 a10 10 0 0 0 20 0 L66 34 a10 10 0 0 0 -20 0 Z"/>' +
    '<path class="cue-arrow" d="M56 34 L56 44"/>' +
    '<circle class="cue-beat" cx="56" cy="66" r="4"/></svg>',
  move:
    '<svg viewBox="0 0 120 74" xmlns="http://www.w3.org/2000/svg">' +
    '<path class="cue-arrow" d="M18 37 L34 37 M24 30 L17 37 L24 44"/>' +
    '<path class="cue-arrow" d="M102 37 L86 37 M96 30 L103 37 L96 44"/>' +
    '<circle class="cue-hand" cx="60" cy="37" r="13"/></svg>'
};

CUE_GLYPHS.watch =
  '<svg viewBox="0 0 120 74" xmlns="http://www.w3.org/2000/svg">' +
  '<path class="cue-eye" d="M18 37 Q60 10 102 37 Q60 64 18 37 Z"/>' +
  '<circle class="cue-pupil" cx="60" cy="37" r="9"/></svg>';

const CUE_TAUGHT = {};
let cueWatchTimer = null, cueLive = false;

function cueWatch(ms){
  if (cueLive) return;
  const el = cuePanel();
  const card = el.querySelector('.cue-card');
  el.className = '';
  el.style.removeProperty('justify-content');
  el.style.removeProperty('padding');
  card.className = 'cue-card watch verb-watch';
  card.classList.remove('breathe'); void card.offsetWidth;
  card.classList.add('breathe');
  el.querySelector('.cue-glyph').innerHTML = CUE_GLYPHS.watch;
  el.querySelector('.cue-words').textContent = 'just watch.';
  const go = el.querySelector('.cue-go');
  go.style.display = 'none';
  const bar = el.querySelector('.cue-bar');
  bar.style.display = 'block';
  const fill = bar.querySelector('i');
  requestAnimationFrame(()=> el.classList.add('on'));
  if (ms && isFinite(ms) && ms > 400){
    bar.classList.remove('drift');
    if (fill){
      fill.style.transition = 'none';
      fill.style.transform = 'scaleX(0)';
      void fill.offsetWidth;
      fill.style.transition = 'transform ' + Math.round(ms) + 'ms linear';
      fill.style.transform = 'scaleX(1)';
    }
  } else {
    bar.classList.add('drift');
    if (fill){ fill.style.transition = ''; fill.style.transform = ''; }
  }
}

function cueScheduleWatch(ms){
  if (cueWatchTimer) clearTimeout(cueWatchTimer);
  if (!ms || !isFinite(ms) || ms < 400) return;
  cueWatchTimer = setTimeout(()=>{ cueWatch(ms); }, 1500);
}

function cuePanel(){
  let el = $('cuePanel');
  if (!el){
    el = document.createElement('div');
    el.id = 'cuePanel';
    el.setAttribute('aria-hidden','true');
    el.dataset.thread = (window.SS_THREAD || 'margaret');
    el.innerHTML = '<div class="cue-card">' +
      '<span class="cue-mist"></span>' +
      '<div class="cue-glyph"></div>' +
      '<div class="cue-words"></div>' +
      '<div class="cue-bar"><i></i></div>' +
      '<div class="cue-go">press to begin</div></div>';
    document.body.appendChild(el);
  }
  return el;
}

const WAVE_MARKS = {
  1: ['Rest the cursor on a place and wait for it to settle.',
      'Hold the space bar to lift her onto her toes.',
      'Press it again and again when she slips.'],
  2: ['Click the door, the pieces, the things that wait.',
      'Hold the I, D and O keys when she cannot say it.',
      'Move slowly. She cannot follow anything fast.'],
  3: ['Move the mouse and stay near her.',
      'Hold the mouse button and pull downward.',
      'Click what she is looking at.'],
  4: ['Click the mirror when the phone starts ringing.',
      'Move the mouse over a thing to look at it.',
      'Wait. She is slower than you.'],
  5: ['Click to open what arrives.']
};

function cueHome(){
  const el = $('cuePanel');
  if (!el) return;
  el.classList.remove('low-left','top-left','centred');
  el.style.removeProperty('justify-content');
  el.style.removeProperty('padding');
}

function centredMarks(rows, seenKey, after){
  if (seenKey && centredMarks._seen && centredMarks._seen[seenKey]){ if (after) after(); return; }
  centredMarks._seen = centredMarks._seen || {};
  if (seenKey) centredMarks._seen[seenKey] = true;
  if (window.Mode) Mode.act();
  const el = cuePanel();
  const card = el.querySelector('.cue-card');
  el.className = 'centred';
  card.className = 'cue-card cue-class';
  const words = el.querySelector('.cue-words');
  el.querySelector('.cue-glyph').innerHTML = '';
  el.querySelector('.cue-bar').style.display = 'none';
  words.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'cue-marks';
  rows.forEach(r=>{
    const p = document.createElement('p');
    p.className = 'cue-mark';
    p.textContent = Array.isArray(r) ? r.join(' ') : r;
    wrap.appendChild(p);
  });
  words.appendChild(wrap);
  const go = el.querySelector('.cue-go');
  go.textContent = 'press space to begin';
  go.style.display = 'block';
  requestAnimationFrame(()=> el.classList.add('on'));

  centredMarks._open = true;
  let done = false;
  const close = ()=>{
    if (done) return; done = true;
    centredMarks._open = false;
    window.removeEventListener('keydown', key);
    window.removeEventListener('pointerdown', close);
    clearTimeout(bail);
    el.classList.remove('centred');
    setTimeout(()=>{
      el.classList.remove('on');
      setTimeout(()=>{ words.innerHTML = ''; }, 700);
    }, 900);
    if (after) after();
    const deferred = centredMarks._deferred;
    if (deferred){ centredMarks._deferred = null; setTimeout(deferred, 950); }
  };
  const key = (e)=>{ if (e.code === 'Space' || e.key === 'Enter'){ e.preventDefault(); close(); } };
  window.addEventListener('keydown', key);
  window.addEventListener('pointerdown', close);
  const bail = setTimeout(close, 180000);
}

function houseBrief(){
  centredMarks(['Hold the mouse button down and pull the room sideways.',
                'The left and right arrow keys move it too.',
                'Five mirrors are waiting. Each one holds a memory.',
                'Click a mirror to go inside it.'], 'house');
}

function waveBrief(waveNum, after){
  const rows = WAVE_MARKS[waveNum];
  if (!rows){ if (after) after(); return; }
  centredMarks(rows, 'w' + waveNum, after);
}

function cueBriefLeft(verb, words, onReady){
  return cueBrief(verb, words, onReady, 'left');
}

function cueAt(where){
  const el = cuePanel();
  el.classList.remove('low-left','top-left');
  if (where === 'left') el.classList.add('top-left');
}

function cueBrief(verb, words, onReady, where){
  if (window.Mode) Mode.act();
  cueLive = true;
  if (cueWatchTimer){ clearTimeout(cueWatchTimer); cueWatchTimer = null; }
  const el = cuePanel();
  const card = el.querySelector('.cue-card');
  el.className = where === 'left' ? 'top-left' : '';
  if (where === 'left'){
    el.style.setProperty('justify-content', 'flex-start', 'important');
    el.style.setProperty('padding', '4.4vh 0 0 3.4vw', 'important');
  } else {
    el.style.removeProperty('justify-content');
    el.style.removeProperty('padding');
  }
  card.className = 'cue-card teach verb-' + verb;
  card.classList.remove('breathe'); void card.offsetWidth;
  card.classList.add('breathe');
  el.querySelector('.cue-glyph').innerHTML = CUE_GLYPHS[verb] || '';
  el.querySelector('.cue-words').textContent = words;
  el.querySelector('.cue-bar').style.display = 'none';
  const go = el.querySelector('.cue-go');
  go.style.display = 'none';
  card.classList.remove('teach');
  card.classList.add('live');
  CUE_TAUGHT[verb] = true;
  requestAnimationFrame(()=> el.classList.add('on'));
  if (onReady) onReady();
  return el;
}

function cueProgress(p){
  const el = $('cuePanel');
  if (!el) return;
  const bar = el.querySelector('.cue-bar i');
  if (bar) bar.style.transform = 'scaleX(' + Math.max(0, Math.min(1, p)).toFixed(3) + ')';
}

function cueUrgency(p){
  const el = $('cuePanel');
  if (!el) return;
  const bar = el.querySelector('.cue-bar');
  if (!bar) return;
  if (p < 0.45){
    if (bar.classList.contains('urgent')) bar.classList.remove('urgent');
    return;
  }
  const k = Math.min(1, (p - 0.45) / 0.55);
  bar.style.setProperty('--beat', (0.9 - k * 0.55).toFixed(2) + 's');
  if (!bar.classList.contains('urgent')) bar.classList.add('urgent');
}

function cueBeat(){
  const el = $('cuePanel');
  if (!el) return;
  const card = el.querySelector('.cue-card');
  card.classList.remove('hit'); void card.offsetWidth;
  card.classList.add('hit');
}

function cueClear(){
  if (centredMarks._open){ centredMarks._deferred = cueClear; return; }
  if (window.Mode) Mode.watch();
  cueHome();
  cueLive = false;
  if (cueWatchTimer){ clearTimeout(cueWatchTimer); cueWatchTimer = null; }
  const el = $('cuePanel');
  if (!el) return;
  el.classList.remove('on');
  setTimeout(()=>{ try{ el.remove(); }catch(e){} }, 900);
}

function waitRing(show, p){
  const el = $('waitRing');
  if (!el) return;
  if (!show){ el.classList.remove('on'); return; }
  el.classList.add('on');
  const bar = el.querySelector('i');
  if (bar) bar.style.transform = 'scaleX(' + Math.max(0, Math.min(1, p)).toFixed(3) + ')';
}

function hintCount(hostId, left){
  const h = $(hostId);
  if (!h) return;
  let c = h.querySelector('.hint-count');
  if (!c){ c = document.createElement('span'); c.className = 'hint-count'; h.appendChild(c); }
  c.textContent = left > 0 ? ('\u00d7 ' + left) : '';
}

function endingLine(text, ms){
  const hint = $('endingHint');
  if (!hint) return;
  hint.classList.remove('on');
  setTimeout(()=>{ hint.textContent = text; hint.classList.add('on'); }, 340);
  if (ms) setTimeout(()=> hint.classList.remove('on'), ms);
}

function showHandCue(){
  const cue = $('endingCue');
  if (!cue) return;
  const label = cue.querySelector('span');
  if (label) label.textContent = cameraAllowed()
    ? 'raise your hand to the camera'
    : 'move the cursor to take her hand';
  cue.classList.add('on');
  if (window.Grammar) Grammar.live(cue, true);
}

function hideHandCue(){
  const cue = $('endingCue');
  if (!cue) return;
  cue.classList.remove('on');
  if (window.Grammar) Grammar.live(cue, false);
}

function awaitControl(maxMs){
  return new Promise(resolve => {
    let done = false, waited = 0;
    const STEP = 400;
    const finish = ()=>{
      if (done) return;
      done = true;
      clearInterval(tick);
      window.removeEventListener('margaretControlReady', finish);
      hideHandCue();
      resolve();
    };
    const tick = setInterval(()=>{
      if (GestureDrive._pending) return;
      waited += STEP;
      if (waited >= maxMs) finish();
    }, STEP);
    window.addEventListener('margaretControlReady', finish, { once:true });
  });
}

function inviteToDance(){
  window.dispatchEvent(new CustomEvent('margaretInvite'));
  setTimeout(()=>{
    centredMarks(cameraAllowed()
      ? ['Raise your hand to the camera, or move the mouse.',
         'Move slowly. She follows where you lead.',
         'Keep going until the music ends.']
      : ['Move the mouse slowly and she will follow.',
         'Keep going until the music ends.'], 'ending');
  }, 900);
  setTimeout(()=> endingLine('she is waiting for someone to lead', 3200), 1400);
  setTimeout(()=>{
    endingLine(cameraAllowed() ? 'let her see your hand' : 'take her hand and lead her');
    showHandCue();
    startGestureDrive();
  }, 3600);
  setTimeout(async ()=>{
    await awaitControl(25000);
    cueClear();
    const music = Fatih.cue('margaret_ending_lastdance_01.wav', 'the dance music, kept for this moment alone');
    const clock = ()=>{
      const d = music && music.duration;
      if (d && isFinite(d) && d > 8 && typeof window.setDanceClock === 'function')
        window.setDanceClock(Math.round(d * 1000));
    };
    if (music && typeof music.addEventListener === 'function'){
      if (music.readyState >= 1) clock();
      else music.addEventListener('loadedmetadata', clock, { once:true });
    }
    window.addEventListener('margaretGestureComplete', onDanceComplete, { once:true });

    const bow = ()=>{ cueClear(); window.dispatchEvent(new CustomEvent('margaretGestureComplete')); };
    startLastDance._safety = setTimeout(bow, 40000);
    if (music && typeof music.addEventListener === 'function'){
      music.addEventListener('ended', bow, { once:true });
      const fit = ()=>{
        const d = music.duration;
        if (d && isFinite(d) && d > 1){
          clearTimeout(startLastDance._safety);
          startLastDance._safety = setTimeout(bow, Math.round(d * 1000) + 5000);
        }
      };
      if (music.readyState >= 1) fit();
      else {
        music.addEventListener('loadedmetadata', fit, { once:true });
        music.addEventListener('error', ()=>{
          clearTimeout(startLastDance._safety);
          startLastDance._safety = setTimeout(bow, 40000);
        }, { once:true });
      }
    }
  }, 7200);
}

function startLastDance(){
  openStage();
}

const GestureDrive = { stream:null, hands:null, hands2:null, video:null, preview:null, running:false,
  engaged:false, metOnce:false, mouseDriven:false, smooth:null, lastSeen:0,
  _readyP:null, _teardown:null, _nudge:null, _act:0 };

const MP_LOCAL = 'assets/lib/mediapipe/';
const MP_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/';
let MP_BASE = MP_LOCAL;

function loadHandsFrom(base){
  return new Promise(res => {
    const sc = document.createElement('script');
    sc.src = base + 'hands.js';
    if (base === MP_CDN) sc.crossOrigin = 'anonymous';
    sc.onload = ()=> res(!!window.Hands);
    sc.onerror = ()=>{ sc.remove(); res(false); };
    document.head.appendChild(sc);
  });
}

function loadMediaPipeHands(){
  if (window.Hands){ window.SS_MP = 'already loaded'; return Promise.resolve(true); }
  if (loadMediaPipeHands._p) return loadMediaPipeHands._p;
  loadMediaPipeHands._p = (async ()=>{
    if (await loadHandsFrom(MP_LOCAL)){
      MP_BASE = MP_LOCAL;
      window.SS_MP = 'local';
      return true;
    }
    if (await loadHandsFrom(MP_CDN)){
      MP_BASE = MP_CDN;
      window.SS_MP = 'cdn fallback';
      return true;
    }
    window.SS_MP = 'unreachable from ' + MP_LOCAL + ' and the cdn';
    return false;
  })();
  return loadMediaPipeHands._p;
}

function cameraAllowed(){
  const q = location.search;
  if (q.indexOf('nocam') >= 0 || q.indexOf('mouse') >= 0) return false;
  if (window.SS_CAMERA_REFUSED) return false;
  if (window.SS_CAMERA_ENABLED === false && !window.somewhereStillCameraStream) return false;
  return true;
}

function prewarmGestureDrive(){
  if (!cameraAllowed()) return Promise.resolve(false);
  if (GestureDrive._readyP) return GestureDrive._readyP;
  GestureDrive._pending = true;
  GestureDrive._readyP = (async ()=>{
    try {
      if (window.SS_CAMERA_REFUSED){ window.SS_CAM_WHY = 'refused earlier'; return false; }
      if (location.search.indexOf('nocam') >= 0){ window.SS_CAM_WHY = 'nocam in the url'; return false; }
      if (!window.isSecureContext){
        window.SS_CAM_WHY = 'not a secure context (' + location.protocol + '//' + location.hostname + ')';
        return false;
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
        window.SS_CAM_WHY = 'mediaDevices unavailable';
        return false;
      }

      const alive = (st)=> !!st && st.getVideoTracks
        && st.getVideoTracks().some(t => t.readyState === 'live');
      let stream = window.somewhereStillCameraStream || null;
      if (!alive(stream)) stream = null;
      if (!stream){
        window.SS_CAM_WHY = 'asking for the camera';
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video:true });
          window.somewhereStillCameraStream = stream;
          window.SS_CAM_WHY = 'camera granted';
        } catch(err){
          window.SS_CAM_WHY = 'camera denied: ' + ((err && err.name) || '?');
          throw err;
        }
      }

      const okScript = await loadMediaPipeHands();
      if (!okScript || !window.Hands) return false;
      GestureDrive.stream = stream;
      window.SS_CAMERA_ENABLED = true;

      let shell = $('gesturePreview');
      if (!shell){
        shell = document.createElement('div');
        shell.id = 'gesturePreview';
        shell.setAttribute('aria-hidden','true');
        document.body.appendChild(shell);
      }
      shell.innerHTML = '';
      const video = document.createElement('video');
      video.muted = true; video.playsInline = true; video.srcObject = stream;
      shell.appendChild(video);
      await video.play().catch(()=>{});
      GestureDrive.video = video;
      GestureDrive.preview = shell;

      const hands = new window.Hands({ locateFile: f => MP_BASE + f });
      hands.setOptions({ maxNumHands:2, selfieMode:true,
        modelComplexity:0, minDetectionConfidence:0.6, minTrackingConfidence:0.6 });
      await hands.initialize().catch(()=>{});
      GestureDrive.hands = hands;
      return true;
    } catch(e){ window.SS_CAMERA_REFUSED = true; return false; }
  })().then(r => { GestureDrive._pending = false; return r; },
            e => { GestureDrive._pending = false; return false; });
  return GestureDrive._readyP;
}

function attachMouseDrive(hint){
  const G = GestureDrive;
  G.mouseDriven = true;
  let holding = false, graceT = 0, lastN = null;
  let open = 0.5, lead = 0, openT = performance.now();
  const GRACE_MS = 1600;
  const norm = (e)=> ({ x: e.clientX/window.innerWidth, y: e.clientY/window.innerHeight });

  function connect(n){
    if (!G.engaged){
      G.engaged = true;
      window.dispatchEvent(new CustomEvent('margaretControlReady'));
      if (hint) hint.classList.remove('on');
      if (typeof window.registerGestureSource === 'function') window.registerGestureSource();
    }
    const now = performance.now();
    const dt = Math.min(120, now - openT); openT = now;
    const want = holding ? 0.94 : 0.30;
    open += (want - open) * Math.min(1, dt / 520);
    if (holding) danceOpened();
    if (lastN){
      const dx = n.x - lastN.x;
      lead = lead * 0.86 + Math.max(-1, Math.min(1, dx * 26)) * 0.14;
    }
    lastN = n;
    if (typeof window.feedGesturePoint === 'function') window.feedGesturePoint(n.x, n.y);
    if (typeof window.feedGestureHands === 'function')
      window.feedGestureHands([
        { x: n.x - 0.055 - lead * 0.035, y: n.y + lead * 0.030, open: open },
        { x: n.x + 0.055 - lead * 0.035, y: n.y - lead * 0.030, open: open }
      ]);
  }
  function down(e){ holding = true; graceT = 0; connect(norm(e)); }
  function move(e){
    graceT = performance.now() + GRACE_MS;
    connect(norm(e));
  }
  function up(){ holding = false; }
  window.addEventListener('mousedown', down);
  window.addEventListener('mousemove', move);
  window.addEventListener('mouseup', up);
  window.addEventListener('mouseleave', up);
  G._teardown = ()=>{
    window.removeEventListener('mousedown', down);
    window.removeEventListener('mousemove', move);
    window.removeEventListener('mouseup', up);
    window.removeEventListener('mouseleave', up);
  };
}

function ssCamBadge(msg){
  window.SS_CAM = msg;
  if (location.search.indexOf('debug') < 0) return;
  let el = document.getElementById('ss-cam-badge');
  if (!el){
    el = document.createElement('div');
    el.id = 'ss-cam-badge';
    el.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:2147483647;'
      + 'padding:8px 14px;border-radius:4px;background:rgba(8,12,20,.9);'
      + 'color:#EAF2F6;font:13px/1.4 system-ui;letter-spacing:.04em;'
      + 'pointer-events:none;max-width:70vw';
    document.body.appendChild(el);
  }
  el.textContent = msg;
}

async function startGestureDrive(){
  const hint = $('endingHint');
  const G = GestureDrive;
  G.running = true;

  ssCamBadge('starting gesture drive...');
  const ok = await prewarmGestureDrive();
  ssCamBadge(ok ? 'camera + tracking ready'
                : ('no gesture: ' + (window.SS_CAM_WHY || 'unknown') +
                   ' | mediapipe: ' + (window.SS_MP || 'not attempted') +
                   ' | stream: ' + (G.stream ? 'open' : 'none')));

  if (G.preview && G.stream) later(200, ()=> G.preview.classList.add('on'));

  if (!ok){
    cueBrief('move', G.stream
      ? 'The camera is on, but hand tracking did not load. Move the cursor instead.'
      : 'Move the cursor and she will follow it.', ()=>{}, 'left');
    attachMouseDrive(hint);
    return;
  }

  cueBrief('move', 'Raise your hand. She will follow it.', ()=>{}, 'left');
  if (G.preview) later(200, ()=> G.preview.classList.add('on'));
  G.metOnce = false;
  G._nudge = setTimeout(()=>{
    if (!G.running || G.metOnce) return;
    endingLine('or move the cursor, she will follow that too');
    attachMouseDrive($('endingHint'));
  }, 18000);

  const readHand = (lm)=>{
    const palm = lm[9], wrist = lm[0];
    const span = Math.hypot(palm.x - wrist.x, palm.y - wrist.y) || 0.08;
    let reach = 0;
    [4, 8, 12, 16, 20].forEach(k => {
      if (lm[k]) reach += Math.hypot(lm[k].x - palm.x, lm[k].y - palm.y);
    });
    const open = Math.max(0, Math.min(1, (reach / 5 / span - 0.62) / 0.86));
    return { x: 1 - palm.x, y: palm.y, open };
  };

  G.hands.onResults((res)=>{
    if (!G.running) return;
    const all = (res && res.multiHandLandmarks) || [];
    const read = all.filter(lm => lm && lm[9] && lm[0]).map(readHand);
    if (!read.length){
      if (G.engaged && performance.now() - G.lastSeen > 450){
        G.engaged = false; G.smooth = null; G.hands2 = null;
        if (typeof window.feedGestureRelease === 'function') window.feedGestureRelease();
      }
      return;
    }
    read.sort((a, b) => a.x - b.x);
    const prev = G.hands2;
    G.hands2 = read.map((h, i) => {
      const q = prev && prev[i];
      return q ? { x:q.x + (h.x - q.x)*0.38, y:q.y + (h.y - q.y)*0.38,
                   open:q.open + (h.open - q.open)*0.22 } : h;
    });
    const cx = G.hands2.reduce((a, h) => a + h.x, 0) / G.hands2.length;
    const cy = G.hands2.reduce((a, h) => a + h.y, 0) / G.hands2.length;
    G.smooth = { x:cx, y:cy };
    G.lastSeen = performance.now();
    if (!G.metOnce){
      G.metOnce = true;
      window.dispatchEvent(new CustomEvent('margaretControlReady'));
      if (G.preview) G.preview.classList.add('met');
      if (G._nudge){ clearTimeout(G._nudge); G._nudge = null; }
      if (GestureDrive._act !== 1) endingLine('she has you now', 2600);
    }
    if (!G.engaged){
      G.engaged = true;
      if (hint) hint.classList.remove('on');
      if (typeof window.registerGestureSource === 'function') window.registerGestureSource();
    }
    if (typeof window.feedGesturePoint === 'function')
      window.feedGesturePoint(G.smooth.x, G.smooth.y);
    if (typeof window.feedGestureHands === 'function')
      window.feedGestureHands(G.hands2);
    if (G.hands2.some(h => h.open > 0.66)) danceOpened();
  });

  const pump = ()=>{
    if (!G.running) return;
    if (G.video && G.video.readyState >= 2){
      G.hands.send({ image: G.video }).catch(()=>{});
    }
    G._raf = requestAnimationFrame(pump);
  };
  pump();

  setTimeout(()=>{
    if (!G.running || G.engaged || G._mouseRescue) return;
    G._mouseRescue = true;
    cueBrief('move', 'Raise your hand, or lead her with the mouse.', ()=>{}, 'left');
    attachMouseDrive(hint);
  }, 30000);
}

function stopGestureDrive(){
  const G = GestureDrive;
  G.running = false;
  if (G._nudge){ clearTimeout(G._nudge); G._nudge = null; }
  G.metOnce = false; G.mouseDriven = false; G.hands2 = null; G._opened = false; G._act = 0;
  if (G._raf) cancelAnimationFrame(G._raf);
  if (typeof G._teardown === 'function'){ G._teardown(); G._teardown = null; }
  try { if (G.hands && G.hands.close) G.hands.close(); } catch(e){}
  if (G.preview){
    G.preview.classList.remove('on');
    const shell = G.preview;
    setTimeout(()=>{ try{ shell.remove(); }catch(e){} }, 900);
    G.preview = null;
  }
  if (G.video){ try { G.video.remove(); } catch(e){} G.video = null; }
  G.stream = null;
  const hint = $('endingHint');
  if (hint) hint.classList.remove('on');
}

function onDanceComplete(){
  clearTimeout(startLastDance._safety);
  cueClear();
  stopGestureDrive();
  const stage = $('endingStage');
  window.dispatchEvent(new CustomEvent('margaretBow'));
  const cur = $('endingCurtain');
  if (cur) setTimeout(()=> cur.classList.add('on'), 4200);
  setTimeout(()=>{ if (stage){ stage.style.transition = 'filter 6s ease'; stage.style.filter = 'grayscale(1)'; } }, 3000);
  setTimeout(()=>{ if (stage){ stage.style.transition = 'filter 5s ease, opacity 5s ease'; stage.style.filter = 'grayscale(1) brightness(1.16) contrast(.72)'; stage.style.opacity = '.72'; } }, 7000);

  const goHome = ()=>{
    if (onDanceComplete._home) return;
    onDanceComplete._home = true;
    const label = $('endingLabel'); if (label) label.classList.remove('on');
    if (cur) cur.classList.remove('on');
    if (stage){ stage.classList.remove('on'); stage.style.display = 'none';
      stage.style.filter = ''; stage.style.opacity = ''; stage.style.transition = ''; }
    endingStarted = false; startEndingSequence._ran = false; onDanceComplete._home = false;
    try{ SFX.cutAll(); }catch(e){}
    if (typeof returnToDeepSea === 'function') returnToDeepSea();
  };

  const after = ()=>{
    if (onDanceComplete._closing) return;
    onDanceComplete._closing = true;
    clearTimeout(onDanceComplete._floor);
    const label = $('endingLabel'); if (label) label.classList.add('on');
    setTimeout(()=>{ onDanceComplete._closing = false; goHome(); }, 6000);
  };

  setTimeout(()=>{
    const ty = bindCues(SFX.play('end_thankyou'), 'end_thankyou');
    if (ty && typeof ty.addEventListener === 'function'){
      ty.addEventListener('ended', after, { once:true });
      ty.addEventListener('error', ()=> setTimeout(after, 600), { once:true });
      const fit = ()=>{
        const d = ty.duration;
        if (d && isFinite(d) && d > 0.4){
          clearTimeout(onDanceComplete._floor);
          onDanceComplete._floor = setTimeout(after, Math.round(d * 1000) + 400);
        }
      };
      if (ty.readyState >= 1) fit();
      else ty.addEventListener('loadedmetadata', fit, { once:true });
      onDanceComplete._floor = setTimeout(after, 9000);
    } else setTimeout(after, 2400);
  }, 2600);
}

function mountGraceDance(){
  const host = $('endingDanceHost');
  if (!window.p5 || mountGraceDance._inst) return;
  const D = {
    scale:.5, cy:.47, samples:14,
    haloA:12, haloW:2.3, midA:30, midW:1.15, coreA:62, coreW:.42,
    fragK:.55, fragOff:16, fray:5, strayCap:26,
    tremIdle:.6, tremK:5,
    forgetRate:.30, forgetMin:550, forgetMax:1250, rwMin:.10, rwMax:.24,
    travel:1900, pullMax:34, leanMax:10,
    grace:[1,.65,.30], blendMs:750,
    partCap:200, emitBase:2, emitMove:10, scatter:90, partA:46,
    trailFade:13, stampMs:95, stampJit:130, smear:12, trailA:16,
    heldEase:900, heldHold:2600, dissolveMs:3200, liftCap:280, breath:2.6,
  };
  const J = {PELVIS:0,CHEST:1,HEAD:2,SHL:3,ELL:4,WRL:5,SHR:6,ELR:7,WRR:8,
             HIPL:9,KNL:10,ANL:11,HIPR:12,KNR:13,ANR:14};
  const POSES = {
    STAND:[[0,0],[0,-.30],[0,-.52],[-.10,-.28],[-.17,-.13],[-.10,.01],[.10,-.28],[.17,-.13],[.10,.01],[-.06,.02],[-.055,.30],[-.045,.58],[.06,.02],[.055,.30],[.045,.58]],
    ARMS_UP:[[0,0],[0,-.31],[0,-.53],[-.10,-.29],[-.18,-.44],[-.075,-.60],[.10,-.29],[.18,-.44],[.075,-.60],[-.06,.02],[-.055,.30],[-.045,.58],[.06,.02],[.055,.30],[.045,.58]],
    ARABESQUE:[[0,-.01],[.07,-.30],[.15,-.47],[-.02,-.31],[-.19,-.37],[-.34,-.43],[.14,-.28],[.25,-.20],[.37,-.11],[-.05,.01],[-.045,.30],[-.035,.58],[.06,0],[.24,.10],[.44,-.03]],
    ATTITUDE:[[0,-.01],[.02,-.31],[.03,-.52],[-.08,-.30],[-.20,-.31],[-.32,-.29],[.11,-.29],[.19,-.45],[.10,-.59],[-.06,.01],[-.05,.30],[-.04,.58],[.06,0],[.21,.07],[.31,.17]],
    REACH:[[0,.02],[-.05,-.28],[-.12,-.47],[-.14,-.28],[-.27,-.39],[-.42,-.50],[.06,-.26],[.17,-.12],[.27,.05],[-.07,.03],[-.11,.32],[-.15,.58],[.07,.03],[.13,.33],[.23,.56]],
    FOLD:[[0,.16],[0,-.05],[0,-.23],[-.09,-.04],[-.13,.08],[-.05,.14],[.09,-.04],[.13,.08],[.05,.14],[-.06,.18],[-.09,.38],[-.07,.60],[.06,.18],[.12,.42],[.20,.57]],
    RISE:[[0,-.02],[.05,-.31],[.11,-.50],[-.04,-.32],[-.20,-.44],[-.31,-.53],[.13,-.29],[.24,-.40],[.33,-.50],[-.05,0],[-.045,.30],[-.035,.58],[.06,-.01],[.23,.09],[.42,-.04]],
  };
  const PHRASES = [
    [POSES.STAND, POSES.ARMS_UP, POSES.ARABESQUE],
    [POSES.ATTITUDE, POSES.REACH, POSES.ARABESQUE],
    [POSES.FOLD, POSES.STAND, POSES.RISE],
  ];
  const LIMBS = [
    { pts:[J.PELVIS,J.CHEST], w:.085, taper:.7,  core:true  },
    { pts:[J.CHEST,J.HEAD],   w:.030, taper:.55, core:false },
    { pts:[J.SHL,J.ELL,J.WRL], w:.034, taper:.22, core:true },
    { pts:[J.SHR,J.ELR,J.WRR], w:.034, taper:.22, core:true },
    { pts:[J.HIPL,J.KNL,J.ANL], w:.048, taper:.24, core:true },
    { pts:[J.HIPR,J.KNR,J.ANR], w:.048, taper:.24, core:true },
  ];
  const SIL = [26,24,17], TER = [6,74,70], FLD = [34,10,94];

  const sketch = (p)=>{
    let GRACE = 1, phrase = 0, progress = 0;
    let trailG = null, joints = [], particles = [], lift = [], emitterPrev = null;
    let blooms = [], motes = [], echoes = [], lastAnkle = [null,null], skirtFlare = 0;
    let inviting = false, bowT0 = 0;
    window.addEventListener('margaretInvite', ()=>{ inviting = true; });
    window.addEventListener('margaretBow', ()=>{ bowT0 = p.millis(); });
    window.addEventListener('margaretBow', ()=>{ bowT0 = p.millis(); inviting = false; });
    let gActive = false, inputPt = null, inputPrev = null;
    let handList = null, followMix = 0, danceT0 = 0, DANCE_MS = 63000, riseSmooth = 0;
    const st = { phase:'dance', phaseT0:0, blendFrom:null, blendT0:-1,
                 forget:null, lastStamp:0, gap:95, fired:false,
                 flow:0.5, lastDir:null, act:0, said:0 };
    const ACT = ['lead','follow','drift'];

    let grasps = [], reachAfter = 0;
    p._gOn  = ()=>{ gActive = true; };
    p._gPt  = (nx,ny)=>{ inputPt = { x:nx*p.width, y:ny*p.height }; };
    p._gHands = (list)=>{ handList = (list && list.length) ? list : null; };
    p._gClock = (ms)=>{ if (ms && isFinite(ms) && ms > 8000) DANCE_MS = ms; };
    p._gRel = ()=>{
      if (inputPt) reachAfter = p.millis();
      inputPt = null; inputPrev = null;
    };
    p._gGrasp = ()=>{ if (inputPt) grasps.push({ x:inputPt.x, y:inputPt.y, t0:p.millis() }); };

    const S  = ()=> p.height*D.scale;
    const CX = ()=> p.width/2;
    const CY = ()=> p.height*D.cy;
    const smooth = t => t*t*(3-2*t);

    function freshTrail(){
      trailG = p.createGraphics(p.width, p.height);
      trailG.colorMode(p.HSB,360,100,100,100);
      trailG.noStroke();
      trailG.background(FLD[0],FLD[1],FLD[2]);
    }
    p.setup = ()=>{
      p.createCanvas(host.clientWidth || window.innerWidth, host.clientHeight || window.innerHeight);
      p.colorMode(p.HSB,360,100,100,100);
      freshTrail();
      st.phaseT0 = p.millis();
    };
    p.windowResized = ()=>{
      p.resizeCanvas(host.clientWidth || window.innerWidth, host.clientHeight || window.innerHeight);
      freshTrail();
    };

    function actSplit(){
      const tail = D.heldEase + D.heldHold + D.dissolveMs;
      const body = Math.max(12000, DANCE_MS - tail);
      const a = body * 0.3907, b = body * 0.3552;
      return { lead:a, follow:a + b, drift:body };
    }

    function followPose(){
      const base = POSES.STAND;
      const out = base.map(q => [q[0], q[1]]);
      if (!handList) return out;
      const hs = handList;
      const one = hs.length < 2;
      const L = one ? { x:1 - hs[0].x, y:hs[0].y, open:hs[0].open } : hs[0];
      const R = one ? hs[0] : hs[1];
      const REACH = 0.42;
      const put = (sh, el, wr, h, side)=>{
        const hx = (h.x - 0.5) * 2, hy = (h.y - 0.5) * 2;
        const spread = 0.20 + h.open * 0.26;
        const tx = side * (0.12 + spread) + hx * 0.30;
        const ty = -0.10 + hy * 0.62;
        const sx = out[sh][0], sy = out[sh][1];
        let dx = tx - sx, dy = ty - sy;
        const d = Math.hypot(dx, dy) || 0.0001;
        const lim = REACH * Math.tanh(d / REACH);
        const k = lim / d;
        const wx = sx + dx * k, wy = sy + dy * k;
        out[wr] = [wx, wy];
        const ext = Math.min(1, lim / REACH);
        const bow = 0.055 + 0.085 * (1 - ext * ext);
        const nx = -(wy - sy) / lim, ny = (wx - sx) / lim;
        out[el] = [ (sx + wx) * 0.5 + nx * bow * side,
                    (sy + wy) * 0.5 + ny * bow * side ];
      };
      put(J.SHL, J.ELL, J.WRL, L, -1);
      put(J.SHR, J.ELR, J.WRR, R, 1);
      const cx = (L.x + R.x) * 0.5 - 0.5;
      const cy = (L.y + R.y) * 0.5;
      const lean = Math.max(-1, Math.min(1, cx * 1.6));
      const rise = Math.max(0, Math.min(1, (0.66 - cy) * 1.9));
      riseSmooth += (rise - riseSmooth) * 0.10;
      const r = riseSmooth;
      [J.PELVIS, J.CHEST, J.HEAD, J.SHL, J.SHR, J.HIPL, J.HIPR].forEach((j, i) => {
        out[j][0] += lean * 0.05 * (i + 1) * 0.4;
        out[j][1] -= r * 0.085;
      });
      [J.KNL, J.KNR].forEach(j => { out[j][1] -= r * 0.052; out[j][0] += lean * 0.018; });
      [J.ANL, J.ANR].forEach(j => { out[j][1] -= r * 0.012; });
      out[J.HEAD][1] -= r * 0.022;
      return out;
    }

    function evalPose(){
      if (st.phase !== 'dance') return POSES.RISE;
      if (followMix > 0.01){
        const keys = PHRASES[phrase];
        const u = progress*(keys.length-1);
        const i = Math.min(keys.length-2, Math.floor(u));
        const f = smooth(u-i);
        const fp = followPose();
        const out = [];
        for (let j = 0; j < 15; j++){
          const ax = p.lerp(keys[i][j][0], keys[i+1][j][0], f);
          const ay = p.lerp(keys[i][j][1], keys[i+1][j][1], f);
          out.push([ p.lerp(ax, fp[j][0], followMix), p.lerp(ay, fp[j][1], followMix) ]);
        }
        return out;
      }
      const keys = PHRASES[phrase];
      const u = progress*(keys.length-1);
      const i = Math.min(keys.length-2, Math.floor(u));
      const f = smooth(u-i);
      const out = [];
      for (let j = 0; j < 15; j++)
        out.push([ p.lerp(keys[i][j][0], keys[i+1][j][0], f),
                   p.lerp(keys[i][j][1], keys[i+1][j][1], f) ]);
      return out;
    }

    function sick(){
      const he = st.phase === 'dance' ? 0
        : Math.min(1, (p.millis()-st.phaseT0)/D.heldEase);
      return 1 - p.lerp(GRACE, 1, he);
    }

    function compute(){
      const now = p.millis(), Sv = S(), cx = CX(), cy = CY();
      const pose = evalPose(), sk = sick();
      const breathe = Math.sin(now*.0016)*D.breath;
      const ft = st.forget ? 2.2 : 1;
      joints = [];
      for (let j = 0; j < 15; j++){
        let x = cx + pose[j][0]*Sv, y = cy + pose[j][1]*Sv;
        if (j===J.CHEST || j===J.HEAD || j===J.SHL || j===J.SHR) y += breathe;
        if (j===J.WRL || j===J.WRR) y += breathe*.6;
        const tr = (D.tremIdle + sk*D.tremK)*ft;
        x += (p.noise(j*3.7, now*.0011)-.5)*2*tr;
        y += (p.noise(j*9.1, now*.0011)-.5)*2*tr;
        joints.push([x,y]);
      }

      if (inviting && st.phase === 'dance' && progress < 0.02){
        const t = p.millis()*0.0012;
        const reach = Math.sin(t)*0.5 + 0.5;
        joints[J.WRR][0] += Sv*0.16*reach;
        joints[J.WRR][1] -= Sv*0.10*reach;
        joints[J.ELR][0] += Sv*0.07*reach;
        joints[J.ELR][1] -= Sv*0.04*reach;
        joints[J.HEAD][0] += Sv*0.012*reach;
      }
      if (bowT0){
        const bt = Math.min(1, (p.millis()-bowT0)/2200);
        const e = bt < .5 ? bt*2 : 1;
        const fold = Math.sin(Math.min(1,e)*Math.PI*0.5);
        joints[J.CHEST][1] += Sv*0.16*fold;
        joints[J.HEAD][1]  += Sv*0.30*fold;
        joints[J.HEAD][0]  += Sv*0.05*fold;
        joints[J.SHL][1]   += Sv*0.13*fold;
        joints[J.SHR][1]   += Sv*0.13*fold;
        joints[J.WRL][0]  -= Sv*0.10*fold; joints[J.WRL][1] += Sv*0.20*fold;
        joints[J.WRR][0]  += Sv*0.10*fold; joints[J.WRR][1] += Sv*0.20*fold;
        joints[J.ELL][1]   += Sv*0.16*fold;
        joints[J.ELR][1]   += Sv*0.16*fold;
      }
      if (inputPt && st.phase === 'dance'){
        const lead = inputPt.x < cx ? J.WRL : J.WRR;
        const dx = inputPt.x-joints[lead][0], dy = inputPt.y-joints[lead][1];
        const d = Math.hypot(dx,dy)||1, pull = Math.min(D.pullMax, d*.12);
        joints[lead][0] += dx/d*pull; joints[lead][1] += dy/d*pull;
        const el = lead === J.WRL ? J.ELL : J.ELR;
        joints[el][0] += dx/d*pull*.45; joints[el][1] += dy/d*pull*.45;
        const lean = p.constrain((inputPt.x-cx)*.02, -D.leanMax, D.leanMax);
        joints[J.CHEST][0] += lean; joints[J.HEAD][0] += lean*1.5;
      }
      if (st.blendT0 >= 0){
        const bt = p.constrain((now-st.blendT0)/D.blendMs, 0, 1);
        if (bt >= 1) st.blendT0 = -1;
        else {
          const f = smooth(bt);
          for (let j = 0; j < 15; j++){
            joints[j][0] = p.lerp(st.blendFrom[j][0], joints[j][0], f);
            joints[j][1] = p.lerp(st.blendFrom[j][1], joints[j][1], f);
          }
        }
      }
    }

    function limbSamples(limb){
      const P = limb.pts.map(j => joints[j]);
      const out = [];
      for (let k = 0; k < D.samples; k++){
        const t = k/(D.samples-1);
        let x, y;
        if (P.length === 2){ x = p.lerp(P[0][0],P[1][0],t); y = p.lerp(P[0][1],P[1][1],t); }
        else {
          const a = 1-t;
          x = a*a*P[0][0] + 2*a*t*P[1][0] + t*t*P[2][0];
          y = a*a*P[0][1] + 2*a*t*P[1][1] + t*t*P[2][1];
        }
        out.push({x,y,t});
      }
      return out;
    }
    function normalAt(pts,k){
      const a = pts[Math.max(0,k-1)], b = pts[Math.min(pts.length-1,k+1)];
      const dx = b.x-a.x, dy = b.y-a.y, d = Math.hypot(dx,dy)||1;
      return { x:-dy/d, y:dx/d };
    }
    function ribbonPass(ch, limb, w0, col, alpha, sk){
      const pts = ch.pts;
      p.noStroke(); p.fill(col[0],col[1],col[2],alpha);
      p.beginShape();
      for (let k = 0; k < pts.length; k++){
        const q = pts[k], nn = normalAt(pts,k);
        const w = w0*(1-q.t*(1-limb.taper));
        const fr = (p.noise(q.x*.05,q.y*.05,1.7)-.5)*2*sk*D.fray;
        p.vertex(q.x+ch.ox+nn.x*(w/2+fr), q.y+ch.oy+nn.y*(w/2+fr));
      }
      for (let k = pts.length-1; k >= 0; k--){
        const q = pts[k], nn = normalAt(pts,k);
        const w = w0*(1-q.t*(1-limb.taper));
        const fr = (p.noise(q.x*.05,q.y*.05,9.3)-.5)*2*sk*D.fray;
        p.vertex(q.x+ch.ox-nn.x*(w/2+fr), q.y+ch.oy-nn.y*(w/2+fr));
      }
      p.endShape(p.CLOSE);
    }

    function drawDancer(fade){
      const now = p.millis(), sk = sick(), Sv = S();
      let strays = 0;
      for (let L = 0; L < LIMBS.length; L++){
        const limb = LIMBS[L], samples = limbSamples(limb), baseW = limb.w*Sv;

        const chunks = []; let cur = [], ox = 0, oy = 0;
        for (let k = 0; k < samples.length; k++){
          const gate = p.noise(L*11.3, k*.9, now*.00045);
          const broken = gate < sk*D.fragK && k > 1 && k < samples.length-2;
          if (broken && cur.length){
            chunks.push({pts:cur, ox, oy}); cur = [];
            ox = (p.noise(L*5.1, k*2.2, now*.0006)-.5)*2*sk*D.fragOff;
            oy = (p.noise(L*7.7, k*2.2, now*.0006)-.5)*2*sk*D.fragOff;
            if (strays < D.strayCap && Math.random() < .35){
              strays++;
              p.noStroke(); p.fill(SIL[0],SIL[1],SIL[2],22*fade);
              const sp = samples[k];
              p.ellipse(sp.x+ox*1.4, sp.y+oy*1.4, p.random(1.5,3.5), p.random(1.5,3.5));
            }
            continue;
          }
          cur.push(samples[k]);
        }
        if (cur.length) chunks.push({pts:cur, ox, oy});
        for (const ch of chunks){
          if (ch.pts.length < 2) continue;
          ribbonPass(ch, limb, baseW*1.14, SIL, 96*fade, sk*.5);
          if (limb.core){
            const boost = st.phase !== 'dance' ? 1.4 : 1;
            ribbonPass(ch, limb, baseW*D.coreW, TER, D.coreA*boost*fade, sk*.3);
          }
        }
      }

      p.noStroke(); p.fill(SIL[0],SIL[1],SIL[2],40*fade);
      for (const an of [J.ANL,J.ANR]){
        const kn = an === J.ANL ? J.KNL : J.KNR;
        const dx = joints[an][0]-joints[kn][0], dy = joints[an][1]-joints[kn][1];
        const d = Math.hypot(dx,dy)||1;
        p.triangle(joints[an][0]-dy/d*3, joints[an][1]+dx/d*3,
                   joints[an][0]+dy/d*3, joints[an][1]-dx/d*3,
                   joints[an][0]+dx/d*14, joints[an][1]+dy/d*14);
      }

      const hl = joints[J.HIPL], hr = joints[J.HIPR];
      const cx2 = (hl[0]+hr[0])/2, cy2 = (hl[1]+hr[1])/2;
      const sway = Math.sin(now*.0016)*3 + sk*(p.noise(now*.001)-.5)*10;
      if (inviting){
        const w = 0.6 + 0.4*Math.sin(p.millis()*0.0016);
        joints[J.WRR][0] += Sv*0.10*w;
        joints[J.WRR][1] -= Sv*0.05*w;
        joints[J.ELR][0] += Sv*0.05*w;
      }
      if (bowT0){
        const bt = Math.min(1, (p.millis()-bowT0)/2400);
        const bend = Math.sin(Math.min(1, bt*1.6) * Math.PI) * 0.9;
        joints[J.HEAD][1]  += Sv*0.16*bend;
        joints[J.CHEST][1] += Sv*0.10*bend;
        joints[J.WRL][1]   += Sv*0.14*bend;
        joints[J.WRR][1]   += Sv*0.14*bend;
        joints[J.WRL][0]   -= Sv*0.06*bend;
        joints[J.WRR][0]   += Sv*0.06*bend;
      }
      const hipSpd = emitterPrev
        ? Math.min(1, p.dist(cx2, cy2, (emitterPrev[2][0]+emitterPrev[3][0])/2,
                                       (emitterPrev[2][1]+emitterPrev[3][1])/2) / 14)
        : 0;
      skirtFlare += (hipSpd - skirtFlare) * (hipSpd > skirtFlare ? 0.16 : 0.035);
      const tutuW = Sv*(0.44 + skirtFlare*0.26), tutuH = Sv*(0.15 - skirtFlare*0.03);

      const anL = joints[J.ANL], anR = joints[J.ANR];
      const fy = Math.max(anL[1], anR[1]);
      const lift = Math.max(0, Math.min(1, (cy2 + Sv*0.60 - fy) / (Sv*0.16)));
      const foot = (anL[0] + anR[0]) * 0.5;
      p.noStroke();
      p.fill(SIL[0], SIL[1], SIL[2], (54 - lift*26) * fade);
      p.ellipse(foot, fy + Sv*0.014, Sv*(0.20 + lift*0.10), Sv*(0.030 + lift*0.012));
      p.fill(SIL[0], SIL[1], SIL[2], (26 - lift*14) * fade);
      p.ellipse(foot, fy + Sv*0.016, Sv*(0.34 + lift*0.16), Sv*(0.048 + lift*0.018));

      const nk = joints[J.CHEST], chs = joints[J.PELVIS];
      p.noStroke();
      p.fill(SIL[0], SIL[1], SIL[2], 96*fade);
      p.beginShape();
      p.vertex(nk[0]-Sv*.048, nk[1]);
      p.bezierVertex(chs[0]-Sv*.062, chs[1]-Sv*.02,
                     cx2-Sv*.052+sway, cy2-Sv*.03,
                     hl[0]-Sv*.006, hl[1]);
      p.vertex(hr[0]+Sv*.006, hr[1]);
      p.bezierVertex(cx2+Sv*.052+sway, cy2-Sv*.03,
                     chs[0]+Sv*.062, chs[1]-Sv*.02,
                     nk[0]+Sv*.048, nk[1]);
      p.endShape(p.CLOSE);

      p.noStroke();
      p.fill(SIL[0],SIL[1],SIL[2],92*fade);
      p.beginShape();
      p.vertex(hl[0]-Sv*.02, hl[1]);
      p.bezierVertex(cx2-tutuW*.9+sway, cy2+tutuH*.35,
                     cx2-tutuW+sway,    cy2+tutuH*1.05,
                     cx2+sway*.6,       cy2+tutuH*1.25);
      p.bezierVertex(cx2+tutuW+sway,    cy2+tutuH*1.05,
                     cx2+tutuW*.9+sway, cy2+tutuH*.35,
                     hr[0]+Sv*.02,      hr[1]);
      p.endShape(p.CLOSE);
      p.fill(SIL[0],SIL[1],SIL[2],52*fade);
      p.beginShape();
      p.vertex(hl[0], hl[1]+Sv*.01);
      p.bezierVertex(cx2-tutuW*.62+sway, cy2+tutuH*.28,
                     cx2-tutuW*.7+sway,  cy2+tutuH*.78,
                     cx2+sway*.5,        cy2+tutuH*.92);
      p.bezierVertex(cx2+tutuW*.7+sway,  cy2+tutuH*.78,
                     cx2+tutuW*.62+sway, cy2+tutuH*.28,
                     hr[0],              hr[1]+Sv*.01);
      p.endShape(p.CLOSE);

      const h = joints[J.HEAD], c = joints[J.CHEST];
      const dx = h[0]-c[0], dy = h[1]-c[1], d = Math.hypot(dx,dy)||1;
      p.noStroke();
      p.fill(SIL[0],SIL[1],SIL[2],96*fade);
      p.ellipse(h[0], h[1], Sv*.088, Sv*.104);
      p.ellipse(h[0]+dx/d*Sv*.058, h[1]+dy/d*Sv*.062, Sv*.052, Sv*.052);
      p.fill(SIL[0],SIL[1],SIL[2],62*fade);
      p.ellipse(h[0]-dx/d*Sv*.012, h[1]-dy/d*Sv*.012, Sv*.096, Sv*.086);
    }

    function trail(now){
      trailG.noStroke(); trailG.fill(FLD[0],FLD[1],FLD[2],D.trailFade);
      trailG.rect(0,0,p.width,p.height);
      if (st.phase === 'done' || st.phase === 'dissolve') return;
      if (now-st.lastStamp > st.gap){
        st.lastStamp = now;
        const sk = sick();
        st.gap = D.stampMs + p.random(-30, sk*D.stampJit);
        const ox = (Math.random()-.5)*2*sk*D.smear, oy = (Math.random()-.5)*2*sk*D.smear;
        trailG.stroke(SIL[0],SIL[1],SIL[2],D.trailA); trailG.strokeWeight(2); trailG.noFill();
        for (const limb of LIMBS){
          const sarr = limbSamples(limb);
          trailG.beginShape();
          for (const q of sarr) trailG.vertex(q.x+ox, q.y+oy);
          trailG.endShape();
        }
      }
    }

    function ballroom(fade){
      const dt = p.deltaTime/1000;
      const now = p.millis();

      for (let side = 0; side < 2; side++){
        const an = joints[side ? J.ANR : J.ANL];
        const prev = lastAnkle[side];
        if (prev){
          const dy = an[1] - prev[1];
          const settled = Math.abs(an[1] - prev[1]) < 0.9 && dy >= 0;
          const moved = p.dist(an[0],an[1],prev[0],prev[1]);
          if (settled && moved < 1.2 && blooms.length < 26 && Math.random() < 0.10){
            blooms.push({ x:an[0], y:an[1] + 6, age:0, life:1.9, r0:6 });
          }
        }
        lastAnkle[side] = [an[0], an[1]];
      }
      for (let i = blooms.length-1; i >= 0; i--){
        const b = blooms[i];
        b.age += dt;
        if (b.age >= b.life){ blooms.splice(i,1); continue; }
        const t = b.age/b.life, e = 1 - Math.pow(1-t, 2);
        const rr = b.r0 + e*S()*0.30;
        const a = (1-t)*(1-t)*46*fade;
        p.noFill();
        p.stroke(230, 26, 96, a);
        p.strokeWeight(1.6);
        p.ellipse(b.x, b.y, rr*2, rr*0.62);
        p.noStroke();
        p.fill(232, 22, 98, a*0.32);
        p.ellipse(b.x, b.y, rr*1.5, rr*0.46);
      }

      if (motes.length < 90 && Math.random() < 0.45){
        motes.push({ x:p.random(p.width), y:p.random(p.height*0.35, p.height),
          vy:-p.random(4,13), vx:p.random(-3,3), age:0, life:p.random(3.2,6.4),
          r:p.random(0.8,2.2), ph:Math.random()*6.28 });
      }
      p.noStroke();
      for (let i = motes.length-1; i >= 0; i--){
        const m = motes[i];
        m.age += dt;
        if (m.age >= m.life){ motes.splice(i,1); continue; }
        m.y += m.vy*dt; m.x += m.vx*dt + Math.sin(now*0.0011 + m.ph)*0.24;
        const tw = 0.45 + 0.55*Math.sin(m.age*3.1 + m.ph);
        const a = Math.sin(Math.PI * (m.age/m.life)) * 42 * fade * tw;
        p.fill(236, 30, 100, a);
        p.ellipse(m.x, m.y, m.r*2, m.r*2);
      }

      if (echoes.length && now % 2 === 0){}
      for (let i = echoes.length-1; i >= 0; i--){
        const e = echoes[i];
        e.age += dt;
        if (e.age >= e.life){ echoes.splice(i,1); continue; }
        const a = (1 - e.age/e.life) * 16 * fade;
        p.noStroke(); p.fill(SIL[0], SIL[1], SIL[2], a);
        for (const seg of e.pts) p.ellipse(seg[0], seg[1], 4.5, 4.5);
      }
    }

    function pushEcho(){
      if (echoes.length > 7) echoes.shift();
      echoes.push({ pts: joints.map(j => [j[0], j[1]]), age:0, life:0.85 });
    }

    function reds(fade){
      const sk = sick(), dt = p.deltaTime/1000;
      const ems = [J.WRL,J.WRR,J.ANL,J.ANR].map(j => joints[j]);
      if (emitterPrev){
        for (let e = 0; e < ems.length; e++){
          const q = ems[e], r = emitterPrev[e];
          const spd = p.dist(q[0],q[1],r[0],r[1]);
          const rate = (D.emitBase + spd*D.emitMove*.06)*dt;
          let n = Math.floor(rate) + (Math.random() < rate%1 ? 1 : 0);
          while (n-- > 0 && particles.length < D.partCap){
            particles.push({ x:q[0], y:q[1],
              vx:(q[0]-r[0])*.4 + (Math.random()-.5)*sk*D.scatter*dt*60,
              vy:(q[1]-r[1])*.4 + (Math.random()-.5)*sk*D.scatter*dt*60 - 3*dt*60,
              life:p.random(.9,1.8), age:0, r:p.random(1,2.6), silk:Math.random()<0.18 });
          }
        }
      }
      emitterPrev = ems.map(q => [q[0],q[1]]);
      p.blendMode(p.BLEND); p.noStroke();
      for (let i = particles.length-1; i >= 0; i--){
        const q = particles[i];
        q.age += dt;
        if (q.age >= q.life){ particles.splice(i,1); continue; }
        q.x += q.vx*dt*8; q.y += q.vy*dt*8; q.vy += 2*dt;
        const tw = 0.72 + 0.28 * Math.sin(q.age*9 + q.r*7);
        const a = (1-q.age/q.life)*D.partA*fade*tw;
        if (q.silk){
          p.stroke(TER[0],TER[1],TER[2],a);
          p.strokeWeight(1);
          p.line(q.x, q.y, q.x - q.vx*1.6, q.y - q.vy*1.6);
          p.noStroke();
        } else {
          p.fill(TER[0],TER[1],TER[2],a);    p.ellipse(q.x,q.y,q.r*2,q.r*2);
        }
        p.fill(TER[0],TER[1]*.6,TER[2]+18,a*.35); p.ellipse(q.x,q.y,q.r*6,q.r*6);
      }
      p.blendMode(p.BLEND);
      if (st.phase === 'held'){
        const t = p.constrain((p.millis()-st.phaseT0-D.heldEase)/900, 0, 1);
        if (t > 0){
          const c = joints[J.CHEST];
          p.noStroke();
          for (let i = 6; i > 0; i--){
            p.fill(TER[0],TER[1],TER[2],3.4*t);
            p.ellipse(c[0],c[1],i*22*t,i*22*t);
          }
        }
      }
    }

    p.draw = ()=>{
      const now = p.millis();
      if (!gActive){
        inputPt = (p.mouseIsPressed && p.mouseX >= 0 && p.mouseX <= p.width
                   && p.mouseY >= 0 && p.mouseY <= p.height)
          ? { x:p.mouseX, y:p.mouseY } : null;
      }

      if (st.phase === 'dance'){
        if (!danceT0) danceT0 = now;
        const e = now - danceT0;
        const A = actSplit();

        if (inputPt && inputPrev){
          const dx = inputPt.x-inputPrev.x, dy = inputPt.y-inputPrev.y;
          const d = Math.hypot(dx,dy);
          if (d > 0.4){
            const len = d || 1;
            const ux = dx/len, uy = dy/len;
            let sm = 1;
            if (st.lastDir){
              const dot = ux*st.lastDir[0] + uy*st.lastDir[1];
              sm = 0.35 + 0.65*Math.max(0, (dot+1)/2);
            }
            st.lastDir = [ux, uy];
            st.flow = st.flow*0.90 + sm*0.10;
          }
        } else {
          st.flow *= 0.96;
        }

        let act = 0, local = 0;
        if (e < A.lead){ act = 0; local = e / A.lead; }
        else if (e < A.follow){ act = 1; local = (e - A.lead) / (A.follow - A.lead); }
        else { act = 2; local = (e - A.follow) / (A.drift - A.follow); }
        local = Math.max(0, Math.min(1, local));

        if (act !== st.act){
          st.blendFrom = joints.map(q => [q[0],q[1]]);
          st.blendT0 = now;
          st.act = act;
          phrase = act;
          GRACE = D.grace[act];
          progress = 0;
        }
        if (act !== 1) progress = local;

        const want = act === 1 ? 1 : (act === 2 ? Math.max(0, 1 - local*1.35) : 0);
        followMix += (want - followMix) * Math.min(1, p.deltaTime / 700);

        if (st.said !== act + 1){
          st.said = act + 1;
          if (typeof window.danceActLine === 'function') window.danceActLine(ACT[act]);
        }

        if (e >= A.drift){
          st.phase = 'held'; st.phaseT0 = now; progress = 1; followMix = 0;
        }
      }

      if (st.phase === 'dance'){
        if (st.forget){
          if (now-st.forget.t0 > st.forget.dur){
            progress = Math.max(0, progress-st.forget.rw);
            st.forget = null;
          }
        } else {
          const sk = (1-GRACE) * (st.act === 2 ? 1.7 : 1);
          if (sk >= .15 && Math.random() < sk*D.forgetRate*(p.deltaTime/1000))
            st.forget = { t0:now, dur:p.random(D.forgetMin,D.forgetMax),
                          rw:p.random(D.rwMin,D.rwMax) };
        }
      }
      if (st.phase === 'held' && now-st.phaseT0 > D.heldEase+D.heldHold){
        st.phase = 'dissolve'; st.phaseT0 = now;
        lift = [];
        outer:
        for (const limb of LIMBS){
          for (const q of limbSamples(limb)){
            if (lift.length >= D.liftCap) break outer;
            lift.push({ x:q.x, y:q.y, vx:p.random(-.2,.2), vy:p.random(-.9,-.4),
                        seed:p.random(1000), r:p.random(.8,2.2) });
          }
        }
      }
      if (st.phase === 'dissolve' && now-st.phaseT0 > D.dissolveMs && !st.fired){
        st.fired = true; st.phase = 'done';
        window.dispatchEvent(new CustomEvent('margaretGestureComplete'));
      }

      compute();
      p.background(FLD[0],FLD[1],FLD[2]);
      p.noStroke();
      for (let i = 8; i > 0; i--){
        p.fill(30,22,30,2.2);
        p.ellipse(p.width/2, p.height*.86, i*p.width*.09, i*p.width*.028);
      }
      trail(now);
      p.image(trailG,0,0);
      const fade = st.phase === 'dissolve'
        ? 1-p.constrain((now-st.phaseT0)/D.dissolveMs,0,1)
        : (st.phase === 'done' ? 0 : 1);
      if (st.phase !== 'done'){
        ballroom(fade);
        if (p.frameCount % 7 === 0) pushEcho();
        drawDancer(fade);
        reds(fade);
      }
      if (st.phase === 'dissolve' || st.phase === 'done'){
        const dt = p.deltaTime/1000;
        p.noStroke();
        for (const q of lift){
          q.y += q.vy*dt*60;
          q.x += q.vx*dt*60 + Math.sin(now*.0008+q.seed)*.3;
          const a = p.constrain(p.map(q.y, -20, CY(), 0, 26), 0, 26);
          p.fill(SIL[0],SIL[1],92,a);
          p.ellipse(q.x,q.y,q.r*2,q.r*2);
        }
      }
      if (grasps.length){
        const nowg = p.millis();
        p.noFill();
        for (let i = grasps.length-1; i >= 0; i--){
          const g = grasps[i];
          const gt = (nowg - g.t0)/620;
          if (gt >= 1){ grasps.splice(i,1); continue; }
          p.stroke(SIL[0], SIL[1], SIL[2], 42*(1-gt));
          p.strokeWeight(2 - gt);
          p.ellipse(g.x, g.y, 14 + gt*54, 14 + gt*54);
        }
        p.noStroke();
      }
      if (!inputPt && reachAfter && st.phase === 'dance'){
        const rt = (p.millis()-reachAfter)/1400;
        if (rt < 1){
          const lead2 = J.WRR;
          const w2 = joints[lead2];
          if (w2){
            p.noStroke();
            p.fill(TER[0], TER[1], TER[2], 16*(1-rt));
            p.ellipse(w2[0], w2[1], 22*(1-rt)+8, 22*(1-rt)+8);
          }
        } else reachAfter = 0;
      }
      if (inputPt && st.phase === 'dance'){
        const lead = inputPt.x < CX() ? J.WRL : J.WRR;
        const w = joints[lead];
        if (w){
          const glow = 0.35 + 0.65*st.flow;
          const mx = (inputPt.x + w[0])/2;
          const my = (inputPt.y + w[1])/2 - 30*glow;
          p.noFill();
          for (let i = 3; i >= 1; i--){
            p.stroke(SIL[0], SIL[1], SIL[2], (5 + 10*glow)/i);
            p.strokeWeight(i*2.2);
            p.beginShape();
            p.vertex(w[0], w[1]);
            p.quadraticVertex(mx, my, inputPt.x, inputPt.y);
            p.endShape();
          }
          p.noStroke();
          p.fill(TER[0], TER[1], TER[2], 24*glow);
          p.ellipse(w[0], w[1], 15, 15);
        }
        p.noStroke();
        p.fill(8,55,96,60); p.ellipse(inputPt.x,inputPt.y,7,7);
        p.fill(0,0,100,70);   p.ellipse(inputPt.x,inputPt.y,2.5,2.5);
      }
      inputPrev = inputPt ? { x:inputPt.x, y:inputPt.y } : null;
    };
  };

  const inst = new p5(sketch, host);
  mountGraceDance._inst = inst;

  window.registerGestureSource = ()=>{ inst._gOn(); };
  window.feedGesturePoint = (nx,ny)=>{ inst._gPt(nx,ny); };
  window.feedGestureHands = (list)=>{ inst._gHands(list); };
  window.setDanceClock = (ms)=>{ inst._gClock(ms); };
  window.feedGestureRelease = ()=>{ inst._gRel(); };
  window.feedGestureGrasp = ()=>{ if (inst._gGrasp) inst._gGrasp(); };
  window.addEventListener('margaretGestureComplete',
    ()=> setTimeout(()=>{ try{ inst.remove(); }catch(e){} }, 12000), { once:true });
}

