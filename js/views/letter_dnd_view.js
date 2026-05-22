/*
 * Letter Drag & Drop View – renders draggable tiles and drop zone.
 * Allows re‑dragging letters from the drop zone back to the pool (Duolingo‑style).
 */
export default class LetterDndView {
  constructor(model) {
    this.model = model;
    this.container = document.getElementById('main-container');
    this._onDragStart = this._onDragStart.bind(this);
    this._onDrop = this._onDrop.bind(this);
    this._onDragOver = this._onDragOver.bind(this);
    this._onCheck = this._onCheck.bind(this);
  }

  render() {
    const lettersHtml = this.model.letters
      .map(
        (l, i) => `<div class="badge bg-secondary me-2 mb-2 p-2" draggable="true" data-index="${i}" data-source="pool">${l}</div>`
      )
      .join('');
    this.container.innerHTML = `
      <div class="card rounded-4 shadow-sm border-0 p-4">
        <h5 class="mb-3">Arrange the letters to form the word</h5>
        ${this.model.hint ? `<div class="mb-2">Hint: ${this.model.hint}</div>` : ''}
        <div class="d-flex flex-wrap mb-3" id="letter-pool">${lettersHtml}</div>
        <div id="drop-zone" class="border border-2 border-dashed p-3 min-height-100 d-flex flex-wrap"></div>
        <button id="check-btn" class="btn btn-primary mt-3">Check</button>
        <div id="dnd-feedback" class="mt-3"></div>
      </div>`;
    // pool listeners
    this.container.querySelectorAll('#letter-pool [draggable]')
      .forEach(el => el.addEventListener('dragstart', this._onDragStart));
    // drop zone listeners (both pool and zone accept drops)
    const dropZone = this.container.querySelector('#drop-zone');
    dropZone.addEventListener('dragover', this._onDragOver);
    dropZone.addEventListener('drop', this._onDrop);
    // also allow dropping back onto pool
    const pool = this.container.querySelector('#letter-pool');
    pool.addEventListener('dragover', this._onDragOver);
    pool.addEventListener('drop', this._onDrop);
    this.container.querySelector('#check-btn').addEventListener('click', this._onCheck);
  }

  _onDragStart(e) {
    const index = e.target.getAttribute('data-index');
    const source = e.target.getAttribute('data-source'); // 'pool' or 'zone'
    e.dataTransfer.setData('text/plain', JSON.stringify({ index, source }));
  }

  _onDragOver(e) {
    e.preventDefault(); // necessary to allow drop
  }

  _onDrop(e) {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const { index, source } = data;
    const tile = this.container.querySelector(`[data-index='${index}']`);
    if (!tile) return;
    // update source attribute based on new container
    if (e.currentTarget.id === 'drop-zone') {
      tile.setAttribute('data-source', 'zone');
      e.currentTarget.appendChild(tile);
    } else if (e.currentTarget.id === 'letter-pool') {
      tile.setAttribute('data-source', 'pool');
      e.currentTarget.appendChild(tile);
    }
  }

  _onCheck() {
    const arranged = Array.from(this.container.querySelectorAll('#drop-zone .badge'))
      .map(el => el.textContent.trim());
    const isCorrect = this.model.checkAnswer(arranged);
    const feedback = this.container.querySelector('#dnd-feedback');
    if (isCorrect) {
      feedback.innerHTML = '<div class="alert alert-success">✅ Correct!</div>';
      const event = new CustomEvent('exerciseCompleted', { detail: { correct: true } });
      this.container.dispatchEvent(event);
    } else {
      feedback.innerHTML = '<div class="alert alert-danger">❌ Incorrect – try again</div>';
      this.container.querySelector('#drop-zone').classList.add('shake');
      setTimeout(() => this.container.querySelector('#drop-zone').classList.remove('shake'), 500);
    }
  }
}
