import { AuthProvider } from './Features/Auth/auth.context.jsx'
import { appRouter } from './routes/app.routes.jsx'
import { RouterProvider } from 'react-router-dom'
import {InterviewProvider} from './Features/AiReports/Interview.Context.jsx'
import { ThemeProvider } from './components/ToggleTheme/ToggleTheme.jsx'
import { ProcessingProvider, useProcessing } from './contexts/Processing.Context.jsx'
import GlobalProcessingOverlay from './components/GlobalProcessingOverlay.jsx'

function AppContent() {
  const { isProcessing } = useProcessing()

  return (
    <>
      <div inert={isProcessing}>
        <RouterProvider router={appRouter} />
      </div>
      <GlobalProcessingOverlay />
    </>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProcessingProvider>
          <InterviewProvider>
            <AppContent />
          </InterviewProvider>
        </ProcessingProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
