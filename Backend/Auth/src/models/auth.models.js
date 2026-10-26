import mongoose from "mongoose";

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