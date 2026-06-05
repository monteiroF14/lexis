export default class WordOrderView {
  constructor(model) {
    this.model = model;
    this.selected = [];
    this._onWordClick = this._onWordClick.bind(this);
    this._onUndo = this._onUndo.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
  }

  _getContainer() { return document.getElementById("exercise-container") || document.getElementById("main-container"); }

  render() {
    const c = this._getContainer();
    if (!c) return;
    c.innerHTML = `
      <div class="w-100 d-flex flex-column align-items-center gap-4 lexis-contained-narrow">
        <div class="rounded-4 shadow-sm px-4 py-3 text-center w-100 lexis-ex-prompt">Arrange the words in correct order</div>
        <div id="sentence-zone" class="rounded-4 shadow-sm p-3 d-flex flex-wrap align-items-center w-100 lexis-sentence-zone"></div>
        <div id="word-pool" class="d-flex flex-wrap justify-content-center">
          ${this.model.shuffled.map((w, i) => `<button class="btn rounded-pill me-2 mb-2 word-chip shadow-sm lexis-word-chip" data-index="${i}">${w}</button>`).join("")}
        </div>
        <div class="d-flex gap-2 w-100">
          <button id="undo-btn" class="btn rounded-4 py-2 flex-fill lexis-btn-undo">Undo last</button>
          <button id="submit-btn" class="btn text-white rounded-4 py-2 flex-fill lexis-btn-primary">Submit</button>
        </div>
        <div id="order-feedback"></div>
      </div>`;
    c.querySelectorAll(".word-chip").forEach(b => b.addEventListener("click", this._onWordClick));
    c.querySelector("#undo-btn").addEventListener("click", this._onUndo);
    c.querySelector("#submit-btn").addEventListener("click", this._onSubmit);
  }

  _onWordClick(e) {
    const c = this._getContainer();
    if (!c) return;
    const btn = e.currentTarget;
    this.selected.push({ idx: btn.getAttribute("data-index"), word: btn.textContent });
    btn.classList.add("lexis-chip-selected");
    btn.disabled = true;
    c.querySelector("#sentence-zone").appendChild(btn);
  }

  _onUndo() {
    const c = this._getContainer();
    if (!c || !this.selected.length) return;
    const last = this.selected.pop();
    const btn = c.querySelector(`#sentence-zone button[data-index='${last.idx}']`);
    if (btn) { btn.classList.remove("lexis-chip-selected"); btn.disabled = false; c.querySelector("#word-pool").appendChild(btn); }
  }

  _onSubmit() {
    const c = this._getContainer();
    if (!c) return;
    const fb = c.querySelector("#order-feedback");
    if (this.model.checkAnswer(this.selected.map(s => s.word))) {
      fb.innerHTML = '<div class="alert alert-success rounded-4 py-2">Correct sentence!</div>';
      c.dispatchEvent(new CustomEvent("exerciseCompleted", { detail: { correct: true }, bubbles: true }));
    } else {
      fb.innerHTML = '<div class="alert alert-danger rounded-4 py-2">Incorrect order. Try again.</div>';
    }
  }
}
