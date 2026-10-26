import { useState } from "react";
import {createContext} from "react";




export const InterviewContext=createContext()

export const InterviewProvider=({children})=>{
    const [loading, setloading] = useState(false)
const [Report, setReport] = useState(null)
const [Reports, setReports] = useState([])
    return (
        <InterviewContext.Provider value={{loading,setloading,Report,setReport,Reports,setReports}}>
            {children}
        </InterviewContext.Provider>
    )
}