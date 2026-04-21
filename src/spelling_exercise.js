export class SpellingExercise {
  constructor(container) {
    this.container = container;
    this.currentQuestion = null;
    this.exerciseCompleted = new CustomEvent("exerciseCompleted");
  }

  start() {
    this.loadQuestion();
    this.render();
  }

  loadQuestion() {
    this.currentQuestion = {
      prompt: "Select the correct spelling:",
      correct: "because",
      options: ["becuase", "because", "becouse"],
    };
  }

  checkAnswer(answer) {
    return answer === this.currentQuestion.correct;
  }

  render() {
    this.container.innerHTML = `
      <h2>${this.currentQuestion.prompt}</h2>
      <div>
        ${this.currentQuestion.options
          .map((opt) => `<button class="option">${opt}</button>`)
          .join("")}
      </div>
      <p id="feedback"></p>
    `;

    this.container.querySelectorAll(".option").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.handleAnswer(btn.textContent);
      });
    });
  }

  handleAnswer(answer) {
    const isCorrect = this.checkAnswer(answer);
    this.showFeedback(isCorrect);
    this.container.dispatchEvent(this.exerciseCompleted);
  }

  showFeedback(isCorrect) {
    const feedback = document.getElementById("feedback");
    feedback.textContent = isCorrect ? "✅ Correct!" : "❌ Try again";
    this.container.querySelectorAll(".option").forEach((btn) => {
      btn.disabled = isCorrect;
    });
  }
}
