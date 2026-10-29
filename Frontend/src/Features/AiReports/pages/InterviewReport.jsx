import '../styles/interview.report.scss'
import { Link, useParams } from 'react-router-dom'
import ToggleTheme from '../../../components/ToggleTheme/ToggleTheme.jsx'
import { useTheme } from '../../../contexts/themeContext.js'
import InterviewReportDetails from '../components/InterviewReportDetails.jsx'
import AiGeneratedResumeSection from '../components/AiGeneratedResumeSection.jsx'
import {UseAiReport} from '../hook/UseAiReport.js'



// const dimensions = [
//   {
//     name: 'Role Alignment',
//     score: 78,
//     weight: 30,
//     explanation: 'Your full-stack experience maps well to common role responsibilities.',
//   },
//   {
//     name: 'Skill Coverage',
//     score: 70,
//     weight: 25,
//     explanation: 'Most core skills are represented, with a few depth areas to develop.',
//   },
//   {
//     name: 'Technical Knowledge',
//     score: report.readiness.score,
//     weight: report.readiness.weight,
//     explanation: report.readiness.explanation,
//   },
//   {
//     name: 'Practical Ability',
//     score: 74,
//     weight: 20,
//     explanation: 'Project work shows practical delivery and implementation experience.',
//   },
// ]

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
  { slug: 'ai-resume', label: 'AI Resume' },
]

function OverviewPage({ report, reportPath }) {
  return (
    <>
      <section className="ir-overview-score ir-card">
        <div className="ir-overview-score__main">
          <div
            className="ir-score-ring"
            role="img"
            aria-label={`Illustrative readiness score: ${report.readiness.OverallScore} out of 100`}
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
            <p>This is an illustrative sample score to help demonstrate the report layout.</p>
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
            <div><h2>Company readiness</h2><p>Sample score previews across work environments.</p></div>
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
            <div><h2>Skill gap analysis</h2><p>Preview the skills in this sample report.</p></div>
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
          <span><strong>Technical interview questions</strong><small>{report.technicalQuestions.length} sample prompts and answers</small></span>
          <b aria-hidden="true">→</b>
        </Link>
        <Link className="ir-question-link" to={`${reportPath}/behavioral`}>
          <span className="ir-section-icon"><Icon name="chat" /></span>
          <span><strong>Behavioral interview questions</strong><small>{report.behavioralQuestions.length} sample prompts and answers</small></span>
          <b aria-hidden="true">→</b>
        </Link>
      </div>
      <p className="ir-disclaimer">All scores and examples shown are illustrative mock data, not actual assessment results or hiring predictions.</p>
    </>
  )
}

function InterviewReport() {
  const { theme } = useTheme()
  const { section, item, reportId } = useParams()
  const { report, loading, HandleAiGeneratedResumePdf } = UseAiReport()
  const reportPath = reportId ? `/interview-report/report/${reportId}` : '/interview-report'
  const activeSection = reportSections.find((entry) => entry.slug === section)
  const pageTitle = item
    ? section === 'companies'
      ? companyLabels[item] || 'Company details'
      : section === 'skills'
        ? item
        : activeSection?.label
    : activeSection?.label || 'Your Interview Analysis'

  if (loading) return <p>Loading report...</p>
  if (!report) return <p>Report not found.</p>

  return (
    <main className="ir-page" data-theme={theme}>
      <header className="ir-topbar">
        <Link className="ir-brand" to={reportPath} aria-label="JobAnalytics report overview">
          <span className="ir-brand__mark"><Icon name="briefcase" size={18} /></span>
          <span>JobAnalytics</span>
        </Link>
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
        <div className="ir-topbar-actions">
          <Link className="ir-home-link" to="/interviewAllreport">
            All reports
            <span aria-hidden="true">→</span>
          </Link>
          <Link className="ir-home-link" to="/">
            Home
            <span aria-hidden="true">→</span>
          </Link>
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
            <h1>{section ? pageTitle : 'Your Interview Analysis'}</h1>
            <p className="ir-report-subtitle">
              {section
                ? `Explore ${pageTitle.toLowerCase()} with focused details and practical context.`
                 : 'Understand your readiness, identify skill gaps, and plan your next steps.'}
            </p>
          </div>
          {!section && <div className="ir-report-date">
            <span>REPORT DATE</span>
            <strong>October 20, 2026</strong>
          </div>}
        </section>
        {section && <div className="ir-back-link"><Link to="/interview-report">← Back to report overview</Link></div>}
        {section === 'ai-resume' ? (
          <AiGeneratedResumeSection
            reportId={report._id}
            onGenerate={HandleAiGeneratedResumePdf}
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
          <span>JobAnalytics</span>
          <i />
          <p>Illustrative report for career preparation</p>
        </footer>
      </div>
    </main>
  )
}

export default InterviewReport