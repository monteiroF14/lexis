import { SpellingExercise } from "./spelling-exercise";

const EXERCISES_COUNT = 3

export class Worksheet {
  constructor() {
    this.container = document.getElementById("game-container");
    this.exercises = [];
    this.currentExerciseIdx = 0;

    for (let i = 0; i < EXERCISES_COUNT; i++) {
      this.exercises.push(new SpellingExercise());
    }

    this.render();
    this.container.querySelectorAll(".option").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.handleAnswer(btn.textContent);
      });
    });

    this.start();
  }

  start() {
    if (this.currentExerciseIdx >= this.exercises.length) {
      this.showCompletion();
      return;
    }

    const question = this.exercises[this.currentExerciseIdx].start();
    this.renderQuestion(question);
  }

  showCompletion() {
    this.container.innerHTML = `
      <h2>🎉 Worksheet Complete!</h2>
      <p>You finished all 3 exercises.</p>
    `;
  }

  render() {
    this.container.innerHTML = `
      <h2 id="prompt">Loading...</h2>
      <div id="options"></div>
      <p id="feedback"></p>
    `;
  }

  renderQuestion(question) {
    document.getElementById("prompt").textContent = question.prompt;
    document.getElementById("options").innerHTML = question.options
      .map((opt) => `<button class="option">${opt}</button>`)
      .join("");
    document.getElementById("feedback").textContent = "";

    this.container.querySelectorAll(".option").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.handleAnswer(btn.textContent);
      });
    });
  }

  handleAnswer(answer) {
    const exercise = this.exercises[this.currentExerciseIdx];
    const isCorrect = exercise.checkAnswer(answer);
    this.showFeedback(isCorrect);

    if (isCorrect) {
      setTimeout(() => {
        this.currentExerciseIdx++;
        this.start();
      }, 2000);
    }
  }

  showFeedback(isCorrect) {
    const feedback = document.getElementById("feedback");
    feedback.textContent = isCorrect ? "✅ Correct!" : "❌ Try again";

    if (isCorrect) {
      this.container.querySelectorAll(".option").forEach((btn) => {
        btn.disabled = true;
      });
    }
  }
}
