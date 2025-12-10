import { useState, useEffect } from 'react'

/**
 * Toast notification component
 * @param {string} message - The message to display
 * @param {boolean} isVisible - Whether the toast is visible
 * @param {function} onClose - Callback when toast is closed
 * @param {number} duration - Duration in ms before auto-close (0 = no auto-close)
 * @param {string} variant - 'error' (red) or 'success' (green)
 */
function Toast({ message, isVisible, onClose, duration = 5000, variant = 'error' }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true)
      // Small delay to trigger animation after render
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true)
        })
      })
    } else {
      setIsAnimating(false)
      // Wait for exit animation to complete before unmounting
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  // Auto-close after duration
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!shouldRender) return null

  // Variant styles
  const variantStyles = {
    error: 'bg-[#EF4444]',
    success: 'bg-[#73B586]',
  }

  const bgColor = variantStyles[variant] || variantStyles.error

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pointer-events-none"
    >
      <div
        className={`
          pointer-events-auto
          flex items-center gap-3
          ${bgColor}
          text-white 
          px-[15px] py-[10px]
          rounded-xl
          w-auto
          max-w-[600px]
          transition-all duration-300 ease-out
          ${isAnimating 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-full'
          }
        `}
      >
        <p 
          className="flex-1 font-inter text-[14px] font-medium leading-relaxed"
          style={{ letterSpacing: '-0.01em' }}
        >
          {message}
        </p>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:bg-white/10 rounded-md transition-colors duration-150"
          aria-label="Close notification"
        >
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 18 18" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" 
              stroke="white" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Toast

