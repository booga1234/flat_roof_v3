import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Trash2, ChevronsUpDown, Repeat } from 'lucide-react'
import Input from '../components/Input'
import Select from '../components/Select'
import Button from '../components/Button'
import NewPage from '../components/NewPage'
import LabelText from '../components/LabelText'
import TwoColumnLayout from '../components/TwoColumnLayout'
import NoDataFound from '../components/NoDataFound'
import Switch from '../components/Switch'
import { calendarEventsAPI } from '../utils/apiService'

function TimeSlots() {
  const [selectedEvent, setSelectedEvent] = useState(0) // Index of selected event
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false) // For auto-save updates
  const [creating, setCreating] = useState(false) // For create button
  
  const [formData, setFormData] = useState({
    days: [],
    startTime: '1:00 PM',
    endTime: '6:00 PM',
    repeat: 'weekly',
    status: 'Active'
  })

  // Day indices: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  // Days are stored in backend as JSON string: "[0,1,2]" and in frontend as array: [0, 1, 2]
  const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const repeatOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ]

  // Helper function to convert timestamp to time string
  const timestampToTimeString = (timestamp) => {
    if (typeof timestamp === 'number') {
      const date = new Date(timestamp)
      const hours = date.getHours()
      const minutes = date.getMinutes()
      const ampm = hours >= 12 ? 'PM' : 'AM'
      const displayHours = hours % 12 || 12
      const displayMinutes = minutes.toString().padStart(2, '0')
      return `${displayHours}:${displayMinutes} ${ampm}`
    }
    // If it's already a string, return it
    if (typeof timestamp === 'string') {
      return timestamp
    }
    // Default fallback
    return '1:00 PM'
  }

  // Helper function to ensure time is always a string (for UI)
  const ensureTimeString = (time) => {
    if (!time) return '1:00 PM'
    if (typeof time === 'number') {
      return timestampToTimeString(time)
    }
    if (typeof time === 'string') {
      return time
    }
    return '1:00 PM'
  }

  // Generate time options (12-hour format with AM/PM)
  const generateTimeOptions = () => {
    const times = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const displayHour = hour % 12 || 12
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const displayMinute = minute.toString().padStart(2, '0')
        const timeString = `${displayHour}:${displayMinute} ${ampm}`
        times.push({ value: timeString, label: timeString })
      }
    }
    return times
  }

  const timeOptions = generateTimeOptions()

  // Fetch events from API
  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await calendarEventsAPI.getAll()
      
      console.log('[TimeSlots] Raw API response:', response)
      console.log('[TimeSlots] Response type:', typeof response)
      console.log('[TimeSlots] Is array?', Array.isArray(response))
      
      // Handle different response formats
      const eventsArray = Array.isArray(response) 
        ? response 
        : (response?.time_slots || response?.events || response?.data || response?.items || [])
      
      console.log('[TimeSlots] Extracted events array:', eventsArray)
      console.log('[TimeSlots] Events array length:', eventsArray.length)
      
      // Transform API data to frontend format
      const transformedEvents = eventsArray.map(event => {
        console.log('[TimeSlots] Processing event:', event)
        
        // Parse days - database uses days_of_week object, convert to array of indices
        let days = []
        if (event.days_of_week) {
          // days_of_week is an object like {sunday: true, monday: true}
          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
          dayNames.forEach((dayName, index) => {
            if (event.days_of_week[dayName] === true) {
              days.push(index)
            }
          })
        } else if (event.days) {
          // Fallback: if days field exists (legacy format)
          if (typeof event.days === 'string') {
            try {
              days = JSON.parse(event.days || '[]')
            } catch (e) {
              console.warn('[TimeSlots] Failed to parse days JSON:', event.days, e)
              days = []
            }
          } else if (Array.isArray(event.days)) {
            days = event.days
          }
        }
        
        // Ensure days are numbers
        days = days.map(d => typeof d === 'number' ? d : parseInt(d, 10)).filter(d => !isNaN(d) && d >= 0 && d <= 6)
        
        // Convert start_time and end_time to time strings if they're numbers (timestamps)
        let startTime = event.start_time || event.startTime || '1:00 PM'
        let endTime = event.end_time || event.endTime || '6:00 PM'
        
        // If they're numbers (timestamps), convert to time string
        if (typeof startTime === 'number') {
          const date = new Date(startTime)
          const hours = date.getHours()
          const minutes = date.getMinutes()
          const ampm = hours >= 12 ? 'PM' : 'AM'
          const displayHours = hours % 12 || 12
          const displayMinutes = minutes.toString().padStart(2, '0')
          startTime = `${displayHours}:${displayMinutes} ${ampm}`
        }
        
        if (typeof endTime === 'number') {
          const date = new Date(endTime)
          const hours = date.getHours()
          const minutes = date.getMinutes()
          const ampm = hours >= 12 ? 'PM' : 'AM'
          const displayHours = hours % 12 || 12
          const displayMinutes = minutes.toString().padStart(2, '0')
          endTime = `${displayHours}:${displayMinutes} ${ampm}`
        }
        
        return {
          id: String(event.id),
          startTime: startTime,
          endTime: endTime,
          days: days,
          repeat: event.recurrence_pattern || event.repeat_pattern || event.repeat || 'weekly',
          status: event.is_available === false ? 'Inactive' : (event.status || 'Active'),
          lastUpdated: event.updated_at 
            ? formatDate(event.updated_at)
            : (event.lastUpdated || 'Never')
        }
      })
      
      console.log('[TimeSlots] Transformed events:', transformedEvents)
      
      setEvents(transformedEvents)
      if (transformedEvents.length > 0 && selectedEvent >= transformedEvents.length) {
        setSelectedEvent(0)
      }
      
      // Return the transformed events so callers can use them
      return transformedEvents
    } catch (err) {
      console.error('[TimeSlots] Error fetching calendar events:', err)
      // Don't show error if it's just that the endpoint doesn't exist - treat as empty state
      const errorMsg = err.message || 'Failed to load calendar events'
      if (errorMsg.includes('Unable to locate') || errorMsg.includes('404') || errorMsg.includes('not found')) {
        // Endpoint doesn't exist yet, treat as empty state
        setError(null)
        setEvents([])
        return []
      } else {
        setError(errorMsg)
        setEvents([])
        return []
      }
    } finally {
      setLoading(false)
    }
  }, [selectedEvent])

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hours = date.getHours()
      const minutes = date.getMinutes()
      const ampm = hours >= 12 ? 'PM' : 'AM'
      const displayHours = hours % 12 || 12
      const displayMinutes = minutes.toString().padStart(2, '0')
      return `${month}/${day}, ${displayHours}:${displayMinutes} ${ampm}`
    } catch (e) {
      return 'Never'
    }
  }

  // Format days for display
  // Day indices: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  const formatDays = (days) => {
    if (!days || days.length === 0) return ''
    const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days.map(d => dayNamesShort[d]).filter(Boolean).join(', ')
  }

  // Auto-save when form data changes (with debounce)
  const saveTimeoutRef = useRef(null)
  const isInitializingRef = useRef(false)
  const formDataRef = useRef(formData)
  
  // Keep formDataRef in sync with formData
  useEffect(() => {
    formDataRef.current = formData
  }, [formData])
  
  // Save event function - uses ref to avoid stale closures
  const saveEvent = useCallback(async (eventId) => {
    console.log('[TimeSlots] saveEvent called with eventId:', eventId, 'type:', typeof eventId)
    if (!eventId) {
      console.error('[TimeSlots] saveEvent called but no eventId provided')
      return
    }
    
    // Get the latest formData from ref
    const currentFormData = formDataRef.current
    console.log('[TimeSlots] Using formData from ref:', JSON.stringify(currentFormData, null, 2))
    
    try {
      console.log('[TimeSlots] ===== STARTING SAVE =====')
      console.log('[TimeSlots] Event ID:', eventId)
      console.log('[TimeSlots] Current formData:', JSON.stringify(currentFormData, null, 2))
      setSaving(true)
      
      // Ensure days is always an array of numbers before sending
      // Convert startTime and endTime to strings if they're numbers (timestamps)
      let startTime = currentFormData.startTime || '1:00 PM'
      let endTime = currentFormData.endTime || '6:00 PM'
      
      // If they're numbers (timestamps), convert to time string
      if (typeof startTime === 'number') {
        const date = new Date(startTime)
        const hours = date.getHours()
        const minutes = date.getMinutes()
        const ampm = hours >= 12 ? 'PM' : 'AM'
        const displayHours = hours % 12 || 12
        const displayMinutes = minutes.toString().padStart(2, '0')
        startTime = `${displayHours}:${displayMinutes} ${ampm}`
      }
      
      if (typeof endTime === 'number') {
        const date = new Date(endTime)
        const hours = date.getHours()
        const minutes = date.getMinutes()
        const ampm = hours >= 12 ? 'PM' : 'AM'
        const displayHours = hours % 12 || 12
        const displayMinutes = minutes.toString().padStart(2, '0')
        endTime = `${displayHours}:${displayMinutes} ${ampm}`
      }
      
      // Always send days array, even if empty (to clear all selected days)
      const daysArray = Array.isArray(currentFormData.days) ? currentFormData.days : []
      const dataToSave = {
        days: daysArray,
        startTime: startTime,
        endTime: endTime,
        repeat: currentFormData.repeat || 'weekly',
        status: currentFormData.status || 'Active'
      }
      
      console.log('[TimeSlots] ===== CALLING API =====')
      console.log('[TimeSlots] Data being sent to API:', JSON.stringify(dataToSave, null, 2))
      console.log('[TimeSlots] Days array:', dataToSave.days, 'Type:', typeof dataToSave.days, 'IsArray:', Array.isArray(dataToSave.days), 'Length:', dataToSave.days.length)
      console.log('[TimeSlots] Start time:', dataToSave.startTime, 'End time:', dataToSave.endTime)
      console.log('[TimeSlots] Calling calendarEventsAPI.update with:', { eventId, dataToSave })
      
      const result = await calendarEventsAPI.update(eventId, dataToSave)
      console.log('[TimeSlots] ===== API RESPONSE RECEIVED =====')
      console.log('[TimeSlots] API response:', JSON.stringify(result, null, 2))
      console.log('[TimeSlots] Successfully saved event')
      
      // Update the local events state optimistically without full refresh
      // This prevents UI flashing/jumping
      setEvents(prevEvents => {
        return prevEvents.map(event => {
          if (event.id === eventId) {
            // Update the event with all form data
            return {
              ...event,
              days: currentFormData.days,
              startTime: startTime,
              endTime: endTime,
              repeat: currentFormData.repeat || 'weekly',
              status: currentFormData.status || 'Active',
              lastUpdated: formatDate(new Date().toISOString())
            }
          }
          return event
        })
      })
    } catch (err) {
      console.error('[TimeSlots] Error saving calendar event:', err)
      console.error('[TimeSlots] Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      })
      setError(err.message || 'Failed to save calendar event')
    } finally {
      setSaving(false)
    }
  }, []) // No dependencies - uses ref to get latest formData

  // Update form data when event changes
  useEffect(() => {
    isInitializingRef.current = true
    const event = events.length > 0 ? (events[selectedEvent] || events[0]) : null
    if (event) {
      // Ensure times are always strings for the UI
      const startTimeStr = ensureTimeString(event.startTime)
      const endTimeStr = ensureTimeString(event.endTime)
      console.log('[TimeSlots] Setting formData from event:', {
        originalStartTime: event.startTime,
        convertedStartTime: startTimeStr,
        originalEndTime: event.endTime,
        convertedEndTime: endTimeStr
      })
      setFormData({
        days: event.days || [],
        startTime: startTimeStr,
        endTime: endTimeStr,
        repeat: event.repeat || 'weekly',
        status: event.status || 'Active'
      })
    } else {
      setFormData({
        days: [],
        startTime: '1:00 PM',
        endTime: '6:00 PM',
        repeat: 'weekly',
        status: 'Active'
      })
    }
    // Allow saves after a brief delay
    setTimeout(() => {
      isInitializingRef.current = false
    }, 100)
  }, [selectedEvent, events])
  
  // Auto-save when form data changes (with debounce)
  useEffect(() => {
    // Calculate current event inside useEffect
    const currentEvent = events.length > 0 ? (events[selectedEvent] || events[0]) : null
    
    // Don't save when initializing form data from selected event
    if (isInitializingRef.current || !currentEvent || loading) {
      console.log('[TimeSlots] Auto-save skipped:', {
        isInitializing: isInitializingRef.current,
        hasCurrentEvent: !!currentEvent,
        loading
      })
      return
    }
    
    console.log('[TimeSlots] Form data changed, scheduling auto-save in 800ms', {
      startTime: formData.startTime,
      endTime: formData.endTime,
      days: formData.days
    })
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    // Set new timeout to save after 800ms of no changes
    const timeoutId = setTimeout(() => {
      console.log('[TimeSlots] Auto-save timeout triggered, calling saveEvent')
      console.log('[TimeSlots] Current formDataRef:', JSON.stringify(formDataRef.current, null, 2))
      console.log('[TimeSlots] Current event ID:', currentEvent.id)
      if (currentEvent && currentEvent.id) {
        saveEvent(currentEvent.id)
      } else {
        console.error('[TimeSlots] Cannot save - no event ID')
      }
    }, 800)
    
    saveTimeoutRef.current = timeoutId
    
    return () => {
      console.log('[TimeSlots] Auto-save useEffect cleanup - clearing timeout')
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = null
      }
    }
  }, [formData, events, selectedEvent, loading, saveEvent])

  // Calculate current event for use throughout component
  const currentEvent = events.length > 0 ? (events[selectedEvent] || events[0]) : null

  const handleDayToggle = (dayIndex) => {
    console.log('[TimeSlots] Toggling day index:', dayIndex)
    setFormData(prev => {
      const currentDays = Array.isArray(prev.days) ? prev.days : []
      // Ensure dayIndex is a number for proper comparison
      const dayNum = Number(dayIndex)
      // Check if day is already selected
      const isSelected = currentDays.some(d => Number(d) === dayNum)
      const newDays = isSelected
        ? currentDays.filter(d => Number(d) !== dayNum).sort((a, b) => Number(a) - Number(b))
        : [...currentDays, dayNum].sort((a, b) => Number(a) - Number(b))
      console.log('[TimeSlots] Days changed from', JSON.stringify(currentDays), 'to', JSON.stringify(newDays))
      console.log('[TimeSlots] Will trigger auto-save with new days array')
      return { ...prev, days: newDays }
    })
  }

  const handleInputChange = (field) => (e) => {
    const value = e.target ? e.target.value : e
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleRepeatChange = (value) => {
    setFormData(prev => ({ ...prev, repeat: value }))
  }

  const handleStartTimeChange = useCallback((value) => {
    console.log('[TimeSlots] ===== handleStartTimeChange CALLED =====')
    console.log('[TimeSlots] New value:', value, 'Type:', typeof value)
    setFormData(prev => {
      console.log('[TimeSlots] Previous formData:', prev)
      const updated = { ...prev, startTime: value }
      console.log('[TimeSlots] Updated formData in setState:', updated)
      console.log('[TimeSlots] New startTime:', updated.startTime)
      return updated
    })
  }, [])

  const handleEndTimeChange = useCallback((value) => {
    console.log('[TimeSlots] ===== handleEndTimeChange CALLED =====')
    console.log('[TimeSlots] New value:', value, 'Type:', typeof value)
    setFormData(prev => {
      console.log('[TimeSlots] Previous formData:', prev)
      const updated = { ...prev, endTime: value }
      console.log('[TimeSlots] Updated formData in setState:', updated)
      console.log('[TimeSlots] New endTime:', updated.endTime)
      return updated
    })
  }, [])

  const handleDelete = async () => {
    if (!currentEvent) return
    
    try {
      setSaving(true)
      await calendarEventsAPI.delete(currentEvent.id)
      
      // Refresh events list
      await fetchEvents()
      
      // Adjust selected index
      if (events.length > 1) {
        const newIndex = selectedEvent >= events.length - 1 ? events.length - 2 : selectedEvent
        setSelectedEvent(Math.max(0, newIndex))
      } else {
        setSelectedEvent(0)
      }
    } catch (err) {
      console.error('Error deleting calendar event:', err)
      setError(err.message || 'Failed to delete calendar event')
    } finally {
      setSaving(false)
    }
  }

  const handleCreate = useCallback(async () => {
    try {
      setCreating(true)
      setError(null)
      const newEventData = {
        startTime: '1:00 PM',
        endTime: '6:00 PM',
        days: [],
        repeat: 'weekly',
        status: 'Active'
      }
      
      console.log('[TimeSlots] Creating new calendar event with data:', newEventData)
      const createdEvent = await calendarEventsAPI.create(newEventData)
      console.log('[TimeSlots] Created event response:', createdEvent)
      
      // Get the ID of the newly created event from the response
      const newEventId = createdEvent?.id || createdEvent?.data?.id || createdEvent?.event?.id
      console.log('[TimeSlots] Extracted new event ID:', newEventId)
      
      // Refresh events list and get the updated events
      const updatedEvents = await fetchEvents()
      console.log('[TimeSlots] Updated events after create:', updatedEvents)
      
      // Find and select the newly created event
      let selectedIndex = -1
      if (newEventId && updatedEvents) {
        const eventIndex = updatedEvents.findIndex(e => String(e.id) === String(newEventId))
        console.log('[TimeSlots] Found new event at index:', eventIndex)
        if (eventIndex >= 0) {
          selectedIndex = eventIndex
        } else {
          // If not found by ID, select the last event (most recently created)
          console.log('[TimeSlots] Event not found by ID, selecting last event')
          selectedIndex = updatedEvents.length > 0 ? updatedEvents.length - 1 : 0
        }
      } else if (updatedEvents && updatedEvents.length > 0) {
        // If no ID in response, select the last event
        console.log('[TimeSlots] No event ID in response, selecting last event')
        selectedIndex = updatedEvents.length - 1
      }
      
      // Set the selected event and ensure default times are set for new events
      if (selectedIndex >= 0 && updatedEvents && updatedEvents[selectedIndex]) {
        // Update the event in the events array to ensure it has default times
        setEvents(prevEvents => {
          const updated = [...prevEvents]
          if (updated[selectedIndex]) {
            updated[selectedIndex] = {
              ...updated[selectedIndex],
              startTime: '1:00 PM',
              endTime: '6:00 PM'
            }
          }
          return updated
        })
        setSelectedEvent(selectedIndex)
      }
    } catch (err) {
      console.error('[TimeSlots] Error creating calendar event:', err)
      const errorMessage = err.message || 'Failed to create calendar event'
      setError(errorMessage)
    } finally {
      setCreating(false)
    }
  }, [fetchEvents])

  // Time Select Component
  const TimeSelect = ({ value, onChange, label, description }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const selectRef = useRef(null)
    const buttonRef = useRef(null)
    const dropdownRef = useRef(null)

    // Debug: Log when value prop changes
    useEffect(() => {
      console.log(`[TimeSelect ${label}] Value prop changed to:`, value)
    }, [value, label])

    const filteredOptions = timeOptions.filter(opt =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    )

    useEffect(() => {
      const handleClickOutside = (event) => {
        // Check if click is outside both the select button and the dropdown (which is in a portal)
        const isClickInSelect = selectRef.current && selectRef.current.contains(event.target)
        const isClickInDropdown = dropdownRef.current && dropdownRef.current.contains(event.target)
        
        if (!isClickInSelect && !isClickInDropdown) {
          setIsOpen(false)
          setSearchQuery('')
        }
      }

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside)
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isOpen])

    const handleSelect = (timeValue) => {
      console.log('[TimeSelect] handleSelect called with value:', timeValue)
      console.log('[TimeSelect] onChange function type:', typeof onChange)
      console.log('[TimeSelect] Current value prop:', value)
      console.log('[TimeSelect] Calling onChange with:', timeValue)
      onChange(timeValue)
      console.log('[TimeSelect] onChange called, closing dropdown')
      setIsOpen(false)
      setSearchQuery('')
    }

    return (
      <div className={`flex flex-col gap-2 items-start relative`} ref={selectRef}>
        {(label || description) && (
          <div className="flex flex-col gap-0">
            {label && (
              <label className="flex">
                {typeof label === 'string' ? <LabelText>{label}</LabelText> : label}
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
        <div className="relative w-full">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex flex-row items-center justify-between bg-white border outline-none focus:ring-0 text-left font-inter font-medium text-[12px] transition-colors"
            style={{
              boxSizing: 'border-box',
              textAlign: 'left',
              padding: '6px 8px',
              borderRadius: '6px',
              border: '1px solid #D8D8D8',
              borderColor: isOpen ? '#C2C2C2' : '#D8D8D8',
              letterSpacing: '-0.01em',
              fontWeight: 500,
              height: '27px'
            }}
          >
            <span style={{ color: value ? '#313131' : '#9A9A9A', fontWeight: value ? 500 : 500 }}>
              {(() => {
                const displayValue = ensureTimeString(value)
                console.log(`[TimeSelect ${label}] Rendering button with value:`, value, 'converted to:', displayValue)
                return displayValue || 'Select time'
              })()}
            </span>
            <ChevronsUpDown 
              size={12}
              strokeWidth={1.5}
              className="text-[#6F6F6F] flex-shrink-0"
              style={{ stroke: '#6F6F6F' }}
            />
          </button>

          {isOpen && createPortal(
            <div 
              ref={dropdownRef}
              className="fixed bg-white rounded-[8px] overflow-hidden z-[99999]"
              style={{
                top: (buttonRef.current?.getBoundingClientRect().bottom || 0) + 4 + 'px',
                left: (buttonRef.current?.getBoundingClientRect().left || 0) + 'px',
                minWidth: (buttonRef.current?.getBoundingClientRect().width || 253) + 'px',
                maxHeight: '300px',
                padding: '5px',
                border: '0.5px solid #E2E2E2',
                boxShadow: '0px 2px 9.3px rgba(0, 0, 0, 0.06)',
              }}
            >
              <div className="flex flex-row items-center gap-[5px] px-2 py-1.5 bg-white rounded-[6px] border border-[#868686] mb-[5px]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="flex-1 outline-none bg-transparent font-inter text-[12px] font-medium"
                  style={{
                    letterSpacing: '-0.01em',
                    color: searchQuery ? '#313131' : '#9A9A9A',
                  }}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: '250px' }}>
                {filteredOptions.map((option) => {
                  // Ensure both values are strings for comparison
                  const valueStr = typeof value === 'string' ? value : ensureTimeString(value)
                  const isSelected = valueStr === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelect(option.value)
                      }}
                      className={`w-full flex flex-row items-center gap-[5px] px-2 py-1.5 text-left font-inter text-[12px] rounded-[6px] ${
                        isSelected ? 'bg-[#ECECEC]' : 'bg-white hover:bg-[#ECECEC]'
                      }`}
                      style={{
                        letterSpacing: '-0.01em',
                        fontWeight: isSelected ? 550 : 500,
                        color: '#282828',
                      }}
                    >
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
                          <path d="M10 3L4.5 8.5L2 6" stroke="#282828" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      {!isSelected && <div className="w-3 h-3 flex-shrink-0" />}
                      <span>{option.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>,
            document.body
          )}
        </div>
      </div>
    )
  }

  return (
    <NewPage>
      {/* Page Header */}
      <div
        className="flex flex-row items-center justify-between"
        style={{
          padding: '15px 18px',
          borderBottom: '1px solid #F3F3F3'
        }}
      >
        <h1
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '18px',
            fontWeight: 500,
            letterSpacing: '-0.01em',
            color: '#000000',
            margin: 0
          }}
        >
          Time slots
        </h1>
        <Button variant="dark" onClick={handleCreate} disabled={creating || loading}>
          <Plus size={14} />
          <span>{creating ? 'Creating...' : 'Create'}</span>
        </Button>
      </div>

      {/* Main Content Area */}
      <TwoColumnLayout
        leftContent={
          <>
            {events.length > 0 && (
              <div
                className="flex flex-row items-center"
                style={{
                  padding: '0px 10px',
                  gap: '10px'
                }}
              >
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    fontWeight: 550,
                    color: '#5D5D5D',
                    letterSpacing: '-0.01em'
                  }}
                >
                  Time slots
                </span>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-8">
                <span style={{ color: '#676767', fontSize: '12px' }}>Loading events...</span>
              </div>
            )}

            {!loading && events.length === 0 && (
              <div className="flex items-center justify-center flex-1" style={{ minHeight: 0 }}>
                <NoDataFound onButtonClick={handleCreate} />
              </div>
            )}

            <div className="flex flex-col gap-2">
              {events.map((event, index) => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(index)}
                  className="flex flex-col cursor-pointer transition-all"
                  style={{
                    backgroundColor: selectedEvent === index ? '#EDEDED' : '#FFFFFF',
                    borderRadius: '10px',
                    padding: '15px'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedEvent !== index) {
                      e.currentTarget.style.backgroundColor = '#F5F5F5'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedEvent !== index) {
                      e.currentTarget.style.backgroundColor = '#FFFFFF'
                    }
                  }}
                >
                  <div className="flex flex-row items-center justify-between w-full mb-2">
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#202020',
                        letterSpacing: '-0.01em'
                      }}
                    >
                      {event.startTime} - {event.endTime}
                    </span>
                    <div className="flex flex-row items-center" style={{ gap: '5px' }}>
                      <Repeat 
                        size={12} 
                        style={{ 
                          color: '#4B4B4B',
                          strokeWidth: 2
                        }} 
                      />
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#4B4B4B',
                          letterSpacing: '-0.01em'
                        }}
                      >
                        {event.repeat ? event.repeat.charAt(0).toUpperCase() + event.repeat.slice(1) : 'Weekly'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row items-center justify-between w-full">
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#4B4B4B',
                        letterSpacing: '-0.01em'
                      }}
                    >
                      {formatDays(event.days)}
                    </span>
                    <div className="flex flex-row items-center gap-2">
                      <div
                        style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          backgroundColor: event.status === 'Active' ? '#66E742' : '#E74242',
                          boxShadow: event.status === 'Active' 
                            ? '0 0 4px rgba(102, 231, 66, 0.4)' 
                            : '0 0 4px rgba(231, 66, 66, 0.4)'
                        }}
                      />
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '11px',
                          fontWeight: 500,
                          color: '#9A9A9A',
                          letterSpacing: '-0.01em'
                        }}
                      >
                        {event.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        }
        rightContent={
          <div
            style={{
              maxWidth: currentEvent ? '50rem' : 'none',
              margin: '0',
              gap: '30px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {!currentEvent && !loading && (
              <div className="flex items-center justify-center flex-1" style={{ minHeight: 0 }}>
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                    color: '#000000'
                  }}
                >
                  Select a time slot to view details.
                </span>
              </div>
            )}

            {currentEvent && (
              <>
                {/* Date Section */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2 items-start">
                    <label className="flex">
                      <LabelText>Days</LabelText>
                    </label>
                    <div className="flex flex-row flex-wrap" style={{ gap: '12px' }}>
                      {dayLabels.map((day, index) => {
                      const isSelected = formData.days.some(d => Number(d) === index)
                      return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleDayToggle(index)}
                        className="flex items-center justify-center"
                        style={{
                          padding: '6px 15px',
                          borderRadius: '8px',
                          border: `1px solid ${isSelected ? '#000000' : '#D8D8D8'}`,
                          backgroundColor: isSelected ? '#EDEDED' : '#FFFFFF',
                          color: '#282828',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '12px',
                          fontWeight: 500,
                          letterSpacing: '-0.01em',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = '#ABABAB'
                            e.currentTarget.style.backgroundColor = '#F5F5F5'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = '#D8D8D8'
                            e.currentTarget.style.backgroundColor = '#FFFFFF'
                          } else {
                            e.currentTarget.style.borderColor = '#000000'
                            e.currentTarget.style.backgroundColor = '#EDEDED'
                          }
                        }}
                      >
                        {day}
                      </button>
                      )
                    })}
                    </div>
                  </div>
                </div>

                {/* Start Time */}
                <div className="flex flex-col gap-4">
                  <TimeSelect
                    key={`start-time-${formData.startTime}`}
                    label="Start time"
                    value={ensureTimeString(formData.startTime)}
                    onChange={handleStartTimeChange}
                  />
                </div>

                {/* End Time */}
                <div className="flex flex-col gap-4">
                  <TimeSelect
                    key={`end-time-${formData.endTime}`}
                    label="End time"
                    value={ensureTimeString(formData.endTime)}
                    onChange={handleEndTimeChange}
                  />
                </div>

                {/* Repeat */}
                <div className="flex flex-col gap-4">
                  <Select
                    label="Repeat"
                    options={repeatOptions}
                    value={formData.repeat}
                    onChange={handleRepeatChange}
                  />
                </div>

                {/* Active */}
                <div className="flex flex-col gap-2 items-start">
                  <label className="flex">
                    <LabelText>Active</LabelText>
                  </label>
                  <Switch
                    checked={formData.status === 'Active'}
                    onChange={(checked) => {
                      setFormData(prev => ({ ...prev, status: checked ? 'Active' : 'Inactive' }))
                    }}
                  />
                </div>

                {/* Delete Button */}
                <div className="flex flex-row items-center gap-2">
                  <Button
                    variant="white"
                    onClick={handleDelete}
                  >
                    <Trash2 size={12} style={{ color: '#000000' }} />
                  </Button>
                  <div className="flex-1" />
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '11px',
                      fontWeight: 400,
                      color: '#676767',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Updated {currentEvent.lastUpdated || 'Never'}
                  </span>
                </div>
              </>
            )}
          </div>
        }
      />
    </NewPage>
  )
}

export default TimeSlots

