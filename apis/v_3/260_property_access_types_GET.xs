// Query all property_access_types records
query property_access_types verb=GET {
  auth = "user"

  input {
  }

  stack {
    db.query property_access_types {
      return = {type: "list"}
    } as $model
  }

  response = $model
}