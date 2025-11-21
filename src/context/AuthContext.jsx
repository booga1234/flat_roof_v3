import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// Load user from localStorage synchronously on initialization
function loadUserFromStorage() {
  const token = localStorage.getItem('authToken')
  const userData = localStorage.getItem('user')
  
  if (token && userData) {
    try {
      return JSON.parse(userData)
    } catch (error) {
      console.error('Error parsing user data:', error)
      // Clear invalid data
      localStorage.removeItem('user')
      localStorage.removeItem('authToken')
      return null
    }
  }
  
  return null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUserFromStorage)

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

