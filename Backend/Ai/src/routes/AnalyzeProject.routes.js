
import express from "express";
import AnalyzeProjectController from "../controllers/AnalyzeProject.controller.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

const verifyAuth = AuthMiddleware.VerifyAuthMiddleware;


router.get(
  "/:reportId/analyze-projects",
  verifyAuth,
  AnalyzeProjectController.GetResumeProjectAnalysis
);


router.get(
  "/:reportId/available-projects",
  verifyAuth,
  AnalyzeProjectController.GetAvailableProjects
);


router.post(
  "/:reportId/analyze-projects",
  verifyAuth,
  AnalyzeProjectController.AnalyzeResumeProjects
);

export default router;
