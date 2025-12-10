query vendors verb=GET {
  auth = "user"

  input {
  }

  stack {
    db.query vendors {
      sort = {vendors.name: "asc"}
      return = {type: "list"}
      output = [
        "id"
        "name"
        "email"
        "phone"
        "default_terms"
        "notes"
        "created_at"
        "updated_at"
      ]
    } as $vendors
  }

  response = {vendors: $vendors}
}