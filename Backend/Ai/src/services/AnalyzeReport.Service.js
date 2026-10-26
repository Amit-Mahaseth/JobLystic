import { GoogleGenAI } from "@google/genai"
import config from "../config/config.js"
import * as z from "zod";

const ai = new GoogleGenAI({
  apiKey: config.GEMINI_API_KEY

})

const InterviewReportSchema = z.object({
  technicalQuestions: z.array(z.object({
    question: z.string().describe("The technical question"),
    intention: z.string().describe("The intention behind the question"),
    answer: z.string().describe("The candidate's answer")
  })).describe("Array of technical questions and answers"),
  behavioralQuestions: z.array(z.object({
    question: z.string().describe("The behavioral question"),
    intention: z.string().describe("The intention behind the question"),
    answer: z.string().describe("The candidate's answer")
  })).describe("Array of behavioral questions and answers"),
  skillGaps: z.array(z.object({
    skill: z.string().describe("The skill that has a gap"),
    severity: z.enum(["low", "medium", "high"]).describe("The severity of the skill gap"),
    currentLevel: z.number().min(0).max(100).describe("The candidate's current level in the skill"),
    requiredLevel: z.number().min(0).max(100).describe("The required level for the skill"),
    importance: z.number().min(1).max(5).describe("The importance of the skill for the job"),
    reason: z.string().describe("The reasoning behind the skill gap assessment"),
    evidence: z.array(z.string().describe("Evidence supporting the skill gap assessment")),
    missingConcepts: z.array(z.string().describe("Missing concepts related to the skill gap")),
    recommendedActions: z.array(z.string().describe("Recommendations to address the skill gap")),
    confidence: z.number().min(0).max(1).describe("Confidence level of the skill gap assessment")
  })).describe("Array of skill gaps and their severities"),
  preparationIdeas: z.array(z.object({
    day: z.number().describe("The day number for the preparation idea"),
    focus: z.string().describe("The focus of the preparation idea"),
    skill: z.string().describe("The skill to be improved"),
    tasks: z.array(z.string()).describe("Array of tasks for the preparation idea ")
  })).describe("Array of preparation ideas for the candidate"),
  roadmap: z.array(z.object({
    title: z.string().describe("The title of the roadmap task"),
    description: z.string().describe("The description of the roadmap task"),
    type: z.enum(["learn", "practice", "project", "assessment"]).describe("The type of the roadmap task"),
    estimatedMinutes: z.number().min(1).describe("Estimated time in minutes to complete the roadmap task"),
    status: z.enum(["pending", "in-progress", "completed"]).describe("The status of the roadmap task"),
    completedAt: z.string().nullable().describe("ISO date when the roadmap task was completed, or null")
  })).describe("Array of roadmap tasks for the candidate"),
  readiness: z.object({
    OverallScore: z.number().min(0).max(100)
      .describe("Overall readiness score for the candidate"),

    levels: z.enum([
      "Beginner",
      "Intermediate",
      "Advanced"
    ]).describe("Readiness level for the candidate"),

    dimensions: z.array(
      z.object({
        name: z.enum([
          "roleAlignment",
          "skillCoverage",
          "technicalKnowledge",
          "practicalAbility"
        ]).describe("The readiness dimension being assessed"),

        score: z.number().min(0).max(100)
          .describe("Score for the readiness dimension"),

        weight: z.number().min(0).max(100)
          .describe("Weight of the readiness dimension"),

        explanation: z.string()
          .describe("Explanation of the readiness assessment")
      }).describe("Details of an individual readiness dimension")
    ).describe("Array of readiness dimensions with scores and weights"),

    strengths: z.array(z.string())
      .describe("Candidate strengths"),

    priorityAreas: z.array(z.string())
      .describe("Areas the candidate should prioritize"),

    assessmentCoverage: z.number().min(0).max(100)
      .describe("Percentage of the assessment covered")
  }).describe("Readiness assessment for the candidate"),
  companyReadiness: z.array(z.object({
    companyType: z.enum(["service-based", "product-based", "startup", "enterprise", "consulting"])
      .describe("The type of company being assessed"),
    readinessScore: z.number().min(0).max(100).describe("Readiness score for this company type"),
    status: z.enum(["not-assessed", "needs-preparation", "developing", "better-prepared"])
      .describe("Preparation status for this company type"),
    strengths: z.array(z.string()).describe("Candidate strengths relevant to this company type"),
    skillGaps: z.array(z.string()).describe("Skill gaps relevant to this company type"),
    recommendedFocus: z.array(z.string()).describe("Recommended preparation focus"),
    assessmentCoverage: z.number().min(0).max(100).describe("Percentage of the assessment covered"),
    explanation: z.string().describe("Explanation of the company readiness assessment")
  })).describe("Readiness assessments for different company types"),

})

const responseJsonSchema = z.toJSONSchema(InterviewReportSchema);


async function InterviewReport({ resume, SelfDescription, jobDescription }) {
  const prompt = `
You are an expert technical interviewer, software engineer, code reviewer,
and career-readiness evaluator.

Your task is to generate a detailed, evidence-based interview preparation
report using the candidate's resume, self-description, and target job description.

CANDIDATE INFORMATION

Resume:
${resume}

Self Description:
${SelfDescription}

Job Description:
${jobDescription}


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


PROJECT URL EXTRACTION

1. Identify projects explicitly mentioned in the resume.

2. Extract GitHub repository URLs and deployed website URLs explicitly
   associated with those projects.

3. Accept valid GitHub repository links and public deployment links from
   platforms such as Render, Vercel, Netlify, or custom domains.

4. Associate each URL with the correct project using the surrounding
   resume text. Do not assume unrelated links belong to a project.

5. Do not invent, reconstruct, or guess URLs.

6. If no GitHub repository URL is found, omit the Github analysis field.

7. If no deployed website URL is found, omit the Deployed analysis field.

8. If a URL is ambiguous, invalid, or cannot be associated confidently
   with a project, do not treat it as a verified project link.


GITHUB PROJECT ANALYSIS

Analyze a repository only when its source code, repository metadata,
or relevant files have actually been retrieved and provided as input.

For each analyzed repository, evaluate:

- Project purpose and core functionality.
- Architecture patterns, folder structure, module responsibilities,
  and separation of concerns.
- Code quality, maintainability, duplication, error handling,
  and consistency.
- Potential performance bottlenecks and inefficient operations.
- Scalability limitations and architectural risks.
- Security weaknesses visible in the inspected code.
- Testing practices, missing test coverage, and test recommendations.
- Practical improvements prioritized by impact and effort.

For each identified issue, provide specific evidence and relevant file
paths whenever that information is available.

Do not claim that code is vulnerable, inefficient, or incorrect without
supporting evidence. Distinguish potential risks from confirmed defects.

Scores must reflect the available code evidence. Do not imply that a
performance score is based on benchmarks unless benchmarks were performed.

If repository contents were not retrieved, do not fabricate a code review.
Explain the limitation through the appropriate report fields.


DEPLOYED PROJECT ANALYSIS

Inspect a deployed website only when its pages or browser observations
have actually been retrieved and provided as input.

Evaluate:

- UI design, readability, layout, and user experience.
- Navigation and observed user flows.
- Features that were actually tested.
- Accessibility issues that were actually observed or tested.
- Performance measurements, if measurements are available.
- Practical improvements to usability and reliability.

Do not claim that a feature works merely because it is visible.
Do not claim that a page, feature, or interaction was tested unless
the inspection evidence supports that claim.

If the website is inaccessible, requires authentication, or cannot be
fully inspected, record the limitation accurately.

Do not infer backend implementation details from the visible website alone.


OUTPUT REQUIREMENTS

1. Return the complete report using the supplied structured output schema.

2. Follow the schema's field names, data types, arrays, enums, and
   numeric constraints exactly.

3. Include ProjectAnalysis only when applicable to the available input
   and supported by the schema.

4. If a project URL is found but its contents have not been retrieved,
   do not pretend that the project has been analyzed.

5. Keep recommendations specific, concise, technically sound, and
   useful for interview preparation and real-world development.

6. Ensure the report is internally consistent, with readiness scores,
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