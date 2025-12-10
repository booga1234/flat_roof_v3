import { useState, useEffect, useCallback } from 'react'
import { Plus, Calendar, X, Repeat, Pencil } from 'lucide-react'
import Button from './Button'
import IconButton from './IconButton'
import Modal from './Modal'
import Select from './Select'
import LabelText from './LabelText'
import Badge from './Badge'
import StatusIndicator from './StatusIndicator'
import Textarea from './Textarea'
import SegmentedControl from './SegmentedControl'
import ConfirmDialog from './ConfirmDialog'
import { API_CONTACTS_BASE_URL, API_BASE_URL } from '../config/api'

function InspectionSelect({ 
  onInspectionChange, 
  onInspectionDelete, 
  selectedSlot = null,
  selectedDate = null,
  selectedTime = null,
  disabled = false,
  disabledReason = '',
  propertyId = null,
  leadId = null,
  inspectionId = null
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false)
  const [slots, setSlots] = useState([])
  const [inspectionTypes, setInspectionTypes] = useState([])
  const [inspectors, setInspectors] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [editError, setEditError] = useState(null)
  const [replaceError, setReplaceError] = useState(null)
  const [currentLocationId, setCurrentLocationId] = useState(null)
  
  // Existing inspection data (fetched from API)
  const [existingInspection, setExistingInspection] = useState(null)
  const [existingBooking, setExistingBooking] = useState(null)
  const [loadingExisting, setLoadingExisting] = useState(false)
  
  // Edit form state
  const [editInspectorId, setEditInspectorId] = useState(null)
  const [editInspectionTypeId, setEditInspectionTypeId] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)
  
  // Cancel/Reschedule state
  const [cancellationReason, setCancellationReason] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [rescheduling, setRescheduling] = useState(false)
  const [selectedAction, setSelectedAction] = useState('Cancel') // 'Cancel' | 'Reschedule'
  
  // Reschedule form state
  const [rescheduleDate, setRescheduleDate] = useState(null)
  const [rescheduleTime, setRescheduleTime] = useState(null)
  const [rescheduleWillSomeoneBePresent, setRescheduleWillSomeoneBePresent] = useState(null)
  
  // Confirm dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  
  // Pending selections (before confirmation)
  const [pendingDate, setPendingDate] = useState(null)
  const [pendingTime, setPendingTime] = useState(null)
  const [pendingWillSomeoneBePresent, setPendingWillSomeoneBePresent] = useState(null)
  const [pendingInspectionType, setPendingInspectionType] = useState(null)
  
  // Confirmed selections
  const [confirmedSlot, setConfirmedSlot] = useState(selectedSlot)
  const [confirmedDate, setConfirmedDate] = useState(selectedDate)
  const [confirmedTime, setConfirmedTime] = useState(selectedTime)
  const [confirmedWillSomeoneBePresent, setConfirmedWillSomeoneBePresent] = useState(null)
  const [confirmedInspectionType, setConfirmedInspectionType] = useState(null)
  const [confirmedBooking, setConfirmedBooking] = useState(null)

  // Fetch existing inspection data
  const fetchExistingInspection = useCallback(async (insId) => {
    if (!insId) return
    
    try {
      setLoadingExisting(true)
      const token = localStorage.getItem('authToken')
      const headers = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`${API_CONTACTS_BASE_URL}/inspections/${insId}?inspection_id=${insId}`, {
        method: 'GET',
        headers,
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('[InspectionSelect] Fetched inspection data:', data)
        setExistingInspection(data.inspection || null)
        // Get the booking - API now returns single object instead of array
        const booking = data.inspection_bookings || null
        console.log('[InspectionSelect] Booking:', booking)
        setExistingBooking(booking)
      } else {
        console.error('[InspectionSelect] Failed to fetch inspection:', response.status)
      }
    } catch (err) {
      console.error('[InspectionSelect] Error fetching existing inspection:', err)
    } finally {
      setLoadingExisting(false)
    }
  }, [])

  // Fetch existing inspection when inspectionId changes
  useEffect(() => {
    console.log('[InspectionSelect] inspectionId prop:', inspectionId)
    if (inspectionId) {
      fetchExistingInspection(inspectionId)
      // Clear confirmed booking when fetching existing inspection
      setConfirmedBooking(null)
    } else {
      setExistingInspection(null)
      setExistingBooking(null)
      setConfirmedBooking(null)
    }
  }, [inspectionId, fetchExistingInspection])

  // Fetch current_location_id from auth/me
  const fetchCurrentLocationId = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return null
      
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        return userData.current_location_id || null
      }
      return null
    } catch (err) {
      console.error('[InspectionSelect] Error fetching current location:', err)
      return null
    }
  }, [])

  // Fetch available slots
  const fetchSlots = useCallback(async (locationId) => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('authToken')
      const headers = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      // Build URL with location_id
      let url = `${API_CONTACTS_BASE_URL}/inspection-slot-availability`
      if (locationId) {
        url += `?location_id=${locationId}`
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch slots: ${response.status}`)
      }
      
      const data = await response.json()
      setSlots(data || [])
    } catch (err) {
      console.error('[InspectionSelect] Error fetching slots:', err)
      setError(err.message)
      setSlots([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch inspection types
  const fetchInspectionTypes = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken')
      const headers = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`${API_CONTACTS_BASE_URL}/inspection_types`, {
        method: 'GET',
        headers,
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch inspection types: ${response.status}`)
      }
      
      const data = await response.json()
      // Filter to only active inspection types
      const activeTypes = Array.isArray(data) ? data.filter(type => type.active !== false) : []
      setInspectionTypes(activeTypes || [])
    } catch (err) {
      console.error('[InspectionSelect] Error fetching inspection types:', err)
      setInspectionTypes([])
    }
  }, [])

  // Fetch inspectors (user_inspectors)
  const fetchInspectors = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken')
      const headers = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`${API_CONTACTS_BASE_URL}/user_inspectors`, {
        method: 'GET',
        headers,
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch inspectors: ${response.status}`)
      }
      
      const data = await response.json()
      // Handle both array response and paginated response
      const inspectorsList = Array.isArray(data) ? data : (data.items || data.data || [])
      setInspectors(inspectorsList)
    } catch (err) {
      console.error('[InspectionSelect] Error fetching inspectors:', err)
      setInspectors([])
    }
  }, [])

  // Handle opening edit modal
  const handleOpenEditModal = useCallback(() => {
    if (!existingInspection) return
    
    // Pre-populate form with existing values
    setEditInspectorId(existingInspection.user_id || existingInspection.inspector_id || null)
    setEditInspectionTypeId(existingInspection.inspection_type_id || null)
    setEditError(null)
    setIsEditModalOpen(true)
  }, [existingInspection])

  // Handle saving inspection edit
  const handleSaveInspectionEdit = async () => {
    if (!inspectionId) return
    
    setSavingEdit(true)
    setEditError(null)
    
    try {
      const token = localStorage.getItem('authToken')
      const headers = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      // Build payload - include inspections_id as required by the API
      const payload = {
        inspections_id: inspectionId
      }
      if (editInspectorId !== null) {
        payload.user_id = editInspectorId
      }
      if (editInspectionTypeId !== null) {
        payload.inspection_type_id = editInspectionTypeId
      }
      
      console.log('[InspectionSelect] Updating inspection with payload:', payload)
      
      const response = await fetch(`${API_CONTACTS_BASE_URL}/inspections/${inspectionId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to update inspection: ${response.status}`)
      }
      
      const updatedInspection = await response.json()
      console.log('[InspectionSelect] Inspection updated:', updatedInspection)
      
      // Refresh the inspection data
      await fetchExistingInspection(inspectionId)
      
      // Close modal
      setIsEditModalOpen(false)
      
      // Notify parent if callback provided
      if (onInspectionChange) {
        onInspectionChange({
          inspection: updatedInspection,
          type: 'edit'
        })
      }
    } catch (err) {
      console.error('[InspectionSelect] Error updating inspection:', err)
      setEditError(err.message)
    } finally {
      setSavingEdit(false)
    }
  }

  // Handle opening replace modal
  const handleOpenReplaceModal = useCallback(() => {
    setCancellationReason('')
    setReplaceError(null)
    setSelectedAction('Cancel')
    setRescheduleDate(null)
    setRescheduleTime(null)
    setRescheduleWillSomeoneBePresent(existingBooking?.will_someone_be_present || confirmedWillSomeoneBePresent || null)
    setIsReplaceModalOpen(true)
  }, [existingBooking, confirmedWillSomeoneBePresent])

  // Handle cancel inspection
  const handleCancelInspection = async () => {
    const bookingId = existingBooking?.id || confirmedBooking?.id
    const insId = inspectionId || existingInspection?.id
    
    if (!bookingId || !insId) {
      setReplaceError('Missing inspection or booking ID')
      return
    }
    
    setCancelling(true)
    setReplaceError(null)
    
    try {
      const token = localStorage.getItem('authToken')
      const headers = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`${API_CONTACTS_BASE_URL}/inspection_cancel`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          inspection_id: insId,
          inspection_booking_id: bookingId,
          cancellation_reason: cancellationReason || ''
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to cancel inspection: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('[InspectionSelect] Inspection cancelled:', result)
      
      // Clear local state
      setConfirmedSlot(null)
      setConfirmedDate(null)
      setConfirmedTime(null)
      setConfirmedWillSomeoneBePresent(null)
      setConfirmedInspectionType(null)
      setConfirmedBooking(null)
      setExistingInspection(null)
      setExistingBooking(null)
      
      // Close modal
      setIsReplaceModalOpen(false)
      
      // Notify parent
      if (onInspectionDelete) {
        onInspectionDelete({ cancelled: true, reason: cancellationReason })
      }
    } catch (err) {
      console.error('[InspectionSelect] Error cancelling inspection:', err)
      setReplaceError(err.message)
    } finally {
      setCancelling(false)
    }
  }

  // Handle reschedule inspection
  const handleRescheduleInspection = async () => {
    const bookingId = existingBooking?.id || confirmedBooking?.id
    const insId = inspectionId || existingInspection?.id
    
    if (!bookingId || !insId || !rescheduleDate || !rescheduleTime) {
      setReplaceError('Please select a new date and time')
      return
    }
    
    setRescheduling(true)
    setReplaceError(null)
    
    try {
      const token = localStorage.getItem('authToken')
      const headers = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`${API_CONTACTS_BASE_URL}/inspection_booking_reschedule`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          inspection_booking_id: bookingId,
          inspection_id: insId,
          date_of_inspection: String(rescheduleTime.start_time),
          time_slot_id: rescheduleTime.slot_id || '',
          location_id: currentLocationId || existingInspection?.location_id || '',
          lead_id: leadId || existingInspection?.lead_id || '',
          will_someone_be_present: rescheduleWillSomeoneBePresent || 'yes',
          cancellation_reason: cancellationReason || ''
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to reschedule inspection: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('[InspectionSelect] Inspection rescheduled:', result)
      
      // Refresh the inspection data to get the new booking
      if (insId) {
        await fetchExistingInspection(insId)
      }
      
      // Close modal
      setIsReplaceModalOpen(false)
      
      // Notify parent
      if (onInspectionChange) {
        onInspectionChange({
          type: 'reschedule',
          oldBooking: result,
          date: rescheduleDate,
          time: rescheduleTime
        })
      }
    } catch (err) {
      console.error('[InspectionSelect] Error rescheduling inspection:', err)
      setReplaceError(err.message)
    } finally {
      setRescheduling(false)
    }
  }

  // Fetch slots and inspection types when modal opens
  useEffect(() => {
    if (isModalOpen) {
      const loadData = async () => {
        // First fetch current location_id
        const locationId = await fetchCurrentLocationId()
        setCurrentLocationId(locationId)
        // Then fetch slots with the location_id
        await fetchSlots(locationId)
        // Fetch inspection types
        await fetchInspectionTypes()
      }
      loadData()
      // Initialize pending selections from confirmed values
      setPendingDate(confirmedDate)
      setPendingTime(confirmedTime)
      setPendingWillSomeoneBePresent(confirmedWillSomeoneBePresent)
      setPendingInspectionType(confirmedInspectionType)
    }
  }, [isModalOpen, fetchCurrentLocationId, fetchSlots, fetchInspectionTypes, confirmedDate, confirmedTime, confirmedWillSomeoneBePresent, confirmedInspectionType])

  // Fetch slots when replace modal opens
  useEffect(() => {
    if (isReplaceModalOpen) {
      const loadData = async () => {
        const locationId = currentLocationId || await fetchCurrentLocationId()
        if (!currentLocationId) setCurrentLocationId(locationId)
        await fetchSlots(locationId)
      }
      loadData()
    }
  }, [isReplaceModalOpen, currentLocationId, fetchCurrentLocationId, fetchSlots])

  // Fetch inspectors and inspection types when edit modal opens
  useEffect(() => {
    if (isEditModalOpen) {
      fetchInspectors()
      fetchInspectionTypes()
    }
  }, [isEditModalOpen, fetchInspectors, fetchInspectionTypes])

  // Group slots by date (with safety check for array)
  const groupedSlots = Array.isArray(slots) ? slots.reduce((acc, slot) => {
    const date = new Date(slot.date_iso)
    const dateKey = date.toISOString().split('T')[0]
    
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date,
        dateKey,
        slots: []
      }
    }
    acc[dateKey].slots.push(slot)
    return acc
  }, {}) : {}

  // Get sorted dates
  const sortedDates = Object.values(groupedSlots).sort((a, b) => a.date - b.date)

  // Format time from timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const hours12 = hours % 12 || 12
    const minutesStr = minutes === 0 ? '' : `:${minutes.toString().padStart(2, '0')}`
    return `${hours12}${minutesStr} ${ampm}`
  }

  // Format time range
  const formatTimeRange = (slot) => {
    return `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`
  }

  // Format day of week (short)
  const formatDayOfWeek = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
  }

  // Format month (short)
  const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  }

  // Format day number
  const formatDayNumber = (date) => {
    return date.getDate()
  }

  // Handle date selection
  const handleDateSelect = (dateKey) => {
    setPendingDate(dateKey)
    // Reset time selection when date changes
    if (dateKey !== pendingDate) {
      setPendingTime(null)
    }
  }

  // Handle time selection
  const handleTimeSelect = (slot) => {
    setPendingTime(slot)
  }

  // Handle booking submission
  const handleBookInspection = async () => {
    if (!pendingDate || !pendingTime) return
    
    setSubmitting(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('authToken')
      const headers = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      // Prepare the booking data (booking_status and booked_by_id are set by the API)
      const bookingData = {
        lead_id: leadId || '',
        inspection_type_id: pendingInspectionType || '',
        property_id: propertyId || '',
        location_id: currentLocationId || '',
        date_of_inspection: String(pendingTime.start_time),
        time_slot_id: pendingTime.slot_id || '',
        will_someone_be_present: pendingWillSomeoneBePresent || 'yes'
      }
      
      const response = await fetch(`${API_CONTACTS_BASE_URL}/inspection_bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bookingData)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to book inspection: ${response.status}`)
      }
      
      const result = await response.json()
      
      // Patch the lead record with the new inspection_id (API returns the inspection object)
      const inspectionId = result.id || result.inspection_id
      if (leadId && inspectionId) {
        const patchResponse = await fetch(`${API_CONTACTS_BASE_URL}/leads/${leadId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            inspection_id: inspectionId
          })
        })
        
        if (!patchResponse.ok) {
          console.error('[InspectionSelect] Failed to update lead with inspection_id:', patchResponse.status)
          // Don't throw - the booking was successful, just log the error
        }
      }
      
      // Update local state on success
      setConfirmedSlot(pendingTime)
      setConfirmedDate(pendingDate)
      setConfirmedTime(pendingTime)
      setConfirmedWillSomeoneBePresent(pendingWillSomeoneBePresent)
      setConfirmedInspectionType(pendingInspectionType)
      // Store the booking result to access scheduled_start_time
      setConfirmedBooking(result)
      setIsModalOpen(false)
      
      // Notify parent of the change with the API response
      if (onInspectionChange) {
        onInspectionChange({
          slot: pendingTime,
          date: pendingDate,
          time: pendingTime,
          willSomeoneBePresent: pendingWillSomeoneBePresent,
          inspectionType: pendingInspectionType,
          booking: result
        })
      }
    } catch (err) {
      console.error('[InspectionSelect] Error booking inspection:', err)
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle date selection for reschedule
  const handleRescheduleDateSelect = (dateKey) => {
    setRescheduleDate(dateKey)
    // Reset time selection when date changes
    if (dateKey !== rescheduleDate) {
      setRescheduleTime(null)
    }
  }

  // Handle time selection for reschedule
  const handleRescheduleTimeSelect = (slot) => {
    setRescheduleTime(slot)
  }

  // Handle delete/clear (now opens replace modal for existing inspections)
  const handleDelete = () => {
    // If there's an existing inspection, show the replace modal
    if (existingInspection || existingBooking) {
      handleOpenReplaceModal()
      return
    }
    
    // For newly created (unsaved) inspections, just clear the state
    setConfirmedSlot(null)
    setConfirmedDate(null)
    setConfirmedTime(null)
    setConfirmedWillSomeoneBePresent(null)
    setConfirmedInspectionType(null)
    setConfirmedBooking(null)
    if (onInspectionDelete) {
      onInspectionDelete()
    }
  }

  // Get time slots for selected date
  const getTimeSlotsForDate = (dateKey) => {
    const group = groupedSlots[dateKey]
    if (!group) return []
    
    // Get unique time slots (in case there are duplicates)
    const uniqueSlots = []
    const seen = new Set()
    
    group.slots.forEach(slot => {
      const key = `${slot.start_time}-${slot.end_time}`
      if (!seen.has(key)) {
        seen.add(key)
        uniqueSlots.push(slot)
      }
    })
    
    return uniqueSlots.sort((a, b) => a.start_time - b.start_time)
  }

  // Format single time (for existing bookings)
  const formatSingleTime = (timestamp) => {
    if (!timestamp) return 'Not set'
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return 'Not set'
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const hours12 = hours % 12 || 12
    // Always show minutes (e.g., 1:00 PM, 1:30 PM)
    const minutesStr = `:${minutes.toString().padStart(2, '0')}`
    return `${hours12}${minutesStr} ${ampm}`
  }

  // Inspection card component
  const InspectionCard = () => {
    // Check if we have existing inspection data from API (booking is optional)
    const hasExistingInspection = !!existingInspection
    const hasConfirmedSlot = confirmedSlot && confirmedDate
    
    if (!hasExistingInspection && !hasConfirmedSlot) return null
    
    // Get booking data (use confirmed booking for newly created, or existing booking)
    const bookingToUse = confirmedBooking || existingBooking
    
    // Format booking date and time range
    let bookingDateDisplay = ''
    let bookingTimeDisplay = ''
    let bookingStatus = bookingToUse?.booking_status || 'confirmed'
    
    if (bookingToUse) {
      // Get the date from date_of_inspection
      const bookingTimestamp = bookingToUse.date_of_inspection
      if (bookingTimestamp) {
        const bookingDate = new Date(bookingTimestamp)
        if (!isNaN(bookingDate.getTime())) {
          // Format: "Wed, Dec 17"
          bookingDateDisplay = bookingDate.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })
        }
      }
      
      // Get time range from booking's start_time and end_time
      if (bookingToUse.start_time && bookingToUse.end_time) {
        const startFormatted = formatSingleTime(bookingToUse.start_time)
        const endFormatted = formatSingleTime(bookingToUse.end_time)
        bookingTimeDisplay = `${startFormatted} - ${endFormatted}`
      } else if (confirmedTime?.start_time && confirmedTime?.end_time) {
        // Fall back to confirmed time slot
        const startFormatted = formatSingleTime(confirmedTime.start_time)
        const endFormatted = formatSingleTime(confirmedTime.end_time)
        bookingTimeDisplay = `${startFormatted} - ${endFormatted}`
      }
    } else if (confirmedTime) {
      // Use confirmed time slot for newly booked
      const slotDate = groupedSlots[confirmedDate]?.date || new Date(confirmedDate)
      if (slotDate && !isNaN(slotDate.getTime())) {
        bookingDateDisplay = slotDate.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        })
      }
      
      if (confirmedTime.start_time && confirmedTime.end_time) {
        bookingTimeDisplay = `${formatSingleTime(confirmedTime.start_time)} - ${formatSingleTime(confirmedTime.end_time)}`
      } else if (confirmedTime.start_time) {
        bookingTimeDisplay = formatSingleTime(confirmedTime.start_time)
      }
      bookingStatus = 'confirmed'
    }

    // Get inspection type name - check both inspection_type and _inspection_type (from inspection record)
    const inspectionTypeName = existingInspection?.inspection_type?.name || 
      existingInspection?._inspection_type?.name || 
      inspectionTypes.find(t => t.id === (existingInspection?.inspection_type_id || confirmedInspectionType))?.name || 
      null

    // Get will someone be present (from booking record)
    const willSomeoneBePresent = bookingToUse?.will_someone_be_present || confirmedWillSomeoneBePresent
    const presenceLabel = willSomeoneBePresent === 'yes' ? 'Contact present' : 
                          willSomeoneBePresent === 'no' ? 'Contact not present' : 
                          willSomeoneBePresent === 'maybe' ? 'Contact maybe present' : null

    // Get user info - from inspection record
    const inspectionUser = existingInspection?.user || existingBooking?._booked_by_id || null
    
    // Get property address - from inspection record
    const property = existingInspection?.property || null
    // Extract street address
    let displayAddress = property?.street_address || ''
    if (!displayAddress && property?.formatted_address) {
      // If we only have formatted_address, extract just the street part
      const parts = property.formatted_address.split(',')
      displayAddress = parts[0]?.trim() || ''
    }
    if (!displayAddress) {
      displayAddress = 'Unknown Address'
    }
    
    // Extract city and state
    const city = property?.city || ''
    const state = property?.state || ''
    const cityState = [city, state].filter(Boolean).join(', ')

    
    return (
      <div 
        className="inspection-card"
        style={{ 
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          minWidth: '100%',
          height: 'fit-content',
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid #D8D8D8',
          backgroundColor: '#FFFFFF',
        }}
      >
        {/* Top section - Inspection data (white background) */}
        <div
          style={{
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Row 1: Address + Badges */}
          <div className="flex items-start justify-between" style={{ gap: '12px' }}>
            {/* Property address */}
            <div className="flex flex-col" style={{ gap: '2px', flex: 1, minWidth: 0 }}>
              {/* Street address */}
              <span 
                className="font-inter"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  color: '#202020',
                }}
              >
                {displayAddress}
              </span>
              
              {/* City and State */}
              {cityState && (
                <span 
                  className="font-inter"
                  style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                    color: 'rgb(100, 100, 100)',
                  }}
                >
                  {cityState}
                </span>
              )}
            </div>

            {/* Badges */}
            {(inspectionTypeName || presenceLabel) && (
              <div 
                className="flex flex-wrap items-start justify-end"
                style={{ 
                  gap: '4px', 
                  maxWidth: '55%',
                  flexShrink: 0,
                }}
              >
                {inspectionTypeName && (
                  <Badge variant="grey">
                    {inspectionTypeName}
                  </Badge>
                )}
                {presenceLabel && (
                  <Badge variant="grey">
                    {presenceLabel}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Row 2: User + Actions */}
          <div className="flex items-center justify-between" style={{ gap: '12px' }}>
            {/* User */}
            {inspectionUser ? (
              <div className="flex items-center" style={{ gap: '6px', flex: 1, minWidth: 0 }}>
                <div
                  className="flex-shrink-0"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#ECECEC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {inspectionUser.profile_photo?.url || inspectionUser.avatar ? (
                    <img 
                      src={inspectionUser.profile_photo?.url || inspectionUser.avatar} 
                      alt={inspectionUser.name || 'User'} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span 
                      className="font-inter"
                      style={{ 
                        fontSize: '12px', 
                        fontWeight: 600, 
                        color: '#202020',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {(inspectionUser.name || inspectionUser.first_name || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span
                  className="font-inter"
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                    color: '#202020',
                  }}
                >
                  {inspectionUser.name || `${inspectionUser.first_name || ''} ${inspectionUser.last_name || ''}`.trim() || 'Unknown'}
                </span>
              </div>
            ) : (
              <div style={{ flex: 1 }} />
            )}

            {/* Actions */}
            <div className="flex items-center" style={{ gap: '4px', flexShrink: 0 }}>
              <IconButton
                onClick={handleDelete}
                title="Replace inspection"
                style={{ padding: '4px' }}
              >
                <Repeat size={16} style={{ color: '#202020' }} />
              </IconButton>
              <IconButton
                onClick={handleOpenEditModal}
                title="Edit inspection"
                style={{ padding: '4px' }}
              >
                <Pencil size={16} style={{ color: '#202020' }} />
              </IconButton>
            </div>
          </div>
        </div>

        {/* Bottom section - Booking data (grey background) */}
        {(bookingDateDisplay || bookingTimeDisplay) && (
          <div
            style={{
              padding: '12px 15px',
              backgroundColor: '#F5F5F5',
              borderTop: '1px solid #EBEBEB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            {/* Date and Time */}
            <span
              className="font-inter"
              style={{
                fontSize: '13px',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                color: '#202020',
              }}
            >
              {[bookingDateDisplay, bookingTimeDisplay].filter(Boolean).join(', ')}
            </span>

            {/* Status */}
            <StatusIndicator status={bookingStatus} />
          </div>
        )}
      </div>
    )
  }
  
  // Determine if we should show the inspection card
  const hasInspection = !!existingInspection || (confirmedSlot && confirmedDate)

  return (
    <>
      {loadingExisting ? (
        <div className="flex items-center gap-2" style={{ padding: '15px' }}>
          <div className="animate-pulse" style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#E8E8E8' }} />
          <div className="flex flex-col gap-1">
            <div className="animate-pulse" style={{ width: '150px', height: '14px', borderRadius: '4px', backgroundColor: '#E8E8E8' }} />
            <div className="animate-pulse" style={{ width: '80px', height: '12px', borderRadius: '4px', backgroundColor: '#E8E8E8' }} />
          </div>
        </div>
      ) : hasInspection ? (
        <InspectionCard />
      ) : (
        <div className="flex flex-col" style={{ gap: '8px' }}>
          <Button variant="white" className="px-[25px]" onClick={() => setIsModalOpen(true)} disabled={disabled}>
            <Plus size={16} />
            Book inspection
          </Button>
          {disabled && disabledReason && (
            <span className="text-help">
              {disabledReason}
            </span>
          )}
        </div>
      )}

      {isModalOpen && (
        <Modal
          title="Schedule Inspection"
          onClose={() => setIsModalOpen(false)}
        >
          <Modal.Pages>
            <div className="modal-page-static flex flex-col" style={{ flex: 1, minHeight: 0 }}>
              <div className="flex flex-col" style={{ gap: '20px', flex: 1, minHeight: 0 }}>
                <h2 className="font-sans text-lg tracking-[-0.01em] font-medium text-black" style={{ flexShrink: 0 }}>
                  Book inspection
                </h2>
                {/* Loading state - only show if no slots loaded yet */}
                {loading && sortedDates.length === 0 && (
                  <div className="flex flex-col" style={{ gap: '12px' }}>
                    <span
                      className="font-inter"
                      style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#202020',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      Date
                    </span>
                    <div 
                      className="flex flex-row flex-wrap"
                      style={{ gap: '5px' }}
                    >
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                          key={i}
                          className="animate-pulse"
                          style={{
                            width: '56px',
                            height: '68px',
                            borderRadius: '8px',
                            backgroundColor: '#E8E8E8',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Error state */}
                {error && (
                  <div className="flex items-center justify-center py-4 px-3" style={{ backgroundColor: '#FFF5F5', borderRadius: '8px' }}>
                    <span style={{ color: '#C62828', fontSize: '12px' }}>Error: {error}</span>
                  </div>
                )}

                {/* Date selection - show if we have data or not loading (even if there's a booking error) */}
                {(sortedDates.length > 0 || !loading) && (
                  <>
                    <div className="flex flex-col" style={{ gap: '12px' }}>
                      <span
                        className="font-inter"
                        style={{
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#202020',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Date
                      </span>
                      
                      <div 
                        className="flex flex-row flex-wrap"
                        style={{ 
                          gap: '5px',
                        }}
                      >
                        {sortedDates.map((group) => {
                          const isSelected = pendingDate === group.dateKey
                          
                          return (
                            <button
                              key={group.dateKey}
                              onClick={() => handleDateSelect(group.dateKey)}
                              className="flex flex-col items-center justify-center transition-all"
                              style={{
                                width: '56px',
                                padding: '6px 0',
                                borderRadius: '8px',
                                border: isSelected ? '1px solid #000000' : '1px solid #D8D8D8',
                                backgroundColor: isSelected ? '#EDEDED' : '#FFFFFF',
                                cursor: 'pointer',
                                gap: '5px',
                                flexShrink: 0,
                              }}
                            >
                              <span
                                className="font-inter"
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 500,
                                  color: '#676767',
                                  letterSpacing: '0.02em',
                                  lineHeight: 1,
                                }}
                              >
                                {formatDayOfWeek(group.date)}
                              </span>
                              <span
                                className="font-inter"
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 500,
                                  color: '#676767',
                                  letterSpacing: '0.02em',
                                  lineHeight: 1,
                                }}
                              >
                                {formatMonth(group.date)}
                              </span>
                              <span
                                className="font-inter"
                                style={{
                                  fontSize: '22px',
                                  fontWeight: 500,
                                  color: '#202020',
                                  letterSpacing: '-0.02em',
                                  lineHeight: 1,
                                }}
                              >
                                {formatDayNumber(group.date)}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Time selection */}
                    <div className="flex flex-col" style={{ gap: '12px' }}>
                      <span
                        className="font-inter"
                        style={{
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#202020',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Time
                      </span>
                      
                      <div 
                        className="flex flex-row flex-wrap"
                        style={{ gap: '5px', minHeight: '32px' }}
                      >
                        {pendingDate ? (
                          getTimeSlotsForDate(pendingDate).map((slot, index) => {
                            const isSelected = pendingTime?.slot_id === slot.slot_id && 
                                             pendingTime?.start_time === slot.start_time
                            
                            return (
                              <button
                                key={`${slot.slot_id}-${index}`}
                                onClick={() => handleTimeSelect(slot)}
                                className="flex items-center justify-center transition-all"
                                style={{
                                  padding: '6px 15px',
                                  borderRadius: '8px',
                                  border: isSelected ? '1px solid #000000' : '1px solid #D8D8D8',
                                  backgroundColor: isSelected ? '#EDEDED' : '#FFFFFF',
                                  cursor: 'pointer',
                                }}
                              >
                                <span
                                  className="font-inter"
                                  style={{
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    color: '#202020',
                                    letterSpacing: '-0.01em',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {formatTimeRange(slot)}
                                </span>
                              </button>
                            )
                          })
                        ) : (
                          <span className="text-help">
                            Select a date to see available times
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Inspection type dropdown */}
                    <div className="flex flex-col" style={{ gap: '12px' }}>
                      <Select
                        label={<LabelText>Inspection type</LabelText>}
                        options={inspectionTypes.map(type => ({
                          value: type.id,
                          label: type.name,
                          description: type.description
                        }))}
                        value={pendingInspectionType}
                        onChange={setPendingInspectionType}
                        placeholder="Select an inspection type"
                      />
                    </div>

                    {/* Will someone be present dropdown */}
                    <div className="flex flex-col" style={{ gap: '12px' }}>
                      <Select
                        label={<LabelText>Will someone be present?</LabelText>}
                        options={[
                          { value: 'yes', label: 'Yes' },
                          { value: 'no', label: 'No' },
                          { value: 'maybe', label: 'Maybe' },
                        ]}
                        value={pendingWillSomeoneBePresent}
                        onChange={setPendingWillSomeoneBePresent}
                        placeholder="Select an option"
                      />
                    </div>

                    {/* No slots available */}
                    {sortedDates.length === 0 && (
                      <div className="flex items-center justify-center py-8">
                        <span style={{ color: '#676767', fontSize: '12px' }}>
                          No inspection slots available
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer buttons */}
              <div className="flex justify-end gap-2" style={{ marginTop: 'auto', flexShrink: 0, paddingTop: '20px' }}>
                <Modal.CancelButton>
                  Cancel
                </Modal.CancelButton>
                <Button 
                  variant="dark" 
                  onClick={handleBookInspection}
                  disabled={!pendingDate || !pendingTime || !pendingInspectionType || !pendingWillSomeoneBePresent || submitting}
                >
                  {submitting ? 'Booking...' : 'Book'}
                </Button>
              </div>
            </div>
          </Modal.Pages>
        </Modal>
      )}

      {/* Edit Inspection Modal */}
      {isEditModalOpen && (
        <Modal
          title="Edit Inspection"
          onClose={() => setIsEditModalOpen(false)}
        >
          <Modal.Pages>
            <div className="modal-page-static flex flex-col" style={{ flex: 1, minHeight: 0 }}>
              <div className="flex flex-col" style={{ gap: '20px', flex: 1, minHeight: 0 }}>
                <h2 className="font-sans text-lg tracking-[-0.01em] font-medium text-black" style={{ flexShrink: 0 }}>
                  Edit inspection
                </h2>

                {/* Error state */}
                {editError && (
                  <div className="flex items-center justify-center py-4 px-3" style={{ backgroundColor: '#FFF5F5', borderRadius: '8px' }}>
                    <span style={{ color: '#C62828', fontSize: '12px' }}>Error: {editError}</span>
                  </div>
                )}

                {/* Assigned Inspector dropdown */}
                <div className="flex flex-col" style={{ gap: '12px' }}>
                  <Select
                    label={<LabelText>Assigned Inspector</LabelText>}
                    options={inspectors.map(inspector => ({
                      value: inspector.id,
                      label: inspector.name || `${inspector.first_name || ''} ${inspector.last_name || ''}`.trim() || `Inspector ${inspector.id}`,
                    }))}
                    value={editInspectorId}
                    onChange={setEditInspectorId}
                    placeholder={inspectors.length === 0 ? 'Loading inspectors...' : 'Select an inspector'}
                  />
                </div>

                {/* Inspection Type dropdown */}
                <div className="flex flex-col" style={{ gap: '12px' }}>
                  <Select
                    label={<LabelText>Inspection Type</LabelText>}
                    options={inspectionTypes.map(type => ({
                      value: type.id,
                      label: type.name,
                      description: type.description
                    }))}
                    value={editInspectionTypeId}
                    onChange={setEditInspectionTypeId}
                    placeholder={inspectionTypes.length === 0 ? 'Loading inspection types...' : 'Select an inspection type'}
                  />
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-end gap-2" style={{ marginTop: 'auto', flexShrink: 0, paddingTop: '20px' }}>
                <Modal.CancelButton onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Modal.CancelButton>
                <Button 
                  variant="dark" 
                  onClick={handleSaveInspectionEdit}
                  disabled={savingEdit}
                >
                  {savingEdit ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </Modal.Pages>
        </Modal>
      )}

      {/* Replace/Cancel/Reschedule Modal */}
      {isReplaceModalOpen && (
        <Modal
          title="Update inspection booking"
          onClose={() => setIsReplaceModalOpen(false)}
        >
          <Modal.Pages>
            <div className="modal-page-static flex flex-col" style={{ flex: 1, minHeight: 0 }}>
              <div className="flex flex-col" style={{ gap: '20px', flex: 1, minHeight: 0 }}>
                <h2 className="font-sans text-lg tracking-[-0.01em] font-medium text-black" style={{ flexShrink: 0 }}>
                  Update inspection booking
                </h2>

                {/* Error state */}
                {replaceError && (
                  <div className="flex items-center justify-center py-4 px-3" style={{ backgroundColor: '#FFF5F5', borderRadius: '8px' }}>
                    <span style={{ color: '#C62828', fontSize: '12px' }}>Error: {replaceError}</span>
                  </div>
                )}

                {/* Action selector */}
                <SegmentedControl
                  options={['Cancel', 'Reschedule']}
                  value={selectedAction}
                  onChange={setSelectedAction}
                />

                {/* Reason - required */}
                <Textarea
                  label="Reason"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder={selectedAction === 'Cancel' ? 'Enter a reason for cancelling...' : 'Enter a reason for rescheduling...'}
                />

                {/* Reschedule fields - only shown when Reschedule is selected */}
                {selectedAction === 'Reschedule' && (
                  <>
                    {/* Loading state */}
                    {loading && sortedDates.length === 0 && (
                      <div className="flex flex-col" style={{ gap: '12px' }}>
                        <span
                          className="font-inter"
                          style={{
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#202020',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          Date
                        </span>
                        <div 
                          className="flex flex-row flex-wrap"
                          style={{ gap: '5px' }}
                        >
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div
                              key={i}
                              className="animate-pulse"
                              style={{
                                width: '56px',
                                height: '68px',
                                borderRadius: '8px',
                                backgroundColor: '#E8E8E8',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Date selection */}
                    {(sortedDates.length > 0 || !loading) && (
                      <>
                        <div className="flex flex-col" style={{ gap: '12px' }}>
                          <span
                            className="font-inter"
                            style={{
                              fontSize: '12px',
                              fontWeight: 500,
                              color: '#202020',
                              letterSpacing: '-0.01em',
                            }}
                          >
                            Date
                          </span>
                          
                          <div 
                            className="flex flex-row flex-wrap"
                            style={{ gap: '5px' }}
                          >
                            {sortedDates.map((group) => {
                              const isSelected = rescheduleDate === group.dateKey
                              
                              return (
                                <button
                                  key={group.dateKey}
                                  onClick={() => handleRescheduleDateSelect(group.dateKey)}
                                  className="flex flex-col items-center justify-center transition-all"
                                  style={{
                                    width: '56px',
                                    padding: '6px 0',
                                    borderRadius: '8px',
                                    border: isSelected ? '1px solid #000000' : '1px solid #D8D8D8',
                                    backgroundColor: isSelected ? '#EDEDED' : '#FFFFFF',
                                    cursor: 'pointer',
                                    gap: '5px',
                                    flexShrink: 0,
                                  }}
                                >
                                  <span
                                    className="font-inter"
                                    style={{
                                      fontSize: '10px',
                                      fontWeight: 500,
                                      color: '#676767',
                                      letterSpacing: '0.02em',
                                      lineHeight: 1,
                                    }}
                                  >
                                    {formatDayOfWeek(group.date)}
                                  </span>
                                  <span
                                    className="font-inter"
                                    style={{
                                      fontSize: '10px',
                                      fontWeight: 500,
                                      color: '#676767',
                                      letterSpacing: '0.02em',
                                      lineHeight: 1,
                                    }}
                                  >
                                    {formatMonth(group.date)}
                                  </span>
                                  <span
                                    className="font-inter"
                                    style={{
                                      fontSize: '22px',
                                      fontWeight: 500,
                                      color: '#202020',
                                      letterSpacing: '-0.02em',
                                      lineHeight: 1,
                                    }}
                                  >
                                    {formatDayNumber(group.date)}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Time selection */}
                        <div className="flex flex-col" style={{ gap: '12px' }}>
                          <span
                            className="font-inter"
                            style={{
                              fontSize: '12px',
                              fontWeight: 500,
                              color: '#202020',
                              letterSpacing: '-0.01em',
                            }}
                          >
                            Time
                          </span>
                          
                          <div 
                            className="flex flex-row flex-wrap"
                            style={{ gap: '5px', minHeight: '32px' }}
                          >
                            {rescheduleDate ? (
                              getTimeSlotsForDate(rescheduleDate).map((slot, index) => {
                                const isSelected = rescheduleTime?.slot_id === slot.slot_id && 
                                                 rescheduleTime?.start_time === slot.start_time
                                
                                return (
                                  <button
                                    key={`${slot.slot_id}-${index}`}
                                    onClick={() => handleRescheduleTimeSelect(slot)}
                                    className="flex items-center justify-center transition-all"
                                    style={{
                                      padding: '6px 15px',
                                      borderRadius: '8px',
                                      border: isSelected ? '1px solid #000000' : '1px solid #D8D8D8',
                                      backgroundColor: isSelected ? '#EDEDED' : '#FFFFFF',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <span
                                      className="font-inter"
                                      style={{
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        color: '#202020',
                                        letterSpacing: '-0.01em',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {formatTimeRange(slot)}
                                    </span>
                                  </button>
                                )
                              })
                            ) : (
                              <span className="text-help">
                                Select a date to see available times
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Will someone be present dropdown */}
                        <div className="flex flex-col" style={{ gap: '12px' }}>
                          <Select
                            label={<LabelText>Will someone be present?</LabelText>}
                            options={[
                              { value: 'yes', label: 'Yes' },
                              { value: 'no', label: 'No' },
                              { value: 'maybe', label: 'Maybe' },
                            ]}
                            value={rescheduleWillSomeoneBePresent}
                            onChange={setRescheduleWillSomeoneBePresent}
                            placeholder="Select an option"
                          />
                        </div>

                        {/* No slots available */}
                        {sortedDates.length === 0 && (
                          <div className="flex items-center justify-center py-8">
                            <span style={{ color: '#676767', fontSize: '12px' }}>
                              No inspection slots available
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Footer buttons */}
              <div className="flex justify-end gap-2" style={{ marginTop: 'auto', flexShrink: 0, paddingTop: '20px' }}>
                <Button 
                  variant="white"
                  onClick={() => setIsReplaceModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="red"
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={
                    !cancellationReason.trim() || 
                    cancelling || 
                    rescheduling ||
                    (selectedAction === 'Reschedule' && (!rescheduleDate || !rescheduleTime || !rescheduleWillSomeoneBePresent))
                  }
                >
                  {selectedAction === 'Cancel' 
                    ? (cancelling ? 'Cancelling...' : 'Cancel Inspection')
                    : (rescheduling ? 'Rescheduling...' : 'Reschedule Inspection')
                  }
                </Button>
              </div>
            </div>
          </Modal.Pages>
        </Modal>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={() => {
          setShowConfirmDialog(false)
          if (selectedAction === 'Cancel') {
            handleCancelInspection()
          } else {
            handleRescheduleInspection()
          }
        }}
        title={selectedAction === 'Cancel' ? 'Cancel Inspection' : 'Reschedule Inspection'}
        message="This action cannot be undone."
        cancelText="Cancel"
        confirmText="Proceed"
        loading={cancelling || rescheduling}
        loadingText={cancelling ? 'Cancelling...' : 'Rescheduling...'}
      />
    </>
  )
}

export default InspectionSelect

