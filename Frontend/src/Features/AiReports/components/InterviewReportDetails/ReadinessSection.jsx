import { Icon, SectionHeading } from './ReportPrimitives.jsx'

export default function ReadinessSection({ report, dimensions }) {
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
