import AuthModel from '../models/auth.models.js'
import bcrypt from 'bcrypt'
import JWT from 'jsonwebtoken'
import Config from '../config/config.js'
import crypto from 'crypto';

const authCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
}


export async function RegisterUser(req, res) {
    try {
        const { email, password } = req.body
        const { firstname, lastname } = req.body.Fullname

        const isUserExist = await AuthModel.findOne({ email })
        if (isUserExist) {
            return res.status(401).json({
                msg: "Email is Already Registered"
            })
        }
        const newuser = await AuthModel.create({
            email,
            password: await bcrypt.hash(password, 10),
            Fullname: {
                firstname,
                lastname
            }
        })
        const token = JWT.sign({ email, Fullname: { firstname, lastname } }, Config.JWT_SECRET)

        res.cookie("token", token, authCookieOptions)
        return res.status(201).json({
            msg: "User Register Successfully",
            user: newuser
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({
            msg: "Internal server error",
            error: err
        })
    }
}

export async function LoginUser(req, res) {
    try {
        const { email, password } = req.body

        const isUserValid = await AuthModel.findOne({ email })
        if (!isUserValid) {
            return res.status(400).json({
                msg: "Password is inValid"
            })
        }
        const IsPasswordValid = await bcrypt.compare(password, isUserValid.password)
        if (!IsPasswordValid) {
            return res.status(400).json({
                msg: "Password is Invalid"
            })
        }



        const token = JWT.sign({
            email,
            Fullname: {
                firstname: isUserValid.Fullname.firstname,
                lastname: isUserValid.Fullname.lastname
            }
        }, Config.JWT_SECRET)

        res.cookie('token', token, authCookieOptions)

        return res.status(201).json({
            msg: "User Logged in Successfully",
            user: isUserValid
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            msg: 'Internel server error',
            error: err
        })
    }
}

export async function LogoutUser(req, res) {

    try {
        res.clearCookie("token", authCookieOptions)
        return res.status(200).json({
            msg:"Logout Successfully"
        })

    }
    catch (err) {
        return res.status(500).json({
            msg: "internal server error",
            error: err
        })
    }

}

export async function GoogleAuthCallback(req, res) {
    try {

        const user = req.user
        console.log(user)

        if (!user.emails?.[0]?.value) {
            return res.status(400).json({
                msg: "Google Account Did not Provide an Email Address"
            })
        }
        if (!user.id) {
            return res.status(400).json({
                msg: "Google Account Did not Provide an ID"
            })
        }



        const isUserExist = await AuthModel.findOne({
            $or: [
                { email: user.emails[0].value },
                { googleid: user.id }
            ]
        })

        if (isUserExist) {
            const token = JWT.sign({
                id: isUserExist.id,
                email: isUserExist.email,
                Fullname: {
                    firstname: isUserExist.Fullname.firstname,
                    lastname: isUserExist.Fullname.lastname
                }
            }, Config.JWT_SECRET, {
                expiresIn: '1d'
            })


            res.cookie("token", token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000,
                sameSite: 'lax',
                path: '/',
            })
            return res.redirect('http://localhost:5173/')
        }

        const newUser = await AuthModel.create({
            googleid: user.id,
            email: user.emails[0].value,
            Fullname: {
                firstname: user.name.givenName,
                lastname: user.name.familyName
            },
            profileImage: user.photos[0].value
        })

        const token = JWT.sign({
            id: newUser.id,
            email: newUser.email,
            Fullname: {
                firstname: newUser.Fullname.firstname,
                lastname: newUser.Fullname.lastname
            }
        }, Config.JWT_SECRET, {
            expiresIn: '1d'
        })


        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'lax',
            path: '/',
        })

        return res.redirect('http://localhost:5173/')

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            msg: "Internal Server Error",
            error: err
        })
    }
}

export async function GetMe(req, res) {
    
    try {
    
        const user = await AuthModel.findOne({email:req.user.email})
        if (!user) {
            return res.status(400).json({
                msg: "User Not Found"
            })
        }

        return res.status(200).json({
            msg: "User Fetched Successfully",
            user
        })
    }
    catch (err) {

        return res.status(500).json({
            msg: "Internal Server Error",
            error: err.error

        })
    }
}


export async function UpdateUser(req, res) {
    const { password, profileImage } = req.body
    const { firstname, lastname } = req.body.Fullname

    try {
        const token = req.cookies.token

        if (!token) {
            return res.status(401).json({
                msg: "Unauthorized"
            })
        }

        const decoded = JWT.verify(token, Config.JWT_SECRET)

        const UpdateUser = await AuthModel.findOneAndUpdate({ id: decoded.id }, {
            ...(firstname && { 'Fullname.firstname': firstname }),
            ...(lastname && { 'Fullname.lastname': lastname }),

            ...(password && { password: await bcrypt.hash(password, 10) }),
            ...(profileImage && { profileImage: profileImage })

        })

        const newtoken = JWT.sign({
            id: UpdateUser,
            email: UpdateUser.email,
            Fullname: {
                firstname,
                lastname
            }
        }, Config.JWT_SECRET)

        res.cookie("token", newtoken)
    } catch (err) {
        return res.status(500).json({
            msg: "Interval Server Error",
            error: err.error
        })
    }

}

export async function ForgetPassword(req, res) {
    const { email } = req.body
    try {
        const user = await AuthModel.findOne({ email })
        if (!user) {
            return res.status(404).json({
                msg: "There is no Account with this email"
            })
        }

        const otp = crypto.randomInt(100000, 1000000).toString();
        const Otphash = await bcrypt.hash(otp, 10)
        user.resetPasswordOTP = Otphash
        user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000
        await user.save()

        await sendEmail(user.email, "Reset Password", `Your OTP is ${otp}`)
        return res.status(200).json({
            msg: "Otp Sent to email"
        })
    } catch (err) {
        return res.status(500).json({
            msg: "Internal server Error",
            error: err.message
        })
    }
}

export async function VerifyOtp(req, res) {
    const { email, otp } = req.body
    try {
        const user = await AuthModel.findOne({ email })

        if (!user || !user.resetPasswordOTP || !user.resetPasswordOTPExpires) {
            return res.status(400).json({
                msg: "invalid or expire token"
            })
        }
        const isOtpValid = await bcrypt.compare(otp, user.resetPasswordOTP)

        if (!isOtpValid) {
            return res.status(401).json({
                msg: "Invalid Otp"
            })
        }

        if (user.resetPasswordOTPExpires.getTime() < Date.now()) {
            return res.status(400).json({
                msg: "Otp Expired"
            })
        }
        return res.status(200).json({
            msg: "Otp Verified successfully"
        })

    } catch (err) {
        return res.status(500).json({
            msg: "Internal server Error",
            error: err.message
        })
    }
}
export async function ResetPassword(req, res) {
    const { email, newpassword } = req.body
    try {

        const user = await AuthModel.findOne({ email })
        if (!user) {
            return res.status(401).json({
                msg: "invalid or expire token"
            })
        }
        const newpasswordHash = await bcrypt.hash(newpassword, 10)
        user.password = newpasswordHash
        user.resetPasswordOTP = undefined
        user.resetPasswordOTPExpires = undefined
        await user.save()

        return res.status(200).json({
            msg: "Password Reset Successfully"
        })
    } catch (err) {
        return res.status(500).json({
            msg: "Internal Server Error",
            error: err.message
        })
    }
}