function MaterialsCard({
  productName,
  manufacturer,
  partNumber,
  quantity,
  price,
  description,
  className = '',
  onClick,
  ...props
}) {
  return (
    <div
      className={`${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {/* Top section with product info */}
      <div className="flex justify-between items-start">
        {/* Left side - Product info */}
        <div className="flex-1">
          {/* Product Name */}
          <div
            className="text-[#000000]"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              letterSpacing: '-0.01em', // -1%
              fontWeight: 500,
            }}
          >
            {productName}
          </div>

          {/* Manufacturer and Part Number */}
          {(manufacturer || partNumber) && (
            <div
              className="text-[#9A9A9A] mt-[6px]"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                letterSpacing: '-0.01em', // -1%
                fontWeight: 500,
              }}
            >
              {manufacturer && partNumber
                ? `${manufacturer} ${partNumber}`
                : manufacturer || partNumber}
            </div>
          )}
        </div>

        {/* Right side - Quantity and Price */}
        <div className="flex flex-col items-end ml-4">
          {/* Quantity */}
          {quantity && (
            <div
              className="text-[#9A9A9A]"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                letterSpacing: '-0.01em', // -1%
                fontWeight: 500,
              }}
            >
              {quantity}
            </div>
          )}

          {/* Price */}
          {price && (
            <div
              className="text-[#9A9A9A] mt-[6px]"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                letterSpacing: '-0.01em', // -1%
                fontWeight: 500,
              }}
            >
              {price}
            </div>
          )}
        </div>
      </div>

      {/* Description - Full width */}
      {description && (
        <div
          className="text-[#9A9A9A] mt-[12px] w-full"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            letterSpacing: '-0.01em', // -1%
            fontWeight: 500,
            lineHeight: '1.5',
          }}
        >
          {description}
        </div>
      )}
    </div>
  )
}

export default MaterialsCard

