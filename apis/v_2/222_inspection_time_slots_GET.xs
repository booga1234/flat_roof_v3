// Get all inspection time slots
query "inspection-time-slots" verb=GET {
  auth = "user"

  input {
  }

  stack {
    db.query inspection_time_slots {
      sort = {inspection_time_slots.created_at: "desc"}
      return = {type: "list"}
    } as $time_slots
  }

  response = $time_slots
}