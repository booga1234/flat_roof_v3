/**
 * SecondarySidebar - A reusable secondary navigation sidebar
 * 
 * Usage:
 * <SecondarySidebar>
 *   <SecondarySidebarSection title="Settings">
 *     <SecondarySidebarItem to="/settings/profile" label="Your profile" />
 *   </SecondarySidebarSection>
 *   <SecondarySidebarSection title="Organization">
 *     <SecondarySidebarItem to="/settings/org" label="General" />
 *   </SecondarySidebarSection>
 * </SecondarySidebar>
 * 
 * Or with data-driven approach:
 * <SecondarySidebar sections={navSections} />
 */

import { useState, createContext, useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'

// Context for sharing hover state across items
const SidebarContext = createContext({
  hoveredItem: null,
  setHoveredItem: () => {},
  isActive: () => false
})

export function useSidebarContext() {
  return useContext(SidebarContext)
}

// Main Sidebar Container
export function SecondarySidebar({ 
  children, 
  sections,
  width = '220px',
  backgroundColor = '#F3F3F3',
  className = ''
}) {
  const location = useLocation()
  const [hoveredItem, setHoveredItem] = useState(null)

  const isActive = (path, defaultPath) => {
    if (defaultPath && location.pathname === defaultPath.base && path === defaultPath.target) {
      return true
    }
    // Exact match
    if (location.pathname === path) {
      return true
    }
    // Match sub-paths (e.g., /settings/organization/people/members matches /settings/organization/people)
    if (location.pathname.startsWith(path + '/')) {
      return true
    }
    return false
  }

  const contextValue = {
    hoveredItem,
    setHoveredItem,
    isActive
  }

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        className={`flex flex-col h-full ${className}`}
        style={{
          backgroundColor,
          width,
          overflow: 'hidden'
        }}
      >
        <div
          className="flex flex-col items-start flex-1"
          style={{
            gap: '20px',
            overflowY: 'auto',
            padding: '16px 0 0 12px'
          }}
        >
          {/* Data-driven rendering */}
          {sections && sections.map((section, index) => (
            <SecondarySidebarSection key={section.title || index} title={section.title}>
              {section.items.map((item) => (
                <SecondarySidebarItem
                  key={item.path}
                  to={item.path}
                  label={item.label}
                  icon={item.icon}
                  defaultPath={section.defaultPath}
                />
              ))}
            </SecondarySidebarSection>
          ))}

          {/* Composable children */}
          {children}
        </div>
      </div>
    </SidebarContext.Provider>
  )
}

// Section with optional title
export function SecondarySidebarSection({ 
  title, 
  children,
  defaultPath 
}) {
  return (
    <div className="w-full" style={{ paddingRight: '12px' }}>
      {title && (
        <div
          style={{
            color: '#909090',
            marginBottom: '8px',
            paddingLeft: '12px'
          }}
        >
          <span className="text-section-header">
            {title}
          </span>
        </div>
      )}

      <div
        className="flex flex-col"
        style={{ gap: '5px' }}
      >
        {children}
      </div>
    </div>
  )
}

// Individual navigation item
export function SecondarySidebarItem({ 
  to, 
  label, 
  icon,
  defaultPath,
  onClick,
  activeColor = '#DFDFDF',
  hoverColor = '#E9E9E9',
  textColor = '#1A1A1A'
}) {
  const { hoveredItem, setHoveredItem, isActive } = useSidebarContext()
  const active = isActive(to, defaultPath)
  const isHovered = hoveredItem === to

  const content = (
    <div
      className="flex flex-row items-center justify-start"
      style={{
        width: '100%',
        height: '32px',
        backgroundColor: active ? activeColor : (isHovered ? hoverColor : 'transparent'),
        borderRadius: '6px',
        padding: '8px 12px',
        color: textColor,
        fontWeight: 400,
        transition: 'background-color 0.15s ease',
        boxSizing: 'border-box',
        gap: '8px'
      }}
      onMouseEnter={() => setHoveredItem(to)}
      onMouseLeave={() => setHoveredItem(null)}
    >
      {icon && (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {icon}
        </span>
      )}
      <span className="font-inter text-sm tracking-[-0.01em] whitespace-nowrap">
        {label}
      </span>
    </div>
  )

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="no-underline w-full text-left bg-transparent border-none p-0 cursor-pointer"
      >
        {content}
      </button>
    )
  }

  return (
    <Link to={to} className="no-underline">
      {content}
    </Link>
  )
}

export default SecondarySidebar

