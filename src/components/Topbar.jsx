import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronsUpDown, Settings, User, Plus, Sun, Moon, Monitor } from 'lucide-react'
import TopbarDropdown from './TopbarDropdown'
import { locationsAPI } from '../utils/apiService'
import { API_BASE_URL, API_CONTACTS_BASE_URL } from '../config/api'

function Topbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [updatingLocation, setUpdatingLocation] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState('light')
  const profileDropdownRef = useRef(null)

  useEffect(() => {
    fetchUserAndLocations()
  }, [])

  const fetchUserAndLocations = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')
      
      // Fetch user data from auth/me to get current location
      let currentLocationId = null
      if (token) {
        try {
          const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
          
          if (userResponse.ok) {
            const userDataResponse = await userResponse.json()
            // Get current location from user data - check all possible field names
            currentLocationId = userDataResponse.current_location_id || userDataResponse.location_id || userDataResponse.selected_location_id
            // Store user ID for future updates
            setUserId(userDataResponse.id)
            // Store full user data for profile dropdown
            setUserData({
              id: userDataResponse.id,
              firstName: userDataResponse.first_name || '',
              lastName: userDataResponse.last_name || '',
              email: userDataResponse.email || '',
              profilePhoto: userDataResponse.profile_photo?.url || null,
            })
            console.log('[Topbar] User ID:', userDataResponse.id)
            console.log('[Topbar] User current_location_id from auth/me:', currentLocationId)
          }
        } catch (error) {
          console.warn('Error fetching user data:', error)
        }
      }
      
      // Fetch available locations
      const data = await locationsAPI.getUserLocations()
      console.log('[Topbar] User locations from API:', data)
      
      // Transform API response to dropdown format
      // API now returns expanded location data with location.name
      const transformedLocations = Array.isArray(data) 
        ? data.map((item) => ({
            value: item.location_id || item.location?.id,
            label: item.location?.name || 'Unknown Location',
            locationId: item.location_id || item.location?.id
          }))
        : []
      
      console.log('[Topbar] Transformed locations:', transformedLocations)
      setLocations(transformedLocations)
      
      // Set selected location from auth/me current_location_id, or fallback to first location
      if (currentLocationId && transformedLocations.some(loc => loc.value === currentLocationId)) {
        console.log('[Topbar] Setting selected location to current_location_id:', currentLocationId)
        setSelectedLocation(currentLocationId)
      } else {
        if (currentLocationId) {
          console.warn('[Topbar] current_location_id from auth/me not found in user locations:', currentLocationId)
          console.warn('[Topbar] Available location IDs:', transformedLocations.map(loc => loc.value))
        }
        if (transformedLocations.length > 0) {
          console.log('[Topbar] Falling back to first location:', transformedLocations[0].value)
          setSelectedLocation(transformedLocations[0].value)
        }
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
      // Fallback to empty array on error
      setLocations([])
    } finally {
      setLoading(false)
    }
  }

  const handleLocationChange = async (item) => {
    const newLocationId = item.value
    console.log('[Topbar] Location changed to:', newLocationId)
    
    // Update local state immediately for better UX
    setSelectedLocation(newLocationId)
    
    // Update the user's current_location_id in the database
    if (userId) {
      try {
        setUpdatingLocation(true)
        const token = localStorage.getItem('authToken')
        
        const response = await fetch(`${API_CONTACTS_BASE_URL}/user/${userId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            current_location_id: newLocationId
          }),
        })
        
        if (response.ok) {
          const updatedUser = await response.json()
          console.log('[Topbar] Successfully updated current_location_id:', updatedUser)
        } else {
          console.error('[Topbar] Failed to update current_location_id:', response.status, response.statusText)
          // Could show a toast notification here
        }
      } catch (error) {
        console.error('[Topbar] Error updating current_location_id:', error)
        // Could show a toast notification here
      } finally {
        setUpdatingLocation(false)
      }
    } else {
      console.warn('[Topbar] Cannot update location: user ID not available')
    }
  }

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setIsProfileOpen(false)
    navigate('/login')
  }

  const projectFooterItems = [
    { 
      icon: <Plus size={14} style={{ color: '#1A1A1A' }} />, 
      label: 'Create location',
      onClick: () => console.log('Create location')
    },
    { 
      icon: <Settings size={14} style={{ color: '#1A1A1A' }} />, 
      label: 'Manage locations',
      onClick: () => console.log('Manage locations')
    }
  ]

  // Get user display info
  const userFullName = userData ? `${userData.firstName} ${userData.lastName}`.trim() || 'User' : 'User'
  const userEmail = userData?.email || ''
  const userInitials = userData 
    ? `${userData.firstName?.charAt(0) || ''}${userData.lastName?.charAt(0) || ''}`.toUpperCase() || 'U'
    : 'U'

  const selectedLocationData = locations.find(l => l.value === selectedLocation)
  const selectedLocationLabel = selectedLocationData?.label || (loading ? 'Loading...' : 'No location')
  const selectedLocationIcon = selectedLocationLabel.charAt(0).toUpperCase()

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/pipeline', label: 'Pipeline' },
    { path: '/library', label: 'Library' }
  ]

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    // For pipeline and library, check if pathname starts with the path
    // This handles both /pipeline and /pipeline/:selection
    if (path === '/pipeline' || path === '/library') {
      return location.pathname.startsWith(path)
    }
    return location.pathname === path
  }

  return (
    <div
      className="flex flex-row items-center justify-between"
      style={{
        height: '55px',
        padding: '10px 16px 10px 8px',
        backgroundColor: '#F3F3F3'
      }}
    >
      {/* Left Section */}
      <div
        className="flex flex-row items-center"
      >
        {/* Location Dropdown */}
        <TopbarDropdown
          label={selectedLocationLabel}
          icon={selectedLocationIcon}
          items={locations}
          selectedValue={selectedLocation}
          onSelect={handleLocationChange}
          footerItems={projectFooterItems}
        />

        {/* Separator */}
        {/* <span
          style={{
            color: '#909090',
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            marginLeft: '10px',
            marginRight: '10px'
          }}
        >
          /
        </span> */}

        {/* Commercial Dropdown */}
        {/* <button
          className="flex flex-row items-center cursor-pointer bg-transparent border-none hover:bg-[#DFDFDF] transition-colors duration-200 rounded-[7px]"
          style={{
            display: 'flex',
            gap: '4px',
            padding: '4px 6px'
          }}
        >
          <span
            style={{
              color: '#000000',
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              display: 'inline-block'
            }}
          >
            Commercial
          </span>
          <ChevronsUpDown size={12} style={{ color: '#838383', display: 'inline-block', flexShrink: 0 }} />
        </button> */}
      </div>

      {/* Right Section */}
      <div
        className="flex flex-row items-center"
        style={{
          gap: '20px'
        }}
      >
        {/* Navigation Links */}
        <div
          className="flex flex-row items-center text-sm"
          style={{
            gap: '20px'
          }}
        >
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="no-underline hover:opacity-80 transition-opacity text-sm"
              style={{
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '-0.01em',
                fontWeight: 400,
                color: isActive(item.path) ? '#000000' : '#5F5F5F',
                transition: 'color 0.2s ease'
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Settings Icon */}
        <button
          className="p-0 border-none bg-transparent cursor-pointer hover:opacity-80 transition-opacity"
          aria-label="Settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px'
          }}
        >
          <Settings size={18} style={{ color: '#000000' }} />
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity overflow-hidden border-none bg-transparent p-0"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '51px',
              backgroundColor: userData?.profilePhoto ? 'transparent' : '#5F5F5F'
            }}
          >
            {userData?.profilePhoto ? (
              <img 
                src={userData.profilePhoto} 
                alt={userFullName}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '51px',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <User size={18} style={{ color: '#FFFFFF' }} />
            )}
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div
              className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
              style={{
                minWidth: '220px',
                padding: '5px'
              }}
            >
              {/* User Info */}
              <div style={{ padding: '8px 8px 12px 8px' }}>
                <div
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#1A1A1A',
                    marginBottom: '2px'
                  }}
                >
                  {userFullName}
                </div>
                <div
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    fontWeight: 400,
                    color: '#6B6B6B'
                  }}
                >
                  {userEmail}
                </div>
              </div>

              {/* Theme Switcher */}
              <div style={{ padding: '0 8px 8px 8px', display: 'none' }}>
                <div
                  className="flex items-center"
                  style={{
                    backgroundColor: '#F5F5F5',
                    borderRadius: '8px',
                    padding: '4px',
                    gap: '4px'
                  }}
                >
                  <button
                    onClick={() => setSelectedTheme('light')}
                    className="flex items-center justify-center border-none cursor-pointer transition-colors duration-150"
                    style={{
                      width: '32px',
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor: selectedTheme === 'light' ? '#FFFFFF' : 'transparent',
                      boxShadow: selectedTheme === 'light' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    <Sun size={16} style={{ color: selectedTheme === 'light' ? '#1A1A1A' : '#6B6B6B' }} />
                  </button>
                  <button
                    onClick={() => setSelectedTheme('dark')}
                    className="flex items-center justify-center border-none cursor-pointer transition-colors duration-150"
                    style={{
                      width: '32px',
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor: selectedTheme === 'dark' ? '#FFFFFF' : 'transparent',
                      boxShadow: selectedTheme === 'dark' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    <Moon size={16} style={{ color: selectedTheme === 'dark' ? '#1A1A1A' : '#6B6B6B' }} />
                  </button>
                  <button
                    onClick={() => setSelectedTheme('system')}
                    className="flex items-center justify-center border-none cursor-pointer transition-colors duration-150"
                    style={{
                      width: '32px',
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor: selectedTheme === 'system' ? '#FFFFFF' : 'transparent',
                      boxShadow: selectedTheme === 'system' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    <Monitor size={16} style={{ color: selectedTheme === 'system' ? '#1A1A1A' : '#6B6B6B' }} />
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: '1.5px', backgroundColor: '#E5E5E5', margin: '6px -5px' }} />

              {/* Menu Items */}
              <div>
                <button
                  onClick={() => {
                    setIsProfileOpen(false)
                    navigate('/settings')
                  }}
                  className="w-full flex items-center gap-2 px-2 py-[5px] rounded-md cursor-pointer bg-transparent border-none hover:bg-[#ECECEC] transition-colors duration-150 text-sm"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    color: '#1A1A1A',
                    textAlign: 'left'
                  }}
                >
                  Your profile
                </button>
                <button
                  onClick={() => {
                    setIsProfileOpen(false)
                    navigate('/settings/trash')
                  }}
                  className="w-full flex items-center gap-2 px-2 py-[5px] rounded-md cursor-pointer bg-transparent border-none hover:bg-[#ECECEC] transition-colors duration-150 text-sm"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    color: '#1A1A1A',
                    textAlign: 'left'
                  }}
                >
                  Trash
                </button>
                <button
                  onClick={() => {
                    setIsProfileOpen(false)
                    console.log('Help')
                  }}
                  className="w-full flex items-center gap-2 px-2 py-[5px] rounded-md cursor-pointer bg-transparent border-none hover:bg-[#ECECEC] transition-colors duration-150 text-sm"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    color: '#1A1A1A',
                    textAlign: 'left'
                  }}
                >
                  Help
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2 py-[5px] rounded-md cursor-pointer bg-transparent border-none hover:bg-[#ECECEC] transition-colors duration-150 text-sm"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    color: '#1A1A1A',
                    textAlign: 'left'
                  }}
                >
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Topbar

