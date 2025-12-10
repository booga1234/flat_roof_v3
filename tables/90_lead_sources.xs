table lead_sources {
  auth = false

  schema {
    // Unique identifier for the lead source
    uuid id
  
    // Lead source name (e.g., 'Phone', 'Website', 'Referral', 'Walk-in', 'Social Media', 'Google Ads', 'Other')
    text name filters=trim
  
    // Description of the lead source
    text description?
  
    // Display order for sorting sources
    int sort_order?
  
    // Whether this lead source is currently active
    bool active?=true
  
    // Timestamp when the lead source was created (ISO 8601 format)
    timestamp created_at?=now
  
    // Timestamp when the lead source was last updated (ISO 8601 format)
    timestamp updated_at?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "sort_order", op: "asc"}]}
    {type: "btree", field: [{name: "active", op: "asc"}]}
    {type: "btree|unique", field: [{name: "name", op: "asc"}]}
  ]
}