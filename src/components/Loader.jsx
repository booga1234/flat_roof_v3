function Loader({ text = "Loading..." }) {
  return (
    <div 
      className="flex flex-col items-center justify-center"
      style={{
        gap: '16px'
      }}
    >
      {/* Spinner */}
      <div
        className="loader-spinner"
        style={{
          width: '24px',
          height: '24px',
          border: '2px solid #E5E5E5',
          borderTopColor: '#6B7280',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}
      />
      
      {/* Loading text */}
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          fontWeight: 500,
          color: '#6B7280',
          letterSpacing: '-0.01em'
        }}
      >
        {text}
      </span>

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}

export default Loader

