table inspection_results {
  auth = false

  schema {
    // Unique identifier for the inspection result
    uuid id
  
    // Foreign key reference to inspections
    uuid inspection_id {
      table = "inspections"
    }
  
    // Overall condition assessment (e.g., 'Good', 'Fair', 'Poor', 'Critical')
    text overall_condition?
  
    // Decking type: 'wood', 'metal', 'concrete'
    text decking_type? filters=trim
  
    // Insulation under or above decking: 'under', 'above', 'both', 'none'
    text insulation_location? filters=trim
  
    // Best option(s) as JSON array: ['Repairs', 'Restoration', 'Overlay', 'Tear Off']
    json best_options?
  
    // Offer maintenance option
    bool offer_maintenance?
  
    // Detailed findings from the inspection
    text findings?
  
    // Recommendations based on inspection findings
    text recommendations?
  
    // Space for additional notes
    text additional_notes?
  
    // Whether repairs are needed
    bool requires_repair?
  
    // Whether replacement is needed
    bool requires_replacement?
  
    // Estimated cost for repairs if needed
    decimal estimated_repair_cost?
  
    // Weather conditions during inspection
    text weather_conditions? filters=trim
  
    // Temperature in Fahrenheit during inspection
    decimal temperature_fahrenheit?
  
    // JSON array of damage areas found (e.g., [{'area': 'North side', 'severity': 'moderate'}])
    json damage_areas?
  
    // Recommended next steps
    text next_steps?
  
    // Timestamp when results were finalized (ISO 8601 format)
    text completed_at?
  
    // Team member who completed/finalized the results
    uuid completed_by_id? {
      table = "user"
    }
  
    // Timestamp when the result was created (ISO 8601 format)
    text created_at?
  
    // Timestamp when the result was last updated (ISO 8601 format)
    text updated_at?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {
      type : "btree|unique"
      field: [{name: "inspection_id", op: "asc"}]
    }
    {
      type : "btree"
      field: [{name: "requires_repair", op: "asc"}]
    }
  ]
}