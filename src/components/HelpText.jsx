import { Info } from 'lucide-react'
import { useState } from 'react'

function HelpText({ text, className = '' }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Info 
          className="w-3 h-3 cursor-help transition-colors" 
          style={{ color: '#C0C0C0' }}
          strokeWidth={2}
        />
        
        {isHovered && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-[10000] pointer-events-none">
            <div className="bg-white text-[#111827] text-xs font-inter font-normal px-4 py-3 rounded-lg shadow-md border border-[#E5E7EB] w-[15rem] whitespace-normal">
              {text}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HelpText

