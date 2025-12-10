// Get inspections record
query "inspections/{inspections_id}" verb=GET {
  auth = "user"

  input {
    uuid inspection_id?
  }

  stack {
    !var $response {
      value = ""
    }
  
    db.get inspections {
      field_name = "id"
      field_value = $input.inspection_id
      addon = [
        {
          name : "user"
          input: {user_id: $output.inspector_id}
          as   : "user"
        }
        {
          name : "inspection_type"
          input: {inspection_types_id: $output.inspection_type_id}
          as   : "inspection_type"
        }
        {
          name : "property"
          input: {properties_id: $output.property_id}
          as   : "property"
        }
      ]
    } as $inspection
  
    db.query inspection_bookings {
      where = $db.inspection_bookings.inspection_id == $input.inspection_id && $db.inspection_bookings.booking_status != "rescheduled"
      sort = {inspection_bookings.created_at: "desc"}
      return = {type: "single"}
    } as $inspection_bookings
  }

  response = {
    inspection         : $inspection
    inspection_bookings: $inspection_bookings
  }
}