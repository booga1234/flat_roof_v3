function SectionHeader({ children, className = '', noBorder = false }) {
  return (
    <div
      className={`flex flex-col items-start ${className}`}
      style={{
        padding: '8px 0px',
        borderBottom: noBorder ? 'none' : '1px solid #EDEDED',
        marginBottom: '16px'
      }}
    >
      <h3
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '10px',
          fontWeight: 600,
          color: '#5D5D5D',
          letterSpacing: '0.05em',
          margin: 0,
          textTransform: 'uppercase'
        }}
      >
        {children}
      </h3>
    </div>
  )
}

// Section wrapper component that groups content under a header
function Section({ title, children, className = '', noBorder = false }) {
  return (
    <div className={`flex flex-col ${className}`}>
      <SectionHeader noBorder={noBorder}>{title}</SectionHeader>
      <div className="flex flex-col gap-4">
        {children}
      </div>
    </div>
  )
}

export default SectionHeader
export { Section, SectionHeader }

