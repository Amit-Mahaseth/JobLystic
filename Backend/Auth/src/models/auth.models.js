import mongoose from "mongoose";

/**
 * @typedef {Object} User
 * @property {string} email - Unique email address of the user.
 * @property {Object} Fullname - User's full name.
 * @property {string} Fullname.firstname - User's first name.
 * @property {string} Fullname.lastname - User's last name.
 * @property {string} [googleid] - Google OAuth identifier if authenticated via Google.
 * @property {string} [password] - Bcrypt hashed password (required for password-based accounts).
 * @property {string} [resetPasswordOTP] - Hashed OTP for password reset.
 * @property {Date} [resetPasswordOTPExpires] - Expiration timestamp for reset OTP.
 * @property {string} profileImage - Profile image URL.
 */
const AuthSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  Fullname: {
    firstname: {
      type: String
    },
    lastname: {
      type: String
    }
  },
  googleid: {
    type: String
  },
  password: {
    type: String,
    required: function () {
      return !this.googleid
    }
  },
  resetPasswordOTP: {
    type: String
  },
  resetPasswordOTPExpires: {
    type: Date
  },
  profileImage: {
    type: String,
    default: "https://www.vecteezy.com/free-vector/default-profile-picture"
  }
}, {
  timestamps: true
})

const AuthModel = mongoose.model('Auth', AuthSchema)

export default AuthModel