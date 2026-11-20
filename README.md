# ✨ Nidhi's Stories: Ojo's Treasure Trail

A gentle, ad-free learning web app for children aged about 3–7, built around **The Ojo Treasury** (ಓಜೋ ಕೋಶ): eight narrated stories of Ayu and her tiny golden friend Ojo. Ojo guides each child along a trail of eight stops; at every stop the child listens to a story, plays a game, and then tries the habit for real with a grown-up.

## Features

- **Child profiles (set up by a parent).** Behind a parent check, a grown-up enters the child's first name or nickname, age and (optionally) gender. Up to three children can share one device. Everything is saved on the device only.
- **The child's own character.** A layered avatar (skin, hair, hair colour, eyes, clothes, extras). Gender only sets the starting look; every look is open to every child.
- **Ojo as guide.** Ojo greets the child by name, changes the greeting with the time of day, gives hints, and cheers. Under age 6 every instruction is spoken; from 6, the child taps Ojo to hear it.
- **Ojo's Treasure Trail (home).** Eight stops, one per story. Each stop has three steps:
  - 🎧 **Listen**: the story in The Ojo Treasury (2 drops)
  - 🎮 **Play**: a game about the story (3 drops)
  - 🌟 **Do**: a real-life habit, confirmed by a grown-up in Parent Corner (5 drops)
- **Games.** Eight Ojo games (sort, sequence, choose, brush the teeth, "Thank you, tummy", memory pairs) plus the earlier ABC, Count with Me and Shapes & Colors games. Easier versions for ages 3–4.
- **Rewards without pressure.** Ojas drops are earned, never bought. A habit garden grows one flower per active day and never wilts. A weekly treasure chest opens after any three active days. Stickers for habits practised on three days. A shop for avatar clothes and garden plants. No hearts or lives, no leaderboards, no resetting streaks, no countdown timers.
- **Play-time limit.** After 10 minutes (parent can set 5–20), Ojo invites the child to go and try the habit for real. Only a grown-up can unlock more play.
- **Parent Corner** (🔒 in the top bar): confirm habits, manage profiles, set play time, sound and calm mode, privacy notes, and a link to the book's notes for grown-ups.

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
| Avatar parts, shop prices, plants, chest stickers | `AVATAR`, `PLANTS`, `CHEST_STICKERS` |

Ojo's lines, the tasks and the game content are drafts: send them through panel review, and add Kannada versions, before public release.

**Adding the Veda tier later:** add Veda's stories and content, set `active: true` for `veda` in `TIERS`, and give it its own trail. Children aged 8–12 currently use Ojo's stories, and Parent Corner tells their parent that their stories are coming soon.

## Privacy

- Profiles and progress are stored in the browser's `localStorage` on this device only. Nothing is sent to a server.
- No accounts, ads, tracking, chat, camera or microphone.
- The only outside request is for the Baloo 2 and Baloo Tamma 2 fonts from Google Fonts.

## Project structure

```
index.html       App shell: top bar, bottom tab bar, Ojo artwork
css/style.css    All styles and animations
js/content.js    Trail, games, tasks, Ojo's lines, avatar parts, shop
js/app.js        Profiles, parent check, router, trail, games, rewards, Parent Corner
ojo-treasury/    The Ojo Treasury book (self-contained page + narration audio)
```

The book saves the drops of light a child collects under `ojo-drops:<child id>`; the app reads these to tick each stop's Listen step. Progress from the earlier version of the app (stars and book drops) is moved into the first child's profile automatically.
