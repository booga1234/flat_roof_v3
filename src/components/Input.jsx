import { useState, useRef, useEffect } from 'react'
import { NumericFormat, PatternFormat } from 'react-number-format'
import { Eye, EyeOff } from 'lucide-react'
import LabelText from './LabelText'
import IconButton from './IconButton'
import DiagonalChevronsIcon from './DiagonalChevronsIcon'
import EditIcon from './EditIcon'
import WritingAssistantPopup from './WritingAssistantPopup'
import LoadingTextAnimation from './LoadingTextAnimation'
import Button from './Button'
import { generateText } from '../utils/aiProxy'

// Quick generate side popup component
function QuickGeneratePopup({ isOpen, onClose, onGenerate, existingContent }) {
  const [inputValue, setInputValue] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const textareaRef = useRef(null)
  const popupRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsClosing(false)
      setInputValue('')
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
        }
      }, 100)
    } else if (isVisible) {
      setIsClosing(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setIsClosing(false)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

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

  useEffect(() => {
    if (!isOpen) return

    let isOpening = true
    const openingTimeout = setTimeout(() => {
      isOpening = false
    }, 100)

    const handleClickOutside = (e) => {
      if (isOpening) return
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setInputValue('')
        onClose()
      }
    }

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside, true)
    }, 150)

    return () => {
      clearTimeout(openingTimeout)
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside, true)
    }
  }, [isOpen, onClose])

  const handleGenerate = () => {
    if (!inputValue.trim()) return
    onGenerate(inputValue, existingContent)
    setInputValue('')
    onClose()
  }

  if (!isVisible) return null

  const isEditMode = existingContent && existingContent.trim().length > 0

  return (
    <div
      ref={popupRef}
      className={`absolute top-1/2 -translate-y-1/2 right-full mr-[5px] rounded-[15px] border border-[#DDDDDD] shadow-[0_1px_3px_rgba(0,0,0,0.15)] z-50 flex flex-col ${isClosing ? 'animate-popup-out' : 'animate-popup-in'}`}
      style={{
        backgroundColor: '#FBFBFB',
        borderWidth: '0.5px',
        width: '20rem',
        minHeight: '8rem',
        maxHeight: '35rem',
      }}
    >
      <div className="flex-1 overflow-y-auto min-h-0">
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isEditMode ? "What would you like to change?" : "What would you like to write?"}
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
      
      <div 
        className="flex justify-end px-3 py-2 rounded-b-[15px]"
        style={{ backgroundColor: '#FBFBFB' }}
      >
        <Button 
          variant="dark" 
          onClick={handleGenerate}
          disabled={!inputValue.trim()}
        >
          {isEditMode ? 'Update' : 'Create'}
        </Button>
      </div>
    </div>
  )
}

function Input({ label, description, placeholder = 'Enter a user friendly name', type = 'text', className = '', fullWidth = true, price = false, variant = 'default', error = '', disabled = false, onKeyDown, onPaste, onChange, value, ...props }) {
  const [isWritingAssistantOpen, setIsWritingAssistantOpen] = useState(false)
  const [isQuickGenerateOpen, setIsQuickGenerateOpen] = useState(false)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const inputWidthClass = fullWidth ? 'w-full' : 'w-[253px]'
  
  // Rounded variant - floating label input with pill shape
  if (variant === 'rounded') {
    const hasValue = value && value.length > 0
    const isActive = isFocused || hasValue
    const hasError = error && error.length > 0
    const isPassword = type === 'password'
    
    // Extract event handlers that we manage ourselves
    const { onFocus: propOnFocus, onBlur: propOnBlur, ...restProps } = props
    
    // Determine border color based on state
    const getBorderColor = () => {
      if (disabled) return 'border-[#E5E5E5]'
      if (hasError) return 'border-[#DC2626]'
      if (isFocused) return 'border-[#3B82F6]'
      return 'border-[#D8D8D8] hover:border-[#B8B8B8]'
    }
    
    // Determine label color based on state
    const getLabelColor = () => {
      if (disabled) return 'text-[#B8B8B8]'
      if (hasError) return 'text-[#DC2626]'
      if (isFocused) return 'text-[#3B82F6]'
      return 'text-[#9A9A9A]'
    }
    
    // Determine box-shadow color based on state
    const getBoxShadow = () => {
      if (disabled) return 'none'
      if (hasError) return '0 0 0 0.5px #DC2626'
      if (isFocused) return '0 0 0 0.5px #3B82F6'
      return 'none'
    }
    
    return (
      <div className={`flex flex-col ${inputWidthClass} ${className}`}>
        <div className="relative">
          <input
            type={isPassword && showPassword ? 'text' : type}
            value={value}
            onChange={disabled ? undefined : onChange}
            onKeyDown={disabled ? undefined : onKeyDown}
            onPaste={disabled ? undefined : onPaste}
            placeholder=" "
            disabled={disabled}
            className={`peer w-full h-[54px] ${isPassword ? 'pr-[50px]' : 'px-[20px]'} pl-[20px] pt-[17px] pb-[17px] border-[1px] rounded-full outline-none font-inter text-[15px] transition-all duration-200 ${getBorderColor()} ${disabled ? 'bg-[#F5F5F5] cursor-not-allowed' : 'bg-white'}`}
            style={{
              letterSpacing: '-0.01em',
              color: disabled ? '#9A9A9A' : '#282828',
              boxShadow: getBoxShadow(),
            }}
            onFocus={disabled ? undefined : (e) => {
              setIsFocused(true)
              if (propOnFocus) propOnFocus(e)
            }}
            onBlur={disabled ? undefined : (e) => {
              setIsFocused(false)
              if (propOnBlur) propOnBlur(e)
            }}
            {...restProps}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-[16px] top-1/2 -translate-y-1/2 p-1 text-[#9A9A9A] hover:text-[#282828] transition-colors duration-200 outline-none focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff size={18} strokeWidth={1.5} />
              ) : (
                <Eye size={18} strokeWidth={1.5} />
              )}
            </button>
          )}
          <label
            className={`absolute left-[16px] z-10 font-inter transition-all duration-200 pointer-events-none bg-white px-[6px] ${
              isActive
                ? 'top-0 -translate-y-1/2 text-[12px]'
                : 'top-1/2 -translate-y-1/2 text-[15px]'
            } ${getLabelColor()}`}
            style={{
              letterSpacing: '-0.01em',
            }}
          >
            {label || placeholder}
          </label>
        </div>
        {hasError && (
          <div className="flex items-center gap-[6px] mt-[8px] ml-[8px]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="8" fill="#DC2626"/>
              <path d="M8 4V9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="8" cy="11.5" r="0.75" fill="white"/>
            </svg>
            <span className="font-inter text-[13px] text-[#DC2626]" style={{ letterSpacing: '-0.01em' }}>
              {error}
            </span>
          </div>
        )}
      </div>
    )
  }
  
  // Extract numeric value from formatted string
  const getNumericValue = (str) => {
    if (!str) return ''
    return String(str).replace(/[^0-9]/g, '')
  }
  
  // Format number with thousands separators
  const formatNumber = (numStr) => {
    const numeric = getNumericValue(numStr)
    if (!numeric) return ''
    return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
  
  // Handle value change for price input (using react-number-format)
  const handlePriceValueChange = (values) => {
    const { floatValue } = values
    // Convert to string for consistency with existing API
    const numericValue = floatValue !== undefined ? String(floatValue) : ''
    
    if (onChange) {
      // Create a synthetic event-like object
      const syntheticEvent = {
        target: { value: numericValue },
        currentTarget: { value: numericValue }
      }
      onChange(syntheticEvent)
    }
  }
  
  // Handle value change for number input (using react-number-format)
  const handleNumberValueChange = (values) => {
    const { floatValue } = values
    const numericValue = floatValue !== undefined ? String(floatValue) : ''
    
    if (onChange) {
      const syntheticEvent = {
        target: { value: numericValue },
        currentTarget: { value: numericValue }
      }
      onChange(syntheticEvent)
    }
  }
  
  // Handle phone number value change (using PatternFormat)
  const handlePhoneValueChange = (values) => {
    const { value: formattedValue } = values
    // Extract only digits for backend storage (e.g., "13604322345")
    // Backend stores as digits only without formatting
    const numericValue = formattedValue ? formattedValue.replace(/[^0-9]/g, '') : ''
    
    if (onChange) {
      const syntheticEvent = {
        target: { value: numericValue },
        currentTarget: { value: numericValue }
      }
      onChange(syntheticEvent)
    }
  }

  // Handle input change for regular text inputs
  const handleInputChange = (e) => {
    if (onChange) onChange(e)
  }
  
  
  // Format display value for number inputs (non-price)
  const displayValue = (() => {
    if (type === 'number' && value !== undefined && value !== null && value !== '') {
      return formatNumber(String(value))
    }
    return value
  })()
  
  // For price inputs, use NumericFormat
  if (price) {
    const numericValue = value ? parseFloat(String(value)) : 0
    
    // Handle focus to select all when value is 0, so typing replaces zeros
    const handleFocus = (e) => {
      if (numericValue === 0) {
        e.target.select()
      }
      e.target.style.borderColor = '#ABABAB'
      e.target.style.borderWidth = '1.2px'
      if (props.onFocus) props.onFocus(e)
    }
    
    const handleBlur = (e) => {
      e.target.style.borderColor = '#D8D8D8'
      e.target.style.borderWidth = '1px'
      if (props.onBlur) props.onBlur(e)
    }
    
    return (
      <div className={`flex flex-col gap-2 items-start ${className}`}>
        {(label || description) && (
          <div className="flex flex-col gap-0">
            {label && (
              <label className="flex">
                <LabelText>{label}</LabelText>
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
        <NumericFormat
          thousandSeparator=","
          prefix="$"
          decimalScale={2}
          fixedDecimalScale={true}
          allowNegative={false}
          value={numericValue}
          onValueChange={disabled ? undefined : handlePriceValueChange}
          onKeyDown={disabled ? undefined : onKeyDown}
          onPaste={disabled ? undefined : onPaste}
          onFocus={disabled ? undefined : handleFocus}
          onBlur={disabled ? undefined : handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`input-focus-outline flex flex-row items-center px-[12px] pt-[6px] pb-[6px] gap-2.5 ${inputWidthClass} border rounded-[8px] outline-none focus:ring-0 text-left shadow-[0_1px_2px_rgba(0,0,0,0.02)] font-inter font-medium text-[12px] placeholder:font-medium ${disabled ? 'bg-[#F5F5F5] cursor-not-allowed' : 'bg-white'}`}
          style={{
            boxSizing: 'border-box',
            textAlign: 'left',
            borderColor: disabled ? '#E5E5E5' : '#D8D8D8',
            borderWidth: '1px',
            letterSpacing: '-0.01em',
            color: disabled ? '#9A9A9A' : '#282828',
          }}
          {...props}
        />
      </div>
    )
  }
  
  // For number inputs (non-price), use NumericFormat without prefix
  if (type === 'number') {
    const numericValue = value ? parseFloat(String(value)) : undefined
    
    return (
      <div className={`flex flex-col gap-2 items-start ${className}`}>
        {(label || description) && (
          <div className="flex flex-col gap-0">
            {label && (
              <label className="flex">
                <LabelText>{label}</LabelText>
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
        <NumericFormat
          thousandSeparator=","
          allowNegative={false}
          value={numericValue}
          onValueChange={disabled ? undefined : handleNumberValueChange}
          onKeyDown={disabled ? undefined : onKeyDown}
          onPaste={disabled ? undefined : onPaste}
          placeholder={placeholder}
          disabled={disabled}
          className={`input-focus-outline flex flex-row items-center px-[12px] pt-[6px] pb-[6px] gap-2.5 ${inputWidthClass} border rounded-[8px] outline-none focus:ring-0 text-left shadow-[0_1px_2px_rgba(0,0,0,0.02)] font-inter font-medium text-[12px] placeholder:font-medium ${disabled ? 'bg-[#F5F5F5] cursor-not-allowed' : 'bg-white'}`}
          style={{
            boxSizing: 'border-box',
            textAlign: 'left',
            borderColor: disabled ? '#E5E5E5' : '#D8D8D8',
            borderWidth: '1px',
            letterSpacing: '-0.01em',
            color: disabled ? '#9A9A9A' : '#282828',
          }}
          onFocus={disabled ? undefined : (e) => {
            e.target.style.borderColor = '#ABABAB'
            e.target.style.borderWidth = '1.2px'
            if (props.onFocus) props.onFocus(e)
          }}
          onBlur={disabled ? undefined : (e) => {
            e.target.style.borderColor = '#D8D8D8'
            e.target.style.borderWidth = '1px'
            if (props.onBlur) props.onBlur(e)
          }}
          {...props}
        />
      </div>
    )
  }
  
  // Handle quick generate
  const handleQuickGenerate = async (prompt, existingContent) => {
    setIsAiLoading(true)
    try {
      const response = await generateText(prompt, existingContent)
      if (onChange) {
        const syntheticEvent = {
          target: { value: response },
          currentTarget: { value: response }
        }
        onChange(syntheticEvent)
      }
    } catch (err) {
      console.error('Assistant error:', err)
    } finally {
      setIsAiLoading(false)
    }
  }

  // For textarea inputs
  if (type === 'textarea') {
    return (
      <div className={`flex flex-col gap-2 items-start ${className}`}>
        <div className={`flex flex-row items-center justify-between ${fullWidth ? 'w-full' : inputWidthClass}`}>
          {(label || description) && (
            <div className="flex flex-col gap-0">
              {label && (
                <label className="flex">
                  <LabelText>{label}</LabelText>
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
          {/* Quick generate button next to label */}
          <div className="relative">
            <IconButton 
              isActive={isQuickGenerateOpen}
              onClick={(e) => {
                e.stopPropagation()
                if (!isAiLoading) {
                  setIsQuickGenerateOpen(true)
                }
              }}
              style={(isAiLoading || isQuickGenerateOpen) ? { backgroundColor: '#ECECEC' } : undefined}
              disabled={isAiLoading}
            >
              {isAiLoading ? (
                <div className="twinkle-star">
                  <span className="shoot1"></span>
                  <span className="shoot2"></span>
                  <span className="shoot3"></span>
                  <span className="shoot4"></span>
                </div>
              ) : (
                <EditIcon />
              )}
            </IconButton>
            <QuickGeneratePopup
              isOpen={isQuickGenerateOpen}
              onClose={() => setIsQuickGenerateOpen(false)}
              onGenerate={handleQuickGenerate}
              existingContent={value || ''}
            />
          </div>
        </div>
        <div className={`group relative ${fullWidth ? 'w-full' : inputWidthClass}`}>
          <textarea
            placeholder={placeholder}
            value={value}
            disabled={disabled || isAiLoading}
            className={`input-focus-outline flex flex-row items-start px-[12px] pt-[6px] pb-[6px] pr-8 gap-2.5 w-full min-h-[80px] border rounded-[8px] outline-none focus:ring-0 text-left shadow-[0_1px_2px_rgba(0,0,0,0.02)] font-inter font-medium text-[12px] placeholder:font-medium resize-none ${disabled || isAiLoading ? 'bg-[#F5F5F5] cursor-not-allowed' : 'bg-white'}`}
            style={{
              boxSizing: 'border-box',
              textAlign: 'left',
              borderColor: disabled ? '#E5E5E5' : '#D8D8D8',
              borderWidth: '1px',
              letterSpacing: '-0.01em',
              color: isAiLoading ? 'transparent' : (disabled ? '#9A9A9A' : '#282828'),
            }}
            onFocus={disabled ? undefined : (e) => {
              e.target.style.borderColor = '#ABABAB'
              e.target.style.borderWidth = '1.2px'
              if (props.onFocus) props.onFocus(e)
            }}
            onBlur={disabled ? undefined : (e) => {
              e.target.style.borderColor = '#D8D8D8'
              e.target.style.borderWidth = '1px'
              if (props.onBlur) props.onBlur(e)
            }}
            onChange={disabled ? undefined : handleInputChange}
            onKeyDown={disabled ? undefined : onKeyDown}
            onPaste={disabled ? undefined : onPaste}
            {...props}
          />
          {isAiLoading && (
            <div className="absolute inset-[1px] flex items-start rounded-[5px] pointer-events-none overflow-hidden bg-white">
              <LoadingTextAnimation lines={3} />
            </div>
          )}
          {/* Icon button positioned at bottom-right corner inside textarea */}
          <div className="absolute bottom-1.5 right-1.5">
            <IconButton 
              isActive={isWritingAssistantOpen}
              onClick={(e) => {
                e.stopPropagation()
                if (!isAiLoading) {
                  setIsWritingAssistantOpen(true)
                }
              }}
              style={(isAiLoading || isWritingAssistantOpen) ? { backgroundColor: '#ECECEC' } : undefined}
              disabled={isAiLoading}
              className="group-hover:bg-[#EDEDED]"
            >
              <DiagonalChevronsIcon />
            </IconButton>
          </div>
        </div>
        <WritingAssistantPopup
          isOpen={isWritingAssistantOpen}
          onClose={() => setIsWritingAssistantOpen(false)}
          onSave={(newValue) => {
            if (onChange) {
              const syntheticEvent = {
                target: { value: newValue },
                currentTarget: { value: newValue }
              }
              onChange(syntheticEvent)
            }
          }}
          initialValue={value || ''}
          onLoadingChange={(loading) => setIsAiLoading(loading)}
          label={label || 'text'}
        />
      </div>
    )
  }
  
  // For phone inputs (type="tel"), use PatternFormat
  if (type === 'tel') {
    // Get the numeric value from the stored value (backend stores as "13604322345")
    // Extract only digits - backend stores 11 digits with country code
    const phoneDigits = value ? String(value).replace(/[^0-9]/g, '') : ''
    
    return (
      <div className={`flex flex-col gap-2 items-start ${className}`}>
        {(label || description) && (
          <div className="flex flex-col gap-0">
            {label && (
              <label className="flex">
                <LabelText>{label}</LabelText>
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
        <PatternFormat
          format="+1 (###) ###-####"
          mask="_"
          allowEmptyFormatting
          value={phoneDigits}
          onValueChange={disabled ? undefined : handlePhoneValueChange}
          onKeyDown={disabled ? undefined : onKeyDown}
          onPaste={disabled ? undefined : onPaste}
          placeholder={placeholder || "+1 (XXX) XXX-XXXX"}
          disabled={disabled}
          className={`input-focus-outline flex flex-row items-center px-[12px] pt-[6px] pb-[6px] gap-2.5 ${inputWidthClass} border rounded-[8px] outline-none focus:ring-0 text-left shadow-[0_1px_2px_rgba(0,0,0,0.02)] font-inter font-medium text-[12px] placeholder:font-medium ${disabled ? 'bg-[#F5F5F5] cursor-not-allowed' : 'bg-white'}`}
          style={{
            boxSizing: 'border-box',
            textAlign: 'left',
            borderColor: disabled ? '#E5E5E5' : '#D8D8D8',
            borderWidth: '1px',
            letterSpacing: '-0.01em',
            color: disabled ? '#9A9A9A' : '#282828',
          }}
          onFocus={disabled ? undefined : (e) => {
            e.target.style.borderColor = '#ABABAB'
            e.target.style.borderWidth = '1.2px'
            if (props.onFocus) props.onFocus(e)
          }}
          onBlur={disabled ? undefined : (e) => {
            e.target.style.borderColor = '#D8D8D8'
            e.target.style.borderWidth = '1px'
            if (props.onBlur) props.onBlur(e)
          }}
          {...props}
        />
      </div>
    )
  }
  
  // For regular text inputs
  return (
    <div className={`flex flex-col gap-2 items-start ${className}`}>
      {(label || description) && (
        <div className="flex flex-col gap-0">
          {label && (
            <label className="flex">
              <LabelText>{label}</LabelText>
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
      <input
        type={type}
        placeholder={placeholder}
        value={displayValue}
        disabled={disabled}
        className={`input-focus-outline flex flex-row items-center px-[12px] pt-[6px] pb-[6px] gap-2.5 ${inputWidthClass} border rounded-[8px] outline-none focus:ring-0 text-left shadow-[0_1px_2px_rgba(0,0,0,0.02)] font-inter font-medium text-[12px] placeholder:font-medium ${disabled ? 'bg-[#F5F5F5] cursor-not-allowed' : 'bg-white'}`}
        style={{
          boxSizing: 'border-box',
          textAlign: 'left',
          borderColor: disabled ? '#E5E5E5' : '#D8D8D8',
          borderWidth: '1px',
          letterSpacing: '-0.01em',
          color: disabled ? '#9A9A9A' : '#282828',
        }}
        onFocus={disabled ? undefined : (e) => {
          e.target.style.borderColor = '#ABABAB'
          e.target.style.borderWidth = '1.2px'
          if (props.onFocus) props.onFocus(e)
        }}
        onBlur={disabled ? undefined : (e) => {
          e.target.style.borderColor = '#D8D8D8'
          e.target.style.borderWidth = '1px'
          if (props.onBlur) props.onBlur(e)
        }}
        onChange={disabled ? undefined : handleInputChange}
        onKeyDown={disabled ? undefined : onKeyDown}
        onPaste={disabled ? undefined : onPaste}
        {...props}
      />
    </div>
  )
}

export default Input

