import { useState } from "react";
import {createContext} from "react";




export const InterviewContext=createContext()

export const InterviewProvider=({children})=>{
    const [loading, setloading] = useState(false)
const [Report, setReport] = useState(null)
const [Reports, setReports] = useState([])
const [AiResumePdf, setAiResumePdf] = useState(null)
const [AnalysisProject, setAnalysisProject] = useState(null)
    return (
        <InterviewContext.Provider value={{loading,setloading,Report,setReport,Reports,setReports,AiResumePdf,setAiResumePdf,AnalysisProject,setAnalysisProject}}>
            {children}
        </InterviewContext.Provider>
    )
}