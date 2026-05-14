export class CreateAccountView {
  #model;
  #savedHtml = "";

  #formHtml = `
    <form id="create-account-form">
      <h2>Create Account</h2>
      <input type="text"  id="ca-name"     placeholder="Name"     required />
      <input type="email" id="ca-email"    placeholder="Email"    required />
      <input type="password" id="ca-password" placeholder="Password" required />
      <p id="ca-error" style="color:red; display:none;"></p>
      <button type="submit">Create Account</button>
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

    document.getElementById("create-account-form").onsubmit = (e) => {
      e.preventDefault();
      const data = {
        name: document.getElementById("ca-name").value,
        email: document.getElementById("ca-email").value,
        password: document.getElementById("ca-password").value,
      };

      const result = this.#model.createAccount(data); // ← model call

      if (!result.ok) {
        const err = document.getElementById("ca-error");
        err.textContent = result.error;
        err.style.display = "block";
      } else {
        console.log("Account created:", result.user);
        // TODO: navigate to app page
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
