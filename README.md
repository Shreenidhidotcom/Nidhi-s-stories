# ✨ Nidhi's Stories: Ojo's Treasure Trail

A gentle, ad-free learning web app for children aged about 3–7, built around **The Ojo Treasury** (ಓಜೋ ಕೋಶ): eight narrated stories of Ayu and her tiny golden friend Ojo. Ojo guides each child along a trail of eight stops; at every stop the child listens to a story, plays a game, and then tries the habit for real with a grown-up.

## Features

- **Child profiles (set up by a parent).** Behind a parent check, a grown-up enters the child's first name or nickname, age and (optionally) gender. Up to three children can share one device. Everything is saved on the device only.
- **The child's own character.** A layered avatar (skin, hair, hair colour, eyes, clothes, extras). Gender only sets the starting look; every look is open to every child.
- **Ojo as guide.** Ojo greets the child by name, changes the greeting with the time of day, gives hints, and cheers. Under age 6 every instruction is spoken; from 6, the child taps Ojo to hear it.
- **Home.** A scene that changes with the time of day (morning, afternoon, evening, night) with Ayu and Ojo, and Ojo greeting the child by name. One big play button for today's next step (listen, play or do), the eight drops of light found so far, and big picture tiles for Stories, Trail, Games, My drops, Ayu & Ojo and Me. Modelled on the best apps for this age: one clear next step, characters on the home screen, pictures before words.
- **A menu of every part of the app.** The bottom bar has Home, Stories, Trail, Games and Menu, with drawn icons. The Menu lists everything: for children, Meet Ayu and Ojo, Stories, Treasure Trail, Games, My golden drops and Me; for grown-ups, the readings for grown-ups, About the author and Parent Corner.
- **Meet Ayu and Ojo.** Who they are and why they matter, in short, plain sentences with a 🔊 Listen button, Ayu's family, and a fold for grown-ups explaining the names (Āyu, ojas, the eight drops). New children see it straight after Ojo first says hello.
- **Stories.** The eight stories of The Ojo Treasury, each opening the book at that story, with the golden drop the child has found in each. The book's back button returns to where the child came from.
- **For grown-ups** (behind the parent check). How the app works, what Ayu and Ojo mean, and for each story the practice, its Ayurveda name, the author's note and something to try together; a link to the book's guide on reading by age, feeding myths and when to see a doctor.
- **About the author.** Dr Shreenidhi Kalmath's photo, role, note to readers and work. Her name also appears on Meet Ayu and Ojo, Stories, For grown-ups and the Menu.
- **Plain words first.** Children's screens use plain words (Ojo, a little light, golden drops). Ayurveda terms appear only in the grown-ups' pages, including in the book, where Ojo's glow and the five gates are named in English and Kannada.
- **Sounds.** A soft tap for every button, a bright chime for a right answer and a gentle low tone for "try again", and a sparkle when drops are earned. Made by the browser, with no audio files; a grown-up can turn them off in Parent Corner.
- **Ojo's Treasure Trail** (`#/trail`). Eight stops, one per story. Each stop has three steps:
  - 🎧 **Listen**: the story in The Ojo Treasury (2 drops)
  - 🎮 **Play**: a game about the story (3 drops)
  - 🌟 **Do**: a real-life habit, confirmed by a grown-up in Parent Corner (5 drops)
- **Games.** Eight Ojo games (sort, sequence, choose, brush the teeth, "Thank you, tummy", memory pairs) plus the earlier ABC, Count with Me and Shapes & Colors games. Easier versions for ages 3–4.
- **Rewards without pressure.** Golden drops are earned, never bought. Small golden drops fall whenever a story, game or habit is finished, and **My golden drops** shows every drop ever collected in Ojo's jar; spending drops in the shop never empties it. A weekly treasure chest opens after any three active days. Stickers for habits practised on three days. A shop for avatar clothes and extras (plants bought for the old garden were refunded in drops). No hearts or lives, no leaderboards, no resetting streaks, no countdown timers.
- **Play-time limit.** After 10 minutes (parent can set 5–20), Ojo invites the child to go and try the habit for real. Only a grown-up can unlock more play.
- **Parent Corner** (🔒 in the top bar): confirm habits, manage profiles, set play time, voice, tap sounds and calm mode, privacy notes, and links to the readings for grown-ups and About the author.

## Run it

Plain HTML, CSS and JavaScript; nothing to install or build.

- Serve the folder: `python3 -m http.server 8000`, then visit http://localhost:8000
- To publish, enable **GitHub Pages** (Settings → Pages → deploy from branch, root folder).

The Ojo Treasury loads its narration with `fetch`, so open the app through a web server (or GitHub Pages) rather than by double-clicking `index.html`.

## Edit the content

Everything a child sees or hears outside the book is in `js/content.js`:

| What | Where in `js/content.js` |
| --- | --- |
| Age tiers (Ojo now; Veda and Prajñā later) | `TIERS` |
| Drops for each step | `DROP_VALUES` |
| The eight stops: titles, tasks, stickers, games | `TRAIL` |
| Game content | `GAMES` |
| Ojo's lines (`{name}` becomes the child's name) | `GUIDE` |
| Avatar parts, shop prices, chest stickers | `AVATAR`, `CHEST_STICKERS` |
| Meet Ayu and Ojo (children's words) | `INTRO` |
| The author: name, role, photo, note | `AUTHOR` |
| For grown-ups: what the names mean, and each story's practice, Ayurveda term and note | `WHY_AYU_OJO`, `GROWN` |

Ojo's lines, the tasks and the game content are drafts: send them through panel review, and add Kannada versions, before public release.

**Adding the Veda tier later:** add Veda's stories and content, set `active: true` for `veda` in `TIERS`, and give it its own trail. Children aged 8–12 currently use Ojo's stories, and Parent Corner tells their parent that their stories are coming soon.

## Voice

The app plays recorded voices, in this order:

1. **Recordings of the app's own lines** (`audio/voice/`, listed in `js/voice-files.js`): Ojo's greetings, instructions, praise and hints, and the narrator's habits, items, questions and answers. These play by themselves for every age, so each game brings new sentences rather than repeating the stories.
2. **Lines from The Ojo Treasury narration**, cut from the story recordings using the book's timings (`STORY_AUDIO` in `js/content.js`): the story title when a Trail stop opens, and Ayu's "Thank you, tummy!" in the tummy game. The story line linked to each game and Do screen is shown on screen with a 🔊 button, and plays by itself only if that screen's own line has no recording.
3. **The device's voice** for any line without a recording. These lines play by themselves under age 6; older children tap Ojo to hear them.

All 106 lines in `RECORDING-SCRIPT.md` (sections A and B) are recorded. Two of them were shortened when the garden became the jar: "I missed you, my friend!" and "Welcome back!" play the first sentence of A1-13 and A1-14. The new lines on Meet Ayu and Ojo are in `RECORDING-SCRIPT-C.md` and use the device's voice until they are recorded.

When lines are added to the app, `node tools/make-recording-script.js` writes a script of only the lines without a recording, as a new batch with the next free letter (`RECORDING-SCRIPT-D.md`, then E ...), so new files never replace earlier ones. `--all` rebuilds the complete script, for a full re-recording such as Kannada.

To add or replace recordings, run:

```
python3 tools/add-recordings.py <folder with the audio files>
```

A file's name says which sections it holds: `A1.mp3` holds section A1, and `A2-4.mp3` (or `A2-A4`, `A_2-4`) holds A2, A3 and A4 in order. The tool splits each file at every pause and matches the pieces to the script lines by sentence count, length and syllables, so short pauses are fine. It updates `js/voice-files.js`, lists any line whose length looks wrong as `CHECK`, and writes `tools/voice-check.html`, a page to listen to every line next to its text. Needs ffmpeg, numpy and scipy. If the content changes, rebuild the script first with `node tools/make-recording-script.js`.

If a story is re-recorded or re-synced in the book, copy its new timings from `NARR` in `ojo-treasury/index.html` to `STORY_AUDIO` in `js/content.js`.

## Privacy

- Profiles and progress are stored in the browser's `localStorage` on this device only. Nothing is sent to a server.
- No accounts, ads, tracking, chat, camera or microphone.
- The only outside request is for the Baloo 2 and Baloo Tamma 2 fonts from Google Fonts.

## Project structure

```
index.html       App shell: top bar, bottom tab bar, Ojo artwork
images/          Ayu, Ajji and Amma (drawn by the book) and the author's photo
css/style.css    All styles and animations
js/content.js    Trail, games, tasks, Ojo's lines, story voice lines, avatar parts, shop
js/voice-files.js  Recordings of the app's own lines (filled by tools/add-recordings.py)
js/app.js        Profiles, parent check, voice, router, trail, games, rewards, Parent Corner
ojo-treasury/    The Ojo Treasury book (self-contained page + narration audio)
tools/           Recording script builder and recording cutter
RECORDING-SCRIPT.md  The first batch of recorded lines (sections A and B)
RECORDING-SCRIPT-C.md  New lines to record (Meet Ayu and Ojo)
```

The book saves the drops of light a child collects under `ojo-drops:<child id>`; the app reads these to tick each stop's Listen step. Progress from the earlier version of the app (stars and book drops) is moved into the first child's profile automatically.
