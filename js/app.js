(function () {
  "use strict";

  const app = document.getElementById("app");
  const STORIES = window.STORIES || [];

  /* ---------------- Progress (saved in the browser) ---------------- */
  const KEY = "nidhis-stories-progress-v1";
  const progress = Object.assign(
    { stars: 0, read: {}, quizBest: {}, lastStory: null, lastPage: 0 },
    safeParse(localStorage.getItem(KEY))
  );
  function safeParse(s) { try { return JSON.parse(s) || {}; } catch (e) { return {}; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch (e) { /* ignore */ } updateStars(); }
  function addStars(n) { progress.stars += n; save(); bounceStars(); }
  function updateStars() { document.getElementById("star-count").textContent = progress.stars; }
  function bounceStars() {
    const el = document.querySelector(".stars");
    el.classList.remove("bounce"); void el.offsetWidth; el.classList.add("bounce");
  }

  /* ---------------- Helpers ---------------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  let toastTimer;
  function toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
  }

  function confetti() {
    const box = document.createElement("div");
    box.className = "confetti";
    const bits = ["⭐", "🎉", "✨", "🌟", "🎈"];
    for (let i = 0; i < 24; i++) {
      const s = document.createElement("span");
      s.textContent = pick(bits);
      s.style.left = Math.random() * 100 + "vw";
      s.style.animationDelay = Math.random() * 0.6 + "s";
      s.style.fontSize = rand(18, 36) + "px";
      box.appendChild(s);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 2600);
  }

  /* ---------------- Read aloud (Web Speech API) ---------------- */
  const canSpeak = "speechSynthesis" in window;
  let voice = null;
  function chooseVoice() {
    if (!canSpeak) return;
    const voices = speechSynthesis.getVoices();
    voice = voices.find(v => /en[-_](US|GB|IN)/i.test(v.lang) && /female|samantha|google/i.test(v.name))
      || voices.find(v => /^en/i.test(v.lang)) || null;
  }
  if (canSpeak) { chooseVoice(); speechSynthesis.onvoiceschanged = chooseVoice; }

  function speak(text, onEnd) {
    if (!canSpeak) { if (onEnd) onEnd(); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.rate = 0.9; u.pitch = 1.1;
    if (onEnd) u.onend = onEnd;
    speechSynthesis.speak(u);
  }
  function stopSpeaking() { if (canSpeak) speechSynthesis.cancel(); }

  /* ---------------- Router ---------------- */
  const routes = {
    "": viewHome,
    "stories": viewStories,
    "story": viewStory,
    "quiz": viewQuiz,
    "abc": viewAbc,
    "numbers": viewNumbers,
    "shapes": viewShapes,
    "grownups": viewGrownups
  };

  function router() {
    stopSpeaking();
    cleanup();
    const parts = location.hash.replace(/^#\/?/, "").split("/");
    const name = parts[0] || "";
    const view = routes[name] || viewHome;
    document.querySelectorAll("[data-nav]").forEach(a =>
      a.classList.toggle("active", a.dataset.nav === name || (name === "story" && a.dataset.nav === "stories") || (name === "quiz" && a.dataset.nav === "stories")));
    view(parts.slice(1));
    app.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  // Delayed callbacks are dropped if the user has moved to another view/tab meanwhile.
  let viewId = 0;
  function later(fn, ms) { const id = viewId; setTimeout(() => { if (id === viewId) fn(); }, ms); }

  let cleanups = [];
  function onCleanup(fn) { cleanups.push(fn); }
  function cleanup() { viewId++; cleanups.forEach(f => f()); cleanups = []; }

  window.addEventListener("hashchange", router);

  /* ---------------- Views ---------------- */
  function viewHome() {
    const last = STORIES.find(s => s.id === progress.lastStory);
    const readCount = Object.keys(progress.read).length;
    app.innerHTML = `
      <section class="hero">
        <div class="hero-text">
          <h1>Hello, little reader! 👋</h1>
          <p>Read magical stories, play learning games and collect shiny stars.</p>
          <div class="hero-actions">
            <a class="btn btn-big" href="#/stories">📖 Start Reading</a>
            ${last ? `<a class="btn btn-big btn-alt" href="#/story/${last.id}/${progress.lastPage}">↪ Continue “${esc(last.title)}”</a>` : ""}
          </div>
        </div>
        <div class="hero-art" aria-hidden="true">
          <span class="float f1">🦉</span><span class="float f2">📚</span><span class="float f3">🌈</span><span class="float f4">⭐</span>
        </div>
      </section>

      <section class="tiles">
        <a class="tile" href="#/stories" style="--c:#ffb347">
          <span class="tile-icon">📖</span><h2>Story Books</h2><p>${readCount} of ${STORIES.length} read</p>
        </a>
        <a class="tile" href="#/abc" style="--c:#ff7eb3">
          <span class="tile-icon">🔤</span><h2>ABC Fun</h2><p>Letters & sounds</p>
        </a>
        <a class="tile" href="#/numbers" style="--c:#6fc3ff">
          <span class="tile-icon">🔢</span><h2>Count with Me</h2><p>Numbers 1–10</p>
        </a>
        <a class="tile" href="#/shapes" style="--c:#8ee08e">
          <span class="tile-icon">🔺</span><h2>Shapes & Colors</h2><p>Look and tap</p>
        </a>
      </section>`;
  }

  function viewStories() {
    app.innerHTML = `
      <h1 class="page-title">📖 Story Books</h1>
      <p class="subtitle">Pick a book to read. Finish it and take the quiz to earn stars!</p>
      <div class="shelf">
        ${STORIES.map(s => {
          const best = progress.quizBest[s.id];
          return `
          <a class="book" href="#/story/${s.id}" style="--c:${s.color}">
            <div class="book-cover"><span>${s.cover}</span></div>
            <div class="book-info">
              <h2>${esc(s.title)}</h2>
              <div class="tags"><span class="tag">Ages ${esc(s.age)}</span><span class="tag">${esc(s.theme)}</span></div>
              <div class="book-status">
                ${progress.read[s.id] ? `<span class="done">✅ Read</span>` : `<span class="new">✨ New</span>`}
                ${best != null ? `<span class="best">${"⭐".repeat(best)}${"☆".repeat(s.quiz.length - best)}</span>` : ""}
              </div>
            </div>
          </a>`;
        }).join("")}
      </div>`;
  }

  function viewStory([id, pageStr]) {
    const story = STORIES.find(s => s.id === id);
    if (!story) { location.hash = "#/stories"; return; }
    const total = story.pages.length + 1; // +1 for the "The End" page
    let page = Math.min(Math.max(parseInt(pageStr, 10) || 0, 0), total - 1);
    let autoRead = false;

    app.innerHTML = `
      <div class="reader">
        <div class="reader-head">
          <a class="btn btn-small btn-ghost" href="#/stories">← Library</a>
          <h1>${esc(story.title)}</h1>
          <div class="reader-tools">
            ${canSpeak ? `<button class="btn btn-small" id="read-btn" aria-pressed="false">🔊 Read to me</button>` : ""}
          </div>
        </div>
        <div class="book-page-wrap">
          <button class="arrow" id="prev" aria-label="Previous page">‹</button>
          <article class="book-page" id="book-page" aria-live="polite"></article>
          <button class="arrow" id="next" aria-label="Next page">›</button>
        </div>
        <div class="dots" id="dots"></div>
      </div>`;

    const pageEl = document.getElementById("book-page");
    const dotsEl = document.getElementById("dots");
    const readBtn = document.getElementById("read-btn");

    function render(dir) {
      progress.lastStory = story.id; progress.lastPage = page;
      if (page === total - 1 && !progress.read[story.id]) {
        progress.read[story.id] = true; addStars(1); toast("You finished the book! +1 ⭐");
      }
      save();
      history.replaceState(null, "", `#/story/${story.id}/${page}`);

      pageEl.classList.remove("turn-left", "turn-right"); void pageEl.offsetWidth;
      if (dir) pageEl.classList.add(dir > 0 ? "turn-right" : "turn-left");

      if (page < story.pages.length) {
        const p = story.pages[page];
        pageEl.style.background = p.bg;
        pageEl.classList.toggle("dark", !!p.dark);
        pageEl.innerHTML = `
          <div class="scene" aria-hidden="true">${p.scene}</div>
          <p class="story-text">${highlightWords(esc(p.text), story.words)}</p>
          <div class="page-num">Page ${page + 1} of ${story.pages.length}</div>`;
        pageEl.querySelectorAll(".vocab").forEach(w => w.addEventListener("click", () => {
          const item = story.words.find(x => x.word.toLowerCase() === w.dataset.word);
          if (item) { toast(`${item.word}: ${item.meaning}`); speak(`${item.word}. ${item.meaning}`); }
        }));
      } else {
        pageEl.style.background = "#fff8e6";
        pageEl.classList.remove("dark");
        pageEl.innerHTML = `
          <div class="scene small" aria-hidden="true">🎉 ${story.cover} 🎉</div>
          <h2 class="the-end">The End</h2>
          <p class="moral"><strong>Lesson:</strong> ${esc(story.moral)}</p>
          <div class="word-box">
            <h3>📝 New words</h3>
            <ul>${story.words.map(w => `<li><button class="word-chip" data-say="${esc(w.word + ". " + w.meaning)}"><b>${esc(w.word)}</b> – ${esc(w.meaning)}</button></li>`).join("")}</ul>
          </div>
          <div class="end-actions">
            <a class="btn btn-big" href="#/quiz/${story.id}">🧠 Take the Quiz</a>
            <button class="btn btn-alt" id="again">🔁 Read again</button>
          </div>`;
        pageEl.querySelectorAll(".word-chip").forEach(b => b.addEventListener("click", () => speak(b.dataset.say)));
        document.getElementById("again").addEventListener("click", () => go(-page));
      }

      document.getElementById("prev").disabled = page === 0;
      document.getElementById("next").disabled = page === total - 1;
      dotsEl.innerHTML = Array.from({ length: total }, (_, i) =>
        `<button class="dot ${i === page ? "on" : ""}" aria-label="Go to page ${i + 1}" data-i="${i}"></button>`).join("");
      dotsEl.querySelectorAll(".dot").forEach(d => d.addEventListener("click", () => go(+d.dataset.i - page)));

      if (autoRead) readCurrent();
    }

    function readCurrent() {
      const text = page < story.pages.length
        ? story.pages[page].text
        : `The End. The lesson is: ${story.moral}`;
      speak(text, () => {
        if (autoRead && page < total - 1) later(() => { if (autoRead) go(1); }, 700);
        else if (autoRead) setAuto(false);
      });
    }

    function setAuto(on) {
      autoRead = on;
      if (readBtn) {
        readBtn.setAttribute("aria-pressed", String(on));
        readBtn.textContent = on ? "⏸ Stop reading" : "🔊 Read to me";
      }
      if (on) readCurrent(); else stopSpeaking();
    }

    function go(delta) {
      const next = page + delta;
      if (next < 0 || next >= total || delta === 0) return;
      stopSpeaking();
      page = next;
      render(delta);
    }

    document.getElementById("prev").addEventListener("click", () => go(-1));
    document.getElementById("next").addEventListener("click", () => go(1));
    if (readBtn) readBtn.addEventListener("click", () => setAuto(!autoRead));

    const onKey = e => {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);

    let startX = null;
    const onStart = e => { startX = e.touches[0].clientX; };
    const onEnd = e => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      startX = null;
    };
    pageEl.addEventListener("touchstart", onStart, { passive: true });
    pageEl.addEventListener("touchend", onEnd);

    onCleanup(() => { autoRead = false; document.removeEventListener("keydown", onKey); });
    render(0);
  }

  function highlightWords(html, words) {
    words.forEach(w => {
      const re = new RegExp(`\\b(${w.word})\\b`, "i");
      html = html.replace(re, `<button class="vocab" data-word="${w.word.toLowerCase()}" title="Tap to learn this word">$1</button>`);
    });
    return html;
  }

  function viewQuiz([id]) {
    const story = STORIES.find(s => s.id === id);
    if (!story) { location.hash = "#/stories"; return; }
    let i = 0, score = 0, locked = false;
    const questions = story.quiz.map(q => {
      const order = shuffle(q.options.map((_, k) => k));
      return { q: q.q, options: order.map(k => q.options[k]), answer: order.indexOf(q.answer) };
    });

    function render() {
      if (i >= questions.length) return finish();
      const q = questions[i];
      locked = false;
      app.innerHTML = `
        <div class="quiz">
          <a class="btn btn-small btn-ghost" href="#/story/${story.id}">← Back to book</a>
          <div class="quiz-card">
            <div class="quiz-progress">Question ${i + 1} of ${questions.length}</div>
            <div class="quiz-cover" aria-hidden="true">${story.cover}</div>
            <h2>${esc(q.q)} ${canSpeak ? `<button class="icon-btn" id="say-q" aria-label="Read question">🔊</button>` : ""}</h2>
            <div class="options">
              ${q.options.map((o, k) => `<button class="option" data-k="${k}">${esc(o)}</button>`).join("")}
            </div>
            <div class="feedback" id="feedback" aria-live="polite"></div>
          </div>
        </div>`;
      const sayQ = document.getElementById("say-q");
      if (sayQ) sayQ.addEventListener("click", () => speak(q.q + " " + q.options.join(", or ")));
      app.querySelectorAll(".option").forEach(b => b.addEventListener("click", () => answer(b, +b.dataset.k)));
    }

    function answer(btn, k) {
      if (locked) return;
      const q = questions[i];
      const fb = document.getElementById("feedback");
      if (k === q.answer) {
        locked = true;
        btn.classList.add("right");
        if (!q.missed) score++;
        const msg = pick(["Great job!", "You got it!", "Super!", "Well done!"]);
        fb.textContent = "🎉 " + msg; speak(msg);
        later(() => { i++; render(); }, 1300);
      } else {
        btn.classList.add("wrong"); btn.disabled = true;
        fb.textContent = "🤔 Not quite — try again!"; speak("Try again!");
        q.missed = true; // only first-try answers count for stars
      }
    }

    function finish() {
      const prev = progress.quizBest[story.id];
      const gained = Math.max(0, score - (prev || 0));
      if (prev == null || score > prev) progress.quizBest[story.id] = score;
      if (gained) addStars(gained); else save();
      if (score === questions.length) confetti();
      const msg = score === questions.length ? "Perfect score! You are a super reader!" : score > 0 ? "Nice work! Keep reading!" : "Good try! Read the story again and try once more.";
      speak(msg);
      app.innerHTML = `
        <div class="quiz">
          <div class="quiz-card center">
            <div class="quiz-cover" aria-hidden="true">🏅</div>
            <h2>${esc(msg)}</h2>
            <p class="big-stars">${"⭐".repeat(score)}${"☆".repeat(questions.length - score)}</p>
            <p>You got <b>${score}</b> of <b>${questions.length}</b> right on the first try${gained ? ` and earned <b>${gained}</b> new star${gained > 1 ? "s" : ""}!` : "."}</p>
            <div class="end-actions">
              <a class="btn" href="#/quiz/${story.id}" id="retry">🔁 Try again</a>
              <a class="btn btn-alt" href="#/stories">📚 More stories</a>
            </div>
          </div>
        </div>`;
      document.getElementById("retry").addEventListener("click", e => { e.preventDefault(); router(); });
    }

    render();
  }

  /* ---------------- ABC ---------------- */
  const ABC = [
    ["A", "Apple", "🍎"], ["B", "Ball", "⚽"], ["C", "Cat", "🐱"], ["D", "Dog", "🐶"], ["E", "Elephant", "🐘"],
    ["F", "Fish", "🐟"], ["G", "Grapes", "🍇"], ["H", "Hat", "🎩"], ["I", "Ice cream", "🍦"], ["J", "Jellyfish", "🪼"],
    ["K", "Kite", "🪁"], ["L", "Lion", "🦁"], ["M", "Moon", "🌙"], ["N", "Nest", "🪺"], ["O", "Owl", "🦉"],
    ["P", "Penguin", "🐧"], ["Q", "Queen", "👑"], ["R", "Rainbow", "🌈"], ["S", "Sun", "☀️"], ["T", "Turtle", "🐢"],
    ["U", "Umbrella", "☂️"], ["V", "Violin", "🎻"], ["W", "Whale", "🐳"], ["X", "Xylophone", "🎼"], ["Y", "Yo-yo", "🪀"], ["Z", "Zebra", "🦓"]
  ];
  const PALETTE = ["#ff8a80", "#ffb74d", "#ffd54f", "#aed581", "#4dd0e1", "#64b5f6", "#9575cd", "#f06292"];

  function viewAbc() {
    app.innerHTML = `
      <h1 class="page-title">🔤 ABC Fun</h1>
      <div class="tabs" role="tablist">
        <button class="tab on" data-tab="learn" role="tab">Learn</button>
        <button class="tab" data-tab="play" role="tab">Play: Find the letter</button>
      </div>
      <div id="abc-body"></div>`;
    const body = document.getElementById("abc-body");
    setupTabs({ learn: learn, play: play });

    function learn() {
      body.innerHTML = `
        <p class="subtitle">Tap a letter to hear it!</p>
        <div class="letter-grid">
          ${ABC.map(([L, w, e], k) => `
            <button class="letter-card" style="--c:${PALETTE[k % PALETTE.length]}" data-k="${k}">
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
      let round = 0, correct = 0;
      function next() {
        if (round === 5) {
          const won = correct;
          if (won) addStars(won);
          if (won === 5) confetti();
          body.innerHTML = gameDone(`You found ${correct} of 5 letters!`, won);
          body.querySelector(".again").addEventListener("click", play);
          return;
        }
        const target = pick(ABC);
        const choices = shuffle([target, ...shuffle(ABC.filter(x => x !== target)).slice(0, 3)]);
        let firstTry = true;
        body.innerHTML = `
          <div class="game">
            <div class="game-round">Round ${round + 1} of 5</div>
            <div class="game-prompt">
              <span class="prompt-emoji">${target[2]}</span>
              <p>Which letter does <b>${target[1]}</b> start with?</p>
              ${canSpeak ? `<button class="icon-btn" id="hear">🔊</button>` : ""}
            </div>
            <div class="options letters">
              ${choices.map(c => `<button class="option big" data-l="${c[0]}">${c[0]}</button>`).join("")}
            </div>
            <div class="feedback" aria-live="polite"></div>
          </div>`;
        const ask = () => speak(`Which letter does ${target[1]} start with?`);
        ask();
        const hear = document.getElementById("hear"); if (hear) hear.addEventListener("click", ask);
        handleOptions(body, b => b.dataset.l === target[0], ok => {
          if (ok) { if (firstTry) correct++; round++; later(next, 1100); }
          else firstTry = false;
        });
      }
      next();
    }
    learn();
  }

  /* ---------------- Numbers ---------------- */
  const COUNT_THINGS = ["🍎", "🐤", "⭐", "🎈", "🐟", "🍓", "🚗", "🌸", "🧁", "🐞"];
  const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

  function viewNumbers() {
    app.innerHTML = `
      <h1 class="page-title">🔢 Count with Me</h1>
      <div class="tabs" role="tablist">
        <button class="tab on" data-tab="learn" role="tab">Learn 1–10</button>
        <button class="tab" data-tab="count" role="tab">Play: How many?</button>
        <button class="tab" data-tab="add" role="tab">Play: Add it up</button>
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
            return `<button class="number-card" style="--c:${PALETTE[k % PALETTE.length]}" data-n="${n}">
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
        const opts = shuffle(uniqueNear(n, 1, 10));
        return {
          prompt: `<div class="count-things">${Array.from({ length: n }, () => `<span>${thing}</span>`).join("")}</div><p>How many do you see?</p>`,
          say: "How many do you see?",
          options: opts.map(String), correct: String(n),
          praise: `Yes! ${NUMBER_WORDS[n]}!`
        };
      }, count);
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
      }, add);
    }
    learn();
  }

  function uniqueNear(n, min, max) {
    const set = new Set([n]);
    while (set.size < 3) {
      const v = n + rand(-3, 3);
      if (v >= min && v <= max) set.add(v);
    }
    return [...set];
  }

  /* ---------------- Shapes & colors ---------------- */
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
    app.innerHTML = `
      <h1 class="page-title">🔺 Shapes & Colors</h1>
      <div class="tabs" role="tablist">
        <button class="tab on" data-tab="learn" role="tab">Learn</button>
        <button class="tab" data-tab="shape" role="tab">Play: Find the shape</button>
        <button class="tab" data-tab="color" role="tab">Play: Find the color</button>
      </div>
      <div id="shape-body"></div>`;
    const body = document.getElementById("shape-body");
    setupTabs({ learn, shape: shapeGame, color: colorGame });

    function learn() {
      body.innerHTML = `
        <h2 class="section-title">Shapes</h2>
        <div class="shape-grid">
          ${SHAPES.map((s, k) => `<button class="shape-card" data-say="This is a ${s.name}">
            ${shapeSvg(s, COLORS[k % COLORS.length].hex)}<span>${s.name}</span></button>`).join("")}
        </div>
        <h2 class="section-title">Colors</h2>
        <div class="color-grid">
          ${COLORS.map(c => `<button class="color-card" style="--c:${c.hex}" data-say="${c.name}">
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
          prompt: `<p>Tap the <b>${target.name}</b>!</p>`,
          say: `Tap the ${target.name}`,
          optionsHtml: opts.map(s => ({ key: s.name, html: shapeSvg(s, pick(COLORS).hex) })),
          correct: target.name,
          praise: `Yes, that's the ${target.name}!`
        };
      }, shapeGame);
    }

    function colorGame() {
      roundGame(body, () => {
        const target = pick(COLORS);
        const opts = shuffle([target, ...shuffle(COLORS.filter(c => c !== target)).slice(0, 3)]);
        const s = pick(SHAPES);
        return {
          prompt: `<p>Which one is <b>${target.name}</b>?</p>`,
          say: `Which one is ${target.name}?`,
          optionsHtml: opts.map(c => ({ key: c.name, html: shapeSvg(s, c.hex) })),
          correct: target.name,
          praise: `Yes! That's ${target.name}!`
        };
      }, colorGame);
    }
    learn();
  }

  /* ---------------- Grown-ups ---------------- */
  function viewGrownups() {
    app.innerHTML = `
      <div class="panel">
        <h1 class="page-title">👨‍👩‍👧 For Grown-ups</h1>
        <p>Nidhi's Stories is a gentle, ad-free learning space for children aged about 3–7.</p>
        <ul class="list">
          <li><b>Story Books</b> – illustrated picture books with read-aloud narration, tap-to-learn vocabulary words, a lesson at the end, and a short comprehension quiz.</li>
          <li><b>ABC Fun</b> – letters with phonics-style “A is for Apple” prompts and a letter-finding game.</li>
          <li><b>Count with Me</b> – counting 1–10 and simple addition with pictures.</li>
          <li><b>Shapes & Colors</b> – recognising common shapes and colors.</li>
        </ul>
        <p>Progress and stars are stored only in this browser (no accounts, no tracking). Read-aloud uses your device's built-in voice.</p>
        <h2 class="section-title">Progress</h2>
        <p>⭐ Stars: <b>${progress.stars}</b> · 📖 Books read: <b>${Object.keys(progress.read).length} / ${STORIES.length}</b></p>
        <button class="btn btn-alt" id="reset">Reset progress</button>
      </div>`;
    document.getElementById("reset").addEventListener("click", () => {
      if (!confirm("Reset all stars and reading progress?")) return;
      Object.assign(progress, { stars: 0, read: {}, quizBest: {}, lastStory: null, lastPage: 0 });
      save(); toast("Progress reset"); viewGrownups();
    });
  }

  /* ---------------- Shared game helpers ---------------- */
  function setupTabs(map) {
    app.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => {
      stopSpeaking(); viewId++;
      app.querySelectorAll(".tab").forEach(x => x.classList.toggle("on", x === t));
      map[t.dataset.tab]();
    }));
  }

  function handleOptions(root, isRight, after) {
    let done = false;
    const fb = root.querySelector(".feedback");
    root.querySelectorAll(".option").forEach(b => b.addEventListener("click", () => {
      if (done) return;
      if (isRight(b)) {
        done = true; b.classList.add("right");
        const msg = b.dataset.praise || pick(["Great job!", "Yay!", "Super!", "You did it!"]);
        fb.textContent = "🎉 " + msg; speak(msg);
        after(true);
      } else {
        b.classList.add("wrong"); b.disabled = true;
        fb.textContent = "🤔 Try again!"; speak("Try again!");
        after(false);
      }
    }));
  }

  // Generic 5-round game: make() returns a round description.
  function roundGame(body, make, restart) {
    const ROUNDS = 5;
    let round = 0, correct = 0;
    function next() {
      if (round === ROUNDS) {
        if (correct) addStars(correct);
        if (correct === ROUNDS) confetti();
        body.innerHTML = gameDone(`You got ${correct} of ${ROUNDS} on the first try!`, correct);
        body.querySelector(".again").addEventListener("click", restart);
        return;
      }
      const r = make();
      let firstTry = true;
      const opts = r.optionsHtml
        ? r.optionsHtml.map(o => `<button class="option shape-option" data-key="${esc(o.key)}" aria-label="${esc(o.key)}">${o.html}</button>`).join("")
        : r.options.map(o => `<button class="option big" data-key="${esc(o)}">${esc(o)}</button>`).join("");
      body.innerHTML = `
        <div class="game">
          <div class="game-round">Round ${round + 1} of ${ROUNDS}</div>
          <div class="game-prompt">${r.prompt}${canSpeak ? `<button class="icon-btn" id="hear" aria-label="Hear again">🔊</button>` : ""}</div>
          <div class="options">${opts}</div>
          <div class="feedback" aria-live="polite"></div>
        </div>`;
      body.querySelectorAll(".option").forEach(b => { if (b.dataset.key === r.correct) b.dataset.praise = r.praise; });
      speak(r.say);
      const hear = document.getElementById("hear"); if (hear) hear.addEventListener("click", () => speak(r.say));
      handleOptions(body, b => b.dataset.key === r.correct, ok => {
        if (ok) { if (firstTry) correct++; round++; later(next, 1200); }
        else firstTry = false;
      });
    }
    next();
  }

  function gameDone(text, stars) {
    return `
      <div class="game center">
        <div class="quiz-cover" aria-hidden="true">🏆</div>
        <h2>${esc(text)}</h2>
        <p class="big-stars">${"⭐".repeat(stars) || "💪"}</p>
        <p>${stars ? `+${stars} star${stars > 1 ? "s" : ""} added!` : "Keep practising — you're getting better!"}</p>
        <button class="btn btn-big again">🔁 Play again</button>
      </div>`;
  }

  /* ---------------- Start ---------------- */
  updateStars();
  router();
})();
