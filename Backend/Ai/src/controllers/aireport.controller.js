import InterviewReportModel from '../models/ai.model.js'
import { PDFParse } from "pdf-parse"
import {InterviewReport} from '../services/AnalyzeReport.Service.js'
import {generateResumePdf} from '../services/GenerateResumePdf.Service.js'
import {analyzeResumeProjects} from "../services/ProjectAnalyze.Service.js"
async function GenerateInterviewReport(req,res){

try{
    const {jobDescription,SelfDescription}=req.body

const ResumeFile=req.file
if (!ResumeFile) {
    return res.status(400).json({ msg: "Resume PDF is required" })
}
if (ResumeFile.mimetype !== "application/pdf") {
    return res.status(400).json({ msg: "Resume must be a PDF file" })
}

const parser = new PDFParse({data:ResumeFile.buffer})
let ResumeText
try {
    const ResumeContent = await parser.getText()
    ResumeText = ResumeContent.text
} finally {
    await parser.destroy()
}
const InterviewReportByAi=await InterviewReport({resume:ResumeText,SelfDescription,jobDescription})

const InterviewReportGenerated=await InterviewReportModel.create({
user:req.user.id,
resume:ResumeText,
SelfDescription,
jobDescription,
...InterviewReportByAi
})

return res.status(201).json({
    msg:"Report Created Successfully",
    InterviewReportGenerated
})

}catch(err){
    return res.status(500).json({
        msg:'internal Server Err',
        error:err.message
    })
}
}
async function GetAllReports(req,res){
    try{
        const AllReports=await InterviewReportModel.find({user:req.user.id}).select("resume jobDescription SelfDescription ")
        return res.status(200).json({
            msg:"All Reports Found",
            AllReports
        })
    }catch(err){
        return res.status(500).json({
            msg:'internal Server Err',
            error:err.message
        })
    }
}
async function GetReportById(req,res){
    try{
        const {reportId}=req.params 
        const Report=await InterviewReportModel.findOne({_id:reportId}).select("resume jobDescription SelfDescription ")
        if(!Report){
            return res.status(404).json({
                msg:"Report Not Found"
            })
        }
        return res.status(200).json({
            msg:"Report Found",
            Report
        })
    }catch(err){
        return res.status(500).json({
            msg:'internal Server Err',
            error:err.message
        })
    }
}
async function GenerateResumePdf(req,res){
    try{
        const {reportId}=req.params
        const Report=await InterviewReportModel.findOne({_id:reportId})

        if(!Report){
            return res.status(404).json({
                msg:"Report Not Found"
            })
        }
        const {resume,SelfDescription,jobDescription}=Report
const pdfBuffer=await generateResumePdf({resume,SelfDescription,jobDescription})
res.set({'Content-Type': 'application/pdf',
     'Content-Disposition': 'attachment; filename=resume_' + reportId + '.pdf'})
Report.AiGeneratedResume={
    data:pdfBuffer,
     fileName: `Generated-Resume-${reportId}.pdf`,
      contentType: "application/pdf",
      generatedAt: new Date(),
}
await Report.save()
return res.status(200).send(pdfBuffer)

    }catch(err){
        return res.status(500).json({
            msg:'internal Server Err',
            error:err.message
        })
    }
}

 async function AnalyzeResumeProjects(req,res){

try{
    const {reportId}=req.params
    const report=await InterviewReportModel.findOne({_id:reportId})
console.log(report)
    const resume=report.resume
    if(!resume){
        return res.status(404).json({
            message:"Resume not Found"
        })
    }

    const AnalyzedProject=await analyzeResumeProjects(resume)

    report.ProjectAnalysis=AnalyzedProject.projects
      .filter((project) => project.analysis !== null)
  .map((project) => ({
    ProjectName: project.ProjectName,
    ...project.analysis,
  }));

await report.save();

return res.status(200).json({
    msg:"Project Analyzed Successfully",
    AnalyzedProject
})

}catch(error){
    throw error
}
}
export default {GenerateInterviewReport, GetAllReports, GetReportById,GenerateResumePdf,AnalyzeResumeProjects}