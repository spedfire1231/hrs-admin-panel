const mongoose = require('mongoose');

const scriptSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  language: {
    type: String,
    enum: ['en', 'ua', 'ru'],
    default: 'en'
  },
  category: {
    type: String,
    enum: ['script', 'faq', 'question'],
    default: 'script'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date
  },
  ownerEmail: {
    type: String,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Индексы для быстрого поиска
scriptSchema.index({ language: 1, category: 1, isActive: 1 });

module.exports = mongoose.model('Script', scriptSchema);