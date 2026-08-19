(function () {
  'use strict';

  var ORDER = ['megan', 'thomas', 'margaret'];

  var BOOKS = {
    margaret: {
      name: 'Margaret',
      accent: '#B23A2E',
      accentRgb: '178,58,46',
      nodes: [
        { id: 'm_academy', img: 'Margaret_w1_scene4_mother_2', label: 'MEMORY LINE 1', line: 'Her mother takes her to the dance academy for the first time.' },
        { id: 'm_shoegift', img: 'Margaret_w1_scene7_shoegift', label: 'MEMORY LINE 1', line: 'Her mother gives her a pair of ballet shoes.' },
        { id: 'm_stage', img: 'Margaret_w1_scene8_dancingonstage', label: 'MEMORY LINE 1', line: 'She dances, and is named Best Ballet Artist.' },
        { id: 'm_wedding', img: 'margaret_wedding_margaret_01', label: 'MEMORY LINE 2', line: 'She marries Peter.' },
        { id: 'm_infant', img: 'Margaret_w3_infant_crib_01', label: 'MEMORY LINE 2', line: 'Their daughter is born.' },
        { id: 'm_reddoll', img: 'Margaret_w4_reddoll_gift_01', label: 'MEMORY LINE 2', line: 'She gives her daughter a rag doll in red shoes.' },
        { id: 'm_bandaged', img: 'Margaret_w3_bandaged_daughter_01', label: 'MEMORY LINE 3', line: 'A car accident. Her daughter wakes with a scar.' },
        { id: 'm_funeral', img: 'Margaret_w3_funeral_01_2', label: 'MEMORY LINE 3', line: 'Peter does not wake at all.' },
        { id: 'm_bigshoes', img: 'Margaret_w4_oversized_shoes_01', label: 'MEMORY LINE 4', line: 'Her daughter puts on shoes far too large for her.' },
        { id: 'm_podium', img: 'Margaret_w4_podium_ceremony_01', label: 'MEMORY LINE 4', line: 'Her daughter dances the ending she never finished.' },
        { id: 'm_waving', img: 'Margaret_w5_daughter_waving', label: 'MEMORY LINE 5', line: 'She takes her daughter to the airport.' },
        { id: 'm_videocall', img: 'Margaret_w5_videocall', label: 'MEMORY LINE 5', line: 'She practises rising onto her toes, and waits for the call.' }
      ]
    },
    megan: {
      name: 'Megan',
      accent: '#8A8493',
      accentRgb: '138,132,147',
      nodes: [
        { id: 'g_graduation', img: 'megan_flash_graduation_01', label: 'MEMORY LINE 1', line: 'Megan and Hans receive their award together.' },
        { id: 'g_born', img: 'megan_awborn_main_01', label: 'MEMORY LINE 1', line: 'Born. A whale comes into the world.' },
        { id: 'g_launch', img: 'megan_fill2_photo_launch_01', label: 'MEMORY LINE 2', line: 'They open the studio together.' },
        { id: 'g_breadth', img: 'megan_awbreadth_main_01', label: 'MEMORY LINE 2', line: 'Breadth. Two figures watch a whale surface.' },
        { id: 'g_argue', img: 'megan_flash_argue_01', label: 'MEMORY LINE 3', line: 'They argue in the hall. Hans leaves.' },
        { id: 'g_alone', img: 'megan_flash_alone_studio_01', label: 'MEMORY LINE 3', line: 'She paints alone, beside an empty seat.' },
        { id: 'g_calls', img: 'megan_awcalls_main_01', label: 'MEMORY LINE 3', line: 'Calls. A pod surfaces, seen from above.' },
        { id: 'g_bedside', img: 'megan_flash_bedside_01', label: 'MEMORY LINE 5', line: 'She sits at his bedside.' },
        { id: 'g_lastphoto', img: 'megan_flash_hospital_lastphoto', label: 'MEMORY LINE 5', line: 'The last photograph of the two of them.' },
        { id: 'g_funeral', img: 'megan_flash_funeral_01', label: 'MEMORY LINE 5', line: 'Hans is buried.' },
        { id: 'g_fall', img: 'megan_awfall_main_01', label: 'MEMORY LINE 5', line: 'Fall. A whale sinks, and feeds the floor.' },
        { id: 'g_ending', img: 'megan_ending_megan_stick_01', label: 'NOW', line: 'The paintings are finished. The call does not connect.' }
      ]
    },
    thomas: {
      name: 'Thomas',
      accent: '#D98324',
      accentRgb: '217,131,36',
      nodes: [
        { id: 't_teaching', img: 'thomas_anchor_father_teaching_01', label: 'MEMORY LINE 1', line: 'His father teaches him to play.' },
        { id: 't_stage', img: 'thomas_anchor_stage_father_01', label: 'MEMORY LINE 1', line: 'He plays on stage. His father watches from the hall.' },
        { id: 't_bow', img: 'thomas_anchor_bow_01', label: 'MEMORY LINE 1', line: 'He bows. His father says he can do it better.' },
        { id: 't_wife', img: 'thomas_anchor_wife_face_01', label: 'MEMORY LINE 2', line: 'He meets her. She tells him his music is good.' },
        { id: 't_creating', img: 'thomas_anchor_creating_01', label: 'MEMORY LINE 2', line: 'They begin writing Our Story together.' },
        { id: 't_concert', img: 'thomas_anchor_concert_wife_01', label: 'MEMORY LINE 2', line: 'They perform together.' },
        { id: 't_pregnant', img: 'thomas_anchor_sea_pregnant_01', label: 'MEMORY LINE 2', line: 'He plays for her by the sea, before the child comes.' },
        { id: 't_daughter', img: 'thomas_anchor_sea_daughter_01', label: 'MEMORY LINE 2', line: 'They bring their daughter to the shore at sunset.' },
        { id: 't_leaving', img: 'thomas_anchor_leaving_hall_01', label: 'MEMORY LINE 3', line: 'They leave the concert hall together.' },
        { id: 't_accident', img: 'thomas_anchor_accident_01', label: 'MEMORY LINE 3', line: 'A lorry runs the light.' },
        { id: 't_funeral', img: 'thomas_anchor_funeral_01', label: 'MEMORY LINE 3', line: 'He plays at their funeral.' },
        { id: 't_sea', img: 'thomas_walking_into_sea_05', label: 'MEMORY LINE 4', line: 'The score is never finished. He walks into the sea.' }
      ]
    }
  };

  var TARGETS = {
    m_academy: 'margaret.html#w1',
    m_shoegift: 'margaret.html#w1',
    m_stage: 'margaret.html#w1',
    m_wedding: 'margaret.html#w2',
    m_infant: 'margaret.html#w2',
    m_reddoll: 'margaret.html#w2',
    m_bandaged: 'margaret.html#w3',
    m_funeral: 'margaret.html#w3',
    m_bigshoes: 'margaret.html#w4',
    m_podium: 'margaret.html#w4',
    m_waving: 'margaret.html#w5',
    m_videocall: 'margaret.html#ending',
    g_graduation: 'megan.html#/megan/graduation',
    g_born: 'megan.html#/megan/studio/born',
    g_launch: 'megan.html#/megan/gallery/fill1',
    g_breadth: 'megan.html#/megan/studio/breadth',
    g_argue: 'megan.html#/megan/gallery/fill2',
    g_alone: 'megan.html#/megan/gallery/fill2',
    g_calls: 'megan.html#/megan/studio/calls',
    g_bedside: 'megan.html#/megan/gallery/fill3',
    g_lastphoto: 'megan.html#/megan/gallery/fill3',
    g_funeral: 'megan.html#/megan/studio/fall',
    g_fall: 'megan.html#/megan/studio/fall',
    g_ending: 'megan.html#/megan/ending',
    t_teaching: 'thomas.html#stage1',
    t_stage: 'thomas.html#stage1',
    t_bow: 'thomas.html#stage1',
    t_wife: 'thomas.html#stage2',
    t_creating: 'thomas.html#stage2',
    t_concert: 'thomas.html#stage2',
    t_pregnant: 'thomas.html#stage2',
    t_daughter: 'thomas.html#stage2',
    t_leaving: 'thomas.html#stage3',
    t_accident: 'thomas.html#stage3',
    t_funeral: 'thomas.html#stage3',
    t_sea: 'thomas.html#ending'
  };

  var EXTS = ['.webp', '.png', '.jpg'];
  var reduced = false;
  try {
    reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (eRM) {
    reduced = false;
  }

  var bookEl, headerNameEl, othersEl, dotsEl, turnPromptEl, returnEl, veilEl;
  var currentKey = null;
  var pages = [];
  var dots = [];
  var page = 0;
  var visited = {};
  var turned = false;
  var switching = false;
  var animating = false;
  var wheelLock = false;
  var wheelTimer = null;
  var navigating = false;
  var ambience = null;
  var ambienceTargetVol = 0.5;
  var closingTimer = null;

  function navigate(href, ms) {
    if (navigating) return;
    navigating = true;
    if (window.Veil && typeof window.Veil.drop === 'function') {
      window.Veil.drop(href, ms);
    } else {
      window.location.href = href;
    }
  }

  function liftVeil() {
    if (window.Veil && typeof window.Veil.lift === 'function') {
      window.Veil.lift();
    } else if (veilEl) {
      veilEl.classList.add('ss-veil-lift');
      window.setTimeout(function () {
        if (veilEl && veilEl.parentNode) veilEl.parentNode.removeChild(veilEl);
      }, 1000);
    }
  }

  function setCursorMode(m) {
    if (window.Grammar && typeof window.Grammar.mode === 'function') {
      window.Grammar.mode(m);
    }
  }

  function resolveImage(base, onSrc, onFail) {
    var i = 0;
    function attempt() {
      if (i >= EXTS.length) {
        onFail();
        return;
      }
      var src = 'assets/img/' + base + EXTS[i];
      var probe = new Image();
      probe.onload = function () { onSrc(src); };
      probe.onerror = function () { i++; attempt(); };
      probe.src = src;
    }
    attempt();
  }

  function vw() {
    return Math.max(1, window.innerWidth || 1);
  }

  function buildHeader(key) {
    headerNameEl.textContent = BOOKS[key].name;
    othersEl.innerHTML = '';
    for (var i = 0; i < ORDER.length; i++) {
      var k = ORDER[i];
      if (k === key) continue;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'still-other';
      b.textContent = BOOKS[k].name;
      b.setAttribute('data-key', k);
      b.addEventListener('click', onOtherName);
      b.addEventListener('pointerenter', onNameEnter);
      b.addEventListener('pointerleave', onNameLeave);
      othersEl.appendChild(b);
    }
  }

  function onNameEnter() {
    setCursorMode('live');
  }

  function onNameLeave() {
    setCursorMode('idle');
  }

  function onOtherName(e) {
    var k = e.currentTarget.getAttribute('data-key');
    if (k && k !== currentKey) switchBook(k);
  }

  function buildDots(key) {
    dotsEl.innerHTML = '';
    dots = [];
    for (var i = 0; i < BOOKS[key].nodes.length; i++) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'still-dot';
      d.setAttribute('data-index', String(i));
      d.addEventListener('click', onDot);
      dotsEl.appendChild(d);
      dots.push(d);
    }
  }

  function onDot(e) {
    var i = parseInt(e.currentTarget.getAttribute('data-index'), 10);
    if (!isNaN(i)) goTo(i);
  }

  function buildBook(key, done) {
    bookEl.innerHTML = '';
    bookEl.className = 'book-' + key;
    pages = [];
    var nodes = BOOKS[key].nodes;
    var firstSettled = false;
    var firstResolve = function () {
      if (firstSettled) return;
      firstSettled = true;
      if (done) done();
    };
    for (var i = 0; i < nodes.length; i++) {
      (function (i) {
        var node = nodes[i];
        var page = document.createElement('section');
        page.className = 'still-page';
        page.setAttribute('data-id', node.id);
        if (key === 'megan') page.classList.add('page-wipe');
        if (key === 'margaret') page.classList.add('page-mirror');

        var frame = document.createElement('figure');
        frame.className = 'still-frame';
        frame.setAttribute('data-id', node.id);

        var label = document.createElement('div');
        label.className = 'still-label';
        label.textContent = node.label;

        var caption = document.createElement('div');
        caption.className = 'still-caption';
        caption.textContent = node.line;

        var open = document.createElement('div');
        open.className = 'still-open';
        open.textContent = 'open this memory';

        page.appendChild(frame);
        page.appendChild(label);
        page.appendChild(caption);
        page.appendChild(open);

        frame.addEventListener('pointerenter', function () {
          if (!switching) {
            page.classList.add('page-hot');
            setCursorMode('live');
          }
        });
        frame.addEventListener('pointerleave', function () {
          page.classList.remove('page-hot');
        });
        if (key === 'megan') attachWipe(frame);
        if (key === 'margaret') attachMist(frame);

        bookEl.appendChild(page);
        pages.push(page);

        resolveImage(node.img, function (src) {
          var img = document.createElement('img');
          img.alt = '';
          img.draggable = false;
          img.src = src;
          frame.appendChild(img);
          if (i === 0) firstResolve();
        }, function () {
          var fb = document.createElement('div');
          fb.className = 'still-fallback';
          frame.appendChild(fb);
          if (i === 0) firstResolve();
        });
      })(i);
    }
  }

  function attachWipe(frame) {
    var haze = document.createElement('canvas');
    haze.className = 'still-haze';
    frame.appendChild(haze);
    var wiped = false;
    var sized = false;

    var size = function () {
      var r = frame.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      haze.width = Math.round(r.width * dpr);
      haze.height = Math.round(r.height * dpr);
      var g = haze.getContext('2d');
      if (!g) return false;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = 'rgba(196, 206, 216, 0.94)';
      g.fillRect(0, 0, r.width, r.height);
      sized = true;
      return true;
    };

    var wipe = function (e) {
      if (!sized && !size()) return;
      var r = frame.getBoundingClientRect();
      var g = haze.getContext('2d');
      if (!g) return;
      g.save();
      g.globalCompositeOperation = 'destination-out';
      var x = e.clientX - r.left, y = e.clientY - r.top;
      var rad = Math.min(r.width, r.height) * 0.17;
      var grad = g.createRadialGradient(x, y, 0, x, y, rad);
      grad.addColorStop(0, 'rgba(0,0,0,1)');
      grad.addColorStop(0.6, 'rgba(0,0,0,0.55)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, rad, 0, 6.2832);
      g.fill();
      g.restore();
      if (!wiped) {
        wiped = true;
        haze.classList.add('haze-touched');
      }
    };

    frame.addEventListener('pointerenter', function () { if (!sized) size(); });
    frame.addEventListener('pointermove', wipe);
    window.addEventListener('resize', function () { sized = false; });

    frame.__reveal = function () {
      if (haze.classList.contains('haze-open')) return;
      haze.classList.add('haze-open');
    };
  }

  function attachMist(frame) {
    var mist = document.createElement('span');
    mist.className = 'still-mist';
    frame.appendChild(mist);
    var clear = function () {
      if (mist.classList.contains('mist-clear')) return;
      mist.classList.add('mist-clear');
    };
    frame.addEventListener('pointerenter', clear);
    frame.__reveal = clear;
  }

  function currentPage() { return page; }

  function clampPage(i) {
    if (i < 0) return 0;
    if (i > pages.length - 1) return pages.length - 1;
    return i;
  }

  function paint() {
    var scroll = currentKey === 'thomas';
    var step = scroll ? window.innerWidth * 0.62 : window.innerWidth;
    for (var i = 0; i < pages.length; i++) {
      var d = i - page;
      var abs = Math.abs(d);
      var el = pages[i];
      var limit = scroll ? 2.4 : 1.02;
      if (abs >= limit) {
        el.style.visibility = 'hidden';
        el.style.opacity = '0';
        continue;
      }
      el.style.visibility = 'visible';
      if (reduced) {
        el.style.transform = 'translateX(' + (d * step) + 'px)';
        el.style.opacity = abs < 0.5 ? '1' : '0';
        continue;
      }
      if (scroll) {
        var sc = 1 - Math.min(0.22, abs * 0.13);
        el.style.transform = 'translateX(' + (d * step) + 'px) scale(' + sc.toFixed(3) + ')';
        el.style.opacity = String(Math.max(0.16, 1 - abs * 0.52));
        el.style.zIndex = String(40 - Math.round(abs * 10));
      } else {
        el.style.transform = 'translateX(' + (d * step) + 'px)';
        el.style.opacity = abs < 0.02 ? '1' : '0';
      }
    }
    updateDots();
  }

  function goTo(i, silent) {
    var next = clampPage(i);
    if (next === page) return;
    page = next;
    animating = true;
    paint();
    if (!silent) noteTurn();
    window.setTimeout(function () { animating = false; }, 620);
    settle(page);
  }

  function settle(p) {
    markVisited(p);
    revealCurrent();
    updateReturn(p);
  }

  function updateReturn(p) {
    if (!returnEl) return;
    var last = p >= pages.length - 1;
    returnEl.classList.toggle('return-glow', last);
  }

  function onBookClick(e) {
    if (switching || navigating || animating) return;
    if (e.target.closest && (e.target.closest('#stillDots') ||
        e.target.closest('#stillReturn') || e.target.closest('#stillOthers'))) return;

    var frame = e.target.closest ? e.target.closest('.still-frame') : null;
    if (frame) {
      var host = frame.closest('.still-page');
      if (host && host === pages[page]) {
        openMemory(host.getAttribute('data-id'));
        return;
      }
    }
    goTo(e.clientX < window.innerWidth / 2 ? page - 1 : page + 1);
  }

  function onWheel(e) {
    if (switching || navigating) return;
    e.preventDefault();
    if (wheelLock) return;
    wheelLock = true;
    if (wheelTimer) window.clearTimeout(wheelTimer);
    wheelTimer = window.setTimeout(function () { wheelLock = false; }, 420);
    goTo(page + (e.deltaY > 0 ? 1 : -1));
  }

  function openMemory(id) {
    var target = TARGETS[id];
    if (target) navigate(target, 900);
  }

  function applyBookSkin(key) {
    var b = document.body;
    ['megan','thomas','margaret'].forEach(function (k) {
      b.classList.toggle('book-' + k, k === key);
    });
  }

  function applyAccent(key) {
    applyBookSkin(key);
    document.body.style.setProperty('--accent-rgb', BOOKS[key].accentRgb);
    document.body.style.setProperty('--accent', BOOKS[key].accent);
  }

  function loadBook(key, done) {
    currentKey = key;
    if (!visited[key]) visited[key] = {};
    page = 0;
    animating = false;
    applyAccent(key);
    buildHeader(key);
    buildDots(key);
    buildBook(key, done);
    markVisited(0);
    if (closingTimer) {
      window.clearTimeout(closingTimer);
      closingTimer = null;
    }
    paint();
    settle(0);
    settle(0);
  }

  function switchBook(key) {
    if (switching || navigating) return;
    switching = true;
    if (reduced) {
      headerFadeSwap(key, 0);
      return;
    }
    bookEl.classList.add('book-out');
    headerEl().classList.add('hdr-fade');
    window.setTimeout(function () {
      headerFadeSwap(key, 500);
    }, 400);
  }

  function headerEl() {
    return document.getElementById('stillHeader');
  }

  function headerFadeSwap(key, inMs) {
    loadBook(key, function () {});
    try {
      window.history.replaceState(null, '', '#' + key);
    } catch (eHS) {
      window.location.hash = key;
    }
    bookEl.classList.remove('book-out');
    if (inMs === 0) {
      headerEl().classList.remove('hdr-fade');
      switching = false;
      return;
    }
    bookEl.classList.add('book-in');
    void bookEl.offsetWidth;
    bookEl.classList.remove('book-in');
    headerEl().classList.remove('hdr-fade');
    window.setTimeout(function () {
      switching = false;
    }, inMs);
  }

  function markVisited(p) {
    if (visited[currentKey]) visited[currentKey][p] = true;
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  var undertowT = 0;

  function noteTurn() {
    if (turned) return;
    turned = true;
    turnPromptEl.classList.add('prompt-gone');
  }

  var revealT = null;
  function revealCurrent() {
    if (revealT) window.clearTimeout(revealT);
    var page = pages[currentPage()];
    if (!page) return;
    var frame = page.querySelector('.still-frame');
    if (!frame || !frame.__reveal) return;
    var wait = page.classList.contains('page-wipe') ? 2600 : 1100;
    revealT = window.setTimeout(function () {
      if (pages[currentPage()] === page) frame.__reveal();
    }, wait);
  }

  function updateDots() {
    var cur = currentPage();
    for (var i = 0; i < dots.length; i++) {
      dots[i].classList.toggle('dot-current', i === cur);
      dots[i].classList.toggle('dot-visited', i !== cur && !!(visited[currentKey] && visited[currentKey][i]));
    }
  }


  function breatheDots() {
    if (reduced) return;
    if (!(window.Grammar && typeof window.Grammar.breath === 'function')) return;
    var cur = currentPage();
    for (var i = 0; i < dots.length; i++) {
      if (i === cur) {
        dots[i].style.opacity = '1';
        continue;
      }
      var b = window.Grammar.breath(i * 0.18);
      dots[i].style.opacity = String(1 + (b - 0.5) * 0.1);
    }
  }

  function stepBook(delta) {
    var idx = ORDER.indexOf(currentKey);
    for (var s = 1; s < ORDER.length; s++) {
      var k = ORDER[(idx + delta * s + ORDER.length * s) % ORDER.length];
      if (k !== currentKey) {
        switchBook(k);
        return;
      }
    }
  }

  function onKey(e) {
    if (e.key === 'Escape') {
      navigate('index.html', 900);
      return;
    }
    if (switching || navigating) return;
    var cur = currentPage();
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(cur - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(cur + 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      var page = pages[cur];
      if (page) openMemory(page.getAttribute('data-id'));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      stepBook(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      stepBook(1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      goTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goTo(pages.length - 1);
    }
  }

  function startAmbience() {
    var srcs = ['assets/audio/still_ambience_01.mp3', 'assets/audio/still_ambience_01.m4a', 'assets/audio/still_ambience_01.wav'];
    var i = 0;
    function attempt() {
      if (i >= srcs.length) return;
      try {
        var a = new Audio();
        a.loop = true;
        a.volume = 0;
        a.addEventListener('canplaythrough', function () {
          ambience = a;
          playAmbience();
        }, { once: true });
        a.addEventListener('error', function () {
          i++;
          attempt();
        }, { once: true });
        a.src = srcs[i];
        a.load();
      } catch (eAU) {
        i++;
        attempt();
      }
    }
    attempt();
  }

  function playAmbience() {
    if (!ambience) return;
    try {
      var p = ambience.play();
      if (p && typeof p.then === 'function') {
        p.then(fadeAmbience).catch(function () {
          var resume = function () {
            document.removeEventListener('pointerdown', resume);
            try {
              ambience.play().then(fadeAmbience).catch(function () {});
            } catch (eRP) {}
          };
          document.addEventListener('pointerdown', resume, { once: true });
        });
      } else {
        fadeAmbience();
      }
    } catch (ePA) {}
  }

  function fadeAmbience() {
    if (!ambience) return;
    var start = performance.now();
    var step = function () {
      if (!ambience) return;
      var t = (performance.now() - start) / 4000;
      if (t >= 1) {
        ambience.volume = ambienceTargetVol;
        return;
      }
      ambience.volume = ambienceTargetVol * t;
      window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }

  var STILL_LOCKED = true;

  function boot() {
    if (STILL_LOCKED){
      document.documentElement.classList.remove('still-on');
      document.body.classList.remove('still-on');
      document.body.innerHTML =
        '<div id="still-soon">' +
        '<p class="ss-soon-line">Still Water</p>' +
        '<p class="ss-soon-sub">Not open yet.</p>' +
        '<a class="ss-soon-back" href="index.html">back to the deep</a>' +
        '</div>';
      return;
    }
    document.documentElement.classList.add('still-on');
    document.body.classList.add('still-on');
    veilEl = document.getElementById('ss-veil');
    bookEl = document.getElementById('stillBook');
    headerNameEl = document.getElementById('stillName');
    othersEl = document.getElementById('stillOthers');
    dotsEl = document.getElementById('stillDots');
    turnPromptEl = document.getElementById('stillTurnPrompt');
    returnEl = document.getElementById('stillReturn');

    if (window.Veil && typeof window.Veil.silentResume === 'function') {
      window.Veil.silentResume();
    }

    var hash = (window.location.hash || '').replace('#', '');
    var key = ORDER.indexOf(hash) !== -1 ? hash : 'megan';

    if (window.Grammar && typeof window.Grammar.cursorOn === 'function') {
      window.Grammar.cursorOn();
    }
    setCursorMode('idle');

    returnEl.addEventListener('click', function () {
      navigate('index.html', 900);
    });
    returnEl.addEventListener('pointerenter', onNameEnter);
    returnEl.addEventListener('pointerleave', onNameLeave);

    bookEl.addEventListener('click', onBookClick);
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', function () { paint(); });

    bookEl.addEventListener('pointerenter', function () {
      setCursorMode('live');
    });
    bookEl.addEventListener('pointerleave', function () {
      if (!pointerDown) setCursorMode('idle');
    });

    loadBook(key, function () {
      liftVeil();
      startAmbience();
    });

    try {
      window.history.replaceState(null, '', '#' + key);
    } catch (eBH) {}

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
