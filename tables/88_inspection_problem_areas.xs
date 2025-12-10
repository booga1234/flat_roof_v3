table inspection_problem_areas {
  auth = false

  schema {
    // Unique identifier for the problem area
    uuid id
  
    // Foreign key reference to inspections
    uuid inspection_id {
      table = "inspections"
    }
  
    // Name or description of the problem area (e.g., 'North corner', 'Membrane tear near drain')
    text area_name? filters=trim
  
    // Location of the problem area (e.g., 'North side', 'Center of roof')
    text location? filters=trim
  
    // Notes about the problem area (membrane notes, concerns, etc.)
    text notes?
  
    // Severity level: 'minor', 'moderate', 'severe', 'critical'
    text severity? filters=trim
  
    // Display order for sorting problem areas
    int sort_order?
  
    // Timestamp when the problem area was created (ISO 8601 format)
    text created_at?
  
    // Timestamp when the problem area was last updated (ISO 8601 format)
    text updated_at?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "inspection_id", op: "asc"}]}
    {type: "btree", field: [{name: "severity", op: "asc"}]}
    {type: "btree", field: [{name: "sort_order", op: "asc"}]}
  ]
}