import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { API_V2_BASE_URL } from '../config/api'

function SidebarLibrary() {
  const location = useLocation()
  const navigate = useNavigate()
  const [hoveredItem, setHoveredItem] = useState(null)
  const [searchValue, setSearchValue] = useState('')
  const [navSections, setNavSections] = useState([])
  const [loading, setLoading] = useState(true)

  // Helper function to create section ID from name (must match Library component)
  const createSectionId = (name) => {
    if (!name) return ''
    return name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/\//g, '-')
      .replace(/[^a-z0-9-]/g, '')
  }

  // Fetch categories to build navigation
  useEffect(() => {
    fetchCategoriesForNav()
  }, [])

  const fetchCategoriesForNav = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch(`${API_V2_BASE_URL}/material-categories`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Sidebar - Categories data:', data)
        buildNavigationSections(data)
      }
    } catch (err) {
      console.error('Error fetching categories for navigation:', err)
    } finally {
      setLoading(false)
    }
  }

  const buildNavigationSections = (categoriesData) => {
    const sections = []

    // Build Materials section - use categories as navigation items
    if (categoriesData && categoriesData.categories && categoriesData.categories.length > 0) {
      // Get all categories as navigation items (already sorted by sort_order from API)
      const allCategories = categoriesData.categories.map(category => ({
        id: createSectionId(category.name),
        label: category.name
      }))

      console.log('Sidebar - Building Materials section with categories:', allCategories)

      sections.push({
        title: 'Materials',
        items: allCategories
      })
    } else {
      console.log('Sidebar - No categories found. categoriesData:', categoriesData)
    }

    // Add Templates section
    sections.push({
      title: 'Templates',
      items: [
        { id: 'scope-of-work', label: 'Scope of Work' },
        { id: 'inspection', label: 'Inspection' },
        { id: 'estimate', label: 'Estimate' },
        { id: 'proposal', label: 'Proposal' }
      ]
    })

    // Add Configuration section
    sections.push({
      title: 'Configuration',
      items: [
        { id: 'calendar', label: 'Time slots', route: '/library/time-slots' }
      ]
    })

    console.log('Sidebar - Final sections:', sections)
    setNavSections(sections)
  }

  const isActive = (item) => {
    // Check if item has a route property (route-based navigation)
    if (item.route) {
      return location.pathname === item.route
    }
    // Otherwise, check hash (hash-based navigation)
    return location.hash === `#${item.id}`
  }

  const handleClick = (e, item) => {
    e.preventDefault()
    
    // Check if item has a route property (route-based navigation)
    if (item.route) {
      navigate(item.route)
    } else {
      // Navigate to library with hash (hash-based navigation)
      navigate(`/library#${item.id}`)
      // Trigger scroll
      setTimeout(() => {
        const element = document.getElementById(item.id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }

  // Filter navigation items based on search
  const filteredSections = navSections.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.label.toLowerCase().includes(searchValue.toLowerCase())
    )
  })).filter(section => section.items.length > 0)

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: '#F3F3F3',
        padding: '10px',
        width: '162px'
      }}
    >
      {/* Search Bar */}
      <div
        className="flex flex-row items-center"
        style={{
          borderRadius: '5px',
          gap: '7px',
          padding: '7px 9px',
          backgroundColor: '#F3F3F3',
          border: '0.5px solid #CDCDCD',
          marginBottom: '15px'
        }}
      >
        <Search size={14} style={{ color: '#5D5D5D', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            letterSpacing: '-0.01em',
            fontWeight: 500,
            color: '#5D5D5D',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            width: '100%',
            flex: 1
          }}
        />
      </div>

      {/* Navigation Links Wrapper */}
      <div
        className="flex flex-col items-start"
        style={{
          gap: '24px'
        }}
      >
        {loading ? (
          <div className="text-xs text-gray-500">Loading...</div>
        ) : filteredSections.length === 0 ? (
          <div className="text-xs text-gray-500">No categories found</div>
        ) : (
          filteredSections.map((section) => (
          <div key={section.title} className="w-full">
            {/* Section Header */}
            <div
              style={{
                marginBottom: '6px'
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '10px',
                  letterSpacing: '-0.01em',
                  fontWeight: 600,
                  color: '#979797',
                  display: 'block',
                  paddingLeft: '8px',
                  paddingRight: '8px'
                }}
              >
                {section.title}
              </span>
            </div>

            {/* Section Items */}
            <div
              className="flex flex-col"
              style={{
                gap: '3px'
              }}
            >
              {section.items.map((item) => {
                const active = isActive(item)
                const isHovered = hoveredItem === item.id
                const href = item.route || `#${item.id}`

                return (
                  <a
                    key={item.id}
                    href={href}
                    onClick={(e) => handleClick(e, item)}
                    className="no-underline"
                    style={{
                      width: '142px',
                      display: 'block'
                    }}
                  >
                    <div
                      className="flex flex-row items-center justify-start"
                      style={{
                        width: '142px',
                        borderRadius: '7px',
                        padding: '7px 9px',
                        backgroundColor: active ? '#DFDFDF' : (isHovered ? '#E5E5E5' : 'transparent'),
                        transition: 'background-color 0.2s ease',
                        boxSizing: 'border-box'
                      }}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '12px',
                          letterSpacing: '-0.01em',
                          fontWeight: 500,
                          color: '#000000'
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        ))
        )}
      </div>
    </div>
  )
}

export default SidebarLibrary

