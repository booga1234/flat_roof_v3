import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

function Popup({
  isOpen,
  onClose,
  children,
  className = '',
  backdropClassName = '',
  closeOnBackdropClick = true,
  zIndex = 9999,
  maxWidth = '600px',
  noShadow = false,
  ...props
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  // Handle mount/unmount and animation states
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      // Small delay to trigger animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true)
        })
      })
    } else {
      setIsVisible(false)
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 300) // Match transition duration
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!shouldRender) return null

  return createPortal(
    <div
      className={`fixed inset-0 flex items-center justify-center overflow-hidden ${backdropClassName}`}
      style={{
        zIndex: zIndex,
        backgroundColor: isVisible ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0)',
        transition: 'background-color 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'background-color',
      }}
      onClick={handleBackdropClick}
      {...props}
    >
      <div
        className={`bg-white rounded-[20px] flex flex-col gap-0 p-0 border border-[#DDDDDD] ${noShadow ? 'shadow-[0_1px_3px_rgba(0,0,0,0.1)]' : 'shadow-[0_3px_10.2px_rgba(0,0,0,0.77)]'} w-full max-h-[90vh] overflow-hidden ${className}`}
        style={{
          borderWidth: '0.5px',
          maxWidth: maxWidth,
          transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(-10px)',
          opacity: isVisible ? 1 : 0,
          transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform, opacity',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}

export default Popup

