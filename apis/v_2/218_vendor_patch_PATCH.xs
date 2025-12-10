query "vendor-patch" verb=PATCH {
  auth = "user"

  input {
    uuid id
    json data
  }

  stack {
    db.patch vendors {
      field_name = "id"
      field_value = $input.id
      data = merge($input.data, {updated_at: now()})
    } as $updated_vendor
  }

  response = $updated_vendor
}