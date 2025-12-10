query "lead-patch" verb=PATCH {
  auth = "user"

  input {
    uuid id
    json data
  }

  stack {
    db.patch leads {
      field_name = "id"
      field_value = $input.id
      data = $input.data
    } as $updated_lead
  }

  response = $updated_lead
}