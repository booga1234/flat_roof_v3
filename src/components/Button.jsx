import { cloneElement, isValidElement } from 'react'

function Button({ children, variant = 'dark', width, className = '', disabled, ...props }) {
  const isRounded = variant === 'rounded'
  
  const variants = {
    dark: 'bg-[#0D0D0D] hover:bg-[#303030] active:bg-[#141414] text-[#FFFFFF] transition-colors duration-200',
    white: 'bg-[#EDEDED] hover:bg-[#E4E4E4] active:bg-[#E4E4E4] text-[#000000] transition-colors duration-200',
    clear: 'bg-transparent hover:bg-[#DFDFDF] active:bg-[#DFDFDF] text-[#000000] transition-colors duration-200',
    rounded: 'bg-[#0D0D0D] hover:bg-[#1a1a1a] active:bg-[#000000] text-[#FFFFFF] transition-colors duration-200',
    red: 'bg-[#DC2626] hover:bg-[#B91C1C] active:bg-[#991B1B] text-[#FFFFFF] transition-colors duration-200'
  }

  const variantStyles = variants[variant] || variants.dark
  const disabledStyles = disabled ? 'cursor-not-allowed' : ''
  
  // For clear variant, use same padding as normal buttons
  const isClearVariant = variant === 'clear'
  const paddingStyles = isRounded ? 'px-[40px] py-[14px]' : 'px-[10px] py-[7px]'
  const heightStyles = isRounded ? 'h-[48px]' : 'h-[29px]'
  const roundedStyles = isRounded ? 'rounded-full' : 'rounded-[6px]'
  const fontStyles = isRounded ? 'font-inter font-medium text-[15px]' : 'font-inter font-medium text-xs'
  const widthStyles = isRounded ? 'w-full' : 'w-fit'
  
  const isRedVariant = variant === 'red'
  
  const style = {
    letterSpacing: '-1%',
    ...(width && { width }),
    ...(disabled && !isRounded && !isRedVariant && {
      backgroundColor: '#F3F3F3',
      color: '#8F8F8F',
    }),
    ...(disabled && isRounded && {
      backgroundColor: '#E5E5E5',
      color: '#9E9E9E',
    }),
    ...(disabled && isRedVariant && {
      backgroundColor: '#FECACA',
      color: '#F87171',
    })
  }

  // For clear variant with icon children, ensure icons are 12px
  const renderChildren = () => {
    if (isClearVariant && isValidElement(children)) {
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
      className={`${fontStyles} inline-flex flex-row items-center justify-center ${paddingStyles} gap-[5px] ${heightStyles} ${widthStyles} ${variantStyles} ${roundedStyles} border-0 outline-none ${disabledStyles} ${className}`}
      style={style}
      disabled={disabled}
      {...props}
    >
      {renderChildren()}
    </button>
  )
}

export default Button

