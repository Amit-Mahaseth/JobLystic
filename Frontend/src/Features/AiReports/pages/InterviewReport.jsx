import '../styles/interview.report.scss'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import WorkspaceNavigation from '../../../components/WorkspaceNavigation.jsx'
import ToggleTheme from '../../../components/ToggleTheme/ToggleTheme.jsx'
import { useTheme } from '../../../contexts/themeContext.js'
import InterviewReportDetails from '../components/InterviewReportDetails.jsx'
import AiGeneratedResumeSection from '../components/AiGeneratedResumeSection.jsx'
import ReportMetadataEditor from '../components/ReportMetadataEditor.jsx'
import { UseAiReport } from '../hook/UseAiReport.js'
import '../../../styles/visual-system.scss'

const companyLabels = {
  'service-based': 'Service-based',
  'product-based': 'Product-based',
  startup: 'Startup',
  enterprise: 'Enterprise',
  consulting: 'Consulting',
}

const statusLabels = {
  'not-assessed': 'Not assessed',
  'needs-preparation': 'Needs preparation',
  developing: 'Developing',
  'better-prepared': 'Better prepared',
}

function Icon({ name, size = 18 }) {
  const paths = {
    briefcase: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" /></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z" /><path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
    building: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1M10 21v-3h4v3" /></>,
    chart: <><path d="M4 19V5m0 14h17" /><path d="m7 15 4-4 3 2 5-6" /></>,
    route: <><circle cx="6" cy="5" r="2" /><circle cx="18" cy="19" r="2" /><path d="M6 7v3a3 3 0 0 0 3 3h6a3 3 0 0 1 3 3v1" /></>,
    code: <><path d="m8 8-4 4 4 4m8-8 4 4-4 4m-3-11-2 14" /></>,
    chat: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8m-8 4h8" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
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

const reportSections = [
  { slug: 'readiness', label: 'Readiness details' },
  { slug: 'companies', label: 'Company readiness' },
  { slug: 'skills', label: 'Skill gap analysis' },
  { slug: 'roadmap', label: 'Preparation roadmap' },
  { slug: 'technical', label: 'Technical questions' },
  { slug: 'behavioral', label: 'Behavioral questions' },
]

/**
 * Overview component rendering the high-level report dashboard cards, scores, and section preview widgets.
 *
 * @param {Object} props
 * @param {Object} props.report - Complete report dataset.
 * @param {string} props.reportPath - Base URL for the current report view.
 * @returns {import('react').JSX.Element}
 */
function OverviewPage({ report, reportPath }) {
  return (
    <>
      <section className="ir-overview-score ir-card">
        <div className="ir-overview-score__main">
          <div
            className="ir-score-ring"
            role="img"
            aria-label={`Readiness score: ${report.readiness.OverallScore} out of 100`}
            style={{ '--score': `${report.readiness.OverallScore}%` }}
          >
            <div className="ir-score-ring__inner">
              <strong>{report.readiness.OverallScore}</strong>
              <span>out of 100</span>
            </div>
          </div>
          <div>
            <span className="ir-level-badge">{report.readiness.levels}</span>
            <h2>Overall readiness</h2>
            <p>This score summarizes the evidence in this assessment.</p>
            <Link className="ir-text-link" to={`${reportPath}/readiness`}>View readiness details <span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <div className="ir-overview-summary">
          <div>
            <h3>Strengths</h3>
            <ul>{report.readiness.strengths.slice(0, 2).map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div>
            <h3>Priority areas</h3>
            <ul>{report.readiness.priorityAreas.slice(0, 2).map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </div>
      </section>

      <div className="ir-overview-grid">
        <section className="ir-card ir-overview-card">
          <div className="ir-overview-card__heading">
            <span className="ir-section-icon"><Icon name="building" /></span>
            <div><h2>Company readiness</h2><p>Readiness signals across company environments.</p></div>
          </div>
          <div className="ir-preview-list">
            {report.companyReadiness.slice(0, 3).map((company) => (
              <Link
                className="ir-preview-row"
                key={company.companyType}
                to={`${reportPath}/companies/${company.companyType}`}
              >
                <span>{companyLabels[company.companyType]}</span>
                <strong>{company.readinessScore}<small>/100</small></strong>
              </Link>
            ))}
          </div>
          <Link className="ir-text-link" to={`${reportPath}/companies`}>View all company types <span aria-hidden="true">→</span></Link>
        </section>

        <section className="ir-card ir-overview-card">
          <div className="ir-overview-card__heading">
            <span className="ir-section-icon"><Icon name="chart" /></span>
            <div><h2>Skill gap analysis</h2><p>Review the gaps identified for this role.</p></div>
          </div>
          <div className="ir-preview-list">
            {report.skillGaps.map((gap) => (
              <Link className="ir-preview-row" key={gap.skill} to={`${reportPath}/skills/${encodeURIComponent(gap.skill)}`}>
                <span>{gap.skill}<i className={`ir-severity-dot ir-severity-dot--${gap.severity}`} /></span>
                <strong>{gap.currentLevel}<small>/100</small></strong>
              </Link>
            ))}
          </div>
          <Link className="ir-text-link" to={`${reportPath}/skills`}>View skill details <span aria-hidden="true">→</span></Link>
        </section>

        <section className="ir-card ir-overview-card ir-overview-roadmap">
          <div className="ir-overview-card__heading">
            <span className="ir-section-icon"><Icon name="route" /></span>
            <div><h2>Preparation roadmap</h2><p>A short preview of suggested next steps.</p></div>
          </div>
          <div className="ir-roadmap-preview">
            {report.roadmap.slice(0, 2).map((task, index) => (
              <div className="ir-roadmap-preview__item" key={task.title}>
                <span>0{index + 1}</span><p>{task.title}</p><small>{task.estimatedMinutes} min</small>
              </div>
            ))}
          </div>
          <Link className="ir-text-link" to={`${reportPath}/roadmap`}>View preparation plan <span aria-hidden="true">→</span></Link>
        </section>
      </div>

      <div className="ir-overview-question-links">
        <Link className="ir-question-link" to={`${reportPath}/technical`}>
          <span className="ir-section-icon"><Icon name="code" /></span>
          <span><strong>Technical interview questions</strong><small>{report.technicalQuestions.length} prompts and answer guides</small></span>
          <b aria-hidden="true">→</b>
        </Link>
        <Link className="ir-question-link" to={`${reportPath}/behavioral`}>
          <span className="ir-section-icon"><Icon name="chat" /></span>
          <span><strong>Behavioral interview questions</strong><small>{report.behavioralQuestions.length} prompts and answer guides</small></span>
          <b aria-hidden="true">→</b>
        </Link>
        <Link className="ir-question-link ir-resume-overview-link" to={`${reportPath}/ai-resume`}>
          <span className="ir-section-icon"><Icon name="file" /></span>
          <span><strong>Create a tailored resume</strong><small>Generate and download a resume PDF</small></span>
          <b aria-hidden="true">→</b>
        </Link>
      </div>
      <p className="ir-disclaimer">Use this assessment as a preparation guide; it is not a prediction of interview or hiring outcomes.</p>
    </>
  )
}

/**
 * Main dashboard view for displaying an interview report, handling section routing,
 * AI resume generation, and detailed sub-views.
 *
 * @returns {import('react').JSX.Element}
 */
function InterviewReport() {
  const { theme } = useTheme()
  const [isMetadataEditorOpen, setIsMetadataEditorOpen] = useState(false)
  const { section, item, reportId } = useParams()
  const { report, loading, HandleAiGeneratedResumePdf, HandleUpdateReportMetadata } = UseAiReport()
  const reportPath = reportId ? `/interview-report/report/${reportId}` : '/interview-report'
  const activeSection = reportSections.find((entry) => entry.slug === section)
    || (section === 'ai-resume' ? { slug: section, label: 'AI Resume' } : undefined)
  const pageTitle = item
    ? section === 'companies'
      ? companyLabels[item] || 'Company details'
      : section === 'skills'
        ? item
        : activeSection?.label
    : activeSection?.label || 'Your Interview Analysis'

  if (loading && (!report || (reportId && report._id !== reportId))) {
    return (
      <main className="ir-page" data-theme={theme}>
        <WorkspaceNavigation active="reports" />
        <div className="ir-container">
          <p className="ir-empty-state" role="status">Loading report…</p>
        </div>
      </main>
    )
  }
  if (!report) {
    return (
      <main className="ir-page" data-theme={theme}>
        <WorkspaceNavigation active="reports" />
        <div className="ir-container">
          <p className="ir-empty-state" role="status">Report not found.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="ir-page" data-theme={theme}>
      <WorkspaceNavigation active="reports" />
      <header className="ir-topbar">
        <div className="ir-topbar-context">
          <Link to="/interviewAllreport">Reports</Link>
          <span aria-hidden="true">/</span>
          <strong>{report.reportTitle || report.targetRole || 'Assessment report'}</strong>
        </div>
        <div className="ir-topbar-tools">
          <nav className="ir-topbar-nav" aria-label="Report sections">
            <Link className={!section ? 'is-active' : ''} to={reportPath}>Overview</Link>
            {reportSections.map((entry) => (
              <Link
                className={section === entry.slug ? 'is-active' : ''}
                key={entry.slug}
                to={`${reportPath}/${entry.slug}`}
              >
                {entry.label}
              </Link>
            ))}
          </nav>
          <ToggleTheme />
        </div>
      </header>

      <div className="ir-container">
        <div className="ir-breadcrumbs">
          <Link to={reportPath}>Report overview</Link>
          {activeSection && <><span aria-hidden="true">/</span><span>{activeSection.label}</span></>}
          {item && <><span aria-hidden="true">/</span><strong>{pageTitle}</strong></>}
        </div>
        <section className="ir-report-header ir-report-header--compact">
          <div>
            <p className="ir-report-kicker"><Icon name="spark" size={15} /> {section ? 'REPORT DETAILS' : 'REPORT OVERVIEW'}</p>
            <h1>{section ? pageTitle : report.reportTitle || 'Your Interview Analysis'}</h1>
            <p className="ir-report-subtitle">
              {section
                ? `Explore ${pageTitle.toLowerCase()} with focused details and practical context.`
                : [
                  report.targetRole && `Target role: ${report.targetRole}`,
                  report.resumeTitle && `Resume: ${report.resumeTitle}`,
                ].filter(Boolean).join(' · ') || 'Understand your readiness, identify skill gaps, and plan your next steps.'}
            </p>
            {!section && (
              <button
                className="ir-report-metadata-edit"
                type="button"
                onClick={() => setIsMetadataEditorOpen(true)}
              >
                Edit report details
              </button>
            )}
          </div>
          {!section && <div className="ir-report-date">
            <span>REPORT DATE</span>
            <strong>{report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Date unavailable'}</strong>
          </div>}
        </section>
        {section && <div className="ir-back-link"><Link to="/interview-report">← Back to report overview</Link></div>}
        {section === 'ai-resume' ? (
          <AiGeneratedResumeSection
            reportId={report._id}
            onGenerate={HandleAiGeneratedResumePdf}
            theme={theme}
          />
        ) : section ? (
          <InterviewReportDetails
            section={section}
            item={item}
            report={report}
            reportPath={reportPath}
            dimensions={report.readiness?.dimensions}
            companyLabels={companyLabels}
            statusLabels={statusLabels}
          />
        ) : (
          <OverviewPage report={report} reportPath={reportPath} />
        )}

        <footer className="ir-footer">
          <span className="ir-footer__mark"><Icon name="briefcase" size={15} /></span>
          <span>Joblystics</span>
          <i />
          <p>Illustrative report for career preparation</p>
        </footer>
      </div>
      {isMetadataEditorOpen && (
        <ReportMetadataEditor
          report={report}
          onClose={() => setIsMetadataEditorOpen(false)}
          onSave={(metadata) => HandleUpdateReportMetadata(report._id, metadata)}
        />
      )}
    </main>
  )
}

export default InterviewReport
