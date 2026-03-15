require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const { connectDB } = require('./config/db')

const authRoutes = require('./routes/auth.routes')
const userRoutes = require('./routes/user.routes')
const convertRoutes = require('./routes/convert.routes')
const paymentRoutes = require('./routes/payment.routes')
const adminRoutes = require('./routes/admin.routes')

const app = express()

// Connect DB
connectDB()

// Security
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}))

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
})
app.use(globalLimiter)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many auth attempts, please try again later.' }
})

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Cookie parser (manual)
app.use((req, _res, next) => {
  const raw = req.headers.cookie || ''
  req.cookies = Object.fromEntries(
    raw.split(';').map(c => c.trim().split('=').map(decodeURIComponent)).filter(p => p.length === 2)
  )
  next()
})

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }))

// Routes
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/convert', convertRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/admin', adminRoutes)

// 404
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }))

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`FileForge API running on port ${PORT}`))

module.exports = app
