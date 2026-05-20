export class CustomizationView {
  constructor(model) {
    this.model = model;
    const btn = document.querySelector("#btn-customization");
    btn.onclick = () => {
      this.render();
    };
  }

  render() {
    const mainContainer = document.querySelector("#main-container");
    mainContainer.innerHTML = `
    <h1>Customization</h1>
      `;
  }
}
