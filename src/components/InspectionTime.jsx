import { useState, useEffect } from 'react'
import LabelText from './LabelText'
import { calendarEventsAPI } from '../utils/apiService'

function InspectionTime({ 
  label,
  description,
  value,
  onChange,
  selectedDate, // Date object from InspectionDate component
  options, // Optional: override with custom options
  className = '',
  ...props 
}) {
  const [selectedTime, setSelectedTime] = useState(value || null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [loading, setLoading] = useState(false)

  // Update selectedTime when value prop changes
  useEffect(() => {
    setSelectedTime(value || null)
  }, [value])

  // Fetch available time slots for selected date
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedDate) {
        setAvailableSlots([])
        // Clear selected time when date changes
        setSelectedTime(null)
        if (onChange) {
          onChange(null)
        }
        return
      }

      try {
        setLoading(true)
        // Format date as YYYY-MM-DD
        const dateStr = selectedDate.toISOString().split('T')[0]
        
        const filters = {
          date: dateStr
        }
        
        const response = await calendarEventsAPI.getAvailableSlots(filters)
        console.log('[InspectionTime] API response for date', dateStr, ':', response)
        
        // Handle different response formats
        // The API returns an array of date objects, each with: date_ts, date_formatted, day_name, slots
        let allDateSlots = []
        if (Array.isArray(response)) {
          allDateSlots = response
        } else if (response?.slots && Array.isArray(response.slots)) {
          allDateSlots = response.slots
        } else if (response?.data && Array.isArray(response.data)) {
          allDateSlots = response.data
        } else if (response && typeof response === 'object') {
          // Try to find any array property
          const arrayKeys = Object.keys(response).filter(key => Array.isArray(response[key]))
          if (arrayKeys.length > 0) {
            allDateSlots = response[arrayKeys[0]]
          }
        }
        
        // Find the date object that matches the selected date
        const selectedDateStr = selectedDate.toISOString().split('T')[0]
        const matchingDateObj = allDateSlots.find(dateObj => {
          const dateField = dateObj.date_formatted || dateObj.date_ts
          if (!dateField) return false
          
          let dateStr = dateField
          if (typeof dateStr === 'number') {
            dateStr = new Date(dateStr).toISOString().split('T')[0]
          } else if (typeof dateStr === 'string') {
            dateStr = dateStr.split('T')[0].split(' ')[0]
          }
          return dateStr === selectedDateStr
        })
        
        // Extract slots from the matching date object
        const slots = matchingDateObj?.slots || []
        console.log('[InspectionTime] Found', slots.length, 'slots for date', selectedDateStr)
        
        // Format the slots for display
        const formattedSlots = slots
          .map((slot, index) => {
            // The API returns start_time_formatted and end_time_formatted
            // But also check for other possible field names (start_ts, end_ts, start_time, end_time)
            // Prefer timestamp fields (start_ts, end_ts) as they're more reliable for formatting
            const startTimeField = slot.start_ts || slot.start_time_formatted || slot.start_time || slot.startTime || slot.time_start || slot.time
            const endTimeField = slot.end_ts || slot.end_time_formatted || slot.end_time || slot.endTime || slot.time_end
            
            // Always format times to 12-hour format (AM/PM) using the formatTime function
            // This ensures consistent display even if API returns 24-hour format
            const startTime = formatTime(startTimeField)
            const endTime = formatTime(endTimeField)
            
            const label = startTime && endTime ? `${startTime} - ${endTime}` : (startTime || endTime || '-')
            
            return {
              label: label,
              value: slot.id || slot.slot_id, // Use slot ID as value
              slot: slot // Store full slot object for reference
            }
          })
          .sort((a, b) => {
            // Sort by start time
            const timeA = a.slot?.start_time || a.slot?.startTime || ''
            const timeB = b.slot?.start_time || b.slot?.startTime || ''
            return timeA.localeCompare(timeB)
          })
        
        console.log('[InspectionTime] Formatted time slots:', formattedSlots)
        setAvailableSlots(formattedSlots)
      } catch (error) {
        console.error('[InspectionTime] Error fetching time slots:', error)
        console.error('[InspectionTime] Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        })
        setAvailableSlots([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchTimeSlots()
  }, [selectedDate])

  // Format time string (e.g., "09:00:00" or "09:00" or timestamp -> "9:00 AM")
  const formatTime = (timeValue) => {
    if (!timeValue) return ''
    
    let timeStr = timeValue
    
    // If it's a timestamp (number), convert to time string
    if (typeof timeValue === 'number') {
      const date = new Date(timeValue)
      const hours24 = date.getHours()
      const minutes = date.getMinutes().toString().padStart(2, '0')
      timeStr = `${hours24}:${minutes}`
    }
    
    // Handle different time string formats (e.g., "21:00", "09:00:00", "9:00 AM")
    // First check if it's already in 12-hour format with AM/PM
    if (typeof timeStr === 'string' && (timeStr.includes('AM') || timeStr.includes('PM'))) {
      // Already formatted, return as-is
      return timeStr
    }
    
    // Extract hours and minutes from 24-hour format
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/)
    if (!timeMatch) return timeStr
    
    let hours = parseInt(timeMatch[1], 10)
    const minutes = timeMatch[2]
    const ampm = hours >= 12 ? 'PM' : 'AM'
    
    // Convert to 12-hour format
    if (hours === 0) {
      hours = 12
    } else if (hours > 12) {
      hours = hours - 12
    }
    
    return `${hours}:${minutes} ${ampm}`
  }

  // Use provided options if available, otherwise use fetched slots
  const timeOptions = options || availableSlots

  const handleTimeSelect = (timeValue) => {
    setSelectedTime(timeValue)
    if (onChange) {
      onChange(timeValue)
    }
  }

  return (
    <div className={`flex flex-col gap-2 items-start ${className}`} {...props}>
      {(label || description) && (
        <div className="flex flex-col gap-0">
          {label && (
            <label className="flex">
              <LabelText>{label}</LabelText>
            </label>
          )}
          {description && (
            <span 
              className="font-inter text-[12px]"
              style={{
                color: '#9A9A9A',
                letterSpacing: '-0.01em',
                fontWeight: 400,
              }}
            >
              {description}
            </span>
          )}
        </div>
      )}
      {!selectedDate && !options ? (
        <div className="text-xs text-gray-500">Please select a date first</div>
      ) : loading ? (
        <div className="text-xs text-gray-500">Loading available times...</div>
      ) : (
        <div className="flex flex-row items-center flex-wrap" style={{ gap: '5px' }}>
          {timeOptions.length === 0 ? (
            <div className="text-xs text-gray-500">No available times for this date</div>
          ) : (
            timeOptions.map((option, index) => {
          const isSelected = selectedTime === option.value
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleTimeSelect(option.value)}
              className="flex flex-row items-center justify-center border transition-all cursor-pointer"
              style={{
                backgroundColor: isSelected ? '#EDEDED' : '#FFFFFF',
                borderColor: isSelected ? '#000000' : '#D8D8D8',
                borderWidth: '1px',
                borderRadius: '8px',
                padding: '6px 15px',
                gap: '5px',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#ABABAB'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#D8D8D8'
                }
              }}
            >
              <span
                className="font-inter"
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#313131',
                  letterSpacing: '-0.01em',
                }}
              >
                {option.label}
              </span>
            </button>
          )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default InspectionTime

