import { useState } from 'react'
import { Check } from 'lucide-react'
import SearchInput from './SearchInput'

// Format phone number to (XXX) XXX-XXXX format
const formatPhoneNumber = (phone) => {
  if (!phone) return ''
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // Handle US phone numbers (10 digits)
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  
  // Handle US phone numbers with country code (11 digits starting with 1)
  if (digits.length === 11 && digits[0] === '1') {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  
  // If it doesn't match standard formats, return original
  return phone
}

function SearchPanel({ 
  items = [], 
  onSelect, 
  selectedId,
  searchQuery: controlledSearchQuery, 
  onSearchChange,
  loading = false,
  error = null,
  placeholder = 'Search...',
  emptyMessage = 'No items found',
  loadingMessage = 'Loading...',
}) {
  const [internalSearchQuery, setInternalSearchQuery] = useState('')
  
  // Use controlled or internal state
  const searchQuery = controlledSearchQuery !== undefined ? controlledSearchQuery : internalSearchQuery
  const setSearchQuery = onSearchChange || setInternalSearchQuery
  const [hoveredItemId, setHoveredItemId] = useState(null)

  // Filter items based on search query
  const filteredItems = items.filter(item => {
    const query = searchQuery.toLowerCase()
    return (
      item.name?.toLowerCase().includes(query) ||
      item.role?.toLowerCase().includes(query) ||
      item.company?.toLowerCase().includes(query) ||
      item.subtitle?.toLowerCase().includes(query)
    )
  })

  const handleItemClick = (item) => {
    if (onSelect) {
      onSelect(item)
    }
  }

  return (
    <div className="flex flex-col" style={{ height: '100%', minHeight: 0 }}>
      {/* Search Input */}
      <SearchInput
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={placeholder}
      />

      {/* Item List */}
      <div 
        className="overflow-y-auto flex-1" 
        style={{ 
          marginTop: '15px',
          minHeight: 0,
        }}
      >
        {loading && (
          <div
            className="flex items-center justify-center"
            style={{
              height: '100%',
              color: '#9A9A9A',
              fontSize: '12px',
            }}
          >
            {loadingMessage}
          </div>
        )}
        
        {!loading && error && (
          <div
            className="flex items-center justify-center"
            style={{
              height: '100%',
              color: '#9A9A9A',
              fontSize: '12px',
            }}
          >
            {error}
          </div>
        )}
        
        {!loading && !error && filteredItems.length === 0 && (
          <div
            className="flex items-center justify-center"
            style={{
              height: '100%',
              color: '#9A9A9A',
              fontSize: '12px',
            }}
          >
            {emptyMessage}
          </div>
        )}
        
        {!loading && !error && (
          <div className="flex flex-col" style={{ gap: '15px' }}>
            {filteredItems.map((item) => {
              const isSelected = selectedId === item.id
              const isHovered = hoveredItemId === item.id
              // Selected items keep background color even on hover
              const backgroundColor = isSelected ? '#ECECEC' : (isHovered ? '#ECECEC' : 'transparent')
              
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  onMouseEnter={() => setHoveredItemId(item.id)}
                  onMouseLeave={() => setHoveredItemId(null)}
                  className="flex flex-row items-start cursor-pointer transition-colors"
                  style={{
                    position: 'relative',
                    borderRadius: '13px',
                    gap: '7px',
                    padding: '15px 15px 15px 30px',
                    backgroundColor: backgroundColor,
                  }}
                >
                  {/* Checkmark icon - only show when selected, positioned absolutely */}
                  {isSelected && (
                    <div 
                      style={{
                        position: 'absolute',
                        left: '11px',
                        top: '18px',
                      }}
                    >
                      <Check size={12} strokeWidth={3} style={{ color: '#282828' }} />
                    </div>
                  )}
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex flex-row items-center justify-between gap-2">
                      <div
                        className="font-inter font-semibold"
                        style={{
                          fontSize: '12px',
                          color: '#282828',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {item.name}
                      </div>
                      {item.phone && (
                        <div
                          className="font-inter flex-shrink-0"
                          style={{
                            fontSize: '12px',
                            color: '#5D5D5D',
                            letterSpacing: '-0.01em',
                            fontWeight: 400,
                          }}
                        >
                          {formatPhoneNumber(item.phone)}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-row items-center gap-1.5">
                      {item.role && (
                        <>
                          <span
                            className="font-inter"
                            style={{
                              fontSize: '12px',
                              color: '#5D5D5D',
                              letterSpacing: '-0.01em',
                              fontWeight: 400,
                            }}
                          >
                            {item.role}
                          </span>
                          {item.company && (
                            <>
                              <div
                                style={{
                                  width: '3px',
                                  height: '3px',
                                  borderRadius: '50%',
                                  backgroundColor: '#5D5D5D',
                                }}
                              />
                              <span
                                className="font-inter"
                                style={{
                                  fontSize: '12px',
                                  color: '#5D5D5D',
                                  letterSpacing: '-0.01em',
                                  fontWeight: 400,
                                }}
                              >
                                {item.company}
                              </span>
                            </>
                          )}
                        </>
                      )}
                      {!item.role && item.company && (
                        <span
                          className="font-inter"
                          style={{
                            fontSize: '12px',
                            color: '#5D5D5D',
                            letterSpacing: '-0.01em',
                            fontWeight: 400,
                          }}
                        >
                          {item.company}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchPanel

