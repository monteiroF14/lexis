import SpellingModel from "../models/spelling_model.js";

export default class SpellingView {
  constructor(model) { this.model = model; this._onOptionClick = this._onOptionClick.bind(this); }

  render() {
    const c = document.getElementById("exercise-container") || document.getElementById("main-container");
    if (!c) return;
    c.innerHTML = `
      <div class="w-100 d-flex flex-column align-items-center gap-4 lexis-contained-narrow">
        <div class="rounded-4 shadow-sm px-4 py-3 text-center w-100 lexis-ex-prompt">Choose the correct spelling!</div>
        ${this.model.options.map(o => `<button class="btn rounded-4 w-100 py-3 text-center shadow-sm lexis-ex-option" data-opt="${o}">${o}</button>`).join("")}
        <div id="spelling-feedback" class="mt-2"></div>
      </div>`;
    c.querySelectorAll("button[data-opt]").forEach(b => b.addEventListener("click", this._onOptionClick));
  }

  _onOptionClick(e) {
    const c = document.getElementById("exercise-container") || document.getElementById("main-container");
    if (!c) return;
    const btn = e.currentTarget;
    const chosen = btn.getAttribute("data-opt");
    const correct = this.model.word;
    const allBtns = c.querySelectorAll("button[data-opt]");
    allBtns.forEach(b => b.disabled = true);

    if (this.model.checkAnswer(chosen)) {
      btn.classList.add("lexis-correct-pulse");
      setTimeout(() => {
        c.dispatchEvent(new CustomEvent("exerciseCompleted", { detail: { correct: true }, bubbles: true }));
      }, 600);
    } else {
      btn.classList.add("lexis-shake");
      allBtns.forEach(b => {
        if (b.getAttribute("data-opt") === correct) b.classList.add("lexis-flash-correct");
      });
      setTimeout(() => {
        c.dispatchEvent(new CustomEvent("exerciseCompleted", { detail: { correct: false }, bubbles: true }));
      }, 800);
    }
  }
}
