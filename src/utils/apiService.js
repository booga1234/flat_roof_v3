import { API_BASE_URL, API_V2_BASE_URL, API_CONTACTS_BASE_URL } from '../config/api'

/**
 * API Service Utility for Xano Workspace #5 (FR LLC)
 * Provides CRUD operations for all tables
 */

// Get authentication token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken')
}

// Get default headers for API requests
const getHeaders = () => {
  const token = getAuthToken()
  const headers = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

// Generic API request handler
const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_V2_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  
  const options = {
    method,
    headers: getHeaders(),
  }

  if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT' || method === 'DELETE')) {
    options.body = JSON.stringify(body)
  }

  try {
    console.log(`[API] ${method} ${url}`, body ? { body } : '')
    const response = await fetch(url, options)
    
    // Read the response body once
    let data
    let responseText = null
    
    try {
      // Try to get text first so we can parse it as JSON or use as text
      responseText = await response.text()
      if (responseText) {
        try {
          data = JSON.parse(responseText)
        } catch (parseError) {
          // If JSON parsing fails, use the text as the data
          data = { message: responseText, raw: responseText }
        }
      } else {
        data = {}
      }
    } catch (readError) {
      console.error('[API] Error reading response:', readError)
      data = { message: 'Failed to read response', raw: '' }
    }

    if (!response.ok) {
      console.error('[API] Error response:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
        responseText: responseText,
        fullData: JSON.stringify(data, null, 2),
        url: url,
        method: method,
        body: body ? JSON.stringify(body, null, 2) : null
      })
      
      // Extract error message from various possible formats
      const errorMessage = data?.message || 
                          data?.error || 
                          data?.raw || 
                          (typeof data === 'string' ? data : null) ||
                          responseText ||
                          `API request failed: ${response.status} ${response.statusText}`
      
      throw new Error(errorMessage)
    }

    console.log('[API] Success response:', data)
    return data
  } catch (error) {
    console.error('[API] Request error:', {
      endpoint,
      method,
      url,
      error: error.message,
      stack: error.stack
    })
    throw error
  }
}

// ============================================
// MATERIALS API
// ============================================

export const materialsAPI = {
  // Get all materials
  getAll: () => apiRequest('/materials-library', 'GET'),

  // Get single material by ID
  getById: (id) => apiRequest(`/materials/${id}`, 'GET'),

  // Create new material
  create: (materialData) => {
    // Transform form data to match API schema
    const payload = {
      name: materialData.name,
      product_number: materialData.productNumber || null,
      category_id: materialData.categoryId || materialData.category,
      manufacturer_id: materialData.manufacturerId || materialData.manufacturer,
      subcategory_id: materialData.subcategoryId || null,
      unit_type: materialData.units || null,
      unit_size: materialData.unitSize || null,
      description: materialData.description || null,
      warranty_level: materialData.warrantyYears ? `${materialData.warrantyYears}yr` : null,
      requires_ground_shipping: materialData.groundShipping === 'required',
      requires_quote: materialData.quote === 'required',
      active: materialData.active === 'active',
    }
    return apiRequest('/materials', 'POST', payload)
  },

  // Update existing material
  update: async (id, materialData) => {
    // Build the data object, only including fields that have values
    const dataFields = {}
    
    if (materialData.name !== undefined) dataFields.name = materialData.name
    if (materialData.productNumber !== undefined) dataFields.product_number = materialData.productNumber || null
    if (materialData.categoryId !== undefined || materialData.category !== undefined) {
      dataFields.category_id = materialData.categoryId || materialData.category
    }
    if (materialData.manufacturerId !== undefined || materialData.manufacturer !== undefined) {
      dataFields.manufacturer_id = materialData.manufacturerId || materialData.manufacturer
    }
    if (materialData.subcategoryId !== undefined) dataFields.subcategory_id = materialData.subcategoryId || null
    if (materialData.units !== undefined) dataFields.unit_type = materialData.units || null
    if (materialData.unitSize !== undefined) dataFields.unit_size = materialData.unitSize || null
    if (materialData.description !== undefined) dataFields.description = materialData.description || null
    if (materialData.warrantyYears !== undefined) {
      dataFields.warranty_level = materialData.warrantyYears ? `${materialData.warrantyYears}yr` : null
    }
    if (materialData.groundShipping !== undefined) {
      dataFields.requires_ground_shipping = materialData.groundShipping === 'required'
    }
    if (materialData.quote !== undefined) {
      dataFields.requires_quote = materialData.quote === 'required'
    }
    if (materialData.active !== undefined) {
      dataFields.active = materialData.active === 'active'
    }
    
    const payload = {
      id,
      data: dataFields
    }
    
    // Try the most common endpoint first (singular, like job-patch)
    try {
      return await apiRequest('/material-patch', 'PATCH', payload)
    } catch (error) {
      // If that fails, try plural version
      console.warn('[Materials API] /material-patch failed, trying /materials-patch')
      try {
        return await apiRequest('/materials-patch', 'PATCH', payload)
      } catch (error2) {
        // If both fail, throw the original error with helpful message
        throw new Error(`Failed to update material. Tried /material-patch and /materials-patch. Original error: ${error.message}. Please check your Xano API endpoint name.`)
      }
    }
  },

  // Delete material
  delete: (id) => apiRequest(`/materials/${id}`, 'DELETE'),
}

// ============================================
// MATERIAL PRICING API
// ============================================

export const materialPricingAPI = {
  // Get pricing for a material
  getByMaterialId: (materialId) => apiRequest(`/material-pricing?material_id=${materialId}`, 'GET'),

  // Create new pricing record
  create: (pricingData) => {
    const payload = {
      material_id: pricingData.materialId,
      vendor_id: pricingData.vendorId,
      unit_cost: pricingData.unitCost, // Should be in dollars (e.g., 150.00)
      effective_date: pricingData.effectiveDate || new Date().toISOString().split('T')[0],
      notes: pricingData.notes || null,
    }
    return apiRequest('/material-pricing', 'POST', payload)
  },

  // Update pricing record
  update: (id, pricingData) => {
    const payload = {
      id,
      data: {
        unit_cost: pricingData.unitCost,
        effective_date: pricingData.effectiveDate,
        notes: pricingData.notes || null,
      }
    }
    return apiRequest('/material-pricing-patch', 'PATCH', payload)
  },
}

// ============================================
// MANUFACTURERS API
// ============================================

export const manufacturersAPI = {
  // Get all manufacturers
  getAll: () => apiRequest('/manufacturers', 'GET'),

  // Get single manufacturer by ID
  getById: (id) => apiRequest(`/manufacturers/${id}`, 'GET'),

  // Create new manufacturer
  create: (manufacturerData) => {
    const payload = {
      name: manufacturerData.name,
      website: manufacturerData.website || null,
      phone: manufacturerData.phone || null,
      notes: manufacturerData.notes || null,
    }
    return apiRequest('/manufacturers', 'POST', payload)
  },

  // Update manufacturer
  update: (id, manufacturerData) => {
    const payload = {
      id,
      data: manufacturerData
    }
    return apiRequest('/manufacturer-patch', 'PATCH', payload)
  },
}

// ============================================
// VENDORS API
// ============================================

export const vendorsAPI = {
  // Get all vendors
  getAll: () => apiRequest('/vendors', 'GET'),

  // Get single vendor by ID
  getById: (id) => apiRequest(`/vendors/${id}`, 'GET'),

  // Create new vendor
  create: (vendorData) => {
    const payload = {
      name: vendorData.name,
      email: vendorData.email || null,
      phone: vendorData.phone || null,
      default_terms: vendorData.defaultTerms || null,
      notes: vendorData.notes || null,
    }
    return apiRequest('/vendors', 'POST', payload)
  },

  // Update vendor
  update: (id, vendorData) => {
    const payload = {
      id,
      data: vendorData
    }
    return apiRequest('/vendor-patch', 'PATCH', payload)
  },
}

// ============================================
// CATEGORIES API
// ============================================

export const categoriesAPI = {
  // Get all categories
  getAll: () => apiRequest('/material-categories', 'GET'),

  // Get single category by ID
  getById: (id) => apiRequest(`/material-categories/${id}`, 'GET'),

  // Create new category
  create: (categoryData) => {
    const payload = {
      name: categoryData.name,
      slug: categoryData.slug || null,
      sort_order: categoryData.sortOrder || null,
    }
    return apiRequest('/material-categories', 'POST', payload)
  },

  // Update category
  update: (id, categoryData) => {
    const payload = {
      id,
      data: categoryData
    }
    return apiRequest('/material-category-patch', 'PATCH', payload)
  },
}

// ============================================
// GENERIC TABLE API (for any table)
// ============================================

export const genericAPI = {
  // Generic create
  create: (tableName, data) => apiRequest(`/${tableName}`, 'POST', data),

  // Generic update
  update: (tableName, id, data) => {
    const payload = {
      id,
      data
    }
    return apiRequest(`/${tableName}-patch`, 'PATCH', payload)
  },

  // Generic get all
  getAll: (tableName) => apiRequest(`/${tableName}`, 'GET'),

  // Generic get by ID
  getById: (tableName, id) => apiRequest(`/${tableName}/${id}`, 'GET'),

  // Generic delete
  delete: (tableName, id) => apiRequest(`/${tableName}/${id}`, 'DELETE'),
}

// ============================================
// TRASH API
// ============================================

export const trashAPI = {
  // Get all trashed items (leads with is_deleted = true)
  getAll: () => {
    // Direct fetch to the trash endpoint
    const url = `${API_CONTACTS_BASE_URL}/trash`
    return fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`)
        }
        return response.json()
      })
  },

  // Permanently delete an item
  permanentDelete: (id) => {
    const url = `${API_CONTACTS_BASE_URL}/trash/${id}`
    return fetch(url, {
      method: 'DELETE',
      headers: getHeaders(),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`)
        }
        return response.json().catch(() => ({}))
      })
  },

  // Restore an item (set is_deleted to false)
  restore: (id) => {
    const url = `${API_CONTACTS_BASE_URL}/trash/${id}/restore`
    return fetch(url, {
      method: 'PATCH',
      headers: getHeaders(),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`)
        }
        return response.json().catch(() => ({}))
      })
  },
}

// ============================================
// LEADS API
// ============================================

// Helper function to make API requests with API_CONTACTS_BASE_URL
const contactsApiRequest = async (endpoint, method = 'GET', body = null) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_CONTACTS_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  
  const options = {
    method,
    headers: getHeaders(),
  }

  if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT' || method === 'DELETE')) {
    options.body = JSON.stringify(body)
  }

  try {
    console.log(`[Leads API] ${method} ${url}`, body ? { body } : '')
    const response = await fetch(url, options)
    
    let data
    let responseText = null
    
    try {
      responseText = await response.text()
      if (responseText) {
        try {
          data = JSON.parse(responseText)
        } catch (parseError) {
          data = { message: responseText, raw: responseText }
        }
      } else {
        data = {}
      }
    } catch (readError) {
      console.error('[Leads API] Error reading response:', readError)
      data = { message: 'Failed to read response', raw: '' }
    }

    if (!response.ok) {
      console.error('[Leads API] Error response:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
        responseText: responseText,
        url: url,
        method: method,
        body: body ? JSON.stringify(body, null, 2) : null
      })
      
      const errorMessage = data?.message || 
                          data?.error || 
                          data?.raw || 
                          (typeof data === 'string' ? data : null) ||
                          responseText ||
                          `API request failed: ${response.status} ${response.statusText}`
      
      throw new Error(errorMessage)
    }

    console.log('[Leads API] Success response:', data)
    return data
  } catch (error) {
    console.error('[Leads API] Request error:', {
      endpoint,
      method,
      url,
      error: error.message,
      stack: error.stack
    })
    throw error
  }
}

// Helper function to get current user ID from localStorage
const getCurrentUserId = () => {
  try {
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      return user?.id || null
    }
  } catch (error) {
    console.error('[Leads API] Error getting current user ID:', error)
  }
  return null
}

export const leadsAPI = {
  // Get all leads
  getAll: () => contactsApiRequest('/leads', 'GET'),

  // Get single lead by ID - GET /leads/{leads_id}
  getById: (id) => contactsApiRequest(`/leads/${id}`, 'GET'),

  // Create new lead
  create: (leadData = {}) => {
    // Build payload with only provided fields, or empty object for minimal lead
    const payload = {}
    
    if (leadData.name || leadData.Name) payload.Name = leadData.name || leadData.Name
    if (leadData.email) payload.email = leadData.email
    if (leadData.phone) payload.phone = leadData.phone
    if (leadData.propertyId || leadData.property_id) payload.property_id = leadData.propertyId || leadData.property_id
    if (leadData.address) payload.address = leadData.address
    if (leadData.status) payload.status = leadData.status
    if (leadData.leadSourceId || leadData.lead_source_id) payload.lead_source_id = leadData.leadSourceId || leadData.lead_source_id
    if (leadData.notes) payload.notes = leadData.notes
    if (leadData.internalNotes || leadData.internal_notes) payload.internal_notes = leadData.internalNotes || leadData.internal_notes
    if (leadData.assignedToId || leadData.assigned_to_id) payload.assigned_to_id = leadData.assignedToId || leadData.assigned_to_id
    
    // Use /leads endpoint
    return contactsApiRequest('/leads', 'POST', payload)
  },

  // Update lead - PATCH to /leads/{leads_id}
  update: (id, leadData) => {
    // Build payload with only the fields that are being updated
    const payload = {}
    
    if (leadData.priority !== undefined) payload.priority = leadData.priority
    if (leadData.status !== undefined) payload.status = leadData.status
    // For text fields, convert empty strings to null so the API accepts them as "clearing" the field
    if (leadData.problem_description !== undefined) payload.problem_description = leadData.problem_description === '' ? null : leadData.problem_description
    if (leadData.intake_notes !== undefined) payload.intake_notes = leadData.intake_notes === '' ? null : leadData.intake_notes
    if (leadData.contact_id !== undefined) payload.contact_id = leadData.contact_id
    if (leadData.property_id !== undefined) {
      payload.property_id = leadData.property_id
      console.log('[Leads API] Including property_id in update payload:', leadData.property_id, 'Type:', typeof leadData.property_id)
    } else {
      console.log('[Leads API] property_id is undefined, not including in payload')
    }
    if (leadData.lead_source_id !== undefined) payload.lead_source_id = leadData.lead_source_id
    if (leadData.lead_reason_id !== undefined) payload.lead_reason_id = leadData.lead_reason_id
    if (leadData.is_deleted !== undefined) payload.is_deleted = leadData.is_deleted
    
    // Always include updated_by_user_id with current user
    const currentUserId = getCurrentUserId()
    if (currentUserId) {
      payload.updated_by_user_id = currentUserId
    }
    
    console.log('[Leads API] Update payload:', JSON.stringify(payload, null, 2))
    return contactsApiRequest(`/leads/${id}`, 'PATCH', payload)
  },

  // Soft delete lead - sets is_deleted to true
  delete: (id) => {
    const currentUserId = getCurrentUserId()
    const payload = {
      is_deleted: true
    }
    if (currentUserId) {
      payload.updated_by_user_id = currentUserId
    }
    console.log('[Leads API] Soft delete payload:', JSON.stringify(payload, null, 2))
    return contactsApiRequest(`/leads/${id}`, 'PATCH', payload)
  },
}

// ============================================
// INSPECTIONS API
// ============================================

export const inspectionsAPI = {
  // Get all inspections with optional filters
  // Filters: status, inspection_type_id, inspector_id, date_range (all, today, 7_days, 30_days)
  getAll: (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.status && filters.status !== 'all') params.append('status', filters.status)
    if (filters.inspection_type_id) params.append('inspection_type_id', filters.inspection_type_id)
    if (filters.inspector_id) params.append('inspector_id', filters.inspector_id)
    if (filters.date_range && filters.date_range !== 'all') params.append('date_filter', filters.date_range)
    
    const queryString = params.toString()
    return contactsApiRequest(`/inspections${queryString ? `?${queryString}` : ''}`, 'GET')
  },

  // Get single inspection by ID
  getById: (id) => contactsApiRequest(`/inspections/${id}`, 'GET'),

  // Create new inspection
  create: (inspectionData) => {
    const payload = {
      lead_id: inspectionData.leadId || inspectionData.lead_id || null,
      job_id: inspectionData.jobId || inspectionData.job_id || null,
      inspection_type_id: inspectionData.inspectionTypeId || inspectionData.inspection_type_id,
      inspector_id: inspectionData.inspectorId || inspectionData.inspector_id || null,
      status: inspectionData.status || 'scheduled',
      scheduled_start_time: inspectionData.scheduledStartTime || inspectionData.scheduled_start_time || null,
      scheduled_end_time: inspectionData.scheduledEndTime || inspectionData.scheduled_end_time || null,
      property_id: inspectionData.propertyId || inspectionData.property_id || null,
      location_address: inspectionData.locationAddress || inspectionData.location_address || null,
      company_name: inspectionData.companyName || inspectionData.company_name || null,
      customer_name: inspectionData.customerName || inspectionData.customer_name || null,
      customer_phone: inspectionData.customerPhone || inspectionData.customer_phone || null,
      customer_email: inspectionData.customerEmail || inspectionData.customer_email || null,
      roof_accessible: inspectionData.roofAccessible || inspectionData.roof_accessible || null,
      reason_for_inspection: inspectionData.reasonForInspection || inspectionData.reason_for_inspection || null,
      person_present: inspectionData.personPresent || inspectionData.person_present || null,
      notes: inspectionData.notes || null,
      internal_notes: inspectionData.internalNotes || inspectionData.internal_notes || null,
      estimated_duration_minutes: inspectionData.estimatedDurationMinutes || inspectionData.estimated_duration_minutes || null,
      requires_follow_up: inspectionData.requiresFollowUp || inspectionData.requires_follow_up || false,
    }
    return contactsApiRequest('/inspections', 'POST', payload)
  },

  // Update inspection
  update: (id, inspectionData) => {
    const payload = {
      id,
      data: inspectionData
    }
    return contactsApiRequest(`/inspections/${id}`, 'PATCH', payload)
  },
}

// ============================================
// INSPECTION TYPES API
// ============================================

export const inspectionTypesAPI = {
  // Get all inspection types
  getAll: () => contactsApiRequest('/inspection_types', 'GET'),
}

// ============================================
// INSPECTION BOOKINGS API
// ============================================

export const inspectionBookingsAPI = {
  // Get all bookings
  getAll: () => apiRequest('/inspection-bookings', 'GET'),

  // Create new booking
  create: (bookingData) => {
    const payload = {
      inspection_id: bookingData.inspectionId || bookingData.inspection_id,
      time_slot_id: bookingData.timeSlotId || bookingData.time_slot_id || null,
      booking_status: bookingData.bookingStatus || bookingData.booking_status || 'confirmed',
      booked_by_id: bookingData.bookedById || bookingData.booked_by_id || null,
      rescheduled_from_booking_id: bookingData.rescheduledFromBookingId || bookingData.rescheduled_from_booking_id || null,
      notes: bookingData.notes || null,
    }
    return apiRequest('/inspection-booking-new', 'POST', payload)
  },
}

// ============================================
// INSPECTION RESULTS API
// ============================================

export const inspectionResultsAPI = {
  // Get results for an inspection
  getByInspectionId: (inspectionId) => apiRequest(`/inspection-results?inspection_id=${inspectionId}`, 'GET'),

  // Create new result
  create: (resultData) => {
    const payload = {
      inspection_id: resultData.inspectionId || resultData.inspection_id,
      overall_condition: resultData.overallCondition || resultData.overall_condition || null,
      decking_type: resultData.deckingType || resultData.decking_type || null,
      insulation_location: resultData.insulationLocation || resultData.insulation_location || null,
      best_options: resultData.bestOptions || resultData.best_options || null,
      offer_maintenance: resultData.offerMaintenance || resultData.offer_maintenance || false,
      findings: resultData.findings || null,
      recommendations: resultData.recommendations || null,
      additional_notes: resultData.additionalNotes || resultData.additional_notes || null,
      requires_repair: resultData.requiresRepair || resultData.requires_repair || false,
      requires_replacement: resultData.requiresReplacement || resultData.requires_replacement || false,
      estimated_repair_cost: resultData.estimatedRepairCost || resultData.estimated_repair_cost || null,
      weather_conditions: resultData.weatherConditions || resultData.weather_conditions || null,
      temperature_fahrenheit: resultData.temperatureFahrenheit || resultData.temperature_fahrenheit || null,
      damage_areas: resultData.damageAreas || resultData.damage_areas || null,
      next_steps: resultData.nextSteps || resultData.next_steps || null,
      completed_by_id: resultData.completedById || resultData.completed_by_id || null,
    }
    return apiRequest('/inspection-result-new', 'POST', payload)
  },

  // Update result
  update: (id, resultData) => {
    const payload = {
      id,
      data: resultData
    }
    return apiRequest('/inspection-result-patch', 'PATCH', payload)
  },
}

// ============================================
// MEDIA API
// ============================================

export const mediaAPI = {
  // Get all media (optionally filtered)
  getAll: (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.mediaType) params.append('media_type', filters.mediaType)
    if (filters.relatedTable) params.append('related_table', filters.relatedTable)
    if (filters.relatedId) params.append('related_id', filters.relatedId)
    
    const queryString = params.toString()
    return apiRequest(`/media${queryString ? `?${queryString}` : ''}`, 'GET')
  },

  // Create new media
  create: (mediaData) => {
    const payload = {
      file_url: mediaData.fileUrl || mediaData.file_url,
      media_type: mediaData.mediaType || mediaData.media_type,
      related_table: mediaData.relatedTable || mediaData.related_table,
      related_id: mediaData.relatedId || mediaData.related_id,
      caption: mediaData.caption || null,
      uploaded_by_id: mediaData.uploadedById || mediaData.uploaded_by_id || null,
    }
    return apiRequest('/media-new', 'POST', payload)
  },
}

// ============================================
// LEAD SOURCES API
// ============================================

export const leadSourcesAPI = {
  // Get all lead sources
  getAll: () => contactsApiRequest('/lead_sources', 'GET'),
}

// ============================================
// LEAD REASONS API
// ============================================

export const leadReasonsAPI = {
  // Get all lead reasons
  getAll: () => contactsApiRequest('/lead_reasons', 'GET'),
}

// ============================================
// CALL REASONS API
// ============================================

export const callReasonsAPI = {
  // Get all call reasons
  getAll: () => apiRequest('/call-reasons', 'GET'),
}

// ============================================
// PROPERTIES API
// ============================================

// Helper function to make API requests with API_CONTACTS_BASE_URL for properties
const propertiesApiRequest = async (endpoint, method = 'GET', body = null) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_CONTACTS_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  
  const options = {
    method,
    headers: getHeaders(),
  }

  if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT' || method === 'DELETE')) {
    options.body = JSON.stringify(body)
  }

  try {
    console.log(`[Properties API] ${method} ${url}`, body ? { body } : '')
    const response = await fetch(url, options)
    
    let data
    let responseText = null
    
    try {
      responseText = await response.text()
      if (responseText) {
        try {
          data = JSON.parse(responseText)
        } catch (parseError) {
          data = { message: responseText, raw: responseText }
        }
      } else {
        data = {}
      }
    } catch (readError) {
      console.error('[Properties API] Error reading response:', readError)
      data = { message: 'Failed to read response', raw: '' }
    }

    if (!response.ok) {
      console.error('[Properties API] Error response:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
        responseText: responseText,
        url: url,
        method: method,
        body: body ? JSON.stringify(body, null, 2) : null
      })
      
      const errorMessage = data?.message || 
                          data?.error || 
                          data?.raw || 
                          (typeof data === 'string' ? data : null) ||
                          responseText ||
                          `API request failed: ${response.status} ${response.statusText}`
      
      throw new Error(errorMessage)
    }

    console.log('[Properties API] Success response:', data)
    return data
  } catch (error) {
    console.error('[Properties API] Request error:', {
      endpoint,
      method,
      url,
      error: error.message,
      stack: error.stack
    })
    throw error
  }
}

export const propertiesAPI = {
  // Get all properties
  getAll: () => apiRequest('/properties', 'GET'),

  // Get property by ID using contacts API base URL
  getById: (id) => propertiesApiRequest(`/properties/${id}`, 'GET'),

  // Get property by ID - try multiple endpoint formats (legacy method for backwards compatibility)
  getByIdLegacy: async (id) => {
    try {
      // Try the standard endpoint first
      return await apiRequest(`/properties/${id}`, 'GET')
    } catch (error) {
      console.warn(`[Properties API] Failed to fetch property ${id} with /properties/${id}, trying alternative methods...`)
      
      // Try with query parameter format (like lead-view)
      try {
        return await apiRequest(`/property-view?id=${id}`, 'GET')
      } catch (error2) {
        console.warn(`[Properties API] Failed with /property-view?id=${id}, trying to fetch all and filter...`)
        
        // Fallback: fetch all properties and filter by ID
        try {
          const allProperties = await apiRequest('/properties', 'GET')
          const properties = Array.isArray(allProperties) ? allProperties : (allProperties?.properties || allProperties?.data || [])
          const property = properties.find(prop => prop.id === id)
          if (property) {
            return property
          }
          throw new Error(`Property with id ${id} not found`)
        } catch (error3) {
          console.error(`[Properties API] All methods failed for property ${id}:`, error3)
          throw error3
        }
      }
    }
  },

  // Get property by address (searches for existing property with matching address)
  // Note: Since property endpoints return 404, we'll return null and let the create function handle it
  getByAddress: async (address) => {
    try {
      // Try to search for properties with this address
      const allProperties = await apiRequest('/properties', 'GET')
      const properties = Array.isArray(allProperties) ? allProperties : (allProperties?.properties || allProperties?.data || [])
      const matchingProperty = properties.find(prop => {
        const propAddress = prop.full_address || prop.formatted_address || prop.address || prop.street_address || ''
        return propAddress.toLowerCase() === address?.toLowerCase()
      })
      return matchingProperty || null
    } catch (error) {
      // Property endpoints may not exist, so we'll just return null
      // The create function will handle creating a new property
      console.log('[Properties API] Cannot search by address (endpoints may not exist), will create new property:', error.message)
      return null
    }
  },

  // Find or create property using Google Place ID
  // The API will check if property exists, if not it fetches address from Google and creates it
  findOrCreate: async (googlePlaceId) => {
    const payload = {
      google_place_id: googlePlaceId
    }
    
    console.log('[Properties API] Finding or creating property with google_place_id:', googlePlaceId)
    
    // Use propertiesApiRequest (contacts API base URL) - endpoint is POST /property
    const result = await propertiesApiRequest('/property', 'POST', payload)
    console.log('[Properties API] findOrCreate response:', JSON.stringify(result, null, 2))
    return result
  },

  // Create new property (legacy - kept for backwards compatibility)
  create: (propertyData) => {
    // Only send fields that exist in the properties database
    // Don't send null values - only send fields that have actual data
    const payload = {}
    
    if (propertyData.address) payload.address = propertyData.address
    if (propertyData.street_address) payload.street_address = propertyData.street_address
    if (propertyData.full_address) payload.full_address = propertyData.full_address
    if (propertyData.formatted_address) payload.formatted_address = propertyData.formatted_address
    if (propertyData.city) payload.city = propertyData.city
    if (propertyData.state) payload.state = propertyData.state
    if (propertyData.zip_code) payload.zip_code = propertyData.zip_code
    if (propertyData.country) payload.country = propertyData.country
    // property_type_id is optional - only include if provided
    if (propertyData.property_type_id) payload.property_type_id = propertyData.property_type_id
    
    console.log('[Properties API] Creating property with payload:', payload)
    return apiRequest('/properties-new', 'POST', payload)
  },

  // Update property
  update: (id, propertyData) => {
    const payload = {
      id,
      data: propertyData
    }
    return apiRequest('/property-patch', 'PATCH', payload)
  },
}

// ============================================
// LOCATIONS API
// ============================================

export const locationsAPI = {
  // Get user locations (returns locations the user has access to)
  // The API may return expanded location data or just location_id
  getUserLocations: () => contactsApiRequest('/user_locations', 'GET'),
  
  // Get location details by ID (if needed)
  getLocationById: (locationId) => contactsApiRequest(`/locations/${locationId}`, 'GET'),
  
  // Get all locations (if needed to fetch details)
  getAllLocations: () => contactsApiRequest('/locations', 'GET'),
}

// ============================================
// USER API
// ============================================

export const userAPI = {
  // Get user by ID
  getById: (userId) => contactsApiRequest(`/user/${userId}`, 'GET'),

  // Update user - PATCH to /user/{user_id}
  update: (userId, userData) => {
    const payload = {}
    
    if (userData.first_name !== undefined) payload.first_name = userData.first_name
    if (userData.last_name !== undefined) payload.last_name = userData.last_name
    if (userData.email !== undefined) payload.email = userData.email
    if (userData.phone !== undefined) payload.phone = userData.phone
    if (userData.name !== undefined) payload.name = userData.name
    
    return contactsApiRequest(`/user/${userId}`, 'PATCH', payload)
  },
}

// ============================================
// CALENDAR EVENTS API (Inspection Time Slots)
// ============================================

export const calendarEventsAPI = {
  // Get all calendar events (inspection time slots)
  getAll: () => apiRequest('/inspection-time-slots', 'GET'),

  // Get available inspection time slots (not already booked)
  // Filters out slots that have confirmed or pending bookings
  // Each slot can only have one appointment
  getAvailableSlots: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.date) params.append('date', filters.date)
    if (filters.start_date) params.append('start_date', filters.start_date)
    if (filters.end_date) params.append('end_date', filters.end_date)
    if (filters.inspector_id) params.append('inspector_id', filters.inspector_id)
    
    const queryString = params.toString()
    const endpoint = `/get_available_slots${queryString ? `?${queryString}` : ''}`
    
    // Try API_V2_BASE_URL first (default), then fallback to API_BASE_URL if needed
    try {
      return await apiRequest(endpoint, 'GET')
    } catch (error) {
      console.warn('[calendarEventsAPI] Failed with API_V2_BASE_URL, trying API_BASE_URL:', error.message)
      // Try with API_BASE_URL as fallback
      const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
      const token = getAuthToken()
      const headers = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      })
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }
      
      const responseText = await response.text()
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        data = { message: responseText, raw: responseText }
      }
      
      return data
    }
  },

  // Get single calendar event by ID
  getById: (id) => apiRequest(`/inspection-time-slots/${id}`, 'GET'),

  // Create new calendar event (inspection time slot)
  // Days format: Array of numbers [0,1,2] where 0=Sunday, 1=Monday, etc.
  // Database uses: days_of_week (JSON object), recurrence_pattern (string), is_available (boolean)
  create: (eventData) => {
    // Convert time strings to timestamps if needed
    let start_time = eventData.startTime || eventData.start_time
    let end_time = eventData.endTime || eventData.end_time
    
    // If they're time strings, convert to timestamp (today at that time)
    if (typeof start_time === 'string' && start_time.includes(':')) {
      const [time, period] = start_time.split(' ')
      const [hours, minutes] = time.split(':')
      let hour24 = parseInt(hours, 10)
      if (period === 'PM' && hour24 !== 12) hour24 += 12
      if (period === 'AM' && hour24 === 12) hour24 = 0
      const today = new Date()
      today.setHours(hour24, parseInt(minutes, 10), 0, 0)
      start_time = today.getTime()
    }
    
    if (typeof end_time === 'string' && end_time.includes(':')) {
      const [time, period] = end_time.split(' ')
      const [hours, minutes] = time.split(':')
      let hour24 = parseInt(hours, 10)
      if (period === 'PM' && hour24 !== 12) hour24 += 12
      if (period === 'AM' && hour24 === 12) hour24 = 0
      const today = new Date()
      today.setHours(hour24, parseInt(minutes, 10), 0, 0)
      end_time = today.getTime()
    }
    
    // Convert days array to days_of_week object format
    const days = Array.isArray(eventData.days) ? eventData.days : []
    const days_of_week = {}
    days.forEach(dayIndex => {
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      days_of_week[dayNames[dayIndex]] = true
    })
    
    const payload = {
      start_time: start_time,
      end_time: end_time,
      days_of_week: days_of_week,
      recurrence_pattern: eventData.repeat || eventData.repeat_pattern || 'weekly',
      is_available: eventData.status === 'Active' || eventData.status !== 'Inactive',
    }
    return apiRequest('/inspection-time-slots-new', 'POST', payload)
  },

  // Update calendar event (inspection time slot)
  // Database fields: start_time (number/timestamp), end_time (number/timestamp), days_of_week (object), recurrence_pattern (string), is_available (boolean)
  update: (id, eventData) => {
    console.log('[API] calendarEventsAPI.update called with:', { id, eventData })
    
    const dataFields = {}
    
    // Handle start_time - convert time string to timestamp if needed
    if (eventData.startTime !== undefined || eventData.start_time !== undefined) {
      let start_time = eventData.startTime || eventData.start_time
      if (typeof start_time === 'string' && start_time.includes(':')) {
        const [time, period] = start_time.split(' ')
        const [hours, minutes] = time.split(':')
        let hour24 = parseInt(hours, 10)
        if (period === 'PM' && hour24 !== 12) hour24 += 12
        if (period === 'AM' && hour24 === 12) hour24 = 0
        const today = new Date()
        today.setHours(hour24, parseInt(minutes, 10), 0, 0)
        start_time = today.getTime()
      }
      dataFields.start_time = start_time
    }
    
    // Handle end_time - convert time string to timestamp if needed
    if (eventData.endTime !== undefined || eventData.end_time !== undefined) {
      let end_time = eventData.endTime || eventData.end_time
      if (typeof end_time === 'string' && end_time.includes(':')) {
        const [time, period] = end_time.split(' ')
        const [hours, minutes] = time.split(':')
        let hour24 = parseInt(hours, 10)
        if (period === 'PM' && hour24 !== 12) hour24 += 12
        if (period === 'AM' && hour24 === 12) hour24 = 0
        const today = new Date()
        today.setHours(hour24, parseInt(minutes, 10), 0, 0)
        end_time = today.getTime()
      }
      dataFields.end_time = end_time
    }
    
    // Convert days array to days_of_week object format
    // For PATCH requests, we need to explicitly set all days to true/false
    // so that unselected days are properly cleared in the database
    if (eventData.days !== undefined) {
      const days = Array.isArray(eventData.days) ? eventData.days : []
      const days_of_week = {}
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      
      // Initialize all days to false
      dayNames.forEach(dayName => {
        days_of_week[dayName] = false
      })
      
      // Set selected days to true
      days.forEach(dayIndex => {
        if (dayIndex >= 0 && dayIndex <= 6) {
          days_of_week[dayNames[dayIndex]] = true
        }
      })
      
      dataFields.days_of_week = days_of_week
    }
    
    // Handle recurrence_pattern (repeat)
    if (eventData.repeat !== undefined || eventData.recurrence_pattern !== undefined) {
      dataFields.recurrence_pattern = eventData.repeat || eventData.recurrence_pattern || 'weekly'
    }
    
    // Handle is_available (status)
    if (eventData.status !== undefined || eventData.is_available !== undefined) {
      if (eventData.status !== undefined) {
        dataFields.is_available = eventData.status === 'Active' || eventData.status !== 'Inactive'
      } else {
        dataFields.is_available = eventData.is_available
      }
    }
    
    console.log('[API] dataFields constructed:', JSON.stringify(dataFields, null, 2))
    
    const payload = {
      id,
      data: dataFields
    }
    
    console.log('[API] Final payload being sent:', JSON.stringify(payload, null, 2))
    
    return apiRequest('/inspection-time-slot-patch', 'PATCH', payload)
  },

  // Delete calendar event (inspection time slot)
  delete: (id) => {
    const payload = { id }
    return apiRequest('/inspection-time-slot-delete', 'DELETE', payload)
  },
}

export default {
  materials: materialsAPI,
  materialPricing: materialPricingAPI,
  manufacturers: manufacturersAPI,
  vendors: vendorsAPI,
  categories: categoriesAPI,
  leads: leadsAPI,
  inspections: inspectionsAPI,
  inspectionTypes: inspectionTypesAPI,
  inspectionBookings: inspectionBookingsAPI,
  inspectionResults: inspectionResultsAPI,
  media: mediaAPI,
  leadSources: leadSourcesAPI,
  leadReasons: leadReasonsAPI,
  callReasons: callReasonsAPI,
  properties: propertiesAPI,
  locations: locationsAPI,
  calendarEvents: calendarEventsAPI,
  user: userAPI,
  generic: genericAPI,
  trash: trashAPI,
}

