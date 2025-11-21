import { cloneElement } from 'react'

function InfoCard({ 
  icon, 
  title, 
  dateTime, 
  identifier, 
  className = '',
  ...props 
}) {
  return (
    <div
      className={`bg-white border border-[#DDDDDD] rounded-[20px] p-[15px] flex flex-col items-start justify-between h-[128px] w-[238px] transition-shadow duration-200 shadow-[0_3px_10.2px_0_rgba(0,0,0,0.1)] hover:shadow-[0_4px_15px_0_rgba(0,0,0,0.15)] ${className}`}
      style={{
        borderWidth: '0.5px',
      }}
      {...props}
    >
      {icon && (
        <div 
          className="w-[26px] h-[26px] flex items-center justify-center"
          style={{
            backgroundColor: '#62B45A',
            borderRadius: '7px',
          }}
        >
          {cloneElement(icon, { color: 'white', size: 12 })}
        </div>
      )}
      
      <div className="flex flex-col items-start justify-start gap-[10px] p-0 w-full">
        {title && (
          <div 
            className="font-inter font-medium text-[#000000] w-full"
            style={{
              fontSize: '12px',
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </div>
        )}
        
        <div className="flex flex-row items-center justify-between w-full">
          {dateTime && (
            <div 
              className="font-inter font-medium"
              style={{
                fontSize: '12px',
                letterSpacing: '-0.01em',
                color: '#9A9A9A',
              }}
            >
              {dateTime}
            </div>
          )}
          {identifier && (
            <div 
              className="font-inter font-medium"
              style={{
                fontSize: '12px',
                letterSpacing: '-0.01em',
                color: '#9A9A9A',
              }}
            >
              {identifier}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InfoCard

