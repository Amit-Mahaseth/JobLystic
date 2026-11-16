import mongoose from "mongoose";

const GitHubRepositorySchema = new mongoose.Schema(
  {
    name: String,
    url: String,
    describe: {
      type: String,
      default: "",
    },
    purpose: String,

    architecture: {
      pattern: String,
      structure: String,
      architectureIssues: [String],
    },

    codeQuality: {
      score: {
        type: Number,
        min: 0,
        max: 100,
      },
      strengths: [String],
      issues: [String],
    },

    efficiency: {
      performance: Number,
      performanceIssues: [String],
      scalability: Number,
      scalabilityIssues: [String],
    },

    securityIssues: [String],
    testingRecommendations: [String],
    improvements: [String],
  },
  { _id: false }
);

const GitHubProjectAnalyzeSchema = new mongoose.Schema(
  {
    ProjectName: {
      type: String,
      required: true,
    },
    repositories: {
      type: [GitHubRepositorySchema],
      default: [],
    },
  },
  { _id: false }
);

const DeployedProjectAnalyzeSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    uiUxReview: {
      strengths: [String],
      issues: [String],
    },
    featuresTested: [String],
    navigationIssues: [String],
    accessibilityIssues: [String],
    performanceFindings: [String],
    improvements: [String],
    limitations: [String],
  },
  { _id: false }
);

const ProjectAnalysisItemSchema = new mongoose.Schema(
  {
    ProjectName: {
      type: String,
      required: true,
    },
    Github: {
      type: GitHubProjectAnalyzeSchema,
      default: undefined,
    },
    Deployed: {
      type: DeployedProjectAnalyzeSchema,
      default: undefined,
    },
  },
  { _id: false }
);

const AnalyzeProjectSchema = new mongoose.Schema(
  {
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewReport",
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    projects: {
      type: [ProjectAnalysisItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const AnalyzeProjectModel = mongoose.model("AnalyzeProject", AnalyzeProjectSchema);

export default AnalyzeProjectModel;