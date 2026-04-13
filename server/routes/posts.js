import express from 'express'
import { getDb, saveDb } from '../data/store.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

// Lire tous les posts (du plus recent au plus ancien)
router.get('/', verifyToken, (req, res) => {
  const db = getDb()
  const sorted = [...db.posts].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )
  res.json(sorted)
})

// Lire un post par id
router.get('/:id', verifyToken, (req, res) => {
  const postId = parseInt(req.params.id)
  if (Number.isNaN(postId)) {
    return res.status(400).json({ message: 'Identifiant invalide' })
  }

  const db = getDb()
  const post = db.posts.find((p) => p.id === postId)
  
  if (!post) {
    return res.status(404).json({ message: 'Post non trouvé' })
  }
  
  res.json(post)
})

// Creer un post (texte et/ou image)
router.post('/', verifyToken, (req, res) => {
  const { content, imageUrl } = req.body

  if ((!content || content.trim() === '') && !imageUrl) {
    return res.status(400).json({ message: 'Ajoutez du texte ou une image' })
  }

  const db = getDb()
  const author = db.users.find((u) => u.id === req.userId)

  const newPost = {
    id: db.posts.length ? Math.max(...db.posts.map((p) => p.id)) + 1 : 1,
    content: content?.trim() || '',
    authorId: req.userId,
    authorName: author?.name || 'Unknown',
    authorAvatar: author?.avatar || 'https://i.pravatar.cc/150?img=1',
    createdAt: new Date().toISOString(),
    likes: 0,
    imageUrl: imageUrl || null,
    likedBy: []
  }

  db.posts.unshift(newPost)
  saveDb(db)
  res.status(201).json(newPost)
})

// Supprimer un post (seul l auteur peut)
router.delete('/:id', verifyToken, (req, res) => {
  const postId = parseInt(req.params.id)
  if (Number.isNaN(postId)) {
    return res.status(400).json({ message: 'Identifiant invalide' })
  }

  const db = getDb()
  const post = db.posts.find((p) => p.id === postId)

  if (!post) {
    return res.status(404).json({ message: 'Post non trouvé' })
  }

  if (post.authorId !== req.userId) {
    return res.status(403).json({ message: 'Non autorisé' })
  }

  db.posts = db.posts.filter((p) => p.id !== postId)
  saveDb(db)
  res.json({ message: 'Post supprimé avec succès' })
})

// Liker / unliker un post
router.post('/:id/like', verifyToken, (req, res) => {
  const postId = parseInt(req.params.id)
  if (Number.isNaN(postId)) {
    return res.status(400).json({ message: 'Identifiant invalide' })
  }

  const db = getDb()
  const post = db.posts.find((p) => p.id === postId)

  if (!post) {
    return res.status(404).json({ message: 'Post non trouvé' })
  }

  const hasLiked = post.likedBy.includes(req.userId)

  if (hasLiked) {
    post.likedBy = post.likedBy.filter(id => id !== req.userId)
  } else {
    post.likedBy.push(req.userId)
  }

  post.likes = post.likedBy.length
  saveDb(db)
  res.json(post)
})

export default router
