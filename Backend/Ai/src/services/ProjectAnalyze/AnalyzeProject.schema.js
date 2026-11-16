import * as z from "zod";

const GitHubRepositorySchema = z.object({
  name: z.string(),
  url: z.string(),
  describe: z.string(),
  purpose: z.string(),

  architecture: z.object({
    pattern: z.string(),
    structure: z.string(),
    architectureIssues: z.array(z.string()),
  }),

  codeQuality: z.object({
    score: z.number().min(0).max(100),
    strengths: z.array(z.string()),
    issues: z.array(z.string()),
  }),

  efficiency: z.object({
    performance: z.number().min(0).max(100),
    performanceIssues: z.array(z.string()),
    scalability: z.number().min(0).max(100),
    scalabilityIssues: z.array(z.string()),
  }),

  securityIssues: z.array(z.string()),
  testingRecommendations: z.array(z.string()),
  improvements: z.array(z.string()),
});

const GitHubProjectAnalyzeSchema = z.object({
  ProjectName: z.string(),
  repositories: z.array(GitHubRepositorySchema).default([]),
});

const DeployedProjectAnalyzeSchema = z.object({
  url: z.string().url(),

  uiUxReview: z.object({
    strengths: z.array(z.string()),
    issues: z.array(z.string()),
  }),

  featuresTested: z.array(z.string()),
  navigationIssues: z.array(z.string()),
  accessibilityIssues: z.array(z.string()),
  performanceFindings: z.array(z.string()),
  improvements: z.array(z.string()),
  limitations: z.array(z.string()),
});

const ProjectAnalysisSchema = z.object({
  Github: GitHubProjectAnalyzeSchema.optional(),
  Deployed: DeployedProjectAnalyzeSchema.optional(),
});

const ResumeProjectsSchema = z.object({
  githubProfileUrl: z.string().nullable(),
  projects: z.array(
    z.object({
      name: z.string().min(1),
      githubUrl: z.string().nullable(),
      deployedUrl: z.string().nullable(),
    })
  ).default([]),
});

const ProjectAnalysisJSONSchema = z.toJSONSchema(ProjectAnalysisSchema);

export {
  ProjectAnalysisJSONSchema,
  ProjectAnalysisSchema,
  ResumeProjectsSchema,
};