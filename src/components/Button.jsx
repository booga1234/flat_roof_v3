function Button({ children, variant = 'dark', width, className = '', disabled, ...props }) {
  const variants = {
    dark: 'bg-[#0D0D0D] hover:bg-[#303030] active:bg-[#141414] text-[#FFFFFF] transition-colors duration-200',
    white: 'bg-[#EDEDED] hover:bg-[#E4E4E4] active:bg-[#E4E4E4] text-[#000000] transition-colors duration-200'
  }

  const variantStyles = variants[variant] || variants.dark
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : ''
  
  const style = {
    letterSpacing: '-1%',
    ...(width && { width })
  }

  return (
    <button
      className={`font-inter font-medium text-xs inline-flex flex-row items-center justify-center px-[10px] py-[7px] gap-[5px] h-[29px] w-fit ${variantStyles} rounded-[6px] border-0 outline-none ${disabledStyles} ${className}`}
      style={style}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button

