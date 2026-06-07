import SpellingModel from "./models/spelling_model.js";
import LetterDndModel from "./models/letter_dnd_model.js";
import MissingLettersModel from "./models/missing_letters_model.js";
import WordOrderModel from "./models/word_order_model.js";
import SpellingView from "./views/spelling_view.js";
import LetterDndView from "./views/letter_dnd_view.js";
import MissingLettersView from "./views/missing_letters_view.js";
import WordOrderView from "./views/word_order_view.js";

const TABS = [
  { label: "Spelling",   Model: SpellingModel,   View: SpellingView,   data: { word: "orange" } },
  { label: "Letter DnD", Model: LetterDndModel,  View: LetterDndView,  data: { word: "apple", hint: "" } },
  { label: "Missing",    Model: MissingLettersModel, View: MissingLettersView, data: { word: "banana" } },
  { label: "Word Order", Model: WordOrderModel,  View: WordOrderView,  data: { sentence: "the cat sat" } },
];

let activeIndex = 0;

const container = document.getElementById("demo-container");
if (!container) {
  document.addEventListener("DOMContentLoaded", () => {
    const retry = document.getElementById("demo-container");
    if (retry) init(retry);
  });
} else {
  init(container);
}

function init(el) {
  render(el);
}

function renderTabs() {
  return TABS.map((t, i) => {
    const active = i === activeIndex;
    const cls = active ? "lexis-tab-active" : "lexis-tab-inactive";
    return `<button class="btn btn-sm rounded-pill px-3 py-1 ${cls}" data-index="${i}">${t.label}</button>`;
  }).join("");
}

function renderDemo(stage) {
  const entry = TABS[activeIndex];
  stage.innerHTML = "";
  const model = new entry.Model(entry.data);
  const view = new entry.View(model, stage);
  view.render();
  stage.addEventListener("exerciseCompleted", (e) => {
    if (e.detail.correct) {
      stage.classList.add("lexis-demo-correct");
      setTimeout(() => stage.classList.remove("lexis-demo-correct"), 1500);
    }
  }, { once: true });
}

function render(container) {
  container.innerHTML = `
    <div class="lexis-demo-tabs">${renderTabs()}</div>
    <div class="lexis-demo-stage rounded-4 d-flex align-items-center justify-content-center"></div>
  `;
  container.querySelectorAll(".lexis-demo-tabs button").forEach(btn =>
    btn.addEventListener("click", (e) => {
      activeIndex = parseInt(e.target.dataset.index);
      render(container);
    })
  );
  const stage = container.querySelector(".lexis-demo-stage");
  renderDemo(stage);
}
