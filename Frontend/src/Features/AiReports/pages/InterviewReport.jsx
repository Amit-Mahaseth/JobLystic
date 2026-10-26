import '../styles/interview.report.scss'
import { Link, useParams } from 'react-router-dom'
import ToggleTheme from '../../../components/ToggleTheme/ToggleTheme.jsx'
import { useTheme } from '../../../contexts/themeContext.js'
import InterviewReportDetails from '../components/InterviewReportDetails.jsx'

const report = {
  readiness: {
    OverallScore: 72,
    levels: 'Intermediate',
    dimensions: 'technicalKnowledge',
    score: 72,
    weight: 25,
    explanation:
      'A solid foundation across full-stack development, with clear opportunities to strengthen system design and production-scale experience.',
    strengths: [
      'Strong hands-on experience building full-stack applications',
      'Comfortable with REST APIs, authentication, and data modeling',
      'Good command of modern React development patterns',
    ],
    priorityAreas: [
      'Designing resilient, high-traffic backend systems',
      'Improving testing strategy and production observability',
      'Explaining trade-offs with clear, structured reasoning',
    ],
    assessmentCoverage: 86,
  },
  companyReadiness: [
    {
      companyType: 'service-based',
      readinessScore: 78,
      status: 'better-prepared',
      evidence: ['Examples span both client-facing requirements and implementation work.'],
      strengths: ['Client-focused communication', 'Broad full-stack toolkit'],
      skillGaps: ['Cloud deployment patterns'],
      recommendedFocus: ['Practice requirement discovery and project estimation'],
      assessmentCoverage: 90,
      explanation: 'A versatile profile suited to varied client projects and delivery teams.',
    },
    {
      companyType: 'product-based',
      readinessScore: 71,
      status: 'developing',
      evidence: ['Project examples show user-facing feature delivery and modern frontend work.'],
      strengths: ['User-focused feature development', 'Modern frontend experience'],
      skillGaps: ['System design', 'Performance at scale'],
      recommendedFocus: ['Study service boundaries and product metrics'],
      assessmentCoverage: 84,
      explanation: 'Good product engineering fundamentals; deepen scale and ownership examples.',
    },
    {
      companyType: 'startup',
      readinessScore: 82,
      status: 'better-prepared',
      evidence: ['Examples demonstrate end-to-end ownership across multiple application layers.'],
      strengths: ['End-to-end project ownership', 'Adaptability across the stack'],
      skillGaps: ['Prioritization under ambiguity'],
      recommendedFocus: ['Prepare examples of shipping iterative solutions'],
      assessmentCoverage: 88,
      explanation: 'Hands-on breadth aligns well with fast-moving, cross-functional teams.',
    },
    {
      companyType: 'enterprise',
      readinessScore: 64,
      status: 'needs-preparation',
      evidence: ['Current examples provide less detail on distributed systems and operational controls.'],
      strengths: ['Structured API development', 'Reliable data handling'],
      skillGaps: ['Distributed systems', 'Governance and observability'],
      recommendedFocus: ['Review reliability, access control, and service operations'],
      assessmentCoverage: 79,
      explanation: 'A promising base, with additional preparation needed for complex environments.',
    },
    {
      companyType: 'consulting',
      readinessScore: 74,
      status: 'developing',
      evidence: ['Examples indicate adaptable problem solving and technical communication.'],
      strengths: ['Clear technical communication', 'Flexible problem solving'],
      skillGaps: ['Architecture presentation'],
      recommendedFocus: ['Practice concise architecture walkthroughs'],
      assessmentCoverage: 83,
      explanation: 'A balanced profile that can grow through more structured solution narratives.',
    },
  ],
  skillGaps: [
    {
      skill: 'Node.js',
      severity: 'low',
      currentLevel: 76,
      requiredLevel: 82,
      importance: 4,
      reason: 'Core backend experience is present; production operations and resilience patterns could be more detailed.',
      evidence: ['Experience with REST APIs and authentication', 'MongoDB-backed application projects'],
      missingConcepts: ['Event-loop performance', 'Graceful shutdown and observability'],
      recommendedActions: ['Profile a Node.js service under load', 'Add structured logs and health checks to a project'],
      confidence: 0.91,
    },
    {
      skill: 'React',
      severity: 'medium',
      currentLevel: 72,
      requiredLevel: 86,
      importance: 5,
      reason: 'Component development is a strength; advanced rendering and testing practices need deeper evidence.',
      evidence: ['Built interfaces with reusable components', 'Experience integrating client-side APIs'],
      missingConcepts: ['Render optimization', 'Accessible component testing'],
      recommendedActions: ['Practice profiling a data-heavy view', 'Add component tests with keyboard accessibility checks'],
      confidence: 0.88,
    },
    {
      skill: 'System Design',
      severity: 'high',
      currentLevel: 54,
      requiredLevel: 84,
      importance: 5,
      reason: 'Application-level implementation is stronger than the current evidence of designing for scale and failure.',
      evidence: ['Project examples focus on features and APIs', 'Limited discussion of scaling and service boundaries'],
      missingConcepts: ['Caching strategies', 'Queue-based processing', 'Availability and consistency trade-offs'],
      recommendedActions: ['Design a rate-limited notification service', 'Explain data flow, failure modes, and scaling decisions'],
      confidence: 0.84,
    },
  ],
  roadmap: [
    {
      title: 'Map a scalable API architecture',
      description: 'Sketch a service boundary, request flow, and data model for a growing product API.',
      type: 'learn',
      estimatedMinutes: 35,
      status: 'completed',
      completedAt: '2026-10-18T12:00:00.000Z',
    },
    {
      title: 'Practice system design trade-offs',
      description: 'Work through caching, queues, and failure handling for a notification service.',
      type: 'practice',
      estimatedMinutes: 45,
      status: 'in-progress',
      completedAt: null,
    },
    {
      title: 'Build a small observability demo',
      description: 'Add structured logs, health checks, and request metrics to a Node.js service.',
      type: 'project',
      estimatedMinutes: 90,
      status: 'pending',
      completedAt: null,
    },
    {
      title: 'Review and explain a design',
      description: 'Present the architecture, identify bottlenecks, and discuss alternatives out loud.',
      type: 'assessment',
      estimatedMinutes: 30,
      status: 'pending',
      completedAt: null,
    },
  ],
  preparationIdeas: [
    {
      day: 1,
      focus: 'Core concepts',
      skill: 'System Design',
      tasks: ['Review latency, throughput, and availability', 'Compare caching approaches'],
    },
    {
      day: 2,
      focus: 'Guided practice',
      skill: 'System Design',
      tasks: ['Design a notification service', 'Trace one request and its failure modes'],
    },
    {
      day: 3,
      focus: 'Hands-on project',
      skill: 'Node.js',
      tasks: ['Add health checks and structured logging', 'Load-test a key endpoint'],
    },
    {
      day: 4,
      focus: 'Interview rehearsal',
      skill: 'React',
      tasks: ['Explain a performance improvement', 'Practice a component testing walkthrough'],
    },
  ],
  technicalQuestions: [
    {
      question: 'How would you design a notification service that can handle traffic spikes?',
      intention: 'Evaluates system design fundamentals, queueing strategy, reliability, and scaling trade-offs.',
      answer:
        'I would place a durable queue between request intake and delivery workers, then scale workers based on queue depth. I would make delivery idempotent, apply retries with backoff, and send repeatedly failing messages to a dead-letter queue. I would monitor queue age and delivery latency so capacity issues are visible early.',
    },
    {
      question: 'What happens in the Node.js event loop when one request performs CPU-heavy work?',
      intention: 'Checks understanding of Node.js concurrency and approaches to keeping the event loop responsive.',
      answer:
        'CPU-heavy work can block the event loop and delay unrelated requests. I would measure the workload first, then move suitable computation to worker threads or a separate job service. For I/O-bound work, I would keep operations asynchronous and monitor event-loop delay.',
    },
    {
      question: 'How do you decide whether a React component should be memoized?',
      intention: 'Assesses practical performance judgment and understanding of React rendering behavior.',
      answer:
        'I start by profiling rather than adding memoization everywhere. If a component is measurably expensive and rerenders with stable inputs, memoization can help. I also check whether state or component boundaries can be improved, since that may be a simpler fix.',
    },
  ],
  behavioralQuestions: [
    {
      question: 'Tell me about a time you had to learn a new technology to deliver a project.',
      intention: 'Explores learning agility, ownership, and how the candidate manages uncertainty.',
      answer:
        'On a project, I needed to add a capability that was new to me. I first clarified the expected behavior, then built a small proof of concept and checked the approach with a teammate. I documented what I learned and delivered the feature in smaller, testable steps.',
    },
    {
      question: 'Describe a technical disagreement and how you worked through it.',
      intention: 'Evaluates collaboration, communication, and the ability to compare trade-offs constructively.',
      answer:
        'I asked the other person to explain their main concern, then compared both approaches against reliability, delivery time, and maintenance. We agreed on a small experiment to validate the riskiest assumption. The evidence helped us choose a direction without making it personal.',
    },
  ],
}

const dimensions = [
  {
    name: 'Role Alignment',
    score: 78,
    weight: 30,
    explanation: 'Your full-stack experience maps well to common role responsibilities.',
  },
  {
    name: 'Skill Coverage',
    score: 70,
    weight: 25,
    explanation: 'Most core skills are represented, with a few depth areas to develop.',
  },
  {
    name: 'Technical Knowledge',
    score: report.readiness.score,
    weight: report.readiness.weight,
    explanation: report.readiness.explanation,
  },
  {
    name: 'Practical Ability',
    score: 74,
    weight: 20,
    explanation: 'Project work shows practical delivery and implementation experience.',
  },
]

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
]

function OverviewPage() {
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
            <Link className="ir-text-link" to="/interview-report/readiness">View readiness details <span aria-hidden="true">→</span></Link>
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
                to={`/interview-report/companies/${company.companyType}`}
              >
                <span>{companyLabels[company.companyType]}</span>
                <strong>{company.readinessScore}<small>/100</small></strong>
              </Link>
            ))}
          </div>
          <Link className="ir-text-link" to="/interview-report/companies">View all company types <span aria-hidden="true">→</span></Link>
        </section>

        <section className="ir-card ir-overview-card">
          <div className="ir-overview-card__heading">
            <span className="ir-section-icon"><Icon name="chart" /></span>
            <div><h2>Skill gap analysis</h2><p>Preview the skills in this sample report.</p></div>
          </div>
          <div className="ir-preview-list">
            {report.skillGaps.map((gap) => (
              <Link className="ir-preview-row" key={gap.skill} to={`/interview-report/skills/${encodeURIComponent(gap.skill)}`}>
                <span>{gap.skill}<i className={`ir-severity-dot ir-severity-dot--${gap.severity}`} /></span>
                <strong>{gap.currentLevel}<small>/100</small></strong>
              </Link>
            ))}
          </div>
          <Link className="ir-text-link" to="/interview-report/skills">View skill details <span aria-hidden="true">→</span></Link>
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
          <Link className="ir-text-link" to="/interview-report/roadmap">View preparation plan <span aria-hidden="true">→</span></Link>
        </section>
      </div>

      <div className="ir-overview-question-links">
        <Link className="ir-question-link" to="/interview-report/technical">
          <span className="ir-section-icon"><Icon name="code" /></span>
          <span><strong>Technical interview questions</strong><small>{report.technicalQuestions.length} sample prompts and answers</small></span>
          <b aria-hidden="true">→</b>
        </Link>
        <Link className="ir-question-link" to="/interview-report/behavioral">
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
  const { section, item } = useParams()
  const activeSection = reportSections.find((entry) => entry.slug === section)
  const pageTitle = item
    ? section === 'companies'
      ? companyLabels[item] || 'Company details'
      : section === 'skills'
        ? item
        : activeSection?.label
    : activeSection?.label || 'Your Interview Analysis'

  return (
    <main className="ir-page" data-theme={theme}>
      <header className="ir-topbar">
        <Link className="ir-brand" to="/interview-report" aria-label="JobAnalytics report overview">
          <span className="ir-brand__mark"><Icon name="briefcase" size={18} /></span>
          <span>JobAnalytics</span>
        </Link>
        <nav className="ir-topbar-nav" aria-label="Report sections">
          <Link className={!section ? 'is-active' : ''} to="/interview-report">Overview</Link>
          {reportSections.map((entry) => (
            <Link
              className={section === entry.slug ? 'is-active' : ''}
              key={entry.slug}
              to={`/interview-report/${entry.slug}`}
            >
              {entry.label}
            </Link>
          ))}
        </nav>
        <div className="ir-topbar-actions">
          <Link className="ir-home-link" to="/">
            Home
            <span aria-hidden="true">→</span>
          </Link>
          <ToggleTheme />
        </div>
      </header>

      <div className="ir-container">
        <div className="ir-breadcrumbs">
          <Link to="/interview-report">Report overview</Link>
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
        {section ? (
          <InterviewReportDetails
            section={section}
            item={item}
            report={report}
            dimensions={dimensions}
            companyLabels={companyLabels}
            statusLabels={statusLabels}
          />
        ) : (
          <OverviewPage />
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