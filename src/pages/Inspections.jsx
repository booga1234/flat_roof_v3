import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Trash2, HardHat, User, Clock, Calendar } from 'lucide-react'
import Input from '../components/Input'
import Select from '../components/Select'
import Button from '../components/Button'
import NewPage from '../components/NewPage'
import LabelText from '../components/LabelText'
import TwoColumnLayout from '../components/TwoColumnLayout'
import NoDataFound from '../components/NoDataFound'
import ContactSelect from '../components/ContactSelect'
import AddressSelect from '../components/AddressSelect'
import SegmentedControl from '../components/SegmentedControl'
import Switch from '../components/Switch'
import { inspectionsAPI, inspectionTypesAPI, propertiesAPI } from '../utils/apiService'
import { API_BASE_URL } from '../config/api'
import { Section } from '../components/SectionHeader'
import StatusIndicator from '../components/StatusIndicator'

function Inspections() {
  const { inspectionId: urlInspectionId } = useParams()
  const navigate = useNavigate()
  const [selectedInspection, setSelectedInspection] = useState(0)
  const [inspections, setInspections] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingInspectionDetails, setLoadingInspectionDetails] = useState(true)
  const [loadingProperty, setLoadingProperty] = useState(false)
  const [error, setError] = useState(null)
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRangeFilter, setDateRangeFilter] = useState('all')
  const [createdByMeFilter, setCreatedByMeFilter] = useState(false)
  const [inspectionTypeFilter, setInspectionTypeFilter] = useState(null)
  
  // Options for dropdowns
  const [inspectionTypeOptions, setInspectionTypeOptions] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  
  // Store user ID fetched from API
  const [currentUserId, setCurrentUserId] = useState(null)
  
  // Fetch user ID from /auth/me on mount
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        // First try localStorage
        const userData = localStorage.getItem('user')
        if (userData) {
          const user = JSON.parse(userData)
          const userId = user?.id || user?.user_id || user?.userId || null
          if (userId) {
            console.log('[Inspections] Got user ID from localStorage:', userId)
            setCurrentUserId(userId)
            return
          }
        }
        
        // If not in localStorage, fetch from /auth/me
        const token = localStorage.getItem('authToken')
        if (token) {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (response.ok) {
            const data = await response.json()
            console.log('[Inspections] Got user ID from /auth/me:', data.id)
            setCurrentUserId(data.id)
            
            // Update localStorage with the ID for future use
            if (userData) {
              const user = JSON.parse(userData)
              user.id = data.id
              localStorage.setItem('user', JSON.stringify(user))
            }
          }
        }
      } catch (error) {
        console.error('[Inspections] Error fetching user ID:', error)
      }
    }
    fetchUserId()
  }, [])
  
  // Get current user ID (now just returns the state)
  const getCurrentUserId = useCallback(() => {
    return currentUserId
  }, [currentUserId])
  
  const [formData, setFormData] = useState({
    property_id: null,
    inspection_type_id: null,
    inspector_id: null,
    status: '',
    scheduled_start_time: '',
    scheduled_end_time: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    notes: '',
    internal_notes: '',
    reason_for_inspection: '',
    person_present: ''
  })

  const isInitializingRef = useRef(false)
  const saveTimeoutRef = useRef(null)
  const leftColumnRef = useRef(null)
  const inspectionItemRefs = useRef({})

  // Helper function to get customer display name from lead contact
  const getCustomerDisplayName = (inspection) => {
    // First try to get from lead.contact (nested structure from API)
    const leadContact = inspection.lead?.contact || {}
    const leadFirstName = leadContact.first_name || leadContact.FirstName || ''
    const leadLastName = leadContact.last_name || leadContact.LastName || ''
    const leadFullName = [leadFirstName, leadLastName].filter(Boolean).join(' ').trim()
    if (leadFullName) return leadFullName
    
    // Fallback to customer_name field
    const customerName = inspection.customer_name || inspection.customerName || ''
    if (customerName) return customerName
    
    // Try to get from direct contact info
    const contact = inspection.contact || inspection.Contact || {}
    const firstName = contact.first_name || contact.FirstName || ''
    const lastName = contact.last_name || contact.LastName || ''
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()
    
    return fullName || 'Unnamed Inspection'
  }

  // Helper function to get property street address
  const getPropertyAddress = (inspection) => {
    // Get street address from property (street_number + route)
    const property = inspection.property || {}
    const streetNumber = property.street_number || ''
    const route = property.route || ''
    const streetAddress = [streetNumber, route].filter(Boolean).join(' ').trim()
    if (streetAddress) return streetAddress
    
    // Fallback to other address fields
    const address = inspection.location_address || 
                   property.formatted_address || 
                   property.full_address ||
                   property.address ||
                   ''
    return address
  }

  // Helper function to format scheduled time
  const formatScheduledTime = (inspection) => {
    const startTime = inspection.scheduled_start_time || inspection.scheduledStartTime
    if (!startTime) return ''
    
    try {
      const date = new Date(startTime)
      if (isNaN(date.getTime())) return ''
      
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hours = date.getHours()
      const minutes = date.getMinutes()
      const ampm = hours >= 12 ? 'PM' : 'AM'
      const hours12 = hours % 12 || 12
      const minutesStr = minutes.toString().padStart(2, '0')
      
      return `${month}/${day} at ${hours12}:${minutesStr} ${ampm}`
    } catch (error) {
      return ''
    }
  }

  // Helper function to format inspection date from inspection_booking
  const formatInspectionDate = (inspection) => {
    const booking = inspection.inspection_booking || inspection.inspectionBooking || {}
    const dateOfInspection = booking.date_of_inspection || booking.dateOfInspection
    
    if (!dateOfInspection) return ''
    
    try {
      const date = new Date(dateOfInspection)
      if (isNaN(date.getTime())) return ''
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const month = months[date.getMonth()]
      const day = date.getDate()
      const year = date.getFullYear()
      
      return `${month} ${day}, ${year}`
    } catch (error) {
      console.error('Error formatting inspection date:', error)
      return ''
    }
  }

  // Helper function to format creation time as relative time or date
  const formatCreationTime = (inspection) => {
    const dateStr = inspection.created_at || inspection.createdAt || inspection.CreatedAt
    if (!dateStr) return ''
    
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return ''
      
      const now = new Date()
      const diffMs = now - date
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      
      if (diffDays >= 15) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const month = months[date.getMonth()]
        const day = date.getDate()
        const year = date.getFullYear()
        return `${month} ${day}, ${year}`
      }
      
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      
      if (diffMinutes < 60) {
        return `${diffMinutes}m`
      } else if (diffHours < 24) {
        return `${diffHours}h`
      } else {
        return `${diffDays}d`
      }
    } catch (error) {
      console.error('Error formatting date:', error)
      return ''
    }
  }

  // Helper function to format updated_at timestamp as "12/2, 1:56 PM"
  const formatUpdatedAt = (dateStr) => {
    if (!dateStr) return ''
    
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return ''
      
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hours = date.getHours()
      const minutes = date.getMinutes()
      const ampm = hours >= 12 ? 'PM' : 'AM'
      const hours12 = hours % 12 || 12
      const minutesStr = minutes.toString().padStart(2, '0')
      
      return `${month}/${day}, ${hours12}:${minutesStr} ${ampm}`
    } catch (error) {
      console.error('Error formatting updated_at:', error)
      return ''
    }
  }

  // Helper function to categorize inspections by status
  const categorizeInspectionsByStatus = (inspections) => {
    const statusOrder = [
      { key: 'scheduled', label: 'Scheduled' },
      { key: 'in_progress', label: 'In Progress' },
      { key: 'completed', label: 'Completed' },
      { key: 'cancelled', label: 'Cancelled' },
      { key: 'rescheduled', label: 'Rescheduled' }
    ]

    const categories = {}
    
    statusOrder.forEach(status => {
      categories[status.key] = { label: status.label, inspections: [] }
    })
    categories['no_status'] = { label: 'No Status', inspections: [] }

    inspections.forEach(inspection => {
      const status = inspection.status || inspection.Status || ''
      
      if (status && categories[status]) {
        categories[status].inspections.push(inspection)
      } else if (status) {
        categories['no_status'].inspections.push(inspection)
      } else {
        categories['no_status'].inspections.push(inspection)
      }
    })

    // Sort each category by scheduled time (earliest first) or creation time
    const sortByScheduledTime = (a, b) => {
      const dateA = new Date(a.scheduled_start_time || a.created_at || 0)
      const dateB = new Date(b.scheduled_start_time || b.created_at || 0)
      return dateA.getTime() - dateB.getTime()
    }

    Object.values(categories).forEach(category => {
      category.inspections.sort(sortByScheduledTime)
    })

    const result = []
    statusOrder.forEach(status => {
      if (categories[status.key].inspections.length > 0) {
        result.push(categories[status.key])
      }
    })
    if (categories['no_status'].inspections.length > 0) {
      result.push(categories['no_status'])
    }

    return result
  }

  // Fetch dropdown options on mount
  useEffect(() => {
    fetchDropdownOptions()
  }, [])

  const fetchDropdownOptions = async () => {
    try {
      setLoadingOptions(true)
      
      const typesData = await inspectionTypesAPI.getAll()
      
      const typesArray = Array.isArray(typesData) ? typesData : (typesData?.items || typesData?.data || [])
      const typesOptions = typesArray.map(item => ({
        value: item.id,
        label: item.name || item.type_name || item.title || `Type ${item.id}`
      }))
      setInspectionTypeOptions(typesOptions)
    } catch (err) {
      console.error('Error fetching dropdown options:', err)
    } finally {
      setLoadingOptions(false)
    }
  }

  // Fetch inspections when filters change or user ID is loaded
  useEffect(() => {
    fetchInspections()
  }, [statusFilter, dateRangeFilter, createdByMeFilter, inspectionTypeFilter, currentUserId])

  // Sync URL with selected inspection
  useEffect(() => {
    if (!loading && inspections.length > 0 && urlInspectionId) {
      const foundIndex = inspections.findIndex(inspection => {
        const id = inspection.id || inspection.ID
        return id && String(id) === String(urlInspectionId)
      })
      if (foundIndex >= 0 && foundIndex !== selectedInspection) {
        setSelectedInspection(foundIndex)
      } else if (foundIndex === -1) {
        const categories = categorizeInspectionsByStatus(inspections)
        const firstCategory = categories[0]
        const firstDisplayedInspection = firstCategory?.inspections?.[0]
        
        if (firstDisplayedInspection) {
          const firstInspectionId = firstDisplayedInspection.id || firstDisplayedInspection.ID
          const firstInspectionIndex = inspections.findIndex(i => 
            (i.id && firstInspectionId && i.id === firstInspectionId) || 
            (i.ID && firstInspectionId && i.ID === firstInspectionId)
          )
          if (firstInspectionId) {
            navigate(`/inspections/${firstInspectionId}`, { replace: true })
          }
          if (firstInspectionIndex >= 0) {
            setSelectedInspection(firstInspectionIndex)
          }
        } else {
          const firstInspectionId = inspections[0]?.id || inspections[0]?.ID
          if (firstInspectionId) {
            navigate(`/inspections/${firstInspectionId}`, { replace: true })
          }
        }
      }
    }
  }, [loading, inspections, urlInspectionId])

  // Update URL when inspection is selected
  const selectInspection = useCallback((index) => {
    if (index >= 0 && index < inspections.length) {
      const inspection = inspections[index]
      const inspectionId = inspection?.id || inspection?.ID
      if (inspectionId) {
        navigate(`/inspections/${inspectionId}`)
      }
      setSelectedInspection(index)
    }
  }, [inspections, navigate])

  // Scroll selected inspection to top when it changes
  useEffect(() => {
    if (selectedInspection >= 0 && inspectionItemRefs.current[selectedInspection] && leftColumnRef.current) {
      const inspectionElement = inspectionItemRefs.current[selectedInspection]
      const container = leftColumnRef.current
      
      const containerRect = container.getBoundingClientRect()
      const elementRect = inspectionElement.getBoundingClientRect()
      
      const currentScrollTop = container.scrollTop
      const elementPositionRelativeToContainer = elementRect.top - containerRect.top
      const targetScrollTop = currentScrollTop + elementPositionRelativeToContainer - 20
      
      container.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth'
      })
    }
  }, [selectedInspection, inspections])

  const fetchInspections = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build filters object
      const filters = {}
      if (statusFilter && statusFilter !== 'all') {
        filters.status = statusFilter
      }
      if (createdByMeFilter) {
        const userId = getCurrentUserId()
        console.log('[Inspections] createdByMeFilter is ON, userId:', userId)
        if (userId) {
          filters.inspector_id = userId
        } else {
          console.warn('[Inspections] Could not get user ID for inspector filter')
        }
      }
      if (inspectionTypeFilter) {
        filters.inspection_type_id = inspectionTypeFilter
      }
      if (dateRangeFilter && dateRangeFilter !== 'all') {
        filters.date_range = dateRangeFilter
      }
      
      const data = await inspectionsAPI.getAll(filters)
      
      // API returns { items: [...], curPage, perPage, etc }
      const inspectionsArray = Array.isArray(data) 
        ? data 
        : (data?.items || data?.inspections || data?.data || data?.results || [])
      
      setInspections(inspectionsArray)
      
      if (inspectionsArray.length > 0 && !urlInspectionId) {
        const categories = categorizeInspectionsByStatus(inspectionsArray)
        const firstCategory = categories[0]
        const firstDisplayedInspection = firstCategory?.inspections?.[0]
        
        if (firstDisplayedInspection) {
          const firstInspectionId = firstDisplayedInspection.id || firstDisplayedInspection.ID
          const firstInspectionIndex = inspectionsArray.findIndex(i => 
            (i.id && firstInspectionId && i.id === firstInspectionId) || 
            (i.ID && firstInspectionId && i.ID === firstInspectionId)
          )
          
          if (firstInspectionId) {
            navigate(`/inspections/${firstInspectionId}`, { replace: true })
          }
          setSelectedInspection(firstInspectionIndex >= 0 ? firstInspectionIndex : 0)
        } else {
          const firstInspectionId = inspectionsArray[0]?.id || inspectionsArray[0]?.ID
          if (firstInspectionId) {
            navigate(`/inspections/${firstInspectionId}`, { replace: true })
          }
          setSelectedInspection(0)
        }
      }
    } catch (err) {
      console.error('Error fetching inspections:', err)
      setError(err.message || 'Failed to load inspections')
      setInspections([])
    } finally {
      setLoading(false)
    }
  }

  // Status options for form dropdown
  const statusOptions = useMemo(() => [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'rescheduled', label: 'Rescheduled' }
  ], [])

  // Status filter options for SegmentedControl
  const statusFilterOptions = useMemo(() => ['All', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'], [])
  
  // Date range filter options for SegmentedControl
  const dateRangeFilterOptions = useMemo(() => ['All', 'Today', '7 Days', '30 Days'], [])
  
  // Map display labels to API values
  const statusLabelToValue = {
    'All': 'all',
    'Scheduled': 'scheduled',
    'In Progress': 'in_progress',
    'Completed': 'completed',
    'Cancelled': 'cancelled'
  }
  
  const statusValueToLabel = {
    'all': 'All',
    'scheduled': 'Scheduled',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  }
  
  // Map display labels to API values for date range
  const dateRangeLabelToValue = {
    'All': 'all',
    'Today': 'today',
    '7 Days': '7_days',
    '30 Days': '30_days'
  }
  
  const dateRangeValueToLabel = {
    'all': 'All',
    'today': 'Today',
    '7_days': '7 Days',
    '30_days': '30 Days'
  }

  // Inspection type filter options (with "All" option)
  const inspectionTypeFilterOptions = useMemo(() => [
    { value: null, label: 'Filter by inspection type' },
    ...inspectionTypeOptions
  ], [inspectionTypeOptions])

  const personPresentOptions = useMemo(() => [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
    { value: 'unknown', label: 'Unknown' }
  ], [])

  // Update form data when inspection changes
  const currentInspection = inspections.length > 0 ? (inspections[selectedInspection] || inspections[0]) : null

  // Fetch detailed inspection info when an inspection is selected
  const fetchInspectionDetails = useCallback(async (inspectionId) => {
    if (!inspectionId) return
    
    try {
      setLoadingInspectionDetails(true)
      
      // For now, use the existing data since we may not have a getById endpoint
      // If the API has a getById, use it here
      const detailedInspection = inspections.find(i => (i.id || i.ID) === inspectionId)
      
      if (detailedInspection) {
        isInitializingRef.current = true
        
        setFormData({
          property_id: detailedInspection.property_id || null,
          inspection_type_id: detailedInspection.inspection_type_id || null,
          inspector_id: detailedInspection.inspector_id || null,
          status: detailedInspection.status || '',
          scheduled_start_time: detailedInspection.scheduled_start_time || '',
          scheduled_end_time: detailedInspection.scheduled_end_time || '',
          customer_name: detailedInspection.customer_name || '',
          customer_phone: detailedInspection.customer_phone || '',
          customer_email: detailedInspection.customer_email || '',
          notes: detailedInspection.notes || '',
          internal_notes: detailedInspection.internal_notes || '',
          reason_for_inspection: detailedInspection.reason_for_inspection || '',
          person_present: detailedInspection.person_present || ''
        })
        
        setTimeout(() => {
          isInitializingRef.current = false
        }, 200)
      }
    } catch (err) {
      console.error('[Inspections] Error fetching inspection details:', err)
    } finally {
      setLoadingInspectionDetails(false)
    }
  }, [inspections])

  const lastFetchedInspectionIdRef = useRef(null)

  // Fetch inspection details when selected inspection changes
  useEffect(() => {
    if (currentInspection) {
      const inspectionId = currentInspection.id || currentInspection.ID
      if (inspectionId && inspectionId !== lastFetchedInspectionIdRef.current) {
        lastFetchedInspectionIdRef.current = inspectionId
        fetchInspectionDetails(inspectionId)
      }
    }
  }, [selectedInspection, currentInspection, fetchInspectionDetails])

  // Auto-save inspection when form data changes
  const saveInspection = useCallback(async (inspectionId, data) => {
    try {
      setSaving(true)
      const startTime = Date.now()
      console.log('[Inspections] Saving inspection with data:', data)
      await inspectionsAPI.update(inspectionId, data)
      console.log('[Inspections] Inspection saved successfully')
      
      const elapsed = Date.now() - startTime
      const minDisplayTime = 3000
      if (elapsed < minDisplayTime) {
        await new Promise(resolve => setTimeout(resolve, minDisplayTime - elapsed))
      }
    } catch (err) {
      console.error('[Inspections] Error saving inspection:', err)
    } finally {
      setSaving(false)
    }
  }, [])

  // Auto-save inspection when form data changes (debounced)
  useEffect(() => {
    if (isInitializingRef.current || !currentInspection || selectedInspection < 0) {
      return
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    const inspectionId = currentInspection.id || currentInspection.ID
    if (inspectionId) {
      saveTimeoutRef.current = setTimeout(() => {
        saveInspection(inspectionId, formData)
      }, 500)
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [formData, currentInspection, selectedInspection, saveInspection])

  const handleInputChange = (field) => (e) => {
    const value = e.target ? e.target.value : e
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSelectChange = (field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCreate = async () => {
    try {
      setCreating(true)
      setError(null)
      
      const newInspection = await inspectionsAPI.create({})
      
      console.log('[Inspections] New inspection created:', newInspection)
      
      // Reset filters to show the new inspection
      setStatusFilter('all')
      setDateRangeFilter('all')
      setCreatedByMeFilter(false)
      setInspectionTypeFilter(null)
      
      const updatedInspections = await inspectionsAPI.getAll()
      // API returns { items: [...], curPage, perPage, etc }
      const inspectionsArray = Array.isArray(updatedInspections) 
        ? updatedInspections 
        : (updatedInspections?.items || updatedInspections?.inspections || updatedInspections?.data || updatedInspections?.results || [])
      
      setInspections(inspectionsArray)
      
      const inspectionId = newInspection?.id || newInspection?.ID
      if (inspectionId) {
        const newInspectionIndex = inspectionsArray.findIndex(i => 
          (i.id && inspectionId && i.id === inspectionId) || 
          (i.ID && inspectionId && i.ID === inspectionId)
        )
        
        if (newInspectionIndex >= 0) {
          setSelectedInspection(newInspectionIndex)
          navigate(`/inspections/${inspectionId}`)
        }
      }
      
      setFormData({
        property_id: null,
        inspection_type_id: null,
        inspector_id: null,
        status: '',
        scheduled_start_time: '',
        scheduled_end_time: '',
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        notes: '',
        internal_notes: '',
        reason_for_inspection: '',
        person_present: ''
      })
    } catch (err) {
      console.error('[Inspections] Error creating inspection:', err)
      setError(err.message || 'Failed to create inspection')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!currentInspection) return
    
    const inspectionId = currentInspection.id || currentInspection.ID
    if (!inspectionId) return
    
    try {
      // Update status to cancelled
      await inspectionsAPI.update(inspectionId, { status: 'cancelled' })
      console.log('[Inspections] Inspection cancelled:', inspectionId)
      
      // Refresh the list
      await fetchInspections()
    } catch (err) {
      console.error('[Inspections] Error cancelling inspection:', err)
      setError(err.message || 'Failed to cancel inspection')
    }
  }

  // Get status color for badge
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#3B82F6' // blue
      case 'in_progress': return '#F59E0B' // amber
      case 'completed': return '#10B981' // green
      case 'cancelled': return '#EF4444' // red
      case 'rescheduled': return '#8B5CF6' // purple
      default: return '#6B7280' // gray
    }
  }

  return (
    <NewPage>
      {/* Page Header */}
      <div
        className="flex flex-col"
        style={{
          borderBottom: '1px solid #F3F3F3'
        }}
      >
        {/* Title Row */}
        <div
          className="flex flex-row items-center justify-between"
          style={{
            padding: '15px 18px',
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
            Inspections
          </h1>
          <Button variant="dark" onClick={handleCreate} disabled={creating || loading}>
            <Plus size={14} />
            <span>{creating ? 'Creating...' : 'Create'}</span>
          </Button>
        </div>
        
        {/* Filters Row */}
        <div 
          className="flex items-center gap-3" 
          style={{ 
            padding: '0 18px 15px 18px',
          }}
        >
          {/* Date Range Filter - SegmentedControl */}
          <SegmentedControl
            options={dateRangeFilterOptions}
            value={dateRangeValueToLabel[dateRangeFilter] || 'All'}
            onChange={(label) => {
              const value = dateRangeLabelToValue[label] || 'all'
              setDateRangeFilter(value)
              setSelectedInspection(0)
            }}
          />
          
          {/* Status Filter - SegmentedControl */}
          <SegmentedControl
            options={statusFilterOptions}
            value={statusValueToLabel[statusFilter] || 'All'}
            onChange={(label) => {
              const value = statusLabelToValue[label] || 'all'
              setStatusFilter(value)
              setSelectedInspection(0)
            }}
          />
          
          {/* Type Filter Dropdown */}
          <div style={{ width: '180px' }}>
            <Select
              options={inspectionTypeFilterOptions}
              value={inspectionTypeFilter}
              onChange={(value) => {
                setInspectionTypeFilter(value)
                setSelectedInspection(0)
              }}
              placeholder="Filter by inspection type"
            />
          </div>
          
          {/* Inspected by me toggle */}
          <div className="flex items-center gap-2">
            <Switch
              checked={createdByMeFilter}
              onChange={(checked) => {
                setCreatedByMeFilter(checked)
                setSelectedInspection(0)
              }}
            />
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                fontWeight: 500,
                color: '#5D5D5D',
                letterSpacing: '-0.01em'
              }}
            >
              Inspected by me
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <TwoColumnLayout
        leftColumnRef={leftColumnRef}
        leftLoading={loading}
        rightLoading={currentInspection && (loadingInspectionDetails || loadingProperty)}
        leftContent={
          <>
            {error && (
              <div className="flex items-center justify-center py-8">
                <span style={{ color: '#C62828', fontSize: '12px' }}>Error: {error}</span>
              </div>
            )}

            {!loading && !error && inspections.length === 0 && (
              <div className="flex items-center justify-center flex-1" style={{ minHeight: 0 }}>
                <NoDataFound 
                  heading="No inspections found" 
                  message={statusFilter !== 'all' || dateRangeFilter !== 'all' || createdByMeFilter || inspectionTypeFilter 
                    ? "Try adjusting your filters." 
                    : "Create an inspection below."}
                  buttonText={statusFilter === 'all' && dateRangeFilter === 'all' && !createdByMeFilter && !inspectionTypeFilter ? "Create" : undefined}
                  onButtonClick={statusFilter === 'all' && dateRangeFilter === 'all' && !createdByMeFilter && !inspectionTypeFilter ? handleCreate : undefined}
                  icon={HardHat}
                  iconSize={16}
                  iconStrokeWidth={2}
                />
              </div>
            )}

            {!loading && !error && inspections.length > 0 && (
              <div className="flex flex-col gap-2">
                {inspections.map((inspection, index) => (
                  <div
                    key={inspection.id || inspection.ID || index}
                    ref={(el) => {
                      if (el) {
                        inspectionItemRefs.current[index] = el
                      }
                    }}
                    onClick={() => selectInspection(index)}
                    className="flex flex-col cursor-pointer transition-all"
                    style={{
                      backgroundColor: selectedInspection === index ? '#EDEDED' : '#FFFFFF',
                      borderRadius: '10px',
                      padding: '15px'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedInspection !== index) {
                        e.currentTarget.style.backgroundColor = '#F5F5F5'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedInspection !== index) {
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
                        {getCustomerDisplayName(inspection)}
                      </span>
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '11px',
                          fontWeight: 500,
                          letterSpacing: '-0.01em',
                          color: '#4B4B4B'
                        }}
                      >
                        {formatInspectionDate(inspection)}
                      </span>
                    </div>
                    <div className="flex flex-row items-center w-full">
                      {getPropertyAddress(inspection) && (
                        <span
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#4B4B4B',
                            letterSpacing: '-0.01em',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1,
                            minWidth: 0
                          }}
                        >
                          {getPropertyAddress(inspection)}
                        </span>
                      )}
                      <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                        <StatusIndicator 
                          status={inspection.inspection_booking?.booking_status || inspection.inspectionBooking?.bookingStatus || ''}
                        />
                      </div>
                    </div>
                    {formatScheduledTime(inspection) && (
                      <div className="flex flex-row items-center w-full gap-1">
                        <Calendar size={11} style={{ color: '#6B7280', flexShrink: 0 }} />
                        <span
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '11px',
                            fontWeight: 500,
                            color: '#6B7280',
                            letterSpacing: '-0.01em'
                          }}
                        >
                          {formatScheduledTime(inspection)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        }
        rightContent={
          !currentInspection && !loading ? (
            <div 
              className="flex items-center justify-center flex-1" 
              style={{ 
                width: '100%',
                height: '100%'
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                  color: '#000000'
                }}
              >
                Select an inspection to view details.
              </span>
            </div>
          ) : currentInspection ? (
            <div
              className="flex flex-col"
              style={{
                maxWidth: '30rem',
                margin: '0',
                gap: '30px'
              }}
            >
              {/* Property Section */}
              <Section title="Property">
                <AddressSelect
                  id={formData.property_id}
                  onAddressChange={async (address) => {
                    try {
                      const googlePlaceId = address?.place_id || address?.placeId || address?.id
                      if (!googlePlaceId) {
                        console.error('[Inspections] No google_place_id found in address:', address)
                        return
                      }
                      const property = await propertiesAPI.findOrCreate(googlePlaceId)
                      let propertyId = property?.id || property?.ID || property?.property_id
                      if (property?.data) {
                        propertyId = property.data.id || property.data.ID || property.data.property_id || null
                      }
                      if (propertyId) {
                        setFormData(prev => ({ ...prev, property_id: propertyId }))
                      }
                    } catch (error) {
                      console.error('[Inspections] Error creating/finding property:', error)
                    }
                  }}
                  onAddressDelete={() => {
                    setFormData(prev => ({ ...prev, property_id: null }))
                  }}
                  propertyId={formData.property_id}
                  onLoadingChange={setLoadingProperty}
                />
              </Section>

              {/* Inspection Details Section */}
              <Section title="Inspection Details">
                <Select
                  label={<LabelText>Inspection type</LabelText>}
                  options={inspectionTypeOptions}
                  value={formData.inspection_type_id}
                  onChange={handleSelectChange('inspection_type_id')}
                  placeholder={loadingOptions ? "Loading..." : "Select type"}
                />
                <Select
                  label={<LabelText>Status</LabelText>}
                  options={statusOptions}
                  value={formData.status}
                  onChange={handleSelectChange('status')}
                  placeholder="Select status"
                />
                <Input
                  label={<LabelText>Reason for inspection</LabelText>}
                  value={formData.reason_for_inspection}
                  onChange={handleInputChange('reason_for_inspection')}
                  type="textarea"
                  placeholder="Describe the reason..."
                />
                <Select
                  label={<LabelText>Will someone be present?</LabelText>}
                  options={personPresentOptions}
                  value={formData.person_present}
                  onChange={handleSelectChange('person_present')}
                  placeholder="Select option"
                />
              </Section>

              {/* Notes Section */}
              <Section title="Notes">
                <Input
                  label={<LabelText>Notes</LabelText>}
                  value={formData.notes}
                  onChange={handleInputChange('notes')}
                  type="textarea"
                  placeholder="Add notes..."
                />
                <Input
                  label={
                    <LabelText helpText="Internal notes are only visible to your team">
                      Internal notes
                    </LabelText>
                  }
                  value={formData.internal_notes}
                  onChange={handleInputChange('internal_notes')}
                  type="textarea"
                  placeholder="Add internal notes..."
                />
              </Section>

              {/* Updated timestamp and Delete Button */}
              <div className="flex flex-row items-center justify-between gap-2">
                <Button
                  variant="white"
                  onClick={handleDelete}
                >
                  <Trash2 size={12} style={{ color: '#000000' }} />
                </Button>
                <span 
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#6B7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {saving ? (
                    <>
                      <span className="saving-spinner"></span>
                      Saving
                    </>
                  ) : currentInspection?.updated_at ? (
                    `Updated ${formatUpdatedAt(currentInspection.updated_at)}`
                  ) : null}
                </span>
              </div>
            </div>
          ) : null
        }
      />
    </NewPage>
  )
}

export default Inspections

