addon inspection_time_slot {
  input {
    uuid inspection_time_slots_id? {
      table = "inspection_time_slots"
    }
  }

  stack {
    db.query inspection_time_slots {
      where = $db.inspection_time_slots.id == $input.inspection_time_slots_id
      return = {type: "single"}
    }
  }
}