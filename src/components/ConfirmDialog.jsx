import { useEffect, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import Button from './Button'

/**
 * A reusable confirmation dialog component with customizable text.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the dialog is visible
 * @param {Function} props.onClose - Called when dialog is closed/cancelled
 * @param {Function} props.onConfirm - Called when user clicks the confirm button
 * @param {string} [props.title] - Optional title text
 * @param {string} [props.message="This action cannot be undone."] - The warning message
 * @param {string} [props.cancelText="Cancel"] - Text for the cancel button
 * @param {string} [props.confirmText="Proceed"] - Text for the confirm button
 * @param {boolean} [props.loading=false] - Shows loading state on confirm button
 * @param {string} [props.loadingText] - Text to show when loading (defaults to confirmText)
 */
function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message = "This action cannot be undone.",
  cancelText = "Cancel",
  confirmText = "Proceed",
  loading = false,
  loadingText,
}) {
  const [animationState, setAnimationState] = useState('closed') // 'closed', 'opening', 'open', 'closing'

  // Handle animation states
  useEffect(() => {
    if (isOpen && animationState === 'closed') {
      // Start opening animation
      setAnimationState('opening')
      // Small delay to ensure CSS transition works
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimationState('open')
        })
      })
    } else if (!isOpen && (animationState === 'open' || animationState === 'opening')) {
      // Start closing animation
      setAnimationState('closing')
      setTimeout(() => {
        setAnimationState('closed')
      }, 150)
    }
  }, [isOpen, animationState])

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return
    
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose, loading])

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen])

  // Handle backdrop click
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose()
    }
  }, [onClose, loading])

  // Handle confirm click
  const handleConfirm = useCallback(() => {
    if (!loading) {
      onConfirm()
    }
  }, [onConfirm, loading])

  // Don't render if completely closed
  if (animationState === 'closed') return null

  const isVisible = animationState === 'open'

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center z-[10000]"
      style={{
        backgroundColor: isVisible ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0)',
        transition: 'background-color 150ms ease-out',
        pointerEvents: animationState === 'closing' ? 'none' : 'auto',
      }}
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-[12px] flex flex-col items-center border border-[#E0E0E0] shadow-lg"
        style={{
          width: '320px',
          maxWidth: 'calc(100vw - 40px)',
          padding: '20px',
          gap: '16px',
          transform: isVisible ? 'scale(1)' : 'scale(0.95)',
          opacity: isVisible ? 1 : 0,
          transition: 'transform 150ms ease-out, opacity 150ms ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title (optional) */}
        {title && (
          <h3
            className="font-inter"
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: '#202020',
              letterSpacing: '-0.01em',
              margin: 0,
              textAlign: 'center',
            }}
          >
            {title}
          </h3>
        )}

        {/* Message */}
        <p
          className="font-inter"
          style={{
            fontSize: '13px',
            fontWeight: 400,
            color: '#555555',
            letterSpacing: '-0.01em',
            margin: 0,
            lineHeight: 1.5,
            textAlign: 'center',
          }}
        >
          {message}
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-2" style={{ marginTop: '4px' }}>
          <Button
            variant="white"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant="red"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (loadingText || confirmText) : confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ConfirmDialog

