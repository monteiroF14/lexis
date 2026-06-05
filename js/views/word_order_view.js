/*
 * Word Order View – lets the user click shuffled words to build the sentence.
 */
export default class WordOrderView {
  constructor(model) {
    this.model = model;
    this.selected = [];
    this._onWordClick = this._onWordClick.bind(this);
    this._onUndo = this._onUndo.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
  }

  _getContainer() {
    return document.getElementById('exercise-container') || document.getElementById('main-container');
  }

  render() {
    const container = this._getContainer();
    if (!container) return;

    const wordsHtml = this.model.shuffled
      .map((w, i) => `<button class="btn bg-white rounded-pill me-2 mb-2 word-chip shadow-sm"
                               style="border: none; font-weight: 500;"
                               data-index="${i}">${w}</button>`)
      .join('');

    container.innerHTML = `
      <div class="w-100 d-flex flex-column align-items-center gap-4" style="max-width: 500px;">
        <div class="bg-white rounded-4 shadow-sm px-4 py-3 text-center w-100">
          Arrange the words in correct order
        </div>
        <div id="sentence-zone" class="bg-white rounded-4 shadow-sm p-3 min-height-50 d-flex flex-wrap align-items-center w-100"
             style="min-height: 60px;"></div>
        <div id="word-pool" class="d-flex flex-wrap justify-content-center">${wordsHtml}</div>
        <div class="d-flex gap-2 w-100">
          <button id="undo-btn" class="btn text-dark rounded-4 py-2 flex-fill"
                  style="background-color: #d1d5db; border: none;">Undo last</button>
          <button id="submit-btn" class="btn text-white rounded-4 py-2 flex-fill"
                  style="background-color: #4f46e5; border: none;">Submit</button>
        </div>
        <div id="order-feedback"></div>
      </div>`;

    container.querySelectorAll('.word-chip').forEach(btn => btn.addEventListener('click', this._onWordClick));
    container.querySelector('#undo-btn').addEventListener('click', this._onUndo);
    container.querySelector('#submit-btn').addEventListener('click', this._onSubmit);
  }

  _onWordClick(e) {
    const container = this._getContainer();
    if (!container) return;

    const btn = e.currentTarget;
    const idx = btn.getAttribute('data-index');
    const word = btn.textContent;
    this.selected.push({ idx, word });
    btn.classList.remove('bg-white');
    btn.style.backgroundColor = '#4f46e5';
    btn.style.color = 'white';
    btn.disabled = true;
    container.querySelector('#sentence-zone').appendChild(btn);
  }

  _onUndo() {
    const container = this._getContainer();
    if (!container) return;

    if (!this.selected.length) return;
    const last = this.selected.pop();
    const zone = container.querySelector('#sentence-zone');
    const btn = zone.querySelector(`button[data-index='${last.idx}']`);
    if (btn) {
      btn.classList.remove('bg-white');
      btn.style.backgroundColor = 'white';
      btn.style.color = '';
      btn.disabled = false;
      container.querySelector('#word-pool').appendChild(btn);
    }
  }

  _onSubmit() {
    const container = this._getContainer();
    if (!container) return;

    const ordered = this.selected.map(s => s.word);
    const isCorrect = this.model.checkAnswer(ordered);
    const feedback = container.querySelector('#order-feedback');
    if (isCorrect) {
      feedback.innerHTML = '<div class="alert alert-success rounded-4 py-2">Correct sentence!</div>';
      const event = new CustomEvent('exerciseCompleted', { detail: { correct: true }, bubbles: true });
      container.dispatchEvent(event);
    } else {
      feedback.innerHTML = '<div class="alert alert-danger rounded-4 py-2">Incorrect order. Try again.</div>';
    }
  }
}
