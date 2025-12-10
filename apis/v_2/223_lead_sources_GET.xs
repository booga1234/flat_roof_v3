query "lead-sources" verb=GET {
  auth = "user"

  input {
  }

  stack {
    db.query lead_sources {
      sort = {lead_sources.sort_order: "asc"}
      return = {type: "list"}
      output = [
        "id"
        "name"
        "description"
        "sort_order"
        "active"
        "created_at"
        "updated_at"
      ]
    } as $lead_sources
  }

  response = {lead_sources: $lead_sources}
}