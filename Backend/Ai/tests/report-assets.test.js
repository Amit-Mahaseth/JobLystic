import assert from "node:assert/strict"
import { after, before, mock, test } from "node:test"

process.env.JWT_SECRET = "local-test-secret"
process.env.MONGO_URI = "mongodb://127.0.0.1:27017/jobltest"
process.env.GEMINI_API_KEY = "local-test-key"
process.env.GITHUB_API = "local-test-key"
process.env.FIRECRAWL_API = "local-test-key"

const calls = {
  report: null,
  projectResume: null,
  resumeOptions: null,
  companyName: null,
}

const generatedReport = {
  reportTitle: "Test report",
  targetRole: "Engineer",
  resumeTitle: "Candidate",
  technicalQuestions: [{ question: "How?", intention: "Assess", answer: "Explain." }],
  behavioralQuestions: [{ question: "When?", intention: "Assess", answer: "Describe." }],
  skillGaps: [{
    skill: "Testing",
    severity: "medium",
    currentLevel: 60,
    requiredLevel: 80,
    importance: 4,
    reason: "Role requires testing experience.",
    evidence: ["Resume"],
    missingConcepts: ["Mocks"],
    recommendedActions: ["Practice"],
    confidence: 0.9,
  }],
  preparationIdeas: [{ day: 1, focus: "Testing", skill: "Testing", tasks: ["Write tests"] }],
  roadmap: [{
    title: "Test project",
    description: "Add a test suite.",
    type: "practice",
    estimatedMinutes: 45,
    status: "pending",
    completedAt: null,
  }],
  readiness: {
    OverallScore: 80,
    levels: "Intermediate",
    dimensions: [{
      name: "roleAlignment",
      score: 80,
      weight: 25,
      explanation: "Relevant experience.",
    }],
    strengths: ["Communication"],
    priorityAreas: ["Testing"],
    assessmentCoverage: 80,
  },
  companyReadiness: [{
    companyType: "startup",
    readinessScore: 80,
    status: "developing",
    strengths: ["Ownership"],
    skillGaps: ["Testing"],
    recommendedFocus: ["Practice"],
    assessmentCoverage: 80,
    explanation: "Good baseline.",
  }],
}

mock.module("../src/services/Report/AnalyzeReport.Service.js", {
  exports: {
    InterviewReport: async (input) => {
      calls.report = input
      return generatedReport
    },
  },
})
mock.module("../src/services/ProjectAnalyze/ProjectAnalyze.Service.js", {
  exports: {
    analyzeResumeProjects: async (resume) => {
      calls.projectResume = resume
      return {
        totalProjects: 1,
        projects: [
          {
            ProjectName: "Sample",
            analysis: { Github: { ProjectName: "Sample", repositories: [] } },
            errors: [],
          },
        ],
      }
    },
  },
})
mock.module("../src/services/CompanyResearch/CompanyResearch.Service.js", {
  exports: {
    ResearchCompany: async ({ companyName }) => {
      calls.companyName = companyName
      return { companyName }
    },
  },
})
mock.module("../src/services/AiResume/GenerateResumePdf.Service.js", {
  exports: {
    generateResumePdf: async (options) => {
      calls.resumeOptions = options
      return Buffer.from("%PDF-test")
    },
  },
})
mock.module("pdf-parse", {
  exports: {
    PDFParse: class {
      async getText() {
        return { text: "Candidate resume text" }
      }

      async getInfo() {
        return {
          pages: [{
            pageNumber: 1,
            links: [{
              text: "GitHub profile",
              url: "https://github.com/candidate",
            }],
          }],
        }
      }

      async destroy() {}
    },
  },
})

const [{ default: app }, mongoose, { default: jwt }, models] = await Promise.all([
  import("../src/app.js"),
  import("mongoose"),
  import("jsonwebtoken"),
  Promise.all([
    import("../src/models/Report.model.js"),
    import("../src/models/AnalyzeProject.model.js"),
    import("../src/models/GenerateAiResume.model.js"),
  ]),
])
const [InterviewReportModel, AnalyzeProjectModel, GenerateAiResumeModel] = models.map(
  (module) => module.default,
)

const userId = new mongoose.Types.ObjectId()
const reportId = new mongoose.Types.ObjectId()
const reports = []
const projectAnalyses = []
const generatedResumes = []
let server
let baseUrl

const idString = (value) => String(value?._id ?? value)
const matches = (document, filter) =>
  Object.entries(filter).every(([key, value]) => {
    if (value && Array.isArray(value.$in)) {
      return value.$in.some((candidate) => idString(document[key]) === idString(candidate))
    }
    return idString(document[key]) === idString(value)
  })

function query(value) {
  return {
    select() {
      return this
    },
    sort() {
      return this
    },
    lean() {
      return Promise.resolve(value)
    },
    then(resolve, reject) {
      return Promise.resolve(value).then(resolve, reject)
    },
  }
}

function upsert(collection, filter, update) {
  let document = collection.find((item) => matches(item, filter))
  const values = update.$set || update
  if (!document) {
    document = { _id: new mongoose.Types.ObjectId() }
    collection.push(document)
  }
  Object.assign(document, values)
  return document
}

InterviewReportModel.create = async (data) => {
  const document = new InterviewReportModel(data)
  await document.validate()
  const report = {
    ...document.toObject(),
    _id: reportId,
    createdAt: new Date(),
    updatedAt: new Date(),
    save: async () => {},
  }
  reports.push(report)
  return report
}
InterviewReportModel.find = (filter) => query(reports.filter((report) => matches(report, filter)))
InterviewReportModel.findOne = (filter) => query(reports.find((report) => matches(report, filter)) || null)

AnalyzeProjectModel.find = (filter) =>
  query(projectAnalyses.filter((analysis) => matches(analysis, filter)))
AnalyzeProjectModel.findOne = (filter) =>
  query(projectAnalyses.find((analysis) => matches(analysis, filter)) || null)
AnalyzeProjectModel.findOneAndUpdate = async (filter, update) =>
  upsert(projectAnalyses, filter, update)

GenerateAiResumeModel.find = (filter) =>
  query(generatedResumes.filter((resume) => matches(resume, filter)))
GenerateAiResumeModel.findOne = (filter) =>
  query(generatedResumes.find((resume) => matches(resume, filter)) || null)
GenerateAiResumeModel.findOneAndUpdate = async (filter, update) =>
  upsert(generatedResumes, filter, update)

function authCookie() {
  const token = jwt.sign({ id: String(userId), email: "person@example.com" }, process.env.JWT_SECRET)
  return `token=${token}`
}

async function request(path, options = {}) {
  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      cookie: authCookie(),
      ...options.headers,
    },
  })
}

before(async () => {
  server = app.listen(0)
  await new Promise((resolve) => server.once("listening", resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
  mock.restoreAll()
})

test("report generation stores only interview fields and validates PDF input", async () => {
  const form = new FormData()
  form.append("resume", new Blob(["test"], { type: "application/pdf" }), "resume.pdf")
  form.append("jobDescription", "Engineer role")
  form.append("SelfDescription", "Candidate background")

  const response = await request("/api/report/interview-report", {
    method: "POST",
    body: form,
  })
  const body = await response.json()

  assert.equal(response.status, 201)
  assert.equal(calls.report.resume, "Candidate resume text")
  assert.equal(calls.report.jobDescription, "Engineer role")
  assert.equal(body.InterviewReportGenerated.reportTitle, "Test report")
  assert.equal(typeof reports[0].resume, "object")
  assert.equal(reports[0].resume.extractedText, "Candidate resume text")
  assert.deepEqual(reports[0].resume.extractedLinks, [{
    name: "GitHub profile",
    url: "https://github.com/candidate",
    type: "github-profile",
    projectName: null,
    pageNumber: 1,
  }])
  assert.equal(reports[0].resume.extractionVersion, 2)
  assert.equal(Object.hasOwn(reports[0], "ProjectAnalysis"), false)
  assert.equal(Object.hasOwn(reports[0], "AiGeneratedResume"), false)

  const invalidForm = new FormData()
  invalidForm.append("resume", new Blob(["not pdf"], { type: "text/plain" }), "resume.txt")
  const invalidResponse = await request("/api/report/interview-report", {
    method: "POST",
    body: invalidForm,
  })
  assert.equal(invalidResponse.status, 400)
})

test("project analysis saves to its own collection and can be retrieved", async () => {
  const response = await request(`/api/report/${reportId}/analyze-projects`, { method: "POST" })
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.equal(calls.projectResume, "Candidate resume text")
  assert.equal(projectAnalyses.length, 1)
  assert.equal(idString(projectAnalyses[0].report), String(reportId))
  assert.equal(idString(projectAnalyses[0].user), String(userId))
  assert.equal(projectAnalyses[0].projects[0].ProjectName, "Sample")
  assert.equal(body.AnalyzedProject.projects[0].ProjectName, "Sample")

  const readResponse = await request(`/api/report/${reportId}/analyze-projects`)
  const readBody = await readResponse.json()
  assert.equal(readResponse.status, 200)
  assert.equal(readBody.analyzed, true)
  assert.equal(readBody.AnalyzedProject.totalProjects, 1)
})

test("project analysis rejects missing or invalid extracted resume text", async () => {
  const savedResume = reports[0].resume
  calls.projectResume = null

  try {
    for (const extractedText of [undefined, 42, "  "]) {
      reports[0].resume = { ...savedResume, extractedText }
      const response = await request(`/api/report/${reportId}/analyze-projects`, {
        method: "POST",
      })
      const body = await response.json()

      assert.equal(response.status, 400)
      assert.equal(body.message, "Resume text not found")
    }

    reports[0].resume = undefined
    const response = await request(`/api/report/${reportId}/analyze-projects`, {
      method: "POST",
    })
    const body = await response.json()

    assert.equal(response.status, 404)
    assert.equal(body.message, "Resume not Found")
    assert.equal(calls.projectResume, null)
  } finally {
    reports[0].resume = savedResume
  }
})

test("generated PDF saves separately, downloads, and appears in AI library", async () => {
  const response = await request(`/api/report/resume/pdf/${reportId}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ CompanyName: "Example Corp" }),
  })

  assert.equal(response.status, 200)
  assert.equal(response.headers.get("content-type"), "application/pdf")
  assert.equal(calls.companyName, "Example Corp")
  assert.equal(calls.resumeOptions.resume, "Candidate resume text")
  assert.equal(generatedResumes.length, 1)
  assert.equal(idString(generatedResumes[0].report), String(reportId))
  assert.equal(idString(generatedResumes[0].user), String(userId))
  assert.deepEqual(generatedResumes[0].data, Buffer.from("%PDF-test"))

  const downloadResponse = await request(`/api/report/resume/pdf/${reportId}`)
  assert.equal(downloadResponse.status, 200)
  assert.equal(Buffer.from(await downloadResponse.arrayBuffer()).toString(), "%PDF-test")

  const libraryResponse = await request("/api/report/ai-library")
  const library = (await libraryResponse.json()).AiLibrary
  assert.equal(library.generatedResumes.length, 1)
  assert.equal(library.projectAnalyses.length, 1)
  assert.equal(library.reports.length, 1)
})

test("report retrieval is owner-scoped and does not embed separate assets", async () => {
  const response = await request(`/api/report/report/${reportId}`)
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.equal(body.Report.reportTitle, "Test report")
  assert.equal(Object.hasOwn(body.Report, "ProjectAnalysis"), false)
  assert.equal(Object.hasOwn(body.Report, "AiGeneratedResume"), false)

  const anotherUserId = new mongoose.Types.ObjectId()
  const otherToken = jwt.sign(
    { id: String(anotherUserId), email: "other@example.com" },
    process.env.JWT_SECRET,
  )
  const otherUserResponse = await fetch(`${baseUrl}/api/report/report/${reportId}`, {
    headers: { cookie: `token=${otherToken}` },
  })
  assert.equal(otherUserResponse.status, 404)

  const unauthorized = await fetch(`${baseUrl}/api/report/report/${reportId}`)
  assert.equal(unauthorized.status, 401)
})

test("report summaries and metadata updates preserve the report schema", async () => {
  const summariesResponse = await request("/api/report/all-reports")
  const summaries = (await summariesResponse.json()).AllReports
  assert.equal(summariesResponse.status, 200)
  assert.equal(summaries.length, 1)

  const updateResponse = await request(`/api/report/report/${reportId}/metadata`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      reportTitle: "Updated report",
      targetRole: "Senior Engineer",
      resumeTitle: "Updated resume",
    }),
  })
  const updated = (await updateResponse.json()).Report
  assert.equal(updateResponse.status, 200)
  assert.equal(updated.reportTitle, "Updated report")
  assert.equal(updated.readiness.OverallScore, 80)
  assert.equal(Object.hasOwn(updated, "ProjectAnalysis"), false)
})

test("Mongoose schemas validate required data and keep asset paths separate", async () => {
  const [ReportModel, ProjectModel, ResumeModel] = models.map((module) => module.default)
  const report = new ReportModel({
    user: userId,
    jobDescription: "Engineer role",
    resume: {
      extractedText: "Candidate resume text",
      extractedLinks: [],
    },
  })
  await assert.doesNotReject(() => report.validate())
  await assert.rejects(() =>
    new ReportModel({ user: userId, jobDescription: "Engineer role" }).validate()
  )
  assert.equal(ReportModel.schema.path("ProjectAnalysis"), undefined)
  assert.equal(ReportModel.schema.path("AiGeneratedResume"), undefined)

  const project = new ProjectModel({
    report: reportId,
    user: userId,
    projects: [{ ProjectName: "Sample" }],
  })
  await assert.doesNotReject(() => project.validate())
  await assert.rejects(() => new ProjectModel({ projects: [{ ProjectName: "Sample" }] }).validate())

  const resume = new ResumeModel({
    report: reportId,
    user: userId,
    data: Buffer.from("%PDF-test"),
  })
  await assert.doesNotReject(() => resume.validate())
  await assert.rejects(() => new ResumeModel({ report: reportId, user: userId }).validate())
})
