import express from 'express'
import jwt from 'jsonwebtoken'
import { getDb, saveDb } from '../data/store.js'

const router = express.Router()

router.post('/login', (req, res) => {
  const { username, password } = req.body

  const db = getDb()
  const user = db.users.find(
    (u) =>
      (u.username === username || u.email === username) &&
      u.password === password
  )

  if (!user) {
    return res.status(401).json({ message: 'Identifiants invalides' })
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET || 'secret-key',
    { expiresIn: '24h' }
  )

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      avatar: user.avatar
    }
  })
})

router.post('/register', (req, res) => {
  const { username, email, password } = req.body

  const db = getDb()
  const exists = db.users.find((u) => u.username === username || u.email === email)
  if (exists) {
    return res.status(400).json({ message: 'Utilisateur déjà existant' })
  }

  const newUser = {
    id: db.users.length ? Math.max(...db.users.map((u) => u.id)) + 1 : 1,
    username,
    email,
    password,
    name: username,
    avatar: `https://i.pravatar.cc/150?img=${db.users.length + 1}`
  }

  db.users.push(newUser)
  saveDb(db)

  const token = jwt.sign(
    { id: newUser.id, username: newUser.username },
    process.env.JWT_SECRET || 'secret-key',
    { expiresIn: '24h' }
  )

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      name: newUser.name,
      avatar: newUser.avatar
    }
  })
})

router.get('/me', verifyToken, (req, res) => {
  const db = getDb()
  const user = db.users.find((u) => u.id === req.userId)
  
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' })
  }

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    avatar: user.avatar
  })
})

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key')
    req.userId = decoded.id
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide' })
  }
}

export default router
