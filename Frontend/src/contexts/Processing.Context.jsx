import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ProcessingContext = createContext(null)

export function ProcessingProvider({ children }) {
  const activeToken = useRef(null)
  const [operation, setOperation] = useState(null)

  const startProcessing = useCallback((title, message) => {
    if (activeToken.current) return null

    const token = Symbol('processing-operation')
    activeToken.current = token
    setOperation({ token, title, message })
    return token
  }, [])

  const hasActiveOperation = useCallback(() => activeToken.current !== null, [])

  const stopProcessing = useCallback((token) => {
    if (!token || activeToken.current !== token) return

    activeToken.current = null
    setOperation(null)
  }, [])

  const runWithProcessing = useCallback(async (title, message, task) => {
    const token = startProcessing(title, message)
    if (!token) return null

    try {
      return await task()
    } finally {
      stopProcessing(token)
    }
  }, [startProcessing, stopProcessing])

  return (
    <ProcessingContext.Provider value={{
      operation,
      isProcessing: Boolean(operation),
      hasActiveOperation,
      startProcessing,
      stopProcessing,
      runWithProcessing,
    }}>
      {children}
    </ProcessingContext.Provider>
  )
}

// Exporting the provider and its matching hook together is intentional for this context module.
// eslint-disable-next-line react-refresh/only-export-components
export function useProcessing() {
  const context = useContext(ProcessingContext)
  if (!context) {
    throw new Error('useProcessing must be used within a ProcessingProvider')
  }
  return context
}
