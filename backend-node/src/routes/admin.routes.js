const express = require('express')
const router = express.Router()
const { adminMiddleware } = require('../middleware/auth.middleware')
const User = require('../models/User.model')
const Payment = require('../models/Payment.model')
const Conversion = require('../models/Conversion.model')

// All admin routes require admin role
router.use(adminMiddleware)

// GET /api/admin/stats
router.get('/stats', async (_req, res) => {
  try {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [totalUsers, premiumUsers, totalConversions, revenueResult] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ plan: 'premium' }),
      Conversion.countDocuments(),
      Payment.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
    ])

    res.json({
      totalUsers,
      premiumUsers,
      totalConversions,
      totalRevenue: revenueResult[0]?.total ? Math.floor(revenueResult[0].total / 100) : 0,
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to load stats' })
  }
})

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query
    const filter = {}
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)).lean(),
      User.countDocuments(filter),
    ])

    res.json({ users, total })
  } catch {
    res.status(500).json({ message: 'Failed to load users' })
  }
})

// PATCH /api/admin/users/:id/block
router.patch('/users/:id/block', async (req, res) => {
  try {
    const { blocked } = req.body
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: blocked },
      { new: true }
    )
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user, message: blocked ? 'User blocked' : 'User unblocked' })
  } catch {
    res.status(500).json({ message: 'Action failed' })
  }
})

// GET /api/admin/payments
router.get('/payments', async (req, res) => {
  try {
    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('userId', 'name email')
      .lean()
    res.json({ payments })
  } catch {
    res.status(500).json({ message: 'Failed to load payments' })
  }
})

// GET /api/admin/conversions
router.get('/conversions', async (req, res) => {
  try {
    const conversions = await Conversion.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('userId', 'name email')
      .lean()
    res.json({ conversions })
  } catch {
    res.status(500).json({ message: 'Failed to load conversions' })
  }
})

module.exports = router
