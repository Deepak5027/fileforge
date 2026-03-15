const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middleware/auth.middleware')
const Conversion = require('../models/Conversion.model')
const User = require('../models/User.model')

// GET /api/user/dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [total, thisMonth, completed, failed] = await Promise.all([
      Conversion.countDocuments({ userId }),
      Conversion.countDocuments({ userId, createdAt: { $gte: monthStart } }),
      Conversion.countDocuments({ userId, status: 'done' }),
      Conversion.countDocuments({ userId, status: 'failed' }),
    ])

    res.json({ totalConversions: total, thisMonth, completed, failed })
  } catch (err) {
    res.status(500).json({ message: 'Failed to load dashboard' })
  }
})

// GET /api/user/history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query
    const filter = { userId: req.user._id }
    if (status) filter.status = status

    const [conversions, total] = await Promise.all([
      Conversion.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Conversion.countDocuments(filter),
    ])

    res.json({ conversions, total, page: Number(page), limit: Number(limit) })
  } catch {
    res.status(500).json({ message: 'Failed to load history' })
  }
})

// PATCH /api/user/profile
router.patch('/profile', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body
    const updates = {}
    if (name) updates.name = name.trim()

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
    res.json({ user })
  } catch {
    res.status(500).json({ message: 'Update failed' })
  }
})

module.exports = router
