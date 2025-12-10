import { useState, useRef, useEffect } from 'react'
import { ChevronsUpDown, Check, Plus, Settings } from 'lucide-react'

function TopbarDropdown({ 
  label = 'Vancouver',
  icon = 'V',
  items = [],
  selectedValue,
  onSelect,
  showIcon = true,
  footerItems = []
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (item) => {
    onSelect?.(item)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-row items-center cursor-pointer bg-transparent border-none hover:bg-[#DFDFDF] transition-colors duration-200 rounded-[7px]"
        style={{
          display: 'flex',
          gap: '8px',
          marginLeft: '8px',
          padding: '5px 8px'
        }}
      >
        {/* Icon Circle */}
        {showIcon && (
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '51px',
              backgroundColor: '#181818',
              border: '1px solid rgba(0, 0, 0, 0.1)'
            }}
          >
            <span
              style={{
                color: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                fontWeight: 700,
                lineHeight: '1',
                letterSpacing: '0'
              }}
            >
              {icon}
            </span>
          </div>
        )}
        <span
          style={{
            color: '#000000',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            letterSpacing: '-0.01em',
            display: 'inline-block'
          }}
        >
          {label}
        </span>
        <ChevronsUpDown size={14} strokeWidth={2.5} style={{ color: '#838383', display: 'inline-block', flexShrink: 0 }} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          style={{
            minWidth: '240px',
            padding: '5px'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '4px 0 6px 31px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '11px',
              fontWeight: 500,
              color: '#6B6B6B',
              letterSpacing: '0.02em'
            }}
          >
            LOCATIONS
          </div>

          {/* Items */}
          <div>
            {items.map((item) => {
              const isSelected = selectedValue === item.value
              return (
                <button
                  key={item.value}
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center gap-2 px-2 py-[5px] rounded-md cursor-pointer bg-transparent border-none hover:bg-[#ECECEC] transition-colors duration-150"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    fontWeight: isSelected ? 500 : 400,
                    color: isSelected ? '#2B2B2B' : '#1A1A1A',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ width: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isSelected && (
                      <Check size={14} strokeWidth={3} style={{ color: '#2B2B2B' }} />
                    )}
                  </div>
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>

          {/* Divider */}
          {footerItems.length > 0 && (
            <div 
              style={{ 
                height: '1px', 
                backgroundColor: '#E5E5E5', 
                margin: '6px -5px' 
              }} 
            />
          )}

          {/* Footer Items */}
          <div>
            {footerItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick?.()
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-2 px-2 py-[5px] rounded-md cursor-pointer bg-transparent border-none hover:bg-[#ECECEC] transition-colors duration-150"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  fontWeight: 400,
                  color: '#1A1A1A',
                  textAlign: 'left'
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TopbarDropdown

