import axios from 'axios';

const API= axios.create({
  baseURL: 'http://localhost:3002/api/report',
  withCredentials: true,
})

export const GenerateInterviewReport= async ({resume,jobDescription,SelfDescription})=>{
  const formData= new FormData();
  formData.append("resume",resume);
  formData.append("jobDescription",jobDescription);
  formData.append("SelfDescription",SelfDescription);
  const response= await API.post("/interview-report",formData)
  return response.data.InterviewReportGenerated
}

export const GetAllReports= async ()=>{
  const response= await API.get("/all-reports")
  return response.data.AllReports
}
export const GetReportById= async (reportId)=>{
  const response= await API.get(`/report/${reportId}`)
  return response.data.Report
}

export const AiGeneratedResumePdf=async(reportId)=>{
  const response=await API.post(`/resume/pdf/${reportId}`, null, { responseType: 'blob' })
  return response.data
}

export const AnalyzeResumeProjects=async (reportId)=>{
try{
const response=await API.post(`/${reportId}/analyze-projects`)
return response.data.Report.ProjectAnalysis

}catch(err){
  throw err
}
}
