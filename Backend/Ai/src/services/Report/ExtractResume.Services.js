import { PDFParse } from "pdf-parse";
import ExtractPdfLinks from "./ExtractPdfLinksService.js";

async function ExtractResume(pdfBuffer) {
  let parser;

  try {
    const pdfData = new Uint8Array(pdfBuffer);

    parser = new PDFParse({
      data: pdfData,
    });

    const pdfContent = await parser.getText();

    const extractedText = pdfContent.text?.trim() || "";

    if (!extractedText) {
      throw new Error("Unable to extract resume text");
    }

    const extractedLinks = await ExtractPdfLinks(parser);

    await parser.destroy();
    parser = null;

    return {
      extractedText,
      extractedLinks,
    };

  } finally {
    if (parser) {
      await parser.destroy().catch(() => {});
    }
  }
}

export default ExtractResume;
