function LoadingTextAnimation({ lines = 5 }) {
  return (
    <div className="shimmer-wrapper">
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="shimmer-line" />
      ))}
    </div>
  )
}

export default LoadingTextAnimation

