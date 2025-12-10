addon property_type {
  input {
    uuid property_types_id? {
      table = "property_types"
    }
  }

  stack {
    db.query property_types {
      where = $db.property_types.id == $input.property_types_id
      return = {type: "single"}
    }
  }
}