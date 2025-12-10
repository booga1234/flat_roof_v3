// Query all roof_types records
query roof_types verb=GET {
  auth = "user"

  input {
  }

  stack {
    db.query roof_types {
      return = {type: "list"}
    } as $model
  }

  response = $model
}