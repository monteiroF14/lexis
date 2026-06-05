import { SessionModel } from "../models/session_model.js";

export class SettingsView {
  constructor(sessionModel) {
    this.sessionModel = sessionModel;
    document.querySelectorAll('[data-tab="settings"]').forEach(btn => {
      btn.onclick = () => this.render();
    });
  }

  render() {
    if (window.setActiveTab) window.setActiveTab("settings");
    const user = this.sessionModel.getSession() || {};
    const currentTheme = user.theme || "light";
    const adaptText = user.adaptText || false;

    const mainContainer = document.querySelector("#main-container");
    mainContainer.innerHTML = `
      <div class="d-flex flex-column align-items-center justify-content-center w-100" style="min-height: 100%;">
        <div class="bg-white rounded-4 shadow-sm p-4 w-100" style="max-width: 420px;">
          <!-- Toggles row -->
          <div class="d-flex justify-content-between align-items-center mb-5">
            <div class="d-flex align-items-center gap-2">
              <span class="fw-medium">Adapt text</span>
              <label class="form-check form-switch mb-0" style="min-height: 1.5rem; padding-left: 2.5rem;">
                <input class="form-check-input" type="checkbox" id="adapt-text-toggle"
                  ${adaptText ? "checked" : ""}
                  style="width: 2.5rem; height: 1.25rem; cursor: pointer;">
              </label>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span style="font-size: 1.2rem;">☀️</span>
              <label class="form-check form-switch mb-0" style="min-height: 1.5rem; padding-left: 2.5rem;">
                <input class="form-check-input" type="checkbox" id="dark-mode-toggle"
                  ${currentTheme === "dark" ? "checked" : ""}
                  style="width: 2.5rem; height: 1.25rem; cursor: pointer;">
              </label>
            </div>
          </div>

          <!-- Edit Profile -->
          <h5 class="text-center fw-normal mb-4">Edit Profile</h5>

          <form id="settings-form">
            <div class="mb-3">
              <label for="settings-username" class="form-label">Username</label>
              <input type="text" id="settings-username" class="form-control rounded-4 py-2"
                value="${user.name || ''}" required />
            </div>
            <div class="mb-3">
              <label for="settings-email" class="form-label">Email</label>
              <input type="email" id="settings-email" class="form-control rounded-4 py-2"
                value="${user.email || ''}" required />
            </div>
            <div class="mb-4">
              <label for="settings-password" class="form-label">Password</label>
              <input type="password" id="settings-password" class="form-control rounded-4 py-2"
                value="${user.password || ''}" required />
            </div>
            <p id="settings-error" class="alert alert-danger py-2" style="display: none;"></p>
            <button type="submit" class="btn text-white w-100 rounded-4 py-2"
                    style="background-color: #4f46e5; border: none;">Apply Changes</button>
          </form>
        </div>
      </div>`;

    // Toggle: Adapt text
    const adaptToggle = mainContainer.querySelector("#adapt-text-toggle");
    adaptToggle.addEventListener("change", () => {
      user.adaptText = adaptToggle.checked;
      this.sessionModel.updateUser(user);
      document.body.classList.toggle("dyslexic-mode", adaptToggle.checked);
    });

    // Toggle: Dark mode
    const themeToggle = mainContainer.querySelector("#dark-mode-toggle");
    themeToggle.addEventListener("change", () => {
      const theme = themeToggle.checked ? "dark" : "light";
      user.theme = theme;
      this.sessionModel.updateUser(user);
      document.documentElement.setAttribute("data-bs-theme", theme);
    });

    // Form submit
    mainContainer.querySelector("#settings-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const newName = mainContainer.querySelector("#settings-username").value.trim();
      const newEmail = mainContainer.querySelector("#settings-email").value.trim();
      const newPassword = mainContainer.querySelector("#settings-password").value;

      if (!newName || !newEmail || !newPassword) {
        const err = mainContainer.querySelector("#settings-error");
        err.textContent = "Fill in all fields.";
        err.style.display = "block";
        return;
      }

      user.name = newName;
      user.email = newEmail;
      user.password = newPassword;
      this.sessionModel.updateUser(user);

      mainContainer.dispatchEvent(new CustomEvent("avatar:updated"));

      const err = mainContainer.querySelector("#settings-error");
      err.className = "alert alert-success py-2";
      err.textContent = "Changes applied successfully.";
      err.style.display = "block";
      setTimeout(() => { err.style.display = "none"; err.className = "alert alert-danger py-2"; }, 2000);
    });
  }
}
