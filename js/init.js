import { LoginView } from "./views/login_view.js";
import { CreateAccountView } from "./views/create_account_view.js";
import { SessionModel } from "./models/session_model.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

const sessionModel = new SessionModel();
sessionModel.initSession();

const savedUser = sessionModel.getSession();
const savedTheme = (savedUser && savedUser.theme) || "light";
document.documentElement.setAttribute("data-bs-theme", savedTheme);

function updateNavLogo() {
  const logo = document.querySelector("#navbar-logo");
  if (!logo) return;
  const theme = document.documentElement.getAttribute("data-bs-theme");
  const base = import.meta.env.BASE_URL || "";
  logo.src = theme === "dark" ? base + "assets/img/LogoOrange.png" : base + "assets/img/LogoBlue.png";
}

function updateThemeIcon() {
  const theme = document.documentElement.getAttribute("data-bs-theme");
  document.querySelectorAll(".theme-icon").forEach(el => el.textContent = theme === "dark" ? "🌙" : "☀️");
}

function applyThemeUI() {
  const theme = document.documentElement.getAttribute("data-bs-theme");
  document.querySelectorAll(".theme-toggle-input").forEach(el => el.checked = theme === "dark");
  updateNavLogo();
  updateThemeIcon();
}

applyThemeUI();

new MutationObserver(() => {
  updateNavLogo();
  updateThemeIcon();
}).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["data-bs-theme"]
});

document.querySelectorAll(".theme-toggle-input").forEach(el => {
  el.addEventListener("change", () => {
    const theme = el.checked ? "dark" : "light";
    document.documentElement.setAttribute("data-bs-theme", theme);
    const user = sessionModel.getSession();
    if (user) {
      user.theme = theme;
      sessionModel.updateUser(user);
    }
  });
});

const loginView = new LoginView(sessionModel);
const createAccountView = new CreateAccountView(sessionModel);

document.getElementById("main-container")
  .addEventListener("index:render", () => {
    loginView.attachTrigger();
    createAccountView.attachTrigger();
  });

setTimeout(() => {
  document.querySelector(".lexis-landing-hero")?.classList.add("hero-loaded");
}, 300);
