import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, User } from 'lucide-react'
import Input from '../components/Input'
import Select from '../components/Select'
import Button from '../components/Button'
import NewPage from '../components/NewPage'
import LabelText from '../components/LabelText'
import TwoColumnLayout from '../components/TwoColumnLayout'
import NoDataFound from '../components/NoDataFound'

function Leads() {
  const [selectedLead, setSelectedLead] = useState(0) // Index of selected lead
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'New',
    source: '',
    notes: ''
  })

  const isInitializingRef = useRef(false)

  const statusOptions = [
    { value: 'New', label: 'New' },
    { value: 'Contacted', label: 'Contacted' },
    { value: 'Qualified', label: 'Qualified' },
    { value: 'Converted', label: 'Converted' },
    { value: 'Lost', label: 'Lost' }
  ]

  const sourceOptions = [
    { value: 'Website', label: 'Website' },
    { value: 'Referral', label: 'Referral' },
    { value: 'Social Media', label: 'Social Media' },
    { value: 'Advertisement', label: 'Advertisement' },
    { value: 'Other', label: 'Other' }
  ]

  // Update form data when lead changes
  const currentLead = leads.length > 0 ? (leads[selectedLead] || leads[0]) : null

  useEffect(() => {
    isInitializingRef.current = true
    if (currentLead) {
      setFormData({
        name: currentLead.name || '',
        email: currentLead.email || '',
        phone: currentLead.phone || '',
        status: currentLead.status || 'New',
        source: currentLead.source || '',
        notes: currentLead.notes || ''
      })
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        status: 'New',
        source: '',
        notes: ''
      })
    }
    // Allow updates after a brief delay
    setTimeout(() => {
      isInitializingRef.current = false
    }, 100)
  }, [selectedLead, leads])

  // Update lead in list when form data changes
  useEffect(() => {
    // Don't update when initializing form data from selected lead
    if (isInitializingRef.current || !currentLead || selectedLead < 0) {
      return
    }
    
    setLeads(prev => {
      const updated = [...prev]
      if (updated[selectedLead]) {
        updated[selectedLead] = {
          ...updated[selectedLead],
          ...formData
        }
      }
      return updated
    })
  }, [formData, currentLead, selectedLead])

  const handleInputChange = (field) => (e) => {
    const value = e.target ? e.target.value : e
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleStatusChange = (value) => {
    setFormData(prev => ({ ...prev, status: value }))
  }

  const handleSourceChange = (value) => {
    setFormData(prev => ({ ...prev, source: value }))
  }

  const handleCreate = () => {
    const newLead = {
      id: Date.now().toString(),
      name: '',
      email: '',
      phone: '',
      status: 'New',
      source: '',
      notes: '',
      createdAt: new Date().toISOString()
    }
    setLeads(prev => [...prev, newLead])
    setSelectedLead(leads.length)
    setFormData({
      name: '',
      email: '',
      phone: '',
      status: 'New',
      source: '',
      notes: ''
    })
  }

  const handleDelete = () => {
    if (!currentLead) return
    const newLeads = leads.filter((_, index) => index !== selectedLead)
    setLeads(newLeads)
    if (newLeads.length > 0) {
      setSelectedLead(Math.max(0, selectedLead - 1))
    } else {
      setSelectedLead(0)
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
        leftContent={
          <>
            {leads.length > 0 && (
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
                  Leads
                </span>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-8">
                <span style={{ color: '#676767', fontSize: '12px' }}>Loading leads...</span>
              </div>
            )}

            {!loading && leads.length === 0 && (
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
                      {lead.name || 'Unnamed Lead'}
                    </span>
                    <div
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: lead.status === 'New' ? '#E3F2FD' : 
                                        lead.status === 'Contacted' ? '#FFF3E0' :
                                        lead.status === 'Qualified' ? '#E8F5E9' :
                                        lead.status === 'Converted' ? '#C8E6C9' : '#FFEBEE',
                        color: lead.status === 'New' ? '#1976D2' :
                               lead.status === 'Contacted' ? '#F57C00' :
                               lead.status === 'Qualified' ? '#388E3C' :
                               lead.status === 'Converted' ? '#2E7D32' : '#C62828',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '11px',
                        fontWeight: 500,
                        letterSpacing: '-0.01em'
                      }}
                    >
                      {lead.status}
                    </div>
                  </div>
                  {lead.email && (
                    <div className="flex flex-row items-center w-full">
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#4B4B4B',
                          letterSpacing: '-0.01em'
                        }}
                      >
                        {lead.email}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        }
        rightContent={
          <div
            className="flex flex-col"
            style={{
              maxWidth: currentLead ? '50rem' : 'none',
              margin: '0',
              gap: '30px',
              height: '100%',
              minHeight: '100%'
            }}
          >
            {!currentLead && !loading && (
              <div 
                className="flex items-center justify-center flex-1" 
                style={{ 
                  width: '100%'
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
            )}

            {currentLead && (
              <>
                {/* Name */}
                <div className="flex flex-col gap-4">
                  <Input
                    label={<LabelText>Name</LabelText>}
                    value={formData.name}
                    onChange={handleInputChange('name')}
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-4">
                  <Input
                    label={<LabelText>Email</LabelText>}
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    type="email"
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-4">
                  <Input
                    label={<LabelText>Phone</LabelText>}
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    type="tel"
                  />
                </div>

                {/* Status */}
                <div className="flex flex-col gap-4">
                  <Select
                    label={<LabelText>Status</LabelText>}
                    options={statusOptions}
                    value={formData.status}
                    onChange={handleStatusChange}
                  />
                </div>

                {/* Source */}
                <div className="flex flex-col gap-4">
                  <Select
                    label={<LabelText>Source</LabelText>}
                    options={sourceOptions}
                    value={formData.source}
                    onChange={handleSourceChange}
                  />
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-4">
                  <Input
                    label={<LabelText>Notes</LabelText>}
                    value={formData.notes}
                    onChange={handleInputChange('notes')}
                    type="textarea"
                  />
                </div>

                {/* Delete Button */}
                <div className="flex flex-row items-center gap-2">
                  <Button
                    variant="white"
                    onClick={handleDelete}
                  >
                    <Trash2 size={12} style={{ color: '#000000' }} />
                  </Button>
                </div>
              </>
            )}
          </div>
        }
      />
    </NewPage>
  )
}

export default Leads
