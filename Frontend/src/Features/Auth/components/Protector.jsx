import { Navigate } from "react-router-dom";
import { UseAuth } from "../hook/UseAuth";

/**
 * Route protector component that checks authentication state.
 * Displays loading indicator during session verification and redirects unauthenticated users to `/login`.
 *
 * @param {Object} props
 * @param {import('react').ReactNode} props.children - Child components to render when authenticated.
 * @returns {import('react').JSX.Element} Protected children, loading view, or redirect.
 */
const Protector = ({ children }) => {
  const { loading, user } = UseAuth()

  if (loading) {
    return <div>Loading...</div>
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default Protector