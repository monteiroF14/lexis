/*
 * Worksheet View – orchestrates the flow of exercises within a worksheet.
 * Expects a WorksheetModel instance containing an array of exercise objects:
 *   { type: 'spelling'|'letter_dnd'|'missing'|'word_order'|'matching', data: {...} }
 */
import SpellingModel from "../models/spelling_model.js";
import LetterDndModel from "../models/letter_dnd_model.js";
import MissingLettersModel from "../models/missing_letters_model.js";
import SpellingView from "./spelling_view.js";
import LetterDndView from "./letter_dnd_view.js";
import MissingLettersView from "./missing_letters_view.js";
import WordOrderModel from "../models/word_order_model.js";
import WordOrderView from "./word_order_view.js";

export default class WorksheetView {
  constructor(model) {
    this.model = model;
    this.container = document.getElementById("main-container");
    this._onExerciseCompleted = this._onExerciseCompleted.bind(this);
  }

  render() {
    // Hide sidebars for full‑screen worksheet
    document
      .querySelectorAll("aside")
      .forEach((as) => (as.style.display = "none"));
    if (this.model.isCompleted()) {
      this._renderResults();
      return;
    }
    const exercise = this.model.getCurrentExercise();
    // render progress bar
    const progressHtml = `
      <div class="progress mb-4" style="height: 20px;">
        <div class="progress-bar" role="progressbar" style="width: ${
          (this.model.currentIndex / this.model.exercises.length) * 100
        }%" aria-valuenow="${this.model.currentIndex}" aria-valuemin="0" aria-valuemax="${this.model.exercises.length}"></div>
      </div>`;
    // cancel button
    const cancelBtn = `<button id="cancel-worksheet" class="btn btn-outline-danger mb-3">Cancel</button>`;
    // clear container and add UI
    this.container.innerHTML = `<div class="card rounded-4 shadow-sm border-0 p-4">${cancelBtn}${progressHtml}<div id="exercise-container"></div></div>`;
    this.container
      .querySelector("#cancel-worksheet")
      .addEventListener("click", () => {
        if (window.confirm("Exit worksheet? Progress will be lost.")) {
          document
            .querySelectorAll("aside")
            .forEach((as) => (as.style.display = ""));
          this.container.dispatchEvent(new CustomEvent("worksheet:cancel"));
        }
      });
    const exerciseContainer = this.container.querySelector(
      "#exercise-container",
    );
    // instantiate appropriate view
    let view;
    switch (exercise.type) {
      case "spelling":
        view = new SpellingView(new SpellingModel(exercise.data));
        break;
      case "letter_dnd":
        view = new LetterDndView(new LetterDndModel(exercise.data));
        break;
      case "missing":
        view = new MissingLettersView(new MissingLettersModel(exercise.data));
        break;
      case "word_order":
        view = new WordOrderView(new WordOrderModel(exercise.data));
        break;
      default:
        exerciseContainer.innerHTML =
          '<div class="alert alert-danger">Unknown exercise type</div>';
        return;
    }
    view.render();
    // listen for completion event from the child view
    this.container.addEventListener(
      "exerciseCompleted",
      this._onExerciseCompleted,
    );
  }

  _onExerciseCompleted(e) {
    // record answer (correct flag from event detail)
    this.model.recordAnswer(e.detail.correct);
    // remove listener to avoid duplicate handling when next view renders
    this.container.removeEventListener(
      "exerciseCompleted",
      this._onExerciseCompleted,
    );
    // advance to next exercise (or complete)
    if (!this.model.isCompleted()) this.model.nextExercise();
    // small fade transition
    this.container.classList.add("fade");
    setTimeout(() => {
      this.container.classList.remove("fade");
      this.render();
    }, 300);
  }

  _renderResults() {
    const { correct, total } = this.model.getScore();
    const xpEarned = correct * 10;
    const html = `
      <div class="card rounded-4 shadow-sm border-0 p-4 text-center">
        <h4 class="mb-3">Worksheet Completed!</h4>
        <p class="fs-5">Score: <strong>${correct}/${total}</strong></p>
        <p class="fs-5">XP earned: <strong>${xpEarned}</strong></p>
        <button id="back-btn" class="btn btn-primary mt-3">Back to Levels</button>
      </div>`;
    this.container.innerHTML = html;
    this.container.querySelector("#back-btn").addEventListener("click", () => {
      this.container.dispatchEvent(new CustomEvent("worksheet:cancel"));
    });
  }
}
