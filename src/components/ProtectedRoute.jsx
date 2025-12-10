import { Navigate, Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config/api'

function ProtectedRoute({ children }) {
  const [isValidating, setIsValidating] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const token = localStorage.getItem('authToken')
  
  useEffect(() => {
    validateToken()
  }, [])

  const validateToken = async () => {
    // If no token exists, mark as invalid immediately
    if (!token) {
      setIsValid(false)
      setIsValidating(false)
      return
    }

    // Validate token by calling auth/me
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Token is valid
        setIsValid(true)
      } else {
        // Token is invalid (401, 403, etc.)
        console.warn('Token validation failed:', response.status)
        setIsValid(false)
        // Clear invalid token and user data
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      }
    } catch (error) {
      console.error('Error validating token:', error)
      // On network error, assume token is still valid to allow offline use
      // You can change this to setIsValid(false) if you want strict validation
      setIsValid(true)
    } finally {
      setIsValidating(false)
    }
  }

  // Show nothing while validating (or you could show a loading spinner)
  if (isValidating) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        backgroundColor: '#F3F3F3'
      }}>
        {/* Optional: Add a loading spinner here */}
      </div>
    )
  }
  
  // If token is invalid, redirect to login
  if (!isValid) {
    return <Navigate to="/login" replace />
  }
  
  // Token is valid, render protected content
  return children || <Outlet />
}

export default ProtectedRoute
