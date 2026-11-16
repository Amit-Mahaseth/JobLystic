import CompanyReadinessSection from './InterviewReportDetails/CompanyReadinessSection.jsx'
import PreparationSection from './InterviewReportDetails/PreparationSection.jsx'
import QuestionSection from './InterviewReportDetails/QuestionSection.jsx'
import ReadinessSection from './InterviewReportDetails/ReadinessSection.jsx'
import SkillGapsSection from './InterviewReportDetails/SkillGapsSection.jsx'

/**
 * Dynamic dispatcher component rendering specific report sub-views based on active route section.
 *
 * @param {Object} props
 * @param {string} props.section - Active section slug (e.g. 'readiness', 'companies', 'skills', 'roadmap', 'technical', 'behavioral').
 * @param {string} [props.item] - Optional sub-item identifier (e.g. company type or skill name).
 * @param {Object} props.report - Complete interview report dataset.
 * @param {string} props.reportPath - Base URL path for current report navigation.
 * @param {Array<Object>} [props.dimensions] - Dimensional readiness configuration array.
 * @param {Object} [props.companyLabels] - Display labels mapping for company categories.
 * @param {Object} [props.statusLabels] - Display labels mapping for readiness statuses.
 * @returns {import('react').JSX.Element} The rendered section sub-component or empty state.
 */
export default function InterviewReportDetails({
  section,
  item,
  report,
  reportPath,
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
          <p>The overall score and dimension breakdown reflect the resume and role details used for this assessment.</p>
          <p>Assessment coverage indicates how much of the available evidence is represented in the analysis.</p>
        </div>
      </>
    )
  }

  if (section === 'companies') {
    return (
      <CompanyReadinessSection
        report={report}
        reportPath={reportPath}
        companyType={item}
        companyLabels={companyLabels}
        statusLabels={statusLabels}
      />
    )
  }

  if (section === 'skills') {
    return <SkillGapsSection report={report} skillName={item} reportPath={reportPath} />
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
