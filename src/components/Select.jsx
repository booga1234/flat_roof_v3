import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronsUpDown } from 'lucide-react'
import { manufacturersAPI, callReasonsAPI } from '../utils/apiService'
import LabelText from './LabelText'

function Select({ 
  label, 
  description,
  options = [], 
  value, 
  onChange, 
  placeholder = 'Select an option',
  className = '',
  fullWidth = true,
  fetchFrom = null, // API endpoint to fetch options from (e.g., 'manufacturers')
  optionValueKey = 'id', // Key to use for option value
  optionLabelKey = 'name', // Key to use for option label
  ...props 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredIndex, setHoveredIndex] = useState(-1)
  const [fetchedOptions, setFetchedOptions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const selectRef = useRef(null)
  const buttonRef = useRef(null)
  const searchInputRef = useRef(null)
  const dropdownRef = useRef(null)
  
  // Use the value prop directly instead of internal state to prevent sync issues
  const selectedValue = value ?? null

  // Fetch options from Xano if fetchFrom is specified
  useEffect(() => {
    if (fetchFrom) {
      setIsLoading(true)
      const fetchOptions = async () => {
        try {
          let data
          // Map common fetchFrom values to API calls
          if (fetchFrom === 'manufacturers') {
            data = await manufacturersAPI.getAll()
          } else if (fetchFrom === 'call-reasons') {
            data = await callReasonsAPI.getAll()
          } else {
            // Generic API call - you can extend this for other endpoints
            const { API_V2_BASE_URL } = await import('../config/api')
            const token = localStorage.getItem('authToken')
            const headers = {
              'Content-Type': 'application/json',
            }
            if (token) {
              headers['Authorization'] = `Bearer ${token}`
            }
            const response = await fetch(`${API_V2_BASE_URL}/${fetchFrom}`, {
              method: 'GET',
              headers,
            })
            data = await response.json()
          }

          // Transform API response to options format
          const items = Array.isArray(data) ? data : (data.items || data[fetchFrom] || data.data || [])
          
          const transformedOptions = items
            .filter(item => item && (item[optionValueKey] !== undefined || item[optionLabelKey] !== undefined))
            .map(item => {
              // Try to find the value and label, with fallbacks
              const value = item[optionValueKey] ?? item.id ?? item.value ?? item[Object.keys(item).find(k => k.toLowerCase().includes('id'))]
              const label = item[optionLabelKey] ?? item.name ?? item.label ?? item.reason ?? item.title ?? item[Object.keys(item).find(k => k.toLowerCase().includes('name') || k.toLowerCase().includes('label'))] ?? String(value)
              
              return {
                value,
                label,
                ...item // Include original item data for potential use
              }
            })
          setFetchedOptions(transformedOptions)
        } catch (error) {
          console.error(`[Select] Error fetching ${fetchFrom}:`, error)
          setFetchedOptions([])
        } finally {
          setIsLoading(false)
        }
      }
      fetchOptions()
    }
  }, [fetchFrom, optionValueKey, optionLabelKey])

  // Use fetched options if fetchFrom is specified, otherwise use provided options
  const availableOptions = fetchFrom ? fetchedOptions : options

  // selectedValue is now derived directly from props, no sync needed

  // Handle opening animation
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      setIsAnimating(true)
      // Force reflow to ensure initial state is applied
      dropdownRef.current.offsetHeight
      // Use double requestAnimationFrame to ensure initial styles are painted first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (dropdownRef.current) {
            dropdownRef.current.style.transform = 'scale(1)'
            dropdownRef.current.style.opacity = '1'
          }
        })
      })
      // Mark animation as complete after transition duration
      const timeout = setTimeout(() => {
        setIsAnimating(false)
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [isOpen])

  // Focus search input when dropdown opens and reset hover state
  useEffect(() => {
    if (isOpen && !isAnimating) {
      if (searchInputRef.current) {
        searchInputRef.current.focus()
      }
      setHoveredIndex(-1) // Reset hover so selected option shows hover style
    }
  }, [isOpen, isAnimating])

  const handleClose = () => {
    if (dropdownRef.current && isOpen) {
      setIsAnimating(true)
      // Ensure dropdown is at full scale before animating out
      dropdownRef.current.style.transform = 'scale(1)'
      dropdownRef.current.style.opacity = '1'
      // Force reflow
      dropdownRef.current.offsetHeight
      // Animate out
      requestAnimationFrame(() => {
        if (dropdownRef.current) {
          dropdownRef.current.style.transform = 'scale(0.95)'
          dropdownRef.current.style.opacity = '0'
        }
      })
      // Wait for animation to complete before unmounting
      setTimeout(() => {
        setIsOpen(false)
        setIsAnimating(false)
        setSearchQuery('')
      }, 100) // Match animation duration
    } else {
      setIsOpen(false)
      setSearchQuery('')
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector('[data-select-dropdown]')
      if (
        selectRef.current && 
        !selectRef.current.contains(event.target) &&
        (!dropdown || !dropdown.contains(event.target))
      ) {
        handleClose()
      }
    }

    const handleScroll = () => {
      if (isOpen) {
        handleClose()
      }
    }

    const handleResize = () => {
      if (isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      window.addEventListener('scroll', handleScroll, true)
      window.addEventListener('resize', handleResize)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
    }
  }, [isOpen])

  const handleSelect = (optionValue) => {
    if (onChange) {
      onChange(optionValue)
    }
    handleClose()
  }

  // Filter options based on search query (search in both label and description)
  const filteredOptions = availableOptions.filter(option => {
    const labelMatch = option.label.toLowerCase().includes(searchQuery.toLowerCase())
    const descriptionMatch = (option.description || option.desc || '').toLowerCase().includes(searchQuery.toLowerCase())
    return labelMatch || descriptionMatch
  })

  const selectedOption = availableOptions.find(opt => opt.value === selectedValue)
  const displayText = selectedOption ? selectedOption.label : (isLoading ? 'Loading...' : placeholder)

  return (
    <div className={`flex flex-col gap-2 items-start relative ${isOpen ? 'z-[1000]' : ''} ${className}`} ref={selectRef} {...props}>
      {(label || description) && (
        <div className="flex flex-col gap-0">
          {label && (
            <label className="flex">
              {typeof label === 'string' ? <LabelText>{label}</LabelText> : label}
            </label>
          )}
          {description && (
            <span 
              className="font-inter text-[12px]"
              style={{
                color: '#9A9A9A',
                letterSpacing: '-0.01em',
                fontWeight: 400,
              }}
            >
              {description}
            </span>
          )}
        </div>
      )}
      <div className={`relative ${fullWidth ? 'w-full' : 'w-[253px]'} ${isOpen ? 'z-[1001]' : ''}`}>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => {
            if (isOpen) {
              handleClose()
            } else {
              setIsOpen(true)
            }
          }}
          className={`w-full flex flex-row items-center justify-between bg-white border outline-none focus:ring-0 text-left font-inter font-medium text-[12px] transition-colors ${isOpen ? 'relative z-[1002]' : ''}`}
          style={{
            boxSizing: 'border-box',
            textAlign: 'left',
            padding: '6px 8px',
            borderRadius: '6px',
            border: '1px solid #D8D8D8',
            borderColor: isOpen ? '#C2C2C2' : '#D8D8D8',
            letterSpacing: '-0.01em',
            fontWeight: 500,
          }}
          onMouseEnter={(e) => {
            if (!isOpen) {
              e.currentTarget.style.borderColor = '#C2C2C2'
            }
          }}
          onMouseLeave={(e) => {
            if (!isOpen) {
              e.currentTarget.style.borderColor = '#D8D8D8'
            }
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.borderColor = '#C2C2C2'
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.borderColor = isOpen ? '#C2C2C2' : '#D8D8D8'
          }}
        >
          <span style={{ color: selectedValue ? '#313131' : '#9A9A9A', fontWeight: selectedValue ? 500 : 500 }}>
            {displayText}
          </span>
          <ChevronsUpDown 
            size={12}
            strokeWidth={1.5}
            className="text-[#6F6F6F] flex-shrink-0"
            style={{ stroke: '#6F6F6F' }}
          />
        </button>

        {isOpen && createPortal(
          <div 
            ref={dropdownRef}
            data-select-dropdown
            className="fixed bg-white rounded-[8px] overflow-hidden" 
            style={{
              top: (buttonRef.current?.getBoundingClientRect().bottom || 0) + 4 + 'px',
              left: (buttonRef.current?.getBoundingClientRect().left || 0) + 'px',
              minWidth: (buttonRef.current?.getBoundingClientRect().width || 253) + 'px',
              zIndex: 99999,
              padding: '5px',
              border: '0.5px solid #E2E2E2',
              boxShadow: '0px 2px 9.3px rgba(0, 0, 0, 0.06)',
              transform: 'scale(0.95)',
              opacity: 0,
              transformOrigin: 'top center',
              transition: 'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* Search Input */}
            <div 
              className="flex flex-row items-center gap-[5px] px-2 py-1.5 bg-white rounded-[6px] border border-[#868686]"
              style={{
                marginBottom: '5px',
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                <path
                  d="M5.5 9.5C7.70914 9.5 9.5 7.70914 9.5 5.5C9.5 3.29086 7.70914 1.5 5.5 1.5C3.29086 1.5 1.5 3.29086 1.5 5.5C1.5 7.70914 3.29086 9.5 5.5 9.5Z"
                  stroke="#282828"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.5 10.5L8 8"
                  stroke="#282828"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="flex-1 outline-none bg-transparent font-inter text-[12px] font-medium"
                style={{
                  letterSpacing: '-0.01em',
                  color: searchQuery ? '#313131' : '#9A9A9A',
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Options List */}
            <div 
              className="overflow-y-auto"
              style={{
                maxHeight: '45rem',
              }}
            >
              {isLoading ? (
                <div 
                  className="flex flex-row items-center justify-center gap-[10px] px-0 py-5"
                >
                  <span 
                    className="font-inter text-[12px] font-medium text-[#757575]"
                    style={{
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Loading...
                  </span>
                </div>
              ) : filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => {
                  const isSelected = selectedValue === option.value
                  const isHovered = hoveredIndex === index
                  // Show hover style if explicitly hovered, or if selected and no other option is hovered
                  const shouldShowHoverStyle = isHovered || (isSelected && hoveredIndex === -1)
                  const hasDescription = option.description || option.desc
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(-1)}
                      className={`w-full flex flex-row items-start gap-[5px] px-2 py-1.5 text-left font-inter text-[12px] transition-colors rounded-[6px] ${
                        shouldShowHoverStyle ? 'bg-[#ECECEC]' : 'bg-white'
                      }`}
                      style={{
                        letterSpacing: '-0.01em',
                        fontWeight: isSelected ? 550 : 500,
                        color: '#282828',
                      }}
                    >
                      <div className="flex items-start flex-shrink-0" style={{ paddingTop: '2px' }}>
                        {isSelected ? (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10 3L4.5 8.5L2 6"
                              stroke="#282828"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <div className="w-3 h-3" />
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5 flex-1">
                        <span>
                          {option.label}
                        </span>
                        {hasDescription && (
                          <span
                            className="font-inter text-[11px]"
                            style={{
                              color: '#9A9A9A',
                              letterSpacing: '-0.01em',
                              fontWeight: 400,
                              lineHeight: 1.4,
                            }}
                          >
                            {option.description || option.desc}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })
              ) : (
                <div 
                  className="flex flex-row items-center justify-center gap-[10px] px-0 py-5"
                >
                  <span 
                    className="font-inter text-[12px] font-medium text-[#757575]"
                    style={{
                      letterSpacing: '-0.01em',
                    }}
                  >
                    No results found.
                  </span>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  )
}

export default Select

