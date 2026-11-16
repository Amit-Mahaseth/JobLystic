import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3002/api/report',
  withCredentials: true,
})

/**
 * Sends candidate resume file and target job details to generate an interview report.
 *
 * @param {Object} params - Report generation parameters.
 * @param {File} params.resume - PDF resume file object.
 * @param {string} params.jobDescription - Target job description text.
 * @param {string} params.SelfDescription - Candidate's self-description.
 * @returns {Promise<Object>} The generated interview report object.
 */
export const GenerateInterviewReport = async ({ resume, jobDescription, SelfDescription }) => {
  const formData = new FormData();
  formData.append("resume", resume);
  formData.append("jobDescription", jobDescription);
  formData.append("SelfDescription", SelfDescription);
  const response = await API.post("/interview-report", formData)
  return response.data.InterviewReportGenerated
}

/**
 * Retrieves all saved interview reports for the currently authenticated user.
 *
 * @returns {Promise<Array<Object>>} List of interview reports summary.
 */
export const GetAllReports = async () => {
  const response = await API.get("/all-reports")
  return response.data.AllReports
}

export const GetAiLibrary = async () => {
  const response = await API.get("/ai-library")
  return response.data.AiLibrary
}

/**
 * Retrieves a detailed interview report by its ID.
 *
 * @param {string} reportId - MongoDB ObjectId string of the report.
 * @returns {Promise<Object>} Detailed report data.
 */
export const GetReportById = async (reportId) => {
  const response = await API.get(`/report/${reportId}`)
  return response.data.Report
}

export const UpdateReportMetadata = async (reportId, metadata) => {
  const response = await API.patch(`/report/${reportId}/metadata`, metadata)
  return response.data.Report
}

/**
 * Triggers PDF resume generation on the server and retrieves binary blob response.
 *
 * @param {string} reportId - MongoDB ObjectId string of the report.
 * @param {string} CompanyName - Company the resume should be tailored for.
 * @returns {Promise<Blob>} Raw binary PDF blob data.
 */
export const AiGeneratedResumePdf = async (reportId, CompanyName) => {
  const response = await API.post(
    `/resume/pdf/${reportId}`,
    { CompanyName },
    { responseType: 'blob' },
  )
  return response.data
}

export const GetGeneratedResumePdf = async (reportId) => {
  const response = await API.get(`/resume/pdf/${reportId}`, { responseType: 'blob' })
  return response.data
}

/**
 * Requests deep GitHub and live deployment project analysis for a specific report.
 *
 * @param {string} reportId - MongoDB ObjectId string of the report.
 * @returns {Promise<Array<Object>>} Project analysis findings.
 * @throws {Error} If API call fails.
 */
export const AnalyzeResumeProjects = async (reportId) => {
  const response = await API.post(`/${reportId}/analyze-projects`)
  return response.data.AnalyzedProject
}

export const GetResumeProjectAnalysis = async (reportId) => {
  const response = await API.get(`/${reportId}/analyze-projects`)
  return {
    ...response.data.AnalyzedProject,
    analyzed: response.data.analyzed,
  }
}
