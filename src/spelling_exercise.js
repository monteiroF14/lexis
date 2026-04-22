export class SpellingExercise {
  constructor(container) {
    this.container = container;
    this.currentQuestion = null;
    this.exerciseCompleted = new CustomEvent("exerciseCompleted");

    // Pool of words
    this.wordBank = [
      "because",
      "friend",
      "school",
      "different",
      "people",
      "beautiful",
      "important",
    ];
  }

  start() {
    this.loadQuestion();
    this.render();
  }

  loadQuestion() {
    const correct = this.getRandomWord();
    const options = this.generateOptions(correct);

    this.currentQuestion = {
      prompt: "Select the correct spelling:",
      correct,
      options,
    };
  }

  getRandomWord() {
    return this.wordBank[Math.floor(Math.random() * this.wordBank.length)];
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
      (w) => w.slice(0, -1), // missing last letter
      (w) => w + w[w.length - 1], // double last letter
    ];

    const pattern = patterns[Math.floor(Math.random() * patterns.length)];

    const result = pattern(word);

    // Ensure it's actually different
    return result !== word ? result : word + "x";
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

    if (isCorrect) {
      this.container.dispatchEvent(this.exerciseCompleted);
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
