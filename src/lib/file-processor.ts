// lib/file-processor.ts
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import mime from "mime-types";

export type ProcessedFile = {
  type: "text" | "image";
  content: string; // Will be raw text OR base64 string
  mimeType: string;
};

export const processFileFromUrl = async (url: string): Promise<ProcessedFile> => {
  // 1. Fetch the file as a binary buffer (NOT text)
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 2. Identify the file type
  // (We use the library 'mime-types' or fallback to checking extension)
  const mimeType = res.headers.get("content-type") ?? mime.lookup(url);
  const contentType: string = typeof mimeType === "string" ? mimeType : "text/plain";

  // 3. Handle Images (Send as Base64 to Gemini)
  if (contentType.startsWith("image/")) {
    return {
      type: "image",
      content: buffer.toString("base64"),
      mimeType: contentType,
    };
  }

  // 4. Handle PDFs (Extract Text)
  if (contentType.includes("pdf") || url.endsWith(".pdf")) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
      const data = await pdfParse(buffer);
      return {
        type: "text",
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        content: `[File: PDF Document]\n${data.text as string}`,
        mimeType: "text/plain",
      };
    } catch (e) {
      console.error("PDF Parse Error", e);
      throw new Error("Could not parse PDF");
    }
  }

  // 5. Handle Word Docs .docx (Extract Text)
  if (contentType.includes("wordprocessingml") || url.endsWith(".docx")) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return {
        type: "text",
        content: `[File: Word Document]\n${result.value}`,
        mimeType: "text/plain",
      };
    } catch (e) {
      console.error("Docx Parse Error", e);
      throw new Error("Could not parse DOCX");
    }
  }

  // 6. Handle legacy .doc files
  if (contentType.includes("msword") || url.endsWith(".doc")) {
    // For .doc files, we'll try mammoth but it may not work perfectly
    try {
      const result = await mammoth.extractRawText({ buffer });
      return {
        type: "text",
        content: `[File: Word Document (Legacy)]\n${result.value}`,
        mimeType: "text/plain",
      };
    } catch (e) {
      console.error("Doc Parse Error - Legacy .doc format may not be fully supported", e);
      throw new Error("Could not parse DOC file. Consider converting to DOCX.");
    }
  }

  // 7. Default: Handle as Plain Text (.txt, etc.)
  return {
    type: "text",
    content: buffer.toString("utf-8"),
    mimeType: "text/plain",
  };
};
