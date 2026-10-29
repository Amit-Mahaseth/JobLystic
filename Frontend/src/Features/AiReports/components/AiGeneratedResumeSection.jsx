import { useEffect, useState } from 'react'
import '../styles/ai-generated-resume.scss'

export default function AiGeneratedResumeSection({ reportId, onGenerate }) {
  const [previewUrl, setPreviewUrl] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleGenerate = async () => {
    setGenerating(true)
    setError('')
    setPreviewUrl('')

    try {
      const result = await onGenerate(reportId)
      if (result?.success) {
        setPreviewUrl(URL.createObjectURL(result.pdfBlob))
      } else {
        setError(result?.message || 'Resume generate nahi ho paya. Dobara try karein.')
      }
    } catch {
      setError('Resume generate nahi ho paya. Dobara try karein.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <section className="ir-ai-resume-section" aria-labelledby="ai-resume-heading">
      <div className="ir-ai-resume-heading">
        <div>
          <p className="ir-report-kicker">PERSONALIZED DOCUMENT</p>
          <h2 id="ai-resume-heading">AI-generated resume</h2>
          <p>Apne interview report ke data se tailored resume PDF banayein.</p>
        </div>
        <button
          className="ir-ai-resume-generate"
          type="button"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? 'Generating...' : 'Generate AI Resume'}
        </button>
      </div>

      {error && <p className="ir-ai-resume-error" role="alert">{error}</p>}

      {previewUrl && (
        <>
          <div className="ir-ai-resume-actions">
            <a href={previewUrl} target="_blank" rel="noreferrer">View PDF in new tab</a>
            <a href={previewUrl} download={`AI-Resume-${reportId}.pdf`}>Download PDF</a>
          </div>
          <div className="ir-ai-resume-preview">
            <iframe title="Generated AI resume PDF preview" src={previewUrl} />
          </div>
        </>
      )}
    </section>
  )
}