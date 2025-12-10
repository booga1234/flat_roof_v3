table inspection_checklist {
  auth = false

  schema {
    // Unique identifier for the checklist item
    uuid id
  
    // Foreign key reference to inspections
    uuid inspection_id {
      table = "inspections"
    }
  
    // Checklist item name (e.g., 'Take photo of front of building', 'Take 3-5 photos of general roof area')
    text checklist_item filters=trim
  
    // Whether this checklist item has been completed
    bool completed?
  
    // Notes about this checklist item
    text notes?
  
    // Timestamp when checklist item was completed (ISO 8601 format)
    text completed_at?
  
    // Team member who completed this checklist item
    uuid completed_by_id? {
      table = "user"
    }
  
    // Timestamp when the checklist item was created (ISO 8601 format)
    text created_at?
  
    // Timestamp when the checklist item was last updated (ISO 8601 format)
    text updated_at?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "inspection_id", op: "asc"}]}
    {type: "btree", field: [{name: "completed", op: "asc"}]}
  ]
}