import { useState } from 'react'
import { Search } from 'lucide-react'

function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  onFocus,
  onBlur,
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = (e) => {
    setIsFocused(true)
    if (onFocus) onFocus(e)
  }

  const handleBlur = (e) => {
    setIsFocused(false)
    if (onBlur) onBlur(e)
  }

  // Determine border color based on state
  const getBorderColor = () => {
    if (isFocused) return '#868686' // Active/Selected
    if (isHovered) return '#C2C2C2' // Hover
    return '#D8D8D8' // Default/Not selected
  }

  return (
    <div
      className="flex flex-row items-center"
      style={{
        borderRadius: '6px',
        gap: '5px',
        padding: '6px 8px',
        backgroundColor: '#FFFFFF',
        border: `1px solid ${getBorderColor()}`,
        transition: 'border-color 0.2s ease',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Search size={12} style={{ color: '#282828' }} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="flex-1 outline-none bg-transparent font-inter text-[12px] placeholder:font-medium"
        style={{
          color: '#282828',
          letterSpacing: '-0.01em',
        }}
      />
    </div>
  )
}

export default SearchInput

