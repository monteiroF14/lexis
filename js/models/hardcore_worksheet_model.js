import WorksheetModel from "./worksheet_model.js";

const EXERCISE_TYPES = ["spelling", "letter_dnd", "missing", "word_order"];

function randomWord() {
  const words = [
    "apple",
    "banana",
    "orange",
    "cat",
    "dog",
    "fish",
    "house",
    "tree",
  ];
  return words[Math.floor(Math.random() * words.length)];
}

function randomSentence() {
  const sentences = [
    "the quick brown fox jumps",
    "she sells sea shells",
    "hello world program",
    "learning is fun",
  ];
  return sentences[Math.floor(Math.random() * sentences.length)];
}

function generateExercise() {
  const type =
    EXERCISE_TYPES[Math.floor(Math.random() * EXERCISE_TYPES.length)];
  switch (type) {
    case "spelling":
      return { type, data: { word: randomWord() } };
    case "letter_dnd":
      return { type, data: { word: randomWord(), hint: "" } };
    case "missing":
      return { type, data: { word: randomWord() } };
    case "word_order":
      return { type, data: { sentence: randomSentence() } };
    default:
      return { type: "spelling", data: { word: randomWord() } };
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

    const streakResult = this.sessionModel?.recordDailyActivity();
    if (streakResult) {
      document.body.dispatchEvent(
        new CustomEvent("streak:updated", { detail: streakResult }),
      );
    }
  }
}
