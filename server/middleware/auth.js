import jwt from 'jsonwebtoken'

// Middleware simple pour proteger les routes avec un token JWT
export function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key')
    req.userId = decoded.id
    return next()
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide' })
  }
}
