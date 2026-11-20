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

/* The eight stops of Ojo's Treasure Trail, in the order of The Ojo Treasury.
   `n` is the story's position in the book (its link is ojo-treasury/index.html#story-n). */
window.TRAIL = [
  { n: 1, title: "The Little Light in Me", hook: "Who lives in your heart?", icon: "🪔", color: "#46307e",
    game: "glow", task: "Put your hand on your heart and feel Ojo go thum, thum. Then give someone you love a big hug.",
    sticker: { id: "light", e: "🪔", name: "Little Light" } },
  { n: 2, title: "Up with the Birds", hook: "Wake up with the birds", icon: "🐦", color: "#e98a2c",
    game: "morning", task: "Wake up with the birds tomorrow and say good morning to the sun.",
    sticker: { id: "early", e: "🐦", name: "Early Riser" } },
  { n: 3, title: "Brush, Brush, Brush!", hook: "Fuzzy teeth? Brush them!", icon: "🪥", color: "#2d9cdb",
    game: "teeth", task: "Brush your teeth in the morning and at night, with a grown-up watching.",
    sticker: { id: "brush", e: "🪥", name: "Brushing Star" } },
  { n: 4, title: "Five Friends Live in Me", hook: "Eyes, ears, nose, tongue and skin", icon: "👂", color: "#27ae60",
    game: "senses", task: "Close your eyes and tell a grown-up three sounds you can hear.",
    sticker: { id: "senses", e: "🖐️", name: "Five Friends" } },
  { n: 5, title: "Look at Your Plate", hook: "Why rice turns sweet", icon: "🍚", color: "#d35400",
    game: "plate", task: "Chew your rice slowly, slowly, until it starts to taste sweet.",
    sticker: { id: "plate", e: "🍚", name: "Slow Chewer" } },
  { n: 6, title: "The Broken Blue Cup", hook: "Telling the truth", icon: "💙", color: "#2f5fb3",
    game: "truth", task: "If something breaks or goes wrong today, tell a grown-up the truth.",
    sticker: { id: "truth", e: "💙", name: "Truth Teller" } },
  { n: 7, title: "The Sun Sleeps, So Do I", hook: "Ojo grows at night", icon: "🌙", color: "#34307a",
    game: "bedtime", task: "Lights out at the same time tonight, right after your bedtime story.",
    sticker: { id: "sleep", e: "🌙", name: "Sleepy Star" } },
  { n: 8, title: "Thank You, Tummy", hook: "Leave a little space", icon: "🙏", color: "#b0466e",
    game: "tummy", task: "Stop eating when your tummy feels comfy, and say \"Thank you, tummy!\"",
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

/* Ojo's lines. {name} becomes the child's name. Every line must read well without the name too.
   Draft text: send through panel review and add Kannada versions before release. */
window.GUIDE = {
  firstMeet: ["Hello {name}! I am Ojo, the little light inside you.", "Ayu and I are so happy you are here!"],
  morning: ["Good morning, {name}! Did you say hello to the sun?", "Good morning! Have you brushed your teeth?", "Rise and shine, {name}!"],
  afternoon: ["Hello {name}! Shall we find a drop of light?", "Good afternoon! Ready for a story?", "Hello again, {name}!"],
  evening: ["Good evening, {name}! Story time soon?", "The sun is going to sleep. Shall we read?", "Hello {name}! A little play before bed?"],
  returnAfterBreak: ["I missed you, {name}! Your garden waited for you.", "Welcome back! Your flowers are still blooming."],
  next: ["Next stop: {title}!", "Shall we try {title}?"],
  correct: ["Yes! Well done!", "You did it, {name}!", "That's right!", "Wonderful!"],
  wrong: ["Hmm, let's look again.", "Nearly! Try once more.", "Good try! Look closely."],
  gameDone: ["You played so well, {name}!", "I am glowing brighter!", "Hooray! That was fun!"],
  taskInvite: ["Now let's try it for real, with a grown-up!", "Can you do this today, {name}?"],
  taskPending: ["When you've done it, a grown-up can tick it for you.", "I can't wait to hear how it went!"],
  chest: ["A treasure chest! You played on three days this week."],
  sessionEnd: ["Great playing, {name}! Now let's try it for real.", "Let's go and do it for real now. Bye for now, {name}!"],
  allDone: ["My treasure is full! Eight drops of light. Thank you, {name}!"]
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
