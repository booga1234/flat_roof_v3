table inspection_drains {
  auth = false

  schema {
    // Unique identifier for the drain record
    uuid id
  
    // Foreign key reference to inspections
    uuid inspection_id {
      table = "inspections"
    }
  
    // Side of the building: 'north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest', 'center', 'other'
    text side filters=trim
  
    // Number of drains on this side
    int drains_count?
  
    // Number of scuppers on this side
    int scuppers_count?
  
    // Number of downspouts on this side
    int downspouts_count?
  
    // Additional notes about drains on this side
    text notes?
  
    // Timestamp when the drain record was created (ISO 8601 format)
    text created_at?
  
    // Timestamp when the drain record was last updated (ISO 8601 format)
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