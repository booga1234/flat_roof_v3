query contact verb=PATCH {
  auth = "user"

  input {
    uuid? id?
    json data?
  }

  stack {
    db.patch contacts {
      field_name = "id"
      field_value = $input.id
      data = $input.data
    } as $contacts1
  }

  response = $contacts1
}