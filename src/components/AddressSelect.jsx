import { useState, useEffect, useRef, useCallback } from 'react'
import { Plus, Repeat, Pencil } from 'lucide-react'
import Button from './Button'
import IconButton from './IconButton'
import Modal from './Modal'
import SearchPanel from './SearchPanel'
import Input from './Input'
import Select from './Select'
import LabelText from './LabelText'
import Badge from './Badge'
import { loadGoogleMapsScript } from '../utils/loadGoogleMaps'
import { GOOGLE_PLACES_API_KEY, API_CONTACTS_BASE_URL } from '../config/api'
import { propertiesAPI } from '../utils/apiService'

function AddressSelect({ id, onAddressChange, onAddressDelete, propertyId, propertyType: initialPropertyType = null, onPropertyUpdate, onLoadingChange }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [page, setPage] = useState('search') // 'search' or 'edit'
  const [searchQuery, setSearchQuery] = useState('')
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [pendingSelection, setPendingSelection] = useState(null)
  const [propertyType, setPropertyType] = useState(initialPropertyType)
  const [propertyData, setPropertyData] = useState(null)
  const [loadingProperty, setLoadingProperty] = useState(false)
  const debounceTimerRef = useRef(null)
  const autocompleteServiceRef = useRef(null)
  const placesServiceRef = useRef(null)
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    notes: '',
    number_of_stories: '',
    roof_type_id: null,
    property_type_id: null,
    roof_acess_type_id: null, // Note: "acess" is the actual field name (typo in DB)
    property_access_type_id: null,
    property_parking_condition_id: null, // Note: singular "condition" 
    accessibility_note_details: '', // Note: singular "note"
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  
  // Dropdown options state
  const [roofTypes, setRoofTypes] = useState([])
  const [propertyTypes, setPropertyTypes] = useState([])
  const [roofAccessTypes, setRoofAccessTypes] = useState([])
  const [propertyAccessTypes, setPropertyAccessTypes] = useState([])
  const [parkingConditions, setParkingConditions] = useState([])
  const [optionsLoading, setOptionsLoading] = useState(false)
  // Store full property access types data to access note_required field
  const [propertyAccessTypesData, setPropertyAccessTypesData] = useState([])

  // Initialize Google Maps Places API
  useEffect(() => {
    if (!GOOGLE_PLACES_API_KEY) {
      console.error('❌ Google Places API key is not configured.')
      return
    }

    loadGoogleMapsScript(GOOGLE_PLACES_API_KEY)
      .then(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          try {
            autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService()
            placesServiceRef.current = new window.google.maps.places.PlacesService(
              document.createElement('div')
            )
          } catch (error) {
            console.error('❌ Failed to create AutocompleteService:', error)
          }
        }
      })
      .catch((error) => {
        console.error('❌ Failed to load Google Maps:', error)
      })
  }, [])

  // Fetch dropdown options
  const fetchDropdownOptions = useCallback(async () => {
    setOptionsLoading(true)
    const token = localStorage.getItem('authToken')
    const headers = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const [
        roofTypesRes,
        propertyTypesRes,
        roofAccessTypesRes,
        propertyAccessTypesRes,
        parkingConditionsRes
      ] = await Promise.all([
        fetch(`${API_CONTACTS_BASE_URL}/roof_types`, { headers }),
        fetch(`${API_CONTACTS_BASE_URL}/property_types`, { headers }),
        fetch(`${API_CONTACTS_BASE_URL}/roof_access_types`, { headers }),
        fetch(`${API_CONTACTS_BASE_URL}/property_access_types`, { headers }),
        fetch(`${API_CONTACTS_BASE_URL}/property_parking_conditions`, { headers }),
      ])

      const roofTypesData = await roofTypesRes.json()
      const propertyTypesData = await propertyTypesRes.json()
      const roofAccessTypesData = await roofAccessTypesRes.json()
      const propertyAccessTypesData = await propertyAccessTypesRes.json()
      const parkingConditionsData = await parkingConditionsRes.json()

      // Transform to options format
      const mapToOptions = (data) => {
        const items = Array.isArray(data) ? data : (data.items || data.data || [])
        return items.map(item => ({
          value: item.id,
          label: item.name || item.label || item.title || String(item.id)
        }))
      }

      setRoofTypes(mapToOptions(roofTypesData))
      setPropertyTypes(mapToOptions(propertyTypesData))
      setRoofAccessTypes(mapToOptions(roofAccessTypesData))
      setPropertyAccessTypes(mapToOptions(propertyAccessTypesData))
      setParkingConditions(mapToOptions(parkingConditionsData))
      
      // Store full property access types data (including note_required)
      const propertyAccessItems = Array.isArray(propertyAccessTypesData) 
        ? propertyAccessTypesData 
        : (propertyAccessTypesData.items || propertyAccessTypesData.data || [])
      setPropertyAccessTypesData(propertyAccessItems)
    } catch (err) {
      console.error('[AddressSelect] Error fetching dropdown options:', err)
    } finally {
      setOptionsLoading(false)
    }
  }, [])

  // Handle edit form field changes
  const handleEditFormChange = (field) => (e) => {
    const value = e.target ? e.target.value : e
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  // Handle opening edit modal
  const handleEditProperty = () => {
    if (!propertyData) return
    
    // Populate form with existing property data
    // Note: Field names match the actual DB schema (some have typos/variations)
    setEditForm({
      notes: propertyData.notes || '',
      number_of_stories: propertyData.number_of_stories || '',
      roof_type_id: propertyData.roof_type_id || propertyData.roof_type?.id || null,
      property_type_id: propertyData.property_type_id || propertyData.property_type?.id || null,
      roof_acess_type_id: propertyData.roof_acess_type_id || propertyData.roof_acess_type?.id || null,
      property_access_type_id: propertyData.property_access_type_id || propertyData.property_access_type?.id || null,
      property_parking_condition_id: propertyData.property_parking_condition_id || propertyData.property_parking_condition?.id || null,
      accessibility_note_details: propertyData.accessibility_note_details || '',
    })
    setSaveError(null)
    setPage('edit')
    setIsModalOpen(true)
    fetchDropdownOptions()
  }

  // Handle saving property edits
  const handleSaveProperty = async () => {
    if (!propertyId) return

    try {
      setSaving(true)
      setSaveError(null)

      const token = localStorage.getItem('authToken')
      const headers = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      // Build payload with only non-empty values
      // Note: Field names match the actual DB schema (some have typos/variations)
      const payload = {}
      if (editForm.notes !== undefined) payload.notes = editForm.notes || null
      if (editForm.number_of_stories !== undefined && editForm.number_of_stories !== '') {
        payload.number_of_stories = parseInt(editForm.number_of_stories, 10) || null
      }
      if (editForm.roof_type_id !== undefined) payload.roof_type_id = editForm.roof_type_id
      if (editForm.property_type_id !== undefined) payload.property_type_id = editForm.property_type_id
      if (editForm.roof_acess_type_id !== undefined) payload.roof_acess_type_id = editForm.roof_acess_type_id
      if (editForm.property_access_type_id !== undefined) payload.property_access_type_id = editForm.property_access_type_id
      if (editForm.property_parking_condition_id !== undefined) payload.property_parking_condition_id = editForm.property_parking_condition_id
      if (editForm.accessibility_note_details !== undefined) payload.accessibility_note_details = editForm.accessibility_note_details || null

      console.log('[AddressSelect] Updating property with payload:', payload)

      const response = await fetch(`${API_CONTACTS_BASE_URL}/properties/${propertyId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to update property: ${response.status}`)
      }

      const updatedProperty = await response.json()
      console.log('[AddressSelect] Property updated:', updatedProperty)
      
      // Update local state
      setPropertyData(updatedProperty)
      
      // Update property type display if changed
      const type = updatedProperty?.property_type?.name || null
      if (type && typeof type === 'string' && type.trim() !== '') {
        setPropertyType(type.toLowerCase().trim())
      }

      // Notify parent if callback provided
      if (onPropertyUpdate) {
        onPropertyUpdate(updatedProperty)
      }

      // Close modal
      setIsModalOpen(false)
      setPage('search')
    } catch (err) {
      console.error('[AddressSelect] Error updating property:', err)
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Parse address components from Google Places
  const parseAddressComponents = (addressComponents) => {
    const components = {
      street_number: '',
      route: '',
      city: '',
      state: '',
      zip_code: '',
      country: ''
    }
    
    if (!addressComponents) return components
    
    addressComponents.forEach(component => {
      const types = component.types
      if (types.includes('street_number')) {
        components.street_number = component.long_name
      } else if (types.includes('route')) {
        components.route = component.long_name
      } else if (types.includes('locality') || types.includes('postal_town')) {
        components.city = component.long_name
      } else if (types.includes('administrative_area_level_1')) {
        components.state = component.short_name
      } else if (types.includes('postal_code')) {
        components.zip_code = component.long_name
      } else if (types.includes('country')) {
        components.country = component.short_name
      }
    })
    
    return components
  }

  // Format full address from address object
  const formatFullAddress = (address) => {
    if (!address) return ''
    
    if (address.formatted_address) {
      return address.formatted_address
    }
    
    const parts = []
    if (address.street_address) parts.push(address.street_address)
    if (address.city) parts.push(address.city)
    if (address.state) parts.push(address.state)
    if (address.zip_code || address.zip) parts.push(address.zip_code || address.zip)
    
    return parts.length > 0 ? parts.join(', ') : ''
  }

  // Get secondary text for SearchPanel (city, state, zip)
  const getSecondaryText = (address) => {
    const parts = []
    if (address.city) parts.push(address.city)
    if (address.state) parts.push(address.state)
    if (address.zip_code) parts.push(address.zip_code)
    return parts.join(', ')
  }

  // Map Google Places predictions to SearchPanel format
  const mapPlacesToSearchPanel = (predictions) => {
    return predictions.map((prediction) => {
      const mainText = prediction.structured_formatting.main_text || ''
      const fullDescription = prediction.description || ''
      
      // Extract the remainder (city, state, zip) from the full description
      // Remove the main text (street address) from the beginning
      const remainder = fullDescription.replace(mainText, '').trim().replace(/^,\s*/, '')
      
      return {
        id: prediction.place_id,
        name: mainText,
        company: remainder,
        placeId: prediction.place_id,
        description: prediction.description,
      }
    })
  }

  // Search Google Places
  const searchPlaces = useCallback(async (query) => {
    if (!autocompleteServiceRef.current) {
      setError('Google Places API not initialized')
      return
    }

    try {
      setLoading(true)
      setError(null)

      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: query.trim(),
          types: ['address'],
          componentRestrictions: { country: 'us' }
        },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            const mappedAddresses = mapPlacesToSearchPanel(predictions)
            setAddresses(mappedAddresses)
          } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            setAddresses([])
          } else {
            setError('Failed to search addresses')
            setAddresses([])
          }
          setLoading(false)
        }
      )
    } catch (err) {
      console.error('Error searching places:', err)
      setError(err.message)
      setAddresses([])
      setLoading(false)
    }
  }, [])

  // Debounced search when user types
  useEffect(() => {
    if (!isModalOpen) return

    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    const trimmedQuery = searchQuery.trim()

    // Don't fetch when input is empty
    if (trimmedQuery.length === 0) {
      setAddresses([])
      setLoading(false)
      return
    }

    // Debounce the search by 300ms
    debounceTimerRef.current = setTimeout(() => {
      if (trimmedQuery.length >= 3) {
        searchPlaces(searchQuery)
      } else {
        setAddresses([])
        setLoading(false)
      }
    }, 300)

    // Cleanup on unmount or when dependencies change
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchQuery, isModalOpen, searchPlaces])

  // Clear selectedAddress when id or propertyId is null
  useEffect(() => {
    if (!id && !propertyId) {
      setSelectedAddress(null)
      setPropertyData(null)
      setPropertyType(initialPropertyType || null)
    }
  }, [id, propertyId, initialPropertyType])

  // Fetch property data when propertyId is provided
  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!propertyId) {
        setPropertyData(null)
        setPropertyType(initialPropertyType || null)
        setLoadingProperty(false)
        return
      }

      try {
        setLoadingProperty(true)
        console.log('[AddressSelect] Fetching property data for propertyId:', propertyId)
        const property = await propertiesAPI.getById(propertyId)
        console.log('[AddressSelect] Property data received:', JSON.stringify(property, null, 2))
        setPropertyData(property)
        
        // Extract property type from property data
        // API returns property_type as a nested object with a 'name' field
        const type = property?.property_type?.name || null
        console.log('[AddressSelect] Extracted property_type.name:', type)
        
        // Only set property type if we have an actual value (not null, undefined, or empty string)
        if (type && typeof type === 'string' && type.trim() !== '') {
          const normalizedType = type.toLowerCase().trim()
          console.log('[AddressSelect] Setting propertyType to:', normalizedType)
          setPropertyType(normalizedType)
        } else {
          console.log('[AddressSelect] No valid property type found, setting to null')
          setPropertyType(null)
        }
        
        // If property has address data, set it as selected address
        if (property) {
          // Construct street address from street_number and route if street_address is not available
          let streetAddress = property.street_address || property.address || ''
          if (!streetAddress && (property.street_number || property.route)) {
            streetAddress = [property.street_number, property.route].filter(Boolean).join(' ')
          }
          
          const addressFromProperty = {
            id: property.id,
            street_address: streetAddress,
            city: property.city || '',
            state: property.state || '',
            zip_code: property.zip_code || property.postal_code || property.zip || '',
            country: property.country || 'USA',
            formatted_address: property.formatted_address || property.full_address || property.address || '',
          }
          console.log('[AddressSelect] Setting selectedAddress:', addressFromProperty)
          setSelectedAddress(addressFromProperty)
        }
      } catch (err) {
        console.error('[AddressSelect] Error fetching property data:', err)
        // Don't show error to user, set property type to null if no initial value
        setPropertyType(initialPropertyType || null)
        // Clear selectedAddress on error
        setSelectedAddress(null)
      } finally {
        setLoadingProperty(false)
      }
    }

    fetchPropertyData()
  }, [propertyId, initialPropertyType])

  // Fetch dropdown options when propertyData is available (for displaying badges)
  useEffect(() => {
    if (propertyData && !optionsLoading && roofTypes.length === 0) {
      fetchDropdownOptions()
    }
  }, [propertyData, optionsLoading, roofTypes.length, fetchDropdownOptions])

  // Reset search when modal opens/closes
  useEffect(() => {
    if (isModalOpen) {
      setError(null)
      setSaveError(null)
      // Set pending selection to current selected address when opening (only for search page)
      if (page === 'search') {
        setPendingSelection(selectedAddress)
      }
    } else {
      setSearchQuery('')
      setError(null)
      setSaveError(null)
      setPendingSelection(null)
      setPage('search')
    }
  }, [isModalOpen, selectedAddress, page])

  // Handle selection of a place (just sets pending selection, doesn't apply)
  const handleSelectAddress = async (item) => {
    // Set pending selection immediately using item data to avoid flash
    const immediateSelection = {
      id: item.placeId || item.id,
      place_id: item.placeId || item.id,
      formatted_address: item.description || item.company || '',
      street_address: item.name || '',
      city: '',
      state: '',
      zip_code: '',
      country: 'USA',
    }
    setPendingSelection(immediateSelection)
    
    // Fetch full details in the background without blocking UI
    if (!placesServiceRef.current) {
      console.error('PlacesService not initialized')
      return
    }

    try {
      placesServiceRef.current.getDetails(
        {
          placeId: item.placeId || item.id,
          fields: ['formatted_address', 'address_components', 'geometry']
        },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            const addressComponents = parseAddressComponents(place.address_components)
            
            // Build street address from components
            const streetAddress = [addressComponents.street_number, addressComponents.route]
              .filter(Boolean)
              .join(' ')
            
            // Create address object with full details
            const addressData = {
              id: item.placeId || item.id,
              place_id: item.placeId || item.id,
              formatted_address: place.formatted_address,
              street_address: streetAddress || place.formatted_address,
              city: addressComponents.city,
              state: addressComponents.state,
              zip_code: addressComponents.zip_code,
              country: addressComponents.country || 'USA',
            }
            
            // Update pending selection with full details
            setPendingSelection(addressData)
          }
          // Silently fail - don't show error, just keep the immediate selection
        }
      )
    } catch (err) {
      console.error('Error fetching address details:', err)
      // Silently fail - keep the immediate selection
    }
  }

  // Handle confirm selection - apply the pending selection
  const handleConfirmSelection = () => {
    if (!pendingSelection) return
    
    setSelectedAddress(pendingSelection)
    setIsModalOpen(false)
    
    // Notify parent of the change
    if (onAddressChange) {
      onAddressChange(pendingSelection)
    }
    
    // Clear pending selection
    setPendingSelection(null)
  }

  // Handle cancel - clear selection and close modal
  const handleCancel = () => {
    setPendingSelection(null)
    setIsModalOpen(false)
  }

  const handleDeleteAddress = () => {
    setSelectedAddress(null)
    if (onAddressDelete) {
      onAddressDelete()
    }
  }

  // Address card component with Street View using JS API
  const AddressCard = () => {
    const streetViewRef = useRef(null)
    const panoramaRef = useRef(null)
    const mapRef = useRef(null)
    const [hasStreetView, setHasStreetView] = useState(true)
    
    // Helper function to get roof type name
    const getRoofTypeName = () => {
      if (propertyData?.roof_type?.name) {
        return propertyData.roof_type.name
      }
      // Fallback: look up from roofTypes array if we have roof_type_id
      if (propertyData?.roof_type_id && roofTypes.length > 0) {
        const roofType = roofTypes.find(rt => rt.value === propertyData.roof_type_id)
        return roofType?.label || null
      }
      return null
    }
    
    // Helper function to get roof access type name
    const getRoofAccessTypeName = () => {
      if (propertyData?.roof_acess_type?.name) {
        return propertyData.roof_acess_type.name
      }
      // Fallback: look up from roofAccessTypes array if we have roof_acess_type_id
      if (propertyData?.roof_acess_type_id && roofAccessTypes.length > 0) {
        const roofAccessType = roofAccessTypes.find(rat => rat.value === propertyData.roof_acess_type_id)
        return roofAccessType?.label || null
      }
      return null
    }
    
    // Helper function to get property access type name
    const getPropertyAccessTypeName = () => {
      if (propertyData?.property_access_type?.name) {
        return propertyData.property_access_type.name
      }
      // Fallback: look up from propertyAccessTypes array if we have property_access_type_id
      if (propertyData?.property_access_type_id && propertyAccessTypes.length > 0) {
        const propertyAccessType = propertyAccessTypes.find(pat => pat.value === propertyData.property_access_type_id)
        return propertyAccessType?.label || null
      }
      return null
    }
    
    // Helper function to get parking condition name
    const getParkingConditionName = () => {
      if (propertyData?.property_parking_condition?.name) {
        return propertyData.property_parking_condition.name
      }
      // Fallback: look up from parkingConditions array if we have property_parking_condition_id
      if (propertyData?.property_parking_condition_id && parkingConditions.length > 0) {
        const parkingCondition = parkingConditions.find(pc => pc.value === propertyData.property_parking_condition_id)
        return parkingCondition?.label || null
      }
      return null
    }
    
    // Only show street address, not the full formatted address
    // Construct street address from components if needed
    let displayAddress = selectedAddress.street_address || ''
    if (!displayAddress && selectedAddress.formatted_address) {
      // If we only have formatted_address, try to extract just the street part
      // Split by comma and take the first part (street address)
      const parts = selectedAddress.formatted_address.split(',')
      displayAddress = parts[0]?.trim() || ''
    }
    if (!displayAddress) {
      displayAddress = 'Unknown Address'
    }
    
    const city = selectedAddress.city || ''
    const state = selectedAddress.state || ''
    const cityState = [city, state].filter(Boolean).join(', ')
    
    const roofTypeName = getRoofTypeName()
    const roofAccessTypeName = getRoofAccessTypeName()
    const propertyAccessTypeName = getPropertyAccessTypeName()
    const parkingConditionName = getParkingConditionName()
    
    // Initialize Street View panorama using JavaScript API with fallback to satellite map
    useEffect(() => {
      if (!streetViewRef.current || !window.google?.maps) return
      if (!propertyData?.latitude || !propertyData?.longitude) return
      
      const position = {
        lat: propertyData.latitude,
        lng: propertyData.longitude
      }
      
      // First check if Street View is available at this location
      const streetViewService = new window.google.maps.StreetViewService()
      
      streetViewService.getPanorama({ location: position, radius: 50 }, (data, status) => {
        if (status === window.google.maps.StreetViewStatus.OK) {
          // Street View available - create panorama
          setHasStreetView(true)
          panoramaRef.current = new window.google.maps.StreetViewPanorama(
            streetViewRef.current,
            {
              position: position,
              pov: { heading: 0, pitch: 0 },
              zoom: 1,
              // Disable all controls for clean look
              disableDefaultUI: true,
              showRoadLabels: false,
              addressControl: false,
              fullscreenControl: false,
              motionTracking: false,
              motionTrackingControl: false,
              panControl: false,
              zoomControl: false,
              linksControl: false,
              enableCloseButton: false,
              clickToGo: false,
              scrollwheel: false,
              disableDoubleClickZoom: true,
            }
          )
        } else {
          // No Street View - fall back to satellite map
          setHasStreetView(false)
          mapRef.current = new window.google.maps.Map(streetViewRef.current, {
            center: position,
            zoom: 19,
            mapTypeId: 'satellite',
            disableDefaultUI: true,
            gestureHandling: 'none',
            keyboardShortcuts: false,
          })
          
          // Add a marker at the property location
          new window.google.maps.Marker({
            position: position,
            map: mapRef.current,
          })
        }
      })
      
      return () => {
        if (panoramaRef.current) {
          panoramaRef.current = null
        }
        if (mapRef.current) {
          mapRef.current = null
        }
      }
    }, [propertyData?.latitude, propertyData?.longitude])
    
    return (
      <div 
        className="address-card"
        style={{ 
          display: 'flex',
          width: '100%',
          minWidth: '100%',
          height: 'fit-content',
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid #D8D8D8',
          backgroundColor: '#FFFFFF',
        }}
      >
        {/* Left side - Map/Street View */}
        <div
          ref={streetViewRef}
          style={{
            width: '6.5rem',
            backgroundColor: '#e5e5e5',
            flexShrink: 0,
            alignSelf: 'stretch',
          }}
        />
        
        {/* Right side - Info */}
        <div
          style={{
            flex: 1,
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignSelf: 'stretch',
            gap: '12px',
          }}
        >
          {/* Top section - Address and Badges side by side */}
          <div className="flex items-start justify-between" style={{ gap: '12px' }}>
            {/* Address info */}
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
            <div 
              className="flex flex-wrap items-start justify-end"
              style={{
                gap: '4px',
                maxWidth: '55%',
                flexShrink: 0,
              }}
            >
              {/* Property type */}
              {propertyType && (
                <Badge variant="grey">
                  {propertyType.charAt(0).toUpperCase() + propertyType.slice(1).toLowerCase()}
                </Badge>
              )}
              
              {/* Roof type */}
              {roofTypeName && (
                <Badge variant="grey">
                  {roofTypeName}
                </Badge>
              )}
              
              {/* Number of stories */}
              {propertyData?.number_of_stories && (
                <Badge variant="grey">
                  {propertyData.number_of_stories}-story
                </Badge>
              )}
              
              {/* Roof access type */}
              {roofAccessTypeName && (
                <Badge variant="grey">
                  {roofAccessTypeName}
                </Badge>
              )}
              
              {/* Property access type - only show if not "straightforward access" */}
              {propertyAccessTypeName && 
               propertyAccessTypeName.toLowerCase() !== 'straightforward access' && (
                <Badge variant="grey">
                  {propertyAccessTypeName}
                </Badge>
              )}
              
              {/* Parking conditions - only show if not "Plenty" */}
              {parkingConditionName && 
               parkingConditionName.toLowerCase() !== 'plenty' && (
                <Badge variant="grey">
                  {parkingConditionName}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Bottom row - Notes and Actions */}
          <div className="flex items-end justify-between" style={{ marginTop: '12px', gap: '12px' }}>
            {/* Notes section - aligned to the left */}
            {(propertyData?.notes || propertyData?.accessibility_note_details) && (
              <div className="flex flex-col" style={{ flex: 1, gap: '4px' }}>
                {propertyData.notes && (
                  <span 
                    className="font-inter"
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      letterSpacing: '-0.01em',
                      color: 'rgb(75, 75, 75)',
                      lineHeight: '1.4',
                    }}
                  >
                    {(propertyData.notes && propertyData.accessibility_note_details) && (
                      <span style={{ fontWeight: 500 }}>Notes:</span>
                    )}
                    {(propertyData.notes && propertyData.accessibility_note_details) && ' '}
                    <span style={{ fontWeight: 500, color: 'rgb(130, 130, 130)' }}>
                      {propertyData.notes.length > 30 ? propertyData.notes.substring(0, 30) + '...' : propertyData.notes}
                    </span>
                  </span>
                )}
                {propertyData.accessibility_note_details && (
                  <span 
                    className="font-inter"
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      letterSpacing: '-0.01em',
                      color: 'rgb(75, 75, 75)',
                      lineHeight: '1.4',
                    }}
                  >
                    {(propertyData.notes && propertyData.accessibility_note_details) && (
                      <span style={{ fontWeight: 500 }}>Access:</span>
                    )}
                    {(propertyData.notes && propertyData.accessibility_note_details) && ' '}
                    <span style={{ fontWeight: 500, color: 'rgb(130, 130, 130)' }}>
                      {propertyData.accessibility_note_details.length > 30 ? propertyData.accessibility_note_details.substring(0, 30) + '...' : propertyData.accessibility_note_details}
                    </span>
                  </span>
                )}
              </div>
            )}
            
            {/* Action buttons - aligned to the right */}
            <div className="flex items-center" style={{ gap: '4px', flexShrink: 0 }}>
              <IconButton
                onClick={() => {
                  setPage('search')
                  setIsModalOpen(true)
                }}
                title="Replace address"
                style={{ padding: '4px' }}
              >
                <Repeat size={14} style={{ color: '#202020' }} />
              </IconButton>
              <IconButton
                onClick={handleEditProperty}
                title="Edit property"
                style={{ padding: '4px' }}
              >
                <Pencil size={14} style={{ color: '#202020' }} />
              </IconButton>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Loading skeleton for property fetch - matches card layout
  const PropertySkeleton = () => (
    <div 
      className="address-card"
      style={{ 
        display: 'flex',
        width: '100%',
        minWidth: '100%',
        height: 'fit-content',
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1px solid #D8D8D8',
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* Left side - Map placeholder */}
      <div
        className="lead-skeleton-line"
        style={{
          width: '6.5rem',
          minHeight: '100px',
          flexShrink: 0,
          alignSelf: 'stretch',
          borderRadius: 0,
        }}
      />
      
      {/* Right side - Info skeleton */}
      <div
        style={{
          flex: 1,
          padding: '15px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignSelf: 'stretch',
          gap: '12px',
        }}
      >
        {/* Top section - Address and Badges */}
        <div className="flex items-start justify-between" style={{ gap: '12px' }}>
          {/* Address skeleton */}
          <div className="flex flex-col" style={{ gap: '6px', flex: 1 }}>
            <div className="lead-skeleton-line" style={{ width: '140px', height: '12px' }} />
            <div className="lead-skeleton-line" style={{ width: '100px', height: '11px' }} />
          </div>
          
          {/* Badges skeleton */}
          <div className="flex items-center" style={{ gap: '4px', flexShrink: 0 }}>
            <div className="lead-skeleton-line" style={{ width: '60px', height: '20px', borderRadius: '10px' }} />
            <div className="lead-skeleton-line" style={{ width: '50px', height: '20px', borderRadius: '10px' }} />
          </div>
        </div>
        
        {/* Bottom row - Notes and Actions */}
        <div className="flex items-end justify-between" style={{ marginTop: '12px', gap: '12px' }}>
          <div className="lead-skeleton-line" style={{ width: '120px', height: '12px' }} />
          <div className="flex items-center" style={{ gap: '4px' }}>
            <div className="lead-skeleton-line" style={{ width: '22px', height: '22px', borderRadius: '6px' }} />
            <div className="lead-skeleton-line" style={{ width: '22px', height: '22px', borderRadius: '6px' }} />
          </div>
        </div>
      </div>
    </div>
  )

  // Determine if we're still loading (property data OR dropdown options for badges)
  const isLoading = loadingProperty || (propertyId && propertyData && optionsLoading) || (propertyId && propertyData && roofTypes.length === 0 && !optionsLoading)

  // Notify parent of loading state changes
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isLoading)
    }
  }, [isLoading, onLoadingChange])

  return (
    <>
      {(isLoading && propertyId && !onLoadingChange) ? (
        <PropertySkeleton />
      ) : selectedAddress ? (
        <AddressCard />
      ) : (
        <Button variant="white" className="px-[25px]" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          Add property
        </Button>
      )}

      {isModalOpen && (
        <Modal
          title={page === 'edit' ? 'Edit Property' : 'Select Address'}
          onClose={() => {
            setIsModalOpen(false)
            setPage('search')
          }}
        >
          <Modal.Pages>
            {page === 'search' && (
              <div className="modal-page-static flex flex-col" style={{ flex: 1, minHeight: 0 }}>
                <div className="flex flex-col" style={{ gap: '20px', flex: 1, minHeight: 0 }}>
                  <h2 className="font-sans text-lg tracking-[-0.01em] font-medium text-black" style={{ flexShrink: 0 }}>
                    Select address
                  </h2>
                  <div style={{ flex: 1, minHeight: 0 }}>
                    <SearchPanel 
                      items={addresses}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      onSelect={handleSelectAddress}
                      selectedId={pendingSelection?.id}
                      loading={loading}
                      error={error}
                      placeholder="Search by address"
                      emptyMessage="No addresses found"
                      loadingMessage="Searching addresses..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2" style={{ marginTop: 'auto', flexShrink: 0 }}>
                  <Modal.CancelButton
                    onClick={() => setPendingSelection(null)}
                  >
                    Cancel
                  </Modal.CancelButton>
                  <Button 
                    variant="dark" 
                    onClick={handleConfirmSelection}
                    disabled={!pendingSelection}
                  >
                    Select
                  </Button>
                </div>
              </div>
            )}

            {page === 'edit' && (
              <div className="modal-page flex flex-col" style={{ flex: 1, minHeight: 0 }}>
                <div className="flex flex-col" style={{ gap: '20px', flex: 1, minHeight: 0 }}>
                  <h2 className="font-sans text-lg tracking-[-0.01em] font-medium text-black" style={{ flexShrink: 0 }}>
                    Edit property
                  </h2>

                  <div className="flex flex-col" style={{ gap: '20px', flex: 1, minHeight: 0, overflowY: 'auto' }}>
                    {/* Number of Stories / Property Type */}
                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        label="Number of Stories"
                        options={[
                          { value: 1, label: '1' },
                          { value: 2, label: '2' },
                          { value: 3, label: '3' },
                          { value: 4, label: '4' },
                          { value: 5, label: '5' }
                        ]}
                        value={editForm.number_of_stories}
                        onChange={(value) => setEditForm(prev => ({ ...prev, number_of_stories: Number(value) }))}
                        placeholder="Select number of stories"
                      />
                      <Select
                        label="Property Type"
                        options={propertyTypes}
                        value={editForm.property_type_id}
                        onChange={(value) => setEditForm(prev => ({ ...prev, property_type_id: value }))}
                        placeholder={optionsLoading ? 'Loading...' : 'Select property type'}
                      />
                    </div>

                    {/* Roof Type / Roof Access Type */}
                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        label="Roof Type"
                        options={roofTypes}
                        value={editForm.roof_type_id}
                        onChange={(value) => setEditForm(prev => ({ ...prev, roof_type_id: value }))}
                        placeholder={optionsLoading ? 'Loading...' : 'Select roof type'}
                      />
                      <Select
                        label="Roof Access Type"
                        options={roofAccessTypes}
                        value={editForm.roof_acess_type_id}
                        onChange={(value) => setEditForm(prev => ({ ...prev, roof_acess_type_id: value }))}
                        placeholder={optionsLoading ? 'Loading...' : 'Select roof access type'}
                      />
                    </div>

                    {/* Property Access Type / Parking Conditions */}
                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        label="Property Access Type"
                        options={propertyAccessTypes}
                        value={editForm.property_access_type_id}
                        onChange={(value) => setEditForm(prev => ({ ...prev, property_access_type_id: value }))}
                        placeholder={optionsLoading ? 'Loading...' : 'Select access type'}
                      />
                      <Select
                        label="Parking Conditions"
                        options={parkingConditions}
                        value={editForm.property_parking_condition_id}
                        onChange={(value) => setEditForm(prev => ({ ...prev, property_parking_condition_id: value }))}
                        placeholder={optionsLoading ? 'Loading...' : 'Select parking conditions'}
                      />
                    </div>

                    {/* Accessibility Details - only show if selected Property Access Type requires notes */}
                    {(() => {
                      const selectedPropertyAccessType = propertyAccessTypesData.find(
                        type => type.id === editForm.property_access_type_id
                      )
                      const shouldShowAccessibilityNotes = selectedPropertyAccessType?.note_required === true
                      
                      return shouldShowAccessibilityNotes ? (
                        <Input
                          label={<LabelText helpText="This is the access info the inspector and crew will see when they arrive, so include anything they need to get onto the property without delays.">Accessibility Details</LabelText>}
                          type="textarea"
                          placeholder="Gate codes, lockbox details, or who to call for access…"
                          value={editForm.accessibility_note_details}
                          onChange={handleEditFormChange('accessibility_note_details')}
                        />
                      ) : null
                    })()}

                    {/* Notes */}
                    <Input
                      label="Notes"
                      type="textarea"
                      placeholder="Additional info about this property (hazards, obstacles, recurring issues)."
                      value={editForm.notes}
                      onChange={handleEditFormChange('notes')}
                    />

                    {/* Error message */}
                    {saveError && (
                      <div 
                        className="font-inter text-sm"
                        style={{ color: '#DC2626' }}
                      >
                        {saveError}
                      </div>
                    )}
                  </div>
                </div>

                {/* Update Button */}
                <div className="flex justify-end gap-2" style={{ marginTop: 'auto', flexShrink: 0 }}>
                  <Button 
                    variant="dark" 
                    onClick={handleSaveProperty} 
                    disabled={saving}
                  >
                    {saving ? 'Updating...' : 'Update property'}
                  </Button>
                </div>
              </div>
            )}
          </Modal.Pages>
        </Modal>
      )}
    </>
  )
}

export default AddressSelect
