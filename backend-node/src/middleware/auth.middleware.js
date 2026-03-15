const { verifyAccess } = require('../services/jwt.service')
const User = require('../models/User.model')

async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.accessToken ||
      req.headers.authorization?.replace('Bearer ', '')

    if (!token) return res.status(401).json({ message: 'Authentication required' })

    const decoded = verifyAccess(token)
    const user = await User.findById(decoded.userId).select('-password')

    if (!user) return res.status(401).json({ message: 'User not found' })
    if (user.isBlocked) return res.status(403).json({ message: 'Account blocked. Contact support.' })

    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' })
    }
    return res.status(401).json({ message: 'Invalid token' })
  }
}

async function adminMiddleware(req, res, next) {
  await authMiddleware(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }
    next()
  })
}

async function planMiddleware(req, res, next) {
  const user = req.user
  if (user.plan === 'premium') return next()
  if (user.conversionsUsed >= 5) {
    return res.status(402).json({
      message: 'Free conversion limit reached. Upgrade to Premium.',
      code: 'LIMIT_REACHED'
    })
  }
  next()
}

module.exports = { authMiddleware, adminMiddleware, planMiddleware }
