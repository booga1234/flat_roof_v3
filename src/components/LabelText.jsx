function LabelText({ children, className = '', ...props }) {
  const style = {
    letterSpacing: '-1%',
  }

  return (
    <span
      className={`font-inter text-[12px] ${className}`}
      style={{
        ...style,
        fontWeight: 550,
        color: '#282828',
      }}
      {...props}
    >
      {children}
    </span>
  )
}

export default LabelText

