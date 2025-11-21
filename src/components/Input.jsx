import { NumericFormat, PatternFormat } from 'react-number-format'
import LabelText from './LabelText'

function Input({ label, description, placeholder = 'Enter a user friendly name', type = 'text', className = '', fullWidth = true, price = false, onKeyDown, onPaste, onChange, value, ...props }) {
  const inputWidthClass = fullWidth ? 'w-full' : 'w-[253px]'
  
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
          onValueChange={handlePriceValueChange}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`input-focus-outline flex flex-row items-center px-2 py-1.5 gap-2.5 ${inputWidthClass} h-[27px] bg-white border rounded-[6px] outline-none focus:ring-0 text-left shadow-[0_1px_2px_rgba(0,0,0,0.02)] font-inter font-medium text-[12px] placeholder:font-medium`}
          style={{
            boxSizing: 'border-box',
            textAlign: 'left',
            borderColor: '#D8D8D8',
            borderWidth: '1px',
            letterSpacing: '-0.01em',
            color: '#282828',
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
          onValueChange={handleNumberValueChange}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          placeholder={placeholder}
          className={`input-focus-outline flex flex-row items-center px-2 py-1.5 gap-2.5 ${inputWidthClass} h-[27px] bg-white border rounded-[6px] outline-none focus:ring-0 text-left shadow-[0_1px_2px_rgba(0,0,0,0.02)] font-inter font-medium text-[12px] placeholder:font-medium`}
          style={{
            boxSizing: 'border-box',
            textAlign: 'left',
            borderColor: '#D8D8D8',
            borderWidth: '1px',
            letterSpacing: '-0.01em',
            color: '#282828',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#ABABAB'
            e.target.style.borderWidth = '1.2px'
            if (props.onFocus) props.onFocus(e)
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#D8D8D8'
            e.target.style.borderWidth = '1px'
            if (props.onBlur) props.onBlur(e)
          }}
          {...props}
        />
      </div>
    )
  }
  
  // For textarea inputs
  if (type === 'textarea') {
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
        <textarea
          placeholder={placeholder}
          value={value}
          className={`input-focus-outline flex flex-row items-start px-2 py-1.5 gap-2.5 ${fullWidth ? 'w-full' : inputWidthClass} min-h-[80px] bg-white border rounded-[6px] outline-none focus:ring-0 text-left shadow-[0_1px_2px_rgba(0,0,0,0.02)] font-inter font-medium text-[12px] placeholder:font-medium resize-none`}
          style={{
            boxSizing: 'border-box',
            textAlign: 'left',
            borderColor: '#D8D8D8',
            borderWidth: '1px',
            letterSpacing: '-0.01em',
            color: '#282828',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#ABABAB'
            e.target.style.borderWidth = '1.2px'
            if (props.onFocus) props.onFocus(e)
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#D8D8D8'
            e.target.style.borderWidth = '1px'
            if (props.onBlur) props.onBlur(e)
          }}
          onChange={handleInputChange}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          {...props}
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
          onValueChange={handlePhoneValueChange}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          placeholder={placeholder || "+1 (XXX) XXX-XXXX"}
          className={`input-focus-outline flex flex-row items-center px-2 py-1.5 gap-2.5 ${inputWidthClass} h-[27px] bg-white border rounded-[6px] outline-none focus:ring-0 text-left shadow-[0_1px_2px_rgba(0,0,0,0.02)] font-inter font-medium text-[12px] placeholder:font-medium`}
          style={{
            boxSizing: 'border-box',
            textAlign: 'left',
            borderColor: '#D8D8D8',
            borderWidth: '1px',
            letterSpacing: '-0.01em',
            color: '#282828',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#ABABAB'
            e.target.style.borderWidth = '1.2px'
            if (props.onFocus) props.onFocus(e)
          }}
          onBlur={(e) => {
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
        className={`input-focus-outline flex flex-row items-center px-2 py-1.5 gap-2.5 ${inputWidthClass} h-[27px] bg-white border rounded-[6px] outline-none focus:ring-0 text-left shadow-[0_1px_2px_rgba(0,0,0,0.02)] font-inter font-medium text-[12px] placeholder:font-medium`}
        style={{
          boxSizing: 'border-box',
          textAlign: 'left',
          borderColor: '#D8D8D8',
          borderWidth: '1px',
          letterSpacing: '-0.01em',
          color: '#282828',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#ABABAB'
          e.target.style.borderWidth = '1.2px'
          if (props.onFocus) props.onFocus(e)
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#D8D8D8'
          e.target.style.borderWidth = '1px'
          if (props.onBlur) props.onBlur(e)
        }}
        onChange={handleInputChange}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        {...props}
      />
    </div>
  )
}

export default Input

