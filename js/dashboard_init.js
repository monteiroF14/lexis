import { SessionModel } from "./models/session_model.js";
import { createAvatar } from "@dicebear/core";
import { bigSmile } from "@dicebear/collection";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import { DashboardModel } from "./models/dashboard_model.js";
import { LevelsView } from "./views/levels_view.js";
import { PdfView } from "./views/pdf_view.js";
import { CustomizationView } from "./views/customization_view.js";
import { StoreView } from "./views/store_view.js";
import { SettingsView } from "./views/settings_view.js";

const sessionModel = new SessionModel();
const session = sessionModel.getSession();

const savedTheme = (session && session.theme) || "light";
document.documentElement.setAttribute("data-bs-theme", savedTheme);

const DEFAULT_AVATAR_OPTIONS = {
  eyes: ["cheery"],
  mouth: ["braces"],
  hair: ["straightHair"],
  skinColor: ["a47539"],
  hairColor: ["238d80"],
  accessories: [],
  accessoriesProbability: 0,
  backgroundColor: ["transparent"],
  size: 128,
};

function getAvatarOptions(user) {
  if (user && user.avatar && Object.keys(user.avatar).length > 0) {
    const opts = { ...DEFAULT_AVATAR_OPTIONS };
    for (const [key, val] of Object.entries(user.avatar)) {
      if (key === "accessories") {
        opts.accessories = Array.isArray(val) ? val : [val];
        opts.accessoriesProbability = opts.accessories.length > 0 ? 100 : 0;
      } else {
        opts[key] = Array.isArray(val) ? val : [val];
      }
    }
    return opts;
  }
  return DEFAULT_AVATAR_OPTIONS;
}

function refreshSidebar() {
  const user = sessionModel.getSession();
  if (!user) return;

  document.querySelector("#user-avatar").src = createAvatar(
    bigSmile,
    getAvatarOptions(user),
  ).toDataUri();

  const nameEl = document.querySelector("#user-name");
  if (nameEl) nameEl.textContent = user.name;

  const levelEl = document.querySelector("#user-level");
  if (levelEl) levelEl.textContent = `Level ${user.level} ${user.currentTitle}`;

  const coinsEl = document.querySelector("#user-coins");
  if (coinsEl) coinsEl.textContent = user.coins;

  const xpEl = document.querySelector("#user-xp");
  if (xpEl) xpEl.textContent = user.xp;

  const progressEl = document.querySelector("#user-progress");
  if (progressEl) {
    const xpInLevel = user.xp % 200;
    progressEl.style.width = `${(xpInLevel / 200) * 100}%`;
  }
}

refreshSidebar();

const dashboardModel = new DashboardModel();
const levelsView = new LevelsView(sessionModel, dashboardModel);
const pdfView = new PdfView(dashboardModel);
const customizationView = new CustomizationView(dashboardModel);
const storeView = new StoreView(sessionModel);
const settingsView = new SettingsView(dashboardModel);
levelsView.render();

const mainContainer = document.querySelector("#main-container");
mainContainer.addEventListener("worksheet:cancel", () => {
  levelsView.render();
  document
    .querySelectorAll("aside")
    .forEach((as) => (as.style.display = "block"));
});

mainContainer.addEventListener("avatar:updated", () => {
  refreshSidebar();
});