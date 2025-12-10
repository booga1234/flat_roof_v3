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
  const [enableTransition, setEnableTransition] = useState(false)
  const buttonRefs = useRef([])
  const containerRef = useRef(null)
  const isInitialMountRef = useRef(true)
  
  // Use controlled or uncontrolled pattern
  const selectedValue = value !== undefined ? value : internalValue
  const selectedIndex = options.findIndex(opt => opt === selectedValue)
  
  // Function to update pill position
  const updatePillPosition = useCallback(() => {
    if (buttonRefs.current[selectedIndex] && containerRef.current) {
      const selectedButton = buttonRefs.current[selectedIndex]
      const container = containerRef.current
      
      const buttonRect = selectedButton.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      
      setPillStyle({
        width: buttonRect.width,
        left: buttonRect.left - containerRect.left,
        height: buttonRect.height,
        top: buttonRect.top - containerRect.top
      })
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
      className={`relative inline-flex flex-row items-center gap-[2px] p-[2px] rounded-[6px] w-fit h-8 ${className}`}
      style={{
        backgroundColor: '#EDEDED'
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
            top: `${pillStyle.top}px`,
            height: `${pillStyle.height}px`,
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
        
        return (
          <button
            key={index}
            ref={el => buttonRefs.current[index] = el}
            type="button"
            onClick={() => handleClick(option)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="relative inline-flex flex-row items-center justify-center rounded-[5px] transition-colors duration-200 cursor-pointer border-0 outline-none z-10 flex-shrink-0 h-full"
            style={{
              padding: '0px 10px',
              backgroundColor: isHovered ? '#DADADA' : 'transparent',
              fontFamily: 'Inter',
              fontSize: '12px',
              letterSpacing: '-0.01em',
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

