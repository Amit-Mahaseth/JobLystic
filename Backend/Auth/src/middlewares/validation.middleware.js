import { body, validationResult } from 'express-validator'

/**
 * Validates the Express request against previously executed validation chains.
 * If validation fails, responds with 400 Bad Request containing validation errors.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware callback.
 * @returns {Promise<import('express').Response|void>}
 */
async function validate(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    })
  }
  next()
}

/** Validation rule chain for user registration */
export const RegisterValidationRule = [
  body("email").isEmail().withMessage("Email is Invalid"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("Fullname.firstname").notEmpty().withMessage("First name is required"),
  body("Fullname.lastname").notEmpty().withMessage("Last name is required"),
  validate
]

/** Validation rule chain for user login */
export const LoginValidationRule = [
  body("email").isEmail().withMessage("Email is Invalid"),
  body("password").notEmpty().withMessage("Password is required"),
  validate
]

/** Validation rule chain for profile update */
export const updateValidationRule = [
  body("email").isEmail().withMessage("Email is Invalid"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("Fullname.firstname").notEmpty().withMessage("First name is required"),
  body("Fullname.lastname").notEmpty().withMessage("Last name is required"),
  validate
]

/** Validation rule chain for forgot password requests */
export const forgotPasswordValidationRule = [
  body("email").isEmail().withMessage("Email is Invalid"),
  validate
]

/** Validation rule chain for OTP verification */
export const verifyResetOtpValidationRule = [
  body("email").isEmail().withMessage("Email is Invalid"),
  body("otp").isLength({ min: 6, max: 6 }).isNumeric().withMessage("OTP must be 6 digits"),
  validate
]

/** Validation rule chain for password reset execution */
export const resetPasswordValidationRule = [
  body("email").isEmail().withMessage("Email is Invalid"),
  body("otp").isLength({ min: 6, max: 6 }).isNumeric().withMessage("OTP must be 6 digits"),
  body("newpassword").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  validate
]