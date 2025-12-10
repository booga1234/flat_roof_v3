import { useState } from 'react'

/**
 * UserAvatar Component
 * 
 * Displays a user's profile photo or a placeholder with their initial
 * 
 * @param {Object} props
 * @param {Object} props.user - User object with profile_photo, first_name, last_name, email
 * @param {string} props.size - Size of the avatar ('small' | 'medium' | 'large'), defaults to 'medium'
 * @param {boolean} props.showName - Whether to show the user's name next to the avatar, defaults to false
 * @param {string} props.className - Additional CSS classes
 */
function UserAvatar({ user, size = 'medium', showName = false, className = '' }) {
  const [imageError, setImageError] = useState(false)
  if (!user) {
    return showName ? (
      <div className={`flex items-center ${className}`} style={{ gap: '8px' }}>
        <div
          style={{
            width: getSize(size),
            height: getSize(size),
            borderRadius: '50%',
            backgroundColor: '#E8E8E8',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: getFontSize(size),
              fontWeight: 500,
              color: '#676767',
              letterSpacing: '-0.01em',
            }}
          >
            ?
          </span>
        </div>
        {showName && (
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              fontWeight: 500,
              color: '#202020',
              letterSpacing: '-0.01em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            —
          </span>
        )}
      </div>
    ) : (
      <div
        className={className}
        style={{
          width: getSize(size),
          height: getSize(size),
          borderRadius: '50%',
          backgroundColor: '#E8E8E8',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: getFontSize(size),
            fontWeight: 500,
            color: '#676767',
            letterSpacing: '-0.01em',
          }}
        >
          ?
        </span>
      </div>
    )
  }

  const { first_name, last_name, email, profile_photo } = user
  const displayName = first_name || last_name
    ? `${first_name || ''} ${last_name || ''}`.trim()
    : email || '—'
  
  const profilePhotoUrl = profile_photo?.url
  const initial = (first_name?.[0] || last_name?.[0] || email?.[0] || '?').toUpperCase()
  const showImage = profilePhotoUrl && !imageError

  const avatarElement = (
    <>
      {showImage && (
        <img
          src={profilePhotoUrl}
          alt={displayName}
          style={{
            width: getSize(size),
            height: getSize(size),
            borderRadius: '50%',
            objectFit: 'cover',
            flexShrink: 0,
          }}
          onError={() => {
            setImageError(true)
          }}
        />
      )}
      {!showImage && (
        <div
          style={{
            width: getSize(size),
            height: getSize(size),
            borderRadius: '50%',
            backgroundColor: '#E8E8E8',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: getFontSize(size),
              fontWeight: 500,
              color: '#676767',
              letterSpacing: '-0.01em',
            }}
          >
            {initial}
          </span>
        </div>
      )}
    </>
  )

  if (showName) {
    return (
      <div
        className={`flex items-center ${className}`}
        style={{
          gap: '8px',
        }}
      >
        {avatarElement}
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            fontWeight: 500,
            color: '#202020',
            letterSpacing: '-0.01em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {displayName}
        </span>
      </div>
    )
  }

  return (
    <div className={className} style={{ display: 'inline-block' }}>
      {avatarElement}
    </div>
  )
}

// Helper function to get size in pixels
function getSize(size) {
  const sizes = {
    small: '20px',
    medium: '24px',
    large: '32px',
  }
  return sizes[size] || sizes.medium
}

// Helper function to get font size based on avatar size
function getFontSize(size) {
  const fontSizes = {
    small: '9px',
    medium: '10px',
    large: '12px',
  }
  return fontSizes[size] || fontSizes.medium
}

export default UserAvatar

