import WorksheetModel from "./worksheet_model.js";

const EXERCISE_TYPES = ["spelling", "letter_dnd", "missing", "word_order"];

const WORDS = [
  { word: "apple",  hint: "A common fruit" },
  { word: "banana", hint: "A long yellow fruit" },
  { word: "orange", hint: "A citrus fruit" },
  { word: "cat",    hint: "A furry pet that purrs" },
  { word: "dog",    hint: "Man's best friend" },
  { word: "fish",   hint: "Swims in water" },
  { word: "house",  hint: "A place to live" },
  { word: "tree",   hint: "Has leaves and branches" },
  { word: "book",   hint: "Something you read" },
  { word: "star",   hint: "Shines in the night sky" },
  { word: "moon",   hint: "Orbits the Earth" },
  { word: "sun",    hint: "Our closest star" },
  { word: "bird",   hint: "Has feathers and flies" },
  { word: "rain",   hint: "Water falling from clouds" },
  { word: "snow",   hint: "White and cold, falls in winter" },
  { word: "cloud",  hint: "Floats in the sky" },
  { word: "grass",  hint: "Covers the ground, green" },
  { word: "river",  hint: "Flows towards the sea" },
];

const SENTENCES = [
  { sentence: "the quick brown fox jumps", hint: "Contains every letter of the alphabet" },
  { sentence: "she sells sea shells",       hint: "A famous tongue twister" },
  { sentence: "hello world program",        hint: "Every programmer writes this first" },
  { sentence: "learning is fun",            hint: "An encouraging phrase" },
  { sentence: "practice makes perfect",     hint: "A saying about hard work" },
  { sentence: "a cat sat on the mat",       hint: "A simple rhyming sentence" },
];

function randomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function randomSentence() {
  return SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
}

function generateExercise() {
  const type = EXERCISE_TYPES[Math.floor(Math.random() * EXERCISE_TYPES.length)];
  switch (type) {
    case "spelling": { const w = randomWord(); return { type, data: { word: w.word, hint: w.hint } }; }
    case "letter_dnd": { const w = randomWord(); return { type, data: { word: w.word, hint: w.hint } }; }
    case "missing": { const w = randomWord(); return { type, data: { word: w.word, hint: w.hint } }; }
    case "word_order": { const s = randomSentence(); return { type, data: { sentence: s.sentence, hint: s.hint } }; }
  }
}

export default class HardcoreWorksheetModel extends WorksheetModel {
  static COIN_REWARD = 1;
  constructor(sessionModel) {
    super([generateExercise()], "hardcore", sessionModel);
    this.hardcore = true;
  }

  nextExercise() {
    const next = generateExercise();
    this.exercises.push(next);
    this.currentIndex++;
    return this.getCurrentExercise();
  }

  _persistProgress() {
    const user = this.sessionModel?.getSession();
    if (!user) return;
    user.coins += HardcoreWorksheetModel.COIN_REWARD;
    this.sessionModel.updateUser(user);
    this._dispatchStreak();
  }
}
