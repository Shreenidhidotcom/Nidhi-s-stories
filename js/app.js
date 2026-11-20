(function () {
  "use strict";

  const app = document.getElementById("app");
  const layer = document.getElementById("layer");
  const { TIERS, DROP_VALUES: DV, TRAIL, GAMES, GUIDE, AVATAR, PLANTS, CHEST_STICKERS, LEARNING_GAMES, INTRO, AUTHOR, WHY_AYU_OJO, GROWN } = window;

  /* ================= Storage (this device only) ================= */
  function load(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; }
  }
  function store(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage unavailable */ } }
  function loadRaw(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function storeRaw(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* ignore */ } }
  function remove(key) { try { localStorage.removeItem(key); } catch (e) { /* ignore */ } }

  /* ---------- Settings ---------- */
  const settings = Object.assign({ sessionMin: 10, mute: false, calm: false }, load("ns-settings", {}));
  function saveSettings() { store("ns-settings", settings); applySettings(); }
  function applySettings() { document.body.classList.toggle("calm", !!settings.calm); }

  /* ---------- Child profiles ---------- */
  let profiles = load("ns-profiles", []);
  if (!Array.isArray(profiles)) profiles = [];
  let activeId = loadRaw("ns-active");
  if (!profiles.some(p => p.id === activeId)) activeId = profiles.length === 1 ? profiles[0].id : null;

  function active() { return profiles.find(p => p.id === activeId) || null; }
  function saveProfiles() { store("ns-profiles", profiles); }
  function setActive(id) {
    activeId = id;
    if (id) storeRaw("ns-active", id); else remove("ns-active");
    prog = loadProg(id);
    updateTop();
  }
  function tierFor(age) {
    return TIERS.find(t => age >= t.ages[0] && age <= t.ages[1]) || TIERS[0];
  }

  /* ---------- Progress per child ---------- */
  const blankProg = () => ({ drops: 0, earned: 0, stops: {}, days: [], chests: {}, stickers: {}, owned: [], plants: [], played: {}, habits: {}, pending: {} });
  function loadProg(id) {
    if (!id) return blankProg();
    const p = Object.assign(blankProg(), load("ns-p:" + id, {}));
    const stored = load("ns-p:" + id, null);
    /* The garden is now a jar of golden drops: plants bought for it are refunded. */
    if (p.plants.length) {
      p.drops += p.plants.reduce((t, pid) => t + ((PLANTS.find(x => x.id === pid) || {}).price || 0), 0);
      p.owned = p.owned.filter(x => !p.plants.includes(x)); p.plants = [];
    }
    /* `earned` counts every drop ever collected, so spending in the shop never empties the jar. */
    if (stored && typeof stored.earned !== "number") p.earned = p.drops + p.owned.reduce((t, x) => t + priceOf(x), 0);
    if (stored && (stored.plants || []).length || stored && typeof stored.earned !== "number") store("ns-p:" + id, p);
    return p;
  }
  function saveProgFor(id, p) { if (id) store("ns-p:" + id, p); }
  let prog = loadProg(activeId);
  function saveProg() { saveProgFor(activeId, prog); updateTop(); }
  const stopState = (p, n) => (p.stops[n] = p.stops[n] || { listen: false, play: false, done: false });

  /* ---------- Dates ---------- */
  function dayKey(d = new Date()) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function weekKey(d = new Date()) { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return dayKey(x); }
  function daysApart(a, b) { return Math.round((Date.parse(b) - Date.parse(a)) / 864e5); }

  function markActive(p = prog) { const t = dayKey(); if (!p.days.includes(t)) p.days.push(t); }
  function addDrops(n, p = prog) { if (n > 0) { p.drops += n; p.earned = (p.earned || 0) + n; markActive(p); } return n; }

  /* The Ojo Treasury saves the drops of light caught in each story; turn new ones into "Listen" steps. */
  function syncBook() {
    if (!activeId) return 0;
    const caught = load("ojo-drops:" + activeId, []);
    let gained = 0;
    (Array.isArray(caught) ? caught : []).forEach(n => {
      const s = stopState(prog, n);
      if (n >= 1 && n <= TRAIL.length && !s.listen) { s.listen = true; gained += addDrops(DV.listen); }
    });
    if (gained) saveProg();
    return gained;
  }

  /* Bring progress from the earlier version of the app into the first child's profile. */
  function migrateLegacy(id, p) {
    const old = load("nidhis-stories-progress-v1", null);
    if (old && old.stars > 0) { p.drops += old.stars; p.earned = (p.earned || 0) + old.stars; }
    remove("nidhis-stories-progress-v1");
    const oldDrops = load("ojo-drops", null);
    if (Array.isArray(oldDrops) && oldDrops.length) store("ojo-drops:" + id, oldDrops);
    remove("ojo-drops");
  }

  /* ================= Helpers ================= */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  const isSmall = () => (active() ? active().age : 5) <= 4;

  let toastTimer;
  function toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  /* Small golden drops fall when something is finished. */
  function goldenDrops() {
    if (settings.calm) return;
    const box = document.createElement("div");
    box.className = "drop-rain"; box.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 22; i++) {
      const s = document.createElement("span");
      s.innerHTML = '<svg viewBox="0 0 24 30"><use href="#drop"/></svg>';
      s.style.left = rand(2, 95) + "vw";
      s.style.animationDelay = (Math.random() * 0.7).toFixed(2) + "s";
      s.style.width = rand(14, 26) + "px";
      box.appendChild(s);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 2900);
  }

  /* ================= Sounds =================
     A soft tap for every button, a bright chime for a right answer, a gentle low tone for "try again",
     and a sparkle when drops are earned. Made by the browser (no audio files); a grown-up can turn them off. */
  const sfx = (() => {
    let ctx = null, pendingTap = 0;
    const on = () => settings.sfx !== false;
    function ac() {
      if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; try { ctx = new C(); } catch (e) { return null; } }
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      return ctx;
    }
    function tone(freq, start, dur, { type = "sine", vol = 0.15, to = 0 } = {}) {
      const c = ac(); if (!c) return;
      const t = c.currentTime + start, o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.03);
    }
    const play = {
      tap: () => tone(520, 0, 0.09, { vol: 0.12, to: 760 }),
      right: () => { tone(784, 0, 0.16, { type: "triangle", vol: 0.17 }); tone(1047, 0.1, 0.24, { type: "triangle", vol: 0.17 }); tone(1319, 0.2, 0.36, { type: "triangle", vol: 0.13 }); },
      wrong: () => { tone(330, 0, 0.17, { vol: 0.15, to: 300 }); tone(247, 0.17, 0.3, { vol: 0.15, to: 220 }); },
      drops: () => [1568, 2093, 2637, 3136].forEach((f, i) => tone(f, i * 0.07, 0.24, { type: "triangle", vol: 0.07 }))
    };
    function fire(kind) { if (!on()) return; clearTimeout(pendingTap); pendingTap = 0; try { play[kind](); } catch (e) { /* no sound */ } }
    /* Every tap makes a sound; a right or wrong answer in the same tap replaces it. */
    document.addEventListener("click", e => {
      if (!on() || !e.target.closest("button, a, label.toggle, summary, [role=button]")) return;
      ac(); clearTimeout(pendingTap);
      pendingTap = setTimeout(() => { pendingTap = 0; try { play.tap(); } catch (er) { /* no sound */ } }, 0);
    }, true);
    return { right: () => fire("right"), wrong: () => fire("wrong"), drops: () => fire("drops") };
  })();

  /* ================= Voice =================
     For every line the app plays, in this order: a recording of that exact line (VOICE_FILES),
     a line from the story narration of The Ojo Treasury (STORY_AUDIO), then the device's own voice. */
  const STORY_AUDIO = window.STORY_AUDIO || {}, CELEBRATE_VOICE = window.CELEBRATE_VOICE || [], VOICE_FILES = window.VOICE_FILES || {};
  const canSpeak = "speechSynthesis" in window;
  const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}️‍]/gu;
  let ttsVoice = null;
  function chooseVoice() {
    if (!canSpeak) return;
    const voices = speechSynthesis.getVoices();
    ttsVoice = voices.find(v => /en[-_]IN/i.test(v.lang)) || voices.find(v => /en[-_](GB|US)/i.test(v.lang) && /female|samantha|google/i.test(v.name))
      || voices.find(v => /^en/i.test(v.lang)) || null;
  }
  if (canSpeak) { chooseVoice(); speechSynthesis.onvoiceschanged = chooseVoice; }

  const player = new Audio();
  player.preload = "auto";
  let vToken = 0, vTimer = null;
  function stopSpeaking() {
    vToken++; clearTimeout(vTimer);
    player.ontimeupdate = player.onended = player.onerror = null;
    try { player.pause(); } catch (e) { /* ignore */ }
    if (canSpeak) speechSynthesis.cancel();
  }
  /* Phones only allow sound after a tap: unlock the player on the first touch. */
  document.addEventListener("pointerdown", () => {
    if (player.dataset.src) return;
    player.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=";
    player.play().then(() => { if (!player.dataset.src) player.pause(); }).catch(() => { /* ignore */ });
  }, { once: true, capture: true });

  function clipOf(c) {
    const a = c && STORY_AUDIO[c.n];
    if (!a || a.t[c.u] == null) return null;
    const end = a.t[(c.v == null ? c.u : c.v) + 1];
    return { src: a.src, from: a.t[c.u], to: end == null ? Infinity : end };
  }
  function ttsSay(text, done) {
    if (!canSpeak || !text) { done(); return; }
    let over = false;
    const end = () => { if (!over) { over = true; clearTimeout(guard); done(); } };
    const u = new SpeechSynthesisUtterance(String(text).replace(EMOJI, ""));
    if (ttsVoice) u.voice = ttsVoice;
    u.rate = 0.9; u.pitch = 1.1; u.onend = end; u.onerror = end;
    const guard = setTimeout(end, 1500 + String(text).length * 90);
    speechSynthesis.speak(u);
  }
  function playOne(item, done) {
    const tok = vToken;
    let over = false;
    const quiet = () => { clearTimeout(vTimer); player.ontimeupdate = player.onended = player.onerror = null; };
    const end = () => { if (over) return; over = true; quiet(); if (tok === vToken) done(); };
    const fallback = () => { if (over) return; quiet(); if (tok === vToken && item.text) ttsSay(item.text, end); else end(); };
    const file = item.id && VOICE_FILES[item.id];
    const c = file ? { src: file, from: 0, to: Infinity } : item.clip ? clipOf(item.clip) : null;
    if (!c) { ttsSay(item.text, end); return; }
    const stopAtEnd = () => { if (tok !== vToken) return; player.pause(); end(); };
    const start = () => {
      if (tok !== vToken) return;
      player.ontimeupdate = () => { if (tok === vToken && player.currentTime >= c.to - 0.03) stopAtEnd(); };
      player.onended = () => { if (tok === vToken) end(); };
      player.play().then(() => {
        if (tok === vToken && isFinite(c.to)) { clearTimeout(vTimer); vTimer = setTimeout(stopAtEnd, Math.max(0, (c.to - player.currentTime) * 1000 - 40)); }
      }).catch(fallback);
    };
    const seek = () => {
      if (tok !== vToken) return;
      if (Math.abs(player.currentTime - c.from) > 0.05) { player.addEventListener("seeked", start, { once: true }); player.currentTime = c.from; }
      else start();
    };
    player.onerror = () => { if (tok === vToken) fallback(); };
    if (player.dataset.src !== c.src) {
      player.dataset.src = c.src; player.src = c.src;
      player.addEventListener("loadedmetadata", seek, { once: true });
      player.load();
    } else if (player.readyState >= 1) seek();
    else player.addEventListener("loadedmetadata", seek, { once: true });
  }
  /* Play lines one after another. Each line: { text, id?, clip? }. Resolves when the last line ends. */
  function voice(...items) {
    stopSpeaking();
    return new Promise(resolve => {
      if (settings.mute) { resolve(); return; }
      const list = items.flat().filter(x => x && (x.text || x.clip));
      const tok = vToken;
      let i = 0;
      const next = () => { if (tok === vToken && i < list.length) playOne(list[i++], next); else resolve(); };
      next();
    });
  }
  function speak(text) { voice({ text }); }
  /* Recorded lines and story lines always play by themselves. Lines that only the device's voice can say
     play by themselves under age 6; from 6, the child taps Ojo to hear them. */
  const autoTalk = () => !settings.mute && (active() ? active().age : 5) < 6;
  const recorded = x => !!(x && x.id && VOICE_FILES[x.id]);
  function say(...items) {
    const list = items.flat().filter(x => x && (x.clip || recorded(x) || autoTalk()));
    return list.length && !settings.mute ? voice(list) : Promise.resolve();
  }
  const storyLine = (stop, key) => { const c = stop && stop.voice && stop.voice[key]; return c ? { text: c.text || stop.title, clip: { n: stop.n, u: c.u, v: c.v } } : null; };
  const cheerLine = () => { const c = pick(CELEBRATE_VOICE); return c ? { text: c.text, clip: { n: c.n, u: c.u } } : null; };

  /* ---------- Ojo's lines ---------- */
  function line(moment) {
    const arr = GUIDE[moment] || [""], i = Math.floor(Math.random() * arr.length);
    const name = active() ? active().name : "";
    const text = name ? arr[i].replace(/\{name\}/g, name) : arr[i].replace(/,\s*\{name\}/g, "").replace(/\s*\{name\}/g, "");
    return { text, id: `ojo.${moment}.${i + 1}` };
  }
  function ojoSvg(cls = "") { return `<svg class="ojo-svg ${cls}" viewBox="0 0 100 115" aria-hidden="true"><use href="#ojo"/></svg>`; }
  function dropSvg(cls = "") { return `<svg class="drop-svg ${cls}" viewBox="0 0 24 30" aria-hidden="true"><use href="#drop"/></svg>`; }
  function guideHtml(ln) {
    return `<div class="guide" id="guide">
        <button class="guide-ojo" type="button" aria-label="Hear Ojo say it again">${ojoSvg()}</button>
        <div class="guide-bubble"><span class="guide-text">${esc(ln ? ln.text : "")}</span>${!settings.mute ? `<span class="guide-hear" aria-hidden="true">🔊</span>` : ""}</div>
      </div>`;
  }
  function bindGuide(root, ln, opts = {}) {
    const g = root.querySelector("#guide");
    if (!g) return;
    g._ln = ln;
    g.addEventListener("click", () => { if (g._ln) voice(g._ln); g.classList.remove("hop"); void g.offsetWidth; g.classList.add("hop"); });
    if (ln && !opts.silent) say(ln);
  }
  function quietGuide(root, ln) {
    const g = root.querySelector("#guide");
    if (g && ln) { g.querySelector(".guide-text").textContent = ln.text; g._ln = ln; }
  }
  function setGuide(root, ln) {
    const g = root.querySelector("#guide");
    if (!g || !ln) return;
    g.querySelector(".guide-text").textContent = ln.text;
    g._ln = ln;
    say(ln);
  }
  function echoHtml(ln) {
    return ln ? `<p class="story-echo"><button class="icon-btn echo-play" type="button" aria-label="Hear it from the story">🔊</button><span>“${esc(ln.text)}”</span></p>` : "";
  }
  function bindEcho(root, ln) { const b = root.querySelector(".echo-play"); if (b && ln) b.addEventListener("click", () => voice(ln)); }

  /* ================= Avatar (layered SVG) ================= */
  let clipN = 0;
  function avatarSvg(av, cls = "avatar") {
    av = Object.assign({ skin: 2, hair: "curly", hairColor: 0, eyes: "round", outfit: "sun", acc: "none" }, av || {});
    const skin = AVATAR.skin[av.skin] || AVATAR.skin[2];
    const hc = AVATAR.hairColor[av.hairColor] || AVATAR.hairColor[0];
    const body = "M18 140 C18 112 36 100 60 100 C84 100 102 112 102 140Z";
    return `<svg class="${cls}" viewBox="0 0 120 140" aria-hidden="true">
      ${hairBack(av.hair, hc)}
      ${outfitSvg(av.outfit, body)}
      <rect x="52" y="84" width="16" height="20" rx="7" fill="${skin}"/>
      <circle cx="31" cy="62" r="6" fill="${skin}"/><circle cx="89" cy="62" r="6" fill="${skin}"/>
      <circle cx="60" cy="58" r="30" fill="${skin}"/>
      ${eyesSvg(av.eyes)}
      <circle cx="43" cy="71" r="4.5" fill="#f27a7a" opacity=".35"/><circle cx="77" cy="71" r="4.5" fill="#f27a7a" opacity=".35"/>
      <path d="M52 74 Q60 81 68 74" fill="none" stroke="#3a2230" stroke-width="2.6" stroke-linecap="round"/>
      ${hairFront(av.hair, hc)}
      ${accSvg(av.acc)}
    </svg>`;
  }
  const CAP = "M29 60 C27 34 43 24 60 24 C77 24 93 34 91 60 C86 47 75 40 60 40 C45 40 34 47 29 60Z";
  function hairBack(style, c) {
    switch (style) {
      case "long": return `<path d="M27 58 C25 30 95 30 93 58 L96 106 Q60 116 24 106Z" fill="${c}"/>`;
      case "bob": return `<path d="M25 60 C25 28 95 28 95 60 L95 86 Q89 92 84 84 L84 62 L36 62 L36 84 Q31 92 25 86Z" fill="${c}"/>`;
      case "braid": return `<path d="M27 58 C25 34 95 34 93 58 L92 70 L28 70Z" fill="${c}"/>`;
      default: return "";
    }
  }
  function hairFront(style, c) {
    switch (style) {
      case "curly": return [33, 43, 53, 63, 73, 83].map((x, i) => `<circle cx="${x + 2}" cy="${i % 2 ? 32 : 37}" r="10" fill="${c}"/>`).join("") + `<path d="${CAP}" fill="${c}"/>`;
      case "bun": return `<circle cx="60" cy="21" r="12" fill="${c}"/><path d="${CAP}" fill="${c}"/>`;
      case "puffs": return `<circle cx="29" cy="36" r="13" fill="${c}"/><circle cx="91" cy="36" r="13" fill="${c}"/><path d="${CAP}" fill="${c}"/>`;
      case "braid": return `<path d="${CAP}" fill="${c}"/><circle cx="89" cy="78" r="7" fill="${c}"/><circle cx="91" cy="91" r="6.5" fill="${c}"/><circle cx="92" cy="103" r="6" fill="${c}"/><circle cx="92" cy="112" r="3.5" fill="#e74c3c"/>`;
      case "spiky": return `<path d="M29 58 L31 36 L39 42 L43 27 L51 37 L60 22 L69 37 L77 27 L81 42 L89 36 L91 58 C85 46 75 40 60 40 C45 40 35 46 29 58Z" fill="${c}"/>`;
      default: return `<path d="${CAP}" fill="${c}"/>`;
    }
  }
  function eyesSvg(style) {
    const ink = "#2a1830";
    switch (style) {
      case "happy": return `<path d="M44 61 Q49 55 54 61 M66 61 Q71 55 76 61" fill="none" stroke="${ink}" stroke-width="2.8" stroke-linecap="round"/>`;
      case "sparkle": return `<ellipse cx="49" cy="60" rx="5.4" ry="6.6" fill="${ink}"/><ellipse cx="71" cy="60" rx="5.4" ry="6.6" fill="${ink}"/><circle cx="51" cy="57.5" r="2.2" fill="#fff"/><circle cx="73" cy="57.5" r="2.2" fill="#fff"/><circle cx="47.5" cy="62.5" r="1.1" fill="#fff"/><circle cx="69.5" cy="62.5" r="1.1" fill="#fff"/>`;
      case "almond": return `<ellipse cx="49" cy="60" rx="5.6" ry="3.4" fill="${ink}"/><ellipse cx="71" cy="60" rx="5.6" ry="3.4" fill="${ink}"/><circle cx="50.5" cy="59" r="1.2" fill="#fff"/><circle cx="72.5" cy="59" r="1.2" fill="#fff"/>`;
      default: return `<ellipse cx="49" cy="60" rx="4" ry="5" fill="${ink}"/><ellipse cx="71" cy="60" rx="4" ry="5" fill="${ink}"/><circle cx="50.3" cy="58.3" r="1.4" fill="#fff"/><circle cx="72.3" cy="58.3" r="1.4" fill="#fff"/>`;
    }
  }
  function outfitSvg(id, body) {
    const clip = "av-cl" + (++clipN);
    const clipped = inner => `<defs><clipPath id="${clip}"><path d="${body}"/></clipPath></defs><g clip-path="url(#${clip})"><path d="${body}" fill="#fff"/>${inner}</g>`;
    switch (id) {
      case "sky": return `<path d="${body}" fill="#5ab0f0"/><path d="M50 101 Q60 110 70 101" fill="none" stroke="#2f7fc0" stroke-width="3"/>`;
      case "kurta": return `<path d="${body}" fill="#4caf72"/><path d="M60 101 L60 124" stroke="#2f7d4d" stroke-width="2.4"/><circle cx="60" cy="110" r="1.8" fill="#fff"/><circle cx="60" cy="118" r="1.8" fill="#fff"/>`;
      case "frock": return `<path d="M12 140 C22 114 40 100 60 100 C80 100 98 114 108 140Z" fill="#f07fa8"/><path d="M48 101 Q60 112 72 101" fill="#fff" opacity=".9"/>`;
      case "stripes": return clipped([104, 114, 124, 134].map(y => `<rect x="0" y="${y}" width="120" height="5" fill="#6c63ff"/>`).join(""));
      case "stars": return `<path d="${body}" fill="#34307a"/>` + [[40, 118], [60, 126], [80, 116], [50, 134], [74, 134]].map(([x, y]) => `<text x="${x}" y="${y}" font-size="9" text-anchor="middle" fill="#ffd54f">★</text>`).join("");
      case "festive": return `<path d="${body}" fill="#c0392b"/><path d="M47 101 Q60 114 73 101" fill="none" stroke="#f4c542" stroke-width="4"/><path d="M60 110 L60 140" stroke="#f4c542" stroke-width="3" stroke-dasharray="3 4"/>`;
      case "rainbow": return clipped(["#e74c3c", "#f39c12", "#f1c40f", "#2ecc71", "#3498db", "#8e44ad"].map((c, i) => `<rect x="0" y="${100 + i * 7}" width="120" height="7" fill="${c}"/>`).join(""));
      default: return `<path d="${body}" fill="#f6c344"/><path d="M50 101 Q60 110 70 101" fill="none" stroke="#d99a1c" stroke-width="3"/>`;
    }
  }
  function accSvg(id) {
    switch (id) {
      case "glasses": return `<g fill="rgba(255,255,255,.25)" stroke="#3a3046" stroke-width="2.4"><circle cx="49" cy="60" r="8"/><circle cx="71" cy="60" r="8"/><path d="M57 60 L63 60"/></g>`;
      case "flower": return `<g transform="translate(84 36)">${[0, 72, 144, 216, 288].map(a => `<circle cx="${(6 * Math.cos(a * Math.PI / 180)).toFixed(1)}" cy="${(6 * Math.sin(a * Math.PI / 180)).toFixed(1)}" r="4.6" fill="#ff8fb1"/>`).join("")}<circle r="3.4" fill="#ffd54f"/></g>`;
      case "bow": return `<g transform="translate(60 25)"><path d="M0 0 L-14 -8 L-14 8Z M0 0 L14 -8 L14 8Z" fill="#e74c3c"/><circle r="3.6" fill="#c0392b"/></g>`;
      case "cap": return `<path d="M27 47 C28 18 92 18 93 47Z" fill="#2d9cdb"/><path d="M60 45 L108 47 Q104 54 60 51Z" fill="#1f78b4"/><circle cx="60" cy="22" r="3" fill="#1f78b4"/>`;
      case "leaves": return [[-58, 34, 40], [-30, 42, 28], [0, 60, 24], [30, 78, 28], [58, 86, 40]].map(([r, x, y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="9" transform="rotate(${r} ${x} ${y})" fill="#43a047"/>`).join("");
      default: return "";
    }
  }

  /* ================= Overlays: modal, parent gate, celebration, session end ================= */
  let onModalClose = null;
  function modal(html, opts = {}) {
    stopSpeaking();
    layer.innerHTML = `<div class="scrim ${opts.full ? "full" : ""}">${html}</div>`;
    onModalClose = opts.onClose || null;
    const scrim = layer.firstElementChild;
    if (!opts.locked) scrim.addEventListener("click", e => { if (e.target === scrim) closeModal(); });
    scrim.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", closeModal));
    const first = scrim.querySelector("input, .autofocus, button, a");
    if (first) setTimeout(() => first.focus(), 30);
    return scrim;
  }
  function closeModal() {
    if (!layer.firstElementChild) return;
    layer.innerHTML = "";
    const cb = onModalClose; onModalClose = null;
    if (cb) cb();
  }
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && layer.firstElementChild && !layer.querySelector(".locked")) closeModal();
  });

  let gateOpenUntil = 0;
  const gateIsOpen = () => Date.now() < gateOpenUntil;
  function parentGate(onPass, onCancel) {
    if (gateIsOpen()) { onPass(); return; }
    const a = rand(11, 19), b = rand(4, 9);
    let passed = false;
    const scrim = modal(`
      <div class="sheet gate" role="dialog" aria-modal="true" aria-labelledby="gate-h">
        <div class="gate-kid">🙋 Please ask a grown-up</div>
        <h2 id="gate-h">For grown-ups</h2>
        <p>What is <b>${a} + ${b}</b>?</p>
        <input id="gate-in" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="3" autocomplete="off" aria-label="Your answer" />
        <div class="gate-msg" id="gate-msg" aria-live="polite"></div>
        <div class="row">
          <button class="btn btn-ghost" data-close type="button">Cancel</button>
          <button class="btn" id="gate-ok" type="button">Continue</button>
        </div>
      </div>`, { onClose: () => { if (!passed && onCancel) onCancel(); } });
    const input = scrim.querySelector("#gate-in");
    const check = () => {
      if (parseInt(input.value, 10) === a + b) {
        passed = true; gateOpenUntil = Date.now() + 5 * 60 * 1000;
        closeModal(); onPass();
      } else {
        scrim.querySelector("#gate-msg").textContent = "That's not quite right. Please try again.";
        input.value = ""; input.focus();
      }
    };
    scrim.querySelector("#gate-ok").addEventListener("click", check);
    input.addEventListener("keydown", e => { if (e.key === "Enter") check(); });
  }

  function bumpDrops() {
    const el = document.getElementById("drops-pill");
    el.classList.remove("bounce"); void el.offsetWidth; el.classList.add("bounce");
  }
  function celebrate(n, ln, then, extraHtml = "") {
    const msg = ln || line("gameDone");
    goldenDrops();
    const scrim = modal(`
      <div class="celebrate" role="dialog" aria-modal="true" aria-label="Well done">
        <div class="cel-ojo">${ojoSvg("dance")}</div>
        <p class="cel-text">${esc(msg.text)}</p>
        ${extraHtml}
        ${n > 0 ? `<div class="cel-drops">${dropSvg()}<b>+${n}</b><span>golden drop${n > 1 ? "s" : ""}</span></div>` : ""}
        <button class="btn btn-big autofocus" data-close type="button">Yay!</button>
      </div>`, { onClose: then });
    const spoken = msg.clip || recorded(msg) ? say(msg.lead, msg) : say(cheerLine(), msg);
    if (n > 0) sfx.drops();
    bumpDrops();
    /* Close by itself once the voice has finished (at least ~3 seconds); a tap keeps it open. */
    let held = false;
    scrim.addEventListener("click", () => { held = true; }, { once: true });
    const wait = ms => new Promise(r => setTimeout(r, ms));
    Promise.race([Promise.all([wait(settings.calm ? 2200 : 3200), spoken.then(() => wait(700))]), wait(15000)])
      .then(() => { if (!held && layer.contains(scrim)) closeModal(); });
  }

  /* Gentle session limit: after the set minutes, Ojo sends the child off to try the habit for real. */
  const sess = Object.assign({ secs: 0, over: false }, (() => { try { return JSON.parse(sessionStorage.getItem("ns-session")) || {}; } catch (e) { return {}; } })());
  const saveSess = () => { try { sessionStorage.setItem("ns-session", JSON.stringify(sess)); } catch (e) { /* ignore */ } };
  const ADULT_VIEWS = ["parents", "setup", "welcome", "grown"];
  setInterval(() => {
    if (document.hidden || !active() || sess.over || ADULT_VIEWS.includes(currentView) || layer.querySelector(".gate")) return;
    sess.secs++;
    if (sess.secs % 15 === 0) saveSess();
    if (sess.secs >= settings.sessionMin * 60) endSession();
  }, 1000);
  function endSession() {
    sess.over = true; saveSess();
    const todo = TRAIL.find(s => prog.pending[s.n]) || TRAIL.find(s => !stopState(prog, s.n).done) || pick(TRAIL);
    const msg = line("sessionEnd");
    const scrim = modal(`
      <div class="sheet session-end locked" role="dialog" aria-modal="true" aria-labelledby="se-h">
        ${ojoSvg("big")}
        <h2 id="se-h">Time to try it with Ojo!</h2>
        <p>${esc(msg.text)}</p>
        <div class="task-mini"><span>${todo.sticker.e}</span><p>${esc(todo.task)}</p></div>
        <button class="btn btn-ghost" id="se-more" type="button">Grown-up: play a little more 🔒</button>
      </div>`, { full: true, locked: true });
    say(msg);
    scrim.querySelector("#se-more").addEventListener("click", () => parentGate(() => {
      sess.secs = 0; sess.over = false; saveSess(); closeModal();
    }, () => { if (sess.over) endSession(); }));
  }

  /* ================= Top bar & router ================= */
  function updateTop() {
    document.getElementById("drop-count").textContent = prog.drops;
    const me = document.getElementById("me-chip");
    const p = active();
    me.innerHTML = p ? avatarSvg(p.avatar, "avatar mini") : `<span class="me-empty">🙂</span>`;
    me.setAttribute("aria-label", p ? `${p.name} is playing. Change who is playing` : "Who is playing?");
  }
  document.getElementById("lock-btn").addEventListener("click", () => parentGate(() => { location.hash = "#/parents"; }));

  const routes = {
    "": viewTrail, welcome: viewWelcome, setup: viewSetup, avatar: viewAvatar, meet: viewMeet, who: viewWho,
    play: viewPlay, do: viewDo, games: viewGames, drops: viewDrops, garden: viewDrops, me: viewMe, parents: viewParents,
    abc: viewAbc, numbers: viewNumbers, shapes: viewShapes,
    intro: viewIntro, stories: viewStories, grown: viewGrown, author: viewAuthor, menu: viewMenu
  };
  const TAB_OF = { "": "trail", play: "games", do: "trail", games: "games", abc: "games", numbers: "games", shapes: "games",
    intro: "intro", stories: "stories", menu: "menu", drops: "menu", garden: "menu", me: "menu", avatar: "menu", grown: "menu", author: "menu" };
  let currentView = "";
  let viewId = 0, cleanups = [];
  function later(fn, ms) { const id = viewId; setTimeout(() => { if (id === viewId) fn(); }, ms); }
  function onCleanup(fn) { cleanups.push(fn); }

  function router() {
    stopSpeaking();
    viewId++; cleanups.forEach(f => f()); cleanups = [];
    if (layer.firstElementChild && !layer.querySelector(".locked")) { onModalClose = null; layer.innerHTML = ""; }
    const parts = location.hash.replace(/^#\/?/, "").split("/");
    let name = routes[parts[0]] ? parts[0] : "";
    if (!profiles.length && name !== "setup") name = "welcome";
    else if (profiles.length && !active() && !["who", "setup", "parents"].includes(name)) name = "who";
    currentView = name;
    document.body.dataset.view = name || "trail";
    document.querySelectorAll("[data-nav]").forEach(a => a.classList.toggle("active", a.dataset.nav === TAB_OF[name]));
    routes[name](parts.slice(1));
    app.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    if (sess.over && active() && !ADULT_VIEWS.includes(name) && !layer.querySelector(".locked, .gate")) endSession();
  }
  window.addEventListener("hashchange", router);
  /* Remember where the child was, so the book's back button returns there. */
  document.addEventListener("click", e => {
    if (e.target.closest('a[href^="ojo-treasury/"]')) { try { sessionStorage.setItem("ns-back", location.hash || "#/"); } catch (er) { /* ignore */ } }
  }, true);
  const go = h => { if (location.hash === h) router(); else location.hash = h; };

  /* ================= Onboarding ================= */
  function viewWelcome() {
    app.innerHTML = `
      <section class="welcome">
        ${ojoSvg("big float")}
        <h1>Hello! I am Ojo.</h1>
        <p>I am the little light inside you. Let's find eight drops of light together!</p>
        <p class="welcome-ask">🙋 Ask a grown-up to set up the app for you.</p>
        <button class="btn btn-big" id="start" type="button">Grown-up: set up 🔒</button>
      </section>`;
    say(line("welcome"));
    document.getElementById("start").addEventListener("click", () => parentGate(() => go("#/setup")));
  }

  function viewSetup([editId]) {
    if (!gateIsOpen()) { parentGate(() => viewSetup([editId]), () => go(profiles.length ? "#/parents" : "#/welcome")); app.innerHTML = ""; return; }
    const editing = profiles.find(p => p.id === editId);
    if (!editing && profiles.length >= 3) { toast("Up to three children can share one device."); go("#/parents"); return; }
    const f = { name: editing ? editing.name : "", age: editing ? editing.age : 5, gender: editing ? editing.gender : "none" };
    app.innerHTML = `
      <section class="panel setup">
        <h1 class="page-title">${editing ? "Edit profile" : "Set up your child"}</h1>
        <p class="subtitle">These details stay on this device only. We never ask for a full name, photo, school or birthday.</p>
        <label class="field"><span>Child's first name or nickname</span>
          <input id="f-name" type="text" maxlength="12" autocomplete="off" value="${esc(f.name)}" placeholder="e.g. Riya" /></label>
        <div class="field"><span>Age</span>
          <div class="stepper"><button class="step-btn" id="age-down" type="button" aria-label="Younger">−</button>
          <output id="f-age" aria-live="polite">${f.age}</output>
          <button class="step-btn" id="age-up" type="button" aria-label="Older">+</button></div>
          <p class="hint" id="tier-note"></p></div>
        <div class="field"><span>Gender (optional)</span>
          <div class="chips" role="radiogroup">
            ${[["girl", "Girl"], ["boy", "Boy"], ["none", "Prefer not to say"]].map(([v, l]) => `<button class="chip-btn ${f.gender === v ? "on" : ""}" data-g="${v}" role="radio" aria-checked="${f.gender === v}" type="button">${l}</button>`).join("")}
          </div>
          <p class="hint">Only sets the starting look of your child's character. Every look stays open to every child.</p></div>
        <p class="form-msg" id="f-msg" aria-live="polite"></p>
        <div class="row">
          <a class="btn btn-ghost" href="${profiles.length ? "#/parents" : "#/welcome"}">Cancel</a>
          <button class="btn" id="f-save" type="button">${editing ? "Save" : "Next: choose a look"}</button>
        </div>
      </section>`;
    const ageOut = document.getElementById("f-age");
    const note = () => {
      const t = tierFor(f.age);
      document.getElementById("tier-note").textContent = t.active ? `${t.companion} will guide your child (ages ${t.ages[0]}–${t.ages[1]}).`
        : `Stories for ages ${t.ages[0]}–${t.ages[1]} with ${t.companion} are coming soon. Your child will start with Ojo's stories.`;
    };
    note();
    const setAge = d => { f.age = Math.min(16, Math.max(3, f.age + d)); ageOut.textContent = f.age; note(); };
    document.getElementById("age-down").addEventListener("click", () => setAge(-1));
    document.getElementById("age-up").addEventListener("click", () => setAge(1));
    app.querySelectorAll(".chip-btn").forEach(b => b.addEventListener("click", () => {
      f.gender = b.dataset.g;
      app.querySelectorAll(".chip-btn").forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-checked", String(x === b)); });
    }));
    document.getElementById("f-save").addEventListener("click", () => {
      const name = document.getElementById("f-name").value.replace(/\s+/g, " ").trim().slice(0, 12);
      if (!name) { document.getElementById("f-msg").textContent = "Please enter a first name or nickname."; return; }
      if (editing) {
        Object.assign(editing, { name, age: f.age, gender: f.gender });
        saveProfiles(); updateTop(); toast("Profile saved"); go("#/parents"); return;
      }
      const id = "c" + Date.now().toString(36) + rand(100, 999);
      const look = AVATAR.startLook[f.gender] || AVATAR.startLook.none;
      const profile = { id, name, age: f.age, gender: f.gender, avatar: { skin: 2, hair: look.hair, hairColor: 0, eyes: "round", outfit: look.outfit, acc: "none" } };
      const p = blankProg();
      if (!profiles.length) migrateLegacy(id, p);
      profiles.push(profile); saveProfiles(); saveProgFor(id, p);
      setActive(id);
      try { sessionStorage.setItem("ns-onboard", "1"); } catch (e) { /* ignore */ }
      go("#/avatar");
    });
  }

  function viewAvatar() {
    const p = active(); if (!p) { go("#/who"); return; }
    const onboarding = (() => { try { return sessionStorage.getItem("ns-onboard") === "1"; } catch (e) { return false; } })();
    const av = p.avatar;
    const owned = id => !priceOf(id) || prog.owned.includes(id);
    function render() {
      app.innerHTML = `
        <section class="avatar-maker">
          <h1 class="page-title">Choose your look</h1>
          <div class="av-stage">${avatarSvg(av, "avatar big")}${ojoSvg("buddy float")}</div>
          ${section("Skin", AVATAR.skin.map((c, i) => `<button class="sw ${av.skin === i ? "on" : ""}" data-k="skin" data-v="${i}" style="--c:${c}" aria-label="Skin tone ${i + 1}" type="button"></button>`).join(""))}
          ${section("Hair", AVATAR.hair.map(h => `<button class="pick ${av.hair === h.id ? "on" : ""}" data-k="hair" data-v="${h.id}" type="button">${avatarSvg(Object.assign({}, av, { hair: h.id }), "avatar tiny")}<span>${h.name}</span></button>`).join(""))}
          ${section("Hair colour", AVATAR.hairColor.map((c, i) => `<button class="sw ${av.hairColor === i ? "on" : ""}" data-k="hairColor" data-v="${i}" style="--c:${c}" aria-label="Hair colour ${i + 1}" type="button"></button>`).join(""))}
          ${section("Eyes", AVATAR.eyes.map(e => `<button class="pick ${av.eyes === e.id ? "on" : ""}" data-k="eyes" data-v="${e.id}" type="button">${avatarSvg(Object.assign({}, av, { eyes: e.id }), "avatar tiny face")}<span>${e.name}</span></button>`).join(""))}
          ${section("Clothes", AVATAR.outfit.map(o => itemBtn("outfit", o, owned(o.id))).join(""))}
          ${section("Extras", AVATAR.acc.map(o => itemBtn("acc", o, owned(o.id))).join(""))}
          <div class="row sticky-row"><button class="btn btn-big" id="av-done" type="button">${onboarding ? "Meet Ojo →" : "Done"}</button></div>
        </section>`;
      app.querySelectorAll("[data-k]").forEach(b => b.addEventListener("click", () => {
        const k = b.dataset.k, v = b.dataset.v;
        if (b.classList.contains("locked")) { toast(`Collect drops to get this in the shop on your Me page.`); return; }
        av[k] = (k === "skin" || k === "hairColor") ? +v : v;
        saveProfiles(); updateTop(); render();
      }));
      document.getElementById("av-done").addEventListener("click", () => {
        if (onboarding) { try { sessionStorage.removeItem("ns-onboard"); } catch (e) { /* ignore */ } go("#/meet"); } else go("#/me");
      });
    }
    function section(title, inner) { return `<h2 class="section-title">${title}</h2><div class="pick-row">${inner}</div>`; }
    function itemBtn(k, o, isOwned) {
      const preview = avatarSvg(Object.assign({}, av, { [k]: o.id }), "avatar tiny");
      return `<button class="pick ${av[k] === o.id ? "on" : ""} ${isOwned ? "" : "locked"}" data-k="${k}" data-v="${o.id}" type="button">${preview}<span>${isOwned ? o.name : `🔒 ${o.price}`}</span></button>`;
    }
    render();
  }

  function viewMeet() {
    const p = active(); if (!p) { go("#/who"); return; }
    const lines = GUIDE.firstMeet.map((l, i) => ({ text: l.replace(/\{name\}/g, p.name), id: `ojo.firstMeet.${i + 1}` }));
    app.innerHTML = `
      <section class="meet">
        <div class="meet-stage">${avatarSvg(p.avatar, "avatar big")}${ojoSvg("buddy float")}</div>
        ${guideHtml(lines[0])}
        <button class="btn btn-big" id="meet-go" type="button">Next →</button>
      </section>`;
    bindGuide(app, lines[0]);
    let i = 0;
    document.getElementById("meet-go").addEventListener("click", e => {
      i++;
      if (i < lines.length) { setGuide(app, lines[i]); if (i === lines.length - 1) e.target.textContent = "Meet Ayu and Ojo →"; }
      else go("#/intro");
    });
  }

  function viewWho() {
    app.innerHTML = `
      <section class="who">
        <h1 class="page-title">Who is playing?</h1>
        <div class="who-list">
          ${profiles.map(p => `<button class="who-card ${p.id === activeId ? "on" : ""}" data-id="${p.id}" type="button">${avatarSvg(p.avatar, "avatar mid")}<span>${esc(p.name)}</span></button>`).join("")}
          ${profiles.length < 3 ? `<button class="who-card add" id="who-add" type="button"><span class="plus">＋</span><span>Add a child 🔒</span></button>` : ""}
        </div>
      </section>`;
    app.querySelectorAll(".who-card[data-id]").forEach(b => b.addEventListener("click", () => { setActive(b.dataset.id); go("#/"); }));
    const add = document.getElementById("who-add");
    if (add) add.addEventListener("click", () => parentGate(() => go("#/setup")));
  }

  /* ================= Treasure Trail ================= */
  const OFFSETS = [0, 0.67, 1, 0.67, 0, -0.67, -1, -0.67];
  const ROW = 132;
  function viewTrail() {
    const p = active();
    const gained = syncBook();
    const lastDay = prog.days.length ? prog.days[prog.days.length - 1] : null;
    const h = new Date().getHours();
    const greet = lastDay && daysApart(lastDay, dayKey()) >= 3 ? line("returnAfterBreak") : line(h < 12 ? "morning" : h < 17 ? "afternoon" : "evening");
    const doneLn = line("allDone");
    const lights = TRAIL.filter(s => stopState(prog, s.n).listen).length;
    const complete = s => { const st = stopState(prog, s.n); return st.listen && st.play && st.done; };
    const nextStop = TRAIL.find(s => !complete(s));
    const allDone = !nextStop;
    const W = Math.max(260, Math.min(340, (app.clientWidth || 320) - 8)), amp = (W - 124) / 2;
    const cx = i => Math.round(W / 2 + OFFSETS[i] * amp), cy = i => i * ROW + 56;
    const path = TRAIL.map((_, i) => i === 0 ? `M${cx(0)} ${cy(0)}` : `C${cx(i - 1)} ${cy(i - 1) + ROW / 2} ${cx(i)} ${cy(i) - ROW / 2} ${cx(i)} ${cy(i)}`).join(" ");
    const tier = tierFor(p.age);

    app.innerHTML = `
      <section class="trail-head">
        ${guideHtml(allDone ? doneLn : greet)}
        <div class="lights" aria-label="${lights} of 8 drops of light found">
          <div class="lights-row">${TRAIL.map(s => dropSvg(stopState(prog, s.n).listen ? "lit" : "")).join("")}</div>
          <p>${lights === 8 ? "Ojo is full of light!" : `${lights} of 8 drops of light`}</p>
        </div>
        ${!tier.active ? `<p class="tier-soon">More stories for ${esc(p.name)}'s age are coming soon!</p>` : ""}
      </section>
      <div class="trail" style="width:${W}px;height:${TRAIL.length * ROW + 40}px">
        <svg class="trail-path" width="${W}" height="${TRAIL.length * ROW}" viewBox="0 0 ${W} ${TRAIL.length * ROW}" aria-hidden="true"><path d="${path}"/></svg>
        ${TRAIL.map((s, i) => {
          const st = stopState(prog, s.n), isNext = nextStop && nextStop.n === s.n;
          return `<button class="stop ${complete(s) ? "complete" : ""} ${isNext ? "next" : ""}" data-n="${s.n}" type="button"
              style="--c:${s.color};left:${cx(i) - 42}px;top:${cy(i) - 42}px" aria-label="Stop ${s.n}: ${esc(s.title)}">
              <span class="stop-ring"><span class="stop-icon">${s.icon}</span></span>
              <span class="pips"><i class="${st.listen ? "on" : ""}">🎧</i><i class="${st.play ? "on" : ""}">🎮</i><i class="${st.done ? "on" : ""}">🌟</i></span>
              <span class="stop-title">${esc(s.title)}</span>
              ${isNext ? `<span class="stop-here ${OFFSETS[i] > 0 ? "on-left" : "on-right"}">${ojoSvg("tiny float")}<b>${complete(s) ? "" : (st.listen || st.play ? "Keep going" : "Start")}</b></span>` : ""}
            </button>`;
        }).join("")}
        ${allDone ? `<div class="trail-end" style="top:${TRAIL.length * ROW}px">🏆 Ojo's treasure is full!<br><button class="btn btn-small" id="cert" type="button">Print certificate</button></div>` : ""}
      </div>`;
    bindGuide(app, allDone ? doneLn : greet, { silent: !!gained });
    app.querySelectorAll(".stop").forEach(b => b.addEventListener("click", () => openStop(+b.dataset.n)));
    const cert = document.getElementById("cert"); if (cert) cert.addEventListener("click", printCertificate);
    if (gained) later(() => celebrate(gained, line("bookDrop")), 400);
    else if (!allDone) later(() => { const el = app.querySelector(".stop.next"); if (el && el.getBoundingClientRect().top > innerHeight - 120) el.scrollIntoView({ behavior: settings.calm ? "auto" : "smooth", block: "center" }); }, 500);
  }

  function openStop(n) {
    const s = TRAIL.find(x => x.n === n), st = stopState(prog, n), g = GAMES[s.game];
    const pending = !!prog.pending[n];
    const scrim = modal(`
      <div class="sheet stop-sheet" role="dialog" aria-modal="true" aria-labelledby="ss-h" style="--c:${s.color}">
        <div class="ss-icon">${s.icon}</div>
        <h2 id="ss-h">${esc(s.title)}</h2>
        <p class="ss-hook">${esc(s.hook)}</p>
        <a class="step ${st.listen ? "done" : ""}" href="ojo-treasury/index.html#story-${n}">
          <span class="step-ic">🎧</span><span class="step-tx"><b>Listen</b><small>Story · ${DV.listen} drops</small></span><span class="step-ok">${st.listen ? "✓" : "›"}</span></a>
        <a class="step ${st.play ? "done" : ""}" href="#/play/${n}">
          <span class="step-ic">🎮</span><span class="step-tx"><b>Play</b><small>${esc(g.title)} · ${DV.play} drops</small></span><span class="step-ok">${st.play ? "✓" : "›"}</span></a>
        <a class="step ${st.done ? "done" : ""} ${pending ? "waiting" : ""}" href="#/do/${n}">
          <span class="step-ic">🌟</span><span class="step-tx"><b>Do</b><small>${pending ? "Waiting for a grown-up's tick" : `Real-life habit · ${DV.do} drops`}</small></span><span class="step-ok">${st.done ? "✓" : pending ? "⏳" : "›"}</span></a>
        <button class="btn btn-ghost" data-close type="button">Close</button>
      </div>`);
    scrim.querySelectorAll("a.step").forEach(a => a.addEventListener("click", () => { onModalClose = null; }));
    say(storyLine(s, "title"));
  }

  function printCertificate() {
    const p = active();
    const w = window.open("", "_blank");
    if (!w) { toast("Please allow pop-ups to print the certificate."); return; }
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ojo's Treasure is Full</title>
      <style>body{font-family:"Baloo 2",system-ui,sans-serif;text-align:center;padding:40px;color:#3a3046}
      .c{border:12px double #f4b52c;border-radius:24px;padding:40px}h1{color:#46307e;font-size:2.6rem;margin:.2em 0}
      .n{font-size:3rem;color:#e86f22;font-weight:800}.d{font-size:2.4rem;letter-spacing:6px}</style></head>
      <body><div class="c"><div class="d">💧💧💧💧💧💧💧💧</div><h1>Ojo's Treasure is Full!</h1>
      <p>This certificate is for</p><p class="n">${esc(p.name)}</p>
      <p>who found all eight drops of light in <b>The Ojo Treasury</b>.</p>
      <p>${new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}</p></div>
      <script>onload=()=>print()<\/script></body></html>`);
    w.document.close();
  }

  /* ================= Games ================= */
  function viewGames() {
    app.innerHTML = `
      <h1 class="page-title">🎮 Games</h1>
      <p class="subtitle">Every game ends with something to try for real.</p>
      <h2 class="section-title">Ojo's games</h2>
      <div class="tiles">
        ${TRAIL.map(s => `<a class="tile" href="#/play/${s.n}" style="--c:${s.color}">
          <span class="tile-icon">${s.icon}</span><h2>${esc(GAMES[s.game].title)}</h2>
          <p>${stopState(prog, s.n).play ? "✓ Played · " : ""}From “${esc(s.title)}”</p></a>`).join("")}
        <a class="tile" href="#/play/pairs" style="--c:#f39c12"><span class="tile-icon">🃏</span><h2>${esc(GAMES.pairs.title)}</h2><p>A memory game</p></a>
      </div>
      <h2 class="section-title">Learning games</h2>
      <div class="tiles">
        ${LEARNING_GAMES.map(g => `<a class="tile" href="#/${g.route}" style="--c:${g.color}"><span class="tile-icon">${g.icon}</span><h2>${esc(g.title)}</h2><p>${esc(g.note)}</p></a>`).join("")}
      </div>`;
  }

  function viewPlay([key]) {
    const n = parseInt(key, 10);
    const stop = TRAIL.find(s => s.n === n);
    const gameKey = stop ? stop.game : key;
    if (!GAMES[gameKey]) { go("#/games"); return; }
    const game = Object.assign({ key: gameKey }, GAMES[gameKey]);
    const back = stop ? "#/" : "#/games";
    const promptLn = { text: game.prompt || "", id: `game.${gameKey}.prompt` };
    const intro = storyLine(stop, "intro");
    app.innerHTML = `
      <div class="play-head">
        <a class="btn btn-small btn-ghost" href="${back}">← ${stop ? "Trail" : "Games"}</a>
        <h1>${esc(game.title)}</h1>
      </div>
      ${echoHtml(intro)}
      ${guideHtml(promptLn)}
      <div class="game" id="game-box"></div>`;
    bindGuide(app, promptLn, { silent: true });
    bindEcho(app, intro);
    const box = document.getElementById("game-box");
    const engines = { sort: gameSort, sequence: gameSequence, choose: gameChoose, scrub: gameScrub, tummy: gameTummy, pairs: gamePairs };
    const win = () => later(() => finishGame(gameKey, stop, box), 700);
    engines[game.type](box, game, isSmall(), win, stop);
    /* Ojo's recorded instruction starts the game; the story line is on screen to hear with 🔊. */
    if (game.type !== "choose") say(recorded(promptLn) ? promptLn : [intro, promptLn]);
    else if (intro && !recorded({ id: `game.${gameKey}.q1` })) say(intro);
  }

  /* On the last step the celebration speaks, so the praise only shows (it would be cut off). */
  function praise(last) { sfx.right(); if (last) quietGuide(app, line("correct")); else setGuide(app, line("correct")); }
  function hint(ln) { sfx.wrong(); setGuide(app, ln || line("wrong")); }

  function finishGame(gameKey, stop, box) {
    let earned = 0;
    if (stop && !stopState(prog, stop.n).play) { stopState(prog, stop.n).play = true; earned = addDrops(DV.play); }
    else if (prog.played[gameKey] !== dayKey()) { prog.played[gameKey] = dayKey(); earned = addDrops(DV.replay); }
    else markActive();
    saveProg();
    const fromStory = storyLine(stop, "done"), praiseLn = line("gameDone");
    const msg = recorded(praiseLn) || !fromStory ? praiseLn : fromStory;
    box.innerHTML = `
      <div class="center game-done">
        <div class="game-cover">🏆</div>
        <h2>${esc(msg.text)}</h2>
        ${msg !== fromStory ? echoHtml(fromStory) : ""}
        ${earned ? `<p class="earned">${dropSvg()} +${earned} golden drop${earned > 1 ? "s" : ""}</p>` : `<p class="earned">You've already collected today's drops for this game.</p>`}
        <div class="row">
          ${stop ? `<a class="btn btn-big" href="#/do/${stop.n}">🌟 Now try it for real</a>` : ""}
          <button class="btn btn-alt again" type="button">🔁 Play again</button>
        </div>
      </div>`;
    box.querySelector(".again").addEventListener("click", router);
    if (msg !== fromStory) bindEcho(box, fromStory);
    const lead = storyLine(stop, "yay");
    if (earned) celebrate(earned, Object.assign({ lead }, msg), () => { if (stop) setGuide(app, line("taskInvite")); });
    else { quietGuide(app, msg); say(lead, msg); }
  }

  /* Tap everything that is right */
  function gameSort(box, game, small, win) {
    let items = game.items.map((it, k) => Object.assign({ k }, it));
    if (small) items = [...items.filter(i => i.ok).slice(0, 3), ...items.filter(i => !i.ok).slice(0, game.small - 3)];
    items = shuffle(items);
    const need = items.filter(i => i.ok).length;
    let found = 0;
    box.innerHTML = `<p class="counter" id="counter">0 of ${need} found</p>
      <div class="pick-grid">${items.map((it, k) => `<button class="card-btn" data-k="${k}" type="button"><span class="ce">${it.e}</span><span class="cl">${esc(it.l)}</span></button>`).join("")}</div>`;
    box.querySelectorAll(".card-btn").forEach(b => b.addEventListener("click", () => {
      const it = items[+b.dataset.k];
      if (b.classList.contains("right")) return;
      if (it.ok) {
        b.classList.add("right"); found++;
        box.querySelector("#counter").textContent = `${found} of ${need} found`;
        if (found === need) { praise(true); win(); } else { sfx.right(); voice({ text: it.l, id: `game.${game.key}.item.${it.k + 1}` }); }
      } else {
        b.classList.remove("wrong"); void b.offsetWidth; b.classList.add("wrong");
        hint(line("sortHint"));
      }
    }));
  }

  /* Tap the pictures in the right order */
  function gameSequence(box, game, small, win) {
    const steps = game.steps.map((st, k) => Object.assign({ k }, st)).filter(st => !small || st.core);
    const order = shuffle(steps.map((_, k) => k));
    let next = 0, misses = 0;
    box.innerHTML = `
      <ol class="slots">${steps.map((_, k) => `<li class="slot" data-k="${k}"><span class="slot-n">${k + 1}</span></li>`).join("")}</ol>
      <div class="pick-grid">${order.map(k => `<button class="card-btn" data-k="${k}" type="button"><span class="ce">${steps[k].e}</span><span class="cl">${esc(steps[k].l)}</span></button>`).join("")}</div>`;
    box.querySelectorAll(".card-btn").forEach(b => b.addEventListener("click", () => {
      const k = +b.dataset.k;
      if (k === next) {
        const slot = box.querySelector(`.slot[data-k="${k}"]`);
        slot.innerHTML = `<span class="ce">${steps[k].e}</span><span class="cl">${esc(steps[k].l)}</span>`;
        slot.classList.add("filled", "pop");
        b.classList.add("used"); b.disabled = true;
        next++; misses = 0;
        box.querySelectorAll(".card-btn.glow").forEach(x => x.classList.remove("glow"));
        if (next === steps.length) { praise(true); win(); } else { sfx.right(); voice({ text: steps[k].l, id: `game.${game.key}.step.${steps[k].k + 1}` }); }
      } else {
        misses++;
        b.classList.remove("wrong"); void b.offsetWidth; b.classList.add("wrong");
        hint(line(misses >= 2 ? "seqGlow" : "seqHint"));
        if (misses >= 2) { const c = box.querySelector(`.card-btn[data-k="${next}"]`); if (c) c.classList.add("glow"); }
      }
    }));
  }

  /* One question, a few answers, several rounds */
  function gameChoose(box, game, small, win) {
    const rounds = small ? game.rounds.slice(0, game.small) : game.rounds;
    let i = 0;
    function render() {
      const r = rounds[i];
      const opts = shuffle(r.options.map((o, k) => ({ o, k })));
      box.innerHTML = `
        <div class="game-round">Question ${i + 1} of ${rounds.length}</div>
        <div class="prompt-emoji">${r.e}</div>
        <p class="q">${esc(r.q)} <button class="icon-btn" id="hear" type="button" aria-label="Hear the question">🔊</button></p>
        <div class="options">${opts.map(x => `<button class="option" data-k="${x.k}" type="button">${esc(x.o)}</button>`).join("")}</div>`;
      const qLn = { text: r.q, id: `game.${game.key}.q${i + 1}` };
      const optLns = r.options.map((o, k) => ({ text: o.replace(EMOJI, "").trim(), id: `game.${game.key}.q${i + 1}.opt${k + 1}` }));
      const ask = () => voice(qLn, optLns);
      if (autoTalk() || recorded(qLn)) ask();
      const hear = box.querySelector("#hear"); if (hear) hear.addEventListener("click", ask);
      let done = false;
      box.querySelectorAll(".option").forEach(b => b.addEventListener("click", () => {
        if (done) return;
        if (+b.dataset.k === r.a) {
          done = true; b.classList.add("right"); praise();
          i++; later(() => { if (i < rounds.length) render(); else win(); }, 1200);
        } else { b.classList.add("wrong"); b.disabled = true; hint(); }
      }));
    }
    render();
  }

  /* Brush away the fuzzy spots */
  function gameScrub(box, game, small, win) {
    const total = small ? game.small : game.spots;
    const fuzzy = new Set(shuffle([...Array(12).keys()]).slice(0, total));
    let left = total;
    box.innerHTML = `<p class="counter" id="counter">${left} fuzzy spots left</p>
      <div class="mouth">${[...Array(12).keys()].map(k => `<button class="tooth ${fuzzy.has(k) ? "fuzzy" : ""} ${k < 6 ? "top" : "bottom"}" data-k="${k}" type="button" aria-label="${fuzzy.has(k) ? "Fuzzy tooth" : "Clean tooth"}"></button>`).join("")}</div>`;
    box.querySelectorAll(".tooth").forEach(b => b.addEventListener("click", () => {
      if (!b.classList.contains("fuzzy")) { setGuide(app, line("teethClean")); return; }
      b.classList.remove("fuzzy"); b.classList.add("sparkle"); b.setAttribute("aria-label", "Clean tooth");
      left--; if (left) sfx.right();
      box.querySelector("#counter").textContent = left ? `${left} fuzzy spot${left > 1 ? "s" : ""} left` : "All sparkly!";
      if (!left) { praise(true); win(); }
    }));
  }

  /* Stop eating when the tummy feels comfy */
  function gameTummy(box, game, small, win, stop) {
    const max = game.bites.length, comfy = game.comfy;
    let level = 0, locked = false;
    function render() {
      box.innerHTML = `
        <div class="tummy-wrap">
          <div class="plate">${game.bites.map((b, k) => `<button class="bite ${k < level ? "eaten" : ""}" data-k="${k}" type="button" aria-label="Eat a bite">${b}</button>`).join("")}</div>
          <div class="tummy">
            <span class="tummy-kid" aria-hidden="true">👧🏽</span>
            <div class="meter" aria-label="Tummy ${level} of ${max} full">${[...Array(max).keys()].map(k => `<span class="${k < level ? "full" : ""} ${k === comfy - 1 ? "comfy" : ""}"></span>`).join("")}</div>
            <small>${level === 0 ? "Hungry" : level < comfy ? "Still a little hungry" : level === comfy ? "Comfy, with a little space" : "Too full!"}</small>
          </div>
        </div>
        <button class="btn btn-big ${level === comfy ? "pulse" : ""}" id="tummy-done" type="button">🙏 I'm done</button>`;
      box.querySelectorAll(".bite:not(.eaten)").forEach(b => b.addEventListener("click", () => {
        if (locked) return;
        level++;
        if (level > comfy) {
          locked = true; render(); sfx.wrong();
          setGuide(app, line("tummyFull"));
          later(() => { level = 0; locked = false; render(); }, 1800);
          return;
        }
        render();
        if (level === comfy) { sfx.right(); setGuide(app, line("tummyComfy")); }
      }));
      box.querySelector("#tummy-done").addEventListener("click", () => {
        if (locked) return;
        if (level < comfy) { hint(line("tummyHungry")); return; }
        locked = true; quietGuide(app, storyLine(stop, "yay") || { text: "Thank you, tummy!" }); win();
      });
    }
    render();
  }

  /* Memory pairs */
  function gamePairs(box, game, small, win) {
    const faces = small ? game.cards.slice(0, game.small) : game.cards;
    const deck = shuffle([...faces, ...faces]);
    let open = [], matched = 0, busy = false;
    box.innerHTML = `<div class="pairs ${small ? "small" : ""}">${deck.map((f, k) => `<button class="pair" data-k="${k}" type="button" aria-label="Hidden card"><span>${f}</span></button>`).join("")}</div>`;
    box.querySelectorAll(".pair").forEach(b => b.addEventListener("click", () => {
      if (busy || b.classList.contains("up")) return;
      b.classList.add("up"); b.setAttribute("aria-label", "Card " + deck[+b.dataset.k]);
      open.push(b);
      if (open.length < 2) return;
      const [a, c] = open; open = [];
      if (deck[+a.dataset.k] === deck[+c.dataset.k]) {
        a.classList.add("got"); c.classList.add("got"); matched++;
        if (matched === faces.length) { praise(true); win(); } else { sfx.right(); voice(line("pairMatch")); }
      } else {
        busy = true;
        later(() => { a.classList.remove("up"); c.classList.remove("up"); a.setAttribute("aria-label", "Hidden card"); c.setAttribute("aria-label", "Hidden card"); busy = false; }, 900);
      }
    }));
  }

  /* ================= Do: the real-life habit ================= */
  function viewDo([key]) {
    const n = parseInt(key, 10), s = TRAIL.find(x => x.n === n);
    if (!s) { go("#/"); return; }
    const t = dayKey(), habit = prog.habits[n] || { count: 0, last: null };
    const doneToday = habit.last === t, pending = !!prog.pending[n] && !doneToday;
    const got = !!prog.stickers[s.sticker.id];
    const g = doneToday ? line("taskDoneToday") : pending ? line("taskPending") : line("taskInvite");
    const fromStory = storyLine(s, "story");
    const taskLn = { text: s.task, id: `task.${n}` };
    app.innerHTML = `
      <div class="play-head"><a class="btn btn-small btn-ghost" href="#/">← Trail</a><h1>Try it today</h1></div>
      ${guideHtml(g)}
      ${echoHtml(fromStory)}
      <section class="task-card" style="--c:${s.color}">
        <div class="task-sticker">${s.sticker.e}</div>
        <p class="task-text">${esc(s.task)}</p>
        <button class="icon-btn" id="hear-task" type="button" aria-label="Hear the task">🔊</button>
        <div class="task-status">
          ${doneToday ? `<p class="ok">✅ Done today!</p>`
            : pending ? `<p class="wait">⏳ Waiting for a grown-up's tick</p>`
            : `<button class="btn btn-big" id="will-do" type="button">I'll try it today! 🌟</button>`}
        </div>
        ${!doneToday ? `<button class="btn btn-ghost btn-small" id="tick-now" type="button">Grown-up here? Tick it now 🔒</button>` : ""}
        <div class="sticker-progress">
          <p>${got ? `You have the <b>${esc(s.sticker.name)}</b> sticker!` : `Do it on 3 days to earn the <b>${esc(s.sticker.name)}</b> sticker`}</p>
          <div class="dots3">${[0, 1, 2].map(k => `<span class="${k < Math.min(habit.count, 3) ? "on" : ""}"></span>`).join("")}</div>
        </div>
      </section>`;
    bindGuide(app, g, { silent: true });
    bindEcho(app, fromStory);
    if (recorded(taskLn)) say(doneToday ? g : [g, taskLn]);
    else say(fromStory, doneToday ? g : taskLn);
    document.getElementById("hear-task").addEventListener("click", () => voice(taskLn));
    const will = document.getElementById("will-do");
    if (will) will.addEventListener("click", () => { prog.pending[n] = t; saveProg(); router(); });
    const tick = document.getElementById("tick-now");
    if (tick) tick.addEventListener("click", () => parentGate(() => {
      const r = confirmTask(activeId, n);
      if (r) celebrate(r.earned, line(r.sticker ? "newSticker" : "taskDone"), router, r.sticker ? stickerHtml(r.sticker) : "");
    }));
  }

  function stickerHtml(st) { return `<div class="cel-sticker"><span>${st.e}</span><b>${esc(st.name)}</b></div>`; }

  /* A grown-up confirms the habit was done. Drops once a day per habit; sticker after three days. */
  function confirmTask(childId, n) {
    const s = TRAIL.find(x => x.n === n);
    const p = childId === activeId ? prog : loadProg(childId);
    const t = dayKey(), habit = p.habits[n] || { count: 0, last: null };
    if (habit.last === t) { delete p.pending[n]; saveProgFor(childId, p); return null; }
    habit.count++; habit.last = t; p.habits[n] = habit;
    delete p.pending[n];
    stopState(p, n).done = true;
    const earned = addDrops(DV.do, p);
    let sticker = null;
    if (habit.count >= 3 && !p.stickers[s.sticker.id]) { p.stickers[s.sticker.id] = t; sticker = s.sticker; }
    saveProgFor(childId, p);
    if (childId === activeId) updateTop();
    return { earned, sticker };
  }

  /* ================= My golden drops: a jar that fills as activities are finished ================= */
  const JAR_MAX = 60;
  function viewDrops() {
    const wk = weekKey(), weekDays = prog.days.filter(d => weekKey(new Date(d + "T12:00:00")) === wk).length;
    const chestReady = weekDays >= 3 && !prog.chests[wk];
    const total = prog.earned || 0, shown = Math.min(total, JAR_MAX);
    const g = line(total ? "jar" : "jarEmpty");
    app.innerHTML = `
      <h1 class="page-title"><span class="title-drop">${dropSvg()}</span> My golden drops</h1>
      ${guideHtml(g)}
      <section class="jar-box">
        <div class="jar" role="img" aria-label="${total} golden drop${total === 1 ? "" : "s"} in Ojo's jar">
          <div class="jar-lid"></div>
          <div class="jar-glass">
            <div class="jar-drops">${Array.from({ length: shown }, (_, i) => `<span style="--i:${Math.max(0, i - shown + 12)}">${dropSvg()}</span>`).join("")}</div>
            ${total ? "" : `<p class="jar-empty">Empty for now</p>`}
          </div>
        </div>
        <p class="jar-count"><b>${total}</b> golden drop${total === 1 ? "" : "s"}${total > JAR_MAX ? ` <small>(the jar shows ${JAR_MAX})</small>` : ""}</p>
        <p class="garden-note">Every story, game and real-life habit you finish adds golden drops. Spending drops in the shop never empties your jar.</p>
      </section>
      <section class="chest-box">
        ${chestReady ? `<button class="chest ready" id="open-chest" type="button"><span>🎁</span><b>Open your treasure chest!</b></button>`
          : prog.chests[wk] ? `<div class="chest opened"><span>🧰</span><b>You opened this week's chest. A new one comes next week!</b></div>`
          : `<div class="chest"><span>🎁</span><b>Play on 3 days this week to open the treasure chest</b>
              <div class="dots3">${[0, 1, 2].map(k => `<span class="${k < weekDays ? "on" : ""}"></span>`).join("")}</div></div>`}
      </section>`;
    bindGuide(app, g);
    const open = document.getElementById("open-chest");
    if (open) open.addEventListener("click", () => {
      prog.chests[wk] = dayKey();
      const options = CHEST_STICKERS.filter(s => !prog.stickers[s.id]);
      const st = options.length ? pick(options) : null;
      if (st) prog.stickers[st.id] = dayKey();
      const earned = addDrops(DV.chest);
      saveProg();
      celebrate(earned, line("chest"), router, st ? stickerHtml(st) : "");
    });
  }

  /* ================= Meet Ayu and Ojo ================= */
  const introLines = key => INTRO[key].map((t, i) => ({ text: t, id: `intro.${key}.${i + 1}` }));
  const bookDrops = () => { const c = load("ojo-drops:" + activeId, []); return new Set(Array.isArray(c) ? c : []); };
  function authorLine(text = "Stories by") {
    return `<a class="author-line" href="#/author"><img src="${AUTHOR.small}" alt="" width="48" height="48"><span>${esc(text)} <b>${esc(AUTHOR.name)}</b></span></a>`;
  }
  function viewIntro() {
    const found = bookDrops();
    app.innerHTML = `
      <section class="intro">
        <p class="kn-title" lang="kn">ಆಯು ಮತ್ತು ಓಜೋ</p>
        <h1 class="page-title">Meet Ayu and Ojo</h1>
        <p class="subtitle">Two friends who live in every story.</p>
        <div class="intro-pair">
          <article class="intro-card ayu" aria-labelledby="in-ayu">
            <img class="intro-pic" src="images/ayu.svg" alt="Ayu, a five-year-old girl in a yellow dress, waving" width="200" height="300">
            <div class="intro-txt"><h2 id="in-ayu">This is Ayu <span lang="kn">ಆಯು</span></h2>
              ${INTRO.ayu.slice(1).map((t, i, a) => `<p${i === a.length - 1 ? ' class="pop"' : ""}>${esc(t)}</p>`).join("")}
              <button class="btn btn-small listen" data-k="ayu" type="button">🔊 Listen</button></div>
          </article>
          <article class="intro-card ojo" aria-labelledby="in-ojo">
            <div class="intro-pic ojo-pic">${ojoSvg("float")}</div>
            <div class="intro-txt"><h2 id="in-ojo">This is Ojo <span lang="kn">ಓಜೋ</span></h2>
              ${INTRO.ojo.slice(1).map((t, i, a) => `<p${i === a.length - 1 ? ' class="pop"' : ""}>${esc(t)}</p>`).join("")}
              <button class="btn btn-small listen" data-k="ojo" type="button">🔊 Listen</button></div>
          </article>
        </div>
        <section class="intro-why" aria-labelledby="in-why">
          <h2 id="in-why">Why Ayu and Ojo?</h2>
          ${INTRO.why.map(t => `<p>${esc(t)}</p>`).join("")}
          <div class="eight" role="img" aria-label="${found.size} of 8 golden drops found in the stories">${TRAIL.map(s => `<span class="${found.has(s.n) ? "got" : ""}">${dropSvg()}</span>`).join("")}</div>
          <button class="btn btn-small listen" data-k="why" type="button">🔊 Listen</button>
        </section>
        <section class="intro-family" aria-labelledby="in-fam">
          <h2 id="in-fam">Ayu's family</h2>
          <div class="fam">${INTRO.family.map(f => `<div class="fam-card"><img src="${f.img}" alt="" width="200" height="270"><div><h3>${esc(f.who)} <span lang="kn">${f.kn}</span></h3><p>${esc(f.text)}</p></div></div>`).join("")}</div>
        </section>
        <details class="grown-fold"><summary>For grown-ups: what the names Ayu and Ojo mean</summary><p>${esc(WHY_AYU_OJO)}</p><p><a href="#/grown">More readings for grown-ups</a></p></details>
        ${authorLine()}
        <div class="cta-row"><a class="btn btn-big" href="#/stories">📖 Read the stories</a><a class="btn btn-big btn-alt" href="#/">🗺️ Go to the Trail</a></div>
      </section>`;
    app.querySelectorAll(".listen").forEach(b => b.addEventListener("click", () => voice(introLines(b.dataset.k))));
  }

  /* ================= Stories: The Ojo Treasury ================= */
  function viewStories() {
    const found = bookDrops();
    app.innerHTML = `
      <section class="stories">
        <p class="kn-title" lang="kn">ಓಜೋ ಕೋಶ</p>
        <h1 class="page-title">📖 The Ojo Treasury</h1>
        <p class="subtitle">Eight stories, read aloud by the author. Find Ojo's golden drop in each one!</p>
        ${authorLine("Written and read by")}
        <div class="story-list">
          ${TRAIL.map(s => `<a class="story-card" href="ojo-treasury/index.html#story-${s.n}" style="--c:${s.color}">
            <span class="sc-icon">${s.icon}</span>
            <span class="sc-txt"><small>Story ${s.n}</small><b>${esc(s.title)}</b><span>${esc(s.hook)}</span></span>
            <span class="sc-drop ${found.has(s.n) ? "got" : ""}" title="${found.has(s.n) ? "Golden drop found" : "Golden drop still to find"}">${dropSvg()}<span class="sr-only">${found.has(s.n) ? "Golden drop found" : "Golden drop still to find"}</span></span></a>`).join("")}
        </div>
        <div class="cta-row"><a class="btn btn-alt" href="ojo-treasury/index.html#cover">Open the whole book</a><a class="btn btn-ghost" href="#/intro">Meet Ayu and Ojo</a></div>
      </section>`;
  }

  /* ================= For grown-ups (behind the grown-up check) ================= */
  function viewGrown() {
    if (!gateIsOpen()) { app.innerHTML = ""; parentGate(() => viewGrown(), () => go("#/menu")); return; }
    app.innerHTML = `
      <article class="panel grown">
        <h1 class="page-title">📚 For grown-ups</h1>
        <p class="lede">Readings for parents, grandparents and teachers: what each story teaches, the Ayurveda idea behind it, and how to practise it at home.</p>
        <h2 class="section-title">How the app works</h2>
        <ol class="steps">
          <li><b>Listen.</b> Each stop on the Trail starts with a story from The Ojo Treasury, read by the author.</li>
          <li><b>Play.</b> A short game repeats the story's one habit.</li>
          <li><b>Do it for real.</b> Your child tries the habit with you, and you tick it in Parent Corner.</li>
        </ol>
        <p>Children hear plain words first: Ojo, a little light, golden drops. The Ayurveda name for each idea appears only on this page, so you can introduce it later, when your child is ready.</p>
        <h2 class="section-title">What Ayu and Ojo mean</h2>
        <p>${esc(WHY_AYU_OJO)}</p>
        <h2 class="section-title">The eight stories and the idea behind each</h2>
        ${GROWN.map(g => { const s = TRAIL.find(t => t.n === g.n); return `
          <section class="gr-story" style="--c:${s.color}">
            <h3><span aria-hidden="true">${s.icon}</span> ${g.n}. ${esc(s.title)}</h3>
            <p class="gr-term"><b>${esc(g.practice)}</b> · <i>${esc(g.term)}</i></p>
            <p>${esc(g.note)}</p>
            <p class="gr-try"><b>Try it together:</b> ${esc(s.task)}</p>
            <a href="ojo-treasury/index.html#story-${g.n}">Read the story</a>
          </section>`; }).join("")}
        <h2 class="section-title">More in the book</h2>
        <p>The book's own section for grown-ups covers how to read with each age, myths about growth and feeding, and when to see a doctor.</p>
        <p><a class="btn btn-alt" href="ojo-treasury/index.html#grown-ups">Open the book's guide for grown-ups</a></p>
        ${authorLine("Written by")}
      </article>`;
  }

  /* ================= About the author ================= */
  function viewAuthor() {
    app.innerHTML = `
      <article class="panel author">
        <p class="kn-title" lang="kn">ಲೇಖಕರ ಬಗ್ಗೆ</p>
        <h1 class="page-title">About the author</h1>
        <div class="au-top">
          <img class="au-photo" src="${AUTHOR.photo}" alt="${esc(AUTHOR.name)}, smiling, in a green sari" width="480" height="640">
          <div><p class="au-name">${esc(AUTHOR.name)}</p><p class="au-role">${esc(AUTHOR.role)}<br>${esc(AUTHOR.place)}</p></div>
        </div>
        <section class="au-note" aria-labelledby="au-n">
          <h2 id="au-n">A note from the author</h2>
          <p>Dear reader,</p>
          ${AUTHOR.note.map(t => `<p>${esc(t)}</p>`).join("")}
          <p class="au-sign">With warmth and good wishes,<br><b>${esc(AUTHOR.name)}</b></p>
        </section>
        <h2 class="section-title">Her work</h2>
        <p>${esc(AUTHOR.work)}</p>
        <div class="cta-row"><a class="btn btn-big" href="#/stories">📖 Read the stories</a></div>
      </article>`;
  }

  /* ================= Menu: every part of the app in one place ================= */
  function viewMenu() {
    const groups = [
      ["For children", [
        ["#/intro", ojoSvg(), "Meet Ayu and Ojo", "Who they are and why they matter"],
        ["#/stories", "📖", "Stories", "The Ojo Treasury, read aloud"],
        ["#/", "🗺️", "Treasure Trail", "Listen, play, then do it for real"],
        ["#/games", "🎮", "Games", "Every game in one place"],
        ["#/drops", dropSvg(), "My golden drops", `${prog.earned || 0} collected`],
        ["#/me", active() ? avatarSvg(active().avatar, "avatar mini") : "🙂", "Me", "My look, stickers and shop"]
      ]],
      ["For grown-ups", [
        ["#/grown", "📚", "For grown-ups 🔒", "Readings for parents and teachers"],
        ["#/author", `<img src="${AUTHOR.small}" alt="" width="48" height="48">`, "About the author", AUTHOR.name],
        ["#/parents", "👨‍👩‍👧", "Parent Corner 🔒", "Ticks, children, play time, sounds"]
      ]]
    ];
    app.innerHTML = `
      <h1 class="page-title">☰ Menu</h1>
      ${groups.map(([title, items]) => `
        <h2 class="section-title">${title}</h2>
        <div class="menu-grid">${items.map(([h, icon, t, d]) => `<a class="menu-item" href="${h}"><span class="mi-icon">${icon}</span><span class="mi-txt"><b>${esc(t)}</b><small>${esc(d)}</small></span></a>`).join("")}</div>`).join("")}
      <p class="menu-foot">The Ojo Treasury <span lang="kn">ಓಜೋ ಕೋಶ</span> · stories by ${esc(AUTHOR.name)}</p>`;
  }

  /* ================= Me: avatar, stickers, shop ================= */
  function priceOf(id) {
    const all = [...AVATAR.outfit, ...AVATAR.acc, ...PLANTS];
    const it = all.find(x => x.id === id);
    return it ? it.price : 0;
  }
  function viewMe([tab]) {
    const p = active();
    const shopTab = ["outfit", "acc"].includes(tab) ? tab : "outfit";
    const allStickers = [...TRAIL.map(s => s.sticker), ...CHEST_STICKERS];
    const items = AVATAR[shopTab].filter(i => i.price > 0);
    app.innerHTML = `
      <section class="me-head">
        ${avatarSvg(p.avatar, "avatar big")}
        <div><h1 class="page-title">${esc(p.name)}</h1>
          <p class="me-drops">${dropSvg()} <b>${prog.drops}</b> golden drops to spend</p>
          <a class="btn" href="#/avatar">✏️ Change my look</a></div>
      </section>
      <h2 class="section-title">My stickers</h2>
      <div class="album">${allStickers.map(s => prog.stickers[s.id]
          ? `<div class="stk got"><span>${s.e}</span><small>${esc(s.name)}</small></div>`
          : `<div class="stk"><span>?</span><small>${esc(s.name)}</small></div>`).join("")}</div>
      <h2 class="section-title">Ojo's shop</h2>
      <p class="subtitle">Spend your drops on clothes and extras. Drops are only ever earned, never bought, and spending them never empties your jar.</p>
      <div class="tabs" role="tablist">
        ${[["outfit", "Clothes"], ["acc", "Extras"]].map(([k, l]) => `<a class="tab ${shopTab === k ? "on" : ""}" href="#/me/${k}" role="tab">${l}</a>`).join("")}
      </div>
      <div class="shop">${items.map(it => {
        const owned = prog.owned.includes(it.id);
        const wearing = p.avatar.outfit === it.id || p.avatar.acc === it.id;
        const preview = avatarSvg(Object.assign({}, p.avatar, { [shopTab]: it.id }), "avatar small");
        return `<div class="shop-item">${preview}<b>${esc(it.name)}</b>
          ${owned ? (wearing ? `<span class="owned">Wearing ✓</span>` : `<button class="btn btn-small btn-alt" data-wear="${it.id}" type="button">Wear</button>`)
            : `<button class="btn btn-small" data-buy="${it.id}" type="button">${dropSvg()} ${it.price}</button>`}</div>`;
      }).join("")}</div>`;
    app.querySelectorAll("[data-wear]").forEach(b => b.addEventListener("click", () => {
      p.avatar[shopTab] = b.dataset.wear; saveProfiles(); updateTop(); viewMe([shopTab]);
    }));
    app.querySelectorAll("[data-buy]").forEach(b => b.addEventListener("click", () => {
      const it = items.find(x => x.id === b.dataset.buy);
      if (prog.drops < it.price) { toast(`You need ${it.price - prog.drops} more drops. Keep playing!`); voice(line("needDrops")); return; }
      const scrim = modal(`
        <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="buy-h">
          <h2 id="buy-h">Get ${esc(it.name)}?</h2>
          <p>It costs ${it.price} drops. You have ${prog.drops}.</p>
          <div class="row"><button class="btn btn-ghost" data-close type="button">Not now</button><button class="btn" id="buy-yes" type="button">Yes, please!</button></div>
        </div>`);
      scrim.querySelector("#buy-yes").addEventListener("click", () => {
        prog.drops -= it.price; prog.owned.push(it.id);
        p.avatar[shopTab] = it.id; saveProfiles();
        saveProg(); closeModal(); goldenDrops(); toast(`You're wearing ${it.name}!`); viewMe([shopTab]);
      });
    }));
  }

  /* ================= Parent Corner ================= */
  function viewParents() {
    if (!gateIsOpen()) { app.innerHTML = ""; parentGate(() => viewParents(), () => go("#/")); return; }
    const pendingRows = [];
    profiles.forEach(c => {
      const p = c.id === activeId ? prog : loadProg(c.id);
      Object.keys(p.pending).forEach(n => {
        const s = TRAIL.find(x => x.n === +n);
        if (s && (p.habits[n] || {}).last !== dayKey()) pendingRows.push({ c, s, since: p.pending[n] });
      });
    });
    const summary = c => {
      const p = c.id === activeId ? prog : loadProg(c.id);
      const done = TRAIL.filter(s => { const st = p.stops[s.n] || {}; return st.listen && st.play && st.done; }).length;
      const lights = TRAIL.filter(s => (p.stops[s.n] || {}).listen).length;
      return `${lights}/8 stories · ${done}/8 stops complete · ${p.drops} drops · ${p.days.length} active day${p.days.length === 1 ? "" : "s"}`;
    };
    app.innerHTML = `
      <section class="panel parents">
        <h1 class="page-title">👨‍👩‍👧 Parent Corner</h1>
        <p class="subtitle">Only grown-ups can see this page.</p>

        <h2 class="section-title">Waiting for your tick</h2>
        ${pendingRows.length ? `<ul class="tick-list">${pendingRows.map(r => `
          <li><span class="tl-e">${r.s.sticker.e}</span>
            <span class="tl-t"><span><b>${esc(r.c.name)}</b>: ${esc(r.s.task)}</span><small>Planned on ${esc(r.since)}</small></span>
            <span class="tl-b"><button class="btn btn-small" data-yes="${r.c.id}:${r.s.n}" type="button">Done ✓</button>
            <button class="btn btn-small btn-ghost" data-no="${r.c.id}:${r.s.n}" type="button">Not yet</button></span></li>`).join("")}</ul>`
          : `<p class="muted">Nothing to confirm. When your child taps “I'll try it today”, the habit appears here for you to tick once it's done.</p>`}

        <h2 class="section-title">Children on this device</h2>
        <ul class="kid-list">${profiles.map(c => {
          const t = tierFor(c.age);
          return `<li>${avatarSvg(c.avatar, "avatar mini")}
            <span class="kl-t"><span><b>${esc(c.name)}</b>, age ${c.age}${c.id === activeId ? " · playing now" : ""}</span><small>${summary(c)}</small>
            ${t.active ? "" : `<small class="soon">Stories for ages ${t.ages[0]}–${t.ages[1]} are coming soon; ${esc(c.name)} is using Ojo's stories for now.</small>`}</span>
            <span class="kl-b"><a class="btn btn-small btn-ghost" href="#/setup/${c.id}">Edit</a>
            <button class="btn btn-small btn-ghost" data-reset="${c.id}" type="button">Reset progress</button>
            <button class="btn btn-small btn-ghost danger" data-del="${c.id}" type="button">Delete</button></span></li>`;
        }).join("")}</ul>
        ${profiles.length < 3 ? `<a class="btn btn-alt" href="#/setup">＋ Add a child</a>` : `<p class="muted">Up to three children can share one device.</p>`}

        <h2 class="section-title">Play time</h2>
        <label class="field inline"><span>End each session after</span>
          <select id="sess">${[5, 10, 15, 20].map(m => `<option value="${m}" ${settings.sessionMin === m ? "selected" : ""}>${m} minutes</option>`).join("")}</select></label>
        <p class="muted">When time is up, Ojo invites your child to go and try the habit for real. Only a grown-up can unlock more play.</p>

        <h2 class="section-title">Sound and motion</h2>
        <label class="toggle"><input type="checkbox" id="mute" ${settings.mute ? "" : "checked"} /> <span>Ojo speaks aloud</span></label>
        <label class="toggle"><input type="checkbox" id="sfx" ${settings.sfx === false ? "" : "checked"} /> <span>Tap sounds, and different sounds for right and wrong answers</span></label>
        <label class="toggle"><input type="checkbox" id="calm" ${settings.calm ? "checked" : ""} /> <span>Calm mode: less movement, no falling drops</span></label>

        <h2 class="section-title">Readings for grown-ups</h2>
        <p><a href="#/grown">For grown-ups</a>: what each story teaches, the Ayurveda idea behind it, and how to practise it at home. <a href="#/author">About the author</a>.</p>

        <h2 class="section-title">Privacy</h2>
        <ul class="list">
          <li>Names, ages and progress are saved only on this device. Nothing is sent to a server.</li>
          <li>No accounts, ads, tracking, chat, camera or microphone.</li>
          <li>Golden drops are earned by playing and by real-life habits. They can never be bought.</li>
          <li>No leaderboards or comparison between children. Mistakes never cost anything.</li>
        </ul>
        <div class="row"><a class="btn btn-big" href="#/">Back to the app</a></div>
      </section>`;

    app.querySelectorAll("[data-yes]").forEach(b => b.addEventListener("click", () => {
      const [cid, n] = b.dataset.yes.split(":");
      const r = confirmTask(cid, +n);
      const c = profiles.find(x => x.id === cid);
      if (r) toast(`${c.name} earned ${r.earned} drops${r.sticker ? ` and the ${r.sticker.name} sticker` : ""}!`);
      viewParents();
    }));
    app.querySelectorAll("[data-no]").forEach(b => b.addEventListener("click", () => {
      const [cid, n] = b.dataset.no.split(":");
      const p = cid === activeId ? prog : loadProg(cid);
      delete p.pending[n]; saveProgFor(cid, p); if (cid === activeId) updateTop();
      toast("No problem. Your child can try again another day."); viewParents();
    }));
    app.querySelectorAll("[data-reset]").forEach(b => b.addEventListener("click", () => {
      const c = profiles.find(x => x.id === b.dataset.reset);
      if (!confirm(`Reset all of ${c.name}'s drops, stickers and trail progress?`)) return;
      saveProgFor(c.id, blankProg()); remove("ojo-drops:" + c.id);
      if (c.id === activeId) prog = blankProg();
      updateTop(); toast("Progress reset"); viewParents();
    }));
    app.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => {
      const c = profiles.find(x => x.id === b.dataset.del);
      if (!confirm(`Delete ${c.name}'s profile and all progress from this device?`)) return;
      profiles = profiles.filter(x => x.id !== c.id); saveProfiles();
      remove("ns-p:" + c.id); remove("ojo-drops:" + c.id);
      if (c.id === activeId) setActive(profiles.length === 1 ? profiles[0].id : null);
      toast("Profile deleted");
      if (!profiles.length) go("#/welcome"); else viewParents();
    }));
    document.getElementById("sess").addEventListener("change", e => { settings.sessionMin = +e.target.value; saveSettings(); toast("Play time saved"); });
    document.getElementById("mute").addEventListener("change", e => { settings.mute = !e.target.checked; saveSettings(); });
    document.getElementById("calm").addEventListener("change", e => { settings.calm = e.target.checked; saveSettings(); });
    document.getElementById("sfx").addEventListener("change", e => { settings.sfx = e.target.checked; saveSettings(); if (e.target.checked) sfx.right(); });
  }

  /* ================= Learning games (from the earlier version) ================= */
  function learningDone(route) {
    if (prog.played["learn-" + route] === dayKey()) { markActive(); saveProg(); return 0; }
    prog.played["learn-" + route] = dayKey();
    const n = addDrops(DV.learning); saveProg(); return n;
  }
  function learnHead(title) {
    return `<div class="play-head"><a class="btn btn-small btn-ghost" href="#/games">← Games</a><h1>${title}</h1></div>`;
  }

  const ABC = [
    ["A", "Apple", "🍎"], ["B", "Ball", "⚽"], ["C", "Cat", "🐱"], ["D", "Dog", "🐶"], ["E", "Elephant", "🐘"],
    ["F", "Fish", "🐟"], ["G", "Grapes", "🍇"], ["H", "Hat", "🎩"], ["I", "Ice cream", "🍦"], ["J", "Jellyfish", "🪼"],
    ["K", "Kite", "🪁"], ["L", "Lion", "🦁"], ["M", "Moon", "🌙"], ["N", "Nest", "🪺"], ["O", "Owl", "🦉"],
    ["P", "Penguin", "🐧"], ["Q", "Queen", "👑"], ["R", "Rainbow", "🌈"], ["S", "Sun", "☀️"], ["T", "Turtle", "🐢"],
    ["U", "Umbrella", "☂️"], ["V", "Violin", "🎻"], ["W", "Whale", "🐳"], ["X", "Xylophone", "🎼"], ["Y", "Yo-yo", "🪀"], ["Z", "Zebra", "🦓"]
  ];
  const PALETTE = ["#ff8a80", "#ffb74d", "#ffd54f", "#aed581", "#4dd0e1", "#64b5f6", "#9575cd", "#f06292"];

  function viewAbc() {
    app.innerHTML = `${learnHead("🔤 ABC Fun")}
      <div class="tabs" role="tablist">
        <button class="tab on" data-tab="learn" role="tab" type="button">Learn</button>
        <button class="tab" data-tab="play" role="tab" type="button">Play: Find the letter</button>
      </div>
      <div id="abc-body"></div>`;
    const body = document.getElementById("abc-body");
    setupTabs({ learn, play });

    function learn() {
      body.innerHTML = `
        <p class="subtitle">Tap a letter to hear it!</p>
        <div class="letter-grid">
          ${ABC.map(([L, w, e], k) => `
            <button class="letter-card" style="--c:${PALETTE[k % PALETTE.length]}" data-k="${k}" type="button">
              <span class="letter">${L}<small>${L.toLowerCase()}</small></span>
              <span class="letter-emoji">${e}</span>
              <span class="letter-word">${w}</span>
            </button>`).join("")}
        </div>`;
      body.querySelectorAll(".letter-card").forEach(b => b.addEventListener("click", () => {
        const [L, w] = ABC[+b.dataset.k];
        b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop");
        speak(`${L}. ${L} is for ${w}`);
      }));
    }

    function play() {
      roundGame(body, () => {
        const target = pick(ABC);
        const choices = shuffle([target, ...shuffle(ABC.filter(x => x !== target)).slice(0, 3)]);
        return {
          prompt: `<span class="prompt-emoji">${target[2]}</span><p>Which letter does <b>${target[1]}</b> start with?</p>`,
          say: `Which letter does ${target[1]} start with?`,
          options: choices.map(c => c[0]), correct: target[0],
          praise: `Yes! ${target[1]} starts with ${target[0]}!`
        };
      }, play, "abc");
    }
    learn();
  }

  const COUNT_THINGS = ["🍎", "🐤", "⭐", "🎈", "🐟", "🍓", "🚗", "🌸", "🧁", "🐞"];
  const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

  function viewNumbers() {
    app.innerHTML = `${learnHead("🔢 Count with Me")}
      <div class="tabs" role="tablist">
        <button class="tab on" data-tab="learn" role="tab" type="button">Learn 1–10</button>
        <button class="tab" data-tab="count" role="tab" type="button">Play: How many?</button>
        <button class="tab" data-tab="add" role="tab" type="button">Play: Add it up</button>
      </div>
      <div id="num-body"></div>`;
    const body = document.getElementById("num-body");
    setupTabs({ learn, count, add });

    function learn() {
      body.innerHTML = `
        <p class="subtitle">Tap a number to count together!</p>
        <div class="number-grid">
          ${Array.from({ length: 10 }, (_, k) => {
            const n = k + 1, thing = COUNT_THINGS[k];
            return `<button class="number-card" style="--c:${PALETTE[k % PALETTE.length]}" data-n="${n}" type="button">
              <span class="number">${n}</span>
              <span class="number-word">${NUMBER_WORDS[n]}</span>
              <span class="number-things">${thing.repeat(n)}</span>
            </button>`;
          }).join("")}
        </div>`;
      body.querySelectorAll(".number-card").forEach(b => b.addEventListener("click", () => {
        const n = +b.dataset.n;
        b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop");
        speak(Array.from({ length: n }, (_, k) => NUMBER_WORDS[k + 1]).join(", ") + `! ${n}!`);
      }));
    }

    function count() {
      roundGame(body, () => {
        const n = rand(1, 10), thing = pick(COUNT_THINGS);
        return {
          prompt: `<div class="count-things">${Array.from({ length: n }, () => `<span>${thing}</span>`).join("")}</div><p>How many do you see?</p>`,
          say: "How many do you see?",
          options: shuffle(uniqueNear(n, 1, 10)).map(String), correct: String(n),
          praise: `Yes! ${NUMBER_WORDS[n]}!`
        };
      }, count, "numbers");
    }

    function add() {
      roundGame(body, () => {
        const a = rand(1, 5), b = rand(1, 5), thing = pick(COUNT_THINGS), sum = a + b;
        return {
          prompt: `<div class="sum">
              <span class="sum-group">${thing.repeat(a)}</span><span class="op">+</span>
              <span class="sum-group">${thing.repeat(b)}</span><span class="op">=</span><span class="op">?</span>
            </div><p><b>${a} + ${b}</b> = ?</p>`,
          say: `What is ${a} plus ${b}?`,
          options: shuffle(uniqueNear(sum, 2, 10)).map(String), correct: String(sum),
          praise: `Yes! ${a} plus ${b} is ${sum}!`
        };
      }, add, "numbers");
    }
    learn();
  }

  function uniqueNear(n, min, max) {
    const set = new Set([n]);
    while (set.size < 3) { const v = n + rand(-3, 3); if (v >= min && v <= max) set.add(v); }
    return [...set];
  }

  const SHAPES = [
    { name: "circle", svg: c => `<circle cx="50" cy="50" r="40" fill="${c}"/>` },
    { name: "square", svg: c => `<rect x="12" y="12" width="76" height="76" rx="6" fill="${c}"/>` },
    { name: "triangle", svg: c => `<polygon points="50,8 92,88 8,88" fill="${c}"/>` },
    { name: "star", svg: c => `<polygon points="50,6 61,38 95,38 67,58 78,92 50,71 22,92 33,58 5,38 39,38" fill="${c}"/>` },
    { name: "heart", svg: c => `<path d="M50 88 C10 60 4 34 22 20 C36 10 48 20 50 30 C52 20 64 10 78 20 C96 34 90 60 50 88Z" fill="${c}"/>` },
    { name: "rectangle", svg: c => `<rect x="6" y="26" width="88" height="48" rx="6" fill="${c}"/>` },
    { name: "diamond", svg: c => `<polygon points="50,6 92,50 50,94 8,50" fill="${c}"/>` },
    { name: "oval", svg: c => `<ellipse cx="50" cy="50" rx="44" ry="30" fill="${c}"/>` }
  ];
  const COLORS = [
    { name: "red", hex: "#ef4444" }, { name: "orange", hex: "#f97316" }, { name: "yellow", hex: "#facc15" },
    { name: "green", hex: "#22c55e" }, { name: "blue", hex: "#3b82f6" }, { name: "purple", hex: "#a855f7" },
    { name: "pink", hex: "#ec4899" }, { name: "brown", hex: "#92400e" }
  ];
  const shapeSvg = (s, c) => `<svg viewBox="0 0 100 100" class="shape-svg" aria-hidden="true">${s.svg(c)}</svg>`;

  function viewShapes() {
    app.innerHTML = `${learnHead("🔺 Shapes & Colors")}
      <div class="tabs" role="tablist">
        <button class="tab on" data-tab="learn" role="tab" type="button">Learn</button>
        <button class="tab" data-tab="shape" role="tab" type="button">Play: Find the shape</button>
        <button class="tab" data-tab="color" role="tab" type="button">Play: Find the color</button>
      </div>
      <div id="shape-body"></div>`;
    const body = document.getElementById("shape-body");
    setupTabs({ learn, shape: shapeGame, color: colorGame });

    function learn() {
      body.innerHTML = `
        <h2 class="section-title">Shapes</h2>
        <div class="shape-grid">
          ${SHAPES.map((s, k) => `<button class="shape-card" data-say="This is a ${s.name}" type="button">
            ${shapeSvg(s, COLORS[k % COLORS.length].hex)}<span>${s.name}</span></button>`).join("")}
        </div>
        <h2 class="section-title">Colors</h2>
        <div class="color-grid">
          ${COLORS.map(c => `<button class="color-card" style="--c:${c.hex}" data-say="${c.name}" type="button">
            <span class="swatch"></span><span>${c.name}</span></button>`).join("")}
        </div>`;
      body.querySelectorAll("[data-say]").forEach(b => b.addEventListener("click", () => {
        b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop");
        speak(b.dataset.say);
      }));
    }

    function shapeGame() {
      roundGame(body, () => {
        const target = pick(SHAPES);
        const opts = shuffle([target, ...shuffle(SHAPES.filter(s => s !== target)).slice(0, 3)]);
        return {
          prompt: `<p>Tap the <b>${target.name}</b>!</p>`, say: `Tap the ${target.name}`,
          optionsHtml: opts.map(s => ({ key: s.name, html: shapeSvg(s, pick(COLORS).hex) })),
          correct: target.name, praise: `Yes, that's the ${target.name}!`
        };
      }, shapeGame, "shapes");
    }

    function colorGame() {
      roundGame(body, () => {
        const target = pick(COLORS);
        const opts = shuffle([target, ...shuffle(COLORS.filter(c => c !== target)).slice(0, 3)]);
        const s = pick(SHAPES);
        return {
          prompt: `<p>Which one is <b>${target.name}</b>?</p>`, say: `Which one is ${target.name}?`,
          optionsHtml: opts.map(c => ({ key: c.name, html: shapeSvg(s, c.hex) })),
          correct: target.name, praise: `Yes! That's ${target.name}!`
        };
      }, colorGame, "shapes");
    }
    learn();
  }

  function setupTabs(map) {
    app.querySelectorAll(".tab[data-tab]").forEach(t => t.addEventListener("click", () => {
      stopSpeaking(); viewId++;
      app.querySelectorAll(".tab[data-tab]").forEach(x => x.classList.toggle("on", x === t));
      map[t.dataset.tab]();
    }));
  }

  /* Five rounds; a wrong answer is simply tried again. One drop for finishing, once a day per game. */
  function roundGame(body, make, restart, route) {
    const ROUNDS = 5;
    let round = 0;
    function next() {
      if (round === ROUNDS) {
        const earned = learningDone(route);
        body.innerHTML = `
          <div class="game center">
            <div class="game-cover">🏆</div>
            <h2>${esc(line("gameDone").text)}</h2>
            <p class="earned">${earned ? `${dropSvg()} +${earned} golden drop` : "You've already collected today's drop for this game."}</p>
            <button class="btn btn-big again" type="button">🔁 Play again</button>
          </div>`;
        body.querySelector(".again").addEventListener("click", restart);
        if (earned) { goldenDrops(); sfx.drops(); bumpDrops(); }
        return;
      }
      const r = make();
      const opts = r.optionsHtml
        ? r.optionsHtml.map(o => `<button class="option shape-option" data-key="${esc(o.key)}" aria-label="${esc(o.key)}" type="button">${o.html}</button>`).join("")
        : r.options.map(o => `<button class="option big" data-key="${esc(o)}" type="button">${esc(o)}</button>`).join("");
      body.innerHTML = `
        <div class="game">
          <div class="game-round">Round ${round + 1} of ${ROUNDS}</div>
          <div class="game-prompt">${r.prompt}${canSpeak ? `<button class="icon-btn" id="hear" aria-label="Hear again" type="button">🔊</button>` : ""}</div>
          <div class="options">${opts}</div>
          <div class="feedback" aria-live="polite"></div>
        </div>`;
      speak(r.say);
      const hear = document.getElementById("hear"); if (hear) hear.addEventListener("click", () => speak(r.say));
      let done = false;
      const fb = body.querySelector(".feedback");
      body.querySelectorAll(".option").forEach(b => b.addEventListener("click", () => {
        if (done) return;
        if (b.dataset.key === r.correct) {
          done = true; b.classList.add("right"); sfx.right();
          fb.textContent = "🎉 " + r.praise; speak(r.praise);
          round++; later(next, 1200);
        } else {
          b.classList.add("wrong"); b.disabled = true; sfx.wrong();
          const t = line("wrong"); fb.textContent = "🤔 " + t.text; voice(t);
        }
      }));
    }
    next();
  }

  /* ================= Start ================= */
  applySettings();
  updateTop();
  if (sess.over && active()) setTimeout(endSession, 300);
  router();
})();
