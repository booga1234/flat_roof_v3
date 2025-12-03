import { useState } from 'react'
import { Search } from 'lucide-react'

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
    <div className="flex flex-col">
      {/* Search Input */}
      <div
        className="flex flex-row items-center"
        style={{
          borderRadius: '6px',
          gap: '5px',
          padding: '6px 8px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #868686',
        }}
      >
        <Search size={16} style={{ color: '#868686' }} />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 outline-none bg-transparent font-inter text-[12px] placeholder:font-medium"
          style={{
            color: '#282828',
            letterSpacing: '-0.01em',
          }}
        />
      </div>

      {/* Item List */}
      <div 
        className="overflow-y-auto" 
        style={{ 
          marginTop: '5px',
          height: '184px',
          minHeight: '184px',
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
        
        {!loading && !error && filteredItems.map((item) => {
          const isSelected = selectedId === item.id
          const isHovered = hoveredItemId === item.id
          const backgroundColor = isSelected || isHovered ? '#ECECEC' : 'transparent'
          
          return (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              onMouseEnter={() => setHoveredItemId(item.id)}
              onMouseLeave={() => setHoveredItemId(null)}
              className="flex flex-row items-center cursor-pointer transition-colors"
              style={{
                borderRadius: '6px',
                gap: '7px',
                padding: '8px 12px',
                backgroundColor: backgroundColor,
              }}
            >
              <div className="flex flex-col flex-1 min-w-0">
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
                <div className="flex flex-row items-center gap-1.5">
                  {item.role && (
                    <>
                      <span
                        className="font-inter"
                        style={{
                          fontSize: '12px',
                          color: '#9A9A9A',
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
                              backgroundColor: '#9A9A9A',
                            }}
                          />
                          <span
                            className="font-inter"
                            style={{
                              fontSize: '12px',
                              color: '#9A9A9A',
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
                        color: '#9A9A9A',
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
    </div>
  )
}

export default SearchPanel

