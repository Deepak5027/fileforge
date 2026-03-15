const mongoose = require('mongoose')

const conversionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  originalFileName: { type: String, required: true },
  originalFormat: { type: String, required: true, lowercase: true },
  targetFormat: { type: String, required: true, lowercase: true },
  fileSize: Number,
  status: {
    type: String,
    enum: ['pending', 'processing', 'done', 'failed'],
    default: 'pending',
    index: true,
  },
  downloadUrl: String,
  storagePath: String,
  error: String,
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    index: { expireAfterSeconds: 0 }
  },
}, { timestamps: true })

module.exports = mongoose.model('Conversion', conversionSchema)
