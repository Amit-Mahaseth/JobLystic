import { useCallback, useEffect } from 'react'
import { Outlet, useBlocker } from 'react-router-dom'
import { useProcessing } from '../contexts/Processing.Context.jsx'

export default function ProcessingNavigationGuard() {
  const { isProcessing, hasActiveOperation } = useProcessing()
  const shouldBlockNavigation = useCallback(
    () => hasActiveOperation(),
    [hasActiveOperation],
  )
  const blocker = useBlocker(shouldBlockNavigation)

  useEffect(() => {
    if (blocker.state === 'blocked') {
      blocker.reset()
    }
  }, [blocker])

  useEffect(() => {
    if (!isProcessing) return undefined

    const warnBeforeLeave = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', warnBeforeLeave)
    return () => window.removeEventListener('beforeunload', warnBeforeLeave)
  }, [isProcessing])

  return <Outlet />
}
