import express from 'express'
import InterviewController from '../controllers/aireport.controller.js'
import AuthMiddleware from '../middlewares/auth.middleware.js'
import upload from '../middlewares/multer.middleware.js'
const router=express.Router()

router.get("/report/:reportId",AuthMiddleware.VerifyAuthMiddleware,InterviewController.GetReportById)

router.post("/interview-report",AuthMiddleware.VerifyAuthMiddleware,upload.single("resume"),InterviewController.GenerateInterviewReport)

router.get("/all-reports",AuthMiddleware.VerifyAuthMiddleware,InterviewController.GetAllReports)

router.post('/resume/pdf/:reportId',AuthMiddleware.VerifyAuthMiddleware,InterviewController.GenerateResumePdf)
 router.post('/:reportId/analyze-projects',AuthMiddleware.VerifyAuthMiddleware,InterviewController.AnalyzeResumeProjects)
export default router