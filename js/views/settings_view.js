export class SettingsView {
  constructor(model) {
    this.model = model;
    const btn = document.querySelector("#btn-settings");
    btn.onclick = () => {
      this.render();
    };
  }

  render() {
    const mainContainer = document.querySelector("#main-container");
    mainContainer.innerHTML = `
    <h1>Settings</h1>
      `;
  }
}
