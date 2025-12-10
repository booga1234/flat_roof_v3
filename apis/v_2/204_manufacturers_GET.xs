// Get all manufacturers for dropdown selection
query manufacturers verb=GET {
  auth = "user"

  input {
  }

  stack {
    // Get all manufacturers sorted by name
    db.query manufacturers {
      sort = {manufacturers.name: "asc"}
      return = {type: "list"}
    } as $manufacturers
  }

  response = $manufacturers
  history = false
}