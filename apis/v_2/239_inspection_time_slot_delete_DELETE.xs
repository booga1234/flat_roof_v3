query "inspection-time-slot-delete" verb=DELETE {
  auth = "user"

  input {
    uuid id
  }

  stack {
    db.get inspection_time_slots {
      field_name = "id"
      field_value = $input.id
    } as $slot
  
    precondition ($slot != null) {
      error_type = "notfound"
      error = "Time slot not found"
    }
  
    db.del inspection_time_slots {
      field_name = "id"
      field_value = $input.id
    }
  }

  response = {
    success: true
    message: "Time slot deleted successfully"
  }
}