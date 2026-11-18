# 📚 Nidhi's Stories

A colourful, ad-free learning web app for children aged about 3–7: illustrated storybooks with read-aloud narration, plus little games for letters, numbers, shapes and colours.

## Features

- **📖 Storybooks**: five original picture books with page-turn animations, swipe and arrow-key navigation, and a **🔊 Read to me** mode that narrates and turns pages on its own.
  - Highlighted vocabulary words: tap one to hear and see what it means.
  - A "The End" page with the lesson and a list of new words.
  - A 3-question **quiz** after each story (answers are shuffled every time).
- **🔤 ABC Fun**: A–Z cards ("A is for Apple") and a *Find the letter* game.
- **🔢 Count with Me**: numbers 1–10, a *How many?* counting game and a picture *Add it up* game.
- **🔺 Shapes & Colors**: learn 8 shapes and 8 colours, then play *Find the shape* and *Find the color*.
- **⭐ Stars and progress**: stars are earned for finishing books and for first-try answers. Progress is saved in the browser's `localStorage`; there are no accounts and no tracking.
- **👨‍👩‍👧 For grown-ups** page with an overview and a reset button.
- Works on phones, tablets and desktops, and respects the "reduce motion" setting.

## Run it

Nothing to install or build. It is plain HTML, CSS and JavaScript.

- Open `index.html` in a browser, **or**
- Serve the folder: `python3 -m http.server 8000`, then visit http://localhost:8000

To publish it, enable **GitHub Pages** for the repository (Settings → Pages → deploy from branch, root folder).

## Add your own story

Edit `js/stories.js` and add another object to the `STORIES` list:

```js
{
  id: "my-story",            // used in the URL
  title: "My Story",
  cover: "🦊",               // emoji for the cover
  color: "#f4a261",          // cover colour
  age: "3–6",
  theme: "Friendship",
  pages: [
    { scene: "🦊🌲", bg: "#e9f5db", text: "Once upon a time..." }
    // add `dark: true` for dark backgrounds
  ],
  moral: "The lesson of the story.",
  words: [{ word: "fox", meaning: "A wild animal with a bushy tail." }],
  quiz: [{ q: "Who is the story about?", options: ["A fox", "A bear", "A fish"], answer: 0 }]
}
```

## Project structure

```
index.html      App shell and navigation
css/style.css   All styles and animations
js/stories.js   Story content (pages, words, quizzes)
js/app.js       Router, storybook reader, quizzes, games, progress
```
