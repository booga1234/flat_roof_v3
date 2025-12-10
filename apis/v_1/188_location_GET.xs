query location verb=GET {
  auth = "user"

  input {
    uuid? id?
  }

  stack {
    db.get "" {
      field_name = "id"
      field_value = $input.id
    } as $location
  }

  response = $location
}