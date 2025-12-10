query "inspection-time-slot-patch" verb=PATCH {
  auth = "user"

  input {
    uuid id
    json data
  }

  stack {
    db.patch inspection_time_slots {
      field_name = "id"
      field_value = $input.id
      data = $input.data|set:"updated_at":now
    } as $updated_slot
  }

  response = $updated_slot
}