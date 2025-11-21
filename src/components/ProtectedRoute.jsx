import { Navigate, Outlet } from 'react-router-dom'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('authToken')
  
  // Check token first (primary authentication check)
  // If token exists, allow access even if user context hasn't updated yet
  // This handles the case where login just happened and context is updating
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  // If we have a token, allow access (user context will catch up)
  // This prevents the redirect loop after login
  return children || <Outlet />
}

export default ProtectedRoute
