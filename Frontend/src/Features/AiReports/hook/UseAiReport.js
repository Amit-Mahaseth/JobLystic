import {useCallback, useContext} from "react";
import {InterviewContext} from '../Interview.Context.jsx'
import {GenerateInterviewReport,GetAllReports,GetReportById} from '../Services/report.api.js'
import {useEffect} from "react";
import {useParams} from "react-router-dom";
const getErrorMessage = (err, fallback) =>
    err.response?.data?.msg ||
    err.response?.data?.errors?.[0]?.msg ||
    fallback

export const UseAiReport=()=>{

    const {reportId}=useParams()
    const context=useContext(InterviewContext)
    const {
        Report: report,
        setReport,
        Reports: reports,
        setReports,
        loading,
        setloading: setLoading,
    } = context

    const HandleGenerateReport=async({resume,jobDescription,SelfDescription})=>{
        setLoading(true)
        
try{
const data=await GenerateInterviewReport({resume,jobDescription,SelfDescription})
setReport(data)
return { success: true }
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


const HandleGetAllReports=async()=>{
    setLoading(true)
    try{
        const data=await GetAllReports()
        setReports(data)

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

useEffect(()=>{
    if(reportId){
        HandleGetReportById(reportId)
    }
}, [reportId, HandleGetReportById])

return{
    report,
    reports,
    loading,
    HandleGenerateReport,
    HandleGetAllReports,
    HandleGetReportById
}
}
