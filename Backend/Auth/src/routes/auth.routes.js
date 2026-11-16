import express from 'express'
import * as AuthController from '../controllers/auth.controller.js'
import * as Validation from '../middlewares/validation.middleware.js'
import passport from 'passport'
import * as AuthMiddleware from '../middlewares/auth.middleware.js'

const router = express.Router()

/**
 * @route POST /api/auth/register
 * @desc Register a new user account
 * @access Public
 */
router.post('/register', Validation.RegisterValidationRule, AuthController.RegisterUser)

/**
 * @route GET /api/auth/google
 * @desc Initiate Google OAuth 2.0 authentication
 * @access Public
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

/**
 * @route POST /api/auth/login
 * @desc Authenticate user credentials and issue session token
 * @access Public
 */
router.post('/login', Validation.LoginValidationRule, AuthController.LoginUser)

/**
 * @route POST /api/auth/logout
 * @desc Clear authentication session cookie
 * @access Private
 */
router.post('/logout', AuthMiddleware.AuthMiddleware, AuthController.LogoutUser)

/**
 * @route GET /api/auth/google/callback
 * @desc Google OAuth 2.0 callback endpoint
 * @access Public
 */
router.get('/google/callback', passport.authenticate('google', { session: false }), AuthController.GoogleAuthCallback)

/**
 * @route GET /api/auth/getme
 * @desc Get currently authenticated user profile
 * @access Private
 */
router.get('/getme', AuthMiddleware.AuthMiddleware, AuthController.GetMe)

/**
 * @route POST /api/auth/update
 * @desc Update user profile details
 * @access Private
 */
router.post('/update', AuthMiddleware.AuthMiddleware, Validation.updateValidationRule, AuthController.UpdateUser)

/**
 * @route POST /api/auth/forgot-password
 * @desc Request a password reset OTP via email
 * @access Public
 */
router.post('/forgot-password', Validation.forgotPasswordValidationRule, AuthController.ForgetPassword)

/**
 * @route POST /api/auth/verify-reset-otp
 * @desc Verify validity and expiration of a password reset OTP
 * @access Public
 */
router.post('/verify-reset-otp', Validation.verifyResetOtpValidationRule, AuthController.VerifyOtp)

/**
 * @route POST /api/auth/reset-password
 * @desc Reset account password using verified OTP
 * @access Public
 */
router.post('/reset-password', Validation.resetPasswordValidationRule, AuthController.ResetPassword)

export default router
