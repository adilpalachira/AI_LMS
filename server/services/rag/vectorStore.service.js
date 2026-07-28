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

/**
 * Perform vector similarity search for a query embedding
 * Filtered by courseId to enforce strict course boundaries
 * @param {number[]} queryVector 
 * @param {string} courseId 
 * @param {number} topK 
 * @returns {Promise<Array<{ id: string, score: number, metadata: Object }>>}
 */
const similaritySearch = async (queryVector, courseId, topK = config.TOP_K) => {
  if (!queryVector || queryVector.length === 0) {
    return [];
  }
  if (!courseId) {
    return [];
  }

  try {
    const ns = getIndexNamespace();
    if (!ns) {
      console.log('[Vector Store] PINECONE_API_KEY not configured. Skipping vector store search.');
      return [];
    }
    const queryResponse = await ns.query({
      vector: queryVector,
      topK,
      includeMetadata: true,
      filter: {
        courseId: { $eq: courseId.toString() }
      }
    });

    const matches = queryResponse.matches || [];
    return matches
      .filter(m => m.score >= config.SIMILARITY_THRESHOLD)
      .map(m => ({
        id: m.id,
        score: m.score,
        metadata: m.metadata || {}
      }));
  } catch (error) {
    console.error('[Vector Store] Similarity Search Warning:', error.message);
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
