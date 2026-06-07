import { playCorrect, playIncorrect } from "../sound.js";
import { getExerciseContainer } from "../utils.js";

export default class WordOrderView {
  constructor(model, container) {
    this.model = model;
    this.container = container;
    this.selected = [];
    this._onWordClick = this._onWordClick.bind(this);
    this._onUndo = this._onUndo.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
    this._onHintWord = this._onHintWord.bind(this);
  }

  _getContainer() {
    return getExerciseContainer(this);
  }

  render() {
    const c = this._getContainer();
    if (!c) return;
    c.innerHTML = `
      <div class="w-100 d-flex flex-column align-items-center gap-4 lexis-contained-narrow">
        <div class="rounded-4 shadow-sm px-4 py-3 text-center w-100 lexis-ex-prompt">Arrange the words in correct order</div>
        <div class="lexis-hint-toggle d-flex align-items-center gap-1 small cursor-pointer mb-2">
          <span class="lexis-hint-arrow" style="font-size:0.65rem;">▶</span> Hint
        </div>
        <div class="lexis-hint-text small text-secondary mb-3 d-none">${this.model.hint || "No hint available"}</div>
        <div id="sentence-zone" class="rounded-4 shadow-sm p-3 d-flex flex-wrap align-items-center w-100 lexis-sentence-zone lexis-zone-empty"></div>
        <div id="word-pool" class="d-flex flex-wrap justify-content-center">
          ${this.model.shuffled.map((w, i) => `<button class="btn rounded-pill me-2 mb-2 word-chip shadow-sm lexis-word-chip" data-index="${i}">${w}</button>`).join("")}
        </div>
        <div class="d-flex gap-2 w-100">
          <button id="hint-btn" class="btn rounded-4 py-2 flex-fill lexis-btn-undo">Hint word</button>
          <button id="undo-btn" class="btn rounded-4 py-2 flex-fill lexis-btn-undo">Undo</button>
          <button id="submit-btn" class="btn text-white rounded-4 py-2 flex-fill lexis-btn-primary">Submit</button>
        </div>
        <div id="order-feedback"></div>
      </div>`;
    c.querySelectorAll(".word-chip").forEach(b => b.addEventListener("click", this._onWordClick));
    c.querySelector("#undo-btn").addEventListener("click", this._onUndo);
    c.querySelector("#submit-btn").addEventListener("click", this._onSubmit);
    c.querySelector("#hint-btn").addEventListener("click", this._onHintWord);
    const hintToggle = c.querySelector(".lexis-hint-toggle");
    const hintText = c.querySelector(".lexis-hint-text");
    if (hintToggle && hintText && this.model.hint) {
      hintToggle.addEventListener("click", () => {
        hintText.classList.toggle("d-none");
        hintToggle.querySelector(".lexis-hint-arrow").textContent =
          hintText.classList.contains("d-none") ? "▶" : "▼";
      });
    } else if (hintToggle) {
      hintToggle.classList.add("d-none");
    }
  }

  _onWordClick(e) {
    const c = this._getContainer();
    if (!c) return;
    const btn = e.currentTarget;
    this.selected.push({
      idx: btn.getAttribute("data-index"),
      word: btn.textContent,
    });
    btn.classList.add("lexis-chip-selected");
    btn.disabled = true;
    c.querySelector("#sentence-zone").appendChild(btn);
    c.querySelector("#sentence-zone").classList.remove("lexis-zone-empty");
  }

  _onUndo() {
    const c = this._getContainer();
    if (!c || !this.selected.length) return;
    const last = this.selected.pop();
    const btn = c.querySelector(
      `#sentence-zone button[data-index='${last.idx}']`,
    );
    if (btn) {
      btn.classList.remove("lexis-chip-selected");
      btn.disabled = false;
      c.querySelector("#word-pool").appendChild(btn);
    }
    if (!this.selected.length) {
      c.querySelector("#sentence-zone").classList.add("lexis-zone-empty");
    }
  }

  _onHintWord() {
    const c = this._getContainer();
    if (!c) return;
    const usedIndices = new Set(this.selected.map(s => s.idx));
    for (let i = 0; i < this.model.words.length; i++) {
      const idx = this.model.shuffled.findIndex(w => w === this.model.words[i]);
      if (!usedIndices.has(idx)) {
        const chip = c.querySelector(`#word-pool button[data-index='${idx}']`);
        if (chip) chip.click();
        return;
      }
    }
    c.querySelector("#hint-btn").disabled = true;
  }

  _onSubmit() {
    const c = this._getContainer();
    if (!c) return;
    c.querySelector("#submit-btn").disabled = true;
    c.querySelector("#undo-btn").disabled = true;
    c.querySelector("#hint-btn").disabled = true;
    const zone = c.querySelector("#sentence-zone");

    if (this.model.checkAnswer(this.selected.map((s) => s.word))) {
      playCorrect();
      zone.classList.add("lexis-correct-pulse");
      setTimeout(() => {
        c.dispatchEvent(
          new CustomEvent("exerciseCompleted", {
            detail: { correct: true },
            bubbles: true,
          }),
        );
      }, 600);
    } else {
      playIncorrect();
      zone.classList.add("lexis-shake");
      const correctWords = this.model.original.split(/\s+/);
      zone.innerHTML = correctWords
        .map(
          (w) =>
            `<button class="btn rounded-pill me-2 mb-2 shadow-sm lexis-word-chip lexis-flash-correct">${w}</button>`,
        )
        .join("");
      setTimeout(() => {
        c.dispatchEvent(
          new CustomEvent("exerciseCompleted", {
            detail: { correct: false },
            bubbles: true,
          }),
        );
      }, 800);
    }
  }
}
