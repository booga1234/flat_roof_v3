query "inspection-bookings" verb=GET {
  auth = "user"

  input {
  }

  stack {
    db.query inspection_bookings {
      sort = {inspection_bookings.booked_at: "desc"}
      return = {type: "list"}
      output = [
        "id"
        "inspection_id"
        "time_slot_id"
        "booking_status"
        "booked_at"
        "booked_by_id"
        "cancellation_reason"
        "cancelled_at"
        "rescheduled_from_booking_id"
        "notes"
        "created_at"
        "updated_at"
      ]
    } as $bookings
  }

  response = {bookings: $bookings}
}