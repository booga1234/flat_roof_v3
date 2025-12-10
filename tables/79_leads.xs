table leads {
  auth = false

  schema {
    // Unique identifier for the lead
    uuid id
  
    // Timestamp when the lead was created (ISO 8601 format)
    timestamp created_at?=now
  
    // Timestamp when the lead was last updated (ISO 8601 format)
    timestamp updated_at?=now
  
    enum status? {
      values = ["new", "in_progress", "converted", "closed_no_action"]
    }
  
    text problem_description? filters=trim
    text intake_notes? filters=trim
    uuid? contact_id? {
      table = "contacts"
    }
  
    uuid? organization_id? {
      table = "organizations"
    }
  
    uuid? property_id? {
      table = "properties"
    }
  
    uuid? lead_source_id? {
      table = "lead_sources"
    }
  
    uuid? lead_reason_id? {
      table = "lead_reasons"
    }
  
    uuid? converted_job_id? {
      table = "jobs"
    }
  
    uuid? converted_by_user_id? {
      table = "user"
    }
  
    timestamp? converted_at?
    uuid? inspection_id? {
      table = "inspections"
    }
  
    uuid? location_id? {
      table = "locations"
    }
  
    uuid? created_by_user_id? {
      table = "user"
    }
  
    uuid? updated_by_user_id? {
      table = "user"
    }
  
    bool is_deleted?
  }

  index = [{type: "primary", field: [{name: "id"}]}]
}