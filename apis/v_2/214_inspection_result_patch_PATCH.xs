query "inspection-result-patch" verb=PATCH {
  auth = "user"

  input {
    uuid id
    json data
  }

  stack {
    db.patch inspection_results {
      field_name = "id"
      field_value = $input.id
      data = merge($input.data, {updated_at: now()})
    } as $updated_result
  }

  response = $updated_result
}