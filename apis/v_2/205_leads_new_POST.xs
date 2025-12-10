query "leads-new" verb=POST {
  auth = "user"

  input {
    text Name
    text? email
    text? phone
    uuid? property_id
    text? address
    text? status
    uuid? lead_source_id
    text? notes
    text? internal_notes
    uuid? assigned_to_id
  }

  stack {
    db.add leads {
      data = {
        Name          : $input.Name
        email         : $input.email
        phone         : $input.phone
        property_id   : $input.property_id
        address       : $input.address
        status        : $input.status || "new"
        lead_source_id: $input.lead_source_id
        notes         : $input.notes
        internal_notes: $input.internal_notes
        assigned_to_id: $input.assigned_to_id
        created_at    : now()
        updated_at    : now()
      }
    } as $new_lead
  }

  response = $new_lead
}