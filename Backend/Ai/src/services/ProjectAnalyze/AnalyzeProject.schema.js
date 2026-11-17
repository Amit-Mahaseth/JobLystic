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


const LighthouseDeviceSchema = z.object({
  categoryScores: z.object({
    performance: z.number().min(0).max(100).nullable(),
    accessibility: z.number().min(0).max(100).nullable(),
    bestPractices: z.number().min(0).max(100).nullable(),
    seo: z.number().min(0).max(100).nullable(),
  }),

  metrics: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
      score: z.number().min(0).max(1).nullable(),
    })
  ),

  issues: z.array(z.string()),
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

  lighthouseAudit: z.object({
    mobile: LighthouseDeviceSchema,
    desktop: LighthouseDeviceSchema,
    recommendations: z.array(z.string()),
  }).optional(),

  improvements: z.array(z.string()),
  limitations: z.array(z.string()),
});


const ProjectAnalysisSchema = z.object({
  Github: GitHubProjectAnalyzeSchema.optional(),
  Deployed: DeployedProjectAnalyzeSchema.optional(),
});

const ResumeProjectSchema = z.object({
  name: z.string(),
});

const ResumeProjectsSchema = z.object({
  projects: z.array(ResumeProjectSchema),
});
 const DeployedProjectLinksSchema = z.object({
  links: z.array(
    z.object({
      projectName: z.string(),
      deployedUrl: z.string().url(),
    })
  ),
});

const ResumeProjectsJSONSchema = z.toJSONSchema(ResumeProjectsSchema);
const DeployedProjectLinksJSONSchema = z.toJSONSchema(DeployedProjectLinksSchema);
const ProjectAnalysisJSONSchema = z.toJSONSchema(ProjectAnalysisSchema);

export {
  ProjectAnalysisJSONSchema,
  ProjectAnalysisSchema,
  DeployedProjectLinksJSONSchema,
  ResumeProjectsJSONSchema,
  ResumeProjectsSchema,
  DeployedProjectLinksSchema,
};