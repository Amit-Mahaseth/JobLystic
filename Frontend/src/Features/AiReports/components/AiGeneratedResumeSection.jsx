import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import '../styles/ai-generated-resume.scss'

/**
 * Section component displaying actions to generate, preview, and download an ATS-tailored AI resume PDF.
 *
 * @param {Object} props
 * @param {string} props.reportId - Identifier of the target interview report.
 * @param {function(string, string): Promise<{ success: boolean, pdfBlob?: Blob, message?: string }>} props.onGenerate - Handler to compile PDF resume.
 * @returns {import('react').JSX.Element}
 */
export default function AiGeneratedResumeSection({ reportId, onGenerate, theme = 'light', variant = 'default' }) {
  const [companyName, setCompanyName] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')


  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleGenerate = async () => {
    const trimmedCompanyName = companyName.trim()
    if (!trimmedCompanyName) {
      setError('Enter a company name to tailor your resume.')
      return
    }

    setGenerating(true)
    setError('')
    setPreviewUrl('')
    setIsPreviewOpen(false)

    try {
      const result = await onGenerate(reportId, trimmedCompanyName)
      if (!result?.success || !(result.pdfBlob instanceof Blob) || result.pdfBlob.size === 0) {
        setError(result?.message || 'We could not generate your resume. Please try again.')
        return
      }

      setPreviewUrl(URL.createObjectURL(result.pdfBlob))
    } catch (generationError) {
      console.error('Failed to generate resume PDF:', generationError)
      setError('We could not generate your resume. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <section className={`ir-ai-resume-section ir-ai-resume-section--${variant}`} aria-labelledby="ai-resume-heading">
      <div className="ir-ai-resume-heading">
        <div>
          <p className="ir-report-kicker">PERSONALIZED DOCUMENT</p>
          <h2 id="ai-resume-heading">AI-generated resume</h2>
          <p>Create a polished, ATS-friendly resume tailored to your target role.</p>
        </div>
        <label className="ir-ai-resume-company">
          <span>Company name</span>
          <input
            type="text"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            maxLength={120}
            required
            placeholder="Enter the company you are applying to"
          />
        </label>
        <button
          className="ir-ai-resume-generate"
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          aria-busy={generating}
        >
          {generating ? 'Generating your resume...' : previewUrl ? 'Regenerate resume' : 'Generate AI Resume'}
        </button>
      </div>

      {error && <p className="ir-ai-resume-error" role="alert">{error}</p>}

      {previewUrl && (
        <section className="ir-ai-resume-ready" aria-label="Generated resume">
          <span className="ir-ai-resume-ready__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
              <path d="M14 2v6h6M8 13h8m-8 4h5" />
              <path d="m15 17 2 2 4-4" />
            </svg>
          </span>
          <div className="ir-ai-resume-ready__copy">
            <span>PDF READY</span>
            <h3>Your tailored resume is ready</h3>
            <p>Prepared for {companyName.trim()}</p>
          </div>
          <div className="ir-ai-resume-ready__actions">
            <button type="button" onClick={() => setIsPreviewOpen(true)}>
              Preview resume
            </button>
            <a href={previewUrl} download={`AI-Resume-${reportId}.pdf`}>
              Download PDF <span aria-hidden="true">↓</span>
            </a>
          </div>
        </section>
      )}

      {!previewUrl && (
        <div className={`ir-ai-resume-empty${generating ? ' is-generating' : ''}`} role={generating ? 'status' : undefined}>
          <span className="ir-ai-resume-empty__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
              <path d="M14 2v6h6M8 13h8m-8 4h8" />
            </svg>
          </span>
          <h3>{generating ? 'Building your tailored resume' : 'Your tailored resume starts here'}</h3>
          <p>
            {generating
              ? 'This can take a moment while we prepare your ATS-friendly PDF.'
              : 'Generate a PDF using the experience and target role from this interview report.'}
          </p>
        </div>
      )}
      {isPreviewOpen && previewUrl && createPortal(
        <div
          className="ir-ai-resume-preview-backdrop"
          data-theme={theme}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsPreviewOpen(false)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setIsPreviewOpen(false)
          }}
        >
          <section
            className="ir-ai-resume-preview-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ir-ai-resume-preview-title"
          >
            <header className="ir-ai-resume-preview-dialog__header">
              <div>
                <span>RESUME PREVIEW</span>
                <h2 id="ir-ai-resume-preview-title">{companyName.trim()} tailored resume</h2>
                <p>Review your PDF before downloading.</p>
              </div>
              <div className="ir-ai-resume-preview-dialog__actions">
                <a href={previewUrl} target="_blank" rel="noreferrer">Open in new tab <span aria-hidden="true">↗</span></a>
                <a href={previewUrl} download={`AI-Resume-${reportId}.pdf`}>Download PDF <span aria-hidden="true">↓</span></a>
                <button type="button" onClick={() => setIsPreviewOpen(false)} autoFocus aria-label="Close preview">×</button>
              </div>
            </header>
            <div className="ir-ai-resume-preview">
              <iframe title="Generated AI resume PDF preview" src={previewUrl} />
            </div>
          </section>
        </div>,
        document.body,
      )}
    </section>
  )
}