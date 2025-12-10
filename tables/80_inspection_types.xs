table inspection_types {
  auth = false

  schema {
    // Unique identifier for the inspection type
    uuid id
  
    // Inspection type name (e.g., 'Initial Inspection', 'Follow-up', 'Warranty')
    text name filters=trim
  
    // Description of what this inspection type entails
    text description?
  
    // Default duration in minutes for this inspection type
    int default_duration_minutes?
  
    // Whether this inspection type is currently active
    bool active?=true
  
    timestamp? created_at?=now
    timestamp? updated_at?=now
  }

  index = [{type: "primary", field: [{name: "id"}]}]
}