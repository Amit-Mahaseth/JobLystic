import * as z from "zod";

const InterviewReportSchema = z.object({
  reportTitle: z.string().describe("A concise, professional title for this interview preparation report"),
  targetRole: z.string().describe("The target job role identified from the job description"),
  resumeTitle: z.string().describe("A concise title for the candidate's resume based only on explicit resume information"),
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
});

const responseJsonSchema = z.toJSONSchema(InterviewReportSchema);

export { responseJsonSchema };