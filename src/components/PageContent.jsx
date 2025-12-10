import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

/**
 * PageContent - Consistent content wrapper for page layouts
 * 
 * Use inside NewPage to provide consistent padding and scrolling behavior.
 * Includes an optional header with full-width divider.
 * 
 * @param {Array} tabs - Array of tab objects with { id, label } to display navigation tabs
 * @param {string} basePath - Base path for URL-based tab navigation (e.g., '/settings/organization/people')
 * @param {string|Object|Function} children - Content to display. If tabs are provided:
 *   - Can be an object mapping tab IDs to content: { 'tab1': <Component />, 'tab2': <Component /> }
 *   - Can be a function that receives activeTabId: (activeTabId) => <Component />
 *   - Otherwise renders as normal children
 */
function PageContent({ 
  children, 
  className = '',
  title,
  headerRight,
  padding = '32px 23px',
  maxWidth,
  center = false,
  scrollable = true,
  showHeader = true,
  tabs = [],
  basePath = ''
}) {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Determine active tab from URL if basePath is provided, otherwise use state
  const getActiveTabFromUrl = () => {
    if (basePath && tabs.length > 0) {
      const currentPath = location.pathname
      // Extract the tab id from the URL (last segment after basePath)
      const tabSegment = currentPath.replace(basePath, '').replace(/^\//, '')
      const matchingTab = tabs.find(tab => tab.id === tabSegment)
      return matchingTab ? matchingTab.id : tabs[0].id
    }
    return tabs.length > 0 ? tabs[0].id : null
  }

  const [activeTab, setActiveTab] = useState(getActiveTabFromUrl)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const tabsContainerRef = useRef(null)
  const tabRefs = useRef({})

  // Sync active tab with URL when location changes
  useEffect(() => {
    if (basePath && tabs.length > 0) {
      const newActiveTab = getActiveTabFromUrl()
      if (newActiveTab !== activeTab) {
        setActiveTab(newActiveTab)
      }
    }
  }, [location.pathname, basePath, tabs])

  // Handle tab click - navigate if basePath is set, otherwise just update state
  const handleTabClick = (tabId) => {
    if (basePath) {
      navigate(`${basePath}/${tabId}`)
    } else {
      setActiveTab(tabId)
    }
  }

  // Update indicator position when active tab changes
  useLayoutEffect(() => {
    const updateIndicator = () => {
      if (activeTab && tabRefs.current[activeTab] && tabsContainerRef.current) {
        const tabElement = tabRefs.current[activeTab]
        const containerRect = tabsContainerRef.current.getBoundingClientRect()
        const tabRect = tabElement.getBoundingClientRect()
        
        setIndicatorStyle({
          left: tabRect.left - containerRect.left,
          width: tabRect.width,
        })
      }
    }
    
    updateIndicator()
    // Also update on window resize
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [activeTab, tabs])

  // Determine what content to render based on tabs
  const renderContent = () => {
    if (tabs.length === 0) {
      return children
    }

    if (typeof children === 'function') {
      return children(activeTab)
    }

    if (typeof children === 'object' && children !== null && !React.isValidElement(children)) {
      return children[activeTab] || null
    }

    return children
  }

  return (
    <div
      className={className}
      style={{
        height: '100%',
        overflowY: scrollable ? 'auto' : 'hidden',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        border: '1px solid #EDEDED',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header with full-width divider */}
      {showHeader && (
        <div
          style={{
            borderBottom: '1px solid #EDEDED',
            flexShrink: 0,
          }}
        >
          {/* Title row */}
          <div
            style={{
              padding: '15px 23px 8px 23px',
              display: 'flex',
              flexDirection: 'row',
              gap: '10px',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-sans, system-ui, sans-serif)',
                fontSize: '18px',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                color: '#000',
              }}
            >
              {title}
            </span>
            {headerRight && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {headerRight}
              </div>
            )}
          </div>

          {/* Tabs navigation */}
          {tabs.length > 0 && (
            <div
              ref={tabsContainerRef}
              style={{
                padding: '0 23px',
                display: 'flex',
                flexDirection: 'row',
                gap: '16px',
                borderBottom: '0.5px solid #E5E5E5',
                position: 'relative',
              }}
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    ref={(el) => (tabRefs.current[tab.id] = el)}
                    onClick={() => handleTabClick(tab.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '12px 0 8px 0',
                      cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '12px',
                      fontWeight: 400,
                      color: isActive ? '#000' : '#6B6B6B',
                      letterSpacing: '-0.01em',
                      position: 'relative',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.target.style.color = '#000'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.target.style.color = '#6B6B6B'
                      }
                    }}
                  >
                    {tab.label}
                  </button>
                )
              })}
              {/* Sliding indicator */}
              <div
                style={{
                  position: 'absolute',
                  bottom: -1,
                  left: indicatorStyle.left,
                  width: indicatorStyle.width,
                  height: '1px',
                  backgroundColor: '#000',
                  transition: 'left 0.2s ease, width 0.2s ease',
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Content area with padding */}
      <div
        style={{
          flex: 1,
          padding: maxWidth ? `32px 23px` : padding,
          overflowY: scrollable ? 'auto' : 'hidden',
          overflowX: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {maxWidth ? (
          <div
            style={{
              maxWidth,
              margin: center ? '0 auto' : undefined,
            }}
          >
            {renderContent()}
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  )
}

export default PageContent

