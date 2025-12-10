addon location {
  input {
    uuid locations_id? {
      table = "locations"
    }
  }

  stack {
    db.query locations {
      where = $db.locations.id == $input.locations_id
      return = {type: "single"}
    }
  }
}