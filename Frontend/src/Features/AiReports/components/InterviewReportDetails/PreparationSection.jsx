import { useState } from 'react'
import { Icon, SectionHeading } from './ReportPrimitives.jsx'

export default function PreparationSection({ report }) {
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
