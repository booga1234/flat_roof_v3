import { useState, useEffect, useRef } from 'react'
import Input from './Input'
import { loadGoogleMapsScript } from '../utils/loadGoogleMaps'
import { GOOGLE_PLACES_API_KEY } from '../config/api'

function AddressInput({ value, onChange, ...props }) {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [hasSearched, setHasSearched] = useState(false)
  const [internalValue, setInternalValue] = useState(value || '')
  const inputRef = useRef(null)
  const autocompleteServiceRef = useRef(null)
  const placesServiceRef = useRef(null)
  const suggestionsRef = useRef(null)
  const debounceTimerRef = useRef(null)
  
  // Sync internal value with prop value when it changes externally (but not during typing)
  useEffect(() => {
    if (value !== undefined && value !== internalValue && !inputRef.current?.matches(':focus')) {
      setInternalValue(value)
    }
  }, [value])

  // Initialize Google Maps Places API
  useEffect(() => {
    // Check environment variable directly
    const envKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY
    const configKey = GOOGLE_PLACES_API_KEY
    
    console.log('🔑 API Key Check:')
    console.log('  import.meta.env.VITE_GOOGLE_PLACES_API_KEY:', envKey ? `Present (${envKey.substring(0, 10)}...)` : '❌ MISSING')
    console.log('  GOOGLE_PLACES_API_KEY from config:', configKey ? `Present (${configKey.substring(0, 10)}...)` : '❌ MISSING')
    console.log('  Keys match:', envKey === configKey)
    console.log('  All env vars:', Object.keys(import.meta.env).filter(k => k.includes('GOOGLE')))
    
    const apiKeyStatus = GOOGLE_PLACES_API_KEY 
      ? `Present (${GOOGLE_PLACES_API_KEY.substring(0, 10)}...)` 
      : '❌ MISSING'
    console.log('📍 AddressInput: Initializing with API key:', apiKeyStatus)
    
    if (!GOOGLE_PLACES_API_KEY) {
      console.error('❌ Google Places API key is not configured.')
      console.error('📝 To fix this:')
      console.error('   1. Create a .env file in the project root')
      console.error('   2. Add: VITE_GOOGLE_PLACES_API_KEY=your_api_key_here')
      console.error('   3. ⚠️ IMPORTANT: Restart the dev server (stop and run npm run dev again)')
      console.error('   4. Get your API key from: https://console.cloud.google.com/google/maps-apis')
      console.error('   5. Make sure the .env file is in the root directory (same folder as package.json)')
      return
    }

    loadGoogleMapsScript(GOOGLE_PLACES_API_KEY)
      .then(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          console.log('✅ Google Maps Places API loaded successfully')
          try {
            autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService()
            placesServiceRef.current = new window.google.maps.places.PlacesService(
              document.createElement('div')
            )
            console.log('✅ AutocompleteService initialized')
          } catch (error) {
            console.error('❌ Failed to create AutocompleteService:', error)
          }
        } else {
          console.error('❌ Google Maps loaded but Places API is not available')
          console.error('   Make sure the script includes &libraries=places')
        }
      })
      .catch((error) => {
        console.error('❌ Failed to load Google Maps:', error)
        console.error('📋 Troubleshooting checklist:')
        console.error('   1. Places API is enabled in Google Cloud Console')
        console.error('   2. Billing is enabled for your Google Cloud project')
        console.error('   3. API key has Places API access')
        console.error('   4. API key restrictions allow your domain/localhost')
      })

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  // Handle input change and fetch suggestions
  const handleInputChange = (e) => {
    // Handle both event objects and direct values
    const inputValue = e?.target?.value ?? e?.currentTarget?.value ?? (typeof e === 'string' ? e : '')
    
    console.log('⌨️ Input changed:', inputValue, 'Length:', inputValue?.length || 0)
    
    // Update internal value immediately for responsive UI
    setInternalValue(inputValue)
    
    const syntheticEvent = {
      target: { value: inputValue },
      currentTarget: { value: inputValue }
    }
    
    // Update the parent component
    if (onChange) {
      onChange(syntheticEvent)
    }

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // If input is empty, clear suggestions
    if (!inputValue || inputValue.trim().length === 0) {
      setSuggestions([])
      setShowSuggestions(false)
      setHasSearched(false)
      return
    }

    // Debounce the autocomplete request
    debounceTimerRef.current = setTimeout(() => {
      // Check if Google Maps is loaded
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.warn('Google Maps Places API not loaded yet')
        return
      }

      if (!autocompleteServiceRef.current) {
        console.warn('AutocompleteService not initialized yet')
        // Try to initialize it now
        try {
          autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService()
          placesServiceRef.current = new window.google.maps.places.PlacesService(
            document.createElement('div')
          )
        } catch (error) {
          console.error('Failed to initialize AutocompleteService:', error)
          return
        }
      }
      
      if (inputValue.trim().length >= 3) {
        console.log('🔍 Fetching predictions for:', inputValue)
        autocompleteServiceRef.current.getPlacePredictions(
          {
            input: inputValue,
            types: ['address'], // Restrict to addresses only
            componentRestrictions: { country: 'us' } // Optional: restrict to US addresses
          },
          (predictions, status) => {
            console.log('📍 Autocomplete response:', { 
              status, 
              predictionsCount: predictions?.length || 0,
              statusName: window.google?.maps?.places?.PlacesServiceStatus?.[status] || status
            })
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              console.log('✅ Found', predictions.length, 'suggestions')
              // Log first prediction to see what data we get
              if (predictions.length > 0) {
                console.log('📋 First prediction sample:', {
                  description: predictions[0].description,
                  main_text: predictions[0].structured_formatting.main_text,
                  secondary_text: predictions[0].structured_formatting.secondary_text,
                  place_id: predictions[0].place_id
                })
              }
              setSuggestions(predictions)
              setShowSuggestions(true)
              setSelectedIndex(-1)
              setHasSearched(true)
            } else {
              console.warn('⚠️ Autocomplete status:', status, 'Predictions:', predictions)
              if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                console.log('ℹ️ No results found for:', inputValue)
                setSuggestions([])
                setShowSuggestions(true)
                setHasSearched(true)
              } else if (status === window.google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
                console.error('❌ Request denied - check API key and billing')
                setSuggestions([])
                setShowSuggestions(false)
                setHasSearched(false)
              } else if (status === window.google.maps.places.PlacesServiceStatus.INVALID_REQUEST) {
                console.error('❌ Invalid request - check input parameters')
                setSuggestions([])
                setShowSuggestions(false)
                setHasSearched(false)
              } else {
                setSuggestions([])
                setShowSuggestions(false)
                setHasSearched(false)
              }
            }
          }
        )
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300) // 300ms debounce
  }

  // Helper function to extract zip code and ensure it's displayed
  const getSecondaryText = (suggestion) => {
    // Extract zip code pattern (5 digits, optionally followed by -4 digits)
    const zipCodePattern = /\b\d{5}(-\d{4})?\b/
    
    // Get the base secondary text (city, state, country)
    let secondaryText = suggestion.structured_formatting.secondary_text || ''
    
    // Extract location info from description (everything after the street address)
    let locationInfo = ''
    if (suggestion.description) {
      const mainText = suggestion.structured_formatting.main_text
      // Remove the main_text from description to get location info (city, state, zip, country)
      // This ensures we only look for zip codes in the location portion, not the street address
      locationInfo = suggestion.description.replace(mainText, '').trim()
      // Clean up common separators
      locationInfo = locationInfo.replace(/^,\s*/, '').trim()
    }
    
    // Debug logging
    console.log('📍 getSecondaryText:', {
      description: suggestion.description,
      mainText: suggestion.structured_formatting.main_text,
      secondaryText: suggestion.structured_formatting.secondary_text,
      locationInfo
    })
    
    // Extract zip code from locationInfo (the part after the street address)
    let zipCode = null
    if (locationInfo) {
      // Pattern: state code (2 letters) followed by zip code (5 digits)
      // This ensures we get the actual zip code, not street numbers
      const stateZipPattern = /\b([A-Z]{2})\s+(\d{5}(-\d{4})?)\b/
      const stateZipMatch = locationInfo.match(stateZipPattern)
      if (stateZipMatch) {
        zipCode = stateZipMatch[2] // The zip code part
        console.log('✅ Found zip code after state:', zipCode)
      } else {
        // Fallback: look for zip code in location info that comes after a comma
        // This handles formats like "City, State ZIP" or "City, State ZIP, Country"
        const zipMatch = locationInfo.match(zipCodePattern)
        if (zipMatch) {
          // Make sure zip is not at the very start (could be street number)
          // and that it appears after at least one comma (indicating it's in location portion)
          if (zipMatch.index > 0 && locationInfo.substring(0, zipMatch.index).includes(',')) {
            zipCode = zipMatch[0]
            console.log('✅ Found zip code in location info:', zipCode)
          }
        }
      }
    }
    
    // If we don't have secondary_text, use locationInfo from description
    if (!secondaryText && locationInfo) {
      secondaryText = locationInfo
      // If locationInfo already has zip, we're done
      if (zipCodePattern.test(secondaryText)) {
        console.log('✅ Using locationInfo with zip:', secondaryText)
        return secondaryText
      }
    }
    
    // If we have secondary_text but it doesn't contain the zip code, add it after the state
    if (zipCode && secondaryText && !zipCodePattern.test(secondaryText)) {
      // Find state abbreviation pattern: ", WA" or ", WA," or ", WA, USA"
      // We want to insert zip between state and what comes after
      const statePattern = /,\s*([A-Z]{2})\s*,/
      const stateMatch = secondaryText.match(statePattern)
      
      if (stateMatch) {
        // Format like "City, State, Country" -> "City, State ZIP, Country"
        const stateCode = stateMatch[1]
        secondaryText = secondaryText.replace(
          statePattern,
          `, ${stateCode} ${zipCode},`
        )
        console.log('✅ Added zip to secondary_text:', secondaryText)
      } else {
        // Try pattern without trailing comma: ", WA " or ", WA" at end
        const statePattern2 = /,\s*([A-Z]{2})(\s|$)/
        const stateMatch2 = secondaryText.match(statePattern2)
        if (stateMatch2) {
          const stateCode = stateMatch2[1]
          secondaryText = secondaryText.replace(
            statePattern2,
            `, ${stateCode} ${zipCode}$2`
          )
          console.log('✅ Added zip to secondary_text (no comma):', secondaryText)
        } else {
          // Fallback: append zip at the end
          secondaryText = `${secondaryText} ${zipCode}`
          console.log('✅ Appended zip to secondary_text:', secondaryText)
        }
      }
    } else if (!zipCode) {
      console.log('⚠️ No zip code found in locationInfo')
    } else if (zipCodePattern.test(secondaryText)) {
      console.log('ℹ️ Zip code already in secondary_text')
    }
    
    return secondaryText
  }

  // Helper function to extract address components from Google Places
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

  // Handle selection of a suggestion
  const handleSelectSuggestion = (placeId, description) => {
    if (placesServiceRef.current) {
      placesServiceRef.current.getDetails(
        {
          placeId: placeId,
          fields: ['formatted_address', 'address_components', 'geometry']
        },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            // Use formatted_address as the value
            const formattedAddress = place.formatted_address
            const addressComponents = parseAddressComponents(place.address_components)
            
            // Build street address from components
            const streetAddress = [addressComponents.street_number, addressComponents.route]
              .filter(Boolean)
              .join(' ')
            
            const syntheticEvent = {
              target: { value: formattedAddress },
              currentTarget: { value: formattedAddress },
              isSelection: true, // Flag to indicate this is a dropdown selection
              placeData: {
                formatted_address: formattedAddress,
                street_address: streetAddress || formattedAddress,
                city: addressComponents.city,
                state: addressComponents.state,
                zip_code: addressComponents.zip_code,
                country: addressComponents.country || 'USA'
              }
            }
            
            if (onChange) {
              onChange(syntheticEvent)
            }
            
            setSuggestions([])
            setShowSuggestions(false)
            setSelectedIndex(-1)
            setHasSearched(false)
          }
        }
      )
    } else {
      // Fallback: just use the description
      const syntheticEvent = {
        target: { value: description },
        currentTarget: { value: description },
        isSelection: true // Flag to indicate this is a dropdown selection
      }
      if (onChange) {
        onChange(syntheticEvent)
      }
      setSuggestions([])
      setShowSuggestions(false)
      setSelectedIndex(-1)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (props.onKeyDown) {
        props.onKeyDown(e)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(
            suggestions[selectedIndex].place_id,
            suggestions[selectedIndex].description
          )
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
      default:
        if (props.onKeyDown) {
          props.onKeyDown(e)
        }
    }
  }

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        console.log('🖱️ Click outside detected, closing suggestions')
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    if (showSuggestions) {
      // Use a slight delay to ensure the click event on suggestions is processed first
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 0)
      
      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showSuggestions])

  // Debug: Log when component renders
  useEffect(() => {
    console.log('🔧 AddressInput rendered:', {
      hasValue: !!value,
      valueLength: value?.length || 0,
      suggestionsCount: suggestions.length,
      showSuggestions,
      hasAutocompleteService: !!autocompleteServiceRef.current,
      hasGoogleMaps: !!(window.google && window.google.maps && window.google.maps.places)
    })
  }, [value, suggestions.length, showSuggestions])

  return (
    <div ref={inputRef} style={{ position: 'relative', width: '100%', zIndex: 1 }}>
      <Input
        {...props}
        value={internalValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          console.log('👆 AddressInput focused, suggestions:', suggestions.length)
          if (suggestions.length > 0) {
            setShowSuggestions(true)
          }
          if (props.onFocus) {
            props.onFocus()
          }
        }}
      />
      
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            marginTop: '4px',
            backgroundColor: '#FFFFFF',
            border: '0.5px solid #E2E2E2',
            borderRadius: '8px',
            boxShadow: '0 2px 9.3px rgba(0, 0, 0, 0.06)',
            maxHeight: '240px',
            overflowY: 'auto',
            zIndex: 10000,
            padding: '5px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0px'
          }}
          onMouseDown={(e) => {
            // Prevent click outside from closing when clicking on suggestions
            e.preventDefault()
          }}
        >
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <div
                key={suggestion.place_id}
                onClick={() => handleSelectSuggestion(suggestion.place_id, suggestion.description)}
                onMouseEnter={() => setSelectedIndex(index)}
                style={{
                  padding: '6px 8px',
                  cursor: 'pointer',
                  backgroundColor: selectedIndex === index ? '#ECECEC' : '#FFFFFF',
                  borderRadius: '6px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  letterSpacing: '-0.01em',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px'
                }}
              >
                <div style={{ 
                  fontWeight: 500, 
                  color: '#313131'
                }}>
                  {suggestion.structured_formatting.main_text}
                </div>
                {getSecondaryText(suggestion) && (
                  <div style={{ 
                    fontWeight: 500, 
                    color: '#757575'
                  }}>
                    {getSecondaryText(suggestion)}
                  </div>
                )}
              </div>
            ))
          ) : hasSearched ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px 0px',
                gap: '10px'
              }}
            >
              <div style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                color: '#757575'
              }}>
                No results found.
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default AddressInput

