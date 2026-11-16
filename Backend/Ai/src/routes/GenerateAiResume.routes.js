import express from "express";
import GenerateAiResumeController from "../controllers/GenerateAiResume.controller.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/resume/pdf/:reportId", AuthMiddleware.VerifyAuthMiddleware, GenerateAiResumeController.GenerateResumePdf);
router.get("/resume/pdf/:reportId", AuthMiddleware.VerifyAuthMiddleware, GenerateAiResumeController.GetGeneratedResumePdf);

export default router;