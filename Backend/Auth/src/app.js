import express from 'express'
import cookieParser from 'cookie-parser'
import AuthRoutes from '../src/routes/auth.routes.js'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import config from '../src/config/config.js'
import cors from 'cors'
const app=express()


app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors({
  origin:"http://localhost:5173",
  credentials:true
}))
app.use(passport.initialize())

app.use('/api/auth',AuthRoutes)

passport.use(new GoogleStrategy({
  clientID: config.GOOGLE_CLIENT_ID,
  clientSecret: config.GOOGLE_CLIENT_SECRET,
  callbackURL: config.GOOGLE_CALLBACK_URL,
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));
export default app