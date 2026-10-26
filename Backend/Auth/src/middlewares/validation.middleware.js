import { body, validationResult } from 'express-validator'

async function validate(req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }
    next()
}

export const RegisterValidationRule = [
    body("email").isEmail().withMessage("Email is Invalid"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("Fullname.firstname").notEmpty().withMessage("First name is required"),
    body("Fullname.lastname").notEmpty().withMessage("Last name is required"),
    validate
]

export const LoginValidationRule = [
    body("email").isEmail().withMessage("Email is Invalid"),
    body("password").notEmpty().withMessage("Password is required"),
    validate
]
export const updateValidationRule = [
    body("email").isEmail().withMessage("Email is Invalid"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("Fullname.firstname").notEmpty().withMessage("First name is required"),
    body("Fullname.lastname").notEmpty().withMessage("Last name is required"),
    validate
]
export const forgotPasswordValidationRule = [
    validate
]
export const verifyResetOtpValidationRule = [
    validate
]
export const resetPasswordValidationRule = [
    validate
]