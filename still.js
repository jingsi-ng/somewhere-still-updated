(function () {
  'use strict';

  var IMG_BASE = window.STILL_IMG_BASE || 'assets/img/';
  var SND_BASE = window.STILL_SND_BASE || 'assets/audio/';

  var BOOKS = {
    margaret: {
      name: 'Margaret',
      tint: 'rgba(178,58,46,',
      seas: [
        'radial-gradient(ellipse 130% 70% at 50% -12%, rgba(104,160,196,.26) 0%, rgba(104,160,196,0) 62%), linear-gradient(180deg, #0b2740 0%, #0e3350 28%, #0a2338 66%, #05101c 100%)'
      ],
      scenes: [
        { audio: 'still_Margaret_01.mp3',
          imgs: ['Margaret_w1_scene4_mother_2', 'Margaret_w1_scene6_crying', 'Margaret_w1_scene7_shoegift', 'Margaret_w1_scene8_dancingonstage'],
          text: 'When Margaret was a little girl, her mother took her to a ballet school. She fell in love with dancing and dreamed of becoming a famous dancer. At fifteen she failed to qualify for a national competition, but with her mother\u2019s encouragement she refused to give up. Two years later, wearing the ballet shoes her mother had given her, she returned to the stage and won best dancer.' },
        { audio: 'still_Margaret_02.mp3',
          imgs: ['margaret_wedding_margaret_01', 'Margaret_w3_infant_crib_01', 'Margaret_w4_reddoll_gift_01'],
          text: 'Years later Margaret married Peter. They promised to stay together for life. They had a daughter, and when she was five Margaret gave her a little doll wearing red shoes, to celebrate her courage on stage.' },
        { audio: 'still_Margaret_03.mp3',
          imgs: ['margaret_w5_crash_01', 'Margaret_w3_funeral_01_2', 'Margaret_w3_bandaged_daughter_01'],
          text: 'Then everything changed. A car accident took Peter\u2019s life and left Margaret with a badly injured ankle. Her daughter survived but was left with a permanent scar. Margaret could no longer dance and was forced to leave the national dance team. The solo she had been preparing for a long time was never completed.' },
        { audio: 'still_Margaret_04.mp3',
          imgs: ['Margaret_w4_oversized_shoes_01', 'Margaret_w4_podium_ceremony_01'],
          text: 'Margaret helped her daughter regain her confidence. At ten, her daughter put on Margaret\u2019s oversized ballet shoes and began dancing in front of the mirror. She wanted to return to the stage and finish the dance her mother never could. With Margaret\u2019s guidance she eventually became an accomplished dancer.' },
        { audio: 'still_Margaret_05.mp3',
          imgs: ['Margaret_w5_daughter_waving', 'Margaret_w5_videocall'],
          text: 'At eighteen her daughter was accepted into a prestigious dance academy. Margaret took her to the airport and watched her leave. Her days became quieter, filled with housework, video calls, and one familiar routine. Every day Margaret still practised standing on her toes. Perhaps she was trying to remember the dancer she once was. Or perhaps she was holding on to the dream she had passed on. The red ballet shoes remained a memory of her mother, her daughter, and a dream that never truly disappeared.' }
      ]
    },

    megan: {
      name: 'Megan',
      tint: 'rgba(138,132,147,',
      seas: [
        'radial-gradient(ellipse 130% 70% at 50% -12%, rgba(104,160,196,.26) 0%, rgba(104,160,196,0) 62%), linear-gradient(180deg, #0b2740 0%, #0e3350 28%, #0a2338 66%, #05101c 100%)'
      ],
      scenes: [
        { audio: 'still_Megan_01.mp3',
          imgs: ['megan_flash_couple_01', 'megan_flash_graduation_01', 'megan_fill2_photo_launch_01'],
          text: 'Megan and Hans met at university and soon became close friends. After graduation they built an art company together, making their own work while helping other artists put on exhibitions.' },
        { audio: 'still_Megan_02.mp3',
          imgs: ['megan_awborn_main_01', 'megan_awbreadth_main_01', 'megan_flash_argue_01'],
          text: 'For years they shared the same passion and the same dream. They worked on countless exhibitions together, and arguments became part of their friendship, until one disagreement changed everything. When Megan\u2019s artwork failed to become what she had imagined, the tension between them grew. Their differences became impossible to resolve.' },
        { audio: 'still_Megan_03.mp3',
          imgs: ['megan_flash_alone_studio_01', 'megan_awcalls_main_01'],
          text: 'They eventually closed the company and started their own businesses. They built new teams and continued their lives separately. Their calls became less frequent. Then one day they stopped completely.' },
        { audio: 'still_Megan_04.mp3',
          imgs: ['megan_awfall_main_01', 'megan_ending_megan_stick_01'],
          text: 'Years later Megan began preparing an exhibition called Our Big Whale. She calls him, but there is no answer. She keeps working on their unfinished idea, believing they will somehow complete it together. But her memories begin to blur. She cannot remember his ideas clearly any more, and the painting slowly becomes something different from what they once imagined.' },
        { audio: 'still_Megan_05.mp3',
          imgs: ['megan_fill1_whale_01', 'megan_flash_alone_studio_01', 'megan_flash_funeral_01', 'megan_flash_tornpainting_01', 'megan_ending_megan_stick_01'],
          text: 'Years later, Megan began preparing an exhibition called Our Big Whale. As you enter Megan\u2019s memory, you see the world through her eyes. A world that Hans still feels close. She calls him, but there is no answer. She continues working on their unfinished idea, believing they will somehow complete it together, but her memories begin to blur. She cannot remember his ideas clearly anymore. The painting slowly becomes something different from what they once imagined. Hans had been gone for years. But inside Megan\u2019s memories, he was still there.' }
      ]
    },

    thomas: {
      name: 'Thomas',
      tint: 'rgba(217,131,36,',
      seas: [
        'radial-gradient(ellipse 130% 70% at 50% -12%, rgba(104,160,196,.26) 0%, rgba(104,160,196,0) 62%), linear-gradient(180deg, #0b2740 0%, #0e3350 28%, #0a2338 66%, #05101c 100%)',
        'radial-gradient(ellipse 130% 70% at 50% -12%, rgba(120,150,180,.20) 0%, rgba(120,150,180,0) 62%), linear-gradient(180deg, #0a2038 0%, #0c2a44 28%, #081c2e 66%, #040c16 100%)',
        'radial-gradient(ellipse 130% 70% at 50% -12%, rgba(96,124,152,.14) 0%, rgba(96,124,152,0) 62%), linear-gradient(180deg, #071828 0%, #091f32 28%, #061422 66%, #030810 100%)',
        'radial-gradient(ellipse 130% 70% at 50% -12%, rgba(78,100,124,.10) 0%, rgba(78,100,124,0) 62%), linear-gradient(180deg, #04101c 0%, #061626 28%, #040d18 66%, #01050a 100%)'
      ],
      scenes: [
        { audio: 'still_Thomas_01.mp3',
          imgs: ['thomas_anchor_father_teaching_01', 'thomas_anchor_stage_father_01', 'thomas_anchor_bow_01'],
          text: 'Thomas began learning the harp as a boy. His father was strict. Every note had to follow the score perfectly. Even after a performance, Thomas only heard that he could do better than this. Those words pushed him onto the world stage, but they also made him believe he was never good enough.' },
        { audio: 'still_Thomas_02.mp3',
          imgs: ['thomas_anchor_wife_face_01', 'thomas_anchor_creating_01', 'thomas_anchor_sea_pregnant_01', 'thomas_anchor_sea_daughter_01'],
          text: 'Later Thomas met his wife. Together they played the harp by the sea and wrote their own music. After their daughter was born they returned to the same place, playing together as the sun went down. The music became a symbol of their family.' },
        { audio: 'still_Thomas_03.mp3',
          imgs: ['thomas_anchor_leaving_hall_01', 'thomas_anchor_accident_01', 'thomas_anchor_funeral_01'],
          text: 'One evening, after a performance, the family was driving home when a truck ran a red light. Thomas survived. His wife and daughter did not. Their shared score was damaged, leaving him with only fragments of the life they had made. At the funeral, Thomas played their final piece.' },
        { audio: 'still_Thomas_04.mp3',
          imgs: ['thomas_score_ourstory_chaos_01', 'thomas_harp_body_ruined_01', 'thomas_walking_into_sea_05'],
          text: 'Years later Thomas was diagnosed with Alzheimer\u2019s disease. He tried to repair the old score and write one final chapter, but his memories were fading. His hands grew weaker. His temper became harder to control. Eventually he could no longer play. One thing remained clear: his love for his wife. Thomas returns to the sea where their story began. He sits beside the waves with the unfinished score beside him. For the first time he does not need to play perfectly. He simply listens to the waves, to the melody, and to the memory of the woman he loved.' }
      ]
    }
  };

  var ORDER = ['megan', 'thomas', 'margaret'];

  var key = (location.hash || '').replace(/^#\/?/, '').toLowerCase();
  if (!BOOKS[key]) key = ORDER[0];
  var book = BOOKS[key];

  var wrap = document.getElementById('frameWrap');
  var capEl = document.getElementById('caption');
  var chapEl = document.getElementById('chapter');
  var barEl = document.querySelector('#progress i');
  var upBtn = document.getElementById('up');
  var downBtn = document.getElementById('down');
  var seaEl = document.getElementById('sea');
  var hintEl = document.getElementById('hint');

  var idx = -1;
  var audio = null;
  var imgTimer = null;
  var advTimer = null;
  var cards = [];
  var closing = false;

  function url(name) { return IMG_BASE + encodeURIComponent(name); }

  function makeCard(imgName) {
    var d = document.createElement('div');
    d.className = 'card ' + key;
    var inner = document.createElement('div');
    inner.className = 'inner';
    var im = document.createElement('img');
    im.alt = '';
    im.decoding = 'async';
    var tries = ['.webp', '.png', '.jpg'];
    var t = 0;
    im.onerror = function () {
      t++;
      if (t < tries.length) im.src = url(imgName + tries[t]);
    };
    im.src = url(imgName + tries[0]);
    inner.appendChild(im);
    d.appendChild(inner);
    return d;
  }

  function splitSentences(text) {
    var parts = text.match(/[^.!?]+[.!?]+["\u201d]?\s*/g) || [text];
    return parts.map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function paintCaption(scene) {
    capEl.innerHTML = '';
    scene._sent = splitSentences(scene.text);
    scene._spans = scene._sent.map(function (s, i) {
      var sp = document.createElement('span');
      sp.textContent = (i ? ' ' : '') + s;
      capEl.appendChild(sp);
      return sp;
    });
  }

  function stopScene() {
    if (imgTimer) { clearInterval(imgTimer); imgTimer = null; }
    if (advTimer) { clearTimeout(advTimer); advTimer = null; }
    if (audio) {
      try { audio.pause(); audio.currentTime = 0; } catch (e) {}
      audio = null;
    }
    cards.forEach(function (c) {
      c.classList.remove('on');
      c.classList.add('past');
      setTimeout(function () { if (c.parentNode) c.remove(); }, 1600);
    });
    cards = [];
  }

  function show(n) {
    if (closing) return;
    if (n < 0) n = 0;
    if (n >= book.scenes.length) { finish(); return; }
    if (n === idx) return;

    stopScene();
    idx = n;
    var scene = book.scenes[n];

    if (book.seas.length > 1) {
      seaEl.style.background = book.seas[Math.min(n, book.seas.length - 1)];
    }

    chapEl.textContent = book.name + ' \u00b7 ' + (n + 1) + ' of ' + book.scenes.length;

    scene.imgs.forEach(function (name) {
      var c = makeCard(name);
      wrap.appendChild(c);
      cards.push(c);
    });
    var shown = 0;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { cards[0].classList.add('on'); });
    });

    paintCaption(scene);

    upBtn.disabled = (n === 0);
    downBtn.disabled = false;

    audio = new Audio(SND_BASE + encodeURIComponent(scene.audio));
    audio.preload = 'auto';

    var started = false;
    var kick = function () {
      if (started) return;
      started = true;
      var pr = audio.play();
      if (pr && pr['catch']) pr['catch'](function () {
        started = false;
        var retry = function () { if (audio) audio.play()['catch'](function () {}); };
        window.addEventListener('pointerdown', retry, { once: true });
        window.addEventListener('keydown', retry, { once: true });
      });
    };
    if (audio.readyState >= 2) kick();
    else {
      audio.addEventListener('canplay', kick, { once: true });
      audio.addEventListener('loadeddata', kick, { once: true });
      audio.load();
    }

    var span = scene._spans;
    var total = span.length;
    var fallbackMs = Math.max(9000, scene.text.length * 62);

    imgTimer = setInterval(function () {
      var d = audio && isFinite(audio.duration) && audio.duration > 1
        ? audio.duration * 1000 : fallbackMs;
      var t = audio && audio.currentTime ? audio.currentTime * 1000 : 0;
      var p = Math.max(0, Math.min(1, t / d));

      barEl.style.width = (p * 100).toFixed(1) + '%';

      var want = Math.min(total - 1, Math.floor(p * total + .18));
      for (var i = 0; i <= want; i++) span[i].classList.add('on');

      var slot = Math.min(cards.length - 1, Math.floor(p * cards.length + .04));
      if (slot !== shown && cards[slot]) {
        if (cards[shown]) {
          cards[shown].classList.remove('on');
          cards[shown].classList.add('past');
        }
        cards[slot].classList.add('on');
        shown = slot;
      }

      if (p >= .999 && !advTimer) {
        advTimer = setTimeout(function () { advTimer = null; show(idx + 1); }, 2200);
      }
    }, 120);
  }

  function finish() {
    if (closing) return;
    closing = true;
    stopScene();
    document.body.classList.add('closing');
    chapEl.textContent = book.name;
    capEl.innerHTML = '';
    barEl.style.width = '100%';
    upBtn.disabled = false;
    downBtn.disabled = true;

    var con = document.createElement('div');
    con.id = 'constellation';
    book.scenes.forEach(function (s) {
      var c = makeCard(s.imgs[0]);
      c.classList.remove('card');
      c.className = 'cc card ' + key;
      c.style.width = 'min(15vw,160px)';
      c.style.height = 'min(19vw,196px)';
      c.style.opacity = '.34';
      c.style.transform = 'none';
      c.style.filter = 'none';
      con.appendChild(c);
    });
    document.body.appendChild(con);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { con.classList.add('on'); });
    });
  }

  function back() {
    if (closing) {
      var con = document.getElementById('constellation');
      if (con) con.remove();
      document.body.classList.remove('closing');
      closing = false;
      idx = -1;
      show(book.scenes.length - 1);
      return;
    }
    show(idx - 1);
  }

  upBtn.addEventListener('click', back);
  downBtn.addEventListener('click', function () { if (!closing) show(idx + 1); });

  window.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowUp') { e.preventDefault(); back(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); if (!closing) show(idx + 1); }
  });

  (function snow() {
    var cv = document.getElementById('snow');
    var cx = cv.getContext('2d');
    var flakes = [];
    var tint = book.tint;

    function size() {
      cv.width = innerWidth;
      cv.height = innerHeight;
    }
    size();
    window.addEventListener('resize', size);

    for (var i = 0; i < 76; i++) {
      flakes.push({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        r: .5 + Math.random() * 1.9,
        v: .12 + Math.random() * .42,
        d: Math.random() * 6.28,
        a: .12 + Math.random() * .4
      });
    }

    var motifs = [];
    for (var j = 0; j < 11; j++) {
      motifs.push({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        d: Math.random() * 6.28,
        s: .5 + Math.random() * .9,
        v: .10 + Math.random() * .30,
        a: .16 + Math.random() * .3,
        sp: .5 + Math.random() * .8
      });
    }

    function thread(m, al) {
      var len = 26 + m.s * 30;
      cx.strokeStyle = tint + al.toFixed(2) + ')';
      cx.lineWidth = .8 + m.s * .5;
      cx.beginPath();
      for (var q = 0; q <= 14; q++) {
        var u = q / 14;
        var xx = m.x + Math.sin(t * m.sp * 3 + m.d + u * 3.1) * (5 + m.s * 5);
        var yy = m.y + (u - .5) * len;
        if (q === 0) cx.moveTo(xx, yy); else cx.lineTo(xx, yy);
      }
      cx.stroke();
    }

    function bloom(m, al) {
      var rr = 12 + m.s * 20;
      var pulse = 1 + Math.sin(t * m.sp * 4 + m.d) * .16;
      var gr = cx.createRadialGradient(m.x, m.y, 0, m.x, m.y, rr * pulse);
      gr.addColorStop(0, tint + (al * .9).toFixed(2) + ')');
      gr.addColorStop(1, tint + '0)');
      cx.fillStyle = gr;
      cx.beginPath();
      cx.ellipse(m.x, m.y, rr * pulse, rr * pulse * .72, 0, 0, 6.2832);
      cx.fill();
      cx.strokeStyle = tint + (al * .5).toFixed(2) + ')';
      cx.lineWidth = .9;
      for (var q2 = 0; q2 < 3; q2++) {
        cx.beginPath();
        cx.moveTo(m.x + (q2 - 1) * rr * .34, m.y + rr * .5);
        cx.quadraticCurveTo(
          m.x + (q2 - 1) * rr * .34 + Math.sin(t * m.sp * 3 + q2) * 7,
          m.y + rr * .95,
          m.x + (q2 - 1) * rr * .34, m.y + rr * 1.4);
        cx.stroke();
      }
    }

    function noteMark(m, al) {
      var sc = .7 + m.s * .7;
      cx.save();
      cx.translate(m.x, m.y);
      cx.rotate(Math.sin(t * m.sp * 2 + m.d) * .5);
      cx.fillStyle = tint + al.toFixed(2) + ')';
      cx.beginPath();
      cx.ellipse(0, 0, 5.2 * sc, 3.8 * sc, -.42, 0, 6.2832);
      cx.fill();
      cx.strokeStyle = tint + (al * .8).toFixed(2) + ')';
      cx.lineWidth = 1.3 * sc;
      cx.beginPath();
      cx.moveTo(4.4 * sc, -1.4 * sc);
      cx.lineTo(4.4 * sc, -15 * sc);
      cx.stroke();
      cx.restore();
    }

    var drawMotif = key === 'margaret' ? thread : (key === 'megan' ? bloom : noteMark);

    var t = 0;
    (function loop() {
      t += .006;
      cx.clearRect(0, 0, cv.width, cv.height);
      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
        f.y += f.v;
        f.x += Math.sin(t + f.d) * .22;
        if (f.y > cv.height + 8) { f.y = -8; f.x = Math.random() * cv.width; }
        cx.beginPath();
        cx.arc(f.x, f.y, f.r, 0, 6.2832);
        cx.fillStyle = 'rgba(206,226,240,' + f.a.toFixed(2) + ')';
        cx.fill();
      }
      for (var j2 = 0; j2 < motifs.length; j2++) {
        var m = motifs[j2];
        m.y += m.v;
        m.x += Math.sin(t * .7 + m.d) * .34;
        if (m.y > cv.height + 60) { m.y = -60; m.x = Math.random() * cv.width; }
        drawMotif(m, m.a * (.6 + Math.sin(t * 1.4 + m.d) * .4));
      }
      requestAnimationFrame(loop);
    })();
  })();

  document.documentElement.style.setProperty('--book-tint', book.tint + '1)');

  setTimeout(function () { hintEl.classList.add('on'); }, 2400);
  setTimeout(function () { hintEl.classList.remove('on'); }, 9000);

  if (window.Veil && Veil.silentResume) Veil.silentResume();

  function stillGatePaint(api){
    api.exitMs = 900;
    api.fadeMs = 1100;
    api.holdMs = 1400;
    api.say = 'Hold to dive into the memories. Or press enter.';
    api.loadSay = 'The water is still settling.';
    var BLOBS = [
      { c: '178,58,46',   u: 0.38, v: 0.60, r: 0.40, sp: 0.052, ph: 0.0 },
      { c: '217,131,36',  u: 0.58, v: 0.66, r: 0.36, sp: 0.041, ph: 2.3 },
      { c: '138,132,147', u: 0.48, v: 0.54, r: 0.44, sp: 0.033, ph: 4.4 }
    ];
    var trail = [];
    var lastT = 0, lastX = null, lastY = null;
    return function (a) {
      var g = a.ctx, W = a.w(), H = a.h(), t = a.t(), d = a.dpr;
      var dt = Math.min(0.05, t - lastT); lastT = t;
      g.setTransform(d, 0, 0, d, 0, 0);

      var sink = a.leaving() ? a.since : 0;
      var dive = Math.min(1, sink / 0.9);
      var hold = a.hold || 0;
      var charge = hold * hold;
      var rd = a.ready == null ? 1 : a.ready;

      g.fillStyle = '#0a1128';
      g.fillRect(0, 0, W, H);

      var spread = Math.min(W, H);
      for (var i = 0; i < BLOBS.length; i++) {
        var b = BLOBS[i];
        var wob = Math.sin(t * b.sp * 6.283 + b.ph);
        var wob2 = Math.cos(t * b.sp * 4.1 + b.ph);
        var apart = (1 - rd) * 0.26;
        var cx = W * (b.u + (b.u - 0.48) * apart * 4) + wob * spread * 0.045;
        var cy = H * b.v + wob2 * spread * 0.03;
        var rad = spread * b.r * (1 + wob * 0.07 + charge * 0.55)
                * (1 + dive * 14);
        var al = (0.30 + wob2 * 0.06 + charge * 0.34) * (1 - dive * 0.25);
        var rg = g.createRadialGradient(cx, cy, 0, cx, cy, rad);
        rg.addColorStop(0,    'rgba(' + b.c + ',' + al.toFixed(3) + ')');
        rg.addColorStop(0.42, 'rgba(' + b.c + ',' + (al * 0.42).toFixed(3) + ')');
        rg.addColorStop(1,    'rgba(' + b.c + ',0)');
        g.fillStyle = rg;
        g.beginPath();
        g.arc(cx, cy, rad, 0, 6.283);
        g.fill();
      }

      if (a.mouse.on && !a.leaving()) {
        var mvd = lastX == null ? 0 : Math.hypot(a.mouse.x - lastX, a.mouse.y - lastY);
        if (mvd > 6 && trail.length < 26) {
          trail.push({ x: a.mouse.x, y: a.mouse.y, born: t, r: 12 + Math.min(26, mvd) });
        }
        lastX = a.mouse.x; lastY = a.mouse.y;
      }
      for (var k = trail.length - 1; k >= 0; k--) {
        var p = trail[k];
        var age = t - p.born;
        if (age > 1.6) { trail.splice(k, 1); continue; }
        var e = age / 1.6;
        var rr = p.r * (1 + e * 2.6);
        var pa = (1 - e) * (1 - e) * 0.16;
        var pg = g.createRadialGradient(p.x, p.y, rr * 0.55, p.x, p.y, rr);
        pg.addColorStop(0, 'rgba(226,238,248,0)');
        pg.addColorStop(0.72, 'rgba(226,238,248,' + pa.toFixed(3) + ')');
        pg.addColorStop(1, 'rgba(226,238,248,0)');
        g.fillStyle = pg;
        g.beginPath();
        g.arc(p.x, p.y, rr, 0, 6.283);
        g.fill();
      }

      var ty = H * 0.34 - dive * H * 0.22;
      var ta = (1 - dive) * (0.72 - charge * 0.2);
      if (ta > 0.01) {
        g.save();
        g.globalAlpha = ta;
        g.fillStyle = '#e8eef6';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        var fs = Math.max(19, Math.min(40, W * 0.026));
        g.font = '400 ' + fs + 'px Lora, Georgia, serif';
        var word = 'SOMEWHERE STILL';
        var sp = fs * 0.42;
        var total = 0, m;
        for (m = 0; m < word.length; m++) total += g.measureText(word[m]).width + sp;
        total -= sp;
        var x = W / 2 - total / 2;
        for (m = 0; m < word.length; m++) {
          var ch = word[m];
          g.fillText(ch, x + g.measureText(ch).width / 2, ty);
          x += g.measureText(ch).width + sp;
        }
        g.restore();
      }

      if (rd < 1) {
        var wx = W / 2, wy = H * 0.62, wr = spread * 0.11;
        g.strokeStyle = 'rgba(226,238,248,0.14)';
        g.lineWidth = 1.2;
        g.beginPath(); g.arc(wx, wy, wr, 0, 6.283); g.stroke();
        g.strokeStyle = 'rgba(226,238,248,0.42)';
        g.lineWidth = 1.6;
        g.beginPath();
        g.arc(wx, wy, wr, -1.5708, -1.5708 + 6.283 * rd);
        g.stroke();
      }

      if (hold > 0 && !a.leaving()) {
        var rx = W / 2, ry = H * 0.62;
        g.strokeStyle = 'rgba(226,238,248,' + (0.16 + hold * 0.44).toFixed(3) + ')';
        g.lineWidth = 1.6;
        g.beginPath();
        g.arc(rx, ry, spread * 0.11, -1.5708, -1.5708 + 6.283 * hold);
        g.stroke();
      }

      if (dive > 0) {
        g.fillStyle = 'rgba(232,240,248,' + (dive * dive * 0.92).toFixed(3) + ')';
        g.fillRect(0, 0, W, H);
      }
    };
  }

  if (window.Veil && Veil.gate) Veil.gate(null, stillGatePaint, function () { show(0); });
  else show(0);
  if (window.Veil && Veil.lift) setTimeout(function () { Veil.lift(); }, 120);

})();
