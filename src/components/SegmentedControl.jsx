import { useState, useRef, useEffect, useCallback } from 'react'

function SegmentedControl({ 
  options = ["Repair", "Re-roof", "Maintenance"], 
  value = "Re-roof",
  onChange,
  className = '',
  ...props 
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [internalValue, setInternalValue] = useState(value)
  const [pillStyle, setPillStyle] = useState({ width: 0, left: 0, height: 0, top: 0 })
  const [containerHeight, setContainerHeight] = useState(null)
  const [enableTransition, setEnableTransition] = useState(false)
  const buttonRefs = useRef([])
  const containerRef = useRef(null)
  const isInitialMountRef = useRef(true)
  
  // Use controlled or uncontrolled pattern
  const selectedValue = value !== undefined ? value : internalValue
  const selectedIndex = options.findIndex(opt => opt === selectedValue)
  
  // Function to update pill position and container height
  const updatePillPosition = useCallback(() => {
    if (buttonRefs.current[selectedIndex] && containerRef.current) {
      const selectedButton = buttonRefs.current[selectedIndex]
      const container = containerRef.current
      
      const buttonRect = selectedButton.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      
      // Calculate container height based on selected button height + container padding (4px total)
      const calculatedHeight = buttonRect.height + 4 // 2px top + 2px bottom padding
      
      setPillStyle({
        width: buttonRect.width,
        left: buttonRect.left - containerRect.left,
        height: buttonRect.height,
        top: buttonRect.top - containerRect.top
      })
      
      // Set container height to prevent shifting (always update to match selected button)
      setContainerHeight(calculatedHeight)
    }
  }, [selectedIndex])
  
  // Set initial position on mount (without transition)
  useEffect(() => {
    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      updatePillPosition()
      // Enable transitions after initial position is set
      requestAnimationFrame(() => {
        setEnableTransition(true)
        isInitialMountRef.current = false
      })
    }, 0)
    return () => clearTimeout(timer)
  }, []) // Only run on mount
  
  // Update pill position when selection changes (after initial mount)
  useEffect(() => {
    if (!isInitialMountRef.current) {
      updatePillPosition()
    }
  }, [selectedIndex, updatePillPosition])
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      updatePillPosition()
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [updatePillPosition])
  
  const handleClick = (option) => {
    if (onChange) {
      onChange(option)
    } else {
      setInternalValue(option)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex flex-row items-center gap-[2px] p-[2px] rounded-[7px] ${className}`}
      style={{
        backgroundColor: '#EDEDED',
        ...(containerHeight ? { height: `${containerHeight}px` } : { minHeight: '29px' })
      }}
      {...props}
    >
      {/* Sliding pill background */}
      {pillStyle.width > 0 && (
        <div
          className={`absolute rounded-[6px] ${enableTransition ? 'transition-all duration-300 ease-out' : ''}`}
          style={{
            width: `${pillStyle.width}px`,
            left: `${pillStyle.left}px`,
            top: `${pillStyle.top || 2}px`,
            height: `${pillStyle.height || 'calc(100% - 4px)'}px`,
            backgroundColor: '#FFFFFF',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      )}
      
      {options.map((option, index) => {
        const isSelected = option === selectedValue
        const isHovered = hoveredIndex === index && !isSelected
        
        // Determine text color
        let textColor = '#5D5D5D' // unselected default
        if (isSelected || isHovered) {
          textColor = '#000000'
        }
        
        // Selected buttons keep 5px vertical padding, unselected have 3.5px (3px shorter total)
        const verticalPadding = isSelected ? 5 : 3.5
        
        return (
          <button
            key={index}
            ref={el => buttonRefs.current[index] = el}
            type="button"
            onClick={() => handleClick(option)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="relative inline-flex flex-row items-center justify-center gap-[10px] rounded-[6px] transition-colors duration-200 cursor-pointer border-0 outline-none z-10"
            style={{
              paddingTop: `${verticalPadding}px`,
              paddingBottom: `${verticalPadding}px`,
              paddingLeft: '10px',
              paddingRight: '10px',
              backgroundColor: isHovered ? '#DADADA' : 'transparent',
              fontFamily: 'Inter',
              fontSize: '12px',
              letterSpacing: '-1%',
              fontWeight: isSelected ? 600 : 500,
              color: textColor
            }}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

export default SegmentedControl

