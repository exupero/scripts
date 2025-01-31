#!/usr/bin/env node

const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const imageDataURI = require("image-data-uri");
const path = require("path");

async function dataUriToImage(dataUri) {
  const { dataBuffer } = await imageDataURI.decode(dataUri);
  return dataBuffer;
}

async function main(dataUriFilePath, outputPdfPath) {
  const pdfDoc = await PDFDocument.create();

  // Read data URIs from file
  const dataUris = JSON.parse(fs.readFileSync(dataUriFilePath, "utf-8"));

  for (const dataUri of dataUris) {
    const imageBuffer = await dataUriToImage(dataUri);
    const pngImage = await pdfDoc.embedPng(imageBuffer);
    const { width, height } = pngImage.scale(1);

    const page = pdfDoc.addPage([width, height]);
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: width,
      height: height,
    });
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPdfPath, pdfBytes);
}

// Run the main function
const args = process.argv.slice(2);
const dataUriFilePath = path.resolve(args[0]);
const outputPdfPath = path.resolve(args[1]);
main(dataUriFilePath, outputPdfPath);
