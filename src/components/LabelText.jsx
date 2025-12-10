import { Info } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

function LabelText({ children, className = '', helpText, ...props }) {
  const [isHovered, setIsHovered] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const labelRef = useRef(null)
  const tooltipRef = useRef(null)
  const style = {
    letterSpacing: '-1%',
  }

  const labelColor = '#282828'
  const spacing = 5 // 5px gap between tooltip and label

  useEffect(() => {
    if (isHovered && labelRef.current) {
      const updatePosition = () => {
        if (labelRef.current && tooltipRef.current) {
          const labelRect = labelRef.current.getBoundingClientRect()
          const tooltipRect = tooltipRef.current.getBoundingClientRect()
          const tooltipWidth = tooltipRect.width || 240 // fallback to 15rem
          
          // Center horizontally on the label element
          const left = labelRect.left + (labelRect.width / 2) - (tooltipWidth / 2)
          // Position tooltip so its bottom edge is `spacing` pixels above the label's top
          const top = labelRect.top - tooltipRect.height - spacing
          
          setTooltipPosition({ top, left })
        } else if (labelRef.current) {
          // Fallback if tooltip not measured yet - will update on next render
          const labelRect = labelRef.current.getBoundingClientRect()
          const tooltipWidth = 240 // 15rem = 240px
          const estimatedHeight = 100 // will be corrected once tooltip renders
          
          const left = labelRect.left + (labelRect.width / 2) - (tooltipWidth / 2)
          const top = labelRect.top - estimatedHeight - spacing
          
          setTooltipPosition({ top, left })
        }
      }
      
      // Small delay to ensure tooltip is rendered and measured
      const timeoutId = setTimeout(updatePosition, 0)
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      
      return () => {
        clearTimeout(timeoutId)
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isHovered, spacing])

  if (helpText) {
    return (
      <>
        <span
          ref={labelRef}
          className={`relative inline-flex items-center gap-1.5 ${className}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ overflow: 'visible' }}
          {...props}
        >
          <span
            className="font-inter text-[12px]"
            style={{
              ...style,
              fontWeight: 550,
              color: labelColor,
            }}
          >
            {children}
          </span>
          <Info 
            className="w-3 h-3 cursor-help transition-colors flex-shrink-0" 
            style={{ color: labelColor }}
            strokeWidth={2}
          />
        </span>
        
        {isHovered && createPortal(
          <div
            ref={tooltipRef}
            className="fixed z-[10000] pointer-events-none"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
            }}
          >
            <div className="bg-white text-[#111827] text-xs font-inter font-normal px-4 py-3 rounded-lg shadow-md border border-[#E5E7EB] w-[15rem] whitespace-normal">
              {helpText}
            </div>
          </div>,
          document.body
        )}
      </>
    )
  }

  return (
    <span
      className={`font-inter text-[12px] ${className}`}
      style={{
        ...style,
        fontWeight: 550,
        color: labelColor,
      }}
      {...props}
    >
      {children}
    </span>
  )
}

export default LabelText

