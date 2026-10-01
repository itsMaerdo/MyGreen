/* ============================================================
   devtools.js — ZAMAN YAKALAMA ARACI
   Sadece adres çubuğunda ?dev=1 varsa görünür.
   Silmek için: index.html'deki <script src="js/devtools.js"> satırını kaldır.
   ============================================================ */
(() => {
  if (!new URLSearchParams(location.search).has("dev")) return;

  const style = document.createElement("style");
  style.textContent = `
    .dev-panel{width:280px;left:20px;top:20px;z-index:9500}
    .dev-body{padding:.7rem .8rem .8rem;display:flex;flex-direction:column;gap:.55rem;font-size:.7rem;color:var(--gray-1)}
    .dev-time{font-family:var(--display-font);font-size:1.7rem;color:var(--accent);text-align:center}
    .dev-track{text-align:center;color:var(--gray-2);font-size:.6rem;word-break:break-all}
    .dev-row{display:flex;gap:.35rem}
    .dev-row button,.dev-row input{flex:1;min-width:0;background:#0a0a0a;border:1px solid var(--gray-3);color:var(--text);
      font-family:var(--body-font);font-size:.68rem;padding:.4rem;border-radius:3px;cursor:pointer}
    .dev-row button:hover{border-color:var(--accent);color:var(--accent)}
    .dev-mark{background:var(--accent)!important;color:#080808!important;font-weight:500}
    .dev-list{max-height:110px;overflow:auto;line-height:1.6}
    .dev-out{width:100%;height:54px;background:#0a0a0a;border:1px solid var(--gray-3);color:var(--text);
      font-size:.68rem;padding:.4rem;resize:none;border-radius:3px}
  `;
  document.head.appendChild(style);

  const audio = document.getElementById("audio-player");
  const el = document.createElement("div");
  el.className = "floating-window dev-panel";
  el.innerHTML =
    '<div class="window-titlebar"><span class="window-title">zaman yakalama</span></div>' +
    '<div class="window-body dev-body">' +
      '<div class="dev-time">0.00</div><div class="dev-track"></div>' +
      '<div class="dev-row"><button class="dev-mark" data-a="mark">işaretle (M)</button><button data-a="undo">geri al</button><button data-a="clear">temizle</button></div>' +
      '<div class="dev-row"><button data-a="b3">−3 sn</button><button data-a="f3">+3 sn</button><input type="number" step="0.1" placeholder="git"><button data-a="go">→</button></div>' +
      '<div class="dev-list"></div>' +
      '<textarea class="dev-out" readonly></textarea>' +
      '<div class="dev-row"><button data-a="copy">kopyala</button></div>' +
    '</div>';
  document.body.appendChild(el);
  makeDraggable(el, el.querySelector(".window-titlebar"));

  const timeEl = el.querySelector(".dev-time");
  const trackEl = el.querySelector(".dev-track");
  const listEl = el.querySelector(".dev-list");
  const outEl = el.querySelector(".dev-out");
  const goInput = el.querySelector("input");
  let marks = [];

  function render() {
    listEl.innerHTML = marks.map((t, i) => `${i + 1}. ${t.toFixed(2)} sn`).join("<br>");
    outEl.value = "[" + marks.map((t) => t.toFixed(2)).join(", ") + "]";
    listEl.scrollTop = listEl.scrollHeight;
  }
  function mark() { marks.push(audio.currentTime); render(); }

  el.addEventListener("click", (e) => {
    const a = e.target.dataset && e.target.dataset.a;
    if (!a) return;
    if (a === "mark") mark();
    if (a === "undo") { marks.pop(); render(); }
    if (a === "clear") { marks = []; render(); }
    if (a === "b3") audio.currentTime = Math.max(0, audio.currentTime - 3);
    if (a === "f3") audio.currentTime += 3;
    if (a === "go" && goInput.value !== "") audio.currentTime = parseFloat(goInput.value);
    if (a === "copy") {
      outEl.select();
      (navigator.clipboard ? navigator.clipboard.writeText(outEl.value) : Promise.reject()).catch(() => document.execCommand("copy"));
    }
  });
  window.addEventListener("keydown", (e) => {
    if (/INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if (e.key.toLowerCase() === "m") mark();
    if (e.key === "Backspace") { marks.pop(); render(); }
  });

  (function tick() {
    requestAnimationFrame(tick);
    timeEl.textContent = audio.currentTime.toFixed(2);
    trackEl.textContent = decodeURIComponent((audio.src || "").split("/").slice(-2).join("/"));
  })();
  render();
})();
