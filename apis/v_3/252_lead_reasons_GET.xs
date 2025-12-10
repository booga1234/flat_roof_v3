// Query all lead_reasons records
query lead_reasons verb=GET {
  auth = "user"

  input {
  }

  stack {
    db.query lead_reasons {
      return = {type: "list"}
    } as $model
  }

  response = $model
}