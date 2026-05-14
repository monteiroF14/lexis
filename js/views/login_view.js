export class LoginView {
  #model;
  #savedHtml = "";

  #formHtml = `
    <form id="login-form">
      <h2>Login</h2>
      <input type="email" id="login-email" placeholder="Email" required />
      <input type="password" id="login-password" placeholder="Password" required />
      <p id="login-error" style="color:red; display:none;"></p>
      <button type="submit">Login</button>
      <button type="button" id="return-btn">Back</button>
    </form>
  `;

  #render = () => {
    const main = document.getElementById("main-container");
    if (!main) return;

    this.#savedHtml = main.innerHTML;
    main.innerHTML = this.#formHtml;

    document.getElementById("return-btn").onclick = () => {
      main.innerHTML = this.#savedHtml;
      const indexViewRenderedEvent = new CustomEvent("indexViewRenderedEvent");
      main.dispatchEvent(indexViewRenderedEvent);
    };

    document.getElementById("login-form").onsubmit = (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      const result = this.#model.login(email, password); // ← model call

      if (!result.ok) {
        const err = document.getElementById("login-error");
        err.textContent = result.error;
        err.style.display = "block";
      } else {
        console.log("Logged in:", result.user);
        // TODO: navigate to app page
        window.location.href = "html/dashboard.html";
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
