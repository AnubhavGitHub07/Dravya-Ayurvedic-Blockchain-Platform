import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

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

const app = express()
const PORT = process.env.PORT || 8000

// ─── Middleware ──────────────────────────────────────────

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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

app.use('/api/auth', authRoutes)
app.use('/api/producers', producerRoutes)
app.use('/api/herbs', herbRoutes)
app.use('/api/batches', batchRoutes)
app.use('/api/users', userRoutes)
app.use('/api/authority', authorityRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/lab', labRoutes)
app.use('/api/test', testRoutes)
app.use('/api/blockchain', blockchainRoutes)
app.use('/api/public', publicRoutes)
app.use('/api/distributors', distributorRoutes)

// ─── 404 Handler ────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' })
})

// ─── Start Server ───────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🌿 Dravya server running on http://localhost:${PORT}`)
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`)
})

export default app
