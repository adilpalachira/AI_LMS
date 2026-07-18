const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
const config = require('../../config/aiConfig');

/**
 * Text Chunker Service
 * Splits extracted document text into semantic chunks with metadata
 */

/**
 * Chunk a single document string or page-mapped text
 * @param {Array<{ pageNumber: number, text: string }>} pages 
 * @param {Object} options 
 * @returns {Promise<Array<{ chunkId: string, content: string, pageNumber: number, chunkIndex: number }>>}
 */
const chunkDocumentPages = async (pages, options = {}) => {
  const chunkSize = options.chunkSize || config.CHUNK_SIZE;
  const chunkOverlap = options.chunkOverlap || config.CHUNK_OVERLAP;

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    separators: ['\n\n', '\n', '. ', '? ', '! ', '; ', ' ', '']
  });

  const chunks = [];
  let globalChunkIndex = 0;

  for (const page of pages) {
    if (!page.text || !page.text.trim()) continue;

    const pageDocs = await splitter.createDocuments(
      [page.text],
      [{ pageNumber: page.pageNumber }]
    );

    for (const doc of pageDocs) {
      if (doc.pageContent && doc.pageContent.trim().length > 10) {
        chunks.push({
          chunkId: `chunk_${globalChunkIndex}_p${page.pageNumber}`,
          content: doc.pageContent.trim(),
          pageNumber: page.pageNumber,
          chunkIndex: globalChunkIndex
        });
        globalChunkIndex++;
      }
    }
  }

  return chunks;
};

module.exports = {
  chunkDocumentPages
};
