/*
 * Missing Letters View – renders inputs for missing letters.
 */
export default class MissingLettersView {
  constructor(model) {
    this.model = model;
    this._onSubmit = this._onSubmit.bind(this);
  }

  _getContainer() {
    return document.getElementById('exercise-container') || document.getElementById('main-container');
  }

  render() {
    const container = this._getContainer();
    if (!container) return;

    const display = this.model.getDisplayWord();
    const parts = display.split("_");

    let innerHtml = '';
    for (let i = 0; i < parts.length; i++) {
      innerHtml += `<span class="fs-4 fw-bold">${parts[i]}</span>`;
      if (i < this.model.blanks.length) {
        innerHtml += `<input type="text" maxlength="1"
          class="form-control mx-2 text-center fw-bold fs-4 bg-white rounded-3 shadow-sm"
          style="width: 3rem; height: 3rem; border: none;"
          data-index="${i}">`;
      }
    }

    container.innerHTML = `
      <div class="w-100 d-flex flex-column align-items-center gap-4" style="max-width: 500px;">
        <div class="bg-white rounded-4 shadow-sm px-4 py-3 text-center w-100">
          Fill in the missing letters
        </div>
        <div class="d-flex align-items-center justify-content-center flex-wrap py-3">${innerHtml}</div>
        <button id="missing-submit" class="btn text-white w-100 fw-bold rounded-4 py-2"
                style="background-color: #4f46e5; border: none;">Submit</button>
        <div id="missing-feedback"></div>
      </div>`;

    container.querySelector("#missing-submit").addEventListener("click", this._onSubmit);
  }

  _onSubmit() {
    const container = this._getContainer();
    if (!container) return;

    const inputs = Array.from(container.querySelectorAll("input[data-index]"));
    inputs.forEach((inp) => (inp.disabled = false));
    inputs.forEach((inp) => inp.classList.remove("is-invalid"));
    const values = inputs.map((inp) => inp.value.trim());
    const isCorrect = this.model.checkAnswers(values);
    const feedback = container.querySelector("#missing-feedback");

    if (isCorrect) {
      feedback.innerHTML = '<div class="alert alert-success rounded-4 py-2">All correct!</div>';
      const event = new CustomEvent("exerciseCompleted", { detail: { correct: true }, bubbles: true });
      container.dispatchEvent(event);
    } else {
      feedback.innerHTML = '<div class="alert alert-danger rounded-4 py-2">Some letters are wrong. Try again.</div>';
      const chars = this.model.word.split("");
      inputs.forEach((inp, i) => {
        if (inp.value.toLowerCase() !== chars[this.model.blanks[i]].toLowerCase()) {
          inp.classList.add("is-invalid");
        } else {
          inp.classList.remove("is-invalid");
        }
      });
    }
  }
}
