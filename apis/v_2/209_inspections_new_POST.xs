query "inspections-new" verb=POST {
  auth = "user"

  input {
    uuid? lead_id
    uuid? job_id
    uuid inspection_type_id
    uuid? inspector_id
    text status
    text? scheduled_start_time
    text? scheduled_end_time
    uuid? property_id
    text? location_address
    text? company_name
    text? customer_name
    text? customer_phone
    text? customer_email
    text? roof_accessible
    text? reason_for_inspection
    bool? person_present
    text? notes
    text? internal_notes
    decimal? estimated_duration_minutes
    bool? requires_follow_up
  }

  stack {
    db.add inspections {
      data = {
        lead_id                   : $input.lead_id
        job_id                    : $input.job_id
        inspection_type_id        : $input.inspection_type_id
        inspector_id              : $input.inspector_id
        status                    : $input.status || "scheduled"
        scheduled_start_time      : $input.scheduled_start_time
        scheduled_end_time        : $input.scheduled_end_time
        property_id               : $input.property_id
        location_address          : $input.location_address
        company_name              : $input.company_name
        customer_name             : $input.customer_name
        customer_phone            : $input.customer_phone
        customer_email            : $input.customer_email
        roof_accessible           : $input.roof_accessible
        reason_for_inspection     : $input.reason_for_inspection
        person_present            : $input.person_present
        notes                     : $input.notes
        internal_notes            : $input.internal_notes
        estimated_duration_minutes: $input.estimated_duration_minutes
        requires_follow_up        : $input.requires_follow_up || false
        created_at                : now()
        updated_at                : now()
      }
    } as $new_inspection
  }

  response = $new_inspection
}