const { Pinecone } = require('@pinecone-database/pinecone');
const config = require('../../config/aiConfig');

/**
 * Vector Store Service (Pinecone Integration)
 * Manages vector index upsertion and similarity search with metadata filtering
 */

let pineconeClient = null;

const getPineconeClient = () => {
  const apiKey = process.env.PINECONE_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }

  if (!pineconeClient) {
    pineconeClient = new Pinecone({ apiKey: apiKey.trim() });
  }
  return pineconeClient;
};

/**
 * Get Pinecone target index namespace
 */
const getIndexNamespace = () => {
  const client = getPineconeClient();
  if (!client) return null;
  const indexName = config.PINECONE_INDEX;
  const namespace = config.PINECONE_NAMESPACE;
  return client.index(indexName).namespace(namespace);
};

/**
 * Upsert document chunks and embeddings to Pinecone vector store
 * @param {Array<{ vector: number[], metadata: Object, id: string }>} vectorRecords 
 */
const upsertVectors = async (vectorRecords) => {
  if (!Array.isArray(vectorRecords) || vectorRecords.length === 0) {
    return;
  }

  try {
    const ns = getIndexNamespace();
    if (!ns) {
      console.log('[Vector Store] PINECONE_API_KEY not configured. Skipping vector store upsert.');
      return;
    }
    const records = vectorRecords.map(r => ({
      id: r.id,
      values: r.vector,
      metadata: r.metadata
    }));

    await ns.upsert(records);
    console.log(`[Vector Store] Successfully upserted ${records.length} vector records to Pinecone.`);
  } catch (error) {
    console.error('[Vector Store] Upsert Warning:', error.message);
  }
};

const LearningMaterial = require('../../models/material.model');

/**
 * Perform vector similarity search for a query embedding
 * Filtered by courseId to enforce strict course boundaries
 * @param {number[]} queryVector 
 * @param {string} courseId 
 * @param {number} topK 
 * @param {string} queryText Optional search text query for local database fallback
 * @returns {Promise<Array<{ id: string, score: number, metadata: Object }>>}
 */
const similaritySearch = async (queryVector, courseId, topK = config.TOP_K, queryText = '') => {
  if (!courseId) {
    return [];
  }

  // 1. Try Pinecone Vector Search
  try {
    const ns = getIndexNamespace();
    if (ns && queryVector && queryVector.length > 0) {
      const queryResponse = await ns.query({
        vector: queryVector,
        topK,
        includeMetadata: true,
        filter: {
          courseId: { $eq: courseId.toString() }
        }
      });

      const matches = queryResponse.matches || [];
      if (matches.length > 0) {
        return matches
          .filter(m => m.score >= config.SIMILARITY_THRESHOLD)
          .map(m => ({
            id: m.id,
            score: m.score,
            metadata: m.metadata || {}
          }));
      }
    }
  } catch (error) {
    console.warn('[Vector Store] Pinecone Query Warning (falling back to local):', error.message);
  }

  // 2. Local MongoDB Text Relevance Fallback when Pinecone is missing/empty
  try {
    console.log('[Vector Store] Performing local database text search fallback...');
    const materials = await LearningMaterial.find({ courseId });
    if (!materials || materials.length === 0) {
      return [];
    }

    // Tokenize query words
    const queryStr = (queryText || '').toLowerCase().replace(/[^\w\s]/g, '').trim();
    const words = queryStr.split(/\s+/).filter(w => w.length > 2);

    const chunks = [];
    for (const mat of materials) {
      if (!mat.extractedText || mat.extractedText.trim() === '') continue;
      
      const text = mat.extractedText;
      const chunkSize = 1000;
      const overlap = 200;
      let i = 0;
      let chunkIdx = 0;
      while (i < text.length) {
        const chunkText = text.substring(i, i + chunkSize);
        chunks.push({
          text: chunkText,
          fileName: mat.fileName,
          materialId: mat._id.toString(),
          lessonId: mat.lessonId?.toString() || '',
          pageNumber: Math.floor(i / 1500) + 1,
          chunkId: chunkIdx++
        });
        i += (chunkSize - overlap);
      }
    }

    if (chunks.length === 0) {
      return [];
    }

    // Score chunks by word occurrences
    const scored = chunks.map(chunk => {
      let score = 0;
      const lowerText = chunk.text.toLowerCase();
      
      if (words.length > 0) {
        words.forEach(word => {
          const occurrences = lowerText.split(word).length - 1;
          score += occurrences * 5; // boost direct word matches
        });
      }
      
      // Add slight length/position bias
      score += (chunk.text.length / 1000) * 0.1;
      return { ...chunk, score };
    });

    // Sort by score descending and return
    const sorted = scored.sort((a, b) => b.score - a.score);
    return sorted.slice(0, topK).map(c => ({
      id: `local_${c.materialId}_${c.chunkId}`,
      score: c.score > 0 ? 0.8 : 0.5,
      metadata: {
        courseId: courseId.toString(),
        lessonId: c.lessonId,
        materialId: c.materialId,
        fileName: c.fileName,
        pageNumber: c.pageNumber,
        chunkId: c.chunkId,
        text: c.text
      }
    }));
  } catch (localErr) {
    console.error('[Vector Store] Local Fallback Search Error:', localErr.message);
    return [];
  }
};

/**
 * Delete vectors associated with a specific materialId or documentId
 * @param {string} materialId 
 */
const deleteVectorsByMaterial = async (materialId) => {
  try {
    const ns = getIndexNamespace();
    await ns.deleteMany({
      materialId: { $eq: materialId.toString() }
    });
    console.log(`[Vector Store] Deleted vectors for materialId: ${materialId}`);
  } catch (error) {
    console.error('[Vector Store] Vector Deletion Error:', error.message);
    // Non-blocking log
  }
};

module.exports = {
  getPineconeClient,
  upsertVectors,
  similaritySearch,
  deleteVectorsByMaterial
};
