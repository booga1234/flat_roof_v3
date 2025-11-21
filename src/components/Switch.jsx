import { useState, useEffect } from 'react'

function Switch({ 
  checked = false,
  onChange,
  disabled = false,
  className = '',
  ...props 
}) {
  const [internalChecked, setInternalChecked] = useState(checked)

  // Update internal state when checked prop changes (controlled component support)
  useEffect(() => {
    setInternalChecked(checked)
  }, [checked])

  const isChecked = checked !== undefined ? checked : internalChecked

  const handleToggle = () => {
    if (disabled) return

    const newValue = !isChecked
    
    // Update internal state if uncontrolled
    if (checked === undefined) {
      setInternalChecked(newValue)
    }
    
    // Call onChange callback
    if (onChange) {
      onChange(newValue)
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      onClick={handleToggle}
      disabled={disabled}
      className={`relative inline-flex items-center rounded-[20px] p-[2px] transition-colors duration-200 cursor-pointer border-0 outline-none focus:outline-none focus:ring-0 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      style={{
        width: '28px',
        height: '16px',
        backgroundColor: isChecked ? '#000000' : '#D9D9D9',
      }}
      {...props}
    >
      {/* Circle thumb */}
      <span
        className={`absolute rounded-full transition-all duration-200 ease-in-out ${
          disabled ? '' : 'transition-transform'
        }`}
        style={{
          width: '12px',
          height: '12px',
          backgroundColor: '#FFFFFF',
          left: isChecked ? 'calc(100% - 14px)' : '2px', // 2px padding + 12px circle = 14px from right when checked
          transform: 'translateX(0)',
        }}
      />
    </button>
  )
}

export default Switch

