/* Featured books: complete illustrated books that live in their own folder. */
window.FEATURED_BOOKS = [
  {
    title: "The Ojo Treasury",
    subtitle: "ಓಜೋ ಕೋಶ · 8 stories of Ayu and her tiny golden friend Ojo",
    href: "ojo-treasury/index.html",
    cover: "✨",
    art: "👧🏽💛",
    color: "#46307e",
    color2: "#f4b52c",
    tags: ["Narrated", "Healthy habits", "English & Kannada"]
  }
];

/* Story library. Each story has pages (scene emoji + text), new words and a short quiz.
   To add a story, copy one object below and change its contents. */
window.STORIES = [
  {
    id: "brave-little-seed",
    title: "The Brave Little Seed",
    cover: "🌱",
    color: "#7bc47f",
    age: "3–5",
    theme: "Patience",
    pages: [
      { scene: "🌰", bg: "#f3e2c7", text: "Deep under the ground lived a tiny seed named Sunny. It was dark and quiet, and Sunny felt very small." },
      { scene: "🌧️", bg: "#cfe3f5", text: "One day, raindrops tapped on the soil. Drip, drop, drip! Sunny drank the cool water and felt a little tickle inside." },
      { scene: "🌱", bg: "#d8f0d2", text: "Sunny pushed and pushed. Up came a tiny green shoot! \"I can do it,\" Sunny whispered. \"One little push at a time.\"" },
      { scene: "☀️", bg: "#fff2b8", text: "The warm sun said hello. Every morning Sunny stretched toward the light and grew a bit taller." },
      { scene: "🐝", bg: "#fde7c4", text: "Weeks went by. A bee buzzed past and said, \"What a lovely bud you have!\" Sunny smiled. Something special was coming." },
      { scene: "🌻", bg: "#fff6cc", text: "Then, one bright morning, Sunny opened up into a tall, golden sunflower! Being brave and patient had helped Sunny bloom." }
    ],
    moral: "Big things grow from small steps. Be patient and keep trying!",
    words: [
      { word: "seed", meaning: "A tiny thing that a plant grows from." },
      { word: "patient", meaning: "Able to wait calmly." },
      { word: "bloom", meaning: "When a flower opens up." }
    ],
    quiz: [
      { q: "What was the seed's name?", options: ["Sunny", "Rosy", "Buddy"], answer: 0 },
      { q: "What did Sunny drink?", options: ["Milk", "Rain water", "Juice"], answer: 1 },
      { q: "What did Sunny become?", options: ["A tree", "A rose", "A sunflower"], answer: 2 }
    ]
  },
  {
    id: "milo-shares",
    title: "Milo Learns to Share",
    cover: "🐘",
    color: "#9fb4e8",
    age: "3–6",
    theme: "Kindness",
    pages: [
      { scene: "🐘🍎", bg: "#e4ebfb", text: "Milo the little elephant found a big basket of red apples. \"All mine!\" he trumpeted happily." },
      { scene: "🐒", bg: "#f6e6d0", text: "Along came Kiki the monkey. Her tummy rumbled. \"Milo, may I have one apple, please?\" she asked." },
      { scene: "🐘😕", bg: "#e8e8f0", text: "Milo hugged the basket with his trunk. \"No! They're mine.\" Kiki walked away, feeling sad." },
      { scene: "🍎🍎🍎", bg: "#fbe0e0", text: "Milo ate one apple, then two, then three. But eating alone was not much fun. It was very, very quiet." },
      { scene: "🐘🐒🦒", bg: "#e0f3e6", text: "Milo found Kiki and her friend Gigi the giraffe. \"I'm sorry,\" he said. \"Would you like to share my apples?\"" },
      { scene: "🎉", bg: "#fff1c9", text: "They shared the apples and laughed together under the big tree. Milo learned that sharing makes everyone happier — even him!" }
    ],
    moral: "Sharing turns one happy heart into many.",
    words: [
      { word: "share", meaning: "To let others have some of what you have." },
      { word: "trunk", meaning: "An elephant's long nose." },
      { word: "sorry", meaning: "What we say when we feel bad about something we did." }
    ],
    quiz: [
      { q: "What did Milo find?", options: ["Bananas", "Apples", "Carrots"], answer: 1 },
      { q: "Who asked Milo for an apple first?", options: ["Kiki the monkey", "Gigi the giraffe", "A bee"], answer: 0 },
      { q: "How did Milo feel after sharing?", options: ["Sad", "Angry", "Happy"], answer: 2 }
    ]
  },
  {
    id: "star-counting",
    title: "Luna Counts the Stars",
    cover: "🌙",
    color: "#7a6fc4",
    age: "4–6",
    theme: "Counting 1–5",
    pages: [
      { scene: "🌙", bg: "#2f2a5a", dark: true, text: "Luna the little owl could not sleep. \"I know!\" she hooted. \"I will count the stars until I feel sleepy.\"" },
      { scene: "⭐", bg: "#36306a", dark: true, text: "She saw ONE bright star above the old oak tree. \"One,\" said Luna." },
      { scene: "⭐⭐", bg: "#3c3577", dark: true, text: "Then TWO stars twinkled over the pond. \"One, two,\" Luna counted." },
      { scene: "⭐⭐⭐", bg: "#423a83", dark: true, text: "THREE stars sparkled above the hill. \"One, two, three!\" Luna's eyes grew heavy." },
      { scene: "⭐⭐⭐⭐⭐", bg: "#4a4190", dark: true, text: "FOUR, FIVE! Five shining stars like a sleepy smile. \"One, two, three, four, five,\" yawned Luna." },
      { scene: "🦉💤", bg: "#2a2550", dark: true, text: "Luna snuggled into her cozy nest. The stars kept watch as she drifted off to sleep. Goodnight, Luna!" }
    ],
    moral: "Counting can be calm and fun — even at bedtime!",
    words: [
      { word: "owl", meaning: "A bird that is awake at night." },
      { word: "twinkle", meaning: "To shine with little flickers of light." },
      { word: "cozy", meaning: "Warm, soft and comfy." }
    ],
    quiz: [
      { q: "What kind of animal is Luna?", options: ["A cat", "An owl", "A bat"], answer: 1 },
      { q: "How many stars did Luna count in the end?", options: ["3", "10", "5"], answer: 2 },
      { q: "Why did Luna count stars?", options: ["She couldn't sleep", "She was lost", "For school"], answer: 0 }
    ]
  },
  {
    id: "rainbow-paint",
    title: "Pip and the Rainbow Paint",
    cover: "🎨",
    color: "#f2a65a",
    age: "3–6",
    theme: "Colors",
    pages: [
      { scene: "🐧🎨", bg: "#eef6fb", text: "Pip the penguin lived where everything was white — white snow, white ice, white clouds. \"I wish I could see colors!\" Pip said." },
      { scene: "🍓", bg: "#fde0e0", text: "A friendly bird dropped a paint box. Pip dipped a brush in RED and painted a juicy strawberry." },
      { scene: "🍊", bg: "#ffe8cc", text: "Next came ORANGE, like a round, sweet orange. Then YELLOW, as bright as the sun!" },
      { scene: "🍀", bg: "#dff3dc", text: "Pip painted GREEN grass and a lucky clover. Then BLUE, like the deep sea where fish swim." },
      { scene: "🍇", bg: "#ece0f6", text: "Last of all came PURPLE, the color of grapes. Pip stepped back. \"Wow!\"" },
      { scene: "🌈🐧", bg: "#fff6e0", text: "Pip had painted a giant rainbow across the ice! All the penguins came to see. Now their snowy home was full of color." }
    ],
    moral: "You can add color and joy wherever you go.",
    words: [
      { word: "rainbow", meaning: "An arch of colors in the sky." },
      { word: "penguin", meaning: "A bird that swims but cannot fly." },
      { word: "brush", meaning: "A tool used for painting." }
    ],
    quiz: [
      { q: "What did Pip paint red?", options: ["A strawberry", "A banana", "A fish"], answer: 0 },
      { q: "What color are grapes in the story?", options: ["Green", "Purple", "Orange"], answer: 1 },
      { q: "What did Pip paint at the end?", options: ["A house", "A snowman", "A rainbow"], answer: 2 }
    ]
  },
  {
    id: "tortoise-race",
    title: "Tara Tortoise Keeps Going",
    cover: "🐢",
    color: "#5db3a8",
    age: "5–7",
    theme: "Perseverance",
    pages: [
      { scene: "🐢🏁", bg: "#dff1ee", text: "It was Field Day in Green Meadow! Tara the tortoise signed up for the long hike up Pebble Hill." },
      { scene: "🐇💨", bg: "#eaf5e0", text: "Ravi the rabbit zoomed ahead. \"See you at the top, Tara!\" he called. Tara smiled and took one slow step at a time." },
      { scene: "⛰️", bg: "#efe6da", text: "The path grew steep and rocky. Tara's legs felt tired. \"I can rest for a moment,\" she said, \"but I won't give up.\"" },
      { scene: "🐇🤕", bg: "#f6e3dc", text: "Halfway up, Tara found Ravi sitting on a rock. He had a sore paw from running too fast." },
      { scene: "🐢🐇", bg: "#e5f0f8", text: "\"Let's go together,\" said Tara. Ravi leaned on her shell, and step by step, they climbed on." },
      { scene: "🏆", bg: "#fff3c4", text: "At sunset they reached the top together! Everyone cheered. Ravi said, \"Thanks, Tara. Slow and steady — and kind — is the best way!\"" }
    ],
    moral: "Keep going, and help your friends along the way.",
    words: [
      { word: "tortoise", meaning: "A slow animal with a hard shell that lives on land." },
      { word: "steep", meaning: "Going up sharply, hard to climb." },
      { word: "steady", meaning: "Moving in a calm, even way." }
    ],
    quiz: [
      { q: "Where did Tara hike?", options: ["Pebble Hill", "Sandy Beach", "Snowy Mountain"], answer: 0 },
      { q: "What happened to Ravi?", options: ["He fell asleep", "He hurt his paw", "He got lost"], answer: 1 },
      { q: "How did they reach the top?", options: ["Ravi first", "Tara alone", "Together"], answer: 2 }
    ]
  }
];
