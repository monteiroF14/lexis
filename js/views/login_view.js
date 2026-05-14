export class LoginView {
  indexHtml = "";

  renderHtml = `
    <h1 id="return-btn">Login</h1>
  `;

  render = () => {
    const main = document.getElementById("main-container");
    if (!main) return;

    this.indexHtml = main.innerHTML;
    main.innerHTML = this.renderHtml;
    document.getElementById("return-btn").onclick = () => {
      main.innerHTML = this.indexHtml;
      const btn = document.getElementById("login-btn");
      if (btn) {
        btn.addEventListener("click", this.render);
      }
    };
  };

  constructor() {
    console.log("bootstrapping login view");

    const btn = document.getElementById("login-btn");
    if (btn) {
      btn.addEventListener("click", this.render);
    }
  }
}
