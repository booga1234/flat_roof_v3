query leads verb=GET {
  auth = "user"

  input {
  }

  stack {
    db.query leads {
      sort = {lead.created_at: "desc"}
      return = {type: "list"}
      output = [
        "id"
        "first_name"
        "last_name"
        "email"
        "phone"
        "address"
        "property_id"
        "lead_source_id"
        "lead_reason_id"
        "assigned_to_id"
        "notes"
        "internal_notes"
        "created_at"
        "updated_at"
      ]
    } as $leads
  }

  response = {leads: $leads}
}