import { useState, useEffect, useRef } from 'react'
import {
  ArrowUpRight,
  Plus
} from 'lucide-react'
import Input from '../components/Input'
import AddressInput from '../components/AddressInput'
import Select from '../components/Select'
import RadioGroup from '../components/RadioGroup'
import InspectionDate from '../components/InspectionDate'
import InspectionTime from '../components/InspectionTime'
import Button from '../components/Button'
import NewPage from '../components/NewPage'
import SectionHeader from '../components/SectionHeader'
import LabelText from '../components/LabelText'
import { leadsAPI, inspectionsAPI, propertiesAPI, callReasonsAPI } from '../utils/apiService'

function Leads() {
  const [selectedLead, setSelectedLead] = useState(0) // Index of selected lead
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [callReasonsMap, setCallReasonsMap] = useState({}) // Map of reason ID to reason name
  const [callReasonsData, setCallReasonsData] = useState({}) // Map of reason ID to full reason object (includes auto_create_inspection)
  
        // Fetch leads from API
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true)
        // Try to fetch leads with property relation included
        const response = await leadsAPI.getAll()
        console.log('[Leads] Full API response:', JSON.stringify(response, null, 2))
        console.log('[Leads] API response type:', Array.isArray(response) ? 'Array' : typeof response)
        
        // Handle different response formats - could be {leads: [...]} or just [...]
        let leadsArray = []
        if (Array.isArray(response)) {
          leadsArray = response
        } else if (response?.leads && Array.isArray(response.leads)) {
          leadsArray = response.leads
        } else if (response?.data && Array.isArray(response.data)) {
          leadsArray = response.data
        }
        
        // Get all inspections to match with leads
        const inspectionsResponse = await inspectionsAPI.getAll()
        console.log('Inspections API response:', inspectionsResponse)
        
        // Handle different response formats for inspections
        let inspectionsArray = []
        if (Array.isArray(inspectionsResponse)) {
          inspectionsArray = inspectionsResponse
        } else if (inspectionsResponse?.inspections && Array.isArray(inspectionsResponse.inspections)) {
          inspectionsArray = inspectionsResponse.inspections
        } else if (inspectionsResponse?.data && Array.isArray(inspectionsResponse.data)) {
          inspectionsArray = inspectionsResponse.data
        }
        
        // Get all call reasons to map reason IDs to names and full reason data
        let callReasonsMapLocal = {}
        let callReasonsDataLocal = {}
        try {
          const callReasonsResponse = await callReasonsAPI.getAll()
          const callReasonsArray = Array.isArray(callReasonsResponse) 
            ? callReasonsResponse 
            : (callReasonsResponse?.call_reasons || callReasonsResponse?.data || [])
          
          // Create a map of reason ID to reason name and full reason object
          callReasonsMapLocal = {}
          callReasonsDataLocal = {}
          callReasonsArray.forEach(reason => {
            if (reason.id && reason.name) {
              callReasonsMapLocal[reason.id] = reason.name
              callReasonsDataLocal[reason.id] = reason // Store full reason object
            }
          })
          console.log('[Leads] Call reasons map:', callReasonsMapLocal)
          console.log('[Leads] Call reasons data:', callReasonsDataLocal)
          setCallReasonsMap(callReasonsMapLocal) // Store in state for later use
          setCallReasonsData(callReasonsDataLocal) // Store full reason objects for auto_create_inspection check
        } catch (err) {
          console.error('[Leads] Error fetching call reasons:', err)
          // Continue without call reasons - they just won't be displayed
        }
        
        console.log('[Leads] Parsed leads array:', leadsArray)
        console.log('[Leads] Sample lead structure:', leadsArray.length > 0 ? leadsArray[0] : 'No leads')
        console.log('[Leads] Sample lead with property:', leadsArray.find(l => l.property_id) || 'No lead with property')
        console.log('[Leads] Number of leads:', leadsArray.length)
        console.log('[Leads] Number of inspections:', inspectionsArray.length)
        
        // Note: Property endpoints may not be available, so we'll handle property data
        // through the lead's direct address fields or when user enters address
        // Check if any leads have property objects already included in the response
        leadsArray = leadsArray.map(lead => {
          // If property is already included in the response, keep it
          if (lead.property) {
            console.log(`[Leads] Lead ${lead.id} already has property object:`, lead.property)
          }
          return lead
        })
        
        // Map API leads to component format
        const mappedLeads = leadsArray.map((lead) => {
          // Find related inspection for this lead
          const relatedInspection = inspectionsArray.find(
            (insp) => insp.lead_id === lead.id
          )
          
          // Parse name - use first_name and last_name fields (new API format)
          let firstName = lead.first_name || ''
          let lastName = lead.last_name || ''
          
          // Fallback to Name field if first_name/last_name don't exist (backwards compatibility)
          if (!firstName && !lastName && lead.Name) {
            const nameParts = lead.Name.split(' ')
            firstName = nameParts[0] || ''
            lastName = nameParts.slice(1).join(' ') || ''
          }
          
          // Final fallback to email or phone if no name fields exist
          if (!firstName && !lastName) {
            firstName = lead.email ? lead.email.split('@')[0] : (lead.phone ? `Lead ${lead.id.substring(0, 8)}` : 'Unknown')
            lastName = ''
          }
          
          // Extract time from scheduled_start_time if available and valid
          let time = ''
          if (relatedInspection?.scheduled_start_time && relatedInspection.scheduled_start_time > 0) {
            const date = new Date(relatedInspection.scheduled_start_time)
            if (!isNaN(date.getTime())) {
              const hours = date.getHours()
              const minutes = date.getMinutes()
              const ampm = hours >= 12 ? 'PM' : 'AM'
              const displayHours = hours % 12 || 12
              time = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
            }
          }
          
          // If no scheduled time, use created_at time
          if (!time && lead.created_at) {
            const date = new Date(lead.created_at)
            if (!isNaN(date.getTime())) {
              const hours = date.getHours()
              const minutes = date.getMinutes()
              const ampm = hours >= 12 ? 'PM' : 'AM'
              const displayHours = hours % 12 || 12
              time = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
            }
          }
          
          // Parse inspection date if available and valid
          let inspectionDate = null
          if (relatedInspection?.scheduled_start_time && relatedInspection.scheduled_start_time > 0) {
            const date = new Date(relatedInspection.scheduled_start_time)
            if (!isNaN(date.getTime())) {
              inspectionDate = date
            }
          }
          
          // Format last updated
          let lastUpdated = ''
          if (lead.updated_at) {
            const updatedDate = new Date(lead.updated_at)
            const month = updatedDate.getMonth() + 1
            const day = updatedDate.getDate()
            const hours = updatedDate.getHours()
            const minutes = updatedDate.getMinutes()
            const ampm = hours >= 12 ? 'PM' : 'AM'
            const displayHours = hours % 12 || 12
            lastUpdated = `${month}/${day}, ${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
          }
          
          // Get address from property if available, otherwise from lead
          // First check if lead has address fields directly
          let address = lead.address || lead.location_address || lead.street_address || lead.full_address || ''
          
          // Debug logging
          if (lead.property_id) {
            console.log(`[Leads] Lead ${lead.id} has property_id: ${lead.property_id}`)
            console.log(`[Leads] Lead property object:`, lead.property)
            console.log(`[Leads] Lead address fields:`, {
              address: lead.address,
              location_address: lead.location_address,
              street_address: lead.street_address,
              full_address: lead.full_address,
              property_address: lead.property?.address,
              property_full_address: lead.property?.full_address,
              property_street_address: lead.property?.street_address,
              property_location_address: lead.property?.location_address
            })
          }
          
          // Try to get address from property object if available
          if (!address && lead.property) {
            address = lead.property.address || 
                      lead.property.full_address || 
                      lead.property.street_address ||
                      lead.property.location_address ||
                      lead.property.street ||
                      ''
            console.log(`[Leads] Found address from property: ${address}`)
          }
          
          // If we have property_id but no address, we'll try to fetch it later in the form
          if (!address && lead.property_id) {
            console.log(`[Leads] Lead ${lead.id} has property_id ${lead.property_id} but no address found. Will attempt to fetch property in form.`)
          }
          
          // Get call reason name from map
          const reasonName = lead.lead_reason_id && callReasonsMapLocal[lead.lead_reason_id] 
            ? callReasonsMapLocal[lead.lead_reason_id] 
            : null
          
          return {
            id: lead.id,
            firstName,
            lastName,
            email: lead.email || '',
            phone: lead.phone || '',
            address: address,
            propertyType: lead.property?.property_type_id || lead.property_type_id || '',
            property_id: lead.property_id || null,
            lead_reason_id: lead.lead_reason_id || null,
            reasonName: reasonName, // Store the reason name for display
            inspectionDate,
            inspectionTime: relatedInspection ? (relatedInspection.scheduled_start_time ? 'scheduled' : null) : null,
            inspectionNotes: relatedInspection?.notes || '',
            relationship: lead.internal_notes || '',
            present: null, // Would need inspection data
            source: lead.lead_source_id || '', // Would need lead_source lookup
            heardAbout: lead.notes || '',
            description: lead.notes ? (lead.notes.length > 50 ? lead.notes.substring(0, 50) + '...' : lead.notes) : '',
            time,
            lastUpdated,
            // Store original API data for updates
            _apiData: lead,
            _inspection: relatedInspection
          }
        })
        
        // Sort by scheduled time (most recent first) or by created date
        mappedLeads.sort((a, b) => {
          if (a.time && !b.time) return -1
          if (!a.time && b.time) return 1
          if (a.time && b.time) return 0
          // Sort by created_at if no time
          const dateA = a._apiData?.created_at ? new Date(a._apiData.created_at) : new Date(0)
          const dateB = b._apiData?.created_at ? new Date(b._apiData.created_at) : new Date(0)
          return dateB - dateA
        })
        
        console.log('Mapped leads:', JSON.stringify(mappedLeads, null, 2))
        console.log('Setting leads state with', mappedLeads.length, 'leads')
        setLeads(mappedLeads)
        setError(null)
      } catch (err) {
        console.error('Error fetching leads:', err)
        setError('Failed to load leads. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchLeads()
  }, [])

  const currentLead = leads.length > 0 ? (leads[selectedLead] || leads[0]) : null

  // Format date for display
  const formatDateDisplay = (date) => {
    if (!date) return ''
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`
  }

  // Format time for display
  const formatTimeDisplay = (timeValue) => {
    const timeMap = {
      'morning': '6:00 AM - 1:00 PM',
      'afternoon': '1:00 PM - 6:00 PM'
    }
    return timeMap[timeValue] || ''
  }

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    propertyType: '',
    lead_reason_id: null,
    inspectionDate: null,
    inspectionTime: null,
    inspectionNotes: '',
    relationship: '',
    present: null,
    source: '',
    heardAbout: ''
  })

  // Update form data when lead changes
  useEffect(() => {
    const lead = leads.length > 0 ? (leads[selectedLead] || leads[0]) : null
    if (lead) {
      // Get address from property if available, otherwise from lead
      let address = lead.address || ''
      let propertyType = lead.propertyType || ''
      
      // Debug logging
      console.log(`[Leads Form] Loading form data for lead ${lead.id}:`, {
        leadAddress: lead.address,
        property_id: lead.property_id,
        hasProperty: !!lead.property,
        hasPropertyInApiData: !!lead._apiData?.property,
        propertyObject: lead.property || lead._apiData?.property
      })
      
      // Try to get address and property type from property object (either from lead.property or lead._apiData.property)
      if (lead.property || lead._apiData?.property) {
        const property = lead.property || lead._apiData?.property
        
        // Get address from property - prioritize full formatted address
        if (!address) {
          // Try full formatted address first (like "26009 NE 150th St, Brush Prairie, WA 98606, USA")
          address = property.full_address || 
                    property.formatted_address ||
                    property.address
          
          // If no full address, construct it from individual fields
          if (!address) {
            const parts = []
            if (property.street_address || property.address) {
              parts.push(property.street_address || property.address)
            }
            if (property.city) parts.push(property.city)
            if (property.state) parts.push(property.state)
            if (property.zip_code) parts.push(property.zip_code)
            if (property.country) parts.push(property.country)
            
            address = parts.length > 0 ? parts.join(', ') : ''
          }
          
          if (address) {
            console.log(`[Leads Form] Found address from property: ${address}`)
          }
        }
        
        // Get property type from property
        if (!propertyType && property.property_type_id) {
          propertyType = property.property_type_id
          console.log(`[Leads Form] Found property type from property: ${propertyType}`)
        }
      }
      
      // If we have property_id but no property object, try to fetch it
      if (lead.property_id && !lead.property && !lead._apiData?.property) {
        console.log(`[Leads Form] Lead ${lead.id} has property_id ${lead.property_id} but no property object. Fetching property...`)
        propertiesAPI.getById(lead.property_id)
          .then(property => {
            console.log(`[Leads Form] Fetched property:`, property)
            // Update the lead in the leads array with the property
            const updatedLeads = leads.map(l => {
              if (l.id === lead.id) {
                return {
                  ...l,
                  property: property,
                  _apiData: {
                    ...l._apiData,
                    property: property
                  }
                }
              }
              return l
            })
            setLeads(updatedLeads)
            
            // Update form data with property info - prioritize full formatted address
            let propertyAddress = property.full_address || 
                                 property.formatted_address ||
                                 property.address
            
            // If no full address, construct it from individual fields
            if (!propertyAddress) {
              const parts = []
              if (property.street_address || property.address) {
                parts.push(property.street_address || property.address)
              }
              if (property.city) parts.push(property.city)
              if (property.state) parts.push(property.state)
              if (property.zip_code) parts.push(property.zip_code)
              if (property.country) parts.push(property.country)
              
              propertyAddress = parts.length > 0 ? parts.join(', ') : ''
            }
            
            const propertyTypeFromProp = property.property_type_id || ''
            
            setFormData(prev => ({
              ...prev,
              address: propertyAddress || prev.address,
              propertyType: propertyTypeFromProp || prev.propertyType
            }))
          })
          .catch(error => {
            console.error(`[Leads Form] Error fetching property ${lead.property_id}:`, error)
          })
      }
      
      // If still no address but we have property_id, log a warning
      if (!address && lead.property_id) {
        console.warn(`[Leads Form] Lead ${lead.id} has property_id ${lead.property_id} but no address found. Property may need to be fetched separately.`)
      }
      
      setFormData({
        firstName: lead.firstName || '',
        lastName: lead.lastName || '',
        email: lead.email || '',
        phone: lead.phone || '',
        address: address,
        propertyType: propertyType,
        lead_reason_id: lead.lead_reason_id || null,
        inspectionDate: lead.inspectionDate || null,
        inspectionTime: lead.inspectionTime || null,
        inspectionNotes: lead.inspectionNotes || '',
        relationship: lead.relationship || '',
        present: lead.present || null,
        source: lead.source || '',
        heardAbout: lead.heardAbout || ''
      })
    } else {
      // Reset form when no lead is selected
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        propertyType: '',
        lead_reason_id: null,
        inspectionDate: null,
        inspectionTime: null,
        inspectionNotes: '',
        relationship: '',
        present: null,
        source: '',
        heardAbout: ''
      })
    }
  }, [selectedLead, leads])

  // Debounced save function
  const saveTimeoutRef = useRef(null)
  const addressTimeoutRef = useRef(null)
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      if (addressTimeoutRef.current) {
        clearTimeout(addressTimeoutRef.current)
      }
    }
  }, [])
  
  const saveLeadChanges = async (field, value) => {
    if (!currentLead) return
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    // Set new timeout to save after 1 second of inactivity
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        // Map frontend field names to API field names
        const fieldMapping = {
          firstName: 'first_name',
          lastName: 'last_name',
          email: 'email',
          phone: 'phone',
          address: 'address',
          propertyType: 'property_type_id',
          relationship: 'internal_notes',
          source: 'lead_source_id',
          heardAbout: 'notes'
        }
        
        const apiFieldName = fieldMapping[field] || field
        
        // Convert empty strings to null for optional fields
        let apiValue = value
        if (value === '' || value === null || value === undefined) {
          apiValue = null
        }
        
        // Convert phone to number if it's a string of digits
        if (field === 'phone' && apiValue && typeof apiValue === 'string') {
          const phoneDigits = apiValue.replace(/[^0-9]/g, '')
          if (phoneDigits) {
            apiValue = parseInt(phoneDigits, 10)
          } else {
            apiValue = null
          }
        }
        
        // Handle property_type_id - it's stored on the property table, not the lead table
        if (field === 'propertyType') {
          // Get property_id from the lead
          const propertyId = currentLead.property_id || currentLead._apiData?.property_id
          
          if (!propertyId) {
            console.error('[Auto-save] Cannot save property type: No property_id found on lead')
            return
          }
          
          // Update the property record instead of the lead record
          const updateData = {
            property_type_id: apiValue
          }
          
          console.log(`[Auto-save] Saving property_type_id to property ${propertyId}:`, updateData)
          
          // Use the property-patch endpoint
          const { API_V2_BASE_URL } = await import('../config/api')
          const token = localStorage.getItem('authToken')
          const headers = {
            'Content-Type': 'application/json',
          }
          if (token) {
            headers['Authorization'] = `Bearer ${token}`
          }
          
          const response = await fetch(`${API_V2_BASE_URL}/property-patch`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
              id: propertyId,
              data: updateData
            })
          })
          
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || `Failed to update property: ${response.status}`)
          }
          
          const responseData = await response.json()
          console.log(`[Auto-save] Successfully saved property_type_id:`, responseData)
          
          // Update the lead in the leads array to reflect the change
          const updatedLeads = leads.map(lead => {
            if (lead.id === currentLead.id) {
              return {
                ...lead,
                [field]: value,
                property_id: propertyId, // Ensure property_id is set
                _apiData: {
                  ...lead._apiData,
                  property: {
                    ...lead._apiData?.property,
                    property_type_id: apiValue
                  }
                }
              }
            }
            return lead
          })
          setLeads(updatedLeads)
          return
        }
        
        // For all other fields, update the lead record
        const updateData = {
          [apiFieldName]: apiValue
        }
        
        console.log(`[Auto-save] Saving ${field} (${apiFieldName}):`, updateData)
        const response = await leadsAPI.update(currentLead.id, updateData)
        console.log(`[Auto-save] Successfully saved ${field}:`, response)
        
        // Update the lead in the leads array
        const updatedLeads = leads.map(lead => {
          if (lead.id === currentLead.id) {
            const updatedLead = {
              ...lead,
              [field]: value,
              _apiData: {
                ...lead._apiData,
                [apiFieldName]: apiValue
              }
            }
            // Update lastUpdated timestamp
            if (response && response.updated_at) {
              const updatedDate = new Date(response.updated_at)
              const month = updatedDate.getMonth() + 1
              const day = updatedDate.getDate()
              const hours = updatedDate.getHours()
              const minutes = updatedDate.getMinutes()
              const ampm = hours >= 12 ? 'PM' : 'AM'
              const displayHours = hours % 12 || 12
              updatedLead.lastUpdated = `${month}/${day}, ${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
            }
            return updatedLead
          }
          return lead
        })
        setLeads(updatedLeads)
      } catch (error) {
        console.error(`[Auto-save] Error saving ${field}:`, error)
        console.error(`[Auto-save] Error details:`, {
          message: error.message,
          stack: error.stack
        })
        // Don't show alert for every field - just log it
        // alert(`Failed to save ${field}: ${error.message || 'Unknown error'}`)
      }
    }, 1000) // Wait 1 second after user stops typing
  }

  // Handle address change - create or find property
  const handleAddressChange = async (e) => {
    const address = e.target ? e.target.value : e
    const addressValue = typeof address === 'string' ? address : (address?.target?.value || '')
    
    // Check if this is a selection from dropdown (indicated by a flag)
    const isSelection = e?.isSelection === true

    // Update form data immediately
    setFormData(prev => ({ ...prev, address: addressValue }))

    // If address is empty, clear property link
    if (!addressValue || addressValue.trim().length === 0) {
      if (currentLead && currentLead.property_id) {
        try {
          await leadsAPI.update(currentLead.id, { property_id: null })
          const updatedLeads = leads.map(lead => {
            if (lead.id === currentLead.id) {
              return {
                ...lead,
                property_id: null,
                propertyType: '',
                _apiData: {
                  ...lead._apiData,
                  property_id: null,
                  property: null
                }
              }
            }
            return lead
          })
          setLeads(updatedLeads)
        } catch (error) {
          console.error('[Address] Error clearing property link:', error)
        }
      }
      return
    }
    
    // If this is a selection from dropdown, process immediately (no debounce)
    if (isSelection) {
      // Clear any pending timeout
      if (addressTimeoutRef.current) {
        clearTimeout(addressTimeoutRef.current)
      }
      
      // Extract place data if available
      const placeData = e?.placeData || null
      
      // Process immediately
      await processAddressChange(addressValue, placeData)
      return
    }
    
    // For typing, debounce the property check/create to avoid too many API calls
    if (addressTimeoutRef.current) {
      clearTimeout(addressTimeoutRef.current)
    }
    
    addressTimeoutRef.current = setTimeout(async () => {
      await processAddressChange(addressValue, null)
    }, 1000) // Debounce for 1 second
  }
  
  // Extract the property check/create logic into a separate function
  // Now uses backend endpoint that handles find-or-create logic
  const processAddressChange = async (addressValue, placeData = null) => {
      if (!currentLead || !currentLead.id) return
      
      try {
        console.log('[Address] Finding or creating property with address:', addressValue)
        console.log('[Address] Place data:', placeData)
        
        // If we have placeData (from dropdown selection), use it - it has the full formatted address
        // If we don't have placeData (just typing), only process if addressValue looks like a complete address
        if (!placeData) {
          // If just typing and address doesn't look complete (no comma, likely just a number or partial), skip
          if (!addressValue || addressValue.length < 10 || !addressValue.includes(',')) {
            console.log('[Address] Skipping - address appears incomplete:', addressValue)
            return
          }
        }
        
        // Prepare property data - endpoint requires: street_address, city, state, zip_code, country
        let propertyData
        
        if (placeData) {
          // We have structured data from Google Places - use it
          if (!placeData.street_address || !placeData.city || !placeData.state || !placeData.zip_code) {
            console.error('[Address] Missing required address fields from placeData:', placeData)
            return
          }
          
          propertyData = {
            street_address: placeData.street_address,
            city: placeData.city,
            state: placeData.state,
            zip_code: placeData.zip_code,
            country: placeData.country || 'USA'
            // property_type_id is intentionally omitted - can be set later
          }
        } else {
          // No placeData - we can't create a property without structured address components
          // The endpoint requires street_address, city, state, zip_code
          console.error('[Address] Cannot create property without structured address data. Please select from dropdown.')
          return
        }
        
        // Validate required fields
        if (!propertyData.street_address || !propertyData.city || !propertyData.state || !propertyData.zip_code) {
          console.error('[Address] Missing required address fields:', propertyData)
          return
        }
        
        console.log('[Address] Calling findOrCreate with propertyData:', propertyData)
        
        // Backend handles: check if exists, create if not, return property
        let property
        try {
          property = await propertiesAPI.findOrCreate(propertyData)
          console.log('[Address] Property found or created:', property)
        } catch (error) {
          console.error('[Address] Error calling findOrCreate:', error)
          console.error('[Address] Error details:', error.message, error.stack)
          return
        }
        
        if (!property || !property.id) {
          console.error('[Address] Failed to find or create property - no property returned')
          console.error('[Address] Response was:', property)
          return
        }
        
        // Link the property to the lead if not already linked
        if (property && property.id && (!currentLead.property_id || currentLead.property_id !== property.id)) {
          console.log('[Address] Linking property to lead')
          try {
            await leadsAPI.update(currentLead.id, { property_id: property.id })
            // Update leads array and form data
            const updatedLeads = leads.map(lead => {
              if (lead.id === currentLead.id) {
                return {
                  ...lead,
                  property_id: property.id,
                  propertyType: property.property_type_id || lead.propertyType || '',
                  property: property,
                  _apiData: {
                    ...lead._apiData,
                    property_id: property.id,
                    property: property
                  }
                }
              }
              return lead
            })
            setLeads(updatedLeads)
            
            // Update form data with property type if available
            if (property.property_type_id) {
              setFormData(prev => ({
                ...prev,
                propertyType: property.property_type_id
              }))
            }
          } catch (error) {
            console.error('[Address] Error linking property to lead:', error)
          }
        }
      } catch (error) {
        console.error('[Address] Error finding/creating property:', error)
      }
  }

  const handleInputChange = (field) => (e) => {
    const value = e.target ? e.target.value : e
    setFormData(prev => ({ ...prev, [field]: value }))
    // Trigger auto-save
    saveLeadChanges(field, value)
  }

  // Handle lead_reason_id change and update lead record
  const handleReasonChange = async (value) => {
    if (!currentLead) return
    
    // Optimistically update the UI
    const previousValue = formData.lead_reason_id
    setFormData(prev => ({ ...prev, lead_reason_id: value }))
    
    try {
      const updateData = {
        lead_reason_id: value || null
      }
      console.log('Updating lead with data:', updateData)
      const response = await leadsAPI.update(currentLead.id, updateData)
      console.log('Lead reason updated successfully:', response)
      
      // Get the reason name from the map
      const reasonName = value && callReasonsMap[value] ? callReasonsMap[value] : null
      
      // Update the lead in the leads array
      const updatedLeads = leads.map(lead => {
        if (lead.id === currentLead.id) {
          return {
            ...lead,
            lead_reason_id: value || null,
            reasonName: reasonName, // Update the reason name
            _apiData: {
              ...lead._apiData,
              lead_reason_id: value || null
            }
          }
        }
        return lead
      })
      setLeads(updatedLeads)
    } catch (error) {
      console.error('Error updating lead reason:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      })
      // Revert the change on error
      setFormData(prev => ({ ...prev, lead_reason_id: previousValue }))
      alert(`Failed to save reason: ${error.message || 'Unknown error'}`)
    }
  }

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, inspectionDate: date, inspectionTime: null })) // Clear time when date changes
  }

  const handleTimeChange = (time) => {
    setFormData(prev => ({ ...prev, inspectionTime: time }))
  }

  // Check if current lead_reason has auto_create_inspection enabled
  const shouldShowInspectionSection = () => {
    if (!formData.lead_reason_id) return false
    const reason = callReasonsData[formData.lead_reason_id]
    return reason && reason.auto_create_inspection === true
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
          Leads
        </h1>
        <Button variant="dark">
          <Plus size={14} />
          <span>Create</span>
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-row flex-1" style={{ overflow: 'hidden', minHeight: 0 }}>
        {/* Left Column - Leads List */}
        <div
          className="flex flex-col"
          style={{
            width: '300px',
            borderRight: '1px solid #E5E5E5',
            padding: '20px',
            gap: '20px',
            overflowY: 'auto'
          }}
        >
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
              {(() => {
                const today = new Date()
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                return `Today, ${months[today.getMonth()]} ${today.getDate()}`
              })()}
            </span>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <span style={{ color: '#676767', fontSize: '12px' }}>Loading leads...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-8">
              <span style={{ color: '#FF0000', fontSize: '12px' }}>{error}</span>
            </div>
          )}

          {!loading && !error && leads.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <span style={{ color: '#676767', fontSize: '12px' }}>No leads found</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {leads.map((lead, index) => (
              <div
                key={lead.id}
                onClick={() => setSelectedLead(index)}
                className="flex flex-col cursor-pointer transition-all"
                style={{
                  backgroundColor: selectedLead === index ? '#EDEDED' : '#FFFFFF',
                  borderRadius: '10px',
                  padding: '15px'
                }}
                onMouseEnter={(e) => {
                  if (selectedLead !== index) {
                    e.currentTarget.style.backgroundColor = '#F5F5F5'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedLead !== index) {
                    e.currentTarget.style.backgroundColor = '#FFFFFF'
                  }
                }}
              >
                <div className="flex flex-row items-center justify-between w-full">
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#202020',
                      letterSpacing: '-0.01em'
                    }}
                >
                  {lead.firstName} {lead.lastName || ''}
                </span>
                {lead.time && (
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#4B4B4B',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {lead.time}
                  </span>
                )}
                </div>
                {lead.reasonName && (
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#4B4B4B',
                      letterSpacing: '-0.01em',
                      marginTop: '4px'
                    }}
                  >
                    {lead.reasonName}
                  </span>
                )}
                {lead.description && (
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#4B4B4B',
                      letterSpacing: '-0.01em',
                      marginTop: lead.reasonName ? '4px' : '10px'
                    }}
                  >
                    {lead.description}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Lead Details Form */}
        <div
          className="flex-1 overflow-y-auto"
          style={{
            padding: '40px 60px',
            minHeight: 0
          }}
        >
          <div
            style={{
              maxWidth: '50rem',
              margin: '0',
              gap: '30px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {!currentLead && !loading && (
              <div className="flex items-center justify-center h-full">
                <span style={{ color: '#676767', fontSize: '14px' }}>
                  Select a lead to view details
                </span>
              </div>
            )}

            {currentLead && (
              <>
            {/* WHO ARE YOU? */}
          <div className="flex flex-col gap-4">
            <SectionHeader>WHO ARE YOU?</SectionHeader>
            <div className="flex flex-row flex-wrap" style={{ gap: '20px' }}>
              <Input
                label="First Name"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                className="flex-1 min-w-[253px]"
              />
              <Input
                label="Last Name"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                className="flex-1 min-w-[253px]"
              />
            </div>
          </div>

          {/* HOW DO WE REACH YOU? */}
          <div className="flex flex-col gap-4">
            <SectionHeader>HOW DO WE REACH YOU?</SectionHeader>
            <div className="flex flex-row flex-wrap" style={{ gap: '20px' }}>
              <Input
                label="Email"
                type="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleInputChange('email')}
                className="flex-1 min-w-[253px]"
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="Enter phone"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                className="flex-1 min-w-[253px]"
              />
            </div>
          </div>

          {/* WHERE IS THE JOB? */}
          <div className="flex flex-col gap-4">
            <SectionHeader>WHERE IS THE JOB?</SectionHeader>
            <div className="flex flex-col gap-4">
              <AddressInput
                label="Address"
                description="The exact location they are calling about."
                placeholder="Enter address"
                value={formData.address}
                onChange={handleAddressChange}
                fullWidth={true}
              />
              <Select
                label="Property type"
                description="Helps us understand the building so we send the right team."
                placeholder="Select property type"
                fetchFrom="property-types"
                optionValueKey="id"
                optionLabelKey="name"
                value={formData.propertyType}
                onChange={handleInputChange('propertyType')}
                fullWidth={true}
              />
            </div>
          </div>

          {/* WHY DO YOU NEED US? */}
          <div className="flex flex-col gap-4">
            <SectionHeader>WHY DO YOU NEED US?</SectionHeader>
            <Select
              label="Reason for call"
              description="What issue is the client experiencing or worried about?"
              placeholder="Select reason"
              fetchFrom="call-reasons"
              optionValueKey="id"
              optionLabelKey="name"
              value={formData.lead_reason_id}
              onChange={handleReasonChange}
              fullWidth={true}
            />
          </div>

          {/* WHEN WORKS? */}
          {shouldShowInspectionSection() && (
            <div className="flex flex-col gap-4">
              <SectionHeader>WHEN WORKS?</SectionHeader>
              <div className="flex flex-col gap-4">
                <InspectionDate
                  label="Date"
                  description="Which day works best for the inspection?"
                  value={formData.inspectionDate}
                  onChange={handleDateChange}
                />
                <InspectionTime
                  label="Time"
                  description="Choose a time window that works for the client and our team."
                  value={formData.inspectionTime}
                  onChange={handleTimeChange}
                  selectedDate={formData.inspectionDate}
                />
                <Input
                  label="Inspection notes"
                  description="Anything the inspector should know?"
                  type="textarea"
                  placeholder="Enter inspection notes"
                  value={formData.inspectionNotes}
                  onChange={handleInputChange('inspectionNotes')}
                  fullWidth={true}
                />
                
                {/* Summary Section */}
                {(formData.inspectionDate || formData.inspectionTime || formData.inspectionNotes) && (
                  <div className="flex flex-col gap-2">
                    {formData.inspectionDate && (
                      <div className="flex flex-col gap-0">
                        <LabelText>Date</LabelText>
                        <span
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '12px',
                            fontWeight: 400,
                            color: '#9A9A9A',
                            letterSpacing: '-0.01em'
                          }}
                        >
                          {formatDateDisplay(formData.inspectionDate)}
                        </span>
                      </div>
                    )}
                    {formData.inspectionTime && (
                      <div className="flex flex-col gap-0">
                        <LabelText>Time</LabelText>
                        <span
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '12px',
                            fontWeight: 400,
                            color: '#9A9A9A',
                            letterSpacing: '-0.01em'
                          }}
                        >
                          {formatTimeDisplay(formData.inspectionTime)}
                        </span>
                      </div>
                    )}
                    {formData.inspectionNotes && (
                      <div className="flex flex-col gap-0">
                        <LabelText>Inspection notes</LabelText>
                        <span
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '12px',
                            fontWeight: 400,
                            color: '#9A9A9A',
                            letterSpacing: '-0.01em'
                          }}
                        >
                          {formData.inspectionNotes}
                        </span>
                      </div>
                    )}
                    <Button
                      variant="white"
                      className="mt-2 gap-1"
                      style={{ alignSelf: 'flex-start' }}
                    >
                      <span>Edit</span>
                      <ArrowUpRight size={12} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* INTERNAL PROCESS */}
          <div className="flex flex-col gap-4">
            <SectionHeader>INTERNAL PROCESS</SectionHeader>
            <Input
              label="Your relationship"
              description="Are you the property owner or the manager? Who are you?"
              type="textarea"
              placeholder="Enter relationship"
              value={formData.relationship}
              onChange={handleInputChange('relationship')}
              fullWidth={true}
            />
          </div>

          {/* Present! */}
          <div className="flex flex-col gap-4">
            <RadioGroup
              label="Present"
              description="Will someone be onsite to provide access or answer questions?"
              options={[
                { value: 'Yes', label: 'Yes' },
                { value: 'No', label: 'No' },
                { value: 'Not sure yet', label: 'Not sure yet' }
              ]}
              value={formData.present}
              onChange={handleInputChange('present')}
            />
          </div>

          {/* Source */}
          <div className="flex flex-col gap-4">
            <Select
              label="Source"
              description="Where this lead came from so we can track performance."
              placeholder="Select source"
              options={[
                { value: 'Phone call', label: 'Phone call' },
                { value: 'Website', label: 'Website' },
                { value: 'Referral', label: 'Referral' },
                { value: 'Email', label: 'Email' },
                { value: 'Other', label: 'Other' }
              ]}
              value={formData.source}
              onChange={handleInputChange('source')}
            />
          </div>

          {/* How did they hear about us? */}
          <div className="flex flex-col gap-4">
            <Input
              label="How did they hear about us?"
              description="Any details that help us understand why they chose to call."
              type="textarea"
              placeholder="Enter details"
              value={formData.heardAbout}
              onChange={handleInputChange('heardAbout')}
              fullWidth={true}
            />
          </div>

          {/* Footer */}
            <div className="flex flex-row items-center justify-end gap-2 pt-4">
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '11px',
                  fontWeight: 400,
                  color: '#676767',
                  letterSpacing: '-0.01em'
                }}
              >
                Updated {currentLead.lastUpdated || 'Never'}
              </span>
            </div>
            </>
          )}
          </div>
        </div>
      </div>
    </NewPage>
  )
}

export default Leads
