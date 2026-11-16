import express from "express";
import ReportController from "../controllers/Report.controller.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = express.Router();

router.get("/report/:reportId", AuthMiddleware.VerifyAuthMiddleware, ReportController.GetReportById);
router.patch("/report/:reportId/metadata", AuthMiddleware.VerifyAuthMiddleware, ReportController.UpdateReportMetadata);
router.post("/interview-report", AuthMiddleware.VerifyAuthMiddleware, upload.single("resume"), ReportController.GenerateInterviewReport);
router.get("/all-reports", AuthMiddleware.VerifyAuthMiddleware, ReportController.GetAllReports);
router.get("/ai-library", AuthMiddleware.VerifyAuthMiddleware, ReportController.GetAiLibrary);

export default router;