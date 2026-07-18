const mongoose = require('mongoose');

/**
 * ChatMessage Schema
 * Individual user prompt or assistant response in an AI Tutor chat session
 */
const ChatMessageSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatSession',
      required: [true, 'Chat session reference is required']
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: [true, 'Message role is required']
    },
    content: {
      type: String,
      required: [true, 'Message content is required']
    },
    sources: [
      {
        fileName: { type: String, default: '' },
        lessonName: { type: String, default: '' },
        materialId: { type: String, default: '' },
        chunkId: { type: String, default: '' },
        pageNumber: { type: Number },
        score: { type: Number }
      }
    ]
  },
  {
    timestamps: true
  }
);

ChatMessageSchema.index({ sessionId: 1, createdAt: 1 });

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
