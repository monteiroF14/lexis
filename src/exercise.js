export function InitExercise(containerId) {
  return new ExerciseController(
    new ExerciseModel(),
    new ExerciseView(containerId),
  );
}

class ExerciseController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.start();
  }

  start() {
    this.model.loadQuestion();
    this.view.render(this.model.currentQuestion, this.handleAnswer);
  }

  handleAnswer = (answer) => {
    const isCorrect = this.model.checkAnswer(answer);
    this.view.showFeedback(isCorrect);
  };
}

class ExerciseModel {
  constructor() {
    this.currentQuestion = null;
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

class ExerciseView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
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

    document.querySelectorAll(".option").forEach((btn) => {
      btn.addEventListener("click", () => {
        onAnswer(btn.textContent);
      });
    });
  }

  showFeedback(isCorrect) {
    const feedback = document.getElementById("feedback");
    feedback.textContent = isCorrect ? "✅ Correct!" : "❌ Try again";
    document.querySelectorAll(".option").forEach((btn) => {
      btn.disabled = isCorrect;
    });
  }
}
