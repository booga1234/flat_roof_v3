import Skeleton from './Skeleton'
import Loader from './Loader'

function TwoColumnLayout({
  leftContent,
  rightContent,
  leftWidth = '400px',
  leftPadding = '20px',
  rightPadding = '40px 60px',
  className = '',
  leftColumnRef,
  leftLoading = false,
  rightLoading = false,
  rightLoadingText = 'Loading...',
  skeletonCount = 5
}) {
  return (
    <div className={`flex flex-row flex-1 ${className}`} style={{ overflow: 'hidden', minHeight: 0 }}>
      {/* Left Column */}
      <div
        ref={leftColumnRef}
        className="flex flex-col"
        style={{
          width: leftWidth,
          borderRight: '1px solid #E5E5E5',
          padding: leftPadding,
          gap: '20px',
          overflowY: 'auto',
          position: 'relative'
        }}
      >
        {/* Skeleton overlay for left column */}
        {leftLoading && (
          <div 
            style={{ 
              position: 'absolute',
              inset: 0,
              zIndex: 10,
              backgroundColor: 'white',
              padding: leftPadding
            }}
          >
            <Skeleton count={skeletonCount} />
          </div>
        )}
        {leftContent}
      </div>

      {/* Right Column */}
      <div
        className="flex-1"
        style={{
          minHeight: 0,
          overflowY: rightLoading ? 'hidden' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {/* Loader overlay - shown when loading */}
        {rightLoading && (
          <div 
            className="flex items-center justify-center"
            style={{ 
              position: 'absolute',
              inset: 0,
              zIndex: 10,
              backgroundColor: 'white'
            }}
          >
            <Loader text={rightLoadingText} />
          </div>
        )}
        
        {/* Content - always rendered but hidden when loading so components can initialize */}
        <div
          style={{
            padding: rightPadding,
            paddingBottom: '60px',
            flex: 1,
            ...(rightLoading ? {
              visibility: 'hidden',
              pointerEvents: 'none'
            } : {})
          }}
        >
          {rightContent}
        </div>
      </div>
    </div>
  )
}

export default TwoColumnLayout

