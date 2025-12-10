query update_user verb=POST {
  auth = "user"

  input {
    json data?
    uuid? user_id?
  }

  stack {
    db.patch user {
      field_name = "id"
      field_value = $input.user_id
      data = $input.data
    } as $users1
  }

  response = $users1
}