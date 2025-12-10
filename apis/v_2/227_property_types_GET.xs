query "property-types" verb=GET {
  auth = "user"

  input {
  }

  stack {
    db.query property_types {
      sort = {property_types.name: "asc"}
      return = {type: "list"}
    } as $property_types
  }

  response = $property_types
}