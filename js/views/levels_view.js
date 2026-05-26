import WorksheetModel from "../models/worksheet_model.js";
import HardcoreWorksheetModel from "../models/hardcore_worksheet_model.js";
import WorksheetView from "./worksheet_view.js";
import * as bootstrap from "bootstrap";

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

function stepLabel(i) {
  return `Worksheet ${i + 1}`;
}

export class LevelsView {
  constructor(sessionModel, model) {
    this.model = model;
    this.sessionModel = sessionModel;
    const btn = document.querySelector("#btn-levels");
    if (btn) btn.onclick = () => this.render();
  }

  _getProgress() {
    const user = this.sessionModel.getSession();
    return Math.min(user?.solvedSheets?.length ?? 0, TOTAL_STEPS);
  }

  render() {
    const progress = this._getProgress();
    const mc = document.querySelector("#main-container");
    mc.innerHTML = `
      <div class="card rounded-4 shadow-sm border-0 p-4" style="max-width:520px;margin:0 auto;">
        <div class="d-flex align-items-center justify-content-between mb-4">
          <h3 class="fw-bold mb-0">Learning Path</h3>
          <select id="mode-select" class="form-select" style="width:auto;">
            <option value="normal" selected>Normal</option>
            <option value="hardcore">Hardcore</option>
          </select>
        </div>
        <div class="py-2" id="path-container">${this._renderNodes(progress)}</div>
      </div>`;

    // wire tooltips
    mc.querySelectorAll('[data-bs-toggle="tooltip"]')
      .forEach(el => new bootstrap.Tooltip(el));

    // wire clicks on unlocked nodes
    mc.querySelectorAll('.lvl-node[data-idx]').forEach(el => {
      el.addEventListener('click', () => {
        // hide any lingering tooltips before navigating away
        mc.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(t => {
          const inst = bootstrap.Tooltip.getInstance(t);
          if (inst) inst.hide();
        });
        this._startWorksheet();
      });
    });
  }

  _renderNodes(progress) {
    let html = '';
    for (let i = 0; i < TOTAL_STEPS; i++) {
      const completed = i < progress;
      const active = i === progress;
      const locked = i > progress;
      const label = stepLabel(i);
      const isLeft = i % 2 === 0;

      // button style + icon
      let btnCls, icon;
      if (completed) {
        btnCls = 'btn-success';
        icon = '&#10003;';
      } else if (active) {
        btnCls = 'btn-warning';
        icon = '&#9654;';
      } else {
        btnCls = 'btn-outline-secondary';
        icon = '&#128274;';
      }

      const tooltipTitle = locked ? `${label} - Locked` : `${label} - Play`;

      const nodeBtn = `
        <button
          class="btn ${btnCls} rounded-circle d-flex align-items-center justify-content-center fw-bold lvl-node"
          style="width:56px;height:56px;"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          data-bs-title="${tooltipTitle}"
          ${locked ? 'disabled' : ''}
          data-idx="${i}"
        >
          ${icon}
        </button>`;

      const labelSpan = `<span class="fw-semibold small ${completed ? 'text-success' : active ? 'text-warning' : 'text-muted'}">${label}</span>`;

      // arrow connecting to next step
      const arrow = i < TOTAL_STEPS - 1
        ? `<div class="text-secondary" style="font-size:18px;line-height:1;">&#8595;</div>`
        : '';

      // offset from center to create zigzag
      const offset = isLeft ? 'margin-right:48px;' : 'margin-left:48px;';

      html += `
        <div class="text-center mb-3" style="${offset}">
          <div class="d-inline-flex align-items-center gap-2">
            ${isLeft ? nodeBtn + labelSpan : labelSpan + nodeBtn}
          </div>
          ${arrow ? `<div class="mt-1">${arrow}</div>` : ''}
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
