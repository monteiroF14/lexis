import { LoginView } from "./views/login_view.js";
import { CreateAccountView } from "./views/create_account_view.js";
import { SessionModel } from "./models/session_model.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import { onThemeChange, setTheme, getTheme, assetUrl } from "./theme.js";

const sessionModel = new SessionModel();
sessionModel.initSession();

const savedUser = sessionModel.getSession();
const savedTheme = (savedUser && savedUser.theme) || "light";
document.documentElement.setAttribute("data-bs-theme", savedTheme);

function updateNavLogo() {
  const logo = document.querySelector("#navbar-logo");
  if (!logo) return;
  logo.src = getTheme() === "dark" ? assetUrl("assets/img/LogoOrange.png") : assetUrl("assets/img/LogoBlue.png");
}

function updateThemeIcon() {
  document.querySelectorAll(".theme-icon").forEach(el =>
    el.textContent = getTheme() === "dark" ? "🌙" : "☀️");
}

function syncToggleState() {
  document.querySelectorAll(".theme-toggle-input").forEach(el =>
    el.checked = getTheme() === "dark");
}

updateNavLogo();
updateThemeIcon();
syncToggleState();

onThemeChange(updateNavLogo);
onThemeChange(updateThemeIcon);
onThemeChange(syncToggleState);

document.querySelectorAll(".theme-toggle-input").forEach(el => {
  el.addEventListener("change", () => {
    setTheme(el.checked ? "dark" : "light");
    const user = sessionModel.getSession();
    if (user) {
      user.theme = getTheme();
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
