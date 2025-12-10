function NewPage({ children, className = '' }) {
  return (
    <div
      className={`w-full h-full flex flex-col overflow-hidden ${className}`}
      style={{
        minHeight: 0, // Important for flex children to respect parent constraints
        minWidth: 0,  // Important for flex children to respect parent constraints
        backgroundColor: '#FFFFFF',
        borderRadius: '10px', // Consistent 10px rounded corners
      }}
    >
      {children}
    </div>
  )
}

export default NewPage

