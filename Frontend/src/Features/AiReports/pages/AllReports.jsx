import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ToggleTheme from '../../../components/ToggleTheme/ToggleTheme.jsx'
import { useTheme } from '../../../contexts/themeContext.js'
import { UseAiReport } from '../hook/UseAiReport.js'
import '../styles/interview.report.scss'
import '../styles/all-reports.scss'

const formatReportDate = (date) => {
  if (!date) return 'Date unavailable'

  const parsedDate = new Date(date)
  return Number.isNaN(parsedDate.getTime())
    ? 'Date unavailable'
    : parsedDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function AllReports() {
  const { theme } = useTheme()
  const { reports, loading, HandleGetAllReports } = UseAiReport()
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState('')
  const reportItems = reports || []

  useEffect(() => {
    let active = true

    const loadReports = async () => {
      const result = await HandleGetAllReports()
      if (active) {
        setError(result?.success ? '' : result?.message || 'Unable to load reports.')
        setHasLoaded(true)
      }
    }

    loadReports()
    return () => {
      active = false
    }
  }, [HandleGetAllReports])

  return (
    <main className="ir-page" data-theme={theme}>
      <header className="ir-topbar">
        <Link className="ir-brand" to="/" aria-label="JobAnalytics home">JobAnalytics</Link>
        <div className="ir-topbar-actions">
          <Link className="ir-home-link" to="/">Home <span aria-hidden="true">→</span></Link>
          <ToggleTheme />
        </div>
      </header>

      <div className="ir-container">
        <section className="ir-report-header ir-report-header--compact">
          <div>
            <p className="ir-report-kicker">REPORT LIBRARY</p>
            <h1>All interview reports</h1>
            <p className="ir-report-subtitle">{reportItems.length} saved {reportItems.length === 1 ? 'report' : 'reports'}</p>
          </div>
        </section>

        {error && <p className="ir-empty-state" role="alert">{error}</p>}
        {(loading || !hasLoaded) && <p className="ir-empty-state" role="status">Loading reports...</p>}

        {hasLoaded && !loading && !error && reportItems.length === 0 && (
          <section className="ir-empty-state">
            <h2>No reports yet</h2>
            <p>Generate an interview report and it will appear here.</p>
            <Link className="ir-text-link" to="/">Create a report <span aria-hidden="true">→</span></Link>
          </section>
        )}

        {!error && reportItems.length > 0 && (
          <div className="ir-all-reports-list" aria-label="Saved interview reports">
            {reportItems.map((report) => (
              <Link
                className="ir-report-list-row"
                key={report._id}
                to={`/interview-report/report/${report._id}`}
                aria-label={`Open report ${report._id}`}
              >
                <span className="ir-report-list-main">
                  <strong>{report.jobDescription || 'Interview report'}</strong>
                  <small>ID {report._id.slice(-8)}</small>
                </span>
                <span className="ir-report-list-date">{formatReportDate(report.createdAt)}</span>
                <span className="ir-report-list-score">
                  <strong>{report.readiness?.OverallScore ?? '—'}</strong>
                  <small>readiness</small>
                </span>
                <span className="ir-report-list-arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}