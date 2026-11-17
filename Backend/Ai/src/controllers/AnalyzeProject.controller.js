
import InterviewReportModel from "../models/Report.model.js";
import AnalyzeProjectModel from "../models/AnalyzeProject.model.js";

import {
  getAvailableProjects,
  analyzeSingleProject,
} from "../services/ProjectAnalyze/ProjectAnalyze.Service.js";


async function GetResumeProjectAnalysis(req, res) {
  try {
    const { reportId } = req.params;

    const analysis = await AnalyzeProjectModel.findOne({
      report: reportId,
      user: req.user.id,
    }).lean();

    return res.status(200).json({
      msg: analysis
        ? "Project analysis found"
        : "Project analysis not found",
      analyzed: Boolean(analysis),
      AnalyzedProject: {
        totalProjects: analysis?.projects?.length || 0,
        projects: analysis?.projects || [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Internal Server Error",
      error: error.message,
    });
  }
}


async function GetAvailableProjects(req, res) {
  try {
    const { reportId } = req.params;

    const report = await InterviewReportModel.findOne({
      _id: reportId,
      user: req.user.id,
    });

    if (!report) {
      return res.status(404).json({ msg: "Report Not Found" });
    }

    const resume = report.resume;

    if (!resume?.extractedText?.trim()) {
      return res.status(400).json({
        msg: "Resume text not found",
      });
    }

    const extractedLinks = Array.isArray(resume.extractedLinks)
      ? resume.extractedLinks
      : [];

    const projects = await getAvailableProjects(
      resume.extractedText,
      extractedLinks
    );

    return res.status(200).json({
      msg: "Available projects fetched successfully",
      totalProjects: projects.length,
      projects,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Internal Server Error",
      error: error.message,
    });
  }
}


async function AnalyzeResumeProjects(req, res) {
  try {
    const { reportId } = req.params;
    const { projectName, source } = req.body;

    if (
      !projectName?.trim() ||
      !["github", "deployed"].includes(source)
    ) {
      return res.status(400).json({
        msg: "Valid projectName and source are required",
      });
    }

    const report = await InterviewReportModel.findOne({
      _id: reportId,
      user: req.user.id,
    });

    if (!report) {
      return res.status(404).json({
        msg: "Report Not Found",
      });
    }

    const resume = report.resume;

    if (!resume?.extractedText?.trim()) {
      return res.status(400).json({
        msg: "Resume text not found",
      });
    }

    const extractedLinks = Array.isArray(resume.extractedLinks)
      ? resume.extractedLinks
      : [];

    const analyzedProject = await analyzeSingleProject(
      resume.extractedText,
      extractedLinks,
      projectName,
      source
    );

    let savedAnalysis = await AnalyzeProjectModel.findOne({
      report: report._id,
      user: req.user.id,
    });

    if (!savedAnalysis) {
      savedAnalysis = new AnalyzeProjectModel({
        report: report._id,
        user: req.user.id,
        projects: [],
      });
    }

    const existingProject = savedAnalysis.projects.find(
      (project) =>
        project.ProjectName.trim().toLowerCase() ===
        analyzedProject.ProjectName.trim().toLowerCase()
    );

    if (existingProject) {
      if (source === "github") {
        existingProject.Github = analyzedProject.Github;
      } else {
        existingProject.Deployed = analyzedProject.Deployed;
      }
    } else {
      savedAnalysis.projects.push(analyzedProject);
    }

    await savedAnalysis.save();

    return res.status(200).json({
      msg: `${source} project analysis completed successfully`,
      analyzed: true,
      AnalyzedProject: analyzedProject,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Internal Server Error",
      error: error.message,
    });
  }
}

export default {
  GetResumeProjectAnalysis,
  GetAvailableProjects,
  AnalyzeResumeProjects,
};
