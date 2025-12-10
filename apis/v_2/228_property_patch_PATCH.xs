query "property-patch" verb=PATCH {
  auth = "user"

  input {
    uuid id
    json data
  }

  stack {
    db.patch properties {
      field_name = "id"
      field_value = $input.id
      data = $input.data
    } as $updated_property
  }

  response = $updated_property
}