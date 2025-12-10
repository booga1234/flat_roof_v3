import React, { useEffect, useState, useCallback, useRef, createContext, useContext } from 'react'
import { createPortal } from 'react-dom'
import { X, ArrowLeft } from 'lucide-react'
import Button from './Button'

// Context to share modal transition state with Modal.Pages and expose handleClose
const ModalTransitionContext = createContext(null)

// Hook to access modal close function from child components
export const useModalClose = () => {
  const context = useContext(ModalTransitionContext)
  return context?.handleClose || (() => {})
}

// Animation durations
const NORMAL_DURATION = 200 // Normal open/close
const PAGE_DURATION = 120   // Faster page transitions

function Modal({
  title,
  onClose,
  children,
  footer,
  backButton,
  width = '35rem',
  className = '',
}) {
  const [animationState, setAnimationState] = useState('open') // 'open', 'closing', 'page-closing', 'page-opening'
  const isPageTransitionRef = useRef(false)
  const isClosingRef = useRef(false) // Prevent double-close

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Handle close with animation
  const handleClose = useCallback(() => {
    // Prevent multiple close triggers
    if (isClosingRef.current) return
    isClosingRef.current = true
    
    isPageTransitionRef.current = false
    setAnimationState('closing')
    setTimeout(() => {
      onClose()
    }, NORMAL_DURATION)
  }, [onClose])

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [handleClose])

  // Handle page transition: close → update → open (faster)
  const triggerPageTransition = useCallback(() => {
    if (animationState !== 'open') return
    
    isPageTransitionRef.current = true
    setAnimationState('page-closing')
    
    setTimeout(() => {
      setAnimationState('page-opening')
      setTimeout(() => {
        setAnimationState('open')
        isPageTransitionRef.current = false
      }, PAGE_DURATION)
    }, PAGE_DURATION)
  }, [animationState])

  const transitionContextValue = {
    triggerPageTransition,
    isTransitioning: animationState.includes('closing') || animationState.includes('opening'),
    handleClose, // Expose handleClose to children
  }

  // Determine animation classes
  const isClosing = animationState === 'closing' || animationState === 'page-closing'
  const isPageTransition = animationState.startsWith('page-')

  return createPortal(
    <ModalTransitionContext.Provider value={transitionContextValue}>
      <div
        className={`fixed inset-0 flex items-center justify-center overflow-hidden z-[9999] modal-backdrop ${isClosing ? (isPageTransition ? 'modal-backdrop-page-closing' : 'modal-backdrop-closing') : ''}`}
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          pointerEvents: isClosing ? 'none' : 'auto', // Prevent clicks during close animation
        }}
        onClick={handleBackdropClick}
      >
        <div
          className={`bg-white rounded-[15px] flex flex-col border border-[#DDDDDD] shadow-[0_1px_3px_rgba(0,0,0,0.15)] modal-content ${isClosing ? (isPageTransition ? 'modal-page-closing' : 'modal-closing') : ''} ${className}`}
          style={{
            borderWidth: '0.5px',
            width: width,
            maxWidth: 'calc(100vw - 40px)',
            height: '65dvh',
            minHeight: '40rem',
            maxHeight: '65dvh',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </ModalTransitionContext.Provider>,
    document.body
  )
}

// Simple Modal.Pages - just renders children with transition animation
function ModalPages({ children, className = '' }) {
  const transitionContext = useContext(ModalTransitionContext)
  const currentKeyRef = useRef(null)
  const transitionContentRef = useRef(null)

  // Find the active child
  const activeChild = React.Children.toArray(children).find(child => 
    child !== null && child !== undefined && child !== false && child !== ''
  )

  // Get key from child
  const getKey = (child) => {
    if (!child) return null
    if (child.key) return child.key
    if (child.props?.children) {
      const first = React.Children.toArray(child.props.children)[0]
      if (first?.key) return first.key
    }
    return child.type?.name || String(child.type)
  }

  const newKey = getKey(activeChild)
  
  // Detect page change and trigger transition
  useEffect(() => {
    // First render - just set the key
    if (currentKeyRef.current === null) {
      currentKeyRef.current = newKey
      return
    }

    // Same page - no transition needed
    if (newKey === currentKeyRef.current) {
      return
    }

    // Page changed - trigger transition
    if (transitionContext?.triggerPageTransition) {
      transitionContext.triggerPageTransition()
    }
    
    // Update key after triggering transition
    currentKeyRef.current = newKey
  }, [newKey, transitionContext])

  // Always render the active child from parent
  // No caching - parent controls what's displayed
  return (
    <div 
      className={`relative flex flex-col ${className}`} 
      style={{ 
        paddingTop: '15px',
        paddingBottom: '15px',
        paddingLeft: '20px',
        paddingRight: '20px',
        gap: '25px',
        flex: 1,
        minHeight: 0,
        overflow: 'auto',
        overflowX: 'hidden',
      }}
    >
      {activeChild}
    </div>
  )
}

Modal.Pages = ModalPages

// Cancel button that uses animated close
function ModalCancelButton({ children = 'Cancel', onClick, ...props }) {
  const handleClose = useModalClose()
  
  const handleClick = () => {
    // Run any additional onClick handler first
    if (onClick) {
      onClick()
    }
    // Then trigger animated close
    handleClose()
  }
  
  return (
    <Button variant="white" onClick={handleClick} {...props}>
      {children}
    </Button>
  )
}

Modal.CancelButton = ModalCancelButton

export default Modal
