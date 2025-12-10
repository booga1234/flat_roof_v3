import { useState, useEffect, useRef, useCallback } from 'react'
import { Plus, ArrowLeft, UserRound, Repeat, Pencil } from 'lucide-react'
import Button from './Button'
import IconButton from './IconButton'
import Modal from './Modal'
import SearchPanel from './SearchPanel'
import Input from './Input'
import Select from './Select'
import Badge from './Badge'
import { API_CONTACTS_BASE_URL } from '../config/api'

function ContactSelect({ id, onContactChange, onContactDelete, onLoadingChange }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [page, setPage] = useState('search') // 'search', 'create', or 'edit'
  const [editingContactId, setEditingContactId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedContact, setSelectedContact] = useState(null)
  const [pendingSelection, setPendingSelection] = useState(null)
  const [loadingContact, setLoadingContact] = useState(false)
  const debounceTimerRef = useRef(null)
  
  // Form state for new contact
  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: '',
    preferredContactMethod: 'any',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const preferredContactMethodOptions = [
    { value: 'any', label: 'Any' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'text', label: 'Text' },
  ]

  // Helper to parse search query into first/last name
  const parseNameFromQuery = (query) => {
    const trimmed = query.trim()
    if (!trimmed) return { firstName: '', lastName: '' }
    
    const parts = trimmed.split(/\s+/) // Split by whitespace
    const firstName = parts[0] || ''
    const lastName = parts.slice(1).join(' ') // Everything after first word
    
    return { firstName, lastName }
  }

  const handleNewContactChange = (field) => (e) => {
    const value = e.target ? e.target.value : e
    setNewContact(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveContact = async () => {
    // Validate required fields
    if (!newContact.firstName.trim()) {
      setSaveError('First name is required')
      return
    }
    if (!newContact.phone.trim()) {
      setSaveError('Phone number is required')
      return
    }

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

      // Map form fields to API structure
      const payload = {
        first_name: newContact.firstName,
        last_name: newContact.lastName,
        phone: newContact.phone,
        email: newContact.email,
        notes: newContact.notes,
        preferred_contact_method: newContact.preferredContactMethod,
        title: newContact.title,
      }

      const response = await fetch(`${API_CONTACTS_BASE_URL}/contacts`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to create contact: ${response.status}`)
      }

      const createdContact = await response.json()
      
      // Set the newly created contact as the selected contact
      setSelectedContact(createdContact)
      
      // Notify parent of the change
      if (onContactChange) {
        onContactChange(createdContact.id)
      }

      // Reset form and close modal
      setNewContact({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        title: '',
        preferredContactMethod: 'any',
        notes: '',
      })
      setIsModalOpen(false)
      setPage('search')
    } catch (err) {
      console.error('Error creating contact:', err)
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateContact = async () => {
    // Validate required fields
    if (!newContact.firstName.trim()) {
      setSaveError('First name is required')
      return
    }
    if (!newContact.phone.trim()) {
      setSaveError('Phone number is required')
      return
    }

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

      // Map form fields to API structure
      const payload = {
        first_name: newContact.firstName,
        last_name: newContact.lastName,
        phone: newContact.phone,
        email: newContact.email,
        notes: newContact.notes,
        preferred_contact_method: newContact.preferredContactMethod,
        title: newContact.title,
      }

      const response = await fetch(`${API_CONTACTS_BASE_URL}/contacts/${editingContactId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to update contact: ${response.status}`)
      }

      const updatedContact = await response.json()
      
      // Update the selected contact with new data
      setSelectedContact(updatedContact)
      
      // Notify parent of the change
      if (onContactChange) {
        onContactChange(updatedContact.id)
      }

      // Reset form and close modal
      setNewContact({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        title: '',
        preferredContactMethod: 'any',
        notes: '',
      })
      setEditingContactId(null)
      setIsModalOpen(false)
      setPage('search')
    } catch (err) {
      console.error('Error updating contact:', err)
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const buttonText = searchQuery.trim()
    ? `Create "${searchQuery.trim()}" as a new contact`
    : 'Create new contact'

  // Notify parent of loading state changes
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(loadingContact)
    }
  }, [loadingContact, onLoadingChange])

  // Fetch single contact when id is provided
  useEffect(() => {
    if (id) {
      fetchSingleContact(id)
    } else {
      setSelectedContact(null)
      setLoadingContact(false)
    }
  }, [id])

  const fetchSingleContact = async (contactId) => {
    try {
      setLoadingContact(true)
      
      const token = localStorage.getItem('authToken')
      const headers = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${API_CONTACTS_BASE_URL}/contact-single?id=${contactId}`, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch contact: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setSelectedContact(data)
    } catch (err) {
      console.error('Error fetching contact:', err)
      setSelectedContact(null)
    } finally {
      setLoadingContact(false)
    }
  }

  // Map API response to SearchPanel format
  const mapContactsResponse = (contactsList) => {
    return contactsList.map((contact) => {
      const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
      
      // Extract organization name - handle various possible structures
      let companyName = ''
      if (contact.organization) {
        if (typeof contact.organization === 'object') {
          companyName = contact.organization.name || 
                       contact.organization.organization_name || 
                       contact.organization.title || 
                       ''
        } else {
          companyName = contact.organization
        }
      } else if (contact.organization_name) {
        companyName = contact.organization_name
      }
      
      return {
        id: contact.id,
        name: fullName || 'Unknown',
        role: contact.title || '',
        company: companyName,
        phone: contact.phone || '',
      }
    })
  }

  // Fetch contacts list (used when search query is 3 chars or less)
  const fetchContactsList = useCallback(async () => {
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

      const response = await fetch(`${API_CONTACTS_BASE_URL}/contacts-list`, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch contacts: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const contactsList = data.items || []
      const mappedContacts = mapContactsResponse(contactsList)
      
      setContacts(mappedContacts)
    } catch (err) {
      console.error('Error fetching contacts:', err)
      setError(err.message)
      setContacts([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Search contacts API call (used when search query is more than 3 chars)
  const searchContacts = useCallback(async (query) => {
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

      const url = new URL(`${API_CONTACTS_BASE_URL}/contacts-search`)
      url.searchParams.append('search_query', query.trim())

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw new Error(`Failed to search contacts: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const contactsList = data.items || []
      const mappedContacts = mapContactsResponse(contactsList)
      
      setContacts(mappedContacts)
    } catch (err) {
      console.error('Error searching contacts:', err)
      setError(err.message)
      setContacts([])
    } finally {
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

    // Don't fetch when input is empty - prevents flash on modal open
    if (trimmedQuery.length === 0) {
      setContacts([])
      setLoading(false)
      return
    }

    // Debounce the search by 300ms
    debounceTimerRef.current = setTimeout(() => {
      // Use search API only when more than 3 characters, otherwise use list API
      if (trimmedQuery.length > 3) {
        searchContacts(searchQuery)
      } else {
        fetchContactsList()
      }
    }, 300)

    // Cleanup on unmount or when dependencies change
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchQuery, isModalOpen, searchContacts, fetchContactsList])

  // Reset page and search when modal opens (but not when editing)
  useEffect(() => {
    if (isModalOpen) {
      // Only reset to search if not in edit mode
      if (page !== 'edit') {
        setPage('search')
      }
      setSaveError(null)
      // Set pending selection to current selected contact when opening
      setPendingSelection(selectedContact)
      // Initial search will be triggered by the searchQuery useEffect
    } else {
      // Clear search and errors when modal closes
      setSearchQuery('')
      setSaveError(null)
      setEditingContactId(null)
      setPendingSelection(null)
    }
  }, [isModalOpen, selectedContact])

  const handleSelectContact = async (item) => {
    // Fetch the full contact details
    const contact = await fetchSingleContactForSelection(item.id)
    
    // Set pending selection
    if (contact) {
      setPendingSelection(contact)
    }
  }

  // Helper function to fetch contact for selection (returns contact instead of setting state)
  const fetchSingleContactForSelection = async (contactId) => {
    try {
      const token = localStorage.getItem('authToken')
      const headers = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${API_CONTACTS_BASE_URL}/contact-single?id=${contactId}`, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch contact: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      console.error('Error fetching contact:', err)
      return null
    }
  }

  // Handle confirm selection - apply the pending selection
  const handleConfirmSelection = () => {
    if (!pendingSelection) return
    
    setSelectedContact(pendingSelection)
    setIsModalOpen(false)
    setPage('search')
    
    // Notify parent of the change
    if (onContactChange) {
      onContactChange(pendingSelection.id)
    }
    
    // Clear pending selection
    setPendingSelection(null)
  }

  // Handle cancel - clear selection and close modal
  const handleCancel = () => {
    setPendingSelection(null)
    setIsModalOpen(false)
    setPage('search')
  }

  const handleEditContact = () => {
    // Populate form with existing contact data
    setNewContact({
      firstName: selectedContact.first_name || '',
      lastName: selectedContact.last_name || '',
      email: selectedContact.email || '',
      phone: selectedContact.phone || '',
      title: selectedContact.title || '',
      preferredContactMethod: selectedContact.preferred_contact_method || 'any',
      notes: selectedContact.notes || '',
    })
    setEditingContactId(selectedContact.id)
    setPage('edit')
    setIsModalOpen(true)
  }

  const handleDeleteContact = () => {
    setSelectedContact(null)
    if (onContactDelete) {
      onContactDelete()
    }
  }

  // Format the contact type label
  const formatContactType = (type) => {
    if (!type) return ''
    // Capitalize first letter and replace underscores with spaces
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')
  }

  // Loading state for initial contact fetch - show skeleton only if parent isn't handling loading
  // If parent is handling loading (onLoadingChange provided), don't show skeleton - let parent handle UI
  if (loadingContact && !onLoadingChange) {
    return (
      <div 
        className="flex flex-col"
        style={{ 
          gap: '20px', 
          padding: '15px', 
          width: '100%',
          minWidth: '100%',
          backgroundColor: '#FFFFFF',
          border: '1px solid #D8D8D8',
          borderRadius: '10px',
        }}
      >
        {/* Top section skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center" style={{ gap: '6px' }}>
            <div className="lead-skeleton-line" style={{ width: '22px', height: '22px', borderRadius: '8px' }} />
            <div className="lead-skeleton-line" style={{ width: '100px', height: '12px' }} />
          </div>
        </div>
        {/* Bottom section skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col" style={{ gap: '4px' }}>
            <div className="lead-skeleton-line" style={{ width: '80px', height: '10px' }} />
          </div>
          <div className="flex flex-col items-end" style={{ gap: '5px' }}>
            <div className="lead-skeleton-line" style={{ width: '110px', height: '10px' }} />
            <div className="lead-skeleton-line" style={{ width: '130px', height: '10px' }} />
          </div>
        </div>
      </div>
    )
  }

  // Helper function to get initials from first and last name
  const getInitials = (firstName, lastName) => {
    const first = (firstName || '').charAt(0).toUpperCase()
    const last = (lastName || '').charAt(0).toUpperCase()
    return first + last || '?'
  }

  // Contact card component
  const ContactCard = () => {
    const fullName = `${selectedContact.first_name || ''} ${selectedContact.last_name || ''}`.trim() || 'Unknown'
    const firstName = selectedContact.first_name || ''
    const lastName = selectedContact.last_name || ''
    const initials = getInitials(firstName, lastName)
    
    // Extract organization name - handle various possible structures
    let companyName = ''
    if (selectedContact.organization) {
      if (typeof selectedContact.organization === 'object') {
        companyName = selectedContact.organization.name || 
                     selectedContact.organization.organization_name || 
                     selectedContact.organization.title || 
                     ''
      } else {
        companyName = selectedContact.organization
      }
    } else if (selectedContact.organization_name) {
      companyName = selectedContact.organization_name
    }
    
    const roleTitle = selectedContact.title || formatContactType(selectedContact.contact_type) || ''
    
    // Format preferred contact method badge
    const preferredContactMethod = selectedContact.preferred_contact_method
    const preferredContactBadge = preferredContactMethod && preferredContactMethod !== 'any'
      ? `${preferredContactMethod.charAt(0).toUpperCase() + preferredContactMethod.slice(1).toLowerCase()} pref.`
      : null
    
    return (
      <div 
        className="contact-card flex flex-col"
        style={{ 
          gap: '20px', 
          padding: '15px', 
          width: '100%',
          minWidth: '100%',
          backgroundColor: '#FFFFFF',
          border: '1px solid #D8D8D8',
          borderRadius: '10px',
          justifyContent: 'space-between',
        }}
      >
        {/* Top section: Avatar + Name + Badges */}
        <div className="flex items-center justify-between" style={{ gap: '6px' }}>
          <div className="flex items-center" style={{ gap: '6px', minWidth: 0, flex: 1 }}>
            {/* Circular avatar with initials */}
            <div 
              className="flex items-center justify-center flex-shrink-0"
              style={{ 
                width: '32px', 
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#ECECEC',
              }}
            >
              <span 
                className="font-inter"
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  color: '#202020',
                }}
              >
                {initials}
              </span>
            </div>
            
            {/* Heading text */}
            <span 
              className="font-inter"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: '#202020',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                minWidth: 0,
              }}
            >
              {fullName}
            </span>
          </div>
          
          {/* Badges in top right */}
          <div className="flex items-center" style={{ gap: '6px', flexShrink: 0 }}>
            {roleTitle && (
              <Badge variant="grey">
                {roleTitle}
              </Badge>
            )}
            {preferredContactBadge && (
              <Badge variant="grey">
                {preferredContactBadge}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Bottom section: Phone/Email + Company + Buttons */}
        <div className="flex items-end justify-between">
          {/* Left column: Phone/Email + Company */}
          <div className="flex flex-col" style={{ gap: '5px', minWidth: 0, flex: 1, marginRight: '10px' }}>
            {/* Phone and Email wrapper - stacked vertically, aligned left */}
            <div className="flex flex-col items-start" style={{ gap: '5px' }}>
              {/* Phone */}
              {selectedContact.phone && (
                <div className="flex items-center">
                  <span 
                    className="font-inter"
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      letterSpacing: '-0.01em',
                      color: '#202020',
                    }}
                  >
                    Phone:&nbsp;&nbsp;
                  </span>
                  <span 
                    className="font-inter"
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      letterSpacing: '-0.01em',
                      color: '#4B4B4B',
                    }}
                  >
                    {selectedContact.phone}
                  </span>
                </div>
              )}
              
              {/* Email */}
              {selectedContact.email && (
                <div className="flex items-center">
                  <span 
                    className="font-inter"
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      letterSpacing: '-0.01em',
                      color: '#202020',
                    }}
                  >
                    Email:&nbsp;&nbsp;
                  </span>
                  <span 
                    className="font-inter"
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      letterSpacing: '-0.01em',
                      color: '#4B4B4B',
                    }}
                  >
                    {selectedContact.email}
                  </span>
                </div>
              )}
              
              {/* Notes */}
              {selectedContact.notes && (
                <span 
                  className="font-inter"
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                    color: 'rgb(75, 75, 75)',
                    lineHeight: '1.4',
                    marginTop: '15px',
                  }}
                >
                  {selectedContact.notes.length > 60 ? selectedContact.notes.substring(0, 60) + '...' : selectedContact.notes}
                </span>
              )}
            </div>
            
            {/* Company */}
            {companyName && (
              <span 
                className="font-inter"
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                  color: '#4B4B4B',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                }}
              >
                {companyName}
              </span>
            )}
          </div>
          
          {/* Buttons wrapper */}
          <div className="flex items-center" style={{ gap: '5px' }}>
            <IconButton
              onClick={() => {
                setPage('search')
                setIsModalOpen(true)
              }}
              title="Replace contact"
            >
              <Repeat style={{ color: '#202020' }} />
            </IconButton>
            <IconButton
              onClick={handleEditContact}
              title="Edit contact"
            >
              <Pencil style={{ color: '#202020' }} />
            </IconButton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {selectedContact ? (
        <ContactCard />
      ) : (
        <Button variant="white" className="px-[25px]" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          Add contact
        </Button>
      )}

      {isModalOpen && (
        <Modal
          title="Select or Add Contact"
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
                    Select a contact
                  </h2>
                  <div style={{ flex: 1, minHeight: 0 }}>
                    <SearchPanel 
                      items={contacts}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      onSelect={handleSelectContact}
                      selectedId={pendingSelection?.id}
                      loading={loading}
                      error={error}
                      placeholder="Search by first or last name"
                      emptyMessage="No contacts found"
                      loadingMessage="Loading contacts..."
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center gap-2" style={{ marginTop: 'auto', flexShrink: 0 }}>
                  <Button variant="white" onClick={() => {
                    const { firstName, lastName } = parseNameFromQuery(searchQuery)
                    setNewContact(prev => ({
                      ...prev,
                      firstName,
                      lastName,
                    }))
                    setPage('create')
                  }}>
                    <UserRound size={16} />
                    {buttonText}
                  </Button>
                  <div className="flex gap-2">
                    <Modal.CancelButton
                      onClick={() => {
                        setPendingSelection(null)
                        setPage('search')
                      }}
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
              </div>
            )}

            {page === 'create' && (
              <div className="modal-page flex flex-col" style={{ flex: 1, minHeight: 0 }}>
                <div className="flex flex-col" style={{ gap: '20px', flex: 1, minHeight: 0 }}>
                  <h2 className="font-sans text-lg tracking-[-0.01em] font-medium text-black" style={{ flexShrink: 0 }}>
                    Add contact
                  </h2>

                  <div className="flex flex-col" style={{ gap: '20px', flex: 1, minHeight: 0, overflowY: 'auto' }}>
                    {/* First Name / Last Name */}
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="First Name *"
                        placeholder="John"
                        value={newContact.firstName}
                        onChange={handleNewContactChange('firstName')}
                        required
                      />
                      <Input
                        label="Last Name"
                        placeholder="Smith"
                        value={newContact.lastName}
                        onChange={handleNewContactChange('lastName')}
                      />
                    </div>

                    {/* Email / Phone */}
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Email"
                        type="email"
                        placeholder="john.s@gmail.com"
                        value={newContact.email}
                        onChange={handleNewContactChange('email')}
                      />
                      <Input
                        label="Phone *"
                        type="tel"
                        placeholder="+1 (324) 432-4321"
                        value={newContact.phone}
                        onChange={handleNewContactChange('phone')}
                        required
                      />
                    </div>

                    {/* Title / Preferred contact method */}
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Title"
                        placeholder="e.g. Property Manager"
                        value={newContact.title}
                        onChange={handleNewContactChange('title')}
                      />
                      <Select
                        label="Preferred contact method"
                        options={preferredContactMethodOptions}
                        value={newContact.preferredContactMethod}
                        onChange={(value) => setNewContact(prev => ({ ...prev, preferredContactMethod: value }))}
                        placeholder="Select method"
                      />
                    </div>

                    {/* Notes */}
                    <Input
                      label="Notes"
                      type="textarea"
                      placeholder="Add notes about this contact..."
                      value={newContact.notes}
                      onChange={handleNewContactChange('notes')}
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

                {/* Save and Cancel Buttons */}
                <div className="flex justify-end gap-2" style={{ marginTop: 'auto', flexShrink: 0 }}>
                  <Button 
                    variant="white" 
                    onClick={() => { setPage('search'); setSaveError(null); }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="dark" 
                    onClick={handleSaveContact} 
                    disabled={saving || !newContact.firstName.trim() || !newContact.phone.trim()}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            )}

            {page === 'edit' && (
              <div className="modal-page flex flex-col" style={{ flex: 1, minHeight: 0 }}>
                <div className="flex flex-col" style={{ gap: '20px', flex: 1, minHeight: 0 }}>
                  <h2 className="font-sans text-lg tracking-[-0.01em] font-medium text-black" style={{ flexShrink: 0 }}>
                    Edit contact
                  </h2>

                  <div className="flex flex-col" style={{ gap: '20px', flex: 1, minHeight: 0, overflowY: 'auto' }}>
                    {/* First Name / Last Name */}
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="First Name *"
                        placeholder="John"
                        value={newContact.firstName}
                        onChange={handleNewContactChange('firstName')}
                        required
                      />
                      <Input
                        label="Last Name"
                        placeholder="Smith"
                        value={newContact.lastName}
                        onChange={handleNewContactChange('lastName')}
                      />
                    </div>

                    {/* Email / Phone */}
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Email"
                        type="email"
                        placeholder="john.s@gmail.com"
                        value={newContact.email}
                        onChange={handleNewContactChange('email')}
                      />
                      <Input
                        label="Phone *"
                        type="tel"
                        placeholder="+1 (324) 432-4321"
                        value={newContact.phone}
                        onChange={handleNewContactChange('phone')}
                        required
                      />
                    </div>

                    {/* Title / Preferred contact method */}
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Title"
                        placeholder="e.g. Property Manager"
                        value={newContact.title}
                        onChange={handleNewContactChange('title')}
                      />
                      <Select
                        label="Preferred contact method"
                        options={preferredContactMethodOptions}
                        value={newContact.preferredContactMethod}
                        onChange={(value) => setNewContact(prev => ({ ...prev, preferredContactMethod: value }))}
                        placeholder="Select method"
                      />
                    </div>

                    {/* Notes */}
                    <Input
                      label="Notes"
                      type="textarea"
                      placeholder="Add notes about this contact..."
                      value={newContact.notes}
                      onChange={handleNewContactChange('notes')}
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
                    onClick={handleUpdateContact} 
                    disabled={saving || !newContact.firstName.trim() || !newContact.phone.trim()}
                  >
                    {saving ? 'Updating...' : 'Update contact'}
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

export default ContactSelect

