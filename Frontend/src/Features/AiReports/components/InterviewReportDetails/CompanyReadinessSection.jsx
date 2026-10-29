import { Link } from 'react-router-dom'
import { Icon } from './ReportPrimitives.jsx'

export default function CompanyReadinessSection({ report, reportPath, companyType, companyLabels, statusLabels }) {
  const companyReadiness = Array.isArray(report.companyReadiness) ? report.companyReadiness : []
  const selectedCompany = companyReadiness.find(
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
            <section><h3>Strengths</h3><ul>{(selectedCompany.strengths || []).map((entry, index) => <li key={`${entry}-${index}`}>{entry}</li>)}</ul></section>
            <section><h3>Skill gaps</h3><ul>{(selectedCompany.skillGaps || []).map((entry, index) => <li key={`${entry}-${index}`}>{entry}</li>)}</ul></section>
            <section><h3>Recommended preparation</h3><ul>{(selectedCompany.recommendedFocus || []).map((entry, index) => <li key={`${entry}-${index}`}>{entry}</li>)}</ul></section>
          </div>
        </article>
        <div className="ir-detail-pagination">
          {companyReadiness.map((company) => (
            <Link
              className={company.companyType === companyType ? 'is-current' : ''}
              key={company.companyType}
              to={`${reportPath}/companies/${company.companyType}`}
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
        {companyReadiness.map((company) => (
          <Link
            className={`ir-card ir-directory-card ir-company-card--${company.status}`}
            key={company.companyType}
            to={`${reportPath}/companies/${company.companyType}`}
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
