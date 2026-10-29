import CompanyReadinessSection from './InterviewReportDetails/CompanyReadinessSection.jsx'
import PreparationSection from './InterviewReportDetails/PreparationSection.jsx'
import QuestionSection from './InterviewReportDetails/QuestionSection.jsx'
import ReadinessSection from './InterviewReportDetails/ReadinessSection.jsx'
import SkillGapsSection from './InterviewReportDetails/SkillGapsSection.jsx'

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
