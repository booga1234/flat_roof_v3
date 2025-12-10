// Get user record
query "user/{user_id}" verb=GET {
  auth = "user"

  input {
    uuid user_id?
  }

  stack {
    db.get user {
      field_name = "id"
      field_value = $input.user_id
    } as $model
  
    precondition ($model != null) {
      error_type = "notfound"
      error = "Not Found"
    }
  }

  response = $model
}