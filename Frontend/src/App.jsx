import { AuthProvider } from './Features/Auth/auth.context.jsx'
import { appRouter } from './routes/app.routes.jsx'
import { RouterProvider } from 'react-router-dom'
import {InterviewProvider} from './Features/AiReports/Interview.Context.jsx'
import { ThemeProvider } from './components/ToggleTheme/ToggleTheme.jsx'
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InterviewProvider>
          <RouterProvider router={appRouter} />
        </InterviewProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
