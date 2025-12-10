function StatusIndicator({ status, color, children, className = '' }) {
  // Color mapping for red, green, blue (matching TimeSlots.jsx styling)
  const getColorValue = (colorName) => {
    switch (colorName?.toLowerCase()) {
      case 'red': return '#E74242'
      case 'green': return '#66E742'
      case 'blue': return '#3B82F6'
      default: return '#6B7280'
    }
  }

  // Get status color based on status value (for backward compatibility)
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#66E742' // green (matching TimeSlots.jsx)
      case 'pending': return '#F59E0B'
      case 'cancelled': return '#E74242' // red (matching TimeSlots.jsx)
      case 'completed': return '#3B82F6' // blue
      default: return '#6B7280'
    }
  }
  
  // Get status label (capitalize first letter) - only used if no children provided
  const getStatusLabel = (status) => {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending'
  }

  // Determine the color to use: explicit color prop > status-based color > default
  const dotColor = color ? getColorValue(color) : (status ? getStatusColor(status) : '#6B7280')
  
  // Determine the text to display: children > status label > default
  const displayText = children || (status ? getStatusLabel(status) : 'Pending')

  // Get box shadow color based on dot color
  const getBoxShadowColor = (color) => {
    switch (color?.toLowerCase()) {
      case 'red': return '0 0 4px rgba(231, 66, 66, 0.4)'
      case 'green': return '0 0 4px rgba(102, 231, 66, 0.4)'
      case 'blue': return '0 0 4px rgba(59, 130, 246, 0.4)'
      default: return '0 0 4px rgba(107, 114, 128, 0.4)'
    }
  }

  // Determine box shadow based on color or status
  const boxShadow = color 
    ? getBoxShadowColor(color) 
    : (status === 'confirmed' ? '0 0 4px rgba(102, 231, 66, 0.4)' : 
       status === 'cancelled' ? '0 0 4px rgba(231, 66, 66, 0.4)' :
       status === 'completed' ? '0 0 4px rgba(59, 130, 246, 0.4)' :
       '0 0 4px rgba(107, 114, 128, 0.4)')

  return (
    <div className={`flex flex-row items-center gap-2 ${className}`} style={{ flexShrink: 0 }}>
      <div
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: dotColor,
          boxShadow: boxShadow,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '11px',
          fontWeight: 500,
          color: '#9A9A9A',
          letterSpacing: '-0.01em'
        }}
      >
        {displayText}
      </span>
    </div>
  )
}

export default StatusIndicator

