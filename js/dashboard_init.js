import { SessionModel } from "./models/session_model.js";
import { celebrate } from "./effects.js";
import { createAvatar } from "@dicebear/core";
import { bigSmile } from "@dicebear/collection";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import { LevelsView } from "./views/levels_view.js";
import { PdfView } from "./views/pdf_view.js";
import { ShopView } from "./views/shop_view.js";
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

  // Desktop avatar
  const avatarEl = document.querySelector("#user-avatar");
  if (avatarEl) {
    avatarEl.src = createAvatar(bigSmile, getAvatarOptions(user)).toDataUri();
  }
  // Mobile avatar
  const avatarMob = document.querySelector("#user-avatar-mobile");
  if (avatarMob) {
    avatarMob.src = createAvatar(bigSmile, getAvatarOptions(user)).toDataUri();
  }

  // Desktop name
  const nameEl = document.querySelector("#user-name");
  if (nameEl) nameEl.textContent = user.name;
  // Mobile name
  const nameMob = document.querySelector("#user-name-mobile");
  if (nameMob) nameMob.textContent = user.name;

  // Desktop level title
  const levelEl = document.querySelector("#user-level");
  if (levelEl) levelEl.textContent = `Level ${user.level} ${user.currentTitle}`;
  // Mobile level
  const levelMob = document.querySelector("#user-level-mobile");
  if (levelMob) levelMob.textContent = `Lv.${user.level}`;

  // Desktop stats card
  const statsLevel = document.querySelector("#user-stats-level");
  if (statsLevel) statsLevel.textContent = user.level;
  const statsXp = document.querySelector("#user-stats-xp");
  if (statsXp) statsXp.textContent = user.xp;
  const statsCoins = document.querySelector("#user-stats-coins");
  if (statsCoins) statsCoins.textContent = user.coins;

  // Mobile XP / coins
  const xpMob = document.querySelector("#user-xp-mobile");
  if (xpMob) xpMob.textContent = user.xp;
  const coinsMob = document.querySelector("#user-coins-mobile");
  if (coinsMob) coinsMob.textContent = user.coins;

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

  // Streak display
  const flame = document.querySelector("#streak-flame");
  const count = document.querySelector("#streak-count");
  const best = document.querySelector("#streak-best");
  if (flame) flame.style.opacity = user.streak > 0 ? "1" : "0.4";
  if (count) count.textContent = user.streak;
  if (best) best.textContent = user.longestStreak;
}

// Apply adapt text on page load
if (session?.adaptText) {
  document.body.classList.add("dyslexic-mode");
}

// Tab highlighter – uses data-tab attributes on both desktop and mobile nav buttons
window.setActiveTab = (tab) => {
  document.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.classList.remove("lexis-nav-btn-active");
  });
  if (tab) {
    document.querySelectorAll(`[data-tab="${tab}"]`).forEach((btn) => {
      btn.classList.add("lexis-nav-btn-active");
    });
  }
};

refreshSidebar();

const mainContainer = document.querySelector("#main-container");
window.mainContainer = mainContainer;

const levelsView = new LevelsView(sessionModel);
const pdfView = new PdfView(sessionModel);
const shopView = new ShopView(sessionModel);
const settingsView = new SettingsView(sessionModel);
levelsView.render();

// Logo click → home / levels
const logo = document.querySelector("#sidebar-logo");
if (logo) {
  logo.addEventListener("click", () => {
    window.setActiveTab(null);
    levelsView.render();
  });
}

// Mobile home button → levels
const homeBtn = document.querySelector("#btn-levels-mobile");
if (homeBtn) {
  homeBtn.addEventListener("click", () => {
    window.setActiveTab(null);
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

mainContainer.addEventListener("worksheet:cancel", () => {
  window.setActiveTab(null);
  refreshSidebar();
  levelsView.render();
});

mainContainer.addEventListener("avatar:updated", () => {
  refreshSidebar();
});

const STREAK_MILESTONES = [7, 14, 21, 30, 60, 100];
document.body.addEventListener("streak:updated", (e) => {
  refreshSidebar();
  const { streak, isNewRecord } = e.detail;
  if (streak > 0 && STREAK_MILESTONES.includes(streak)) {
    setTimeout(() => celebrate(), 300);
  }
});
