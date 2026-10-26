
import { createBrowserRouter } from 'react-router-dom'
import Home from '../pages/Home.jsx'
import Login from '../Features/Auth/pages/Login.jsx'
import Register from '../Features/Auth/pages/Register.jsx'
import Protector from '../Features/Auth/components/Protector.jsx'
import InterviewReport from '../Features/AiReports/pages/InterviewReport.jsx'
export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <Protector><Home/></Protector>,
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
])