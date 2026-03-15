const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  provider: { type: String, enum: ['razorpay', 'stripe'], required: true },
  orderId: String,
  paymentId: String,
  subscriptionId: String,
  sessionId: String,
  amount: Number,
  currency: { type: String, default: 'INR' },
  status: {
    type: String,
    enum: ['created', 'paid', 'failed', 'cancelled', 'refunded'],
    default: 'created',
  },
  planStartDate: Date,
  planEndDate: Date,
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true })

module.exports = mongoose.model('Payment', paymentSchema)
