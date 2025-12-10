query inspections verb=GET {
  auth = "user"

  input {
  }

  stack {
    db.query inspections {
      sort = {inspections.scheduled_start_time: "desc"}
      return = {type: "list"}
      output = [
        "id"
        "lead_id"
        "job_id"
        "inspection_type_id"
        "inspector_id"
        "status"
        "scheduled_start_time"
        "scheduled_end_time"
        "actual_start_time"
        "actual_end_time"
        "property_id"
        "location_address"
        "company_name"
        "customer_name"
        "customer_phone"
        "customer_email"
        "roof_accessible"
        "reason_for_inspection"
        "person_present"
        "notes"
        "internal_notes"
        "estimated_duration_minutes"
        "requires_follow_up"
        "follow_up_inspection_id"
        "created_at"
        "updated_at"
      ]
    } as $inspections
  }

  response = {inspections: $inspections}
}