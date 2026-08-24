(function(){
'use strict';

const THOMAS_MARKUP = "<div id=\"three-bg\"></div>\n<div id=\"p5-mount\"></div>\n<div id=\"finger\"></div>\n<div id=\"subs\" aria-live=\"polite\"></div>\n<div id=\"tcue\" class=\"pnote\" aria-hidden=\"true\"><span class=\"ink\"></span></div>\n<div id=\"tgoal\" class=\"pnote\" aria-live=\"polite\"><b></b><span></span></div>\n<div id=\"twatch\" class=\"pnote\" aria-hidden=\"true\"><b></b><div class=\"wb-line\"><i></i><div class=\"wb-note\"></div></div></div>\n<div id=\"tbrief\" role=\"dialog\" aria-modal=\"true\"><div class=\"bf-card\"><i class=\"bf-stave\"></i><p class=\"bf-txt\"></p><div class=\"bf-go\"></div></div></div>\n<div class=\"tobj\" id=\"obj-wave\"   data-asset=\"thomas_obj_wave_01.webp\"    style=\"display:none\">\n  <img alt=\"\">\n  <span class=\"lab\">the wave</span>\n</div>\n<div class=\"tobj\" id=\"obj-pacifier\" data-asset=\"thomas_obj_pacifier_01.webp\" style=\"display:none\">\n  <img alt=\"\">\n  <span class=\"lab\">the pacifier</span>\n</div>\n<div class=\"tobj\" id=\"obj-ring\" data-asset=\"thomas_obj_ring_01.webp\" style=\"display:none\">\n  <img alt=\"\">\n  <span class=\"lab\">the ring</span>\n</div>\n<div class=\"tobj\" id=\"obj-photo\" data-asset=\"thomas_obj_family_photo_01.webp\" style=\"display:none\">\n  <img alt=\"\">\n  <span class=\"lab\">the photograph</span>\n</div>\n<div id=\"flashback\"><div class=\"fb-card\" id=\"fb-card\"><div class=\"fb-cap\" id=\"fb-cap\"></div></div></div>\n<div id=\"memdim\" aria-hidden=\"true\"></div>\n<div id=\"spotlight\" aria-hidden=\"true\"></div>\n<div id=\"tvignette\" aria-hidden=\"true\"></div>\n<div id=\"carried\" aria-hidden=\"true\"><img alt=\"\"></div>\n<div id=\"whitefade\"></div>\n<div id=\"blackfade\"></div>\n<div id=\"staffwipe\" aria-hidden=\"true\"><canvas id=\"staffcv\"></canvas></div>\n";

let ROOT=null, _live=false, _armAudio=null;
const _iv=new Set(), _to=new Set(), _lis=[];
const _si=window.setInterval.bind(window), _st=window.setTimeout.bind(window);
const _ci=window.clearInterval.bind(window), _ct=window.clearTimeout.bind(window);
function setInterval(f,ms){ const id=_si(f,ms); _iv.add(id); return id; }
function setTimeout(f,ms){ const id=_st(f,ms); _to.add(id); return id; }
function clearInterval(id){ _iv.delete(id); return _ci(id); }
function clearTimeout(id){ _to.delete(id); return _ct(id); }
function addEventListener(type,fn,opts){ window.addEventListener(type,fn,opts); _lis.push([window,type,fn,opts]); }
function removeEventListener(type,fn,opts){
  window.removeEventListener(type,fn,opts);
  for(let i=_lis.length-1;i>=0;i--){ if(_lis[i][1]===type&&_lis[i][2]===fn) _lis.splice(i,1); }
}

'use strict';

const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,k)=>a+(b-a)*k;
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;
const TEST_BUILD = (typeof window.TEST_BUILD!=='undefined') ? window.TEST_BUILD : false;

const FILES = {
  bg_practice            : 'thomas_bg_practice_01.webp',
  bg_livingroom_sea      : 'thomas_bg_livingroom_sea_01.webp',
  bg_collapse            : 'thomas_bg_collapse_01.webp',
  bg_sea_sky             : 'thomas_bg_sea_sky_01 2.webp',
  harp_body_clean        : 'thomas_harp_body_clean_01.webp',
  harp_body_ruined       : 'thomas_harp_body_ruined_01.webp',
  score_father           : 'thomas_score_father_01.webp',
  score_ourstory_closed  : 'thomas_score_ourstory_closed_01.webp',
  score_ourstory_half    : 'thomas_score_ourstory_half_01.webp',
  score_ourstory_chaos   : 'thomas_score_ourstory_chaos_01.webp',
  score_crashed          : 'thomas_score_crash_01.webp',
  score_carried          : 'thomas_score_carried_01.webp',
  wife_notes             : 'thomas_wife_notes_01.webp',
  obj_wave               : 'thomas_obj_wave_01.webp',
  obj_pacifier           : 'thomas_obj_pacifier_01.webp',
  obj_ring               : 'thomas_obj_ring_01.webp',
  obj_family_photo       : 'thomas_obj_family_photo_01.webp',
  obj_metronome          : 'thoms_obj_metronome_01.webp',
  obj_clock              : 'thomas_obj_clock_01.webp',
  daughter_running       : 'thomas_daughter_running_01.webp',
  water_surface          : 'thomas_water_surface_01.webp',
  walk_01                : 'thomas_walking_into_sea_01.webp',
  walk_02                : 'thomas_walking_into_sea_02.webp',
  walk_03                : 'thomas_walking_into_sea_03.webp',
  walk_04                : 'thomas_walking_into_sea_04.webp',
  walk_05                : 'thomas_walking_into_sea_05.webp',
  anchor_father_teaching : 'thomas_anchor_father_teaching_01.webp',
  anchor_stage_father    : 'thomas_anchor_stage_father_01.webp',
  anchor_bow             : 'thomas_anchor_bow_01.webp',
  anchor_concert_wife    : 'thomas_anchor_concert_wife_01.webp',
  anchor_funeral         : 'thomas_anchor_funeral_01.webp',
  anchor_leaving_hall    : 'thomas_anchor_leaving_hall_01.webp',
  anchor_accident        : 'thomas_anchor_accident_01.webp',
  anchor_sea_pregnant    : 'thomas_anchor_sea_pregnant_01.webp',
  anchor_sea_daughter    : 'thomas_anchor_sea_daughter_01.webp',
  anchor_creating        : 'thomas_anchor_creating_01.webp',
  anchor_wife_face       : 'thomas_anchor_wife_face_01.webp',
  sky_father_rage        : 'thomas_sky_father_rage_01.webp',
  sky_wedding            : 'thomas_sky_wedding_01.webp',
  sky_wife_pregnant      : 'thomas_sky_wife_pregnant_01.webp',
  sky_daughter_lift      : 'thomas_sky_daughter_lift_01.webp',
  scratch_01             : 'thomas_scratch_01.webp',
  scratch_02             : 'thomas_scratch_02.webp',
  scratch_03             : 'thomas_scratch_03.webp',
  scratch_04             : 'thomas_scratch_04.webp'
};

const SKY_ORDER = [
  'sky_father_rage',
  'anchor_stage_father',
  'sky_wedding',
  'anchor_sea_pregnant',
  'sky_wife_pregnant',
  'sky_daughter_lift',
  'anchor_creating'
];

const SCRATCHES = ['scratch_01', 'scratch_02', 'scratch_03', 'scratch_04'];

const GROUPS = {
  stage1: ['bg_practice', 'harp_body_clean', 'score_father', 'obj_metronome', 'obj_clock',
           'anchor_father_teaching', 'anchor_stage_father', 'anchor_bow'],
  stage2: ['bg_livingroom_sea', 'score_ourstory_closed', 'score_ourstory_half', 'score_ourstory_chaos',
           'wife_notes', 'obj_wave', 'obj_pacifier', 'obj_ring', 'obj_family_photo', 'daughter_running',
           'anchor_sea_pregnant', 'anchor_sea_daughter', 'anchor_creating', 'anchor_concert_wife',
           'anchor_leaving_hall', 'anchor_accident'],
  stage3: ['bg_collapse', 'harp_body_clean', 'harp_body_ruined', 'score_crashed', 'score_father', 'score_carried',
           'score_ourstory_chaos', 'water_surface',
           'scratch_01', 'scratch_02', 'scratch_03', 'scratch_04',
           'anchor_wife_face', 'anchor_funeral', 'anchor_accident',
           'anchor_father_teaching', 'anchor_concert_wife', 'anchor_sea_daughter', 'anchor_creating'],
  ending: ['bg_sea_sky', 'walk_01', 'walk_02', 'walk_03', 'walk_04', 'walk_05', 'water_surface',
           'sky_father_rage', 'sky_wedding', 'sky_wife_pregnant', 'sky_daughter_lift',
           'anchor_stage_father', 'anchor_sea_pregnant', 'anchor_creating']
};

const BASES = window.THOMAS_IMG_BASE
  ? [window.THOMAS_IMG_BASE]
  : ['assets/img/', 'assets/thomas/', 'assets/', 'thomas/', 'assets/images/', 'images/', ''];

let BASE = BASES[0];
let probed = false;
let loading = null;

const img = {};
const absent = {};
const imgAlias = {};

function encPath(u){
  const i = u.lastIndexOf('/');
  const dir = i < 0 ? '' : u.slice(0, i + 1);
  const file = i < 0 ? u : u.slice(i + 1);
  return dir + encodeURIComponent(file);
}

function tryLoad(url){
  return new Promise(function(resolve){
    const im = new Image();
    im.onload = function(){ resolve(im.naturalWidth > 0 ? im : null); };
    im.onerror = function(){ resolve(null); };
    im.decoding = 'async';
    im.src = encPath(url);
  });
}

function imgNames(file){
  const out = [];
  const push = n => { if (n && out.indexOf(n) < 0) out.push(n); };
  const dot = file.lastIndexOf('.');
  const stem = file.slice(0, dot), ext = file.slice(dot);

  push(file);
  push(' ' + file);
  push(file + ' ');

  const forms = [stem, stem + '_2', stem.replace(/_/g, ' '), stem.replace(/ /g, '_')];
  if (stem.indexOf('thomas_') === 0) forms.push('thoms_' + stem.slice(7));
  if (stem.indexOf('thoms_') === 0) forms.push('thomas_' + stem.slice(6));
  if (stem.indexOf('_obj_') >= 0) forms.push(stem.replace('_obj_', '_object_'));
  if (stem.indexOf('_object_') >= 0) forms.push(stem.replace('_object_', '_obj_'));
  forms.slice().forEach(f => {
    const u = f.charAt(0).toUpperCase() + f.slice(1);
    if (u !== f) forms.push(u);
  });

  const exts = [ext, '.webp', '.png', '.WEBP', '.jpg', '.jpeg', '.PNG'];
  forms.forEach(f => exts.forEach(e => push(f + e)));
  forms.forEach(f => exts.forEach(e => { push(' ' + f + e); push(f + ' ' + e); }));
  return out;
}

function probeBase(){
  if (probed) return Promise.resolve(BASE);
  const cands = window.THOMAS_IMG_BASE
    ? [window.THOMAS_IMG_BASE].concat(BASES.filter(b => b !== window.THOMAS_IMG_BASE))
    : BASES.slice();
  const sentinels = ['bg_practice', 'harp_body_clean', 'water_surface', 'obj_clock'];
  let bi = 0;
  function nextBase(){
    if (bi >= cands.length){
      probed = true;

      return Promise.resolve(BASE);
    }
    const b = cands[bi++];
    const names = [];
    sentinels.forEach(k => { if (FILES[k]) imgNames(FILES[k]).forEach(n => names.push(n)); });
    let si = 0;
    function nextName(){
      if (si >= names.length) return nextBase();
      const n = names[si++];
      return tryLoad(b + n).then(function(im){
        if (im){
          BASE = b; probed = true;

          return BASE;
        }
        return nextName();
      });
    }
    return nextName();
  }
  return nextBase();
}

const GRADE = {
  target: 0.30, ceil: 0.50,
  tint: [0.86, 0.80, 0.72], tintAmt: 0.16,
  lift: 0.06, gamma: 1.04, grain: 0.030
};
const GRADE_EXEMPT = {
  sky_father_rage: 1, sky_wedding: 1, sky_wife_pregnant: 1, sky_daughter_lift: 1,
  anchor_stage_father: 1, anchor_sea_pregnant: 1, anchor_creating: 1
};
const GRADE_OFF = /[?&]nograde\b/.test(location.search);
const WIRE = /[?&]wire\b/.test(location.search);

const MATTE_SKIP = { bg_practice:1, bg_livingroom_sea:1, bg_collapse:1, bg_sea_sky:1 };
function matteEdge(g, w, h){
  let d;
  try { d = g.getImageData(0, 0, w, h); } catch (e){ return; }
  const px = d.data;
  const idx = (x, y) => (y * w + x) * 4;
  const corners = [[1,1],[w-2,1],[1,h-2],[w-2,h-2]];
  let cr = 0, cg = 0, cb = 0, cn = 0;
  for (const c of corners){
    const i = idx(c[0], c[1]);
    if (px[i+3] < 8) continue;
    cr += px[i]; cg += px[i+1]; cb += px[i+2]; cn++;
  }
  if (cn < 4) return;
  for (const c of corners){
    if (px[idx(c[0], c[1]) + 3] < 250) return;
  }
  cr /= cn; cg /= cn; cb /= cn;
  const lum = 0.299*cr + 0.587*cg + 0.114*cb;
  if (lum < 176) return;
  const TOL = 34;
  const near = i => Math.abs(px[i]-cr) < TOL && Math.abs(px[i+1]-cg) < TOL && Math.abs(px[i+2]-cb) < TOL;
  const seen = new Uint8Array(w * h);
  const qx = new Int32Array(w * h);
  let head = 0, tail = 0;
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const p = y * w + x;
    if (seen[p]) return;
    if (!near(p * 4)) return;
    seen[p] = 1; qx[tail++] = p;
  };
  for (let x = 0; x < w; x++){ push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++){ push(0, y); push(w - 1, y); }
  while (head < tail){
    const p = qx[head++];
    const x = p % w, y = (p / w) | 0;
    px[p * 4 + 3] = 0;
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }
  for (let y = 1; y < h - 1; y++){
    for (let x = 1; x < w - 1; x++){
      const p = y * w + x;
      if (seen[p]) continue;
      const i = p * 4;
      if (px[i+3] < 250) continue;
      let open = 0;
      if (seen[p-1]) open++;
      if (seen[p+1]) open++;
      if (seen[p-w]) open++;
      if (seen[p+w]) open++;
      if (open && near(i)) px[i+3] = 255 - open * 56;
    }
  }
  g.putImageData(d, 0, 0);
}
function gradeImage(im, key){
  if (GRADE_OFF || GRADE_EXEMPT[key]) return im;
  const w = im.naturalWidth || im.width, h = im.naturalHeight || im.height;
  if (!w || !h) return im;

  let sat = 1, warm = 0;
  try {
    const s = document.createElement('canvas');
    const sw = Math.max(1, Math.min(140, w)), sh = Math.max(1, Math.round(sw * h / w));
    s.width = sw; s.height = sh;
    const sg = s.getContext('2d', { willReadFrequently: true });
    sg.drawImage(im, 0, 0, sw, sh);
    const d = sg.getImageData(0, 0, sw, sh).data;
    let sum = 0, n = 0;
    for (let i = 0; i < d.length; i += 4){
      if (d[i + 3] < 128) continue;
      const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255;
      const mx = r > g ? (r > b ? r : b) : (g > b ? g : b);
      const mn = r < g ? (r < b ? r : b) : (g < b ? g : b);
      if (mx <= 0.12) continue;
      const v = (mx - mn) / mx;
      if (v <= 0.10) continue;
      sum += v; n++;
    }
    const measured = n ? sum / n : 0;
    if (measured > 0.01) sat = Math.max(0.35, Math.min(1, GRADE.target / measured));
    warm = GRADE.tintAmt;
  } catch (e){ return im; }

  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  if (typeof g.filter === 'string'){
    g.filter = 'saturate(' + sat.toFixed(3) + ') sepia(' + (warm * 0.9).toFixed(3) +
               ') brightness(' + (1 + GRADE.lift * 0.5).toFixed(3) +
               ') contrast(' + (1 - GRADE.lift * 0.4).toFixed(3) + ')';
  }
  g.drawImage(im, 0, 0, w, h);
  g.filter = 'none';
  if (!MATTE_SKIP[key] && w * h <= 6200000) matteEdge(g, w, h);
  c.naturalWidth = w; c.naturalHeight = h;
  return c;
}

function loadFlat(key){
  const names = imgNames(FILES[key]);
  let i = 0;
  function next(){
    if (i >= names.length){ absent[key] = true; return false; }
    const n = names[i++];
    return tryLoad(BASE + n).then(function(im){
      if (!im) return next();
      if (n !== FILES[key]) imgAlias[FILES[key]] = n;
      const gi = gradeImage(im, key);
      img[key] = gi;
      return true;
    });
  }
  return Promise.resolve().then(next);
}

const started = {};

function loadKeys(keys, onProgress){
  let done = 0;
  return probeBase().then(function(){
    const jobs = keys.map(function(k){
      if (started[k]) return started[k];
      const job = loadFlat(k);
      started[k] = job;
      return job.then(function(ok){
        done++;
        if (onProgress) onProgress(done / keys.length, k, ok);
        return ok;
      });
    });
    return Promise.all(jobs);
  }).then(function(){
    const miss = keys.filter(function(k){ return !img[k]; });
    return {
      base: BASE,
      total: keys.length,
      present: keys.length - miss.length,
      missing: miss
    };
  });
}

function preload(onProgress){
  if (loading) return loading;
  loading = loadKeys(Object.keys(FILES), onProgress);
  return loading;
}

function preloadStage(name, onProgress){
  const keys = GROUPS[name];
  if (!keys) return Promise.resolve({ base: BASE, total: 0, present: 0, missing: [] });
  return loadKeys(keys, onProgress);
}

function get(key){ return img[key] || null; }
function has(key){ return !!img[key]; }
const urlCache = {};
function urlOf(key){
  const o = img[key];
  if (!o) return null;
  if (o.src) return o.src;
  if (urlCache[key]) return urlCache[key];
  try { urlCache[key] = o.toDataURL('image/png'); } catch (e){ return null; }
  return urlCache[key];
}
function fileStem(f){
  const i = f.lastIndexOf('.');
  return (i < 0 ? f : f.slice(0, i)).toLowerCase().replace(/[^a-z0-9]/g, '');
}
function keyForFile(file){
  for (const k in FILES){ if (FILES[k] === file) return k; }
  const want = fileStem(file);
  for (const k in FILES){ if (fileStem(FILES[k]) === want) return k; }
  return null;
}
function urlForFile(file){
  const k = keyForFile(file);
  return k ? urlOf(k) : null;
}
function missing(){ return Object.keys(absent); }
function fileOf(key){ return FILES[key] || null; }

function draw(ctx, key, x, y, w, h){
  const im = img[key];
  if (!im) return false;
  ctx.drawImage(im, x, y, w, h);
  return true;
}

function cover(ctx, key, W, H, panX, panY){
  const im = img[key];
  if (!im) return false;
  const ar = im.naturalWidth / im.naturalHeight;
  const target = W / H;
  let dw, dh;
  if (ar > target){ dh = H; dw = H * ar; } else { dw = W; dh = W / ar; }
  const slackX = dw - W, slackY = dh - H;
  const ox = -slackX * (0.5 + (panX || 0) * 0.5);
  const oy = -slackY * (0.5 + (panY || 0) * 0.5);
  ctx.drawImage(im, ox, oy, dw, dh);
  return true;
}

function tileX(ctx, key, y, W, h, offset){
  const im = img[key];
  if (!im) return false;
  const ar = im.naturalWidth / im.naturalHeight;
  const w = h * ar;
  let x = -(((offset || 0) % w) + w) % w;
  while (x < W){ ctx.drawImage(im, x, y, w, h); x += w; }
  return true;
}

function coverMap(key, W, H, panX, panY, u, v){
  const im = img[key];
  if (!im) return { x: W * u, y: H * v };
  const ar = im.naturalWidth / im.naturalHeight;
  const target = W / H;
  let dw, dh;
  if (ar > target){ dh = H; dw = H * ar; } else { dw = W; dh = W / ar; }
  const ox = -(dw - W) * (0.5 + (panX || 0) * 0.5);
  const oy = -(dh - H) * (0.5 + (panY || 0) * 0.5);
  return { x: ox + dw * u, y: oy + dh * v };
}

function coverY(key, W, H, panY, v){
  const im = img[key];
  if (!im) return H * v;
  const ar = im.naturalWidth / im.naturalHeight;
  const target = W / H;
  const dh = (ar > target) ? H : (W / ar);
  const oy = -(dh - H) * (0.5 + (panY || 0) * 0.5);
  return oy + dh * v;
}

function skyMemoryImage(i){
  const key = SKY_ORDER[i];
  return key ? (img[key] || null) : null;
}

function scratchImage(i){ return img[SCRATCHES[i % SCRATCHES.length]] || null; }

const Assets = {
  preload: preload,
  preloadStage: preloadStage,
  groups: GROUPS,
  get: get,
  has: has,
  missing: missing,
  file: fileOf,
  url: urlOf,
  urlForFile: urlForFile,
  names: imgNames,
  base: function(){ return BASE; },
  bases: function(){ return BASES.slice(); },
  draw: draw,
  cover: cover,
  tileX: tileX,
  coverY: coverY,
  coverMap: coverMap,
  skyMemoryImage: skyMemoryImage,
  skyOrder: SKY_ORDER.slice(),
  scratchImage: scratchImage,
  manifest: FILES,
  base: function(){ return BASE; }
};

const A = function(){ return Assets; };

const VALUE = {
  stage1: { top: [141, 163, 178], mid: [110, 134, 151], bot: [78, 101, 119],
            dim: [ 62,  84, 100], dimBot: [ 40,  58,  72] },
  stage2: { top: [244, 223, 184], mid: [234, 195, 140], bot: [138, 104,  68],
            dim: [150, 128,  98], dimBot: [ 78,  62,  46] },
  stage3: { top: [ 26,  60,  84], mid: [ 19,  45,  66], bot: [ 12,  32,  49],
            dim: [  7,  28,  43], dimBot: [  2,  11,  20] },
  ending: { top: [201, 226, 240], mid: [141, 190, 217], bot: [ 96, 156, 190],
            dim: [201, 226, 240], dimBot: [ 96, 156, 190] }
};

const CARRIER = [6, 7, 9, 10];
const AMBER = [217, 131, 36];
const SILVER = [201, 216, 226];
const COLD = [96, 138, 162];

function mix(a, b, t){
  return [ (a[0] + (b[0] - a[0]) * t) | 0,
           (a[1] + (b[1] - a[1]) * t) | 0,
           (a[2] + (b[2] - a[2]) * t) | 0 ];
}

function rgb(c, a){
  return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a == null ? 1 : a) + ')';
}

const gradCache = {};

const defocusCache = {};
function defocused(key, im, px){
  const bucket = Math.round(px / 1.5) * 1.5;
  if (bucket < 0.8) return im;
  const ck = key + '@' + bucket;
  const hit = defocusCache[ck];
  if (hit) return hit;
  const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height;
  if (!iw || !ih) return im;
  const scale = Math.min(1, 1400 / iw);
  const cw = Math.max(2, Math.round(iw * scale)), ch = Math.max(2, Math.round(ih * scale));
  let c;
  try {
    c = document.createElement('canvas');
    c.width = cw; c.height = ch;
    const g = c.getContext('2d');
    if (!g) return im;
    g.filter = 'blur(' + (bucket * scale).toFixed(2) + 'px)';
    g.drawImage(im, 0, 0, cw, ch);
    g.filter = 'none';
  } catch (e){ return im; }
  for (const k in defocusCache){ if (k.indexOf(key + '@') === 0) delete defocusCache[k]; }
  defocusCache[ck] = c;
  return c;
}

function coverImage(ctx, im, W, H, panX, panY){
  const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height;
  if (!iw || !ih) return false;
  const ar = iw / ih, target = W / H;
  let dw, dh;
  if (ar > target){ dh = H; dw = H * ar; } else { dw = W; dh = W / ar; }
  const ox = -(dw - W) * (0.5 + (panX || 0) * 0.5);
  const oy = -(dh - H) * (0.5 + (panY || 0) * 0.5);
  ctx.drawImage(im, ox, oy, dw, dh);
  return true;
}

function background(ctx, scene, W, H, accord, panX, panY, blurPx){
  const a = A();
  const key = 'bg_' + (scene === 'ending' ? 'sea_sky'
                     : scene === 'stage1' ? 'practice'
                     : scene === 'stage2' ? 'livingroom_sea' : 'collapse');
  if (a && a.has(key)){
    if (blurPx > 0.8){
      coverImage(ctx, defocused(key, a.get(key), blurPx), W, H, panX, panY);
    }
    else a.cover(ctx, key, W, H, panX, panY);
    const t = 1 - accord;
    if (t > 0.01){
      ctx.fillStyle = 'rgba(8,28,44,' + (t * 0.55).toFixed(3) + ')';
      ctx.fillRect(0, 0, W, H);
    }
    return true;
  }

  const V = VALUE[scene] || VALUE.stage3;
  const bucket = Math.round(accord * 20);
  const ck = scene + '_' + bucket + '_' + Math.round(H);
  let g = gradCache[ck];
  if (!g){
    const t = 1 - bucket / 20;
    g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, rgb(mix(V.top, V.dim, t)));
    g.addColorStop(0.5, rgb(mix(V.mid, V.dim, t)));
    g.addColorStop(1, rgb(mix(V.bot, V.dimBot, t)));
    gradCache[ck] = g;
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  return false;
}

function harpBody(ctx, W, H, accord, ruin){
  const a = A();
  if (!a) return false;
  if (!a.has('harp_body_clean')) return false;
  a.cover(ctx, 'harp_body_clean', W, H, 0, -0.3);
  if (a.has('harp_body_ruined')){
    const k = Math.max(0, Math.min(1, ruin == null ? 0 : ruin));
    if (k > 0.01){
      const im = a.get('harp_body_clean');
      const ar = im.naturalWidth / im.naturalHeight;
      const target = W / H;
      let dw, dh;
      if (ar > target){ dh = H; dw = H * ar; } else { dw = W; dh = W / ar; }
      ctx.save();
      ctx.globalAlpha = k * k * (3 - 2 * k);
      ctx.translate(-RUINED_DU * dw, -RUINED_DV * dh);
      a.cover(ctx, 'harp_body_ruined', W, H, 0, -0.3);
      ctx.restore();
    }
  }
  return true;
}

function water(ctx, waterY, W, H, T, accord){
  if (waterY > H) return false;
  const g = ctx.createLinearGradient(0, waterY, 0, H);
  g.addColorStop(0, 'rgba(66,148,178,0.62)');
  g.addColorStop(0.28, 'rgba(30,96,132,0.84)');
  g.addColorStop(1, 'rgba(3,20,36,0.97)');
  ctx.fillStyle = g;
  ctx.fillRect(0, waterY, W, H - waterY);
  ctx.save();
  ctx.globalAlpha = 0.30;
  ctx.strokeStyle = 'rgba(150,206,232,0.5)';
  ctx.lineWidth = 1;
  for (let k = 1; k <= 7; k++){
    const yy = waterY + (H - waterY) * (k / 8);
    ctx.beginPath();
    for (let x = 0; x <= W; x += 16)
      ctx.lineTo(x, yy + Math.sin(x * 0.006 + T * 0.35 + k) * 5);
    ctx.stroke();
  }
  ctx.restore();

  const a = A();
  const skinH = Math.max(28, H * 0.055);
  if (a && a.has('water_surface')){
    a.tileX(ctx, 'water_surface', waterY - skinH * 0.55, W, skinH, T * 26);
    return true;
  }
  ctx.strokeStyle = 'rgba(207,227,236,0.35)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  for (let x = 0; x <= W; x += 14){
    const y = waterY + Math.sin(x * 0.02 + T * 1.4) * 4;
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
  return false;
}

function stringColour(id, isLandmark, state, accord){
  const carrier = CARRIER.indexOf(id) >= 0;
  const lucid = document.body.classList.contains('lucid');
  const tarnish = lucid ? 0 : 1 - accord;
  const held = carrier ? Math.max(0, 1 - tarnish * 0.28) : 1 - tarnish * 0.78;
  const base = carrier ? AMBER : (isLandmark ? AMBER : SILVER);
  const c = mix(base, COLD, 1 - held);
  let alpha = state === 'drowned' ? 0.28 : state === 'slack' ? 0.62 : 0.88;
  if (carrier) alpha = Math.min(1, alpha + 0.12);
  if (lucid) alpha = Math.min(1, alpha + 0.10);
  return { c: c, alpha: alpha, carrier: carrier, weight: carrier ? 2.8 : (isLandmark ? 2.4 : 1.6) };
}

function carrierHalo(ctx, s, accord, T){
  if (CARRIER.indexOf(s.id) < 0) return;
  const strength = (1 - accord) * 0.5;
  if (strength < 0.06) return;
  const pulse = 0.6 + 0.4 * Math.sin(T * 1.4 + s.id);
  ctx.strokeStyle = 'rgba(226,150,58,' + (strength * pulse * 0.30).toFixed(3) + ')';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(s.xTop != null ? s.xTop : s.x, s.yTop);
  ctx.lineTo(s.xBot != null ? s.xBot : s.x, s.yBot);
  ctx.stroke();
}

function drawSkyMemory(ctx, i, x, y, w, h, alpha){
  const a = A();
  if (a && a.has(a.skyOrder[i])){
    ctx.globalAlpha = alpha;
    const im = a.get(a.skyOrder[i]);
    const ar = im.naturalWidth / im.naturalHeight;
    let dw = w, dh = w / ar;
    if (dh > h){ dh = h; dw = h * ar; }
    ctx.drawImage(im, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    ctx.globalAlpha = 1;
    return true;
  }
  ctx.fillStyle = 'rgba(250,240,222,' + (0.30 * alpha).toFixed(3) + ')';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(226,150,58,' + (0.88 * alpha).toFixed(3) + ')';
  ctx.lineWidth = 1.6;
  ctx.strokeRect(x, y, w, h);
  return false;
}

function drawScratchImage(ctx, i, x, y, w, h, alpha){
  const a = A();
  const im = a ? a.scratchImage(i) : null;
  if (im){
    ctx.globalAlpha = alpha;
    ctx.drawImage(im, x, y, w, h);
    ctx.globalAlpha = 1;
    return true;
  }
  return false;
}

function stageAssets(scene){
  const a = A();
  if (!a || !a.preloadStage) return Promise.resolve(null);
  return a.preloadStage(scene).then(function(r){
    if (r && r.missing && r.missing.length && /[?&]debug\b/.test(location.search)){

    }
    return r;
  });
}

const Render = {
  background: background,
  harpBody: harpBody,
  water: water,
  stringColour: stringColour,
  carrierHalo: carrierHalo,
  drawSkyMemory: drawSkyMemory,
  drawScratchImage: drawScratchImage,
  coverY: function(key,W,H,panY,v){ const a=A(); return a?a.coverY(key,W,H,panY,v):H*v; },
  coverMap: function(key,W,H,panX,panY,u,v){ const a=A(); return a?a.coverMap(key,W,H,panX,panY,u,v):{x:W*u,y:H*v}; },
  stageAssets: stageAssets,
  carrier: CARRIER.slice(),
  value: VALUE,
  defocus: function(scene){
    const acc = clamp(thomasState.accord, 0, 1);
    if (scene === 'ending') return 0;
    if (scene === 'stage1') return 2.6;
    if (scene === 'stage2') return lerp(3.2, 9, 1 - acc);
    return lerp(6, 17, 1 - acc);
  },
  resetCache: function(){
    for (const k in gradCache) delete gradCache[k];
    for (const k in defocusCache) delete defocusCache[k];
  }
};

const RECAP_STAGE = (function(){
  var h = (location.hash||'').replace(/^#\/?/,'');
  return ({stage1:'stage1',stage2:'stage2',stage3:'stage3',ending:'ending'})[h] || null;
})();
const TEST_STAGE = (typeof window.TEST_STAGE!=='undefined') ? window.TEST_STAGE : RECAP_STAGE;

const DEBUG = /[?&]debug\b/.test(location.search);

const AUDIO_BASE = window.THOMAS_AUDIO_BASE || 'assets/audio/';

const AUDIO = {
  s1_bed           : 'Room + Clock + Metronome.mp3',
  clock            : 'Clock Ticking.mp3',
  room_empty       : 'Empty Room Ambient Noise Sound Effect.mp3',
  applause         : 'Applause Normal.mp3',
  applause_dying   : 'Applause Dying.mp3',
  room_to_beach    : 'Room sound then beach sound.mp3',
  livingroom       : 'Living Room Sound.mp3',
  laughing         : 'Laughing.mp3',
  book_open        : 'Book Open SFX.mp3',
  book_close       : 'Book Close SFX.mp3',
  obj_fall         : 'Object Falling Down.mp3',
  obj_land         : 'Object Landing Soft.mp3',
  shore_harp       : 'Shore and Harp Together.mp3',
  ourstory_true    : 'Our Story (All 4 Parts).mp3',
  ourstory_wrong   : 'Our Story (Terribly Wrong Version).mp3',
  stem_wave        : 'The Wave (Pad).mp3',
  stem_child       : 'The Pink Dummy (Daughter).mp3',
  stem_harmony     : 'The Wedding Ring (Wife Harmony).mp3',
  stem_melody      : 'The Family Photo (Main Melody).mp3',
  funeral          : 'Thomas Funeral Song.mp3',
  sea_rising       : 'Sea Waves.mp3',
  elegy            : 'Music Elegy Fragment (Final Scene Thomas Playing The Melody).mp3',
  interweave       : 'Fire, Writing, Crash, Funeral Song, Voicelines etc. together.mp3',
  glass_break      : 'mirror break sound.mp3',
  crash_hit        : 'car crash (red doll).mp3',
  ambulance        : 'ambulance crying.mp3',
  voices_together  : 'Voicelines At The Same Time Wife, Father, Child .mp3',
  ending_destroyed : 'Ending Destroyed (Chaotic).mp3',
  strings_all_snap : 'All Strings Snap.mp3',
  etude            : 'Father\'s Etude (Upbeat).mp3',
  note_C           : 'Harp Note C.mp3',
  note_Cs          : 'Harp Note C sharp.mp3',
  note_D           : 'Harp Note D.mp3',
  note_Ds          : 'Harp Note D sharp.mp3',
  note_E           : 'Harp Note E.mp3',
  note_F           : 'Harp Note F.mp3',
  note_Fs          : 'Harp Note F sharp.mp3',
  note_G           : 'Harp Note G.mp3',
  note_Gs          : 'Harp Note G sharp.mp3',
  note_A           : 'Harp Note A.mp3',
  note_As          : 'Harp Note A sharp.mp3',
  note_B           : 'Harp Note B.mp3',
  note_cut         : 'Harp A Note Cut Short.mp3',
  slack            : 'Harp String Slack.mp3',
  snap01           : 'Harp String Break 1.mp3',
  snap02           : 'Harp String Break 2.mp3',
  snap03           : 'Harp String Break 3.mp3',
  scrape01         : 'Harp String Scrape 1.mp3',
  scrape02         : 'Harp String Scrape 2.mp3',
  scrape03         : 'Harp String Scrape 3.mp3'
};

const NORM={
  note_C:5.0, note_Cs:4.6, note_D:6.5, note_Ds:4.5, note_E:6.0, note_F:6.6,
  note_Fs:6.2, note_G:7.2, note_Gs:8.4, note_A:6.9, note_As:9.0, note_B:6.9,
  note_cut:5.3, slack:3.4, snap01:1.15, snap02:1.10, snap03:1.0,
  scrape01:11.0, scrape02:13.0, scrape03:10.5
};

const PC=['C','Cs','D','Ds','E','F','Fs','G','Gs','A','As','B'];
const SAMPLE_HZ={
  C:262.03, Cs:277.47, D:293.99, Ds:311.40, E:329.96, F:349.61,
  Fs:370.32, G:392.25, Gs:415.70, A:440.25, As:466.41, B:493.96
};
const NOTE_CUT_HZ=330.30;

const VO_FILES = {
  vo_s1_kid        : 'boy 2.m4a',
  vo_s1_5678       : 'Stage 1 5,6,7,8.m4a',
  vo_s1_better     : 'Thomas-stage 1 daddy_ you can do it better.m4a',
  vo_s1_startagain : 'Stage 1 start again.m4a',
  vo_wife_great    : 'Wife_ this is great- 2.m4a',
  vo_s2_doitagain  : 'Stage 2 no do it again.m4a',
  vo_kid_stay      : 'boy 2.m4a',
  vo_s3_again      : 'Stage 3 again! Again! Again!.m4a',
  vo_s3_nostop     : 'Stage 3 no stop!.m4a',
  vo_kid_greatjob  : 'boy 2.m4a',
  vo_wife_comebaby : 'Wife_ come baby…-1.m4a',
  vo_s3_thomas     : 'Stage 3 thomas line.m4a',
  vo_end_daddy     : 'Ending daddy line.m4a',
  vo_kid_story     : 'boy 2.m4a',
  vo_end_thomas    : 'Ending thomas line.m4a',
  vo_end_wife_yes  : 'yes I do -3.m4a'
};

const VO_TEXT_ONLY={};

const VO_GAIN={
  vo_s1_kid:1.40, vo_s1_5678:0.98, vo_s1_better:0.93, vo_s1_startagain:1.00,
  vo_wife_great:7.00, vo_s2_doitagain:1.75, vo_kid_stay:1.40,
  vo_s3_again:0.85, vo_s3_nostop:0.81, vo_kid_greatjob:1.40,
  vo_wife_comebaby:3.40, vo_s3_thomas:5.90,
  vo_end_daddy:1.16, vo_kid_story:1.40, vo_end_thomas:7.70,
  vo_end_wife_yes:5.70
};

const VO_CLIP={
  vo_s1_kid       :[ 0.10, 2.70],
  vo_kid_stay     :[10.00,13.00],
  vo_kid_greatjob :[14.00,16.00],
  vo_kid_story    :[17.00,21.00]
};

const VO_TONE={
  vo_s3_again:7.0, vo_s1_5678:7.0, vo_s1_startagain:7.0, vo_s1_better:7.0,
  vo_s3_nostop:7.0, vo_s2_doitagain:5.8, vo_s1_kid:4.2, vo_end_thomas:4.4,
  vo_kid_stay:4.2, vo_kid_greatjob:4.2, vo_kid_story:4.2,
  vo_s3_thomas:2.3, vo_end_wife_yes:1.7
};

const VO_LINE={
  'daddy, can you teach me this?'         : 'vo_s1_kid',
  '5, 6, 7, 8'                            : 'vo_s1_5678',
  'you can do it better.'                 : 'vo_s1_better',
  'start again'                           : 'vo_s1_startagain',
  'I think this is great.'                : 'vo_wife_great',
  'No, do it again'                       : 'vo_s2_doitagain',
  'papa, can you please stay with me?'    : 'vo_kid_stay',
  'again! again! again!'                  : 'vo_s3_again',
  'no. Stop!'                             : 'vo_s3_nostop',
  "papa, you're doing a great job!"       : 'vo_kid_greatjob',
  'come baby. 1, 2, 3, 4! You did it!'    : 'vo_wife_comebaby',
  'honey, no worries, try it again.'      : 'vo_s3_thomas',
  'do you think you are good enough? No!' : 'vo_end_daddy',
  'papa, can you tell me a story tonight?': 'vo_kid_story',
  'Thanks Darling, love you.'             : 'vo_end_thomas',
  'Yes, I do.'                            : 'vo_end_wife_yes'
};

const voSpan={};

const AUDIO_TODO = {
  harp_low_octave : 'Harp_Note_C3 ... B3 (one octave below what is delivered)'
};

const abuf={}, aFail={}, aJob={}, warned={};
function todoWarn(name){
  if(!DEBUG||warned[name])return; warned[name]=true;

}
function spanOf(buf){
  const d=buf.getChannelData(0), sr=buf.sampleRate;
  const h=Math.max(1,Math.round(sr*0.01));
  const nb=Math.floor(d.length/h);
  const env=new Float32Array(nb);
  let peak=0;
  for(let b=0;b<nb;b++){
    let m=0;
    const s0=b*h, s1=s0+h;
    for(let i=s0;i<s1;i++){ const v=d[i]<0?-d[i]:d[i]; if(v>m)m=v; }
    env[b]=m; if(m>peak)peak=m;
  }
  const thr=Math.max(peak*0.06,0.004);
  let first=-1,last=-1;
  for(let b=0;b<nb;b++){ if(env[b]>thr){ if(first<0)first=b; last=b; } }
  if(first<0) return {lead:0,end:buf.duration};
  return { lead:Math.max(0,first*0.01-0.05),
           end:Math.min(buf.duration,(last+1)*0.01+0.12) };
}
const audioAlias={};
function audioNames(file){
  const out=[];
  const push=n=>{ if(n && out.indexOf(n)<0) out.push(n); };
  const dot=file.lastIndexOf('.');
  const stem=file.slice(0,dot), ext=file.slice(dot);
  const exts=[ext,'.mp3','.wav','.m4a','.ogg'];

  const sharp=/_$/.test(stem);
  const core=sharp?stem.replace(/_$/,''):stem;
  const suffix=sharp?'#':'';
  const spaced=core.replace(/_/g,' ').replace(/\s+/g,' ').trim()+suffix;
  const apos=core.replace(/_s_/g,"'s ").replace(/_/g,' ').replace(/\s+/g,' ').trim()+suffix;
  const paren=core
    .replace(/_s_/g,"'s ")
    .replace(/__([^_]+)__$/,' ($1)')
    .replace(/__([^_]+)_$/,' ($1)')
    .replace(/__([^_]+)__/g,' ($1) ')
    .replace(/_/g,' ')
    .replace(/\s+/g,' ')
    .replace(/\s+\)/g,')')
    .trim()+suffix;
  const plus=core.replace(/___/g,' + ').replace(/_/g,' ').replace(/\s+/g,' ').trim()+suffix;
  const tight=sharp?(core.replace(/_+/g,'_')+'#'):stem.replace(/_+/g,'_');
  const under=core.replace(/\s+/g,'_')+suffix;
  const clean=core.replace(/[?#]/g,'')+suffix;
  const q=core.replace(/\)/,'?)')+suffix;

  [stem,paren,apos,plus,spaced,tight,under,clean,q].forEach(base=>{
    exts.forEach(e=>push(base+e));
  });
  return out;
}

function decodeAudio(key){
  if(abuf[key]) return Promise.resolve(abuf[key]);
  if(aJob[key]) return aJob[key];
  const file=AUDIO[key]||VO_FILES[key];
  if(!file){ aFail[key]=true; todoWarn(key); return Promise.resolve(null); }
  if(!ctx) return Promise.resolve(null);
  const names=audioNames(file);
  let i=0;
  const attempt=()=>{
    if(i>=names.length){
      aFail[key]='not found';
      delete aJob[key];

      return null;
    }
    const n=names[i++];
    return fetch(AUDIO_BASE+encodeURIComponent(n))
      .then(r=>{ if(!r.ok) throw new Error('HTTP '+r.status); return r.arrayBuffer(); })
      .then(b=>new Promise((res,rej)=>ctx.decodeAudioData(b,res,rej)))
      .then(buf=>{ abuf[key]=buf;
        if(n!==file) audioAlias[file]=n;
        if(VO_FILES[key]){ try{ voSpan[key]=spanOf(buf); }
          catch(e){ voSpan[key]={lead:0,end:buf.duration}; } }
        return buf; })
      .catch(()=>attempt());
  };
  aJob[key]=Promise.resolve().then(attempt);
  return aJob[key];
}
function loadAudio(keys){ return Promise.all(keys.map(decodeAudio)); }

const buses={};
const BUS_DUCK={ music:0.55, amb:0.55, harp:1.0, sfx:0.6, vo:1.0 };
const BUS_SCENE={
  stage2: { music:0.45, amb:0.45, sfx:0.5, harp:1.0, vo:1.0 },
  stage3: { music:0.42, amb:0.42, sfx:0.5, harp:1.0, vo:1.0 }
};
function applyBusScene(scene){
  if(!ctx) return;
  const tune=BUS_SCENE[scene]||{};
  Object.keys(buses).forEach(name=>{
    const g=buses[name];
    if(!g) return;
    const base=(BUS_DUCK[name]==null?1:BUS_DUCK[name]);
    const k=(tune[name]==null?base:tune[name]);
    try{
      const T=ctx.currentTime;
      g.gain.cancelScheduledValues(T);
      g.gain.setValueAtTime(g.gain.value,T);
      g.gain.linearRampToValueAtTime(k,T+0.9);
    }catch(e){ g.gain.value=k; }
  });
}
function bus(name,vol){
  if(buses[name]) return buses[name];
  const base=(vol==null?1:vol);
  const k=(BUS_DUCK[name]==null?1:BUS_DUCK[name]);
  const g=ctx.createGain(); g.gain.value=base*k;
  g.connect(masterBus); buses[name]=g; return g;
}
const loops={};
function playBuf(key,opt){
  opt=opt||{};
  if(!ctx) return null;
  const buf=abuf[key];
  if(!buf){ todoWarn(key); return null; }
  const src=ctx.createBufferSource(); src.buffer=buf;
  src.loop=!!opt.loop;
  if(opt.rate) src.playbackRate.value=opt.rate;
  const g=ctx.createGain();
  const target=(opt.gain==null?1:opt.gain);
  const when=opt.when||ctx.currentTime;
  const fade=opt.fade||0;
  if(fade>0){ g.gain.setValueAtTime(0.0001,when);
    g.gain.linearRampToValueAtTime(target,when+fade); }
  else g.gain.setValueAtTime(target,when);
  src.connect(g); g.connect(opt.node||bus(opt.bus||'sfx'));
  if(opt.offset) src.start(when,opt.offset); else src.start(when);
  return {src:src,gain:g};
}
function loopBuf(name,key,opt){
  if(loops[name]) return loops[name];
  const v=playBuf(key,Object.assign({loop:true},opt||{}));
  if(v) loops[name]=v;
  return v;
}
function stopLoop(name,fade){
  const v=loops[name]; if(!v)return;
  const T=ctx.currentTime, f=(fade==null?0.8:fade);
  try{
    v.gain.gain.cancelScheduledValues(T);
    v.gain.gain.setValueAtTime(v.gain.gain.value,T);
    v.gain.gain.linearRampToValueAtTime(0.0001,T+f);
    v.src.stop(T+f+0.05);
  }catch(e){}
  delete loops[name];
}

let MEM_LOCK=false;
let s1MemEls=[], s1MemDone=[];
const thomasState={
  scene:'entry', sub:null,
  accord:1.0,
  bpm:128,
  strings:[], score:{filled:[],scratched:[],mode:'father'},
  objects:{placed:[],fallen:[]},
  water:0, lucidFired:false,
  pluckLog:[],
};
const ANCHORS={ stage1:{start:0.90,end:0.80},
                stage2:{start:0.60,end:0.45},
                stage3:{start:0.30,end:0.00} };
function accordAt(scene,p){ const A=ANCHORS[scene]; return A.start+(A.end-A.start)*clamp(p,0,1); }

const FLOOR_K=2.6, VEL_K=1.4, V_MAX=2600, MAX_OFFSET=3;
let everPlucked=false;
function driftAt(accord,sweep){
  const floor=FLOOR_K*(1-accord);
  const vel=VEL_K*clamp(sweep/V_MAX,0,1);
  return floor+vel;
}
function detuneAt(accord){ return (1-accord)*(1-accord)*90; }
const BEAT_REF=72;
function beatScale(){ return BEAT_REF/thomasState.bpm; }
function scratchRate(accord){ return accord>0.35?0:lerp(0.35,1.0,(0.35-accord)/0.35); }
function coldness(accord){ return 1-accord; }

let t=0, dt=1/60, lastNow=performance.now();
const cam={zoom:1,tz:1,tilt:0,ttilt:0};
function punchIn(z,hold=2600){ cam.tz=z; setTimeout(()=>{cam.tz=1;},hold); }
let mpx=innerWidth/2, mpy=innerHeight/2, pmx=mpx, pmy=mpy, pv=0;
function bindPointer(){
  addEventListener('pointermove',e=>{ mpx=e.clientX; mpy=e.clientY;
    const f=$('finger'); if(!f) return;
    f.style.left=mpx+'px'; f.style.top=mpy+'px'; });
}
function updateFingerCursor(){
  const f=$('finger'); if(!f) return;
  const d=1-clamp(thomasState.accord,0,1);
  const L=(a,b)=>Math.round(a+(b-a)*d);
  const mr=L(255,150), mg=L(236,166), mb=L(200,178);
  const er=L(217,120), eg=L(131,140), eb=L(36,158);
  f.style.background='radial-gradient(circle,#fff 0%,rgba('+mr+','+mg+','+mb+',0.9) 30%,rgba('+er+','+eg+','+eb+',0.35) 70%,transparent 100%)';
  f.style.boxShadow='0 0 14px rgba('+mr+','+mg+','+mb+',0.6),0 0 34px rgba('+er+','+eg+','+eb+',0.3)';
}

let ctx=null, masterBus=null, lowpass=null, limiter=null, analyser=null, anaBuf=null;
let seaGainNode=null;
const voices=[]; const MAX_VOICES=8;
const N=21;

const FREQS=[130.81,146.83,164.81,174.61,196.00,220.00,233.08,261.63,293.66,329.63,349.23,392.00,440.00,466.16,523.25,587.33,659.25,698.46,783.99,880.00,932.33];
const NOTE_PC=['C','D','E','F','G','A','As','C','D','E','F','G','A','As','C','D','E','F','G','A','As'];
function sampleKeyFor(noteIdx){ return 'note_'+NOTE_PC[noteIdx]; }
function rateFor(noteIdx){
  const base=SAMPLE_HZ[NOTE_PC[noteIdx]];
  return base?FREQS[noteIdx]/base:1;
}

function initAudio(){
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return;
  try{ ctx=new AC(); }catch(err){ ctx=null; return; }
  masterBus=ctx.createGain(); masterBus.gain.value=0.9;
  lowpass=ctx.createBiquadFilter(); lowpass.type='lowpass'; lowpass.frequency.value=20000;
  analyser=ctx.createAnalyser(); analyser.fftSize=512;
  anaBuf=new Uint8Array(analyser.fftSize);
  limiter=ctx.createDynamicsCompressor();
  limiter.threshold.value=-12; limiter.knee.value=6; limiter.ratio.value=4;
  limiter.attack.value=0.004; limiter.release.value=0.18;
  masterBus.connect(limiter); limiter.connect(lowpass);
  lowpass.connect(analyser); analyser.connect(ctx.destination);
  if(ctx.state==='suspended'){ try{ ctx.resume(); }catch(e){} }

  seaGainNode=ctx.createGain(); seaGainNode.gain.value=0;
  seaGainNode.connect(masterBus);
  loadAudio(PC.map(n=>'note_'+n).concat(
    ['note_cut','slack','snap01','snap02','snap03','scrape01','scrape02','scrape03'],
    Object.keys(VO_FILES)));
  startScheduler();
}

const SFX={
  applause      :{key:'applause',      gain:0.75},
  applause_dying:{key:'applause_dying',gain:0.75},
  book_open     :{key:'book_open',     gain:0.85},
  book_close    :{key:'book_close',    gain:0.85},
  obj_fall      :{key:'obj_fall',      gain:0.7},
  obj_land      :{key:'obj_land',      gain:0.8},
  laughing      :{key:'laughing',      gain:0.5},
  clock         :{key:'clock',         gain:0.4}
};

const Sound={
  playNote(noteIdx,opts={}){
    if(!ctx)return;
    const slack=!!opts.slack;
    const key=slack?'slack':sampleKeyFor(noteIdx);
    const buf=abuf[key];
    if(!buf){ todoWarn(key); return; }
    if(voices.length>=MAX_VOICES){
      const old=voices.shift();
      try{ old.g.gain.cancelScheduledValues(ctx.currentTime);
        old.g.gain.linearRampToValueAtTime(0,ctx.currentTime+0.02);
        old.s.stop(ctx.currentTime+0.03);}catch(e){}
      Sound.steal(noteIdx);
    }
    const cents=opts.detune||0;
    const rate=(slack?FREQS[noteIdx]/(SAMPLE_HZ[NOTE_PC[noteIdx]]*4):rateFor(noteIdx))
               *Math.pow(2,cents/1200);
    const s=ctx.createBufferSource(); s.buffer=buf;
    s.playbackRate.value=slack?clamp(rate,0.4,2.2):rate;
    const g=ctx.createGain();
    const vol=(opts.gain!=null?opts.gain:0.7)*(NORM[key]||1)*0.16;
    const T=ctx.currentTime, fd=opts.fade||0;
    if(fd>0){ g.gain.setValueAtTime(0.0001,T); g.gain.linearRampToValueAtTime(vol,T+fd); }
    else g.gain.setValueAtTime(vol,T);
    let tail=g;
    if(opts.pan!=null){
      try{
        const pn=ctx.createStereoPanner();
        pn.pan.setValueAtTime(clamp(opts.pan,-1,1),T);
        g.connect(pn); tail=pn;
      }catch(e){}
    }
    tail.connect(bus('harp'));
    s.connect(g);
    s.start();
    const v={s:s,g:g}; voices.push(v);
    s.onended=()=>{ const i=voices.indexOf(v); if(i>=0)voices.splice(i,1); };
  },
  steal(noteIdx){
    const buf=abuf['note_cut'];
    if(!buf){ todoWarn('note_cut'); return; }
    const s=ctx.createBufferSource(); s.buffer=buf;
    s.playbackRate.value=clamp(FREQS[noteIdx]/NOTE_CUT_HZ,0.4,2.2);
    const g=ctx.createGain(); g.gain.value=(NORM.note_cut||1)*0.09;
    s.connect(g); g.connect(bus('harp')); s.start();
  },
  scrape(intensity){
    if(thomasState.scene==='stage3'&&s3Phase()<3) intensity=(intensity||1)*0.42;
    const n=1+Math.floor(Math.random()*3);
    const key='scrape0'+n;
    if(!abuf[key]){ todoWarn(key); return; }
    playBuf(key,{gain:(NORM[key]||1)*0.05*clamp(intensity==null?1:intensity,0.3,1.6),
                 bus:'harp', rate:0.9+Math.random()*0.35});
  },
  snap(){
    const n=1+Math.floor(Math.random()*3);
    const key='snap0'+n;
    if(!abuf[key]){ todoWarn(key); return; }
    playBuf(key,{gain:(NORM[key]||1)*0.5,bus:'harp',rate:0.92+Math.random()*0.2});
  },
  allSnap(){
    if(abuf['strings_all_snap']){ playBuf('strings_all_snap',{gain:0.85,bus:'harp'}); return; }
    let any=false;
    for(let i=1;i<=3;i++){
      const key='snap0'+i;
      if(!abuf[key]) continue;
      any=true;
      for(let r=0;r<3;r++){
        playBuf(key,{gain:(NORM[key]||1)*0.34,bus:'harp',
          rate:0.7+Math.random()*0.7,
          when:ctx.currentTime+Math.random()*2.2});
      }
    }
    if(!any) todoWarn('snap01');
  },
  play(name){
    if(!ctx)return;
    const real=SFX[name];
    if(real){
      if(abuf[real.key]){ playBuf(real.key,{gain:real.gain}); return; }
      decodeAudio(real.key).then(b=>{ if(b) playBuf(real.key,{gain:real.gain}); });
      return;
    }
    todoWarn(name);
  },
  playVO(line){
    if(VO_TEXT_ONLY[line]) return 0;
    if(thomasState.scene==='stage3' && s3.mixed){
      const k0=VO_LINE[line], b0=k0?abuf[k0]:null;
      const w=b0?(voSpan[k0]||{lead:0,end:b0.duration}):null;
      return w?Math.max(200,(w.end-w.lead)*1000):2600;
    }
    const key=VO_LINE[line];
    if(!key){ return 0; }
    const buf=abuf[key];
    if(!buf){ todoWarn(key); return 0; }
    const clip=VO_CLIP[key];
    const sp=clip?{lead:clip[0],end:clip[1]}:(voSpan[key]||{lead:0,end:buf.duration});
    const cut=VO_TONE[key]||0;
    const src=ctx.createBufferSource(); src.buffer=buf;
    const g=ctx.createGain();
    g.gain.value=(VO_GAIN[key]||1)*0.42*(1+cut*0.035);
    let tail=g;
    if(cut>0.2){
      const hs=ctx.createBiquadFilter();
      hs.type='highshelf'; hs.frequency.value=3200; hs.gain.value=-cut;
      const ls=ctx.createBiquadFilter();
      ls.type='lowshelf'; ls.frequency.value=240; ls.gain.value=Math.min(4,cut*0.55);
      g.connect(hs); hs.connect(ls); tail=ls;
    }
    src.connect(g); tail.connect(bus('vo'));
    const span=Math.max(0.2,sp.end-sp.lead);
    src.start(ctx.currentTime,sp.lead,clip?span:undefined);
    if(clip){ try{ src.stop(ctx.currentTime+span+0.05); }catch(e){} }
    return span*1000;
  },
  setDepth(accord){ if(!lowpass)return;
    if(thomasState.scene!=='stage3')
      lowpass.frequency.value=lerp(4200,20000,accord);
  },
};

let schedTimer=null; const beatFns=[];
function startScheduler(){
  const beat=60/thomasState.bpm;
  let next=ctx.currentTime+beat;
  schedTimer=setInterval(()=>{
    while(next<ctx.currentTime+0.1){
      for(const f of beatFns) f(next);
      next+=beat;
    }
  },40);
}
function onBeat(f){ beatFns.push(f); }

let subTimer=null, capTimer=null;
let voFloat=[];
function voOverlap(who,line,dur){
  const host=document.getElementById('thomas-root')||document.body;
  while(voFloat.length>=2){
    const old=voFloat.shift();
    if(old&&old.parentNode) old.remove();
  }
  const d=document.createElement('div');
  const ox=(Math.random()-0.5)*280, oy=(Math.random()-0.5)*90, op=0.4+Math.random()*0.5;
  d.style.cssText='position:fixed;left:50%;bottom:'+(9+Math.random()*8)+'%;transform:translateX(-50%) translate('+ox+'px,'+oy+'px);z-index:41;max-width:620px;text-align:center;pointer-events:none;font-family:var(--lora,serif);font-style:italic;font-size:'+(15+Math.random()*8).toFixed(0)+'px;line-height:1.6;color:var(--paper,#EAF2F6);text-shadow:0 2px 18px rgba(2,8,14,0.95);opacity:0;transition:opacity 0.12s linear';
  d.innerHTML=(who?'<span style="display:block;font-family:var(--mono,monospace);font-style:normal;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(217,131,36,0.85);margin-bottom:6px;">'+who+'</span>':'')+line;
  host.appendChild(d);
  voFloat.push(d);
  requestAnimationFrame(()=>{ d.style.opacity=op.toFixed(2); });
  setTimeout(()=>{ d.style.opacity='0';
    setTimeout(()=>{ const i=voFloat.indexOf(d); if(i>=0) voFloat.splice(i,1);
      if(d.parentNode) d.remove(); },420); }, dur);
}
function VO(who,line,dur=3400){
  const spoken=Sound.playVO(line);
  if(!spoken && VO_LINE[line] && !VO_TEXT_ONLY[line]) return;
  const hold=spoken?spoken:dur;
  const fb=$('flashback');
  if(fb&&fb.classList.contains('on')){
    const cap=$('fb-cap');
    if(cap){
      cap.innerHTML=(who?'<span class="who">'+who+'</span>':'')+line;
      clearTimeout(capTimer);
      capTimer=setTimeout(()=>{ const c=$('fb-cap'); if(c) c.textContent=''; },hold);
    }
    return;
  }
  if(thomasState.scene==='stage3'||s2.driftPhase){ voOverlap(who,line,hold); return; }
  const el=$('subs');
  el.innerHTML=(who?`<span class="who">${who}</span>`:'')+line;
  el.classList.add('on');
  clearTimeout(subTimer);
  subTimer=setTimeout(()=>el.classList.remove('on'),hold);
}

let threeRenderer,threeScene,threeCam,bgPlanes=[];
function initThree(){
  if(typeof THREE==='undefined')return;
  try{ threeRenderer=new THREE.WebGLRenderer({alpha:true,antialias:true}); }
  catch(e){ threeRenderer=null; return; }
  threeRenderer.setPixelRatio(Math.min(devicePixelRatio,2));
  threeRenderer.setSize(innerWidth,innerHeight);
  $('three-bg').appendChild(threeRenderer.domElement);
  threeScene=new THREE.Scene();
  threeCam=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,0.1,100);
  threeCam.position.z=10;
  const mk=(c1,c2,z,s)=>{
    const cv=document.createElement('canvas'); cv.width=32; cv.height=256;
    const x=cv.getContext('2d');
    const g=x.createLinearGradient(0,0,0,256);
    g.addColorStop(0,c1); g.addColorStop(1,c2);
    x.fillStyle=g; x.fillRect(0,0,32,256);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(s,s*0.7),
      new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,opacity:0.85,depthWrite:false}));
    m.position.z=z; threeScene.add(m); bgPlanes.push(m); return m;
  };
  mk('#FFFFFF','#9AA2A8',-6,60);
  mk('#FFFFFF','#AAB2B8',-3,42).material.opacity=0.5;
  mk('#FFFFFF','#BCC4C8',-1,30).material.opacity=0.28;
  addEventListener('resize',()=>{
    if(!threeRenderer)return;
    threeRenderer.setSize(innerWidth,innerHeight);
    threeCam.aspect=innerWidth/innerHeight; threeCam.updateProjectionMatrix();
  });
}
function stepThree(){
  if(!threeRenderer)return;
  const cold=coldness(thomasState.accord);
  const nx=(mpx/innerWidth-0.5), ny=(mpy/innerHeight-0.5);

  const sc2=thomasState.scene;
  const V=Render.value[sc2]||Render.value.stage3;
  const a2=thomasState.sub==='lucid'?0.62:clamp(thomasState.accord,0,1);
  const top=[V.top[0]+(V.dim[0]-V.top[0])*(1-a2),
             V.top[1]+(V.dim[1]-V.top[1])*(1-a2),
             V.top[2]+(V.dim[2]-V.top[2])*(1-a2)];
  const T=[top[0]/210,top[1]/210,top[2]/210];
  bgPlanes.forEach((m,i)=>{
    m.position.x=-nx*(i+1)*0.7; m.position.y=ny*(i+1)*0.35;
    m.material.color.r+=(T[0]-m.material.color.r)*0.035;
    m.material.color.g+=(T[1]-m.material.color.g)*0.035;
    m.material.color.b+=(T[2]-m.material.color.b)*0.035;
    m.material.opacity=(i===2?0.28:i===1?0.5:0.85)*(1-cold*0.25);
  });
  threeRenderer.render(threeScene,threeCam);
}

let P;
const HARP={x0:0,span:0,yTop:0,yBot:0,minLen:0};
let scratchLayer=null;
let waterY=1e9, WATER_Y0=0, WATER_Y1=0;
const STAGE3_DURATION=240;
const FLOOR_STRINGS=4, ELEGY_STRINGS=[6,7,9,10];
const MELODY_STRINGS=[13,14,15,16,17,18,19,20];
const HARMONY_STRINGS=[6,7,8,9,10,11];
function decayWeight(id){
  if(MELODY_STRINGS.indexOf(id)>=0) return 3.2;
  if(HARMONY_STRINGS.indexOf(id)>=0) return 0.28;
  return 1;
}
function pickDecayString(list){
  let tot=0;
  for(const s of list) tot+=decayWeight(s.id);
  let r=Math.random()*tot;
  for(const s of list){ r-=decayWeight(s.id); if(r<=0) return s; }
  return list[list.length-1];
}
let memFocusLast=-1;
function updateMemoryFocus(){
  if(!ROOT) return;
  const clear=thomasState.scene==='ending'||thomasState.sub==='lucid';
  const k=clear?1:0.30+0.70*clamp(thomasState.accord,0,1);
  if(Math.abs(k-memFocusLast)<0.012) return;
  memFocusLast=k;
  ROOT.style.setProperty('--mem-rx',(74*k).toFixed(1)+'%');
  ROOT.style.setProperty('--mem-ry',(70*k).toFixed(1)+'%');
  ROOT.style.setProperty('--mem-core',(40*k).toFixed(1)+'%');
}
let DRIFT_OVERRIDE=null, SCRATCH_ENABLED=false, WATER_PAUSED=false;

const PARTS=[]; const PART_MAX=REDUCED?90:220;
const pdust=[];
let partMode=0;

let STAGE3_GEOM=false;
let SPACING=100;
function mapDrift(i){
  if(!STAGE3_GEOM) return 0;
  const w=1-thomasState.accord;
  return SPACING*(Math.sin(i*1.7+2.3)*w*w*0.78+Math.sin(i*0.6+0.9)*w*0.30);
}
const HARP_ANCHORS=[
  [0.1457,0.0620,0.2292,0.9900],[0.1761,0.0572,0.2584,0.9900],
  [0.2069,0.0726,0.2863,0.9900],[0.2352,0.1050,0.3102,0.9900],
  [0.2606,0.1579,0.3297,0.9900],[0.2805,0.2148,0.3435,0.9900],
  [0.3021,0.2819,0.3582,0.9879],[0.3267,0.3464,0.3725,0.9356],
  [0.3535,0.3978,0.3896,0.8730],[0.3755,0.4225,0.4048,0.8173],
  [0.4000,0.4372,0.4228,0.7515],[0.4276,0.4334,0.4445,0.6720],
  [0.4533,0.4110,0.4659,0.5936],[0.4731,0.3810,0.4831,0.5304],
  [0.4876,0.3484,0.4964,0.4820],[0.5011,0.3200,0.5086,0.4372],
  [0.5113,0.2851,0.5185,0.4009],[0.5278,0.2371,0.5342,0.3434],
  [0.5438,0.1933,0.5493,0.2879],[0.5554,0.1639,0.5602,0.2482],
  [0.5732,0.1287,0.5765,0.1885]
];
const HARP_PAN_Y=-0.3;
const RUINED_DU=0.00854, RUINED_DV=0.00420;

let lastHarpKey=null, stringsPainted=false, s1Ready=false;
function harpRuin(){
  const S=thomasState.strings;
  if(!S||!S.length) return 0;
  let hurt=0;
  for(const s of S){
    if(s.state==='snapped') hurt+=1;
    else if(s.state==='drowned') hurt+=0.7;
    else if(s.state==='slack') hurt+=0.55;
  }
  return clamp((hurt/S.length-0.06)/0.42,0,1);
}
function harpKeyNow(){
  const a=A();
  if(!a) return 'harp_body_clean';
  return (harpRuin()>0.5 && a.has('harp_body_ruined'))
    ? 'harp_body_ruined' : 'harp_body_clean';
}

function buildStrings(p){
  const W=p.width,H=p.height;
  STAGE3_GEOM = thomasState.scene==='stage3';
  const S1=thomasState.scene==='stage1';
  if(STAGE3_GEOM){
    HARP.x0=W*0.075; HARP.span=W*0.85;
    HARP.yTop=H*0.80; HARP.yBot=H*1.42; HARP.minLen=H*0.62;
  } else if(S1){
    HARP.x0=W*0.10; HARP.span=W*0.50;
    HARP.yTop=-H*0.06; HARP.yBot=H*1.14; HARP.minLen=H*0.90;
  } else {
    HARP.x0=W*0.16; HARP.span=W*0.68;
    HARP.yTop=H*0.36; HARP.yBot=H*0.90; HARP.minLen=H*0.20;
  }
  SPACING=HARP.span/(N-1);

  WATER_Y0=STAGE3_GEOM?H*0.985:H*1.02;
  WATER_Y1=STAGE3_GEOM?H*0.65:H*0.75;
  waterY=WATER_Y0;

  const a=A();
  const painted=!!(a && a.has('harp_body_clean'));
  const prev=thomasState.strings;
  thomasState.strings=Array.from({length:N},(_,i)=>{
    let xt,yt,xb,yb;
    if(painted){
      const an=HARP_ANCHORS[i];
      const du=harpKeyNow()==='harp_body_ruined'?RUINED_DU:0;
      const dv=harpKeyNow()==='harp_body_ruined'?RUINED_DV:0;
      const t0=Render.coverMap('harp_body_clean',W,H,0,HARP_PAN_Y,an[0]+du,an[1]+dv);
      const b0=Render.coverMap('harp_body_clean',W,H,0,HARP_PAN_Y,an[2]+du,an[3]+dv);
      xt=t0.x; yt=t0.y; xb=b0.x; yb=b0.y;
    }else{
      xt=xb=HARP.x0+i*HARP.span/(N-1);
      yt=STAGE3_GEOM?(HARP.yTop-i*(H*0.105)):HARP.yTop;
      yb=STAGE3_GEOM?HARP.yBot
        :S1?(HARP.yBot-i*(H*0.022))
        :(HARP.yBot - i*(HARP.yBot-HARP.yTop-HARP.minLen)/(N-1));
    }
    stringsPainted=painted;
    return { id:i, xTop:xt, xBot:xb, x:(xt+xb)/2, yTop:yt, yBot:yb,
             note:i, state:'ok', vib:0, snapT:0, isLandmark:i%3===0 };
  });
  if(prev&&prev.length===N) thomasState.strings.forEach((st,i)=>{
    st.state=prev[i].state; st.snapT=prev[i].snapT;
  });
}
function stringXAt(s,y){
  if(s.xTop===s.xBot) return s.xTop;
  const d=s.yBot-s.yTop;
  if(Math.abs(d)<0.001) return s.xTop;
  const k=clamp((y-s.yTop)/d,0,1);
  return s.xTop+(s.xBot-s.xTop)*k;
}
const HIT_INSET=0.02, PLUCK_MIN_V=14, TOUCH_PX=9;
function activeSpan(s){
  const dy=s.yBot-s.yTop;
  const lo=Math.max(s.yTop+dy*HIT_INSET, 6);
  const hi=Math.min(s.yBot-dy*HIT_INSET, innerHeight-6);
  return [lo,hi];
}
function crossed(a,b,s){
  if(s.state==='snapped')return false;
  const sp=activeSpan(s);
  if(sp[1]<=sp[0])return false;
  const y1=Math.min(a.y,b.y), y2=Math.max(a.y,b.y);
  if(y2<sp[0]||y1>sp[1])return false;
  const my=clamp((a.y+b.y)/2,sp[0],sp[1]);
  const sx=stringXAt(s,my);
  const da=a.x-sx, db=b.x-sx;
  if(da*db<=0) return true;
  return Math.min(Math.abs(da),Math.abs(db))<=TOUCH_PX;
}
const PLUCK_REFRACT=0.11;
function pluck(target,sweep){
  if(MEM_LOCK) return;
  if(target.lastPluck!=null && t-target.lastPluck<PLUCK_REFRACT) return;
  target.lastPluck=t;

  target.vib=clamp(0.4+0.6*sweep/V_MAX,0.4,1.0);
  everPlucked=true;
  for(let d2=0;d2<2;d2++) pdust.push({x:target.x+(Math.random()-0.5)*6,y:mpy,
    vx:(Math.random()-0.5)*30,vy:-20-Math.random()*30,t0:t});
  if(pdust.length>40) pdust.splice(0,pdust.length-40);

  let drift=(DRIFT_OVERRIDE!=null)?DRIFT_OVERRIDE:driftAt(thomasState.accord,sweep);
  if(thomasState.scene==='stage3'&&DRIFT_OVERRIDE==null){
    s3LastInput=t;
    const ph=s3Phase();
    drift*=[0,0,0,0.55,1][ph];
  }
  if(window.Grammar&&Grammar.firstRun('thomas_pluck')){ drift=0; Grammar.consume('thomas_pluck'); }
  const gauss=(Math.random()+Math.random()+Math.random()-1.5)/1.5;
  const offset=clamp(Math.round(gauss*drift),-MAX_OFFSET,MAX_OFFSET);
  const sounded=thomasState.strings[clamp(target.id+offset,0,N-1)];
  if(offset!==0) sounded.phantom=t;

  if(sounded.state==='ok'||sounded.state==='slack'){
    Sound.playNote(sounded.note,{
      gain:clamp(0.3+0.7*sweep/V_MAX,0.3,1.0),
      detune:detuneAt(thomasState.accord)*(Math.random()*2-1),
      slack:sounded.state==='slack',
      pan:stringPan(sounded.id),
    });

  }
  if(thomasState.scene==='stage3'&&!s3.inPhoto){
    traces.push({x0:mpx,y0:mpy,x1:sounded.x,
                 y1:(sounded.yTop+sounded.yBot)/2,t0:t});
    if(traces.length>26) traces.shift();
  }

  onNoteSounded(sounded.note);
  if(TEST_BUILD) thomasState.pluckLog.push({t:performance.now(),v:sweep,aim:target.id,got:sounded.id});
}

function stringPan(id){
  const span=Math.max(1,N-1);
  const geo=(id/span)*2-1;
  const alive=thomasState.strings.filter(function(v){
    return v && v.state!=='snapped' && v.state!=='drowned';
  }).length;
  const width=clamp(0.35+0.65*(alive/Math.max(1,N)),0.2,1);
  let pan=geo*0.85*width;
  if(thomasState.scene==='stage3') pan=0.45+((geo+1)/2)*0.5;
  return clamp(pan,-1,1);
}

function noteToString(noteIdx){ return noteIdx; }

function scratchNote(noteIdx){
  if(thomasState.scene!=='stage3') return;
  thomasState.score.scratched.push(noteIdx);

  if(thomasState.scene==='stage3'){
    for(let i=s3.slots.length-1;i>=0;i--){
      if(s3.slots[i]===noteIdx){ s3.slots[i]=null; break; }
    }
  }
  bakeScratch();
  s3.inkMass=Math.min(1,(s3.inkMass||0)+0.055);
  Sound.scrape(0.7+Math.random()*0.6);
  const s=thomasState.strings[noteToString(noteIdx)];
  if(s && s.state==='ok' && rateLimiterAllows(s)){
    s.state='snapped'; s.snapT=t;
    dropString(s);
    Sound.snap();
  }

  const fi=thomasState.score.filled.indexOf(noteIdx);
  if(fi>=0) thomasState.score.filled.splice(fi,1);
}

let stage3T0=0;
function timeLeft(){ return Math.max(0,STAGE3_DURATION-(t-stage3T0)); }
function rateLimiterAllows(s){
  if(thomasState.scene!=='stage3') return true;
  if(timeLeft()<10) return true;
  const alive=thomasState.strings.filter(x=>x.state==='ok').length;
  if(alive<=FLOOR_STRINGS) return false;
  if(ELEGY_STRINGS.includes(s.id) && alive<=FLOOR_STRINGS+2) return false;
  return true;
}

function updateWater(){
  if(thomasState.scene!=='stage3'||WATER_PAUSED||s3.inPhoto)return;
  if(UI_BLOCK||MEM_LOCK){ stage3T0+=dt; return; }
  const el=clamp((t-stage3T0)/STAGE3_DURATION,0,1);
  thomasState.water=clamp(Math.pow(el,1.30),0,1);
  waterY=lerp(WATER_Y0,WATER_Y1,thomasState.water);
  for(const s of thomasState.strings){
    if(thomasState.scene==='stage3' && s.yBot>waterY && s.state==='ok'){ s.state='drowned'; }
  }
  if(lowpass) lowpass.frequency.value=lerp(20000,400,thomasState.water);
  if(seaGainNode){
    const ph=(thomasState.scene==='stage3')?s3Phase():0;
    seaGainNode.gain.value=lerp(0.1,0.8,thomasState.water)*[0.30,0.45,0.62,0.80,1][ph];
  }
  const ck=loops['clock'];
  if(ck){ try{
    ck.src.playbackRate.value=lerp(1,0.58,thomasState.water);
    ck.gain.gain.value=lerp(0.13,0.03,thomasState.water);
  }catch(e){} }
  checkLucid();
}
let scratchN=0;
function bakeScratch(){
  const g=scratchLayer;
  if(!g) return;
  const B=S1_SCORE_BOX.ok?S1_SCORE_BOX:{x:g.width*0.1,y:g.height*0.2,w:g.width*0.8,h:g.height*0.6};
  const x=B.x+B.w*(0.10+Math.random()*0.80), y=B.y+B.h*(0.14+Math.random()*0.72);
  const a=A();
  const im=a?a.scratchImage(scratchN++):null;
  if(im && im.naturalWidth){
    const h2=B.h*(0.045+Math.random()*0.045);
    const w2=h2*(im.naturalWidth/im.naturalHeight);
    const dc=g.drawingContext;
    dc.save();
    dc.globalAlpha=0.45+Math.random()*0.3;
    dc.translate(x,y);
    dc.rotate((Math.random()-0.5)*0.5);
    dc.drawImage(im,-w2/2,-h2/2,w2,h2);
    dc.restore();
    return;
  }
  g.stroke(217,131,36,120); g.strokeWeight(2+Math.random()*2);
  g.line(x-30-Math.random()*40,y-8+Math.random()*16,x+30+Math.random()*40,y+8-Math.random()*16);
  g.stroke(234,242,246,60);
  g.line(x-20,y+4,x+26,y-6);
}

let shards=[];
function spawnShards(){
  shards=[];
  for(let i=0;i<48;i++){
    shards.push({ x:innerWidth*(0.15+Math.random()*0.7), y:innerHeight*(0.1+Math.random()*0.5),
      vx:(Math.random()-0.5)*180, vy:-40-Math.random()*160,
      r:Math.random()*Math.PI, vr:(Math.random()-0.5)*6,
      s:6+Math.random()*16, a:1 });
  }
}
function drawShards(p){
  if(!shards.length) return;
  const dc=p.drawingContext;
  dc.save();
  for(const q of shards){
    q.vy+=520*dt; q.x+=q.vx*dt; q.y+=q.vy*dt; q.r+=q.vr*dt;
    if(q.y>innerHeight*0.94){ q.y=innerHeight*0.94; q.vy*=-0.28; q.vx*=0.7; q.vr*=0.5; q.a-=0.4*dt; }
    if(q.a<=0) continue;
    dc.save(); dc.translate(q.x,q.y); dc.rotate(q.r);
    dc.globalAlpha=Math.max(0,q.a)*0.8;
    dc.fillStyle='rgba(214,228,236,0.9)';
    dc.beginPath(); dc.moveTo(-q.s*0.5,-q.s*0.2); dc.lineTo(q.s*0.5,-q.s*0.4);
    dc.lineTo(q.s*0.3,q.s*0.4); dc.closePath(); dc.fill();
    dc.restore();
  }
  shards=shards.filter(q=>q.a>0);
  dc.restore();
}

const PROX_SRC={'obj-wave':'sea_rising','obj-photo':'stem_melody'};
const PROX_GAIN={'obj-wave':0.30,'obj-pacifier':0.26,'obj-ring':0.34,'obj-photo':0.34};
const PROX={}, PROX_R=190;
function updateProximity(){
  if(thomasState.scene!=='stage2') return;
  if(s2.heldObj){ clearProximity(); return; }
  ['obj-wave','obj-pacifier','obj-ring','obj-photo'].forEach(id=>{
    const el=$(id);
    if(!el || el.style.display==='none'){ if(PROX[id]) fadeProx(id,0); return; }
    if(el.dataset.state==='placed'){ if(PROX[id]) fadeProx(id,0); return; }
    const r=el.getBoundingClientRect();
    const cx=r.left+r.width/2, cy=r.top+r.height/2;
    const d=Math.hypot(mpx-cx,mpy-cy);
    const want=d<PROX_R?Math.pow(1-d/PROX_R,1.4):0;
    if(want>0.02 && !PROX[id]){
      const key=PROX_SRC[id]||STEM_KEY[objToStem[id]];
      if(abuf[key]){
        PROX[id]=playBuf(key,{gain:0.0001,loop:true,bus:'music'});
        PROX[id].want=0;
      }
    }
    if(PROX[id]){
      const g=PROX[id].gain.gain;
      const now=ctx.currentTime;
      const target=want*(PROX_GAIN[id]||0.30);
      g.cancelScheduledValues(now);
      g.setValueAtTime(g.value,now);
      g.linearRampToValueAtTime(Math.max(0.0001,target),now+0.18);
      el.style.filter=want>0.05?('drop-shadow(0 0 '+(10+want*22).toFixed(0)+'px rgba(226,150,58,'+(0.25+want*0.45).toFixed(2)+'))'):'none';
      if(want<=0.02) fadeProx(id,0);
    }
  });
}
function fadeProx(id,_){
  const h=PROX[id]; if(!h) return;
  try{
    const now=ctx.currentTime;
    h.gain.gain.cancelScheduledValues(now);
    h.gain.gain.setValueAtTime(h.gain.gain.value,now);
    h.gain.gain.linearRampToValueAtTime(0.0001,now+0.25);
    h.src.stop(now+0.3);
  }catch(e){}
  delete PROX[id];
  const el=$(id); if(el) el.style.filter='none';
}
function clearProximity(){ Object.keys(PROX).forEach(id=>fadeProx(id,0)); }

const SCORE={x:0,y:0,w:0,h:0,open:0};
const SCORE_ART={x:0,y:0,w:0,h:0,ok:false};
const STEM_ORDER=['wave','harmony','melody','child'];
const bursts=[];
const debris=[];
function dropString(s){
  if(!s) return;
  const segs=3+Math.floor(Math.random()*3);
  for(let i=0;i<segs;i++){
    const k0=i/segs, k1=(i+1)/segs;
    debris.push({
      x:lerp(s.xTop,s.xBot,(k0+k1)/2)+(Math.random()-0.5)*8,
      y:lerp(s.yTop,s.yBot,(k0+k1)/2),
      len:Math.abs(s.yBot-s.yTop)*(k1-k0)*0.82,
      vy:20+Math.random()*70, vx:(Math.random()-0.5)*26,
      rot:(Math.random()-0.5)*0.5, vr:(Math.random()-0.5)*1.4,
      t0:t, wet:false, col:s.carrier?[217,165,96]:[196,214,228]
    });
  }
  if(debris.length>90) debris.splice(0,debris.length-90);
}
const WP_DRIFT=true, WP_WARM_ON=true, WP_SCALE=0.62, WP_MAX=150;
const EB_GAP0=3.4, EB_GAP1=1.6, EB_MAX=14;
let ebNext=0;
let dgrT=-99, dgrX=0, dgrDir=1, dgrY=0.74, dgrPop=-99, dgrPX=0, dgrPY=0;
function runDaughter(){
  dgrT=t; dgrPop=-99;
  dgrDir=Math.random()<0.5?1:-1;
  dgrX=0.18+Math.random()*0.54;
  dgrY=0.58+Math.random()*0.26;
}
const S1_SCORE_BOX={x:0,y:0,w:0,h:0,ok:false};
const S1_ROWS=8, S1_ROW_V0=0.1420, S1_ROW_V1=0.7950;
const S1_PAGE_DV=[0,0.0290];
const S1_PAGE_U=[0.1150,0.5450], S1_PAGE_W=0.3400;
function s1NotePos(i){
  if(!S1_SCORE_BOX.ok) return null;
  const page=Math.floor(i/S1_ROWS)%2;
  const row=i%S1_ROWS;
  const u=S1_PAGE_U[page]+S1_PAGE_W*(0.14+0.30*((i*0.41)%1));
  const v=S1_ROW_V0+(S1_ROW_V1-S1_ROW_V0)*(row/(S1_ROWS-1))
          +S1_PAGE_DV[page]*(1-row/(S1_ROWS-1));
  return [S1_SCORE_BOX.x+S1_SCORE_BOX.w*u, S1_SCORE_BOX.y+S1_SCORE_BOX.h*v];
}
const scoreRings=[];
const traces=[];
let waveSnaps={};
function captureWave(noteIdx){
  if(!analyser||!anaBuf) return;
  analyser.getByteTimeDomainData(anaBuf);
  const pts=[];
  for(let i=0;i<40;i++) pts.push((anaBuf[i*8]-128)/128);
  waveSnaps[noteIdx]=pts;
  scoreRings.push({i:thomasState.score.filled.length-1,t0:t});
}
function onNoteSounded(noteIdx){
  if(MEM_LOCK) return;
  if(thomasState.scene==='stage1') stage1OnNote(noteIdx);
  else if(thomasState.scene==='stage3') stage3OnNote(noteIdx);
}
function drawLiveWave(p,x,y,w,h,alpha){
  if(!analyser||!anaBuf) return;
  analyser.getByteTimeDomainData(anaBuf);
  const N=40, clipped=[];
  const pts=[];
  for(let i=0;i<N;i++){
    const v=(anaBuf[i*8]-128)/128;
    const vx=x+i*w/N;
    let vy=y+v*h;
    if(vy>waterY){ clipped.push(vx); vy=waterY; }
    pts.push([vx,vy]);
  }
  p.noFill();
  p.stroke(226,236,242,alpha*0.9);
  p.strokeWeight(1.5);
  p.beginShape();
  for(const q of pts) p.vertex(q[0], q[1]);
  p.endShape();
  if(clipped.length){
    p.noStroke();
    for(const vx of clipped){
      p.fill(96,158,196, alpha*0.6);
      p.circle(vx+Math.sin(t*3+vx)*2, waterY+((t*40+vx)%40), 2);
    }
  }
}

const S1_NOTES=16;
const S1_MONTAGE=[
  ['thomas_anchor_father_teaching_01.webp',31,34],
  ['thomas_anchor_bow_01.webp',            67,40],
  ['thomas_anchor_stage_father_01.webp',   47,66]
];
const S1_M_IN=1400, S1_M_HOLD=3000, S1_M_DIM=0.40;
const S1_M_STEP=S1_M_IN+S1_M_HOLD;
const S1_M_T0=3800;
const S1_M_STACK=S1_M_T0+S1_MONTAGE.length*S1_M_STEP;
const S1_M_STACK_HOLD=4400;
const S1_M_OUT=S1_M_STACK+S1_M_STACK_HOLD;
const S1_M_END=S1_M_OUT+2800;
const S1_BEATS={
  1 :{who:'Kid',  line:'daddy, can you teach me this?', dur:3400, at:420},
  4 :{clap:'applause',       gain:0.80, cut:2000, hush:1800, who:'Daddy', line:'5, 6, 7, 8',            dur:2400},
  8 :{clap:'applause',       gain:0.52, cut:1700, hush:1300, who:'Daddy', line:'start again',           dur:2400},
  12:{clap:'applause_dying', gain:0.68, cut:1400, hush:900,  who:'Daddy', line:'you can do it better.', dur:3600}
};
function s1Beat(){
  const b=S1_BEATS[s1.idx];
  if(!b||s1.said[s1.idx])return;
  s1.said[s1.idx]=true;
  let clap=null;
  const cut=b.cut||0, hush=b.hush||0;
  if(b.clap){
    clap=playBuf(b.clap,{gain:b.gain,bus:'sfx'});
    punchIn(1.03,cut+hush);
    _st(()=>{
      if(!clap)return;
      try{
        const T=ctx.currentTime;
        clap.gain.gain.cancelScheduledValues(T);
        clap.gain.gain.setValueAtTime(clap.gain.gain.value,T);
        clap.gain.gain.linearRampToValueAtTime(0.0001,T+0.55);
        clap.src.stop(T+0.62);
      }catch(e){}
    },cut);
  }
  _st(()=>{
    if(thomasState.scene!=='stage1'||s1.done)return;
    VO(b.who,b.line,b.dur);
    s1IdleT=t;
  },(b.at!=null?b.at:cut+hush));
}

const S1_MEM_VO=[
  ['Kid',   'daddy, can you teach me this?', 3200],
  ['Daddy', '5, 6, 7, 8',                    2400],
  ['Daddy', 'you can do it better.',         3400]
];
function s1ShowMem(i){
  if(i==null) return;
  const m=S1_MONTAGE[i];
  if(!m||s1MemDone[i]) return;
  s1MemDone[i]=true;
  memDim(true);
  memLock(true);
  weaveMemories([[m[0],50,46,0,4200,null,null,null,true]]);
  _st(()=>{
    if(!ROOT) return;
    ROOT.querySelectorAll('.mem-weave.full').forEach(d=>{
      if(s1MemEls.indexOf(d)<0) s1MemEls.push(d);
    });
  },260);
  const vo=S1_MEM_VO[i];
  if(vo) _st(()=>{ if(thomasState.scene==='stage1') VO(vo[0],vo[1],vo[2]); },900);
  _st(()=>{ memLock(false); }, 4200+1200);
}

function s1Montage(){
  const a=A();
  if(!a||!ROOT) return;
  S1_MONTAGE.forEach((m,i)=>{
    const url=a.urlForFile?a.urlForFile(m[0]):null;
    if(!url) return;
    const born=S1_M_T0+i*S1_M_STEP+S1_M_STEP;
    setTimeout(()=>{ if(thomasState.scene==='stage1') s1ShowMem(i); },born);
  });
  setTimeout(()=>{
    if(thomasState.scene!=='stage1')return;
    s1MemEls.forEach(d=>{ if(!d)return;
      d.classList.remove('recede');
      d.style.transitionDuration='1.40s,1.40s,1.40s';
      d.style.opacity='1'; });
    if(abuf['voices_together']) playBuf('voices_together',{gain:0.66,bus:'vo'});
    punchIn(1.03,2600);
  },S1_M_STACK);
  setTimeout(()=>{
    s1MemEls.forEach(d=>{ if(!d)return;
      d.style.transitionDuration='2.60s,2.60s,2.60s';
      d.style.opacity='0'; });
    memDim(false);
    leaveAfterimage('thomas_anchor_stage_father_01.webp');
    setTimeout(()=>{
      s1MemEls.forEach(d=>{ if(d&&d.parentNode) d.remove(); });
      s1MemEls=[]; s1MemDone=[];
    },2800);
  },S1_M_OUT);
}
function replayUserMelody(gain,startMs,targetMs){
  if(!s1.rec.length) return 0;
  const raw=[];
  let sum=0;
  for(let i=0;i<s1.rec.length;i++){
    const gap=i?clamp((s1.rec[i].at-s1.rec[i-1].at)*1000,220,760):0;
    raw.push(gap); sum+=gap;
  }
  const stretch=(sum>200&&targetMs>0)?clamp(targetMs/sum,1,3.4):1.6;
  let rt=startMs;
  for(let i=0;i<s1.rec.length;i++){
    rt+=raw[i]*stretch;
    const n=s1.rec[i].n;
    setTimeout(()=>{ if(thomasState.scene==='stage1')
      Sound.playNote(n,{gain:gain}); },rt);
  }
  return rt;
}
let s1={idx:0,open:false,done:false,playedThrough:false,rec:[],recT0:0,etude:null,said:{}};
const WIPE_PHRASE_OPEN=[3,5,7,9,11,13,16];
const WIPE_PHRASE_FALL=[16,13,11,9,7,5,3];

function staffWipe(onCovered, opts){
  opts=opts||{};
  const wrap=$('staffwipe'), cv=$('staffcv');
  const dur=opts.dur||2600;
  const seq=opts.seq||WIPE_PHRASE_OPEN;
  const decay=opts.decay||0;
  if(!wrap||!cv||!cv.getContext){ if(onCovered) onCovered(); return; }
  const dpr=Math.min(window.devicePixelRatio||1,2);
  const W=innerWidth, H=innerHeight;
  cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr);
  const g=cv.getContext('2d');
  g.setTransform(dpr,0,0,dpr,0,0);
  wrap.classList.add('on');

  const row=(opts.row==null?1:opts.row);
  const gap=Math.max(9,H*0.017);
  const bandH=H*0.26;
  const yMid=H*0.22+row*bandH;
  const x0=W*0.06, x1=W*0.94;
  const t0=performance.now();
  let handed=false;
  const notes=[];
  const span=seq.length;
  for(let i=0;i<span;i++){
    const idx=seq[i];
    notes.push({ u:0.10+i*(0.80/(span-1)), step:2-Math.round(idx/12*4), note:idx, hit:false });
  }
  loadAudio(seq.map(i=>sampleKeyFor(i)).concat(decay>0?['slack']:[]));

  function frame(now){
    const e=Math.min(1,(now-t0)/dur);
    g.clearRect(0,0,W,H);

    g.lineWidth=1;
    for(let r=0;r<3;r++){
      const my=H*0.22+r*bandH;
      const done=r<row;
      const active=r===row;
      g.strokeStyle='rgba(214,228,236,'+(active?0.34:done?0.16:0.08)+')';
      const reach=active?(x0+(x1-x0)*Math.min(1,e*1.35)):(done?x1:x0+(x1-x0)*0.12);
      for(let k=-2;k<=2;k++){
        const y=my+k*gap;
        g.beginPath(); g.moveTo(x0,y); g.lineTo(reach,y); g.stroke();
      }
    }

    const px=x0+(x1-x0)*e;
    for(const n of notes){
      const nx=x0+(x1-x0)*n.u;
      if(nx>px+6) continue;
      const ny=yMid-n.step*gap*0.5;
      if(!n.hit){
        n.hit=true;
        const k=clamp(e,0,1);
        const flat=decay>0?(-decay*120*k*k):0;
        if(decay>0 && n===notes[notes.length-1] && abuf['slack']){
          playBuf('slack',{gain:0.22,bus:'harp',rate:0.9});
        }else{
          Sound.playNote(n.note,{gain:0.30-0.10*k, detune:flat, fade:0.02});
        }
      }
      const age=clamp((px-nx)/(W*0.10),0,1);
      g.globalAlpha=0.22+0.5*(1-age);
      g.fillStyle='rgba(217,131,36,1)';
      g.beginPath(); g.ellipse(nx,ny,gap*0.52,gap*0.40,-0.35,0,Math.PI*2); g.fill();
      g.strokeStyle='rgba(217,131,36,0.85)';
      g.lineWidth=1.6;
      g.beginPath(); g.moveTo(nx+gap*0.5,ny); g.lineTo(nx+gap*0.5,ny-gap*2.1); g.stroke();
      g.globalAlpha=1;
    }

    let tgt=0, prev=0, seg=0;
    for(let i=0;i<notes.length;i++){
      if(notes[i].u<=e+0.0001){ prev=notes[i].step; tgt=notes[i].step; seg=i; }
    }
    const nxt=notes[Math.min(seg+1,notes.length-1)];
    const u0=notes[seg].u, u1=nxt.u;
    const k=u1>u0?clamp((e-u0)/(u1-u0),0,1):1;
    const hop=Math.sin(Math.PI*k);
    const stepNow=prev+(nxt.step-prev)*(k*k*(3-2*k));
    const hy=yMid-stepNow*gap*0.5-hop*gap*1.15;
    g.fillStyle='rgba(238,246,250,0.96)';
    g.beginPath(); g.ellipse(px,hy,gap*0.60,gap*0.46,-0.35,0,Math.PI*2); g.fill();
    g.strokeStyle='rgba(238,246,250,0.9)';
    g.lineWidth=2;
    g.beginPath(); g.moveTo(px+gap*0.58,hy); g.lineTo(px+gap*0.58,hy-gap*2.4); g.stroke();
    g.save();
    g.globalAlpha=0.5;
    g.shadowBlur=18; g.shadowColor='rgba(217,131,36,0.85)';
    g.beginPath(); g.ellipse(px,hy,gap*0.60,gap*0.46,-0.35,0,Math.PI*2); g.fill();
    g.restore();

    if(!handed && e>=0.5){ handed=true; if(onCovered) onCovered(); }
    if(e<1){ requestAnimationFrame(frame); return; }
    wrap.classList.remove('on');
    setTimeout(()=>{ g.clearRect(0,0,W,H); },600);
  }
  requestAnimationFrame(frame);
}

function beginStage1(){
  s1Ready=false;
  const bf=$('blackfade');
  if(bf){ bf.style.transition='opacity 0.01s linear'; bf.style.opacity=1; }
  const reveal=()=>{
    if(s1Ready)return;
    s1Ready=true;
    stringsPainted=false; lastHarpKey=null;
    if(window.__p5inst) buildStrings(window.__p5inst);
    if(bf){ bf.style.transition='opacity 1.1s ease'; bf.style.opacity=0; }
  };
  Render.stageAssets('stage1').then(()=>{ paintObjects(); reveal(); marksBrief('stage1'); });
  setTimeout(reveal,5000);
  thomasState.scene='stage1';
  thomasState.score.mode='father';
  thomasState.accord=accordAt('stage1',0);
  loadAudio(['s1_bed','etude','applause','applause_dying','room_empty','room_to_beach','voices_together'])
    .then(()=>{ if(thomasState.scene!=='stage1')return;
      loopBuf('s1_bed','s1_bed',{gain:0.40,bus:'amb',fade:2.5});
      s1.etude=playBuf('etude',{gain:0.5,bus:'music',fade:1.4}); });
  Render.stageAssets('stage1').then(()=>{
    if(thomasState.scene!=='stage1')return;
    if(window.__p5inst) buildStrings(window.__p5inst);
  });
  setTimeout(()=>{ VO('Daddy','5, 6, 7, 8',2600); },5200);
  setTimeout(()=>{
    if(s1.etude){ try{
      const T=ctx.currentTime;
      s1.etude.gain.gain.cancelScheduledValues(T);
      s1.etude.gain.gain.setValueAtTime(s1.etude.gain.gain.value,T);
      s1.etude.gain.gain.linearRampToValueAtTime(0.0001,T+2.4);
      s1.etude.src.stop(T+2.6);
    }catch(e){} s1.etude=null; }
    const bed=loops['s1_bed'];
    if(bed){ try{
      const T=ctx.currentTime;
      bed.gain.gain.cancelScheduledValues(T);
      bed.gain.gain.setValueAtTime(bed.gain.gain.value,T);
      bed.gain.gain.linearRampToValueAtTime(0.24,T+2.4);
    }catch(e){} }
    nextEtudeStep();
  },8600);

  setTimeout(()=>{ if(thomasState.scene!=='stage1')return;
    brief('s1','His father is teaching him. Sweep your hand across the harp strings to play a note. '+
      'Any string will do, there is no wrong one. Play sixteen notes and the page fills itself.',()=>{
        goal('what to do','Sweep across the strings. Any string counts.');
        if(!everPlucked) cue('sweep the strings');
      }); },9200);
  setTimeout(()=>{ if(thomasState.scene==='stage1'&&!everPlucked)
    cue('sweep the strings'); },20000);

}
let s1IdleT=0, s1IdleN=0;
function s1Idle(){
  if(thomasState.scene!=='stage1'||s1.done||!s1.open)return;
  if(t-s1IdleT<8.5)return;
  s1IdleT=t;
  VO('Daddy',(s1IdleN++%2)?'5, 6, 7, 8':'start again',2400);
}
function nextEtudeStep(){
  if(s1.idx>=S1_NOTES){ stage1Complete(); return; }
  thomasState.accord=accordAt('stage1',s1.idx/S1_NOTES);
  s1.open=true;
  s1IdleT=t;
}
function stage1OnNote(noteIdx){
  if(!s1.open||s1.done)return;
  thomasState.score.filled.push(noteIdx);
  if(!s1.rec.length)s1.recT0=t;
  s1.rec.push({n:noteIdx,at:t-s1.recT0});
  captureWave(noteIdx);
  s1.idx++;
  s1Beat();
  s1.open=false;
  setTimeout(nextEtudeStep,300);
}
function stage1Complete(){
  if(s1.done)return; s1.done=true;
  s1.open=false;
  goalClear();
  watch(S1_M_END,'let it play. just watch.');
  Sound.play('applause_dying');
  stopLoop('s1_bed',2.2);
  loopBuf('room_empty','room_empty',{gain:0.3,bus:'amb',fade:3});
  hideCue();
  clearWeave();

  replayUserMelody(0.34,3400,S1_M_STACK-4600);
  s1Montage();
  goalClear();
  watch(S1_M_END-1200,'let it play. just watch.');

  setTimeout(()=>{
    if(thomasState.scene!=='stage1')return;
    stopLoop('room_empty',2.4);
    playBuf('room_to_beach',{gain:0.55,bus:'amb',fade:1.2});
  },S1_M_OUT+900);
  setTimeout(()=>{ clearWeave();
    staffWipe(()=>beginStage2(),{dur:2800,seq:WIPE_PHRASE_OPEN,row:1}); },S1_M_END);
}

const stems={ wave:{buf:null,src:null,gain:null,obj:'obj-wave'},
              child:{buf:null,src:null,gain:null,obj:'obj-pacifier'},
              harmony:{buf:null,src:null,gain:null,obj:'obj-ring'},
              melody:{buf:null,src:null,gain:null,obj:'obj-photo'} };
const objToStem={ 'obj-wave':'wave','obj-pacifier':'child','obj-ring':'harmony','obj-photo':'melody' };
let s2={pushLatched:false,pushing:false,panning:false,heldObj:null,finalPlaythroughActive:false,
  objectsOut:false,echoTimer:null,recallOver:false,wrongStarted:false,
  photoFill:false,photoT0:0,tearing:false,tearT0:0,driftPhase:false,driftT0:0,
        trueMixPlayed:false,done:false,dropTimer:0,burn:0,burnPhase:false,
        establishing:false,estT:0};
let s2Spring=0, s2SpringV=0;
let s2PanX=0, s2PanTarget=0;
const placedAt={};

const STEM_KEY={wave:'stem_wave',child:'stem_child',harmony:'stem_harmony',melody:'stem_melody'};
const S2_MEMS=[
  ['thomas_anchor_sea_daughter_01.webp',  50,44,'I think this is great.',            'Wife', 3400,null,
   'this is the song he is trying to rebuild'],
  ['thomas_anchor_concert_wife_01.webp',  68,36,'No, do it again',                   'Daddy',3000,null,
   'she came to every one of them'],
  ['thomas_anchor_sea_pregnant_01.webp',  34,42,'5, 6, 7, 8',                        'Daddy',2600,null,
   'they wrote it here, before the child'],
  ['thomas_anchor_creating_01.webp',      64,62,'papa, can you please stay with me?','Kid',  3600,'laughing',
   'her handwriting is still in the margins'],
  ['thomas_anchor_leaving_hall_01.webp',  36,58,'I think this is great.',            'Wife', 3400,null,
   'the last night the three of them walked out']
];
let s2MemUsed=0;
function s2ShowMem(hold){
  if(s2MemUsed>=S2_MEMS.length) return false;
  const m=S2_MEMS[s2MemUsed++];
  weaveMemories([[m[0],m[1],m[2],400,hold||6400,m[3],m[4],m[7]]]);
  if(m[6]) _st(()=>{ if(thomasState.scene==='stage2') Sound.play(m[6]); },900);
  _st(()=>{ if(thomasState.scene==='stage2'&&!s2.done) VO(m[4],m[3],m[5]); },1600);
  return true;
}
function s2MemsLeft(){ return S2_MEMS.length-s2MemUsed; }
let stemsStarted=false, stemT0=0, stemDur=0;

async function renderStems(){
  for(const k in stems){
    if(!stems[k].gain){
      stems[k].gain=ctx.createGain(); stems[k].gain.gain.value=0;
      stems[k].gain.connect(masterBus);
      try{
        const an=ctx.createAnalyser();
        an.fftSize=512; an.smoothingTimeConstant=0.72;
        stems[k].gain.connect(an);
        stems[k].ana=an;
        stems[k].buf8=new Uint8Array(an.fftSize);
      }catch(e){ stems[k].ana=null; }
    }
  }
  await loadAudio(Object.keys(STEM_KEY).map(k=>STEM_KEY[k]));
  let got=0;
  for(const k in stems){ stems[k].buf=abuf[STEM_KEY[k]]||null; if(stems[k].buf) got++; }
  if(got===4){ stemDur=stems.wave.buf.duration; return; }
  todoWarn('stems');
  stemDur=stems.wave.buf?stems.wave.buf.duration:0;
}

function startStemBed(){
  if(stemsStarted)return;
  let any=false;
  const t0=ctx.currentTime+0.15;
  for(const k in stems){
    const s=stems[k];
    if(!s.buf) continue;
    s.src=ctx.createBufferSource(); s.src.buffer=s.buf; s.src.loop=true;
    s.src.connect(s.gain);
    s.src.start(t0);
    stemDur=s.buf.duration;
    any=true;
  }
  if(!any){ todoWarn('stems'); return; }
  stemT0=t0; stemsStarted=true;
}
function stemPhase(){
  if(!stemsStarted||!stemDur) return 0;
  const e=ctx.currentTime-stemT0;
  return e<=0?0:e%stemDur;
}
function nextStemBoundary(){
  if(!stemsStarted||!stemDur) return ctx.currentTime;
  return ctx.currentTime+(stemDur-stemPhase());
}
function startStem(key){
  startStemBed();
  const s=stems[key]; if(!s.gain)return;
  const T=ctx.currentTime;
  s.gain.gain.cancelScheduledValues(T);
  s.gain.gain.setValueAtTime(s.gain.gain.value,T);
  s.gain.gain.linearRampToValueAtTime(1,T+0.35);
}
function dropStem(key){
  const s=stems[key]; if(!s.gain)return;
  const T=ctx.currentTime;
  s.gain.gain.cancelScheduledValues(T);
  s.gain.gain.setValueAtTime(s.gain.gain.value,T);
  s.gain.gain.linearRampToValueAtTime(0,T+0.15);
}
function stopStemBed(fade){
  const T=ctx.currentTime, f=(fade==null?4:fade);
  for(const k in stems){
    const s=stems[k];
    if(s.gain){ try{
      s.gain.gain.cancelScheduledValues(T);
      s.gain.gain.setValueAtTime(s.gain.gain.value,T);
      s.gain.gain.linearRampToValueAtTime(0.0001,T+f);
    }catch(e){} }
    if(s.src){ try{ s.src.stop(T+f+0.1); }catch(e){} s.src=null; }
  }
  stemsStarted=false;
}

function beginStage2(){
  applyBusScene('stage2');
  Render.stageAssets('stage2').then(repaintObjects);
  thomasState.scene='stage2';
  thomasState.score.mode='ourstory';
  thomasState.score.filled=[]; waveSnaps={};
  thomasState.accord=accordAt('stage2',0);
  renderStems();
  loadAudio(['book_open','book_close','obj_fall','obj_land','laughing',
             'livingroom','shore_harp','ourstory_true','ourstory_wrong','sea_rising','interweave'])
    .then(()=>{ if(thomasState.scene==='stage2')
      loopBuf('livingroom','livingroom',{gain:0.26,bus:'amb',fade:3}); });

  SCORE.open=0; s2Spring=0; s2SpringV=0;
  _st(()=>{ if(thomasState.scene!=='stage2')return;
    marksBrief('stage2',()=>{
      if(thomasState.scene!=='stage2')return;
      brief('s2open','This is the song he and his wife never finished writing. '+
        'The book is shut on the table. Press it and drag upward to open it. It is heavy, so keep dragging.',()=>{
          goal('what to do','Press the book and drag it upward.');
          cue('lift the book');
        });
    }); },3400);
  _st(()=>{ if(thomasState.scene==='stage2'&&!s2.pushLatched)
    cue('lift the book'); },16000);
}

function onPushDrag(dy){
  if(s2.pushLatched)return;
  const resistance=0.55;
  SCORE.open=clamp(SCORE.open+(-dy)*(1-resistance)*0.015,0,1);
  if(SCORE.open>=1){ s2.pushLatched=true; s2ScoreOpened(); }
}
const S2_OPEN_HOLD=6800;
function s2ScoreOpened(){
  Sound.play('book_open');
  hideCue(); goalClear();
  watch(S2_OPEN_HOLD+2600,'let it play. just watch.');
  s2.trueMixPlayed=true;
  stopLoop('livingroom',2.2);
  const shore=playBuf('shore_harp',{gain:0.34,bus:'amb',fade:1.2});
  playBuf('ourstory_true',{gain:0.92,bus:'music',fade:1.0});
  s2MemUsed=0;
  s2ShowMem(S2_OPEN_HOLD);
  _st(()=>{
    if(shore){ try{
      shore.gain.gain.linearRampToValueAtTime(0.0001,ctx.currentTime+2.4);
      shore.src.stop(ctx.currentTime+2.6);
    }catch(e){} }
    loopBuf('livingroom','livingroom',{gain:0.26,bus:'amb',fade:3});
    s2RevealObjects();
  },S2_OPEN_HOLD+2600);
}
const FLOOR_U={'obj-wave':0.145,'obj-pacifier':0.395,'obj-ring':0.605,'obj-photo':0.858};
const REACH_R=96;
const EST_HOLD=0.7, EST_SWEEP=3.4, EST_SETTLE=1.3;
function s2Establish(){
  if(thomasState.scene!=='stage2')return;
  s2.establishing=true;
  s2.estT=0;
  s2PanTarget=-1;
  s2PanX=-1;
}
function s2EstablishStop(){
  if(!s2.establishing)return;
  s2.establishing=false;
  s2PanTarget=s2PanX;
}
function stepEstablish(dt){
  s2.estT+=dt;
  const t=s2.estT;
  let p;
  if(t<EST_HOLD) p=-1;
  else if(t<EST_HOLD+EST_SWEEP){
    const k=(t-EST_HOLD)/EST_SWEEP;
    p=-1+2*(k*k*(3-2*k));
  }
  else if(t<EST_HOLD+EST_SWEEP+EST_SETTLE){
    const k=(t-EST_HOLD-EST_SWEEP)/EST_SETTLE;
    p=1-(k*k*(3-2*k));
  }
  else { s2.establishing=false; s2PanTarget=0; s2PanX=0; return; }
  s2PanTarget=p;
  s2PanX=p;
}
function overFloorObject(){
  for(const id in FLOOR_U){
    const el=$(id);
    if(!el||el.style.display==='none')continue;
    if(el.dataset.state!=='floor')continue;
    const x=parseFloat(el.style.left), y=parseFloat(el.style.top);
    if(!isFinite(x)||!isFinite(y))continue;
    if(Math.abs(mpx-x)<REACH_R&&Math.abs(mpy-y)<REACH_R) return true;
  }
  return false;
}
const FLOOR_V={'obj-wave':0.905,'obj-pacifier':0.945,'obj-ring':0.905,'obj-photo':0.945};
function floorPos(id){
  const p=Render.coverMap('bg_livingroom_sea',innerWidth,innerHeight,
                          s2PanX,(mpy/innerHeight-0.5)*0.12,FLOOR_U[id],FLOOR_V[id]);
  return p;
}
function layoutFloorObjects(){
  if(thomasState.scene!=='stage2'||!s2.objectsOut)return;
  for(const id in FLOOR_U){
    const el=$(id);
    if(!el||el.style.display==='none')continue;
    if(el.dataset.state!=='floor')continue;
    if(s2.heldObj===el)continue;
    const p=floorPos(id);
    el.style.left=p.x.toFixed(1)+'px';
    el.style.top=Math.min(p.y,innerHeight*0.94).toFixed(1)+'px';
    const h=holeFor(id);
    if(h){ h.style.left=el.style.left; h.style.top=el.style.top; }
  }
}
function s2RevealObjects(){
  if(s2.objectsOut||thomasState.scene!=='stage2')return;
  s2.objectsOut=true;
  repaintObjects();
  ['obj-wave','obj-pacifier','obj-ring','obj-photo'].forEach(id=>{
    const el=$(id); if(!el)return;
    el.style.display='block';
    el.dataset.state='floor';
  });
  layoutFloorObjects();
  Sound.play('obj_fall');
  _st(()=>{ if(thomasState.scene==='stage2') Sound.play('obj_fall'); },260);
  _st(()=>{ if(thomasState.scene!=='stage2')return;
    brief('s2obj','Four objects have fallen on the floor. Each one is a part of the song. '+
      'Drag all four onto the open book. Two of them are off the edge of the screen, '+
      'so drag the room left or right to find them.',()=>{
        goal('what to do','Drag all four objects onto the book. 0 of 4 placed.');
        cue('drag all 4 objects onto the book');
        s2Establish();
      }); },1400);
  s2CallLoop();
}
let s2CallTimer=null;
function offscreenFloorObjects(){
  const out=[];
  for(const id in FLOOR_U){
    const el=$(id);
    if(!el||el.style.display==='none'||el.dataset.state!=='floor')continue;
    const p=floorPos(id);
    if(p.x<innerWidth*0.06) out.push([id,-1]);
    else if(p.x>innerWidth*0.94) out.push([id,1]);
  }
  return out;
}
function s2Call(){
  if(thomasState.scene!=='stage2'||s2.done||!ctx)return;
  const off=offscreenFloorObjects();
  if(!off.length)return;
  const pick=off[Math.floor(Math.random()*off.length)];
  const key=PROX_SRC[pick[0]]||STEM_KEY[objToStem[pick[0]]];
  if(!abuf[key])return;
  let panNode=null;
  try{
    panNode=ctx.createStereoPanner();
    panNode.pan.value=pick[1]*0.92;
    panNode.connect(bus('music'));
  }catch(e){ panNode=null; }
  const v=playBuf(key,{gain:0.075,bus:'music',node:panNode||undefined,fade:0.7});
  if(!v)return;
  setTimeout(()=>{ try{
    const n=ctx.currentTime;
    v.gain.gain.cancelScheduledValues(n);
    v.gain.gain.setValueAtTime(v.gain.gain.value,n);
    v.gain.gain.linearRampToValueAtTime(0.0001,n+0.9);
    v.src.stop(n+1.0);
  }catch(e){} },1500);
}
function s2CallLoop(){
  if(s2CallTimer) clearInterval(s2CallTimer);
  s2CallTimer=setInterval(()=>{
    if(thomasState.scene!=='stage2'||s2.done||s2.finalPlaythroughActive){
      clearInterval(s2CallTimer); s2CallTimer=null; return; }
    if(!offscreenFloorObjects().length){
      clearInterval(s2CallTimer); s2CallTimer=null; return; }
    s2Call();
  },11000);
}

const OBJ_URL={};
function objCandidates(file){
  const a=A();
  const names=(a&&a.names)?a.names(file):[file];
  const all=(a&&a.bases)?a.bases():['assets/img/','assets/','img/','images/',''];
  const b0=(a&&a.base)?a.base():all[0];
  const bases=[b0].concat(all.filter(function(b){return b!==b0;}));
  const out=[];
  bases.forEach(function(b){ names.forEach(function(n){
    const u=b+n; if(out.indexOf(u)<0) out.push(u); }); });
  return out;
}
function objSolve(el){
  const file=el.dataset.asset;
  const im=el.querySelector('img');
  if(!file||!im) return;
  if(OBJ_URL[file]){ if(im.getAttribute('src')!==OBJ_URL[file]) im.src=OBJ_URL[file]; return; }
  if(el.dataset.solving==='1') return;
  el.dataset.solving='1';
  const cands=objCandidates(file);
  let i=0;
  const step=function(){
    if(i>=cands.length){
      el.dataset.solving='0';
      el.dataset.missing='1';
      todoWarn('img:'+file);
      return;
    }
    im.src=cands[i++];
  };
  im.onload=function(){
    if(!im.naturalWidth){ step(); return; }
    el.dataset.solving='0';
    el.dataset.missing='0';
    OBJ_URL[file]=im.getAttribute('src');
  };
  im.onerror=step;
  step();
}
function paintObjects(){
  if(!ROOT)return;
  ROOT.querySelectorAll('.tobj').forEach(objSolve);
}
function repaintObjects(){
  if(!ROOT)return;
  ROOT.querySelectorAll('.tobj').forEach(function(el){
    el.dataset.solving='0';
    const im=el.querySelector('img');
    if(im && !im.naturalWidth) im.removeAttribute('src');
  });
  paintObjects();
}

const S2_LOOP_LINES=[
  ['Daddy','No, do it again',3000],
  ['Kid','papa, can you please stay with me?',3600],
  ['Daddy','5, 6, 7, 8',2600],
  ['Wife','I think this is great.',3400]
];
function s2EchoLoop(){
  s2ShowMem(7200);
  s2.echoTimer=setInterval(()=>{
    if(thomasState.scene!=='stage2'||s2.done||!s2MemsLeft()){
      clearInterval(s2.echoTimer); s2.echoTimer=null; return; }
    s2ShowMem(7200);
  },11000);
}
let s2VoBag=[];
function s2NextLine(){
  if(!s2VoBag.length){
    s2VoBag=S2_LOOP_LINES.slice();
    for(let i=s2VoBag.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      const x=s2VoBag[i]; s2VoBag[i]=s2VoBag[j]; s2VoBag[j]=x;
    }
  }
  return s2VoBag.pop();
}
function s2VoiceLoop(){
  s2VoBag=[];
  s2.voTimer=setInterval(()=>{
    if(thomasState.scene!=='stage2'||s2.finalPlaythroughActive||s2.done){
      clearInterval(s2.voTimer); return; }
    const l=s2NextLine();
    VO(l[0],l[1],l[2]);
  },11000);
}
const weaveEls=[];
let cueTimer=null, cueOff=null;
function cue(text,opts){
  if(window.Mode){ if(text) Mode.act(); else Mode.watch(); }
  opts=opts||{};
  const el=$('tcue'); if(!el) return;
  const ink=el.querySelector('.ink');
  if(!ink) return;
  if(cueTimer){ cancelAnimationFrame(cueTimer); cueTimer=null; }
  if(cueOff){ clearTimeout(cueOff); cueOff=null; }
  ink.textContent=text;
  ink.style.width='0px';
  el.classList.add('on');
  const beat=60000/thomasState.bpm;
  const step=Math.max(28,beat/8);
  const probe=document.createElement('span');
  probe.style.cssText='position:absolute;visibility:hidden;white-space:nowrap;'+
    'font-family:var(--lora),Georgia,serif;font-style:italic;'+
    'font-size:'+getComputedStyle(ink).fontSize+';'+
    'letter-spacing:'+getComputedStyle(ink).letterSpacing;
  probe.textContent=text;
  el.appendChild(probe);
  const full=probe.getBoundingClientRect().width+6;
  probe.remove();
  const dur=Math.max(700,step*text.length);
  const t0=performance.now();
  const tick=()=>{
    const k=Math.min(1,(performance.now()-t0)/dur);
    ink.style.width=(full*(k*k*(3-2*k)))+'px';
    if(k<1) cueTimer=requestAnimationFrame(tick); else cueTimer=null;
  };
  cueTimer=requestAnimationFrame(tick);
  cueOff=setTimeout(()=>{
    el.classList.remove('on');
    cueOff=null;
  },(opts.hold||5200)+text.length*step);
}
let UI_BLOCK=false, briefDone={}, briefOff=null;
function goal(label,text){
  const el=$('tgoal'); if(!el)return;
  if(!text){ el.classList.remove('on'); return; }
  watchEnd();
  el.querySelector('b').textContent=label;
  el.querySelector('span').textContent=text;
  el.classList.add('on');
}
function goalClear(){ const el=$('tgoal'); if(el) el.classList.remove('on'); }
let watchRaf=null, watchOff=null;
function watch(ms,label){
  const el=$('twatch'); if(!el)return;
  watchEnd();
  goalClear();
  el.querySelector('b').textContent=label||'let it play. just watch.';
  const line=el.querySelector('.wb-line');
  const fill=el.querySelector('.wb-line i');
  const timed=(ms&&isFinite(ms)&&ms>400);
  if(line) line.classList.toggle('drift',!timed);
  if(!timed){
    if(fill) fill.style.width='';
    el.classList.add('on');
    return;
  }
  const t0=performance.now();
  el.classList.add('on');
  const step=()=>{
    const k=clamp((performance.now()-t0)/ms,0,1);
    if(fill) fill.style.width=(k*100).toFixed(2)+'%';
    if(k<1) watchRaf=requestAnimationFrame(step); else watchRaf=null;
  };
  watchRaf=requestAnimationFrame(step);
  watchOff=setTimeout(()=>{ el.classList.remove('on'); watchOff=null; },ms+400);
}
function watchEnd(){
  const el=$('twatch');
  if(el){
    el.classList.remove('on');
    const ln=el.querySelector('.wb-line');
    if(ln) ln.classList.remove('drift');
    const f=el.querySelector('.wb-line i');
    if(f) f.style.width='0%';
  }
  if(watchRaf){ cancelAnimationFrame(watchRaf); watchRaf=null; }
  if(watchOff){ clearTimeout(watchOff); watchOff=null; }
}
const MARKS = {
  stage1: ['Click a string and it sounds the note.',
           'Hold, and the note rings on.',
           'Keep up. The score does not wait.'],
  stage2: ['Drag an object onto the open book.',
           'Drag the room left or right to find the rest.',
           'All four belong to the same song.'],
  stage3: ['Click a string. The drowned ones stay silent.',
           'Keep playing, even as it slips.',
           'There is no tempo left. Just keep going.']
};

function marksBrief(id, after){
  if(briefDone[id]){ if(after) after(); return; }
  const rows=MARKS[id];
  if(!rows){ if(after) after(); return; }
  briefDone[id]=true;
  const el=$('tbrief'); if(!el){ if(after) after(); return; }
  const txt=el.querySelector('.bf-txt');
  if(txt){
    txt.innerHTML='';
    const wrap=document.createElement('div');
    wrap.className='bf-marks';
    rows.forEach(r=>{
      const p=document.createElement('p');
      p.className='bf-mark';
      p.textContent=Array.isArray(r)?r.join(' '):r;
      wrap.appendChild(p);
    });
    txt.appendChild(wrap);
  }
  el.querySelector('.bf-go').textContent='click to continue';
  el.classList.add('on');
  watchEnd();
  goalClear();
  hideCue();
  UI_BLOCK=true;
  const close=()=>{
    el.classList.remove('on');
    el.removeEventListener('pointerdown',close);
    removeEventListener('keydown',keyClose);
    if(briefOff){ clearTimeout(briefOff); briefOff=null; }
    UI_BLOCK=false;
    if(txt) txt.innerHTML='';
    if(after) after();
  };
  const keyClose=(e)=>{ if(e.key===' '||e.key==='Enter') close(); };
  el.addEventListener('pointerdown',close);
  addEventListener('keydown',keyClose);
  briefOff=setTimeout(close,180000);
}

function brief(id,text,after){
  if(briefDone[id]){ if(after) after(); return; }
  briefDone[id]=true;
  const el=$('tbrief'); if(!el){ if(after) after(); return; }
  el.querySelector('.bf-txt').textContent=text;
  el.querySelector('.bf-go').textContent='click to continue';
  el.classList.add('on');
  watchEnd();
  goalClear();
  hideCue();
  UI_BLOCK=true;
  const close=()=>{
    el.classList.remove('on');
    el.removeEventListener('pointerdown',close);
    removeEventListener('keydown',keyClose);
    if(briefOff){ clearTimeout(briefOff); briefOff=null; }
    UI_BLOCK=false;
    if(after) after();
  };
  const keyClose=(e)=>{ if(e.key===' '||e.key==='Enter') close(); };
  el.addEventListener('pointerdown',close);
  addEventListener('keydown',keyClose);
  briefOff=setTimeout(close,180000);
}
function hideCue(){
  const el=$('tcue'); if(el) el.classList.remove('on');
  if(cueTimer){ cancelAnimationFrame(cueTimer); cueTimer=null; }
  if(cueOff){ clearTimeout(cueOff); cueOff=null; }
}

function memDim(on){
  const el=$('memdim'); if(el) el.classList.toggle('on',!!on);
}
function weaveMemories(items){
  const a=A();
  if(!a||!ROOT) return 0;
  const scene0=thomasState.scene;
  let shown=0, last=0;
  items.forEach(function(it){
    const url=a.urlForFile?a.urlForFile(it[0]):null;
    if(!url) return;
    shown++;
    const delay=it[3], hold=it[4];
    last=Math.max(last, delay+hold+2200);
    _st(function(){
      if(thomasState.scene!==scene0) return;
      const big=!!it[8];
      const d=document.createElement('div');
      d.className='mem-weave'+(scene0==='stage2'?' plain':'')+(big?' full':'');
      d.style.left=(big?50:it[1])+'%';
      d.style.top=(big?46:it[2])+'%';
      d.style.width=big?'min(82vw,1280px)'
                   :(scene0==='stage2'?'min(40vw,600px)'
                                     :('min('+(24+Math.random()*10).toFixed(0)+'vw,440px)'));
      d.innerHTML='<i style="background-image:url(\''+url+'\')"></i>'+
        (it[7]?('<div class="wnote">'+it[7]+'</div>'):'');
      ROOT.appendChild(d);
      weaveEls.push(d);
      if(scene0==='stage2') memDim(true);
      requestAnimationFrame(function(){ d.classList.add('on'); });
      _st(function(){
        d.classList.remove('on');
        if(scene0==='stage2') memDim(false);
        _st(function(){ if(d.parentNode) d.remove();
          const i=weaveEls.indexOf(d); if(i>=0) weaveEls.splice(i,1); },2400);
      },hold);
    },delay);
  });
  return shown?last:0;
}
function clearWeave(){
  weaveEls.slice().forEach(function(d){ if(d.parentNode) d.remove(); });
  weaveEls.length=0;
  memDim(false);
}

let fbToken=0;
function playFlashbacks(seq, onDone){
  const my=++fbToken;
  let i=0;
  const step=()=>{
    if(my!==fbToken) return;
    fbToken=my;
    if(i>=seq.length){ hideFlashback(); if(onDone) onDone(); return; }
    const it=seq[i++];
    if(!showFlashback(it[0],it[1],true)){ step(); return; }
    _st(()=>{ if(my===fbToken) step(); }, it[2]);
  };
  step();
  return my;
}

function showFlashback(asset,cap,fromQueue){
  if(!fromQueue) fbToken++;
  const card=$('fb-card');
  const u=Assets.urlForFile?Assets.urlForFile(asset):null;
  if(!u) return false;
  card.dataset.asset=asset;
  card.style.background='#0B1D28 url("'+u+'") center/contain no-repeat';
  $('fb-cap').textContent=cap||'';
  $('flashback').classList.add('on');
  return true;
}
const AFTERIMAGE={
  'thomas_anchor_father_teaching_01.webp':1,
  'thomas_anchor_stage_father_01.webp':1,
  'thomas_anchor_bow_01.webp':1,
  'thomas_anchor_accident_01.webp':1,
  'thomas_anchor_funeral_01.webp':1
};
let ghosts=[];
function leaveAfterimage(asset){
  if(!ROOT||!AFTERIMAGE[asset]||REDUCED)return;
  const u=Assets.urlForFile?Assets.urlForFile(asset):null;
  if(!u)return;
  const decay=1-clamp(thomasState.accord,0,1);
  const peak=lerp(0.05,0.15,decay);
  const hold=lerp(3600,8600,decay);
  const g=document.createElement('div');
  g.className='fb-ghost';
  g.style.background='url("'+u+'") center/contain no-repeat';
  ROOT.appendChild(g);
  ghosts.push(g);
  while(ghosts.length>3){ const old=ghosts.shift(); if(old.parentNode) old.remove(); }
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    g.style.transitionDuration='1.1s,'+(hold/1000).toFixed(1)+'s';
    g.style.opacity=peak.toFixed(3);
    g.classList.add('on');
  }));
  setTimeout(()=>{
    g.style.transitionDuration=(hold/1000).toFixed(1)+'s,'+(hold/1000).toFixed(1)+'s';
    g.style.opacity='0';
  },1300);
  setTimeout(()=>{
    const i=ghosts.indexOf(g); if(i>=0) ghosts.splice(i,1);
    if(g.parentNode) g.remove();
  },hold+1800);
}
function hideFlashback(){
  const fb=$('flashback');
  if(fb.classList.contains('on')){
    const card=$('fb-card');
    if(card&&card.dataset.asset&&thomasState.sub!=='lucid') leaveAfterimage(card.dataset.asset);
  }
  fb.classList.remove('on');
}

let liftFilter=null, liftSrc=null;
function spotlightOn(on){
  const el=$('spotlight'); if(!el)return;
  el.classList.toggle('on',!!on);
  ROOT.querySelectorAll('.tobj').forEach(o=>{
    o.classList.toggle('ghosted', !!on && o!==s2.heldObj);
    if(on) o.style.filter='';
  });
}
function objHole(obj){
  if(!ROOT||obj.dataset.holed==='1')return;
  obj.dataset.holed='1';
  const im=obj.querySelector('img');
  if(!im||!im.getAttribute('src'))return;
  const h=document.createElement('div');
  h.className='obj-hole';
  h.dataset.owner=obj.id;
  h.style.left=obj.style.left; h.style.top=obj.style.top;
  h.innerHTML='<img alt="" src="'+im.getAttribute('src')+'">';
  ROOT.appendChild(h);
  requestAnimationFrame(()=>requestAnimationFrame(()=>h.classList.add('on')));
}
function holeFor(id){
  if(!ROOT)return null;
  return ROOT.querySelector('.obj-hole[data-owner="'+id+'"]');
}
function liftStart(obj){
  const key=objToStem[obj.id];
  const src=PROX_SRC[obj.id]||STEM_KEY[key];
  if(!ctx||!abuf[src])return;
  try{
    liftFilter=ctx.createBiquadFilter();
    liftFilter.type='lowpass'; liftFilter.frequency.value=260; liftFilter.Q.value=0.7;
    liftFilter.connect(bus('music'));
    liftSrc=playBuf(src,{gain:0.34,loop:true,bus:'music',node:liftFilter});
  }catch(e){ liftFilter=null; liftSrc=null; }
}
function liftTrack(){
  if(!liftFilter||!s2.heldObj)return;
  const depth=clamp(1-(mpy/innerHeight-0.18)/0.66,0,1);
  try{ liftFilter.frequency.setTargetAtTime(
    lerp(240,15000,Math.pow(depth,1.6)),ctx.currentTime,0.06); }catch(e){}
}
function liftStop(){
  if(liftSrc){ try{
    const n=ctx.currentTime;
    liftSrc.gain.gain.cancelScheduledValues(n);
    liftSrc.gain.gain.setValueAtTime(liftSrc.gain.gain.value,n);
    liftSrc.gain.gain.linearRampToValueAtTime(0.0001,n+0.22);
    liftSrc.src.stop(n+0.28);
  }catch(e){} }
  liftSrc=null; liftFilter=null;
}
function s2Pointer(type,e){
  if(thomasState.scene!=='stage2'||UI_BLOCK)return;
  if(type==='down'){
    s2EstablishStop();
    const el=document.elementFromPoint(mpx,mpy);
    const obj=el&&el.closest?el.closest('.tobj'):null;
    if(obj&&obj.dataset.state!=='placed'){
      if(e&&e.preventDefault) e.preventDefault();
      s2.heldObj=obj; obj.classList.add('held'); obj.classList.remove('sunk');
      slipRelease(objToStem[obj.id]);
      if(obj.dataset.state==='floor') objHole(obj);
      fadeProx(obj.id,0);
      spotlightOn(true); liftStart(obj);
      return;
    }
    if(!s2.pushLatched &&
       mpx>SCORE.x-20 && mpx<SCORE.x+SCORE.w+20 &&
       mpy>SCORE.y-24 && mpy<SCORE.y+SCORE.h+40){ s2.pushing=true; return; }
    s2.panning=true;
  }
  if(type==='move'){
    if(s2.heldObj){ s2.heldObj.style.left=mpx+'px'; s2.heldObj.style.top=mpy+'px';
      liftTrack(); }
    else if(s2.pushing) onPushDrag(mpy-pmy);
    else if(s2.panning) s2PanTarget=clamp(s2PanTarget-(mpx-pmx)/innerWidth*3.4,-1,1);
  }
  if(type==='up'){
    s2.panning=false;
    if(s2.pushing){ s2.pushing=false;
      if(!s2.pushLatched){
        const fall=setInterval(()=>{ SCORE.open=Math.max(0,SCORE.open-0.06);
          if(SCORE.open<=0)clearInterval(fall); },16);
      } }
    if(s2.heldObj){
      const obj=s2.heldObj; s2.heldObj=null; obj.classList.remove('held');
      spotlightOn(false); liftStop();
      if(!(s2.pushLatched && mpy<innerHeight*0.40)){
        obj.dataset.state='floor';
        const h=holeFor(obj.id);
        const hx=h?parseFloat(h.style.left):null;
        const hy=h?parseFloat(h.style.top):innerHeight*0.82;
        let vy=0, y=parseFloat(obj.style.top)||mpy;
        const x0=parseFloat(obj.style.left)||mpx;
        const g3=setInterval(()=>{
          if(thomasState.scene!=='stage2'){ clearInterval(g3); return; }
          vy+=1.4; y+=vy;
          if(hx!=null){
            const cx=parseFloat(obj.style.left)||x0;
            obj.style.left=(cx+(hx-cx)*0.14)+'px';
          }
          if(y>hy){ y=hy; if(hx!=null) obj.style.left=hx+'px'; clearInterval(g3); }
          obj.style.top=y+'px'; },16);
      }
      if(s2.pushLatched && mpy<innerHeight*0.40){
        obj.dataset.state='placed'; obj.classList.add('placed');
        placedAt[objToStem[obj.id]]=t;
        _st(()=>{ if(obj.dataset.state==='placed'||obj.dataset.state==='slipping')
          obj.classList.add('sunk'); },520);
        fadeProx(obj.id,0);
        objHole(obj);
        goal('what to do','Drag all four objects onto the book. '+
          (thomasState.objects.placed.length+1)+' of 4 placed.');
        const row=STEM_ORDER.indexOf(objToStem[obj.id]);
        obj.style.left=(SCORE.x+SCORE.w*0.035)+'px';
        obj.style.top=(SCORE.y+SCORE.h*(0.20+Math.max(0,row)*0.185))+'px';
        const key=objToStem[obj.id];
        if(!thomasState.objects.placed.includes(key)) thomasState.objects.placed.push(key);
        startStem(key);
        Sound.play('obj_land');
        const n=thomasState.objects.placed.length;
        if(n===2) s2ShowMem(6400);

        if(key==='wave' && abuf['sea_rising'])
          playBuf('sea_rising',{gain:0.34,bus:'amb',fade:0.6});
        if(key==='child'){
          runDaughter();
          setTimeout(()=>{ if(thomasState.scene==='stage2') Sound.play('laughing'); },1400);
        }
        VO('','', 100);
        s2CheckComplete();
      }
    }
  }
}
const SLIP_FALL=0.115, SLIP_PUSH=0.52, SLIP_R=120, SLIP_SAVE=0.55;
let slips=[];
const slipK={};
const SLIP_GRACE=9.5;
function s2RandomFall(){
  if(thomasState.scene!=='stage2'||s2.finalPlaythroughActive||s2.done)return;
  if(thomasState.objects.placed.length<2)return;
  if(Math.random()<0.55)return;
  const live=thomasState.objects.placed.filter(k=>
    !slips.some(s=>s.key===k) && (t-(placedAt[k]||-99))>SLIP_GRACE);
  if(!live.length)return;
  s2Slip(live[0]);
}
function s2Slip(key){
  const st=stems[key]; if(!st)return;
  const obj=$(st.obj); if(!obj)return;
  if(slips.some(s=>s.key===key))return;
  obj.dataset.state='slipping';
  slips.push({key:key,el:obj,k:0,y0:parseFloat(obj.style.top)||0,ok:0});
  slipK[key]=0;
}
function slipRelease(key){
  const i=slips.findIndex(s=>s.key===key);
  if(i>=0) slips.splice(i,1);
  delete slipK[key];
}
function stepSlips(){
  if(thomasState.scene!=='stage2'||s2.done){
    slips.forEach(s=>delete slipK[s.key]); slips.length=0; return; }
  const span=Math.max(120,SCORE.h*0.55);
  for(let i=slips.length-1;i>=0;i--){
    const s=slips[i], el=s.el;
    if(!el||!el.parentNode||el.dataset.state==='held'){ slipRelease(s.key); continue; }
    const r=el.getBoundingClientRect();
    const d=Math.hypot(mpx-(r.left+r.width/2), mpy-(r.top+r.height/2));
    const push=d<SLIP_R?SLIP_PUSH*(1-d/SLIP_R):0;
    s.k=clamp(s.k+(SLIP_FALL-push)*dt,0,1);
    slipK[s.key]=s.k;
    el.style.top=s.y0+'px';
    const g=stems[s.key]&&stems[s.key].gain;
    if(g&&ctx){ try{ g.gain.setTargetAtTime(Math.max(0.0001,1-s.k),ctx.currentTime,0.09); }catch(e){} }
    if(s.k<=0.001){
      s.ok+=dt;
      if(s.ok>SLIP_SAVE){
        el.dataset.state='placed'; el.style.top=s.y0+'px';
        el.classList.add('sunk');
        placedAt[s.key]=t;
        if(g&&ctx){ try{
          g.gain.cancelScheduledValues(ctx.currentTime);
          g.gain.setValueAtTime(g.gain.value,ctx.currentTime);
          g.gain.linearRampToValueAtTime(1,ctx.currentTime+0.35);
        }catch(e){} }
        slipRelease(s.key);
        continue;
      }
    }else s.ok=0;
    if(s.k>=1){ el.classList.remove('sunk'); s2Fall(s.key); }
  }
}
const S2_DUCK_LINES=[['Daddy','5, 6, 7, 8',2600],['Daddy','No, do it again',3000]];
let duckN=0;
function traumaDuck(){
  if(!ctx)return;
  const n=ctx.currentTime;
  const warm=[loops['livingroom'],loops['sea']].filter(Boolean);
  warm.forEach(v=>{ try{
    const g=v.gain.gain, v0=g.value;
    g.cancelScheduledValues(n);
    g.setValueAtTime(v0,n);
    g.linearRampToValueAtTime(Math.max(0.0001,v0*0.12),n+0.28);
    g.setValueAtTime(Math.max(0.0001,v0*0.12),n+1.5);
    g.linearRampToValueAtTime(v0,n+3.0);
  }catch(e){} });
  for(const k in stems){
    const g=stems[k].gain;
    if(!g)continue;
    try{
      const v0=g.value;
      if(v0<0.02) continue;
      g.cancelScheduledValues(n);
      g.setValueAtTime(v0,n);
      g.linearRampToValueAtTime(v0*0.22,n+0.28);
      g.setValueAtTime(v0*0.22,n+1.5);
      g.linearRampToValueAtTime(v0,n+3.0);
    }catch(e){}
  }
  const l=S2_DUCK_LINES[duckN++%S2_DUCK_LINES.length];
  _st(()=>{ if(thomasState.scene==='stage2'&&!s2.done) VO(l[0],l[1],l[2]); },420);
}
function s2Fall(key){
  slipRelease(key);
  traumaDuck();
  const i=thomasState.objects.placed.indexOf(key);
  if(i>=0) thomasState.objects.placed.splice(i,1);
  dropStem(key);
  Sound.play('obj_fall');
  const obj=$(stems[key].obj); if(!obj)return;
  obj.dataset.state='floor'; obj.classList.remove('placed');
  let vy=0, y=parseFloat(obj.style.top)||0;
  const g2=setInterval(()=>{
    if(thomasState.scene!=='stage2'){ clearInterval(g2); return; }
    vy+=1.4; y+=vy;
    if(y>innerHeight*0.82){ y=innerHeight*0.82; clearInterval(g2); }
    obj.style.top=y+'px'; },16);
  cue('hold it',{hold:4200});
}
const S2_RECALL_MS=54000;
function s2CheckComplete(){
  if(thomasState.objects.placed.length===4 && !s2.finalPlaythroughActive && !s2.done){
    s2.finalPlaythroughActive=true;
    punchIn(1.02,3000);
    goalClear();
    if(s2CallTimer){ clearInterval(s2CallTimer); s2CallTimer=null; }
    watch(12000,'let it play. just watch.');
    s2VoiceLoop();
    s2EchoLoop();
    _st(()=>{ if(thomasState.scene!=='stage2'||s2.done)return;
      s2.recallOver=true;
      addEventListener('wheel',s2RecallScroll,{passive:true}); },12000);

    const openScroll=()=>{
      if(thomasState.scene!=='stage2'||s2.done) return;
      if(s2MemsLeft()>0){ _st(openScroll,3000); return; }
      if(s2.scrollOffered) return;
      s2.scrollOffered=true;
      watchEnd();
      goal('what to do','Scroll down when you are ready.');
    };
    _st(openScroll,14000);

    _st(()=>{ if(thomasState.scene==='stage2'&&!s2.done&&s2.scrollOffered)
      cue('scroll down to go on'); },S2_RECALL_MS-6000);
    _st(()=>{ if(thomasState.scene==='stage2'&&!s2.done) s2Wrong(); },S2_RECALL_MS);
  }
}
function s2RecallScroll(e){
  if(thomasState.scene!=='stage2'){ removeEventListener('wheel',s2RecallScroll); return; }
  if(!s2.recallOver||s2.done)return;
  if(e.deltaY<=0)return;
  removeEventListener('wheel',s2RecallScroll);
  s2.recallOver=false;
  s2Wrong();
}
const S2_PHOTO_RISE=2600, S2_PHOTO_HOLD=1000, S2_TEAR_TAIL=15000;
const tears=[];
function s2Wrong(){
  if(s2.done||s2.wrongStarted)return;
  s2.wrongStarted=true; s2.wrongT0=t;
  removeEventListener('wheel',s2RecallScroll);
  if(s2.voTimer){ clearInterval(s2.voTimer); s2.voTimer=null; }
  if(s2.echoTimer){ clearInterval(s2.echoTimer); s2.echoTimer=null; }
  if(s2CallTimer){ clearInterval(s2CallTimer); s2CallTimer=null; }
  clearWeave(); memDim(false); hideCue();
  ['obj-wave','obj-pacifier','obj-ring','obj-photo'].forEach(id=>{
    const el=$(id); if(el) el.style.display='none'; });
  ROOT.querySelectorAll('.obj-hole').forEach(h=>h.remove());
  s2.photoT0=t; s2.photoFill=true;
  goalClear(); hideCue(); watchEnd();

  const wrongBuf=abuf['ourstory_wrong'];
  const musicMs=wrongBuf?wrongBuf.duration*1000:16000;
  if(!wrongBuf){
    todoWarn('ourstory_wrong');
  }else{
    const boundary=stemsStarted?nextStemBoundary():(ctx?ctx.currentTime+0.05:0);
    playBuf('ourstory_wrong',{gain:0.95,bus:'music',when:boundary});
    for(const k in stems){
      const g=stems[k].gain;
      if(!g)continue;
      try{
        g.gain.cancelScheduledValues(boundary);
        g.gain.setValueAtTime(g.gain.value,boundary);
        g.gain.linearRampToValueAtTime(0.0001,boundary+0.5);
      }catch(e){}
    }
  }
  setTimeout(()=>{ if(thomasState.scene==='stage2') thomasState.accord=accordAt('stage2',1); },600);
  const tearAt=Math.max(S2_PHOTO_RISE+S2_PHOTO_HOLD, musicMs-S2_TEAR_TAIL);
  setTimeout(()=>{ if(thomasState.scene!=='stage2'||s2.done)return;
    s2.tearing=true; s2.tearT0=t;
    goal('what to do','Click the photograph to stop it burning.');
    if(abuf['interweave']) s2.fire=playBuf('interweave',{gain:0.5,bus:'sfx',loop:true,fade:1.2});
    punchIn(1.03,3000);
    addEventListener('pointerdown',s2StopTear,{passive:true});
    s2.tearNag=setInterval(()=>{
      if(thomasState.scene!=='stage2'||!s2.tearing){
        clearInterval(s2.tearNag); s2.tearNag=null; return; }
      cue('press it',{hold:3000});
    },3600);
    _st(()=>{ if(thomasState.scene==='stage2'&&s2.tearing)
      cue('press it',{hold:3000}); },1200);
  },tearAt);
}
function s2StopTear(){
  if(!s2.tearing)return;
  s2.tearing=false;
  goalClear();
  if(s2.fire){ try{
    const n=ctx.currentTime;
    s2.fire.gain.gain.cancelScheduledValues(n);
    s2.fire.gain.gain.setValueAtTime(s2.fire.gain.gain.value,n);
    s2.fire.gain.gain.linearRampToValueAtTime(0.0001,n+1.6);
    s2.fire.src.stop(n+1.8);
  }catch(e){} s2.fire=null; }
  if(s2.tearNag){ clearInterval(s2.tearNag); s2.tearNag=null; }
  removeEventListener('pointerdown',s2StopTear);
  hideCue();
  Sound.play('book_close');
  setTimeout(()=>s2End(),1400);
}
const S2_DRIFT_MS=13000;
function s2End(){
  if(s2.done)return; s2.done=true;
  s2.photoFill=false; s2.tearing=false; s2.rips=null;
  removeEventListener('pointerdown',s2StopTear);
  tears.length=0; hideCue();
  ['obj-wave','obj-pacifier','obj-ring','obj-photo'].forEach(id=>{
    const el=$(id); if(el) el.style.display='none'; });

  _st(()=>{ if(thomasState.scene!=='stage2')return; s2Drift(); },900);
}
function s2Drift(){
  s2.driftPhase=true; s2.driftT0=t;
  goalClear();
  watch(S2_DRIFT_MS,'let it play. just watch.');
  _st(()=>{ if(thomasState.scene==='stage2'&&s2.driftPhase)
    showFlashback('thomas_anchor_accident_01.webp','a truck through a red light.'); },1000);
  _st(()=>{ if(thomasState.scene==='stage2') hideFlashback(); },8200);
  [[1200,'Daddy','again! again! again!',2600],
   [2400,'Kid',"papa, you're doing a great job!",3400],
   [3200,'Daddy','no. Stop!',2200]
  ].forEach(v=>_st(()=>{ if(thomasState.scene!=='stage2'||!s2.driftPhase)return;
    Sound.playVO(v[2]);
    voOverlap(v[1],v[2],v[3]); },v[0]));
  _st(()=>{ if(thomasState.scene!=='stage2')return;
    s2.driftPhase=false; hideCue(); hideFlashback();
    staffWipe(()=>beginStage3(),{dur:3000,seq:WIPE_PHRASE_FALL,decay:1,row:2}); },S2_DRIFT_MS);
}

let s3={targetSeq:[],targetPos:0,collapsing:false,done:false,photoBurn:0,inPhoto:false,slots:[],beatCount:0,saidHoles:false,echoOn:false,miss:0,graceUsed:0};
function beginStage3(){
  applyBusScene('stage3');
  Render.stageAssets('stage3').then(()=>{ paintObjects(); if(window.__p5inst) buildStrings(window.__p5inst); });

  clearWeave(); hideCue(); clearProximity();
  try{ Sound.stop('laughing'); }catch(e){}
  try{
    if(ctx){
      const amb=bus('amb'), env=bus('music');
      [amb,env].forEach(function(b){
        if(!b||b.__s3pan) return;
        const pn=ctx.createStereoPanner();
        pn.pan.value=-0.55;
        try{ b.disconnect(); }catch(e){}
        b.connect(pn); pn.connect(masterBus);
        b.__s3pan=pn;
      });
    }
  }catch(e){}
  stopStemBed(5);
  stopLoop('livingroom',4);
  loadAudio(['laughing','sea_rising','elegy','voices_together',
             'funeral','ending_destroyed','strings_all_snap','clock',
             'glass_break','crash_hit','ambulance'])
    .then(()=>{
      if(thomasState.scene!=='stage3')return;
      s3.mixed=!!abuf['funeral'];
      if(s3.mixed) s3.weave=playBuf('funeral',{gain:0.52,bus:'music',fade:6,loop:true});
      if(abuf['sea_rising']) loopBuf('sea','sea_rising',{gain:0.5,bus:'amb',fade:6});
      if(abuf['clock']) loopBuf('clock','clock',{gain:0.13,bus:'amb',fade:5});
    });
  thomasState.scene='stage3';
  thomasState.score.mode='ourstory';
  thomasState.score.filled=[]; thomasState.score.scratched=[]; waveSnaps={};
  thomasState.accord=accordAt('stage3',0);
  STAGE3_GEOM=true;
  if(window.__p5inst) buildStrings(window.__p5inst);
  s3.inPhoto=false; s3.photoBurn=0;
  s3.echoOn=false; s3.miss=0; s3.graceUsed=0; s3.hits=0; s3.memShown=0;
  s3.phase=-1; s3.memLast=-99; s3.inkMass=0; s3.interlude=false;
  _st(()=>{ if(thomasState.scene==='stage3') s3EnterMain(); },900);
  debris.length=0;
  bursts.length=0;
  _st(()=>{ if(thomasState.scene!=='stage3')return;
    marksBrief('stage3',()=>{
      if(thomasState.scene!=='stage3')return;
      brief('s3','Decades later he is still trying to finish it. One string lights up at a time. '+
        'Draw your hand through the lit string to play the note it wants. '+
        'The sea is rising behind you. He will not finish, and that is the point.',()=>{
          goal('what to do','Draw your hand through the lit string.');
          cue('pull the lit string');
        });
    }); },2600);

}
function s3PhotoClick(){
  if(!s3.inPhoto)return;
  s3.photoBurn=clamp(s3.photoBurn+0.16,0,1);
}
function s3EnterMain(){
  if(s3.burnSfx){ try{
    const T=ctx.currentTime;
    s3.burnSfx.gain.gain.cancelScheduledValues(T);
    s3.burnSfx.gain.gain.setValueAtTime(s3.burnSfx.gain.gain.value,T);
    s3.burnSfx.gain.gain.linearRampToValueAtTime(0.0001,T+1.6);
    s3.burnSfx.src.stop(T+1.8);
  }catch(e){} s3.burnSfx=null; }
  _st(()=>{ if(thomasState.scene!=='stage3'||s3.collapsing)return;
    showFlashback('thomas_anchor_funeral_01.webp',
      'he played their last song at their funeral'); },1400);
  _st(()=>{ if(thomasState.scene==='stage3') hideFlashback(); },7400);
  _st(()=>{ if(thomasState.scene==='stage3')
    cue('pull the lit string'); },7900);
  _st(()=>{ if(thomasState.scene==='stage3'&&thomasState.score.filled.length===0)
    cue('the lit one'); },19000);
  s3.inPhoto=false;
  stage3T0=t; SCRATCH_ENABLED=true;
  thomasState.water=0;

  s3.targetSeq=[9,8,7,9, 5,3,6,8, 2,7,6,9, 1,8,7,6, 0,9,8,7];
  s3.targetPos=0;
  VO('Wife','come baby. 1, 2, 3, 4! You did it!',4000);
  _st(()=>{ if(thomasState.scene==='stage3')
    VO('Thomas','honey, no worries, try it again.',4600); },14000);

  scheduleStage3Voices();
}
const GRACE_MAX=5;
const S3_VO_GAP0=26000, S3_VO_GAP1=11000, S3_VO_JITTER=4000, S3_VO_CURVE=1.3;
const S3_VO=[['Wife','come baby. 1, 2, 3, 4! You did it!'],
             ['Thomas','honey, no worries, try it again.']];
const S3_HIT_MEM=[
  ['thomas_anchor_father_teaching_01.webp',28,32,'Wife','come baby. 1, 2, 3, 4! You did it!',4000,null,
   'his hands still remember this one'],
  ['thomas_anchor_creating_01.webp',       68,62,'Thomas','honey, no worries, try it again.',4600,null,
   'he wrote it with her. he cannot finish it alone'],
  ['thomas_anchor_sea_daughter_01.webp',   34,66,'Wife','come baby. 1, 2, 3, 4! You did it!',4000,null,
   'the song is still in him. the hands are not'],
  ['thomas_anchor_concert_wife_01.webp',   72,36,'Thomas','honey, no worries, try it again.',4600,null,
   'she was the first to say it was enough']
];
function s3HitMemory(){
  const n=s3.memShown||0;
  if(n>=S3_HIT_MEM.length)return;
  if(t-(s3.memLast||-99)<18)return;
  const m=S3_HIT_MEM[n];
  s3.memShown=n+1; s3.memLast=t;
  memLock(true);
  weaveMemories([[m[0],50,46,500,5200,null,null,m[7],true]]);
  if(m[6]==='applause') setTimeout(()=>{ if(thomasState.scene==='stage3') Sound.play('applause'); },600);
  _st(()=>{ if(thomasState.scene==='stage3'&&!s3.collapsing) VO(m[3],m[4],m[5]); },1500);
  _st(()=>{ memLock(false); }, 500+5200+1400);
}

function memLock(on){
  MEM_LOCK=!!on;
  const r=ROOT;
  if(r) r.classList.toggle('mem-locked', !!on);
  if(on) hideCue();
}
function scheduleStage3Voices(){
  const lines=S3_VO;
  let i=0;
  function next(){
    if(thomasState.scene!=='stage3'||s3.collapsing||thomasState.sub==='lucid')return;
    const l=lines[i%lines.length]; i++;
    VO(l[0],l[1],2800);
    const p=clamp((t-stage3T0)/STAGE3_DURATION,0,1);
    const gap=lerp(S3_VO_GAP0,S3_VO_GAP1,Math.pow(p,S3_VO_CURVE));
    s3.voTimer=setTimeout(next,gap+Math.random()*S3_VO_JITTER);
  }
  s3.voTimer=setTimeout(next,7000);
}
function playPlayerEcho(){
  if(thomasState.scene!=='stage3'||s3.collapsing||!s1.rec.length)return;
  const rot=1-clamp(thomasState.accord,0,1);
  let rt=900;
  for(let i=0;i<s1.rec.length;i++){
    const gap=i?clamp((s1.rec[i].at-s1.rec[i-1].at)*1000,220,760):0;
    rt+=gap*(1+rot*1.05);
    const n=s1.rec[i].n;
    setTimeout(()=>{
      if(thomasState.scene!=='stage3'||s3.collapsing||thomasState.sub==='lucid')return;
      Sound.playNote(n,{gain:0.085-0.035*rot,
                        detune:(Math.random()*2-1)*rot*280,
                        slack:rot>0.72&&Math.random()<rot-0.6});
    },rt);
  }
  setTimeout(playPlayerEcho, rt+11000+Math.random()*7000);
}
function graceNote(){
  const want=s3.targetSeq[s3.targetPos%s3.targetSeq.length];
  const s=thomasState.strings[want];
  if(!s||s.state==='snapped')return;
  s.grace=t;
  s.vib=Math.max(s.vib,0.85);
  Sound.playNote(want,{gain:0.62,detune:0});
  thomasState.score.filled.push(want);
  s3.slots[s3.targetPos]=want;
  captureWave(want);
  s3.targetPos++;
}
function stage3OnNote(noteIdx){
  if(s3.collapsing||thomasState.sub==='lucid'&&false)return;
  if(s3.inPhoto)return;
  const want=s3.targetSeq[s3.targetPos%s3.targetSeq.length];
  if(noteIdx===want){
    thomasState.score.filled.push(want);
    s3.slots[s3.targetPos]=want;
    captureWave(noteIdx);
    s3.targetPos++;
    s3.miss=0;
    s3.hits=(s3.hits||0)+1;
    if(s3.hits%8===0 && thomasState.sub!=='lucid') s3HitMemory();
    return;
  }
  s3.miss++;
  if(s3.miss>=3 && s3.graceUsed<GRACE_MAX && thomasState.sub!=='lucid'){
    s3.miss=0; s3.graceUsed++;
    setTimeout(()=>{ if(thomasState.scene==='stage3'&&!s3.collapsing) graceNote(); },620);
  }
}

function s3Phase(){
  const p=clamp((t-stage3T0)/STAGE3_DURATION,0,1);
  if(p<0.19) return 0;
  if(p<0.40) return 1;
  if(p<0.62) return 2;
  if(p<0.82) return 3;
  return 4;
}
let s3LastInput=0;
function s3Effort(){
  const idle=t-s3LastInput;
  if(idle<6) return 1;
  return clamp(1-(idle-6)/10,0.38,1);
}
const S3_SFX_RATE=[0,0.020,0.034,0.048,0.062];
const S3_SFX=[
  ['scrape01',   1,0.16,[0.40,0.58]],
  ['snap01',     2,0.30,[1.55,1.95]],
  ['scrape01',   2,0.26,[0.42,0.62]],
  ['glass_break',2,0.24,[0.90,1.25]],
  ['snap02',     3,0.34,[1.70,2.20]],
  ['sea_rising', 3,0.22,[0.80,1.10]],
  ['scrape02',   3,0.28,[0.38,0.58]],
  ['ambulance',  3,0.20,[0.82,1.02]],
  ['snap03',     4,0.36,[1.85,2.40]],
  ['note_cut',   4,0.26,[0.34,0.52]],
  ['scrape03',   4,0.30,[0.36,0.56]],
  ['crash_hit',  4,0.28,[0.86,1.14]],
  ['glass_break',4,0.30,[1.10,1.55]]
];
function s3Sfx(ph){
  const pool=S3_SFX.filter(x=>x[1]<=ph&&abuf[x[0]]);
  if(!pool.length)return;
  const x=pool[Math.floor(Math.random()*pool.length)];
  playBuf(x[0],{gain:x[2]*(0.7+Math.random()*0.6),bus:'sfx',
    rate:lerp(x[3][0],x[3][1],Math.random())});
}
function s3BeatTick(){
  if(thomasState.scene!=='stage3'||!SCRATCH_ENABLED||s3.inPhoto)return;
  const ph=s3Phase();
  if(ph!==s3.phase){
    s3.phase=ph;
    if(ph>=1 && (s3.memShown||0)<ph && thomasState.sub!=='lucid'){
      s3.memLast=-99;
      s3.memShown=ph-1;
      s3HitMemory();
    }
    if(ph===1) _st(()=>{ if(thomasState.scene==='stage3')
      cue('keep going'); },2200);
  }
  s3.beatCount++;
  const REPLAY_EVERY=Math.max(4,Math.round(16/beatScale()));
  if(s3.beatCount%REPLAY_EVERY===0 && s3.slots.length>2 && !s3.collapsing){
    s3.slots.slice(0,24).forEach((n,i)=>{
      if(n!=null) setTimeout(()=>{ if(thomasState.scene==='stage3')
        Sound.playNote(n,{gain:0.22,detune:detuneAt(thomasState.accord)}); },i*230);

    });
    if(!s3.saidHoles && s3.slots.includes(null)){ s3.saidHoles=true;
      setTimeout(()=>{ if(thomasState.scene==='stage3')
        VO('Thomas','honey, no worries, try it again.',4600); },1400);
    }
  }
  thomasState.accord=accordAt('stage3',(t-stage3T0)/STAGE3_DURATION);
  if(!s3.echoOn && thomasState.water>0.34 && s1.rec.length>3 && !s3.collapsing){
    s3.echoOn=true; playPlayerEcho();
  }
  if(ph>=1 && Math.random()<S3_SFX_RATE[ph]*beatScale()*s3Effort()) s3Sfx(ph);
  if(ph>=2 && Math.random()<scratchRate(thomasState.accord)*beatScale()*[0,0,0.45,0.8,1][ph]*s3Effort()){
    const F=thomasState.score.filled;
    if(F.length>0){
      scratchNote(F[Math.floor(Math.random()*F.length)]);
    }else{
      bakeScratch();
      s3.inkMass=Math.min(1,(s3.inkMass||0)+0.03);
      Sound.scrape(0.5+Math.random()*0.5);
    }
  }
  if(ph>=1 && Math.random()<0.22*beatScale()*s3Effort()){
    bakeScratch();
    s3.inkMass=Math.min(1,(s3.inkMass||0)+0.012);
  }

  if(ph>=1 && Math.random()<(1-thomasState.accord)*0.34*beatScale()*[0,0.42,0.68,0.88,1][ph]){
    const ok=thomasState.strings.filter(s=>s.state==='ok');
    if(ok.length>FLOOR_STRINGS){
      const s2s=pickDecayString(ok);
      s2s.state='slack'; s2s.slackT=t;
      if(abuf['slack']) playBuf('slack',{gain:0.30,bus:'harp',rate:0.9+Math.random()*0.3});
    }
  }
  if(ph>=1 && Math.random()<(1-thomasState.accord)*0.16*beatScale()*[0,0.30,0.62,0.85,1][ph]){
    const sl=thomasState.strings.filter(s=>s.state==='slack'&&t-(s.slackT||0)>5);
    if(sl.length){
      const victim=pickDecayString(sl);
      if(rateLimiterAllows(victim)){ victim.state='snapped'; victim.snapT=t; dropString(victim); Sound.snap(); }
    }
  }
  if(timeLeft()<=0 && !s3.collapsing && !thomasState.lucidFired){ enterLucid(); }
}

function checkLucid(){
  const alive=thomasState.strings.filter(x=>x.state==='ok').length;
  if(!thomasState.lucidFired && alive<=FLOOR_STRINGS && thomasState.scene==='stage3' && !s3.inPhoto){
    enterLucid();
  }
}
function enterLucid(){
  if(s3.weave){ try{
    const T=ctx.currentTime;
    s3.weave.gain.gain.cancelScheduledValues(T);
    s3.weave.gain.gain.setValueAtTime(s3.weave.gain.gain.value,T);
    s3.weave.gain.gain.linearRampToValueAtTime(0.0001,T+2.2);
  }catch(e){} }
  stopLoop('clock',2.4);
  if(abuf['room_empty']) loopBuf('lucidroom','room_empty',{gain:0.22,bus:'amb',fade:2.2});
  if(abuf['sea_rising']) playBuf('sea_rising',{gain:0.10,bus:'amb',fade:3,rate:0.72});
  if(abuf['elegy']) setTimeout(()=>playBuf('elegy',{gain:0.8,bus:'music',fade:1.6}),1400);
  if(thomasState.lucidFired)return;
  thomasState.lucidFired=true; thomasState.sub='lucid';
  document.body.classList.add('lucid');
  document.documentElement.classList.add('lucid');
  DRIFT_OVERRIDE=0;
  SCRATCH_ENABLED=false;
  WATER_PAUSED=true;
  if(lowpass) lowpass.frequency.value=20000;
  if(seaGainNode) seaGainNode.gain.linearRampToValueAtTime(0.05,ctx.currentTime+1);
  showFlashback('thomas_anchor_wife_face_01.webp',
    'her face, the last time he saw it');
  _st(()=>{ if(thomasState.scene==='stage3')
    cue('play what is still there'); },2400);

  setTimeout(exitLucid,10000);
}
function exitLucid(){
  hideFlashback();
  stopLoop('lucidroom',2);
  document.body.classList.remove('lucid');
  document.documentElement.classList.remove('lucid');
  thomasState.sub=null;

  thomasState.water=1;
  for(const s of thomasState.strings){ if(s.state!=='snapped'){ s.state='drowned'; } }
  if(lowpass) lowpass.frequency.value=320;
  if(seaGainNode) seaGainNode.gain.linearRampToValueAtTime(0.85,ctx.currentTime+0.4);
  collapse();
}
let flickerT0=-99, flickerN=0;
function screenFlicker(){
  flickerT0=t; flickerN=0;
  const w=$('whitefade');
  if(!w)return;
  w.style.transition='opacity 0.09s linear';
  const fire=()=>{
    if(flickerN>=6||thomasState.scene!=='stage3'){
      w.style.opacity=0; w.style.transition='opacity 2.4s ease'; return; }
    flickerN++;
    w.style.opacity=(flickerN%2)?0.55:0;
    setTimeout(fire,167);
  };
  fire();
}
function collapse(){
  if(s3.collapsing)return; s3.collapsing=true;
  goalClear(); hideCue();
  watch(4600+INTERLUDE_MS+600,'let it play. just watch.');
  screenFlicker();
  for(const s of thomasState.strings){ if(s.state!=='snapped') dropString(s); }
  spawnShards();

  for(const s of thomasState.strings){ if(s.state!=='snapped'){ s.state='snapped'; s.snapT=t+Math.random()*0.8; } }
  Sound.allSnap();
  if(abuf['voices_together']) setTimeout(()=>playBuf('voices_together',{gain:0.55,bus:'vo'}),700);
  if(abuf['ending_destroyed']) setTimeout(()=>{ s3.destroyed=playBuf('ending_destroyed',{gain:0.68,bus:'music',fade:1.2}); },1400);
  setTimeout(()=>{ $('blackfade').style.opacity=1; },2600);
  setTimeout(()=>{ $('blackfade').style.opacity=0; s3Interlude(); },4600);
}
const INTERLUDE_MS=9000;
let interT0=0;
function s3Interlude(){
  s3.interlude=true; interT0=t;
  Render.stageAssets('stage3');
  if(abuf['book_close']) Sound.play('book_close');
  setTimeout(()=>{ $('blackfade').style.opacity=1; },INTERLUDE_MS-1400);
  setTimeout(()=>{ s3.interlude=false; beginEnding(); $('blackfade').style.opacity=0; },
    INTERLUDE_MS+600);
}

const SKY_MEMS=[
  ['thomas_sky_father_rage_01.webp','',22,20],
  ['thomas_anchor_stage_father_01.webp','',50,14],
  ['thomas_sky_wedding_01.webp','',76,22],
  ['thomas_anchor_sea_pregnant_01.webp','',30,34],
  ['thomas_sky_wife_pregnant_01.webp','',62,32],
  ['thomas_sky_daughter_lift_01.webp','',42,24],
  ['thomas_anchor_creating_01.webp','',68,42],
];
let SEA_HORIZON_V=0.5528, SEA_SHORE_V=0.885;
let seaProbed=false;
function probeSeaLines(){
  if(seaProbed)return;
  const a=A(); if(!a)return;
  const im=a.get('bg_sea_sky'); if(!im||!im.naturalWidth)return;
  seaProbed=true;
  try{
    const w=Math.min(im.naturalWidth,360);
    const h=Math.round(w*im.naturalHeight/im.naturalWidth);
    const c=document.createElement('canvas'); c.width=w; c.height=h;
    const g=c.getContext('2d',{willReadFrequently:true});
    g.drawImage(im,0,0,w,h);
    const d=g.getImageData(0,0,w,h).data;
    let bestY=-1,bestN=0,shore=-1;
    for(let y=0;y<h;y++){
      let dark=0,blue=0;
      for(let x=0;x<w;x++){
        const i=(y*w+x)*4, r=d[i], gg=d[i+1], b=d[i+2];
        if(r<95&&gg<95&&b<95) dark++;
        if(b>r+18) blue++;
      }
      if(dark>bestN && dark>w*0.55){ bestN=dark; bestY=y; }
      if(blue>w*0.5) shore=y;
    }
    if(bestY>0) SEA_HORIZON_V=bestY/h;
    if(shore>0) SEA_SHORE_V=Math.min(0.99,(shore+1)/h);

  }catch(e){}
}
let FOOT_V=0.9526;
let footProbed=false;
function probeFootLine(){
  if(footProbed)return;
  const a=A(); if(!a)return;
  const im=a.get('walk_01'); if(!im||!im.naturalWidth)return;
  footProbed=true;
  try{
    const w=Math.min(im.naturalWidth,240);
    const h=Math.round(w*im.naturalHeight/im.naturalWidth);
    const c=document.createElement('canvas'); c.width=w; c.height=h;
    const g=c.getContext('2d',{willReadFrequently:true});
    g.drawImage(im,0,0,w,h);
    const d=g.getImageData(0,0,w,h).data;
    let opaque=0,last=-1;
    for(let y=0;y<h;y++){
      let any=false;
      for(let x=0;x<w;x++){
        const al=d[(y*w+x)*4+3];
        if(al>200) opaque++;
        if(al>40) any=true;
      }
      if(any) last=y;
    }
    if(opaque>w*h*0.95) return;
    if(last>0) FOOT_V=(last+1)/h;
  }catch(e){}
}
const WALK_KEYS=['walk_01','walk_02','walk_03','walk_04','walk_05'];
const SKY_T0=5000, SKY_GAP=4600;
const SKY_W='min(56vw,760px)', SKY_LEFT=50, SKY_TOP=28;
const SKY_HOLD=6200, SKY_GONE=9000;
const SKY_REFLECT=false;
const SKY_LAST=SKY_T0+(7-1)*SKY_GAP;
const WALK_FRAME_S=0.42, WALK_DELAY=SKY_LAST/1000, WALK_TRAVEL=20;
const WALK_STOP=0.55;
const WALK_SCALE0=0.52, WALK_SCALE1=0.30;
const WALK_SUB0=0.10, WALK_SUB1=0.62, WALK_SUB_MAX=0.20;
let endingT0=0, endingOn=false, endWakes=[], lastWake=0;
function showCarriedScore(){
  const host=$('carried');
  if(!host)return;
  const im=host.querySelector('img');
  if(!im)return;
  const aa=A();
  if(!aa||!aa.has('score_carried'))return;
  const bm=aa.get('score_carried');
  const url=(bm&&bm.src)?bm.src:(typeof bm==='string'?bm:null);
  if(!url)return;
  im.src=url;
  host.classList.add('on');
  setTimeout(()=>{ host.classList.remove('on'); },4200);
  setTimeout(()=>{ if(im) im.removeAttribute('src'); },6200);
}

function beginEnding(){
  showExit(false); hideCue();
  const dz=loops['destroyed'];
  if(dz) stopLoop('destroyed',3);
  if(s3.destroyed){ try{
    const T=ctx.currentTime;
    s3.destroyed.gain.gain.cancelScheduledValues(T);
    s3.destroyed.gain.gain.setValueAtTime(s3.destroyed.gain.gain.value,T);
    s3.destroyed.gain.gain.linearRampToValueAtTime(0.0001,T+4);
    s3.destroyed.src.stop(T+4.2);
  }catch(e){} s3.destroyed=null; }
  Render.stageAssets('ending').then(()=>{ probeFootLine(); probeSeaLines(); });
  loadAudio(['sea_rising']).then(()=>{ if(thomasState.scene!=='ending')return;
    stopLoop('sea',3);
    loopBuf('opensea','sea_rising',{gain:0.46,bus:'amb',fade:6,rate:0.8}); });
  thomasState.scene='ending'; thomasState.accord=0;
  endingT0=t; endingOn=true; partMode=1;
  bursts.length=0; ebNext=t+2.5;
  goalClear(); hideCue();
  { const wel=$('twatch'); if(wel) wel.classList.add('low-left'); }
  watch((WALK_DELAY+WALK_TRAVEL)*1000+6000,'let it play. just watch.');
  clearWeave(); memDim(false); hideFlashback(); spotlightOn(false);
  $('whitefade').style.opacity=0;
  $('blackfade').style.opacity=0;
  try{ sessionStorage.setItem('thomas_complete','true'); }catch(e){}

  showCarriedScore();

  const chaos=setInterval(()=>{
    if(thomasState.scene!=='ending'){ clearInterval(chaos); return; }
    if(Math.random()<0.5) Sound.playNote(Math.floor(Math.random()*N),
      {gain:0.16+Math.random()*0.2, detune:(Math.random()*2-1)*120});
  },520);
  const SKY_VO=[
    [0,'Daddy','do you think you are good enough? No!',4200],
    [2,'Wife','Yes, I do.',3400],
    [4,'Thomas','Thanks Darling, love you.',4400],
    [6,'Kid','papa, can you tell me a story tonight?',4200],
  ];
  SKY_VO.forEach(v=>{
    if(v[0]>=SKY_MEMS.length)return;
    setTimeout(()=>{ if(thomasState.scene==='ending') VO(v[1],v[2],v[3]); },
      SKY_T0+v[0]*SKY_GAP+1500);
  });

  const SKY_MASK='radial-gradient(ellipse 76% 72% at 50% 48%,#000 42%,transparent 100%)';
  const skyBox=(left,top,z,extra,w)=>
    'position:fixed;z-index:'+z+';width:'+(w||SKY_W)+';opacity:0;'+
    'pointer-events:none;left:'+left+'%;top:'+top+'%;'+
    'transition:opacity 2.6s ease,transform 2.6s ease;'+extra;
  const skyImg=()=>
    'display:block;width:100%;height:auto;min-height:11vh;object-fit:cover;'+
    '-webkit-mask-image:'+SKY_MASK+';mask-image:'+SKY_MASK+';';
  const skyFallback=(i)=>
    'display:block;width:100%;min-height:11vh;height:17vh;'+
    'background:linear-gradient('+(120+i*30)+'deg,#F2D8A8 0%,#E8A868 40%,#8FC4DE 100%);'+
    '-webkit-mask-image:'+SKY_MASK+';mask-image:'+SKY_MASK+';';
  const skyNode=(bgSrc,i)=>{
    if(bgSrc){
      const el=document.createElement('img');
      el.className='sm-img'; el.alt='';
      el.style.cssText=skyImg();
      el.onerror=()=>{
        const f=document.createElement('i');
        f.className='sm-img'; f.style.cssText=skyFallback(i);
        if(el.parentNode) el.parentNode.replaceChild(f,el);
      };
      el.src=bgSrc;
      return el;
    }
    const f=document.createElement('i');
    f.className='sm-img'; f.style.cssText=skyFallback(i);
    return f;
  };
  SKY_MEMS.forEach((m,i)=>{
    setTimeout(()=>{
      if(thomasState.scene!=='ending')return;
      const host=ROOT||document.body;
      let su=null;
      try{ su=(Assets&&Assets.urlForFile)?Assets.urlForFile(m[0]):null; }catch(e){}
      if(!su){
        try{ su=(Assets&&Assets.base)?(Assets.base()+m[0]):null; }catch(e){ su=null; }
      }

      const d=document.createElement('div');
      d.className='sky-mem'; d.dataset.asset=m[0];
      d.style.cssText=skyBox(SKY_LEFT,SKY_TOP,45,'transform:translate(-50%,-50%) scale(0.96);');
      const im=skyNode(su,i);
      d.appendChild(im);
      host.appendChild(d);

      let hv=55;
      try{
        if(Render.coverY&&A()&&A().has('bg_sea_sky'))
          hv=Render.coverY('bg_sea_sky',innerWidth,innerHeight,0,SEA_HORIZON_V)/innerHeight*100;
      }catch(e){}
      const rt=2*hv-SKY_TOP;
      let r=null;
      if(SKY_REFLECT && rt>hv+1 && rt<99){
        r=document.createElement('div');
        r.className='sky-mem sky-ref'; r.dataset.asset=m[0];
        r.style.cssText=skyBox((SKY_LEFT+(Math.random()-0.5)*3).toFixed(1),rt.toFixed(1),42,
          'transform:translate(-50%,-50%) scaleY(-1) scale(0.94);'+
          'filter:blur(1.6px) saturate(0.62) brightness(0.78);mix-blend-mode:screen;');
        r.appendChild(skyNode(su,i));
        host.appendChild(r);
      }

      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        if(!d.parentNode)return;
        if(!d.offsetHeight){
          d.style.width=SKY_W;
          im.style.height=(innerHeight*0.30).toFixed(0)+'px';
        }
        d.classList.add('on');
        d.style.opacity='1';
        d.style.transform='translate(-50%,-50%) scale(1)';
        if(r){ r.classList.add('on'); r.style.opacity='0.2'; }
      }));
      setTimeout(()=>{ d.classList.remove('on'); d.style.opacity='0';
        if(r){ r.classList.remove('on'); r.style.opacity='0'; } },SKY_HOLD);
      setTimeout(()=>{ d.remove(); if(r) r.remove(); },SKY_GONE);
    },SKY_T0+i*SKY_GAP);
  });
  setTimeout(()=>{ if(thomasState.scene==='ending') finishThread(); },
    (WALK_DELAY+WALK_TRAVEL)*1000+6000);
}
let closeT0=0, closeOn=false;
function finishThread(){
  if(closeOn)return; closeOn=true;
  closeT0=t;
  setTimeout(()=>{
    if(window.Ending){ Ending.offer('thomas'); return; }
    if(window.__ssQuit){ window.__ssQuit(); return; }
    if(window.Veil && Veil.drop) Veil.drop('index.html#at=thomas',900);
    else window.location.href='index.html#at=thomas';
  },CLOSE_MS+2400);
}
const CLOSE_MS=9000, CLOSE_ROWS=3, CLOSE_NOTES=9;

const sketch=(p)=>{
  P=p;
  p.setup=()=>{
    p.createCanvas(innerWidth,innerHeight);
    p.pixelDensity(Math.min(devicePixelRatio,2));
    window.__p5inst=p; buildStrings(p);
    scratchLayer=p.createGraphics(innerWidth,innerHeight);
    if(thomasState.scene==='stage3'){
      SCORE.w=innerWidth*0.52; SCORE.h=innerHeight*0.26;
      SCORE.x=innerWidth*0.44; SCORE.y=innerHeight*0.075;
    } else if(thomasState.scene==='stage2'){
      SCORE.w=Math.min(innerWidth*0.62,880); SCORE.h=Math.min(innerHeight*0.44,400);
      SCORE.x=(innerWidth-SCORE.w)/2; SCORE.y=innerHeight*0.155;
    } else {
      SCORE.w=innerWidth*0.66; SCORE.h=innerHeight*0.26;
      SCORE.x=innerWidth*0.17; SCORE.y=innerHeight*0.05;
    }
    for(let i=0;i<PART_MAX;i++) PARTS.push({
      x:Math.random()*innerWidth,y:Math.random()*innerHeight,
      r:Math.random()*1.8+0.6,sp:Math.random()*0.3+0.1,ph:Math.random()*9});
  };
  p.windowResized=()=>{ p.resizeCanvas(innerWidth,innerHeight); buildStrings(p);
    SCORE.w=innerWidth*0.66; SCORE.h=innerHeight*0.26; SCORE.x=innerWidth*0.17; SCORE.y=innerHeight*0.05; };
const OPTICS={
  focusIn:0.30, focusOut:0.86,
  blurMax:5.2, softScale:0.34,
  grain:0.045, grainTile:220,
  tintDeep:[26,58,84]
};
let softC=null, softX=null, maskC=null, grainC=null, opticsW=0, opticsH=0;

let opticsWide=null;
function buildOptics(W,H,wide){
  if(opticsW===W && opticsH===H && softC && opticsWide===wide) return;
  opticsW=W; opticsH=H; opticsWide=wide;
  const sw=Math.max(2,Math.round(W*OPTICS.softScale));
  const sh=Math.max(2,Math.round(H*OPTICS.softScale));
  softC=document.createElement('canvas'); softC.width=sw; softC.height=sh;
  softX=softC.getContext('2d');

  maskC=document.createElement('canvas'); maskC.width=sw; maskC.height=sh;
  const mx=maskC.getContext('2d');
  const g=mx.createRadialGradient(sw/2,sh/2,0,sw/2,sh/2,Math.hypot(sw,sh)/2);
  g.addColorStop(0,'rgba(0,0,0,0)');
  g.addColorStop(wide?0.62:OPTICS.focusIn,'rgba(0,0,0,0)');
  g.addColorStop(wide?0.95:OPTICS.focusOut,'rgba(0,0,0,0.85)');
  g.addColorStop(1,'rgba(0,0,0,1)');
  mx.fillStyle=g; mx.fillRect(0,0,sw,sh);

  const gt=OPTICS.grainTile;
  grainC=document.createElement('canvas'); grainC.width=gt; grainC.height=gt;
  const gx=grainC.getContext('2d');
  const id=gx.createImageData(gt,gt);
  let seed=0x1a2b3c;
  for(let i=0;i<id.data.length;i+=4){
    seed=(seed*1664525+1013904223)&0x7fffffff;
    const v=(seed/0x7fffffff)*255;
    id.data[i]=id.data[i+1]=id.data[i+2]=v;
    id.data[i+3]=255;
  }
  gx.putImageData(id,0,0);
}

function applyOptics(p){
  const W=p.width, H=p.height;
  if(!W||!H) return;
  const cv=p.drawingContext.canvas;
  const dc=p.drawingContext;
  const lucid=thomasState.sub==='lucid';
  const sc=thomasState.scene;
  const a=clamp(thomasState.accord,0,1);
  const decay=lucid?0:(1-a);
  buildOptics(W,H,(sc==='stage1'||sc==='stage3'));

  const plays=(sc==='stage1'||sc==='stage3');
  const blur=(sc==='entry')?0:OPTICS.blurMax*(0.32+decay*0.68)*(plays?0.45:1);
  if(blur>0.3){
    const sw=softC.width, sh=softC.height;
    softX.setTransform(1,0,0,1,0,0);
    softX.globalCompositeOperation='source-over';
    softX.clearRect(0,0,sw,sh);
    softX.filter='blur('+(blur*OPTICS.softScale).toFixed(2)+'px)';
    try{ softX.drawImage(cv,0,0,sw,sh); }catch(e){}
    softX.filter='none';
    softX.globalCompositeOperation='destination-in';
    softX.drawImage(maskC,0,0);
    softX.globalCompositeOperation='source-over';
    dc.save();
    dc.globalAlpha=lucid?0.30:(plays?0.42:0.9);
    dc.drawImage(softC,0,0,W,H);
    dc.restore();
  }

  const gA=OPTICS.grain*(lucid?0.4:(0.55+decay*0.45));
  if(gA>0.004){
    dc.save();
    dc.globalAlpha=gA;
    dc.globalCompositeOperation='overlay';
    const gt=OPTICS.grainTile;
    const ox=-((t*37)%gt), oy=-((t*23)%gt);
    for(let x=ox;x<W;x+=gt) for(let y=oy;y<H;y+=gt) dc.drawImage(grainC,x,y);
    dc.restore();
  }
}

function updateDepthLayer(){
  const vg=$('tvignette');
  if(!vg) return;
  const lucid=thomasState.sub==='lucid';
  const sc=thomasState.scene;
  const decay=lucid?0:(1-clamp(thomasState.accord,0,1));
  let vig=0.35, tint=0;
  if(lucid){ vig=0; tint=0; }
  else if(sc==='stage3'){ vig=0.35+decay*0.35; tint=0.10+decay*0.26; }
  else if(sc==='ending'){ vig=0.15; tint=0; }
  else { vig=0.35; tint=0.05+decay*0.12; }
  const c=OPTICS.tintDeep;
  vg.style.opacity=vig;
  vg.style.setProperty('--depth-tint','rgba('+c[0]+','+c[1]+','+c[2]+','+tint.toFixed(3)+')');
}

  p.draw=()=>{
    const now=performance.now(); dt=Math.min((now-lastNow)/1000,0.05); lastNow=now; t+=dt;
    if(TEST_BUILD&&window.__hudFrame) window.__hudFrame();
    p.clear();
    const sc=thomasState.scene;
    updateMemoryFocus();
    stepThree();
    if(sc==='entry'){ drawParticles(p); return; }

    pv=Math.hypot(mpx-pmx,mpy-pmy)/Math.max(dt,0.001);

    if(sc==='stage1'||sc==='stage3'){
      if(!s3.inPhoto && !UI_BLOCK && pv>PLUCK_MIN_V){
        const a={x:pmx,y:pmy},b={x:mpx,y:mpy};
        for(const s of thomasState.strings){
          if(s.state==='drowned'&&sc==='stage3'){   }
          if(crossed(a,b,s)) pluck(s,pv);
        }
      }
    }
    pmx=mpx; pmy=mpy;
    updateWater();
    updateFingerCursor();

    cam.zoom+=(cam.tz-cam.zoom)*0.035;
    if(sc==='stage3'&&!s3.inPhoto&&!s3.collapsing&&thomasState.sub!=='lucid'){
      cam.ttilt=(1-thomasState.accord)*0.012*Math.sin(t*0.11);
    }else if(thomasState.sub==='lucid'){ cam.ttilt=0; }
    else if(s3.collapsing){ cam.ttilt=0.028*Math.sin(t*0.9); }
    else cam.ttilt=0;
    cam.tilt+=(cam.ttilt-cam.tilt)*0.03;
    if(sc==='stage3'&&s3.inPhoto) cam.tz=1+s3.photoBurn*0.08;
    const irregular=(sc==='stage3')?0.3*Math.sin(t*1.7)*(1-thomasState.accord):0;
    const breath=1+(Math.sin(t*0.5)+irregular)*0.004;
    p.push();
    p.translate(p.width/2,p.height/2);
    p.rotate(cam.tilt);
    p.scale(cam.zoom*breath);
    p.translate(-p.width/2+(mpx/p.width-0.5)*-8, -p.height/2+(mpy/p.height-0.5)*-5);
    if(sc==='stage1'){ drawRoom(p); s1Idle(); }
    if(sc==='stage2'){
      if(s2.establishing) stepEstablish(dt);
      if(!s2.panning&&!s2.heldObj&&!s2.pushing&&!s2.establishing&&!overFloorObject()){
        const edge=0.16;
        const u=mpx/innerWidth;
        if(u<edge) s2PanTarget=clamp(s2PanTarget+(1-u/edge)*dt*0.85,-1,1);
        else if(u>1-edge) s2PanTarget=clamp(s2PanTarget-(1-(1-u)/edge)*dt*0.85,-1,1);
      }
      s2PanX+=(s2PanTarget-s2PanX)*Math.min(1,dt*4.5);
      layoutFloorObjects();
      updateProximity();
      stepSlips();
      if(!s2.photoFill&&!s2.done&&t-dgrT>38+Math.random()*26) runDaughter();
      const aa=A();
      if(aa && aa.has('bg_livingroom_sea'))
        Render.background(p.drawingContext,'stage2',innerWidth,innerHeight,1,
          s2PanX,(mpy/innerHeight-0.5)*0.12,Render.defocus('stage2'));
      drawDaughterShadow(p);
      drawWifeNotes(p);
    }
    if(sc==='stage3'){
      const aa=A();
      if(aa && aa.has('bg_collapse'))
        Render.background(p.drawingContext,'stage3',innerWidth,innerHeight,1,
          (mpx/innerWidth-0.5)*0.40,(mpy/innerHeight-0.5)*0.18,Render.defocus('stage3'));
      if(aa && aa.has('harp_body_clean')) Render.harpBody(p.drawingContext,innerWidth,innerHeight,thomasState.accord,harpRuin());
    }
    if(sc==='stage1'||sc==='stage3'){
      const hk=harpKeyNow();
      const aa=A();
      const artIn=!!(aa && aa.has('harp_body_clean'));
      if(hk!==lastHarpKey || (artIn && !stringsPainted)){ lastHarpKey=hk; buildStrings(p); }
    }
    if(sc!=='ending'){ drawScore(p); if(sc!=='stage2') drawHarp(p); }
    if(sc==='stage1') drawMetronomeAndClock(p,1);
    if(sc==='stage2') drawDaughterShadow(p);
    if(sc==='stage3'&&s3.inPhoto) drawBurningPhoto(p);
    if(sc==='stage3') drawWaterAndScratches(p);
    if(sc==='ending') drawEnding(p);
    if(closeOn) drawClosing(p);

    if(!(sc==='stage2'&&(s2.photoFill||s2.driftPhase))) drawParticles(p);
    drawShards(p);
    p.pop();
    drawDebugHUD(p);

    applyOptics(p);
    updateDepthLayer();
    Sound.setDepth(thomasState.accord);
  };

  function syncStringGeometry(p){
    const a=A();
    if(!(a && a.has('harp_body_clean'))) return false;
    const W=p.width, H=p.height;
    const du=0, dv=0;
    const S=thomasState.strings;
    if(S.length!==HARP_ANCHORS.length) return false;
    for(let i=0;i<HARP_ANCHORS.length;i++){
      const an=HARP_ANCHORS[i], st=S[i];
      const t0=Render.coverMap('harp_body_clean',W,H,0,HARP_PAN_Y,an[0]+du,an[1]+dv);
      const b0=Render.coverMap('harp_body_clean',W,H,0,HARP_PAN_Y,an[2]+du,an[3]+dv);
      st.xTop=t0.x; st.yTop=t0.y; st.xBot=b0.x; st.yBot=b0.y;
      st.x=(t0.x+b0.x)/2;
    }
    return true;
  }

  function drawHarp(p){
    syncStringGeometry(p);
    for(const s of thomasState.strings){
      if(s.state==='snapped'){

        const k=clamp((t-s.snapT)*2,0,1);
        p.stroke(217,131,36,60); p.strokeWeight(1.4);
        p.noFill();
        p.bezier(s.xTop,s.yTop, s.xTop+14*k,s.yTop+40, s.xTop+22*k,s.yTop+70, s.xTop+26*k,s.yTop+90);
        p.bezier(s.xBot,s.yBot, s.xBot-12*k,s.yBot-34, s.xBot-20*k,s.yBot-60, s.xBot-24*k,s.yBot-80);
        continue;
      }
      const drowned=s.state==='drowned';
      const slack=s.state==='slack';
      const R=Render;
      let col,alpha,wgt;
      if(R){
        const sc2=R.stringColour(s.id,s.isLandmark,s.state,thomasState.accord);
        col=sc2.c; alpha=sc2.alpha*255; wgt=sc2.weight;
        const painted=A()&&A().has('harp_body_clean');
        if(thomasState.scene==='stage1') wgt*=painted?1.15:2.1;
        R.carrierHalo(p.drawingContext,s,thomasState.accord,t);
      } else {
        col=s.isLandmark?[217,131,36]:[207,227,236];
        alpha=drowned?70:slack?150:220;
        wgt=s.isLandmark?2.4:1.6;
      }
      if(s.grace!=null && t-s.grace<1.6){
        const gk=1-(t-s.grace)/1.6;
        p.noStroke();
        p.fill(255,236,200,110*gk*gk);
        p.quad(s.xTop-11,s.yTop, s.xTop+11,s.yTop, s.xBot+11,s.yBot, s.xBot-11,s.yBot);
        col=[255,238,206]; alpha=Math.max(alpha,255*gk); wgt=Math.max(wgt,3.0);
      }
      if(s.phantom!=null && t-s.phantom<0.25){
        const ph=1-(t-s.phantom)/0.25;
        col=[44,126,158]; alpha=Math.max(alpha, 255*ph); wgt=Math.max(wgt, 2.6);
      }
      const limp=1-clamp(thomasState.accord,0,1);
      const vib=s.vib*Math.sin(t*lerp(46,20,limp)+s.id)*lerp(10,27,limp);
      const sag=slack?16:0;
      p.noFill();
      const mx1=stringXAt(s,(s.yTop*2+s.yBot)/3), mx2=stringXAt(s,(s.yTop+s.yBot*2)/3);
      const c1x=mx1+vib+sag*0.4, c1y=(s.yTop*2+s.yBot)/3;
      const c2x=mx2-vib+sag, c2y=(s.yTop+s.yBot*2)/3;
      p.stroke(14,26,36,alpha*0.5);
      p.strokeWeight(wgt+1.7);
      p.bezier(s.xTop,s.yTop, c1x,c1y, c2x,c2y, s.xBot,s.yBot);
      p.stroke(col[0],col[1],col[2],alpha);
      p.strokeWeight(wgt);
      p.bezier(s.xTop,s.yTop, c1x,c1y, c2x,c2y, s.xBot,s.yBot);
      s.vib*=Math.pow(lerp(0.02,0.42,limp),dt);

      if(thomasState.scene==='stage3'&&!s3.inPhoto&&!s3.collapsing
         &&thomasState.sub!=='lucid'){
        const wantId=s3.targetSeq[s3.targetPos%s3.targetSeq.length];
        if(s.id===wantId){
          const np=s3NotePos(s.id);
          const tx=np[0], ty=np[1];
          const pulse=0.5+0.5*Math.sin(t*2.2);
          const dc=p.drawingContext;

          dc.save();
          dc.globalCompositeOperation='screen';
          dc.strokeStyle='rgba(255,236,190,'+(0.30+0.34*pulse).toFixed(3)+')';
          dc.lineWidth=8;
          dc.beginPath();
          dc.moveTo(s.xTop,s.yTop); dc.lineTo(s.xBot,s.yBot);
          dc.stroke();
          dc.restore();

          dc.strokeStyle='rgba(255,238,200,'+(0.55+0.35*pulse).toFixed(3)+')';
          dc.lineWidth=2.6;
          dc.beginPath(); dc.arc(tx,ty,15+3*pulse,0,6.2832); dc.stroke();
          dc.fillStyle='rgba(255,238,200,'+(0.20+0.25*pulse).toFixed(3)+')';
          dc.beginPath(); dc.arc(tx,ty,7,0,6.2832); dc.fill();
        }
        const want=wantId;
        if(noteToString(want)===s.id){
          const mem=20+55*thomasState.accord;
          p.noStroke(); p.fill(207,227,236,mem*(0.6+0.4*Math.sin(t*3)));
          p.quad(s.xTop-6,s.yTop, s.xTop+6,s.yTop, s.xBot+6,s.yBot, s.xBot-6,s.yBot);
        }
      }
    }

    for(let i2=pdust.length-1;i2>=0;i2--){
      const d2=pdust[i2], age=t-d2.t0;
      if(age>0.8){ pdust.splice(i2,1); continue; }
      p.noStroke(); p.fill(240,208,150,120*(1-age/0.8));
      p.circle(d2.x+d2.vx*age, d2.y+d2.vy*age+30*age*age, 1.6);
    }

  }

  function drawMetronomeAndClock(p,alpha){
    const aa=A();
    const dc=p.drawingContext;
    const beat=60/thomasState.bpm;

    if(aa && aa.has('obj_clock')){
      const im=aa.get('obj_clock');
      const ch=innerHeight*0.17, cw=ch*(im.naturalWidth/im.naturalHeight);
      dc.save(); dc.globalAlpha=alpha;
      dc.drawImage(im, innerWidth*0.93-cw/2, innerHeight*0.18-ch/2, cw, ch);
      dc.restore();
    }else if(WIRE){
      const cx2=innerWidth*0.085, cy2=innerHeight*0.36, cr=innerHeight*0.045;
      p.noFill(); p.stroke(207,227,236,90*alpha); p.strokeWeight(1.4);
      p.circle(cx2,cy2,cr*2);
      p.stroke(217,131,36,150*alpha);
      p.line(cx2,cy2, cx2+Math.cos(t*0.5-1.57)*cr*0.7, cy2+Math.sin(t*0.5-1.57)*cr*0.7);
    }

    if(aa && aa.has('obj_metronome')){
      const im=aa.get('obj_metronome');
      const mh2=innerHeight*0.20, mw2=mh2*(im.naturalWidth/im.naturalHeight);
      const swing=Math.sin(Math.PI*t/beat)*0.055;
      dc.save(); dc.globalAlpha=alpha;
      dc.translate(innerWidth*0.075, innerHeight*0.70);
      dc.rotate(swing);
      dc.drawImage(im, -mw2/2, -mh2, mw2, mh2);
      dc.restore();
    }else if(WIRE){
      const mx2=innerWidth*0.085, my2=innerHeight*0.62, mh=innerHeight*0.16;
      const ang=Math.sin(Math.PI*t/beat)*0.42;
      p.push(); p.translate(mx2,my2);
      p.noStroke(); p.fill(20,36,50,200*alpha);
      p.triangle(-mh*0.32,0, mh*0.32,0, 0,-mh);
      p.stroke(217,131,36,220*alpha); p.strokeWeight(2.4);
      p.push(); p.rotate(ang);
      p.line(0,-mh*0.12,0,-mh*0.82);
      p.noStroke(); p.fill(217,131,36,230*alpha);
      p.circle(0,-mh*0.62,mh*0.09);
      p.pop(); p.pop();
    }
  }

  const embers=[];
  function burnEdge(dc,cx,cy,rx,ry,b){
    dc.beginPath();
    for(let i=0;i<=120;i++){
      const a2=i/120*Math.PI*2;
      const n=Math.sin(a2*5.3+t*1.1)*0.055+Math.sin(a2*11.7-t*0.7)*0.032
             +Math.sin(a2*23.1+t*1.9)*0.018;
      const rr=1+n;
      const px2=cx+Math.cos(a2)*rx*rr, py2=cy+Math.sin(a2)*ry*rr;
      if(i===0) dc.moveTo(px2,py2); else dc.lineTo(px2,py2);
    }
    dc.closePath();
  }
  function drawS2Drift(p){
    const dc=p.drawingContext;
    const age=(t-s2.driftT0)*1000;
    const q=clamp(age/S2_DRIFT_MS,0,1);
    dc.save();
    dc.fillStyle='rgba(3,9,15,0.92)';
    dc.fillRect(0,0,innerWidth,innerHeight);
    const sx=SCORE.x, sy=SCORE.y, sw=SCORE.w, sh=SCORE.h;
    for(let r=0;r<STEM_ORDER.length;r++){
      const key=STEM_ORDER[r];
      const v=STEM_VOICE[key];
      const peel=clamp(q*3.2-r*0.32,0,1);
      const lift=Math.pow(peel,1.6)*innerHeight*(0.52+r*0.13);
      const sway=Math.sin(t*(0.5+r*0.27)+r*2.1)*innerWidth*0.09*peel;
      const tilt=Math.sin(t*0.4+r)*0.10*peel;
      const yy=stemRowY(sy,sh,r)-lift;
      const eaten=clamp(q*1.35-r*0.10,0,1);
      const x0=sx+sw*0.06+sway, xw=sw*0.88*(1+peel*0.34);
      dc.save();
      dc.globalAlpha=Math.max(0,1-q*1.15);
      dc.lineWidth=v.w*(1-eaten*0.5);
      dc.strokeStyle='rgba('+v.rgb.join(',')+',0.7)';
      dc.beginPath();
      let drawing=false;
      const N=120;
      for(let i=0;i<=N;i++){
        const u=i/N;
        if((Math.sin(u*37+r*5.1)*0.5+0.5)<eaten){ drawing=false; continue; }
        const env=Math.sin(Math.PI*u);
        const y=yy+Math.sin(u*v.f1+t*v.drift)*sh*0.05*v.amp*env*(1-eaten*0.7)
                 +(u-0.5)*xw*tilt;
        const x=x0+xw*u;
        if(!drawing){ dc.moveTo(x,y); drawing=true; } else dc.lineTo(x,y);
      }
      dc.stroke();
      dc.restore();
      if(q<0.9){
        dc.save();
        dc.globalCompositeOperation='lighter';
        for(let i=0;i<5;i++){
          const u=clamp(i/5+((t*0.21+r*0.3)%0.2),0,1);
          if((Math.sin(u*37+r*5.1)*0.5+0.5)>=eaten) continue;
          const x=x0+xw*u, y=yy+Math.sin(t*3+i+r)*4;
          const g=dc.createRadialGradient(x,y,0,x,y,13);
          g.addColorStop(0,'rgba(255,196,104,'+(0.6*(1-q)).toFixed(3)+')');
          g.addColorStop(1,'rgba(226,116,44,0)');
          dc.fillStyle=g;
          dc.beginPath(); dc.arc(x,y,13,0,6.2832); dc.fill();
        }
        dc.restore();
      }
    }
    dc.restore();
  }
  function drawInterlude(p){
    const dc=p.drawingContext;
    const e=(t-interT0)*1000;
    const q=clamp(e/INTERLUDE_MS,0,1);
    dc.save();
    dc.fillStyle='rgba(3,9,15,0.96)';
    dc.fillRect(0,0,innerWidth,innerHeight);
    const aa=A();
    const whole=(aa&&aa.has('score_ourstory_chaos'))?aa.get('score_ourstory_chaos'):null;
    const wreck=(aa&&aa.has('score_crashed'))?aa.get('score_crashed'):null;
    const grow=clamp(q/0.55,0,1);
    const ease=grow*grow*(3-2*grow);
    const k=lerp(0.24,0.86,ease);
    const swap=clamp((q-0.46)/0.30,0,1);
    const put=(im,alpha)=>{
      if(!im||alpha<=0)return;
      const ar=im.naturalWidth/im.naturalHeight, tar=innerWidth/innerHeight;
      let dw,dh;
      if(ar>tar){ dw=innerWidth; dh=dw/ar; } else { dh=innerHeight; dw=dh*ar; }
      dw*=k; dh*=k;
      dc.globalAlpha=alpha;
      dc.drawImage(im,(innerWidth-dw)/2,(innerHeight-dh)/2,dw,dh);
      dc.globalAlpha=1;
    };
    put(whole,(1-swap)*Math.min(1,q/0.10));
    put(wreck,swap);
    if(q>0.72){
      dc.globalAlpha=(q-0.72)/0.28;
      dc.fillStyle='rgba(3,9,15,1)';
      dc.fillRect(0,0,innerWidth,innerHeight);
      dc.globalAlpha=1;
    }
    dc.restore();
  }
  function drawS2Photo(p){
    const dc=p.drawingContext;
    const rise=clamp((t-s2.photoT0)*1000/S2_PHOTO_RISE,0,1);
    const ease=rise*rise*(3-2*rise);
    dc.save();
    dc.fillStyle='rgba(3,9,15,'+(0.55+0.45*ease).toFixed(3)+')';
    dc.fillRect(0,0,innerWidth,innerHeight);
    const aa=A();
    const im=(aa&&aa.has('obj_family_photo'))?aa.get('obj_family_photo'):null;
    const burnK=s2.tearing?clamp((t-s2.tearT0)*1000/S2_TEAR_TAIL,0,1):0;
    const k=lerp(0.12,0.74,ease);
    let px=0,py=0,pw=0,ph2=0;
    if(im){
      const ar=im.naturalWidth/im.naturalHeight, tar=innerWidth/innerHeight;
      let dw,dh;
      if(ar>tar){ dw=innerWidth; dh=dw/ar; } else { dh=innerHeight; dw=dh*ar; }
      dw*=k; dh*=k;
      px=(innerWidth-dw)/2; py=(innerHeight-dh)/2; pw=dw; ph2=dh;
      if(s2.tearing){
        dc.filter='blur('+(burnK*3.0).toFixed(2)+'px) saturate('+(1-burnK*0.72).toFixed(2)+
                  ') brightness('+(1-burnK*0.22).toFixed(2)+')';
      }
      dc.drawImage(im,px,py,dw,dh);
      dc.filter='none';
      if(s2.tearing){
        dc.save();
        dc.globalCompositeOperation='destination-out';
        const holes=Math.round(burnK*26);
        for(let i=0;i<holes;i++){
          const seed=i*137.13;
          const hx=px+pw*((Math.sin(seed)*0.5+0.5));
          const hy=py+ph2*((Math.cos(seed*1.7)*0.5+0.5));
          const hr=Math.min(pw,ph2)*(0.03+((i*7)%9)/60)*(0.4+burnK*1.5);
          dc.beginPath();
          for(let a2=0;a2<12;a2++){
            const an=a2/12*6.283;
            const rr=hr*(0.7+0.5*Math.sin(an*3+seed));
            const xx=hx+Math.cos(an)*rr, yy2=hy+Math.sin(an)*rr;
            a2===0?dc.moveTo(xx,yy2):dc.lineTo(xx,yy2);
          }
          dc.closePath(); dc.fill();
        }
        dc.restore();
        dc.save();
        dc.globalCompositeOperation='lighter';
        for(let i=0;i<holes;i++){
          const seed=i*137.13;
          const hx=px+pw*((Math.sin(seed)*0.5+0.5));
          const hy=py+ph2*((Math.cos(seed*1.7)*0.5+0.5));
          const hr=Math.min(pw,ph2)*(0.03+((i*7)%9)/60)*(0.4+burnK*1.5);
          const gg=dc.createRadialGradient(hx,hy,hr*0.72,hx,hy,hr*1.5);
          gg.addColorStop(0,'rgba(255,168,72,0)');
          gg.addColorStop(0.45,'rgba(255,168,72,'+(0.55*(1-burnK*0.4)).toFixed(3)+')');
          gg.addColorStop(1,'rgba(200,84,28,0)');
          dc.fillStyle=gg;
          dc.beginPath(); dc.arc(hx,hy,hr*1.5,0,6.2832); dc.fill();
        }
        dc.restore();
      }
    }else{
      pw=innerWidth*0.7*k/0.74; ph2=innerHeight*0.7*k/0.74;
      px=(innerWidth-pw)/2; py=(innerHeight-ph2)/2;
      dc.fillStyle='rgba(226,236,242,0.9)';
      dc.fillRect(px,py,pw,ph2);
    }
    s2.photoBox=[px,py,pw,ph2];
    if(s2.tearing){
      const age=(t-s2.tearT0)*1000;
      const q=clamp(age/S2_TEAR_TAIL,0,1);
      if(!s2.rips){
        s2.rips=[];
        for(let r2=0;r2<13;r2++){
          const vert=Math.random()<0.55;
          s2.rips.push({vert:vert, at:0.14+Math.random()*0.72,
            t0:t+r2*0.42+Math.random()*0.3,
            dx:(Math.random()-0.5)*innerWidth*0.06,
            dy:(Math.random()-0.5)*innerHeight*0.05,
            rot:(Math.random()-0.5)*0.09});
        }
      }
      if(tears.length<44 && Math.random()<0.85){
        const edge=Math.random();
        tears.push({
          x:edge<0.5?(px+Math.random()*pw):(Math.random()<0.5?px:px+pw),
          y:edge<0.5?(Math.random()<0.5?py:py+ph2):(py+Math.random()*ph2),
          a:Math.random()*6.283, len:0, max:pw*(0.20+Math.random()*0.55),
          w:3+Math.random()*7, t0:t
        });
      }
      if(s2.rips){
        dc.save();
        dc.globalCompositeOperation='destination-out';
        dc.lineWidth=3.2;
        dc.lineCap='round';
        for(const rp of s2.rips){
          const a2=t-rp.t0;
          if(a2<0) continue;
          const gr=clamp(a2/1.1,0,1);
          dc.beginPath();
          if(rp.vert){
            const rx=px+pw*rp.at;
            dc.moveTo(rx,py);
            const seg=14;
            for(let i=1;i<=seg*gr;i++)
              dc.lineTo(rx+Math.sin(i*1.9+rp.at*11)*7, py+ph2*(i/seg));
          }else{
            const ry=py+ph2*rp.at;
            dc.moveTo(px,ry);
            const seg=14;
            for(let i=1;i<=seg*gr;i++)
              dc.lineTo(px+pw*(i/seg), ry+Math.sin(i*1.9+rp.at*11)*7);
          }
          dc.stroke();
        }
        dc.restore();
        dc.save();
        dc.globalCompositeOperation='lighter';
        dc.lineWidth=1.4;
        for(const rp of s2.rips){
          const a2=t-rp.t0;
          if(a2<0) continue;
          const gr=clamp(a2/1.1,0,1);
          dc.strokeStyle='rgba(255,178,86,'+(0.5*(1-clamp((a2-1.1)/2.4,0,1))).toFixed(3)+')';
          dc.beginPath();
          if(rp.vert){
            const rx=px+pw*rp.at;
            dc.moveTo(rx,py);
            for(let i=1;i<=14*gr;i++)
              dc.lineTo(rx+Math.sin(i*1.9+rp.at*11)*7, py+ph2*(i/14));
          }else{
            const ry=py+ph2*rp.at;
            dc.moveTo(px,ry);
            for(let i=1;i<=14*gr;i++)
              dc.lineTo(px+pw*(i/14), ry+Math.sin(i*1.9+rp.at*11)*7);
          }
          dc.stroke();
        }
        dc.restore();
      }
      dc.save();
      dc.globalCompositeOperation='destination-out';
      dc.lineCap='round';
      for(const tr of tears){
        tr.len=Math.min(tr.max,tr.len+innerWidth*0.35*dt);
        dc.lineWidth=tr.w;
        dc.beginPath();
        dc.moveTo(tr.x,tr.y);
        let px=tr.x,py=tr.y;
        const seg=8;
        for(let i=1;i<=seg;i++){
          const a0=tr.a+Math.sin(i*1.7+tr.t0)*0.32;
          px+=Math.cos(a0)*tr.len/seg; py+=Math.sin(a0)*tr.len/seg;
          dc.lineTo(px,py);
        }
        dc.stroke();
      }
      dc.restore();
      dc.save();
      dc.globalCompositeOperation='lighter';
      for(const tr of tears){
        let px=tr.x,py=tr.y;
        const seg=8;
        for(let i=1;i<=seg;i++){
          const a0=tr.a+Math.sin(i*1.7+tr.t0)*0.32;
          px+=Math.cos(a0)*tr.len/seg; py+=Math.sin(a0)*tr.len/seg;
        }
        const g=dc.createRadialGradient(px,py,0,px,py,tr.w*4.5);
        g.addColorStop(0,'rgba(255,196,104,0.85)');
        g.addColorStop(0.4,'rgba(226,116,44,0.42)');
        g.addColorStop(1,'rgba(226,116,44,0)');
        dc.fillStyle=g;
        dc.beginPath(); dc.arc(px,py,tr.w*4.5,0,6.2832); dc.fill();
      }
      dc.restore();
      dc.save();
      dc.globalCompositeOperation='multiply';
      const eg=dc.createRadialGradient(innerWidth/2,innerHeight/2,pw*0.18,
                                       innerWidth/2,innerHeight/2,pw*0.62);
      eg.addColorStop(0,'rgba(190,160,120,0)');
      eg.addColorStop(0.62,'rgba(126,74,32,'+(0.55*q).toFixed(3)+')');
      eg.addColorStop(1,'rgba(46,22,10,'+(0.92*q).toFixed(3)+')');
      dc.fillStyle=eg; dc.fillRect(px,py,pw,ph2);
      dc.restore();
      dc.save();
      dc.globalCompositeOperation='lighter';
      for(let i=0;i<Math.round(22*q);i++){
        const ex=px+Math.random()*pw, ey=py+ph2-((t*70+i*61)%(ph2+40));
        dc.fillStyle='rgba(255,'+(150+Math.floor(Math.random()*90))+',70,'+(0.5*q).toFixed(3)+')';
        dc.beginPath(); dc.arc(ex,ey,1+Math.random()*2.2,0,6.2832); dc.fill();
      }
      dc.restore();
      dc.save();
      dc.globalAlpha=0.13*q;
      dc.fillStyle='#6B6257';
      for(let i=0;i<5;i++){
        const yy=innerHeight*0.9-((t*36+i*70)%(innerHeight*0.95));
        dc.beginPath();
        dc.ellipse(innerWidth*0.5+Math.sin(t*0.7+i)*innerWidth*0.16, yy,
                   innerWidth*(0.10+i*0.03), innerHeight*0.07, 0,0,6.2832);
        dc.fill();
      }
      dc.restore();
    }
    dc.restore();
  }
  function drawS2Burn(p){

    const b=s2.burn;
    const dc=p.drawingContext;
    p.noStroke(); p.fill(2,8,14,200*b); p.rect(0,0,innerWidth,innerHeight);
    const aa=A();
    const ph=(aa&&aa.has('score_ourstory_chaos'))?aa.get('score_ourstory_chaos'):null;
    let w=Math.min(innerWidth*0.52,720), h=w*0.5;
    if(ph){ h=w*(ph.naturalHeight/ph.naturalWidth); }
    const x=(innerWidth-w)/2, y=(innerHeight-h)/2;

    dc.save();
    if(ph){ dc.drawImage(ph,x,y,w,h); }
    else{
      p.fill(234,242,246,230); p.rect(x,y,w,h,3);
      p.fill(44,74,94); p.rect(x+w*0.08,y+h*0.12,w*0.84,h*0.6);
    }
    const cx=x+w*0.5, cy=y+h*0.52;
    const rx=w*0.62*b, ry=h*0.78*b;

    if(b>0.01){
      dc.globalCompositeOperation='destination-out';
      burnEdge(dc,cx,cy,rx,ry,b);
      dc.fill();
      dc.globalCompositeOperation='source-over';

      dc.save();
      burnEdge(dc,cx,cy,rx*1.10,ry*1.10,b);
      dc.clip();
      burnEdge(dc,cx,cy,rx,ry,b);
      dc.globalCompositeOperation='source-atop';
      const gr=dc.createRadialGradient(cx,cy,Math.max(1,rx*0.7),cx,cy,Math.max(2,rx*1.12));
      gr.addColorStop(0,'rgba(28,14,6,0)');
      gr.addColorStop(0.55,'rgba(34,18,8,0.92)');
      gr.addColorStop(0.86,'rgba(96,42,12,0.9)');
      gr.addColorStop(1,'rgba(255,168,54,0)');
      dc.fillStyle=gr; dc.fillRect(x-40,y-40,w+80,h+80);
      dc.restore();

      dc.save();
      dc.globalCompositeOperation='lighter';
      dc.lineWidth=2.6+Math.sin(t*7)*0.9;
      dc.strokeStyle='rgba(255,'+(150+Math.floor(Math.sin(t*9)*36))+',48,'+(0.72*Math.min(b*4,1)).toFixed(2)+')';
      burnEdge(dc,cx,cy,rx*1.012,ry*1.012,b);
      dc.stroke();
      dc.lineWidth=8;
      dc.strokeStyle='rgba(255,120,26,0.16)';
      dc.stroke();
      dc.restore();
    }
    dc.restore();

    if(b>0.03 && embers.length<90 && Math.random()<0.75){
      const a2=Math.random()*Math.PI*2;
      embers.push({x:cx+Math.cos(a2)*rx,y:cy+Math.sin(a2)*ry,
                   vx:(Math.random()-0.5)*22,vy:-24-Math.random()*46,
                   a:1,s:1+Math.random()*2.2});
    }
    dc.save();
    dc.globalCompositeOperation='lighter';
    for(let i=embers.length-1;i>=0;i--){
      const e=embers[i];
      e.x+=e.vx*dt; e.y+=e.vy*dt; e.vy+=8*dt; e.vx+=Math.sin(t*3+e.y*0.01)*10*dt;
      e.a-=dt*0.42;
      if(e.a<=0){ embers.splice(i,1); continue; }
      dc.fillStyle='rgba(255,'+(140+Math.floor(e.a*90))+',60,'+(e.a*0.85).toFixed(3)+')';
      dc.beginPath(); dc.arc(e.x,e.y,e.s*e.a,0,6.2832); dc.fill();
    }
    dc.restore();

    if(b>0.06){
      dc.save();
      dc.globalAlpha=0.10*Math.min(b*2,1);
      dc.fillStyle='#6B6257';
      for(let k=0;k<5;k++){
        const yy=cy-ry-k*innerHeight*0.06-((t*26+k*40)%60);
        dc.beginPath();
        dc.ellipse(cx+Math.sin(t*0.6+k)*40,yy,rx*0.5+k*18,26+k*10,0,0,6.2832);
        dc.fill();
      }
      dc.restore();
    }
  }

function s3NotePos(n){
  const i=thomasState.score.filled.indexOf(n);
  const q=s1NotePos(i<0?thomasState.score.filled.length:i);
  if(q) return q;
  const staveT=SCORE.y+SCORE.h*0.20, staveB=SCORE.y+SCORE.h*0.86;
  return [ HARP.x0+n*HARP.span/(N-1)+mapDrift(n),
           staveB-(staveB-staveT)*(n/(N-1))*0.92 ];
}
function drawRoom(p){
  if(thomasState.scene!=='stage1') return;
  const dc=p.drawingContext, W=innerWidth, H=innerHeight;
  const a=A();
  const bgPan=(mpx/W-0.5)*0.34, bgPanY=(mpy/H-0.5)*0.16;
  if(a && a.has('bg_practice'))
    Render.background(dc,'stage1',W,H,1,bgPan,bgPanY,Render.defocus('stage1'));
  if(a && a.has('harp_body_clean')){
    Render.harpBody(dc,W,H,thomasState.accord,harpRuin());
    return;
  }
  if(a && a.has('bg_practice')) return;
  if(!WIRE) return;
  dc.strokeStyle='rgba(24,42,56,0.11)';
  dc.lineWidth=1;
  for(let x=0;x<=W;x+=W/12){ dc.beginPath(); dc.moveTo(x,0); dc.lineTo(x,H); dc.stroke(); }
  for(let y=0;y<=H;y+=H/8){ dc.beginPath(); dc.moveTo(0,y); dc.lineTo(W,y); dc.stroke(); }
  dc.fillStyle='rgba(30,50,64,0.18)';
  dc.fillRect(0,H*0.86,W,H*0.14);
  dc.strokeStyle='rgba(24,42,56,0.28)';
  dc.lineWidth=1.5;
  dc.beginPath(); dc.moveTo(0,H*0.86); dc.lineTo(W,H*0.86); dc.stroke();
  dc.fillStyle='rgba(22,38,50,0.28)';
  dc.fillRect(0,0,W*0.055,H);
  dc.strokeStyle='rgba(20,34,46,0.5)';
  dc.lineWidth=2;
  dc.beginPath(); dc.moveTo(W*0.055,0); dc.lineTo(W*0.055,H); dc.stroke();
}
function staffLine(p, x0, yb, x1, amp, ph){
  if(amp < 0.5){ p.line(x0, yb, x1, yb); return; }
  p.noFill(); p.beginShape();
  for(let x=x0; x<=x1; x+=6){
    p.vertex(x, yb + Math.sin(x*0.03+ph)*amp + Math.sin(x*0.018-ph*1.3)*amp*0.4);
  }
  p.endShape();
}
function scoreArtKey(){
  const placed=thomasState.objects.placed.length;
  if(!s2.pushLatched) return 'score_ourstory_closed';
  if(placed>=3) return 'score_ourstory_chaos';
  return 'score_ourstory_half';
}
function drawScoreArt(p,sx,sy,sw,sh,alpha){
  const aa=A(); if(!aa) return false;
  const key=scoreArtKey();
  if(!aa.has(key)) return false;
  const im=aa.get(key);
  const ar=im.naturalWidth/im.naturalHeight;
  let iw=sw, ih=iw/ar;
  if(ih>sh){ ih=sh; iw=ih*ar; }
  const dc=p.drawingContext;
  const ix=sx+sw/2-iw/2, iy=sy+sh/2-ih/2;
  dc.save(); dc.globalAlpha=alpha==null?1:alpha;
  dc.drawImage(im, ix, iy, iw, ih);
  dc.restore();
  SCORE_ART.x=ix; SCORE_ART.y=iy; SCORE_ART.w=iw; SCORE_ART.h=ih; SCORE_ART.ok=true;
  return true;
}

function drawDebugHUD(p){
  if(!DEBUG) return;
  const a=A();
  const dc=p.drawingContext;
  const S=thomasState.strings;
  const painted=!!(a&&a.has('harp_body_clean'));
  const man=a?a.manifest:{};
  let have=0, tot=0;
  for(const k in man){ tot++; if(a.has(k)) have++; }
  const st={};
  S.forEach(x=>{ st[x.state]=(st[x.state]||0)+1; });
  const s0=S[0], sm=S[Math.floor(S.length/2)];
  const lines=[
    'scene '+thomasState.scene+'   accord '+thomasState.accord.toFixed(2),
    'images '+have+'/'+tot+'   base '+(a?a.base():'?'),
    'strings '+S.length+'   painted-anchors '+painted+'   built-painted '+stringsPainted,
    'states '+JSON.stringify(st),
    s0?('s0  top '+s0.xTop.toFixed(0)+','+s0.yTop.toFixed(0)+'  bot '+s0.xBot.toFixed(0)+','+s0.yBot.toFixed(0)):'',
    sm?('s'+Math.floor(S.length/2)+'  top '+sm.xTop.toFixed(0)+','+sm.yTop.toFixed(0)+'  bot '+sm.xBot.toFixed(0)+','+sm.yBot.toFixed(0)):'',
    'score.filled '+thomasState.score.filled.length+'   played '+s1.idx+'/'+S1_NOTES,
    'viewport '+innerWidth+'x'+innerHeight
  ].filter(Boolean);
  dc.save();
  dc.setTransform(1,0,0,1,0,0);
  dc.fillStyle='rgba(0,0,0,0.72)';
  dc.fillRect(8,8,460,18*lines.length+16);
  dc.fillStyle='#8FE3A8';
  dc.font='12px ui-monospace,Menlo,monospace';
  lines.forEach((l,i)=>dc.fillText(l,18,28+i*18));
  dc.restore();
}

const STEM_VOICE={
  wave   :{rgb:[126,178,206], f1:9,  f2:23, amp:1.30, w:2.6, drift:0.55},
  child  :{rgb:[232,180,200], f1:38, f2:74, amp:0.62, w:1.7, drift:2.60},
  harmony:{rgb:[217,192,138], f1:17, f2:41, amp:0.92, w:2.2, drift:1.05},
  melody :{rgb:[238,246,250], f1:26, f2:53, amp:1.10, w:3.0, drift:1.55}
};
const stemGhost={}, stemFlat={}, stemPeak={};
const STEM_PEAK_FLOOR=0.035, STEM_PEAK_FALL=0.22, STEM_HEADROOM=0.42;
function masterSamples(){
  if(!analyser||!anaBuf) return null;
  try{ analyser.getByteTimeDomainData(anaBuf); }catch(e){ return null; }
  return anaBuf;
}
function stemSamples(key){
  const st=stems[key];
  if(!st||!st.ana||!st.buf8) return null;
  try{ st.ana.getByteTimeDomainData(st.buf8); }catch(e){ return null; }
  const b=st.buf8;
  let pk=0;
  for(let i=0;i<b.length;i+=4){
    const a0=Math.abs(b[i]-128)/128;
    if(a0>pk) pk=a0;
  }
  const prev=stemPeak[key]==null?STEM_PEAK_FLOOR:stemPeak[key];
  stemPeak[key]=pk>prev?pk:Math.max(STEM_PEAK_FLOOR,prev-STEM_PEAK_FALL*dt);
  return b;
}
function stemWavePath(dc,key,sx,sy,sw,yy,amp,phase,samples,g,ceil,row){
  const v=STEM_VOICE[key];
  const dk=desyncK();
  const rate=dk>0?lerp(1,DESYNC_DRIFT[(row||0)%4],dk):1;
  const shift=dk>0?dk*0.16*((row||0)%2?1:-1):0;
  const x0=sx+sw*0.06, xw=sw*0.88;
  const norm=(samples&&dk<=0)?(1/Math.max(STEM_PEAK_FLOOR,stemPeak[key]||STEM_PEAK_FLOOR)):1;
  const lim=ceil||amp;
  dc.beginPath();
  const N=132;
  for(let i=0;i<=N;i++){
    const u=i/N, x=x0+xw*u;
    const env=Math.sin(Math.PI*u);
    const su=clamp(u*rate+shift,0,1);
    let y;
    if(samples){
      const si=Math.min(samples.length-1,Math.floor(su*samples.length));
      const a0=(samples[si]-128)/128;
      y=yy+clamp(a0*norm*amp,-lim,lim)*env;
    }else{
      y=yy+Math.sin(su*v.f1+phase)*amp*env
         +Math.sin(su*v.f2-phase*1.4)*amp*0.34*env;
    }
    if(i===0) dc.moveTo(x,y); else dc.lineTo(x,y);
  }
}
function scoreWeight(){
  const n=thomasState.objects.placed.length;
  if(!n) return {sink:0,shiver:0};
  const k=Math.pow(n/4,1.85);
  return {sink:SCORE.h*0.085*k,
          shiver:(n>=4?Math.sin(t*11.3)*1.5+Math.sin(t*7.1)*0.9:0)*k};
}
function stemRowY(sy,sh,r){ return sy+sh*(0.20+r*0.185); }
const DESYNC_DRIFT=[1.00,0.86,1.19,0.71];
const HB_RATE={wave:0.92,harmony:1.06,melody:1.00,child:1.34};
function heartbeat(key,sk){
  const hz=(HB_RATE[key]||1)*(1+(sk||0)*1.35);
  const ph=(t*hz)%1;
  const pulse=Math.exp(-Math.pow((ph-0.06)/0.055,2))
             +Math.exp(-Math.pow((ph-0.20)/0.075,2))*0.55;
  const depth=0.16*(1-(sk||0)*0.86);
  return 1+pulse*depth;
}
function desyncK(){
  if(!s2.wrongStarted) return 0;
  return clamp((t-(s2.wrongT0||t))/9,0,1);
}
function desyncOffset(r){
  const k=desyncK();
  if(k<=0) return 0;
  const gap=SCORE.h*0.185;
  return Math.sin(t*(0.34+r*0.21)+r*1.7)*gap*0.42*k
       + (r-1.5)*gap*0.30*k;
}
function drawStemWaves(p,sx,sy,sw,sh){
  const placed=thomasState.objects.placed;
  const dc=p.drawingContext;
  const rows=STEM_ORDER.length;
  const x0=sx+sw*0.06;
  dc.save();
  for(let r=0;r<rows;r++){
    const key=STEM_ORDER[r];
    const v=STEM_VOICE[key];
    const live=placed.indexOf(key)>=0;
    const sk=slipK[key]||0;
    const g=live&&stems[key]&&stems[key].gain?stems[key].gain.gain.value:0;
    const yy=stemRowY(sy,sh,r)+desyncOffset(r);
    const dk=desyncK();
    if(live&&(g>=0.02||dk>0)){
      stemGhost[key]=t; stemFlat[key]=0;
      if(g<0.02) stemPeak[key]=STEM_PEAK_FLOOR;
      const gap=sh*0.185;
      const ceil=gap*STEM_HEADROOM;
      const beat=heartbeat(key,sk);
      const amp=ceil*(0.42+0.58*Math.min(1,Math.max(g,dk*0.72)))*v.amp/1.30*beat;
      const smp=dk>0?masterSamples():stemSamples(key);
      stemWavePath(dc,key,sx,sy,sw,yy,amp,t*v.drift+r*37.1,smp,g,ceil,r);
      dc.lineWidth=v.w*(1-sk*0.45);
      dc.strokeStyle='rgba('+v.rgb.join(',')+','+
        ((0.42+0.5*Math.max(g,dk*0.62))*(1-sk*0.72)).toFixed(3)+')';
      dc.stroke();
      dc.lineWidth=v.w+3.4+sk*7;
      dc.strokeStyle='rgba('+v.rgb.join(',')+','+(0.11+sk*0.20).toFixed(3)+')';
      dc.stroke();

      dc.save();
      dc.globalAlpha=0.9;
      dc.fillStyle='rgba('+v.rgb.join(',')+',0.9)';
      dc.beginPath(); dc.arc(x0-sw*0.022,yy,2.6+1.2*g,0,6.2832); dc.fill();
      dc.restore();
    }else if(stemGhost[key]!=null){
      const age=t-stemGhost[key];
      const k=clamp(1-age/1.25,0,1);
      stemFlat[key]=1-k;
      const amp=sh*0.185*STEM_HEADROOM*0.5*k*v.amp/1.30;
      stemWavePath(dc,key,sx,sy,sw,yy,amp,t*v.drift*0.25+r*37.1,null,0,amp,r);
      dc.lineWidth=lerp(1.1,v.w,k);
      dc.strokeStyle='rgba('+v.rgb.join(',')+','+(0.10+0.32*k).toFixed(3)+')';
      dc.stroke();

      if(age>0.4){
        const bx=x0+sw*0.88*(0.24+0.5*((r*0.37)%1));
        const q=clamp((age-0.4)/0.9,0,1);
        dc.save();
        dc.globalCompositeOperation='destination-out';
        dc.lineWidth=v.w+4;
        dc.lineCap='round';
        dc.beginPath();
        dc.moveTo(bx-sw*0.035*q,yy); dc.lineTo(bx+sw*0.035*q,yy);
        dc.stroke();
        dc.restore();
        dc.save();
        dc.globalAlpha=0.5*q;
        dc.fillStyle='rgba('+v.rgb.join(',')+',0.5)';
        dc.beginPath(); dc.arc(bx-sw*0.035*q,yy,1.6,0,6.2832); dc.fill();
        dc.beginPath(); dc.arc(bx+sw*0.035*q,yy,1.6,0,6.2832); dc.fill();
        dc.restore();
      }
      if(age>3.4) delete stemGhost[key];
    }
  }
  dc.restore();
}

let wifeLive=0;
function drawWifeNotes(p){
  const aa=A(); if(!aa||!aa.has('wife_notes')) return;
  const placed=thomasState.objects.placed.length;
  if(placed<1) return;
  const im=aa.get('wife_notes');
  const h2=innerHeight*0.20, w2=h2*(im.naturalWidth/im.naturalHeight);
  const dc=p.drawingContext;
  dc.save();
  let wash=0;
  for(const k in slipK) wash=Math.max(wash,slipK[k]);
  const hasRing=thomasState.objects.placed.indexOf('harmony')>=0;
  let pulse=1;
  if(hasRing){
    const smp=stemSamples('harmony');
    let pk=0;
    if(smp){ for(let i=0;i<smp.length;i+=6){
      const a0=Math.abs(smp[i]-128)/128; if(a0>pk) pk=a0; } }
    const norm=clamp(pk/Math.max(STEM_PEAK_FLOOR,stemPeak.harmony||STEM_PEAK_FLOOR),0,1);
    const g=stems.harmony&&stems.harmony.gain?stems.harmony.gain.gain.value:0;
    wifeLive=wifeLive+((0.30+0.70*norm)*clamp(g,0,1)-wifeLive)*Math.min(1,dt*7);
    pulse=0.34+0.66*wifeLive;
  }else{
    wifeLive=wifeLive+(0-wifeLive)*Math.min(1,dt*2.2);
    pulse=0.30+0.70*wifeLive;
  }
  dc.globalAlpha=Math.min(0.62, 0.16*placed)*(1-wash*0.85)*pulse;
  dc.globalCompositeOperation='multiply';
  let f='';
  if(wash>0.02) f='blur('+(wash*3.2).toFixed(2)+'px) ';
  dc.filter=f+'sepia(0.35) saturate('+(0.55-wash*0.3).toFixed(2)+') contrast(1.05)';
  const marginX=SCORE.x+SCORE.w*0.955;
  const marginY=SCORE.y+SCORE.h*0.30;
  dc.translate(marginX, marginY);
  dc.rotate(-0.035);
  dc.drawImage(im, -w2*0.5, -h2*0.5, w2*0.78, h2*0.78);
  dc.filter='none';
  dc.restore();
}

const DGR_R=132;
function drawShadowRipple(p){
  const age=t-dgrPop;
  if(age<0||age>2.2) return;
  const k=age/2.2;
  const dc=p.drawingContext;
  dc.save();
  dc.globalCompositeOperation='lighter';
  for(let i=0;i<3;i++){
    const q=clamp(k*1.35-i*0.16,0,1);
    if(q<=0) continue;
    dc.strokeStyle='rgba(126,178,204,'+(0.34*(1-q)).toFixed(3)+')';
    dc.lineWidth=1.6*(1-q)+0.4;
    dc.beginPath();
    dc.ellipse(dgrPX,dgrPY, DGR_R*0.42+q*DGR_R*1.15, (DGR_R*0.42+q*DGR_R*1.15)*0.42, 0,0,6.2832);
    dc.stroke();
  }
  dc.globalAlpha=0.5*(1-k);
  dc.fillStyle='rgba(150,196,218,0.5)';
  for(let i=0;i<9;i++){
    const a0=i*0.7+t*0.8;
    const rr=DGR_R*0.3*(0.3+k);
    dc.beginPath();
    dc.arc(dgrPX+Math.cos(a0)*rr, dgrPY+Math.sin(a0)*rr*0.5-k*36, 2.2*(1-k), 0,6.2832);
    dc.fill();
  }
  dc.restore();
}
function drawDaughterShadow(p){
  if(s2.photoFill||s2.done||s2.driftPhase){ dgrT=-99; dgrPop=-99; return; }
  drawShadowRipple(p);
  const aa=A(); if(!aa||!aa.has('daughter_running')) return;
  const age=t-dgrT;
  if(age>4.4) return;
  const k=age/4.4;
  const cx=innerWidth*dgrX+(dgrDir>0?-1:1)*innerWidth*0.10*(k-0.5);
  const cy=innerHeight*dgrY-innerHeight*0.17;
  if(age>0.35 && Math.hypot(mpx-cx,mpy-cy)<DGR_R){
    dgrPop=t; dgrPX=cx; dgrPY=cy; dgrT=-99;
    return;
  }
  const im=aa.get('daughter_running');
  const h2=innerHeight*0.34, w2=h2*(im.naturalWidth/im.naturalHeight);
  const dc=p.drawingContext;
  dc.save();
  dc.globalAlpha=0.78*Math.sin(Math.PI*Math.pow(k,0.72));
  dc.translate((dgrDir>0?-1:1)*innerWidth*0.10*(k-0.5),0);
  dc.translate(innerWidth*dgrX,innerHeight*dgrY);
  if(dgrDir<0) dc.scale(-1,1);
  dc.drawImage(im, -w2/2, -h2, w2, h2);
  dc.restore();
}

function drawScore(p){
    const sc=thomasState.scene;
    if(sc==='stage3'&&s3.interlude){ drawInterlude(p); return; }
    if(sc==='stage2'&&s2.photoFill){ drawS2Photo(p); return; }
    if(sc==='stage2'&&s2.driftPhase){ drawS2Drift(p); return; }
    if(sc==='stage2'&&s2.burnPhase){ drawS2Burn(p); return; }
    const openK=(sc==='stage2'&&!s2.pushLatched)?SCORE.open:1;

    let sx=SCORE.x, sy=SCORE.y, sw=SCORE.w, sh=SCORE.h, finite=false;
    if(sc==='stage1'||sc==='stage3'){
      sx=innerWidth*0.70; sy=innerHeight*0.10;
      sw=innerWidth*0.24; sh=innerHeight*0.5; finite=true;
      const aa=A();
      if(aa && aa.has('score_father')){
        const im=aa.get('score_father');
        const ih=sh, iw=ih*(im.naturalWidth/im.naturalHeight);
        const ix=sx+sw/2-iw/2;
        const dc=p.drawingContext;
        dc.save();
        dc.globalAlpha=sc==='stage3'?lerp(0.92,0.55,1-clamp(thomasState.accord/0.30,0,1)):0.92;
        dc.drawImage(im, ix, sy, iw, ih);
        dc.restore();
        S1_SCORE_BOX.x=ix; S1_SCORE_BOX.y=sy;
        S1_SCORE_BOX.w=iw; S1_SCORE_BOX.h=ih; S1_SCORE_BOX.ok=true;
      }
    }
    if(sc==='stage2'&&s2.pushLatched){
      const w=scoreWeight();
      const dc=p.drawingContext;
      dc.save(); dc.translate(0,w.sink+w.shiver);
      const got=drawScoreArt(p,sx,sy,sw,sh,1);
      if(got&&SCORE_ART.ok)
        drawStemWaves(p,SCORE_ART.x,SCORE_ART.y,SCORE_ART.w,SCORE_ART.h);
      dc.restore();
      return;
    }
    if(sc==='stage2'&&!s2.pushLatched){
      s2SpringV += (openK - s2Spring)*0.16; s2SpringV *= 0.74; s2Spring += s2SpringV;
      const so=Math.max(0, s2Spring);
      const idle=s2.pushing?0:Math.sin(t*1.2)*1.5;
      const cy=sy - so*(sh+30) + idle;
      const bend=Math.max(-16, Math.min(16, s2SpringV*(sh+30)));
      const aa2=A();
      const cov=(aa2&&aa2.has('score_ourstory_closed'))?aa2.get('score_ourstory_closed'):null;
      if(cov){
        const car=cov.naturalWidth/cov.naturalHeight;
        let iw=sw, ih=iw/car;
        if(ih>sh){ ih=sh; iw=ih*car; }
        const dc=p.drawingContext;
        dc.save();
        dc.translate(sx+sw/2, cy+sh/2);
        dc.rotate(bend*0.0012);
        dc.drawImage(cov, -iw/2, -ih/2, iw, ih);
        dc.restore();
      }
      return;
    }
    const A2=A();
    const artUnder=!!A2&&((sc==='stage1'||sc==='stage3') ? A2.has('score_father') : false);
    if(openK<0.5)return;

    const filled=thomasState.score.filled;
    const slotW=Math.max(46,sw/10);
    const isS3=(sc==='stage3');
    const slotPos=i=>{
      if(isS3){ const n=filled[i]; return s3NotePos(n==null?0:n); }
      if(sc==='stage1'){ const q=s1NotePos(i); if(q) return q; }
      return [sx+14+(i%9)*slotW+slotW*0.4, sy+30+Math.floor(i/9)*sh*0.3];
    };
    if(isS3&&!artUnder){
      p.stroke(207,227,236,26);
      for(let l=0;l<5;l++){
        const yy=SCORE.y+SCORE.h*0.20+(SCORE.h*0.66)*(l/4);
        p.line(sx+18,yy,sx+sw-18,yy);
      }
    }
    if(sc==='stage1'){
      filled.forEach((noteIdx,i)=>{
        const q=slotPos(i); if(!q) return;
        const dc=p.drawingContext;
        dc.save();
        dc.fillStyle='rgba(22,30,38,0.86)';
        dc.beginPath();
        dc.ellipse(q[0],q[1],S1_SCORE_BOX.h*0.0165,S1_SCORE_BOX.h*0.0122,-0.32,0,6.2832);
        dc.fill();
        dc.strokeStyle='rgba(22,30,38,0.80)';
        dc.lineWidth=Math.max(1,S1_SCORE_BOX.h*0.0035);
        dc.beginPath();
        dc.moveTo(q[0]+S1_SCORE_BOX.h*0.0158,q[1]-S1_SCORE_BOX.h*0.005);
        dc.lineTo(q[0]+S1_SCORE_BOX.h*0.0158,q[1]-S1_SCORE_BOX.h*0.052);
        dc.stroke();
        dc.restore();
      });
      for(let r=scoreRings.length-1;r>=0;r--){
        const g3=scoreRings[r], age3=t-g3.t0;
        if(age3>1.4){ scoreRings.splice(r,1); continue; }
        const q=slotPos(g3.i); if(!q) continue;
        p.noFill(); p.stroke(217,131,36,110*(1-age3/1.4)); p.strokeWeight(1.2);
        p.ellipse(q[0],q[1],age3*46,age3*46*0.55);
      }
      return;
    }
    if(sc==='stage3'&&S1_SCORE_BOX.ok){
      const dc3=p.drawingContext;
      const jit=(1-thomasState.accord);
      filled.forEach((noteIdx,i)=>{
        const q=slotPos(i); if(!q) return;
        const jx=(Math.sin(noteIdx*7.3+i*2.1))*jit*5;
        const jy=(Math.sin(noteIdx*3.1+i*1.7))*jit*4;
        dc3.save();
        dc3.fillStyle='rgba(22,30,38,'+(0.88-jit*0.2).toFixed(2)+')';
        dc3.beginPath();
        dc3.ellipse(q[0]+jx,q[1]+jy,S1_SCORE_BOX.h*0.0165,S1_SCORE_BOX.h*0.0122,
                    -0.32+jit*0.5,0,6.2832);
        dc3.fill();
        dc3.strokeStyle='rgba(22,30,38,'+(0.82-jit*0.2).toFixed(2)+')';
        dc3.lineWidth=Math.max(1,S1_SCORE_BOX.h*0.0035);
        dc3.beginPath();
        dc3.moveTo(q[0]+jx+S1_SCORE_BOX.h*0.0158,q[1]+jy-S1_SCORE_BOX.h*0.005);
        dc3.lineTo(q[0]+jx+S1_SCORE_BOX.h*0.0158,q[1]+jy-S1_SCORE_BOX.h*0.052);
        dc3.stroke();
        dc3.restore();
      });
    }else{
      filled.forEach((noteIdx,i)=>{
        const [wx,wy]=slotPos(i);
        for(let k=0;k<6;k++){
          const dx=Math.sin(noteIdx*7.3+k*12.9)*slotW*0.3;
          const dy=Math.sin(noteIdx*3.1+k*9.7)*7;
          p.noStroke();
          p.fill(k%3===0?217:240, k%3===0?131:208, k%3===0?36:150, 170-k*14);
          p.circle(wx+dx, wy+dy, 2.6-k*0.22);
        }
      });
    }

    for(let r=scoreRings.length-1;r>=0;r--){
      const g2=scoreRings[r], age=t-g2.t0;
      if(age>1.4){ scoreRings.splice(r,1); continue; }
      const [wx,wy]=slotPos(g2.i);
      p.noFill(); p.stroke(240,208,150,60*(1-age/1.4)); p.strokeWeight(1);
      p.ellipse(wx,wy,age*40,age*40*0.5);
    }

    if(sc==='stage2') drawLiveWave(p,sx+14,sy+sh*Math.max(openK,0.06)-18,sw*0.5,9,90);

    if(sc==='stage3') p.image(scratchLayer,0,0);

    if(sc==='stage2'){
      p.textFont('Lora'); p.textStyle(p.ITALIC); p.textSize(11);
      p.fill(217,131,36,110); p.textAlign(p.LEFT);
      const notes=['softer here, love','she kicked at this bar','again from the wave','our part'];
      thomasState.objects.placed.forEach((k,i)=>p.text(notes[i%4],sx+sw*0.15+i*sw*0.2,sy+sh*0.62));
    }
  }

  const photoEmbers=[];
  function drawBurningPhoto(p){

    s3.photoBurn=clamp(s3.photoBurn+dt/45,0,1);
    const aa=A();
    const ph=(aa&&aa.has('score_crashed'))?aa.get('score_crashed'):null;
    let w=Math.min(innerWidth*0.46,560), h=w*0.72;
    if(ph) h=w*(ph.naturalHeight/ph.naturalWidth);
    const x=(innerWidth-w)/2, y=(innerHeight-h)/2;
    p.noStroke();
    if(ph){
      const dc=p.drawingContext;
      dc.save();
      dc.filter='blur('+(s3.photoBurn*2.6).toFixed(2)+'px) saturate('+(1-s3.photoBurn*0.55).toFixed(2)+')';
      dc.drawImage(ph,x,y,w,h);
      dc.filter='none';
      dc.restore();
    }

    const b=s3.photoBurn;
    const dc2=p.drawingContext;

    dc2.save();
    dc2.fillStyle='rgba(10,6,3,1)';
    const edge=(x0,y0,x1,y1,amp)=>{
      dc2.beginPath();
      dc2.moveTo(x0,y0);
      const n=26;
      for(let i=0;i<=n;i++){
        const u=i/n;
        const px2=x0+(x1-x0)*u, py2=y0+(y1-y0)*u;
        const nx=(y1-y0), ny=-(x1-x0), L=Math.hypot(nx,ny)||1;
        const j=(Math.sin(u*17+i*2.3)+Math.sin(u*41-i*1.7))*0.5*amp;
        dc2.lineTo(px2+nx/L*j, py2+ny/L*j);
      }
      return dc2;
    };
    const bw=w*b*0.5, amp=10+b*26;
    edge(x+bw,y, x+bw,y+h, amp); dc2.lineTo(x-4,y+h); dc2.lineTo(x-4,y); dc2.closePath(); dc2.fill();
    edge(x+w-bw,y, x+w-bw,y+h, amp); dc2.lineTo(x+w+4,y+h); dc2.lineTo(x+w+4,y); dc2.closePath(); dc2.fill();
    const bh=h*b*0.35;
    edge(x,y+bh, x+w,y+bh, amp*0.7); dc2.lineTo(x+w,y-4); dc2.lineTo(x,y-4); dc2.closePath(); dc2.fill();
    dc2.restore();

    dc2.save();
    dc2.globalCompositeOperation='screen';
    const glow=140+60*Math.sin(t*5);
    dc2.strokeStyle='rgba(226,120,40,'+(glow/255).toFixed(2)+')';
    dc2.lineWidth=3;
    edge(x+bw,y, x+bw,y+h, amp).stroke();
    edge(x+w-bw,y, x+w-bw,y+h, amp).stroke();
    edge(x,y+bh, x+w,y+bh, amp*0.7).stroke();
    dc2.restore();

    dc2.save();
    dc2.globalCompositeOperation='multiply';
    const scorchL=dc2.createLinearGradient(x+bw,0,x+bw+w*0.30,0);
    scorchL.addColorStop(0,'rgba(58,28,12,0.94)');
    scorchL.addColorStop(0.32,'rgba(126,74,32,0.60)');
    scorchL.addColorStop(1,'rgba(180,140,96,0)');
    dc2.fillStyle=scorchL; dc2.fillRect(x+bw,y,w*0.30,h);
    const scorchR=dc2.createLinearGradient(x+w-bw,0,x+w-bw-w*0.30,0);
    scorchR.addColorStop(0,'rgba(58,28,12,0.94)');
    scorchR.addColorStop(0.32,'rgba(126,74,32,0.60)');
    scorchR.addColorStop(1,'rgba(180,140,96,0)');
    dc2.fillStyle=scorchR; dc2.fillRect(x+w-bw-w*0.30,y,w*0.30,h);
    const scorchT=dc2.createLinearGradient(0,y+bh,0,y+bh+h*0.26);
    scorchT.addColorStop(0,'rgba(58,28,12,0.9)');
    scorchT.addColorStop(0.34,'rgba(126,74,32,0.52)');
    scorchT.addColorStop(1,'rgba(180,140,96,0)');
    dc2.fillStyle=scorchT; dc2.fillRect(x,y+bh,w,h*0.26);
    dc2.restore();

    if(b>0.02 && photoEmbers.length<70 && Math.random()<0.8){
      const side=Math.random();
      const ex=side<0.42?x+bw:(side<0.84?x+w-bw:x+Math.random()*w);
      const ey=side<0.84?(y+bh+Math.random()*(h-bh)):y+bh;
      photoEmbers.push({x:ex,y:ey,vx:(Math.random()-0.5)*26,vy:-28-Math.random()*52,
                        a:1,s:1+Math.random()*2.4});
    }
    dc2.save();
    dc2.globalCompositeOperation='lighter';
    for(let i=photoEmbers.length-1;i>=0;i--){
      const e=photoEmbers[i];
      e.x+=e.vx*dt; e.y+=e.vy*dt; e.vy+=10*dt; e.vx+=Math.sin(t*3.4+e.y*0.012)*12*dt;
      e.a-=dt*0.40;
      if(e.a<=0){ photoEmbers.splice(i,1); continue; }
      dc2.fillStyle='rgba(255,'+(138+Math.floor(e.a*94))+',58,'+(e.a*0.9).toFixed(3)+')';
      dc2.beginPath(); dc2.arc(e.x,e.y,e.s*e.a,0,6.2832); dc2.fill();
    }
    dc2.restore();

    if(b>0.05){
      dc2.save();
      dc2.globalAlpha=0.13*Math.min(b*2.2,1);
      dc2.fillStyle='#6B6257';
      for(let k=0;k<4;k++){
        const yy=y+bh-k*h*0.22-((t*30+k*44)%70);
        dc2.beginPath();
        dc2.ellipse(x+w*0.5+Math.sin(t*0.8+k)*w*0.14, yy, w*(0.14+k*0.04), h*0.10, 0,0,6.2832);
        dc2.fill();
      }
      dc2.restore();
    }
  }

  function waterPlayString(){
    const S=thomasState.strings;
    const under=[];
    for(const s of S){
      if(s.state==='snapped') continue;
      if(s.yBot>waterY) under.push(s);
    }
    if(!under.length) return null;
    return under[Math.floor(Math.random()*under.length)];
  }
  function spawnBurst(decay){
    if(waterY>innerHeight-6) return;
    const s=waterPlayString();
    if(!s) return;
    const depth=Math.random();
    const y=waterY+depth*(innerHeight-waterY)*0.94;
    let bx=stringXAt(s,clamp(y,s.yTop,s.yBot));
    if(WP_DRIFT) bx+=decay*(Math.random()-0.5)*innerWidth*0.42;
    bursts.push({
      x:bx, y:y, t:0,
      life:1.4+Math.random()*1.0,
      n:8+Math.floor(Math.random()*10),
      len:(15+Math.random()*44)*(0.45+depth*0.95),
      seed:Math.random()*6.28,
      warm: WP_WARM_ON && Math.random()<decay*0.6
    });
    if(bursts.length>WP_MAX) bursts.splice(0,bursts.length-WP_MAX);
    if(Math.random()<0.05*decay) s.vib=Math.max(s.vib,0.28*decay);
  }
  function stepDebris(p){
    if(!debris.length) return;
    const dc=p.drawingContext;
    dc.save();
    dc.lineCap='round';
    for(let i=debris.length-1;i>=0;i--){
      const d=debris[i];
      const age=t-d.t0;
      if(age>11){ debris.splice(i,1); continue; }
      const inWater=d.y>waterY;
      if(!d.wet && inWater){ d.wet=true; d.vy*=0.24; d.vx*=0.3; d.vr*=0.3; }
      d.vy+=(inWater?42:520)*dt;
      if(inWater) d.vy=Math.min(d.vy,44);
      d.y+=d.vy*dt;
      d.x+=(d.vx+(inWater?Math.sin(t*0.9+d.t0)*11:0))*dt;
      d.rot+=d.vr*dt*(inWater?0.4:1);
      if(d.y>innerHeight+40){ debris.splice(i,1); continue; }
      const fade=inWater?clamp(1-(d.y-waterY)/Math.max(1,innerHeight-waterY)*0.9,0.08,1):1;
      dc.save();
      dc.translate(d.x,d.y); dc.rotate(d.rot);
      dc.strokeStyle='rgba('+d.col.join(',')+','+(0.72*fade*(1-age/11)).toFixed(3)+')';
      dc.lineWidth=inWater?1.1:1.6;
      dc.beginPath(); dc.moveTo(0,-d.len/2); dc.lineTo(0,d.len/2); dc.stroke();
      dc.restore();
    }
    dc.restore();
  }
  function stepWaterPlay(p){
    if(s3.inPhoto||thomasState.sub==='lucid') return;
    const decay=1-clamp(thomasState.accord,0,1);
    let rate=(0.7+decay*5.2)*dt*60*WP_SCALE;
    while(rate-- > 0){ if(Math.random()<0.33) spawnBurst(decay); }

    const dc=p.drawingContext;
    const span=Math.max(1,innerHeight-waterY);
    dc.save();
    dc.lineWidth=1.05;
    for(let i=bursts.length-1;i>=0;i--){
      const o=bursts[i];
      o.t+=dt;
      const u=o.t/o.life;
      if(u>=1){ bursts.splice(i,1); continue; }
      const grow=1-Math.pow(1-Math.min(1,u*1.9),2.4);
      const fade=Math.pow(1-u,1.7);
      const squash=0.28+Math.max(0,o.y-waterY)/span*0.26;
      dc.strokeStyle=o.warm
        ? 'rgba(244,211,142,'+(fade*0.88).toFixed(3)+')'
        : 'rgba(255,255,255,'+(fade*0.92).toFixed(3)+')';
      dc.beginPath();
      for(let k=0;k<o.n;k++){
        const a0=o.seed+k/o.n*6.283+Math.sin(k*2.1)*0.09;
        const L=o.len*grow*(0.6+((Math.sin(k*4.7+o.seed)+1)/2)*0.72);
        const ca=Math.cos(a0), sa=Math.sin(a0)*squash;
        dc.moveTo(o.x+ca*L*0.12, o.y+sa*L*0.12);
        dc.lineTo(o.x+ca*L,      o.y+sa*L);
      }
      dc.stroke();
    }
    dc.restore();
  }
  function drawWaterAndScratches(p){
    if(s3.inPhoto)return;

    for(let i2=traces.length-1;i2>=0;i2--){
      const tr=traces[i2], k=(t-tr.t0)/0.9;
      if(k>=1){ traces.splice(i2,1); continue; }
      p.noFill(); p.stroke(217,131,36,110*(1-k)); p.strokeWeight(0.9);
      const sagx=(tr.x0+tr.x1)/2+(tr.x1-tr.x0)*0.12;
      p.bezier(tr.x0,tr.y0, sagx,(tr.y0+tr.y1)/2+18*k, sagx,(tr.y0+tr.y1)/2+18*k, tr.x1,tr.y1);
    }

    Render.water(p.drawingContext,waterY,innerWidth,innerHeight,t,thomasState.accord);
    stepDebris(p);
    stepWaterPlay(p);

    if(s3.collapsing){
      waterY=lerp(waterY,innerHeight*0.12,dt*1.5);
      const pulse=0.5+0.5*Math.sin(t*Math.PI*2*1.4);
      p.noStroke(); p.fill(234,242,246,26*pulse);
      p.rect(0,0,innerWidth,innerHeight);
      for(let i=0;i<8;i++){
        const fx=(i*97)%innerWidth, fy=(t*80+i*140)%innerHeight;
        p.fill(207,227,236,70); p.triangle(fx,fy,fx+10,fy+16,fx-8,fy+18);
      }
    }
  }

  function endingBurst(wx,waterY,horizon,scale){
    if(t<ebNext) return;
    const span=Math.max(1,innerHeight-horizon);
    const k=clamp((waterY-horizon)/span,0,1);
    ebNext=t+lerp(EB_GAP0,EB_GAP1,k)*(0.7+Math.random()*0.7);
    const near=Math.random()<0.55;
    const bx=near ? wx+(Math.random()-0.5)*innerWidth*0.12
                  : wx+(Math.random()<0.5?-1:1)*innerWidth*(0.14+Math.random()*0.30);
    const by=clamp(waterY+(Math.random()-0.35)*span*0.30,horizon+8,innerHeight-6);
    bursts.push({
      x:bx, y:by, t0:t,
      life:2.2+Math.random()*1.4,
      n:7+Math.floor(Math.random()*8),
      len:(18+Math.random()*40)*(0.55+scale*0.8),
      seed:Math.random()*6.28,
      warm:true
    });
    if(bursts.length>EB_MAX) bursts.splice(0,bursts.length-EB_MAX);
  }
  function drawEndingBursts(p,horizon){
    if(!bursts.length) return;
    const dc=p.drawingContext;
    const span=Math.max(1,innerHeight-horizon);
    dc.save();
    dc.lineWidth=0.95;
    for(let i=bursts.length-1;i>=0;i--){
      const o=bursts[i];
      o.t+=0;
      const u=(t-o.t0)/o.life;
      if(u>=1){ bursts.splice(i,1); continue; }
      const grow=1-Math.pow(1-Math.min(1,u*1.7),2.6);
      const fade=Math.pow(1-u,2.0);
      const squash=0.24+Math.max(0,o.y-horizon)/span*0.24;
      dc.strokeStyle='rgba(244,211,142,'+(fade*0.62).toFixed(3)+')';
      dc.beginPath();
      for(let k2=0;k2<o.n;k2++){
        const a0=o.seed+k2/o.n*6.283+Math.sin(k2*2.1)*0.09;
        const L=o.len*grow*(0.6+((Math.sin(k2*4.7+o.seed)+1)/2)*0.72);
        const ca=Math.cos(a0), sa=Math.sin(a0)*squash;
        dc.moveTo(o.x+ca*L*0.14, o.y+sa*L*0.14);
        dc.lineTo(o.x+ca*L,      o.y+sa*L);
      }
      dc.stroke();
    }
    dc.restore();
  }
  function drawClosing(p){
    const dc=p.drawingContext;
    const e=(t-closeT0)*1000;
    const q=clamp(e/CLOSE_MS,0,1);
    const fadeIn=clamp(e/2600,0,1);
    dc.save();
    dc.fillStyle='rgba(238,244,248,'+fadeIn.toFixed(3)+')';
    dc.fillRect(0,0,innerWidth,innerHeight);
    const x0=innerWidth*0.12, x1=innerWidth*0.88;
    const gap=Math.max(8,innerHeight*0.016);
    for(let r=0;r<CLOSE_ROWS;r++){
      const my=innerHeight*(0.30+r*0.20);
      dc.strokeStyle='rgba(38,52,64,'+(0.30*fadeIn).toFixed(3)+')';
      dc.lineWidth=1;
      for(let k=-2;k<=2;k++){
        const y=my+k*gap;
        dc.beginPath(); dc.moveTo(x0,y); dc.lineTo(x1,y); dc.stroke();
      }
      const total=CLOSE_NOTES;
      const gone=Math.floor(q*total*CLOSE_ROWS)-r*total;
      for(let n=total-1;n>=0;n--){
        if(total-1-n<gone) continue;
        const u=(n+0.5)/total;
        const nx=x0+(x1-x0)*u;
        const step=((n*5+r*3)%5)-2;
        const ny=my-step*gap*0.5;
        const life=clamp((gone+1)-(total-1-n),0,1);
        dc.save();
        dc.globalAlpha=fadeIn*(1-0.7*(1-life));
        dc.fillStyle='rgba(28,38,48,0.88)';
        dc.beginPath();
        dc.ellipse(nx,ny,gap*0.62,gap*0.46,-0.32,0,6.2832);
        dc.fill();
        dc.strokeStyle='rgba(28,38,48,0.82)';
        dc.lineWidth=1.4;
        dc.beginPath();
        dc.moveTo(nx+gap*0.60,ny-gap*0.1);
        dc.lineTo(nx+gap*0.60,ny-gap*2.2);
        dc.stroke();
        dc.restore();
      }
    }
    if(q>=1){
      dc.globalAlpha=clamp((e-CLOSE_MS)/1600,0,1);
      dc.fillStyle='rgba(238,244,248,1)';
      dc.fillRect(0,0,innerWidth,innerHeight);
    }
    dc.restore();
  }
  function drawEnding(p){
    const e=t-endingT0;
    const R2=Render;
    const dc=p.drawingContext;
    const painted=R2.background(dc,'ending',innerWidth,innerHeight,1,0,0);

    const horizon=painted
      ? R2.coverY('bg_sea_sky',innerWidth,innerHeight,0,SEA_HORIZON_V)
      : innerHeight*0.55;

    if(!painted){
      p.noStroke();
      const sky=dc.createLinearGradient(0,0,0,horizon);
      sky.addColorStop(0,'#C9E2F0'); sky.addColorStop(1,'#609CBE');
      dc.fillStyle=sky; dc.fillRect(0,0,innerWidth,horizon);
      const sea=dc.createLinearGradient(0,horizon,0,innerHeight);
      sea.addColorStop(0,'#2C7E9E'); sea.addColorStop(1,'#082C44');
      dc.fillStyle=sea; dc.fillRect(0,horizon,innerWidth,innerHeight-horizon);
    }

    if(e<WALK_DELAY) return;
    const prog=clamp((e-WALK_DELAY)/WALK_TRAVEL,0,1);
    const ease=prog*prog*(3-2*prog);

    const shoreY=Math.min(painted
      ? R2.coverY('bg_sea_sky',innerWidth,innerHeight,0,SEA_SHORE_V)
      : innerHeight*0.92, innerHeight*0.98);
    const footY=lerp(shoreY,shoreY+(horizon-shoreY)*WALK_STOP,ease);
    const wx=lerp(innerWidth*0.42,innerWidth*0.47,ease);

    const span=Math.max(1,shoreY-horizon);
    const sc2=lerp(WALK_SCALE1,WALK_SCALE0,clamp((footY-horizon)/span,0,1));
    const fi=Math.floor(e/WALK_FRAME_S)%WALK_KEYS.length;
    const im=A()?A().get(WALK_KEYS[fi]):null;

    const sub=clamp((prog-WALK_SUB0)/(WALK_SUB1-WALK_SUB0),0,1)*WALK_SUB_MAX;
    let waterY=footY;

    if(im){
      const fullH=innerHeight*sc2;
      const fullW=fullH*(im.naturalWidth/im.naturalHeight);
      const topY=footY-fullH*FOOT_V;
      waterY=footY-fullH*FOOT_V*sub;
      const visible=waterY-topY;
      if(visible>1){
        dc.save();
        dc.beginPath();
        dc.rect(wx-fullW/2,topY,fullW,visible);
        dc.clip();
        dc.globalAlpha=1-sub*0.25;
        dc.drawImage(im,wx-fullW/2,topY,fullW,fullH);
        dc.globalAlpha=1;
        dc.restore();
      }
    }else{
      p.push(); p.translate(wx,footY); p.scale(sc2*8);
      p.fill(10,24,36,230);
      p.circle(0,-58,15); p.rect(-9,-48,18,52,6);
      p.pop();
    }

    if(prog>0.10) endingBurst(wx,waterY,horizon,Math.max(0.2,sc2/WALK_SCALE0));
    drawEndingBursts(p,horizon);
    {
      const wk=Math.pow(clamp((e-WALK_DELAY+1.2)/(WALK_TRAVEL*0.72),0,1),0.78);
      dc.save();
      dc.fillStyle='rgba(238,244,248,'+(wk*0.92).toFixed(3)+')';
      dc.fillRect(0,0,innerWidth,innerHeight);
      dc.restore();
    }

    if(t-lastWake>1.1 && sub<1){
      lastWake=t; endWakes.push({x:wx,y:waterY,t0:t,s:Math.max(0.2,sc2/WALK_SCALE0)});
    }
    for(let i2=endWakes.length-1;i2>=0;i2--){
      const w2=endWakes[i2], age=t-w2.t0;
      if(age>4){ endWakes.splice(i2,1); continue; }
      p.stroke(234,242,246,54*(1-age/4)); p.noFill();
      p.ellipse(w2.x,w2.y,(26+age*44)*w2.s,(7+age*11)*w2.s);
    }
    p.strokeWeight(1);
  }

  function drawParticles(p){

    p.noStroke();
    for(const q of PARTS){
      const rise=lerp(-0.15,0.5,partMode);
      q.y-=q.sp*rise; q.x+=Math.sin(t*0.4+q.ph)*0.12;
      if(q.y<-4)q.y=innerHeight+4; if(q.y>innerHeight+4)q.y=-4;
      const cold=lerp(0.2,1,partMode);
      p.fill(lerp(217,191,cold),lerp(180,216,cold),lerp(120,228,cold),
             40+30*Math.sin(t+q.ph));
      p.circle(q.x,q.y,q.r*2);
    }
  }
};

function boot(){
  if(TEST_BUILD){
    const h=document.createElement('div');
    h.id='tunehud';
    h.style.cssText='position:fixed;left:14px;top:14px;z-index:95;'+
      'font-family:Space Mono,monospace;font-size:9px;line-height:1.7;'+
      'letter-spacing:0.08em;color:rgba(207,227,236,0.55);pointer-events:none;'+
      'white-space:pre;text-shadow:0 1px 4px rgba(2,8,14,0.9)';
    document.body.appendChild(h);
    let frames=0,fps=0,lastF=performance.now();
    setInterval(()=>{ const n=performance.now();
      fps=Math.round(frames*1000/(n-lastF)); frames=0; lastF=n;
      const alive=thomasState.strings.filter(x=>x.state==='ok').length;
      const drift=(DRIFT_OVERRIDE!=null)?DRIFT_OVERRIDE:driftAt(thomasState.accord,0);
      h.textContent=
        'TEST BUILD · '+(TEST_STAGE||'full')+'\n'+
        'fps      '+fps+'\n'+
        'accord   '+thomasState.accord.toFixed(3)+'\n'+
        'drift(0) '+drift.toFixed(2)+' / max '+MAX_OFFSET+'\n'+
        'scratch  '+scratchRate(thomasState.accord).toFixed(2)+'/beat\n'+
        'strings  '+alive+' ok · '+thomasState.strings.filter(x=>x.state==='snapped').length+' snap · '+
                    thomasState.strings.filter(x=>x.state==='drowned').length+' drown\n'+
        'water    '+(thomasState.water*100).toFixed(0)+'%\n'+
        'voices   '+voices.length+'/'+MAX_VOICES+'\n'+
        'plucks   '+thomasState.pluckLog.length;
      window.__thomasFrames=f=>frames=f;
    },250);
    window.__hudFrame=()=>frames++;
  }
  bindPointer();
  initThree();
  P=new p5(sketch, $('p5-mount'));
  addEventListener('pointerdown',e=>{
    if(thomasState.scene==='stage2') s2Pointer('down',e);
    if(thomasState.scene==='stage3'&&s3.inPhoto) s3PhotoClick();
  });
  addEventListener('pointermove',e=>{ if(thomasState.scene==='stage2') s2Pointer('move',e); });
  addEventListener('pointerup',e=>{ if(thomasState.scene==='stage2') s2Pointer('up',e); });
  onBeat(()=>{ s3BeatTick(); });
  setInterval(s2RandomFall, 9000);
}

function mountThomas(mountEl){
  const host=mountEl||document.body;
  ROOT=document.createElement('div');
  ROOT.id='thomas-root';
  ROOT.innerHTML=THOMAS_MARKUP;
  host.appendChild(ROOT);
  showExit(false);
  document.documentElement.classList.add('thomas-on');
  document.body.classList.add('thomas-on');
}

function resetThomasState(){
  thomasState.scene='entry';
  thomasState.accord=1.0;
  thomasState.strings=[];
  thomasState.pluckLog=[];
  thomasState.water=0;
  t=0; lastNow=performance.now();
  everPlucked=false;
  waterY=1e9;
  DRIFT_OVERRIDE=null; SCRATCH_ENABLED=false; WATER_PAUSED=false;
  closeOn=false; closeT0=0;
  UI_BLOCK=false; briefDone={};
  if(briefOff){ clearTimeout(briefOff); briefOff=null; }
  watchEnd();
  scratchLayer=null;
  PARTS.length=0; pdust.length=0;
  beatFns.length=0;
  voices.length=0;
  cam.zoom=1; cam.tz=1; cam.tilt=0; cam.ttilt=0;
}

function showExit(on){
  const el=document.getElementById('ss-exit');
  if(el) el.style.display=on?'':'none';
}

function enterThomasFromGate(){
  if(!ctx) initAudio();
  if(ctx && ctx.state==='suspended'){ try{ ctx.resume(); }catch(e){} }
  const ready=Render.stageAssets(TEST_STAGE||'stage1');
  let handed=false;
  const go=()=>{
    if(handed)return; handed=true;
    showExit(true);
    if(TEST_STAGE==='stage2'){ thomasState.accord=0.6; beginStage2(); }
    else if(TEST_STAGE==='stage3'){ thomasState.accord=0.3; renderStems(); beginStage3(); }
    else if(TEST_STAGE==='ending'){ renderStems(); beginEnding(); }
    else beginStage1();
  };
  staffWipe(()=>{ ready.then(go); setTimeout(go,6000); },
            {dur:3600,seq:WIPE_PHRASE_OPEN,row:0});
}

function thomasImageProbe(){
  const a=A(); if(!a) return Promise.resolve(null);
  const man=a.manifest;
  const bases=['assets/img/','assets/images/','assets/','img/','images/','thomas/','assets/thomas/',''];
  const test=(u)=>new Promise(r=>{ const im=new Image();
    im.onload=()=>r(im.naturalWidth>0?im:null); im.onerror=()=>r(null); im.src=u; });
  const inspect=(im)=>{
    try{
      const w=Math.max(1,Math.min(80,im.naturalWidth));
      const h=Math.max(1,Math.round(w*im.naturalHeight/im.naturalWidth));
      const c=document.createElement('canvas'); c.width=w; c.height=h;
      const g=c.getContext('2d',{willReadFrequently:true});
      g.clearRect(0,0,w,h); g.drawImage(im,0,0,w,h);
      const d=g.getImageData(0,0,w,h).data;
      let opaque=0, rmin=255,rmax=0,gmin=255,gmax=0,bmin=255,bmax=0;
      for(let i=0;i<d.length;i+=4){
        if(d[i+3]<16) continue;
        opaque++;
        if(d[i]<rmin)rmin=d[i]; if(d[i]>rmax)rmax=d[i];
        if(d[i+1]<gmin)gmin=d[i+1]; if(d[i+1]>gmax)gmax=d[i+1];
        if(d[i+2]<bmin)bmin=d[i+2]; if(d[i+2]>bmax)bmax=d[i+2];
      }
      const px=w*h;
      const cover=opaque/px;
      const range=Math.max(rmax-rmin,gmax-gmin,bmax-bmin);
      return {cover:cover, range:opaque?range:0, w:im.naturalWidth, h:im.naturalHeight};
    }catch(e){ return {cover:-1, range:-1, w:im.naturalWidth, h:im.naturalHeight}; }
  };
  const first=man['bg_practice']||Object.values(man)[0];
  let bi=0;
  const findBase=()=>{
    if(bi>=bases.length) return Promise.resolve(null);
    const b=bases[bi++];
    const names=a.names?a.names(first):[first];
    let ni=0;
    const nx=()=>{
      if(ni>=names.length) return findBase();
      return test(b+names[ni++]).then(im=>im?b:nx());
    };
    return nx();
  };
  return findBase().then(base=>{
    if(!base){  return {base:null}; }

    const keys=Object.keys(man);
    return Promise.all(keys.map(k=>{
      const names=a.names?a.names(man[k]):[man[k]];
      let i=0;
      const nx=()=>{ if(i>=names.length) return {k:k,ok:false,file:man[k]};
        const n=names[i++];
        return test(base+n).then(im=>im?Object.assign({k:k,ok:true,file:n},inspect(im)):nx()); };
      return Promise.resolve().then(nx);
    })).then(rs=>{
      const bad=rs.filter(r=>!r.ok);
      const alias=rs.filter(r=>r.ok&&r.file!==man[r.k]);
      const blank=rs.filter(r=>r.ok&&r.cover>=0&&r.cover<0.02);
      const flat=rs.filter(r=>r.ok&&r.cover>=0.02&&r.range<6);

      return {base:base,total:rs.length,ok:rs.length-bad.length,
              missing:bad.map(r=>r.file),aliased:alias.length,
              blank:blank.map(r=>r.file),flat:flat.map(r=>r.file)};
    });
  });
}
window.thomasImageProbe=thomasImageProbe;

function thomasAudioProbe(){
  const keys=Object.keys(AUDIO).concat(Object.keys(VO_FILES));
  const base=AUDIO_BASE;
  return Promise.all(keys.map(k=>{
    const f=AUDIO[k]||VO_FILES[k];
    const names=audioNames(f);
    let i=0;
    const tryNext=()=>{
      if(i>=names.length) return {k:k,file:f,status:404,ok:false};
      const n=names[i++];
      return fetch(base+encodeURIComponent(n),{method:'HEAD'})
        .then(r=>r.ok?{k:k,file:n,status:200,ok:true}:tryNext())
        .catch(()=>tryNext());
    };
    return Promise.resolve().then(tryNext);
  })).then(rs=>{
    const renamed=rs.filter(r=>r.ok && r.file!==(AUDIO[r.k]||VO_FILES[r.k]));

    const bad=rs.filter(r=>!r.ok);

    return {base:base,total:rs.length,ok:rs.length-bad.length,
            missing:bad.map(r=>base+r.file),
            context:ctx?ctx.state:'none'};
  });
}
window.thomasAudioProbe=thomasAudioProbe;

function thomasReport(){
  const a=A();
  const im=a?a.manifest:{};
  const keys=Object.keys(im);
  const gotImg=keys.filter(k=>a.has(k));
  const missImg=keys.filter(k=>!a.has(k));
  const aKeys=Object.keys(AUDIO).concat(Object.keys(VO_FILES));
  const gotAud=aKeys.filter(k=>abuf[k]);
  const missAud=aKeys.filter(k=>!abuf[k]);
  return {
    imageBase:a?a.base():null,
    audioBase:AUDIO_BASE,
    images:gotImg.length+'/'+keys.length,
    imagesMissing:missImg.map(k=>(a?a.base():'')+im[k]),
    audioLoaded:gotAud.length+'/'+aKeys.length,
    audioMissing:missAud.map(k=>AUDIO_BASE+(AUDIO[k]||VO_FILES[k]||k)),
    audioContext:ctx?ctx.state:'none'
  };
}
window.thomasReport=thomasReport;

function thomasGatePaint(api){
  api.exitMs = 560;
  api.fadeMs = 800;
  var rings = [];
  var lastDrop = 0;
  var lastX = null, lastY = null;
  return function(a){
    var g = a.ctx, W = a.w(), H = a.h(), t = a.t(), d = a.dpr;
    g.setTransform(d, 0, 0, d, 0, 0);

    var sink = a.leaving() ? a.since : 0;
    var horizon = H * (0.44 + sink * 0.5);

    var sky = g.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, '#0a1017');
    sky.addColorStop(1, '#16232e');
    g.fillStyle = sky;
    g.fillRect(0, 0, W, horizon);

    var sea = g.createLinearGradient(0, horizon, 0, H);
    sea.addColorStop(0, '#16232e');
    sea.addColorStop(1, '#04080c');
    g.fillStyle = sea;
    g.fillRect(0, horizon, W, H - horizon);

    g.save();
    g.beginPath();
    g.rect(0, horizon, W, H - horizon);
    g.clip();

    for (var L = 0; L < 5; L++){
      var yb = horizon + (H - horizon) * Math.pow((L + 1) / 5, 1.7);
      g.strokeStyle = 'rgba(217,131,36,' + (0.05 + L * 0.018).toFixed(3) + ')';
      g.lineWidth = 1;
      g.beginPath();
      for (var x = 0; x <= W; x += 8){
        var yy = yb + Math.sin(x * 0.011 + t * (0.5 + L * 0.18)) * (2 + L * 1.6);
        if (x === 0) g.moveTo(x, yy); else g.lineTo(x, yy);
      }
      g.stroke();
    }

    if (a.mouse.on && !a.leaving()){
      var mx = a.mouse.x, my = a.mouse.y;
      var moved = lastX == null ? 99 : Math.hypot(mx - lastX, my - lastY);
      if (my > horizon && t - lastDrop > 0.11 && moved > 3){
        rings.push({ x: mx, y: my, r: 2, a: 0.5 });
        lastDrop = t;
      }
      lastX = mx; lastY = my;
    }

    if (sink > 0 && rings.length < 40){
      var px = a.mouse.on ? a.mouse.x : W / 2;
      var py = a.mouse.on ? Math.max(a.mouse.y, horizon + 20) : H * 0.66;
      for (var b = 0; b < 3; b++) rings.push({ x: px, y: py, r: b * 26, a: 0.7 });
    }

    for (var i = rings.length - 1; i >= 0; i--){
      var rg = rings[i];
      rg.r += sink > 0 ? 7 : 1.9;
      rg.a -= sink > 0 ? 0.008 : 0.0055;
      if (rg.a <= 0){ rings.splice(i, 1); continue; }
      g.strokeStyle = 'rgba(217,131,36,' + rg.a.toFixed(3) + ')';
      g.lineWidth = 1.2;
      g.beginPath();
      g.ellipse(rg.x, rg.y, rg.r, rg.r * 0.3, 0, 0, 6.283);
      g.stroke();
    }
    g.restore();

    if (!a.leaving()){
      var pb = 0.5 + Math.sin(t * 1.15) * 0.5;
      var bx = W / 2, by = horizon + (H - horizon) * 0.42;
      var bg = g.createRadialGradient(bx, by, 0, bx, by, 46 + pb * 22);
      bg.addColorStop(0, 'rgba(217,131,36,' + (0.3 + pb * 0.28).toFixed(3) + ')');
      bg.addColorStop(1, 'rgba(217,131,36,0)');
      g.fillStyle = bg;
      g.beginPath();
      g.arc(bx, by, 46 + pb * 22, 0, 6.283);
      g.fill();
    } else {
      var k = Math.min(1, sink * 1.05);
      var hand = g.createRadialGradient(W * 0.5, H * 0.46, 0, W * 0.5, H * 0.46, Math.hypot(W, H) * 0.62);
      hand.addColorStop(0, 'rgba(42,48,56,' + k.toFixed(3) + ')');
      hand.addColorStop(0.62, 'rgba(22,26,32,' + k.toFixed(3) + ')');
      hand.addColorStop(1, 'rgba(14,17,22,' + k.toFixed(3) + ')');
      g.fillStyle = hand;
      g.fillRect(0, 0, W, H);
    }
  };
}

function startThomas(){
  initAudio();
  _armAudio=()=>{
    if(!ctx) initAudio();
    if(ctx && ctx.state==='suspended'){ try{ ctx.resume(); }catch(e){} }
    if(ctx && ctx.state==='running' && _armAudio){
      ['pointerdown','keydown','touchend','click'].forEach(ev=>
        window.removeEventListener(ev,_armAudio));
      _armAudio=null;
    }
  };
  ['pointerdown','keydown','touchend','click'].forEach(ev=>
    window.addEventListener(ev,_armAudio,{passive:true}));
  const quit=e=>{
    if(e && e.preventDefault) e.preventDefault();
    window.teardownThomasThread();
    if(window.__backToSea) window.__backToSea();
  };
  window.__ssQuit=quit;
  boot();
  if(!ctx) initAudio();
  if(ctx && ctx.state==='suspended'){ try{ ctx.resume(); }catch(e){} }
  if(window.Veil && Veil.gate){
    Veil.gate(null, thomasGatePaint, ()=>{
      if(!ctx) initAudio();
      if(ctx && ctx.state==='suspended'){ try{ ctx.resume(); }catch(e){} }
      setTimeout(()=>enterThomasFromGate(),80);
    });
  } else setTimeout(()=>enterThomasFromGate(),80);
}

window.initThomasThread=function(mountEl){
  if(_live) window.teardownThomasThread();
  _live=true;
  resetThomasState();
  mountThomas(mountEl);
  startThomas();
};

window.teardownThomasThread=function(){
  if(!_live) return;
  window.__ssQuit=null;
  if(_armAudio){ ['pointerdown','keydown','touchend','click'].forEach(ev=>
    window.removeEventListener(ev,_armAudio)); _armAudio=null; }
  _live=false;
  _iv.forEach(id=>_ci(id)); _iv.clear();
  _to.forEach(id=>_ct(id)); _to.clear();
  for(const [target,type,fn,opts] of _lis){ try{ target.removeEventListener(type,fn,opts); }catch(e){} }
  _lis.length=0;
  schedTimer=null; subTimer=null; capTimer=null;
  try{ if(P){ P.remove(); P=null; } }catch(e){}
  try{ if(threeRenderer){ threeRenderer.dispose(); threeRenderer=null; } }catch(e){}
  threeScene=null; threeCam=null; bgPlanes.length=0;
  try{ if(ctx){ ctx.close(); ctx=null; } }catch(e){}
  masterBus=null; lowpass=null; limiter=null; analyser=null; anaBuf=null; seaGainNode=null;
  ghosts.forEach(g=>{ if(g.parentNode) g.remove(); }); ghosts.length=0;
  s1MemEls.forEach(d=>{ if(d&&d.parentNode) d.remove(); }); s1MemEls=[]; s1MemDone=[];
  slips.length=0; for(const k in slipK) delete slipK[k];
  liftSrc=null; liftFilter=null;
  for(const k in abuf) delete abuf[k];
  for(const k in aJob) delete aJob[k];
  for(const k in aFail) delete aFail[k];
  for(const k in warned) delete warned[k];
  for(const k in buses) delete buses[k];
  for(const k in loops) delete loops[k];
  for(const k in stems){ stems[k].buf=null; stems[k].src=null; stems[k].gain=null; }
  stemsStarted=false; stemT0=0; stemDur=0;
  if(ROOT&&ROOT.parentNode) ROOT.parentNode.removeChild(ROOT);
  ROOT=null;
  const hud=document.getElementById('tunehud'); if(hud&&hud.parentNode) hud.parentNode.removeChild(hud);
  document.documentElement.classList.remove('thomas-on');
  document.body.classList.remove('thomas-on');
};

if(window.THOMAS_AUTOBOOT!==false){
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>window.initThomasThread());
  } else {
    window.initThomasThread();
  }
}

})();
