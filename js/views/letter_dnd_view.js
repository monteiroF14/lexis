/*
 * Letter Drag & Drop View – Duolingo-style letter tile exercise.
 * Tiles follow cursor on drag. On drop, cursor position decides placement.
 * Uses only Bootstrap 5 classes + minimal inline sizing.
 */
export default class LetterDndView {
  constructor(model) {
    this.model = model;
    this.container = document.getElementById('main-container');
    this.dragState = null;
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onCheck = this._onCheck.bind(this);
  }

  render() {
    const poolHtml = this.model.letters
      .map((l, i) =>
        `<div class="btn btn-light border fw-bold fs-5 d-flex align-items-center justify-content-center user-select-none" style="width:52px;height:52px;touch-action:none;cursor:grab;" data-idx="${i}">${l}</div>`
      ).join('');

    const slotsHtml = this.model.letters
      .map(() => `<div class="border border-2 rounded-3 d-flex align-items-center justify-content-center" style="width:52px;height:52px;border-style:dashed !important;"></div>`).join('');

    this.container.innerHTML = `
      <div class="card rounded-4 shadow-sm border-0 p-4" style="max-width:520px;margin:0 auto;">
        <div class="text-center mb-3">
          <div class="fs-2 mb-2">🔤</div>
          <h5 class="fw-bold mb-2">Arrange the letters</h5>
          ${this.model.hint ? `<p class="text-secondary small mb-0">${this.model.hint}</p>` : ''}
        </div>
        <div class="d-flex justify-content-center flex-wrap gap-2 p-3 bg-light rounded-3 mb-3" id="construction-zone">${slotsHtml}</div>
        <div class="d-flex justify-content-center flex-wrap gap-2 p-3 rounded-3 border mb-4" id="letter-pool">${poolHtml}</div>
        <button class="btn btn-success w-100 fw-bold rounded-3" id="check-btn">Check</button>
        <div class="mt-3" id="dnd-feedback"></div>
      </div>`;

    this.container.querySelectorAll('#letter-pool > div')
      .forEach(el => el.addEventListener('pointerdown', this._onPointerDown));
    this.container.querySelector('#check-btn').addEventListener('click', this._onCheck);
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
    clone.style.borderColor = '#198754';
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
    const tile = this.dragState.tile;
    const pool = this.container.querySelector('#letter-pool');
    const slots = this.container.querySelectorAll('#construction-zone > div');
    const poolTiles = this.container.querySelectorAll('#letter-pool > div');

    const cx = e.clientX;
    const cy = e.clientY;

    // 1) cursor over a slot → place tile there, displaced tile goes to original spot
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

    // 2) cursor over another pool tile → swap positions
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

    // 3) cursor inside pool area → append to pool
    const pr = pool.getBoundingClientRect();
    if (cx >= pr.left && cx <= pr.right && cy >= pr.top && cy <= pr.bottom) {
      pool.appendChild(tile);
      return;
    }

    // 4) otherwise leave tile where it is
  }

  _onCheck() {
    const arranged = Array.from(
      this.container.querySelectorAll('#construction-zone > div > div')
    ).map(el => el.textContent.trim());

    const isCorrect = this.model.checkAnswer(arranged);
    const feedback = this.container.querySelector('#dnd-feedback');

    if (isCorrect) {
      feedback.innerHTML = '<div class="alert alert-success text-center fw-semibold">Correct!</div>';
      this.container.querySelector('#check-btn').disabled = true;
      this.container.dispatchEvent(new CustomEvent('exerciseCompleted', { detail: { correct: true } }));
    } else {
      feedback.innerHTML = '<div class="alert alert-danger text-center fw-semibold">Incorrect – try again</div>';
      setTimeout(() => feedback.innerHTML = '', 1200);
    }
  }
}
