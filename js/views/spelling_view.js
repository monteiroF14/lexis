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
    const fb = document.getElementById("spelling-feedback");
    if (this.model.checkAnswer(e.currentTarget.getAttribute("data-opt"))) {
      fb.innerHTML = '<div class="alert alert-success rounded-4 py-2">Correct!</div>';
      this._disableButtons();
      (document.getElementById("exercise-container") || document.getElementById("main-container"))
        ?.dispatchEvent(new CustomEvent("exerciseCompleted", { detail: { correct: true }, bubbles: true }));
    } else {
      fb.innerHTML = '<div class="alert alert-danger rounded-4 py-2">Try again</div>';
    }
  }

  _disableButtons() {
    (document.getElementById("exercise-container") || document.getElementById("main-container"))
      ?.querySelectorAll("button[data-opt]").forEach(b => b.disabled = true);
  }
}
