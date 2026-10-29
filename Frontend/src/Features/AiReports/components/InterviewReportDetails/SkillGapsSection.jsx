import { Link } from 'react-router-dom'

export default function SkillGapsSection({ report, skillName }) {
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
