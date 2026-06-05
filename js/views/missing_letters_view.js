export default class MissingLettersView {
  constructor(model) { this.model = model; this._onSubmit = this._onSubmit.bind(this); }
  _getContainer() { return document.getElementById("exercise-container") || document.getElementById("main-container"); }

  render() {
    const c = this._getContainer();
    if (!c) return;
    const parts = this.model.getDisplayWord().split("_");
    let html = "";
    for (let i = 0; i < parts.length; i++) {
      html += `<span class="fs-4 fw-bold lexis-text-p">${parts[i]}</span>`;
      if (i < this.model.blanks.length) html += `<input type="text" maxlength="1" class="form-control mx-2 text-center fw-bold fs-4 rounded-3 shadow-sm lexis-input-blank" data-index="${i}">`;
    }
    c.innerHTML = `
      <div class="w-100 d-flex flex-column align-items-center gap-4 lexis-contained-narrow">
        <div class="rounded-4 shadow-sm px-4 py-3 text-center w-100 lexis-ex-prompt">Fill in the missing letters</div>
        <div class="d-flex align-items-center justify-content-center flex-nowrap py-3" style="white-space: nowrap;">${html}</div>
        <button id="missing-submit" class="btn text-white w-100 fw-bold rounded-4 py-2 lexis-btn-primary">Submit</button>
        <div id="missing-feedback"></div>
      </div>`;
    c.querySelector("#missing-submit").addEventListener("click", this._onSubmit);
  }

  _onSubmit() {
    const c = this._getContainer();
    if (!c) return;
    const inputs = Array.from(c.querySelectorAll("input[data-index]"));
    inputs.forEach(inp => { inp.disabled = false; inp.classList.remove("is-invalid"); });
    const fb = c.querySelector("#missing-feedback");
    if (this.model.checkAnswers(inputs.map(i => i.value.trim()))) {
      fb.innerHTML = '<div class="alert alert-success rounded-4 py-2">All correct!</div>';
      c.dispatchEvent(new CustomEvent("exerciseCompleted", { detail: { correct: true }, bubbles: true }));
    } else {
      fb.innerHTML = '<div class="alert alert-danger rounded-4 py-2">Some letters are wrong. Try again.</div>';
      const chars = this.model.word.split("");
      inputs.forEach((inp, i) => inp.value.toLowerCase() !== chars[this.model.blanks[i]].toLowerCase() ? inp.classList.add("is-invalid") : inp.classList.remove("is-invalid"));
    }
  }
}
