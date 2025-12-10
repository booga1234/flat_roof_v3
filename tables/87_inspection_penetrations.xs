table inspection_penetrations {
  auth = false

  schema {
    // Unique identifier for the penetration record
    uuid id
  
    // Foreign key reference to inspections
    uuid inspection_id {
      table = "inspections"
    }
  
    // Side of the building: 'north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest', 'center', 'other'
    text side filters=trim
  
    // Number of pipes on this side
    int pipes_count?
  
    // Number of vents on this side
    int vents_count?
  
    // Number of skylights on this side
    int skylights_count?
  
    // Additional notes about penetrations on this side
    text notes?
  
    // Timestamp when the penetration record was created (ISO 8601 format)
    text created_at?
  
    // Timestamp when the penetration record was last updated (ISO 8601 format)
    text updated_at?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "inspection_id", op: "asc"}]}
    {type: "btree", field: [{name: "side", op: "asc"}]}
    {
      type : "btree"
      field: [
        {name: "inspection_id", op: "asc"}
        {name: "side", op: "asc"}
      ]
    }
  ]
}