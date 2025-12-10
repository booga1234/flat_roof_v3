function DiagonalChevronsIcon({ size = 12, style = {}, ...props }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: 'rotate(45deg)', color: '#000000', ...style }}
      {...props}
    >
      {/* Upper chevron (same as ChevronsUpDown) */}
      <path 
        d="m7 15 5 5 5-5" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {/* Lower chevron (same as ChevronsUpDown) */}
      <path 
        d="m7 9 5-5 5 5" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default DiagonalChevronsIcon

