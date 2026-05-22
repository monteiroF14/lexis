/*
 * Letter Drag & Drop Model – provides a scrambled word and its letters.
 */
export default class LetterDndModel {
  constructor(data) {
    // data: { word: string, hint: string }
    this.word = data.word;
    this.hint = data.hint || '';
    this.letters = this._scramble(this.word.split(''));
    this.completed = false;
  }

  _scramble(arr) {
    const shuffled = arr.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  checkAnswer(arranged) {
    const isCorrect = arranged.join('') === this.word;
    this.completed = isCorrect;
    return isCorrect;
  }
}
