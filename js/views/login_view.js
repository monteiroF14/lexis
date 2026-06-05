export class LoginView {
  #model;
  #savedHtml = "";

  #formHtml = `
    <div class="d-flex flex-column align-items-center justify-content-center min-vh-100 py-5 px-3">
      <div class="card rounded-4 shadow border-0 p-4 w-100" style="max-width: 420px;">
        <h3 class="text-center fw-normal mb-4" style="font-size: 1.75rem;">Login</h3>
        <form id="login-form">
          <div class="mb-3">
            <label for="login-identifier" class="form-label mb-1">Username / Email</label>
            <input type="text" id="login-identifier" class="form-control rounded-4 py-2" required />
          </div>
          <div class="mb-4">
            <label for="login-password" class="form-label mb-1">Password</label>
            <input type="password" id="login-password" class="form-control rounded-4 py-2" required />
          </div>
          <p id="login-error" class="alert alert-danger py-2" style="display: none;"></p>
          <button type="submit" class="btn w-100 rounded-4 py-2 mb-2 text-white" style="background-color: #4f46e5; border: none; font-weight: 500;">Confirm</button>
          <button type="button" id="return-btn" class="btn w-100 rounded-4 py-2" style="background-color: #d1d5db; color: #1f2937; border: none; font-weight: 500;">Back</button>
        </form>
      </div>
    </div>
  `;

  #render = () => {
    const main = document.getElementById("main-container");
    if (!main) return;

    this.#savedHtml = main.innerHTML;
    main.innerHTML = this.#formHtml;

    document.getElementById("return-btn").onclick = () => {
      main.innerHTML = this.#savedHtml;
      const indexViewRenderedEvent = new CustomEvent("index:render");
      main.dispatchEvent(indexViewRenderedEvent);
    };

    document.getElementById("login-form").onsubmit = (e) => {
      e.preventDefault();
      const identifier = document.getElementById("login-identifier").value;
      const password = document.getElementById("login-password").value;

      const result = this.#model.login(identifier, password);

      if (!result.ok) {
        const err = document.getElementById("login-error");
        err.textContent = result.error;
        err.style.display = "block";
      } else {
        console.log("Logged in:", result.user);
        window.location.href = import.meta.env.BASE_URL + "html/dashboard.html";
      }
    };
  };

  attachTrigger() {
    document
      .getElementById("login-btn")
      ?.addEventListener("click", this.#render);
  }

  constructor(model) {
    this.#model = model;
    this.attachTrigger();
  }
}
