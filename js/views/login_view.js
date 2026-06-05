export class LoginView {
  #model;
  #savedHtml = "";

  #render = () => {
    const main = document.getElementById("main-container");
    if (!main) return;
    this.#savedHtml = main.innerHTML;
    main.innerHTML = `
      <div class="d-flex flex-column align-items-center justify-content-center min-vh-100 py-5 px-3">
        <div class="card rounded-4 shadow border-0 p-4 w-100 lexis-card-sm">
          <h3 class="text-center fw-normal mb-4 lexis-heading-sm">Login</h3>
          <form id="login-form">
            <div class="mb-3"><label for="login-identifier" class="form-label mb-1">Username / Email</label><input type="text" id="login-identifier" class="form-control rounded-4 py-2" required /></div>
            <div class="mb-4"><label for="login-password" class="form-label mb-1">Password</label><input type="password" id="login-password" class="form-control rounded-4 py-2" required /></div>
            <p id="login-error" class="alert alert-danger py-2" style="display: none;"></p>
            <button type="submit" class="btn w-100 rounded-4 py-2 mb-2 text-white lexis-btn-primary lexis-fw-500">Confirm</button>
            <button type="button" id="return-btn" class="btn w-100 rounded-4 py-2 lexis-btn-undo lexis-fw-500">Back</button>
          </form>
        </div>
      </div>`;
    document.getElementById("return-btn").onclick = () => { main.innerHTML = this.#savedHtml; main.dispatchEvent(new CustomEvent("index:render")); };
    document.getElementById("login-form").onsubmit = (e) => {
      e.preventDefault();
      const r = this.#model.login(document.getElementById("login-identifier").value, document.getElementById("login-password").value);
      if (!r.ok) { const err = document.getElementById("login-error"); err.textContent = r.error; err.style.display = "block"; }
      else window.location.href = import.meta.env.BASE_URL + "html/dashboard.html";
    };
  };

  attachTrigger() { document.getElementById("login-btn")?.addEventListener("click", this.#render); }
  constructor(model) { this.#model = model; this.attachTrigger(); }
}
