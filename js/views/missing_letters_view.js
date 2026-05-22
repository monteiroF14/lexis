/*
 * Missing Letters View – renders inputs for missing letters.
 */
export default class MissingLettersView {
  constructor(model) {
    this.model = model;
    this.container = document.getElementById("main-container");
    this._onSubmit = this._onSubmit.bind(this);
  }

  render() {
    const display = this.model.getDisplayWord();
    const parts = display.split("_");
    // Build HTML with inputs where blanks were
    let html = '<div class="card rounded-4 shadow-sm border-0 p-4">';
    html += '<h5 class="mb-3">Fill in the missing letters</h5>';
    html += '<div class="d-flex align-items-center mb-3">';
    for (let i = 0; i < parts.length; i++) {
      html += `<span>${parts[i]}</span>`;
      if (i < this.model.blanks.length) {
        html += `<input type="text" maxlength="1" class="form-control mx-1" style="width: 4rem;" data-index="${i}">`;
      }
    }
    html += "</div>";
    html +=
      '<button id="missing-submit" class="btn btn-primary">Submit</button>';
    html += '<div id="missing-feedback" class="mt-3"></div>';
    html += "</div>";
    this.container.innerHTML = html;
    this.container
      .querySelector("#missing-submit")
      .addEventListener("click", this._onSubmit);
  }

  _onSubmit() {
    const inputs = Array.from(
      this.container.querySelectorAll("input[data-index]"),
    );
    // Ensure inputs are enabled
    inputs.forEach((inp) => (inp.disabled = false));
    // Reset previous validation styles
    inputs.forEach((inp) => inp.classList.remove("is-invalid"));
    const values = inputs.map((inp) => inp.value.trim());
    const isCorrect = this.model.checkAnswers(values);
    const feedback = this.container.querySelector("#missing-feedback");
    if (isCorrect) {
      feedback.innerHTML =
        '<div class="alert alert-success">✅ All correct!</div>';
      const event = new CustomEvent("exerciseCompleted", {
        detail: { correct: true },
      });
      this.container.dispatchEvent(event);
    } else {
      feedback.innerHTML =
        '<div class="alert alert-danger">❌ Some letters are wrong. Try again.</div>';
      // highlight wrong inputs
      const chars = this.model.word.split("");
      console.log(inputs);
      inputs.forEach((inp, i) => {
        if (
          inp.value.toLowerCase() !== chars[this.model.blanks[i]].toLowerCase()
        ) {
          inp.classList.add("is-invalid");
        } else {
          inp.classList.remove("is-invalid");
        }
      });
    }
  }
}
