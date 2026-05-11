import { Exercise } from "./exercise";

export class SpellingExercise extends Exercise {
  WORDLIST = [
    "because",
    "friend",
    "school",
    "different",
    "people",
    "beautiful",
    "important",
  ];

  constructor() {
    super("Select the correct spelling:");
    const idx = Math.floor(Math.random() * this.WORDLIST.length);
    this.word = this.WORDLIST.splice(idx, 1)[0];
  }

  start() {
    return this.loadQuestion();
  }

  loadQuestion() {
    const options = this.generateOptions(this.word);

    this.currentQuestion = {
      prompt: this.prompt,
      correct: this.word,
      options,
    };

    return this.currentQuestion;
  }

  generateOptions(correct) {
    const mistakes = new Set();

    while (mistakes.size < 2) {
      mistakes.add(this.makeMistake(correct));
    }

    const options = [...mistakes, correct];

    return options.sort(() => Math.random() - 0.5);
  }

  makeMistake(word) {
    const patterns = [
      (w) => w.replace(/ie/g, "ei"),
      (w) => w.replace(/ei/g, "ie"),
      (w) => w.replace(/ou/g, "uo"),
      (w) => w.replace(/er/g, "re"),
      (w) => w.replace(/a/g, "e"),
      (w) => w.replace(/e/g, "a"),
      (w) => w.slice(0, -1),
      (w) => w + w[w.length - 1],
    ];

    const pattern = patterns[Math.floor(Math.random() * patterns.length)];

    const result = pattern(word);

    return result !== word ? result : word + "x";
  }

  checkAnswer(answer) {
    return answer === this.currentQuestion.correct;
  }

  static isCorrect(question, answer) {
    return question.correct === answer;
  }
}
