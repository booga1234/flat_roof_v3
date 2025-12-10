// Query all lead_sources records
query lead_sources verb=GET {
  auth = "user"

  input {
  }

  stack {
    db.query lead_sources {
      return = {type: "list"}
    } as $model
  }

  response = $model
}