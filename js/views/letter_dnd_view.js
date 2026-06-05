export default class LetterDndView {
  constructor(model) {
    this.model = model;
    this.dragState = null;
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onCheck = this._onCheck.bind(this);
  }

  _getContainer() { return document.getElementById("exercise-container") || document.getElementById("main-container"); }

  render() {
    const c = this._getContainer();
    if (!c) return;
    c.innerHTML = `
      <div class="w-100 d-flex flex-column align-items-center gap-4 lexis-contained-narrow">
        <div class="rounded-4 shadow-sm px-4 py-3 text-center w-100 lexis-ex-prompt">Arrange the letters</div>
        <div class="d-flex justify-content-center flex-wrap gap-2 p-3 rounded-4 shadow-sm w-100 lexis-letter-zone" id="construction-zone">
          ${this.model.letters.map(() => `<div class="rounded-3 shadow-sm d-flex align-items-center justify-content-center lexis-tile-slot"></div>`).join("")}
        </div>
        <div class="d-flex justify-content-center flex-wrap gap-2 p-3 rounded-4 shadow-sm w-100 lexis-letter-zone" id="letter-pool">
          ${this.model.letters.map((l, i) => `<div class="rounded-3 shadow-sm fw-bold fs-5 d-flex align-items-center justify-content-center user-select-none lexis-tile lexis-grab" data-idx="${i}">${l}</div>`).join("")}
        </div>
        <button class="btn text-white w-100 fw-bold rounded-4 py-2 lexis-btn-primary" id="check-btn">Check</button>
        <div id="dnd-feedback"></div>
      </div>`;
    c.querySelectorAll("#letter-pool > div").forEach(el => el.addEventListener("pointerdown", this._onPointerDown));
    c.querySelector("#check-btn").addEventListener("click", this._onCheck);
  }

  _onPointerDown(e) {
    const tile = e.currentTarget;
    const rect = tile.getBoundingClientRect();
    const clone = tile.cloneNode(true);
    clone.classList.add("lexis-drag-clone");
    clone.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;margin:0;pointer-events:none;z-index:9999;transition:none;box-shadow:0 8px 24px rgba(0,0,0,0.15);transform:scale(1.08);`;
    document.body.appendChild(clone);
    tile.classList.add("opacity-25");
    this.dragState = { tile, clone, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top, startX: e.clientX, startY: e.clientY, originalParent: tile.parentNode, originalRef: tile.nextSibling, moved: false };
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
    ds.clone.remove(); ds.tile.classList.remove("opacity-25");
    if (ds.moved) this._finalize(e);
    this.dragState = null;
  }

  _finalize(e) {
    const c = this._getContainer();
    if (!c) return;
    const tile = this.dragState.tile, pool = c.querySelector("#letter-pool"), slots = c.querySelectorAll("#construction-zone > div"), poolTiles = c.querySelectorAll("#letter-pool > div");
    const cx = e.clientX, cy = e.clientY;
    for (const s of slots) {
      const r = s.getBoundingClientRect();
      if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) {
        const occ = s.firstElementChild;
        if (occ && occ !== tile) this.dragState.originalParent.insertBefore(occ, this.dragState.originalRef);
        s.appendChild(tile); return;
      }
    }
    for (const o of poolTiles) {
      if (o === tile) continue;
      const r = o.getBoundingClientRect();
      if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) {
        const pa = tile.parentNode, pb = o.parentNode, ra = tile.nextSibling, rb = o.nextSibling;
        pa.insertBefore(o, ra); pb.insertBefore(tile, rb); return;
      }
    }
    const pr = pool.getBoundingClientRect();
    if (cx >= pr.left && cx <= pr.right && cy >= pr.top && cy <= pr.bottom) pool.appendChild(tile);
  }

  _onCheck() {
    const c = this._getContainer();
    if (!c) return;
    const ans = Array.from(c.querySelectorAll("#construction-zone > div > div")).map(el => el.textContent.trim());
    const fb = c.querySelector("#dnd-feedback");
    if (this.model.checkAnswer(ans)) {
      fb.innerHTML = '<div class="alert alert-success text-center fw-semibold rounded-4 py-2">Correct!</div>';
      c.querySelector("#check-btn").disabled = true;
      c.dispatchEvent(new CustomEvent("exerciseCompleted", { detail: { correct: true }, bubbles: true }));
    } else {
      fb.innerHTML = '<div class="alert alert-danger text-center fw-semibold rounded-4 py-2">Incorrect – try again</div>';
      setTimeout(() => fb.innerHTML = "", 1200);
    }
  }
}
