import SpellingModel from "../models/spelling_model.js";
import LetterDndModel from "../models/letter_dnd_model.js";
import MissingLettersModel from "../models/missing_letters_model.js";
import SpellingView from "./spelling_view.js";
import LetterDndView from "./letter_dnd_view.js";
import MissingLettersView from "./missing_letters_view.js";
import WordOrderModel from "../models/word_order_model.js";
import WordOrderView from "./word_order_view.js";
import { celebrate, showFloatingLabel } from "../effects.js";

export default class WorksheetView {
  constructor(model) {
    this.model = model;
    this.container = document.getElementById("main-container");
    this._onExerciseCompleted = this._onExerciseCompleted.bind(this);
  }

  render() {
    if (this.model.isCompleted()) { this._renderResults(); return; }
    const exercise = this.model.getCurrentExercise();

    this.container.innerHTML = `
      <div class="d-flex flex-column align-items-center justify-content-center position-relative w-100 lexis-min-h-full">
        <button id="leave-exercise" class="btn btn-light rounded-pill position-absolute shadow-sm lexis-leave-btn">Leave the exercise</button>
        <div id="exercise-container" class="w-100 d-flex flex-column align-items-center lexis-contained-narrow lexis-ex-pad"></div>
      </div>`;

    this.container.querySelector("#leave-exercise").addEventListener("click", () => {
      if (window.confirm("Exit worksheet? Progress will be lost.")) this.container.dispatchEvent(new CustomEvent("worksheet:cancel"));
    });

    const ec = this.container.querySelector("#exercise-container");
    let view;
    switch (exercise.type) {
      case "spelling": view = new SpellingView(new SpellingModel(exercise.data)); break;
      case "letter_dnd": view = new LetterDndView(new LetterDndModel(exercise.data)); break;
      case "missing": view = new MissingLettersView(new MissingLettersModel(exercise.data)); break;
      case "word_order": view = new WordOrderView(new WordOrderModel(exercise.data)); break;
      default: ec.innerHTML = '<div class="alert alert-danger">Unknown exercise type</div>'; return;
    }
    view.render();
    this.container.addEventListener("exerciseCompleted", this._onExerciseCompleted);
  }

  _onExerciseCompleted(e) {
    const ec = this.container.querySelector("#exercise-container");
    if (e.detail.correct && ec) {
      showFloatingLabel(ec, "+10 XP", "lexis-text-green");
    }
    this.model.recordAnswer(e.detail.correct);
    this.container.removeEventListener("exerciseCompleted", this._onExerciseCompleted);
    if (!this.model.isCompleted()) this.model.nextExercise();
    this.container.classList.add("fade");
    setTimeout(() => { this.container.classList.remove("fade"); this.render(); }, 300);
  }

  _renderResults() {
    const { correct, total } = this.model.getScore();
    const xp = correct * 10;
    this.container.innerHTML = `
      <div class="d-flex flex-column align-items-center justify-content-center w-100 lexis-min-h-full">
        <div class="rounded-4 shadow-sm p-4 text-center lexis-result-card">
          <h4 class="mb-3 lexis-text-p">Worksheet Completed!</h4>
          <p class="fs-5 lexis-text-p">Score: <strong>${correct}/${total}</strong></p>
          <p class="fs-5 lexis-text-p">XP earned: <strong>${xp}</strong></p>
          <button id="back-btn" class="btn text-white mt-3 rounded-3 px-4 lexis-btn-primary">Back to Levels</button>
        </div>
      </div>`;
    this.container.querySelector("#back-btn").addEventListener("click", () => this.container.dispatchEvent(new CustomEvent("worksheet:cancel")));
    setTimeout(() => celebrate(), 200);
  }
}
