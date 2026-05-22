import { PdfModel } from "../models/pdf_model.js";

export class PdfView {
  constructor(model) {
    this.model = model;
    const btn = document.querySelector("#btn-pdf");
    if (btn) btn.onclick = () => this.render();
  }

  render() {
    const mainContainer = document.querySelector("#main-container");

    mainContainer.innerHTML = `
      <div class="card rounded-4 shadow-sm border-0 p-4">
        <h2 class="mb-3">Upload PDF</h2>
        <input type="file" id="pdf-input" accept="application/pdf" class="form-control mb-3" />
        <div id="pdf-status" class="mb-2"></div>
        <div id="pdf-content" style="font-family: 'OpenDyslexic', sans-serif; white-space: pre-wrap;"></div>
      </div>`;
    const input = mainContainer.querySelector("#pdf-input");
    const status = mainContainer.querySelector("#pdf-status");
    const contentDiv = mainContainer.querySelector("#pdf-content");
    contentDiv.style.fontFamily = "OpenDyslexic";
    input.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      status.innerHTML = '<div class="alert alert-info">Parsing PDF…</div>';
      try {
        const text = await PdfModel.parse(file);
        contentDiv.textContent = text;
        status.innerHTML = '<div class="alert alert-success">PDF loaded.</div>';
      } catch (err) {
        console.error(err);
        status.innerHTML =
          '<div class="alert alert-danger">Failed to read PDF.</div>';
      }
    });
    if (PdfModel.getLastPdf()) {
      contentDiv.textContent = PdfModel.getLastPdf();
    }
  }
}
