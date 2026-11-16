import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import WorkspaceNavigation from '../../../components/WorkspaceNavigation.jsx'
import ToggleTheme from '../../../components/ToggleTheme/ToggleTheme.jsx'
import { useTheme } from '../../../contexts/themeContext.js'
import { GetAiLibrary, GetGeneratedResumePdf } from '../Services/report.api.js'
import { ProjectResult } from '../components/ProjectAnalysisSection.jsx'
import '../styles/interview.report.scss'
import '../styles/ai-library.scss'
import '../../../styles/visual-system.scss'

const getReportTitle = (report) =>
  report.reportTitle?.trim() || report.targetRole?.trim() || report.resumeTitle || 'Interview report'

const formatDate = (date) => {
  if (!date) return 'Date unavailable'
  const parsedDate = new Date(date)
  return Number.isNaN(parsedDate.getTime())
    ? 'Date unavailable'
    : parsedDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function AiLibrary() {
  const { theme } = useTheme()
  const [library, setLibrary] = useState({
    reports: [],
    generatedResumes: [],
    projectAnalyses: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloadingReportId, setDownloadingReportId] = useState('')
  const [previewingReportId, setPreviewingReportId] = useState('')
  const [previewResume, setPreviewResume] = useState(null)

  useEffect(() => {
    if (!previewResume?.url) return undefined

    return () => URL.revokeObjectURL(previewResume.url)
  }, [previewResume])

  useEffect(() => {
    let active = true

    const loadLibrary = async () => {
      try {
        const reports = await GetAiLibrary()
        if (active) {
          setLibrary({
            reports: Array.isArray(reports?.reports) ? reports.reports : [],
            generatedResumes: Array.isArray(reports?.generatedResumes) ? reports.generatedResumes : [],
            projectAnalyses: Array.isArray(reports?.projectAnalyses) ? reports.projectAnalyses : [],
          })
          setError('')
        }
      } catch (loadError) {
        console.error('Failed to load AI library:', loadError)
        if (active) setError('Unable to load your generated content. Please try again.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadLibrary()
    return () => {
      active = false
    }
  }, [])

  const reportsById = new Map(library.reports.map((report) => [String(report._id), report]))
  const resumes = library.generatedResumes
    .map((resume) => ({ ...resume, sourceReport: reportsById.get(String(resume.report)) }))
    .filter((resume) => resume.sourceReport)
  const projectAnalyses = library.projectAnalyses
    .map((analysis) => ({ ...analysis, sourceReport: reportsById.get(String(analysis.report)) }))
    .filter((analysis) => analysis.sourceReport)

  const handleDownload = async (resume) => {
    const reportId = String(resume.report)
    setDownloadingReportId(reportId)
    try {
      const pdf = await GetGeneratedResumePdf(reportId)
      const downloadUrl = URL.createObjectURL(pdf)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = resume.fileName || `Generated-Resume-${reportId}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
    } catch (downloadError) {
      console.error('Failed to download generated resume:', downloadError)
      setError('Unable to download this resume. Please try again.')
    } finally {
      setDownloadingReportId('')
    }
  }

  const handlePreview = async (resume) => {
    const reportId = String(resume.report)
    setPreviewingReportId(reportId)
    setError('')
    try {
      const pdf = await GetGeneratedResumePdf(reportId)
      setPreviewResume({
        url: URL.createObjectURL(pdf),
        reportId,
        title: getReportTitle(resume.sourceReport),
        fileName: resume.fileName || `Generated-Resume-${reportId}.pdf`,
      })
    } catch (previewError) {
      console.error('Failed to preview generated resume:', previewError)
      setError('Unable to preview this resume. Please try again.')
    } finally {
      setPreviewingReportId('')
    }
  }

  return (
    <main className="ir-page ai-library-page" data-theme={theme}>
      <WorkspaceNavigation active="library" />
      <header className="ir-topbar">
        <div className="ir-topbar-context">
          <span>Library</span>
          <span aria-hidden="true">/</span>
          <strong>AI library</strong>
        </div>
        <div className="ir-topbar-actions">
          <Link className="ir-home-link" to="/#new-assessment">New assessment <span aria-hidden="true">→</span></Link>
          <ToggleTheme />
        </div>
      </header>

      <div className="ir-container">
        <section className="ir-report-header ir-report-header--compact ai-library-header">
          <div>
            <p className="ir-report-kicker">YOUR WORKSPACE</p>
            <h1>AI library</h1>
            <p className="ir-report-subtitle">Your generated resumes and saved project reviews, all in one place.</p>
          </div>
          <Link className="ir-home-link" to="/">Create more <span aria-hidden="true">→</span></Link>
        </section>

        {error && <p className="ai-library-error" role="alert">{error}</p>}
        {loading && <p className="ir-empty-state" role="status">Loading your AI library...</p>}

        {!loading && !error && resumes.length === 0 && projectAnalyses.length === 0 && (
          <section className="ai-library-empty">
            <h2>Your AI library is empty</h2>
            <p>Generated resumes and completed project analyses will be saved here.</p>
            <Link className="ir-text-link" to="/">Go to your workspace <span aria-hidden="true">→</span></Link>
          </section>
        )}

        {!loading && (resumes.length > 0 || projectAnalyses.length > 0) && (
          <div className="ai-library-sections">
            <section className="ai-library-section" aria-labelledby="ai-library-resumes-title">
              <header className="ai-library-section__heading">
                <div>
                  <p className="ir-report-kicker">PERSONALIZED DOCUMENTS</p>
                  <h2 id="ai-library-resumes-title">Generated resumes</h2>
                  <p>Download resumes generated from your saved interview reports.</p>
                </div>
                <span>{resumes.length}</span>
              </header>

              {resumes.length ? (
                <div className="ai-library-resume-list">
                  {resumes.map((resume) => (
                    <article className="ai-library-resume" key={resume._id}>
                      <div>
                        <h3>{getReportTitle(resume.sourceReport)}</h3>
                        <p>{resume.sourceReport.targetRole ? `Target role: ${resume.sourceReport.targetRole}` : 'Tailored AI resume'}</p>
                        {resume.sourceReport.resumeTitle && <p>Source resume: {resume.sourceReport.resumeTitle}</p>}
                        <small>Generated {formatDate(resume.generatedAt || resume.updatedAt || resume.sourceReport.createdAt)}</small>
                      </div>
                      <div className="ai-library-resume__actions">
                        <button
                          className="ai-library-resume__preview"
                          type="button"
                          onClick={() => handlePreview(resume)}
                          disabled={previewingReportId !== ''}
                          aria-busy={previewingReportId === String(resume.report)}
                        >
                          {previewingReportId === String(resume.report) ? 'Preparing...' : 'Preview'}
                        </button>
                        <button
                          className="ai-library-resume__download"
                          type="button"
                          onClick={() => handleDownload(resume)}
                          disabled={downloadingReportId === String(resume.report)}
                          aria-busy={downloadingReportId === String(resume.report)}
                        >
                          {downloadingReportId === String(resume.report) ? 'Preparing...' : 'Download PDF'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="ai-library-section__empty">No AI resumes generated yet.</p>
              )}
            </section>

            <section className="ai-library-section" aria-labelledby="ai-library-projects-title">
              <header className="ai-library-section__heading">
                <div>
                  <p className="ir-report-kicker">PORTFOLIO REVIEW</p>
                  <h2 id="ai-library-projects-title">Analyzed projects</h2>
                  <p>Review saved GitHub and deployment analysis results.</p>
                </div>
                <span>{projectAnalyses.reduce((count, analysis) => count + analysis.projects.length, 0)}</span>
              </header>

              {projectAnalyses.length ? (
                <div className="ai-library-project-list">
                  {projectAnalyses.map((analysis) => (
                    <section className="ai-library-project-report" key={analysis._id}>
                      <header>
                        <div>
                          <h3>{getReportTitle(analysis.sourceReport)}</h3>
                          <p>{analysis.sourceReport.targetRole ? `Target role: ${analysis.sourceReport.targetRole}` : `Resume: ${analysis.sourceReport.resumeTitle || 'Interview report'}`}</p>
                        </div>
                        <small>Reviewed {formatDate(analysis.updatedAt || analysis.sourceReport.updatedAt || analysis.sourceReport.createdAt)}</small>
                      </header>
                      <div className="ir-project-analysis__results">
                        {analysis.projects.map((project, index) => (
                          <ProjectResult key={`${project.ProjectName}-${index}`} project={project} />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <p className="ai-library-section__empty">No project analyses completed yet.</p>
              )}
            </section>
          </div>
        )}
      </div>
      {previewResume && createPortal(
        <div
          className="ai-library-preview-backdrop"
          data-theme={theme}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPreviewResume(null)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setPreviewResume(null)
          }}
        >
          <section
            className="ai-library-preview-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-library-preview-title"
          >
            <header>
              <div>
                <span>RESUME PREVIEW</span>
                <h2 id="ai-library-preview-title">{previewResume.title}</h2>
                <p>Review your saved PDF before downloading.</p>
              </div>
              <div className="ai-library-preview-dialog__actions">
                <a href={previewResume.url} target="_blank" rel="noreferrer">Open in new tab</a>
                <a href={previewResume.url} download={previewResume.fileName}>Download PDF</a>
                <button
                  type="button"
                  onClick={() => setPreviewResume(null)}
                  autoFocus
                  aria-label="Close resume preview"
                >
                  ×
                </button>
              </div>
            </header>
            <div className="ai-library-preview-dialog__document">
              <iframe
                src={previewResume.url}
                title={`Preview of ${previewResume.title}`}
              />
            </div>
          </section>
        </div>,
        document.body,
      )}
    </main>
  )
}
