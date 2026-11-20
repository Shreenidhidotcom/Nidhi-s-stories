/* Builds a recording script from js/content.js.
   Run from the repository root:  node tools/make-recording-script.js
   It lists the lines the app speaks that have no recording yet, as a new batch
   (RECORDING-SCRIPT-<letter>.md and tools/voice-lines-<letter>.json), grouped into short sections
   so each section can be recorded as one audio file. The first batch (sections A and B) is
   RECORDING-SCRIPT.md and tools/voice-lines.json. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "js/content.js"), "utf8"), ctx);
const { GUIDE, GAMES, TRAIL } = ctx.window;

const forRecording = t => t.replace(/\bHello \{name\}/g, "Hello, {name}").replace(/\{name\}/g, "my friend");
const noEmoji = t => t.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}️‍]/gu, "").trim();

const sections = [];
function section(code, title, voice, note) { const s = { code, title, voice, note, lines: [] }; sections.push(s); return s; }
function add(sec, text, id) {
  const found = sec.lines.find(l => l.text === text);
  if (found) found.ids.push(id); else sec.lines.push({ text, ids: [id] });
}
function guide(sec, ...moments) { moments.forEach(m => GUIDE[m].forEach((t, i) => add(sec, forRecording(t), `ojo.${m}.${i + 1}`))); }

const A1 = section("A1", "Hello and welcome", "Ojo");
guide(A1, "firstMeet", "welcome", "morning", "afternoon", "evening", "returnAfterBreak");
const A2 = section("A2", "Well done and try again", "Ojo");
guide(A2, "correct", "wrong", "sortHint", "seqHint", "seqGlow", "teethClean", "pairMatch", "gameDone");
const A3 = section("A3", "Game instructions", "Ojo");
Object.keys(GAMES).forEach(k => { if (GAMES[k].prompt) add(A3, GAMES[k].prompt, `game.${k}.prompt`); });
guide(A3, "tummyComfy", "tummyFull", "tummyHungry");
const A4 = section("A4", "Habits and rewards", "Ojo");
guide(A4, "taskInvite", "taskPending", "taskDone", "taskDoneToday", "newSticker", "bookDrop", "chest", "jar", "jarEmpty", "needDrops", "sessionEnd", "allDone");

const B1 = section("B1", "Today's habits", "Narrator");
TRAIL.forEach(s => add(B1, s.task, `task.${s.n}`));
const B2 = section("B2", "Things to tap", "Narrator", "Short and clear, one or two words each.");
Object.keys(GAMES).forEach(k => (GAMES[k].items || []).forEach((it, i) => add(B2, it.l, `game.${k}.item.${i + 1}`)));
const B3 = section("B3", "Steps in order", "Narrator", "Short and clear, one or two words each.");
Object.keys(GAMES).forEach(k => (GAMES[k].steps || []).forEach((st, i) => add(B3, st.l, `game.${k}.step.${i + 1}`)));
Object.keys(GAMES).filter(k => GAMES[k].rounds).forEach((k, gi) => {
  const sec = section(`B${4 + gi}`, `${GAMES[k].title}: questions and answers`, "Narrator");
  GAMES[k].rounds.forEach((r, ri) => {
    add(sec, r.q, `game.${k}.q${ri + 1}`);
    r.options.forEach((o, oi) => add(sec, noEmoji(o), `game.${k}.q${ri + 1}.opt${oi + 1}`));
  });
});

/* Narrator: the Meet Ayu and Ojo page */
const C1 = section("C1", "Meet Ayu and Ojo", "Narrator", "Slow and warm, like the start of a story.");
const { INTRO } = ctx.window;
["ayu", "ojo", "why"].forEach(k => INTRO[k].forEach((t, i) => add(C1, t, `intro.${k}.${i + 1}`)));

/* Default: a script of only the lines that have no recording yet, as a new batch with the next free letter,
   so its files never overwrite earlier ones (A and B were the first batch).
   --all: rebuild the complete script (RECORDING-SCRIPT.md); only for starting a full re-recording, such as Kannada. */
const vctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "js/voice-files.js"), "utf8"), vctx);
const VOICE_FILES = vctx.window.VOICE_FILES || {};

function write(list, mdPath, jsonPath, intro) {
  const total = list.reduce((n, s) => n + s.lines.length, 0);
  let md = `# Recording script${intro.title}

${intro.text.replace("{total}", total)}

## How to record

1. Use a quiet room and your phone's voice recorder, the same way you recorded the stories.
2. Record **one audio file per section** below, and name it with the section code (for example \`${list[0].code}\`). One file can also hold several sections in order, named like \`${list[0].code[0]}1-3\`.
3. Read the lines in order. Do not read the numbers. **Leave a short pause after each line** (a second is plenty).
4. If you stumble, record that whole section again. The app matches lines by their order, so a missed or repeated line moves every line after it.
5. Ojo's sections are in Ojo's voice, as in the stories. The narrator's sections are in the narrator's voice.
6. Where a line says "my friend", the screen shows the child's name; the recording says "my friend".
7. Send the files back in the chat. They will be cut into single lines and added to the app.

Any audio format your phone saves is fine (m4a, mp3, wav).
`;
  list.forEach(s => {
    md += `\n## ${s.code} · ${s.title} (${s.lines.length} lines, ${s.voice}'s voice)\n`;
    if (s.note) md += `\n${s.note}\n`;
    md += "\n" + s.lines.map((l, i) => `${i + 1}. ${l.text}`).join("\n") + "\n";
  });
  fs.writeFileSync(mdPath, md);
  fs.writeFileSync(jsonPath, JSON.stringify(list.map(s => ({ code: s.code, voice: s.voice, lines: s.lines })), null, 2) + "\n");
  console.log(`${path.basename(mdPath)}: ${list.length} sections, ${total} lines`);
}

if (process.argv.includes("--all")) {
  write(sections, path.join(root, "RECORDING-SCRIPT.md"), path.join(__dirname, "voice-lines.json"),
    { title: ": Ojo's Treasure Trail", text: "This script lists the {total} lines the app speaks that are not already in The Ojo Treasury narration." });
} else {
  const used = new Set(fs.readdirSync(path.join(root, "audio", "voice")).map(f => f[0]));
  fs.readdirSync(__dirname).forEach(f => { const m = /^voice-lines-([A-Z])\.json$/.exec(f); if (m) used.add(m[1]); });
  let letter = "C"; while (used.has(letter)) letter = String.fromCharCode(letter.charCodeAt(0) + 1);
  const missing = sections.map(s => ({ ...s, lines: s.lines.filter(l => !l.ids.some(id => VOICE_FILES[id])) })).filter(s => s.lines.length);
  if (!missing.length) { console.log("Every line has a recording. Nothing to record."); process.exit(0); }
  missing.forEach((s, i) => { s.code = `${letter}${i + 1}`; });
  write(missing, path.join(root, `RECORDING-SCRIPT-${letter}.md`), path.join(__dirname, `voice-lines-${letter}.json`),
    { title: `, batch ${letter}: new lines`, text: "These {total} lines are new in the app and have no recording yet. Until they are recorded, the device's voice reads them." });
}
