/*
 * Missing Letters Model – creates a word with 1‑2 blanks.
 */
export default class MissingLettersModel {
  constructor(data) {
    // data: { word: string }
    this.word = data.word;
    this.blanks = this._selectBlanks(); // array of indices to hide
    this.completed = false;
  }

  _selectBlanks() {
    const len = this.word.length;
    const count = Math.min(2, Math.max(1, Math.floor(len / 5)));
    const indices = new Set();
    while (indices.size < count) {
      const idx = Math.floor(Math.random() * len);
      // avoid first or last character for readability
      if (idx !== 0 && idx !== len - 1) indices.add(idx);
    }
    return Array.from(indices).sort((a, b) => a - b);
  }

  getDisplayWord() {
    // return string with underscores for blanks
    const chars = this.word.split('');
    this.blanks.forEach(i => (chars[i] = '_'));
    return chars.join('');
  }

  checkAnswers(inputs) {
    // inputs: array of typed characters matching blanks order
    let correct = true;
    this.blanks.forEach((idx, i) => {
      if (inputs[i].toLowerCase() !== this.word[idx].toLowerCase()) correct = false;
    });
    this.completed = correct;
    return correct;
  }
}
