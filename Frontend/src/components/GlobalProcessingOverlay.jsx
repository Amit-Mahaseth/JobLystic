import { useEffect, useRef } from 'react'
import { useProcessing } from '../contexts/Processing.Context.jsx'
import '../styles/global-processing.scss'

export default function GlobalProcessingOverlay() {
  const { operation, isProcessing } = useProcessing()
  const dialogRef = useRef(null)
  const previousFocus = useRef(null)

  useEffect(() => {
    if (!isProcessing) return undefined

    const previousBodyOverflow = document.body.style.overflow
    const previousDocumentOverflow = document.documentElement.style.overflow
    previousFocus.current = document.activeElement
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    dialogRef.current?.focus()

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousDocumentOverflow
      if (previousFocus.current instanceof HTMLElement && previousFocus.current.isConnected) {
        previousFocus.current.focus()
      }
    }
  }, [isProcessing])

  return (
    <div
      className={`global-processing${isProcessing ? ' is-active' : ''}`}
      inert={!isProcessing}
    >
      <section
        className="global-processing__card"
        ref={dialogRef}
        role={isProcessing ? 'alertdialog' : undefined}
        aria-modal={isProcessing ? 'true' : undefined}
        aria-labelledby="global-processing-title"
        aria-describedby="global-processing-detail global-processing-message"
        tabIndex={-1}
      >
        <span className="global-processing__spinner" aria-hidden="true" />
        <h2 id="global-processing-title">{operation?.title}</h2>
        <p id="global-processing-detail" className="global-processing__detail">{operation?.message}</p>
        <p id="global-processing-message" className="global-processing__message">
          Please wait while we process your request. Do not refresh or leave this page.
        </p>
        <div className="global-processing__progress" role="progressbar" aria-label="Processing" aria-valuetext="In progress">
          <span />
        </div>
      </section>
    </div>
  )
}
