const express = require('express')
const router = express.Router()
const User = require('../models/User.model')
const {
  signAccess, signRefresh, verifyRefresh,
  setTokenCookies, clearTokenCookies
} = require('../services/jwt.service')
const { authMiddleware } = require('../middleware/auth.middleware')

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields required' })
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) return res.status(409).json({ message: 'Email already registered' })

    const user = await User.create({ name: name.trim(), email: email.toLowerCase(), password })

    const accessToken = signAccess({ userId: user._id, email: user.email })
    const refreshToken = signRefresh({ userId: user._id })
    setTokenCookies(res, accessToken, refreshToken)

    res.status(201).json({ message: 'Account created', user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Registration failed' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })
    if (user.isBlocked) return res.status(403).json({ message: 'Account blocked. Contact support.' })

    const match = await user.comparePassword(password)
    if (!match) return res.status(401).json({ message: 'Invalid credentials' })

    const accessToken = signAccess({ userId: user._id, email: user.email })
    const refreshToken = signRefresh({ userId: user._id })
    setTokenCookies(res, accessToken, refreshToken)

    res.json({ message: 'Login successful', user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Login failed' })
  }
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  clearTokenCookies(res)
  res.json({ message: 'Logged out' })
})

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refreshToken
    if (!token) return res.status(401).json({ message: 'No refresh token' })

    const decoded = verifyRefresh(token)
    const user = await User.findById(decoded.userId)
    if (!user || user.isBlocked) return res.status(401).json({ message: 'Unauthorized' })

    const accessToken = signAccess({ userId: user._id, email: user.email })
    const refreshToken = signRefresh({ userId: user._id })
    setTokenCookies(res, accessToken, refreshToken)

    res.json({ message: 'Token refreshed' })
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' })
  }
})

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user })
})

module.exports = router
