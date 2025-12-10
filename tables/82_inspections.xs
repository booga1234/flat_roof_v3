table inspections {
  auth = false

  schema {
    // Unique identifier for the inspection
    uuid id
  
    // Foreign key reference to lead table (for when someone calls)
    uuid lead_id? {
      table = "leads"
    }
  
    // Foreign key reference to jobs (nullable - inspections can be standalone)
    uuid? job_id? {
      table = "jobs"
    }
  
    // Foreign key reference to inspection_types
    uuid inspection_type_id {
      table = "inspection_types"
    }
  
    // Foreign key reference to team (assigned inspector)
    uuid? inspector_id? {
      table = "user"
    }
  
    // Inspection status: 'scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'
    enum? status {
      values = ["scheduled", "in_progress", "completed", "cancelled"]
    }
  
    // Scheduled start time for the inspection (ISO 8601 format)
    timestamp scheduled_start_time?
  
    // Scheduled end time for the inspection (ISO 8601 format)
    timestamp scheduled_end_time?
  
    // Actual start time (filled when inspection begins, ISO 8601 format)
    timestamp actual_start_time?
  
    // Actual end time (filled when inspection completes, ISO 8601 format)
    timestamp actual_end_time?
  
    // General notes about the inspection
    text notes?
  
    // Internal notes (not visible to customer)
    text internal_notes?
  
    // Estimated duration in minutes
    decimal estimated_duration_minutes?
  
    // Whether this inspection requires a follow-up
    bool requires_follow_up?
  
    // Reference to follow-up inspection if one was created
    uuid? follow_up_inspection_id? {
      table = "inspections"
    }
  
    // Timestamp when the inspection was created (ISO 8601 format)
    timestamp created_at?=now
  
    // Timestamp when the inspection was last updated (ISO 8601 format)
    timestamp updated_at?
  
    uuid? property_id? {
      table = "properties"
    }
  
    uuid? location_id? {
      table = "locations"
    }
  
    bool was_contact_present?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "lead_id", op: "asc"}]}
    {type: "btree", field: [{name: "job_id", op: "asc"}]}
    {
      type : "btree"
      field: [{name: "inspection_type_id", op: "asc"}]
    }
    {type: "btree", field: [{name: "inspector_id", op: "asc"}]}
  ]
}