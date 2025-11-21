import { Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config/api'

function RoleProtectedRoute({ children, allowedRoles = [] }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setLoading(false)
        return
      }

      // Try to fetch from API first to get latest role
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          const userData = {
            id: data.id,
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            email: data.email || '',
            role: data.role_name || data.role || 'Member',
            profilePhoto: data.profile_photo?.url || null,
          }
          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
          setLoading(false)
          return
        }
      } catch (err) {
        console.error('Error fetching user data from API:', err)
      }

      // Fallback to localStorage if API call fails
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          setUser(userData)
        } catch (err) {
          console.error('Error parsing user data:', err)
        }
      }
    } catch (err) {
      console.error('Error in fetchUserData:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return null // or a loading spinner
  }

  // Check if user is authenticated
  const token = localStorage.getItem('authToken')
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Normalize role to lowercase and handle spaces/underscores for comparison
  const normalizeRole = (role) => {
    if (!role) return ''
    return role.toLowerCase().replace(/\s+/g, '_')
  }

  // Check if user has required role
  const userRole = user ? normalizeRole(user.role) : ''
  const normalizedAllowedRoles = allowedRoles.map(role => normalizeRole(role))
  
  if (!user || !normalizedAllowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default RoleProtectedRoute

