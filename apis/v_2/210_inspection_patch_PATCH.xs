query "inspection-patch" verb=PATCH {
  auth = "user"

  input {
    uuid id
    json data
  }

  stack {
    db.patch inspections {
      field_name = "id"
      field_value = $input.id
      data = merge($input.data, {updated_at: now()})
    } as $updated_inspection
  }

  response = $updated_inspection
}