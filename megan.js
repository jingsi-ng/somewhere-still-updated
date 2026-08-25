
(function(){
'use strict';

const MEGAN_TRACE = [];
const MEGAN_HANDOFFS = [];
function clog(){
  const parts = [];
  for (let i = 0; i < arguments.length; i++){
    const a = arguments[i];
    parts.push(typeof a === 'string' ? a : String(a));
  }
  const line = parts.join(' ');
  MEGAN_TRACE.push(line);
  if (MEGAN_TRACE.length > 400) MEGAN_TRACE.shift();
  if (line.indexOf('failed') > -1 || line.indexOf('FAILED') > -1
   || line.indexOf('stopped') > -1) showFatal(line);
}
function showFatal(msg){
  if (typeof window.showFatal === 'function') return window.showFatal(msg);
  let d = document.getElementById('fatalbar');
  if (!d){
    d = document.createElement('div'); d.id = 'fatalbar';
    d.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:999;'
      + 'background:rgba(120,30,30,.92);color:#fff;font:12px/1.5 monospace;'
      + 'padding:8px 14px;white-space:pre-wrap';
    (document.body || document.documentElement).appendChild(d);
  }
  d.textContent = 'somewhere still \u00b7 error: ' + msg;
}

const RECAP = (function(){
  const H = location.hash || '';
  const M = {
    '#/megan/gallery':          ['gallery_entry', []],
    '#/megan/graduation':       ['graduation',    []],
    '#/megan/studio/born':      ['studio_born',   []],
    '#/megan/gallery/fill1':    ['fill_1',        ['born']],
    '#/megan/studio/breadth':   ['studio_breadth',['born']],
    '#/megan/gallery/fill2':    ['fill_2',        ['born','breadth']],
    '#/megan/studio/calls':     ['studio_calls',  ['born','breadth']],
    '#/megan/gallery/fill3':    ['fill_3',        ['born','breadth','calls']],
    '#/megan/studio/fall':      ['studio_fall',   ['born','breadth','calls']],
    '#/megan/ending':           ['ending',        ['born','breadth','calls','fall']]
  };
  const hit = M[H];
  return hit ? { start:hit[0], preDone:hit[1] } : null;
})();
const BOOT = window.MEGAN_BOOT || RECAP || { start:'gallery_entry', preDone:[] };

function hashKey(str){
  let h = 2166136261 >>> 0;
  for (let i=0;i<str.length;i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry(seed){
  let s = seed >>> 0;
  return function(){
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let rnd = mulberry(Date.now() >>> 0);
function streamFor(key){ return mulberry((meganState.seed ^ hashKey(key)) >>> 0); }

function freshMeganState(){
  return {
    scene: null,
    lucidity: 1.0,
    primed: false,
    currentPainting: null,
    paintingsDone: [],
    fill: {},
    fill2Order: [],
    laid: {},
    seed: Date.now() >>> 0,

  };
}
const meganState = freshMeganState();

const ANCHORS = {
  born:    { start:.85, end:.70 },
  breadth: { start:.60, end:.45 },
  calls:   { start:.35, end:.22 },
  fall:    { start:.10, end:.00 },
};
function lucidityAt(painting, progress01){
  const A = ANCHORS[painting];
  return A.start + (A.end - A.start) * Math.min(1, Math.max(0, progress01));
}

const DRIFT_MAX = 34;
const COLOR_MAX = 46;
const REF_MAX = 62, REF_MIN = 10;
const MEM_CFG = { riseMs: 900, holdAlpha: 168, paintAlpha: 52 };
const FLICK_MAX = 1.0;
const WARP_MAX = 9;

const LUC = { drift:0, colorShift:0, refA:REF_MAX, flick:0, warp:0 };
const MEM_CAP = 158;
function applyLucidity(luc){
  const m = (a,b)=> a + (b-a)*(1-luc);
  LUC.drift      = m(0, DRIFT_MAX);
  LUC.colorShift = m(0, COLOR_MAX);
  LUC.refA       = m(REF_MAX, REF_MIN);
  LUC.memA       = m(MEM_CAP * .62, MEM_CAP);
  LUC.flick      = m(0, FLICK_MAX);
  LUC.warp       = m(0, WARP_MAX);
  Sound.setDepth(luc);
}

let IMG_BASE = window.MEGAN_IMG_BASE || 'assets/megan/';
const IMG_BASES = window.MEGAN_IMG_BASE
  ? [window.MEGAN_IMG_BASE]
  : ['assets/megan/', 'assets/', 'assets/margaret/', 'megan/', 'assets/images/', 'images/', ''];
const SND_BASE = window.MEGAN_SND_BASE || 'audio/megan/';
const SND_ALIAS = {
  'megan_gallery_ambience.wav'         : 'Gallery Ambience (Funkyy).mp3',
  'megan_studio_ambience.wav'          : 'Megan While The User Paints (Ambience).mp3',
  'megan_entry_vo_diagnosis.wav'       : 'doctor_ based on the changes....m4a',
  'megan_graduation_vo_mc.wav'         : 'Congratulations Team of Megan and Hans (Applause).mp3',
  'megan_fill1_applause.wav'           : 'Scene 3 Applause&Cheer Positive Hit.mp3',
  'megan_fill2_applause.wav'           : 'Scene 3 Applause&Cheer Positive Hit.mp3',
  'megan_fill3_applause.wav'           : 'Scene 3 Applause&Cheer Positive Hit.mp3',
  'megan_scene3_end_transition.wav'    : 'Scene 3 End Transition.mp3',
  'megan_whalefall_sound.wav'          : 'Whale Fall .mp3',
  'megan_fill2_wave.wav'               : 'Ocean Wave Transition.mp3',
  'megan_fill2_pop.wav'                : 'Pop Sound and Pickin Up Items From The Ground.mp3',
  'megan_fill3_ambience.wav'           : 'Scene Fill 3 Ambience.mp3',
  'megan_fill1_glass.wav'              : 'mirror break sound.mp3',
  'megan_ending_sea.wav'               : 'Scene 9 The Ending.mp3',
  'megan_ending_phone.wav'             : 'Phone 2-2.m4a',
  'megan_last_passedaway.wav'          : "Hans's friend.m4a",
  'megan_last_goahead.wav'             : 'Megan_ go ahead-1.m4a',
  'megan_last_greatjob.wav'            : 'Wave 1 men_ you guys did a great job.m4a',
  'megan_last_stubborn.wav'            : 'Wave 2 Hans_ what\u2019s a stubborn person!.m4a',
  'megan_last_why.wav'                 : 'Younger Megan_ can you tell me why- 2.m4a',
  'megan_vo_born.wav'                  : 'Megan Remembers While Painting.mp3',
  'megan_vo_breadth.wav'               : 'Megan and Hans Arguing.mp3',
  'megan_vo_calls.wav'                 : 'Scene 6 Painting Calls Chaotic Voicelines.mp3',
  'megan_vo_fall.wav'                  : 'Painting Fall Scene 8.mp3',
};

const STUDIO_ENTRY = {
  file: 'megan_whalefall_sound.wav',
  speaker: 'Megan',
  line: 'He said, whale fall, life from death',
};

const ENTRY_DOCTOR = {
  file: 'megan_entry_vo_diagnosis.wav',
  speaker: 'Doctor',
  line: 'Based on the changes we\u2019ve observed in your memory and cognition, the diagnosis is Alzheimer\u2019s disease.',
  clip: { from:0, to:13 },
  afterRevealMs: 0,
  subDelayMs: 5300,
  subHoldMs: 0,
};

const IMG_FILES = {
  gallery_back : 'megan_bg_back_01.webp',
  gallery_mid  : 'megan_bg_mid_01.webp',
  gallery_front: 'megan_bg_front_01.webp',
  studio_back  : 'megan_studio_bg_back_01 2.png',
  frame_1      : 'megan_gallery_frame_01.webp',
  frame_2      : 'megan_gallery_frame_02.webp',
  frame_3      : 'megan_gallery_frame_03.webp',
  frame_4      : 'megan_gallery_frame_04.webp',
  studio_mid   : 'megan_studio_bg_mid_01.png',
  studio_front : 'megan_studio_bg_front_01.png',
  aw_born      : 'megan_awborn_main_01.png',
  aw_breadth   : 'megan_awbreadth_main_01.png',
  aw_calls     : 'megan_awcalls_main_01.png',
  aw_fall      : 'megan_awfall_main_01.png',
  flash_graduation: 'megan_flash_graduation_01.png',
  flash_alone     : 'megan_flash_alone_studio_01.png',
  flash_argue     : 'megan_flash_argue_01.png',
  flash_bedside   : 'megan_flash_bedside_01.png',
  flash_torn      : 'megan_flash_tornpainting_01.png',
  flash_funeral   : 'megan_flash_funeral_01.png',
  flash_couple    : 'megan_flash_couple_01.png',
  flash_lastphoto : 'megan_flash_hospital_lastphoto.png',
  fill1_whale  : 'megan_fill1_whale_01.png',
  fill1_podium : 'megan_fill1_podium_01.png',
  fill1_cap    : 'megan_fill1_cap_01.png',
  fill1_trophy : 'megan_fill1_trophy_01.png',
  fill1_photo_nocap    : 'megan_fill1_photo_nocap_01.png',
  fill1_photo_notrophy : 'megan_fill1_photo_notrophy_01.png',
  fill1_photo_nopodium : 'megan_fill1_photo_nopodium_01.png',
  fill2_streamers      : 'megan_fill2_streamers_01.png',
  fill2_oceanpainting  : 'megan_fill2_oceanpainting_01.png',
  fill2_photo_launch   : 'megan_fill2_photo_launch_01.png',
  fill2_photo_brushes  : 'megan_fill2_photo_brushes_01.png',
  ending_stick : 'megan_ending_megan_stick_01.png',
  ending_stick_cut : 'megan_ending_stick_cutout_01.png',
  mirror_shattered : 'Margaret_mirrorN__shattered_04.png',
};

const Img = (function(){
  const cache = {};
  const waiting = [];
  function imgNames(f){
    const out = [];
    const push = (n)=>{ if (n && out.indexOf(n) < 0) out.push(n); };
    const stem = f.replace(/\.[a-z0-9]+$/i, '');
    const stems = [stem];
    if (/_(\d)$/.test(stem)) stems.push(stem.replace(/_(\d)$/, ' $1'));
    if (/ (\d)$/.test(stem)) stems.push(stem.replace(/ (\d)$/, '_$1'));
    for (const st of stems)
      for (const ext of ['.webp', '.png', '.jpg', '.jpeg'])
        push(st + ext);
    return out;
  }
  function load(key){
    if (cache[key] !== undefined) return cache[key];
    const f = IMG_FILES[key];
    if (!f){ cache[key] = null; return null; }
    let im = null;
    try {
      const cands = imgNames(f);
      let i = 0;
      im = new Image();
      im.__ready = false;
      im.__file = null;
      const next = ()=>{
        if (i >= cands.length){ im.__ready = false; return; }
        im.__file = cands[i++];
        im.src = IMG_BASE + encodeURI(im.__file);
      };
      im.onload  = ()=>{
        im.__ready = true;
        waiting.forEach(fn=> fn(key));
      };
      im.onerror = next;
      next();
    } catch(e){ im = null; }
    cache[key] = im;
    return im;
  }
  function probeBase(done){
    if (window.MEGAN_IMG_BASE || IMG_BASES.length <= 1){ done(); return; }
    const sentinel = IMG_FILES.gallery_back || IMG_FILES[Object.keys(IMG_FILES)[0]];
    let i = 0;
    const tryNext = ()=>{
      if (i >= IMG_BASES.length){ done(); return; }
      const base = IMG_BASES[i++];
      const t = new Image();
      t.onload  = ()=>{ IMG_BASE = base; done(); };
      t.onerror = tryNext;
      t.src = base + sentinel;
    };
    tryNext();
  }
  return {
    preload(){
      probeBase(()=>{
        for (const k in cache) delete cache[k];
        for (const k in IMG_FILES) load(k);
        setTimeout(()=>{
          const keys = Object.keys(IMG_FILES);
          const got = keys.filter(k=> cache[k] && cache[k].__ready);
          const lost = keys.filter(k=> !(cache[k] && cache[k].__ready));
          if (lost.length && lost.length < keys.length)
            clog('[assets] not resolved:', lost.map(k=> k + ' -> ' + Img.file(k)).join(' | '));
          if (got.length === keys.length){
            clog('[assets] all ' + keys.length + " of Emily's images loaded from " + IMG_BASE);
          } else if (got.length === 0){
            clog('[assets] none of the ' + keys.length + ' images loaded from "' + IMG_BASE
               + '". If the PNGs are on disk, that path is wrong. Set '
               + 'window.MEGAN_IMG_BASE in index.html to the folder they are in.');
          } else {
            const missing = keys.filter(k=> !(cache[k] && cache[k].__ready)).map(k=> IMG_FILES[k]);
            clog('[assets] ' + got.length + '/' + keys.length + ' images loaded from ' + IMG_BASE
               + '. Still to come: ' + missing.slice(0, 4).join(', ')
               + (missing.length > 4 ? ' and ' + (missing.length - 4) + ' more' : ''));
          }
        }, 2500);
      });
    },
    onArrive(fn){ waiting.push(fn); },
    el(key){ const im = load(key); return (im && im.__ready) ? im : null; },
    ok(key){ return !!this.el(key); },
    url(key){
      const im = cache[key];
      if (im && im.__ready && im.__file) return IMG_BASE + encodeURI(im.__file);
      return IMG_FILES[key] ? IMG_BASE + encodeURI(IMG_FILES[key]) : null;
    },
    file(key){ return IMG_FILES[key] || null; },
  };
})();

const DECLINE_LOOP = null;

const AudioBank = (function(){
  const pool = {}, loops = {};
  function candidates(name){
    const out = [];
    const push = (n)=>{ if (n && out.indexOf(n) < 0) out.push(n); };
    const forms = (n)=>{
      push(n);
      push(n.replace(/_/g, ' '));
      push(n.replace(/ /g, '_'));
      push(n.replace(/'/g, '_'));
      push(n.replace(/\u2019/g, '_'));
      const stem = n.replace(/\.[^.]+$/, '');
      ['.mp3', '.wav', '.m4a', '.ogg'].forEach(e=>{ push(stem + e); push(stem.replace(/_/g, ' ') + e); });
    };
    const primary = SND_ALIAS[name] || name;
    forms(primary);
    if (primary !== name) forms(name);
    return out;
  }
  function make(name){
    if (pool[name] !== undefined) return pool[name];
    let a = null;
    try {
      const cands = candidates(name);
      let i = 0;
      a = new Audio();
      a.preload = 'metadata';
      a.addEventListener('error', ()=>{
        i++;
        if (i < cands.length){ try { a.src = SND_BASE + encodeURI(cands[i]); a.load(); } catch(e){} }
        else { clog('[FATIH·missing]', name, 'tried ' + cands.length + ' name variants'); }
      });
      a.src = SND_BASE + encodeURI(cands[0]);
    } catch(e){ a = null; }
    pool[name] = a;
    return a;
  }
  function warm(){ Object.keys(SND_ALIAS).forEach(k=>{ try { make(k); } catch(e){} }); }
  setTimeout(warm, 400);
  return {
    el(name){ return make(name); },
    fire(name, vol, pan){
      const a = make(name); if (!a) return null;
      let n = a;
      try { n = a.cloneNode(true); } catch(e){ n = a; }
      try { n.currentTime = 0; } catch(e){}
      try { n.volume = window.Level ? Level.scale(vol === undefined ? 0.8 : vol, SND_ALIAS[name] || name) : Math.max(0, Math.min(1, vol === undefined ? 0.8 : vol)); } catch(e){}
      const p2 = (pan === undefined) ? window.SS_MEGAN_PAN : pan;
      if (p2 != null && window.Pan){
        const vo = /_vo|voice|dial|doctor|hans|megan_line/i.test(name);
        Pan.set(n, p2, vo ? 'vo' : 'sfx');
      }
      try {
        const pr = n.play();
        if (pr && pr.catch) pr.catch(()=>{
          const retry = ()=>{ try { n.play(); } catch(e){} };
          window.addEventListener('pointerdown', retry, { once:true });
          window.addEventListener('keydown', retry, { once:true });
        });
      } catch(e){}
      return n;
    },
    loop(name, vol){
      if (loops[name]) return loops[name];
      const a = make(name); if (!a) return null;
      a.loop = true;
      a.volume = window.Level ? Level.scale(vol === undefined ? .8 : vol, SND_ALIAS[name] || name) : (vol === undefined ? .8 : vol);
      try { const pr = a.play(); if (pr && pr.catch) pr.catch(()=>{}); } catch(e){}
      loops[name] = a;
      return a;
    },
    stop(name){
      const a = loops[name]; if (!a) return;
      try { a.pause(); a.currentTime = 0; } catch(e){}
      delete loops[name];
    },
    fadeStop(name, ms){
      const a = loops[name]; if (!a) return;
      delete loops[name];
      const v0 = a.volume, T0 = Date.now(), D = ms || 900;
      const step = ()=>{
        const k = Math.min(1, (Date.now() - T0) / D);
        try { a.volume = Math.max(0, v0 * (1 - k)); } catch(e){}
        if (k < 1) setTimeout(step, 40);
        else { try { a.pause(); a.currentTime = 0; a.volume = v0; } catch(e){} }
      };
      step();
    },
    stopAll(){ for (const k in loops) this.stop(k); },
    setVol(name, v){
      const a = loops[name]; if (!a) return;
      a.volume = Math.max(0, Math.min(1, v));
    },
    resume(){
      for (const k in loops){
        try { const pr = loops[k].play(); if (pr && pr.catch) pr.catch(()=>{}); } catch(e){}
      }
    },
  };
})();

try {
  const _unlock = function(){
    window.removeEventListener('pointerdown', _unlock, true);
    AudioBank.resume();
  };
  window.addEventListener('pointerdown', _unlock, true);
} catch(e){}

const Sound = {
  depth: 1,
  _vt: [],
  clearVO(){ clearTimeout(this._sd); clearTimeout(this._sh);
    this._vt.forEach(f=> f.cancel && f.cancel()); this._vt = []; hideLine(); },
  cancelVO(){
    this.clearVO();
    const a = this.lastVoNode;
    this.lastVoNode = null;
    if (a){ try { a.pause(); a.currentTime = 0; } catch(e){} }
  },
  _log(kind, name, brief){ clog('[FATIH·'+kind+']', name, brief||''); },
  play(name, brief, pan){
    this._log('sfx', name, brief);
    AudioBank.fire(name, undefined, pan);
  },
  loop(name, brief){ this._log('loop', name, brief); AudioBank.loop(name); },
  stopLoop(name){ this._log('stop', name); AudioBank.stop(name); },
  fadeOutLoop(name, ms){ this._log('fade', name); AudioBank.fadeStop(name, ms); },
  setDepth(luc){
    this.depth = luc;
    if (!DECLINE_LOOP) return;
    if (!this._declineOn){ this._declineOn = true; AudioBank.loop(DECLINE_LOOP, 0); }
    AudioBank.setVol(DECLINE_LOOP, (1 - luc) * .75);
  },
  stopHum(){ this._hum = null; this._humAt = 0; },
  vo(file, speaker, line, cb, clip){
    let delay = 0, hold = 0;
    if (typeof cb === 'number'){
      delay = cb;
      hold = (typeof clip === 'number') ? clip : 0;
      cb = arguments[5];
      clip = arguments[6];
    }
    clog('[ELIN·vo]', file, speaker+':', line);
    if (delay > 0) this._sd = setTimeout(()=> showLine(speaker, line), delay);
    else showLine(speaker, line);
    if (hold > 0) this._sh = setTimeout(hideLine, (delay || 0) + hold);
    const cut = clip && clip.to != null;
    const est = cut ? (clip.to - clip.from) * 1000 + 260 : Math.max(4200, line.length * 88);
    let done = false, timer = null;
    const self = this;
    const finishVO = ()=>{
      if (done) return; done = true;
      clearTimeout(timer);
      const i = self._vt.indexOf(finishVO); if (i > -1) self._vt.splice(i, 1);
      hideLine(); cb && cb();
    };
    finishVO.cancel = ()=>{ done = true; clearTimeout(timer); };
    this._vt.push(finishVO);
    const a = AudioBank.fire(file);
    this.lastVoNode = a;
    if (a && clip && clip.from){
      const seek = ()=>{ try { a.currentTime = clip.from; } catch(e){} };
      if (a.readyState >= 1) seek(); else a.addEventListener('loadedmetadata', seek, { once:true });
    }
    if (a && cut){
      const cutAt = ()=>{
        if (a.currentTime >= clip.to){
          try { a.pause(); a.currentTime = clip.to; } catch(e){}
        }
      };
      a.addEventListener('timeupdate', cutAt);
      const hardCut = setTimeout(()=>{ try { a.pause(); } catch(e){} },
        (clip.to - (clip.from || 0)) * 1000 + 120);
      this._vt.push({ cancel: ()=> clearTimeout(hardCut) });
    }
    timer = setTimeout(finishVO, est);
    if (cut){ this._vt.push(finishVO); }
    const useDur = (d)=>{
      if (cut) return true;
      if (done || !isFinite(d) || !d) return false;
      clearTimeout(timer);
      timer = setTimeout(finishVO, d * 1000 + 320);
      return true;
    };
    const pooled = AudioBank.el && AudioBank.el(file);
    let tries = cut ? 99 : 0;
    (function probe(){
      if (done || tries++ > 14) return;
      if (a && useDur(a.duration)) return;
      if (pooled && useDur(pooled.duration)) return;
      setTimeout(probe, 220);
    })();
    if (a && a.addEventListener){
      a.addEventListener('loadedmetadata', ()=>{
        if (done || !isFinite(a.duration) || !a.duration) return;
        clearTimeout(timer);
        timer = setTimeout(finishVO, a.duration * 1000 + 260);
      });
      a.addEventListener('ended', finishVO);
    }
    return est;
  },
};
function subLinger(){
  if ((_current || '').indexOf('studio_') !== 0) return 0;
  return Math.round((1 - meganState.lucidity) * 4200);
}
const PAINTING_SCENES = ['studio_born','studio_breadth','studio_calls','studio_fall'];
function showLine(speaker, text){
  if (!text) return;
  if (PAINTING_SCENES.indexOf(_current) > -1) return;
  const host = document.getElementById('meganSub');
  if (!host) return;
  host.style.top = 'auto';
  host.style.bottom = ((_current || '').indexOf('studio_') === 0) ? '11%' : '4%';
  host.style.zIndex = '90';
  const linger = subLinger();
  Array.prototype.slice.call(host.children).forEach(el=>{
    clearTimeout(el.__t);
    if (!linger){ el.remove(); return; }
    el.style.transition = 'opacity ' + linger + 'ms linear, transform ' + linger + 'ms linear';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-' + (12 + rnd()*16).toFixed(0) + 'px)';
    el.__t = setTimeout(()=> el.remove(), linger);
  });
  const line = document.createElement('div');
  line.className = 'subline';
  line.innerHTML = '<div class="spk"></div><div class="txt"></div>';
  const spkEl = line.querySelector('.spk'), txtEl = line.querySelector('.txt');
  spkEl.textContent = speaker || '';
  txtEl.textContent = text;
  host.appendChild(line);
  const scrim = document.getElementById('meganSubScrim');
  if (scrim) scrim.classList.add('on');
  requestAnimationFrame(()=> line.classList.add('on'));
  host.classList.add('on');
}
function hideLine(){
  const host = document.getElementById('meganSub');
  if (!host) return;
  const scrim = document.getElementById('meganSubScrim');
  if (scrim) scrim.classList.remove('on');
  const linger = Math.max(300, subLinger());
  Array.prototype.slice.call(host.children).forEach(el=>{
    if (el.__t) return;
    el.style.transition = 'opacity ' + linger + 'ms linear';
    el.style.opacity = '0';
    el.__t = setTimeout(()=> el.remove(), linger);
  });
}

const HASHES = {
  gallery_entry:'#/megan/gallery',        graduation:'#/megan/graduation',
  studio_born:'#/megan/studio/born',      fill_1:'#/megan/gallery/fill1',
  studio_breadth:'#/megan/studio/breadth',fill_2:'#/megan/gallery/fill2',
  studio_calls:'#/megan/studio/calls',    fill_3:'#/megan/gallery/fill3',
  studio_fall:'#/megan/studio/fall',      ending:'#/megan/ending',
};
const SCENES = {};
let _current = null;

function screenIsCovered(){
  const t = document.getElementById('meganTrans');
  if (t && t.style.display !== 'none') return 'transition';
  const v = document.querySelector('.meganVeil.on');
  if (v) return 'veil';
  const g = document.getElementById('meganGlass');
  if (g && g.style.display === 'block') return 'glass';
  const d = document.getElementById('meganDevelop');
  if (d) return 'develop';
  const th = document.getElementById('studioThreshold');
  if (th && th.style.opacity !== '0') return 'threshold';
  const pod = document.getElementById('podReveal');
  if (pod) return 'pod';
  const cs = document.getElementById('cutscene');
  if (cs && cs.style.display !== 'none' && cs.innerHTML) return 'cutscene';
  return null;
}

function goto(name, opts){
  clog('[scene]', 'entering', name);
  MEGAN_HANDOFFS.push({ to:name, cover:screenIsCovered() });
  const app0 = document.getElementById('app');
  if (app0) app0.classList.toggle('painting', PAINTING_SCENES.indexOf(name) > -1);
  if (MEGAN_HANDOFFS.length > 40) MEGAN_HANDOFFS.shift();
  if (_current && SCENES[_current] && SCENES[_current].exit) SCENES[_current].exit();
  _current = name;
  meganState.scene = name;
  try { history.replaceState(null,'', HASHES[name] || '#/megan'); } catch(e){}
  SCENES[name].enter(opts || {});
}

function fitBox(iw, ih, bw, bh){
  const k = Math.min(bw/iw, bh/ih);
  const w = iw*k, h = ih*k;
  return { x:(bw-w)/2, y:(bh-h)/2, w, h };
}

function appRoot(){ return document.getElementById('app') || document.body; }

function guardEllipses(x){
  if (!x || x.__guarded) return x;
  const real = x.ellipse;
  if (typeof real !== 'function') return x;
  x.ellipse = function(cx, cy, rx, ry, rot, a0, a1, ccw){
    return real.call(this, cx, cy, Math.abs(rx) || 0.01, Math.abs(ry) || 0.01,
                     rot || 0, a0 || 0, a1 === undefined ? 6.283 : a1, ccw);
  };
  x.__guarded = true;
  return x;
}

function showPrimer(done){
  const host = document.getElementById('app') || document.body;
  const ov = document.createElement('div');
  ov.id = 'meganPrimer';
  ov.innerHTML = '<div class="card">'
    + '<h4>her studio</h4>'
    + '<div class="pm-marks">'
    + '<p class="pm-mark">Pick a brush and a colour from her palette.</p>'
    + '<p class="pm-mark">Press and drag. The paint follows your hand.</p>'
    + '<p class="pm-mark">Use the cloth to wipe part of it away.</p>'
    + '<p class="pm-mark">She stops when her pen is on the table.</p>'
    + '</div>'
    + '<div class="go">click anywhere to begin</div>'
    + '</div>';
  host.appendChild(ov);
  requestAnimationFrame(()=> ov.classList.add('on'));
  let gone = false;
  const go = ()=>{
    if (gone) return; gone = true;
    ov.classList.remove('on');
    setTimeout(()=>{ if (ov.parentNode) ov.remove(); done && done(); }, 850);
  };
  ov.addEventListener('click', go);
  SCENES.studio_born._primerT = setTimeout(go, 180000);
}

function transitionCanvas(){
  let c = document.getElementById('meganTrans');
  if (!c){
    c = document.createElement('canvas');
    c.id = 'meganTrans';
    appRoot().appendChild(c);
  }
  c.width = innerWidth; c.height = innerHeight;
  c.style.display = 'block';
  return c;
}

function bloomThrough(cb, tint){
  const c = transitionCanvas(), x = guardEllipses(c.getContext('2d'));
  const W = c.width, H = c.height;
  const j = streamFor('wash-' + (meganState.scene || ''));
  const col = tint || [206, 216, 228];
  const rgb = (a)=> 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + a + ')';
  const runs = [];
  let px = -40;
  while (px < W + 40){
    const w = 26 + j() * 96;
    runs.push({ x: px, w,
      delay: j() * 520,
      spd: 520 + j() * 900,
      lean: (j() - .5) * 42,
      a: .5 + j() * .5,
      dripAt: .35 + j() * .5,
      dripR: 5 + j() * 13 });
    px += w * (.55 + j() * .4);
  }
  const T0 = performance.now(), COVER = 1650, DUR = 3100;
  let handed = false;
  (function frame(){
    const e = performance.now() - T0;
    x.clearRect(0, 0, W, H);
    for (const r of runs){
      const t = (e - r.delay) / 1000;
      if (t <= 0) continue;
      const head = t * r.spd + t * t * 210;
      const g = x.createLinearGradient(0, Math.max(0, head - 260), 0, head);
      g.addColorStop(0, rgb(r.a));
      g.addColorStop(.72, rgb(r.a * .92));
      g.addColorStop(1, rgb(0));
      x.fillStyle = g;
      x.beginPath();
      x.moveTo(r.x, 0);
      x.lineTo(r.x + r.w, 0);
      const lx = r.x + r.lean * Math.min(1, t * .5);
      x.lineTo(lx + r.w * (.82 + Math.sin(t * 2.1 + r.x) * .12), head);
      x.lineTo(lx - r.w * .05 + Math.sin(t * 1.7 + r.x) * 7, head - 26 - Math.sin(t * 3 + r.x) * 18);
      x.closePath();
      x.fill();
      if (t > r.dripAt){
        x.fillStyle = rgb(r.a * .8);
        x.beginPath();
        x.ellipse(lx + r.w * .42, head + r.dripR * .6, r.dripR * .7, r.dripR, 0, 0, 6.283);
        x.fill();
      }
    }
    if (!handed && e >= COVER){
      handed = true;
      x.fillStyle = rgb(1);
      x.fillRect(0, 0, W, H);
      requestAnimationFrame(()=>{ cb && cb(); });
    }
    if (handed){
      const k = Math.min(1, (e - COVER) / (DUR - COVER));
      x.fillStyle = rgb(1 - k);
      x.fillRect(0, 0, W, H);
      if (k >= 1){ c.style.display = 'none'; return; }
    }
    requestAnimationFrame(frame);
  })();
}

function sinkThrough(cb){
  const c = transitionCanvas(), x = guardEllipses(c.getContext('2d'));
  const W = c.width, H = c.height;
  const j = streamFor('sink-' + (meganState.scene || ''));
  const motes = [];
  for (let i = 0; i < 150; i++)
    motes.push({ x: j() * W, y: j() * H, r: .6 + j() * 2.4,
      v: 18 + j() * 60, a: .18 + j() * .5, ph: j() * 6.283 });
  const T0 = performance.now(), COVER = 1500, DUR = 2900;
  let handed = false;
  (function frame(){
    const e = performance.now() - T0, t = e / 1000;
    const kr = Math.min(1, e / COVER);
    const k = 1 - Math.pow(1 - kr, 3);
    x.clearRect(0, 0, W, H);
    const g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(24,38,66,' + (k * .96).toFixed(3) + ')');
    g.addColorStop(.55, 'rgba(14,24,46,' + (k * .99).toFixed(3) + ')');
    g.addColorStop(1, 'rgba(6,11,24,' + k.toFixed(3) + ')');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    for (const m of motes){
      const y = ((m.y - t * m.v) % (H + 40) + H + 40) % (H + 40);
      x.globalAlpha = m.a * k;
      x.fillStyle = '#dfe7f2';
      x.beginPath();
      x.arc(m.x + Math.sin(t * .7 + m.ph) * 7, y, m.r, 0, 6.283);
      x.fill();
    }
    x.globalAlpha = 1;
    if (!handed && e >= COVER){ handed = true; requestAnimationFrame(()=>{ cb && cb(); }); }
    if (handed && e >= DUR){ c.style.display = 'none'; return; }
    if (handed){
      const f = Math.min(1, (e - COVER) / (DUR - COVER));
      x.globalAlpha = 1 - f;
      x.fillStyle = 'rgba(10,16,32,1)';
      x.fillRect(0, 0, W, H);
      x.globalAlpha = 1;
    }
    requestAnimationFrame(frame);
  })();
}

function turnPage(cb, tint){
  const c = transitionCanvas(), x = guardEllipses(c.getContext('2d'));
  const W = c.width, H = c.height;
  const c0 = tint || [222, 228, 240];
  const solid = 'rgb(' + c0[0] + ',' + c0[1] + ',' + c0[2] + ')';
  const soft = (a)=> 'rgba(' + c0[0] + ',' + c0[1] + ',' + c0[2] + ',' + (+a).toFixed(3) + ')';
  const T0 = performance.now();
  const COVER = 900, HOLD = 320, OUT = 1100;
  let handed = false, coveredAt = 0;
  (function frame(){
    const e = performance.now() - T0;
    if (!handed){
      const k = Math.min(1, e / COVER);
      const ease = 1 - Math.pow(1 - k, 3);
      x.clearRect(0, 0, W, H);
      x.globalAlpha = 1;
      x.fillStyle = solid;
      x.fillRect(0, 0, W, H * ease);
      const g = x.createLinearGradient(0, H * ease - 120, 0, H * ease);
      g.addColorStop(0, soft(0));
      g.addColorStop(1, soft(1));
      x.fillStyle = g;
      x.fillRect(0, Math.max(0, H * ease - 120), W, 120);
      if (k >= 1){
        x.fillStyle = solid;
        x.fillRect(0, 0, W, H);
        handed = true;
        coveredAt = performance.now();
        requestAnimationFrame(()=>{ cb && cb(); });
      }
      requestAnimationFrame(frame);
      return;
    }
    const t = performance.now() - coveredAt;
    if (t < HOLD){ requestAnimationFrame(frame); return; }
    const k2 = Math.min(1, (t - HOLD) / OUT);
    x.clearRect(0, 0, W, H);
    x.globalAlpha = 1;
    x.fillStyle = soft(1 - k2);
    x.fillRect(0, 0, W, H);
    if (k2 >= 1){ c.style.display = 'none'; return; }
    requestAnimationFrame(frame);
  })();
}

function holdVeil(){
  const v = document.createElement('div');
  v.className = 'meganVeil';
  appRoot().appendChild(v);
  requestAnimationFrame(()=> v.classList.add('on'));
  return {
    release(delayMs, fadeMs){
      setTimeout(()=>{
        v.style.transition = 'opacity ' + (fadeMs || 1600) + 'ms cubic-bezier(.4,.1,.4,1)';
        v.style.opacity = '0';
        setTimeout(()=>{ if (v.parentNode) v.remove(); }, (fadeMs || 1600) + 200);
      }, delayMs || 360);
    },
  };
}

function glassTransition(cb){
  Sound.play('megan_fill1_glass.wav', 'mirror breaks, the hall gives way to the studio');
  const wrap = document.getElementById('meganGlass');
  wrap.style.display = 'block';
  wrap.innerHTML = '<canvas></canvas>';
  const c = wrap.firstChild, x = guardEllipses(c.getContext('2d'));
  const W = c.width = innerWidth, H = c.height = innerHeight;
  const cx = W * .5, cy = H * .44;
  const R = Math.hypot(W, H) * .78;
  const CRACK = 620, BREAK = 1240, VEIL_IN = 1180, VEIL_AT = 1560, END = 2420;
  const T0 = performance.now();
  const SEC = 11, RINGS = [0.16, 0.36, 0.60, 0.86, 1.14];
  const j = streamFor('mirror-break');

  const ang = [];
  for (let s = 0; s < SEC; s++) ang.push(s / SEC * 6.283 + (j() - .5) * .22);
  const rad = RINGS.map(r => r * R * (.9 + j() * .2));
  const node = [];
  for (let ri = 0; ri < rad.length; ri++){
    node.push([]);
    for (let s = 0; s < SEC; s++){
      const a = ang[s] + (j() - .5) * .12;
      const r = rad[ri] * (.86 + j() * .28);
      node[ri].push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * .92 });
    }
  }
  const shards = [];
  for (let ri = 0; ri < rad.length; ri++){
    for (let s = 0; s < SEC; s++){
      const s2 = (s + 1) % SEC;
      const inner = ri === 0
        ? [{ x: cx + (j() - .5) * 18, y: cy + (j() - .5) * 18 }, { x: cx + (j() - .5) * 18, y: cy + (j() - .5) * 18 }]
        : [node[ri - 1][s], node[ri - 1][s2]];
      const pts = [inner[0], node[ri][s], node[ri][s2], inner[1]];
      let mxp = 0, myp = 0;
      for (const q of pts){ mxp += q.x; myp += q.y; }
      mxp /= pts.length; myp /= pts.length;
      const dist = Math.hypot(mxp - cx, myp - cy) / R;
      shards.push({
        pts: pts.map(q => ({ x: q.x - mxp, y: q.y - myp })),
        x: mxp, y: myp,
        vx: (mxp - cx) / R * (140 + j() * 220),
        vy: (myp - cy) / R * (110 + j() * 200) - (30 + j() * 90),
        rot: 0, vr: (j() - .5) * 2.6,
        delay: dist * 210 + j() * 130,
        tone: .74 + j() * .26,
        tilt: j() * 6.283,
      });
    }
  }
  const dust = [];
  for (let i = 0; i < 130; i++){
    const a = j() * 6.283, d = j() * R * .8;
    dust.push({ x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * .9,
      vx: Math.cos(a) * (24 + j() * 90), vy: Math.sin(a) * (20 + j() * 70) - j() * 40,
      s: .6 + j() * 1.9, a: .3 + j() * .55, delay: j() * 240 });
  }
  const foxing = [];
  for (let i = 0; i < 16; i++) foxing.push({ x: j() * W, y: j() * H, r: 40 + j() * 190, a: .05 + j() * .09 });

  let veil = null, handedOver = false;
  const hand = ()=>{
    if (handedOver) return; handedOver = true;
    veil = holdVeil();
    setTimeout(()=>{
      requestAnimationFrame(()=>{
        cb && cb();
        veil.release(360, 1700);
      });
    }, 760);
  };

  const polyPath = (pts)=>{
    x.beginPath();
    x.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) x.lineTo(pts[i].x, pts[i].y);
    x.closePath();
  };

  (function frame(){
    const now = performance.now(), e = now - T0;
    x.clearRect(0, 0, W, H);

    const silver = Math.min(1, e / 420);
    x.globalAlpha = silver * .34;
    const sg = x.createRadialGradient(cx, cy, 0, cx, cy, R);
    sg.addColorStop(0, 'rgba(233,239,246,.95)');
    sg.addColorStop(.55, 'rgba(201,211,218,.8)');
    sg.addColorStop(1, 'rgba(138,132,147,.7)');
    x.fillStyle = sg; x.fillRect(0, 0, W, H);
    for (const f of foxing){
      const fg = x.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
      fg.addColorStop(0, 'rgba(184,176,160,' + (f.a * silver).toFixed(3) + ')');
      fg.addColorStop(1, 'rgba(184,176,160,0)');
      x.fillStyle = fg; x.beginPath(); x.arc(f.x, f.y, f.r, 0, 6.283); x.fill();
    }
    x.globalAlpha = 1;

    const cp = Math.min(1, e / CRACK);
    if (cp > 0){
      x.lineCap = 'round';
      for (let ri = 0; ri < node.length; ri++){
        const reach = Math.max(0, Math.min(1, cp * node.length - ri));
        if (reach <= 0) continue;
        x.strokeStyle = 'rgba(250,253,255,' + (.5 * reach).toFixed(3) + ')';
        x.lineWidth = 1.6 - ri * .16;
        for (let s = 0; s < SEC; s++){
          const from = ri === 0 ? { x: cx, y: cy } : node[ri - 1][s];
          const to = node[ri][s];
          x.beginPath(); x.moveTo(from.x, from.y);
          x.lineTo(from.x + (to.x - from.x) * reach, from.y + (to.y - from.y) * reach);
          x.stroke();
        }
        x.strokeStyle = 'rgba(238,246,252,' + (.3 * reach).toFixed(3) + ')';
        x.lineWidth = 1;
        x.beginPath();
        for (let s = 0; s <= SEC; s++){
          const p = node[ri][s % SEC];
          if (s === 0) x.moveTo(p.x, p.y); else x.lineTo(p.x, p.y);
        }
        x.stroke();
      }
      const flash = Math.max(0, 1 - e / 260);
      if (flash > 0){
        x.globalAlpha = flash * .5;
        const fgz = x.createRadialGradient(cx, cy, 0, cx, cy, R * .45);
        fgz.addColorStop(0, 'rgba(255,255,255,.95)');
        fgz.addColorStop(1, 'rgba(255,255,255,0)');
        x.fillStyle = fgz; x.fillRect(0, 0, W, H);
        x.globalAlpha = 1;
      }
    }

    const bt = e - CRACK;
    if (bt > 0){
      for (const sh of shards){
        const st = (bt - sh.delay) / 1000;
        if (st <= 0){
          x.save(); x.translate(sh.x, sh.y);
          polyPath(sh.pts);
          x.fillStyle = 'rgba(226,233,241,.16)'; x.fill();
          x.restore();
          continue;
        }
        const a = Math.max(0, 1 - st / (BREAK / 1000) * .92);
        if (a <= 0) continue;
        const px = sh.x + sh.vx * st;
        const py = sh.y + sh.vy * st + 620 * st * st;
        x.save();
        x.globalAlpha = a;
        x.translate(px, py);
        x.rotate(sh.rot + sh.vr * st);
        polyPath(sh.pts);
        x.save(); x.clip();
        const gx = Math.cos(sh.tilt) * 90, gy = Math.sin(sh.tilt) * 90;
        const g = x.createLinearGradient(-gx, -gy, gx, gy);
        g.addColorStop(0, 'rgba(244,248,252,' + (.62 * sh.tone).toFixed(3) + ')');
        g.addColorStop(.42, 'rgba(201,211,218,' + (.5 * sh.tone).toFixed(3) + ')');
        g.addColorStop(.72, 'rgba(163,172,184,' + (.42 * sh.tone).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(138,132,147,' + (.34 * sh.tone).toFixed(3) + ')');
        x.fillStyle = g;
        x.fillRect(-160, -160, 320, 320);
        x.strokeStyle = 'rgba(255,255,255,.5)';
        x.lineWidth = 2;
        x.beginPath(); x.moveTo(-140, -18); x.lineTo(140, 26); x.stroke();
        x.restore();
        x.strokeStyle = 'rgba(255,255,255,' + (.5 * a).toFixed(3) + ')';
        x.lineWidth = 1;
        polyPath(sh.pts); x.stroke();
        x.restore();
      }
      for (const d of dust){
        const st = (bt - d.delay) / 1000;
        if (st <= 0) continue;
        const a = Math.max(0, d.a * (1 - st / 1.5));
        if (a <= 0) continue;
        x.fillStyle = 'rgba(240,245,250,' + a.toFixed(3) + ')';
        x.beginPath();
        x.arc(d.x + d.vx * st, d.y + d.vy * st + 520 * st * st, d.s, 0, 6.283);
        x.fill();
      }
    }

    if (e >= VEIL_AT) hand();
    if (e >= VEIL_IN){
      const vp = Math.min(1, (e - VEIL_IN) / 900);
      x.globalAlpha = vp * .9;
      x.fillStyle = '#c9d3da';
      x.fillRect(0, 0, W, H);
      x.globalAlpha = 1;
    }

    if (e < END) requestAnimationFrame(frame);
    else { wrap.style.display = 'none'; wrap.innerHTML = ''; hand(); }
  })();
}

let _hintEl = null, _hintTimer = null;
function scheduleHint(text, delayMs, place){
  cancelHint();
  _hintTimer = setTimeout(()=>{
    if (!_hintEl){
      _hintEl = document.createElement('div');
      _hintEl.className = 'hintline';
      document.getElementById('app').appendChild(_hintEl);
    }
    _hintEl.classList.toggle('lower', place === 'lower');
    _hintEl.classList.toggle('lowest', place === 'lowest');
    _hintEl.textContent = text;
    requestAnimationFrame(()=> _hintEl.classList.add('on'));
  }, delayMs);
}
function cancelHint(){
  clearTimeout(_hintTimer);
  if (_hintEl) _hintEl.classList.remove('on');
}
function dropHint(){ cancelHint(); _hintEl = null; }

const STUDIO_CFG = {
  W: 880, H: 495,
  layersPerDab: 6, dabAlpha: 11, spacingK: .42,
  covCols: 20, covRows: 12, memCount: 3,
  skins: {
    born:    { wood1:'#5a4636', wood2:'#43342a' },
    breadth: { wood1:'#4e4238', wood2:'#3a322c' },
    calls:   { wood1:'#453d3d', wood2:'#332e31' },
    fall:    { wood1:'#3d3a44', wood2:'#2c2a33' },
  },
  palettes: {
    born:    ['#1e2d4c','#233251','#384358','#6b7683','#748493','#d2cab1','#e0dcc1'],
    breadth: ['#24314c','#2a3855','#646c75','#938c95','#b27890','#c0a983','#e5b77b'],
    calls:   ['#2c4462','#385370','#3e5873','#435b74','#5c7089','#818f9c','#b9c4cf'],
    fall:    ['#1b2845','#202f4e','#243352','#293754','#4a5570','#8e9096','#d0cac4'],
  },
  accents: {
    breadth: ['#b27890'],
  },
  wellCount: 7,
  reachSide: { born:'right', breadth:'bottom', calls:'full', fall:'full' },
  covThresh: { born:.55, breadth:.70, calls:.8, fall:.82 },
  restAfter: { born:0, breadth:50, calls:50, fall:50 },
  overshoot: { born:.05, breadth:.07, calls:.1, fall:.16 },
  historyCap: 8,
  brushes: [6, 11, 18],
};

function paletteFromArt(painting, want){
  const im = Img.el('aw_' + painting);
  if (!im || !im.naturalWidth) return null;
  try {
    const w = 96, h = Math.max(1, Math.round(96 * im.naturalHeight / im.naturalWidth));
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = guardEllipses(c.getContext('2d'));
    x.drawImage(im, 0, 0, w, h);
    const half = halfOfArt(painting);
    const rx = half === 'right'  ? Math.floor(w/2) : 0;
    const ry = half === 'bottom' ? Math.floor(h/2) : 0;
    const rw = half === 'right'  ? w - rx : w;
    const rh = half === 'bottom' ? h - ry : h;
    const d = x.getImageData(rx, ry, rw, rh).data;
    if (!d || d.length < w * h * 2) return null;
    const bins = {};
    for (let i = 0; i < d.length; i += 4){
      const r = d[i], g = d[i+1], b = d[i+2];
      if (d[i+3] < 200) continue;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      const v = mx / 255, sat = mx ? (mx - mn) / mx : 0;
      if (v > .95 && sat < .08) continue;
      if (v < .1) continue;
      const k = (r >> 5) + '_' + (g >> 5) + '_' + (b >> 5);
      const e = bins[k] || (bins[k] = { n:0, r:0, g:0, b:0 });
      e.n++; e.r += r; e.g += g; e.b += b;
    }
    const list = Object.keys(bins).map(k=>{
      const e = bins[k];
      return { n:e.n, r:Math.round(e.r/e.n), g:Math.round(e.g/e.n), b:Math.round(e.b/e.n) };
    }).sort((a, b)=> b.n - a.n);
    const out = [];
    for (const e of list){
      if (out.length >= want) break;
      const far = out.every(o=> Math.abs(o.r-e.r) + Math.abs(o.g-e.g) + Math.abs(o.b-e.b) > 40);
      if (far) out.push(e);
    }
    if (out.length < 4) return null;
    while (out.length < want) out.push(out[out.length - 1]);
    const hex = (n)=> ('0' + n.toString(16)).slice(-2);
    return out.map(e=> '#' + hex(e.r) + hex(e.g) + hex(e.b));
  } catch(e){ return null; }
}
function lumaOf(hexStr){
  const n = parseInt(hexStr.slice(1), 16);
  return ((n >> 16) & 255) + ((n >> 8) & 255) + (n & 255);
}
function halfOfArt(painting){
  const side = STUDIO_CFG.reachSide[painting];
  return side === 'bottom' ? 'bottom' : side === 'right' ? 'right' : 'full';
}
function studioPalette(painting){
  const acc = (STUDIO_CFG.accents && STUDIO_CFG.accents[painting]) || [];
  const want = Math.max(2, STUDIO_CFG.wellCount - acc.length);
  const fromArt = paletteFromArt(painting, want);
  const base = (fromArt || STUDIO_CFG.palettes[painting] || []).slice()
    .filter(c=> typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c));
  const out = [];
  for (const c of base){ if (out.indexOf(c) < 0) out.push(c); }
  for (const a of acc){ if (out.indexOf(a) < 0) out.push(a); }
  while (out.length > STUDIO_CFG.wellCount){
    let drop = -1;
    for (let i = out.length - 1; i >= 0; i--){ if (acc.indexOf(out[i]) < 0){ drop = i; break; } }
    if (drop < 0) break;
    out.splice(drop, 1);
  }
  while (out.length < STUDIO_CFG.wellCount)
    out.push(out.length ? out[out.length - 1] : '#4f6d8f');
  out.sort((a, b)=> lumaOf(a) - lumaOf(b));
  clog('[palette]', painting, fromArt ? 'from Emily\u2019s painting' : 'from the sampled constants',
       ':', out.join(' '), acc.length ? '(accent kept: ' + acc.join(' ') + ')' : '');
  return out;
}

let studio = null;

let _ringMove = null, _studioPara = null, _studioParaRaf = 0, _studioBoot = 0;

let _fitBound = false;
function fitStage(){
  const st = document.getElementById('stage');
  if (!st) return;
  const availW = window.innerWidth * 0.62;
  const availH = window.innerHeight * 0.60;
  const k = Math.max(0.72, Math.min(1.9,
    Math.min(availW / STUDIO_CFG.W, availH / STUDIO_CFG.H)));
  st.style.setProperty('--stage-k', k.toFixed(3));
  if (!_fitBound){
    _fitBound = true;
    window.addEventListener('resize', fitStage);
  }
}

function enterStudio(painting, opts){
  if (typeof p5 === 'undefined'){
    showFatal('p5.js did not load (CDN unreachable). The studio needs it. Check the network, or serve the local copy.');
    return;
  }
  const host = document.getElementById('studioHost');
  host.style.display = 'block';
  host.classList.remove('megan-push'); void host.offsetWidth;
  host.classList.add('megan-push');
  let ring = document.getElementById('brushRing');
  if (!ring){
    ring = document.createElement('div');
    ring.id = 'brushRing';
    document.body.appendChild(ring);
    _ringMove = (e)=>{
      const st = document.getElementById('stage');
      const sh = document.getElementById('studioHost');
      if (!st || !sh || sh.style.display === 'none'){ ring.style.display = 'none'; return; }
      const r = st.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right
                  && e.clientY >= r.top  && e.clientY <= r.bottom;
      ring.style.display = inside ? 'block' : 'none';
      if (!inside) return;
      const scale = r.width / STUDIO_CFG.W;
      const d = STUDIO_CFG.brushes[1] * 2 * scale;
      ring.style.width = ring.style.height = d + 'px';
      ring.style.left = (e.clientX - d/2) + 'px';
      ring.style.top  = (e.clientY - d/2) + 'px';
    };
    window.addEventListener('pointermove', _ringMove);
  }
  host.innerHTML =
    '<div id="stageWrap"><div id="easelFrame"></div><div id="stage"></div></div>' +
    '<div id="toolbar"></div>' +
    '<div class="hintline studio" id="studioHint"></div>' +
    '<div id="watchBars"><span class="bar top"></span><span class="bar bottom">'
    + '<i class="run"></i></span></div>' +
    '<div id="studioNote"><span class="pin"></span><em></em></div>';
  const sWrap = buildStudioRoom(host);
  buildEaselFrame();

  let ppx = 0, ppy = 0, spx = 0, spy = 0;
  _studioPara = (e)=>{
    ppx = e.clientX/innerWidth*2 - 1;
    ppy = e.clientY/innerHeight*2 - 1;
  };
  window.addEventListener('pointermove', _studioPara);
  const sdc = document.createElement('canvas');
  sdc.width = 900; sdc.height = 506;
  sdc.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;mix-blend-mode:screen';
  host.appendChild(sdc);
  const sdx = guardEllipses(sdc.getContext('2d'));
  const SMOTES = [];
  for (let i=0;i<18;i++) SMOTES.push({ x:Math.random(), y:Math.random(), s:.8+Math.random()*1.8, vy:.00012+Math.random()*.0002, ph:Math.random()*6.283 });
  const paraLoop = ()=>{
    const L = sWrap.children;
    if (L.length >= 3){
      const decay = Math.min(1, LUC.warp / (WARP_MAX || 1));
      const follow = .12 * (1 - decay*.75);
      spx += (ppx - spx)*follow; spy += (ppy - spy)*follow;
      const wt = performance.now()*.00016;
      const dx = (dreamNoise(wt) - .5) * decay * 26, dy = (dreamNoise(wt+7) - .5) * decay * 16;
      const flat = 1 - decay*.72;
      L[0].style.transform = 'translate('+(-spx*7*flat + dx*.4)+'px,'+(-spy*3*flat + dy*.4)+'px) scale('+(1 + .03*flat)+')';
      L[1].style.transform = 'translate('+(-spx*16*flat + dx*.7)+'px,'+(-spy*6*flat + dy*.7)+'px) scale('+(1 + .02*flat)+')';
      L[2].style.transform = 'translate('+(-spx*28*flat + dx)+'px,'+(-spy*10*flat + dy)+'px) scale('+(1 + .04*flat)+')';
    }
    sdx.clearRect(0, 0, 900, 506);
    const sdt = performance.now();
    for (const m of SMOTES){
      m.y -= m.vy; if (m.y < -.02){ m.y = 1.02; m.x = Math.random(); }
      const mx = (m.x + Math.sin(sdt/2600 + m.ph)*.01 - spx*.02) * 900;
      const my = m.y * 506;
      const a = .04 + .06*(.5 + .5*Math.sin(sdt/1800 + m.ph*2));
      sdx.fillStyle = 'rgba(250,242,220,' + a.toFixed(3) + ')';
      sdx.beginPath(); sdx.arc(mx, my, m.s, 0, 6.283); sdx.fill();
    }
    _studioParaRaf = requestAnimationFrame(paraLoop);
  };
  _studioParaRaf = requestAnimationFrame(paraLoop);

  const skin = STUDIO_CFG.skins[painting];
  const tb = document.getElementById('toolbar');
  tb.style.bottom = 'auto'; tb.style.top = '18px';
  tb.style.setProperty('--wood1', skin.wood1);
  tb.style.setProperty('--wood2', skin.wood2);

  const slow = !!(opts && opts.intro === 'openstudio');
  const sw = document.getElementById('stageWrap');
  try { fitStage(); } catch(e){}
  host.style.opacity = '0';
  sw.style.opacity = '0';
  clearTimeout(_studioBoot);
  _studioBoot = setTimeout(()=>{
    _studioBoot = 0;
    if (!document.getElementById('toolbar') || !document.getElementById('stage')) return;
    host.style.transition = 'opacity 1.1s ease';
    sw.style.transition = 'opacity 1.3s ease';
    studio = makeStudio(painting, opts || {});
    requestAnimationFrame(()=>{
      host.style.opacity = '1';
      sw.style.opacity = '1';
    });
  }, slow ? 500 : 60);
}

function exitStudio(){
  clearTimeout(_studioBoot); _studioBoot = 0;
  Sound.cancelVO();
  Sound.stopLoop('megan_studio_ambience.wav');
  if (_studioPara){ window.removeEventListener('pointermove', _studioPara); _studioPara = null; }
  if (_studioParaRaf){ cancelAnimationFrame(_studioParaRaf); _studioParaRaf = 0; }
  if (studio){ studio.dispose(); studio = null; }
  const host = document.getElementById('studioHost');
  if (!host) return;
  host.style.display = 'none'; host.innerHTML = '';
  host.style.opacity = '1'; host.style.transition = 'none';
}

function makeStudio(painting, opts){
  const C = STUDIO_CFG;
  const pal = studioPalette(painting);
  let selColor = pal[Math.min(1, pal.length - 1)], selBrush = 1;
  const TOOL = { type:'wash', water:.5 };
  let sx = 0, sy = 0, svx = 0, svy = 0;
  let dabCount = 0, finished = false, voUnlocked = false, idleT = null, holdT = null;
  const NEEDS_HOLD = painting !== 'born';
  const SIGNS = painting === 'born';
  const hooks = { undo:null, clear:null, hist:()=> 0, mems:()=> 0,
                  sign:null, signing:()=> false, sigMarks:()=> 0, sigStop:null,
                  confirm:null, pen:()=> 'off', memsReady:()=> 0 };
  let coverage = 0;
  const covHit = new Set();
  const fullReach = painting === 'fall';
  const reachSide = C.reachSide[painting] || 'left';
  const inReach = (x, y)=> reachSide === 'bottom' ? y >= C.H/2
                         : reachSide === 'top'    ? y <= C.H/2
                         : reachSide === 'right'  ? x >= C.W/2
                         : x <= C.W/2;
  const covCells = (function(){
    if (fullReach) return C.covCols * C.covRows;
    const cw = C.W / C.covCols, ch = C.H / C.covRows;
    let n = 0;
    for (let ci = 0; ci < C.covCols; ci++)
      for (let ri = 0; ri < C.covRows; ri++)
        if (inReach((ci + .5) * cw, (ri + .5) * ch)) n++;
    return n || 1;
  })();

  let paintT0 = 0, restPoll = 0;
  const CUES = (VO_TIMELINES[painting] || []).slice();
  let cueAt = 0;

  let hintT = null;
  function flashHint(text, sticky){
    if (window.Mode) Mode.act();
    const wb = document.getElementById('watchBars');
    if (wb && wb.classList.contains('on')){
      wb.classList.remove('on');
      const run = wb.querySelector('.run');
      if (run){ run.classList.remove('drift'); run.style.transition = 'none'; run.style.width = '0%'; }
    }
    const h = document.getElementById('studioHint');
    if (!h) return;
    h.textContent = text;
    h.classList.add('on');
    clearTimeout(hintT);
    if (sticky) return;
    hintT = setTimeout(()=>{
      const el = document.getElementById('studioHint');
      if (el) el.classList.remove('on');
    }, 5200);
  }
  function clearStudioHint(){
    clearTimeout(hintT);
    if (window.Mode) Mode.watch();
    const h = document.getElementById('studioHint');
    if (h) h.classList.remove('on');
  }

  const inst = new p5((p)=>{
    let refL, userL, memL, mems = [];
    let lastDab = null;
    const wetPool = [];
    const WET_CAP = 200;
    const WET_STAGES = [0.14, 0.34, 0.56, 0.78, 0.94];

    let pressPrev = false;
    const history = [];
    function pushHistory(){
      if (!userL) return;
      try {
        const c = document.createElement('canvas');
        c.width = C.W; c.height = C.H;
        const cx2 = guardEllipses(c.getContext('2d'));
        if (userL.elt && cx2.drawImage) cx2.drawImage(userL.elt, 0, 0);
        history.push({ img:c, cov:new Set(covHit), dabs:dabCount });
        while (history.length > C.historyCap) history.shift();
      } catch(e){}
    }
    function restore(snap){
      if (!snap || !userL) return;
      try {
        userL.clear();
        const g = userL.drawingContext;
        if (g && g.drawImage) g.drawImage(snap.img, 0, 0);
      } catch(e){}
      covHit.clear();
      snap.cov.forEach(k=> covHit.add(k));
      coverage = covHit.size / covCells;
      dabCount = snap.dabs;
      wetPool.length = 0;
      lastDab = null;
    }
    function undoStroke(){
      if (finished) return;
      const snap = history.pop();
      if (!snap){ flashHint('nothing to lift yet.'); return; }
      restore(snap);
    }
    function clearSheet(){
      if (finished) return;
      pushHistory();
      paintPaper(userL);
      covHit.clear();
      coverage = 0;
      dabCount = 0;
      wetPool.length = 0;
      lastDab = null;
      flashHint('a clean sheet.');
    }
    hooks.undo = undoStroke;
    hooks.clear = clearSheet;
    hooks.hist = ()=> history.length;
    hooks.mems = ()=> mems.length;
    hooks.memsReady = ()=> mems.filter(m=> m.ready).length;
    hooks.sign = ()=> beginSignature();
    hooks.sigStop = ()=>{ if (sigTeardown) sigTeardown(); };
    hooks.confirm = ()=> penAction();
    hooks.pen = ()=> penMode;
    hooks.signing = ()=> signing;
    hooks.sigMarks = ()=> sigInk.n;
    p.setup = ()=>{
      const cv = p.createCanvas(C.W, C.H);
      cv.parent(document.getElementById('stage'));
      p.pixelDensity(Math.min(2, window.devicePixelRatio||1));
      refL  = p.createGraphics(C.W, C.H);
      userL = p.createGraphics(C.W, C.H);
      memL  = p.createGraphics(C.W, C.H);
      [refL,userL,memL].forEach(g=> g.pixelDensity(1));
      const ps = (meganState.seed ^ hashKey(painting)) >>> 0;
      p.randomSeed(ps); p.noiseSeed(ps);
      paintPaper(userL);
      const refKey = 'aw_' + painting;
      const drawEmilyRef = ()=>{
        const el = Img.el(refKey);
        if (!el || !el.width) return false;
        try {
          refL.clear();
          const k = Math.min(refL.width/el.width, refL.height/el.height);
          const dw = el.width*k, dh = el.height*k;
          refL.drawingContext.drawImage(el, (refL.width-dw)/2, (refL.height-dh)/2, dw, dh);
          if (painting==='breadth' || painting==='calls') damageRef(refL, p, painting);
          return true;
        } catch(e){ return false; }
      };
      if (!drawEmilyRef()){
        refL.clear();
        clog('[assets]', IMG_FILES[refKey], 'has not loaded, the reference stays blank until it does');
        Img.onArrive((key)=>{ if (key === refKey) drawEmilyRef(); });
      setTimeout(drawEmilyRef, 900);
      setTimeout(drawEmilyRef, 2600);
      }
      mems = buildMemories(p, painting);
      buildToolbar();
      Sound.loop('megan_studio_ambience.wav','warm room tone, brush jar, distant sea');
      if (NEEDS_HOLD){
        const tb0 = document.getElementById('toolbar');
        if (tb0){ tb0.style.opacity = '0'; tb0.style.pointerEvents = 'none'; }
        watchMode(true);
        voUnlocked = false;
        startVoice();
        scheduleArm();
      } else {
        armTools();
        idleT = setTimeout(()=>{
          if (!finished && !voStarted) flashHint('touch the canvas to begin.');
        }, 15000);
      }
    };

    p.draw = ()=>{
      const luc = lucidityAt(painting, progress());
      meganState.lucidity = luc;
      applyLucidity(luc);
      handleStroke(p, luc);
      settleWet(p, luc);
      fireVOs();
      if (p.frameCount % 30 === 0) noteNow();

      p.background(228, 226, 219);
      drawMemories(p, mems, luc);
      const refShow = NEEDS_HOLD && !voUnlocked ? 0 : LUC.refA;
      if (refShow > 1){ p.push(); p.tint(255, refShow); p.image(refL, 0, 0); p.pop(); }
      p.image(userL, 0, 0);
      if (painting === 'calls' && voUnlocked && !finished && p.frameCount % 42 === 0 && rnd() < .5){
        const sx0 = rnd() * C.W/2, sy0 = 40 + rnd() * (C.H - 80);
        const len = 24 + rnd() * 70, ang = (rnd() - .5) * 1.1;
        userL.stroke(120, 128, 150, 26 + rnd() * 26);
        userL.strokeWeight(1 + rnd() * 1.8);
        userL.line(sx0, sy0, sx0 + Math.cos(ang) * len, sy0 + Math.sin(ang) * len);
        userL.noStroke();
      }
      if (!fullReach) drawReachVeil(p);
    };

    function handleStroke(p, luc){
      if (signing){
        sx = p.mouseX; sy = p.mouseY; svx = 0; svy = 0;
        pressPrev = false;
        return;
      }
      if (!p.mouseIsPressed || finished){
        sx = p.mouseX; sy = p.mouseY; svx = 0; svy = 0;
        pressPrev = false;
        if (!p.mouseIsPressed) return;
        return;
      }
      if (p.mouseY > C.H || p.mouseY < 0 || p.mouseX < 0 || p.mouseX > C.W) return;
      if (!voUnlocked){ sx = p.mouseX; sy = p.mouseY; return; }
      if (!pressPrev){ pressPrev = true; pushHistory(); }
      svx = (svx + (p.mouseX - sx) * .18) * .78;
      svy = (svy + (p.mouseY - sy) * .18) * .78;
      sx += svx; sy += svy;
      const intent = { x:sx, y:sy };
      const size = C.brushes[selBrush] * (TOOL.type === 'round' ? .55 : TOOL.type === 'liner' ? .4 : TOOL.type === 'fan' ? 1.35 : 1);
      if (lastDab && p.dist(intent.x,intent.y,lastDab.x,lastDab.y) < size*C.spacingK) return;
      lastDab = intent;
      const flowT = p.millis() * .00035;
      const dnx = p.noise(intent.x*.004, intent.y*.004, flowT) - .5;
      const dny = p.noise(intent.x*.004 + 30, intent.y*.004 + 30, flowT) - .5;
      let _dk = LUC.drift;
      if (window.Grammar && Grammar.firstRun('megan_dab')){ _dk = 0; Grammar.consume('megan_dab'); }
      if (window.Pan) window.SS_MEGAN_PAN = Pan.fromX(intent.x, C.W) * 0.6;
      const exec = {
        x: p.constrain(intent.x + dnx * _dk * 4.4, 0, C.W),
        y: p.constrain(intent.y + dny * _dk * 4.4, 0, C.H),
      };
      const sp = Math.hypot(svx, svy);
      if (!reachAllows(p, exec, luc)){
        if (sp > 26 && rnd() < (C.overshoot[painting] || 0)){
          startVoice();
          dab(p, exec, size * .7, luc, sp);
          markCoverage(exec, size * .7);
        } else {
          refuseMark(p, exec, size);
        }
        return;
      }
      startVoice();
      if (!paintT0){
        paintT0 = performance.now();
        if (C.restAfter[painting]){
          restPoll = setInterval(()=>{
            if (finished){ clearInterval(restPoll); restPoll = 0; return; }
            if (canRest()){ clearInterval(restPoll); restPoll = 0; closeOut(); }
          }, 500);
        }
      }
      clearStudioHint();
      noteNow();
      if (!strayArmed && voUnlocked){
        strayArmed = true;
        strayLast = p.millis() + 1200;
      }
      dab(p, exec, size, luc, sp);
      if (painting === 'calls') strayEcho(p, exec, size, luc);
      markCoverage(exec, size);
      if (painting === 'born' && dabCount === 1)

      checkFinish();
    }

    function reachAllows(p, pt, luc){
      if (fullReach) return true;
      if (inReach(pt.x, pt.y)) return true;
      if (painting === 'breadth') return rnd() < p.map(luc,.6,.45,0,.10,true);
      if (painting === 'calls')   return rnd() < .22;
      return false;
    }

    function actualColor(p, xpos){
      let c = p.color(selColor);
      p.colorMode(p.HSB, 360, 100, 100, 255);
      let h = p.hue(c), s = p.saturation(c), b = p.brightness(c);
      const drift = Math.max(0, Math.min(1, LUC.colorShift / (COLOR_MAX || 1)));
      const lowSat = s < 16;
      if (!lowSat){
        const dh = ((320 - h + 540) % 360) - 180;
        h = (h + dh * drift * .6 + 360) % 360;
        if (fullReach && xpos < C.W/2) h = (h + 40) % 360;
      }
      if (painting === 'fall' && !lowSat){
        const slip = 18 + progress() * 46;
        h = (h + slip) % 360;
        s = Math.max(12, s * (1 - progress() * .3));
      }
      const out = p.color(h, Math.min(100, s * (1 + (lowSat ? 0 : drift*.15))), b);
      p.colorMode(p.RGB, 255);
      const rec = meganState.laid[painting] || (meganState.laid[painting] = { r:0, g:0, b:0, n:0 });
      rec.r += p.red(out); rec.g += p.green(out); rec.b += p.blue(out); rec.n++;
      return out;
    }

    function dab(p, at, size, luc, sp){
      dabCount++;
      const spd = sp || 0;
      const water = TOOL.water * (spd > 2.5 ? Math.max(0.3, 1 - (spd - 2.5) * 0.05) : 1);
      const wet = .25 + water * 2.0;
      userL.noStroke();
      if (TOOL.type === 'water'){
        let pts = deform(p, seedPoly(p, at.x, at.y, size*1.2, 7), size*.5);
        userL.fill(238, 234, 226, 10 + water * 14);
        userL.beginShape();
        for (const q of pts) userL.vertex(q.x, q.y);
        userL.endShape(p.CLOSE);
        pushWet(p, at.x, at.y, size*1.1, [238,234,226], water, luc, spd, 'water');
        return;
      }
      const col = actualColor(p, at.x);
      const layers = TOOL.type === 'dry' ? Math.max(2, C.layersPerDab - 3)
                   : TOOL.type === 'fan' ? 1
                   : TOOL.type === 'wash' ? C.layersPerDab + 2 : C.layersPerDab;
      const alpha  = TOOL.type === 'dry'   ? C.dabAlpha * .55
                   : TOOL.type === 'round' ? Math.min(30, C.dabAlpha * 1.7)
                   : TOOL.type === 'liner' ? Math.min(36, C.dabAlpha * 2.1)
                   : TOOL.type === 'fan'   ? C.dabAlpha * .34
                   : C.dabAlpha * (0.3 + water * 1.5);
      const spread = (TOOL.type === 'round' ? .5 : TOOL.type === 'dry' ? 1.5
                    : TOOL.type === 'liner' ? .3 : TOOL.type === 'fan' ? .34 : 1.9) * wet;
      const bodyR = TOOL.type === 'wash' ? size * 1.55 : TOOL.type === 'fan' ? size * .34 : size;
      let base = seedPoly(p, at.x, at.y, bodyR, (TOOL.type === 'round' || TOOL.type === 'liner') ? 9 : 7);
      base = deform(p, base, size*.45*spread);
      for (let l=0; l<layers; l++){
        let pts = deform(p, base, size*.3*spread);
        pts = deform(p, pts, size*.18*spread);
        userL.fill(p.red(col), p.green(col), p.blue(col), alpha);
        userL.beginShape();
        for (const q of pts) userL.vertex(q.x, q.y);
        userL.endShape(p.CLOSE);
      }
      if (TOOL.type === 'dry'){
        const off = size * .5;
        let pts = deform(p, seedPoly(p, at.x + p.random(-off,off), at.y + p.random(-off,off), size*.4, 5), size*.3);
        userL.fill(p.red(col), p.green(col), p.blue(col), alpha*.7);
        userL.beginShape();
        for (const q of pts) userL.vertex(q.x, q.y);
        userL.endShape(p.CLOSE);
      }
      if (TOOL.type === 'fan'){
        const nx = -(svy || 0), ny = (svx || 0);
        const nl = Math.hypot(nx, ny) || 1;
        const ux = nx / nl, uy = ny / nl;
        for (let k=-3;k<=3;k++){
          if (k === 0) continue;
          const gapx = at.x + ux * k * size * 1.35;
          const gapy = at.y + uy * k * size * 1.35;
          let fp = deform(p, seedPoly(p, gapx, gapy, size*.3, 5), size*.16);
          userL.fill(p.red(col), p.green(col), p.blue(col), alpha * (1 - Math.abs(k)*.16));
          userL.beginShape(); for (const q of fp) userL.vertex(q.x, q.y); userL.endShape(p.CLOSE);
        }
      }
      pushWet(p, at.x, at.y, size, [p.red(col), p.green(col), p.blue(col)], water, luc, spd, TOOL.type);
    }
    function pushWet(p, x, y, r, col, water, luc, sp, kind){
      if (kind === 'dry' || kind === 'liner') return;
      const lucN = Math.max(0, Math.min(1, luc));
      const pool = sp < 0.6 ? 1.5 : 1;
      const life = (420 + water * 1150) * pool * (kind === 'water' ? 1.25 : 1);
      const spread = ((kind === 'water' ? .7 : .30) + water * 1.15) * (1 + (1 - lucN) * 1.1) * pool;
      wetPool.push({ x, y, r, col:[col[0], col[1], col[2]], t0:p.millis(), life, spread, luc:lucN, kind, stage:0,
        drip: TOOL.water > .8 && r > 9 && rnd() < .10 });
      if (wetPool.length > WET_CAP) wetPool.splice(0, wetPool.length - WET_CAP);
    }
    function settleWet(p){
      const now = p.millis();
      for (let i = wetPool.length - 1; i >= 0; i--){
        const w = wetPool[i];
        const age = (now - w.t0) / w.life;
        while (w.stage < WET_STAGES.length && age >= WET_STAGES[w.stage]){
          wetStage(p, w, w.stage); w.stage++;
        }
        if (age >= 1) wetPool.splice(i, 1);
      }
    }
    function wetStage(p, w, s){
      const last = WET_STAGES.length - 1;
      const g = s / last;
      if (s === last){ wetEdge(p, w); return; }
      const rr = w.r * (1 + g * w.spread);
      const a = (w.kind === 'water' ? 5 : 6) * (1 - g * .65);
      const jit = rr * (.14 + (1 - w.luc) * .5);
      const pts = deform(p, seedPoly(p, w.x, w.y, rr, 8), jit);
      userL.noStroke();
      userL.fill(w.col[0], w.col[1], w.col[2], a);
      userL.beginShape();
      for (const q of pts) userL.vertex(q.x, q.y);
      userL.endShape(p.CLOSE);
      if (s === 0 && w.kind !== 'water') granulate(p, w);
    }
    function granulate(p, w){
      userL.noStroke();
      for (let k = 0; k < 14; k++){
        const a2 = p.random(6.283), rad = w.r * Math.sqrt(p.random());
        const gx = w.x + Math.cos(a2) * rad, gy = w.y + Math.sin(a2) * rad;
        const grain = p.noise(gx * .18, gy * .18);
        if (grain < .52) continue;
        userL.fill(w.col[0] * .82, w.col[1] * .82, w.col[2] * .82, 26 * grain);
        userL.circle(gx, gy, 1 + grain * 2.2);
      }
    }
    function runDrip(p, w){
      const g = userL.drawingContext;
      if (!g) return;
      const len = w.r * (2.4 + rnd() * 5.2) * (.6 + TOOL.water * .8);
      const sway = (rnd() - .5) * w.r * .5;
      const steps = Math.max(6, Math.round(len / 3));
      let px = w.x + (rnd() - .5) * w.r * .3;
      let py = w.y + w.r * .7;
      g.save();
      for (let i = 0; i < steps; i++){
        const t = i / steps;
        const nx = px + sway * .04 + (rnd() - .5) * .7;
        const ny = py + len / steps;
        const wgt = (1 - t) * (1.1 + w.r * .05) + .35;
        g.globalAlpha = (.05 + (1 - t) * .09) * (.5 + w.luc * .5);
        g.strokeStyle = 'rgb(' + Math.round(w.col[0]*.82) + ','
                               + Math.round(w.col[1]*.82) + ','
                               + Math.round(w.col[2]*.82) + ')';
        g.lineWidth = wgt;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(px, py);
        g.lineTo(nx, ny);
        g.stroke();
        px = nx; py = ny;
      }
      g.globalAlpha = .12 * (.5 + w.luc * .5);
      g.beginPath();
      g.ellipse(px, py, 1.6 + w.r * .05, 2.4 + w.r * .07, 0, 0, 6.283);
      g.fillStyle = 'rgb(' + Math.round(w.col[0]*.78) + ','
                           + Math.round(w.col[1]*.78) + ','
                           + Math.round(w.col[2]*.78) + ')';
      g.fill();
      g.restore();
    }

    function wetEdge(p, w){
      if (w.drip) runDrip(p, w);
      const rr = w.r * (1 + w.spread);
      const pts = deform(p, seedPoly(p, w.x, w.y, rr, 9), rr * .1);
      userL.noFill();
      userL.stroke(w.col[0] * .7, w.col[1] * .7, w.col[2] * .7, 22 * (.5 + w.luc * .5));
      userL.strokeWeight(1 + w.r * .03);
      userL.beginShape();
      for (const q of pts) userL.vertex(q.x, q.y);
      userL.endShape(p.CLOSE);
      userL.noStroke();
    }
    function seedPoly(p, cx, cy, r, n){
      const pts = [];
      for (let i=0;i<n;i++){
        const a = i/n*6.283;
        pts.push({ x:cx+Math.cos(a)*r*p.random(.7,1.3), y:cy+Math.sin(a)*r*p.random(.7,1.3) });
      }
      return pts;
    }
    function deform(p, pts, mag){
      const out = [];
      for (let i=0;i<pts.length;i++){
        const a = pts[i], b = pts[(i+1)%pts.length];
        out.push(a);
        out.push({ x:(a.x+b.x)/2 + p.randomGaussian(0,mag),
                   y:(a.y+b.y)/2 + p.randomGaussian(0,mag) });
        if (out.length > 200) break;
      }
      return out;
    }

    function strayEcho(p, at, size, luc){
      if (!voUnlocked || !strayArmed || strayLeft <= 0) return;
      if (!inReach(at.x, at.y) || rnd() > .06) return;
      if (p.millis() - strayLast < 900) return;
      strayLast = p.millis();
      strayLeft--;
      const ex = C.W - at.x + p.randomGaussian(0, 30);
      userL.stroke(138,132,147, 34); userL.strokeWeight(1.2); userL.noFill();
      userL.line(ex, at.y-6+p.random(12), ex+p.randomGaussian(0,22), at.y+p.randomGaussian(0,16));
      userL.noStroke();
    }

    function markCoverage(pt, size){
      const cw = C.W / C.covCols, ch = C.H / C.covRows;
      const c0 = Math.max(0, Math.floor((pt.x-size)/cw));
      const c1 = Math.min(C.covCols-1, Math.floor((pt.x+size)/cw));
      const r0 = Math.max(0, Math.floor((pt.y-size)/ch));
      const r1 = Math.min(C.covRows-1, Math.floor((pt.y+size)/ch));
      for (let ci=c0; ci<=c1; ci++){
        for (let ri=r0; ri<=r1; ri++){
          if (!fullReach && !inReach((ci+.5) * cw, (ri+.5) * ch)) continue;
          covHit.add(ci + '_' + ri);
        }
      }
      coverage = covHit.size / covCells;
    }
    let voStarted = false, voT0 = 0, voDurMs = 0, toolHinted = false, voEndT = null;
    let strayLeft = 9, strayLast = 0, strayArmed = false;
    let voNode = null, voLastT = -1, voLastAt = 0;
    function startVoice(){
      if (voStarted) return;
      voStarted = true;
      clearTimeout(idleT);
      voT0 = p.millis();
      voLastT = -1; voLastAt = p.millis();
      const est = Sound.vo('megan_vo_' + painting + '.wav', '', '', ()=>{
        voDurMs = Math.max(voDurMs, p.millis() - voT0);
        voSeqDone = true;
        offerEasel();
      });
      voNode = Sound.lastVoNode || null;
      voDurMs = est || 30000;
      const take = ()=>{
        const d = voNode && voNode.duration;
        if (isFinite(d) && d > 0) voDurMs = d * 1000;
      };
      const armEnd = ()=>{
        clearTimeout(voEndT);
        voEndT = setTimeout(()=>{
          if (finished || voSeqDone) return;
          voSeqDone = true;
          offerEasel();
        }, Math.min(VO_MAX_MS, (voDurMs || 12000) + 3000));
      };
      take();
      armEnd();
      if (voNode && voNode.addEventListener)
        voNode.addEventListener('loadedmetadata', ()=>{ take(); armEnd(); });
    }
    function armNudges(){
      idleT = setTimeout(()=>{
        if (finished || dabCount > 0) return;
        pulsePalette();
        idleT = setTimeout(()=>{
          if (finished || dabCount > 0) return;
          flashHint('drag across the canvas to lay the paint down.', true);
        }, 12000);
      }, 8000);
    }

    function pulsePalette(){
      const tb = document.getElementById('toolbar');
      if (!tb) return;
      tb.classList.add('calling');
      setTimeout(()=> tb.classList.remove('calling'), 4200);
    }

    function demoStroke(){
      if (finished) return;
      const from = { x: C.W * (fullReach ? .30 : reachSide === 'bottom' ? .30 : .58),
                     y: C.H * (reachSide === 'bottom' ? .70 : .46) };
      const to   = { x: from.x + C.W * .16, y: from.y + C.H * .07 };
      const N = 26;
      let i = 0;
      const step = ()=>{
        if (finished || i > N) {
          flashHint('now it is yours. drag across the canvas.', true);
          return;
        }
        const t = i / N;
        const px = from.x + (to.x - from.x) * t;
        const py = from.y + (to.y - from.y) * t + Math.sin(t * 3.1) * 9;
        dab(p, { x:px, y:py }, C.brushes[1] * .9, luc0(), 14);
        markCoverage({ x:px, y:py }, C.brushes[1] * .9);
        i++;
        setTimeout(step, 34);
      };
      flashHint('she lays down one last stroke.');
      setTimeout(step, 900);
    }

    function luc0(){ return lucidityAt(painting, 0); }

    function voAudioProgress(){
      if (!voStarted) return 0;
      if (voSeqDone) return 1;
      const wall = Math.max(0, Math.min(1, (p.millis() - voT0) / (voDurMs || 30000)));
      const a = voNode;
      if (!a || !isFinite(a.duration) || a.duration <= 0) return wall;
      const now = p.millis();
      if (a.currentTime > voLastT + .01){ voLastT = a.currentTime; voLastAt = now; }
      else if (now - voLastAt > 700) return wall;
      return Math.max(0, Math.min(1, a.currentTime / a.duration));
    }
    function watchMode(on){
      const w = document.getElementById('watchBars');
      if (!w) return;
      w.classList.toggle('on', !!on);
      if (window.Mode){ if (on) Mode.watch(); else Mode.act(); }
      let lab = w.querySelector('.wm-label');
      if (!lab){
        lab = document.createElement('div');
        lab.className = 'wm-label';
        w.appendChild(lab);
      }
      lab.textContent = 'her hands are busy. just watch.';
      const run = w.querySelector('.run');
      if (!run) return;
      if (!on){
        run.classList.remove('drift');
        run.style.transition = 'none';
        run.style.width = '0%';
        return;
      }
      const d = voDurMs;
      const timed = (d && isFinite(d) && d > 400);
      run.classList.toggle('drift', !timed);
      if (!timed){
        run.style.transition = 'none';
        run.style.width = '';
        return;
      }
      run.style.transition = 'none';
      run.style.width = '0%';
      requestAnimationFrame(()=>{
        run.style.transition = 'width ' + Math.max(4000, d) + 'ms linear';
        run.style.width = '100%';
      });
    }

    function setNote(text){
      const n = document.getElementById('studioNote');
      if (!n) return;
      const body = n.querySelector('em');
      if (!body) return;
      if (!text){ n.classList.remove('on'); return; }
      if (body.textContent === text){ n.classList.add('on'); return; }
      body.textContent = text;
      n.classList.remove('flip');
      void n.offsetWidth;
      n.classList.add('on', 'flip');
    }

    function noteNow(){
      if (finished) return;
      if (!voUnlocked) return setNote('');
      if (signing) return setNote('write your name on the line');
      if (penMode === 'hook') return setNote('hang it in the gallery');
      if (penMode === 'pen') return setNote('her pen is on the table');
      if (dabCount === 0) return setNote('drag across the canvas');
      if (!paintedEnough()) return setNote(painting === 'born' ? 'keep going, someone is still talking' : 'keep going');
      return setNote('almost there');
    }

    function armTools(){
      if (voUnlocked) return;
      voUnlocked = true;
      watchMode(false);
      const tb = document.getElementById('toolbar');
      if (tb){
        tb.style.transition = 'opacity 1.4s ease';
        tb.style.opacity = '1';
        tb.style.pointerEvents = 'auto';
      }
      if (painting === 'born' && !meganState.primed){
        meganState.primed = true;
        showPrimer(()=>{ demoStroke(); armNudges(); });
      } else {
        flashHint('pick a brush and a colour, then drag across the canvas.', true);
        armNudges();
      }
      if (!toolHinted){
        toolHinted = true;
        setTimeout(()=>{ if (!finished && !history.length) flashHint('the cloth lifts a wash.'); }, 14000);
      }
    }
    function lastCueAt(){
      let last = 0;
      for (const c of (VO_TIMELINES[painting] || [])) if (c.at > last) last = c.at;
      return last;
    }
    function scheduleArm(){
      const need = Math.min(0.995, lastCueAt() + 0.06);
      const poll = ()=>{
        if (finished) return;
        if (voSeqDone || voAudioProgress() >= need){ armTools(); return; }
        holdT = setTimeout(poll, 250);
      };
      holdT = setTimeout(poll, 250);
    }
    function progress(){ return Math.min(1, coverage / C.covThresh[painting]); }
    function paintedEnough(){ return coverage >= C.covThresh[painting]; }
    function paintElapsed(){ return paintT0 ? (performance.now() - paintT0) / 1000 : 0; }
    function canRest(){
      const cap = C.restAfter[painting];
      if (cap && dabCount >= 25 && paintElapsed() >= cap) return true;
      if (!voSeqDone) return false;
      return paintedEnough();
    }
    function closeOut(){
      if (finished) return;
      if (SIGNS) { revealEasel(); return; }
      finish('painted');
    }
    function offerEasel(){
      if (finished) return;
      if (canRest()){ closeOut(); return; }
      flashHint('not yet.');
    }
    function checkFinish(){
      if (finished) return;
      if (canRest()){ closeOut(); return; }
    }
    function easelNudge(){
      let n = document.getElementById('easelNudge');
      if (!n){
        n = document.createElement('div');
        n.id = 'easelNudge';
        n.style.cssText = 'position:fixed;left:26px;top:22px;z-index:120;max-width:42vw;'
          + 'font:italic 400 14px/1.6 Georgia,serif;color:rgba(214,218,228,.82);'
          + 'text-align:left;opacity:0;transition:opacity .5s ease;pointer-events:none;'
          + 'text-shadow:0 1px 8px rgba(6,10,20,.75)';
        appRoot().appendChild(n);
      }
      n.textContent = voSeqDone ? 'not yet.' : 'she is still speaking.';
      n.style.opacity = '1';
      clearTimeout(n._t);
      n._t = setTimeout(()=>{ n.style.opacity = '0'; }, 2600);
    }

    let voSeqDone = false, easelArmed = false, tbRedraw = null;
    let signing = false, sigTeardown = null, penMode = 'off', sigConfirm = null;
    const sigInk = { n:0 };
    function penAction(){
      if (penMode === 'pen'){ beginSignature(); return; }
      if (penMode === 'hook' && sigConfirm) sigConfirm();
    }
    function revealEasel(){
      if (!SIGNS || easelArmed || finished) return;
      easelArmed = true;
      penMode = 'pen';
      noteNow();
      if (tbRedraw) tbRedraw();
      flashHint('her pen is on the table.');
    }
    function fireVOs(){
      if (!voStarted || !CUES.length) return;
      const q = voAudioProgress();
      while (cueAt < CUES.length && q >= CUES[cueAt].at){
        const v = CUES[cueAt++];
        if (v.f && SND_ALIAS[v.f]) Sound.play(v.f);
      }
    }

    function memEnvelope(mode, n, idx, q, dur, ms, phase){
      const slot = 1 / Math.max(1, n);
      const rise = Math.max(.14, Math.min(.34, (MEM_CFG.riseMs / Math.max(1, dur)) / slot));
      if (mode.kind === 'alternate'){
        const u = (q - idx * slot) / slot;
        if (u <= 0){
          return (idx === 0 && q >= 0) ? Math.max(0, 1 + u / rise) * .35 : 0;
        }
        if (u >= 1) return 0;
        if (u < rise) return u / rise;
        if (u > 1 - rise) return (1 - u) / rise;
        return 1;
      }
      if (mode.kind === 'layered'){
        const u = (q - idx * slot) / slot;
        if (u <= 0) return 0;
        return u < rise ? u / rise : 1;
      }
      const arrive = idx * slot * .72;
      const u2 = (q - arrive) / Math.max(.02, slot * .72);
      let env = u2 <= 0 ? 0 : u2 < rise ? u2 / rise : 1;
      env = Math.max(mode.floor || 0, env);
      const settle = Math.min(1, u2 / (rise * 2.4));
      const breath = .86 + .14 * (.5 + .5 * Math.sin(ms * .0011 + phase));
      return env * (settle < 1 ? 1 : breath);
    }

    function drawMemories(p, mems, luc){
      if (!mems.length || (NEEDS_HOLD && voUnlocked)) return;
      const mode = MEM_MODE[painting];
      if (!mode) return;
      const ms = p.millis();
      const q = voAudioProgress();
      const dur = voDurMs || 30000;
      const ceiling = voUnlocked ? MEM_CFG.paintAlpha : MEM_CFG.holdAlpha;
      for (let i = 0; i < mems.length; i++){
        const m = mems[i];
        if (!m.ready) continue;
        let env = memEnvelope(mode, mems.length, i, q, dur, ms, m.phase);
        const hslot = 1 / Math.max(1, mems.length);
        const held = ((q - i * hslot) / hslot) % 1;
        const settled = held > .12 && held < .88;
        if (mode.flicker && env > 0 && !settled && p.frameCount % 4 === 0
            && rnd() < .04 + LUC.flick * .06) env *= .55 + rnd() * .3;
        const a = ceiling * env * m.w;
        if (a < 2) continue;
        p.push();
        p.tint(255, a);
        p.image(m.g, 0, 0, C.W, C.H);
        p.pop();
      }
    }

    function refuseMark(p, at, size){
      startVoice();
      const g = userL.drawingContext;
      if (!g) return;
      const n = 1 + Math.floor(rnd() * 2);
      for (let i = 0; i < n; i++){
        const a = rnd() * 6.283, d = rnd() * size * .9;
        g.save();
        g.globalAlpha = .028 + rnd() * .03;
        g.fillStyle = '#8A8493';
        g.beginPath();
        g.ellipse(at.x + Math.cos(a) * d, at.y + Math.sin(a) * d,
                  size * (.1 + rnd() * .16), size * (.05 + rnd() * .1), a, 0, 6.283);
        g.fill();
        g.restore();
      }
    }

    function drawReachVeil(p){
      p.noStroke();
      const g = 26;
      if (reachSide === 'bottom' || reachSide === 'top'){
        const half = C.H/2, y0 = (reachSide === 'bottom') ? 0 : half;
        for (let i=0;i<g;i++){ p.fill(26,32,50, 3.4); p.rect(0, y0 + i*half/g, C.W, half/g+1); }
        return;
      }
      const halfW = C.W/2, x0 = (reachSide === 'right') ? 0 : halfW;
      for (let i=0;i<g;i++){ p.fill(26,32,50, 3.4); p.rect(x0 + i*halfW/g, 0, halfW/g+1, C.H); }
    }

    function finish(how){
      if (finished) return; finished = true;
      if (restPoll){ clearInterval(restPoll); restPoll = 0; }
      Sound.stopLoop('megan_studio_ambience.wav');
      saveUserPainting();
      sealPainting();
    }

    function saveUserPainting(){
      if (!userL || !userL.elt) return;
      try {
        const SW = Math.round(C.W * 0.5), SH = Math.round(C.H * 0.5);
        const c = document.createElement('canvas');
        c.width = SW; c.height = SH;
        const cx2 = c.getContext('2d');
        if (!cx2 || !cx2.drawImage) return;
        cx2.fillStyle = '#E4E2DB';
        cx2.fillRect(0, 0, SW, SH);
        cx2.drawImage(userL.elt, 0, 0, SW, SH);
        const data = c.toDataURL('image/jpeg', 0.82);
        if (!data || data.length > 900000) return;
        sessionStorage.setItem('megan_painting_' + painting, data);
        let list = [];
        try { list = JSON.parse(sessionStorage.getItem('megan_painting_list') || '[]'); }
        catch(e){ list = []; }
        if (!Array.isArray(list)) list = [];
        if (list.indexOf(painting) < 0) list.push(painting);
        sessionStorage.setItem('megan_painting_list', JSON.stringify(list));
      } catch(e){}
    }

    function sealPainting(){
      if (meganState.paintingsDone.indexOf(painting) < 0)
        meganState.paintingsDone.push(painting);
      if (painting === 'breadth'){ easelTopple(); return; }
      if (painting === 'fall'){ collapseAll(); return; }
      bloomThrough(()=> AFTER_PAINT[painting]());
    }

    function beginSignature(){
      if (!SIGNS || finished || signing) return;
      if (!canRest()){ easelNudge(); return; }
      signing = true;
      const st = document.getElementById('studioHost') || document.body;
      if (!st){ finish('signed'); return; }
      const SIG = SIG_CFG[painting];

      const veil = document.createElement('div');
      veil.id = 'sigVeil';
      veil.style.cssText = 'position:fixed;inset:0;z-index:2147481000;'
        + 'background:radial-gradient(ellipse at 50% 46%, rgba(10,16,28,.70) 0%, rgba(6,10,20,.90) 70%);'
        + 'opacity:0;transition:opacity 1.2s ease;pointer-events:none';
      st.appendChild(veil);
      requestAnimationFrame(()=> veil.style.opacity = '1');

      const box = document.createElement('div');
      box.id = 'sigBox';
      box.style.cssText = 'position:fixed;left:50%;top:50%;'
        + 'transform:translate(-50%,-50%);width:min(560px,62vw);height:min(300px,34vh);'
        + 'z-index:2147482000;cursor:crosshair;opacity:0;transition:opacity 1.5s ease;'
        + 'background:linear-gradient(180deg,rgba(255,253,246,.62) 0%,rgba(255,252,242,.93) 62%,rgba(255,252,242,.97) 100%);'
        + 'box-shadow:0 6px 22px rgba(28,20,12,.2), 0 0 0 1px rgba(40,48,66,.14) inset;'
        + 'border-radius:3px';
      const rule = document.createElement('div');
      rule.style.cssText = 'position:absolute;left:9%;right:9%;bottom:30%;height:1.5px;'
        + 'background:rgba(40,48,66,.55)';
      const cap = document.createElement('div');
      cap.id = 'sigCap';
      cap.textContent = SIG.prompt;
      cap.style.cssText = 'position:absolute;left:6%;right:6%;bottom:10%;'
        + 'font:400 13px/1.6 system-ui;letter-spacing:.22em;text-transform:uppercase;'
        + 'color:rgba(40,48,66,.62);transition:opacity .8s ease';
      const ink = document.createElement('div');
      ink.id = 'sigInkLayer';
      ink.style.cssText = 'position:absolute;left:0;top:0;right:0;bottom:0;'
        + 'z-index:2147483000;pointer-events:none;overflow:hidden';
      box.appendChild(rule); box.appendChild(ink); box.appendChild(cap);
      st.appendChild(box);
      if (window.Mode) Mode.act();
      penMode = 'off';
      box.style.opacity = '1';
      try { if (tbRedraw) tbRedraw(); } catch(e){}
      flashHint(SIG.hint);

      let drawing = false, marks = 0, lastPt = null, sealed = false;
      let inkLen = 0, restT = null;
      const ENOUGH = 16;
      const armHook = ()=>{
        if (sealed) return;
        settleSignature();
      };

      const toPaper = (e)=>{
        const r = box.getBoundingClientRect();
        if (!r.width || !r.height) return null;
        return { x:((e.clientX - r.left) / r.width) * 100,
                 y:((e.clientY - r.top) / r.height) * 100 };
      };
      const inBox = (e)=>{
        const r = box.getBoundingClientRect();
        return e.clientX >= r.left && e.clientX <= r.right
            && e.clientY >= r.top  && e.clientY <= r.bottom;
      };

      const dot = (x, y, w)=>{
        const d = document.createElement('i');
        d.style.cssText = 'position:absolute;display:block;border-radius:50%;'
          + 'background:' + SIG.col + ';'
          + 'width:' + w.toFixed(1) + 'px;height:' + w.toFixed(1) + 'px;'
          + 'left:' + x.toFixed(3) + '%;top:' + y.toFixed(3) + '%;'
          + 'margin:' + (-w / 2).toFixed(1) + 'px 0 0 ' + (-w / 2).toFixed(1) + 'px;';
        ink.appendChild(d);
      };

      const paint = (from, to)=>{
        const r = box.getBoundingClientRect();
        const dxp = (to.x - from.x) / 100 * r.width;
        const dyp = (to.y - from.y) / 100 * r.height;
        const dist = Math.hypot(dxp, dyp);
        const steps = Math.max(1, Math.ceil(dist / 1.6));
        for (let i = 1; i <= steps; i++){
          const t = i / steps;
          dot(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t, SIG.nib);
        }
      };

      let lastSeen = 0;
      const fresh = (e)=>{
        const now = (e && e.timeStamp) || performance.now();
        if (now === lastSeen) return false;
        lastSeen = now;
        return true;
      };

      const down = (e)=>{
        if (!inBox(e)) return;
        if (!fresh(e)) return;
        e.preventDefault();
        drawing = true;
        cap.style.opacity = '0';
        lastPt = toPaper(e);
        if (lastPt) dot(lastPt.x, lastPt.y, SIG.nib);
      };
      const move = (e)=>{
        if (!drawing) return;
        if (!fresh(e)) return;
        const pt = toPaper(e);
        if (!pt || !lastPt) return;
        const step = Math.hypot(pt.x - lastPt.x, pt.y - lastPt.y);
        if (step < 0.15) return;
        paint(lastPt, pt);
        inkLen += step;
        lastPt = pt;
        marks++;
        sigInk.n++;
      };
      const up = ()=>{
        if (!drawing) return;
        drawing = false; lastPt = null;
        if (inkLen >= ENOUGH) armHook();
        if (restT) clearTimeout(restT);
        if (inkLen > 0){
          restT = setTimeout(()=>{
            if (sealed || drawing) return;
            armHook();
          }, 2400);
        }
      };
      sigConfirm = ()=>{ if (!sealed && inkLen > 0) settleSignature(); };

      window.addEventListener('pointerdown', down, true);
      window.addEventListener('pointermove', move, true);
      window.addEventListener('pointerup', up, true);
      window.addEventListener('mousedown', down, true);
      window.addEventListener('mousemove', move, true);
      window.addEventListener('mouseup', up, true);
      sigTeardown = ()=>{
        window.removeEventListener('pointerdown', down, true);
        window.removeEventListener('pointermove', move, true);
        window.removeEventListener('pointerup', up, true);
        window.removeEventListener('mousedown', down, true);
        window.removeEventListener('mousemove', move, true);
        window.removeEventListener('mouseup', up, true);
        if (restT) clearTimeout(restT);
        signing = false;
        if (veil){ veil.style.opacity = '0';
          setTimeout(()=>{ if (veil.parentNode) veil.remove(); }, 1300); }
        if (tbRedraw) tbRedraw();
        if (box.parentNode) box.remove();
      };

      function settleSignature(){
        if (sealed) return; sealed = true;
        penMode = 'off';
        sigConfirm = null;
        if (tbRedraw) tbRedraw();
        cap.textContent = 'signed';
        cap.style.opacity = '1';
        cap.style.color = 'rgba(40,48,66,.85)';
        box.style.transition = 'transform 1.1s cubic-bezier(.22,.9,.3,1), opacity 1.1s ease';
        box.style.transform = 'translate(-50%,-50%) scale(1.03)';
        flashHint('it is hers now.');
        setTimeout(()=>{ box.style.transform = 'translate(-50%,-50%) scale(1)'; }, 380);
        setTimeout(()=>{
          if (sigTeardown) sigTeardown();
          finish('signed');
        }, 2600);
      }
    }

    function easelTopple(){
      const wrap = document.getElementById('stageWrap');
      const host = document.getElementById('studioHost');
      if (!wrap || !host){ AFTER_PAINT.breadth(); return; }
      const glow = document.createElement('div');
      glow.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:3;opacity:0;background:radial-gradient(circle at 50% 45%, rgba(255,238,206,.5), rgba(255,238,206,0) 60%);transition:opacity .5s ease';
      host.appendChild(glow);
      requestAnimationFrame(()=>{ glow.style.opacity = '1'; });
      const T0 = performance.now();
      (function shake(){
        const e = performance.now()-T0;
        if (e < 900){
          const damp = 1 - e/900;
          wrap.style.transform = 'translate('+(Math.sin(e*.045)*6*damp)+'px,'+(Math.sin(e*.062)*4*damp)+'px)';
          requestAnimationFrame(shake);
        } else {
          Sound.play('megan_canvas_fall.mp3','the easel goes over');
          setTimeout(()=> Sound.play('megan_canvas_scatter1.mp3','canvases slide across the floor'), 720);
          wrap.style.transition = 'transform 1.05s cubic-bezier(.45,.05,.7,1)';
          wrap.style.transform = 'rotate(11deg) translateY(46vh) scale(.96)';
          glow.style.transition = 'opacity 1.5s ease'; glow.style.opacity = '0';
          setTimeout(()=> glow.remove(), 1600);
          setTimeout(()=> AFTER_PAINT.breadth(), 1250);
        }
      })();
    }

    function collapseAll(){
      const stageEl = document.getElementById('stage');
      if (!stageEl){ AFTER_PAINT.fall(); return; }
      Sound.play('megan_canvas_fall.mp3','the easel goes over again');
      setTimeout(()=> Sound.play('megan_canvas_scatter2.mp3','everything comes down with it'), 720);
      const snap = p.get();
      const ov = document.createElement('canvas');
      ov.style.cssText = 'position:fixed;inset:0;z-index:72';
      ov.width = innerWidth; ov.height = innerHeight;
      appRoot().appendChild(ov);
      let mdefs = document.getElementById('meganMeltDefs');
      if (!mdefs){
        mdefs = document.createElement('div');
        mdefs.id = 'meganMeltDefs';
        mdefs.style.cssText = 'position:absolute;width:0;height:0;pointer-events:none';
        mdefs.innerHTML = '<svg><defs><filter id="meganMelt" x="-10%" y="-10%" width="120%" height="120%">'
          + '<feTurbulence type="fractalNoise" baseFrequency="0.01 0.016" numOctaves="2" seed="6" result="w">'
          + '<animate attributeName="baseFrequency" dur="8s" values="0.01 0.016;0.016 0.024;0.01 0.016" repeatCount="indefinite"/>'
          + '</feTurbulence>'
          + '<feDisplacementMap in="SourceGraphic" in2="w" scale="6" xChannelSelector="R" yChannelSelector="G">'
          + '<animate attributeName="scale" dur="3.2s" values="6;26" fill="freeze"/>'
          + '</feDisplacementMap></filter></defs></svg>';
        appRoot().appendChild(mdefs);
      }
      ov.style.filter = 'url(#meganMelt)';
      const ox = guardEllipses(ov.getContext('2d'));
      const st = document.getElementById('stage').getBoundingClientRect();
      const img = snap.canvas || snap.elt, sc = snapScale(snap);
      const COLS=12, ROWS=8, tw=C.W/COLS, th=C.H/ROWS, cells=[];
      const ccx = st.left + (st.right-st.left)/2, ccy = st.top + (st.bottom-st.top)/2;
      for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++){
        const px = st.left + (c+.5)*tw, py = st.top + (r+.5)*th;
        cells.push({ c, r, px, py,
          ang: Math.atan2(py-ccy, px-ccx) + (rnd()-.5)*.9,
          spd: .16 + rnd()*.5, drift: rnd()*6.283, rot:0, vr:(rnd()-.5)*.04, seed: rnd()*100 });
      }
      document.getElementById('toolbar').style.transition = 'opacity 1.4s';
      document.getElementById('toolbar').style.opacity = '0';
      const hostEl = document.getElementById('studioHost');
      hostEl.style.transition = 'opacity 2.8s ease';
      setTimeout(()=> hostEl.style.opacity = '0', 500);
      const T0 = performance.now(), DUR = 3400;
      (function frame(){
        const now = performance.now(), e = (now-T0)/1000, t = Math.min(1,(now-T0)/DUR);
        ox.clearRect(0,0,ov.width,ov.height);
        ox.globalCompositeOperation = 'source-over';
        ox.fillStyle = 'rgba(11,17,32,' + (t*.9).toFixed(3) + ')';
        ox.fillRect(0,0,ov.width,ov.height);
        for (const cell of cells){
          const a = Math.max(0, 1 - t*1.15);
          if (a <= 0) continue;
          const flow = dreamNoise(now*.0004 + cell.seed) - .5;
          const dist = e * cell.spd * 130;
          const dx = Math.cos(cell.ang)*dist + Math.sin(now*.0006 + cell.drift)*e*22;
          const dy = Math.sin(cell.ang)*dist - e*26 + flow*e*30;
          cell.rot += cell.vr;
          const s = 1 + t*.6;
          ox.save();
          ox.globalAlpha = a;
          ox.translate(cell.px + dx, cell.py + dy);
          ox.rotate(cell.rot);
          ox.drawImage(img, cell.c*tw*sc, cell.r*th*sc, tw*sc, th*sc, -tw*s/2, -th*s/2, tw*s, th*s);
          ox.restore();
        }
        if (t < 1) requestAnimationFrame(frame);
        else {
          ov.remove();
          setTimeout(()=> AFTER_PAINT.fall(), 1800);
        }
      })();
      function snapScale(s){ return (s.canvas ? s.canvas.width : s.elt.width) / C.W; }
      p.noLoop();
    }

    function buildToolbar(){
      const tb = document.getElementById('toolbar');
      tb.innerHTML = '';
      tb.style.background = 'none';
      tb.style.boxShadow = 'none';
      tb.style.borderRadius = '0';
      tb.style.padding = '0';
      tb.style.gap = '10px';
      tb.style.top = 'auto';
      tb.style.bottom = '26px';

      const PW = 940, PH = 188;
      const fitDisp = ()=> Math.max(.72, Math.min(1.60, (innerWidth - 72) / PW));
      let DISP = fitDisp();
      const pcv = document.createElement('canvas');
      pcv.width = PW * 2; pcv.height = PH * 2;
      const sizePalette = ()=>{
        DISP = fitDisp();
        pcv.style.width = (PW * DISP) + 'px';
        pcv.style.height = (PH * DISP) + 'px';
      };
      sizePalette();
      _paletteFit = sizePalette;
      window.addEventListener('resize', sizePalette);
      setTimeout(()=>{
        const r = tb.getBoundingClientRect();
        const off = Math.round((r.left + r.width / 2) - innerWidth / 2);
        clog('[layout] window', innerWidth + 'x' + innerHeight,
             'tray', Math.round(r.width) + 'px',
             'left', Math.round(r.left),
             'off-centre', off + 'px',
             'position', getComputedStyle(tb).position);
        if (Math.abs(off) > 30 || getComputedStyle(tb).position !== 'fixed')
          showFatal('palette off-centre by ' + off + 'px (position: '
            + getComputedStyle(tb).position + ')');
      }, 700);
      pcv.style.cursor = 'pointer';
      tb.appendChild(pcv);
      const px2 = guardEllipses(pcv.getContext('2d'));
      px2.scale(2, 2);

      const OUT = '#000000', WOOD = '#9c7854', WOODd = '#9c6c54', CREAM = '#fcf0cc', WATERC = '#b9c6d6';
      const LWID = 1.5, TAU = Math.PI * 2;
      const prng = mulberry((meganState.seed ^ 0x9e3779b9) >>> 0);
      function sPoly(cx, cy, r, n){ const a = []; for (let i=0;i<n;i++){ const t=i/n*TAU, rr=r*(0.86+prng()*0.28); a.push([cx+Math.cos(t)*rr, cy+Math.sin(t)*rr]); } return a; }
      function defo(pts, mag){ const o=[]; for (let i=0;i<pts.length;i++){ const a=pts[i], b=pts[(i+1)%pts.length]; o.push(a); o.push([(a[0]+b[0])/2+(prng()-.5)*2*mag, (a[1]+b[1])/2+(prng()-.5)*2*mag]); } return o; }
      function shape(pts, fill, lw){ px2.beginPath(); px2.moveTo(pts[0][0],pts[0][1]); for (let i=1;i<pts.length;i++) px2.lineTo(pts[i][0],pts[i][1]); px2.closePath(); if (fill){ px2.fillStyle=fill; px2.fill(); } px2.strokeStyle=OUT; px2.lineJoin='round'; px2.lineWidth=lw||LWID; px2.stroke(); }

      const palC = [140, 118];
      const palOutline = defo(sPoly(palC[0], palC[1], 96, 22).map(([x,y])=>[x, palC[1]+(y-palC[1])*0.66]), 3);
      const thumb = defo(sPoly(palC[0]+34, palC[1]+22, 15, 12), 1.4);
      const wellDefs = [[-56,-30],[-26,-42],[8,-44],[38,-34],[56,-8],[-66,2],[-40,24]];
      const wells = wellDefs.map((d, i)=>({ c:[palC[0]+d[0], palC[1]+d[1]], pts: defo(sPoly(palC[0]+d[0], palC[1]+d[1], 12, 11), 1.6), col: pal[i] }));

      const jarX = 340, jarTop = 118, jarBot = 170, jarW = 30;
      const jar = defo([[jarX-jarW,jarTop],[jarX-jarW*0.82,jarBot],[jarX+jarW*0.82,jarBot],[jarX+jarW,jarTop]], 1.4);
      let hover = null, hoverKey = '';
      function inPoly(x, y, pts){
        let hit = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++){
          const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
          if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) hit = !hit;
        }
        return hit;
      }
      const BRUSH_LABEL = {
        wash:'flat wash',
        round:'round brush',
        dry:'dry brush',
        water:'clean water',
        liner:'liner',
        fan:'fan brush',
      };
      const TYPES = ['wash','round','dry','water','liner','fan'];
      const SIZE_FOR = { wash:2, round:1, dry:0, water:1, liner:0, fan:2 };
      const TIPCOL = { wash:'#8296b4', round:'#6f8fb0', dry:'#7a8caa', water:'#d3dce8', liner:'#5f7ba0', fan:'#9fb0c8' };
      const brushes = TYPES.map((t, i)=>({ type:t, bx: jarX - 30 + i*12 }));

      const bowlX = 530, bowlTop = 118, bowlW = 62;
      const ragX = 686, ragY = 128;
      const sheetX = 792, sheetY = 126;
      const penX = 886, penY = 126;
      const bowl = defo([[bowlX-bowlW,bowlTop],[bowlX-bowlW*0.8,bowlTop+34],[bowlX+bowlW*0.8,bowlTop+34],[bowlX+bowlW,bowlTop]], 1.4);

      function drawBrush(b, lifted){
        const bx = b.bx, lift = lifted ? 7 : 0, top = 66 - lift, ferr = 128 - lift, hb = jarBot - 12;
        shape([[bx-2.4,ferr],[bx-1.8,hb],[bx+1.8,hb],[bx+2.4,ferr]], WOOD, 1.2);
        shape([[bx-3.4,ferr],[bx+3.4,ferr],[bx+3.4,ferr-8],[bx-3.4,ferr-8]], '#565656', 1.2);
        const tc = TIPCOL[b.type];
        if (b.type === 'wash') shape([[bx-4.2,ferr-8],[bx+4.2,ferr-8],[bx+3,top],[bx-3,top]], tc, 1.2);
        else if (b.type === 'dry'){ for (let k=-2;k<=2;k++){ px2.beginPath(); px2.moveTo(bx+k*2.1, ferr-8); px2.lineTo(bx+k*3, top + prng()*4); px2.strokeStyle=tc; px2.lineWidth=1.4; px2.stroke(); } }
        else if (b.type === 'liner'){ px2.beginPath(); px2.moveTo(bx, ferr-8); px2.lineTo(bx, top); px2.strokeStyle=tc; px2.lineWidth=1.8; px2.stroke(); }
        else if (b.type === 'fan'){ for (let k=-3;k<=3;k++){ px2.beginPath(); px2.moveTo(bx, ferr-8); px2.lineTo(bx+k*1.5, top+prng()*2); px2.strokeStyle=tc; px2.lineWidth=1; px2.stroke(); } }
        else shape(defo(sPoly(bx, (ferr-8+top)/2, 4.6, 9), 1.1).concat([[bx, top]]), tc, 1.2);
      }

      function drawPalette(){
        px2.clearRect(0, 0, PW, PH);
        shape(palOutline, WOOD);
        px2.save(); px2.beginPath(); px2.moveTo(palOutline[0][0], palOutline[0][1]);
        for (const p of palOutline) px2.lineTo(p[0], p[1]); px2.closePath(); px2.clip();
        px2.fillStyle = WOODd; px2.fillRect(0, palC[1]+10, PW, PH); px2.restore();
        shape(palOutline, null);
        const thX = palC[0]+34, thY = palC[1]+22, thR = 21;
        px2.save();
        px2.beginPath(); px2.arc(thX, thY, thR, 0, TAU);
        px2.fillStyle = '#5d3f28'; px2.fill();
        px2.clip();
        const tg = px2.createLinearGradient(thX-thR, thY-thR, thX+thR, thY+thR);
        tg.addColorStop(0, 'rgba(12,7,3,.85)');
        tg.addColorStop(.55, 'rgba(12,7,3,.28)');
        tg.addColorStop(1, 'rgba(150,120,88,.35)');
        px2.fillStyle = tg;
        px2.fillRect(thX-thR, thY-thR, thR*2, thR*2);
        px2.restore();
        px2.beginPath(); px2.arc(thX, thY, thR, 0, TAU);
        px2.strokeStyle = OUT; px2.lineWidth = 3.4; px2.stroke();
        px2.beginPath(); px2.arc(thX, thY, thR - 2.4, 3.5, 5.9);
        px2.strokeStyle = 'rgba(255,248,228,.62)'; px2.lineWidth = 2.2; px2.stroke();
        px2.beginPath(); px2.arc(thX, thY, thR - 2.4, .5, 2.4);
        px2.strokeStyle = 'rgba(24,14,6,.55)'; px2.lineWidth = 2.2; px2.stroke();
        for (const w of wells){
          shape(w.pts, w.col);
          px2.beginPath(); px2.arc(w.c[0], w.c[1], 9, Math.PI*1.1, Math.PI*1.9); px2.strokeStyle='rgba(0,0,0,.28)'; px2.lineWidth=1.3; px2.stroke();
          if (w.col === selColor){ px2.beginPath(); px2.arc(w.c[0], w.c[1], 15.5, 0, TAU); px2.strokeStyle=OUT; px2.lineWidth=1.4; px2.stroke(); }
        }
        for (const b of brushes) drawBrush(b, b.type === TOOL.type);
        shape(jar, CREAM);
        px2.beginPath(); px2.moveTo(jarX-jarW*0.95, jarTop); px2.lineTo(jarX+jarW*0.95, jarTop); px2.strokeStyle=OUT; px2.lineWidth=LWID; px2.stroke();
        shape(bowl, CREAM);
        const wy = bowlTop + 30 - TOOL.water * 20;
        shape([[bowlX-bowlW*0.72, wy],[bowlX-bowlW*0.6, bowlTop+30],[bowlX+bowlW*0.6, bowlTop+30],[bowlX+bowlW*0.72, wy]], WATERC, 1.2);
        px2.beginPath(); px2.arc(bowlX, wy+7, 15, 0.15, Math.PI-0.15); px2.strokeStyle='rgba(90,110,140,.5)'; px2.lineWidth=1.2; px2.stroke();
        drawRag();
        drawSheet();
        if (SIGNS && (penMode === 'pen' || penMode === 'hook')) drawPen();
        drawHoverLabel();
      }

      function drawHoverLabel(){
        if (!hover || !hover.label) return;
        px2.save();
        px2.font = '600 9px "DM Sans", system-ui, sans-serif';
        px2.textAlign = 'center';
        px2.textBaseline = 'middle';
        const pad = 8, txt = hover.label.toUpperCase();
        const spaced = txt.split('').join('\u2009');
        const w = Math.min(PW - 16, px2.measureText(spaced).width + pad * 2);
        const h = 17;
        let cx2 = Math.max(w / 2 + 6, Math.min(PW - w / 2 - 6, hover.x));
        let cy2 = Math.max(h / 2 + 4, hover.y);
        px2.beginPath();
        px2.moveTo(cx2 - w / 2, cy2 - h / 2);
        px2.lineTo(cx2 + w / 2, cy2 - h / 2);
        px2.lineTo(cx2 + w / 2, cy2 + h / 2);
        px2.lineTo(cx2 - w / 2, cy2 + h / 2);
        px2.closePath();
        px2.fillStyle = 'rgba(250,245,232,.94)';
        px2.fill();
        px2.strokeStyle = 'rgba(16,18,24,.7)';
        px2.lineWidth = 1.1;
        px2.stroke();
        px2.fillStyle = 'rgba(24,30,44,.9)';
        px2.fillText(spaced, cx2, cy2 + .5);
        px2.restore();
      }

      function drawRag(){
        const spent = history.length > 0;
        px2.save();
        if (!spent) px2.globalAlpha = .5;
        const body = defo([[ragX-30, ragY+16],[ragX-22, ragY-10],[ragX+4, ragY-16],[ragX+30, ragY-4],
                           [ragX+24, ragY+16]], 2.2);
        shape(body, '#efe7db');
        const fold = defo([[ragX-18, ragY+4],[ragX+2, ragY-6],[ragX+22, ragY+2]], 1.6);
        px2.beginPath(); px2.moveTo(fold[0][0], fold[0][1]);
        for (let i=1;i<fold.length;i++) px2.lineTo(fold[i][0], fold[i][1]);
        px2.strokeStyle = 'rgba(0,0,0,.32)'; px2.lineWidth = 1.2; px2.stroke();
        if (spent){
          px2.beginPath();
          px2.ellipse(ragX+6, ragY+4, 9, 5, .3, 0, TAU);
          px2.fillStyle = 'rgba(90,104,128,.4)'; px2.fill();
        }
        px2.restore();
      }

      function drawPen(){
        const hook = penMode === 'hook';
        px2.save();
        if (hook){
          const hx = penX, hy = penY + 6;
          px2.beginPath();
          px2.moveTo(hx, hy - 22); px2.lineTo(hx - 13, hy - 6); px2.lineTo(hx + 13, hy - 6);
          px2.closePath();
          px2.fillStyle = '#8A8493'; px2.fill();
          px2.strokeStyle = OUT; px2.lineWidth = 1.6; px2.stroke();
          px2.beginPath(); px2.arc(hx, hy - 24, 3.4, 0, TAU);
          px2.fillStyle = '#5c6270'; px2.fill(); px2.stroke();
          shape(defo([[hx-24, hy-4],[hx+24, hy-4],[hx+24, hy+22],[hx-24, hy+22]], 1.5), '#f6efdd');
          px2.strokeStyle = OUT; px2.lineWidth = 1.8;
          px2.beginPath(); px2.rect(hx-17, hy+2, 34, 14); px2.stroke();
          px2.fillStyle = 'rgba(120,140,170,.45)';
          px2.fillRect(hx-16, hy+3, 32, 12);
        } else {
          px2.translate(penX, penY);
          px2.rotate(-0.42);
          shape(defo([[-6, -30],[6, -30],[5, 16],[0, 26],[-5, 16]], 1.2), '#2b3550');
          px2.beginPath();
          px2.moveTo(-5, 14); px2.lineTo(0, 26); px2.lineTo(5, 14);
          px2.closePath();
          px2.fillStyle = '#c9b98d'; px2.fill();
          px2.strokeStyle = OUT; px2.lineWidth = 1.2; px2.stroke();
          px2.beginPath(); px2.moveTo(0, 15); px2.lineTo(0, 25);
          px2.strokeStyle = 'rgba(20,24,34,.8)'; px2.lineWidth = 1; px2.stroke();
          px2.beginPath(); px2.rect(-6.5, -22, 13, 5);
          px2.fillStyle = '#8A8493'; px2.fill(); px2.stroke();
        }
        px2.restore();
      }

      function drawSheet(){
        const back = [[sheetX-26, sheetY-20],[sheetX+26, sheetY-20],[sheetX+26, sheetY+18],[sheetX-26, sheetY+18]];
        px2.save();
        px2.translate(3, 4);
        shape(back, '#efe6d4');
        px2.restore();
        shape(back, '#fbf6ea');
        px2.beginPath();
        px2.moveTo(sheetX+26, sheetY+18);
        px2.lineTo(sheetX+10, sheetY+18);
        px2.lineTo(sheetX+26, sheetY+2);
        px2.closePath();
        px2.fillStyle = '#e6dcc8'; px2.fill();
        px2.strokeStyle = OUT; px2.lineWidth = 1.2; px2.stroke();
      }

      function localPoint(e){
        const r = pcv.getBoundingClientRect();
        if (!r.width || !r.height) return null;
        return { mx:(e.clientX - r.left) * (PW / r.width), my:(e.clientY - r.top) * (PH / r.height) };
      }
      function hitTest(mx, my){
        for (const w of wells){
          if (inPoly(mx, my, w.pts) || Math.hypot(mx - w.c[0], my - w.c[1]) < 15)
            return { kind:'well', well:w, x:w.c[0], y:w.c[1] - 22, label:'a colour from her painting' };
        }
        if (my > 58 && my < jarBot){
          for (const b of brushes){
            if (Math.abs(mx - b.bx) < 8)
              return { kind:'brush', brush:b, x:b.bx, y:52, label:BRUSH_LABEL[b.type] };
          }
        }
        if (mx > bowlX-bowlW && mx < bowlX+bowlW && my > bowlTop-4 && my < bowlTop+38)
          return { kind:'water', x:bowlX, y:bowlTop - 16,
                   label:'water, ' + waterWord() };
        if (mx > ragX-32 && mx < ragX+32 && my > ragY-20 && my < ragY+20)
          return { kind:'rag', x:ragX, y:ragY - 26,
                   label:history.length ? 'lift the last wash' : 'nothing to lift yet' };
        if (mx > sheetX-28 && mx < sheetX+30 && my > sheetY-22 && my < sheetY+22)
          return { kind:'sheet', x:sheetX, y:sheetY - 28, label:'start the paper again' };
        if (SIGNS && penMode !== 'off' && mx > penX-30 && mx < penX+30
            && my > penY-40 && my < penY+34)
          return { kind:'pen', x:penX, y:penY - 42,
                   label: penMode === 'hook' ? 'hang it in the gallery' : 'sign the painting' };
        return null;
      }
      function waterWord(){
        return TOOL.water <= .35 ? 'barely damp'
             : TOOL.water <= .6  ? 'damp'
             : TOOL.water <= .85 ? 'wet' : 'flooded';
      }

      pcv.addEventListener('click', (e)=>{
        const pt = localPoint(e);
        if (!pt) return;
        const h = hitTest(pt.mx, pt.my);
        if (!h) return;
        if (h.kind === 'well'){ selColor = h.well.col; }
        else if (h.kind === 'brush'){ TOOL.type = h.brush.type; selBrush = SIZE_FOR[h.brush.type]; }
        else if (h.kind === 'water'){
          const steps = [0.3, 0.55, 0.8, 1.0];
          const idx = steps.findIndex(v=> Math.abs(v - TOOL.water) < 0.06);
          TOOL.water = steps[(idx + 1) % steps.length];
        }
        else if (h.kind === 'rag'){ undoStroke(); }
        else if (h.kind === 'sheet'){ clearSheet(); }
        else if (h.kind === 'pen'){ penAction(); }
        hover = hitTest(pt.mx, pt.my);
        drawPalette();
      });

      pcv.addEventListener('pointermove', (e)=>{
        const pt = localPoint(e);
        if (!pt) return;
        const h = hitTest(pt.mx, pt.my);
        const key = h ? h.kind + ':' + h.label : '';
        if (key === hoverKey) return;
        hoverKey = key;
        hover = h;
        pcv.style.cursor = h ? 'pointer' : 'default';
        drawPalette();
      });
      pcv.addEventListener('pointerleave', ()=>{
        if (!hoverKey) return;
        hoverKey = ''; hover = null; drawPalette();
      });

      const onKey = (e)=>{
        if (finished) return;
        const k = (e.key || '').toLowerCase();
        if ((e.metaKey || e.ctrlKey) && k === 'z'){ e.preventDefault(); undoStroke(); drawPalette(); }
      };
      window.addEventListener('keydown', onKey);
      p._tbKey = onKey;

      selBrush = SIZE_FOR[TOOL.type] !== undefined ? SIZE_FOR[TOOL.type] : selBrush;
      tbRedraw = drawPalette;
      drawPalette();
      if (voSeqDone && SIGNS) revealEasel();
    }
  });

  return {
    probe(){
      return { painting, coverage, covCells, covHit:covHit.size, dabs:dabCount,
               reachSide, unlocked:voUnlocked, mems:hooks.mems(), hold:NEEDS_HOLD,
               signing:hooks.signing(), sigMarks:hooks.sigMarks(), pen:hooks.pen(),
               memA:LUC.memA, memsReady:hooks.memsReady(),
               luc:meganState.lucidity, history:hooks.hist() };
    },
    sign(){ if (hooks.sign) hooks.sign(); },
    confirm(){ if (hooks.confirm) hooks.confirm(); },
    undo(){ if (hooks.undo) hooks.undo(); },
    clear(){ if (hooks.clear) hooks.clear(); },
    dispose(){
      finished = true;
      const wb = document.getElementById('watchBars');
      if (wb) wb.classList.remove('on');
      const nt = document.getElementById('studioNote');
      if (nt) nt.classList.remove('on');
      if (hooks.sigStop) hooks.sigStop();
      clearTimeout(hintT); clearTimeout(idleT); clearTimeout(holdT);
      if (inst._tbKey)  window.removeEventListener('keydown', inst._tbKey);
      if (_paletteFit){ window.removeEventListener('resize', _paletteFit); _paletteFit = null; }
      try { inst.remove(); } catch(e){}
    },
  };
}

function advance(from, to){ if (_current === from) goto(to); }
const SIG_CFG = {
  born: {
    prompt: 'sign here',
    hint: 'write your name on the line.',
    nib: 3.4, ink: 1, col: '#12151c',
  },
};

const AFTER_PAINT = {
  born:    ()=> advance('studio_born',    'fill_1'),
  breadth: ()=> advance('studio_breadth', 'fill_2'),
  calls:   ()=> advance('studio_calls',   'fill_3'),
  fall:    ()=> advance('studio_fall',    'ending'),
};

const VO_TIMELINES = {
  born: [
    { at:0.100, s:'Doctor',
      t:"I know this may be difficult to hear, but we'll talk through what this means and how we can support you moving forward." },

    { at:0.433, s:'Megan',
      t:'Today marks the official launch of Morry. Thank you to everyone who has supported us and believed in Morry from the very beginning.' },
    { at:0.600, s:'Hans', t:'Yes, Connor said the hall is quite nice for him.' },
    { at:0.733, s:'Megan', t:"That's great, let's just go ahead." },
    { at:0.867, s:'Hans', t:'You guys did a great job!' },
  ],
  breadth: [
    { at:0.083, s:'Hans', t:'Megan, listen! This is the last time I work with you!' },
    { at:0.233, s:'Megan', t:'This is my business, is not yours!' },
    { at:0.400, s:'Phone', t:'du du du…' },
    { at:0.533, s:'Hans', t:"What's a stubborn person!" },
    { at:0.667, s:'Megan', t:'Shut Up!' },
    { at:0.800, s:'Phone', t:"the number you've dial is not reachable" },
    { at:0.917, s:'Phone', t:'du du du…' },
  ],
  calls: [
    { at:0.083, s:'Phone', t:'du du du…' },
    { at:0.208, s:'Phone', t:"Sorry, you're not allowed to call this number." },
    { at:0.354, s:"Hans's friend", t:'He just passed away.' },
    { at:0.500, s:'Phone', t:'du du du…' },
    { at:0.625, s:'Megan', t:'Hans, can you tell me why?' },
    { at:0.750, s:'Phone', t:'please try again later.' },
    { at:0.875, s:'Doctor', t:'Megan, you should live with somebody else' },
    { at:0.958, s:'Hans', t:'Shut Up! I quit!' },
  ],
  fall: [
    { at:0.073, s:'Megan', t:'could you tell Hans?' },
    { at:0.182, s:'Phone', t:'du du du…' },
    { at:0.291, s:'Megan', t:'Hans, can you tell me why?' },
    { at:0.400, s:'Phone', t:'please try again later.' },
    { at:0.509, s:'Doctor', t:'I know this may be difficult to hear, but' },
    { at:0.618, s:'Hans', t:'Megan, listen!' },
    { at:0.727, s:'Phone', t:'du du du…' },
    { at:0.836, s:'Megan', t:'Shut Up!' },
  ],
};

function warpRef(g, p, amp, scale){
  const src = g.get();
  const T = 20, O = 3;
  g.clear();
  for (let y=0; y<g.height; y+=T){
    for (let x=0; x<g.width; x+=T){
      const qx = p.noise(x*scale, y*scale);
      const qy = p.noise(x*scale + 5.2, y*scale + 1.3);
      const dx = (p.noise(x*scale + 4*qx, y*scale + 4*qy) - .5) * amp * 2;
      const dy = (p.noise(x*scale + 4*qx + 9.7, y*scale + 4*qy + 3.1) - .5) * amp * 2;
      const sx = p.constrain(x + dx, 0, g.width  - T);
      const sy = p.constrain(y + dy, 0, g.height - T);
      g.image(src, x, y, T+O, T+O, sx, sy, T+O, T+O);
    }
  }
}

function damageRef(g, p, painting){
  warpRef(g, p, painting === 'calls' ? 26 : 12,
                painting === 'calls' ? .0075 : .0055);
  const x = g.drawingContext;
  if (!x) return;
  const n = painting === 'calls' ? 7 : 4;
  const j = streamFor('fade-' + painting);
  x.save();
  x.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < n; i++){
    const cx = j() * g.width, cy = j() * g.height;
    const r = 110 + j() * 190;
    const gr = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    gr.addColorStop(0, 'rgba(0,0,0,.5)');
    gr.addColorStop(.55, 'rgba(0,0,0,.28)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = gr;
    x.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  x.restore();
}

function buildMemories(p, painting){
  const defs = {
    born: [],
    breadth: [
      { key:'shatter', img:'mirror_shattered' },
      { key:'argue',   img:'flash_argue' },
      { key:'alone',   img:'flash_alone' },
    ],
    calls: [
      { key:'argue',   img:'flash_argue' },
      { key:'opening', img:'fill2_photo_launch' },
      { key:'hall',    img:'ending_stick' },
      { key:'torn',    img:'flash_torn' },
      { key:'bedside', img:'flash_bedside' },
    ],
    fall: [
      { key:'consult',    img:'flash_bedside' },
      { key:'graduation', img:'flash_graduation' },
      { key:'argue',      img:'flash_argue' },
      { key:'hall',       img:'ending_stick' },
      { key:'couple',     img:'flash_couple' },
      { key:'opening',    img:'fill2_photo_launch' },
      { key:'funeral',    img:'flash_funeral' },
    ],
  };
  const W = STUDIO_CFG.W, H = STUDIO_CFG.H;
  const jit = streamFor('mem-' + painting);
  const list = (defs[painting] || []).filter(d=> d.img && Img.file(d.img));
  const missing = (MEM_WANTED[painting] || []).filter(k=> !list.some(d=> d.key === k));
  if (missing.length)
    clog('[storyboard]', painting, 'memory layer is missing Emily assets for:', missing.join(', '));
  return list.map((d, i)=>{
    const g = p.createGraphics(W, H); g.pixelDensity(1);
    g.clear();
    const rec = { g, ready:false, key:d.key, i,
      phase: jit() * 6.283, w: .78 + jit() * .22 };
    const paint = ()=>{
      const el = Img.el(d.img);
      if (!el || !el.width) return false;
      try {
        g.clear();
        const b = fitBox(el.width, el.height, W, H);
        g.drawingContext.drawImage(el, b.x, b.y, b.w, b.h);
        linenWash(g, W, H);
        rec.ready = true;
        return true;
      } catch(e){ return false; }
    };
    if (!paint()){
      clog('[memory]', painting, d.key, 'waiting on', IMG_FILES[d.img]);
      Img.onArrive((key)=>{ if (key === d.img) paint(); });
    }
    return rec;
  });
}

function linenWash(g, W, H){
  const x = g.drawingContext;
  if (!x) return;
  try {
    x.save();
    x.globalCompositeOperation = 'color';
    x.fillStyle = 'rgba(138,132,147,.7)';
    x.fillRect(0, 0, W, H);
    x.globalCompositeOperation = 'source-atop';
    x.fillStyle = 'rgba(226,222,212,.14)';
    x.fillRect(0, 0, W, H);
    x.restore();
  } catch(e){}
}

const MEM_WANTED = {
  breadth: ['shatter','argue','alone'],
  calls:   ['argue','opening','hall','torn','bedside'],
  fall:    ['consult','graduation','argue','hall','couple','opening','funeral'],
};

const VO_MAX_MS = 240000;
const MEM_MODE = {
  breadth: { kind:'alternate' },
  calls:   { kind:'layered', flicker:true },
  fall:    { kind:'stacked', floor:.34 },
};

function paintPaper(g){
  g.clear();
  g.noStroke();
  for (let i=0;i<900;i++){
    g.fill(180+rnd()*40, 178+rnd()*40, 170+rnd()*40, 14);
    g.ellipse(rnd()*g.width, rnd()*g.height, 1.6, 1.6);
  }
}

function buildStudioRoom(host){
  const wrap = document.createElement('div');
  wrap.id = 'sWrap';
  const c = document.createElement('canvas');
  c.width = 1600; c.height = 900;
  c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
  const x = guardEllipses(c.getContext('2d'));
  const W = c.width, H = c.height, FLOOR = H * .74;
  const wall = x.createLinearGradient(0, 0, 0, FLOOR);
  wall.addColorStop(0, '#efe4c8');
  wall.addColorStop(.62, '#e8dcbc');
  wall.addColorStop(1, '#ded0ab');
  x.fillStyle = wall; x.fillRect(0, 0, W, FLOOR);
  const glow = x.createRadialGradient(W * .5, FLOOR * .42, 40, W * .5, FLOOR * .42, W * .62);
  glow.addColorStop(0, 'rgba(255,248,224,.5)');
  glow.addColorStop(1, 'rgba(255,248,224,0)');
  x.fillStyle = glow; x.fillRect(0, 0, W, FLOOR);
  const floor = x.createLinearGradient(0, FLOOR, 0, H);
  floor.addColorStop(0, '#9b6f4c');
  floor.addColorStop(1, '#7d5638');
  x.fillStyle = floor; x.fillRect(0, FLOOR, W, H - FLOOR);
  x.fillStyle = 'rgba(60,40,26,.5)';
  x.fillRect(0, FLOOR - 4, W, 5);
  x.strokeStyle = 'rgba(60,40,26,.10)';
  x.lineWidth = 2;
  for (let i = 1; i < 9; i++){
    const t = i / 9;
    x.beginPath();
    x.moveTo(W * t, FLOOR);
    x.lineTo(W * (t * 1.5 - .25), H);
    x.stroke();
  }
  grain(x, W, H, 5200, 'rgba(120,96,60,.045)');
  wrap.appendChild(c);
  const prog = meganState.paintingsDone.length / 4;
  wrap.style.filter = 'brightness(' + (1 - prog * .30) + ') saturate(' + (1 - prog * .34) + ')';
  host.insertBefore(wrap, host.firstChild);
  return wrap;
}

function buildEaselFrame(){
  const f = document.getElementById('easelFrame');
  const W = STUDIO_CFG.W;
  const room = Math.max(0, window.innerHeight - STUDIO_CFG.H - 150);
  const LEG = Math.max(96, Math.min(190, room));
  const H = STUDIO_CFG.H;
  f.style.width = (W+120)+'px'; f.style.height = (H+LEG)+'px';
  f.innerHTML =
    '<svg width="'+(W+120)+'" height="'+(H+LEG)+'" viewBox="0 0 '+(W+120)+' '+(H+LEG)+'">'
    + '<line x1="'+(60+W*.16)+'" y1="'+(H+6)+'" x2="'+(30)+'" y2="'+(H+LEG-10)+'" stroke="#4a3b2e" stroke-width="13" stroke-linecap="round"/>'
    + '<line x1="'+(60+W*.84)+'" y1="'+(H+6)+'" x2="'+(W+90)+'" y2="'+(H+LEG-10)+'" stroke="#4a3b2e" stroke-width="13" stroke-linecap="round"/>'
    + '<line x1="'+(60+W/2)+'" y1="'+(H+10)+'" x2="'+(60+W/2)+'" y2="'+(H+LEG-14)+'" stroke="#42352a" stroke-width="11" stroke-linecap="round"/>'
    + '<rect x="40" y="'+(H+8)+'" width="'+(W+40)+'" height="17" rx="5" fill="#57462f"/>'
    + '<rect x="'+(60+W/2-46)+'" y="-14" width="92" height="15" rx="5" fill="#57462f"/>'
    + '</svg>';
}

let G = null;

function enterGallery(mode, opts){
  const host = document.getElementById('galleryHost');
  host.style.display = 'block';
  if (!G){
    try { buildGallery(host); }
    catch(e){
      clog('[gallery] build failed:', e.message, e.stack || '');
      showFatal('The hall could not be built: ' + e.message);
      return;
    }
  }
  if (!G || !G.wrap){
    showFatal('The hall did not finish building. Please refresh.');
    return;
  }
  G.active = true;
  G.mode = mode;
  G.dollyT = performance.now();
  G.wrap.classList.remove('megan-push'); void G.wrap.offsetWidth;
  G.wrap.classList.add('megan-push');
  maybeDust();
  const fillN = (opts && opts.fillN) || null;
  if (!fillN && mode !== 'ending')
    Sound.loop('megan_gallery_ambience.wav','quiet hall reverb, distant sea underneath');
  if (mode === 'pickFall') scheduleHint('touch the lit frame.', 2500);
  try { syncFrames(); }
  catch(e){ clog('[gallery] syncFrames failed:', e.message, e.stack || ''); }
  clearInterval(G.repair);
  let tries = 0;
  G.repair = setInterval(()=>{
    if (!G || !G.active || ++tries > 10){ clearInterval(G.repair); G.repair = 0; return; }
    let all = true;
    [['gBack','gallery_back'], ['gMid','gallery_mid'], ['gFront','gallery_front']].forEach(([id, key])=>{
      const d = document.getElementById(id);
      if (!d || d.querySelector('img')) return;
      all = false;
      if (Img.ok(key)) swapLayer(d, key);
    });
    if (all){ clearInterval(G.repair); G.repair = 0; syncFrames(); }
  }, 500);
  try { gradeRoom(); }
  catch(e){ clog('[gallery] gradeRoom failed:', e.message); }
  if (mode === 'ending') G.wrap.classList.add('endingGlow');
  if (mode === 'fill'){
    try { startFill(opts.fillN); }
    catch(e){ clog('[gallery] startFill failed:', e.message, e.stack || ''); }
    scheduleHint('drag each object into the photograph it belongs to.', 2200, 'lowest');
  }
  renderLoop();
  clog('[gallery]', mode, 'ready with', G.FR ? G.FR.length : 0, 'frames');
}
function exitGallery(){
  stopEndingDrift();
  if (G && G.repair){ clearInterval(G.repair); G.repair = 0; }
  if (G && G.lastTimers){ G.lastTimers.forEach(clearTimeout); G.lastTimers = null; }
  Sound.stopHum();
  Sound.stopLoop('megan_gallery_ambience.wav');
  Sound.stopLoop('megan_fill3_ambience.wav');
  if (!G) return;
  cancelHint();
  G.active = false;
  const fl = document.getElementById('fillLayer');
  if (fl) fl.style.display = 'none';
  document.getElementById('galleryHost').style.display = 'none';
}

const GALLERY_HOLD = {
  gBack:  'linear-gradient(180deg,#c3d6e4 0%,#a9c2d4 62%,#93aec4 100%)',
  gMid:   'transparent',
  gFront: 'transparent',
};
function buildGallery(host){
  const wrap = document.createElement('div');
  wrap.id = 'gWrap';
  host.appendChild(wrap);

  const back  = layerDiv('gBack',  'gallery_back',  texGalleryBack);
  const mid   = layerDiv('gMid',   'gallery_mid',   texGalleryMid);
  const front = layerDiv('gFront', 'gallery_front', texGalleryFront);
  wrap.append(back, mid, front);

  const FR = [
    { id:'born',    x:20, frame:'frame_1' }, { id:'breadth', x:40, frame:'frame_2' },
    { id:'calls',   x:60, frame:'frame_3' }, { id:'fall',    x:80, frame:'frame_4' },
  ].map(f=>{
    const el = document.createElement('div');
    el.className = 'gframe';
    el.style.left = f.x + '%';
    el.dataset.id = f.id;
    el.dataset.frame = f.frame;
    const cnv = document.createElement('canvas');
    cnv.width = 308; cnv.height = 178;
    el.appendChild(cnv);
    const hang = document.createElement('div');
    hang.className = 'hang';
    hang.innerHTML = '<b></b>';
    el.appendChild(hang);
    el.addEventListener('click', ()=>{
      if (!G.active || (G.mode !== 'entry' && G.mode !== 'pickFall')) return;
      if (G.mode === 'entry' && SCENES.gallery_entry._lockFrames){
        scheduleHint('the doctor is still speaking.', 0);
        return;
      }
      const want = nextUnpainted();
      if (!want) return;
      if (f.id !== want){ scheduleHint('not that one. the lit frame is waiting.', 0); return; }
      onFramePicked(want);
    });
    mid.appendChild(el);
    return el;
  });

  const gLight = document.createElement('div');
  gLight.id = 'galleryLight';
  gLight.style.cssText = 'position:absolute;left:0;top:0;width:520px;height:520px;margin:-260px 0 0 -260px;pointer-events:none;z-index:2;opacity:0;transition:opacity 1.4s ease;background:radial-gradient(circle,rgba(255,248,230,.14),rgba(255,248,230,.04) 42%,transparent 70%)';
  wrap.appendChild(gLight);
  wrap.addEventListener('pointermove', (e)=>{
    const r = wrap.getBoundingClientRect();
    gLight.style.transform = 'translate(' + (e.clientX - r.left) + 'px,' + (e.clientY - r.top) + 'px)';
    gLight.style.opacity = '1';
    for (const fr of FR){
      const fb = fr.getBoundingClientRect();
      const near = Math.hypot(e.clientX - (fb.left+fb.width/2), e.clientY - (fb.top+fb.height/2)) < 230;
      fr.style.boxShadow = near ? '0 10px 26px rgba(10,18,34,.35),0 0 42px rgba(255,248,230,.4)' : '';
    }
  });

  const fillLayer = document.createElement('div');
  fillLayer.id = 'fillLayer';
  host.appendChild(fillLayer);

  let px = 0, py = 0, cx = 0, cy = 0, mx = 0, my = 0;
  const onMove = (e)=>{
    px = e.clientX/innerWidth*2 - 1;
    py = e.clientY/innerHeight*2 - 1;
    mx = e.clientX; my = e.clientY;
  };
  addEventListener('pointermove', onMove);

  if (meganState.paintingsDone.indexOf('calls') > -1 && Img.ok('flash_lastphoto')){
    const ph = document.createElement('div');
    ph.id = 'lastPhoto';
    ph.style.cssText = 'position:absolute;left:9%;top:56%;width:108px;z-index:6;transform:rotate(-3deg);'
      + 'padding:7px 7px 20px;background:#f2ece0;box-shadow:0 8px 22px rgba(10,18,34,.34);opacity:0;'
      + 'transition:opacity 2.4s ease';
    ph.innerHTML = '<img src="' + Img.url('flash_lastphoto') + '" alt="" style="width:100%;display:block">';
    wrap.appendChild(ph);
    const gl = document.createElement('div');
    gl.style.cssText = 'position:absolute;left:6%;top:50%;width:190px;height:190px;z-index:5;pointer-events:none;'
      + 'background:radial-gradient(circle,rgba(255,246,224,.16),transparent 70%)';
    wrap.appendChild(gl);
    requestAnimationFrame(()=>{ ph.style.opacity = '1'; });
  }
  G = { wrap, back, mid, front, FR, fillLayer, active:false, mode:'entry', onMove,
        _p:()=>[px,py], _c:()=>[cx,cy], _m:()=>[mx,my], _setC:(x,y)=>{ cx=x; cy=y; } };

  applyFrameAspect();

  function layerDiv(id, imgKey, texFn){
    const d = document.createElement('div');
    d.className = 'glayer'; d.id = id;
    if (Img.ok(imgKey)){ d.appendChild(imgEl(imgKey)); return d; }
    d.style.background = GALLERY_HOLD[id] || '#a9c2d4';
    let filled = false;
    const fill = (k)=>{
      if (filled || k !== imgKey || !Img.ok(imgKey)) return;
      filled = true;
      swapLayer(d, imgKey);
    };
    Img.onArrive(fill);
    [200, 600, 1200, 2400, 4000, 6000].forEach(t=> setTimeout(()=> fill(imgKey), t));
    return d;
  }
}

function imgEl(key){
  const im = document.createElement('img');
  im.src = Img.url(key); im.alt = '';
  return im;
}
function swapLayer(div, key){
  if (!div || !Img.ok(key)) return;
  div.style.background = '';
  let old = null;
  for (const ch of div.children){
    const t = ch.tagName;
    if (t === 'IMG' || t === 'CANVAS'){ old = ch; break; }
  }
  const im = imgEl(key);
  if (old) div.replaceChild(im, old);
  else div.insertBefore(im, div.firstChild);
}
Img.onArrive((key)=>{
  if (key === 'studio_back' || key === 'studio_mid' || key === 'studio_front'){
    const d = document.getElementById('s_' + key.slice(7));
    if (d && Img.ok(key)){ d.innerHTML = ''; d.appendChild(imgEl(key)); }
  }
  if (!G) return;
  if (key === 'gallery_back'  && G.back)  swapLayer(G.back, key);
  if (key === 'gallery_mid'   && G.mid)   swapLayer(G.mid, key);
  if (key === 'gallery_front' && G.front) swapLayer(G.front, key);
});

function dreamNoise(t){ return .5 + .5*(Math.sin(t)*.6 + Math.sin(t*1.7+1.3)*.3 + Math.sin(t*2.9+2.1)*.1); }
function renderLoop(){
  if (!G || !G.active) return;
  requestAnimationFrame(renderLoop);
  try {
  const [px, py] = G._p();
  const [cx, cy] = G._c();
  const decay = Math.min(1, meganState.paintingsDone.length / 4);
  const follow = .05 * (1 - decay * .72);
  const nx = cx + (px-cx)*follow, ny = cy + (py-cy)*follow;
  G._setC(nx, ny);
  let d = 1;
  if (G.dollyT){
    const t = Math.min(1, (performance.now() - G.dollyT) / 2200);
    d = 1 - Math.pow(1 - t, 3);
    if (t >= 1) G.dollyT = 0;
  }
  const gwt = performance.now() * .00013;
  const gdx = (dreamNoise(gwt) - .5) * decay * 30, gdy = (dreamNoise(gwt + 9) - .5) * decay * 18;
  G.back.style.transform  = 'translate('+(-nx*10*d + gdx*.4)+'px,'+(-ny*4*d + gdy*.4)+'px) scale(1.04)';
  G.mid.style.transform   = 'translate('+(-nx*26*d + gdx*.7)+'px,'+(-ny*10*d + gdy*.7)+'px) scale(1.02)';
  G.front.style.transform = 'translate('+(-nx*48*d + gdx)+'px,'+(-ny*16*d + gdy)+'px) scale(1.03)';
  drawDust();
  } catch(e){
    if (!renderLoop._told){ renderLoop._told = true; clog('[gallery] render stopped:', e.message); }
  }
}

function laidAverage(){
  let r=0, g=0, b=0, n=0;
  for (const k of meganState.paintingsDone){
    const c = meganState.laid[k];
    if (c && c.n){ r += c.r/c.n; g += c.g/c.n; b += c.b/c.n; n++; }
  }
  return n ? { r:r/n, g:g/n, b:b/n } : null;
}

function gradeRoom(){
  const prog = meganState.paintingsDone.length / 4;
  const cols = ['#aec6d8', '#8fa6be', '#5c6d88', '#232c44'];
  const host = document.getElementById('galleryHost');
  host.style.background = cols[Math.min(3, Math.floor(prog*3.999))];
  G.wrap.style.filter = 'brightness(' + (1 - prog*.55) + ')';

  const laid = laidAverage();
  let wash = document.getElementById('gWash');
  if (!laid){ if (wash) wash.remove(); return; }
  if (!wash){
    wash = document.createElement('div');
    wash.id = 'gWash';
    G.wrap.appendChild(wash);
  }
  wash.style.background = 'rgb(' + Math.round(laid.r) + ',' + Math.round(laid.g) + ',' + Math.round(laid.b) + ')';
  wash.style.opacity = (0.06 + prog * 0.20).toFixed(3);
}

const FRAME_ORDER = ['born','breadth','calls','fall'];
function nextUnpainted(){
  if (!G || G.mode === 'ending') return null;
  if (G.mode === 'pickFall' && !G.fallReady) return null;
  for (const id of FRAME_ORDER)
    if (!meganState.paintingsDone.includes(id)) return id;
  return null;
}
const USER_ART_ON = true;
const userArtCache = {};
function userArt(id){
  if (!USER_ART_ON) return null;
  const hit = userArtCache[id];
  if (hit === false) return null;
  if (hit) return (hit.complete && hit.naturalWidth > 0) ? hit : null;
  let data = null;
  try { data = sessionStorage.getItem('megan_painting_' + id); } catch(e){ data = null; }
  if (!data) return null;
  const im = new Image();
  userArtCache[id] = im;
  im.onload = ()=>{ try { if (G && G.active) syncFrames(); } catch(e){} };
  im.onerror = ()=>{ userArtCache[id] = false; };
  im.src = data;
  return (im.complete && im.naturalWidth > 0) ? im : null;
}
function syncFrames(){
  if (!G || !G.FR) return;
  const want = nextUnpainted();
  for (const el of G.FR){
    const id = el.dataset.id;
    const lit = want !== null && id === want;
    const done = meganState.paintingsDone.includes(id);
    const art = done ? (userArt(id) || Img.el('aw_' + id)) : null;
    drawFrame(el.querySelector('canvas'), art, lit, G.mode === 'ending', el.dataset.frame);
    el.classList.toggle('empty', !done);
    el.classList.toggle('hung', done);
    el.classList.toggle('want', lit);
  }
}
function applyFrameAspect(){
  if (!G || !G.FR) return false;
  for (const el of G.FR){
    const cnv = el.querySelector('canvas');
    if (cnv.width !== 308 || cnv.height !== 178){ cnv.width = 308; cnv.height = 178; }
  }
  if (G.active) syncFrames();
  return false;
}
function drawFrame(c, thumb, highlight, glow, frameKey){
  const x = guardEllipses(c.getContext('2d'));
  const W = c.width, H = c.height;
  const frameImg = Img.el(frameKey || 'frame_1');
  const mx = Math.round(W * .041), my = Math.round(H * .055);
  const aw = W - mx*2, ah = H - my*2;
  x.clearRect(0, 0, W, H);
  x.fillStyle = glow ? '#2e3a58' : highlight ? '#33405f' : '#26334d';
  x.fillRect(mx, my, aw, ah);
  if (highlight && !thumb){
    const g = x.createRadialGradient(W*.5, H*.5, 2, W*.5, H*.5, Math.max(aw, ah)*.62);
    g.addColorStop(0, 'rgba(255,246,222,.3)');
    g.addColorStop(1, 'rgba(255,246,222,0)');
    x.fillStyle = g;
    x.fillRect(mx, my, aw, ah);
  }
  const usable = thumb && ((thumb.naturalWidth || thumb.width) > 0);
  if (glow) clog('[frame]', 'draw', usable ? 'with painting' : 'EMPTY',
                 thumb ? (thumb.naturalWidth || thumb.width) + 'px' : 'no thumb');
  if (usable){
    const tw = thumb.naturalWidth || thumb.width;
    const th = thumb.naturalHeight || thumb.height;
    x.fillStyle = '#F3EEE2';
    x.fillRect(mx, my, aw, ah);
    const k = Math.max(aw/tw, ah/th);
    const dw = tw*k, dh = th*k;
    x.save();
    x.beginPath(); x.rect(mx, my, aw, ah); x.clip();
    x.drawImage(thumb, mx + (aw-dw)/2, my + (ah-dh)/2, dw, dh);
    x.restore();
    if (glow){ x.fillStyle='rgba(255,246,222,.10)'; x.fillRect(mx, my, aw, ah); }
  } else {
    const g2 = x.createRadialGradient(W*.5, H*.5, 2, W*.5, H*.5, Math.max(aw, ah)*.66);
    g2.addColorStop(0, highlight ? 'rgba(255,246,222,.36)' : 'rgba(226,238,255,.20)');
    g2.addColorStop(1, 'rgba(255,246,222,0)');
    x.fillStyle = g2;
    x.fillRect(mx, my, aw, ah);
    x.strokeStyle = highlight ? 'rgba(255,246,222,.92)' : 'rgba(226,238,255,.55)';
    x.lineWidth = highlight ? 3.5 : 2;
    x.strokeRect(mx + aw*.03, my + aw*.03, aw - aw*.06, ah - aw*.06);
  }
  if (frameImg) x.drawImage(frameImg, 0, 0, W, H);
}

function onFramePicked(id){
  cancelHint();
  turnPage(()=> goto(id === 'born' ? 'graduation' : 'studio_' + id), [206, 216, 234]);
}

const fillConfig = {
  fill1: {
    elements: [ ['whale','fill1_whale'], ['podium','fill1_podium'],
                ['cap','fill1_cap'],     ['trophy','fill1_trophy'] ],
    photos:   [ ['cap','fill1_photo_nocap'], ['trophy','fill1_photo_notrophy'],
                ['podium','fill1_photo_nopodium'] ],
    onDone: 'glass',
  },
  fill2: {
    elements: [ ['streamers','fill2_streamers'], ['oceanpainting','fill2_oceanpainting'] ],
    photos:   [ ['streamers','fill2_photo_launch'], ['oceanpainting','fill2_photo_brushes'] ],
    onDone: 'dualBranch',
  },
  fill3: {
    elements: [ ['lastphoto','flash_lastphoto'] ],
    photos:   [ ['lastphoto', 'flash_lastphoto'] ],
    dropped: true,
    onDone: 'revealFall',
  },
};

const ELEMENT_POS = {
  whale: { left:'76%', top:'8%', hangs:true },
};

const SLOT_DROP = {
  cap:           { x:.50, y:.24, w:.52 },
  trophy:        { x:.50, y:.44, w:.26 },
  podium:        { x:.50, y:.72, w:.50 },
  streamers:     { x:.50, y:.26, w:.70 },
  oceanpainting: { x:.68, y:.46, w:.40 },
  lastphoto:     { x:.50, y:.50, w:.74 },
};

function startFill(fillN){
  const cfg = fillConfig[fillN];
  if (fillN === 'fill3') Sound.loop('megan_fill3_ambience.wav', 'fill 3 ambience');
  meganState.fill[fillN] = { placed:[], done:false };
  const L = G.fillLayer;
  L.style.display = 'block';
  L.innerHTML = '<div class="fillShelf"></div>';

  const slots = cfg.photos.map((ph, i)=>{
    const el = document.createElement('div');
    el.className = 'photoSlot';
    el.style.left = (18 + i*24) + '%';
    el.style.top  = (i%2 ? 58 : 14) + '%';
    el.dataset.slot = ph[0];
    el.dataset.img  = ph[1] || '';
    const cnv = document.createElement('canvas'); cnv.width=260; cnv.height=192;
    el.appendChild(cnv);
    drawPhoto(cnv, ph[0], cfg.dropped ? null : ph[1], false);
    L.appendChild(el);
    return el;
  });

  if (cfg.dropped){
    scheduleHint('their last photograph is lying on the floor.', 2600);
  } else {
    scheduleHint('drag each piece into its photograph.', 6000);
  }
  cfg.elements.forEach((em, i)=>{
    const el = document.createElement('div');
    el.className = 'memElement';
    const P = ELEMENT_POS[em[0]];
    if (P){
      el.style.left = P.left; el.style.top = P.top;
      if (P.hangs) el.classList.add('hangs');
    } else if (cfg.dropped){
      el.classList.add('dropped');
      el.style.left = '17%';
      el.style.bottom = '9%';
      el.style.setProperty('--tilt', '-22deg');
    } else {
      el.style.left = (14 + i*20) + '%';
      el.style.bottom = (3 + (i%2)*4) + '%';
    }
    el.dataset.type = em[0];
    el.dataset.img  = em[1] || '';
    el.dataset.asset = Img.file(em[1]) || '(code-drawn)';
    if (Img.ok(em[1])) el.innerHTML = '<img src="' + Img.url(em[1]) + '" alt="">';
    else               el.innerHTML = elementSVG(em[0]);
    L.appendChild(el);
    dragElement(el, slots, fillN, cfg);
  });
}

function hesitateReturn(el, toX, toY){
  const fromX = parseFloat(el.style.left);
  const fromY = parseFloat(el.style.top);
  const x0 = isNaN(fromX) ? toX : fromX, y0 = isNaN(fromY) ? toY : fromY;
  el.style.transition = 'none';
  const arc = Math.min(64, Math.abs(y0 - toY) * .35 + 26), dur = 640;
  setTimeout(()=>{
    const t0 = performance.now();
    (function step(now){
      let p = (now - t0) / dur; if (p > 1) p = 1;
      const e = 1 - Math.pow(1 - p, 3);
      el.style.left = (x0 + (toX - x0) * e) + 'px';
      el.style.top  = (y0 + (toY - y0) * e - arc * Math.sin(Math.PI * p)) + 'px';
      if (p < 1) requestAnimationFrame(step);
      else { el.style.left = toX + 'px'; el.style.top = toY + 'px'; }
    })(performance.now());
  }, 200);
}
function dragElement(el, slots, fillN, cfg){
  el.addEventListener('pointerdown', (e)=>{
    e.preventDefault();
    const startX = e.clientX, startY = e.clientY;
    const r = el.getBoundingClientRect();
    try { el.setPointerCapture(e.pointerId); } catch(err){}
    el.style.transition = 'none'; el.style.zIndex = 40;
    const target = slots.find(s=> s.dataset.slot === el.dataset.type && !s.classList.contains('done'));
    const move = (ev)=>{
      el.style.left = (r.left + ev.clientX-startX) + 'px';
      el.style.top  = (r.top  + ev.clientY-startY) + 'px';
      el.style.bottom = 'auto';
      if (target){
        const b = target.getBoundingClientRect();
        const dist = Math.hypot(ev.clientX-(b.left+b.right)/2, ev.clientY-(b.top+b.bottom)/2);
        const near = Math.max(0, Math.min(1, 1 - dist/320));
        target.style.boxShadow = near > .1 ? '0 0 '+(near*42).toFixed(0)+'px rgba(255,244,214,'+(near*.6).toFixed(2)+')' : '';
      }
    };
    const up = (ev)=>{
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      if (target) target.style.boxShadow = '';
      const hit = slots.find(s=>{
        if (s.classList.contains('done')) return false;
        const b = s.getBoundingClientRect();
        return ev.clientX>b.left && ev.clientX<b.right && ev.clientY>b.top && ev.clientY<b.bottom;
      });
      if (hit && hit.dataset.slot === el.dataset.type){
        cancelHint();
        hit.classList.add('done');
        drawPhoto(hit.querySelector('canvas'), hit.dataset.slot,
                  hit.dataset.img || null, true, el.dataset.img || null);
        el.classList.add('gone');
        Sound.play('megan_'+fillN+'_applause.wav','applause and cheer, this memory has found its place');
        meganState.fill[fillN].placed.push(el.dataset.type);
        if (fillN === 'fill2') meganState.fill2Order.push(el.dataset.type);
        if (slots.every(s=> s.classList.contains('done'))) fillDone(fillN, cfg);
      } else {
        hesitateReturn(el, r.left, r.top);
      }
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  });
}

function fillDone(fillN, cfg){
  meganState.fill[fillN].done = true;
  if (cfg.onDone !== 'revealFall') Sound.fadeOutLoop('megan_gallery_ambience.wav', 2200);
  settleFilledHall();
  setTimeout(()=>{
    if (cfg.onDone === 'glass')       glassTransition(()=> goto('studio_breadth'));
    else if (cfg.onDone === 'dualBranch') runFill2Branch();
    else if (cfg.onDone === 'revealFall') revealFallFrame();
  }, 1500);
}

function settleFilledHall(){
  if (!G || !G.wrap) return;
  const L = G.fillLayer;
  if (L){
    L.querySelectorAll('.memElement').forEach(el=>{
      el.style.transition = 'opacity .8s ease';
      el.style.opacity = '0';
    });
    L.querySelectorAll('.photoSlot').forEach((el, i)=>{
      el.style.transition = 'box-shadow 1.1s ease, transform 1.1s ease';
      setTimeout(()=>{
        el.style.boxShadow = '0 10px 26px rgba(4,8,18,.5), 0 0 30px rgba(255,246,222,.34)';
        el.style.transform = 'scale(1.03)';
      }, 120 + i*180);
      setTimeout(()=>{
        el.style.boxShadow = '0 8px 22px rgba(4,8,18,.5)';
        el.style.transform = 'scale(1)';
      }, 900 + i*180);
    });
  }
  const lift = document.createElement('div');
  lift.className = 'hallLift';
  G.wrap.appendChild(lift);
  requestAnimationFrame(()=> lift.classList.add('on'));
  setTimeout(()=> lift.classList.remove('on'), 1400);
  setTimeout(()=>{ if (lift.parentNode) lift.remove(); }, 3000);
}

function runFill2Branch(){
  const first = meganState.fill2Order[0];
  if (first === 'streamers'){
    Sound.play('megan_fill2_wave.wav','one great wave swells and breaks, carries us to the pod');
    surgeAway(()=> goto('studio_calls', { intro:'bigwave_pod' }));
  } else {
    Sound.play('megan_fill2_pop.wav','pop, streamers burst and scatter');
    scatterStreamers(()=> goto('studio_calls', { intro:'reveal' }));
  }
}
function surgeAway(cb){
  const L = G && G.fillLayer;
  if (!L){ cb && cb(); return; }
  const bits = [];
  for (let i = 0; i < 16; i++){
    const b = document.createElement('div');
    b.className = 'streamBit surge';
    b.style.left = (10 + rnd() * 80) + '%';
    b.style.top  = (18 + rnd() * 64) + '%';
    b.style.setProperty('--dx', ((rnd() - .5) * 260).toFixed(0) + 'px');
    b.style.setProperty('--dy', (-160 - rnd() * 260).toFixed(0) + 'px');
    b.style.setProperty('--rot', ((rnd() - .5) * 900).toFixed(0) + 'deg');
    b.style.animationDelay = (rnd() * .45).toFixed(2) + 's';
    b.innerHTML = Img.ok('fill2_streamers')
      ? '<img src="' + Img.url('fill2_streamers') + '" alt="">'
      : '<svg viewBox="0 0 40 40"><path d="M6 34 Q14 10 22 22 T36 8" fill="none" stroke="#8A8493" stroke-width="4" stroke-linecap="round"/></svg>';
    L.appendChild(b);
    bits.push(b);
  }
  L.querySelectorAll('.photoSlot, .memElement, .fillShelf').forEach(el=>{
    el.style.transition = 'transform 1.5s cubic-bezier(.3,0,.2,1), opacity 1.5s ease';
    el.style.transform = 'translateY(-42vh) rotate(' + ((rnd()-.5)*30).toFixed(0) + 'deg)';
    el.style.opacity = '0';
  });
  sinkThrough(()=>{ bits.forEach(b=> b.remove()); cb && cb(); });
}

function scatterStreamers(cb){
  const L = G.fillLayer;
  L.querySelectorAll('.photoSlot, .memElement, .fillShelf').forEach(el=>{
    el.style.transition = 'opacity .7s ease';
    el.style.opacity = '.25';
  });
  scheduleHint('pick the streamers up off the floor.', 1400);
  const N = 11;
  let left = N;
  for (let i=0;i<N;i++){
    const b = document.createElement('div');
    b.className = 'streamBit';
    const ring = i / N * 6.283 + rnd() * .4;
    b.style.left = (50 + Math.cos(ring) * (26 + rnd()*14)) + '%';
    b.style.top  = (48 + Math.sin(ring) * (24 + rnd()*16)) + '%';
    b.style.transform = 'rotate(' + ((rnd()-.5)*70).toFixed(1) + 'deg)';
    b.innerHTML = Img.ok('fill2_streamers')
      ? '<img src="'+Img.url('fill2_streamers')+'" alt="">'
      : '<svg viewBox="0 0 40 40"><path d="M6 34 Q14 10 22 22 T36 8" fill="none" stroke="#8A8493" stroke-width="4" stroke-linecap="round"/></svg>';
    b.onclick = ()=>{ b.remove(); cancelHint();
      Sound.play('megan_fill2_pickup.wav','picking the streamers up off the floor');
      if (--left === 0) developPod(cb); };
    L.appendChild(b);
  }
}

function developPod(cb){
  const host = document.getElementById('galleryHost');
  if (!host || !Img.ok('aw_calls')){ cb && cb(); return; }
  const L = G && G.fillLayer;
  if (L) L.querySelectorAll('.photoSlot, .memElement, .fillShelf').forEach(el=>{
    el.style.transition = 'opacity 1.1s ease';
    el.style.opacity = '0';
  });
  const ov = document.createElement('div');
  ov.id = 'podReveal';
  const c = document.createElement('canvas');
  c.width = 1280; c.height = 720;
  ov.appendChild(c);
  host.appendChild(ov);
  const x = guardEllipses(c.getContext('2d'));
  const el = Img.el('aw_calls');
  const W = c.width, H = c.height;
  const b = fitBox(el.width, el.height, W, H);
  const T0 = performance.now(), RISE = 3400, HOLD = 1500;
  requestAnimationFrame(()=> ov.classList.add('on'));
  let handed = false;
  (function frame(){
    const e = performance.now() - T0;
    const k = Math.min(1, e / RISE);
    const ease = 1 - Math.pow(1 - k, 2.4);
    x.clearRect(0, 0, W, H);
    const sea = x.createLinearGradient(0, 0, 0, H);
    sea.addColorStop(0, 'rgb(196,214,228)');
    sea.addColorStop(1, 'rgb(150,176,198)');
    x.fillStyle = sea;
    x.fillRect(0, 0, W, H);
    x.save();
    x.globalAlpha = ease;
    x.filter = 'blur(' + ((1 - ease) * 16).toFixed(1) + 'px)';
    x.drawImage(el, b.x, b.y, b.w, b.h);
    x.restore();
    x.globalAlpha = (1 - ease) * .5;
    x.fillStyle = 'rgb(206,220,232)';
    x.fillRect(0, 0, W, H);
    x.globalAlpha = 1;
    if (!handed && e >= RISE + HOLD){
      handed = true;
      cb && cb();
      requestAnimationFrame(()=>{
        ov.classList.remove('on');
        setTimeout(()=>{ if (ov.parentNode) ov.remove(); }, 1100);
      });
      return;
    }
    requestAnimationFrame(frame);
  })();
}

const ENDING_LINE = {
  file: 'megan_ending_phone.wav',
  speaker: 'Phone',
  line: 'Sorry, you are not allowed to call this number.',
};

const LAST_VOICES = [
  ['megan_last_goahead.wav',   'Megan',          "That's great, let's just go ahead.", 1400],
  ['megan_last_stubborn.wav',  'Hans',           "What's a stubborn person!",          4200],
  ['megan_last_why.wav',       'Megan',          'Hans, can you tell me why?',         4400],
  ['megan_last_passedaway.wav', "Hans's friend", 'He just passed away.',               5200],
];

function revealFallFrame(){
  G.mode = 'pickFall';
  G.fillLayer.style.display = 'none';
  G.lastTimers = [];
  let at = 0;
  LAST_VOICES.forEach(([file, who, line, gap])=>{
    at += gap;
    G.lastTimers.push(setTimeout(()=>{
      if (!G || G.mode !== 'pickFall') return;
      Sound.vo(file, who, line);
    }, at));
  });
  G.lastTimers.push(setTimeout(()=>{
    if (!G || G.mode !== 'pickFall') return;
    G.fallReady = true;
    syncFrames();
    scheduleHint('the last frame is waiting.', 900);
  }, at + 4200));
  syncFrames();
}

const FLAT2 = {
  NAVY:'#1B2A4A', BLUE2:'#35516E', SLATE:'#6C7D8E', SLATE2:'#7A8C9E',
  CREAM:'#F4EEE5', SUN:'#E8D8A8', AMBER:'#E4B272', SAND:'#B5AEA4',
  VIOLET:'#8A8493', LINE:'#101218', LW:1.5,

  _col(c){ return Array.isArray(c) ? 'rgb('+c[0]+','+c[1]+','+c[2]+')' : c; },
  _stroke(x, lw){
    if (lw === 0) return false;
    x.strokeStyle = this.LINE; x.lineWidth = lw || this.LW; return true;
  },
  box(bx, by, bw, bh){
    return [{x:bx,y:by},{x:bx+bw,y:by},{x:bx+bw,y:by+bh},{x:bx,y:by+bh}];
  },
  wash(x, pts, col, alpha, layers, mag, lw){
    x.beginPath();
    x.moveTo(pts[0].x, pts[0].y);
    for (let i=1;i<pts.length;i++) x.lineTo(pts[i].x, pts[i].y);
    x.closePath();
    x.fillStyle = this._col(col); x.fill();
    if (this._stroke(x, lw)) x.stroke();
  },
  band(x, bx, by, bw, bh, col, alpha, layers, lw){
    this.wash(x, this.box(bx, by, bw, bh), col, alpha, 0, 0, lw);
  },
  blob(x, cx, cy, rx, ry, col, alpha, layers, lw){
    x.beginPath(); x.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), 0, 0, 7);
    x.fillStyle = this._col(col); x.fill();
    if (this._stroke(x, lw)) x.stroke();
  },
  line(x, x1, y1, x2, y2, col, alpha, wt){
    x.strokeStyle = this.LINE; x.lineWidth = wt || this.LW;
    x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke();
  },
  fig(x, cx, base, h, col, alpha){
    const w = h*.3;
    this.wash(x, [ {x:cx-w*.54,y:base}, {x:cx-w*.48,y:base-h*.42},
                   {x:cx,y:base-h*.70}, {x:cx+w*.48,y:base-h*.42},
                   {x:cx+w*.54,y:base} ], col, alpha, 0, 0, 1.3);
    this.blob(x, cx, base-h*.82, h*.115, h*.12, col, alpha, 0, 1.3);
  },
  grain(x, W, H, n, alpha){
    x.fillStyle = 'rgba(255,255,255,.05)';
    for (let i=0;i<n;i++) x.fillRect(rnd()*W, rnd()*H, 1.5, 1.5);
  },
};

function paintWardFrame(x, done){
  const W = 130, H = 96, F = FLAT2;
  F.band(x, -2, -2, W+4, H+4, F.CREAM, 1, 0, 0);
  F.band(x, -2, -2, W+4, H*.62, F.SUN, 1, 0, 0);
  F.band(x, W*.05, H*.06, W*.4, H*.42, F.BLUE2, 1, 0, 1.3);
  for (let k=1;k<5;k++)
    F.line(x, W*.05, H*.06+k*H*.084, W*.45, H*.06+k*H*.084, 0, 1, 1.1);
  F.band(x, -2, H*.62, W+4, H*.44, F.SAND, 1, 0, 1.3);
  F.blob(x, W*.88, H*.55, W*.05, H*.09, F.VIOLET, 1, 0, 1.2);
  x.save();
  x.translate(W*.46, H*.42); x.rotate(-.05);
  F.band(x, -W*.24, -H*.28, W*.48, H*.56, F.CREAM, 1, 0, 1.5);
  F.band(x, -W*.19, -H*.22, W*.38, H*.44,
         done ? F.BLUE2 : F.SAND, 1, 0, 1.3);
  if (done){
    F.fig(x, -W*.055, H*.19, H*.3, F.NAVY, 1);
    F.fig(x,  W*.065, H*.19, H*.29, F.VIOLET, 1);
  }
  x.restore();
  F.grain(x, W, H, 60, .05);
}

function drawPhoto(c, slot, imgKey, done, objKey){
  const x = guardEllipses(c.getContext('2d'));
  const W = 130, H = 96;
  x.setTransform(1,0,0,1,0,0);
  x.clearRect(0, 0, c.width, c.height);
  x.scale(c.width / W, c.height / H);
  const photo = imgKey ? Img.el(imgKey) : null;
  if (photo && photo.naturalWidth){
    const b = fitBox(photo.naturalWidth, photo.naturalHeight, W, H);
    x.drawImage(photo, b.x, b.y, b.w, b.h);
    if (!done && objKey){
      const o = Img.el(objKey);
      if (o && o.naturalWidth){
        const cfg = SLOT_DROP[slot] || null;
        x.save();
        x.globalCompositeOperation = 'destination-out';
        const gx = cfg ? cfg.x * W : W * .5, gy = cfg ? cfg.y * H : H * .5;
        const gr = (cfg ? cfg.w : .3) * W * .5;
        const gg = x.createRadialGradient(gx, gy, 0, gx, gy, gr);
        gg.addColorStop(0, 'rgba(0,0,0,1)');
        gg.addColorStop(.72, 'rgba(0,0,0,.92)');
        gg.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = gg;
        x.fillRect(gx - gr, gy - gr, gr*2, gr*2);
        x.restore();
      }
    }
  } else {
    FLAT2.band(x, -2, -2, W+4, H+4, FLAT2.CREAM, 1, 0, 0);
    FLAT2.band(x, -2, -2, W+4, H*.7, FLAT2.SUN, 1, 0, 0);
    FLAT2.band(x, -2, H*.7, W+4, H*.36, FLAT2.SAND, 1, 0, 1.3);
    x.fillStyle = '#1B2A4A';
    if (slot==='cap'){ fig(x,45,58); fig(x,78,58); }
    else if (slot==='trophy'){ fig(x,42,60); fig(x,88,60); }
    else if (slot==='podium'){ fig(x,66,50); }
    else if (slot==='streamers'){ fig(x,42,60); fig(x,88,60); }
    else if (slot==='oceanpainting'){ fig(x,40,62); }
    else if (slot==='lastphoto'){
      paintWardFrame(x, done);
    }
  }
  if (done){
    const obj = objKey ? Img.el(objKey) : null;
    const d = SLOT_DROP[slot] || { x:.5, y:.5, w:.5 };
    if (obj){
      const w = W*d.w, h = w * (obj.height/obj.width || .75);
      x.drawImage(obj, W*d.x - w/2, H*d.y - h/2, w, h);
    } else {
      x.fillStyle='rgba(27,42,74,.85)';
      if (slot==='cap'){ x.fillRect(36,30,20,5); x.fillRect(70,30,20,5); }
      else if (slot==='trophy'){ x.fillRect(60,36,12,16); x.fillRect(57,52,18,4); }
      else if (slot==='podium'){ x.fillStyle='rgba(65,82,122,.85)'; x.fillRect(46,58,40,28); }
      else if (slot==='streamers'){ x.strokeStyle='#8A8493'; x.lineWidth=3;
        x.beginPath(); x.moveTo(30,26); x.quadraticCurveTo(65,44,100,26); x.stroke(); }
      else if (slot==='oceanpainting'){ x.fillStyle='rgba(65,82,122,.85)'; x.fillRect(64,28,44,34);
        x.fillStyle='rgba(138,132,147,.9)'; x.beginPath(); x.ellipse(86,45,16,7,0,0,7); x.fill(); }
      else if (slot==='lastphoto'){  }
    }
  } else {
    x.fillStyle='rgba(120,140,170,.10)'; x.fillRect(0,0,W,H);
  }
  function fig(x,cx,cy){ x.beginPath(); x.ellipse(cx,cy,7,16,0,0,7); x.fill();
    x.beginPath(); x.arc(cx,cy-22,5,0,7); x.fill(); }
}

function elementSVG(type){
  const v = '#8A8493', b = '#41527a', l = '#a9b6c9';
  const svgs = {
    whale: '<svg viewBox="0 0 64 64"><path d="M8 34 Q22 18 44 26 Q52 20 58 14 Q54 26 58 34 Q50 30 44 32 Q26 44 8 34Z" fill="'+v+'"/><line x1="32" y1="8" x2="34" y2="24" stroke="'+l+'" stroke-width="2"/></svg>',
    podium:'<svg viewBox="0 0 64 64"><rect x="16" y="24" width="32" height="30" fill="'+b+'"/><rect x="12" y="18" width="40" height="8" fill="'+v+'"/></svg>',
    cap:   '<svg viewBox="0 0 64 64"><polygon points="32,16 58,28 32,40 6,28" fill="'+b+'"/><rect x="26" y="36" width="12" height="10" fill="'+v+'"/><line x1="50" y1="30" x2="50" y2="46" stroke="'+l+'" stroke-width="2"/></svg>',
    trophy:'<svg viewBox="0 0 64 64"><path d="M22 14 h20 v12 a10 10 0 0 1 -20 0 Z" fill="'+l+'"/><rect x="28" y="36" width="8" height="10" fill="'+v+'"/><rect x="22" y="46" width="20" height="6" fill="'+b+'"/></svg>',
    streamers:'<svg viewBox="0 0 64 64"><path d="M8 50 Q20 18 34 34 T58 12" fill="none" stroke="'+v+'" stroke-width="5" stroke-linecap="round"/></svg>',
    oceanpainting:'<svg viewBox="0 0 64 64"><rect x="10" y="14" width="44" height="34" fill="'+b+'"/><path d="M14 40 Q26 26 34 34 T50 30" fill="none" stroke="'+l+'" stroke-width="3"/></svg>',
    lastphoto:'<svg viewBox="0 0 64 64">'
      + '<g transform="rotate(-4 32 32)">'
      + '<rect x="9" y="12" width="46" height="40" rx="1" fill="#e8e6df"/>'
      + '<rect x="12" y="15" width="40" height="30" fill="#41527a"/>'
      + '<path d="M12 45 q7 -13 14 -6 q6 -9 12 -1 q5 -7 14 1 v6 z" fill="#1B2A4A" opacity=".55"/>'
      + '<ellipse cx="25" cy="34" rx="4.6" ry="8" fill="'+v+'"/><circle cx="25" cy="24" r="3.4" fill="'+v+'"/>'
      + '<ellipse cx="38" cy="34" rx="4.6" ry="8" fill="'+l+'"/><circle cx="38" cy="24" r="3.4" fill="'+l+'"/>'
      + '</g></svg>',
  };
  return svgs[type] || svgs.whale;
}

function texGalleryBack(){
  const c = document.createElement('canvas'); c.width=1024; c.height=512;
  const x = guardEllipses(c.getContext('2d'));
  const g = x.createLinearGradient(0,0,0,512);
  g.addColorStop(0,'#c3d6e4'); g.addColorStop(.62,'#a9c2d4'); g.addColorStop(1,'#93aec4');
  x.fillStyle = g; x.fillRect(0,0,1024,512);
  for (let i=0;i<3;i++){
    const cx = 220 + i*292;
    x.fillStyle = 'rgba(232,242,250,.85)';
    x.beginPath(); x.moveTo(cx-70,120); x.quadraticCurveTo(cx,28,cx+70,120);
    x.lineTo(cx+70,150); x.lineTo(cx-70,150); x.closePath(); x.fill();
    const sh = x.createLinearGradient(cx,130,cx-60,470);
    sh.addColorStop(0,'rgba(236,246,252,.34)'); sh.addColorStop(1,'rgba(236,246,252,0)');
    x.fillStyle = sh;
    x.beginPath(); x.moveTo(cx-64,150); x.lineTo(cx+64,150);
    x.lineTo(cx+130,480); x.lineTo(cx-130,480); x.closePath(); x.fill();
  }
  grain(x, 1024, 512, 900, 'rgba(255,255,255,.05)');
  return c;
}
function texGalleryMid(){
  const c = document.createElement('canvas'); c.width=1024; c.height=512;
  const x = guardEllipses(c.getContext('2d'));
  x.clearRect(0,0,1024,512);
  x.fillStyle = '#b9cddd'; x.fillRect(0,40,1024,392);
  x.strokeStyle = 'rgba(120,142,168,.35)'; x.lineWidth = 3;
  for (let i=0;i<4;i++) x.strokeRect(48+i*242, 84, 200, 300);
  x.fillStyle = '#8fa8be'; x.fillRect(0,412,1024,24);
  x.fillStyle = 'rgba(90,110,136,.25)'; x.fillRect(0,306,1024,4);
  grain(x, 1024, 512, 500, 'rgba(70,90,120,.05)');
  return c;
}
function texGalleryFront(){
  const c = document.createElement('canvas'); c.width=1024; c.height=280;
  const x = guardEllipses(c.getContext('2d'));
  x.clearRect(0,0,1024,280);
  const g = x.createLinearGradient(0,0,0,280);
  g.addColorStop(0,'rgba(122,146,172,0)'); g.addColorStop(.35,'#7e9cb8'); g.addColorStop(1,'#6a89a8');
  x.fillStyle = g; x.fillRect(0,30,1024,250);
  for (let i=0;i<4;i++){
    const r = x.createLinearGradient(0,40,0,190);
    r.addColorStop(0,'rgba(210,224,238,.30)'); r.addColorStop(1,'rgba(210,224,238,0)');
    x.fillStyle = r; x.fillRect(96+i*242, 40, 130, 150);
  }
  x.fillStyle = 'rgba(58,74,98,.85)';
  x.fillRect(60,120,190,16); x.fillRect(80,136,14,44); x.fillRect(216,136,14,44);
  x.beginPath(); x.ellipse(940,110,46,58,0,0,7); x.fill();
  x.fillRect(926,160,28,60);
  grain(x, 1024, 280, 400, 'rgba(255,255,255,.04)');
  return c;
}
function grain(x, W, H, n, col){
  x.fillStyle = col;
  for (let i=0;i<n;i++){
    x.beginPath(); x.arc(rnd()*W, rnd()*H, 1.1, 0, 7); x.fill();
  }
}

let DUST = null;
function maybeDust(){
  if (meganState.paintingsDone.length < 3 || DUST || !G) return;
  const c = document.createElement('canvas');
  c.id = 'dustc';
  c.width = 900; c.height = 506;
  G.back.appendChild(c);
  const P = [];
  const bands = [[.19,.30],[.46,.57],[.73,.84]];
  for (let i = 0; i < 27; i++){
    const b = bands[i % 3];
    P.push({ bx0:b[0], bx1:b[1],
      x: rnd(), y: rnd(),
      s: .7 + rnd()*1.6,
      vy: .00016 + rnd()*.00028,
      ph: rnd()*Math.PI*2 });
  }
  DUST = { c, ctx: guardEllipses(c.getContext('2d')), P };
}
function drawDust(){
  if (!DUST) return;
  const { c, ctx, P } = DUST;
  ctx.clearRect(0, 0, c.width, c.height);
  const t = performance.now();
  const [lx] = G._c();
  const decay = Math.min(1, meganState.paintingsDone.length / 4);
  for (const p of P){
    p.y -= p.vy;
    if (p.y < -0.02){ p.y = 1.02; p.x = rnd(); }
    const sway = Math.sin(t/2400 + p.ph) * (.012 + decay*.02);
    const x = (p.bx0 + (p.bx1 - p.bx0) * p.x + sway - lx*.05) * c.width;
    const y = p.y * c.height;
    const a = .05 + .07 * (0.5 + 0.5 * Math.sin(t/1700 + p.ph*2));
    ctx.fillStyle = 'rgba(247,238,213,' + a.toFixed(3) + ')';
    ctx.beginPath(); ctx.arc(x, y, p.s, 0, Math.PI*2); ctx.fill();
  }
}

function developFromBlue(holdMs, developMs, onDone){
  const dive = document.getElementById('meganDive');
  const prev = document.getElementById('meganDevelop');
  if (prev) prev.remove();
  const ov = document.createElement('canvas');
  ov.id = 'meganDevelop';
  ov.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:82;pointer-events:none';
  const W = ov.width = innerWidth, H = ov.height = innerHeight;
  appRoot().appendChild(ov);
  const x = guardEllipses(ov.getContext('2d'));
  const cx = W*0.5, cy = H*0.42; let diveGone = false;
  const blooms = [];
  for (let i=0;i<7;i++) blooms.push({ x:(.14+Math.random()*.72)*W, y:(.14+Math.random()*.72)*H, r0:Math.random()*70, delay:Math.random()*.35, spd:.8+Math.random()*.6, wob:Math.random()*6.283 });
  const maxR = Math.hypot(W,H)*.82, FALL = 700, BLOOM = 1900, T0 = performance.now();
  const ink = [];
  for (let i=0;i<9;i++){ const a=Math.random()*6.283, d=Math.random()*Math.min(W,H)*0.12; ink.push({ x:cx+Math.cos(a)*d, y:cy+Math.sin(a)*d, r0:20+Math.random()*40, delay:Math.random()*0.3, spd:0.8+Math.random()*0.5, wob:Math.random()*6.283 }); }
  function frame(now){
   try {
    const e = Math.max(0, now - T0);
    x.clearRect(0,0,W,H);
    if (e < FALL){
      x.fillStyle = '#1B2A4A'; x.fillRect(0,0,W,H);
      const p = Math.max(0, Math.min(1, e/FALL)), dy = -40 + (cy+40)*(p*p);
      x.fillStyle = 'rgba(20,32,62,0.96)';
      x.beginPath(); x.ellipse(cx, dy, 6.5, 9+p*7, 0, 0, 6.283); x.fill();
      x.globalAlpha = 0.22*p; x.beginPath(); x.ellipse(cx, dy-15, 3, 17, 0, 0, 6.283); x.fill(); x.globalAlpha = 1;
      requestAnimationFrame(frame); return;
    }
    if (!diveGone){ if (dive) dive.remove(); diveGone = true; }
    if (e < FALL+BLOOM){
      const p = (e-FALL)/BLOOM;
      x.fillStyle = '#1B2A4A'; x.fillRect(0,0,W,H);
      for (const b of ink){
        const bt = Math.max(0, (p - b.delay)/(1-b.delay)) * b.spd;
        if (bt <= 0) continue;
        const wob = 1 + Math.sin(now*.0010 + b.wob)*.055
                      + Math.cos(now*.0016 + b.wob*1.5)*.042
                      + Math.sin(now*.0027 + b.wob*2.3)*.022;
        const r = (b.r0 + Math.pow(bt,0.7)*maxR*0.9) * wob;
        const g = x.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
        g.addColorStop(0, 'rgba(174,198,216,0.95)');
        g.addColorStop(0.42, 'rgba(138,132,147,0.86)');
        g.addColorStop(0.72, 'rgba(96,124,158,0.62)');
        g.addColorStop(1, 'rgba(27,42,74,0)');
        x.fillStyle = g; x.beginPath(); x.arc(b.x, b.y, r, 0, 6.283); x.fill();
      }
      if (p>0.8){ x.globalAlpha=(p-0.8)/0.2; x.fillStyle='#aec6d8'; x.fillRect(0,0,W,H); x.globalAlpha=1; }
      requestAnimationFrame(frame); return;
    }
    const t = Math.max(0, (e - FALL - BLOOM - holdMs) / developMs);
    x.globalCompositeOperation = 'source-over';
    x.globalAlpha = Math.max(0, 1 - Math.max(0,(t-.72)/.28));
    x.fillStyle = '#aec6d8'; x.fillRect(0,0,W,H);
    x.globalCompositeOperation = 'destination-out';
    for (const b of blooms){
      const bt = Math.max(0,(t-b.delay)/(1-b.delay)) * b.spd;
      if (bt <= 0) continue;
      const wob = 1 + Math.sin(now*.0011 + b.wob)*.06;
      const r = (b.r0 + bt*maxR) * wob;
      const g = x.createRadialGradient(b.x,b.y,0,b.x,b.y,r);
      g.addColorStop(0,'rgba(0,0,0,1)'); g.addColorStop(.68,'rgba(0,0,0,.92)'); g.addColorStop(1,'rgba(0,0,0,0)');
      x.fillStyle = g; x.beginPath(); x.arc(b.x,b.y,r,0,6.283); x.fill();
    }
    x.globalCompositeOperation = 'source-over';
    if (t < 1) requestAnimationFrame(frame);
    else finish();
   } catch(err){ clog('[reveal] stopped early:', err.message); finish(); }
  }
  let guard = 0;
  function finish(){
    if (finish.done) return; finish.done = true;
    if (guard) clearTimeout(guard);
    if (ov.parentNode) ov.remove();
    onDone && onDone();
  }
  guard = setTimeout(finish, 9000);
  frame(performance.now());
}
SCENES.gallery_entry = {
  enter(){
    enterGallery('entry', {});
    SCENES.gallery_entry._watch = setTimeout(()=>{
      if (_current !== 'gallery_entry') return;
      const built = G && G.FR && G.FR.length === 4;
      const lit = document.querySelectorAll('#gWrap .gframe.want').length;
      if (built && lit) return;
      clog('[stuck] hall built:', !!built, 'lit frames:', lit,
           'locked:', !!SCENES.gallery_entry._lockFrames);
      SCENES.gallery_entry._lockFrames = false;
      if (G && G.wrap) G.wrap.classList.remove('waiting');
      try { syncFrames(); } catch(e){}
      scheduleHint('touch the lit frame.', 0);
    }, 20000);
    try { SCENES.gallery_entry.open(); }
    catch(e){
      clog('[entry] failed:', e.message, e.stack || '');
      SCENES.gallery_entry._lockFrames = false;
      if (G && G.wrap) G.wrap.classList.remove('waiting');
      scheduleHint('touch the lit frame.', 600);
    }
  },
  open(){
    if (!SCENES.gallery_entry._voDone){
      SCENES.gallery_entry._voDone = true;
      SCENES.gallery_entry._lockFrames = true;
      if (G && G.wrap) G.wrap.classList.add('waiting');

      developFromBlue(200, 400, ()=>{
        const openHall = ()=>{
          if (!SCENES.gallery_entry._lockFrames) return;
          SCENES.gallery_entry._lockFrames = false;
          if (G && G.wrap) G.wrap.classList.remove('waiting');
          scheduleHint('touch the lit frame.', 0);
          setTimeout(hideLine, 1000);

        };
        SCENES.gallery_entry._voT = setTimeout(()=>{
          Sound.vo(ENTRY_DOCTOR.file, ENTRY_DOCTOR.speaker,
            ENTRY_DOCTOR.line, ENTRY_DOCTOR.subDelayMs, ENTRY_DOCTOR.subHoldMs,
            openHall, ENTRY_DOCTOR.clip);
          SCENES.gallery_entry._hintT = setTimeout(openHall,
            (ENTRY_DOCTOR.clip.to - ENTRY_DOCTOR.clip.from) * 1000 + 600);
        }, ENTRY_DOCTOR.afterRevealMs);
      });
    }
  },
  exit(){ clearTimeout(SCENES.gallery_entry._voT); clearTimeout(SCENES.gallery_entry._hintT);
    clearTimeout(SCENES.gallery_entry._watch);
    exitGallery(); },
};

let _gradRaf = 0;
const GRAD_LEAVE_MS = 5200;
SCENES.graduation = {
  enter(){
    const cs = document.getElementById('cutscene');
    cs.style.display = 'flex';
    cs.innerHTML = '<canvas width="900" height="506"></canvas>';
    const x = guardEllipses(cs.firstChild.getContext('2d'));
    const gradImg = Img.el('flash_graduation');
    if (gradImg){
      const b = fitBox(gradImg.naturalWidth, gradImg.naturalHeight, 900, 506);
      x.drawImage(gradImg, b.x, b.y, b.w, b.h);
    }
    else {
      x.fillStyle = '#e8dcc0'; x.fillRect(0, 0, 900, 506);
      x.fillStyle = 'rgba(120,96,60,.55)'; x.textAlign = 'center';
      x.font = 'italic 26px Georgia,serif'; x.fillText('Megan & Hans', 450, 262);
    }
    let gradGone = false;
    const leaveGraduation = ()=>{
      if (gradGone || _current !== 'graduation') return;
      gradGone = true;
      clearTimeout(SCENES.graduation._t);
      Sound.play('megan_scene3_end_transition.wav','transition into the studio');
      turnPage(()=>{
        if (_current !== 'graduation') return;
        goto('studio_alone', {});
      }, [232, 224, 198]);
    };
    // the file carries applause after the line, so do not wait for it to end
    SCENES.graduation._t = setTimeout(leaveGraduation, GRAD_LEAVE_MS);
    Sound.vo('megan_graduation_vo_mc.wav','MC',
      'Congratulation the team of Megan and Hans!', ()=>{
        if (_current !== 'graduation') return;
        SCENES.graduation._t = setTimeout(leaveGraduation, 600);
      });
  },
  exit(){ const cs = document.getElementById('cutscene');
    clearTimeout(SCENES.graduation._t);
    Sound.cancelVO();
    if (_gradRaf){ cancelAnimationFrame(_gradRaf); _gradRaf = 0; }
    cs.style.display = 'none'; cs.innerHTML = ''; },
};

SCENES.studio_alone = {
  enter(){
    const host = appRoot();
    const ov = document.createElement('div');
    ov.id = 'studioThreshold';
    ov.style.cssText = 'position:fixed;inset:0;z-index:70;background:#e6dabf;overflow:hidden;cursor:pointer';
    ['back','front'].forEach((k, i)=>{
      const url = Img.url('studio_' + k);
      if (!url) return;
      const d = document.createElement('div');
      d.className = 'slayer';
      d.id = 'thresh_' + k;
      d.style.cssText = (k === 'front'
          ? 'position:absolute;left:0;right:0;top:auto;bottom:0;height:54%;'
          : 'position:absolute;inset:0;')
        + 'z-index:' + (i+1) + ';opacity:0;transition:opacity 1.6s ease';
      const im = document.createElement('img');
      im.src = url; im.alt = '';
      d.appendChild(im);
      ov.appendChild(d);
      setTimeout(()=>{ d.style.opacity = '1'; }, 40 + i*140);
    });
    const plate = document.createElement('div');
    plate.style.cssText = 'position:absolute;right:0;bottom:10%;width:46%;height:56%;z-index:8;opacity:0;'
      + 'transition:opacity 1.8s ease;pointer-events:none;'
      + 'background:radial-gradient(74% 70% at 76% 56%,rgba(255,251,240,.9) 0%,rgba(255,251,240,.66) 48%,rgba(255,251,240,0) 80%)';
    ov.appendChild(plate);
    const card = document.createElement('div');
    card.style.cssText = 'position:absolute;left:50%;top:26%;transform:translateX(-50%);'
      + 'width:min(46vw,600px);z-index:9;opacity:0;'
      + 'transition:opacity 1.8s ease;color:rgba(27,42,74,.96);text-align:center;'
      + 'font:400 17px/1.9 Georgia,serif;'
      + 'padding:26px 34px 30px;border-radius:10px;'
      + 'background:rgba(255,251,240,.72);'
      + '-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);'
      + 'box-shadow:0 10px 34px rgba(74,60,32,.12)';
    card.innerHTML = '<div style="font:500 10px/1 system-ui;letter-spacing:.28em;text-transform:uppercase;'
      + 'color:rgba(27,42,74,.62);margin-bottom:18px">her studio</div>'
      + 'Her brushes and her colours are on the table.<br><br>'
      + '<span style="opacity:.82">Paint over the whale she left behind.</span>'
      + '<div id="studioGo">I am ready</div>';
    ov.appendChild(card);
    setTimeout(()=>{ plate.style.opacity = '1'; }, 1300);
    setTimeout(()=>{ card.style.opacity = '1'; }, 1500);
    host.appendChild(ov);
    Sound.vo(STUDIO_ENTRY.file, STUDIO_ENTRY.speaker, STUDIO_ENTRY.line);
    let gone = false;
    const go = ()=>{
      if (gone) return; gone = true;
      ov.style.pointerEvents = 'none';
      requestAnimationFrame(()=>{
        goto('studio_born', { intro:'openstudio' });
        SCENES.studio_alone._t2 = setTimeout(()=>{
          ov.style.transition = 'opacity 1.2s ease';
          ov.style.opacity = '0';
          SCENES.studio_alone._t4 = setTimeout(()=>{ if (ov.parentNode) ov.remove(); }, 1300);
        }, 260);
      });
    };
    ov.addEventListener('click', go);
    SCENES.studio_alone._t1 = setTimeout(go, 180000);
    SCENES.studio_alone._go = go;
  },
  exit(){
    clearTimeout(SCENES.studio_alone._t1); clearTimeout(SCENES.studio_alone._t2);
    clearTimeout(SCENES.studio_alone._t3); clearTimeout(SCENES.studio_alone._t4);
    const ov = document.getElementById('studioThreshold');
    if (ov && ov.parentNode) ov.remove();
  },
};

SCENES.studio_born    = { enter(o){ enterStudio('born', o); },
  exit(){ clearTimeout(SCENES.studio_born._primerT);
    const pr = document.getElementById('meganPrimer');
    if (pr) pr.remove();
    exitStudio(); } };
SCENES.studio_breadth = { enter(o){ enterStudio('breadth', o); }, exit(){ exitStudio(); } };
SCENES.studio_calls   = {
  enter(o){
    enterStudio('calls', o);
    if (o.intro === 'bigwave_pod'){
      const w = document.createElement('div');
      w.style.cssText = 'position:fixed;inset:0;z-index:66;pointer-events:none;'
        + 'background:linear-gradient(180deg,rgba(27,42,74,0) 0%,rgba(27,42,74,.92) 34%,#16233d 100%);'
        + 'transform:translateY(100%);transition:transform 1.05s cubic-bezier(.3,.6,.3,1)';
      appRoot().appendChild(w);
      requestAnimationFrame(()=> requestAnimationFrame(()=>{
        w.style.transform = 'translateY(-6%)';
        setTimeout(()=>{ w.style.transition = 'transform 1.4s cubic-bezier(.5,.1,.6,1), opacity 1.4s';
          w.style.transform = 'translateY(100%)'; w.style.opacity = '.6';
          setTimeout(()=> w.remove(), 1500); }, 1150);
      }));
    }
    if (o.intro === 'reveal'){
      const v = document.createElement('div');
      v.style.cssText = 'position:fixed;inset:0;z-index:66;pointer-events:none;'
        + 'background:radial-gradient(120% 90% at 50% 46%,'
        + 'rgba(214,222,234,.62) 0%,rgba(174,198,216,.78) 45%,rgba(138,132,147,.86) 100%);'
        + 'opacity:1;transition:opacity 2.1s cubic-bezier(.35,.1,.4,1)';
      appRoot().appendChild(v);
      requestAnimationFrame(()=> requestAnimationFrame(()=>{
        v.style.opacity = '0';
        setTimeout(()=> v.remove(), 2300);
      }));
    }
  },
  exit(){ exitStudio(); },
};
SCENES.studio_fall    = { enter(o){ enterStudio('fall', o); },    exit(){ exitStudio(); } };

SCENES.fill_1 = { enter(){ enterGallery('fill', { fillN:'fill1' }); }, exit(){ exitGallery(); } };
SCENES.fill_2 = { enter(){ enterGallery('fill', { fillN:'fill2' }); }, exit(){ exitGallery(); } };
SCENES.fill_3 = { enter(){ enterGallery('fill', { fillN:'fill3' }); }, exit(){ exitGallery(); } };


SCENES.ending = {
  enter(){
    try{ sessionStorage.setItem('megan_complete','true'); }catch(e){}
    enterGallery('ending', {});
    SCENES.ending.reveal();
  },
  reveal(){
    let ddefs = document.getElementById('meganDissolveDefs');
    if (!ddefs){
      ddefs = document.createElement('div');
      ddefs.id = 'meganDissolveDefs';
      ddefs.style.cssText = 'position:absolute;width:0;height:0;pointer-events:none';
      ddefs.innerHTML = '<svg><defs><filter id="meganDissolve" x="-8%" y="-8%" width="116%" height="116%">'
        + '<feTurbulence type="fractalNoise" baseFrequency="0.008 0.013" numOctaves="2" seed="4" result="w">'
        + '<animate attributeName="baseFrequency" dur="22s" values="0.008 0.013;0.013 0.021;0.008 0.013" repeatCount="indefinite"/>'
        + '</feTurbulence>'
        + '<feDisplacementMap in="SourceGraphic" in2="w" scale="0" xChannelSelector="R" yChannelSelector="G">'
        + '<animate attributeName="scale" dur="17s" values="3;30" fill="freeze"/>'
        + '</feDisplacementMap></filter></defs></svg>';
      appRoot().appendChild(ddefs);
    }
    if (G && G.wrap) G.wrap.style.filter = 'url(#meganDissolve)';
    const fig = document.createElement('div');
    fig.id = 'meganCane';
    fig.style.cssText = 'position:absolute;left:50%;bottom:16%;transform:translateX(-50%);z-index:31;';
    if (Img.ok('ending_stick_cut')){
      fig.innerHTML = '<img src="' + Img.url('ending_stick_cut') + '" alt="" style="height:46vh;display:block">';
    } else {
      clog('[assets] ' + IMG_FILES.ending_stick_cut + ' did not load from ' + IMG_BASE
         + '. Check the filename case, Netlify is case-sensitive where macOS is not.');
      fig.innerHTML = '<svg viewBox="0 0 120 310" style="height:46vh;display:block">'
        + '<g fill="#1B2A4A">'
        + '<circle cx="40" cy="40" r="13"/>'
        + '<circle cx="59" cy="34" r="20"/>'
        + '<rect x="52" y="50" width="13" height="20"/>'
        + '<path d="M36 74 Q58 66 82 74 L88 138 Q86 176 84 186 L34 186 Q32 176 30 138 Z"/>'
        + '<path d="M44 186 h13 v96 h-13 Z"/>'
        + '<path d="M62 186 h13 v96 h-13 Z"/>'
        + '<ellipse cx="50" cy="288" rx="11" ry="6"/>'
        + '<ellipse cx="69" cy="288" rx="11" ry="6"/>'
        + '</g>'
        + '<path d="M88 152 L96 288" stroke="#8A8493" stroke-width="4" stroke-linecap="round"/>'
        + '<path d="M82 150 Q90 144 94 152" fill="none" stroke="#8A8493" stroke-width="4" stroke-linecap="round"/>'
        + '</svg>';
    }
    document.getElementById('galleryHost').appendChild(fig);
    setTimeout(startEndingDrift, 3200);

    Sound.loop('megan_ending_sea.wav','whale sounds under slow waves');
    const T = [];
    let closed = false;
    const closeOut = ()=>{
      if (closed) return; closed = true;
      Sound.play('megan_ending_dial_fade.wav','du du du… fading');
      T.push(setTimeout(revealIntention, 1400));
      T.push(setTimeout(runDedication, CFG_DED.dedDelay + 2400));
    };
    T.push(setTimeout(()=> Sound.play('megan_ending_dial.wav','du du du…'), 900));
    T.push(setTimeout(()=>{
      Sound.vo(ENDING_LINE.file, ENDING_LINE.speaker, ENDING_LINE.line, ()=>{
        T.push(setTimeout(closeOut, 2500));
      });
    }, 2100));
    T.push(setTimeout(closeOut, 16000));
    SCENES.ending._timers = T;
  },
  exit(){ (SCENES.ending._timers||[]).forEach(clearTimeout);
    SCENES.ending._leaving = false;
    if (G && G.wrap) G.wrap.style.filter = ''; exitGallery(); },
};

const CFG_DED = {
  dedDelay: 4600, dedFade: 2400, dedHold: 5000,
  blackoutMs: 4000, closeSinkMs: 3000, closeSinkPct: 3,
};
function startEndingDrift(){
  const host = document.getElementById('gWrap') || document.getElementById('app');
  if (!host || document.getElementById('endDrift')) return;
  const d = document.createElement('div');
  d.id = 'endDrift';
  host.appendChild(d);
  requestAnimationFrame(()=> d.classList.add('on'));
  const app = document.getElementById('app');
  if (app) app.classList.add('drifting');
}

function stopEndingDrift(){
  const d = document.getElementById('endDrift');
  if (d) d.remove();
  const app = document.getElementById('app');
  if (app) app.classList.remove('drifting');
}

function revealIntention(){
  if (!G || !G.FR) return;
  const T = SCENES.ending._timers = (SCENES.ending._timers || []);
  G.FR.forEach((el, i)=>{
    const id = el.dataset.id;
    const original = Img.el('aw_' + id);
    if (!original) return;
    const cnv = document.createElement('canvas');
    const base = el.querySelector('canvas');
    cnv.width = base.width; cnv.height = base.height;
    cnv.className = 'intent';
    drawFrame(cnv, original, false, true, el.dataset.frame);
    el.appendChild(cnv);
    T.push(setTimeout(()=> cnv.classList.add('on'), 120 + i*260));
    T.push(setTimeout(()=> cnv.classList.remove('on'), 3400 + i*260));
    T.push(setTimeout(()=> cnv.remove(), 6200 + i*260));
  });
}

function inkClose(cb){
  const c = transitionCanvas(), x = guardEllipses(c.getContext('2d'));
  const W = c.width, H = c.height;
  const j = streamFor('inkclose');
  const drops = [];
  for (let i = 0; i < 9; i++){
    const a = j() * 6.283, d = j() * Math.min(W, H) * .34;
    drops.push({ x: W*.5 + Math.cos(a)*d, y: H*.5 + Math.sin(a)*d,
      r0: 8 + j()*22, rate: .8 + j()*1.3, delay: j()*700, ph: j()*6.283 });
  }
  const T0 = performance.now(), COVER = 2600, HOLD = 700;
  let handed = false;
  (function frame(){
    const e = performance.now() - T0;
    x.clearRect(0, 0, W, H);
    for (const d of drops){
      const t = (e - d.delay) / 1000;
      if (t <= 0) continue;
      const r = d.r0 + t * t * 150 * d.rate;
      const g = x.createRadialGradient(d.x, d.y, 0, d.x, d.y, r);
      g.addColorStop(0, 'rgba(10,16,32,.96)');
      g.addColorStop(.6, 'rgba(12,20,38,.82)');
      g.addColorStop(1, 'rgba(14,24,44,0)');
      x.fillStyle = g;
      x.beginPath();
      for (let k = 0; k <= 28; k++){
        const a2 = k / 28 * 6.283;
        const rr = r * (1 + Math.sin(a2*3 + d.ph)*.07 + Math.sin(a2*7 + d.ph)*.035);
        const px = d.x + Math.cos(a2)*rr, py = d.y + Math.sin(a2)*rr*.94;
        if (k === 0) x.moveTo(px, py); else x.lineTo(px, py);
      }
      x.closePath(); x.fill();
    }
    if (!handed && e >= COVER){
      handed = true;
      x.fillStyle = '#0a1020';
      x.fillRect(0, 0, W, H);
      setTimeout(()=>{ c.style.display = 'none'; cb && cb(); }, HOLD);
      return;
    }
    requestAnimationFrame(frame);
  })();
}

function offerReturn(){
  if (SCENES.ending._leaving) return;
  SCENES.ending._leaving = true;
  Sound.fadeOutLoop('megan_ending_sea.wav', 2400);
  inkClose(()=>{
    teardownMeganThread();
    if (window.Ending){ Ending.offer('megan'); return; }
    if (window.__backToSea) window.__backToSea();
  });
}

function runDedication(){
  const d = document.getElementById('dedication');
  d.style.display = 'flex';
  const main = d.querySelector('.main'), close = d.querySelector('.close');
  main.textContent = '';
  close.textContent = 'hey, do you remember <The Big Big Whale>?';
  const F = CFG_DED;
  const T = SCENES.ending._timers = (SCENES.ending._timers || []);
  T.push(setTimeout(()=>{
    anim(document.getElementById('endingBlack'), 0, 1, F.blackoutMs);
  }, 400));
  T.push(setTimeout(()=> anim(close, 0, 1, F.dedFade), 400 + F.blackoutMs * .7));
  T.push(setTimeout(()=>{
    if (!close.isConnected) return;
    close.style.transition = 'transform '+F.closeSinkMs+'ms ease-in, opacity '+F.closeSinkMs+'ms ease-in';
    close.style.transform = 'translate(-50%,'+F.closeSinkPct+'vh)';
    close.style.opacity = '0';
    if (window.__backToSea) T.push(setTimeout(offerReturn, F.closeSinkMs + 3000));
  }, F.dedFade + F.dedHold + F.dedFade + F.blackoutMs + 2200));
  function anim(el, from, to, ms){
    if (!el) return;
    el.style.transition = 'opacity '+ms+'ms ease';
    el.style.opacity = String(from);
    requestAnimationFrame(()=> requestAnimationFrame(()=> el.style.opacity = String(to)));
  }
}

function meganGatePaint(api){
  api.exitMs = 820;
  api.fadeMs = 700;
  var strokes = [];
  var lastX = null, lastY = null, lastT = 0;
  var HUES = ['#8A8493', '#6E7F8D', '#A08E7A', '#5E6B76', '#8E7B86'];
  var pick = 0;
  return function(a){
    var g = a.ctx, W = a.w(), H = a.h(), t = a.t(), d = a.dpr;
    g.setTransform(d, 0, 0, d, 0, 0);
    g.clearRect(0, 0, W, H);

    g.fillStyle = '#0a0d11';
    g.fillRect(0, 0, W, H);

    var cw = Math.min(W * 0.62, 760), ch = Math.min(H * 0.62, 520);
    var cx = (W - cw) / 2, cy = (H - ch) / 2;

    g.save();
    g.shadowColor = 'rgba(0,0,0,0.6)';
    g.shadowBlur = 40;
    g.fillStyle = '#e6e1d6';
    g.fillRect(cx, cy, cw, ch);
    g.restore();

    g.save();
    g.beginPath();
    g.rect(cx, cy, cw, ch);
    g.clip();

    for (var n = 0; n < 200; n++){
      var gx = cx + ((n * 137.5) % cw);
      var gy = cy + ((n * 71.3) % ch);
      g.fillStyle = 'rgba(120,110,96,0.05)';
      g.fillRect(gx, gy, 2, 2);
    }

    if (a.mouse.on && !a.leaving()){
      var mx = a.mouse.x, my = a.mouse.y;
      var inside = mx > cx && mx < cx + cw && my > cy && my < cy + ch;
      if (inside){
        if (lastX != null){
          var sp = Math.hypot(mx - lastX, my - lastY);
          if (sp > 1.5){
            strokes.push({
              x0: lastX, y0: lastY, x1: mx, y1: my,
              w: Math.max(3, 22 - sp * 0.5),
              c: HUES[pick % HUES.length],
              a: 0.85,
              born: t
            });
            if (t - lastT > 0.9){ pick++; lastT = t; }
          }
        }
        lastX = mx; lastY = my;
      } else {
        lastX = null; lastY = null;
      }
      if (strokes.length > 400) strokes.splice(0, strokes.length - 400);
    }

    var sink = a.leaving() ? a.since : 0;
    for (var i = 0; i < strokes.length; i++){
      var s = strokes[i];
      s.a -= 0.0022;
      if (s.a <= 0) continue;
      var drop = sink > 0 ? sink * sink * 260 * (0.5 + (i % 7) / 7) : 0;
      var blur = sink > 0 ? Math.min(1, sink * 0.9) : 0;
      g.strokeStyle = s.c;
      g.globalAlpha = s.a * (1 - blur);
      g.lineWidth = s.w * (1 + blur * 1.6);
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(s.x0, s.y0 + drop);
      g.lineTo(s.x1, s.y1 + drop);
      g.stroke();
    }
    g.globalAlpha = 1;

    if (sink > 0){
      g.fillStyle = 'rgba(27,42,74,' + Math.min(0.94, sink * 1.15).toFixed(3) + ')';
      g.fillRect(cx, cy, cw, ch);
    }
    g.restore();

    if (sink > 0){
      g.fillStyle = 'rgba(27,42,74,' + Math.min(1, Math.max(0, (sink - 0.35) * 1.6)).toFixed(3) + ')';
      g.fillRect(0, 0, W, H);
    }

    if (!a.leaving()){
      var bx = a.mouse.on ? a.mouse.x : cx + cw / 2;
      var by = a.mouse.on ? a.mouse.y : cy + ch / 2;
      var bob = Math.sin(t * 2.1) * 3;
      g.save();
      g.translate(bx, by + bob);
      g.rotate(-0.6);
      g.fillStyle = '#3b3630';
      g.fillRect(-2.5, 6, 5, 54);
      g.fillStyle = '#9a8f7d';
      g.fillRect(-3.5, -2, 7, 10);
      g.fillStyle = HUES[pick % HUES.length];
      g.beginPath();
      g.moveTo(-3.5, -2);
      g.quadraticCurveTo(0, -18, 3.5, -2);
      g.closePath();
      g.fill();
      g.restore();
    }
  };
}

function initMeganThread(mountEl){
  if (document.getElementById('app')) teardownMeganThread();
  document.documentElement.classList.add('megan-on');
  document.body.classList.add('megan-on');
  rnd = mulberry(meganState.seed);
  clog('[seed]', meganState.seed);
  Img.preload();
  bootDOM(mountEl || document.body);
  buildSurfaceExit();
  for (const pd of BOOT.preDone) meganState.paintingsDone.push(pd);
  const ready = ()=> ['gallery_back','gallery_mid','gallery_front','frame_1','frame_2','frame_3','frame_4']
    .every(k=> Img.ok(k));
  const veil = document.createElement('div');
  veil.id = 'meganBoot';
  (document.getElementById('app') || document.body).appendChild(veil);
  let waited = 0;
  const start = ()=>{
    veil.classList.add('gone');
    setTimeout(()=>{ if (veil.parentNode) veil.remove(); }, 900);
    goto(BOOT.start, BOOT.startOpts || {});
  };
  const poll = ()=>{
    if (ready() || waited >= 6000){
      clog('[boot]', ready() ? 'hall art ready in ' + waited + 'ms'
                             : 'starting without all art after ' + waited + 'ms');
      if (window.Veil && Veil.gate){
        Veil.gate(null, meganGatePaint, function(){
          try { AudioBank.resume(); } catch(e){}
          start();
        });
      } else start();
      return;
    }
    waited += 100;
        ['gallery_back','gallery_mid','gallery_front','frame_1','frame_2','frame_3','frame_4'].forEach(k=> Img.el(k));
    setTimeout(poll, 100);
  };
  poll();
}
function leaveMeganThread(){
  teardownMeganThread();
  if (typeof window.__backToSea === 'function') window.__backToSea();
}
window.leaveMeganThread = leaveMeganThread;

function buildSurfaceExit(){
  const b = document.createElement('button');
  b.id = 'meganExit';
  b.type = 'button';
  b.textContent = 'esc to leave';
  b.addEventListener('click', leaveMeganThread);
  document.getElementById('app').appendChild(b);
  _escKey = (e)=>{ if (e.key === 'Escape') leaveMeganThread(); };
  window.addEventListener('keydown', _escKey);
}
let _escKey = null, _paletteFit = null;

function teardownMeganThread(){
  if (!document.getElementById('app')) return;
  document.documentElement.classList.remove('megan-on');
  document.body.classList.remove('megan-on');
  Sound.clearVO();
  exitStudio(); exitGallery();
  AudioBank.stopAll();
  const fresh = freshMeganState();
  for (const k in meganState) delete meganState[k];
  Object.assign(meganState, fresh);
  SCENES.gallery_entry._voDone = false;
  SCENES.ending._timers = [];
  dropHint();
  _current = null;
  if (_ringMove){ window.removeEventListener('pointermove', _ringMove); _ringMove = null; }
  const ring = document.getElementById('brushRing'); if (ring) ring.remove();
  if (G && G.onMove) window.removeEventListener('pointermove', G.onMove);
  if (_escKey){ window.removeEventListener('keydown', _escKey); _escKey = null; }
  G = null;
  DUST = null;
  const app = document.getElementById('app'); if (app) app.remove();
}
function bootDOM(root){
  const app = document.createElement('div'); app.id = 'app';
  app.innerHTML =
    '<div id="galleryHost"></div><div id="studioHost"></div>' +
    '<div id="meganSubScrim"></div>' +
    '<div id="meganSub"><div class="spk"></div><div class="txt"></div></div>' +
    '<div id="meganFade"></div><div id="meganGlass"></div>' +
    '<div id="cutscene"></div>' +
    '<div id="dedication"><div class="main"></div><div class="close"></div></div>' +
    '<div id="endingBlack"></div>';
  root.appendChild(app);
}
window.initMeganThread = initMeganThread;
window.teardownMeganThread = teardownMeganThread;

window.__meganTest = { meganState, STUDIO_CFG, SIG_CFG, goto, runDedication, AFTER_PAINT,
  trace: MEGAN_TRACE, handoffs: MEGAN_HANDOFFS,
  studioProbe: ()=> studio && studio.probe(),
  studioSign:  ()=> studio && studio.sign(),
  studioConfirm: ()=> studio && studio.confirm(),
  studioUndo:  ()=> studio && studio.undo(),
  studioClear: ()=> studio && studio.clear() };
if (window.MEGAN_AUTOBOOT !== false){
  window.addEventListener('DOMContentLoaded', ()=>{
    try { initMeganThread(); }
    catch(e){ clog('[boot]', e.message, e.stack || '');
      showFatal('This part of the story could not start. Please refresh the page.'); }
  });
}
})();
