import * as z from "zod";

const CompanyResearchSchema = z.object({
  companyOverview: z.string(),
  industry: z.string(),

  productsAndServices: z.array(z.string()),
  companyValues: z.array(z.string()),

  targetRole: z.object({
    title: z.string(),
    responsibilities: z.array(z.string()),
    requiredQualifications: z.array(z.string()),
    preferredQualifications: z.array(z.string()),
    eligibilityCriteria: z.array(z.string())
  }),

  technicalRequirements: z.object({
    programmingLanguages: z.array(z.string()),
    frameworks: z.array(z.string()),
    databases: z.array(z.string()),
    tools: z.array(z.string()),
    cloudPlatforms: z.array(z.string()),
    otherSkills: z.array(z.string())
  }),

  softSkills: z.array(z.string()),
  resumeKeywords: z.array(z.string()),

  interviewExpectations: z.object({
    rounds: z.array(z.string()),
    technicalTopics: z.array(z.string())
  }),

  sources: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      sourceType: z.string(),
      confidence: z.enum(["high", "medium", "low"])
    })
  )
});

export { CompanyResearchSchema };