import { useState, useEffect, useRef, useCallback } from 'react'
import { Plus, ArrowLeft, User, Trash2, Pencil } from 'lucide-react'
import Button from './Button'
import Modal from './Modal'
import SearchPanel from './SearchPanel'
import Input from './Input'
import Select from './Select'
import { API_CONTACTS_BASE_URL } from '../config/api'

function ContactSelect({ id, onContactChange, onContactDelete }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [page, setPage] = useState('search') // 'search', 'create', or 'edit'
  const [editingContactId, setEditingContactId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedContact, setSelectedContact] = useState(null)
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
        method: 'POST',
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

  // Fetch single contact when id is provided
  useEffect(() => {
    if (id) {
      fetchSingleContact(id)
    } else {
      setSelectedContact(null)
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
      // Initial search will be triggered by the searchQuery useEffect
    } else {
      // Clear search and errors when modal closes
      setSearchQuery('')
      setSaveError(null)
      setEditingContactId(null)
    }
  }, [isModalOpen])

  const handleSelectContact = async (item) => {
    // Fetch the full contact details
    await fetchSingleContact(item.id)
    
    // Close the modal
    setIsModalOpen(false)
    
    // Notify parent of the change
    if (onContactChange) {
      onContactChange(item.id)
    }
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

  // Loading state for initial contact fetch
  if (loadingContact) {
    return (
      <div className="flex items-center justify-center py-4">
        <span className="text-sm text-gray-500">Loading contact...</span>
      </div>
    )
  }

  // Contact card component
  const ContactCard = () => {
    const fullName = `${selectedContact.first_name || ''} ${selectedContact.last_name || ''}`.trim() || 'Unknown'
    
    return (
      <div 
        className="contact-card flex flex-col"
        style={{ gap: '15px', padding: '0px' }}
      >
        {/* Top text wrapper - horizontal, center aligned, auto gap (space-between) */}
        <div className="flex items-center justify-between">
          {/* Top wrapper - horizontal, left aligned, gap 6px */}
          <div className="flex items-center" style={{ gap: '6px' }}>
            {/* Icon wrapper */}
            <div 
              className="flex items-center justify-center"
              style={{ 
                width: '22px', 
                height: '22px',
                borderRadius: '8px',
                padding: '5px',
                backgroundColor: '#ECECEC',
              }}
            >
              <User size={12} style={{ color: '#202020' }} />
            </div>
            
            {/* Heading text */}
            <span 
              className="font-inter"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: '#202020',
              }}
            >
              {fullName}
            </span>
          </div>
          
          {/* Buttons wrapper - gap 8px */}
          <div className="flex items-center" style={{ gap: '8px' }}>
            <button
              onClick={handleDeleteContact}
              className="hover:opacity-70 transition-opacity"
              title="Delete contact"
            >
              <Trash2 size={12} style={{ color: '#202020' }} />
            </button>
            <button
              onClick={handleEditContact}
              className="hover:opacity-70 transition-opacity"
              title="Edit contact"
            >
              <Pencil size={12} style={{ color: '#202020' }} />
            </button>
          </div>
        </div>
        
        {/* Bottom wrapper - horizontal, center aligned */}
        <div className="flex items-center" style={{ padding: '0px' }}>
          {/* Group - vertical, gap 5px (Role/Company) */}
          <div className="flex flex-col" style={{ gap: '5px', minWidth: '200px' }}>
            <span 
              className="font-inter"
              style={{
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                color: '#4B4B4B',
              }}
            >
              {selectedContact.title || formatContactType(selectedContact.contact_type)}
            </span>
            {selectedContact.organization?.name && (
              <span 
                className="font-inter"
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                  color: '#4B4B4B',
                }}
              >
                {selectedContact.organization.name}
              </span>
            )}
          </div>
          
          {/* Phone/Email - vertical, gap 5px */}
          <div className="flex flex-col" style={{ gap: '5px' }}>
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
          Select or Add Contact
        </Button>
      )}

      {isModalOpen && (
        <Modal
          title="Select or Add Contact"
          onClose={() => setIsModalOpen(false)}
        >
          <Modal.Pages>
            {page === 'search' && (
              <div className="modal-page-static flex flex-col">
                <h2
                  className="font-inter font-semibold"
                  style={{
                    fontSize: '24px',
                    color: '#282828',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Select a contact
                </h2>
                <div>
                  <SearchPanel 
                    items={contacts}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onSelect={handleSelectContact}
                    selectedId={selectedContact?.id}
                    loading={loading}
                    error={error}
                    placeholder="John"
                    emptyMessage="No contacts found"
                    loadingMessage="Loading contacts..."
                  />
                </div>
                <div style={{ height: '1px', backgroundColor: '#EAEAEA' }} />
                <div className="flex justify-end">
                  <Button variant="white" onClick={() => setPage('create')}>
                    <Plus size={16} />
                    {buttonText}
                  </Button>
                </div>
              </div>
            )}

            {page === 'create' && (
              <div className="modal-page flex flex-col" style={{ gap: '20px' }}>
                <Button variant="white" onClick={() => { setPage('search'); setSaveError(null); }}>
                  <ArrowLeft size={16} />
                  Back to search
                </Button>
                <h2
                  className="font-inter font-semibold"
                  style={{
                    fontSize: '24px',
                    color: '#282828',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Add contact
                </h2>

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

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button variant="dark" onClick={handleSaveContact} disabled={saving}>
                    {saving ? 'Saving...' : 'Save contact'}
                  </Button>
                </div>
              </div>
            )}

            {page === 'edit' && (
              <div className="modal-page flex flex-col" style={{ gap: '20px' }}>
                <h2
                  className="font-inter font-semibold"
                  style={{
                    fontSize: '24px',
                    color: '#282828',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Edit contact
                </h2>

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

                {/* Update Button */}
                <div className="flex justify-end">
                  <Button variant="dark" onClick={handleUpdateContact} disabled={saving}>
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

