import { useState, useEffect } from 'react'
import LabelText from './LabelText'
import { calendarEventsAPI } from '../utils/apiService'

function InspectionDate({ 
  label,
  description,
  value,
  onChange,
  className = '',
  ...props 
}) {
  const [selectedDate, setSelectedDate] = useState(value || null)
  const [availableDates, setAvailableDates] = useState([])
  const [loading, setLoading] = useState(true)

  // Update selectedDate when value prop changes
  useEffect(() => {
    setSelectedDate(value || null)
  }, [value])

  // Fetch available time slots from API
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      try {
        setLoading(true)
        // Get available slots for the next 7 days
        const today = new Date()
        const nextWeek = new Date(today)
        nextWeek.setDate(today.getDate() + 7)
        
        const filters = {
          start_date: today.toISOString().split('T')[0],
          end_date: nextWeek.toISOString().split('T')[0]
        }
        
        const response = await calendarEventsAPI.getAvailableSlots(filters)
        console.log('[InspectionDate] API response:', response)
        console.log('[InspectionDate] Response type:', typeof response)
        console.log('[InspectionDate] Is array?', Array.isArray(response))
        
        // Handle different response formats
        let slots = []
        if (Array.isArray(response)) {
          slots = response
        } else if (response?.slots && Array.isArray(response.slots)) {
          slots = response.slots
        } else if (response?.data && Array.isArray(response.data)) {
          slots = response.data
        } else if (response && typeof response === 'object') {
          // Try to find any array property
          const arrayKeys = Object.keys(response).filter(key => Array.isArray(response[key]))
          if (arrayKeys.length > 0) {
            slots = response[arrayKeys[0]]
            console.log('[InspectionDate] Found slots in property:', arrayKeys[0])
          }
        }
        
        console.log('[InspectionDate] Available slots:', slots)
        console.log('[InspectionDate] Slots count:', slots.length)
        
        // Extract unique dates from available slots
        // The API returns slots grouped by date with: date_ts, date_formatted, day_name, slots
        const dateSet = new Set()
        slots.forEach((slot, index) => {
          // The date field is date_formatted (YYYY-MM-DD format) or date_ts (timestamp)
          const dateField = slot.date_formatted || slot.date_ts
          
          if (dateField) {
            let dateStr = dateField
            // If it's a timestamp, convert to date string
            if (typeof dateStr === 'number') {
              dateStr = new Date(dateStr).toISOString().split('T')[0]
            } else if (typeof dateStr === 'string') {
              // Remove time if present (YYYY-MM-DD format)
              dateStr = dateStr.split('T')[0].split(' ')[0]
            }
            dateSet.add(dateStr)
          }
        })
        
        // Convert date strings to Date objects and sort
        const dates = Array.from(dateSet)
          .map(dateStr => {
            // Create date at midnight to avoid timezone issues
            const dateParts = dateStr.split('-')
            return new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]))
          })
          .filter(date => !isNaN(date.getTime()))
          .sort((a, b) => a - b)
        
        console.log('[InspectionDate] Available dates extracted:', dates)
        setAvailableDates(dates)
        
        // Auto-select the earliest date if no date is currently selected
        if (dates.length > 0 && !value && !selectedDate) {
          const earliestDate = dates[0]
          console.log('[InspectionDate] Auto-selecting earliest date:', earliestDate)
          setSelectedDate(earliestDate)
          // Call onChange to notify parent component
          if (onChange) {
            onChange(earliestDate)
          }
        }
      } catch (error) {
        console.error('[InspectionDate] Error fetching available slots:', error)
        console.error('[InspectionDate] Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        })
        // Don't show fallback dates - only show dates that have available slots
        // If API fails, show empty array so user knows there are no available dates
        setAvailableDates([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchAvailableSlots()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dateOptions = availableDates

  const formatDateCard = (date) => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    
    const dayName = days[date.getDay()]
    const monthName = months[date.getMonth()]
    const dayNumber = date.getDate()
    
    return {
      dayName,
      monthName,
      dayNumber,
      fullDate: date
    }
  }

  const isDateSelected = (date) => {
    if (!selectedDate) return false
    const selected = new Date(selectedDate)
    return (
      date.getDate() === selected.getDate() &&
      date.getMonth() === selected.getMonth() &&
      date.getFullYear() === selected.getFullYear()
    )
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    if (onChange) {
      onChange(date)
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
      {loading ? (
        <div className="text-xs text-gray-500">Loading available dates...</div>
      ) : (
        <div className="flex flex-row items-center gap-2 flex-wrap">
          {dateOptions.length === 0 ? (
            <div className="text-xs text-gray-500">No available dates found</div>
          ) : (
            dateOptions.map((date, index) => {
          const formatted = formatDateCard(date)
          const isSelected = isDateSelected(date)
          // Use date string as key for better React reconciliation
          const dateKey = date.toISOString().split('T')[0]
          
          return (
            <button
              key={dateKey || index}
              type="button"
              onClick={() => handleDateSelect(date)}
              className="flex flex-col items-center justify-center border transition-all cursor-pointer"
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
                  lineHeight: '1.2',
                }}
              >
                {formatted.dayName}
              </span>
              <span
                className="font-inter"
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#313131',
                  letterSpacing: '-0.01em',
                  lineHeight: '1.2',
                }}
              >
                {formatted.monthName}
              </span>
              <span
                className="font-inter"
                style={{
                  fontSize: '20px',
                  fontWeight: 500,
                  color: '#313131',
                  letterSpacing: '-0.01em',
                  lineHeight: '1.2',
                }}
              >
                {formatted.dayNumber}
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

export default InspectionDate

