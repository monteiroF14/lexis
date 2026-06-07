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

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

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
  constructor(sessionModel) {
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
        <div class="mb-4">
          <select id="mode-select" class="form-select d-inline-block text-white border-0 rounded-4 px-4 py-2 lexis-mode-select">
            <option value="normal" ${isNormal ? "selected" : ""}>Normal Mode</option>
            <option value="hardcore" ${!isNormal ? "selected" : ""}>Hard Mode</option>
          </select>
        </div>

        ${isNormal ? `
        <div class="position-relative flex-grow-1 d-flex align-items-center justify-content-center">
          ${progress === 0 ? '<div class="alert lexis-prompt-bar rounded-4 px-4 py-3 text-center position-absolute" style="top:0;z-index:2;font-size:0.95rem;">Complete worksheets to unlock levels along the path!</div>' : ''}
          <div class="position-relative lexis-path" id="path-container">
            <svg class="position-absolute w-100 h-100 lexis-path-svg"
                 viewBox="0 0 280 520" preserveAspectRatio="none">
              ${this._renderConnectors()}
            </svg>
            ${this._renderNodes(progress)}
          </div>
        </div>
        ` : `
        <div class="flex-grow-1 d-flex flex-column align-items-center justify-content-center gap-2">
          <h2 class="fw-normal lexis-text-p">Hard Mode</h2>
          <p class="text-secondary">Earn <span class="lexis-text-orange">${HardcoreWorksheetModel.COIN_REWARD} coin</span> per correct answer</p>
          ${this.sessionModel.getSession().hardcoreBest > 0 ? `<p class="small lexis-text-p">Your best: <strong>${this.sessionModel.getSession().hardcoreBest}</strong> correct</p>` : ''}
          <p class="small text-secondary">One mistake and it's over</p>
        </div>
        `}

        <div class="mt-3 mb-4">
          <button id="start-btn" class="btn text-white rounded-3 px-5 py-2 lexis-btn-start">Start</button>
        </div>
      </div>`;

    const modeSelect = document.querySelector("#mode-select");
    if (modeSelect) {
      modeSelect.addEventListener("change", () => {
        this.currentMode = modeSelect.value;
        this.render();
      });
    }

    if (isNormal) {
      mc.querySelectorAll(".lvl-node[data-idx]").forEach((el) => {
        if (!el.dataset.locked) el.addEventListener("click", () => this._startWorksheet());
      });
    }

    document.querySelector("#start-btn")?.addEventListener("click", () => this._startWorksheet());
  }

  _renderConnectors() {
    let html = "";
    const containerH = 520, leftX = 56, rightX = 224;
    for (let i = 0; i < TOTAL_STEPS - 1; i++) {
      const isLeft = i % 2 === 0;
      html += `<line x1="${isLeft ? leftX : rightX}" y1="${(i / (TOTAL_STEPS - 1)) * containerH}"
                     x2="${!isLeft ? leftX : rightX}" y2="${((i + 1) / (TOTAL_STEPS - 1)) * containerH}"
                     stroke="var(--lexis-connector)" stroke-width="2" stroke-dasharray="6 4" />`;
    }
    return html;
  }

  _renderNodes(progress) {
    let html = "";
    const containerH = 520, nodeSize = 44, half = nodeSize / 2;

    for (let i = 0; i < TOTAL_STEPS; i++) {
      const active = i === progress, locked = i > progress;
      const isLeft = i % 2 === 0;
      const top = (i / (TOTAL_STEPS - 1)) * containerH - half;
      const left = isLeft ? 56 - half : 224 - half;

      let cls = "position-absolute rounded-circle lvl-node lexis-node";
      if (locked) cls += " lexis-node-locked";
      else if (active) cls += " lexis-node-active";
      else cls += " lexis-node-done";

      const ring = active ? "box-shadow: 0 0 0 4px var(--lexis-bg-main), 0 0 0 7px var(--lexis-primary);" : "";

      html += `<div class="${cls}" data-idx="${i}" ${locked ? 'data-locked="true"' : ""}
               style="width:${nodeSize}px;height:${nodeSize}px;top:${top}px;left:${left}px;${ring}"
               onmouseenter="this.style.transform='scale(1.1)'" onmouseleave="this.style.transform='scale(1)'"></div>`;
    }
    return html;
  }

  _startWorksheet() {
    const mode = document.querySelector("#mode-select").value;
    const model = mode === "hardcore"
      ?       new HardcoreWorksheetModel(this.sessionModel)
      : new WorksheetModel(generateExercises(5), `worksheet-${Date.now()}`, this.sessionModel);
    new WorksheetView(model).render();
  }
}
