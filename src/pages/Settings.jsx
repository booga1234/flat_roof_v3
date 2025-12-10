import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect, useCallback } from 'react'
import NewPage from '../components/NewPage'
import PageContent from '../components/PageContent'
import Input from '../components/Input'
import Select from '../components/Select'
import Button from '../components/Button'
import Toast from '../components/Toast'
import SearchInput from '../components/SearchInput'
import ResultCard from '../components/ResultCard'
import Trash from './Trash'
import { userAPI, locationsAPI } from '../utils/apiService'
import { API_BASE_URL, API_CONTACTS_BASE_URL } from '../config/api'
import { Plus } from 'lucide-react'

// Profile Settings Component
function ProfileSettings() {
  const { user, setUser } = useAuth()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  })
  const [userId, setUserId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // Toast state
  const [toast, setToast] = useState({ isVisible: false, message: '', variant: 'success' })

  const showToast = useCallback((message, variant = 'success', duration = 5000) => {
    setToast({ isVisible: true, message, variant, duration })
  }, [])

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }, [])

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        // First, get the user ID from auth/me endpoint
        const authResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!authResponse.ok) {
          throw new Error('Failed to authenticate')
        }

        const authData = await authResponse.json()
        const currentUserId = authData.id
        setUserId(currentUserId)

        if (!currentUserId) {
          throw new Error('No user ID in auth response')
        }

        // Now fetch the full user profile using the user endpoint
        const userData = await userAPI.getById(currentUserId)
        
        setFormData({
          first_name: userData.first_name || authData.first_name || '',
          last_name: userData.last_name || authData.last_name || '',
          email: userData.email || authData.email || '',
          phone: userData.phone || ''
        })
      } catch (err) {
        console.error('[ProfileSettings] Error fetching user data:', err)
        showToast('Failed to load profile data', 'error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!userId) {
      showToast('No user ID available', 'error')
      return
    }

    try {
      setIsSaving(true)

      await userAPI.update(userId, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone
      })
      
      // Update the auth context with new user data
      const newUserData = { 
        ...user, 
        name: `${formData.first_name} ${formData.last_name}`.trim() || user?.name,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone
      }
      setUser(newUserData)
      localStorage.setItem('user', JSON.stringify(newUserData))
      
      showToast('User profile successfully updated', 'success', 5000)
    } catch (err) {
      console.error('[ProfileSettings] Error updating user:', err)
      showToast(err.message || 'Failed to update profile', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '20rem' }}>
        <p style={{ 
          fontFamily: 'var(--font-sans, system-ui, sans-serif)',
          fontSize: '14px',
          color: '#6B6B6B'
        }}>
          Loading profile...
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Toast notification */}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
        variant={toast.variant}
        duration={toast.duration}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '20rem' }}>
        {/* First Name Field */}
        <Input
          label="First name"
          description="Your first name"
          placeholder="Enter your first name"
          value={formData.first_name}
          onChange={(e) => handleChange('first_name', e.target.value)}
        />

        {/* Last Name Field */}
        <Input
          label="Last name"
          description="Your last name"
          placeholder="Enter your last name"
          value={formData.last_name}
          onChange={(e) => handleChange('last_name', e.target.value)}
        />

        {/* Email Field */}
        <Input
          label="Email address"
          description="The email address associated with this account"
          placeholder="Enter your email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          disabled={true}
        />

        {/* Phone Field */}
        <Input
          label="Phone number"
          description="The phone number associated with this account"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
        />

        {/* Save Button */}
        <div style={{ marginTop: '16px' }}>
          <Button 
            variant="dark" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </>
  )
}

// Organization General Settings Component
function OrganizationGeneralSettings() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    timezone: ''
  })
  const [locationId, setLocationId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // Toast state
  const [toast, setToast] = useState({ isVisible: false, message: '', variant: 'success' })

  const showToast = useCallback((message, variant = 'success', duration = 5000) => {
    setToast({ isVisible: true, message, variant, duration })
  }, [])

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }, [])

  // Major US timezones
  const timezoneOptions = [
    { value: 'America/New_York', label: 'New York (EST)' },
    { value: 'America/Chicago', label: 'Chicago (CST)' },
    { value: 'America/Denver', label: 'Denver (MST)' },
    { value: 'America/Phoenix', label: 'Phoenix (MST)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (PST)' },
    { value: 'America/Anchorage', label: 'Anchorage (AKST)' },
    { value: 'Pacific/Honolulu', label: 'Honolulu (HST)' }
  ]

  // Fetch location data on mount
  useEffect(() => {
    const fetchLocationData = async () => {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        // First, get user locations to find the location_id
        const userLocations = await locationsAPI.getUserLocations()
        
        // Extract location_id from the response
        // The response might be an array or an object with location_id
        let currentLocationId = null
        if (Array.isArray(userLocations) && userLocations.length > 0) {
          // If it's an array, get the first location's id
          currentLocationId = userLocations[0].location_id || userLocations[0].id
        } else if (userLocations?.location_id) {
          currentLocationId = userLocations.location_id
        } else if (userLocations?.id) {
          currentLocationId = userLocations.id
        }

        if (!currentLocationId) {
          throw new Error('No location ID found')
        }

        setLocationId(currentLocationId)

        // Now fetch the location details
        const locationData = await locationsAPI.getLocationById(currentLocationId)
        
        setFormData({
          name: locationData.name || '',
          phone: locationData.phone || '',
          timezone: locationData.timezone || ''
        })
      } catch (err) {
        console.error('[OrganizationGeneralSettings] Error fetching location data:', err)
        showToast('Failed to load organization data', 'error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLocationData()
  }, [])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!locationId) {
      showToast('No location ID available', 'error')
      return
    }

    try {
      setIsSaving(true)

      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_CONTACTS_BASE_URL}/locations/${locationId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          timezone: formData.timezone
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update organization' }))
        throw new Error(errorData.message || 'Failed to update organization')
      }

      showToast('Organization settings successfully updated', 'success', 5000)
    } catch (err) {
      console.error('[OrganizationGeneralSettings] Error updating location:', err)
      showToast(err.message || 'Failed to update organization settings', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '20rem' }}>
        <p style={{ 
          fontFamily: 'var(--font-sans, system-ui, sans-serif)',
          fontSize: '14px',
          color: '#6B6B6B'
        }}>
          Loading organization data...
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Toast notification */}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
        variant={toast.variant}
        duration={toast.duration}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '20rem' }}>
        {/* Name Field */}
        <Input
          label="Name"
          description="Organization name"
          placeholder="Enter organization name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />

        {/* Phone Field */}
        <Input
          label="Phone number"
          description="Organization phone number"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
        />

        {/* Timezone Field */}
        <Select
          label="Timezone"
          description="Organization timezone"
          placeholder="Select timezone"
          options={timezoneOptions}
          value={formData.timezone}
          onChange={(value) => handleChange('timezone', value)}
        />

        {/* Save Button */}
        <div style={{ marginTop: '16px' }}>
          <Button 
            variant="dark" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </>
  )
}

// Placeholder component for other settings pages
function SettingsPlaceholder() {
  return (
    <div>
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          color: '#6B6B6B',
          marginTop: 0
        }}
      >
        This settings page is coming soon.
      </p>
    </div>
  )
}

// People page components
function MembersComponent() {
  const { user } = useAuth()
  const [members, setMembers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState(null)

  // Fetch members on mount
  useEffect(() => {
    const fetchMembers = async () => {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // First, get user locations to find the location_id
        const userLocations = await locationsAPI.getUserLocations()
        
        // Extract location_id from the response
        let currentLocationId = null
        if (Array.isArray(userLocations) && userLocations.length > 0) {
          currentLocationId = userLocations[0].location_id || userLocations[0].id
        } else if (userLocations?.location_id) {
          currentLocationId = userLocations.location_id
        } else if (userLocations?.id) {
          currentLocationId = userLocations.id
        }

        if (!currentLocationId) {
          throw new Error('No location ID found')
        }

        console.log('[MembersComponent] Using location_id:', currentLocationId)

        // Now fetch the location users with the location_id
        const response = await fetch(`${API_CONTACTS_BASE_URL}/location_users?location_id=${currentLocationId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch members')
        }

        const data = await response.json()
        console.log('[MembersComponent] Fetched members:', data)
        
        // Handle various response formats
        const membersList = Array.isArray(data) ? data : (data?.users || data?.members || data?.data || [])
        setMembers(membersList)
      } catch (err) {
        console.error('[MembersComponent] Error fetching members:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMembers()
  }, [])

  // Filter members based on search query (client-side)
  const filteredMembers = members.filter(member => {
    if (!searchQuery.trim()) return true
    
    const query = searchQuery.toLowerCase()
    // Access nested user object if it exists
    const userData = member.user || member
    const name = (userData.name || `${userData.first_name || ''} ${userData.last_name || ''}`).toLowerCase()
    const email = (userData.email || '').toLowerCase()
    
    return name.includes(query) || email.includes(query)
  })

  // Get user data (handles nested user object from user_locations)
  const getUserData = (member) => {
    return member.user || member
  }

  // Get member display name
  const getMemberName = (member) => {
    const userData = getUserData(member)
    if (userData.name) return userData.name
    if (userData.first_name || userData.last_name) {
      return `${userData.first_name || ''} ${userData.last_name || ''}`.trim()
    }
    return userData.email || 'Unknown'
  }

  // Get member email
  const getMemberEmail = (member) => {
    const userData = getUserData(member)
    return userData.email || 'No email'
  }

  // Check if this member is the current user
  const isCurrentUser = (member) => {
    if (!user) return false
    const userData = getUserData(member)
    return userData.id === user.id || member.user_id === user.id || userData.email === user.email
  }

  // Get member role display
  const getMemberRole = (member) => {
    const userData = getUserData(member)
    // Check for user_role object with name (new API format)
    if (userData.user_role && typeof userData.user_role === 'object' && userData.user_role.name) {
      return userData.user_role.name
    }
    // If role is an object (expanded), get the name
    if (userData.role && typeof userData.role === 'object') {
      return userData.role.name || 'Member'
    }
    // If role is a string that looks like a UUID, show default
    if (typeof userData.role === 'string' && userData.role) {
      // Check if it's a UUID (contains dashes and is ~36 chars)
      const isUuid = userData.role.includes('-') && userData.role.length > 30
      if (isUuid) {
        return 'Owner' // Default to Owner for now
      }
      return userData.role
    }
    return member.user_role || member.role_name || 'Owner'
  }

  // Get avatar URL or initials
  const getAvatarUrl = (member) => {
    const userData = getUserData(member)
    // Handle profile_photo which might be an object with url/path
    if (userData.profile_photo) {
      if (typeof userData.profile_photo === 'string') {
        return userData.profile_photo
      }
      if (userData.profile_photo.url) {
        return userData.profile_photo.url
      }
      if (userData.profile_photo.path) {
        return userData.profile_photo.path
      }
    }
    return userData.avatar || userData.avatar_url || userData.profile_image || null
  }

  const getInitials = (member) => {
    const name = getMemberName(member)
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  if (isLoading) {
    return (
      <div style={{ padding: '20px 0' }}>
        <p style={{ 
          fontFamily: "'Inter', sans-serif",
          fontSize: '14px',
          color: '#6B6B6B'
        }}>
          Loading members...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '20px 0' }}>
        <p style={{ 
          fontFamily: "'Inter', sans-serif",
          fontSize: '14px',
          color: '#DC2626'
        }}>
          Error loading members: {error}
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header row with search and buttons */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px'
      }}>
        {/* Search input */}
        <div style={{ width: '240px' }}>
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members..."
          />
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            variant="dark"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              padding: '6px 12px',
              fontSize: '12px'
            }}
          >
            <Plus size={14} />
            Add member
          </Button>
        </div>
      </div>

      {/* Members list */}
      <div style={{ 
        border: '1px solid #EDEDED',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {filteredMembers.length === 0 ? (
          <div style={{ 
            padding: '32px',
            textAlign: 'center'
          }}>
            <p style={{ 
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              color: '#6B6B6B',
              margin: 0
            }}>
              {searchQuery ? 'No members found matching your search.' : 'No members found.'}
            </p>
          </div>
        ) : (
          filteredMembers.map((member, index) => (
            <ResultCard
              key={member.id || member.user_id || index}
              avatar={getAvatarUrl(member)}
              initials={getInitials(member)}
              headerText={getMemberName(member)}
              subText={getMemberEmail(member)}
              tags={isCurrentUser(member) 
                ? [
                    { text: 'You', variant: 'green' },
                    { text: getMemberRole(member), variant: 'grey' }
                  ] 
                : [
                    { text: getMemberRole(member), variant: 'grey' }
                  ]
              }
              primaryButtonText="Roles"
              onPrimaryClick={() => {}}
              showButtons={true}
              secondaryButtonText="Suspend"
              onSecondaryClick={() => {}}
            />
          ))
        )}
      </div>
    </div>
  )
}

function InvitationsComponent() {
  return (
    <div>
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          color: '#6B6B6B',
          marginTop: 0
        }}
      >
        Invitations content coming soon.
      </p>
    </div>
  )
}

function GroupsComponent() {
  return (
    <div>
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          color: '#6B6B6B',
          marginTop: 0
        }}
      >
        Groups content coming soon.
      </p>
    </div>
  )
}

function RolesComponent() {
  return (
    <div>
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          color: '#6B6B6B',
          marginTop: 0
        }}
      >
        Roles content coming soon.
      </p>
    </div>
  )
}

function Settings() {
  const location = useLocation()
  
  // If we're at exactly /settings, redirect to /settings/profile
  if (location.pathname === '/settings') {
    return <Navigate to="/settings/profile" replace />
  }

  return (
    <NewPage>
      <Routes>
        <Route path="profile" element={
          <PageContent maxWidth="600px" title="Your profile">
            <ProfileSettings />
          </PageContent>
        } />
        <Route path="organization/general" element={
          <PageContent maxWidth="600px" title="Organization - General">
            <OrganizationGeneralSettings />
          </PageContent>
        } />
        <Route path="organization/api-keys" element={
          <PageContent maxWidth="600px" title="API keys">
            <SettingsPlaceholder />
          </PageContent>
        } />
        <Route path="organization/admin-keys" element={
          <PageContent maxWidth="600px" title="Admin keys">
            <SettingsPlaceholder />
          </PageContent>
        } />
        <Route path="organization/people" element={
          <Navigate to="/settings/organization/people/members" replace />
        } />
        <Route path="organization/people/*" element={
          <PageContent 
            title="People & Permissions"
            basePath="/settings/organization/people"
            tabs={[
              { id: 'members', label: 'Members' },
              { id: 'invitations', label: 'Invitations' },
              { id: 'groups', label: 'Groups' },
              { id: 'roles', label: 'Roles' }
            ]}
          >
            {{
              members: <MembersComponent />,
              invitations: <InvitationsComponent />,
              groups: <GroupsComponent />,
              roles: <RolesComponent />
            }}
          </PageContent>
        } />
        <Route path="organization/projects" element={
          <PageContent maxWidth="600px" title="Projects">
            <SettingsPlaceholder />
          </PageContent>
        } />
        <Route path="organization/billing" element={
          <PageContent maxWidth="600px" title="Billing">
            <SettingsPlaceholder />
          </PageContent>
        } />
        <Route path="organization/limits" element={
          <PageContent maxWidth="600px" title="Limits">
            <SettingsPlaceholder />
          </PageContent>
        } />
        <Route path="organization/usage" element={
          <PageContent maxWidth="600px" title="Usage">
            <SettingsPlaceholder />
          </PageContent>
        } />
        <Route path="organization/service-health" element={
          <PageContent maxWidth="600px" title="Service health">
            <SettingsPlaceholder />
          </PageContent>
        } />
        <Route path="organization/data-controls" element={
          <PageContent maxWidth="600px" title="Data controls">
            <SettingsPlaceholder />
          </PageContent>
        } />
        <Route path="organization/security" element={
          <PageContent maxWidth="600px" title="Security">
            <SettingsPlaceholder />
          </PageContent>
        } />
        <Route path="project/general" element={
          <PageContent maxWidth="600px" title="Project - General">
            <SettingsPlaceholder />
          </PageContent>
        } />
        <Route path="project/api-keys" element={
          <PageContent maxWidth="600px" title="Project API keys">
            <SettingsPlaceholder />
          </PageContent>
        } />
        <Route path="project/webhooks" element={
          <PageContent maxWidth="600px" title="Webhooks">
            <SettingsPlaceholder />
          </PageContent>
        } />
        <Route path="project/evaluations" element={
          <PageContent maxWidth="600px" title="Evaluations">
            <SettingsPlaceholder />
          </PageContent>
        } />
        <Route path="project/people" element={
          <PageContent maxWidth="600px" title="Project People">
            <SettingsPlaceholder />
          </PageContent>
        } />
        <Route path="project/limits" element={
          <PageContent maxWidth="600px" title="Project Limits">
            <SettingsPlaceholder />
          </PageContent>
        } />
        <Route path="trash" element={<Trash />} />
        <Route path="*" element={<Navigate to="/settings/profile" replace />} />
      </Routes>
    </NewPage>
  )
}

export default Settings
