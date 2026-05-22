/*
 * Spelling Exercise Model – provides a word and three options (one correct, two incorrect).
 */

export default class SpellingModel {
  constructor(data) {
    // data should contain the correct word
    this.word = data.word;
    this.options = this._generateOptions();
    this.completed = false;
  }

  makeMistake(word) {
    const patterns = [
      (w) => w.replace(/ie/g, "ei"),
      (w) => w.replace(/ei/g, "ie"),
      (w) => w.replace(/ou/g, "uo"),
      (w) => w.replace(/er/g, "re"),
      (w) => w.replace(/a/g, "e"),
      (w) => w.replace(/e/g, "a"),
      (w) => w.slice(0, -1), // missing last letter
      (w) => w + w[w.length - 1], // double last letter
    ];

    const pattern = patterns[Math.floor(Math.random() * patterns.length)];

    const result = pattern(word);

    // Ensure it's actually different
    return result !== word ? result : word + "x";
  }

  _generateOptions() {
    const correct = this.word;
    const wrong1 = this.makeMistake(correct);
    const wrong2 = this.makeMistake(correct);
    const opts = [correct, wrong1, wrong2];
    // shuffle
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }

  checkAnswer(choice) {
    const isCorrect = choice === this.word;
    this.completed = isCorrect;
    return isCorrect;
  }
}
