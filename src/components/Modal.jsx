import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ArrowLeft } from 'lucide-react'

function Modal({
  title,
  onClose,
  children,
  footer,
  backButton,
  width = '35rem',
  className = '',
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(true)

  // Handle mount/unmount and animation states
  useEffect(() => {
    // Small delay to trigger animation
    setShouldRender(true)
    // Use setTimeout to ensure the state update happens after render
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 10) // Small delay to allow render

    return () => {
      clearTimeout(timer)
      setIsVisible(false)
      const unmountTimer = setTimeout(() => {
        setShouldRender(false)
      }, 300) // Match transition duration
      return () => clearTimeout(unmountTimer)
    }
  }, [])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  if (!shouldRender) return null

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden z-[9999]"
      style={{
        backgroundColor: isVisible ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0)',
        transition: 'background-color 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'background-color',
      }}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-[20px] flex flex-col border border-[#DDDDDD] shadow-[0_1px_3px_rgba(0,0,0,0.1)] ${className}`}
        style={{
          borderWidth: '0.5px',
          width: width,
          maxWidth: 'calc(100vw - 40px)',
          maxHeight: '80dvh',
          transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(-10px)',
          opacity: isVisible ? 1 : 1, // Always visible, only animate transform
          transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}

// Modal.Pages component for page transitions
// This is the content area where pages render
// Usage:
// <Modal.Pages>
//   {page === "search" && <SearchPage />}
//   {page === "addContact" && <AddContactPage />}
//   {page === "addProperty" && <AddPropertyPage />}
// </Modal.Pages>
//
// For smooth transitions, wrap each page in a div with the 'modal-page' class for animated pages,
// or 'modal-page-static' for the initial page that shouldn't animate:
// {page === "search" && (
//   <div key="search" className="modal-page-static">
//     <SearchPage />
//   </div>
// )}
// {page === "addContact" && (
//   <div key="addContact" className="modal-page">
//     <AddContactPage />
//   </div>
// )}
function ModalPages({ children, className = '' }) {
  return (
    <div 
      className={`relative flex flex-col ${className}`} 
      style={{ 
        padding: '25px 25px 25px 25px', 
        gap: '25px',
        minHeight: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {children}
    </div>
  )
}

// Attach Pages as a subcomponent
Modal.Pages = ModalPages

export default Modal

