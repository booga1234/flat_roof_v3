query contact verb=GET {
  auth = "user"

  input {
    uuid? id?
  }

  stack {
    db.get contacts {
      field_name = "id"
      field_value = $input.id
    } as $contact
  }

  response = $contact
}