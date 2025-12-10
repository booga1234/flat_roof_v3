import { cloneElement, isValidElement } from 'react'

function IconButton({ children, variant = 'clear', className = '', disabled, isActive = false, ...props }) {
  const variants = {
    clear: 'bg-transparent hover:bg-[#DFDFDF] active:bg-[#DFDFDF] text-[#000000] transition-colors duration-200'
  }

  const variantStyles = variants[variant] || variants.clear
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : ''
  const activeStyles = isActive ? 'bg-[#EBEBEB]' : ''
  
  const style = {
    letterSpacing: '-1%'
  }

  // Ensure icons are 12px
  const renderChildren = () => {
    if (isValidElement(children)) {
      // Clone the icon element and set size to 12px
      return cloneElement(children, { 
        size: 12,
        style: { width: '12px', height: '12px', ...children.props?.style }
      })
    }
    return children
  }

  return (
    <button
      className={`font-inter font-medium text-xs inline-flex flex-row items-center justify-center p-[4px] gap-[5px] h-fit w-fit ${className} ${variantStyles} ${activeStyles} rounded-[6px] border-0 outline-none ${disabledStyles}`}
      style={style}
      disabled={disabled}
      {...props}
    >
      {renderChildren()}
    </button>
  )
}

export default IconButton

