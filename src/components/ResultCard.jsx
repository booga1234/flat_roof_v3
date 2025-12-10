import Button from './Button'
import Badge from './Badge'

function ResultCard({ 
  avatar,
  initials,
  avatarColor = '#E5E5E5',
  headerText,
  subText,
  tag,
  tags,
  primaryButtonText = 'Edit',
  secondaryButtonText = 'View',
  onPrimaryClick,
  onSecondaryClick,
  showButtons = true,
  className = ''
}) {
  return (
    <div 
      className={`flex flex-row items-center justify-between px-5 py-4 bg-white border-b border-[#E6E6E6] last:border-b-0 ${className}`}
    >
      {/* Left section: Avatar + Text */}
      <div className="flex flex-row items-center gap-3">
        {/* Avatar Circle */}
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium shrink-0 overflow-hidden uppercase"
          style={{ 
            backgroundColor: avatar ? 'transparent' : avatarColor,
            color: '#0D0D0D'
          }}
        >
          {avatar ? (
            <img src={avatar} alt={headerText} className="w-full h-full object-cover" />
          ) : (
            (headerText?.charAt(0) || initials?.charAt(0) || '?').toUpperCase()
          )}
        </div>

        {/* Text Content */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-inter font-medium text-sm text-[#0D0D0D]">
              {headerText}
            </span>
            {tags && (
              <div className="flex items-center" style={{ gap: '5px' }}>
                {tags.map((t, index) => (
                  <Badge key={index} variant={t.variant}>
                    {t.text}
                  </Badge>
                ))}
              </div>
            )}
            {tag && !tags && (
              <span className="font-inter text-xs text-[#8F8F8F]">
                {tag}
              </span>
            )}
          </div>
          {subText && (
            <span className="font-inter text-xs text-[#8F8F8F]">
              {subText}
            </span>
          )}
        </div>
      </div>

      {/* Right section: Buttons */}
      {showButtons && (
        <div className="flex flex-row items-center gap-2">
          <Button variant="white" onClick={onSecondaryClick} className="min-w-20">
            {secondaryButtonText}
          </Button>
          <Button variant="dark" onClick={onPrimaryClick} className="min-w-20">
            {primaryButtonText}
          </Button>
        </div>
      )}
    </div>
  )
}

export default ResultCard

