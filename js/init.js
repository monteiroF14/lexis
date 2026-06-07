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

function updateThemeIcon(theme) {
  const icon = document.getElementById("theme-icon");
  if (icon) icon.textContent = theme === "dark" ? "🌙" : "☀️";
}

function applyThemeUI() {
  const theme = document.documentElement.getAttribute("data-bs-theme");
  const toggle = document.getElementById("theme-toggle");
  if (toggle) toggle.checked = theme === "dark";
  updateNavLogo();
  updateThemeIcon(theme);
}

applyThemeUI();

new MutationObserver(() => {
  updateNavLogo();
  updateThemeIcon(document.documentElement.getAttribute("data-bs-theme"));
}).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["data-bs-theme"]
});

document.getElementById("theme-toggle")?.addEventListener("change", () => {
  const theme = document.getElementById("theme-toggle").checked ? "dark" : "light";
  document.documentElement.setAttribute("data-bs-theme", theme);
  const user = sessionModel.getSession();
  if (user) {
    user.theme = theme;
    sessionModel.updateUser(user);
  }
});

const loginView = new LoginView(sessionModel);
const createAccountView = new CreateAccountView(sessionModel);

document.getElementById("main-container")
  .addEventListener("index:render", () => {
    loginView.attachTrigger();
    createAccountView.attachTrigger();
  });
