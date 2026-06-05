/*
 * Word Order Model – presents a shuffled sentence and validates correct order.
 */
import { shuffle } from "../utils.js";

export default class WordOrderModel {
  constructor(data) {
    // data: { sentence: string }
    this.original = data.sentence.trim();
    this.words = this.original.split(/\s+/);
    this.shuffled = shuffle(this.words);
    this.completed = false;
  }

  checkAnswer(selected) {
    const isCorrect = selected.join(' ') === this.original;
    this.completed = isCorrect;
    return isCorrect;
  }
}
