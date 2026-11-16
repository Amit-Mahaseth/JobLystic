import createGeminiClient from "../GeminiClient.js"
import { responseJsonSchema } from "./AnalyzeReport.schema.js";

const ai = createGeminiClient()

/**
 * Generates an evidence-based interview preparation report using Google Gemini structured outputs.
 *
 * @param {Object} params - Input candidate and target role parameters.
 * @param {string} params.resume - Extracted plain text of the candidate's resume.
 * @param {string} params.SelfDescription - Candidate's personal background and self-description.
 * @param {string} params.jobDescription - Target job requirements and description.
 * @returns {Promise<Object>} Parsed interview report adhering to InterviewReportSchema.
 */
async function InterviewReport({ resume, SelfDescription, jobDescription }) {

  const prompt = `
You are an expert technical interviewer and career-readiness evaluator.

Your task is to generate a detailed, evidence-based interview preparation
report using the candidate's resume, self-description, and target job description.

CANDIDATE INFORMATION

Resume:
${resume}

Self Description:
${SelfDescription}

Job Description:
${jobDescription}

REPORT METADATA

- Generate reportTitle as a concise, useful title for this analysis.
- Identify targetRole from the job description. Use "Not specified" if the role cannot be identified.
- Generate resumeTitle from details explicitly present in the resume. Do not invent a person's name or qualifications; use a concise professional label if no name is clear.


GENERAL ANALYSIS INSTRUCTIONS

1. Analyze the candidate's skills, experience, projects, education, and
   achievements using the provided information.

2. Compare the candidate's demonstrated skills and experience with the
   requirements of the job description.

3. Generate relevant technical and behavioral interview questions,
   skill gaps, preparation ideas, a learning roadmap, overall readiness,
   and company-type-specific readiness assessments.

4. Keep every assessment realistic, specific, actionable, and supported
   by available evidence.

5. Never invent qualifications, experience, achievements, project features,
   technologies, repository contents, or performance results.

6. Clearly distinguish confirmed facts from reasonable inferences.
   When evidence is insufficient, explain the limitation instead of guessing.


OUTPUT REQUIREMENTS

1. Return the complete report using the supplied structured output schema.

2. Follow the schema's field names, data types, arrays, enums, and
   numeric constraints exactly.

3. Keep recommendations specific, concise, technically sound, and
   useful for interview preparation and real-world development.

4. Ensure the report is internally consistent, with readiness scores,
   skill gaps, explanations, and recommendations aligned with the evidence.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseJsonSchema
    }
  })

  return JSON.parse(response.text)
}

export { InterviewReport }