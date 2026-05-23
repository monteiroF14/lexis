import WorksheetModel from "../models/worksheet_model.js";
import HardcoreWorksheetModel from "../models/hardcore_worksheet_model.js";
import WorksheetView from "./worksheet_view.js";

export class LevelsView {
  constructor(model) {
    this.model = model;
    const btn = document.querySelector("#btn-levels");
    if (btn) btn.onclick = () => this.render();
  }

  render() {
    const mainContainer = document.querySelector("#main-container");
    mainContainer.innerHTML = `
      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-body p-4">
          <h2 class="fw-bold mb-2">Level Pathway</h2>
          <p class="text-secondary mb-4">Continue your learning journey step by step.</p>
          <div class="d-flex flex-column gap-3">
            <div class="card border-0 bg-primary-subtle rounded-4">
              <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h5 class="fw-bold mb-1">Level 1 — Beginner</h5>
                  <p class="text-secondary mb-0">Basic reading and spelling exercises</p>
                </div>
                <button class="btn btn-primary rounded-pill px-4">Start</button>
              </div>
            </div>
            <div class="card border-0 bg-light rounded-4">
              <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h5 class="fw-bold mb-1">Level 2 — Intermediate</h5>
                  <p class="text-secondary mb-0">More reading practice and word completion</p>
                </div>
                <button class="btn btn-outline-secondary rounded-pill px-4">Locked</button>
              </div>
            </div>
            <div class="card border-0 bg-light rounded-4">
              <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h5 class="fw-bold mb-1">Level 3 — Advanced</h5>
                  <p class="text-secondary mb-0">Comprehension and harder worksheets</p>
                </div>
                <button class="btn btn-outline-secondary rounded-pill px-4">Locked</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm rounded-4 mb-3">
        <div class="card-body p-4 d-flex align-items-center justify-content-between">
          <h3 class="fw-bold mb-0">Worksheet Mode</h3>
          <select id="mode-select" class="form-select w-auto">
            <option value="normal" selected>Normal</option>
            <option value="hardcore">Hardcore</option>
          </select>
        </div>
      </div>

      <div class="card border-0 shadow-sm rounded-4">
        <div class="card-body p-4">
          <h3 class="fw-bold mb-3">Today’s Worksheets</h3>
          <div class="row g-3">
            <div class="col-md-6">
              <div class="card border-0 bg-white rounded-4 h-100 border">
                <div class="card-body">
                  <h5 class="fw-bold">Reading Practice</h5>
                  <p class="text-secondary small mb-3">Train reading fluency with simple exercises.</p>
                  <button class="btn btn-sm btn-primary rounded-pill px-3">Open</button>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card border-0 bg-white rounded-4 h-100 border">
                <div class="card-body">
                  <h5 class="fw-bold">Word Completion</h5>
                  <p class="text-secondary small mb-3">Fill in missing letters and words.</p>
                  <button class="btn btn-sm btn-primary rounded-pill px-3">Open</button>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card border-0 bg-white rounded-4 h-100 border">
                <div class="card-body">
                  <h5 class="fw-bold">Listening & Speech</h5>
                  <p class="text-secondary small mb-3">Practice pronunciation and verbalization.</p>
                  <button class="btn btn-sm btn-primary rounded-pill px-3">Open</button>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card border-0 bg-white rounded-4 h-100 border">
                <div class="card-body">
                  <h5 class="fw-bold">Comprehension</h5>
                  <p class="text-secondary small mb-3">Read short passages and answer questions.</p>
                  <button class="btn btn-sm btn-primary rounded-pill px-3">Open</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Wire Open buttons to launch a worksheet based on selected mode
    const openButtons = mainContainer.querySelectorAll(
      ".card-body button.btn-primary",
    );
    openButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = document.querySelector('#mode-select').value;
        let model;
        if (mode === 'hardcore') {
          model = new HardcoreWorksheetModel();
        } else {
          const exercises = [
            { type: "missing", data: { word: "banana" } },
            { type: "spelling", data: { word: "apple" } },
            { type: "letter_dnd", data: { word: "cat", hint: "🐱" } },
            {
              type: "word_order",
              data: { sentence: "the quick brown fox jumps" },
            },
          ];
          const worksheetId = `worksheet-${Date.now()}`;
          model = new WorksheetModel(exercises, worksheetId);
        }
        const view = new WorksheetView(model);
        view.render();
      });
    });
  }
}
