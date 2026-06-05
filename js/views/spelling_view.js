/*
 * Spelling Exercise View – renders the spelling selector UI.
 */
import SpellingModel from '../models/spelling_model.js';

export default class SpellingView {
  constructor(model) {
    this.model = model;
    this._onOptionClick = this._onOptionClick.bind(this);
  }

  render() {
    const container = document.getElementById('exercise-container') || document.getElementById('main-container');
    if (!container) return;

    const { options } = this.model;
    container.innerHTML = `
      <div class="w-100 d-flex flex-column align-items-center gap-4" style="max-width: 500px;">
        <div class="bg-white rounded-4 shadow-sm px-4 py-3 text-center w-100">
          Choose the correct spelling!
        </div>
        ${options.map((opt) => `
          <button class="btn bg-white rounded-4 w-100 py-3 text-center shadow-sm"
                  style="border: none; font-size: 1.1rem; transition: transform 0.1s;"
                  data-opt="${opt}">
            ${opt}
          </button>
        `).join('')}
        <div id="spelling-feedback" class="mt-2"></div>
      </div>`;

    container.querySelectorAll('button[data-opt]').forEach(btn => {
      btn.addEventListener('click', this._onOptionClick);
      btn.addEventListener('mouseenter', () => btn.style.transform = 'scale(1.02)');
      btn.addEventListener('mouseleave', () => btn.style.transform = 'scale(1)');
    });
  }

  _onOptionClick(e) {
    const choice = e.currentTarget.getAttribute('data-opt');
    const isCorrect = this.model.checkAnswer(choice);
    const feedback = document.getElementById('spelling-feedback');
    if (isCorrect) {
      feedback.innerHTML = '<div class="alert alert-success rounded-4 py-2">Correct!</div>';
      this._disableButtons();
      const event = new CustomEvent('exerciseCompleted', { detail: { correct: true }, bubbles: true });
      const container = document.getElementById('exercise-container') || document.getElementById('main-container');
      if (container) container.dispatchEvent(event);
    } else {
      feedback.innerHTML = '<div class="alert alert-danger rounded-4 py-2">Try again</div>';
    }
  }

  _disableButtons() {
    const container = document.getElementById('exercise-container') || document.getElementById('main-container');
    if (!container) return;
    container.querySelectorAll('button[data-opt]').forEach(btn => btn.setAttribute('disabled', 'true'));
  }
}
