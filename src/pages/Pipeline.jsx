import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import Card from '../components/Card'
import LabelText from '../components/LabelText'
import { API_V2_BASE_URL } from '../config/api'

function Pipeline() {
  const [pipelineData, setPipelineData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPipelineData()
  }, [])

  const fetchPipelineData = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setError('Please log in to view the pipeline')
        setLoading(false)
        return
      }

      const response = await fetch(`${API_V2_BASE_URL}/jobs-pipeline`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch pipeline data')
      }

      const data = await response.json()
      setPipelineData(data)
    } catch (err) {
      setError(err.message || 'An error occurred while fetching pipeline data')
      console.error('Pipeline fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Format stage name from snake_case to Title Case
  const formatStageName = (name) => {
    if (!name) return ''
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  // Format full address from location object
  const formatFullAddress = (location) => {
    if (!location) return ''
    
    // Try to use address field first
    if (location.address) return location.address
    
    // Otherwise construct from individual fields
    const parts = []
    if (location.street_address) parts.push(location.street_address)
    if (location.city) parts.push(location.city)
    if (location.state) parts.push(location.state)
    if (location.zip_code || location.zip) parts.push(location.zip_code || location.zip)
    
    return parts.length > 0 ? parts.join(', ') : ''
  }

  // Group jobs by stage
  const getJobsByStage = (stageId) => {
    if (!pipelineData || !pipelineData.jobs) return []
    return pipelineData.jobs.filter(job => job.stage?.id === stageId)
  }

  // Sort stages by order
  const getSortedStages = () => {
    if (!pipelineData || !pipelineData.stages) return []
    return [...pipelineData.stages].sort((a, b) => {
      const orderA = a.order || 0
      const orderB = b.order || 0
      return orderA - orderB
    })
  }

  // Handle drag end - update job stage
  const handleDragEnd = async (result) => {
    if (!result) return
    
    const { destination, source, draggableId } = result

    // If dropped outside a droppable area, do nothing
    if (!destination) return

    // If dropped in the same position, do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const jobId = draggableId
    const newStageId = destination.droppableId
    const oldStageId = source.droppableId

    // If dropped in the same stage, do nothing
    if (newStageId === oldStageId) return

    // Optimistically update the UI
    const updatedJobs = pipelineData.jobs.map((job) => {
      if (String(job.id) === jobId) {
        // Find the new stage object - handle both string and number IDs
        const newStage = pipelineData.stages.find((s) => String(s.id) === newStageId)
        return {
          ...job,
          stage: newStage ? { id: newStage.id, ...newStage } : job.stage,
        }
      }
      return job
    })

    setPipelineData({
      ...pipelineData,
      jobs: updatedJobs,
    })

    // Update the job stage via API
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const response = await fetch(`${API_V2_BASE_URL}/job-patch`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: jobId,
          data: {
            stage: isNaN(newStageId) ? newStageId : parseInt(newStageId),
          },
        }),
      })

      if (!response.ok) {
        // If API call fails, revert the optimistic update
        fetchPipelineData()
        throw new Error('Failed to update job stage')
      }
    } catch (err) {
      console.error('Error updating job stage:', err)
      // Revert to original data
      fetchPipelineData()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-fg2">Loading pipeline...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (!pipelineData) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-fg2">No pipeline data available</div>
      </div>
    )
  }

  const sortedStages = getSortedStages()

  // Safety check
  if (!sortedStages || sortedStages.length === 0) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-fg2">No stages available</div>
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="h-screen bg-bg overflow-hidden">
        <div 
          className="h-full overflow-x-auto overflow-y-auto"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <style>{`
            div::-webkit-scrollbar {
              width: 0;
              height: 0;
            }
          `}</style>
          <div className="flex flex-row gap-[1.5rem] h-full">
            {sortedStages.map((stage) => {
              const stageJobs = getJobsByStage(stage.id)
              return (
                <Droppable key={String(stage.id)} droppableId={String(stage.id)}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex flex-col w-[300px] flex-shrink-0 p-[1.5rem]"
                    >
                      <div className="flex items-center justify-between mb-4 px-2">
                        <LabelText>{formatStageName(stage.name)}</LabelText>
                        <LabelText>{stageJobs.length}</LabelText>
                      </div>
                      <div className="flex flex-col gap-2 min-h-[100px]">
                        {stageJobs.map((job, index) => (
                          <Draggable 
                            key={String(job.id)} 
                            draggableId={String(job.id)} 
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  opacity: snapshot.isDragging ? 0.8 : 1,
                                }}
                              >
                                <Card className="w-64 h-32 flex flex-col">
                                  <div className="flex flex-col gap-[0.2rem]">
                                    <LabelText className="font-bold text-base text-fg">
                                      {job.location?.street_address 
                                        ? job.location.street_address.replace(/\s/g, '').substring(0, 8) 
                                        : 'No Address'}
                                    </LabelText>
                                    <LabelText className="text-fg3 font-normal">
                                      {job.contact?.name || job.client?.name || 'Unknown'}
                                    </LabelText>
                                  </div>
                                  <LabelText className="mt-auto text-fg3 font-normal">
                                    {formatFullAddress(job.location)}
                                  </LabelText>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              )
            })}
          </div>
        </div>
      </div>
    </DragDropContext>
  )
}

export default Pipeline

