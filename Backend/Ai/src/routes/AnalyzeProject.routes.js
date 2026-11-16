import express from "express";
import AnalyzeProjectController from "../controllers/AnalyzeProject.controller.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/:reportId/analyze-projects", AuthMiddleware.VerifyAuthMiddleware, AnalyzeProjectController.GetResumeProjectAnalysis);
router.post("/:reportId/analyze-projects", AuthMiddleware.VerifyAuthMiddleware, AnalyzeProjectController.AnalyzeResumeProjects);

export default router;