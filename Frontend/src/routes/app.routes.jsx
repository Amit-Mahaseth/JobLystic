import { createBrowserRouter } from 'react-router-dom'
import Home from '../pages/Home.jsx'
import Login from '../Features/Auth/pages/Login.jsx'
import Register from '../Features/Auth/pages/Register.jsx'
import Protector from '../Features/Auth/components/Protector.jsx'
import InterviewReport from '../Features/AiReports/pages/InterviewReport.jsx'
import AllReports from '../Features/AiReports/pages/AllReports.jsx'
import AiLibrary from '../Features/AiReports/pages/AiLibrary.jsx'
import ProcessingNavigationGuard from '../components/ProcessingNavigationGuard.jsx'

/**
 * Application browser router definition mapping public and protected routes to page components.
 */
export const appRouter = createBrowserRouter([
  {
    element: <ProcessingNavigationGuard />,
    children: [
      {
        path: '/',
        element: <Protector><Home /></Protector>,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/interviewAllreport',
        element: <Protector><AllReports /></Protector>,
      },
      {
        path: '/ai-library',
        element: <Protector><AiLibrary /></Protector>,
      },
      {
        path: '/interview-report',
        element: <Protector><InterviewReport /></Protector>,
      },
      {
        path: '/interview-report/:section',
        element: <Protector><InterviewReport /></Protector>,
      },
      {
        path: '/interview-report/:section/:item',
        element: <Protector><InterviewReport /></Protector>,
      },
      {
        path: '/interview-report/report/:reportId',
        element: <Protector><InterviewReport /></Protector>,
      },
      {
        path: '/interview-report/report/:reportId/:section',
        element: <Protector><InterviewReport /></Protector>,
      },
      {
        path: '/interview-report/report/:reportId/:section/:item',
        element: <Protector><InterviewReport /></Protector>,
      },
    ],
  },
])