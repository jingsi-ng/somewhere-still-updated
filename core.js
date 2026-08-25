(function(){
  var VEIL_ID = 'ss-veil';
  var FADE_MS = 700;

  function el(){ return document.getElementById(VEIL_ID); }

  function ensure(){
    var v = el();
    if (v) return v;
    v = document.createElement('div');
    v.id = VEIL_ID;
    v.setAttribute('aria-hidden','true');
    v.style.cssText = 'position:fixed;inset:0;background:#000;z-index:99999;pointer-events:none;opacity:0;transition:opacity ' + FADE_MS + 'ms ease';
    document.body.appendChild(v);
    return v;
  }

  function lift(){
    var v = el();
    if (!v) return;
    v.style.pointerEvents = 'none';
    requestAnimationFrame(function(){
      v.style.opacity = '0';
      setTimeout(function(){ if (v && v.parentNode) v.parentNode.removeChild(v); }, FADE_MS + 60);
    });
  }

  function drop(href, ms){
    var v = ensure();
    var d = (ms == null) ? FADE_MS : ms;
    v.style.transition = 'opacity ' + d + 'ms ease';
    v.style.pointerEvents = 'auto';
    requestAnimationFrame(function(){
      v.style.opacity = '1';
      setTimeout(function(){ location.href = href; }, d + 40);
    });
  }

  function audioOk(){
    try { return sessionStorage.getItem('ss_audio_ok') === '1'; } catch(e){ return false; }
  }

  function markAudioOk(){
    try { sessionStorage.setItem('ss_audio_ok','1'); } catch(e){}
  }

  function silentResume(){
    var fired = false;
    var go = function(){
      if (fired) return;
      fired = true;
      try { if (window.SFX && SFX.unlock) SFX.unlock(); } catch(e){}
      try {
        var C = window.__ssCtx;
        if (C && C.state === 'suspended') C.resume();
      } catch(e){}
    };
    ['pointerdown','keydown','touchstart'].forEach(function(ev){
      window.addEventListener(ev, go, { once:true, passive:true });
    });
    return go;
  }

  function markDone(thread){
    try { sessionStorage.setItem(thread + '_complete','true'); } catch(e){}
  }

  function doneCount(){
    var n = 0;
    ['margaret','megan','thomas'].forEach(function(k){
      try { if (sessionStorage.getItem(k + '_complete') === 'true') n++; } catch(e){}
    });
    return n;
  }

  function gateCSS(){
    if (document.getElementById('ss-gate-css')) return;
    var s = document.createElement('style');
    s.id = 'ss-gate-css';
    s.textContent =
      '.ss-gate{position:fixed;inset:0;z-index:99998;cursor:pointer;opacity:0;' +
      'transition:opacity 900ms ease;background:#05070a;overflow:hidden;' +
      '-webkit-user-select:none;user-select:none}' +
      '.ss-gate.ss-gate-in{opacity:1}' +
      '.ss-gate.ss-gate-out{opacity:0;pointer-events:none}' +
      '.ss-gate canvas{position:absolute;inset:0;width:100%;height:100%;display:block}';
    document.head.appendChild(s);
  }

  function gate(host, paint, onGo){
    gateCSS();
    var box = document.createElement('div');
    box.className = 'ss-gate';
    box.setAttribute('role','button');
    box.setAttribute('tabindex','0');
    box.setAttribute('aria-label','enter');

    var cv = document.createElement('canvas');
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    function size(){
      cv.width = Math.round(innerWidth * dpr);
      cv.height = Math.round(innerHeight * dpr);
    }
    size();
    box.appendChild(cv);
    (host || document.body).appendChild(box);
    requestAnimationFrame(function(){ box.classList.add('ss-gate-in'); });

    var mouse = { x: innerWidth / 2, y: innerHeight / 2, on: false };
    var onMove = function(e){ mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = true; };
    box.addEventListener('pointermove', onMove);
    window.addEventListener('resize', size);

    var fired = false, raf = 0, t0 = performance.now();
    var api = {
      ctx: cv.getContext('2d'),
      dpr: dpr,
      mouse: mouse,
      w: function(){ return innerWidth; },
      h: function(){ return innerHeight; },
      t: function(){ return (performance.now() - t0) / 1000; },
      leaving: function(){ return fired; },
      since: 0
    };

    var drawFn = (typeof paint === 'function') ? paint(api) : null;
    var loop = function(){
      if (drawFn){
        api.since = fired ? (performance.now() - api._goAt) / 1000 : 0;
        try { drawFn(api); } catch(e){}
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    var cleanup = function(){
      cancelAnimationFrame(raf);
      box.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', size);
      if (box.parentNode) box.parentNode.removeChild(box);
    };

    var go = function(){
      if (fired) return;
      fired = true;
      api._goAt = performance.now();
      box.removeEventListener('pointerdown', go);
      box.removeEventListener('keydown', onKey);
      try { if (window.SFX && SFX.unlock) SFX.unlock(); } catch(e){}
      try { var C = window.__ssCtx; if (C && C.state === 'suspended') C.resume(); } catch(e){}
      try { markAudioOk(); } catch(e){}
      var hold = (api.exitMs == null) ? 620 : api.exitMs;
      var fade = (api.fadeMs == null) ? 900 : api.fadeMs;
      box.style.transitionDuration = fade + 'ms';
      setTimeout(function(){ box.classList.add('ss-gate-out'); }, hold);
      setTimeout(cleanup, hold + fade + 60);
      if (onGo) onGo();
    };
    var onKey = function(e){
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar'){
        e.preventDefault();
        go();
      }
    };

    box.addEventListener('pointerdown', go);
    box.addEventListener('keydown', onKey);
    try { box.focus(); } catch(e){}
    return box;
  }

  window.Veil = {
    ensure: ensure,
    lift: lift,
    drop: drop,
    gate: gate,
    audioOk: audioOk,
    markAudioOk: markAudioOk,
    silentResume: silentResume,
    markDone: markDone,
    doneCount: doneCount,
    FADE_MS: FADE_MS
  };
})();

(function(){
  var W = window;
  if (W.Grammar) return;

  var t0 = (W.performance && performance.now) ? performance.now() : Date.now();
  var BREATH_MS = 4500;

  function now(){ return ((W.performance && performance.now) ? performance.now() : Date.now()) - t0; }

  function breath(phase){
    var p = (now() / BREATH_MS) + (phase || 0);
    return 0.5 - 0.5 * Math.cos(p * Math.PI * 2);
  }

  var cur = null, curX = -999, curY = -999, curOn = false, curRAF = 0;
  var mode = 'idle';

  function buildCursor(){
    if (cur) return cur;
    cur = document.createElement('div');
    cur.id = 'ss-cursor';
    cur.setAttribute('aria-hidden','true');
    cur.innerHTML = '<i></i><u></u>';
    document.body.appendChild(cur);
    return cur;
  }

  function tick(){
    if (!curOn) { curRAF = 0; return; }
    if (cur) {
      cur.style.transform = 'translate3d(' + curX + 'px,' + curY + 'px,0)';
      if (mode === 'live') {
        var b = breath(0);
        cur.style.setProperty('--ss-b', (0.86 + b * 0.26).toFixed(3));
      } else {
        cur.style.setProperty('--ss-b', '1');
      }
    }
    curRAF = requestAnimationFrame(tick);
  }

  function onMove(e){
    var p = (e.touches && e.touches[0]) ? e.touches[0] : e;
    curX = p.clientX; curY = p.clientY;
    if (cur && !cur.classList.contains('ready')) cur.classList.add('ready');
  }

  function setMode(m){
    if (m === mode) return;
    mode = m;
    if (!cur) return;
    cur.classList.remove('is-idle','is-live','is-hold');
    cur.classList.add('is-' + (m === 'live' ? 'live' : m === 'hold' ? 'hold' : 'idle'));
  }

  function cursorOn(){
    if (curOn) return;
    curOn = true;
    buildCursor();
    document.documentElement.classList.add('ss-grammar');
    W.addEventListener('pointermove', onMove, { passive:true });
    W.addEventListener('touchmove', onMove, { passive:true });
    W.addEventListener('pointerdown', holdOn, { passive:true });
    W.addEventListener('pointerup', holdOff, { passive:true });
    W.addEventListener('pointercancel', holdOff, { passive:true });
    setMode('idle');
    if (!curRAF) curRAF = requestAnimationFrame(tick);
  }

  var wasLive = false;
  function holdOn(){ wasLive = (mode === 'live'); if (wasLive) setMode('hold'); }
  function holdOff(){ if (mode === 'hold') setMode(wasLive ? 'live' : 'idle'); }

  function cursorOff(){
    if (!curOn) return;
    curOn = false;
    document.documentElement.classList.remove('ss-grammar');
    W.removeEventListener('pointermove', onMove);
    W.removeEventListener('touchmove', onMove);
    W.removeEventListener('pointerdown', holdOn);
    W.removeEventListener('pointerup', holdOff);
    W.removeEventListener('pointercancel', holdOff);
    if (curRAF) { cancelAnimationFrame(curRAF); curRAF = 0; }
    if (cur && cur.parentNode) { cur.parentNode.removeChild(cur); cur = null; }
  }

  function live(el, on){
    if (!el) return;
    if (on === false) el.classList.remove('ss-live');
    else el.classList.add('ss-live');
  }

  function liveAll(sel, on){
    var n = document.querySelectorAll(sel);
    for (var i = 0; i < n.length; i++) live(n[i], on);
  }

  function bind(el, opts){
    if (!el) return function(){};
    var o = opts || {};
    var over = function(){ setMode('live'); };
    var out  = function(){ setMode('idle'); };
    el.addEventListener('pointerenter', over);
    el.addEventListener('pointerleave', out);
    if (o.breathe !== false) live(el, true);
    return function(){
      el.removeEventListener('pointerenter', over);
      el.removeEventListener('pointerleave', out);
      live(el, false);
    };
  }

  var K = 'ss_primed_';
  function primed(kind){
    try { return sessionStorage.getItem(K + kind) === '1'; } catch(e){ return true; }
  }
  function firstRun(kind){ return !primed(kind); }
  function consume(kind){
    try { sessionStorage.setItem(K + kind, '1'); } catch(e){}
  }
  function guard(kind, value, safe){
    if (firstRun(kind)) return (safe === undefined ? 0 : safe);
    return value;
  }

  W.Grammar = {
    breath: breath,
    BREATH_MS: BREATH_MS,
    cursorOn: cursorOn,
    cursorOff: cursorOff,
    mode: setMode,
    live: live,
    liveAll: liveAll,
    bind: bind,
    firstRun: firstRun,
    consume: consume,
    guard: guard
  };
})();

(function(){
  var W = window;
  if (W.Pan) return;

  var AC = null;
  var routed = new WeakMap();

  function ctx(){
    if (AC) return AC;
    try {
      AC = new (W.AudioContext || W.webkitAudioContext)();
      W.__ssCtx = W.__ssCtx || AC;
    } catch(e){ AC = null; }
    return AC;
  }

  function clamp(v){ return v < -1 ? -1 : v > 1 ? 1 : v; }

  var LAYER = { vo: 0.15, sfx: 1.0, amb: 0.55 };

  function limit(pan, layer){
    var cap = LAYER[layer] === undefined ? 1.0 : LAYER[layer];
    return clamp(pan) * cap;
  }

  function attach(el, layer){
    if (!el) return null;
    var have = routed.get(el);
    if (have) return have;
    var c = ctx();
    if (!c) return null;
    try {
      if (c.state === 'suspended') c.resume();
      var src = c.createMediaElementSource(el);
      var p = c.createStereoPanner();
      var g = c.createGain();
      g.gain.value = 1;
      src.connect(p); p.connect(g); g.connect(c.destination);
      var h = { pan: p, gain: g, layer: layer || 'sfx' };
      routed.set(el, h);
      return h;
    } catch(e){ return null; }
  }

  function set(el, pan, layer){
    var h = attach(el, layer);
    if (!h) return;
    var v = limit(pan, layer || h.layer);
    try {
      var c = ctx();
      h.pan.pan.setValueAtTime(v, c ? c.currentTime : 0);
    } catch(e){
      try { h.pan.pan.value = v; } catch(e2){}
    }
  }

  function glide(el, pan, ms, layer){
    var h = attach(el, layer);
    if (!h) return;
    var c = ctx();
    if (!c) return;
    var v = limit(pan, layer || h.layer);
    try {
      var n = c.currentTime;
      h.pan.pan.cancelScheduledValues(n);
      h.pan.pan.setValueAtTime(h.pan.pan.value, n);
      h.pan.pan.linearRampToValueAtTime(v, n + (ms || 600) / 1000);
    } catch(e){}
  }

  function fromX(x, width){
    var w = width || W.innerWidth || 1;
    return clamp((x / w) * 2 - 1);
  }

  function fromEl(el){
    if (!el || !el.getBoundingClientRect) return 0;
    var r = el.getBoundingClientRect();
    return fromX(r.left + r.width / 2);
  }

  function node(layer, pan){
    var c = ctx();
    if (!c) return null;
    try {
      var p = c.createStereoPanner();
      p.pan.value = limit(pan || 0, layer);
      return p;
    } catch(e){ return null; }
  }

  W.Pan = {
    set: set,
    glide: glide,
    fromX: fromX,
    fromEl: fromEl,
    node: node,
    layers: LAYER
  };
})();

(function(){
  var W = window;
  if (W.Libs) return;

  var pending = {};

  function loadScript(src, cross){
    return new Promise(function(res, rej){
      var s = document.createElement('script');
      s.src = src;
      if (cross) s.crossOrigin = 'anonymous';
      s.async = false;
      s.onload = function(){ res(true); };
      s.onerror = function(){ rej(new Error(src)); };
      document.head.appendChild(s);
    });
  }

  function have(name){ return typeof W[name] !== 'undefined' && W[name]; }

  function ensure(name, local, cdn){
    if (have(name)) return Promise.resolve(true);
    if (pending[name]) return pending[name];
    var chain = loadScript(local, false).then(function(){
      return have(name) ? true : Promise.reject(new Error(name));
    });
    if (cdn){
      chain = chain.catch(function(){
        return loadScript(cdn, true).then(function(){ return have(name); });
      });
    }
    pending[name] = chain.catch(function(){ return false; });
    return pending[name];
  }

  function ready(specs, cb){
    if (!specs || !specs.length){ cb(true); return; }
    Promise.all(specs.map(function(s){ return ensure(s[0], s[1], s[2]); }))
      .then(function(r){ cb(r.every(Boolean)); }, function(){ cb(false); });
  }

  W.Libs = { ensure: ensure, ready: ready, have: have };
})();

(function(){
  var W = window;
  if (W.Exit) return;

  var ID = 'ss-exit';
  var armed = false;

  function el(){ return document.getElementById(ID); }

  function home(){
    var k = thread();
    return (k && k !== 'fog') ? 'index.html#at=' + k : 'index.html';
  }

  function go(){
    try {
      if (typeof W.__ssQuit === 'function'){ W.__ssQuit(); return; }
    } catch(e){}
    try {
      if (typeof W.__backToSea === 'function'){ W.__backToSea(); return; }
    } catch(e){}
    if (W.Veil && W.Veil.drop) W.Veil.drop(home(), 700);
    else location.href = home();
  }

  function thread(){
    var p = (location.pathname || '').toLowerCase();
    if (p.indexOf('margaret') > -1) return 'margaret';
    if (p.indexOf('megan') > -1) return 'megan';
    if (p.indexOf('thomas') > -1) return 'thomas';
    if (p.indexOf('fog') > -1) return 'fog';
    return '';
  }

  function build(){
    if (el()) return el();
    var b = document.createElement('button');
    b.id = ID;
    b.type = 'button';
    var k = thread();
    if (k) b.setAttribute('data-thread', k);
    b.textContent = 'back to the deep';
    b.setAttribute('aria-label', 'return to the sea');
    b.addEventListener('click', function(e){ e.preventDefault(); go(); });
    (document.body || document.documentElement).appendChild(b);
    return b;
  }

  function onKey(e){
    var k = e.key || '';
    if (k !== 'Escape' && k !== 'Esc') return;
    var b = el();
    if (!b) return;
    if (b.classList.contains('ss-exit-ready')){ go(); return; }
    b.classList.add('ss-exit-ready');
    clearTimeout(onKey._t);
    onKey._t = setTimeout(function(){
      var x = el();
      if (x) x.classList.remove('ss-exit-ready');
    }, 3200);
  }

  function isHub(){
    var p = location.pathname || '';
    if (/(^|\/)index\.html$/.test(p)) return true;
    if (p === '' || p === '/' || /\/$/.test(p)) return true;
    return false;
  }

  function arm(){
    if (armed) return;
    if (W.SS_NO_EXIT) return;
    if (isHub()) return;
    if (document.getElementById('stillReturn')) return;
    armed = true;
    build();
    W.addEventListener('keydown', onKey);
  }

  W.Exit = { arm: arm, go: go };

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', arm);
  else arm();
})();

(function(){
  var W = window;
  if (W.Mode) return;

  var ID = 'ss-awake';
  var on = false;

  function el(){ return document.getElementById(ID); }

  function build(){
    var e = el();
    if (e) return e;
    e = document.createElement('div');
    e.id = ID;
    e.setAttribute('aria-hidden','true');
    (document.body || document.documentElement).appendChild(e);
    return e;
  }

  function act(){
    if (on) return;
    on = true;
    build().classList.add('ss-awake-on');
    document.documentElement.classList.add('ss-acting');
  }

  function watch(){
    if (!on) return;
    on = false;
    var e = el();
    if (e) e.classList.remove('ss-awake-on');
    document.documentElement.classList.remove('ss-acting');
  }

  function set(v){ if (v) act(); else watch(); }

  W.Mode = { act: act, watch: watch, set: set, acting: function(){ return on; } };
})();

(function(){
  var W = window;
  if (W.Ending) return;

  var ID = 'ss-ending';
  var STILL_LOCKED = false;

  function build(key){
    var old = document.getElementById(ID);
    if (old && old.parentNode) old.parentNode.removeChild(old);

    var wrap = document.createElement('div');
    wrap.id = ID;
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('data-thread', key);

    var card = document.createElement('div');
    card.className = 'ss-ending-card';

    var line = document.createElement('p');
    line.className = 'ss-ending-line';
    line.textContent = 'That was her memory, the way she holds it.';
    if (key === 'thomas') line.textContent = 'That was his memory, the way he holds it.';

    var sub = document.createElement('p');
    sub.className = 'ss-ending-sub';
    sub.textContent = STILL_LOCKED
      ? 'Rest a moment, then go back down.'
      : 'The same memories, in the order they happened, are waiting above.';

    var row = document.createElement('div');
    row.className = 'ss-ending-row';

    var go = document.createElement('button');
    go.type = 'button';
    go.className = 'ss-ending-go';
    go.textContent = 'the whole of it, in order';
    go.addEventListener('click', function(){
      close(wrap);
      if (W.Veil && W.Veil.drop) W.Veil.drop('still.html#' + key, 900);
      else location.href = 'still.html#' + key;
    });

    var back = document.createElement('button');
    back.type = 'button';
    back.className = STILL_LOCKED ? 'ss-ending-go' : 'ss-ending-back';
    back.textContent = 'back to the deep';
    back.addEventListener('click', function(){
      close(wrap);
      if (typeof W.__ssQuit === 'function'){ W.__ssQuit(); return; }
      if (typeof W.__backToSea === 'function'){ W.__backToSea(); return; }
      var dest = 'index.html#at=' + key;
      if (W.Veil && W.Veil.drop) W.Veil.drop(dest, 900);
      else location.href = dest;
    });

    if (!STILL_LOCKED) row.appendChild(go);
    row.appendChild(back);
    card.appendChild(line);
    card.appendChild(sub);
    card.appendChild(row);
    wrap.appendChild(card);
    (document.body || document.documentElement).appendChild(wrap);

    requestAnimationFrame(function(){ wrap.classList.add('on'); });
    setTimeout(function(){ try { go.focus(); } catch(e){} }, 700);
    return wrap;
  }

  function close(wrap){
    if (!wrap) return;
    wrap.classList.remove('on');
    setTimeout(function(){
      if (wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap);
    }, 700);
  }

  function offer(key){
    if (!key) return;
    if (document.getElementById(ID)) return;
    try { sessionStorage.setItem(key + '_complete', 'true'); } catch(e){}
    build(key);
  }

  W.Ending = { offer: offer };
})();

(function(){
  var W = window;
  if (W.Level) return;

  var MASTER = 0.9;
  var DUCK = { vo: 1.0, music: 0.62, amb: 0.78, sfx: 0.9 };
  var seen = [];

  var VO_HINT = /(\bvo\b|voice|_line|line\.|says?\b|narrat|doctor|\bmc[_ ]|megan|margaret|thomas|hans|peter|mama|kid|wife|daddy|priest|pastor|father|elin|congratulation|you did it|nurse|announc|dedication|where.?s the red|do it again|start again|again!|no stop|great job|yes i do|never be hers|5,6,7,8|\.m4a$)/i;
  var MUSIC_HINT = /(music|song|theme|melody|bgm|\bscore\b|ourstory|our story|etude|elegy|harmony|stem_|plunge|waltz|lullab|piano|strings? together)/i;
  var AMB_HINT = /(ambien|ambient|\bamb\b|room tone|room \+|room sound|empty room|\btone\b|[_\- ]sea\b|sea wave|ocean|oceanfloor|rain|wind|descent|floor_arrival|house_base|gallery ambience|living room)/i;
  var VO_STRONG = /(\bvo\b|voice|_line|line\.|narrat|vow|says?\b|\.m4a$)/i;

  function kindOf(name){
    if (!name) return 'sfx';
    var n = String(name);
    if (VO_STRONG.test(n)) return 'vo';
    if (MUSIC_HINT.test(n)) return 'music';
    if (AMB_HINT.test(n)) return 'amb';
    if (VO_HINT.test(n)) return 'vo';
    return 'sfx';
  }

  var TRIM = {
  };

  function trimFor(name){
    if (!name) return 1;
    var n = String(name).toLowerCase();
    for (var key in TRIM){
      if (n.indexOf(key.toLowerCase()) > -1) return TRIM[key];
    }
    return 1;
  }

  function scale(v, name){
    var base = (v == null) ? 1 : v;
    var k = DUCK[kindOf(name)] || 1;
    return Math.max(0, Math.min(1, base * MASTER * k * trimFor(name)));
  }

  function apply(el, want, name){
    if (!el) return el;
    try { el.volume = scale(want, name); } catch(e){}
    if (seen.indexOf(el) < 0) seen.push(el);
    return el;
  }

  function master(){ return MASTER; }

  W.Level = { apply: apply, scale: scale, master: master, kindOf: kindOf, duck: DUCK, trim: TRIM };
})();
