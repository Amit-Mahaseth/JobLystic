import { useState } from 'react'
import { Link } from 'react-router-dom'

function Icon({ name, size = 18 }) {
  const paths = {
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
    building: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1M10 21v-3h4v3" /></>,
    chart: <><path d="M4 19V5m0 14h17" /><path d="m7 15 4-4 3 2 5-6" /></>,
    route: <><circle cx="6" cy="5" r="2" /><circle cx="18" cy="19" r="2" /><path d="M6 7v3a3 3 0 0 0 3 3h6a3 3 0 0 1 3 3v1" /></>,
    code: <><path d="m8 8-4 4 4 4m8-8 4 4-4 4m-3-11-2 14" /></>,
    chat: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    chevron: <><path d="m7 10 5 5 5-5" /></>,
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

function SectionHeading({ eyebrow, title, description, icon }) {
  return (
    <div className="ir-section-heading">
      <span className="ir-section-icon"><Icon name={icon} /></span>
      <div>
        <p className="ir-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        {description && <p className="ir-section-description">{description}</p>}
      </div>
    </div>
  )
}

function ReadinessSection({ report, dimensions }) {
  const readiness = report.readiness

  return (
    <section className="ir-section" aria-label="Overall readiness">
      <SectionHeading
        eyebrow="YOUR STARTING POINT"
        title="Overall readiness"
        description="A snapshot of your current alignment and the areas worth focusing on next."
        icon="target"
      />
      <div className="ir-readiness-layout">
        <article className="ir-card ir-score-card">
          <div
            className="ir-score-ring"
            role="img"
            aria-label={`Overall readiness score ${readiness.OverallScore} out of 100`}
            style={{ '--score': `${readiness.OverallScore}%` }}
          >
            <div className="ir-score-ring__inner">
              <strong>{readiness.OverallScore}</strong>
              <span>out of 100</span>
            </div>
          </div>
          <span className="ir-level-badge">{readiness.levels}</span>
          <h3 id="readiness-title">Steady momentum</h3>
          <p className="ir-score-summary">{readiness.explanation}</p>
          <div className="ir-coverage">
            <div className="ir-coverage__label">
              <span>Assessment coverage</span>
              <strong>{readiness.assessmentCoverage}%</strong>
            </div>
            <div className="ir-meter"><span style={{ width: `${readiness.assessmentCoverage}%` }} /></div>
          </div>
          <p className="ir-illustrative-note">Illustrative sample report</p>
        </article>

        <article className="ir-card ir-dimensions-card">
          <div className="ir-card-heading">
            <div>
              <h3>Readiness dimensions</h3>
              <p>Dimension scores are shown as a visual breakdown.</p>
            </div>
            <span className="ir-small-icon"><Icon name="chart" /></span>
          </div>
          <div className="ir-dimensions">
            {dimensions.map((dimension) => (
              <div className="ir-dimension" key={dimension.name}>
                <div className="ir-dimension__top">
                  <strong>{dimension.name}</strong>
                  <span><b>{dimension.score}</b><i>/100</i></span>
                </div>
                <div className="ir-meter"><span style={{ width: `${dimension.score}%` }} /></div>
                <div className="ir-dimension__meta">
                  <span>Weight {dimension.weight}%</span>
                  <span>{dimension.explanation}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="ir-card ir-highlights-card">
          <div className="ir-highlight-column">
            <h3><span className="ir-dot ir-dot--strength" />Strengths</h3>
            <ul>
              {readiness.strengths.map((strength) => (
                <li key={strength}><Icon name="check" size={15} />{strength}</li>
              ))}
            </ul>
          </div>
          <div className="ir-highlight-column ir-highlight-column--priority">
            <h3><span className="ir-dot ir-dot--priority" />Priority areas</h3>
            <ul>
              {readiness.priorityAreas.map((area) => (
                <li key={area}><span className="ir-priority-mark" aria-hidden="true" />{area}</li>
              ))}
            </ul>
          </div>
        </article>
      </div>
    </section>
  )
}

function CompanyReadinessSection({ report, companyType, companyLabels, statusLabels }) {
  const selectedCompany = report.companyReadiness.find(
    (company) => company.companyType === companyType,
  )

  if (companyType) {
    if (!selectedCompany) {
      return <p className="ir-empty-state">That company type is not included in this sample report.</p>
    }

    return (
      <section className="ir-detail-content">
        <article className="ir-card ir-company-detail-page">
          <div className="ir-company-detail-page__header">
            <div>
              <span className={`ir-status ir-status--${selectedCompany.status}`}>{statusLabels[selectedCompany.status]}</span>
              <h2>{companyLabels[selectedCompany.companyType]}</h2>
              <p>{selectedCompany.explanation}</p>
            </div>
            <div className="ir-company-detail-page__score">
              <strong>{selectedCompany.readinessScore}<small>/100</small></strong>
              <span>Illustrative readiness</span>
            </div>
          </div>
          <div className="ir-company-detail-page__coverage">
            <div className="ir-coverage__label"><span>Assessment coverage</span><strong>{selectedCompany.assessmentCoverage}%</strong></div>
            <div className="ir-meter"><span style={{ width: `${selectedCompany.assessmentCoverage}%` }} /></div>
          </div>
          <div className="ir-company-evidence">
            <section><h3>Evidence</h3><ul>{selectedCompany.evidence.map((entry) => <li key={entry}>{entry}</li>)}</ul></section>
            <section><h3>Strengths</h3><ul>{selectedCompany.strengths.map((entry) => <li key={entry}>{entry}</li>)}</ul></section>
            <section><h3>Skill gaps</h3><ul>{selectedCompany.skillGaps.map((entry) => <li key={entry}>{entry}</li>)}</ul></section>
            <section><h3>Recommended preparation</h3><ul>{selectedCompany.recommendedFocus.map((entry) => <li key={entry}>{entry}</li>)}</ul></section>
          </div>
        </article>
        <div className="ir-detail-pagination">
          {report.companyReadiness.map((company) => (
            <Link
              className={company.companyType === companyType ? 'is-current' : ''}
              key={company.companyType}
              to={`/interview-report/companies/${company.companyType}`}
            >
              {companyLabels[company.companyType]}
            </Link>
          ))}
        </div>
        <p className="ir-disclaimer">This illustrative score is a preparation guide only and does not guarantee hiring or selection.</p>
      </section>
    )
  }

  return (
    <section className="ir-detail-content" aria-label="Readiness by company type">
      <p className="ir-detail-intro">Choose a company environment to review the sample readiness assessment, evidence, and preparation focus.</p>
      <div className="ir-company-directory">
        {report.companyReadiness.map((company) => (
          <Link
            className={`ir-card ir-directory-card ir-company-card--${company.status}`}
            key={company.companyType}
            to={`/interview-report/companies/${company.companyType}`}
          >
            <span className="ir-company-icon"><Icon name="building" size={17} /></span>
            <span className="ir-directory-card__body">
              <strong>{companyLabels[company.companyType]}</strong>
              <small>{company.explanation}</small>
            </span>
            <span className="ir-directory-card__score">{company.readinessScore}<small>/100</small></span>
            <span className="ir-directory-card__arrow" aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
      <p className="ir-disclaimer">All displayed company readiness data is illustrative mock content.</p>
    </section>
  )
}

function SkillGapsSection({ report, skillName }) {
  const skill = report.skillGaps.find(
    (gap) => gap.skill.toLowerCase() === (skillName || '').toLowerCase(),
  )

  if (skillName) {
    if (!skill) {
      return <p className="ir-empty-state">That skill is not included in this sample report.</p>
    }

    return (
      <section className="ir-detail-content">
        <article className={`ir-card ir-skill-detail-page ir-skill-card--${skill.severity}`}>
          <div className="ir-skill-detail-page__header">
            <div>
              <div className="ir-skill-title-row">
                <h2>{skill.skill}</h2>
                <span className={`ir-severity ir-severity--${skill.severity}`}>{skill.severity} priority</span>
              </div>
              <p>{skill.reason}</p>
            </div>
            <div className="ir-skill-score"><strong>{skill.currentLevel}<span>/100</span></strong><small>current level</small></div>
          </div>
          <div className="ir-skill-comparison">
            <div className="ir-skill-comparison__labels"><span>Current <b>{skill.currentLevel}</b></span><span>Target <b>{skill.requiredLevel}</b></span></div>
            <div className="ir-comparison-track">
              <span className="ir-comparison-current" style={{ width: `${skill.currentLevel}%` }} />
              <i className="ir-comparison-target" style={{ left: `${skill.requiredLevel}%` }} />
            </div>
          </div>
          <div className="ir-skill-detail-sections">
            <section><h3>Supporting evidence</h3><ul>{skill.evidence.map((entry) => <li key={entry}>{entry}</li>)}</ul></section>
            <section><h3>Concepts to revisit</h3><ul>{skill.missingConcepts.map((entry) => <li key={entry}>{entry}</li>)}</ul></section>
            <section><h3>Recommended actions</h3><ul>{skill.recommendedActions.map((entry) => <li key={entry}>{entry}</li>)}</ul></section>
          </div>
          <div className="ir-skill-footer"><span>Importance <b>{skill.importance}/5</b></span><span>Confidence <b>{Math.round(skill.confidence * 100)}%</b></span></div>
        </article>
        <div className="ir-detail-pagination">
          {report.skillGaps.map((gap) => (
            <Link
              className={gap.skill === skill.skill ? 'is-current' : ''}
              key={gap.skill}
              to={`/interview-report/skills/${encodeURIComponent(gap.skill)}`}
            >
              {gap.skill}
            </Link>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="ir-detail-content" aria-label="Skill gap analysis">
      <p className="ir-detail-intro">Select a skill to see its evidence, current-to-target comparison, and a focused practice plan.</p>
      <div className="ir-skill-directory">
        {report.skillGaps.map((gap) => (
          <Link className="ir-card ir-directory-card" key={gap.skill} to={`/interview-report/skills/${encodeURIComponent(gap.skill)}`}>
            <span className={`ir-severity-dot ir-severity-dot--${gap.severity}`} />
            <span className="ir-directory-card__body">
              <strong>{gap.skill}</strong>
              <small>{gap.reason}</small>
            </span>
            <span className="ir-directory-card__score">{gap.currentLevel}<small>/100</small></span>
            <span className="ir-directory-card__arrow" aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function PreparationSection({ report }) {
  const [taskStatuses, setTaskStatuses] = useState(() => (
    Object.fromEntries(report.roadmap.map((task) => [task.title, 'in-progress']))
  ))
  const completedTasks = Object.values(taskStatuses).filter((status) => status === 'completed').length
  const completion = Math.round((completedTasks / report.roadmap.length) * 100)
  const taskIcons = {
    learn: 'code',
    practice: 'route',
    project: 'chart',
    assessment: 'check',
  }

  return (
    <section className="ir-section ir-preparation-detail" aria-label="Preparation roadmap">
      <SectionHeading
        eyebrow="MAKE YOUR NEXT MOVE"
        title="Preparation roadmap"
        description="A practical sequence of learning, practice, project work, and reflection."
        icon="route"
      />
      <div className="ir-roadmap-layout">
        <article className="ir-card ir-roadmap-card">
          <div className="ir-roadmap-panel-heading">
            <span className="ir-roadmap-panel-icon"><Icon name="target" /></span>
            <div className="ir-roadmap-panel-title">
              <h3>Recommended tasks</h3>
              <p>Suggested steps to build confidence and depth.</p>
            </div>
            <div className="ir-roadmap-progress">
              <div className="ir-roadmap-progress__labels">
                <span>{completedTasks} of {report.roadmap.length} completed</span>
                <strong>{completion}%</strong>
              </div>
              <div
                className="ir-roadmap-progress__track"
                role="progressbar"
                aria-label="Preparation task completion"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={completion}
              >
                <span style={{ width: `${completion}%` }} />
              </div>
            </div>
          </div>
          <div className="ir-timeline">
            {report.roadmap.map((task) => (
              <div className={`ir-timeline-item ir-timeline-item--${taskStatuses[task.title]}`} key={task.title}>
                <span className={`ir-roadmap-task-icon ir-roadmap-task-icon--${taskStatuses[task.title]}`}>
                  <Icon name={taskIcons[task.type] || 'check'} size={18} />
                </span>
                <div className="ir-timeline-content">
                  <h4>{task.title}</h4>
                  <p>{task.description}</p>
                </div>
                <span className="ir-task-duration"><Icon name="clock" size={15} />{task.estimatedMinutes} min</span>
                <label className={`ir-roadmap-status ir-roadmap-status--${taskStatuses[task.title]}`}>
                  <i aria-hidden="true" />
                  <select
                    aria-label={`Status for ${task.title}`}
                    value={taskStatuses[task.title]}
                    onChange={(event) => {
                      const { value } = event.target
                      setTaskStatuses((currentStatuses) => ({
                        ...currentStatuses,
                        [task.title]: value,
                      }))
                    }}
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In progress</option>
                  </select>
                  <Icon name="chevron" size={14} />
                </label>
              </div>
            ))}
          </div>
        </article>

        <article className="ir-card ir-study-card">
          <div className="ir-roadmap-panel-heading ir-study-panel-heading">
            <span className="ir-roadmap-panel-icon"><Icon name="calendar" /></span>
            <div className="ir-roadmap-panel-title">
              <h3>Four-day study plan</h3>
              <p>Short, focused sessions to keep momentum.</p>
            </div>
          </div>
          <div className="ir-study-timeline">
            {report.preparationIdeas.map((idea) => (
              <div className="ir-study-day" key={idea.day}>
                <div className="ir-study-day__label">
                  <span>Day {idea.day}</span>
                  <strong>{idea.focus}</strong>
                </div>
                <div className="ir-study-day__content">
                  <div className="ir-study-day__meta"><span>{idea.skill}</span></div>
                  <ul>{idea.tasks.map((task) => <li key={task}><span aria-hidden="true" />{task}</li>)}</ul>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

function QuestionSection({ title, eyebrow, icon, questions, kind }) {
  return (
    <section className="ir-section" aria-label={title}>
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={kind === 'technical'
          ? 'Practice explaining your approach, trade-offs, and reasoning.'
          : 'Use these prompts to prepare concise, specific examples.'}
        icon={icon}
      />
      <div className="ir-question-grid ir-question-grid--detail">
        {questions.map((item, index) => (
          <article className="ir-card ir-question-card" key={item.question}>
            <div className="ir-question-card__top">
              <span className="ir-question-number">QUESTION 0{index + 1}</span>
              <span className={`ir-question-kind ir-question-kind--${kind}`}>
                {kind === 'technical' ? 'Technical' : 'Behavioral'}
              </span>
            </div>
            <h3>{item.question}</h3>
            <div className="ir-intention">
              <span>What this explores</span>
              <p>{item.intention}</p>
            </div>
            <div className="ir-sample-answer">
              <span>Sample answer</span>
              <p>{item.answer}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default function InterviewReportDetails({
  section,
  item,
  report,
  dimensions,
  companyLabels,
  statusLabels,
}) {
  if (section === 'readiness') {
    return (
      <>
        <ReadinessSection report={report} dimensions={dimensions} />
        <div className="ir-card ir-methodology">
          <h3>How to read this section</h3>
          <p>The overall score is shown on a 0-100 scale. The dimension breakdowns use illustrative scores and weights to explain the schema fields; they are not actual assessment outcomes.</p>
          <p>Assessment coverage describes the portion of the sample report represented in this view.</p>
        </div>
      </>
    )
  }

  if (section === 'companies') {
    return (
      <CompanyReadinessSection
        report={report}
        companyType={item}
        companyLabels={companyLabels}
        statusLabels={statusLabels}
      />
    )
  }

  if (section === 'skills') {
    return <SkillGapsSection report={report} skillName={item} />
  }

  if (section === 'roadmap') {
    return <PreparationSection report={report} />
  }

  if (section === 'technical' || section === 'behavioral') {
    const isTechnical = section === 'technical'
    return (
      <QuestionSection
        title={isTechnical ? 'Technical interview questions' : 'Behavioral interview questions'}
        eyebrow={isTechnical ? 'PRACTICE YOUR THINKING' : 'TELL YOUR STORY'}
        icon={isTechnical ? 'code' : 'chat'}
        questions={isTechnical ? report.technicalQuestions : report.behavioralQuestions}
        kind={section}
      />
    )
  }

  return <p className="ir-empty-state">This report section could not be found.</p>
}
