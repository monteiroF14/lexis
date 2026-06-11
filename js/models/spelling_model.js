import { shuffle } from "../utils.js";

export default class SpellingModel {
  constructor(data) {
    this.word = data.word;
    this.hint = data.hint || "";
    this.options = this._generateOptions();
    this.completed = false;
  }

  makeMistake(word) {
    const patterns = [
      (w) => w.slice(0, -1), // drop last letter: "orang"
      (w) => w.replace(/^(.)(.)/, "$2$1"), // swap first two: "ornage"
      (w) => w.replace(/a/g, "e"), // wrong vowel
      (w) => w.replace(/e/g, "a"),
      (w) => w.replace(/ie/g, "ei"), // i/e swap
      (w) => w.replace(/ei/g, "ie"),
      (w) => w.replace(/ou/g, "uo"), // diphthong swap
      (w) => w.replace(/er/g, "re"),
      (w) => {
        // random letter substitution
        const i = Math.floor(Math.random() * w.length);
        const c = "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
        return c !== w[i] ? w.slice(0, i) + c + w.slice(i + 1) : w;
      },
    ];
    const working = patterns.filter((p) => p(word) !== word);
    if (working.length) {
      return working[Math.floor(Math.random() * working.length)](word);
    }
    // Guaranteed: drop a random middle letter
    const idx = Math.floor(Math.random() * word.length);
    return word.slice(0, idx) + word.slice(idx + 1);
  }

  _generateOptions() {
    const correct = this.word;
    const wrong1 = this.makeMistake(correct);
    const wrong2 = this.makeMistake(correct);
    const opts = [correct, wrong1, wrong2];
    return shuffle(opts);
  }

  checkAnswer(choice) {
    const isCorrect = choice === this.word;
    this.completed = isCorrect;
    return isCorrect;
  }
}
