import express from 'express'
import ReportRoutes from './routes/Report.routes.js'
import GenerateAiResumeRoutes from './routes/GenerateAiResume.routes.js'
import AnalyzeProjectRoutes from './routes/AnalyzeProject.routes.js'
import CookieParser from 'cookie-parser'
import cors from 'cors'

/**
 * Express application instance for the AI microservice.
 * Configured with JSON body parsing, cookie parsing, CORS, and report routes.
 */
const app = express()

app.use(express.json())
app.use(CookieParser())

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))

app.use("/api/report", ReportRoutes)
app.use("/api/report", GenerateAiResumeRoutes)
app.use("/api/report", AnalyzeProjectRoutes)

export default app