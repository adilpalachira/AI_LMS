const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

/**
 * Text Extractor Service
 * Reusable service for extracting clean text from document files (PDF, TXT, MD, etc.)
 */

/**
 * Clean and normalize extracted text string
 * @param {string} text 
 * @returns {string} Cleaned text
 */
const cleanText = (text) => {
  if (!text) return '';
  return text
    .replace(/\0/g, '') // Remove null characters
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/[ \t]+/g, ' ') // Collapse multiple spaces/tabs
    .replace(/\n{3,}/g, '\n\n') // Collapse excessive blank lines
    .trim();
};

/**
 * Extract text from a local PDF file
 * @param {string} relativeOrAbsolutePath 
 * @returns {Promise<{ text: string, pageCount: number, pages: Array<{ pageNumber: number, text: string }> }>}
 */
const extractFromPdf = async (filePath) => {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(__dirname, '../../', filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found at path: ${absolutePath}`);
  }

  const dataBuffer = fs.readFileSync(absolutePath);

  const parser = new PDFParse({ data: dataBuffer });
  const parsed = await parser.getText();
  
  const fullText = cleanText(parsed.text);
  
  // Format the pages array to match expected shape: { pageNumber: number, text: string }
  const formattedPages = (parsed.pages || []).map(p => ({
    pageNumber: p.num,
    text: cleanText(p.text)
  }));

  return {
    text: fullText,
    pageCount: parsed.total || 1,
    pages: formattedPages.length > 0 ? formattedPages : [{ pageNumber: 1, text: fullText }]
  };
};

/**
 * Extract text from plain text file (.txt, .md, .csv)
 * @param {string} filePath 
 * @returns {Promise<{ text: string, pageCount: number, pages: Array<{ pageNumber: number, text: string }> }>}
 */
const extractFromTextFile = async (filePath) => {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(__dirname, '../../', filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found at path: ${absolutePath}`);
  }

  const rawText = fs.readFileSync(absolutePath, 'utf-8');
  const cleaned = cleanText(rawText);

  return {
    text: cleaned,
    pageCount: 1,
    pages: [{ pageNumber: 1, text: cleaned }]
  };
};

/**
 * Extract text based on file category or mime type
 * @param {string} filePath 
 * @param {string} fileType 
 * @returns {Promise<{ text: string, pageCount: number, pages: Array<{ pageNumber: number, text: string }> }>}
 */
const extractTextFromDocument = async (filePath, fileType = 'pdf') => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf' || fileType === 'pdf') {
    return await extractFromPdf(filePath);
  } else if (['.txt', '.md', '.csv', '.json'].includes(ext) || fileType === 'document') {
    return await extractFromTextFile(filePath);
  } else {
    throw new Error(`Unsupported document format for text extraction: ${ext || fileType}`);
  }
};

module.exports = {
  cleanText,
  extractFromPdf,
  extractFromTextFile,
  extractTextFromDocument
};
