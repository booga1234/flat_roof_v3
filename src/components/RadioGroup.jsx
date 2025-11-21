import { useState, useEffect } from 'react'
import LabelText from './LabelText'

function RadioGroup({ 
  label,
  description,
  options = [], 
  value, 
  onChange, 
  className = '',
  name = 'radio-group',
  ...props 
}) {
  const [selectedValue, setSelectedValue] = useState(value || null)

  // Update selectedValue when value prop changes
  useEffect(() => {
    setSelectedValue(value || null)
  }, [value])

  const handleSelect = (optionValue) => {
    setSelectedValue(optionValue)
    if (onChange) {
      onChange(optionValue)
    }
  }

  return (
    <div 
      className={`flex flex-col items-start gap-2 p-0 ${className}`}
      {...props}
    >
      {(label || description) && (
        <div className="flex flex-col gap-0">
          {label && (
            <label className="flex">
              {typeof label === 'string' ? <LabelText>{label}</LabelText> : label}
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
      <div className="flex flex-col items-start gap-[10px] p-0">
        {options.map((option) => {
        const isSelected = selectedValue === option.value
        return (
          <label
            key={option.value}
            className="flex flex-row items-center gap-[7px] p-0 cursor-pointer"
            onClick={() => handleSelect(option.value)}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={isSelected}
              onChange={() => handleSelect(option.value)}
              className="sr-only"
            />
            <div className="flex-shrink-0">
              {isSelected ? (
                // Selected radio button: 15x15px, stroke #181818 with 5px width, white fill
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="7.5"
                    cy="7.5"
                    r="5"
                    stroke="#181818"
                    strokeWidth="5"
                    fill="#FFFFFF"
                  />
                </svg>
              ) : (
                // Not selected radio button: 15x15px, border #D8D8D8, stroke width 1px
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="7.5"
                    cy="7.5"
                    r="7"
                    stroke="#D8D8D8"
                    strokeWidth="1"
                    fill="none"
                  />
                </svg>
              )}
            </div>
            <LabelText>{option.label}</LabelText>
          </label>
        )
      })}
      </div>
    </div>
  )
}

export default RadioGroup
