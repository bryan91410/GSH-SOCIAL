import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Chemins fiables en environnement ES modules
const dataDir = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(dataDir, 'db.json')

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

function createDefaultDb() {
  // Utilisateur de demo pour demarrer rapidement
  const defaultUser = {
    id: 1,
    username: 'test',
    email: 'test@example.com',
    password: 'password123',
    name: 'John Doe',
    avatar: 'https://i.pravatar.cc/150?img=1'
  }

  return {
    users: [defaultUser],
    posts: [
      {
        id: 1,
        content: 'Bienvenue sur GSH Social ! 🚀',
        authorId: defaultUser.id,
        authorName: defaultUser.name,
        authorAvatar: defaultUser.avatar,
        createdAt: new Date().toISOString(),
        likes: 5,
        likedBy: [defaultUser.id],
        imageUrl: null
      }
    ]
  }
}

let cachedDb = null

export function getDb() {
  // Cache memoire pour eviter de relire le fichier a chaque requete
  if (cachedDb) return cachedDb

  ensureDataDir()

  try {
    const raw = fs.readFileSync(dbPath, 'utf-8')
    cachedDb = JSON.parse(raw)
  } catch (err) {
    cachedDb = createDefaultDb()
    saveDb(cachedDb)
  }

  return cachedDb
}

export function saveDb(db) {
  // Ecriture simple sur disque (format lisible)
  ensureDataDir()
  cachedDb = db
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8')
}
