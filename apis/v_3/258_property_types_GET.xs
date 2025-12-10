// Query all property_types records
query property_types verb=GET {
  auth = "user"

  input {
  }

  stack {
    db.query property_types {
      return = {type: "list"}
    } as $model
  }

  response = $model
}