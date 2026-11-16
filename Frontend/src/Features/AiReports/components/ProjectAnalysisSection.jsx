import { useEffect, useState } from 'react'
import { UseAiReport } from '../hook/UseAiReport.js'
import '../styles/project-analysis.scss'

function FindingsList({ title, items, emptyLabel = 'No findings returned.' }) {
	return (
		<section className="ir-project-findings__group">
			<h4>{title}</h4>
			{items?.length ? (
				<ul>{items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}</ul>
			) : (
				<p className="ir-project-findings__empty">{emptyLabel}</p>
			)}
		</section>
	)
}

function Score({ label, value }) {
	if (typeof value !== 'number') return null

	return (
		<div className="ir-project-score">
			<span>{label}</span>
			<strong>{value}<small>/100</small></strong>
			<div className="ir-project-score__track" aria-label={`${label}: ${value} out of 100`}>
				<span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
			</div>
		</div>
	)
}

export function ProjectResult({ project }) {
	const analysis = project.analysis || project
	const github = analysis.Github
	const deployed = analysis.Deployed
	const repositories = github?.repositories || []

	return (
		<article className="ir-project-result">
			<header className="ir-project-result__header">
				<div>
					<p className="ir-project-result__eyebrow">RESUME PROJECT</p>
					<h3>{project.ProjectName}</h3>
				</div>
				<div className="ir-project-result__sources">
					{github && <span>GitHub review</span>}
					{deployed && <span>Deployment review</span>}
					{!github && !deployed && <span>Review unavailable</span>}
				</div>
			</header>

			{repositories.map((repository) => (
				<section className="ir-project-repository" key={repository.url || repository.name}>
					<div className="ir-project-repository__heading">
						<div>
							<p className="ir-project-result__eyebrow">REPOSITORY</p>
							<h4>{repository.name}</h4>
						</div>
						{repository.url && <a href={repository.url} target="_blank" rel="noreferrer">Open GitHub <span aria-hidden="true">↗</span></a>}
					</div>
					{repository.describe && <p className="ir-project-repository__description">{repository.describe}</p>}
					{repository.purpose && <p className="ir-project-repository__purpose">{repository.purpose}</p>}

					<div className="ir-project-scores">
						<Score label="Code quality" value={repository.codeQuality?.score} />
						<Score label="Performance" value={repository.efficiency?.performance} />
						<Score label="Scalability" value={repository.efficiency?.scalability} />
					</div>

					<div className="ir-project-findings">
						<FindingsList title="Architecture" items={[
							repository.architecture?.pattern,
							repository.architecture?.structure,
							...(repository.architecture?.architectureIssues || []),
						].filter(Boolean)} />
						<FindingsList title="Strengths" items={repository.codeQuality?.strengths} />
						<FindingsList title="Code quality issues" items={repository.codeQuality?.issues} />
						<FindingsList title="Performance and scalability" items={[
							...(repository.efficiency?.performanceIssues || []),
							...(repository.efficiency?.scalabilityIssues || []),
						]} />
						<FindingsList title="Security" items={repository.securityIssues} />
						<FindingsList title="Testing recommendations" items={repository.testingRecommendations} />
						<FindingsList title="Suggested improvements" items={repository.improvements} />
					</div>
				</section>
			))}

			{deployed && (
				<section className="ir-project-deployed">
					<div className="ir-project-repository__heading">
						<div>
							<p className="ir-project-result__eyebrow">LIVE DEPLOYMENT</p>
							<h4>Product experience review</h4>
						</div>
						<a href={deployed.url} target="_blank" rel="noreferrer">Visit site <span aria-hidden="true">↗</span></a>
					</div>
					<div className="ir-project-findings">
						<FindingsList title="What works well" items={deployed.uiUxReview?.strengths} />
						<FindingsList title="Experience issues" items={[
							...(deployed.uiUxReview?.issues || []),
							...(deployed.navigationIssues || []),
						]} />
						<FindingsList title="Accessibility considerations" items={deployed.accessibilityIssues} />
						<FindingsList title="Performance findings" items={deployed.performanceFindings} />
						<FindingsList title="Features observed" items={deployed.featuresTested} />
						<FindingsList title="Suggested improvements" items={deployed.improvements} />
						<FindingsList title="Evidence limitations" items={deployed.limitations} />
					</div>
				</section>
			)}

			{project.errors?.length > 0 && (
				<div className="ir-project-source-errors" role="note">
					<strong>Some sources could not be reviewed.</strong>
					{project.errors.map((error, index) => (
						<p key={`${error.source}-${index}`}>{error.source}: {error.message}</p>
					))}
				</div>
			)}
		</article>
	)
}

export default function ProjectAnalysisSection({ reportId }) {
	const { AnalysisProject, HandleGetProjectAnalysis, HandleProjectAnalysisReport } = UseAiReport()
	const [analyzing, setAnalyzing] = useState(false)
	const [hasRun, setHasRun] = useState(false)
	const [error, setError] = useState('')

	useEffect(() => {
		let active = true

		HandleGetProjectAnalysis(reportId).then((result) => {
			if (!active) return
			if (result?.success) {
				setHasRun(Boolean(result.analyzed))
			} else {
				setError(result?.message || 'Saved project analysis could not be loaded.')
			}
		})

		return () => {
			active = false
		}
	}, [HandleGetProjectAnalysis, reportId])

	const handleAnalyze = async () => {
		setAnalyzing(true)
		setError('')
		setHasRun(false)

		try {
			const result = await HandleProjectAnalysisReport(reportId)
			if (result?.success) {
				setHasRun(true)
			} else {
				setError(result?.message || 'Project analysis failed. Please try again.')
			}
		} finally {
			setAnalyzing(false)
		}
	}

	return (
		<section className="ir-project-analysis" aria-labelledby="ir-project-analysis-title">
			<header className="ir-project-analysis__intro">
				<div>
					<p className="ir-project-analysis__kicker">PORTFOLIO REVIEW</p>
					<h2 id="ir-project-analysis-title">Project analysis</h2>
					<p>Find projects and links in the uploaded resume, then review the available source code and live-site evidence.</p>
				</div>
				<button type="button" onClick={handleAnalyze} disabled={analyzing}>
					{analyzing ? 'Analyzing projects…' : hasRun ? 'Run analysis again' : 'Analyze resume projects'}
				</button>
			</header>

			{error && <p className="ir-project-analysis__error" role="alert">{error}</p>}

			{analyzing && (
				<div className="ir-project-analysis__status" role="status">
					<span className="ir-project-analysis__spinner" aria-hidden="true" />
					<div><strong>Reviewing projects</strong><p>Collecting available repository and deployment evidence.</p></div>
				</div>
			)}

			{!analyzing && hasRun && AnalysisProject?.length === 0 && (
				<div className="ir-project-analysis__empty">
					<span aria-hidden="true">↗</span>
					<h3>No project links found</h3>
					<p>The resume did not contain a project repository or deployment link to review.</p>
				</div>
			)}

			{!analyzing && hasRun && AnalysisProject?.length > 0 && (
				<>
					<div className="ir-project-analysis__summary">
						<strong>{AnalysisProject.length}</strong>
						<span>{AnalysisProject.length === 1 ? 'project reviewed' : 'projects reviewed'}</span>
					</div>
					<div className="ir-project-analysis__results">
						{AnalysisProject.map((project, index) => (
							<ProjectResult key={`${project.ProjectName}-${index}`} project={project} />
						))}
					</div>
				</>
			)}
		</section>
	)
}
