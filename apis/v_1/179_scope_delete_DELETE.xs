query "scope-delete" verb=DELETE {
  auth = "user"

  input {
    uuid? id?
  }

  stack {
    db.del scopes {
      field_name = "id"
      field_value = $input.id
    }
  }

  response = $scopes1
}