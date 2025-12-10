addon location_of_job {
  input {
    uuid location_id? {
      table = ""
    }
  }

  stack {
    db.query "" {
      where = $db.location.id == $input.location_id
      return = {type: "single"}
    }
  }
}