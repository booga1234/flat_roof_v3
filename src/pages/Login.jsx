import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Input from '../components/Input'
import Button from '../components/Button'
import { API_BASE_URL } from '../config/api'
import { useAuth } from '../context/AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store auth token
        if (data.authToken) {
          localStorage.setItem('authToken', data.authToken)
        }
        // Store user data if available
        let userData = null
        if (data.user) {
          userData = data.user
          localStorage.setItem('user', JSON.stringify(userData))
        } else if (data.name || data.email) {
          // If user data is at the root level
          userData = {
            name: data.name || data.email?.split('@')[0] || 'User',
            role: data.role || 'Member',
            profilePhoto: data.profilePhoto || data.avatar || null,
          }
          localStorage.setItem('user', JSON.stringify(userData))
        } else if (data.authToken) {
          // If we have a token but no user data, create minimal user object
          userData = {
            name: 'User',
            role: 'Member',
            profilePhoto: null,
          }
          localStorage.setItem('user', JSON.stringify(userData))
        }
        // Update AuthContext
        if (userData) {
          setUser(userData)
        }
        // Use setTimeout to ensure state updates before navigation
        setTimeout(() => {
          navigate('/', { replace: true })
        }, 100)
      } else {
        // Handle error response
        setError(data.message || 'Login failed. Please check your credentials.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <Card className="w-fit h-fit">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Input
              label="Email"
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="mt-2 text-red-500 text-sm">
              {error}
            </div>
          )}
          <div className="mt-4">
            <Button variant="dark" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default Login

