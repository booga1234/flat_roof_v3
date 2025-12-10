/**
 * Sidebar - A collapsible primary navigation sidebar
 * 
 * Usage:
 * <Sidebar>
 *   <SidebarSection title="Sales">
 *     <SidebarItem to="/leads" label="Leads" icon={User} />
 *   </SidebarSection>
 *   <SidebarSection title="Projects">
 *     <SidebarItem to="/projects" label="Projects" icon={Frame} />
 *   </SidebarSection>
 * </Sidebar>
 * 
 * Or with data-driven approach:
 * <Sidebar sections={navSections} />
 */

import { useState, createContext, useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  User,
  File,
  Calculator,
  Frame,
  HardHat,
  PencilRuler,
  Camera,
  ReceiptText,
  PiggyBank,
  Banknote,
  ChartLine,
  Package,
  PanelLeft
} from 'lucide-react'

// Context for sharing state across items
const SidebarContext = createContext({
  hoveredItem: null,
  setHoveredItem: () => {},
  isActive: () => false,
  isCollapsed: false
})

export function useSidebarContext() {
  return useContext(SidebarContext)
}

// Main Sidebar Container
export function Sidebar({ 
  children, 
  sections,
  expandedWidth = '162px',
  collapsedWidth = '50px',
  backgroundColor = '#F3F3F3',
  className = ''
}) {
  const location = useLocation()
  const [hoveredItem, setHoveredItem] = useState(null)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const isActive = (path, defaultPath) => {
    if (defaultPath && location.pathname === defaultPath.base && path === defaultPath.target) {
      return true
    }
    if (location.pathname === path) {
      return true
    }
    if (location.pathname.startsWith(path + '/')) {
      return true
    }
    return false
  }

  const contextValue = {
    hoveredItem,
    setHoveredItem,
    isActive,
    isCollapsed
  }

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        className={`flex flex-col h-full ${className}`}
        style={{
          backgroundColor,
          width: isCollapsed ? collapsedWidth : expandedWidth,
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden'
        }}
      >
        <div
          className="flex flex-col items-start flex-1"
          style={{
            gap: '20px',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: isCollapsed ? '16px 9px 0 9px' : '16px 12px 0 12px',
            transition: 'padding 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Data-driven rendering */}
          {sections && sections.map((section, index) => (
            <SidebarSection key={section.title || index} title={section.title}>
              {section.items.map((item) => (
                <SidebarItem
                  key={item.path}
                  to={item.path}
                  label={item.label}
                  icon={item.icon}
                  defaultPath={section.defaultPath}
                />
              ))}
            </SidebarSection>
          ))}

          {/* Composable children */}
          {children}
        </div>

        {/* Collapse Toggle Button */}
        <div 
          style={{ 
            marginTop: 'auto',
            padding: isCollapsed ? '16px 9px' : '16px 12px',
            display: 'flex',
            justifyContent: 'flex-start',
            transition: 'padding 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <button
            className="border-none bg-transparent cursor-pointer"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <PanelLeft 
              size={16} 
              style={{ 
                color: 'currentColor',
                transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }} 
            />
          </button>
        </div>
      </div>
    </SidebarContext.Provider>
  )
}

// Section with optional title
export function SidebarSection({ 
  title, 
  children,
  defaultPath 
}) {
  const { isCollapsed } = useSidebarContext()

  return (
    <div className="w-full">
      {title && (
        <div
          style={{
            color: '#909090',
            marginBottom: '8px',
            paddingLeft: '12px',
            opacity: isCollapsed ? 0 : 1,
            overflow: 'hidden',
            transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <span 
            className="text-section-header"
            style={{
              display: 'block',
              visibility: isCollapsed ? 'hidden' : 'visible'
            }}
          >
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
export function SidebarItem({ 
  to, 
  label, 
  icon: Icon,
  defaultPath,
  onClick,
  activeColor = '#DFDFDF',
  hoverColor = '#E9E9E9',
  textColor = '#1A1A1A'
}) {
  const { hoveredItem, setHoveredItem, isActive, isCollapsed } = useSidebarContext()
  const active = isActive(to, defaultPath)
  const isHovered = hoveredItem === to

  const content = (
    <div
      className="flex flex-row items-center justify-start"
      style={{
        width: isCollapsed ? '32px' : '100%',
        height: '32px',
        backgroundColor: active ? activeColor : (isHovered ? hoverColor : 'transparent'),
        borderRadius: '6px',
        padding: isCollapsed ? '8px' : '8px 12px',
        gap: '8px',
        color: textColor,
        fontWeight: 400,
        position: 'relative',
        overflow: 'hidden',
        transition: 'background-color 0.15s ease, width 0.4s cubic-bezier(0.4, 0, 0.2, 1), padding 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        boxSizing: 'border-box'
      }}
      onMouseEnter={() => setHoveredItem(to)}
      onMouseLeave={() => setHoveredItem(null)}
    >
      {Icon && (
        <Icon 
          size={16} 
          style={{ 
            color: 'currentColor',
            flexShrink: 0
          }} 
        />
      )}
      <span 
        className="font-inter text-sm tracking-[-0.01em] whitespace-nowrap"
        style={{
          opacity: isCollapsed ? 0 : 1,
          transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
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

// Pre-configured Main Navigation Sidebar
export function MainSidebar() {
  return (
    <Sidebar>
      <SidebarSection title="Sales">
        <SidebarItem to="/leads" label="Leads" icon={User} />
        <SidebarItem to="/estimates" label="Estimates" icon={Calculator} />
        <SidebarItem to="/proposals" label="Proposals" icon={File} />
      </SidebarSection>

      <SidebarSection title="Projects">
        <SidebarItem to="/active-jobs" label="Active Jobs" icon={Frame} />
        <SidebarItem to="/inspections" label="Inspections" icon={HardHat} />
        <SidebarItem to="/work-orders" label="Work Orders" icon={PencilRuler} />
        <SidebarItem to="/photos" label="Photos" icon={Camera} />
      </SidebarSection>

      <SidebarSection title="Financial">
        <SidebarItem to="/invoices" label="Invoices" icon={ReceiptText} />
        <SidebarItem to="/budget" label="Budget / Costs" icon={PiggyBank} />
        <SidebarItem to="/payroll" label="Payroll" icon={Banknote} />
      </SidebarSection>

      <SidebarSection title="Optimize">
        <SidebarItem to="/reports" label="Reports" icon={ChartLine} />
        <SidebarItem to="/materials" label="Materials" icon={Package} />
      </SidebarSection>
    </Sidebar>
  )
}

export default Sidebar
