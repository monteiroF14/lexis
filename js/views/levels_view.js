import WorksheetModel from "../models/worksheet_model.js";
import HardcoreWorksheetModel from "../models/hardcore_worksheet_model.js";
import WorksheetView from "./worksheet_view.js";

const WORDS = [
  "apple", "banana", "orange", "cat", "dog", "fish",
  "house", "tree", "book", "star", "moon", "sun",
  "bird", "rain", "snow", "cloud", "grass", "river",
];
const SENTENCES = [
  "the quick brown fox jumps", "she sells sea shells",
  "hello world program", "learning is fun",
  "practice makes perfect", "a cat sat on the mat",
];
const TYPES = ["spelling", "letter_dnd", "missing", "word_order"];

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateExercises(count) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const type = rand(TYPES);
    let data;
    switch (type) {
      case "spelling": data = { word: rand(WORDS) }; break;
      case "letter_dnd": data = { word: rand(WORDS), hint: "" }; break;
      case "missing": data = { word: rand(WORDS) }; break;
      case "word_order": data = { sentence: rand(SENTENCES) }; break;
    }
    out.push({ type, data });
  }
  return out;
}

const TOTAL_STEPS = 10;

export class LevelsView {
  constructor(sessionModel, model) {
    this.model = model;
    this.sessionModel = sessionModel;
    this.currentMode = "normal";
    const btn = document.querySelector("#btn-levels");
    if (btn) btn.onclick = () => this.render();
  }

  _getProgress() {
    const user = this.sessionModel.getSession();
    return Math.min(user?.solvedSheets?.length ?? 0, TOTAL_STEPS);
  }

  render() {
    if (window.setActiveTab) window.setActiveTab(null);
    const progress = this._getProgress();
    const mc = document.querySelector("#main-container");
    const isNormal = this.currentMode === "normal";

    mc.innerHTML = `
      <div class="d-flex flex-column align-items-center justify-content-center h-100 py-4">
        <!-- Mode selector -->
        <div class="mb-4">
          <select id="mode-select" class="form-select d-inline-block text-white border-0 rounded-4 px-4 py-2"
                  style="width: 220px; background-color: #4f46e5; text-align: center; text-align-last: center; appearance: none; -webkit-appearance: none;">
            <option value="normal" ${isNormal ? 'selected' : ''}>Normal Mode</option>
            <option value="hardcore" ${!isNormal ? 'selected' : ''}>Hard Mode</option>
          </select>
        </div>

        ${isNormal ? `
        <!-- Path -->
        <div class="position-relative flex-grow-1 d-flex align-items-center justify-content-center">
          <div class="position-relative" style="width: 280px; height: 520px;" id="path-container">
            <svg class="position-absolute w-100 h-100" style="top:0; left:0; pointer-events:none; z-index:0;"
                 viewBox="0 0 280 520" preserveAspectRatio="none">
              ${this._renderConnectors()}
            </svg>
            ${this._renderNodes(progress)}
          </div>
        </div>
        ` : `
        <!-- Hard mode message -->
        <div class="flex-grow-1 d-flex align-items-center justify-content-center">
          <h2 class="fw-normal">Good Luck!</h2>
        </div>
        `}

        <!-- Start button -->
        <div class="mt-3 mb-4">
          <button id="start-btn" class="btn text-white rounded-3 px-5 py-2"
                  style="background-color: #4f46e5; border: none; font-size: 1.1rem; font-weight: 500;">
            Start
          </button>
        </div>
      </div>`;

    // Wire mode select change
    const modeSelect = document.querySelector("#mode-select");
    if (modeSelect) {
      modeSelect.addEventListener("change", () => {
        this.currentMode = modeSelect.value;
        this.render();
      });
    }

    // Wire node clicks (only unlocked/active nodes) in normal mode
    if (isNormal) {
      mc.querySelectorAll('.lvl-node[data-idx]').forEach(el => {
        if (!el.dataset.locked) {
          el.addEventListener('click', () => this._startWorksheet());
        }
      });
    }

    // Wire start button
    const startBtn = document.querySelector("#start-btn");
    if (startBtn) {
      startBtn.addEventListener("click", () => this._startWorksheet());
    }
  }

  _renderConnectors() {
    let html = '';
    const containerH = 520;
    const leftX = 56;
    const rightX = 224;

    for (let i = 0; i < TOTAL_STEPS - 1; i++) {
      const isLeft = i % 2 === 0;
      const x1 = isLeft ? leftX : rightX;
      const y1 = (i / (TOTAL_STEPS - 1)) * containerH;
      const x2 = !isLeft ? leftX : rightX;
      const y2 = ((i + 1) / (TOTAL_STEPS - 1)) * containerH;

      html += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
                     stroke="#9ca3af" stroke-width="2" stroke-dasharray="6 4" />`;
    }
    return html;
  }

  _renderNodes(progress) {
    let html = '';
    const containerH = 520;
    const nodeSize = 44;
    const half = nodeSize / 2;

    for (let i = 0; i < TOTAL_STEPS; i++) {
      const completed = i < progress;
      const active = i === progress;
      const locked = i > progress;
      const isLeft = i % 2 === 0;

      const top = (i / (TOTAL_STEPS - 1)) * containerH - half;
      const left = isLeft ? (56 - half) : (224 - half);

      let bg;
      if (locked) {
        bg = '#450a0a';
      } else if (active) {
        bg = '#dc2626';
      } else {
        bg = '#b91c1c';
      }

      let ring = '';
      if (active) {
        ring = 'box-shadow: 0 0 0 4px white, 0 0 0 7px #60a5fa;';
      }

      let cursor = locked ? 'default' : 'pointer';

      html += `
        <div class="position-absolute rounded-circle lvl-node"
             data-idx="${i}"
             ${locked ? 'data-locked="true"' : ''}
             style="width: ${nodeSize}px; height: ${nodeSize}px; background: ${bg};
                    top: ${top}px; left: ${left}px;
                    ${ring} cursor: ${cursor}; z-index: 1; transition: transform 0.15s;"
             onmouseenter="this.style.transform='scale(1.1)'"
             onmouseleave="this.style.transform='scale(1)'">
        </div>`;
    }
    return html;
  }

  _startWorksheet() {
    const mode = document.querySelector("#mode-select").value;
    const model =
      mode === "hardcore"
        ? new HardcoreWorksheetModel()
        : new WorksheetModel(
            generateExercises(5),
            `worksheet-${Date.now()}`,
            this.sessionModel,
          );
    new WorksheetView(model).render();
  }
}
