/*
 * Word Order Model – presents a shuffled sentence and validates correct order.
 */
export default class WordOrderModel {
  constructor(data) {
    // data: { sentence: string }
    this.original = data.sentence.trim();
    this.words = this.original.split(/\s+/);
    this.shuffled = this._shuffle(this.words.slice());
    this.completed = false;
  }

  _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  checkAnswer(selected) {
    const isCorrect = selected.join(' ') === this.original;
    this.completed = isCorrect;
    return isCorrect;
  }
}
