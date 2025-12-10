function Badge({ children, variant = 'grey', className = '' }) {
  const variants = {
    grey: { bg: '#ECECEC', text: 'rgb(75, 75, 75)' },
    green: { bg: '#E8F4E6', text: '#45833F' },
    dark: { bg: '#0D0D0D', text: '#FFFFFF' },
  }

  const colors = variants[variant] || variants.grey

  return (
    <span
      className={`inline-flex items-center justify-center py-[3px] px-[6px] rounded-[5px] font-inter font-medium text-xs w-fit self-start ${className}`}
      style={{ backgroundColor: colors.bg, color: colors.text, letterSpacing: '-0.01em' }}
    >
      {children}
    </span>
  )
}

export default Badge

