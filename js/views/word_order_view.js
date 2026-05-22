/*
 * Word Order View – lets the user click shuffled words to build the sentence.
 */
export default class WordOrderView {
  constructor(model) {
    this.model = model;
    this.container = document.getElementById('main-container');
    this.selected = [];
    this._onWordClick = this._onWordClick.bind(this);
    this._onUndo = this._onUndo.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
  }

  render() {
    const wordsHtml = this.model.shuffled
      .map((w, i) => `<button class="btn btn-outline-secondary me-2 mb-2 word-chip" data-index="${i}">${w}</button>`)
      .join('');
    this.container.innerHTML = `
      <div class="card rounded-4 shadow-sm border-0 p-4">
        <h5 class="mb-3">Arrange the words in correct order</h5>
        <div id="sentence-zone" class="border p-2 mb-3 min-height-50 d-flex flex-wrap align-items-center"></div>
        <div id="word-pool" class="d-flex flex-wrap">${wordsHtml}</div>
        <button id="undo-btn" class="btn btn-secondary mt-3 me-2">Undo last</button>
        <button id="submit-btn" class="btn btn-primary mt-3">Submit</button>
        <div id="order-feedback" class="mt-3"></div>
      </div>`;
    this.container.querySelectorAll('.word-chip').forEach(btn => btn.addEventListener('click', this._onWordClick));
    this.container.querySelector('#undo-btn').addEventListener('click', this._onUndo);
    this.container.querySelector('#submit-btn').addEventListener('click', this._onSubmit);
  }

  _onWordClick(e) {
    const btn = e.currentTarget;
    const idx = btn.getAttribute('data-index');
    const word = btn.textContent;
    this.selected.push({ idx, word });
    // move button to sentence zone and style it
    btn.classList.remove('btn-outline-secondary');
    btn.classList.add('btn-success');
    btn.disabled = true;
    this.container.querySelector('#sentence-zone').appendChild(btn);
  }

  _onUndo() {
    if (!this.selected.length) return;
    const last = this.selected.pop();
    const zone = this.container.querySelector('#sentence-zone');
    const btn = zone.querySelector(`button[data-index='${last.idx}']`);
    if (btn) {
      btn.classList.remove('btn-success');
      btn.classList.add('btn-outline-secondary');
      btn.disabled = false;
      this.container.querySelector('#word-pool').appendChild(btn);
    }
  }

  _onSubmit() {
    const ordered = this.selected.map(s => s.word);
    const isCorrect = this.model.checkAnswer(ordered);
    const feedback = this.container.querySelector('#order-feedback');
    if (isCorrect) {
      feedback.innerHTML = '<div class="alert alert-success">✅ Correct sentence!</div>';
      const event = new CustomEvent('exerciseCompleted', { detail: { correct: true } });
      this.container.dispatchEvent(event);
    } else {
      feedback.innerHTML = '<div class="alert alert-danger">❌ Incorrect order. Try again.</div>';
    }
  }
}
