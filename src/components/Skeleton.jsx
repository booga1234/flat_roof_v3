function SkeletonCard() {
  return (
    <div
      className="skeleton-card"
      style={{
        height: '88px',
        backgroundColor: '#F3F4F6',
        borderRadius: '12px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Shimmer effect */}
      <div
        className="skeleton-shimmer"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
          animation: 'shimmer 1.5s infinite'
        }}
      />
    </div>
  )
}

function Skeleton({ count = 5 }) {
  return (
    <div className="flex flex-col" style={{ gap: '1px' }}>
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
      
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          <SkeletonCard />
          {index < count - 1 && (
            <div 
              style={{ 
                height: '1px', 
                backgroundColor: '#E5E5E5',
                marginTop: '16px',
                marginBottom: '16px'
              }} 
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default Skeleton
export { SkeletonCard }

