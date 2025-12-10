// Get leads record
query "leads/{leads_id}" verb=GET {
  auth = "user"

  input {
    uuid leads_id?
  }

  stack {
    db.get leads {
      field_name = "id"
      field_value = $input.leads_id
    } as $model
  
    precondition ($model != null) {
      error_type = "notfound"
      error = "Not Found"
    }
  }

  response = $model
}