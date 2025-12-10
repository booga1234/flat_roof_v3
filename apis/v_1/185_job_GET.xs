query job verb=GET {
  auth = "user"

  input {
    uuid? id?
  }

  stack {
    db.get jobs {
      field_name = "id"
      field_value = $input.id
    } as $job
  }

  response = $job
}