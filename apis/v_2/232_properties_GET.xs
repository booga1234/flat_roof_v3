query properties verb=GET {
  auth = "user"

  input {
  }

  stack {
    db.query properties {
      sort = {properties.created_at: "desc"}
      return = {type: "list"}
      output = [
        "id"
        "address"
        "street_address"
        "full_address"
        "formatted_address"
        "location_address"
        "city"
        "state"
        "postal_code"
        "country"
        "property_type_id"
        "created_at"
        "updated_at"
      ]
    } as $properties
  }

  response = $properties
}