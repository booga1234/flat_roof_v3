// Query all property_parking_conditions records
query property_parking_conditions verb=GET {
  auth = "user"

  input {
  }

  stack {
    db.query property_parking_conditions {
      return = {type: "list"}
    } as $model
  }

  response = $model
}