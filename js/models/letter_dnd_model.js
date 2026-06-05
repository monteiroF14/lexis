/*
 * Letter Drag & Drop Model – provides a scrambled word and its letters.
 */
import { shuffle } from "../utils.js";

export default class LetterDndModel {
  constructor(data) {
    // data: { word: string, hint: string }
    this.word = data.word;
    this.hint = data.hint || '';
    this.letters = shuffle(this.word.split(''));
    this.completed = false;
  }

  checkAnswer(arranged) {
    const isCorrect = arranged.join('') === this.word;
    this.completed = isCorrect;
    return isCorrect;
  }
}
