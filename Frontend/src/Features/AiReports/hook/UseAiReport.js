import {useCallback, useContext} from "react";
import {InterviewContext} from '../Interview.Context.jsx'
import {GenerateInterviewReport,GetAllReports,GetReportById,AnalyzeResumeProjects,AiGeneratedResumePdf} from '../Services/report.api.js'
import {useEffect} from "react";
import {useLocation, useParams} from "react-router-dom";
const getErrorMessage = (err, fallback) =>
    err.response?.data?.msg ||
    err.response?.data?.errors?.[0]?.msg ||
    fallback

export const UseAiReport=()=>{

    const {reportId}=useParams()
    const {pathname}=useLocation()
    
    const context=useContext(InterviewContext)
    const {
        Report: report,
        setReport,
        Reports: reports,
        setReports,
         AnalysisProject,
         setAnalysisProject,
        loading,
        setloading: setLoading,

    } = context

    const HandleGenerateReport=async({resume,jobDescription,SelfDescription})=>{
        setLoading(true)
        
try{
const data=await GenerateInterviewReport({resume,jobDescription,SelfDescription})
setReport(data)
return { success: true, reportId: data?._id }
}catch(err){
    console.error("Failed to generate interview report:", err);
    return {
        success: false,
        message: getErrorMessage(err, "Failed to generate interview report")
    };
}finally{
    setLoading(false)
}
    }


const HandleGetAllReports=useCallback(async()=>{
    setLoading(true)
    try{
        const data=await GetAllReports()
        setReports(data)
        return { success: true, reports: data }

    }catch(err){
        console.error("Failed to fetch all reports:", err);
        return {
            success: false,
            message: getErrorMessage(err, "Failed to fetch all reports")
        };
    }finally{
        setLoading(false)
    }
}, [setLoading, setReports])

 const HandleGetReportById=useCallback(async(reportId)=>{
    setLoading(true)
    try{
        const data=await GetReportById(reportId)
        setReport(data)
    }catch(err){
        console.error("Failed to fetch report by ID:", err);
        return {
            success: false,
            message: getErrorMessage(err, "Failed to fetch report by ID")
        };
    }finally{
        setLoading(false)
    }
}, [setLoading, setReport])

const HandleAiGeneratedResumePdf=async(reportId)=>{
try{
    const pdfBlob=await AiGeneratedResumePdf(reportId)
    return { success: true, pdfBlob }
   }catch(err){
        console.error("Failed to generate AI resume PDF:", err);
        return {
            success: false,
            message: getErrorMessage(err, "Failed to generate AI resume PDF")
        };
    }
}
const HandleProjectAnalysisReport=async (reportId)=>{
    setLoading(true)
    try{
const data=await AnalyzeResumeProjects(reportId)
setAnalysisProject(data.report.ProjectAnalysis)
     }catch(err){
        console.error("Failed to fetch all reports:", err);
        return {
            success: false,
            message: getErrorMessage(err, "Failed to fetch all reports")
        };
    }finally{
        setLoading(false)
    }
}
useEffect(()=>{
    if(reportId){
        HandleGetReportById(reportId)
        return
    }

    if(!pathname.startsWith('/interview-report') || report?._id) return

    let cancelled = false
    const LoadLatestReport = async () => {
        const result = await HandleGetAllReports()
        const latestReportId = result?.reports?.[0]?._id
        if (!cancelled && latestReportId) {
            await HandleGetReportById(latestReportId)
        }
    }

    LoadLatestReport()
    return () => {
        cancelled = true
    }
}, [reportId, pathname, report?._id, HandleGetAllReports, HandleGetReportById])

return{
    report,
    reports,
    loading,
    AnalysisProject,
    HandleGenerateReport,
    HandleGetAllReports,
    HandleGetReportById,
    HandleAiGeneratedResumePdf,
    HandleProjectAnalysisReport
}
}
