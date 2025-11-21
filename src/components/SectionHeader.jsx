function SectionHeader({ children, className = '' }) {
  return (
    <div
      className={`flex flex-col items-start ${className}`}
      style={{
        padding: '10px 0px',
        borderBottom: '1px solid #EDEDED',
        borderTop: '0px',
        borderLeft: '0px',
        borderRight: '0px'
      }}
    >
      <h3
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '10px',
          fontWeight: 600,
          color: '#5D5D5D',
          letterSpacing: '0.03em',
          margin: 0,
          textTransform: 'uppercase'
        }}
      >
        {children}
      </h3>
    </div>
  )
}

export default SectionHeader

