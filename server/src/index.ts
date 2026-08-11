import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import crypto from 'crypto'
import { globalLimiter, authLimiter, publicLimiter } from './middleware/rate-limit.middleware'

// Load environment variables
dotenv.config()

import authRoutes from './routes/auth.routes'
import batchRoutes from './routes/batch.routes'
import userRoutes from './routes/user.routes'
import testRoutes from './routes/test.routes'
import producerRoutes from './routes/producer.routes'
import herbRoutes from './routes/herb.routes'
import authorityRoutes from './routes/authority.routes'
import adminRoutes from './routes/admin.routes'
import labRoutes from './routes/lab.routes'
import blockchainRoutes from './routes/blockchain.routes'
import distributorRoutes from './routes/distributor.routes'
import notificationRoutes from './routes/notification.routes'

const app = express()
const PORT = process.env.PORT || 8000

// ─── Middleware ──────────────────────────────────────────

app.use(helmet())

app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}))

// Request Correlation ID
app.use((req: Request, res: Response, next: NextFunction) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] || crypto.randomUUID()
  res.setHeader('X-Request-ID', req.headers['x-request-id'])
  next()
})

app.use(globalLimiter)
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// ─── Health Check ────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'dravya-server',
  })
})

// ─── Routes ─────────────────────────────────────────────

import publicRoutes from './routes/public.routes'

app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/producers', producerRoutes)
app.use('/api/herbs', herbRoutes)
app.use('/api/batches', batchRoutes)
app.use('/api/users', userRoutes)
app.use('/api/authority', authorityRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/lab', labRoutes)
app.use('/api/test', testRoutes)
app.use('/api/blockchain', blockchainRoutes)
app.use('/api/public', publicLimiter, publicRoutes)
app.use('/api/distributors', distributorRoutes)
app.use('/api/notifications', notificationRoutes)

// ─── 404 Handler ────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' })
})

// ─── Global Error Handler ─────────────────────────────────

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[Error] ${req.method} ${req.url}`, err)
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
    // Never send stack traces in responses
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  })
})

// ─── Start Server ───────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🌿 Dravya server running on http://localhost:${PORT}`)
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`)
})

export default app
