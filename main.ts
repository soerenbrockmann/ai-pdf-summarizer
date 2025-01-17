import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Function to read PDF files from a folder
async function readPDFFolder(folderPath: string): Promise<string[]> {
  const pdfFiles = fs
    .readdirSync(folderPath)
    .filter((file) => path.extname(file).toLowerCase() === ".pdf");
  const pdfTexts: string[] = [];

  for (const pdfFile of pdfFiles) {
    const filePath = path.join(folderPath, pdfFile);
    const fileBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(fileBuffer);
    pdfTexts.push(pdfData.text);
  }

  return pdfTexts;
}

// Function to summarize text using a language model
async function summarizeText(pdfText: string): Promise<string> {
  const prompt = `Summarize this text: ${pdfText}. Also add the title on top.`;

  try {
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
    });

    return text;
  } catch (error) {
    console.error("Error summarizing text:", error);
    throw new Error("Failed to summarize text");
  }
}

// Function to create a PDF with summaries
async function createSummaryPDF(
  fileSummaries: { fileName: string; summary: string }[],
  outputFilePath: string
): Promise<void> {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  fileSummaries.forEach(({ fileName, summary }, index) => {
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
    const fontSize = 12;

    // Title text with file name
    const title = `File: ${fileName}`;

    // Draw the file name at the top
    page.drawText(title, {
      x: 50,
      y: height - 50,
      size: fontSize + 2,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });

    // Draw the summary below the file name
    page.drawText(summary, {
      x: 50,
      y: height - 80,
      size: fontSize,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
      lineHeight: 14,
      maxWidth: width - 100,
    });
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputFilePath, pdfBytes);
}

// Main function
async function main() {
  const folderPath = "./pdfs"; // Folder containing the input PDFs
  const outputFilePath = "./summaries.pdf"; // Output PDF file

  try {
    console.log("Reading PDF files...");
    const pdfFiles = fs
      .readdirSync(folderPath)
      .filter((file) => path.extname(file).toLowerCase() === ".pdf");
    const fileSummaries: { fileName: string; summary: string }[] = [];

    for (const pdfFile of pdfFiles) {
      const filePath = path.join(folderPath, pdfFile);
      const fileBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(fileBuffer);

      console.log(`Summarizing ${pdfFile}...`);
      const summary = await summarizeText(pdfData.text);

      fileSummaries.push({ fileName: pdfFile, summary });
    }

    console.log("Creating summary PDF...");
    await createSummaryPDF(fileSummaries, outputFilePath);

    console.log(`Summary PDF created successfully at ${outputFilePath}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
