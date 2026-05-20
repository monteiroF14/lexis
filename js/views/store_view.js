export class StoreView {
  constructor(model) {
    this.model = model;
    const btn = document.querySelector("#btn-store");
    btn.onclick = () => {
      this.render();
    };
  }

  render() {
    const mainContainer = document.querySelector("#main-container");
    mainContainer.innerHTML = `
    <h1>Store</h1>
      `;
  }
}
