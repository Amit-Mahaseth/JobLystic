import JWT from 'jsonwebtoken'
import Config from '../config/config.js'

 async function VerifyAuthMiddleware(req,res,next) {
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

    req.user=decoded
    next()
}
export default {VerifyAuthMiddleware}