import { SectionHeading } from './ReportPrimitives.jsx'

export default function QuestionSection({ title, eyebrow, icon, questions, kind }) {
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
