import { PdfModel } from "../models/pdf_model.js";

export class PdfView {
  constructor(sessionModel) {
    this.pdfModel = new PdfModel(sessionModel);
    document.querySelectorAll('[data-tab="pdf"]').forEach(btn => {
      btn.onclick = () => this.render();
    });
  }

  _renderContent() {
    const mainContainer = document.querySelector("#main-container");
    const pdf = this.pdfModel.getPdf();

    if (pdf) {
      mainContainer.innerHTML = `
        <div class="d-flex flex-column align-items-center py-4 w-100">
          <div class="bg-white rounded-4 shadow-sm p-4 w-100 mb-4" style="max-width: 720px;">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h4 class="mb-0">📄 ${pdf.name}</h4>
              <button id="clear-pdf" class="btn btn-outline-danger rounded-pill btn-sm">Clear</button>
            </div>
            <div id="pdf-content" style="font-family: 'OpenDyslexic', sans-serif; white-space: pre-wrap; max-height: 70vh; overflow-y: auto;">${pdf.text}</div>
          </div>
        </div>`;
      mainContainer.querySelector("#clear-pdf").addEventListener("click", () => {
        this.pdfModel.clearPdf();
        this._renderContent();
      });
      return;
    }

    // No PDF state
    mainContainer.innerHTML = `
      <div class="d-flex flex-column align-items-center justify-content-center w-100" style="min-height: 100%;">
        <!-- Prompt bar -->
        <div class="bg-white rounded-4 shadow-sm px-4 py-3 text-center mb-4 w-100" style="max-width: 720px;">
          You can adapt the font of your files for better comprehension here!
        </div>

        <!-- Hidden file input -->
        <input type="file" id="pdf-input" accept="application/pdf" style="display: none;" />

        <!-- Upload button -->
        <button id="upload-btn" class="btn text-white rounded-4 px-5 py-2"
                style="background-color: #4f46e5; border: none; font-size: 1.1rem;">
          Click here to upload your file
        </button>

        <div id="pdf-status" class="mt-3"></div>
      </div>`;

    const input = mainContainer.querySelector("#pdf-input");
    const uploadBtn = mainContainer.querySelector("#upload-btn");
    const status = mainContainer.querySelector("#pdf-status");

    uploadBtn.addEventListener("click", () => input.click());

    input.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      status.innerHTML = '<div class="alert alert-info rounded-4 py-2 px-3">Parsing PDF…</div>';
      try {
        await this.pdfModel.parseAndSave(file);
        this._renderContent();
      } catch (err) {
        console.error(err);
        status.innerHTML = '<div class="alert alert-danger rounded-4 py-2 px-3">Failed to read PDF.</div>';
      }
    });
  }

  render() {
    if (window.setActiveTab) window.setActiveTab("pdf");
    this._renderContent();
  }
}
