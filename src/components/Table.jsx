import { useState } from 'react'
import { Trash2, Undo2 } from 'lucide-react'
import Button from './Button'

/**
 * Reusable Table Component
 * 
 * @param {Object} props
 * @param {Array} props.columns - Array of column definitions: { key: string, label: string, render?: (value, row) => ReactNode }
 * @param {Array} props.data - Array of data objects to display
 * @param {boolean} props.loading - Whether the table is loading
 * @param {string} props.emptyMessage - Message to show when no data
 * @param {Function} props.onRowClick - Optional callback when a row is clicked
 * @param {Function} props.onRestore - Optional callback when restore/undo icon is clicked (shows undo icon if provided)
 * @param {Function} props.onDelete - Optional callback when delete icon is clicked (shows delete icon if provided)
 * @param {string} props.rowKey - Key to use for row identification (default: 'id')
 */
function Table({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No data found',
  onRowClick,
  onRestore,
  onDelete,
  rowKey = 'id',
}) {
  const [hoveredRow, setHoveredRow] = useState(null)

  // Loading skeleton
  if (loading) {
    return (
      <div className="w-full">
        {/* Header skeleton */}
        <div
          className="flex flex-row items-center"
          style={{
            padding: '12px 24px',
            borderBottom: '1px solid #F0F0F0',
          }}
        >
          {columns.map((col, i) => (
            <div
              key={i}
              className="flex-1"
              style={{
                minWidth: col.width || 'auto',
                maxWidth: col.maxWidth || 'none',
              }}
            >
              <div
                className="lead-skeleton-line"
                style={{ width: '60%', height: '12px' }}
              />
            </div>
          ))}
          {(onRestore || onDelete) && <div style={{ width: '80px' }} />}
        </div>
        
        {/* Row skeletons */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex flex-row items-center"
            style={{
              padding: '16px 24px',
              borderBottom: '1px solid #F8F8F8',
            }}
          >
            {columns.map((col, j) => (
              <div
                key={j}
                className="flex-1"
                style={{
                  minWidth: col.width || 'auto',
                  maxWidth: col.maxWidth || 'none',
                }}
              >
                <div
                  className="lead-skeleton-line"
                  style={{ 
                    width: j === 0 ? '40%' : j === columns.length - 1 ? '70%' : '50%', 
                    height: '14px' 
                  }}
                />
              </div>
            ))}
            {(onRestore || onDelete) && <div style={{ width: '80px' }} />}
          </div>
        ))}
      </div>
    )
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center"
        style={{
          padding: '60px 24px',
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            color: '#9A9A9A',
            letterSpacing: '-0.01em',
          }}
        >
          {emptyMessage}
        </span>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Table Header */}
      <div
        className="flex flex-row items-center"
        style={{
          padding: '12px 24px',
          borderBottom: '1px solid #F0F0F0',
          backgroundColor: '#FAFAFA',
        }}
      >
        {columns.map((col, i) => (
          <div
            key={col.key || i}
            className="flex-1"
            style={{
              minWidth: col.width || 'auto',
              maxWidth: col.maxWidth || 'none',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                fontWeight: 500,
                color: '#6B7280',
                letterSpacing: '-0.01em',
              }}
            >
              {col.label}
            </span>
          </div>
        ))}
        {(onRestore || onDelete) && <div style={{ width: '80px' }} />}
      </div>

      {/* Table Body */}
      <div className="flex flex-col">
        {data.map((row, rowIndex) => {
          const key = row[rowKey] || rowIndex
          const isHovered = hoveredRow === key
          
          return (
            <div
              key={key}
              className="flex flex-row items-center transition-colors duration-150"
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid #F8F8F8',
                backgroundColor: isHovered ? '#FAFAFA' : 'transparent',
                cursor: onRowClick ? 'pointer' : 'default',
              }}
              onMouseEnter={() => setHoveredRow(key)}
              onMouseLeave={() => setHoveredRow(null)}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col, colIndex) => {
                const value = row[col.key]
                const renderedValue = col.render ? col.render(value, row) : value
                
                return (
                  <div
                    key={col.key || colIndex}
                    className="flex-1 flex items-center"
                    style={{
                      minWidth: col.width || 'auto',
                      maxWidth: col.maxWidth || 'none',
                      overflow: 'hidden',
                    }}
                  >
                    {typeof renderedValue === 'string' || typeof renderedValue === 'number' ? (
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#202020',
                          letterSpacing: '-0.01em',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {renderedValue}
                      </span>
                    ) : (
                      renderedValue
                    )}
                  </div>
                )
              })}
              
              {/* Action buttons */}
              {(onRestore || onDelete) && (
                <div
                  style={{ width: '80px' }}
                  className="flex items-center justify-end gap-1"
                >
                  {onRestore && (
                    <Button
                      variant="clear"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRestore(row)
                      }}
                      title="Restore"
                    >
                      <Undo2 size={12} style={{ color: '#000000' }} />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="clear"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(row)
                      }}
                      title="Delete"
                      style={{
                        opacity: isHovered ? 1 : 0.3,
                      }}
                    >
                      <Trash2 size={12} style={{ color: '#9A9A9A' }} />
                    </Button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Table

