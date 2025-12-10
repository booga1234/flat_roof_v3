query inspection_cancel verb=POST {
  auth = "user"

  input {
    text inspection_id? filters=trim
    text inspection_booking_id? filters=trim
    text cancellation_reason? filters=trim
  }

  stack {
    db.edit inspection_bookings {
      field_name = "id"
      field_value = $input.inspection_booking_id
      data = {
        booking_status     : "cancelled"
        cancelled_at       : now
        cancellation_reason: $input.cancellation_reason
      }
    } as $inspection_bookings1
  
    db.edit inspections {
      field_name = "id"
      field_value = $input.inspection_id
      data = {status: "cancelled"}
    } as $inspections1
  }

  response = $inspection_bookings1
}