import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../components/Input'
import Button from '../components/Button'
import Toast from '../components/Toast'
import { API_BASE_URL } from '../config/api'
import { useAuth } from '../context/AuthContext'
import Logo from '../assets/logo-flat-roof.svg'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const navigate = useNavigate()
  const { setUser } = useAuth()
  
  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  // Handle email blur - validate on blur
  const handleEmailBlur = (e) => {
    const currentValue = e?.target?.value || email
    if (currentValue && !validateEmail(currentValue)) {
      setEmailError('Email is not valid.')
    } else {
      setEmailError('')
    }
  }
  
  // Handle email change - clear error when typing valid email
  const handleEmailChange = (e) => {
    const newValue = e.target.value
    setEmail(newValue)
    // Clear error if the new value is valid
    if (emailError && validateEmail(newValue)) {
      setEmailError('')
    }
    // Show error immediately if user has already seen an error and is still typing invalid
    if (emailError && newValue && !validateEmail(newValue)) {
      setEmailError('Email is not valid.')
    }
  }

  // Redirect to home if already authenticated
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      navigate('/', { replace: true })
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setShowToast(false)
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
        } else if (data.name || data.email || data.id) {
          // If user data is at the root level
          userData = {
            id: data.id || null,
            name: data.name || data.email?.split('@')[0] || 'User',
            role: data.role || 'Member',
            profilePhoto: data.profilePhoto || data.avatar || null,
          }
          localStorage.setItem('user', JSON.stringify(userData))
        } else if (data.authToken) {
          // If we have a token but no user data, create minimal user object
          // We'll need to fetch user details from /auth/me to get the ID
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
        // Handle error response - show toast
        setToastMessage('Wrong credentials. Try again or contact the office.')
        setShowToast(true)
      }
    } catch (err) {
      setToastMessage('An error occurred. Please try again.')
      setShowToast(true)
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Toast 
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={30000}
      />
      <div className="min-h-screen bg-white flex items-center justify-center relative">
        {/* Logo in top left */}
        <div className="absolute top-6 left-6">
          <img src={Logo} alt="Flat Roof" className="h-[18px] w-auto" />
        </div>
        <div className="w-[340px] flex flex-col items-center">
          <h1 
            className="font-inter text-[32px] font-medium mb-[40px]"
            style={{ 
              letterSpacing: '-0.02em',
              color: '#000000'
            }}
          >
            Welcome back
          </h1>
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col gap-[12px]">
              <Input
                label="Email address"
                type="email"
                variant="rounded"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                error={emailError}
                required
              />
              <Input
                label="Password"
                type="password"
                variant="rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="mt-[20px]">
              <Button variant="rounded" type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Continue'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default Login

