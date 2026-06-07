import { playCorrect, playIncorrect } from "../sound.js";
import { getExerciseContainer } from "../utils.js";

export default class WordOrderView {
  constructor(model, container) {
    this.model = model;
    this.container = container;
    this.selected = [];
    this.dragState = null;
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
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
        <div id="sentence-zone" class="rounded-4 shadow-sm p-3 d-flex flex-wrap align-items-center w-100 lexis-sentence-zone"></div>
        <div id="word-pool" class="d-flex flex-wrap justify-content-center gap-2">
          ${this.model.shuffled.map((w, i) => `<button class="btn rounded-pill me-2 mb-2 word-chip shadow-sm lexis-word-chip lexis-grab" data-index="${i}">${w}</button>`).join("")}
        </div>
        <div class="d-flex gap-2 w-100">
          <button id="hint-btn" class="btn rounded-4 py-2 flex-fill lexis-btn-undo">Hint word</button>
          <button id="submit-btn" class="btn text-white rounded-4 py-2 flex-fill lexis-btn-primary">Submit</button>
        </div>
        <div id="order-feedback"></div>
      </div>`;
    c.querySelectorAll("#word-pool .word-chip").forEach(el => el.addEventListener("pointerdown", this._onPointerDown));
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

  _onPointerDown(e) {
    const chip = e.currentTarget;
    const rect = chip.getBoundingClientRect();
    const clone = chip.cloneNode(true);
    clone.classList.add("lexis-drag-clone");
    clone.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;margin:0;pointer-events:none;z-index:9999;transition:none;box-shadow:0 8px 24px rgba(0,0,0,0.15);transform:scale(1.08);white-space:nowrap;`;
    document.body.appendChild(clone);
    chip.classList.add("opacity-25");
    this.dragState = { chip, clone, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top, startX: e.clientX, startY: e.clientY, moved: false };
    document.addEventListener("pointermove", this._onPointerMove);
    document.addEventListener("pointerup", this._onPointerUp);
  }

  _onPointerMove(e) {
    if (!this.dragState) return;
    const ds = this.dragState;
    ds.clone.style.left = (e.clientX - ds.offsetX) + "px";
    ds.clone.style.top = (e.clientY - ds.offsetY) + "px";
    if (!ds.moved && (Math.abs(e.clientX - ds.startX) > 5 || Math.abs(e.clientY - ds.startY) > 5)) ds.moved = true;
  }

  _onPointerUp(e) {
    document.removeEventListener("pointermove", this._onPointerMove);
    document.removeEventListener("pointerup", this._onPointerUp);
    if (!this.dragState) return;
    const ds = this.dragState;
    ds.clone.remove();
    ds.chip.classList.remove("opacity-25");
    if (ds.moved) this._finalize(e);
    this.dragState = null;
  }

  _finalize(e) {
    const c = this._getContainer();
    if (!c) return;
    const chip = this.dragState.chip;
    const cx = e.clientX, cy = e.clientY;
    const zone = c.querySelector("#sentence-zone");
    const zoneRect = zone.getBoundingClientRect();
    const pool = c.querySelector("#word-pool");

    if (cx >= zoneRect.left && cx <= zoneRect.right && cy >= zoneRect.top && cy <= zoneRect.bottom) {
      if (chip.parentNode === pool) {
        chip.classList.add("lexis-chip-selected");
        this.selected.push({ idx: chip.getAttribute("data-index"), word: chip.textContent });
      }
      zone.appendChild(chip);
      return;
    }
    pool.appendChild(chip);
    this.selected = this.selected.filter(s => s.idx !== chip.getAttribute("data-index"));
  }

  _onHintWord() {
    const c = this._getContainer();
    if (!c) return;
    const usedIndices = new Set(this.selected.map(s => parseInt(s.idx)));
    for (let i = 0; i < this.model.words.length; i++) {
      const idx = this.model.shuffled.findIndex(w => w === this.model.words[i]);
      if (!usedIndices.has(idx)) {
        const chip = c.querySelector(`#word-pool button[data-index='${idx}']`);
        if (chip) {
          const zone = c.querySelector("#sentence-zone");
          chip.classList.add("lexis-chip-selected");
          this.selected.push({ idx: chip.getAttribute("data-index"), word: chip.textContent });
          zone.appendChild(chip);
        }
        return;
      }
    }
    c.querySelector("#hint-btn").disabled = true;
  }

  _onSubmit() {
    const c = this._getContainer();
    if (!c) return;
    c.querySelector("#submit-btn").disabled = true;
    c.querySelector("#hint-btn").disabled = true;
    const zone = c.querySelector("#sentence-zone");

    if (this.model.checkAnswer(this.selected.map((s) => s.word))) {
      playCorrect();
      zone.classList.add("lexis-correct-pulse");
      setTimeout(() => {
        c.dispatchEvent(
          new CustomEvent("exerciseCompleted", { detail: { correct: true }, bubbles: true }),
        );
      }, 600);
    } else {
      playIncorrect();
      zone.classList.add("lexis-shake");
      const correctWords = this.model.original.split(/\s+/);
      zone.innerHTML = correctWords
        .map(w => `<button class="btn rounded-pill me-2 mb-2 shadow-sm lexis-word-chip lexis-flash-correct">${w}</button>`)
        .join("");
      setTimeout(() => {
        c.dispatchEvent(
          new CustomEvent("exerciseCompleted", { detail: { correct: false }, bubbles: true }),
        );
      }, 800);
    }
  }
}
