table lead_reasons {
  auth = false

  schema {
    // Unique identifier
    uuid id
  
    // Name of the call reason
    text name
  
    // Internal machine name
    text slug
  
    // Detailed explanation for staff
    text description?
  
    // Whether this reason indicates urgent dispatch
    bool is_urgent?
  
    // Automatically create an inspection for this reason
    bool auto_create_inspection?
  
    // Whether this reason is selectable
    bool active?=true
  
    // Default priority value (1 = highest)
    int default_priority?=3
  
    // Record creation time
    timestamp created_at?=now
  
    // Record last update time
    timestamp updated_at?=now
  
    uuid? default_handler_role_id? {
      table = "user_roles"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "slug", op: "asc"}]}
    {type: "btree", field: [{name: "active", op: "asc"}]}
    {
      type : "btree"
      field: [{name: "default_handler_role_id", op: "asc"}]
    }
  ]
}