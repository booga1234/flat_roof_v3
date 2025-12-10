// Add leads record
query leads verb=POST {
  auth = "user"

  input {
    dblink {
      table = "leads"
    }
  }

  stack {
    db.add leads {
      data = {
        created_at          : $input.created_at
        updated_at          : $input.updated_at
        status              : $input.status
        problem_description : $input.problem_description
        intake_notes        : $input.intake_notes
        contact_id          : $input.contact_id
        organization_id     : $input.organization_id
        property_id         : $input.property_id
        lead_source_id      : $input.lead_source_id
        lead_reason_id      : $input.lead_reason_id
        converted_job_id    : $input.converted_job_id
        converted_by_user_id: $input.converted_by_user_id
        converted_at        : $input.converted_at
        created_by_user_id  : $input.created_by_user_id
        inspection_id       : $input.inspection_id
      }
    } as $model
  }

  response = $model
}