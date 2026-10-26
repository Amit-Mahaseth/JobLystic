import express from 'express'
import AuthRoutes from './routes/aireport.routes.js'
import CookieParser from 'cookie-parser'
import cors from 'cors'
const app=express()
app.use(express.json())
app.use(CookieParser())

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))

app.use("/api/report",AuthRoutes)

export default app