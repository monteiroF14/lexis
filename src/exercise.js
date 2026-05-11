export class Exercise {
  constructor(prompt) {
    this.currentQuestion = null;
    this.prompt = prompt;
  }

  start() {
    throw new Error("start() must be implemented");
  }

  checkAnswer() {
    throw new Error("checkAnswer() must be implemented");
  }

  generateOptions() {
    throw new Error("generateOptions() must be implemented");
  }
}
