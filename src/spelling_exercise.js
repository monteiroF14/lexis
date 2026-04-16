import { ExerciseController, ExerciseModel, ExerciseView } from "./exercise.js";

export class SpellingExerciseController extends ExerciseController {
  constructor(model, view) {
    super(model, view);
  }

  start() {
    this.model.loadQuestion();
    this.view.render(this.model.currentQuestion, (answer) =>
      this.handleAnswer(answer),
    );
  }

  handleAnswer(answer) {
    const isCorrect = this.model.checkAnswer(answer);
    this.view.showFeedback(isCorrect);
  }
}

export class SpellingExerciseModel extends ExerciseModel {
  constructor() {
    super();
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
}

export class SpellingExerciseView extends ExerciseView {
  constructor(container) {
    super(container);
  }

  render(question, onAnswer) {
    this.container.innerHTML = `
      <h2>${question.prompt}</h2>
      <div>
        ${question.options
          .map((opt) => `<button class="option">${opt}</button>`)
          .join("")}
      </div>
      <p id="feedback"></p>
    `;

    this.container.querySelectorAll(".option").forEach((btn) => {
      btn.addEventListener("click", () => {
        onAnswer(btn.textContent);
      });
    });
  }

  showFeedback(isCorrect) {
    const feedback = document.getElementById("feedback");
    feedback.textContent = isCorrect ? "✅ Correct!" : "❌ Try again";
    this.container.querySelectorAll(".option").forEach((btn) => {
      btn.disabled = isCorrect;
    });
  }
}
