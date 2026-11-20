/* Builds RECORDING-SCRIPT.md and tools/voice-lines.json from js/content.js.
   Run from the repository root:  node tools/make-recording-script.js
   The script lists every line the app speaks that is not already in The Ojo Treasury narration,
   grouped into short sections so each section can be recorded as one audio file. */
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
guide(A4, "taskInvite", "taskPending", "taskDone", "taskDoneToday", "newSticker", "bookDrop", "chest", "garden", "gardenEmpty", "needDrops", "sessionEnd", "allDone");

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

const total = sections.reduce((n, s) => n + s.lines.length, 0);
let md = `# Recording script: Ojo's Treasure Trail

This script lists the ${total} lines the app speaks that are not already in The Ojo Treasury narration.
Lines that are in the stories (story titles, Ojo's lines from each story, "And Ojo shone gold and bright") already play in your voice.

## How to record

1. Use a quiet room and your phone's voice recorder, the same way you recorded the stories.
2. Record **one audio file per section** below, and name it with the section code (for example \`A1\`). One file can also hold several sections in order, named like \`A2-4\`.
3. Read the lines in order. Do not read the numbers. **Leave a short pause after each line** (a second is plenty).
4. If you stumble, record that whole section again. The app matches lines by their order, so a missed or repeated line moves every line after it.
5. **Part A** is Ojo's voice, as in the stories. **Part B** is the narrator's voice.
6. Where a line says "my friend", the screen shows the child's name; the recording says "my friend".
7. Send the files back in the chat. They will be cut into single lines and added to the app.

Any audio format your phone saves is fine (m4a, mp3, wav).
`;
let part = "";
sections.forEach(s => {
  const p = s.voice === "Ojo" ? "Part A: Ojo's voice" : "Part B: Narrator's voice";
  if (p !== part) { md += `\n## ${p}\n`; part = p; }
  md += `\n### ${s.code} · ${s.title} (${s.lines.length} lines)\n`;
  if (s.note) md += `\n${s.note}\n`;
  md += "\n" + s.lines.map((l, i) => `${i + 1}. ${l.text}`).join("\n") + "\n";
});
fs.writeFileSync(path.join(root, "RECORDING-SCRIPT.md"), md);
fs.writeFileSync(path.join(__dirname, "voice-lines.json"), JSON.stringify(sections.map(s => ({ code: s.code, voice: s.voice, lines: s.lines })), null, 2) + "\n");
console.log(`${sections.length} sections, ${total} lines`);
