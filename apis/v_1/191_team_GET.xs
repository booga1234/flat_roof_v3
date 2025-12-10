query team verb=GET {
  auth = "user"

  input {
    uuid? id?
  }

  stack {
    db.get user {
      field_name = "id"
      field_value = $input.id
    } as $team
  }

  response = $team
}