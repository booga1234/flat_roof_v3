import { Link, useLocation } from 'react-router-dom'
import { ChevronsUpDown, Settings, User } from 'lucide-react'

function Topbar() {
  const location = useLocation()

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
        height: '47px',
        padding: '11px 10px 11px 4px',
        backgroundColor: '#F3F3F3'
      }}
    >
      {/* Left Section */}
      <div
        className="flex flex-row items-center"
      >
        {/* Vancouver Dropdown */}
        <button
          className="flex flex-row items-center cursor-pointer bg-transparent border-none hover:bg-[#DFDFDF] transition-colors duration-200 rounded-[7px]"
          style={{
            display: 'flex',
            gap: '4px',
            marginLeft: '8px',
            padding: '4px 6px'
          }}
        >
          {/* Location Icon - Circular with V */}
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '51px',
              backgroundColor: '#181818',
              border: '1px solid rgba(0, 0, 0, 0.1)'
            }}
          >
            <span
              style={{
                color: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
                fontSize: '9px',
                fontWeight: 700,
                lineHeight: '1',
                letterSpacing: '0'
              }}
            >
              V
            </span>
          </div>
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
            Vancouver
          </span>
          <ChevronsUpDown size={12} style={{ color: '#838383', display: 'inline-block', flexShrink: 0 }} />
        </button>

        {/* Separator */}
        <span
          style={{
            color: '#909090',
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            marginLeft: '10px',
            marginRight: '10px'
          }}
        >
          /
        </span>

        {/* Commercial Dropdown */}
        <button
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
        </button>
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
          className="flex flex-row items-center"
          style={{
            gap: '20px'
          }}
        >
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="no-underline hover:opacity-80 transition-opacity"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                letterSpacing: '-0.01em',
                fontWeight: 500,
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
            width: '20px',
            height: '20px'
          }}
        >
          <Settings size={16} style={{ color: '#000000' }} />
        </button>

        {/* Profile Image */}
        <div
          className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '51px',
            backgroundColor: '#5F5F5F'
          }}
        >
          <User size={14} style={{ color: '#FFFFFF' }} />
        </div>
      </div>
    </div>
  )
}

export default Topbar

