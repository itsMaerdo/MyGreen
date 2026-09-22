/* ============================================================
   6. AYIMIZ — script.js
   Aşağıdaki CONFIG bölümünü kendine göre düzenle.
   ============================================================ */

const CONFIG = {

  // İlişkinizin başladığı tarih (canlı sayaç bunu baz alır)
  relationshipStart: "2026-04-02T08:06:00",

  // Düğmenin kilidinin açılacağı tarih (bu tarihe kadar tıklanamaz)
  // KENDİ TARİHİNLE DEĞİŞTİR — örnek olarak ileri bir tarih verdim,
  // aksi halde site direkt "açık" görünür.
  unlockDate: "2024-10-02T08:06:00",

  // Kilide kaç gün kala düğme yeşile doğru parlamaya başlasın.
  // Geçiş artık lineer değil, yumuşak (smoothstep) bir eğriyle ilerliyor.
  glowWindowDays: 7,

  // Düğmeye basılınca sırayla ekrana gelecek cinematik metinler
  cinematicLines: [
    "Tam 6 ay",
    "Guzelligin, zekan, gulusun, bakislarin, gozlerin, saclarin, dudaklarin, sesin, konusma seklin, mimiklerin, tatliligin, sefkatin, anlayisin, sabrin, karakterin, kisiligin, dusuncelerin, olaylara bakis acin, espri anlayisin, bana karsi davranislarin, beni dinleyisin, beni anlayisin, kucuk seyleri bile hatirlaman, beni mutlu etmek icin yaptigin seyler, sesini duydugumda hissettirdiklerin, mesajlarini gordugumde yuzumde olusan gulumseme, benimle konusurkenki halin, utandigin anlar, heyecanlandigin anlar, kızman, naz yapman, triplerin, tatli kiskancliklarin, bana 'askim' diyişin, bana verdigin deger, bana hissettirdigin guven, yanımda olmasan bile kendimi sana yakin hissettirebilmen, en siradan konusmayi bile benim icin ozel hale getirmen, beni oldugum gibi kabul etmen, hayatima kattigin mutluluk, varligin",
    "Kısacası her şeylinle",
    "Tam 6 aydır beni büyülüyosun"
  ],

  // Her satırın ekranda kalma süresi (ms)
  lineHoldMs: 1775,

  // Varsayılan müzik listesi — site açıldığında localStorage'da
  // kayıtlı bir liste yoksa bu kullanılır. Site içindeki ✎ (düzenle)
  // düğmesinden parça ekleyip çıkarabilir, isim değiştirebilirsin;
  // yaptığın değişiklikler tarayıcıda saklanır.
  musicFiles: [
    { path: "musics/mus1.mp3", title: "if not for you, hell would be knockin' on my door" },
    { path: "musics/mus2.mp3", title: "you... all i ever wanted is you, my love" },
    { path: "musics/mus3.mp3", title: "i see your face when i close my eyes" }
  ],

  // 3. tarih — not penceresindeki sayaç bunu baz alır.
  // Geçmişte bir tarihse "geçen süre", gelecekte bir tarihse
  // "kalan süre" olarak otomatik gösterilir. Kendi tarihini gir.
  thirdDate: "2027-04-02T08:06:00",
  thirdDateLabelPast: "Açılalı",
  thirdDateLabelFuture: "Açılmasına"
};

/* ============================================================
   YARDIMCI FONKSİYONLAR
   ============================================================ */

function pad(n, len = 2) {
  return String(Math.max(0, Math.floor(n))).padStart(len, "0");
}

function monthsBetween(start, now) {
  let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) months--;
  return Math.max(months, 0);
}

// 0-1 arası smoothstep — uçlarda türevi sıfır olan yumuşak bir eğri
function smoothstep(t) {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

let topZ = 60;
function bringToFront(el) {
  topZ += 1;
  el.style.zIndex = topZ;
}

/* ============================================================
   1 + 7. KİLİT / GERİ SAYIM (yumuşatılmış parlama)
   ============================================================ */

const unlockDate = new Date(CONFIG.unlockDate);
const glowWindowMs = CONFIG.glowWindowDays * 24 * 60 * 60 * 1000;

const gateButton = document.getElementById("gate-button");
const gateButtonText = document.getElementById("gate-button-text");
const lockIcon = document.getElementById("lock-icon");
const countdownEl = document.getElementById("countdown");
const cdDays = document.getElementById("cd-days");
const cdHours = document.getElementById("cd-hours");
const cdMinutes = document.getElementById("cd-minutes");
const cdSeconds = document.getElementById("cd-seconds");

let isUnlocked = false;

function updateLockState() {
  const now = new Date();
  const remaining = unlockDate - now;

  if (remaining <= 0) {
    if (!isUnlocked) {
      isUnlocked = true;
      gateButton.classList.remove("locked");
      gateButtonText.textContent = "Aç";
      lockIcon.style.display = "none";
      countdownEl.style.display = "none";
    }
    document.documentElement.style.setProperty("--progress", 1);
    return;
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  cdDays.textContent = pad(days, 2);
  cdHours.textContent = pad(hours);
  cdMinutes.textContent = pad(minutes);
  cdSeconds.textContent = pad(seconds);

  // Pencereye girmeden çok önce de belli belirsiz bir parlama olsun,
  // pencere içinde smoothstep ile 0 -> 1'e yumuşakça yükselsin.
  const linear = remaining <= glowWindowMs ? 1 - remaining / glowWindowMs : 0;
  const eased = smoothstep(linear);
  const ambient = 0.04; // pencereye girmeden önceki çok hafif taban parıltı
  const progress = eased > 0 ? ambient + eased * (1 - ambient) : (remaining < glowWindowMs * 2.2 ? ambient * 0.5 : 0);
  document.documentElement.style.setProperty("--progress", progress.toFixed(4));
}

updateLockState();
setInterval(updateLockState, 1000);

/* ============================================================
   1. DÜĞMEYE BASILINCA: CİNEMATİK METİN + MÜZİK BAŞLAT
   ============================================================ */

const gateScreen = document.getElementById("gate-screen");
const cinematic = document.getElementById("cinematic");
const cinematicLineEl = document.getElementById("cinematic-line");
const revealSection = document.getElementById("reveal");

gateButton.addEventListener("click", () => {
  if (!isUnlocked) return;
  gateButton.disabled = true;
  gateScreen.classList.add("faded-out");
  startMusic();

  setTimeout(() => {
    cinematic.classList.remove("hidden");
    requestAnimationFrame(() => cinematic.classList.add("visible"));
    playCinematicLines(0);
  }, 500);
});

function playCinematicLines(index) {
  if (index >= CONFIG.cinematicLines.length) {
    cinematic.classList.remove("visible");
    setTimeout(() => {
      cinematic.classList.add("hidden");
      gateScreen.style.display = "none";
      revealSection.classList.remove("hidden");
      requestAnimationFrame(() => revealSection.classList.add("visible"));
      startElapsedCounter();
      showMusicWidget();
    }, 1000);
    return;
  }

  cinematicLineEl.textContent = CONFIG.cinematicLines[index];
  requestAnimationFrame(() => cinematicLineEl.classList.add("show"));

  setTimeout(() => {
    cinematicLineEl.classList.remove("show");
    setTimeout(() => playCinematicLines(index + 1), 700);
  }, CONFIG.lineHoldMs);
}

/* ============================================================
   ELAPSED COUNTER (geçen süre — slot / odometre efekti)
   Bu bölüm hem ana sayaç hem de not penceresindeki 3. tarih
   sayacı için ortak digit-roller yardımcılarını kullanır.
   ============================================================ */

function makeDigitFace(value, extraClass) {
  const span = document.createElement("span");
  span.className = "digit-face " + extraClass;
  span.textContent = value;
  return span;
}

function updateDigitRoller(container, valueStr) {
  if (!container) return;
  const prev = container.dataset.value || "";

  if (prev.length !== valueStr.length || container.children.length === 0) {
    container.innerHTML = "";
    for (const ch of valueStr) {
      const roller = document.createElement("span");
      roller.className = "digit-roller";
      roller.appendChild(makeDigitFace(ch, "digit-old"));
      container.appendChild(roller);
    }
    container.dataset.value = valueStr;
    return;
  }

  const rollers = container.children;
  for (let i = 0; i < valueStr.length; i++) {
    if (prev[i] === valueStr[i]) continue;
    const roller = rollers[i];
    const oldFace = roller.querySelector(".digit-old");
    const newFace = makeDigitFace(valueStr[i], "digit-new");
    roller.appendChild(newFace);

    requestAnimationFrame(() => {
      if (oldFace) oldFace.classList.add("rolling");
      newFace.classList.add("rolling");
    });

    setTimeout(() => {
      if (oldFace) oldFace.remove();
      newFace.classList.remove("digit-new");
      newFace.classList.remove("rolling");
      newFace.classList.add("digit-old");
    }, 460);
  }
  container.dataset.value = valueStr;
}

const relationshipStart = new Date(CONFIG.relationshipStart);
const elapsedMonthsRow = document.getElementById("elapsed-months");
const elapsedBlocks = {
  weeks: document.querySelector('.elapsed-block[data-unit="weeks"] .digits'),
  days: document.querySelector('.elapsed-block[data-unit="days"] .digits'),
  hours: document.querySelector('.elapsed-block[data-unit="hours"] .digits'),
  minutes: document.querySelector('.elapsed-block[data-unit="minutes"] .digits'),
  seconds: document.querySelector('.elapsed-block[data-unit="seconds"] .digits')
};

function startElapsedCounter() {
  tickElapsed();
  setInterval(tickElapsed, 1000);
}

function tickElapsed() {
  const now = new Date();
  const totalSeconds = Math.floor((now - relationshipStart) / 1000);
  if (totalSeconds < 0) return;

  const months = monthsBetween(relationshipStart, now);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(totalSeconds / 60);
  const weeks = Math.floor(days / 7);

  elapsedMonthsRow.textContent = `Tam ${months} aydır birlikteyiz yani`;

  updateDigitRoller(elapsedBlocks.weeks, String(weeks));
  updateDigitRoller(elapsedBlocks.days, String(days));
  updateDigitRoller(elapsedBlocks.hours, String(hours));
  updateDigitRoller(elapsedBlocks.minutes, String(minutes));
  updateDigitRoller(elapsedBlocks.seconds, String(totalSeconds));
}

/* ============================================================
   MÜZİK OYNATICI + DÜZENLENEBİLİR ÇALMA LİSTESİ
   ============================================================ */

const audio = document.getElementById("audio-player");
const musicWidget = document.getElementById("music-widget");
const musicBubble = document.getElementById("music-bubble");
const musicTrackName = document.getElementById("music-track-name");
const musicToggle = document.getElementById("music-toggle");
const musicPrev = document.getElementById("music-prev");
const musicNext = document.getElementById("music-next");
const musicSeek = document.getElementById("music-seek");

const PLAYLIST_KEY = "sitePlaylistV1";
let playlist = loadPlaylist();
let currentTrack = 0;

function loadPlaylist() {
  try {
    const saved = JSON.parse(localStorage.getItem(PLAYLIST_KEY));
    if (Array.isArray(saved) && saved.length) return saved;
  } catch (e) { /* yok say */ }
  return CONFIG.musicFiles.map((t) => ({ path: t.path, title: t.title }));
}

function savePlaylist() {
  localStorage.setItem(PLAYLIST_KEY, JSON.stringify(playlist));
}

function loadTrack(i, autoplay) {
  if (!playlist.length) return;
  currentTrack = (i + playlist.length) % playlist.length;
  const track = playlist[currentTrack];
  audio.src = track.path;
  musicTrackName.textContent = track.title || `Şarkı ${currentTrack + 1}`;
  if (autoplay) {
    audio.play().catch(() => { /* tarayıcı otomatik oynatmayı engelleyebilir */ });
  }
}

function startMusic() {
  if (!playlist.length) return;
  loadTrack(0, true);
}

audio.addEventListener("play", () => {
  musicWidget.classList.add("playing");
  musicToggle.textContent = "⏸";
});
audio.addEventListener("pause", () => {
  musicWidget.classList.remove("playing");
  musicToggle.textContent = "▶";
});
audio.addEventListener("ended", () => loadTrack(currentTrack + 1, true));
audio.addEventListener("timeupdate", () => {
  if (audio.duration) musicSeek.value = (audio.currentTime / audio.duration) * 100;
});

musicToggle.addEventListener("click", () => {
  if (audio.paused) audio.play().catch(() => {});
  else audio.pause();
});
musicPrev.addEventListener("click", () => loadTrack(currentTrack - 1, true));
musicNext.addEventListener("click", () => loadTrack(currentTrack + 1, true));
musicSeek.addEventListener("input", () => {
  if (audio.duration) audio.currentTime = (musicSeek.value / 100) * audio.duration;
});

function showMusicWidget() {
  musicWidget.classList.remove("hidden");
}

document.getElementById("music-minimize").addEventListener("click", () => {
  musicWidget.classList.add("hidden");
  musicBubble.classList.remove("hidden");
});
musicBubble.addEventListener("click", () => {
  musicBubble.classList.add("hidden");
  musicWidget.classList.remove("hidden");
});

/* --- Parça düzenleme paneli --- */

const musicEditor = document.getElementById("music-editor");
const musicEditorList = document.getElementById("music-editor-list");
const musicEditBtn = document.getElementById("music-edit");
const musicBody = document.querySelector(".music-body");

let editorDraft = [];

function openEditor() {
  editorDraft = playlist.map((t) => ({ ...t }));
  renderEditor();
  musicEditor.classList.remove("hidden");
  musicBody.style.display = "none";
}

function closeEditor() {
  musicEditor.classList.add("hidden");
  musicBody.style.display = "";
}

function renderEditor() {
  musicEditorList.innerHTML = "";
  editorDraft.forEach((track, i) => {
    const row = document.createElement("div");
    row.className = "music-editor-row";

    const titleInput = document.createElement("input");
    titleInput.className = "track-title";
    titleInput.placeholder = "Parça adı";
    titleInput.value = track.title || "";
    titleInput.addEventListener("input", () => { editorDraft[i].title = titleInput.value; });

    const pathInput = document.createElement("input");
    pathInput.className = "track-path";
    pathInput.placeholder = "musics/mus1.mp3";
    pathInput.value = track.path || "";
    pathInput.addEventListener("input", () => { editorDraft[i].path = pathInput.value; });

    const removeBtn = document.createElement("button");
    removeBtn.className = "track-remove";
    removeBtn.type = "button";
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", () => {
      editorDraft.splice(i, 1);
      renderEditor();
    });

    row.append(titleInput, pathInput, removeBtn);
    musicEditorList.appendChild(row);
  });
}

musicEditBtn.addEventListener("click", () => {
  if (musicEditor.classList.contains("hidden")) openEditor();
  else closeEditor();
});

document.getElementById("music-editor-add").addEventListener("click", () => {
  editorDraft.push({ path: "", title: `Şarkı ${editorDraft.length + 1}` });
  renderEditor();
});

document.getElementById("music-editor-cancel").addEventListener("click", closeEditor);

document.getElementById("music-editor-save").addEventListener("click", () => {
  const cleaned = editorDraft.filter((t) => t.path && t.path.trim());
  if (!cleaned.length) { closeEditor(); return; }
  const wasPlaying = !audio.paused;
  const currentPath = playlist[currentTrack] ? playlist[currentTrack].path : null;

  playlist = cleaned;
  savePlaylist();

  const keepIndex = playlist.findIndex((t) => t.path === currentPath);
  loadTrack(keepIndex >= 0 ? keepIndex : 0, wasPlaying);
  closeEditor();
});

/* ============================================================
   GENEL: SÜRÜKLENEBİLİR / BOYUTLANDIRILABİLİR PENCERE YARDIMCILARI
   ============================================================ */

function makeDraggable(windowEl, handleEl) {
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  function start(clientX, clientY) {
    dragging = true;
    bringToFront(windowEl);
    const rect = windowEl.getBoundingClientRect();
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;
    windowEl.style.left = rect.left + "px";
    windowEl.style.top = rect.top + "px";
    windowEl.style.right = "auto";
    windowEl.style.bottom = "auto";
    windowEl.style.transform = "none";
  }

  function move(clientX, clientY) {
    if (!dragging) return;
    const maxX = window.innerWidth - windowEl.offsetWidth;
    const maxY = window.innerHeight - windowEl.offsetHeight;
    const x = Math.min(Math.max(0, clientX - offsetX), Math.max(0, maxX));
    const y = Math.min(Math.max(0, clientY - offsetY), Math.max(0, maxY));
    windowEl.style.left = x + "px";
    windowEl.style.top = y + "px";
  }

  function end() { dragging = false; }

  handleEl.addEventListener("mousedown", (e) => {
    if (e.target.closest(".win-btn")) return;
    start(e.clientX, e.clientY);
    e.preventDefault();
  });
  window.addEventListener("mousemove", (e) => move(e.clientX, e.clientY));
  window.addEventListener("mouseup", end);

  handleEl.addEventListener("touchstart", (e) => {
    if (e.target.closest(".win-btn")) return;
    const t = e.touches[0];
    start(t.clientX, t.clientY);
  }, { passive: true });
  window.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    move(t.clientX, t.clientY);
  }, { passive: true });
  window.addEventListener("touchend", end);

  handleEl.addEventListener("mousedown", () => bringToFront(windowEl));
}

function makeResizable(windowEl, handleEl, minW = 220, minH = 200) {
  let resizing = false;
  let startX, startY, startW, startH;

  function start(clientX, clientY) {
    resizing = true;
    bringToFront(windowEl);
    const rect = windowEl.getBoundingClientRect();
    startX = clientX; startY = clientY;
    startW = rect.width; startH = rect.height;
  }
  function move(clientX, clientY) {
    if (!resizing) return;
    const w = Math.max(minW, startW + (clientX - startX));
    const h = Math.max(minH, startH + (clientY - startY));
    windowEl.style.width = w + "px";
    windowEl.style.height = h + "px";
  }
  function end() { resizing = false; }

  handleEl.addEventListener("mousedown", (e) => { start(e.clientX, e.clientY); e.preventDefault(); e.stopPropagation(); });
  window.addEventListener("mousemove", (e) => move(e.clientX, e.clientY));
  window.addEventListener("mouseup", end);

  handleEl.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    start(t.clientX, t.clientY);
    e.stopPropagation();
  }, { passive: true });
  window.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    move(t.clientX, t.clientY);
  }, { passive: true });
  window.addEventListener("touchend", end);
}

makeDraggable(musicWidget, document.getElementById("music-titlebar"));

/* ============================================================
   5. FOTOĞRAF GALERİSİ: HER FOTOĞRAF KENDİ PENCERESİNDE AÇILIR
   + imleci takip eden ortak hover notu
   ============================================================ */

const photoTemplate = document.getElementById("photo-window-template");
const openPhotoWindows = new Map(); // src -> pencere elementi
let cascadeOffset = 0;

function openPhotoWindow(src, title) {
  // Bu fotoğraf zaten açıksa, tekrar pencere açmak yerine öne getir
  if (openPhotoWindows.has(src)) {
    const existing = openPhotoWindows.get(src);
    existing.classList.remove("hidden");
    bringToFront(existing);
    return;
  }

  const node = photoTemplate.content.firstElementChild.cloneNode(true);
  const img = node.querySelector("img");
  img.src = src;
  img.alt = title || src;
  node.querySelector(".window-title").textContent = title || src.split("/").pop();

  cascadeOffset = (cascadeOffset + 28) % 140;
  node.style.left = `calc(50% - 190px + ${cascadeOffset}px)`;
  node.style.top = `calc(14% + ${cascadeOffset}px)`;

  document.body.appendChild(node);
  bringToFront(node);

  const handle = node.querySelector("[data-drag-handle]");
  const resizeHandle = node.querySelector("[data-resize-handle]");
  makeDraggable(node, handle);
  makeResizable(node, resizeHandle);

  function removeWindow() {
    node.remove();
    openPhotoWindows.delete(src);
  }

  node.querySelector('[data-action="close"]').addEventListener("click", removeWindow);
  node.querySelector('[data-action="minimize"]').addEventListener("click", removeWindow);
  handle.addEventListener("mousedown", () => bringToFront(node));

  openPhotoWindows.set(src, node);
}

const hoverTooltip = document.getElementById("hover-tooltip");

document.querySelectorAll(".gallery-item").forEach((item) => {
  item.addEventListener("mouseenter", () => {
    hoverTooltip.textContent = item.dataset.caption || "";
    hoverTooltip.classList.add("show");
  });
  item.addEventListener("mouseleave", () => hoverTooltip.classList.remove("show"));

  item.addEventListener("mousemove", (e) => {
    const rect = item.getBoundingClientRect();
    const noteWidth = hoverTooltip.offsetWidth || 160;
    const noteHeight = hoverTooltip.offsetHeight || 40;
    let x = e.clientX + 14;
    let y = e.clientY + 14;
    x = Math.min(x, rect.right - noteWidth - 6);
    y = Math.min(y, rect.bottom - noteHeight - 6);
    x = Math.max(x, rect.left + 6);
    y = Math.max(y, rect.top + 6);
    hoverTooltip.style.left = x + "px";
    hoverTooltip.style.top = y + "px";
  });

  item.addEventListener("click", () => {
    openPhotoWindow(item.dataset.img, item.querySelector("img").alt);
  });
});

/* ============================================================
   6/7. AŞAĞI OK -> NOT PENCERESİ (.txt tarzı) + 3. TARİH SAYACI
   ============================================================ */

const scrollHint = document.getElementById("scroll-hint");
const noteWindow = document.getElementById("note-window");
const noteTitlebar = document.getElementById("note-titlebar");
const noteResizeHandle = document.getElementById("note-resize-handle");

makeDraggable(noteWindow, noteTitlebar);
makeResizable(noteWindow, noteResizeHandle);

scrollHint.addEventListener("click", () => {
  const willOpen = noteWindow.classList.contains("hidden");
  noteWindow.classList.toggle("hidden");
  if (willOpen) {
    bringToFront(noteWindow);
    startThirdDateCounter();
  }
});

document.getElementById("note-close").addEventListener("click", () => noteWindow.classList.add("hidden"));
document.getElementById("note-minimize").addEventListener("click", () => noteWindow.classList.add("hidden"));

const thirdDate = new Date(CONFIG.thirdDate);
const noteCounterLabel = document.getElementById("note-counter-label");
const noteBlocks = {
  days: document.querySelector('.elapsed-block[data-unit="n-days"] .digits'),
  hours: document.querySelector('.elapsed-block[data-unit="n-hours"] .digits'),
  minutes: document.querySelector('.elapsed-block[data-unit="n-minutes"] .digits'),
  seconds: document.querySelector('.elapsed-block[data-unit="n-seconds"] .digits')
};

let thirdDateInterval = null;

function startThirdDateCounter() {
  if (thirdDateInterval) return; // zaten çalışıyor
  tickThirdDate();
  thirdDateInterval = setInterval(tickThirdDate, 1000);
}

function tickThirdDate() {
  const now = new Date();
  const isFuture = thirdDate > now;
  noteCounterLabel.textContent = isFuture ? CONFIG.thirdDateLabelFuture : CONFIG.thirdDateLabelPast;

  const diffMs = Math.abs(thirdDate - now);
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  updateDigitRoller(noteBlocks.days, String(days));
  updateDigitRoller(noteBlocks.hours, pad(hours));
  updateDigitRoller(noteBlocks.minutes, pad(minutes));
  updateDigitRoller(noteBlocks.seconds, pad(seconds));
}

const titles = ["i","i love","i love you","i love you baby","💚love you baby","💚💚you baby","💚💚💚baby","💚💚💚💚"];
let i = 0;

setInterval(() => {
  document.title = titles[i];
  i = (i + 1) % titles.length;
}, 1000);
