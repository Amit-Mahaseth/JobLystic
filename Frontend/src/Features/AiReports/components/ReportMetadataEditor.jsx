import { useState } from 'react'

export default function ReportMetadataEditor({ report, onClose, onSave }) {
  const [values, setValues] = useState({
    reportTitle: report.reportTitle || '',
    targetRole: report.targetRole || '',
    resumeTitle: report.resumeTitle || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const updateValue = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    const result = await onSave(Object.fromEntries(
      Object.entries(values).map(([field, value]) => [field, value.trim()]),
    ))

    if (result?.success) {
      onClose()
    } else {
      setError(result?.message || 'Could not save report details.')
    }
    setSaving(false)
  }

  return (
    <div
      className="ir-metadata-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && !saving) onClose()
      }}
    >
      <section
        className="ir-metadata-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ir-metadata-dialog-title"
      >
        <header className="ir-metadata-dialog__header">
          <div>
            <p className="ir-report-kicker">AI-GENERATED DETAILS</p>
            <h2 id="ir-metadata-dialog-title">Edit report details</h2>
            <p>Update the titles and role used across this report.</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close dialog">×</button>
        </header>

        <form onSubmit={handleSubmit}>
          <label>
            <span>Report title</span>
            <input name="reportTitle" value={values.reportTitle} onChange={updateValue} required maxLength={120} />
          </label>
          <label>
            <span>Target role</span>
            <input name="targetRole" value={values.targetRole} onChange={updateValue} required maxLength={120} />
          </label>
          <label>
            <span>Resume title</span>
            <input name="resumeTitle" value={values.resumeTitle} onChange={updateValue} required maxLength={120} />
          </label>
          {error && <p className="ir-metadata-dialog__error" role="alert">{error}</p>}
          <div className="ir-metadata-dialog__actions">
            <button type="button" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save details'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}