import { Link, useLocation, useNavigate } from 'react-router-dom'
import '../styles/home.scss'
import {UseAiReport} from '../Features/AiReports/hook/UseAiReport.js'
import {useEffect, useState,useRef} from "react"
import {UseAuth} from '../Features/Auth/hook/UseAuth.js'
import AiGeneratedResumeSection from '../Features/AiReports/components/AiGeneratedResumeSection.jsx'
import ProjectAnalysisSection from '../Features/AiReports/components/ProjectAnalysisSection.jsx'
import WorkspaceNavigation from '../components/WorkspaceNavigation.jsx'
import ToggleTheme from '../components/ToggleTheme/ToggleTheme.jsx'
import { GetAiLibrary } from '../Features/AiReports/Services/report.api.js'
import { useTheme } from '../contexts/themeContext.js'
import '../styles/visual-system.scss'

const getReportTitle = (report) => {
  if (report.reportTitle?.trim()) return report.reportTitle.trim()
  if (report.targetRole?.trim()) return report.targetRole.trim()
  const description = String(report.jobDescription || '').replace(/\s+/g, ' ').trim()
  const jobTitle = description.match(/job\s*title:\s*([^*\n]+)/i)?.[1]?.trim()
  if (jobTitle) return jobTitle

  const firstLine = description.split(/[.!?]/, 1)[0].replace(/\*+/g, '').trim()
  return firstLine.length > 58 ? `${firstLine.slice(0, 55).trimEnd()}...` : firstLine || 'Interview report'
}

const getReportSummary = (report) => {
  if (report.targetRole?.trim()) return `Target role: ${report.targetRole.trim()}`
  const description = String(report.jobDescription || '')
    .replace(/\*\*/g, '')
    .replace(/job\s*title:\s*[^*\n]+/i, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (!description) return 'Review the analysis and readiness details for this role.'
  return description.length > 112 ? `${description.slice(0, 109).trimEnd()}...` : description
}

const formatReportDate = (date) => {
  if (!date) return 'Date unavailable'
  const parsedDate = new Date(date)
  return Number.isNaN(parsedDate.getTime())
    ? 'Date unavailable'
    : parsedDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function Icon({ name, size = 20 }) {

  const paths = {
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="14" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V4m0 0L7 9m5-5 5 5" />
        <path d="M20 16.5v2A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-2" />
      </>
    ),
    alignment: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8m-4-4v8m-3.5-3.5 7-1" />
      </>
    ),
    skills: (
      <>
        <path d="M4 19V5m0 14h17" />
        <path d="m7 15 4-4 3 2 5-6" />
      </>
    ),
    roadmap: (
      <>
        <circle cx="6" cy="5" r="2" />
        <circle cx="18" cy="19" r="2" />
        <path d="M6 7v3a3 3 0 0 0 3 3h6a3 3 0 0 1 3 3v1" />
        <path d="M18 11v2" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14m-6-6 6 6-6 6" />
      </>
    ),
    file: (
      <>
        <path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10z" />
        <path d="M13 3v7h7m-12 4h8m-8 4h8" />
      </>
    ),
    fileCheck: (
      <>
        <path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" />
        <path d="M13 3v7h7m-7-7v7h7" />
        <path d="m15 17 2 2 4-4" />
      </>
    ),
    checkCircle: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    sparkle: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L15 17l2.2-.8L19 14Z" /></>,
  }

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}



/**
 * Career intake workspace page allowing candidates to submit job descriptions,
 * self-descriptions, and upload/preview PDF resumes for AI evaluation.
 *
 * @returns {import('react').JSX.Element}
 */
function Home() {
  const { theme } = useTheme()
  const [jobDescription, setJobDescription] = useState('')
  const [selfDescription, setSelfDescription] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [selectedResumeFile, setSelectedResumeFile] = useState(null)
  const [resumePreviewUrl, setResumePreviewUrl] = useState('')
  const [isResumePreviewOpen, setIsResumePreviewOpen] = useState(false)
  const resumeInputRef = useRef(null)
  const {
    reports,
    HandleGenerateReport,
    HandleGetAllReports,
    HandleAiGeneratedResumePdf,
  } = UseAiReport()
  const { user, loading: authLoading, HandleLogout } = UseAuth()
  const { hash } = useLocation()
  const [authError, setAuthError] = useState('')
  const [reportsLoading, setReportsLoading] = useState(true)
  const [reportsError, setReportsError] = useState('')
  const [libraryResources, setLibraryResources] = useState({
    generatedResumes: [],
    projectAnalyses: [],
  })
  const [libraryLoading, setLibraryLoading] = useState(true)
  const [libraryError, setLibraryError] = useState('')
  const [selectedResumeReportId, setSelectedResumeReportId] = useState('')
  const [reportSearch, setReportSearch] = useState('')
  const [isResumeReportDialogOpen, setIsResumeReportDialogOpen] = useState(false)
  const [selectedProjectReportId, setSelectedProjectReportId] = useState('')
  const [projectReportSearch, setProjectReportSearch] = useState('')
  const [isProjectReportDialogOpen, setIsProjectReportDialogOpen] = useState(false)
  const [generatingReport, setGeneratingReport] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    return () => {
      if (resumePreviewUrl) {
        URL.revokeObjectURL(resumePreviewUrl)
      }
    }
  }, [resumePreviewUrl])

  useEffect(() => {
    let active = true

    const loadReports = async () => {
      const result = await HandleGetAllReports()
      if (!active) return

      if (result?.success) {
        const savedReports = Array.isArray(result.reports) ? result.reports : []
        setReportsError('')
        setSelectedResumeReportId((currentId) =>
          savedReports.some((report) => report._id === currentId)
            ? currentId
            : String(savedReports[0]?._id || ''),
        )
      } else {
        setReportsError(result?.message || 'Unable to load saved reports.')
      }

      setReportsLoading(false)
    }

    loadReports()
    return () => {
      active = false
    }
  }, [HandleGetAllReports])

  useEffect(() => {
    let active = true

    const loadLibraryResources = async () => {
      try {
        const library = await GetAiLibrary()
        if (active) {
          setLibraryResources({
            generatedResumes: Array.isArray(library?.generatedResumes)
              ? library.generatedResumes
              : [],
            projectAnalyses: Array.isArray(library?.projectAnalyses)
              ? library.projectAnalyses
              : [],
          })
          setLibraryError('')
        }
      } catch (error) {
        console.error('Failed to load dashboard activity:', error)
        if (active) setLibraryError('Saved resource activity is unavailable.')
      } finally {
        if (active) setLibraryLoading(false)
      }
    }

    loadLibraryResources()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!hash) return undefined

    const targetId = decodeURIComponent(hash.slice(1))
    const frameId = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ block: 'start' })
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [hash])

  const handleLogout = async () => {
    setAuthError('')
    const result = await HandleLogout()
    if (result.success) {
      navigate('/login', { replace: true })
    } else {
      setAuthError(result.message)
    }
  }

  const HandleReport = async () => {
    setUploadError('')
    const resumeFile = selectedResumeFile
    if (!resumeFile) {
      setUploadError('Please upload a PDF resume.')
      return
    }

    if (resumeFile.size > 3 * 1024 * 1024) {
      setUploadError('PDF must be 3 MB or smaller.')
      return
    }

    setGeneratingReport(true)
    try {
      const result = await HandleGenerateReport({
        resume: resumeFile,
        jobDescription,
        SelfDescription: selfDescription,
      })
      if (result?.success) {
        navigate(`/interview-report/report/${result.reportId}`)
      } else {
        setUploadError(result?.message || 'Unable to generate your report. Please try again.')
      }
    } finally {
      setGeneratingReport(false)
    }
  }

  const savedReports = Array.isArray(reports) ? reports : []
  const filteredResumeReports = savedReports.filter((report) => {
    const searchText = `${getReportTitle(report)} ${report.jobDescription || ''}`.toLowerCase()
    return searchText.includes(reportSearch.trim().toLowerCase())
  })
  const filteredProjectReports = savedReports.filter((report) => {
    const searchText = `${getReportTitle(report)} ${report.targetRole || ''} ${report.resumeTitle || ''} ${report._id || ''}`.toLowerCase()
    return searchText.includes(projectReportSearch.trim().toLowerCase())
  })
  const selectedResumeReport = savedReports.find(
    (report) => String(report._id) === selectedResumeReportId,
  )
  const selectedProjectReport = savedReports.find(
    (report) => String(report._id) === selectedProjectReportId,
  )
  const latestReport = savedReports[0]
  const latestScore = latestReport?.readiness?.OverallScore
  const hasLatestScore = typeof latestScore === 'number' && Number.isFinite(latestScore)
  const analyzedProjectCount = libraryResources.projectAnalyses.reduce(
    (count, analysis) => count + (Array.isArray(analysis.projects) ? analysis.projects.length : 0),
    0,
  )

  return (
    <main className="workspace" data-theme={theme}>
      <WorkspaceNavigation active="overview" />
      <header className="workspace-nav">
        <div className="workspace-nav__breadcrumb">
          <span>Workspace</span>
          <span aria-hidden="true">/</span>
          <strong>Overview</strong>
        </div>
        <div className="workspace-nav__right">
          <ToggleTheme />
          {user ? (
            <div className="workspace-account">
              <span className="workspace-account__name">
                {user.Fullname?.firstname || user.email}
              </span>
              <span className="workspace-avatar" aria-hidden="true">
                {user.Fullname?.firstname?.[0] || user.email?.[0] || 'U'}
              </span>
              <button
                className="workspace-logout"
                type="button"
                onClick={handleLogout}
                disabled={authLoading}
              >
                {authLoading ? 'Signing out...' : 'Log out'}
                <Icon name="arrow" size={16} />
              </button>
            </div>
          ) : (
            <div className="workspace-auth-actions">
              <Link className="workspace-auth-actions__login" to="/login">Sign in</Link>
            </div>
          )}
        </div>
      </header>
      {authError && <p className="workspace-auth-error" role="alert">{authError}</p>}

      <div className="workspace-content">
        <section className="workspace-dashboard" id="overview" aria-labelledby="workspace-dashboard-title">
          <div className="workspace-dashboard__heading">
            <div>
              <p className="workspace-eyebrow">YOUR CAREER WORKSPACE</p>
              <h1 id="workspace-dashboard-title">Overview</h1>
              <p>Review your latest assessment and continue with the work already in progress.</p>
            </div>
            <a className="workspace-dashboard__action" href="#new-assessment">
              New assessment <Icon name="arrow" size={16} />
            </a>
          </div>

          <div className="workspace-dashboard__summary">
            <article className="workspace-dashboard__latest">
              <div>
                <span className="workspace-dashboard__label">LATEST ASSESSMENT</span>
                {reportsLoading ? (
                  <h2>Loading your latest report…</h2>
                ) : latestReport ? (
                  <>
                    <h2>{getReportTitle(latestReport)}</h2>
                    <p>
                      {[latestReport.targetRole, formatReportDate(latestReport.createdAt)]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                    <Link to={`/interview-report/report/${latestReport._id}`}>
                      Open assessment <Icon name="arrow" size={15} />
                    </Link>
                  </>
                ) : (
                  <>
                    <h2>Start with a role you care about.</h2>
                    <p>Your assessment history will appear here after your first report.</p>
                  </>
                )}
              </div>
              <div className="workspace-dashboard__score">
                <strong>{reportsLoading ? '—' : hasLatestScore ? latestScore : '—'}</strong>
                <span>{latestReport?.readiness?.levels || 'Readiness'}{hasLatestScore ? ' / 100' : ''}</span>
              </div>
            </article>

            <div className="workspace-dashboard__metrics" aria-label="Workspace activity">
              <article>
                <span>ASSESSMENTS</span>
                <strong>{reportsLoading ? '—' : savedReports.length}</strong>
                <small>Saved reports</small>
              </article>
              <article>
                <span>RESUME STUDIO</span>
                <strong>{libraryLoading ? '—' : libraryError ? '—' : libraryResources.generatedResumes.length}</strong>
                <small>Generated resumes</small>
              </article>
              <article>
                <span>PROJECT ANALYZER</span>
                <strong>{libraryLoading ? '—' : libraryError ? '—' : analyzedProjectCount}</strong>
                <small>Projects reviewed</small>
              </article>
            </div>
          </div>

          {libraryError && <p className="workspace-dashboard__notice" role="status">{libraryError}</p>}

          <section className="workspace-dashboard__recent" aria-labelledby="recent-assessments-title">
            <div className="workspace-dashboard__recent-heading">
              <div>
                <span className="workspace-dashboard__label">REPORT HISTORY</span>
                <h2 id="recent-assessments-title">Recent assessments</h2>
              </div>
              <Link to="/interviewAllreport">All reports <Icon name="arrow" size={15} /></Link>
            </div>
            {reportsLoading ? (
              <p className="workspace-dashboard__empty" role="status">Loading your saved assessments…</p>
            ) : reportsError ? (
              <p className="workspace-dashboard__empty" role="alert">{reportsError}</p>
            ) : savedReports.length > 0 ? (
              <div className="workspace-dashboard__report-list">
                {savedReports.slice(0, 4).map((report) => {
                  const score = report.readiness?.OverallScore
                  const validScore = typeof score === 'number' && Number.isFinite(score)

                  return (
                    <Link
                      className="workspace-dashboard__report"
                      key={report._id}
                      to={`/interview-report/report/${report._id}`}
                    >
                      <span>
                        <strong>{getReportTitle(report)}</strong>
                        <small>{[report.targetRole, report.resumeTitle, formatReportDate(report.createdAt)].filter(Boolean).join(' · ')}</small>
                      </span>
                      <span className="workspace-dashboard__report-score">
                        {validScore ? `${score}/100` : 'Score unavailable'}
                      </span>
                      <Icon name="arrow" size={16} />
                    </Link>
                  )
                })}
              </div>
            ) : (
              <p className="workspace-dashboard__empty">
                No assessments yet. Start with a resume and the role you want to explore.
              </p>
            )}
          </section>
        </section>

        <section className="workspace-hero" id="new-assessment" aria-labelledby="workspace-title">
          <p className="workspace-eyebrow">
            NEW ASSESSMENT
          </p>
          <h1 id="workspace-title">
            Measure yourself against the role.
          </h1>
          <p className="workspace-hero__description">
            Add your resume and job details to see where your experience aligns and what to work on next.
          </p>
        </section>

        <section className="analysis-panel" aria-label="Career analysis details">
          <div className="analysis-field">
            <div className="analysis-field__heading">
              <label htmlFor="job-description">Job Description</label>
              <span>01</span>
            </div>
            <p id="job-description-help">
              Paste the job description for the role you&apos;re targeting.
            </p>
            <textarea
            onChange={(e)=>setJobDescription(e.target.value)}
              id="job-description"
              aria-describedby="job-description-help"
              placeholder="Paste the job responsibilities, required skills, qualifications, and experience..."
              rows={5}
            />
          </div>

          <div className="analysis-field analysis-field--personal">
            <div className="analysis-field__heading">
              <label htmlFor="self-description">Tell us about yourself</label>
              <span>02</span>
            </div>
            <p id="self-description-help">
              Describe your experience, technical strengths, projects, and career goals.
            </p>
            <textarea
              onChange={(e) => setSelfDescription(e.target.value)}
              id="self-description"
              aria-describedby="self-description-help"
              placeholder="Example: I'm a full-stack developer familiar with React, Node.js, Express, and MongoDB. I've built projects involving REST APIs, authentication, and real-time communication..."
              rows={5}
            />
          </div>

          <div className="analysis-field analysis-field--resume">
            <div className={`analysis-field__heading resume-heading${selectedResumeFile ? ' resume-heading--selected' : ''}`}>
              <div>
                <span className="resume-heading__eyebrow">Resume</span>
                <h2>03 — Your document</h2>
              </div>
              {selectedResumeFile && (
                <Icon name="checkCircle" size={22} />
              )}
            </div>
            <div className={`resume-dropzone${selectedResumeFile ? ' resume-dropzone--selected' : ''}`}>
              {!selectedResumeFile && (
                <>
              <span className="resume-dropzone__icon">
                <Icon name="file" size={22} />
              </span>
              <div className="resume-dropzone__copy">
                <h2>Upload your resume</h2>
                <p>Add your resume in PDF format.</p>
              </div>
                </>
              )}
              <input
                ref={resumeInputRef}
                className="resume-input"
                type="file"
                accept="application/pdf,.pdf"
                aria-label="Choose a PDF resume"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setSelectedResumeFile(file)
                    setResumePreviewUrl(URL.createObjectURL(file))
                    setIsResumePreviewOpen(false)
                    setUploadError('')
                  }
                }}
              />
              {selectedResumeFile ? (
                <div className="resume-selected">
                  <div className="resume-selected__main">
                    <span className="resume-dropzone__icon">
                      <Icon name="fileCheck" size={24} />
                    </span>
                    <div className="resume-dropzone__copy">
                      <h2 className="resume-file-name" title={selectedResumeFile.name}>
                        {selectedResumeFile.name}
                      </h2>
                      <p>PDF document · Ready to analyze</p>
                    </div>
                    <Icon name="checkCircle" size={22} />
                  </div>
                  <div className="resume-selected__actions">
                    <button
                      className="resume-preview-button"
                      type="button"
                      onClick={() => setIsResumePreviewOpen(true)}
                    >
                      <Icon name="eye" size={16} />
                      Preview
                    </button>
                    <div className="resume-selected__controls">
                      <button
                        className="resume-change-button"
                        type="button"
                        onClick={() => resumeInputRef.current?.click()}
                      >
                        Change file
                        <Icon name="upload" size={15} />
                      </button>
                      <button
                        className="resume-remove-button"
                        type="button"
                        onClick={() => {
                          setSelectedResumeFile(null)
                          setResumePreviewUrl('')
                          setIsResumePreviewOpen(false)
                          if (resumeInputRef.current) {
                            resumeInputRef.current.value = ''
                          }
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    className="choose-file"
                    type="button"
                    onClick={() => resumeInputRef.current?.click()}
                  >
                    <Icon name="upload" size={16} />
                    Choose PDF
                  </button>
                  <span className="resume-format">PDF format</span>
                </>
              )}
            </div>
            {uploadError && <p className="resume-error" role="alert">{uploadError}</p>}
          </div>

          {selectedResumeFile ? (
            <div className="analysis-actions analysis-actions--resume-selected">
              <button onClick={HandleReport} className="analyze-button" type="button" disabled={generatingReport}>
                {generatingReport ? 'Analyzing...' : 'Analyze my profile'}
                <Icon name="arrow" size={18} />
              </button>
              <p>Your resume is selected and ready for analysis.</p>
            </div>
          ) : (
            <div className="analysis-actions">
              <button onClick={HandleReport} className="analyze-button" type="button" disabled={generatingReport}>
                {generatingReport ? 'Analyzing...' : 'Analyze my profile'}
                <Icon name="arrow" size={18} />
              </button>
              <p>Your analysis will help you understand role alignment and areas to improve.</p>
            </div>
          )}
        </section>

        <section className="workspace-resume-studio" id="resume-studio" aria-labelledby="resume-studio-title">
          <div className="workspace-resume-studio__heading">
            <span className="workspace-resume-studio__icon" aria-hidden="true">
              <Icon name="file" size={23} />
            </span>
            <div>
              <p className="workspace-resume-studio__eyebrow">PERSONALIZED DOCUMENT</p>
              <h2 id="resume-studio-title">Create an AI resume</h2>
              <p>Choose an interview report and generate a tailored, ATS-friendly resume PDF.</p>
            </div>
            <div className="workspace-resume-studio__art" aria-hidden="true">
              <Icon name="fileCheck" size={42} />
              <span>AI</span>
              <i />
              <i />
            </div>
          </div>

          {reportsLoading ? (
            <p className="workspace-resume-studio__status" role="status">Loading your saved reports...</p>
          ) : reportsError ? (
            <p className="workspace-resume-studio__error" role="alert">{reportsError}</p>
          ) : savedReports.length > 0 ? (
            <div className="workspace-resume-studio__workspace">
              <section className="workspace-resume-selection" aria-label="Resume source report">
                <span className="workspace-resume-selection__icon" aria-hidden="true">
                  <Icon name="briefcase" size={19} />
                </span>
                <div className="workspace-resume-selection__copy">
                  <span className="workspace-resume-selection__eyebrow">USING INTERVIEW REPORT</span>
                  <strong>{selectedResumeReport ? getReportTitle(selectedResumeReport) : 'Choose a report to get started'}</strong>
                  {selectedResumeReport && (
                    <span>{getReportSummary(selectedResumeReport)} · {formatReportDate(selectedResumeReport.createdAt)}</span>
                  )}
                </div>
                <button
                  className="workspace-resume-selection__button"
                  type="button"
                  onClick={() => setIsResumeReportDialogOpen(true)}
                >
                  {selectedResumeReport ? 'Change report' : 'Choose report'}
                  <Icon name="arrow" size={16} />
                </button>
              </section>

              <div className="workspace-resume-generator">
                {selectedResumeReport ? (
                  <AiGeneratedResumeSection
                    key={selectedResumeReportId}
                    theme={theme}
                    variant="workspace"
                    reportId={selectedResumeReportId}
                    onGenerate={HandleAiGeneratedResumePdf}
                  />
                ) : (
                  <div className="workspace-resume-generator__empty">
                    <Icon name="file" size={38} />
                    <h3>Select a report to get started</h3>
                    <p>Choose an interview report to prepare a tailored resume.</p>
                    <button type="button" onClick={() => setIsResumeReportDialogOpen(true)}>Choose a report</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="workspace-resume-studio__empty">
              <p>You need an interview report before you can create a tailored resume.</p>
              <a href="#job-description">Create an interview report above</a>
            </div>
          )}
        </section>

        <section className="workspace-project-studio" id="project-analyzer" aria-labelledby="project-studio-title">
          <div className="workspace-project-studio__heading">
            <span className="workspace-project-studio__icon" aria-hidden="true">
              <Icon name="skills" size={23} />
            </span>
            <div>
              <p className="workspace-resume-studio__eyebrow">PORTFOLIO REVIEW</p>
              <h2 id="project-studio-title">Analyze resume projects</h2>
              <p>Select a saved resume report to review its GitHub repositories and deployed projects.</p>
            </div>
            <button
              className="workspace-project-studio__select"
              type="button"
              onClick={() => setIsProjectReportDialogOpen(true)}
              disabled={reportsLoading || savedReports.length === 0}
            >
              {selectedProjectReport ? 'Change resume' : 'Select resume'}
              <Icon name="arrow" size={16} />
            </button>
          </div>

          {reportsLoading ? (
            <p className="workspace-resume-studio__status" role="status">Loading saved resumes...</p>
          ) : reportsError ? (
            <p className="workspace-resume-studio__error" role="alert">{reportsError}</p>
          ) : selectedProjectReport ? (
            <div className="workspace-project-studio__content">
              <div className="workspace-project-studio__selected">
                <div>
                  <span>SELECTED RESUME</span>
                  <h3>{getReportTitle(selectedProjectReport)}</h3>
                  {selectedProjectReport.targetRole && <p>Target role: {selectedProjectReport.targetRole}</p>}
                  {selectedProjectReport.resumeTitle && <p>Resume title: {selectedProjectReport.resumeTitle}</p>}
                  <p>Report ID: <code>{selectedProjectReportId}</code></p>
                </div>
                <button type="button" onClick={() => setIsProjectReportDialogOpen(true)}>Choose another</button>
              </div>
              <ProjectAnalysisSection key={selectedProjectReportId} reportId={selectedProjectReportId} />
            </div>
          ) : savedReports.length > 0 ? (
            <div className="workspace-project-studio__empty">
              <h3>Choose a saved resume to begin</h3>
              <p>The report title and ID identify which saved resume the analysis should use.</p>
              <button type="button" onClick={() => setIsProjectReportDialogOpen(true)}>Choose resume</button>
            </div>
          ) : (
            <div className="workspace-project-studio__empty">
              <h3>No saved resumes yet</h3>
              <p>Create an interview report with a PDF resume first. It will be available here for project analysis.</p>
              <a href="#job-description">Create an interview report</a>
            </div>
          )}
        </section>

        <section className="benefits" aria-label="What your analysis covers">
          <article className="benefit">
            <span className="benefit__icon"><Icon name="alignment" /></span>
            <div>
              <h2>Role Alignment</h2>
              <p>Understand how your experience relates to the role.</p>
            </div>
          </article>
          <article className="benefit">
            <span className="benefit__icon"><Icon name="skills" /></span>
            <div>
              <h2>Skill Gap Analysis</h2>
              <p>Identify skills that need further development.</p>
            </div>
          </article>
          <article className="benefit">
            <span className="benefit__icon"><Icon name="roadmap" /></span>
            <div>
              <h2>Preparation Roadmap</h2>
              <p>Organize what to learn and practice next.</p>
            </div>
          </article>
        </section>
      </div>
      {isResumeReportDialogOpen && (
        <div
          className="workspace-project-dialog-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsResumeReportDialogOpen(false)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setIsResumeReportDialogOpen(false)
          }}
        >
          <section
            className="workspace-project-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="resume-report-dialog-title"
          >
            <header className="workspace-project-dialog__header">
              <div>
                <p className="workspace-resume-studio__eyebrow">SAVED REPORTS</p>
                <h2 id="resume-report-dialog-title">Choose a report</h2>
                <p>Select the interview report to tailor your resume.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsResumeReportDialogOpen(false)}
                autoFocus
                aria-label="Close dialog"
              >
                ×
              </button>
            </header>
            <label className="workspace-resume-search" htmlFor="resume-report-search">
              <Icon name="search" size={17} />
              <input
                id="resume-report-search"
                type="search"
                value={reportSearch}
                onChange={(event) => setReportSearch(event.target.value)}
                placeholder="Search by job title or role..."
              />
            </label>
            {filteredResumeReports.length > 0 ? (
              <div className="workspace-project-dialog__list" role="listbox" aria-label="Saved interview reports">
                {filteredResumeReports.map((report) => {
                  const reportId = String(report._id || '')
                  const score = report.readiness?.OverallScore
                  const validScore = typeof score === 'number' && Number.isFinite(score)

                  return (
                    <button
                      className="workspace-project-dialog__option workspace-resume-dialog__option"
                      key={reportId}
                      type="button"
                      role="option"
                      aria-selected={reportId === selectedResumeReportId}
                      onClick={() => {
                        setSelectedResumeReportId(reportId)
                        setReportSearch('')
                        setIsResumeReportDialogOpen(false)
                      }}
                    >
                      <span className="workspace-project-dialog__option-title">{getReportTitle(report)}</span>
                      <span className="workspace-project-dialog__option-date">{getReportSummary(report)}</span>
                      <span className="workspace-project-dialog__option-date">
                        {report.resumeTitle ? `Resume: ${report.resumeTitle} · ` : ''}{formatReportDate(report.createdAt)}
                      </span>
                      <span className="workspace-project-dialog__option-id">
                        ID: {reportId.slice(-8)} · Readiness: {validScore ? score : '—'}
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <p className="workspace-project-dialog__empty">No saved report matches that search.</p>
            )}
          </section>
        </div>
      )}
      {isProjectReportDialogOpen && (
        <div
          className="workspace-project-dialog-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsProjectReportDialogOpen(false)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setIsProjectReportDialogOpen(false)
          }}
        >
          <section
            className="workspace-project-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-report-dialog-title"
          >
            <header className="workspace-project-dialog__header">
              <div>
                <p className="workspace-resume-studio__eyebrow">SAVED RESUMES</p>
                <h2 id="project-report-dialog-title">Choose a resume to analyze</h2>
                <p>Select by report title and ID.</p>
              </div>
              <button type="button" onClick={() => setIsProjectReportDialogOpen(false)} autoFocus aria-label="Close dialog">×</button>
            </header>
            <label className="workspace-resume-search" htmlFor="project-report-search">
              <Icon name="search" size={17} />
              <input
                id="project-report-search"
                type="search"
                value={projectReportSearch}
                onChange={(event) => setProjectReportSearch(event.target.value)}
                placeholder="Search by title or report ID..."
              />
            </label>
            {filteredProjectReports.length > 0 ? (
              <div className="workspace-project-dialog__list" role="listbox" aria-label="Saved resume reports">
                {filteredProjectReports.map((report) => {
                  const reportId = String(report._id || '')
                  return (
                    <button
                      className="workspace-project-dialog__option"
                      key={reportId}
                      type="button"
                      role="option"
                      aria-selected={reportId === selectedProjectReportId}
                      onClick={() => {
                        setSelectedProjectReportId(reportId)
                        setProjectReportSearch('')
                        setIsProjectReportDialogOpen(false)
                      }}
                    >
                      <span className="workspace-project-dialog__option-title">{getReportTitle(report)}</span>
                      {report.targetRole && <span className="workspace-project-dialog__option-date">Target role: {report.targetRole}</span>}
                      {report.resumeTitle && <span className="workspace-project-dialog__option-date">Resume: {report.resumeTitle}</span>}
                      <span className="workspace-project-dialog__option-id">ID: {reportId}</span>
                      <span className="workspace-project-dialog__option-date">{formatReportDate(report.createdAt)}</span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <p className="workspace-project-dialog__empty">No saved report matches that title or ID.</p>
            )}
          </section>
        </div>
      )}
      {isResumePreviewOpen && resumePreviewUrl && (
        <div
          className="resume-preview-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsResumePreviewOpen(false)
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setIsResumePreviewOpen(false)
            }
          }}
        >
          <section
            className="resume-preview-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="resume-preview-title"
          >
            <header className="resume-preview-header">
              <div>
                <h2 id="resume-preview-title">Resume preview</h2>
                <p>{selectedResumeFile?.name}</p>
              </div>
              <button
                className="resume-preview-close"
                type="button"
                onClick={() => setIsResumePreviewOpen(false)}
                autoFocus
              >
                Close
              </button>
            </header>
            <iframe
              className="resume-preview-frame"
              src={resumePreviewUrl}
              title={`Preview of ${selectedResumeFile?.name || 'selected resume'}`}
            />
          </section>
        </div>
      )}
    </main>
  )
}

export default Home
