table property_types {
  auth = false

  schema {
    // Unique identifier
    uuid id
  
    // Human-friendly property type name
    text name
  
    // Stable internal name
    text slug
  
    // Whether this type is selectable
    bool active?=true
  
    // Record creation time
    timestamp created_at?=now
  
    // Last update time
    timestamp updated_at?=now
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "slug", op: "asc"}]}
    {type: "btree", field: [{name: "active", op: "asc"}]}
  ]
}