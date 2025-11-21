/**
 * Utility to dynamically load Google Maps Places API script
 * This ensures the script is only loaded once and provides a promise-based API
 */

let isScriptLoading = false
let isScriptLoaded = false
let loadPromise = null

export const loadGoogleMapsScript = (apiKey) => {
  // If already loaded, return resolved promise
  if (isScriptLoaded && window.google && window.google.maps && window.google.maps.places) {
    return Promise.resolve()
  }

  // If currently loading, return the existing promise
  if (isScriptLoading && loadPromise) {
    return loadPromise
  }

  // Start loading
  isScriptLoading = true
  loadPromise = new Promise((resolve, reject) => {
    // Check if script already exists in DOM
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      // Script exists, wait for it to load
      if (window.google && window.google.maps && window.google.maps.places) {
        isScriptLoaded = true
        isScriptLoading = false
        resolve()
        return
      }
      // Wait for load event
      existingScript.addEventListener('load', () => {
        isScriptLoaded = true
        isScriptLoading = false
        resolve()
      })
      existingScript.addEventListener('error', () => {
        isScriptLoading = false
        reject(new Error('Failed to load Google Maps script'))
      })
      return
    }

    // Create and inject script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    
    script.onload = () => {
      isScriptLoaded = true
      isScriptLoading = false
      resolve()
    }
    
    script.onerror = () => {
      isScriptLoading = false
      reject(new Error('Failed to load Google Maps script'))
    }
    
    document.head.appendChild(script)
  })

  return loadPromise
}

