function NewPage({ children, className = '' }) {
  return (
    <div
      className={`w-full h-full flex flex-col overflow-hidden ${className}`}
      style={{
        minHeight: 0, // Important for flex children to respect parent constraints
        minWidth: 0,  // Important for flex children to respect parent constraints
        backgroundColor: '#FFFFFF',
        borderRadius: '7px', // 7px on all corners
      }}
    >
      {children}
    </div>
  )
}

export default NewPage

