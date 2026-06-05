export class CreateAccountView {
  #model;
  #savedHtml = "";

  #formHtml = `
    <div class="d-flex flex-column align-items-center justify-content-center min-vh-100 py-5 px-3">
      <div class="card rounded-4 shadow border-0 p-4 w-100" style="max-width: 420px;">
        <h3 class="text-center fw-normal mb-4" style="font-size: 1.75rem;">Create an account</h3>
        <form id="create-account-form">
          <div class="mb-3">
            <label for="ca-name" class="form-label mb-1">Username</label>
            <input type="text" id="ca-name" class="form-control rounded-4 py-2" required />
          </div>
          <div class="mb-3">
            <label for="ca-email" class="form-label mb-1">Email</label>
            <input type="email" id="ca-email" class="form-control rounded-4 py-2" required />
          </div>
          <div class="mb-4">
            <label for="ca-password" class="form-label mb-1">Password</label>
            <input type="password" id="ca-password" class="form-control rounded-4 py-2" required />
          </div>
          <p id="ca-error" class="alert alert-danger py-2" style="display: none;"></p>
          <button type="submit" class="btn w-100 rounded-4 py-2 mb-2 text-white" style="background-color: #4f46e5; border: none; font-weight: 500;">Confirm</button>
          <button type="button" id="ca-skip" class="btn w-100 rounded-4 py-2" style="background-color: #d1d5db; color: #1f2937; border: none; font-weight: 500;">Continue without an account</button>
        </form>
      </div>
    </div>
  `;

  #render = () => {
    const main = document.getElementById("main-container");
    if (!main) return;

    this.#savedHtml = main.innerHTML;
    main.innerHTML = this.#formHtml;

    document.getElementById("ca-skip").onclick = () => {
      window.location.href = import.meta.env.BASE_URL + "html/dashboard.html";
    };

    document.getElementById("create-account-form").onsubmit = (e) => {
      e.preventDefault();
      const name = document.getElementById("ca-name").value.trim();
      const email = document.getElementById("ca-email").value.trim();
      const password = document.getElementById("ca-password").value;

      const result = this.#model.createAccount({ name, email, password });

      if (!result.ok) {
        const err = document.getElementById("ca-error");
        err.textContent = result.error;
        err.style.display = "block";
      } else {
        console.log("Account created:", result.user);
        window.location.href = import.meta.env.BASE_URL + "html/dashboard.html";
      }
    };
  };

  attachTrigger() {
    document
      .getElementById("get-started-btn")
      ?.addEventListener("click", this.#render);
  }

  constructor(model) {
    this.#model = model;
    this.attachTrigger();
  }
}
