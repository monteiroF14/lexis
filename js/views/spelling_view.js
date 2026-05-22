/*
 * Spelling Exercise View – renders the spelling selector UI.
 */
import SpellingModel from '../models/spelling_model.js';

export default class SpellingView {
  constructor(model) {
    this.model = model;
    this.container = document.getElementById('main-container');
    this._onOptionClick = this._onOptionClick.bind(this);
  }

  render() {
    const { options } = this.model;
    this.container.innerHTML = `
      <div class="card rounded-4 shadow-sm border-0 p-4">
        <h5 class="mb-3">Select the correct spelling:</h5>
        <div class="list-group">
          ${options
            .map(
              (opt, i) => `<button class="list-group-item list-group-item-action" data-opt="${opt}">${opt}</button>`
            )
            .join('')}
        </div>
        <div id="spelling-feedback" class="mt-3"></div>
      </div>`;
    this.container.querySelectorAll('button[data-opt]').forEach(btn => btn.addEventListener('click', this._onOptionClick));
  }

  _onOptionClick(e) {
    const choice = e.currentTarget.getAttribute('data-opt');
    const isCorrect = this.model.checkAnswer(choice);
    const feedback = document.getElementById('spelling-feedback');
    if (isCorrect) {
      feedback.innerHTML = '<div class="alert alert-success">✅ Correct!</div>';
      this._disableButtons();
      const event = new CustomEvent('exerciseCompleted', { detail: { correct: true } });
      this.container.dispatchEvent(event);
    } else {
      feedback.innerHTML = '<div class="alert alert-danger">❌ Try again</div>';
    }
  }

  _disableButtons() {
    this.container.querySelectorAll('button[data-opt]').forEach(btn => btn.setAttribute('disabled', 'true'));
  }
}
