// Query all roof_access_types records
query roof_access_types verb=GET {
  auth = "user"

  input {
  }

  stack {
    db.query roof_access_types {
      return = {type: "list"}
    } as $model
  }

  response = $model
}