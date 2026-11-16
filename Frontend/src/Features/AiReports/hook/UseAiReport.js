import { useCallback, useContext } from "react";
import { InterviewContext } from '../Interview.Context.js'
import { GenerateInterviewReport, GetAllReports, GetReportById, UpdateReportMetadata, AnalyzeResumeProjects, GetResumeProjectAnalysis, AiGeneratedResumePdf } from '../Services/report.api.js'
import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useProcessing } from '../../../contexts/Processing.Context.jsx'

/**
 * Extracts error message from Axios response or falls back to default message.
 *
 * @param {any} err - Error object thrown by Axios request.
 * @param {string} fallback - Default fallback error message.
 * @returns {string} User-friendly error message.
 */
const getErrorMessage = (err, fallback) =>
  err.response?.data?.msg ||
  err.response?.data?.errors?.[0]?.msg ||
  fallback

/**
 * Custom hook providing state and handlers for generating, fetching, and analyzing AI interview reports.
 *
 * @returns {{
 *   report: Object|null,
 *   reports: Array<Object>,
 *   loading: boolean,
 *   AnalysisProject: Object|null,
 *   HandleGenerateReport: function({ resume: File, jobDescription: string, SelfDescription: string }): Promise<{ success: boolean, reportId?: string, message?: string }>,
 *   HandleGetAllReports: function(): Promise<{ success: boolean, reports?: Array<Object>, message?: string }>,
 *   HandleGetReportById: function(string): Promise<{ success: boolean, message?: string }|void>,
 *   HandleAiGeneratedResumePdf: function(string, string): Promise<{ success: boolean, pdfBlob?: Blob, message?: string }>,
 *   HandleProjectAnalysisReport: function(string): Promise<{ success: boolean, message?: string }|void>
 * }}
 */
export const UseAiReport = () => {
  const { reportId } = useParams()
  const { pathname } = useLocation()

  const context = useContext(InterviewContext)
  const { runWithProcessing } = useProcessing()
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

  const HandleGenerateReport = async ({ resume, jobDescription, SelfDescription }) => {
    const result = await runWithProcessing(
      'Generating Your Interview Report...',
      'Analyzing your resume against the target role and preparing your report.',
      async () => {
        try {
          const data = await GenerateInterviewReport({ resume, jobDescription, SelfDescription })
          setReport(data)
          return { success: true, reportId: data?._id }
        } catch (err) {
          console.error("Failed to generate interview report:", err);
          return {
            success: false,
            message: getErrorMessage(err, "Failed to generate interview report")
          };
        }
      },
    )
    return result || {
      success: false,
      message: 'Another AI operation is already in progress. Please wait for it to finish.',
    }
  }

  const HandleGetAllReports = useCallback(async () => {
    setLoading(true)
    try {
      const data = await GetAllReports()
      setReports(data)
      return { success: true, reports: data }
    } catch (err) {
      console.error("Failed to fetch all reports:", err);
      return {
        success: false,
        message: getErrorMessage(err, "Failed to fetch all reports")
      };
    } finally {
      setLoading(false)
    }
  }, [setLoading, setReports])

  const HandleGetReportById = useCallback(async (reportId) => {
    setLoading(true)
    try {
      const data = await GetReportById(reportId)
      setReport(data)
    } catch (err) {
      console.error("Failed to fetch report by ID:", err);
      return {
        success: false,
        message: getErrorMessage(err, "Failed to fetch report by ID")
      };
    } finally {
      setLoading(false)
    }
  }, [setLoading, setReport])

  const HandleUpdateReportMetadata = async (reportId, metadata) => {
    try {
      const updatedReport = await UpdateReportMetadata(reportId, metadata)
      setReport(updatedReport)
      setReports((currentReports) => currentReports.map((item) =>
        item._id === updatedReport._id ? { ...item, ...metadata } : item,
      ))
      return { success: true }
    } catch (err) {
      return {
        success: false,
        message: getErrorMessage(err, "Failed to update report details"),
      }
    }
  }

  const HandleAiGeneratedResumePdf = async (reportId, CompanyName) => {
    const result = await runWithProcessing(
      'Creating Your Professional Resume PDF...',
      'Tailoring your resume to the target role and preparing a downloadable PDF.',
      async () => {
        try {
          const pdfBlob = await AiGeneratedResumePdf(reportId, CompanyName)
          return { success: true, pdfBlob }
        } catch (err) {
          console.error("Failed to generate AI resume PDF:", err);
          return {
            success: false,
            message: getErrorMessage(err, "Failed to generate AI resume PDF")
          };
        }
      },
    )
    return result || {
      success: false,
      message: 'Another AI operation is already in progress. Please wait for it to finish.',
    }
  }

  const HandleProjectAnalysisReport = async (reportId) => {
    const result = await runWithProcessing(
      'Analyzing Your GitHub Project...',
      'Reviewing the repositories and deployed projects linked in your resume.',
      async () => {
        setAnalysisProject(null)
        try {
          const data = await AnalyzeResumeProjects(reportId)
          setAnalysisProject(data.projects || [])
          return { success: true, projects: data.projects || [] }
        } catch (err) {
          console.error("Failed to analyze resume projects:", err);
          return {
            success: false,
            message: getErrorMessage(err, "Failed to analyze resume projects")
          };
        }
      },
    )
    return result || {
      success: false,
      message: 'Another AI operation is already in progress. Please wait for it to finish.',
    }
  }

  const HandleGetProjectAnalysis = useCallback(async (reportId) => {
    try {
      const data = await GetResumeProjectAnalysis(reportId)
      setAnalysisProject(data.projects || [])
      return {
        success: true,
        analyzed: data.analyzed,
        projects: data.projects || [],
      }
    } catch (err) {
      console.error("Failed to fetch saved project analysis:", err);
      return {
        success: false,
        message: getErrorMessage(err, "Failed to fetch saved project analysis"),
      };
    }
  }, [setAnalysisProject])

  useEffect(() => {
    if (reportId) {
      if (report?._id === reportId) return
      HandleGetReportById(reportId)
      return
    }

    if (!pathname.startsWith('/interview-report') || report?._id) return

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

  return {
    report,
    reports,
    loading,
    AnalysisProject,
    HandleGenerateReport,
    HandleGetAllReports,
    HandleGetReportById,
    HandleUpdateReportMetadata,
    HandleAiGeneratedResumePdf,
    HandleProjectAnalysisReport,
    HandleGetProjectAnalysis
  }
}
