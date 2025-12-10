table maintenance_types {
  auth = false

  schema {
    uuid id
    timestamp created_at?=now
  
    // Display name for humans to read
    text name? filters=trim
  
    // Used internally for linking
    text slug? filters=trim
  
    // What the plan includes
    text description? filters=trim
  
    // Time record was updated
    timestamp? updated_at?=now
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}