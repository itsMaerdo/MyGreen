/* ============================================================
   features.js — ses ayarı, gizli panel, daktilo notlar, şarkı anları
   script.js'ten SONRA yüklenir. Ayarlar: moments-config.js
   ============================================================ */
(() => {
  "use strict";

  const DEV = new URLSearchParams(location.search).has("dev");
  const FC = Object.assign({
    secretClicks: 7,
    clickResetMs: 2500,
    typeMsPerChar: 28,
    sentencePauseBase: 400,
    pausePerWord: 90,
    buttonLabel: "bu an",
    outroHold: 1.4,
    moments: []
  }, window.FEATURES_CONFIG || {});
  const BLOBS = window.SECRET_BLOBS || [];
  const audio = document.getElementById("audio-player");

  const store = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* yok say */ } }
  };

  /* ---------------- 1. SES AYARI ---------------- */
  (function volume() {
    const host = document.querySelector(".music-progress");
    if (!host) return;
    const row = document.createElement("div");
    row.className = "music-volume";
    row.innerHTML =
      '<button type="button" class="vol-btn" aria-label="Sesi kapat / aç">' +
      '<svg viewBox="0 0 24 24" fill="none"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" fill="currentColor"/>' +
      '<path class="vol-wave" d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>' +
      '<input type="range" min="0" max="100" step="1" aria-label="Ses">';
    host.after(row);
    const slider = row.querySelector("input");
    const btn = row.querySelector(".vol-btn");
    let level = store.get("siteVolumeV1", 70);
    let last = level || 70;
    let muted = false;
    function apply() {
      audio.volume = Math.pow(muted ? 0 : level / 100, 2); // kulağa daha doğal bir eğri
      slider.value = muted ? 0 : level;
      row.classList.toggle("muted", muted || level === 0);
    }
    slider.addEventListener("input", () => {
      level = +slider.value; muted = false;
      if (level > 0) last = level;
      store.set("siteVolumeV1", level);
      apply();
    });
    btn.addEventListener("click", () => {
      if (muted || level === 0) { muted = false; level = last; store.set("siteVolumeV1", level); }
      else muted = true;
      apply();
    });
    apply();
  })();

  /* ---------------- ORTAK: DAKTİLO NOT PENCERESİ ---------------- */
  const openNotes = new Map();
  let noteCascade = 0;

  async function typewrite(textNode, body, text, tok) {
    const pieces = [];
    const paras = text.split(/\n+/).filter(Boolean);
    paras.forEach((para, pi) => {
      const sents = para.split(/(?<=[.!?…])\s+/).filter(Boolean);
      sents.forEach((s, si) => {
        const lastS = si === sents.length - 1;
        const lastP = pi === paras.length - 1;
        pieces.push({ s, sep: lastS ? (lastP ? "" : "\n\n") : " ", words: s.split(/\s+/).length });
      });
    });
    const full = pieces.map((x) => x.s + x.sep).join("");
    const sleep = (ms) => new Promise((r) => setTimeout(r, tok.skip ? 0 : ms));

    for (const p of pieces) {
      let n = 0;
      for (const ch of p.s) {
        if (tok.cancel) return;
        if (tok.skip) { textNode.nodeValue = full; body.scrollTop = body.scrollHeight; return; }
        textNode.nodeValue += ch;
        if (++n % 6 === 0) body.scrollTop = body.scrollHeight;
        await sleep(FC.typeMsPerChar + (/[,;:]/.test(ch) ? 140 : 0));
      }
      await sleep(FC.sentencePauseBase + p.words * FC.pausePerWord);
      textNode.nodeValue += p.sep;
      body.scrollTop = body.scrollHeight;
    }
  }

  function openNote({ id, title, text }) {
    if (openNotes.has(id)) { bringToFront(openNotes.get(id)); return; }

    const el = document.createElement("div");
    el.className = "floating-window note-window extra-note";
    el.innerHTML =
      '<div class="window-titlebar"><span class="window-title"></span>' +
      '<div class="window-controls"><button class="win-btn" data-close aria-label="Kapat">×</button></div></div>' +
      '<div class="window-body note-body"><p class="note-text"></p></div><div class="resize-handle"></div>';
    el.querySelector(".window-title").textContent = title || "not.txt";

    noteCascade = (noteCascade + 26) % 130;
    el.style.left = Math.max(10, (window.innerWidth - 420) / 2 - 60 + noteCascade) + "px";
    el.style.top = Math.max(10, window.innerHeight * 0.12 + noteCascade) + "px";
    document.body.appendChild(el);
    bringToFront(el);
    makeDraggable(el, el.querySelector(".window-titlebar"));
    makeResizable(el, el.querySelector(".resize-handle"), 260, 220);

    const body = el.querySelector(".note-body");
    const p = el.querySelector(".note-text");
    const textNode = document.createTextNode("");
    const cursor = document.createElement("span");
    cursor.className = "tw-cursor";
    p.append(textNode, cursor);

    const tok = { cancel: false, skip: false };
    body.addEventListener("click", () => { tok.skip = true; });
    el.addEventListener("mousedown", () => bringToFront(el));
    el.querySelector("[data-close]").addEventListener("click", () => {
      tok.cancel = true; el.remove(); openNotes.delete(id);
    });
    openNotes.set(id, el);

    typewrite(textNode, body, text || "", tok).then(() => {
      setTimeout(() => cursor.classList.add("gone"), 1500);
    });
  }

  function chime() {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const t0 = ac.currentTime;
      [659.25, 987.77, 1318.5].forEach((f, i) => {
        const o = ac.createOscillator(), g = ac.createGain(), s = t0 + i * 0.09;
        o.type = "sine"; o.frequency.value = f;
        g.gain.setValueAtTime(0, s);
        g.gain.linearRampToValueAtTime(0.05, s + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, s + 1.4);
        o.connect(g); g.connect(ac.destination);
        o.start(s); o.stop(s + 1.5);
      });
      setTimeout(() => ac.close(), 2500);
    } catch (e) { /* ses yoksa sessiz geç */ }
  }

  /* ---------------- 2. GİZLİ PANEL ("yavrum") ---------------- */
  const found = new Set(store.get("secretsFoundV1", []));

  const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  async function tryDecrypt(blob, code) {
    try {
      const km = await crypto.subtle.importKey("raw", new TextEncoder().encode(code), "PBKDF2", false, ["deriveKey"]);
      const key = await crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: b64(blob.s), iterations: blob.i, hash: "SHA-256" },
        km, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
      const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(blob.v) }, key, b64(blob.c));
      return JSON.parse(new TextDecoder().decode(pt));
    } catch (e) { return null; }
  }
  async function tryCode(code) {
    for (let i = 0; i < BLOBS.length; i++) {
      const data = await tryDecrypt(BLOBS[i], code);
      if (data) return { index: i, data };
    }
    return null;
  }

  let panel = null;
  function openCodePanel() {
    if (panel) {
      panel.classList.remove("hidden");
      bringToFront(panel);
      panel.querySelector("input").focus();
      return;
    }
    panel = document.createElement("div");
    panel.className = "floating-window code-panel";
    panel.innerHTML =
      '<div class="window-titlebar"><span class="window-title">terminal</span>' +
      '<div class="window-controls"><button class="win-btn" data-close aria-label="Kapat">×</button></div></div>' +
      '<div class="window-body code-body"><span class="code-prompt">&gt;</span>' +
      '<input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="kod">' +
      '<span class="code-count"></span></div>';
    document.body.appendChild(panel);
    bringToFront(panel);
    makeDraggable(panel, panel.querySelector(".window-titlebar"));

    const input = panel.querySelector("input");
    const count = panel.querySelector(".code-count");
    const refresh = () => { count.textContent = found.size + "/" + BLOBS.length; };
    refresh();
    input.focus();

    const close = () => panel.classList.add("hidden");
    panel.querySelector("[data-close]").addEventListener("click", close);
    panel.addEventListener("mousedown", () => bringToFront(panel));

    function flash(cls) {
      panel.classList.remove("shake", "ok");
      void panel.offsetWidth;
      panel.classList.add(cls);
    }
    input.addEventListener("keydown", async (e) => {
      if (e.key === "Escape") { close(); return; }
      if (e.key !== "Enter") return;
      const code = input.value.trim().toLowerCase();
      if (!code) return;
      input.disabled = true;
      const res = await tryCode(code);
      input.disabled = false;
      input.focus();
      if (!res) { flash("shake"); return; }
      input.value = "";
      flash("ok");
      chime();
      found.add(res.index);
      store.set("secretsFoundV1", [...found]);
      refresh();
      openNote({ id: "secret-" + res.index, title: res.data.title, text: res.data.text });
    });
  }

  (function setupTrigger() {
    const p = document.querySelector(".below-text p");
    if (!p) return;
    const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
    let n, span = null;
    while ((n = walker.nextNode())) {
      const i = n.nodeValue.indexOf("yavrum");
      if (i < 0) continue;
      const mid = n.splitText(i);
      mid.splitText(6);
      span = document.createElement("span");
      span.className = "secret-trigger";
      mid.parentNode.insertBefore(span, mid);
      span.appendChild(mid);
      break;
    }
    if (!span) return;

    let clicks = 0, timer = null;
    span.addEventListener("click", () => {
      clicks++;
      clearTimeout(timer);
      timer = setTimeout(() => { clicks = 0; span.style.setProperty("--charge", 0); }, FC.clickResetMs);
      const charge = Math.min(clicks / FC.secretClicks, 1);
      span.style.setProperty("--charge", charge.toFixed(3));

      span.classList.remove("pop"); void span.offsetWidth; span.classList.add("pop");
      const ring = document.createElement("i");
      ring.className = "s-ripple";
      ring.addEventListener("animationend", () => ring.remove());
      span.appendChild(ring);
      const sparks = 3 + Math.round(charge * 6);
      for (let k = 0; k < sparks; k++) {
        const s = document.createElement("i");
        const ang = Math.random() * Math.PI * 2, dist = 18 + Math.random() * 30;
        s.className = "s-spark";
        s.style.setProperty("--dx", Math.cos(ang) * dist + "px");
        s.style.setProperty("--dy", Math.sin(ang) * dist + "px");
        s.addEventListener("animationend", () => s.remove());
        span.appendChild(s);
      }

      if (clicks >= FC.secretClicks) {
        clicks = 0; clearTimeout(timer);
        setTimeout(() => span.style.setProperty("--charge", 0), 500);
        openCodePanel();
      }
    });
  })();

  /* ---------------- 3. ŞARKI ANLARI ---------------- */
  (function moments() {
    const list = (FC.moments || [])
      .map((m, i) => Object.assign({}, m, { key: m.id || "m" + i }))
      .filter((m) => m.track && Array.isArray(m.lines) && m.lines.length &&
        Number.isFinite(m.buttonAt) && Number.isFinite(m.end) &&
        m.lines.every((l) => l.text && Number.isFinite(l.at)));
    if (!list.length) return;
    list.forEach((m) => { m.start = m.lines[0].at; m.url = new URL(m.track, document.baseURI).href; });

    const reveal = document.getElementById("reveal");
    const sameTrack = (m) => audio.src === m.url;

    const btn = document.createElement("button");
    btn.className = "moment-btn";
    btn.innerHTML = '<span class="mb-label"></span><i class="mb-bar"><b></b></i>';
    btn.querySelector(".mb-label").textContent = FC.buttonLabel;
    document.body.appendChild(btn);
    const bar = btn.querySelector(".mb-bar b");

    let active = null, shown = null;

    /* --- parçacıklar --- */
    function startParticles(canvas) {
      const ctx = canvas.getContext("2d");
      let W = 0, H = 0, run = true, energy = 0;
      const dust = [], burst = [];
      function resize() {
        const d = Math.min(window.devicePixelRatio || 1, 2);
        W = canvas.width = innerWidth * d; H = canvas.height = innerHeight * d;
      }
      resize(); window.addEventListener("resize", resize);
      for (let i = 0; i < 90; i++) {
        dust.push({ x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.8,
          vy: 0.00006 + Math.random() * 0.00026, ph: Math.random() * 6.28, a: 0.15 + Math.random() * 0.5 });
      }
      (function loop() {
        if (!run) return;
        requestAnimationFrame(loop);
        ctx.clearRect(0, 0, W, H);
        const sc = W / innerWidth;
        for (const p of dust) {
          p.y -= p.vy * (1 + energy * 6); p.ph += 0.02;
          if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
          const x = (p.x + Math.sin(p.ph * 0.6) * 0.012) * W, y = p.y * H;
          const al = p.a * (0.6 + 0.4 * Math.sin(p.ph)) * (1 + energy);
          ctx.fillStyle = "rgba(102,255,3," + Math.min(al, 1).toFixed(3) + ")";
          ctx.beginPath(); ctx.arc(x, y, p.r * sc * (1 + energy * 0.8), 0, 6.283); ctx.fill();
        }
        for (let i = burst.length - 1; i >= 0; i--) {
          const b = burst[i];
          b.x += b.vx; b.y += b.vy; b.vx *= 0.985; b.vy *= 0.985; b.life -= 0.01;
          if (b.life <= 0) { burst.splice(i, 1); continue; }
          ctx.fillStyle = "rgba(160,255,90," + (b.life * 0.8).toFixed(3) + ")";
          ctx.beginPath(); ctx.arc(b.x, b.y, b.r * sc, 0, 6.283); ctx.fill();
        }
        energy *= 0.96;
      })();
      return {
        stop() { run = false; window.removeEventListener("resize", resize); },
        burst() {
          energy = 1;
          for (let i = 0; i < 70; i++) {
            const a = Math.random() * 6.283, v = (1 + Math.random() * 6) * sc;
            burst.push({ x: W / 2, y: H / 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 0.8 + Math.random() * 2, life: 0.6 + Math.random() * 0.4 });
          }
        }
      };
    }

    /* --- başlat / bitir --- */
    function begin(m) {
      if (audio.paused) audio.play().catch(() => {});
      const ov = document.createElement("div");
      ov.className = "m-overlay";
      ov.innerHTML = '<canvas class="m-canvas"></canvas><div class="m-glow"></div><div class="m-stage"></div><div class="m-vignette"></div>';
      document.body.appendChild(ov);
      const stage = ov.querySelector(".m-stage");
      const parts = startParticles(ov.querySelector(".m-canvas"));

      const lines = m.lines.map((l, i) => {
        const el = document.createElement("div");
        el.className = "m-line" + (l.emph ? " m-emph" : "");
        el.dataset.age = "x";
        const next = m.lines[i + 1];
        const span = Math.max(0.5, (next ? next.at : m.end) - l.at) * 0.88;
        const words = l.text.split(/\s+/).filter(Boolean);
        const total = words.reduce((a, w) => a + w.length + 1, 0);
        let acc = 0;
        const ws = words.map((w) => {
          const s = document.createElement("span");
          s.className = "m-word"; s.textContent = w;
          el.appendChild(s);
          const at = l.at + span * (acc / total);
          acc += w.length + 1;
          return { el: s, at, on: false };
        });
        stage.appendChild(el);
        return { el, l, ws };
      });

      requestAnimationFrame(() => ov.classList.add("on"));
      active = { m, ov, lines, parts, idx: -1, lastT: audio.currentTime };
      setShown(null);
    }

    function emphasis(a) {
      a.ov.classList.remove("pulse"); void a.ov.offsetWidth; a.ov.classList.add("pulse");
      a.parts.burst();
      const ring = document.createElement("div");
      ring.className = "m-ring";
      a.ov.appendChild(ring);
      setTimeout(() => ring.remove(), 2400);
    }

    function finish(ok) {
      const a = active; active = null;
      a.ov.classList.remove("on");
      setTimeout(() => { a.parts.stop(); a.ov.remove(); }, 1800);
      if (!ok) return;
      if (a.m.note && a.m.note.text) {
        setTimeout(() => openNote({ id: "moment-" + a.m.key, title: a.m.note.title || "not.txt", text: a.m.note.text }), 1500);
      }
    }

    function runActive(t) {
      const a = active, m = a.m;
      if (!sameTrack(m)) return finish(a.lastT >= m.end - 0.5);
      if (t < m.buttonAt - 1) return finish(false); // tuş penceresinden önceye sarıldıysa iptal
      a.lastT = t;

      while (a.idx + 1 < a.lines.length && t >= a.lines[a.idx + 1].l.at) {
        a.idx++;
        a.lines.forEach((x, j) => { x.el.dataset.age = j > a.idx ? "x" : Math.min(a.idx - j, 3); });
        if (a.lines[a.idx].l.emph) emphasis(a);
      }
      for (let j = 0; j <= a.idx; j++) {
        for (const w of a.lines[j].ws) {
          if (!w.on && t >= w.at) { w.on = true; w.el.classList.add("on"); }
        }
      }
      if (t >= m.end + FC.outroHold) finish(true);
    }

    function setShown(m) {
      shown = m;
      btn.classList.toggle("show", !!m);
    }

    function frame() {
      requestAnimationFrame(frame);
      const t = audio.currentTime;
      if (active) { runActive(t); return; }

      let cand = null;
      if (reveal.classList.contains("visible")) {
        for (const m of list) {
          if (sameTrack(m) && t >= m.buttonAt && t < m.start) { cand = m; break; }
        }
      }
      if (cand !== shown) setShown(cand);
      if (cand) bar.style.width = (100 * (cand.start - t) / (cand.start - cand.buttonAt)).toFixed(1) + "%";
    }

    btn.addEventListener("click", () => { if (shown) begin(shown); });
    if (DEV) window.addEventListener("keydown", (e) => { if (e.key === "Escape" && active) finish(false); });
    requestAnimationFrame(frame);
  })();
})();