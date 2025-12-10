addon inspection_booking_from_inspection {
  input {
    uuid? inspection_id?
  }

  stack {
    db.query inspection_bookings {
      where = $db.inspection_bookings.inspection_id == $input.inspection_id
      sort = {inspection_bookings.created_at: "desc"}
      return = {type: "single"}
    }
  }
}