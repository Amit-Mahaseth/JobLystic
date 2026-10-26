import { Link } from 'react-router-dom'
import '../styles/home.scss'
import {UseAiReport} from '../Features/AiReports/hook/UseAiReport.js'
import {useEffect, useState,useRef} from "react"
import {useNavigate} from "react-router-dom"
import {UseAuth} from '../Features/Auth/hook/UseAuth.js'
import ToggleTheme from '../components/ToggleTheme/ToggleTheme.jsx'
import { useTheme } from '../contexts/themeContext.js'
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



function Home() {
  const { theme } = useTheme()
  const [jobDescription, setJobDescription] = useState('')
  const [selfDescription, setSelfDescription] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [selectedResumeFile, setSelectedResumeFile] = useState(null)
  const [resumePreviewUrl, setResumePreviewUrl] = useState('')
  const [isResumePreviewOpen, setIsResumePreviewOpen] = useState(false)
  const resumeInputRef = useRef(null)
  const { loading, HandleGenerateReport } = UseAiReport()
  const { user, loading: authLoading, HandleLogout } = UseAuth()
  const [authError, setAuthError] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    return () => {
      if (resumePreviewUrl) {
        URL.revokeObjectURL(resumePreviewUrl)
      }
    }
  }, [resumePreviewUrl])

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

    const result = await HandleGenerateReport({
      resume: resumeFile,
      jobDescription,
      SelfDescription: selfDescription,
    })
    if (result?.success) {
      navigate('/interview-report')
    } else {
      setUploadError(result?.message || 'Unable to generate your report. Please try again.')
    }
  }
  return (
    <main className="workspace" data-theme={theme}>
      <header className="workspace-nav">
        <Link className="workspace-brand" to="/" aria-label="JobAnalytics home">
          <span className="workspace-brand__icon">
            <Icon name="briefcase" size={19} />
          </span>
          <span>JobAnalytics</span>
        </Link>
        <div className="workspace-nav__right">
          <span className="workspace-nav__label">Career Workspace</span>
          <Link className="workspace-reports-link" to="/interview-report">
            View reports
            <Icon name="arrow" size={16} />
          </Link>
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
        <section className="workspace-hero" aria-labelledby="workspace-title">
          <p className="workspace-eyebrow">
            <span aria-hidden="true" />
            AI-POWERED CAREER ANALYSIS
          </p>
          <h1 id="workspace-title">
            Understand your fit.
            <span>Prepare with purpose.</span>
          </h1>
          <p className="workspace-hero__description">
            Analyze your resume against your target role, discover skill gaps, and
            build a focused preparation roadmap.
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
                        disabled={loading}
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
                        disabled={loading}
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
                    disabled={loading}
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
              <button onClick={HandleReport} className="analyze-button" type="button" disabled={loading}>
                {loading ? 'Analyzing...' : 'Analyze my profile'}
                <Icon name="arrow" size={18} />
              </button>
              <p>Your resume is selected and ready for analysis.</p>
            </div>
          ) : (
            <div className="analysis-actions">
              <button onClick={HandleReport} className="analyze-button" type="button" disabled={loading}>
                {loading ? 'Analyzing...' : 'Analyze my profile'}
                <Icon name="arrow" size={18} />
              </button>
              <p>Your analysis will help you understand role alignment and areas to improve.</p>
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
