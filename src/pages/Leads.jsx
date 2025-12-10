import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Trash2, User } from 'lucide-react'
import Input from '../components/Input'
import Select from '../components/Select'
import Button from '../components/Button'
import NewPage from '../components/NewPage'
import LabelText from '../components/LabelText'
import TwoColumnLayout from '../components/TwoColumnLayout'
import NoDataFound from '../components/NoDataFound'
import ContactSelect from '../components/ContactSelect'
import AddressSelect from '../components/AddressSelect'
import InspectionSelect from '../components/InspectionSelect'
import { leadsAPI, leadSourcesAPI, leadReasonsAPI, propertiesAPI } from '../utils/apiService'
import { Section } from '../components/SectionHeader'

function Leads() {
  const { leadId: urlLeadId } = useParams()
  const navigate = useNavigate()
  const [selectedLead, setSelectedLead] = useState(0) // Index of selected lead
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingLeadDetails, setLoadingLeadDetails] = useState(true) // Start true to prevent content flash
  const [loadingContact, setLoadingContact] = useState(false)
  const [loadingProperty, setLoadingProperty] = useState(false)
  const [error, setError] = useState(null)
  
  // Options for dropdowns
  const [leadSourceOptions, setLeadSourceOptions] = useState([])
  const [leadReasonOptions, setLeadReasonOptions] = useState([])
  const [leadReasonsData, setLeadReasonsData] = useState([]) // Full reason objects including auto_create_inspection
  const [loadingOptions, setLoadingOptions] = useState(true)
  
  const [formData, setFormData] = useState({
    contact_id: null,
    priority: '',
    status: '',
    property_id: null,
    problem_description: '',
    intake_notes: '',
    lead_source_id: null,
    lead_reason_id: null
  })

  const isInitializingRef = useRef(false)
  const saveTimeoutRef = useRef(null)
  const leftColumnRef = useRef(null)
  const leadItemRefs = useRef({})

  // Helper function to get contact display name (first and last name only)
  const getContactDisplayName = (lead) => {
    // Check if contact info is nested in a contact object or directly on the lead
    const contact = lead.contact || lead.Contact || {}
    const firstName = contact.first_name || contact.FirstName || lead.first_name || lead.FirstName || ''
    const lastName = contact.last_name || contact.LastName || lead.last_name || lead.LastName || ''
    
    // Build full name from first and last name
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()
    
    // Return full name if available, otherwise "Unnamed Lead"
    return fullName || 'Unnamed Lead'
  }

  // Helper function to get contact email
  const getContactEmail = (lead) => {
    const contact = lead.contact || lead.Contact || {}
    return contact.email || contact.Email || lead.email || lead.Email || null
  }

  // Helper function to get contact phone
  const getContactPhone = (lead) => {
    const contact = lead.contact || lead.Contact || {}
    return contact.phone || contact.Phone || lead.phone || lead.Phone || null
  }

  // Helper function to format creation time as relative time or date
  const formatCreationTime = (lead) => {
    const dateStr = lead.created_at || lead.createdAt || lead.created_at || lead.CreatedAt
    if (!dateStr) return ''
    
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return ''
      
      const now = new Date()
      const diffMs = now - date
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      
      // If it's 15 days or more, show the date
      if (diffDays >= 15) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const month = months[date.getMonth()]
        const day = date.getDate()
        const year = date.getFullYear()
        return `${month} ${day}, ${year}`
      }
      
      // Otherwise, show relative time
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

  // Helper function to categorize leads by status
  const categorizeLeadsByStatus = (leads) => {
    // Define status categories in display order
    const statusOrder = [
      { key: 'new', label: 'New' },
      { key: 'in_progress', label: 'In Progress' },
      { key: 'converted', label: 'Converted' },
      { key: 'closed_no_action', label: 'Closed (No Action)' }
    ]

    const categories = {}
    
    // Initialize categories
    statusOrder.forEach(status => {
      categories[status.key] = { label: status.label, leads: [] }
    })
    // Add a category for leads without status
    categories['no_status'] = { label: 'No Status', leads: [] }

    // Categorize leads by their status
    leads.forEach(lead => {
      const status = lead.status || lead.Status || ''
      
      if (status && categories[status]) {
        categories[status].leads.push(lead)
      } else if (status) {
        // Unknown status - put in no_status
        categories['no_status'].leads.push(lead)
      } else {
        // No status set
        categories['no_status'].leads.push(lead)
      }
    })

    // Sort each category by creation time (newest first)
    const sortByCreationTime = (a, b) => {
      const dateA = new Date(a.created_at || a.createdAt || a.CreatedAt || 0)
      const dateB = new Date(b.created_at || b.createdAt || b.CreatedAt || 0)
      return dateB.getTime() - dateA.getTime() // Newest first
    }

    Object.values(categories).forEach(category => {
      category.leads.sort(sortByCreationTime)
    })

    // Return only categories that have leads, in the defined order
    const result = []
    statusOrder.forEach(status => {
      if (categories[status.key].leads.length > 0) {
        result.push(categories[status.key])
      }
    })
    // Add no_status at the end if it has any leads
    if (categories['no_status'].leads.length > 0) {
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
      
      // Fetch lead sources and lead reasons in parallel
      const [sourcesData, reasonsData] = await Promise.all([
        leadSourcesAPI.getAll(),
        leadReasonsAPI.getAll()
      ])
      
      // Transform sources to options format
      const sourcesArray = Array.isArray(sourcesData) ? sourcesData : (sourcesData?.items || sourcesData?.data || [])
      const sourcesOptions = sourcesArray.map(item => ({
        value: item.id,
        label: item.name || item.source_name || item.title || `Source ${item.id}`
      }))
      setLeadSourceOptions(sourcesOptions)
      
      // Transform reasons to options format
      const reasonsArray = Array.isArray(reasonsData) ? reasonsData : (reasonsData?.items || reasonsData?.data || [])
      setLeadReasonsData(reasonsArray) // Store full reason objects
      const reasonsOptions = reasonsArray.map(item => ({
        value: item.id,
        label: item.name || item.reason_name || item.reason || item.title || `Reason ${item.id}`
      }))
      setLeadReasonOptions(reasonsOptions)
    } catch (err) {
      console.error('Error fetching dropdown options:', err)
    } finally {
      setLoadingOptions(false)
    }
  }

  // Fetch leads on component mount
  useEffect(() => {
    fetchLeads()
  }, [])

  // Sync URL with selected lead - when leads load, find the lead from URL
  useEffect(() => {
    if (!loading && leads.length > 0 && urlLeadId) {
      const foundIndex = leads.findIndex(lead => {
        const id = lead.id || lead.ID
        return id && String(id) === String(urlLeadId)
      })
      if (foundIndex >= 0 && foundIndex !== selectedLead) {
        setSelectedLead(foundIndex)
      } else if (foundIndex === -1) {
        // Lead not found in list, redirect to first DISPLAYED lead (after categorization)
        const categories = categorizeLeadsByStatus(leads)
        const firstCategory = categories[0]
        const firstDisplayedLead = firstCategory?.leads?.[0]
        
        if (firstDisplayedLead) {
          const firstLeadId = firstDisplayedLead.id || firstDisplayedLead.ID
          const firstLeadIndex = leads.findIndex(l => 
            (l.id && firstLeadId && l.id === firstLeadId) || 
            (l.ID && firstLeadId && l.ID === firstLeadId)
          )
          if (firstLeadId) {
            navigate(`/leads/${firstLeadId}`, { replace: true })
          }
          if (firstLeadIndex >= 0) {
            setSelectedLead(firstLeadIndex)
          }
        } else {
          // Fallback to first in array
          const firstLeadId = leads[0]?.id || leads[0]?.ID
          if (firstLeadId) {
            navigate(`/leads/${firstLeadId}`, { replace: true })
          }
        }
      }
    }
  }, [loading, leads, urlLeadId])

  // Update URL when lead is selected (via click, not URL navigation)
  const selectLead = useCallback((index) => {
    if (index >= 0 && index < leads.length) {
      const lead = leads[index]
      const leadId = lead?.id || lead?.ID
      if (leadId) {
        navigate(`/leads/${leadId}`)
      }
      setSelectedLead(index)
    }
  }, [leads, navigate])

  // Scroll selected lead to top when it changes
  useEffect(() => {
    if (selectedLead >= 0 && leadItemRefs.current[selectedLead] && leftColumnRef.current) {
      const leadElement = leadItemRefs.current[selectedLead]
      const container = leftColumnRef.current
      
      // Calculate position relative to the scrollable container
      const containerRect = container.getBoundingClientRect()
      const elementRect = leadElement.getBoundingClientRect()
      
      // Calculate how much we need to scroll
      // elementRect.top - containerRect.top gives the current position relative to container
      // Add current scrollTop to get the absolute position in the scrollable content
      const currentScrollTop = container.scrollTop
      const elementPositionRelativeToContainer = elementRect.top - containerRect.top
      const targetScrollTop = currentScrollTop + elementPositionRelativeToContainer - 20 // 20px padding
      
      container.scrollTo({
        top: Math.max(0, targetScrollTop), // Ensure we don't scroll to negative position
        behavior: 'smooth'
      })
    }
  }, [selectedLead, leads])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await leadsAPI.getAll()
      
      // Handle different response formats
      const leadsArray = Array.isArray(data) 
        ? data 
        : (data?.leads || data?.data || data?.results || [])
      
      setLeads(leadsArray)
      
      // If no URL param and we have leads, navigate to first DISPLAYED lead (after categorization)
      if (leadsArray.length > 0 && !urlLeadId) {
        // Get the first displayed lead from the categorized list
        const categories = categorizeLeadsByStatus(leadsArray)
        const firstCategory = categories[0]
        const firstDisplayedLead = firstCategory?.leads?.[0]
        
        if (firstDisplayedLead) {
          const firstLeadId = firstDisplayedLead.id || firstDisplayedLead.ID
          // Find the index in the original array
          const firstLeadIndex = leadsArray.findIndex(l => 
            (l.id && firstLeadId && l.id === firstLeadId) || 
            (l.ID && firstLeadId && l.ID === firstLeadId)
          )
          
          if (firstLeadId) {
            navigate(`/leads/${firstLeadId}`, { replace: true })
          }
          setSelectedLead(firstLeadIndex >= 0 ? firstLeadIndex : 0)
        } else {
          // Fallback to first in array
          const firstLeadId = leadsArray[0]?.id || leadsArray[0]?.ID
          if (firstLeadId) {
            navigate(`/leads/${firstLeadId}`, { replace: true })
          }
          setSelectedLead(0)
        }
      }
    } catch (err) {
      console.error('Error fetching leads:', err)
      setError(err.message || 'Failed to load leads')
      setLeads([])
    } finally {
      setLoading(false)
    }
  }

  // These are memoized to prevent recreation on every render
  const statusOptions = useMemo(() => [
    { value: 'new', label: 'New' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'converted', label: 'Converted' },
    { value: 'closed_no_action', label: 'Closed (No Action)' }
  ], [])

  const priorityOptions = useMemo(() => [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ], [])

  // Update form data when lead changes
  const currentLead = leads.length > 0 ? (leads[selectedLead] || leads[0]) : null

  // Determine if inspection booking should be disabled based on selected reason's auto_create_inspection
  // Also disabled if contact or property are not set
  const selectedReason = leadReasonsData.find(reason => reason.id === formData.lead_reason_id)
  const isInspectionDisabled = !formData.contact_id || !formData.property_id || !selectedReason || selectedReason.auto_create_inspection === false

  // Compute helper text for disabled inspection button
  const getInspectionDisabledReason = () => {
    const missingContact = !formData.contact_id
    const missingProperty = !formData.property_id
    const reasonDoesNotRequireInspection = selectedReason && selectedReason.auto_create_inspection === false

    if (reasonDoesNotRequireInspection) {
      return 'This reason for call does not require an inspection.'
    }
    if (missingContact && missingProperty) {
      return 'Add a contact and property to enable inspection scheduling.'
    }
    if (missingContact) {
      return 'Add a contact to schedule an inspection.'
    }
    if (missingProperty) {
      return 'Add a property to schedule an inspection.'
    }
    return ''
  }
  const inspectionDisabledReason = getInspectionDisabledReason()

  // Fetch detailed lead info when a lead is selected
  const fetchLeadDetails = useCallback(async (leadId) => {
    if (!leadId) return
    
    try {
      setLoadingLeadDetails(true)
      const detailedLead = await leadsAPI.getById(leadId)
      
      console.log('[Leads] Lead details fetched:', detailedLead)
      
      // Update the lead in the leads array with the detailed info
      setLeads(prev => {
        const updated = [...prev]
        const index = updated.findIndex(l => (l.id || l.ID) === leadId)
        if (index !== -1) {
          updated[index] = { ...updated[index], ...detailedLead }
        }
        return updated
      })
      
      // Also update the form data directly with the fetched details
      // This ensures the form is populated even if the selectedLead index hasn't changed
      const contactId = detailedLead.contact_id || detailedLead.contactId || detailedLead.contact?.id || detailedLead.Contact?.id || null
      const propertyId = detailedLead.property_id || null
      
      // Set the initializing flag to prevent auto-save from triggering
      isInitializingRef.current = true
      
      setFormData({
        contact_id: contactId,
        priority: detailedLead.priority || '',
        status: detailedLead.status || '',
        property_id: propertyId,
        problem_description: detailedLead.problem_description || '',
        intake_notes: detailedLead.intake_notes || '',
        lead_source_id: detailedLead.lead_source_id || null,
        lead_reason_id: detailedLead.lead_reason_id || null,
        inspection_id: detailedLead.inspection_id || null
      })
      
      // Reset initializing flag after a short delay
      setTimeout(() => {
        isInitializingRef.current = false
      }, 200)
      
    } catch (err) {
      console.error('[Leads] Error fetching lead details:', err)
    } finally {
      setLoadingLeadDetails(false)
    }
  }, [])

  // Track the last selected lead index and ID to know when user clicked a different lead
  const lastSelectedLeadRef = useRef(selectedLead)
  const lastFetchedLeadIdRef = useRef(null)

  // Fetch lead details when selected lead changes or when currentLead first becomes available
  useEffect(() => {
    if (currentLead) {
      const leadId = currentLead.id || currentLead.ID
      // Only fetch if we have a leadId and it's different from the last fetched one
      if (leadId && leadId !== lastFetchedLeadIdRef.current) {
        lastFetchedLeadIdRef.current = leadId
        fetchLeadDetails(leadId)
      }
    }
  }, [selectedLead, currentLead, fetchLeadDetails])

  // Auto-save lead when form data changes (debounced)
  const saveLead = useCallback(async (leadId, data) => {
    try {
      setSaving(true)
      const startTime = Date.now()
      console.log('[Leads] Saving lead with data:', data)
      console.log('[Leads] property_id in save data:', data.property_id)
      await leadsAPI.update(leadId, data)
      console.log('[Leads] Lead saved successfully')
      
      // Ensure saving indicator shows for at least 3 seconds
      const elapsed = Date.now() - startTime
      const minDisplayTime = 3000
      if (elapsed < minDisplayTime) {
        await new Promise(resolve => setTimeout(resolve, minDisplayTime - elapsed))
      }
    } catch (err) {
      console.error('[Leads] Error saving lead:', err)
      // Could add toast notification here
    } finally {
      setSaving(false)
    }
  }, [])

  // Auto-save lead when form data changes (debounced)
  // We DON'T update local leads array to avoid triggering re-initialization
  useEffect(() => {
    // Don't save when initializing form data from selected lead
    if (isInitializingRef.current || !currentLead || selectedLead < 0) {
      return
    }

    // Debounce the API save (500ms delay)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    const leadId = currentLead.id || currentLead.ID
    if (leadId) {
      saveTimeoutRef.current = setTimeout(() => {
        saveLead(leadId, formData)
      }, 500)
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [formData, currentLead, selectedLead, saveLead])

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
      
      // Create a new lead with empty data
      const newLead = await leadsAPI.create({})
      
      console.log('[Leads] New lead created:', newLead)
      
      // Refresh the leads list to include the new lead
      const updatedLeads = await leadsAPI.getAll()
      const leadsArray = Array.isArray(updatedLeads) 
        ? updatedLeads 
        : (updatedLeads?.leads || updatedLeads?.data || updatedLeads?.results || [])
      
      setLeads(leadsArray)
      
      // Find and select the newly created lead
      const leadId = newLead?.id || newLead?.ID
      if (leadId) {
        const newLeadIndex = leadsArray.findIndex(l => 
          (l.id && leadId && l.id === leadId) || 
          (l.ID && leadId && l.ID === leadId)
        )
        
        if (newLeadIndex >= 0) {
          setSelectedLead(newLeadIndex)
          // Navigate to the new lead URL
          navigate(`/leads/${leadId}`)
        }
      }
      
      // Reset form data for the new lead
      setFormData({
        contact_id: null,
        priority: '',
        status: '',
        property_id: null,
        problem_description: '',
        intake_notes: '',
        lead_source_id: null,
        lead_reason_id: null,
        inspection_id: null
      })
    } catch (err) {
      console.error('[Leads] Error creating lead:', err)
      setError(err.message || 'Failed to create lead')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!currentLead) return
    
    const leadId = currentLead.id || currentLead.ID
    if (!leadId) return
    
    try {
      // Soft delete the lead via API (sets is_deleted = true)
      await leadsAPI.delete(leadId)
      console.log('[Leads] Lead soft deleted successfully:', leadId)
      
      // Remove from local state
      const newLeads = leads.filter((_, index) => index !== selectedLead)
      setLeads(newLeads)
      
      if (newLeads.length > 0) {
        const newIndex = Math.max(0, selectedLead - 1)
        const nextLead = newLeads[newIndex]
        const nextLeadId = nextLead?.id || nextLead?.ID
        setSelectedLead(newIndex)
        if (nextLeadId) {
          navigate(`/leads/${nextLeadId}`)
        }
      } else {
        setSelectedLead(0)
        navigate('/leads')
      }
    } catch (err) {
      console.error('[Leads] Error deleting lead:', err)
      setError(err.message || 'Failed to delete lead')
    }
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
        <Button variant="dark" onClick={handleCreate} disabled={creating || loading}>
          <Plus size={14} />
          <span>{creating ? 'Creating...' : 'Create'}</span>
        </Button>
      </div>

      {/* Main Content Area */}
      <TwoColumnLayout
        leftColumnRef={leftColumnRef}
        leftLoading={loading}
        rightLoading={currentLead && (loadingLeadDetails || loadingContact || loadingProperty)}
        leftContent={
          <>
            {error && (
              <div className="flex items-center justify-center py-8">
                <span style={{ color: '#C62828', fontSize: '12px' }}>Error: {error}</span>
              </div>
            )}

            {!loading && !error && leads.length === 0 && (
              <div className="flex items-center justify-center flex-1" style={{ minHeight: 0 }}>
                <NoDataFound 
                  heading="No leads found" 
                  message="Create a lead below."
                  buttonText="Create"
                  onButtonClick={handleCreate}
                  icon={User}
                  iconSize={16}
                  iconStrokeWidth={2}
                />
              </div>
            )}

            {!loading && !error && leads.length > 0 && (
              <div className="flex flex-col gap-4">
                {categorizeLeadsByStatus(leads).map((category, categoryIndex) => (
                  <div key={categoryIndex} className="flex flex-col gap-2">
                    {/* Category Header */}
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
                        {category.label}
                      </span>
                    </div>

                    {/* Leads in this category */}
                    <div className="flex flex-col gap-2">
                      {category.leads.map((lead, index) => {
                        // Find the original index in the leads array
                        const originalIndex = leads.findIndex(l => 
                          (l.id && lead.id && l.id === lead.id) || 
                          (l.ID && lead.ID && l.ID === lead.ID) ||
                          l === lead
                        )
                        const leadIndex = originalIndex >= 0 ? originalIndex : index
                        
                        return (
                          <div
                            key={lead.id || lead.ID || `${categoryIndex}-${index}`}
                            ref={(el) => {
                              if (el) {
                                leadItemRefs.current[leadIndex] = el
                              }
                            }}
                            onClick={() => selectLead(leadIndex)}
                            className="flex flex-col cursor-pointer transition-all"
                            style={{
                              backgroundColor: selectedLead === leadIndex ? '#EDEDED' : '#FFFFFF',
                              borderRadius: '10px',
                              padding: '15px'
                            }}
                            onMouseEnter={(e) => {
                              if (selectedLead !== leadIndex) {
                                e.currentTarget.style.backgroundColor = '#F5F5F5'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedLead !== leadIndex) {
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
                                {getContactDisplayName(lead)}
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
                                {formatCreationTime(lead)}
                              </span>
                            </div>
                            {(lead.problem_description || lead.problemDescription) && (
                              <div className="flex flex-row items-center w-full">
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
                                    maxWidth: '100%'
                                  }}
                                >
                                  {lead.problem_description || lead.problemDescription || ''}
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        }
        rightContent={
          !currentLead && !loading ? (
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
                Select a lead to view details.
              </span>
            </div>
          ) : currentLead ? (
            <div
              className="flex flex-col"
              style={{
                maxWidth: '30rem',
                margin: '0',
                gap: '30px'
              }}
            >
              {/* Contact & Property Section */}
              <Section title="Contact & Property">
                <ContactSelect
                  id={formData.contact_id}
                  onContactChange={(contactId) => {
                    setFormData(prev => ({ ...prev, contact_id: contactId }))
                  }}
                  onContactDelete={() => {
                    setFormData(prev => ({ ...prev, contact_id: null }))
                  }}
                  onLoadingChange={setLoadingContact}
                />
                <AddressSelect
                  id={formData.property_id}
                  onAddressChange={async (address) => {
                    try {
                      const googlePlaceId = address?.place_id || address?.placeId || address?.id
                      if (!googlePlaceId) {
                        console.error('[Leads] No google_place_id found in address:', address)
                        return
                      }
                      console.log('[Leads] Creating/finding property with google_place_id:', googlePlaceId)
                      const property = await propertiesAPI.findOrCreate(googlePlaceId)
                      console.log('[Leads] Property response:', JSON.stringify(property, null, 2))
                      let propertyId = null
                      if (property?.id) propertyId = property.id
                      else if (property?.ID) propertyId = property.ID
                      else if (property?.property_id) propertyId = property.property_id
                      else if (property?.data) {
                        propertyId = property.data.id || property.data.ID || property.data.property_id || null
                      }
                      else if (Array.isArray(property) && property.length > 0) {
                        propertyId = property[0].id || property[0].ID || property[0].property_id || null
                      }
                      console.log('[Leads] Extracted property_id:', propertyId, 'Type:', typeof propertyId)
                      if (propertyId) {
                        console.log('[Leads] Updating formData with property_id:', propertyId)
                        const leadId = currentLead?.id || currentLead?.ID
                        setFormData(prev => {
                          const updated = { ...prev, property_id: propertyId }
                          console.log('[Leads] formData after update:', updated)
                          return updated
                        })
                        if (leadId) {
                          console.log('[Leads] Immediately saving property_id to lead:', leadId, propertyId)
                          try {
                            await leadsAPI.update(leadId, { property_id: propertyId })
                            console.log('[Leads] property_id saved successfully to lead')
                          } catch (saveError) {
                            console.error('[Leads] Error saving property_id to lead:', saveError)
                          }
                        }
                      } else {
                        console.error('[Leads] Failed to get property_id from created property. Full response:', JSON.stringify(property, null, 2))
                      }
                    } catch (error) {
                      console.error('[Leads] Error creating/finding property:', error)
                    }
                  }}
                  onAddressDelete={async () => {
                    setFormData(prev => ({ ...prev, property_id: null }))
                    const leadId = currentLead?.id || currentLead?.ID
                    if (leadId) {
                      console.log('[Leads] Immediately clearing property_id from lead:', leadId)
                      try {
                        await leadsAPI.update(leadId, { property_id: null })
                        console.log('[Leads] property_id cleared successfully from lead')
                      } catch (saveError) {
                        console.error('[Leads] Error clearing property_id from lead:', saveError)
                      }
                    }
                  }}
                  propertyId={formData.property_id}
                  onLoadingChange={setLoadingProperty}
                />
              </Section>

              {/* Lead Intake Section */}
              <Section title="Lead Intake">
                <Select
                  label={<LabelText>Reason for call</LabelText>}
                  options={leadReasonOptions}
                  value={formData.lead_reason_id}
                  onChange={handleSelectChange('lead_reason_id')}
                  placeholder={loadingOptions ? "Loading..." : "Select reason"}
                />
                <Input
                  label={<LabelText helpText="Record what the customer says is happening. This helps us understand their concern before the inspection.">Problem description</LabelText>}
                  value={formData.problem_description}
                  onChange={handleInputChange('problem_description')}
                  type="textarea"
                  placeholder="Describe the problem..."
                />
                <Input
                  label={
                    <LabelText helpText="Internal-only notes from the call. Include anything helpful for sales or inspectors. Customers don't see this.">
                      Internal notes
                    </LabelText>
                  }
                  value={formData.intake_notes}
                  onChange={handleInputChange('intake_notes')}
                  type="textarea"
                  placeholder="Enter internal notes for team.."
                />
                <Select
                  label={<LabelText>Source</LabelText>}
                  options={leadSourceOptions}
                  value={formData.lead_source_id}
                  onChange={handleSelectChange('lead_source_id')}
                  placeholder={loadingOptions ? "Loading..." : "Select source"}
                />
                <Select
                  label={<LabelText>Lead status</LabelText>}
                  options={statusOptions}
                  value={formData.status}
                  onChange={handleSelectChange('status')}
                  placeholder="Select status"
                />
              </Section>

              {/* Inspection Scheduling Section */}
              <Section title="Inspection Scheduling">
                <InspectionSelect
                  leadId={currentLead?.id || currentLead?.ID}
                  propertyId={formData.property_id}
                  inspectionId={formData.inspection_id}
                  onInspectionChange={(inspection) => {
                    console.log('[Leads] Inspection selected:', inspection)
                    // Update formData with the new inspection_id
                    if (inspection.booking?.id) {
                      setFormData(prev => ({ ...prev, inspection_id: inspection.booking.id }))
                    }
                  }}
                  onInspectionDelete={() => {
                    console.log('[Leads] Inspection removed')
                    setFormData(prev => ({ ...prev, inspection_id: null }))
                  }}
                  disabled={isInspectionDisabled}
                  disabledReason={inspectionDisabledReason}
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
                  ) : currentLead?.updated_at ? (
                    `Updated ${formatUpdatedAt(currentLead.updated_at)}`
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

export default Leads

