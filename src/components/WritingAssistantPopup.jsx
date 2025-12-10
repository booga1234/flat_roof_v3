import { useState, useEffect, useRef, Children, isValidElement } from 'react'
import Button from './Button'
import EditIcon from './EditIcon'
import LoadingTextAnimation from './LoadingTextAnimation'

// Helper to extract text from React elements recursively
function extractTextFromElement(element) {
  if (typeof element === 'string') return element
  if (typeof element === 'number') return String(element)
  if (!element) return ''
  
  if (isValidElement(element)) {
    const { children } = element.props || {}
    return extractTextFromElement(children)
  }
  
  if (Array.isArray(element)) {
    return element.map(extractTextFromElement).join('')
  }
  
  return ''
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || ''
const ASSISTANT_ID = import.meta.env.VITE_OPENAI_ASSISTANT_ID || ''

// Helper function to call OpenAI Assistants API
async function callAssistant(userMessage, existingContent = '') {
  const headers = {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
    'OpenAI-Beta': 'assistants=v2'
  }

  // 1. Create a thread
  const threadResponse = await fetch('https://api.openai.com/v1/threads', {
    method: 'POST',
    headers,
    body: JSON.stringify({})
  })
  const thread = await threadResponse.json()
  
  if (!thread.id) {
    throw new Error('Failed to create thread')
  }

  // 2. Add message to thread
  // Include existing content as context if available
  const messageContent = existingContent 
    ? `Current text:\n"${existingContent}"\n\nUser request:\n${userMessage}`
    : userMessage

  await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      role: 'user',
      content: messageContent
    })
  })

  // 3. Run the assistant
  const runResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      assistant_id: ASSISTANT_ID
    })
  })
  const run = await runResponse.json()

  if (!run.id) {
    throw new Error('Failed to create run')
  }

  // 4. Poll for completion
  let runStatus = run.status
  while (runStatus === 'queued' || runStatus === 'in_progress') {
    await new Promise(resolve => setTimeout(resolve, 500)) // Wait 500ms
    
    const statusResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
      method: 'GET',
      headers
    })
    const statusData = await statusResponse.json()
    runStatus = statusData.status
    
    if (runStatus === 'failed' || runStatus === 'cancelled' || runStatus === 'expired') {
      throw new Error(`Run ${runStatus}: ${statusData.last_error?.message || 'Unknown error'}`)
    }
  }

  // 5. Get the messages
  const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
    method: 'GET',
    headers
  })
  const messagesData = await messagesResponse.json()

  // Get the latest assistant message
  const assistantMessage = messagesData.data?.find(m => m.role === 'assistant')
  if (!assistantMessage) {
    throw new Error('No response from assistant')
  }

  // Extract text from the message
  const textContent = assistantMessage.content?.find(c => c.type === 'text')
  return textContent?.text?.value || ''
}

// Small side popup for AI generation input
function GeneratePopup({ isOpen, onClose, onGenerate, isGenerating }) {
  const [inputValue, setInputValue] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const textareaRef = useRef(null)
  const popupRef = useRef(null)

  // Handle open/close with animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsClosing(false)
      setInputValue('')
      // Focus textarea when popup opens
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
        }
      }, 100)
    } else if (isVisible) {
      // Start closing animation
      setIsClosing(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setIsClosing(false)
      }, 150) // Match animation duration
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setInputValue('')
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Handle clicks outside the popup
  useEffect(() => {
    if (!isOpen) return

    let isOpening = true
    // Set a flag to prevent immediate closure
    const openingTimeout = setTimeout(() => {
      isOpening = false
    }, 100)

    const handleClickOutside = (e) => {
      // Don't handle clicks during the opening phase
      if (isOpening) return
      
      // Check if click is outside the popup
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        // Clear input and close
        setInputValue('')
        onClose()
      }
    }

    // Use a delay to avoid immediate closure when opening
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside, true)
    }, 150)

    return () => {
      clearTimeout(openingTimeout)
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside, true)
    }
  }, [isOpen, onClose])

  // Handle generate button click
  const handleGenerate = () => {
    if (!inputValue.trim()) return
    onGenerate(inputValue)
    setInputValue('')
    onClose()
  }

  if (!isVisible) return null

  return (
    <div
      ref={popupRef}
      className={`absolute top-1/2 -translate-y-1/2 right-full mr-[5px] rounded-[15px] border border-[#DDDDDD] shadow-[0_1px_3px_rgba(0,0,0,0.15)] z-[60] flex flex-col ${isClosing ? 'animate-popup-out' : 'animate-popup-in'}`}
      style={{
        backgroundColor: '#FBFBFB',
        borderWidth: '0.5px',
        width: '20rem',
        minHeight: '8rem',
        maxHeight: '35rem',
      }}
    >
      {/* Scrollable textarea area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="What would you like to generate?"
          className="w-full px-3 py-2.5 bg-transparent border-0 rounded-t-[15px] outline-none focus:ring-0 text-left font-inter font-medium text-[12px] placeholder:font-medium resize-none"
          style={{
            boxSizing: 'border-box',
            textAlign: 'left',
            letterSpacing: '-0.01em',
            color: '#282828',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            fieldSizing: 'content',
            minHeight: '4rem',
          }}
        />
      </div>
      
      {/* Fixed button footer */}
      <div 
        className="flex justify-end px-3 py-2 rounded-b-[15px]"
        style={{ backgroundColor: '#FBFBFB' }}
      >
        <Button 
          variant="dark" 
          onClick={handleGenerate}
          disabled={!inputValue.trim() || isGenerating}
        >
          Generate
        </Button>
      </div>
    </div>
  )
}

const ANIMATION_DURATION = 200

function WritingAssistantPopup({ isOpen, onClose, onSave, initialValue = '', onLoadingChange, label = 'text' }) {
  const [textValue, setTextValue] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratePopupOpen, setIsGeneratePopupOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const textareaRef = useRef(null)
  const modalRef = useRef(null)
  const generateButtonRef = useRef(null)

  // Format the title - "Edit" + lowercase label
  const labelText = typeof label === 'string' ? label : extractTextFromElement(label) || 'text'
  const title = `Edit ${labelText.toLowerCase()}`

  // Handle open/close with animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsClosing(false)
      setTextValue(initialValue || '')
      setIsGeneratePopupOpen(false)
      // Focus textarea when popup opens and place cursor at the end
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          // Move cursor to the end of the text
          const length = textareaRef.current.value.length
          textareaRef.current.selectionStart = length
          textareaRef.current.selectionEnd = length
        }
      }, 100)
    } else if (isVisible) {
      // Start closing animation
      setIsClosing(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setIsClosing(false)
      }, ANIMATION_DURATION)
      return () => clearTimeout(timer)
    }
  }, [isOpen, initialValue])

  // Handle escape key
  useEffect(() => {
    if (!isVisible) return
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (isGeneratePopupOpen) {
          setIsGeneratePopupOpen(false)
        } else {
          handleClose()
        }
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isVisible, isGeneratePopupOpen])

  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, ANIMATION_DURATION)
  }

  // Handle generate with AI
  const handleGenerate = async (prompt) => {
    if (isGenerating) return
    
    setIsGenerating(true)
    
    try {
      const response = await callAssistant(prompt, textValue)
      setTextValue(response)
    } catch (err) {
      console.error('Assistant error:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle save button click
  const handleSave = () => {
    const valueToSave = textValue
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      if (onSave) {
        onSave(valueToSave)
      }
    }, ANIMATION_DURATION)
  }

  // Handle cancel button click
  const handleCancel = () => {
    handleClose()
  }

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center writing-assistant-backdrop ${isClosing ? 'writing-assistant-backdrop-closing' : ''}`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-[20px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col writing-assistant-content ${isClosing ? 'writing-assistant-closing' : ''}`}
        style={{
          width: '600px',
          maxWidth: 'calc(100vw - 48px)',
          maxHeight: 'calc(100vh - 48px)',
          padding: '15px 20px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <h2 
            className="font-inter font-semibold text-[18px]"
            style={{ color: '#1a1a1a', letterSpacing: '-0.02em' }}
          >
            {title}
          </h2>
          <div className="relative" ref={generateButtonRef}>
            <Button
              variant="clear"
              onClick={() => setIsGeneratePopupOpen(!isGeneratePopupOpen)}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <div className="twinkle-star">
                  <span className="shoot1"></span>
                  <span className="shoot2"></span>
                  <span className="shoot3"></span>
                  <span className="shoot4"></span>
                </div>
              ) : (
                <EditIcon />
              )}
              Generate
            </Button>
            <GeneratePopup
              isOpen={isGeneratePopupOpen}
              onClose={() => setIsGeneratePopupOpen(false)}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>
        </div>

        {/* Textarea - styled like Textarea.jsx but without icon */}
        <div className="flex-1 min-h-0 pb-3">
          <div className="relative w-full h-full">
            <textarea
              ref={textareaRef}
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="You are a helpful assistant..."
              className="input-focus-outline flex flex-row items-start px-2 py-1.5 gap-2.5 w-full h-full bg-white border rounded-lg outline-none focus:ring-0 text-left shadow-[0_1px_2px_rgba(0,0,0,0.02)] font-inter font-medium text-[12px] placeholder:font-medium resize-none"
              style={{
                boxSizing: 'border-box',
                textAlign: 'left',
                borderColor: '#D8D8D8',
                borderWidth: '1px',
                letterSpacing: '-0.01em',
                color: isGenerating ? 'transparent' : '#282828',
                minHeight: '280px',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#ABABAB'
                e.target.style.borderWidth = '1.2px'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#D8D8D8'
                e.target.style.borderWidth = '1px'
              }}
              disabled={isGenerating}
            />
            {isGenerating && (
              <div 
                className="absolute pointer-events-none bg-white"
                style={{
                  top: '1px',
                  left: '1px',
                  right: '1px',
                  bottom: '1px',
                  borderRadius: '7px',
                  overflow: 'hidden',
                }}
              >
                <LoadingTextAnimation lines={8} />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-[5px] pt-2">
          <Button 
            variant="white" 
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button 
            variant="dark" 
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}

export default WritingAssistantPopup
