/* Nidhi's Stories: content for the Ojo tier.
   Everything a child sees or hears in the app (apart from the book itself) lives in this file,
   so it can be reviewed by the panel and edited without touching the app code. */

/* Age tiers. Only Ojo is active; Veda and Prajñā switch on when their stories are ready. */
window.TIERS = [
  { id: "ojo", ages: [3, 7], active: true, companion: "Ojo", world: "Ojo's Treasure Trail", reward: "Ojas drops", sessionMinutes: 10 },
  { id: "veda", ages: [8, 12], active: false, companion: "Veda", world: "Veda's Quest Map", reward: "Knowledge stars", sessionMinutes: 15 },
  { id: "prajna", ages: [13, 16], active: false, companion: "Prajñā", world: "Prajñā's Journal", reward: "Insight points", sessionMinutes: 20 }
];

/* Drops earned for each step */
window.DROP_VALUES = { listen: 2, play: 3, do: 5, replay: 1, learning: 1, chest: 5 };

/* Your recorded narration from The Ojo Treasury, reused in the app.
   `t` lists the start time (seconds) of each spoken line: line 0 is the title, then the story's lines in order.
   Copied from NARR in ojo-treasury/index.html. If a story is re-recorded or re-synced, copy its new `t` here too. */
window.STORY_AUDIO = {
  1: { src: "ojo-treasury/audio/story-1-v2.mp3", t: [0.00, 4.40, 8.86, 13.97, 19.77, 22.57, 30.20, 31.61, 35.05, 38.40, 42.72, 52.21, 54.77, 64.05, 68.70, 71.44, 73.91, 76.39, 80.00, 83.48, 86.30, 88.51, 92.52, 94.76, 97.83, 101.45, 106.07, 109.20, 111.94, 115.97, 124.16, 126.66, 130.07] },
  2: { src: "ojo-treasury/audio/story-2.mp3", t: [0.00, 4.24, 8.41, 10.35, 15.25, 16.54, 26.66, 28.91, 33.42, 40.33, 42.87, 48.37, 55.76, 64.92, 72.38, 76.24, 82.42] },
  3: { src: "ojo-treasury/audio/story-3.mp3", t: [0.00, 4.84, 10.30, 13.83, 18.78, 21.18, 25.44, 29.86, 33.18, 36.28, 41.84, 46.54, 51.16, 54.00, 58.51, 64.18, 69.14] },
  4: { src: "ojo-treasury/audio/story-4.mp3", t: [0.00, 4.55, 8.54, 11.32, 13.07, 15.46, 17.20, 20.14, 24.69, 29.93, 32.67, 36.78, 40.05, 44.85, 48.10, 51.83, 55.31, 64.17, 67.92, 71.93] },
  5: { src: "ojo-treasury/audio/story-5.mp3", t: [0.00, 4.12, 8.24, 13.49, 17.58, 20.12, 22.77, 24.96, 26.96, 37.62, 43.24, 50.89, 54.82, 60.65, 63.19, 66.08, 74.89, 78.79] },
  6: { src: "ojo-treasury/audio/story-6.mp3", t: [0.00, 4.56, 9.55, 13.26, 17.44, 19.66, 22.26, 24.20, 28.83, 35.58, 40.70, 44.11, 50.57, 54.87, 57.73, 66.47, 69.27, 73.98, 80.74, 85.07] },
  7: { src: "ojo-treasury/audio/story-7.mp3", t: [0.00, 5.21, 8.45, 14.87, 18.44, 23.23, 26.43, 30.40, 33.93, 35.74, 37.66, 45.29, 47.90, 51.59, 55.66, 58.79, 61.73, 71.21] },
  8: { src: "ojo-treasury/audio/story-8.mp3", t: [0.00, 4.09, 8.82, 15.28, 19.06, 23.32, 28.23, 38.94, 42.75, 45.23, 53.29, 56.53, 64.06, 67.24, 72.00, 80.25, 82.26, 86.99] }
};

/* Celebrations use these narrator lines from the stories */
window.CELEBRATE_VOICE = [
  { n: 8, u: 16, text: "And Ojo shone gold and bright." },
  { n: 5, u: 16, text: "And Ojo shone bright." },
  { n: 1, u: 26, text: "At once, Ojo shone bright again." }
];

/* The eight stops of Ojo's Treasure Trail, in the order of The Ojo Treasury.
   `n` is the story's position in the book (its link is ojo-treasury/index.html#story-n).
   `voice` picks lines from that story's recording (u = line number in STORY_AUDIO; v = last line, if more than one). */
window.TRAIL = [
  { n: 1, title: "The Little Light in Me", hook: "Who lives in your heart?", icon: "🪔", color: "#46307e",
    game: "glow", task: "Put your hand on your heart and feel Ojo go thum, thum. Then give someone you love a big hug.",
    voice: { title: { u: 0 }, intro: { u: 10, text: "That is your heart. Inside your heart there is a tiny house. And inside the tiny house lives a tiny light." },
      done: { u: 26, text: "At once, Ojo shone bright again." }, story: { u: 8, v: 9, text: "Press here. What can you feel? Thum. Thum. Thum." } },
    sticker: { id: "light", e: "🪔", name: "Little Light" } },
  { n: 2, title: "Up with the Birds", hook: "Wake up with the birds", icon: "🐦", color: "#e98a2c",
    game: "morning", task: "Wake up with the birds tomorrow and say good morning to the sun.",
    voice: { title: { u: 0 }, intro: { u: 1, text: "Very early in the morning, Ojo woke Ayu up." },
      done: { u: 15, text: "Because you woke up early, with the birds. That makes me happy!" }, story: { u: 10, text: "The air is cool and fresh. And your mind is fresh too." } },
    sticker: { id: "early", e: "🐦", name: "Early Riser" } },
  { n: 3, title: "Brush, Brush, Brush!", hook: "Fuzzy teeth? Brush them!", icon: "🪥", color: "#2d9cdb",
    game: "teeth", task: "Brush your teeth in the morning and at night, with a grown-up watching.",
    voice: { title: { u: 0 }, intro: { u: 5, text: "Brush up. Brush down. Brush round and round." },
      done: { u: 15, text: "Clean teeth and a clean tongue make a happy mouth!" }, story: { u: 9, text: "Now clean your tongue. Gently, from the back to the front." } },
    sticker: { id: "brush", e: "🪥", name: "Brushing Star" } },
  { n: 4, title: "Five Friends Live in Me", hook: "Eyes, ears, nose, tongue and skin", icon: "👂", color: "#27ae60",
    game: "senses", task: "Close your eyes and tell a grown-up three sounds you can hear.",
    voice: { title: { u: 0 }, done: { u: 16, text: "Yes! Eyes, ears, nose, tongue and skin. Every day, they tell you all about the world." },
      story: { u: 17, v: 18, text: "I will take good care of my five friends. And they will take good care of you." } },
    sticker: { id: "senses", e: "🖐️", name: "Five Friends" } },
  { n: 5, title: "Look at Your Plate", hook: "Why rice turns sweet", icon: "🍚", color: "#d35400",
    game: "plate", task: "Chew your rice slowly, slowly, until it starts to taste sweet.",
    voice: { title: { u: 0 }, intro: { u: 7, text: "Look at your plate." },
      done: { u: 12, text: "Yes. When you chew slowly, rice turns sweet. It always does." }, story: { u: 10, text: "She took a little rice in her hand. She chewed it slowly. Chew, chew, chew." } },
    sticker: { id: "plate", e: "🍚", name: "Slow Chewer" } },
  { n: 6, title: "The Broken Blue Cup", hook: "Telling the truth", icon: "💙", color: "#2f5fb3",
    game: "truth", task: "If something breaks or goes wrong today, tell a grown-up the truth.",
    voice: { title: { u: 0 }, intro: { u: 11, text: "No, I am not cross. But when you don't tell the truth, I can't shine." },
      done: { u: 18, text: "Telling the truth makes me shine!" }, story: { u: 16, text: "Thank you for telling me the truth, Ayu. Come, let's clean it up together." } },
    sticker: { id: "truth", e: "💙", name: "Truth Teller" } },
  { n: 7, title: "The Sun Sleeps, So Do I", hook: "Ojo grows at night", icon: "🌙", color: "#34307a",
    game: "bedtime", task: "Lights out at the same time tonight, right after your bedtime story.",
    voice: { title: { u: 0 }, intro: { u: 1, text: "The sun went down behind the tamarind tree." },
      done: { u: 10, text: "Yes! When you sleep, your body grows a little bit. And I grow a little bit brighter. Every night!" }, story: { u: 14, v: 15, text: "Okay, Ojo. Let's grow. And Ayu fell fast asleep." } },
    sticker: { id: "sleep", e: "🌙", name: "Sleepy Star" } },
  { n: 8, title: "Thank You, Tummy", hook: "Leave a little space", icon: "🙏", color: "#b0466e",
    game: "tummy", task: "Stop eating when your tummy feels comfy, and say \"Thank you, tummy!\"",
    voice: { title: { u: 0 }, intro: { u: 13, text: "Eat until you are almost full. Always leave a little space." },
      done: { u: 16, text: "And Ojo shone gold and bright." }, yay: { u: 15, text: "Thank you, tummy!" },
      story: { u: 14, text: "The next day, Ayu ate her lunch slowly. When her tummy felt almost full, she stopped. She patted her tummy." } },
    sticker: { id: "tummy", e: "🙏", name: "Happy Tummy" } }
];

/* Games. Types: sort (tap all the right things), sequence (tap in order), choose (one answer per round),
   scrub (tap away the spots), tummy (stop when comfy), pairs (memory). `small` = easier version for ages 3–4. */
window.GAMES = {
  glow: { title: "What Makes Ojo Glow?", type: "sort",
    prompt: "Tap everything that makes Ojo glow!",
    items: [
      { e: "😴", l: "Good sleep", ok: true }, { e: "🍎", l: "Fresh fruit", ok: true },
      { e: "🤗", l: "A big hug", ok: true }, { e: "🌳", l: "Playing outside", ok: true },
      { e: "📱", l: "Phone at bedtime", ok: false }, { e: "🍭", l: "Lots of sweets", ok: false },
      { e: "😠", l: "Shouting", ok: false }
    ],
    small: 5 },
  morning: { title: "Ayu's Morning", type: "sequence",
    prompt: "Help Ayu start her day. Tap in order!",
    steps: [
      { e: "🐦", l: "Wake up", core: true }, { e: "🚽", l: "Toilet" }, { e: "🪥", l: "Brush teeth", core: true },
      { e: "💦", l: "Splash eyes" }, { e: "🛁", l: "Bath", core: true }, { e: "🍚", l: "Breakfast", core: true }
    ] },
  teeth: { title: "Sparkly Teeth", type: "scrub",
    prompt: "Brush away the fuzzy spots!", spots: 8, small: 5 },
  senses: { title: "Five Helpers", type: "choose",
    rounds: [
      { e: "🌈", q: "Which friend helps you see the rainbow?", options: ["👀 Eyes", "👂 Ears", "👃 Nose"], a: 0 },
      { e: "🐦", q: "Which friend helps you hear the bird sing?", options: ["👅 Tongue", "👂 Ears", "✋ Skin"], a: 1 },
      { e: "🌼", q: "Which friend helps you smell the jasmine?", options: ["👃 Nose", "👀 Eyes", "👅 Tongue"], a: 0 },
      { e: "🥭", q: "Which friend helps you taste the mango?", options: ["👂 Ears", "✋ Skin", "👅 Tongue"], a: 2 },
      { e: "☀️", q: "Which friend feels the warm sun on your arm?", options: ["✋ Skin", "👃 Nose", "👀 Eyes"], a: 0 }
    ],
    small: 3 },
  plate: { title: "Ojo's Plate", type: "sort",
    prompt: "Fill Ojo's plate with fresh, home-cooked food!",
    items: [
      { e: "🍚", l: "Rice", ok: true }, { e: "🥕", l: "Carrot", ok: true }, { e: "🍌", l: "Banana", ok: true },
      { e: "🫓", l: "Chapati", ok: true }, { e: "🍟", l: "Packet chips", ok: false },
      { e: "🥤", l: "Fizzy drink", ok: false }, { e: "🍬", l: "Packet sweets", ok: false }
    ],
    small: 5 },
  truth: { title: "The Honest Choice", type: "choose",
    rounds: [
      { e: "☕", q: "Ayu's blue cup broke. What should she do?", options: ["Tell Amma the truth", "Hide the pieces"], a: 0 },
      { e: "🧸", q: "Ayu found a toy that is not hers. What should she do?", options: ["Keep it secretly", "Give it back"], a: 1 },
      { e: "💧", q: "Ayu spilled water on the floor. What should she do?", options: ["Say sorry and help clean", "Walk away"], a: 0 }
    ],
    small: 2 },
  bedtime: { title: "Sleepy Ojo", type: "sequence",
    prompt: "Help Ojo get ready for bed. Tap in order!",
    steps: [
      { e: "🧸", l: "Put toys away", core: true }, { e: "🪥", l: "Brush teeth", core: true },
      { e: "📖", l: "Bedtime story" }, { e: "💡", l: "Lights off", core: true }, { e: "😴", l: "Sleep", core: true }
    ] },
  tummy: { title: "Thank You, Tummy", type: "tummy",
    prompt: "Feed Ayu one bite at a time. Stop when her tummy feels comfy!",
    bites: ["🍚", "🥕", "🫓", "🍌", "🥛"], comfy: 4 },
  pairs: { title: "Habit Pairs", type: "pairs",
    prompt: "Find the matching pairs!",
    cards: ["🪥", "🛁", "🍚", "😴", "🐦", "🤗"], small: 3 }
};

/* Learning games carried over from the earlier version of the app */
window.LEARNING_GAMES = [
  { route: "abc", icon: "🔤", title: "ABC Fun", note: "Letters and sounds", color: "#ff7eb3" },
  { route: "numbers", icon: "🔢", title: "Count with Me", note: "Numbers 1–10", color: "#6fc3ff" },
  { route: "shapes", icon: "🔺", title: "Shapes & Colors", note: "Look and tap", color: "#8ee08e" }
];

/* Ojo's lines. {name} becomes the child's name on screen; recordings say "my friend" instead.
   Every line must read well without the name too.
   Draft text: send through panel review and add Kannada versions before release. */
window.GUIDE = {
  firstMeet: ["Hello {name}! I am Ojo, the little light inside you.", "Ayu and I are so happy you are here!"],
  morning: ["Good morning, {name}! Did you say hello to the sun?", "Good morning! Have you brushed your teeth?", "Rise and shine, {name}!"],
  afternoon: ["Hello {name}! Shall we find a drop of light?", "Good afternoon! Ready for a story?", "Hello again, {name}!"],
  evening: ["Good evening, {name}! Story time soon?", "The sun is going to sleep. Shall we read?", "Hello {name}! A little play before bed?"],
  returnAfterBreak: ["I missed you, {name}! Your garden waited for you.", "Welcome back! Your flowers are still blooming."],
  correct: ["Yes! Well done!", "You did it, {name}!", "That's right!", "Wonderful!"],
  wrong: ["Hmm, let's look again.", "Nearly! Try once more.", "Good try! Look closely."],
  gameDone: ["You played so well, {name}!", "I am glowing brighter!", "Hooray! That was fun!"],
  taskInvite: ["Now let's try it for real, with a grown-up!", "Can you do this today, {name}?"],
  taskPending: ["When you've done it, a grown-up can tick it for you.", "I can't wait to hear how it went!"],
  chest: ["A treasure chest! You played on three days this week."],
  sessionEnd: ["Great playing, {name}! Now let's try it for real.", "Let's go and do it for real now. Bye for now, {name}!"],
  allDone: ["My treasure is full! Eight drops of light. Thank you, {name}!"],
  welcome: ["Hello! I am Ojo. Ask a grown-up to set up the app for you."],
  bookDrop: ["You found a drop of light in the story!"],
  taskDone: ["Well done, {name}! You did it for real."],
  taskDoneToday: ["Well done! You did it today."],
  newSticker: ["You earned a new sticker!"],
  garden: ["Look at your garden! Flowers never wilt here."],
  gardenEmpty: ["Play today and your first flower will bloom!"],
  needDrops: ["Keep playing to collect more drops!"],
  sortHint: ["Hmm, does that help? Try another!"],
  seqHint: ["Hmm, what comes next?"],
  seqGlow: ["What comes next? Look at the glowing one!"],
  teethClean: ["That one is already sparkly!"],
  tummyComfy: ["Ayu's tummy feels comfy. Leave a little space!"],
  tummyFull: ["Oops, too full! Let's try again and leave a little space."],
  tummyHungry: ["Ayu is still a little hungry. One more bite?"],
  pairMatch: ["A pair!", "Match!"]
};

/* Avatar parts. Skin, hair and eyes are always free; some outfits and accessories come from the shop. */
window.AVATAR = {
  skin: ["#f9d7c0", "#f1c19b", "#e0a77d", "#c68a5e", "#9c6644", "#6e4630"],
  hairColor: ["#1d1414", "#3b2416", "#6b4226", "#8a3b1f", "#c99a3c"],
  hair: [
    { id: "short", name: "Short" }, { id: "curly", name: "Curly" }, { id: "bun", name: "Bun" }, { id: "puffs", name: "Puffs" },
    { id: "long", name: "Long" }, { id: "braid", name: "Braid" }, { id: "spiky", name: "Spiky" }, { id: "bob", name: "Bob" }
  ],
  eyes: [{ id: "round", name: "Round" }, { id: "happy", name: "Happy" }, { id: "sparkle", name: "Sparkly" }, { id: "almond", name: "Almond" }],
  outfit: [
    { id: "sun", name: "Sunny tee", price: 0 }, { id: "sky", name: "Sky tee", price: 0 },
    { id: "kurta", name: "Leaf kurta", price: 0 }, { id: "frock", name: "Rose frock", price: 0 },
    { id: "stripes", name: "Stripes", price: 15 }, { id: "stars", name: "Starry tee", price: 15 },
    { id: "festive", name: "Festival kurta", price: 20 }, { id: "rainbow", name: "Rainbow", price: 25 }
  ],
  acc: [
    { id: "none", name: "Nothing", price: 0 }, { id: "glasses", name: "Glasses", price: 10 },
    { id: "flower", name: "Flower", price: 10 }, { id: "bow", name: "Bow", price: 10 },
    { id: "cap", name: "Cap", price: 15 }, { id: "leaves", name: "Leaf crown", price: 20 }
  ],
  startLook: {
    girl: { hair: "braid", outfit: "sun" },
    boy: { hair: "short", outfit: "sky" },
    none: { hair: "curly", outfit: "sun" }
  }
};

/* Garden plants for the shop */
window.PLANTS = [
  { id: "tulsi", e: "🌿", name: "Tulsi", price: 10 }, { id: "sunflower", e: "🌻", name: "Sunflower", price: 10 },
  { id: "lotus", e: "🪷", name: "Lotus", price: 15 }, { id: "jasmine", e: "🌼", name: "Jasmine", price: 15 },
  { id: "mango", e: "🥭", name: "Mango tree", price: 20 }, { id: "banyan", e: "🌳", name: "Banyan tree", price: 30 }
];

/* Stickers from the weekly treasure chest */
window.CHEST_STICKERS = [
  { id: "rainbow", e: "🌈", name: "Rainbow" }, { id: "peacock", e: "🦚", name: "Peacock" }, { id: "elephant", e: "🐘", name: "Elephant" },
  { id: "butterfly", e: "🦋", name: "Butterfly" }, { id: "turtle", e: "🐢", name: "Turtle" }, { id: "star", e: "🌟", name: "Bright Star" }
];
