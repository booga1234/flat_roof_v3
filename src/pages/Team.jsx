import { useState, useEffect, useRef } from 'react'
import { API_V2_BASE_URL } from '../config/api'
import Select from '../components/Select'
import Input from '../components/Input'
import Textarea from '../components/Textarea'
import Button from '../components/Button'
import { UserPlus } from 'lucide-react'

function Team() {
  const [teamMembers, setTeamMembers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState({})
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [selectedRole, setSelectedRole] = useState(null)
  const [message, setMessage] = useState('')
  const modalRef = useRef(null)

  useEffect(() => {
    fetchTeamMembers()
    fetchRoles()
  }, [])

  const fetchTeamMembers = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setError('Please log in to view team members')
        setLoading(false)
        return
      }

      const response = await fetch(`${API_V2_BASE_URL}/team-members`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to fetch team members: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const members = Array.isArray(data) ? data : (data.users || data.team_members || data.data || [])
      console.log('Fetched team members:', members)
      // Log the role field format from the first member
      if (members.length > 0) {
        console.log('Sample member role:', {
          member: members[0],
          role: members[0].role,
          roleType: typeof members[0].role
        })
      }
      setTeamMembers(members)
    } catch (err) {
      const errorMessage = err.message || 'An error occurred while fetching team members'
      setError(errorMessage)
      console.error('Team fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const response = await fetch(`${API_V2_BASE_URL}/team-roles`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        const rolesList = Array.isArray(data) ? data : []
        console.log('Fetched roles:', rolesList)
        setRoles(rolesList)
      }
    } catch (err) {
      console.error('Error fetching roles:', err)
    }
  }

  const handleRoleChange = async (memberId, newRoleId) => {
    try {
      setUpdating(prev => ({ ...prev, [memberId]: true }))
      const token = localStorage.getItem('authToken')
      
      // The API now accepts UUID strings for role_id
      // Use the roleId directly (it should be the UUID from team_roles.id)
      let roleIdToSend = newRoleId
      
      // If it's a number (shouldn't happen but handle it), convert to string
      if (typeof newRoleId === 'number') {
        // Find the role to get its UUID
        const selectedRole = roles.find(r => r.role_id === newRoleId || r.id === newRoleId)
        if (selectedRole && selectedRole.id) {
          roleIdToSend = selectedRole.id
        } else {
          // Fallback: convert number to string (shouldn't be needed)
          roleIdToSend = String(newRoleId)
        }
      }
      
      // Validate that we have a valid role ID (should be a UUID string)
      if (!roleIdToSend || (typeof roleIdToSend !== 'string' && typeof roleIdToSend !== 'number')) {
        console.error('Invalid role ID:', {
          newRoleId,
          roleIdToSend,
          roles,
          roleOptions
        })
        throw new Error(`Invalid role ID: "${newRoleId}". Please select a valid role.`)
      }
      
      console.log('Sending role update request:', {
        team_member_id: memberId,
        role_id: String(roleIdToSend),
        memberIdType: typeof memberId,
        roleIdType: typeof roleIdToSend
      })

      const response = await fetch(`${API_V2_BASE_URL}/update-team-member-role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team_member_id: String(memberId), // UUID string - API now accepts UUIDs
          role_id: String(roleIdToSend), // UUID string
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          requestBody: {
            team_member_id: memberId,
            role_id: String(roleIdToSend)
          }
        })
        throw new Error(errorData.message || errorData.error || `Failed to update role: ${response.status} ${response.statusText}`)
      }

      // Update the local state
      setTeamMembers(prevMembers =>
        prevMembers.map(member =>
          member.id === memberId ? { ...member, role: newRoleId } : member
        )
      )
    } catch (err) {
      console.error('Error updating role:', err)
      alert(err.message || 'Failed to update role')
    } finally {
      setUpdating(prev => ({ ...prev, [memberId]: false }))
    }
  }

  const getInitials = (firstName, lastName) => {
    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase()
    }
    if (firstName) {
      return firstName[0].toUpperCase()
    }
    if (lastName) {
      return lastName[0].toUpperCase()
    }
    return 'U'
  }

  const getFullName = (firstName, lastName) => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    }
    return firstName || lastName || 'User'
  }

  const getRoleName = (roleId) => {
    if (!roleId) return 'Member'
    // Find role by UUID id
    const role = roles.find(r => r.id === roleId || String(r.id) === String(roleId))
    return role ? role.name : 'Member'
  }

  const getProfilePhoto = (member) => {
    return member['profile_photo.url'] || member.profile_photo?.url || member.profilePhoto || null
  }

  const handleSendInvite = () => {
    // TODO: Add API logic later
    console.log('Sending invite:', {
      emails: emailInput,
      role: selectedRole,
      message: message,
    })
    // Reset form and close modal
    setEmailInput('')
    setSelectedRole(null)
    setMessage('')
    setIsAddModalOpen(false)
  }

  const handleCancel = () => {
    setEmailInput('')
    setSelectedRole(null)
    setMessage('')
    setIsAddModalOpen(false)
  }

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleCancel()
      }
    }

    if (isAddModalOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isAddModalOpen])

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-fg mb-6">Team</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-fg2">Loading team members...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-fg mb-6">Team</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    )
  }

  // Map roles to options - use the UUID id directly since API accepts UUIDs
  const roleOptions = roles.map(role => ({
    value: role.id, // Use UUID id directly
    label: role.name,
  }))

  // Get role description (you can customize this based on your role data)
  const getRoleDescription = (roleId) => {
    if (!roleId) return 'Cannot change workspace settings or invite new members to the workspace.'
    // Find role by UUID id
    const role = roles.find(r => r.id === roleId || String(r.id) === String(roleId))
    // You can add role descriptions to your roles data later
    return 'Cannot change workspace settings or invite new members to the workspace.'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-fg">Team</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add members
        </Button>
      </div>

      {/* Add Members Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-bg3 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-fg" />
              </div>
              <h2 className="text-xl font-semibold font-inter text-fg">Add members</h2>
            </div>

            <p className="text-sm font-inter text-fg2 mb-6">
              Type or paste in emails below, separated by commas. Your workspace will be billed by members.
            </p>

            <div className="space-y-4 mb-6">
              <div className="w-full">
                <div className="flex flex-col gap-2 items-start w-full">
                  <input
                    type="text"
                    placeholder="Search names or emails"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="input-focus-outline flex flex-row items-center px-2 py-1.5 gap-2.5 w-full h-[27px] bg-white border borderInput rounded-lg outline-none focus:borderInput focus:ring-0 text-left shadow-[0_1px_2px_rgba(0,0,0,0.02)] font-inter font-medium text-[12px] placeholder:text-inputPlaceholder placeholder:font-medium"
                    style={{
                      boxSizing: 'border-box',
                      textAlign: 'left',
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <label className="text-xs font-medium font-inter text-fg">Select role</label>
                <div className="w-full" style={{ width: '100%' }}>
                  <div style={{ width: '100%' }}>
                    <Select
                      value={selectedRole}
                      options={roleOptions}
                      onChange={setSelectedRole}
                      placeholder="Member"
                      className="w-full"
                    />
                  </div>
                </div>
                {selectedRole && (
                  <p className="text-xs font-inter text-fg2 mt-1">
                    {getRoleDescription(selectedRole)}
                  </p>
                )}
              </div>

              <Textarea
                label="Message"
                placeholder="Add a note to your invite..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button variant="white" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="dark" onClick={handleSendInvite}>
                Send invite
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {teamMembers.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-fg2">No team members found.</div>
        </div>
      ) : (
        <div className="bg-white border borderInput rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-visible">
          <table className="w-full">
            <thead>
              <tr className="border-b borderInput">
                <th className="px-4 py-3 text-left text-xs font-medium font-inter text-fg2 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium font-inter text-fg2 uppercase tracking-wider">
                  Role
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divideInput">
              {teamMembers.map((member) => {
                const firstName = member.first_name || member.firstName || ''
                const lastName = member.last_name || member.lastName || ''
                const fullName = getFullName(firstName, lastName)
                const email = member.email || ''
                const profilePhoto = getProfilePhoto(member)
                // Get the current role (should be a UUID from team_roles.id)
                const memberRoleId = member.role || member.role_id || member.roleId
                
                // Use the member's role ID directly - it should match the UUID in roleOptions
                // If it doesn't match, try to find the matching role
                let currentRoleId = memberRoleId
                if (memberRoleId && !roleOptions.find(opt => opt.value === memberRoleId)) {
                  // If the member's role ID doesn't match any option, try to find it in roles
                  const matchingRole = roles.find(r => 
                    r.id === memberRoleId || 
                    String(r.id) === String(memberRoleId)
                  )
                  if (matchingRole) {
                    currentRoleId = matchingRole.id
                  } else {
                    // If still no match, set to null to show placeholder
                    currentRoleId = null
                  }
                }

                return (
                  <tr key={member.id} className="hover:bg-bg3 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {profilePhoto ? (
                          <img
                            src={profilePhoto}
                            alt={fullName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-bg3 flex items-center justify-center">
                            <span className="text-sm font-medium font-inter text-fg">
                              {getInitials(firstName, lastName)}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium font-inter text-fg">
                            {fullName}
                          </div>
                          <div className="text-xs font-inter text-fg2">
                            {email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-48">
                        <Select
                          value={currentRoleId}
                          options={roleOptions}
                          onChange={(newRoleId) => handleRoleChange(member.id, newRoleId)}
                          placeholder="Select role"
                          className=""
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Team
