import JWT from 'jsonwebtoken'
import Config from '../config/config.js'

/**
 * Authentication verification middleware that validates JWT token from request cookies.
 * Attaches decoded user payload to `req.user` if valid; returns 401 Unauthorized otherwise.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware callback.
 * @returns {Promise<import('express').Response|void>} Proceeds to next handler or sends 401 error.
 */
async function VerifyAuthMiddleware(req, res, next) {
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

export default { VerifyAuthMiddleware }