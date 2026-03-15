const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  plan: { type: String, enum: ['free', 'premium'], default: 'free' },
  conversionsUsed: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  razorpaySubscriptionId: String,
  planExpiresAt: Date,
}, { timestamps: true })

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function(plain) {
  return bcrypt.compare(plain, this.password)
}

userSchema.methods.toJSON = function() {
  const obj = this.toObject()
  delete obj.password
  delete obj.__v
  return obj
}

module.exports = mongoose.model('User', userSchema)
