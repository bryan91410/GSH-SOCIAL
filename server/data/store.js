import fs from 'fs'
import path from 'path'

const dataDir = path.resolve(path.dirname(new URL(import.meta.url).pathname))
const dbPath = path.join(dataDir, 'db.json')

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

function createDefaultDb() {
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
  ensureDataDir()
  cachedDb = db
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8')
}
