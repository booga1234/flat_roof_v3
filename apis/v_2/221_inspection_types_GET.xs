query "inspection-types" verb=GET {
  auth = "user"

  input {
  }

  stack {
    db.query inspection_types {
      sort = {inspection_types.sort_order: "asc"}
      return = {type: "list"}
      output = [
        "id"
        "name"
        "description"
        "default_duration_minutes"
        "sort_order"
        "active"
        "created_at"
        "updated_at"
      ]
    } as $inspection_types
  }

  response = {inspection_types: $inspection_types}
}