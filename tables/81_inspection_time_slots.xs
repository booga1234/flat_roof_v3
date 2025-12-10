table inspection_time_slots {
  auth = false

  schema {
    // Unique identifier for the time slot
    uuid id
  
    // Start time of the slot (e.g., '09:00:00' or '09:00')
    timestamp start_time
  
    // End time of the slot (e.g., '10:00:00' or '10:00')
    timestamp end_time
  
    // Recurrence pattern: 'daily', 'weekly', 'monthly', 'none' (for one-off slots)
    enum recurrence_pattern? {
      values = ["weekly", "monthly"]
    }
  
    json days_of_week?
  
    // Whether this slot is currently available for booking
    bool is_available?=true
  
    // Timestamp when the time slot was created (ISO 8601 format)
    timestamp created_at?=now
  
    // Timestamp when the time slot was last updated (ISO 8601 format)
    timestamp updated_at?=now
  
    uuid? location_id? {
      table = "locations"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "is_available", op: "asc"}]}
  ]
}