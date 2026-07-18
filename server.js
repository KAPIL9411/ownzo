/**
 * Express.js Backend Server for Railway
 * This extracts all /api routes from Next.js and runs them as a standalone API
 */

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// CORS - Allow Vercel frontend
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://ownzo.vercel.app',
  'https://ownzo.in',
  'https://www.ownzo.in'
]

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  })
})

// Import and mount API routes
// NOTE: You'll need to convert your Next.js API routes to Express routes
// For now, this is a placeholder structure

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend API is running!' })
})

// Example: Auth routes
// const authRoutes = require('./backend/routes/auth')
// app.use('/api/auth', authRoutes)

// Example: Listings routes
// const listingsRoutes = require('./backend/routes/listings')
// app.use('/api/listings', listingsRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend API running on port ${PORT}`)
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
})

module.exports = app
