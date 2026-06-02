import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).href;

export class PdfRenderer {
  async renderPdf(file, container) {
    container.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2 text-secondary">Parsing PDF...</p>
      </div>`;

    try {
      const pdf = await getDocument({ data: await file.arrayBuffer() }).promise;
      let html = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        html += `
          <div class="card border-0 bg-white rounded-4 mb-3">
            <div class="card-body">
              <h5 class="fw-bold text-primary mb-3">Page ${pageNum}</h5>
              <div class="mb-0" style="white-space: pre-wrap; font-size: 1.1rem; line-height: 1.8;"></div>
            </div>
          </div>`;
      }

      if (!html) {
        container.innerHTML = `<p class="text-secondary text-center py-4">No text could be extracted from this PDF.</p>`;
      } else {
        container.innerHTML = html;
        const textDivs = container.querySelectorAll(".card-body > div:last-child");
        let pageNum = 1;
        for (const page of await Promise.all(
          Array.from({ length: pdf.numPages }, (_, i) => pdf.getPage(i + 1))
        )) {
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item) => item.str).join(" ");
          textDivs[pageNum - 1].textContent = pageText;
          pageNum++;
        }
      }
    } catch (error) {
      const div = document.createElement("div");
      div.textContent = error.message;
      container.innerHTML = `<div class="alert alert-danger">Error parsing PDF: ${div.innerHTML}</div>`;
    }
  }
}

export class PdfView {
  constructor(model) {
    this.model = model;
    this.pdfRenderer = new PdfRenderer();

    document.querySelector("#btn-pdf")?.addEventListener("click", () => this.render());
  }

  render() {
    const mainContainer = document.querySelector("#main-container");
    if (!mainContainer) return;

    mainContainer.innerHTML = `
      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-body p-4">
          <h2 class="fw-bold mb-2">PDF Reader</h2>
          <p class="text-secondary mb-4">Upload a PDF file to read and extract its text content.</p>
          <input type="file" id="pdf-file-input" accept=".pdf" class="form-control mb-3" />
          <div id="pdf-content" class="mt-4"></div>
        </div>
      </div>
    `;

    document.querySelector("#pdf-file-input").addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        this.pdfRenderer.renderPdf(file, document.querySelector("#pdf-content"));
      }
    });
  }
}

