query "property-view" verb=GET {
  auth = "user"

  input {
    // Property ID to retrieve
    text id
  }

  stack {
    db.query properties {
      where = $db.properties.id == $input.id
      return = {type: "single"}
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
    } as $property
  }

  response = $property
}