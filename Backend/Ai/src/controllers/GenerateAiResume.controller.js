import InterviewReportModel from "../models/Report.model.js";
import GenerateAiResumeModel from "../models/GenerateAiResume.model.js";
import { generateResumePdf } from "../services/AiResume/GenerateResumePdf.Service.js";
import { ResearchCompany } from "../services/CompanyResearch/CompanyResearch.Service.js";

async function GenerateResumePdf(req, res) {
  try {
    const { reportId } = req.params;
    const Report = await InterviewReportModel.findOne({ _id: reportId, user: req.user.id });

    if (!Report) {
      return res.status(404).json({
        msg: "Report Not Found",
      }).select("data fileName contentType");
    }




        const existingGeneratedResume = await GenerateAiResumeModel.findOne({
      report: Report._id,
      user: req.user.id,
    });
      if (existingGeneratedResume?.data) {
      res.set({
        "Content-Type": existingGeneratedResume.contentType || "application/pdf",
        "Content-Disposition": `attachment; filename="${existingGeneratedResume.fileName || `Generated-Resume-${reportId}.pdf`}"`,
      });
       return res.status(200).send(existingGeneratedResume.data);
    }

    const CompanyName = typeof req.body?.CompanyName === "string"
      ? req.body.CompanyName.trim()
      : "";
    if (!CompanyName) {
      return res.status(400).json({
        msg: "Company name is required",
      });
    }
    const { resume, SelfDescription, jobDescription, targetRole } = Report;

    const resumeText = Report.resume?.extractedText || "";
    const extractedLinks = Report.resume?.extractedLinks || [];

     if (!resumeText) {
      return res.status(400).json({
        msg: "Extracted resume text not found",
      });
    }
    const CompanyResearch = await ResearchCompany({
      companyName: CompanyName,
      targetRole,
      jobDescription,
    });

    const pdfData = await generateResumePdf({ resume: resumeText, extractedLinks, SelfDescription, jobDescription, targetRole, CompanyResearch });
    const pdfBuffer = Buffer.from(pdfData);
  res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=resume_" + reportId + ".pdf",
    });

    await GenerateAiResumeModel.findOneAndUpdate(
      { report: Report._id, user: req.user.id },
      {
        report: Report._id,
        user: req.user.id,
        data: pdfBuffer,
        fileName: `Generated-Resume-${reportId}.pdf`,
        contentType: "application/pdf",
        generatedAt: new Date(),
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
  
    return res.status(200).send(pdfBuffer);
  } catch (err) {
    return res.status(500).json({
      msg: "internal Server Err",
      error: err.message,
    });
  }
}

async function GetGeneratedResumePdf(req, res) {
  try {
    const { reportId } = req.params;
    const generatedResume = await GenerateAiResumeModel.findOne({
      report: reportId,
      user: req.user.id,
    }).select("data fileName contentType");

    if (!generatedResume?.data) {
      return res.status(404).json({ msg: "Generated resume not found" });
    }

    res.set({
      "Content-Type": generatedResume.contentType || "application/pdf",
      "Content-Disposition": `attachment; filename="Generated-Resume-${reportId}.pdf"`,
    });
    return res.status(200).send(generatedResume.data);
  } catch (err) {
    return res.status(500).json({
      msg: "internal Server Err",
      error: err.message,
    });
  }
}

export default {
  GenerateResumePdf,
  GetGeneratedResumePdf,
};