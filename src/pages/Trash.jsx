import { useState, useEffect } from 'react'
import NewPage from '../components/NewPage'
import Table from '../components/Table'
import UserAvatar from '../components/UserAvatar'
import { trashAPI } from '../utils/apiService'

function Trash() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTrashData()
  }, [])

  const fetchTrashData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await trashAPI.getAll()
      
      // Handle different response formats
      const items = Array.isArray(response) 
        ? response 
        : (response?.items || response?.data || response?.results || [])
      
      setData(items)
    } catch (err) {
      console.error('[Trash] Error fetching trash data:', err)
      setError(err.message || 'Failed to load trash data')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (item) => {
    // Permanently delete the item
    try {
      await trashAPI.permanentDelete(item.id)
      // Remove from local state
      setData(prev => prev.filter(d => d.id !== item.id))
    } catch (err) {
      console.error('[Trash] Error permanently deleting item:', err)
    }
  }

  const handleRestore = async (item) => {
    // Restore the item by calling the leads API endpoint
    try {
      const token = localStorage.getItem('authToken')
      const headers = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const url = `https://xayv-jjxe-ueqz.n7e.xano.io/api:9HFdwGZ-/leads/${item.id}`
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          is_deleted: false
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      await response.json()
      
      // Remove from local state
      setData(prev => prev.filter(d => d.id !== item.id))
    } catch (err) {
      console.error('[Trash] Error restoring item:', err)
      // Optionally show an error message to the user
      alert(`Failed to restore item: ${err.message}`)
    }
  }

  // Format date helper
  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    
    try {
      const date = new Date(timestamp)
      if (isNaN(date.getTime())) return ''
      
      const options = { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }
      return date.toLocaleString('en-US', options)
    } catch (error) {
      return ''
    }
  }

  // Get display name from contact associated with the lead
  const getDisplayName = (item) => {
    if (!item.contact) {
      return 'Not set'
    }
    
    const { first_name, last_name } = item.contact
    const fullName = `${first_name || ''} ${last_name || ''}`.trim()
    
    return fullName || 'Not set'
  }

  // Render updated by user with profile photo
  const renderUpdatedByUser = (value, row) => {
    return <UserAvatar user={row.updated_by_user} showName={true} size="medium" />
  }

  // Define table columns
  const columns = [
    {
      key: 'name',
      label: 'Name',
      width: '200px',
      render: (value, row) => getDisplayName(row),
    },
    {
      key: 'status',
      label: 'Type',
      width: '150px',
      render: (value) => 'lead',
    },
    {
      key: 'updated_by_user',
      label: 'Deleted By',
      width: '180px',
      render: renderUpdatedByUser,
    },
    {
      key: 'id',
      label: 'Dataset ID',
      render: (value) => (
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            fontWeight: 500,
            color: '#9A9A9A',
            letterSpacing: '-0.01em',
          }}
        >
          {value ? `${value.substring(0, 24)}...` : '—'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Deleted',
      width: '180px',
      render: (value, row) => formatDate(row.updated_at || value),
    },
  ]

  return (
    <NewPage>
      {/* Page Header */}
      <div
        className="flex flex-row items-center justify-between"
        style={{
          padding: '15px 18px',
          borderBottom: '1px solid #F3F3F3',
        }}
      >
        <h1
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '18px',
            fontWeight: 500,
            letterSpacing: '-0.01em',
            color: '#000000',
            margin: 0,
          }}
        >
          Trash
        </h1>
        {data.length > 0 && (
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: 500,
              color: '#9A9A9A',
            }}
          >
            {data.length} item{data.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div
          className="flex items-center justify-center"
          style={{ padding: '24px' }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              fontWeight: 500,
              color: '#C62828',
            }}
          >
            {error}
          </span>
        </div>
      )}

      {/* Table Content */}
      {!error && (
        <div
          className="flex-1 overflow-auto"
          style={{ minHeight: 0 }}
        >
          <Table
            columns={columns}
            data={data}
            loading={loading}
            emptyMessage="Trash is empty"
            onRestore={handleRestore}
            rowKey="id"
          />
        </div>
      )}
    </NewPage>
  )
}

export default Trash

