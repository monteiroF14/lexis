/*
 * Letter Drag & Drop View – Duolingo-style letter tile exercise.
 */
export default class LetterDndView {
  constructor(model) {
    this.model = model;
    this.dragState = null;
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onCheck = this._onCheck.bind(this);
  }

  _getContainer() {
    return document.getElementById('exercise-container') || document.getElementById('main-container');
  }

  render() {
    const container = this._getContainer();
    if (!container) return;

    const poolHtml = this.model.letters
      .map((l, i) =>
        `<div class="bg-white rounded-3 shadow-sm fw-bold fs-5 d-flex align-items-center justify-content-center user-select-none"
              style="width:52px;height:52px;touch-action:none;cursor:grab; border: none;"
              data-idx="${i}">${l}</div>`
      ).join('');

    const slotsHtml = this.model.letters
      .map(() => `<div class="bg-white rounded-3 shadow-sm d-flex align-items-center justify-content-center"
                        style="width:52px;height:52px; border: 2px dashed #d1d5db;"></div>`).join('');

    container.innerHTML = `
      <div class="w-100 d-flex flex-column align-items-center gap-4" style="max-width: 500px;">
        <div class="bg-white rounded-4 shadow-sm px-4 py-3 text-center w-100">
          Arrange the letters
        </div>
        <div class="d-flex justify-content-center flex-wrap gap-2 p-3 bg-white rounded-4 shadow-sm w-100" id="construction-zone">${slotsHtml}</div>
        <div class="d-flex justify-content-center flex-wrap gap-2 p-3 bg-white rounded-4 shadow-sm w-100" id="letter-pool">${poolHtml}</div>
        <button class="btn text-white w-100 fw-bold rounded-4 py-2" id="check-btn"
                style="background-color: #4f46e5; border: none;">Check</button>
        <div id="dnd-feedback"></div>
      </div>`;

    container.querySelectorAll('#letter-pool > div')
      .forEach(el => el.addEventListener('pointerdown', this._onPointerDown));
    container.querySelector('#check-btn').addEventListener('click', this._onCheck);
  }

  _onPointerDown(e) {
    const tile = e.currentTarget;
    const rect = tile.getBoundingClientRect();

    const clone = tile.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.left = rect.left + 'px';
    clone.style.top = rect.top + 'px';
    clone.style.width = rect.width + 'px';
    clone.style.height = rect.height + 'px';
    clone.style.margin = '0';
    clone.style.pointerEvents = 'none';
    clone.style.zIndex = '9999';
    clone.style.transition = 'none';
    clone.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
    clone.style.borderColor = '#4f46e5';
    clone.style.transform = 'scale(1.08)';
    document.body.appendChild(clone);

    tile.classList.add('opacity-25');

    this.dragState = {
      tile,
      clone,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      startX: e.clientX,
      startY: e.clientY,
      originalParent: tile.parentNode,
      originalRef: tile.nextSibling,
      moved: false,
    };

    document.addEventListener('pointermove', this._onPointerMove);
    document.addEventListener('pointerup', this._onPointerUp);
  }

  _onPointerMove(e) {
    if (!this.dragState) return;
    const ds = this.dragState;
    ds.clone.style.left = (e.clientX - ds.offsetX) + 'px';
    ds.clone.style.top = (e.clientY - ds.offsetY) + 'px';

    if (!ds.moved &&
        (Math.abs(e.clientX - ds.startX) > 5 ||
         Math.abs(e.clientY - ds.startY) > 5)) {
      ds.moved = true;
    }
  }

  _onPointerUp(e) {
    document.removeEventListener('pointermove', this._onPointerMove);
    document.removeEventListener('pointerup', this._onPointerUp);

    if (!this.dragState) return;
    const ds = this.dragState;
    ds.clone.remove();
    ds.tile.classList.remove('opacity-25');

    if (ds.moved) {
      this._finalize(e);
    }

    this.dragState = null;
  }

  _finalize(e) {
    const container = this._getContainer();
    if (!container) return;

    const tile = this.dragState.tile;
    const pool = container.querySelector('#letter-pool');
    const slots = container.querySelectorAll('#construction-zone > div');
    const poolTiles = container.querySelectorAll('#letter-pool > div');

    const cx = e.clientX;
    const cy = e.clientY;

    for (const slot of slots) {
      const sr = slot.getBoundingClientRect();
      if (cx >= sr.left && cx <= sr.right && cy >= sr.top && cy <= sr.bottom) {
        const occupant = slot.firstElementChild;
        if (occupant && occupant !== tile) {
          const ds = this.dragState;
          ds.originalParent.insertBefore(occupant, ds.originalRef);
        }
        slot.appendChild(tile);
        return;
      }
    }

    for (const other of poolTiles) {
      if (other === tile) continue;
      const r = other.getBoundingClientRect();
      if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) {
        const parentA = tile.parentNode;
        const parentB = other.parentNode;
        const refA = tile.nextSibling;
        const refB = other.nextSibling;
        parentA.insertBefore(other, refA);
        parentB.insertBefore(tile, refB);
        return;
      }
    }

    const pr = pool.getBoundingClientRect();
    if (cx >= pr.left && cx <= pr.right && cy >= pr.top && cy <= pr.bottom) {
      pool.appendChild(tile);
      return;
    }
  }

  _onCheck() {
    const container = this._getContainer();
    if (!container) return;

    const arranged = Array.from(
      container.querySelectorAll('#construction-zone > div > div')
    ).map(el => el.textContent.trim());

    const isCorrect = this.model.checkAnswer(arranged);
    const feedback = container.querySelector('#dnd-feedback');

    if (isCorrect) {
      feedback.innerHTML = '<div class="alert alert-success text-center fw-semibold rounded-4 py-2">Correct!</div>';
      container.querySelector('#check-btn').disabled = true;
      container.dispatchEvent(new CustomEvent('exerciseCompleted', { detail: { correct: true }, bubbles: true }));
    } else {
      feedback.innerHTML = '<div class="alert alert-danger text-center fw-semibold rounded-4 py-2">Incorrect – try again</div>';
      setTimeout(() => feedback.innerHTML = '', 1200);
    }
  }
}
