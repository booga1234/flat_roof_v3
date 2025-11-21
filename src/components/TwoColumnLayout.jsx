function TwoColumnLayout({
  leftContent,
  rightContent,
  leftWidth = '400px',
  leftPadding = '20px',
  rightPadding = '40px 60px',
  className = ''
}) {
  return (
    <div className={`flex flex-row flex-1 ${className}`} style={{ overflow: 'hidden', minHeight: 0 }}>
      {/* Left Column */}
      <div
        className="flex flex-col"
        style={{
          width: leftWidth,
          borderRight: '1px solid #E5E5E5',
          padding: leftPadding,
          gap: '20px',
          overflowY: 'auto'
        }}
      >
        {leftContent}
      </div>

      {/* Right Column */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          padding: rightPadding,
          minHeight: 0
        }}
      >
        {rightContent}
      </div>
    </div>
  )
}

export default TwoColumnLayout

