import mongoose from 'mongoose'

const technicalQuestionSchems=new mongoose.Schema({
    question:{
        type:String,
        required:[true,"Question is required"]
    },
    intention:{
        type:String,
        required:[true,"Intention is required"]

    },
    answer:{
        type:String,
        required:[true,"answer is required"]
    }
},{
    _id:false
})
const behavioralQuestionSchems=new mongoose.Schema({
    question:{
        type:String,
        required:[true,"Question is required"]
    },
    intention:{
        type:String,
        required:[true,"Intention is required"]

    },
    answer:{
        type:String,
        required:[true,"answer is required"]
    }
},{
    _id:false
})
const skillGapSchema=new mongoose.Schema({
    skill:{
        type:String,
        required:[true,"Skill is required"]
    },severity:{
        type:String,
        enum:["low",'medium',"high"],
        required:[true,"Severty is required"]
    },
     currentLevel:{
        type:Number,
        min:0,
        max:100,
        required:[true,"Current level is required"]
     },
       requiredLevel: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

      importance: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
        reason: {
      type: String,
      required: true,
    },
        evidence: [{
      type: String,
    }],
        missingConcepts: [{
      type: String,
    }],
    
    recommendedActions: [{
      type: String,
    }],

    confidence: {
      type: Number,
      min: 0,
      max: 1,
      required: true,
    },

},{_id:false})

const roadmapTaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["learn", "practice", "project", "assessment"],
      required: true,
    },

    estimatedMinutes: {
      type: Number,
      min: 1,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const readinessSchema = new mongoose.Schema({
    OverallScore: {
      type: Number,
      min: 0,
max: 100,
      required: true,
    },
    levels: {
      type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        required: true,
    },
  dimensions: [
  {
    name: {
      type: String,
      enum: [
        "roleAlignment",
        "skillCoverage",
        "technicalKnowledge",
        "practicalAbility",
      ],
      required: true,
    },

    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    weight: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    explanation: {
      type: String,
      required: true,
    },
  },
],
           strengths: [
      {
        type: String,
      },
    ],

    priorityAreas: [
      {
        type: String,
      },
    ],
        assessmentCoverage: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    
},{
    _id:false
})

const companyReadinessSchema = new mongoose.Schema(
  {
    companyType: {
      type: String,
      enum: [
        "service-based",
        "product-based",
        "startup",
        "enterprise",
        "consulting",
      ],
      required: true,
    },

    readinessScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "not-assessed",
        "needs-preparation",
        "developing",
        "better-prepared",
      ],
      required: true,
    },

    strengths: [{
      type: String,
    }],

    skillGaps: [{
      type: String,
    }],

    recommendedFocus: [{
      type: String,
    }],

    assessmentCoverage: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    explanation: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const preparationReportSchema=new mongoose.Schema({
    day:{
        type:Number,
        required:true,
    },
    focus:{
        type:String,
        required:true
    },
        skill: {
      type: String,
      required: true,
    },
    tasks:[{
        type:String,
        required:true
    }]
})

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

const InterviewReportSchema=new mongoose.Schema({
    jobDescription:{
        type:String,
        required:[true,"job Description is required"]
    },
    resume:{
        type:String,

    },
    SelfDescription:{
        type:String
    },
roadmap:[roadmapTaskSchema],
readiness:readinessSchema,
companyReadiness:[companyReadinessSchema],
    technicalQuestions:[technicalQuestionSchems],
    behavioralQuestions:[behavioralQuestionSchems],
    skillGaps:[skillGapSchema],
    preparationIdeas:[preparationReportSchema],

    user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"users"
},
ProjectAnalysis:[ProjectAnalysisItemSchema],
AiGeneratedResume:{
    data: {
    type: Buffer,
    required: false,
    default: undefined,
  },
  fileName: {
    type: String,
    default: "Amit-Kumar-Resume.pdf",
  },
  contentType: {
    type: String,
    default: "application/pdf",
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
}

},{timestamps:true})


const InterviewReportModel=mongoose.model("InterviewReport",InterviewReportSchema)

 export default InterviewReportModel