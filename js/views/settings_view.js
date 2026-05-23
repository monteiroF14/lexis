import { SessionModel } from "../models/session_model.js";

export class SettingsView {
  constructor(model) {
    this.model = model;
    const btn = document.querySelector("#btn-settings");
    if (btn) btn.onclick = () => this.render();
  }

  render() {
    const sessionModel = new SessionModel();
    const session = sessionModel.getSession();
    const user = session && session.user ? session.user : session;
    const currentTheme = (user && user.theme) || "light";
    const mainContainer = document.querySelector("#main-container");
    mainContainer.innerHTML = `
      <div class="card rounded-4 shadow-sm border-0 p-4">
        <h2 class="fw-bold mb-4">Settings</h2>
        <div class="d-flex align-items-center justify-content-between">
          <span class="fs-5">Dark Mode</span>
          <div class="form-check form-switch mb-0">
            <input class="form-check-input" type="checkbox" id="dark-mode-switch"
              ${currentTheme === "dark" ? "checked" : ""}>
          </div>
        </div>
      </div>`;
    const toggle = mainContainer.querySelector("#dark-mode-switch");
    toggle.addEventListener("change", () => {
      const theme = toggle.checked ? "dark" : "light";
      if (user) {
        user.theme = theme;
        sessionModel.updateUser(user);
      }
      document.documentElement.setAttribute("data-bs-theme", theme);
    });
  }
}
