import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const PDF_KEY = "LAST_PDF_UPLOADED";

export class PdfModel {
  static getLastPdf() {
    const pdfText = localStorage.getItem(PDF_KEY);
    if (pdfText != null) {
      return pdfText;
    }
  }
  static async parse(file) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;

    let text = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ") + "\n\n";
    }
    text = text.trim();
    localStorage.setItem(PDF_KEY, text);
    return text;
  }
}
