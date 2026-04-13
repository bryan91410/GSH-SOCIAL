import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import postsRoutes from './routes/posts.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares globaux
app.use(cors())
app.use(express.json())

// Routes principales
app.use('/api/auth', authRoutes)
app.use('/api/posts', postsRoutes)

// Endpoint de sante
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '🚀 GSH Social API running' })
})

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
