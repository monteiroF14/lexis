export class PdfView {
  constructor(model) {
    this.model = model;
    const btn = document.querySelector("#btn-pdf");
    btn.onclick = () => {
      this.render();
    };
  }

  render() {
    const mainContainer = document.querySelector("#main-container");
    mainContainer.innerHTML = `
    <h1>PDFs</h1>
      `;
  }
}
