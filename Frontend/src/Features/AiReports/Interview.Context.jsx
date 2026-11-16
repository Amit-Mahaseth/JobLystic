import { useState } from "react";
import { InterviewContext } from "./Interview.Context.js";

/**
 * React Context Provider component managing state for generated reports, report listings,
 * PDF resume data, and project audits.
 *
 * @param {Object} props
 * @param {import('react').ReactNode} props.children
 * @returns {import('react').JSX.Element}
 */
export const InterviewProvider = ({ children }) => {
  const [loading, setloading] = useState(false)
  const [Report, setReport] = useState(null)
  const [Reports, setReports] = useState([])
  const [AiResumePdf, setAiResumePdf] = useState(null)
  const [AnalysisProject, setAnalysisProject] = useState(null)

  return (
    <InterviewContext.Provider value={{
      loading,
      setloading,
      Report,
      setReport,
      Reports,
      setReports,
      AiResumePdf,
      setAiResumePdf,
      AnalysisProject,
      setAnalysisProject
    }}>
      {children}
    </InterviewContext.Provider>
  )
}