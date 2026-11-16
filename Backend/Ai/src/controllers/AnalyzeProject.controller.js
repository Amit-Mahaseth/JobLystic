import InterviewReportModel from "../models/Report.model.js";
import AnalyzeProjectModel from "../models/AnalyzeProject.model.js";
import { analyzeResumeProjects } from "../services/ProjectAnalyze/ProjectAnalyze.Service.js";

async function GetResumeProjectAnalysis(req, res) {
  try {
    const { reportId } = req.params;
    const report = await InterviewReportModel.findOne({
      _id: reportId,
      user: req.user.id,
    }).select("_id");

    if (!report) {
      return res.status(404).json({ msg: "Report Not Found" });
    }

    const analysis = await AnalyzeProjectModel.findOne({
      report: report._id,
      user: req.user.id,
    }).lean();

    return res.status(200).json({
      msg: analysis ? "Project analysis found" : "Project analysis not found",
      analyzed: Boolean(analysis),
      AnalyzedProject: {
        totalProjects: analysis?.projects.length || 0,
        projects: analysis?.projects || [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      msg: "internal Server Err",
      error: error.message,
    });
  }
}

async function AnalyzeResumeProjects(req, res) {
  try {
    const { reportId } = req.params;
    const report = await InterviewReportModel.findOne({ _id: reportId, user: req.user.id });

    if (!report) {
      return res.status(404).json({
        msg: "Report Not Found",
      });
    }
    const resume = report.resume;
    if (!resume) {
      return res.status(404).json({ message: "Resume not Found" });
    }

    const resumeText = resume.extractedText;
    if (typeof resumeText !== "string" || !resumeText.trim()) {
      return res.status(400).json({ message: "Resume text not found" });
    }

    const AnalyzedProject = await analyzeResumeProjects(resumeText);

    const projects = AnalyzedProject.projects
      .filter((project) => project.analysis !== null)
      .map((project) => ({
        ProjectName: project.ProjectName,
        ...project.analysis,
      }));

    await AnalyzeProjectModel.findOneAndUpdate(
      { report: report._id, user: req.user.id },
      { report: report._id, user: req.user.id, projects },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      msg: "Project Analyzed Successfully",
      AnalyzedProject,
    });
  } catch (error) {
    throw error;
  }
}

export default { AnalyzeResumeProjects, GetResumeProjectAnalysis };