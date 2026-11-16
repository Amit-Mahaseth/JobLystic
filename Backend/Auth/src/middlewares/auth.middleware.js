import JWT from 'jsonwebtoken'
import Config from '../config/config.js'

/**
 * Authentication middleware that verifies JWT from the `token` cookie.
 * Attaches decoded user claims to `req.user` upon successful verification.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware callback.
 * @returns {Promise<import('express').Response|void>} Proceeds to next handler or responds with 401 Unauthorized.
 */
export async function AuthMiddleware(req, res, next) {
  const token = req.cookies.token
  if (!token) {
    return res.status(401).json({
      msg: "Unauthorized"
    })
  }

  let decoded
  try {
    decoded = JWT.verify(token, Config.JWT_SECRET)
  } catch {
    return res.status(401).json({
      msg: "Unauthorized"
    })
  }

  req.user = decoded
  next()
}