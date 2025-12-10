table roof_types {
  auth = false

  schema {
    uuid id
    timestamp created_at?=now
  
    // The human-readable display name.
    text name? filters=trim
  
    // Used internally for clean references and merging data.
    text slug? filters=trim
  
    int typical_lifespan_years?
  
    // Timestamps for auditing.
    timestamp updated_at?=now
  
    uuid? recommended_maintenance_id? {
      table = "maintenance_types"
    }
  
    uuid? common_issues_id? {
      table = "common_issues"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}