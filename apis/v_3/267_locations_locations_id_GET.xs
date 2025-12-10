// Get locations record
query "locations/{locations_id}" verb=GET {
  auth = "user"

  input {
    uuid locations_id?
  }

  stack {
    db.get locations {
      field_name = "id"
      field_value = $input.locations_id
    } as $model
  
    precondition ($model != null) {
      error_type = "notfound"
      error = "Not Found"
    }
  }

  response = $model
}