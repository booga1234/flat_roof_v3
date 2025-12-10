addon inspection_type {
  input {
    uuid inspection_types_id? {
      table = "inspection_types"
    }
  }

  stack {
    db.query inspection_types {
      where = $db.inspection_types.id == $input.inspection_types_id
      return = {type: "single"}
    }
  }
}