const KnowledgeDocument = require('../../models/knowledgeDocument.model');
const LearningMaterial = require('../../models/material.model');
const Lesson = require('../../models/lesson.model');
const textExtractor = require('./textExtractor.service');
const textChunker = require('./textChunker.service');
const embeddingService = require('../ai/embedding.service');
const vectorStoreService = require('./vectorStore.service');

/**
 * Document Processor Service
 * Background processing pipeline: Extraction -> Cleaning -> Chunker -> Embedding -> Pinecone Vector Store
 */

/**
 * Process a learning material document and vectorize it into Pinecone
 * @param {string} materialId 
 * @param {string} userId 
 */
const processMaterialDocument = async (materialId, userId) => {
  const material = await LearningMaterial.findById(materialId);
  if (!material) {
    throw new Error('Learning material not found');
  }

  const lesson = await Lesson.findById(material.lessonId);
  const lessonName = lesson ? lesson.title : 'General Lesson';

  // 1. Create or fetch KnowledgeDocument tracking record
  let kDoc = await KnowledgeDocument.findOne({ materialId: material._id });
  if (!kDoc) {
    kDoc = await KnowledgeDocument.create({
      courseId: material.courseId,
      lessonId: material.lessonId,
      materialId: material._id,
      fileName: material.fileName,
      fileType: material.fileType || 'document',
      sourceUrl: material.fileUrl,
      processingStatus: 'PROCESSING',
      createdBy: userId || material.uploadedBy
    });
  } else {
    kDoc.processingStatus = 'PROCESSING';
    kDoc.errorMessage = '';
    await kDoc.save();
  }

  try {
    console.log(`[Document Processor] Starting extraction for material: ${material.fileName}`);

    // 2. Extract Text
    const extractionResult = await textExtractor.extractTextFromDocument(
      material.fileUrl,
      material.fileType
    );

    if (!extractionResult.text || extractionResult.text.trim().length === 0) {
      throw new Error('No readable text content could be extracted from this document.');
    }

    // Save extracted text summary on material for quick reference
    material.extractedText = extractionResult.text.slice(0, 5000);
    await material.save();

    // 3. Split into Chunks
    console.log(`[Document Processor] Splitting text into chunks...`);
    const chunks = await textChunker.chunkDocumentPages(extractionResult.pages);

    if (chunks.length === 0) {
      throw new Error('Document contained no valid semantic text chunks after processing.');
    }

    kDoc.embeddingStatus = 'IN_PROGRESS';
    kDoc.chunkCount = chunks.length;
    await kDoc.save();

    // 4. Generate Embeddings & Build Vector Records
    console.log(`[Document Processor] Generating embeddings for ${chunks.length} chunks...`);
    const chunkTexts = chunks.map(c => c.content);
    const embeddings = await embeddingService.generateBatchEmbeddings(chunkTexts);

    const vectorRecords = chunks.map((chunk, index) => ({
      id: `doc_${kDoc._id}_${chunk.chunkId}`,
      vector: embeddings[index],
      metadata: {
        documentId: kDoc._id.toString(),
        courseId: material.courseId.toString(),
        lessonId: material.lessonId.toString(),
        materialId: material._id.toString(),
        fileName: material.fileName,
        lessonName: lessonName,
        pageNumber: chunk.pageNumber,
        chunkId: chunk.chunkId,
        text: chunk.content
      }
    }));

    // 5. Upsert Vectors to Pinecone
    console.log(`[Document Processor] Upserting ${vectorRecords.length} vectors to Pinecone...`);
    await vectorStoreService.upsertVectors(vectorRecords);

    // 6. Update KnowledgeDocument Status to COMPLETED
    kDoc.processingStatus = 'COMPLETED';
    kDoc.embeddingStatus = 'COMPLETED';
    kDoc.errorMessage = '';
    await kDoc.save();

    console.log(`[Document Processor] Successfully completed vector processing for ${material.fileName}`);
    return kDoc;
  } catch (error) {
    console.error(`[Document Processor] Failed to process document ${material.fileName}:`, error.message);
    kDoc.processingStatus = 'FAILED';
    kDoc.embeddingStatus = 'FAILED';
    kDoc.errorMessage = error.message;
    await kDoc.save();
    throw error;
  }
};

module.exports = {
  processMaterialDocument
};
