import mongoose from 'mongoose'

/**
 * @typedef {Object} TechnicalQuestion
 * @property {string} question - Interview question prompt.
 * @property {string} intention - Interviewer intent behind the question.
 * @property {string} answer - Recommended candidate answer.
 */

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



const resumeLinkSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "github-profile",
        "github-repository",
        "linkedin",
        "leetcode",
        "social",
        "portfolio",
        "deployed-project",
        "other",
      ],
      default: "other",
    },

    projectName: {
      type: String,
      trim: true,
      default: null,
    },

    pageNumber: {
      type: Number,
      min: 1,
      default: null,
    },
  },
  { _id: false }
);


const resumeFileSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      default: "",
    },

    fileId: {
      type: String,
      default: "",
    },

    fileName: {
      type: String,
      default: "",
    },

    mimeType: {
      type: String,
      default: "application/pdf",
    },

    size: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const resumeSnapshotSchema = new mongoose.Schema(
  {
    originalFile: {
      type: resumeFileSchema,
      default: () => ({}),
    },

    extractedText: {
      type: String,
      required: true,
    },

    extractedLinks: {
      type: [resumeLinkSchema],
      default: [],
    },
extractionVersion: {
  type: Number,
  default: 2,
},

    extractedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);


const InterviewReportSchema=new mongoose.Schema({
  reportTitle:{
    type:String,
    trim:true,
    default:""
  },
  targetRole:{
    type:String,
    trim:true,
    default:""
  },

  resumeTitle:{
    type:String,
    trim:true,
    default:""
  },
    jobDescription:{
        type:String,
        required:[true,"job Description is required"]
    },
 resume: {
    type: resumeSnapshotSchema,
    required: true,
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
    },{timestamps:true})


const InterviewReportModel=mongoose.model("InterviewReport",InterviewReportSchema)

 export default InterviewReportModel