import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
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

function Sidebar() {
  const location = useLocation()
  const [hoveredItem, setHoveredItem] = useState(null)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navSections = [
    {
      title: 'Sales',
      items: [
        { path: '/leads', label: 'Leads', icon: User },
        { path: '/estimates', label: 'Estimates', icon: Calculator },
        { path: '/proposals', label: 'Proposals', icon: File }
      ]
    },
    {
      title: 'Projects',
      items: [
        { path: '/active-jobs', label: 'Active Jobs', icon: Frame },
        { path: '/inspections', label: 'Inspections', icon: HardHat },
        { path: '/work-orders', label: 'Work Orders', icon: PencilRuler },
        { path: '/photos', label: 'Photos', icon: Camera }
      ]
    },
    {
      title: 'Financial',
      items: [
        { path: '/invoices', label: 'Invoices', icon: ReceiptText },
        { path: '/budget', label: 'Budget / Costs', icon: PiggyBank },
        { path: '/payroll', label: 'Payroll', icon: Banknote }
      ]
    },
    {
      title: 'Optimize',
      items: [
        { path: '/reports', label: 'Reports', icon: ChartLine },
        { path: '/materials', label: 'Materials', icon: Package }
      ]
    }
  ]

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: '#F3F3F3',
        padding: '10px',
        width: isCollapsed ? '50px' : '162px',
        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden'
      }}
    >
      {/* Navigation Links Wrapper */}
      <div
        className="flex flex-col items-start"
        style={{
          gap: '15px'
        }}
      >
        {navSections.map((section) => (
          <div key={section.title} className="w-full">
            {/* Section Header */}
            <div
              style={{
                color: '#979797',
                marginBottom: '6px',
                paddingLeft: '10px',
                paddingRight: '10px',
                height: '14px',
                lineHeight: '14px',
                opacity: isCollapsed ? 0 : 1,
                overflow: 'hidden',
                transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <span 
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  letterSpacing: '-0.01em',
                  fontWeight: 500,
                  display: 'block',
                  visibility: isCollapsed ? 'hidden' : 'visible',
                  height: '14px',
                  lineHeight: '14px'
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
                const Icon = item.icon
                const active = isActive(item.path)
                const isHovered = hoveredItem === item.path

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="no-underline"
                  >
                    <div
                      className="flex flex-row items-center justify-start"
                      style={{
                        width: isCollapsed ? '30px' : '142px',
                        height: '30px',
                        backgroundColor: active ? '#DFDFDF' : (isHovered ? '#E5E5E5' : 'transparent'),
                        borderRadius: '7px',
                        padding: isCollapsed ? '7px' : '7px 9px',
                        gap: isCollapsed ? '0px' : '7px',
                        color: active ? '#000000' : 'inherit',
                        position: 'relative',
                        marginLeft: isCollapsed ? 'auto' : '0',
                        marginRight: isCollapsed ? 'auto' : '0',
                        transition: 'background-color 0.2s ease, width 0.4s cubic-bezier(0.4, 0, 0.2, 1), padding 0.4s cubic-bezier(0.4, 0, 0.2, 1), gap 0.4s cubic-bezier(0.4, 0, 0.2, 1), margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1), margin-right 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxSizing: 'border-box'
                      }}
                      onMouseEnter={() => setHoveredItem(item.path)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <Icon 
                        size={16} 
                        style={{ 
                          color: active ? '#000000' : 'currentColor',
                          flexShrink: 0
                        }} 
                      />
                      <span 
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '12px',
                          letterSpacing: '-0.01em',
                          fontWeight: 500,
                          color: active ? '#000000' : 'inherit',
                          opacity: isCollapsed ? 0 : 1,
                          position: isCollapsed ? 'absolute' : 'static',
                          left: isCollapsed ? '-9999px' : 'auto',
                          whiteSpace: 'nowrap',
                          transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Icon */}
      <div 
        style={{ 
          marginTop: 'auto',
          marginBottom: '0',
          display: 'flex',
          justifyContent: 'flex-start'
        }}
      >
        <button
          className="p-2 border-none bg-transparent cursor-pointer"
          aria-label="Collapse sidebar"
          style={{
            padding: '8px'
          }}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <PanelLeft size={16} style={{ color: 'currentColor' }} />
        </button>
      </div>
    </div>
  )
}

export default Sidebar

