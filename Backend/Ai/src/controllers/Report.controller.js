import InterviewReportModel from "../models/Report.model.js";
import AnalyzeProjectModel from "../models/AnalyzeProject.model.js";
import GenerateAiResumeModel from "../models/GenerateAiResume.model.js";
import { InterviewReport } from "../services/Report/AnalyzeReport.Service.js";
import ExtractResume from "../services/Report/ExtractResume.Services.js";

async function GenerateInterviewReport(req, res) {
  try {
    const { jobDescription, SelfDescription } = req.body;

    const ResumeFile = req.file;
    if (!ResumeFile) {
      return res.status(400).json({ msg: "Resume PDF is required" });
    }
    if (ResumeFile.mimetype !== "application/pdf") {
      return res.status(400).json({ msg: "Resume must be a PDF file" });
    }
if(!jobDescription || typeof jobDescription !== "string" || !jobDescription.trim()){
  return res.status(400).json({ msg: "Job description is required" });
}

const {extractedText, extractedLinks} = await ExtractResume(ResumeFile.buffer);

    const InterviewReportByAi = await InterviewReport({
      resume: extractedText,
      SelfDescription,
      jobDescription,
    });

    const InterviewReportGenerated = await InterviewReportModel.create({
      ...InterviewReportByAi,
      user: req.user.id,
        resume: {
          originalFile: {
            fileName: ResumeFile.originalname,
            mimeType: ResumeFile.mimetype,
            size: ResumeFile.size,
          },

          extractedText,
          extractedLinks,

          extractedAt: new Date(),
        },
      SelfDescription,
      jobDescription,
      reportTitle: InterviewReportByAi.reportTitle?.trim() || "Interview Report",
      targetRole: InterviewReportByAi.targetRole?.trim() || "Not specified",
      resumeTitle: InterviewReportByAi.resumeTitle?.trim() || ResumeFile.originalname,
    });

    return res.status(201).json({
      msg: "Report Created Successfully",
      InterviewReportGenerated,
    });
  } catch (err) {
    return res.status(500).json({
      msg: "internal Server Err",
      error: err.message,
    });
  }
}

async function GetAllReports(req, res) {
  try {
    const AllReports = await InterviewReportModel.find({ user: req.user.id })
      .select("reportTitle targetRole resumeTitle jobDescription createdAt readiness.OverallScore")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      msg: "All Reports Found",
      AllReports,
    });
  } catch (err) {
    return res.status(500).json({
      msg: "internal Server Err",
      error: err.message,
    });
  }
}

async function GetAiLibrary(req, res) {
  try {
    const userFilter = { user: req.user.id };
    const [generatedResumes, projectAnalyses] = await Promise.all([
      GenerateAiResumeModel.find(userFilter)
        .select("report fileName contentType generatedAt")
        .lean(),
      AnalyzeProjectModel.find({
        ...userFilter,
        projects: { $exists: true, $ne: [] },
      })
        .select("report projects")
        .lean(),
    ]);
    const reportIds = [
      ...new Set([
        ...generatedResumes.map((resume) => String(resume.report)),
        ...projectAnalyses.map((analysis) => String(analysis.report)),
      ]),
    ];
    const reports = await InterviewReportModel.find({
      ...userFilter,
      _id: { $in: reportIds },
    })
      .select("reportTitle targetRole resumeTitle createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      AiLibrary: {
        reports,
        generatedResumes,
        projectAnalyses,
      },
    });
  } catch (err) {
    return res.status(500).json({
      msg: "internal Server Err",
      error: err.message,
    });
  }
}

async function GetReportById(req, res) {
  try {
    const { reportId } = req.params;
    const Report = await InterviewReportModel.findOne({ _id: reportId, user: req.user.id })
      .select("reportTitle targetRole resumeTitle jobDescription SelfDescription createdAt readiness companyReadiness roadmap skillGaps technicalQuestions behavioralQuestions preparationIdeas");

    if (!Report) {
      return res.status(404).json({
        msg: "Report Not Found",
      });
    }

    return res.status(200).json({
      msg: "Report Found",
      Report,
    });
  } catch (err) {
    return res.status(500).json({
      msg: "internal Server Err",
      error: err.message,
    });
  }
}

async function UpdateReportMetadata(req, res) {
  try {
    const { reportId } = req.params;
    const fields = ["reportTitle", "targetRole", "resumeTitle"];
    const metadata = {};

    for (const field of fields) {
      if (typeof req.body[field] !== "string" || !req.body[field].trim()) {
        return res.status(400).json({ msg: `${field} is required` });
      }
      metadata[field] = req.body[field].trim();
    }

    const Report = await InterviewReportModel.findOne({ _id: reportId, user: req.user.id });
    if (!Report) {
      return res.status(404).json({ msg: "Report Not Found" });
    }

    Object.assign(Report, metadata);
    await Report.save();

    return res.status(200).json({
      msg: "Report metadata updated",
      Report,
    });
  } catch (err) {
    return res.status(500).json({
      msg: "internal Server Err",
      error: err.message,
    });
  }
}

export default {
  GenerateInterviewReport,
  GetAllReports,
  GetAiLibrary,
  GetReportById,
  UpdateReportMetadata,
};