import { Calendar, Plus } from 'lucide-react'
import Button from './Button'

function NoDataFound({ 
  heading = "No time slots found", 
  message = "Create a time slot below.",
  buttonText = "Create",
  onButtonClick 
}) {
  return (
    <div
      className="flex flex-col items-center"
      style={{
        gap: '16px',
        padding: '0px'
      }}
    >
      {/* Icon Wrapper */}
      <div
        className="flex flex-row items-center justify-center"
        style={{
          borderRadius: '8px',
          padding: '10px',
          backgroundColor: '#ECECEC',
          gap: '5px'
        }}
      >
        <Calendar
          size={18}
          strokeWidth={1.5}
          style={{
            color: '#000000'
          }}
        />
      </div>

      {/* Text Wrapper */}
      <div
        className="flex flex-col items-center"
        style={{
          gap: '7px',
          padding: '0px'
        }}
      >
        {/* Heading */}
        <h3
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            letterSpacing: '-0.01em',
            textAlign: 'center',
            color: '#000000',
            margin: 0
          }}
        >
          {heading}
        </h3>

        {/* Paragraph */}
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '-0.01em',
            textAlign: 'center',
            color: '#9A9A9A',
            margin: 0
          }}
        >
          {message}
        </p>
      </div>

      {/* Create Button */}
      {onButtonClick && (
        <Button variant="dark" onClick={onButtonClick}>
          <Plus size={14} style={{ color: '#FFFFFF' }} />
          <span>{buttonText}</span>
        </Button>
      )}
    </div>
  )
}

export default NoDataFound

