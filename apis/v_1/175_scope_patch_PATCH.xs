query "scope-patch" verb=PATCH {
  auth = "user"

  input {
    json value?
    uuid? id?
  }

  stack {
    db.patch scopes {
      field_name = "id"
      field_value = $input.id
      data = $input.value
    } as $scopes1
  }

  response = $scopes1
}