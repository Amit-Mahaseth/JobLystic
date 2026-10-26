import express from 'express'
import * as AuthController from '../controllers/auth.controller.js'
import * as Validation from '../middlewares/validation.middleware.js'
import passport from 'passport'

// import * as limiter from '../middlewares/rate.limiter.js'
import * as AuthMiddleware from '../middlewares/auth.middleware.js'
const router = express.Router()

router.post('/register', Validation.RegisterValidationRule, AuthController.RegisterUser)
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.post('/login', Validation.LoginValidationRule, AuthController.LoginUser)
// router.get('/status',AuthController.AuthStatus)
router.post('/logout', AuthMiddleware.AuthMiddleware, AuthController.LogoutUser)
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  AuthController.GoogleAuthCallback
);
router.get('/getme', AuthMiddleware.AuthMiddleware, AuthController.GetMe)
router.post('/update', AuthMiddleware.AuthMiddleware, Validation.updateValidationRule, AuthController.UpdateUser)
router.post('/forgot-password', Validation.forgotPasswordValidationRule, AuthController.ForgetPassword)
router.post('/verify-reset-otp', Validation.verifyResetOtpValidationRule, AuthController.VerifyOtp)
router.post('/reset-password', Validation.resetPasswordValidationRule, AuthController.ResetPassword)
export default router
