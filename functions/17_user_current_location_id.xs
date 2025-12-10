function user_current_location_id {
  input {
    uuid? user_id?
  }

  stack {
    db.get user {
      field_name = "id"
      field_value = $input.user_id
      output = ["current_location_id"]
    } as $location_id
  }

  response = $location_id.current_location_id
}