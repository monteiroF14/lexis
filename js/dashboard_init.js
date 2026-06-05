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

  // Avatar
  const avatarEl = document.querySelector("#user-avatar");
  if (avatarEl) {
    avatarEl.src = createAvatar(bigSmile, getAvatarOptions(user)).toDataUri();
  }

  // Name & level title
  const nameEl = document.querySelector("#user-name");
  if (nameEl) nameEl.textContent = user.name;

  const levelEl = document.querySelector("#user-level");
  if (levelEl) levelEl.textContent = `Level ${user.level} ${user.currentTitle}`;

  // Stats card
  const statsLevel = document.querySelector("#user-stats-level");
  if (statsLevel) statsLevel.textContent = user.level;

  const statsXp = document.querySelector("#user-stats-xp");
  if (statsXp) statsXp.textContent = user.xp;

  const statsCoins = document.querySelector("#user-stats-coins");
  if (statsCoins) statsCoins.textContent = user.coins;

  // Daily XP progress (cap at 200 XP = one level)
  const dailyXpCap = 200;
  const dailyXpPct = Math.min(Math.round((user.xp % dailyXpCap) / dailyXpCap * 100), 100);
  const dailyXpBar = document.querySelector("#daily-xp-bar");
  const dailyXpText = document.querySelector("#daily-xp-text");
  if (dailyXpBar) dailyXpBar.style.width = `${dailyXpPct}%`;
  if (dailyXpText) dailyXpText.textContent = `${dailyXpPct}%`;

  // Daily Coins progress (cap at 100)
  const dailyCoinsCap = 100;
  const dailyCoinsPct = Math.min(Math.round((user.coins / dailyCoinsCap) * 100), 100);
  const dailyCoinsBar = document.querySelector("#daily-coins-bar");
  const dailyCoinsText = document.querySelector("#daily-coins-text");
  if (dailyCoinsBar) dailyCoinsBar.style.width = `${dailyCoinsPct}%`;
  if (dailyCoinsText) dailyCoinsText.textContent = `${dailyCoinsPct}%`;
}

// Apply adapt text on page load
if (session?.adaptText) {
  document.body.classList.add("dyslexic-mode");
}

// Sidebar active tab highlighter – exposed globally so views can call it
window.setActiveSidebar = (activeId) => {
  const ids = ["btn-pdf", "btn-store", "btn-customization", "btn-settings"];
  ids.forEach((id) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    if (id === activeId) {
      btn.style.backgroundColor = "#4f46e5";
      btn.style.color = "white";
    } else {
      btn.style.backgroundColor = "#e5e7eb";
      btn.style.color = "#374151";
    }
  });
};

refreshSidebar();

const dashboardModel = new DashboardModel();
const levelsView = new LevelsView(sessionModel, dashboardModel);
const pdfView = new PdfView(sessionModel);
const customizationView = new CustomizationView(sessionModel);
const storeView = new StoreView(sessionModel);
const settingsView = new SettingsView(sessionModel);
levelsView.render();

// Logo click → home / levels
const logo = document.querySelector("#sidebar-logo");
if (logo) {
  logo.addEventListener("click", () => {
    window.setActiveSidebar(null);
    levelsView.render();
  });
}

// Logout
const logoutBtn = document.querySelector("#btn-logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    sessionModel.logout();
    window.location.href = import.meta.env.BASE_URL + "index.html";
  });
}

const mainContainer = document.querySelector("#main-container");
mainContainer.addEventListener("worksheet:cancel", () => {
  window.setActiveSidebar(null);
  refreshSidebar();
  levelsView.render();
});

mainContainer.addEventListener("avatar:updated", () => {
  refreshSidebar();
});
