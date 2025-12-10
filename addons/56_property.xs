addon property {
  input {
    uuid properties_id? {
      table = "properties"
    }
  }

  stack {
    db.query properties {
      where = $db.properties.id == $input.properties_id
      return = {type: "single"}
    }
  }
}